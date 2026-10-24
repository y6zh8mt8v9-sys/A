// ═══════════ OFFSEASON (3 PHASES) ═══════════
function runOffseason(){
  if(pcAuto()){pcOffseason();return;}
  if(G.osPhase===0&&G.gradShown!==G.yr){G.gradShown=G.yr;seniorCeremony();return;}
  if(G.osPhase===0){showOsPhase(0,' Winter Offseason','Dec–Feb: Weight training, film study, and recruiting visits.');return;}
  if(G.osPhase===1){showOsPhase(1,' Spring Offseason','Mar–May: Spring practices, position training, and scouting camps.');return;}
  if(G.osPhase===2){showOsPhase(2,' Summer Training Camp','Jun–Aug: Conditioning, depth charts finalized, and final prep.');return;}
  finalizeOffseason();
}

function showOsPhase(phase,title,desc){
  const choices=['balanced','offense','defense','speed','strength','conditioning','technique'];
  openMo(`<h2>${title}</h2>
  <div style="color:var(--mu);font-size:13px;margin-bottom:16px">${desc}</div>
  <div style="font-size:13px;font-weight:700;margin-bottom:10px">Choose Training Focus:</div>
  <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:16px">
    ${choices.map(f=>`<div class="os-card" id="os-${f}" onclick="selectOsFocus('${f}')">
      <h4>${f.charAt(0).toUpperCase()+f.slice(1)}</h4>
      <p>${{balanced:'All positions',offense:'QB/RB/WR/OL',defense:'DL/LB/CB/S',speed:'Speed & agility',strength:'Strength & power',conditioning:'Stamina (fresher late in games)',technique:'Position skills'}[f]}</p>
    </div>`).join('')}
  </div>
  <button class="btn bgn" id="os-confirm" onclick="confirmOsPhase(${phase})" disabled style="opacity:.4">Confirm Focus</button>`);
}

let _osFocusSel='balanced';
window.selectOsFocus=function(f){
  _osFocusSel=f;document.querySelectorAll('.os-card').forEach(c=>c.classList.remove('sel'));
  const el=document.getElementById('os-'+f);if(el)el.classList.add('sel');
  const btn=document.getElementById('os-confirm');if(btn){btn.disabled=false;btn.style.opacity='1';}
};
window.confirmOsPhase=function(phase){
  osPhaseDo(phase);clo();
  if(G.osPhase<3)runOffseason();else finalizeOffseason();
};
function osPhaseDo(phase){
  G.tFocus=_osFocusSel;applyPhaseTrain(phase);G.osPhase=phase+1;
  if(phase===0){const pops=[];for(const p of myP())try{campInviteCheck(p,null,true);}catch(e){}const n=(G.campInv||[]).length;if(n&&!pcAuto())addNews('offer',` ${n} Spring Camp Invite${n>1?'s':''}`,'College camps want your players. Check the Recruiting page.');}
}
// Player Career: senior night, the three training phases (balanced focus) and the new season, no coach screens
function pcOffseason(){
  if(pcSignAsk(pcOffseason))return; // signing day choice first
  if(G.osPhase===0&&G.gradShown!==G.yr){G.gradShown=G.yr;if(myP().some(p=>p.yr===12))seniorHonor();}
  _osFocusSel='balanced';for(let ph=G.osPhase||0;ph<3;ph++)osPhaseDo(ph);
  finalizeOffseason();
}

function applyPhaseTrain(phase){
  const foc=_osFocusSel;const ocB=G.staff.oc.lvl;const dcB=G.staff.dc.lvl;
  const wF=G.fac.weight||1,tF=G.fac.train||1;
  const facB=(wF+tF)/2*.04;
  // Training level bonus: level 1=0%, level 20=+30% growth bonus
  const trainLvlBonus=(getTrainLevel()-1)/19*0.30;
  // Sync all player effective pots when train level may have changed
  for(const p of myP())syncPot(p);
  for(const p of myP()){
    const gap=p.pot-p.rat;
    let base=Math.max(0,(gap*.09+rngF(-1,3))/3);
    if(p.traits&&p.traits.includes('workhorse'))base*=1.3;
    if(p.traits&&p.traits.includes('lazy'))base*=.65;
    if(p.traits&&p.traits.includes('coachable'))base*=1.12;
    if(p.traits&&p.traits.includes('natural'))base*=1.18;
    base+=facB+pcoachLvl(p.pos)*0.08;
    base*=(1+trainLvlBonus); // training level amplifies all gains
    const offP=['QB','RB','WR','TE','OL'],defP=['DL','LB','CB','S'];
    if(foc==='offense'&&offP.includes(p.pos)){base*=1.3;base+=ocB*.1;}
    else if(foc==='defense'&&defP.includes(p.pos)){base*=1.3;base+=dcB*.1;}
    else if(foc==='speed'){p.spd=clamp(p.spd+rng(0,2)+(p.traits&&p.traits.includes('gym-rat')?1:0),1,99);}
    else if(foc==='strength'){p.str=clamp(p.str+rng(0,1+wF)+(p.traits&&p.traits.includes('gym-rat')?1:0),1,99);}
    else if(foc==='conditioning'){ovrSync(p);p.at.sta=clamp(p.at.sta+rng(2,4)+(p.traits&&p.traits.includes('workhorse')?1:0),1,99);p.at.acl=clamp(p.at.acl+rng(0,1),1,99);}
    else if(foc==='technique'){ovrSync(p);base*=0.85;const W=OVR_W[p.pos]||{};for(const k of keyAttrs(p.pos))if(!ATOP.has(k))p.at[k]=clamp(p.at[k]+rng(0,2),1,99);}
    p.rat=clamp(Math.round(p.rat+base),1,p.pot);
    if(foc==='strength'||foc==='balanced')p.str=clamp(p.str+rng(0,1+(p.traits&&p.traits.includes('gym-rat')?1:0)),1,99);
    if(phase===1){const awB=p.traits&&p.traits.includes('film-junkie')?rng(1,3):rng(0,1);p.awr=clamp(p.awr+awB,1,99);}
    const isA=p.traits&&p.traits.includes('academic');
    p.gpa=clamp(parseFloat((p.gpa+(isA?rngF(0,.06):rngF(-.05,.05))).toFixed(1)),1.5,4.0);
    if(Math.random()<.3)p.mood=pick(['high','good','good','neutral','neutral','neutral','low']);
    if(p.pos==='OL'||p.pos==='K')checkStarsOffers(p,[],false);
  }
}

