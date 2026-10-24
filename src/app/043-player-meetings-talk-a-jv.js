// ═══════════ v2.14 PLAYER MEETINGS: talk a JV player into moving up, or pitch another school's player on transferring ═══════════
// Every player has one thing that matters most to him. His traits hint at it; the right pitch makes a big difference.
const PITCH={time:'You will play right away',exposure:'College coaches will see you here',win:'Come win a championship with us',coach:'We will develop you: coaching, weight room, film',team:'The guys in this locker room want you here'};
// v2.16 what a player cares about comes from his character traits and interests, with a personal twist; you only know it for sure once he is scouted
function plPriority(p){
  if(p.prio)return p.prio;
  const t=p.traits||[],I=p.interests||[],w={time:1,exposure:1,win:1,coach:1,team:1};
  if(t.includes('competitor')||t.includes('big-game'))w.win+=3;if(t.includes('academic')||t.includes('film-junkie')||t.includes('coachable'))w.coach+=3;
  if(t.includes('showboat'))w.exposure+=3;if(p.dev==='Star'||p.dev==='Elite Dev')w.exposure+=1.5;if(t.includes('leader')||t.includes('workhorse')||t.includes('gym-rat'))w.time+=2.5;if(t.includes('humble'))w.team+=3;
  for(const k of I){if(['weightroom','wrestling'].includes(k))w.time+=1;else if(['reading','chess'].includes(k))w.coach+=1;else if(['sneakers','music','movies'].includes(k))w.exposure+=1;else if(['volunteering','cooking'].includes(k))w.team+=1;else if(['basketball','baseball'].includes(k))w.win+=1;}
  let h=Math.abs((p.id|0)*2654435761|0),best='time',bv=-1;for(const k in w){h=(h*1103515245+12345)&0x7fffffff;const v=w[k]*(0.55+(h%1000)/1000);if(v>bv){bv=v;best=k;}}
  return(p.prio=best);
}
function plScouted(p){return!!(p&&p.scout&&p.scout.by===G.myId);}
const PRIO_TXT={time:'playing time',exposure:'college exposure',win:'winning',coach:'getting coached up',team:'his teammates'};
// your own JV players you know fairly well (usually right); other schools' players only after a scouting report
function plHintOwn(p){const h=Math.abs(((p.id|0)+G.yr*7)*2654435761|0)%4,k=h===0?['time','exposure','win','coach','team'][(h+(p.id|0))%5]:plPriority(p);return plHintTxt(k);}
function plHintTxt(k){return{time:'He wants to be on the field.',exposure:'He talks about college scouts a lot.',win:'He hates losing more than anything.',coach:'He is always asking how to get better.',team:'He cares about the guys around him.'}[k];}
// where he would sit on your depth chart at his position (0 = starter)
function myDepthRank(p){return myP().filter(q=>q.pos===p.pos&&q.id!==p.id&&!(q.inj>0)&&q.rat>p.rat).length;}
function pitchHtml(fn){return Object.entries(PITCH).map(([k,l])=>`<button class="bgh" style="text-align:left;padding:9px 12px" onclick="${fn}('${k}')">${l}</button>`).join('');}
function talkKey(){return G.yr+'-'+G.phase+'-'+(G.week||0);}
window.talkOpen=function(pid){
  const p=getP(pid);if(!p||!p.onJV)return;
  if(p.talkKey===talkKey()){notify(`You already talked to ${p.fn} this week.`,'w');return;}
  window._talkPid=pid;const rk=myDepthRank(p);
  openMo(`<div style="font-weight:900;font-size:20px;margin-bottom:4px">Talk with ${p.fn} ${p.ln}</div>
    <div style="font-size:13px;color:var(--mu);margin-bottom:10px">${p.pos} · ${yrL(p.yr)} · OVR ${p.rat}. He would be <b>${rk===0?'a starter':rk===1?'first off the bench':'deep on the depth chart'}</b> on varsity. ${plHintOwn(p)}</div>
    <div style="display:flex;flex-direction:column;gap:6px">${pitchHtml('talkPitch')}</div>
    <div style="text-align:right;margin-top:10px"><button class="bgh" onclick="clo()">Never mind</button></div>`);
};
window.talkPitch=function(k){
  const p=getP(window._talkPid);if(!p)return;p.talkKey=talkKey();
  const rank=myDepthRank(p),t=p.traits||[];
  let ch=0.3+((p.morale||65)-60)*0.006+(k===plPriority(p)?0.35:0)+(rank===0?0.15:rank===1?0.05:-0.08)+(t.includes('coachable')?0.08:0)-(t.includes('hothead')?0.06:0)-(t.includes('lazy')?0.08:0);
  if(k==='time'&&rank>1)ch-=0.2; // don't promise what you can't give
  ch=clamp(ch,0.05,0.92);
  if(Math.random()<ch){p.morale=clamp((p.morale||65)+6,0,100);p.mood='good';clo();addLog(`<span style="color:var(--gn)">${p.fn} ${p.ln} is fired up to move up to varsity.</span>`);p._talked=1;callUpToVarsity(p.id);return;}
  p.morale=clamp((p.morale||65)-3,0,100);
  const say=k==='time'&&rank>1?'I would just be sitting on the bench up there, Coach.':'I don&#39;t think I&#39;m ready yet.';
  openMo(`<div style="font-weight:900;font-size:18px;margin-bottom:6px">${p.fn} wants to stay on JV for now</div><div style="font-size:13px;color:var(--mu);margin-bottom:12px">"${say}" You can try again next week${k!==plPriority(p)?', maybe with a different pitch':''}.</div><div style="text-align:right"><button class="btn" onclick="clo();nav('jv')">OK</button></div>`);
};
const MEET_MAX=4,MEET_COST=1500;
function transferWindow(){return G.phase==='offseason'&&!G.sched.some(g=>g.type==='regular'&&g.result);}
// you scout a player the season before you recruit him (in your first season, scouting in the same preseason counts)
function meetEligible(p){if(!plScouted(p)||p.xferPledge)return false;if(transferWindow())return p.scout.yr<G.yr||G.yr===1;return(p.yr||9)<12;}
function scoutMax(){return Math.max(2,2*Math.round(G.prestige||1));}
function scoutLeft(){if(!G.scoutN||G.scoutN.yr!==G.yr)G.scoutN={yr:G.yr,n:0};return Math.max(0,scoutMax()-G.scoutN.n);}
function scoutPlayer(pid){const p=getP(pid);if(!p||p.sId===G.myId)return;if(plScouted(p)){notify('Already scouted.','w');return;}
  if(scoutLeft()<=0){notify(`No scouting reports left this season (${scoutMax()} per season: 2 per prestige star).`,'w');return;}
  G.scoutN.n++;p.scout={yr:G.yr,by:G.myId};notify(`Scouting report on ${p.fn} ${p.ln} is in.`);nav(G._page||'scout',G._arg);}
