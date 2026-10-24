/* ===================== v2.00 GAMEPLAY TUTORIAL: an interactive walkthrough on the practice field ===================== */
// Runs as a practice session (GP.practice.mode==='tut'): a pass rep, a run rep, a defensive rep and a field goal.
// A coach card in the corner explains each control and waits until you have actually done it.
const TUT={st:null,did:{pass:false,run:false},kind:null,box:null,iv:null,last:'',n:0};
function tutOn(){return!!(GP&&GP.practice&&GP.practice.mode==='tut');}
function tutBox(){
  if(TUT.box)return TUT.box;
  const b=document.createElement('div');b.id='tutBox';
  b.style.cssText='position:fixed;right:max(8px,env(safe-area-inset-right));top:max(52px,calc(env(safe-area-inset-top) + 48px));z-index:200;width:min(340px,46vw);max-height:62vh;overflow-y:auto;border-radius:16px;padding:12px 14px;'+
    'background:linear-gradient(180deg,rgba(255,255,255,.2),rgba(255,255,255,.05)),rgba(8,30,52,.94);border:1px solid rgba(255,255,255,.35);box-shadow:0 14px 40px rgba(0,0,0,.45);color:#fff;font:600 13px/1.4 Nunito,system-ui,sans-serif';
  document.body.appendChild(b);TUT.box=b;return b;
}
// steps: [title, html, needs a button?]
const TUT_STEPS=7;
function tutShow(no,title,html,btn){
  const k=no+'|'+title+'|'+html;if(TUT.last===k)return;TUT.last=k;
  const b=tutBox();
  b.innerHTML=`<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="font:900 11px Nunito,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#7fd3ff">Coach · step ${no} of ${TUT_STEPS}<\/span>
    <button id="tutSkip" style="margin-left:auto;background:none;border:1px solid rgba(255,255,255,.4);color:#fff;border-radius:8px;font:800 11px Nunito,sans-serif;padding:3px 10px;cursor:pointer">Skip tutorial<\/button><\/div>
    <div style="font:900 16px Nunito,sans-serif;margin-bottom:4px">${title}<\/div><div>${html}<\/div>
    ${btn?`<div style="text-align:right;margin-top:10px"><button id="tutGo" style="min-height:38px;padding:0 20px;border-radius:8px;border:1px solid rgba(255,255,255,.5);font:900 14px Nunito,sans-serif;color:#fff;cursor:pointer;background:#2f66c0">${btn}<\/button><\/div>`:''}`;
  const sk=document.getElementById('tutSkip');if(sk)sk.onclick=e=>{e.stopPropagation();tutEnd(false);};
  const go=document.getElementById('tutGo');if(go)go.onclick=e=>{e.stopPropagation();tutNext();};
  b.onpointerdown=e=>e.stopPropagation();
}
function tutStart(){
  G.tutDone=false;TUT.st='intro';TUT.did={pass:false,run:false};
  tutShow(1,'Welcome to the practice field',`Before your first game, let's run through the controls with your own players. You play a <b>pass<\/b>, a <b>run<\/b>, a <b>defensive<\/b> snap and a <b>field goal<\/b>.<br><br>Your team is in white. Nothing here counts on your record, and your players still earn a little practice XP.`,"Let's go");
  clearInterval(TUT.iv);TUT.iv=setInterval(()=>{try{tutTick();}catch(e){console.error(e);}},150);
}
function tutNext(){
  if(TUT.st==='intro'){TUT.st='o_call';nextSnap();tutTick();return;}
  if(TUT.st==='fin'){tutEnd(true);return;}
}
function tutEnd(done){
  clearInterval(TUT.iv);TUT.iv=null;if(TUT.box){TUT.box.remove();TUT.box=null;}
  G.tutResult=done?'done':'skipped';G.pEnd=true;
  if(G.phase!=='over')gameOver();
}
function tutCallHint(){
  const need=!TUT.did.pass?'pass':!TUT.did.run?'run':null;
  return need==='pass'?`Pick a <b>pass play<\/b>: any card on the passing tab. Each card shows the routes.`:`Now pick a <b>run play<\/b> from the <b>Runs<\/b> tab.`;
}
function tutTick(){
  if(!tutOn()||G.phase==='over')return;
  const P=G.play,ph=G.phase,st=TUT.st;
  const step=TUT.did.pass&&TUT.did.run?3:TUT.did.pass||TUT.did.run?2:1;
  if(st==='o_call'){
    if(ph==='presnap'&&P&&P.kind==='scrimmage'){TUT.kind=P.off.kind;TUT.st='o_pre';}
    else{if(ph==='call'||TUT.st==='o_call'&&!TUT.did.pass&&!TUT.did.run)tutShow(step+1,'Call a play',tutCallHint()+`<br><br>The call sheet opens before every snap. Your playbook follows the scheme you picked in the Staff tab.`);return;}
  }
  if(TUT.st==='o_pre'){
    if(ph==='live'){TUT.st=TUT.kind==='pass'?'o_throw':'o_run';}
    else{tutShow(step+1,'Before the snap',`Routes and player names are drawn on the field.${TUT.kind==='pass'?' Tap a receiver to change his route (an audible).':''}<br><br>Tap <b>Snap<\/b> (or press Enter) when you are ready.`);return;}
  }
  if(TUT.st==='o_throw'){
    if(G.ballState==='air'){TUT.st='o_air';}
    else if(G.ballState==='carrier'&&G.carrier){TUT.st='o_carry';}
    else if(ph==='dead'){TUT.st='o_done';}
    else{tutShow(step+1,'Throw the ball',`Press anywhere on the field and <b>pull back like a slingshot<\/b>: the arrow shows where the ball goes. <b>Let go<\/b> to throw.<br><br>A quick tap on the screen (or Space) switches between a hard <b>bullet<\/b> and a high <b>lob<\/b>; every play starts with a bullet. <b>QB run<\/b> (or pulling back toward the quarterback) tucks the ball and runs.`);return;}
  }
  if(TUT.st==='o_air'){
    if(G.ballState==='carrier'&&G.carrier&&G.carrier.team===0){TUT.st='o_carry';}
    else if(ph==='dead'){TUT.st='o_done';}
    else{tutShow(step+1,'Make the catch',G.cm?`A <b>catch meter<\/b> is up: tap the screen (or Space) when the marker is in the <b>green<\/b>. Hard catches have a small green zone.`:`The ball is in the air. When a meter appears over your receiver, tap the screen while the marker is in the green.`);return;}
  }
  if(TUT.st==='o_run'||TUT.st==='o_carry'){
    if(ph==='dead'){TUT.st='o_done';}
    else{tutShow(step+1,TUT.st==='o_run'?'Carry the ball':'Run after the catch',`Your ball carrier follows his blockers on his own, or steer him with the arrow keys or the left stick (full speed in every direction). You make the moves:<br>• <b>Swipe up or down<\/b>: juke (W, S, or flick the right stick)<br>• <b>Swipe forward<\/b>: dive for extra yards<br>• <b>Swipe back<\/b>: slow down and let blocks set up<br>• Buttons: <b>Spin<\/b>, <b>Stiff arm<\/b>, <b>Truck<\/b> (runs through tacklers), <b>Hurdle<\/b> (beats low tackles)`);return;}
  }
  if(TUT.st==='o_done'){
    TUT.did[TUT.kind==='run'?'run':'pass']=true;
    const S=G.result&&G.result.S,msg=S?`${S.msg}${S.sub?' · '+S.sub:''}`:'Rep complete';
    if(TUT.did.pass&&TUT.did.run){
      // switch sides: the scout team gets the ball, you defend
      G.pOff=1;G.poss=1;G.drivePoss=1;G.los=35;G.down=1;G.toGo=10;G.next=null;G.conv=null;
      TUT.st='d_call';tutShow(4,'Nice rep: '+msg,`Now your defense takes the field. The scout team (black) has the ball.`);return;
    }
    TUT.st='o_call';tutShow(step+1,'Rep done: '+msg,TUT.did.pass?`Next: a run play.`:`Next: a pass play.`);return;
  }
  if(st==='d_call'){
    if(ph==='presnap'&&P&&P.kind==='scrimmage'&&G.offTeam===1){TUT.st='d_pre';}
    else{if(ph==='call')tutShow(4,'Call your defense',`Pick a <b>coverage<\/b>. Zones protect against deep passes, blitzes bring extra rushers but leave receivers open.`);return;}
  }
  if(TUT.st==='d_pre'){
    if(ph==='live'){TUT.st='d_live';}
    else{tutShow(5,'Pick your defender',`You control the player with the marker under him (your middle linebacker). <b>Tap any linebacker or defensive back<\/b> to take control of him instead.<br><br>The offense snaps on its own.`);return;}
  }
  if(TUT.st==='d_live'){
    if(ph==='dead'){
      const S=G.result&&G.result.S,msg=S?`${S.msg}${S.sub?' · '+S.sub:''}`:'Rep complete';
      G.pOff=0;G.poss=0;G.drivePoss=0;G.los=75;G.down=4;G.toGo=6;G.next=null;G.conv=null;
      TUT.st='k_call';tutShow(6,'Defense done: '+msg,`Last one: your offense is on the 25 on 4th down.`);return;}
    tutShow(5,'Play defense',G.im&&G.ballState==='air'?`A <b>meter<\/b> is up over a defender: tap the screen in the <b>green<\/b> to break up the pass or pick it off.`:`<b>Press and drag<\/b> anywhere to move your player, like a joystick. Hold <b>Sprint<\/b> (Shift) to close in, then pick a tackle on the wheel: <b>Form tackle<\/b> (U) is the sure one, <b>Hit stick<\/b> (I) can knock the ball loose, <b>Ankle bite<\/b> (O) reaches farthest, <b>Tackle<\/b> (J) picks for you. <b>Switch<\/b> (Tab) jumps to the defender nearest the ball.`);return;
  }
  if(st==='k_call'){
    if(ph==='presnap'&&P&&(P.kind==='fg'||P.kind==='punt')){TUT.st='k_meter';}
    else if(ph==='dead'&&P&&P.kind==='scrimmage'&&TUT.kSnap){ // ran a play instead of kicking: back to the 25, 4th down
      TUT.kSnap=false;G.pOff=0;G.poss=0;G.drivePoss=0;G.los=75;G.down=4;G.toGo=6;G.next=null;G.conv=null;
      tutShow(6,'Let\'s try that kick',`Back on the 25. Open the <b>Special<\/b> tab and pick <b>Field goal<\/b>.`);return;}
    else{if(ph==='live')TUT.kSnap=true;if(ph==='call')tutShow(6,'Kick a field goal',`Open the <b>Special<\/b> tab on the call sheet and pick <b>Field goal<\/b>. Fourth-down choices (punt, field goal) all live there.`);return;}
  }
  if(TUT.st==='k_meter'){
    if(ph==='live'||ph==='dead'){TUT.st='k_wait';}
    else{tutShow(6,'Kick meter',`${P&&P.kind==='punt'?'A punt works too. ':''}Tap the field (or Space) to stop the <b>power<\/b> meter, then tap again to stop the <b>accuracy<\/b> meter. Both are best in the green. Field goals, punts and kickoffs all use the same meter.`);return;}
  }
  if(TUT.st==='k_wait'){
    if(ph!=='dead')return;
    const S=G.result&&G.result.S,msg=S?`${S.msg}${S.sub?' · '+S.sub:''}`:'Kick complete';
    TUT.st='fin';
    tutShow(7,'Tutorial complete: '+msg,`That covers the core of every game day:<br>• Call a play, snap, throw with the slingshot, and win catch meters<br>• Make moves with swipes and the move buttons<br>• Take control of a defender, drag to move, sprint and pick a tackle on the wheel<br>• Stop the kick meters in the green<br><br>In real games you can also <b>simulate a drive<\/b> when one comes up, use <b>timeouts<\/b> and <b>substitutions<\/b> from the call sheet, and open the <b>pause menu<\/b> any time. Good luck in week 1!`,'Finish');
    return;
  }
}

