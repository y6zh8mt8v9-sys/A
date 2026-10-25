// ═══════════ DIVISION EDITOR ═══════════
function closeDivEditor(){
  // Flush any edited names back into _setupDivs
  const inputs=document.querySelectorAll('.div-name-input');
  inputs.forEach((inp,i)=>{
    const val=inp.value.trim();
    if(val&&_setupDivs[i])_setupDivs[i].name=val;
  });
  document.getElementById('div-editor').style.display='none';
  // Refresh the division dropdown
  const dsel=document.getElementById('s-div');
  const curVal=dsel.value;
  dsel.innerHTML=_setupDivs.map((d,i)=>`<option value="${i}"${i==curVal?' selected':''}>${d.name}</option>`).join('');
  onDiv();
}
function resetDivNames(){
  const cls=document.getElementById('s-cls').value;
  const names=DIV_NAMES[cls]||[];
  _setupDivs.forEach((d,i)=>{d.name=names[i]||`League ${i+1}`;});
  renderDivEditorList();
}
function renderDivEditorList(){
  const list=document.getElementById('div-editor-list');
  list.innerHTML=_setupDivs.map((d,i)=>`
    <div style="display:flex;align-items:center;gap:10px;">
      <span style="font-size:11px;color:var(--mu);font-family:var(--hd);font-weight:700;min-width:22px;text-align:right;">${i+1}.</span>
      <input class="ei div-name-input" value="${d.name}" placeholder="League ${i+1} name" style="flex:1;" oninput="liveDivName(this,${i})">
      <span style="font-size:10px;color:var(--mu);white-space:nowrap;">${d.teams.length} teams</span>
    </div>
  `).join('');
}
function liveDivName(inp,i){
  if(_setupDivs[i])_setupDivs[i].name=inp.value||`League ${i+1}`;
}

// ═══════════ TEAM BUILDER ═══════════
let _tbTab='browse';
let _tbEditId=null; // team id being edited (uses _sId namespace)
let _tbAddLogoData=null; // base64 custom logo for add form
let _tbEditLogoData=null; // base64 custom logo for edit form
let _tbUniT=null; // copy of the school's colors and uniforms the edit form's uniform editor works on
function tbUniRender(){const el=document.getElementById('tb-uni');if(el&&_tbUniT)el.innerHTML=uniHostHtml(_tbUniT,tbUniRender,false);}
// Multi-classification team builder: stores divisions for ALL 5 classes
// _allClsDivs[cls] = array of division objects (same shape as _setupDivs)
let _allClsDivs=null; // populated when Team Builder opens
let _tbCls=null; // currently viewed classification in builder

function initAllClsDivs(){
  if(_allClsDivs)return;
  // Reset name registry so re-generation doesn't accumulate stale names
  _usedSchoolNames.clear();
  Object.keys(_citySchoolCount).forEach(k=>delete _citySchoolCount[k]);
  const curCls=document.getElementById('s-cls').value;
  _allClsDivs={};
  // Copy current classification's live divisions (already generated during setup)
  _allClsDivs[curCls]=_setupDivs;
  // Register names from _setupDivs so other classes don't duplicate them
  _setupDivs.forEach(div=>div.teams.forEach(t=>{
    _usedSchoolNames.add(t.name);
    if(!_citySchoolCount[t.city])_citySchoolCount[t.city]=0;
    _citySchoolCount[t.city]++;
  }));
  // Generate fresh divisions for other classes (no player data needed, just team shells)
  for(const cls of ['1A','2A','3A','4A','5A']){
    if(cls!==curCls)_allClsDivs[cls]=makeDivisions(cls);
  }
  // every other state too, so a job anywhere on the map can be accepted
  for(const c of XCLS_ORDER)if(!_allClsDivs[c]){_allClsDivs[c]=makeStateDivisions(c);for(const d of _allClsDivs[c])for(const t of d.teams)t.cls=c;}
  _tbCls=curCls;
}

// ── Team Builder draft: every change is stored right away and re-applied whenever the setup map is rebuilt ──
const TBD_KEY='gpgm_tbdraft';let _tbSt=null;
function tbWorldKey(){try{return JSON.stringify(USA.on?{s:USA.cfg.states,h:USA.cfg.home,c:(USA.cfg.custom||[]).map(x=>x.ab)}:'classic');}catch(e){return'classic';}}
// where a classification sits on the map: [state, its place among that state's classes, how many the state has]. Team packs and the
// Team Builder draft carry it, so schools built in one world land in the same state in another (a Michigan pack, then an Indiana pack)
function clsPort(c){if(!USA.on)return null;const st=clsSt(c),ab=USA.ab[st];if(!ab)return null;const L=clsOfSt(st),i=L.indexOf(c);return i<0?null:[ab,i,L.length];}
function clsFromPort(p){if(!USA.on||!Array.isArray(p))return null;const st=USA.code[p[0]];if(!st)return null;const L=clsOfSt(st);if(!L.length)return null;
  return L[clamp(L.length-1-((+p[2]||L.length)-1-(+p[1]||0)),0,L.length-1)];} // lined up from the biggest class down
// ports for the classes of a pack taken out of a save, worked out from the class codes and the save's home state
function packPorts(codes,home){const by={};for(const c of codes){let st=null,n=0;if(CLS_ORDER.includes(c)){st='CF';n=100+CLS_ORDER.indexOf(c);}else{const m=/^([A-Z]{2,3})-(\d+)$/.exec(c);if(m){st=m[1];n=+m[2];}}if(st)(by[st]=by[st]||[]).push([n,c]);}
  const out={};for(const st in by){const ab=st==='CF'?home:st==='COL'?'CO':st;if(!ab)continue;const L=by[st].sort((a,b)=>a[0]-b[0]);L.forEach(([,c],i)=>out[c]=[ab,i,L.length]);}return out;}
function tbDraftMove(d){const pt=d.pt||{},it=[],sp=x=>{const i=String(x||'').indexOf('|');return i<0?[x,'']:[x.slice(0,i),x.slice(i+1)];};
  for(const k in d.ed){const[c,r]=sp(k),f=d.ed[k],[tc,td]=sp(f.to);it.push({t:'ed',p:pt[c],r,f,tp:pt[tc],td});}
  for(const k of d.del){const[c,r]=sp(k);it.push({t:'del',p:pt[c],r});}
  for(const a of d.add){const[tc,td]=sp(a.to);it.push({t:'add',f:a,tp:pt[tc],td});}
  for(const x of d.park||[])it.push(x);
  const ed={},del=[],add=[],park=[]; // edits for a state this world leaves out are parked and come back with the state
  for(const x of it){if(x.t==='add'){const n=clsFromPort(x.tp);if(n){x.f.to=n+'|'+x.td;add.push(x.f);}else park.push(x);continue;}
    const n=clsFromPort(x.p);if(!n){park.push(x);continue;}
    if(x.t==='del'){del.push(n+'|'+x.r);continue;}
    const tn=clsFromPort(x.tp);x.f.to=tn?tn+'|'+x.td:undefined;ed[n+'|'+x.r]=x.f;}
  return{k:tbWorldKey(),ed,del,add,park:park.slice(0,4000)};}
function tbDraft(){let d=null;try{d=JSON.parse(localStorage.getItem(TBD_KEY)||'null');}catch(e){}
  if(d&&d.k!==tbWorldKey()&&d.pt&&USA.on){d=tbDraftMove(d);tbDraftPut(d);}
  if(!d||d.k!==tbWorldKey())d={k:tbWorldKey(),ed:{},del:[],add:[]};return d;}