function finalizeOffseason(){
  // v2.14: record the season that just ended before seniors leave and everyone moves up a grade
  try{const ab=schAbbr(myS()),yr=(G.baseYear||2026)+(G.yr-1);for(const p of G.players.filter(q=>q.sId===G.myId))archiveSeason(p,yr,ab);}catch(e){console.error('season archive',e);}
  G.osPhase=0;
  if(!G.wlArchive)G.wlArchive=[];
  if(!G.hofArchive)G.hofArchive=[];
  // Reset in-season rating gain deltas for new season
  for(const p of G.players)p.ratGain=0;
  const grad=myP().filter(p=>p.yr===12);
  // Archive watchlisted/HOF graduates before removing them; stamp graduation year
  for(const p of grad){
    p.gradYr=G.yr; // game-year when player graduated (for story unlock timing)
    if(p.wl&&!G.wlArchive.find(x=>x.id===p.id))G.wlArchive.push({...p});
    if(p.hof&&!G.hofArchive.find(x=>x.id===p.id))G.hofArchive.push({...p});
  }
  const pops=[];let budgetBonus=0;
  for(const p of grad)commitPlayer(p);
  try{colSigningDay();}catch(e){console.error('signing day',e);}
  try{ccGradHook(grad);}catch(e){console.error('college career',e);}
  for(const p of grad){pops.push(bSenPop(p));const lv=p.committed&&p.committed.lvl,bonus=({FBS:25000,FCS:12000,D2:7000,NAIA:4500,D3:3000,JUCO:1500}[lv]||0)+(lv?({5:25000,4:12000,3:5000,2:1500}[p.stars]||0):0);budgetBonus+=bonus;}
  try{const F=finYr();F.sign=(F.sign||0)+budgetBonus;}catch(e){}
  {const nF=grad.filter(p=>p.committed&&p.committed.lvl==='FBS').length;if(nF)G.prestige=clamp((G.prestige||1)+Math.min(0.25,nF*0.03),1,5);}
  try{aiOnYearEnd(grad);}catch(err){console.error('Gridiron AI year hook failed',err);}
  if(budgetBonus>0){G.budget+=budgetBonus;pops.push(bEvPop(' Signing Bonus!',`Your seniors earned your program <strong>$${budgetBonus.toLocaleString()}</strong> in college placement bonuses!`,null,'var(--gn)'));}
  G.players=G.players.filter(p=>!(p.sId===G.myId&&p.yr===12));
  // FIX: Increment only user players here (not global, AI teams do it per-team after senior removal)
  {const ms=myS();for(const p of G.players.filter(p=>p.sId===G.myId))if(p.yr<12){p.yr++;bodyGrow(p,ms);}}
  try{xferProcess();}catch(e){console.error('transfers',e);}
  try{const q=myPlayer();if(q&&q._snap){if(!q.grad&&q.rat<q._snap.rat){q.at=Object.assign(q.at||{},q._snap.at);q.spd=q._snap.spd;q.str=q._snap.str;q.awr=q._snap.awr;q.rat=Math.max(ovrCalc(q),q._snap.rat);q._rc=q.rat;}delete q._snap;}}catch(e){}
  const needs=cNeeds(G.myId);
  // Freshman class = seniors lost + win-based bonus
  // >= .500: 6-4→+1, 7-3→+2, 8-2→+3, 9-1→+4, undefeated→+5
  // < .500:  4-6→-1, 3-7→-2, 2-8→-3, 1-9→-4, winless→-5 (floor: 3 freshmen)
  const seniorsLost=grad.length;
  const _totalGames=G.wins+G.losses;
  const winBonus=_totalGames>0?clamp(Math.round((G.wins/_totalGames-0.5)*10),-5,5):0;
  const frCnt=Math.max(3,Math.round((seniorsLost+winBonus)*worldFrMult()));
  const newFr=[];
  for(let i=0;i<frCnt;i++){
    const p=genPlayer(G.myId,9,G.cls,needs);
    adjDev(p,myS());
    // NEW: freshmen start on JV
    p.onJV=true;
    G.players.push(p);
    if(!G.jvRoster)G.jvRoster=[];
    G.jvRoster.push(p.id); // freshmen always start on JV, no cap
    newFr.push(p);
  }
  // Age up JV players, promote any who are now Jr/Sr, generate new 8th graders
  promoteJVAgeUp();
  const trCnt=G.prestige>3?rng(1,3):rng(0,1);const newTr=[];
  for(let i=0;i<trCnt;i++){const src=allSchools().filter(s=>s.id!==G.myId&&teamOvr(s.id)<G.offR);if(!src.length)break;const ss=pick(src);const sp=sPlayers(ss.id).filter(p=>p.yr<12&&p.yr>9).sort((a,b)=>b.rat-a.rat);if(!sp.length)continue;const tp=sp[0];tp.sId=G.myId;_spVer++;tp.stats=emS();tp.seasStats=emS();newTr.push(tp);}
  for(const p of myP()){
    // Base SP from dev trait (foundation, dev trait still the primary driver)
    const base=DEV_SP[p.dev]||3;
    // Staff bonus
    const hcB=G.staff.hc.lvl;
    // Trait modifiers
    const coB=p.traits&&p.traits.includes('coachable')?2:0;
    const wkB=p.traits&&p.traits.includes('workhorse')?1:0;
    const laP=p.traits&&p.traits.includes('lazy')?-1:0;
    const gyB=p.traits&&p.traits.includes('gym-rat')?1:0;
    // Performance modifier: based on season performance score (calcSS)
    // Excellent performers (+3), good (+2), average (+1), below avg (0), poor (-1)
    const ss=clamp(calcSS(p),0,120);
    let perfMod=0;
    if(ss>=80)perfMod=3;
    else if(ss>=55)perfMod=2;
    else if(ss>=30)perfMod=1;
    else if(ss>=15)perfMod=0;
    else perfMod=-1;
    // Training level modifier: higher facility investment unlocks bonus SP
    // Level 1-5: 0, Level 6-10: +1, Level 11-15: +2, Level 16-20: +3
    const tLvl=getTrainLevel();
    const trainMod=tLvl>=16?3:tLvl>=11?2:tLvl>=6?1:0;
    // Combine, dev trait is the floor, performance and training are multipliers
    const totalSP=base+Math.round(hcB*.5)+coB+wkB+laP+gyB+perfMod+trainMod;
    p.sp=(p.sp||0)+Math.max(1,Math.round(totalSP*0.6));
  }
  for(const p of myP())updDev(p);
  // FIX v1.11.2b: Capture league snapshot BEFORE AI wins/losses are reset to 0
  const _snapStateChampId=G.playoff?.stateChampId||(G.playoff?.stateChamp?G.myId:null);
  const _snapStateChampSch=_snapStateChampId?getS(_snapStateChampId):null;
  const _snapStateChampName=_snapStateChampSch?`${_snapStateChampSch.name} ${_snapStateChampSch.mascot}`:null;
  const _snapDivWinners=G.divisions.map(div=>{
    // Sort by win%, then by total wins as tiebreak, then by point differential (losses as proxy)
    const sorted=[...div.teams].sort((a,b)=>{
      const aw=a.wins/(a.wins+a.losses+.001),bw=b.wins/(b.wins+b.losses+.001);
      if(Math.abs(bw-aw)>0.001)return bw-aw;
      if(b.wins!==a.wins)return b.wins-a.wins;
      return a.losses-b.losses; // fewer losses wins tiebreak
    });
    const top=sorted[0];
    const second=sorted[1];
    // Only award if top team is strictly ahead of second (no shared title)
    const topW=top?top.wins/(top.wins+top.losses+.001):0;
    const secW=second?second.wins/(second.wins+second.losses+.001):0;
    const isClearWinner=!second||(Math.abs(topW-secW)>0.001)||top.wins>second.wins;
    return top?{id:top.id,name:`${top.name} ${top.mascot}`,rec:`${top.wins}-${top.losses}`,divName:div.name,clear:isClearWinner}:null;
  }).filter(Boolean);
  // Snapshot AI seasStats BEFORE the AI offseason loop resets them (needed for end-of-season awards)
  const _aiSeasStatsSnap=new Map();
  for(const p of G.players){if(p.sId!==G.myId)_aiSeasStatsSnap.set(p.id,{...p.seasStats});}

  // Snapshot player roster size after their own graduation+recruitment, for AI parity
  const myRosterTarget=myP().length;
  for(const div of G.divisions)for(const s of div.teams){
    if(s.id===G.myId)continue;
    const aiSeniors=G.players.filter(p=>p.sId===s.id&&p.yr===12).length;
    G.players=G.players.filter(p=>!(p.sId===s.id&&p.yr===12));
    for(const p of G.players.filter(p=>p.sId===s.id))if(p.yr<12){p.yr++;bodyGrow(p,s);}
    // Recruit at least as many freshmen as seniors lost, plus 0-3 extra to grow the roster
    const aiCurrent=G.players.filter(p=>p.sId===s.id).length;
    const deficit=myRosterTarget-aiCurrent;
    const minFr=Math.max(aiSeniors,5)+rng(0,3);
    const aiFrCnt=clamp(Math.max(minFr,deficit+rng(-1,3)),5,22);
    const n2=cNeeds(s.id);for(let i=0;i<aiFrCnt;i++){const p2=genPlayer(s.id,9,s.cls,n2);adjDev(p2,s);G.players.push(p2);}
    for(const p of G.players.filter(p=>p.sId===s.id)){const g=p.pot-p.rat;p.rat=clamp(Math.round(p.rat+Math.max(0,g*.1+rngF(-1,3))),1,p.pot);updDev(p);}
    // AI SEASON PERFORMANCE: OVR gains/losses scale with win ratio.
    // Good seasons → bigger OVR boost (prestige-scaled). Bad seasons → slight OVR erosion.
    (function(){
      const aiPrestige=clamp(s.prestige||1,1,5);
      const aiRatio=s.wins/(s.wins+s.losses||1);
      // Base bonus from prestige (1-5 → 1-5 OVR points for a great season)
      const prestigeBase=Math.round(1+(aiPrestige-1)*1.0);
      let ovrDelta;
      if(aiRatio>=0.80){
        // Dominant season: full prestige bonus + extra
        ovrDelta=prestigeBase+rng(1,2);
      } else if(aiRatio>=0.60){
        // Winning season: standard prestige gain
        ovrDelta=prestigeBase;
      } else if(aiRatio>=0.45){
        // Near-.500: small gain
        ovrDelta=Math.max(1,Math.round(prestigeBase*0.5));
      } else if(aiRatio>=0.30){
        // Losing season: no gain, slight decay on some players
        ovrDelta=0;
      } else {
        // Terrible season: noticeable OVR erosion
        ovrDelta=-rng(1,2);
      }
      for(const p of G.players.filter(p=>p.sId===s.id)){
        if(ovrDelta>0){
          p.rat=clamp(p.rat+ovrDelta,1,p.pot);
          // Attribute side-effects proportional to OVR gain
          _attrBoostForOvr(p,ovrDelta);
        } else if(ovrDelta<0){
          // Decay: only affects players who played poorly (simulate by random chance)
          if(Math.random()<0.4){
            p.rat=clamp(p.rat+ovrDelta,1,99);
            // Slight attribute decay too
            if(Math.random()<0.5)p.spd=clamp(p.spd-1,1,99);
            if(Math.random()<0.5)p.str=clamp(p.str-1,1,99);
            if(Math.random()<0.3)p.awr=clamp(p.awr-1,1,99);
          }
        } else {
          // ~.500 season: small random SP bank only, no direct OVR change
          p.sp=(p.sp||0)+rng(0,1);
        }
      }
    })();
    // AI PRESTIGE: Rises more easily: win ratio boost is doubled, and even losing teams recover
    (function(){
      const aiRatio=s.wins/(s.wins+s.losses||1);
      if(aiRatio>.6)s.prestige=clamp((s.prestige||1)+.5,1,5);
      else if(aiRatio>.4)s.prestige=clamp((s.prestige||1)+.2,1,5);
      else s.prestige=clamp((s.prestige||1)-.1,1,5);
    })();
    // Reset season stats for AI players (carStats accumulates correctly; seasStats must reset each year)
    for(const p of G.players.filter(p=>p.sId===s.id))seasonDevCheck(p);
    for(const p of G.players.filter(p=>p.sId===s.id))p.seasStats=emS();
    s.wins=0;s.losses=0;
  }
  // Collect dev/potential changes for my players, build popups
  const _devChanges=[];
  for(const p of myP()){const chg=seasonDevCheck(p);if(chg)_devChanges.push({p,chg});}
  // Build dev/pot change popup (one combined card listing all changes)
  if(_devChanges.length){
    const DEV_INFO2={'Normal':{icon:'',color:'var(--mu)'},'Impact':{icon:'',color:'var(--te)'},'Star':{icon:'',color:'var(--gd)'},'Elite Dev':{icon:'',color:'var(--gn)'}};
    const devRows=_devChanges.filter(x=>x.chg.devChanged).map(({p,chg})=>{
      const upColor=chg.devUp?'var(--gn)':'var(--ac)';
      const arrow=chg.devUp?'':'';
      const newInfo=DEV_INFO2[chg.newDev]||{icon:'',color:'var(--tx)'};
      return`<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--bd)">
        ${face(p.fs,36)}
        <div style="flex:1">
          <div style="font-weight:700;font-size:13px">${p.fn} ${p.ln} <span class="pb2" style="font-size:10px">${p.pos}</span></div>
          <div style="font-size:12px;margin-top:2px">${arrow} Dev: <span style="color:var(--mu)">${chg.prevDev}</span> → <span style="color:${upColor};font-weight:700">${newInfo.icon} ${chg.newDev}</span></div>
        </div>
      </div>`;
    }).join('');
    const potRows=_devChanges.filter(x=>x.chg.potChanged).map(({p,chg})=>{
      const upColor=chg.potUp?'var(--gn)':'var(--ac)';
      const arrow=chg.potUp?'▲':'▼';
      const diff=(chg.newPot-chg.prevPot);
      return`<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--bd)">
        ${face(p.fs,36)}
        <div style="flex:1">
          <div style="font-weight:700;font-size:13px">${p.fn} ${p.ln} <span class="pb2" style="font-size:10px">${p.pos}</span></div>
          <div style="font-size:12px;margin-top:2px">${arrow} Potential: <span style="color:var(--mu)">${chg.prevPot}</span> → <span style="color:${upColor};font-weight:700">${chg.newPot}</span> <span style="color:${upColor};font-size:11px">(${diff>0?'+':''}${diff})</span></div>
        </div>
      </div>`;
    }).join('');
    const hasDevChanges=_devChanges.some(x=>x.chg.devChanged);
    const hasUpgrades=_devChanges.some(x=>x.chg.devUp||x.chg.potUp);
    const titleColor=hasUpgrades?'var(--gn)':'var(--ac)';
    const titleIcon=hasUpgrades?'':'';
    const devChangePop=`<div class="pc" style="border-top-color:${titleColor};text-align:left">
      <h3 style="color:${titleColor};text-align:center">${titleIcon} Preseason Dev Report</h3>
      <div style="font-size:12px;color:var(--mu);text-align:center;margin-bottom:12px">Based on last season's performance, some players' dev traits and potentials have shifted.</div>
      ${devRows?`<div style="font-family:var(--hd);font-size:11px;font-weight:800;color:var(--te);margin-bottom:4px">Dev Trait Changes</div>${devRows}`:''}
      ${potRows?`<div style="font-family:var(--hd);font-size:11px;font-weight:800;color:var(--te);margin-top:10px;margin-bottom:4px">Potential Changes</div>${potRows}`:''}
      <div style="margin-top:12px;font-size:11px;color:var(--mu);background:var(--s3);padding:7px 10px;border-radius:4px;border-left:3px solid var(--gd)"> Dev traits affect SP earned per offseason phase. Potential caps how high a player can grow.</div>
    </div>`;
    pops.push(devChangePop);
  }

  // ── SEASON AWARDS (computed before stats reset) ──
  // Eligible pool: all skill-position players league-wide with 3+ games played
  // Award pool: all skill-position players league-wide.
  // For AI players whose seasStats were already reset, use the snapshot captured before the AI loop.
  function _awardSeasStats(p){return p.sId===G.myId?p.seasStats:(_aiSeasStatsSnap.get(p.id)||p.seasStats);}
  function _calcAwardScoreSnap(p){
    const DEV_SCORE={'Elite Dev':100,'Star':75,'Impact':50,'Normal':25};
    const devScore=(DEV_SCORE[p.dev]||25)/100;
    const ratScore=p.rat/99;
    const ss2=_awardSeasStats(p);
    const gp=Math.max(1,ss2.gp||1);
    if(p.pos==='OL'||p.pos==='K')return 0;
    if((ss2.gp||0)<3)return 0;
    // Stat score per position (mirrors calcSS logic but uses snapshot stats)
    let statRaw=0;
    if(p.pos==='QB')statRaw=((ss2.passYds||0)/gp)/12+((ss2.passTD||0)/gp)*7-((ss2.passInt||0)/gp)*4;
    else if(p.pos==='RB')statRaw=((ss2.rushYds||0)/gp)/5+((ss2.rushTD||0)/gp)*9;
    else if(['WR','TE'].includes(p.pos))statRaw=((ss2.recYds||0)/gp)/5+((ss2.recTD||0)/gp)*9;
    else if(['LB','DL'].includes(p.pos))statRaw=((ss2.tackles||0)/gp)*1.5+((ss2.sacks||0)/gp)*7;
    else if(['CB','S'].includes(p.pos))statRaw=((ss2.tackles||0)/gp)*1.5+((ss2.ints||0)/gp)*9;
    else statRaw=p.rat*0.5;
    const ss=clamp(statRaw,0,120)/120;
    return ss*0.70 + ratScore*0.20 + devScore*0.10;
  }
  // every position can win: a season is measured against what a great game looks like at that position
  const _AW_BENCH=Object.assign({OL:5,K:7},STREAK_BENCH);
  const _awScore=p=>{const ss2=_awardSeasStats(p),gp=Math.max(1,ss2.gp||1);if((ss2.gp||0)<3)return 0;
    const pg=p.pos==='K'?((ss2.fgm||0)*3+(ss2.xpm||0))/gp:scorePerfEntry(ss2,p.pos)/gp;
    return clamp(pg/(_AW_BENCH[p.pos]||10),0,3)/3*0.72+(p.rat/99)*0.2+(({'Elite Dev':100,'Star':75,'Impact':50,'Normal':25}[p.dev]||25)/100)*0.08;};
  // state awards go to players from your own state; national awards to the whole country
  const _myStK=clsSt(G.cls),_cfIds=fltSchoolIds(_myStK==='CF'?'ALL':'ST:'+_myStK);
  // how far a season stands out from the average starter at the same position (z-score), so no position is favored
  const _awAll=G.players.filter(p=>!p.grad&&p.sId!=null&&(_awardSeasStats(p).gp||0)>=3),_awSc=new Map(),_awRaw=new Map(),_awPos={};
  for(const p of _awAll){const r=_awScore(p);_awRaw.set(p.id,r);(_awPos[p.pos]=_awPos[p.pos]||[]).push(r);}
  // measured against the real contributors at each position (its top 30%), not the backups who barely play
  for(const k in _awPos){const A=_awPos[k].sort((a,b)=>b-a).slice(0,Math.max(5,Math.ceil(_awPos[k].length*0.3))),m=A.reduce((a,b)=>a+b,0)/A.length,sd=Math.sqrt(Math.max(1e-6,A.reduce((a,b)=>a+(b-m)*(b-m),0)/A.length));_awPos[k]={m,sd};}
  for(const p of _awAll){const q=_awPos[p.pos];_awSc.set(p.id,((_awRaw.get(p.id)-q.m)/q.sd)*(AW_POSW[p.pos]||1)+(p.rat-60)/60);}
  const _calcAwardScoreSnap2=p=>_awSc.get(p.id)||0;
  const _awardPool=_awAll.filter(p=>_cfIds.has(p.sId));
  try{seasonAwardsAll(_awAll,_awSc,_myStK,pops,_aiSeasStatsSnap);}catch(e){console.error('awards',e);}
  // Mr. Football: best overall player any grade
  const _mrPool=[..._awardPool].sort((a,b)=>_calcAwardScoreSnap2(b)-_calcAwardScoreSnap2(a));
  const _mrWinner=_mrPool[0]||null;
  const _mrRunnerUp=_mrPool[1]||null;
  // Freshman of the Year: grade 9 only
  const _frAwardPool=_awardPool.filter(p=>p.yr===9).sort((a,b)=>_calcAwardScoreSnap2(b)-_calcAwardScoreSnap2(a));
  const _frAwardWinner=_frAwardPool[0]||null;
  const _frAwardRunnerUp=_frAwardPool[1]||null;

  // Build award popups, always show even if winner isn't my player
  if(_mrWinner){
    const isMyPlayer=_mrWinner.sId===G.myId;
    pops.push(bAwardPop('mr',_mrWinner,_mrRunnerUp,G.cls,isMyPlayer,_aiSeasStatsSnap.get(_mrWinner.id),_mrRunnerUp?_aiSeasStatsSnap.get(_mrRunnerUp.id):null,`${stName(_myStK)} Player of the Year`));
    if(isMyPlayer)addLog(`<span style="color:var(--gd)"> ${_mrWinner.fn} ${_mrWinner.ln} won Mr. Football (${clsL(G.cls)})!</span>`);
    // Store award on player object for history
    if(!_mrWinner.awards)_mrWinner.awards=[];
    _mrWinner.awards.push({type:'Mr. Football',cls:G.cls,yr:G.yr});
  }
  if(_frAwardWinner){
    const isMyPlayer=_frAwardWinner.sId===G.myId;
    pops.push(bAwardPop('fr',_frAwardWinner,_frAwardRunnerUp,G.cls,isMyPlayer,_aiSeasStatsSnap.get(_frAwardWinner.id),_frAwardRunnerUp?_aiSeasStatsSnap.get(_frAwardRunnerUp.id):null,`${stName(_myStK)} Freshman of the Year`));
    if(isMyPlayer)addLog(`<span style="color:var(--te)"> ${_frAwardWinner.fn} ${_frAwardWinner.ln} won Freshman of the Year (${clsL(G.cls)})!</span>`);
    if(!_frAwardWinner.awards)_frAwardWinner.awards=[];
    _frAwardWinner.awards.push({type:'Freshman of the Year',cls:G.cls,yr:G.yr});
  }

  // ── SOS Playing-Time SP Bonus ──
  // Players who appeared in games this season earn bonus SP for having faced tough competition.
  // Only applies on tough schedules (SOS≥60). Bad schedules give nothing extra.
  // Scales: SOS 60-69 → +1 SP, SOS 70-79 → +2 SP, SOS 80+ → +3 SP
  // Player must have at least 3 games played (gp≥3). OL/K always qualify if SOS is elite.
  const _sosSPVal=calcSOS(G.myId);
  const _sosSPBonus=_sosSPVal>=80?3:_sosSPVal>=70?2:_sosSPVal>=60?1:0;
  const _sosSPPops=[];
  if(_sosSPBonus>0){
    const _sosSPPlayers=myP().filter(p=>(p.pos==='OL'||p.pos==='K'||(_sosSPVal>=80?(p.seasStats.gp||0)>=2:(p.seasStats.gp||0)>=3)));
    for(const p of _sosSPPlayers){p.sp=(p.sp||0)+_sosSPBonus;}
    const _sosTierLabel=_sosSPVal>=80?'Elite':'Tough';
    if(_sosSPPlayers.length>0){
      addLog(`<span style="color:var(--gd)"> ${_sosTierLabel} Schedule Bonus: ${_sosSPPlayers.length} player${_sosSPPlayers.length!==1?'s':''} earned +${_sosSPBonus} SP for competing against a tough schedule (SOS ${_sosSPVal}).</span>`);
      _sosSPPops.push(bEvPop(` ${_sosTierLabel} Schedule Pays Off!`,`Your players earned <strong>+${_sosSPBonus} SP</strong> each for competing against a <strong>${_sosTierLabel} SOS (${_sosSPVal})</strong>.<br><br><strong>${_sosSPPlayers.length}</strong> player${_sosSPPlayers.length!==1?'s':''} with playing time benefited. Scheduling hard opponents develops your squad!`,null,'var(--gd)'));
    }
  }

  try{const ab=schAbbr(myS()),yr=(G.baseYear||2026)+(G.yr-1);
    for(const p of G.players.filter(q=>q.sId===G.myId))archiveSeason(p,yr,ab);}catch(e){console.error('season archive',e);}
  for(const p of G.players.filter(q=>q.sId===G.myId&&q.onJV))p.seasStats=emS();
  for(const p of myP()){p.seasStats=emS();p.inj=0;p.injName=null;p.injSeason=false;p.camp=false;p.streak=null;p.streakUsed=false;p.streakGamesLeft=0;p.streakCD=0;p.perfHistory=[];}
  // Snapshot award winner info for history (name, pos, school, stats) before any further resets
  function _awardHistSnap(p){
    if(!p)return null;
    const sch=getS(p.sId);
    const snap=_aiSeasStatsSnap.get(p.id)||p.seasStats||{};
    return{pid:p.id,name:`${p.fn} ${p.ln}`,pos:p.pos,rat:p.rat,dev:p.dev,sId:p.sId,schName:sch?`${sch.name} ${sch.mascot}`:'',fs:p.fs,
      stats:{gp:snap.gp||0,passYds:snap.passYds||0,passTD:snap.passTD||0,passInt:snap.passInt||0,
             rushYds:snap.rushYds||0,rushTD:snap.rushTD||0,recYds:snap.recYds||0,recTD:snap.recTD||0,
             tackles:snap.tackles||0,sacks:snap.sacks||0,ints:snap.ints||0}};
  }
  // Snapshot other-league champions before their season resets
  const _otherLeagueChamps={};
  if(G.allLeagues){
    for(const [cls,lg] of Object.entries(G.allLeagues)){
      const allT=lg.divisions.flatMap(d=>d.teams),_po=cls==='INTL'||cls==='OOS'?null:lgStatePO(lg,cls);
      const champ=_po&&_po.champ!=null?allT.find(t=>t.id===_po.champ):[...allT].sort((a,b)=>{const aw=a.wins/(a.wins+a.losses+.001),bw=b.wins/(b.wins+b.losses+.001);return bw-aw;})[0];
      if(champ)_otherLeagueChamps[cls]={id:champ.id,name:`${champ.name} ${champ.mascot}`,rec:`${champ.wins}-${champ.losses}`};
    }
  }
  try{aiReclassify(_otherLeagueChamps);}catch(e){console.error('AI reclassification',e);}
  // Snapshot SOS now (while schedule data still has this season's opponents) so next
  // offseason's freshman generation can reference it via G.lastSeasonSOS.
  G.lastSeasonSOS=calcSOS(G.myId);
  G.hist.push({natl:(G.natl&&G.natl.yr===G.yr)?Object.assign({},G.natl):null,yr:G.yr,wins:G.wins,losses:G.losses,prestige:G.prestige,cls:G.cls,champ:G.playoff?.champ||false,stateChamp:G.playoff?.stateChamp||false,
    // FIX v1.11.2b: Use pre-captured snapshots (before AI records were zeroed)
    stateChampId:_snapStateChampId,
    stateChampName:_snapStateChampName,
    divWinners:_snapDivWinners,
    otherLeagueChamps:_otherLeagueChamps,
    // Season awards
    mrFootball:_awardHistSnap(_mrWinner),
    freshmanOTY:_awardHistSnap(_frAwardWinner)
  });
  // ── Other-classification championship news ──
  for(const [cls,champData] of Object.entries(_otherLeagueChamps)){
    addNews('othercls',` ${cls} State Champion: ${champData.name}`.replace(cls+' State',clsName(cls)+' State'),`${champData.name} finish ${champData.rec} to claim the ${2026+(G.yr-1)} ${XCLS[cls]?clsName(cls):cls} title.`);
  }
  addLog(`<span style="color:var(--mu)">━━ ${2026+(G.yr-1)}: ${G.wins}-${G.losses} ━━</span>`);
  const ratio=G.wins/(G.wins+G.losses||1);
  if(ratio>.7)G.prestige=clamp(G.prestige+.35,1,5);else if(ratio<.4)G.prestige=clamp(G.prestige-.2,1,5);
  // Base budget: increased from 25k to 40k, plus prestige and per-win bonuses raised
  const baseBudget=40000+Math.round(G.prestige*8000)+(G.wins*2000);
  // Division win bonus: use the snapshotted div winners (captured before AI records reset)
  const divWon=_snapDivWinners.some(dw=>dw.id===G.myId&&dw.clear!==false);
  const divBonus=divWon?35000:0;
  if(divWon){
    pops.push(bEvPop(' Division Champions!',`Your team won the division title! <strong style="color:var(--gd)">+$35,000 bonus!</strong>`,null,'var(--gd)'));
    addLog(`<span style="color:var(--gd)"> Division champions! +$35,000</span>`);
  }
  G.budget+=baseBudget+divBonus;
  // ── Snapshot record BEFORE resetting wins/losses for the new year ──
  const _endWins=G.wins, _endLosses=G.losses;
  try{const q=myPlayer();if(q&&!q.grad&&G.players.includes(q))q._snap={rat:q.rat,at:Object.assign({},q.at||{}),spd:q.spd,str:q.str,awr:q.awr};}catch(e){}
  try{jobOffersGen(_endWins,_endLosses,!!(G.playoff&&(G.playoff.stateChamp||G.playoff.stateChampId===G.myId)),divWon);}catch(e){console.error('jobs',e);}
  G.yr++;G.wins=0;G.losses=0;(()=>{try{progOffseason();}catch(e){}})(),G.phase='offseason';G.osPhase=0;G.playoff=null;G.seasonRivalId=null;

  // ── End-of-season for other leagues: determine champ, reset, regenerate ──
  if(G.allLeagues){
    for(const [cls,lg] of Object.entries(G.allLeagues)){
      // the state champion is the winner of the playoff bracket played at the end of the season
      const allOtherTeams=lg.divisions.flatMap(d=>d.teams),_poC=_otherLeagueChamps[cls];
      const champ=(_poC&&allOtherTeams.find(t=>t.id===_poC.id))||[...allOtherTeams].sort((a,b)=>{
        const aw=a.wins/(a.wins+a.losses+.001),bw=b.wins/(b.wins+b.losses+.001);return bw-aw;
      })[0];
      lg.champId=champ?champ.id:null;
      lg.champName=champ?`${champ.name} ${champ.mascot}`:null;
      // Reset wins/losses for next season
      for(const t of allOtherTeams){t.wins=0;t.losses=0;}
      if(isLiteCls(cls))continue; // light states: liteOffseason below
      // Age + graduate + recruit AI players for other leagues (one pass per league instead of a full scan per school)
      const lgIds=new Set(allOtherTeams.map(s=>s.id)),srCnt={};
      G.players=G.players.filter(p=>{if(lgIds.has(p.sId)&&p.yr===12){srCnt[p.sId]=(srCnt[p.sId]||0)+1;return false;}return true;});
      for(const p of G.players)if(lgIds.has(p.sId)&&p.yr<12){p.yr++;bodyGrow(p);}
      for(const s of allOtherTeams){
        // freshmen refill the roster toward a normal size for the class (a fixed count let small schools grow every year)
        const cfg=clsSz(s.cls||cls),cur=sPlayers(s.id).length,tgt=rng(cfg.r[0],cfg.r[1]);
        const aiFrCnt=clamp(tgt-cur,3,Math.max(5,(srCnt[s.id]||0)+3));
        const n2=cNeeds(s.id);for(let i=0;i<aiFrCnt;i++){const p2=genPlayer(s.id,9,s.cls||cls,n2);G.players.push(p2);}
      }
      for(const p of G.players){if(!lgIds.has(p.sId))continue;const g=p.pot-p.rat;p.rat=clamp(Math.round(p.rat+Math.max(0,g*.1+rngF(-1,3))),1,p.pot);
        // Reset season stats
        p.seasStats=emS();p.inj=0;p.injName=null;p.injSeason=false;}
    }
  }

  try{liteOffseason();}catch(e){console.error('light states',e);}
  buildSeasonDates(2026+(G.yr-1));genSched();updateRats();
  // Open schedule builder for the new season
  const _demResult=checkClassification(_snapDivWinners,_endWins,_endLosses);
  if(_demResult.demoted){
    const reason=_demResult.reason==='roster'?`Your roster fell below the minimum for <strong>${clsL(G.cls)}</strong>.`
      :`Sustained poor performance drove demotion pressure to <strong>100%</strong>.`;
    pops.push(bEvPop(' Reclassified Down',`${reason}<br><br>You have been moved down to <strong style="color:var(--te)">${clsL(_demResult.cls)}</strong>. Win more games to rebuild pressure resistance.`,null,'var(--ac)'));
  } else if(G.reclsLog&&G.reclsLog.length){
    // Show pressure update if pressure changed meaningfully
    const lastEntry=G.reclsLog[G.reclsLog.length-1];
    if(lastEntry&&Math.abs(lastEntry.delta)>=15){
      const pColor=lastEntry.delta>0?'var(--rd)':'var(--gn)';
      const pIcon=lastEntry.delta>0?'':'';
      const clsIdx2=CLS_ORDER.indexOf(G.cls);
      pops.push(bEvPop(`${pIcon} Reclassification Pressure`,
        `${lastEntry.reason}<br><br>Pressure: <strong style="color:var(--mu)">${lastEntry.prev}%</strong> → <strong style="color:${pColor}">${lastEntry.after}%</strong><br><br>${lastEntry.after>=75?'<span style="color:var(--rd)"> Pressure is in the danger zone. Sustained losses will force a demotion!</span>':lastEntry.after>=50?'<span style="color:var(--gd)">Pressure is building. Win seasons will reduce it.</span>':'<span style="color:var(--gn)">Good progress. Keep winning to stay safe.</span>'}`,
        null,pColor));
    }
  }
  // MOVE-UP: offer at end of season if eligible (and not just demoted)
  const _pcA=pcAuto()&&!ccOn(); // Player Career: the school decides, then the staff builds the schedule and spends the budget
  const _moveUpPop=(!_demResult.demoted)?(_pcA?pcMoveUp():buildMoveUpPop()):null;
  if(_pcA){try{pcAutoSched();pcAutoBudget();pcAutoSP();pcAutoCaptains();}catch(e){console.error('player career auto',e);}}
  const _frPops=newFr.slice(0,5).map(p=>bFrPop(p));
  const _trPops=newTr.map(p=>bTrPop(p));
  _popQ=[...pops,..._frPops,..._trPops,...(_sosSPPops||[]),...(_moveUpPop?[_moveUpPop]:[])];
  _popI=0;_popCb=()=>{nav('dash');if(G.customSchedPending)openScheduleBuilder();};
  if(_popQ.length>0)showPop();else{nav('dash');if(G.customSchedPending)openScheduleBuilder();}
}

