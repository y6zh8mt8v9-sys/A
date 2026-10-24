/* ===================== main loop ===================== */
// v2.16 device-aware quality: phones get a resolution they can hold in memory (iPhones were reloading after long games)
const GP_UA=navigator.userAgent||'',GP_IOS=/iPhone|iPad|iPod/.test(GP_UA)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),GP_AND=/Android/i.test(GP_UA),
  GP_LOW=(navigator.deviceMemory||8)<=4||(navigator.hardwareConcurrency||8)<=4;
let DPRCAP=GDS.gfx==='fast'?1:GP_AND?(GP_LOW?1.25:1.75):GP_IOS?2:2.5;
let last=performance.now();
let perfAvg=16,perfN=0;
function frame(now){
  const raw=(now-last);const dt=Math.min(0.033,Math.max(0,raw/1000));last=now;
  if(raw>0&&raw<200&&!G.recVid){perfAvg=perfAvg*0.95+raw*0.05;perfN++;
    if(perfN>90&&perfAvg>21){perfN=0;perfAvg=16;if(QHI)QHI=false;else if(DPRCAP>1){DPRCAP=Math.max(1,DPRCAP-0.5);fit();}}}
  // the title-screen demo runs at 30 fps and low resolution so the menus stay smooth on slower PCs and Chromebooks
  if(G.demo){if(!G._dfit){G._dfit=1;fit();}G._dacc=(G._dacc||0)+dt;G._dfr=(G._dfr||0)+1;if(G._dfr%2){requestAnimationFrame(frame);return;}const d2=Math.min(0.066,G._dacc);G._dacc=0;
    if(d2>0&&G.demo.state!=='warm')try{step(d2);}catch(err){console.error(err);}requestAnimationFrame(frame);return;}
  if(dt>0&&!(G.demo&&G.demo.state==='warm'))try{step(dt*gspd());gpErrRun=0;}catch(err){console.error(err);gpStepErr(err);}
  requestAnimationFrame(frame);
}
// an error that repeats every frame used to freeze Game Day (it looked like a crash): it is logged once, and if the
// game cannot get past it the rest is simulated so the result and the season are kept
let gpErrRun=0,gpErrSeen={};
function gpStepErr(err){gpErrRun++;const m=String(err&&err.message||err).slice(0,200);
  if(!gpErrSeen[m]){gpErrSeen[m]=1;try{if(window.parent&&window.parent!==window&&window.parent.gpErrLog)window.parent.gpErrLog(m,err&&err.stack,'gameday-step');}catch(_){}}
  if(gpErrRun===150&&!G.demo&&!G.client&&G.phase!=='over'){try{flash('Game Day hit a problem. Simulating the rest so your game counts.');}catch(_){}
    setTimeout(()=>{try{gpSimRest();}catch(e2){try{if(window.parent&&window.parent.gpErrLog)window.parent.gpErrLog('sim fallback failed: '+e2.message,e2.stack,'gameday-step');}catch(_){}}},600);}}
function clockTicks(){if(GP&&GP.practice)return false;return G.clockRun&&G.q<=4&&!G.conv&&!(G.play&&G.play.kind==='xp');}
function step(dt){
  if(G.client){olClientStep(dt);return;}
  if(G.paused)return;
  G.time+=dt;
  try{gpSideStep(dt);}catch(e){}
  try{gpNoiseStep(dt);}catch(e){}
  try{sndStep(dt);gpNervesFx(dt);}catch(e){}
  gpHideDefense();try{gpPassBtnTick();}catch(e){}try{gpSevensTick();}catch(e){}
  if(G.phase==='replay'){
    const P=G.replay;if(P.playing){P.i+=dt*30*P.speed;if(P.i>=P.R.frames.length-1){P.i=P.R.frames.length-1;P.playing=false;$('rPlay').textContent='Play again';if(P.demo)P.doneAt=G.time;}}
    if(P.demo&&!P.playing&&G.time-(P.doneAt||G.time)>0.7){gpDemoNext();return;}
    const F=recGet(P.R,Math.floor(P.i));G.camY=F.camY;G.anch=F.anch;gpFcStep(P,dt);drawScene(F);updateHUD();gpRecTick();return;
  }
  if(G.phase==='presnap'){
    meterStep(dt);
    if(clockTicks()){G.clock-=dt;if(G.clock<=0){G.clock=0;hide('meter');G.meter=null;setTray('none');$('ctl').innerHTML='';G.phase='dead';proceed();return;}}
    if(G.play.kind==='scrimmage'){
      G.playClock-=dt;
      const aiO=isAI(G.offTeam)||G.test||pcAIQB();
      if(G.motion){gpMotionStep(dt);if(G.phase!=='presnap')return;}
      else if(aiO){G.snapIn-=dt;if(G.snapIn<=0){if(gpNoiseFS())return;doSnap();}}
      else if(G.playClock<=0){setTray('none');preSnapFoul(G.offTeam,'Delay of game',5);}
    }else{
      const kicker=G.play.kind==='kickoff'?G.play.kickTeam:G.play.kind==='punt'?G.play.puntTeam:G.offTeam;
      if(isAI(kicker)||G.test||(pcOn()&&!G.meter)){G.snapIn-=dt;if(G.snapIn<=0)doSnap();}
      else if(G.rmeter&&G.time-G.rmeter.at>40){G.rmeter=null;doSnap();} // the other player never kicked: the kicker does it himself
      // v2.16 the play clock runs on kicks too: let it expire before starting the kick and it is delay of game, 5 yards back
      else if(!ON&&!(GP&&GP.practice)){G.playClock-=dt;if(G.playClock<=0&&(!G.meter||G.meter.stage==='power')){gpKickDelay();return;}}
    }
    for(const e of G.ents){if(!e.subIn&&!e.inMotion){e.vx=0;e.vy=0;}}
  }else if(G.phase==='live'){
    userJoyStep();try{gpPocketStep();}catch(e){G.pocketV=null;}
    updateLive(dt);
    if(clockTicks()){G.clock=Math.max(0,G.clock-dt);}
  }else if(G.phase==='intro'){gpIntroStep(dt);
  }else if(G.phase==='dead'){
    for(const e of G.ents){if(!e.tdLand)continue;
      if(e.dive>0){e.dive-=dt;if(e.dive<=0){e.dive=0;e.down=true;e.downAnim='catch_dive';e.downT=1.15;e.guDur=0.7;e.downAt=G.time;dust(e.x,e.y,12);}}
      else if(e.down&&e.downT>0){e.downT-=dt;if(e.downT<=0){e.down=false;e.tdLand=false;if(e.celebQ){const q=e.celebQ;e.celebQ=null;startCeleb(e,q);}}}
      else e.tdLand=false;}
    for(const e of G.ents){if(e.celeb)continue;const f=Math.exp(-dt*(e.down?12:5));e.vx*=f;e.vy*=f;e.x+=e.vx*dt;e.y=clamp(e.y+e.vy*dt,-0.3,120.3);e.anim+=Math.hypot(e.vx,e.vy)*dt*2.1;}
    celebStepAll(dt);try{gpFightStep(dt);}catch(e){G.fight=null;}
    if(G.celebPick&&!G.celebPick.celeb&&G.time>G.celebAuto)startCeleb(G.celebPick,pick(TD_CELEBS)[0]);
    refsStep(dt);
    if(clockTicks())G.clock=Math.max(0,G.clock-dt);
    // v2.16: the clock after a touchdown waits while you pick a celebration
    if(G.after){if(!(G.celebPick&&!G.celebPick.celeb))G.after.t-=dt;if(G.after.t<=0){const fn=G.after.fn;G.after=null;fn();}}
  }
  if(G.rec&&(G.phase==='live'||(G.phase==='dead'&&G.time<G.recStop)))recordFrame();
  for(const e of G.ents)updateFacing(e);for(const r of G.refs)updateFacing(r);
  updAnims(dt);
  if(G.cheer>0)G.cheer-=dt;
  updParts(dt);try{gpHelmetsStep(dt);}catch(e){}camera(dt);
  if(!G.noDraw||ON){const F=frameData(false);if(!G.noDraw){drawScene(F);updateHUD();}if(ON)olHostTick(F);}
}
function fit(){
  const st=$('stage'),wr=$('wrap'),cw=st.clientWidth,ch=st.clientHeight;
  if(!(cw>0&&ch>0))return;
  const land=cw/ch>=1.3;
  W=land?clamp(Math.round(H*cw/ch),470,1100):640;
  if(BGC.width!==W)BGC.width=W;
  const s=Math.min(cw/W,ch/H);
  document.body.classList.toggle('full',land);
  SC=s;DPR=Math.min(DPRCAP,window.devicePixelRatio||1,Math.max(0.75,2200/Math.max(1,W*s)));if(G.demo)DPR=Math.min(DPR,1);  // a 4K or high-DPI monitor no longer draws a 4,000-pixel-wide field
  wr.style.width=W*s+'px';wr.style.height=H*s+'px';wr.style.setProperty('--s',s.toFixed(3));
  cv.width=Math.round(W*s*DPR);cv.height=Math.round(H*s*DPR);
}

