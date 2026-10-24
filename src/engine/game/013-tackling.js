/* ===================== tackling ===================== */
function startLunge(f,c,type){f.lunge=type==='shoe'||type==='ankle'?0.34:type==='hit'||type==='jump'?0.26:0.3;f.lungeDur=f.lunge;f.lt=type;f.dir=Math.sign((c.y-f.y)*(G.flip?-1:1))||f.dir;}
// counters: a disciplined tackler can read the move and take the right angle
//   juke / spin -> low tackle (stays square, takes the legs)   stiff arm / truck -> ankle bite (under the arm, at the shoes)
//   hurdle -> jumping tackle (meets him in the air)
function gpCounterFor(c){if(c.hurdle>0)return'jump';if(c.stiff>0||c.truck>0)return'ankle';if(c.spin>0||G.t-c.jukeT<0.45)return'low';return null;}
function gpCounterChance(f,c,k){const p=f.pl,m=k==='low'?'juke':k==='ankle'?(c.truck>0?'truck':'stiff'):'hurdle';
  const read=0.4*(p.awr||70)+0.35*(p.tkl||70)+0.25*(k==='jump'?(p.spd||70):(p.agi||70))-gpMoveSkill(m,c)*0.85+gpDefMods(p).resist*120;
  return clamp(0.3+read*0.012-gpFat(f)*0.25+gpFat(c)*0.2,0.06,0.7);}
function chooseTackle(f,c){
  {const k=gpCounterFor(c);if(k&&Math.random()<gpCounterChance(f,c,k)){f.ctr=k;return k;}}
  const fv=Math.hypot(f.vx,f.vy)||1,cv=Math.hypot(c.vx,c.vy)||1;
  const dot=(f.vx*c.vx+f.vy*c.vy)/(fv*cv),dd=dist(f,c);
  if(dot>0.45&&dd>0.9)return'shoe';
  {const hm=gpDefMods(f.pl).hit;if(dot<-0.35&&fv>f.spd*0.65&&f.pl.tkl>72-hm*100&&Math.random()<0.5+hm*3)return'hit';}
  if(dd>1.1)return'dive';
  return'wrap';
}
function resolveTackle(f,c,type){
  if(type==='low'||type==='ankle'||type==='jump'){
    // a counter beats the move it reads
    const p0={low:0.84,ankle:0.8,jump:0.78}[type]+(f.pl.tkl-75)*0.005+gpTackleMod(f,c,type)-gpFat(f)*0.12+gpFat(c)*0.08;
    f.ctr=null;
    if(Math.random()<clamp(p0,0.35,0.97)){flash({low:'Low tackle!',ankle:'Ankle tackle!',jump:'Met him in the air!'}[type]);c.spin=0;c.stiff=0;c.truck=0;c.juke=0;if(type==='jump')c.hurdle=0;startSeq(c,f,type==='jump'?'hit':type==='ankle'?'shoe':'wrap');if(G.seq)G.seq.ctr=type;return;}
    f.down=true;f.downT=0.8;f.lunge=0;f.downAnim='tackle_dive';dust(c.x,c.y,6);c.slow=0.15;if(type!=='jump'&&gpLegGrab(f,c))return;flash('Missed the tackle!');return;}
  let p={wrap:0.87,hit:0.8,shoe:0.77,dive:0.81}[type]+(f.pl.tkl-75)*0.0065+gpTackleMod(f,c,type);
  p-=type==='shoe'||type==='dive'?(gpElu(c.pl)-80)*0.005:(gpBtk(c.pl)-70)*0.006;
  p+=-gpFat(f)*0.14+gpFat(c)*0.1;
  if(f.tkL>2.2)p-=(f.tkL-2.2)*0.07;f.tkL=0; // the user's long dive from out of reach
  let why='Broke a tackle!';
  if(c.stiff>0&&type!=='shoe'){p-=gpMove('stiff',c,f);why='Stiff arm!';}
  if(c.truck>0&&(type==='wrap'||type==='hit')){p-=gpMove('truck',c,f);why='Trucked!';}
  if(c.truck>0&&(type==='shoe'||type==='dive'))p+=0.12;
  if(c.hurdle>0&&(c.jz||0)>0.2&&(type==='shoe'||type==='dive')){p=gpHurdleP(c,f);why='Hurdled him!';}
  if(c.hurdle>0&&(type==='wrap'||type==='hit'))p+=0.1;
  if(c.spin>0){p-=gpMove('spin',c,f);why='Spin move!';}
  if(G.t-c.jukeT<0.3){p-=gpMove('juke',c,f);why='Juked him!';}
  if(foesOf(c).some(o=>o!==f&&dist(o,c)<1.6))p+=0.15;
  if(f===G.uctl)p+=0.08;
  if(Math.random()<clamp(p,0.08,0.97)){startSeq(c,f,type);return;}
  f.down=true;f.downT=0.9;f.lunge=0;f.downAnim=why==='Trucked!'?'tackled':'tackle_dive';if(why==='Trucked!'){f.fall='back';f.vx=c.vx*0.5;f.vy=c.vy*0.5;G.cheer=0.8;}dust(c.x,c.y,why==='Trucked!'?12:6);c.slow=why==='Trucked!'?0.35:0.2;
  if(why==='Stiff arm!'){f.vx=-c.vx*0.3;f.vy=-c.vy*0.3;}
  if((type==='dive'||type==='shoe')&&why!=='Hurdled him!'&&why!=='Trucked!'&&gpLegGrab(f,c))return;
  flash(why);
}
/* ===================== v2.17 the user's tackle types ===================== */
// form tackle: short reach, the surest way down, little gained after contact
// hit stick: launches through the runner, knocks him back and can jar the ball loose; whiffs and bounces off more often
// ankle bite: a long dive at the legs, the farthest reach and good against fast runners, but it often only trips him up
const UTK={form:{reach:2.1,v:6.7,r:0.85,dur:0.42},stick:{reach:2.6,v:7.6,r:0.85,dur:0.42},bite:{reach:3.7,v:7.6,r:1.05,dur:0.6}};
function gpTkReach(u,k){const p=u.pl,b=((p.spd||75)-75)*0.012+((p.tkl||70)-75)*0.006;return k?UTK[k].reach+b*(k==='bite'?1.4:1):4.2+b;}
// launch at where the runner will be: a long dive takes longer to get there
function gpUserLunge(u,c,k,dd){
  u.tkL=dd;u.tkSpr=gpSprintOn();u.tkBuf=null;
  const cs=Math.hypot(c.vx,c.vy);
  if(!k){if(dd<2.8)startLunge(u,c,chooseTackle(u,c));else{startLunge(u,c,'dive');const s=Math.max(6.8,cs+1);u.lunge=u.lungeDur=clamp(gpIntercept(u,c,s,0.62)-0.05,0.3,0.62);}return;}
  const K=UTK[k],s=Math.max(K.v*(u.tkSpr?1.05:1),cs+(k==='bite'?1.8:0.8));
  u.lt=k;u.lunge=u.lungeDur=clamp(gpIntercept(u,c,s,K.dur)-K.r/s+0.1,0.24,K.dur);u.dir=Math.sign((c.y-u.y)*(G.flip?-1:1))||u.dir;
  if(k==='stick')dust(u.x,u.y,3);
}
// when a man launched at speed s meets the runner (capped at what is left of the dive)
function gpIntercept(e,c,s,T){const rx=c.x-e.x,ry=c.y-e.y,a=c.vx*c.vx+c.vy*c.vy-s*s,b=2*(rx*c.vx+ry*c.vy),q=rx*rx+ry*ry;
  let t=T;if(Math.abs(a)<1e-6)t=b<0?-q/b:T;else{const D=b*b-4*a*q;if(D>=0){const r1=(-b-Math.sqrt(D))/(2*a),r2=(-b+Math.sqrt(D))/(2*a),m=[r1,r2].filter(x=>x>0);if(m.length)t=Math.min(...m);}}
  return clamp(t,0,T);}
