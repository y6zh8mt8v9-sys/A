/* ===================== receiver stance sprites =====================
   New stances are cut from the pack's own 2-point stance frames, so they keep its
   exact pixel style and recolour per team: different amounts of forward lean,
   a relaxed upright stance, and hands resting on the front knee. The hand-down
   stance is the pack's own 3-point frame.                                     */
function leanFrame(src,hipY,k,drop){
  const W0=64,inn=src.getContext('2d').getImageData(0,0,W0,W0),o=new ImageData(W0,W0),d=inn.data,od=o.data;
  for(let y=hipY;y<W0;y++)for(let x=0;x<W0;x++){const i=(y*W0+x)*4;od[i]=d[i];od[i+1]=d[i+1];od[i+2]=d[i+2];od[i+3]=d[i+3];}
  for(let y=0;y<hipY;y++){const dy=y+drop;if(dy<0||dy>=W0)continue;const sx=Math.round(k*(hipY-y));
    for(let x=0;x<W0;x++){const i=(y*W0+x)*4;if(d[i+3]!==255)continue;const nx=x+sx;if(nx<0||nx>=W0)continue;const j=(dy*W0+nx)*4;od[j]=d[i];od[j+1]=d[i+1];od[j+2]=d[i+2];od[j+3]=255;}}
  if(drop<0){for(let y=hipY+drop;y<hipY;y++){const sy=hipY;for(let x=0;x<W0;x++){const i=(sy*W0+x)*4,j=(y*W0+x)*4;if(d[i+3]===255&&od[j+3]!==255){od[j]=d[i];od[j+1]=d[i+1];od[j+2]=d[i+2];od[j+3]=255;}}}}
  const c=document.createElement('canvas');c.width=W0;c.height=W0;c.getContext('2d').putImageData(o,0,0);return c;
}
// rigid lean: the upper body turns about the hip as one piece (a shear skews the torso and twists it against the legs)
function rotUpper(src,hipY,deg,drop){
  const N=64,d=src.getContext('2d').getImageData(0,0,N,N).data,o=new ImageData(N,N),od=o.data;
  for(let y=hipY;y<N;y++)for(let x=0;x<N;x++){const i=(y*N+x)*4;od[i]=d[i];od[i+1]=d[i+1];od[i+2]=d[i+2];od[i+3]=d[i+3];}
  let a=N,b=-1;for(let x=0;x<N;x++)if(d[((hipY-1)*N+x)*4+3]===255){a=Math.min(a,x);b=Math.max(b,x);}
  const px=b<0?32:(a+b+1)/2,py=hipY,t=deg*Math.PI/180,c=Math.cos(t),s=Math.sin(t);
  for(let y=0;y<Math.min(N,hipY+Math.max(0,drop)+6);y++)for(let x=0;x<N;x++){
    const X=x+0.5-px,Y=y+0.5-drop-py;let sx=Math.floor(px+c*X+s*Y),sy=Math.floor(py-s*X+c*Y);
    if(sy>=hipY&&y<hipY&&sy<hipY+2)sy=hipY-1; // close the seam when the body is lifted
    if(sx<0||sx>=N||sy<0||sy>=hipY)continue;const i=(sy*N+sx)*4;if(d[i+3]!==255)continue;
    const j=(y*N+x)*4;if(y>=hipY&&od[j+3]===255)continue;od[j]=d[i];od[j+1]=d[i+1];od[j+2]=d[i+2];od[j+3]=255;}
  const cv=document.createElement('canvas');cv.width=N;cv.height=N;cv.getContext('2d').putImageData(o,0,0);
  cv.rot={px,py,c,s,drop};return cv;
}
function kneeFrame(src,lib){
  // hands-on-knee stance: the regular 2-point stance exactly as drawn (legs, body, head untouched); only the arms change.
  // The artist's arms come off, the chest they covered is rebuilt, and two relaxed, slightly bent arms are drawn from the
  // shoulder down to the front knee in the armSleeve / gloves key colours (so undershirts, sleeves and gloves still recolour)
  const N=64,K=lib.ATLAS.keys,mats=lib.materials,MI=n=>mats.indexOf(n),rev=new Map();
  for(const k in K){const[m,l]=k.split(',').map(Number),c=K[k];rev.set((c[0]<<16)|(c[1]<<8)|c[2],[m,l]);}
  const JE=MI('jersey'),JT=MI('jerseyTrim'),AR=MI('armSleeve'),GL=MI('gloves'),PA=MI('pants'),BE=MI('belt'),PS=MI('pantsStripe');
  const cx=src.getContext('2d'),at=(x,y)=>(y*N+x)*4,im=cx.getImageData(0,0,N,N),d=im.data;
  const matAt=(x,y)=>{if(x<0||y<0||x>=N||y>=N)return -3;const i=at(x,y);if(d[i+3]!==255)return -2;const r=rev.get((d[i]<<16)|(d[i+1]<<8)|d[i+2]);return r?r[0]:-1;};
  const paint=(x,y,m,l)=>{if(x<0||y<0||x>=N||y>=N)return;const c=K[m+','+l];if(!c)return;const i=at(x,y);d[i]=c[0];d[i+1]=c[1];d[i+2]=c[2];d[i+3]=255;};
  // hip = first row under the jersey
  let hip=-1;for(let y=N-1;y>=0&&hip<0;y--)for(let x=0;x<N;x++){const m=matAt(x,y);if(m===JE||m===JT){hip=y+1;break;}}
  if(hip<0)return src;
  // shoulder: a little below the top of the jersey, just behind its front edge
  let jy=-1;for(let y=8;y<hip&&jy<0;y++)for(let x=0;x<N;x++){const m=matAt(x,y);if(m===JE||m===JT){jy=y;break;}}
  let jf=-1,jb=N;for(let x=0;x<N;x++){const m=matAt(x,jy+3);if(m===JE||m===JT){jf=Math.max(jf,x);jb=Math.min(jb,x);}}
  // 1) arms off
  let top=99;for(let y=0;y<hip;y++)for(let x=0;x<N;x++){const m=matAt(x,y);if(m===AR||m===GL){d[at(x,y)+3]=0;top=Math.min(top,y);}}
  if(top===99){return src;}
  // 2) rebuild the chest the arms covered: a clean front edge from the chest down to the pants
  const rowFront=(y,ms)=>{let r=-1;for(let x=0;x<N;x++)if(ms.includes(matAt(x,y)))r=x;return r;},rowBack=(y,ms)=>{for(let x=0;x<N;x++)if(ms.includes(matAt(x,y)))return x;return -1;};
  const y0=Math.max(0,top-1),fTop=rowFront(y0,[JE,JT]);let yb=hip;while(yb<hip+4&&rowFront(yb,[PA,BE,PS])<0)yb++;const fBot=rowFront(yb,[PA,BE,PS]);
  if(fTop>0&&fBot>0)for(let y=y0+1;y<yb;y++){const u=(y-y0)/(yb-y0),fx=Math.round(fTop+(fBot-fTop)*u),bx=rowBack(y,[JE,JT,PA,BE,PS,-1]);if(bx<0)continue;
    for(let x=bx+1;x<N;x++){const m=matAt(x,y),i=at(x,y);
      if(x>fx){if(m===JE||m===JT||m===-1)d[i+3]=0;continue;}
      if(x===fx){paint(x,y,JE,0);continue;}
      if(m===-2||m===-1)paint(x,y,JE,x>=fx-2?3:x>=fx-5?2:(x+y)%7===0?1:2);}}
  // 3) the front knee: the front-most pants pixel below the hip; the hands rest on the top of the thigh just behind it
  let kx=-1,ky=-1;for(let y=hip+2;y<hip+14&&y<N;y++)for(let x=N-1;x>=0;x--){const m=matAt(x,y);if(m===PA||m===PS){if(x>kx){kx=x;ky=y;}break;}}
  if(kx<0)return src;
  const hx=kx-1;let ty=-1;for(let y=hip;y<N&&ty<0;y++){const m=matAt(hx,y);if(m===PA||m===PS)ty=y;}if(ty<0)ty=ky-1;
  const S=[jf-4,jy+5],Hd=[hx,ty-1];
  // a relaxed arm: shoulder -> elbow (bent slightly forward of the straight line) -> hand
  const elbow=(s,h,out)=>{const mx=(s[0]+h[0])/2,my=(s[1]+h[1])/2,dx=h[0]-s[0],dy=h[1]-s[1],L=Math.hypot(dx,dy)||1;return[mx+dy/L*out,my-dx/L*out];};
  const segDist=(px,py,a,b)=>{const vx=b[0]-a[0],vy=b[1]-a[1],t=Math.max(0,Math.min(1,((px-a[0])*vx+(py-a[1])*vy)/(vx*vx+vy*vy||1))),qx=a[0]+vx*t,qy=a[1]+vy*t;
    const L=Math.hypot(vx,vy)||1;return[Math.hypot(px-qx,py-qy),((px-qx)*vy-(py-qy)*vx)/L];}; // [distance, side (+ = front / lit)]
  const drawArm=(s,h,dark,behind)=>{const e=elbow(s,h,-2.1),segs=[[s,e,1.9],[e,h,1.45]];
    for(let y=Math.min(s[1],h[1])-3;y<=Math.max(s[1],h[1])+3;y++)for(let x=Math.min(s[0],h[0])-4;x<=Math.max(s[0],h[0])+4;x++){
      let best=null;for(const[a,b,r]of segs){const[dd,side]=segDist(x+0.5,y+0.5,a,b);if(dd<=r&&(!best||dd<best[0]))best=[dd,side,r];}
      if(!best)continue;const m=matAt(x,y);if(behind&&(m===JE||m===JT||m===-1&&y<hip))continue;
      const edge=best[0]>best[2]-0.75;let l=edge?(best[1]>0?3:0):2;if(dark)l=Math.max(0,l-1);paint(x,y,AR,l);}
    // shoulder pad: the jersey sleeve caps the top of the upper arm, a little wider than the arm, ending in the sleeve trim
    {const vx=e[0]-s[0],vy=e[1]-s[1],L=Math.hypot(vx,vy)||1,ux=vx/L,uy=vy/L,cap=4.6;
      for(let y=s[1]-4;y<=s[1]+7;y++)for(let x=s[0]-5;x<=s[0]+5;x++){const px=x+0.5-s[0],py=y+0.5-(s[1]-1),a=px*ux+py*uy,b=px*uy-py*ux;
        if(a<-2.2||a>cap+0.6)continue;const r=2.75-Math.max(0,a-cap+1.6)*0.45;if(Math.abs(b)>r||(a<0&&Math.hypot(a,b)>2.75))continue;
        const m=matAt(x,y);if(behind&&(m===JE||m===JT||m===-1&&y<hip))continue;
        let l=Math.abs(b)>r-0.8?(b>0?3:0):(a>cap-0.8?2:2);if(dark)l=Math.max(0,l-1);
        if(a>cap-0.8)paint(x,y,JT,dark?1:2);else paint(x,y,JE,l===0?1:l);}}
    // glove resting on the thigh, fingers over the front of the knee
    // palm on top of the thigh, fingers curled down over the front of the knee
    for(const[gx,gy,l]of[[-1,-1,3],[0,-1,3],[1,-1,3],[-1,0,2],[0,0,2],[1,0,2],[2,0,2],[2,1,2],[2,2,0],[1,1,0],[3,1,0],[3,2,0]]){
      const X=h[0]+gx,Y=h[1]+gy;if(behind&&gx<1)continue;paint(X,Y,GL,dark?Math.max(0,l-1):l);}};
  drawArm([S[0]-2,S[1]-1],[Hd[0]-2,Hd[1]],true,true); // far arm, mostly hidden behind the body
  drawArm(S,Hd,false,false);                          // near arm
  cx.putImageData(im,0,0);return src;
}
/* standing frames for the sideline: the front / back running views keep their upper body, and get straight legs drawn
   in the sheet's key colours (so they recolour per team and keep jersey numbers) */