function tbDraftPut(d){try{if(USA.on){const pt={},P=c=>{if(c&&!pt[c]){const p=clsPort(c);if(p)pt[c]=p;}};for(const k in d.ed){P(k.split('|')[0]);P(String(d.ed[k].to||'').split('|')[0]);}for(const k of d.del)P(k.split('|')[0]);for(const a of d.add)P(String(a.to||'').split('|')[0]);d.pt=pt;}
  localStorage.setItem(TBD_KEY,JSON.stringify(d));return true;}catch(e){tbStatus('Could not save your changes on this device (storage full: try smaller logo images).','var(--rd)');return false;}}
function tbOk(t){return t._ok||(t._ok=(t.cls||'')+'|'+t.name);}
function tbFields(t){const f={name:t.name,mascot:t.mascot,city:t.city,abbr:t.abbr,c1:t.c1,c2:t.c2,prestige:t.prestige,customLogo:t.customLogo||null,to:t.cls+'|'+t.dIdx};for(const k of['c3','logoKey','mash','offS','defS','pdFix'])if(t[k])f[k]=t[k];{const u=uniClean(t.uni);if(u)f.uni=u;}return f;}
function tbRecord(t,op){const d=tbDraft();
  if(op==='add'){t._ok='add|'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);d.add.push(Object.assign({ok:t._ok},tbFields(t)));}
  else if(op==='del'){const ok=tbOk(t);const i=d.add.findIndex(a=>a.ok===ok);if(i>=0)d.add.splice(i,1);else{delete d.ed[ok];if(!d.del.includes(ok))d.del.push(ok);}}
  else{const ok=tbOk(t);const a=d.add.find(x=>x.ok===ok);if(a)Object.assign(a,tbFields(t));else d.ed[ok]=tbFields(t);}
  if(tbDraftPut(d))tbStatus('Saved on this device. Your changes stay for every new career until you discard them, so you can continue any time.');}
