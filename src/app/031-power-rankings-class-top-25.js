// ═══════════ POWER RANKINGS (class Top 25 + All-State Top 25) ═══════════
let _RK=null;
function rkKey(all){let g=0;for(const s of all)g+=(s.wins||0)+(s.losses||0);return G.yr+'|'+g+'|'+all.length;}
// the school list is rebuilt once per task (a page render asks for hundreds of badges), the key still checks every result
let _rkAll=null;
function rkAll(){if(_rkAll&&_rkAll.G===G)return _rkAll.a;const a=allSchoolsAll().filter(s=>isUSSchool(s));_rkAll={G,a};setTimeout(()=>{_rkAll=null;},0);return a;}
function rkCompute(){
  if(typeof G==='undefined'||!G||!G.divisions)return null;
  const all=rkAll(),key=rkKey(all);
  if(_RK&&_RK.key===key&&_RK.G===G)return _RK;
  if(_RK&&_RK.G===G&&_RK.key!==key)G.rkPrev={c:_RK.cMap,a:_RK.aMap,n:_RK.nMap,yr:_RK.yr};
  if(G.rkPrev&&G.rkPrev.yr!==G.yr)G.rkPrev=null;
  // Resume-style model (like the prep polls): results and schedule strength drive it, talent matters most early,
  // and classification only nudges cross-class comparisons instead of deciding them.
  const rows=all.map(s=>{const g=(s.wins||0)+(s.losses||0);return{s,id:s.id,st:stOf(s),ov:teamOvr(s.id),g,w:s.wins||0,l:s.losses||0,wpa:((s.wins||0)+2)/(g+4),pr:s.prestige||1};});
  const byC={};rows.forEach(r=>{(byC[r.s.cls]=byC[r.s.cls]||[]).push(r);});
  for(const c in byC){const a=byC[c],m=a.reduce((x,r)=>x+r.ov,0)/a.length,sd=Math.sqrt(a.reduce((x,r)=>x+(r.ov-m)**2,0)/a.length)||1;a.forEach(r=>{r.z=(r.ov-m)/sd;});}
  // national talent is measured on one scale for every state (a Wakota Class A team is not a Crestfield 5A team)
  {const m=rows.reduce((x,r)=>x+r.ov,0)/(rows.length||1),sd=Math.sqrt(rows.reduce((x,r)=>x+(r.ov-m)**2,0)/(rows.length||1))||1;rows.forEach(r=>{r.zn=(r.ov-m)/sd;});}
  const divs=[...(G.divisions||[]),...(G.allLeagues?Object.values(G.allLeagues).flatMap(l=>l.divisions||[]):[])],dOf={},dnOf={},zOf={},znOf={};rows.forEach(r=>{zOf[r.id]=r.z;znOf[r.id]=r.zn;});
  divs.forEach(d=>{const t=d.teams||[],sum=t.reduce((x,s)=>x+(zOf[s.id]||0),0),sn=t.reduce((x,s)=>x+(znOf[s.id]||0),0);t.forEach(s=>{dOf[s.id]=t.length>1?(sum-(zOf[s.id]||0))/(t.length-1):0;dnOf[s.id]=t.length>1?(sn-(znOf[s.id]||0))/(t.length-1):0;});});
  const CF={'1A':-.2,'2A':-.1,'3A':0,'4A':.1,'5A':.2};
  const natC=G.natl&&G.natl.yr===G.yr&&G.natl.done?G.natl.w:null;
  // national poll like the real prep rankings: the biggest classifications in the strongest states fill it, a small-school
  // record counts for less on the national stage, and a tough schedule counts for more
  const CN={5:.45,4:.15,3:-.3,2:-.85,1:-1.4},RW={5:1,4:.9,3:.7,2:.5,1:.4},stTop={};
  for(const k of ST_ORDER){const a=rows.filter(r=>r.st===k).map(r=>r.zn).sort((x,y)=>y-x).slice(0,10);if(a.length)stTop[k]=a.reduce((x,v)=>x+v,0)/a.length;}
  const stV=Object.values(stTop),stAvg=stV.length?stV.reduce((x,v)=>x+v,0)/stV.length:0;
  rows.forEach(r=>{const pg=Math.min(1,r.g/8),tw=.75-.45*pg,rw=.55*pg,rec=(r.wpa-.5)*4,sos=(dOf[r.id]||0),
    qual=r.g>=5&&r.l===0?.35:r.g>=6&&r.l===1?.12:0,pres=.05*(r.pr-3),cn=clsNum(r.s.cls),cw=RW[cn]||.7;
    r.sos=sos;r.sc=tw*r.z+rw*rec+.3*pg*sos+qual+pres;r.as=r.sc+(CF[clsEq(r.s.cls)]||0);
    r.ns=tw*r.zn+rw*rec*cw+.45*pg*(dnOf[r.id]||0)+qual*cw+pres+(CN[cn]||0)+.25*clamp((stTop[r.st]||stAvg)-stAvg,-1.5,1.5)+(r.id===natC?5:0);});
  const cMap={},aMap={},nMap={},cls={},st={};
  for(const c in byC){const a=byC[c].slice().sort((x,y)=>y.sc-x.sc||y.ov-x.ov);a.forEach((r,i)=>{cMap[r.id]=i+1;});cls[c]=a;}
  for(const k of ST_ORDER){const a=rows.filter(r=>r.st===k).sort((x,y)=>y.as-x.as||y.ov-x.ov);a.forEach((r,i)=>{aMap[r.id]=i+1;});st[k]=a;}
  const nat=rows.slice().sort((x,y)=>y.ns-x.ns||y.ov-x.ov);nat.forEach((r,i)=>{nMap[r.id]=i+1;});
  const wk=G.week||0;
  _RK={key,G,yr:G.yr,wk,cMap,aMap,nMap,cls,st,as:st.CF||[],nat,rows};
  _rkNames=null;return _RK;
}
function rkOf(id){const R=rkCompute();if(!R)return{c:0,a:0,n:0};return{c:R.cMap[id]||0,a:R.aMap[id]||0,n:R.nMap[id]||0};}
// badge modes: n = national (blue), a = the team's state (gold), c = its classification in the state (red, top 10); tap to cycle
function rkMode(el,m){const c=+el.dataset.c,a=+el.dataset.a,n=+el.dataset.n,cl=el.dataset.cls,stn=el.dataset.st;el.dataset.m=m;
  if(m==='n'){el.className='rkb rk-n';el.textContent='#'+n;el.title=`National #${n} (tap for more ranks)`;}
  else if(m==='a'){el.className='rkb rk-a';el.textContent='#'+a;el.title=`All-${stn} #${a} (tap for more ranks)`;}
  else{el.className='rkb rk-c';el.textContent='#'+c;el.title=`${cl} #${c} (tap for more ranks)`;}}
