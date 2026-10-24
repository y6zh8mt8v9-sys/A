#!/usr/bin/env node
// Scripted Game Day tests. Build first (python3 tools/build.py --engine), serve app/ (python3 -m http.server 8795 in app/), then:
//   node tools/gd_tests.js [port] [screenshot dir]     (GD_ONLY=regex runs only the matching tests)
// Each test loads app/gd_test.html fresh, sets up a situation through the engine's own functions and checks the result.
const PW=(()=>{try{return require('playwright');}catch(e){return require('/opt/node22/lib/node_modules/playwright');}})();
const PORT=process.argv[2]||8795,SHOTS=process.argv[3]||null,URL=`http://localhost:${PORT}/gd_test.html`;
const T=[];const test=(name,fn,opt)=>T.push({name,fn,opt:opt||{}});

// a fresh engine page, coin toss skipped, both teams on the computer unless a test says otherwise
async function fresh(ctx,opt){
  let p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(String(e&&e.message||e)));
  if(opt&&opt.init)await p.addInitScript(opt.init);
  await p.goto(opt&&opt.url||URL);let f=p;if(opt&&opt.url){await p.waitForSelector('iframe');f=p.frames()[1];f.errs=p.errs;}else{const pg=p;p.page=()=>pg;}
  await f.waitForFunction(()=>window.__G&&window.__G.phase==='modal',null,{timeout:20000});p=f;
  await p.evaluate(()=>{hide('modal');G.ai=[true,true];G.q=1;G.clock=QLEN;G.score=[0,0];G.conv=null;G.next='scrimmage';G.phase='dead';G.after=null;});
  return p;
}
const ok=(c,m)=>{if(!c)throw new Error(m);};
const shot=async(p,n)=>{if(!SHOTS)return;const f=require('path').join(SHOTS,n+'.png');await p.page().screenshot({path:f});console.log('    screenshot',f);};
const PAD=`window.__pad={b:Array(17).fill(0),a:[0,0,0,0]};Object.defineProperty(Navigator.prototype,'getGamepads',{configurable:true,value:()=>[{id:'Xbox Wireless Controller (STANDARD GAMEPAD)',index:0,connected:true,mapping:'standard',buttons:__pad.b.map(v=>({pressed:v>0.5,value:v})),axes:__pad.a.slice()}]});`;
// a live pass play for the user's team, the QB set up in the pocket and the receivers out on their routes
const PASS_LIVE=`G.test=false;G.ai=[false,true];G.los=30;G.down=1;G.toGo=10;G.poss=G.offTeam=0;applyCall({kind:'pass',data:PASSES[0]},DCALLS[11]);G.phase='presnap';
  doSnap();for(let i=0;i<200&&!(G.ballState==='qb'&&G.t>1.4)&&G.phase==='live';i++){G.snapIn=99;step(1/30);}`;

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
        if(G.phase==='presnap'&&G.meter)meterTap();else if(G.phase==='presnap'&&G.play&&G.play.kind==='scrimmage'&&G.offTeam===G.me&&!G.simming&&G.snapIn<2)doSnap();else if(G.phase==='presnap')G.snapIn-=1/30;
        if(passingUser()&&G.t>1.2)gpKeyThrow(0);
        if(G.phase==='call'&&!$('call').hidden){const c=$('cCards').querySelector('.pcard');if(c)c.click();}
        G.noDraw=true;step(1/30);if(i%20000===0)await new Promise(r=>setTimeout(r,0));}
      if(G.phase==='over')games++;else bad.push('stuck '+[G.phase,G.q,G.clock|0,G.simming,G.offTeam,G.ballState].join());}
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