function schState(s){return s?(s.intl?String(s.intl):(s.state||'home')):'home';}
function pgScout(){
  const ms=myS(),f=window._scF||(window._scF={pos:'ALL',min:0,q:''});
  const pool=G.players.filter(p=>!p.grad&&p.sId!==G.myId&&getS(p.sId)&&!getS(p.sId).fp&&(f.pos==='ALL'||p.pos===f.pos)&&p.rat>=f.min&&(!f.q||(p.fn+' '+p.ln).toLowerCase().includes(f.q.toLowerCase())));
  const mine=G.players.filter(p=>plScouted(p)&&!p.grad&&p.sId!==G.myId).sort((a,b)=>b.rat-a.rat);
  const top=pool.filter(p=>!plScouted(p)).sort((a,b)=>b.rat-a.rat).slice(0,60);
  const row=p=>{const s=getS(p.sId),sc=plScouted(p),el=meetEligible(p),oos=schState(s)!==schState(ms);
    return`<tr class="cl" onclick="showPlayer(${p.id})"><td style="white-space:nowrap">${face(p.fs,24)} ${p.fn} ${p.ln}</td><td>${p.pos}</td><td>${yrL(p.yr)}</td><td>${sLogo(s,20)} ${s.name}${oos?' <span title="Out of state" style="color:var(--rd);font-size:10px;font-weight:800">OUT OF STATE</span>':''}</td><td><b>${p.rat}</b></td>
      <td>${sc?`<span style="color:var(--gn)">${p.pot}</span>`:'?'}</td><td>${sc?PRIO_TXT[plPriority(p)]:'?'}</td>
      <td>${sc?(p.xferPledge?`<span style="font-size:11px;color:var(--gn);font-weight:700">Joins next season</span>`:el?`<button class="btn bxs" onclick="event.stopPropagation();meetOpen(${p.id})">Meet</button>`:`<span style="font-size:11px;color:var(--mu)">${(p.yr||9)>=12&&!transferWindow()?'Senior: graduates':'Meet next offseason'}</span>`):`<button class="bgh bxs" onclick="event.stopPropagation();scoutPlayer(${p.id})">Scout</button>`}</td></tr>`;};
  return`<div class="pnl" style="margin-bottom:14px"><div class="ph">Scouting <span style="font-size:12px;color:var(--mu)">${scoutLeft()} of ${scoutMax()} reports left this season</span></div><div class="pb">
    <div style="font-size:13px;color:var(--mu);margin-bottom:10px">Scout other schools' players to learn their true potential and what they care about. Meet a scouted player during the season and, if he says yes, he joins you next season; in the offseason before your first game (the season after you scout him) he joins right away. You get 2 reports per prestige star each season. Bringing in players from out of state can draw an investigation.</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><select onchange="window._scF.pos=this.value;nav('scout')">${['ALL',...POS].map(x=>`<option ${x===f.pos?'selected':''}>${x}</option>`).join('')}</select>
      <label style="font-size:12px;color:var(--mu)">Min OVR <input type="number" value="${f.min}" style="width:70px" onchange="window._scF.min=+this.value||0;nav('scout')"></label>
      <input placeholder="Search name" value="${f.q.replace(/"/g,'&quot;')}" onchange="window._scF.q=this.value;nav('scout')" style="flex:1 1 140px"></div></div></div>
    ${(()=>{const L=xferInList();return L.length?`<div class="pnl" style="margin-bottom:14px"><div class="ph">Transfers coming in next season</div><div class="pb">${L.map(o=>`<div class="dr"><span class="a"><b>${o.p.fn} ${o.p.ln}</b> <span class="pb2">${o.p.pos}</span> ${rb(o.p.rat)}</span><span style="font-size:12px;color:var(--mu)">${yrL(o.p.yr)} · from ${o.from?o.from.name:'?'}</span></div>`).join('')}</div></div>`:'';})()}
    ${mine.length?`<div class="pnl" style="margin-bottom:14px"><div class="ph">Your scouting reports</div><div style="overflow-x:auto"><table><thead><tr><th>Player</th><th>Pos</th><th>Yr</th><th>School</th><th>OVR</th><th>Pot</th><th>Cares about</th><th></th></tr></thead><tbody>${mine.map(row).join('')}</tbody></table></div></div>`:''}
    <div class="pnl"><div class="ph">Players to scout</div><div style="overflow-x:auto"><table><thead><tr><th>Player</th><th>Pos</th><th>Yr</th><th>School</th><th>OVR</th><th>Pot</th><th>Cares about</th><th></th></tr></thead><tbody>${top.map(row).join('')||'<tr><td colspan="8" style="color:var(--mu)">No players match.</td></tr>'}</tbody></table></div></div>`;
}
function meetLeft(){if(!G.meet||G.meet.yr!==G.yr)G.meet={yr:G.yr,n:0};return Math.max(0,MEET_MAX-G.meet.n);}
window.meetOpen=function(pid){
  const p=getP(pid),from=p&&getS(p.sId);if(!p||!from||p.sId===G.myId)return;
  if(meetLeft()<=0){notify('No meetings left this season.','w');return;}
  if(p.meetYr===G.yr){notify(`You already met with ${p.fn} this season.`,'w');return;}
  if(p.xferPledge){notify(`${p.fn} already committed to transfer.`,'w');return;}
  if(!transferWindow()&&(p.yr||9)>=12){notify(`${p.fn} is a senior: he graduates before he could transfer.`,'w');return;}
  if(!meetEligible(p)){notify(plScouted(p)?`You scouted ${p.fn} this season: you can meet with him during the season (he would join next year) or before next season.`:`Scout ${p.fn} first (Team → Scouting).`,'w');return;}
  if(!hasFunds(MEET_COST)){notify(`A meeting costs $${MEET_COST.toLocaleString()} (travel and dinner).`,'e');return;}
  window._meetPid=pid;const rk=myDepthRank(p);
  openMo(`<div style="font-weight:900;font-size:20px;margin-bottom:4px">Meeting with ${p.fn} ${p.ln}</div>${transferWindow()?'':`<div style="font-size:12px;color:var(--gd);font-weight:700;margin-bottom:6px">Mid-season: if he says yes he finishes this season at ${from.name} and joins you next season.</div>`}
    <div style="font-size:13px;color:var(--mu);margin-bottom:10px">${p.pos} · ${yrL(p.yr)} · OVR ${p.rat} at ${from.name} ${from.mascot}. On your team he would be <b>${rk===0?'a starter':rk===1?'first off the bench':'a backup'}</b>. Scouting report: he cares most about <b>${PRIO_TXT[plPriority(p)]}</b>. The meeting costs $${MEET_COST.toLocaleString()}.</div>
    <div style="display:flex;flex-direction:column;gap:6px">${pitchHtml('meetPitch')}</div>
    <div style="text-align:right;margin-top:10px"><button class="bgh" onclick="clo()">Cancel</button></div>`);
};
window.meetPitch=function(k){
  const p=getP(window._meetPid),from=p&&getS(p.sId),me=myS();if(!p||!from||p.sId===G.myId)return;
  if(!G.unlimitedMoney)G.budget-=MEET_COST;meetLeft();G.meet.n++;p.meetYr=G.yr;
  const rank=myDepthRank(p),theirRank=sPlayers(from.id).filter(q=>q.pos===p.pos&&q.id!==p.id&&!q.onJV&&q.rat>p.rat).length;
  const wp=x=>{const g=(x.wins||0)+(x.losses||0);return g?(x.wins||0)/g:0.5;};
  let ch=0.1+((me.prestige||G.prestige||1)-(from.prestige||1))*0.05+(wp(me)-wp(from))*0.25+(k===plPriority(p)?0.22:0)
    +(rank<theirRank?0.12:rank>theirRank?-0.1:0)-(p.yr>=12?0.05:0)-(p.stars||0)*0.02-(p.committed?0.05:0)+((70-(p.morale||70))*0.004);
  if(k==='time'&&rank>0)ch-=0.15;if(k==='win'&&wp(me)<wp(from))ch-=0.12;
  ch=clamp(ch,0.03,0.6);
  try{updateTb();}catch(e){}
  const _ok=Math.random()<ch;
  if(_ok&&!transferWindow()){xferPledge(p,from);
    openMo(`<div style="font-weight:900;font-size:20px;margin-bottom:6px">${p.fn} ${p.ln} commits to transfer!</div><div style="font-size:13px;color:var(--mu);margin-bottom:12px">Your pitch ("${PITCH[k]}") worked. He finishes this season at ${from.name} and joins your program next season.</div><div style="text-align:right"><button class="btn" onclick="clo();nav('dash')">OK</button></div>`);return;}
  if(_ok){transferIn(p,from);
    openMo(`<div style="font-weight:900;font-size:20px;margin-bottom:6px">${p.fn} ${p.ln} is transferring to ${me.name}!</div><div style="font-size:13px;color:var(--mu);margin-bottom:12px">Your pitch ("${PITCH[k]}") worked. He joins your ${p.onJV?'JV':'varsity'} roster right away.</div><div style="text-align:right"><button class="btn" onclick="clo();showPlayer(${p.id})">See his card</button></div>`);return;}
  openMo(`<div style="font-weight:900;font-size:18px;margin-bottom:6px">${p.fn} is staying at ${from.name}</div><div style="font-size:13px;color:var(--mu);margin-bottom:12px">${k===plPriority(p)?'He liked what he heard, but it was not enough to leave.':'Your pitch did not hit what matters to him.'} ${meetLeft()} meeting${meetLeft()===1?'':'s'} left this season.</div><div style="text-align:right"><button class="btn" onclick="clo()">OK</button></div>`);
};
// ── transfers across seasons: players who commit mid-season, and your own players who want out ──
function xferPledge(p,from){G.xferIn=G.xferIn||[];G.xferIn.push({pid:p.id,from:from.id,yr:G.yr});p.xferPledge=G.myId;
  addLog(`<span style="color:var(--gn)">${p.fn} ${p.ln} (${p.pos}, OVR ${p.rat}) commits to transfer from ${from.name} ${from.mascot}. He joins next season.</span>`);
  try{addNews('myteam',`${p.fn} ${p.ln} commits to transfer`,`The ${p.pos} from ${from.name} joins the program next season.`);}catch(e){}}
