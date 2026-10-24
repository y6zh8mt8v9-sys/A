// ═══════════ TITLE SCREEN ═══════════
function _ttEl(id){return document.getElementById(id);}
function showTitle(openLoad){
  const t=_ttEl('title');if(!t)return;t.classList.remove('hid');_ttEl('coachc')&&_ttEl('coachc').classList.add('hid');
  _ttEl('tt-load').classList.toggle('hid',!openLoad);_ttEl('tt-main').classList.toggle('hid',!!openLoad);
  ttRefresh();ttClock();ttIntro();
}
// the title screen's one moment of motion: the name rises in, the 27 lights up like scoreboard bulbs, the menu follows.
// Once per visit, under a second, and not at all when the device asks for reduced motion
function ttIntro(){if(window._ttIntroDone)return;window._ttIntroDone=1;
  try{if(!window.gsap||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const g=window.gsap,q=s=>document.querySelectorAll('#tt-main '+s);
    const tl=g.timeline({defaults:{ease:'power3.out'}});
    tl.from(q('.tt-name .a'),{y:28,opacity:0,duration:.45})
      .from(q('.tt-name .b'),{opacity:0,duration:.06,repeat:4,yoyo:true,ease:'none'},'-=.2')
      .from(q('.tt-tag, .tt-ver'),{y:10,opacity:0,duration:.35,stagger:.05},'-=.1')
      .from(q('.tt-btn'),{y:12,opacity:0,duration:.32,stagger:.04,clearProps:'transform,opacity'},'-=.25')
      .from(q('.tt-legal'),{opacity:0,duration:.3},'-=.15');}catch(e){}}
function hideTitle(){const t=_ttEl('title');if(t)t.classList.add('hid');if(window._sbT){clearInterval(window._sbT);window._sbT=null;}}
function ttClock(){if(window._sbT)return;let s=120;window._sbT=setInterval(()=>{const el=document.getElementById('sb-clock'),t=_ttEl('title');if(!el||!t||t.classList.contains('hid')){clearInterval(window._sbT);window._sbT=null;return;}s=s<=0?120:s-1;el.textContent='4TH '+Math.floor(s/60)+':'+String(s%60).padStart(2,'0');if(s===114){const h=document.getElementById('sb-h');if(h)h.textContent=h.textContent==='21'?'27':'21';}},1000);}
function ttNew(){hideTitle();_ttEl('app').classList.add('hid');_ttEl('setup').classList.remove('hid');setupEnsure();}
function ttPlayer(){ttNew();const on=document.getElementById('pc-on'),lk=document.getElementById('pc-lock'),f=document.getElementById('pc-fields');
  if(on)on.checked=true;if(lk)lk.checked=true;if(f){f.style.display='';setTimeout(()=>{try{f.scrollIntoView({block:'center',behavior:'smooth'});}catch(e){}},200);}
  try{notify('Player Career: pick the high school he plays for on the map, then build your player in the player creator.');}catch(e){}}
function ttLoad(){_ttEl('tt-main').classList.add('hid');_ttEl('tt-load').classList.remove('hid');ttRefresh();}
function ttBack(){_ttEl('tt-load').classList.add('hid');_ttEl('tt-main').classList.remove('hid');}
function ttFmtDate(ms){try{return new Date(ms).toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});}catch(e){return'';}}
function ttRefresh(){
  svList().then(list=>{
    const legacy=(()=>{try{return lsLoad(LS_KEY);}catch(e){return null;}})();
    const cont=_ttEl('tt-continue');if(cont){cont.style.display=list.length?'':'none';cont.onclick=()=>ttLoadSlot(list[0].id);if(list[0])cont.querySelector('small').textContent=`${list[0].name} ${list[0].mascot} · ${list[0].season} · ${list[0].rec}`;}
    const box=_ttEl('tt-list');if(!box)return;
    let h=list.map(m=>`<div class="tt-row"><div class="tt-row-logo">${sLogo({name:m.name,mascot:m.mascot,c1:m.c1,c2:m.c2},46)}</div>
      <div class="tt-row-info"><div class="tt-row-t">${m.name} ${m.mascot}</div><div class="tt-row-s">${m.coach?m.coach+' · ':''}${m.cls||''} · ${m.season} season · ${m.rec}${m.phase?' · '+m.phase:''}</div><div class="tt-row-s">Saved ${ttFmtDate(m.savedAt)}</div></div>
      <div class="tt-row-b"><button class="btn bsm" onclick="ttLoadSlot('${m.id}')">Load</button>${OLS.user&&OLS.backend&&OLS.backend.cloudPut?`<button class="bgh bsm" onclick="cloudUpload('${m.id}',this)">Upload</button>`:''}${OLS.user&&OLS.backend&&OLS.backend.leaguePublish?`<button class="bgh bsm" onclick="lgPublish('${m.id}',this)" title="Share this whole career in Community Creations">Share</button>`:''}<button class="bgh bsm" onclick="exportSave('${m.id}')" title="The whole career as a file">Export</button><button class="bgh bsm" onclick="exportSaveTeams('${m.id}')" title="Only the teams: every school, college and pro team with names, colors and logos">Export teams</button><button class="bgh bsm tt-del" onclick="ttDelete('${m.id}')">Delete</button></div></div>`).join('');
    if(legacy&&!list.length)h+=`<div class="tt-row"><div class="tt-row-info"><div class="tt-row-t">Browser backup from an older version</div><div class="tt-row-s">Your last save before save slots existed.</div></div><div class="tt-row-b"><button class="btn bsm" onclick="ttLoadLegacy()">Load</button></div></div>`;
    if(!h)h=`<div class="tt-empty">No saves on this device yet. Start a new game, or import a save file you exported earlier.</div>`;
    box.innerHTML=h;
  });
  try{ttRefreshCloud();if(cloudMaySignedIn()&&OLS.cloud==null&&!OLS._cloudLoading){OLS._cloudLoading=true;cloudReady().then(()=>cloudRefresh()).finally(()=>{OLS._cloudLoading=false;});}}catch(e){}
}
function ttDelete(id){if(!confirm('Delete this save from this device? This cannot be undone.'))return;svDelete(id).then(ttRefresh);}
function ttLoadSlot(id){svLoadObj(id).then(d=>{if(!d){notify('Save not found','e');return;}if(applySaveText(d))hideTitle();}).catch(e=>notify('Could not load the save: '+e.message,'e'));}
function ttLoadLegacy(){const j=lsLoad(LS_KEY);if(j&&applySaveText(j)){hideTitle();saveGame(true);}}
function ttImport(){loadGame();}
// ═══════════ COACH CREATOR ═══════════
const CC_HAIR=[[0,'Buzz cut'],[1,'Short crop'],[2,'Fade'],[15,'Quiff'],[7,'Side part'],[14,'Shaggy'],[16,'Mullet'],[10,'Flow'],[19,'Man bun'],[3,'Curly top'],[13,'Curly fade'],[20,'Curly mop'],[4,'Waves'],[5,'Cornrows'],[6,'Twists'],[18,'Twist fade'],[11,'Locs'],[12,'Braids'],[17,'Afro'],[8,'Frohawk'],[9,'Shaved'],[21,'Middle part'],[22,'Crew cut'],[23,'Pompadour'],[24,'Edgar'],[25,'High-top fade'],[26,'Sponge twists'],[27,'Spiky'],[28,'Undercut'],[29,'Long hair'],[30,'Buzz with design'],[31,'Fade with lineup'],[32,'Waves with lineup'],[33,'Cornrows straight back'],[34,'Zig-zag cornrows'],[35,'Side cornrows'],[36,'Cornrows with fade']];
const CC_HC=['#0e0b09','#2e2119','#4a3020','#6b4a2b','#8a6a46','#b89a64','#d8c08a','#ece0b8','#9c4a22','#b5562e','#6b5a4a','#8a8a8a','#c9c9c9','#ececec'];
const CC_EYE=['#3a2416','#5a3a22','#4a6fa5','#5b7f5a','#6e7f86'];
const CC_FH=[['none','None'],['stubble','Stubble'],['mustache','Mustache'],['goatee','Goatee'],['beard','Beard']];
const CC_BG=['Former college quarterback','Former lineman','Defensive mastermind','Offensive play-caller','Analytics guru','Player developer','Small-town motivator','Longtime assistant'];
const CC_FN=['Mike','Dave','Tom','Ray','Darnell','Luis','Kevin','Brian','Marcus','Steve','Andre','Tony','Greg','Jason','Carlos','Terrence','Scott','Eric'];
const CC_LN=['Harper','Coleman','Reyes','Whitfield','Brooks','Sutton','McAllister','Okafor','Delgado','Strickland','Hayes','Barlow','Kowalski','Nguyen','Fontaine','Mercer'];
let _cc=null;
function ccRand(keep){
  const r=()=>Math.random();const ti=Math.floor(r()*8),dark=ti>=4;
  const hcs=dark?[0,1,1,2]:[0,1,2,3,4,5,6];const age=28+Math.floor(r()*30);
  const hc=age>=54&&r()<.6?CC_HC[11+Math.floor(r()*3)]:CC_HC[hcs[Math.floor(r()*hcs.length)]];
  const look={ti,hs:CC_HAIR[Math.floor(r()*CC_HAIR.length)][0],hc,eye:ti<=2&&r()<.4?CC_EYE[2+Math.floor(r()*3)]:CC_EYE[Math.floor(r()*2)],fh:CC_FH[Math.floor(r()*CC_FH.length)][0],glasses:r()<.25,cap:r()<.35};
  _cc=Object.assign(_cc||{},{look,age,bg:CC_BG[Math.floor(r()*CC_BG.length)],seed:900000+Math.floor(r()*90000)});
  if(!keep){_cc.first=CC_FN[Math.floor(r()*CC_FN.length)];_cc.last=CC_LN[Math.floor(r()*CC_LN.length)];}
}
function openCoachCreator(){
  if(!_selectedOfferTeam){alert('Click a highlighted county on the map and choose a school to accept its offer first.');return;}
  if(pccOn()&&!window._pccDone){pccOpen();return;}
  pccMode(false);
  if(!_cc){ccRand(false);const cur=(_ttEl('s-coach')&&_ttEl('s-coach').value)||'';const parts=cur.replace(/^Coach\s+/,'').trim().split(/\s+/);if(cur&&cur!=='Coach Smith'&&parts[0]){_cc.first=parts[0];_cc.last=parts.slice(1).join(' ')||_cc.last;}}
  _ttEl('coachc').classList.remove('hid');ccRender();window.scrollTo(0,0);
}
function ccBack(){_ttEl('coachc').classList.add('hid');window._pccDone=false;}
function ccSet(k,v){if(k in(_cc.look||{})||['ti','hs','hc','eye','fh','glasses','cap'].includes(k))_cc.look[k]=v;else _cc[k]=v;ccRender(k);}
function ccHair(d){const i=CC_HAIR.findIndex(h=>h[0]===_cc.look.hs);_cc.look.hs=CC_HAIR[(i+d+CC_HAIR.length)%CC_HAIR.length][0];ccRender();}
function ccStart(){
  const fn=(_ttEl('cc-first').value||'').trim()||'Coach',ln=(_ttEl('cc-last').value||'').trim();
  _cc.first=fn;_cc.last=ln;_cc.age=+_ttEl('cc-age').value||40;_cc.bg=_ttEl('cc-bg').value;
  const name=(fn+' '+ln).trim();_ttEl('s-coach').value='Coach '+(ln||fn);
  window._coachDraft={name:'Coach '+(ln||fn),first:fn,last:ln,full:name,age:_cc.age,bg:_cc.bg,seed:_cc.seed,look:Object.assign({},_cc.look),hiredYr:1};
  _ttEl('coachc').classList.add('hid');const pf=_ttEl('cc-face');if(pf)pf.innerHTML='';
  try{startGame();}catch(err){console.error(err);_ttEl('coachc').classList.remove('hid');ccRender();alert('The game could not start: '+err.message);}
}
function ccRender(changed){
  const t=_selectedOfferTeam||{name:'',mascot:'',c1:'#1d3557',c2:'#ffffff',cls:''};const L=_cc.look;
  const pv=_ttEl('cc-face');if(pv)pv.innerHTML=face(_cc.seed,230,Object.assign({},L,{coach:true,c1:t.c1,c2:t.c2,age:_cc.age,ini:(t.name||'')[0]}));
  if(changed==='age'||changed==='first'||changed==='last'||changed==='bg'){return;}
  const sw=(arr,cur,k)=>arr.map(c=>`<button class="cc-sw${c===cur?' on':''}" style="background:${c}" onclick="ccSet('${k}','${c}')" aria-label="${c}"></button>`).join('');
  const skin=FACE_SKIN.map((c,i)=>`<button class="cc-sw${i===L.ti?' on':''}" style="background:${c}" onclick="ccSet('ti',${i})" aria-label="skin ${i+1}"></button>`).join('');
  const seg=CC_FH.map(f=>`<button class="cc-seg${f[0]===L.fh?' on':''}" onclick="ccSet('fh','${f[0]}')">${f[1]}</button>`).join('');
  const hairName=(CC_HAIR.find(h=>h[0]===L.hs)||[0,'Custom'])[1];
  _ttEl('cc-form').innerHTML=`
   <div class="cc-row2"><label>First name<input id="cc-first" value="${(_cc.first||'').replace(/"/g,'&quot;')}" maxlength="18" oninput="_cc.first=this.value"></label><label>Last name<input id="cc-last" value="${(_cc.last||'').replace(/"/g,'&quot;')}" maxlength="20" oninput="_cc.last=this.value"></label></div>
   <div class="cc-row2"><label>Age <b id="cc-agev">${_cc.age}</b><input id="cc-age" type="range" min="25" max="70" value="${_cc.age}" oninput="_cc.age=+this.value;document.getElementById('cc-agev').textContent=this.value;ccRender('age')"></label>
   <label>Background<select id="cc-bg" onchange="_cc.bg=this.value">${CC_BG.map(b=>`<option${b===_cc.bg?' selected':''}>${b}</option>`).join('')}</select></label></div>
   <div class="cc-lbl">Skin tone</div><div class="cc-sws">${skin}</div>
   <div class="cc-lbl">Hairstyle</div><div class="cc-hair"><button class="bgh" onclick="ccHair(-1)" aria-label="previous">&#9664;</button><span>${hairName}</span><button class="bgh" onclick="ccHair(1)" aria-label="next">&#9654;</button></div>
   <div class="cc-lbl">Hair color</div><div class="cc-sws">${sw(CC_HC,L.hc,'hc')}</div>
   <div class="cc-lbl">Facial hair</div><div class="cc-segs">${seg}</div>
   <div class="cc-lbl">Eye color</div><div class="cc-sws">${sw(CC_EYE,L.eye,'eye')}</div>
   <div class="cc-segs" style="margin-top:12px"><button class="cc-seg${L.glasses?' on':''}" onclick="ccSet('glasses',${!L.glasses})">Glasses</button><button class="cc-seg${L.cap?' on':''}" onclick="ccSet('cap',${!L.cap})">Team cap</button><button class="cc-seg" onclick="ccRand(true);ccRender()">Randomize look</button></div>`;
  const hd=_ttEl('cc-team');if(hd)hd.innerHTML=`${sLogo(t,40)}<div><div class="cc-tn">${t.name} ${t.mascot}</div><div class="cc-ts">${t.cls||''} · your new program</div></div>`;
}
function coachCard(){
  if(typeof G==='undefined'||!G||!G.coach||!G.coach.look)return'';const ms=myS()||{},c=G.coach,age=(c.age||40)+((G.yr||1)-(c.hiredYr||1));
  return`<div class="dash-coach">${face(c.seed,58,Object.assign({},c.look,{coach:true,c1:ms.c1,c2:ms.c2,age,ini:(ms.name||'')[0]}))}<div><div class="dc-l">Head Coach</div><div class="dc-n">${c.full||c.name}</div><div class="dc-l">${c.bg?c.bg+' · ':''}age ${age}</div></div></div>`;
}
// v2.05 home-screen app: offline support and storage that the browser should not clear
(function(){try{
  // v2.14: inside the iOS/Android app the files are bundled, so the offline cache is not needed
  if(!IS_NATIVE&&'serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1'))
    window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{});});
  if(navigator.storage&&navigator.storage.persist)navigator.storage.persisted().then(p=>{if(!p)navigator.storage.persist().catch(()=>{});}).catch(()=>{});
}catch(e){}})();
function _menuInit(){
  const c=document.getElementById('s-coach');const pnl=c&&c.closest('div[style*="border-top"]');if(pnl)pnl.style.display='none';
  showTitle(false);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',_menuInit);else setTimeout(_menuInit,0);

// error log: the last errors (menus and Game Day) stay on this device, so a player can send a report (Settings → Error report)
function gpErrLog(msg,stack,where){try{const L=JSON.parse(localStorage.getItem('gpgm_errlog')||'[]');let ctx='';try{ctx=G&&G.myId?`yr${G.yr} ${G.phase} wk${G.week||0} pl${G.players.length}`:'menu';}catch(_){}
  L.push({t:new Date().toISOString(),w:where||'app',m:String(msg||'').slice(0,300),s:String(stack||'').split('\n').slice(0,6).join(' | ').slice(0,700),c:ctx,ua:navigator.userAgent.slice(0,140)});while(L.length>25)L.shift();localStorage.setItem('gpgm_errlog',JSON.stringify(L));}catch(_){}}
window.gpErrLog=gpErrLog;
// crash detection: a heartbeat while the game runs; if the last session never closed cleanly, it ended in a crash or a forced reload
(function(){try{const K='gpgm_alive',hb=()=>{try{let c='menu';try{c=document.getElementById('gd-ov')?'gameday':(G&&G.myId?'career '+(G._page||''):'menu');}catch(_){}
    const m=performance&&performance.memory?Math.round(performance.memory.usedJSHeapSize/1e6)+'MB':'';localStorage.setItem(K,JSON.stringify({t:Date.now(),c,m}));}catch(_){}};
  const prev=JSON.parse(localStorage.getItem(K)||'null');
  if(prev&&Date.now()-prev.t<15*60000){gpErrLog('The last session ended without closing (crash or reload) in '+prev.c+(prev.m?', memory '+prev.m:''),'', 'crash');
    setTimeout(()=>{try{notify('Gridiron 27 closed unexpectedly last time. If it keeps happening, turn on Performance mode in Settings and send the problem report from Settings.','w');}catch(_){}},2500);}
  const bye=()=>{try{localStorage.removeItem(K);}catch(_){}};hb();setInterval(()=>{if(document.visibilityState!=='hidden')hb();},5000);window.addEventListener('pagehide',bye);window.addEventListener('beforeunload',bye);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')bye();else hb();});}catch(_){}})();
// the problem report: the last errors plus the device, so a crash can be traced (nothing is sent anywhere: the player copies it)
window.gpReport=function(){let gpu='';try{const c=document.createElement('canvas').getContext('webgl'),d=c&&c.getExtension('WEBGL_debug_renderer_info');gpu=d?c.getParameter(d.UNMASKED_RENDERER_WEBGL):'';}catch(_){}
  const L=(()=>{try{return JSON.parse(localStorage.getItem('gpgm_errlog')||'[]');}catch(_){return[];}})();
  const txt=JSON.stringify({app:'Gridiron 27 web beta',when:new Date().toISOString(),ua:navigator.userAgent,cores:navigator.hardwareConcurrency,memGB:navigator.deviceMemory,screen:screen.width+'x'+screen.height+'@'+devicePixelRatio,gpu,errors:L.slice(-15)},null,1);
  const done=()=>notify('Problem report copied. Paste it in a message to the developer.');
  try{navigator.clipboard.writeText(txt).then(done,()=>openMo(`<h2>Problem report</h2><textarea style="width:100%;height:50vh" readonly>${txt.replace(/</g,'&lt;')}</textarea><div style="text-align:right;margin-top:8px"><button class="btn" onclick="clo()">Close</button></div>`));}catch(_){openMo(`<textarea style="width:100%;height:50vh" readonly>${txt.replace(/</g,'&lt;')}</textarea>`);}};
window.addEventListener('error',function(e){try{gpErrLog(e&&e.message,e&&e.error&&e.error.stack,'app');if(e&&e.message&&typeof notify==='function')notify('Something went wrong: '+e.message,'e');}catch(_){}});
window.addEventListener('unhandledrejection',function(e){try{const r=e&&e.reason;gpErrLog(r&&r.message||String(r),r&&r.stack,'promise');}catch(_){}});
window.errReport=function(){let L=[];try{L=JSON.parse(localStorage.getItem('gpgm_errlog')||'[]');}catch(e){}
  const txt=L.length?L.map(x=>`${x.t} [${x.w}] ${x.m}\n  at ${x.s}\n  (${x.c}) ${x.ua}`).join('\n\n'):'No errors recorded on this device.';
  openMo(`<h2>Error report</h2><div style="font-size:12px;color:var(--mu);margin-bottom:8px">If the game misbehaves or crashes, copy this and send it with a short note about what you were doing.</div><textarea id="err-txt" readonly style="width:100%;height:42vh;font-size:11px;font-family:monospace">${txt.replace(/</g,'&lt;')}</textarea>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px"><button class="bgh" onclick="try{localStorage.removeItem('gpgm_errlog');}catch(e){}clo();notify('Error report cleared.')">Clear</button><button class="btn" onclick="const t=document.getElementById('err-txt');t.select();try{navigator.clipboard.writeText(t.value).then(()=>notify('Copied.'),()=>{document.execCommand('copy');notify('Copied.');});}catch(e){document.execCommand('copy');notify('Copied.');}">Copy</button><button class="bgh" onclick="clo()">Close</button></div>`);};

// ═══════════ LEAGUE ENGINE: real weekly pairings, realistic scores, team schedules ═══════════
function lgDrive(off,def,r){const d=off-def,pTD=clamp(.3+.012*d,.05,.72),pFG=clamp(.1+.002*d,.04,.14),x=r();
  if(x<pTD){const y=r();return y<.03?6:y<.07?8:7;}if(x<pTD+pFG)return 3;if(x<pTD+pFG+.006)return 2;return 0;}
// Realistic final score. aWins: true/false forces the winner, undefined lets it fall naturally. Returns [a,b,ot]
function mercyOn(){try{return!(typeof G!=='undefined'&&G&&G.rules&&G.rules.mercy===false);}catch(e){return true;}}
function lgScore(oa,ob,aWins,r){
  r=r||Math.random;
  // mercy rule: a 35-point lead in the second half starts a running clock, so the rest of the game has far fewer drives
  const mer=mercyOn();
  const one=(x,y)=>{let a=0,b=0;const n=10+Math.floor(r()*3);for(let i=0;i<n;i++){if(mer&&i>=n/2&&Math.abs(a-b)>=35&&r()<.6)continue;a+=lgDrive(x,y,r);b+=lgDrive(y,x,r);}if(r()<.05)a+=7;if(r()<.05)b+=7;
    if(a-b>49)a=b+42+Math.floor(r()*2)*7;if(b-a>49)b=a+42+Math.floor(r()*2)*7;return[Math.min(a,70),Math.min(b,70)];};
  const ot=(a,b,aw)=>{if(r()<.4){a+=7;b+=7;}const w=r()<.6?7:r()<.6?3:8;if(aw)a+=w;else b+=w;return[a,b,true];};
  for(let t=0;t<12;t++){const s=one(oa,ob);
    if(s[0]===s[1]){if(r()<.5)continue;const aw=aWins===undefined?r()<.5:aWins;return ot(s[0],s[1],aw);}
    if(aWins===undefined||(s[0]>s[1])===aWins)return[s[0],s[1],false];}
  // the forced winner is the underdog: upsets are usually close, so play it as an even game
  const m=(oa+ob)/2;for(let t=0;t<20;t++){const s=one(m,m);if(s[0]!==s[1]){const hi=Math.max(s[0],s[1]),lo=Math.min(s[0],s[1]);return aWins?[hi,lo,false]:[lo,hi,false];}}
  return aWins?[21,17,false]:[17,21,false];
}
function lgDivs(){const seen=new Set(),out=[];const add=d=>{if(d&&!seen.has(d)){seen.add(d);out.push(d);}};(G.divisions||[]).forEach(add);if(G.allLeagues)Object.values(G.allLeagues).forEach(l=>(l.divisions||[]).forEach(add));return out;}
function lgPairs(teams,wk){
  const arr=teams.slice().sort((x,y)=>x.id-y.id);if(arr.length<2)return[];if(arr.length%2)arr.push(null);
  const n=arr.length,rr=((wk-1)%(n-1)+(n-1))%(n-1),rest=arr.slice(1),rot=rest.slice(rr).concat(rest.slice(0,rr)),full=[arr[0]].concat(rot),out=[];
  for(let i=0;i<n/2;i++)out.push([full[i],full[n-1-i]]);return out;
}
function lgMyOppAt(wk){const g=(G.sched||[]).find(x=>x.wk===wk&&x.type==='regular');return g?g.oppId:null;}
function lgLog(s,e){if(!s.gl||s.gl.yr!==G.yr)s.gl={yr:G.yr,g:[]};s.gl.g=s.gl.g.filter(x=>!(x.wk===e.wk&&!x.po&&!e.po));s.gl.g.push(e);}
function lgPlay(s,score,win,oppId){
  let pl=sPlayers(s.id).filter(p=>p.inj===0);if(s.lite&&pl.length&&!(window._gdOppStats&&window._gdOppStats.sid===s.id))pl=pl.concat(litePH(s));
  if(window._gdOppStats&&window._gdOppStats.sid===s.id){applyStats(window._gdOppStats.sm);}
  else if(pl.length){const sm=genStats(pl,score,win,s.offS,s.defS,s.id,oppId);applyStats(sm);for(const p of pl)if(Math.random()<.02)p.inj=rng(1,2);}
  for(const p of sPlayers(s.id))if(p.inj>0)p.inj--;
  for(const p of sPlayers(s.id))if(p.seasStats.gp>0||p.pos==='OL'||p.pos==='K')checkStarsOffers(p,[],true);
  for(const p of sPlayers(s.id))if(p.yr>=11&&!p.committed&&p.offers&&p.offers.length)checkCommit(p);
}
function lgSimWeek(...a){const r=lgSimWeek0(...a);try{starCap5();}catch(e){}return r;}
function lgSimWeek0(wk,myOppId,silent,oppScore,myScore,oppWon){
  const opp=getS(myOppId);
  if(opp){lgLog(opp,{wk,o:G.myId,h:(wk%2)?1:0,us:oppScore,them:myScore});lgPlay(opp,oppScore,oppWon,G.myId);}
  const S=lgBuildSchedule();S.locked=true;const played=new Set();
  if(opp)played.add(opp.id);played.add(G.myId);
  for(const pr of(S.games[wk]||[])){
    const a=getS(pr[0]),b=getS(pr[1]);if(!a||!b||a.id===G.myId||b.id===G.myId||a.id===myOppId||b.id===myOppId)continue;
    const oa=teamOvr(a.id),ob=teamOvr(b.id),home=(wk+a.id)%2===0,_wf=wxSimF(gameWx(home?a:b,wk-1,home?b.id:a.id)),pa=.5+(1/(1+Math.exp(-((oa+(home?1.5:-1.5))-ob)/5.5))-.5)*_wf.upset,aW=Math.random()<pa;
    const _s0=lgScore(oa,ob,aW),sc=wxScale(_s0[0],_s0[1],_wf.sc);sc[2]=_s0[2];
    if(aW){a.wins++;b.losses++;}else{b.wins++;a.losses++;}
    lgLog(a,{wk,o:b.id,h:home?1:0,us:sc[0],them:sc[1],ot:sc[2]?1:0});lgLog(b,{wk,o:a.id,h:home?0:1,us:sc[1],them:sc[0],ot:sc[2]?1:0});
    lgPlay(a,sc[0],aW,b.id);lgPlay(b,sc[1],!aW,a.id);played.add(a.id);played.add(b.id);
  }
  for(const t of allSchoolsAll())if(!played.has(t.id))for(const p of sPlayers(t.id))if(p.inj>0)p.inj--;
}
function lgTeamSchedHtml(s){
  if(!s)return'';const yr=G.yr,base=(G.baseYear||2026)+(G.yr-1);
  const regWeeks=(G.sched||[]).filter(g=>g.type==='regular').map(g=>g.wk);
  const rows=[];
  if(s.id===G.myId){
    (G.sched||[]).filter(g=>g.type==='regular'||g.type==='playoff').forEach(g=>{const o=getS(g.oppId);rows.push({wk:g.wk,po:g.type==='playoff',o,res:g.result&&g.result!=='bye'?{w:g.result==='W',us:g.my,them:g.opp}:null});});
  }else{
    const log=(s.gl&&s.gl.yr===yr)?s.gl.g:[];
    for(const wk of regWeeks){
      const e=log.find(x=>x.wk===wk&&!x.po);
      let oid=null;
      if(e)oid=e.o;else oid=lgOppAt(s.id,wk);
      if(oid===G.myId&&!e){const g=(G.sched||[]).find(x=>x.wk===wk&&x.oppId===s.id);rows.push({wk,o:myS(),res:g&&g.result?{w:g.result==='L',us:g.opp,them:g.my}:null});}
      else rows.push({wk,o:oid!=null?getS(oid):null,res:e?{w:e.us>e.them,us:e.us,them:e.them,ot:e.ot}:null});
    }
    if(G.playoff&&G.playoff.rounds)G.playoff.rounds.forEach(rd=>(rd.results||[]).forEach(x=>{if(x.b==null)return;if(x.a===s.id||x.b===s.id){const oid=x.a===s.id?x.b:x.a,w=x.winner===s.id;rows.push({wk:'P'+rd.round,po:true,o:getS(oid),res:{w,us:w?x.wScore:x.lScore,them:w?x.lScore:x.wScore}});}}));
  }
  const W=rows.filter(r=>r.res&&r.res.w).length,L=rows.filter(r=>r.res&&!r.res.w).length;
  const body=rows.map(r=>`<tr><td style="font-weight:800;white-space:nowrap">${r.po?'Playoff':'Wk '+r.wk}</td>
    <td>${r.o?`<div style="display:flex;align-items:center;gap:8px;cursor:pointer" onclick="viewSchool(${r.o.id})">${sLogo(r.o,26)}<span>${r.o.name} ${r.o.mascot}</span></div>`:'<span style="color:var(--mu)">Bye</span>'}</td>
    <td>${r.res?`<b style="color:${r.res.w?'var(--gn)':'var(--rd)'}">${r.res.w?'W':'L'}</b> ${r.res.us}-${r.res.them}${r.res.ot?' (OT)':''}`:'<span style="color:var(--mu)">upcoming</span>'}</td></tr>`).join('');
  return`<div style="font-size:12px;color:var(--mu);margin-bottom:8px">${base} season · ${W}-${L} in games shown</div><div style="overflow-x:auto"><table style="width:100%"><thead><tr><th>Week</th><th>Opponent</th><th>Result</th></tr></thead><tbody>${body||'<tr><td colspan="3" style="color:var(--mu);text-align:center;padding:14px">No games scheduled yet</td></tr>'}</tbody></table></div>`;
}

