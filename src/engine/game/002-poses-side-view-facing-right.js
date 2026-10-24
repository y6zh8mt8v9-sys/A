/* ===================== poses: side view facing right, feet at 0, helmet center ~ -89 ===================== */
const JK=['hip','sh','hd','nk','nf','fk','ff','ne','nh','fe','fh'];
const STAND={hip:[0,-50],sh:[2,-78],hd:[5,-89],nk:[3,-26],nf:[4,0],fk:[-3,-26],ff:[-5,0],ne:[7,-62],nh:[10,-49],fe:[-4,-62],fh:[-4,-49]};
const RA={hip:[0,-50],sh:[9,-77],hd:[13,-88],nk:[12,-31],nf:[17,-3],fk:[-8,-31],ff:[-22,-13],ne:[-5,-62],nh:[-13,-54],fe:[16,-66],fh:[21,-76]};
const RB_={hip:[0,-50],sh:[9,-77],hd:[13,-88],nk:[8,-27],nf:[4,0],fk:[-3,-36],ff:[-17,-24],ne:[-1,-62],nh:[-6,-53],fe:[12,-64],fh:[16,-70]};
const RC={hip:[0,-50],sh:[9,-77],hd:[13,-88],nk:[2,-26],nf:[-6,-1],fk:[11,-38],ff:[8,-23],ne:[4,-62],nh:[5,-54],fe:[6,-62],fh:[8,-56]};
const RD={hip:[0,-50],sh:[9,-77],hd:[13,-88],nk:[-6,-30],nf:[-18,-15],fk:[16,-41],ff:[16,-25],ne:[14,-66],nh:[20,-75],fe:[-4,-62],fh:[-12,-55]};
function swapNF(p){const o={...p};[o.nk,o.fk]=[p.fk,p.nk];[o.nf,o.ff]=[p.ff,p.nf];[o.ne,o.fe]=[p.fe,p.ne];[o.nh,o.fh]=[p.fh,p.nh];return o;}
const RUN8=[RA,RB_,RC,RD,swapNF(RA),swapNF(RB_),swapNF(RC),swapNF(RD)];
const RBOB=[2,1,-1,-3,2,1,-1,-3];
const STANCE3={hip:[-4,-40],sh:[12,-46],hd:[21,-50],nk:[8,-22],nf:[6,0],fk:[-10,-20],ff:[-14,0],ne:[16,-30],nh:[18,-2],fe:[10,-36],fh:[6,-28]};
const CROUCH={hip:[-1,-44],sh:[6,-72],hd:[10,-83],nk:[7,-24],nf:[5,0],fk:[-5,-24],ff:[-9,0],ne:[10,-60],nh:[13,-52],fe:[6,-60],fh:[9,-52]};
const WRSTANCE={hip:[0,-46],sh:[6,-74],hd:[9,-85],nk:[6,-24],nf:[8,0],fk:[-6,-25],ff:[-12,0],ne:[8,-62],nh:[12,-55],fe:[2,-62],fh:[0,-52]};
const SHOTGUN={hip:[0,-46],sh:[4,-75],hd:[7,-86],nk:[6,-24],nf:[5,0],fk:[-4,-24],ff:[-7,0],ne:[10,-62],nh:[15,-60],fe:[10,-62],fh:[15,-61]};
const HOLD={ne:[6,-64],nh:[10,-68],fe:[7,-63],fh:[11,-67],ball:[13,-68]};
const WIND={hip:[0,-48],sh:[-2,-78],hd:[1,-88],ne:[-8,-80],nh:[-14,-92],fe:[10,-70],fh:[16,-74],ball:[-15,-96],nf:[14,0],nk:[9,-25],ff:[-12,0],fk:[-7,-25]};
const REL={sh:[8,-76],hd:[12,-86],ne:[16,-80],nh:[25,-70],fe:[0,-62],fh:[-6,-54]};
const CARRY={ne:[4,-64],nh:[10,-66],ball:[12,-66]};
const REACH={sh:[4,-78],hd:[7,-89],ne:[8,-90],nh:[12,-104],fe:[12,-90],fh:[16,-104]};
const REACH_MID={ne:[14,-70],nh:[22,-72],fe:[14,-68],fh:[22,-69]};
const REACH_LOW={sh:[8,-70],hd:[12,-80],ne:[16,-48],nh:[22,-36],fe:[16,-48],fh:[22,-38]};
const READY={ne:[10,-66],nh:[15,-74],fe:[10,-66],fh:[15,-72]};
const CATCHP={
  hands:{ne:[14,-66],nh:[20,-70],fe:[14,-65],fh:[20,-67],ball:[23,-69]},
  shoulder:{sh:[2,-78],hd:[1,-89],ne:[-2,-86],nh:[-6,-102],fe:[2,-86],fh:[-2,-102],ball:[-5,-105]},
  onehand:{ne:[10,-90],nh:[16,-108],fe:[-2,-62],fh:[-10,-52],ball:[18,-110]},
  high:{nk:[10,-30],nf:[2,-14],fk:[-4,-28],ff:[-12,-12],ne:[6,-94],nh:[9,-110],fe:[10,-94],fh:[13,-110],ball:[12,-114]},
  low:{hip:[0,-30],sh:[8,-58],hd:[12,-68],nk:[12,-16],nf:[22,0],fk:[-6,-1],ff:[-20,0],ne:[16,-38],nh:[24,-18],fe:[16,-38],fh:[24,-20],ball:[26,-20]},
  poss:{hip:[0,-48],sh:[2,-77],hd:[5,-88],nf:[12,0],ff:[-12,0],nk:[8,-25],fk:[-8,-25],ne:[6,-80],nh:[10,-92],fe:[8,-80],fh:[13,-92],ball:[13,-95]}
};
const DIVE={hip:[-14,-22],sh:[14,-26],hd:[26,-28],nk:[-28,-22],nf:[-42,-26],fk:[-28,-18],ff:[-42,-16],ne:[28,-30],nh:[40,-32],fe:[28,-26],fh:[40,-25],flat:1};
const DOWN={hip:[-14,-8],sh:[14,-9],hd:[26,-11],nk:[-28,-6],nf:[-42,-6],fk:[-28,-4],ff:[-42,-3],ne:[28,-8],nh:[40,-8],fe:[24,-4],fh:[36,-3],flat:1};
const DOWNB={hip:[14,-8],sh:[-14,-9],hd:[-26,-11],nk:[28,-12],nf:[42,-6],fk:[28,-10],ff:[40,-4],ne:[-24,-12],nh:[-34,-20],fe:[-20,-6],fh:[-30,-4],flat:1};
const FALLB={hip:[4,-34],sh:[-10,-58],hd:[-16,-68],nk:[14,-22],nf:[18,-2],fk:[10,-20],ff:[14,0],ne:[0,-62],nh:[8,-74],fe:[-14,-56],fh:[-22,-62]};
const STUMBLE={hip:[-4,-36],sh:[12,-52],hd:[20,-58],nk:[4,-20],nf:[-2,0],fk:[-14,-30],ff:[-26,-26],ne:[20,-40],nh:[28,-28],fe:[18,-46],fh:[26,-36]};
const HIT={hip:[-4,-44],sh:[10,-62],hd:[18,-68],nk:[8,-24],nf:[14,-2],fk:[-10,-26],ff:[-20,-8],ne:[16,-58],nh:[14,-48],fe:[12,-60],fh:[10,-50]};
const WRAP={hip:[-2,-46],sh:[10,-68],hd:[16,-76],nk:[8,-24],nf:[10,0],fk:[-8,-24],ff:[-14,-4],ne:[20,-60],nh:[26,-52],fe:[20,-62],fh:[26,-56]};
const SHOE={hip:[-14,-14],sh:[14,-13],hd:[25,-15],nk:[-28,-14],nf:[-42,-18],fk:[-28,-10],ff:[-42,-8],ne:[28,-10],nh:[40,-4],fe:[28,-8],fh:[40,-3],flat:1};
// v2.17 the user's tackle types and a tripped runner
const FORMT={hip:[-2,-48],sh:[9,-70],hd:[15,-79],nk:[8,-24],nf:[12,0],fk:[-8,-24],ff:[-14,-2],ne:[18,-64],nh:[27,-60],fe:[18,-66],fh:[27,-63]}; // square, eyes up, arms ready to wrap
const STICKT={hip:[-6,-40],sh:[12,-56],hd:[21,-60],nk:[6,-22],nf:[16,-6],fk:[-14,-26],ff:[-26,-10],ne:[22,-58],nh:[20,-46],fe:[8,-54],fh:[2,-44]}; // shoulder down, launching off the back foot
const BITET={hip:[-16,-10],sh:[12,-9],hd:[23,-10],nk:[-30,-12],nf:[-44,-16],fk:[-30,-8],ff:[-44,-6],ne:[30,-6],nh:[43,-2],fe:[30,-5],fh:[42,-1],flat:1}; // flat out, hands at the shoes
const TRIPP={hip:[-2,-38],sh:[14,-54],hd:[22,-60],nk:[6,-18],nf:[2,0],fk:[-12,-28],ff:[-24,-30],ne:[6,-60],nh:[12,-62],fe:[22,-48],fh:[30,-40],ball:[12,-62]}; // stumbling, one foot clipped
const DRAG={hip:[0,-46],sh:[12,-70],hd:[18,-79],ne:[4,-64],nh:[10,-66],ball:[12,-66]};
const STIFF={ne:[18,-74],nh:[32,-76],fe:[4,-64],fh:[10,-66],ball:[12,-66]};
const SPIN={ne:[14,-72],nh:[25,-70],fe:[-10,-72],fh:[-21,-70],ball:[8,-66],sh:[2,-78],hd:[5,-89]};
const CUT={hip:[0,-46],sh:[-4,-74],hd:[-1,-85],nk:[8,-22],nf:[16,0],fk:[-6,-24],ff:[-12,0],ne:[10,-66],nh:[18,-70],fe:[-10,-66],fh:[-18,-70]};
const PLANT={hip:[0,-46],sh:[-2,-75],hd:[1,-86],nk:[10,-23],nf:[16,0],fk:[-4,-24],ff:[-6,0]};
const BLOCK={hip:[-2,-44],sh:[10,-68],hd:[17,-76],ne:[20,-66],nh:[28,-66],fe:[20,-63],fh:[28,-62],nk:[8,-24],nf:[10,0],fk:[-8,-24],ff:[-16,-2]};
const PASSPRO={hip:[-2,-44],sh:[4,-70],hd:[8,-80],ne:[14,-64],nh:[20,-62],fe:[14,-62],fh:[20,-60],nk:[4,-24],nf:[4,0],fk:[-8,-24],ff:[-14,0]};
const CHEER={ne:[4,-92],nh:[8,-110],fe:[0,-92],fh:[2,-110]};
const SAD={sh:[4,-76],hd:[9,-84],ne:[10,-62],nh:[4,-52],fe:[-6,-62],fh:[-2,-52]};
const SWAT={ne:[8,-92],nh:[12,-108],fe:[4,-62],fh:[8,-52]};
const STUN={sh:[-4,-76],hd:[-3,-87]};
const KICKP={hip:[0,-50],sh:[-5,-76],hd:[-2,-87],ff:[4,0],fk:[2,-26],nk:[14,-42],nf:[32,-50],ne:[10,-70],nh:[18,-72],fe:[-10,-70],fh:[-20,-74]};
const HOLDER={hip:[-4,-28],sh:[0,-56],hd:[3,-66],nk:[8,-14],nf:[18,0],fk:[-6,-1],ff:[-20,0],ne:[8,-36],nh:[14,-14],fe:[6,-36],fh:[12,-12]};
const SNAPPER={hip:[-4,-44],sh:[12,-48],hd:[20,-52],nk:[8,-22],nf:[8,0],fk:[-10,-22],ff:[-12,0],ne:[18,-32],nh:[20,-4],fe:[14,-34],fh:[18,-6]};
const SIGNAL_TD={ne:[4,-92],nh:[6,-112],fe:[2,-92],fh:[3,-112]};
const FLAGTHROW={ne:[12,-88],nh:[20,-100],fe:[-4,-62],fh:[-8,-52]};

