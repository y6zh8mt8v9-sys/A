// ═══════════ POPUPS ═══════════
function bAwardPop(award, winner, runnerUp, cls, isMyPlayer, winnerSnap, ruSnap, label){
  const DEV_C2={'Elite Dev':'dev-e','Star':'dev-s','Impact':'dev-i','Normal':'dev-n'};
  const isMr=award==='mr';
  const awardName=label||(isMr?`Mr. Football (${clsL(cls)})`:`Freshman of the Year (${clsL(cls)})`);
  const awardIcon=isMr?'':'★';
  const borderColor=isMr?'var(--gd)':'var(--b2)';
  const accentColor=isMr?'var(--gd)':'var(--b2)';

  // Stat summary for a player, uses provided snapshot if available (AI players reset their seasStats)
  function statLine(p, snap){
    const s=snap||p.seasStats;const gp=s.gp||1;
    const e=stEff(s);
    if(p.pos==='QB')return`${s.passYds||0} Pass Yds${e.cmp!=null?' ('+fmtPct(e.cmp)+')':''}, ${s.passTD||0} TD, ${s.passInt||0} INT, ${s.rushYds||0} Rush Yds`;
    if(p.pos==='RB')return`${s.rushYds||0} Rush Yds${e.ypc!=null?' ('+fmtAvg(e.ypc)+' ypc)':''}, ${s.rushTD||0} TD, ${s.recYds||0} Rec Yds`;
    if(['WR','TE'].includes(p.pos))return`${s.recYds||0} Rec Yds${e.ypr!=null?' ('+fmtAvg(e.ypr)+' per catch)':''}, ${s.recTD||0} TD`;
    if(['LB','DL'].includes(p.pos))return`${s.tackles||0} Tackles, ${s.sacks||0} Sacks`;
    if(['CB','S'].includes(p.pos))return`${s.tackles||0} Tackles, ${s.ints||0} INTs`;
    if(p.pos==='OL')return`${s.pancakes||0} Pancakes, ${s.sacksA||0} sacks allowed`;
    if(p.pos==='K')return`${s.fgm||0}/${s.fga||0} FG, ${s.xpm||0}/${s.xpa||0} XP`;
    return`Rating: ${p.rat}`;
  }

  const winnerSch=getS(winner.sId);
  const ruSch=runnerUp?getS(runnerUp.sId):null;

  return`<div class="pc" style="border-top-color:${borderColor};text-align:left">
    <div style="text-align:center;margin-bottom:14px">
      <div style="font-size:36px;margin-bottom:4px">${awardIcon}</div>
      <h3 style="color:${accentColor}">${awardName}</h3>
      <div style="font-size:11px;color:var(--mu);margin-top:2px">${2026+(G.yr-1)} Season Award</div>
    </div>

    <div style="background:${isMyPlayer?'rgba(245,192,48,.07)':'var(--s2)'};border:${isMyPlayer?`2px solid ${borderColor}`:'1px solid var(--bd)'};border-radius:8px;padding:12px 14px;margin-bottom:12px">
      <div style="font-size:10px;font-family:var(--hd);font-weight:800;color:${accentColor};margin-bottom:8px">Winner</div>
      <div style="display:flex;align-items:center;gap:12px">
        ${face(winner.fs,52)}
        <div style="flex:1">
          <div style="font-family:var(--hd);font-size:19px;font-weight:900">${winner.fn} ${winner.ln}</div>
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:3px">
            <span class="pb2">${winner.pos}</span>${yrL(winner.yr)}${rb(winner.rat)}${devB(winner.dev)}
          </div>
          <div style="font-size:11px;color:var(--mu);margin-top:4px">${winnerSch?`${sLogo(winnerSch,22)} ${winnerSch.name} ${winnerSch.mascot}`:''}</div>
          <div style="font-size:11px;color:var(--tx);margin-top:4px">${statLine(winner,winnerSnap)}</div>
        </div>
      </div>
      ${isMyPlayer?`<div style="margin-top:10px;text-align:center;font-size:12px;color:${accentColor};font-weight:700">★ Your player won the award!</div>`:''}
    </div>

    ${runnerUp?`<div style="background:var(--s2);border:1px solid var(--bd);border-radius:6px;padding:10px 12px">
      <div style="font-size:10px;font-family:var(--hd);font-weight:800;color:var(--mu);margin-bottom:6px">Runner-Up</div>
      <div style="display:flex;align-items:center;gap:10px">
        ${face(runnerUp.fs,36)}
        <div>
          <div style="font-weight:700;font-size:13px">${runnerUp.fn} ${runnerUp.ln}</div>
          <div style="display:flex;gap:5px;align-items:center;margin-top:2px">
            <span class="pb2" style="font-size:10px">${runnerUp.pos}</span>${yrL(runnerUp.yr)}${rb(runnerUp.rat)}
          </div>
          <div style="font-size:11px;color:var(--mu);margin-top:2px">${ruSch?`${ruSch.name} ${ruSch.mascot}`:''} | ${statLine(runnerUp,ruSnap)}</div>
        </div>
      </div>
    </div>`:''}
  </div>`;
}
function bSenPop(p){let msg='';if(p.committed){const e={FBS:'',FCS:'',D2:'',D3:'',JUCO:''}[p.committed.lvl]||'';msg=`${e} <strong>${p.fn} ${p.ln}</strong> → <strong style="color:var(--te)">${p.committed.school}</strong> (${p.committed.lvl})`;}else msg=`<strong>${p.fn} ${p.ln}</strong> (${p.pos}) will not play college football.`;return`<div class="pc"><h3>Signing Day</h3><div style="margin:10px 0">${face(p.fs,56)}</div><div>${stars(p.stars)} ${rb(p.rat)}</div><div style="margin-top:10px;font-size:13px;line-height:1.6">${msg}</div>${p.offers.length?`<div style="margin-top:8px;font-size:11px;color:var(--mu)">${p.offers.length} total offer(s)</div>`:''}</div>`;}
function bFrPop(p){const jvNote=p.onJV&&!pcAuto()?'<div style="margin-top:6px;background:#0a1a30;border:1px solid #336;border-radius:3px;padding:4px 8px;font-size:11px;color:#88ccff">Starting on <strong>JV Team</strong>: call up to Varsity anytime</div>':'';return`<div class="pc"><h3>New Freshman!</h3><div style="margin:10px 0">${face(p.fs,56)}</div><div style="font-family:var(--hd);font-size:18px;font-weight:800">${p.fn} ${p.ln}</div><div style="margin:6px 0">${stars(p.stars)} <span class="pb2">${p.pos}</span> ${rb(p.rat)} → <span style="color:var(--gn)">${p.potLo||p.pot}</span>–<span style="color:var(--pot,#f0b429)">${p.potHi||p.pot}</span> pot</div><div>${devB(p.dev)} ${(p.traits||[]).map(t=>trB(t)).join('')}</div><div style="margin-top:6px;font-size:12px;color:var(--mu)">GPA: ${gpaL(p.gpa)} | ${htf(p.ht)}, ${p.wt} lbs</div><div style="margin-top:6px">${interestBadges(p.interests)}</div>${jvNote}</div>`;}
function bTrPop(p){return`<div class="pc" style="border-top-color:var(--te)"><h3 style="color:var(--te)">Transfer!</h3><div style="margin:10px 0">${face(p.fs,56)}</div><div style="font-family:var(--hd);font-size:18px;font-weight:800">${p.fn} ${p.ln}</div><div style="margin:6px 0">${yrL(p.yr)} <span class="pb2">${p.pos}</span> ${rb(p.rat)}</div><div>${devB(p.dev)}</div></div>`;}
function showPop(){if(_popI>=_popQ.length){document.getElementById('pu').classList.remove('open');if(_popCb){const cb=_popCb;_popCb=null;cb();}return;}document.getElementById('pui').innerHTML=_popQ[_popI];document.getElementById('pun').textContent=_popI<_popQ.length-1?`Continue (${_popI+1}/${_popQ.length}) →`:'Done ✓';document.getElementById('pu').classList.add('open');}
function nxp(){_popI++;if(_popI>=_popQ.length){document.getElementById('pu').classList.remove('open');_popQ=[];if(_popCb){const cb=_popCb;_popCb=null;cb();}}else{showPop();}}

