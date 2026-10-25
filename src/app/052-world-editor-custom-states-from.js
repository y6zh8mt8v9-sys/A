// ═══════════ v2.16 WORLD EDITOR: custom states from real counties, world files, Community Creations ═══════════
const ME={view:null,active:null};
const ME_COL=['#e4572e','#17bebb','#ffc914','#76b041','#8f5bd6','#ff8fab','#2e86ab','#f18f01','#3bb273','#c44536'];
function meCfg(){const D=WS.draft;if(!D.geo)D.geo=usaDefault();if(D.geo.mode==='classic')return null;D.geo.mode='usa';D.geo.custom=Array.isArray(D.geo.custom)?D.geo.custom:[];return D.geo;}
function meBody(){
  const g=meCfg();
  if(!g)return`<div style="font-size:13px;color:var(--mu);margin-bottom:10px">The map editor works with the Real USA world. Your League Setup uses the classic made-up country.</div><button class="btn" onclick="WS.draft.geo=usaDefault();wsRender()">Switch to the Real USA</button>`;
  const cu=g.custom,X=usaWorld(cu),G0=usaGeo(),all=Object.keys(X.st).sort((a,b)=>X.st[a].name.localeCompare(X.st[b].name));
  if(!ME.view||!G0.st[ME.view])ME.view='TX';if(ME.active&&!cu.some(c=>c.ab===ME.active))ME.active=null;
  // owner of every county in the draft (custom states win), and the box around the state on screen
  const own={};cu.forEach((c,i)=>c.counties.forEach(k=>{if(!(k in own))own[k]=i;}));
  const R=G0.st[ME.view].rings.flat(),xs=R.map(p=>p[0]),ys=R.map(p=>p[1]);let x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
  const pw=(x1-x0)*0.35+10,ph=(y1-y0)*0.35+10;x0-=pw;x1+=pw;y0-=ph;y1+=ph;
  let paths='';
  for(const ab in G0.cn)for(const c of G0.cn[ab]){const[cx,cy]=_ugCen(c.rings[0]);if(cx<x0||cx>x1||cy<y0||cy>y1)continue;
    const i=own[c.key],fill=i!=null?ME_COL[i%ME_COL.length]:ab===ME.view?'#d9cfa8':'#c4c8b8';
    paths+=`<path d="${c.rings.map(_polyPath).join(' ')}" fill="${fill}" stroke="#fff" stroke-width="${(x1-x0)/900}" style="cursor:pointer" onclick="meClick('${c.key.replace(/'/g,"\\'")}')"><title>${c.name} (${ab})${i!=null?' → '+cu[i].name:''}</title></path>`;}
  for(const ab in X.st){const S=X.st[ab];paths+=`<path d="${S.rings.map(_polyPath).join(' ')}" fill="none" stroke="#2c2416" stroke-width="${(x1-x0)/300}" pointer-events="none"/>`;}
  const list=cu.map((c,i)=>{const n=c.counties.length,st=X.st[c.ab];return`<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;padding:6px;border-radius:8px;background:${ME.active===c.ab?'rgba(63,162,243,.18)':'var(--s2)'};border:1px solid var(--bd)">
    <span style="width:14px;height:14px;border-radius:4px;background:${ME_COL[i%ME_COL.length]}"></span>
    <input id="me-n-${i}" value="${c.name}" maxlength="30" style="width:150px" placeholder="State name">
    <input id="me-a-${i}" value="${c.ab}" maxlength="3" style="width:56px;" placeholder="ABR">
    <span style="font-size:11px;color:var(--mu)">${n} counties${st?` · about ${usaTeams(c.ab,X)} schools`:''}</span>
    <button class="${ME.active===c.ab?'btn':'bgh'} bxs" onclick="wsGrab();ME.active='${c.ab}';wsRender()">${ME.active===c.ab?'Painting':'Paint'}</button>
    <button class="bgh bxs" onclick="wsGrab();meDel(${i})">Delete</button></div>`;}).join('');
  return`<div style="font-size:12px;color:var(--mu);margin-bottom:8px">Make your own states out of real counties. Create a state, press <b>Paint</b>, then tap counties on the map to move them into it (tap again to give one back). Its school count and style follow the people it holds.</div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px"><button class="btn bxs" onclick="wsGrab();meNew()">+ New state</button>
      <label style="font-size:12px;font-weight:800">Show <select onchange="wsGrab();ME.view=this.value;wsRender()" style="padding:5px 8px;border-radius:8px">${Object.keys(G0.st).sort((a,b)=>G0.st[a].name.localeCompare(G0.st[b].name)).map(a=>`<option value="${a}"${a===ME.view?' selected':''}>${G0.st[a].name}</option>`).join('')}</select></label>
      ${ME.active?`<button class="bgh bxs" onclick="wsGrab();mePaintState()">Paint all of ${G0.st[ME.view].name}</button>`:''}</div>
    <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:8px">${list||'<div style="font-size:12px;color:var(--mu)">No custom states yet.</div>'}</div>
    <svg viewBox="${x0} ${y0} ${x1-x0} ${y1-y0}" style="width:100%;max-height:44vh;background:#7fc6ee;border-radius:10px">${paths}</svg>`;
}
function meGrab(){const g=meCfg();if(!g)return;g.custom.forEach((c,i)=>{const n=document.getElementById('me-n-'+i),a=document.getElementById('me-a-'+i);
  if(n)c.name=wsClean(n.value)||c.name;if(a){const v=String(a.value||'').toUpperCase().replace(/[^A-Z]/g,'').slice(0,3);if(v.length>=2&&!USST[v]&&!USA_RESERVED.has(v)&&!g.custom.some((o,j)=>j!==i&&o.ab===v)){if(ME.active===c.ab)ME.active=v;c.ab=v;}}});}
window.meNew=function(){const g=meCfg();if(!g)return;let k=1,ab;do{ab='N'+String.fromCharCode(64+k);k++;}while(g.custom.some(c=>c.ab===ab)||USST[ab]);
  g.custom.push({ab,name:'New State '+(g.custom.length+1),counties:[]});ME.active=ab;wsRender();};
window.meDel=function(i){const g=meCfg();if(!g)return;if(!confirm(`Delete ${g.custom[i].name}? Its counties go back to their real states.`))return;g.custom.splice(i,1);wsRender();};
window.meClick=function(key){const g=meCfg();if(!g)return;wsGrab();const c=g.custom.find(x=>x.ab===ME.active);if(!c){notify('Make a state and press Paint first','w');return;}
  const j=c.counties.indexOf(key);if(j>=0)c.counties.splice(j,1);else{for(const o of g.custom){const q=o.counties.indexOf(key);if(q>=0)o.counties.splice(q,1);}c.counties.push(key);}wsRender();};
window.mePaintState=function(){const g=meCfg();if(!g)return;const c=g.custom.find(x=>x.ab===ME.active);if(!c)return;const keys=usaGeo().cn[ME.view].map(x=>x.key);
  for(const o of g.custom)o.counties=o.counties.filter(k=>!keys.includes(k));c.counties.push(...keys);wsRender();};