// a press while the runner is out of reach (or while shedding a block) waits a moment and fires once he comes into range
function gpTkBufStep(){
  const u=G.uctl,c=G.carrier,B=u&&u.tkBuf;if(!B)return;
  if(G.t>B.t||!c||u.down||u.lunge>0){u.tkBuf=null;if(G.t>B.t&&c&&!u.down&&!(u.lunge>0))flash('Out of reach');return;}
  const dd=dist(u,c);if(dd<=gpTkReach(u,B.k)&&!(u.stun>0)&&!(u.eng>0))gpUserLunge(u,c,B.k,dd);
}
// the odds for each type: tackling, hit power, speed and strength against the runner's balance, elusiveness, speed and
// strength, plus the angle, how far he had to launch, the runner's move, archetypes, traits and fatigue
function gpTkP(f,c,k){
  const p=f.pl,q=c.pl,dm=gpDefMods(p),tk=p.tkl||70,hp=p.hpw||p.str||70,el=gpElu(q),bt=gpBtk(q),csp=q.spd||75;
  const cv=Math.hypot(c.vx,c.vy),ux=f.x-c.x,uy=f.y-c.y,ul=Math.hypot(ux,uy)||1,face=cv>1?(c.vx*ux+c.vy*uy)/(cv*ul):0; // 1: he runs right at you, -1: you chase him
  const L=Math.max(0,(f.tkL||0)-1.2),spr=f.tkSpr?1:0;let P,why='Broke a tackle!';
  if(k==='form')P=0.86+(tk-75)*0.008+((p.awr||70)-70)*0.002-(bt-70)*0.004-(el-80)*0.003-L*0.06+face*0.03-spr*0.04+gpTackleMod(f,c,'wrap');
  else if(k==='stick')P=0.62+(hp-75)*0.008+(tk-75)*0.003+((p.str||70)-(q.str||70))*0.003-(bt-70)*0.004-(el-80)*0.005-L*0.08+face*0.1+dm.hit*0.6+spr*0.04+gpTackleMod(f,c,'hit');
  else P=0.47+(tk-75)*0.006+((p.spd||75)-80)*0.003+(csp-80)*0.004-(bt-70)*0.006-(el-80)*0.002-L*0.035+gpTackleMod(f,c,'shoe');
  P+=-gpFat(f)*0.14+gpFat(c)*0.1;
  const m={form:{stiff:0.8,truck:1,spin:0.7,juke:0.8},stick:{stiff:1,truck:1.2,spin:1.2,juke:1.3},bite:{stiff:0,truck:0,spin:0.6,juke:0.7}}[k];
  if(c.stiff>0&&m.stiff){P-=gpMove('stiff',c,f)*m.stiff;why='Stiff arm!';}
  if(c.truck>0){if(m.truck){P-=gpMove('truck',c,f)*m.truck;why='Trucked!';}else P+=0.12;}
  if(c.hurdle>0&&(c.jz||0)>0.2){if(k==='bite'){P=gpHurdleP(c,f);why='Hurdled him!';}else P+=0.1;}
  if(c.spin>0){P-=gpMove('spin',c,f)*m.spin;why='Spin move!';}
  if(G.t-c.jukeT<0.3){P-=gpMove('juke',c,f)*m.juke;why='Juked him!';}
  if(foesOf(c).some(o=>o!==f&&!o.down&&dist(o,c)<1.6))P+=0.12;
  return{P:clamp(P,k==='form'?0.3:0.08,k==='form'?0.97:k==='stick'?0.9:0.8),why};
}
function gpResolveUser(f,c,k){
  const{P,why}=gpTkP(f,c,k),r=Math.random();f.lunge=0;f.jz=0;G.tkLast={k,P,r,f,c};
  if(r<P){c.spin=0;c.stiff=0;c.truck=0;c.juke=0;if(k==='bite'){c.hurdle=0;flash('Ankle bite!');}startSeq(c,f,k==='form'?'wrap':k==='stick'?'hit':'shoe',k);G.tkLast.res=G.seq?'tackle':G.phase!=='live'?'out':'tackle';return;}
  if(k==='bite'){const pt=clamp(0.34+((f.pl.tkl||70)-75)*0.004+((c.pl.spd||75)-80)*0.004-(gpBtk(c.pl)-70)*0.004+gpFat(c)*0.1,0.15,0.5);
    f.down=true;f.downT=0.9;f.downAnim='tackle_dive';dust(c.x,c.y,6);
    if(why!=='Hurdled him!'&&r<P+pt){gpTrip(c,f,'trip');flash('Tripped him up!');G.tkLast.res='trip';return;}
    c.slow=0.12;flash(why==='Broke a tackle!'?'Missed the ankles!':why);G.tkLast.res='miss';return;}
  if(k==='stick'&&r<P+0.12&&why!=='Juked him!'){f.down=true;f.downT=0.8;f.downAnim='tackled';f.fall='back';f.vx=-c.vx*0.3;f.vy=-c.vy*0.3;dust(c.x,c.y,10);gpTrip(c,f,'bounce');try{SFX.hit(true);}catch(e){}flash('Bounced off the hit!');G.cheer=Math.max(G.cheer,0.5);G.tkLast.res='bounce';return;}
  if(k==='form'&&r<P+0.15){f.stun=0.4;f.vx*=0.3;f.vy*=0.3;c.slow=0.3;dust(c.x,c.y,4);flash('Slipped off the tackle');G.tkLast.res='slip';return;}
  f.down=true;f.downT=k==='stick'?1.1:0.7;f.downAnim=k==='form'?'tackle':'tackle_dive';dust(c.x,c.y,6);c.slow=k==='stick'?0.08:0.18;
  flash(k==='stick'&&why==='Broke a tackle!'?'Whiffed on the big hit!':why);G.tkLast.res='miss';
}
// a runner tripped (or held by the leg) stumbles: slower and no moves for a moment. Break-tackle, agility and strength
// shake it off sooner; a defender who keeps hold of the leg can still finish the tackle.
function gpTrip(c,f,kind){
  const q=c.pl,p=f.pl,brk=clamp(0.5+(gpBtk(q)-70)*0.008+((q.agi||75)-75)*0.006+((q.str||70)-(p.str||70))*0.004-((p.tkl||70)-75)*0.005-gpFat(c)*0.2,0.15,0.85);
  const d=(kind==='grab'?0.6:kind==='bounce'?0.42:0.62)*(1.3-brk*0.6);
  c.trip=d;c.tripD=d;c.tripK=kind;c.tripBy=f;c.tripFin=kind==='grab'&&Math.random()>brk;c.slow=Math.max(c.slow||0,d);c.moveCD=Math.max(c.moveCD||0,d);c.juke=0;c.spin=0;c.truck=0;
  dust(c.x,c.y,7);G.tripN=(G.tripN||0)+1;
}
function gpTripStep(c,dt){
  if(!(c.trip>0))return false;c.trip-=dt;const f=c.tripBy;
  if(c.tripK==='grab'&&f&&!f.hurt){const k=Math.exp(-dt*12),ad=attackDir(c);c.vx*=k;c.vy*=k;f.x=lerp(f.x,c.x,0.25);f.y=lerp(f.y,c.y-ad*0.75,0.25);f.vx=c.vx;f.vy=c.vy;f.down=true;f.downT=Math.max(f.downT||0,0.4);}
  if(c.trip<=0){c.trip=0;if(c.tripK==='grab'){if(c.tripFin&&f&&!f.hurt){startSeq(c,f,'shoe');return true;}flash('Broke free!');}}
  return false;
}
// an AI defender's missed dive at a human ball carrier can still get a hand on a leg: he holds on, or trips him up
function gpLegGrab(f,c){
  if(SEVENS()||G.test||isAI(c.team)||pcAI(c)||f===G.uctl&&!isAI(f.team)||c.trip>0||c.dive>0)return false;
  const pg=clamp(0.38+((f.pl.tkl||70)-75)*0.008-(gpBtk(c.pl)-70)*0.005-(gpElu(c.pl)-80)*0.003-gpFat(f)*0.1,0.15,0.6);
  if(Math.random()>=pg)return false;
  const grab=Math.random()<0.45;gpTrip(c,f,grab?'grab':'trip');flash(grab?'He grabs the leg!':'Tripped up!');return true;
}
// sprint: hold it to close faster (no cooldown); a sprinting man turns wider
const SPRINT=1.09;
function gpSprintOn(){const u=G.uctl;if(!u)return false;if(ON&&u.team!==G.me)return!!(G.rjoy&&G.rjoy.sp&&G.time-G.rjoy.t<1.5);
  return G.sprintBtn!=null||keys.has(kb('sprint'))||G.time-(G.padSprT||-9)<0.2;}