function gpHideDefense(){
  if(!(GP&&GP.practice&&GP.practice.mode==='air'))return;
  const los=G.linesW?G.linesW.los:60;
  for(const e of G.ents)if(e.side==='d'){e.x=-80;e.y=los+20;e.vx=0;e.vy=0;e.stun=1;}
}

function gpBadSnap(){
  const S=G.snapB;if(!S||G.conv||(G.play&&G.play.special))return;
  const C=G.ents.find(e=>e.slot==='C'&&e.side==='o'),co=C&&C.pl?(C.pl.ovr||60):60;
  const pr=clamp(0.026-(co-50)*0.0005,0.006,0.04);if(Math.random()>=pr)return;
  const q=G.qb;S.bad=Math.random()<0.55?'high':'low';
  if(S.bad==='high'){S.to=[q.x+rnd(-1.2,1.2),q.y-rnd(2,3.5)];S.T=0.42;}else{S.to=[q.x+rnd(-0.8,0.8),q.y+rnd(1.0,1.9)];S.T=0.3;}
}
function gpBadSnapLand(S){
  const hi=S.bad==='high';
  G.loose={x:S.to[0],y:S.to[1],h:hi?1.4:0.15,vx:rnd(-1,1),vy:hi?-rnd(1.5,3):rnd(-1.2,0.4),vh:hi?-1:1.1,kind:'snap',t:0.2};
  G.ballState='loose';G.prevCarrierSide='o';flash(hi?'High snap!':'Low snap!');setCtl();
}
function gpSnapRecovered(e){
  if(e.side==='d'){flash('Defense jumps on the bad snap!');G.cheer=1;return;}
  if(e!==G.qb){flash('Offense recovers the snap');return;}
  const arch=(e.pl&&e.pl.arch)||'',mobile=/Scrambler|Pure Runner|Tank/.test(arch),near=G.ents.some(d=>d.side==='d'&&!d.down&&!d.eng&&dist(d,e)<2.6);
  if(near&&!mobile){flash('QB falls on it!');endPlay({type:'tackle',spot:e.y});return;}
  if(mobile){flash(`${arch||'Mobile QB'} scoops it up and scrambles!`);return;}
  G.carrier=null;G.ballState='qb';flash('QB recovers it, still time to throw!');setCtl();
}
function gpKickSetup(){
  const P=G.play;if(!P)return;
  G.wind=(P.kind==='fg'||P.kind==='xp')?clamp(gpWind()[0]*0.0029+rnd(-1,1)*(0.006+WX.w*0.0006),-0.09,0.09):0;
  if(!G.meter)return;
  const D=P.kind==='fg'||P.kind==='xp'?Math.max(18,Math.round(100-G.los+17)):0;G.meter.D=D;
  if(D){const k=P.kicker&&P.kicker.pl?P.kicker.pl.kacc:75;
    G.meter.per=clamp(1.0-(D-20)*0.012,0.5,1.0);G.meter.pper=clamp(1.3-(D-20)*0.008,0.95,1.3);
    G.meter.tol=clamp((3.0/D)/0.30*(0.78+k/450)*(1-WX.wet*0.15-WX.sn*0.12),0.1,0.6);G.meter.ctr=clamp(-G.wind/0.30,-0.5,0.5);}
}
function gpMeterLook(){
  const M=G.meter,bar=$('mBar');if(!M||!bar)return;
  if(M.stage==='acc'&&M.tol){const c=(M.ctr+1)*50,g=M.tol*50,y=g*1.7;
    const s=(v)=>Math.max(0,Math.min(100,v)).toFixed(1)+'%';
    bar.style.background=`linear-gradient(90deg,#ff6b5a 0%,#ff6b5a ${s(c-y)},#ffd54a ${s(c-y)},#ffd54a ${s(c-g)},#5ccf3c ${s(c-g)},#5ccf3c ${s(c+g)},#ffd54a ${s(c+g)},#ffd54a ${s(c+y)},#ff6b5a ${s(c+y)},#ff6b5a 100%)`;}
  else bar.style.background='';
  if(M.D){const w=Math.round(Math.abs(G.wind||0)/0.0029),ay=gpWind()[1],ht=Math.abs(ay)>=4?(ay>0?' · tailwind':' · headwind'):'';
    $('mSub').textContent=`${M.D} yd ${G.play.kind==='xp'?'extra point':'field goal'} · wind ${w?((G.wind>0?'→ ':'← ')+w+' mph'):'calm'}${ht}${M.stage==='acc'?' · stop it in the green':''}`;}
}

function gpAiKick(k){const D=Math.max(18,100-G.los+17),ka=k&&k.pl?k.pl.kacc:75,sp=(0.6+(D-20)*0.006)*(1.3-ka/200)*(1+WX.wet*0.15+WX.sn*0.15);return kickResult(k,rnd(0.82,1),clamp(-(G.wind||0)/0.30*rnd(0.6,0.95)+rnd(-1,1)*sp,-1,1));}
// ── tackled styles (how the ball carrier goes down) and get-up styles ──
function gpTackleStyle(c,f,type){
  const lc=c.lastCatch&&G.time-c.lastCatch.t<1.6?c.lastCatch.type:null,edge=c.x<3||c.x>FW-3;
  let st='std';
  if(edge&&(lc==='toetap'||Math.random()<0.5))st='sideline';
  else if(lc==='moss'||lc==='high'||lc==='onedive')st='spin';
  else if(lc==='trafL'||lc==='trafR'||lc==='safe'||type==='hit')st='backward';
  else if(lc==='low'||lc==='dive')st='facefirst';
  else if(type==='shoe'){const r=Math.random();st=r<0.45?'facefirst':r<0.75?'twist':r<0.88?'backward':'std';}
  else if(lc==='hands'||lc==='onehand'||lc==='shoulder')st=Math.random()<0.7?'twist':'facefirst';
  else{const r=Math.random();st=type==='dive'?(r<0.4?'facefirst':r<0.7?'twist':'std'):(r<0.35?'twist':r<0.5?'facefirst':r<0.62?'spin':'std');}
  c.tkStyle=st;c.tkStart=G.time;
  const agi=c.pl?c.pl.agi||70:70,r=Math.random();
  c.guStyle=type==='hit'?(r<0.45?'shake':r<0.75?'helped':'pushup'):agi>=88&&r<0.35?'kipup':r<0.3?'roll':r<0.55?'pushup':r<0.75?'shake':'std';
}
function gpDownStyle(c){
  if(c.guStyle==='pushup'||c.guStyle==='helped'){c.downT=(c.downT||0.9)+0.6;c.guDur=1.25;}
  else if(c.guStyle==='kipup'){c.guDur=0.5;}else c.guDur=0.7;
}
function tackleFx(e,dir){
  const o={rot:0,sq:1,jz:0,flip:false},S=G.seq,d=dir||1;
  if(S&&S.c===e&&e.tkStyle){const u=Math.min(1,S.t/S.dur),s=Math.sin(Math.PI*u);
    switch(e.tkStyle){
      case'spin':o.rot=d*1.15*s*(1-0.35*u);break;
      case'backward':o.rot=-0.55*d*s;o.flip=u>0.35;{const k=Math.abs(u-0.35);if(k<0.1)o.sq=0.86+1.4*k;}break;
      case'facefirst':o.rot=0.6*d*s;o.sq=1-0.12*s;break;
      case'sideline':o.rot=0.9*d*s;o.jz=0.18*Math.abs(Math.sin(Math.PI*u*1.6));break;
      case'twist':o.rot=0.7*d*Math.sin(2*Math.PI*u);break;}
    return o;}
  if(e.down&&e.tkStyle==='backward'&&!(e.downT>0&&e.downT<(e.guDur||0.7)))o.flip=true;
  const gd=e.guDur||0.7;
  if(e.down&&e.downT>0&&e.downT<gd&&e.guStyle){const u=1-e.downT/gd,s=Math.sin(Math.PI*u);
    switch(e.guStyle){
      case'roll':o.rot=-0.9*d*(1-u)*Math.cos(Math.PI*u*1.5);break;
      case'kipup':o.jz=0.75*s;o.rot=0.5*d*Math.sin(2*Math.PI*u);break;
      case'pushup':o.sq=0.82+0.18*u;break;
      case'helped':o.rot=0.22*d*s;o.sq=0.9+0.1*u;break;}
    if(e.tkStyle==='backward'&&u<0.3){o.flip=true;const k=Math.abs(u-0.3);if(k<0.08)o.sq*=0.88+1.5*k;}
    if(e.guStyle==='shake'||e.guStyle==='helped')e.shakeT=e.guStyle==='shake'?0.7:0.35;
    return o;}
  if(!e.down&&e.shakeT>0){e.shakeT-=1/60;o.rot=0.16*Math.sin(e.shakeT*26)*Math.min(1,e.shakeT/0.3);}
  return o;
}
function gpFx(e,dir){const a=catchFx(e,dir),b=tackleFx(e,dir),q=qbFx(e,dir),c=downFx(e),v=diveFx(e,dir),t=gpTkFx(e,dir);return{rot:a.rot+b.rot+q.rot+v.rot+t.rot,sq:a.sq*b.sq*c.sq*t.sq,jz:a.jz+b.jz+q.jz+c.jz+v.jz+t.jz,flip:b.flip};}

