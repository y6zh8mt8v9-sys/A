/* ===================== snapshots (live + replay share one renderer) ===================== */
function snapOf(e,copy){
  if(!e.pp)easePose(e,0);
  const[wx,wy]=toW(e.x,e.y);let dir=G.flip?-e.dir:e.dir;
  if(e.spin>0&&!G.spr)dir*=(Math.floor(e.spin/0.09)%2?-1:1);
  {const cf=celebFlip(e);if(cf)dir=cf;}
  const pp=copy?Object.fromEntries(JK.map(k=>[k,[e.pp[k][0],e.pp[k][1]]])):e.pp;
  const cf=gpFx(e,dir);if(cf.flip)dir=-dir;
  return{wx,wy,dir,pp,bob:e.pp.bob||0,flat:e.pp.flat,jz:(e.jz||0)+cf.jz,rot:cf.rot,sq:cf.sq,body:e.pl?e.pl.body:e.body,kit:e.pl?KITS[e.team]:REFKIT,look:e.pl?e.pl.look:e.refLook,
    num:e.pl?e.pl.num:null,ball:e.pp.ball?[...e.pp.ball]:null,ref:!e.pl,team:e.team,cap:e.slot==='R'?'#f4f4f4':'#151515',
    mark:G.phase==='live'&&e===G.carrier?'c':(e===G.uctl||pcOn()&&pcMe(e))&&!G.test?'u':null,ring:G.phase==='presnap'&&e.route&&!isAI(G.offTeam)?e.route.col:null,
    star:G.phase==='presnap'&&e.pl&&!e.bench&&e.pl.stars>=2?Math.min(5,e.pl.stars|0):0,
    tag:G.phase==='presnap'&&e.pl&&!e.bench&&(['QB','RB','WR','TE','KR','PR'].includes(e.role)||e.side==='d'||e===G.uctl)?`#${e.pl.num} ${nm(e.pl)}${e.pl.ovr?' · '+e.pl.ovr:''}${e.pl.stamina!=null&&e.pl.stamina<70?' · '+Math.round(e.pl.stamina)+'% legs':''}`:null,
    stun:e.stun>0&&!e.down,hurt:e.hurt,pk:packInfo(e),fade:e.bench&&e.team===0&&gpNearAction(e),qbBall:e===G.qb&&(G.ballState==='qb'||e.slideT>0)&&(G.phase==='live'||G.phase==='replay')};
}
function ballWorld(){
  const B=G.ballState;let b=null;
  if(B==='pre'&&G.linesW)b={x:CX,y:G.linesW.los-0.4,h:0.15};
  else if(B==='tee'&&G.play.kicker)b={x:CX,y:G.play.kicker.hy-3.5,h:0.25};
  else if(B==='snap'&&G.snapB&&G.snapB.to){const S=G.snapB,u=Math.min(1,S.t/S.T);b={x:lerp(S.from[0],S.to[0],u),y:lerp(S.from[1],S.to[1],u),h:0.4+Math.sin(u*Math.PI)*0.7+u*0.8+(S.bad==='high'?Math.sin(u*Math.PI)*1.8+u*0.6:S.bad==='low'?-u*0.9:0)};}
  else if(B==='held'&&G.play.holder)b={x:G.play.holder.x,y:G.play.holder.y+0.4,h:0.2};
  else if(B==='air'&&G.air){b=Object.assign({},G.air.cur||ballAt(G.air,0));const n=ballAt(G.air,(G.air.t||0)+0.05),[a1,a2]=toW(n.x,n.y);b.k='pass';b.q=G.air.spq!=null?G.air.spq:0.7;b.n=[a1,a2,n.h];}
  else if(B==='kick'&&G.kick){const K=G.kick;b=Object.assign({},K.cur||{x:K.sx,y:K.sy,h:0.3});b.k=K.type==='punt'?'punt':'kick';b.q=K.type==='punt'?clamp(0.35+(K.res?0.5*(1-Math.abs(K.res.acc)):0.3),0.1,0.95):0.6;
    if(K.cur&&K.t<K.T){const n=kickPos(K,Math.min(K.T,K.t+0.05)),[a1,a2]=toW(n.x,n.y);b.n=[a1,a2,n.h];}}
  else if((B==='loose'||G.loose)&&G.loose&&!(B==='carrier'))b={x:G.loose.x,y:G.loose.y,h:G.loose.h};
  if(!b&&G.cball&&G.phase!=='live')b=G.cball;
  if(!b)return null;const[wx,wy]=toW(b.x,b.y);const o={wx,wy,h:b.h};if(b.k){o.k=b.k;o.q=b.q;o.n=b.n;}else if(B==='loose'||G.loose)o.k='loose';return o;
}
function frameData(copy){
  const list=G.ents.concat(G.refs).concat(G.side||[]);if(!copy&&ON)OL.list=list;
  const ents=list.map(e=>snapOf(e,copy));
  if(!copy&&ON)for(let i=0;i<ents.length;i++)ents[i].e=OL.list[i];
  return{ents,ball:ballWorld(),flags:G.flags.map(f=>({...f})),camY:G.camY,anch:G.anch,lines:G.linesW?{los:toW(0,G.linesW.los)[1],fd:G.linesW.fd!=null?toW(0,G.linesW.fd)[1]:null}:null};
}

