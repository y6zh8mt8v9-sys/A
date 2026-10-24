/* ===================== state ===================== */
const G={teams:[],score:[0,0],q:1,clock:QLEN,clockRun:false,restartReady:false,playClock:20,to:[3,3],
  poss:0,los:25,down:1,toGo:10,next:null,kickTeam:0,kickSpot:35,openRecv:0,conv:null,ot:null,
  phase:'menu',offTeam:0,flip:false,anch:0.32,camY:30,time:0,t:0,
  ents:[],refs:[],carrier:null,ballState:'pre',air:null,loose:null,kick:null,snapB:null,seq:null,
  play:null,uctl:null,aim:null,ptr:null,joy:null,bullet:false,fouls:[],flags:[],parts:[],after:null,cele:null,cheer:0,hint:'',
  rec:null,lastRec:null,stats:[{yds:0,to:0,pass:0,rush:0},{yds:0,to:0,pass:0,rush:0}],ai:[false,true],test:false,
  started:false,meter:null,fair:false,snapIn:0,turnover:false,prev:null,result:null,linesW:null,uctlIdle:0,kneelOK:0};
const isAI=t=>G.ai[t];
const userOff=()=>!isAI(G.offTeam);
// v2.14 coach mode: the player calls every play (offense and defense) and the team plays them out on its own.
// Game modes: 'all' (play everything), 'off' (opponent drives are simulated), 'def' (your drives are simulated)
// Player Career (Road to Glory style): you control only your own player. The coach calls every play and picks the drives you play.
function pcOn(){return!!(GP&&GP.pc&&!ON&&!G.test&&!GP.practice);}
function pcMe(e){return!!(e&&e.pl&&GP&&GP.pc&&e.pl.mid!=null&&e.pl.mid===GP.pc.mid);}
function pcAI(e){return pcOn()&&!!e&&e.team===G.me&&!pcMe(e);}
function pcAIQB(){return pcOn()&&G.offTeam===G.me&&!pcMe(G.qb);}
function pcUnit(){const p=GP.pc.pos;return['QB','RB','WR','TE','OL'].includes(p)?'o':['DL','LB','CB','S'].includes(p)?'d':'k';}
function pcDrive(){const u=pcUnit(),mine=G.poss===G.me,on=GP.pc.two?true:u==='d'?!mine:mine;
  G.pcRot=false;if(!on||u==='k'||GP.pc.start){G.pcIn=on;return G.pcIn;}
  G.pcSer=(G.pcSer||0)+1;const n=G.pcSer,sh=clamp(GP.pc.share||0.3,0.1,1);G.pcIn=n===1||Math.floor(n*sh)>Math.floor((n-1)*sh);
  G.pcRot=!G.pcIn;return G.pcIn;}
function pcLineup(){if(!pcOn()||!G.pcIn)return;const T=G.teams[G.me],rp=T.roster.find(p=>p.mid===GP.pc.mid&&healthy(p));if(!rp)return;
  // a two-way player lines up at the position of the side that is on the field
  const U=p=>['QB','RB','WR','TE','OL'].includes(p)?'o':['DL','LB','CB','S'].includes(p)?'d':'k',side=GP.pc.two?(G.poss===G.me?'o':'d'):null,pos=side&&rp.pos2&&U(rp.pos2)===side?rp.pos2:rp.pos;
  const set=side?(side==='o'?OSLOTS:DSLOTS):OSLOTS.concat(DSLOTS);if(set.some(([x])=>T.lineup[x]===rp.id))return;const sl=set.find(([x,ps])=>ps===pos);if(sl)T.lineup[sl[0]]=rp.id;}
