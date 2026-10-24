/* ===================== drive simulation ===================== */
function drivePrompt(){
  if(pcOn()){G.offTeam=G.poss;openCall();return;}
  const mine=G.poss===G.me,T=G.teams[G.poss];
  showModal(mine?'Your ball':`${T.name} ball`,`${mine?'Offense':'Defense'}: ${spotTxt(G.los)}. Play this drive yourself, or simulate it?`,
    [['Play it','go',()=>{G.offTeam=G.poss;openCall();}],['Sim drive','alt',()=>startSim()]]);
}
function spotTxt(los){los=Math.round(los);return los===50?'midfield':los<50?`${G.teams[G.poss].abbr} ${los}`:`${G.teams[1-G.poss].abbr} ${100-los}`;}
function startSim(auto){
  G.simAuto=!!auto;G.simming=true;G.simTeam=G.poss;G.simQ=G.q;G.simPrevAI=[...G.ai];G.ai=[true,true];G.simLog=[];G.simStart={score:[...G.score],los:G.los,clock:G.clock,q:G.q};
  $('simTitle').textContent=`Simulating ${G.teams[G.poss].name} drive…`;$('simList').innerHTML='';$('simSum').textContent='';$('simGo').hidden=true;show('simBox');
  G.noDraw=true;G.offTeam=G.poss;openCall();simChunk();
}
function simChunk(){
  if(!G.simming)return;
  for(let i=0;i<240&&G.simming;i++){
    if(!$('modal').hidden){const b=$('mB').querySelector('button');if(b)b.click();}
    if(G.phase==='call'){openCall();}
    step(1/30);
    if(G.phase==='over'){endSim();return;}
  }
  if(G.simming)setTimeout(simChunk,0);
}
function logPlay(S,r){
  const p=G.pbp||{},dn=['','1st','2nd','3rd','4th'][p.d]||'';
  const pre=p.conv?'Conversion':`${dn} & ${p.tg>=100-p.los?'Goal':p.tg}`;
  const txt=`${G.teams[p.team!=null?p.team:G.offTeam].abbr} · ${pre} · ${p.call||''}: ${S.msg}${S.sub?''+S.sub:''}`;
  G.simLog.push(txt);const li=document.createElement('div');li.className='simRow';li.textContent=txt;$('simList').appendChild(li);$('simList').scrollTop=1e6;
}
function endSim(){
  if(!G.simming)return;G.simming=false;G.ai=G.simPrevAI;G.noDraw=false;
  const a=G.simStart,pts=[G.score[0]-a.score[0],G.score[1]-a.score[1]];
  $('simTitle').textContent='Drive complete';
  $('simSum').textContent=`${G.simLog.length} plays. ${pts[0]||pts[1]?`Points: ${G.teams[0].name} +${pts[0]}, ${G.teams[1].name} +${pts[1]}. `:'No points. '}Score: ${scoreLine()}.`;
  $('simGo').hidden=false;
  $('simGo').onclick=()=>{hide('simBox');updateHUD();if(G.phase==='over')return;if(G.phase==='dead'&&G.after)return;nextSnap();};
  // offense-only / defense-only games: the simulated drive closes on its own after a moment
  if(G.simAuto){G.simAuto=false;setTimeout(()=>{if(!$('simBox').hidden&&!$('simGo').hidden)$('simGo').click();},2600);}
}
function scoreLine(){return `${G.teams[0].name} ${G.score[0]}, ${G.teams[1].name} ${G.score[1]}`;}
function gameOver(){
  try{if(G.phase!=='over'&&!G.noDraw){SFX.whistle();setTimeout(()=>{try{SFX.horn();}catch(e){}},500);}}catch(e){}
  G.phase='over';const[a,b]=G.score,s=G.stats;
  if(ON&&!G.gpDone)olGameOver();
  if(GP&&!G.gpDone){G.gpDone=true;try{window.parent.gdFinish({online:ON||undefined,pcAsks:G.pcAsks||0,ot:G.q>4,practice:!!GP.practice,tut:G.tutResult||null,score:[a,b],stats:G.st||{},splits:G.splits||null,played:Object.keys(G.played||{}),yds:[s[0].yds,s[1].yds]});}catch(e){}return;}
  showModal(a>b?'You win':a<b?(G.teams[1].name+' win'):'Tie game',`Final: ${scoreLine()}. Total yards: ${G.teams[0].name} ${s[0].yds}, ${G.teams[1].name} ${s[1].yds}.`,[['Play again','go',newGame]]);
}

