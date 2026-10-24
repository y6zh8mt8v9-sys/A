// ═══════════ SEASON EVENTS ═══════════
function bEvPop(title,body,img,color){return`<div class="pc" style="border-top-color:${color||'var(--ac)'}"><h3 style="color:${color||'var(--te)'}">${title}</h3>${img?`<div style="margin:10px auto">${img}</div>`:''}<div style="font-size:13px;line-height:1.6;margin-top:8px">${body}</div></div>`;}

function tryEvent(sm,iWin,myScore,oppScore){
  const roll=Math.random();const pl=myP().filter(p=>p.inj===0&&(p.pos==='OL'||p.pos==='K'||p.seasStats.gp>0));if(!pl.length)return null;
  const blowout=Math.abs(myScore-oppScore)>=21;const upset=iWin&&teamOvr(G.sched[G.week]?.oppId||0)>=(G.offR+G.defR)/2+5;
  if(iWin&&blowout&&roll<.5){G.budget+=4000;addNews('myteam',' Blowout Bonus Earned',`Dominant ${myScore}-${oppScore} victory earned your program $4,000!`);return bEvPop(' Blowout Win!',`A dominant ${myScore}-${oppScore} victory earned your program <strong>$4,000</strong>!`,null,'var(--gn)');}
  if(iWin&&upset&&roll<.4){G.prestige=clamp(G.prestige+.2,1,5);addNews('upset',' Major Upset! Recruits Take Notice',`You toppled a heavy favorite. Prestige boost earned.`);return bEvPop(' Major Upset!',`You upset a heavily favored opponent! Prestige boost: recruits are noticing.`,null,'var(--gd)');}
  const prospects=myP().filter(p=>p.rat>=62&&p.yr>=10&&(p.pos==='OL'||p.pos==='K'||p.seasStats.gp>0));
  if(prospects.length&&roll<.2){const p=prospects[Math.floor(Math.random()*prospects.length)];genOffers(p,true,[]);addNews('offer',` Scouts Watching ${p.fn} ${p.ln}`,`College scouts boosted offer chances for the ${p.pos}.`);return bEvPop(' Scouts Watching!',`College scouts were watching <strong>${p.fn} ${p.ln}</strong> (${p.pos}) this game! Offer chances increased.`,face(p.fs,48),'var(--b2)');}
  const sorted2=Object.entries(sm).map(([pid,st])=>({p:getP(parseInt(pid)),st})).filter(x=>x.p&&x.p.sId===G.myId);
  sorted2.sort((a,b)=>{const scr=(s)=>(s.passYds||0)/15+(s.rushYds||0)/8+(s.recYds||0)/8+(s.passTD||0)*5+(s.rushTD||0)*5+(s.tackles||0)*1.5+(s.sacks||0)*4;return scr(b.st)-scr(a.st);});
  if(sorted2.length&&roll<.25){const best=sorted2[0];const p=best.p;p.sp=(p.sp||0)+2;addNews('great',` Breakout Game: ${p.fn} ${p.ln}`,`Monster performance earned +2 SP for the ${p.pos}.`);return bEvPop(' Breakout Game!',`${p.fn} ${p.ln} had a monster game! <strong>+2 Skill Points</strong> earned.`,face(p.fs,48),'var(--gd)');}
  if(!iWin&&roll<.12){const bad=myP().filter(p=>p.offers.length>0&&!p.committed&&!p.traits.includes('humble'));if(bad.length){const p=bad[Math.floor(Math.random()*bad.length)];p.offers.pop();addNews('bad',` Offer Withdrawn: ${p.fn} ${p.ln}`,`Lost an offer after the team's poor showing.`);return bEvPop(' Offer Withdrawn',`${p.fn} ${p.ln} lost an offer after the team's poor showing.`,face(p.fs,48),'var(--ac)');}}
  if(roll<.07&&sorted2.length){const p=sorted2[0].p;const idx=DEV.indexOf(p.dev);if(idx<3){p.dev=DEV[idx+1];addNews('great',` Dev Surge! ${p.fn} ${p.ln}`,`Now showing ${p.dev} development potential!`);return bEvPop(' Dev Surge!',`${p.fn} ${p.ln} is showing <strong>${p.dev}</strong> development potential!`,face(p.fs,48),'var(--gn)');}}
  return null;
}

