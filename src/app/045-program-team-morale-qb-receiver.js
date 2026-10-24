// ═══════════ PROGRAM: team morale, QB–receiver chemistry, captains, position coaches, position battles, senior night ═══════════
function earnedOn(){return!!(typeof G!=='undefined'&&G&&G.rules&&G.rules.earned);}
function progQB(){return getStarters(G.myId).find(p=>p.pos==='QB')||null;}
function progRcv(){return getStarters(G.myId).filter(p=>['WR','TE','RB'].includes(p.pos));}
function chemOf(qid,rid){const v=G.chem&&G.chem[qid+'|'+rid];return v==null?40:v;}
function chemAdd(qid,rid,d){G.chem=G.chem||{};const k=qid+'|'+rid;G.chem[k]=clamp(Math.round(((G.chem[k]!=null?G.chem[k]:40)+d)*10)/10,0,100);}
function chemAvg(){const q=progQB(),R=progRcv();if(!q||!R.length)return 50;return R.reduce((a,r)=>a+chemOf(q.id,r.id),0)/R.length;}
function moraleOf(){return G.morale==null?60:G.morale;}
function moraleLbl(m){return m>=85?'Fired up':m>=70?'Confident':m>=50?'Steady':m>=30?'Frustrated':'Rock bottom';}
function captains(){G.captains=(G.captains||[]).filter(id=>{const p=getP(id);return p&&p.sId===G.myId;});return G.captains;}
// what morale, chemistry and captains add to the team's strength (simulated games and Game Day): about −5 … +6
function progEdge(){return clamp((moraleOf()-60)/10,-4,4)+clamp((chemAvg()-50)/25,-2,2)+Math.min(3,captains().length)*0.3;}
function progAfterGame(win,o){o=o||{};const cap=captains().length;let d=win?6:-7;if(win&&o.rival)d+=3;if(o.playoff)d+=win?4:-3;if(Math.abs(o.margin||0)>=21)d+=win?2:-2;
  if(cap)d+=win?cap*0.7:cap*1.0; // captains lift the wins and soften the losses
  G.morale=clamp(Math.round(moraleOf()+d+(60-moraleOf())*0.08),5,100);
  const q=progQB();if(q){const cb=captains().includes(q.id)?1.25:1;for(const r of progRcv()){const y=o.sm&&o.sm[r.id]&&o.sm[r.id].recYds||0;chemAdd(q.id,r.id,(1.5+Math.min(3,y/30))*cb);}}}
function progPractice(){const q=progQB();if(!q)return;const cb=captains().includes(q.id)?1.25:1;for(const r of progRcv())chemAdd(q.id,r.id,1*cb);}
function progOffseason(){G.morale=Math.round(60+(moraleOf()-60)*0.4);
  if(G.chem){const on=new Set(myP().map(p=>p.id));for(const k of Object.keys(G.chem)){const[a,b]=k.split('|').map(Number);if(!on.has(a)||!on.has(b))delete G.chem[k];else G.chem[k]=Math.round((40+(G.chem[k]-40)*0.85)*10)/10;}}
  G.battles=[];captains();}
window.capToggle=function(pid){const c=captains(),i=c.indexOf(pid),p=getP(pid);if(!p)return;
  if(i>=0){c.splice(i,1);notify(`${p.fn} ${p.ln} is no longer a captain`);}else{if(c.length>=3){notify('You can name up to three captains. Remove one first.','w');return;}c.push(pid);notify(`${p.fn} ${p.ln} is a team captain`);}
  try{if(G._page==='depth')nav('depth');}catch(e){}};