function gpComposeStand(lib,sheet,upAnim,upF,loAnim,loF){
  const U=lib.frameRaw(sheet,upAnim,upF),L=lib.frameRaw(sheet,loAnim,loF),N=64,K=lib.ATLAS.keys;
  const MI=n=>lib.matIndex(n),PANTS=MI('pants'),BELT=MI('belt'),SOCK=MI('socks'),CLEAT=MI('cleats');
  const mat=(d,x,y)=>{if(x<0||y<0||x>=N||y>=N)return -3;const i=(y*N+x)*4;return d[i+3]===255?lib.matOf(d[i],d[i+1],d[i+2]):-2;};
  const rowSpan=(d,want,y)=>{let a=N,b=-1;for(let x=0;x<N;x++)if(want.includes(mat(d,x,y))){a=Math.min(a,x);b=Math.max(b,x);}return b<0?null:[a,b];};
  const first=(d,want)=>{for(let y=8;y<62;y++){const s=rowSpan(d,want,y);if(s&&s[1]-s[0]>=2)return y;}return -1;};
  const last=(d,want)=>{for(let y=62;y>=8;y--)if(rowSpan(d,want,y))return y;return -1;};
  let bu=first(U.px,[BELT]);if(bu<0)bu=first(U.px,[PANTS]);let bl=first(L.px,[BELT]);if(bl<0)bl=first(L.px,[PANTS]);
  if(bu<0||bl<0)return null;
  const dy=bl-bu,cut=bl+2;
  // outline colour: the most common opaque non-key colour
  const cnt=new Map();for(let i=0;i<U.px.length;i+=4){if(U.px[i+3]!==255)continue;if(lib.matOf(U.px[i],U.px[i+1],U.px[i+2])!==-1)continue;const k=(U.px[i]<<16)|(U.px[i+1]<<8)|U.px[i+2];cnt.set(k,(cnt.get(k)||0)+1);}
  let ol=0,best=0;for(const[k,v]of cnt)if(v>best){best=v;ol=k;}
  const px=new Uint8ClampedArray(N*N*4),num=U.num?new Uint8ClampedArray(N*N*4):null;
  // ground shadow from the idle frame
  for(let i=0;i<L.px.length;i+=4)if(L.px[i+3]>0&&L.px[i+3]<255)px.set(L.px.subarray(i,i+4),i);
  for(let y=0;y<cut;y++)for(let x=0;x<N;x++){const sy=y-dy;if(sy<0||sy>=N)continue;const s=(sy*N+x)*4,o=(y*N+x)*4;if(U.px[s+3]===0)continue;px.set(U.px.subarray(s,s+4),o);if(num)num.set(U.num.subarray(s,s+4),o);}
  // belt span after the shift sets hip width; centre the legs on the anchor column
  const sp=rowSpan(px,[BELT,PANTS],bl)||[28,36];
  const kneeY=last(L.px,[PANTS]),sockY=last(L.px,[SOCK]),footY=last(L.px,[CLEAT]);
  const cx=(sp[0]+sp[1])/2,hw=Math.max(4,Math.round((sp[1]-sp[0]+1)/2)),legW=Math.max(3,hw-1);
  const set=(x,y,m,l)=>{if(x<0||x>=N||y<0||y>=N)return;const c=K[m+','+l];if(!c)return;const o=(y*N+x)*4;px[o]=c[0];px[o+1]=c[1];px[o+2]=c[2];px[o+3]=255;if(num){num[o]=num[o+1]=num[o+2]=num[o+3]=0;}};
  const filled=new Set();
  const PS=MI('pantsStripe'),SS=MI('sockStripe');
  for(let y=cut;y<=Math.max(footY,kneeY+3);y++){
    const crotch=y>=cut+3;
    for(const side of[-1,1]){
      const inner=side<0?Math.floor(cx)-(crotch?1:0):Math.ceil(cx)+(crotch?1:0);
      // the shoe is always the last two rows (the idle frame's sock outline can run to the ground and hide it)
      const isPants=y<=kneeY,isSock=!isPants&&y<=Math.min(sockY,footY-2),isCleat=!isPants&&!isSock;
      let w=isPants?legW+(y<cut+3?1:0):isSock?legW-1:legW;
      for(let k=0;k<w;k++){const x=inner+side*k,outer=k===w-1,innerC=k===0;
        let m=isPants?PANTS:isSock?SOCK:CLEAT,l=outer?(isSock?2:1):isSock?3:(k===1&&side<0?3:2);
        if(isPants&&k===w-2&&w>=4)m=PS,l=2;if(isSock&&y===kneeY+2&&w>=3)m=SS,l=2;
        if(isCleat)l=y===footY?1:2;
        set(x,y,m,l);filled.add(y*N+x);}
    }
  }
  // outline around the new legs
  const olc=[(ol>>16)&255,(ol>>8)&255,ol&255];
  for(const p of [...filled]){const x=p%N,y=(p-x)/N;for(const[a,b]of[[1,0],[-1,0],[0,1]]){const X=x+a,Y=y+b;if(X<0||X>=N||Y>=N||Y<cut)continue;if(filled.has(Y*N+X))continue;const o=(Y*N+X)*4;if(px[o+3]===255)continue;px[o]=olc[0];px[o+1]=olc[1];px[o+2]=olc[2];px[o+3]=255;}}
  return{px,num};
}

