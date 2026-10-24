<script>
const DEMO=(()=>{try{return!!(window.frameElement&&window.frameElement.getAttribute('data-demo'));}catch(e){return false;}})();
const GP=(()=>{try{if(DEMO)return null;return window.parent&&window.parent!==window&&window.parent.__GP?window.parent.__GP:null;}catch(e){return null;}})();
try{if(window.parent&&window.parent!==window&&window.parent.gpErrLog){window.addEventListener('error',e=>{try{window.parent.gpErrLog(e&&e.message,e&&e.error&&e.error.stack,'gameday');}catch(_){}});
  window.addEventListener('unhandledrejection',e=>{try{const r=e&&e.reason;window.parent.gpErrLog(r&&r.message||String(r),r&&r.stack,'gameday');}catch(_){}});}}catch(e){}
try{const u=GP&&GP.ui,R=document.documentElement;if(u){R.classList.add('g27');if(u.light)R.classList.add('g27l');R.style.setProperty('--tA',u.tA);R.style.setProperty('--tB',u.tB);R.style.setProperty('--tRGB',u.tRGB);R.style.setProperty('--tOn',u.tOn);}}catch(e){}

'use strict';
/* ===================== core ===================== */
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect)CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){r=Math.max(0,Math.min(typeof r==='number'?r:(Array.isArray(r)?r[0]||0:0),Math.abs(w)/2,Math.abs(h)/2));this.moveTo(x+r,y);this.arcTo(x+w,y,x+w,y+h,r);this.arcTo(x+w,y+h,x,y+h,r);this.arcTo(x,y+h,x,y,r);this.arcTo(x,y,x+w,y,r);this.closePath();return this;}; // older Chrome (some Chromebooks)
let W=640;const H=360,FW=58,CX=FW/2,SPD=0.76,GRAV=20,QLEN=180;
// projection keeps the near sideline at y=345 and the far sideline at y=95 for any field width
let D0=91.4,HC=35.7,SS=250/(HC*(1/D0-1/(D0+FW))),HOR=345-HC*SS/D0,KFAR=SS/(D0+FW),KNEAR=SS/D0;
// camera angle (Settings): the sidelines stay where the stadium art expects them; the distance changes the perspective and how much field you see
const CAMS={wide:64,broadcast:91.4,tight:150};
function camSet(k){D0=CAMS[k]||CAMS.broadcast;SS=250/(HC*(1/D0-1/(D0+FW)));HOR=345-HC*SS/D0;KFAR=SS/(D0+FW);KNEAR=SS/D0;}
const $=id=>document.getElementById(id);
const cv=$('c'),MAINCTX=cv.getContext('2d');let ctx=MAINCTX;
/* v2.14 Game Day settings (shared with the main menu's Settings): sound, crowd, tips, ball size, drive direction, controls */
const GDS_DEF={sound:true,band:true,vol:0.8,crowd:true,tips:false,ball:1,dir:'right',haptics:true,kr:true,keys:{},gfx:'auto',crowdV:'full',bug:'tv',moveUI:'wheel',clickTk:true,pcCam:'close',land:'pc',cam:'broadcast',noiseM:true};
// v2.15 rebindable keys: [action, label, default key]. W A S D and the arrows always move your defender.
const KB_ACT=[['jukeU','Juke up','w'],['jukeD','Juke down','s'],['dive','Dive','d'],['slow','Slow down','a'],['spin','Spin','e'],['stiff','Stiff arm','q'],['truck','Truck','r'],['hurdle','Hurdle','h'],
  ['tackle','Tackle','j'],['switch','Switch player','tab'],['play','Play the ball','k'],['scramble','QB tuck and run','c'],['fair','Fair catch','f']];