// ═══════════ NAVIGATION ═══════════
const NL={social:'Huddle',college:'College',mine:'My Player',dash:'Dashboard',news:'News',roster:'Roster',depth:'Depth Chart',training:'Training',staff:'Staff & Playbook',cust:'Customize',sched:'Schedule',stand:'Standings',rank:'Rankings',playoff:'Playoffs',teams:'Teams',leads:'Leaders',media:'Media',recr:'Recruiting',watch:'Watchlist',hof:'Hall of Fame',advisor:'Assistant GM',hist:'History & Records',jv:'JV Team',recls:'Reclassification'};
// v2.14 two-level navigation
const NAV_GROUPS=[['home','Home','M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',['dash','mine','social','college','news']],
  ['team','Team','M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 20c0-3 3-5 6-5s6 2 6 5M14 15c3 0 8 1 8 5',['roster','depth','jv','recr','scout','training','staff','cust']],
  ['season','Season','M4 5h16v15H4zM4 9h16M8 3v4M16 3v4M8 13h3M8 16h6',['sched','stand','rank','playoff']],
  ['league','League','M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4',['teams','leads','media']],
  ['program','Program','M12 3l2.6 5.6 6.1.7-4.6 4.1 1.3 6L12 16.4 6.6 19.4l1.3-6L3.3 9.3l6.1-.7z',['advisor','watch','hof','trophy','hist','recls']]];
