/* ===================== play outcome & rules ===================== */
// spots are kept to a tenth of a yard: a 3.4-yard run on 3rd and 3.6 is short by inches
const gpYd=v=>Math.round(v*10)/10;
function gpTgTxt(los,tg){return los+tg>=99.95?'Goal':tg<0.3?'inches':String(Math.max(1,Math.round(tg)));}
// how far the ball is ahead of the carrier's body when he goes down: tucked on a sack, carried on a run,
// reached out on a dive or a slide
function gpBallReach(c){if(!c)return 0;if(c.dive>0||c.diveK&&c.down&&c.downAnim==='catch_dive')return{leap:1.05,over:1.05,low:0.7,norm:0.85}[c.diveK||'norm']||0.85;
  if(c.slideT>0||c.slid)return 0.35;if(c.tkType==='sack')return 0.25;if(c.ca&&c.ca.type==='slide')return 0.6;return 0.45;}
function baseS(){return{score:[...G.score],poss:G.poss,los:G.los,down:G.down,toGo:G.toGo,next:'scrimmage',kickTeam:null,kickSpot:35,conv:null,stop:null,msg:'',sub:'',gain:null,first:false,to:false};}
function gainTxt(g){const r=Math.round(g);return r>0?`Gain of ${r}`:g>0.04?'Gain of inches':g<-0.04&&r===0?'Loss of inches':r===0?'No gain':`Loss of ${-r}`;}
function applyGain(S,gain,label){
  gain=gpYd(gain);const off=G.offTeam,def=1-off,nl=gpYd(S.los+gain),need=S.toGo,miss=gpYd(need-gain);
  S.gain=gain;
  if(nl<=0){S.score[def]+=2;S.next='kickoff';S.kickTeam=off;S.kickSpot=20;S.msg='SAFETY';S.sub=`${G.teams[def].name} +2`;S.stop='snap';return S;}
  if(miss<=0){S.los=nl;S.down=1;S.toGo=gpYd(Math.min(10,100-nl));S.first=true;S.msg=label||gainTxt(gain);S.sub=miss>-0.3&&need>0.5?'First down by inches!':'First down';S.stop='ready';
    if(miss>-0.3&&need>0.5)G.measure='Measurement: first down by a nose!';return S;}
  S.down++;S.toGo=miss;S.los=nl;S.msg=label||gainTxt(gain);
  if(miss<0.5&&gain>0){S.sub='Inches short of the first down';G.measure='Measurement: inches short!';}
  if(S.down>4){S.poss=def;S.los=gpYd(100-nl);S.down=1;S.toGo=gpYd(Math.min(10,100-S.los));S.sub=miss<0.5?'Turnover on downs, inches short':'Turnover on downs';S.stop='snap';S.to=true;}
  return S;
}
function outcomeScrimmage(r){
  const S=baseS(),off=G.offTeam,def=1-off,ly=10+G.los,c=G.carrier;
  const P=G.play;
  if(P.special==='kneel'){return applyGain(S,-1,'Kneel down');}
  if(P.special==='spike'){S.down++;S.msg='Spike';S.sub='Clock stopped';S.stop='snap';if(S.down>4){S.poss=def;S.los=gpYd(100-S.los);S.down=1;S.toGo=10;S.to=true;}return S;}
  if(G.conv){ // two-point try
    S.next='kickoff';S.kickTeam=G.conv.team;S.stop='snap';
    if(r.type==='td'&&c&&c.side==='o'){S.score[off]+=2;S.msg='TWO-POINT GOOD';}
    else if(r.type==='td'&&c&&c.side==='d'){S.score[def]+=2;S.msg='DEFENSIVE TWO';S.sub='Returned for two points';}
    else{S.msg='TWO-POINT FAILS';}
    return S;
  }
  if(r.type==='inc'){
    S.down++;S.msg=r.drop?'Dropped':r.pbu?'Broken up':'Incomplete';S.stop='snap';
    if(r.oob)S.sub='Caught out of bounds';
    if(S.down>4){S.poss=def;S.los=gpYd(100-S.los);S.down=1;S.toGo=gpYd(Math.min(10,100-S.los));S.sub='Turnover on downs';S.to=true;}
    return S;
  }
  if(r.type==='td'){
    const side=c?c.side:'o',tm=side==='o'?off:def;S.score[tm]+=6;S.conv={team:tm};S.next='conv';S.stop='snap';
    S.msg='TOUCHDOWN';S.sub=side==='o'?`${G.teams[tm].name} score`:(G.picker?'Pick six!':'Scoop and score!');S.td=tm;S.to=side==='d';return S;
  }
  const side=r.type==='fumbleOOB'&&G.fumbleBy?G.fumbleBy.side:c?c.side:'o';
  if(side==='o'){
    const gain=r.spot-ly,sack=c&&c.tkType==='sack';
    applyGain(S,gain,sack?(gain<0?`Sacked, loss of ${-gain}`:'Sacked'):null);
    if(r.type==='oob'&&!S.stop)S.stop=(G.q===2||G.q===4)?'snap':'ready';
    if(r.type==='oob'&&!S.sub)S.sub='Out of bounds';
    return S;
  }
  S.poss=def;S.down=1;S.to=true;S.stop='snap';
  if(r.spot>=110){S.los=20;S.msg='Touchback';S.sub='Turnover';}
  else{S.los=clamp(Math.round(110-r.spot),1,99);S.msg=G.picker?'Interception':'Turnover';S.sub=`${G.teams[def].name} ball`;}
  S.toGo=Math.min(10,100-S.los);return S;
}
// v2.16 fakes: the punter or holder keeps it; a gain past the line to gain keeps the ball, short of it is a turnover on downs
// the fastest man on the unit lines up where the ball goes (up-back on a punt, holder on a field goal)
function gpFakeLineup(){const P=G.play,K=P.kind==='punt'?P.puntTeam:G.offTeam;
  const spot=P.kind==='punt'?G.ents.find(e=>e.slot==='PP'):P.holder;if(!spot)return;
  // a skill player off the bench comes in for the fake (teams use a back or the backup QB here)
  const T=G.teams[K],on=new Set(G.ents.filter(e=>e.pl).map(e=>e.pl.id));
  const sub=T.roster.filter(p=>!on.has(p.id)&&!p.inj&&['RB','WR','QB','CB','S'].includes(p.pos)).sort((a,b)=>(b.spd||0)-(a.spd||0))[0];
  if(sub&&(sub.spd||0)>(spot.pl&&spot.pl.spd||0)){const ne=mkEnt(sub,K,spot.side,spot.role,spot.slot,spot.x,spot.y);ne.dir=spot.dir;const i=G.ents.indexOf(spot);if(i>=0)G.ents[i]=ne;if(P.kind!=='punt')P.holder=ne;}}