// v2.15 difficulty sliders: 0-100 per team (you / CPU), 50 is normal. Online games always play at 50.
const SL_KEYS=[['spd','Speed'],['acc','Acceleration'],['str','Strength'],['iq','Awareness (IQ)'],['thr','Throwing accuracy'],['bsp','Ball speed'],['cat','Catching'],['int','Interceptions'],['man','Man coverage'],['zone','Zone coverage'],['fum','Fumbles'],['juk','Juke ability']];
function slv(t,k){if(ON||G.test||G.demo||DEMO)return 50;const S=GDS.sl&&GDS.sl[t===G.me?'u':'c'],v=S&&S[k];return v==null||isNaN(+v)?50:Math.max(0,Math.min(100,+v));}
function slf(t,k,span){return 1+(slv(t,k)-50)/50*span;}
function sla(t,k,span){return(slv(t,k)-50)/50*span;}
function gspd(){if(ON||G.test||G.demo||DEMO)return 1;const v=+GDS.gspd;return v>0?Math.max(0.75,Math.min(1.25,v)):1;}
function kb(a){const d=KB_ACT.find(x=>x[0]===a);return((GDS.keys&&GDS.keys[a])||(d?d[2]:'')).toLowerCase();}
function kbLabel(k){return{tab:'Tab',' ':'Space',enter:'Enter',arrowup:'↑',arrowdown:'↓',arrowleft:'←',arrowright:'→',escape:'Esc'}[k]||k.toUpperCase();}
const GDS=(()=>{let o={};try{o=JSON.parse(localStorage.getItem('gpgm_gd')||'{}')||{};}catch(e){}if(!o.mw2){o.moveUI='wheel';o.mw2=true;try{localStorage.setItem('gpgm_gd',JSON.stringify(o));}catch(e){}}return Object.assign({},GDS_DEF,o);})();
try{camSet(GDS.cam);}catch(e){}
function gdsSave(){try{localStorage.setItem('gpgm_gd',JSON.stringify(GDS));}catch(e){}}
// which way the offense attacks on screen: always right (default), always left, or real (teams switch ends every quarter)
// right: does team 0 attack to the right? Team 1 always goes the other way, so a punt or kick flies the way its team was driving
function gpFlipFor(off){
  let right=true;
  if(!ON&&!DEMO){if(GDS.dir==='left')right=false;else if(GDS.dir==='real'){const q=typeof G!=='undefined'&&G.q?G.q:1;right=q>4||q===1||q===3;}}
  return(off===1)===right;
}
let SC=1,DPR=1;
const rnd=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>v<a?a:v>b?b:v,pick=a=>a[Math.floor(Math.random()*a.length)];
const ri=(a,b)=>Math.floor(rnd(a,b+1));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const lerp=(a,b,t)=>a+(b-a)*t;
function pickW(list){let s=0;for(const[,w]of list)s+=w;let r=Math.random()*s;for(const[v,w]of list){if((r-=w)<0)return v;}return list[0][0];}
function hx(h){const n=parseInt(h.slice(1),16);return[n>>16,(n>>8)&255,n&255];}
function cs(c){return `rgb(${c[0]|0},${c[1]|0},${c[2]|0})`;}
function shA(c,f){return c.map(v=>clamp(v*f,0,255));}
function ltA(c,f){return c.map(v=>clamp(v+(255-v)*f,0,255));}
function shade(h,f){return cs(f<=1?shA(hx(h),f):ltA(hx(h),f-1));}
function tone(h){const c=hx(h);return{s:cs(shA(c,0.6)),m:cs(c),l:cs(ltA(c,0.38)),f:{s:cs(shA(c,0.45)),m:cs(shA(c,0.74)),l:cs(shA(c,0.92))}};}
function kitOf(o){const k={};for(const n in o)k[n]=tone(o[n]);return k;}
const SKINS=['#8d5a3b','#c68a5e','#e2b48c','#6b4228','#a8714a','#f0c9a0','#5a3520','#7c4a2c'].map(tone);

