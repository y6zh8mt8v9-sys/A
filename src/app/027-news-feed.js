// ═══════════ NEWS FEED ═══════════
// G.newsLog is an array of {type,cls,icon,headline,sub,wk,yr} objects appended by addNews()
function addNews(type,headline,sub){
  if(!G)return;
  if(!G.newsLog)G.newsLog=[];
  try{if((type==='offer'||type==='stargain'||type==='commit')&&sub&&!/via /.test(sub))sub+=' · via '+(type==='stargain'?MEDIA.rank:MEDIA.rival);}catch(e){}
  const wk=G.week||0,yr=G.yr||1;
  const typeMap={upset:'upset',great:'great-game',bad:'bad-game',offer:'offer',playoff:'playoff',myteam:'my-team',upcoming:'upcoming',stargain:'star-gain',general:'general',league:'league-news',othercls:'other-cls',injury:'injury',careerinjury:'career-injury',return:'my-team'};
  const iconMap={upset:'',great:'',bad:'',offer:'',playoff:'',myteam:'',upcoming:'',stargain:'',general:'',league:'',othercls:'',injury:'',careerinjury:'',return:''};
  G.newsLog.unshift({type,cls:typeMap[type]||'general',icon:iconMap[type]||'',headline,sub,wk,yr,ts:Date.now()});
  if(G.newsLog.length>200)G.newsLog.pop();
  // Show badge on sidebar news button
  const badge=document.getElementById('news-badge');
  if(badge&&G._page!=='news')badge.style.display='';
}

function buildNewsItems(){
  if(!G)return[];
  const items=[];

  // Pull from persistent news log first
  if(G.newsLog&&G.newsLog.length){
    for(const n of G.newsLog){
      items.push({...n,time:`Wk ${n.wk} Y${n.yr}`});
    }
    return items;
  }

  // Fallback: synthesize from game log if newsLog is empty (older save)
  if(G.log&&G.log.length){
    for(let i=0;i<Math.min(G.log.length,30);i++){
      const l=G.log[i];
      const isWin=/\b(WIN|Win)\b/.test(l);const isLoss=/\b(LOSS|Loss)\b/.test(l); // older saves wrote WIN / LOSS
      const isOffer=l.includes('FBS:')||l.includes('FCS:');
      const isChamp=/state champ|champion/i.test(l);
      if(isChamp)items.push({cls:'playoff',icon:'',headline:'State Championship!',sub:l.replace(/<[^>]+>/g,'').trim(),time:'–'});
      else if(isOffer)items.push({cls:'offer',icon:'',headline:'College Offer',sub:l.replace(/<[^>]+>/g,'').trim(),time:'–'});
      else if(isWin)items.push({cls:'my-team',icon:'',headline:'Victory',sub:l.replace(/<[^>]+>/g,'').trim(),time:'–'});
      else if(isLoss)items.push({cls:'bad-game',icon:'',headline:'Defeat',sub:l.replace(/<[^>]+>/g,'').trim(),time:'–'});
    }
  }
  return items;
}

let _newsFilt='all';
function pgNews(){
  const allItems=buildNewsItems();
  const filters=[
    {k:'all',l:'All'},
    {k:'my-team',l:'My Team'},
    {k:'upset',l:'Upsets'},
    {k:'great-game',l:'Big Games'},
    {k:'offer',l:'Offers'},
    {k:'playoff',l:'Playoffs'},
    {k:'star-gain',l:'Stars'},
    {k:'upcoming',l:'Upcoming'},
    {k:'league-news',l:' League'},
    {k:'other-cls',l:' Other Class'},
    {k:'injury',l:' Injuries'},
  ];
  window._setNewsFilt=function(f){_newsFilt=f;nav('news');};
  const filtered=_newsFilt==='all'?allItems:allItems.filter(n=>n.cls===_newsFilt||n.type===_newsFilt||((_newsFilt==='injury')&&n.type==='careerinjury'));

  const filterBtns=filters.map(f=>`<button class="news-filt ${_newsFilt===f.k?'on':''}" onclick="_setNewsFilt('${f.k}')">${f.l}</button>`).join('');

  const itemsHtml=filtered.length?filtered.map(n=>`<div class="news-item ${n.cls}">
    <div class="news-hd">
      <span class="news-icon">${n.icon}</span>
      <div class="news-body">
        <div class="news-headline">${n.headline}</div>
        <div class="news-sub">${n.sub}</div>
      </div>
      <span class="news-time">${n.time||''}</span>
    </div>
  </div>`).join(''):`<div class="news-empty"> No news yet${_newsFilt!=='all'?' in this category':''}. Play some games to see headlines!</div>`;

  return`<div class="pnl">
    <div class="ph"> News Feed <span style="font-size:11px;font-weight:400;color:var(--mu)">${allItems.length} stories</span></div>
    <div class="pb">
      <div class="news-filter-row">${filterBtns}</div>
      <div class="news-feed">${itemsHtml}</div>
    </div>
  </div>`;
}

let _rs={k:'rat',d:-1},_rpf='ALL';
function pgRoster(sid){
  const sch=getS(sid);const isMe=sid===G.myId;let pl=sPlayers(sid);
  window._setRS=(k)=>{if(_rs.k===k)_rs.d*=-1;else{_rs.k=k;_rs.d=-1;}nav('roster',sid);};
  window._setPF=(p)=>{_rpf=p;nav('roster',sid);};
  if(_rpf!=='ALL')pl=pl.filter(p=>p.pos===_rpf);
  const cmp=(a,b)=>{const d=_rs.d,k=_rs.k;
    if(k==='name')return d*(a.ln+a.fn).localeCompare(b.ln+b.fn);
    if(k==='pos')return d*a.pos.localeCompare(b.pos);if(k==='yr')return d*(a.yr-b.yr);
    if(k==='gpa')return d*(a.gpa-b.gpa);if(k==='stars')return d*(a.stars-b.stars);
    if(k==='spd')return d*(a.spd-b.spd);if(k==='str')return d*(a.str-b.str);if(k==='awr')return d*(a.awr-b.awr);
    if(k==='dev')return d*(DEV.indexOf(a.dev)-DEV.indexOf(b.dev));if(k==='sp')return d*((a.sp||0)-(b.sp||0));
    return d*(a.rat-b.rat);};
  pl.sort(cmp);const ar=k=>_rs.k===k?(_rs.d>0?'▲':'▼'):'';
  const varsityRosterCount=isMe?myP().length:sPlayers(sid).filter(p=>!p.onJV).length;
  const capPct=isMe?varsityRosterCount/MAX_VARSITY:null;
  const capColor=capPct===null?'':capPct>=1?'var(--rd)':capPct>=0.9?'var(--gd)':'var(--gn)';
  return`<div class="pnl"><div class="ph">${sLogo(sch,30)} &nbsp;${sch.name} ${sch.mascot} <span style="font-size:12px;font-weight:400;color:var(--mu)">${sPlayers(sid).length} players</span>${isMe?`<span style="margin-left:8px;background:${capPct>=1?'rgba(204,34,34,.18)':'rgba(34,184,112,.1)'};border:1px solid ${capColor};color:${capColor};border-radius:4px;padding:2px 8px;font-size:11px;font-weight:700">Varsity ${varsityRosterCount}/${MAX_VARSITY}${capPct>=1?'  AT CAP':''}</span>`:''}</div>
    <div class="pb" style="padding-bottom:6px"><div class="pfl">${['ALL',...POS].map(p=>`<button class="pfb ${_rpf===p?'on':''}" onclick="_setPF('${p}')">${p==='ALL'?'All':p}</button>`).join('')}</div><div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap"><button class="bgh bsm" onclick="bulkOpen(${sid})">Edit many players at once…</button>${isMe?'':`<button class="bgh bsm" onclick="openEditSch(${sid})">Edit team (name, colors, logo, schemes)</button><button class="bgh bsm" onclick="coachTakeOver(${sid})">Coach this team…</button>`}</div></div>
    <div style="overflow-x:auto"><table><thead><tr>
      <th>#</th><th onclick="_setRS('name')">Name ${ar('name')}</th>
      <th onclick="_setRS('pos')">Pos ${ar('pos')}</th><th onclick="_setRS('yr')">Yr ${ar('yr')}</th>
      <th onclick="_setRS('rat')">Rat ${ar('rat')}</th><th>Pot</th>
      <th onclick="_setRS('dev')">Dev ${ar('dev')}</th>
      <th>Archetype</th>
      <th onclick="_setRS('stars')"> ${ar('stars')}</th>
      <th onclick="_setRS('spd')">Spd ${ar('spd')}</th><th onclick="_setRS('str')">Str ${ar('str')}</th><th onclick="_setRS('awr')">Awr ${ar('awr')}</th>
      <th>Ht</th><th>Wt</th><th onclick="_setRS('gpa')">GPA ${ar('gpa')}</th>
      <th>Traits</th><th>Inj</th>
      ${isMe?`<th onclick="_setRS('sp')">SP ${ar('sp')}</th><th></th>`:'<th></th>'}
    </tr></thead>
    <tbody>${pl.map(p=>`<tr class="cl" onclick="showPlayer(${p.id})">
      <td style="color:var(--mu)">${p.num}</td><td><div style="display:flex;align-items:center;gap:6px">${face(p.fs,28)}<span>${p.fn} ${p.ln}</span></div></td>
      <td><span class="pb2">${p.pos}</span></td><td>${yrL(p.yr)}${p.onJV?'<span style="background:#0a1a30;border:1px solid #336;color:#88ccff;border-radius:3px;padding:0 4px;font-size:9px;font-weight:800;margin-left:3px">JV</span>':''}</td>
      <td>${isMe?rbDelta(p):rb(p.rat)}</td><td style="color:var(--mu);font-size:11px"><span style="color:var(--gn)">${p.potLo||p.pot}</span>–<span style="color:var(--pot,#f0b429)">${p.potHi||p.pot}</span></td>
      <td>${devB(p.dev)}</td>
      <td style="font-size:11px">${p.arch?`<span style="background:#0a2a10;border:1px solid #1a6030;color:#44dd88;border-radius:3px;padding:1px 6px;font-size:10px;font-weight:700;font-family:var(--hd)">${p.arch}</span>`:'–'}${p.streak==='hot'?' ':p.streak==='cold'?' ':''}</td>
      <td>${stars(p.stars)}</td>
      <td>${atv(p,'spd')}</td><td>${atv(p,'str')}</td><td>${atv(p,'awr')}</td>
      <td style="color:var(--mu)">${htf(p.ht)}</td><td style="color:var(--mu)">${p.wt}</td>
      <td>${gpaL(p.gpa)}</td>
      <td>${(p.traits||[]).map(t=>trB(t)).join('')}</td>
      <td>${injBadgeTable(p)}</td>
      ${isMe?`<td style="color:var(--te);font-weight:700">${p.sp||0}</td><td>
        <div style="display:flex;gap:3px;align-items:center">
          <button class="bgh bxs" onclick="event.stopPropagation();editPlayer(${p.id})">Edit</button>
          ${p.onJV?`<button class="btn bxs bgn" onclick="event.stopPropagation();callUpToVarsity(${p.id})" title="Call up to Varsity" style="font-size:9px;padding:2px 5px">V</button>`
            :p.yr<=10?`<button class="btn bxs" onclick="event.stopPropagation();relegateToJV(${p.id})" title="Send to JV" style="background:var(--gd);color:#000;font-size:9px;padding:2px 5px">JV</button>`:''}
          <button class="btn bxs" onclick="event.stopPropagation();confirmCutPlayer(${p.id})" title="Cut player" style="background:var(--rd);font-size:9px;padding:2px 5px"></button>
        </div>
      </td>`:''}
      ${isMe?'':`<td><button class="bgh bxs" onclick="event.stopPropagation();editPlayer(${p.id})">Edit</button></td>`}
    </tr>`).join('')}</tbody></table></div></div>`;
}