// ── coverage quality: man = DB vs his receiver, zone = DB reading the QB ──
function gpCoverTune(d){
  if(!d.pl||!d.cover)return;
  const cov=d.pl.cov||60,q=G.qb&&G.qb.pl,qa=q?((q.acc||70)*0.7+(q.pow||70)*0.3):75;
  if(d.cover.type==='man'&&d.cover.man&&d.cover.man.pl){
    const r=d.cover.man.pl,edge=cov+((d.pl.spd||70)-(r.spd||70))*0.5-((r.agi||75)*0.6+(r.spd||75)*0.4);
    d.edge=edge;d.tau=clamp(0.27-edge*0.006,0.08,0.46)+rnd(-0.02,0.02);
    d.spdF=clamp(0.965+edge*0.0025,0.86,1.03);d.react=clamp(0.3-edge*0.0045,0.1,0.52)+rnd(-0.03,0.03);
  }else if(d.cover.type==='zone'){
    const rd=cov-qa;d.readF=clamp(1+rd*0.035,0.25,2.0);d.react=clamp(0.2-rd*0.004,0.06,0.45)+rnd(-0.03,0.03);
  }
}

// ── QB arm limits and accuracy, receivers turning to the ball ──
function gpMaxD(){const p=G.qb&&G.qb.pl?(G.qb.pl.pow||70):70;return clamp(24+p*0.42,30,62)*(1-gpFat(G.qb)*0.12)*(1+(WX.alt||0)*0.04-WX.sn*0.05);}
function gpFaceBall(e){
  const a=G.air;if(!a||e!==a.intended)return false;
  if(a.T-a.t>0.8)return false;
  const ad=Math.sign(a.dy)||1,land=ballAt(a,a.T);
  return(a.ty-e.y)*ad<-0.3||land.h>2.5||e.vy*ad<1.2;
}
function gpCatchFace(r,type){
  const a=G.air;if(!a||!r)return;
  const ad=Math.sign(a.dy)||1,back=Math.sign(a.sy-r.y)||r.dir;
  if(type==='moss'||type==='high'||r.vy*ad<1.5||((type==='trafL'||type==='trafR'||type==='safe'||type==='low'||type==='hands')&&r.vy*ad<3))r.dir=back;
}

// ── ball-carrier moves succeed by ratings: OVR, speed, awareness, strength (by move) vs the tackler ──
function _ovE(p){return clamp(38+(p.ovr||60)*0.65,40,99);}
function gpMoveSkill(k,c){const p=c.pl,a=p.awr||70,o=_ovE(p);
  const el=gpElu(p),bt=gpBtk(p);
  if(k==='juke')return 0.35*el+0.25*(p.spd||75)+0.2*a+0.2*o;
  if(k==='spin')return 0.3*el+0.3*a+0.2*bt+0.2*o;
  if(k==='stiff')return 0.45*bt+0.2*o+0.2*a+0.15*(p.spd||75);
  if(k==='truck')return 0.55*bt+0.2*o+0.15*a+((p.wt||200)-200)*0.05;
  return 0.5*(p.agi||75)+0.3*(p.spd||75)+0.2*a;}
function gpMoveDef(k,f){const p=f.pl,a=p.awr||70;
  if(k==='juke')return 0.45*(p.tkl||70)+0.3*a+0.25*(p.agi||70);
  if(k==='spin')return 0.5*(p.tkl||70)+0.3*a+0.2*(p.str||70);
  if(k==='stiff')return 0.5*(p.str||70)+0.5*(p.tkl||70);
  if(k==='truck')return 0.6*(p.str||70)+0.4*(p.tkl||70)+((p.wt||200)-200)*0.04;
  return 0.6*(p.tkl||70)+0.4*a;}
function gpMove(k,c,f){const e=gpMoveSkill(k,c)-gpMoveDef(k,f),base={juke:0.15,spin:0.21,stiff:0.19,truck:0.15}[k]||0.16;
  const rs=(k==='juke'||k==='spin')?gpDefMods(f.pl).resist:0;
  return clamp(base+e*0.011+gpMoveMod(k,c.pl)-rs-gpFat(c)*0.12+gpFat(f)*0.06,0.02,0.42);}
function gpJukeStun(c,d){return clamp(slf(c.team,'juk',0.4)*0.17+(slf(c.team,'juk',0.4)-1)*0.1+(gpMoveSkill('juke',c)-gpMoveDef('juke',d))*0.01+gpMoveMod('juke',c.pl)-gpDefMods(d.pl).resist*1.5-gpFat(c)*0.15+gpFat(d)*0.08,0.02,0.6);}
function gpJukeDur(c,d){return 0.2+0.32*clamp(0.5+(gpMoveSkill('juke',c)-gpMoveDef('juke',d))*0.02-gpDefMods(d.pl).resist*2,0.15,1);}
function gpHurdleP(c,f){return clamp(0.2-(gpMoveSkill('hurdle',c)-gpMoveDef('hurdle',f))*0.011-gpMoveMod('hurdle',c.pl),0.06,0.6);}

// ── QB scramble: defenders bite by QB threat vs their discipline; QB can still throw behind the line ──
function gpScrambling(){const q=G.qb,P=G.play;return!!(q&&G.carrier===q&&P&&P.kind==='scrimmage'&&P.off.kind==='pass'&&!P.special&&G.linesW&&(q.y-G.linesW.los)*attackDir(q)<0);}
function gpBite(e){
  const q=G.qb&&G.qb.pl;if(!q||!e.pl)return true;
  const ov=p=>clamp(38+(p.ovr||60)*0.65,40,99);
  const arch={Scrambler:10,'Pure Runner':12,Tank:5,'Field General':-6,Gunslinger:-4}[q.arch]||0;
  const threat=0.4*(q.spd||70)+0.3*(q.agi||70)+0.3*ov(q)+arch,disc=0.55*(e.pl.awr||70)+0.45*ov(e.pl);
  return Math.random()<clamp(0.5+(threat-disc)*0.015,0.1,0.95);
}
function gpScrambleThrow(c,dt){
  if(!gpScrambling()||c!==G.qb)return false;
  if(G.t-(c.scrT||0)<0.45||Math.random()>dt*1.6)return false;
  for(const r of G.recv){if(r.down||r===c)continue;const d=Math.hypot(r.x-c.x,r.y-c.y);if(d>32)continue;
    let dn=99;for(const o of G.ents)if(o.side!==c.side&&!o.down)dn=Math.min(dn,dist(o,r));
    if(dn>2.6){G.carrier=null;G.ballState='qb';c.scrT=G.t;setCtl();return true;}}
  return false;
}
function gpPassBtnTick(){
  let b=document.getElementById('gpRePass');
  const show=(G.client?olScrambling():gpScrambling()&&!isAI(G.offTeam)&&G.offTeam===G.me)&&!G.test&&!G.noDraw;
  if(!b){if(!show)return;b=document.createElement('button');b.id='gpRePass';b.textContent='Pass';
    b.style.cssText='position:fixed;left:50%;bottom:calc(18px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:40;min-height:48px;padding:0 30px;border-radius:8px;border:1px solid rgba(255,255,255,.6);font:900 17px Nunito,system-ui,sans-serif;color:#fff;background:var(--tA,#2f66c0);box-shadow:0 6px 16px rgba(0,0,0,.35)';
    b.onclick=ev=>{ev.stopPropagation();if(G.client){olCmd('repass');return;}if(gpScrambling()){G.carrier=null;G.ballState='qb';G.qb.scrT=G.t;setCtl();}};document.body.appendChild(b);}
  b.style.display=show?'block':'none';
}
// ── outside runs (toss, outside zone): playside blocking, receivers stalk-block, a beat longer read, RB burst ──
function gpOutside(){const P=G.play;if(!P||P.kind!=='scrimmage'||P.off.kind!=='run')return 0;const RD=P.off.data||{},last=RD.path?RD.path[RD.path.length-1]:null;
  if(RD.toss||(last&&Math.abs(last[0])>=8))return Math.sign(last?last[0]:1)||1;return 0;}
function gpStalk(e){
  // each receiver takes his own man (nickel backs included) and sticks with him
  let t=e.stk;if(t&&(t.down||dist(t,e)>16))t=null;
  if(!t){let best=null,bd=14;for(const d of G.ents)if(d.side!==e.side&&!d.down&&d.eng<=0&&d.engCD<=0&&(d.role==='CB'||d.role==='S'||d.role==='LB'||d.role==='NB')&&!G.ents.some(o=>o!==e&&o.stk===d)){const dd=dist(d,e);if(dd<bd){bd=dd;best=d;}}t=best;e.stk=t;}
  return t?desire(e,t.x,t.y-0.4*attackDir(e),e.spd*0.9):desire(e,e.x,e.y+3,4);
}
function gpRunBurst(c){const s=gpOutside(),RD=G.play&&G.play.off&&G.play.off.data;if(RD&&RD.jet&&c===G.rb&&G.t<2.6)return 1.12;return s&&c===G.rb&&G.t<2.6?(RD&&RD.toss?1.1:1.08):1;}