function xferInList(){return(G.xferIn||[]).map(x=>({x,p:getP(x.pid),from:getS(x.from)})).filter(o=>o.p&&!o.p.grad&&o.p.sId!==G.myId);}
function xferOutList(){return myP().filter(p=>p.xferOut&&!p.grad);}
function xferCap(){return Math.floor(myP().length*0.15);}
// how much a player wants out, from what he cares about, his traits and how things are going
function xferRisk(p){
  if(p.id===G.myPlayerId||(p.yr||9)>=12||p.stay===G.yr||p.xferOut)return 0;
  const pr=plPriority(p),t=p.traits||[],n=PC_STARTERS[p.pos]||1,rk=myDepthRank(p),starter=p.onJV?false:rk<n;
  const g=(G.wins||0)+(G.losses||0),wp=g?(G.wins||0)/g:0.5;
  let r=0.015;
  if(pr==='time'&&!starter)r+=(rk>=n+1?0.2:0.12)+(p.rat>=50?0.05:0)+(p.onJV&&(p.yr||9)>=11?0.08:0);
  if(pr==='exposure'&&(G.prestige||1)<3&&((p.stars||0)>=2||p.rat>=60))r+=0.13;
  if(pr==='win'&&wp<0.45)r+=0.15+(wp<0.25?0.07:0);
  if(pr==='coach'&&getTrainLevel()<6)r+=0.08;
  if(pr==='team'&&moraleOf()<45)r+=0.12;
  r+=((60-(p.morale==null?65:p.morale))*0.004);
  if(t.includes('hothead'))r+=0.06;if(t.includes('showboat'))r+=0.04;if(t.includes('humble'))r-=0.08;if(t.includes('leader'))r-=0.06;if(t.includes('coachable'))r-=0.03;
  if((captains()||[]).includes(p.id))r-=0.2;if((p.yr||9)===9)r-=0.03;
  return clamp(r,0,0.45);}