// ═══════════ PLAYOFFS, WEEK BY WEEK ═══════════
function calcSOS(schId){
  // Strength of Schedule: average OVR of all opponents faced this season
  const played=G.sched.filter(g=>g.type==='regular'&&g.result&&g.oppId&&g.oppId!==null);
  // For other schools, proxy with division average
  if(schId!==G.myId){
    const div=divOf(schId);if(!div)return 50;
    const others=div.teams.filter(t=>t.id!==schId);
    if(!others.length)return 50;
    return Math.round(others.reduce((a,t)=>a+teamOvr(t.id),0)/others.length);
  }
  if(!played.length)return 50;
  const oppOvrs=played.map(g=>teamOvr(g.oppId)).filter(v=>v>0);
  return oppOvrs.length?Math.round(oppOvrs.reduce((a,v)=>a+v,0)/oppOvrs.length):50;
}

// league rules (Settings → League rules, per career): playoff field size and who gets in. A season keeps the size it started with.
function poRules(){const R=(typeof G!=='undefined'&&G&&G.rules)||{};return{n:[4,8,16,32].includes(R.poN)?R.poN:16,q:R.poQ==='div'?'div':'record'};}
function poSeasonN(){return[4,8,16,32].includes(G.poN)?G.poN:16;}
function poRoundsN(n){return Math.round(Math.log2(n||poSeasonN()));}
function poRoundName(r,n){const k=poRoundsN(n)-r;return k<=0?'State Final':k===1?'Regional Championship':k===2?'Quarterfinals':`Round of ${Math.pow(2,k+1)}`;}
function poOrder(n){let o=[1];while(o.length<n){const m=o.length*2+1;o=o.flatMap(x=>[x,m-x]);}return o;} // 1 v n, 8 v 9, … so the top seeds meet last
// the bracket as columns: round 1 from the seeds, later rounds from the winners; unplayed games show TBD
function poBracket(pl){pl=pl||G.playoff;if(!pl||!pl.field||pl.field.length<2)return null;const F=pl.field,n=1<<Math.round(Math.log2(F.length)),R=Math.round(Math.log2(n)),seed={};F.forEach((id,i)=>{seed[id]=i+1;});
  let slots=poOrder(n).map(i=>F[i-1]!=null?F[i-1]:null);const cols=[];
  for(let r=1;r<=R;r++){const rr=(pl.rounds||[]).find(x=>x.round===r)||(pl.rounds||[])[r-1],res=rr?rr.results||[]:[],M=[];
    for(let j=0;j<slots.length;j+=2){const a=slots[j],b=slots[j+1];const x=res.find(q=>a!=null&&(q.a===a||q.b===a)||b!=null&&(q.a===b||q.b===b))||null;M.push({a,b,x});}
    cols.push({r,name:poRoundName(r,n),M});slots=M.map(m=>m.x?m.x.winner:m.a!=null&&m.b==null&&rr?m.a:null);}
  const fin=cols[cols.length-1].M[0],champ=fin&&fin.x?fin.x.winner:(pl.stateChampId||null);return{cols,seed,champ,n};}
