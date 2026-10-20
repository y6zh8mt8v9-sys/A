// ═══════════ GRIDIRON AI, game integration (alumni tracker + advisor) ═══════════
function aiG(){if(!G.ai)G.ai={v:AI_VER,on:true,alumni:{}};if(!G.ai.alumni)G.ai.alumni={};return G.ai;}
function aiBase(){return G.baseYear||2026;}
function aiRegister(p){
  const g=aiG();if(g.alumni[p.id])return g.alumni[p.id];
  const a=aiNew(Object.assign({},p,{gradYr:p.gradYr||G.yr}));
  if(p.yr<12&&!p.gradYr){a.ci=true;a.path='life';a.stage='life';a.lvl=null;a.school=null;}
  g.alumni[p.id]=a;a.seen=0;
  const e=aiStep(a,p,a.gy,aiBase());if(e){a.entries.push(e);}a.last=a.gy;
  for(let Y=a.gy+1;Y<=G.yr-1&&Y<=a.gy+45&&!a.done;Y++){aiAdvance(a,p,Y,true);}
  return a;
}
function aiAdvance(a,p,Y,quiet){
  try{const e=aiStep(a,p,Y,aiBase());if(e){a.entries.push(e);if(e.nw&&!quiet&&typeof addNews==='function')addNews('general','Alumni: '+e.hl,(e.tx&&e.tx[0])||'');}}
  catch(err){console.error('Gridiron AI step failed',err);}
  a.last=Y;
}
function aiOnYearEnd(grad){
  const g=aiG();if(g.on===false)return;const Y=G.yr;
  const _ccMe=id=>!!(G.cc&&G.cc.on&&G.cc.pid===id);
  for(const p of grad){if(p.hof&&!g.alumni[p.id]&&!_ccMe(p.id))aiRegister(p);}
  for(const x of (G.hofArchive||[])){if(_ccMe(x.id))continue;
    let a=g.alumni[x.id];if(!a)a=aiRegister(x);
    if(!a||a.done||a.last>=Y)continue;
    aiAdvance(a,x,Y,false);
  }
}
function aiEnsure(p){
  const g=aiG();let a=g.alumni[p.id];if(a)return a;
  const src=(G.hofArchive||[]).find(x=>x.id===p.id);if(!src)return null;
  return aiRegister(src);
}
function aiUnseen(){const g=aiG();let n=0;for(const x of (G.hofArchive||[])){const a=g.alumni[x.id];if(a)n+=Math.max(0,a.entries.length-(a.seen||0));}return n;}
function aiBadge(){const b=document.getElementById('adv-badge');if(!b||!G||!G.ai)return;const n=aiUnseen();b.style.display=n>0?'':'none';b.textContent=n>9?'9+':String(n);}
function aiStageLbl(a){return a.stage==='college'?'College':a.stage==='pro'?(a.lg||'Pro'):a.stage==='post'?(a.py?'Retired':'Alumnus'):'Life';}
function aiStatus(a){
  if(a.stage==='college')return`${a.school} (${a.lvl})`;
  if(a.stage==='pro')return`${a.team} (${a.lg})`;
  if(a.stage==='post')return a.py?`Retired after ${a.py} pro season${a.py!==1?'s':''}`:'Former college player';
  return a.ci?'Career ended by injury':'Life after football';
}
function aiChip(t,c){return`<span style="display:inline-block;margin:2px 4px 0 0;padding:1px 7px;border:1px solid ${c};color:${c};font-size:10px;font-weight:700">${t}</span>`;}
function aiTags(e){
  let h='';(e.aw||[]).forEach(n=>{h+=aiChip(n,'var(--gd)');});
  (e.tg||[]).forEach(t=>{if(t==='Injury')h+=aiChip('Injury','var(--rd)');else if(t==='Transfer')h+=aiChip(t==='Transfer'?'Move':t,'var(--te)');else if(t==='Draft'||t==='Hall of Fame'||t==='Signing'||t==='Redshirt'||t==='Retirement'||t==='Career end')h+=aiChip(t,'var(--mu)');});
  return h;
}
function aiCareerCard(p,compact){
  const a=aiEnsure(p);
  if(!a||!a.entries.length)return`<div style="margin-top:8px;padding:8px 10px;background:var(--s2);border:1px solid var(--bd);font-size:11px;color:var(--mu)">Career updates start after graduation.</div>`;
  const last=a.entries[a.entries.length-1];
  if(compact){
    return`<div style="margin-top:8px;padding:8px 10px;background:var(--s2);border:1px solid var(--bd);border-left:3px solid var(--gd);cursor:pointer" onclick="event.stopPropagation();showPlayer(${p.id})">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px"><span style="font-weight:800;font-size:12px;color:var(--gd)">${aiStageLbl(a)}</span><span style="font-size:10px;color:var(--mu)">${last.y}</span></div>
      <div style="font-size:11px;color:var(--tx);line-height:1.4">${last.hl}</div>
      <div style="font-size:10px;color:var(--mu);margin-top:3px">${aiStatus(a)}</div>
    </div>`;
  }
  a.seen=a.entries.length;
  const cnt={};a.awl.forEach(x=>{cnt[x.n]=(cnt[x.n]||0)+1;});
  const awH=Object.keys(cnt).map(n=>aiChip(n+(cnt[n]>1?' x'+cnt[n]:''),'var(--gd)')).join('');
  const ct=aiTot(a.pos,a.ct),pt=aiTot(a.pos,a.pt);
  const maj=a.inj.filter(x=>x.sev==='major').length;
  const sumRow=(k,v)=>v?`<div style="font-size:12px;margin-bottom:5px"><span style="color:var(--mu)">${k}:</span> ${v}</div>`:'';
  const tl=a.entries.slice().reverse().map(e=>`<div style="display:flex;gap:12px;padding:9px 0;border-top:1px solid var(--bd)">
      <div style="min-width:48px"><div style="font-weight:800;font-size:13px">${e.y}</div><div style="font-size:10px;color:var(--mu)">age ${e.age}</div></div>
      <div style="flex:1;min-width:0"><div style="font-weight:700;font-size:12px">${e.hl}</div>
      ${e.stl?`<div style="font-size:11px;color:var(--gn);margin-top:2px">${e.stl}</div>`:''}
      ${(e.tx||[]).map(t=>`<div style="font-size:11px;color:var(--mu);margin-top:2px;line-height:1.45">${t}</div>`).join('')}
      <div>${aiTags(e)}</div></div></div>`).join('');
  return`<div style="margin-top:10px;border:1px solid var(--gd);background:var(--s1);padding:14px 16px">
    <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap"><div style="font-weight:900;font-size:15px;color:var(--gd)">Alumni career tracker</div><div style="font-size:10px;color:var(--mu)">Updates once per year. Generated on-device by Gridiron AI.</div></div>
    <div style="font-size:13px;font-weight:700;margin:6px 0 8px">${aiStageLbl(a)} &middot; ${aiStatus(a)}</div>
    ${sumRow('College totals',ct)}${sumRow('Pro totals',pt)}
    ${sumRow('Transfers',a.tr?String(a.tr):'')}${sumRow('Major injuries',maj?String(maj):'')}
    ${sumRow('Pro All-Stars / All-League / Gridiron Bowls',a.lg==='NGL'||a.py?`${a.pb} / ${a.ap1} / ${a.sb}`:'')}
    ${a.canton?`<div style="margin:6px 0">${aiChip('Gridiron Hall of Fame, Class of '+a.canton,'var(--gd)')}</div>`:''}
    ${awH?`<div style="margin:6px 0 4px">${awH}</div>`:''}
    <div style="margin-top:8px">${tl}</div></div>`;
}
function aiHofFeed(){
  const g=aiG(),rows=[];let col=0,pro=0,ret=0,can=0,n=0;
  for(const x of (G.hofArchive||[])){
    const a=g.alumni[x.id]||aiEnsure(x);if(!a)continue;n++;
    if(a.stage==='college')col++;else if(a.stage==='pro')pro++;else ret++;if(a.canton)can++;
    a.entries.forEach((e,i)=>{if(e.nw||i===a.entries.length-1)rows.push({x,a,e});});
  }
  if(!n)return'';
  rows.sort((p,q)=>q.e.y-p.e.y||(q.e.nw?1:0)-(p.e.nw?1:0));
  const top=rows.slice(0,6).map(r=>`<div style="padding:7px 0;border-top:1px solid var(--bd);cursor:pointer" onclick="showPlayer(${r.x.id})"><span style="font-weight:800;color:var(--gd);font-size:11px">${r.e.y}</span> <span style="font-size:12px">${r.e.hl}</span></div>`).join('');
  return`<div style="border:1px solid var(--bd);background:var(--s2);padding:12px 14px;margin-bottom:14px">
    <div style="font-weight:900;font-size:13px;margin-bottom:6px">Alumni news <span style="font-weight:400;font-size:11px;color:var(--mu)">${col} in college, ${pro} in pro football, ${ret} finished${can?', '+can+' in the Gridiron Hall of Fame':''}</span></div>${top}</div>`;
}
// ───────── Advisor ─────────
const AI_OFFP=['QB','RB','WR','TE','OL','K'];
function aiFx(){
  const vars=myP(),all=G.players.filter(p=>p.sId===G.myId),jv=all.filter(p=>p.onJV);
  const cnt=getStarterCnt(G.myId),st=getStarters(G.myId),have={};st.forEach(p=>{have[p.pos]=(have[p.pos]||0)+1;});
  const holes=[],hurt=[];
  const byPos={};vars.forEach(p=>{(byPos[p.pos]=byPos[p.pos]||[]).push(p);});
  Object.keys(byPos).forEach(k=>byPos[k].sort((a,b)=>b.rat-a.rat));
  for(const k in cnt){if(!cnt[k])continue;if((have[k]||0)<cnt[k])holes.push({pos:k,need:cnt[k],have:have[k]||0});(byPos[k]||[]).slice(0,cnt[k]).forEach(p=>{if(p.inj>0)hurt.push(p);});}
  const ngm=G.sched.find(g=>!g.result&&g.oppId),opp=ngm?getS(ngm.oppId):null;
  const avg=(arr)=>arr.length?arr.reduce((s,p)=>s+p.rat,0)/arr.length:0;
  const me={off:avg(st.filter(p=>AI_OFFP.includes(p.pos))),def:avg(st.filter(p=>!AI_OFFP.includes(p.pos)))};
  let op=null;if(opp){const os=getStarters(opp.id);op={off:avg(os.filter(p=>AI_OFFP.includes(p.pos))),def:avg(os.filter(p=>!AI_OFFP.includes(p.pos))),ovr:teamOvr(opp.id)};}
  const myOvr=Math.round((G.offR+G.defR)/2),sch=allSchools(),rank=sch.filter(s=>teamOvr(s.id)>teamOvr(G.myId)).length+1;
  return{vars,all,jv,cnt,st,holes,hurt,byPos,ngm,opp,me,op,myOvr,rank,total:sch.length};
}
function aiBudgetOpts(f){
  const o=[],tl=(typeof getTrainLevel==='function')?getTrainLevel():(G.trainLevel||1),inj=f.all.filter(p=>p.inj>0).length;
  if(tl<20)o.push({k:'Training Facility (level '+(tl+1)+')',c:Math.round(5000+tl*4000),v:10-tl*.35,page:'training',why:'It lifts development for every player, every year.'});
  const sn={hc:'Assistant Head Coach',oc:'Offensive Coordinator',dc:'Defensive Coordinator',rc:'Recruiting Coordinator'};
  for(const k in sn){const s=G.staff&&G.staff[k];if(!s||s.lvl>=5)continue;
    let v=k==='rc'?(s.lvl<=1?9:s.lvl===2?7:4):k==='hc'?6:k==='oc'?(G.offR<=G.defR?6.5:4):(G.defR<G.offR?6.5:4);
    const why=k==='rc'?'Better incoming freshmen classes.':k==='hc'?'Adds an overall skill-point bonus.':k==='oc'?'Boosts offensive skill points.':'Boosts defensive skill points.';
    o.push({k:sn[k]+' (level '+(s.lvl+1)+')',c:(s.lvl+1)*20000,v,page:'staff',why});}
  const fn={weight:['Weight Room',4,'Strength gains.'],film:['Film Room',4,'Awareness gains.'],train:['Practice Field',5,'Overall training bonus.'],med:['Medical Staff',3+Math.min(4,inj),'Shorter injury recovery.']};
  for(const k in fn){const cur=(G.fac&&G.fac[k])||1;if(cur>=5)continue;o.push({k:fn[k][0]+' (level '+(cur+1)+')',c:(cur+1)*15000,v:fn[k][1],page:'staff',why:fn[k][2]});}
  o.forEach(x=>{x.r=x.v/(x.c/10000);x.ok=hasFunds(x.c);});
  return o.sort((a,b)=>b.r-a.r);
}
function aiHofCands(f){
  const dv={'Elite Dev':12,'Star':8,'Star Dev':8,'Impact':4,'Normal':0};
  return f.vars.filter(p=>!p.hof&&p.yr===12&&(p.rat>=66||(p.sg||0)>=4||p.dev==='Elite Dev'||p.dev==='Star')).map(p=>({p,s:p.rat+(p.stars||0)*3+(dv[p.dev]||0)})).sort((a,b)=>b.s-a.s).slice(0,3);
}
function aiRecs(f){
  const r=[],pc=(n,t,x,pg,l)=>r.push({n,t,x,pg,l});
  if(G.sched.some(g=>g.custom&&g._empty))pc(1,'Finish your schedule','You still have open schedule slots. Fill them before the season so the strength of schedule works for you.','dash','Open dashboard');
  if(f.holes.length)pc(1,'Fill a starting hole','No healthy starter at '+f.holes.map(h=>h.pos+' ('+h.have+'/'+h.need+')').join(', ')+'. Move up a JV player or change the depth chart.','depth','Depth chart');
  if(f.hurt.length)pc(f.hurt.length>2?1:2,'Injured starters ('+f.hurt.length+')',f.hurt.slice(0,4).map(p=>p.fn+' '+p.ln+' ('+p.pos+', '+(p.injName||'injured')+', '+p.inj+' wk)').join('; ')+'. Check your depth chart before game day.','depth','Depth chart');
  const sp=f.vars.filter(p=>p.sp>0).length;if(sp)pc(2,'Unspent skill points',sp+' player'+(sp>1?'s':'')+' have skill points to spend. Auto-spend gives an instant rating boost.','training','Offseason');
  if(f.op){const d=f.myOvr-f.op.ovr;pc(2,'Next opponent: '+f.opp.name+' '+f.opp.mascot,'Their team rating is '+f.op.ovr+' against your '+f.myOvr+(d>=4?'. You should be favored.':d<=-4?'. They are the better team, so play it safe and protect your starters.':'. This looks like an even game.')+(f.me.off-f.op.def>=4?' Your offense out-rates their defense.':f.op.off-f.me.def>=4?' Their offense out-rates your defense.':''),'dash','Dashboard');}
  const o=aiBudgetOpts(f).filter(x=>x.ok).slice(0,2);if(o.length)pc(3,'Best use of your budget',o.map(x=>x.k+' for $'+x.c.toLocaleString()+': '+x.why).join(' '),o[0].page,'Open');
  const cands=aiHofCands(f);if(cands.length){const c=cands[0],pj=aiProject(c.p);pc(3,'Hall of Fame candidate',c.p.fn+' '+c.p.ln+' ('+c.p.pos+', '+c.p.rat+' OVR) is a senior. Projected odds: about '+Math.round(pj.pDraft*100)+'% to be drafted and '+Math.round(pj.pNfl*100)+'% to reach a pro roster. Enshrining him starts his yearly career tracker.','roster','Roster');}
  if(G.reclsPressure>=50)pc(2,'Reclassification warning','Your pressure meter is at '+Math.round(G.reclsPressure)+'%. Win your division to reset it.','recls','Reclassify');
  const un=aiUnseen();if(un)pc(3,'New alumni updates',un+' unread update'+(un>1?'s':'')+' from Hall of Fame alumni.','hof','Hall of Fame');
  return r.sort((a,b)=>a.n-b.n);
}
function aiWin(f){if(!f.op)return null;return 1/(1+Math.exp(-(f.myOvr-f.op.ovr)/7));}
function aiAnswer(q,f){
  const li=(arr)=>'<ul style="margin:6px 0 0 18px;padding:0">'+arr.map(x=>'<li style="margin-bottom:3px">'+x+'</li>').join('')+'</ul>';
  if(q==='start'){
    const t=[];
    if(!f.holes.length&&!f.hurt.length)t.push('All starting spots are filled with healthy players.');
    f.holes.forEach(h=>t.push('Hole at '+h.pos+': '+h.have+' healthy of '+h.need+' needed.'));
    f.hurt.forEach(p=>t.push(p.fn+' '+p.ln+' ('+p.pos+') is out: '+(p.injName||'injury')+', '+p.inj+' week'+(p.inj!==1?'s':'')+'.'));
    const up=f.jv.filter(p=>p.yr>=9).map(p=>{const bench=(f.byPos[p.pos]||[]).slice(0,f.cnt[p.pos]||0);const w=bench.length?bench[bench.length-1]:null;return w&&p.rat>w.rat?{p,w}:null;}).filter(Boolean).slice(0,3);
    up.forEach(x=>t.push('JV '+x.p.fn+' '+x.p.ln+' ('+x.p.pos+', '+x.p.rat+') out-rates starter '+x.w.fn+' '+x.w.ln+' ('+x.w.rat+'). Consider calling him up.'));
    return'<b>Lineup check</b>'+li(t);}
  if(q==='opp'){
    if(!f.opp)return'<b>Next opponent</b><div>No game is scheduled right now.</div>';
    const w=aiWin(f),t=['Team rating: you '+f.myOvr+', them '+f.op.ovr+'. Rough win chance from ratings alone: '+Math.round(w*100)+'%.','Your offense ('+Math.round(f.me.off)+') against their defense ('+Math.round(f.op.def)+'), your defense ('+Math.round(f.me.def)+') against their offense ('+Math.round(f.op.off)+').'];
    t.push(f.me.off-f.op.def>=f.op.off-f.me.def?'Your best edge is on offense, so lean on it.':'Your best edge is on defense, so protect your lead.');
    return'<b>'+f.opp.name+' '+f.opp.mascot+'</b>'+li(t)+'<div style="font-size:10px;color:var(--mu);margin-top:6px">The percentage is a rough estimate, not the game\'s actual odds.</div>';}
  if(q==='budget'){
    const o=aiBudgetOpts(f).slice(0,4);
    return'<b>Budget: $'+(G.budget||0).toLocaleString()+'</b>'+li(o.map(x=>x.k+' for $'+x.c.toLocaleString()+(x.ok?'':' (cannot afford yet)')+': '+x.why));}
  if(q==='senior'){
    const sr=f.vars.filter(p=>p.yr===12).sort((a,b)=>b.rat-a.rat),t=[];
    sr.slice(0,6).forEach(p=>t.push(p.fn+' '+p.ln+' ('+p.pos+', '+p.rat+' OVR)'+(p.hof?', in the Hall of Fame':'')));
    const need=[];for(const k in f.cnt){if(!f.cnt[k])continue;const back=f.all.filter(p=>p.pos===k&&p.yr<12).length;if(back<f.cnt[k])need.push(k+' ('+back+' returning, '+f.cnt[k]+' needed)');}
    return'<b>Seniors</b>'+(t.length?li(t):'<div>No seniors on the varsity roster.</div>')+(need.length?'<div style="margin-top:8px"><b>Thin next year:</b> '+need.join(', ')+'</div>':'<div style="margin-top:8px">Every starting position has enough returning players.</div>');}
  if(q==='prospect'){
    const dv={'Elite Dev':12,'Star':8,'Star Dev':8,'Impact':4,'Normal':0},pl=f.all.filter(p=>p.yr<12).map(p=>({p,s:(p.potHi||p.pot||p.rat)+(dv[p.dev]||0)})).sort((a,b)=>b.s-a.s).slice(0,5);
    return'<b>Best young players</b>'+li(pl.map(x=>x.p.fn+' '+x.p.ln+' ('+x.p.pos+', '+(x.p.onJV?'JV':'varsity')+', now '+x.p.rat+', up to '+(x.p.potHi||x.p.pot)+', '+(x.p.dev||'Normal')+')'));}
  if(q==='hof'){
    const c=aiHofCands(f);if(!c.length)return'<b>Hall of Fame</b><div>No unenshrined seniors stand out right now.</div>';
    return'<b>Hall of Fame candidates</b>'+li(c.map(x=>{const pj=aiProject(x.p);return x.p.fn+' '+x.p.ln+' ('+x.p.pos+', '+x.p.rat+' OVR): about '+Math.round(pj.pDraft*100)+'% drafted, '+Math.round(pj.pR1*100)+'% first round, '+Math.round(pj.pNfl*100)+'% reach a pro roster.';}))+'<div style="font-size:10px;color:var(--mu);margin-top:6px">Odds come from simulating this player\'s career many times with real-world draft and career-length rates.</div>';}
  if(q==='alumni'){
    const g=aiG(),t=[];for(const x of (G.hofArchive||[])){const a=g.alumni[x.id];if(a&&a.entries.length){const e=a.entries[a.entries.length-1];t.push('<a style="cursor:pointer;color:var(--te)" onclick="showPlayer('+x.id+')">'+x.fn+' '+x.ln+'</a> ('+aiStageLbl(a)+'): '+e.hl);}}
    return'<b>Alumni</b>'+(t.length?li(t.slice(-8).reverse()):'<div>Nobody is in the Hall of Fame yet. Enshrine a senior and the tracker starts when he graduates.</div>');}
  return'<b>Ask me about</b>'+li(['your lineup and injuries','the next opponent','where to spend your budget','seniors and next year\'s depth','young prospects','Hall of Fame candidates','alumni careers']);
}
function aiIntent(t){
  t=(t||'').toLowerCase();
  const m=[['start',/start|lineup|depth|injur|hurt|bench|call up/],['opp',/opponent|next game|scout|matchup|win|beat|odds|chance|rival/],['budget',/budget|money|spend|upgrade|staff|facilit|coach/],['senior',/senior|graduat|replace|next year|thin/],['prospect',/prospect|young|future|develop|jv|freshm|talent|best player/],['hof',/hall|hof|enshrine|legend/],['alumni',/alumn|former|college|nfl|pro |career|story|update/]];
  for(const x of m)if(x[1].test(t))return x[0];return'help';
}
window.aiAsk=function(i){window._advQ=i;window._advTxt='';nav('advisor');};
window.aiAskText=function(v){window._advTxt=v;window._advQ=aiIntent(v);nav('advisor');};
function pgAdvisor(){
  const f=aiFx(),recs=aiRecs(f),q=window._advQ||'',pri={1:['Do now','var(--rd)'],2:['Soon','var(--gd)'],3:['Worth a look','var(--te)']};
  const ph={offseason:'Offseason',regular:'Week '+(G.week||0),playoffs:'Playoffs',postseason:'Postseason'}[G.phase]||G.phase;
  const w=aiWin(f);
  const head=`<div class="pnl"><div class="ph">Assistant GM <span style="font-size:11px;font-weight:400;color:var(--mu)">on-device advisor, no internet needed</span></div><div class="pb">
    <div style="display:flex;gap:18px;flex-wrap:wrap;font-size:12px">
      <div><div style="color:var(--mu);font-size:10px">Phase</div><b>${ph}</b></div>
      <div><div style="color:var(--mu);font-size:10px">Team rating</div><b>${f.myOvr}</b> <span style="color:var(--mu)">(${f.rank} of ${f.total})</span></div>
      <div><div style="color:var(--mu);font-size:10px">Offense / Defense</div><b>${Math.round(f.me.off)} / ${Math.round(f.me.def)}</b></div>
      <div><div style="color:var(--mu);font-size:10px">Budget</div><b>$${(G.budget||0).toLocaleString()}</b></div>
      ${w!==null?`<div><div style="color:var(--mu);font-size:10px">Next game, rough win chance</div><b>${Math.round(w*100)}%</b></div>`:''}
    </div></div></div>`;
  const rh=recs.length?recs.map(x=>`<div class="adv-row" style="padding:10px 0;border-top:1px solid var(--bd);display:flex;gap:10px;align-items:flex-start">
      <div style="min-width:78px">${aiChip(pri[x.n][0],pri[x.n][1])}</div>
      <div style="flex:1;min-width:0"><div style="font-weight:700;font-size:13px">${x.t}</div><div style="font-size:12px;color:var(--mu);margin-top:2px;line-height:1.5">${x.x}</div></div>
      <button class="bgh bsm" onclick="nav('${x.pg}')">${x.l}</button></div>`).join(''):'<div style="color:var(--mu);font-size:12px">Nothing urgent. Your program looks healthy.</div>';
  const btns=[['start','Lineup and injuries'],['opp','Next opponent'],['budget','Budget'],['senior','Seniors'],['prospect','Prospects'],['hof','Hall of Fame picks'],['alumni','Alumni']].map(b=>`<button class="bgh bsm${q===b[0]?' btn bbl':''}" style="margin:0 6px 6px 0" onclick="aiAsk('${b[0]}')">${b[1]}</button>`).join('');
  const ans=q?`<div style="margin-top:10px;padding:12px 14px;background:var(--s2);border:1px solid var(--bd);font-size:12px;line-height:1.5">${aiAnswer(q,f)}</div>`:'';
  return head+`<div class="pnl"><div class="ph">What I recommend</div><div class="pb">${rh}</div></div>
  <div class="pnl"><div class="ph">Ask the advisor</div><div class="pb">
    <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap"><input type="text" id="adv-in" placeholder="Try: who is injured, how do I beat my opponent, where do I spend money" value="${(window._advTxt||'').replace(/"/g,'&quot;')}" style="flex:1;min-width:200px;background:var(--s2);border:1px solid var(--bd);padding:6px 10px;color:var(--tx);font-size:12px" onkeydown="if(event.key==='Enter')aiAskText(this.value)"><button class="btn bsm" onclick="aiAskText(document.getElementById('adv-in').value)">Ask</button></div>
    <div>${btns}</div>${ans}
    <div style="font-size:10px;color:var(--mu);margin-top:10px">The advisor reads your live roster, schedule and budget and applies football rules of thumb. It is a built-in rules engine, not an online AI, so it never needs an API key.</div></div></div>`;
}