// Game Day: chemistry with the starting QB, captain flag (the engine adds +3 awareness)
function progGdP(p){if(!G||p.sId!==G.myId)return{};const o={};if(['WR','TE','RB'].includes(p.pos)){const q=progQB();if(q)o.chem=Math.round(chemOf(q.id,p.id));}if(captains().includes(p.id))o.cap=true;return o;}
// weekly position battles: the last starter against the best backup when they're close; the winner earns +1 overall,
// and with earned progression on a backup who wins takes the job
function progBattles(wk){wk=wk||G.week;if(G.battleWk===wk&&G.battleYr===G.yr)return;G.battleWk=wk;G.battleYr=G.yr;
  const cnt=getStarterCnt(G.myId),pl=myP().filter(p=>p.inj===0&&!p.onJV),out=[],earned=earnedOn(),prac=!!(G.pracDone&&G.pracDone[pracKey()]);
  for(const pos of Object.keys(cnt)){const n=cnt[pos];if(!n||pos==='K')continue;const bn=(G.benched&&G.benched[pos])||[];
    const L=pl.filter(p=>p.pos===pos&&!bn.includes(p.id)).sort((a,b)=>{const ao=a.depth&&a.depth[pos]!=null?a.depth[pos]:999,bo=b.depth&&b.depth[pos]!=null?b.depth[pos]:999;return ao-bo||b.rat-a.rat;});
    if(L.length<=n)continue;const a=L[n-1],b=L[n];if(Math.abs(a.rat-b.rat)>4)continue;
    const sc=p=>p.rat+(atv(p,'awr')||60)/10+(p.traits&&p.traits.includes('competitor')?2:0)+rngF(0,prac?5:7);
    const w=sc(b)>sc(a)?b:a,l=w===a?b:a;
    if(w.rat<effPot(w)){w.rat++;try{_attrBoostForOvr(w,1);}catch(e){}}
    let swap=false;if(w===b&&earned){const ord=L.slice(),i=ord.indexOf(a),j=ord.indexOf(b);ord[i]=b;ord[j]=a;ord.forEach((q,k)=>{q.depth=q.depth||{};q.depth[pos]=k;});swap=true;}
    out.push({pos,w:`${w.fn} ${w.ln}`,l:`${l.fn} ${l.ln}`,swap,wk});
    addLog(`<span style="color:var(--te)">Position battle (${pos}): ${w.fn} ${w.ln} beat ${l.fn} ${l.ln}${swap?' and takes the starting spot':''}.</span>`);
    if(out.length>=4)break;}
  G.battles=out;if(out.length)updateRats();}