// ── world files ──
function worldSanitize(W){
  if(!W||typeof W!=='object')throw new Error('That is not a world file.');const str=v=>wsClean(v),o={};
  const map=(m,f)=>{const r={};if(m&&typeof m==='object'&&!Array.isArray(m))for(const k of Object.keys(m).slice(0,6000)){const v=f(m[k]);if(v!=null&&v!=='')r[String(k).slice(0,60)]=v;}return r;};
  if(W.geo&&typeof W.geo==='object'){
    const cu=Array.isArray(W.geo.custom)?W.geo.custom.slice(0,30).map(c=>({ab:String((c&&c.ab)||'').toUpperCase().replace(/[^A-Z]/g,'').slice(0,3),name:str(c&&c.name),counties:Array.isArray(c&&c.counties)?c.counties.slice(0,4000).map(k=>String(k).slice(0,60)):[]})).filter(c=>c.ab.length>=2&&c.name&&!USST[c.ab]&&!USA_RESERVED.has(c.ab)):[];
    o.geo=W.geo.mode==='classic'?{mode:'classic'}:{mode:'usa',states:Array.isArray(W.geo.states)?W.geo.states.slice(0,80).map(x=>String(x).slice(0,3)):undefined,home:String(W.geo.home||'').slice(0,3),custom:cu};}
  o.states=map(W.states,str);o.counties=map(W.counties,str);
  const L=(a,n)=>Array.isArray(a)?a.slice(0,n).map(str).filter(Boolean):undefined;
  if(W.colleges&&typeof W.colleges==='object'){o.colleges={};for(const k of['FBS','FCS','D2','D3','NAIA','JUCO']){const v=L(W.colleges[k],400);if(v&&v.length)o.colleges[k]=v;}}
  if(W.colMeta&&typeof W.colMeta==='object'){const hx=v=>/^#[0-9a-f]{6}$/i.test(v||'')?v:undefined,lk=v=>v&&typeof _LGO!=='undefined'&&_LGO[v]?v:undefined;o.colMeta=map(W.colMeta,m=>{if(!m||typeof m!=='object')return null;const r={mascot:m.mascot?str(m.mascot).slice(0,24):undefined,abbr:m.abbr?String(m.abbr).toUpperCase().replace(/[^A-Z&]/g,'').slice(0,5):undefined,c1:hx(m.c1),c2:hx(m.c2),logoKey:lk(m.logoKey),mash:lk(m.mash),st:m.st?String(m.st).slice(0,3):undefined,pr:m.pr?clamp(Math.round(+m.pr)||50,1,99):undefined,customLogo:typeof m.customLogo==='string'&&/^data:image\/(png|jpeg|webp|gif);base64,/.test(m.customLogo)&&m.customLogo.length<160000?m.customLogo:undefined};for(const x in r)if(r[x]===undefined)delete r[x];return Object.keys(r).length?r:null;});}
  if(W.pro&&typeof W.pro==='object'){o.pro={};for(const k of['NGL','SFL','MGL']){const v=L(W.pro[k],64);if(v&&v.length)o.pro[k]=v;}}
  o.divs=map(W.divs,a=>L(a,64));o.xdivs=map(W.xdivs,a=>L(a,200));
  o.size=map(W.size,z=>z&&typeof z==='object'?{t:clamp(Math.round(+z.t)||8,8,160),d:clamp(Math.round(+z.d)||1,1,16)}:null);
  if(W.stars&&typeof W.stars==='object'){o.stars={};for(const k of[5,4,3,2])if(W.stars[k]!=null)o.stars[k]=clamp(Math.round(+W.stars[k])||0,0,5000);}
  for(const k of['frMult','colMult'])if(W[k]!=null)o[k]=clamp(+W[k]||1,0.5,2);
  {const tb=tbPackClean(W.tb);if(tb)o.tb=tb;}
  o.custFor=W.custFor==='usa'?'usa':W.custFor==='classic'?'classic':(o.geo&&o.geo.mode==='usa'?'usa':'classic');
  if(W.meta&&typeof W.meta==='object')o.meta={name:str(W.meta.name),desc:String(W.meta.desc||'').replace(/[<>&"'`\\]/g,'').slice(0,200)};
  return o;
}
function worldSummary(W){const g=W&&W.geo;if(!g||g.mode==='classic')return'Classic country';const n=(g.states||Object.keys(USST)).length,c=(g.custom||[]).length;return`Real USA · ${n} state${n===1?'':'s'}${c?` · ${c} custom`:''}`;}
function worldExport(){try{wsGrab();}catch(e){}const W=worldSanitize(WS.draft||{}),nm=(W.meta&&W.meta.name)||'My world';{const tb=tbPackOut();if(tb)W.tb=tb;}
  const blob=new Blob([JSON.stringify({app:'Gridiron 27',type:'world',v:1,name:nm,world:W},null,1)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=nm.replace(/[^A-Za-z0-9]+/g,'_').slice(0,40)+'.gpworld.json';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},800);notify('World file saved');}
function worldImportFile(inp){const f=inp&&inp.files&&inp.files[0];if(!f)return;if(f.size>3e6){notify('That file is too big for a world file','e');return;}
  const r=new FileReader();r.onload=()=>{try{const j=JSON.parse(r.result);if(!j||j.type!=='world')throw new Error('That is not a world file.');WS.draft=worldSanitize(j.world);if(!WS.draft.meta)WS.draft.meta={name:wsClean(j.name)};
      const tb=WS.draft.tb;delete WS.draft.tb;if(tb)tbPackPending(tb);WS.tab='share';wsRender();notify('World loaded'+(tb?` with ${Object.keys(tb.ed).length+tb.add.length} edited teams`:'')+'. Press Save League Setup to use it.');}
    catch(e){notify(e.message&&/world file/.test(e.message)?e.message:'That file could not be read','e');}};r.readAsText(f);}
function shareBody(){const D=WS.draft,m=D.meta||{};
  const _tbn=(()=>{try{return tbDraftCount();}catch(e){return 0;}})();
  return`<div style="font-size:12px;color:var(--mu);margin-bottom:10px">Save your whole League Setup (states, custom states, names, colleges, pro teams, sizes and stars) as a file, load one from a friend, or share it with every player in Community Creations.${_tbn?` Every school you changed in Team Builder (${_tbn}) goes with it.`:''} To share a whole career (every team and player), use Share under Load Game.</div>
    <div class="g2" style="gap:8px;margin-bottom:10px"><div class="fg"><label>World name</label><input id="ws-mn" value="${m.name||''}" maxlength="40" placeholder="My world"></div>
      <div class="fg"><label>Description</label><input id="ws-md" value="${m.desc||''}" maxlength="200" placeholder="What makes it special"></div></div>
    <div style="font-size:12px;margin-bottom:10px"><b>${worldSummary(D.geo?D:Object.assign({},D,{geo:usaDefault()}))}</b></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" onclick="worldExport()">Download world file</button>
      <label class="bgh" style="cursor:pointer;display:inline-flex;align-items:center">Upload a world file<input type="file" accept=".json,application/json" style="display:none" onchange="worldImportFile(this)"></label>
      <button class="bgh" onclick="ccPublishWorld()">Publish to Community Creations</button><button class="bgh" onclick="ccOpen('worlds')">Browse Community Creations</button></div>`;}
// ── Community Creations: worlds and teams other players made ──
async function ccB(){const B=await olBackend().catch(e=>{throw e;});if(!B)throw new Error('Online Play is not set up in this copy of the game.');
  if(!OLS.user)throw new Error('Sign in under Online Play to use Community Creations.');if(!B.worldList)throw new Error('Community Creations are not available on this server.');return B;}
async function ccPublishWorld(){try{wsGrab();}catch(e){}
  try{const B=await ccB(),W=worldSanitize(WS.draft||{}),nm=(W.meta&&W.meta.name)||'';
    {const tb=tbPackOut();if(tb){W.tb=JSON.parse(JSON.stringify(tb));if(JSON.stringify(W).length>380000){for(const v of Object.values(W.tb.ed))v.customLogo=null;for(const v of W.tb.add)v.customLogo=null;notify('Custom team logos are left out: the world would be too big to publish.','w');}
      if(JSON.stringify(W).length>380000){notify('Too many edited teams to publish: share the world file instead.','e');return;}}}if(!nm){notify('Give your world a name first (File & sharing)','w');return;}
    if(pfBad(nm+' '+((W.meta&&W.meta.desc)||'')+' '+JSON.stringify(W.states||{})+' '+JSON.stringify((W.geo&&W.geo.custom)||[]))){notify('Please change the names first: they break the community rules.','e');return;}
    if(!confirm(`Publish "${nm}" for every player to download? Your username is shown with it.`))return;
    await B.worldPublish(OLS.user.id,olName(),nm.slice(0,80),(worldSummary(W)+(W.meta&&W.meta.desc?' · '+W.meta.desc:'')).slice(0,200),W);notify('Published to Community Creations');}
  catch(e){notify(e.message||String(e),'e');}}
function ccTabs(on){const b=(k,l)=>`<button class="tab${on===k?' on':''}" onclick="ccOpen('${k}')">${l}</button>`;return`<div class="tabs" style="margin-bottom:10px">${b('worlds','Worlds')}${b('teams','Teams')}${b('leagues','Leagues')}</div>`;}
// ── community leagues: a whole career (every team, player and record) others can start from ──
async function lgPublish(id,btn){
  try{const B=await ccB();if(!B.leaguePublish)throw new Error('Community leagues are not available on this server.');
    const m=(await svList()).find(x=>x.id===id);if(!m)return;
    const nm=prompt('Name for this league in Community Creations:',`${m.name} ${m.mascot} · ${m.season}`.slice(0,80));if(nm==null)return;
    const name=wsClean(nm).slice(0,80);if(!name){notify('Give the league a name','w');return;}
    const desc=(prompt('Short description (optional):','')||'').replace(/[<>&"'`\\]/g,'').slice(0,120);
    if(pfBad(name+' '+desc)){notify('Please change the name: it breaks the community rules.','e');return;}
    if(!confirm(`Publish "${name}" for every player to download? Everyone gets a copy of this career: every team, player and record. Your username is shown with it.`))return;
    if(btn){btn.disabled=true;btn.textContent='Publishing…';}
    const str=await svGetData(id);if(!str)throw new Error('Save not found');
    await B.leaguePublish(OLS.user.id,olName(),name,(`${m.cls||''} · ${m.season} season · ${m.rec}`+(desc?' · '+desc:'')).slice(0,200),str);
    notify('Published to Community Creations → Leagues');}
  catch(e){notify(e.message||String(e),'e');}finally{if(btn){btn.disabled=false;btn.textContent='Share';}}}
async function lgOpen(){const sort=window._lgSort||'new';
  openMo(`<h2>Community Creations</h2>${ccTabs('leagues')}<div id="lg-b" style="color:var(--mu)">Loading…</div>`);
  try{const B=await ccB();if(!B.leagueList)throw new Error('Community leagues are not available on this server.');
    const blocked=B.blocks?await B.blocks(OLS.user.id).catch(()=>[]):[],L=(await B.leagueList(sort)).filter(r=>!blocked.includes(r.owner));window._lg=L;
    const el=document.getElementById('lg-b');if(!el)return;
    el.innerHTML=`<div style="font-size:12px;margin-bottom:8px">Whole careers other players shared: every team, player and record. Using one adds it to your saves under Load Game. Share your own with the Share button under Load Game.</div>
      <div style="display:flex;gap:6px;margin-bottom:10px"><button class="${sort==='new'?'btn bbl':'bgh'} bsm" onclick="window._lgSort='new';lgOpen()">Newest</button><button class="${sort==='top'?'btn bbl':'bgh'} bsm" onclick="window._lgSort='top';lgOpen()">Most downloaded</button></div>
      ${L.length?`<div style="display:grid;gap:8px;max-height:60vh;overflow-y:auto">${L.map((r,i)=>`<div style="display:flex;align-items:center;gap:10px;background:var(--s2);border:1px solid var(--bd);border-radius:6px;padding:8px 10px;color:var(--tx)">
        <div style="flex:1;min-width:0"><div style="font-weight:800">${olEsc(r.name)}</div><div style="font-size:12px;color:var(--mu)">${olEsc(r.info||'')} · by ${olEsc(r.username||'player')} · ${(Math.max(0.1,(r.size||0)/1e6)).toFixed(1)} MB · ${r.downloads||0} downloads</div></div>
        <button class="btn bsm" onclick="lgTake(${i},this)">Use</button>${r.owner===OLS.user.id?`<button class="bgh bsm" onclick="lgDel(${i})">Remove</button>`:`<button class="bgh bsm" onclick="lgReport(${i})">Report</button>`}</div>`).join('')}</div>`:'<p>No leagues yet. Share one of your careers from Load Game.</p>'}`;}
  catch(e){const el=document.getElementById('lg-b');if(el)el.innerHTML=`<p>${olEsc(e.message||String(e))}</p>`;}}
async function lgTake(i,btn){const r=(window._lg||[])[i];if(!r)return;
  try{if(btn){btn.disabled=true;btn.textContent='Adding…';}const B=await ccB();let json=await B.leagueGet(r);const nid='c'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
    let meta={id:nid,name:r.name,mascot:'',cls:'',season:'',rec:'',savedAt:Date.now()};
    try{const d=JSON.parse(json);if(!d||!d.G)throw 0;d.G.saveId=nid;
      try{const ms=(d.G.divisions||[]).flatMap(x=>(x&&x.teams)||[]).find(x=>x&&x.id===d.G.myId)||{};meta=Object.assign(meta,{name:ms.name||r.name,mascot:ms.mascot||'',c1:ms.c1,c2:ms.c2,cls:d.G.cls||'',season:(d.G.baseYear||2026)+((d.G.yr||1)-1),rec:(d.G.wins||0)+'-'+(d.G.losses||0),phase:d.G.phase,week:d.G.week||0,coach:(d.G.coach&&d.G.coach.name)||''});}catch(e){}
      json=JSON.stringify(d);}catch(e){throw new Error('That league could not be read');}
    meta.size=json.length;await svSave(meta,json);try{ttRefresh();}catch(e){}notify(`${r.name} is in your saves now. Find it under Load Game.`);if(btn)btn.textContent='Added';}
  catch(e){notify('Could not add the league: '+(e.message||e),'e');if(btn){btn.disabled=false;btn.textContent='Use';}}}
async function lgDel(i){const r=(window._lg||[])[i];if(!r||!confirm('Remove this league from Community Creations?'))return;try{const B=await ccB();await B.leagueDel(r);lgOpen();}catch(e){notify(e.message||String(e),'e');}}
async function lgReport(i){const r=(window._lg||[])[i];if(!r)return;const why=prompt('What is wrong with this league? (offensive names, etc.)');if(why==null)return;
  try{const B=await ccB();await B.reportUser(OLS.user.id,r.owner,('community league "'+r.name+'": '+why).slice(0,500));if(confirm('Thanks, the report was sent. Also block this player (hides their creations)?'))await B.block(OLS.user.id,r.owner);lgOpen();}catch(e){notify(e.message||String(e),'e');}}
async function ccOpen(tab){
  tab=tab||window._ccTab||'worlds';window._ccTab=tab;if(tab==='teams'){commOpen();return;}if(tab==='leagues'){lgOpen();return;}
  const sort=window._ccSort||'new';
  openMo(`<h2>Community Creations</h2>${ccTabs('worlds')}<div id="cc-b" style="color:var(--mu)">Loading…</div>`);
  try{const B=await ccB(),blocked=B.blocks?await B.blocks(OLS.user.id).catch(()=>[]):[],L=(await B.worldList(sort)).filter(r=>!blocked.includes(r.owner));window._cc=L;
    const el=document.getElementById('cc-b');if(!el)return;
    el.innerHTML=`<div style="display:flex;gap:6px;margin-bottom:10px"><button class="${sort==='new'?'btn bbl':'bgh'} bsm" onclick="window._ccSort='new';ccOpen('worlds')">Newest</button><button class="${sort==='top'?'btn bbl':'bgh'} bsm" onclick="window._ccSort='top';ccOpen('worlds')">Most downloaded</button></div>
      ${L.length?`<div style="display:grid;gap:8px;max-height:60vh;overflow-y:auto">${L.map((r,i)=>`<div style="display:flex;align-items:center;gap:10px;background:var(--s2);border:1px solid var(--bd);border-radius:10px;padding:8px 10px;color:var(--tx)">
        <div style="flex:1;min-width:0"><div style="font-weight:800">${olEsc(r.name)}</div><div style="font-size:12px;color:var(--mu)">${olEsc(r.info||'')} · by ${olEsc(r.username||'player')} · ${r.downloads||0} downloads</div></div>
        <button class="btn bsm" onclick="ccTake(${i})">Use</button>${r.owner===OLS.user.id?`<button class="bgh bsm" onclick="ccDel(${i})">Remove</button>`:`<button class="bgh bsm" onclick="ccReport(${i})">Report</button>`}</div>`).join('')}</div>`:'<p>No worlds yet. Make one in League Setup and publish it.</p>'}`;}
  catch(e){const el=document.getElementById('cc-b');if(el)el.innerHTML=`<p>${olEsc(e.message||String(e))}</p>`;}}
async function ccTake(i){const r=(window._cc||[])[i];if(!r)return;try{const B=await ccB(),d=await B.worldGet(r.id),W=worldSanitize(typeof d==='string'?JSON.parse(d):d);
  const tb=W.tb;delete W.tb;
  if(!confirm(`Use "${r.name}" for your new careers? It replaces your League Setup on this device (saves keep their own world)`+(tb?` and your Team Builder changes (it has ${Object.keys(tb.ed).length+tb.add.length} edited teams).`:'.')))return;
  if(tb)tbPackPending(tb);worldStore(W);clo();try{if(!document.getElementById('setup').classList.contains('hid')){_allClsDivs=null;_usedSchoolNames.clear();Object.keys(_citySchoolCount).forEach(k=>delete _citySchoolCount[k]);initCountyMap();}}catch(e){}
  notify(`${r.name} is your world now. Start a new game to play it.`);}catch(e){notify(e.message||String(e),'e');}}
async function ccDel(i){const r=(window._cc||[])[i];if(!r||!confirm('Remove this world from Community Creations?'))return;try{const B=await ccB();await B.worldDel(r.id);ccOpen('worlds');}catch(e){notify(e.message||String(e),'e');}}
async function ccReport(i){const r=(window._cc||[])[i];if(!r)return;const why=prompt('What is wrong with this world? (offensive names, etc.)');if(why==null)return;
  try{const B=await ccB();await B.reportUser(OLS.user.id,r.owner,('community world "'+r.name+'": '+why).slice(0,500));if(confirm('Thanks, the report was sent. Also block this player (hides their creations)?'))await B.block(OLS.user.id,r.owner);ccOpen('worlds');}catch(e){notify(e.message||String(e),'e');}}

let _mapSt=null; // null = the whole country
// offer colours: the state's smaller, middle and bigger classes
function offCol(c){const st=clsSt(c),L=clsOfSt(st),i=L.indexOf(c),f=L.length>1?i/(L.length-1):0;return f<0.34?'#2fbf7a':f<0.67?'#3fa2f3':'#f7b928';}
function offSize(c){const o=offCol(c);return o==='#2fbf7a'?'Small School':o==='#3fa2f3'?'Mid-Size School':'Large School';}
function offLbl(c){return(XCLS[c]?XCLS[c].lbl:(CF_LBL[c]||c))+''+offSize(c);}
function _landColorSt(c){const M=MAP_STATES[c.st]||MAP_STATES.CF,L=M.land,b=M.bb,t=Math.max(0,Math.min(1,(c.cx-b[0])/Math.max(1,b[2]-b[0]))),n=Math.sin(c.cx*.071+c.cy*.053)*.5+.5,m=Math.max(0,Math.min(1,t*.6+n*.35));
  return'#'+L[0].map((v,i)=>Math.round(v+(L[1][i]-v)*m).toString(16).padStart(2,'0')).join('');}
// the state picker above the map: back to the whole country, or jump to any state
function renderMapTabs(){
  const box=document.getElementById('map-st-tabs');if(!box)return;
  const cnt={};_mapOffers.forEach(o=>{cnt[o.st]=(cnt[o.st]||0)+1;});
  const chip=(k,l,on,n)=>`<button onclick="mapSetSt(${k?`'${k}'`:'null'})" style="background:${on?'var(--ac)':'var(--s2)'};border:1px solid ${on?'var(--ac)':'var(--bd)'};color:${on?'var(--tOn,#fff)':'var(--tx)'};border-radius:6px;padding:3px 10px;cursor:pointer;font-family:var(--hd);font-weight:800;font-size:12px;white-space:nowrap">${l}${n?` <span style="opacity:.75">${n}</span>`:''}</button>`;
  const many=ST_ORDER.length>13,sorted=ST_ORDER.slice().sort((a,b)=>a==='CF'?-1:b==='CF'?1:stName(a).localeCompare(stName(b)));
  box.innerHTML=`<div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center">${chip(null,'Whole country',_mapSt==null,0)}${many?`${chip('CF',stName('CF'),_mapSt==='CF',cnt.CF||0)}<select onchange="mapSetSt(this.value||null)" style="padding:4px 8px;border-radius:6px;font-weight:800;font-size:12px"><option value="">Jump to a state…</option>${sorted.map(k=>`<option value="${k}"${_mapSt===k?' selected':''}>${stName(k)}${cnt[k]?` (${cnt[k]} jobs)`:''}</option>`).join('')}</select>`:ST_ORDER.map(k=>chip(k,stName(k),_mapSt===k,cnt[k]||0)).join('')}</div>
    ${_mapSt?`<div style="font-size:11px;color:var(--mu);margin-top:6px">${MAP_STATES[_mapSt].tag}</div>`:`<div style="font-size:11px;color:var(--mu);margin-top:6px">Scroll or drag the map, then tap a state to zoom in. Colored counties have job offers.</div>`}`;
  const ttl=document.getElementById('map-st-title');if(ttl)ttl.textContent=_mapSt?'State of '+MAP_STATES[_mapSt].name:'The country';
}
window.mapSetSt=function(st){if(st!=null&&!MAP_STATES[st])return;const prev=_mapSt;_mapSt=st||null;_selectedCounty=null;renderCountyMap(prev);};
// teams spread over their own state's counties
function assignTeamsToCounties(allDivsByClass){
  MAPC.forEach(c=>{c.teams=[];c.offers=[];});
  const byS={};for(const st of ST_ORDER)byS[st]=[];
  for(const [cls,divs] of Object.entries(allDivsByClass)){const st=clsSt(cls);if(!byS[st])continue;for(const div of divs)for(const t of div.teams)byS[st].push({...t,cls});}
  for(const st in byS){const cs=MAPC.filter(c=>c.st===st);if(!cs.length)continue;byS[st].sort(()=>Math.random()-.5).forEach((t,i)=>{const h=t.cnty!=null&&MAPC[t.cnty]&&MAPC[t.cnty].st===st?MAPC[t.cnty]:cs[i%cs.length];h.teams.push(t);});}
}
// starting jobs: nine in Crestfield, five in every other state (small, mid-size and one bigger school, never the top class)
function generateStartingOffers(allDivsByClass){
  const offers=[];
  function pickFrom(cls,quality,count){
    const all=(allDivsByClass[cls]||[]).flatMap(d=>d.teams);let pool;
    if(quality==='mid')pool=all.filter(t=>t.tier==='avg'&&t.prestige>=2&&t.prestige<=3);else pool=all.filter(t=>t.tier==='bad'||t.prestige<=2);
    if(pool.length<count)pool=[...pool,...all.filter(t=>!pool.includes(t)&&t.tier!=='good').sort(()=>Math.random()-.5)];
    return[...pool].sort(()=>Math.random()-.5).slice(0,count);
  }
  const picks=[...pickFrom('1A','low',3),...pickFrom('2A','mid',3),...pickFrom('3A','low',3)];
  for(const c of cfExtra())picks.push(...pickFrom(c,'low',2)); // six-man / eight-man jobs in the home state too
  const _few=USA.on&&ST_ORDER.length>13;
  for(const st of ST_ORDER){if(st==='CF'||(XST[st]&&XST[st].lite))continue;const L=clsOfSt(st),n=L.length;
    const mi=Math.floor((n-1)/2),li=Math.max(0,n-2);
    if(_few){picks.push(...pickFrom(L[0],'low',1),...pickFrom(L[mi],'mid',1));continue;}
    picks.push(...pickFrom(L[0],'low',2),...(mi===li?pickFrom(L[mi],'mid',3):[...pickFrom(L[mi],'mid',2),...pickFrom(L[li],'low',1)]));}
  const seen=new Set();
  for(const t of picks){if(seen.has(t.id))continue;seen.add(t.id);
    const county=MAPC.find(c=>c.teams.some(ct=>ct.id===t.id));
    offers.push({team:t,countyId:county?county.id:null,st:clsSt(t.cls)});
    if(county)county.offers.push(t);}
  return offers;
}
// scenery for the whole country: seas, neighbors, lakes, rivers along the river borders, mountain ranges
const _MAP_DECO=(()=>{
  const north=[[215,0],[1100,0],[1100,118],..._edgePts('P5','P4').slice(),..._edgePts('P4','P3').slice(1),..._edgePts('P3','P2').slice(1),..._edgePts('P2','P1').slice(1),[232,40]];
  const mex=[..._edgePts('P22','P21'),..._edgePts('P21','P20').slice(1),..._edgePts('P20','P19').slice(1),..._edgePts('P19','P18').slice(1),[640,720],[230,720],[236,640]];
  const rivers=Object.keys(_MET).filter(k=>_MET[k]==='river').map(k=>{const[a,b]=k.split('|');return _polyLine(_edgePts(a,b));});
  // inland rivers (drawn inside the states, purely scenery)
  const inl=[_wig(600,90,640,235,6,1.1,20),_wig(820,140,880,360,7,2.2,24),_wig(470,300,620,520,7,3.3,26),_wig(300,120,330,300,6,4.4,20),_wig(700,300,720,470,5,5.5,18),_wig(250,260,330,420,5,6.6,16)].map(_polyLine);
  const lakes=[[690,108,26,10],[742,120,14,7],[840,128,22,9],[905,150,12,6],[612,110,10,5]];
  const peaks=[];const add=(st,list)=>list.forEach(([x,y,s])=>peaks.push({st,x,y,s}));
  add('SU',[[410,300,1.2],[432,290,1],[452,305,1.3],[470,330,1],[420,350,1.1],[505,300,.9],[440,380,1]]);
  add('GR',[[420,110,.9],[450,150,1],[470,120,.8],[500,190,.8]]);
  add('CS',[[300,150,1.1],[318,220,1.2],[296,290,1],[330,110,.9]]);
  add('TA',[[300,420,1],[322,440,.9],[260,380,.8],[390,480,.8]]);
  add('CU',[[810,280,.7],[830,300,.8],[850,320,.7],[880,250,.7]]);
  add('AU',[[80,80,1],[110,95,1.2],[130,120,.9]]);
  add('KM',[[190,668,.7]]);
  return{north,mex,rivers,inl,lakes,peaks};
})();
let _mapVB=null,_mapAnim=0;
function _mapTargetVB(st){
  if(!st)return[0,0,MAP_W,MAP_H];const b=MAP_STATES[st].bb,pw=(b[2]-b[0])*0.1+8,ph=(b[3]-b[1])*0.1+8;
  let x=b[0]-pw,y=b[1]-ph,w=b[2]-b[0]+2*pw,h=b[3]-b[1]+2*ph;const ar=560/420;
  if(w/h>ar){const nh=w/ar;y-=(nh-h)/2;h=nh;}else{const nw=h*ar;x-=(nw-w)/2;w=nw;}
  return[x,y,w,h];
}
function renderCountyMap(prevSt){
  const svg=document.getElementById('county-svg');if(!svg)return;
  const wrap=document.getElementById('county-map-wrap');
  const offerSet=new Set(),clsMap={};
  _mapOffers.forEach(o=>{if(o.countyId!==null){offerSet.add(o.countyId);(clsMap[o.countyId]=clsMap[o.countyId]||new Set()).add(o.team.cls);}});
  renderMapTabs();
  const st=_mapSt,VB=_mapTargetVB(st),k=st?VB[2]/560:1.35,D=_MAP_DECO;
  let land='',cnty='',labels='',lift='',stl='',borders='',ufill='',urest='';
  if(USA.on){for(const R of USA.rest)if(!st||!['AK','HI'].includes(R.ab))urest+=`<path d="${R.path}" fill="#d9d2bf" stroke="#a39880" stroke-width="${.8*k}"/>`;
    for(const s of ST_ORDER){if(st===s)continue;if(st&&['AK','HI'].includes(USA.ab[s]))continue;const M=MAP_STATES[s];ufill+=`<path d="${M.path}" fill="rgb(${M.land[0].join(',')})" opacity="${st?.55:1}"/>`;}}
  for(const s of ST_ORDER){const M=MAP_STATES[s],dim=st&&s!==st;
    land+=`<path d="${M.path}" fill="#94805c" transform="translate(0,${(2.5*k).toFixed(2)})"/>`;
    stl+=`<path d="${M.path}" fill="${dim?'rgba(20,28,20,.0)':'none'}" style="cursor:pointer" ${st===s?'pointer-events="none"':`onclick="mapSetSt('${s}')"`}/>`;
    borders+=`<path d="${M.path}" fill="none" stroke="#4a3a26" stroke-width="${(st===s?1.6:1.1)*k}" stroke-linejoin="round" pointer-events="none"/>`;}
  MAPC.forEach(c=>{
    if(!c.pts||c.pts.length<3)return;const on=!st||c.st===st;
    if(USA.on&&(st?c.st!==st:!offerSet.has(c.id)))return;
    const d=c.multi?c.multi.map(_cpts).join(' '):_cpts(c.pts),has=offerSet.has(c.id),cs=clsMap[c.id],sel=_selectedCounty===c.id;
    const fill=has?(cs.size>1?'#f26b4f':offCol([...cs][0])):_landColorSt(c);
    const clickable=st===c.st&&has;
    cnty+=`<path class="cp${has?' cp-o':''}" data-county="${c.id}" d="${d}" style="fill:${fill};stroke:${has?'#ffffff':'rgba(255,255,255,.5)'};stroke-width:${((has?1.1:.5)*k).toFixed(2)};opacity:${on?1:.45};${clickable?'cursor:pointer;':''}" ${st===c.st?`onclick="onCountyClick(${c.id})" onmouseenter="onCountyHover(event,${c.id})" onmouseleave="onCountyLeave()"`:`onclick="mapSetSt('${c.st}')"`}/>`;
    if(sel)lift+=`<g pointer-events="none" transform="translate(0,${-4*k})"><path d="${d}" fill="rgba(0,0,0,.35)" transform="translate(${2*k},${6*k})" filter="url(#mblur)"/><path d="${d}" fill="${fill}" stroke="#fff" stroke-width="${2.2*k}" stroke-linejoin="round"/><path d="${d}" fill="url(#mgloss)"/></g>`;
    if(st===c.st&&!(USA.on&&!has&&(USA.cnty[st]||[]).length>90))labels+=`<text x="${c.cx.toFixed(1)}" y="${(c.cy+2.4*k+(sel?-4*k:0)).toFixed(1)}" text-anchor="middle" font-size="${((has?7.4:5.4)*k).toFixed(2)}" fill="${has?'#0b2233':'rgba(40,50,30,.6)'}" font-weight="${has?800:600}" pointer-events="none" style="user-select:none">${c.name}</text>`;
  });
  // state names and offer counts on the country view
  const cnt={};_mapOffers.forEach(o=>{cnt[o.st]=(cnt[o.st]||0)+1;});
  let snames='';
  for(const s of ST_ORDER){const M=MAP_STATES[s];if(st&&s===st)continue;const fs=st?9*k:USA.on?clamp(Math.sqrt((M.bb[2]-M.bb[0])*(M.bb[3]-M.bb[1]))/7,7,13):(['KM','AU','CO','AC','GR'].includes(s)?10:13),dim=st?.75:1;
    snames+=`<g pointer-events="none" opacity="${dim}"><text x="${M.lx}" y="${M.ly}" text-anchor="middle" font-size="${fs}" font-weight="900" letter-spacing="${st?.5*k:1.5}" fill="#fff" stroke="#2c2416" stroke-width="${(st?2.4*k:3)}" paint-order="stroke" style="">${USA.on&&!st&&(M.bb[2]-M.bb[0])<M.name.length*fs*0.62?(USA.ab[s]||s):M.name.toUpperCase()}</text>
      ${cnt[s]&&!st?`<g transform="translate(${M.lx},${M.ly+11})"><rect x="-22" y="-7" width="44" height="13" rx="6.5" fill="#f7b928" stroke="#2c2416" stroke-width="1"/><text y="3" text-anchor="middle" font-size="8.5" font-weight="900" fill="#1b1b1b">${cnt[s]} jobs</text></g>`:''}</g>`;}
  const mtn=(x,y,s)=>`<path d="M${x-7*s},${y} L${x},${y-9*s} L${x+7*s},${y} Z" fill="#7d6a52" opacity=".6"/><path d="M${x-2.2*s},${y-6.2*s} L${x},${y-9*s} L${x+2.2*s},${y-6.2*s} Z" fill="#fff" opacity=".75"/>`;
  const peaks=D.peaks.filter(p=>!st||p.st===st).map(p=>mtn(p.x,p.y,p.s*(st?Math.max(.8,k*1.2):1))).join('');
  let sea=`<text x="80" y="420" font-size="16" font-weight="900" fill="#ffffff" opacity=".35" letter-spacing="6" transform="rotate(-90 80 420)" pointer-events="none">PACIFIC OCEAN</text>
    <text x="1075" y="470" font-size="14" font-weight="900" fill="#ffffff" opacity=".35" letter-spacing="5" transform="rotate(90 1075 470)" pointer-events="none">ATLANTIC</text>
    <text x="800" y="610" font-size="14" font-weight="900" fill="#ffffff" opacity=".35" letter-spacing="5" pointer-events="none">THE GULF</text>
    <text x="430" y="660" font-size="15" font-weight="900" fill="#7a6a4c" opacity=".6" letter-spacing="6" pointer-events="none">MÉXICO</text>
    <rect x="6" y="18" width="182" height="222" rx="6" fill="none" stroke="#ffffff" stroke-opacity=".45" stroke-dasharray="5 4"/><rect x="8" y="568" width="214" height="140" rx="6" fill="none" stroke="#ffffff" stroke-opacity=".45" stroke-dasharray="5 4"/>`;
  if(USA.on)sea='';
  svg.setAttribute('preserveAspectRatio','xMidYMid meet');
  svg.innerHTML=`<defs>
   <linearGradient id="msea" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7fd0f2"/><stop offset="1" stop-color="#2b86c4"/></linearGradient>
   <linearGradient id="mgloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".45" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
   <filter id="mterrain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="4" seed="7" result="n"/><feDiffuseLighting in="n" surfaceScale="3.2" lighting-color="#ffffff" result="l"><feDistantLight azimuth="225" elevation="48"/></feDiffuseLighting></filter>
   <filter id="mblur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3"/></filter>
   <filter id="mshadow" x="-10%" y="-10%" width="130%" height="130%"><feGaussianBlur in="SourceAlpha" stdDeviation="6"/><feOffset dx="3" dy="8"/><feComponentTransfer><feFuncA type="linear" slope=".4"/></feComponentTransfer></filter>
   <clipPath id="mland"><path d="${ST_ORDER.map(s=>MAP_STATES[s].path).join(' ')}"/></clipPath>
  </defs>
  <rect x="-400" y="-400" width="${MAP_W+800}" height="${MAP_H+800}" fill="url(#msea)" onclick="mapSetSt(null)"/>
  ${USA.on?`<g pointer-events="none">${urest}</g>`:`<path d="${_polyPath(D.north)}" fill="#cfc6ae" opacity=".8" pointer-events="none"/><path d="${_polyPath(D.mex)}" fill="#ddd2b8" pointer-events="none"/>`}
  ${sea}
  <g filter="url(#mshadow)" pointer-events="none">${land}</g>
  <g pointer-events="none">${ufill}</g>
  ${cnty}
  <g clip-path="url(#mland)" pointer-events="none">
    <rect width="${MAP_W}" height="${MAP_H}" filter="url(#mterrain)" style="mix-blend-mode:multiply" opacity=".38"/>
    ${USA.on?'':`<g fill="none" stroke="#3d93d1" stroke-width="${1.3*k}" stroke-linecap="round" stroke-linejoin="round" opacity=".85">${D.inl.map(d=>`<path d="${d}"/>`).join('')}</g>`}
    <rect width="${MAP_W}" height="${MAP_H}" fill="url(#mgloss)"/>
  </g>
  ${borders}
  ${USA.on?'':`<g fill="none" stroke="#3d93d1" stroke-width="${2.8*Math.max(.6,k)}" stroke-linecap="round" stroke-linejoin="round" pointer-events="none">${D.rivers.map(d=>`<path d="${d}"/>`).join('')}</g>
  <g pointer-events="none">${D.lakes.map(([x,y,a,b])=>`<ellipse cx="${x}" cy="${y}" rx="${a}" ry="${b}" fill="url(#msea)" stroke="#fff" stroke-opacity=".4"/>`).join('')}${peaks}</g>`}
  ${stl}
  ${lift}
  ${labels}
  ${snames}`;
  // size: the whole country is a big map you scroll around; a state fills the frame
  const from=_mapVB||VB;
  if(st){svg.style.width='100%';svg.style.maxWidth='100%';svg.style.height='auto';svg.removeAttribute('height');svg.setAttribute('width','560');}
  else{svg.style.width=MAP_W+'px';svg.style.maxWidth='none';svg.style.height=MAP_H+'px';svg.setAttribute('width',MAP_W);svg.setAttribute('height',MAP_H);}
  if(wrap){wrap.style.overflow=st?'hidden':'auto';wrap.style.height=st?'':'440px';}
  // zoom animation between the views
  const start=prevSt===undefined?VB:(st?(prevSt?_mapTargetVB(prevSt):[0,0,MAP_W,MAP_H]):from),t0=performance.now(),dur=prevSt===undefined?0:420,my=++_mapAnim;
  const step=now=>{if(my!==_mapAnim)return;const u=dur?Math.min(1,(now-t0)/dur):1,e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
    const v=start.map((a,i)=>a+(VB[i]-a)*e);svg.setAttribute('viewBox',v.map(x=>x.toFixed(1)).join(' '));_mapVB=v;if(u<1)requestAnimationFrame(step);};
  if(st&&!prevSt&&prevSt!==undefined){// zooming in from the country: start on the state's spot of the big map
    const b=VB,cxs=b[0]+b[2]/2,cys=b[1]+b[3]/2,w=b[2]*3.2,h=b[3]*3.2;start.splice(0,4,cxs-w/2,cys-h/2,w,h);}
  requestAnimationFrame(step);
  if(!st&&wrap){const M=prevSt?MAP_STATES[prevSt]:MAP_STATES.CF;requestAnimationFrame(()=>{const sx=M?M.lx-wrap.clientWidth/2:(MAP_W-wrap.clientWidth)/2,sy=M?M.ly-wrap.clientHeight/2:(MAP_H-wrap.clientHeight)/2;wrap.scrollLeft=Math.max(0,sx);wrap.scrollTop=Math.max(0,sy);});}
  _mapDragInit();
}
// drag to pan the big map with a mouse (touch screens scroll natively)
function _mapDragInit(){const w=document.getElementById('county-map-wrap');if(!w||w._drag)return;w._drag=1;let d=null;
  w.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||_mapSt)return;d={x:e.clientX,y:e.clientY,l:w.scrollLeft,t:w.scrollTop,m:0};});
  window.addEventListener('pointermove',e=>{if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.abs(dx)+Math.abs(dy)>4)d.m=1;w.scrollLeft=d.l-dx;w.scrollTop=d.t-dy;});
  window.addEventListener('pointerup',()=>{if(d&&d.m){w._noClick=performance.now();}d=null;});
  w.addEventListener('click',e=>{if(w._noClick&&performance.now()-w._noClick<200){e.stopPropagation();e.preventDefault();}},true);}

// ── County Map Rendering ──
let _mapOffers=[];
let _selectedCounty=null;
let _selectedOfferTeam=null;
let _selectedRivals=new Set();

const _MAPRIV={r1:"M120,90 L122.9,93.1 L126.8,94.7 L129.5,97.9 L132.0,101.1 L132.8,105.3 L135.1,108.9 L137.7,112.4 L141.4,114.5 L145.2,116.4 L149.1,118.1 L150.8,122.2 L154.3,124.9 L158.5,125.2 L162.3,126.9 L166.3,128.1 L170,130 L174.3,131.7 L177.3,135.4 L181.7,136.7 L185.5,139.2 L190.0,140.3 L193.5,143.4 L197.1,146.3 L200.8,148.8 L204.1,152.0 L207.7,154.8 L212.0,156.3 L216.0,158.5 L219.5,161.5 L222.9,164.5 L226.9,166.6 L230,170 L233.6,173.0 L237.1,176.2 L240.7,179.2 L243.7,182.9 L247.3,186.0 L251.7,188.0 L255.4,190.8 L258.7,194.3 L262.2,197.4 L266.4,199.6 L269.6,203.2 L274.1,205.0 L278.3,207.3 L281.4,211.0 L285.3,214.0 L290,215 L292.1,219.0 L295.9,221.6 L299.0,224.9 L303.4,226.2 L306.8,228.9 L310.5,231.4 L314.6,233.1 L318.7,234.5 L321.4,238.3 L321.7,242.9 L323.1,247.3 L326.5,250.4 L329.7,253.6 L332.6,257.0 L336.6,259.0 L340,262 L343.0,263.9 L346.4,265.1 L349.0,267.5 L351.0,270.4 L354.0,272.5 L355.5,275.8 L356.7,279.2 L359.8,281.2 L362.2,284.0 L365.2,286.0 L368.7,287.3 L372.2,288.1 L374.9,290.6 L377.7,293.0 L378.6,296.6 L380,300 L382.0,303.1 L383.4,306.4 L384.8,309.9 L384.8,313.6 L385.9,317.2 L388.5,320.0 L388.2,323.7 L388.9,327.4 L389.8,331.2 L392.6,333.9 L392.8,337.6 L394.1,341.2 L397.1,343.4 L399.7,346.0 L402.2,348.7 L404,352",r2:"M250,60 L250.7,64.3 L253.7,67.4 L256.3,70.9 L260.4,72.4 L262.2,76.1 L262.6,80.3 L265.1,83.7 L268.1,86.5 L269.3,90.5 L272.1,93.6 L274.6,97.0 L278.2,99.0 L280.4,102.5 L282.8,105.9 L285.9,108.8 L290,110 L293.9,111.5 L297.8,113.1 L301.4,115.6 L303.2,119.6 L306.7,121.9 L309.8,124.8 L311.1,128.8 L313.1,132.5 L315.1,136.3 L317.8,139.6 L317.9,143.8 L318.7,148.0 L322.3,150.2 L324.6,153.8 L326.8,157.3 L330,160 L332.8,163.3 L335.5,166.7 L339.8,168.1 L342.6,171.6 L344.3,175.6 L347.3,178.8 L348.9,182.8 L351.8,186.1 L356.0,187.0 L359.9,189.0 L363.9,190.8 L367.8,192.6 L370.4,196.1 L373.9,198.8 L377.7,201.2 L380,205 L381.5,208.6 L383.8,211.7 L387.5,213.2 L390.2,216.0 L394.0,216.6 L397.3,218.7 L400.7,220.2 L403.8,222.4 L407.4,223.4 L410.7,225.2 L414.5,225.6 L417.7,227.6 L420.3,230.4 L423.0,233.1 L426.9,233.6 L430,236 L431.6,242.0 L434.2,247.5 L437.0,253.0 L438.3,259.1 L441.7,264.2 L444.7,269.5 L446.4,275.5 L450.3,280.4 L451.6,286.5 L454.4,292.1 L454.3,298.4 L456.5,304.2 L459.1,309.8 L461.7,315.4 L464.8,320.7 L468,326",r3:"M110,200 L113.5,201.9 L116.6,204.3 L118.2,208.1 L121.1,210.9 L124.4,213.0 L126.9,215.9 L129.8,218.7 L133.5,220.1 L137.1,221.7 L140.1,224.4 L143.2,226.8 L145.6,229.9 L149.7,229.8 L153.2,232.1 L156.9,233.5 L160,236 L164.0,235.7 L167.5,237.8 L170.7,239.9 L172.8,243.2 L176.5,242.1 L180.3,241.7 L184.2,242.2 L187.5,244.2 L189.3,247.6 L192.5,249.7 L196.2,250.4 L199.5,252.1 L202.1,254.9 L205.8,255.9 L207.8,259.0 L210,262 L212.2,264.9 L215.8,265.9 L219.1,267.2 L221.9,269.4 L224.5,271.8 L226.9,274.5 L230.6,275.0 L233.4,277.4 L235.5,280.5 L237.9,283.3 L237.4,287.1 L239.3,290.5 L242.7,291.8 L245.6,294.2 L246.9,297.8 L250,300 L252.8,303.1 L255.8,305.9 L256.6,309.9 L258.3,313.8 L260.5,317.2 L260.9,321.4 L263.8,324.3 L264.9,328.4 L264.6,332.6 L266.6,336.3 L269.2,339.7 L269.8,343.8 L270.4,347.9 L271.3,351.9 L271.4,356.1 L270,360",r4:"M360,70 L362.9,72.9 L365.5,76.0 L366.5,80.0 L368.9,83.4 L372.6,85.6 L374.7,89.3 L376.6,93.1 L377.2,97.2 L379.3,100.8 L382.9,102.9 L385.8,105.7 L388.5,108.7 L391.1,111.8 L394.2,114.4 L397.5,116.8 L400,120 L402.2,122.8 L405.8,123.4 L409.1,124.0 L412.4,123.5 L415.7,124.3 L418.6,126.1 L419.9,129.4 L422.7,131.4 L425.0,133.9 L427.3,136.4 L430.3,138.5 L433.9,138.4 L435.9,141.0 L436.6,144.4 L438.8,146.9 L440,150 L443.8,149.5 L447.5,148.4 L451.4,149.3 L455.1,147.8 L458.9,148.1 L462.7,148.7 L466.8,148.9 L470.0,151.3 L473.7,150.5 L477.4,149.7 L481.0,148.0 L484.9,148.3 L488.8,147.8 L492.5,149.1 L496.3,148.6 L500,150",r5:"M150,150 L154.7,152.2 L159.5,154.1 L164.9,153.9 L169.7,156.2 L175.0,155.1 L180.2,156.2 L185.0,158.3 L190,160 L195.3,160.5 L199.9,163.0 L204.6,165.3 L209.6,166.5 L214.9,165.8 L220.1,166.6 L224.9,168.8 L230,170"};
const _MAPGULF="M522,262 L523.1,265.1 L520.9,267.6 L518.7,269.6 L515.8,270.4 L513.1,269.8 L510.4,269.4 L508.0,270.9 L505.6,272.2 L503.6,274.6 L500.6,273.8 L500.7,276.8 L498.2,278.6 L496.9,280.9 L496.6,283.5 L494.8,285.7 L492,286 L491.2,283.7 L488.8,283.8 L486.7,283.4 L485.1,284.9 L484.4,287.2 L482.4,288.4 L481.0,285.9 L478.4,286.8 L478.4,284.7 L476.7,283.5 L475.5,281.7 L476.3,279.7 L474.6,278.3 L474.2,276.1 L472.1,277.0 L470,276 L471.6,278.0 L473.5,279.9 L473.1,282.6 L471.4,284.7 L470.8,287.1 L470.1,289.4 L467.7,290.1 L465.9,291.6 L463.1,291.6 L462.4,294.3 L460.1,295.7 L460.4,298.3 L458.4,296.3 L455.7,296.7 L453.7,298.1 L452,300 L453.2,302.3 L455.8,301.8 L455.6,304.1 L457.1,305.8 L457.7,307.6 L458.6,309.4 L460.3,310.5 L461.6,312.0 L461.9,315.0 L459.1,316.2 L461.4,317.9 L461.2,320.6 L463.5,321.1 L465.4,322.4 L467.0,323.9 L468,326 L466.5,328.2 L467.0,330.9 L465.4,333.3 L462.5,333.2 L460.1,332.5 L457.8,331.6 L456.0,333.5 L453.5,334.2 L451.2,335.1 L448.9,334.2 L448.2,337.0 L445.3,337.1 L446.5,339.8 L444.7,342.2 L442.4,343.2 L440,344 L437.2,343.8 L434.5,344.7 L433.7,341.5 L430.5,341.0 L428.1,339.7 L425.5,339.7 L423.6,342.2 L420.5,341.4 L418.1,343.2 L415.1,343.5 L415.9,346.6 L413.9,349.2 L411.2,350.1 L408.5,349.1 L405.3,349.0 L404,352 L403.8,354.6 L404.1,357.2 L401.7,358.3 L400.0,360.4 L397.8,361.0 L395.5,361.4 L393.1,361.3 L390.8,361.7 L388.5,362.6 L388.0,364.9 L386.5,366.8 L384.1,366.7 L383.7,368.9 L382.2,370.5 L380.1,371.6 L380,374 L377.2,374.4 L376.2,377.1 L374.0,375.8 L371.4,376.4 L370.1,374.0 L367.5,373.4 L364.7,372.3 L362.7,374.5 L360.4,375.0 L358.2,375.8 L355.5,375.8 L354.0,373.7 L351.5,375.4 L349.2,373.5 L348.1,371.3 L346,370 L344.2,371.4 L342.9,373.3 L342.0,375.4 L340.1,376.7 L337.9,375.7 L335.4,375.5 L333.9,377.8 L331.2,377.8 L329.1,378.8 L326.7,378.4 L325.1,380.0 L323.8,381.8 L321.3,382.7 L321.3,385.3 L319.4,386.4 L318,388 L315.4,389.8 L314.2,392.7 L312.5,395.3 L309.8,396.9 L306.9,398.0 L304.2,399.5 L301.9,401.6 L300,404 L298.3,406.7 L299.2,409.8 L298.0,412.7 L294.9,413.7 L294.3,416.8 L291.5,418.4 L288.4,417.9 L286,420 L560,420 L560,244 L558.1,246.5 L554.9,247.0 L552.4,248.8 L551.3,251.7 L549.1,253.9 L545.9,254.0 L543.0,253.7 L540,254 L537.6,255.2 L535.0,254.7 L533.4,256.9 L530.9,257.8 L528.8,259.0 L526.4,259.8 L524.1,260.6Z";
const _MAPLAKE="M318,0 L318.9,3.0 L320.7,5.5 L322.0,8.4 L324.2,10.6 L327.2,11.4 L329.9,13.0 L333.2,12.0 L336,14 L340.0,13.4 L343.5,11.2 L347.0,13.0 L350.8,14.2 L352.6,17.7 L355.9,19.7 L358.7,22.3 L362,24 L365.2,25.4 L368.5,26.4 L371.8,28.1 L372.8,31.8 L375.8,30.1 L379.2,29.5 L382.6,30.3 L386,30 L388.4,30.3 L390.0,32.2 L391.7,33.7 L393.4,35.3 L395.9,34.1 L398.7,33.6 L400.4,35.7 L402,38 L404.2,37.2 L406.5,37.7 L409.0,38.3 L411.0,36.8 L413.5,36.6 L415.9,35.5 L417.6,37.4 L419.7,39.0 L422.5,39.2 L424.5,37.4 L427.2,37.9 L429.0,39.8 L431.8,39.7 L433.2,42.1 L435.5,43.4 L436,46 L438.6,45.2 L441.3,45.8 L442.6,48.5 L445.6,48.9 L446.7,51.3 L448.8,53.0 L451.2,54.0 L453.7,54.9 L454.9,57.5 L457.4,59.0 L460.1,58.1 L462.9,58.9 L465.0,60.7 L467.7,61.2 L469.7,63.2 L470,66 L471.8,67.2 L473.9,67.6 L475.5,69.0 L476.7,70.7 L478.9,72.0 L478.8,74.5 L478.1,76.6 L478.3,78.8 L478.9,81.4 L481.3,82.2 L479.5,84.1 L480.1,86.6 L482.1,87.6 L482.7,89.7 L483.9,91.5 L486,92 L487.4,93.9 L489.2,95.5 L487.0,97.2 L487.4,99.9 L489.4,100.8 L490.6,102.8 L492.7,102.3 L494.8,103.0 L497.5,102.8 L498.6,105.2 L500.9,104.8 L502.4,103.0 L504.1,104.0 L505.8,104.7 L508.2,105.6 L508,108 L511.4,107.2 L514.9,107.0 L517.1,104.1 L520.5,102.8 L523.9,101.6 L527.3,102.9 L530.8,102.5 L534,104 L536.7,101.8 L540.2,101.0 L543.7,101.3 L546.8,99.5 L549.2,96.5 L553.0,96.1 L556.5,94.8 L560,96 L560,0Z";
function _cpts(pts){return 'M'+pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join('L')+'Z';}
// (v2.07: renderCountyMap lives with the country map above)
window.onCountyHover=function(e,id){
  const county=MAPC[id];if(!county)return;
  const tt=document.getElementById('map-tooltip');if(!tt)return;
  const wrap=document.getElementById('county-map-wrap');
  const wRect=wrap.getBoundingClientRect();
  const mx=e.clientX-wRect.left;
  const my=e.clientY-wRect.top;
  const offers=_mapOffers.filter(o=>o.countyId===id);
  let html=`<div style="font-family:var(--hd);font-weight:800;font-size:13px;color:var(--tx)">${cntyLbl(county)}</div>`;
  if(offers.length){
    html+=`<div style="font-size:10px;color:var(--mu);margin-top:2px">${offers.length} job offer${offers.length>1?'s':''}</div>`;
    offers.forEach(o=>{
      const clsCol=offCol(o.team.cls);
      html+=`<div style="font-size:11px;color:${clsCol};margin-top:2px">• ${o.team.name} ${o.team.mascot} <span style="color:var(--mu)">(${clsL(o.team.cls)})</span></div>`;
    });
  } else {
    html+=`<div style="font-size:10px;color:var(--mu);margin-top:2px">${county.teams.length} team${county.teams.length!==1?'s':''}, no job offers</div>`;
  }
  tt.innerHTML=html;
  tt.style.display='block';
  tt.style.left=(mx+12)+'px';
  tt.style.top=(my-10)+'px';
};
window.onCountyLeave=function(){
  const tt=document.getElementById('map-tooltip');if(tt)tt.style.display='none';
};
window.onCountyClick=function(id){
  const offers=_mapOffers.filter(o=>o.countyId===id);
  if(!offers.length)return;
  _selectedCounty=id;
  renderCountyMap();
  // Open the rich school popup
  _offerPopupIdx=0;
  _offerPopupOffers=offers;
  renderOfferPopup();
  document.getElementById('offer-popup').classList.add('open');
  // Also update the legacy panel below the map (kept for mobile/fallback)
  const county=MAPC[id];
  const panel=document.getElementById('offer-county-panel');
  const title=document.getElementById('offer-county-title');
  const schoolsDiv=document.getElementById('offer-county-schools');
  panel.style.display='';
  title.textContent=`${cntyLbl(county)}, ${offers.length} Job Offer${offers.length>1?'s':''}`;
  schoolsDiv.innerHTML=offers.map(o=>{
    const t=o.team;
    const clsCol=offCol(t.cls);
    const clsName=offLbl(t.cls);
    const qualLabel=t.tier==='bad'?'Rebuilding Program':t.tier==='avg'?'Developing Program':'Established Program';
    const isSelected=_selectedOfferTeam&&_selectedOfferTeam.id===t.id;
    return`<div class="offer-card cls-${t.cls.toLowerCase()} ${isSelected?'sel-offer':''}" onclick="selectOfferSchool(${t.id},${o.countyId})">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div>
          <div style="font-family:var(--hd);font-size:15px;font-weight:800;color:var(--tx)">${t.name} ${t.mascot}</div>
          <div style="font-size:11px;color:var(--mu)">${t.city} · ${cntyLbl(county)}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:11px;font-weight:700;color:${clsCol}">${clsName}</div>
          <div style="font-size:10px;color:var(--mu)">${qualLabel}</div>
        </div>
      </div>
      ${isSelected?`<div style="font-size:10px;color:var(--gn);margin-top:4px;font-weight:700">Selected, scroll right to confirm</div>`:''}
    </div>`;
  }).join('');
};

// Offer popup state
let _offerPopupIdx=0;
let _offerPopupOffers=[];

function renderOfferPopup(){
  if(!_offerPopupOffers.length)return;
  const o=_offerPopupOffers[_offerPopupIdx];
  const t=o.team;
  const county=MAPC[o.countyId]||{name:'?'};
  const clsCol=offCol(t.cls);
  const clsBg=clsCol+'26';
  const clsName=offLbl(t.cls)+(clsSt(t.cls)!=='CF'?' · '+stName(clsSt(t.cls)):'');
  const tierLabel=t.tier==='bad'?'Rebuilding':t.tier==='avg'?'▲ Developing':'★ Established';
  const tierCol=t.tier==='bad'?'#cc7a3a':t.tier==='avg'?'var(--mu)':'var(--gd)';
  const stars='★'.repeat(t.prestige||1)+'☆'.repeat(5-(t.prestige||1));
  const c1=t.c1||'#333',c2=t.c2||'#fff';
  const logoSvg=sLogo(t,56);

  // Banner gradient using team colors
  document.getElementById('opp-banner').style.background=`linear-gradient(90deg,${c1},${c2},${c1})`;
  document.getElementById('opp-banner').style.height='6px';

  // School row
  document.getElementById('opp-school-row').innerHTML=`
    <div class="offer-popup-logo" style="width:60px;height:60px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
      ${logoSvg}
    </div>
    <div style="flex:1;min-width:0">
      <div class="offer-popup-school-name" style="color:var(--tx)">${t.name}</div>
      <div class="offer-popup-mascot">${t.mascot} &bull; ${t.city} · ${cntyLbl(county)}</div>
      <div style="display:flex;gap:6px;align-items:center;margin-top:5px;flex-wrap:wrap">
        <span class="offer-popup-cls-badge" style="background:${clsBg};color:${clsCol};border:1px solid ${clsCol}">${clsName}</span>
        <span style="font-size:11px;color:${tierCol};font-weight:700">${tierLabel}</span>
      </div>
    </div>`;

  // Body
  const isSelected=_selectedOfferTeam&&_selectedOfferTeam.id===t.id;
  document.getElementById('opp-body').innerHTML=`
    <div class="offer-popup-stat-grid">
      <div class="offer-popup-stat">
        <div class="offer-popup-stat-v" style="color:${clsCol}">${clsL(t.cls).replace('Division ','Div ')}</div>
        <div class="offer-popup-stat-l">Class</div>
      </div>
      <div class="offer-popup-stat">
        <div class="offer-popup-stat-v" style="color:var(--gd)">${stars.slice(0,5)}</div>
        <div class="offer-popup-stat-l">Prestige</div>
      </div>
      <div class="offer-popup-stat">
        <div class="offer-popup-stat-v" style="font-size:14px;color:${tierCol}">${tierLabel.split(' ')[1]}</div>
        <div class="offer-popup-stat-l">Program</div>
      </div>
    </div>
    <div class="offer-popup-scheme-row">
      <div class="offer-popup-scheme">
        <div class="offer-popup-scheme-l">Offensive Scheme</div>
        <div class="offer-popup-scheme-v">${t.offS||'Pro Style'}</div>
      </div>
      <div class="offer-popup-scheme">
        <div class="offer-popup-scheme-l">Defensive Scheme</div>
        <div class="offer-popup-scheme-v">${t.defS||'4-3'}</div>
      </div>
    </div>
    <div class="offer-popup-btns">
      <button class="btn ${isSelected?'':'bgn'}" style="${isSelected?'background:var(--gn);color:#000':''}flex:1;font-size:14px;" onclick="selectOfferSchool(${t.id},${o.countyId});closeOfferPopup(null,true);setTimeout(openCoachCreator,80)">
        ${isSelected?'Selected, Confirm →':'Accept Job Offer'}
      </button>
    </div>
    ${_offerPopupOffers.length>1?`
    <div class="offer-popup-nav" style="margin-top:12px">
      ${_offerPopupOffers.map((_,i)=>`<div class="offer-popup-nav-dot ${i===_offerPopupIdx?'on':''}" onclick="offerPopupGo(${i})" title="Offer ${i+1}"></div>`).join('')}
      <span style="font-size:10px;color:var(--mu);font-family:var(--hd);font-weight:700;margin-left:6px">${_offerPopupIdx+1} / ${_offerPopupOffers.length}</span>
    </div>`:''}`;
}

window.offerPopupGo=function(idx){
  _offerPopupIdx=idx;
  renderOfferPopup();
};

window.closeOfferPopup=function(e,force){
  if(force||!e||e.target===document.getElementById('offer-popup')){
    document.getElementById('offer-popup').classList.remove('open');
  }
};

window.selectOfferSchool=function(teamId,countyId){
  // Find the offer
  const offer=_mapOffers.find(o=>o.team.id===teamId);
  if(!offer)return;
  _selectedOfferTeam=offer.team;
  _selectedRivals=new Set();
  const cls=offer.team.cls;

  // Use the correct class divisions
  _setupDivs=_allClsDivs[cls];
  document.getElementById('s-cls').value=cls;
  document.getElementById('s-div').innerHTML=_setupDivs.map((d,i)=>`<option value="${i}">${d.name}</option>`).join('');

  // Find team position in its class divisions
  let foundDIdx=0,foundSIdx=0;
  for(let d=0;d<_setupDivs.length;d++){
    const ti=_setupDivs[d].teams.findIndex(t=>t.id===teamId);
    if(ti>=0){foundDIdx=d;foundSIdx=ti;break;}
  }
  document.getElementById('s-div').value=String(foundDIdx);
  document.getElementById('s-sch').value=String(foundSIdx);

  // Show selected panel
  const panel=document.getElementById('selected-school-panel');
  const info=document.getElementById('selected-school-info');
  panel.style.display='';
  const t=offer.team;
  const clsCol=offCol(t.cls);
  info.innerHTML=`<div style="font-family:var(--hd);font-size:18px;font-weight:900;color:var(--tx)">${t.name} ${t.mascot}</div>
    <div style="font-size:11px;color:var(--mu);margin-top:3px">${t.city} · ${cntyLbl(MAPC[countyId])}</div>
    <div style="font-size:12px;color:${clsCol};font-weight:700;margin-top:4px">${clsName(t.cls)}</div>`;

  // Rivalry picker, all other teams in same class
  const rfg=document.getElementById('rivalry-fg');
  const picker=document.getElementById('rivalry-picker');
  rfg.style.display='';
  const allTeamsInClass=_setupDivs.flatMap(d=>d.teams).filter(t2=>t2.id!==teamId);
  picker.innerHTML=allTeamsInClass.slice(0,24).map((t2,i)=>`<button class="rival-btn" id="rvb-${t2.id||i}" onclick="toggleRival(${t2.id||i},this)">${t2.name} ${t2.mascot}</button>`).join('');

  // Enable start button
  const btn=document.getElementById('btn-start');
  btn.disabled=false;btn.style.opacity='1';btn.style.cursor='pointer';

  // Re-render county panel and map to reflect selection
  if(_selectedCounty!==null)onCountyClick(_selectedCounty);
  renderOfferList();
};

function renderOfferList(){
  const list=document.getElementById('offer-list');
  if(!list)return;
  let _lastSt=null;
  list.innerHTML=_mapOffers.map((o,i)=>{
    const t=o.team;
    const clsCol=offCol(t.cls);
    const county=MAPC[o.countyId]||{name:'?'};
    const head=o.st!==_lastSt?`<div style="font-family:var(--hd);font-size:12px;font-weight:900;color:var(--te);margin:${_lastSt?'8px':'0'} 0 2px">${stName(o.st)}</div>`:'';_lastSt=o.st;
    const isSelected=_selectedOfferTeam&&_selectedOfferTeam.id===t.id;
    const logoSvg=sLogo(t,32);
    return head+`<div class="offer-card cls-${t.cls.toLowerCase()} ${isSelected?'sel-offer':''}" style="cursor:pointer;border-left:3px solid ${clsCol}" onclick="mapSetSt('${o.st}');onCountyClick(${o.countyId});onCountyClickFocus(${o.countyId})">
      <div style="display:flex;align-items:center;gap:8px">
        <div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;flex-shrink:0">${logoSvg}</div>
        <div style="flex:1;min-width:0">
          <div style="font-family:var(--hd);font-size:13px;font-weight:800;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.name} ${t.mascot}</div>
          <div style="font-size:10px;color:var(--mu)">${cntyLbl(county)} · <span style="color:${clsCol}">${clsL(t.cls)}</span></div>
        </div>
        ${isSelected?`<div style="font-size:11px;color:var(--gn);font-weight:700"></div>`:''}
      </div>
    </div>`;
  }).join('');
}
window.onCountyClickFocus=function(id){_selectedCounty=id;renderCountyMap();};

window.toggleRival=function(id,btn){
  if(_selectedRivals.has(id)){_selectedRivals.delete(id);btn.classList.remove('sel');}
  else{
    if(_selectedRivals.size>=3){alert('You can only pick up to 3 rivalries.');return;}
    _selectedRivals.add(id);btn.classList.add('sel');
  }
};

function onCls(keepDivs){
  _sId=1;
  const cls=document.getElementById('s-cls').value;
  if(!keepDivs||!_setupDivs){
    // Reset name registry for a fresh generation
    _usedSchoolNames.clear();
    Object.keys(_citySchoolCount).forEach(k=>delete _citySchoolCount[k]);
    _allClsDivs=null;
    _setupDivs=makeDivisions(cls);
  }
  const dsel=document.getElementById('s-div');
  dsel.innerHTML=_setupDivs.map((d,i)=>`<option value="${i}">${d.name}</option>`).join('');
  onDiv();
}
function onDiv(){
  const dIdx=parseInt(document.getElementById('s-div').value)||0;
  const div=_setupDivs[dIdx];
  document.getElementById('s-sch').innerHTML=div.teams.map((s,i)=>`<option value="${i}">${s.name} ${s.mascot}, ${s.city}</option>`).join('');
  onSch();
}
document.getElementById('s-div').addEventListener('change',onDiv);
function onSch(){}