function navGroupOf(pg){for(const g of NAV_GROUPS)if(g[3].includes(pg))return g[0];return'home';}
function navInit(){
  const bar=document.getElementById('nav-bar'),pr=document.getElementById('nav-prim');if(!bar||!pr||pr.dataset.ok)return;pr.dataset.ok='1';
  bar.querySelectorAll('.nav-group').forEach(gr=>{const b=gr.querySelector('.nb[id^="nb-"]');const pg=b?b.id.slice(3):null;gr.dataset.g=pg?navGroupOf(pg):'util';});
  if(!bar.querySelector('.nb-home')){const hb=document.createElement('button');hb.className='nb nb-home';hb.textContent='\u2039 Home';hb.title='Dashboard';hb.onclick=()=>nav('dash');const st=document.getElementById('nav-team-strip');bar.insertBefore(hb,st?st.nextSibling:bar.firstChild);}
  pr.innerHTML=NAV_GROUPS.map(([k,l,ic])=>`<button class="np" id="np-${k}" role="tab" onclick="navGo('${k}')"><svg viewBox="0 0 24 24"><path d="${ic}"/></svg><span>${l}</span><i></i></button>`).join('');
}
function navGo(k){const g=NAV_GROUPS.find(x=>x[0]===k);if(!g)return;const last=(G.navLast||{})[k],P=g[3].filter(pg=>!pcHidePg(pg));nav(last&&P.includes(last)&&(last!=='mine'||G.myPlayerId!=null)?last:P[0]||'dash');}
function navSync(page){
  try{navInit();const g=navGroupOf(page);document.body.dataset.navg=g;(G.navLast||(G.navLast={}))[g]=page;
    for(const[k,,,P]of NAV_GROUPS){const b=document.getElementById('np-'+k);if(b){b.classList.toggle('on',k===g);b.style.display=P.every(pcHidePg)?'none':'';}}
    const vis=id=>{const e=document.getElementById(id);return!!(e&&e.style.display!=='none');};
    const h=document.getElementById('np-home');if(h)h.classList.toggle('dot',vis('news-badge'));const pg=document.getElementById('np-program');if(pg)pg.classList.toggle('dot',vis('adv-badge')&&!pcHidePg('advisor'));
    {const c=gdsMain().cnav!==false;document.body.classList.toggle('cnav',c);document.body.classList.toggle('cnav-dash',c&&page==='dash');
     const T=cnavTodo();document.querySelectorAll('#nav-bar .nb[id^="nb-"]').forEach(b=>{const k=b.id.slice(3);b.classList.toggle('todo',!!T[k]&&k!=='news');});}
    // after the frame's layout, so a page change lays out once instead of forcing it here
    requestAnimationFrame(()=>{try{const on=document.querySelector('#nav-bar .nb.on');if(on&&on.scrollIntoView)on.scrollIntoView({block:'nearest',inline:'center'});}catch(e){}});}catch(e){}
}
// ── tile dashboard (compact menu): a club bar with Continue, a status strip, then tiles that open their page ──
function dtOD(sid){const t=getS(sid);if(t&&t.lite){const v=t.str||50;return[v,v,v];}
  if(sid===G.myId)return[G.offR,G.defR,Math.round((G.offR+G.defR)/2)];
  const st=getStarters(sid),av=a=>a.length?Math.round(a.reduce((x,p)=>x+p.rat,0)/a.length):50;
  return[av(st.filter(p=>['QB','RB','WR','TE','OL'].includes(p.pos))),av(st.filter(p=>['DL','LB','CB','S'].includes(p.pos))),teamOvr(sid)];}
