// ═══════════ STREAK SYSTEM ═══════════
function scorePerfEntry(st,pos){
  if(!st)return 0;
  const kr=(st.krYds||0)/12+(st.krTD||0)*6,eff=pos==='QB'&&(st.passAtt||0)>=8?(st.passCmp/st.passAtt-0.55)*20:0;
  const xtra=-(st.drops||0)*2+(st.pbu||0)*3-((pos==='CB'||pos==='S')?Math.max(0,(st.ydsA||0)-40)/15:0)+(pos==='OL'?(st.pancakes||0)*2-(st.sacksA||0)*3:0);
  return scorePerfBase(st,pos)+kr+eff+xtra;
}
function scorePerfBase(st,pos){
  if(pos==='QB')return(st.passYds||0)/20+(st.passTD||0)*6-(st.passInt||0)*4+(st.rushYds||0)/15+(st.rushTD||0)*4;
  if(pos==='RB')return(st.rushYds||0)/8+(st.rushTD||0)*7+(st.recYds||0)/12+(st.recTD||0)*5;
  if(['WR','TE'].includes(pos))return(st.recYds||0)/8+(st.recTD||0)*7;
  if(['LB','DL','CB','S'].includes(pos))return(st.tackles||0)*1.5+(st.sacks||0)*6+(st.ints||0)*8;
  return 0;
}

// ═══════════ AWARDS & MEDIA ═══════════
// outlets are made up: the game's own recruiting and high school sites
const MEDIA={rank:'PrepWire 365',rival:'The Rival Board',fni:'Friday Night Insider'};
const AW_POSW={QB:1.1,RB:1.05,WR:1,TE:0.95,DL:1,LB:1,CB:1,S:0.95,OL:0.75,K:0.6}; // linemen and kickers can win, but it takes a special year
function awName(p){const s=getS(p.sId);return{pid:p.id,n:p.fn+' '+p.ln,pos:p.pos,yr:p.yr,sch:s?s.name:'',st:s?stOf(s):'',mine:p.sId===G.myId};}
function awLine(st,pos){if(!st)return'';const b=[];if(st.passYds)b.push(`${st.passYds} pass yds, ${st.passTD||0} TD`);if(st.rushYds)b.push(`${st.rushYds} rush yds${st.rushTD?', '+st.rushTD+' TD':''}`);if(st.recYds)b.push(`${st.rec||0} rec, ${st.recYds} yds${st.recTD?', '+st.recTD+' TD':''}`);
  if(st.tackles)b.push(`${st.tackles} tkl`);if(st.sacks)b.push(`${st.sacks} sacks`);if(st.ints)b.push(`${st.ints} INT`);if(st.pbu)b.push(`${st.pbu} PBU`);if(pos==='OL'&&st.pancakes)b.push(`${st.pancakes} pancakes`);if(st.fgm)b.push(`${st.fgm}/${st.fga||st.fgm} FG`);return b.slice(0,3).join(' · ');}
