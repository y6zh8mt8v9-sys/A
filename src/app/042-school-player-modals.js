// ═══════════ SCHOOL / PLAYER MODALS ═══════════
function viewSchool(id){
  const s=getS(id);if(!s)return;_moNext=()=>viewSchool(id);
  const pl=sPlayers(id).sort((a,b)=>b.rat-a.rat);const div=divOf(id);const w=s.wins,l=s.losses;
  openMo(`<div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
    ${sLogo(s,60)}<div>
      <h2 style="margin-bottom:3px">${s.name} ${s.mascot}</h2>
      <div style="color:var(--mu);font-size:13px">${s.city} • ${clsName(s.cls||G.cls)} • ${div?.name||'?'}</div>
      <div style="margin-top:6px;display:flex;gap:8px;align-items:center">
        <span style="font-family:var(--hd);font-size:18px;font-weight:800;white-space:nowrap;color:${w>=l?'var(--gn)':'var(--te)'}">${w}-${l}</span>
        ${rb(teamOvr(id))}<span class="sbh">${s.offS}/${s.defS}</span>
        <span style="color:var(--mu);font-size:12px">${s.lite?`${pl.length} tracked prospect${pl.length===1?'':'s'}`:`${pl.length} players`}</span>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px"><button class="bgh bsm" onclick="clo();nav('roster',${id})">${pcAuto()?'Full roster':'Full roster / edit players'}</button>${pcAuto()?'':`<button class="bgh bsm" onclick="clo();openEditSch(${id})">Edit team</button>`}${id!==G.myId&&!s.intl&&!s.lite&&!pcAuto()?`<button class="bgh bsm" onclick="coachTakeOver(${id})">Coach this team…</button>`:''}</div>
    </div>
  </div>
  ${s.lite?`<div style="font-size:12px;color:var(--mu);margin:-6px 0 10px;padding:8px 10px;border:1px solid var(--bd);border-radius:6px">${stName(clsSt(s.cls))} is a light state: the school plays its full season and state playoffs, and the game follows its top prospects. Team strength ${s.str||50}.</div>`:''}
  <div class="tabs"><button class="tab on" onclick="swMTab(this,'sv-o')">Overview</button>
    <button class="tab" onclick="swMTab(this,'sv-r')">${s.lite?'Prospects':'Roster'}</button>
    <button class="tab" onclick="swMTab(this,'sv-s')" id="sv-s-btn">Stats</button>
    <button class="tab" onclick="swMTab(this,'sv-g')">Schedule</button>
  </div>
  <div id="sv-o"><div class="g2">
    <div><div style="font-weight:700;font-size:12px;color:var(--te);margin-bottom:8px">POS RATINGS</div>
      ${POS.map(pos=>{const best=pl.find(p=>p.pos===pos);return`<div class="dr"><span class="a">${pos}</span><span>${best?rb(best.rat):'–'}</span></div>`;}).join('')}
    </div>
    <div><div style="font-weight:700;font-size:12px;color:var(--te);margin-bottom:8px">TOP PLAYERS</div>
      ${pl.slice(0,10).map(p=>`<div class="dr cl" onclick="showPlayer(${p.id})"><span class="a"><span class="pb2">${p.pos}</span> ${p.fn} ${p.ln} ${yrL(p.yr)}</span><span>${rb(p.rat)}</span></div>`).join('')}
    </div>
  </div></div>
  <div id="sv-r" class="hid" style="overflow-x:auto"><table><thead><tr><th>#</th><th>Name</th><th>Pos</th><th>Yr</th><th>Rat</th><th>Dev</th><th>Stars</th><th>GPA</th><th>Traits</th></tr></thead>
  <tbody>${pl.map(p=>`<tr class="cl" onclick="showPlayer(${p.id})">
    <td style="color:var(--mu)">${p.num}</td><td>${p.fn} ${p.ln}</td>
    <td><span class="pb2">${p.pos}</span></td><td>${yrL(p.yr)}</td>
    <td>${rb(p.rat)}</td><td>${devB(p.dev)}</td><td>${stars(p.stars)}</td>
    <td>${gpaL(p.gpa)}</td><td>${(p.traits||[]).map(t=>trB(t)).join('')}</td>
  </tr>`).join('')}</tbody></table></div>
  <div id="sv-g" class="hid">${lgTeamSchedHtml(s)}</div>
  <div id="sv-s" class="hid">
    <div class="tabs" style="margin-bottom:10px">
      <button class="tab on" onclick="swMTab(this,'sv-ss')">Season</button>
      <button class="tab" onclick="swMTab(this,'sv-sc')">Career</button>
    </div>
    <div id="sv-ss" style="overflow-x:auto"><table><thead><tr><th>Name</th><th>Pos</th><th>GP</th><th>Pass Yds</th><th>Pass TD</th><th>Rush Yds</th><th>Rush TD</th><th>Rec Yds</th><th>Rec TD</th><th>Cmp%</th><th>YPC</th><th>YPR</th><th>KR Yds</th><th>Tkl</th><th>Sacks</th><th>INTs</th><th>PBU</th><th>Pancakes</th></tr></thead>
    <tbody>${pl.filter(p=>(p.seasStats?.gp||0)>0).map(p=>`<tr class="cl" onclick="showPlayer(${p.id})">
      <td>${p.fn} ${p.ln}</td><td><span class="pb2">${p.pos}</span></td>
      <td>${p.seasStats.gp}</td><td>${p.seasStats.passYds||0}</td><td>${p.seasStats.passTD||0}</td>
      <td>${p.seasStats.rushYds||0}</td><td>${p.seasStats.rushTD||0}</td>
      <td>${p.seasStats.recYds||0}</td><td>${p.seasStats.recTD||0}</td>
      <td>${fmtPct(stEff(p.seasStats).cmp)}</td><td>${fmtAvg(stEff(p.seasStats).ypc)}</td><td>${fmtAvg(stEff(p.seasStats).ypr)}</td><td>${p.seasStats.krYds||0}</td>
      <td>${p.seasStats.tackles||0}</td><td>${p.seasStats.sacks||0}</td><td>${p.seasStats.ints||0}</td><td>${p.seasStats.pbu||0}</td><td>${p.seasStats.pancakes||0}</td>
    </tr>`).join('')||'<tr><td colspan="18" style="color:var(--mu);text-align:center;padding:14px">No season stats yet</td></tr>'}</tbody></table></div>
    <div id="sv-sc" class="hid" style="overflow-x:auto"><table><thead><tr><th>Name</th><th>Pos</th><th>GP</th><th>Pass Yds</th><th>Pass TD</th><th>Rush Yds</th><th>Rush TD</th><th>Rec Yds</th><th>Rec TD</th><th>Cmp%</th><th>YPC</th><th>YPR</th><th>KR Yds</th><th>Tkl</th><th>Sacks</th><th>INTs</th><th>PBU</th><th>Pancakes</th></tr></thead>
    <tbody>${pl.filter(p=>(p.carStats?.gp||0)>0).map(p=>`<tr class="cl" onclick="showPlayer(${p.id})">
      <td>${p.fn} ${p.ln}</td><td><span class="pb2">${p.pos}</span></td>
      <td>${p.carStats.gp}</td><td>${p.carStats.passYds||0}</td><td>${p.carStats.passTD||0}</td>
      <td>${p.carStats.rushYds||0}</td><td>${p.carStats.rushTD||0}</td>
      <td>${p.carStats.recYds||0}</td><td>${p.carStats.recTD||0}</td>
      <td>${fmtPct(stEff(p.carStats).cmp)}</td><td>${fmtAvg(stEff(p.carStats).ypc)}</td><td>${fmtAvg(stEff(p.carStats).ypr)}</td><td>${p.carStats.krYds||0}</td>
      <td>${p.carStats.tackles||0}</td><td>${p.carStats.sacks||0}</td><td>${p.carStats.ints||0}</td><td>${p.carStats.pbu||0}</td><td>${p.carStats.pancakes||0}</td>
    </tr>`).join('')||'<tr><td colspan="18" style="color:var(--mu);text-align:center;padding:14px">No career stats yet</td></tr>'}</tbody></table></div>
  </div>`);
}
function swMTab(btn,id){document.getElementById('mb').querySelectorAll('div[id^="sv-"],div[id^="pv-"]').forEach(el=>el.classList.add('hid'));const el=document.getElementById(id);if(el)el.classList.remove('hid');document.getElementById('mb').querySelectorAll('.tab').forEach(b=>b.classList.remove('on'));btn.classList.add('on');}