function gpFakeGo(e){const P=G.play;G.carrier=e;G.ballState='carrier';G.qbCarT=G.t;P.fakeFrom=e.y;
  const dir=P.kind==='punt'?-1:1;
  // break to the side with fewer defenders
  let nl=0,nr=0;for(const d of G.ents)if(d.team!==e.team&&!d.down&&Math.abs(d.y-e.y)<14){if(d.x<e.x)nl++;else nr++;}
  const side=nl===nr?(Math.random()<0.5?-1:1):nl<nr?-1:1;
  // rushers already committed to the block keep coming at the kick spot for a moment
  for(const d of G.ents)if(d.team!==e.team&&!d.down&&dist(d,e)<7)d.stun=Math.max(d.stun||0,rnd(0.5,0.9));
  e.path=P.kind==='punt'?[[clamp(e.x+side*2.6,3,FW-3),e.y+dir*5.5],[clamp(e.x+side*5,3,FW-3),e.y+dir*25]]:[[clamp(e.x+side*5.5,3,FW-3),e.y+dir*6.5],[clamp(e.x+side*9,3,FW-3),e.y+dir*28]];
  // the defense was set up for a kick: most of them need a moment to react
  for(const d of G.ents)if(d.team!==e.team&&!d.down&&Math.random()<0.9){d.stun=Math.max(d.stun||0,rnd(0.5,0.95));d.eng=0;}
  flash(P.kind==='punt'?'FAKE PUNT!':'FAKE FIELD GOAL!');try{SFX.gasp();}catch(e){}setCtl();}