/* ===================== game start ===================== */
function newGame(){
  PID=0;G.teams=GP?[gpTeam(0,GP.teams[0]),gpTeam(1,GP.teams[1])]:[mkTeam(0,'Harbor','Gulls','HAR'),mkTeam(1,'Ironwood','Elk','IRN')];G.st={};G.played={};G.splits=null;G.gpDone=false;
  Object.assign(G,{score:[0,0],q:1,clock:QLEN,clockRun:false,restartReady:false,to:[3,3],poss:0,los:25,down:1,toGo:10,next:null,conv:null,ot:null,
    stats:[{yds:0,to:0,pass:0,rush:0},{yds:0,to:0,pass:0,rush:0}],lastRec:null,rec:null,uSlot:null,cele:null,replay:null,started:false,koPen:null,gs:{},drivePoss:null});
  if(SEVENS())G.q=s7Q()===1?4:2;
  G.offTeam=0;setupScrimmage({kind:'pass',data:PASSES[1]},DCALLS[3]);G.phase='menu';
  const[wx,wy]=toW(0,G.linesW.los);G.camY=wy+3.5;
  if(G.test){G.openRecv=Math.random()<0.5?0:1;G.kickTeam=1-G.openRecv;G.next='kickoff';nextSnap();return;}
  if(GP&&GP.practice){gpPracticeStart();return;}
  if(G.client){G.phase='net';return;}
  try{gpSliderBake();}catch(e){}
  if(GP&&!ON&&GP.mode){const m=GP.mode;G.playMode=m==='off'||m==='def'?m:'all';if(m==='coach')gpSetCoach(true);}
  if(ON){gpIntro(()=>olToss());return;}
  gpIntro(()=>showModal(G.teams[0].name===G.teams[1].name?(G.teams[0].city+' '+G.teams[0].name+' vs '+G.teams[1].city+' '+G.teams[1].name):(G.teams[0].name+' vs '+G.teams[1].name),'Two-minute quarters, eleven on eleven. Call the coin toss.',[['Heads','go',()=>toss(0)],['Tails','alt',()=>toss(1)]]));
}
function gpSliderBake(){if(ON||G.test||G.demo||DEMO)return;
  for(const T of G.teams)for(const p of T.roster){const ds=sla(T.id,'str',15),di=sla(T.id,'iq',15);if(ds)p.str=clamp(Math.round((p.str||70)+ds),25,99);if(di)p.awr=clamp(Math.round((p.awr||70)+di),25,99);}}
function toss(call){
  const res=Math.random()<0.5?0:1,win=res===call;
  const start=recv=>{G.openRecv=recv;G.kickTeam=1-recv;G.kickSpot=35;G.next='kickoff';nextSnap();};
  if(win)showModal('You won the toss',`It's ${res?'tails':'heads'}. Receive the opening kickoff or kick?`,[['Receive','go',()=>start(0)],['Kick','alt',()=>start(1)]]);
  else showModal(G.teams[1].name+' win the toss',`It's ${res?'tails':'heads'}. The ${G.teams[1].name} defer, so you receive the opening kickoff.`,[['Take the field','go',()=>start(0)]]);
}
/* ===================== v2.03 ONLINE HEAD-TO-HEAD (Game Day side) =====================
   The host runs the real game. Both teams are human: the host's input drives G.me, the guest's commands arrive as
   messages and are applied with G.act set to the guest's team. The host streams compact frames of what it draws
   (entity positions and animation frames, ball, camera, scoreboard state); the guest draws them with the same
   renderer, interpolating between frames, and sends back its play calls, taps, swipes, stick and button presses.
   The page around the frame (main window) owns the connection: window.parent.olGdSend(type,data) sends,
   and it calls olRecv(type,data) here for everything that arrives. */
const OL={nk:0,list:[],lastSend:0,lastFull:0,needFull:true,sent:new Map(),stSent:new Map(),idk:'',asks:{},askN:0,askLast:null,
  callOpen:false,callMode:null,co:null,cd:null,callDone:null,routesKey:'',rate:20,
  // guest side
  es:new Map(),cur:new Map(),ids:[],buf:[],off:null,offS:[],ow:0.05,s:null,uiKey:'',kickSent:false,kneelOK:false,routes:null,
  cmP:null,imP:null,joyLast:null,joyAt:0,infoOpen:false,askId:null,lastF:null,recOn:false,recPh:''};
function olSend(type,data){try{if(window.parent&&window.parent.olGdSend)window.parent.olGdSend(type,data);}catch(e){}}
function olEvt(type,data){if(ON&&!G.client)olSend(type,data);}
function olCmd(k,data){if(!G.client)return;olSend('cmd',Object.assign({},data||{},{k}));}
const olR2=v=>Math.round(v*20),olR3=v=>Math.round(v*1000)/1000;
function olOpp(){return 1-G.me;}
function olWith(team,fn){const p=G.act;G.act=team;try{return fn();}finally{G.act=p;}}
function olNk(e){return e.nk||(e.nk=++OL.nk);}
// a pill at the top of the screen while this device waits on the other player
function olWait(txt){let el=document.getElementById('olWait');
  if(!txt){if(el)el.remove();return;}
  if(!el){el=document.createElement('div');el.id='olWait';el.setAttribute('role','status');
    el.style.cssText='position:fixed;left:50%;top:calc(8px + env(safe-area-inset-top));transform:translateX(-50%);z-index:70;padding:7px 16px;border-radius:8px;font:800 13px Nunito,system-ui,sans-serif;color:#0d2a43;background:linear-gradient(180deg,#fff,#dff1fd);border:1px solid rgba(13,42,67,.25);box-shadow:0 6px 18px rgba(0,0,0,.3);pointer-events:none;max-width:92vw;text-align:center';
    document.body.appendChild(el);}
  el.textContent=txt;}