function dtChips(r){return`<div class="dt-chips"><span>OFF: <b>${r[0]}</b></span><span>DEF: <b>${r[1]}</b></span><span>OVR: <b>${r[2]}</b></span></div>`;}
function dtTile(title,go,body,cls){return`<div class="dt${cls?' '+cls:''}" role="button" tabindex="0" onclick="${go}"><div class="dt-h"><span>${title}</span><svg viewBox="0 0 24 24"><path d="M5 5l7 7-7 7M12 5l7 7-7 7"/></svg></div><div class="dt-b">${body}</div></div>`;}
window.dtMenu=function(){openMo(`<h2>Menu</h2>${cnavHub(true)}<div style="text-align:right"><button class="bgh" onclick="clo()">Close</button></div>`);};
// two teams side by side in their own colors, meeting at a slanted seam
function vsStrip(a,b,subA,subB){const h=(s,sub,i)=>{const c=_hx(s.c1)?s.c1:'#33415c';return`<div class="vs-h${i?' vs-b':''}" style="background:${c};color:${_lm(c)>.55?'#111113':'#fff'}">${sLogo(s,44)}<div><b>${s.mascot}</b><small>${sub}</small></div></div>`;};
  return`<div class="vs">${h(a,subA,0)}<span class="vs-x">vs</span>${h(b,subB,1)}</div>`;}