function gpBestFrame(lib,sheet,anim){let best=0,bw=1e9;const m=lib.ATLAS.sheets[sheet].anims[anim];if(!m)return 0;
  for(let f=0;f<m.frames;f++){const R=lib.frameRaw(sheet,anim,f).px;let a=64,b=-1;for(let y=10;y<40;y++)for(let x=0;x<64;x++)if(R[(y*64+x)*4+3]===255){a=Math.min(a,x);b=Math.max(b,x);}if(b-a<bw){bw=b-a;best=f;}}return best;}
function gpShiftUp(F,dy){if(!F||!dy)return F;const N=64,cut=40,o={px:F.px.slice(),num:F.num?F.num.slice():null};
  // breathing: move the head and shoulders one pixel
  for(let y=0;y<cut;y++)for(let x=0;x<N;x++){const d=(y*N+x)*4,s=((y+dy)*N+x)*4;if(y+dy<0||y+dy>=cut){continue;}o.px.set(F.px.subarray(s,s+4),d);if(o.num)o.num.set(F.num.subarray(s,s+4),d);}
  return o;}
function buildSideFrames(lib){
  for(const sheet of['player_skill','player_big','player_line']){
    const S=lib.ATLAS.sheets[sheet];if(!S||!S.anims.run_front||!S.anims.run_back)continue;
    for(const[name,src]of[['stand_front','run_front'],['stand_back','run_back']]){
      try{const f=gpBestFrame(lib,sheet,src),F=gpComposeStand(lib,sheet,src,f,'idle',0);if(!F)continue;
        lib.addAnimRaw(sheet,name,[F,F,gpShiftUp(F,1),F],2.2,true);}catch(e){console.error(e);}
    }
  }
  // coaches: the referee build is drawn three-quarter front; a back view swaps the face for hair / cap
  try{const R=lib.frameRaw('referee','ref_idle',0),N=64,SK=lib.matIndex('skin'),HR=lib.matIndex('hair'),CAP=lib.matIndex('cap'),K=lib.ATLAS.keys;
    const px=R.px.slice();let top=-1;for(let y=0;y<N&&top<0;y++)for(let x=0;x<N;x++)if(px[(y*N+x)*4+3]===255){top=y;break;}
    for(let y=top;y<top+9;y++)for(let x=0;x<N;x++){const i=(y*N+x)*4;if(px[i+3]!==255)continue;const id=lib.matOf(px[i],px[i+1],px[i+2]);if(id!==SK)continue;
      const lv=y<top+6?2:1,c=K[(y<top+4?CAP:HR)+','+lv]||K[HR+',1'];if(c){px[i]=c[0];px[i+1]=c[1];px[i+2]=c[2];}}
    lib.addAnimRaw('referee','coach_back',[{px,num:R.num}],1,true);}catch(e){console.error(e);}
}
/* head turns: receivers glance toward the QB or the sideline before the snap, the QB scans the field.
   The helmet is redrawn turned slightly toward or away from the camera (3/4 views), never mirrored to look straight back. */