// state Player / Freshman of the Year for every state with full rosters, plus the national awards
function seasonAwardsAll(all,sc,myK,pops,snap){
  const by={};for(const p of all){const s=getS(p.sId);if(!s||s.intl)continue;const k=stOf(s);(by[k]=by[k]||[]).push(p);}
  const best=L=>L.reduce((a,p)=>!a||(sc.get(p.id)||0)>(sc.get(a.id)||0)?p:a,null),out={yr:G.yr,nat:{},st:{}};
  for(const k in by){const L=by[k],poy=best(L),fr=best(L.filter(p=>p.yr===9));out.st[k]={poy:poy&&awName(poy),fr:fr&&awName(fr)};}
  const np=best(all.filter(p=>getS(p.sId)&&!getS(p.sId).intl)),nf=best(all.filter(p=>p.yr===9&&getS(p.sId)&&!getS(p.sId).intl));out.nat={poy:np&&awName(np),fr:nf&&awName(nf)};
  G.awardHist=(G.awardHist||[]).filter(x=>x.yr!==G.yr).concat(out).slice(-12);
  for(const[w,lbl]of[[np,'National Player of the Year'],[nf,'National Freshman of the Year']]){if(!w)continue;if(!w.awards)w.awards=[];w.awards.push({type:lbl,cls:w.cls||G.cls,yr:G.yr});
    try{pops.push(bAwardPop(lbl.includes('Fresh')?'fr':'mr',w,null,G.cls,w.sId===G.myId,snap.get(w.id),null,lbl));}catch(e){}
    try{addNews(w.sId===G.myId?'award':'general',`${lbl}: ${w.fn} ${w.ln}`,`${w.pos} · ${(getS(w.sId)||{}).name||''} · via ${MEDIA.fni}`);}catch(e){}}
  for(const k in out.st)if(k!==myK)for(const t of['poy','fr']){const a=out.st[k][t];if(!a)continue;const pl=getP(a.pid);if(pl){if(!pl.awards)pl.awards=[];pl.awards.push({type:`${stName(k)} ${t==='poy'?'Player':'Freshman'} of the Year`,cls:pl.cls||'',yr:G.yr});}}
}
// weekly awards: the best performance in your state this week (every position, against its own benchmark) and the play of the week
// every game line in your state counts toward its position's average; the winner stands out the most from his position (z-score)
let _wkPos={};
function wkAwardCand(p,st){if(!st||!p||p.grad)return;const s=getS(p.sId);if(!s||s.intl||stOf(s)!==clsSt(G.cls))return;
  const v=p.pos==='K'?((st.fgm||0)*3+(st.xpm||0)):scorePerfEntry(st,p.pos);if(v<(p.pos==='OL'?2:4))return; // only real production counts toward the average
  const q=_wkPos[p.pos]||(_wkPos[p.pos]={n:0,s:0,s2:0,top:[]});
  q.n++;q.s+=v;q.s2+=v*v;if(q.top.length<4||v>q.top[q.top.length-1].v){q.top.push({p,v,st:Object.assign({},st)});q.top.sort((a,b)=>b.v-a.v);if(q.top.length>4)q.top.length=4;}}
function weeklyAwards(wk,pops){const P=_wkPos;_wkPos={};const C=[];
  for(const k in P){const q=P[k];if(q.n<6)continue;const m=q.s/q.n,sd=Math.sqrt(Math.max(1e-6,q.s2/q.n-m*m));for(const t of q.top)C.push({p:t.p,st:t.st,sc:(t.v-m)/sd*(AW_POSW[k]||1)});}
  C.sort((a,b)=>b.sc-a.sc);if(!C.length)return;const top=C[0],w=top.p;
  const tdi=c=>((c.st.recTD||0)+(c.st.rushTD||0)+(c.st.ints||0)+(c.st.krTD||0))>0,big=C.slice(0,10).find(c=>c!==top&&tdi(c))||C.find(tdi)||C.slice(0,8).find(c=>c!==top&&(c.st.sacks||0)>0);
  let play=null;if(big){const q=big.p,t=big.st,d=10+Math.floor(Math.random()*70);
    const what=t.krTD?`${d+15}-yard kick return touchdown`:t.ints?(Math.random()<0.4?`${d}-yard pick-six`:'one-handed interception'):t.sacks?'strip sack in the red zone':t.recTD?(Math.random()<0.5?`${d}-yard touchdown catch over two defenders`:`toe-tap touchdown in the corner of the end zone`):`${d}-yard touchdown run, breaking ${2+Math.floor(Math.random()*4)} tackles`;
    play=Object.assign(awName(q),{what});}
  const potw=Object.assign(awName(w),{line:awLine(top.st,w.pos)});
  G.wkAwards=(G.wkAwards||[]).concat({yr:G.yr,wk,potw,play}).slice(-20);
  if(!w.awards)w.awards=[];w.awards.push({type:'Player of the Week',cls:w.cls||G.cls,yr:G.yr,wk});
  try{addNews(potw.mine?'award':'general',`${stName(clsSt(G.cls))} Player of the Week: ${potw.n}`,`${potw.pos}, ${potw.sch}: ${potw.line} · via ${MEDIA.fni}`);}catch(e){}
  if(play)try{addNews(play.mine?'award':'general',`Play of the Week: ${play.n}`,`${play.pos}, ${play.sch}: ${play.what} · via ${MEDIA.fni}`);}catch(e){}
  if(potw.mine&&pops){pops.push(bEvPop(' Player of the Week!',`<strong>${potw.n}</strong> (${potw.pos}) is the ${stName(clsSt(G.cls))} Player of the Week: ${potw.line}.`,face(w.fs,52),'var(--gd)'));
    if(w.id===G.myPlayerId){try{pcGainXP(w,150,'potw');}catch(e){}try{socNote('award',`${w.fn} ${w.ln} is our Player of the Week.`,2);}catch(e){}setTimeout(()=>{try{interviewOpen('potw',{p:w});}catch(e){}},2500);}}
  if(play&&play.mine&&pops)pops.push(bEvPop(' Play of the Week!',`<strong>${play.n}</strong>: ${play.what}.`,face(getP(play.pid).fs,52),'var(--b2)'));
}
// interviews after big games and awards: what you say moves morale and (in Player Career) the coach's trust
const IV_Q={win:['Big win tonight. What was working out there?','Your team looked sharp. What changed this week?'],loss:['Tough night. What went wrong?','How does the team bounce back from this one?'],
  rival:['That rivalry game was intense. What does it mean to you?','Anything to say to the other side after tonight?'],playoff:['Playoff football. How does it feel?','One step closer to a title. What is the message?'],potw:['Player of the Week! How does it feel?','Everybody is talking about your game. Your reaction?']};