function olKickWait(){if(G.client){const s=OL.s;return s&&s.kw!=null?s.kw:null;}return G.rmeter?G.rmeter.team:G.meter?G.me:null;}
function olFair(){if(G.client)olCmd('fair');G.fair=true;setCtl();}
function olKneel(){if(G.client){olCmd('kneel');return;}gpKneelNow(G.carrier);}
// a kick returner who takes a knee in the end zone gets a touchback; once he is out of it he is down where he kneels (it used to be a touchback from anywhere)
function gpKneelNow(c){if(!c||c!==G.carrier||G.phase!=='live'||G.ballState!=='carrier'||!(G.kneelOK>0)||!G.play||G.play.kind!=='kickoff'||c.side!=='o')return;
  if(c.y<10){c.kneel=true;return;}c.down=true;c.downAnim='tackled';c.vx=c.vy=0;flash('He takes a knee');endPlay({type:'tackle',spot:c.y});}
function olScrambling(){const s=OL.s;return!!(s&&s.scr&&G.offTeam===G.me&&G.phase==='live');}
function olGameOver(){olWait(null);}

/* ---------------- host: decisions, play calls, coin toss ---------------- */
// online, nobody can stall the game: a question that goes unanswered takes its first choice after 30 seconds
function olAsk(team,title,text,opts,cb){
  if(!ON||team===G.me||G.test){showModal(title,text,opts.map((o,i)=>[o[0],o[1],()=>cb(i)]));if(ON&&!G.test)olAutoGo(30);return;}
  if(G.phase!=='over'&&G.phase!=='decide')G.phase='modal';
  const id=++OL.askN;OL.asks[id]=cb;OL.askLast={id,title,text,opts:opts.map(o=>o[0])};
  olEvt('ask',OL.askLast);olWait(`Waiting for ${G.teams[team].city||''} ${G.teams[team].name}…`.trim());
  setTimeout(()=>{if(OL.asks[id]){olEvt('askx',{id});olAnswer(id,0);}},30000);
}
function olAnswer(id,i){const cb=OL.asks[id];if(!cb)return;delete OL.asks[id];OL.askLast=null;olWait(null);cb(Math.max(0,i|0));}
function olInfo(title,text){if(ON&&!G.client)olEvt('info',{title,text});}
function olAutoGo(sec){const t=$('mT').textContent,s=$('mS').textContent;setTimeout(()=>{if(!$('modal').hidden&&$('mT').textContent===t&&$('mS').textContent===s){const b=$('mB').querySelector('button');if(b)b.click();}},sec*1000);}
function olToss(){
  const caller=1-(GP.home||0),T=G.teams;
  olAsk(caller,'Coin toss',`${T[caller].city} ${T[caller].name}, the away team calls it in the air.`,[['Heads','go'],['Tails','alt']],call=>{
    const res=Math.random()<0.5?0:1,win=res===call?caller:1-caller;
    const start=recv=>{G.openRecv=recv;G.kickTeam=1-recv;G.kickSpot=35;G.next='kickoff';nextSnap();};
    flash(`It's ${res?'tails':'heads'}. ${T[win].name} win the toss`);
    olAsk(win,`${T[win].name} win the toss`,`It's ${res?'tails':'heads'}. Receive the opening kickoff or kick?`,[['Receive','go'],['Kick','alt']],i=>start(i===0?win:1-win));
  });
}
function olOpenCall(){
  const off=G.offTeam,R=olOpp();OL.co=null;OL.cd=null;OL.callOpen=true;OL.callMode=off===R?'off':'def';
  const special=o=>o&&['punt','fg','kneel','spike'].includes(o.kind);
  OL.callDone=()=>{const o=OL.co,d=OL.cd;if(!OL.callOpen||!o||(!d&&!special(o)))return;
    OL.callOpen=false;clearTimeout(OL.callT);olWait(null);hide('call');hide('subs');olEvt('callx',1);applyCall(o,d||DCALLS[3]);};
  OL.mine=false;
  showCall(off===G.me?'off':'def',v=>{OL.mine=true;if(off===G.me)OL.co=v;else OL.cd=v;
    if(OL.callOpen&&!(OL.co&&(OL.cd||special(OL.co))))olWait('Waiting for your opponent to call a play…');OL.callDone();});
  olEvt('call',{mode:OL.callMode});olRoster();
  // a 35-second play clock on the call screen: whoever has not called a play gets one from the coordinator
  clearTimeout(OL.callT);OL.callT=setTimeout(()=>{if(!OL.callOpen)return;if(!OL.co)OL.co=aiOffCall();if(!OL.cd)OL.cd=aiDefCall();flash('Play called automatically');OL.callDone();},35000);
}
function olRoster(){const T=G.teams[olOpp()];if(!T)return;
  olEvt('ros',{p:T.roster.map(p=>[p.id,Math.round(p.stamina),p.inj?p.inj.type:0]),l:T.lineup,a:T.auto?1:0});}
// the guest reconnected: send it everything it needs to pick up where the game is
function olResync(){OL.needFull=true;OL.stSent.clear();OL.sent.clear();OL.idk='';OL.routesKey='';
  if(OL.askLast)olEvt('ask',OL.askLast);if(OL.callOpen&&!(G.offTeam===olOpp()?OL.co:OL.cd))olEvt('call',{mode:OL.callMode});olRoster();}