function gpHeadInfo(lib,R){
  const N=64,HE=[lib.matIndex('helmet'),lib.matIndex('helmetStripe'),lib.matIndex('helmetLogo')],FM=lib.matIndex('facemask'),FACE=[lib.matIndex('skin'),lib.matIndex('faceDark'),lib.matIndex('hair')];
  const mat=new Int8Array(N*N).fill(-2);for(let i=0;i<N*N;i++)if(R.px[i*4+3]===255)mat[i]=lib.matOf(R.px[i*4],R.px[i*4+1],R.px[i*4+2]);
  let x0=99,x1=-1,y0=99,y1=-1;for(let y=0;y<N;y++)for(let x=0;x<N;x++){const m=mat[y*N+x];if(HE.includes(m)||m===FM){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}}
  if(x1<0)return null;const set=[];
  for(let y=Math.max(0,y0-1);y<=y1;y++)for(let x=Math.max(0,x0-2);x<=Math.min(N-1,x1+2);x++){const m=mat[y*N+x];if(HE.includes(m)||m===FM||(FACE.includes(m)&&y>=y0)||(m===-1&&y<=y1))set.push(y*N+x);}
  // dark outline pixels that belong to the helmet are keyed level 0 of the helmet, so they are already in the set
  return{x0,x1,y0,y1,cx:(x0+x1)/2,set};
}
function gpHeadSwap(lib,R,H,src,SH,mode){
  const N=64,o={px:R.px.slice(),num:R.num?R.num.slice():null};
  for(const p of H.set){o.px[p*4+3]=0;if(o.num)o.num[p*4+3]=0;}
  const put=(tx,ty,s,from)=>{if(tx<0||ty<0||tx>=N||ty>=N)return;const t=ty*N+tx;o.px.set(from.px.subarray(s*4,s*4+4),t*4);if(o.num)o.num[t*4+3]=0;};
  if(mode==='mirror'){for(const p of H.set){const x=p%N,y=(p-x)/N;put(Math.round(2*H.cx-x),y,p,R);}}
  else{const dx=Math.round(H.cx-SH.cx),dy=H.y1-SH.y1;for(const p of SH.set){const x=p%N,y=(p-x)/N;put(x+dx,y+dy,p,src);}}
  return o;
}
function buildLookFrames(lib){
  for(const sheet of['player_skill','player_big','player_line']){
    const A=lib.ATLAS.sheets[sheet].anims,list=[];if(!A.stand_front||!A.stand_back)continue;
    const make=(anim,name,fr)=>{const m=A[anim];if(!m)return;const fs=fr||Array.from({length:m.frames},(_,i)=>i);const out={lq:[],lc:[],la:[]};
      // only a slight turn of the head (about 45 degrees), never a full look back over the shoulder
      const turn=(R,v)=>{const o={px:R.px.slice(),num:R.num?R.num.slice():null};lib.helmetStamp(o,anim,v,sheet);return o;};
      for(const f of fs){const R=lib.frameRaw(sheet,anim,f),H=gpHeadInfo(lib,R);if(!H)return;out.lq.push(turn(R,'q3'));out.lc.push(turn(R,'q3'));out.la.push(turn(R,'q3a'));}
      const info=fs.map(f=>({ball:m.info[f]&&m.info[f].ball?m.info[f].ball.slice():null}));
      for(const k of['lq','lc','la'])list.push({name:name+'_'+k,frames:out[k],fps:m.fps,loop:m.loop,info});};
    for(const s of['wr_up','wr_lean','wr_deep','wr_knee','stance_2pt'])make(s,s);
    make('stance_qb','stance_qb');make('throw','qbhold',[0]);
    try{if(list.length)lib.addAnimsRaw(sheet,list);}catch(e){console.error(e);}
  }
}
// feet-first QB slide, built from the sitting part of the get-up, ball held at the hands
function buildSlideFrames(lib){
  for(const sheet of['player_skill','player_big','player_line']){const A=lib.ATLAS.sheets[sheet].anims;if(!A.getup||A.getup.frames<4)continue;
    const GL=lib.matIndex('jersey'),SK=lib.matIndex('jerseyTrim');
    // the sit-up pose has the legs trailing; mirror the body so the legs lead the slide, then turn the head back to face upfield
    const mir=R=>{const o={px:new Uint8ClampedArray(R.px.length),num:R.num?new Uint8ClampedArray(R.num.length):null};for(let y=0;y<64;y++)for(let x=0;x<64;x++){const s=(y*64+x)*4,t=(y*64+(63-x))*4;o.px.set(R.px.subarray(s,s+4),t);}
      const H=gpHeadInfo(lib,o);return H?gpHeadSwap(lib,o,H,null,null,'mirror'):o;};
    const base=mir(lib.frameRaw(sheet,'getup',2)),fr=[base,base,base,base],info=fr.map(R=>{let sx=0,sy=0,n=0;for(let i=0;i<64*64;i++){if(R.px[i*4+3]!==255)continue;const m=lib.matOf(R.px[i*4],R.px[i*4+1],R.px[i*4+2]);if(m===GL){sx+=i%64;sy+=Math.floor(i/64);n++;}}
      if(!n){for(let i=0;i<64*64;i++){if(R.px[i*4+3]!==255)continue;if(lib.matOf(R.px[i*4],R.px[i*4+1],R.px[i*4+2])===SK){sx+=i%64;sy+=Math.floor(i/64);n++;}}}
      return{ball:n?[sx/n+3,sy/n+1]:[40,44]};});
    try{lib.addAnimsRaw(sheet,[{name:'qb_slide',frames:fr,fps:8,loop:false,info}]);}catch(e){console.error(e);}}
}
// which way the QB's eyes are going: toward his read, or a slow scan of the field
function gpQbLook(e){
  if(G.aim&&!G.aim.run){const dx=G.aim.dx||0;return dx>0.42?'_lc':dx<-0.42?'_la':'';}
  const r=G.aiRecv&&isAI(e.team)?G.aiRecv:null;if(r){const dx=r.x-e.x;if(Math.abs(dx)>7)return dx>0?'_lc':'_la';}
  const t=(G.t+(e.seed||0))%3.2;return t<0.9?'':t<1.5?'_la':t<2.2?'':t<2.8?'_lc':'';
}
function buildStanceFrames(lib){
  for(const sheet of['player_skill','player_big']){
    const n=lib.ATLAS.sheets[sheet].anims.stance_2pt.frames;
    const srcs=[];for(let f=0;f<n;f++)srcs.push(lib.frameKeyCanvas(sheet,'stance_2pt',f));
    const make=(name,fn)=>{const c=document.createElement('canvas');c.width=512;c.height=64;const x=c.getContext('2d');x.imageSmoothingEnabled=false;
      srcs.forEach((s0,f)=>x.drawImage(fn(s0),f*64,0));lib.addAnim(sheet,name,c,n,lib.ATLAS.sheets[sheet].anims.stance_2pt.fps*0.7,true);};
    make('wr_up',s0=>rotUpper(s0,40,-5,-1));
    make('wr_lean',s0=>rotUpper(s0,40,12,1));
    make('wr_deep',s0=>rotUpper(s0,40,21,2));
    make('wr_knee',s0=>kneeFrame(s0,lib));
    // the bent bodies tilt the head too: put the drawn helmet back on, upright
    lib.improveHelmets(sheet,/^wr_(up|lean|deep|knee)$/,'side');
  }
}
/* which stances a receiver uses, and when he shifts between them before the snap */
function wrStanceSet(e){
  const inline=e.role==='TE'&&Math.abs(e.x-CX)<7.5,wide=Math.abs(e.x-CX)>CX-7;
  const pools=inline?['wr_knee','wr_lean','stance_2pt','wr_deep']:wide?['wr_lean','wr_deep','wr_knee','stance_2pt','wr_deep']:['wr_up','wr_knee','wr_lean','stance_2pt','wr_knee'];
  const h=hash(e.pl.id*13+7),a=pools[h%pools.length];let b=pools[(h>>>5)%pools.length];if(b===a)b=a==='stance_2pt'?'wr_knee':'stance_2pt';
  return{main:a,alt:b,shifts:(h>>>9)%4!==0,getSet:0.5+((h>>>3)%9)*0.12,period:1.8+((h>>>12)%7)*0.25};
}
function receiverStanceAnim(e,Lp,sheet){e._sheet=sheet;
  const S=wrStanceSet(e),t=G.time-(G.presnapAt||0);
  if(t<S.getSet)return Lp('idle',t+e.seed);
  let n=S.main;
  if(S.shifts){const k=(t-S.getSet)%S.period;if(Math.floor((t-S.getSet)/S.period)%2===1&&k<S.period*0.55)n=S.alt;}
  const h=hash(e.pl.id*7+3),P=2.4+((h>>>15)%5)*0.45,u=(t-S.getSet+((h>>>4)%10)*0.21)%P,cyc=Math.floor((t-S.getSet+((h>>>4)%10)*0.21)/P);
  if(t>S.getSet+0.3&&u>0.55&&u<0.55+0.6+((h>>>9)%3)*0.15){const side=e.team===0?'_lc':'_la',seq=['_lq',side,'_lq',(h%2)?side:'','_lq',''];const sfx=seq[(cyc+h)%seq.length];
    if(sfx&&packMeta(e._sheet||'player_skill',n+sfx))return Lp(n+sfx,t+e.seed);}
  return Lp(n,t+e.seed);
}