/* ===================== teams & rosters ===================== */
const FIRST=['Marcus','Jalen','Tyler','Caleb','Devin','Isaiah','Bryce','Cole','Mason','Trey','Jordan','Darius','Aiden','Xavier','Elijah','Logan','Andre','Malik','Carter','Hunter','Jace','Kendrick','Nate','Owen','Quentin','Reggie','Silas','Tre','Wyatt','Zion','DeShawn','Grant','Landon','Micah','Roman','Tristan','Brody','Cam','Damon','Eli','Javon','Kobe','Luca','Mateo','Noah','Omar','Pierce','Rashad','Seth','Ty'];
const LAST=['Hill','Carter','Brooks','Jackson','Reed','Coleman','Hayes','Bennett','Price','Foster','Ward','Graham','Sullivan','Porter','Hughes','Myers','Russell','Griffin','Barnes','Fisher','Henderson','Simmons','Patterson','Jenkins','Bryant','Alexander','Dawson','Holloway','Mercer','Whitaker','Vance','Lockett','Pruitt','Okafor','Mendez','Nakamura','Kowalski','Delgado','Boateng','Lindqvist','Fontenot','Ramsey','Tatum','Ellison','Crowder','Maddox','Sutton','Kearney','Ashby','Calloway','Dupree','Fairley','Gaines','Ivory','Lacy','Nkemdiche','Odom','Pickett','Quarles','Tillman'];
const POS={
  QB:{n:2,ht:[73,77],wt:[200,228],spd:[66,84],str:[55,70],hands:[50,65],acc:[72,92],pow:[72,92],tkl:[30,45]},
  RB:{n:2,ht:[68,72],wt:[195,220],spd:[85,95],str:[62,82],hands:[60,80],tkl:[35,50],agi:[82,95]},
  WR:{n:5,ht:[70,76],wt:[175,205],spd:[85,97],str:[50,66],hands:[72,94],tkl:[30,45],agi:[80,94]},
  TE:{n:2,ht:[75,78],wt:[235,258],spd:[74,84],str:[70,84],hands:[66,84],tkl:[40,55]},
  OL:{n:7,ht:[75,79],wt:[290,325],spd:[55,64],str:[80,95],tkl:[40,55]},
  DL:{n:6,ht:[74,78],wt:[255,310],spd:[66,82],str:[78,94],tkl:[70,88]},
  LB:{n:4,ht:[72,75],wt:[225,245],spd:[76,88],str:[70,84],tkl:[74,92],cov:[60,78],hands:[45,65]},
  CB:{n:3,ht:[69,73],wt:[175,195],spd:[86,96],str:[50,64],tkl:[58,76],cov:[74,92],hands:[55,76],agi:[84,95]},
  S:{n:3,ht:[71,74],wt:[195,212],spd:[82,92],str:[60,74],tkl:[70,88],cov:[68,86],hands:[55,72]},
  K:{n:1,ht:[70,74],wt:[180,200],spd:[55,65],str:[45,55],kpow:[76,93],kacc:[76,93]},
  P:{n:1,ht:[72,75],wt:[195,212],spd:[55,65],str:[45,55],kpow:[74,92],kacc:[70,88]}
};
const NUMR={QB:[1,19],RB:[20,39],WR:[1,19],TE:[80,89],OL:[50,79],DL:[90,99],LB:[40,59],CB:[20,39],S:[20,49],K:[1,19],P:[90,99]};
const BASE={hands:[40,55],tkl:[35,50],cov:[25,40],acc:[20,40],pow:[30,50],kpow:[20,40],kacc:[20,40],agi:[60,80]};
const KITS=[
  kitOf({helmet:'#e9ad2f',hstripe:'#1f3a68',mask:'#1f3a68',jersey:'#1f3a68',trim:'#f2b632',num:'#f2b632',pants:'#e2a63a',pstripe:'#1f3a68',sock:'#1f3a68',cleat:'#151a22',glove:'#f2b632',sleeve:'#1f3a68'}),
  kitOf({helmet:'#7a1f2b',hstripe:'#f4f0e6',mask:'#cfc8b6',jersey:'#f4f0e6',trim:'#7a1f2b',num:'#7a1f2b',pants:'#f1ede3',pstripe:'#7a1f2b',sock:'#7a1f2b',cleat:'#f4f4f4',glove:'#7a1f2b',sleeve:'#f4f0e6'})
];
const REFKIT=kitOf({helmet:'#ffffff',hstripe:'#ffffff',mask:'#ffffff',jersey:'#f6f6f6',trim:'#111111',num:'#111111',pants:'#1c1c1c',pstripe:'#1c1c1c',sock:'#1c1c1c',cleat:'#111111',glove:'#e9e9e9',sleeve:'#f6f6f6'});
const SLEEVES=[null,null,null,'#111820','#ffffff'].map(c=>c?tone(c):null);

