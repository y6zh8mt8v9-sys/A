/* ===================== AI quarterback ===================== */
function aiQB(dt){
  const q=G.qb;if(G.t<1.05)return;
  q.think=(q.think||0)-dt;if(q.think>0)return;q.think=0.12;
  let best=null,bs=-9,bp=null;
  for(const r of G.recv){
    const D0=dist(q,r),f=flight(D0,D0<14);const px=r.x+r.vx*f.T,py=r.y+r.vy*f.T;
    if(px<1||px>FW-1||py>118)continue;
    let m=99;for(const d of G.ents)if(d.side==='d'&&!d.down)m=Math.min(m,Math.hypot(d.x-px,d.y-py)-d.spd*f.T*0.45);
    let s=m+(py-q.y>G.toGo+2?0.4:0)-(r.role==='RB'?0.4:0)+gpTargetForm(r)+(pcOn()&&pcMe(r)?(G.pcWant?1.8:0.45):0);
    if(s>bs){bs=s;best=r;bp=[px,py,D0<14];}
  }
  G.qbLook=best;
  // Player Career: with top chemistry the quarterback trusts you. Call for the ball and it comes out right away, unless you are blanketed
  if(pcOn()&&G.pcWant){const me=G.recv.find(r=>pcMe(r)),ch=me&&me.pl&&me.pl.chem!=null?me.pl.chem:50;
    if(me&&ch>=85){const D0=dist(q,me),f=flight(D0,D0<14),px=me.x+me.vx*f.T,py=me.y+me.vy*f.T;let m=99;for(const d of G.ents)if(d.side==='d'&&!d.down)m=Math.min(m,Math.hypot(d.x-px,d.y-py)-d.spd*f.T*0.45);
      if(px>=1&&px<=FW-1&&py<=118&&m>(ch>=95?-0.2:0.3)){G.aiRecv=me;G.qbLook=me;throwTo(px,py,D0<14,1.25,userThrowMeter);return;}}}
  // v2.06 the AI quarterback works through his reads like a real one: quick game comes out fast, longer
  // concepts take time to develop. Before his read time he only throws hot, when he feels a rusher.
  if(G.aiReadP!==G.play){G.aiReadP=G.play;const rs=G.recv.map(r=>(r.route&&r.route.name)||'');const quick=rs.filter(n=>/slant|hitch|qout|stick|check|flat|screen|bubble|swing/.test(n)).length;
    G.aiRead=1.05+(rs.length&&quick>=rs.length*0.6?rnd(0.1,0.5):rnd(0.5,1.4));}
  const early=G.t<G.aiRead,thr=early?99:Math.max(0.3,2.2-(G.t-G.aiRead)*0.45);
  const react=clamp(0.42-(((q.pl&&q.pl.awr)||75)-80)*0.012,0.15,0.7);
  let press=99;for(const d of G.ents)if(d.side==='d'&&d.eng<=0&&!d.down&&G.t-(d.freeAt||0)>react)press=Math.min(press,dist(d,q));
  if(best&&(bs>=thr||(press<2.1&&bs>0.2))){G.aiRecv=best;throwTo(bp[0],bp[1],bp[2],1.25,pcOn()&&pcMe(best)?userThrowMeter:undefined);return;}
  if(press<2.4&&G.t>2.2&&Math.random()<0.18){
    let lane=true;for(const d of G.ents)if(d.side==='d'&&!d.down&&d.y>q.y&&Math.abs(d.x-q.x)<3&&d.y-q.y<5)lane=false;
    if(lane){G.carrier=q;G.ballState='carrier';G.qbCarT=G.t;setCtl();return;}
  }
  if(G.t>4.4&&press>1.6){G.aiRecv=null;throwTo(q.x<CX?-3:FW+3,q.y+12,true,0.2);}
}