function pgDepth(){
  const ms=myS();const pl=myP();const cnt=getStarterCnt(G.myId);
  if(!G.benched)G.benched={};
  const byPos={};for(const pos of POS)byPos[pos]=pl.filter(p=>p.pos===pos);
  for(const pos of POS)byPos[pos].sort((a,b)=>{const ao=a.depth&&a.depth[pos]!==undefined?a.depth[pos]:999,bo=b.depth&&b.depth[pos]!==undefined?b.depth[pos]:999;if(ao!==bo)return ao-bo;return b.rat-a.rat;});
  return progPanel()+`<div class="pnl"><div class="ph">Depth Chart: ${ms.name} ${ms.mascot}
    <span style="font-size:11px;font-weight:400;color:var(--mu)">${ms.offS} / ${ms.defS}</span>
  </div><div class="pb">
    <div style="font-size:11px;color:var(--mu);margin-bottom:12px;padding:6px 8px;background:var(--s2);border-radius:4px">
       <strong style="color:var(--tx)">Bench:</strong> Benching a starter promotes the next highest-rated non-starter to fill the role.
    </div>
    ${POS.map(pos=>{
      const benchedIds=G.benched[pos]||[];
      const starterSlots=cnt[pos]||0;
      // Effective starters: depth-sorted non-benched players filling starter slots
      const activePlayers=byPos[pos].filter(p=>!benchedIds.includes(p.id));
      const benchedPlayers=byPos[pos].filter(p=>benchedIds.includes(p.id));
      return`<div style="margin-bottom:14px">
        <div style="font-family:var(--hd);font-size:13px;font-weight:800;color:var(--te);margin-bottom:6px;">${pos} <span style="font-size:10px;color:var(--mu)">(${starterSlots} starters)</span></div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${!byPos[pos].length?'<span style="color:var(--mu);font-size:12px">No players</span>':
          [...activePlayers.map((p,i)=>`<div class="pbn ${i<starterSlots?'st':''}" style="min-width:165px">
            <div style="font-size:10px;color:var(--mu)">Depth ${i+1}${i<starterSlots?'<span style="color:var(--gd)">Starter</span>':''}</div>
            <div style="display:flex;align-items:center;gap:7px;margin:3px 0">${face(p.fs,30)}<span style="font-weight:700;font-size:13px">${p.fn} ${p.ln}</span></div>
            <div style="display:flex;gap:5px;align-items:center;margin-top:3px">${yrL(p.yr)} ${rbDelta(p)} ${injBadgeDepth(p)}</div>
            <div style="display:flex;gap:4px;margin-top:4px">
              <button class="bxs bgh" onclick="setStarter('${pos}',${p.id})">★ Starter</button>
              ${i<starterSlots?`<button class="bxs bgh" style="border-color:var(--gd);color:var(--gd)" onclick="benchPlayer('${pos}',${p.id})"> Bench</button>`:''}
              <button class="bxs bgh" onclick="showPlayer(${p.id})">View</button>
            </div>
          </div>`),
          ...benchedPlayers.map(p=>`<div class="pbn benched-card" style="min-width:165px">
            <div style="font-size:10px;color:var(--mu)">Benched <span class="bench-badge">Bench</span></div>
            <div style="display:flex;align-items:center;gap:7px;margin:3px 0">${face(p.fs,30)}<span style="font-weight:700;font-size:13px">${p.fn} ${p.ln}</span></div>
            <div style="display:flex;gap:5px;align-items:center;margin-top:3px">${yrL(p.yr)} ${rbDelta(p)} ${injBadgeDepth(p)}</div>
            <div style="display:flex;gap:4px;margin-top:4px">
              <button class="bxs btn bgd" onclick="unbenchPlayer('${pos}',${p.id})">↑ Unbenched</button>
              <button class="bxs bgh" onclick="showPlayer(${p.id})">View</button>
            </div>
          </div>`)].join('')}
        </div>
      </div>`;
    }).join('')}
  </div></div>`;
}

window.setStarter=function(pos,pid){
  if(!G.benched)G.benched={};
  // Remove from bench if they were benched
  if(G.benched[pos])G.benched[pos]=G.benched[pos].filter(id=>id!==pid);
  const all=myP().filter(p=>p.pos===pos);for(const p of all){if(!p.depth)p.depth={};delete p.depth[pos];}
  const t=getP(pid);if(!t)return;if(!t.depth)t.depth={};t.depth[pos]=0;
  let rank=1;for(const p of all){if(p.id!==pid){if(!p.depth)p.depth={};p.depth[pos]=rank++;}}
  updateRats();nav('depth');notify(`${t.fn} ${t.ln} set as ${pos} starter!`);
};

window.benchPlayer=function(pos,pid){
  if(!G.benched)G.benched={};
  if(!G.benched[pos])G.benched[pos]=[];
  const p=getP(pid);if(!p)return;
  if(G.benched[pos].includes(pid)){notify(`${p.fn} ${p.ln} is already benched.`,'w');return;}
  // Check if benching would leave no starters at this position
  const cnt=getStarterCnt(G.myId);const slots=cnt[pos]||0;
  const activeCnt=myP().filter(pl=>pl.pos===pos&&!(G.benched[pos]||[]).includes(pl.id)).length;
  if(activeCnt<=slots){notify(`Can't bench, no eligible replacement for ${pos}!`,'w');return;}
  G.benched[pos].push(pid);
  updateRats();nav('depth');notify(`${p.fn} ${p.ln} benched, next player promoted!`);
};

window.unbenchPlayer=function(pos,pid){
  if(!G.benched)G.benched={};
  if(!G.benched[pos])return;
  G.benched[pos]=G.benched[pos].filter(id=>id!==pid);
  const p=getP(pid);
  updateRats();nav('depth');notify(`${p?p.fn+' '+p.ln:'Player'} returned to depth chart!`);
};

