/* ===================== camera ===================== */
function camera(dt){
  const b=G.carrier||(G.air&&G.air.cur)||(G.kick&&G.kick.cur)||G.loose||(G.ballState==='qb'||G.ballState==='snap'||G.ballState==='pre'?G.qb:null);
  let ty=G.camY,anch=0.32;
  const offDir=G.flip?-1:1;
  if(b){const[,wy]=toW(b.x,b.y);
    let ad=offDir;if(G.carrier)ad=attackDir(G.carrier)*(G.flip?-1:1);
    if(G.kick||G.ballState==='tee'||(G.play&&G.play.kind!=='scrimmage'&&!G.carrier)){ad=0;}
    anch=ad>0?0.32:ad<0?0.68:0.5;
    let ahead=G.carrier?7:(G.ballState==='qb'||G.ballState==='snap'||G.ballState==='pre')?8.5:4;
    if(G.aim&&!G.aim.run&&G.qb){ahead=clamp(G.aim.dy*G.aim.D-14,8.5,11);}
    ty=wy+ahead*ad;
  }else if(G.linesW){ty=toW(0,G.linesW.los)[1]+3.5*offDir;anch=offDir>0?0.32:0.68;}
  if(G.phase==='presnap'&&G.play&&G.play.kind!=='scrimmage'){const k=G.play.kind==='kickoff'?toW(0,G.play.kicker.y)[1]:toW(0,G.linesW.los)[1];ty=k+(G.play.kind==='punt'?-6*offDir:0);anch=0.5;}
  ty=clamp(ty,-4,124);
  const r=1-Math.exp(-dt*3.2);G.camY+=(ty-G.camY)*r;G.anch+=(anch-G.anch)*(1-Math.exp(-dt*2));
}

/* ===================== replay ===================== */
function recordFrame(){
  const R=G.rec;if(!R)return;
  if(G.time-R.last<1/30)return;R.last=G.time;
  if(R.frames.length<900)R.frames.push(recPack(frameData(true),R));
}
// replay frames are kept small (a long play used to hold 30 MB and more, which crashed some PCs): a pose is one number
// array, and what stays the same through the play (uniform, body, number, looks) is stored once per player and shared;
// the frame on screen is unpacked on the fly
function recPack(F,R){const n=JK.length,T=R?(R.tpl||(R.tpl=[])):null;
  for(let j=0;j<F.ents.length;j++){const S=F.ents[j],P=S.pp;
    if(P&&!(P instanceof Float32Array)){const a=new Float32Array(n*2);for(let i=0;i<n;i++){const v=P[JK[i]];if(v){a[2*i]=v[0];a[2*i+1]=v[1];}else a[2*i]=a[2*i+1]=NaN;}S.pp=a;}
    if(!T)continue;const t=T[j];
    if(!t||t.num!==S.num||t.team!==S.team||t.ref!==S.ref||t.body!==S.body){T[j]=S;continue;}
    const o=Object.create(t);for(const k in S){if(!Object.prototype.hasOwnProperty.call(S,k))continue;const v=S[k];if(v!==t[k])o[k]=v;}
    const pk=S.pk,tp=t.pk;if(pk&&tp&&pk.sheet===tp.sheet&&pk.team===tp.team&&pk.skin===tp.skin&&pk.build===tp.build&&pk.bare===tp.bare&&pk.slim===tp.slim&&pk.hair===tp.hair&&pk.hst===tp.hst){const q=Object.create(tp);q.anim=pk.anim;q.frame=pk.frame;o.pk=q;}
    F.ents[j]=o;}
  F.z=1;return F;}