/* ===================== ball carrier moves ===================== */
function tryJuke(dir){if(G.client){olCmd('mv',{mv:'juke',d:dir});return;}const c=G.carrier;if(!c||c.juke>0||c.dive>0||c.down||c.seqLock||c.moveCD>0)return;
  c.juke=0.3;c.jdir=dir;c.jukeT=G.t;c.moveCD=gpMoveCD(c,0.35);dust(c.x,c.y,4);
  for(const d of foesOf(c))if(dist(d,c)<2){
    if(Math.random()<gpCounterChance(d,c,'low')*0.6){d.ctrRead=G.t+0.4;continue;} // stayed square, didn't bite
    if(Math.random()<gpJukeStun(c,d)){d.stun=gpJukeDur(c,d);if(d.lunge>0){d.lunge=0;d.down=true;d.downT=0.7;}}}}
function gpMoveCD(c,b){return b*(1+gpFat(c)*0.6)*gpCD(c);}
function trySpin(){if(G.client){olCmd('mv',{mv:'spin'});return;}const c=G.carrier;if(!c||c.down||c.seqLock||c.moveCD>0||c.dive>0)return;c.spin=0.45;c.moveCD=gpMoveCD(c,1.25);c.spinT=G.t;dust(c.x,c.y,5);flash('Spin move');}
function tryStiff(){if(SEVENS()){flash('No contact in 7-on-7');return;}if(G.client){olCmd('mv',{mv:'stiff'});return;}const c=G.carrier;if(!c||c.down||c.seqLock||c.moveCD>0||c.dive>0)return;c.stiff=0.8;c.stiffDur=0.8;c.stiffHit=null;c.moveCD=gpMoveCD(c,1.0);}
// v2.14 stiff arm: the arm goes out and meets the first defender who closes in. Strength, size and ratings decide it:
// a clean one shoves him off (or puts him on the turf), a weak one gets the arm grabbed.
function gpStiffStep(c){
  if(!(c.stiff>0)||c.stiffHit||c.seqLock||c.dive>0)return false;
  const ad=attackDir(c);let best=null,bd=1.25;
  for(const d of G.ents){if(d.side===c.side||d.down||d.hurt||d.eng>0||d.stun>0)continue;
    const dd=dist(d,c);if(dd>=bd)continue;if((d.y-c.y)*ad<-0.9)continue; // the arm can't reach a man chasing from behind
    best=d;bd=dd;}
  if(!best)return false;const d=best;c.stiffHit=d;
  const edge=gpMove('stiff',c,d),pWin=clamp(0.34+edge*1.55-(d===G.uctl&&d.lunge>0?0.08:0),0.22,0.9);
  const ux=(d.x-c.x)/(bd||1),uy=(d.y-c.y)/(bd||1);
  if(Math.random()<pWin){
    const flat=Math.random()<clamp(0.25+((c.pl.str||70)-(d.pl.str||70))*0.012,0.08,0.6);
    d.lunge=0;d.jz=0;d.vx=ux*5.2;d.vy=uy*5.2;
    if(flat){d.down=true;d.downT=1.1;d.downAnim='tackled';d.fall='back';dust(d.x,d.y,10);flash('Stiff arm! Put him on the ground');G.cheer=Math.max(G.cheer,1.1);}
    else{d.stun=0.75;flash('Stiff arm!');G.cheer=Math.max(G.cheer,0.6);}
    c.slow=0.08;try{SFX.hit(false);}catch(e){}
    return true;}
  if(Math.random()<0.5){flash('He grabs the arm!');c.stiff=0;startSeq(c,d,'wrap');return true;}
  d.stun=0.25;c.slow=0.3;c.stiff=0;flash('Stiff arm stalls');return true;
}
function tryTruck(){if(SEVENS()){flash('No contact in 7-on-7');return;}if(G.client){olCmd('mv',{mv:'truck'});return;}const c=G.carrier;if(!c||c.down||c.seqLock||c.moveCD>0||c.dive>0)return;c.truck=0.6;c.moveCD=gpMoveCD(c,1.2);dust(c.x,c.y,4);}
function tryHurdle(){if(G.client){olCmd('mv',{mv:'hurdle'});return;}const c=G.carrier;if(!c||c.down||c.seqLock||c.moveCD>0||c.dive>0)return;c.hurdle=0.6;c.moveCD=gpMoveCD(c,1.3);dust(c.x,c.y,6);}
function tryQbSlide(){const c=G.carrier;if(!c||c!==G.qb||c.down||c.seqLock||c.slideT>0||c.dive>0)return false;
  const ad=attackDir(c);if(G.linesW&&(c.y-G.linesW.los)*ad<-0.5)return false; // only past the line
  c.slideT=0.6;c.slideSpot=c.y;c.slideV=Math.max(2.5,Math.abs(c.vy));flash('QB slides');dust(c.x,c.y,6);return true;}