/* ---------------- host: the guest's commands ---------------- */
function olRemote(m){
  if(!m||typeof m.k!=='string'||G.phase==='over')return;
  const R=olOpp(),k=m.k,num=(v,d)=>{v=+v;return isFinite(v)?v:d;};
  olWith(R,()=>{
    switch(k){
      case 'call':{if(!OL.callOpen||!m.v||typeof m.v!=='object')return;
        if(m.mode==='off'&&G.offTeam===R)OL.co=m.v;else if(m.mode==='def'&&G.offTeam!==R)OL.cd=m.v;else return;OL.callDone();return;}
      case 'ans':olAnswer(m.id,m.i);return;
      case 'snap':if(G.phase==='presnap'&&G.play&&G.play.kind==='scrimmage'&&G.offTeam===R)doSnap();return;
      case 'kick':{const M=G.rmeter;if(!M||G.phase!=='presnap'||M.team!==R)return;const P=G.play,kk=P.kind==='kickoff'?P.kicker:P.kind==='punt'?P.punter:P.kicker;
        P.kres=kickResult(kk,clamp(num(m.p,0.8),0,1),clamp(num(m.a,0),-1,1));G.rmeter=null;doSnap();return;}
      case 'throw':{if(!passingUser())return;const dx=num(m.dx,0),dy=num(m.dy,1),l=Math.hypot(dx,dy)||1;
        G.aim={run:false,dx:dx/l,dy:dy/l,D:clamp(num(m.D,10),4,gpMaxD())};const b0=G.bullet,l0=G.lob;G.bullet=!!m.b;G.lob=!!m.l;userThrow();G.aim=null;G.bullet=b0;G.lob=l0;return;}
      case 'throwr':{if(!passingUser())return;const T=gpThrowTargets(),i=T.findIndex(e=>e.nk===m.n&&e.team===R);if(i<0)return;const b0=G.bullet,l0=G.lob;G.bullet=!!m.b;G.lob=!!m.l;gpKeyThrow(i,!!m.ld);G.bullet=b0;G.lob=l0;return;}
      case 'scr':if(passingUser())scramble();return;
      case 'repass':if(gpScrambling()&&G.offTeam===R){G.carrier=null;G.ballState='qb';G.qb.scrT=G.t;setCtl();}return;
      case 'mv':{if(!userCarrier())return;const f={juke:()=>tryJuke(Math.sign(num(m.d,1))||1),spin:trySpin,stiff:tryStiff,truck:tryTruck,hurdle:tryHurdle,dive:tryDive,slow:trySlow}[m.mv];
        if(f)f();return;}
      case 'tackle':if(G.uctl&&G.uctl.team===R)userTackle();return;
      case 'switch':if(gpDefending(R))switchUser();return;
      case 'pick':{const live=G.phase==='live'&&gpDefending(R);if(!live&&(G.phase!=='presnap'||!G.play||G.play.kind!=='scrimmage'||G.offTeam===R))return;
        const e=G.ents.find(x=>x.nk===m.n&&x.team===R&&!x.down&&(live?!['K','P','H'].includes(x.role):['LB','CB','NB','S'].includes(x.role)));if(e){G.uctl=e;if(['LB','CB','NB','S'].includes(e.role))G.uSlotT[R]=e.slot;setCtl();}return;}
      case 'joy':{const v=Array.isArray(m.v)?m.v:[0,0],x=num(v[0],0),y=num(v[1],0),l=Math.hypot(x,y);
        G.rjoy={v:l>0.001?[x/l,y/l]:[0,0],m:clamp(num(m.m,0),0,1),t:G.time};return;}
      case 'cm':{const M=G.cm,a=G.air;if(!M||!M.target||M.target.team!==R||M.tapped!=null||G.ballState!=='air'||!a)return;
        const u=clamp(num(m.u,0),0,1);M.tapped=u;M.result=u>=M.g0&&u<=M.g1?'PERFECT':(u>=M.g0-M.yw&&u<=M.g1+M.yw)?'GOOD':u<M.g0?'EARLY':'LATE';return;}
      case 'im':{const M=G.im,a=G.air,U=M&&M.def;if(!M||!U||U.team!==R||M.tapped!=null||G.ballState!=='air'||!a)return;
        const u=clamp(num(m.u,0),0,1);M.tapped=u;M.result=u>=M.g0&&u<=M.g1?'PERFECT':(u>=M.g0-M.yw&&u<=M.g1+M.yw)?'GOOD':'MISS';U.catchT=Math.max(0.4,a.T-a.t+0.25);return;}
      case 'to':if(G.to[R]>0&&(G.phase==='presnap'||G.phase==='call')&&G.q<=5)callTimeout(R);return;
      case 'aud':{if(G.phase!=='presnap'||G.offTeam!==R||typeof m.name!=='string'||!ROUTES[m.name])return;const e=(G.recv||[]).find(x=>x.nk===m.n&&x.team===R);if(e)gpAudible(e,m.name);return;}
      case 'celeb':{const c=G.celebPick,t=TD_CELEBS.find(x=>x[0]===m.c);if(c&&t&&c.team===R&&!c.celeb)startCeleb(c,t[0]);return;}
      case 'fair':{const P=G.play;if(G.phase==='live'&&P&&P.kind==='punt'&&G.offTeam===R&&['kick','punter','snap'].includes(G.ballState))G.fair=true;return;}
      case 'kneel':if(G.carrier&&G.carrier.team===R)gpKneelNow(G.carrier);return;
      case 'sub':{const T=G.teams[R];if(!T||!m.l||typeof m.l!=='object')return;
        for(const s in m.l){if(!(s in T.lineup))continue;const p=T.get(+m.l[s]);if(p&&!p.inj)T.lineup[s]=p.id;}
        T.auto=!!m.a;T.lock={};if(m.k&&typeof m.k==='object')for(const s in m.k)if(s in T.lineup)T.lock[s]=1;return;}
      case 'ping':olEvt('pong',{t:m.t});return;
    }
  });
}

