/* ===================== passing ===================== */
function flight(D,bullet,lob){const v=(bullet?21+D*0.26:lob?11.2+D*0.19:13.6+D*0.23)*(G.flK||1),T=D/v;return{v,T,vz:GRAV*T/2};}
// v2.16 pass type: touch (normal), bullet (fast and flat), lob (high and soft over the underneath defenders). Second finger, Space, the Pass button or Y cycles it
const PT_N={touch:'Touch',bullet:'Bullet',lob:'Lob'};
function gpSetPT(t){G.ptype=t;G.bullet=t==='bullet';G.lob=t==='lob';setCtl();}
function gpCyclePT(){gpSetPT(G.lob?'bullet':'lob');try{flash(G.lob?'Lob':'Bullet');}catch(e){}try{SFX.click&&SFX.click();}catch(e){}}
function ballAt(a,t){return{x:a.sx+a.dx*a.v*t,y:a.sy+a.dy*a.v*t,h:2+a.vz*t-GRAV*t*t/2};}
function gpMotion(qb,bullet,D,lb){
  const A=(qb.pl&&qb.pl.arch)||'',moving=Math.hypot(qb.vx,qb.vy)>1.5,lob=!!lb||!bullet&&D>28;
  let dur=bullet?0.22+D*0.0035:lob?0.44+D*0.0065:0.3+D*0.0055,rel=bullet?0.5:lob?0.6:0.55;
  if(A==='Gunslinger')dur*=0.85;else if(A==='Field General')dur*=0.92;else if(A==='Tank')dur*=1.12;
  if(moving&&(A==='Scrambler'||A==='Pure Runner'))dur*=0.8;
  return{dur,rel,kind:bullet?'bullet':lob?'lob':'norm',arch:A,moving};
}
function throwTo(tx,ty,bullet,errScale,after,lob){
  const qb=G.qb;if(G.pendThrow)return;
  if(G.ballState!=='qb'){if(!gpScrOK())return;G.ballState='qb';G.carrier=null;qb.path=null;}
  const M=gpMotion(qb,bullet,Math.hypot(tx-qb.x,ty-qb.y),lob);
  G.pendThrow=Object.assign({tx,ty,bullet,lob:!!lob,errScale,after,t:0,ai:(isAI(G.offTeam)||G.test||pcAIQB())&&(!after||pcAIQB())},M);
  qb.relKind=M.kind;qb.relArch=M.arch;qb.relMove=M.moving;qb.thrU=0;
  G.aim=null;setCtl();
}
function gpThrowTick(dt){
  const T=G.pendThrow;if(!T)return;const qb=G.qb;
  if(G.phase!=='live'||G.ballState!=='qb'||!qb||qb.down){G.pendThrow=null;if(qb)qb.thrU=0;return;}
  T.t+=dt;qb.thrU=Math.min(1,T.t/T.dur);
  if(T.t>=T.dur*T.rel){const w=T.t;G.pendThrow=null;
    let tx=T.tx,ty=T.ty;
    const r=T.ai&&G.aiRecv&&G.recv.includes(G.aiRecv)&&!G.aiRecv.down?G.aiRecv:null;
    if(r){const D0=dist(qb,r),f=flight(D0,T.bullet,T.lob);tx=r.x+r.vx*f.T;ty=r.y+r.vy*f.T;}
    throwNow(tx,ty,T.bullet,T.errScale,T);if(T.after)T.after();}
}
// v2.16 short accuracy up to ~12 yards, deep accuracy past ~25, a blend in between
function gpAcc(pl,D){const s=pl.acc||70,d=pl.dac||s;return D<=12?s:D>=25?d:s+(d-s)*(D-12)/13;}
function throwNow(tx,ty,bullet,errScale,M){
  G.gpThrown=true;try{SFX.throw();}catch(e){}
  const qb=G.qb,D0=Math.hypot(tx-qb.x,ty-qb.y);
  // chemistry with the receiver he's throwing to (career mode passes it in): low chemistry, a looser throw
  let chemM=1;{let b=null,bd=6;for(const r of G.recv||[]){const d=Math.hypot(r.x-tx,r.y-ty);if(d<bd){bd=d;b=r;}}if(b&&b.pl&&b.pl.chem!=null)chemM=clamp(1+(50-b.pl.chem)/250,0.8,1.2);}
  const lob=!!(M&&M.lob),acc=gpAcc(qb.pl,D0),mx=gpMaxD(),err=chemM*(lob?(D0<15?1.25:1.06):1)*((1-acc/100)*0.24+0.012)*errScale*(1+Math.max(0,D0-15)/60)*(D0>mx?1.3:1)*(1+Math.max(0,gpFat(qb)-0.2)*0.5)
    *WX.passErr*(1+WX.w*0.007*Math.min(1,D0/25))*(D0>20?1+WX.fog*0.25:1)/slf(qb.team,'thr',0.45);
  const ang=Math.atan2(ty-qb.y,tx-qb.x)+rnd(-1,1)*err,D1=clamp(Math.min(D0,mx*rnd(0.93,1))*(1+rnd(-1,1)*err*0.6),3,mx);
  // the wind carries the ball while it is in the air (a quarterback allows for some of it)
  const[wX,wY]=gpWind(),f1=flight(D1,bullet,lob),drift=bullet?0.03:lob?0.075:0.055;
  const txx=qb.x+Math.cos(ang)*D1+wX*drift*f1.T,tyy=qb.y+Math.sin(ang)*D1+wY*drift*0.7*f1.T,D=Math.max(3,Math.hypot(txx-qb.x,tyy-qb.y)),dx=(txx-qb.x)/D,dy=(tyy-qb.y)/D,f=flight(D,bullet,lob);
  // the intended receiver is the one who will be closest to the ball when it arrives (crossers are judged by where they're going)
  let intended=null,bd=1e9;for(const r of G.recv){const px=r.x+r.vx*f.T,py=r.y+r.vy*f.T,dd=Math.min(Math.hypot(px-txx,py-tyy),Math.hypot(r.x-txx,r.y-tyy)+1.2);if(dd<bd){bd=dd;intended=r;}}
  G.air={sx:qb.x,sy:qb.y,dx,dy,D,tx:txx,ty:tyy,v:f.v,T:f.T,vz:f.vz,t:0,bullet,lob,tried:new Set(),intended,cur:null,dpi:false,spq:gpSpiral(qb,D0,errScale)};
  G.gpTgt=intended;G.gpCov=gpCoverOf(intended);
  G.ballState='air';G.throwT=G.t;G.aim=null;
  if(M){qb.relDur=M.dur*(1-M.rel);qb.relT=qb.relDur;qb.relS=M.rel;qb.relFull=M.dur;}else gpRelSet(qb,bullet,D0);
  setCtl();gpGodPickInit();
  G.cm=null;
}
// how tight the spiral is: accuracy, arm, overall and archetype, worse on the run or with a rusher in his face
function gpSpiral(qb,D,errScale){
  const pl=qb.pl||{},n=v=>clamp(((v||60)-40)/55,0,1),A=pl.arch||'';
  let q=0.1+0.28*n(pl.acc)+0.2*n(pl.pow)+0.32*n(pl.ovr||pl.rat);
  if(A==='Field General')q+=0.07;else if(A==='Gunslinger')q+=0.04;else if(A==='Pure Runner')q-=0.08;else if(A==='Scrambler')q-=0.04;
  const mv=Math.hypot(qb.vx,qb.vy);if(mv>1.5&&A!=='Scrambler')q-=0.08;
  let near=99;for(const d of G.ents)if(d.side==='d'&&!d.down)near=Math.min(near,Math.hypot(d.x-qb.x,d.y-qb.y));if(near<2.2)q-=(0.16*(1-near/2.2)+0.05)*clamp(1.3-((pl.tup||70)-40)/80,0.6,1.3);
  if(D>gpMaxD()*0.92)q-=0.08;
  q+=rnd(-0.09,0.09)*(errScale||1);
  return clamp(q,0.04,1);
}
function userThrowUnused(){}
function userThrow(){
  const A=G.aim;if(G.client){if(A&&!A.run)olCmd('throw',{dx:A.dx,dy:A.dy,D:A.D,b:G.bullet?1:0,l:G.lob?1:0});return;}throwTo(G.qb.x+A.dx*A.D,G.qb.y+A.dy*A.D,G.bullet,0.7,userThrowMeter,G.lob);
}
function userThrowMeter(){
  const a=G.air,r=a&&a.intended;if(!r)return;if(pcOn()&&!pcMe(r))return; // career: only your own player gets a catch meter
  // catch meter: timing window near the ball's arrival. Its size depends on how hard the catch is:
  // throw length, how tightly the receiver is covered, and how well the ball was placed.
  const px=r.x+r.vx*a.T,py=r.y+r.vy*a.T,land=ballAt(a,a.T*0.95);
  let dn=99;for(const d of G.ents)if(d.side==='d'&&!d.down)dn=Math.min(dn,Math.hypot(d.x+d.vx*a.T-px,d.y+d.vy*a.T-py));
  const miss=Math.hypot(a.tx-px,a.ty-py);
  const fLen=clamp((a.D-8)/34,0,1),fCov=clamp((2.6-dn)/2.0,0,1),fQual=clamp((miss-0.4)/2.2,0,1);
  const fHigh=land.h>2.9?0.12:0,fBullet=a.bullet&&a.D<12?0.08:0;
  const diff=clamp(fLen*0.32+fCov*0.45+fQual*0.28+fHigh+fBullet,0,1);
  const width=lerp(0.22,0.045,diff),center=0.9-width*0.15;
  G.cm={target:r,diff,need:diff>0.4,contested:fCov>0.45,g0:center-width/2,g1:Math.min(0.995,center+width/2),yw:width*0.7,
    tapped:null,result:null,u:0,tags:{len:fLen,cov:fCov,qual:fQual}};
  setCtl();
}
function intMeterTap(){
  const M=G.im,a=G.air,U=M&&M.def;if(!M||M.tapped!=null||!U||G.ballState!=='air'||!a)return false;
  if(U.team!==G.act)return false;
  if(G.client){const u=olPredU('im');M.tapped=u;M.result=u>=M.g0&&u<=M.g1?'PERFECT':(u>=M.g0-M.yw&&u<=M.g1+M.yw)?'GOOD':'MISS';olCmd('im',{u});return true;}
  const u=imPos(M);M.tapped=u;
  M.result=u>=M.g0&&u<=M.g1?'PERFECT':(u>=M.g0-M.yw&&u<=M.g1+M.yw)?'GOOD':'MISS';
  U.catchT=Math.max(0.4,a.T-a.t+0.25);return true;
}
function imPos(M){const a=G.air;if(M.tapped!=null)return M.tapped;if(!a)return M.last||0;const u=clamp((a.t-M.a0)/Math.max(0.15,a.T-M.a0),0,1);M.last=u;return u;}
function intMeterUpdate(){
  // shows over the defender who can play the ball: your controlled player if he is near,
  // otherwise any defender close to where the pass comes down (contested or off-target throws)
  const a=G.air;
  if(!a||G.ballState!=='air'||G.test||isAI(1-G.offTeam)||(!isAI(G.offTeam)&&!ON)){if(G.im&&!G.im.doneAt&&G.ballState!=='air')G.im.doneAt=G.time;return;}
  const land=ballAt(a,a.T),rem=Math.max(0,a.T-a.t),r=a.intended;
  const dR=r?Math.hypot(r.x+r.vx*Math.min(rem,0.8)-land.x,r.y+r.vy*Math.min(rem,0.8)-land.y):9;
  const reach=d=>Math.hypot(d.x+d.vx*Math.min(rem,0.6)-land.x,d.y+d.vy*Math.min(rem,0.6)-land.y);
  let best=null,bd=1e9;
  for(const d of G.ents){if(d.side!=='d'||d.down||d.role==='DL'&&d.eng>0)continue;const dd=reach(d);if(dd<bd){bd=dd;best=d;}}
  const U=G.uctl,dU=U&&U.side==='d'&&!U.down?reach(U):99;
  let pickD=null,dd=99;
  if(dU<6.5){pickD=U;dd=dU;}
  else if(best&&(bd<3.2||bd-dR<1.6&&bd<4.5)){pickD=best;dd=bd;}
  if(!pickD)return;
  const M=G.im;
  if(M&&M.tapped==null&&M.def!==pickD&&dd<M.dd-1.5){M.def=pickD;M.dd=dd;}
  if(!G.im){
    const c=clamp((dd-dR+1.5)/4,0,1),w=lerp(0.16,0.045,c),ctr=0.88-w*0.15;
    G.im={def:pickD,dd,c,g0:ctr-w/2,g1:Math.min(0.995,ctr+w/2),yw:w*0.6,a0:a.t,t0:G.time,tapped:null,result:null};
    setCtl();
  }
}
function catchMeterTap(){
  const M=G.cm,a=G.air;if(!M||M.tapped!=null||G.ballState!=='air'||!a)return false;
  if(M.target.team!==G.act)return false;
  if(G.client){const u=olPredU('cm');M.tapped=u;M.result=u>=M.g0&&u<=M.g1?'PERFECT':(u>=M.g0-M.yw&&u<=M.g1+M.yw)?'GOOD':u<M.g0?'EARLY':'LATE';olCmd('cm',{u});return true;}
  const u=clamp(a.t/a.T,0,1);M.tapped=u;
  M.result=u>=M.g0&&u<=M.g1?'PERFECT':(u>=M.g0-M.yw&&u<=M.g1+M.yw)?'GOOD':u<M.g0?'EARLY':'LATE';
  return true;
}
const CATCH_NAME={slide:'Sliding catch!',obj:'ONE-HANDED CATCH OF THE YEAR!',moss:'Mossed him!',toetap:'Toe-tap catch!',onedive:'One-handed diving grab!',trafL:'Caught in traffic!',trafR:'Caught in traffic!',safe:'Secured it!',hands:'Caught it!',shoulder:'Over the shoulder!',onehand:'One-handed grab!',high:'High-point catch!',low:'Shoestring catch!',poss:'Tough catch in traffic!',dive:'Diving catch!'};
const CATCH_DUR={slide:.65,obj:.85,moss:.7,toetap:.7,onedive:.6,trafL:.5,trafR:.5,safe:.45,hands:.32,shoulder:.42,onehand:.45,high:.62,low:.45,poss:.5,dive:.55};
function gpCatchVariant(t,r,b,a,dd,dn){
  if(t==='low'&&b.h<0.65)return'slide';
  if((t==='onehand'&&b.h>1.4&&Math.random()<0.03)||(t==='high'&&dn<1.6&&Math.random()<0.006))return'obj';
  const edge=r.x<2.4||r.x>FW-2.4||r.y>116.5;
  if(t==='high'&&dn<1.3&&b.h>2.7)return'moss';
  if(edge&&(t==='hands'||t==='shoulder'||t==='high'||t==='onehand'))return'toetap';
  if(t==='dive'&&dd>1.8)return'onedive';
  if(t==='poss')return(b.x-r.x)>=0?'trafR':'trafL';
  if(t==='hands'&&(dn<2.4?Math.random()<0.6:Math.random()<0.15))return'safe';
  return t;
}
function catchFx(e,dir){
  const ca=e.ca;if(!ca||!e.pl)return{rot:0,sq:1,jz:0};
  const u=Math.max(0,Math.min(1,ca.t/ca.dur)),s=Math.sin(Math.PI*u),d=dir||1;
  switch(ca.type){
    case'low':return{rot:0.22*d*s,sq:1-0.16*s,jz:0};
    case'slide':{const k=Math.min(1,u/0.45),sm=k*k*(3-2*k);return{rot:0.55*d*sm,sq:1-0.12*sm,jz:0};}
    case'obj':return{rot:-0.6*d*s,sq:1,jz:0.95*s};
    case'moss':return{rot:-0.1*d*s,sq:1,jz:1.25*s};
    case'toetap':return{rot:-0.14*d*s,sq:1,jz:u<0.55?0.55*Math.sin(Math.PI*u/0.55):0.16*Math.abs(Math.sin(4*Math.PI*u))};
    case'onedive':{const k=u<0.6?u/0.6:1,sm=k*k*(3-2*k);return{rot:d*1.15*sm,sq:1,jz:0.5*Math.sin(Math.PI*Math.min(1,u/0.6))};}
    case'trafL':return{rot:-0.24*s,sq:1,jz:0.15*s};
    case'trafR':return{rot:0.24*s,sq:1,jz:0.15*s};
    case'safe':return{rot:0,sq:1-0.06*s,jz:0};
  }
  return{rot:0,sq:1,jz:0};
}
// a catch (or interception) needs the player in bounds: inside both sidelines and not past the end line
function gpInb(e){return e.x>=0.1&&e.x<=FW-0.1&&e.y<=119.9&&e.y>=0.1;}
function gpOobCatch(r,b){G.picker=null;r.ca={type:'hands',t:0,dur:0.32,drop:true};G.loose={x:b.x,y:b.y,h:Math.max(0.2,b.h),vx:0,vy:0,vh:1,kind:'inc',t:0};
  flash(r.side==='d'?'Picked off out of bounds: incomplete':'Out of bounds: incomplete');endPlay({type:'inc',oob:true});}