function rkBadge(id){
  const k=rkOf(id),modes=[];if(k.n&&k.n<=25)modes.push('n');if(k.a&&k.a<=25)modes.push('a');if(k.c&&k.c<=10)modes.push('c');if(!modes.length)return null;
  const s=getS(id)||{};const b=document.createElement('span');b.dataset.c=k.c;b.dataset.a=k.a;b.dataset.n=k.n;b.dataset.cls=s.cls?clsName(s.cls):'';b.dataset.st=stName(stOf(s));b.dataset.ms=modes.join('');b.setAttribute('role','button');b.tabIndex=0;
  rkMode(b,modes[0]);
  const flip=e=>{e.stopPropagation();e.preventDefault();const ms=b.dataset.ms.split('');rkMode(b,ms[(ms.indexOf(b.dataset.m)+1)%ms.length]);};
  b.addEventListener('click',flip);b.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')flip(e);});
  return b;}
let _rkNames=null;
// rebuilt once per task, so a team renamed anywhere (its page, Team Builder, Customize) keeps its rank badge
function rkNames(){
  if(_rkNames&&_rkNames.G===G)return _rkNames;const full={},nm={},dup={};setTimeout(()=>{_rkNames=null;},0);
  for(const s of allSchoolsAll()){full[`${s.name} ${s.mascot}`]=s.id;if(nm[s.name]!==undefined)dup[s.name]=1;nm[s.name]=s.id;}
  for(const d in dup)delete nm[d];_rkNames={G,full,nm};return _rkNames;
}
function rkDecorate(n){
  if(typeof G==='undefined'||!G||!G.divisions||!document.getElementById('app')||document.getElementById('app').classList.contains('hid'))return;
  const t=n.nodeValue;if(!t||t.length<5||t.length>80)return;const p=n.parentNode;if(!p||p.nodeType!==1)return;
  if(/^(SCRIPT|STYLE|TEXTAREA|OPTION|TITLE|INPUT)$/i.test(p.nodeName)||p.namespaceURI==='http://www.w3.org/2000/svg')return;
  if(p.closest&&p.closest('[data-norank]'))return;
  const prev=n.previousSibling;if(prev&&prev.nodeType===1&&prev.classList&&prev.classList.contains('rkb'))return;
  const N=rkNames();let s=t.trim(),pre='';const m=s.match(/^(vs\.?|@|at)\s+/i);if(m){pre=m[0];s=s.slice(pre.length);}
  const id=N.full[s]!==undefined?N.full[s]:N.nm[s];if(id===undefined)return;
  const b=rkBadge(id);if(!b)return;
  let target=n;const lead=t.indexOf(s);if(lead>0)target=n.splitText(lead);
  target.parentNode.insertBefore(b,target);
}
window._rkCls=null;
window.rkView=function(v){window._rkCls=v;nav('rank');};
function pgRank(){
  const R=rkCompute();if(!R)return'';const myK=stOf(myS()||{}),defV=myK&&myK!=='CF'?'ST:'+myK:'ALL';
  let v=window._rkCls||defV;if(v!=='NAT'&&v!=='ALL'&&!v.startsWith('ST:')&&!R.cls[v])v=defV;
  const stK=v==='NAT'?null:v==='ALL'?'CF':v.startsWith('ST:')?v.slice(3):clsSt(v);
  const kind=v==='NAT'?'n':(v==='ALL'||v.startsWith('ST:'))?'a':'c';
  const list=kind==='n'?R.nat:kind==='a'?(R.st[stK]||[]):(R.cls[v]||[]);
  const prev=G.rkPrev?(kind==='n'?G.rkPrev.n:kind==='a'?G.rkPrev.a:G.rkPrev.c):null;
  const btn=(x,l)=>`<button class="bgh bsm" style="margin:0 6px 6px 0;${v===x?'background:var(--ac);border-color:var(--ac);color:var(--tOn,#fff)':''}" onclick="rkView('${x}')">${l}</button>`;
  const mv=(id,i)=>{if(!prev||!prev[id])return'<span style="color:var(--mu)">–</span>';const d=prev[id]-(i+1);return d>0?`<span style="color:var(--gn)">▲${d}</span>`:d<0?`<span style="color:var(--rd)">▼${-d}</span>`:'<span style="color:var(--mu)">–</span>';};
  const pts=r=>kind==='n'?r.ns:kind==='a'?r.as:r.sc;
  const row=(r,i)=>{const me=r.id===G.myId;return`<tr style="${me?'background:rgba(61,123,240,.12)':''}"><td style="font-family:'Roboto Slab',Georgia,serif;font-weight:800;font-size:15px;width:42px">${i+1}</td><td style="width:44px;font-size:11px">${mv(r.id,i)}</td>
    <td><div style="display:flex;align-items:center;gap:10px;cursor:pointer" onclick="viewSchool(${r.id})">${sLogo(r.s,34)}<div><div style="font-weight:700">${r.s.name} ${r.s.mascot}${me?' <span style="font-size:10px;color:var(--te)">(you)</span>':''}${G.natl&&G.natl.done&&G.natl.yr===G.yr&&G.natl.w===r.id?' <span style="font-size:10px;color:var(--gd);font-weight:800">National champion</span>':''}</div><div style="font-size:11px;color:var(--mu)">${clsName(r.s.cls)}${kind!=='n'?' · National #'+R.nMap[r.id]:' · All-'+stName(r.st)+' #'+R.aMap[r.id]}</div></div></div></td>
    <td style="font-weight:700">${r.w}-${r.l}</td><td>${rb(Math.round(r.ov))}</td><td style="color:var(--gd)">${'★'.repeat(Math.max(1,Math.round(r.pr)))}</td><td style="color:var(--mu)">${Math.max(0,Math.round((pts(r)+3)*100))}</td></tr>`;};
  const top=list.slice(0,25).map(row).join(''),others=list.slice(25,30).map(r=>`${r.s.name} ${r.s.mascot} (${r.w}-${r.l})`).join(', ');
  const title=kind==='n'?`National Top 25 · all ${ST_ORDER.length} states`:kind==='a'?`All-${stName(stK)} Top 25, every classification`:clsName(v)+' Top 25';
  const clsBtns=kind==='n'?'':`<span style="font-size:12px;color:var(--mu);margin-right:6px">${stName(stK)} by class:</span>`+clsOfSt(stK).filter(c=>R.cls[c]&&R.cls[c].length).map(c=>btn(c,clsL(c))).join('');
  const nl=G.natl&&G.natl.yr===G.yr?G.natl:null,nA=nl?getS(nl.a):null,nB=nl?getS(nl.b):null;
  const natBox=kind==='n'&&nA&&nB?`<div style="background:var(--s2);border:1px solid var(--gd);border-radius:8px;padding:10px 12px;margin:4px 0 12px;display:flex;align-items:center;gap:10px;flex-wrap:wrap"><b style="color:var(--gd)">National Championship</b> ${sLogo(nA,28)} ${nA.name} ${nA.mascot} <span style="color:var(--mu)">vs</span> ${sLogo(nB,28)} ${nB.name} ${nB.mascot} <span style="margin-left:auto;font-weight:800">${nl.done?`${(getS(nl.w)||{}).mascot} win ${Math.max(nl.sa,nl.sb)}-${Math.min(nl.sa,nl.sb)}`:'to be played'}</span></div>`:'';
  return`<div data-norank><div class="pnl"><div class="ph">Rankings <span style="font-size:11px;font-weight:400;color:var(--mu);text-transform:none">${title} · ${G.phase==='offseason'?'preseason':'week '+(G.week||0)}</span></div><div class="pb">
    <div>${btn('NAT','National')}${ST_ORDER.map(k=>btn(k==='CF'?'ALL':'ST:'+k,'All-'+stName(k))).join('')}</div>
    ${clsBtns?`<div>${clsBtns}</div>`:''}
    <div style="font-size:12px;color:var(--mu);margin:4px 0 4px">Next to team names, <span class="rkb rk-n" style="cursor:default">#2</span> in blue is the national rank and <span class="rkb rk-a" style="cursor:default">#3</span> in gold the rank in the team's own state, <span class="rkb rk-c" style="cursor:default">#4</span> in red the rank in its classification (top 10). The national rank is shown first; tap a badge to switch.</div><div style="font-size:12px;color:var(--mu);margin:0 0 10px">Like the national prep rankings and media polls, rankings are driven by results: record, strength of schedule and unbeaten or one-loss seasons, with team talent weighing most in the preseason and early weeks. The national poll measures every team on one scale like the real national prep rankings: the biggest classifications in the strongest football states fill it, schedule strength counts more, and a small-school team needs a dominant season to crack it. The top two teams in the final national poll play for the National Championship.</div>
    ${natBox}
    <div style="overflow-x:auto"><table style="width:100%"><thead><tr><th>Rk</th><th></th><th>Team</th><th>Record</th><th>Rating</th><th>Prestige</th><th>Pts</th></tr></thead><tbody>${top}</tbody></table></div>
    ${others?`<div style="font-size:11px;color:var(--mu);margin-top:10px"><b>Also considered:</b> ${others}</div>`:''}</div></div></div>`;
}