// where he would go: a school in your league where he fits what he wants
function xferDest(p){const pr=plPriority(p),pool=[];for(const d of G.divisions||[])for(const t of d.teams)if(t.id!==G.myId&&!t.lite&&!t.intl)pool.push(t);if(!pool.length)return null;
  const wp=t=>{const g=(t.wins||0)+(t.losses||0);return g?(t.wins||0)/g:0.5;};
  let best=null,bs=-1e9;for(let i=0;i<24;i++){const t=pool[Math.floor(Math.random()*pool.length)],ahead=sPlayers(t.id).filter(q=>q.pos===p.pos&&!q.onJV&&q.rat>p.rat).length;
    const sc=(pr==='time'?-ahead*2:-ahead*0.5)+(pr==='exposure'?(t.prestige||1)*1.5:(t.prestige||1)*0.4)+(pr==='win'?wp(t)*5:wp(t))+Math.random();if(sc>bs){bs=sc;best=t;}}
  return best;}
function xferEval(tag){
  const key=G.yr+tag;if(G.xferEv&&G.xferEv.includes(key))return;G.xferEv=(G.xferEv||[]).filter(k=>String(k).startsWith(G.yr+'')).concat(key);
  let room=xferCap()-xferOutList().length;if(room<=0)return;
  const C=myP().map(p=>({p,r:xferRisk(p)})).filter(o=>o.r>0).sort((a,b)=>b.r-a.r),out=[];
  for(const o of C){if(room<=0)break;if(Math.random()<o.r*0.6){const d=xferDest(o.p);if(!d)continue;o.p.xferOut={to:d.id,yr:G.yr,why:plPriority(o.p)};out.push(o.p);room--;}}
  if(!out.length)return;
  addLog(`<span style="color:var(--rd)">Transfer talk: ${out.map(p=>`${p.fn} ${p.ln} (${p.pos})`).join(', ')} ${out.length>1?'plan':'plans'} to transfer after the season. Talk to them on the Dashboard (Players leaving).</span>`);
  try{addNews('bad',`${out.length} player${out.length>1?'s':''} looking to transfer`,`${out.map(p=>p.fn+' '+p.ln).join(', ')} told the staff they plan to leave after the season.`);}catch(e){}
  try{notify(`${out.length} player${out.length>1?'s want':' wants'} to transfer after the season`,'w');}catch(e){}}
