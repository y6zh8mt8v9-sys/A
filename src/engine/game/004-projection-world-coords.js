/* ===================== projection (world coords) ===================== */
function proj(x,y,h=0){const z=D0+FW-x,k=SS/z;return{sx:W*G.anch+(y-G.camY)*k,sy:HOR+(HC-h)*k,k};}
const vh=h=>h<=2.5?h*0.85:2.125+(h-2.5)*0.45;
function toW(x,y){return G.flip?[FW-x,120-y]:[x,y];}
function toS(wx,wy){return G.flip?[FW-wx,120-wy]:[wx,wy];}

/* ===================== scenery ===================== */
const CROWD=['#1f3a68','#1f3a68','#f2b632','#f2b632','#2c5aa0','#ffffff','#7a1f2b','#e8e2cc','#5d6a78','#c9902a'];
function hash(i){let h=(i*2654435761)>>>0;h^=h>>>13;h=(h*1274126177)>>>0;return h>>>0;}
const CW=900,CHh=46,CRES=3;
const crowdTile=(()=>{
  const c=document.createElement('canvas');c.width=CW*CRES;c.height=CHh*CRES;const g=c.getContext('2d');g.scale(CRES,CRES);
  for(let row=0;row<6;row++){
    const y=5+row*7.2,sf=0.78+row*0.06,dim=0.62+row*0.075;
    for(let i=0;i*4.3<CW;i++){
      const h=hash(i*13+row*977);if(h%9===0)continue;
      const x=i*4.3+(row%2?2.1:0)+((h>>>3)%10)/10;
      g.fillStyle=shade(CROWD[h%CROWD.length],dim);g.fillRect(x-1.6*sf,y-0.2,3.2*sf,3.8*sf);
      g.fillStyle=SKINS[(h>>>7)%SKINS.length].m;g.fillRect(x-1.1*sf,y-2.5*sf,2.2*sf,2.2*sf);
    }
  }
  return c;
})();
const logoImg={};
for(const[k,svg]of Object.entries({
  gull:'<path d="M4 30 C14 18 25 17 32 29 C39 17 50 18 60 30 C51 26 42 27 35 36 L32 40 L29 36 C22 27 13 26 4 30 Z" fill="#f2b632" stroke="#0f2140" stroke-width="2.6" stroke-linejoin="round"/><path d="M26 36 C27 44 30 50 32 54 C34 50 37 44 38 36 C35 39 29 39 26 36 Z" fill="#ffffff" stroke="#0f2140" stroke-width="2.4" stroke-linejoin="round"/><path d="M32 54 L29 59 L35 59 Z" fill="#f28c1a" stroke="#0f2140" stroke-width="1.8" stroke-linejoin="round"/>'})){
  const im=new Image();im.src='data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'+svg+'<\/svg>');logoImg[k]=im;
}
function quad(x0,y0,x1,y1,col){
  const a=proj(x0,y0),b=proj(x0,y1),c=proj(x1,y1),d=proj(x1,y0);
  ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(a.sx,a.sy);ctx.lineTo(b.sx,b.sy);ctx.lineTo(c.sx,c.sy);ctx.lineTo(d.sx,d.sy);ctx.closePath();ctx.fill();
}
function wline(x0,y0,x1,y1,w,col,h0=0,h1=0){
  const a=proj(x0,y0,h0),b=proj(x1,y1,h1);ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(a.sx,a.sy);ctx.lineTo(b.sx,b.sy);ctx.stroke();
}
function endzoneText(s,y,yards,col,rev){
  // lay the word on the turf so it runs across the field, parallel to the goal line
  const c=proj(CX,y),ax=proj(CX-1,y),ay=proj(CX,y+1);
  const ux=(ax.sx-c.sx),uy=(ax.sy-c.sy),vx=(ay.sx-c.sx),vy=(ay.sy-c.sy),sg=rev?-1:1;
  const m=ctx.getTransform();
  ctx.setTransform(ux*sg,uy*sg,vx*sg,vy*sg,c.sx,c.sy);
  const F=GP&&GP.ezGlyphs;
  if(F&&F.g){ // the stadium's end zone font (Customize → End zone font), drawn from letter outlines
    const sc=F.k==='script',t=sc?s.toLowerCase().replace(/(^|\s)\S/g,c=>c.toUpperCase()):s;let w=0;for(const c of t)w+=(F.g[c]||F.g[' '])[0];
    const k=Math.min((sc?4.4:3.7)/100,(FW-7)/Math.max(1,w));ctx.scale(k,k);ctx.translate(-w/2,sc?34:50);ctx.lineJoin='round';
    for(const c of t){const g=F.g[c]||F.g[' '];if(g[1]){const p=ezGlyph(g[1]);
      if(F.k==='outline'){ctx.fillStyle='rgba(10,16,24,.3)';ctx.fill(p);ctx.lineWidth=0.17/k;ctx.strokeStyle=col;ctx.stroke(p);}
      else{ctx.lineWidth=0.35/k;ctx.strokeStyle='rgba(10,16,24,.55)';ctx.stroke(p);ctx.fillStyle=col;ctx.fill(p);}}
      ctx.translate(g[0],0);}
    ctx.setTransform(m);return;}
  ctx.font=`900 ${yards}px Archivo, Arial Black, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.lineWidth=0.35;ctx.strokeStyle='rgba(10,16,24,.55)';ctx.strokeText(s,0,0);ctx.fillStyle=col;ctx.fillText(s,0,0);
  ctx.setTransform(m);
}
const EZG=new Map();function ezGlyph(d){let p=EZG.get(d);if(!p){p=new Path2D(d);EZG.set(d,p);}return p;}
function endzoneLogo(y,x,size,rev){if(GP)return;
  // laid flat on the turf the same way as the midfield logo
  const im=logoImg.gull;if(!(im.complete&&im.naturalWidth))return;
  const p=proj(x,y),sz=size*p.k,sq=HC*p.k/SS*1.1,m=ctx.getTransform();
  ctx.translate(p.sx,p.sy);ctx.scale(rev?-1:1,sq);ctx.drawImage(im,-sz/2,-sz/2,sz,sz);ctx.setTransform(m);
}
function groundText(s,x,y,yards,col){
  const p=proj(x,y),fs=yards*p.k,sq=HC*p.k/SS*1.1;
  ctx.save();ctx.translate(p.sx,p.sy);ctx.scale(1,sq);
  ctx.font=`900 ${fs}px Archivo, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=col;ctx.fillText(s,0,0);ctx.restore();
}
function viewRange(){const a=G.anch;return[G.camY-(W*a)/KFAR-5,G.camY+(W*(1-a))/KFAR+5];}
function drawField(lines){
  ctx.fillStyle=ST.day||ST.indoor?shade(ST.turfOut,0.8):'#0c1f14';ctx.fillRect(0,95,W,H-95);
  quad(-1.2,-8,FW+1.2,128,ST.turfOut);
  const[left,right]=viewRange(),LA=ST.lineA,LC=a=>`rgba(255,255,255,${(a*LA).toFixed(2)})`;
  for(let k=Math.floor(left/5)*5;k<right;k+=5){
    if(k<-5||k>=125)continue;const ez=k<10||k>=110,tf=(k/5)%2?ST.turfA:ST.turfB;
    if(k<0||k>=120){quad(0,k,FW,k+5,ST.turfOut);continue;}
    if(ez&&ST.ezK==='checker'){for(let j=0;j<5;j++){const c0=j*FW/5;quad(c0,k,c0+FW/5,k+5,((j+(k/5))%2)?ST.ez2:ST.ez);}continue;}
    quad(0,k,FW,k+5,ez?(ST.ezK==='turf'?tf:(ST.ez||(GP?GP.ez:'#1c3766'))):tf);
  }
  // wear: bare dirt where the grass has gone, worst on the oldest fields
  if(ST.turf==='worn'||ST.turf==='dirt'){const dirt=ST.turf==='dirt';
    for(let k=dirt?8:20;k<(dirt?112:100);k+=dirt?4:6){if(k<left-6||k>right+6)continue;const h=hash(k*71);
      quad(CX-4-(h%3)-(dirt?3:0),k,CX+4+(h%2)+(dirt?3:0),k+4+(h%3),dirt?'rgba(132,100,60,.7)':'rgba(122,94,58,.45)');
      if(h%2||dirt)quad(8-(h%4),k+1,12+(h%3),k+3+(h%2),dirt?'rgba(132,100,60,.55)':'rgba(122,94,58,.3)');
      if(dirt&&h%3===0)quad(FW-12-(h%5),k,FW-6,k+3,'rgba(140,108,66,.5)');
      if(dirt&&h%4===1)quad(2,k+2,5,k+5,'rgba(150,120,70,.45)');}
    for(const k of[6,114])if(k>left-6&&k<right+6)quad(CX-5,k-3,CX+5,k+3,'rgba(122,94,58,.5)');}
  try{wxField();}catch(e){}
  const y0=Math.max(0,left),y1=Math.min(120,right);
  ctx.lineCap='butt';
  for(let k=Math.ceil(left/5)*5;k<=right;k+=5){if(k<0||k>120)continue;if(ST.tier===1&&ST.kind==='game'&&k%10&&k!==0&&k!==120)continue;wline(0,k,FW,k,(k===10||k===110)?2.4:1.2,LC(.92));}
  if(y1>y0){wline(0,y0,0,y1,1.8,LC(1));wline(FW,y0,FW,y1,2.6,LC(1));}
  ctx.lineCap='round';
  if(ST.hashes)for(let k=Math.ceil(left);k<=right;k++){
    if(k<=10||k>=110||k%5===0)continue;
    for(const hx of[0.7,23.6,29.7,FW-0.7])wline(hx-0.4,k,hx+0.4,k,0.9,LC(.85));
  }
  for(const k of[13,107])if(k>left&&k<right)wline(CX-0.5,k,CX+0.5,k,1.2,LC(.9));
  if(ST.nums)for(let k=20;k<=100;k+=10){
    if(k<left-3||k>right+3)continue;const n=String(k-10<=50?k-10:110-k);
    groundText(n,9,k,1.9,LC(.8));groundText(n,FW-9,k,1.9,LC(.8));
  }
  const im=logoImg.gull,HT=GP?GP.teams[GP.home||0]:null;
  if(ST.logo==='logo'&&im.complete&&im.naturalWidth&&left<66&&right>54){
    const p=proj(CX,60),sz=(ST.tier>=16?9:ST.tier>=10?8:7)*p.k,sq=HC*p.k/SS*1.1;
    ctx.save();ctx.translate(p.sx,p.sy);ctx.scale(1,sq);ctx.globalAlpha=0.9;ctx.drawImage(im,-sz/2,-sz/2,sz,sz);ctx.restore();
  }else if(ST.logo==='initial'&&left<66&&right>54){const ch=HT?(HT.abbr||HT.name||'H')[0]:'G';groundText(ch,CX,60,7,shade(ST.c2||'#f2b632',0.95));}
  {const a=proj(FW+1.2,G.camY).sy,x0=Math.max(0,proj(FW+1.2,-8).sx),x1=Math.min(W,proj(FW+1.2,128).sx);if(x1>x0){ctx.fillStyle=TRK(0);ctx.fillRect(x0,Math.round(a),x1-x0,H);if(ST.track&&!ST.indoor){ctx.fillStyle=TRK(1);ctx.fillRect(x0,Math.round(a)+5,x1-x0,1);ctx.fillRect(x0,Math.round(a)+10,x1-x0,1);}}}
  // both end zones belong to the home team
  {const word=!HT||ST.ezTxtK==='none'?'':(GP.practice?HT.city:ST.ezTxtK==='name'?HT.city:HT.name).toUpperCase(),col=GP?(ST.ezK==='turf'||ST.ezK==='checker'?'#ffffff':GP.ezText):'#f2b632';
    if(!GP){if(left<14)endzoneText('GULLS',5,5.2,col,false);if(right>106)endzoneText('GULLS',115,5.2,col,true);}
    else if(word){if(left<14)endzoneText(word,5,5.2,col,false);if(right>106)endzoneText(word,115,5.2,col,true);}}
  // pools of stadium light on the turf, darker edges
  if(!ST.day&&!ST.indoor&&ST.lights){
    ctx.globalCompositeOperation='lighter';const pa=0.10*(ST.lights==='led'?1.3:ST.lights==='pole'?0.6:1);
    for(const ty of ST.towers){const x=parX(ty,0.97);if(x<-200||x>W+200)continue;
      const g=ctx.createRadialGradient(x,210,8,x,210,230);g.addColorStop(0,`rgba(255,246,210,${pa.toFixed(3)})`);g.addColorStop(1,'rgba(255,246,210,0)');ctx.fillStyle=g;ctx.fillRect(x-240,95,480,H-95);}
    ctx.globalCompositeOperation='source-over';}
  const vg=ctx.createLinearGradient(0,95,0,H),va=ST.day||ST.indoor?0.4:1;vg.addColorStop(0,`rgba(5,12,8,${.18*va})`);vg.addColorStop(0.35,'rgba(5,12,8,0)');vg.addColorStop(0.85,'rgba(5,12,8,0)');vg.addColorStop(1,`rgba(5,12,8,${.28*va})`);
  ctx.fillStyle=vg;ctx.fillRect(0,95,W,H-95);
  // end fences closing off the venue behind each end zone
  for(const fy of[-8,128]){if(fy<left-2||fy>right+2)continue;const F=ST.indoor?'wall':ST.fence;
    if(F==='rope'){for(let i=0;i<=8;i++){const x=-3.5+(FW+7)*i/8;wline(x,fy,x,fy,1.2,'#7d6440',0,1.1);}wline(-3.5,fy,FW+3.5,fy,0.6,'#d9d0b0',1,1);continue;}
    if(F==='wall'||F==='screen'){const a=proj(-3.5,fy,0),b=proj(FW+3.5,fy,0),c=proj(FW+3.5,fy,F==='wall'?1.4:1.8),d=proj(-3.5,fy,F==='wall'?1.4:1.8);
      ctx.fillStyle=ST.wall;ctx.beginPath();ctx.moveTo(a.sx,a.sy);ctx.lineTo(b.sx,b.sy);ctx.lineTo(c.sx,c.sy);ctx.lineTo(d.sx,d.sy);ctx.closePath();ctx.fill();
      wline(-3.5,fy,FW+3.5,fy,0.8,ST.wall2,F==='wall'?1.4:1.8,F==='wall'?1.4:1.8);continue;}
    for(let i=0;i<=24;i++){const x=-3.5+(FW+7)*i/24;wline(x,fy,x,fy,1,'#5c6670',0,1.6);}
    wline(-3.5,fy,FW+3.5,fy,1,'#8d97a2',1.6,1.6);wline(-3.5,fy,FW+3.5,fy,0.8,'#5c6670',0.8,0.8);}
  for(const k of[0,10,110,120])for(const fx of[0,FW]){
    const a=proj(fx,k,0),b=proj(fx,k,0.5);if(a.sx<-10||a.sx>W+10)continue;
    const w=Math.max(2,a.k*0.3);ctx.fillStyle='#ff7a1a';ctx.fillRect(a.sx-w/2,b.sy,w,a.sy-b.sy);
  }
  if(!ST.day&&!ST.indoor&&ST.bright<1){ctx.fillStyle=`rgba(3,6,16,${((1-ST.bright)*0.95).toFixed(3)})`;ctx.fillRect(0,0,W,H);}
  if(lines){
    ctx.lineCap='butt';
    wline(0,lines.los,FW,lines.los,2.2,'rgba(70,170,255,.95)');
    if(lines.fd!=null&&lines.fd>0&&lines.fd<120)wline(0,lines.fd,FW,lines.fd,2.2,'rgba(255,222,60,.95)');
  }
}
function drawGoalposts(){
  const[left,right]=viewRange();
  for(const y of[0,120]){
    if(y<left-4||y>right+4)continue;const back=y===0?-1:1;
    const P=(x,yy,h)=>proj(x,yy,h);
    const seg=(a,b,w,c)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(a.sx,a.sy);ctx.lineTo(b.sx,b.sy);ctx.stroke();};
    ctx.lineCap='round';
    if(ST.posts==='h'){ // old two-legged H posts, faded white wood
      const cw=ST.tier<=1?[[3.4,'#5e5847'],[2.1,'#c9c1a8']]:[[3.2,'#6b6658'],[2,'#e6e1d2']];
      for(const[w,c]of cw){for(const s of[-1,1])seg(P(CX+s*3.08,y+back*0.4,0),P(CX+s*3.08,y+back*0.4,12),w*1.1,c);seg(P(CX-3.08,y+back*0.4,3.1),P(CX+3.08,y+back*0.4,3.1),w,c);}
      continue;}
    const base=P(CX,y+back*1.2,0),top=P(CX,y+back*1.2,3.0),neck=P(CX,y,3.33);
    if(ST.padded){const a=P(CX-0.5,y+back*1.2,0),b=P(CX-0.5,y+back*1.2,2.2),c2=P(CX+0.5,y+back*1.2,0);const pw=Math.max(3,Math.abs(c2.sx-a.sx)+2);ctx.fillStyle=ST.c1;ctx.fillRect(base.sx-pw/2,b.sy,pw,base.sy-b.sy);ctx.fillStyle=ST.c2;ctx.fillRect(base.sx-pw/2,b.sy,pw,1);}
    for(const[w,c]of[[3.2,'#6b5a10'],[2,'#f5d33a']]){
      seg(base,top,w*1.3,c);seg(top,neck,w*1.2,c);
      seg(P(CX-3.08,y,3.33),P(CX+3.08,y,3.33),w,c);
      seg(P(CX-3.08,y,3.33),P(CX-3.08,y,13.5),w,c);seg(P(CX+3.08,y,3.33),P(CX+3.08,y,13.5),w,c);
    }
    const f1=P(CX-3.08,y,13.5),f2=P(CX+3.08,y,13.5);
    {const ws=gpWindScreen(),len=Math.max(1.5,Math.min(7,Math.abs(ws)*0.3)),dir=ws>=0?1:-1,fl=Math.sin((G.time||0)*(6+WX.w*0.4))*0.6;ctx.fillStyle='#ff7a1a';
      for(const f of[f1,f2]){ctx.fillRect(f.sx-0.5,f.sy-6,1,6);ctx.beginPath();ctx.moveTo(f.sx,f.sy-6);ctx.lineTo(f.sx+dir*len,f.sy-5.2+fl);ctx.lineTo(f.sx,f.sy-4);ctx.closePath();ctx.fill();}}
  }
}
function drawChains(los,fd,down){
  const X2=FW+2.4,pole=(y,box)=>{const a=proj(X2,y,0),b=proj(X2,y,2.4);
    ctx.fillStyle='#22303c';ctx.fillRect(a.sx-0.8,b.sy,1.6,a.sy-b.sy);
    const bw=box?10:7,bh=box?9:5;const gg=ctx.createLinearGradient(0,b.sy-bh,0,b.sy);gg.addColorStop(0,'#ffb067');gg.addColorStop(1,'#ff6a00');
    ctx.fillStyle=gg;ctx.beginPath();ctx.roundRect(a.sx-bw/2,b.sy-bh,bw,bh,2);ctx.fill();return b;};
  if(fd!=null&&fd>10&&fd<110){const s=fd-(fd>los?10:-10);wline(X2,s,X2,fd,0.8,'rgba(230,230,230,.85)',0.4,0.4);pole(s,false);pole(fd,false);}
  const b=pole(los,true);
  ctx.fillStyle='#1b2733';ctx.font='900 7px Archivo, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(Math.min(down,4)),b.sx,b.sy-4.3);
}
