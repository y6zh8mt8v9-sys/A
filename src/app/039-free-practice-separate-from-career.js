// ═══════════ FREE PRACTICE (separate from career) ═══════════
const FP_KEY='gpm_free_v1';
const FP_NEED={QB:2,RB:3,WR:6,TE:3,OL:8,DL:7,LB:5,CB:4,S:3,K:1};
const FP_BODY={QB:[73,190],RB:[70,185],WR:[72,172],TE:[74,220],OL:[74,262],DL:[73,240],LB:[72,205],CB:[70,168],S:[71,180],K:[71,170]};
const FP_TILT={QB:{spd:-4,str:-6,awr:6},RB:{spd:8,str:2,awr:-4},WR:{spd:10,str:-8,awr:-2},TE:{spd:-2,str:6,awr:0},OL:{spd:-14,str:12,awr:0},DL:{spd:-6,str:10,awr:-2},LB:{spd:2,str:6,awr:2},CB:{spd:10,str:-8,awr:0},S:{spd:6,str:-2,awr:2},K:{spd:-10,str:-10,awr:4}};
window._fpMode=false;window.FP={store:null,tab:'play',edit:null,mode:'exh',a:null,b:null,uni:'home',tier:12,qb:'#d8333b'};
function fpRnd(a,b){return a+Math.random()*(b-a);}
function fpPick(a){return a[Math.floor(Math.random()*a.length)];}
function fpLoad(){let s=null;try{s=JSON.parse(localStorage.getItem(FP_KEY)||'null');}catch(e){}
  if(!s||!Array.isArray(s.teams))s={teams:[],pb:pbEmpty(),god:{on:false,picks:false,cd:0.25},nextId:9501};
  s.god=Object.assign({on:false,picks:false,cd:0.25},s.god||{});s.pb=s.pb||pbEmpty();s.stadC=s.stadC||{};if(s.tier)FP.tier=s.tier;if(s.ptier)FP.ptier=s.ptier;s.nextId=s.nextId||9501;
  if(!s.teams.length){s.teams.push(fpNewTeam(s,{name:'Riverside Academy',city:'Riverside',mascot:'Raptors',abbr:'RVA',c1:'#0b5d8c',c2:'#f4c430',c3:'#ffffff',ovr:62,offS:'Spread',defS:'4-3'}));
    s.teams.push(fpNewTeam(s,{name:'Iron Hill High',city:'Iron Hill',mascot:'Miners',abbr:'IHH',c1:'#3b3b3b',c2:'#e05a1a',c3:'#c0c0c0',ovr:60,offS:'I-Formation',defS:'46'}));}
  FP.store=s;return s;}
function fpSave(){try{localStorage.setItem(FP_KEY,JSON.stringify(FP.store));}catch(e){}}
function fpNewTeam(st,o){const t=Object.assign({id:st.nextId++,fp:true,name:'New Team',city:'Hometown',mascot:'Hawks',abbr:'NEW',c1:'#7a1f2b',c2:'#ffffff',c3:'#b5a36a',ovr:60,offS:'Pro Style',defS:'4-3',uni:null,roster:[]},o||{});fpRoster(t);return t;}
function fpRoster(t){
  const used=new Set(),R=[];let pid=t.id*1000;
  for(const pos in FP_NEED)for(let i=0;i<FP_NEED[pos];i++){
    const nums=posNums(pos).filter(n=>!used.has(n));const num=nums.length?fpPick(nums):(pos==='K'?3:99);used.add(num);
    const starter=i<(GD_NEED[pos]||1),off=Math.round(starter?fpRnd(-2,7):fpRnd(-12,0)),[h,w]=FP_BODY[pos],T=FP_TILT[pos];
    const arch=(ARCHETYPES[pos]&&ARCHETYPES[pos].length)?fpPick(ARCHETYPES[pos]):null,tr=Math.random()<0.5?[fpPick(TRAITS).k]:[];
    R.push({id:pid++,pos,fn:fpPick(FN),ln:fpPick(LN),num,off,dspd:T.spd+Math.round(fpRnd(-5,5)),dstr:T.str+Math.round(fpRnd(-5,5)),dawr:T.awr+Math.round(fpRnd(-5,5)),
      ht:Math.round(h+fpRnd(-2,3)),wt:Math.round(w+fpRnd(-15,20)),fs:Math.floor(Math.random()*1e9),arch,traits:tr});}
  t.roster=R;fpApplyOvr(t);
}
function fpApplyOvr(t){const c=v=>Math.max(25,Math.min(99,Math.round(v)));for(const p of t.roster){p.rat=c(t.ovr+p.off);p.spd=c(p.rat+p.dspd);p.str=c(p.rat+p.dstr);p.awr=c(p.rat+p.dawr);}}
function fpT(id){return FP.store.teams.find(t=>t.id===+id);}
// ── open / close ──
function fpOpen(){fpLoad();window._fpMode=true;hideTitle();FP.hidden=['setup','app'].filter(id=>{const e=document.getElementById(id);if(e&&!e.classList.contains('hid')){e.classList.add('hid');return true;}return false;});let el=document.getElementById('fp');if(!el){el=document.createElement('div');el.id='fp';document.body.appendChild(el);}
  el.classList.remove('hid');if(!FP.a||!fpT(FP.a))FP.a=FP.store.teams[0].id;if(!FP.b||!fpT(FP.b))FP.b=(FP.store.teams[1]||FP.store.teams[0]).id;fpRender();}