// situational dives: stretch / leap for the goal line, get small under an incoming hit, or go over the man in front
// for the score or the first down (agility decides whether he clears him)
const DIVE_K={norm:{T:0.32,v:6.5,h:0.35,r:0.1},leap:{T:0.42,v:7.2,h:1.2,r:-0.28},low:{T:0.26,v:6,h:0.1,r:0.22},over:{T:0.5,v:7,h:1.75,r:-0.38}};
function gpDiveKind(c){
  const fd=G.linesW&&G.linesW.fd,toEZ=110-c.y,toFD=fd!=null?fd-c.y:99;let near=null,nd=99;
  for(const d of foesOf(c)){if(d.down||d.hurt)continue;const k=dist(d,c);if(k<nd&&d.y-c.y>-0.6){nd=k;near=d;}}
  const front=near&&near.y>c.y-0.2&&Math.abs(near.x-c.x)<1.5&&nd<2.6;
  if(front&&nd>0.5&&(toEZ<4.5||(toFD>0&&toFD<3)))return'over';
  if(toEZ<3.4)return'leap';
  if(near&&nd<2.4)return'low';
  return'norm';}
function tryDive(){if(G.client){olCmd('mv',{mv:'dive'});return;}const c=G.carrier;if(c===G.qb&&110-c.y>4.5&&tryQbSlide())return;
  if(!c||c.dive>0||c.juke>0||c.down||c.seqLock)return;
  const k=gpDiveKind(c),K=DIVE_K[k];c.diveK=k;c.diveT=K.T;c.dive=K.T;c.diveClear=false;
  if(k==='over'){const cl=clamp(0.45+((c.pl.agi||70)-70)*0.012+((c.pl.spd||70)-70)*0.006-gpFat(c)*0.2,0.15,0.82);c.diveClear=Math.random()<cl;flash(c.diveClear?'Flies over the top!':'Goes airborne!');}
  else if(k==='leap')flash('Leaps for the pylon!');
  dust(c.x,c.y,k==='low'?7:4);}
function diveFx(e,dir){const o={rot:0,jz:0};if(!(e.dive>0)||e.down)return o;const K=DIVE_K[e.diveK||'norm']||DIVE_K.norm,u=clamp(1-e.dive/(e.diveT||K.T),0,1),s=Math.sin(Math.PI*u);
  o.jz=K.h*s;o.rot=(e.diveK==='over'?K.r*(u<0.55?s:-0.4*s):K.r*s)*(dir||1);return o;}
