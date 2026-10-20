// ═══════════ v2.14 LEAGUE SETUP: rename states and counties, edit colleges, pro teams, divisions, star counts and class sizes ═══════════
// The edits live on this device (and are copied into every career you start, so a save always keeps its own world).
const WORLD_KEY='gpgm_world';let _worldOrig=null,WORLD={};
function worldOrig(){
  if(_worldOrig)return _worldOrig;
  const st={CF:CF_NAME};for(const k in XST)st[k]=XST[k].name;const cn={};for(const c of MAPC)cn[c.key||c.id]=c.name;
  const sz={};for(const c of CLS_ORDER)sz[c]={t:CLS_SZ[c].t,d:CLS_SZ[c].d};for(const c in XCLS)sz[c]={t:XCLS[c].t,d:XCLS[c].d};
  const cp=o=>JSON.parse(JSON.stringify(o));
  return _worldOrig={states:st,counties:cn,colleges:{FBS:D1FBS.slice(),FCS:D1FCS.slice(),D2:D2.slice(),D3:D3.slice(),NAIA:NAIA.slice(),JUCO:JUCO.slice()},
    pro:{NGL:AI_NGL.slice(),SFL:AI_SFL.slice(),MGL:AI_MGL.slice()},divs:cp(DIV_NAMES),xdivs:cp(XDIV_NAMES),size:sz,stars:Object.assign({},NAT_STARS),colRng:cp(COL_CLS_RNG),hsQ:cp(COL_HS_Q)};
}
function worldLoad(){try{return JSON.parse(localStorage.getItem(WORLD_KEY)||'null')||{};}catch(e){return{};}}
function worldStore(W){try{localStorage.setItem(WORLD_KEY,JSON.stringify(W||{}));}catch(e){notify('Could not save League Setup on this device','e');}}
const _setArr=(a,b)=>{a.length=0;for(const x of b)a.push(x);};
function worldApply(W,fromSave){
  W=W&&typeof W==='object'?W:{};
  if(fromSave&&W.geo&&W.geo.mode==='usa'&&!W.geo.v)W.geo.v=1;
  try{geoBuild(W.geo?W.geo:(fromSave?null:usaDefault()));}catch(e){console.error('geography',e);}
  const O=worldOrig();WORLD=W;
  if((W.custFor||'classic')!==(USA.on?'usa':'classic')){W=Object.assign({},W);for(const k of['states','counties','divs','xdivs','size'])delete W[k];}
  const S=W.states||{};CF_NAME=S.CF||O.states.CF;for(const k in XST)XST[k].name=S[k]||O.states[k];
  for(const k in MAP_STATES)MAP_STATES[k].name=stName(k);
  const C=W.counties||{};for(const c of MAPC){const k=c.key||c.id;c.name=C[k]||O.counties[k]||c.name;}
  const CL=W.colleges||{},L=(k,a)=>_setArr(a,CL[k]&&CL[k].length>=3?CL[k]:O.colleges[k]);
  L('FBS',D1FBS);L('FCS',D1FCS);L('D2',D2);L('D3',D3);L('NAIA',NAIA);L('JUCO',JUCO);buildColleges();try{aiConfRebuild();}catch(e){}
  const PR=W.pro||{};_setArr(AI_NGL,PR.NGL&&PR.NGL.length>=4?PR.NGL:O.pro.NGL);_setArr(_STORY_DRAFT_TEAMS,AI_NGL);
  _setArr(AI_SFL,PR.SFL&&PR.SFL.length>=2?PR.SFL:O.pro.SFL);_setArr(AI_MGL,PR.MGL&&PR.MGL.length>=2?PR.MGL:O.pro.MGL);
  for(const k in O.divs)_setArr(DIV_NAMES[k],(W.divs&&W.divs[k])||O.divs[k]);
  for(const k in O.xdivs)_setArr(XDIV_NAMES[k],(W.xdivs&&W.xdivs[k])||O.xdivs[k]);
  for(const c in O.size){const z=(W.size&&W.size[c])||O.size[c],T=CLS_SZ[c]||XCLS[c];if(T){T.t=clamp(Math.round(z.t)||O.size[c].t,8,160);T.d=clamp(Math.round(z.d)||O.size[c].d,1,16);T.d=Math.min(T.d,Math.floor(T.t/4));}}
  Object.assign(NAT_STARS,O.stars,W.stars||{});
  const cm=clamp(+W.colMult||1,0.5,2);for(const k in O.colRng)COL_CLS_RNG[k]=O.colRng[k].map(v=>Math.max(4,Math.round(v*cm)));for(const k in O.hsQ)COL_HS_Q[k]=O.hsQ[k].map(v=>Math.max(1,Math.round(v*cm)));
  try{if(typeof G!=='undefined'&&G)G._thr=null;}catch(e){}
}
function worldFrMult(){return clamp(+(WORLD&&WORLD.frMult)||1,0.5,2);}
const WS={tab:'states',st:'CF',lvl:'FBS',draft:null};
function wsClean(t){return String(t||'').replace(/[<>&"'`\\]/g,'').replace(/\s+/g,' ').trim().slice(0,40);}
function wsList(txt,max){const out=[],seen=new Set();for(const l of String(txt||'').split(/\n/)){const n=wsClean(l);if(n&&!seen.has(n.toLowerCase())){seen.add(n.toLowerCase());out.push(n);}if(out.length>=max)break;}return out;}
// League Setup keeps an unsaved draft on this device, so a big setup can be done over several sessions
const WSD_KEY='gpgm_wsdraft';
function wsDraftStore(){try{localStorage.setItem(WSD_KEY,JSON.stringify(WS.draft||{}));return true;}catch(e){notify('Could not keep your League Setup progress on this device (storage is full).','e');return false;}}
function wsDraftDrop(){try{localStorage.removeItem(WSD_KEY);}catch(e){}}
function openWorldSetup(){let d=null;try{d=JSON.parse(localStorage.getItem(WSD_KEY)||'null');}catch(e){}
  WS.draft=d&&typeof d==='object'?d:JSON.parse(JSON.stringify(worldLoad()));wsRender();if(d)setTimeout(()=>notify('Continuing your unsaved League Setup changes.'),60);}
window.wsDiscard=function(){if(!confirm('Throw away the League Setup changes you have not saved yet?'))return;wsDraftDrop();WS.draft=JSON.parse(JSON.stringify(worldLoad()));wsRender();notify('Unsaved changes discarded.');};
function wsCur(){const O=worldOrig(),D=WS.draft;return{O,D};}
function wsTab(t){wsGrab();wsDraftStore();WS.tab=t;wsRender();}
// read the inputs of the tab on screen into the draft
function wsGrab(){
  const D=WS.draft,O=worldOrig(),v=id=>{const e=document.getElementById(id);return e?e.value:null;};
  if(WS.tab==='states'){D.states=D.states||{};for(const k of ST_ORDER){const x=v('ws-st-'+k);if(x!=null){const n=wsClean(x);if(n&&n!==O.states[k])D.states[k]=n;else delete D.states[k];}}
    D.counties=D.counties||{};for(const c of MAPC){if(c.st!==WS.st)continue;const x=v('ws-cn-'+c.id);if(x==null)continue;const n=wsClean(x);const kk=c.key||c.id;if(n&&n!==O.counties[kk])D.counties[kk]=n;else delete D.counties[kk];}}
  if(WS.tab==='divs'){D.size=D.size||{};D.divs=D.divs||{};D.xdivs=D.xdivs||{};
    const cls=clsOfSt(WS.st);for(const c of cls){const t=+v('ws-t-'+c),d=+v('ws-d-'+c);if(t&&d)D.size[c]={t,d};}
    const x=v('ws-dn');if(x!=null){const names=wsList(x,200);if(WS.st==='CF'){let i=0;for(const c of CLS_ORDER){const n=(D.size[c]||O.size[c]).d;D.divs[c]=names.slice(i,i+n);i+=n;}}else D.xdivs[WS.st]=names;}}
  if(WS.tab==='map')meGrab();
  if(WS.tab==='share'){const n=v('ws-mn'),d=v('ws-md');if(n!=null||d!=null)D.meta={name:wsClean(n||''),desc:String(d||'').replace(/[<>&"'`\\]/g,'').slice(0,200)};}
  if(WS.tab==='colleges'){const x=v('ws-col');if(x!=null){D.colleges=D.colleges||{};D.colleges[WS.lvl]=wsList(x,400);}}
  if(WS.tab==='pro'){D.pro=D.pro||{};for(const k of['NGL','SFL','MGL']){const x=v('ws-pro-'+k);if(x!=null)D.pro[k]=wsList(x,64);}}
  if(WS.tab==='stars'){D.stars=D.stars||{};for(const s of[5,4,3,2]){const x=v('ws-s'+s);if(x!=null)D.stars[s]=clamp(Math.round(+x)||0,0,5000);}const f=v('ws-fr'),c=v('ws-cm');if(f!=null)D.frMult=+f;if(c!=null)D.colMult=+c;}
}
function wsRender(){
  const{O,D}=wsCur(),tabs=[['states','States & counties'],['map','Map editor'],['divs','Divisions & sizes'],['colleges','Colleges'],['pro','Pro teams'],['stars','Stars & classes'],['share','File & sharing']];
  const stSel=(fn)=>`<select onchange="wsGrab();WS.st=this.value;wsRender()" style="padding:6px 8px;border-radius:8px">${ST_ORDER.map(k=>`<option value="${k}"${WS.st===k?' selected':''}>${(D.states&&D.states[k])||O.states[k]}</option>`).join('')}</select>`;
  let body='';
  if(WS.tab==='states'){
    body=`<div style="font-size:12px;color:var(--mu);margin-bottom:8px">Rename any state. Pick a state to rename its counties too.</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:6px;margin-bottom:12px">${ST_ORDER.map(k=>`<label style="font-size:11px;color:var(--mu)">${O.states[k]}<input id="ws-st-${k}" value="${(D.states&&D.states[k])||O.states[k]}" maxlength="40" style="width:100%"></label>`).join('')}</div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><b style="font-size:13px">Counties in</b>${stSel()}</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:6px;max-height:34vh;overflow-y:auto">${MAPC.filter(c=>c.st===WS.st).map(c=>`<input id="ws-cn-${c.id}" value="${(D.counties&&D.counties[c.key||c.id])||O.counties[c.key||c.id]}" maxlength="40" title="${O.counties[c.key||c.id]}">`).join('')}</div>`;
  }else if(WS.tab==='divs'){
    const cls=clsOfSt(WS.st),sz=c=>(D.size&&D.size[c])||O.size[c];
    const names=WS.st==='CF'?CLS_ORDER.flatMap(c=>{const a=(D.divs&&D.divs[c])||O.divs[c]||[];const n=sz(c).d;return Array.from({length:n},(_,i)=>a[i]||`${c} Division ${i+1}`);}):(()=>{const a=(D.xdivs&&D.xdivs[WS.st])||O.xdivs[WS.st]||[];const n=cls.reduce((s,c)=>s+sz(c).d,0);return Array.from({length:n},(_,i)=>a[i]||`District ${i+1}`);})();
    body=`<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><b style="font-size:13px">State</b>${stSel()}</div>
      <div style="font-size:12px;color:var(--mu);margin-bottom:6px">Teams and divisions in each classification (more teams make a bigger league; at least 4 teams per division).</div>
      <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px">${cls.map(c=>`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><span style="width:150px;font-size:12px;font-weight:800">${clsName(c)}</span><label style="font-size:12px">Teams <input id="ws-t-${c}" type="number" min="8" max="160" value="${sz(c).t}" style="width:76px"></label><label style="font-size:12px">Divisions <input id="ws-d-${c}" type="number" min="1" max="16" value="${sz(c).d}" style="width:64px"></label></div>`).join('')}</div>
      <div style="font-size:12px;color:var(--mu);margin-bottom:4px">Division names, one per line, in order (smallest classification first). Add lines for new divisions.</div>
      <textarea id="ws-dn" rows="10" style="width:100%;font:13px/1.4 Nunito,system-ui,sans-serif">${names.join('\n')}</textarea>`;
  }else if(WS.tab==='map'){body=meBody();
  }else if(WS.tab==='share'){body=shareBody();
  }else if(WS.tab==='colleges'){
    const lv=[['FBS','FBS'],['FCS','FCS'],['D2','Division II'],['D3','Division III'],['NAIA','NAIA'],['JUCO','Junior college']];
    const list=(D.colleges&&D.colleges[WS.lvl]&&D.colleges[WS.lvl].length?D.colleges[WS.lvl]:O.colleges[WS.lvl]);
    body=`<div class="tabs" style="margin-bottom:8px">${lv.map(([k,l])=>`<button class="tab ${WS.lvl===k?'on':''}" onclick="wsGrab();WS.lvl='${k}';wsRender()">${l}</button>`).join('')}</div>
      <div style="font-size:12px;color:var(--mu);margin-bottom:4px">One college per line, strongest program first. Rename, add or remove lines (at least 3). ${list.length} colleges.</div>
      <textarea id="ws-col" rows="8" style="width:100%;font:13px/1.4 Nunito,system-ui,sans-serif">${list.join('\n')}</textarea>
      ${WS.colEdit?(()=>{window._wsColEdit=true;window._ceK=WS.colEdit;window._wsRendering=true;const I=colInfo(WS.colEdit);const fh=colFormHtml(I,'setup');window._wsRendering=false;return`<div class="pnl" style="margin-top:10px"><div class="ph">Edit ${I.name}</div><div class="pb">${fh}<div style="text-align:right;margin-top:10px;display:flex;gap:8px;justify-content:flex-end"><button class="bgh" onclick="WS.colEdit=null;window._wsColEdit=false;wsRender()">Cancel</button><button class="btn bgn" onclick="wsColSave()">Save college</button></div></div></div>`;})():''}
      <div style="font-size:12px;color:var(--mu);margin:10px 0 4px">Tap a college to change its name, mascot, colors, logo, state and prestige.</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px;max-height:40vh;overflow-y:auto">${(()=>{window._wsRendering=true;const h=list.map(n=>{const k=n+'|'+WS.lvl;return`<button class="bgh" style="display:flex;align-items:center;gap:8px;text-align:left;padding:6px 8px" onclick="wsGrab();WS.colEdit='${k.replace(/'/g,"\\'")}';wsRender()">${colLogo(k,30)}<span style="font-size:12px;line-height:1.2"><b>${n}</b><br><small style="color:var(--mu)">${colInfo(k).mascot}</small></span></button>`;}).join('');window._wsRendering=false;return h;})()}</div>`;
  }else if(WS.tab==='pro'){
    const P=k=>(D.pro&&D.pro[k]&&D.pro[k].length?D.pro[k]:O.pro[k]);
    body=`<div style="font-size:12px;color:var(--mu);margin-bottom:8px">The pro teams your former players can be drafted by or sign with. One team per line, add as many as you like.</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px">${[['NGL','National Gridiron League (draft)'],['SFL','Spring Football League'],['MGL','Maple Gridiron League']].map(([k,l])=>`<label style="font-size:12px;font-weight:800">${l}<textarea id="ws-pro-${k}" rows="12" style="width:100%;font:13px/1.4 Nunito,system-ui,sans-serif">${P(k).join('\n')}</textarea></label>`).join('')}</div>`;
  }else{
    const st=Object.assign({},O.stars,D.stars||{});
    body=`<div style="font-size:12px;color:var(--mu);margin-bottom:8px">How many players nationally earn each star rating per graduating class (the full 13-state country). Smaller countries scale these down.</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-bottom:14px">${[5,4,3,2].map(s=>`<label style="font-size:12px;font-weight:800">${'★'.repeat(s)} players<input id="ws-s${s}" type="number" min="0" max="5000" value="${st[s]}" style="width:100%"></label>`).join('')}</div>
      <div style="display:flex;gap:14px;flex-wrap:wrap">
        <label style="font-size:12px;font-weight:800">Your freshman class size<select id="ws-fr" style="display:block;padding:6px 8px;border-radius:8px">${[[0.5,'Half'],[0.75,'Smaller'],[1,'Normal'],[1.25,'Bigger'],[1.5,'Much bigger'],[2,'Double']].map(([v,l])=>`<option value="${v}"${(+D.frMult||1)===v?' selected':''}>${l}</option>`).join('')}</select></label>
        <label style="font-size:12px;font-weight:800">College recruiting class sizes<select id="ws-cm" style="display:block;padding:6px 8px;border-radius:8px">${[[0.5,'Half'],[0.75,'Smaller'],[1,'Normal'],[1.25,'Bigger'],[1.5,'Much bigger'],[2,'Double']].map(([v,l])=>`<option value="${v}"${(+D.colMult||1)===v?' selected':''}>${l}</option>`).join('')}</select></label></div>`;
  }
  openMo(`<div style="font-weight:900;font-size:22px;margin-bottom:2px">League Setup</div>
    <div style="font-size:12px;color:var(--mu);margin-bottom:10px">Customize the world before you start a career. Changes apply to new careers (each save keeps the world it started with).</div>
    <div class="tabs" style="margin-bottom:10px">${tabs.map(([k,l])=>`<button class="tab ${WS.tab===k?'on':''}" onclick="wsTab('${k}')">${l}</button>`).join('')}</div>
    <div>${body}</div>
    <div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin-top:14px">
      <button class="bgh" onclick="if(confirm('Reset every League Setup change back to the default world?')){WS.draft={};wsSave();}">Reset all</button>
      <button class="bgh" onclick="wsDiscard()">Discard changes</button><button class="bgh" onclick="wsGrab();if(wsDraftStore())notify('Progress saved. Close and continue any time: it is used for new careers once you press Save League Setup.');">Save progress</button><button class="bgh" onclick="wsGrab();wsDraftStore();clo()">Close</button><button class="btn bgn" onclick="wsGrab();wsSave()">Save League Setup</button></div>`);
}
window.wsColSave=function(){wsGrab();window._wsColEdit=true;const k=colEditApply();window._wsColEdit=false;if(!k)return;WS.colEdit=null;wsDraftStore();wsRender();notify('College saved in your League Setup draft');};
function wsSave(){
  window._wsColEdit=false;WS.colEdit=null;const D=WS.draft||{};D.custFor=USA.on?'usa':'classic';
  // new custom states join the world right away
  if(D.geo&&D.geo.mode!=='classic'&&Array.isArray(D.geo.custom)){D.geo.mode='usa';D.geo.states=Array.isArray(D.geo.states)?D.geo.states:Object.keys(USST);for(const c of D.geo.custom)if(c.counties&&c.counties.length&&!D.geo.states.includes(c.ab))D.geo.states.push(c.ab);}worldStore(D);worldApply(D);
  wsDraftDrop();
  try{_allClsDivs=null;_usedSchoolNames.clear();Object.keys(_citySchoolCount).forEach(k=>delete _citySchoolCount[k]);initCountyMap();}catch(e){console.error('league setup',e);}
  clo();notify('League Setup saved. New careers use it.');
}

// Initialise the county map + offers on load
function initCountyMap(){
  try{worldApply(worldLoad());}catch(e){console.error('league setup',e);}
  USA.cur={};_abbrUsed=new Set();
  // Reset state
  _sId=1;
  _selectedOfferTeam=null;
  _selectedCounty=null;
  _selectedRivals=new Set();
  _offerPopupIdx=0;
  _offerPopupOffers=[];
  // Init _setupDivs for current class (default 3A) if not set
  const curCls=document.getElementById('s-cls').value||'3A';

  // If _allClsDivs already has data (from Team Builder), use it, otherwise generate fresh
  if(!_allClsDivs){
    _allClsDivs={};
    for(const cls of ['1A','2A','3A','4A','5A']){
      _sId=1; // reset ID counter per class to avoid global ID explosion
      _allClsDivs[cls]=makeDivisions(cls);
    }
    _sId=1;
    // Assign unique team IDs across all classes (deduplicate)
    for(const c of XCLS_ORDER)_allClsDivs[c]=makeStateDivisions(c);
    let uid=1;
    for(const cls of [...CLS_ORDER,...XCLS_ORDER]){
      for(const div of _allClsDivs[cls])for(const t of div.teams){t.id=uid++;t.cls=cls;}
    }
    _sId=uid;
  }else{for(const c of XCLS_ORDER)if(!_allClsDivs[c]){_allClsDivs[c]=makeStateDivisions(c);for(const div of _allClsDivs[c])for(const t of div.teams)t.cls=c;}}

  try{tbApplyDraft();}catch(e){console.error('team builder draft',e);}
  // Use current class setup divs
  _setupDivs=_allClsDivs[curCls];
  document.getElementById('s-div').innerHTML=_setupDivs.map((d,i)=>`<option value="${i}">${d.name}</option>`).join('');
  // Assign teams to counties and generate offers
  // every school's abbreviation is unique within its state
  {const U={};for(const [c,dv] of Object.entries(_allClsDivs))for(const d of dv)for(const t of d.teams){const st=clsSt(c),u=U[st]||(U[st]=new Set());if(!t.abbr||t.abbr.length!==3||u.has(t.abbr))t.abbr=abbr3(t.name,u);else u.add(t.abbr);}}
  assignTeamsToCounties(_allClsDivs);
  _mapOffers=generateStartingOffers(_allClsDivs);
  _mapSt=null;_mapVB=null;renderCountyMap();
  renderOfferList();
  try{usaSetupInfo();}catch(e){}
}


