#!/usr/bin/env node
// Scripted Game Day tests. Build first (python3 tools/build.py --engine), serve app/ (python3 -m http.server 8795 in app/), then:
//   node tools/gd_tests.js [port] [screenshot dir]     (GD_ONLY=regex runs only the matching tests)
// Each test loads app/gd_test.html fresh, sets up a situation through the engine's own functions and checks the result.
const PW=(()=>{try{return require('playwright');}catch(e){return require('/opt/node22/lib/node_modules/playwright');}})();
const PORT=process.argv[2]||8795,SHOTS=process.argv[3]||null,URL=`http://localhost:${PORT}/gd_test.html`;
const T=[];const test=(name,fn,opt)=>T.push({name,fn,opt:opt||{}});

// a fresh engine page, coin toss skipped, both teams on the computer unless a test says otherwise
async function fresh(ctx,opt){
  const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(String(e&&e.message||e)));
  if(opt&&opt.init)await p.addInitScript(opt.init);
  await p.goto(URL);await p.waitForFunction(()=>window.__G&&window.__G.phase==='modal',null,{timeout:20000});
  await p.evaluate(()=>{hide('modal');G.ai=[true,true];G.q=1;G.clock=QLEN;G.score=[0,0];G.conv=null;G.next='scrimmage';G.phase='dead';G.after=null;});
  return p;
}
const ok=(c,m)=>{if(!c)throw new Error(m);};

/* 1. personal fouls: 15 yards on top of the run, automatic first down */
test('facemask on a 12-yard run: 15 more from the end of the run, 1st down',async p=>{
  const r=await p.evaluate(()=>{G.los=30;G.down=2;G.toGo=8;G.poss=G.offTeam=0;applyCall({kind:'run',data:RUNS[0]},DCALLS[3]);
    G.phase='live';G.ballState='carrier';G.carrier=G.rb;G.rb.y=G.linesW.los+12;G.fouls=[{team:1,kind:'Facemask',yds:15,afd:true,endSpot:true}];
    endPlay({type:'tackle',spot:G.linesW.los+12});return{los:G.los,down:G.down,toGo:G.toGo,msg:G.result&&G.result.S&&G.result.S.msg,poss:G.poss};});
  ok(r.los>=57&&r.los<=58,'spot '+r.los);ok(r.down===1&&r.toGo===10&&r.poss===0,JSON.stringify(r));});
test('roughing the passer on a 20-yard catch: 15 on top of the catch and run',async p=>{
  const r=await p.evaluate(()=>{G.los=30;G.down=3;G.toGo=9;G.poss=G.offTeam=0;applyCall({kind:'pass',data:PASSES[1]},DCALLS[3]);
    G.phase='live';G.ballState='carrier';G.carrier=G.X;G.fouls=[{team:1,kind:'Roughing the passer',yds:15,afd:true}];
    endPlay({type:'tackle',spot:G.linesW.los+20});return{los:G.los,down:G.down};});
  ok(r.los>=65&&r.los<=66,'spot '+r.los+' (old code: 45, from the line)');ok(r.down===1,'down '+r.down);});
test('late hit out of bounds is called and marked off from the end of the play',async p=>{
  const r=await p.evaluate(()=>{G.test=false;G.los=40;G.down=1;G.toGo=10;G.poss=G.offTeam=0;applyCall({kind:'run',data:RUNS[1]},DCALLS[3]);
    G.phase='live';G.ballState='carrier';G.carrier=G.rb;G.rb.x=0.1;const R=Math.random;Math.random=()=>0.0005;
    try{endPlay({type:'oob',spot:G.linesW.los+6});}finally{Math.random=R;}return{los:G.los,down:G.down,msg:$('t1').textContent,phase:G.phase};});
  ok(/late hit/i.test(r.msg),'no late hit on an out-of-bounds play: '+r.msg);ok(r.los>=61&&r.los<=62&&r.down===1,JSON.stringify(r));});
test('facemask by the old offense on an interception return goes to the returning team',async p=>{
  const r=await p.evaluate(()=>{G.los=30;G.down=1;G.toGo=10;G.poss=G.offTeam=0;applyCall({kind:'pass',data:PASSES[1]},DCALLS[3]);
    const d=G.ents.find(e=>e.side==='d'&&e.role==='CB');G.phase='live';G.ballState='carrier';G.carrier=d;G.picker=d;G.turnover=true;
    G.fouls=[{team:0,kind:'Facemask',yds:15,afd:false,endSpot:true}];endPlay({type:'tackle',spot:G.linesW.los+25});return{poss:G.poss,los:G.los,down:G.down};});
  ok(r.poss===1,'ball went back to the team that threw the pick: poss '+r.poss);ok(r.los>=59&&r.los<=61&&r.down===1,JSON.stringify(r));});