// ── ratings, archetypes and traits drive contact, moves and catches ──
function gpTr(pl,k){return!!(pl&&pl.traits&&pl.traits.includes(k));}
function gpClutch(pl){const late=G.q>=4&&Math.abs(G.score[0]-G.score[1])<=8;return late&&(gpTr(pl,'clutch')||gpTr(pl,'competitor')||gpTr(pl,'big-game'))?0.03:0;}
function gpMoveMod(k,pl){
  const A=pl.arch||'',ht=pl.ht||73,wt=pl.wt||205;let m=0;
  if(k==='juke'||k==='spin'){m+=(205-wt)*0.0012+(73-ht)*0.005;if(A==='Shifty')m+=0.06;if(A==='Speedster'||A==='Track Speed'||A==='Scrambler'||A==='Pure Runner')m+=0.03;if(A==='Contact Seeker'||A==='Tank')m-=0.03;if(A==='Gadget'||A==='Receiving Back')m+=0.02;}
  if(k==='stiff'){m+=(ht-73)*0.007+(wt-205)*0.0008;if(A==='Contact Seeker'||A==='Tank')m+=0.04;if(gpTr(pl,'gym-rat'))m+=0.02;}
  if(k==='truck'){m+=(wt-205)*0.0018;if(A==='Contact Seeker'||A==='Tank')m+=0.06;if(A==='Shifty'||A==='Speedster')m-=0.04;if(gpTr(pl,'gym-rat'))m+=0.02;}
  if(k==='hurdle'){m+=(ht-73)*0.006-(wt-205)*0.001;if(A==='Track Speed'||A==='Jump Ball')m+=0.03;}
  if(gpTr(pl,'showboat'))m+=(Math.random()-0.4)*0.1;
  return m+gpClutch(pl);
}
function gpTackleMod(f,c,type){
  const A=f.pl.arch||'',ov=p=>clamp(38+(p.ovr||60)*0.65,40,99);let m=(ov(f.pl)-ov(c.pl))*0.003;
  if(A==='Thumper'||A==='Hitsticker'||A==='Box Specialist'||A==='Physical')m+=0.04;
  if(A==='Coverage Specialist'||A==='Field'||A==='Zone')m-=0.02;
  if(A==='Pure Power'||A==='Power Rusher'||A==='Edge Setter')m+=0.02;
  if(type==='wrap'||type==='hit')m+=((f.pl.wt||210)-(c.pl.wt||205))*0.0008;
  if(gpTr(f.pl,'hothead'))m-=0.02;if(gpTr(f.pl,'leader'))m+=0.01;
  return m+gpClutch(f.pl);
}
// ── v1.94 form & line play ──
// the defender responsible for a receiver: his man-coverage defender, otherwise the closest defender in coverage
function gpCoverOf(r){if(!r)return null;let best=null,bd=7;
  for(const d of G.ents){if(d.side!=='d'||d.down&&d.downT>1)continue;if(d.cover&&d.cover.type==='man'&&d.cover.man===r)return d;}
  for(const d of G.ents){if(d.side!=='d'||!(d.role==='CB'||d.role==='NB'||d.role==='S'||d.role==='LB'))continue;const k=dist(d,r);if(k<bd){bd=k;best=d;}}
  return best;}
// receivers: a shaky season or drops earlier in this game make the next catch a little harder
function gpDropForm(r){const pl=r&&r.pl;if(!pl)return 0;return Math.min(0.06,(pl.gDrops||0)*0.025)+clamp(((pl.dropR!=null?pl.dropR:0.07)-0.07)*0.3,-0.02,0.03);}
// defenders with a knack for getting a hand on the ball
function gpPbuForm(d){const v=d&&d.pl&&d.pl.pbuR;return v==null?0:clamp((v-0.45)*0.03,-0.01,0.03);}
// AI quarterbacks look away from receivers who drop the ball and at the defender who has been giving up yards
function gpTargetForm(r){let s=0;const pl=r&&r.pl;if(pl)s-=clamp(((pl.dropR!=null?pl.dropR:0.07)-0.07)*4,-0.1,0.3)+Math.min(0.45,(pl.gDrops||0)*0.18);
  const cv=gpCoverOf(r);if(cv&&cv.pl){const ya=cv.pl.ypgA!=null?cv.pl.ypgA:28,gy=(G.st&&cv.pl.mid!=null&&G.st[cv.pl.mid]&&G.st[cv.pl.mid].ydsA)||0;s+=clamp((ya-28)/40,-0.25,0.35)+Math.min(0.3,gy/120);}
  return s;}
// pancake: a lineman who wins the rep decisively puts the defender on his back for a moment (more often on run plays)
function gpPancake(b,d,c){
  if(G.play.kind!=='scrimmage'||G.conv||b.role!=='OL'||!b.pl||!d.pl||d.pkTried||d.down)return;d.pkTried=true;
  const run=!!c&&c!==G.qb,ratio=gpBlockRatio(b,d);
  const pk=clamp((ratio-1.02)*0.4+((b.pl.pkR!=null?b.pl.pkR:1.5)-1.5)*0.008+(b.pl.arch==='Run Blocker'||b.pl.arch==='Blocker'?0.02:0)+(gpTr(b.pl,'gym-rat')?0.01:0),0,0.14)*(run?1:0.45);
  if(Math.random()>=pk)return;
  d.eng=0;d.engCD=0.6;d.down=true;d.downT=1.5;d.guDur=0.8;d.downAnim='tackled';d.fall='back';d.tk=null;d.lunge=0;d.vx*=0.2;d.vy*=0.2;b.engWith=null;
  (G.gpPk=G.gpPk||[]).push(b);dust(d.x,d.y,10);if(!isAI(b.team)||Math.random()<0.35)flash('Pancake!');
}
// v2.06 pass protection vs pass rush: a better rusher beats his block sooner (more pressure and sacks), a better line holds longer
// ball-carrier skill: centered on agility / strength (as before the skill ratings existed), the skill moves it from there,
// so a skilled runner gains and nobody drops below what his body alone gives him
function gpElu(p){const a=p.agi||75;return p.elu?a+(p.elu-a)*0.5+3:a;}
function gpBtk(p){const s=p.str||70;return p.btk?s+(p.btk-s)*0.5+4:s;}
function gpPassPro(b,d){
  const base=b.role==='OL'?1:b.fb?0.75:0.8;if(!b.pl||!d.pl)return base;const N=p=>30+(p.ovr||60)*0.7;
  const rush=0.45*N(d.pl)+0.2*(d.pl.pmv||d.pl.str||75)+0.1*(d.pl.fmv||d.pl.spd||70)+0.25*(d.pl.spd||70),pb=0.5*N(b.pl)+0.35*(b.pl.pbk||b.pl.str||80)+0.15*(b.pl.awr||70);
  let r=Math.pow(pb/rush,3.1)*base*GP_PRO;const D=d.pl.arch||'',A=b.pl.arch||'';
  if(D==='Speed Rusher')r*=0.88;else if(D==='Power Rusher')r*=0.93;if(A==='Pass Blocker')r*=1.08;
  r*=(1-gpFat(b)*0.2)/(1-gpFat(d)*0.2);
  return clamp(r,0.3,1.8);
}
const GP_PRO=1.0;
function gpBlockRatio(b,d){
  if(!b.pl||!d.pl)return 1;const ov=p=>clamp(38+(p.ovr||60)*0.65,40,99);
  let r=clamp((0.6*(b.pl.rbk||b.pl.str||70)+0.4*ov(b.pl))/(0.5*(d.pl.str||70)+0.25*(d.pl.bsh||d.pl.tkl||70)+0.25*(d.pl.awr||70)),0.7,1.3)*(1-gpFat(b)*0.18)/(1-gpFat(d)*0.18);
  const A=b.pl.arch||'',D=d.pl.arch||'';if(A==='Run Blocker'||A==='Blocker')r*=1.1;if(A==='Pass Blocker')r*=0.95;
  if(D==='Edge Setter'&&gpOutside())r*=0.8;if(D==='Pure Power'||D==='Power Rusher')r*=0.94;
  return r;
}
function gpCatchMod(r,type){
  const A=r.pl.arch||'';let m=0;
  if(A==='Sure Hands')m+=0.04;if(A==='Jump Ball'&&(type==='high'||type==='moss'||type==='obj'))m+=0.05;if(A==='Big Play'&&type==='shoulder')m+=0.03;
  if(gpTr(r.pl,'showboat'))m+=(Math.random()-0.5)*0.08;
  m-=Math.max(0,gpFat(r)-0.25)*0.12; // heavy legs, heavy hands
  m-=gpNoiseFor(r.team)*0.04; // a loud road crowd
  if(r.pl.chem!=null)m+=(r.pl.chem-50)/1000; // chemistry with the quarterback
  return m+gpClutch(r.pl);
}

// ── defender archetypes / traits: resist jukes, ball skills, big hits ──
function gpDefMods(pl){
  const A=(pl&&pl.arch)||'',T=k=>gpTr(pl,k);let resist=0,intc=0,hit=0;
  if(A==='Coverage Specialist'||A==='Zone'||A==='Field')resist+=0.05;if(A==='Edge Setter')resist+=0.06;if(A==='Hybrid')resist+=0.03;
  if(T('film-junkie'))resist+=0.05;if(T('coachable'))resist+=0.03;if(T('leader'))resist+=0.02;if(T('hothead'))resist-=0.05;if(T('lazy'))resist-=0.03;
  if(A==='Coverage Specialist')intc+=0.05;if(A==='Zone')intc+=0.04;if(A==='Field'||A==='Hybrid')intc+=0.02;if(A==='Bump and Run')intc+=0.01;
  if(T('film-junkie'))intc+=0.03;if(T('clutch')||T('big-game'))intc+=0.02;if(T('showboat'))intc+=0.02;
  if(A==='Hitsticker')hit+=0.12;if(A==='Thumper'||A==='Box Specialist')hit+=0.08;if(A==='Physical'||A==='Pure Power')hit+=0.05;if(T('hothead')||T('gym-rat'))hit+=0.03;
  return{resist,intc,hit};
}