/* ---------------- host: streaming what it draws ---------------- */
// static part of an entity (sent once, again only if it changes): which player / sprite sheet it is
function olStaticOf(e,S){
  const pk=S.pk||{},o={t:e.team,r:e.role||'',s:e.slot||'',d:e.side||'',sh:pk.sheet||'',sk:pk.skin==null?1:pk.skin,bd:pk.build||'',pt:pk.team==null?0:pk.team};
  if(e.pl)o.p=e.pl.id;else{o.lk=S.look;o.bo=S.body;o.cp=S.cap;}
  return o;
}
function olDyn(k,S){
  const pk=S.pk||{};
  const f=(S.mark==='c'?1:0)|(S.mark==='u'?2:0)|(S.stun?4:0)|(S.hurt?8:0)|(S.fade?16:0)|(S.qbBall?32:0)|(S.flat?64:0);
  return[k,olR2(S.wx),olR2(S.wy),S.dir<0?-1:1,Math.round((S.jz||0)*100),Math.round((S.rot||0)*100),Math.round((S.sq==null?1:S.sq)*100),pk.anim||'',pk.frame|0,f];
}
function olBallOut(b){if(!b)return null;const o=[olR2(b.wx),olR2(b.wy),Math.round((b.h||0)*100),b.k||'',b.q!=null?Math.round(b.q*100):70];if(b.n)o.push([olR2(b.n[0]),olR2(b.n[1]),Math.round(b.n[2]*100)]);return o;}
function olState(){
  const c=G.carrier,u=G.uctl,P=G.play,R=olOpp(),a=G.air;
  const s={ph:G.replay?G.replay.prev:G.phase,sc:G.score,q:G.q,ck:Math.round(G.clock*10),cr:G.clockRun?1:0,pc:Math.round((G.playClock||0)*10),dn:G.down,tg:G.toGo,lo:G.los,po:G.poss,of:G.offTeam,to:G.to,
    fp:G.flip?1:0,bs:G.ballState,ce:G.cele==null?null:G.cele,ch:Math.round((G.cheer||0)*10)/10,cv:G.conv?{t:G.conv.team,two:G.conv.two?1:0}:0,ot:G.ot?G.ot.round:0,
    pk:P?P.kind:null,pok:P&&P.off?P.off.kind:null,sp:P&&P.special?P.special:0,pt:G.pendThrow?1:0,
    car:c?[olNk(c),c.team]:0,uc:u?[olNk(u),u.team]:0,qb:G.qb?olNk(G.qb):0,fa:G.fair?1:0,kn:G.kneelOK>0?1:0,
    scr:G.phase==='live'&&gpScrambling()?1:0,cp:G.celebPick&&!G.celebPick.celeb&&G.celebPick.team===R?1:0,kw:olKickWait()};
  if(G.rmeter&&G.phase==='presnap'){const M=G.rmeter;s.km={D:M.D||0,per:M.per||1,pper:M.pper||1.3,tol:M.tol||0,ctr:M.ctr||0,w:G.wind||0};}
  if(a&&G.ballState==='air'){s.air=[Math.round(a.t*1000),Math.round(a.T*1000)];
    const M=G.cm;if(M&&M.target&&M.target.team===R&&!M.doneAt)s.cm={n:olNk(M.target),g0:olR3(M.g0),g1:olR3(M.g1),yw:olR3(M.yw),df:olR3(M.diff),nd:M.need?1:0};
    const I=G.im;if(I&&I.def&&I.def.team===R&&!I.doneAt)s.im={n:olNk(I.def),g0:olR3(I.g0),g1:olR3(I.g1),yw:olR3(I.yw),c:olR3(I.c),a0:Math.round(I.a0*1000)};}
  return s;
}
// the guest's routes before the snap, in field (world) coordinates, built the same way drawRoutes builds them
function olRouteGeom(){
  if(G.phase!=='presnap'||!G.play||G.play.kind!=='scrimmage'||G.offTeam!==olOpp())return null;
  const out=[],W2=(x,y)=>{const[wx,wy]=toW(x,y);return[olR2(wx),olR2(wy)];};
  const MO=G.play.off.data&&G.play.off.data.mo,mm=G.moMan;
  if(MO&&mm&&G.play.off.kind==='run'){const ly=G.linesW.los;let ex,ey;
    if(G.motion&&G.motion.e===mm){ex=G.motion.tx;ey=mm.y;}else if(!G.moDone){const[tx,td]=gpMoEnd(mm.hx,ly-mm.hy,MO.k);ex=tx;ey=ly-td;}
    if(ex!=null)out.push({d:[W2(mm.x,mm.y),W2(ex,ey)]});}
  for(const e of G.recv||[]){const r=e.route;if(!r)continue;let pts=[{x:e.hx,y:e.hy},...r.pts];
    if(e===G.moMan&&G.play.off.data.mo){const M=gpMoPreview(e);
      if(M){out.push({d:[W2(e.x,e.y),W2(M.ex,M.ey)]});pts=[{x:M.ex,y:M.ey},...M.pts];}else if(G.moDone)pts=[{x:e.x,y:e.y},...r.pts];}
    if(r.end==='cont'){const a=pts[pts.length-2],z=pts[pts.length-1],l=Math.hypot(z.x-a.x,z.y-a.y)||1;pts.push({x:clamp(z.x+(z.x-a.x)/l*4,0.8,FW-0.8),y:Math.min(119,z.y+(z.y-a.y)/l*4)});}
    out.push({n:olNk(e),r:r.name,c:r.col,e:r.end,p:pts.map(p=>W2(p.x,p.y))});}
  return out;
}
function olHostTick(F){
  if(!ON||G.client)return;
  const now=performance.now()/1000,busy=G.phase==='live'||G.phase==='presnap'||G.phase==='dead'||G.phase==='intro';
  const rate=busy?(OL.rate||20):4;if(now-OL.lastSend<1/rate-0.004)return;OL.lastSend=now;
  const full=OL.needFull||now-OL.lastFull>2.5;if(full){OL.lastFull=now;OL.needFull=false;OL.sent.clear();}
  const es={},ents=[],ids=[];let nes=0;
  for(const S of F.ents){const e=S.e;if(!e)continue;const k=olNk(e);ids.push(k);
    const st=olStaticOf(e,S),sk=JSON.stringify(st);if(full||OL.stSent.get(k)!==sk){OL.stSent.set(k,sk);es[k]=st;nes++;}
    const d=olDyn(k,S),dk=d.join(',');if(OL.sent.get(k)!==dk){OL.sent.set(k,dk);ents.push(d);}}
  const m={t:olR3(now),s:olState(),e:ents,b:olBallOut(F.ball),c:[olR2(F.camY),olR3(F.anch)],r:rate};
  const idk=ids.join(',');if(full||idk!==OL.idk){OL.idk=idk;m.ids=ids;}
  if(nes)m.es=es;if(full)m.full=1;
  if(F.flags&&F.flags.length)m.fl=F.flags.map(f=>[olR2(f.x),olR2(f.y),Math.round((f.h||0)*100)]);
  if(F.lines)m.ln=[olR2(F.lines.los),F.lines.fd!=null?olR2(F.lines.fd):null];
  if(G.phase==='presnap'){const tg={};for(const S of F.ents)if(S.tag&&S.e)tg[S.e.nk]=S.tag;m.tg=tg;
    const sr={};for(const S of F.ents)if(S.star&&S.e)sr[S.e.nk]=S.star;m.sr=sr;
    const rg={};for(const S of F.ents)if(S.ring&&S.e)rg[S.e.nk]=S.ring;m.rg=rg;}
  const geo=olRouteGeom(),gk=geo?JSON.stringify(geo):'';if(full||gk!==OL.routesKey){OL.routesKey=gk;m.rt=geo;}
  olSend('f',m);
}

