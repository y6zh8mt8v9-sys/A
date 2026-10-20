/* ===================== high-resolution character renderer =====================
   Drawn in local "body units" (feet at 0, helmet top near -98), facing +x.
   Cel shading with a fixed key light from the upper left of the screen.          */
const INK='rgba(14,22,32,0.78)';
function celFill(x1,y1,x2,y2,T){
  const g=ctx.createLinearGradient(x1,y1,x2,y2);
  g.addColorStop(0,T.l);g.addColorStop(0.2,T.m);g.addColorStop(0.56,T.m);g.addColorStop(0.565,T.s);g.addColorStop(1,T.s);return g;
}
function capsule(a,b,ra,rb){
  const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||0.001,ux=dx/l,uy=dy/l,nx=-uy,ny=ux,ang=Math.atan2(ny,nx);
  ctx.beginPath();ctx.arc(a[0],a[1],ra,ang,ang+Math.PI);ctx.arc(b[0],b[1],rb,ang+Math.PI,ang+Math.PI*2);ctx.closePath();
  return[nx,ny];
}
function limbV(a,b,ra,rb,T,LT,lw){
  const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||0.001;let nx=-dy/l,ny=dx/l;if(nx*LT[0]+ny*LT[1]<0){nx=-nx;ny=-ny;}
  const r=Math.max(ra,rb);
  capsule(a,b,ra,rb);ctx.fillStyle=T.s;ctx.fill();
  const o=r*0.3;capsule([a[0]+nx*o,a[1]+ny*o],[b[0]+nx*o,b[1]+ny*o],ra*0.7,rb*0.7);ctx.fillStyle=T.m;ctx.fill();
  if(r>4.2&&QHI){const o2=r*0.62;capsule([a[0]+nx*o2,a[1]+ny*o2],[b[0]+nx*o2,b[1]+ny*o2],ra*0.2,rb*0.2);ctx.fillStyle=T.l;ctx.fill();}
  capsule(a,b,ra,rb);ctx.lineWidth=lw;ctx.strokeStyle=INK;ctx.stroke();
}
function ovalV(cx,cy,rx,ry,rot,T,LT,lw){
  ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,rot,0,Math.PI*2);ctx.fillStyle=T.s;ctx.fill();
  const o=Math.min(rx,ry)*0.28;
  ctx.beginPath();ctx.ellipse(cx+LT[0]*o,cy+LT[1]*o,rx*0.74,ry*0.74,rot,0,Math.PI*2);ctx.fillStyle=T.m;ctx.fill();
  if(rx>4&&QHI){ctx.beginPath();ctx.ellipse(cx+LT[0]*rx*0.5,cy+LT[1]*ry*0.5,rx*0.24,ry*0.2,rot,0,Math.PI*2);ctx.fillStyle=T.l;ctx.fill();}
  if(lw){ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,rot,0,Math.PI*2);ctx.lineWidth=lw;ctx.strokeStyle=INK;ctx.stroke();}
}
function celPoly(path,cx,cy,T,LT,k,lw){
  path();ctx.fillStyle=T.s;ctx.fill();
  ctx.save();ctx.translate(cx+LT[0]*k,cy+LT[1]*k);ctx.scale(0.84,0.88);ctx.translate(-cx,-cy);path();ctx.fillStyle=T.m;ctx.fill();ctx.restore();
  path();if(lw){ctx.lineWidth=lw;ctx.strokeStyle=INK;ctx.stroke();}
}
const P2=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
function shoeV(knee,foot,T,sole,lw){
  let dx=foot[0]-knee[0],dy=foot[1]-knee[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;
  const fx=dy,fy=-dx;// forward along the foot
  const P=(u,v)=>[foot[0]+fx*u+dx*v,foot[1]+fy*u+dy*v];
  const pts=[P(-3.6,-2.2),P(-4.2,1.6),P(-3.6,3),P(9.5,3.1),P(11.4,1.2),P(10.2,-1),P(5,-2.6),P(0,-3.2)];
  ctx.beginPath();ctx.moveTo(...pts[0]);
  ctx.lineTo(...pts[1]);ctx.quadraticCurveTo(...P(-4.4,3.1),...pts[2]);ctx.lineTo(...pts[3]);ctx.quadraticCurveTo(...P(12,3),...pts[4]);
  ctx.quadraticCurveTo(...P(11.6,-0.6),...pts[5]);ctx.quadraticCurveTo(...P(8,-2.6),...pts[6]);ctx.lineTo(...pts[7]);ctx.closePath();
  ctx.fillStyle=T.m;ctx.fill();ctx.lineWidth=lw;ctx.strokeStyle=INK;ctx.stroke();
  ctx.strokeStyle=sole;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(...P(-3.4,2.3));ctx.lineTo(...P(10,2.3));ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=0.7;ctx.beginPath();ctx.moveTo(...P(1,-2.2));ctx.lineTo(...P(6,-1.6));ctx.stroke();
}
function footballV(x,y,rot,lw){
  const m0=ctx.getTransform();ctx.translate(x,y);ctx.rotate(rot);
  ctx.beginPath();ctx.ellipse(0,0,6.4,3.9,0,0,Math.PI*2);
  ctx.fillStyle='#5a2c10';ctx.fill();ctx.beginPath();ctx.ellipse(-0.5,-0.8,5.4,2.7,0,0,Math.PI*2);ctx.fillStyle='#844619';ctx.fill();
  ctx.beginPath();ctx.ellipse(0,0,6.4,3.9,0,0,Math.PI*2);ctx.lineWidth=lw;ctx.strokeStyle=INK;ctx.stroke();
  ctx.strokeStyle='#f1ece2';ctx.lineWidth=0.9;ctx.beginPath();ctx.moveTo(-2.4,-1.5);ctx.lineTo(2.4,-1.5);ctx.stroke();
  ctx.lineWidth=0.6;for(let i=-2;i<=2;i+=1){ctx.beginPath();ctx.moveTo(i,-2.3);ctx.lineTo(i,-0.7);ctx.stroke();}
  ctx.setTransform(m0);
}
function helmetV(c,K,L,lw,LT){
  const[x,y]=c,S=0.9;
  const p=(u,v)=>[x+u*S,y+v*S];
  // shell profile, facing +x
  const shell=()=>{ctx.beginPath();ctx.moveTo(...p(-8.6,5.4));
  ctx.bezierCurveTo(...p(-11.4,0),...p(-10.6,-8.4),...p(-3.6,-10.6));
  ctx.bezierCurveTo(...p(3.4,-12.2),...p(9.6,-8.4),...p(10.2,-2.6));
  ctx.lineTo(...p(9.2,-1.6));ctx.lineTo(...p(5.2,-1.8));ctx.lineTo(...p(4.6,3.2));
  ctx.quadraticCurveTo(...p(6.8,6.2),...p(5.6,8.6));ctx.lineTo(...p(1.2,8.2));
  ctx.quadraticCurveTo(...p(-4,7.8),...p(-8.6,5.4));ctx.closePath();};shell();
  ctx.fillStyle=K.helmet.s;ctx.fill();
  ctx.fillStyle=K.helmet.m;ctx.beginPath();ctx.ellipse(...p(-1.2+LT[0]*1.2,-1.6+LT[1]*1.2),8.6*S,7.6*S,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=K.helmet.l;ctx.beginPath();ctx.ellipse(...p(-3.2,-6.4),3.4*S,1.5*S,-0.35,0,Math.PI*2);ctx.fill();
  shell();ctx.lineWidth=lw;ctx.strokeStyle=INK;ctx.stroke();
  // centre stripe over the crown
  ctx.strokeStyle=K.hstripe.m;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(...p(-9.2,-3.4));ctx.bezierCurveTo(...p(-7.4,-10.2),...p(3.6,-11.2),...p(8.8,-4.2));ctx.stroke();
  // ear hole and logo
  ctx.fillStyle=K.trim.m;ctx.beginPath();ctx.arc(...p(-2.2,1.6),2.2,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=INK;ctx.beginPath();ctx.arc(...p(-2.2,1.6),0.8,0,Math.PI*2);ctx.fill();
  // face in the opening
  ctx.beginPath();ctx.moveTo(...p(5.4,-1.4));ctx.lineTo(...p(9.6,-1.2));ctx.quadraticCurveTo(...p(10.4,3),...p(8.6,6.6));ctx.lineTo(...p(5.2,6.8));ctx.closePath();
  ctx.fillStyle=L.skin.m;ctx.fill();
  if(L.visor){ctx.fillStyle='rgba(18,28,40,.92)';ctx.beginPath();ctx.moveTo(...p(5.4,-1.5));ctx.lineTo(...p(9.8,-1.3));ctx.lineTo(...p(9.9,2.2));ctx.lineTo(...p(5.2,2.4));ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(160,215,255,.6)';ctx.lineWidth=0.7;ctx.beginPath();ctx.moveTo(...p(6.4,-0.6));ctx.lineTo(...p(9,-0.4));ctx.stroke();}
  else{ctx.fillStyle='#141b22';ctx.beginPath();ctx.ellipse(...p(8.2,0.9),0.75,0.95,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=L.skin.s;ctx.lineWidth=0.7;ctx.beginPath();ctx.moveTo(...p(7.2,-0.4));ctx.lineTo(...p(9.2,-0.5));ctx.stroke();}
  // facemask cage
  ctx.strokeStyle=K.mask.s;ctx.lineWidth=1.9;ctx.lineCap='round';
  const cage=()=>{ctx.beginPath();ctx.moveTo(...p(9.6,-2));ctx.quadraticCurveTo(...p(12.4,2.4),...p(10.8,7.8));
    ctx.moveTo(...p(5.6,0.6));ctx.lineTo(...p(12,1.2));ctx.moveTo(...p(5.2,4.4));ctx.lineTo(...p(11.6,4.8));ctx.moveTo(...p(5.4,8.2));ctx.lineTo(...p(10.8,7.8));ctx.stroke();};
  cage();ctx.strokeStyle=K.mask.l;ctx.lineWidth=0.9;cage();
  // chin strap
  ctx.strokeStyle='rgba(240,240,240,.85)';ctx.lineWidth=0.9;ctx.beginPath();ctx.moveTo(...p(1.5,7.8));ctx.quadraticCurveTo(...p(4.6,9.6),...p(7.2,8.2));ctx.stroke();
}
function refHeadV(c,L,cap,lw){
  const[x,y]=c;
  ovalV(x+0.6,y+0.8,6.6,7.4,0,L.skin,[-0.55,-0.83],lw);
  ctx.fillStyle='#2a1c14';ctx.beginPath();ctx.ellipse(x-3.6,y+1,3.2,4.6,0.2,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=L.skin.s;ctx.beginPath();ctx.ellipse(x-1,y+2,1.6,2.2,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#161b20';ctx.beginPath();ctx.ellipse(x+4.2,y+0.6,0.7,0.9,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=L.skin.s;ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(x+6.6,y+1.2);ctx.lineTo(x+7.6,y+3.6);ctx.lineTo(x+6.4,y+4.2);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x+3.6,y+6);ctx.lineTo(x+5.8,y+5.6);ctx.stroke();
  const cg=tone(cap);
  ctx.beginPath();ctx.moveTo(x-7,y-0.6);ctx.bezierCurveTo(x-7.4,y-8.4,x+5.8,y-9.4,x+6.4,y-1.4);ctx.lineTo(x-7,y-0.6);ctx.closePath();
  ctx.fillStyle=cg.m;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=lw;ctx.stroke();
  ctx.beginPath();ctx.moveTo(x+4.6,y-1.8);ctx.quadraticCurveTo(x+9,y-2.4,x+11.4,y-0.6);ctx.lineTo(x+5.4,y-0.2);ctx.closePath();ctx.fillStyle=cg.s;ctx.fill();ctx.stroke();
}
function torsoPath(hip,sh,ws,belly,fr){
  let ux=sh[0]-hip[0],uy=sh[1]-hip[1];const l=Math.hypot(ux,uy)||1;ux/=l;uy/=l;
  let fx=-uy,fy=ux;if(fx*fr<0){fx=-fx;fy=-fy;}
  const A=(t,w)=>[hip[0]+ux*l*t+fx*w,hip[1]+uy*l*t+fy*w];
  const wb=9.8*ws,wf=9.8*ws+belly*7,wc=11.4*ws;
  ctx.beginPath();ctx.moveTo(...A(-0.05,-wb));
  ctx.quadraticCurveTo(...A(0.5,-wb-1.2),...A(0.92,-wc));
  ctx.lineTo(...A(1.02,-wc*0.6));ctx.lineTo(...A(1.02,wc*0.6));ctx.lineTo(...A(0.92,wc));
  ctx.quadraticCurveTo(...A(0.42,wf+belly*4),...A(-0.05,wf*0.95));
  ctx.closePath();
  return{fx,fy,ux,uy,l,A};
}
function drawSprite(S,sx,sy,z,dir){
  const P=S.pp,B=S.body,K=S.kit,L=S.look,ws=B.ws,wa=Math.pow(ws,0.6),isRef=S.ref;
  const zz=z*B.hs;
  const M0=ctx.getTransform();ctx.translate(sx,sy);ctx.scale(dir*zz,zz);ctx.lineJoin='round';ctx.lineCap='round';
  const LT=[-0.55*dir,-0.83],lw=Math.min(1.6,0.62/Math.max(0.2,zz));
  const g=k=>P[k];
  const hip=g('hip'),sh=g('sh'),hd=g('hd'),nk=g('nk'),nf=g('nf'),fk=g('fk'),ff=g('ff'),ne=g('ne'),nh=g('nh'),fe=g('fe'),fh=g('fh');
  const ankle=(k,f)=>P2(f,k,0.1),fr=1;
  const F=t=>t.f?{s:t.f.s,m:t.f.m,l:t.f.l}:t;
  const skinF=F(L.skin),sleeveTone=L.sleeve||null;
  // ---------- far arm ----------
  const fw=P2(fe,fh,0.86);
  limbV(sh,fe,4.6*wa,4*wa,sleeveTone?F(sleeveTone):skinF,LT,lw);
  limbV(sh,P2(sh,fe,0.55),5.2*wa,4.8*wa,F(K.sleeve),LT,lw);
  limbV(fe,fw,3.8*wa,3*wa,sleeveTone?F(sleeveTone):skinF,LT,lw);
  ovalV(fh[0],fh[1],3.5,3.1,0,F(K.glove),LT,lw);
  // ---------- far leg ----------
  const fa=ankle(fk,ff);
  limbV(fk,fa,4.9*Math.pow(ws,0.7),3*Math.pow(ws,0.5),skinF,LT,lw);
  limbV(P2(fk,fa,L.longSock?0.12:0.42),fa,4.5*Math.pow(ws,0.7),3.1*Math.pow(ws,0.5),F(K.sock),LT,lw);
  limbV(hip,P2(hip,fk,1.08),6.9*Math.pow(ws,0.8),5.2*Math.pow(ws,0.7),F(K.pants),LT,lw);
  shoeV(fk,ff,F(K.cleat),isRef?'#333':K.trim.m,lw);
  // ---------- hips & torso ----------
  ovalV(hip[0],hip[1]+0.5,8.6*Math.pow(ws,0.85),7,0,K.pants,LT,lw);
  const T=torsoPath(hip,sh,ws,B.belly,1);const tc=T.A(0.5,0);
  ctx.fillStyle=K.jersey.s;ctx.fill();{const o=2.2*ws;torsoPath([hip[0]+LT[0]*o,hip[1]+LT[1]*o+1],[sh[0]+LT[0]*o,sh[1]+LT[1]*o+1.5],ws*0.8,B.belly*0.8,1);ctx.fillStyle=K.jersey.m;ctx.fill();}torsoPath(hip,sh,ws,B.belly,1);
  if(isRef){ctx.strokeStyle='#121212';ctx.lineWidth=1.9;ctx.lineCap='butt';
    for(let w=-8.4*ws;w<=8.6*ws;w+=3.6){ctx.beginPath();ctx.moveTo(...T.A(0.02,w));ctx.lineTo(...T.A(0.96,w));ctx.stroke();}ctx.lineCap='round';torsoPath(hip,sh,ws,B.belly,1);}
  ctx.lineWidth=lw;ctx.strokeStyle=INK;ctx.stroke();
  // jersey details: side panel, number, hem / belt
  if(!isRef){
    ctx.strokeStyle=K.trim.m;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(...T.A(0.08,-1.5));ctx.lineTo(...T.A(0.85,-1.5));ctx.stroke();
    if(S.num!=null){const c=T.A(0.6,3.2*ws),m1=ctx.getTransform();ctx.translate(c[0],c[1]);ctx.rotate(Math.atan2(T.uy,T.ux)+Math.PI/2);ctx.scale(dir,1);
      ctx.font='900 10.5px Nunito, Arial Black, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.lineWidth=1.6;ctx.strokeStyle=K.trim.s;ctx.strokeText(String(S.num),0,0);ctx.fillStyle=K.num.m;ctx.fillText(String(S.num),0,0);ctx.setTransform(m1);}
  }
  ctx.strokeStyle=isRef?'#0e0e0e':K.pants.s;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(...T.A(0.06,-8.6*ws));ctx.lineTo(...T.A(0.06,8.6*ws+B.belly*6));ctx.stroke();
  if(isRef){ctx.fillStyle='#ffd21f';ctx.strokeStyle=INK;ctx.lineWidth=lw*0.8;const f=T.A(0.02,-7*ws);ctx.beginPath();ctx.rect(f[0]-2,f[1],3.2,5.2);ctx.fill();ctx.stroke();}
  // shoulder pads (players) / shoulders (refs)
  const padC=[sh[0]-T.ux*2.2,sh[1]-T.uy*2.2],padRot=Math.atan2(T.fy,T.fx);
  if(!isRef){
    ovalV(padC[0],padC[1],13.8*wa,8.2,padRot,K.jersey,LT,lw);
    ctx.strokeStyle=K.trim.m;ctx.lineWidth=1.4;
    for(const o of[-3.2,-1.4]){ctx.beginPath();ctx.ellipse(padC[0],padC[1]+0.6,12.4*wa,8.2+o,padRot,Math.PI*1.12,Math.PI*1.88);ctx.stroke();}
  }else ovalV(padC[0],padC[1],9*wa,6.4,padRot,K.jersey,LT,lw);
  // ---------- near leg ----------
  const na=ankle(nk,nf);
  limbV(nk,na,5*Math.pow(ws,0.7),3.1*Math.pow(ws,0.5),L.skin,LT,lw);
  limbV(P2(nk,na,L.longSock?0.12:0.42),na,4.6*Math.pow(ws,0.7),3.2*Math.pow(ws,0.5),K.sock,LT,lw);
  if(!isRef&&!L.longSock){ctx.strokeStyle=K.trim.m;ctx.lineWidth=1.2;const a=P2(nk,na,0.5),[nx,ny]=[-(na[1]-nk[1]),na[0]-nk[0]],l=Math.hypot(nx,ny)||1;ctx.beginPath();ctx.moveTo(a[0]+nx/l*3.6,a[1]+ny/l*3.6);ctx.lineTo(a[0]-nx/l*3.6,a[1]-ny/l*3.6);ctx.stroke();}
  limbV(hip,P2(hip,nk,1.08),7.1*Math.pow(ws,0.8),5.3*Math.pow(ws,0.7),K.pants,LT,lw);
  if(!isRef){ctx.strokeStyle=K.pstripe.m;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(...hip);ctx.lineTo(...P2(hip,nk,1.02));ctx.stroke();
    ovalV(...P2(hip,nk,0.98),2.6,2.3,0,K.pants,LT,lw*0.8);}
  shoeV(nk,nf,K.cleat,isRef?'#333':K.trim.m,lw);
  // ---------- neck & head ----------
  limbV(P2(sh,hd,0.15),P2(sh,hd,0.72),3.9*Math.pow(ws,0.7),3.4,L.skin,LT,lw);
  if(isRef)refHeadV(hd,L,S.cap||'#151515',lw);else helmetV(hd,K,L,lw,LT);
  // ---------- near arm & ball ----------
  const nw=P2(ne,nh,0.86);
  limbV(sh,ne,4.8*wa,4.1*wa,sleeveTone||L.skin,LT,lw);
  limbV(sh,P2(sh,ne,0.55),5.4*wa,5*wa,K.sleeve,LT,lw);
  if(!isRef){const a=P2(sh,ne,0.5),dx=ne[0]-sh[0],dy=ne[1]-sh[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
    ctx.strokeStyle=K.trim.m;ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(a[0]+nx*4.9*wa,a[1]+ny*4.9*wa);ctx.lineTo(a[0]-nx*4.9*wa,a[1]-ny*4.9*wa);ctx.stroke();}
  else{ctx.strokeStyle='#121212';ctx.lineWidth=1.5;ctx.lineCap='butt';const e2=P2(sh,ne,0.5),dx=ne[0]-sh[0],dy=ne[1]-sh[1],l=Math.hypot(dx,dy)||1;
    for(const w of[-2.6,0.8,4.2]){const q=w*wa;ctx.beginPath();ctx.moveTo(sh[0]-dy/l*q,sh[1]+dx/l*q);ctx.lineTo(e2[0]-dy/l*q,e2[1]+dx/l*q);ctx.stroke();}ctx.lineCap='round';}
  limbV(ne,nw,3.9*wa,3.1*wa,sleeveTone||L.skin,LT,lw);
  if(L.band&&!isRef){const b1=P2(ne,nw,0.78),b2=P2(ne,nw,0.95);limbV(b1,b2,3.3*wa,3.2*wa,tone('#f3f3f3'),LT,lw*0.8);}
  if(S.ball)footballV(S.ball[0],S.ball[1],-0.45,lw);
  ovalV(nh[0],nh[1],3.6,3.2,0,isRef?L.skin:K.glove,LT,lw);
  ctx.strokeStyle=isRef?L.skin.s:K.glove.s;ctx.lineWidth=0.7;ctx.beginPath();ctx.moveTo(nh[0]+0.6,nh[1]-1.6);ctx.lineTo(nh[0]+2.2,nh[1]+0.8);ctx.stroke();
  ctx.setTransform(M0);
}