// ═══ playbooks in the game engine ═══
function gpPB(t){return GP&&GP.teams&&GP.teams[t]?GP.teams[t].pb:null;}
function gpDPB(t){return GP&&GP.teams&&GP.teams[t]?GP.teams[t].dpb:null;}
function gpPBCall(t,d,tg){
  const PB=gpPB(t);if(!PB||!PB.plays||!PB.plays.length)return null;
  const passP=clamp(PB.passP+(d===3&&tg>5?0.25:d===1?-0.05:0)+(tg<=2?-0.2:0),0.08,0.95);
  if(Math.random()<passP)return{kind:'pass',data:pick(PB.plays)};
  const qa=(G.qb&&G.qb.pl&&G.qb.pl.arch)||'',qw=qa==='Pure Runner'||qa==='Scrambler'?1:qa==='Tank'?0.8:0.45;
  const runs=gpRunList(PB).filter(r=>!r.qb||tg<=2||Math.random()<qw);return{kind:'run',data:runs.length?pick(runs):RUNS[0]};
}
function gpRunList(PB){if(PB.runPlays&&PB.runPlays.length)return PB.runPlays;return RUNS.filter(r=>PB.runs.includes(r.n));
}
function gpDefWeights(w){const D=gpDPB(1-G.offTeam);if(!D||!D.w)return w;const o=w.map(([id,v])=>[id,v*(D.w[id]!=null?D.w[id]:1)]).filter(x=>x[1]>0);return o.length?o:w;}
// ═══ audibles ═══
function gpAudOK(e){const q=G.qb&&G.qb.pl,r=e.pl;if(!q||!r)return 0.8;return(1-gpNoiseFor(e.team)*0.45)*clamp(0.55+((r.ovr||60)-60)*0.004+((r.awr||70)-70)*0.004+((q.ovr||60)-60)*0.003+((q.awr||70)-70)*0.005,0.3,0.97);}
function gpAudOpen(e){
  let el=document.getElementById('gpAud');if(el)el.remove();
  el=document.createElement('div');el.id='gpAud';
  el.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:60;width:min(420px,92vw);max-height:80vh;overflow-y:auto;border-radius:18px;padding:12px;background:linear-gradient(180deg,rgba(255,255,255,.25),rgba(255,255,255,.06)),rgba(8,30,52,.94);border:1px solid rgba(255,255,255,.35);color:#fff;font:600 13px Nunito,system-ui,sans-serif;box-shadow:0 18px 40px rgba(0,0,0,.5)';
  const keys=Object.keys(ROUTES).filter(k=>k!=='block'||e.role==='TE'||e.role==='RB');
  el.innerHTML=`<div style="font-weight:900;font-size:16px;margin-bottom:2px">Audible: #${e.pl.num} ${nm(e.pl)}<\/div><div style="opacity:.75;margin-bottom:8px">Now: ${e.route?e.route.name:'block'} · chance he gets the call: ${Math.round(gpAudOK(e)*100)}%<\/div><div style="display:flex;flex-wrap:wrap;gap:6px">${keys.map(k=>`<button data-k="${k}" style="min-height:36px;padding:0 12px;border-radius:8px;border:1px solid rgba(255,255,255,.4);background:rgba(255,255,255,.12);color:#fff;font:800 12px Nunito,system-ui,sans-serif;cursor:pointer">${k}<\/button>`).join('')}<\/div><div style="text-align:right;margin-top:10px"><button data-x="1" style="min-height:34px;padding:0 14px;border-radius:8px;border:0;background:#334;color:#fff;font-weight:800">Cancel<\/button><\/div>`;
  el.onclick=ev=>{ev.stopPropagation();const b=ev.target.closest('button');if(!b)return;el.remove();if(b.dataset.k)gpAudible(e,b.dataset.k);};
  document.body.appendChild(el);
}
// play audibles: change the whole call at the line (another pass, or check to a run). The QB's awareness and crowd noise decide
// whether everyone gets it; a missed audible keeps the old play.
const GP_PAUD=[['Quick pass','pass','Slant-Flat'],['Deep shot','pass','Four Verts'],['Play action','pass','PA Boot'],['Screen','pass','RB Screen'],['Inside run','run','Inside Zone'],['Outside run','run','Outside Zone'],['Toss','run','Toss'],['QB sneak','run','QB Sneak']];
function gpPlayAudOpen(){if(G.phase!=='presnap'||!G.play||G.play.kind!=='scrimmage')return;
  let el=document.getElementById('gpAud');if(el)el.remove();el=document.createElement('div');el.id='gpAud';
  el.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:60;width:min(420px,92vw);max-height:80vh;overflow-y:auto;border-radius:18px;padding:12px;background:linear-gradient(180deg,rgba(255,255,255,.25),rgba(255,255,255,.06)),rgba(8,30,52,.94);border:1px solid rgba(255,255,255,.35);color:#fff;font:600 13px Nunito,system-ui,sans-serif;box-shadow:0 18px 50px rgba(0,0,0,.5)';
  const q=G.qb&&G.qb.pl,ok=Math.round(gpPlayAudOK()*100);
  el.innerHTML=`<div style="font-weight:900;font-size:16px;margin-bottom:2px">Audible: change the play<\/div><div style="opacity:.75;margin-bottom:8px">Now: ${(G.pbp&&G.pbp.call)||'–'} · chance everyone gets it: ${ok}%<\/div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">${GP_PAUD.map((x,i)=>`<button data-i="${i}" style="padding:10px 8px;border-radius:10px;border:1px solid rgba(255,255,255,.3);background:${x[1]==='run'?'rgba(92,207,60,.25)':'rgba(63,169,245,.25)'};color:#fff;font:800 13px Nunito,system-ui,sans-serif;cursor:pointer">${x[0]}<div style="font-weight:600;font-size:11px;opacity:.8">${x[2]}<\/div><\/button>`).join('')}<\/div><div style="text-align:right;margin-top:8px"><button data-x="1" style="padding:6px 12px;border-radius:8px;border:1px solid rgba(255,255,255,.3);background:none;color:#fff;cursor:pointer">Keep the play<\/button><\/div>`;
  el.onclick=ev=>{ev.stopPropagation();const b=ev.target.closest('button');if(!b)return;el.remove();if(b.dataset.i!=null)gpPlayAud(+b.dataset.i);};document.body.appendChild(el);}
function gpPlayAudOK(){const q=G.qb&&G.qb.pl;return clamp((0.62+(((q&&q.awr)||70)-70)*0.007+(((q&&q.ovr)||60)-60)*0.004)*(1-gpNoiseFor(G.offTeam)*0.5),0.3,0.96);}
function gpPlayAud(i){const A=GP_PAUD[i];if(!A||G.phase!=='presnap')return;const L=A[1]==='run'?RUNS:PASSES,pl=L.find(x=>x.n===A[2]);if(!pl)return;
  G.qbAudT=G.time;flash('Audible!');try{SFX.whistle&&0;}catch(e){}
  setTimeout(()=>{if(G.phase!=='presnap'||!G.play||G.play.kind!=='scrimmage')return;
    if(Math.random()>gpPlayAudOK()){flash('Not everyone got it: same play');return;}
    const d=G.play.defCall,cur=(G.pbp&&G.pbp.call)||'',f=G.play.off&&G.play.off.data&&G.play.off.data.f;
    const o={kind:A[1],data:Object.assign({},pl,f&&A[1]==='pass'?{f}:{})};
    setupScrimmage(o,d);G.play.defCall=d;if(G.pbp)G.pbp.call=((o.data.f&&FORMS[o.data.f]?FORMS[o.data.f].n+' ':'')+o.data.n)+' (audible)';
    toPresnap();flash(`Audible: ${A[2]}`);},650);}
