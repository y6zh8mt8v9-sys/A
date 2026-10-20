// ═══════════ LOADING SCREEN ═══════════
function showLoading(label,team,steps,cb){
  const scr=document.getElementById('loading-screen');
  const logoW=document.getElementById('loading-logo-wrap');
  const nameEl=document.getElementById('loading-team-name');
  const subEl=document.getElementById('loading-team-sub');
  const lblEl=document.getElementById('loading-label');
  const fill=document.getElementById('loading-bar-fill');
  const pctEl=document.getElementById('loading-pct');
  // Set team identity
  logoW.innerHTML=team?sLogo(team,110):'';
  nameEl.textContent=team?`${team.name} ${team.mascot}`:'';
  subEl.textContent=team?`${team.city||''} · ${team.cls?clsL(team.cls):''} · ${team.conf||''}`:'';
  lblEl.textContent=label||'Loading…';
  fill.style.width='0%';
  fill.style.transition='none';
  pctEl.textContent='0%';
  scr.classList.add('active');
  // Animate bar across steps using setTimeout slices so the browser can repaint
  let step=0;
  const total=steps||10;
  function tick(){
    step++;
    const pct=Math.min(Math.round((step/total)*100),95);
    fill.style.transition='width .18s ease';
    fill.style.width=pct+'%';
    pctEl.textContent=pct+'%';
    if(step<total-1){
      setTimeout(tick,Math.max(35,420/total));
    } else {
      // Run the actual work, then finish bar
      setTimeout(()=>{
        cb();
        fill.style.width='100%';
        pctEl.textContent='100%';
        setTimeout(()=>scr.classList.remove('active'),320);
      },120);
    }
  }
  // First tick after one paint
  requestAnimationFrame(()=>setTimeout(tick,50));
}
function startGame(){
  if(!_selectedOfferTeam){alert('Please click a highlighted county on the map and select a school to accept their offer.');return;}
  const coach=document.getElementById('s-coach').value||'Coach';
  let cls=_selectedOfferTeam.cls;
  let divs=_allClsDivs&&_allClsDivs[cls];
  // v2.16: the offer may point at a league that was rebuilt since the map was drawn: find the school again, or rebuild the map
  if(!divs||!divs.some(d=>d.teams.some(t=>t.id===_selectedOfferTeam.id))){
    const hit=_allClsDivs&&Object.entries(_allClsDivs).find(([c,dv])=>(dv||[]).some(d=>d.teams.some(t=>t.id===_selectedOfferTeam.id&&t.name===_selectedOfferTeam.name)));
    if(hit){cls=hit[0];divs=hit[1];}
    else{try{_allClsDivs=null;initCountyMap();}catch(e){}_selectedOfferTeam=null;alert('The job offers were refreshed. Please pick a school on the map again.');return;}
  }
  let foundDIdx=0,foundSIdx=0;
  for(let d=0;d<divs.length;d++){
    const ti=divs[d].teams.findIndex(t=>t.id===_selectedOfferTeam.id);
    if(ti>=0){foundDIdx=d;foundSIdx=ti;break;}
  }
  _pId=1;
  const pcDraft=pcReadForm();
  const chosenRivals=[..._selectedRivals];
  const team=_selectedOfferTeam;
  showLoading('Building Your Program…',team,18,()=>{
    initGame(coach,divs,foundDIdx,foundSIdx,chosenRivals);
    try{G.world=JSON.parse(JSON.stringify(WORLD||{}));}catch(e){G.world={};}G.world.geo=USA.on?JSON.parse(JSON.stringify(USA.cfg)):{mode:'classic'};
    G.coach=window._coachDraft||null;G.saveId=null;window._coachDraft=null;setTimeout(()=>{try{saveGame(true);}catch(e){}},900);
    document.getElementById('setup').classList.add('hid');
    document.getElementById('app').classList.remove('hid');
    addLog(`<span style="color:var(--te)"> Welcome, ${coach}! ${2026+(G.yr-1)} Season &#8212; ${myS().name} ${myS().mascot}.</span>`);
    checkAndFillRosters();
    _allClsDivs=null;_setupDivs=null;_mapOffers=[];for(const c of MAPC){c.offers=[];} // the setup map's lists: free them
    try{if(pcDraft)pcCreate(pcDraft);}catch(e){console.error('player career',e);}
    nav(G.myPlayerId!=null?'mine':'dash');
    showTutorial();
  });
}
// ═══════════ PLAYER CREATOR (Player Career): who he is, how he looks, what he wears and his starting ratings ═══════════
// Uses the coach creator's screen. Attribute points build a freshman between 40 and 55 overall.
const PCC_PTS=140,PCC_OVR=[40,55],PCC_INT=3,PCC_TR=2,PCC_POS=['QB','RB','WR','TE','OL','DL','LB','CB','S','K'];
let _pcd=null;
function pccOn(){const on=document.getElementById('pc-on');return!!(on&&on.checked);}
function pccMode(pl){const w=_ttEl('coachc');if(!w)return;const h=w.querySelector('.cc-head h2'),l=w.querySelector('.cc-prev-l'),f=w.querySelector('.cc-foot');
  if(h)h.textContent=pl?'Create Your Player':'Create Your Coach';if(l)l.textContent=pl?'Freshman':'Head Coach';
  if(f)f.innerHTML=pl?`<button class="bgh" onclick="pccBack()">Back to offers</button><button class="btn bgn cc-go" onclick="pccStart()">${(document.getElementById('pc-lock')||{}).checked?'Start Career':'Next: your coach'}</button>`
    :`<button class="bgh" onclick="ccBack()">Back to offers</button><button class="btn bgn cc-go" onclick="ccStart()">Start Career</button>`;
  const t=_selectedOfferTeam,tm=_ttEl('cc-team');if(tm&&t)tm.textContent=`${t.name} ${t.mascot}`;}
