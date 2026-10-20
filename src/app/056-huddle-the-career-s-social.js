// ═══════════ HUDDLE: the career's social app ═══════════
// Fans, made-up media outlets, teammates and rivals post about your games, offers, awards and commitment; you post too.
// Followers grow with your play, stars and awards (and add to NIL money in college). Kept to the last 80 posts.
const SOC_FAN=['gridiron_guru','friday_lights_fan','pigskin.prophet','endzone_ella','blitz_burner','coach_couch','helmet_hype','redzone_rick','touchdown_tia','film_room_fred','sideline_sam','fourth_and_fun','twominute_drill','chainmover22','turfmonster','pickSix_pete','huddleup_hal','gameday_gabby','stadium_steve','recruit_watch_rob'];
const SOC_OWN=['Locked in. On to the next one.','Grind never stops.','God is good. Thank you to my teammates.','Film room tonight, practice tomorrow.','That one was for my city.','Stay humble, stay hungry.','Big win. Bigger week ahead.','Rough night. We bounce back.'];
function soc(){if(!G)return null;if(!G.soc){const p=myPlayer();G.soc={fol:p?Math.round(150+(p.stars||0)**2*180):150,posts:[],seq:0,liked:{}};}return G.soc;}
function socOn(){return!!(G&&G.myPlayerId!=null&&myPlayer());}
function socH(p){return'@'+(p.fn+p.ln).toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,14);}
function socPost(o){const S=soc();if(!S)return;const p=myPlayer();o.id=++S.seq;o.y=G.yr;o.w=ccOn()?'College '+ccYear():(G.week?'Week '+G.week:'Offseason');o.likes=o.likes||Math.round(S.fol*(0.02+Math.random()*0.06)*(o.boost||1));o.rp=Math.round(o.likes*(0.05+Math.random()*0.12));
  S.posts.unshift(o);if(S.posts.length>80)S.posts.length=80;try{const b=document.getElementById('nb-social');if(b&&G._page!=='social')b.classList.add('todo');}catch(e){}void p;}
function socGrow(n){const S=soc();if(S)S.fol=Math.max(50,Math.round(S.fol+n));}
// a game: you and others react, followers move with the performance
function socGame(st,ctx){if(!socOn())return;const p=myPlayer(),S=soc(),win=/^W/.test(ctx.r||''),pf=st?ccPerf(p.pos,st,1):0,line=st?ccLine(p.pos,st):'',opp=ctx.o||'the opponent',r=Math.random;
  const big=pf>=9,good=pf>=5;socGrow(S.fol*(big?0.06:good?0.025:0.004)+(win?25:0)+(ctx.k&&ctx.k!=='reg'?60:0));
  if(st&&big)socPost({a:'fan',h:'@'+SOC_FAN[Math.floor(r()*SOC_FAN.length)],txt:`${p.fn} ${p.ln} was a problem tonight. ${line}. Somebody check on ${opp}.`,boost:2});
  else if(st&&good)socPost({a:'fan',h:'@'+SOC_FAN[Math.floor(r()*SOC_FAN.length)],txt:`Solid game from #${p.num} ${p.ln}: ${line}.`});
  else if(st&&!win&&r()<.5)socPost({a:'fan',h:'@'+SOC_FAN[Math.floor(r()*SOC_FAN.length)],txt:`Quiet night for ${p.ln} against ${opp}. Gotta see more next week.`});
  if(big&&r()<.7)socPost({a:'media',h:'@'+(ccOn()?'CollegeGridWire':MEDIA.fni.replace(/\s/g,'')),v:1,txt:`${p.fn} ${p.ln} (${p.pos}) ${win?'leads the way in a win over':'shines despite a loss to'} ${opp}: ${line}.`,boost:1.6});
  if(win&&r()<.45){const t=(ccOn()?ccRoster(G.cc.k):myP()).filter(q=>q!==p&&q.id!==p.id&&q.pos!==p.pos);const q=t[Math.floor(r()*t.length)];if(q)socPost({a:'mate',h:'@'+(q.fn+q.ln).toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,14),txt:`${win?'W':'L'} ${(ctx.r||'').replace(/^[WL]\s*/,'')}. ${big?'@'+socH(p).slice(1)+' different breed fr':'Team win, on to the next.'}`});}
  if(p.committed){const ck=p.committed.school+'|'+p.committed.lvl;if(S.cm!==ck){S.cm=ck;socNote('commit',`COMMITTED: ${p.fn} ${p.ln} (${p.pos}) is going to ${p.committed.school}.`,3);}}
  S.lastGame=ctx;}
