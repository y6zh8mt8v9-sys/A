/* ===================== input ===================== */
function lp(ev){const r=cv.getBoundingClientRect(),x=(ev.clientX-r.left)*W/r.width,y=(ev.clientY-r.top)*H/r.height,Z=G.zm;return Z?{x:Z.cx+(x-Z.cx)/Z.z,y:Z.cy+(y-Z.cy)/Z.z}:{x,y};}
function screenToSimDir(e,sx,sy){
  const[wx,wy]=toW(e.x,e.y),o=proj(wx,wy),ax=proj(wx+1,wy),ay=proj(wx,wy+1);
  const a=ax.sx-o.sx,b=ay.sx-o.sx,c=ax.sy-o.sy,d=ay.sy-o.sy,det=a*d-b*c;
  let fx=(d*sx-b*sy)/det,fy=(-c*sx+a*sy)/det;const l=Math.hypot(fx,fy)||1;fx/=l;fy/=l;
  return G.flip?[-fx,-fy]:[fx,fy];
}
function aimFromPtr(){
  const P=G.ptr,px=P.sx-P.x,py=P.sy-P.y,L=Math.hypot(px,py);
  const[fx,fy]=screenToSimDir(G.qb,px,py);
  if(L<16||fy<-0.35){G.aim={run:true};return;}
  {const mx=gpMaxD(),D=L*0.3;G.aim={run:false,dx:fx,dy:fy,D:clamp(D,4,mx),max:D>=mx};}
}
function userCarrier(){return G.phase==='live'&&G.carrier&&!isAI(G.carrier.team)&&!pcAI(G.carrier)&&G.carrier.team===G.act&&!G.test&&G.ballState==='carrier';}
// v2.16 pocket movement
function gpPocketStep(){
  G.pocketV=null;if(G.client||!passingUser()||!G.qb)return;
  let sx=0,sy=0;
  if(G.pjoy){sx=G.pjoy.x-G.pjoy.ox;sy=G.pjoy.y-G.pjoy.oy;}
  else if(G.pad){sx=G.pad.x*30;sy=G.pad.y*30;}
  else{if(keys.has('arrowleft')||keys.has('a'))sx-=30;if(keys.has('arrowright')||keys.has('d'))sx+=30;if(keys.has('arrowup')||keys.has('w'))sy-=30;if(keys.has('arrowdown')||keys.has('s'))sy+=30;}
  const m=Math.hypot(sx,sy);if(m<5)return;
  const[fx,fy]=screenToSimDir(G.qb,sx,sy),mag=Math.min(1,m/26);G.pocketV=[fx*G.qb.spd*0.42*mag,fy*G.qb.spd*0.42*mag];G.qb.back=false;
}
function userDefender(){return G.phase==='live'&&G.uctl&&G.uctl.team===G.act&&!G.uctl.down&&!(G.carrier===G.uctl);}
cv.addEventListener('pointerdown',ev=>{
  ev.preventDefault();
  if(G.meter&&G.phase==='presnap'){meterTap();return;}
  const p=lp(ev),now=performance.now();
  if(G.phase==='presnap'&&G.play&&G.play.kind==='scrimmage'&&G.offTeam!==G.me&&!isAI(G.me)&&!G.test&&!pcOn()){
    let best=null,bd=22;for(const e of(G.client?olEnts():G.ents)){if(e.team!==G.me||!['LB','CB','NB','S'].includes(e.role))continue;const[wx,wy]=toW(e.x,e.y),q=proj(wx,wy);const d=Math.hypot(q.sx-p.x,q.sy-12-p.y);if(d<bd){bd=d;best=e;}}
    if(best){if(G.client){olCmd('pick',{n:best.nk});return;}G.uctl=best;G.uSlot=best.slot;G.uSlotT[G.me]=best.slot;setCtl();}
    if(G.client)return;
  }
  if(G.phase==='presnap'&&G.play&&G.play.kind==='scrimmage'&&G.play.off.kind==='pass'&&G.offTeam===G.me&&!isAI(G.me)&&!G.test&&!pcAIQB()){
    let best=null,bd=26;for(const e of(G.client?olRecvEnts():G.ents)){if(e.team!==G.me||!['WR','TE','RB'].includes(e.role))continue;const[wx,wy]=toW(e.x,e.y),q=proj(wx,wy);const d=Math.hypot(q.sx-p.x,q.sy-14-p.y);if(d<bd){bd=d;best=e;}}
    if(best){gpAudOpen(best);return;}
  }
  // a thumb already on the stick before the snap steers from the first step (it used to need a second press after the snap)
  if(G.phase==='presnap'&&!G.ptr&&gpPreJoy()){try{cv.setPointerCapture(ev.pointerId);}catch(_){}
    G.ptr={id:ev.pointerId,sx:p.x,sy:p.y,x:p.x,y:p.y,t0:now,moved:0,ox:p.x,oy:p.y,ot:now,fired:false,pre:true};G.joy={ox:p.x,oy:p.y,x:p.x,y:p.y};return;}
  if(G.phase!=='live')return;
  if(G.cm&&G.ballState==='air'&&catchMeterTap())return;
  if(G.im&&G.ballState==='air'&&G.im.tapped==null&&intMeterTap())return;
  if(G.ptr&&ev.pointerId!==G.ptr.id){if(passingUser())gpCyclePT();else if(G.joy)gpTapPick(p);return;}
  // v2.14: on defense, tap one of your players during the play to take control of him (then keep holding to steer him)
  const switched=gpTapPick(p);
  try{cv.setPointerCapture(ev.pointerId);}catch(_){}
  G.ptr={id:ev.pointerId,sx:p.x,sy:p.y,x:p.x,y:p.y,t0:now,moved:0,ox:p.x,oy:p.y,ot:now,fired:false};
  // after a switch the new man keeps running the way you were steering until you move your thumb
  if(userDefender()&&!userCarrier()){const L=G.lastJoy,c=switched&&L&&G.time-L.t<1&&Math.hypot(L.sx,L.sy)>6;G.joy={ox:p.x-(c?L.sx:0),oy:p.y-(c?L.sy:0),x:p.x,y:p.y};}
  else if(passingUser()&&G.qb&&!G.client){const[wx,wy]=toW(G.qb.x,G.qb.y),q=proj(wx,wy);if(Math.hypot(q.sx-p.x,q.sy-12-p.y)<22){G.pjoy={ox:p.x,oy:p.y,x:p.x,y:p.y};G.ptr.pocket=true;}}
});
cv.addEventListener('pointermove',ev=>{
  const P=G.ptr;if(!P||ev.pointerId!==P.id||(G.phase!=='live'&&!(P.pre&&G.phase==='presnap')))return;
  const p=lp(ev),now=performance.now();P.x=p.x;P.y=p.y;P.moved=Math.max(P.moved,Math.hypot(p.x-P.sx,p.y-P.sy));
  if(userCarrier()){
    const dx=p.x-P.ox,dy=p.y-P.oy;
    if(Math.hypot(dx,dy)>16&&(!P.fired||now-P.ot>220)){
      if(Math.abs(dy)>Math.abs(dx))tryJuke(Math.sign(dy)*(G.flip?-1:1));else if(dx>0)tryDive();else trySlow();
      P.fired=true;P.ox=p.x;P.oy=p.y;P.ot=now;
    }
  }else if(G.joy){G.joy.x=p.x;G.joy.y=p.y;}
  else if(G.pjoy&&P.pocket){G.pjoy.x=p.x;G.pjoy.y=p.y;}
  else if(passingUser()&&P.moved>6)aimFromPtr();
});
cv.addEventListener('pointerup',ev=>{
  const P=G.ptr;if(!P||ev.pointerId!==P.id)return;G.ptr=null;
  if(G.joy)G.lastJoy={sx:G.joy.x-G.joy.ox,sy:G.joy.y-G.joy.oy,t:G.time};G.joy=null;
  if(G.phase!=='live')return;
  if(P.pocket){G.pjoy=null;G.aim=null;return;}
  // v2.16 mouse: a quick click on the field tackles on defense (Settings → Click to tackle)
  if(ev.pointerType==='mouse'&&GDS.clickTk!==false&&userDefender()&&!userCarrier()&&gpDefending(G.me)&&P.moved<6&&performance.now()-P.t0<300){userTackle();return;}
  if(!passingUser()){G.aim=null;return;}
  const dur=performance.now()-P.t0;
  if(G.aim&&!G.aim.run)userThrow();
  else if(G.aim&&G.aim.run&&P.moved>6)scramble();
  else if(P.moved<8&&dur<350)gpCyclePT(); // a quick tap switches bullet / lob
  G.aim=null;
});
cv.addEventListener('pointercancel',ev=>{if(G.ptr&&ev.pointerId===G.ptr.id){G.ptr=null;G.aim=null;G.joy=null;G.pjoy=null;}});
const keys=new Set();
addEventListener('keydown',ev=>{
  const k=String(ev.key||'').toLowerCase();if(!k)return; // Chrome autofill sends key events without a key
  if(G.phase==='replay'&&k==='escape'){exitReplay();return;}
  if((k==='escape'||k==='p')&&!G.client&&G.phase!=='over'&&!G.recVid&&!(ev.target&&/INPUT|SELECT|TEXTAREA/.test(ev.target.tagName))){gpPause(!G.paused);ev.preventDefault();return;}
  if(G.paused)return;
  if(G.celebPick&&G.celebPick.team===G.me&&!G.celebPick.celeb&&/^[0-9]$/.test(k)){const c=TD_CELEBS[(+k||10)-1];if(c){startCeleb(G.celebPick,c[0]);setTray('dead');ev.preventDefault();return;}}
  if(k==='t'&&G.phase==='presnap'&&G.play&&G.play.kind==='scrimmage'&&G.to[G.me]>0&&!isAI(G.me)){if(callTimeout(G.me))setTray('presnap');return;}
  if((k==='v'||k==='y'||k==='n')&&gpDAdjOK()){gpDAdj(k==='v'?'cov':k==='y'?'spy':'con');return;}
  if(KB.wait){return;}
  if(k==='b'&&pcOn()){pcCallBall();ev.preventDefault();return;}
  if(G.phase==='live'&&passingUser()){if(/^[1-5]$/.test(k)&&gpKeyThrow(+k-1)){ev.preventDefault();return;}if(k===kb('scramble')){scramble();ev.preventDefault();return;}
    if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(k)){keys.add(k);ev.preventDefault();return;}}
  if(k===' '&&G.meter&&G.phase==='presnap'){meterTap();ev.preventDefault();return;}
  if(G.phase==='presnap'&&(k==='enter'||k===' ')&&G.play&&(G.play.kind==='scrimmage'&&G.offTeam===G.me||G.play.fake&&(G.play.kind==='punt'?G.play.puntTeam:G.offTeam)===G.me)&&!G.meter&&!/INPUT|SELECT|TEXTAREA/.test((document.activeElement||{}).tagName||'')&&$('call').hidden&&$('modal').hidden){try{document.activeElement&&document.activeElement.blur&&document.activeElement.blur();}catch(e){}doSnap();ev.preventDefault();return;}
  if(G.phase!=='live')return;
  if(k===' '&&G.cm&&G.ballState==='air'){catchMeterTap();ev.preventDefault();return;}
  if(k===' '&&G.im&&G.ballState==='air'){intMeterTap();ev.preventDefault();return;}
  if(k===' '&&passingUser()){gpCyclePT();ev.preventDefault();return;}
  if(userCarrier()){
    if(['arrowup','arrowdown','arrowleft','arrowright'].includes(k)){keys.add(k);ev.preventDefault();} // v2.16 steer the runner, full speed every way
    else if(k===kb('jukeU')){tryJuke(-1*(G.flip?-1:1));ev.preventDefault();}
    else if(k===kb('jukeD')){tryJuke(1*(G.flip?-1:1));ev.preventDefault();}
    else if(k===kb('dive')){tryDive();ev.preventDefault();}
    else if(k===kb('slow')){trySlow();ev.preventDefault();}
    else if(k===kb('spin'))trySpin();else if(k===kb('stiff'))tryStiff();else if(k===kb('truck'))tryTruck();else if(k===kb('hurdle'))tryHurdle();else if(k==='k'&&G.kneelOK>0)olKneel();
    return;
  }
  if(k===kb('fair')&&G.play.kind==='punt'&&G.offTeam===G.me){olFair();}
  if(k===kb('switch')&&gpDefending(G.me)){switchUser();ev.preventDefault();return;}
  if(G.uctl&&G.uctl.team===G.me){
    if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(k)){keys.add(k);ev.preventDefault();}
    else if(k===kb('tackle'))userTackle();else if(k===kb('form'))userTackle('form');else if(k===kb('stick'))userTackle('stick');else if(k===kb('bite'))userTackle('bite');
    else if(k===kb('sprint')){keys.add(k);ev.preventDefault();}else if(k===kb('play')){intMeterTap();}
  }
});
addEventListener('keyup',ev=>keys.delete(String(ev.key||'').toLowerCase()));
function gpPreJoy(){ // who gets a pre-snap stick: your defender, or your Player Career man (not as quarterback)
  if(G.client||G.test||!G.play||G.play.kind!=='scrimmage'||isAI(G.act)&&!pcOn())return false;
  return pcOn()?!pcMe(G.qb):G.offTeam!==G.me&&!!G.uctl;
}
function gpTapPick(p){ // tap one of your defenders during the play to take him over
  if(!(gpDefending(G.me)&&!isAI(G.me)&&!G.test&&!userCarrier()&&!pcOn()))return false;
  try{let best=null,bd=20;for(const e of(G.client?olEnts():G.ents)){if(e.team!==G.me||e===G.uctl||e.down||e.hurt||['K','P','H'].includes(e.role))continue;
      const[wx,wy]=toW(e.x,e.y),q=proj(wx,wy);const d=Math.hypot(q.sx-p.x,q.sy-12-p.y);if(d<bd){bd=d;best=e;}}
    if(!best)return false;if(G.client){olCmd('pick',{n:best.nk});return true;}
    best.idle=0;G.uctl=best;if(['LB','CB','NB','S'].includes(best.role)){G.uSlot=best.slot;G.uSlotT[G.me]=best.slot;}setCtl();return true;
  }catch(_){return false;}
}
function userJoyStep(){
  G.joyV=null;const u=G.uctl;if(!u||G.phase!=='live'||u.down||u===G.carrier)return;
  if(ON&&u.team!==G.me){ // the guest steers this defender: its stick arrives as a direction in field coordinates
    const J=G.rjoy;if(!J||J.m<0.15||G.time-J.t>1.5){u.idle=(u.idle||0)+1/60;if(u.idle<0.7)G.joyV=[u.vx*0.9,u.vy*0.9];return;}
    u.idle=0;const sp=gpSprintOn()?SPRINT:1;G.joyV=[J.v[0]*u.spd*J.m*sp,J.v[1]*u.spd*J.m*sp];return;}
  let sx=0,sy=0;
  const kd=['arrowleft','arrowright','arrowup','arrowdown','w','a','s','d'].some(k=>keys.has(k));
  if(G.joy){sx=G.joy.x-G.joy.ox;sy=G.joy.y-G.joy.oy;}
  else if(G.pad&&!kd){sx=G.pad.x*30;sy=G.pad.y*30;}
  else{if(keys.has('arrowleft')||keys.has('a'))sx-=30;if(keys.has('arrowright')||keys.has('d'))sx+=30;if(keys.has('arrowup')||keys.has('w'))sy-=30;if(keys.has('arrowdown')||keys.has('s'))sy+=30;}
  const m=Math.hypot(sx,sy);if(pcOn()&&u.side==='d'&&G.play&&!G.play.uT){if(m<4)return;G.play.uT=1;} // career: until you steer, your defender plays his assignment
  if(m<4){u.idle=(u.idle||0)+1/60;if(u.pcRan&&u.side==='o'){G.joyV=[u.vx,u.vy];return;}if(u.idle<0.7&&!G.joy)G.joyV=[u.vx*0.9,u.vy*0.9];return;}
  if(pcOn()&&u.side==='o')u.pcRan=true;
  u.idle=0;const[fx,fy]=screenToSimDir(u,sx,sy),mag=Math.min(1,m/26);
  const sp=u.side==='d'&&gpSprintOn()?SPRINT:1;G.joyV=[fx*u.spd*mag*sp,fy*u.spd*mag*sp];
}