function dashTiles(o){
  const{ms,pl,nextUnplayed,no,playoffSlot,playoffOpp,actionBtn,curYear,phaseLabel,newsItems}=o,T=cnavTodo(),dot=k=>T[k]?'<i class="dt-dot"></i>':'';
  const opp=no||playoffOpp,ng=no?nextUnplayed:playoffOpp?playoffSlot:null;
  // next game
  let nb;if(opp){const r=dtOD(opp.id),lbl=no?(ng.isRivalry?'Rivalry week':'Week '+ng.wk)+(ng.date?' · '+ng.date:''):(poRoundName(ng.playoffRound)||ng.label||'Playoffs');
    nb=`<div class="dt-sub">${lbl}</div>${vsStrip(ms,opp,`${G.wins}-${G.losses}`,`${opp.wins||0}-${opp.losses||0} · ${clsL(opp.cls)}`)}<div class="dt-big">${opp.name} ${opp.mascot}</div>${no&&ng.isRivalry?rivalryWeekHtml(opp):''}${dtChips(r)}<div class="dt-stars">${stars(Math.round(opp.prestige||1))}</div>`;}
  else nb=`<div class="dt-sub">${phaseLabel}</div><div class="dt-big">No game scheduled</div><div class="dt-sub">${G.sched.some(g=>g._empty)&&!pcAuto()?'Build your schedule to start the season.':'Use Continue to move on.'}</div>`;
  // the tile does what the big button does for the next game (play window, playoffs, schedule builder); it never starts the offseason.
  // Scouting the opponent is the Scout link inside it
  const act=((actionBtn||'').match(/onclick="([a-zA-Z]+)\(\)"/)||[])[1],ngGo=['advWk','advPlayoffWeek','startPlayoffs','natPlay','openScheduleBuilder'].includes(act)?act+'()':`nav('sched')`;
  if(opp)nb+=`<button class="bgh bsm dt-scout" onclick="event.stopPropagation();viewSchool(${opp.id})">Scout ${opp.name}</button>`;
  const tNext=dtTile('Next game',ngGo,nb,'dt-tall');
  // schedule
  const up=G.sched.filter(g=>!g.result&&g.type!=='bye').slice(0,5);
  const tSched=dtTile('Schedule'+dot('sched'),G.sched.some(g=>g.custom&&g._empty)&&!pcAuto()?`openScheduleBuilder()`:`nav('sched')`,up.length?`<div class="dt-list">${up.map(g=>{const t=g.oppId!=null?getS(g.oppId):null;return`<div><b>W${g.wk}</b>${t?sLogo(t,26):'<span class="dt-nl"></span>'}<span class="dt-ln">${t?t.name:(g._empty?'Open slot':g.label||'TBD')}</span><span class="dt-mu">${g.type==='playoff'?'Playoff':g.isRivalry?'Rival':g.custom?'Non-league':'League'}</span></div>`;}).join('')}</div>`:`<div class="dt-mu">No games left on the schedule.</div>`);
  // team management (Player Career: the team, read-only)
  const mo=moraleOf(),mine=dtOD(G.myId),pa=pcAuto();
  const tTeam=dtTile(pa?'Team':'Team management',pa?`nav('roster')`:`nav('depth')`,`<div class="dt-bar"><i style="width:${clamp(mo,0,100)}%;background:${mo>=60?'var(--gn)':mo>=40?'var(--gd)':'#e5534b'}"></i></div><div class="dt-sub">${G.offS} / ${G.defS} · Morale: ${mo} (${moraleLbl(mo)})</div>${dtChips(mine)}<div class="dt-stars">${stars(Math.round(G.prestige||1))}</div><div class="dt-sub" style="margin-top:6px">${pl.length} players · QB chemistry ${Math.round(chemAvg())}</div>`,'dt-tall');
  // recruiting (offers coming in) and seniors (leaving)
  const offers=pl.reduce((a,p)=>a+((p.offers||[]).length),0),commits=pl.filter(p=>p.committed).length,srs=pl.filter(p=>p.yr===12).length;
  const xin=xferInList().length,xout=xferOutList().length;
  const tRec=dtTile('Transfers',pa?`nav('roster')`:`xferInOpen()`,`<div class="dt-row"><b>Coming in</b><svg class="dt-in" viewBox="0 0 24 24"><path d="M20 12H6M11 6l-6 6 6 6"/></svg><span>${xin}</span></div>`,'dt-half');
  const tSr=dtTile('Transfers'+(xout&&!pa?'<i class="dt-dot"></i>':''),pa?`nav('roster')`:`xferLeaveOpen()`,`<div class="dt-row"><b>Leaving</b><svg class="dt-out" viewBox="0 0 24 24"><path d="M4 12h14M13 6l6 6-6 6"/></svg><span>${xout+srs}${xout?` · ${xout} transfer${xout>1?'s':''}`:''}</span></div>`,'dt-half');
  const n0=(newsItems||[])[0];
  const tNews=dtTile('News'+dot('news'),`nav('news')`,n0?`<div class="dt-news">${n0.headline}</div><div class="dt-mu">${n0.sub||''}</div>`:`<div class="dt-mu">No news yet.</div>`);
  // training and scouting
  const tl=getTrainLevel();
  const tTrain=pa?dtTile('Training',`nav('mine')`,`<div class="dt-sub"><b>Training level ${tl}/20</b></div><div class="dt-stars">${stars(Math.max(1,Math.round(tl/4)))}</div><div class="dt-sub" style="margin-top:8px">The coaching staff runs practice every week.</div>`,'dt-tall')
    :dtTile('Training'+dot('training'),`nav('training')`,`<div class="dt-sub"><b>Training level ${tl}/20</b></div><div class="dt-stars">${stars(Math.max(1,Math.round(tl/4)))}</div><div class="dt-sub" style="margin-top:8px">${pracAvailable()?`Weekly practice is ready`:'This week\'s practice is done'}</div>${pracAvailable()?`<button class="btn bsm" style="margin-top:8px" onclick="event.stopPropagation();pracOpen()">Practice</button>`:''}`,'dt-tall');
  const tScout=dtTile('Scouting',pa?(opp?`viewSchool(${opp.id})`:`nav('teams')`):`nav('scout')`,`<div class="dt-sub">Scout your next opponents and the prospects in your area.</div>${opp?`<div class="dt-sub" style="margin-top:6px">Next: <b>${opp.name}</b></div>`:''}`);
  // standings and top players
  const dv=(G.divisions||[]).find(d=>d.teams.some(t=>t.id===G.myId));let stB='<div class="dt-mu">No league.</div>';
  if(dv){const rows=dv.teams.slice().sort((a,b)=>(b.wins-a.wins)||(a.losses-b.losses)).slice(0,6);
    stB=`<div class="dt-sub">${dv.name||''}</div><div class="dt-list">${rows.map((t,i)=>`<div class="${t.id===G.myId?'me':''}"><b>${i+1}</b>${sLogo(t,22)}<span class="dt-ln">${t.name}</span><span class="dt-mu">${t.wins||0}-${t.losses||0}</span></div>`).join('')}</div>`;}
  const tStand=dtTile('Standings',`nav('stand')`,stB,'dt-tall');
  const top=pl.slice().sort((a,b)=>b.rat-a.rat).slice(0,5);
  const tTop=dtTile('Top players',`nav('roster')`,`<div class="dt-list">${top.map(p=>`<div><b>${p.pos}</b><span class="dt-ln">${p.fn} ${p.ln}</span><span class="dt-mu">${yrL(p.yr)}</span>${rb(p.rat)}</div>`).join('')}</div>`);
  // program
  const tProg=dtTile('Program'+dot('advisor'),pa?`nav('trophy')`:`nav('advisor')`,`<div class="dt-sub">${pa?'Watchlist':'Assistant GM, watchlist'}, trophies and history.</div><div class="dt-list" style="margin-top:8px">${[['advisor','Assistant GM'],['trophy','Trophy Case'],['hof','Hall of Fame'],['hist','History & Records']].filter(([k])=>!pcHidePg(k)).map(([k,l])=>`<div onclick="event.stopPropagation();nav('${k}')"><span class="dt-ln">${l}</span>${T[k]?`<span class="dt-mu" style="color:var(--gd)">${T[k]}</span>`:''}</div>`).join('')}</div>`,'dt-tall');
  let tAw='';try{tAw=dtTile('Award watch',`nav('media')`,hsPollHtml(true));}catch(e){}
  const tLeague=dtTile('League',`nav('rank')`,`<div class="dt-list">${[['rank','Rankings'],['playoff','Playoffs'],['teams','Teams'],['leads','Leaders']].map(([k,l])=>`<div onclick="event.stopPropagation();nav('${k}')"><span class="dt-ln">${l}</span>${T[k]?`<span class="dt-mu" style="color:var(--gd)">${T[k]}</span>`:''}</div>`).join('')}</div>`);
  let alerts='';try{alerts=jobPanel()+pcPanel()+s7Panel();}catch(e){}
  const pills=`<span class="dt-pill" title="Record">${G.wins}-${G.losses}</span><span class="dt-pill" title="Prestige">★ ${Math.round(G.prestige||1)}</span><span class="dt-pill" style="color:var(--gn)" title="Budget">$${(G.budget/1000).toFixed(0)}k</span>`;
  return`<div class="dt-club"><button class="dt-menu" onclick="dtMenu()" aria-label="Menu"><svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button><div class="dt-crest">${sLogo(ms,58)}</div><div class="dt-name">${ms.name}<small>${ms.mascot} · ${clsL(G.cls)}${G.role==='OC'?' · Offensive Coordinator':G.role==='DC'?' · Defensive Coordinator':''}</small></div><div class="dt-tools"><button onclick="saveGame()" title="Save"><svg viewBox="0 0 24 24"><path d="M5 3h11l3 3v15H5zM8 3v6h8V3M8 21v-7h8v7"/></svg>Save</button><button onclick="openSettings()" title="Settings"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 14H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 3V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 21 10h.1a2 2 0 1 1 0 4z"/></svg>Settings</button><button onclick="showTutorial()" title="Help"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.01"/></svg>Help</button><button onclick="confirmMainMenu()" title="Main menu"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>Menu</button></div><div class="dt-go">${actionBtn||''}</div></div>
   <div class="dt-strip">${G.coach&&G.coach.name?`<span class="dt-pill" title="Head coach">${G.coach.name}</span>`:''}<b>Year ${G.yr} (${curYear}) - ${phaseLabel}</b><span class="dt-pills">${pills}</span></div>
   ${alerts?`<div class="dt-alerts">${alerts}</div>`:''}
   <div class="dt-grid">${tNext}${tSched}${tTeam}<div class="dt-stack"><div class="dt-pair">${tRec}${tSr}</div>${tNews}</div>${tTrain}${tScout}${tStand}${tTop}${tAw}${tProg}${tLeague}</div>`;}
