/* ===================== Friday-night high school stadium (pixel art, rendered at 640x360) ===================== */
const BGC=document.createElement('canvas');BGC.width=W;BGC.height=H;const BGX=BGC.getContext('2d');
const NIGHT={sky0:'#060a1a',sky1:'#16224a',tree:'#08140f',tree2:'#0d1f17',bench:'#9aa6b4',benchD:'#5d6876',riser:'#2b333d',
  track:'#8c3b2f',trackL:'#b8574a',fence:'#5c6670',turfOut:'#1f4f24'};
const parX=(wy,f)=>W*G.anch+(wy-G.camY)*KFAR*f;
function pr(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
function drawSky(){
  ctx.clearRect(0,0,W,H);
  if(ST.indoor){drawIndoorBack();return;}
  scSky();scDraw();
}
// indoor facility: steel roof with light panels, team walls and banners
function drawIndoorBack(){
  pr(0,0,W,60,'#20242b');
  const sh=G.camY*KFAR;
  for(let x=-40;x<W+40;x+=40){const X=Math.round(x-(sh*0.6)%40);ctx.strokeStyle='#363c46';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(X,0);ctx.lineTo(X+20,30);ctx.lineTo(X+40,0);ctx.stroke();pr(X,30,40,1,'#363c46');}
  for(let r=0;r<3;r++)for(let x=-60;x<W+60;x+=60){const X=Math.round(x-(sh*(0.5+r*0.12))%60)+r*14,Y=4+r*9,w=26-r*4;pr(X,Y,w,3,'#f6f8ff');pr(X,Y+3,w,1,'#b7c0cf');
    ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(235,242,255,.05)';ctx.fillRect(X-6,Y-2,w+12,10);ctx.globalCompositeOperation='source-over';}
  pr(0,38,W,46,'#4a505a');pr(0,38,W,2,'#5b626d');
  // banners hanging on the back wall
  const T=GP?GP.teams[GP.home||0]:null,nm=T?(GP.practice?T.city:T.name).toUpperCase():'GULLS';
  for(let i=-1;i<4;i++){const bx=Math.round(parX(10+i*40,0.9));if(bx<-80||bx>W+80)continue;
    pr(bx-22,42,44,26,ST.wall);pr(bx-22,42,44,2,ST.wall2);pr(bx-22,66,44,2,ST.wall2);
    ctx.font='900 6px Nunito, sans-serif';ctx.fillStyle=ST.wall2;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(i%2?'FOOTBALL':nm.slice(0,10),bx,55);}
  // padded wall at the back of the turf
  pr(0,72,W,12,ST.wall);pr(0,72,W,1,ST.wall2);pr(0,83,W,1,'#14161a');
  ctx.font='900 7px Nunito, sans-serif';ctx.fillStyle=ST.wall2;ctx.textAlign='center';ctx.textBaseline='middle';
  for(let k=0;k<6;k++){const x=Math.round(parX(k*24,1));if(x>-60&&x<W+60)ctx.fillText(nm.slice(0,12),x,78);}
}
function lightTower(x,type,day){
  if(type==='pole'){pr(x-1,18,2,42,'#6b4a2a');pr(x,18,1,42,'#86603a');pr(x-8,20,16,2,'#5a3e22');
    for(let i=0;i<3;i++){pr(x-7+i*6,17,3,3,day?'#cfd2d6':'#fff2c2');}
    if(!day){ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(x,19,1,x,19,26);g.addColorStop(0,'rgba(255,232,170,.45)');g.addColorStop(1,'rgba(255,232,170,0)');ctx.fillStyle=g;ctx.fillRect(x-28,-8,56,56);ctx.globalCompositeOperation='source-over';}
    return;}
  const topY=type==='steel'?12:6,baseY=60;
  pr(x-1,topY+8,2,baseY-topY-8,'#3a424c');pr(x,topY+8,1,baseY-topY-8,'#59636e');
  if(type!=='steel')for(let i=0;i<4;i++)pr(x-2+((i%2)?3:0),topY+14+i*10,2,1,'#3a424c');
  const led=type==='led',cw=type==='steel'?12:led?22:18,rows=type==='steel'?2:3;
  pr(x-cw/2,topY-1,cw,rows*3+1,'#252b33');
  for(let r=0;r<rows;r++)for(let c=0;c<Math.floor(cw/3);c++)pr(x-cw/2+1+c*3,topY+r*3,2,2,day?'#bfc4ca':led?'#ffffff':'#fffbe0');
  if(day)return;
  const k=type==='steel'?0.7:led?1.25:1;
  ctx.globalCompositeOperation='lighter';
  const g=ctx.createRadialGradient(x,topY+4,1,x,topY+4,46*k);g.addColorStop(0,`rgba(255,248,${led?240:210},${0.55*Math.min(1,k)})`);g.addColorStop(0.3,`rgba(255,240,190,${0.16*k})`);g.addColorStop(1,'rgba(255,240,190,0)');
  ctx.fillStyle=g;ctx.fillRect(x-60,topY-56,120,120);
  ctx.fillStyle=`rgba(255,246,205,${0.035*k})`;ctx.beginPath();ctx.moveTo(x-8,topY+8);ctx.lineTo(x+8,topY+8);ctx.lineTo(x+70,150);ctx.lineTo(x-70,150);ctx.closePath();ctx.fill();
  ctx.globalCompositeOperation='source-over';
}
const ST=gpStadNorm((GP&&GP.stadium)||null);
// v2.15 crowd setting: fewer fans (or none) is much lighter to draw on slow phones
if(GDS.crowdV==='light')ST.fill=(ST.fill||0)*0.4;else if(GDS.crowdV==='off')ST.fill=0;
else if(GDS.gfx!=='fast'&&/Android/i.test(navigator.userAgent||'')&&((navigator.deviceMemory||8)<=4||(navigator.hardwareConcurrency||8)<=4))ST.fill=(ST.fill||0)*0.65;
function gpStadNorm(s){
  const D={tier:12,kind:'game',turf:'grass',stripes:true,lineA:0.92,nums:true,hashes:true,posts:'y',padded:false,stands:'alum',rows:7,xa:18,xb:102,upper:false,roof:false,endSeats:false,
    fill:0.86,crowdLine:false,trucks:false,lights:'tower',bright:1,towers:[-6,22,50,78,106,134],fence:'chain',board:'medium',pressBox:'box',track:true,scenery:'town',cheer:8,
    ezColor:true,ezText:true,logo:'logo',day:false,indoor:false,turfA:'#2f7d33',turfB:'#358a3a',turfOut:'#1f4f24',ezK:'team',ez:null,ez2:null,seat:'#9aa6b4',seat2:null,
    trackCol:['#8c3b2f','#b8574a'],ezTxtK:'mascot',wall:'#1f3a68',wall2:'#f2b632',c1:'#1f3a68',c2:'#f2b632',pl:0,tower:false,sleds:0,dummies:0,building:null,twin:false};
  if(!s)return D;
  const o=Object.assign({},D,s);
  if(!s.turfA){const b={worn:['#43773a','#477d3c'],turf:['#2a8e45','#2d9449']}[o.turf];if(b){o.turfA=b[0];o.turfB=b[1];}}
  if(o.towers==null)o.towers=[];if(o.ezK==='team'&&!o.ez&&GP)o.ez=GP.ez;
  return o;
}
/*<gdwx>*/
/* ===================== v2.10 weather and state scenery ===================== */
// a well-mixed 32-bit hash (Math.imul keeps every bit exact, so `% n` spreads evenly)
function hq(i){let h=Math.imul((i|0)^0x27d4eb2d,0x9E3779B1);h^=h>>>15;h=Math.imul(h,0x85EBCA77);h^=h>>>13;h=Math.imul(h,0xC2B2AE3D);h^=h>>>16;return h>>>0;}
// tonight's weather comes from the career (the forecast on the dashboard); practice is always a clear afternoon
const WX=(()=>{
  let w=GP&&!GP.practice?(GP.weather||null):null;
  if(!w)w={k:'clear',i:0,t:68,w:4,d:90,alt:0,m:1.5};
  w=Object.assign({k:'clear',i:0,t:68,w:4,d:90,alt:0,m:1.5},w);
  if(w.m==null)w.m=1.5;
  const wet=w.k==='rain'?0.35+0.65*w.i:w.k==='storm'?1:0,sn=w.k==='snow'?0.5+0.5*w.i:0,fog=w.k==='fog'?w.i:0,cold=w.t<=32?Math.min(1,(33-w.t)/15):0;
  const rad=(w.d||0)*Math.PI/180;
  return Object.assign(w,{wet,sn,fog,cold,
    over:w.k==='cloudy'?0.6:w.k==='clear'?0:1,
    // the wind in field terms: along the field (toward the y=120 end zone) and across it
    wAlong:Math.cos(rad)*w.w,wAcross:Math.sin(rad)*w.w,
    spd:1-wet*0.035-sn*0.06,acc:1-wet*0.1-sn*0.14,
    passErr:1+wet*0.32+sn*0.24+cold*0.08,drop:wet*0.08+sn*0.06+cold*0.03,
    fum:1+wet*1.0+sn*0.7+cold*0.25,wrapFum:wet*0.014+sn*0.01+cold*0.003,
    kick:(1-Math.max(0,55-w.t)*0.0025)*(1+(w.alt||0)*0.05)*(1-sn*0.06)*(1-wet*0.03),
    heat:w.t>=84?1+(w.t-84)*0.025:1,
    snowy:w.k==='snow'||w.t<=28});
})();
// wind in the play's frame (mph): teams switch ends every quarter, so the wind flips with them
function gpWindWorldSign(){return(G.q||1)%2===0?-1:1;}
function gpWind(){const s=gpWindWorldSign()*(G.flip?-1:1);return[WX.wAcross*s,WX.wAlong*s];}
function gpWindScreen(){return WX.wAlong*gpWindWorldSign();} // + blows toward screen right
if(WX.wet||WX.sn){ST.fill*=1-WX.wet*0.22-WX.sn*0.2;} // some fans stay home in the rain and snow

/* ---- the state's scenery: what you see past the stands depends on where the school is ---- */
const SCN={
  CF:{far:'hills',farC:['#93a684','#7f9670'],tree:'oak',treeC:['#3f6a32','#4b7838','#365c2c'],ground:'#6a8a44',land:['watertower','windmill'],city:'tower'},
  WK:{far:'plains',farC:['#97ab8c'],tree:'oak',decid:1,treeC:['#3e6c30','#4a7a36','#35602b'],ground:'#5f8a3c',land:['elevator','barn'],city:'brick',turb:1},
  TA:{far:'mesa',farC:['#c98d5c','#b3734b'],farB:'#9483a3',tree:'scrub',treeC:['#5d6f40','#6e7c48','#4f6236'],ground:'#b39a69',land:['mission','tank'],city:'adobe'},
  LG:{far:'flat',farC:['#9fb28c'],tree:'mesquite',treeC:['#52773a','#5f843f','#4a6c34'],ground:'#7d9148',land:['pumpjack','windmill'],city:'tower',flare:1},
  CO:{far:'ocean',sea:['#3f87b8','#2d6c99'],tree:'palm',treeC:['#3c7a3a','#4b8a40','#2f6a32'],ground:'#6a984a',land:['watertower','lighthouse'],city:'glass'},
  MG:{far:'pinehills',farC:['#5f8259','#4e7049'],tree:'pine',treeC:['#2f5a2e','#3a6834','#2a502a'],ground:'#727f3f',clay:'#9a5a38',land:['church','watertower'],city:'brick'},
  AC:{far:'bayou',sea:['#4d5e45','#3e4f3a'],tree:'cypress',treeC:['#4c6a3a','#587a44','#43603a'],moss:'#a3ab92',ground:'#4f7a3a',land:['sugarmill','church'],city:'brick',flare:1},
  CU:{far:'ridges',farC:['#8aa0bf','#7189ab','#5a7395'],tree:'oak',decid:2,treeC:['#3a6a30','#467734','#30602a'],ground:'#4f7f3a',land:['church','barn'],city:'brick'},
  SU:{far:'peaks',farC:['#8696ae','#6f8099'],cap:0.45,tree:'fir',treeC:['#2f5a3a','#3a6a44','#28503a'],ground:'#6b8a4a',land:['headframe','barn'],city:'tower'},
  GR:{far:'buttes',farC:['#ad9c7a','#9c8a67'],farB:'#a7b4c8',tree:'sparse',treeC:['#5a7a3a','#6a8a44','#4e6e34'],ground:'#a9a06a',land:['windmill','bins','barn'],city:'low',turb:1},
  CS:{far:'volcano',farC:['#8d9db3'],farB:'#4d6a5b',tree:'fir',treeC:['#23503a','#2d5e44','#1e4634'],ground:'#3f7a3c',land:['lumbermill','watertower'],city:'glass'},
  AU:{far:'peaks',farC:['#9aa8bd','#7f8fa6'],cap:0.75,tree:'spruce',treeC:['#25463a','#2e5244','#1f3e33'],ground:'#5a7246',land:['cannery','radio'],city:'low',aurora:1},
  KM:{far:'shield',farC:['#5b7f61','#4c6e53'],sea:['#2f8fb5','#23739a'],tree:'palm',treeC:['#357a3a','#438a40','#2c6a32'],ground:'#4f8e40',land:['sugarstack','church'],city:'hotel'}
};
const SC_T=SCN[ST.st]||SCN.CF;
const _mxC=new Map();
function mixC(a,b,t){const k=a+b+t;let v=_mxC.get(k);if(v)return v;const p=c=>{c=c.replace('#','');if(c.length===3)c=c.split('').map(x=>x+x).join('');return[0,2,4].map(i=>parseInt(c.slice(i,i+2),16));};
  const A=p(a),B=p(b);v='#'+A.map((x,i)=>Math.round(x+(B[i]-x)*t).toString(16).padStart(2,'0')).join('');_mxC.set(k,v);return v;}
// day colors are darkened for night and greyed under clouds; snow whitens what faces the sky
function scC(c,far){let o=c;if(WX.over>=1)o=mixC(o,'#8d959e',ST.day?0.28:0.15);if(!ST.day)o=far?mixC(o,'#1a2440',0.62):mixC(o,'#070b14',0.72);return o;}
function scGround(){if(WX.snowy)return ST.day?'#e6ebf0':'#56627a';return scC(SC_T.ground);}
const SC_TW=2048;
function scNoise(x,N,seed){const u=x/SC_TW*N,i=Math.floor(u),f=u-i,h=k=>(hq(((k%N)+N)%N*131+seed*977)%10000)/10000,s=f*f*(3-2*f);return h(i)+(h(i+1)-h(i))*s;}
function scFrac(x,N,seed){return scNoise(x,N,seed)*0.62+scNoise(x,N*3,seed+5)*0.28+scNoise(x,N*9,seed+9)*0.1;}
// autumn: deciduous trees turn through October and are bare by late November
function scLeaf(base,h){const m=WX.m||0,d=SC_T.decid||0;if(!d||m<1.1)return base;
  const fall=['#c9822f','#b5462c','#d9a535','#9a5a2a','#c46a2a'],bare='#6d5a48';
  if(m>3.1)return h%5===0?base:bare;
  const t=Math.min(1,(m-1.1)/1.4)*(d===2?1:0.75);return(h%100)/100<t?fall[h%fall.length]:base;}
function scBuild(){
  const L=[];const mk=(f,draw,anim)=>{const c=document.createElement('canvas');c.width=SC_TW;c.height=60;const g=c.getContext('2d');
    const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));};
    const wrap=(x,fn)=>{fn(x);if(x<60)fn(x+SC_TW);if(x>SC_TW-60)fn(x-SC_TW);};
    draw(R,g,wrap);L.push({f,c,anim:anim||null});};
  const T=SC_T,day=ST.day,snow=WX.snowy;
  const cap=c=>snow?(day?'#f1f4f7':'#6b7586'):c;
  // ---- far horizon ----
  if(T.far==='peaks'||T.far==='buttes'||T.far==='mesa'||T.far==='volcano'){
    // a distant blue range first
    const bc=scC(T.farB||mixC(T.farC[0],'#c9d6e6',0.35),1);
    mk(0.06,(R)=>{for(let x=0;x<SC_TW;x+=2){const n=scFrac(x,9,3),h=Math.round(44-n*(T.far==='peaks'?34:T.far==='volcano'?16:18));R(x,h,2,56-h,bc);
      if((T.far==='peaks'||T.far==='buttes')&&h<26)R(x,h,2,Math.min(4,26-h)+1,day?'#eef3f8':'#5a6577');}});
  }
  if(T.far==='peaks'){
    mk(0.12,(R)=>{const c0=scC(T.farC[0],1),c1=scC(T.farC[1],1),snowC=day?'#f4f7fa':'#6d7889',lim=Math.round(20+T.cap*16);
      let ph=null;for(let x=0;x<SC_TW;x+=2){let n=scFrac(x,14,11);n=Math.pow(n,1.15);const h=Math.round(52-n*46);const nx=Math.round(52-Math.pow(scFrac(x+2,14,11),1.15)*46);R(x,h,2,56-h,nx<=h?c0:c1);ph=h;
        if(h<lim)R(x,h,2,Math.max(1,Math.round((lim-h)*0.7)),snowC);}});
  }else if(T.far==='mesa'){
    mk(0.12,(R)=>{const c0=scC(T.farC[0],1),c1=scC(T.farC[1],1),band=scC(mixC(T.farC[0],'#e2b48a',0.35),1);
      for(let x=0;x<SC_TW;x+=2){const n=scNoise(x,10,21);let top;if(n>0.56)top=24+Math.round(scNoise(x,60,22)*2);else if(n>0.5)top=Math.round(24+(0.56-n)/0.06*22);else top=Math.round(48-n*6);
        R(x,top,2,56-top,c0);if(top<44){for(let y=top+4;y<52;y+=5)R(x,y,2,1,band);R(x,top,2,1,c1);}}});
  }else if(T.far==='volcano'){
    mk(0.1,(R)=>{const cc=scC(T.farC[0],1),sn=day?'#f6f8fb':'#76819a';for(const cx of[520,1560]){for(let x=cx-200;x<cx+200;x++){const d=Math.abs(x-cx),h=Math.round(8+d*0.26+(d<12?2:0)+scNoise(x,200,31)*2);if(h>50)continue;R(x,h,1,56-h,cc);if(h<22)R(x,h,1,Math.round((22-h)*0.9)+1,sn);}}});
    mk(0.18,(R)=>{const c=scC(T.farB,1);for(let x=0;x<SC_TW;x+=2){const h=Math.round(46-scFrac(x,16,41)*10);R(x,h,2,56-h,c);for(let k=0;k<2;k++)R(x+k,h-1-((hq(x*7+k)%3)),1,2,c);}});
  }else if(T.far==='shield'){
    mk(0.1,(R)=>{const c0=scC(T.farC[0],1),c1=scC(T.farC[1],1);for(const cx of[700,1700]){for(let x=cx-320;x<cx+320;x++){const d=Math.abs(x-cx),h=Math.round(20+d*d*0.00022+d*0.02+scNoise(x,300,51)*2);if(h>48)continue;R(x,h,1,56-h,x<cx?c0:c1);if(scNoise(x,90,52)>0.7)R(x,h+3,1,56-h-3,mixC(x<cx?c0:c1,'#000000',0.12));}}});
  }else if(T.far==='buttes'){
    mk(0.13,(R)=>{const c0=scC(T.farC[0],1),c1=scC(T.farC[1],1);for(let x=0;x<SC_TW;x+=2){const n=scNoise(x,12,61),top=n>0.62?34:n>0.58?Math.round(34+(0.62-n)/0.04*12):Math.round(48-n*4);R(x,top,2,56-top,c0);if(top<40)R(x,top,2,1,c1);}});
  }else if(T.far==='hills'||T.far==='pinehills'){
    mk(0.12,(R)=>{const c0=scC(T.farC[0],1),c1=scC(T.farC[1],1);for(let x=0;x<SC_TW;x+=2){const h=Math.round(42-scFrac(x,12,71)*12);R(x,h,2,56-h,c0);if(T.far==='pinehills')R(x,h-1-(hq(x*13)%2),2,2,c0);}
      for(let x=0;x<SC_TW;x+=2){const h=Math.round(47-scFrac(x,18,72)*8);R(x,h,2,56-h,c1);}});
  }else if(T.far==='ridges'){
    mk(0.08,(R)=>{T.farC.forEach((c,k)=>{const cc=scC(c,1);for(let x=0;x<SC_TW;x+=2){const h=Math.round(34+k*5-scFrac(x,8+k*3,81+k)*12);R(x,h,2,56-h,cc);}});});
  }else if(T.far==='plains'||T.far==='flat'){
    mk(0.12,(R)=>{const c=scC(T.farC[0],1);for(let x=0;x<SC_TW;x+=2){const h=Math.round(48-scNoise(x,20,91)*2);R(x,h,2,56-h,c);}});
  }
  // the sea or the bayou sits in front of the far land
  if(T.far==='ocean'||T.far==='shield'||T.far==='bayou'){
    const glints=[];
    mk(0.16,(R)=>{const s0=scC(T.sea[0],1),s1=scC(T.sea[1],1),top=T.far==='bayou'?49:44;R(0,top,SC_TW,56-top,s0);
      for(let y=top+2;y<56;y+=3)for(let x=0;x<SC_TW;x+=24)R(x+(hq(y*31+x)%18),y,6,1,s1);
      R(0,top,SC_TW,1,mixC(s0,day?'#ffffff':'#8fa6c4',0.35));
      for(let i=0;i<40;i++)glints.push([hq(i*71+3)%SC_TW,top+2+(hq(i*29+5)%Math.max(2,54-top))]);},
      (x0,f,t)=>{if(!ST.day&&WX.over>=1)return;ctx.fillStyle=ST.day?'rgba(255,255,255,.55)':'rgba(220,232,255,.35)';
        for(let i=0;i<glints.length;i++){const[g,y]=glints[i];if(Math.sin(t*2+i*1.7)<0.6)continue;const x=((g-x0)%SC_TW+SC_TW)%SC_TW;if(x<W)ctx.fillRect(x,y,3,1);}});
  }
  // ---- city skyline by state style (only at the biggest stadiums) ----
  if(ST.scenery==='city'){
    mk(0.3,(R)=>{const st=T.city;for(let x=0;x<SC_TW;x+=7){const h0=hq(x*29+11);let bh,w=6,col;
      if(st==='adobe'||st==='low'){bh=6+(h0%12);w=9;}else if(st==='hotel'){bh=14+(h0%22);w=8;}else if(st==='glass'){bh=12+(h0%30);}else if(st==='brick'){bh=10+(h0%20);}else bh=10+(h0%26)+(ST.tier>=18?8:0);
      col=st==='adobe'?'#c9a07a':st==='brick'?'#9a6a55':st==='glass'?'#7f9db8':st==='hotel'?'#d8dccf':'#8b96a6';
      const c=scC(col,1),lit=day?mixC(col,'#ffffff',0.35):'#ffd77a';R(x,50-bh,w-1,bh+2,c);if(day)R(x,50-bh,1,bh,mixC(col,'#ffffff',0.25));
      if(st==='glass'&&day)R(x+1,50-bh+1,w-3,bh-2,mixC(col,'#bfe0f5',0.4));
      for(let yy=50-bh+2;yy<48;yy+=3)for(let xx=1;xx<w-2;xx+=2)if(hq(x*7+yy*13+xx)%3===0)R(x+xx,yy,1,1,lit);
      if(h0%11===0&&st!=='adobe'&&st!=='low'){R(x+2,50-bh-6,1,6,c);}}});
  }
  // ---- tree line, landmarks and town ----
  const tree=(R,x,base,ht,k,h)=>{const c=scC(scLeaf(T.treeC[h%T.treeC.length],h)),dk=scC(mixC(T.treeC[0],'#000000',0.25)),tr=scC('#4a3a2a');
    if(k==='oak'||k==='sparse'){const w=5+(h%5);R(x,base-ht,w,ht,c);R(x+1,base-ht-2,w-2,2,c);R(x+w-2,base-ht+2,2,ht-2,dk);if(snow)R(x+1,base-ht-2,w-2,1,cap(c));R(x+Math.floor(w/2),base-2,1,3,tr);}
    else if(k==='pine'){R(x+2,base-ht,1,ht,tr);R(x,base-ht-3,5,4,c);R(x+1,base-ht-5,3,2,c);R(x+3,base-ht-2,2,2,dk);if(snow)R(x+1,base-ht-5,3,1,cap(c));}
    else if(k==='fir'||k==='spruce'){const wd=k==='spruce'?0.3:0.46;for(let r=0;r<ht;r++){const ww=Math.max(1,Math.round(1+r*wd));R(x-ww/2,base-ht+r,ww,1,r%4===3?dk:c);}if(snow)for(let r=1;r<ht;r+=4){const ww=Math.max(1,Math.round(1+r*wd));R(x-ww/2,base-ht+r,ww,1,cap(c));}}
    else if(k==='palm'){const lean=(h%3)-1;for(let r=0;r<ht;r++)R(x+Math.round(lean*r/ht*2),base-r,1,1,scC('#7a6248'));const tx=x+lean*2,ty=base-ht;
      for(const[dx,dy]of[[-4,1],[-3,0],[-2,-1],[2,-1],[3,0],[4,1],[-1,-2],[1,-2]])R(tx+dx,ty+dy,2,1,c);R(tx-5,ty+2,1,1,c);R(tx+5,ty+2,1,1,c);}
    else if(k==='cypress'){const w=8+(h%5);R(x+w/2-1,base-ht,2,ht,tr);R(x,base-ht-2,w,3,c);R(x+1,base-ht-4,w-2,2,c);
      for(let i=0;i<w;i+=2)if(hq(h%9973+i)%2)R(x+i,base-ht+1,1,2+(hq(h%8191*3+i)%3),scC(T.moss));}
    else if(k==='scrub'){R(x,base-3-(h%3),3+(h%3),3+(h%3),c);if(h%7===0){R(x+5,base-9,1,9,scC('#6f7a4a'));R(x+4,base-9,3,1,scC('#6f7a4a'));}}
    else if(k==='mesquite'){const w=7+(h%4);R(x+w/2,base-ht+2,1,ht-2,tr);R(x,base-ht,w,2,c);R(x+1,base-ht-1,w-2,1,c);}};
  const LM=(R,k,x)=>{const d=day,L=c=>scC(c),win=d?'#9fb8cc':'#ffd77a';
    if(k==='watertower'){R(x,22,1,30,L('#6c757e'));R(x+10,22,1,30,L('#6c757e'));R(x+5,24,1,28,L('#6c757e'));R(x-2,14,15,9,L('#c9d2da'));R(x-1,12,13,2,L('#aab4be'));R(x+4,10,3,2,L('#aab4be'));R(x-2,17,15,1,L(ST.c1||'#1f3a68'));if(!d)R(x+5,9,1,1,'#ff3b30');}
    else if(k==='windmill'){R(x+3,26,1,26,L('#5a5f66'));R(x,26,7,1,L('#5a5f66'));for(const[a,b]of[[-5,-1],[-3,-3],[1,-5],[4,-3],[6,0],[3,2],[-1,3],[-4,2]])R(x+3+a,24+b,2,1,L('#7c838c'));R(x+8,22,4,2,L('#7c838c'));}
    else if(k==='elevator'){for(let i=0;i<4;i++){R(x+i*6,18,5,34,L('#c9c4b8'));R(x+i*6,18,5,1,L('#9d988c'));}R(x+24,8,8,44,L('#d7d2c6'));R(x+25,10,6,3,L('#8b867a'));R(x-8,34,8,18,L('#b9b2a2'));}
    else if(k==='barn'){R(x,38,18,14,L('#9a3a2e'));for(let i=0;i<9;i++)R(x+i,38-Math.min(i,8-i+1)*0.8,18-2*i,1,L('#7a2a22'));R(x+7,44,4,8,L('#e9e2d4'));R(x+20,30,5,22,L('#b8c0c8'));R(x+20,28,5,2,L('#8f979f'));}
    else if(k==='mission'){R(x,34,26,18,L('#d9b48a'));R(x+18,22,8,30,L('#d9b48a'));R(x+19,20,6,2,L('#c79e72'));R(x+20,25,4,4,L('#5a4636'));R(x+21,18,2,2,L('#7a6248'));R(x+5,42,6,10,L('#6a4e3a'));R(x,33,26,1,L('#b98f63'));}
    else if(k==='tank'){R(x,36,14,16,L('#a9b0b6'));R(x,35,14,1,L('#8a9198'));R(x+3,40,8,1,L('#8a9198'));}
    else if(k==='pumpjack'){R(x,48,18,4,L('#3d4148'));R(x+8,36,2,12,L('#4a4f57'));R(x+12,40,2,8,L('#4a4f57'));}
    else if(k==='lighthouse'){R(x+2,22,6,30,L('#f1ede4'));for(let y=26;y<50;y+=8)R(x+2,y,6,3,L('#c0392b'));R(x+1,18,8,4,L('#2b2f36'));R(x+3,19,4,2,d?'#d7e7f2':'#fff2b8');R(x+2,16,6,2,L('#2b2f36'));}
    else if(k==='church'){R(x,36,18,16,L('#ecebe6'));R(x+6,20,6,16,L('#ecebe6'));for(let i=0;i<5;i++)R(x+9-i/2-0.5,15+i,i+1,1,L('#ecebe6'));R(x+8,12,2,4,L('#ecebe6'));R(x+8,26,2,4,L('#5a6670'));R(x+3,42,3,5,win);R(x+12,42,3,5,win);}
    else if(k==='sugarmill'||k==='sugarstack'){R(x,34,22,18,L('#8a7a6a'));R(x+4,10,4,26,L('#7a5a4a'));R(x+14,16,3,20,L('#7a5a4a'));for(let i=0;i<4;i++)R(x+3+i*5,40,3,3,win);}
    else if(k==='headframe'){R(x,20,2,32,L('#4a4f57'));R(x+12,20,2,32,L('#4a4f57'));R(x,20,14,2,L('#4a4f57'));for(let y=24;y<50;y+=6){R(x+1,y,12,1,L('#5b616a'));}R(x+4,16,6,4,L('#3a3f46'));R(x+16,36,14,16,L('#8a6a52'));}
    else if(k==='bins'){for(let i=0;i<3;i++){R(x+i*9,36,8,16,L('#b9c1c8'));for(let r=0;r<4;r++)R(x+i*9+1+r,32+r,6-2*r,1,L('#a5adb4'));}}
    else if(k==='lumbermill'){R(x,36,30,16,L('#7a6a5a'));R(x+22,14,4,22,L('#5b616a'));R(x-12,46,12,6,L('#8a6a48'));R(x-10,44,10,2,L('#9a7a56'));}
    else if(k==='cannery'){R(x,38,30,14,L('#6f7f8f'));R(x,37,30,1,L('#5a6a7a'));R(x+4,42,4,4,win);R(x+20,42,4,4,win);R(x+32,46,10,6,L('#c0392b'));R(x+36,40,1,6,L('#6a6a6a'));}
    else if(k==='radio'){for(let y=10;y<52;y++){const ww=Math.max(1,Math.round((y-10)/14));R(x-ww/2,y,ww,1,L('#c0392b'));}R(x,8,1,2,d?'#c0392b':'#ff3b30');}
  };
  const anims=[];
  mk(0.45,(R,g,wrap)=>{
    // far tree line
    for(let x=0;x<SC_TW;x+=T.tree==='sparse'?14:T.tree==='scrub'?6:3){const h=hq(x*13+7);if(T.tree==='sparse'&&h%3)continue;const ht=(T.tree==='pine'?12:T.tree==='fir'||T.tree==='spruce'?9:6)+(h%7);wrap(x,X=>tree(R,X,53,ht,T.tree,h));}
    // landmarks: rural fields show the state's farm and ranch buildings, towns get a water tower or church, cities a few
    const n=ST.scenery==='rural'?5:ST.scenery==='town'?3:2;
    for(let i=0;i<n;i++){const k=T.land[i%T.land.length],x=Math.round((i+0.35)*SC_TW/n+(hq(i*97+5)%120));wrap(x,X=>LM(R,k,X));
      if(k==='pumpjack')anims.push(['pump',x]);}
    if(ST.scenery!=='rural'){const hc=T.city==='adobe'?['#d9b48a','#cfa57a','#e2c39c']:T.city==='hotel'||T.city==='glass'?['#e8e2d0','#d6dde2','#f0e6d2']:['#d8c7a4','#c9d3dc','#e6dccb'];
      const roof=T.city==='adobe'?'#b98f63':T.city==='glass'||T.city==='hotel'?'#9a6a4a':'#7a3b2e';
      for(let x=0;x<SC_TW;x+=26){const h=hq(x*41+3);if(h%3)continue;const X=x+(h%9);wrap(X,Q=>{R(Q,45,14,8,scC(hc[h%3]));R(Q-1,42,16,3,scC(roof));R(Q+3,48,3,3,day?scC('#6a8aa5'):'#ffcf6e');});}}
    if(T.turb)for(let x=120;x<SC_TW;x+=260)anims.push(['turb',x+(hq(x)%60)]);
    if(T.flare&&!day)for(let x=300;x<SC_TW;x+=700)anims.push(['flare',x]);
  },(x0,f,t)=>{for(const[k,ax]of anims){const x=((ax-x0)%SC_TW+SC_TW)%SC_TW;if(x>W+30&&x<SC_TW-30)continue;const X=x>W+30?x-SC_TW:x;
      if(k==='turb'){const c=ST.day?'#e9edf1':'#48505c';ctx.fillStyle=c;ctx.fillRect(X,14,1,38);const a=t*(1.2+WX.w/12);ctx.strokeStyle=c;ctx.lineWidth=1;ctx.beginPath();for(let b=0;b<3;b++){const an=a+b*2.094;ctx.moveTo(X+0.5,14);ctx.lineTo(X+0.5+Math.cos(an)*10,14+Math.sin(an)*10);}ctx.stroke();if(!ST.day&&Math.sin(t*3)>0){ctx.fillStyle='#ff3b30';ctx.fillRect(X,12,1,1);}}
      else if(k==='pump'){const a=Math.sin(t*1.6)*3,c=ST.day?'#3d4148':'#151820';ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X+1,36+a);ctx.lineTo(X+19,36-a);ctx.stroke();ctx.fillStyle=c;ctx.fillRect(X,35+a,3,7);ctx.fillRect(X+1,42+a,1,8-a);}
      else if(k==='flare'){ctx.fillStyle='#3a3f46';ctx.fillRect(X,18,2,34);const fl=2+Math.abs(Math.sin(t*9)+Math.sin(t*5.3))*1.6;ctx.fillStyle='#ffb43a';ctx.fillRect(X-1,18-fl,4,fl);ctx.fillStyle='#fff2b8';ctx.fillRect(X,18-fl*0.6,2,fl*0.6);
        ctx.globalCompositeOperation='lighter';const rg=ctx.createRadialGradient(X+1,16,1,X+1,16,14);rg.addColorStop(0,'rgba(255,160,50,.3)');rg.addColorStop(1,'rgba(255,160,50,0)');ctx.fillStyle=rg;ctx.fillRect(X-13,2,28,28);ctx.globalCompositeOperation='source-over';}}});
  mk(0.6,(R,g,wrap)=>{for(let x=0;x<SC_TW;x+=T.tree==='sparse'?22:T.tree==='scrub'?9:T.tree==='palm'?11:3){const h=hq(x*17+3);if(T.tree==='sparse'&&h%2)continue;
      const ht=(T.tree==='pine'?16:T.tree==='palm'?14:T.tree==='fir'||T.tree==='spruce'?12:3)+(h%(T.tree==='oak'?5:8));wrap(x,X=>tree(R,X,56,ht,T.tree,h));}
    if(!day&&ST.scenery!=='rural')for(let i=0;i<(ST.scenery==='town'?36:60);i++){const h=hq(i*97+5);R(h%SC_TW,49+(h>>>10)%3,1,1,'#ffcf6e');}});
  return L;
}
let SC_L=null;
function scDraw(){
  if(!SC_L)try{SC_L=scBuild();}catch(e){console.error(e);SC_L=[];}
  const t=G.time||0;
  for(let i=0;i<SC_L.length;i++){const l=SC_L[i],x0=G.camY*KFAR*l.f,o=((x0%SC_TW)+SC_TW)%SC_TW;
    ctx.drawImage(l.c,-o,0);if(SC_TW-o<W)ctx.drawImage(l.c,SC_TW-o,0);
    if(l.anim)l.anim(x0,l.f,t);
    // haze in front of the far layers: thicker in fog, a little in rain and snow
    if(l.f<0.2){const a=WX.fog*0.45+WX.wet*0.08+WX.sn*0.12;if(a>0.01){ctx.fillStyle=ST.day?`rgba(200,206,212,${a.toFixed(3)})`:`rgba(40,46,56,${a.toFixed(3)})`;ctx.fillRect(0,0,W,58);}}}
  if(WX.fog>0){ctx.fillStyle=ST.day?`rgba(206,211,216,${(WX.fog*0.35).toFixed(3)})`:`rgba(52,58,68,${(WX.fog*0.4).toFixed(3)})`;ctx.fillRect(0,0,W,60);}
}
// sky: clear, partly cloudy or a low deck of rain clouds; stars and the moon only on clear nights; lightning in storms
function scSky(){
  const day=ST.day,off=G.camY*KFAR*0.05,ov=WX.over,storm=WX.k==='storm';
  const g=ctx.createLinearGradient(0,0,0,58);
  if(day){if(ov>=1){g.addColorStop(0,storm?'#4a525c':'#7e8995');g.addColorStop(1,storm?'#7d868f':'#b9c2cb');}else{g.addColorStop(0,ov?'#5f93c6':'#3f8fd8');g.addColorStop(1,ov?'#c7d7e4':'#c4e6f8');}}
  else{if(ov>=1){g.addColorStop(0,'#0b0e14');g.addColorStop(1,'#1d222b');}else{g.addColorStop(0,NIGHT.sky0);g.addColorStop(1,NIGHT.sky1);}}
  ctx.fillStyle=g;ctx.fillRect(0,0,W,60);
  if(!day){const h=ctx.createLinearGradient(0,22,0,56),c=ST.scenery==='city'?'150,120,90':ST.scenery==='town'?'110,110,130':'80,96,140';h.addColorStop(0,`rgba(${c},0)`);h.addColorStop(1,`rgba(${c},${ov>=1?0.22:0.42})`);ctx.fillStyle=h;ctx.fillRect(0,22,W,36);}
  if(G.wxBolt>0){ctx.fillStyle=`rgba(225,232,255,${(G.wxBolt*0.9).toFixed(3)})`;ctx.fillRect(0,0,W,60);}
  if(ov<1){
    if(day){const sx=Math.round(((520-off*0.3)%(W+60)+W+60)%(W+60)-30);
      if(!ov){ctx.fillStyle='rgba(255,248,214,.35)';ctx.beginPath();ctx.arc(sx,14,11,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff6cf';ctx.beginPath();ctx.arc(sx,14,6,0,Math.PI*2);ctx.fill();}
      const n=ov?16:7;for(let i=0;i<n;i++){const h=hq(i*53+9),w=18+(h%22)+(ov?14:0),y=6+((h>>>6)%26),x=Math.round((((h%900)-G.camY*KFAR*0.12+G.time*(1.5+WX.w*0.12))%(W+120)+W+120)%(W+120)-60);
        const c=ov?'#dfe5ea':'#ffffff',c2=ov?'#b9c3cc':'#dceaf4';pr(x,y,w,3,c);pr(x+4,y-2,w-10,2,c);pr(x+2,y+3,w-4,1,c2);}}
    else{const ns=Math.round(70*(1-ov));for(let i=0;i<ns;i++){const h=hq(i*31+7),x=((h%W)-off+W*4)%W,y=(h>>>9)%44;
        const tw=((h>>>4)&7)===0?(Math.sin(G.time*3+i)>0.4?1:0):1;if(!tw)continue;pr(x,y,1,1,(h&3)?'#c9d6ff':'#ffffff');}
      if(!ov){const mx=Math.round(((560-off*0.3)%(W+40)+W+40)%(W+40)-20),my=12;ctx.fillStyle='#e9e7d6';ctx.beginPath();ctx.arc(mx,my,5,0,Math.PI*2);ctx.fill();pr(mx-2,my-1,2,1,'#c7c4b2');pr(mx+1,my+2,1,1,'#c7c4b2');}
      else for(let i=0;i<8;i++){const h=hq(i*61+13),w=30+(h%30),y=4+((h>>>6)%24),x=Math.round((((h%900)-G.camY*KFAR*0.12+G.time*(1.5+WX.w*0.12))%(W+140)+W+140)%(W+140)-70);pr(x,y,w,4,'#1b2130');pr(x+5,y-2,w-12,2,'#1b2130');}
      // northern lights over Aurora on clear, cold nights
      if(SC_T.aurora&&!ov&&WX.k==='clear'){ctx.globalCompositeOperation='lighter';for(let k=0;k<3;k++){for(let x=0;x<W;x+=3){const y=10+k*5+Math.sin(x*0.02+G.time*0.4+k)*5+Math.sin(x*0.007-G.time*0.2)*6;
        const a=0.05+0.04*Math.sin(x*0.03+G.time+k*2);ctx.fillStyle=k===1?`rgba(150,90,220,${(a*0.7).toFixed(3)})`:`rgba(70,230,140,${a.toFixed(3)})`;ctx.fillRect(x,y,3,10+k*3);}}ctx.globalCompositeOperation='source-over';}}
  }else{
    // low cloud deck
    const c0=day?(storm?'#59616b':'#8f99a3'):'#151a22',c1=day?(storm?'#454c55':'#7c8792'):'#0f131a';
    for(let x=0;x<W;x+=3){const wx=Math.floor((x+G.camY*KFAR*0.1+G.time*(2+WX.w*0.25))/3),h=hq(wx*37+5);const y=8+(h%9)+Math.round(Math.sin(wx*0.13)*3);pr(x,0,3,y,c1);pr(x,y,3,2,c0);}
  }
  if(G.wxBolt>0.5&&G.wxBoltX!=null){ctx.strokeStyle='rgba(255,255,255,.95)';ctx.lineWidth=1;ctx.beginPath();let x=G.wxBoltX,y=4;ctx.moveTo(x,y);
    for(let i=0;i<7;i++){x+=((hq(G.wxBoltS+i)%9)-4);y+=6;ctx.lineTo(x,y);}ctx.stroke();}
}
// ---- precipitation and fog drawn over the field and players ----
function wxOverlay(dt){
  if(ST.indoor)return;
  const t=G.time||0,ws=gpWindScreen();
  if(WX.k==='storm'){G.wxBolt=Math.max(0,(G.wxBolt||0)-dt*3.2);if(!G.wxNext)G.wxNext=t+4+Math.random()*6;
    if(t>=G.wxNext){G.wxNext=t+5+Math.random()*9;G.wxBolt=1;G.wxBoltX=40+Math.random()*(W-80);G.wxBoltS=(Math.random()*1e6)|0;}
    if(G.wxBolt>0){ctx.fillStyle=`rgba(230,236,255,${(G.wxBolt*0.22).toFixed(3)})`;ctx.fillRect(0,0,W,H);}}
  if(WX.wet>0){const n=Math.round(70+WX.wet*210),sl=ws*0.035,col=ST.day?'rgba(205,215,228,.5)':'rgba(215,226,255,.46)';
    ctx.strokeStyle=col;ctx.lineWidth=1;ctx.beginPath();
    for(let i=0;i<n;i++){const h=hq(i*61+3),sp=380+(h%140),L=7+(h%5);const y=((hq(i*43+29)%H)+t*sp)%(H+20)-10,x=(((hq(i*47+31)%W)+t*sp*sl+y*sl)%W+W)%W;ctx.moveTo(x,y);ctx.lineTo(x+L*sl,y+L);}
    ctx.stroke();
    ctx.fillStyle=ST.day?'rgba(220,230,240,.5)':'rgba(220,230,255,.4)';
    for(let i=0;i<Math.round(n*0.25);i++){const h=hq(i*53+11),ph=(t*3+(h%100)/100)%1;if(ph>0.25)continue;const x=h%W,y=110+((h>>>9)%(H-115));ctx.fillRect(x-1,y,3,1);}}
  if(WX.sn>0){const n=Math.round(110+WX.sn*260),F=[];
    for(let i=0;i<n;i++){const h=hq(i*31+7),sp=22+(h%30),s=(h%4===0)?2.5:1.6;const h2=hq(i*37+13),y=((h2%H)+t*sp)%(H+10)-5,x=(((hq(i*41+5)%W)+t*ws*1.8+Math.sin(t*1.3+i)*6)%W+W)%W;F.push(x,y,s);}
    ctx.fillStyle='rgba(90,105,125,.35)';for(let i=0;i<F.length;i+=3)ctx.fillRect(F[i]+0.5,F[i+1]+0.6,F[i+2],F[i+2]);
    ctx.fillStyle='#ffffff';for(let i=0;i<F.length;i+=3)ctx.fillRect(F[i],F[i+1],F[i+2],F[i+2]);}
  if(WX.k==='clear'&&WX.w>=15){ctx.fillStyle=ST.day?'rgba(150,120,70,.7)':'rgba(120,100,70,.5)';const n=Math.round((WX.w-12)*1.2);
    for(let i=0;i<n;i++){const h=hq(i*59+9),sp=ws*(6+(h%6));const x=(((h%W)+t*sp)%(W+40)+W+40)%(W+40)-20,y=120+((h>>>7)%200)+Math.sin(t*4+i)*4;ctx.fillRect(x,y,2,1);}}
  if(WX.fog>0){const g=ctx.createLinearGradient(0,60,0,H),a=WX.fog,c=ST.day?'206,211,216':'92,100,112';g.addColorStop(0,`rgba(${c},${(a*0.62).toFixed(3)})`);g.addColorStop(0.45,`rgba(${c},${(a*0.32).toFixed(3)})`);g.addColorStop(1,`rgba(${c},${(a*0.14).toFixed(3)})`);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
}
// snow piles up as the game goes on; rain darkens the grass
function wxField(){
  if(ST.indoor)return;
  if(WX.sn>0||WX.snowy&&WX.k!=='clear'){const prog=Math.min(1,((G.q||1)-1+(1-(G.clock||0)/QLEN))/4),a=Math.min(0.9,0.5+WX.sn*0.4*(0.6+0.4*prog));
    quad(-1.2,-8,FW+1.2,128,ST.day?`rgba(240,244,248,${a.toFixed(3)})`:`rgba(226,233,244,${a.toFixed(3)})`);
    const[left,right]=viewRange();for(let k=Math.floor(left);k<right;k+=2){const h=hq(k*131+7);if(h%3)continue;const x=(h>>>4)%FW;quad(x,k,x+2+(h%3),k+1,`rgba(250,252,255,${(a*0.7).toFixed(3)})`);}}
  else if(WX.snowy){quad(-1.2,-8,0,128,ST.day?'rgba(236,241,246,.55)':'rgba(170,180,195,.4)');quad(FW,-8,FW+1.2,128,ST.day?'rgba(236,241,246,.55)':'rgba(170,180,195,.4)');}
  if(WX.wet>0){quad(-1.2,-8,FW+1.2,128,`rgba(8,22,30,${(0.06+WX.wet*0.1).toFixed(3)})`);
    if(!ST.day){ctx.globalCompositeOperation='lighter';const[left,right]=viewRange();for(let k=Math.floor(left/3)*3;k<right;k+=3){const h=hq(k*977+1);if(h%4)continue;const x=(h>>>5)%(FW-4)+2;quad(x,k,x+3,k+0.6,`rgba(255,245,210,${(0.05+WX.wet*0.05).toFixed(3)})`);}ctx.globalCompositeOperation='source-over';}}
}
function wxHudText(){if(!GP||GP.practice)return'';const w=WX,nm=w.k==='rain'&&w.i>0.65?'Heavy rain':w.k==='snow'&&w.i>0.65?'Heavy snow':{clear:w.w>=18?'Windy':'Clear',cloudy:'Overcast',rain:'Rain',storm:'Storms',snow:'Snow',fog:'Fog'}[w.k]||'Clear';
  const s=gpWindScreen(),ar=w.w<3?'':Math.abs(s)<w.w*0.38?'↕':s>0?'→':'←';return`${nm} · ${w.t}° · ${ar}${w.w} mph`;}
/*<\/gdwx>*/
function TRK(l){if(ST.indoor)return l?shade(ST.turfOut,1.12):ST.turfOut;return!ST.track?(l?shade(ST.turfOut,1.12):ST.turfOut):(l?ST.trackCol[1]:ST.trackCol[0]);}
const FANS=['#1f3a68','#1f3a68','#1f3a68','#f2b632','#f2b632','#ffffff','#2c5aa0','#d9dde3','#7a1f2b','#3b3f46','#c9902a'];
function gpFanCol(h){if(GP&&ST.c1&&h%3===0)return(h>>>3)%2?ST.c1:ST.c2;return FANS[h%FANS.length];}
function gpBoard(sbx){
  const b=ST.board,day=ST.day;if(!b)return;
  const nm=GP?GP.teams[GP.home||0].name.toUpperCase():'GULLS',D=(n,x,y)=>pxNum(n,x,y,'#ffb21e');
  ctx.textAlign='center';ctx.textBaseline='middle';
  if(b==='flip'){pr(sbx+2,44,2,18,'#5a3e22');pr(sbx+24,44,2,18,'#5a3e22');pr(sbx-4,30,36,16,'#6b4a2a');pr(sbx-3,31,34,14,'#1f2a22');
    ctx.font='700 4px Nunito, sans-serif';ctx.fillStyle='#e9e3cf';ctx.fillText('HOME',sbx+5,34);ctx.fillText('GUEST',sbx+23,34);
    for(const[n,x]of[[G.score[0],sbx+5],[G.score[1],sbx+23]]){pr(x-6,37,12,7,'#f1ead3');ctx.font='900 6px Nunito, sans-serif';ctx.fillStyle='#1b1b1b';ctx.fillText(String(n),x,40.8);}return;}
  if(b==='small'){pr(sbx+3,42,2,20,'#3a424c');pr(sbx+25,42,2,20,'#3a424c');pr(sbx-4,24,38,19,'#11161d');pr(sbx-3,25,36,17,'#1b222b');pr(sbx-3,25,36,3,ST.c1);
    ctx.font='700 4px Nunito, sans-serif';ctx.fillStyle='#d9dde3';ctx.fillText('HOME',sbx+5,31);ctx.fillText('GUEST',sbx+24,31);D(G.score[0],sbx+5,37);D(G.score[1],sbx+24,37);}
  else if(b==='medium'){
    pr(sbx-1,40,2,22,'#3a424c');pr(sbx+30,40,2,22,'#3a424c');
    pr(sbx-8,16,48,26,'#11161d');pr(sbx-7,17,46,24,'#1b222b');pr(sbx-7,17,46,4,ST.c1);
    ctx.font='700 4px Nunito, sans-serif';ctx.fillStyle=ST.c2||'#f2b632';ctx.fillText(nm.slice(0,10),sbx+16,19.3);
    ctx.fillStyle='#d9dde3';ctx.fillText('HOME',sbx+3,24);ctx.fillText('GUEST',sbx+29,24);
    D(G.score[0],sbx+3,32);D(G.score[1],sbx+29,32);
    const q=G.q>4?'OT':String(G.q);ctx.fillStyle='#ff6a3c';ctx.fillText('Q'+q,sbx+16,32);
  }else{ // video board
    pr(sbx+2,40,3,22,'#3a424c');pr(sbx+46,40,3,22,'#3a424c');
    pr(sbx-14,2,78,40,'#0d1117');pr(sbx-13,3,76,24,'#123');
    const g=ctx.createLinearGradient(0,3,0,27);g.addColorStop(0,ST.c1);g.addColorStop(1,'#0b1424');ctx.fillStyle=g;ctx.fillRect(sbx-13,3,76,24);
    ctx.font='900 7px Nunito, sans-serif';ctx.fillStyle='#ffffff';ctx.fillText(G.cheer>0?'TOUCHDOWN!':nm.slice(0,12),sbx+25,12);
    ctx.font='700 4px Nunito, sans-serif';ctx.fillStyle=ST.c2||'#f2b632';ctx.fillText(GP&&GP.practice?'PRACTICE':'FRIDAY NIGHT LIGHTS',sbx+25,21);
    pr(sbx-13,28,76,13,'#161c25');ctx.fillStyle='#d9dde3';ctx.fillText('HOME',sbx-2,31);ctx.fillText('GUEST',sbx+52,31);
    D(G.score[0],sbx-2,37);D(G.score[1],sbx+52,37);const q=G.q>4?'OT':String(G.q);ctx.fillStyle='#ff6a3c';ctx.font='700 5px Nunito, sans-serif';ctx.fillText('QTR '+q,sbx+25,35);
  }
  if(!day){ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(255,180,40,.08)';ctx.fillRect(sbx-16,0,82,46);ctx.globalCompositeOperation='source-over';}
}
// a pickup truck parked on the grass behind a small-town field
function gpTruck(x,y,h){const col=['#7a2a22','#2b4d6e','#d6d2c4','#3d4a32','#1d1f24'][h%5];
  pr(x,y+3,22,5,col);pr(x+4,y,9,4,col);pr(x+5,y+1,3,2,'#9fb6c9');pr(x+9,y+1,3,2,'#9fb6c9');pr(x+2,y+8,4,2,'#111');pr(x+16,y+8,4,2,'#111');
  if(!ST.day){pr(x+21,y+4,1,2,'#fff6c8');ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(255,240,190,.12)';ctx.beginPath();ctx.moveTo(x+22,y+4);ctx.lineTo(x+60,y+14);ctx.lineTo(x+60,y-4);ctx.closePath();ctx.fill();ctx.globalCompositeOperation='source-over';}}
function gpPracBackdrop(){
  const b=ST.building;if(!b)return;
  const T=GP?GP.teams[GP.home||0]:null,nm=T?(GP.practice?T.city:T.name).toUpperCase():'GULLS',day=ST.day;
  ctx.textAlign='center';ctx.textBaseline='middle';
  if(b==='school'){const x0=Math.round(parX(-26,0.8)),x1=Math.round(parX(16,0.8));if(x1<0||x0>W)return;const w=x1-x0;
    pr(x0,30,w,26,'#8a4b3a');pr(x0-2,28,w+4,3,'#5e3126');for(let x=x0+5;x<x1-8;x+=11){pr(x,34,7,6,day?'#a7c5dc':'#ffd77a');pr(x,44,7,6,day?'#a7c5dc':'#3a2a22');pr(x,40,7,1,'#6d3a2c');}
    const dx=Math.round((x0+x1)/2);pr(dx-6,46,12,10,'#4a3a30');pr(dx-5,47,10,9,'#7b8a99');pr(dx-10,25,20,5,'#e7dcc5');
    ctx.font='800 4px Nunito, sans-serif';ctx.fillStyle='#5e3126';ctx.fillText('HIGH SCHOOL',dx,27.6);return;}
  const big=b==='center',x0=Math.round(parX(big?-40:-24,0.8)),x1=Math.round(parX(big?36:14,0.8));if(x1<0||x0>W)return;
  const top=big?12:26,w=x1-x0;
  pr(x0,top,w,56-top,big?'#cdd3db':'#a6adb7');pr(x0,top,w,4,ST.c1);pr(x0-2,top-2,w+4,2,'#59636e');
  if(big){for(let x=x0+4;x<x1-6;x+=8)pr(x,top+16,6,20,day?'#6f93b8':'#ffd77a');pr(x0,top+38,w,3,ST.c1);pr(Math.round((x0+x1)/2)-8,44,16,12,'#3d4a58');}
  else{for(let x=x0;x<x1;x+=4)pr(x,top+6,1,24,'#949ba5');pr(Math.round((x0+x1)/2)-9,40,18,16,'#59636e');}
  ctx.font='900 6px Nunito, sans-serif';ctx.fillStyle=ST.c1;ctx.fillText(nm.slice(0,12)+(big?' FOOTBALL':' FIELDHOUSE'),(x0+x1)/2,big?top+10:top+11);
}
// practice gear on the far sideline: sleds, dummies and a coaching tower
function gpPracGear(){
  if(ST.kind!=='prac'||!ST.pl)return;
  for(const wy of[16,104,28].slice(0,ST.sleds)){const x=Math.round(parX(wy,1)),y=90,n=ST.pl>=9?5:ST.pl>=4?3:2,gap=ST.pl>=9?6:9;if(x<-40||x>W+40)continue;
    pr(x-n*gap/2-2,y+2,n*gap+4,2,'#3a424c');pr(x-n*gap/2-2,y-14,2,16,'#3a424c');
    for(let k=0;k<n;k++){const X=x-n*gap/2+k*gap;pr(X,y-12,5,13,ST.pl>=7?ST.c1:'#2c3540');pr(X,y-12,5,1,'#c9ced6');pr(X+1,y-10,1,9,'rgba(255,255,255,.25)');}}
  for(let i=0;i<ST.dummies;i++){const wy=34+(i%5)*2.6+(i>=5?50:0),x=Math.round(parX(wy,1));if(x<-10||x>W+10)continue;const y=91-(i%2),c=i%2&&ST.pl>=5?ST.c1:'#d9542c';
    pr(x-3,y-15,6,15,c);pr(x-3,y-15,6,2,'#ffffff');pr(x-3,y-8,6,1,shade(c,0.7));pr(x-4,y,8,2,'#2a2a2a');}
  if(ST.tower&&!ST.indoor){const x=Math.round(parX(60,0.99));if(x>-40&&x<W+40){const tp=ST.pl>=10?16:26,col=ST.pl>=10?'#3d4652':'#59636e';
    pr(x-9,tp,2,94-tp,col);pr(x+8,tp,2,94-tp,col);
    ctx.strokeStyle=col;ctx.lineWidth=1;for(let y=tp+5;y<90;y+=9){ctx.beginPath();ctx.moveTo(x-8,y);ctx.lineTo(x+9,y+9);ctx.moveTo(x+9,y);ctx.lineTo(x-8,y+9);ctx.stroke();}
    pr(x-13,tp-2,27,3,'#2a3038');pr(x-13,tp-9,1,7,'#2a3038');pr(x+13,tp-9,1,7,'#2a3038');pr(x-13,tp-9,27,1,'#2a3038');
    pr(x-2,tp-11,5,9,'#1d2430');pr(x-2,tp-14,5,3,ST.c1);
    if(ST.pl>=6){pr(x-16,tp-20,33,3,ST.c1);pr(x,tp-18,1,8,'#2a3038');}}}
}
function drawStands(){
  const day=ST.day,ind=ST.indoor;
  if(!ind){
    for(const ty of ST.towers||[]){const x=Math.round(parX(ty,0.97));if(x>-40&&x<W+40&&ST.lights)lightTower(x,ST.lights,day);}
    const sbx=Math.round(parX(128,0.97));if(sbx>-80&&sbx<W+80)gpBoard(sbx);
    {const gc=scGround(),gs=SC_T.clay&&!WX.snowy?scC(SC_T.clay):mixC(gc,WX.snowy?'#ffffff':'#9fd07a',WX.snowy?0.5:0.18);pr(0,56,W,28,gc);for(let x=0;x<W;x+=2){const h=hash(Math.floor((x+G.camY*KFAR)/2)*7);if(h%5===0)pr(x,57+(h>>>4)%20,SC_T.clay?2:1,1,gs);}}
    if(ST.kind==='prac')gpPracBackdrop();
    if(ST.twin){const t0=Math.max(0,Math.round(parX(-8,0.92))),t1=Math.min(W,Math.round(parX(128,0.92)));if(t1>t0){pr(t0,68,t1-t0,14,ST.turfA);for(let k=0;k<=120;k+=10){const x=Math.round(parX(k,0.92));if(x>=t0&&x<t1)pr(x,68,1,14,'rgba(255,255,255,.7)');}pr(t0,68,t1-t0,1,'#fff');pr(t0,81,t1-t0,1,'#fff');}}
    if(ST.trucks){for(const[wy,h]of[[6,1],[30,3],[92,2],[116,4]].slice(0,ST.tier<=1?4:2)){const x=Math.round(parX(wy,0.95));if(x>-30&&x<W+30)gpTruck(x,64+(h%2)*6,h);}}
  }
  const xa=parX(ST.xa,1),xb=parX(ST.xb,1);
  if(ST.stands!=='none'&&!ind&&xb>0&&xa<W){
    const L=Math.max(0,Math.round(xa)),R=Math.min(W,Math.round(xb)),rows=ST.rows,top=84-rows*4,conc=ST.stands==='concrete'||ST.stands==='bowl',wood=ST.stands==='wood';
    const riser=wood?'#4b3824':conc?(day?'#8a8f97':'#4a5059'):NIGHT.riser,edge=wood?'#5a4128':'#3a434e';
    if(!wood)for(const[ex,sgn]of[[Math.round(xa),-1],[Math.round(xb),1]]){if(ex<-30||ex>W+30)continue;
      for(let r=0;r<rows*4;r++){const w=Math.round((rows*4-r)*0.5);pr(sgn<0?ex-w:ex,top+r,w,1,r%4===3?ST.seat:edge);}
      pr(sgn<0?ex-16:ex,84,16,1,'#c3ccd6');}
    if(ST.roof){const ry=ST.upper?24:top-12;for(let x=L+6;x<R;x+=34)pr(x,ry+3,2,top-ry,'#59636e');pr(L-4,ry,R-L+8,4,'#59636e');pr(L-4,ry+3,R-L+8,1,'#3a424c');}
    pr(L,top,R-L,rows*4,riser);
    for(let r=0;r<rows;r++){const y=top+1+r*4;
      if(ST.seat2){for(let x=L;x<R;x+=12){pr(x,y+3,6,1,ST.seat);pr(x+6,y+3,6,1,ST.seat2);}}else pr(L,y+3,R-L,1,ST.seat);
      pr(L,y+4,R-L,1,wood?'#3a2a18':shade(ST.seat,0.6));}
    if(wood)for(let x=L+3;x<R;x+=14)pr(x,top,1,rows*4,'#3a2a18');
    const cheer=G.cheer>0;
    for(let r=0;r<rows-1;r++){
      const y=top+2+r*4;
      for(let x=L-((Math.round(xa)%3+3)%3);x<R;x+=3){
        const wx=Math.round((x-xa)/3),h=hash(wx*41+r*977);if((h%100)>=ST.fill*100)continue;
        const up=cheer&&((wx+r+Math.floor(G.time*8))%3===0)?1:0,dim=r<2?0.75:1;
        pr(x,y-up,2,3,shade(gpFanCol(h),dim));pr(x,y-2-up,2,2,SKINS[(h>>>6)%SKINS.length].m);
        if(cheer&&up&&h%2)pr(x-1,y-4,1,2,SKINS[(h>>>6)%SKINS.length].m);
      }
    }
    if(!wood){pr(L,top-1,R-L,1,'#c3ccd6');for(let x=L;x<R;x+=8)pr(x,top-4,1,4,'#c3ccd6');pr(L,top-4,R-L,1,'#c3ccd6');}
    if(ST.upper){pr(L,38,R-L,17,conc?(day?'#7d838b':'#4a5462'):'#4a5462');for(let r=0;r<4;r++){const y=40+r*4;pr(L,y+3,R-L,1,ST.seat);for(let x=L;x<R;x+=3){const h=hash(Math.round((x-xa)/3)*53+r*311);if((h%100)>=ST.fill*100)continue;pr(x,y,2,3,shade(gpFanCol(h),0.7));pr(x,y-2,2,2,SKINS[(h>>>6)%SKINS.length].m);}}pr(L,37,R-L,1,'#c3ccd6');}
    const pb=Math.round(parX(60,1)),P=ST.pressBox;
    if(P&&pb>-70&&pb<W+70){const nm='HOME OF THE '+(GP?GP.teams[GP.home||0].name.toUpperCase():'GULLS');
      ctx.textAlign='center';ctx.textBaseline='middle';
      if(P==='shed'){const y=top-12;pr(pb-16,y,32,12,'#e3e7ec');pr(pb-17,y-2,34,2,'#2a3440');for(let i=0;i<3;i++)pr(pb-13+i*10,y+3,7,5,day?'#8fb0c8':'#ffd77a');}
      else if(P==='box'){const y=ST.upper?18:34;pr(pb-34,y,68,20,'#e3e7ec');pr(pb-34,y,68,3,ST.c1);pr(pb-36,y-2,72,3,'#2a3440');
        for(let i=0;i<7;i++)pr(pb-31+i*9,y+5,7,6,day?'#8fb0c8':'#ffd77a');
        pr(pb-34,y+14,68,6,ST.c1);ctx.font='800 5px Nunito, sans-serif';ctx.fillStyle=ST.c2;ctx.fillText(nm,pb,y+17.3);pr(pb-20,y-6,2,4,'#59636e');pr(pb-22,y-8,6,2,'#3a424c');}
      else{const y=ST.upper?6:20;pr(pb-46,y,92,30,'#e3e7ec');pr(pb-46,y,92,3,ST.c1);pr(pb-48,y-2,96,3,'#2a3440');
        for(let r=0;r<2;r++)for(let i=0;i<10;i++)pr(pb-43+i*9,y+5+r*9,7,6,day?'#8fb0c8':'#ffd77a');
        pr(pb-46,y+23,92,7,ST.c1);ctx.font='800 5px Nunito, sans-serif';ctx.fillStyle=ST.c2;ctx.fillText(nm,pb,y+26.6);}
    }
  }
  // people standing along the rope at the smallest fields
  if(ST.crowdLine&&!day){for(let x=0;x<W;x+=4){const wx=Math.floor((x+G.camY*KFAR)/4),h=hash(wx*61+17);const wy=G.camY+(x-W*G.anch)/KFAR;if(wy<12||wy>108||h%3===0)continue;
    const X=x+(h%3);pr(X,79,2,4,shade(gpFanCol(h),0.8));pr(X,77,2,2,SKINS[(h>>>6)%SKINS.length].m);if(h%7===0){pr(X-1,82,4,1,'#7d6b4f');}}}
  // far-side fence + track
  const t0=Math.max(0,Math.round(proj(-3,-8).sx)),t1=Math.min(W,Math.round(proj(-3,128).sx));
  pr(0,84,W,11,ind?ST.turfOut:mixC(scGround(),'#000000',0.12));
  if(t1>t0){
    pr(t0,84,t1-t0,11,TRK(0));
    const F=ind?'wall':ST.fence,sc=((Math.round(-G.camY*KFAR)%4+4)%4);
    if(F==='rope'){for(let x=t0;x<t1;x+=24)pr(x+sc*6%24,82,1,5,'#7d6440');pr(t0,83,t1-t0,1,'#d9d0b0');}
    else if(F==='chain'){for(let x=t0;x<t1;x+=4)pr(x+sc,84,1,3,NIGHT.fence);pr(t0,84,t1-t0,1,'#8d97a2');pr(t0,86,t1-t0,1,NIGHT.fence);}
    else if(F==='screen'){pr(t0,81,t1-t0,6,ST.wall);pr(t0,81,t1-t0,1,'#8d97a2');for(let x=t0;x<t1;x+=40)pr(x+sc*10%40,81,1,6,'#59636e');}
    else{pr(t0,80,t1-t0,7,ST.wall);pr(t0,80,t1-t0,1,ST.wall2);pr(t0,86,t1-t0,1,shade(ST.wall,0.6));}
    if(ST.track&&!ind){for(const y of[89,92])pr(t0,y,t1-t0,1,TRK(1));pr(t0,94,t1-t0,1,shade(ST.trackCol[0],0.7));}
  }
  gpPracGear();
}
/* cheerleaders: pixel figures on the home-side track */
const CHEER_HAIR=['#2a1a10','#7a4a22','#e2c27a','#141010','#a0522d'];
function drawCheerSquad(){
  const n=GDS.gfx==='fast'?Math.min(4,ST.cheer|0):ST.cheer|0;if(!n)return;
  const C1=ST.c1&&/^#/.test(ST.c1)?ST.c1:'#1f3a68',C2=ST.c2&&/^#/.test(ST.c2)?ST.c2:'#f2b632',C2D=mixC(C2,'#000000',0.18);
  for(let i=0;i<n;i++){
    const half=Math.ceil(n/2),wy=i<half?14+i*4.6:106-(i-half)*4.6,p=proj(-2.4,wy),x=Math.round(p.sx),y=Math.round(p.sy);
    if(x<-12||x>W+12)continue;
    const h=hash(i*71+3),skin=SKINS[h%SKINS.length].m,hair=CHEER_HAIR[(h>>>4)%CHEER_HAIR.length];
    const t=G.time*(G.cheer>0?7:3.2)+i*1.7,ph=Math.floor(t)%4,mode=G.cheer>0?'jump':['pom','v','pom','kick','pom','v','kick','pom'][(i+Math.floor(G.time/3))%8];
    let lift=0,LH=[-4,-10],RH=[4,-10],LF=[-1.5,0],RF=[1.5,0];
    if(mode==='pom'){if(ph%2){LH=[-4,-18];RH=[4,-9];}else{LH=[-4,-9];RH=[4,-18];}}
    else if(mode==='v'){LH=[-5,-18];RH=[5,-18];if(ph%2){LH=[-6,-14];RH=[6,-14];}}
    else if(mode==='kick'){LH=[-5,-15];RH=[5,-15];if(ph%2)RF=[5,-9];}
    else{lift=ph<2?Math.round(Math.sin((t%2)/2*Math.PI)*6):0;if(lift>2){LF=[-6,-6];RF=[6,-6];}LH=[-5,-18];RH=[5,-18];}
    const Y=y-lift,S=(a)=>[x+a[0],Y+a[1]];
    pr(x-3,y,7,1,'rgba(0,0,0,.35)');
    // legs + shoes
    pxSeg(S([-1,-7]),S(LF),1,skin);pxSeg(S([1,-7]),S(RF),1,skin);
    pr(x+LF[0]-1,Y+LF[1],2,1,'#ffffff');pr(x+RF[0],Y+RF[1],2,1,'#ffffff');
    // skirt (gold with navy pleats)
    pr(x-3,Y-9,6,1,C2);pr(x-3,Y-8,7,1,C2);pr(x-4,Y-7,8,1,C2D);pr(x-2,Y-8,1,2,C1);pr(x+1,Y-8,1,2,C1);
    // top
    pr(x-2,Y-14,4,5,C1);pr(x-1,Y-14,1,3,C2);pr(x,Y-13,1,2,C2);
    // arms + poms
    pxSeg(S([-2,-13]),S(LH),1,skin);pxSeg(S([2,-13]),S(RH),1,skin);
    for(const hnd of[LH,RH]){const c=S(hnd);pr(c[0]-1,c[1]-1,3,3,C2);pr(c[0],c[1]-1,1,1,'#ffffff');pr(c[0]-1,c[1]+1,1,1,'#ffffff');}
    // head + hair with bouncing ponytail
    pr(x-1,Y-17,3,3,skin);pr(x-1,Y-18,3,1,hair);pr(x-2,Y-17,1,2,hair);
    const pt=Math.floor(t*2)%2;pr(x+2,Y-17+pt,1,3,hair);pr(x+1,Y-18,1,1,C2);
  }
}