function xferTick(){if(!G||!G.myId||pcActive())return;
  if(G.phase==='regular'&&(G.week||0)>=5)xferEval('a');
  if((G.phase==='playoffs'||G.phase==='postseason'||(G.phase==='regular'&&allRegDone())))xferEval('b');}
// the offseason move: committed players arrive, the ones who wanted out leave
function xferProcess(){
  for(const o of xferInList()){o.p.xferPledge=null;try{transferIn(o.p,o.from||{name:'another school',mascot:''});}catch(e){console.error('xfer in',e);}}
  G.xferIn=[];for(const q of G.players)if(q.xferPledge&&q.sId!==G.myId)q.xferPledge=null;
  for(const p of xferOutList()){const d=getS(p.xferOut.to)||xferDest(p);p.xferOut=null;if(!d)continue;
    p.sId=d.id;p.onJV=false;p.depth={};p.wl=p.wl||false;if(G.jvRoster)G.jvRoster=G.jvRoster.filter(id=>id!==p.id);G.captains=(G.captains||[]).filter(id=>id!==p.id);_spVer++;
    addLog(`<span style="color:var(--rd)">Transfer: ${p.fn} ${p.ln} (${p.pos}, OVR ${p.rat}) leaves for ${d.name} ${d.mascot}.</span>`);
    try{addNews('bad',`${p.fn} ${p.ln} transfers out`,`The ${p.pos} leaves for ${d.name} ${d.mascot}, looking for ${PRIO_TXT[plPriority(p)]||'a fresh start'}.`);}catch(e){}}
  try{checkAndFillRosters();}catch(e){}}