function progPanel(){const q=progQB(),R=progRcv(),cap=captains(),m=moraleOf(),B=G.battles||[];
  const bar=(v,c)=>`<div style="flex:1;min-width:60px;height:6px;background:var(--bd);border-radius:2px;overflow:hidden"><div style="width:${clamp(v,0,100)}%;height:100%;background:${c}"></div></div>`;
  return`<div class="pnl" style="margin-bottom:14px"><div class="ph">Program</div><div class="pb"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:18px">
    <div><div style="font-weight:800;margin-bottom:6px">Team morale: ${m} · ${moraleLbl(m)}</div><div style="display:flex">${bar(m,m>=70?'var(--gn)':m>=45?'var(--gd)':'var(--rd)')}</div>
      <div style="font-size:11px;color:var(--mu);margin:6px 0 12px">Wins (rivalry and playoff wins most) lift it, losses drop it. High morale adds a little to every rating, on Game Day and in simulated games.</div>
      <div style="font-weight:800;margin-bottom:6px">Captains (${cap.length}/3)</div>
      ${cap.length?cap.map(id=>{const p=getP(id);return`<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">${face(p.fs,26)}<span style="flex:1;font-size:13px"><b>${p.fn} ${p.ln}</b> · ${p.pos} · ${yrL(p.yr)}</span><button class="bgh bxs" onclick="capToggle(${p.id})">Remove</button></div>`;}).join(''):'<div style="font-size:12px;color:var(--mu)">No captains yet. Name up to three from a player\'s profile.</div>'}
      <div style="font-size:11px;color:var(--mu);margin-top:4px">Captains lift morale after wins and soften losses, speed up chemistry when the quarterback is one, and stay calmer on Game Day (+3 awareness).</div></div>
    <div><div style="font-weight:800;margin-bottom:6px">Quarterback chemistry${q?` · ${q.fn} ${q.ln}`:''}</div>
      ${q&&R.length?R.map(r=>{const c=Math.round(chemOf(q.id,r.id));return`<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;font-size:12px"><span style="width:120px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.pos} ${r.fn[0]}. ${r.ln}</span>${bar(c,c>=70?'var(--gn)':c>=40?'var(--gd)':'var(--rd)')}<b style="width:26px;text-align:right">${c}</b></div>`;}).join(''):'<div style="font-size:12px;color:var(--mu)">No starting quarterback.</div>'}
      <div style="font-size:11px;color:var(--mu);margin-top:4px">Grows with every game and practice the starters play together. Low chemistry costs the quarterback accuracy and the receiver a little focus.</div>
      <div style="font-weight:800;margin:12px 0 6px">Position battles${B.length?` · week ${B[0].wk}`:''}</div>
      ${B.length?B.map(b=>`<div style="font-size:12px;margin-bottom:3px"><b>${b.pos}</b>: ${b.w} beat ${b.l}${b.swap?' and takes the starting spot':''} (+1 OVR)</div>`).join(''):'<div style="font-size:12px;color:var(--mu)">Close starting spots are fought out every week in practice; the results show up here.'+(earnedOn()?' With earned progression on, a backup who wins takes the job.':'')+'</div>'}
    </div></div></div></div>`;}
const PCO=[['QB','Quarterbacks',['QB']],['RB','Running backs',['RB']],['WR','Receivers & tight ends',['WR','TE']],['OL','Offensive line',['OL']],['DL','Defensive line',['DL']],['LB','Linebackers',['LB']],['DB','Defensive backs',['CB','S']]];
function pcoachLvl(pos){const g=PCO.find(x=>x[2].includes(pos));return g&&G.pcoach&&G.pcoach[g[0]]?G.pcoach[g[0]].lvl||0:0;}
function pcoachCost(l){return l===0?8000:(l+1)*10000;}
function pcoachHtml(){G.pcoach=G.pcoach||{};return`<div class="pnl" style="margin-bottom:14px"><div class="ph">Position coaches</div><div class="pb">
  <div style="font-size:12px;color:var(--mu);margin-bottom:10px">Each one speeds up the growth of his position group, in season and in offseason training (level 1–5).</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px">${PCO.map(([k,l])=>{const c=G.pcoach[k],lv=c?c.lvl:0,cost=pcoachCost(lv),can=lv<5&&hasFunds(cost);
    return`<div style="background:var(--s2);border:1px solid var(--bd);border-radius:5px;padding:9px"><div style="display:flex;justify-content:space-between;gap:6px;align-items:start"><div><div style="font-weight:700">${c?c.name:'Not hired'}</div><div style="font-size:11px;color:var(--mu)">${l} coach${lv?` · Lvl ${lv}/5`:''}</div></div>
      <button class="btn bsm bbl" ${can?`onclick="pcoachUp('${k}',${cost})"`:'disabled style="opacity:.4"'}>${lv>=5?'MAX':lv?`Upg $${cost.toLocaleString()}`:`Hire $${cost.toLocaleString()}`}</button></div>
      <div style="display:flex;gap:3px;margin-top:6px">${[1,2,3,4,5].map(i=>`<div style="flex:1;height:5px;border-radius:2px;background:${i<=lv?'var(--te)':'var(--bd)'}"></div>`).join('')}</div></div>`;}).join('')}</div></div></div>`;}
window.pcoachUp=function(k,c){if(!hasFunds(c)){notify('Not enough budget!','e');return;}G.pcoach=G.pcoach||{};const cur=G.pcoach[k];if(cur&&cur.lvl>=5)return;if(!G.unlimitedMoney)G.budget-=c;
  if(cur)cur.lvl++;else G.pcoach[k]={name:`${pick(SFPFX)} ${pick(SFSFX)}`,lvl:1};notify(cur?`${cur.name} is now level ${cur.lvl}`:`${G.pcoach[k].name} hired`);nav('staff');};
// earned progression: ratings, potential, development and traits are locked in Edit Player
function earnedLock(){if(!earnedOn())return;const m=document.querySelector('#mo .mc')||document.getElementById('mo');if(!m)return;
  ['er','ept','ed','et'].forEach(id=>{const e=document.getElementById(id);if(e)e.disabled=true;});document.querySelectorAll('.at-in').forEach(e=>e.disabled=true);
  const h=m.querySelector('h2');if(h&&!document.getElementById('earnedNote')){const d=document.createElement('div');d.id='earnedNote';d.style.cssText='font-size:12px;color:var(--gd);margin:4px 0 6px';d.textContent='Earned progression is on (Settings → League rules): ratings, potential, development and traits are earned, not typed in.';h.after(d);}}
// senior night: before the winter offseason, the seniors are honored once
function seniorCeremony(){const S=myP().filter(p=>p.yr===12).sort((a,b)=>b.rat-a.rat);if(!S.length){runOffseason();return;}
  const yr=(G.baseYear||2026)+(G.yr-1),ms=myS();
  openMo(`<h2>Senior Night · Class of ${yr+1}</h2><div style="font-size:13px;color:var(--mu);margin-bottom:10px">${S.length} senior${S.length>1?'s':''} played their last game for ${ms.name} ${ms.mascot}. The team and the crowd say thank you.</div>
    <div style="display:grid;gap:8px;max-height:56vh;overflow-y:auto">${S.map(p=>`<div style="display:flex;align-items:center;gap:10px;background:var(--s2);border:1px solid var(--bd);border-radius:6px;padding:8px 10px">${face(p.fs,44)}<div style="flex:1;min-width:0"><div style="font-weight:800">${p.fn} ${p.ln}${captains().includes(p.id)?' <span style="color:var(--gd)">(C)</span>':''}</div><div style="font-size:12px;color:var(--mu)">${p.pos} · ${p.rat} OVR${p.stars>=2?` · ${p.stars}★`:''}</div><div style="font-size:12px">${p.committed&&p.committed.school?`Signed with <b>${p.committed.school}</b>${p.committed.lvl?` (${p.committed.lvl})`:''}`:'Undecided: signing day is next'}</div></div></div>`).join('')}</div>
    <div style="display:flex;justify-content:flex-end;margin-top:12px"><button class="btn" onclick="seniorDone()">Honor the seniors</button></div>`);}
window.seniorDone=function(){seniorHonor();clo();runOffseason();};
function seniorHonor(){G.morale=clamp(moraleOf()+3,5,100);addLog(`<span style="color:var(--gd)">Senior Night: the Class of ${(G.baseYear||2026)+G.yr} was honored.</span>`);}

// ═══════════ ACTIONS ═══════════
function advWk(){
  if(ccOn()){ccNext();return;}
  if(G.phase==='playoffs'){advPlayoffWeek();return;}
  try{autoJVCallup();}catch(e){console.error('autoJVCallup',e);}
  if(G.sched.some(g=>g.custom&&g._empty)&&pcAuto())pcAutoSched(); // Player Career: the staff fills it
  if(G.sched.some(g=>g.custom&&g._empty)){
    notify('Finish building your schedule first!','e');
    openScheduleBuilder();
    return;
  }
  const idx=G.sched.findIndex(g=>g.type==='regular'&&!g.result);
  if(idx===-1){
    if(allRegDone()&&!G.playoff){
      G.phase='regular';
      notify('Regular season done: start playoffs!','w');
    }
    nav('dash');return;
  }
  const game=G.sched[idx];
  // v2.00: the first game of a new career offers the interactive gameplay tutorial first (asked once per save)
  if(!G.tutAsked&&!G.tutDone&&G.yr===1&&!G.sched.some(g=>g.result&&g.type==='regular')&&!window._gdAutoSim&&!pcAuto()){tutOffer(true);return;}
  const oppTeam=getS(game.oppId);
  const myTeam=myS();
  const label=oppTeam?`Week ${game.wk}: vs ${oppTeam.name} ${oppTeam.mascot}`:`Week ${game.wk}`;
  gdChoose('reg',{idx,label,opp:oppTeam},()=>showLoading(label,myTeam,10,()=>{
    G.phase='regular';
    simGame(idx);
    nav('dash');
    if(!_popQ.length){notify(`Week ${game.wk}: ${game.result==='W'?'Victory! ':'Defeat '} ${game.my}-${game.opp}`);}
  }));
}

// v2.14: never sim a season by surprise. If games are left, ask first and say how many.
function doOffseason(){
  const leftReg=G.sched.filter(g=>g.type==='regular'&&!g.result&&!g._empty).length,leftPo=G.sched.some(g=>g.type==='playoff'&&!g.result)||(G.phase==='regular'&&!G.playoff);
  if(leftReg>0||(G.phase!=='postseason'&&G.phase!=='offseason'&&leftPo)){
    openMo(`<div style="text-align:center;padding:6px 4px"><div style="font-weight:900;font-size:21px;margin-bottom:8px">Sim the rest of the season?</div>
      <div style="font-size:14px;color:var(--mu);margin-bottom:16px">${leftReg?`<b>${leftReg} regular season game${leftReg===1?'':'s'}</b>${leftPo?' and the playoffs':''} will be simulated`:'The playoffs will be simulated'} and the season ends. You can't undo this.</div>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><button class="bgh" style="min-width:150px" onclick="clo()">Cancel</button><button class="btn" style="min-width:150px;background:var(--rd);border-color:var(--rd)" onclick="clo();_doOffseason()">Yes, sim the season</button></div></div>`);
    return;}
  _doOffseason();
}
function _doOffseason(){
  // Show loading screen before simulating remaining games and transitioning to offseason
  const myTeam=myS();
  showLoading('Wrapping Up the Season…',myTeam,14,()=>{
  let didSim=false;
  for(let i=0;i<G.sched.length;i++){
    const g=G.sched[i];
    if(g.type==='regular'&&!g.result&&!g._empty){simGame(i,true);didSim=true;}
  }
  if(didSim){
    for(const p of myP()){checkStarsOffers(p,[],false);checkCommit(p);}
    notify('All regular season games simulated!','w');
  }
  if(G.phase!=='postseason'){
    const inPlayoffs=buildPlayoffBracket();
    if(inPlayoffs){
      let safetyCount=0;
      while(G.playoff&&G.playoff.bracket&&G.playoff.bracket.length>1&&safetyCount<10){
        // FIX: Look for type='playoff' (not 'bye') since setNextPlayoffGame sets it
        const slot=G.sched.find(g=>g.type==='playoff'&&!g.result);
        if(!slot)break;
        const opp=getS(slot.oppId);
        if(!opp)break;
        const myOvr=(G.offR+G.defR)/2+progEdge(),oppOvr=teamOvr(opp.id);
        const bigGameBonus=myP().filter(p=>p.traits.includes('big-game')).length*.03;
        const winP=clamp(.5+(myOvr-oppOvr)/100+bigGameBonus,0.1,0.9);
        const iWin=Math.random()<winP;
        const myScore=rng(iWin?14:7,iWin?49:42);
        const oppScore=iWin?Math.min(myScore-1,rng(7,35)):Math.max(myScore+1,rng(14,49));
        slot.result=iWin?'W':'L';slot.my=myScore;slot.opp=oppScore;
        G.week=slot.wk;
        const pl=myP().filter(p=>p.inj===0);
        const sm=genStats(pl,myScore,iWin,G.offS,G.defS,G.myId,opp.id);
        glSet(slot.wk,opp,myScore,oppScore,'po');try{applyStats(sm);}finally{_glCtx=null;}gateAfter(opp,'po',slot.wk);
  try{progAfterGame(iWin,{playoff:true,sm,margin:myScore-oppScore});}catch(e){console.error('program',e);}try{checkStreaks(sm,[],true);}catch(e){}
        const roundName=poRoundName(slot.playoffRound)||`Round ${slot.playoffRound}`;
        addLog(`<span style="color:${iWin?'var(--gd)':'var(--te)'}"> ${roundName}: ${iWin?'Win':'Loss'} vs ${opp.name} ${opp.mascot} ${myScore}-${oppScore}</span>`);
        simPlayoffRound(slot.playoffRound,slot,iWin);
        if(!iWin){
          G.playoff.myElim=true;
          const rem=G.sched.filter(g=>(g.type==='playoff'||g.type==='bye')&&!g.result);
          for(const s of rem){s.type='bye';s.result='bye';s.label='Bye Week (Eliminated)';}
          let _se=0;while(G.playoff.bracket&&G.playoff.bracket.length>1&&_se<8){_se++;G.playoff.round++;simPlayoffRound(G.playoff.round,{playoffRound:G.playoff.round},null);}
          if(G.playoff.bracket&&G.playoff.bracket.length===1)G.playoff.stateChampId=G.playoff.bracket[0].id;
          G.phase='postseason';break;
        } else if(G.playoff.bracket&&G.playoff.bracket.length<=1){G.phase='postseason';break;}
        else setNextPlayoffGame();
        safetyCount++;
      }
      if(G.phase!=='postseason')G.phase='postseason';
    }
  }
  // Show state champion popup if player didn't win the championship
  const _osPops=[];
  const _doOsChampId=G.playoff?.stateChampId||(G.playoff?.stateChamp?G.myId:null);
  if(_doOsChampId&&_doOsChampId!==G.myId){
    const _doOsChampSch=getS(_doOsChampId);
    if(_doOsChampSch){
      const _doOsChampRec=`${_doOsChampSch.wins}-${_doOsChampSch.losses}`;
      _osPops.push(bEvPop(' State Champion Crowned',`<strong style="color:var(--gd)">${_doOsChampSch.name} ${_doOsChampSch.mascot}</strong> are this year's <strong>${2026+(G.yr-1)} State Champions</strong>!<br><br>They finished <strong>${_doOsChampRec}</strong> on the season.`,sLogo(_doOsChampSch,64),'var(--gd)'));
    }
  }
  // v2.00: the National Championship (top two of the final national poll) is played before the offseason starts
  try{G.phase='postseason';if(natEnsure()){const np=natSim();if(np)_osPops.push(np);}}catch(e){console.error('natl',e);}
  if(_osPops.length){_popQ=_osPops;_popI=0;_popCb=()=>{G.phase='offseason';G.osPhase=0;runOffseason();};showPop();return;}
  G.phase='offseason';G.osPhase=0;runOffseason();
  }); // end showLoading callback
}

function startPlayoffs(){
  try{autoJVCallup();}catch(e){console.error('autoJVCallup',e);}
  for(let i=0;i<G.sched.length;i++){
    const g=G.sched[i];
    if(g.type==='regular'&&!g.result){simGame(i,true);}
  }
  buildPlayoffBracket();
  nav('dash');
  updateTb();
}