/* ===================== drawing ===================== */
function drawEntity(S){
  const p=proj(S.wx,S.wy,0);if(p.sx<-60||p.sx>W+60)return;
  const z=p.k*0.0212,lift=S.jz*p.k,usePack=S.pk&&G.spr;
  if(!usePack||S.jz>0.05){ctx.fillStyle='rgba(8,30,15,.3)';ctx.beginPath();
  ctx.ellipse(p.sx+(S.flat?14*z*S.dir:0),p.sy,(S.flat?40:20)*z*(1-S.jz*0.3),5.5*z*(1-S.jz*0.3),0,0,Math.PI*2);ctx.fill();}
  if(S.ring&&G.offTeam===G.me){ctx.strokeStyle='rgba(8,30,50,.8)';ctx.lineWidth=3.4;ctx.beginPath();ctx.ellipse(p.sx,p.sy,22*z,6*z,0,0,Math.PI*2);ctx.stroke();ctx.strokeStyle=S.ring;ctx.lineWidth=1.8;ctx.stroke();}
  const MK=S.mark==='u'&&S.team!==G.me?null:S.mark;
  if(MK==='u'){ctx.strokeStyle='rgba(8,30,50,.8)';ctx.lineWidth=3.6;ctx.beginPath();ctx.ellipse(p.sx,p.sy,24*z,6.5*z,0,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#ffd23f';ctx.lineWidth=2;ctx.stroke();}
  const sp={...S,pp:{...S.pp},ball:S.ball};
  if(S.fade)ctx.globalAlpha=0.38;
  if(usePack)drawPack(S,p,z);else drawSprite(sp,p.sx,p.sy-lift+S.bob*z,z,S.dir);
  ctx.globalAlpha=1;
  const top=p.sy-lift-104*z*(S.body?S.body.hs:1);
  if(MK){const g=ctx.createLinearGradient(0,top-7,0,top);g.addColorStop(0,MK==='c'?'#bff0ff':'#fff4b8');g.addColorStop(1,MK==='c'?'#1aa3e8':'#f2b632');
    ctx.fillStyle=g;ctx.strokeStyle='#0b3d5e';ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(p.sx-4,top-7);ctx.lineTo(p.sx+4,top-7);ctx.lineTo(p.sx,top-1);ctx.closePath();ctx.fill();ctx.stroke();}
  if(S.star>=2&&!S.tag)gpStarBadge(p.sx,top-(MK?12:5),S.star);
  if(S.stun){ctx.fillStyle='#ffe14a';for(let i=0;i<3;i++){const a=G.time*7+i*2.1;ctx.beginPath();ctx.arc(p.sx+Math.cos(a)*5,top+2+Math.sin(a)*1.6,1,0,Math.PI*2);ctx.fill();}}
  if(S.hurt){ctx.fillStyle='#ff4d4d';ctx.font='900 7px Archivo, sans-serif';ctx.textAlign='center';ctx.fillText('+',p.sx,top-2);}
}
// v2.06 recruiting stars over the heads before the snap: one star with the number of stars inside
function gpStarBadge(x,y,n,small){
  const R=small?5.2:6,r=small?2.35:2.7;ctx.save();ctx.beginPath();
  for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,d=i%2?r:R;ctx.lineTo(x+Math.cos(a)*d,y+Math.sin(a)*d);}ctx.closePath();
  const g=ctx.createLinearGradient(0,y-R,0,y+R);g.addColorStop(0,n>=5?'#fff3a6':'#ffe680');g.addColorStop(1,n>=5?'#f08a00':'#e8a417');
  ctx.fillStyle=g;ctx.strokeStyle='#5a3a00';ctx.lineWidth=0.7;ctx.fill();ctx.stroke();
  ctx.fillStyle='#2a1a00';ctx.font=small?"900 4.6px Archivo, sans-serif":"900 5.2px Archivo, sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(String(n),x,y+0.7);ctx.restore();
}
function drawTags(list){
  const placed=[];
  for(const S of list){if(!S.tag)continue;const p=proj(S.wx,S.wy,0);if(p.sx<-40||p.sx>W+40)continue;
    const z=p.k*0.0212,k=S.team===G.me?0.8:0.6;let y=p.sy-112*z*(S.body?S.body.hs:1)-6*k; // the opponent's tags are smaller
    ctx.font='800 6px Archivo, sans-serif';const sw=S.star>=2?11:0,w0=ctx.measureText(S.tag).width+8+sw,w=w0*k,hh=11*k;
    for(let g=0;g<6&&placed.some(r=>Math.abs(r[0]-p.sx)<(r[2]+w)/2&&Math.abs(r[1]-y)<(r[3]+hh)/2);g++)y-=hh;placed.push([p.sx,y,w,hh]);
    ctx.save();ctx.translate(p.sx,y);ctx.scale(k,k);
    // a dark plate with the team color down the left edge, like the app's plates
    ctx.fillStyle='rgba(11,31,22,.9)';ctx.beginPath();ctx.roundRect(-w0/2,-5,w0,10,1.5);ctx.fill();
    ctx.fillStyle=S.team===0?'#3f6fc0':'#c0404f';ctx.fillRect(-w0/2,-5,1.6,10);
    if(sw)gpStarBadge(-w0/2+7.5,0,S.star,true);
    ctx.font='700 6px Archivo, sans-serif';ctx.fillStyle='#f1f5ef';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(S.tag,sw/2,0.4);ctx.restore();}
}
function football2(rot,len,phase,lw){
  const L=6.6*len,Wd=3.9,m0=ctx.getTransform();ctx.rotate(rot);
  const shape=()=>{ctx.beginPath();ctx.moveTo(-L,0);ctx.bezierCurveTo(-L*0.55,-Wd*1.34,L*0.55,-Wd*1.34,L,0);ctx.bezierCurveTo(L*0.55,Wd*1.34,-L*0.55,Wd*1.34,-L,0);ctx.closePath();};
  shape();const gr=ctx.createLinearGradient(0,-Wd,0,Wd);gr.addColorStop(0,'#b0612a');gr.addColorStop(0.45,'#87431a');gr.addColorStop(1,'#4e230b');ctx.fillStyle=gr;ctx.fill();
  ctx.save();shape();ctx.clip();
  ctx.fillStyle='rgba(255,214,170,.28)';ctx.beginPath();ctx.ellipse(-L*0.1,-Wd*0.5,L*0.55,Wd*0.32,0,0,Math.PI*2);ctx.fill();
  if(len>0.45){ctx.fillStyle='#f4efe4';for(const sx of[-1,1]){const x=sx*L*0.6;ctx.fillRect(x-0.55,-Wd*1.2,1.1,Wd*2.4);}}
  const c=Math.cos(phase),ly=-Wd*0.62*Math.sin(phase)*0.9;
  if(c>-0.15){ctx.globalAlpha=Math.min(1,(c+0.15)*2.2);ctx.strokeStyle='#f6f2ea';ctx.lineWidth=0.95;ctx.beginPath();ctx.moveTo(-L*0.3,ly);ctx.lineTo(L*0.3,ly);ctx.stroke();
    ctx.lineWidth=0.6;for(let i=-2;i<=2;i++){const x=i*L*0.11;ctx.beginPath();ctx.moveTo(x,ly-0.9);ctx.lineTo(x,ly+0.9);ctx.stroke();}ctx.globalAlpha=1;}
  ctx.restore();
  shape();ctx.lineWidth=lw;ctx.strokeStyle=INK;ctx.stroke();
  ctx.strokeStyle='rgba(40,16,4,.6)';ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(-L*0.96,0);ctx.quadraticCurveTo(0,Wd*0.25,L*0.96,0);ctx.stroke();
  ctx.setTransform(m0);
}
// where a pass or a kick in the air will come down (always in Player Career, or everywhere with the setting on)
function gpLandPt(){
  if(G.phase!=='live')return null;
  if(G.ballState==='air'&&G.air)return{x:G.air.tx,y:G.air.ty,u:G.air.T>0?G.air.t/G.air.T:1};
  if(G.ballState==='kick'&&G.kick&&G.kick.type!=='fg')return{x:G.kick.tx,y:G.kick.ty,u:G.kick.T>0?G.kick.t/G.kick.T:1};
  return null;
}
function drawLand(){
  const m=GDS.land||'pc';if(m==='off'||(m==='pc'&&!pcOn()))return;
  const L=gpLandPt();if(!L||L.u>=1)return;
  const[wx,wy]=toW(L.x,L.y),p=proj(wx,wy,0),u=clamp(L.u,0,1);
  const rx=(1.7-0.9*u)*p.k,ry=rx*HC*p.k/SS*1.1,a=0.55+0.45*u;
  ctx.save();ctx.globalAlpha=a;
  ctx.fillStyle='rgba(255,255,255,.14)';ctx.beginPath();ctx.ellipse(p.sx,p.sy,rx,ry,0,0,Math.PI*2);ctx.fill();
  ctx.lineWidth=2.4;ctx.strokeStyle='rgba(8,20,34,.75)';ctx.stroke();ctx.lineWidth=1.3;ctx.strokeStyle='#fff';ctx.stroke();
  ctx.lineWidth=1.1;ctx.strokeStyle=(GP.ui&&GP.ui.tA)||'#ffd23f';ctx.beginPath();ctx.ellipse(p.sx,p.sy,rx*0.45,ry*0.45,0,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(p.sx,p.sy,1.6,0.8,0,0,Math.PI*2);ctx.fill();
  ctx.restore();
}
function drawBallW(b){
  if(!b)return;const g=proj(b.wx,b.wy,0),p=proj(b.wx,b.wy,vh(b.h)),s=p.k/12;
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(g.sx,g.sy,(b.h>0.6?5:3)*s,(b.h>0.6?1.8:1.1)*s,0,0,Math.PI*2);ctx.fill();
  const big=(b.h>0.6?2.1+Math.min(0.45,b.h*0.05):1.25)*(GDS.ball||1),zz=p.k*0.0212*0.85*big,t=G.time;
  let rot=0.2,len=1,ph=Math.PI/2;
  if(b.n&&(b.k==='pass'||b.k==='punt')){
    // nose follows the flight; a tight spiral holds its line and spins fast, a duck wobbles, tumbles and spins slowly
    const q=b.q!=null?b.q:0.7,n=proj(b.n[0],b.n[1],vh(b.n[2]));let th=Math.atan2(n.sy-p.sy,n.sx-p.sx);if(Math.cos(th)<0)th+=Math.PI;
    const wob=Math.pow(1-q,1.4),f=5.5+5*q;
    rot=th+wob*0.95*Math.sin(t*f)+(q<0.3?(1-q/0.3)*0.5*Math.sin(t*2.3):0);
    len=1-wob*0.42*Math.abs(Math.sin(t*f*0.55));ph=t*(14+30*q);
  }else if(b.k==='kick'&&b.h>0.4){ph=Math.PI/2;rot=t*11;len=0.55+0.45*Math.abs(Math.cos(t*11));}
  else if(b.k==='loose'){rot=t*7;len=0.7+0.3*Math.abs(Math.cos(t*7));ph=t*5;}
  const m0=ctx.getTransform();ctx.translate(p.sx,p.sy);ctx.scale(zz,zz);football2(rot,Math.max(0.35,len),ph,1.1);ctx.setTransform(m0);
}
function drawFlags(fl){for(const f of fl){const p=proj(f.x,f.y,f.h);ctx.fillStyle='#ffe14a';ctx.strokeStyle='#a68600';ctx.lineWidth=0.6;ctx.beginPath();ctx.ellipse(p.sx,p.sy,2.6,1.5,f.h>0?G.time*8:0.4,0,Math.PI*2);ctx.fill();ctx.stroke();}}
function gpMoPreview(e){
  // where the motion man ends up and the route from there (what he will actually run after the snap)
  const MO=G.play.off.data&&G.play.off.data.mo,ly=G.linesW.los;let ex,ey;
  if(G.motion&&G.motion.e===e){ex=G.motion.tx;ey=G.motion.ty;if(G.motion.k==='jet')ey=e.y;}
  else if(!G.moDone){const[tx,td]=gpMoEnd(e.hx,ly-e.hy,MO.k);ex=tx;ey=ly-td;}else return null;
  const R=ROUTES[e.route.name];if(!R)return null;const out=MO.k==='jet'?e.moOut:(ex<CX?-1:1);
  const pts=R.p.map(([dx,dy])=>{let x=ex+dx*out;x=R.fade?clamp(x,3.5,FW-3.5):clamp(x,1.5,FW-1.5);return{x,y:Math.min(119,ey+dy)};});
  return{ex,ey,pts};
}
function drawRoutes(){
  if(G.client){olDrawRoutes();return;}
  if(G.phase!=='presnap'||!G.play||G.play.kind!=='scrimmage'||G.offTeam!==G.me||G.test)return;
  ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
  {const MO=G.play.off.data&&G.play.off.data.mo,e=G.moMan;if(MO&&e&&G.play.off.kind==='run'){const ly=G.linesW.los;let ex,ey;
    if(G.motion&&G.motion.e===e){ex=G.motion.tx;ey=e.y;}else if(!G.moDone){const[tx,td]=gpMoEnd(e.hx,ly-e.hy,MO.k);ex=tx;ey=ly-td;}
    if(ex!=null){const a=toW(e.x,e.y),b=toW(ex,ey),pa=proj(a[0],a[1]),pb=proj(b[0],b[1]);ctx.setLineDash([4,3]);
      for(const[lw,col]of[[4,'rgba(8,30,50,.7)'],[2,'#ffffff']]){ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(pa.sx,pa.sy);ctx.lineTo(pb.sx,pb.sy);ctx.stroke();}ctx.setLineDash([]);}}}
  for(const e of G.recv){
    const r=e.route;let pts=[{x:e.hx,y:e.hy},...r.pts];
    if(e===G.moMan&&G.play.off.data.mo){const M=gpMoPreview(e);
      if(M){const a=toW(e.x,e.y),b=toW(M.ex,M.ey),pa=proj(a[0],a[1]),pb=proj(b[0],b[1]);
        ctx.setLineDash([4,3]);for(const[lw,col]of[[4,'rgba(8,30,50,.7)'],[2,'#ffffff']]){ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(pa.sx,pa.sy);ctx.lineTo(pb.sx,pb.sy);ctx.stroke();}ctx.setLineDash([]);
        pts=[{x:M.ex,y:M.ey},...M.pts];}else if(G.moDone)pts=[{x:e.x,y:e.y},...r.pts];}
    if(r.end==='cont'){const a=pts[pts.length-2],z=pts[pts.length-1],l=Math.hypot(z.x-a.x,z.y-a.y)||1;pts.push({x:clamp(z.x+(z.x-a.x)/l*4,0.8,FW-0.8),y:Math.min(119,z.y+(z.y-a.y)/l*4)});}
    const sp=pts.map(p=>{const[wx,wy]=toW(p.x,p.y);const q=proj(wx,wy);return[q.sx,q.sy];});
    const n=sp.length,[ax,ay]=sp[n-2],[zx,zy]=sp[n-1],ang=Math.atan2(zy-ay,zx-ax);
    for(const[lw,col]of[[5.2,'rgba(8,30,50,.75)'],[2.6,r.col]]){
      ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(sp[0][0],sp[0][1]);for(let i=1;i<n;i++)ctx.lineTo(sp[i][0],sp[i][1]);ctx.stroke();
      ctx.fillStyle=col;ctx.beginPath();
      if(r.end==='settle')ctx.arc(zx,zy,lw>3?4.6:3.2,0,Math.PI*2);
      else{const s=lw>3?8.5:6.2;ctx.moveTo(zx+Math.cos(ang)*s*0.85,zy+Math.sin(ang)*s*0.85);ctx.lineTo(zx+Math.cos(ang+2.5)*s,zy+Math.sin(ang+2.5)*s);ctx.lineTo(zx+Math.cos(ang-2.5)*s,zy+Math.sin(ang-2.5)*s);ctx.closePath();}
      ctx.fill();
    }
  }
  ctx.restore();
}
function passingUser(){return!pcAIQB()&&G.phase==='live'&&G.ballState==='qb'&&!G.pendThrow&&G.play&&G.play.kind==='scrimmage'&&G.play.off.kind==='pass'&&!G.play.special&&!isAI(G.offTeam)&&G.offTeam===G.act&&!G.test;}
function drawAim(){
  if(!G.aim||!passingUser())return;
  const q=G.qb,[qwx,qwy]=toW(q.x,q.y),qp=proj(qwx,qwy),z=qp.k*0.0212;
  if(G.aim.run){chip('RUN',qp.sx,qp.sy-118*z,'#5ccf3c');return;}
  const f=flight(G.aim.D,G.bullet,G.lob),a={sx:q.x,sy:q.y,dx:G.aim.dx,dy:G.aim.dy,v:f.v,vz:f.vz},n=Math.max(6,Math.ceil(G.aim.D/0.9));
  for(let i=1;i<=n;i++){
    const b=ballAt(a,f.T*i/n),[wx,wy]=toW(b.x,b.y),g=proj(wx,wy,0),p=proj(wx,wy,vh(b.h)),r=Math.max(1.6,p.k*0.13);
    if(i%2===0){ctx.fillStyle='rgba(0,0,0,.32)';ctx.beginPath();ctx.ellipse(g.sx,g.sy,r*0.9,r*0.45,0,0,Math.PI*2);ctx.fill();}
    if(i%2===1||i===n){ctx.fillStyle='rgba(8,30,50,.7)';ctx.beginPath();ctx.arc(p.sx,p.sy,r+0.9,0,Math.PI*2);ctx.fill();ctx.fillStyle=G.bullet?'#ffa040':'#fff';ctx.beginPath();ctx.arc(p.sx,p.sy,r,0,Math.PI*2);ctx.fill();}
  }
  // landing zone: where the ball should come down, sized by the QB's expected miss
  const L=ballAt(a,f.T);{const _j=(1-gpAcc(q.pl,G.aim.D)/100)*G.aim.D*0.06;L.x+=Math.sin(G.time*2.3)*_j;L.y+=Math.cos(G.time*1.7)*_j;}
  const[lwx,lwy]=toW(L.x,L.y),lp=proj(lwx,lwy,0);
  const errR=clamp(G.aim.D*((1-gpAcc(q.pl,G.aim.D)/100)*0.24+0.012)*0.7*0.75*(1+Math.max(0,G.aim.D-15)/60)+0.45,0.6,3.4);
  if(G.aim.max)chip('MAX RANGE',lp.sx,lp.sy-16,'#ff6b5a');
  const rx=errR*lp.k,ry=rx*HC*lp.k/SS*1.1,pulse=1+Math.sin(G.time*6)*0.06;
  ctx.fillStyle=G.bullet?'rgba(255,160,64,.18)':'rgba(255,255,255,.16)';ctx.beginPath();ctx.ellipse(lp.sx,lp.sy,rx*pulse,ry*pulse,0,0,Math.PI*2);ctx.fill();
  ctx.setLineDash([3,2.5]);ctx.lineWidth=1.3;ctx.strokeStyle='rgba(8,30,50,.7)';ctx.beginPath();ctx.ellipse(lp.sx,lp.sy,rx*pulse,ry*pulse,0,0,Math.PI*2);ctx.stroke();
  ctx.lineWidth=0.9;ctx.strokeStyle=G.bullet?'#ffa040':'#ffffff';ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle=G.bullet?'#ffa040':'#ffffff';ctx.beginPath();ctx.ellipse(lp.sx,lp.sy,1.8,0.9,0,0,Math.PI*2);ctx.fill();
  if(G.bullet)chip('BULLET',qp.sx,qp.sy-118*z,'#ff8a1a');else if(G.lob)chip('LOB',qp.sx,qp.sy-118*z,'#3fa9f5');
}
// v2.16 controller prompts like the console games: the button over each receiver, PlayStation or Xbox labels by the pad you use
const PADG={xb:{l:['A','B','X','Y','LB','RB','LT','RT'],c:['#3fb44b','#e0372d','#2f7fe3','#f2c230','#cfd6de','#cfd6de','#cfd6de','#cfd6de']},
  ps:{l:['✕','○','□','△','L1','R1','L2','R2'],c:['#6c9cf0','#ec5244','#e07ac2','#3fc495','#cfd6de','#cfd6de','#cfd6de','#cfd6de']}};
function padKind(){const g=padGet();if(!g)return null;if(/xbox|xinput|045e/i.test(g.id))return'xb';return/054c|sony|playstation|dualshock|dualsense|ps[345]|^wireless controller/i.test(g.id)?'ps':'xb';}
function padIcon(i,x,y,s){const K=padKind();if(!K)return;const P=PADG[K],t=P.l[i],c=P.c[i],r=(t.length>1?7.5:6.5)*s;
  ctx.save();ctx.shadowColor='rgba(0,0,0,.45)';ctx.shadowBlur=4*s;ctx.fillStyle='rgba(12,16,24,.92)';ctx.beginPath();
  if(t.length>1)ctx.roundRect(x-r*1.1,y-r*0.75,r*2.2,r*1.5,r*0.5);else ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  ctx.lineWidth=1.3*s;ctx.strokeStyle=c;ctx.stroke();ctx.fillStyle=c;ctx.font=`900 ${(t.length>1?6.2:8.5)*s}px Archivo, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t,x,y+0.6*s);ctx.restore();}
function drawPadIcons(){
  if(!padKind()||G.noDraw||!G.play||G.play.kind!=='scrimmage'||isAI(G.me)||pcAIQB()||G.offTeam!==G.me)return;
  const pass=G.play.off&&G.play.off.kind==='pass';
  if(!(G.phase==='presnap'&&pass)&&!passingUser())return;
  const T=gpThrowTargets(),k0=proj(CX,G.camY).k||1;
  [0,1,2,3,5].forEach((b,i)=>{const r=T[i];if(!r)return;const[wx,wy]=toW(r.x,r.y),p=proj(wx,wy,3.6);padIcon(b,p.sx,p.sy,clamp(p.k/k0,0.75,1.35)*1.25);});
}
function padGlyph(i){const K=padKind();if(!K)return'';const P=PADG[K],t=P.l[i];return`<span style="display:inline-flex;align-items:center;justify-content:center;min-width:1.7em;height:1.7em;padding:0 .3em;border-radius:${t.length>1?'.45em':'50%'};background:#0c1018;border:1.5px solid ${P.c[i]};color:${P.c[i]};font-weight:900;font-size:.8em;margin-right:.3em">${t}</span>`;}
function padLegend(box,items){if(!padKind())return;const d=document.createElement('div');d.className='padleg';
  d.style.cssText='display:flex;flex-wrap:wrap;gap:6px 12px;justify-content:center;align-items:center;font:800 12px Archivo,sans-serif;color:#fff;background:rgba(6,10,18,.72);border-radius:10px;padding:6px 10px;margin-top:4px;text-shadow:0 1px 2px #000';
  d.innerHTML=items.map(([b,l])=>`<span style="white-space:nowrap">${padGlyph(b)}${l}</span>`).join('');box.appendChild(d);}
function chip(txt,x,y,col){
  ctx.font='900 7px Archivo, sans-serif';const w=ctx.measureText(txt).width+10;
  const g=ctx.createLinearGradient(0,y-6,0,y+6);g.addColorStop(0,'#fff');g.addColorStop(1,'#dff1fd');
  ctx.fillStyle=g;ctx.strokeStyle=col;ctx.lineWidth=1.2;ctx.beginPath();ctx.roundRect(x-w/2,y-6,w,12,6);ctx.fill();ctx.stroke();
  ctx.fillStyle=col;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(txt,x,y+0.5);
}
function drawJoy(){
  const J=G.joy;if(!J)return;
  ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(J.ox,J.oy,22,0,Math.PI*2);ctx.stroke();
  const dx=J.x-J.ox,dy=J.y-J.oy,l=Math.hypot(dx,dy),m=Math.min(l,22)/(l||1);
  const g=ctx.createRadialGradient(J.ox+dx*m-3,J.oy+dy*m-3,1,J.ox+dx*m,J.oy+dy*m,9);g.addColorStop(0,'#bff0ff');g.addColorStop(1,'#1aa3e8');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(J.ox+dx*m,J.oy+dy*m,8,0,Math.PI*2);ctx.fill();
}
function drawParts(){
  for(const p of G.parts){const[wx,wy]=toW(p.x,p.y);const q=proj(wx,wy,p.h);ctx.globalAlpha=Math.min(1,p.life*3);ctx.fillStyle=p.c;ctx.fillRect(q.sx,q.sy,Math.max(1,q.k*0.08),Math.max(1,q.k*0.08));}
  ctx.globalAlpha=1;
}
function drawScene(F){
  // stadium and field are painted at native 640x360 and scaled up, so they share the sprites' pixel grid
  ctx=BGX;ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;
  drawSky();drawStands();drawField(F.lines);
  if(F.lines&&G.phase!=='replay'&&G.play&&G.play.kind==='scrimmage'&&!G.conv)drawChains(F.lines.los,F.lines.fd,G.down);
  drawGoalposts();drawCheerSquad();drawFlags(F.flags.filter(f=>f.h<=0));
  ctx=MAINCTX;ctx.setTransform(SC*DPR,0,0,SC*DPR,0,0);ctx.imageSmoothingEnabled=false;
  {const cm=GDS.pcCam||'close',fT=proj(0,0).sy,fB=proj(FW,0).sy,z=pcOn()&&G.phase!=='replay'&&cm!=='wide'?Math.min(cm==='close'?1.55:1.24,H/(fB-fT+20)):1;let cy=H*0.62,cx=W*G.anch;
   if(z>1){const me=(F.ents||[]).find(S=>S.mid!=null&&S.mid===GP.pc.mid)||(G.ents||[]).find(e=>pcMe(e));
    if(me){const w=me.wx!=null?[me.wx,me.wy]:toW(me.x,me.y),q=proj(w[0],w[1]);
     if(cm==='close'){
      // close camera: your player near the middle of the screen; with the ball in the air it frames both him and where it comes down
      let px=q.sx,py=q.sy-24;const L=gpLandPt();if(L){const lw=toW(L.x,L.y),lq=proj(lw[0],lw[1]);px=(px+lq.sx)/2;py=(py+lq.sy)/2;}
      cx=clamp((px*z-W*0.5)/(z-1),0,W);cy=clamp((py*z-H*0.56)/(z-1),0,H);
     }else cy=clamp(q.sy-30,H*0.3,H*0.78);}
    // keep the whole field in view, sideline to sideline: the zoom crops the stands, never the field
    {const vt=clamp(cy*(1-1/z),fB+6-H/z,fT-14);cy=vt/(1-1/z);}
    G.zcy=G.zcy==null?cy:G.zcy+(cy-G.zcy)*0.08;G.zcx=G.zcx==null?cx:G.zcx+(cx-G.zcx)*0.1;}
   G.zm=z>1?{z,cx:cm==='close'?G.zcx:W*G.anch,cy:G.zcy}:null;if(G.zm){const Z=G.zm,k=SC*DPR;ctx.fillStyle='#0b1220';ctx.fillRect(0,0,W,H);ctx.setTransform(k*z,0,0,k*z,k*(Z.cx-Z.cx*z),k*(Z.cy-Z.cy*z));}}
  {const fc=G.phase==='replay'&&G.replay&&G.replay.fc;if(fc){const k=SC*DPR,z=fc.z,cx=W*0.5,cy=H*0.62;G.zm={z,cx,cy:cy-fc.oy/z};ctx.fillStyle='#0b1220';ctx.fillRect(0,0,W,H);ctx.setTransform(k*z,0,0,k*z,k*(cx-cx*z),k*(cy-cy*z+fc.oy));}} // replay free cam
  ctx.drawImage(BGC,0,0,W,H);
  drawRoutes();
  if(G.phase!=='replay')try{drawLand();}catch(e){}
  const list=[...F.ents].sort((a,b)=>a.wx-b.wx);
  for(const S of list)drawEntity(S);
  if(G.phase!=='replay'){drawParts();drawHelmets();}
  drawFlags(F.flags.filter(f=>f.h>0));
  drawBallW(F.ball);
  try{wxOverlay(Math.min(0.05,Math.max(0,(G.time||0)-(G.wxT||0))));G.wxT=G.time||0;}catch(e){}
  if(G.phase==='presnap')drawTags(list);
  if(G.phase==='live'&&GPC&&passingUser())try{drawKeyBadges();}catch(e){}
  if(G.phase!=='replay'){drawPadIcons();drawAim();drawJoy();drawCatchMeter();drawIntMeter();}
}
function drawIntMeter(){
  const M=G.im,U=M&&M.def;if(!M||!U)return;if(M.doneAt&&G.time-M.doneAt>0.7)return;if(ON&&U.team!==G.me)return;
  const[wx,wy]=toW(U.x,U.y),p=proj(wx,wy,0),z=p.k*0.0212;
  const cx=p.sx,cy=p.sy-(U.jz||0)*p.k-118*z*(U.pl?U.pl.body.hs:1)-4,w=40,h=6,u=M.tapped!=null?M.tapped:imPos(M);
  ctx.fillStyle='rgba(30,8,12,.85)';ctx.beginPath();ctx.roundRect(cx-w/2-2,cy-h/2-2,w+4,h+4,4);ctx.fill();
  ctx.fillStyle='#5b6470';ctx.fillRect(cx-w/2,cy-h/2,w,h);
  ctx.fillStyle='#f6c945';ctx.fillRect(cx-w/2+w*(M.g0-M.yw),cy-h/2,w*(M.g1-M.g0+M.yw*2),h);
  ctx.fillStyle='#5ccf3c';ctx.fillRect(cx-w/2+w*M.g0,cy-h/2,w*(M.g1-M.g0),h);
  ctx.fillStyle='#ffffff';ctx.fillRect(cx-w/2+w*u-1,cy-h/2-2,2,h+4);
  const label=M.result||(M.c>0.6?'CONTESTED':'TAP!');
  ctx.font='900 6px Archivo, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillStyle='rgba(30,8,12,.85)';const tw=ctx.measureText(label).width+6;ctx.beginPath();ctx.roundRect(cx-tw/2,cy-h/2-11,tw,8,3);ctx.fill();
  ctx.fillStyle=M.result==='PERFECT'?'#5ccf3c':M.result==='GOOD'?'#f6c945':M.result?'#ff7a6e':'#ffb4c8';ctx.fillText(label,cx,cy-h/2-6.6);
}
function drawCatchMeter(){
  const M=G.cm;if(!M)return;if(ON&&M.target&&M.target.team!==G.me)return;
  const live=G.ballState==='air'&&G.air,age=G.time-(M.doneAt||G.time);
  if(!live&&age>0.6)return;
  const e=M.target,[wx,wy]=toW(e.x,e.y),p=proj(wx,wy,0),z=p.k*0.0212;
  const cx=p.sx,cy=p.sy-(e.jz||0)*p.k-118*z*(e.pl?e.pl.body.hs:1)-4,w=40,h=6;
  const u=live?clamp(G.air.t/G.air.T,0,1):M.u;
  ctx.fillStyle='rgba(8,24,40,.82)';ctx.beginPath();ctx.roundRect(cx-w/2-2,cy-h/2-2,w+4,h+4,4);ctx.fill();
  ctx.fillStyle='#e8524a';ctx.fillRect(cx-w/2,cy-h/2,w,h);
  ctx.fillStyle='#f6c945';ctx.fillRect(cx-w/2+w*Math.max(0,M.g0-M.yw),cy-h/2,w*Math.min(1-Math.max(0,M.g0-M.yw),M.g1-M.g0+M.yw*2),h);
  ctx.fillStyle='#5ccf3c';ctx.fillRect(cx-w/2+w*M.g0,cy-h/2,w*(M.g1-M.g0),h);
  const mx=cx-w/2+w*(M.tapped!=null?M.tapped:u);
  ctx.fillStyle='#ffffff';ctx.fillRect(mx-1,cy-h/2-2,2,h+4);
  ctx.font='900 6px Archivo, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  const label=M.result||(M.diff>0.66?'HARD CATCH':M.diff>0.4?'TOUGH CATCH':'EASY');
  if(label){ctx.fillStyle='rgba(8,24,40,.82)';const tw=ctx.measureText(label).width+6;ctx.beginPath();ctx.roundRect(cx-tw/2,cy-h/2-11,tw,8,3);ctx.fill();
    ctx.fillStyle=M.result==='PERFECT'?'#5ccf3c':M.result==='GOOD'?'#f6c945':M.result?'#ff7a6e':M.diff>0.66?'#ff7a6e':M.diff>0.4?'#ffd76a':'#a6ee86';ctx.fillText(label,cx,cy-h/2-6.6);}
}
function dust(x,y,n,col){for(let i=0;i<n;i++)G.parts.push({x:x+rnd(-0.4,0.4),y:y+rnd(-0.6,0.6),h:rnd(0,0.6),vh:rnd(1.5,4),vy:rnd(-3,3),life:rnd(0.3,0.6),c:col||pick(['#dccfa4','#c4b689','#efe8cc'])});}
function updParts(dt){for(const p of G.parts){p.life-=dt;p.y+=p.vy*dt;p.h+=p.vh*dt;p.vh-=12*dt;if(p.h<0){p.h=0;p.vh=0;}}G.parts=G.parts.filter(p=>p.life>0);}