window.xferLeaveOpen=function(){const L=xferOutList(),srs=myP().filter(p=>p.yr===12&&!p.xferOut);
  const row=p=>{const d=getS(p.xferOut.to);return`<div class="dr" style="gap:8px;flex-wrap:wrap"><span class="a" style="flex:1;min-width:170px"><b style="cursor:pointer" onclick="clo();showPlayer(${p.id})">${p.fn} ${p.ln}</b> <span class="pb2">${p.pos}</span> ${rb(p.rat)}<div style="font-size:11px;color:var(--mu)">${yrL(p.yr)} · wants ${PRIO_TXT[p.xferOut.why]||'a change'}${d?' · likely '+d.name:''}</div></span>${p.talkKey===talkKey()?'<span style="font-size:11px;color:var(--mu)">Talked this week</span>':`<button class="btn bxs" onclick="keepOpen(${p.id})">Talk</button>`}</div>`;};
  openMo(`<h2>Players leaving</h2>
   <div style="font-size:13px;color:var(--mu);margin-bottom:8px">Transfers leave when the offseason training ends. Talk to them: hit what they care about and they may stay. At most 15% of your roster (${xferCap()} players) can leave in a year.</div>
   <div style="font-weight:800;margin:8px 0 4px">Transferring out (${L.length})</div>${L.map(row).join('')||'<div style="color:var(--mu);font-size:13px">Nobody wants to leave right now.</div>'}
   <div style="font-weight:800;margin:12px 0 4px">Graduating seniors (${srs.length})</div><div style="font-size:12px;color:var(--mu)">${srs.map(p=>`${p.fn} ${p.ln} (${p.pos})`).join(', ')||'None'}</div>
   <div style="text-align:right;margin-top:12px"><button class="bgh" onclick="clo()">Close</button></div>`);};