// the Juke button cuts away from the nearest defender
// v2.16 move wheel: one round button; press it and slide (or tap) to a move
const MOVE_W=[['Juke','',()=>gpAutoJuke()],['Spin','',()=>trySpin()],['Stiff arm','',()=>tryStiff()],['Truck','',()=>tryTruck()],['Hurdle','',()=>tryHurdle()],['Dive','',()=>tryDive()]];
// skill-move wheel: six slices around a center label (like a console radial menu). Tap a slice, or press and slide
// onto one and let go. Each slice shows its controller button or key.
const MW_IC={Juke:'M5 19 12 12 8 8 15 3M11 3h4v4',Spin:'M18.5 12a6.5 6.5 0 1 1-2.6-5.2M17 3v4h-4','Stiff arm':'M8 20v-6l-2.5-3M8 14V6a1.4 1.4 0 0 1 2.8 0v5M10.8 11V4.5a1.4 1.4 0 0 1 2.8 0V11M13.6 11V5.5a1.4 1.4 0 0 1 2.8 0V12M16.4 12V9a1.4 1.4 0 0 1 2.8 0v5c0 4-3 6.5-6.6 6.5',
  Truck:'M5 6l6 6-6 6M12 6l6 6-6 6',Hurdle:'M3 20h18M8 20v-5M16 20v-5M7 15h10M4 12c3-8 13-8 16 0M17 9l3 3 1-4',Dive:'M4 5l12 10M11 16h6v-6M3 20h18'};
const MW_KEY={Juke:[4,'jukeU'],Spin:[2,'spin'],'Stiff arm':[1,'stiff'],Truck:[5,'truck'],Hurdle:[3,'hurdle'],Dive:[7,'dive']};
// W / IC / KM / lbl: the slices, icons and key map (the defense passes its own tackle wheel)
function gpMoveWheel(box,W,IC,KM,lbl){W=W||MOVE_W;IC=IC||MW_IC;KM=KM||MW_KEY;lbl=lbl||'Moves';
  const N=W.length,C=100,R=97,r=50,gap=0.03,K=padKind(),P=K?PADG[K]:null;
  // v2.17 the skill-move wheel mirrors with the way the ball carrier is running on screen, so Dive and Truck point where he is going
  const c0=G.carrier,fl=W===MOVE_W&&!!(c0&&attackDir(c0)*(G.flip?-1:1)<0),keys=[];
  const pt=(rad,a)=>(C+rad*Math.cos(a)).toFixed(1)+','+(C+rad*Math.sin(a)).toFixed(1);
  let segs=W.map(([l],i)=>{const a0=-Math.PI/2+(i-0.5)*2*Math.PI/N+gap,a1=-Math.PI/2+(i+0.5)*2*Math.PI/N-gap,am=-Math.PI/2+i*2*Math.PI/N,mr=(R+r)/2;
    const[ix,iy]=pt(mr-3,am).split(','),[kx,ky]=pt(R-9,am).split(','),mk=KM[l];
    const key=P&&mk?P.l[mk[0]]:(GPC&&mk?(mk[1]==='jukeU'?kb('jukeU')+'/'+kb('jukeD'):kb(mk[1])).toUpperCase():'');
    return`<path class="mw-s" data-i="${i}" d="M${pt(R,a0)}A${R},${R} 0 0 1 ${pt(R,a1)}L${pt(r,a1)}A${r},${r} 0 0 0 ${pt(r,a0)}Z"/>`+
      `<path class="mw-ic" data-c="${i}" transform="translate(${(+ix-13.2).toFixed(1)},${(+iy-15).toFixed(1)}) scale(1.1)" d="${IC[l]||''}"/>`+
      (key?(keys.push(`<text class="mw-k" x="${fl?(200-kx).toFixed(1):kx}" y="${(+ky+(Math.sin(am)>0.5?-2:2)).toFixed(1)}" ${P&&mk?`style="fill:${P.c[mk[0]]}"`:''}>${key}<\/text>`),''):'');}).join('');
  segs=(fl?`<g transform="matrix(-1 0 0 1 200 0)">${segs}<\/g>`:segs)+keys.join('');
  const w=document.createElement('div');w.className='mwheel'+(fl?' flip':'');
  w.innerHTML=`<svg viewBox="0 0 200 200" aria-label="${lbl}">${segs}<circle class="mw-c" cx="${C}" cy="${C}" r="${r-6}"/><\/svg><div class="mw-lbl">${lbl}<\/div>`;
  box.appendChild(w);const lb=w.querySelector('.mw-lbl');let sel=-1,down=false;
  const pickAt=ev=>{const b=w.getBoundingClientRect(),sc=b.width/200,dx=(ev.clientX-(b.left+b.width/2))*(fl?-1:1),dy=ev.clientY-(b.top+b.height/2),d=Math.hypot(dx,dy)/sc;if(d<r*0.55||d>R+30)return-1;
    let a=Math.atan2(dy,dx)+Math.PI/2;if(a<0)a+=Math.PI*2;return Math.round(a/(Math.PI*2/N))%N;};
  const mark=i=>{sel=i;w.querySelectorAll('.mw-s').forEach(p=>p.classList.toggle('on',+p.dataset.i===i));
    const lt=document.documentElement.classList.contains('g27l');w.querySelectorAll('.mw-ic').forEach(p=>{p.style.stroke=+p.dataset.c===i?'var(--tOn,#fff)':'';});lb.textContent=i>=0?W[i][0]:lbl;};
  const fire=i=>{if(i<0)return;W[i][2]();mark(i);setTimeout(()=>{if(!down)mark(-1);},260);};
  w.onpointerdown=ev=>{ev.stopPropagation();ev.preventDefault();down=true;try{w.setPointerCapture(ev.pointerId);}catch(e){}mark(pickAt(ev));};
  w.onpointermove=ev=>{if(down||ev.pointerType==='mouse')mark(pickAt(ev));};
  w.onpointerup=ev=>{ev.stopPropagation();down=false;fire(pickAt(ev));};
  w.onpointercancel=()=>{down=false;mark(-1);};w.onpointerleave=ev=>{if(!down&&ev.pointerType==='mouse')mark(-1);};
  G.mwMark=i=>{try{if(w.isConnected){mark(i);setTimeout(()=>{if(!down)mark(-1);},260);}}catch(e){}};
}
function gpAutoJuke(){const c=G.carrier;if(!c)return;let best=null,bd=1e9;for(const d of foesOf(c)){const dd=dist(d,c);if(dd<bd&&!d.down){bd=dd;best=d;}}
  tryJuke(best?(best.x>c.x?-1:1):(c.x<CX?1:-1));}