let PID=0;
function mkPlayer(team,pos,used){
  const D=POS[pos],R=k=>ri(...(D[k]||BASE[k]));
  const ht=ri(...D.ht),wt=ri(...D.wt);
  let num,g=0;const nr=NUMR[pos];
  do{num=ri(nr[0],nr[1]);if(pos==='WR'&&Math.random()<0.35)num=ri(80,88);g++;}while(used.has(num)&&g<60);
  used.add(num);
  const bmi=wt*703/(ht*ht);
  const p={id:PID++,team,pos,first:pick(FIRST),last:pick(LAST),num,ht,wt,
    spd:R('spd'),str:R('str'),hands:R('hands'),tkl:R('tkl'),cov:R('cov'),acc:R('acc'),pow:R('pow'),kpow:R('kpow'),kacc:R('kacc'),agi:R('agi'),
    stamina:100,inj:null,
    body:{hs:1+(ht-74)*0.012,ws:clamp(1+(bmi-26)*0.04,0.88,1.5),belly:clamp((bmi-31)*0.09,0,0.65)},
    look:{skin:pick(SKINS),sleeve:pos==='OL'||pos==='DL'?null:pick(SLEEVES),visor:Math.random()<0.22,longSock:Math.random()<0.5,band:Math.random()<0.45}};
  p.ovr=Math.round((p.spd+p.str+(pos==='QB'?p.acc*2:pos==='WR'||pos==='TE'||pos==='RB'?p.hands:pos==='K'||pos==='P'?p.kpow*2:p.tkl))/ (pos==='QB'||pos==='K'||pos==='P'?4:3));
  return p;
}
function nm(p){return `${p.first[0]}. ${p.last}`;}
const OSLOTS=[['QB','QB'],['RB','RB'],['X','WR'],['Z','WR'],['SL','WR'],['TE','TE'],['LT','OL'],['LG','OL'],['C','OL'],['RG','OL'],['RT','OL']];
const DSLOTS=[['DE1','DL'],['DT1','DL'],['DT2','DL'],['DE2','DL'],['MLB','LB'],['WLB','LB'],['CB1','CB'],['CB2','CB'],['NB','CB'],['SS','S'],['FS','S']];
function mkTeam(id,city,name,abbr){
  const used=new Set(),roster=[];
  for(const pos in POS)for(let i=0;i<POS[pos].n;i++)roster.push(mkPlayer(id,pos,used));
  const T={id,city,name,abbr,kit:KITS[id],roster,auto:true,lineup:{}};
  T.byPos=pos=>roster.filter(p=>p.pos===pos).sort((a,b)=>b.ovr-a.ovr);
  T.get=pid=>roster.find(p=>p.id===pid);
  for(const set of[OSLOTS,DSLOTS]){const cnt={};for(const[s,pos]of set){cnt[pos]=cnt[pos]||0;T.lineup[s]=T.byPos(pos)[cnt[pos]++].id;}}
  return T;
}
function gpTeam(id,c){
  if(c.kit)KITS[id]=kitOf(c.kit);
  if(c.pack)PACK_TEAMS[id]=c.pack;
  const roster=c.players.map(q=>{const ht=q.ht||74,wt=q.wt||210,bmi=wt*703/(ht*ht);
    const p={id:PID++,mid:q.mid,arch:q.arch||null,traits:q.traits||[],awr:Math.min(99,(q.awr||70)+(q.cap?3:0)),chem:q.chem!=null?q.chem:null,cap:!!q.cap,team:id,pos:q.pos,pos2:q.pos2||null,first:q.first,last:q.last,num:q.num,ht,wt,spd:q.spd,str:q.str,hands:q.hands,tkl:q.tkl,cov:q.cov,acc:q.acc,pow:q.pow,kpow:q.kpow,kacc:q.kacc,agi:q.agi,
      ...Object.fromEntries('dac,tup,car,elu,btk,cit,rte,jmp,pbk,rbk,pmv,fmv,bsh,hpw,mcv,zcv,prs,end'.split(',').filter(k=>q[k]!=null).map(k=>[k,q[k]])),
      stamina:100,inj:null,body:{hs:1+(ht-74)*0.012,ws:clamp(1+(bmi-26)*0.04,0.88,1.5),belly:clamp((bmi-31)*0.09,0,0.65)},
      look:{pk:q.pk,skin:tone(q.skin||'#c68a5e'),sleeve:q.pos==='OL'||q.pos==='DL'?null:(q.sl===1?tone('#111820'):q.sl===2?tone('#ffffff'):null),visor:!!q.visor,longSock:!!q.ls,band:!!q.band,eq:q.eq||null,hair:q.hair||null,hst:q.hst||null},ovr:q.ovr,stars:q.stars>=2?Math.min(5,q.stars|0):0};
    return p;});
  const T={id,city:c.city,name:c.name,abbr:c.abbr,kit:KITS[id],roster,auto:true,lineup:{}};
  // v2.16 two-way players: a second position makes him eligible there too (a little behind the specialists)
  T.byPos=pos=>roster.filter(p=>p.pos===pos||p.pos2===pos).sort((a,b)=>(b.ovr-(b.pos===pos?0:4))-(a.ovr-(a.pos===pos?0:4)));
  T.get=pid=>roster.find(p=>p.id===pid);
  for(const set of[OSLOTS,DSLOTS]){const used=new Set();for(const[s,pos]of set){const pl=T.byPos(pos).find(p=>!used.has(p.id))||roster.find(p=>!used.has(p.id))||roster[0];used.add(pl.id);T.lineup[s]=pl.id;}}
  return T;
}
function gpTrack(S,r){
  if(!GP)return;const P=G.play;if(!P)return;const st=G.st||(G.st={});
  const add=(pl,k,v)=>{if(!pl||pl.mid==null||!v)return;const o=st[pl.mid]||(st[pl.mid]={});o[k]=(o[k]||0)+v;};
  for(const e of G.ents)if(e.pl&&e.pl.mid!=null)G.played[e.pl.mid]=1;
  if(P.kind==='scrimmage'&&!G.conv&&!P.special&&r&&r.type!=='presnap'){
    const c=G.carrier,qb=G.qb&&G.qb.pl,off=G.offTeam,gain=Math.round(S.td===off?(100-G.los):(S.gain||0));
    if(G.gpThrown){add(qb,'passAtt',1);
      if(c&&c.side==='d'){add(qb,'passInt',1);add(c.pl,'ints',1);}
      else if(c&&c.side==='o'&&c.pl!==qb&&r.type!=='inc'){add(qb,'passCmp',1);add(qb,'passYds',gain);add(c.pl,'rec',1);add(c.pl,'recYds',gain);if(S.td===off){add(qb,'passTD',1);add(c.pl,'recTD',1);}
        const cv=G.gpCovC;if(cv&&cv.pl){add(cv.pl,'tgtA',1);add(cv.pl,'cmpA',1);add(cv.pl,'ydsA',Math.max(0,gain));}}
      else{const cv=G.gpCov;if(cv&&cv.pl&&!(c&&c.side==='d'&&c!==cv))add(cv.pl,'tgtA',1);}
      if(r.type==='inc'&&r.drop&&G.gpDrop)add(G.gpDrop.pl,'drops',1);
      if(r.type==='inc'&&r.pbu&&G.gpPbu)add(G.gpPbu.pl,'pbu',1);
    }else if(c&&c.side==='o'){
      if(c.tkType==='sack'){if(G.gpTk)add(G.gpTk,'sacks',1);if(G.gpSackOL)add(G.gpSackOL.pl,'sacksA',1);}
      else{add(c.pl,'rushAtt',1);add(c.pl,'rushYds',gain);if(S.td===off)add(c.pl,'rushTD',1);}
    }
    if(G.gpTk&&c&&r.type!=='td'&&r.type!=='inc'&&!(c.side==='d'))add(G.gpTk,'tackles',1);
    for(const b of G.gpPk||[])add(b.pl,'pancakes',1);
  }
  // v2.14: tackles for loss, yards after catch, safeties, and play-call splits for both teams
  if(P.kind==='scrimmage'&&!G.conv&&!P.special&&r&&r.type!=='presnap'){
    const c=G.carrier,qb=G.qb&&G.qb.pl,off=G.offTeam,gain=Math.round(S.td===off?(100-G.los):(S.gain||0));
    if(c&&c.side==='o'&&G.gpTk&&r.type!=='td'&&r.type!=='inc'&&(S.gain||0)<0)add(G.gpTk,'tfl',1);
    if(G.gpThrown&&c&&c.side==='o'&&c.pl!==qb&&r.type!=='inc'&&G.catchY!=null)add(c.pl,'yac',Math.max(0,Math.round(gain-(G.catchY-(10+G.los)))));
    if(S.msg==='SAFETY'&&G.gpTk)add(G.gpTk,'safeties',1);
    const call=G.pbp&&G.pbp.call,dc=P.defCall&&P.defCall.n;
    if(call&&P.off&&(P.off.kind==='pass'||P.off.kind==='run')){
      const sp=G.splits||(G.splits=[{o:{},d:{}},{o:{},d:{}}]),o=sp[off].o[call]||(sp[off].o[call]={n:0,yds:0,td:0,fd:0,k:P.off.kind});
      o.n++;o.yds+=gain;if(S.td===off)o.td++;if(S.first)o.fd++;
      if(dc){const d=sp[1-off].d[dc]||(sp[1-off].d[dc]={n:0,yds:0,td:0,to:0});d.n++;d.yds+=gain;if(S.td===off)d.td++;if(S.to&&S.poss!==off)d.to++;}
    }
  }
  // punt returns, the same way as kick returns
  if(P.kind==='punt'&&G.prFrom!=null&&r&&!['touchback','fair','puntDead'].includes(r.type)){const c=G.carrier;
    if(c&&c.side==='o'&&!G.kickRecovered&&c.pl){const off=G.offTeam,end=S.td===off?110:(r.spot!=null?r.spot:c.y);
      add(c.pl,'prRet',1);add(c.pl,'prYds',Math.max(0,Math.round(end-G.prFrom))||0);if(S.td===off)add(c.pl,'prTD',1);}}
  // kick returns: from the spot of the catch to where the returner went down (or the end zone)
  if(P.kind==='kickoff'&&G.krFrom!=null&&r&&!['touchback','koOOB'].includes(r.type)){const c=G.carrier;
    if(c&&c.side==='o'&&!G.kickRecovered&&c.pl){const off=G.offTeam,end=S.td===off?110:(r.spot!=null?r.spot:c.y);
      add(c.pl,'krRet',1);add(c.pl,'krYds',Math.max(0,Math.round(end-G.krFrom))||0);if(S.td===off)add(c.pl,'krTD',1);}}
  if((P.kind==='fg'||P.kind==='xp')&&P.kicker){const k=P.kind==='fg'?['fga','fgm']:['xpa','xpm'];add(P.kicker.pl,k[0],1);if(/GOOD/.test(S.msg||'')&&!/NO GOOD/.test(S.msg||''))add(P.kicker.pl,k[1],1);}
}
function gpIntro(cb){
  if(!GP||G.test||G.noDraw){cb();return;}
  G.phase='intro';G.introT=0;G.introCb=cb;G.introShown=false;
  for(const e of G.ents){if(!e.pl)continue;e.tx=e.x;e.ty=e.y;const home=e.team===(GP.home||0);
    e.x=home?FW+3+Math.random()*2:-3-Math.random()*2;e.y=e.ty+(Math.random()-.5)*10;e.vx=0;e.vy=0;e.introD=Math.random()*0.8;}
}
function gpIntroStep(dt){
  G.introT+=dt;let done=true;
  for(const e of G.ents){if(!e.pl||e.tx==null)continue;
    if(G.introT<e.introD){done=false;continue;}
    const dx=e.tx-e.x,dy=e.ty-e.y,d=Math.hypot(dx,dy);
    if(d>0.25){done=false;const sp=Math.min(6*SPD,d*2.5);accel(e,dx/d*sp,dy/d*sp,dt,14);}else{e.vx*=0.6;e.vy*=0.6;}
    e.x+=e.vx*dt;e.y+=e.vy*dt;e.anim+=Math.hypot(e.vx,e.vy)*dt*1.6;}
  if((done||G.introT>6)&&!G.introShown){G.introShown=true;for(const e of G.ents){if(e.tx!=null){e.x=e.tx;e.y=e.ty;e.vx=0;e.vy=0;}}gpShowPreview();}
}
function gpIntroSkip(){const el=document.getElementById('gpPrev');if(el)el.remove();for(const e of G.ents){if(e.tx!=null){e.x=e.tx;e.y=e.ty;e.vx=0;e.vy=0;}}G.phase='menu';const cb=G.introCb;G.introCb=null;if(cb)cb();
  if(GP&&!GP.practice&&(WX.k!=='clear'||WX.w>=15||WX.t>=90||WX.t<=32))setTimeout(()=>{try{toast(wxHudText(),WX.k==='rain'||WX.k==='storm'?'Wet ball: hold on tight':WX.k==='snow'?'Slick field, short kicks':WX.k==='fog'?'Fog: deep balls are hard to see':WX.t>=90?'Heat: rotate your players':WX.t<=32?'Freezing: the ball is a rock':'Watch the wind on kicks');}catch(e){}},600);}