function pgTrain(){
  const spPl=myP().filter(p=>(p.sp||0)>0);
  const tLvl=getTrainLevel();
  const upgCost=Math.round(5000+tLvl*4000); // cost scales: lvl1→9k, lvl20→85k
  const canUpg=tLvl<20&&hasFunds(upgCost);
  // Render star display (filled/half/empty) for level out of 20
  const starCount=Math.floor(tLvl/4);
  const halfStar=(tLvl%4)>=2?1:0;
  const emptyStars=5-starCount-(halfStar?1:0);
  const starHTML='★'.repeat(starCount)+(halfStar?'':'')+'☆'.repeat(emptyStars);
  const tf=trainFactor();

  return`<div class="pnl" style="margin-bottom:14px">
    <div class="ph">Training Facility</div>
    <div class="pb">
      <div style="background:var(--s2);border:1px solid var(--bd);border-radius:8px;padding:16px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <div>
          <div style="font-size:12px;color:var(--mu);margin-bottom:4px;font-weight:700;">Training Level</div>
          <div style="font-family:var(--hd);font-size:28px;font-weight:900;color:var(--pot,#f0b429);letter-spacing:2px">${starHTML}</div>
          <div style="font-family:var(--hd);font-size:22px;font-weight:900;color:var(--tx);margin-top:2px">${tLvl}/20</div>
          <div style="font-size:11px;color:var(--mu);margin-top:4px">The higher the level the faster your players will evolve and reach their full potential.</div>
        </div>
        <button class="btn bbl" style="min-width:110px;padding:10px 18px;font-size:14px;font-weight:700" ${canUpg?`onclick="window.upgradeTrainLevel()"`:''} ${!canUpg?(tLvl>=20?'disabled style="opacity:.5"':`disabled style="opacity:.5" title="Need $${upgCost.toLocaleString()}"`):''}>${tLvl>=20?'Maxed':'Upgrade<br><span style="font-size:11px;font-weight:500">$'+upgCost.toLocaleString()+'</span>'}</button>
      </div>
      <div style="margin-top:10px;display:flex;gap:4px">${Array.from({length:20},(_,i)=>`<div style="flex:1;height:6px;border-radius:3px;background:${i<tLvl?'var(--b2)':'var(--bd)'}"></div>`).join('')}</div>
      <div style="margin-top:8px;display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px">
        <div style="background:rgba(34,184,112,.08);border:1px solid rgba(34,184,112,.25);border-radius:5px;padding:8px;text-align:center">
          <div style="color:var(--mu);font-size:10px;font-weight:700">Potential Unlocked</div>
          <div style="font-size:18px;font-weight:900;color:var(--gn);font-family:var(--hd)">${Math.round(tf*100)}%</div>
          <div style="color:var(--mu);font-size:10px">of each player's ceiling</div>
        </div>
        <div style="background:rgba(100,150,255,.08);border:1px solid rgba(100,150,255,.25);border-radius:5px;padding:8px;text-align:center">
          <div style="color:var(--mu);font-size:10px;font-weight:700">Training Gain Bonus</div>
          <div style="font-size:18px;font-weight:900;color:#6496ff;font-family:var(--hd)">+${Math.round(tf*30)}%</div>
          <div style="color:var(--mu);font-size:10px">offseason SP growth</div>
        </div>
      </div>
    </div>
  </div>

  <div class="pnl" style="margin-bottom:14px">
    <div class="ph">Three-Phase Offseason</div>
    <div class="pb">
      <div style="font-size:13px;color:var(--mu);margin-bottom:12px">The offseason has three phases: <strong>Winter</strong> (weight/film), <strong>Spring</strong> (position training/camps), and <strong>Summer</strong> (conditioning/depth charts). Start from the Dashboard.</div>
      <div class="g3">
        <div style="background:var(--s2);border:1px solid var(--bd);border-radius:6px;padding:12px;text-align:center"><div style="font-size:24px"></div><div style="font-weight:700;margin-top:6px">Winter</div><div style="font-size:11px;color:var(--mu)">Weights, film, recruiting</div></div>
        <div style="background:var(--s2);border:1px solid var(--bd);border-radius:6px;padding:12px;text-align:center"><div style="font-size:24px"></div><div style="font-weight:700;margin-top:6px">Spring</div><div style="font-size:11px;color:var(--mu)">Practices, camps, scouting</div></div>
        <div style="background:var(--s2);border:1px solid var(--bd);border-radius:6px;padding:12px;text-align:center"><div style="font-size:24px"></div><div style="font-weight:700;margin-top:6px">Summer</div><div style="font-size:11px;color:var(--mu)">Conditioning, finalize depth</div></div>
      </div>
    </div>
  </div>

  <div class="pnl"><div class="ph">Player Potential Overview <span style="color:var(--mu);font-size:11px;font-weight:400;margin-left:6px">ranges shift with performance each season</span></div>
    <div class="pb">
      <div style="overflow-x:auto"><table>
        <thead><tr><th>Player</th><th>Pos</th><th>Yr</th><th>Rating</th><th>Age</th><th>Potential</th></tr></thead>
        <tbody>${myP().sort((a,b)=>b.rat-a.rat).map(p=>{
          const lo=p.potLo||p.pot,hi=p.potHi||p.pot,eff=effPot(p);
          const pct=lo<hi?Math.round((eff-lo)/(hi-lo)*100):100;
          return`<tr class="cl" onclick="showPlayer(${p.id})">
            <td><span class="pb2" style="font-size:10px;margin-right:4px">${p.pos}</span>${p.fn} ${p.ln}</td>
            <td><span class="pb2">${p.pos}</span></td>
            <td>${yrL(p.yr)}</td>
            <td>${rb(p.rat)}</td>
            <td style="color:var(--mu)">${p.yr===9?'Fr':p.yr===10?'So':p.yr===11?'Jr':'Sr'}</td>
            <td>
              <div style="display:flex;align-items:center;gap:6px">
                <span style="font-family:var(--hd);font-size:13px;font-weight:700;color:var(--gn)">${lo}</span>
                <span style="color:var(--mu);font-size:11px">–</span>
                <span style="font-family:var(--hd);font-size:13px;font-weight:700;color:var(--pot,#f0b429)">${hi}</span>
                <div style="flex:1;min-width:40px;background:var(--bd);border-radius:3px;height:5px;position:relative">
                  <div style="position:absolute;left:0;top:0;height:5px;border-radius:3px;background:linear-gradient(90deg,var(--gn),#f0b429);width:${pct}%"></div>
                </div>
                <span style="font-size:10px;color:var(--mu)">${pct}%</span>
              </div>
            </td>
          </tr>`;
        }).join('')}
        </tbody>
      </table></div>
      <div style="margin-top:10px;padding:9px;background:var(--s2);border-radius:4px;font-size:12px;color:var(--mu)">
        <strong style="color:var(--tx)">How potential works:</strong> Each player has a <span style="color:var(--gn)">floor</span> and a <span style="color:var(--pot,#f0b429)">ceiling</span>. Higher training level unlocks more of the ceiling. Great seasons raise the range; poor seasons lower it.  Freshmen & Sophomores are protected from potential decreases.
      </div>
    </div>
  </div>

  <div class="pnl" style="margin-top:14px"><div class="ph">Skill Points: Spend Now <span style="color:var(--te);margin-left:8px">${spPl.length} players ready</span></div>
    <div class="pb">${!spPl.length?'<div style="color:var(--mu)">No skill points yet. Complete offseason phases to earn SP.</div>':
    `<div style="overflow-x:auto"><table><thead><tr><th>Player</th><th>Pos</th><th>Yr</th><th>Dev</th><th>SP</th><th>OVR</th><th title="Display only: boosts automatically with OVR">Spd ℹ</th><th title="Display only: boosts automatically with OVR">Str ℹ</th><th title="Display only: boosts automatically with OVR">Awr ℹ</th><th></th></tr></thead>
    <tbody>${spPl.map(p=>`<tr class="cl" onclick="showPlayer(${p.id})">
      <td>${p.fn} ${p.ln}</td><td><span class="pb2">${p.pos}</span></td>
      <td>${yrL(p.yr)}</td><td>${devB(p.dev)}</td>
      <td style="color:var(--te);font-weight:700">${p.sp}</td>
      <td>${rbDelta(p)}</td><td style="color:var(--mu)">${atv(p,'spd')}</td><td style="color:var(--mu)">${atv(p,'str')}</td><td style="color:var(--mu)">${atv(p,'awr')}</td>
      <td><button class="btn bsm bbl" onclick="event.stopPropagation();showPlayer(${p.id})">Spend</button>
      <button class="btn bsm bgd" onclick="event.stopPropagation();autoSP(${p.id})">Auto</button></td>
    </tr>`).join('')}</tbody></table></div>`}
    <div style="margin-top:10px;padding:9px;background:var(--s2);border-radius:4px;font-size:12px;color:var(--mu)">
      <strong style="color:var(--tx)">SP upgrades OVR only.</strong> Spd/Str/Awr boost automatically when OVR goes up, amount varies by position. Dev SP/offseason: Normal: 2 | Impact: 4 | Star: 5 | Elite Dev: 8 (weekly practices add more during the season).
    </div>
  </div></div>`;
}

window.autoSP=function(pid){const p=getP(pid);if(!p||!(p.sp>0))return;const sp=p.sp;p.rat=clamp(p.rat+sp,1,Math.max(p.pot,p.rat));p.pot=Math.max(p.pot,p.rat);_attrBoostForOvr(p,sp);p.sp=0;updateRats();notify(`${p.fn} ${p.ln}: ${sp} SP → +${sp} OVR! Attributes boosted.`);nav('training');};

window.upgradeTrainLevel=function(){
  const tLvl=getTrainLevel();
  if(tLvl>=20){notify('Training facility already at max level!');return;}
  const cost=Math.round(5000+tLvl*4000);
  if(!hasFunds(cost)){notify(`Not enough budget! Need $${cost.toLocaleString()}`,'e');return;}
  if(!G.unlimitedMoney)G.budget-=cost;
  G.trainLevel=tLvl+1;
  const ms=getS(G.myId);if(ms)ms.trainLevel=G.trainLevel;
  syncFacFromTrainLevel();
  // Sync all player effective pots immediately
  for(const p of myP())syncPot(p);
  updateRats();
  notify(` Training Facility upgraded to Level ${G.trainLevel}/20! Players can now reach more of their potential.`);
  nav('training');
};

function pgStaff(){
  const bud=G.budget,fac=G.fac,st=G.staff;
  const sC=l=>l*20000,fC=c=>(c+1)*15000;
  return ticketHtml()+moneyHtml()+pcoachHtml()+`<div class="g2" style="margin-bottom:14px">
    <div class="pnl"><div class="ph">Coaching Staff</div><div class="pb">
      <div style="font-size:12px;color:var(--mu);margin-bottom:10px">Budget: <strong style="color:var(--gn)">$${bud.toLocaleString()}</strong></div>
      ${[{k:'hc',l:'Asst. Head Coach',d:'Overall SP bonus'},{k:'oc',l:'Off. Coordinator',d:'Offensive SP bonus'},{k:'dc',l:'Def. Coordinator',d:'Defensive SP bonus'},{k:'rc',l:'Recruiting Coord',d:'Better freshmen quality'}].map(s=>{const cur=st[s.k];const uC=sC(cur.lvl+1);const canU=cur.lvl<5&&hasFunds(uC);
        return`<div style="background:var(--s2);border:1px solid var(--bd);border-radius:5px;padding:10px;margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;align-items:start">
            <div><div style="font-weight:700">${cur.name}</div><div style="font-size:11px;color:var(--mu)">${s.l}, Lvl ${cur.lvl}/5</div><div style="font-size:11px;color:var(--te);margin-top:2px">${s.d}</div></div>
            <button class="btn bsm bbl" ${canU?`onclick="upgSt('${s.k}',${uC})"`:''} ${!canU?'disabled style="opacity:.4"':''}>${cur.lvl>=5?'MAX':`Upg $${uC.toLocaleString()}`}</button>
          </div>
          <div style="display:flex;gap:3px;margin-top:6px">${[1,2,3,4,5].map(i=>`<div style="flex:1;height:5px;border-radius:2px;background:${i<=cur.lvl?'var(--b2)':'var(--bd)'}"></div>`).join('')}</div>
        </div>`;}).join('')}
    </div></div>
    <div class="pnl"><div class="ph">Facilities</div><div class="pb">
      ${[{k:'weight',l:'Weight Room',d:'Strength training gains'},{k:'film',l:'Film Room',d:'Awareness gains'},{k:'train',l:'Practice Field',d:'Overall training bonus'},{k:'med',l:'Medical Staff',d:'Reduces injury time'}].map(f=>{const cur=fac[f.k]||1;const uC=fC(cur);const canU=cur<5&&hasFunds(uC);
        return`<div style="background:var(--s2);border:1px solid var(--bd);border-radius:5px;padding:10px;margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;align-items:start">
            <div><div style="font-weight:700">${f.l} <span style="color:var(--mu);font-size:11px">Lvl ${cur}/5</span></div><div style="font-size:11px;color:var(--te);margin-top:2px">${f.d}</div></div>
            <button class="btn bsm bbl" ${canU?`onclick="upgFac('${f.k}',${uC})"`:''} ${!canU?'disabled style="opacity:.4"':''}>${cur>=5?'MAX':`Upg $${uC.toLocaleString()}`}</button>
          </div>
          <div style="display:flex;gap:3px;margin-top:5px">${[1,2,3,4,5].map(i=>`<div style="flex:1;height:5px;border-radius:2px;background:${i<=cur?'var(--ac)':'var(--bd)'}"></div>`).join('')}</div>
        </div>`;}).join('')}
    </div></div>
  </div>
  ${stadPanel()}
  <div class="pnl"><div class="ph">Playbook</div><div class="pb"><div class="g2">
    <div><div style="font-size:12px;font-weight:700;margin-bottom:8px;color:var(--mu)">Offensive scheme</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">${OFF_SCH.map(s=>`<button class="bgh ${G.offS===s?'btn bbl':''}" onclick="G.offS=this.textContent;myS().offS=G.offS;nav('staff')" style="font-size:11px">${s}</button>`).join('')}</div>
    </div>
    <div><div style="font-size:12px;font-weight:700;margin-bottom:8px;color:var(--mu)">Defensive scheme</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">${DEF_SCH.map(s=>`<button class="bgh ${G.defS===s?'btn bbl':''}" onclick="G.defS=this.textContent;myS().defS=G.defS;nav('staff')" style="font-size:11px">${s}</button>`).join('')}</div>
    </div>
  </div></div></div>
  <div class="pnl"><div class="ph">Play-call splits${G.pSplits&&G.pSplits.yr===G.yr?` · ${G.pSplits.g} game${G.pSplits.g===1?'':'s'} played`:''}</div><div class="pb">${G.pSplits&&G.pSplits.yr===G.yr?splitsHtml(G.pSplits,'This season (games you played on Game Day)'):'<div style="color:var(--mu);font-size:13px">Play a game on Game Day and every call you run shows up here: how often you ran it, its average gain, touchdowns and first downs, plus what each of your coverages gave up.</div>'}</div></div>`;
}
function upgSt(k,c){if(!hasFunds(c)){notify('Not enough budget!','e');return;}if(!G.unlimitedMoney)G.budget-=c;G.staff[k].lvl++;notify(`${G.staff[k].name} upgraded to Level ${G.staff[k].lvl}!`);nav('staff');}
function upgFac(k,c){if(!hasFunds(c)){notify('Not enough budget!','e');return;}if(!G.unlimitedMoney)G.budget-=c;G.fac[k]++;notify('Facility upgraded!');nav('staff');}