// a world file or community world can carry a Team Builder pack (every school someone changed); it is taken over the next time
// the setup map is built for that world, so it is keyed to the world it belongs to
function tbPackOut(){const d=tbDraft(),n=Object.keys(d.ed).length+d.del.length+d.add.length;return n?{ed:d.ed,del:d.del,add:d.add}:null;}
function tbPackClean(t){if(!t||typeof t!=='object')return undefined;
  const col=c=>/^#[0-9a-f]{6}$/i.test(c||'')?c:'#444444',lg=v=>typeof v==='string'&&v.length<120000&&/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+\/=]+$/.test(v)?v:null;
  const lk=v=>v&&typeof _LGO!=='undefined'&&_LGO[v]?v:undefined;const F=f=>f&&typeof f==='object'?{name:wsClean(f.name),mascot:wsClean(f.mascot),city:wsClean(f.city),abbr:String(f.abbr||'').toUpperCase().replace(/[^A-Z]/g,'').slice(0,3),c1:col(f.c1),c2:col(f.c2),prestige:clamp(Math.round(+f.prestige)||3,1,5),customLogo:lg(f.customLogo),to:String(f.to||'').slice(0,40),pdFix:f.pdFix===1||f.pdFix===2?f.pdFix:undefined,c3:/^#[0-9a-f]{6}$/i.test(f.c3||'')?f.c3:undefined,logoKey:lk(f.logoKey),mash:lk(f.mash),offS:OFF_SCH.includes(f.offS)?f.offS:undefined,defS:DEF_SCH.includes(f.defS)?f.defS:undefined,uni:uniClean(f.uni)}:null;
  const ed={};if(t.ed&&typeof t.ed==='object'&&!Array.isArray(t.ed))for(const k of Object.keys(t.ed).slice(0,4000)){const v=F(t.ed[k]);if(v&&v.name)ed[String(k).slice(0,120)]=v;}
  const del=Array.isArray(t.del)?t.del.slice(0,4000).map(x=>String(x).slice(0,120)):[];
  const add=Array.isArray(t.add)?t.add.slice(0,400).map(a=>{const v=F(a);return v&&v.name?Object.assign(v,{ok:String((a&&a.ok)||('add|'+Math.random().toString(36).slice(2,8))).slice(0,60)}):null;}).filter(Boolean):[];
  return Object.keys(ed).length+del.length+add.length?{ed,del,add}:undefined;}
function tbPackPending(tb){try{if(tb)localStorage.setItem(TBD_KEY+'_in',JSON.stringify(tb));}catch(e){notify('The teams in that file are too big to keep on this device','w');}}
function tbAdoptPending(){try{const P=localStorage.getItem(TBD_KEY+'_in');if(!P)return;localStorage.removeItem(TBD_KEY+'_in');const p=JSON.parse(P);tbDraftPut({k:tbWorldKey(),ed:p.ed||{},del:p.del||[],add:p.add||[]});}catch(e){}}
function tbDraftCount(){const d=tbDraft();return Object.keys(d.ed).length+d.del.length+d.add.length;}
function tbApplyDraft(){
  if(!_allClsDivs)return 0;tbAdoptPending();const d=tbDraft(),n=Object.keys(d.ed).length+d.del.length+d.add.length;if(!n)return 0;
  const byOk={};for(const[c,dv]of Object.entries(_allClsDivs))for(const dd of dv)for(const t of dd.teams){byOk[(t._ok)||(c+'|'+t.name)]=t;t.cls=t.cls||c;}
  const moveTo=(t,to)=>{if(!to)return;const[c,di]=to.split('|'),D=_allClsDivs[c],k=+di;if(!D||!D[k]||(t.cls===c&&t.dIdx===k))return;
    for(const dv of Object.values(_allClsDivs))for(const dd of dv){const i=dd.teams.indexOf(t);if(i>=0)dd.teams.splice(i,1);}t.cls=c;t.dIdx=k;D[k].teams.push(t);};
  for(const ok of d.del){const t=byOk[ok];if(!t)continue;for(const dv of Object.values(_allClsDivs))for(const dd of dv){const i=dd.teams.indexOf(t);if(i>=0)dd.teams.splice(i,1);}}
  for(const ok in d.ed){const t=byOk[ok];if(!t)continue;const f=d.ed[ok];t._ok=ok;Object.assign(t,{name:f.name,mascot:f.mascot,city:f.city,abbr:f.abbr,c1:f.c1,c2:f.c2,prestige:f.prestige,customLogo:f.customLogo||null});for(const k of['c3','logoKey','mash','offS','defS'])if(f[k])t[k]=f[k];if(f.pdFix)t.pdFix=f.pdFix;else delete t.pdFix;{const u=uniClean(f.uni);if(u)t.uni=u;else delete t.uni;}moveTo(t,f.to);}
  for(const a of d.add){const[c,di]=String(a.to||'').split('|'),D=_allClsDivs[c];if(!D)continue;const k=clamp(+di||0,0,D.length-1);
    D[k].teams.push({id:_sId++,_ok:a.ok,pdFix:a.pdFix,name:a.name,mascot:a.mascot,city:a.city,cls:c,dIdx:k,abbr:a.abbr,c1:a.c1,c2:a.c2,c3:a.c3,logoKey:a.logoKey,mash:a.mash,prestige:a.prestige||3,wins:0,losses:0,isP:false,offS:a.offS||pick(OFF_SCH),defS:a.defS||pick(DEF_SCH),fac:{weight:1,film:1,train:1,med:1},staff:genStaff(false),trophies:[],tier:'avg',trainLevel:1,customLogo:a.customLogo||null,uni:uniClean(a.uni)});}
  return n;}
window.tbDraftClear=function(){if(!confirm('Undo every Team Builder change and go back to the original schools?'))return;try{localStorage.removeItem(TBD_KEY);}catch(e){}
  _allClsDivs=null;try{_usedSchoolNames.clear();Object.keys(_citySchoolCount).forEach(k=>delete _citySchoolCount[k]);}catch(e){}initCountyMap();tbTab('browse');tbStatus('Team Builder changes cleared.','var(--gd)');};
function tbStCur(){return _tbSt||clsSt(_tbCls)||'CF';}
window.tbSetSt=function(st){_tbSt=st;_tbCls=clsOfSt(st)[0];tbTab('browse');};
// any school in the same state can join this division, whatever classification it was in (a conference that mixes classes)
let _tbPullTo=null;
window.tbPull=function(dIdx){_tbPullTo={cls:_tbCls,dIdx};const el=document.getElementById('tb-find');if(!el)return;const dv=tbGetDivs(_tbCls)[dIdx];
  el.innerHTML=`<div style="padding:8px 10px;background:var(--s2);border:1px solid var(--bd);border-radius:6px"><div style="font-size:12px;margin-bottom:6px">Bring a school from anywhere in ${stName(tbStCur())} into <b>${dv?dv.name:'this division'}</b>. It plays its league games there from now on.</div>
  <input id="tb-pull-q" placeholder="School, mascot or city" aria-label="Find a school to bring in" oninput="tbPullFind(this.value)" style="width:100%;padding:5px 8px"><div id="tb-pull-r" style="margin-top:6px"></div>
  <button class="bgh bxs" style="margin-top:6px" onclick="_tbPullTo=null;document.getElementById('tb-find').innerHTML=''">Close</button></div>`;
  try{el.scrollIntoView({block:'nearest'});document.getElementById('tb-pull-q').focus();}catch(e){}};
window.tbPullFind=function(q){const el=document.getElementById('tb-pull-r'),P=_tbPullTo;if(!el||!P)return;q=String(q||'').trim().toLowerCase();if(q.length<2){el.innerHTML='';return;}const out=[];
  for(const c of clsOfSt(clsSt(P.cls)))(_allClsDivs[c]||[]).forEach((dd,di)=>dd.teams.forEach((t,ti)=>{if(out.length<30&&!(c===P.cls&&di===P.dIdx)&&(t.name+' '+t.mascot+' '+t.city).toLowerCase().includes(q))out.push([c,di,ti,t,dd.name]);}));
  el.innerHTML=out.length?out.map(([c,di,ti,t,dn])=>`<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid var(--bd)">${sLogo(t,24)}<div style="flex:1;min-width:0;font-size:12px"><b>${t.name} ${t.mascot}</b> <span style="color:var(--mu)">${dn} · ${clsName(c)}</span></div><button class="bgh bxs" onclick="tbBring('${c}',${di},${ti})">Bring here</button></div>`).join(''):'<div style="font-size:12px;color:var(--mu)">No school found.</div>';};
window.tbBring=function(c,di,ti){const P=_tbPullTo,D=_allClsDivs[c],T=P&&_allClsDivs[P.cls];if(!P||!D||!D[di]||!T||!T[P.dIdx])return;const t=D[di].teams[ti];if(!t)return;
  tbOk(t);D[di].teams.splice(ti,1);t.cls=P.cls;t.dIdx=P.dIdx;T[P.dIdx].teams.push(t);_tbPullTo=null;tbTab('browse');tbRecord(t,'edit');
  tbStatus(`${t.name} now plays in ${T[P.dIdx].name}. Saved on this device.`);};
window.tbSearch=function(q){const el=document.getElementById('tb-find');if(!el)return;q=String(q||'').trim().toLowerCase();if(q.length<2){el.innerHTML='';return;}const out=[];
  for(const[c,dv]of Object.entries(_allClsDivs||{}))dv.forEach((dd,di)=>dd.teams.forEach((t,ti)=>{if(out.length<40&&(t.name+' '+t.mascot+' '+t.city).toLowerCase().includes(q))out.push([c,di,ti,t]);}));
  el.innerHTML=out.length?out.map(([c,di,ti,t])=>`<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid var(--bd)">${sLogo(t,24)}<div style="flex:1;min-width:0;font-size:12px"><b>${t.name} ${t.mascot}</b> <span style="color:var(--mu)">${t.city} · ${clsName(c)}</span></div><button class="bgh bxs" onclick="_tbSt=clsSt('${c}');_tbCls='${c}';tbEditTeam(${di},${ti})">Edit</button></div>`).join(''):'<div style="font-size:12px;color:var(--mu)">No school found.</div>';};
function tbGetDivs(cls){
  if(!_allClsDivs)initAllClsDivs();
  return _allClsDivs[cls||_tbCls]||[];
}

function tbSetCls(cls){
  _tbCls=cls;
  // Sync _setupDivs to reflect the currently-selected classification's divs
  // (the "selected classification" in setup still drives the player's own game start)
  tbTab('browse');
}

function openTeamBuilder(){
  // Ensure _setupDivs is initialized
  if(!_setupDivs){onCls();}
  // keep the league the setup map already built (every state); only build one if there is none yet
  initAllClsDivs();
  _tbCls=document.getElementById('s-cls').value;
  _tbTab='browse';
  document.getElementById('team-builder').style.display='flex';
  tbTab('browse');
}
function closeTeamBuilder(){
  document.getElementById('team-builder').style.display='none';_tbUniT=null;window._uniT=null;
  // Sync the player's selected classification's divs back to _setupDivs
  const curCls=document.getElementById('s-cls').value;
  if(_allClsDivs&&_allClsDivs[curCls]){
    _setupDivs=_allClsDivs[curCls];
  }
  // Refresh school selector in case teams were added/edited
  onDiv();
  // Re-assign teams to counties and regenerate offers so map reflects any builder changes
  if(_allClsDivs){
    assignTeamsToCounties(_allClsDivs);
    _mapOffers=generateStartingOffers(_allClsDivs);
    renderCountyMap();
    renderOfferList();
  }
}
function tbTab(tab){
  _tbTab=tab;
  ['browse','add','export'].forEach(t=>{
    const btn=document.getElementById('tb-tab-'+t);
    if(btn)btn.classList.toggle('on',t===tab);
  });
  const body=document.getElementById('tb-body');
  if(tab==='browse')body.innerHTML=tbRenderBrowse();
  else if(tab==='add')body.innerHTML=tbRenderAdd();
  else if(tab==='export')body.innerHTML=tbRenderExport();
}
function tbStatus(msg,color='var(--gn)'){
  const el=document.getElementById('tb-status');
  if(el){el.textContent=msg;el.style.color=color;setTimeout(()=>{if(el.textContent===msg)el.style.color='var(--mu)';},3000);}
}

// ── BROWSE TAB ──
function tbRenderBrowse(){
  if(!_allClsDivs)initAllClsDivs();
  const divs=tbGetDivs(_tbCls);
  const curGameCls=document.getElementById('s-cls').value;
  return`<div style="margin-bottom:12px;">
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
      <label style="font-size:11px;font-weight:700;color:var(--mu)">State <select onchange="tbSetSt(this.value)" style="padding:4px 8px;border-radius:4px">${ST_ORDER.map(k=>`<option value="${k}"${k===tbStCur()?' selected':''}>${stName(k)}${XST[k]&&XST[k].lite?' (light)':''}</option>`).join('')}</select></label>
      <input placeholder="Find any school…" oninput="tbSearch(this.value)" style="flex:1 1 180px;padding:5px 8px">
      ${tbDraftCount()?`<span style="font-size:11px;color:var(--gn)">${tbDraftCount()} saved change${tbDraftCount()===1?'':'s'}</span><button class="bgh bxs" onclick="tbDraftClear()">Discard my changes</button>`:''}</div>
    <div id="tb-find" style="margin-bottom:8px"></div>
    <div style="font-size:10px;letter-spacing:1px;color:var(--mu);font-weight:700;margin-bottom:6px;">View Classification:</div>
    <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px;">
      ${clsOfSt(tbStCur()).map(cls=>`
        <button onclick="tbSetCls('${cls}')" style="background:${_tbCls===cls?'var(--ac)':'var(--s2)'};border:1px solid ${_tbCls===cls?'var(--ac)':'var(--bd)'};color:${_tbCls===cls?'var(--tOn,#fff)':'var(--tx)'};padding:4px 12px;border-radius:4px;cursor:pointer;font-family:var(--hd);font-weight:700;font-size:13px;">
          ${(clsName(cls)||cls).replace(stName(tbStCur())+' ','')}${cls===curGameCls?' ★':''}
        </button>`).join('')}
    </div>
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:6px 10px;background:var(--s2);border:1px solid var(--bd);border-radius:5px;margin-bottom:10px;">
      <div style="font-family:var(--hd);font-size:15px;font-weight:800;color:var(--te)">League: ${clsName(_tbCls)}</div>
      ${_tbCls===curGameCls?`<span style="font-size:10px;background:var(--ac);color:var(--tOn,#fff);padding:2px 7px;border-radius:3px;font-weight:700;">Your class ★</span>`:''}
      <span style="font-size:11px;color:var(--mu)">${divs.reduce((s,d)=>s+d.teams.length,0)} teams · ${divs.length} divisions</span>
    </div>
  </div>
  ${divs.map((div,dIdx)=>`
    <div style="margin-bottom:18px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid var(--bd);">
        <div style="font-family:var(--hd);font-size:14px;font-weight:800;color:var(--te);">${div.name}</div>
        <span style="font-size:10px;color:var(--mu)">${div.teams.length} teams</span>
        <button class="bgh bxs" style="margin-left:auto" onclick="tbPull(${dIdx})">Bring in a school</button><button class="btn bsm bbl" style="padding:2px 9px;font-size:10px;" onclick="tbAddToDiv(${dIdx})">Add a new team</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;">
        ${div.teams.map((t,tIdx)=>tbTeamCard(t,dIdx,tIdx)).join('')}
      </div>
    </div>
  `).join('')}`;
}

function tbTeamCard(t,dIdx,tIdx){
  const c1=t.c1||'#333',c2=t.c2||'#fff';
  const logoSvg=sLogo(t,38);
  return`<div style="background:var(--s2);border:1px solid var(--bd);border-left:3px solid ${c1};border-radius:5px;padding:8px 10px;display:flex;align-items:center;gap:8px;position:relative;">
    ${logoSvg}
    <div style="flex:1;min-width:0;">
      <div style="font-weight:700;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${t.name}</div>
      <div style="font-size:10px;color:var(--mu);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${t.mascot} · ${t.city}</div>
    </div>
    <div style="display:flex;gap:3px;flex-shrink:0;">
      <button class="bgh" style="padding:2px 6px;font-size:10px;" onclick="tbEditTeam(${dIdx},${tIdx})" title="Edit team">Edit</button>
      <button class="bgh" style="padding:2px 6px;font-size:10px;border-color:var(--rd);color:var(--rd);" onclick="tbDeleteTeam(${dIdx},${tIdx})" title="Remove team">✕</button>
    </div>
  </div>`;
}

// ── ADD TEAM TAB ──
function tbRenderAdd(dIdx){
  if(!_allClsDivs)initAllClsDivs();
  _tbAddLogoData=null;
  const selDiv=dIdx!==undefined?dIdx:0;
  const divs=tbGetDivs(_tbCls);
  return`<div style="max-width:520px;">
    <div style="font-family:var(--hd);font-size:14px;font-weight:800;color:var(--te);margin-bottom:14px;">Add New Team</div>
    <div class="fg" style="margin-bottom:10px;">
      <label>Classification</label>
      <div style="display:flex;gap:5px;flex-wrap:wrap;">
        ${clsOfSt(tbStCur()).map(cls=>`
          <button onclick="tbSwitchAddCls('${cls}')" id="tb-add-cls-${cls}" style="background:${_tbCls===cls?'var(--ac)':'var(--s2)'};border:1px solid ${_tbCls===cls?'var(--ac)':'var(--bd)'};color:${_tbCls===cls?'var(--tOn,#fff)':'var(--tx)'};padding:3px 11px;border-radius:4px;cursor:pointer;font-family:var(--hd);font-weight:700;font-size:13px;">
            ${(clsName(cls)||cls).replace(stName(tbStCur())+' ','')}
          </button>`).join('')}
      </div>
    </div>
    <div class="g2" style="gap:10px;margin-bottom:10px;">
      <div class="fg"><label>School Name</label><input class="ei" id="tb-add-name" placeholder="e.g. Jefferson High" oninput="tbPreviewLogo('add')"></div>
      <div class="fg"><label>Mascot</label><input class="ei" id="tb-add-mascot" placeholder="e.g. Eagles" oninput="tbPreviewLogo('add')"></div>
      <div class="fg"><label>City</label><input class="ei" id="tb-add-city" placeholder="e.g. Springfield"></div>
      <div class="fg"><label>League</label>
        <select class="ei" id="tb-add-div">
          ${divs.map((d,i)=>`<option value="${i}"${i===selDiv?' selected':''}>${d.name} (${d.teams.length} teams)</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="g2" style="gap:10px;margin-bottom:10px;">
      <div class="fg"><label>Primary Color</label><input class="ei" type="color" id="tb-add-c1" value="#111a26" oninput="tbPreviewLogo('add')" style="height:34px;padding:2px 4px;cursor:pointer;"></div>
      <div class="fg"><label>Secondary Color</label><input class="ei" type="color" id="tb-add-c2" value="#2f6fed" oninput="tbPreviewLogo('add')" style="height:34px;padding:2px 4px;cursor:pointer;"></div>
    </div>
    <div class="fg" style="margin-bottom:10px;">
      <label>Prestige (1–5)</label>
      <select class="ei" id="tb-add-prestige">
        ${[1,2,3,4,5].map(p=>`<option value="${p}"${p===3?' selected':''}>${'★'.repeat(p)} (${p})</option>`).join('')}
      </select>
    </div>
    <div class="fg" style="margin-bottom:12px;">
      <label>Custom Logo (optional PNG/JPG)</label>
      <div style="display:flex;gap:8px;align-items:center;">
        <button class="bgh bsm" onclick="tbUploadLogo('add')" style="white-space:nowrap;">Upload Image</button>
        <span id="tb-add-logo-name" style="font-size:11px;color:var(--mu);">No file chosen</span>
        <button class="bgh bsm" onclick="tbClearLogo('add')" style="display:none;" id="tb-add-logo-clear">✕ Clear</button>
      </div>
    </div>

    <div style="display:flex;align-items:center;gap:14px;background:var(--s2);border:1px solid var(--bd);border-radius:6px;padding:12px 16px;margin-bottom:14px;">
      <div id="tb-add-preview-logo" style="width:48px;height:48px;display:flex;align-items:center;justify-content:center;"></div>
      <div>
        <div id="tb-add-preview-name" style="font-family:var(--hd);font-size:16px;font-weight:900;">Preview Team</div>
        <div id="tb-add-preview-sub" style="font-size:11px;color:var(--mu);">Mascot · City</div>
      </div>
    </div>
    <div style="display:flex;gap:8px;">
      <button class="btn bgn" onclick="tbConfirmAdd()" style="flex:1;">✓ Add Team</button>
      <button class="bgh" onclick="tbTab('browse')" style="flex:1;">Cancel</button>
    </div>
  </div>`;
}

function tbPreviewLogo(mode){
  const name=document.getElementById(`tb-${mode}-name`)?.value||'';
  const mascot=document.getElementById(`tb-${mode}-mascot`)?.value||'';
  const city=document.getElementById(`tb-${mode}-city`)?.value||'';
  const c1=document.getElementById(`tb-${mode}-c1`)?.value||'#333';
  const c2=document.getElementById(`tb-${mode}-c2`)?.value||'#fff';
  const logoData=mode==='add'?_tbAddLogoData:_tbEditLogoData;
  const fakeTeam={id:'prev_'+mode,name,mascot,city,c1,c2,customLogo:logoData||null};
  const logoPrev=document.getElementById(`tb-${mode}-preview-logo`);
  const namePrev=document.getElementById(`tb-${mode}-preview-name`);
  const subPrev=document.getElementById(`tb-${mode}-preview-sub`);
  if(logoPrev)logoPrev.innerHTML=sLogo(fakeTeam,48);
  if(namePrev)namePrev.textContent=name||'Team Name';
  if(subPrev)subPrev.textContent=`${mascot||'Mascot'} · ${city||'City'}`;
  if(mode==='edit'&&_tbUniT){_tbUniT.c1=c1;_tbUniT.c2=c2;tbUniRender();}
}

function tbUploadLogo(mode){
  const inp=document.createElement('input');inp.type='file';inp.accept='image/png,image/jpeg,image/gif,image/webp';
  inp.onchange=function(e){
    const file=e.target.files[0];if(!file)return;
    logoShrink(file,function(data){
      if(mode==='add'){_tbAddLogoData=data;}else{_tbEditLogoData=data;}
      const nameEl=document.getElementById(`tb-${mode}-logo-name`);
      const clearEl=document.getElementById(`tb-${mode}-logo-clear`);
      if(nameEl)nameEl.textContent=file.name.length>28?file.name.slice(0,25)+'…':file.name;
      if(clearEl)clearEl.style.display='inline-block';
      tbPreviewLogo(mode);
    });
  };inp.click();
}
function tbClearLogo(mode){
  if(mode==='add')_tbAddLogoData=null;else _tbEditLogoData=null;
  const nameEl=document.getElementById(`tb-${mode}-logo-name`);
  const clearEl=document.getElementById(`tb-${mode}-logo-clear`);
  if(nameEl)nameEl.textContent='No file chosen';
  if(clearEl)clearEl.style.display='none';
  tbPreviewLogo(mode);
}

function tbAbbrUsed(cls){const st=clsSt(cls),u=new Set();for(const[c,dv]of Object.entries(_allClsDivs||{}))if(clsSt(c)===st)for(const d of dv)for(const t of d.teams)if(t.abbr)u.add(t.abbr);return u;}
function tbSwitchAddCls(cls){
  _tbCls=cls;
  tbTab('add');
}

function tbConfirmAdd(){
  const name=(document.getElementById('tb-add-name')?.value||'').trim();
  const mascot=(document.getElementById('tb-add-mascot')?.value||'').trim();
  const city=(document.getElementById('tb-add-city')?.value||'').trim();
  const dIdx=parseInt(document.getElementById('tb-add-div')?.value||'0');
  const c1=document.getElementById('tb-add-c1')?.value||'#111a26';
  const c2=document.getElementById('tb-add-c2')?.value||'#2f6fed';
  const prestige=parseInt(document.getElementById('tb-add-prestige')?.value||'3');
  if(!name){tbStatus('Enter a school name.','var(--rd)');return;}
  if(!mascot){tbStatus('Enter a mascot.','var(--rd)');return;}
  if(!city){tbStatus('Enter a city.','var(--rd)');return;}
  const cls=_tbCls||document.getElementById('s-cls').value;
  const abbr=abbr3(name,tbAbbrUsed(cls));
  const newTeam={
    id:_sId++,name,mascot,city,cls,dIdx,abbr,c1,c2,
    prestige,wins:0,losses:0,isP:false,
    offS:pick(OFF_SCH),defS:pick(DEF_SCH),
    fac:{weight:1,film:1,train:1,med:1},
    staff:genStaff(false),trophies:[],tier:'avg',trainLevel:1,
    customLogo:_tbAddLogoData||null
  };
  const divs=tbGetDivs(cls);
  divs[dIdx].teams.push(newTeam);tbRecord(newTeam,'add');
  // If this is the player's own game classification, keep _setupDivs in sync
  const curGameCls=document.getElementById('s-cls').value;
  if(cls===curGameCls)_setupDivs=divs;
  tbStatus(`✓ Added "${name} ${mascot}" to ${divs[dIdx].name} [${cls}]`);
  // Refresh division dropdown to reflect new team count
  const dsel=document.getElementById('s-div');
  if(dsel)dsel.innerHTML=(_allClsDivs[curGameCls]||_setupDivs).map((d,i)=>`<option value="${i}">${d.name}</option>`).join('');
  tbTab('browse');
}

// ── EDIT TEAM ──
function tbEditTeam(dIdx,tIdx){
  const divs=tbGetDivs(_tbCls);
  const t=divs[dIdx]?.teams[tIdx];if(!t)return;
  _tbEditId={dIdx,tIdx,cls:_tbCls};
  _tbEditLogoData=t.customLogo||null;
  // uniforms are changed on a copy, so Cancel leaves the school as it was
  _tbUniT={id:t.id,name:t.name,mascot:t.mascot,c1:t.c1,c2:t.c2,c3:t.c3,uni:uniClean(t.uni)};window._uniKind='home';
  const body=document.getElementById('tb-body');
  // Gather all divisions across all classes for cross-class move
  tbOk(t);const allClsOptions=clsOfSt(clsSt(_tbCls)).map(cls=>`<optgroup label="${clsName(cls)}">${(tbGetDivs(cls)||[]).map((d,i)=>`<option value="${cls}|${i}"${cls===_tbCls&&i===dIdx?' selected':''}>${d.name} (${d.teams.length} teams)</option>`).join('')}</optgroup>`).join('');
  // Set active tab to browse context but show edit form inline
  body.innerHTML=`<div style="max-width:760px;">
    <div style="font-family:var(--hd);font-size:14px;font-weight:800;color:var(--gd);margin-bottom:14px;">Edit team: ${t.name} ${t.mascot} <span style="color:var(--te)">(${clsName(_tbCls)})</span></div>
    <div class="g2" style="gap:10px;margin-bottom:10px;">
      <div class="fg"><label>School Name</label><input class="ei" id="tb-edit-name" value="${t.name}" oninput="tbPreviewLogo('edit')"></div>
      <div class="fg"><label>Mascot</label><input class="ei" id="tb-edit-mascot" value="${t.mascot}" oninput="tbPreviewLogo('edit')"></div>
      <div class="fg"><label>City</label><input class="ei" id="tb-edit-city" value="${t.city}"></div>
      <div class="fg"><label>Abbreviation (3 letters)</label><input class="ei" id="tb-edit-abbr" value="${t.abbr||''}" maxlength="3" style=""></div>
      <div class="fg"><label>Move to league (any classification)</label>
        <select class="ei" id="tb-edit-div">
          ${allClsOptions}
        </select>
      </div>
      <div class="fg"><label>Playoff division</label>
        <select class="ei" id="tb-edit-pd">${[[0,'By school size'],[1,'Division I (larger schools)'],[2,'Division II (smaller schools)']].map(([v,l])=>`<option value="${v}"${(t.pdFix||0)===v?' selected':''}>${l}</option>`).join('')}</select>
      </div>
    </div>
    <div class="g2" style="gap:10px;margin-bottom:10px;">
      <div class="fg"><label>Primary Color</label><input class="ei" type="color" id="tb-edit-c1" value="${t.c1||'#333'}" oninput="tbPreviewLogo('edit')" style="height:34px;padding:2px 4px;cursor:pointer;"></div>
      <div class="fg"><label>Secondary Color</label><input class="ei" type="color" id="tb-edit-c2" value="${t.c2||'#fff'}" oninput="tbPreviewLogo('edit')" style="height:34px;padding:2px 4px;cursor:pointer;"></div>
    </div>
    <div class="fg" style="margin-bottom:10px;">
      <label>Prestige (1–5)</label>
      <select class="ei" id="tb-edit-prestige">
        ${[1,2,3,4,5].map(p=>`<option value="${p}"${p===(t.prestige||1)?' selected':''}>${'★'.repeat(p)} (${p})</option>`).join('')}
      </select>
    </div>
    <div class="fg" style="margin-bottom:12px;">
      <label>Custom Logo</label>
      <div style="display:flex;gap:8px;align-items:center;">
        <button class="bgh bsm" onclick="tbUploadLogo('edit')" style="white-space:nowrap;">Upload Image</button>
        <span id="tb-edit-logo-name" style="font-size:11px;color:var(--mu);">${t.customLogo?'Custom logo set':'No custom logo'}</span>
        <button class="bgh bsm" onclick="tbClearLogo('edit')" id="tb-edit-logo-clear" style="${t.customLogo?'':'display:none;'}">✕ Clear</button>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:14px;background:var(--s2);border:1px solid var(--bd);border-radius:6px;padding:12px 16px;margin-bottom:14px;">
      <div id="tb-edit-preview-logo" style="width:48px;height:48px;display:flex;align-items:center;justify-content:center;">${sLogo(t,48)}</div>
      <div>
        <div id="tb-edit-preview-name" style="font-family:var(--hd);font-size:16px;font-weight:900;">${t.name}</div>
        <div id="tb-edit-preview-sub" style="font-size:11px;color:var(--mu);">${t.mascot} · ${t.city}</div>
      </div>
    </div>
    <div style="border-top:1px solid var(--bd);padding-top:12px;margin-bottom:14px;">
      <div style="font-family:var(--hd);font-size:14px;font-weight:800;color:var(--te);margin-bottom:10px;">Uniforms</div>
      <div id="tb-uni">${uniHostHtml(_tbUniT,tbUniRender,false)}</div>
    </div>
    <div style="display:flex;gap:8px;">
      <button class="btn bgd" onclick="tbSaveEdit()" style="flex:1;">Save Changes</button>
      <button class="bgh" onclick="tbTab('browse')" style="flex:1;">Cancel</button>
    </div>
  </div>`;
  // Sync tab UI to show browse as active context
  ['browse','add','export'].forEach(t2=>{
    const btn=document.getElementById('tb-tab-'+t2);
    if(btn)btn.classList.toggle('on',t2==='browse');
  });
}

function tbSaveEdit(){
  if(!_tbEditId)return;
  const {dIdx,tIdx,cls:editCls}=_tbEditId;
  const divs=tbGetDivs(editCls);
  const t=divs[dIdx]?.teams[tIdx];if(!t)return;
  const newName=(document.getElementById('tb-edit-name')?.value||'').trim()||t.name;
  const newMascot=(document.getElementById('tb-edit-mascot')?.value||'').trim()||t.mascot;
  const newCity=(document.getElementById('tb-edit-city')?.value||'').trim()||t.city;
  const newDivRaw=(document.getElementById('tb-edit-div')?.value||`${editCls}|${dIdx}`);
  const [newCls,newDIdxStr]=newDivRaw.includes('|')?newDivRaw.split('|'):[editCls,String(dIdx)];
  const newDIdx=parseInt(newDIdxStr);
  const newC1=document.getElementById('tb-edit-c1')?.value||t.c1;
  const newC2=document.getElementById('tb-edit-c2')?.value||t.c2;
  const newPrestige=parseInt(document.getElementById('tb-edit-prestige')?.value||'3');
  t.name=newName;t.mascot=newMascot;t.city=newCity;t.c1=newC1;t.c2=newC2;{const v=+(document.getElementById('tb-edit-pd')?.value||0);if(v===1||v===2)t.pdFix=v;else delete t.pdFix;}
  t.prestige=newPrestige;
  {const ab=String(document.getElementById('tb-edit-abbr')?.value||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,3);const u=tbAbbrUsed(editCls);u.delete(t.abbr);t.abbr=ab.length===3&&!u.has(ab)?ab:(newName!==t._ok.split('|').slice(1).join('|')||ab.length!==3?abbr3(newName,u):t.abbr);}
  t.customLogo=_tbEditLogoData||null;
  if(_tbUniT){const u=uniClean(_tbUniT.uni);if(u)t.uni=u;else delete t.uni;if(_tbUniT.c3)t.c3=_tbUniT.c3;}_tbUniT=null;window._uniT=null;
  // Move to different division/classification if requested
  if(newCls!==editCls||newDIdx!==dIdx){
    divs[dIdx].teams.splice(tIdx,1);
    t.dIdx=newDIdx;t.cls=newCls;
    const targetDivs=tbGetDivs(newCls);
    if(targetDivs[newDIdx])targetDivs[newDIdx].teams.push(t);
    else divs[dIdx].teams.push(t); // safety fallback
    _tbCls=newCls; // switch view to where the team landed
  }
  _tbEditId=null;
  tbRecord(t,'edit');
  // Refresh school dropdown
  const curGameCls=document.getElementById('s-cls').value;
  const gameDivs=_allClsDivs?.[curGameCls]||_setupDivs;
  const dsel=document.getElementById('s-div');
  if(dsel)dsel.innerHTML=gameDivs.map((d,i)=>`<option value="${i}">${d.name}</option>`).join('');
  onDiv();
  tbTab('browse');
}

function tbDeleteTeam(dIdx,tIdx){
  const divs=tbGetDivs(_tbCls);
  const t=divs[dIdx]?.teams[tIdx];if(!t)return;
  // Safe inline confirmation (avoid confirm() which fails in sandboxed iframes)
  const body=document.getElementById('tb-body');
  body.innerHTML=`<div style="max-width:420px;text-align:center;padding:20px 0;">
    <div style="font-family:var(--hd);font-size:18px;font-weight:900;color:var(--rd);margin-bottom:8px;">Remove Team?</div>
    <div style="font-size:13px;color:var(--tx);margin-bottom:6px;"><strong>${t.name} ${t.mascot}</strong></div>
    <div style="font-size:12px;color:var(--mu);margin-bottom:20px;">from ${divs[dIdx].name} [${_tbCls}] · This cannot be undone.</div>
    <div style="display:flex;gap:10px;justify-content:center;">
      <button class="btn" style="background:var(--rd);min-width:100px;" onclick="tbConfirmDelete(${dIdx},${tIdx})">Yes, Remove</button>
      <button class="bgh" style="min-width:100px;" onclick="tbTab('browse')">Cancel</button>
    </div>
  </div>`;
  ['browse','add','export'].forEach(t2=>{
    const btn=document.getElementById('tb-tab-'+t2);
    if(btn)btn.classList.toggle('on',t2==='browse');
  });
}
function tbConfirmDelete(dIdx,tIdx){
  const divs=tbGetDivs(_tbCls);
  const t=divs[dIdx]?.teams[tIdx];if(!t)return;
  const name=`${t.name} ${t.mascot}`;
  divs[dIdx].teams.splice(tIdx,1);tbRecord(t,'del');
  const curGameCls=document.getElementById('s-cls').value;
  const gameDivs=_allClsDivs?.[curGameCls]||_setupDivs;
  const dsel=document.getElementById('s-div');
  if(dsel)dsel.innerHTML=gameDivs.map((d,i)=>`<option value="${i}">${d.name}</option>`).join('');
  onDiv();
  tbTab('browse');
}

function tbAddToDiv(dIdx){
  tbTab('add');
  // Pre-select division
  setTimeout(()=>{
    const sel=document.getElementById('tb-add-div');
    if(sel){sel.value=String(dIdx);tbPreviewLogo('add');}
  },50);
}

// ── EXPORT / IMPORT TAB ──
function tbRenderExport(){
  if(!_allClsDivs)initAllClsDivs();
  const allTeamsCount=Object.values(_allClsDivs).reduce((s,divs)=>s+divs.reduce((ss,d)=>ss+d.teams.length,0),0);
  const curCls=document.getElementById('s-cls')?.value||'3A';
  const clsSummary=ST_ORDER.slice(0,12).map(st=>{const cl=clsOfSt(st),tc=cl.reduce((s,c)=>s+(_allClsDivs[c]||[]).reduce((ss,d)=>ss+d.teams.length,0),0);
    return`<div class="dr"><span class="a">${stName(st)}${cl.includes(curCls)?' ★':''}</span><span style="font-weight:700">${tc} teams · ${cl.length} classification${cl.length===1?'':'s'}</span></div>`;
  }).join('')+(ST_ORDER.length>12?`<div class="dr"><span class="a">And ${ST_ORDER.length-12} more state${ST_ORDER.length-12===1?'':'s'}</span><span></span></div>`:'');
  return`<div style="max-width:560px;">
    <div style="font-family:var(--hd);font-size:14px;font-weight:800;color:var(--te);margin-bottom:6px;">Export Team Pack</div>
    <p style="font-size:12px;color:var(--mu);margin-bottom:14px;">
      Save every school in this world (each state, classification, division name and logo) as a <strong>.json</strong> file. ★ marks the state you play in.
    </p>
    <div style="background:var(--s2);border:1px solid var(--bd);border-radius:6px;padding:12px 16px;margin-bottom:14px;">
      ${clsSummary}
      <div class="dr"><span class="a">Total Teams</span><span style="font-weight:700;color:var(--gn)">${allTeamsCount}</span></div>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;">
      <button class="btn bgn" onclick="tbExportPack()" style="flex:1;min-width:140px;">Export all schools</button>
      <button class="btn bbl" onclick="tbExportCSV()" style="flex:1;min-width:140px;">Export CSV (current class)</button>
    </div>
    <div style="border-top:1px solid var(--bd);padding-top:16px;">
      <div style="font-family:var(--hd);font-size:14px;font-weight:800;color:var(--te);margin-bottom:6px;">Import Team Pack</div>
      <p style="font-size:12px;color:var(--mu);margin-bottom:10px;">
        Schools load into the same state they were built in, and the other states stay as they are. That means you can stack packs: load a Michigan pack, then an Indiana pack, and play with both. Pick those states in League Setup first.
      </p>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <button class="btn" onclick="tbImportFromTab()" style="flex:1;min-width:140px;">Load Team Pack (.json)</button>
        <span style="font-size:11px;color:var(--mu);">To take the teams out of a career, use <b>Export teams</b> on that save in Load Game, then load the file here.</span>
      </div>
    </div>
  </div>`;
}

function tbExportPack(){
  if(!_allClsDivs)initAllClsDivs();
  const T=t=>{const o={name:t.name,mascot:t.mascot,city:t.city,abbr:t.abbr,c1:t.c1,c2:t.c2,prestige:t.prestige,tier:t.tier||'avg',offS:t.offS,defS:t.defS};for(const k of['c3','logoKey','mash','customLogo','uni'])if(t[k])o[k]=t[k];return o;};
  const L={},ports={};for(const[c,dv]of Object.entries(_allClsDivs)){if(!dv||c==='INTL'||c==='OOS')continue;L[c]={divisions:dv.map(d=>({name:d.name,teams:d.teams.filter(t=>t&&!t.intl).map(T)}))};const p=clsPort(c);if(p)ports[c]=p;}
  const pack={type:'gridiron_team_pack',v:3,app:'Gridiron 27',cls:document.getElementById('s-cls')?.value||'3A',exportDate:new Date().toISOString().slice(0,10),allClassifications:L,
    geo:USA.on?{mode:'usa',home:USA.home}:{mode:'classic'},ports:USA.on?ports:undefined};
  _fileSave(`gridiron_teams_all_${pack.exportDate}.json`,JSON.stringify(pack));
  const n=Object.values(L).reduce((s,c)=>s+c.divisions.reduce((ss,d)=>ss+d.teams.length,0),0);
  tbStatus(`Exported ${n} teams from ${USA.on?ST_ORDER.length+' state'+(ST_ORDER.length===1?'':'s'):'every classification'}.`);
}
function tbExportCSV(){
  if(!_allClsDivs)initAllClsDivs();
  const cls=_tbCls||document.getElementById('s-cls')?.value||'3A';
  const divs=tbGetDivs(cls);
  const rows=[['Division','School','Mascot','City','Primary Color','Secondary Color','Prestige','Offense','Defense','Tier']];
  for(const div of divs){
    for(const t of div.teams){
      rows.push([div.name,t.name,t.mascot,t.city,t.c1,t.c2,t.prestige||1,t.offS,t.defS,t.tier||'avg']);
    }
  }
  const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  _fileSave(`gridiron_teams_${cls}.csv`,csv);
  tbStatus(`✓ CSV exported (${cls})`);
}

function tbImportV3(pack){if(!_allClsDivs)initAllClsDivs();const d=tbDraft();let ed=0,ad=0,dl=0,same=0;const miss=[],used=new Set();
  const AC=pack.allClassifications||{},usa=pack.geo&&pack.geo.mode==='usa',ports=usa?(pack.ports&&typeof pack.ports==='object'?pack.ports:packPorts(Object.keys(AC),String(pack.geo.home||''))):null;
  const target=c=>{if(ports&&USA.on){const p=ports[c];return p?clsFromPort(p):null;}return c;};
  const missName=c=>{const p=ports&&ports[c];return p?((USA.X&&USA.X.st&&USA.X.st[p[0]]&&USA.X.st[p[0]].name)||p[0]):clsName(c);};
  const F=(t,c,di)=>{const f={name:wsClean(t.name),mascot:wsClean(t.mascot),city:wsClean(t.city),abbr:String(t.abbr||'').toUpperCase().replace(/[^A-Z]/g,'').slice(0,3),c1:t.c1,c2:t.c2,prestige:clamp(Math.round(+t.prestige)||3,1,5),customLogo:t.customLogo||null,to:c+'|'+di};
    for(const k of['c3','logoKey','mash','offS','defS'])if(t[k])f[k]=t[k];for(const k of['logoKey','mash'])if(f[k]&&!(typeof _LGO!=='undefined'&&_LGO[f[k]]))delete f[k];if(f.offS&&!OFF_SCH.includes(f.offS))delete f.offS;if(f.defS&&!DEF_SCH.includes(f.defS))delete f.defS;{const u=uniClean(t.uni);if(u)f.uni=u;}return f;};
  for(const[c0,cd]of Object.entries(AC)){const c=target(c0),D=c&&_allClsDivs[c];if(!D||used.has(c)){const m=missName(c0);if(!miss.includes(m))miss.push(m);continue;}used.add(c);
    (cd.divisions||[]).forEach((dv,d0)=>{const over=d0>=D.length,di=over?D.length-1:d0,T=D[di];if(!T)return;if(dv.name&&!over)T.name=wsClean(dv.name)||T.name;const cur=over?[]:T.teams.slice(),tl=(dv.teams||[]).filter(t=>t&&t.name);
      tl.forEach((t,ti)=>{const f=F(t,c,di);const x=cur[ti];if(x&&['name','mascot','city','c1','c2'].every(k=>(x[k]||'')===(f[k]||''))&&!f.customLogo&&!f.logoKey&&!f.mash&&!f.c3&&!f.uni){same++;return;}if(x){const ok=tbOk(x);Object.assign(x,{name:f.name,mascot:f.mascot,city:f.city,abbr:f.abbr||x.abbr,c1:f.c1||x.c1,c2:f.c2||x.c2,prestige:f.prestige,customLogo:f.customLogo});for(const k of['c3','logoKey','mash','offS','defS'])if(f[k])x[k]=f[k];if(f.uni)x.uni=uniClean(f.uni);else delete x.uni;
          const a=d.add.find(z=>z.ok===ok);if(a)Object.assign(a,f);else d.ed[ok]=f;ed++;}
        else{const ok='add|'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);d.add.push(Object.assign({ok},f));T.teams.push({id:_sId++,_ok:ok,name:f.name,mascot:f.mascot,city:f.city,cls:c,dIdx:di,abbr:f.abbr,c1:f.c1,c2:f.c2,prestige:f.prestige,wins:0,losses:0,isP:false,offS:f.offS||pick(OFF_SCH),defS:f.defS||pick(DEF_SCH),fac:{weight:1,film:1,train:1,med:1},staff:genStaff(false),trophies:[],tier:'avg',trainLevel:1,customLogo:f.customLogo,logoKey:f.logoKey,mash:f.mash,c3:f.c3,uni:uniClean(f.uni)});ad++;}});
      for(let ti=tl.length;ti<cur.length;ti++){const x=cur[ti],ok=tbOk(x);const i=T.teams.indexOf(x);if(i>=0)T.teams.splice(i,1);const ai=d.add.findIndex(z=>z.ok===ok);if(ai>=0)d.add.splice(ai,1);else{delete d.ed[ok];if(!d.del.includes(ok))d.del.push(ok);}dl++;}});}
  tbDraftPut(d);let col='';
  if(pack.colleges||pack.colMeta||pack.pro){try{const W=Object.assign({},worldLoad());if(pack.colleges)W.colleges=pack.colleges;if(pack.colMeta)W.colMeta=pack.colMeta;if(pack.pro)W.pro=pack.pro;const S=worldSanitize(W);W.colleges=S.colleges;W.colMeta=S.colMeta;W.pro=S.pro;worldStore(W);worldApply(W);col=' Colleges and pro teams are in your League Setup too.';}catch(e){console.error('college import',e);}}
  try{const dsel=document.getElementById('s-div');if(dsel&&_setupDivs)onDiv();}catch(e){}
  tbStatus(`✓ ${ed} teams updated${same?` (${same} already matched)`:''}${ad?`, ${ad} added`:''}${dl?`, ${dl} removed`:''}.${miss.length?` Not in this world: ${miss.slice(0,6).join(', ')}${miss.length>6?' and more':''} (add those states in League Setup, then load the file again).`:''}${col} Your next career uses them.`);
  try{tbTab('browse');}catch(e){}}
function tbImportFromTab(){
  const inp=document.createElement('input');inp.type='file';inp.accept='.json';
  inp.onchange=function(e){
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=function(ev){
      try{
        const pack=JSON.parse(ev.target.result);
        tbApplyImport(pack);
      }catch(err){tbStatus('Invalid file: '+err.message,'var(--rd)');}
    };reader.readAsText(file);
  };inp.click();
}

function tbApplyImport(pack){
  try{saveScrub(pack);}catch(e){} // a pack can come from anyone: names, colors and logos are made safe first
  if(!pack||pack.type!=='gridiron_team_pack'){
    tbStatus('Not a valid team pack file.','var(--rd)');return;
  }
  if(pack.v>=3){tbImportV3(pack);return;}
  // V2 pack: has allClassifications with all 5 classes
  if(pack.v>=2&&pack.allClassifications){
    if(!_allClsDivs)initAllClsDivs();
    _sId=1;
    for(const cls of ['1A','2A','3A','4A','5A']){
      const clsData=pack.allClassifications[cls];
      if(!clsData||!clsData.divisions)continue;
      _allClsDivs[cls]=clsData.divisions.map((div,dIdx)=>({
        name:div.name||`League ${dIdx+1}`,
        teams:div.teams.map(t=>{
          const abbr=t.abbr||(t.name.replace(/High|School|Academy|Prep/g,'').trim().split(/\s+/).map(w=>w[0]).join('').toUpperCase().slice(0,2)||'HS');
          return{id:_sId++,name:t.name,mascot:t.mascot,city:t.city,cls,dIdx,abbr,c1:t.c1||'#333',c2:t.c2||'#fff',prestige:t.prestige||1,tier:t.tier||'avg',wins:0,losses:0,isP:false,offS:t.offS||pick(OFF_SCH),defS:t.defS||pick(DEF_SCH),fac:{weight:1,film:1,train:1,med:1},staff:genStaff(false),trophies:[],trainLevel:1,customLogo:t.customLogo||null};
        })
      }));
    }
    // Sync game class _setupDivs
    const curCls=pack.cls||document.getElementById('s-cls')?.value||'3A';
    const clsSel=document.getElementById('s-cls');
    if(clsSel&&pack.cls)clsSel.value=pack.cls;
    _setupDivs=_allClsDivs[curCls];
    const dsel=document.getElementById('s-div');
    if(dsel)dsel.innerHTML=_setupDivs.map((d,i)=>`<option value="${i}">${d.name}</option>`).join('');
    onDiv();
    const total=Object.values(_allClsDivs).reduce((s,divs)=>s+divs.reduce((ss,d)=>ss+d.teams.length,0),0);
    tbStatus(`✓ Imported ${total} teams across all classifications`);
    tbTab('browse');
    return;
  }
  // V1 pack: single classification
  if(!pack.divisions){tbStatus('Not a valid team pack file.','var(--rd)');return;}
  const importCls=pack.cls||document.getElementById('s-cls')?.value||'3A';
  const clsSel=document.getElementById('s-cls');
  if(clsSel&&pack.cls)clsSel.value=pack.cls;
  if(!_allClsDivs)initAllClsDivs();
  _sId=1;
  const importedDivs=pack.divisions.map((div,dIdx)=>({
    name:div.name||`League ${dIdx+1}`,
    teams:div.teams.map(t=>{
      const abbr=t.abbr||(t.name.replace(/High|School|Academy|Prep/g,'').trim().split(/\s+/).map(w=>w[0]).join('').toUpperCase().slice(0,2)||'HS');
      return{id:_sId++,name:t.name,mascot:t.mascot,city:t.city,cls:importCls,dIdx,abbr,c1:t.c1||'#333',c2:t.c2||'#fff',prestige:t.prestige||1,tier:t.tier||'avg',wins:0,losses:0,isP:false,offS:t.offS||pick(OFF_SCH),defS:t.defS||pick(DEF_SCH),fac:{weight:1,film:1,train:1,med:1},staff:genStaff(false),trophies:[],trainLevel:1,customLogo:t.customLogo||null};
    })
  }));
  _allClsDivs[importCls]=importedDivs;
  _setupDivs=importedDivs;
  _tbCls=importCls;
  const dsel=document.getElementById('s-div');
  if(dsel)dsel.innerHTML=_setupDivs.map((d,i)=>`<option value="${i}">${d.name}</option>`).join('');
  onDiv();
  const total=_setupDivs.reduce((s,d)=>s+d.teams.length,0);
  tbStatus(`✓ Imported ${total} teams across ${_setupDivs.length} divisions [${importCls}]`);
  tbTab('browse');
}

// Global import entry point (called from setup screen button)