function gpAudible(e,name){
  if(G.phase!=='presnap')return;if(G.client){olCmd('aud',{n:e.nk,name});return;}G.qbAudT=G.time;flash('Audible!');
  setTimeout(()=>{if(G.phase!=='presnap'||!G.ents.includes(e))return;
    if(Math.random()<gpAudOK(e)){const out=e.hx<CX?-1:1,col=e.route?e.route.col:'#ffffff';e.x=e.hx;e.y=e.hy;if(name==='block'){e.route=null;e.block=true;}else{e.block=false;setRoute(e,name,out,col);}flash(`#${e.pl.num} got it: ${name}`);}
    else flash(`Miscommunication! #${e.pl.num} keeps his route`);},750);
}
// ═══ QB hold + release motion ═══
function gpRelSet(qb,bullet,D){
  const A=(qb.pl&&qb.pl.arch)||'',moving=Math.hypot(qb.vx,qb.vy)>1.5;
  let dur=bullet?0.3:D>30?0.52:0.4,start=bullet?0.14:D>30?0.06:0.1;
  if(A==='Gunslinger')dur*=0.85;else if(A==='Field General')dur*=0.9;else if(A==='Tank')dur*=1.15;
  if(moving&&(A==='Scrambler'||A==='Pure Runner'))dur*=0.75;
  qb.relT=qb.relDur=dur;qb.relS=start;qb.relKind=bullet?'bullet':D>30?'lob':'norm';qb.relArch=A;qb.relMove=moving;
}
function gpDropping(e){const P=G.play;return e===G.qb&&G.ballState==='qb'&&G.phase==='live'&&!G.pendThrow&&P&&P.kind==='scrimmage'&&P.off.kind==='pass'&&e.back&&Math.hypot(e.vx,e.vy)>0.6;}
function qbDropFx(e,o,d){
  if(e!==G.qb||G.ballState!=='qb'||G.phase!=='live'||G.pendThrow)return;
  if(gpDropping(e)){
    // drop: each step is a light skip off the ball of the foot, shoulders level, slight lean toward the target
    const u=e.anim*1.4,s=Math.abs(Math.sin(u));
    o.jz+=0.16*s;o.sq*=1-0.07*(1-s);o.rot+=0.05*d;e._drop=true;return;}
  if(e._drop){e._drop=false;e.setAt=G.time;}
  const t=G.time-(e.setAt||-9);
  if(t<0.32){// plant the back foot, then hitch up into the throwing base
    if(t<0.12)o.sq*=1-0.09*Math.sin(Math.PI*t/0.12);else o.jz+=0.09*Math.sin(Math.PI*(t-0.12)/0.2);return;}
  if(Math.hypot(e.vx,e.vy)<0.6){o.jz+=0.035*Math.abs(Math.sin(G.time*12.5+e.seed));}// happy feet: stay light, ready to throw
}
function qbFx(e,dir){
  const o={rot:0,sq:1,jz:0},d=dir||1;if(e!==G.qb)return o;
  qbDropFx(e,o,d);
  if((G.pendThrow&&e===G.qb)||(e.relT>0&&e.relDur)){const u=G.pendThrow&&e===G.qb?e.thrU:(e.relS!=null&&e.relFull?e.relS+(1-e.relS)*(1-e.relT/e.relDur):1-e.relT/e.relDur),s=Math.sin(Math.PI*u);
    if(e.relKind==='lob')o.rot=d*(-0.2+0.45*u)*(0.6+0.4*s);else if(e.relKind==='bullet')o.rot=d*0.16*s;else o.rot=d*0.1*s;
    if(e.relArch==='Gunslinger')o.rot+=d*0.2*s;if(e.relArch==='Tank')o.jz=0.08*s;if(e.relMove)o.rot+=d*0.12*s;return o;}
  if(G.phase==='presnap'&&G.qbAudT&&G.time-G.qbAudT<1.0)o.rot=0.08*d*Math.sin((G.time-G.qbAudT)*14);
  return o;
}
// ═══ sideline: benches, coaches, substitutes running on and off ═══
function gpSideX(t){return t===0?FW+2.8:-3.6;}
function gpCoaches(){
  if(G.coaches)return G.coaches;
  G.coaches=[0,1].map(t=>{const e=mkEnt(null,t,'c','COACH','C'+t,gpSideX(t)+(t===0?-1.3:1.3),60.5+t*0.8);e.coach=true;e.coachPal=2+t;
    e.refLook={skin:tone((GP&&GP.teams[t]&&GP.teams[t].coachSkin)||'#c68a5e'),sleeve:null,visor:false,longSock:false,band:false};e.body={hs:1.0,ws:1.1,belly:0.2};e.dir=t===0?1:-1;return e;});
  return G.coaches;
}
function gpNearAction(e){if(G.phase!=='live'&&G.phase!=='replay')return false;for(const o of G.ents)if(o.x>FW-7&&Math.abs(o.y-e.y)<5)return true;const b=G.air&&G.air.cur;return!!(b&&b.x>FW-6&&Math.abs(b.y-e.y)<6);}
function gpBuildBench(){
  const out=[...gpCoaches()],ghosts=new Set((G.subOut||[]).map(g=>g.pl&&g.pl.id));
  for(const t of[0,1]){const T=G.teams[t];if(!T)continue;const on=new Set(G.ents.filter(e=>e.pl&&e.team===t).map(e=>e.pl.mid!=null?e.pl.mid:e.pl.id));const seen=new Set();let i=0;
    const list=[];for(const p of T.roster){const k=p.mid!=null?p.mid:p.id;if(on.has(k)||seen.has(k)||ghosts.has(p.id)||p.pos==='P')continue;seen.add(k);list.push(p);if(list.length>=20)break;}
    // a tight team box around midfield: two staggered rows shoulder to shoulder, the row nearer the field slightly in front
    const cols=Math.ceil(list.length/2),sp=Math.min(1.25,22/Math.max(1,cols)),out1=t===0?1:-1,rowD=t===0?0.7:0.85;
    list.forEach((p,j)=>{const r=j%2,c=(j-r)/2,h=hash((p.id|0)*31+t*7);
      const x=gpSideX(t)+out1*(r*rowD+((h%5)-2)*0.06),y=60-(cols-1)*sp/2+c*sp+r*sp*0.5+((h>>>3)%5-2)*0.05;
      const e=mkEnt(p,t,'b','BENCH','BN',x,y);e.bench=true;e.dir=(h>>>6)%2?1:-1;e.seed=(h%997)/97;out.push(e);i++;});}
  G.side=out.concat(G.subOut||[]);
}
function gpAfterSetup(){
  try{
    G.unitOn=G.unitOn||{};G.subOut=(G.subOut||[]).filter(g=>!g.arrived);let anyIn=false;
    for(const t of[0,1]){const key=t+':'+(G.offTeam===t?'o':'d'),cur=new Set(),ids={};
      for(const e of G.ents)if(e.pl&&e.team===t){cur.add(e.pl.id);ids[e.pl.id]=e;}
      const prev=G.unitOn[key];
      if(prev&&G.play&&G.play.kind==='scrimmage'){
        // substitutes are simply on the field at their spots (no jog on / off, it held the game up)
      }
      G.unitOn[key]=cur;
    }
    if(anyIn)G.snapIn=Math.max(G.snapIn||0,2.6);
    gpBuildBench();
  }catch(e){console.error(e);}
}
function gpSideStep(dt){
  for(const g of G.subOut||[]){if(g.arrived)continue;const dx=g.tx-g.x,dy=g.ty-g.y,d=Math.hypot(dx,dy);
    if(d<0.4){g.arrived=true;g.vx=g.vy=0;continue;}const s=Math.min(4.2*SPD,Math.max(1.6*SPD,d*2));g.vx=dx/d*s;g.vy=dy/d*s;g.x+=g.vx*dt;g.y+=g.vy*dt;g.anim+=s*dt*2.1;if(Math.abs(g.vy)>0.5)g.dir=Math.sign(g.vy);}
  if(G.phase==='presnap')for(const e of G.ents){if(!e.subIn)continue;const dx=e.hx-e.x,dy=e.hy-e.y,d=Math.hypot(dx,dy);
    if(d<0.3){e.x=e.hx;e.y=e.hy;e.subIn=false;e.vx=e.vy=0;continue;}const s=Math.min(5*SPD,Math.max(1.6*SPD,d*2.2));e.vx=dx/d*s;e.vy=dy/d*s;e.x+=e.vx*dt;e.y+=e.vy*dt;e.anim+=s*dt*2.1;if(Math.abs(e.vy)>0.5)e.dir=Math.sign(e.vy);}
}
// ═══ tackled / get-up detail ═══
// eased, type-aware frame timing so falls and get-ups don't pop between poses
const smooth=u=>{u=clamp(u,0,1);return u*u*(3-2*u);};
function gpTackledFrame(e,S,A){
  const u=clamp(S.t/S.dur,0,1),lc=e.lastCatch&&G.time-e.lastCatch.t<1.2?e.lastCatch.type:null,air=(e.jz||0)>0.15||lc==='high'||lc==='moss'||lc==='onedive'||lc==='obj';
  if(S.type==='push')return A('tackled',0.08+0.3*smooth(u)); // stumbling sideways out of bounds
  if(S.type==='shoe'){ // tripped up: a couple of stumbling strides, then the fall
    if(u<0.32)return A('run_ball',u/0.32*0.6);return A('tackled',0.25+0.7*smooth((u-0.32)/0.68));}
  if(S.type==='hit')return A('tackled',0.15+0.82*Math.pow(u,0.7)); // blown back fast
  if(air)return A('tackled',0.32+0.63*smooth(u)); // caught in the air: already falling
  if(S.type==='dive')return A('tackled',0.1+0.85*smooth(u));
  // wrap: fight for yards first, then go down
  return A('tackled',u<0.25?0.05+u*0.4:0.15+0.8*smooth((u-0.25)/0.75));
}
function gpGetupU(e,u){
  switch(e.guStyle){
    case'kipup':return u<0.35?0.1:0.35+0.65*smooth((u-0.35)/0.65);
    case'roll':return u<0.4?0.05+u*0.25:0.15+0.85*smooth((u-0.4)/0.6);
    case'pushup':return u<0.5?0.12+0.3*smooth(u/0.5):0.42+0.58*smooth((u-0.5)/0.5);
    case'helped':return u<0.45?0.3*smooth(u/0.45):0.3+0.7*smooth((u-0.45)/0.55);
    default:return smooth(u);}
}
function gpDownDetail(c){
  const tk=c.tk||'wrap';c.downAt=G.time;
  if(tk==='hit'){c.downT=(c.downT||0.9)+0.6;c.guDur=Math.max(c.guDur||0.7,1.35);}
  else if(tk==='shoe'){c.guDur=Math.min(c.guDur||0.7,0.6);}
  else if(tk==='dive'){c.guDur=Math.max(c.guDur||0.7,0.75);}
  else c.guDur=Math.max(c.guDur||0.7,0.85);
}
function downFx(e){const o={jz:0,sq:1};if(!e.down||!e.downAt)return o;const t=G.time-e.downAt;
  if(t<0.32)o.jz=0.22*Math.abs(Math.sin(Math.PI*t/0.16))*(1-t/0.32);
  else if(e.tk==='hit'&&e.downT>(e.guDur||0.7))o.sq=1+0.025*Math.sin(G.time*6);
  return o;}