let _custTab='team';
function pgCust(){
  const ms=myS();
  const teamTab=_custTab==='team';
  const playerTab=_custTab==='player';
  window._setCustTab=(t)=>{_custTab=t;nav('cust');};
  const devOptions=['Normal','Impact','Star','Elite Dev'];
  const playerForm=`
    <div class="pnl" style="margin-bottom:14px"><div class="ph"> Add Custom Player to Your Roster</div><div class="pb">
      <div class="g2" style="gap:10px;margin-bottom:12px">
        <div class="fg"><label>First Name</label><input class="ei" id="cp-fn" placeholder="e.g. Marcus"></div>
        <div class="fg"><label>Last Name</label><input class="ei" id="cp-ln" placeholder="e.g. Williams"></div>
      </div>
      <div class="g3" style="gap:10px;margin-bottom:12px">
        <div class="fg"><label>Position</label>
          <select class="ei" id="cp-pos">
            ${POS.map(p=>`<option value="${p}">${p}</option>`).join('')}
          </select>
        </div>
        <div class="fg"><label>Year</label>
          <select class="ei" id="cp-yr">
            <option value="9">Freshman (Fr)</option>
            <option value="10">Sophomore (So)</option>
            <option value="11">Junior (Jr)</option>
            <option value="12">Senior (Sr)</option>
          </select>
        </div>
        <div class="fg"><label>Jersey #</label><input class="ei" id="cp-num" type="number" min="1" max="99" value="1"></div>
      </div>
      <div class="g3" style="gap:10px;margin-bottom:12px">
        <div class="fg"><label>Overall (OVR) <span style="color:var(--mu)">1–99</span></label><input class="ei" id="cp-rat" type="number" min="1" max="99" value="65"></div>
        <div class="fg"><label>Potential <span style="color:var(--mu)">OVR–99</span></label><input class="ei" id="cp-pot" type="number" min="1" max="99" value="80"></div>
        <div class="fg"><label>Dev Trait</label>
          <select class="ei" id="cp-dev">
            ${devOptions.map(d=>`<option value="${d}">${d}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="g3" style="gap:10px;margin-bottom:12px">
        <div class="fg"><label>Speed <span style="color:var(--mu)">1–99</span></label><input class="ei" id="cp-spd" type="number" min="1" max="99" value="60"></div>
        <div class="fg"><label>Strength <span style="color:var(--mu)">1–99</span></label><input class="ei" id="cp-str" type="number" min="1" max="99" value="60"></div>
        <div class="fg"><label>Awareness <span style="color:var(--mu)">1–99</span></label><input class="ei" id="cp-awr" type="number" min="1" max="99" value="60"></div>
      </div>
      <div class="g2" style="gap:10px;margin-bottom:12px">
        <div class="fg"><label>Height (inches) <span style="color:var(--mu)">62–82</span></label><input class="ei" id="cp-ht" type="number" min="62" max="82" value="72"></div>
        <div class="fg"><label>Weight (lbs) <span style="color:var(--mu)">155–355</span></label><input class="ei" id="cp-wt" type="number" min="155" max="355" value="210"></div>
      </div>
      <div class="fg" style="margin-bottom:14px"><label>GPA <span style="color:var(--mu)">1.5–4.0</span></label><input class="ei" id="cp-gpa" type="number" min="1.5" max="4.0" step="0.1" value="2.5"></div>
      <div style="display:flex;gap:8px">
        <button class="btn bgn" onclick="addCustomPlayer()" style="flex:1"> Add Player to Roster</button>
        <button class="bgh" onclick="fillCustomPlayerRandom()" style="flex:1"> Randomize Fields</button>
      </div>
    </div></div>`;

  const teamForm=`<div class="g2">
    <div>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">${sLogo(ms,56)}<div>
        <div style="font-family:var(--hd);font-size:18px;font-weight:900">${ms.name}</div>
        <div style="font-size:13px;color:var(--mu)">${ms.mascot} • ${ms.city}</div>
      </div></div>
      <div class="fg" style="margin-bottom:9px"><label>Team Name</label><input class="ei" id="cn" value="${ms.name}"></div>
      <div class="fg" style="margin-bottom:9px"><label>Mascot</label><input class="ei" id="cm" value="${ms.mascot}"></div>
      <div class="fg" style="margin-bottom:9px"><label>City</label><input class="ei" id="cc" value="${ms.city}"></div>
      <div class="fg" style="margin-bottom:9px"><label>Abbreviation (3 letters)</label><input class="ei" id="ca" value="${ms.abbr}" maxlength="3" style=""></div>
      <button class="btn bgn" onclick="applyC()">Apply Changes</button>
    </div>
    <div>
      <div style="font-size:11px;color:var(--mu);margin-bottom:10px;letter-spacing:1px;font-weight:700">Custom Logo Upload</div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
        <div id="logoPreview" style="width:56px;height:56px;display:flex;align-items:center;justify-content:center;background:var(--s2);flex-shrink:0">${ms.customLogo?`<img src="${ms.customLogo}" alt="Team logo" style="width:56px;height:56px;object-fit:contain">`:`<span style="font-size:9px;color:var(--mu);text-align:center;padding:4px">No custom logo</span>`}</div>
        <div style="flex:1">
          <label for="logoUpload" style="display:block;background:var(--b2);color:#fff;text-align:center;padding:6px 10px;border-radius:4px;cursor:pointer;font-family:var(--hd);font-weight:700;font-size:12px;margin-bottom:5px"> Upload Logo</label>
          <input type="file" id="logoUpload" accept="image/*" style="display:none" onchange="handleLogoUpload(this)">
          <button class="bgh bsm" onclick="clearCustomLogo()" style="width:100%;font-size:11px" ${ms.customLogo?'':'disabled'}>✕ Remove Custom Logo</button>
          <div style="font-size:10px;color:var(--mu);margin-top:3px">PNG, JPG or SVG</div>
        </div>
      </div>
      <div style="font-size:11px;color:var(--mu);margin-bottom:10px;letter-spacing:1px;font-weight:700">Logo Colors</div>
      <div style="display:flex;gap:10px;margin-bottom:10px">
        <div><div style="font-size:10px;color:var(--mu);margin-bottom:3px">Primary</div><input type="color" value="${ms.c1}" id="cc1" style="width:46px;height:30px;border:none;background:none;cursor:pointer"></div>
        <div><div style="font-size:10px;color:var(--mu);margin-bottom:3px">Secondary</div><input type="color" value="${ms.c2}" id="cc2" style="width:46px;height:30px;border:none;background:none;cursor:pointer"></div>
      </div>
      <div style="font-size:10px;color:var(--mu);margin-bottom:5px">Preset Combos</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px">${LCOLS.slice(0,18).map(([c1,c2])=>`<div onclick="document.getElementById('cc1').value='${c1}';document.getElementById('cc2').value='${c2}'" style="width:26px;height:26px;border-radius:50%;background:${c1};border:2px solid ${c2};cursor:pointer;display:inline-block"></div>`).join('')}</div>
      <div style="margin-top:14px"><div style="font-size:11px;color:var(--mu);margin-bottom:7px;font-weight:700">Edit any school</div>
        <input placeholder="Find any school in any state…" oninput="schFind(this.value)" style="width:100%;padding:5px 8px">
        <div id="schFindL" style="margin-top:6px;max-height:240px;overflow-y:auto"></div>
        <div style="font-size:10px;color:var(--mu);margin-top:4px">Or open any school (tap its name anywhere in the game) and press Edit team.</div>
      </div>
    </div>
  </div>`;

  return`<div class="pnl"><div class="ph"> Customize</div>
    <div class="tabs" style="padding:0 14px">
      <button class="tab ${teamTab?'on':''}" onclick="_setCustTab('team')"> Team</button>
      <button class="tab ${playerTab?'on':''}" onclick="_setCustTab('player')"> Add Player</button>
      <button class="tab ${_custTab==='uni'?'on':''}" onclick="_setCustTab('uni')">Uniforms</button>
      <button class="tab ${_custTab==='pb'?'on':''}" onclick="_setCustTab('pb')">Playbooks</button>
    </div>
    <div class="pb">
      ${teamTab?`<div>${teamForm}</div></div>`:_custTab==='uni'?uniEditorHtml():_custTab==='pb'?pbEditorHtml():playerForm}
    </div></div>`;
}

function addCustomPlayer(){
  const v=(id)=>document.getElementById(id);
  const fn=(v('cp-fn').value||'').trim();
  const ln=(v('cp-ln').value||'').trim();
  if(!fn||!ln){notify('Please enter a first and last name.','e');return;}
  const pos=v('cp-pos').value;
  const yr=parseInt(v('cp-yr').value)||9;
  const num=clamp(parseInt(v('cp-num').value)||1,1,99);
  const rat=clamp(parseInt(v('cp-rat').value)||65,1,99);
  const pot=clamp(Math.max(parseInt(v('cp-pot').value)||80,rat),rat,99);
  const dev=v('cp-dev').value||'Normal';
  const spd=clamp(parseInt(v('cp-spd').value)||60,1,99);
  const str=clamp(parseInt(v('cp-str').value)||60,1,99);
  const awr=clamp(parseInt(v('cp-awr').value)||60,1,99);
  const ht=clamp(parseInt(v('cp-ht').value)||72,62,82);
  const wt=clamp(parseInt(v('cp-wt').value)||210,155,355);
  const gpa=clamp(parseFloat(v('cp-gpa').value)||2.5,1.5,4.0);
  const id=_pId++;
  const ms=myS();
  const arch=pickArchetype(pos,ms.offS||'Pro Style',ms.defS||'4-3');
  const p={id,sId:G.myId,pos,yr,fn,ln,rat,pot,dev,traits:[],gpa,
    mood:'neutral',morale:75,spd,str,awr,
    stats:emS(),seasStats:emS(),carStats:emS(),
    stars:0,offers:[],committed:null,inj:0,ht,wt,num,sp:0,
    camp:false,wl:false,hof:false,fs:id,depth:{},
    interests:genInterests(),arch,
    streak:null,streakUsed:false,streakGamesLeft:0,perfHistory:[],
    _custom:true};
  G.players.push(p);
  try{gdFixNums(p);}catch(e){}
  updateRats();
  addLog(`<span style="color:var(--gn)"> Custom player added: ${fn} ${ln} (${pos}, ${['Fr','So','Jr','Sr'][yr-9]||'Fr'}, ${rat} OVR, ${dev})</span>`);
  notify(`${fn} ${ln} added to roster!`);
  nav('cust');
}

function fillCustomPlayerRandom(){
  const pos=pick(POS);
  const yr=rng(9,12);
  const rat=rng(45,85);
  const pot=clamp(rat+rng(5,20),rat,99);
  const hb={QB:74,RB:70,WR:72,TE:76,OL:76,DL:75,LB:73,CB:70,S:71,K:71};
  const wb={QB:215,RB:210,WR:188,TE:245,OL:285,DL:268,LB:235,CB:182,S:198,K:182};
  const v=(id)=>document.getElementById(id);
  v('cp-fn').value=pick(FN);
  v('cp-ln').value=pick(LN);
  v('cp-pos').value=pos;
  v('cp-yr').value=yr;
  v('cp-num').value=posN(pos,G.myId);
  v('cp-rat').value=rat;
  v('cp-pot').value=pot;
  v('cp-dev').value=pick(['Normal','Normal','Normal','Impact','Star']);
  v('cp-spd').value=rng(40,80);
  v('cp-str').value=rng(40,80);
  v('cp-awr').value=rng(38,78);
  v('cp-ht').value=clamp((hb[pos]||72)+rng(-3,3),62,82);
  v('cp-wt').value=clamp((wb[pos]||210)+rng(-18,18),155,355);
  v('cp-gpa').value=(rng(15,38)/10).toFixed(1);
}
// uploaded logos are scaled down to 160 px before they are kept (a phone photo would otherwise sit in every save)
function logoShrink(file,cb){const r=new FileReader();r.onload=e=>{const img=new Image();img.onload=()=>{try{const M=160,k=Math.min(1,M/Math.max(img.width,img.height)),w=Math.max(1,Math.round(img.width*k)),h=Math.max(1,Math.round(img.height*k));
      const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);let d=c.toDataURL('image/webp',0.86);if(!/^data:image\/webp/.test(d))d=c.toDataURL('image/png');cb(d.length<e.target.result.length?d:e.target.result);}catch(_){cb(e.target.result);}};
    img.onerror=()=>notify('That image could not be read.','e');img.src=e.target.result;};r.readAsDataURL(file);}
function handleLogoUpload(inp){
  const file=inp.files[0];if(!file)return;
  logoShrink(file,function(dataUrl){
    const prev=document.getElementById('logoPreview');
    if(prev)prev.innerHTML=`<img src="${dataUrl}" alt="New logo preview" style="width:56px;height:56px;object-fit:cover">`;
    // Store temporarily on the team object immediately so live preview works
    const ms=myS();ms._pendingLogo=dataUrl;
    notify('Logo loaded: click Apply to save!');
  });
}
function clearCustomLogo(){
  const ms=myS();ms.customLogo=null;ms._pendingLogo=null;
  updateTb();notify('Custom logo removed.');nav('cust');
}
function applyC(){const ms=myS();ms.name=document.getElementById('cn').value||ms.name;ms.mascot=document.getElementById('cm').value||ms.mascot;ms.city=document.getElementById('cc').value||ms.city;ms.abbr=(document.getElementById('ca').value||ms.abbr).toUpperCase().slice(0,3);ms.c1=document.getElementById('cc1').value;ms.c2=document.getElementById('cc2').value;if(ms._pendingLogo){ms.customLogo=ms._pendingLogo;ms._pendingLogo=null;}updateTb();notify('Team updated!');nav('cust');}
window.schFind=function(q){const el=document.getElementById('schFindL');if(!el)return;q=String(q||'').trim().toLowerCase();if(q.length<2){el.innerHTML='';return;}
  const L=[];for(const s of allSchoolsAll()){if(L.length>=30)break;if((s.name+' '+s.mascot+' '+(s.city||'')).toLowerCase().includes(q))L.push(s);}
  el.innerHTML=L.length?L.map(s=>`<div style="display:flex;align-items:center;gap:8px;padding:3px 0;border-bottom:1px solid var(--bd)">${sLogo(s,22)}<div style="flex:1;min-width:0;font-size:12px"><b>${s.name} ${s.mascot}</b> <span style="color:var(--mu)">${s.city||''} · ${clsName(s.cls)}</span></div><button class="bgh bxs" onclick="openEditSch(${s.id})">Edit</button></div>`).join(''):'<div style="font-size:12px;color:var(--mu)">No school found.</div>';};
// uniforms are changed on a copy of the school's colors, so Cancel leaves the school as it was
window.schUniCol=function(){const T=window._schUniT;if(!T)return;T.c1=document.getElementById('ec1').value;T.c2=document.getElementById('ec2').value;const el=document.getElementById('sch-uni');if(el)el.innerHTML=uniHostHtml(T,schUniCol,T.id===G.myId);};
function openEditSch(sid){const s=getS(sid);if(!s)return;window._schUniT={id:s.id,name:s.name,mascot:s.mascot,c1:s.c1,c2:s.c2,c3:s.c3,uni:uniClean(s.uni)};window._uniKind='home';openMo(`<h2>Edit School</h2>
  <div class="g2" style="gap:10px;margin-top:8px">
    <div class="fg"><label>Team Name</label><input class="ei" id="en" value="${s.name}"></div>
    <div class="fg"><label>Mascot</label><input class="ei" id="em" value="${s.mascot}"></div>
    <div class="fg"><label>City</label><input class="ei" id="ec" value="${s.city}"></div>
    <div class="fg"><label>Abbreviation</label><input class="ei" id="ea" value="${s.abbr}" maxlength="3" style=""></div>
    <div class="fg"><label>Primary Color</label><input type="color" id="ec1" value="${s.c1}" oninput="schUniCol()" style="width:46px;height:30px;border:none;background:none;cursor:pointer"></div>
    <div class="fg"><label>Secondary Color</label><input type="color" id="ec2" value="${s.c2}" oninput="schUniCol()" style="width:46px;height:30px;border:none;background:none;cursor:pointer"></div>
    <div class="fg"><label>Off Scheme</label><select class="ei" id="eos">${OFF_SCH.map(sc=>`<option ${sc===s.offS?'selected':''}>${sc}</option>`).join('')}</select></div>
    <div class="fg"><label>Def Scheme</label><select class="ei" id="eds">${DEF_SCH.map(sc=>`<option ${sc===s.defS?'selected':''}>${sc}</option>`).join('')}</select></div>
    <div class="fg"><label>Logo icon</label><select class="ei" id="elk" onchange="schLogoPrev(${sid})"><option value="">From the mascot name</option>${Object.keys(_LGO).sort().map(k=>`<option value="${k}" ${k===s.logoKey?'selected':''}>${k}</option>`).join('')}</select></div>
    <div class="fg"><label>Mascot mashup (badge)</label><select class="ei" id="emash" onchange="schLogoPrev(${sid})"><option value="">None</option>${Object.keys(_LGO).sort().map(k=>`<option value="${k}" ${k===s.mash?'selected':''}>${k}</option>`).join('')}</select></div>
    <div class="fg"><label>Logo preview</label><div id="elk-prev">${sLogo(s,64)}</div></div>
  </div>
  <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--bd)">
    <div style="font-size:10px;color:var(--mu);letter-spacing:1px;font-weight:700;margin-bottom:6px">Custom Logo</div>
    <div style="display:flex;align-items:center;gap:10px">
      <div id="schLogoPreview" style="width:48px;height:48px;display:flex;align-items:center;justify-content:center;background:var(--s2);flex-shrink:0">${s.customLogo?`<img src="${s.customLogo}" alt="Team logo" style="width:48px;height:48px;object-fit:contain">`:'<span style="font-size:9px;color:var(--mu)">None</span>'}</div>
      <div style="flex:1">
        <label for="schLogoUpload" style="display:block;background:var(--b2);color:#fff;text-align:center;padding:5px 8px;border-radius:4px;cursor:pointer;font-family:var(--hd);font-weight:700;font-size:11px;margin-bottom:4px"> Upload Logo</label>
        <input type="file" id="schLogoUpload" accept="image/*" style="display:none" onchange="handleSchLogoUpload(this,${sid})">
        ${s.customLogo?`<button class="bgh bsm" onclick="clearSchLogo(${sid})" style="width:100%;font-size:10px">✕ Remove</button>`:''}
      </div>
    </div>
  </div>
  <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--bd)">
    <div style="font-size:10px;color:var(--mu);letter-spacing:1px;font-weight:700;margin-bottom:8px">Uniforms</div>
    <div id="sch-uni">${uniHostHtml(window._schUniT,schUniCol,sid===G.myId)}</div>
  </div>
  <div style="display:flex;gap:8px;margin-top:12px">
    <button class="btn" onclick="saveSch(${sid})">Save</button>
    <button class="bgh" onclick="clo()">Cancel</button>
  </div>`);}
window.schLogoPrev=function(sid){const s=getS(sid),el=document.getElementById('elk-prev');if(!s||!el)return;const t=Object.assign({},s,{logoKey:document.getElementById('elk').value||null,mash:document.getElementById('emash').value||null,c1:document.getElementById('ec1').value,c2:document.getElementById('ec2').value,customLogo:null});el.innerHTML=sLogo(t,64);};
window.saveSch=function(sid){const s=getS(sid);if(!s)return;{const lk=document.getElementById('elk'),mh=document.getElementById('emash');if(lk)s.logoKey=lk.value||null;if(mh)s.mash=mh.value||null;}s.name=document.getElementById('en').value||s.name;s.mascot=document.getElementById('em').value||s.mascot;s.city=document.getElementById('ec').value||s.city;s.abbr=((document.getElementById('ea').value||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,3)||s.abbr);s.c1=document.getElementById('ec1').value;s.c2=document.getElementById('ec2').value;s.offS=document.getElementById('eos').value;s.defS=document.getElementById('eds').value;if(s._pendingLogo){s.customLogo=s._pendingLogo;s._pendingLogo=null;}{const T=window._schUniT;if(T&&T.id===s.id){const u=uniClean(T.uni);if(u)s.uni=u;else delete s.uni;if(T.c3)s.c3=T.c3;}window._schUniT=null;window._uniT=null;}s.userEdited=true;clo();notify('School updated!');updateTb();if(G._page)nav(G._page,G._arg);};
window.handleSchLogoUpload=function(inp,sid){
  const file=inp.files[0];if(!file)return;
  logoShrink(file,function(d){
    const s=getS(sid);if(s)s._pendingLogo=d;
    const prev=document.getElementById('schLogoPreview');
    if(prev)prev.innerHTML=`<img src="${d}" alt="New logo preview" style="width:48px;height:48px;object-fit:cover">`;
    notify('Logo loaded: click Save to apply!');
  });
};
window.clearSchLogo=function(sid){const s=getS(sid);if(s){s.customLogo=null;s._pendingLogo=null;}notify('Custom logo removed.');};

function pgSched(){
  const hasRivalry=G.sched.some(g=>g.isRivalry);
  const hasEmpty=G.sched.some(g=>g.custom&&g._empty);
  const noGamesPlayed=!G.sched.some(g=>g.result&&g.result!=='bye');
  // Compute SOS display for the player's current schedule
  const playedOpps=G.sched.filter(g=>g.type==='regular'&&g.oppId&&!g._empty).map(g=>getS(g.oppId)).filter(Boolean);
  const sosAvg=playedOpps.length?Math.round(playedOpps.reduce((a,s)=>a+teamOvr(s.id),0)/playedOpps.length):0;
  const myOvr=Math.round((G.offR+G.defR)/2);
  const sosDiff=sosAvg-myOvr;
  const sosTierDisp=sosTierLabel(sosAvg);
  const sosLabel=sosDiff>5?`<span style="color:var(--rd);font-weight:700">Hard (avg +${sosDiff})</span>`:sosDiff<-5?`<span style="color:var(--gn);font-weight:700">Light (avg ${sosDiff})</span>`:`<span style="color:var(--gd);font-weight:700">Balanced (avg ${sosDiff>0?'+':''}${sosDiff})</span>`;
  const sosBoostDisp=Math.round((sosAvg-65)*4);
  const sosSeedDispStr=sosBoostDisp>0?`<span style="color:var(--gd);font-weight:700">+${sosBoostDisp} playoff seed pts</span>`:sosBoostDisp<0?`<span style="color:var(--rd);font-weight:700">${sosBoostDisp} playoff seed pts</span>`:`<span style="color:var(--mu)">avg playoff seeding</span>`;

  return`<div class="pnl"><div class="ph" style="justify-content:space-between">
    <span>Schedule: ${2026+(G.yr-1)} Season
      ${hasRivalry?'<span style="color:var(--gd);font-size:12px;font-weight:700;margin-left:10px"> Rivalry included</span>':''}
    </span>
    ${noGamesPlayed&&!hasEmpty?`<button class="bgh bsm" onclick="openScheduleBuilder()"> Edit Schedule</button>`:''}
    ${hasEmpty?`<button class="btn" style="padding:4px 12px;font-size:12px;background:var(--rd)" onclick="openScheduleBuilder()"> Finish Building Schedule!</button>`:''}
  </div>
  ${sosAvg>0?`<div style="padding:6px 14px;background:var(--s2);border-bottom:1px solid var(--bd);font-size:12px;display:flex;gap:16px;align-items:center;flex-wrap:wrap">
    <span style="color:${sosTierDisp.color};font-weight:700">${sosTierDisp.icon} SOS: ${sosTierDisp.label}</span>
    ${sosLabel}
    <span style="color:var(--mu);font-size:11px">Avg opp OVR: <strong style="color:var(--tx)">${sosAvg}</strong> · Your OVR: <strong style="color:var(--tx)">${myOvr}</strong></span>
    <span style="font-size:11px">${sosSeedDispStr}</span>
  </div>`:''}
    <table><thead><tr><th>Wk</th><th>Date</th><th>Type</th><th>Opponent</th><th>Class</th><th>Ovr</th><th>Result</th><th>Score</th></tr></thead>
    <tbody>${G.sched.map(g=>{
      const isReg=g.type==='regular';
      const isPl=g.type==='playoff';
      const isBye=g.type==='bye'||g.result==='bye';
      const isEmpty=g._empty;
      const isRiv=g.isRivalry||false;
      const isDiv=g.isDivision||false;
      const opp=g.oppId?getS(g.oppId):null;
      const oppCls=opp?opp.cls||G.cls:'–';
      const rowCls=isBye?'bye-wk':isPl?'ploff-wk':'';
      return`<tr class="${rowCls}${opp?' cl':''}" ${opp?`onclick="viewSchool(${opp.id})"`:''} ${isRiv?'style="background:rgba(245,192,48,.04);border-left:2px solid var(--gd)"':isEmpty?'style="opacity:.5"':''}>
        <td>${isRiv?`<strong style="color:var(--gd)">${g.wk}</strong>`:g.wk}</td>
        <td style="color:var(--mu)">${g.date||'–'}</td>
        <td>${isRiv?'<span style="font-size:10px;font-weight:900;color:var(--gd)">RIV</span>':isDiv?'<span style="font-size:10px;font-weight:700;color:var(--te)">DIV</span>':isReg&&!isEmpty?'<span style="font-size:10px;font-weight:700;color:var(--mu)">CUST</span>':isPl?'<span style="font-size:10px;font-weight:700;color:var(--gd)">PLY</span>':isEmpty?'<span style="font-size:10px;color:var(--mu)">Open</span>':'<span style="font-size:10px;font-weight:700;color:var(--mu)">BYE</span>'}</td>
        <td>${isEmpty?`<span style="color:var(--mu);font-style:italic">open slot –</span>`:opp?`<div style="display:flex;align-items:center;gap:6px">${sLogo(opp,32)} ${isRiv?`<strong style="color:var(--gd)">${opp.name} ${opp.mascot}</strong>`:opp.name+' '+opp.mascot}</div>`:isBye?`<span style="color:var(--mu)">Bye Week –</span>`:'–'}</td>
        <td>${opp?`<span style="font-family:var(--hd);font-size:11px;font-weight:700;color:${oppCls===G.cls?'var(--te)':clsNum(oppCls)>clsNum(G.cls)?'var(--rd)':'var(--gn)'}" title="${clsName(oppCls)}">${oppCls}</span>`:'–'}</td>
        <td>${opp?rb(teamOvr(opp.id)):'–'}</td>
        <td>${g.result&&g.result!=='bye'?`<strong style="color:${g.result==='W'?'var(--gn)':'var(--te)'}">${g.result}</strong>`:g.result==='bye'?'<span style="color:var(--mu)">BYE</span>':'<span style="color:var(--mu)">–</span>'}</td>
        <td>${g.result&&g.result!=='bye'?`${g.my}-${g.opp}`:'–'}</td>
      </tr>`;}).join('')}
    </tbody></table></div>`;
}

// Cross-classification view state
let _viewCls=null; // null = current game cls; set to '1A'-'5A' to view others
function allSchoolsCls(cls){
  if(!cls||cls===G.cls)return allSchools();
  // Build a flat list of all schools across divisions for a given classification
  return G.divisions.filter(div=>div.teams.some(t=>t.cls===cls||!t.cls)).flatMap(d=>d.teams);
}
function allDivisionsCls(cls){
  if(!cls||cls===G.cls)return G.divisions;
  return G.divisions;
}
// filter values: a class code, 'ALL' (all of Crestfield), 'ST:WK' / 'ST:TA' (a whole neighbor state), 'NAT' (all three states), 'INTL'
function fltClasses(v){if(v==='NAT')return[...CLS_ORDER,...XCLS_ORDER];if(!v||v==='ALL')return CLS_ORDER.slice();if(v.startsWith('ST:'))return clsOfSt(v.slice(3));return[v];}
function fltLabel(v){return v==='NAT'?`National · all ${ST_ORDER.length} states`:v==='ALL'?`All ${CF_NAME} classifications`:v.startsWith('ST:')?`All ${stName(v.slice(3))} classifications`:clsName(v);}
function fltSchoolIds(v){const ids=new Set();for(const c of fltClasses(v))for(const d of divisionsForCls(c))for(const t of d.teams)ids.add(t.id);return ids;}
function clsFilterBar(activeCls,onclickFn,label,noIntl){
  const v=activeCls||G.cls,stK=v==='NAT'||v==='INTL'?null:v==='ALL'?'CF':v.startsWith('ST:')?v.slice(3):clsSt(v);
  const b=(x,l,on)=>`<button onclick="${onclickFn}('${x}')" style="background:${on?'var(--ac)':'var(--s2)'};border:1px solid ${on?'var(--ac)':'var(--bd)'};color:${on?'var(--tOn,#fff)':'var(--tx)'};padding:3px 11px;border-radius:4px;cursor:pointer;font-family:var(--hd);font-weight:700;font-size:12px;">${l}</button>`;
  const lab=t=>`<span style="font-size:10px;color:var(--mu);letter-spacing:1px;font-weight:700;margin-right:4px;min-width:44px">${t}</span>`;
  const states=ST_ORDER.map(k=>[k==='CF'?'ALL':'ST:'+k,stName(k),k]);
  // many states: one dropdown instead of a wall of buttons
  let h=states.length>6?`<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;align-items:center;">${lab('State')}<select onchange="${onclickFn}(this.value)" style="padding:5px 8px;border-radius:4px;max-width:100%">${states.map(([x,l,k])=>`<option value="${x}"${stK===k?' selected':''}>${l}${k==='CF'?' (home)':XST[k]&&XST[k].lite?' (light)':''}</option>`).join('')}<option value="NAT"${v==='NAT'?' selected':''}>National (every state)</option>${!noIntl&&G.allLeagues&&G.allLeagues.INTL?`<option value="INTL"${v==='INTL'?' selected':''}>International</option>`:''}</select></div>`
    :`<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:6px;align-items:center;">${lab('State')}${states.map(([x,l,k])=>b(x,l,stK===k)).join('')}${b('NAT','National',v==='NAT')}${!noIntl&&G.allLeagues&&G.allLeagues.INTL?b('INTL','International',v==='INTL'):''}</div>`;
  if(stK){const cl=clsOfSt(stK),all=stK==='CF'?'ALL':'ST:'+stK;
    h+=`<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:12px;align-items:center;">${lab(label||'Class')}${b(all,'ALL',v===all)}${cl.map(c=>b(c,(clsL(c))+(c===G.cls?' ★':''),v===c)).join('')}</div>`;}
  else h+='<div style="margin-bottom:10px"></div>';
  return h;
}