function poBracketHtml(pl){const B=poBracket(pl);if(!B)return'';const me=G.myId;
  const nextM=(()=>{const g=G.sched&&G.sched.find(x=>x.type==='playoff'&&!x.result);return g?g.oppId:null;})();
  const row=(id,m)=>{if(id==null)return`<div class="pob-t pob-tbd"><span class="pob-sd"></span><span class="pob-nm">${m&&m.x&&m.x.b==null?'Bye':'TBD'}</span></div>`;const s=getS(id);if(!s)return`<div class="pob-t pob-tbd"><span class="pob-nm">TBD</span></div>`;
    const x=m.x,won=x&&x.winner===id,lost=x&&x.b!=null&&x.winner!==id,sc=x&&x.b!=null?(won?x.wScore:x.lScore):'';
    return`<div class="pob-t${won?' pob-w':''}${lost?' pob-l':''}${id===me?' pob-me':''}" onclick="viewSchool(${id})"><span class="pob-sd">${B.seed[id]||''}</span>${sLogo(s,22)}<span class="pob-nm">${s.name}</span><span class="pob-sc">${sc}</span></div>`;};
  const box=m=>`<div class="pob-m${(m.a===me||m.b===me)&&!m.x&&(m.a===nextM||m.b===nextM)?' pob-nx':''}">${row(m.a,m)}${row(m.b,m)}</div>`;
  const cols=B.cols.map((c,ci)=>{const last=ci===B.cols.length-1;let inner='';if(c.M.length>1){for(let j=0;j<c.M.length;j+=2)inner+=`<div class="pob-pr">${box(c.M[j])}${c.M[j+1]?box(c.M[j+1]):''}</div>`;}else inner=box(c.M[0]);
    return`<div class="pob-col${ci?' pob-in':''}${last?' pob-fin':''}"><div class="pob-h">${c.name}</div><div class="pob-b">${inner}</div></div>`;}).join('');
  const ch=B.champ!=null?getS(B.champ):null;
  const chHtml=`<div class="pob-col pob-in pob-ch"><div class="pob-h">Champion</div><div class="pob-b"><div class="pob-m pob-cm${ch&&ch.id===me?' pob-me':''}">${ch?`${sLogo(ch,44)}<b>${ch.name}</b><small>${ch.mascot} · #${B.seed[ch.id]||''} seed</small>`:'<small>To be decided</small>'}</div></div></div>`;
  return`<div class="pob" data-norank><div class="pob-g" style="--pob-n:${B.cols[0].M.length}">${cols}${chHtml}</div></div>`;}
// a new field size before the playoffs start: this season's playoff weeks are added or removed to match
function poApplyNow(){if(G.playoff||['playoffs','postseason','offseason'].includes(G.phase))return false;
  const n=poRules().n,want=poRoundsN(n),slots=G.sched.filter(g=>g.playoffRound).sort((a,b)=>a.playoffRound-b.playoffRound);if(!slots.length)return false;
  const base=slots[0].wk-1;
  while(slots.length>want){const g=slots.pop();G.sched.splice(G.sched.indexOf(g),1);}
  for(let r=slots.length;r<want;r++){const g={wk:base+r+1,type:'bye',oppId:null,result:null,my:0,opp:0,date:fmtDate(base+r),playoffRound:r+1,label:`Playoff Round ${r+1}`};G.sched.push(g);slots.push(g);}
  G.poN=n;return true;}
function buildPlayoffBracket(){
  // Playoff seeding: score = win% * 1000 + SOS * 8 + prestige * 5
  // SOS weight tripled (was *2, now *8), two teams with same record are
  // meaningfully separated by schedule difficulty. A team that schedules
  // higher-OVR opponents gets a real seeding edge over a cupcake schedule.
  const all=allSchools().map(s=>{
    const wr=s.wins/(s.wins+s.losses+.001);
    const sos=calcSOS(s.id);
    const seed=wr*1000+sos*8+(s.prestige||1)*5;
    return{...s,_seed:seed,_sos:sos};
  }).sort((a,b)=>b._seed-a._seed);

  const N=Math.min(poSeasonN(),1<<Math.floor(Math.log2(Math.max(2,all.length)))),PR=poRules(),pick=[];
  if(PR.q==='div')for(const d of G.divisions){const b=all.find(s=>d.teams.some(t=>t.id===s.id));if(b&&pick.length<N)pick.push(b);} // division winners first
  for(const s of all){if(pick.length>=N)break;if(!pick.includes(s))pick.push(s);}
  pick.sort((a,b)=>b._seed-a._seed);
  const field=pick;
  const iMyTeam=field.find(s=>s.id===G.myId);

  const md=myDiv();const dTop=[...md.teams].sort((a,b)=>{const aw=a.wins/(a.wins+a.losses+.001),bw=b.wins/(b.wins+b.losses+.001);return bw-aw;})[0];
  if(dTop&&dTop.id===G.myId){
    G.trophies=G.trophies||[];
    G.trophies.push({type:'Division',yr:G.yr,rec:`${G.wins}-${G.losses}`});
    G.prestige=clamp(G.prestige+.2,1,5);
    addLog(`<span style="color:var(--gd)"> Division Champion! ${G.wins}-${G.losses}</span>`);
  }

  G.playoff={
    field:field.map(s=>s.id),
    bracket:poOrder(field.length).map(i=>field[i-1]).filter(Boolean),
    round:0,
    myElim:!iMyTeam,
    champ:false,
    stateChamp:false,
    rounds:[]
  };

  const playoffSlots=G.sched.filter(g=>g.type==='bye'||g.type==='playoff');

  if(!iMyTeam){
    for(const slot of playoffSlots){slot.type='bye';slot.oppId=null;slot.result='bye';slot.label='Bye Week';}
    // Simulate the full playoff bracket to determine state champion
    let safeNoQ=0;
    while(G.playoff.bracket&&G.playoff.bracket.length>1&&safeNoQ<8){
      safeNoQ++;G.playoff.round++;
      simPlayoffRound(G.playoff.round,{playoffRound:G.playoff.round},null);
    }
    const noQChamp=G.playoff.bracket&&G.playoff.bracket.length===1?G.playoff.bracket[0]:null;
    if(noQChamp){
      G.playoff.stateChampId=noQChamp.id;
      const champRec=`${noQChamp.wins}-${noQChamp.losses}`;
      addLog(`<span style="color:var(--gd)"> State champion: ${noQChamp.name} ${noQChamp.mascot} (${champRec})</span>`);
      const noQPop=bEvPop(' State Champion Crowned',`Your team did not qualify for the playoffs.<br><br><strong style="color:var(--gd)">${noQChamp.name} ${noQChamp.mascot}</strong> are this year's <strong>${2026+(G.yr-1)} State Champions</strong>!<br><br>They finished <strong>${champRec}</strong> on the season.`,sLogo(noQChamp,64),'var(--gd)');
      _popQ=[noQPop];_popI=0;_popCb=()=>nav('dash');showPop();
    }
    G.phase='postseason';
    addLog(`<span style="color:var(--mu)">Did not qualify for state playoffs.</span>`);
    return false;
  }

  G.phase='playoffs';
  setNextPlayoffGame(); // FIX: ensure first playoff slot is set to type='playoff'
  return true;
}