function outcomeFake(r){
  const P=G.play,S=baseS(),c=G.carrier;S.stop='snap';S.down=1;
  const K=P.kind==='punt'?P.puntTeam:G.offTeam,R=1-K,ly=P.kind==='punt'?110-P.los:10+G.los,dir=P.kind==='punt'?-1:1,los0=P.kind==='punt'?P.los:G.los;
  if(r.type==='td'){const tm=c&&c.team!==K?R:K;S.score[tm]+=6;S.conv={team:tm};S.next='conv';S.msg='TOUCHDOWN';S.sub=tm===K?(P.kind==='punt'?'Off the fake punt!':'Off the fake field goal!'):'Returned for a score!';S.td=tm;S.to=tm!==K;return S;}
  const spot=r.spot!=null?r.spot:(c?c.y:ly);
  if(c&&c.team!==K){S.poss=R;S.los=clamp(Math.round(dir<0?spot-10:110-spot),1,99);S.toGo=Math.min(10,100-S.los);S.msg='Turnover';S.sub=`${G.teams[R].name} ball`;S.to=true;return S;}
  const gain=Math.round((spot-ly)*dir),nl=los0+gain;S.gain=gain;
  if(gain>=G.toGo){S.poss=K;S.los=clamp(nl,1,99);S.toGo=Math.min(10,100-S.los);S.first=true;S.msg=P.kind==='punt'?'FAKE PUNT WORKS!':'FAKE FIELD GOAL WORKS!';S.sub=`Gain of ${gain}, first down`;return S;}
  S.poss=R;S.los=clamp(100-nl,1,99);S.toGo=Math.min(10,100-S.los);S.msg='Fake stopped';S.sub=gain>0?`Gain of ${gain}, short: turnover on downs`:'Turnover on downs';S.to=true;return S;
}
function outcomeKick(r){
  const S=baseS(),P=G.play,c=G.carrier;S.stop='snap';
  if(P.kind==='fg'||P.kind==='xp'){
    const off=G.offTeam,def=1-off;
    if(P.kind==='xp'){S.next='kickoff';S.kickTeam=G.conv?G.conv.team:off;
      if(r.type==='xp'&&r.good){S.score[off]+=1;S.msg='EXTRA POINT GOOD';}
      else if(r.type==='td'&&c&&c.side==='d'){S.score[def]+=2;S.msg='DEFENSIVE TWO';}
      else S.msg='EXTRA POINT NO GOOD';return S;}
    if(r.type==='fg'&&r.good){S.score[off]+=3;S.next='kickoff';S.kickTeam=off;S.msg='FIELD GOAL IS GOOD';S.sub=`${Math.round(100-G.los+17)} yards`;return S;}
    if(r.type==='td'&&c){const tm=c.side==='o'?off:def;S.score[tm]+=6;S.conv={team:tm};S.next='conv';S.msg='TOUCHDOWN';S.sub='Off the blocked kick!';S.td=tm;return S;}
    if(r.type==='fg'){S.poss=def;S.los=Math.max(20,107-G.los);S.down=1;S.toGo=10;S.msg='NO GOOD';S.sub=`${Math.round(100-G.los+17)}-yard try misses`;S.to=true;return S;}
    S.poss=def;S.los=c&&c.side==='d'?clamp(Math.round(110-r.spot),1,99):Math.max(20,107-G.los);S.down=1;S.toGo=Math.min(10,100-S.los);S.msg='Blocked kick';S.to=true;return S;
  }
  const R=G.offTeam,K=1-R;S.down=1;S.toGo=10;
  if(r.type==='td'){const tm=c&&c.side==='d'?K:R;S.score[tm]+=6;S.conv={team:tm};S.next='conv';S.msg='TOUCHDOWN';S.sub=P.kind==='kickoff'?'Kick return touchdown!':'Punt return touchdown!';S.td=tm;return S;}
  if(r.type==='touchback'){S.poss=R;S.los=P.kind==='kickoff'?25:20;S.msg='Touchback';S.sub=`Ball at the ${S.los}`;return S;}
  if(r.type==='koOOB'){S.poss=R;S.los=35;S.msg='Kick out of bounds';S.sub='Ball at the 35';return S;}
  const rec=G.kickRecovered||(c&&c.side==='d');
  if(rec){S.poss=K;S.los=clamp(Math.round(110-r.spot),1,99);S.msg='Kicking team recovers!';S.toGo=Math.min(10,100-S.los);return S;}
  S.poss=R;S.los=clamp(Math.round(r.spot-10),1,99);
  if(r.spot<=10){S.los=20;S.msg='Touchback';}
  else S.msg=r.type==='fair'?'Fair catch':r.type==='puntDead'?(r.downed?'Downed':'Ball dead'):`Return to the ${S.los<=50?S.los:100-S.los}`;
  S.toGo=Math.min(10,100-S.los);S.stop=r.type==='tackle'?null:'snap';
  return S;
}
function penaltyS(f){
  const S=baseS(),off=G.offTeam,ly=10+G.los;S.stop='snap';
  const half=(dist,y)=>Math.min(y,Math.max(1,Math.floor(dist/2)));
  if(f.team===off){
    const eff=Math.min(f.yds,Math.max(0,Math.floor((G.los-1)/2))||1,f.yds);const e2=G.los<=f.yds*2?half(G.los,f.yds):f.yds;
    S.los=Math.max(1,G.los-e2);S.toGo=Math.min(G.toGo+e2,99);
    S.msg=`${f.kind}, offense`;S.sub=`${e2} yards, replay ${['','1st','2nd','3rd','4th'][S.down]} down`;
  }else{
    let base=f.dpi?Math.max(1,Math.min(15,Math.round(f.spotY-ly))):f.yds;
    const toGoal=100-G.los,e2=toGoal<=base*2?half(toGoal,base):base;
    S.los=Math.min(99,G.los+e2);
    if(f.afd||e2>=G.toGo){S.down=1;S.toGo=Math.min(10,100-S.los);}else S.toGo=G.toGo-e2;
    S.msg=`${f.kind}, defense`;S.sub=`${e2} yards${f.afd?', automatic first down':''}`;
  }
  // a flag on a try never starts a drive: the try is replayed from the new spot (back 10 for the offense, half the distance for the defense)
  if(G.conv){const yd=Math.abs(S.los-G.los);S.poss=G.conv.team;S.next='conv';S.down=1;S.toGo=100-S.los;
    S.conv={team:G.conv.team,force2:!!G.conv.force2,shootout:!!G.conv.shootout,rep:true,los:S.los};
    S.sub=`${yd} yard${yd===1?'':'s'}, replay the two-point try from the ${100-S.los}`;}
  return S;
}
// v2.17 personal fouls (facemask, late hit, roughing): 15 yards on top of the run and an automatic first down.
// A foul during the play is marked off from the end of the run when he got past the line (from the line otherwise),
// a late hit after the whistle from where the ball was dead. On a return the yards go to the team that has the ball.
function gpPF(f){return!!(f&&(f.endSpot||/^(Facemask|Roughing the passer|Unnecessary roughness|Personal foul)/.test(f.kind||'')));}
function gpEndSpotPen(f,S){
  if(!gpPF(f)||!S||S.td!=null||G.conv||S.msg==='SAFETY')return null;
  const off=G.offTeam,half=b=>Math.min(15,gpYd((100-b)/2)),T={...S,score:[...S.score],next:'scrimmage',conv:null,down:1,first:true,stop:'snap',to:false,kickTeam:null};
  const put=(b,who,where)=>{const y=half(b);if(!(y>0))return null;T.los=gpYd(Math.min(99.9,b+y));T.toGo=gpYd(Math.min(10,100-T.los));T.msg=`${f.kind}, ${who}`;
    T.sub=`${y>=15?'15 yards':'Half the distance'} ${where}, automatic first down`;return T;};
  if(f.team!==off){if(S.gain==null)return null;const end=gpYd(G.los+S.gain),past=S.gain>0,b=f.late||past?end:G.los;if(b<=0)return null;
    T.poss=off;return put(b,'defense',f.late?'from the end of the play':past?'on top of the run':'from the line of scrimmage');}
  if(S.gain==null&&S.to&&S.poss!==off){T.poss=S.poss;return put(S.los,G.teams[off].abbr||'offense','on top of the return');}
  return null;
}
function evalS(S,team){
  const d=(S.score[team]-S.score[1-team])-(G.score[team]-G.score[1-team]);
  // on a try: a replay is worth about a 45% shot at two points (less from farther back) to the team trying
  if(G.conv){const v=S.next==='conv'&&S.conv?clamp(0.5-(97-(S.conv.los||97))*0.02,0.15,0.6)*2:0;return d+(S.conv&&S.conv.team===team?v:-v);}
  const fp=S.poss===team?(S.los*0.055-S.down*0.35-S.toGo*0.05+(S.next==='conv'?1:0)):-(S.los*0.055)-0.6;
  return d*1.0+fp;
}
function endPlay(r){
  if(G.phase!=='live')return;
  // a runner who is already in the end zone when he goes down (he got there during a stiff arm, a juke or while being wrapped up,
  // when the live goal-line check waits) scored: the play ended in the end zone, so it is a touchdown, not the 1-yard line
  if(r&&(r.type==='tackle'||r.type==='oob')&&G.carrier&&G.ballState==='carrier'&&!r.ballSpot){const c=G.carrier,ad=attackDir(c),xin=c.x>=0&&c.x<=FW;
    if(xin&&((ad>0&&c.y>=110)||(ad<0&&c.y<=10))){r={type:'td'};}}
  if(r&&r.spot!=null&&(r.type==='tackle'||r.type==='oob')&&G.carrier&&!r.ballSpot){const c=G.carrier,ad=attackDir(c);r.ballSpot=true;
    r.spot=r.spot+ad*gpBallReach(c);
    // the ball broke the plane before he was down
    if(G.play&&G.play.kind==='scrimmage'&&!G.conv&&r.type==='tackle'&&((ad>0&&r.spot>=110&&c.y<110)||(ad<0&&r.spot<=10&&c.y>10))&&c.x>=0&&c.x<=FW){r={type:'td'};flash('He reached the ball across the goal line!');}
    else if(ad>0)r.spot=Math.min(r.spot,109.95);else r.spot=Math.max(r.spot,10.05);}
  if(G.carrier&&G.carrier.dive>0&&r&&r.type==='td')G.carrier.tdLand=true;
  G.phase='dead';G.deadAt=G.time;G.aim=null;G.ptr=null;G.joy=null;G.joyV=null;G.recStop=G.time+1.3;setCtl();setTray('none');
  try{if(r&&r.type!=='td'&&r.type!=='presnap')setTimeout(()=>{try{SFX.whistle();}catch(e){}},120);}catch(e){}
  const P=G.play;
  let S=P.kind==='scrimmage'?(r.type==='presnap'?null:outcomeScrimmage(r)):P.fake&&r.type!=='presnap'?outcomeFake(r):outcomeKick(r);
  const fouls=P.kind==='scrimmage'?G.fouls:[];
  G.result={r,S};
  // v2.16 dirty play: a late hit after the whistle is a 15-yard personal foul on top of the play (rivalry games run hotter)
  // (a kneel-down or a spike has nobody to hit; out of bounds is where late hits happen most)
  if(P.kind==='scrimmage'&&!P.special&&S&&(r.type==='tackle'||r.type==='oob')&&!S.to&&S.td==null&&S.msg!=='SAFETY'&&!G.conv&&!fouls.length&&!G.demo&&!G.test){
    const hot=G.ents.some(e=>e.side!==(G.carrier&&G.carrier.side)&&e.pl&&gpTr(e.pl,'hothead')&&G.carrier&&dist(e,G.carrier)<3);
    if(!SEVENS()&&Math.random()<(GP&&GP.rival?0.035:0.01)*(hot?2:1)*(r.type==='oob'?1.6:1)){fouls.push({team:1-G.offTeam,kind:'Personal foul (late hit)',yds:15,afd:true,endSpot:true,late:true});try{throwFlag(G.refs[0]);SFX.hit(true);sndCrowdFor(G.offTeam,false);}catch(e){}}
  }
  if(r.type==='presnap'||fouls.length){
    const f=fouls[0];
    if(fouls.length>1&&fouls.some(x=>x.team!==f.team)){const R=baseS();R.msg='Offsetting penalties';R.sub='Replay the down';R.stop='snap';return commit(R,r);}
    // a personal foul on a touchdown play: the score stands and the 15 yards are marked off on the kickoff
    if(gpPF(f)&&S&&S.td!=null&&f.team!==S.td&&!G.conv){G.koPen=S.td;S.sub=`${S.sub?S.sub+'. ':''}${f.kind} on ${G.teams[f.team].abbr||G.teams[f.team].name}: 15 yards on the kickoff`;return commit(S,r);}
    const pen=gpEndSpotPen(f,S)||penaltyS(f);
    if(f.pre||!S)return commit(pen,r);
    const victim=1-f.team;
    if(userDecides(victim)&&!G.simming){
      G.phase='decide';
      const desc=s=>`${s.msg}${s.sub?' · '+s.sub:''}`;
      olAsk(victim,'Flag on the play',`${f.kind} on ${G.teams[f.team].name}. Accept: ${desc(pen)}. Decline: ${desc(S)}.`,
        [['Accept','go'],['Decline','alt']],i=>commit(i===0?pen:S,r));
      return;
    }
    return commit(evalS(pen,victim)>=evalS(S,victim)?pen:S,r);
  }
  commit(S,r);
}
function commit(S,r){
  try{gpTrack(S,r);}catch(e){G.gpErr=(G.gpErr||0)+1;G.gpErrMsg=String(e&&e.message||e);}
  try{gpPracticeCommit(S);}catch(e){}
  if(G.simming)logPlay(S,r);
  G.phase='dead';
  const P=G.play;
  if(P.kind==='scrimmage'&&S.gain!=null&&!G.conv){const o=G.offTeam,gn=Math.round(S.gain);G.stats[o].yds+=gn;if(P.off.kind==='pass'&&!P.special)G.stats[o].pass+=gn;else G.stats[o].rush+=gn;} // a kneel is a run
  if(S.to&&!S.td)G.stats[1-G.offTeam].to+=0,G.stats[G.offTeam].to+=(G.turnover||G.picker)?1:0;
  G.score=S.score;G.poss=S.poss;G.los=S.los;G.down=S.down;G.toGo=S.toGo;G.next=S.next;
  if(G.demo){if(S.td!=null)G.demoTD=true;G.next='scrimmage';G.conv=null;G.poss=Math.random()<0.5?0:1;G.los=Math.round(rnd(52,86));G.down=1;G.toGo=10;G.clock=QLEN;G.q=1;G.score=[0,0];}
  if(S.kickTeam!=null){G.kickTeam=S.kickTeam;G.kickSpot=S.kickSpot;}
  G.conv=S.conv;
  if(S.stop==='snap'){G.clockRun=false;G.restartReady=false;}
  else if(S.stop==='ready'){G.clockRun=false;G.restartReady=true;}
  try{gpMercy(S);}catch(e){}
  if(G.q>4)G.clockRun=false;
  if(S.td!=null){G.cele=S.td;G.cheer=S.td===gpHomeTeam()?3:0.5;try{gpTdCard(S);}catch(e){}}
  else if(S.msg==='Interception'||S.msg==='Turnover')G.cele=1-G.offTeam;
  try{gpResultSound(S,r);}catch(e){}
  toast(S.msg,S.sub);if(G.measure){const m=G.measure;G.measure=null;setTimeout(()=>{try{flash(m);}catch(e){}},700);}
  // stamina, injuries
  const onField=new Set(G.ents.filter(e=>e.pl).map(e=>e.pl.id));
  for(const T of G.teams)for(const p of T.roster){
    if(onField.has(p.id)){const e=G.ents.find(x=>x.pl===p),endur=p.end?clamp(1.3-(p.end-40)*0.0105,0.72,1.35):clamp(1.15-((p.str||70)*0.3+(p.ovr||60)*0.7-60)*0.008,0.8,1.3);p.stamina=clamp(p.stamina-(2.2+e.run*0.16+(e.eng>0||e.engWith?1:0))*endur*WX.heat,0,100);}
    else p.stamina=clamp(p.stamina+7/Math.sqrt(WX.heat)*(p.end?0.7+p.end/180:1),0,100);
    if(p.inj&&p.inj.plays<99&&!onField.has(p.id)){p.inj.plays--;if(p.inj.plays<=0)p.inj=null;}
  }
  if(G.injNote){G.clockRun=false;const n=G.injNote;setTimeout(()=>flash(n),900);}
  if(G.ot)otAdjust(S);
  G.cball=null;G.celebPick=null;for(const e of G.ents)e.celeb=null;
  const celeb=celebrateAfter(S);
  try{gpMaybeFight(S,r);}catch(e){}
  G.after={t:S.td!=null?(celeb?6.6:2.8):celeb==='sack'?3.3:celeb==='pbu'||celeb==='int'?2.9:celeb==='fd'?2.7:2.1,fn:proceed};
  if(S.td!=null||S.first||celeb==='sack')G.recStop=G.time+(S.td!=null?6.2:celeb==='sack'?3.0:2.0);
  setTray(G.celebPick&&G.celebPick.team===G.me?'celebrate':'dead');
}
// the crowd and the stadium react to the result of every snap
// v2.16 scuffles after the whistle: two players shove, the refs break it up, sometimes someone is thrown out
function gpMaybeFight(S,r){
  if(SEVENS()||G.demo||G.test||G.noDraw||G.simming||S.td!=null||!r||!['tackle','oob'].includes(r.type)||(G.play&&G.play.special))return;
  const c=G.carrier;if(!c||!c.pl)return;let b=null,bd=3;for(const e of G.ents)if(e.team!==c.team&&e.pl&&!e.hurt){const d=dist(e,c);if(d<bd){bd=d;b=e;}}if(!b)return;
  const hot=gpTr(c.pl,'hothead')||gpTr(b.pl,'hothead'),p=(GP&&GP.rival?0.05:0.012)*(hot?2.2:1)*(GP&&GP.big?1.3:1);
  if(Math.random()>=p)return;
  G.fight={a:c,b,t:1.8};flash('Scuffle after the play!');try{SFX.pads(8);sndCrowdFor(c.team,false);}catch(e){}
  for(const R of G.refs||[]){R.tx=c.x;R.ty=c.y;}
  if(hot&&Math.random()<0.35){const out=gpTr(b.pl,'hothead')?b:c;out.pl.inj={type:'ejected',plays:999};setTimeout(()=>{try{flash(`#${out.pl.num} ${out.pl.last} is ejected`);}catch(e){}},1400);}
  else if(Math.random()<0.5)setTimeout(()=>{try{flash('Offsetting unsportsmanlike fouls, no yardage');}catch(e){}},1400);
}
function gpFightStep(dt){const F=G.fight;if(!F)return;F.t-=dt;if(F.t<=0){G.fight=null;return;}
  for(const[e,o]of[[F.a,F.b],[F.b,F.a]]){const dx=o.x-e.x,dy=o.y-e.y,l=Math.hypot(dx,dy)||1,w=Math.sin(G.time*13+(e===F.a?0:Math.PI));
    e.x+=dx/l*w*0.05;e.y+=dy/l*w*0.05;e.stiff=0.25;e.stiffDur=0.25;e.down=false;e.dir=Math.sign(dy)||e.dir;}}