function trySlow(){if(G.client){olCmd('mv',{mv:'slow'});return;}const c=G.carrier;if(c&&!(c.dive>0)&&!c.down&&!c.seqLock)c.slow=0.5;}
function scramble(){if(G.ballState!=='qb')return;if(SEVENS()){flash('No QB runs in 7-on-7');return;}if(G.client){olCmd('scr');return;}G.carrier=G.qb;G.ballState='carrier';G.qbCarT=G.t;setCtl();}
// a scrambling quarterback can still throw until he crosses the line of scrimmage (pass plays only)
function gpScrOK(){const q=G.qb,P=G.play;return!!(q&&G.phase==='live'&&G.ballState==='carrier'&&G.carrier===q&&!q.down&&!q.seqLock&&!(q.slideT>0)&&!(q.dive>0)&&P&&P.kind==='scrimmage'&&!P.special&&P.off&&P.off.kind==='pass'&&!G.gpThrown&&!G.pendThrow&&G.linesW&&q.y<G.linesW.los-0.3);}
function scrUser(){return gpScrOK()&&!isAI(G.offTeam)&&!pcAIQB()&&G.offTeam===G.act&&!G.test;}
// defenders were reading their keys / covering receivers: they need a beat to see the scramble, and the
// secondary stays on receivers while the QB can still throw (unless he runs right at them)
function gpQbScrHold(e,c){
  if(!e.cover||e.cover.type==='rush'||e.cover.type==='blitz'||!G.linesW)return false;
  if(G.qbCarT==null)G.qbCarT=G.t;
  if(e.scrRd==null)e.scrRd=clamp(0.42+(75-(e.pl&&e.pl.awr||70))*0.01+(e.cover.type==='man'?0.12:0)+rnd(-0.08,0.15),0.22,1.0);
  const behind=c.y<G.linesW.los-0.3,since=G.t-G.qbCarT;
  const designed=G.play&&G.play.off&&G.play.off.kind==='run';
  if(behind){if(since<e.scrRd*(designed?0.6:1))return true;
    if(!designed&&e.role!=='LB'&&!G.gpThrown&&dist(e,c)>5.5)return true; // DBs plaster their receivers while the QB can still throw
    return false;}
  if(G.qbCrossT==null)G.qbCrossT=G.t;
  return G.t-G.qbCrossT<e.scrRd*0.45; // he's across: a short beat before everyone breaks on him
}
// pass rushers on a scramble: they are rushing upfield with their eyes on blockers, so they need a beat to see the QB
// break out, then they chase where he was a moment ago (their reaction lag) instead of cutting him off perfectly;
// big linemen also have to stop their momentum first. Once he is past the line and they have seen it, normal pursuit.
function gpRushScr(e,c){
  if(!G.linesW)return null;if(G.qbCarT==null)G.qbCarT=G.t;
  if(e.rsRd==null)e.rsRd=clamp(0.48+(72-((e.pl&&e.pl.awr)||70))*0.012+(e.role==='DL'?0.14:0)+rnd(-0.08,0.12),0.28,1.0);
  const since=G.t-G.qbCarT,past0=c.y>=G.linesW.los+0.5;
  if(past0&&since>e.rsRd*1.6)return null;
  const p=past(c,clamp(e.rsRd*0.75,0.2,0.7)),slow=e.role==='DL'?(since<e.rsRd?0.62:0.84):(since<e.rsRd*0.7?0.75:0.92);
  return desire(e,clamp(p.x,0,FW),p.y,e.spd*slow);
}
// AI quarterback on the move: finds an open man before the line or keeps running
function aiScrThrow(dt){
  const q=G.qb;q.scrThink=(q.scrThink||0)-dt;if(q.scrThink>0||G.t-(G.qbCarT||G.t)<0.3)return;q.scrThink=0.15;
  let best=null,bs=-9,bp=null;
  for(const r of G.recv){if(r.down)continue;const D0=dist(q,r),f=flight(D0,D0<14);const px=r.x+r.vx*f.T,py=r.y+r.vy*f.T;
    if(px<1||px>FW-1||py>118||D0>gpMaxD()*0.85)continue;
    let m=99;for(const d of G.ents)if(d.side==='d'&&!d.down)m=Math.min(m,Math.hypot(d.x-px,d.y-py)-d.spd*f.T*0.45);
    const s=m+(py-q.y>G.toGo+2?0.4:0)+gpTargetForm(r);if(s>bs){bs=s;best=r;bp=[px,py,D0<14];}}
  const runLane=!G.ents.some(d=>d.side==='d'&&!d.down&&d.y>q.y&&Math.abs(d.x-q.x)<3&&d.y-q.y<6);
  if(best&&bs>=(runLane?1.9:1.2)){G.aiRecv=best;throwTo(bp[0],bp[1],bp[2],1.45);}
}
function controlCarrier(c,dt){
  if(c.seqLock)return;
  if(c.ca&&c.ca.type==='slide'&&!c.ca.drop){const f=Math.exp(-dt*5);c.vx*=f;c.vy*=f;if(c.ca.t>=c.ca.dur*0.85&&!c.slideDown){c.slideDown=true;c.down=true;c.downAnim='catch_dive';endPlay({type:'tackle',spot:c.y});}return;}
  // a diving catch ends on the ground: in high school and college a runner is down once his knee or body touches, contact or not
  if(c.ca&&(c.ca.type==='dive'||c.ca.type==='onedive')&&!c.ca.drop){const f=Math.exp(-dt*2.5);c.vx*=f;c.vy*=f;if(c.ca.t>=c.ca.dur*0.85&&!c.slideDown){c.slideDown=true;c.down=true;c.downAnim='catch_dive';endPlay({type:'tackle',spot:c.y});}return;}
  const ad=attackDir(c),slowC=c.ca&&(c.ca.type==='low'||c.ca.type==='poss')?0.5:1;
  let tvx=0,tvy;
  // once you make a move yourself (juke, stiff arm, spin...) the designed path is gone: no running back to an old jet sweep waypoint
  if(c.path&&!(isAI(c.team)||G.test||pcAI(c))&&(c.juke>0||c.stiff>0||c.spin>0||c.truck>0||c.hurdle>0||G.t-(c.jukeT||-9)<0.6))c.path=null;
  if(c.slideT>0){c.slideT-=dt;const u=Math.max(0,c.slideT/0.6);c.vy=ad*c.slideV*u;c.vx*=Math.exp(-dt*4);if(c.slideT<=0){c.down=true;c.slid=true;c.downAnim='qb_slide';c.guDur=0.3;c.downT=0.9;endPlay({type:'tackle',spot:c.slideSpot+ad*Math.min(1.2,c.slideV*0.12)});}return;}
  // AI quarterbacks give themselves up when a defender closes in past the line
  if(c===G.qb&&(isAI(c.team)||G.test||pcAI(c))&&!c.slideT&&G.linesW&&(c.y-G.linesW.los)*ad>1.5){const A=c.pl.arch||'',w=A==='Pure Runner'||A==='Tank'?0.15:A==='Scrambler'?0.45:0.85;
    if(foesOf(c).some(o=>!o.down&&dist(o,c)<2.3&&(o.y-c.y)*ad>-0.3)&&Math.random()<w*dt*6&&tryQbSlide())return;}
  // AI ball carriers dive for the goal line or the sticks when a tackler arrives
  if((isAI(c.team)||G.test||pcAI(c))&&!(c.dive>0)&&!(c.juke>0)&&G.play){const toEZ=110-c.y,fd=G.linesW&&G.linesW.fd,toFD=fd!=null?fd-c.y:99;
    if((toEZ<3.6||(toFD>0&&toFD<2.2))&&foesOf(c).some(o=>!o.down&&dist(o,c)<1.7&&o.y-c.y>-0.4)&&Math.random()<dt*6)tryDive();}
  if(c.dive>0){c.dive-=dt;tvy=(DIVE_K[c.diveK||'norm']||DIVE_K.norm).v*ad;if(c.dive<=0){if(ad>0&&c.y>=110){c.dive=0;endPlay({type:'td'});return;}c.down=true;c.downAnim='catch_dive';dust(c.x,c.y,c.diveK==='over'||c.diveK==='leap'?12:8);endPlay({type:'tackle',spot:c.y});return;}}
  else if(c.juke>0){c.juke-=dt;tvx=c.jdir*Math.max(7,c.spd*0.86);tvy=c.spd*0.52*ad;} // v2.16 a cut is as fast as running straight
  else{
    if(c.slow>0)c.slow-=dt;
    let sp=(c.slow>0?c.spd*0.4:c.spd)*0.93*slowC*(c.spin>0?0.8:1)*(c.truck>0?0.88:1);
    if((isAI(c.team)||G.test||pcAI(c))&&gpScrambleThrow(c,dt))return;
    sp*=gpRunBurst(c);if(c===G.qb)sp*=1.08;
    if(isAI(c.team)||G.test||pcAI(c)){const[ax,ay]=aiRunDir(c);tvx=ax*sp;tvy=ay*sp;aiMoves(c,dt);}
    else if(gpCarrierInput(c)){const d=gpCarrierInput(c);tvx=d[0]*sp;tvy=d[1]*sp;c.path=null;}
    else if(c.path&&c.path.length&&(c.y-G.linesW.los)*ad<0.5){while(c.path.length>1&&(c.path[0][1]-c.y)*ad<-0.8)c.path.shift();const p=c.path[0];if(Math.hypot(p[0]-c.x,p[1]-c.y)<0.8)c.path.shift();const q=c.path[0]||[c.x,c.y+ad*5];const d=Math.hypot(q[0]-c.x,q[1]-c.y)||1;tvx=(q[0]-c.x)/d*sp;tvy=(q[1]-c.y)/d*sp;}
    else tvy=sp*ad;
  }
  accel(c,tvx,tvy,dt,26);
}
// v2.16 steer your ball carrier with the left stick or the arrow keys: every direction at full speed (sideways as fast as straight)
function gpCarrierInput(c){
  if(G.client||isAI(c.team)||G.test||pcAI(c))return null;let sx=0,sy=0;
  if(G.pad&&!['arrowleft','arrowright','arrowup','arrowdown'].some(k=>keys.has(k))){sx=G.pad.x*30;sy=G.pad.y*30;}
  else{if(keys.has('arrowleft'))sx-=30;if(keys.has('arrowright'))sx+=30;if(keys.has('arrowup'))sy-=30;if(keys.has('arrowdown'))sy+=30;}
  if(Math.hypot(sx,sy)<9)return null;return screenToSimDir(c,sx,sy);}