// a simulated series you are not part of: your player goes to the bench so the stats go to whoever really played
function pcBenchOut(){const T=G.teams[G.me];if(!T||!T.lineup)return;const rp=T.roster.find(p=>p.mid===GP.pc.mid);if(!rp)return;
  const used=new Set(Object.values(T.lineup));
  for(const[x,pos]of OSLOTS.concat(DSLOTS)){if(T.lineup[x]!==rp.id)continue;
    const sub=T.roster.filter(p=>p.id!==rp.id&&p.pos===pos&&healthy(p)&&!used.has(p.id)).sort((a,b)=>(b.ovr||0)-(a.ovr||0))[0];if(sub){T.lineup[x]=sub.id;used.add(sub.id);}}}
// career receiver: line up on the other side (a receiver standing over there takes your old spot, man defenders follow)
function gpPcFlip(){const me=G.ents.find(e=>pcMe(e));if(G.phase!=='presnap'||!me||!me.route||me.side!=='o')return;
  const mir=e=>{e.x=FW-e.x;e.hx=e.x;if(e.route&&e.route.pts)for(const q of e.route.pts)q.x=FW-q.x;},tx=FW-me.x;
  const mate=G.ents.filter(e=>e!==me&&e.side==='o'&&e.route&&e.route.pts&&(e.x-CX)*(me.x-CX)<0).sort((a,b)=>Math.abs(a.x-tx)-Math.abs(b.x-tx))[0],sw=mate&&Math.abs(mate.x-tx)<2.5?mate:null;
  mir(me);if(sw)mir(sw);for(const o of G.ents)if(o.side==='d'&&o.cover&&(o.cover.man===me||(sw&&o.cover.man===sw))){o.x=FW-o.x;o.hx=o.x;}
  G.snapIn=Math.max(G.snapIn||0,1.2);flash('You flip to the other side');setTray('presnap');}
function pcCallBall(){if(!pcOn()||G.offTeam!==G.me||pcMe(G.qb)||G.pcWant)return;G.pcWant=true;G.pcAsks=(G.pcAsks||0)+1;flash('Calling for the ball!');setCtl();if(G.phase==='presnap')setTray('presnap');}
function coachOn(){return!!(G.coachMode&&!ON&&!(GP&&GP.practice))&&!pcOn();}
function userDecides(t){return!G.test&&!pcOn()&&(!isAI(t)||(coachOn()&&t===G.me));}
function gpAutoSimDrive(){if(ON||G.test||(GP&&GP.practice))return false;if(pcOn()){const sk=!pcDrive();if(sk)pcBenchOut();return sk;}const m=G.playMode||'all';return m==='off'?G.poss!==G.me:m==='def'?G.poss===G.me:false;}
function gpSetCoach(on){
  if(ON||(GP&&GP.practice))return;G.coachMode=!!on;
  if(!G.simming)G.ai[G.me]=!!on;else if(G.simPrevAI)G.simPrevAI[G.me]=!!on;
  if(on){G.uctl=null;G.joy=null;G.joyV=null;}
  else if(G.phase==='presnap'&&G.play&&G.play.kind==='scrimmage'&&G.offTeam!==G.me){G.uctl=G.ents.find(e=>e.side==='d'&&e.slot===(G.uSlotT[G.me]||'MLB'))||null;}
  try{setTray(G.phase==='presnap'?'presnap':G.phase==='dead'?'dead':'none');setCtl();}catch(e){}
}
// v2.03 online head-to-head: G.me is the team this device controls, G.act the team whose input is being applied
// (the host applies the guest's commands with G.act set to the guest's team). G.client: this device only draws the host's frames.
const ON=!!(GP&&GP.online);
G.me=ON?(GP.online.me|0):0;G.act=G.me;G.client=!!(ON&&GP.online.role==='guest');G.uSlotT={};
if(ON)G.ai=[false,false];