function interviewOpen(kind,o){if(document.getElementById('mo')&&document.getElementById('mo').classList.contains('open')){if((o._n=(o._n||0)+1)<8)setTimeout(()=>interviewOpen(kind,o),2500);return;}
  const q=pick(IV_Q[kind]||IV_Q.win),pc=!!pcActive(),who=pc?myPlayer():null,outlet=pick([MEDIA.fni,MEDIA.rival,'Channel 8 Sports']);
  window._ivK=kind;openMo(`<div style="font-size:11px;font-weight:800;color:var(--mu);letter-spacing:.06em">${outlet} · interview</div>
   <h2 style="margin:4px 0 10px">"${q}"</h2><div style="display:flex;flex-direction:column;gap:8px">
   <button class="bgh" style="text-align:left;padding:10px 14px" onclick="interviewAns(0)"><b>Credit the team</b><br><small style="color:var(--mu)">"It's all about the guys around me. We did it together."</small></button>
   <button class="bgh" style="text-align:left;padding:10px 14px" onclick="interviewAns(1)"><b>Stay confident</b><br><small style="color:var(--mu)">"We expect to win every week. This is who we are."</small></button>
   <button class="bgh" style="text-align:left;padding:10px 14px" onclick="interviewAns(2)"><b>Bring the fire</b><br><small style="color:var(--mu)">"${kind==='loss'?'Nobody is going to outwork us again. Circle the next one.':'Tell them to come see us again. We are not done.'}"</small></button>
   <button class="bgh" style="padding:6px 12px;align-self:flex-end" onclick="clo()">No comment</button></div>`);}
window.interviewAns=function(i){const k=window._ivK,p=pcActive();clo();
  const dm=[3,1,k==='loss'?-2:2][i];G.morale=clamp((G.morale==null?60:G.morale)+dm,0,100);
  if(p){p.rel=clamp((p.rel==null?50:p.rel)+[2,0,-2][i],0,100);try{pcGainXP(p,[30,45,60][i],'interview');}catch(e){}}
  notify(['The locker room likes that. Morale up.','Confident. The fans are buying in.',k==='loss'?'Fiery... some teammates did not love it.':'The quote is everywhere this week. Fans are fired up.'][i]);
  try{addNews('general',`${p?p.fn+' '+p.ln:(G.coach&&G.coach.name)||'The coach'} speaks after the game`,['"We did it together."','"We expect to win every week."','"'+(k==='loss'?'Nobody outworks us again.':'Come see us again.')+'"'][i]+' · via '+MEDIA.fni);}catch(e){}};
function interviewMaybe(res,ctx){if(!ctx||!['reg','po','nat'].includes(ctx.kind)||!res||!res.score)return;const win=res.score[0]>res.score[1];
  const rival=!!(window.__GP&&window.__GP.rival),kind=ctx.kind!=='reg'?'playoff':rival?'rival':win?'win':'loss';
  if(kind==='win'&&Math.random()>0.35||kind==='loss'&&Math.random()>0.5)return;setTimeout(()=>{try{interviewOpen(kind,{});}catch(e){}},2200);}