// what needs you right now: a dot on the page in the hub and in the tab bar
function cnavTodo(){const t={},vis=id=>{const e=document.getElementById(id);return!!(e&&e.style.display!=='none');};
  try{if(vis('news-badge'))t.news='New';}catch(e){}
  try{if(vis('adv-badge'))t.advisor='Advice';}catch(e){}
  try{const p=pcActive();if(p&&p.pcSP>0)t.mine=p.pcSP+' SP';}catch(e){}
  const pa=pcAuto(); // Player Career: the coach's to-dos are not yours
  try{if(!pa&&G.phase==='offseason'&&G.sched.some(g=>g._empty))t.sched='Build it';}catch(e){}
  try{if(!pa&&pracAvailable())t.training='Practice';}catch(e){}
  try{const n=xferOutList().length;if(n&&!pa)t.roster=n+' leaving';}catch(e){}
  try{if(G.phase==='postseason'&&G.playoff&&!G.playoff.stateChampId&&!G.playoff.stateChamp)t.playoff='Live';}catch(e){}
  for(const k in t)if(pcHidePg(k))delete t[k];
  return t;}
function cnavLbl(pg){if(NL[pg])return NL[pg];const b=document.getElementById('nb-'+pg);return b?b.textContent.trim():pg;}
function cnavHub(force){if(!force&&gdsMain().cnav===false)return'';const T=cnavTodo();
  const cards=NAV_GROUPS.map(([k,l,ic,pages])=>{const ps=pages.filter(pg=>pg!=='dash'&&!pcHidePg(pg)&&(pg!=='mine'||G.myPlayerId!=null)&&(pg!=='college'||ccOn())&&(pg!=='social'||G.myPlayerId!=null)&&(pg!=='recls'||(document.getElementById('nb-recls')||{style:{}}).style.display!=='none'));if(!ps.length)return'';
    const n=ps.filter(pg=>T[pg]).length;
    return`<div class="cnav-card"><div class="cnav-h"><svg viewBox="0 0 24 24"><path d="${ic}"/></svg>${l}${n?`<small>${n} to do</small>`:''}</div><div class="cnav-sub">${ps.map(pg=>`<button class="${T[pg]?'todo':''}" onclick="nav('${pg}')">${cnavLbl(pg)}${T[pg]?`<span>${T[pg]}</span>`:''}</button>`).join('')}</div></div>`;}).join('');
  return`<div class="cnav-hub">${cards}</div>`;}