let _standCls=null; // null = use G.cls
window._setStandCls=function(cls){_standCls=(cls==='ALL'?'ALL':cls);nav('stand');};

function pgStand(){
  const activeCls=_standCls||G.cls;

  // Build list of (cls, divisions) pairs to render
  const clsesToShow = fltClasses(activeCls);

  let html = clsFilterBar(activeCls,'_setStandCls','View Standings');

  for(const cls of clsesToShow){
    const divs=divisionsForCls(cls);
    if(!divs.length) continue;

    // Section header for ALL mode
    if(clsesToShow.length>1){
      const isMyCls=cls===G.cls;
      html+=`<div style="font-family:var(--hd);font-size:16px;font-weight:900;color:${isMyCls?'var(--te)':'var(--te)'};margin:18px 0 6px;padding-bottom:4px;border-bottom:2px solid var(--bd);">${clsName(cls)} ${isMyCls?'<span style="font-size:11px;font-weight:700;color:var(--te)">Your class</span>':''}</div>`;
    }

    for(const div of divs){
      const isMyDiv=div.teams.some(t=>t.id===G.myId);
      const sorted=[...div.teams].sort((a,b)=>{const aw=a.wins/(a.wins+a.losses+.001),bw=b.wins/(b.wins+b.losses+.001);return bw-aw||b.wins-a.wins;});
      html+=`<div class="pnl" style="margin-bottom:14px"><div class="ph">${div.name} <span style="font-size:10px;font-weight:600;color:var(--te)">[${XCLS[cls]?clsName(cls):cls}]</span> ${isMyDiv?'<span style="color:var(--te);font-size:11px">Your division</span>':''}</div>
        <table><thead><tr><th>#</th><th>School</th><th>W</th><th>L</th><th>Win%</th><th>Ovr</th><th>Scheme</th></tr></thead>
        <tbody>${sorted.map((s,i)=>{const isMe=s.id===G.myId;const w=s.wins,l=s.losses;const wp=w+l>0?(w/(w+l)*100).toFixed(0)+'%':'–';
          return`<tr class="cl" onclick="viewSchool(${s.id})" ${isMe?'style="background:rgba(204,34,34,.07)"':''}>
            <td style="color:var(--mu)">${i+1}</td>
            <td><div style="display:flex;align-items:center;gap:6px">${sLogo(s,32)}<span>${isMe?'<strong>':''}${s.name} ${s.mascot}${isMe?'</strong>':''}</span>${isMe?'<span style="color:var(--te);font-size:10px">You</span>':''}</div></td>
            <td style="color:var(--gn)">${w}</td><td style="color:var(--te)">${l}</td>
            <td>${wp}</td><td>${rb(teamOvr(s.id))}</td>
            <td style="font-size:11px;color:var(--mu)">${s.offS}/${s.defS}</td>
          </tr>`;}).join('')}
        </tbody></table></div>`;
    }
  }
  return html;
}