// v2.14 player pages: a per-game log for this season and a season-by-season career table
function statLine(p,s){
  s=s||{};const b=[];
  if(s.passAtt)b.push(`${s.passCmp||0}/${s.passAtt} ${s.passYds||0} yds ${s.passTD||0} TD${s.passInt?' '+s.passInt+' INT':''}`);
  if(s.rushAtt||s.rushYds)b.push(`${s.rushAtt||0} car ${s.rushYds||0} yds${s.rushTD?' '+s.rushTD+' TD':''}`);
  if(s.rec||s.recYds)b.push(`${s.rec||0} rec ${s.recYds||0} yds${s.yac?' ('+s.yac+' YAC)':''}${s.recTD?' '+s.recTD+' TD':''}`);
  if(s.krRet)b.push(`KR ${s.krRet}-${s.krYds||0}${s.krTD?' TD':''}`);if(s.prRet)b.push(`PR ${s.prRet}-${s.prYds||0}${s.prTD?' TD':''}`);
  if(s.tackles||s.sacks||s.ints||s.tfl)b.push(`${s.tackles||0} tkl${s.tfl?' '+s.tfl+' TFL':''}${s.sacks?' '+s.sacks+' sk':''}${s.ints?' '+s.ints+' INT':''}${s.pbu?' '+s.pbu+' PBU':''}${s.safeties?' '+s.safeties+' SAF':''}`);
  if(s.pancakes||s.sacksA)b.push(`${s.pancakes||0} pancakes${s.sacksA?' '+s.sacksA+' sacks allowed':''}`);
  if(s.fga||s.xpa)b.push(`FG ${s.fgm||0}/${s.fga||0} XP ${s.xpm||0}/${s.xpa||0}`);
  return b.join(' · ')||'<span style="color:var(--mu)">played, no stats</span>';
}
function gameLogHtml(p){
  const L=(p.gameLog||[]).slice().reverse();
  if(!L.length)return`<div style="color:var(--mu);font-size:13px;padding:10px 2px">No games logged this season yet. Every game he plays (or you simulate) shows up here.</div>`;
  return`<div style="font-size:11px;color:var(--mu);margin-bottom:6px">This season, most recent first</div><div style="overflow-x:auto"><table style="width:100%;font-size:12px"><thead><tr><th style="text-align:left">Wk</th><th style="text-align:left">Opp</th><th style="text-align:left">Result</th><th style="text-align:left">Line</th></tr></thead><tbody>${L.map(g=>`<tr><td style="text-align:left">${g.k==='po'?'PO ':''}${g.w}</td><td style="text-align:left">${g.o}</td><td style="text-align:left;color:${/^W/.test(g.r)?'var(--gn)':/^L/.test(g.r)?'var(--rd)':'var(--mu)'}">${g.r}</td><td style="text-align:left">${statLine(p,g.s)}</td></tr>`).join('')}</tbody></table></div>`;
}
function careerHtml(p){
  const rows=(p.seasons||[]).slice();
  if(p.seasStats&&p.seasStats.gp>0&&G&&G.players.includes(p))rows.push({y:(G.baseYear||2026)+(G.yr-1),g:p.yr,t:schAbbr(getS(p.sId)),jv:p.onJV?1:0,r:p.rat,s:p.seasStats,cur:1});
  const gl=g=>({9:'FR',10:'SO',11:'JR',12:'SR'}[g]||'');
  const tbl=rows.length?`<div style="overflow-x:auto"><table style="width:100%;font-size:12px"><thead><tr><th style="text-align:left">Season</th><th>Yr</th><th>Team</th><th>OVR</th><th>GP</th><th style="text-align:left">Stats</th></tr></thead><tbody>${rows.map(r=>`<tr><td style="text-align:left">${r.y}${r.cur?' <span style="color:var(--te);font-size:10px">now</span>':''}</td><td>${gl(r.g)}</td><td>${r.t}${r.jv?' JV':''}</td><td>${r.r||''}</td><td>${(r.s&&r.s.gp)||0}</td><td style="text-align:left">${statLine(p,r.s)}</td></tr>`).join('')}</tbody></table></div>`
    :`<div style="color:var(--mu);font-size:13px;padding:6px 2px">No completed seasons yet.</div>`;
  const tot=p.carStats&&p.carStats.gp?`<div style="margin-top:8px;font-size:12px"><b>Career (${p.carStats.gp} games):</b> ${statLine(p,p.carStats)}</div>`:'';
  const awards=(p.awards||[]).length?`<div style="margin-top:8px;font-size:12px"><b>Awards:</b> ${p.awards.map(a=>`${a.type} '${String(2026+(a.yr-1)).slice(2)}`).join(', ')}</div>`:'';
  const after=p.committed?`<div style="margin-top:8px;font-size:12px"><b>College:</b> ${p.committed.school} (${p.committed.lvl})</div>`:'';
  return`<div style="font-size:11px;color:var(--mu);margin-bottom:6px">Season by season</div>${tbl}${tot}${awards}${after}`;
}
function showPlayer(id){
  // Search active players first, then graduated archives
  let p=getP(id);
  if(!p)p=(G.wlArchive||[]).find(x=>x.id===id);
  if(!p)p=(G.hofArchive||[]).find(x=>x.id===id);
  if(!p)return;_moNext=()=>showPlayer(id);
  const isGraduated=!G.players.find(x=>x.id===id);
  const sch=getS(p.sId)||{name:'Alumni',id:p.sId,c1:'#333',c2:'#fff',mascot:'Alumni',abbr:'AL'};
  const isMe=p.sId===G.myId,ctl=isMe&&!pcAuto(),own=p.id===G.myPlayerId; // ctl: coach controls (none in Player Career)
  const isSpecialPos=(p.pos==='OL'||p.pos==='K');
  const streakBadge=p.streak==='hot'?`<span style="background:#7f2d00;color:#ff9966;border-radius:3px;padding:1px 6px;font-size:11px;font-weight:700">Hot Streak (${p.streakGamesLeft}g left)</span>`:p.streak==='cold'?`<span style="background:#0a2a3a;color:#4fc3f7;border-radius:3px;padding:1px 6px;font-size:11px;font-weight:700">Cold Streak (${p.streakGamesLeft}g left)</span>`:'';
  const archBadge=p.arch?`<span style="background:#0a2a10;border:1px solid #1a6030;color:#44dd88;border-radius:3px;padding:1px 7px;font-size:11px;font-weight:700">${p.arch}</span>`:'';
  const krL=s=>[...((s.krRet||0)>0?[['Kick Ret',`${s.krRet} · ${s.krYds||0} yds`],['KR Avg',fmtAvg(stEff(s).kr)],['KR TD',s.krTD||0]]:[]),...((s.prRet||0)>0?[['Punt Ret',`${s.prRet} · ${s.prYds||0} yds`],['PR Avg',fmtAvg((s.prYds||0)/s.prRet)],['PR TD',s.prTD||0]]:[])];
  const yacL=s=>(s.rec||0)>0?[['YAC',`${s.yac||0} (${fmtAvg((s.yac||0)/s.rec)} / catch)`]]:[];
  const dxL=s=>[['TFL',s.tfl||0],...((s.safeties||0)>0?[['Safeties',s.safeties]]:[])];
  const sH=()=>{const s=p.seasStats,e=stEff(s);
    if(p.pos==='QB')return[['Cmp / Att',`${s.passCmp||0} / ${s.passAtt||0}`],['Cmp %',fmtPct(e.cmp)],['Pass Yds',s.passYds||0],['Pass TD',s.passTD||0],['INT',s.passInt||0],['Rush Yds',s.rushYds||0],['Yds / Carry',fmtAvg(e.ypc)],['Rush TD',s.rushTD||0]];
    if(p.pos==='RB')return[['Carries',s.rushAtt||0],['Rush Yds',s.rushYds||0],['Yds / Carry',fmtAvg(e.ypc)],['Rush TD',s.rushTD||0],['Catches',s.rec||0],['Rec Yds',s.recYds||0],['Yds / Catch',fmtAvg(e.ypr)],...yacL(s),['Rec TD',s.recTD||0],['Drops',s.drops||0],...krL(s)];
    if(['WR','TE'].includes(p.pos))return[['Catches',s.rec||0],['Rec Yds',s.recYds||0],['Yds / Catch',fmtAvg(e.ypr)],...yacL(s),['Rec TD',s.recTD||0],['Drops',s.drops||0],['Drop %',fmtPct(e.drop)],...krL(s)];
    if(['CB','S'].includes(p.pos))return[['Tackles',s.tackles||0],...dxL(s),['INTs',s.ints||0],['PBU',s.pbu||0],['Targets / Allowed',`${s.tgtA||0} · ${s.ydsA||0} yds`],['Yds Allowed / G',fmtAvg(e.ypgA)],...krL(s)];
    if(['LB','DL'].includes(p.pos))return[['Tackles',s.tackles||0],...dxL(s),['Sacks',s.sacks||0],['INTs',s.ints||0],...(p.pos==='LB'?[['PBU',s.pbu||0]]:[]),...krL(s)];
    if(p.pos==='OL')return[['Pancakes',s.pancakes||0],['Pancakes / G',fmtAvg(e.pkG)],['Sacks Allowed',s.sacksA||0],['Str',p.str],['Rating',p.rat],['Stars',p.stars]];
    if(p.pos==='K')return[['Awr',p.awr],['Rating',p.rat],['Stars',p.stars]];
    return[];};
  const cH=()=>{const s=p.carStats,e=stEff(s);
    if(p.pos==='QB')return[['Cmp %',fmtPct(e.cmp)],['Pass Yds',s.passYds||0],['Pass TD',s.passTD||0],['Rush Yds',s.rushYds||0],['Rush TD',s.rushTD||0]];
    if(p.pos==='RB')return[['Rush Yds',s.rushYds||0],['Yds / Carry',fmtAvg(e.ypc)],['Rush TD',s.rushTD||0],['Rec Yds',s.recYds||0],['Rec TD',s.recTD||0],...krL(s)];
    if(['WR','TE'].includes(p.pos))return[['Rec Yds',s.recYds||0],['Yds / Catch',fmtAvg(e.ypr)],['Rec TD',s.recTD||0],['Drop %',fmtPct(e.drop)],...krL(s)];
    if(p.pos==='CB'||p.pos==='S')return[['Tackles',s.tackles||0],['TFL',s.tfl||0],['INTs',s.ints||0],['PBU',s.pbu||0],['Yds Allowed / G',fmtAvg(e.ypgA)]];
    if(p.pos==='OL')return[['Pancakes',s.pancakes||0],['Sacks Allowed',s.sacksA||0],['Rating',p.rat],['Potential',p.pot]];
    if(p.pos==='K')return[['Rating',p.rat],['Potential',p.pot]];
    return[['Tackles',s.tackles||0],['TFL',s.tfl||0],['Sacks',s.sacks||0]];};
  const rows=r=>r.map(([k,v])=>`<div class="dr"><span class="a">${k}</span><span style="font-weight:700">${v}</span></div>`).join('');

  const thr=getStarThreshold(p.dev,p.pos,p.yr);
  const combined=Math.round(recScore(p));
  const starCap=getStarCap(p);
  // Only show star thresholds up to the cap for this position
  const starThrRow=Object.entries(thr).filter(([s])=>parseInt(s)<=starCap).map(([s,v])=>`<span style="font-size:10px;color:${combined>=v?'var(--gd)':'var(--mu)'}">${'★'.repeat(parseInt(s))} ≥${v}</span>`).join(' ');
  // Scheme fit info
  const myOffS=G.offS,myDefS=G.defS;
  const archFits=p.arch&&ARCH_SCHEME[p.arch]?(ARCH_SCHEME[p.arch].includes(myOffS)||ARCH_SCHEME[p.arch].includes(myDefS)):null;
  const schemeFitBadge=p.arch&&isMe?(archFits?`<span style="font-size:10px;color:var(--gn)">✓ Fits ${myOffS}/${myDefS}</span>`:`<span style="font-size:10px;color:var(--mu)">Not ideal for ${myOffS}/${myDefS}</span>`):'';

  openMo(`<div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
    <div>${face(p.fs,64)}</div>
    <div style="flex:1">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <div style="display:flex;align-items:center;gap:6px">${sLogo(sch,32)} <span style="font-size:12px;color:var(--mu)">${sch.name}</span></div>
        <button class="wbtn" onclick="togWl(${p.id})">${p.wl?'★':'☆'}</button>
        ${isMe?`<button class="hbtn" onclick="togHof(${p.id})" title="Hall of Fame">HoF</button>`:''}
      </div>
      <h2 style="margin-bottom:4px">#${p.num} ${p.fn} ${p.ln}${p.mine?' <span style="font-size:11px;background:var(--gd);color:#111;border-radius:8px;padding:2px 8px;font-weight:900;vertical-align:middle">MY PLAYER</span>':''}${isGraduated?' <span style="font-size:12px;color:var(--gd);font-weight:400">Alumni</span>':''}</h2>
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
        <span class="pb2" style="font-size:12px">${p.pos}</span>${yrL(p.yr)} ${rb(p.rat)} ${stars(p.stars)} ${devBClickable(p)}
        ${archBadge} ${schemeFitBadge} ${streakBadge}
        ${p.pos==='K'?'<span style="font-size:10px;color:var(--gd)">★ max 3</span>':''}
        ${p.pos==='OL'?'<span style="font-size:10px;color:var(--mu)">harder ★ gain</span>':''}
        ${injBadgePopup(p)}
        ${p.committed?`<span style="color:var(--gn);font-size:11px">${p.committed.school} (${p.committed.lvl})</span>`:''}
        ${(p.awards||[]).map(a=>a.type==='Mr. Football'?`<span style="background:#3a2800;border:1px solid var(--gd);color:var(--gd);border-radius:3px;padding:1px 6px;font-size:10px;font-weight:700">${a.type}, ${clsL(a.cls)} '${String(2026+(a.yr-1)).slice(2)}</span>`:`<span style="background:#111a26;border:1px solid var(--b2);color:var(--te);border-radius:3px;padding:1px 6px;font-size:10px;font-weight:700">★ ${a.type}, ${clsL(a.cls)} '${String(2026+(a.yr-1)).slice(2)}</span>`).join(' ')}
      </div>
    </div>
  </div>
  <div class="tabs">
    <button class="tab on" onclick="swMTab(this,'pv-b')">Bio</button>
    <button class="tab" onclick="swMTab(this,'pv-s')">Stats</button>
    <button class="tab" onclick="swMTab(this,'pv-gl')">Game Log</button>
    <button class="tab" onclick="swMTab(this,'pv-cr')">Career</button>
    <button class="tab" onclick="swMTab(this,'pv-o')">Offers (${p.offers.length})</button>
    ${ctl&&(p.sp||0)>0?`<button class="tab" onclick="swMTab(this,'pv-sp')">Skill Points (${p.sp})</button>`:''}
    ${isGraduated?`<button class="tab" onclick="swMTab(this,'pv-st')">Story</button>`:''}
  </div>
  <div id="pv-b"><div class="g2">
    <div>
      <div style="font-weight:700;font-size:12px;color:var(--te);margin-bottom:6px">Physical</div>
      <div class="dr"><span class="a">Height</span><span>${htf(p.ht)}</span></div>
      <div class="dr"><span class="a">Weight</span><span>${p.wt} lbs</span></div>
      ${(ovrSync(p),'')}<div style="margin-top:6px">${attrPanel(p,false)}</div><div style="font-size:10px;color:var(--mu)">● counts toward his ${p.pos} overall</div>
      <div style="margin-top:8px;font-size:11px;color:var(--mu)">Dev ${p.rat} / <span style="color:var(--gn)">${p.potLo||p.pot}</span>–<span style="color:var(--pot,#f0b429)">${p.potHi||p.pot}</span> pot
        <div class="prw" style="margin-top:3px"><div class="prf" style="width:${(p.rat/effPot(p)*100).toFixed(0)}%"></div></div>
      </div>
      <div style="margin-top:10px">
        <div style="font-weight:700;font-size:12px;color:var(--te);margin-bottom:4px">Interests</div>
        <div>${interestBadges(p.interests)}</div>
      </div>
      ${p.dreamSchool?`<div style="margin-top:10px">
        <div style="font-weight:700;font-size:12px;color:var(--gd);margin-bottom:4px">★ DREAM SCHOOL</div>
        <div style="background:#1a1200;border:1px solid var(--gd);border-radius:5px;padding:6px 10px;font-family:var(--hd);font-size:14px;font-weight:800;color:var(--gd)">${p.dreamSchool.school} <span style="font-size:11px;color:var(--mu);font-weight:400">${p.dreamSchool.lvl}</span></div>
        ${p.committed&&p.committed.school===p.dreamSchool.school?'<div style="font-size:10px;color:var(--gn);margin-top:3px">★ Dream fulfilled!</div>':'<div style="font-size:10px;color:var(--mu);margin-top:3px">If they offer, he commits instantly.</div>'}
      </div>`:''}
    </div>
    <div>
      <div style="font-weight:700;font-size:12px;color:var(--te);margin-bottom:6px">PROFILE</div>
      <div class="dr"><span class="a">Archetype</span><span>${p.arch?`<span style="background:#0a2a10;border:1px solid #1a6030;color:#44dd88;border-radius:3px;padding:1px 6px;font-size:11px;font-weight:700">${p.arch}</span>`:'–'}</span></div>
      ${p.streak?`<div class="dr"><span class="a">Streak</span><span>${p.streak==='hot'?`Hot (${p.streakGamesLeft}g)`:`Cold (${p.streakGamesLeft}g)`}</span></div>`:''}
      <div class="dr"><span class="a">GPA</span><span>${gpaL(p.gpa)}</span></div>
      <div class="dr"><span class="a">Dev Trait</span><span>${devBClickable(p)}</span></div>
      <div class="dr"><span class="a">Skill Points</span><span style="color:var(--te);font-weight:700">${p.sp||0}</span></div>
      <div class="dr"><span class="a">Camp</span><span>${p.camp?'<span style="color:var(--gn)">✓ Attended</span>':'No'}</span></div>
      ${isSpecialPos?`<div class="dr"><span class="a" style="color:var(--gd)">${p.pos} Score</span><span style="font-weight:700;color:var(--gd)">${calcSS(p).toFixed(1)}</span></div>`:''}
      <div style="margin-top:8px"><div style="font-size:11px;color:var(--mu);margin-bottom:4px">TRAITS</div>
        ${(p.traits||[]).map(t=>trB(t)).join('')||'<span style="color:var(--mu)">None</span>'}
        ${TRAITS.filter(t=>(p.traits||[]).includes(t.k)).map(t=>`<div style="font-size:11px;color:var(--mu);margin-top:3px">• <strong>${t.l}:</strong> ${t.d}</div>`).join('')}
      </div>
      <div style="margin-top:10px">
        <div style="font-size:11px;color:var(--mu);margin-bottom:4px">STAR THRESHOLDS (${p.dev})${p.pos==='K'?'max ★★★':p.pos==='OL'?'harder to earn':''}</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px">${starThrRow}</div>
        <div style="font-size:10px;color:var(--mu);margin-top:3px">Score: ${combined.toFixed(1)}</div>
      </div>
    </div>
  </div></div>
  <div id="pv-st" class="hid">${renderStoryCard(p,false)}</div>
  <div id="pv-gl" class="hid">${gameLogHtml(p)}</div>
  <div id="pv-cr" class="hid">${careerHtml(p)}</div>
  <div id="pv-s" class="hid"><div class="g2">
    <div><div style="font-weight:700;font-size:12px;color:var(--te);margin-bottom:6px">This season${isSpecialPos?' (Rating-Based)':''}</div>${rows(sH())}<div class="dr"><span class="a">Games</span><span>${p.seasStats.gp||0}</span></div></div>
    <div><div style="font-weight:700;font-size:12px;color:var(--te);margin-bottom:6px">Career</div>${rows(cH())}<div class="dr"><span class="a">Career Games</span><span>${p.carStats.gp||0}</span></div></div>
  </div></div>
  <div id="pv-o" class="hid">
    <div style="font-size:12px;color:var(--mu);margin-bottom:8px">Rat: ${rb(p.rat)} | Stars: ${stars(p.stars)} | GPA: ${gpaL(p.gpa)} | Dev: ${devB(p.dev)}${isSpecialPos?' <span style="color:var(--te)">'+p.pos+': Stars based on rating & traits</span>':p.seasStats.gp===0?' <span style="color:var(--gd)">Must play games to earn stars!</span>':''}</div>
    ${p.dreamSchool?`<div style="background:#1a1200;border:1px solid var(--gd);border-radius:6px;padding:8px 12px;margin-bottom:10px;display:flex;align-items:center;gap:10px">
      <span style="font-size:18px">★</span>
      <div>
        <div style="font-family:var(--hd);font-size:13px;font-weight:800;color:var(--gd)">DREAM SCHOOL: ${p.dreamSchool.school} (${p.dreamSchool.lvl})</div>
        <div style="font-size:10px;color:var(--mu)">${p.committed&&p.committed.school===p.dreamSchool.school?'★ Dream fulfilled, committed!':'If they offer, he commits instantly.'}</div>
      </div>
    </div>`:''}
    ${p.committed?`<div style="padding:8px;background:rgba(34,184,112,.1);border:1px solid rgba(34,184,112,.3);border-radius:4px;margin-bottom:10px;font-size:13px">Committed to ${p.committed.school} (${p.committed.lvl})${p.dreamSchool&&p.committed.school===p.dreamSchool.school?' ★ Dream School!':''}</div>`:''}
    ${(ctl||(isMe&&own))&&!p.committed&&p.offers.length?`<div style="margin-bottom:10px">
      <select id="csel" style="background:var(--s2);border:1px solid var(--bd);color:var(--tx);padding:5px 8px;border-radius:4px;font-size:12px;margin-right:8px">
        ${p.offers.map(o=>`<option value='${JSON.stringify(o)}'>${o.lvl}: ${o.school}${(()=>{const c=COL_BY[o.school+'|'+o.lvl];return c&&!colRoom(c,p,false)?' (spots filled)':'';})()}${p.dreamSchool&&o.school===p.dreamSchool.school?' ★':''}</option>`).join('')}
      </select>
      <button class="btn bsm bgn" onclick="commitNow(${p.id})">Commit Now</button>
    </div>`:''}
    ${isMe&&p.yr>=10?`<div style="font-size:12px;color:var(--mu);margin-bottom:10px">Camps this year: ${campsUsed(p)}/${campCap()}${(p.camps||[]).length?' · '+p.camps.slice(-3).map(c=>`${c.name} (${c.grade}${c.offers?', '+c.offers+' offer'+(c.offers>1?'s':''):''})`).join(' · '):''}${ctl&&(G.campInv||[]).some(v=>v.pid===p.id)?' · <a href="#" onclick="clo();nav(\'recr\');return false" style="color:var(--te)">camp invite waiting</a>':''}</div>`:''}
    <div style="display:flex;flex-wrap:wrap;gap:4px">${p.offers.map(o=>`<span class="ob ${(()=>{const m={FBS:'of',FCS:'oc',D2:'od',NAIA:'on',D3:'ot',JUCO:'oj'};return m[o.lvl]||'od';})()}">${p.dreamSchool&&o.school===p.dreamSchool.school?'★ ':''}${o.lvl==='JUCO'?'JUCO interest':o.lvl}: ${o.school}</span>`).join('')||'<span style="color:var(--mu)">No offers yet.</span>'}</div>
  </div>
  ${ctl&&(p.sp||0)>0?`<div id="pv-sp" class="hid">
    <div style="font-size:12px;color:var(--mu);margin-bottom:10px">You have <strong style="color:var(--te)">${p.sp} skill points</strong>. Spending SP upgrades OVR and automatically boosts attributes.</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
      <div style="background:var(--s2);border:1px solid var(--bd);border-radius:5px;padding:10px;text-align:center;min-width:110px">
        <div style="font-size:12px;font-weight:700;color:var(--te)">Overall</div>
        <div style="font-size:20px;font-weight:900;margin:4px 0">${p.rat}</div>
        <button class="btn bsm" onclick="spndSP(${p.id},'rat',1)">+1 OVR</button>
        ${p.sp>=3?`<button class="btn bsm bbl" onclick="spndSP(${p.id},'rat',3)" style="margin-top:3px">+3 OVR</button>`:''}
      </div>
      <div style="background:var(--s2);border:1px solid var(--bd);border-radius:5px;padding:10px;font-size:11px;color:var(--mu);flex:1;min-width:140px">
        <div style="font-weight:700;color:var(--tx);margin-bottom:5px">▲ Current Attributes</div>
        <div>Speed: <strong style="color:var(--tx)">${p.spd}</strong></div>
        <div>Strength: <strong style="color:var(--tx)">${p.str}</strong></div>
        <div>Awareness: <strong style="color:var(--tx)">${p.awr}</strong></div>
        <div style="margin-top:5px;font-style:italic">Attributes improve automatically when OVR is upgraded.</div>
      </div>
    </div>
    <button class="bgh bsm" onclick="autoSP(${p.id})">Auto-upgrade all SP</button>
  </div>`:''}
  ${own&&pcAuto()?`<div style="margin-top:14px"><button class="bgh bsm" onclick="clo();myGearOpen()">Look and equipment</button></div>`:''}
  ${ctl?`<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">
    <button class="bgh bsm" onclick="clo();editPlayer(${p.id})">Edit Player &amp; Equipment</button><button class="bgh bsm" onclick="capToggle(${p.id});clo();showPlayer(${p.id})">${captains().includes(p.id)?'Remove captain':'Name captain'}</button>${colFlipTarget(p)?`<button class="bgh bsm" onclick="pushFlip(${p.id})">Push him to flip to ${colFlipTarget(p).school}</button>`:''}${p.onJV&&canBeOnJV(p)?`<button class="btn bsm" onclick="talkOpen(${p.id})">Talk about moving up</button>`:''}<span style="font-size:11px;color:var(--mu);align-self:center">Gear: ${eqDesc(eqOf(p))}</span>
  </div>`:''}
  ${!isMe&&!pcAuto()&&!isGraduated&&G.players.includes(p)&&getS(p.sId)&&!getS(p.sId).fp?`<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
    ${plScouted(p)?`<button class="btn bsm" onclick="meetOpen(${p.id})">Set up a meeting (transfer pitch)</button><span style="font-size:11px;color:var(--mu)">Cares most about ${PRIO_TXT[plPriority(p)]} · ${meetLeft()} meeting${meetLeft()===1?'':'s'} left · ${transferWindow()?'transfer window open':'transfers open in the offseason'}</span>`:`<button class="bgh bsm" onclick="clo();scoutPlayer(${p.id})">Scout him (${scoutLeft()} left)</button><span style="font-size:11px;color:var(--mu)">Scout a player to learn what he cares about; you can meet with him the season after.</span>`}
  </div>`:''}`);}