// tackle-type animation: the sprite and a lean / dip on top of it
function gpTkAnim(e,A){
  const S=G.seq;
  if(S&&S.v&&S.fs[0]===e){const u=S.t/S.dur;if(S.v==='stick')return u<0.35?A('truck',0.5+u):A('tackle',0.3+0.7*u);if(S.v==='form')return A('tackle',0.25+0.75*u);return A('tackle_dive',0.4+0.6*u);}
  if(e.lunge>0&&UTK[e.lt]){const u=1-e.lunge/(e.lungeDur||0.4);return e.lt==='stick'?A('truck',u):e.lt==='form'?A('tackle',0.05+0.45*u):A('tackle_dive',0.1+0.8*u);}
  if(e.trip>0&&e===G.carrier&&!e.down){const u=1-e.trip/(e.tripD||0.6);return A('tackled',0.04+0.22*Math.sin(Math.PI*u));}
  return null;
}
function gpTkFx(e,dir){
  const o={rot:0,sq:1,jz:0},d=dir||1,S=G.seq;
  if(e.lunge>0&&UTK[e.lt]){const u=clamp(1-e.lunge/(e.lungeDur||0.4),0,1),s=Math.sin(Math.PI*u);
    if(e.lt==='stick'){o.rot=0.3*d*Math.min(1,u*2);o.jz=0.14*s;}else if(e.lt==='form')o.rot=0.1*d*s;else{o.rot=0.22*d*u;o.sq=1-0.08*u;}}
  else if(S&&S.v==='stick'&&S.fs[0]===e){const u=S.t/S.dur;o.rot=0.28*d*Math.sin(Math.PI*Math.min(1,u*1.4));}
  else if(e.trip>0&&e===G.carrier&&!e.down){const u=clamp(1-e.trip/(e.tripD||0.6),0,1),s=Math.sin(Math.PI*u);o.rot=0.42*d*s;o.sq=1-0.08*s;}
  return o;
}
// a defender coming from the inside can shove a carrier near the sideline out of bounds instead of tackling him
function gpPushOut(c,f){
  if(!c||!f||c.dive>0||c.slideT>0||(c.ca&&c.ca.type==='dive'))return false;
  const out=c.x<CX?-1:1,edge=out<0?c.x:FW-c.x;if(edge>4.2)return false;
  if((f.x-c.x)*out>0.4)return false; // he has to come from the field side
  const p=clamp(0.25+0.45*(1-edge/4.2)+((f.pl.str||70)-(c.pl.str||70))*0.006+((f.pl.tkl||70)-70)*0.003,0.12,0.88);
  if(Math.random()>p)return false;
  const ad=attackDir(c);G.gpTk=f.pl;
  G.seq={c,fs:[f],type:'push',t:0,dur:1.0,spot0:c.y,ad,out};c.seqLock=true;c.tk='push';f.tk='push';f.lunge=0;
  c.vx=out*Math.max(6.5+((f.pl.str||70)-60)*0.04,edge/0.45);c.vy=c.vy*0.55;f.vx=out*4;dust(c.x,c.y,8);flash('Knocked out of bounds!');G.cheer=0.3;
  return true;
}
// v: the user's tackle type ('form', 'stick', 'bite') on top of the base type, for its own push, fumble odds and animation
function startSeq(c,f,type,v){if(c&&c.dive>0)c.dive=0;c.trip=0;
  if(type!=='hit'&&c===G.carrier&&G.ballState==='carrier'&&!(c===G.qb&&c.tkType==='sack')&&gpPushOut(c,f))return;
  G.gpTk=f.pl;
  const ad=attackDir(c);
  G.seq={c,fs:[f],type,v:v||null,t:0,dur:v==='form'?0.5:{wrap:0.6,hit:0.45,shoe:0.5,dive:0.45}[type],spot0:c.y,ad};
  c.seqLock=true;c.tk=type;f.tk=type;f.lunge=0;
  try{gpTackleStyle(c,f,type);}catch(e){}
  try{SFX.hit(type==='hit');if(type==='hit')SFX.gasp();}catch(e){}
  if(type==='hit')try{gpHelmetPop(c,f);}catch(e){}
  if(type==='hit'){c.vx=-ad*3.2;c.vy*=0.2;c.vy=-ad*(v==='stick'?4.4:3.2);flash(v==='stick'?'Hit stick!':'Big hit!');G.cheer=v==='stick'?1:0.6;}
  else if(type==='shoe'){c.vy=ad*3;}
  else{c.vy=ad*(v==='form'?1.1:1.9);c.vx*=0.4;}
  dust(c.x,c.y,v==='stick'?14:10);
  const fm=v==='stick'?1.8*(1+gpDefMods(f.pl).hit*2):1,wm=v==='form'?0.5:1;
  if((type==='hit'&&Math.random()<0.055*fm*WX.fum*((f.pl.hpw||f.pl.str)/80)*(85/Math.max(50,c.pl.car||c.pl.str))*slf(c.team,'fum',0.7))||(type!=='hit'&&c===G.carrier&&G.ballState==='carrier'&&!(c===G.qb&&c.tkType==='sack')&&Math.random()<WX.wrapFum*wm*slf(c.team,'fum',0.7))){
    G.prevCarrierSide=c.side;G.loose={x:c.x,y:c.y,h:1.2,vx:rnd(-3,3),vy:-ad*rnd(1,4),vh:3,kind:'fumble',t:0};
    G.carrier=null;G.ballState='loose';flash('FUMBLE!');G.fumbleBy=c;
  }
  if(Math.random()<0.009&&(type==='wrap'||type==='dive')){G.fouls.push({team:f.team===G.offTeam?G.offTeam:1-G.offTeam,kind:'Facemask',yds:15,afd:f.side==='d',endSpot:true});throwFlag(nearestRef(c));}
  injuryCheck(c,type==='hit'?0.012:0.004);injuryCheck(f,0.003);
}
function seqStep(dt){
  const S=G.seq;S.t+=dt;const c=S.c;
  if(S.type==='push'){c.vx*=Math.exp(-dt*0.6);c.vy*=Math.exp(-dt*3);for(const f of S.fs){f.vx=c.vx*0.55;f.vy=c.vy*0.5;}
    const spot=S.ad>0?Math.max(S.spot0,Math.min(c.y,S.spot0+1.5)):Math.min(S.spot0,Math.max(c.y,S.spot0-1.5));
    if(c.x<0.2||c.x>FW-0.2||S.t>=S.dur){c.seqLock=false;c.tk=null;for(const f of S.fs)f.tk=null;G.seq=null;
      if(c.x<0.2||c.x>FW-0.2){c.oobT=0.9;endPlay({type:'oob',spot});}else{c.down=true;c.downAnim='tackled';c.fall='side';endPlay({type:'tackle',spot});}}
    return;}
  const f0=Math.exp(-dt*(S.type==='hit'?5:3));c.vx*=f0;c.vy*=f0;
  S.fs.forEach((f,i)=>{const o=S.type==='hit'?-0.8:-0.9;f.x=lerp(f.x,c.x+(i?0.6:0),0.3);f.y=lerp(f.y,c.y+S.ad*o*(i?-1:1),0.3);f.vx=c.vx;f.vy=c.vy;});
  if(S.t>0.12)for(const o of G.ents)if(o.side!==c.side&&!o.down&&!o.hurt&&!S.fs.includes(o)&&dist(o,c)<1.5&&S.fs.length<3){S.fs.push(o);o.tk='wrap';o.lunge=0;if(S.fs.length===2)flash('Gang tackle');}
  if(S.t>=S.dur){
    c.down=true;c.seqLock=false;c.fall=S.type==='hit'?'back':'fwd';c.downAnim='tackled';try{gpDownStyle(c);gpDownDetail(c);}catch(e){}
    S.fs.forEach(f=>{if(S.type!=='hit'){f.down=true;f.downT=0;f.downAnim=S.type==='dive'||S.type==='shoe'?'tackle_dive':'tackle';}f.tk=null;});
    const spot=S.type==='hit'?S.spot0:(S.ad>0?Math.max(S.spot0,c.y):Math.min(S.spot0,c.y));
    G.seq=null;
    if(G.carrier===c)endPlay({type:'tackle',spot});
    else if(!G.loose)endPlay({type:'tackle',spot});
  }
}
function injuryCheck(e,p){
  if(!e.pl||e.hurt||Math.random()>p)return;
  e.hurt=true;const kinds=[['ankle',[4,14]],['knee',[10,99]],['hamstring',[6,20]],['shoulder',[5,16]],['concussion protocol',[99,99]]];
  const[k,r]=pick(kinds);e.pl.inj={type:k,plays:ri(r[0],r[1])};G.injNote=`${e.pl.num} ${nm(e.pl)} is hurt (${k})`;
}