test('personal foul on a touchdown: the score stands, 15 yards on the kickoff',async p=>{
  const r=await p.evaluate(()=>{G.los=80;G.down=1;G.toGo=10;G.poss=G.offTeam=0;applyCall({kind:'run',data:RUNS[0]},DCALLS[3]);
    G.phase='live';G.ballState='carrier';G.carrier=G.rb;G.fouls=[{team:1,kind:'Facemask',yds:15,afd:true,endSpot:true}];endPlay({type:'td'});
    const s=[...G.score];G.next='kickoff';G.kickTeam=0;G.kickSpot=35;G.conv=null;nextSnap();return{s,spot:G.play&&G.play.spot,kind:G.play&&G.play.kind};});
  ok(r.s[0]===6,'touchdown lost: '+r.s);ok(r.kind==='kickoff'&&r.spot===50,'kickoff from '+r.spot);});

/* 2. offense-only games never put you on defense */
test('offense only: the other team keeping the ball after halftime is simulated',async p=>{
  const r=await p.evaluate(()=>{G.test=false;G.ai=[false,true];G.playMode='off';let def=0;const sc=showCall;window.showCall=(m,cb)=>{if(m==='def')def++;return sc(m,cb);};
    G.q=3;G.clock=QLEN;G.poss=1;G.drivePoss=1;G.next='scrimmage';nextSnap();const s=G.simming;window.showCall=sc;return{sim:s,def,phase:G.phase};});
  ok(r.sim&&!r.def,'put on defense: '+JSON.stringify(r));});
test('offense only: their two-point try after a pick six is simulated',async p=>{
  const r=await p.evaluate(()=>{G.test=false;G.ai=[false,true];G.playMode='off';G.drivePoss=0;G.poss=0;G.next='conv';G.conv={team:1,force2:true};nextSnap();
    return{sim:G.simming,uctl:!!G.uctl,phase:G.phase};});
  ok(r.sim&&!r.uctl,'defending the try: '+JSON.stringify(r));});
test('offense only: three full games, never on defense',async p=>{
  const r=await p.evaluate(async()=>{G.test=false;let bad=[],games=0;
    const tp=toPresnap;window.toPresnap=function(){if(G.play&&G.play.kind==='scrimmage'&&G.offTeam!==G.me&&!G.simming&&!G.simQtr&&!G.gpFast)bad.push(`q${G.q} ${G.clock|0} conv:${!!G.conv}`);return tp.apply(this,arguments);};
    const sc=showCall;window.showCall=(m,cb)=>{if(m==='def'&&!G.simming)bad.push('def call q'+G.q);return sc(m,cb);};
    for(let g=0;g<3;g++){newGame();G.playMode='off';G.ai=[false,true];
      for(let i=0;i<400000&&G.phase!=='over';i++){
        if(!$('modal').hidden){const bs=[...$('mB').querySelectorAll('button')],b=bs.find(x=>/Sim drive|Kick deep|Heads|Receive|Start/.test(x.textContent))||bs[0];b.click();}
        if(!$('simBox').hidden&&!$('simGo').hidden)$('simGo').click();
        if(G.phase==='presnap'&&G.meter)meterTap();
        if(G.phase==='call'&&!$('call').hidden){const c=$('cCards').querySelector('.pcard');if(c)c.click();}
        G.noDraw=true;step(1/30);if(i%20000===0)await new Promise(r=>setTimeout(r,0));}
      if(G.phase==='over')games++;}
    window.toPresnap=tp;window.showCall=sc;return{bad:bad.slice(0,5),n:bad.length,games};});
  ok(r.games===3,'games finished: '+r.games);ok(!r.n,'on defense: '+JSON.stringify(r.bad));},{timeout:600000});

/* 3. switch ends each quarter: punts and kicks fly the way the team was driving */
test('switch each quarter: punts go toward the end the punting team was attacking',async p=>{
  const r=await p.evaluate(()=>{GDS.dir='real';const out=[];
    for(const q of[1,2,3,4,5])for(const t of[0,1]){G.q=q;const offDir=gpFlipFor(t)?-1:1;G.los=40;setupPunt(t,40);const kickDir=(G.flip?-1:1)*-1;
      // the other team attacks the opposite way in the same quarter
      const oppDir=gpFlipFor(1-t)?-1:1;if(kickDir!==offDir||oppDir===offDir)out.push({q,t,offDir,kickDir,oppDir});}
    // and a real punt in the air
    G.q=2;G.poss=G.offTeam=0;G.los=35;setupPunt(0,35);toPresnap();G.phase='presnap';doSnap();let a=null,b=null;
    for(let i=0;i<400&&G.phase==='live';i++){step(1/30);if(G.kick&&G.kick.cur){const w=toW(G.kick.cur.x,G.kick.cur.y)[1];if(a==null)a=w;b=w;}}
    const want=gpFlipFor(0)?-1:1;return{out,flew:Math.sign(b-a),want};});
  ok(!r.out.length,'wrong way: '+JSON.stringify(r.out));ok(r.flew===r.want,'the punt flew '+r.flew+' on screen, the offense drives '+r.want);});