function checkClassification(snapDivWinners,endWins,endLosses){
  if(G.yr===1){
    if(!G.reclsPressure)G.reclsPressure=0;
    if(!G.reclsLog)G.reclsLog=[];
    if(!G.promotedYr)G.promotedYr=0;
    return {demoted:false};
  }
  const ms=myS();
  const clsIdx=myClsOrder().indexOf(G.cls);
  if(!G.reclsPressure)G.reclsPressure=0;
  if(!G.reclsLog)G.reclsLog=[];
  if(!G.promotedYr)G.promotedYr=0;
  // Use the passed-in season record (captured before G.wins/losses were reset to 0)
  const wins=endWins!=null?endWins:G.wins;
  const losses=endLosses!=null?endLosses:G.losses;
  const totalGames=wins+losses;
  const ratio=totalGames>0?wins/totalGames:0;
  const _divChampBonus=(snapDivWinners&&snapDivWinners.some(dw=>dw.id===G.myId))?-10:0;

  // ── SOS modifier ──
  // SOS only matters when you had a GOOD season, it rewards earning wins against tough competition.
  // A bad season with high SOS still hurts (tough schedule is no excuse for a losing record).
  // A bad/mediocre season with low SOS is evaluated purely on record.
  const mySOS=calcSOS(G.myId); // 0-100 scale
  // Tier the SOS: High≥70, Mid≥55, Low<55
  let sosBonus=0;
  let sosPart='';
  if(ratio>=0.83){
    // Dominant season: high SOS gives extra relief, mid SOS gives small bonus
    if(mySOS>=70){sosBonus=-8;sosPart=`, elite SOS bonus (${mySOS})`;}
    else if(mySOS>=55){sosBonus=-4;sosPart=`, solid SOS bonus (${mySOS})`;}
    // Low SOS: no bonus, wins came easy
  } else if(ratio>=0.70){
    // Strong season: high SOS turns hold into actual relief
    if(mySOS>=70){sosBonus=-6;sosPart=`, tough schedule reward (SOS ${mySOS})`;}
    else if(mySOS>=55){sosBonus=-2;sosPart=`, decent SOS bump (${mySOS})`;}
    // Low SOS: no bonus
  } else if(ratio>=0.58){
    // Decent season: high SOS gives a small break, otherwise no effect
    if(mySOS>=70){sosBonus=-3;sosPart=`, tough schedule helped (SOS ${mySOS})`;}
    // Mid/low SOS: no effect on a mediocre season
  }
  // ratio < 0.58 (break-even and below): SOS never helps: record speaks for itself

  let pressureDelta=0;
  let pressureReason='';
  const isChamp=G.playoff?.stateChamp||false;
  if(isChamp){
    pressureDelta=-G.reclsPressure;
    pressureReason='State championship: pressure reset to 0%';
  } else if(ratio>=0.83){
    pressureDelta=-10+_divChampBonus+sosBonus;
    pressureReason=`Dominant season (${wins}-${losses}), pressure reduced${_divChampBonus?', div champ bonus':''}${sosPart}`;
  } else if(ratio>=0.70){
    pressureDelta=0+_divChampBonus+sosBonus;
    pressureReason=`Strong season (${wins}-${losses}), pressure held${_divChampBonus?', div champ bonus':''}${sosPart}`;
  } else if(ratio>=0.58){
    pressureDelta=8+_divChampBonus+sosBonus;
    pressureReason=`Decent season (${wins}-${losses}), slight pressure${_divChampBonus?', div champ bonus':''}${sosPart}`;
  } else if(ratio>=0.50){
    pressureDelta=15+_divChampBonus;
    pressureReason=`Break-even season (${wins}-${losses}), pressure building`;
  } else if(ratio>=0.38){
    pressureDelta=25;
    pressureReason=`Losing season (${wins}-${losses}), +25% pressure`;
  } else if(ratio>=0.25){
    pressureDelta=38;
    pressureReason=`Poor season (${wins}-${losses}), +38% pressure`;
  } else {
    pressureDelta=50;
    pressureReason=`Terrible season (${wins}-${losses}), +50% pressure`;
  }
  const prevPressure=G.reclsPressure;
  G.reclsPressure=clamp((G.reclsPressure||0)+pressureDelta,0,100);
  G.reclsLog.push({yr:G.yr,wins,losses,sos:mySOS,prev:prevPressure,delta:pressureDelta,after:G.reclsPressure,reason:pressureReason});
  if(G.reclsLog.length>20)G.reclsLog.shift();
  // ── 3-year demotion immunity after moving up ──
  // Prevents instant relegation when stepping up to a tougher classification.
  const yearsAtNewCls=G.promotedYr>0?G.yr-G.promotedYr:999;
  if(G.reclsPressure>=100&&clsIdx>0){
    if(yearsAtNewCls<=3){
      // Still in grace period, cap pressure at 99 and inform player
      G.reclsPressure=99;
      addLog(`<span style="color:var(--gd)"> Demotion immunity, ${3-yearsAtNewCls+1} year(s) of protection remaining after moving up to ${clsL(G.cls)}. Keep building!</span>`);
      return {demoted:false};
    }
    const newCls=myClsOrder()[clsIdx-1];
    G.cls=newCls;ms.cls=newCls;
    G.reclsPressure=0;
    addLog(`<span style="color:var(--te)"> Reclassified DOWN to ${newCls}, sustained poor performance (pressure reached 100%).</span>`);
    return {demoted:true,cls:newCls,reason:'pressure'};
  }
  return {demoted:false};
}

