/* ===================== snap ===================== */
function snapScrimmage(){
  try{if(!G.play.special){SFX.hut();SFX.pads(6);}}catch(e){}
  G.gpThrown=false;G.gpTk=null;G.qbLook=null;G.pendThrow=null;for(const e of G.ents)e.bite=null;
  G.gpTgt=null;G.gpCov=null;G.gpCovC=null;G.gpDrop=null;G.gpPbu=null;G.gpPk=[];G.gpSackOL=null;G.qbCarT=null;G.qbCrossT=null;
  const P=G.play,O=P.off;
  if(P.special){G.phase='live';G.t=0;G.ballState='qb';G.snapB=null;G.clockRun=true;setCtl();return;}
  // pre-snap fouls
  if(!G.conv&&Math.random()<0.012){return preSnapFoul(G.offTeam,'False start',5);}
  if(!G.conv&&Math.random()<0.012){return preSnapFoul(1-G.offTeam,'Offside',5);}
  G.phase='live';G.t=0;G.throwT=0;try{const pp=$('pcPlay');if(pp)pp.hidden=true;}catch(e){}G.flK=slf(G.offTeam,'bsp',0.18);
  for(const d of G.ents){
    if(d.side!=='d')continue;d.freeAt=0;d.beat=null;
    const blk=d.role==='DL'?(O.kind==='pass'?rnd(1.6,3.5):rnd(2.4,4.0)):(O.kind==='run'?rnd(1.4,2.6):rnd(0.8,2.0));
    d.engDur=blk*clamp(1+(80-(d.pl.bsh?(d.pl.str+d.pl.bsh)/2:d.pl.str))*0.012,0.75,1.3);
  }
  if(G.moMan){const m=G.moMan;if(m.route&&O.kind==='pass'){const nm=m.route.name,col=m.route.col,out=O.data.mo&&O.data.mo.k==='jet'?m.moOut:(m.x<CX?-1:1);setRoute(m,nm,out,col);}m.hx=m.x;m.hy=m.y;}
  G.snapB={t:0,T:0.24,from:[CX,G.linesW.los-0.8],to:O.data&&O.data.qb?null:[G.qb.x,G.qb.y]};gpBadSnap();
  G.ballState='snap';
  if(O.kind==='pass'){
    G.rb.block=G.rb.route===null||(Math.random()<(P.def.id==='C0'||P.def.id==='FZ'?0.55:0.25)&&G.rb.route&&G.rb.route.name==='check');
    if(G.rb.block)G.rb.route=null;
    G.recv=[G.X,G.Z,G.SL,G.te,G.rb].filter(e=>e&&e.route&&!e.block&&G.ents.includes(e));
    for(const d of G.ents){if(!d.press||!d.cover||d.side!=='d')continue;let r=d.cover.type==='man'?d.cover.man:null;
      if(!r&&d.cover.type==='zone'){let bd=2.2;for(const o of G.recv){const k=dist(d,o);if(k<bd){bd=k;r=o;}}}
      if(!r||dist(d,r)>=2.2)continue;if(Math.random()<clamp(((r.pl?(r.pl.rte?(r.pl.agi+r.pl.rte)/2:r.pl.agi):75)-(d.pl.prs||d.pl.cov))*0.02+0.25,0.05,0.7)){d.slip=0.35;}else r.jam=rnd(0.15,0.4);}
    if(O.data&&O.data.screen)for(const d of G.ents)if(d.role==='DL')d.engDur=rnd(0.5,0.9);
    if(Math.random()<0.022)G.pendingFoul={t:rnd(1.2,2.6),team:G.offTeam,kind:'Holding',yds:10};
    else if(Math.random()<0.01)G.pendingFoul={t:rnd(1.0,2.2),team:1-G.offTeam,kind:'Defensive holding',yds:10,afd:true};
  }else{
    if(Math.random()<0.018)G.pendingFoul={t:rnd(0.6,1.6),team:G.offTeam,kind:'Holding',yds:10};
  }
  G.clockRun=true;
  setCtl();
}
function gpKickDelay(){
  const P=G.play;hide('meter');G.meter=null;setTray('none');try{throwFlag(G.refs[0]);}catch(e){}
  flash('Delay of game: 5 yards, re-kick');
  if(P.kind==='kickoff'){G.kickSpot=Math.max(15,(G.kickSpot||35)-5);setupKickoff(G.kickTeam,G.kickSpot);}
  else if(P.kind==='punt'){G.los=Math.max(1,G.los-5);setupPunt(G.offTeam,G.los);}
  else{G.los=Math.max(1,G.los-5);setupFG(P.kind==='xp'?'xp':'fg');}
  toPresnap();
}
function preSnapFoul(team,kind,yds){
  G.phase='live';G.t=0;G.ballState='dead';
  throwFlag(G.refs[0]);
  G.fouls=[{team,kind,yds,pre:true}];
  endPlay({type:'presnap'});
}
function snapKick(){
  const P=G.play;G.phase='live';G.t=0;
  if(P.kind==='kickoff'){P.kickAt=1.0;G.ballState='tee';G.clockRun=false;}
  else if(P.kind==='punt'&&P.fake){const pp=G.ents.find(e=>e.slot==='PP')||P.punter;P.fakeMan=pp;   // direct snap to the up-back
    G.ballState='snap';G.snapB={t:0,T:0.32,from:[CX,G.linesW.los+0.8],to:[pp.x,pp.y],dest:'pp'};for(const d of G.ents)d.engDur=rnd(1.2,2.4);G.clockRun=true;}
  else if(P.kind==='punt'){G.ballState='snap';G.snapB={t:0,T:0.75,from:[CX,G.linesW.los+0.8],to:[P.punter.x,P.punter.y],dest:'punter'};
    for(const d of G.ents)d.engDur=rnd(1.2,2.4);G.clockRun=true;}
  else{G.ballState='snap';G.snapB={t:0,T:0.42,from:[CX,G.linesW.los-0.8],to:[P.holder.x,P.holder.y],dest:'holder'};
    for(const d of G.ents)d.engDur=rnd(1.5,2.6);if(P.kind==='fg')G.clockRun=true;}
  setCtl();
}