/* ---------------- guest: rebuilding and drawing the host's frames ---------------- */
function olPl(id){for(const T of G.teams){const p=T.roster.find(q=>q.id===id);if(p)return p;}return null;}
function olFrameIn(m){
  const now=performance.now()/1000;
  if(m.full)OL.cur=new Map();
  if(m.es)for(const k in m.es){const st=m.es[k];st.pl=st.p!=null?olPl(st.p):null;OL.es.set(+k,st);}
  for(const d of m.e||[])OL.cur.set(d[0],d);
  if(m.ids){OL.ids=m.ids;const keep=new Set(m.ids);for(const k of[...OL.cur.keys()])if(!keep.has(k))OL.cur.delete(k);}
  if(m.rt!==undefined){OL.routes=m.rt;if(m.rt&&m.rt.length)OL.recvN=m.rt.filter(r=>r.n).map(r=>({n:r.n,c:r.c,r:r.r}));}
  const snap={t:m.t,rt:now,ents:new Map(OL.ids.map(k=>[k,OL.cur.get(k)]).filter(x=>x[1])),b:m.b,fl:m.fl||[],c:m.c,ln:m.ln||null,s:m.s,tg:m.tg||null,rg:m.rg||null,sr:m.sr||null,r:m.r||10};
  OL.buf.push(snap);if(OL.buf.length>24)OL.buf.shift();
  // clock offset between the two devices: the smallest (arrival - send) seen recently
  OL.offS.push(now-m.t);if(OL.offS.length>90)OL.offS.shift();OL.off=Math.min(...OL.offS);
}
function olS(k,d,d0,u){
  const st=OL.es.get(k);if(!st)return null;const pl=st.pl;const L=(i,s)=>d0?(d0[i]+(d[i]-d0[i])*u)/s:d[i]/s,f=d[9];
  return{nk:k,wx:L(1,20),wy:L(2,20),dir:d[3],pp:null,bob:0,flat:!!(f&64),jz:L(4,100),rot:L(5,100),sq:L(6,100),body:pl?pl.body:(st.bo||{hs:1,ws:1,belly:0}),kit:null,look:pl?pl.look:(st.lk||{}),
    num:pl?pl.num:null,ball:null,ref:!pl,team:st.t,cap:st.cp||'#151515',mark:f&1?'c':f&2?'u':null,ring:null,tag:null,stun:!!(f&4),hurt:!!(f&8),fade:!!(f&16),qbBall:!!(f&32),
    pk:st.sh&&d[7]?{sheet:st.sh,team:st.pt,skin:st.sk,anim:d[7],frame:d[8],build:st.bd}:null,role:st.r,slot:st.s,side:st.d,pl};
}
function olInterp(){
  const B=OL.buf;if(!B.length)return null;
  const now=performance.now()/1000,last=B[B.length-1],delay=clamp(1.7/(last.r||10),0.07,0.3);
  const rt=now-(OL.off||0)-delay;
  let f0=null,f1=last,u=1;
  for(let i=B.length-1;i>0;i--){if(B[i-1].t<=rt&&B[i].t>=rt){f0=B[i-1];f1=B[i];u=(rt-f0.t)/Math.max(1e-3,f1.t-f0.t);break;}}
  if(!f0&&B.length>1&&rt<B[0].t){f1=B[0];}
  const ents=[];
  for(const[k,d]of f1.ents){const d0=f0?f0.ents.get(k):null;const S=olS(k,d,d0&&Math.abs(d0[1]-d[1])<200&&Math.abs(d0[2]-d[2])<200?d0:null,u);if(!S||!S.pk)continue; // drawn only once its sprite sheet is known
    if(f1.tg&&f1.tg[k])S.tag=f1.tg[k];if(f1.rg&&f1.rg[k])S.ring=f1.rg[k];if(f1.sr&&f1.sr[k])S.star=f1.sr[k];ents.push(S);}
  const bOf=b=>b?{wx:b[0]/20,wy:b[1]/20,h:b[2]/100,k:b[3]||undefined,q:b[4]/100,n:b[5]?[b[5][0]/20,b[5][1]/20,b[5][2]/100]:undefined}:null;
  let ball=bOf(f1.b);if(ball&&f0&&f0.b&&f0.b[3]===f1.b[3]){const b0=bOf(f0.b);ball.wx=b0.wx+(ball.wx-b0.wx)*u;ball.wy=b0.wy+(ball.wy-b0.wy)*u;ball.h=b0.h+(ball.h-b0.h)*u;}
  if(ball&&!ball.k)delete ball.k;
  const c0=f0?f0.c:f1.c,c1=f1.c;
  return{ents,ball,flags:(f1.fl||[]).map(f=>({x:f[0]/20,y:f[1]/20,h:f[2]/100})),camY:(c0[0]+(c1[0]-c0[0])*u)/20,anch:c0[1]+(c1[1]-c0[1])*u,
    lines:f1.ln?{los:f1.ln[0]/20,fd:f1.ln[1]!=null?f1.ln[1]/20:null}:null,s:f1.s,rt:f1.rt};
}
// stand-in objects so the regular UI code (setCtl, drawAim, the meters, audibles) works on the guest
function olProxyOf(k,team,F){const S=F.ents.find(x=>x.nk===k);const[x,y]=S?toS(S.wx,S.wy):[CX,60];
  return{nk:k,team,x,y,hx:x,hy:y,jz:S?S.jz:0,vx:0,vy:0,down:false,role:S?S.role:'',slot:S?S.slot:'',side:S?S.side:'',pl:S&&S.pl?S.pl:{num:0,first:'',last:'',body:{hs:1},acc:70,pow:70,ovr:60,awr:70},olProxy:true};}
function olEnts(){const F=OL.lastF;return F?F.ents.filter(S=>S.pl).map(S=>olProxyOf(S.nk,S.team,F)):[];}
function olRecvEnts(){const F=OL.lastF;if(!F||!OL.routes)return[];
  return OL.routes.filter(r=>r.n).map(r=>{const e=olProxyOf(r.n,G.me,F);e.route={name:r.r,col:r.c};return e;});}