// the Media page: recruiting rankings and the weekly honors from the game's own outlets
function pgMedia(){const st=clsSt(G.cls),mine=p=>p.sId===G.myId?'style="background:rgba(245,192,48,.12)"':'';
  const pool=G.players.filter(p=>!p.grad&&p.yr>=11&&getS(p.sId)&&!getS(p.sId).intl),srt=(a,b)=>(b.stars||0)-(a.stars||0)||(b.sg||0)-(a.sg||0)||b.rat-a.rat;
  const nat=pool.filter(p=>p.yr===12).sort(srt).slice(0,25),stl=pool.filter(p=>stOf(getS(p.sId))===st).sort(srt).slice(0,15);
  const row=(p,i)=>{const s=getS(p.sId);return`<tr class="cl" ${mine(p)} onclick="showPlayer(${p.id})"><td>${i+1}</td><td style="white-space:nowrap">${p.fn} ${p.ln}</td><td><span class="pb2">${p.pos}</span></td><td>${yrL(p.yr)}</td><td>${stars(p.stars||0)}</td><td style="white-space:nowrap">${s?sLogo(s,18)+' '+s.name:''}</td><td style="white-space:nowrap">${p.committed?`<span style="color:var(--gn);display:inline-flex;align-items:center;gap:4px">${colLogo(p.committed,18)}${p.committed.school}</span>`:'Open'}</td></tr>`;};
  const W=(G.wkAwards||[]).filter(x=>x.yr===G.yr).slice(-6).reverse(),H=(G.awardHist||[]).slice(-1)[0];
  const tbl=L=>`<div style="overflow-x:auto"><table><thead><tr><th>#</th><th>Player</th><th>Pos</th><th>Yr</th><th>Stars</th><th>School</th><th>Commit</th></tr></thead><tbody>${L.map(row).join('')||'<tr><td colspan="7" style="color:var(--mu)">No rankings yet.</td></tr>'}</tbody></table></div>`;
  return`<div class="pnl" style="margin-bottom:14px"><div class="ph">${MEDIA.fni} <span style="font-size:12px;color:var(--mu);font-weight:600">Player and Play of the Week</span></div><div class="pb">${W.length?W.map(x=>`<div class="dr" style="flex-wrap:wrap;gap:6px"><span class="a"><b>Week ${x.wk}</b> · Player of the Week: <b ${x.potw.mine?'style="color:var(--gd)"':''}>${x.potw.n}</b> (${x.potw.pos}, ${x.potw.sch})<div style="font-size:11px;color:var(--mu)">${x.potw.line}</div></span>${x.play?`<span style="font-size:12px;color:var(--mu)">Play of the Week: <b style="color:var(--tx)">${x.play.n}</b>, ${x.play.what}</span>`:''}</div>`).join(''):'<div style="color:var(--mu);font-size:13px">The weekly honors start after week 1.</div>'}
     ${H?`<div style="margin-top:10px;font-size:13px"><b>${2026+(H.yr-1)} season awards</b>: National Player of the Year <b>${H.nat.poy?H.nat.poy.n+' ('+H.nat.poy.pos+', '+H.nat.poy.sch+')':'–'}</b> · National Freshman of the Year <b>${H.nat.fr?H.nat.fr.n+' ('+H.nat.fr.pos+')':'–'}</b>${H.st[st]?` · ${stName(st)}: Player <b>${H.st[st].poy?H.st[st].poy.n+' ('+H.st[st].poy.pos+')':'–'}</b>, Freshman <b>${H.st[st].fr?H.st[st].fr.n+' ('+H.st[st].fr.pos+')':'–'}</b>`:''}</div>`:''}</div></div>
    <div class="g2" style="align-items:start"><div class="pnl"><div class="ph">${MEDIA.rank} · National Top 25 (seniors)</div>${tbl(nat)}</div>
    <div class="pnl"><div class="ph">${MEDIA.rival} · ${stName(st)} Top 15</div>${tbl(stl)}</div></div>`;}