/* ===================== penalties & refs ===================== */
function nearestRef(e){let b=G.refs[0],bd=1e9;for(const r of G.refs){const d=dist(r,e);if(d<bd){bd=d;b=r;}}return b;}
function throwFlag(ref){
  if(!ref)return;ref.flagT=0.45;try{SFX.flag();}catch(e){}
  const[wx,wy]=toW(ref.x,ref.y);
  G.flags.push({x:wx,y:wy,h:2.2,vx:rnd(-2,2),vy:(G.carrier?(G.flip?-1:1):1)*rnd(1,3),vh:5});
}
function refsStep(dt){
  const ball=G.carrier||G.kick&&G.kick.cur||G.air&&G.air.cur||G.loose||G.qb||{x:CX,y:G.linesW?G.linesW.los:60};
  for(const r of G.refs){
    let tx=r.hx,ty=r.hy;
    if(r.slot==='HL'||r.slot==='LJ'){ty=ball.y;tx=r.slot==='HL'?-1.8:FW+1.8;}
    else if(r.slot==='BJ'){let deep=r.hy;for(const e of G.ents)if(e.y+6>deep)deep=Math.min(122,e.y+6);ty=Math.max(r.hy,deep);}
    else if(r.slot==='R'&&G.carrier){ty=G.carrier.y-8*attackDir(G.carrier);tx=G.carrier.x+4;}
    const v=desire(r,tx,ty,r.slot==='BJ'?5:4.2);accel(r,v[0],v[1],dt,14);r.x+=r.vx*dt;r.y+=r.vy*dt;r.anim+=Math.hypot(r.vx,r.vy)*dt*2;
    if(r.flagT>0)r.flagT-=dt;
  }
  for(const f of G.flags){if(f.h>0){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vh-=14*dt;f.h=Math.max(0,f.h+f.vh*dt);}}
}