function socNote(kind,txt,boost){if(!socOn())return;socPost({a:'media',h:'@'+MEDIA.rank.replace(/\s/g,''),v:1,txt,boost:boost||1.4});socGrow(kind==='offer'?40:kind==='commit'?400:kind==='award'?250:20);}
// the page
window.socMine=function(i){const S=soc(),p=myPlayer();if(!S||!p)return;socPost({a:'me',h:socH(p),txt:SOC_OWN[i]||SOC_OWN[0],boost:1.3});socGrow(5);nav('social');};
window.socLike=function(id){const S=soc();if(!S)return;const o=S.posts.find(x=>x.id===id);if(!o)return;if(S.liked[id]){delete S.liked[id];o.likes--;}else{S.liked[id]=1;o.likes++;}nav('social');};
function socAv(o){const p=myPlayer();if(o.a==='me')return face(p.fs,40);if(o.a==='media')return`<span class="soc-av soc-m">${o.h.slice(1,3).toUpperCase()}</span>`;
  let h=0;for(const c of o.h)h=(h*31+c.charCodeAt(0))>>>0;return face(1000000+(h%900000),40);}
function socK(n){return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e4?Math.round(n/1e3)+'K':n>=1000?(n/1e3).toFixed(1)+'K':String(n);}
function pgSocial(){const S=soc(),p=myPlayer();if(!S||!p)return`<div class="pnl"><div class="ph">Huddle</div><div class="pb" style="color:var(--mu)">Huddle is the social app of a player career. Start a Player Career to use it.</div></div>`;
  try{const b=document.getElementById('nb-social');if(b)b.classList.remove('todo');}catch(e){}
  const mine=S.posts.filter(o=>o.a==='me').length;
  return`<div class="pnl soc"><div class="pb" style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">${face(p.fs,64)}<div style="flex:1;min-width:200px"><div style="font:900 24px/1.1 var(--hd)">${p.fn} ${p.ln}</div><div style="color:var(--mu);font-size:13px">${socH(p)} · ${p.pos}</div>
      <div style="display:flex;gap:18px;margin-top:6px;font-size:14px"><span><b>${socK(S.fol)}</b> followers</span><span><b>${mine}</b> posts</span></div></div></div>
    <div class="pb" style="border-top:1px solid var(--bd)"><div style="font-size:13px;font-weight:800;margin-bottom:6px">Post something</div><div style="display:flex;gap:6px;flex-wrap:wrap">${SOC_OWN.map((t,i)=>`<button class="bgh bsm" onclick="socMine(${i})">${t}</button>`).join('')}</div></div></div>
   <div class="pnl"><div class="ph">Feed</div><div class="pb" style="padding:0">${S.posts.length?S.posts.map(o=>`<article class="soc-post"><div>${socAv(o)}</div><div style="flex:1;min-width:0"><div style="font-size:13px"><b>${o.a==='me'?p.fn+' '+p.ln:o.h.slice(1)}</b>${o.v?' <span class="soc-v" title="Verified outlet">verified</span>':''} <span style="color:var(--mu)">${o.h} · ${o.w}</span></div><div style="margin:4px 0 6px;font-size:14px;line-height:1.4">${o.txt}</div>
      <div style="display:flex;align-items:center;gap:16px;font-size:12px;color:var(--mu)"><button class="soc-like${S.liked[o.id]?' on':''}" onclick="socLike(${o.id})" aria-label="Like"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.8 8.2 3 4.5 6.6 4.5c2.1 0 3.6 1.2 5.4 3.2 1.8-2 3.3-3.2 5.4-3.2 3.6 0 5.8 3.7 4.2 7.3C19.5 16.4 12 21 12 21z" fill="currentColor"/></svg> ${socK(o.likes)}</button><span>${socK(o.rp)} reposts</span></div></div></article>`).join(''):'<div style="padding:14px;color:var(--mu)">No posts yet. Play a game and the reactions come in.</div>'}</div></div>`;}
function pcRole(p){const rel=p.rel==null?50:p.rel,sc=q=>q.rat+((q.id===p.id?rel:50)-50)/6;
  const mates=myP().filter(q=>q.pos===p.pos&&!(q.inj>0)).sort((a,b)=>sc(b)-sc(a)),rank=Math.max(0,mates.findIndex(q=>q.id===p.id)),n=PC_STARTERS[p.pos]||1;
  return{start:rank<n,rank:rank+1,n,share:clamp(0.25+(rel-40)/90,0.15,0.9)};}
function pcRelMsg(r){return r>=85?'Team leader: the coach builds the game plan around you':r>=70?'Trusted: the coach counts on you':r>=50?'Earning it: good games move you up':r>=35?'On thin ice: the coach wants to see more':'In the doghouse: practice hard and take your chances';}
function pcGP(ctx){
  if(!window.__GP||!G.pcLock||!['reg','po','playoff','nat','s7'].includes(ctx.kind))return;const p=pcActive();if(!p||p.inj>0)return;
  if(ctx.kind==='s7'&&!(G.s7&&G.s7.picks.includes(p.id)))return;
  const r=pcRole(p);window.__GP.pc={mid:p.id,pos:p.pos,start:ctx.kind==='s7'||r.start,share:r.share,two:false};window.__GP.mode='all';}
function pcAfterGame(res,ctx){
  if(!G||!G.pcLock||!ctx||!['reg','po','playoff','nat'].includes(ctx.kind))return;const p=pcActive();if(!p)return;
  const st=gdConv(((res&&res.stats)||{})[p.id]||{}),win=res&&res.score&&res.score[0]>res.score[1];
  const perf=st.passYds/60+st.passTD*1.5-st.passInt*2+st.rushYds/25+st.rushTD*1.5+st.recYds/25+st.recTD*1.5+st.tackles*0.35+st.sacks*1.5+st.ints*3+(st.pancakes||0)*0.4+(st.fgm||0)*0.8-(st.drops||0)*1.2;
  const asks=(res&&res.pcAsks)||0;let d=Math.round(clamp(perf,-4,6)+(win?1.5:-1)-(asks>8?2:0));
  const before=p.rel==null?50:p.rel;p.rel=clamp(before+d,0,100);
  if(p.rel!==before)setTimeout(()=>{try{notify(`Coach trust ${p.rel>before?'+':''}${p.rel-before} (${p.rel}/100)`);}catch(e){}},900);}
// your player levels up like a road-to-glory career: game XP fills the bar, every level brings skill points,
// and you spend them on the attributes you want (the higher the rating, the more a point costs)
const PC_SP_LV=3;
function pcNeed(lv){return 300+(lv||1)*100;}
function pcCost(v){return v<60?1:v<70?2:v<80?3:v<90?4:5;}
function pcGainXP(p,x,why){x=Math.max(0,Math.round(x));if(!x)return;p.pcLv=p.pcLv||1;p.pcXP=(p.pcXP||0)+x;let up=0;
  while(p.pcXP>=pcNeed(p.pcLv)){p.pcXP-=pcNeed(p.pcLv);p.pcLv++;up++;}
  if(up){p.pcSP=(p.pcSP||0)+PC_SP_LV*up;addLog(`<span style="color:var(--gd)">${p.fn} ${p.ln} reached level ${p.pcLv}: +${PC_SP_LV*up} skill points to spend (My Player).</span>`);}
  setTimeout(()=>{try{notify(`+${x} XP${up?` · Level ${p.pcLv}! +${PC_SP_LV*up} SP`:''}`);}catch(e){}},up?1400:1100);}
window.pcSpend=function(k){const p=myPlayer();if(!p||!(G.players.includes(p)||(ccOn()&&p===G.cc.p)))return;ovrSync(p,true);if(!p.at)p.at={};
  const v=atv(p,k),c=pcCost(v);if(v>=99||(p.pcSP||0)<c)return;
  if(ATOP.has(k))p[k]=v+1;else p.at[k]=v+1;p.pcSP-=c;p.rat=ovrCalc(p);p._rc=p.rat;if(p.pot<p.rat)p.pot=p.rat;if(p.potHi!=null&&p.potHi<p.rat)p.potHi=p.rat;
  try{updateRats();}catch(e){}nav('mine');};
function pcSkillPanel(p){const lv=p.pcLv||1,xp=p.pcXP||0,need=pcNeed(lv),sp=p.pcSP||0,W=OVR_W[p.pos]||OVR_W.WR;
  const ks=Object.keys(W).sort((a,b)=>W[b]-W[a]);for(const k of['spd','str','sta'])if(!ks.includes(k))ks.push(k);
  return`<div class="pnl"><div class="ph">Level ${lv} · Skill points</div><div class="pb">
    <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--mu)"><span>${xp} / ${need} XP to level ${lv+1}</span><span><b style="color:${sp?'var(--gd)':'var(--tx)'}">${sp}</b> skill point${sp===1?'':'s'} to spend</span></div>
    <div style="height:8px;border-radius:4px;background:rgba(127,127,127,.25);overflow:hidden;margin:4px 0 10px"><div style="height:100%;width:${Math.round(xp/need*100)}%;background:var(--ac)"></div></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:4px 14px">${ks.map(k=>{const v=atv(p,k),c=pcCost(v);return`<div style="display:flex;align-items:center;gap:6px;font-size:13px"><span style="flex:1">${AN[k]||k}${W[k]?' <span style="color:var(--te);font-size:10px">●</span>':''}</span><b style="width:26px;text-align:center;color:${attrColor(v)}">${v}</b><button class="bgh bxs" style="min-width:52px" onclick="pcSpend('${k}')" ${sp<c||v>=99?'disabled':''}>+1 · ${c}</button></div>`;}).join('')}</div>
    <div style="font-size:11px;color:var(--mu);margin-top:8px">Every game earns XP: more for big games, wins and the playoffs. Each level gives ${PC_SP_LV} skill points. Ratings under 60 cost 1 point, then 2, 3, 4 and 5 points above 90.</div></div></div>`;}
function pcPanel(){
  const p=pcActive();if(!p)return'';const r=pcRole(p),rel=p.rel==null?50:p.rel,first=!G.sched.some(g=>g.type==='regular'&&g.result);
  const bar=`<div style="height:8px;border-radius:4px;background:rgba(127,127,127,.25);overflow:hidden;margin:4px 0 2px"><div style="height:100%;width:${rel}%;background:${rel>=70?'var(--gn)':rel>=40?'var(--gd)':'var(--rd,#d33)'}"></div></div>`;
  return`<div class="pnl"><div class="ph">Player Career</div><div class="pb">
    <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center"><div style="flex:1;min-width:200px"><div style="font-weight:900;font-size:16px">#${p.num} ${p.fn} ${p.ln} · ${p.pos} · ${rb(p.rat)}</div>
      <div style="font-size:13px;margin-top:2px">${r.start?`<b style="color:var(--gn)">Starter</b> (${p.pos}${r.rank})`:`<b style="color:var(--gd)">Backup</b> (${p.pos}${r.rank}): you play about ${Math.round(r.share*100)}% of the drives`}</div>
      <div style="font-size:12px;color:var(--mu);margin-top:6px">Level ${p.pcLv||1}${p.pcSP?` · <b style="color:var(--gd)">${p.pcSP} skill points to spend</b>`:''} · Coach trust ${rel}/100</div>${bar}<div style="font-size:12px;color:var(--mu)">${pcRelMsg(rel)}</div></div>
      <div style="display:flex;flex-direction:column;gap:6px"><button class="btn" onclick="nav('mine')">My Player</button>${G.phase==='offseason'&&first?`<button class="bgh" onclick="pcTransferOpen()">Transfer</button>`:''}</div></div>
    <div style="font-size:11px;color:var(--mu);margin-top:8px">In Game Day you control only your player and the coach calls every play. Drives you are not on the field for are simulated. Big games raise his trust; turnovers, drops and losses cost it. ${p.pos==='QB'?'':'Call for the ball (B key, Y / Triangle) to get the quarterback looking your way, but do not overdo it.'} Transfers are allowed in the offseason, before the first game.</div>
  </div></div>`;}
window.pcTransferOpen=function(){
  const p=pcActive();if(!p)return;if(G.phase!=='offseason'||G.sched.some(g=>g.type==='regular'&&g.result)){notify('Transfers happen in the offseason, before the first game.','w');return;}
  const L=[];for(const d of G.divisions)for(const t of d.teams){if(t.id===G.myId||t.intl)continue;const S=getS(t.id);if(!S)continue;
    const at=sPlayers(t.id).filter(q=>q.pos===p.pos).sort((a,b)=>b.rat-a.rat),n=PC_STARTERS[p.pos]||1,rank=at.filter(q=>q.rat>p.rat).length+1;L.push({S,rank,n,ovr:teamOvr(t.id)});}
  L.sort((a,b)=>(a.rank<=a.n?0:1)-(b.rank<=b.n?0:1)||b.ovr-a.ovr);
  openMo(`<h2>Transfer</h2><div style="font-size:13px;color:var(--mu);margin-bottom:8px">Schools in your league. A transfer starts with neutral coach trust, and your old coach will not be happy.</div>
    <div style="max-height:55vh;overflow-y:auto">${L.slice(0,40).map(x=>`<div style="display:flex;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid rgba(127,127,127,.2)"><div style="flex:1"><b>${x.S.name}</b> ${x.S.mascot}<div style="font-size:11px;color:var(--mu)">OVR ${x.ovr} · you would be ${p.pos}${x.rank}${x.rank<=x.n?' (starter)':''}</div></div><button class="bgh" onclick="pcTransfer(${x.S.id})">Transfer</button></div>`).join('')}</div>
    <div style="text-align:right;margin-top:8px"><button class="bgh" onclick="clo()">Stay</button></div>`);};
window.pcTransfer=function(sid){
  const p=pcActive(),ns=getS(sid);if(!p||!ns)return;if(!confirm(`Transfer to ${ns.name} ${ns.mascot}?`))return;
  const os=myS();p.sId=ns.id;_spVer++;p.onJV=false;p.rel=50;p.transfers=(p.transfers||0)+1;
  coachTakeOver(ns.id,true);if(G.myId!==ns.id){p.sId=os.id;_spVer++;return;}
  try{addNews('myteam',`${p.fn} ${p.ln} transfers to ${ns.name}`,`The ${p.pos} leaves ${os.name} for the ${ns.mascot}.`);}catch(e){}
  addLog(`<span style="color:var(--gd)">Player Career: ${p.fn} ${p.ln} transfers to ${ns.name}.</span>`);};
function myPlayer(){if(!G||G.myPlayerId==null)return null;if(G.cc&&G.cc.on&&G.cc.p&&G.cc.pid===G.myPlayerId)return G.cc.p;return getP(G.myPlayerId)||(G.hofArchive||[]).find(x=>x.id===G.myPlayerId)||null;}
function pgMine(){
  if(G.cc&&(G.cc.on||(G.cc.car&&G.cc.car.length)))return ccMine();
  const p=myPlayer();
  if(!p)return`<div class="pnl"><div class="ph">My Player</div><div class="pb" style="color:var(--mu)">No player career in this save. Start a new game and tick <b>Create my own player</b> on the setup screen.</div></div>`;
  const active=G.players.includes(p),s=p.seasStats||{},sch=getS(p.sId)||myS();
  const gl={9:'Freshman',10:'Sophomore',11:'Junior',12:'Senior'}[p.yr]||'';
  const head=`<div class="pnl"><div class="pb" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
    <div>${face(p.fs,84)}</div>
    <div style="flex:1;min-width:220px">
      <div style="font-size:12px;color:var(--mu);font-weight:800;letter-spacing:.06em;">My Player${active?' · '+gl:' · Alumnus'}</div>
      <div style="font-family:var(--hd);font-size:30px;font-weight:900;line-height:1.05">#${p.num} ${p.fn} ${p.ln}</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:4px"><span class="pb2">${p.pos}</span>${rb(p.rat)} ${stars(p.stars||0)} ${devB(p.dev)} ${p.arch?`<span style="font-size:11px;color:var(--mu)">${p.arch}</span>`:''}</div>
      <div style="font-size:12px;color:var(--mu);margin-top:6px">${sch?sch.name+' '+sch.mascot:''} · potential ${p.potLo||p.pot}–${p.potHi||p.pot} · Level ${p.pcLv||1}</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:6px"><button class="btn" onclick="showPlayer(${p.id})">Player card</button></div>
  </div></div>`;
  const season=active?`<div class="pnl"><div class="ph">This season</div><div class="pb"><div style="font-size:13px;margin-bottom:8px">${s.gp?statLine(p,s):'<span style="color:var(--mu)">No games yet this season.</span>'}</div>${gameLogHtml(p)}</div></div>`:'';
  const recruit=active?`<div class="pnl"><div class="ph">Recruiting</div><div class="pb">${p.committed?`<div style="font-weight:800;color:var(--gn)">Committed to ${p.committed.school} (${p.committed.lvl})</div>`:''}${(p.offers||[]).length?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px">${p.offers.map(o=>ofB(o)).join('')}</div>`:`<div style="color:var(--mu);font-size:13px">No offers yet. Big games, camps and stars bring the colleges.</div>`}${p.dreamSchool?`<div style="font-size:12px;margin-top:8px">Dream school: <b>${p.dreamSchool.school}</b> (${p.dreamSchool.lvl})</div>`:''}</div></div>`:'';
  const career=`<div class="pnl"><div class="ph">High school career</div><div class="pb">${careerHtml(p)}</div></div>`;
  let after='';if(!active&&G.cc&&!G.cc.on&&G.cc.stage==='college'&&G.cc.phase==='start')after=`<div class="pnl"><div class="ph">College</div><div class="pb"><div style="margin-bottom:8px">${p.fn} ${p.ln} signed with ${ccName(G.cc.k)}. Play his college career yourself: the dashboard becomes his college dashboard while the high school world goes on in the background.</div><button class="btn bgn" onclick="ccOptIn()">Follow him to college</button></div></div>`;
  if(!active&&!after){try{after=`<div class="pnl"><div class="ph">After high school</div><div class="pb">${renderStoryCard(p,false)||'<span style="color:var(--mu)">His college story begins next season.</span>'}</div></div>`;}catch(e){}}
  let skill='';if(active)try{skill=pcSkillPanel(p);}catch(e){}
  return head+skill+season+recruit+career+after;
}

// ═══════════ MAIN MENU ═══════════
function confirmMainMenu(){document.getElementById('confirm-menu').classList.add('open');}
function goMainMenu(){
  try{saveGame(true);}catch(e){}
  document.getElementById('confirm-menu').classList.remove('open');
  document.getElementById('app').classList.add('hid');
  document.getElementById('setup').classList.remove('hid');
  // Reset selection state
  _selectedOfferTeam=null;
  _selectedCounty=null;
  _selectedRivals=new Set();
  document.getElementById('selected-school-panel').style.display='none';
  document.getElementById('offer-county-panel').style.display='none';
  const btn=document.getElementById('btn-start');
  if(btn){btn.disabled=true;btn.style.opacity='.4';btn.style.cursor='not-allowed';}
  // Reset team data; the setup world is built again only if a new game is set up
  _allClsDivs=null;_setupDivs=null;_mapOffers=[];
  _cc=null;_pcd=null;window._pccDone=false;showTitle(false);
}