function recGet(R,i){const F=R.frames[i];if(!F||!F.z)return F;if(R._ci===i&&R._cf)return R._cf;const n=JK.length;
  const ents=F.ents.map(S=>{const o={};for(const k in S)o[k]=S[k];const a=o.pp;if(a instanceof Float32Array){const pp={};for(let j=0;j<n;j++)if(a[2*j]===a[2*j])pp[JK[j]]=[a[2*j],a[2*j+1]];o.pp=pp;}
    if(o.pk&&Object.getPrototypeOf(o.pk)!==Object.prototype){const q={};for(const k in o.pk)q[k]=o.pk[k];o.pk=q;}return o;});
  R._ci=i;R._cf=Object.assign({},F,{ents});return R._cf;}
function startReplay(onExit){
  const R=(G.rec&&G.rec.frames.length)?G.rec:G.lastRec;if(!R||!R.frames.length)return;
  G.replay={R,i:0,speed:0.6,playing:true,prev:G.phase,onExit};G.phase='replay';
  show('rbar');$('rPlay').textContent='Pause';$('rSlow').textContent='Slow-mo';setTray('none');$('ctl').innerHTML='';
}
function exitReplay(){
  const P=G.replay;if(!P)return;if(G.client)OL.uiKey='';G.replay=null;hide('rbar');G.phase=P.prev;
  if(P.onExit)P.onExit();else if(G.phase==='dead')setTray('dead');
}
$('rPlay').onclick=()=>{const P=G.replay;if(!P||P.recording)return;if(P.i>=P.R.frames.length-1)P.i=0;P.playing=!P.playing;$('rPlay').textContent=P.playing?'Pause':'Play';};
$('rSlow').onclick=()=>{const P=G.replay;if(!P||P.recording)return;P.speed=P.speed>0.5?0.28:0.6;$('rSlow').textContent=P.speed>0.5?'Slow-mo':'Normal speed';};
$('rExit').onclick=exitReplay;
$('rSave').onclick=()=>gpRecordReplay();
$('pauseBtn').onclick=ev=>{ev.stopPropagation();gpPause(!G.paused);};