window.keepOpen=function(pid){const p=getP(pid);if(!p||!p.xferOut)return;window._keepPid=pid;
  openMo(`<div style="font-weight:900;font-size:20px;margin-bottom:4px">Talk with ${p.fn} ${p.ln}</div><div style="font-size:13px;color:var(--mu);margin-bottom:10px">${p.pos} · ${yrL(p.yr)} · OVR ${p.rat}. ${plHintOwn(p)} One talk per week.</div>
   <div style="display:flex;flex-direction:column;gap:6px">${pitchHtml('keepPitch')}</div><div style="text-align:right;margin-top:10px"><button class="bgh" onclick="xferLeaveOpen()">Back</button></div>`);};
window.keepPitch=function(k){const p=getP(window._keepPid);if(!p||!p.xferOut)return;p.talkKey=talkKey();
  const t=p.traits||[],rk=myDepthRank(p),n=PC_STARTERS[p.pos]||1;
  let ch=0.18+(k===plPriority(p)?0.35:0)+((p.morale==null?65:p.morale)-60)*0.005+(t.includes('coachable')?0.08:0)+(t.includes('humble')?0.06:0)-(t.includes('hothead')?0.08:0);
  if(k==='time'&&rk>=n)ch-=0.15;ch=clamp(ch,0.05,0.8);
  if(Math.random()<ch){p.xferOut=null;p.stay=G.yr;p.morale=clamp((p.morale||65)+5,0,100);addLog(`<span style="color:var(--gn)">${p.fn} ${p.ln} decided to stay.</span>`);
    openMo(`<div style="font-weight:900;font-size:18px;margin-bottom:6px">${p.fn} is staying!</div><div style="font-size:13px;color:var(--mu);margin-bottom:12px">"${PITCH[k]}" was what he needed to hear.</div><div style="text-align:right"><button class="btn" onclick="xferLeaveOpen()">OK</button></div>`);return;}
  p.morale=clamp((p.morale||65)-2,0,100);
  openMo(`<div style="font-weight:900;font-size:18px;margin-bottom:6px">${p.fn} still wants to leave</div><div style="font-size:13px;color:var(--mu);margin-bottom:12px">${k===plPriority(p)?'He listened, but he is not convinced yet.':'That is not what matters to him.'} Try again next week.</div><div style="text-align:right"><button class="btn" onclick="xferLeaveOpen()">OK</button></div>`);};