function setNextPlayoffGame(){
  if(!G.playoff)return;
  const bracket=G.playoff.bracket;

  // Bracket resolved, crown champion
  if(bracket.length<=1){
    const champ=bracket[0];
    G.playoff.champ=champ&&champ.id===G.myId;
    G.playoff.stateChamp=G.playoff.champ;
    if(champ){G.playoff.stateChampId=champ.id;}
    if(G.playoff.champ){
      G.trophies=G.trophies||[];
      G.trophies.push({type:'State',yr:G.yr,rec:`${G.wins}-${G.losses}`,cls:G.cls});
      G.prestige=clamp(G.prestige+.6,1,5);G.budget+=75000;
      addLog(`<span style="color:var(--gd)"> State champions! ${G.wins}-${G.losses} +$75,000</span>`);
    }
    const remainingSlots=G.sched.filter(g=>(g.type==='playoff'||g.type==='bye')&&!g.result);
    for(const s of remainingSlots){s.type='bye';s.result='bye';s.label='Bye Week';}
    G.phase='postseason';
    return;
  }

  const round=G.playoff.round+1;
  G.playoff.round=round;

  // Find next unused schedule slot
  const slot=G.sched.find(g=>(g.type==='bye'||g.type==='playoff')&&!g.result&&g.result!=='bye');
  if(!slot){G.phase='postseason';return;}

  const myIdx=bracket.findIndex(s=>s.id===G.myId);

  // Player is still in but gets a bye this round (odd bracket position)
  if(myIdx!==-1){
    const pairIdx=myIdx%2===0?myIdx+1:myIdx-1;
    const oppSchool=bracket[pairIdx];

    if(!oppSchool){
      // Player has a bye, sim the rest of this round, consume the slot, then set up the real next game
      slot.type='bye';slot.result='bye';slot.label=`Playoff Round ${round} (Bye)`;
      simPlayoffRound(round,slot,null);  // player advances automatically via bye in simPlayoffRound
      setNextPlayoffGame();              // recurse to set up the actual next matchup
      return;
    }

    // Real opponent found, set up the playable slot
    slot.type='playoff';slot.oppId=oppSchool.id;slot.result=null;
    slot.label=poRoundName(round)||`Playoff Round ${round}`;slot.playoffRound=round;
    return;
  }

  // Player is already eliminated, just sim remaining bracket rounds silently
  slot.type='bye';slot.result='bye';slot.label=`Playoff Round ${round} (AI)`;
  simPlayoffRound(round,slot,null);
}