/* ===================== play calling ===================== */
function aiOffCall(){
  const ly=G.los,d=G.down,tg=G.toGo,t=G.offTeam,diff=G.score[t]-G.score[1-t];
  if(SEVENS()){const r=Math.random();if(r<0.3){const f=pick(['trips','tripsTE']);return{kind:'pass',data:{...pick(TRIPS_PLAYS),f}};}if(r<0.55){const f=pick(['empty','emptyTE']);return{kind:'pass',data:{...pick(EMPTY_PLAYS),f}};}return{kind:'pass',data:pick(PASSES)};}
  if(G.conv)return Math.random()<0.5?{kind:'run',data:pick(RUNS.slice(0,4))}:{kind:'pass',data:pick(PASSES)};
  // victory formation only when the kneels can really run the clock out (one takes about 27 seconds late in the game, 12 before the half,
  // and every timeout the other side still has costs one), never from his own 2 (that is a safety) and never on 4th down with time to give it back
  if(!G.ot&&(G.q===2||G.q===4)&&diff>0&&G.clockRun&&ly>2&&G.clock<=Math.max(0,4-d-(G.to[1-t]||0))*(G.q===4?27:12)+2)return{kind:'kneel'};
  if(d===4&&!G.ot){
    // fourth down like a real coach: short yardage past midfield goes for it, inches go for it almost anywhere but deep in his own end,
    // trailing late goes for it, a field goal only when it's the right call
    const fgD=100-ly+17,late=G.q===4&&diff<0&&G.clock<90,lateish=G.q===4&&diff<0&&G.clock<240;
    const goP=tg<=1?(ly>=60?0.85:ly>=35?0.75:ly>=20?0.35:0.08):tg<=2?(ly>=60?0.6:ly>=45?0.45:ly>=35?0.2:0.04):tg<=4?(ly>=60&&fgD>52?0.35:ly>=50?0.12:0.03):(ly>=65&&fgD>52?0.12:0);
    const go=late&&!(fgD<=52&&diff>=-3)||lateish&&diff<=-9||G.q===4&&diff<=-17&&G.clock<480||Math.random()<goP;
    if(!go&&fgD<=52)return tg<=3&&Math.random()<0.04?{kind:'fakefg'}:{kind:'fg'};
    if(late&&fgD<=52&&diff>=-3)return{kind:'fg'};
    if(!go)return tg<=4&&ly>=30&&ly<=60&&Math.random()<0.05?{kind:'fakepunt'}:{kind:'punt'};
  }
  if(d===4&&G.ot&&100-ly+17<=48&&!(tg<=2))return{kind:'fg'};
  // the score and the clock decide too: behind late they throw, ahead late they run it and keep the clock moving
  const behindLate=(G.q>=4&&diff<0)||(G.q===2&&G.clock<60&&diff<=0),aheadLate=G.q>=4&&diff>0&&G.clock<300;
  if(tg<=1&&Math.random()<(behindLate&&diff<=-9?0.15:0.4))return{kind:'run',data:RUNS[5]};
  {const pc=behindLate&&Math.random()<0.6?null:gpPBCall(t,d,tg);if(pc)return pc;}
  let passP=d===3&&tg>5?0.82:d===1?0.5:0.58;
  if(behindLate)passP=Math.max(passP,diff<=-9?0.88:G.clock<120?0.85:0.72);else if(aheadLate)passP=Math.min(passP,d===3&&tg>5?0.6:0.25);
  if(Math.random()<passP){
    const r=Math.random(),spread=d===3&&tg>5?0.45:0.28;
    if(r<spread*0.55){const f=pick(['trips','tripsTE']);return{kind:'pass',data:{...pick(TRIPS_PLAYS),f}};}
    if(r<spread){const f=pick(['empty','emptyTE']);return{kind:'pass',data:{...pick(EMPTY_PLAYS),f}};}
    return{kind:'pass',data:pick(PASSES)};
  }
  return{kind:'run',data:pick(RUNS.filter(r=>!r.qb))};
}
function aiDefCall(){
  const tg=G.toGo,d=G.down;
  const w=d===3&&tg>6?[['C0',5],['DAG',5],['NBZ',6],['C1',12],['C1R',8],['C2',12],['C2M',10],['T2',8],['C3',12],['CBZ',5],['C4',10],['C6',7],['FZ',8],['C3B',6],['C1S',5],['C2I',6],['SIM',7]]
        :tg<=2?[['C0',14],['DAG',10],['NBZ',8],['C1',22],['C1R',10],['C3',14],['CBZ',6],['C2',4],['FZ',8],['C2M',4],['C1S',6],['SIM',6],['C3B',5]]
        :[['C0',4],['DAG',3],['NBZ',5],['C1',14],['C1R',9],['C2',11],['C2M',6],['T2',8],['C3',16],['CBZ',5],['C4',8],['C6',6],['FZ',6],['C3B',9],['C1S',5],['C2I',5],['SIM',5]];
  const id=pickW(gpDefWeights(w));return DCALLS.find(c=>c.id===id);
}
// 2 players on one device: whoever has the ball is in control; the computer plays defense for both
function gpHotseat(t){if(!(GP&&GP.hotseat)||ON||G.simming||t==null)return;if(G.me!==t){G.me=t;G.act=t;G.uctl=null;try{flash(`${G.teams[t].name} ball: Player ${t+1}`);}catch(e){}}G.ai=[t!==0,t!==1];}
function openCall(){
  G.phase='call';setTray('none');$('ctl').innerHTML='';gpHotseat(G.offTeam);
  const off=G.offTeam;
  if(pcOn()&&!G.simming){const o=off===G.me&&G.pcWant&&GP.pc.pos==='RB'&&!G.conv&&G.down<4?{kind:'run',data:pick(RUNS.filter(r=>!r.qb))}:aiOffCall();
    applyCall(o,['punt','fg','kneel','fakepunt','fakefg'].includes(o.kind)?DCALLS[3]:aiDefCall());return;}
  if(coachOn()&&!G.simming&&!G.simQtr&&!G.gpFast&&!G.test){
    if(off===G.me){showCall('off',(o)=>applyCall(o,aiDefCall()));return;}
    const o=aiOffCall();if(o.kind==='punt'||o.kind==='fg'||o.kind==='kneel'){applyCall(o,DCALLS[3]);return;}showCall('def',(d)=>applyCall(o,d));return;}
  if(G.test||(isAI(0)&&isAI(1))){applyCall(aiOffCall(),aiDefCall());return;}
  if(ON){olOpenCall();return;}
  if(!isAI(off))showCall('off',(o)=>applyCall(o,aiDefCall()));
  else{const o=aiOffCall();if(['punt','fg','kneel','fakepunt','fakefg'].includes(o.kind)){applyCall(o,DCALLS[3]);return;}showCall('def',(d)=>applyCall(o,d));}
}
function applyCall(o,d){
  if(G.phase==='replay'){G.pendCall=[o,d];return;} // a replay is running on this screen: snap once it closes
  hide('call');G.pcWant=false;
  G.pbp={d:G.down,tg:G.toGo,los:G.los,team:G.offTeam,conv:!!G.conv,call:o.kind==='pass'||o.kind==='run'?((o.data.f?FORMS[o.data.f].n+' ':'')+o.data.n):o.kind==='fg'?'Field goal':o.kind==='punt'?'Punt':o.kind==='fakepunt'?'Fake punt':o.kind==='fakefg'?'Fake field goal':o.kind==='kneel'?'Kneel':o.kind==='spike'?'Spike':o.kind};
  if(G.clockRun&&G.q<=4){G.clock=Math.max(0,G.clock-6);if(G.clock<=0){proceed();return;}}
  if(o.kind==='punt'){setupPunt(G.offTeam,G.los);}
  else if(o.kind==='fg'){setupFG('fg');}
  else if(o.kind==='fakepunt'){setupPunt(G.offTeam,G.los);G.play.fake='punt';gpFakeLineup();}
  else if(o.kind==='fakefg'){setupFG('fg');G.play.fake='fg';gpFakeLineup();}
  else if(o.kind==='kneel'||o.kind==='spike'){setupScrimmage({kind:'pass',data:PASSES[3]},d);G.play.special=o.kind;
    // no routes on a kneel or a spike (they used to be drawn and could be audibled); the QB takes the snap under center
    for(const e of G.recv||[]){e.route=null;e.block=true;}G.recv=[];if(G.qb){G.qb.y=G.qb.hy=G.linesW.los-1.1;}}
  else setupScrimmage(o,d);
  G.play.defCall=d;
  toPresnap();
  if(pcOn())try{pcShowPlay(o,d);}catch(e){}
}
const PC_RT={go:'go route',seam:'seam',slant:'slant',qout:'quick out',out:'out route',hitch:'hitch',curl:'curl',comeback:'comeback',dig:'dig',post:'post',corner:'corner',drag:'drag',flat:'flat route',wheel:'wheel route',check:'check-down',angle:'angle route',stick:'stick',in6:'in route',cross:'crossing route',stutter:'stutter-go',screen:'screen',bubble:'bubble screen',swing:'swing route',block:'pass protection'};
function pcShowPlay(o,d){
  const el=$('pcPlay');if(!el)return;el.hidden=true;if(G.simming||G.noDraw||!G.play||G.play.kind!=='scrimmage')return;
  const me=G.ents.find(e=>pcMe(e));if(!me){return;}
  const off=me.side==='o',name=off?(G.pbp&&G.pbp.call)||'':(d&&d.n)||'';
  let job='';
  if(off){if(me.role==='QB')job=o.kind==='pass'?'Read the field and deliver the ball':o.data&&o.data.qb?'Keep it and run':'Hand the ball off';
    else if(o.kind==='run'&&(G.rb===me))job='You get the ball: follow the yellow path';
    else if(me.route)job='Run a '+(PC_RT[me.route.name]||me.route.name||'route').replace(/^Run a ([aeiou])/i,'Run an $1');
    else job=me.role==='OL'?(o.kind==='pass'?'Protect the quarterback':'Open the hole'):'Block for the ball carrier';
}
  else{const C=me.cover||{};job=C.type==='man'&&C.man&&C.man.pl?`Man coverage on #${C.man.pl.num}`:C.type==='zone'?(C.deep?'Zone: keep everything in front of you, deep':'Zone: cover your area underneath'):C.type==='blitz'?'Blitz: get to the quarterback':C.type==='rush'?'Rush the passer, stop the run':'Read and react';if(C.type!=='blitz'&&/blitz/i.test(name))job+=' (others bring the blitz)';}
  const hi=me.slot,svg=off?(o.kind==='pass'||o.kind==='run'?diagramSVG(o.kind,o.data,hi):''):diagramSVG('def',d,hi);
  {const w=toW(me.x,me.y),q=proj(w[0],w[1]),Z=G.zm,sx=Z?Z.cx+(q.sx-Z.cx)*Z.z:q.sx;el.classList.toggle('rt',sx<W*0.5);}
  {const w=toW(me.x,me.y),q=proj(w[0],w[1]),Z=G.zm,sx=Z?Z.cx+(q.sx-Z.cx)*Z.z:q.sx;el.classList.toggle('rt',sx<W*0.5);}
  el.innerHTML=`<span class="pck">Coach's call<\/span><b>${name}<\/b>${svg}<span class="pck">Your job<\/span><div style="font-weight:800">${job}<\/div>`;el.hidden=false;
}
function toPresnap(){
  G.phase='presnap';G.presnapAt=G.time;G.playClock=20;G.t=0;G.started=true;
  if(G.restartReady){G.clockRun=true;G.restartReady=false;}
  const P=G.play;
  G.uctl=null;G.meter=null;
  const dT=1-G.offTeam;
  G.snapIn=rnd(2.2,4.5);G.rmeter=null;
  if(P.kind==='scrimmage'){
    if(!isAI(dT)&&!G.test){const pref=G.uSlotT[dT]||(dT===0&&G.uSlot)||'MLB';G.uctl=G.ents.find(e=>e.side==='d'&&e.slot===pref)||G.ents.find(e=>e.slot==='MLB');}
    if(pcOn())G.uctl=dT===G.me?(G.ents.find(e=>pcMe(e)&&e.side==='d')||null):pcAIQB()?(G.ents.find(e=>pcMe(e)&&e.side==='o'&&e.role!=='OL')||null):null;
    const diff=G.score[G.offTeam]-G.score[1-G.offTeam];
    if(isAI(G.offTeam)&&G.clockRun&&diff>0&&G.q>=4&&!G.ot)G.snapIn=Math.max(2,G.playClock-1.5);
  }else{
    const kicker=P.kind==='kickoff'?P.kickTeam:P.kind==='punt'?P.puntTeam:G.offTeam;
    G.snapIn=1.3;
    if(!isAI(kicker)&&!G.test&&!P.fake&&(!pcOn()||pcUnit()==='k')){G.meter={stage:'power',t:0,power:0,acc:0,val:0};}
    gpKickSetup();
    if(ON&&G.meter&&kicker!==G.me){G.rmeter=Object.assign({team:kicker,at:G.time},G.meter);G.meter=null;}
    if(G.meter)showMeter();
  }
  setTray('presnap');setCtl();
}
function doSnap(){
  if(G.client){if(G.phase==='presnap')olCmd('snap');return;}
  if(G.phase==='presnap'&&G.play&&G.play.kind==='scrimmage'&&!(isAI(G.offTeam)||G.test||pcAIQB())&&gpNoiseFS())return; // a loud road crowd
  for(const e of G.ents)if(e.subIn){e.x=e.hx;e.y=e.hy;e.subIn=false;e.vx=e.vy=0;}
  if(G.phase!=='presnap')return;
  if(G.motion)return;if(G.play.kind==='scrimmage'&&!G.meter&&gpMotionStart())return;
  hide('meter');
  if(G.play.kind==='scrimmage')snapScrimmage();else snapKick();
  G.rec={frames:[],t0:G.time,last:-1};
  setTray('none');
}