function pgPlayoff(){
  const pl=G.playoff;const curYear=2026+(G.yr-1);
  if(!pl)return`<div class="pnl"><div class="ph"> State Playoffs, ${curYear}</div><div class="pb"><div style="color:var(--mu)">Playoffs start after the regular season. Top 16 teams by win% qualify. Complete your schedule first.</div></div></div>`;
  const field=pl.field||[];
  return`<div class="pnl"><div class="ph"> State Playoffs, ${curYear} ${pl.stateChamp?'<span style="color:var(--gd)"> State champs!</span>':''}</div><div class="pb">
    <div style="font-size:12px;color:var(--mu);margin-bottom:10px">Top 16 qualifiers from ${clsL(G.cls)} classification:</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px">${field.map((sid,i)=>{const s=getS(sid);if(!s)return'';const isMe=sid===G.myId;const elim=pl.rounds&&pl.rounds.some(r=>r.results&&r.results.find(res=>res.loser===sid));return`<div style="background:${isMe?'rgba(204,34,34,.1)':'var(--s2)'};border:1px solid ${isMe?'var(--ac)':elim?'var(--bd)':'var(--bd)'};border-radius:5px;padding:5px 10px;display:flex;align-items:center;gap:5px;opacity:${elim&&!isMe?.5:1}"><span style="color:var(--mu);font-size:10px">#${i+1}</span>${sLogo(s,29)}<span style="font-size:12px;font-weight:${isMe?700:400}">${s.name}</span></div>`;}).join('')}
    </div>
    ${pl.rounds&&pl.rounds.length?pl.rounds.map(r=>{
      const roundName=poRoundName(r.round)||`Round ${r.round}`;
      return`<div style="background:var(--s2);border:1px solid var(--bd);border-radius:5px;padding:10px;margin-bottom:8px">
        <div style="font-family:var(--hd);font-size:13px;font-weight:800;color:var(--te);margin-bottom:6px;">${roundName}</div>
        <table style="font-size:12px"><tbody>${r.results.map(res=>{
          const a=getS(res.a),b=res.b?getS(res.b):null;const w=getS(res.winner);
          const isMyGame=res.a===G.myId||res.b===G.myId;
          return`<tr><td style="padding:3px 8px">${a?`${sLogo(a,26)} ${a.name}`:''}</td>
            <td style="padding:3px 8px;font-weight:700;color:${res.winner===res.a?'var(--gn)':'var(--mu)'}">${res.b?(res.winner===res.a?res.wScore:res.lScore):''}</td>
            <td style="padding:3px 8px;color:var(--mu)">vs</td>
            <td style="padding:3px 8px">${b?`${sLogo(b,26)} ${b.name}`:'-'}</td>
            <td style="padding:3px 8px;font-weight:700;color:${res.winner===res.b?'var(--gn)':'var(--mu)'}">${res.b?(res.winner===res.b?res.wScore:res.lScore):''}</td>
            ${isMyGame?`<td style="padding:3px 8px;color:${res.winner===G.myId?'var(--gn)':'var(--ac);font-weight:700'}">${res.winner===G.myId?'✓ WIN':' Loss'}</td>`:''}</tr>`;
        }).join('')}</tbody></table>
      </div>`;
    }).join(''):''}
    ${pl.myElim&&!pl.stateChamp?`<div style="background:rgba(204,34,34,.1);border:1px solid var(--ac);border-radius:5px;padding:10px;font-size:13px;color:var(--te)">Your team was eliminated from the playoffs. Better luck next season.</div>`:''}
  </div></div>`;
}

let _teamsCls=null;
window._setTeamsCls=function(cls){_teamsCls=(cls==='ALL'?'ALL':cls);nav('teams');};

function pgTeams(){
  const activeCls=_teamsCls||G.cls;
  let teams=fltClasses(activeCls).flatMap(c=>divisionsForCls(c).flatMap(d=>d.teams));
  if(!teams.length)teams=allSchools(); // fallback
  return clsFilterBar(activeCls,'_setTeamsCls','View Class')
  +`<div style="margin-bottom:10px;font-family:var(--hd);font-size:18px;font-weight:900;">All Teams: ${fltLabel(activeCls)} <span style="font-size:13px;color:var(--mu);font-weight:400">${teams.length} teams</span></div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:9px">
    ${teams.sort((a,b)=>teamOvr(b.id)-teamOvr(a.id)).map(s=>{const isMe=s.id===G.myId;const sCls=s.cls||G.cls;return`
    <div class="pbr" onclick="viewSchool(${s.id})" style="${isMe?'border-color:var(--ac);':''}">
      ${sLogo(s,40)}<div style="font-family:var(--hd);font-size:11px;font-weight:800;line-height:1.2">${s.name}</div>
      <div style="font-size:10px;color:var(--mu)">${s.mascot}</div>
      <div style="font-size:10px;font-weight:700;color:var(--te)">${XCLS[sCls]?clsName(sCls):sCls}</div>
      <div>${recStr(s.wins,s.losses)}</div><div>${rb(teamOvr(s.id))}</div>
      <div style="font-size:10px;color:var(--mu)">${s.lite?`light state · ${sPlayers(s.id).length} prospect${sPlayers(s.id).length===1?'':'s'}`:`${sPlayers(s.id).length} players`}</div>
      ${isMe?'<div style="font-size:10px;color:var(--te);font-weight:700">You</div>':''}
    </div>`;}).join('')}
  </div>`;
}

let _ls='passYds',_lp='ALL',_leadsCls=null;
window._setLeadsCls=function(cls){_leadsCls=(cls==='ALL'?'ALL':cls);nav('leads');};
function pgLeads(){
  window._setLS=(s)=>{_ls=s;nav('leads');};window._setLP=(p)=>{_lp=p;nav('leads');};
  const activeCls=_leadsCls||G.cls;
  const sdefs=[{k:'rat',l:'Overall'},{k:'stars',l:'Stars'},{k:'passYds',l:'Pass Yds'},{k:'passTD',l:'Pass TD'},{k:'rushYds',l:'Rush Yds'},{k:'rushTD',l:'Rush TD'},{k:'recYds',l:'Rec Yds'},{k:'recTD',l:'Rec TD'},{k:'cmpPct',l:'Cmp %'},{k:'ypc',l:'Yds/Carry'},{k:'ypr',l:'Yds/Catch'},{k:'krYds',l:'KR Yds'},{k:'krAvg',l:'KR Avg'},{k:'dropPct',l:'Drop %'},{k:'tackles',l:'Tackles'},{k:'sacks',l:'Sacks'},{k:'ints',l:'INTs'},{k:'pbu',l:'PBU'},{k:'ypgA',l:'Yds Allowed/G'},{k:'pancakes',l:'Pancakes'},{k:'sacksA',l:'Sacks Allowed'},{k:'gpa',l:'GPA'},{k:'spd',l:'Speed'},{k:'str',l:'Str'},{k:'awr',l:'Awr'}];
  const RATE={cmpPct:[s=>s.passAtt?s.passCmp/s.passAtt:null,s=>(s.passAtt||0)>=8*Math.max(1,s.gp||0)*0.6],ypc:[s=>s.rushAtt?s.rushYds/s.rushAtt:null,s=>(s.rushAtt||0)>=Math.max(10,(s.gp||0)*6)],
    ypr:[s=>s.rec?s.recYds/s.rec:null,s=>(s.rec||0)>=Math.max(5,(s.gp||0)*1.5)],krAvg:[s=>s.krRet?s.krYds/s.krRet:null,s=>(s.krRet||0)>=Math.max(4,(s.gp||0)*1)],
    dropPct:[s=>stEff(s).drop,s=>((s.rec||0)+(s.drops||0))>=Math.max(8,(s.gp||0)*2),1],ypgA:[s=>stEff(s).ypgA,s=>(s.gp||0)>=3&&(s.tgtA||0)>=(s.gp||0)*2,1]};
  const ASC=new Set(['dropPct','ypgA','sacksA']);
  const isRate=!!RATE[_ls];
  const isStat=isRate||['passYds','passTD','passInt','rushYds','rushTD','recYds','recTD','krYds','krTD','tackles','sacks','ints','pbu','pancakes','sacksA'].includes(_ls);
  const sv=p=>{const s=p.seasStats||{};return isRate?(RATE[_ls][1](s)?RATE[_ls][0](s):null):(s[_ls]||0);};

  // Build player pool from correct league
  const _lIds=fltSchoolIds(activeCls);
  let allPl=G.players.filter(p=>!p.onJV&&_lIds.has(p.sId));

  if(_lp!=='ALL')allPl=allPl.filter(p=>_lp==='DEF'?['DL','LB','CB','S'].includes(p.pos):p.pos===_lp);
  let sorted;
  if(isStat){sorted=allPl.filter(p=>(p.seasStats?.gp||0)>0&&(!isRate||sv(p)!=null)&&(_ls!=='sacksA'||(p.pos==='OL'&&(p.seasStats?.gp||0)>=3))).sort((a,b)=>ASC.has(_ls)?sv(a)-sv(b):sv(b)-sv(a));}
  else sorted=allPl.sort((a,b)=>(b[_ls]||0)-(a[_ls]||0));

  return clsFilterBar(activeCls,'_setLeadsCls','View Class')
  +`<div class="pnl"><div class="ph">${activeCls==='NAT'?'National Statistics':'League Leaders'}, ${2026+(G.yr-1)} Season <span style="font-size:11px;font-weight:400;color:var(--mu)">${fltLabel(activeCls)}</span></div>
    <div class="pb"><div class="pfl">${sdefs.map(s=>`<button class="pfb ${_ls===s.k?'on':''}" onclick="_setLS('${s.k}')">${s.l}</button>`).join('')}</div>
    <div class="pfl">${['ALL',...POS,'DEF'].map(p=>`<button class="pfb ${_lp===p?'on':''}" onclick="_setLP('${p}')">${p}</button>`).join('')}</div>
  </div>
  <div style="overflow-x:auto"><table><thead><tr><th>#</th><th>Name</th><th>School</th><th>Class</th><th>Pos</th><th>Yr</th><th>Rat</th><th>Dev</th><th>Stars</th><th>GPA</th><th>Offers</th><th>${sdefs.find(s=>s.k===_ls)?.l||_ls}</th></tr></thead>
  <tbody>${sorted.slice(0,50).map((p,i)=>{const sch=getS(p.sId);const sCls=sch?sch.cls||G.cls:'?';const val=isStat?sv(p):(p[_ls]||0);const isMe=p.sId===G.myId;
    return`<tr class="cl" onclick="showPlayer(${p.id})" ${isMe?'style="background:rgba(204,34,34,.05)"':''}>
      <td style="color:var(--mu)">${i+1}</td><td><div style="display:flex;align-items:center;gap:6px">${face(p.fs,24)}${isMe?'<strong>':''}${p.fn} ${p.ln}${isMe?'</strong>':''}</div></td>
      <td><div style="display:flex;align-items:center;gap:4px">${sLogo(sch,26)} <span style="font-size:11px">${sch?sch.name:'?'}</span></div></td>
      <td><span style="font-family:var(--hd);font-size:11px;font-weight:700;color:var(--te)" title="${clsName(sCls)}">${sCls}</span></td>
      <td><span class="pb2">${p.pos}</span></td><td>${yrL(p.yr)}</td>
      <td>${rb(p.rat)}</td><td>${devB(p.dev)}</td><td>${stars(p.stars)}</td><td>${gpaL(p.gpa)}</td>
      <td style="font-size:11px">${p.offers.length>0?p.offers.slice(0,2).map(o=>ofB(o)).join('')+(p.offers.length>2?`<span style="color:var(--mu)"> +${p.offers.length-2}</span>`:''):'–'}</td>
      <td style="font-weight:700;color:var(--te)">${_ls==='gpa'?val.toFixed(1):_ls==='stars'?stars(val):(_ls==='cmpPct'||_ls==='dropPct')?fmtPct(val):isRate?fmtAvg(val):val}</td>
    </tr>`;}).join('')}
  </tbody></table></div></div>`;
}

window._recrTab='mine';window.recrTab=function(t){window._recrTab=t;nav('recr');};
function pgRecr(){
  const tabs=`<div style="display:flex;gap:6px;margin-bottom:12px">${[['mine','Your recruits'],['col','College classes']].map(([k,l])=>`<button onclick="recrTab('${k}')" style="background:${_recrTab===k?'var(--ac)':'var(--s2)'};border:1px solid ${_recrTab===k?'var(--ac)':'var(--bd)'};color:${_recrTab===k?'var(--tOn,#fff)':'var(--tx)'};border-radius:6px;padding:5px 14px;cursor:pointer;font-weight:800;font-family:var(--hd);letter-spacing:.03em">${l}</button>`).join('')}</div>`;
  if(_recrTab==='col')return tabs+pgColleges();
  return tabs+_pgRecrMine();
}
function _pgRecrMine(){
  G.campInv=(G.campInv||[]).filter(v=>{const p=getP(v.pid);return p&&!p.committed&&!p.grad&&p.sId===G.myId&&v.yr===G.yr;});
  const cap=campCap(),seniors=myP().filter(p=>p.yr===12).sort((a,b)=>b.stars-a.stars||b.rat-a.rat),juniors=myP().filter(p=>p.yr===11).sort((a,b)=>b.stars-a.stars||b.rat-a.rat),soph=myP().filter(p=>p.yr===10&&(p.stars>=2||p.offers.length)).sort((a,b)=>b.stars-a.stars||b.rat-a.rat);
  const rg=(pl,lbl)=>{if(!pl.length)return'';
    return`<div class="pnl" style="margin-bottom:14px"><div class="ph">${lbl}</div>
      <div style="overflow-x:auto"><table><thead><tr><th>Name</th><th>Pos</th><th>Rat</th><th>Dev</th><th>Stars</th><th>Size</th><th>GPA</th><th>Camps</th><th>Committed</th><th>Offers</th></tr></thead>
      <tbody>${pl.map(p=>{const sf=sizeFit(p);return`<tr class="cl" onclick="showPlayer(${p.id})">
        <td>${p.fn} ${p.ln}</td><td><span class="pb2">${p.pos}</span></td>
        <td>${rb(p.rat)}</td><td>${devB(p.dev)}</td><td>${stars(p.stars)}</td><td style="font-size:11px;color:${sf>0.6?'var(--gn)':sf<-0.6?'var(--rd)':'var(--mu)'}">${Math.floor((p.ht||70)/12)}'${(p.ht||70)%12}" ${p.wt||''}</td><td>${gpaL(p.gpa)}</td>
        <td style="font-size:12px">${campsUsed(p)}/${cap}</td>
        <td>${p.committed?ofB(p.committed):'<span style="color:var(--mu)">–</span>'}</td>
        <td style="max-width:220px">${p.offers.slice().sort((a,b)=>colPr(b)-colPr(a)).slice(0,3).map(o=>ofB(o)).join('')}${p.offers.length>3?`<span style="color:var(--mu);font-size:10px">+${p.offers.length-3}</span>`:''}</td>
      </tr>`;}).join('')}</tbody></table></div></div>`;};
  const inv=G.campInv.slice().sort((a,b)=>b.camp.pr-a.camp.pr);
  const invHtml=inv.length?inv.map(v=>{const p=getP(v.pid),used=campsUsed(p)>=cap;return`<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:8px 0;border-top:1px solid var(--bd)">
      ${face(p.fs,36)}<div style="flex:1 1 220px;min-width:0"><div style="font-weight:800">${v.camp.name} <span style="font-size:11px;color:var(--mu)">${v.camp.lvl}</span></div>
      <div style="font-size:12px"><span class="pb2">${p.pos}</span> ${p.fn} ${p.ln} ${stars(p.stars)} · ${p.rat} OVR</div>
      <div style="font-size:11px;color:var(--mu)">Watching: ${v.camp.schools.map(s=>s.school).join(', ')}</div></div>
      <button class="btn bsm bgn" ${used||p.committed?'disabled style="opacity:.45"':''} onclick="campAttend('${v.id}')">${used?'No camps left':'Attend'}</button><button class="bgh bsm" onclick="campDecline('${v.id}')">Decline</button></div>`;}).join(''):'<div style="font-size:13px;color:var(--mu)">No invites right now. Players earn invites with good games, stars, the right size for their position and steady performances. Bigger classifications and a more prestigious program get noticed more.</div>';
  const hostHtml=`<div class="pnl" style="margin-bottom:14px"><div class="ph">Showcase your players</div><div class="pb" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
    <div style="flex:1 1 260px;font-size:13px;color:var(--mu)">Host your own combine and invite college staffs to test your players, or invite coaches to watch your next game. Big performances in front of them can earn offers.</div>
    <button class="btn" ${combineAvail()?'':'disabled style="opacity:.5"'} onclick="combineOpen()">${combineAvail()?'Host a combine':'Combine hosted this year'}</button><button class="bgh" onclick="gameInviteOpen()">Invite coaches to a game${G.gameInv&&G.gameInv.yr===G.yr?` (Week ${G.gameInv.wk} set)`:''}</button></div></div>`;
  return hostHtml+ncampHtml()+`<div class="pnl" style="margin-bottom:14px"><div class="ph">Camp invites <span style="font-size:12px;color:var(--mu);font-weight:600">${cap} camp${cap>1?'s':''} per player this year (1 per star of program prestige)</span></div><div class="pb">
    ${invHtml}
    <div style="font-size:11px;color:var(--mu);margin-top:8px">Each camp has several colleges watching. A strong showing can earn offers from any of them and raise his stars; a bad day can cost him. Stars are driven mostly by overall rating and development trait, with a little from stats, size and camps.</div></div></div>
  ${rg(seniors,' Seniors: Signing Class')}
  ${rg(juniors,' Juniors: Early Eval')}
  ${rg(soph,' Sophomores on the radar')}`;
}