function simPlayoffRound(round,slot,myResult){
  const bracket=[...G.playoff.bracket];
  const roundResults=[];
  const survivors=[];

  for(let i=0;i<bracket.length;i+=2){
    const a=bracket[i],b=bracket[i+1];
    if(!b){survivors.push(a);roundResults.push({a:a.id,b:null,winner:a.id,score:`Bye`});continue;}
    const isMyGame=(a.id===G.myId||b.id===G.myId);
    let aWins;
    if(isMyGame&&myResult!==null){aWins=a.id===G.myId?myResult:!myResult;}
    else{
      const aOvr=teamOvr(a.id),bOvr=teamOvr(b.id);
      const myBonus=myP().filter(p=>p.traits.includes('big-game')).length*.03;
      const brGapFactor=clamp(Math.abs((aOvr-bOvr)/100)*1.2,0,0.08);
      const brWinFloor=clamp(0.05-brGapFactor,0.02,0.05);
      const brWinCeil=clamp(0.93+brGapFactor,0.93,0.98);
      // v2.16: same odds as the regular season, so the better team usually advances (upsets still happen)
      const gap=aOvr-bOvr+(a.id===G.myId?myBonus*100:0),ag=Math.abs(gap),fav=ag>=25?0.97:ag>=20?0.95:ag>=15?0.92:ag>=10?0.87:ag>=5?0.78:0.5+ag*0.056;
      const aWinP=gap>=0?fav:1-fav;void brWinFloor;void brWinCeil;
      aWins=Math.random()<aWinP;
    }
    const winner=aWins?a:b,loser=aWins?b:a;
    const wOvr=teamOvr(winner.id),lOvr=teamOvr(loser.id);
    const _bs=(isMyGame&&slot&&slot.my!=null&&slot.opp!=null&&slot.my!==slot.opp)?[Math.max(slot.my,slot.opp),Math.min(slot.my,slot.opp)]:(()=>{const r=lgScore(wOvr,lOvr,true);return wxScale(r[0],r[1],wxSimF(gameWx(a,(slot&&slot.wk?slot.wk-1:13),b.id)).sc);})();const wScore=_bs[0],lScore=_bs[1];
    roundResults.push({a:a.id,b:b.id,winner:winner.id,loser:loser.id,wScore,lScore});
    survivors.push(winner);
    if(loser.id===G.myId){G.playoff.myElim=true;}
  }

  G.playoff.rounds.push({round,results:roundResults});
  G.playoff.bracket=survivors;
}