function pccOpen(){
  const v=id=>(document.getElementById(id)||{}).value||'',clean=t=>String(t).replace(/[<>&"'`]/g,'').trim().slice(0,18);
  if(!_pcd){_pcd={fn:clean(v('pc-fn'))||'Jordan',ln:clean(v('pc-ln'))||'Player',pos:PCC_POS.includes(v('pc-pos'))?v('pc-pos'):'WR',num:clamp(parseInt(v('pc-num'),10)||1,0,99),
    fs:Math.floor(Math.random()*1e9),look:{},eq:null,ints:[],traits:[]};pccReset();}
  _ttEl('coachc').classList.remove('hid');pccMode(true);pccRender();window.scrollTo(0,0);}
function pccBack(){try{_pcd.eq=eqRead()||_pcd.eq;}catch(e){}_ttEl('coachc').classList.add('hid');}
// starting ratings: a 40 overall freshman at his position; the points go on top
function pccReset(){const d=_pcd,q={id:700000+Math.floor(Math.random()*99999),pos:d.pos,rat:PCC_OVR[0],spd:PCC_OVR[0],str:PCC_OVR[0],awr:PCC_OVR[0],yr:9,traits:[]};
  genAttrs(q);attrShift(q,PCC_OVR[0]);const a=Object.assign({},q.at);for(const k of ATOP)a[k]=q[k];
  d.base=a;d.at=Object.assign({},a);d.pts=PCC_PTS;d.arch=(ARCHETYPES[d.pos]||[null])[0];
  const[h,w]=hsMean(d.pos,9),L=HS_LIM[d.pos]||HS_LIM.WR;d.ht=clamp(Math.round(h),L[0],L[1]);d.wt=clamp(Math.round(w),L[2],L[3]);d.eq=null;}
function pccOvr(){const d=_pcd;return ovrCalc({pos:d.pos,at:d.at,spd:d.at.spd,str:d.at.str,awr:d.at.awr,rat:PCC_OVR[0]});}
function pccKeys(){const W=OVR_W[_pcd.pos]||OVR_W.WR,ks=Object.keys(W).sort((a,b)=>W[b]-W[a]);for(const k of['spd','str','sta'])if(!ks.includes(k))ks.push(k);return ks;}
function pccP(){const d=_pcd;return{id:0,pos:d.pos,num:d.num,fs:d.fs,eq:d.eq,ht:d.ht,wt:d.wt,fn:d.fn,ln:d.ln,sId:null};}
function pccSet(k,v){const d=_pcd;
  if(k==='pos'){if(v===d.pos)return;try{d.eq=eqRead()||d.eq;}catch(e){}d.pos=v;pccReset();pccRender();return;}
  if(k==='ht'||k==='wt'){d[k]=+v;const el=document.getElementById('pcc-'+k+'v');if(el)el.textContent=k==='ht'?htf(+v):v+' lb';return;}
  d[k]=v;if(k==='arch')pccRender('top');}
function pccTog(list,k,max){const d=_pcd,a=d[list],i=a.indexOf(k);if(i>=0)a.splice(i,1);else{if(a.length>=max){notify(`Pick up to ${max}`,'w');return;}a.push(k);}pccRender(list);}
function pccLook(k,v){const d=_pcd;if(v===''||v==null)delete d.look[k];else d.look[k]=k==='ti'||k==='hs'?+v:v;pccRender('look');}
function pccAdj(k,dv){const d=_pcd,v=d.at[k];
  if(dv>0){if(d.pts<=0||v>=85)return;d.at[k]=v+1;if(pccOvr()>PCC_OVR[1]){d.at[k]=v;notify(`A freshman tops out at ${PCC_OVR[1]} overall`,'w');return;}d.pts--;}
  else{if(v<=d.base[k])return;d.at[k]=v-1;d.pts++;}
  pccRender('at');}
function pccAuto(){const d=_pcd;d.at=Object.assign({},d.base);d.pts=PCC_PTS;const W=OVR_W[d.pos]||OVR_W.WR,ks=Object.keys(W).sort((a,b)=>W[b]-W[a]);
  for(let i=0;i<500&&d.pts>0;i++){const k=ks[i%Math.min(6,ks.length)];if(d.at[k]>=85)continue;d.at[k]++;if(pccOvr()>PCC_OVR[1]){d.at[k]--;break;}d.pts--;}pccRender('at');}
function pccFace(){const d=_pcd,t=_selectedOfferTeam||{};window._lkRaw=true;try{return face(d.fs,230,Object.assign({},d.look,{c1:t.c1,c2:t.c2}));}finally{window._lkRaw=false;}}
function pccRender(part){
  const d=_pcd,fe=_ttEl('cc-face'),fm=_ttEl('cc-form');if(!fe||!fm)return;window._eqPid='pcd';
  if(part!=='at'&&part!=='ints'&&part!=='traits')fe.innerHTML=pccFace();
  const seg=(on,click,txt,tip)=>`<button class="cc-seg${on?' on':''}" onclick="${click}"${tip?` title="${tip}"`:''}>${txt}</button>`;
  const top=()=>{const L=HS_LIM[d.pos]||HS_LIM.WR,A=ARCHETYPES[d.pos]||[];return`
   <div class="cc-row2"><label>First name<input value="${d.fn.replace(/"/g,'&quot;')}" maxlength="18" oninput="_pcd.fn=this.value.replace(/[<>&&quot;'\x60]/g,'').slice(0,18)"></label><label>Last name<input value="${d.ln.replace(/"/g,'&quot;')}" maxlength="18" oninput="_pcd.ln=this.value.replace(/[<>&&quot;'\x60]/g,'').slice(0,18)"></label></div>
   <div class="cc-row2"><label>Position<select onchange="pccSet('pos',this.value)">${PCC_POS.map(x=>`<option${x===d.pos?' selected':''}>${x}</option>`).join('')}</select></label><label>Jersey #<input type="number" min="0" max="99" value="${d.num}" oninput="_pcd.num=clamp(parseInt(this.value,10)||0,0,99)"></label></div>
   ${A.length?`<div class="cc-lbl">Archetype</div><div class="cc-segs">${A.map(a=>seg(a===d.arch,`pccSet('arch','${a}')`,a)).join('')}</div>`:''}
   <div class="cc-row2"><label>Height <b id="pcc-htv">${htf(d.ht)}</b><input type="range" min="${L[0]}" max="${L[1]}" value="${d.ht}" oninput="pccSet('ht',this.value)"></label><label>Weight <b id="pcc-wtv">${d.wt} lb</b><input type="range" min="${L[2]}" max="${L[3]}" value="${d.wt}" oninput="pccSet('wt',this.value)"></label></div>`;};
  const ints=()=>`<div class="cc-lbl">Interests <span style="font-weight:600;color:var(--mu)">(${d.ints.length}/${PCC_INT})</span></div><div class="cc-segs">${INTERESTS.map(t=>seg(d.ints.includes(t.k),`pccTog('ints','${t.k}',${PCC_INT})`,t.l)).join('')}</div>`;
  const trs=()=>`<div class="cc-lbl">Character traits <span style="font-weight:600;color:var(--mu)">(${d.traits.length}/${PCC_TR})</span></div><div class="cc-segs">${TRAITS.map(t=>seg(d.traits.includes(t.k),`pccTog('traits','${t.k}',${PCC_TR})`,t.l,t.d)).join('')}</div>
    <div style="font-size:11px;color:var(--mu);margin-top:4px">${d.traits.map(k=>{const t=TRAITS.find(x=>x.k===k);return t?`<b>${t.l}</b>: ${t.d}`:'';}).join(' · ')||'Hover or long-press a trait to see what it does.'}</div>`;
  const look=()=>{const L=d.look,sw=(k,arr,cur)=>arr.map((c,i)=>{const v=k==='ti'?i:c;return`<button class="cc-sw${String(cur)===String(v)?' on':''}" style="background:${c}" onclick="pccLook('${k}','${v}')" aria-label="${c}"></button>`;}).join('');
    return`<div class="cc-lbl">Skin tone</div><div class="cc-sws">${sw('ti',FACE_SKIN,L.ti)}</div>
     <div class="cc-row2"><label>Hairstyle<select onchange="pccLook('hs',this.value)"><option value="">Random</option>${CC_HAIR.map(([v,l])=>`<option value="${v}"${String(L.hs)===String(v)?' selected':''}>${l}</option>`).join('')}</select></label>
     <label>Facial hair<select onchange="pccLook('fh',this.value)"><option value="">Random</option>${CC_FH.map(([v,l])=>`<option value="${v}"${L.fh===v?' selected':''}>${l}</option>`).join('')}</select></label></div>
     <div class="cc-lbl">Hair color</div><div class="cc-sws">${sw('hc',CC_HC,L.hc)}</div>
     <div class="cc-lbl">Eye color</div><div class="cc-sws">${sw('eye',CC_EYE,L.eye)}</div>
     <div class="cc-segs" style="margin-top:8px"><button class="cc-seg" onclick="_pcd.fs=Math.floor(Math.random()*1e9);_pcd.look={};pccRender('look')">Randomize look</button></div>`;};
  const at=()=>{const o=pccOvr();return`<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:4px 0 8px"><div style="font-family:'Barlow Condensed',sans-serif;font-size:30px;font-weight:900;color:${o>=PCC_OVR[1]?'var(--gd)':'var(--te)'}">${o} OVR</div>
     <div style="font-size:12px;color:var(--mu);flex:1;min-width:160px"><b style="color:var(--tx)">${d.pts}</b> attribute points left · overall ${PCC_OVR[0]} to ${PCC_OVR[1]} max</div><button class="cc-seg" onclick="pccAuto()">Auto-build</button><button class="cc-seg" onclick="_pcd.at=Object.assign({},_pcd.base);_pcd.pts=PCC_PTS;pccRender('at')">Reset</button></div>
     <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:4px 14px">${pccKeys().map(k=>{const v=d.at[k],b=d.base[k],W=OVR_W[d.pos]||{};return`<div style="display:flex;align-items:center;gap:6px;font-size:13px"><span style="flex:1">${AN[k]||k}${W[k]?' <span style="color:var(--te);font-size:10px">●</span>':''}</span>
       <button class="bgh bxs" style="min-width:28px" onclick="pccAdj('${k}',-1)" ${v<=b?'disabled':''}>−</button><b style="width:26px;text-align:center;color:${v>b?'var(--gn)':'var(--tx)'}">${v}</b><button class="bgh bxs" style="min-width:28px" onclick="pccAdj('${k}',1)" ${d.pts<=0||v>=85?'disabled':''}>+</button></div>`;}).join('')}</div>
     <div style="font-size:11px;color:var(--mu);margin-top:6px">● counts toward your overall at ${d.pos}. After that he grows through XP and skill points earned in games (My Player tab).</div>`;};
  if(!part||part==='top'){
    fm.innerHTML=`<div id="pcc-top">${top()}</div><div id="pcc-ints">${ints()}</div><div id="pcc-traits">${trs()}</div>
     <div class="cc-lbl" style="margin-top:14px;font-size:14px">Look</div><div id="pcc-look">${look()}</div>
     <div class="cc-lbl" style="margin-top:14px;font-size:14px">Accessories</div><div id="pcc-eq">${eqEditorHtml(pccP())}</div>
     <div class="cc-lbl" style="margin-top:14px;font-size:14px">Attributes</div><div id="pcc-at">${at()}</div>`;
    if(d.eq)try{eqSetForm(d.eq);}catch(e){}setTimeout(()=>{try{eqPrev();}catch(e){}},30);return;}
  const box=document.getElementById('pcc-'+part);if(!box)return;
  box.innerHTML=part==='ints'?ints():part==='traits'?trs():part==='look'?look():part==='at'?at():'';
  if(part==='look')setTimeout(()=>{try{eqPrev();}catch(e){}},30);}
// the accessory preview: the same Game Day sprites, in the colors of the school you picked
function pccPrev(){const cv=document.getElementById('eq-cv'),d=_pcd;if(!cv||!d)return;const s=_selectedOfferTeam||{c1:'#1d3557',c2:'#ffffff'},e=eqRead()||eqDefault(pccP());
  eqLib().then(lib=>{if(!document.body.contains(cv))return;const x=cv.getContext('2d');x.clearRect(0,0,cv.width,cv.height);x.imageSmoothingEnabled=false;
    const build=(d.pos==='OL'||(d.pos==='DL'&&d.wt>=275))?'line':(['TE','LB','DL'].includes(d.pos)?'big':'skill'),sh='player_'+build;
    const ti=d.look.ti!=null?d.look.ti:Math.max(0,FACE_SKIN.indexOf(faceSkinHex(d.fs))),sp=lib.lite(sh,gdPackOf(s,'home'),Math.round(ti*5/7)),eq=eqResolve(e,s);{const u=uniOf(s,'home');eq.helm={shell:u.hShell||'gloss',stripe:u.hStripe||'team',mask:''};}if(d.pos==='QB'){eq.noGlove=true;eq.glove=null;}
    [['idle',0,false],['run',2,true],['stance_qb',0,false],[sp.has('stand_back')?'stand_back':'run_back',0,false]].forEach(([an,f,fl],i)=>{if(!sp.has(an))return;sp.draw(x,an,f,46+i*80,200,3,3,fl,d.num,eq);});
  }).catch(()=>{});}
function pccStart(){const d=_pcd;if(!d)return;try{d.eq=eqRead()||d.eq;}catch(e){}
  d.fn=(d.fn||'').trim()||'Jordan';d.ln=(d.ln||'').trim()||'Player';
  {const f=document.getElementById('pc-fn'),l=document.getElementById('pc-ln'),ps=document.getElementById('pc-pos'),n=document.getElementById('pc-num');if(f)f.value=d.fn;if(l)l.value=d.ln;if(ps)ps.value=d.pos;if(n)n.value=d.num;}
  if((document.getElementById('pc-lock')||{}).checked){
    // Player Career mode: the school already has a head coach, you only create yourself
    ccRand(false);const fn=_cc.first,ln=_cc.last;_ttEl('s-coach').value='Coach '+ln;
    window._coachDraft={name:'Coach '+ln,first:fn,last:ln,full:fn+' '+ln,age:_cc.age,bg:_cc.bg,seed:_cc.seed,look:Object.assign({},_cc.look),hiredYr:1};
    _ttEl('coachc').classList.add('hid');_ttEl('cc-face').innerHTML='';
    try{startGame();}catch(err){console.error(err);alert('The game could not start: '+err.message);}return;}
  window._pccDone=true;openCoachCreator();}