function gpResultSound(S,r){
  if(G.noDraw||G.simming)return;const off=G.offTeam,def=1-off;
  if(S.td!=null){SFX.whistle();sndCrowdFor(S.td,true);if(S.td===gpHomeTeam()){setTimeout(()=>SFX.horn(),350);setTimeout(()=>{try{bandFight();}catch(e){}},1600);}return;}
  if(/GOOD/.test(S.msg)&&!/NO GOOD/.test(S.msg)){sndCrowdFor(off,true);return;}
  if(/NO GOOD|Blocked/.test(S.msg)){sndCrowdFor(off,false);return;}
  if(S.msg==='SAFETY'){sndCrowdFor(def,true);return;}
  if(S.to&&S.poss===def){sndCrowdFor(def,true);return;}
  if(r&&r.type==='inc'){sndCrowdFor(off,false);return;}
  if(/^Sacked/.test(S.msg)){sndCrowdFor(def,true);return;}
  if(S.first){SFX.chime();if(S.gain>=12)sndCrowdFor(off,true);}
}
function proceed(){
  G.lastRec=G.rec;G.rec=null;
  if(G.demo&&G.demoTD){G.demoTD=false;const R=G.lastRec;if(R&&R.frames.length>40){G.demo.clips.push(R);if(G.demo.clips.length>4)G.demo.clips.shift();G.demo.fresh++;}}
  aiTimeout();
  if(G.q<=4&&G.clock<=0&&G.next!=='conv'){periodEnd();return;}
  nextSnap();
}
function aiTimeout(){
  if(G.q>4||!(G.q===2||G.q===4)||!G.clockRun||G.clock>55)return;
  for(const t of[0,1]){if(!isAI(t)&&!G.test)continue;
    const diff=G.score[t]-G.score[1-t];
    if(G.to[t]>0&&(diff<0||(diff===0&&G.q===4))&&G.poss===t||(G.to[t]>0&&diff<0&&G.poss!==t&&G.clock<40)){callTimeout(t);return;}}
}
// mercy rule (high school): a lead of GP.mercy points in the second half keeps the clock running, even after incompletions and out of bounds (not after scores)
function gpMercy(S){if(!GP||!GP.mercy||GP.practice||G.ot||G.q<3||G.q>4||S.td!=null||G.conv||G.next==='kickoff')return;if(Math.abs(G.score[0]-G.score[1])<GP.mercy)return;
  if(!G.mercyOn){G.mercyOn=true;setTimeout(()=>{try{flash('Mercy rule: running clock');}catch(e){}},1200);}G.clockRun=true;G.restartReady=false;}