/* ===================== entities ===================== */
// stamina (0-100) carries over from play to play; tired players are slower, weaker and less sharp
function gpSt(e){const p=e&&e.pl;return p&&p.stamina!=null?clamp(p.stamina,0,100)/100:1;}
function gpFat(e){return 1-gpSt(e);} // 0 fresh, 1 exhausted
function mkEnt(pl,team,side,role,slot,x,y){
  const st=pl?(pl.stamina!=null?pl.stamina:100):100;
  return{pl,team,side,role,slot,x,y,hx:x,hy:y,vx:0,vy:0,
    spd:(pl?(5.5+(pl.spd-55)*0.088)*SPD*(0.8+0.2*st/100)*slf(team,'spd',0.15):3.4)*WX.spd,acc:(role==='OL'||role==='DL'?20:28)*SPD*(0.85+0.15*st/100)*WX.acc*(pl?(0.9+clamp(((pl.agi||pl.spd||70)-70)/30,-1,1)*0.1)*slf(team,'acc',0.25):1),
    stun:0,eng:0,engCD:0,engDur:1,engWith:null,assign:null,anim:Math.random()*8,route:null,dir:side==='d'?-1:1,back:false,
    juke:0,jdir:0,jukeT:-9,jumpT:0,slip:0,dive:0,slow:0,spin:0,stiff:0,truck:0,hurdle:0,moveCD:0,relT:0,ca:null,jz:0,swat:0,pp:null,down:false,downT:0,lunge:0,lt:null,
    tk:null,jam:0,plant:0,hist:[],block:false,blitz:false,cover:null,react:0.25,tau:0.25,spdF:1,settled:false,read:0.5,run:0,
    seed:Math.random()*6,hurt:false,kneel:false,special:null,flagT:0,sig:0};
}
function addE(list,T,slotOrPl,side,role,x,y,slot){
  y=clamp(y,0.5,119.5);
  const pl=typeof slotOrPl==='string'?slotPlayer(T,slotOrPl):slotOrPl;
  const e=mkEnt(pl,T.id,side,role,slot||(typeof slotOrPl==='string'?slotOrPl:role),x,y);list.push(e);return e;
}
function fillUnit(T,n,exclude,prefer){
  const out=[];const ex=new Set(exclude.map(p=>p.id));
  const pool=T.roster.filter(p=>healthy(p)&&!ex.has(p.id)).sort((a,b)=>(prefer.indexOf(a.pos)<0?9:prefer.indexOf(a.pos))-(prefer.indexOf(b.pos)<0?9:prefer.indexOf(b.pos))||b.stamina-a.stamina);
  for(const p of pool){if(out.length>=n)break;out.push(p);}
  return out;
}
function fastest(T,poss,exclude){const ex=new Set(exclude.map(p=>p.id));return T.roster.filter(p=>poss.includes(p.pos)&&healthy(p)&&!ex.has(p.id)).sort((a,b)=>b.spd-a.spd);}
function mkRefs(ly){
  const R=[],ref=(x,y,slot)=>{const e=mkEnt(null,-1,'ref','REF',slot,x,y);e.refLook={skin:pick(SKINS),sleeve:null,visor:false,longSock:true,band:false};e.body={hs:rnd(0.95,1.03),ws:rnd(0.95,1.15),belly:Math.random()<0.4?0.25:0};R.push(e);return e;};
  ref(CX+4,ly-12,'R');ref(-1.8,ly,'HL');ref(FW+1.8,ly,'LJ');ref(CX-6,ly+21,'BJ');
  return R;
}