function aiRunDir(c){
  const ad=attackDir(c);
  // outside runs: stay on the path to the edge, but if a free defender squares up in front, cut upfield and take what's there
  if(c.pathFull&&c.path&&c.path.length){const q=c.path[0],dx=q[0]-c.x,dy=q[1]-c.y,l=Math.hypot(dx,dy)||1;
    for(const f of foesOf(c)){if(f.down||f.eng>0)continue;const fx=f.x-c.x,fy=f.y-c.y,d=Math.hypot(fx,fy);if(d<3.4&&(fx*dx+fy*dy)/l>0.6){c.pathFull=false;c.path.length=0;c.vis=null;c.visT=0;break;}}}
  if(c.path&&c.path.length&&((c.y-G.linesW.los)*ad<-1.2||(c.pathFull&&(c.y-G.linesW.los)*ad<1.5))){const p=c.path[0];if(Math.hypot(p[0]-c.x,p[1]-c.y)<0.8)c.path.shift();const q=c.path[0];if(q){const d=Math.hypot(q[0]-c.x,q[1]-c.y)||1;return[(q[0]-c.x)/d,(q[1]-c.y)/d];}}
  if(!c.vis||G.t>c.visT){
    c.visT=G.t+0.15;let best=[0,ad],bs=-1e9;const F=foesOf(c);
    for(let a=-70;a<=70;a+=14){
      const r=a*Math.PI/180,dx=Math.sin(r),dy=Math.cos(r)*ad;let s=dy*ad*2.2;
      for(const k of[2,4.5]){const px=c.x+dx*k,py=c.y+dy*k;if(px<1.2||px>FW-1.2)s-=6;let m=9;for(const f of F)m=Math.min(m,Math.hypot(f.x-px,f.y-py));s+=Math.min(m,5)*(k<3?1.2:0.8);}
      if(s>bs){bs=s;best=[dx,dy];}
    }
    c.vis=best;
  }
  return c.vis;
}
function aiMoves(c,dt){
  if(c.moveCD>0||c.down)return;
  for(const f of foesOf(c)){
    const d=dist(f,c);if(d>1.7)continue;
    const closing=(c.x-f.x)*(f.vx-c.vx)+(c.y-f.y)*(f.vy-c.vy)>0;if(!closing)continue;
    if(Math.random()<dt*0.9){
      const r=Math.random(),pl=c.pl;
      const low=f.lunge>0&&(f.lt==='shoe'||f.lt==='dive');
      if(low&&r<0.6)tryHurdle();
      else if(r<0.22&&gpBtk(pl)>78)tryTruck();
      else if(r<0.4&&gpBtk(pl)>70)tryStiff();else if(r<0.58&&gpElu(pl)>82)trySpin();else tryJuke(f.x>c.x?-1:1);
    }
    break;
  }
}