function gpShowPreview(){
  if(!GP.previewHtml){gpIntroSkip();return;}
  const ov=document.createElement('div');ov.id='gpPrev';
  ov.style.cssText='position:fixed;inset:0;z-index:50;display:flex;align-items:flex-start;justify-content:center;background:rgba(3,14,28,.55);padding:12px;overflow-y:auto;-webkit-overflow-scrolling:touch';
  ov.innerHTML='<div style="margin:auto;width:min(620px,96vw);border-radius:14px;padding:16px 18px 14px;background:rgba(14,26,43,.96);color:#f2f5f7;border:1px solid rgba(214,228,245,.14);border-top:4px solid var(--tA,#2f66c0);box-shadow:0 20px 50px rgba(2,8,18,.5)">'+GP.previewHtml+
    '<div style="text-align:center;margin-top:12px"><button id="gpPrevGo" style="min-height:46px;padding:0 30px;border-radius:8px;border:0;font:700 16px Barlow,system-ui,sans-serif;color:var(--tOn,#fff);cursor:pointer;background:var(--tA,#2f66c0)">Coin toss<\/button><\/div><\/div>';
  document.body.appendChild(ov);document.getElementById('gpPrevGo').onclick=gpIntroSkip;
}

function gpPracticeStart(){
  const P=GP.practice;G.pOff=P.mode==='def'?1:0;G.pReps=0;
  G.poss=G.offTeam=G.pOff;G.drivePoss=G.pOff;G.los=35;G.down=1;G.toGo=10;G.next=null;G.conv=null;G.clockRun=false;G.started=true;
  if(P.mode==='tut'){tutStart();return;}
  flash(`Practice: ${P.reps} reps, no game clock. `+(P.mode==='air'?'Offense on air, no defense.':P.mode==='def'?'Your defense vs the offense.':'Your offense vs the defense.'));
  nextSnap();
}
function gpPracticeCommit(S){
  if(!GP||!GP.practice)return;const P=G.play;
  if(P&&P.kind==='scrimmage'){G.pReps=(G.pReps||0)+1;const left=GP.practice.reps-G.pReps;if(left>0)setTimeout(()=>{try{flash(left===1?'Last rep of practice!':`Rep ${G.pReps} of ${GP.practice.reps} done · ${left} to go`);}catch(e){}},900);}
  if(GP.practice.mode==='tut'){S.poss=G.pOff;S.los=35;S.down=1;S.toGo=10;S.next=null;S.conv=null;S.stop='snap';S.to=false;return;}
  if(S.poss!==G.pOff||S.next==='kickoff'||S.next==='conv'||S.to||S.next==='over'){
    S.poss=G.pOff;S.los=35;S.down=1;S.toGo=10;S.next=null;S.conv=null;S.stop='snap';S.to=false;}
  if(G.pReps>=GP.practice.reps&&!G.pEnd){G.pEnd=true;setTimeout(()=>{if(G.phase!=='over')gameOver();},1600);}
}