function fpClose(){fpSave();window._fpMode=false;window._pbD=null;window._pbB=null;const el=document.getElementById('fp');if(el)el.classList.add('hid');(FP.hidden||[]).forEach(id=>{const e=document.getElementById(id);if(e)e.classList.remove('hid');});FP.hidden=[];showTitle(false);}
function fpTab(t){FP.tab=t;window._pbD=null;window._pbB=null;fpRender();}
function fpRender(){
  const el=document.getElementById('fp');if(!el)return;const st=FP.store;
  const tabs=[['play','Play'],['teams','Teams'],['pb','Playbooks'],['adv','Advanced']].map(([k,l])=>`<button class="tab ${FP.tab===k?'on':''}" onclick="fpTab('${k}')">${l}</button>`).join('');
  let body='';
  if(FP.tab==='play')body=fpPlayHtml();else if(FP.tab==='teams')body=fpTeamsHtml();else if(FP.tab==='pb')body=pbEditorHtml();else body=fpAdvHtml();
  const y=el.scrollTop;
  el.innerHTML=`<div class="fp-wrap"><div class="fp-head"><button class="bgh bsm" onclick="fpClose()">Main menu</button><h2>Free Practice</h2><span class="fp-sub">Separate from your career · saved on this device</span></div>
    <div class="tabs fp-tabs">${tabs}</div>${body}</div>`;
  el.scrollTop=y;if(FP.tab==='pb')setTimeout(pbBindDrag,0);
}
const fpOpt=(list,sel)=>list.map(x=>`<option${x===sel?' selected':''}>${x}</option>`).join('');
const fpTeamOpt=sel=>FP.store.teams.map(t=>`<option value="${t.id}"${t.id===+sel?' selected':''}>${t.name} ${t.mascot} (${t.ovr})</option>`).join('');
function fpPlayHtml(){
  const modes=[['exh','Exhibition game','Full game, your team vs another'],['two','2 players, one device','Each player runs his own offense, the computer plays defense'],['off','Practice: Offense vs Defense','You run the offense, 12 reps'],['def','Practice: Defense vs Offense','You play defense, 12 reps'],['air','Practice: Offense on air','No defense, timing reps']];
  const A=fpT(FP.a),B=fpT(FP.b),exh=FP.mode==='exh'||FP.mode==='two',gd=FP.store.god;
  return`<div class="pnl" style="margin-bottom:14px"><div class="ph">Mode</div><div class="pb" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px">
      ${modes.map(([k,l,d])=>`<button class="${FP.mode===k?'btn bbl':'bgh'}" style="min-height:58px;text-align:left;padding:8px 14px" onclick="FP.mode='${k}';fpRender()"><b>${l}</b><br><small style="font-weight:600;opacity:.85">${d}</small></button>`).join('')}</div></div>
    <div class="pnl" style="margin-bottom:14px"><div class="ph">${exh?'Matchup':'Team'}</div><div class="pb">
      <div style="display:flex;gap:18px;flex-wrap:wrap;align-items:center">
        <div style="flex:1 1 240px;text-align:center">${sLogo(A,72)}<br><select onchange="FP.a=+this.value;fpRender()" style="margin-top:6px;max-width:100%">${fpTeamOpt(FP.a)}</select>
          <div style="font-size:12px;color:var(--mu);margin-top:4px">${A.offS} offense · ${A.defS} defense</div></div>
        ${exh?`<div style="font-weight:900;font-size:22px;color:var(--mu)">VS</div><div style="flex:1 1 240px;text-align:center">${sLogo(B,72)}<br><select onchange="FP.b=+this.value;fpRender()" style="margin-top:6px;max-width:100%">${fpTeamOpt(FP.b)}</select>
          <div style="font-size:12px;color:var(--mu);margin-top:4px">${B.offS} offense · ${B.defS} defense</div></div>`:''}
      </div>
      <div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:14px;align-items:center;justify-content:center">
        ${exh?`<label style="font-size:12px;color:var(--mu)">Your uniform <select onchange="FP.uni=this.value">${[['home','Home'],['away','Away'],['alt','Alternate']].map(([k,l])=>`<option value="${k}"${FP.uni===k?' selected':''}>${l}</option>`).join('')}</select></label>`:
          `<label style="font-size:12px;color:var(--mu)">QB non-contact jersey <select onchange="FP.qb=this.value">${[['#d8333b','Red'],['#2fa84f','Green'],['#2f7fe0','Blue']].map(([c,l])=>`<option value="${c}"${FP.qb===c?' selected':''}>${l}</option>`).join('')}</select></label>`}
      </div>
      <div style="text-align:center;margin-top:14px"><button class="btn bgn" style="min-width:220px;font-size:17px" onclick="fpStart()">${exh?'Kick off':'Start practice'}</button>
        ${gd.on?`<div style="font-size:12px;color:var(--gd);margin-top:8px;font-weight:800">God mode on${gd.picks?' · guaranteed picks':''} · move cooldowns ×${gd.cd}</div>`:''}</div>
    </div></div>
    <div class="pnl" style="margin-bottom:14px"><div class="ph">Venue <span style="font-size:12px;color:var(--mu);font-weight:600">test every stadium and practice field level</span></div><div class="pb" id="fp-venue">${fpVenueHtml()}</div></div>`;
}
function fpVenueHtml(){
  const A=fpT(FP.a)||FP.store.teams[0],C=FP.store.stadC||{},pt=FP.ptier||FP.tier,si=stadInfo(FP.tier,C,A),pi=pracInfo(pt,C,A),exh=FP.mode==='exh'||FP.mode==='two';
  const card=(i,lab,k,v,on)=>`<div style="flex:1 1 280px;min-width:0;${on?'':'opacity:.6'}"><div style="font-size:12px;font-weight:800;color:var(--mu);margin-bottom:4px">${lab}${on?' · used for this mode':''}</div>
    <div id="fpv-${k}">${fpVenueCard(i)}</div>
    <label style="display:block;font-size:12px;color:var(--mu);margin-top:6px">${k==='tier'?'Stadium tier':'Practice level (stadium tier)'} <b id="fpvl-${k}">${v}</b><input type="range" min="1" max="20" value="${v}" style="width:100%" oninput="fpVenue('${k}',+this.value,1)" onchange="fpVenue('${k}',+this.value)"></label></div>`;
  const vst=FP.store.vst||'CF',vwx=FP.store.vwx||'auto';
  const pick=`<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px">
    <label style="font-size:12px;color:var(--mu)">State scenery <select onchange="FP.store.vst=this.value;fpSave();fpVenue('tier',FP.tier)">${ST_ORDER.map(k=>`<option value="${k}"${k===vst?' selected':''}>${stName(k)}</option>`).join('')}</select></label>
    <label style="font-size:12px;color:var(--mu)">Weather <select onchange="FP.store.vwx=this.value;fpSave()">${[['auto','Random for the state'],['clear','Clear'],['cloudy','Overcast'],['rain','Rain'],['storm','Thunderstorms'],['snow','Snow'],['fog','Fog'],['wind','Strong wind'],['hot','Heat wave'],['cold','Bitter cold']].map(([k,l])=>`<option value="${k}"${k===vwx?' selected':''}>${l}</option>`).join('')}</select></label></div>`;
  return`${pick}<div style="display:flex;gap:16px;flex-wrap:wrap">${card(si,'Game stadium','tier',FP.tier,exh)}${card(pi,'Practice venue','ptier',pt,!exh)}</div>
    ${stadCustHtml(C,stadInfo(20,C,A),'fpStadC')}<div style="font-size:11px;color:var(--mu);margin-top:6px">Paint choices apply to both venues. Colored turf needs an artificial-turf stadium (tier 12+). Practice moves from the stadium to a practice field at tier 5; tier 20 is a college-level indoor facility.</div>`;
}
function fpWx(){const st=FP.store.vst||'CF',k=FP.store.vwx||'auto',w=wxMake(st,new Date(),(Math.random()*4294967295)>>>0);
  if(k==='auto')return w;const C=WX_CLIM[st]||WX_CLIM.CF;
  const set={clear:{k:'clear',i:0},cloudy:{k:'cloudy',i:0},rain:{k:'rain',i:0.7},storm:{k:'storm',i:0.9,w:Math.max(w.w,16)},snow:{k:'snow',i:0.75,t:Math.min(w.t,27)},fog:{k:'fog',i:0.85,w:3},
    wind:{k:'clear',i:0,w:24},hot:{k:'clear',i:0,t:96},cold:{k:'clear',i:0,t:18}}[k]||{};
  const o=Object.assign(w,set);if(o.k==='snow'&&o.t>32)o.t=27;return o;}