function advPlayoffWeek(){
  try{autoJVCallup();}catch(e){console.error('autoJVCallup',e);}
  const slot=G.sched.find(g=>g.type==='playoff'&&!g.result);
  if(!slot){
    if(G.phase==='playoffs'){setNextPlayoffGame();}
    nav('dash');return;
  }
  const opp=getS(slot.oppId);
  if(!opp){
    slot.result='bye';slot.label='Bye Week';
    setNextPlayoffGame();
    nav('dash');return;
  }
  const myTeam=myS();
  const roundName=poRoundName(slot.playoffRound)||`Playoff Round ${slot.playoffRound}`;
  gdChoose('po',{slot,opp,label:roundName+': vs '+opp.name+' '+opp.mascot},()=>showLoading(` ${roundName}: vs ${opp.name}`,myTeam,12,()=>_doAdvPlayoffWeek(slot,opp)));
}
function _doAdvPlayoffWeek(slot,opp,forced=null){

  const myOvr=(G.offR+G.defR)/2+progEdge(),oppOvr=teamOvr(opp.id);
  const bigGameBonus=myP().filter(p=>p.traits.includes('big-game')).length*.03;
  const poGapFactor=clamp(Math.abs((myOvr-oppOvr)/100)*1.2,0,0.08);
  const poWinFloor=clamp(0.05-poGapFactor,0.02,0.05);
  const poWinCeil=clamp(0.93+poGapFactor,0.93,0.98);
  const effGap=teamEffEdge(G.myId)-teamEffEdge(opp.id);
  const _wx=forced?null:gdWxFor('po',{slot,opp}),_wf=wxSimF(_wx);
  const winP=.5+(clamp(.5+(myOvr-oppOvr+effGap)/100+bigGameBonus,poWinFloor,poWinCeil)-.5)*_wf.upset;
  let iWin=Math.random()<winP;if(forced)iWin=forced.my>forced.opp;
  const _ps0=lgScore(myOvr,oppOvr,iWin),_ps=wxScale(_ps0[0],_ps0[1],_wf.sc);_ps[2]=_ps0[2];let myScore=_ps[0],oppScore=_ps[1];slot.ot=_ps[2]?1:0;if(forced){myScore=forced.my;oppScore=forced.opp;slot.ot=0;slot.played=1;}

  slot.result=iWin?'W':'L';slot.my=myScore;slot.opp=oppScore;
  G.week=slot.wk;

  const pl=myP().filter(p=>p.inj===0);
  window._wxPass=_wf.pass;let sm;try{sm=forced&&forced.sm?forced.sm:genStats(pl,myScore,iWin,G.offS,G.defS,G.myId,opp.id);}finally{window._wxPass=1;}
  glSet(slot.wk,opp,myScore,oppScore,'po');try{applyStats(sm);}finally{_glCtx=null;}gateAfter(opp,'po',slot.wk);
  try{progAfterGame(iWin,{playoff:true,sm,margin:myScore-oppScore});}catch(e){console.error('program',e);}

  const pops=[];
  try{checkStreaks(sm,pops,false);}catch(e){console.error(e);}
  const roundName=poRoundName(slot.playoffRound)||`Round ${slot.playoffRound}`;
  // Determine if this is the championship (final) game BEFORE simming the round
  const isFinal=G.playoff.bracket.length===2;
  if(iWin&&!isFinal){
    pops.push(bEvPop(` ${roundName} WIN!`,`${myS().name} ${myS().mascot} defeat ${opp.name} ${opp.mascot} <strong>${myScore}–${oppScore}</strong>! Advance to next round!`,null,'var(--gd)'));
    addNews('playoff',` Playoff Win! ${myS().mascot} vs ${opp.mascot} ${myScore}–${oppScore}`,`${roundName}, advancing to next round!`);
    G.prestige=clamp(G.prestige+.15,1,5);
    G.budget+=2000;
  } else if(iWin&&isFinal){
    addNews('playoff',` State champions! ${myS().mascot} ${myScore}–${oppScore}`,`${myS().name} are the State Champions!`);
    G.prestige=clamp(G.prestige+.15,1,5);
    G.budget+=2000;
  } else {
    pops.push(bEvPop(` Eliminated, ${roundName}`,`${myS().name} ${myS().mascot} lost to ${opp.name} ${opp.mascot} <strong>${oppScore}–${myScore}</strong>. Season is over.`,null,'var(--ac)'));
    addNews('bad',` Eliminated: ${roundName}, ${opp.mascot} ${oppScore}–${myScore}`,`Season ends here. Rebuild for next year.`);
  }

  addLog(`<span style="color:${iWin?'var(--gd)':'var(--te)'}"> ${roundName}: ${iWin?'Win':'Loss'} vs ${opp.name} ${opp.mascot} ${myScore}-${oppScore}</span>`);

  simPlayoffRound(slot.playoffRound,slot,iWin);

  if(!iWin){
    G.playoff.myElim=true;
    const remainingSlots=G.sched.filter(g=>(g.type==='playoff'||g.type==='bye')&&!g.result);
    for(const s of remainingSlots){s.type='bye';s.result='bye';s.label='Bye Week (Eliminated)';}
    // FIX v1.11.2: Simulate remaining playoff rounds to determine the state champion
    let safeElim=0;
    while(G.playoff.bracket&&G.playoff.bracket.length>1&&safeElim<8){
      safeElim++;G.playoff.round++;
      simPlayoffRound(G.playoff.round,{playoffRound:G.playoff.round},null);
    }
    const stateChamp=G.playoff.bracket&&G.playoff.bracket.length===1?G.playoff.bracket[0]:null;
    if(stateChamp){
      G.playoff.stateChampId=stateChamp.id;
      const champRec=`${stateChamp.wins}-${stateChamp.losses}`;
      addLog(`<span style="color:var(--gd)"> State champion: ${stateChamp.name} ${stateChamp.mascot} (${champRec})</span>`);
      pops.push(bEvPop(' State Champion Crowned',`<strong style="color:var(--gd)">${stateChamp.name} ${stateChamp.mascot}</strong> are this year's <strong>${2026+(G.yr-1)} State Champions</strong>!<br><br>They finished <strong>${champRec}</strong> on the season.`,sLogo(stateChamp,64),'var(--gd)'));
    }
    G.phase='postseason';
  } else if(G.playoff.bracket.length<=1){
    // Call setNextPlayoffGame(), it correctly sets champ flag, pushes State trophy, awards prestige/budget
    setNextPlayoffGame();
    if(G.playoff.champ){
      pops.push(bEvPop(' State champions! ',`Year ${2026+(G.yr-1)}, ${G.wins}-${G.losses} + Playoff Run!<br>Your program has won the State Championship! <strong style="color:var(--gd)">$75,000 bonus!</strong>`,null,'var(--gd)'));
    } else {
      // Shouldn't happen (we just won), but guard anyway
      const champ=G.playoff.bracket[0];
      if(champ)pops.push(bEvPop(' State Champion',`${champ.name} ${champ.mascot} are this year's state champions!`,sLogo(champ,52),'var(--mu)'));
    }
    // phase is already set to 'postseason' by setNextPlayoffGame
  } else {
    // FIX: Set next playoff game BEFORE showing popups so navigating to dash works
    setNextPlayoffGame();
  }

  for(const p of pl){
    const injChance=(p.traits&&p.traits.includes('injury-prone')?0.06:0.025)*clamp(1.35-atv(p,'sta')/150,0.7,1.15); // v2.16 well-conditioned players get hurt less
    if(Math.random()<injChance){
      const inj=rollInjury(p,true);
      p.injName=inj.name;
      p.inj=inj.weeks;
      if(inj.isCareer){
        triggerCareerEndingInjury(p);
        addNews('careerinjury',' Career-Ending Injury',`${p.fn} ${p.ln} (${p.pos}) suffered a ${inj.name} in the playoffs. Their career is over.`);
      } else if(inj.isSeason){
        p.injSeason=true;
        pops.push(bEvPop(' Season-Ending Injury!',`<strong>${p.fn} ${p.ln}</strong> (${p.pos}) suffered a <strong>${inj.name}</strong> and is out for the rest of the playoffs.`,face(p.fs,52),'var(--rd)'));
        addLog(`<span style="color:var(--rd)"> ${p.fn} ${p.ln}, ${inj.name} (Season-Ending)</span>`);
        addNews('injury',' Playoff Injury (Season-Ending)',`${p.fn} ${p.ln} (${p.pos}), ${inj.name}. Out for the playoffs.`);
      } else {
        pops.push(bEvPop(' Playoff Injury',`<strong>${p.fn} ${p.ln}</strong> (${p.pos}) suffered a <strong>${inj.name}</strong>: out <strong>${inj.weeks} week${inj.weeks!==1?'s':''}</strong>.`,face(p.fs,52),'var(--ac)'));
        addLog(`<span style="color:var(--te)"> ${p.fn} ${p.ln}, ${inj.name} (${inj.weeks}w)</span>`);
        addNews('injury',' Playoff Injury',`${p.fn} ${p.ln} (${p.pos}), ${inj.name}. Out ${inj.weeks} week${inj.weeks!==1?'s':''}.`);
      }
    }
  }
  for(const p of myP()){if(p.inj>0&&!p.injSeason&&!p.injCareer){p.inj--;if(p.inj===0){const nm=p.injName;p.injName=null;p.injSeason=false;if(nm)pops.push(bEvPop(' Player Returns',`<strong>${p.fn} ${p.ln}</strong> (${p.pos}) has recovered from their <strong>${nm}</strong> and is back on the roster.`,face(p.fs,52),'var(--gn)'));if(nm)addLog(`<span style="color:var(--gn)"> ${p.fn} ${p.ln}, returned from ${nm}</span>`);}}}
  for(const p of myP()){checkStarsOffers(p,pops,false);checkCommit(p);}
  try{colNeedsWeek(pops);}catch(e){console.error('college needs',e);}

  updateTb();
  if(pops.length){_popQ=pops;_popI=0;_popCb=()=>nav('dash');showPop();}
  else nav('dash');
}