/* ===================== pixel sprite renderer ===================== */
const OUTC='#0a1119';
function pxRect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
function pxSeg(a,b,w,c){
  const dx=b[0]-a[0],dy=b[1]-a[1],n=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy)))),o=(w-1)/2;
  ctx.fillStyle=c;for(let i=0;i<=n;i++)ctx.fillRect(Math.round(a[0]+dx*i/n-o),Math.round(a[1]+dy*i/n-o),w,w);
}
function pxDisc(cx,cy,rx,ry,c){
  ctx.fillStyle=c;const R=Math.max(0,Math.round(ry)),X=Math.round(cx),Y=Math.round(cy);
  for(let yy=-R;yy<=R;yy++){const hw=Math.round(rx*Math.sqrt(Math.max(0,1-(yy*yy)/((ry+0.35)*(ry+0.35)))));ctx.fillRect(X-hw,Y+yy,hw*2+1,1);}
}
function lightN(a,b){const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;let nx=-dy/l,ny=dx/l;if(nx*-0.55+ny*-0.83<0){nx=-nx;ny=-ny;}return[nx,ny];}
function shadedSeg(a,b,w,T){
  pxSeg(a,b,w,T.s);
  if(w>=2){const[nx,ny]=lightN(a,b),o=0.7;pxSeg([a[0]+nx*o,a[1]+ny*o],[b[0]+nx*o,b[1]+ny*o],w-1,T.m);
    if(w>=4){const q=w/2-0.8;pxSeg([a[0]+nx*q,a[1]+ny*q],[b[0]+nx*q,b[1]+ny*q],1,T.l);}}
}
function shadedDisc(cx,cy,rx,ry,T){
  pxDisc(cx,cy,rx,ry,T.s);
  if(rx>=1.5){pxDisc(cx-0.6,cy-0.7,Math.max(0.5,rx-0.9),Math.max(0.5,ry-0.9),T.m);
    if(rx>=3.5)pxDisc(cx-rx*0.32,cy-ry*0.42,rx*0.3,Math.max(0.5,ry*0.26),T.l);}
}
const DIG={0:['111','101','101','101','111'],1:['010','110','010','010','111'],2:['111','001','111','100','111'],3:['111','001','111','001','111'],4:['101','101','111','001','001'],
  5:['111','100','111','001','111'],6:['111','100','111','101','111'],7:['111','001','010','010','010'],8:['111','101','111','101','111'],9:['111','101','111','001','111']};