/* ===================== kicking physics ===================== */
function kickResult(kicker,power,acc){
  const p=kicker.pl;
  return{power:clamp(power,0,1),acc:clamp(acc+rnd(-1,1)*(1-p.kacc/100)*0.18,-1,1)};
}
function launchKick(type,from,res){
  try{SFX.kick();}catch(e){}
  const p=G.play.kind==='kickoff'?G.play.kicker.pl:type==='punt'?G.play.punter.pl:G.play.kicker.pl;
  let R,hp,T,tx,ty,dirY;
  const[wX,wY]=gpWind();
  if(type==='fg'){R=(42+p.kpow*0.22)*(0.55+0.45*res.power)*WX.kick*clamp(1+wY*0.006,0.85,1.15);hp=R*0.22;T=R/24;dirY=1;
    const ang=res.acc*0.30+(G.wind||0);tx=from[0]+Math.sin(ang)*R;ty=from[1]+Math.cos(ang)*R;}
  else if(type==='punt'){R=(30+p.kpow*0.16)*(0.6+0.4*res.power)*WX.kick*clamp(1-wY*0.008,0.8,1.2);hp=13+res.power*9;T=4.0+res.power*1.0;dirY=-1;
    tx=clamp(from[0]+res.acc*12+wX*0.06*T,-2,FW+2);ty=from[1]-R;}
  else{R=(50+p.kpow*0.17)*(0.6+0.4*res.power)*WX.kick*clamp(1-wY*0.007,0.82,1.18);hp=14+res.power*6;T=3.4+res.power*0.7;dirY=-1;
    tx=clamp(CX+res.acc*16+wX*0.05*T,-3,FW+3);ty=from[1]-R;}
  G.kick={type,sx:from[0],sy:from[1],tx,ty,hp,T,t:0,R,res,crossed:false,good:null};
  G.ballState='kick';dust(from[0],from[1],5);
  const kt=G.play.kind==='kickoff'?G.play.kickTeam:G.play.kind==='punt'?G.play.puntTeam:-1;
  if(kt>=0&&!isAI(kt)&&!G.test){let b=null,bd=1e9;for(const e of G.ents)if(e.side==='d'&&e.role!=='K'&&e.role!=='P'){const d=Math.hypot(e.x-tx,e.y-ty);if(d<bd){bd=d;b=e;}}G.uctl=pcOn()?(G.ents.find(e=>pcMe(e)&&e.side==='d')||null):b;setCtl();}
}
function launchOnside(){
  const P=G.play,F=P.oform||'std',sd=F==='left'?-1:F==='right'?1:Math.random()<0.5?-1:1;
  if(F==='popup')G.loose={x:CX+sd*0.6,y:P.ky,h:0.4,vx:sd*rnd(0.5,1.8),vy:-rnd(5.5,6.6),vh:rnd(9.8,11.6),kind:'onside',t:0};
  else G.loose={x:CX+sd*0.6,y:P.ky,h:0.25,vx:sd*(F==='std'?rnd(2,4.5):rnd(3.5,5.5)),vy:-rnd(8.6,10.4),vh:rnd(4.5,7),kind:'onside',t:0};
  G.ballState='loose';G.clockRun=false;dust(CX,P.ky,6);flash('Onside kick!');
}
function kickPos(K,t){const u=t/K.T;return{x:lerp(K.sx,K.tx,u),y:lerp(K.sy,K.ty,u),h:(K.type==='fg'?0.4:1)+4*K.hp*u*(1-u)-(K.type==='fg'?0.4*u:u)};}
function kickStep(dt){
  const K=G.kick;K.t+=dt;const b=kickPos(K,Math.min(K.t,K.T));K.cur=b;
  if(K.type==='fg'){
    if(!K.crossed&&b.y>=120){K.crossed=true;K.good=b.h>=3.33&&Math.abs(b.x-CX)<=3.08;}
    if(K.t>=K.T||b.y>=126){
      if(!K.crossed){K.good=false;}
      endPlay({type:G.play.kind==='xp'?'xp':'fg',good:K.good});
    }
    return;
  }
  if(K.type==='punt'&&(isAI(G.offTeam)||G.test)&&!G.fair&&K.t>K.T*0.75){const pr=G.play.ret;if(pr&&G.ents.some(e=>e.side==='d'&&!e.down&&dist(e,pr)<7))G.fair=true;}
  // catchable by receiving team
  if(K.t>K.T*0.55&&b.h<2.8){
    for(const e of G.ents){
      if(e.side!=='o'||e.down||e.hurt)continue;
      if(!(e.role==='KR'||e.role==='PR'))continue;
      if(Math.hypot(e.x-b.x,e.y-b.y)<1.15){
        if(Math.random()<0.025+(80-e.pl.hands)*0.0015){flash('Muffed!');G.loose={x:b.x,y:b.y,h:b.h,vx:rnd(-2,2),vy:rnd(-2,2),vh:2,kind:'muff',t:0};G.kick=null;G.ballState='loose';return;}
        G.kick=null;e.ca={type:'hands',t:0,dur:0.3};
        if(G.play.kind==='punt'&&G.fair){G.carrier=e;G.ballState='carrier';endPlay({type:'fair',spot:e.y});return;}
        G.carrier=e;G.ballState='carrier';G.clockRun=true;if(G.play.kind==='kickoff')G.krFrom=e.y;else if(G.play.kind==='punt')G.prFrom=e.y;
        if(G.play.kind==='kickoff'&&e.y<10){G.kneelOK=1.6;if(isAI(e.team)&&e.y<6){e.kneel=true;endPlay({type:'touchback'});return;}}
        setCtl();return;
      }
    }
  }
  if(K.t>=K.T){
    const sp=Math.hypot(K.tx-K.sx,K.ty-K.sy)/K.T;
    G.loose={x:b.x,y:b.y,h:0.1,vx:(K.tx-K.sx)/K.T*0.3,vy:(K.ty-K.sy)/K.T*0.3,vh:sp*0.12,kind:G.play.kind,t:0};
    G.kick=null;G.ballState='loose';G.clockRun=G.play.kind==='punt';
  }
}
function looseStep(dt){
  const L=G.loose;L.t+=dt;
  L.x+=L.vx*dt;L.y+=L.vy*dt;L.vh-=GRAV*0.7*dt;L.h+=L.vh*dt;
  if(L.h<=0){L.h=0;if(Math.abs(L.vh)>1.8){L.vh=-L.vh*0.42;L.vx*=0.7;L.vy*=0.7;L.vx+=rnd(-1,1);L.vy+=rnd(-1,1);}else{L.vh=0;const f=Math.exp(-dt*2.2);L.vx*=f;L.vy*=f;}}
  const P=G.play;
  if(L.kind==='inc')return;
  if(L.x<0||L.x>FW){
    if(P.kind==='kickoff')return endPlay({type:'koOOB'});
    if(P.kind==='punt')return endPlay({type:'puntDead',spot:L.y});
    return endPlay({type:'fumbleOOB',spot:L.y});
  }
  if(P.kind==='kickoff'&&L.y<0)return endPlay({type:'touchback'});
  if(L.kind==='punt'){
    if(L.y<10&&L.h<0.5)return endPlay({type:'touchback'});
    for(const e of G.ents)if(e.side==='d'&&!e.down&&e.role!=='P'&&dist(e,L)<0.8&&L.h<0.6&&L.t>0.3)return endPlay({type:'puntDead',spot:L.y,downed:true});
    if(Math.hypot(L.vx,L.vy)<0.25&&L.h===0&&L.t>0.6)return endPlay({type:'puntDead',spot:L.y});
    return;
  }
  if(L.h<0.9&&L.t>0.15){
    let best=null,bd=0.95;
    for(const e of G.ents){if(e.down||e.hurt)continue;if(P.kind==='kickoff'&&e.side!=='o'&&!(L.kind==='onside'&&L.y<=P.ky-10))continue;const d=dist(e,L);if(d<bd){bd=d;best=e;}}
    // a pop-up is contested in the air: the cover man is hit as he catches it
    if(best&&L.kind==='onside'&&best.side==='d'&&P.oform==='popup'&&L.h>0.45&&Math.random()<0.4){L.vx=rnd(-2.5,2.5);L.vy=rnd(-1.5,2);L.vh=rnd(2,3);L.h=Math.max(L.h,0.3);best.stun=0.45;flash('Bobbled!');best=null;}
    if(best&&L.kind==='onside'&&best.side==='o'&&(L.h>0.45||Math.hypot(L.vx,L.vy)>4.2)&&Math.random()<0.4){
      // a hard, hopping onside kick is easy to bobble
      L.vx=rnd(-3,3);L.vy=rnd(-2,2.5);L.vh=rnd(2,3.5);L.h=Math.max(L.h,0.3);best.stun=0.45;flash('Bobbled!');best=null;
    }
    if(best){
      const lostSide=G.prevCarrierSide;
      G.carrier=best;G.ballState='carrier';G.loose=null;best.ca={type:'low',t:0,dur:0.35};if(P.kind==='kickoff'&&best.side==='o')G.krFrom=best.y;
      if(P.kind!=='scrimmage'&&best.side==='d')G.kickRecovered=true;
      if(P.kind==='scrimmage'&&best.side!=='o')G.turnover=true;
      else if(P.kind==='scrimmage'&&lostSide==='d'&&best.side==='o')G.turnover=false;
      flash(L.kind==='onside'?(best.side==='d'?'Onside kick recovered!':'Receiving team has it'):L.kind==='fumble'?(best.side==='o'?'Recovered by the offense':'Fumble recovered!'):'Picked up!');
      if(L.kind==='onside'&&best.side==='d')G.cheer=2;
      G.clockRun=true;setCtl();
      if(L.kind==='snap')gpSnapRecovered(best);
    }
  }
}