// v2.14 streak rework: only games a player was really part of count, a streak needs three games in a row,
// playoff and championship games count too, and a player can heat up again later in the season (after a cooldown)
// instead of one streak (hot or cold) using up the whole year.
const STREAK_BENCH={QB:24,RB:16,WR:13,TE:10,LB:11,DL:9,CB:8,S:8};
function streakInvolved(st,pos){
  if(!st)return false;
  if(pos==='QB')return(st.passAtt||0)>=8||(st.passYds||0)>=60;
  if(pos==='RB')return(st.rushAtt||0)>=6||(st.rushYds||0)>=30||(st.rec||0)>=2;
  if(pos==='WR'||pos==='TE')return(st.rec||0)>=1||(st.tgtA||0)>=2||(st.drops||0)>=1;
  return(st.tackles||0)>=2||(st.sacks||0)>0||(st.ints||0)>0||(st.pbu||0)>0||(st.tgtA||0)>=2;
}
function checkStreaks(sm,pops,silent){
  // a streak lasts a set number of games; afterwards the player cools off for a few games before another can start
  for(const p of myP()){
    if(p.streakGamesLeft>0){p.streakGamesLeft--;if(p.streakGamesLeft===0){p.streak=null;p.streakCD=3;p.perfHistory=[];}}
    else if(p.streakCD>0)p.streakCD--;
  }
  for(const[pid,st]of Object.entries(sm||{})){
    const p=getP(parseInt(pid));
    if(!p||p.sId!==G.myId||p.pos==='OL'||p.pos==='K'||p.pos==='P')continue;
    if(!streakInvolved(st,p.pos))continue; // a backup who barely saw the field is not "ice cold"
    if(!Array.isArray(p.perfHistory))p.perfHistory=[];
    p.perfHistory.push(Math.round(scorePerfEntry(st,p.pos)*10)/10);
    if(p.perfHistory.length>3)p.perfHistory.shift();
    if(p.streak||p.streakCD>0||p.perfHistory.length<3)continue;
    const bench=STREAK_BENCH[p.pos]||10,H=p.perfHistory,avg=H.reduce((a,b)=>a+b,0)/H.length;
    const hot=avg>=bench*1.45&&Math.min(...H)>=bench*0.9,cold=avg<=bench*0.5&&Math.max(...H)<=bench*0.8;
    if(!hot&&!cold)continue;
    p.streak=hot?'hot':'cold';p.streakGamesLeft=2;p.streakUsed=true;
    const nm=`${p.fn} ${p.ln}`;
    if(hot){
      if(!silent)pops.push(bEvPop(` ${nm} is ON FIRE!`,`${nm} has been DOMINANT the last 3 games!<br> <strong>Hot Streak activated</strong>: +18% stats for the next <strong>2 games</strong> (and a ratings boost when you play Game Day).`,face(p.fs,52),'#ff6600'));
      addLog(`<span style="color:#ff6600"> HOT STREAK: ${nm} (${p.pos})</span>`);
    }else{
      if(!silent)pops.push(bEvPop(` ${nm} is Ice Cold`,`${nm} has struggled for the last 3 games.<br> <strong>Cold Streak activated</strong>: −18% stats for the next <strong>2 games</strong>.`,face(p.fs,52),'#4fc3f7'));
      addLog(`<span style="color:#4fc3f7"> COLD STREAK: ${nm} (${p.pos})</span>`);
    }
  }
}

function checkRecs(sm,wk){
  if(!G.schoolRecs)initRecs();
  const keys=['passYds','passTD','rushYds','rushTD','recYds','recTD','krYds','krTD','tackles','sacks','ints','pbu','pancakes'];
  const lbl={passYds:'Pass Yards',passTD:'Pass TDs',rushYds:'Rush Yards',rushTD:'Rush TDs',recYds:'Rec Yards',recTD:'Rec TDs',krYds:'Kick Return Yards',krTD:'Kick Return TDs',tackles:'Tackles',sacks:'Sacks',ints:'INTs',pbu:'Pass Breakups',pancakes:'Pancake Blocks'};
  for(const[pid,st]of Object.entries(sm)){
    const p=getP(parseInt(pid));if(!p||p.sId!==G.myId)continue;
    for(const k of keys){
      const v=st[k]||0;if(v<=0)continue;
      const gRec=G.schoolRecs.game[k];
      if(v>(gRec?.val||0)){G.schoolRecs.game[k]={val:v,pid:p.id,name:`${p.fn} ${p.ln}`,yr:G.yr,pos:p.pos,date:fmtDate(wk-1)};_popQ.push(bEvPop(` Game Record!`,`${p.fn} ${p.ln} set a new single-game school record in <strong>${lbl[k]}</strong>: <strong>${v}</strong>!`,face(p.fs,48),'var(--gd)'));}
      const sVal=p.seasStats[k]||0;const sRec=G.schoolRecs.season[k];
      if(sVal>(sRec?.val||0))G.schoolRecs.season[k]={val:sVal,pid:p.id,name:`${p.fn} ${p.ln}`,yr:G.yr,pos:p.pos,date:`${2026+(G.yr-1)}`};
      const cVal=p.carStats[k]||0;const cRec=G.schoolRecs.career[k];
      if(cVal>(cRec?.val||0))G.schoolRecs.career[k]={val:cVal,pid:p.id,name:`${p.fn} ${p.ln}`,yr:G.yr,pos:p.pos,date:`${2026+(G.yr-1)}`};
    }
  }
}