function gpGod(){return GP&&GP.god&&GP.god.on?GP.god:null;}
function gpCD(c){const gd=gpGod();return gd&&c&&c.team===0?(gd.cd||0.25):1;}
const GOD_CATCHES=[['auto','Normal'],['hands','Hands'],['shoulder','Over the shoulder'],['high','High point'],['moss','Over the top'],['onehand','One-handed'],['obj','One-hand fingertip'],['low','Low'],['slide','Sliding'],['dive','Diving'],['onedive','One-hand dive'],['toetap','Toe tap'],['poss','In traffic'],['trafL','Traffic, left'],['trafR','Traffic, right'],['safe','Secure']];
function gpGodRow(ft){const gd=gpGod();if(!gd||isAI(0))return;
  const w=document.createElement('label');w.style.cssText='display:inline-flex;align-items:center;gap:6px;font:800 12px Nunito,system-ui,sans-serif;color:#0d2a43;margin-right:auto';
  w.innerHTML='God mode catch <select style="font:700 12px Nunito,system-ui,sans-serif;padding:6px 8px;border-radius:10px">'+GOD_CATCHES.map(([k,l])=>'<option value="'+k+'"'+((G.godCatch||'auto')===k?' selected':'')+'>'+l+'<\/option>').join('')+'<\/select>';
  w.querySelector('select').onchange=ev=>{G.godCatch=ev.target.value;};ft.prepend(w);}
function gpGodPickStep(e,dt){const gd=gpGod();if(!gd||!gd.picks||G.ballState!=='air'||e!==G.godPk)return false;
  const L=ballAt(G.air,Math.min(G.air.T,G.air.t+0.15)),dx=L.x-e.x,dy=L.y-e.y,d=Math.hypot(dx,dy)||1,s=Math.max(e.spd*1.6,d/Math.max(0.12,G.air.T-G.air.t));accel(e,dx/d*s,dy/d*s,dt,120);return true;}
function gpGodPickInit(){const gd=gpGod();G.godPk=null;if(!gd||!gd.picks||G.offTeam!==1||!G.air)return;
  const L=ballAt(G.air,G.air.T);let best=null,bd=1e9;for(const d of G.ents)if(d.side==='d'&&d.team===0&&!d.down&&d.role!=='DL'){const dd=Math.hypot(d.x-L.x,d.y-L.y);if(dd<bd){bd=dd;best=d;}}G.godPk=best;}
// ═══ pause menu (top left) + save replays as video ═══
function gpPaused(){return!!G.paused;}
function gpPause(on){
  if(on&&(G.phase==='over'||G.recVid))return;
  G.paused=on;const m=$('pauseMenu');if(m){m.hidden=!on;if(on)gpPauseRender('main');}
}
function gpPauseRender(view){
  const box=document.querySelector('#pauseMenu .pm');if(!box)return;
  const solo=!ON&&!(GP&&GP.practice);
  const B=(id,cls,label)=>`<button class="btn ${cls}" id="${id}">${label}<\/button>`;
  const seg=(key,opts)=>`<div class="pseg">${opts.map(([v,l])=>`<button class="${GDS[key]===v?'on':''}" data-k="${key}" data-v="${v}">${l}<\/button>`).join('')}<\/div>`;
  if(view==='settings'){
    box.innerHTML=`<h2>Settings<\/h2><div class="pset">
      <div class="prow"><span>Sound effects<\/span>${seg('sound',[[true,'On'],[false,'Off']])}<\/div>
      <div class="prow"><span>Volume<\/span><input type="range" min="0" max="1" step="0.05" value="${GDS.vol}" id="psVol"><\/div>
      <div class="prow"><span>Crowd noise<\/span>${seg('crowd',[[true,'On'],[false,'Off']])}<\/div>
      <div class="prow"><span>Marching band<\/span>${seg('band',[[true,'On'],[false,'Off']])}<\/div>
      <div class="prow"><span>Gameplay tips<\/span>${seg('tips',[[false,'Hidden'],[true,'Shown']])}<\/div>
      <div class="prow"><span>Ball size<\/span>${seg('ball',[[0.85,'S'],[1,'M'],[1.25,'L'],[1.5,'XL']])}<\/div>
      <div class="prow"><span>Your offense drives<\/span>${seg('dir',[['right','Right'],['left','Left'],['real','Switch each quarter']])}<\/div>
      <div class="prow"><span>Vibration<\/span>${seg('haptics',[[true,'On'],[false,'Off']])}<\/div>
      <div class="prow"><span>Kick returns<\/span>${seg('kr',[[true,'Play them'],[false,'Skip']])}<\/div>
      <div class="prow"><span>Scorebug<\/span>${seg('bug',[['tv','TV'],['slab','Slab'],['tower','Tower'],['mini','Mini'],['classic','Classic']])}<\/div>
      <div class="prow"><span>Camera<\/span>${seg('cam',[['wide','Wide'],['broadcast','Broadcast'],['tight','Tight']])}<\/div>
      <div class="prow"><span>Crowd noise meter<\/span>${seg('noiseM',[[true,'On'],[false,'Off']])}<\/div>
      <div class="prow"><span>Move buttons<\/span>${seg('moveUI',[['row','Row'],['wheel','Wheel']])}<\/div>
      <div class="prow"><span>Career camera<\/span>${seg('pcCam',[['close','Close'],['mid','Normal'],['wide','Wide']])}<\/div>
      <div class="prow"><span>Landing marker<\/span>${seg('land',[['pc','Career'],['all','Always'],['off','Off']])}<\/div>
      <div class="prow"><span>Mouse: click to tackle<\/span>${seg('clickTk',[[true,'On'],[false,'Off']])}<\/div>
      <div class="prow"><span>Graphics<\/span>${seg('gfx',[['auto','Auto'],['fast','Fast (slow phones)']])}<\/div>
      <div class="prow"><span>Fans in the stands<\/span>${seg('crowdV',[['full','Full'],['light','Light'],['off','Off']])}<\/div>
      <p style="margin:2px 0 0;font-size:12px;opacity:.8">Graphics and fans change from the next game.<\/p>
    <\/div><div class="pmb">${B('psControls','alt','Controls (touch, keyboard, controller)')}${B('psKeys','alt','Change keys')}${ON?'':B('psSl','alt','Difficulty sliders')}${B('psBack','go','Back')}<\/div>`;
    box.querySelectorAll('.pseg button').forEach(b=>b.onclick=()=>{const k=b.dataset.k;let v=b.dataset.v;v=v==='true'?true:v==='false'?false:isNaN(+v)?v:+v;GDS[k]=v;gdsSave();
      if(k==='dir'&&G.play&&G.phase!=='live'&&!ON)G.flip=gpFlipFor(G.offTeam);if(k==='bug')gpBugStyle();if(k==='cam'){camSet(v);try{fit();}catch(e){}}if(k==='sound'&&v)sndUnlock();gpPauseRender('settings');});
    $('psVol').oninput=e=>{GDS.vol=+e.target.value;gdsSave();};
    $('psControls').onclick=()=>gpPauseRender('controls');$('psKeys').onclick=()=>gpPauseRender('keys');if($('psSl'))$('psSl').onclick=()=>gpPauseRender('sliders');$('psBack').onclick=()=>gpPauseRender('main');return;
  }
  if(view==='sliders'){GDS.sl=GDS.sl||{u:{},c:{}};GDS.sl.u=GDS.sl.u||{};GDS.sl.c=GDS.sl.c||{};
    const v=(w,k)=>{const x=GDS.sl[w][k];return x==null?50:x;};
    box.innerHTML=`<h2>Difficulty sliders<\/h2><p style="margin:0 0 8px;font-size:13px">50 is normal. Strength and awareness change from the next game; the rest right away.<\/p>
      <div class="pset sls"><div class="prow"><span><\/span><b style="flex:1;text-align:center">You<\/b><b style="flex:1;text-align:center">CPU<\/b><\/div>
      ${SL_KEYS.map(([k,l])=>`<div class="prow"><span>${l}<\/span><input type="range" min="0" max="100" step="5" value="${v('u',k)}" data-w="u" data-k="${k}"><input type="range" min="0" max="100" step="5" value="${v('c',k)}" data-w="c" data-k="${k}"><\/div>`).join('')}
      <div class="prow"><span>Game speed<\/span><input type="range" min="0.75" max="1.25" step="0.05" value="${GDS.gspd||1}" id="psGs"><\/div><\/div>
      <div class="pmb">${B('psSlR','alt','Reset all to 50')}${B('psBack','go','Back')}<\/div>`;
    box.querySelectorAll('.sls input[data-k]').forEach(i=>i.oninput=()=>{GDS.sl[i.dataset.w][i.dataset.k]=+i.value;gdsSave();});
    $('psGs').oninput=e=>{GDS.gspd=+e.target.value;gdsSave();};
    $('psSlR').onclick=()=>{GDS.sl={u:{},c:{}};GDS.gspd=1;gdsSave();gpPauseRender('sliders');};$('psBack').onclick=()=>gpPauseRender('settings');return;}
  if(view==='keys'){box.innerHTML=`<h2>Keys<\/h2><p style="margin:0 0 8px">Click an action, then press the new key. Esc cancels.<\/p>${gpKeysHtml()}<div class="pmb">${B('psReset','alt','Reset to default')}${B('psBack','go','Back')}<\/div>`;
    gpKeysWire(box,()=>gpPauseRender('keys'));$('psReset').onclick=()=>{GDS.keys={};gdsSave();KB.wait=null;gpPauseRender('keys');};$('psBack').onclick=()=>{KB.wait=null;gpPauseRender('settings');};return;}
  if(view==='controls'){box.innerHTML=`<h2>Controls<\/h2>${gpControlsHtml()}<div class="pmb">${B('psBack','go','Back')}<\/div>`;$('psBack').onclick=()=>gpPauseRender('settings');return;}
  const mode=G.playMode||'all',mL={all:'Game mode: play everything',off:'Game mode: offense only (defense simmed)',def:'Game mode: defense only (offense simmed)'};
  box.innerHTML=`<h2>Paused<\/h2><div class="pmb">${B('pmResume','go','Resume')}
    ${solo&&G.q<=4?B('pmQtr','alt','Sim to end of quarter'):''}
    ${solo?B('pmCoach','alt',coachOn()?'Coach mode: ON (you call plays, the team plays)':'Coach mode: OFF'):''}
    ${solo?B('pmMode','alt',mL[mode]):''}
    ${B('pmSet','alt','Settings and controls')}
    ${B('pmSim','alt','Sim rest of game')}<\/div>`;
  $('pmResume').onclick=()=>gpPause(false);$('pmSim').onclick=()=>{gpPause(false);gpSimRest();};$('pmSet').onclick=()=>gpPauseRender('settings');
  if($('pmQtr'))$('pmQtr').onclick=()=>{gpPause(false);gpSimQuarter();};
  if($('pmCoach'))$('pmCoach').onclick=()=>{gpSetCoach(!coachOn());gpPauseRender('main');};
  if($('pmMode'))$('pmMode').onclick=()=>{G.playMode={all:'off',off:'def',def:'all'}[mode];gpPauseRender('main');};
}
function gpVidMime(){if(typeof MediaRecorder==='undefined')return null;
  for(const m of['video/mp4;codecs=avc1','video/mp4','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'])try{if(MediaRecorder.isTypeSupported(m))return m;}catch(e){}return null;}