function catchBall(r,type,b){
  if(!gpInb(r)){gpOobCatch(r,b);return;}
  r.lastCatch={type,t:G.time};r.slideDown=false;try{gpCatchFace(r,type);}catch(e){}
  if(r.side==='o'&&G.play&&G.play.kind==='scrimmage')G.catchY=r.y;
  G.carrier=r;G.ballState='carrier';G.air=null;r.juke=0;r.dive=0;r.slow=0;r.settled=false;
  r.ca={type,t:0,dur:CATCH_DUR[type]};
  if(type==='dive'){const dx=b.x-r.x,dy=b.y-r.y,l=Math.hypot(dx,dy)||1;r.vx=dx/l*5.5;r.vy=dy/l*5.5;}
  if(type==='slide'){r.vx*=0.45;r.vy*=0.45;}
  if(type==='obj')G.cheer=1.2;
  dust(r.x,r.y,type==='dive'?6:3);
  if(r.side==='o')G.gpCovC=gpCoverOf(r);
  if(r.side==='d'){G.turnover=true;flash('INTERCEPTED!');G.cheer=1;try{SFX.catch_();SFX.gasp();}catch(e){}}else{flash(CATCH_NAME[type]);if(type!=='hands')G.cheer=0.8;try{SFX.catch_();}catch(e){}}
  setCtl();
  if(r.side==='o'&&r.y>=110)endPlay(r.x<0||r.x>FW?{type:'inc'}:{type:'td'});
}
// tip drill: a broken-up pass sometimes pops straight up off the hands, and anyone close enough can come down with it
function gpTipUp(b,by){if(Math.random()>0.18)return false;
  const ang=Math.random()*Math.PI*2,dd=rnd(1,3),T=rnd(0.75,1.0),dx=Math.cos(ang),dy=Math.sin(ang)*0.8,l=Math.hypot(dx,dy)||1;
  G.air={sx:b.x,sy:b.y,dx:dx/l,dy:dy/l,D:dd,tx:b.x+dx/l*dd,ty:b.y+dy/l*dd,v:dd/T,T,vz:(GRAV*T*T/2-2)/T,t:0,bullet:false,lob:true,tried:new Set([by]),intended:null,cur:null,tip:true,spq:0.25};
  G.cm=null;G.im=null;G.ballState='air';flash('Tipped! Up for grabs!');G.cheer=Math.max(G.cheer||0,0.7);try{SFX.hit(false);}catch(e){}return true;}