function callTimeout(t){
  if(G.to[t]<=0)return false;
  if(G.client){olCmd('to');return false;}
  G.to[t]--;G.lastTimeoutAt=G.time;G.clockRun=false;G.restartReady=false;G.playClock=20;
  flash(`Timeout, ${G.teams[t].name} (${G.to[t]} left)`);return true;
}
function periodEnd(){
  const q=G.q;try{SFX.whistle();}catch(e){}
  if(q===1||q===3){G.q++;G.clock=QLEN;G.clockRun=false;flash(`End of the ${q===1?'1st':'3rd'} quarter`);nextSnap();return;}
  if(q===2){G.q=SEVENS()?4:3;G.clock=QLEN;G.clockRun=false;G.to=[3,3];G.next='kickoff';G.kickTeam=G.openRecv;G.kickSpot=35;G.conv=null;
    const _htx=`${scoreLine()}. ${G.teams[G.openRecv].name} received the opening kickoff, so they kick off to start the second half.`+(!ON&&gpAutoSimTeam(1-G.openRecv)?` ${1-G.openRecv===G.me?'Your':'Their'} first drive is simulated.`:!ON&&G.openRecv===G.me?' You start this half on defense.':!ON?' You get the ball first this half.':'');
    olInfo('Halftime',_htx);
    showModal('Halftime',_htx,[['Start 2nd half','go',nextSnap]]);if(ON)olAutoGo(12);return;}
  if(G.score[0]===G.score[1]){startOT();return;}
  gameOver();
}
function startOT(){
  const first=Math.random()<0.5?0:1;
  G.ot={round:1,first,turn:0,cur:first};G.q=5;G.clockRun=false;G.to=[1,1];
  G.poss=first;G.los=75;G.down=1;G.toGo=10;G.next='scrimmage';G.conv=null;
  olInfo('Overtime',`Tied ${scoreLine()}. ${G.teams[first].name} get the ball first at the 25.`);
  showModal('Overtime',`Tied ${scoreLine()}. ${G.teams[first].name} get the ball first at the 25.`,[['Start overtime','go',nextSnap]]);if(ON)olAutoGo(10);
}
function otAdjust(S){
  const O=G.ot;
  const over=S.next==='kickoff'||S.poss!==O.cur&&S.next!=='conv'||(O.round>=3&&S.next!=='conv');
  if(S.next==='conv'){if(O.round>=2)G.conv=Object.assign({},S.conv,{force2:true});return;}
  if(!over)return;
  if(O.turn===0){O.turn=1;O.cur=1-O.cur;}
  else{
    if(G.score[0]!==G.score[1]){G.next='over';return;}
    O.round++;O.turn=0;O.first=1-O.first;O.cur=O.first;G.to=[1,1];
  }
  G.poss=O.cur;G.los=75;G.down=1;G.toGo=10;G.conv=null;
  if(O.round>=3){G.next='conv';G.conv={team:O.cur,force2:true,shootout:true};}
  else G.next='scrimmage';
}
function nextSnap(){
  G.cele=null;G.injNote=null;
  if(G.next==='over'){gameOver();return;}
  if(G.next==='kickoff'&&SEVENS()){const R=1-G.kickTeam;G.poss=R;G.offTeam=R;G.los=40;G.down=1;G.toGo=10;G.next='scrimmage';G.conv=null;G.onsideNext=false;G.clockRun=false;
    G.phase='dead';setTray('none');$('ctl').innerHTML='';toast('New possession',`${G.teams[R].abbr} ball at its own 40`);updateHUD();G.after={t:1.1,fn:proceed};return;}
  if(G.next==='kickoff'){
    if(G.koPen!=null){if(G.koPen===G.kickTeam&&!G.ot)G.kickSpot=Math.min(50,(G.kickSpot||35)+15);G.koPen=null;}
    if(G.ot){otAdjust({next:'kickoff',poss:G.poss});if(G.next==='over'){gameOver();return;}return nextSnap();}
    const kt=G.kickTeam,trail=G.score[1-kt]-G.score[kt];
    const go=onside=>{G.onsideNext=onside===true&&!userDecides(kt)?pick(['std','left','right','popup']):onside;if(!onside&&GDS.kr===false&&!ON&&!G.test&&!G.demo&&!(GP&&GP.practice)&&!G.simming&&!G.simQtr&&!G.gpFast){gpQuickKick(G.kickTeam);return;}setupKickoff(G.kickTeam,G.kickSpot);toPresnap();};
    if(userDecides(kt)&&!G.simming){olAsk(kt,'Kickoff','Kick it deep, or try an onside kick and keep the ball?',[['Kick deep','go'],['Onside kick','alt']],i=>{if(i!==1){go(false);return;}
      olAsk(kt,'Onside formation','Standard: balanced, kicked to either side. Overload: seven of your players stacked on one side, kicked there. Pop-up: a high bloop over the front line for your players to run under.',[['Standard','go'],['Overload left','alt'],['Overload right','alt'],['Pop-up','alt']],j=>go(['std','left','right','popup'][j]||'std'));});return;}
    go(G.q>=4&&G.clock<150&&trail>0&&trail<=16);return;
  }
  if(G.next==='conv'){
    const t=G.conv.team;G.offTeam=G.poss=t;
    // offense-only / defense-only games: the other side's try is simulated too (a pick six used to put you on defense for the two-point try)
    if(!G.simming&&!G.test&&!G.simQtr&&!G.gpFast&&!ON&&!pcOn()&&gpAutoSimTeam(t)){G.drivePoss=t;startSim(true,nextSnap);return;}
    const sp=G.conv.los||97,go=two=>{if(two){G.los=sp;G.down=1;G.toGo=100-sp;G.conv.two=true;openCall();}else{G.conv.two=false;G.los=sp;setupFG('xp');toPresnap();}};
    if(G.conv.force2||G.conv.rep||SEVENS()){go(true);return;}
    if(userDecides(t)&&!G.simming){olAsk(t,'Conversion','Kick the extra point from the 3, or go for two?',[['Extra point','go'],['Go for two','alt']],i=>go(i===1));return;}
    const d=G.score[t]-G.score[1-t];go(G.q>=4&&[-2,-5,-10,1,-1].includes(d)&&Math.random()<0.8);return;
  }
  if(G.simming&&(G.poss!==G.simTeam||G.q!==G.simQ&&G.q===3&&!(G.simAuto&&gpAutoSimTeam(G.poss)))){endSim();return;}
  // offense-only / defense-only: checked every snap, not only when the ball changes hands. A drive simulated into halftime used to hand
  // you the other side's second-half drive (same team with the ball, so no new drive was seen) with no way to simulate it
  if(!G.simming&&!G.test&&!G.simQtr&&!G.gpFast&&!ON&&!pcOn()&&gpAutoSimTeam(G.poss)){G.drivePoss=G.poss;startSim(true);return;}
  // Player Career: checked every snap, not only when the ball changes hands, so a series without your unit is always simulated
  if(!G.simming&&!G.test&&!G.simQtr&&!G.gpFast&&!ON&&pcOn()){if(G.poss!==G.drivePoss){G.drivePoss=G.poss;pcDrive();}if(!G.pcIn){pcBenchOut();startSim(true);if(G.pcRot)$('simTitle').textContent='Rotation: the coach gives your backup this series';return;}}
  else if(!G.simming&&!G.test&&!G.simQtr&&!G.gpFast&&G.poss!==G.drivePoss){G.drivePoss=G.poss;if(!ON){if(gpAutoSimDrive()){startSim(true);return;}drivePrompt();return;}}
  G.offTeam=G.poss;openCall();
}
// v2.15 kick returns off (Settings): the kickoff resolves at once, with a spot that depends on the returner's speed
function gpQuickKick(kt){
  const R=1-kt,T=G.teams[R],ret=T.roster.filter(p=>!p.inj&&['RB','WR','CB','S'].includes(p.pos)).sort((a,b)=>(b.spd||0)-(a.spd||0))[0],sp=ret?ret.spd||70:70;
  let los,msg,sub;
  if(Math.random()<0.35){los=25;msg='Touchback';sub='Ball at the 25';}
  else{let y=17+Math.random()*13+(sp-70)*0.22;if(Math.random()<0.06)y+=15+Math.random()*25;los=clamp(Math.round(y),8,80);
    msg='Kick return';sub=`${ret?'#'+ret.num+' '+(ret.last||ret.first):'The returner'} brings it out to the ${los<50?T.abbr+' '+los:los===50?'50':G.teams[kt].abbr+' '+(100-los)}`;}
  G.poss=R;G.offTeam=R;G.los=los;G.down=1;G.toGo=10;G.next='scrimmage';G.conv=null;G.onsideNext=false;G.clockRun=false;G.restartReady=false;
  G.phase='dead';setTray('none');$('ctl').innerHTML='';toast(msg,sub);updateHUD();G.after={t:1.4,fn:proceed};
}