/* 4. kneel downs */
test('kneel: one yard lost, clock runs, no routes, no flags or scuffles, counted as a run',async p=>{
  const r=await p.evaluate(()=>{G.test=false;G.q=4;G.clock=70;G.clockRun=true;G.score=[14,7];G.los=50;G.down=1;G.toGo=10;G.poss=G.offTeam=0;
    applyCall({kind:'kneel'},DCALLS[3]);const recv=G.recv.length,qbD=G.linesW.los-G.qb.y,c0=G.clock;doSnap();const R=Math.random;Math.random=()=>0.0005;
    try{for(let i=0;i<120&&G.phase==='live';i++)step(1/30);}finally{Math.random=R;}
    return{recv,qbD,msg:G.result.S.msg,los:G.los,down:G.down,toGo:G.toGo,fouls:G.fouls.length,fight:!!G.fight,run:G.clockRun,used:c0-G.clock,pass:G.stats[0].pass,rush:G.stats[0].rush};});
  ok(r.recv===0&&r.qbD<1.5,'routes or shotgun on a kneel: '+JSON.stringify(r));ok(r.msg==='Kneel down'&&r.los===49&&r.down===2&&r.toGo===11,JSON.stringify(r));
  ok(!r.fouls&&!r.fight,'flag or scuffle on a kneel');ok(r.run&&r.used>0.9,'clock');ok(r.pass===0&&r.rush===-1,'stats '+r.pass+'/'+r.rush);});
test('kneel: the computer only kneels when it runs the clock out',async p=>{
  const r=await p.evaluate(()=>{const c=(q,d,clock,to,los)=>{G.q=q;G.down=d;G.toGo=10;G.clock=clock;G.clockRun=true;G.los=los||50;G.offTeam=G.poss=1;G.score=[7,14];G.to=[to,3];G.conv=null;G.ot=null;return aiOffCall().kind;};
    return{fourth30:c(4,4,30,0),first60:c(4,1,60,0),first60to:c(4,1,60,3),own1:c(4,1,20,0,1),last2:c(4,4,2,0)};});
  ok(r.fourth30!=='kneel','kneels on 4th down with 30 seconds left');ok(r.first60==='kneel','no victory formation at 1:00 on 1st down');
  ok(r.first60to!=='kneel','kneels into three timeouts');ok(r.own1!=='kneel','kneels for a safety');ok(r.last2==='kneel','no kneel with 2 seconds left');});
test('kneel on a kick return out of the end zone: down at the spot, not a touchback',async p=>{
  const r=await p.evaluate(()=>{G.test=false;G.ai=[false,true];G.kickTeam=1;setupKickoff(1,35);G.phase='live';const k=G.play.rets[0];G.carrier=k;G.ballState='carrier';k.y=17;G.kneelOK=1;
    olKneel();return{phase:G.phase,msg:G.result&&G.result.S.msg,los:G.los};});
  ok(r.msg!=='Touchback'&&r.los>=6&&r.los<=8,JSON.stringify(r));});

(async()=>{
  const B=await PW.chromium.launch();let fail=0;
  const ONLY=process.env.GD_ONLY?new RegExp(process.env.GD_ONLY,'i'):null;
  for(const t of T){if(ONLY&&!ONLY.test(t.name))continue;const ctx=await B.newContext({viewport:{width:1280,height:720}});const p=await fresh(ctx,t.opt);
    const t0=Date.now();try{await Promise.race([t.fn(p,ctx),new Promise((_,j)=>setTimeout(()=>j(new Error('timeout')),t.opt.timeout||60000))]);
      if(p.errs.length)throw new Error('page errors: '+p.errs.slice(0,3).join(' | '));console.log('PASS',t.name,`(${Date.now()-t0} ms)`);}
    catch(e){fail++;console.log('FAIL',t.name,'\n    ',e.message);}
    await ctx.close();}
  await B.close();console.log(fail?`${fail} of ${T.length} failed`:`all ${T.length} passed`);process.exit(fail?1:0);
})();
module.exports={test,fresh,ok};