/* 5. button throws lead the receiver; hold RT (or Shift) for a lead pass */
test('controller throw leads the receiver; RT + button and Shift + number throw a lead pass',async p=>{
  const r=await p.evaluate('(()=>{'+PASS_LIVE+`
    const q=G.qb,r=gpThrowTargets()[0],sp=Math.hypot(r.vx,r.vy),ux=r.vx/sp,uy=r.vy/sp,D0=dist(q,r),lb=G.lob&&D0>=8,bul=G.bullet||D0<12&&!lb,f=flight(D0,bul,lb);
    const along=pt=>(pt[0]-r.x)*ux+(pt[1]-r.y)*uy,old=along([r.x+r.vx*f.T,r.y+r.vy*f.T]),now=along(gpLeadPt(q,r,bul,lb,false)),lead=along(gpLeadPt(q,r,bul,lb,true));
    padGameStep();__pad.b[7]=1;padGameStep();const leg=$('ctl').textContent;drawScene(frameData(false));G.paused=true;
    return{sp,old,now,lead,leg,live:G.phase,pass:passingUser()};})()`);
  ok(r.pass,'not a live pass: '+JSON.stringify(r));ok(r.now>=r.old+0.8,`not leading: old ${r.old.toFixed(1)} new ${r.now.toFixed(1)} yds ahead`);ok(r.lead>=r.now+1.5,'lead pass not out in front: '+r.lead.toFixed(1));
  ok(/lead pass/i.test(r.leg),'no lead pass prompt: '+r.leg);await shot(p,'lead-pass-prompt');
  const t=await p.evaluate(()=>{G.paused=false;__pad.b[0]=1;padGameStep();return{lead:!!G.leadThrow,thrown:!!G.pendThrow};});ok(t.lead&&t.thrown,'RT + A did not throw a lead pass '+JSON.stringify(t));
  const k=await p.evaluate('(()=>{'+PASS_LIVE+`G.leadThrow=null;dispatchEvent(new KeyboardEvent('keydown',{key:'@',code:'Digit2',shiftKey:true}));return{lead:!!G.leadThrow,thrown:!!G.pendThrow};})()`);
  ok(k.lead&&k.thrown,'Shift + 2 did not throw a lead pass '+JSON.stringify(k));},{init:PAD});

/* 6. a custom QB option play can be built, saved and run */
test('play designer: a QB option run saves as an option and plays as one',async p=>{
  const pg=await p.page().context().newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto(`http://localhost:${PORT}/index.html`);await pg.waitForFunction(()=>typeof pbFromRun==='function',null,{timeout:30000});
  const d=await pg.evaluate(()=>{window.pbRerender=()=>{};window._pbD=null;pbFromRun('Read Option');const D=pbDraftInit();D.n='My Zone Read';
    const svg=pbSVG(D,{edit:true,w:420});for(const[i,v]of[['pb-n','My Zone Read'],['pb-d','']]){const e=document.createElement('input');e.id=i;e.value=v;document.body.appendChild(e);}
    D.keep=[[-6,-0.4],[-8,5]];pbSavePlay();const c=pbData().plays.slice(-1)[0];return{car:D.carrier,keepPts:(svg.match(/data-q=/g)||[]).length,saved:c,res:pbResolveRun('C:'+c.id)};});
  await pg.close();ok(!errs.length,'app errors '+errs.join('|'));ok(d.car==='OPT'&&d.keepPts>=2,'designer lost the option: '+JSON.stringify(d).slice(0,200));
  ok(d.res&&d.res.option&&d.res.keep&&!d.res.qb,'saved play is not an option: '+JSON.stringify(d.res));
  const r=await p.evaluate(play=>{G.ai=[true,true];G.los=40;G.down=1;G.toGo=10;G.poss=G.offTeam=0;applyCall({kind:'run',data:play},DCALLS[8]);G.phase='presnap';doSnap();
    const R=Math.random;Math.random=()=>0.5;let out=null;try{for(let i=0;i<60&&G.phase==='live';i++){const de=G.ents.find(e=>e.slot==='DE2');if(de){de.x=CX+2;de.hx=de.x;}step(1/30);if(G.carrier&&!out)out={qb:G.carrier===G.qb,end:G.qb.path?G.qb.path.slice(-1)[0][0]-CX:null};}}finally{Math.random=R;}return out;},d.res);
  ok(r&&r.qb&&Math.abs(r.end+8)<0.01,'QB did not keep it on the custom path: '+JSON.stringify(r));});

/* 7. the move wheel mirrors with the drive direction */
test('skill-move wheel mirrors when the ball carrier runs right to left',async p=>{
  const r=await p.evaluate(()=>{GDS.moveUI='wheel';G.ai=[false,true];G.poss=G.offTeam=0;applyCall({kind:'run',data:RUNS[0]},DCALLS[3]);G.phase='live';G.ballState='carrier';G.carrier=G.rb;
    const side=()=>{setCtl();const w=$('ctl').querySelector('.mwheel'),b=w.getBoundingClientRect(),d=w.querySelector('[data-i="5"]').getBoundingClientRect();return Math.sign(d.left+d.width/2-(b.left+b.width/2));};
    G.flip=false;const right=side();G.flip=true;const left=side();return{right,left};});
  ok(r.right===-r.left&&r.left!==0,'wheel did not mirror: '+JSON.stringify(r));});