function olPredU(kind){const a=G.air;if(!a)return 0;if(kind==='cm')return clamp(a.t/a.T,0,1);return G.im?imPos(G.im):0;}
function olSync(F){
  const s=F.s;if(!s)return;OL.s=s;
  G.netPhase=s.ph;if(G.phase!=='replay')G.phase=s.ph;
  G.score=s.sc;G.q=s.q;G.clock=s.ck/10;G.clockRun=!!s.cr;G.playClock=s.pc/10;G.down=s.dn;G.toGo=s.tg;G.los=s.lo;G.poss=s.po;G.offTeam=s.of;G.to=s.to;
  G.flip=!!s.fp;G.ballState=s.bs;G.cele=s.ce;G.cheer=s.ch;G.conv=s.cv?{team:s.cv.t,two:!!s.cv.two}:null;G.ot=s.ot?{round:s.ot}:null;
  G.play=s.pk?{kind:s.pk,off:{kind:s.pok},special:s.sp||null}:null;G.pendThrow=s.pt?{}:null;G.fair=!!s.fa;OL.kneelOK=!!s.kn;G.kneelOK=s.kn?1:0;
  G.carrier=s.car?olProxyOf(s.car[0],s.car[1],F):null;G.uctl=s.uc?olProxyOf(s.uc[0],s.uc[1],F):null;G.qb=s.qb?olProxyOf(s.qb,G.offTeam,F):null;
  G.celebPick=s.cp?{olProxy:true,team:G.me,celeb:null}:null;
  const now=performance.now()/1000,lead=now-F.rt+2*OL.ow;
  G.air=s.air?{t:s.air[0]/1000+lead,T:s.air[1]/1000}:null;
  // catch / interception meters: keep this device's tap, take the window from the host
  if(s.cm){if(!OL.cmP||OL.cmP.n!==s.cm.n||OL.cmP.doneAt)OL.cmP={n:s.cm.n,tapped:null,result:null,u:0};
    Object.assign(OL.cmP,{g0:s.cm.g0,g1:s.cm.g1,yw:s.cm.yw,diff:s.cm.df,need:!!s.cm.nd,target:olProxyOf(s.cm.n,G.me,F)});G.cm=OL.cmP;}
  else if(OL.cmP&&!OL.cmP.doneAt){OL.cmP.doneAt=G.time;OL.cmP.u=OL.cmP.tapped!=null?OL.cmP.tapped:0.99;G.cm=OL.cmP;}
  else if(OL.cmP&&G.time-OL.cmP.doneAt>0.7){OL.cmP=null;G.cm=null;}
  if(s.im){if(!OL.imP||OL.imP.n!==s.im.n||OL.imP.doneAt)OL.imP={n:s.im.n,tapped:null,result:null};
    Object.assign(OL.imP,{g0:s.im.g0,g1:s.im.g1,yw:s.im.yw,c:s.im.c,a0:s.im.a0/1000,def:olProxyOf(s.im.n,G.me,F)});G.im=OL.imP;}
  else if(OL.imP&&!OL.imP.doneAt){OL.imP.doneAt=G.time;G.im=OL.imP;}
  else if(OL.imP&&G.time-OL.imP.doneAt>0.8){OL.imP=null;G.im=null;}
  // this player's kick meter runs here; only the result goes to the host
  if(s.km&&G.phase==='presnap'&&!G.meter&&!OL.kickSent){G.meter={stage:'power',t:0,power:0,acc:0,val:0,D:s.km.D,per:s.km.per,pper:s.km.pper,tol:s.km.tol,ctr:s.km.ctr};G.wind=s.km.w;showMeter();}
  if(!s.km){OL.kickSent=false;if(G.meter){G.meter=null;hide('meter');}}
  if(OL.infoOpen&&(s.ph==='presnap'||s.ph==='live'||s.ph==='call')){OL.infoOpen=false;if(!$('modal').hidden&&!OL.askId)hide('modal');}
  // rebuild the buttons when this player's situation changes
  const mine=x=>x&&x.team===G.me?1:0;
  const key=[G.phase,s.bs,s.pk,s.of,mine(G.carrier),mine(G.uctl),G.cm&&!G.cm.doneAt?1:0,G.im&&!G.im.doneAt?1:0,s.kn,s.fa,s.cp,G.meter?G.meter.stage:'',s.to.join('-'),s.kw,s.scr].join('|');
  if(key!==OL.uiKey){OL.uiKey=key;if(G.phase!=='replay'){setTray(G.phase==='presnap'?'presnap':G.phase==='dead'?(G.celebPick?'celebrate':'dead'):'none');setCtl();}}
}
function olJoySend(){
  const u=G.uctl;let v=[0,0],m=0;
  if(u&&u.team===G.me&&G.phase==='live'){let sx=0,sy=0;
    if(G.joy){sx=G.joy.x-G.joy.ox;sy=G.joy.y-G.joy.oy;}
    else if(G.pad){sx=G.pad.x*30;sy=G.pad.y*30;}
  else{if(keys.has('arrowleft')||keys.has('a'))sx-=30;if(keys.has('arrowright')||keys.has('d'))sx+=30;if(keys.has('arrowup')||keys.has('w'))sy-=30;if(keys.has('arrowdown')||keys.has('s'))sy+=30;}
    const l=Math.hypot(sx,sy);if(l>=4){const[fx,fy]=screenToSimDir(u,sx,sy);v=[Math.round(fx*100)/100,Math.round(fy*100)/100];m=Math.round(Math.min(1,l/26)*100)/100;}}
  const now=performance.now(),L=OL.joyLast,same=L&&L.m===m&&Math.abs(L.v[0]-v[0])<0.06&&Math.abs(L.v[1]-v[1])<0.06;
  if(m===0&&(!L||L.m===0))return;
  if(same&&now-OL.joyAt<(m?250:1e9))return;if(!same&&now-OL.joyAt<60)return;
  OL.joyLast={v,m};OL.joyAt=now;olCmd('joy',{v,m});
}
function olDrawRoutes(){
  if(G.phase!=='presnap'||!G.play||G.play.kind!=='scrimmage'||G.offTeam!==G.me||!OL.routes)return;
  ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
  const P=w=>{const q=proj(w[0]/20,w[1]/20);return[q.sx,q.sy];};
  for(const r of OL.routes){
    if(r.d){const[a,b]=r.d.map(P);ctx.setLineDash([4,3]);for(const[lw,col]of[[4,'rgba(8,30,50,.7)'],[2,'#ffffff']]){ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();}ctx.setLineDash([]);continue;}
    const sp=r.p.map(P),n=sp.length;if(n<2)continue;const[ax,ay]=sp[n-2],[zx,zy]=sp[n-1],ang=Math.atan2(zy-ay,zx-ax);
    for(const[lw,col]of[[5.2,'rgba(8,30,50,.75)'],[2.6,r.c]]){
      ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(sp[0][0],sp[0][1]);for(let i=1;i<n;i++)ctx.lineTo(sp[i][0],sp[i][1]);ctx.stroke();
      ctx.fillStyle=col;ctx.beginPath();
      if(r.e==='settle')ctx.arc(zx,zy,lw>3?4.6:3.2,0,Math.PI*2);
      else{const s=lw>3?8.5:6.2;ctx.moveTo(zx+Math.cos(ang)*s*0.85,zy+Math.sin(ang)*s*0.85);ctx.lineTo(zx+Math.cos(ang+2.5)*s,zy+Math.sin(ang+2.5)*s);ctx.lineTo(zx+Math.cos(ang-2.5)*s,zy+Math.sin(ang-2.5)*s);ctx.closePath();}
      ctx.fill();}}
  ctx.restore();
}
function olClientStep(dt){
  G.time+=dt;
  if(G.phase==='replay'&&G.replay){
    const P=G.replay;if(P.playing){P.i+=dt*30*P.speed;if(P.i>=P.R.frames.length-1){P.i=P.R.frames.length-1;P.playing=false;$('rPlay').textContent='Play again';}}
    const F=recGet(P.R,Math.floor(P.i));G.camY=F.camY;G.anch=F.anch;gpFcStep(P,dt);drawScene(F);updateHUD();gpRecTick();return;}
  let F=olInterp();
  if(!F){F={ents:[],ball:null,flags:[],camY:G.camY,anch:G.anch,lines:null};drawScene(F);updateHUD();return;}
  OL.lastF=F;olSync(F);
  meterStep(dt);olJoySend();
  G.camY=F.camY;G.anch=F.anch;
  if(!G.spr)F={ents:[],ball:F.ball,flags:F.flags,camY:F.camY,anch:F.anch,lines:F.lines};
  drawScene(F);updateHUD();
  // keep this play's frames so "Replay" works on this device too
  const ph=G.netPhase;
  if(ph==='live'&&OL.recPh!=='live'){G.rec={frames:[],t0:G.time,last:-1};}
  if(G.rec&&(ph==='live'||ph==='dead')&&G.time-G.rec.last>=1/30&&G.rec.frames.length<900){G.rec.last=G.time;G.rec.frames.push(F);}
  if(G.rec&&ph!=='live'&&ph!=='dead'){if(G.rec.frames.length>20)G.lastRec=G.rec;G.rec=null;}
  OL.recPh=ph;
}