$('vrShare').onclick=()=>gpVidShare();$('vrDl').onclick=()=>gpVidDownload();$('vrClose').onclick=()=>{$('vidReady').hidden=true;};
/* ===================== Gridiron 27 sprite pack integration ===================== */
const PACK_TEAMS=[
  {helmet:'#e9ad2f',helmetStripe:'#1f3a68',helmetLogo:'#1f3a68',facemask:'#1f3a68',jersey:'#1f3a68',jerseyTrim:'#f2b632',pants:'#e2a63a',pantsStripe:'#1f3a68',belt:'#1d1d22',
   socks:'#1f3a68',sockStripe:'#f2b632',cleats:'#25252b',cleatAccent:'#f2b632',gloves:'#f2b632',number:'#f2b632',numberTrim:'#f4f4f4',armSleeve:'skin'},
  {helmet:'#7a1f2b',helmetStripe:'#f4f0e6',helmetLogo:'#f4f0e6',facemask:'#c9c2b0',jersey:'#f4f0e6',jerseyTrim:'#7a1f2b',pants:'#f1ede3',pantsStripe:'#7a1f2b',belt:'#1d1d22',
   socks:'#7a1f2b',sockStripe:'#f4f0e6',cleats:'#f4f4f4',cleatAccent:'#7a1f2b',gloves:'#7a1f2b',number:'#7a1f2b',numberTrim:null,armSleeve:'skin'}
];
const PACK_REF=[{refPants:'#1c1c20',cap:'#f2f3f5',capTrim:'#1c1c20'},{refPants:'#1c1c20',cap:'#1c1c20',capTrim:'#f2f3f5'}];
const SKIN_PACK=[3,1,1,5,3,1,5,5];
const BUILD_WS={skill:1.0,big:1.16,line:1.4};
G.spr=null;
function packBuild(pl){if(!pl)return'referee';const p=pl.pos;if(p==='OL'||(p==='DL'&&pl.wt>=275))return'line';if(p==='TE'||p==='LB'||p==='DL')return'big';return'skill';}
function packSkin(look){if(look&&look.pk!=null)return look.pk;const i=SKINS.indexOf(look.skin);return SKIN_PACK[i<0?1:i];}
function packMeta(sheet,anim){return G.spr.ATLAS.sheets[sheet].anims[anim];}
function animFor(e,sheet){
  const M=n=>packMeta(sheet,n);
  const A=(n,u)=>{const m=M(n)||M(sheet==='referee'?'ref_idle':'idle');return[m===M(n)?n:(sheet==='referee'?'ref_idle':'idle'),clamp(Math.floor(clamp(u,0,0.999)*m.frames),0,m.frames-1)];};
  const FB=sheet==='referee'?'ref_idle':'idle';
  const Lp=(n,t)=>{let m=M(n);if(!m){n=FB;m=M(n);}return[n,Math.floor(Math.max(0,t)*m.fps)%m.frames];};
  const mv=Math.hypot(e.vx,e.vy),runF=(n,rev)=>{let m=M(n);if(!m){n=FB;m=M(n);}const f=Math.floor(Math.abs(e.anim)*1.15)%m.frames;return[n,rev?(m.frames-1-f):f];};
  const dead=G.phase!=='live'&&G.phase!=='presnap',td=dead&&G.result&&G.result.S&&G.result.S.td!=null;
  if(e.coach)return e.team===0&&M('coach_back')?Lp('coach_back',0):Lp('ref_idle',G.time*0.6+(e.seed||0));
  if(!e.pl){
    if(e.flagT>0)return A('ref_flag',1-e.flagT/0.45);
    if(dead&&G.result&&G.result.S){const t=G.time-(G.deadAt||0),S=G.result.S,r=G.result.r||{};
      if(td)return A('ref_touchdown',t/1.1);
      if(t<0.7)return A('ref_whistle',t/0.7);
      if(r.type==='inc')return Lp('ref_incomplete',t);
      if(S.first)return A('ref_first_down',(t-0.7)/1.0);
      if(G.lastTimeoutAt&&G.time-G.lastTimeoutAt<1.4)return A('ref_timeout',(G.time-G.lastTimeoutAt)/0.8);
    }
    if(mv>0.6)return runF('ref_run');
    return Lp('ref_idle',G.time+e.seed);
  }
  // subs jogging on / off: across the field they use the front / back running views, along it the side run
  const subRun=()=>{if(Math.abs(e.vx)>Math.abs(e.vy)*1.1&&M('run_front'))return runF(((G.flip?-e.vx:e.vx)>0)?'run_front':'run_back');return runF('run');};
  if(e.bench){if(Math.hypot(e.vx,e.vy)>0.6)return subRun();const sn=e.team===0?'stand_back':'stand_front';return M(sn)?Lp(sn,G.time+(e.seed||0)):Lp('idle',G.time+(e.seed||0));}
  const P=G.play,bs=G.ballState,hb=holdsBall(e),ca=e.ca,S=G.seq;
  if(e.hurt&&e.down)return A('tackled',1);
  {const cb=e.celeb&&G.phase!=='live'?celebAnim(e,A,Lp):null;if(cb)return cb;}
  if(S&&S.c===e)return gpTackledFrame(e,S,A);
  {const ta=gpTkAnim(e,A);if(ta)return ta;} // the user's tackle types and a tripped runner
  if(S&&S.fs.includes(e))return A(S.type==='dive'||S.type==='shoe'?'tackle_dive':'tackle',S.t/S.dur);
  if(e.down){
    if(e.slid&&M('qb_slide')){if(e.downT>0&&e.downT<0.3)return A('getup',0.7+0.29*(1-e.downT/0.3));return A('qb_slide',0.99);}
    {const gd=e.guDur||0.7;if(e.downT>0&&e.downT<gd)return A('getup',gpGetupU(e,1-e.downT/gd));}
    return A(e.downAnim||'tackled',1);
  }
  if(e.lunge>0)return A(e.lt==='shoe'||e.lt==='dive'||e.lt==='ankle'||e.lt==='low'?'tackle_dive':'tackle',1-e.lunge/(e.lungeDur||0.3));
  if(ca){const u=ca.t/ca.dur;
    if(ca.drop)return A('catch_hands',Math.min(u,0.3));
    if(ca.type==='safe'&&!ca.drop&&u>0.6)return A('run_ball',0);
    const n={hands:'catch_hands',high:'catch_high',onehand:'catch_onehand',dive:'catch_dive',shoulder:'catch_shoulder',low:'catch_hands',poss:'catch_high',moss:'catch_high',toetap:'catch_high',onedive:'catch_dive',trafL:'catch_hands',trafR:'catch_hands',safe:'catch_shoulder',slide:'catch_dive',obj:'catch_onehand'}[ca.type]||'catch_hands';
    if(e.side==='d'&&!hb)return A(n,Math.min(u,0.3));
    return A(n,0.34+0.66*u);}
  if(e.dive>0)return A('catch_dive',0.45+0.55*(1-e.dive/(e.diveT||0.32)));
  if(e.kickT>0)return A(e.role==='P'?'punt':'kick',0.5+0.5*(1-e.kickT/0.5));
  if(e.role==='P'&&bs==='punter')return A('punt',Math.min(0.45,(G.t-(P.holdT||G.t))/0.9*0.45));
  if(P&&(P.kind==='fg'||P.kind==='xp')&&e.role==='H')return A('stance_3pt',0);
  if(e===G.qb&&G.phase==='presnap'&&G.qbAudT&&G.time-G.qbAudT<1.0)return A('handoff',((G.time-G.qbAudT)/0.5)%1);
  if((e.subIn||e.inMotion)&&G.phase==='presnap'&&mv>0.35)return subRun();
  if(G.phase==='presnap'||G.phase==='menu'||(G.phase==='live'&&G.t<0.05)){
    const r=e.role;
    if(r==='LS'&&M('snap'))return A('snap',0);
    if(r==='OL'||r==='DL'||r==='PL'||r==='RUSH'||r==='FGR'||r==='LS')return Lp('stance_3pt',G.time+e.seed);
    if((r==='WR'||r==='TE')&&e.pl&&M('wr_lean'))return receiverStanceAnim(e,Lp,sheet);
    if(r==='WR'||r==='TE'||r==='GUN'||r==='JAM'||r==='QB'||r==='RB'||r==='COV'||r==='BLK')return Lp('stance_2pt',G.time+e.seed);
    if(r==='LB'||r==='CB'||r==='NB'||r==='S')return Lp('stance_def',G.time+e.seed);
    return Lp('idle',G.time+e.seed);
  }
  if(e.role==='LS'&&M('snap')&&G.phase==='live'&&G.t<0.5)return A('snap',G.t/0.5);
  if(dead&&G.cele!=null){if(e.team===G.cele)return Lp('celebrate',G.time+e.seed);return Lp('idle',G.time+e.seed);}
  if(e===G.qb&&G.pendThrow&&bs==='qb'){const T=G.pendThrow;return A('throw',Math.min(T.rel,T.t/T.dur)*0.999);}
  if(e.relT>0){const rs=e.relS||0.55,rd=e.relDur||0.35;return A('throw',rs+(1-rs)*(1-e.relT/rd));}
  if(e===G.qb&&bs==='snap'&&P&&P.kind==='scrimmage')return Lp('stance_qb',G.time*1.6);
  if(e===G.qb&&bs==='qb'){
    if(G.aim&&!G.aim.run){const s=gpQbLook(e);return s&&M('qbhold'+s)?['qbhold'+s,0]:A('throw',0.02);}
    if(gpDropping(e))return Lp('stance_qb',G.time*0.8+e.seed);
    if(mv>0.6)return runF('run_ball',e.back);
    {const s=gpQbLook(e);if(s&&M('stance_qb'+s))return Lp('stance_qb'+s,G.time*1.6+e.seed);}
    return Lp('stance_qb',G.time*1.6+e.seed);
  }
  if(P&&P.kind==='scrimmage'&&P.off.kind==='run'&&e===G.qb&&G.carrier!==e&&G.t<1.3)return A('handoff',G.t/0.9);
  if(e.slid&&!e.down)e.slid=false;
  if(e.slideT>0)return M('qb_slide')?A('qb_slide',1-e.slideT/0.6):A('getup',0.4);
  if(hb&&e===G.carrier){
    if(e.juke>0)return A('juke',1-e.juke/0.3);
    if(e.spin>0)return A('spin',1-e.spin/0.45);
    if(e.stiff>0){const u=1-e.stiff/(e.stiffDur||0.6);return A('stiff_arm',u<0.2?u/0.2*0.5:u>0.86?0.5+(u-0.86)/0.14*0.49:0.5);}
    if(e.truck>0)return A('truck',1-e.truck/0.6);
    if(e.hurdle>0)return A('hurdle',1-e.hurdle/0.6);
    if(e.slow>0&&mv<2)return A('run_ball',0);
    return runF('run_ball',e.back);
  }
  if(e.slip>0.3&&e.side==='d')return A('juke',0.35+0.3*(1-e.slip/0.75));
  if(e.jumpT>0)return A('catch_high',(1-e.jumpT/0.55)*0.42);
  if(e.swat>0)return A('catch_high',0.4);
  if(bs==='air'&&G.air&&G.air.cur&&G.air.cur.h<4.5&&Math.hypot(e.x-G.air.cur.x,e.y-G.air.cur.y)<2.6&&e.role!=='OL')return A(G.air.cur.h>2.4?'catch_high':'catch_hands',0.2);
  if(G.kick&&G.kick.cur&&(e.role==='KR'||e.role==='PR')&&Math.hypot(e.x-G.kick.cur.x,e.y-G.kick.cur.y)<3&&G.kick.cur.h<5)return A('catch_hands',0.2);
  if(e.engWith||e.eng>0){const runCtx=G.carrier||(P&&P.kind==='scrimmage'&&P.off.kind==='run');return Lp(runCtx?'drive_block':'block',G.time+e.seed);}
  if(e.role==='OL'&&bs==='qb'&&P.kind==='scrimmage'&&P.off.kind==='pass'&&mv<2.5)return Lp('block',G.time+e.seed);
  if(mv>1.4&&Math.abs(e.vx)>Math.abs(e.vy)*1.25&&M('run_front'))return runF(((G.flip?-e.vx:e.vx)>0)?'run_front':'run_back');
  if(mv>0.6)return e.back?runF('backpedal'):runF('run');
  if(e.settled&&bs==='qb')return A('catch_hands',0.1);
  return Lp('idle',G.time+e.seed);
}
function packInfo(e){
  if(!G.spr)return null;
  const sheet=e.pl?'player_'+packBuild(e.pl):'referee';
  const skin=e.pl?packSkin(e.pl.look):packSkin(e.refLook);
  const[anim,frame]=animFor(e,sheet);
  return{sheet,team:e.pl?((GP&&GP.practice&&e.pl.pos==='QB'&&e.side==='o'&&PACK_TEAMS[2])?2:e.team):(e.coachPal!=null?e.coachPal:(e.slot==='R'?0:1)),skin,anim,frame,build:e.pl?packBuild(e.pl):'skill',bare:!!(e.pl&&(e.pl.helmetOff||gpNoHelm())),slim:!!(e.pl&&gpNoHelm()),hair:e.pl&&e.pl.look&&e.pl.look.hair||null,hst:e.pl&&e.pl.look&&e.pl.look.hst||null};
}
function packSprite(pk){
  const colors=pk.sheet==='referee'?PACK_REF[pk.team]:pk.bare?packBare(pk.team,pk.skin,pk.hair,pk.hst,pk.slim):PACK_TEAMS[pk.team];
  return G.spr.lite(pk.sheet,colors,pk.skin);
}
function drawPack(S,p,z){
  const pk=S.pk,sp=packSprite(pk);
  if(pk.bare&&S.look){const q=S.look.eq||{};S={...S,look:{...S.look,eq:{...q,visor:null,mouth:null,mouth2:null,helm:null,ski:null,gcap:null,...(pk.slim?{pants:'short',socks:'low',tank:true,under:null,crop:false,shoulder:null}:{})}}};}
  const s=98*z*(S.body?S.body.hs:1)/48,sx=s*clamp(Math.sqrt((S.body?S.body.ws:1)/BUILD_WS[pk.build]),0.9,1.12);
  const hb=S.qbBall?gpHeldBall(sp,pk,S.dir<0,sx,s):null;
  if(S.rot||(S.sq&&S.sq!==1)){ctx.save();ctx.translate(p.sx,p.sy-S.jz*p.k);ctx.rotate(S.rot||0);ctx.scale(1,S.sq||1);sp.draw(ctx,pk.anim,pk.frame,0,0,sx,s,S.dir<0,S.ref?null:S.num,S.ref?null:S.look&&S.look.eq);if(hb)gpDrawHeld(hb,0,0,s);ctx.restore();}
  else{sp.draw(ctx,pk.anim,pk.frame,p.sx,p.sy-S.jz*p.k,sx,s,S.dir<0,S.ref?null:S.num,S.ref?null:S.look&&S.look.eq);if(hb)gpDrawHeld(hb,p.sx,p.sy-S.jz*p.k,s);}
}
function gpHeldBall(sp,pk,flip,sx,s){
  const m=sp.info&&sp.info(pk.anim),b=m&&m.info[pk.frame]&&m.info[pk.frame].ball;if(!b)return null;
  const A=G.spr.ATLAS.anchor,d=flip?-1:1,up=pk.anim==='throw'&&pk.frame>0;
  return{ox:d*(b[0]-A[0])*sx,oy:(b[1]-A[1])*s,rot:d*(up?-1.05:-0.45),d};
}
function gpDrawHeld(h,x,y,s){
  const m0=ctx.getTransform(),bs=s*0.8*Math.min(1.4,GDS.ball||1);ctx.translate(x+h.ox,y+h.oy);ctx.scale(bs,bs);
  football2(h.rot,1,Math.PI/2,1.4);
  ctx.setTransform(m0);
}
function prewarmPack(){
  if(!G.spr)return;
  const todo=[];const seen=new Set();
  for(const T of G.teams)for(const pl of T.roster){const k=['player_'+packBuild(pl),T.id,packSkin(pl.look)];const key=k.join('|');if(!seen.has(key)){seen.add(key);todo.push(k);}}
  for(const t of[0,1])for(const sk of[1,3,5])todo.push(['referee',t,sk]);
  const next=()=>{const k=todo.shift();if(!k)return;const colors=k[0]==='referee'?PACK_REF[k[1]]:PACK_TEAMS[k[1]];
    try{const sp=G.spr.lite(k[0],colors,k[2]);for(const a of(k[0]==='referee'?['ref_idle']:['idle','run']))if(sp.has(a)){const m=sp.info(a);for(let f=0;f<m.frames;f++)sp.cell(m.row*sp.cols+f);}}catch(e){}setTimeout(next,30);};
  setTimeout(next,50);
}
if(window.GridironSprites)GridironSprites.load().then(lib=>{for(const sh of['player_skill','player_big','player_line'])try{lib.improveHelmets(sh);lib.enlargeBall(sh,/^kick$/);}catch(e){console.error(e);}buildStanceFrames(lib);buildSideFrames(lib);try{buildLookFrames(lib);}catch(e){console.error(e);}try{buildSlideFrames(lib);}catch(e){console.error(e);}G.spr=lib;prewarmPack();}).catch(err=>console.error('sprite pack failed to load',err));