function nav(page,arg){try{ovrSyncAll();}catch(e){}try{applyTeamTheme();}catch(e){}
  if(ccOn()&&G.cc.stage==='college'&&CC_TAB[page]){arg=CC_TAB[page];page='college';} // college: high school league links open the college tab
  if(pcHidePg(page)){page='dash';arg=undefined;} // Player Career: coach pages (old saves, deep links) go to the dashboard
  try{pcAutoTick();}catch(e){console.error('player career auto',e);}
  const _prevPg=G._page,_prevArg=G._arg;
  if(_navG!==G){_navG=G;_navHist=[];}
  if(!_navBacking&&_prevPg&&(_prevPg!==page||_prevArg!==arg)){_navHist.push([_prevPg,_prevArg]);if(_navHist.length>40)_navHist.shift();try{history.pushState({g27:1},'');}catch(e){}}
  _navBacking=false;
  G._page=page;G._arg=arg;
  if(['dash','depth','roster','jv'].includes(page)){try{autoJVCallup(true);}catch(e){console.error('autoJVCallup',e);}}
  try{intlEnsure();}catch(e){console.error('intl',e);}
  try{autoSaveTick();}catch(e){}
  try{xferTick();}catch(e){console.error('xfer',e);}
  if(_prevPg!==page){const _c=document.getElementById('ct');if(_c)_c.scrollTop=0;}
  document.querySelectorAll('.nb').forEach(b=>b.classList.remove('on'));
  // Highlight by ID mapping
  const nbMap={social:'nb-social',college:'nb-college',media:'nb-media',mine:'nb-mine',dash:'nb-dash',news:'nb-news',roster:'nb-roster',depth:'nb-depth',training:'nb-training',staff:'nb-staff',cust:'nb-cust',sched:'nb-sched',stand:'nb-stand',rank:'nb-rank',playoff:'nb-playoff',teams:'nb-teams',leads:'nb-leads',recr:'nb-recr',watch:'nb-watch',hof:'nb-hof',trophy:'nb-trophy',scout:'nb-scout',advisor:'nb-advisor',hist:'nb-hist',jv:'nb-jv',recls:'nb-recls'};
  if(nbMap[page]){const el=document.getElementById(nbMap[page]);if(el)el.classList.add('on');}
  document.getElementById('ct').innerHTML='';
  const renders={social:pgSocial,college:()=>pgCollege(G._arg),media:pgMedia,mine:pgMine,dash:pgDash,news:pgNews,roster:()=>pgRoster(G._arg!=null&&getS(G._arg)?G._arg:G.myId),depth:pgDepth,training:pgTrain,staff:pgStaff,cust:pgCust,sched:pgSched,stand:pgStand,rank:pgRank,playoff:pgPlayoff,teams:pgTeams,leads:pgLeads,recr:pgRecr,watch:pgWatch,hof:pgHoF,trophy:pgTrophy,scout:pgScout,advisor:pgAdvisor,hist:pgHist,jv:pgJV,recls:pgRecls};
  if(renders[page]){
    try{document.getElementById('ct').innerHTML=renders[page](arg);}
    catch(err){
      console.error('pgHoF/nav render error:',err);
      document.getElementById('ct').innerHTML=`<div class="pnl"><div class="ph">Render Error</div><div class="pb" style="color:var(--rd)">Failed to load this page: <strong>${err.message}</strong><br><span style="color:var(--mu);font-size:11px">Check the browser console for details. Try loading the page again or re-loading your save.</span></div></div>`;
    }
  }
  if(page!=='dash'&&_navHist.length){const c=document.getElementById('ct'),pv=_navHist[_navHist.length-1];if(c)c.insertAdjacentHTML('afterbegin',`<div class="pg-backbar"><button class="pg-back" onclick="navBack()">‹ Back<small>${navLbl(pv[0],pv[1])}</small></button></div>`);}
  pgAnim(page!==_prevPg||arg!==_prevArg);
  updateTb();
  updateSbCard();
  try{aiBadge();}catch(e){}
  navSync(page);
  try{storyNav(page);}catch(e){console.error('story',e);}  // queued career scenes show on the dashboard
  // Clear news badge when visiting news
  if(page==='news'){const b=document.getElementById('news-badge');if(b)b.style.display='none';}
}
// page history: every page you open can step back to the one before (the Back bar, Escape, and the phone or browser back button)
let _navHist=[],_navBacking=false,_navG=null;
function navLbl(pg,arg){if(pg==='roster'&&arg!=null&&arg!==G.myId){const s=getS(arg);if(s)return s.name;}if(pg==='college')return'College';try{return cnavLbl(pg);}catch(e){return pg;}}
window.navBack=function(){const e=_navHist.pop();if(!e){nav('dash');return;}_navBacking=true;nav(e[0],e[1]);};
// what Back closes first: the top window, then the open screen, then the page; on the dashboard it asks about the main menu
function g27Back(){const vis=id=>{const e=document.getElementById(id);return e&&getComputedStyle(e).display!=='none'&&!e.classList.contains('hid');};
  if(document.getElementById('gd-ov'))return; // Game Day has its own pause menu
  const pu=document.getElementById('pu');if(pu&&pu.classList.contains('open'))return;
  if(vis('settings-modal')){try{closeSettings();}catch(e){}return;}
  if(vis('tut-overlay')){try{closeTutorial();}catch(e){}return;}
  const mo=document.getElementById('mo');if(mo&&mo.classList.contains('open')){moBack();return;}
  if(vis('confirm-menu')){document.getElementById('confirm-menu').style.display='none';return;}
  if(vis('team-builder')){try{closeTeamBuilder();}catch(e){}return;}
  if(vis('div-editor')){try{closeDivEditor();}catch(e){}return;}
  if(document.getElementById('fp')&&vis('fp')){try{fpClose();}catch(e){}return;}
  if(document.getElementById('ol')&&vis('ol')){try{olClose();}catch(e){}return;}
  if(vis('coachc')){const b=[...document.querySelectorAll('#coachc button')].find(x=>/back/i.test(x.textContent));if(b)b.click();return;}
  if(vis('title')){if(!document.getElementById('tt-load').classList.contains('hid'))try{ttBack();}catch(e){}return;}
  if(vis('setup')){ttSetupBack();return;}
  if(!G||!G.myId)return;
  if(_navHist.length){navBack();return;}
  if(G._page&&G._page!=='dash'){_navBacking=true;nav('dash');return;}
  try{confirmMainMenu();}catch(e){}}