function fpVenueCard(i){return`${stadPreviewSvg(i,420)}<div style="font-weight:800;font-size:14px;margin-top:4px">${i.name}${i.pl?` <span style="font-size:11px;color:var(--mu)">practice level ${i.pl}/16</span>`:''}</div><div style="font-size:11px;color:var(--mu)">${stadDesc(i)}</div>`;}
function fpVenue(k,v,live){FP[k]=v;if(k==='tier'&&!FP.ptierSet)FP.ptier=v;if(k==='ptier')FP.ptierSet=true;FP.store.tier=FP.tier;FP.store.ptier=FP.ptier||FP.tier;
  if(live){const A=fpT(FP.a)||FP.store.teams[0],C=FP.store.stadC||{},pt=FP.ptier||FP.tier,g=id=>document.getElementById(id);
    if(g('fpv-tier'))g('fpv-tier').innerHTML=fpVenueCard(stadInfo(FP.tier,C,A));if(g('fpv-ptier'))g('fpv-ptier').innerHTML=fpVenueCard(pracInfo(pt,C,A));
    if(g('fpvl-tier'))g('fpvl-tier').textContent=FP.tier;if(g('fpvl-ptier'))g('fpvl-ptier').textContent=pt;return;}
  fpSave();const el=document.getElementById('fp-venue');if(el)el.innerHTML=fpVenueHtml();}