function gpTipStep(a,b){
  // players nearby go for it (the user steers his own man)
  for(const e of G.ents){if(e.down||e===G.uctl&&!e.side||e.eng>0)continue;const k=Math.hypot(e.x-a.tx,e.y-a.ty);if(k<7&&e!==G.uctl){const s=(e.spd||6)*0.9;e.vx=(a.tx-e.x)/(k||1)*s;e.vy=(a.ty-e.y)/(k||1)*s;}}
  if(b.h>2.7)return;
  let best=null,bd=1.05;for(const e of G.ents){if(e.down||a.tried.has(e)||e.eng>0)continue;const k=Math.hypot(e.x-b.x,e.y-b.y);if(k<bd){bd=k;best=e;}}
  if(!best)return;a.tried.add(best);
  const pl=best.pl||{},p=best.side==='o'?0.48+((pl.hands||65)-70)*0.006:0.38+((pl.cov||pl.hands||60)-70)*0.005;
  if(Math.random()<clamp(p,0.15,0.75)){if(best.side==='d')G.picker=best;catchBall(best,'high',b);if(best.side==='o')flash('Caught the tip!');}
}
function airStep(dt){
  intMeterUpdate();
  const a=G.air;a.t+=dt;const b=ballAt(a,a.t);a.cur=b;
  if(a.tip){if(b.h<=0||b.x<-1||b.x>FW+1){G.loose={x:clamp(b.x,0,FW),y:b.y,h:0.2,vx:0,vy:0,vh:1.2,kind:'inc',t:0};endPlay({type:'inc',pbu:true});return;}if(a.t>0.08)gpTipStep(a,b);return;}
  if(b.x<-1||b.x>FW+1||b.y>121||b.y<-1){G.loose={x:clamp(b.x,0,FW),y:clamp(b.y,0,120),h:0.3,vx:0,vy:0,vh:0,kind:'inc',t:0};endPlay({type:'inc'});return;}
  if(b.h<=0){G.loose={x:b.x,y:b.y,h:0.2,vx:a.dx*2,vy:a.dy*2,vh:2,kind:'inc',t:0};endPlay({type:'inc'});return;}
  if(a.t<0.12)return;
  const dB=e=>Math.hypot(e.x-b.x,e.y-b.y);
  // DPI judgement when the ball reaches the intended receiver
  if(!a.dpiChecked&&a.intended&&dB(a.intended)<2.2&&b.h<3){
    a.dpiChecked=true;
    for(const d of G.ents)if(d.side==='d'&&!d.down&&dist(d,a.intended)<0.75&&d.y>a.intended.y-0.3&&Math.random()<0.045){
      G.fouls.push({team:1-G.offTeam,kind:'Pass interference',yds:15,afd:true,spotY:a.intended.y,dpi:true});throwFlag(nearestRef(d));break;}
  }
  // user-controlled defender playing the ball (timed with the interception meter)
  const U=(G.im&&G.im.def&&G.im.tapped!=null)?G.im.def:G.uctl;
  if(U&&U.side==='d'&&U.catchT>0&&!a.tried.has(U)&&b.h<3.4&&dB(U)<2.3){
    a.tried.add(U);U.catchT=0;
    let rn=99;for(const r of G.recv)rn=Math.min(rn,dist(r,b));
    let pInt=clamp(0.88-0.32*dB(U)-(rn<dB(U)?0.25:0)-(b.h>2.6?0.12:0)+(U.pl.hands-65)*0.004+((U.pl.cov||70)-75)*0.003,0.04,0.86);
    const IM=G.im;
    if(IM){const c=IM.c;
      if(IM.result==='PERFECT')pInt=clamp(0.9-0.5*c-0.12*dB(U)+(U.pl.hands-65)*0.003,0.12,0.9);
      else if(IM.result==='GOOD')pInt=clamp(0.45-0.35*c-0.1*dB(U),0.04,0.45);
      else pInt=0.02;
      IM.doneAt=G.time;}
    U.ca={type:b.h>2.3?'high':'poss',t:0,dur:0.5};
    pInt=Math.min(0.92,pInt*slf(U.team,'int',0.6));if(gpGod()&&gpGod().picks)pInt=1.01;
    if(Math.random()<pInt){G.picker=U;catchBall(U,b.h>2.3?'high':'poss',b);return;}
    {let rh=60;for(const r of G.recv)if(dist(r,b)<2.2)rh=Math.max(rh,r.pl.hands||60);
      const res=G.im?G.im.result:null,pB=clamp((res==='PERFECT'?0.42:res==='GOOD'?0.26:G.im?0.06:0.2)+((U.pl.cov||70)-72)*0.009+((U.pl.awr||70)-70)*0.002-(rh-70)*0.004-dB(U)*0.08-(rn<dB(U)?0.12:0),0.03,0.55);
      if(Math.random()<pB+gpPbuForm(U)){U.swat=0.4;G.gpPbu=U;if(gpTipUp(b,U))return;G.loose={x:b.x,y:b.y,h:b.h,vx:rnd(-3,3),vy:-2,vh:2,kind:'inc',t:0};flash('Pass broken up!');endPlay({type:'inc',pbu:true});return;}}
  }
  if(b.h<=(gpGod()&&gpGod().picks&&G.offTeam===1?3.8:3.0)){
    for(const d of G.ents){
      if(d.side!=='d'||d===U||a.tried.has(d)||d.down||d.eng>0||dB(d)>(gpGod()&&gpGod().picks&&d.team===0?1.6:0.85+clamp(((d.pl.cov||65)-75)*0.01,-0.1,0.25)+((d.pl.ht||71)-71)*0.015+((d.pl.jmp||75)-75)*0.006))continue;
      a.tried.add(d);
      const closer=G.recv.some(r=>!r.down&&dB(r)<dB(d)+0.6);
      let rh=60;for(const rr of G.recv)if(dB(rr)<2.4)rh=Math.max(rh,rr.pl.hands||60);
      const _gp=gpGod()&&gpGod().picks&&d.team===0,r=Math.random(),pi=_gp?1.01:Math.max(0,(closer?0.05:(a.bullet?0.18:0.24)+(d.pl.hands-65)*0.003+gpDefMods(d.pl).intc)*slf(d.team,'int',0.6)-((d.role==='LB'||d.role==='DL')&&G.qb&&G.qb.pl?clamp((G.qb.pl.ht||74)-74,-3,5)*0.012:0)),
        pb=pi+(closer?clamp(0.04+(d.pl.cov-75)*0.004+((d.pl.awr||70)-70)*0.002-(rh-70)*0.003+(a.D>18?0.04:0),0.01,0.16):clamp(0.16+(d.pl.cov-72)*0.006+((d.pl.awr||70)-70)*0.002-(rh-70)*0.003,0.05,0.38));
      if(r<pi){G.picker=d;catchBall(d,b.h>2.3?'high':'poss',b);return;}
      if(r<pb+gpPbuForm(d)){d.swat=0.4;G.gpPbu=d;G.loose={x:b.x,y:b.y,h:b.h,vx:rnd(-3,3),vy:-2,vh:2,kind:'inc',t:0};endPlay({type:'inc',pbu:true});return;}
    }
  }
  const I=a.intended;
  if(a.T-a.t<0.42&&!a.jumped){
    const land=ballAt(a,a.T),contestedLand=G.ents.some(d=>d.side==='d'&&!d.down&&Math.hypot(d.x-land.x,d.y-land.y)<1.6);
    if(land.h>2.1||contestedLand){a.jumped=true;
      for(const e of G.ents){if(e.down||e.eng>0||e.role==='OL'||e.role==='DL'||e===G.qb)continue;
        if(Math.hypot(e.x-land.x,e.y-land.y)<(e===I?2.2:1.7)){e.jumpT=0.55;e.dir=Math.sign(G.qb.y-e.y)*-1||e.dir;}}
      if(contestedLand)flash('Jump ball!');}
  }
  for(const r of G.recv){
    if(a.tried.has(r)||r.down)continue;
    const dd=dB(r);let dn=99;for(const d of G.ents)if(d.side==='d'&&!d.down)dn=Math.min(dn,Math.hypot(d.x-r.x,d.y-r.y));
    const contested=dn<1.1;let type=null;
    if(dd<1.3&&b.h>2.4&&b.h<=3.6+((r.pl.ht||72)-72)*0.035&&(dn<1.0||r.jumpT>0))type='high';
    else if(dd<(a.D<14?2.2:1.6)&&b.h<=(a.D<14?2.9:2.6)){if(b.h<0.9)type='low';}
    else if(r===I&&dd<2.6&&b.h<1.4&&b.h>0.15&&a.t>a.T*0.9)type='dive';
    else continue;
    a.tried.add(r);
    if(!type){const rs=Math.hypot(r.vx,r.vy),along=(r.vx*a.dx+r.vy*a.dy)/(rs||1);
      type=contested?'poss':rs>2.5&&along>0.6&&a.D>15?'shoulder':dd>1.1?'onehand':'hands';}
    let p={hands:.95,shoulder:.91,onehand:.78,high:.82,low:.87,poss:.72,dive:.73}[type]-(contested&&type!=='poss'?0.14:0)+(((contested&&r.pl.cit)?r.pl.cit:r.pl.hands)-80)*0.003+sla(r.team,'cat',0.12);
    // v2.15 jump balls and contested catches: the better player (hands vs coverage, overall, height) usually wins
    if(contested||type==='high'){let cd=null,ck=1.6;for(const d of G.ents)if(d.side==='d'&&!d.down){const k=Math.hypot(d.x-r.x,d.y-r.y);if(k<ck){ck=k;cd=d;}}
      if(cd&&cd.pl&&r.pl){const rq=0.5*(r.pl.cit||r.pl.hands||70)+0.3*(r.pl.ovr||70)+0.2*(r.pl.jmp?(r.pl.str+r.pl.jmp)/2:(r.pl.str||60)),dq=0.5*(cd.pl.cov||65)+0.3*(cd.pl.ovr||70)+0.2*(cd.pl.awr||70);
        p+=clamp((rq-dq)*0.011,-0.32,0.12)+clamp(((r.pl.ht||72)-(cd.pl.ht||71))*0.013,-0.1,0.1)-0.06*(1-ck/1.6);
        const IM=G.im;if(IM&&IM.def===cd)p-=IM.result==='PERFECT'?0.14:IM.result==='GOOD'?0.06:0;}}
    const M=G.cm;
    if(M&&r===M.target){
      const D=M.diff;
      if(M.result==='PERFECT')p=Math.min(0.99,p+0.12+0.18*D);
      else if(M.result==='GOOD')p=Math.min(0.97,p+0.03+0.06*D);
      else if(M.need)p*=lerp(0.95,0.45,D)*(M.result?1.05:1);
      else p-=M.result?0.04+0.06*D:0;
      M.doneAt=G.time;M.u=clamp(a.t/a.T,0,1);
    }else if(!isAI(r.team)&&!G.test&&!pcAI(r))p-=0.05;
    if(!isAI(r.team)&&!G.test&&a.D<14&&!contested&&!(M&&r===M.target&&M.need&&M.result&&M.result!=='PERFECT'&&M.result!=='GOOD'))p=Math.max(p,0.94);
    const _gc=gpGod()&&r.team===0&&G.godCatch&&G.godCatch!=='auto'?G.godCatch:null;
    type=_gc||gpCatchVariant(type,r,b,a,dd,dn);
    p+=gpCatchMod(r,type)-gpDropForm(r);if(isAI(r.team)||G.test)p-=0.05;
    if(type==='slide')p=Math.min(p,0.62)-0.08;
    p-=WX.drop;
    if(_gc)p=1.01;
    if(Math.random()<p){catchBall(r,type,b);return;}
    r.ca={type,t:0,dur:CATCH_DUR[type],drop:true};
    // a defender draped on the receiver gets credit for breaking it up; an uncontested miss is a drop
    if(contested){let bd=null,bk=1.2;for(const d of G.ents)if(d.side==='d'&&!d.down){const k=Math.hypot(d.x-r.x,d.y-r.y);if(k<bk){bk=k;bd=d;}}
      if(bd){bd.swat=0.4;G.gpPbu=bd;if(gpTipUp(b,bd))return;G.loose={x:b.x,y:b.y,h:b.h,vx:rnd(-2,2),vy:-1.5,vh:1.8,kind:'inc',t:0};flash('Broken up!');endPlay({type:'inc',pbu:true});return;}}
    G.gpDrop=r;if(r.pl)r.pl.gDrops=(r.pl.gDrops||0)+1;
    G.loose={x:b.x,y:b.y,h:b.h,vx:rnd(-1,1),vy:rnd(-1,1),vh:1.5,kind:'inc',t:0};flash('Dropped');endPlay({type:'inc',drop:true});return;
  }
}