function transferIn(p,from){
  const side=x=>POS_OFFENSE.has(x.pos)?'o':POS_DEFENSE.has(x.pos)?'d':'s';
  const used=new Set(myP().filter(q=>side(q)===side(p)).map(q=>q.num));
  p.sId=G.myId;_spVer++;p.depth={};p.mood='good';  // _spVer: the per-school lists must see him on your team right awayp.morale=clamp((p.morale||70)+8,0,100);
  if(used.has(p.num))p.num=posN(p.pos,G.myId);
  if(canBeOnJV(p)&&myP().length>=MAX_VARSITY){p.onJV=true;(G.jvRoster||(G.jvRoster=[])).push(p.id);}else p.onJV=false;
  addLog(`<span style="color:var(--gn)">Transfer: ${p.fn} ${p.ln} (${p.pos}, OVR ${p.rat}) leaves ${from.name} ${from.mascot} for your program.</span>`);
  // out-of-state transfers can draw a look from the state association
  if(schState(from)!==schState(myS())&&Math.random()<0.4){p.inj=Math.max(p.inj||0,4);p.injName='Ineligible (transfer review)';if(!G.unlimitedMoney)G.budget-=10000;G.prestige=clamp(G.prestige-0.1,1,5);
    addLog(`<span style="color:var(--rd)">The state association is reviewing the out-of-state transfer of ${p.fn} ${p.ln}: $10,000 fine, he sits the first 4 games.</span>`);try{addNews('bad','Transfer under review',`${p.fn} ${p.ln} must sit 4 games; the program was fined $10,000.`);}catch(e){}}
  try{addNews('general',`${p.fn} ${p.ln} transfers in`,`${p.pos} from ${from.name} ${from.mascot} after a meeting with the coaching staff.`);}catch(e){}
  try{checkAndFillRosters();}catch(e){}
}


// Boost secondary attributes when OVR is upgraded, spd/str/awr each get a small random nudge
function _attrBoostForOvr(p,ovrAmt){
  // Each OVR point gives roughly 0.5-1.5 raw points spread across spd/str/awr
  // The exact split varies by position archetype to keep variety
  const posSpd={'QB':1,'RB':1,'WR':1,'TE':0,'OL':0,'DL':0,'LB':0.5,'CB':1,'S':1,'K':0,'P':0};
  const posStr={'QB':0,'RB':0.5,'WR':0,'TE':1,'OL':1,'DL':1,'LB':1,'CB':0,'S':0,'K':0,'P':0};
  const spdW=posSpd[p.pos]!==undefined?posSpd[p.pos]:0.5;
  const strW=posStr[p.pos]!==undefined?posStr[p.pos]:0.5;
  const awrW=0.5; // everyone gets some awareness
  for(let i=0;i<ovrAmt;i++){
    if(Math.random()<(0.5+spdW*0.3))p.spd=clamp(p.spd+1,1,99);
    if(Math.random()<(0.5+strW*0.3))p.str=clamp(p.str+1,1,99);
    if(Math.random()<(0.4+awrW*0.2))p.awr=clamp(p.awr+1,1,99);
  }
}
function spndSP(pid,stat,amt){
  const p=getP(pid);if(!p)return;
  // Only OVR upgrades allowed via SP, attributes are boosted automatically
  if(stat!=='rat'){notify('Use OVR to upgrade, attributes improve automatically!','w');return;}
  if((p.sp||0)<amt){notify('Not enough SP!','e');return;}
  p.rat=clamp(p.rat+amt,1,Math.max(p.pot,p.rat));
  p.pot=Math.max(p.pot,p.rat);
  _attrBoostForOvr(p,amt);
  p.sp-=amt;
  updateRats();
  notify(`+${amt} OVR applied! Attributes boosted.`);
  showPlayer(pid);
}
function commitNow(pid){const p=getP(pid);if(!p)return;const sel=document.getElementById('csel');if(!sel)return;const o=JSON.parse(sel.value),c=COL_BY[o.school+'|'+o.lvl];if(c&&!colRoom(c,p,false)){notify(`${o.school} already filled its ${p.pos} spots in this class.`,'w');return;}p.committed=o;colTakeCommit(p,o);addLog(`<span style="color:var(--gn)">${p.fn} ${p.ln} committed to ${p.committed.school}!</span>`);notify(`${p.fn} ${p.ln} committed!`);showPlayer(pid);}