function pxNum(n,cx,cy,c){
  const s=String(n),w=s.length*4-1,x0=Math.round(cx-w/2),y0=Math.round(cy-2.5);ctx.fillStyle=c;
  for(let k=0;k<s.length;k++){const g=DIG[s[k]];for(let r=0;r<5;r++)for(let q=0;q<3;q++)if(g[r][q]==='1')ctx.fillRect(x0+k*4+q,y0+r,1,1);}
}
/* draws one player snapshot S at screen (sx,sy), z = px per unit, dir = screen facing */
function drawSpritePx(S,sx,sy,z,dir){
  const P=S.pp,B=S.body,K=S.kit,L=S.look,zz=z*B.hs,ws=B.ws;
  const pt=k=>[sx+dir*P[k][0]*zz,sy+P[k][1]*zz];
  const W_=(u,f=1)=>Math.max(1,Math.round(u*zz*f));
  const hip=pt('hip'),sh=pt('sh'),hd=pt('hd'),nk=pt('nk'),nf=pt('nf'),fk=pt('fk'),ff=pt('ff'),ne=pt('ne'),nh=pt('nh'),fe=pt('fe'),fh=pt('fh');
  const wTh=W_(10.5,Math.pow(ws,0.8)),wSh=W_(7.5,0.65+0.35*ws),wUa=W_(7.8,Math.pow(ws,0.6)),wFa=W_(6.2,Math.pow(ws,0.5)),wTo=W_(17,Math.pow(ws,0.8)),wNk=W_(5.5,ws);
  const padRx=11.5*zz*Math.pow(ws,0.6),padRy=7*zz,hipRx=9.5*zz*Math.pow(ws,0.8),hipRy=7.5*zz,hr=Math.max(1.5,8.4*zz);
  const shp=[sh[0]-dir*1.5*zz,sh[1]+3*zz];
  const belly=B.belly>0?[lerp(hip[0],sh[0],0.32)+dir*5*zz,lerp(hip[1],sh[1],0.32)]:null;
  const isRef=S.ref;
  // ---- silhouette outline
  const O=OUTC;
  pxSeg(sh,fe,wUa+2,O);pxSeg(fe,fh,wFa+2,O);pxSeg(hip,fk,wTh+2,O);pxSeg(fk,ff,wSh+2,O);
  pxSeg(hip,sh,wTo+2,O);pxDisc(shp[0],shp[1],padRx+1,padRy+1,O);pxDisc(hip[0],hip[1],hipRx+1,hipRy+1,O);
  if(belly)pxDisc(belly[0],belly[1],(4+7*B.belly)*zz+1,6*zz+1,O);
  pxSeg(hip,nk,wTh+2,O);pxSeg(nk,nf,wSh+2,O);pxDisc(hd[0],hd[1],hr+1,hr*0.96+1,O);
  pxSeg(sh,ne,wUa+2,O);pxSeg(ne,nh,wFa+2,O);
  const cle=(f,T)=>{const x=f[0]+dir*2.2*zz;pxDisc(x,f[1]-1*zz,Math.max(1,4.6*zz),Math.max(0.6,2*zz),O);};
  cle(ff);cle(nf);
  // ---- far arm & far leg (darker)
  const Kf=n=>K[n].f;
  shadedSeg(sh,fe,wUa,Kf('sleeve'));
  shadedSeg(fe,fh,wFa,L.sleeve?L.sleeve.f:L.skin.f);
  pxDisc(fh[0],fh[1],Math.max(0.6,2.7*zz),Math.max(0.6,2.7*zz),Kf('glove').m);
  shadedSeg(hip,fk,wTh,Kf('pants'));
  const sockTop=(k,f)=>[lerp(k[0],f[0],L.longSock?0.15:0.45),lerp(k[1],f[1],L.longSock?0.15:0.45)];
  shadedSeg(fk,ff,wSh,L.skin.f);shadedSeg(sockTop(fk,ff),ff,wSh,Kf('sock'));
  pxDisc(ff[0]+dir*2.2*zz,ff[1]-1*zz,Math.max(0.6,3.8*zz),Math.max(0.5,1.5*zz),Kf('cleat').m);
  // ---- hips, torso, pads
  shadedDisc(hip[0],hip[1],hipRx,hipRy,K.pants);
  shadedSeg(hip,sh,wTo,K.jersey);
  if(belly)shadedDisc(belly[0],belly[1],(4+7*B.belly)*zz,6*zz,K.jersey);
  shadedDisc(shp[0],shp[1],padRx,padRy,K.jersey);
  if(isRef){
    const[nx,ny]=lightN(hip,sh);ctx.fillStyle='#111';
    for(let o=-wTo/2+1;o<wTo/2;o+=2)pxSeg([hip[0]+nx*o,hip[1]+ny*o],[sh[0]+nx*o,sh[1]+ny*o],1,'#141414');
    for(let o=-padRx+1;o<padRx;o+=2)pxRect(shp[0]+o,shp[1]-padRy*0.8,1,padRy*1.4,'#141414');
  }else{
    if(padRx>=4)pxSeg([shp[0]-padRx*0.85,shp[1]-padRy*0.55],[shp[0]+padRx*0.85,shp[1]-padRy*0.55],1,K.trim.m);
    const tc=[lerp(hip[0],sh[0],0.55),lerp(hip[1],sh[1],0.55)];
    if(wTo>=8&&S.num!=null)pxNum(S.num,tc[0],tc[1],K.num.m);
    pxSeg([hip[0]-hipRx*0.8,hip[1]-hipRy*0.55],[hip[0]+hipRx*0.8,hip[1]-hipRy*0.55],1,K.trim.s);
  }
  // ---- near leg
  shadedSeg(hip,nk,wTh,K.pants);
  if(wTh>=3&&!isRef){const[nx,ny]=lightN(hip,nk);pxSeg([hip[0]-nx*0.4,hip[1]-ny*0.4],[nk[0]-nx*0.4,nk[1]-ny*0.4],1,K.pstripe.m);}
  shadedSeg(nk,nf,wSh,L.skin);shadedSeg(sockTop(nk,nf),nf,wSh,K.sock);
  pxDisc(nf[0]+dir*2.2*zz,nf[1]-1*zz,Math.max(0.6,4*zz),Math.max(0.5,1.6*zz),K.cleat.m);
  if(zz>0.32)pxRect(nf[0]+dir*2.2*zz-1,nf[1],2,1,K.cleat.s);
  // ---- neck & head
  pxSeg(sh,[lerp(sh[0],hd[0],0.75),lerp(sh[1],hd[1],0.75)],wNk,L.skin.s);
  if(isRef){
    shadedDisc(hd[0],hd[1]+hr*0.15,hr*0.82,hr*0.9,L.skin);
    pxDisc(hd[0],hd[1]-hr*0.42,hr*0.88,hr*0.45,'#f8f8f8');pxRect(hd[0]+(dir>0?0:-hr*1.2),hd[1]-hr*0.22,Math.max(2,Math.round(hr*1.2)),1,'#222');
    pxRect(hd[0]+dir*hr*0.45,hd[1]-hr*0.05,1,1,'#111');
  }else{
    const H_=K.helmet;
    pxDisc(hd[0],hd[1],hr,hr*0.96,H_.s);pxDisc(hd[0]-0.6,hd[1]-0.7,hr-0.8,hr*0.96-0.8,H_.m);
    // face opening
    const fx=hd[0]+dir*hr*0.42,fy=hd[1]-hr*0.05,fw=Math.max(1,Math.round(hr*0.62)),fhh=Math.max(1,Math.round(hr*0.78));
    pxRect(dir>0?fx:fx-fw+1,fy,fw,fhh,L.skin.m);
    if(hr>=3){pxRect(dir>0?fx:fx-fw+1,fy,fw,1,L.visor?'#141c26':L.skin.s);pxRect(fx+dir*(fw*0.35),fy+(L.visor?0:Math.max(1,fhh*0.25)),1,1,L.visor?'#5d7488':'#121a22');}
    // facemask
    const mx=hd[0]+dir*hr*1.02;pxSeg([mx,hd[1]-hr*0.15],[mx-dir*hr*0.1,hd[1]+hr*0.85],1,K.mask.m);
    if(hr>=3){pxSeg([fx,fy+fhh*0.5],[mx,fy+fhh*0.45],1,K.mask.m);pxSeg([fx-dir,fy+fhh],[mx,fy+fhh-0.2],1,K.mask.m);}
    // stripe over the crown and shine
    if(hr>=3){for(let a=-2.6;a<=-0.55;a+=0.16){const ax=hd[0]+Math.cos(dir>0?a:Math.PI-a)*(hr-0.8),ay=hd[1]+Math.sin(a)*(hr-0.8);pxRect(ax,ay,1,1,K.hstripe.m);}
      pxRect(hd[0]-dir*hr*0.25,hd[1]-hr*0.55,Math.max(1,Math.round(hr*0.3)),1,H_.l);
      pxRect(hd[0]-dir*hr*0.2,hd[1]+hr*0.1,Math.max(1,Math.round(hr*0.28)),Math.max(1,Math.round(hr*0.28)),K.trim.m);}
  }
  // ---- near arm
  shadedSeg(sh,ne,wUa,K.sleeve);
  if(wUa>=3&&!isRef){const m=[lerp(sh[0],ne[0],0.7),lerp(sh[1],ne[1],0.7)];pxDisc(m[0],m[1],wUa*0.5,0.6,K.trim.m);}
  shadedSeg(ne,nh,wFa,L.sleeve||L.skin);
  pxDisc(nh[0],nh[1],Math.max(0.6,2.9*zz),Math.max(0.6,2.9*zz),K.glove.m);
  if(S.ball){const b=[sx+dir*S.ball[0]*zz,sy+S.ball[1]*zz],r=Math.max(1,4.2*zz);
    pxDisc(b[0],b[1],r+1,r*0.62+1,O);pxDisc(b[0],b[1],r,r*0.62,'#7a3d17');pxRect(b[0]-r*0.5,b[1]-r*0.3,Math.max(1,Math.round(r)),1,'#e9e3d6');}
}
let QHI=GDS.gfx!=='fast'&&!((/Android/i.test(navigator.userAgent||''))&&((navigator.deviceMemory||8)<=4||(navigator.hardwareConcurrency||8)<=4));
