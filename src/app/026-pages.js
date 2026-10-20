// ═══════════ PAGES ═══════════
function pgDash(){
  if(ccOn())return ccDash();
  const ms=myS(),pl=myP();
  const nextUnplayed=G.sched.find(g=>!g.result);
  const curYear=2026+(G.yr-1);
  const regDone=allRegDone();
  const playoffSlot=G.sched.find(g=>g.type==='playoff'&&!g.result);
  const no=nextUnplayed&&nextUnplayed.type==='regular'?getS(nextUnplayed.oppId):null;
  const playoffOpp=playoffSlot?getS(playoffSlot.oppId):null;

  let actionBtn='';
  const hasEmptySlots=G.sched.some(g=>g.custom&&g._empty);
  if(hasEmptySlots){
    actionBtn=`<button class="btn bgd" style="padding:8px 18px;font-size:14px;animation:pulse 1.2s infinite" onclick="openScheduleBuilder()"> Build Your Schedule</button>`;
  } else if(G.phase==='offseason'&&no&&nextUnplayed&&nextUnplayed.type==='regular'){
    // a new season that has not started yet: the next step is week 1, not the offseason
    actionBtn=`<button class="btn" style="padding:8px 18px;font-size:14px" onclick="advWk()">Play Week ${nextUnplayed.wk}</button>`;
  } else if(G.phase==='offseason'){
    actionBtn=`<button class="btn bgn" style="padding:8px 18px;font-size:14px" onclick="doOffseason()">Begin Offseason</button>`;
  } else if(G.phase==='regular'&&no){
    actionBtn=`<button class="btn" style="padding:8px 18px;font-size:14px" onclick="advWk()">Play Week ${nextUnplayed.wk}</button>`;
  } else if((G.phase==='regular'||G.phase==='playoffs')&&regDone&&!playoffSlot&&!G.playoff){
    actionBtn=`<button class="btn bgd" style="padding:8px 18px;font-size:14px" onclick="startPlayoffs()">State Playoffs</button>`;
  } else if(G.phase==='playoffs'&&playoffSlot&&playoffOpp){
    const _prn=poRoundName(playoffSlot.playoffRound)||`Round ${playoffSlot.playoffRound}`;
    actionBtn=`<button class="btn bgd" style="padding:8px 18px;font-size:14px" onclick="advPlayoffWeek()"> ${_prn}</button>`;
  } else if(G.phase==='postseason'){
    try{natEnsure();}catch(e){console.error('natl',e);}
    actionBtn=natMine()?`<button class="btn bgd" style="padding:8px 18px;font-size:14px;animation:pulse 1.2s infinite" onclick="natPlay()">National Championship</button>`
      :`<button class="btn bgn" style="padding:8px 18px;font-size:14px" onclick="doOffseason()">Begin Offseason</button>`;
  } else if(regDone&&!G.playoff&&G.phase!=='postseason'){
    actionBtn=`<button class="btn bgd" style="padding:8px 18px;font-size:14px" onclick="startPlayoffs()">State Playoffs</button>`;
  }

  const phaseLabel={offseason:'Offseason',regular:`Week ${G.week||0}`,playoffs:'Playoffs',postseason:'Postseason'}[G.phase]||G.phase;
  const presStars=''.repeat(Math.round(G.prestige));

  // Next game block
  let nextGameBlock='';
  if(no){
    const oppOvr=teamOvr(no.id);
    const myOvr=Math.round((G.offR+G.defR)/2);
    const favStr=myOvr>oppOvr?`<span style="color:var(--gn);font-size:11px">▲ Favored +${myOvr-oppOvr}</span>`:myOvr<oppOvr?`<span style="color:var(--te);font-size:11px">▼ Underdog −${oppOvr-myOvr}</span>`:`<span style="color:var(--mu);font-size:11px">Even matchup</span>`;
    nextGameBlock=`<div class="dash-next-game${nextUnplayed.isRivalry?' rivalry':''}">
      <div class="dash-ng-header">
        <span class="dash-ng-title">${nextUnplayed.isRivalry?' Rivalry week, ':''}Week ${nextUnplayed.wk} · ${nextUnplayed.date||''}</span>
        ${favStr}
      </div>
      ${(()=>{const w=gdWxFor('reg',{idx:G.sched.indexOf(nextUnplayed),opp:no});return w?`<div class="dash-ng-wx" title="${wxEffects(w)}">${wxIcon(w,16)}<span><b>Forecast:</b> ${wxLine(w)}</span></div>`:'';})()}
      <div class="dash-ng-body">
        <div class="dash-vs-block">
          <div style="display:flex;align-items:center;gap:8px">${sLogo(ms,49)}<div>
            <div style="font-family:var(--hd);font-size:16px;font-weight:800">${ms.mascot}</div>
            <div style="font-size:10px;color:var(--mu)">${rb(myOvr)}</div>
          </div></div>
          <div class="dash-vs-sep">VS</div>
          <div style="display:flex;align-items:center;gap:8px">${sLogo(no,49)}<div>
            <div style="font-family:var(--hd);font-size:16px;font-weight:800">${no.name} ${no.mascot}</div>
            <div style="font-size:10px;color:var(--mu)">${no.city} · ${no.wins}-${no.losses} · ${rb(oppOvr)}</div>
          </div></div>
        </div>
        <div style="display:flex;gap:8px;flex-shrink:0">
          <button class="bgh bsm" onclick="viewSchool(${no.id})">View</button>
          ${pracAvailable()?`<button class="bgh bsm" onclick="pracOpen()">Practice</button>`:`<span style="font-size:11px;color:var(--mu);align-self:center">Practiced</span>`}
          <button class="btn${nextUnplayed.isRivalry?' bgd':''}" style="padding:7px 16px" onclick="advWk()">${nextUnplayed.isRivalry?' Play Rivalry':'Play Game'}</button>
        </div>
      </div>
    </div>`;
  } else if(playoffOpp&&G.phase==='playoffs'){
    const prn=poRoundName(playoffSlot.playoffRound)||playoffSlot.label;
    nextGameBlock=`<div class="dash-next-game playoff-game">
      <div class="dash-ng-header">
        <span class="dash-ng-title"> ${prn}</span>
        <span style="font-size:11px;color:var(--gd);font-weight:700">State Playoffs</span>
      </div>
      ${(()=>{const w=gdWxFor('po',{slot:playoffSlot,opp:playoffOpp});return w?`<div class="dash-ng-wx" title="${wxEffects(w)}">${wxIcon(w,16)}<span><b>Forecast:</b> ${wxLine(w)}</span></div>`:'';})()}
      <div class="dash-ng-body">
        <div class="dash-vs-block">
          <div style="display:flex;align-items:center;gap:8px">${sLogo(ms,49)}<div>
            <div style="font-family:var(--hd);font-size:16px;font-weight:800">${ms.mascot}</div>
            <div style="font-size:10px;color:var(--mu)">${rb(Math.round((G.offR+G.defR)/2))}</div>
          </div></div>
          <div class="dash-vs-sep">VS</div>
          <div style="display:flex;align-items:center;gap:8px">${sLogo(playoffOpp,49)}<div>
            <div style="font-family:var(--hd);font-size:16px;font-weight:800">${playoffOpp.name} ${playoffOpp.mascot}</div>
            <div style="font-size:10px;color:var(--mu)">${rb(teamOvr(playoffOpp.id))} · Win to advance!</div>
          </div></div>
        </div>
        <button class="btn bgd" style="padding:7px 16px;flex-shrink:0" onclick="advPlayoffWeek()"> Play</button>
      </div>
    </div>`;
  }

  // Recent news preview (last 3 news items)
  const newsItems=buildNewsItems();
  const recentNews=newsItems.slice(0,3);
  const newsPreview=recentNews.length?recentNews.map(n=>`<div class="news-item ${n.cls}" style="margin-bottom:0">
    <div class="news-hd">
      <span class="news-icon">${n.icon}</span>
      <div class="news-body">
        <div class="news-headline">${n.headline}</div>
        <div class="news-sub">${n.sub}</div>
      </div>
      <span class="news-time">${n.time}</span>
    </div>
  </div>`).join(''):`<div style="color:var(--mu);font-size:12px;padding:8px 0">No news yet: play some games!</div>`;

  if(gdsMain().cnav!==false)try{return dashTiles({ms,pl,nextUnplayed,no,playoffSlot,playoffOpp,actionBtn,curYear,phaseLabel,newsItems});}catch(e){console.error('dash tiles',e);}
  return`
  <div class="dash-hero">
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:14px">
      ${sLogo(ms,52)}
      <div style="flex:1">
        <div class="dash-hero-name"><span style="color:var(--te)">${ms.name}</span> ${ms.mascot}</div>
        <div class="dash-hero-meta">
          <span class="dash-hero-badge">${curYear}</span>
          <span class="dash-hero-badge">${clsL(G.cls)}</span>
          <span class="dash-hero-badge">${G.offS} / ${G.defS}</span>
          <span class="dash-hero-badge">${presStars} Prestige</span>
          <span class="dash-hero-badge" style="color:var(--gn)">$${(G.budget/1000).toFixed(0)}k</span>
        </div>
      </div>
      ${coachCard()}
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
        <div style="font-family:var(--hd);font-size:13px;color:var(--mu);">${phaseLabel}</div>
        ${actionBtn}
      </div>
    </div>
  </div>

  <div class="dash-stat-row">
    <div class="dash-stat"><div class="dash-stat-v">${G.wins}-${G.losses}</div><div class="dash-stat-l">Record</div></div>
    <div class="dash-stat"><div class="dash-stat-v">${G.offR}</div><div class="dash-stat-l">Offense</div></div>
    <div class="dash-stat"><div class="dash-stat-v">${G.defR}</div><div class="dash-stat-l">Defense</div></div>
    <div class="dash-stat"><div class="dash-stat-v">${pl.length}</div><div class="dash-stat-l">Roster</div></div>
    <div class="dash-stat"><div class="dash-stat-v" style="font-size:16px">$${(G.budget/1000).toFixed(0)}k</div><div class="dash-stat-l">Budget</div></div>
    <div class="dash-stat" style="cursor:pointer" onclick="nav('depth')" title="Team → Depth Chart → Program"><div class="dash-stat-v">${moraleOf()}</div><div class="dash-stat-l">Morale · ${moraleLbl(moraleOf())}</div></div>
    <div class="dash-stat" style="cursor:pointer" onclick="nav('depth')" title="Team → Depth Chart → Program"><div class="dash-stat-v">${Math.round(chemAvg())}</div><div class="dash-stat-l">QB chemistry</div></div>
  </div>

  ${nextGameBlock}

  ${cnavHub()}

  <div class="g2" style="align-items:start">
    <div>
      <div class="pnl">
        <div class="ph">Game Log</div>
        <div class="pb">
          <div style="background:var(--s2);border:1px solid var(--bd);border-radius:4px;padding:10px 12px;max-height:200px;overflow-y:auto;font-size:12px;line-height:1.9">
            ${G.log.slice(0,30).map(l=>`<div style="border-bottom:1px solid rgba(255,255,255,.04);padding:1px 0">${l}</div>`).join('')||'<span style="color:var(--mu)">No games yet.</span>'}
          </div>
        </div>
      </div>
      <div class="pnl">
        <div class="ph">Top Players <span style="font-size:12px;font-weight:400;color:var(--mu)">${pl.length} on roster</span></div>
        <table><thead><tr><th>#</th><th>Name</th><th>Pos</th><th>Yr</th><th>Rat</th><th>★</th><th>Dev</th><th>SP</th></tr></thead>
        <tbody>${pl.sort((a,b)=>b.rat-a.rat).slice(0,10).map(p=>`<tr class="cl" onclick="showPlayer(${p.id})">
          <td style="color:var(--mu)">${p.num}</td><td><div style="display:flex;align-items:center;gap:5px">${face(p.fs,24)}<span>${p.fn} ${p.ln}</span></div></td>
          <td><span class="pb2">${p.pos}</span></td><td>${yrL(p.yr)}</td>
          <td>${rb(p.rat)}</td><td>${stars(p.stars)}</td><td>${devB(p.dev)}</td>
          <td style="color:var(--te);font-weight:700">${p.sp||0}</td>
        </tr>`).join('')}</tbody></table>
      </div>
    </div>
    <div class="pnl">
      <div class="ph"> Latest News <button class="bgh bsm" style="font-size:10px" onclick="nav('news')">View All</button></div>
      <div class="pb">
        <div class="news-feed">${newsPreview}</div>
      </div>
    </div>
  </div>`;
}