function gpRecordReplay(){
  const R=(G.rec&&G.rec.frames&&G.rec.frames.length)?G.rec:G.lastRec;
  const mime=gpVidMime();if(!R||!R.frames.length){flash('No replay to save yet');return;}
  if(!mime||!cv.captureStream){flash('This browser cannot record video');return;}
  gpPause(false);
  const prevPhase=G.phase,onExit=G.replay?G.replay.onExit:null;if(G.replay)exitReplay();
  let stream,rec;const chunks=[];
  // v2.14: record at a lighter resolution (the phone was encoding a 2-3x retina canvas at 6 Mbps, which made the game stutter)
  // and keep the frame-rate watchdog from permanently lowering the graphics while the encoder is busy
  G.recPrev={cap:DPRCAP,qhi:QHI};DPRCAP=Math.min(DPRCAP,1.25);QHI=false;fit();
  const recRestore=()=>{const p=G.recPrev;G.recPrev=null;if(p){DPRCAP=p.cap;QHI=p.qhi;perfN=0;perfAvg=16;fit();}};
  try{stream=cv.captureStream(30);rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:3500000});}catch(e){recRestore();flash('Recording is not supported here');return;}
  rec.ondataavailable=ev=>{if(ev.data&&ev.data.size)chunks.push(ev.data);};
  rec.onstop=()=>{stream.getTracks().forEach(t=>t.stop());G.recVid=null;recRestore();
    const blob=new Blob(chunks,{type:mime.split(';')[0]}),ext=mime.indexOf('mp4')>=0?'mp4':'webm';
    const nm=((GP&&GP.teams?GP.teams[0].name+'-vs-'+GP.teams[1].name:'gridiron')+'-replay').replace(/[^\w-]+/g,'_')+'.'+ext;
    gpVidReady(blob,nm);};
  G.recVid={rec};
  startReplay(()=>{});G.replay.R=R;G.replay.i=0;G.replay.speed=0.6;G.replay.playing=true;G.replay.recording=true;
  $('rbar').classList.add('recording');$('rPlay').textContent='Recording…';
  rec.start(250);
}
function gpRecTick(){const P=G.replay,V=G.recVid;if(!V||!P||!P.recording)return;
  if(!P.playing){P.recording=false;setTimeout(()=>{try{V.rec.stop();}catch(e){}$('rbar').classList.remove('recording');exitReplay();},350);}}
function gpVidReady(blob,name){
  const el=$('vidReady');if(!el)return;G.vidBlob=blob;G.vidName=name;
  const mb=(blob.size/1048576).toFixed(1);$('vrInfo').textContent=`${name} · ${mb} MB`;
  let canShare=false;try{canShare=!!(navigator.canShare&&navigator.canShare({files:[new File([blob],name,{type:blob.type})]}));}catch(e){}
  $('vrShare').hidden=!canShare;el.hidden=false;
}
async function gpVidShare(){const b=G.vidBlob,n=G.vidName;if(!b)return;
  try{await navigator.share({files:[new File([b],n,{type:b.type})],title:'Gridiron replay'});$('vidReady').hidden=true;}
  catch(e){if(e&&e.name==='AbortError')return;flash('Sharing is blocked here, saving the file instead');gpVidDownload();}}
function gpVidDownload(){const b=G.vidBlob,n=G.vidName;if(!b)return;
  try{if(window.parent&&window.parent!==window&&window.parent.gdSaveFile){window.parent.gdSaveFile(n,b);$('vidReady').hidden=true;return;}}catch(e){}
  const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=n;document.body.appendChild(a);a.click();setTimeout(()=>{a.remove();URL.revokeObjectURL(a.href);},800);$('vidReady').hidden=true;}

function gpSimRest(){
  if(G.phase==='over')return;if(G.phase==='intro'||document.getElementById('gpPrev'))gpIntroSkip();
  // v2.16: this run replaces any quarter or drive simulation still going, so none of them hands control back halfway
  const tok=G.simTok=(G.simTok||0)+1;G.simming=false;G.simQtr=false;G.simAuto=false;hide('simBox');
  G.ai=[true,true];G.noDraw=true;G.gpFast=true;
  const go=()=>{if(G.simTok!==tok)return;for(let i=0;i<900;i++){const m=$('modal');if(m&&!m.hidden){const b=$('mB').querySelector('button');if(b)b.click();}if(G.phase==='call')openCall();step(1/30);if(G.phase==='over')return;}setTimeout(go,0);};go();
}
window.gpSimRest=gpSimRest;
// v2.14 sim the rest of the current quarter (the game hands control back at the next quarter, or at halftime)
function gpSimQuarter(){
  if(G.phase==='over'||G.q>4||ON||G.simming)return;
  if(G.phase==='intro'||document.getElementById('gpPrev'))gpIntroSkip();
  const q0=G.q,prevAI=[...G.ai],sc0=[...G.score],tok=G.simTok=(G.simTok||0)+1;
  G.ai=[true,true];G.noDraw=true;G.simQtr=true;
  $('simTitle').textContent=`Simulating the rest of the ${SEVENS()?qLbl(q0).toLowerCase():['1st','2nd','3rd','4th'][q0-1]+' quarter'}…`;$('simList').innerHTML='';$('simSum').textContent='';$('simGo').hidden=true;show('simBox');
  const done=()=>{
    if(G.simTok!==tok)return;
    G.simQtr=false;G.ai=prevAI;G.noDraw=false;G.drivePoss=null;
    const pts=[G.score[0]-sc0[0],G.score[1]-sc0[1]];
    $('simTitle').textContent=G.phase==='over'?'Final':'Quarter simulated';
    $('simSum').textContent=`${pts[0]||pts[1]?`Points: ${G.teams[0].name} +${pts[0]}, ${G.teams[1].name} +${pts[1]}. `:'No points. '}Score: ${scoreLine()}.`;
    $('simGo').hidden=false;
    $('simGo').onclick=()=>{hide('simBox');updateHUD();if(G.phase==='over')return;
      // the next quarter's first play was already called by the simulation: let the coach call it again,
      // or (offense-only / defense-only games) simulate the other side's drive like any other
      if((G.phase==='presnap'&&G.play&&G.play.kind==='scrimmage'||G.phase==='call')&&!G.conv){G.drivePoss=G.poss;G.offTeam=G.poss;if(!ON&&gpAutoSimDrive()){startSim(true);return;}G.phase='call';openCall();return;}
      if(G.phase==='call')openCall();};
  };
  const go=()=>{
    if(G.simTok!==tok)return;
    for(let i=0;i<900;i++){
      const m=$('modal');if(m&&!m.hidden){if(G.q!==q0){done();return;}const b=$('mB').querySelector('button');if(b)b.click();}
      if(G.q!==q0||G.phase==='over'){done();return;}
      if(G.phase==='call')openCall();
      step(1/30);
    }
    setTimeout(go,0);};
  go();
}
function slotPlayer(T,slot){return T.get(T.lineup[slot]);}
function healthy(p){return!p.inj;}
function autoSubs(T){
  for(const set of[OSLOTS,DSLOTS]){
    const inUse=new Set(set.map(([s])=>T.lineup[s]));
    for(const[s,pos]of set){
      const cur=slotPlayer(T,s);
      const mids=new Set(set.map(([x])=>{const q=T.get(T.lineup[x]);return q&&q.mid;}).filter(m=>m!=null));
      const pool=T.byPos(pos).filter(p=>healthy(p)&&!inUse.has(p.id)&&!(p.mid!=null&&mids.has(p.mid)));
      if(!healthy(cur)){
        const r=pool.sort((a,b)=>b.stamina-a.stamina)[0];if(r){inUse.delete(cur.id);T.lineup[s]=r.id;inUse.add(r.id);}
        continue;
      }
      const dep=p=>p.dep!=null&&p.pos===pos; // a depth-chart starter (from the app)
      // the depth chart's quarterback gets his job back once he is healthy again
      if(s==='QB'&&T.auto&&!(T.lock&&T.lock[s])&&!dep(cur)){const b=pool.filter(dep).sort((a,b)=>a.dep-b.dep)[0];if(b){inUse.delete(cur.id);T.lineup[s]=b.id;inUse.add(b.id);}continue;}
      if(!T.auto||s==='QB'||(T.lock&&T.lock[s]))continue;
      if(cur.stamina<52){
        const r=pool.filter(p=>p.stamina>78).sort((a,b)=>b.ovr-a.ovr)[0];
        if(r){inUse.delete(cur.id);T.lineup[s]=r.id;inUse.add(r.id);}
      }else if(dep(cur)){
        // he keeps his spot while he has legs
      }else{
        const back=pool.filter(p=>dep(p)&&p.stamina>80).sort((a,b)=>a.dep-b.dep)[0];
        const better=back||pool.filter(p=>p.stamina>88&&p.ovr>cur.ovr+2).sort((a,b)=>b.ovr-a.ovr)[0];
        if(better){inUse.delete(cur.id);T.lineup[s]=better.id;inUse.add(better.id);}
      }
    }
  }
}