/* ---------------- messages from the other device ---------------- */
window.olRecv=function(type,d){
  try{
    if(!G.client){if(type==='cmd')olRemote(d);else if(type==='resync')olResync();else if(type==='net')olNet(d);else if(type==='rate')OL.rate=clamp(+d||10,4,30);return;}
    switch(type){
      case 'f':olFrameIn(d);return;
      case 'toast':toast(d[0],d[1]);return;
      case 'flash':flash(d);return;
      case 'ask':{OL.askId=d.id;OL.infoOpen=false;olWait(null);
        showModal(d.title,d.text,(d.opts||[]).map((l,i)=>[l,i?'alt':'go',()=>{OL.askId=null;olCmd('ans',{id:d.id,i});}]));return;}
      case 'info':if(!OL.askId){OL.infoOpen=true;showModal(d.title,d.text,[['OK','go',()=>{OL.infoOpen=false;}]]);}return;
      case 'call':{OL.callOpen=true;OL.mine=false;hide('modal');OL.infoOpen=false;
        showCall(d.mode,v=>{if(!OL.callOpen||OL.mine)return;OL.mine=true;olCmd('call',{mode:d.mode,v});olWait('Waiting for your opponent…');});return;}
      case 'callx':OL.callOpen=false;hide('call');hide('subs');olWait(null);return;
      case 'askx':if(OL.askId===d.id){OL.askId=null;hide('modal');}return;
      case 'ros':{const T=G.teams[G.me];if(!T||!$('subs').hidden)return;
        for(const[id,st,inj]of d.p||[]){const p=T.get(id);if(p){p.stamina=st;p.inj=inj?{type:inj,plays:99}:null;}}
        if(d.l)for(const s in d.l)if(s in T.lineup)T.lineup[s]=d.l[s];T.auto=!!d.a;return;}
      case 'pong':{const rtt=performance.now()/1000-d.t;if(rtt>=0&&rtt<5)OL.ow=OL.ow*0.7+rtt/2*0.3;return;}
      case 'net':olNet(d);return;
    }
  }catch(e){console.error(e);}
};
// connection state from the main window: the host holds the game while the guest is gone
function olNet(d){
  const up=d&&d.up;
  if(!G.client){if(!up){G.paused=true;olWait('Connection lost. Waiting for your opponent to reconnect…');}else{G.paused=false;olWait(null);olResync();}}
  else olWait(up?null:'Connection lost. Reconnecting…');
}
if(ON){try{$('pauseBtn').hidden=true;}catch(e){}
  if(G.client){setInterval(()=>{olCmd('ping',{t:performance.now()/1000});},2000);}}

window.__G=G;
if(GP&&GP.qbPack)PACK_TEAMS[2]=GP.qbPack;
if(GP){for(const t of[0,1]){const k=GP.teams[t]&&GP.teams[t].kit;if(k)PACK_REF[2+t]={refWhite:k.helmet,refBlack:k.helmet,refPants:'#c9b48a',cap:k.helmet,capTrim:k.hstripe||'#ffffff'};}}
if(GP){try{
  const L0=document.getElementById('gull'),L1=document.getElementById('elk');
  if(L0){L0.setAttribute('viewBox','0 0 100 100');L0.innerHTML=GP.teams[0].logoInner;}
  if(L1){L1.setAttribute('viewBox','0 0 100 100');L1.innerHTML=GP.teams[1].logoInner;}
  for(const i of[0,1]){const c=document.getElementById('gpC'+i),n=document.getElementById('gpN'+i);if(c)c.textContent=GP.teams[i].city.toUpperCase()+(GP.teams[i].ovr?' · '+GP.teams[i].ovr+' OVR':'');if(n){n.textContent=GP.teams[i].name.toUpperCase();n.dataset.full=n.textContent;n.dataset.abbr=(GP.teams[i].abbr||n.textContent.slice(0,4)).toUpperCase();n.dataset.rec=GP.teams[i].rec||'';}}
  if(GP.teams[GP.home||0].logoUrl)logoImg.gull.src=GP.teams[GP.home||0].logoUrl;
  const h0=document.querySelector('.tm.home'),h1=document.querySelector('.tm.away');if(h0&&GP.teams[0].hud)h0.style.background=GP.teams[0].hud;if(h1&&GP.teams[1].hud)h1.style.background=GP.teams[1].hud;
  document.title=GP.teams[0].name+' vs '+GP.teams[1].name;
}catch(e){console.error(e);}}
// v2.15 TV-style scorebug (Settings → Scorebug): abbreviations, records and a yellow down-and-distance tag
function gpBugStyle(){const tv=GDS.bug!=='classic';document.body.classList.toggle('bugtv',tv);try{document.body.classList.toggle('pcbug',pcOn());}catch(e){}for(const k of['slab','tower','mini'])document.body.classList.toggle('bug-'+k,GDS.bug===k);
  for(const i of[0,1]){const n=document.getElementById('gpN'+i);if(!n||!n.dataset.full)continue;n.textContent=tv?n.dataset.abbr:n.dataset.full;
    let r=n.parentNode.querySelector('.rec');if(n.dataset.rec&&!r){r=document.createElement('span');r.className='rec';n.after(r);}if(r)r.textContent=n.dataset.rec||'';}}
try{gpBugStyle();}catch(e){}
new ResizeObserver(fit).observe($('stage'));
/* fullscreen toggle (falls back gracefully where the browser blocks it) */
(function(){
  const el=document.documentElement,req=el.requestFullscreen||el.webkitRequestFullscreen,ex=document.exitFullscreen||document.webkitExitFullscreen;
  const b=$('fsBtn');if(!req){b.hidden=true;return;}
  const isFS=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
  const upd=()=>{b.setAttribute('aria-label',isFS()?'Exit fullscreen':'Fullscreen');b.classList.toggle('on',isFS());setTimeout(fit,60);};
  b.onclick=e=>{e.stopPropagation();try{const r=isFS()?ex.call(document):req.call(el);if(r&&r.catch)r.catch(()=>{b.hidden=true;});}catch(_){b.hidden=true;}};
  document.addEventListener('fullscreenchange',upd);document.addEventListener('webkitfullscreenchange',upd);
})();
fit();
if(location.hash==='#test'){G.test=true;G.ai=[true,true];}
// ── title-screen demo: simulate real AI-vs-AI snaps off screen, keep the touchdowns, and play them back as clips ──
function gpDemoMsg(m){try{window.parent.postMessage({gdDemo:m},'*');}catch(e){}}
function gpDemoPump(){const D=G.demo;if(!D||D.state!=='warm')return;const t0=performance.now();
  if(document.hidden){setTimeout(gpDemoPump,500);return;}
  D.warmT=(D.warmT||0)+1;if(D.warmT>2500&&!D.clips.length){G.demo=null;gpDemoMsg('off');return;}
  try{while(performance.now()-t0<5){for(let i=0;i<24&&performance.now()-t0<5;i++){const m=$('modal');if(m&&!m.hidden){const b=$('mB').querySelector('button');if(b)b.click();}if(G.phase==='call')openCall();if(G.phase==='replay')break;step(1/30);}if(D.fresh>=D.need)break;}}catch(e){console.error(e);}
  if(D.fresh>=D.need&&D.clips.length){D.fresh=0;D.warmT=0;gpDemoShow();return;}setTimeout(gpDemoPump,40);}
function gpDemoShow(){const D=G.demo;D.state='show';G.noDraw=false;const R=D.clips[D.ci%D.clips.length];D.ci++;
  G.replay={R,i:0,speed:0.9,playing:true,prev:'dead',onExit:null,demo:true};G.phase='replay';gpDemoMsg('clip');}
function gpDemoNext(){const D=G.demo;G.replay=null;
  // after each full loop, go back to the field for one more touchdown so the reel keeps changing
  if(D.ci%D.clips.length===0||D.clips.length<3){D.state="warm";D.need=1;G.noDraw=true;G.demoTD=false;G.phase="dead";G.after={t:0.01,fn:proceed};gpDemoMsg('warm');setTimeout(gpDemoPump,420);return;}
  gpDemoShow();}
if(DEMO){document.body.classList.add('demo');G.test=true;G.ai=[true,true];G.demo={clips:[],ci:0,state:'warm',need:1,fresh:0};G.noDraw=true;}
newGame();requestAnimationFrame(frame);
if(DEMO){G.los=70;setTimeout(gpDemoPump,60);}
<\/script>
<\/body>