/* 8. replay free cam */
test('replay free cam: scroll zooms, keys pan, reset follows the ball again',async p=>{
  const r=await p.evaluate(async()=>{G.los=40;G.poss=G.offTeam=0;applyCall({kind:'run',data:RUNS[1]},DCALLS[3]);G.phase='presnap';doSnap();for(let i=0;i<400&&G.phase==='live';i++)step(1/30);
    for(let i=0;i<60;i++)step(1/30);G.after=null;startReplay();const P=G.replay;
    cv.dispatchEvent(new WheelEvent('wheel',{deltaY:-500,bubbles:true,cancelable:true}));const y0=P.fc&&P.fc.y;
    dispatchEvent(new KeyboardEvent('keydown',{key:'d'}));for(let i=0;i<20;i++)step(1/30);dispatchEvent(new KeyboardEvent('keyup',{key:'d'}));
    return{z:P.fc&&P.fc.z,dy:P.fc?P.fc.y-y0:0,cam:G.camY-P.fc.y,btn:$('rCam').textContent};});
  ok(r.z>1.5&&r.dy>2&&Math.abs(r.cam)<0.01&&r.btn==='Reset camera','free cam: '+JSON.stringify(r));
  await p.waitForTimeout(300);await shot(p,'replay-free-cam');
  const b=await p.evaluate(()=>{$('rCam').click();return{fc:!!G.replay.fc,btn:$('rCam').textContent};});ok(!b.fc&&b.btn==='Free cam','reset: '+JSON.stringify(b));});

/* 9. touchdown card */
test('touchdown card: face, name, number, position and his game line, no taps blocked',async p=>{
  const r=await p.evaluate(async()=>{G.los=60;G.poss=G.offTeam=0;applyCall({kind:'run',data:RUNS[0]},DCALLS[3]);G.phase='live';G.ballState='carrier';G.carrier=G.rb;G.rb.y=110.5;
    const pl=G.rb.pl;G.gs={[pl.id]:{rushAtt:6,rushYds:41}};endPlay({type:'td'});await new Promise(r=>setTimeout(r,1300));const el=$('tdCard');
    return{vis:!!el&&!el.hidden&&getComputedStyle(el).opacity>0.5,txt:el&&el.textContent,pe:el&&getComputedStyle(el).pointerEvents,face:!!(el&&el.querySelector('.tf svg')),real:!!(el&&/fc\d/.test(el.innerHTML)),name:`#${pl.num} ${pl.first} ${pl.last}`};});
  ok(r.vis,'card not shown');ok(r.txt.includes(r.name)&&/RB/.test(r.txt)&&/7 car, \d+ yds, 1 TD/.test(r.txt),'card text: '+r.txt);ok(r.pe==='none'&&r.face&&r.real,'card: '+JSON.stringify(r));
  await shot(p,'touchdown-card');},{url:'http://localhost:8797/wrap.html'});
test('touchdown card respects reduced motion and goes away by itself',async p=>{
  const r=await p.evaluate(async()=>{G.poss=G.offTeam=0;applyCall({kind:'run',data:RUNS[0]},DCALLS[3]);G.phase='live';G.ballState='carrier';G.carrier=G.rb;endPlay({type:'td'});
    await new Promise(r=>setTimeout(r,1000));const a=getComputedStyle($('tdCard')).animationName;await new Promise(r=>setTimeout(r,4700));return{a,gone:$('tdCard').hidden};});
  ok(r.a==='tdFade'&&r.gone,JSON.stringify(r));},{reduce:true});

(async()=>{
  const B=await PW.chromium.launch();let fail=0;
  const ONLY=process.env.GD_ONLY?new RegExp(process.env.GD_ONLY,'i'):null;
  for(const t of T){if(ONLY&&!ONLY.test(t.name))continue;const ctx=await B.newContext({viewport:{width:1280,height:720},reducedMotion:t.opt.reduce?'reduce':'no-preference'});const p=await fresh(ctx,t.opt);
    const t0=Date.now();try{await Promise.race([t.fn(p,ctx),new Promise((_,j)=>setTimeout(()=>j(new Error('timeout')),t.opt.timeout||60000))]);
      if(p.errs.length)throw new Error('page errors: '+p.errs.slice(0,3).join(' | '));console.log('PASS',t.name,`(${Date.now()-t0} ms)`);}
    catch(e){fail++;console.log('FAIL',t.name,'\n    ',e.message);}
    await ctx.close();}
  await B.close();console.log(fail?`${fail} of ${T.length} failed`:`all ${T.length} passed`);process.exit(fail?1:0);
})();
module.exports={test,fresh,ok};