// one spare history entry keeps the phone's back gesture inside the game instead of leaving the site
(function(){try{history.pushState({g27:1},'');}catch(e){}
  window.addEventListener('popstate',()=>{try{g27Back();}finally{try{history.pushState({g27:1},'');}catch(e){}}});
  window.addEventListener('keydown',e=>{if(e.key!=='Escape'||e.defaultPrevented)return;const t=e.target;if(t&&/INPUT|TEXTAREA|SELECT/.test(t.tagName))return;g27Back();});})();
// a new page, or a different tab or filter on the same page, slides in; re-renders of the same view stay still
let _pgTabSig='';
function pgAnim(changed){const c=document.getElementById('ct');if(!c)return;const sig=[...c.querySelectorAll('.tab.on,.pfb.on,.news-filt.on')].map(t=>t.textContent).join('|');
  c.classList.remove('pg-in');if(changed||sig!==_pgTabSig){void c.offsetWidth;c.classList.add('pg-in');}_pgTabSig=sig;}
function updateSbCard(){
  if(!G||!G.myId)return;
  {const b=document.getElementById('nb-mine');if(b)b.style.display=G.myPlayerId!=null?'':'none';}
  {const b=document.getElementById('nb-college');if(b)b.style.display=ccOn()?'':'none';}
  {const b=document.getElementById('nb-social');if(b)b.style.display=G.myPlayerId!=null?'':'none';}
  for(const k of['roster','depth','jv','recr','scout','training','staff','cust','sched','advisor','recls']){const b=document.getElementById('nb-'+k);if(b)b.style.display=pcHidePg(k)?'none':'';}
  const ms=myS();if(!ms)return;
  const nm=document.getElementById('sb-team-name');
  const sub=document.getElementById('sb-team-sub');
  const rec=document.getElementById('sb-record');
  const logo=document.getElementById('sb-logo-sm');
  if(ccOn()&&G.cc.stage==='college'){const I=colInfo(G.cc.k);if(nm)nm.textContent=`${I.name} ${I.mascot}`;if(sub)sub.textContent=`${CC_LVN[G.cc.lvl]} • ${ccYear()}`;if(rec)rec.textContent=G.cc.S?ccRecStr(G.cc.k):'0-0';if(logo)logo.innerHTML=colLogo(G.cc.k,38);return;}
  if(nm)nm.textContent=`${ms.name} ${ms.mascot}`;
  if(sub)sub.textContent=`${clsL(G.cls)} • Yr ${G.yr}`;
  if(rec)rec.textContent=`${G.wins}-${G.losses}`;
  if(logo)logo.innerHTML=sLogo(ms,38);
}