/* ===================== scrimmage setup ===================== */
// pre-snap motion: where the motion man goes and when the ball is snapped
function gpMoEnd(x,d,k){const dir=x<CX?1:-1;if(k==='jet')return[CX-dir*4.5,3.1,dir];if(k==='across')return[CX+dir*5,d,dir];return[clamp(x+dir*5,x<CX?1.5:CX+5.5,x<CX?CX-5.5:FW-1.5),d,dir];}
function gpMotionStart(){
  const P=G.play,MO=P&&P.kind==='scrimmage'&&!P.special&&P.off.data&&P.off.data.mo;if(!MO||G.motion||G.moDone)return false;
  const e=G.moMan;if(!e)return false;const ly=G.linesW.los,[tx,td,dir]=gpMoEnd(e.x,ly-e.y,MO.k);
  G.motion={e,k:MO.k,tx,ty:ly-td,dir,t:0,sp:MO.k==='jet'?e.spd*1.5:MO.k==='across'?e.spd*1.45:e.spd*1.25};
  e.inMotion=true;G.moDone=true;setTray('none');return true;
}
function gpMotionStep(dt){
  const M=G.motion;if(!M)return;const e=M.e;M.t+=dt;
  const dx=M.tx-e.x,dy=M.ty-e.y,d=Math.hypot(dx,dy);
  if(M.k==='jet'){const vx=M.dir*M.sp,vy=clamp(dy*2.2,-4,4);e.vx=vx;e.vy=vy;}
  else{const s=Math.min(M.sp,d*3);e.vx=d>0.01?dx/d*s:0;e.vy=d>0.01?dy/d*s:0;}
  const ox=e.x;e.x+=e.vx*dt;e.y+=e.vy*dt;e.anim+=Math.hypot(e.vx,e.vy)*dt*2.1;
  // a man defender travels with him
  for(const o of G.ents)if(o.side==='d'&&o.cover&&o.cover.type==='man'&&o.cover.man===e){const tr=M.k==='jet'?0.78:0.95;o.x+=(e.x-ox)*tr;o.hx=o.x;o.vx=e.vx*tr;}
  const go=M.k==='jet'?(M.dir>0?e.x>=M.tx:e.x<=M.tx):d<0.25;
  if(go||M.t>4.5){e.hx=e.x;e.hy=e.y;if(M.k!=='jet'){e.vx=e.vy=0;}e.inMotion=M.k==='jet';G.motion=null;G.moReady=true;doSnap();}
}
function setRoute(e,name,out,col){
  const R=ROUTES[name];if(!R){e.route=null;e.block=true;return;}
  e.route={name,end:R.end,i:0,col,delay:R.delay||0,qk:R.qk||0,pts:R.p.map(([dx,dy,c,f])=>{let x=e.x+dx*out;x=R.fade?clamp(x,3.5,FW-3.5):clamp(x,1.5,FW-1.5);return{x,y:Math.min(119,e.y+dy),c,fake:f==='f'};})};
}
const RCOL=['#ffd23f','#4fd1ff','#ff7ad9','#b6ff6a','#ff9f43'];
function setupScrimmage(offCall,defCall){
  G.dAdj=null;G.lastPos={};for(const e of G.ents)if(e.pl)G.lastPos[e.pl.id]=[e.x,e.y];
  const _r=setupScrimmage0(offCall,defCall);if(SEVENS())gpSevensSetup();else if(GP&&GP.fmt&&GP.fmt<11)gpSmallSetup(GP.fmt);gpAfterSetup();return _r;
}
/* ===================== v2.16 7-on-7: the summer passing league ===================== */
// seven a side: quarterback, center and five eligibles against two linebackers, three corners and two safeties.
// No helmets or pads, two-hand touch, no runs, a four-second pass clock, every drive starts at your own 40.
function SEVENS(){return!!(GP&&GP.sevens);}
// 7v7 games are short: one or two quarters, played as the 2nd and 4th (or just the 4th) so halftime and late-game logic still fit
function s7Q(){return GP&&GP.s7q===1?1:2;}
function qLbl(q){if(SEVENS())return s7Q()===1?'Game':q<=2?'1st Half':'2nd Half';return['1st','2nd','3rd','4th'][q-1]||'OT';}
function gpSevensSetup(){
  G.ents=G.ents.filter(e=>!(e.side==='o'&&e.role==='OL'&&e.slot!=='C')&&!(e.side==='d'&&e.role==='DL'));
  G.ol=(G.ol||[]).filter(e=>G.ents.includes(e));
  for(const e of G.ents)if(e.pl)e.pl.helmetOff=true;
}
// six-man, eight-man and nine-man: fewer linemen and one less receiver; the defense drops to match
function gpSmallSetup(n){
  const offOut=n===6?['LT','LG','RG','RT']:n===8?['LT','RT']:['LT'];
  const keep=new Set([G.rb,G.moMan,G.qb]),rOut=n<=9?([G.SL,G.te,G.Z].find(e=>e&&!keep.has(e))||null):null;
  const gone=new Set(G.ents.filter(e=>e.side==='o'&&e.role==='OL'&&offOut.includes(e.slot)));if(rOut)gone.add(rOut);
  for(const k of['SL','te','Z'])if(G[k]&&gone.has(G[k]))G[k]=null;
  const dOrder=n===6?['DT1','DT2','WLB','NB','SS']:n===8?['DT2','NB','SS']:['DT2','NB'];
  const D=G.ents.filter(e=>e.side==='d');let dn=D.length;
  // whoever was covering the man who left goes first
  for(const d of D)if(dn>n&&d.cover&&d.cover.man&&gone.has(d.cover.man)){gone.add(d);dn--;}
  for(const sl of dOrder){if(dn<=n)break;const d=D.find(e=>e.slot===sl&&!gone.has(e));if(d){gone.add(d);dn--;}}
  for(const d of D)if(dn>n&&!gone.has(d)&&d.role==='DL'){gone.add(d);dn--;}
  G.ents=G.ents.filter(e=>!gone.has(e));G.ol=(G.ol||[]).filter(e=>G.ents.includes(e));
  for(const d of G.ents)if(d.side==='d'&&d.cover&&d.cover.man&&!G.ents.includes(d.cover.man))d.cover={type:'blitz'};
}
function gpSevensTick(){
  if(!SEVENS()||G.phase!=='live'||!G.play||G.play.kind!=='scrimmage')return;
  if(G.ballState==='qb'&&!G.pendThrow&&G.t>4.2){flash('4-second clock: sack!');endPlay({type:'tackle',spot:G.linesW.los});}
}
function setupScrimmage0(offCall,defCall){
  const O=G.teams[G.offTeam],D=G.teams[1-G.offTeam];autoSubs(O);autoSubs(D);pcLineup();
  G.flip=gpFlipFor(G.offTeam);
  const ly=10+G.los,L=[];
  const OD=offCall.data||{},F=FORMS[((offCall.kind==='pass'||offCall.kind==='run')&&OD.f&&FORMS[OD.f]&&OD.f)||'base'],FP=Object.assign({},F.pos,OD.pos||{});
  // extra slot receivers come off the bench for the tight end / running back
  const usedWR=new Set(['X','Z','SL'].map(s=>O.lineup[s]));
  const extraWR=()=>{const p=O.byPos('WR').filter(q=>healthy(q)&&!usedWR.has(q.id)).sort((a,b)=>b.ovr-a.ovr)[0];if(p)usedWR.add(p.id);return p;};
  const usedB=new Set([O.lineup.RB,O.lineup.TE,O.lineup.X,O.lineup.Z,O.lineup.SL]);
  const extraFB=()=>{for(const pos of['RB','TE','LB','DL']){const p=O.byPos(pos).filter(q=>healthy(q)&&!usedB.has(q.id)).sort((a,b)=>(b.str+b.ovr)-(a.str+a.ovr))[0];if(p){usedB.add(p.id);return p;}}return null;};
  const skill=(slot,role)=>{const sub=F.sub[slot];const pl=sub==='WR'?(extraWR()||slotPlayer(O,slot)):sub==='FB'?(extraFB()||slotPlayer(O,slot)):slot;const[x,d]=FP[slot];
    const e=addE(L,O,pl,'o',sub==='WR'?'WR':sub==='FB'?'RB':role,x,ly-d,slot);if(sub==='FB')e.fb=true;return e;};
  const qb=addE(L,O,'QB','o','QB',CX,ly-(F.qbD||5));let rb=skill('RB','RB');
  const ol=[['LT',CX-3.8,ly-1.0],['LG',CX-1.9,ly-0.8],['C',CX,ly-0.8],['RG',CX+1.9,ly-0.8],['RT',CX+3.8,ly-1.0]].map(([s,x,y])=>addE(L,O,s,'o','OL',x,y));
  const te=skill('TE','TE'),X=skill('X','WR'),Z=skill('Z','WR'),SL=skill('SL','WR');
  if(offCall.kind==='run'&&OD.fbc&&SL.fb){SL.fb=false;rb.fb=true;rb.block=true;const t=rb;rb=SL;}
  G.motion=null;G.moDone=false;G.moReady=false;G.moMan=null;
  if(OD.mo&&(offCall.kind==='pass'||offCall.kind==='run')){const mm={X,Z,SL,TE:te,RB:rb}[OD.mo.s];if(mm){G.moMan=mm;mm.moDir=mm.x<CX?1:-1;mm.moOut=mm.x<CX?-1:1;}
    if(offCall.kind==='run'&&OD.jet&&mm&&mm!==rb){rb.fb=true;rb.block=true;rb=mm;}}
  if(offCall.kind==='run'&&OD.lead){for(const e of[rb,SL])if(e.fb)e.block=true;}
  Object.assign(G,{qb,rb,ol,te,X,Z,SL,form:F});
  if(offCall.kind==='pass'){
    const C=offCall.data;[X,Z,SL,te,rb].forEach((e,i)=>setRoute(e,C.r[i],e.x<CX?-1:1,RCOL[i]));
    G.recv=[X,Z,SL,te,rb].filter(e=>e&&e.route);
  }else{G.recv=[];}
  setupDefense(D,ly,L,defCall);
  G.ents=L;G.refs=mkRefs(ly);
  G.play={kind:'scrimmage',off:offCall,def:defCall,two:!!G.conv};
  G.linesW={los:ly,fd:G.conv?null:(G.los+G.toGo>=100?null:ly+G.toGo)};
  resetBall();
}
function assignCoverage(id,P,O,ly){
  // P: defenders by slot, O: offensive skill players (X,Z,SL,TE,RB). Sets alignment and cover for each defender.
  const{DE1:de1,DT1:dt1,DT2:dt2,DE2:de2,MLB:mlb,WLB:wlb,CB1:cb1,CB2:cb2,NB:nb,SS:ss,FS:fs}=P;
  const manIds=['C0','DAG','C1','C1R','NBZ','C2M','C1S'],man=manIds.includes(id);
  const press=id==='C0'||id==='DAG'||(man&&Math.random()<0.45);
  const at=(d,x,y)=>{d.x=d.hx=x;d.y=d.hy=Math.min(119,y);};
  const M=(d,r)=>{d.cover={type:'man',man:r};d.press=press&&(d.role==='CB'||d.role==='NB');
    const wide=Math.abs(r.x-CX)>4;if(wide||d.role!=='LB'){const ins=r.x<CX?0.8:-0.8;at(d,r.x+ins,ly+(d.press?1.4:d.role==='CB'?7:wide?5:4.5));}
    d.cush0=d.press?1.2:Math.max(1.5,d.y-ly);};
  const Z=(d,x,y,hw,deep,kind)=>{d.cover=zone(x,ly+y,hw,deep);if(kind)d.cover.kind=kind;};
  const B=d=>{d.cover={type:'blitz'};};
  for(const d of[de1,dt1,dt2,de2])d.cover={type:'rush'};
  const cbD=press?1.4:(id==='C2'||id==='T2'||id==='C6')?5:7;
  at(cb1,O.X.x+(man?0.7:0.3),ly+cbD);at(cb2,O.Z.x-(man?0.7:0.3),ly+cbD);at(nb,O.SL.x-0.8,ly+5);
  at(mlb,CX-0.5,ly+5);at(wlb,CX+4,ly+5);
  const twoHigh=['C2','C2M','T2','C4','C6','C2I'].includes(id);
  at(ss,twoHigh?CX-10:CX-6,ly+(twoHigh?13:7.5));at(fs,twoHigh?CX+10:CX+1,ly+13);
  switch(id){
    case'C0':M(cb1,O.X);M(cb2,O.Z);M(nb,O.SL);M(ss,O.TE);M(fs,O.RB);B(mlb);B(wlb);at(ss,O.TE.x+0.5,ly+4);at(fs,CX,ly+8);break;
    case'DAG':M(cb1,O.X);M(cb2,O.Z);M(nb,O.SL);M(ss,O.TE);M(fs,O.RB);B(mlb);B(wlb);at(mlb,CX-1,ly+2);at(wlb,CX+1,ly+2);at(ss,O.TE.x+0.5,ly+4);at(fs,CX,ly+8);break;
    case'C1':M(cb1,O.X);M(cb2,O.Z);M(nb,O.SL);M(ss,O.TE);M(wlb,O.RB);Z(mlb,CX,7,7);Z(fs,CX,16,26,1);at(ss,CX+6,ly+6.5);break;
    case'C1R':M(cb1,O.X);M(cb2,O.Z);M(nb,O.SL);M(mlb,O.TE);M(wlb,O.RB);Z(ss,CX,10,9,0,'robber');Z(fs,CX,16,26,1);at(ss,CX-3,ly+9);break;
    case'NBZ':M(cb1,O.X);M(cb2,O.Z);M(ss,O.SL);M(mlb,O.TE);M(wlb,O.RB);B(nb);Z(fs,CX,16,26,1);at(ss,O.SL.x-0.5,ly+7);at(nb,O.SL.x-2,ly+3);break;
    case'C2M':M(cb1,O.X);M(cb2,O.Z);M(nb,O.SL);M(mlb,O.TE);M(wlb,O.RB);Z(ss,FW*0.25,16,14,1);Z(fs,FW*0.75,16,14,1);break;
    case'C2':Z(cb1,5,5,8);Z(cb2,FW-5,5,8);Z(ss,FW*0.25,16,14,1);Z(fs,FW*0.75,16,14,1);Z(mlb,CX-5,8,6);Z(wlb,CX+2,9,6);Z(nb,CX+10,7,6);break;
    case'T2':Z(cb1,5,5,8);Z(cb2,FW-5,5,8);Z(ss,FW*0.22,16,12,1);Z(fs,FW*0.78,16,12,1);Z(mlb,CX,15,6,1,'tampa');Z(wlb,CX+5,8,7);Z(nb,CX-6,8,7);at(mlb,CX,ly+6);break;
    case'C3':Z(cb1,7,15,9,1);Z(cb2,FW-7,15,9,1);Z(fs,CX,17,9,1);Z(ss,10,7,8);Z(nb,FW-10,7,8);Z(mlb,CX-4,8,6);Z(wlb,CX+4,8,6);break;
    case'CBZ':B(cb2);Z(cb1,7,15,9,1);Z(ss,FW-7,15,9,1);Z(fs,CX,17,9,1);Z(nb,FW-10,7,8);Z(mlb,CX-4,8,6);Z(wlb,CX+4,8,6);at(cb2,O.Z.x-1.2,ly+3);at(ss,CX+9,ly+10);break;
    case'FZ':Z(cb1,7,15,9,1);Z(cb2,FW-7,15,9,1);Z(fs,CX,17,9,1);Z(ss,10,7,8);B(wlb);Z(de2,FW-12,6,7);Z(nb,CX+5,8,6);Z(mlb,CX-4,8,6);break;
    case'C3B':Z(cb1,7,15,9,1);Z(cb2,FW-7,15,9,1);Z(fs,CX,17,9,1);Z(ss,CX-5,8,6);Z(nb,FW-10,7,8);Z(mlb,CX+1,8,6);Z(wlb,10,7,8);at(ss,CX-6,ly+8.5);break;
    case'C1S':M(cb1,O.X);M(cb2,O.Z);M(nb,O.SL);M(ss,O.TE);M(wlb,O.RB);Z(mlb,CX,5,4,0,'robber');Z(fs,CX,16,26,1);at(ss,CX+6,ly+6.5);at(mlb,CX,ly+4.5);break;
    case'C2I':Z(cb1,FW*0.25,16,14,1);Z(cb2,FW*0.75,16,14,1);Z(ss,6,6,8);Z(fs,FW-6,6,8);Z(mlb,CX-5,8,6);Z(wlb,CX+2,9,6);Z(nb,CX+10,7,6);at(cb1,O.X.x+0.4,ly+7);at(cb2,O.Z.x-0.4,ly+7);break;
    case'SIM':Z(cb1,7,15,9,1);Z(cb2,FW-7,15,9,1);Z(fs,CX,17,9,1);Z(ss,10,7,8);B(mlb);Z(de1,12,6,7);Z(nb,FW-10,7,8);Z(wlb,CX+4,8,6);at(mlb,CX-1,ly+3.5);break;
    case'C4':Z(cb1,6,14,7,1,'match');Z(ss,CX-7,15,7,1,'match');Z(fs,CX+7,15,7,1,'match');Z(cb2,FW-6,14,7,1,'match');Z(nb,FW-10,6,8);Z(mlb,CX-5,8,7);Z(wlb,CX+4,8,7);break;
    default:/* C6: quarters to the left, cover 2 to the right */
      Z(cb1,6,14,7,1,'match');Z(ss,CX-7,15,7,1,'match');Z(fs,FW*0.75,16,13,1);Z(cb2,FW-5,5,8);Z(nb,CX+8,7,7);Z(mlb,CX-5,8,7);Z(wlb,CX+2,9,6);at(fs,CX+9,ly+13);
  }
}
function setupDefense(D,ly,L,call){
  const P={};for(const[s]of DSLOTS)P[s]=addE(L,D,s,'d',s.startsWith('D')?'DL':s.endsWith('LB')?'LB':s==='NB'?'NB':s.startsWith('CB')?'CB':'S',CX,ly+1.2);
  [['DE1',CX-5.2],['DT1',CX-1.3],['DT2',CX+1.4],['DE2',CX+7]].forEach(([s,x])=>{P[s].x=P[s].hx=x;P[s].y=P[s].hy=ly+1.2;});
  assignCoverage(call.id,P,{X:G.X,Z:G.Z,SL:G.SL,TE:G.te,RB:G.rb},ly);
  for(const d of L.filter(e=>e.side==='d')){
    d.blitz=d.cover.type==='blitz';
    const cov=d.pl.cov;
    d.react=d.cover.type==='zone'?rnd(0.14,0.24)+(90-cov)*0.002:rnd(0.24,0.36)+(90-cov)*0.002;
    d.tau=clamp(0.34-(cov-60)*0.005,0.14,0.34)+rnd(-0.03,0.03);d.spdF=rnd(0.92,1.0);
    d.read=d.role==='LB'?0.5:d.role==='DL'?0:0.8;
    try{gpCoverTune(d);}catch(e){}
  }
}
function resetBall(){
  Object.assign(G,{im:null,cm:null,cball:null,celebPick:null,rtp:false,pendingFoul:null,injNote:null,fumbleBy:null,prevCarrierSide:'o',kickRecovered:false,seq:null,carrier:null,ballState:'pre',air:null,loose:null,kick:null,snapB:null,seq:null,aim:null,ptype:'lob',bullet:false,lob:true,fouls:[],flags:[],parts:[],cele:null,picker:null,fair:false,turnover:false,kneelOK:0,krFrom:null,prFrom:null,catchY:null,helmets:[]});
  if(!SEVENS())for(const T of G.teams||[])for(const q of T.roster)if(q.helmetOff)q.helmetOff=false;
}