// ═══════════ SAVE SLOTS (IndexedDB, falls back to localStorage) ═══════════
const SV_DB='gpgm_saves';
function svOpen(){return new Promise((res,rej)=>{try{if(!window.indexedDB)return rej(new Error('no idb'));const q=indexedDB.open(SV_DB,1);q.onupgradeneeded=()=>{const d=q.result;if(!d.objectStoreNames.contains('meta'))d.createObjectStore('meta',{keyPath:'id'});if(!d.objectStoreNames.contains('data'))d.createObjectStore('data',{keyPath:'id'});};q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error);}catch(e){rej(e);}});}
function svTx(stores,mode,fn){return svOpen().then(db=>new Promise((res,rej)=>{const t=db.transaction(stores,mode);let out;try{out=fn(t);}catch(e){rej(e);return;}t.oncomplete=()=>res(out&&out.result!==undefined?out.result:out);t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error);}));}
function svLsList(){try{return JSON.parse(localStorage.getItem('gpgm_slots')||'[]');}catch(e){return[];}}
// v9: a save is a list of gzip pieces (the career, then the players 6,000 at a time). Saving never builds one giant text,
// and the stored file is several times smaller. Older saves (one text) still load.
const SV_CHUNK=6000;
async function _svZ(str){if(typeof CompressionStream==='undefined')return{d:str,z:0};const ab=await new Response(new Blob([str]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer();return{d:ab,z:1};}
async function _svUnz(x){if(!x||!x.z)return x?x.d:'';return await new Response(new Blob([x.d]).stream().pipeThrough(new DecompressionStream('gzip'))).text();}
async function saveParts(){
  const P=G.players,n=P.length,v=_spVer,st=G.yr+'|'+G.phase+'|'+(G.week||0)+'|'+(G.osPhase||0);let head;
  G.players=[];try{head=JSON.stringify({G,_sId,_pId,v:9,np:n},_svRep);}finally{G.players=P;}
  const parts=[await _svZ(head)];head=null;
  for(let i=0;i<n;i+=SV_CHUNK){let t=JSON.stringify(P.slice(i,i+SV_CHUNK),_svRep);parts.push(await _svZ(t));t=null;}
  // the career moved on while the pieces were written: this snapshot would be mixed, so it is not kept
  if(G.players!==P||P.length!==n||_spVer!==v||st!==G.yr+'|'+G.phase+'|'+(G.week||0)+'|'+(G.osPhase||0))return null;
  return parts;}
async function svReadParts(rec){const head=JSON.parse(await _svUnz(rec.parts[0])),pl=[];
  for(let i=1;i<rec.parts.length;i++){const a=JSON.parse(await _svUnz(rec.parts[i]));for(const x of a)pl.push(x);}
  head.G.players=pl;if(head.v>=8)_svRehydrate(head.G);return head;}
function svSaveParts(meta,parts){return svTx(['meta','data'],'readwrite',t=>{t.objectStore('meta').put(meta);t.objectStore('data').put({id:meta.id,parts,v:9});});}
// the save as an object, ready for applySaveText (pieces are unpacked one by one)
function svLoadObj(id){return svTx(['data'],'readonly',t=>t.objectStore('data').get(id)).then(r=>r&&r.parts?svReadParts(r):(r&&r.json?r.json:lsLoad('gpgm_slot_'+id))).catch(()=>lsLoad('gpgm_slot_'+id));}
function svSave(meta,json){
  return svTx(['meta','data'],'readwrite',t=>{t.objectStore('meta').put(meta);t.objectStore('data').put({id:meta.id,json});}).catch(()=>{
    lsSave('gpgm_slot_'+meta.id,json);const l=svLsList().filter(m=>m.id!==meta.id);l.push(meta);localStorage.setItem('gpgm_slots',JSON.stringify(l));});
}
function svList(){
  return svTx(['meta'],'readonly',t=>t.objectStore('meta').getAll()).catch(()=>svLsList()).then(a=>{
    const l=(a||[]).concat(svLsList().filter(x=>!(a||[]).some(y=>y.id===x.id)));return l.sort((x,y)=>y.savedAt-x.savedAt);});
}
function svGetData(id){ // the save as one text (export, sending to a friend, account backup)
  return svTx(['data'],'readonly',t=>t.objectStore('data').get(id)).then(async r=>{if(r&&r.parts){const d=await svReadParts(r);return JSON.stringify({G:d.G,_sId:d._sId,_pId:d._pId,v:8},_svRep);}return r&&r.json?r.json:lsLoad('gpgm_slot_'+id);}).catch(()=>lsLoad('gpgm_slot_'+id));
}
function svDelete(id){
  const l=svLsList().filter(m=>m.id!==id);try{localStorage.setItem('gpgm_slots',JSON.stringify(l));lsSave('gpgm_slot_'+id,'');}catch(e){}
  return svTx(['meta','data'],'readwrite',t=>{t.objectStore('meta').delete(id);t.objectStore('data').delete(id);}).catch(()=>{});
}
// v2.06 compact saves (v:8): all-zero stat lines and default player flags are left out of the file and restored on load.
// This more than halves the save size, which keeps saving fast and light on phones.
const _PL_DEF={camp:false,wl:false,hof:false,committed:null,inj:0,sp:0,streak:null,streakUsed:false,streakGamesLeft:0,streakCD:0};
const _PL_ARR={offers:1,perfHistory:1,gameLog:1,seasons:1},_SV_Z=emSFull(),_hasO=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
function _isPl(o){return!!o&&typeof o==='object'&&!Array.isArray(o)&&o.sId!==undefined&&o.pos!==undefined&&o.ln!==undefined&&o.fs!==undefined;}
function _svRep(k,v){
  if(!_isPl(this))return v;
  if(k==='stats')return undefined; // a duplicate of carStats nothing reads
  if(k==='seasStats'||k==='carStats'){if(v&&typeof v==='object'&&!Array.isArray(v)){const o={};for(const q in v){if(v[q]===0&&_hasO(_SV_Z,q))continue;o[q]=v[q];}return o;}return v;}
  if(_hasO(_PL_DEF,k)&&v===_PL_DEF[k])return undefined;
  if(_hasO(_PL_ARR,k)&&Array.isArray(v)&&!v.length)return undefined;
  if(k==='depth'&&v&&typeof v==='object'&&!Array.isArray(v)&&!Object.keys(v).length)return undefined;
  return v;
}
function saveJson(){return JSON.stringify({G,_sId,_pId,v:8},_svRep);}
function _svRehydrate(root){
  const st=[root];
  while(st.length){const o=st.pop();
    if(Array.isArray(o)){for(let i=0;i<o.length;i++){const v=o[i];if(v&&typeof v==='object')st.push(v);}continue;}
    if(_isPl(o)){
      for(const q of['stats','seasStats','carStats'])if(o[q]&&typeof o[q]==='object'&&!Array.isArray(o[q]))o[q]=Object.assign(emS(),o[q]);
      if(!o.stats)o.stats=emS();
      for(const q in _PL_DEF)if(!_hasO(o,q))o[q]=_PL_DEF[q];
      for(const q in _PL_ARR)if(!_hasO(o,q))o[q]=[];
      if(!_hasO(o,'depth'))o.depth={};
    }
    for(const q in o){const v=o[q];if(v&&typeof v==='object')st.push(v);}
  }
  return root;
}
function parseSave(txt){const d=JSON.parse(txt);if(d&&d.G&&d.v>=8)_svRehydrate(d.G);return d;}
let _svBusy=false,_svAgain=false,_svP=null;
function saveGame(silent){
  if(typeof G==='undefined'||!G||!G.myId)return Promise.resolve(false);
  if(!G.saveId)G.saveId='c'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  if(silent&&_svBusy){_svAgain=true;return Promise.resolve(false);}   // one save at a time; a queued autosave runs right after
  const ms=myS()||{};
  const meta={id:G.saveId,name:ms.name||'',mascot:ms.mascot||'',c1:ms.c1,c2:ms.c2,cls:G.cls,season:(G.baseYear||2026)+(G.yr-1),rec:(G.wins||0)+'-'+(G.losses||0),phase:G.phase,week:G.week||0,coach:(G.coach&&G.coach.name)||'',savedAt:Date.now(),size:0};
  _svBusy=true;let fin;_svP=new Promise(r=>fin=r);const done=()=>{_svBusy=false;fin();if(_svAgain){_svAgain=false;setTimeout(()=>{if(_gdBusy())_autoSaveSoon();else saveGame(true);},400);}};
  if(window.indexedDB&&typeof CompressionStream!=='undefined'&&!window._svOld){
    return saveParts().then(parts=>{if(!parts){_svAgain=true;done();return false;}meta.size=parts.reduce((a,x)=>a+(x.d.byteLength||x.d.length||0),0);
        return svSaveParts(meta,parts).then(()=>{done();const cl=cloudAutoOn()&&cloudMaySignedIn();if(!silent&&!cl)notify('Game saved on this device. Find it under Load Game.');try{cloudAfterSave(meta,null,!silent);}catch(e){}return true;});})
      .catch(e=>{done();console.error('save',e);window._svOld=true;return saveGame(silent);}); // pieces failed (old browser storage): the single-text save below
  }
  let json;try{json=saveJson();}catch(e){done();if(!silent)notify('Save failed: '+e.message,'e');return Promise.resolve(false);}meta.size=json.length;
  return svSave(meta,json).then(()=>{done();const cl=cloudAutoOn()&&cloudMaySignedIn();if(!silent&&!cl)notify('Game saved on this device. Find it under Load Game.');try{cloudAfterSave(meta,json,!silent);}catch(e){}return true;}).catch(e=>{done();if(!silent)notify('Could not save: '+e.message,'e');return false;});
}
function _fileSave(name,data){
  const fall=()=>{const b=new Blob([data]),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;a.style.display='none';document.body.appendChild(a);a.click();setTimeout(()=>{a.remove();URL.revokeObjectURL(a.href);},500);};
  try{if(window.claude&&window.claude.use){return window.claude.use('downloads').then(d=>{if(!d){fall();return;}return d.save({filename:name,data}).catch(e=>{if(e&&e.code!=='declined')notify('Could not save the file ('+(e.code||'error')+')','e');});}).catch(fall);}}catch(e){}
  fall();
}
// teams only: every school of every classification (names, mascots, colors, logos, schemes) plus the colleges and pro teams,
// as a team pack that Team Builder imports into a new career. No players, records or progress.
function saveTeamsPack(GG,from){const T=t=>{const o={name:t.name,mascot:t.mascot,city:t.city,abbr:t.abbr,c1:t.c1,c2:t.c2,prestige:t.prestige,tier:t.tier,offS:t.offS,defS:t.defS};
    for(const k of['c3','logoKey','mash','customLogo','uni'])if(t[k])o[k]=t[k];return o;};
  const L={};const add=(c,divs)=>{if(!divs||L[c])return;L[c]={divisions:divs.map(d=>({name:d.name,teams:(d.teams||[]).filter(t=>t&&!t.intl).map(T)}))};};
  if(GG.cls&&GG.divisions)add(GG.cls,GG.divisions);for(const c in(GG.allLeagues||{}))add(c,GG.allLeagues[c]&&GG.allLeagues[c].divisions);
  const W=GG.world||{};return{type:'gridiron_team_pack',v:3,app:'Gridiron 27',from:from||'',cls:GG.cls,exportDate:new Date().toISOString().slice(0,10),allClassifications:L,
    colleges:W.colleges,colMeta:W.colMeta,pro:W.pro,geo:W.geo?{mode:W.geo.mode,home:W.geo.home}:undefined};}
window.exportSaveTeams=function(id){svGetData(id).then(json=>{if(!json){notify('Save not found','e');return;}let d;try{d=JSON.parse(json);}catch(e){notify('Could not read that save','e');return;}
  const GG=d&&(d.G||d);if(!GG||!GG.divisions){notify('Could not read that save','e');return;}const pk=saveTeamsPack(GG,(GG.divisions&&getSIn(GG,GG.myId))||'');
  const n=Object.values(pk.allClassifications).reduce((a,c)=>a+c.divisions.reduce((b,x)=>b+x.teams.length,0),0);
  _fileSave(`gridiron_teams_${id}.json`,JSON.stringify(pk));notify(`Exported ${n} teams (no players). Import them in Team Builder → Export / Import.`);});};
function getSIn(GG,id){try{for(const d of GG.divisions)for(const t of d.teams)if(t.id===id)return t.name+' '+t.mascot;}catch(e){}return'';}
function exportSave(id){
  const go=json=>{if(!json){notify('Save not found','e');return;}_fileSave(`gridiron_${id}.json`,json);};
  if(id)svGetData(id).then(go);else{try{go(saveJson());}catch(e){notify('Export failed','e');}}
}
let _autoKey='';
// no saving while Game Day runs: the career has not changed yet, and a full save on top of the running game was a memory spike on phones
function _gdBusy(){return!!document.getElementById('gd-ov');}
function autoSave(){try{if(typeof G==='undefined'||!G||!G.myId||_gdBusy()||gdsMain().autosave===false)return;const app=document.getElementById('app');if(!app||app.classList.contains('hid'))return;saveGame(true);}catch(e){}}
function _autoSaveSoon(){const t=Date.now();const go=()=>{if(_gdBusy()&&Date.now()-t<600000){setTimeout(go,2000);return;}saveGame(true);};setTimeout(go,1500);}
function autoSaveTick(){try{if(typeof G==='undefined'||!G||!G.myId||gdsMain().autosave===false)return;const k=G.yr+'|'+G.phase+'|'+G.week+'|'+(G.osPhase||0);if(k!==_autoKey){const first=!_autoKey;_autoKey=k;if(!first)_autoSaveSoon();}}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')autoSave();});
window.addEventListener('pagehide',autoSave);