function fpStadC(k,v){FP.store.stadC=Object.assign({},FP.store.stadC||{},{[k]:v});fpSave();const el=document.getElementById('fp-venue');if(el)el.innerHTML=fpVenueHtml();}
function fpTeamsHtml(){
  const st=FP.store,t=fpT(FP.edit)||st.teams[0];FP.edit=t.id;window._fpEditT=t;
  const list=st.teams.map(x=>`<button class="${x.id===t.id?'btn bbl':'bgh'} bsm" style="display:inline-flex;align-items:center;gap:6px;margin:0 6px 6px 0" onclick="FP.edit=${x.id};fpRender()">${sLogo(x,22)}${x.name}</button>`).join('');
  const f=(k,l,w)=>`<label style="font-size:12px;color:var(--mu);flex:1 1 ${w||140}px">${l}<br><input value="${String(t[k]).replace(/"/g,'&quot;')}" maxlength="24" onchange="fpSet('${k}',this.value)" style="width:100%"></label>`;
  const col=(k,l)=>`<label style="font-size:12px;color:var(--mu)">${l}<br><input type="color" value="${t[k]}" onchange="fpSet('${k}',this.value)" style="width:52px;height:34px;padding:0;border-radius:8px"></label>`;
  const order=Object.keys(FP_NEED),ros=t.roster.slice().sort((a,b)=>order.indexOf(a.pos)-order.indexOf(b.pos)||b.rat-a.rat);
  return`<div class="pnl" style="margin-bottom:14px"><div class="ph">Your teams <span style="font-size:12px;color:var(--mu)">${st.teams.length}</span></div><div class="pb">${list}
      <div style="margin-top:6px"><button class="btn bgn bsm" onclick="fpAddTeam()">+ New team</button> <button class="bgh bsm" onclick="fpDupTeam()">Duplicate</button> ${st.teams.length>2?`<button class="bgh bsm" onclick="fpDelTeam()">Delete</button>`:''}</div></div></div>
    <div class="pnl" style="margin-bottom:14px"><div class="ph" style="display:flex;align-items:center;gap:10px">${sLogo(t,34)}${t.name} ${t.mascot}</div><div class="pb">
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px">${f('name','School / team name',200)}${f('city','City')}${f('mascot','Mascot')}${f('abbr','Abbreviation',80)}</div>
      <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end;margin-bottom:12px">${col('c1','Primary')}${col('c2','Secondary')}${col('c3','Tertiary')}
        <label style="font-size:12px;color:var(--mu);flex:1 1 220px">Team overall <b id="fp-ovr">${t.ovr}</b><br><input type="range" min="35" max="95" value="${t.ovr}" oninput="document.getElementById('fp-ovr').textContent=this.value" onchange="fpSet('ovr',+this.value)" style="width:100%"></label></div>
      <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:6px">
        <label style="font-size:12px;color:var(--mu)">Offensive playbook<br><select onchange="fpSet('offS',this.value)">${fpOpt(pbOffList(),t.offS)}</select></label>
        <label style="font-size:12px;color:var(--mu)">Defensive playbook<br><select onchange="fpSet('defS',this.value)">${fpOpt(pbDefList(),t.defS)}</select></label></div>
      <div style="font-size:11px;color:var(--mu)">Make your own plays and playbooks in the Playbooks tab, then pick them here.</div></div></div>
    <div class="pnl" style="margin-bottom:14px"><div class="ph">Share and community</div><div class="pb">
      <div style="font-size:13px;color:var(--mu);margin-bottom:8px">Send this team to a friend with a share code, or publish it so every player can download it. Community teams need an Online Play account.</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap"><button class="bgh bsm" onclick="fpShareOpen()">Share code</button><button class="bgh bsm" onclick="fpImportOpen()">Import a code</button><button class="btn bsm" onclick="commOpen()">Community teams</button><button class="bgh bsm" onclick="commPublish()">Publish this team</button></div></div></div>
    <div class="pnl" style="margin-bottom:14px"><div class="ph">Uniforms</div><div class="pb">${uniEditorHtml()}</div></div>
    <div class="pnl"><div class="ph" style="display:flex;justify-content:space-between;align-items:center">Roster (${t.roster.length}) <button class="bgh bsm" onclick="fpNewRoster()">New roster</button></div><div class="pb" style="max-height:420px;overflow-y:auto"><div style="font-size:12px;color:var(--mu);margin-bottom:6px">Click a player to edit his name, number, position, ratings, size and face.</div>
      <table style="width:100%"><thead><tr><th>#</th><th>Name</th><th>Pos</th><th>Rat</th><th>Spd</th><th>Str</th><th>Awr</th><th>Type</th></tr></thead><tbody>
      ${ros.map(p=>`<tr class="cl" onclick="fpEditP(${p.id})" title="Edit player"><td>${p.num}</td><td style="white-space:nowrap">${face(p.fs,22)} ${p.fn} ${p.ln}</td><td>${p.pos}</td><td><b>${p.rat}</b></td><td>${atv(p,'spd')}</td><td>${atv(p,'str')}</td><td>${atv(p,'awr')}</td><td style="font-size:11px;color:var(--mu)">${p.arch||''}</td></tr>`).join('')}</tbody></table></div></div>`;
}
function fpEditP(pid){const t=fpT(FP.edit),p=t&&t.roster.find(x=>x.id===pid);if(!p)return;window._fpPid=pid;
  const pos=Object.keys(FP_NEED),n=(id,l,v,a,b)=>`<div class="fg"><label>${l}</label><input class="ei" type="number" id="${id}" value="${v}" min="${a}" max="${b}"></div>`;
  openMo(`<h2>Edit: ${p.fn} ${p.ln}</h2><div class="g2" style="gap:10px;margin-top:8px">
    <div class="fg"><label>First name</label><input class="ei" id="fpe-fn" maxlength="18" value="${String(p.fn).replace(/"/g,'&quot;')}"></div>
    <div class="fg"><label>Last name</label><input class="ei" id="fpe-ln" maxlength="18" value="${String(p.ln).replace(/"/g,'&quot;')}"></div>
    ${n('fpe-num','Jersey #',p.num,0,99)}
    <div class="fg"><label>Position</label><select class="ei" id="fpe-pos">${pos.map(x=>`<option ${x===p.pos?'selected':''}>${x}</option>`).join('')}</select></div>
    ${n('fpe-rat','Overall',p.rat,25,99)}${n('fpe-spd','Speed',p.spd,25,99)}${n('fpe-str','Strength',p.str,25,99)}${n('fpe-awr','Awareness',p.awr,25,99)}
    <div class="fg"><label>Height</label><div style="display:flex;gap:6px;align-items:center"><input class="ei" type="number" id="fpe-ft" value="${Math.floor((p.ht||72)/12)}" min="4" max="7" style="width:64px"> ft <input class="ei" type="number" id="fpe-in" value="${(p.ht||72)%12}" min="0" max="11" style="width:64px"> in</div></div>
    ${n('fpe-wt','Weight (lbs)',p.wt||200,100,400)}
  </div>${lookEditorHtml(p)}
  <div style="display:flex;gap:8px;margin-top:12px"><button class="btn" onclick="fpSaveP()">Save</button><button class="bgh" onclick="clo()">Cancel</button></div>`);}