/* ===================== live update ===================== */
function updateLive(dt){
  G.t+=dt;
  gpThrowTick(dt);
  for(const e of G.ents){
    if(e.stun>0)e.stun-=dt;if(e.engCD>0)e.engCD-=dt;if(e.relT>0)e.relT-=dt;if(e.jam>0)e.jam-=dt;if(e.plant>0)e.plant-=dt;
    if(e.slip>0)e.slip-=dt;
    if(e.spin>0)e.spin-=dt;if(e.stiff>0)e.stiff-=dt;if(e.truck>0)e.truck-=dt;if(e.hurdle>0)e.hurdle-=dt;if(e.moveCD>0)e.moveCD-=dt;if(e.catchT>0)e.catchT-=dt;
    if(e.eng>0){e.eng-=dt;if(e.eng<=0){e.engCD=2.0;e.freeAt=G.t;if(e.side==='d'&&(G.ballState==='qb'||G.ballState==='snap')&&e.blockedBy){e.beat=e.blockedBy;e.beatT=G.t+0.7;}}}
    if(e.down&&e.downT>0){e.downT-=dt;if(e.downT<=0&&!e.hurt){e.down=false;e.stun=0.3;}}
    if(e.side==='o'&&e.role!=='OL'){e.hist.push({t:G.t,x:e.x,y:e.y,vx:e.vx,vy:e.vy});if(e.hist.length>90)e.hist.shift();}
  }
  for(const b of G.ents)if(b.engWith&&(b.engWith.eng<=0||b.engWith.down))b.engWith=null;
  const P=G.play;
  if(P.special){for(const e of G.ents)accel(e,0,0,dt,30);if(G.t>(P.special==='kneel'?1.0:0.7)){G.carrier=P.special==='kneel'?G.qb:null;endPlay(P.special==='kneel'?{type:'tackle',spot:G.qb.y}:{type:'inc'});}refsStep(dt);return;}
  if(G.pendingFoul&&G.t>G.pendingFoul.t){const f=G.pendingFoul;G.pendingFoul=null;G.fouls.push(f);throwFlag(G.refs[0]);}
  // ball states
  if(G.ballState==='snap'){
    const S=G.snapB;S.t+=dt;
    if(S.t>=S.T){
      if(S.dest==='pp'&&P.fake){gpFakeGo(P.fakeMan||P.punter);}
      else if(S.dest==='punter'&&P.fake){gpFakeGo(P.punter);}
      else if(S.dest==='holder'&&P.fake){gpFakeGo(P.holder);}
      else if(S.dest==='punter'){G.ballState='punter';P.holdT=G.t;}
      else if(S.dest==='holder'){G.ballState='held';}
      else if(P.kind==='scrimmage'&&S.bad){gpBadSnapLand(S);}
      else if(P.kind==='scrimmage'){
        G.ballState='qb';setCtl();
        if(P.off.kind==='run'&&P.off.data.qb){G.carrier=G.qb;G.qb.path=P.off.data.path.map(([dx,dy])=>[CX+dx,G.linesW.los+dy]);{const lp=P.off.data.path[P.off.data.path.length-1];G.qb.pathFull=!!(lp&&Math.abs(lp[0])>=8);}G.qbCarT=G.t;G.ballState='carrier';setCtl();}
      }
    }
  }
  if(G.ballState==='tee'&&G.t>=P.kickAt&&P.onside){launchOnside();P.kicker.relT=0.4;P.kicker.kickT=0.5;}
  else if(G.ballState==='tee'&&G.t>=P.kickAt){launchKick('kickoff',[CX,P.kicker.y],P.kres||kickResult(P.kicker,rnd(0.75,1),rnd(-0.3,0.3)));P.kicker.relT=0.4;P.kicker.kickT=0.5;}
  if(G.ballState==='punter'&&G.t-P.holdT>0.9){
    if(foesOf(P.punter).some(f=>dist(f,P.punter)<1)&&Math.random()<0.5){flash('BLOCKED!');G.loose={x:P.punter.x,y:P.punter.y+1,h:1,vx:rnd(-2,2),vy:-3,vh:3,kind:'fumble',t:0};G.prevCarrierSide='d';G.ballState='loose';}
    else{launchKick('punt',[P.punter.x,P.punter.y],P.kres||kickResult(P.punter,rnd(0.7,1),rnd(-0.25,0.25)));P.punter.kickT=0.5;}
  }
  if(G.ballState==='held'&&G.t>1.2){launchKick('fg',[P.holder.x,P.holder.y+0.3],P.kres||gpAiKick(P.kicker));P.kicker.kickT=0.5;}
  if(G.ballState==='air'){airStep(dt);if(G.phase!=='live')return;}
  if(G.ballState==='kick'){kickStep(dt);if(G.phase!=='live')return;}
  if(G.ballState==='loose'){looseStep(dt);if(G.phase!=='live')return;}
  if(P.kind==='scrimmage'&&G.ballState==='qb'){
    const RD=P.off.data;
    if(P.off.kind==='pass'&&RD.touch&&G.moMan&&!G.pendThrow&&!G.gpThrown&&G.t>0.3){const m=G.moMan;throwTo(m.x+m.vx*0.3,m.y+m.vy*0.3+0.3,false,0.3);}
    else if(P.off.kind==='run'&&G.rb&&!(RD.option&&G.t<0.45)&&(RD.jet?(G.t>0.25&&(Math.abs(G.rb.x-G.qb.x)<2||G.t>0.7)):(RD.toss&&G.t>0.3||dist(G.rb,G.qb)<1.3||G.t>(RD.delay||0)+0.5))&&G.t>(RD.delay||0)+0.25){
      let keep=false;
      if(RD.option){const de=G.ents.find(d=>d.slot==='DE2');keep=!!de&&(de.x<CX+6.2||de.eng<=0&&Math.abs(de.x-G.rb.x)<3.5);if(Math.random()<0.15)keep=!keep;}
      if(keep){G.carrier=G.qb;G.ballState='carrier';G.qb.path=RD.keep.map(([dx,dy])=>[CX+dx,G.linesW.los+dy]);flash('QB keeps it!');setCtl();}
      else{G.carrier=G.rb;G.ballState='carrier';G.rb.path=RD.path.map(([dx,dy])=>[CX+dx,G.linesW.los+dy]);{const lp=RD.path[RD.path.length-1];G.rb.pathFull=!!(RD.jet||RD.toss||(lp&&Math.abs(lp[0])>=8));}setCtl();}
    }else if(P.off.kind==='pass'&&(isAI(G.offTeam)||G.test||pcAIQB()))aiQB(dt);
  }
  if(G.seq){seqStep(dt);if(G.phase!=='live')return;}
  // movement
  const c=G.carrier;
  for(const e of G.ents){
    if(e===c){controlCarrier(e,dt);if(G.phase!=='live')return;continue;}
    if(e.down||e.hurt||(G.seq&&G.seq.fs.includes(e))){accel(e,0,0,dt,40);continue;}
    if(e.lunge>0&&c){
      e.lunge-=dt;if(e.lt==='jump')e.jz=Math.max(0,Math.sin(Math.PI*clamp(1-e.lunge/(e.lungeDur||0.26),0,1))*0.9);
      const K=UTK[e.lt],aim=K||e.tkL>2.8,cs=Math.hypot(c.vx,c.vy),s=K?Math.max(K.v*(e.tkSpr?1.05:1),cs+(e.lt==='bite'?1.8:0.8)):e.tkL>2.8?Math.max(6.8,cs+1):e.lt==='hit'?7:6.6;
      const ld=aim?gpIntercept(e,c,s,e.lunge+0.15):0,dx=c.x+c.vx*ld-e.x,dy=c.y+c.vy*ld-e.y,l=Math.hypot(dx,dy)||1;e.vx=dx/l*s;e.vy=dy/l*s;
      if(e.lunge<=0){if(e.lt==='form'){e.stun=0.35;e.vx*=0.4;e.vy*=0.4;}else{e.down=true;e.downT=e.lt==='bite'?0.9:0.8;e.downAnim='tackle_dive';dust(e.x,e.y,4);}e.tkL=0;}
      continue;
    }
    if(gpGodPickStep(e,dt))continue;
    let v;
    if(e.slip>0&&e!==G.uctl){const f0=Math.exp(-dt*2.2);accel(e,e.vx*f0,e.vy*f0,dt);continue;}
    if(e===G.uctl&&G.joyV&&!e.down){v=G.joyV;}
    else if(e===G.qb&&G.pocketV&&G.ballState==='qb'&&!e.down){v=G.pocketV;}
    else if(G.ballState==='loose'&&G.loose.kind!=='inc'&&G.loose.kind!=='onside')v=looseBrain(e);
    else if(G.ballState==='carrier')v=e.side===c.side?blockerSeek(e):pursuit(e,c);
    else if(P.kind==='kickoff')v=kickoffBrain(e);
    else if(P.kind==='punt')v=puntBrain(e);
    else if(P.kind==='fg'||P.kind==='xp')v=fgBrain(e);
    else v=e.side==='o'?offBrain(e):defBrain(e);
    if(G.ballState==='carrier'&&P.kind==='scrimmage'&&e.side==='d'&&c.side==='o'&&G.t<e.read&&P.off.kind==='run'&&e.cover&&e.cover.type!=='rush'&&e.cover.type!=='blitz')v=coverBrain(e);
    else if(G.ballState==='carrier'&&P.kind==='scrimmage'&&e.side==='d'&&c===G.qb&&e!==G.uctl&&gpQbScrHold(e,c))v=coverBrain(e);
    else if(G.ballState==='carrier'&&P.kind==='scrimmage'&&e.side==='d'&&c===G.qb&&e!==G.uctl&&P.off.kind==='pass'&&!e.engWith&&(!e.cover||e.cover.type==='rush'||e.cover.type==='blitz')){const rv=gpRushScr(e,c);if(rv)v=rv;}
    let f=e.stun>0?0.15:e.eng>0?0.1:1;
    // pass rushers: linemen rush under control, blitzers need a beat to time the snap
    if(P.kind==='scrimmage'&&(G.ballState==='qb'||G.ballState==='snap')&&e.side==='d'&&e.cover){
      if(e.cover.type==='rush')f*=0.9;else if(e.cover.type==='blitz')f*=G.t<0.3?0.35:0.88;}
    let px=0,py=0;
    const runPush=P.kind==='scrimmage'&&P.off.kind==='run'||G.ballState==='carrier';
    if(e.eng>0&&e.blockedBy&&runPush&&e.blockedBy.pl){const b=e.blockedBy,dx=e.x-b.x,dy=e.y-b.y,l=Math.hypot(dx,dy)||1,m=1.5*clamp(b.pl.str/e.pl.str,0.7,1.35);px=dx/l*m;py=dy/l*m;}
    accel(e,v[0]*f+px,v[1]*f+py,dt,e===G.uctl&&G.joyV&&gpSprintOn()?e.acc*0.72:0);
  }
  for(const e of G.ents){
    e.x+=e.vx*dt;e.y+=e.vy*dt;const sp=Math.hypot(e.vx,e.vy);e.anim+=sp*dt*2.1;e.run+=sp*dt;if(e.pl&&!e.spd0)e.spd0=e.spd;if(e.spd0)e.spd=e.spd0*(1-Math.min(0.07,Math.max(0,e.run-25)*0.0014*(0.6+gpFat(e))));
    if(e!==c){e.x=clamp(e.x,-2,FW+2);e.y=clamp(e.y,-0.3,120.3);}
  }
  if(c&&!c.seqLock&&Math.random()<dt*10&&Math.abs(c.vy)>3.6)dust(c.x,c.y-0.6*attackDir(c),1,'#a9d98f');
  // separation
  const es=G.ents;
  for(let i=0;i<es.length;i++)for(let j=i+1;j<es.length;j++){
    const a=es[i],b=es[j];
    if(a===c||b===c||a===G.qb||b===G.qb||a.engWith===b||b.engWith===a||a.down||b.down||a.lunge>0||b.lunge>0||a.hurt||b.hurt)continue;
    if((a.beat===b&&G.t<a.beatT)||(b.beat===a&&G.t<b.beatT))continue; // a rusher who won his block is past the blocker
    const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
    if(d>0.01&&d<0.75){
      let wa=0.5,wb=0.5;
      const passPhase=G.ballState==='qb'||G.ballState==='snap'||G.ballState==='air';
      const runner=x=>x.side==='o'&&x.route&&!x.block;
      if(passPhase&&a.side!==b.side&&(runner(a)||runner(b))){
        const r=runner(a)?a:b;
        if(r.y-G.linesW.los>1.2)continue;           // downfield: receivers slip past defenders
        if(r===a){wa=0.15;wb=0.85;}else{wa=0.85;wb=0.15;}
      }
      const p=(0.75-d);a.x-=dx/d*p*wa;a.y-=dy/d*p*wa;b.x+=dx/d*p*wb;b.y+=dy/d*p*wb;
    }
  }
  // blocking engagements
  const protSide=c?c.side:'o';
  for(const b of G.ents){
    if(b.side!==protSide||b===c||b.engWith||b.down||b.hurt||b.role==='QB'||b.role==='K'||b.role==='H'||b.role==='P'||b.role==='KR'||b.role==='PR')continue;
    if(!c&&P.kind==='scrimmage'&&!(b.role==='OL'||b.block))continue;
    if(!c&&(P.kind==='kickoff'))continue;
    for(const d of G.ents){if(d.side===b.side||d.eng>0||d.engCD>0||d.down||d.lunge>0||d===G.uctl&&G.joyV)continue;
      if(dist(b,d)<1.1){d.eng=d.engDur*(c?clamp((b.role==='OL'?0.74:b.fb?0.64:0.5)*gpBlockRatio(b,d)*(gpOutside()&&(d.x-CX)*gpOutside()>2?1.55:1),0.25,1.2):(P.kind==='scrimmage'&&!P.special&&P.off&&P.off.kind==='pass'?gpPassPro(b,d):(b.fb?0.75:1)));b.engWith=d;d.blockedBy=b;dust((b.x+d.x)/2,(b.y+d.y)/2,3);injuryCheck(d,0.0008);gpPancake(b,d,c);break;}}
  }
  // sacks & roughing
  if(P.kind==='scrimmage'&&(G.ballState==='qb'||G.ballState==='snap')){
    for(const d of G.ents)if(d.side==='d'&&d.eng<=0&&d.stun<=0&&!d.down&&dist(d,G.qb)<0.9){
      G.carrier=G.qb;G.ballState='carrier';G.qb.tkType='sack';G.gpSackOL=d.blockedBy&&d.blockedBy.role==='OL'?d.blockedBy:(()=>{let b=null,bd=99;for(const o of G.ents)if(o.role==='OL'&&o.side!==d.side){const k=dist(o,d);if(k<bd){bd=k;b=o;}}return b;})();startSeq(G.qb,d,'wrap');flash('Sacked!');return;
    }
  }
  if(G.ballState==='air'&&G.t-G.throwT<0.45&&!G.rtp){for(const d of G.ents)if(d.side==='d'&&!d.down&&dist(d,G.qb)<0.8){G.rtp=true;if(G.t-G.throwT>0.25&&Math.random()<0.07){G.fouls.push({team:1-G.offTeam,kind:'Roughing the passer',yds:15,afd:true});throwFlag(G.refs[0]);G.qb.down=true;G.qb.downT=1;}break;}}
  if((P.kind==='punt'||P.kind==='fg'||P.kind==='xp')&&(G.ballState==='punter'||G.ballState==='held')){
    const tgt=P.kind==='punt'?P.punter:P.holder;
    if(foesOf(tgt).some(f=>dist(f,tgt)<0.7)&&Math.random()<0.3){flash('BLOCKED!');G.prevCarrierSide='o';G.loose={x:tgt.x,y:tgt.y+1,h:1,vx:rnd(-2,2),vy:P.kind==='punt'?-3:3,vh:3,kind:'fumble',t:0};G.ballState='loose';}
  }
  // carrier contact
  if(G.ballState==='carrier'&&c&&!c.seqLock){
    const ad=attackDir(c);
    if((ad>0&&c.y>=110)||(ad<0&&c.y<=10)){endPlay({type:'td'});return;}
    if(c.x<0.2||c.x>FW-0.2){endPlay({type:'oob',spot:c.y});return;}
    if(c.kneel){endPlay({type:'touchback'});return;}
    if(c.slideT>0){for(const d of G.ents)if(d.side!==c.side&&!d.down&&dist(d,c)<0.8){c.slideT=0;c.down=true;c.slid=true;c.downAnim='qb_slide';c.guDur=0.3;c.downT=0.9;
      if(d.lunge>0&&d.lt==='hit'&&Math.random()<0.12){G.fouls.push({team:1-G.offTeam,kind:'Unnecessary roughness',yds:15,afd:true});throwFlag(nearestRef(c));}
      endPlay({type:'tackle',spot:c.slideSpot});return;}}
    const air=c.dive>0||(c.ca&&c.ca.type==='dive');
    if(gpTripStep(c,dt)&&(G.seq||G.phase!=='live'))return;
    gpTkBufStep();
    if(gpStiffStep(c)&&(G.seq||G.phase!=='live'))return;
    for(const d of G.ents){
      if(d.side===c.side||d.down||d.eng>0||d.stun>0||d.hurt)continue;
      const dd=dist(d,c);
      if(SEVENS()&&dd<0.85){flash('Two-hand touch');endPlay({type:'tackle',spot:c.y});return;} // 7v7: any touch ends it, in the air too
      // airborne over the top: a clean leap clears the man in front; a bad one gets met in the air
      if(c.dive>0&&c.diveK==='over'){const u=1-c.dive/(c.diveT||0.5);if(c.diveClear&&u>0.1&&u<0.9&&!(d.lt==='jump'&&d.lunge>0))continue;if(!c.diveClear&&dd<0.75&&u>0.15){startSeq(c,d,'hit');return;}}
      if(SEVENS()&&d.lunge>0&&dd<1.0){d.lunge=0;d.jz=0;flash('Two-hand touch');endPlay({type:'tackle',spot:c.y});return;}
      if(d.lunge>0){if(dd<(UTK[d.lt]?UTK[d.lt].r:d.lt==='jump'?1.0:0.8)){const t=d.lt||'wrap';d.lunge=0;d.jz=0;if(air){startSeq(c,d,'wrap');return;}if(UTK[t])gpResolveUser(d,c,t);else resolveTackle(d,c,t);if(G.seq||G.phase!=='live')return;}continue;}
      if(c.juke>0&&!(d.ctrRead>G.t))continue;
      if(dd<0.62&&!air&&(d!==G.uctl||!G.joyV||dd<0.5)){if(c.spin>0||c.stiff>0||c.truck>0||c.hurdle>0){resolveTackle(d,c,c.hurdle>0?'dive':'wrap');if(G.seq)return;continue;}startSeq(c,d,'wrap');return;}
      const isUser=d===G.uctl&&!isAI(d.team)&&!G.test;
      const closing=(c.x-d.x)*(d.vx-c.vx)+(c.y-d.y)*(d.vy-c.vy)>0;
      if(!isUser&&!SEVENS()&&dd<1.9&&closing&&!(c.ca&&c.ca.t<0.15)){
        const ux=(c.x-d.x)/dd,uy=(c.y-d.y)/dd,away=c.vx*ux+c.vy*uy,reach=(6.6-away)*0.3;
        if(reach>=dd-0.7)startLunge(d,c,chooseTackle(d,c));
      }
    }
  }
  refsStep(dt);
}