function fpSaveP(){const t=fpT(FP.edit),p=t&&t.roster.find(x=>x.id===window._fpPid);if(!p)return;
  const v=id=>(document.getElementById(id)||{}).value,i=id=>parseInt(v(id),10),c=x=>Math.max(25,Math.min(99,x)),clean=x=>String(x||'').replace(/[<>&"'`]/g,'').trim().slice(0,18);
  p.fn=clean(v('fpe-fn'))||p.fn;p.ln=clean(v('fpe-ln'))||p.ln;if(Number.isFinite(i('fpe-num')))p.num=Math.max(0,Math.min(99,i('fpe-num')));
  const np=v('fpe-pos');if(np&&np!==p.pos&&FP_NEED[np]){p.pos=np;p.arch=(ARCHETYPES[np]&&ARCHETYPES[np].length)?fpPick(ARCHETYPES[np]):null;}
  const rat=Number.isFinite(i('fpe-rat'))?c(i('fpe-rat')):p.rat;p.off=rat-t.ovr;
  for(const[k,d]of[['spd','dspd'],['str','dstr'],['awr','dawr']]){const x=i('fpe-'+k);if(Number.isFinite(x))p[d]=c(x)-rat;}
  const ft=i('fpe-ft'),inch=i('fpe-in'),w=i('fpe-wt');if(Number.isFinite(ft)&&Number.isFinite(inch))p.ht=Math.max(54,Math.min(90,ft*12+Math.max(0,Math.min(11,inch))));if(Number.isFinite(w))p.wt=Math.max(90,Math.min(420,w));
  FP.store.looks=FP.store.looks||{};lookRead(p,FP.store.looks);
  fpApplyOvr(t);fpSave();clo();fpRender();notify(`${p.fn} ${p.ln} saved`);}
// v2.15 share codes: a whole team (colours, uniforms, roster, faces) in one line of text
function fpPack(t){const looks=FP.store.looks||{},R=t.roster.map(p=>[p.pos,p.fn,p.ln,p.num,p.off,p.dspd,p.dstr,p.dawr,p.ht,p.wt,p.fs,p.arch||'',(p.traits||[]).join(','),looks[p.fs]||0]);
  return{v:1,name:t.name,city:t.city,mascot:t.mascot,abbr:t.abbr,c1:t.c1,c2:t.c2,c3:t.c3,ovr:t.ovr,offS:t.offS,defS:t.defS,uni:t.uni||null,logo:t.logo||null,R};}
function fpCode(t){const j=JSON.stringify(fpPack(t));return'GPT1.'+btoa(unescape(encodeURIComponent(j)));}
function fpUnpack(d){
  if(!d||d.v!==1||!Array.isArray(d.R)||!d.R.length||d.R.length>80)throw new Error('That is not a team code.');
  const cl=(x,n)=>String(x==null?'':x).replace(/[<>&"'`\\]/g,'').trim().slice(0,n),col=x=>/^#[0-9a-f]{6}$/i.test(x||'')?x:'#777777',num=(x,a,b,d)=>{x=+x;return Number.isFinite(x)?Math.max(a,Math.min(b,Math.round(x))):d;};
  const st=FP.store,t={id:st.nextId++,fp:true,name:cl(d.name,40)||'Imported Team',city:cl(d.city,24)||'Hometown',mascot:cl(d.mascot,24)||'Team',abbr:cl(d.abbr,4).toUpperCase()||'IMP',
    c1:col(d.c1),c2:col(d.c2),c3:col(d.c3),ovr:num(d.ovr,35,95,60),offS:pbOffList().includes(d.offS)?d.offS:'Pro Style',defS:pbDefList().includes(d.defS)?d.defS:'4-3',uni:d.uni&&typeof d.uni==='object'?d.uni:null,roster:[]};
  if(d.logo&&typeof d.logo==='object')t.logo=d.logo;
  let pid=t.id*1000;st.looks=st.looks||{};
  for(const r of d.R){const pos=FP_NEED[r[0]]!=null?r[0]:'WR',fs=num(r[10],0,2e9,Math.floor(Math.random()*1e9));
    t.roster.push({id:pid++,pos,fn:cl(r[1],18)||'Player',ln:cl(r[2],18)||'',num:num(r[3],0,99,99),off:num(r[4],-60,60,0),dspd:num(r[5],-60,60,0),dstr:num(r[6],-60,60,0),dawr:num(r[7],-60,60,0),
      ht:num(r[8],54,90,72),wt:num(r[9],90,420,200),fs,arch:(ARCHETYPES[pos]||[]).includes(r[11])?r[11]:null,traits:String(r[12]||'').split(',').filter(k=>TRAITS.some(x=>x.k===k))});
    const L=r[13];if(L&&typeof L==='object'){const o={};if(Number.isInteger(L.ti))o.ti=Math.max(0,Math.min(7,L.ti));if(/^#[0-9a-f]{6}$/i.test(L.hc||''))o.hc=L.hc;if(/^#[0-9a-f]{6}$/i.test(L.eye||''))o.eye=L.eye;if(Number.isInteger(L.hs))o.hs=L.hs;if(['none','stubble','mustache','goatee','beard'].includes(L.fh))o.fh=L.fh;if(Object.keys(o).length)st.looks[fs]=o;}}
  fpApplyOvr(t);st.teams.push(t);FP.edit=t.id;fpSave();return t;}
function fpShareOpen(){const t=fpT(FP.edit);if(!t)return;const code=fpCode(t);
  openMo(`<h2>Share ${t.name}</h2><p style="font-size:13px;color:var(--mu)">Copy this code and send it to a friend. They paste it under Free Practice → Teams → Import a code.</p>
    <textarea class="ei" id="fp-code" readonly style="width:100%;height:120px;font-size:11px;word-break:break-all">${code}</textarea>
    <div style="display:flex;gap:8px;margin-top:10px"><button class="btn" onclick="fpCopyCode()">Copy</button><button class="bgh" onclick="clo()">Close</button></div>`);}
function fpCopyCode(){const el=document.getElementById('fp-code');if(!el)return;el.select();try{navigator.clipboard.writeText(el.value).then(()=>notify('Code copied'),()=>{document.execCommand('copy');notify('Code copied');});}catch(e){try{document.execCommand('copy');notify('Code copied');}catch(_){}}}
function fpImportOpen(){openMo(`<h2>Import a team</h2><p style="font-size:13px;color:var(--mu)">Paste a team code from a friend.</p>
    <textarea class="ei" id="fp-imp" style="width:100%;height:120px;font-size:11px" placeholder="GPT1.…"></textarea>
    <div style="display:flex;gap:8px;margin-top:10px"><button class="btn" onclick="fpImportGo()">Import</button><button class="bgh" onclick="clo()">Cancel</button></div>`);}
function fpImportGo(){const raw=((document.getElementById('fp-imp')||{}).value||'').trim().replace(/\s+/g,'');
  try{if(!raw.startsWith('GPT1.'))throw new Error('That is not a team code.');const d=JSON.parse(decodeURIComponent(escape(atob(raw.slice(5)))));const t=fpUnpack(d);clo();fpRender();notify(`${t.name} added to your teams`);}
  catch(e){notify(e.message&&/team code/.test(e.message)?e.message:'That code is not valid.','e');}}
// v2.15 community teams (Online Play account)
async function commB(){const B=await olBackend().catch(e=>{throw e;});if(!B)throw new Error('Online Play is not set up in this copy of the game.');
  if(!OLS.user)throw new Error('Sign in under Online Play to use community teams.');if(!B.commList)throw new Error('Community teams are not available on this server.');return B;}
async function commPublish(){const t=fpT(FP.edit);if(!t)return;
  try{const B=await commB();if(pfBad(t.name+' '+t.city+' '+t.mascot)||t.roster.some(p=>pfBad(p.fn+' '+p.ln))){notify('Please change the team or player names first: they break the community rules.','e');return;}
    if(!confirm(`Publish ${t.name} ${t.mascot} for every player to download? Your username is shown with it.`))return;
    await B.commPublish(OLS.user.id,olName(),`${t.name} ${t.mascot}`.slice(0,80),t.ovr,fpPack(t));notify('Published to community teams');}
  catch(e){notify(e.message||String(e),'e');}}
async function commOpen(sort){
  sort=sort||window._commSort||'new';window._commSort=sort;
  openMo(`<h2>Community Creations</h2>${ccTabs('teams')}<div id="comm-b" style="color:var(--mu)">Loading…</div>`);
  try{const B=await commB();const blocked=B.blocks?await B.blocks(OLS.user.id).catch(()=>[]):[];const L=(await B.commList(sort)).filter(r=>!blocked.includes(r.owner));window._comm=L;
    const el=document.getElementById('comm-b');if(!el)return;
    el.innerHTML=`<div style="display:flex;gap:6px;margin-bottom:10px"><button class="${sort==='new'?'btn bbl':'bgh'} bsm" onclick="commOpen('new')">Newest</button><button class="${sort==='top'?'btn bbl':'bgh'} bsm" onclick="commOpen('top')">Most downloaded</button></div>
      ${L.length?`<div style="display:grid;gap:8px;max-height:60vh;overflow-y:auto">${L.map((r,i)=>`<div style="display:flex;align-items:center;gap:10px;background:var(--s2);border:1px solid var(--bd);border-radius:10px;padding:8px 10px;color:var(--tx)">
        <div style="flex:1;min-width:0"><div style="font-weight:800">${olEsc(r.name)}</div><div style="font-size:12px;color:var(--mu)">${r.ovr} OVR · by ${olEsc(r.username||'player')} · ${r.downloads||0} downloads</div></div>
        <button class="btn bsm" onclick="commTake(${i})">Download</button>${r.owner===OLS.user.id?`<button class="bgh bsm" onclick="commDel(${i})">Remove</button>`:`<button class="bgh bsm" title="Report" onclick="commReport(${i})">Report</button>`}</div>`).join('')}</div>`:'<p>No teams yet. Be the first: build a team and press Publish this team.</p>'}`;}
  catch(e){const el=document.getElementById('comm-b');if(el)el.innerHTML=`<p>${olEsc(e.message||String(e))}</p>`;}}
async function commTake(i){const r=(window._comm||[])[i];if(!r)return;try{const B=await commB();const d=await B.commGet(r.id);const t=fpUnpack(typeof d==='string'?JSON.parse(d):d);clo();fpRender();notify(`${t.name} added to your teams`);}catch(e){notify(e.message||String(e),'e');}}
async function commDel(i){const r=(window._comm||[])[i];if(!r||!confirm('Remove this team from community teams?'))return;try{const B=await commB();await B.commDel(r.id);commOpen();}catch(e){notify(e.message||String(e),'e');}}
async function commReport(i){const r=(window._comm||[])[i];if(!r)return;const why=prompt('What is wrong with this team? (offensive names, etc.)');if(why==null)return;
  try{const B=await commB();await B.reportUser(OLS.user.id,r.owner,('community team "'+r.name+'": '+why).slice(0,500));if(confirm('Thanks, the report was sent. Also block this player (hides their teams)?')){await B.block(OLS.user.id,r.owner);}commOpen();}catch(e){notify(e.message||String(e),'e');}}
function fpSet(k,v){const t=fpT(FP.edit);if(!t)return;if(k==='abbr')v=String(v).toUpperCase().slice(0,4);t[k]=v;if(k==='ovr')fpApplyOvr(t);fpSave();fpRender();}
function fpAddTeam(){const t=fpNewTeam(FP.store,{name:'New Team '+(FP.store.teams.length+1)});FP.store.teams.push(t);FP.edit=t.id;fpSave();fpRender();}
function fpDupTeam(){const s=fpT(FP.edit);if(!s)return;const t=JSON.parse(JSON.stringify(s));t.id=FP.store.nextId++;t.name=s.name+' II';t.roster.forEach((p,i)=>p.id=t.id*1000+i);FP.store.teams.push(t);FP.edit=t.id;fpSave();fpRender();}
function fpDelTeam(){if(FP.store.teams.length<=2)return;if(!confirm('Delete this team?'))return;FP.store.teams=FP.store.teams.filter(t=>t.id!==FP.edit);FP.edit=FP.store.teams[0].id;if(!fpT(FP.a))FP.a=FP.store.teams[0].id;if(!fpT(FP.b))FP.b=FP.store.teams[1].id;fpSave();fpRender();}
function fpNewRoster(){const t=fpT(FP.edit);if(!t||!confirm('Generate a brand-new roster for this team?'))return;fpRoster(t);fpSave();fpRender();}
function fpAdvHtml(){const g=FP.store.god;
  const cds=[[1,'Normal'],[0.5,'Half'],[0.25,'Quarter'],[0.05,'Almost none']];
  return`<div class="pnl"><div class="ph">Advanced settings</div><div class="pb">
    <label style="display:flex;align-items:center;gap:10px;font-weight:800;margin-bottom:10px"><input type="checkbox" ${g.on?'checked':''} onchange="FP.store.god.on=this.checked;fpSave();fpRender()"> God mode</label>
    <div style="font-size:12px;color:var(--mu);margin-bottom:12px">Only for Free Practice, never in your career. Applies to your team in every mode.</div>
    <div style="${g.on?'':'opacity:.45;pointer-events:none'}">
      <div style="margin-bottom:12px"><b style="font-size:13px">Pick the catch</b><div style="font-size:12px;color:var(--mu)">Before each offensive play, the call screen shows a <b>God mode catch</b> menu. Choose hands, over the shoulder, over the top, one-handed fingertip, toe tap, sliding, diving and more: your receiver makes that catch every time he gets to the ball. "Normal" keeps regular catching.</div></div>
      <label style="display:flex;align-items:center;gap:10px;margin-bottom:12px"><input type="checkbox" ${g.picks?'checked':''} onchange="FP.store.god.picks=this.checked;fpSave()"> <span><b style="font-size:13px">Guaranteed interceptions</b><br><span style="font-size:12px;color:var(--mu)">When the other team throws, your nearest defender breaks on the ball and picks it off.</span></span></label>
      <label style="font-size:13px;font-weight:800">Skill move cooldowns <select onchange="FP.store.god.cd=+this.value;fpSave()">${cds.map(([v,l])=>`<option value="${v}"${g.cd===v?' selected':''}>${l}</option>`).join('')}</select></label>
      <div style="font-size:12px;color:var(--mu)">Shorter waits between jukes, spins, stiff arms, trucks and hurdles for your ball carrier.</div>
    </div></div></div>`;
}
// ── launch ──
function fpGod(){const g=FP.store.god;return g.on?{on:true,picks:!!g.picks,cd:g.cd||0.25}:null;}
function fpStart(){
  const A=fpT(FP.a),B=fpT(FP.b);if(!A)return;fpSave();
  if(FP.mode!=='exh'&&FP.mode!=='two'){fpPracStart(A,FP.mode);return;}
  if(!B){notify('Pick an opponent.','e');return;}
  const o1=_gdTop(A),o2=_gdTop(B);_gdAnchor=(o1+o2)/2;
  _gdTAdj=Math.round((o1-_gdAnchor)*0.5);const t1=Object.assign(gdTeam(A,FP.uni),{ovr:Math.round(o1)});
  _gdTAdj=Math.round((o2-_gdAnchor)*0.5);const t2=Object.assign(gdTeam(B,gdOppKind(B,FP.uni,A)),{ovr:Math.round(o2)});_gdTAdj=0;
  window.__GP={teams:[t1,t2],home:0,free:true,hotseat:FP.mode==='two',god:fpGod(),weather:fpWx(),stadium:stadInfo(FP.tier,FP.store.stadC,A),ez:_gdDark(A.c1||'#1c3766',.25),ezText:_gdLum(A.c2||'#fff')>.35?(A.c2||'#ffffff'):'#ffffff'};
  _gdCtx={kind:'free',mode:'exh',a:A.id,b:B.id};gdLaunch();
}
function fpPracStart(me,mode){
  const qc=FP.qb||'#d8333b',offK=pracKit(me,true),defK=pracKit(me,false),userOff=mode!=='def';
  _gdAnchor=_gdTop(me);_gdTAdj=0;
  const tOff=gdTeam(me,'home',offK),tDef=gdTeam(me,'home',defK),t0=userOff?tOff:tDef,t1=userOff?tDef:tOff;
  t0.name=userOff?'Offense':'Defense';t1.name=userOff?'Defense':'Offense';t0.city=me.mascot;t1.city=me.mascot;
  const qk=Object.assign({},offK,{jersey:qc,trim:'#ffffff',num:'#ffffff',sock:'#f2f2f2'});
  const qbPack={helmet:qk.helmet,helmetStripe:qk.hstripe,helmetLogo:qk.hstripe,facemask:qk.mask,jersey:qk.jersey,jerseyTrim:qk.trim,pants:qk.pants,pantsStripe:qk.pstripe,belt:'#1d1d22',socks:qk.sock,sockStripe:qk.trim,cleats:qk.cleat,cleatAccent:qk.trim,gloves:qk.trim,number:qk.num,numberTrim:null,armSleeve:'skin'};
  window.__GP={teams:[t0,t1],home:0,free:true,god:fpGod(),practice:{mode,reps:PRAC_REPS},qbPack,stadium:pracInfo(FP.ptier||FP.tier,FP.store.stadC,me),ez:_gdDark(me.c1||'#1c3766',.25),ezText:'#ffffff'};
  _gdCtx={kind:'free',mode,a:me.id};gdLaunch();
}
function fpFinish(res,ctx){
  const A=fpT(ctx.a),B=ctx.b?fpT(ctx.b):null,pl={};for(const t of[A,B])if(t)for(const p of t.roster)pl[p.id]=Object.assign({team:t},p);
  const lead=(k,lab)=>{let best=null,bv=0;for(const m in res.stats||{}){const v=res.stats[m][k]||0;if(v>bv&&pl[m]){bv=v;best=pl[m];}}return best?`<div style="display:flex;justify-content:space-between;gap:10px;font-size:13px;padding:3px 0"><span>${lab}: #${best.num} ${best.fn} ${best.ln} <span style="color:var(--mu)">${best.team.mascot}</span></span><b>${bv}</b></div>`:'';};
  const title=ctx.mode==='exh'?`Final: ${A.mascot} ${res.score[0]}, ${B?B.mascot:''} ${res.score[1]}`:'Practice complete';
  openMo(`<div style="font-weight:900;font-size:20px;margin-bottom:8px">${title}</div>
    ${lead('passYds','Passing yards')}${lead('rushYds','Rushing yards')}${lead('recYds','Receiving yards')}${lead('tackles','Tackles')}${lead('ints','Interceptions')}
    <div style="font-size:12px;color:var(--mu);margin-top:8px">Free Practice results are not added to any career.</div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px"><button class="bgh" onclick="clo();fpStart()">Play again</button><button class="btn" onclick="clo()">Done</button></div>`);
  fpRender();
}

