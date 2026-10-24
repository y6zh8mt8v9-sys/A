// ═══════════ PLAYER EQUIPMENT (towel, gloves, cleats, mouthpiece, sleeves, bands, undershirts) ═══════════
const EQ_COLORS=[['c1','Team primary'],['c2','Team secondary'],['#ffffff','White'],['#16181d','Black'],['#8d939b','Gray'],['#c8102e','Red'],['#1d4fb8','Blue'],['#3fd0ff','Light blue'],['#f2b632','Gold'],['#ff7a1a','Orange'],['#39e639','Neon green'],['#ff5fa8','Pink'],['#6b2fb8','Purple']];
const EQ_SLEEVE=[['none','None'],['one','One arm (near side)'],['onefar','One arm (far side)'],['both','Both arms']];
const EQ_BAND=[['none','None'],['wrist1','One wrist (near side)'],['wrist1f','One wrist (far side)'],['wrist2','Both wrists'],['bicep1','One bicep (near side)'],['bicep1f','One bicep (far side)'],['bicep','Both biceps']];
const EQ_UNDER=[['none','None'],['long','Long sleeve'],['quarter','Quarter sleeve'],['jamo','Baggy (untucked)']];
function eqDefault(p){
  const id=p.id!=null?p.id:(p.fs||0),h=n=>((id*2654435761+n*40503)>>>0)%1000/1000,pos=p.pos||'WR',skill=['QB','RB','WR','TE','CB','S'].includes(pos),line=pos==='OL'||pos==='DL';
  const pick=(a,r)=>a[Math.floor(r*a.length)%a.length];
  const e={towel:false,towelC:'#ffffff',glove:'',cleat:'',mouth:'',sleeve:'none',sleeveC:'#16181d',band:'none',bandC:'#ffffff',under:'none',underC:'#8d939b',pants:'knee',socks:'high',visor:'',legS:'none',legSC:'#16181d',crop:false,hShell:'gloss',hStripe:'team',hMask:'',mouth2:'',ski:'',gcap:''};
  if(h(21)<(['WR','CB','S','RB','LB'].includes(pos)?0.22:pos==='QB'?0.12:0.08))e.visor=pick(['smoke','smoke','black','clear','gold','blue'],h(22));
  if(h(23)<(skill?0.14:0.05)){e.legS=h(24)<0.55?'one':'both';e.legSC=pick(['#16181d','#ffffff','c1'],h(25));}
  if(['WR','RB','CB','S','LB'].includes(pos)&&h(26)<0.14)e.crop=true;
  if(skill&&h(17)<0.18)e.pants='short';{const r=h(18);e.socks=r<(line?0.85:0.62)?'high':r<(line?0.95:0.88)?'low':'none';}
  if(h(1)<(pos==='QB'?0.45:pos==='RB'||pos==='WR'?0.32:line?0.12:0.15)){e.towel=true;e.towelC=h(2)<0.8?'#ffffff':'c1';}
  if(pos!=='QB'&&pos!=='K'&&h(3)<(skill?0.62:0.45))e.glove=pick(['c1','c2','#ffffff','#16181d'],h(4));
  if(h(5)<0.5)e.cleat=pick(['#ffffff','#16181d','c1','#ffffff'],h(6));
  if(pos!=='QB'&&h(7)<0.28){e.mouth=pick(['c1','#ffffff','#16181d','#ff5fa8','#39e639','#f2b632'],h(8));if(h(27)<0.12)e.mouth2=pick(['c1','#ffffff','#16181d','#ff5fa8'],h(28));}
  if(h(29)<0.025)e.ski=pick(['#16181d','#16181d','c1','#ffffff'],h(30));
  if(h(9)<(skill?0.24:0.06)){e.sleeve=h(10)<0.6?'one':'both';e.sleeveC=pick(['#16181d','#ffffff','c1'],h(11));}
  if(h(12)<0.3){e.band=pick(['wrist2','wrist2','wrist1','bicep'],h(13));e.bandC=pick(['#ffffff','c1','#16181d'],h(14));}
  {const r=h(15);if(r<(line?0.16:0.1))e.under='long';else if(r<(line?0.36:0.24))e.under='quarter';else if(r<0.32&&['WR','CB','S','RB'].includes(pos))e.under='jamo';
    if(e.under!=='none')e.underC=e.under==='jamo'?pick(['#8d939b','#8d939b','#16181d','#ffffff'],h(16)):pick(['#16181d','#ffffff','#8d939b','c1'],h(16));}
  return e;
}
function eqOf(p){return Object.assign(eqDefault(p),(p&&p.eq)||{});}
const EQ_VISOR={clear:'#a9bccd',smoke:'#3a414c',black:'#14171c',gold:'#d9a520',blue:'#2f7fe0',red:'#d8452f',purple:'#7b45d8'};
function eqCol(c,s){return c==='c1'?(s&&s.c1)||'#1d3557':c==='c2'?(s&&s.c2)||'#ffffff':c;}
function eqResolve(e,s){if(!e)return null;const C=c=>eqCol(c,s);
  return{glove:e.glove?C(e.glove):null,cleat:e.cleat?C(e.cleat):null,towel:e.towel?C(e.towelC||'#ffffff'):null,mouth:e.mouth?C(e.mouth):null,mouth2:e.mouth2?C(e.mouth2):null,ski:e.ski?C(e.ski):null,gcap:e.gcap?C(e.gcap):null,
    helm:{shell:'gloss',stripe:'team',mask:''}, // the helmet is the team's (Customize → Uniforms)
    pants:e.pants||'knee',socks:e.socks||'high',visor:e.visor?EQ_VISOR[e.visor]||null:null,legS:{mode:e.legS||'none',c:C(e.legSC||'#16181d')},crop:!!e.crop,sleeve:{mode:e.sleeve||'none',c:C(e.sleeveC||'#16181d')},band:{mode:e.band||'none',c:C(e.bandC||'#ffffff')},under:{mode:e.under||'none',c:C(e.underC||'#8d939b')}};}
function eqDesc(e){const o=[];if(e.towel)o.push('towel');if(e.glove)o.push('gloves');if(e.mouth)o.push(e.mouth2?'two mouthpieces':'mouthpiece');if(e.ski)o.push('ski mask');if(e.gcap)o.push('guardian cap');if(e.sleeve!=='none')o.push(e.sleeve==='both'?'arm sleeves':'arm sleeve');
  if(e.band!=='none')o.push(e.band==='bicep'?'bicep bands':'wristbands');if(e.under!=='none')o.push({long:'long-sleeve',quarter:'quarter-sleeve',jamo:'Baggy'}[e.under]+' undershirt');if(e.cleat)o.push('custom cleats');if(e.visor)o.push(e.visor+' visor');if(e.legS&&e.legS!=='none')o.push(e.legS==='one'?'leg sleeve':'leg sleeves');if(e.crop)o.push('cropped jersey');if(e.pants==='short')o.push('pants above the knee');if(e.socks==='low')o.push('low socks');if(e.socks==='none')o.push('no socks');return o.join(' · ')||'standard uniform';}
// colour picker: presets plus any custom colour
function eqColHtml(id,val,none){const pre=EQ_COLORS.some(c=>c[0]===val)||(none&&!val);const hex=/^#/.test(val||'')?val:'#ffffff';
  return`<span style="display:inline-flex;gap:4px;align-items:center"><select class="ei" id="${id}" onchange="eqPrev()" style="width:auto;min-width:0;padding:4px 6px">${none?`<option value=""${!val?' selected':''}>${none}</option>`:''}${EQ_COLORS.map(([v,l])=>`<option value="${v}"${v===val?' selected':''}>${l}</option>`).join('')}<option value="custom"${pre?'':' selected'}>Custom…</option></select><input type="color" id="${id}-x" value="${hex}" oninput="document.getElementById('${id}').value='custom';eqPrev()" style="width:34px;height:30px;padding:0;border:0;background:none"></span>`;}
function eqColRead(id){const s=document.getElementById(id);if(!s)return'';return s.value==='custom'?document.getElementById(id+'-x').value:s.value;}
function eqSel(id,list,val){return`<select class="ei" id="${id}" onchange="eqPrev()" style="width:auto;min-width:0;padding:4px 6px">${list.map(([v,l])=>`<option value="${v}"${v===val?' selected':''}>${l}</option>`).join('')}</select>`;}
function lookEditorHtml(p){
  window._lkSeed=p.fs;const L=lookOf(p.fs)||{},opt=(arr,cur)=>`<option value="">Original</option>`+arr.map(([v,l])=>`<option value="${v}" ${String(cur)===String(v)?'selected':''}>${l}</option>`).join('');
  const sw=(id,cols,cur)=>`<div style="display:flex;gap:5px;flex-wrap:wrap" id="${id}" data-v="${cur==null?'':cur}"><button type="button" class="bgh bxs" style="padding:2px 8px" onclick="lookPick('${id}','')">Original</button>${cols.map((c,i)=>{const v=id==='lk-ti'?i:c;return`<button type="button" title="${c}" onclick="lookPick('${id}','${v}')" style="width:24px;height:24px;border-radius:50%;background:${c};cursor:pointer;border:2px solid ${String(cur)===String(v)?'var(--ac)':'rgba(0,0,0,.2)'}"></button>`;}).join('')}</div>`;
  return`<div class="pnl" style="margin-top:10px"><div class="ph">Face</div><div class="pb" style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start">
    <div id="lk-prev" style="width:84px;height:84px;flex:0 0 auto">${face(p.fs,84)}</div>
    <div style="flex:1;min-width:220px;display:grid;gap:8px">
      <div><div style="font-size:12px;color:var(--mu);margin-bottom:3px">Skin tone</div>${sw('lk-ti',FACE_SKIN,L.ti)}</div>
      <div><div style="font-size:12px;color:var(--mu);margin-bottom:3px">Hair color</div>${sw('lk-hc',CC_HC,L.hc)}</div>
      <div><div style="font-size:12px;color:var(--mu);margin-bottom:3px">Eye color</div>${sw('lk-eye',CC_EYE,L.eye)}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <label style="font-size:12px;color:var(--mu)">Hairstyle<br><select class="ei" id="lk-hs" onchange="lookPrev()">${opt(CC_HAIR,L.hs)}</select></label>
        <label style="font-size:12px;color:var(--mu)">Facial hair<br><select class="ei" id="lk-fh" onchange="lookPrev()">${opt(CC_FH,L.fh)}</select></label></div>
    </div></div></div>`;}
function lookPick(id,v){const el=document.getElementById(id);if(!el)return;el.dataset.v=v;
  el.querySelectorAll('button[title]').forEach(b=>{const bv=id==='lk-ti'?String(FACE_SKIN.indexOf(b.title)):b.title;b.style.borderColor=bv===String(v)?'var(--ac)':'rgba(0,0,0,.2)';});lookPrev();}
function lookForm(){const g=id=>{const el=document.getElementById(id);return el?(el.dataset.v!=null&&el.tagName!=='SELECT'?el.dataset.v:el.value):'';};
  const L={},ti=g('lk-ti'),hc=g('lk-hc'),eye=g('lk-eye'),hs=g('lk-hs'),fh=g('lk-fh');
  if(ti!=='')L.ti=+ti;if(hc)L.hc=hc;if(eye)L.eye=eye;if(hs!=='')L.hs=+hs;if(fh)L.fh=fh;return L;}
function lookPrev(){const el=document.getElementById('lk-prev');if(!el)return;
  const L=lookForm();window._lkRaw=true;try{el.innerHTML=face(window._lkSeed,84,Object.keys(L).length?L:null);}finally{window._lkRaw=false;}}
function lookRead(p,store){if(!document.getElementById('lk-ti'))return;const L=lookForm();
  if(!store){G.looks=G.looks||{};store=G.looks;}
  if(p.fs==null)p.fs=Math.floor(Math.random()*1e9);
  if(Object.keys(L).length)store[p.fs]=L;else delete store[p.fs];}
function eqEditorHtml(p){const e=eqOf(p),row=(l,a)=>`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px"><span style="width:92px;font-size:12px;color:var(--mu);font-weight:700">${l}</span>${a}</div>`;
  return`<div class="fg" style="margin-top:10px"><label>Equipment</label>
    <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start">
      <div style="flex:1 1 300px">
        ${row('Towel',eqSel('eq-tw',[['0','None'],['1','Tucked in waist']],e.towel?'1':'0')+eqColHtml('eq-twc',e.towelC))}
        ${row('Gloves',eqColHtml('eq-gl',e.glove,'Uniform default'))}
        ${row('Cleats',eqColHtml('eq-cl',e.cleat,'Uniform default'))}
        ${row('Mouthpiece',eqColHtml('eq-mo',e.mouth,'None'))}
        ${row('2nd mouthpiece',eqColHtml('eq-mo2',e.mouth2||'','None'))}
        ${row('Ski mask',eqColHtml('eq-sk',e.ski||'','None'))}
        ${row('Guardian cap',eqColHtml('eq-gc',e.gcap||'','None'))}
        ${row('Arm sleeves',eqSel('eq-sl',EQ_SLEEVE,e.sleeve)+eqColHtml('eq-slc',e.sleeveC))}
        ${row('Arm bands',eqSel('eq-bd',EQ_BAND,e.band)+eqColHtml('eq-bdc',e.bandC))}
        ${row('Undershirt',eqSel('eq-un',EQ_UNDER,e.under)+eqColHtml('eq-unc',e.underC))}
        ${row('Pants',eqSel('eq-pa',[['knee','At the knee'],['short','Above the knee']],e.pants||'knee'))}
        ${row('Socks',eqSel('eq-so',[['high','High'],['low','Low'],['none','No socks']],e.socks||'high'))}
        ${row('Leg sleeves',eqSel('eq-ls',[['none','None'],['one','One leg (near side)'],['onefar','One leg (far side)'],['both','Both legs']],e.legS||'none')+eqColHtml('eq-lsc',e.legSC||'#16181d'))}
        ${row('Visor',eqSel('eq-vi',[['','None'],['clear','Clear'],['smoke','Smoke'],['black','Black'],['gold','Gold mirror'],['blue','Blue mirror'],['red','Red mirror'],['purple','Purple mirror']],e.visor||''))}
        ${row('Jersey',eqSel('eq-cr',[['0','Regular'],['1','Cropped (undershirt / back plate shows)']],e.crop?'1':'0'))}
        <div style="font-size:11px;color:var(--mu);margin:2px 0 6px 100px">Helmet and facemask are the same for the whole team: Team → Customize → Uniforms.</div>
        ${p.pos==='QB'?'<div style="font-size:11px;color:var(--mu);margin:-2px 0 6px 100px">Quarterbacks throw bare-handed (no gloves in Game Day).</div>':''}
        <button class="bgh bxs" onclick="eqRandom(${p.id})">Randomize</button> <button class="bgh bxs" onclick="eqClear()">Plain</button></div>
      <div style="flex:0 0 auto;text-align:center"><canvas id="eq-cv" width="330" height="210" style="width:330px;max-width:100%;height:auto;border-radius:10px;background:linear-gradient(#2f7d33,#25692a);image-rendering:pixelated"></canvas>
        <div style="font-size:11px;color:var(--mu)">Shows on the field in Game Day</div></div></div></div>`;}
function eqRead(){const g=id=>document.getElementById(id);if(!g('eq-tw'))return null;
  return{towel:g('eq-tw').value==='1',towelC:eqColRead('eq-twc')||'#ffffff',glove:eqColRead('eq-gl'),cleat:eqColRead('eq-cl'),mouth:eqColRead('eq-mo'),
    sleeve:g('eq-sl').value,sleeveC:eqColRead('eq-slc')||'#16181d',band:g('eq-bd').value,bandC:eqColRead('eq-bdc')||'#ffffff',under:g('eq-un').value,underC:eqColRead('eq-unc')||'#8d939b',pants:g('eq-pa')?g('eq-pa').value:'knee',socks:g('eq-so')?g('eq-so').value:'high',legS:g('eq-ls')?g('eq-ls').value:'none',legSC:eqColRead('eq-lsc')||'#16181d',visor:g('eq-vi')?g('eq-vi').value:'',crop:g('eq-cr')?g('eq-cr').value==='1':false,hShell:g('eq-hs')?g('eq-hs').value:'gloss',hStripe:g('eq-ht')?g('eq-ht').value:'team',hMask:eqColRead('eq-hm')||'',mouth2:g('eq-mo2')?eqColRead('eq-mo2'):'',ski:g('eq-sk')?eqColRead('eq-sk'):'',gcap:g('eq-gc')?eqColRead('eq-gc'):''};}
function eqSetForm(e){const g=id=>document.getElementById(id),sc=(id,v)=>{const s=g(id);if(!s)return;if([...s.options].some(o=>o.value===v))s.value=v;else{s.value='custom';g(id+'-x').value=v;}};
  g('eq-tw').value=e.towel?'1':'0';sc('eq-twc',e.towelC);sc('eq-gl',e.glove);sc('eq-cl',e.cleat);sc('eq-mo',e.mouth);g('eq-sl').value=e.sleeve;sc('eq-slc',e.sleeveC);g('eq-bd').value=e.band;sc('eq-bdc',e.bandC);g('eq-un').value=e.under;sc('eq-unc',e.underC);if(g('eq-pa'))g('eq-pa').value=e.pants||'knee';if(g('eq-so'))g('eq-so').value=e.socks||'high';if(g('eq-ls'))g('eq-ls').value=e.legS||'none';sc('eq-lsc',e.legSC||'#16181d');if(g('eq-vi'))g('eq-vi').value=e.visor||'';if(g('eq-cr'))g('eq-cr').value=e.crop?'1':'0';if(g('eq-hs'))g('eq-hs').value=e.hShell||'gloss';if(g('eq-ht'))g('eq-ht').value=e.hStripe||'team';sc('eq-hm',e.hMask||'');sc('eq-mo2',e.mouth2||'');sc('eq-sk',e.ski||'');sc('eq-gc',e.gcap||'');eqPrev();}
function eqRandom(pid){const p=window._eqPid==='pcd'&&_pcd?pccP():getP(pid);if(!p)return;const q=Object.assign({},p,{id:(p.id||1)*7+Math.floor(Math.random()*9999),eq:null});eqSetForm(eqDefault(q));}
function eqClear(){eqSetForm({towel:false,towelC:'#ffffff',glove:'',cleat:'',mouth:'',sleeve:'none',sleeveC:'#16181d',band:'none',bandC:'#ffffff',under:'none',underC:'#8d939b',pants:'knee',socks:'high',visor:'',legS:'none',legSC:'#16181d',crop:false,hShell:'gloss',hStripe:'team',hMask:'',mouth2:'',ski:'',gcap:''});}
// the same pixel sprites as Game Day, loaded once from the embedded game for the preview
let _eqLibP=null;
function eqLib(){
  if(_eqLibP)return _eqLibP;
  _eqLibP=new Promise((res,rej)=>{try{
    if(window.GridironSprites&&window._eqLibReady)return res(window._eqLibReady);
    const src=document.getElementById('gd-src');if(!src)return rej('no game');const BS=String.fromCharCode(92),html=src.textContent.split('<'+BS+'/').join('</').split('<'+BS+'!--').join('<!--');
    const a=html.indexOf('<script>/*!'),b=html.indexOf('</'+'script>',a);if(a<0||b<0)return rej('no sprites');(0,eval)(html.slice(a+8,b));
    window.GridironSprites.load().then(lib=>{for(const sh of['player_skill','player_big','player_line'])try{lib.improveHelmets(sh);}catch(e){}window._eqLibReady=lib;res(lib);}).catch(rej);
  }catch(e){rej(e);}});
  _eqLibP.catch(()=>{_eqLibP=null;});return _eqLibP;
}
function gdPackOf(s,kind){const u=uniOf(s,kind||'home'),kit=Object.assign({glove:u.trim,sleeve:u.jersey},u);
  return{helmet:kit.helmet,helmetStripe:kit.hstripe,helmetLogo:kit.hstripe,facemask:kit.mask,jersey:kit.jersey,jerseyTrim:kit.trim,pants:kit.pants,pantsStripe:kit.pstripe,belt:'#1d1d22',socks:kit.sock,sockStripe:kit.trim,cleats:kit.cleat,cleatAccent:kit.trim,gloves:kit.glove,number:kit.num,numberTrim:_gdLum(kit.jersey)>.6?null:'#f4f4f4',armSleeve:'skin'};}
function eqPrev(){
  if(window._eqPid==='pcd'){pccPrev();return;}
  const cv=document.getElementById('eq-cv');if(!cv)return;const p=getP(window._eqPid);if(!p)return;const e=eqRead()||eqOf(p),s=getS(p.sId)||myS();
  eqLib().then(lib=>{if(!document.body.contains(cv))return;const x=cv.getContext('2d');x.clearRect(0,0,cv.width,cv.height);x.imageSmoothingEnabled=false;
    const build=(p.pos==='OL'||(p.pos==='DL'&&(p.wt||0)>=275))?'line':(['TE','LB','DL'].includes(p.pos)?'big':'skill'),sh='player_'+build;
    const sk=Math.round(Math.max(0,FACE_SKIN.indexOf(faceSkinHex(p.fs!=null?p.fs:p.id)))*5/7),sp=lib.lite(sh,gdPackOf(s,'home'),sk),eq=eqResolve(e,s);{const u=uniOf(s,'home');eq.helm={shell:u.hShell||'gloss',stripe:u.hStripe||'team',mask:''};}if(p.pos==='QB'){eq.noGlove=true;eq.glove=null;}
    const shows=[['idle',0,false],['run',2,true],['stance_qb',0,false],[sp.has('stand_back')?'stand_back':'run_back',0,false]];
    shows.forEach(([an,f,fl],i)=>{if(!sp.has(an))return;sp.draw(x,an,f,46+i*80,200,3,3,fl,p.num,eq);});
  }).catch(()=>{const x=cv.getContext('2d');x.fillStyle='#fff';x.font='12px sans-serif';x.fillText('Preview unavailable',90,95);});
}
function editPlayer(pid){
  const p=getP(pid);if(!p)return;window._eqPid=pid;setTimeout(earnedLock,0);
  openMo(`<h2>Edit: ${p.fn} ${p.ln}</h2>
  <div class="g2" style="gap:10px;margin-top:8px">
    <div class="fg"><label>First Name</label><input class="ei" id="ef" value="${p.fn}"></div>
    <div class="fg"><label>Last Name</label><input class="ei" id="el" value="${p.ln}"></div>
    <div class="fg"><label>Jersey #</label><input class="ei" type="number" id="en" value="${p.num}" min="0" max="99"></div>
    <div class="fg"><label>Position</label><select class="ei" id="ep">${POS.map(ps=>`<option value="${ps}" ${ps===p.pos?'selected':''}>${ps}</option>`).join('')}</select></div>
    <div class="fg"><label>Two-way: also plays</label><select class="ei" id="ep2"><option value="">Nothing else</option>${POS.filter(ps=>ps!=='K').map(ps=>`<option value="${ps}" ${ps===p.pos2?'selected':''}>${ps}</option>`).join('')}</select></div>
    <div class="fg"><label>Overall (change it to scale every skill)</label><input class="ei" type="number" id="er" value="${p.rat}" min="1" max="99"></div>
    <div class="fg"><label>Potential</label><input class="ei" type="number" id="ept" value="${p.pot}" min="1" max="99"></div>
    <details style="grid-column:1/-1" open><summary style="cursor:pointer;font-weight:700;font-size:13px">Attributes · overall from these: <span id="at-ovr" style="color:var(--gn)">${(ovrSync(p),p.rat)}</span></summary>
      <div style="font-size:11px;color:var(--mu);margin:4px 0 6px">The overall is a weighted blend of the skills that matter for his position (the % next to each one). Change any skill and the overall follows.</div>
      <div class="g2" style="gap:6px 12px">${attrPanel(p,true)}</div></details>
    <div class="fg"><label>GPA</label><input class="ei" type="number" id="eg" value="${p.gpa}" min="1.5" max="4.0" step="0.1"></div>
    <div class="fg"><label>Height</label><div style="display:flex;gap:6px;align-items:center"><input class="ei" type="number" id="eht-ft" value="${Math.floor((p.ht||72)/12)}" min="4" max="7" style="width:64px"> ft <input class="ei" type="number" id="eht-in" value="${(p.ht||72)%12}" min="0" max="11" style="width:64px"> in</div></div>
    <div class="fg"><label>Weight (lbs)</label><input class="ei" type="number" id="ewt" value="${p.wt||200}" min="100" max="400"></div>
    ${!p.grad&&p.yr>=9&&p.yr<=12?`<div class="fg"><label>Class</label><select class="ei" id="eyr">${[[9,'Freshman'],[10,'Sophomore'],[11,'Junior'],[12,'Senior']].map(([y,l])=>`<option value="${y}" ${y===p.yr?'selected':''}>${l}</option>`).join('')}</select></div>`:''}
  </div>
  ${lookEditorHtml(p)}
  <div class="fg" style="margin-top:10px"><label>Dev Trait</label>
    <select class="ei" id="ed">${DEV.map(d=>`<option value="${d}" ${d===p.dev?'selected':''}>${d}</option>`).join('')}</select>
  </div>
  <div class="fg" style="margin-top:8px"><label>Traits (Ctrl+click multi-select)</label>
    <select class="ei" id="et" multiple style="height:100px">${TRAITS.map(t=>`<option value="${t.k}" ${(p.traits||[]).includes(t.k)?'selected':''}>${t.l}</option>`).join('')}</select>
  </div>
  <div class="fg" style="margin-top:8px"><label>Interests (Ctrl+click multi-select)</label>
    <select class="ei" id="eint" multiple style="height:80px">${INTERESTS.map(t=>`<option value="${t.k}" ${(p.interests||[]).includes(t.k)?'selected':''}>${t.e} ${t.l}</option>`).join('')}</select>
  </div>
  ${eqEditorHtml(p)}
  <div style="display:flex;gap:8px;margin-top:12px"><button class="btn" onclick="savePlayer(${pid})">Save</button><button class="bgh" onclick="clo()">Cancel</button></div>`);setTimeout(eqPrev,0);}

// v2.15 bulk editor: change ratings for a whole group in one go
function bulkOpen(sid){if(earnedOn()&&!(sid&&sid!==G.myId)){notify('Earned progression is on: your players earn their ratings (Settings → League rules).','w');return;}window._bkSid=sid&&sid!==G.myId?sid:null;
  openMo(`<h2>Edit many players</h2><p style="font-size:13px;color:var(--mu);margin:4px 0 10px">Change the ratings of a whole group at once, like a team-wide boost.</p>
  <div class="g2" style="gap:10px">
    <div class="fg"><label>Players</label><select class="ei" id="bk-who"><option value="all">Whole varsity</option><option value="off">Offense</option><option value="def">Defense</option>${POS.map(p=>`<option value="${p}">${p}s</option>`).join('')}<option value="jv">JV team</option></select></div>
    <div class="fg"><label>How</label><select class="ei" id="bk-how"><option value="add">Add (or subtract) points</option><option value="set">Set to a value</option><option value="min">Raise anyone below a value</option></select></div>
    <div class="fg"><label>Amount / value</label><input class="ei" type="number" id="bk-n" value="5" min="-50" max="99"></div>
  </div>
  <div class="fg" style="margin-top:8px"><label>Ratings to change</label><div style="display:flex;gap:10px;flex-wrap:wrap;font-size:13px">
    ${[['rat','Overall'],['pot','Potential'],['spd','Speed'],['str','Strength'],['awr','Awareness'],['sta','Stamina'],['skills','Position skills']].map(([k,l],i)=>`<label style="display:flex;gap:4px;align-items:center"><input type="checkbox" class="bk-k" value="${k}" ${i===0?'checked':''}>${l}</label>`).join('')}</div></div>
  <div id="bk-prev" style="font-size:12px;color:var(--mu);margin-top:8px"></div>
  <div style="display:flex;gap:8px;margin-top:12px"><button class="btn" onclick="bulkApply()">Apply</button><button class="bgh" onclick="clo()">Cancel</button></div>`);
  const up=()=>{const L=bulkGroup();const el=document.getElementById('bk-prev');if(el)el.textContent=`${L.length} player${L.length===1?'':'s'} will change.`;};
  ['bk-who'].forEach(id=>document.getElementById(id).onchange=up);up();}
function bulkGroup(){const w=(document.getElementById('bk-who')||{}).value||'all',OFF=['QB','RB','WR','TE','OL'],DEF=['DL','LB','CB','S'];
  const sid=window._bkSid||G.myId;if(w==='jv')return G.players.filter(p=>p.sId===sid&&!p.grad&&p.onJV);
  const L=sid===G.myId?myP():sPlayers(sid).filter(p=>!p.onJV);return w==='all'?L:w==='off'?L.filter(p=>OFF.includes(p.pos)):w==='def'?L.filter(p=>DEF.includes(p.pos)):L.filter(p=>p.pos===w);}
function bulkApply(){
  const how=document.getElementById('bk-how').value,n=parseInt(document.getElementById('bk-n').value,10),ks=[...document.querySelectorAll('.bk-k:checked')].map(i=>i.value),L=bulkGroup();
  if(!Number.isFinite(n)){notify('Enter a number','e');return;}if(!ks.length){notify('Pick at least one rating','e');return;}if(!L.length){notify('No players in that group','e');return;}
  for(const p of L){ovrSync(p,true);const f=v=>clamp(Math.round(how==='add'?v+n:how==='set'?n:Math.max(v,n)),1,99);for(const k of ks){if(k==='sta')p.at.sta=f(p.at.sta);else if(k==='skills'){for(const a in(OVR_W[p.pos]||{}))if(!ATOP.has(a)&&a!=='sta')p.at[a]=f(p.at[a]);}else{const v=p[k]||0;p[k]=f(v);}}if(ks.includes('rat')&&!ks.includes('skills')){}else if(!ks.includes('rat'))p._rc=p.rat;ovrSync(p);
    if(p.pot<p.rat)p.pot=p.rat;if(p.potHi!=null&&p.potHi<p.pot)p.potHi=p.pot;if(p.potLo!=null&&p.potLo>p.potHi)p.potLo=p.potHi;}
  try{updateRats();}catch(e){}clo();nav(G._page,G._arg);notify(`${L.length} player${L.length===1?'':'s'} updated`);}
// job offers: a good season gets your name around. Schools call after the season: from your league, from bigger and
// smaller classifications and from other states. The offers stand through the offseason, until the first game of the new season.
function jobOffersGen(w,l,champ,divWon){
  G.jobOffers=null;if(pcActive()||G.pcLock)return;const me=myS();if(!me)return;
  const ratio=w/Math.max(1,w+l),sc=ratio*2+(champ?1.5:0)+(divWon?0.5:0)+(G.prestige||1)*0.2;
  // teams you created or edited always call; good seasons also bring head coach and coordinator offers
  const cust=[];for(const d of G.divisions||[])for(const t of d.teams)if(t.id!==G.myId&&!t.intl&&teamIsCustom(t))cust.push({sid:t.id,kind:'custom'});
  const n=sc>=2.6?6:sc>=1.8?4:sc>=1.1?3:Math.random()<0.5?1:0;if(!n&&!cust.length)return;
  if(!n){G.jobOffers={yr:G.yr+1,list:cust.slice(0,3)};try{addNews('myteam','Your teams are calling',`${cust.length} of the programs you built want you as head coach.`);}catch(e){}return;}
  const P0=G.prestige||1,myN=clsNum(G.cls),mySt=clsSt(G.cls),myF=clsFmt(G.cls),pr=t=>t.prestige||1,cn=t=>clsNum(t.cls||G.cls);
  // how big a jump the season earns: a title run can get you a school two classifications up and a stronger program
  const upPr=sc>=2.6?1.5:sc>=1.8?1:0.5,upN=sc>=2.6?2:sc>=1.8?1:0;
  const pool=[];for(const t of allSchoolsAll()){if(t.id===G.myId||t.intl||t.lite||!isUSSchool(t))continue;const f=clsFmt(t.cls||G.cls);if(f!==11&&f!==myF)continue;if(pr(t)>P0+upPr||cn(t)>myN+upN)continue;pool.push(t);}
  if(!pool.length)return;for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  const used=new Set(),list=[],is={same:t=>t.cls===G.cls,oos:t=>stOf(t)!==mySt,up:t=>stOf(t)===mySt&&cn(t)>myN,down:t=>stOf(t)===mySt&&cn(t)<myN,any:()=>true};
  const take=k=>{const t=pool.find(x=>!used.has(x.id)&&is[k](x));if(!t)return false;used.add(t.id);list.push({sid:t.id,kind:pr(t)<P0-0.5?'rebuild':'up'});return true;};
  for(const k of['same','oos','up','down','oos','same','up'].slice(0,n))if(!take(k))take('any');
  // a coordinator job at a bigger program: run one side of the ball, then go for the top job
  {const big=allSchoolsAll().filter(t=>t.id!==G.myId&&!used.has(t.id)&&!t.intl&&!t.lite&&isUSSchool(t)&&clsFmt(t.cls||G.cls)===myF&&pr(t)>=P0+1&&cn(t)<=myN+1).sort((a,b)=>pr(b)-pr(a)).slice(0,8);const t=big[Math.floor(Math.random()*big.length)];
    if(t&&G.role!=='OC'&&G.role!=='DC'&&Math.random()<0.7){used.add(t.id);list.push({sid:t.id,kind:Math.random()<0.5?'OC':'DC'});}}
  for(const c of cust)if(!list.some(o=>o.sid===c.sid)&&list.length<9)list.unshift(c);
  if(!list.length)return;G.jobOffers={yr:G.yr+1,list};const nO=list.filter(o=>{const t=getS(o.sid);return t&&stOf(t)!==mySt;}).length;
  try{addNews('myteam',`${list.length} school${list.length>1?'s':''} want${list.length>1?'':'s'} to talk to you`,`After a ${w}-${l} season, ${list.map(o=>getS(o.sid)&&getS(o.sid).name).filter(Boolean).join(', ')} called about their coaching job${list.length>1?'s':''}.${nO?` ${nO} of them ${nO>1?'are':'is'} out of state.`:''}`);}catch(e){}
  try{addLog(`<span style="color:var(--gd)">Job offers: ${list.length} school${list.length>1?'s':''} called about a coaching job${nO?` (${nO} out of state)`:''}. See the dashboard.</span>`);}catch(e){}}
function jobOffersLive(){const J=G.jobOffers;if(!J||J.yr!==G.yr||!J.list.length||pcActive()||pcAuto())return null;
  if(G.phase!=='offseason'||G.sched.some(g=>g.type==='regular'&&g.result))return null;return J;}
function jobWhere(t){const os=stOf(t)!==clsSt(G.cls),d=clsNum(t.cls)-clsNum(G.cls);return`${os?'<b style="color:var(--te)">Out of state</b> · '+clsName(t.cls):clsL(t.cls)}${t.cls===G.cls?'':d>0?' · bigger school':d<0?' · smaller school':os?'':' · other classification'}`;}
function jobPanel(){const J=jobOffersLive();if(!J)return'';
  const rows=J.list.map(o=>{const t=getS(o.sid);if(!t)return'';return`<div class="dr" style="gap:8px;flex-wrap:wrap"><span class="a" style="flex:1;min-width:160px"><b style="cursor:pointer" onclick="viewSchool(${t.id})">${t.name} ${t.mascot}</b><div style="font-size:11px;color:var(--mu)">${o.kind==='OC'?'<b style="color:var(--gd)">Offensive Coordinator</b> · ':o.kind==='DC'?'<b style="color:var(--gd)">Defensive Coordinator</b> · ':o.kind==='custom'?'<b style="color:var(--gd)">Your team</b> · ':''}${jobWhere(t)} · OVR ${teamOvr(t.id)} · ${stars(Math.round(t.prestige||1))}${o.kind==='rebuild'?' · rebuild job, bigger budget':o.kind==='OC'?' · you run the offense':o.kind==='DC'?' · you run the defense':' · head coach'}</div></span><span style="display:flex;gap:6px"><button class="btn bgn" style="font-size:12px" onclick="jobAccept(${t.id})">Accept</button><button class="bgh" style="font-size:12px" onclick="jobDecline(${t.id})">Decline</button></span></div>`;}).join('');
  return`<div class="pnl" style="margin-bottom:14px"><div class="ph">Job Offers</div><div class="pb"><div style="font-size:12px;color:var(--mu);margin-bottom:6px">Other programs want you as their coach, in your league, in other classifications and in other states. Offers stand until your first game of the season. Your record, trophies and history come with you.</div>${rows}</div></div>`;}
window.jobAccept=function(sid){const t=getS(sid),os=myS();if(!t||!jobOffersLive())return;
  if(!confirm(`Leave ${os.name} and take the head coaching job at ${t.name} ${t.mascot}? Your record, trophies and history come with you; the roster, staff and facilities are theirs.`))return;
  const kd=(G.jobOffers.list.find(o=>o.sid===sid)||{}).kind,rb=kd==='rebuild';if(coachTakeOver(sid,true,true)===false)return;G.jobOffers=null;if(rb){G.budget+=25000;notify('Rebuild bonus: +$25,000 budget');}
  G.role=kd==='OC'||kd==='DC'?kd:'HC';const job=G.role==='OC'?'offensive coordinator':G.role==='DC'?'defensive coordinator':'head coach';
  addLog(`<span style="color:var(--gd)">New job: you are the ${job} at ${t.name} ${t.mascot}.${G.role!=='HC'?' On Game Day you run your side of the ball; head coaching offers follow a strong season.':''}</span>`);};
window.jobDecline=function(sid){const J=jobOffersLive();if(!J)return;J.list=J.list.filter(o=>o.sid!==sid);const t=getS(sid);if(t)addLog(`<span style="color:var(--mu)">You turned down ${t.name}.</span>`);nav(G._page||'dash',G._arg);};
function teamIsCustom(t){if(!t)return false;if(t.customLogo||t.userEdited)return true;try{const W=G.world&&G.world.tb;if(!W)return false;
  if(!G._custNames){G._custNames=new Set([...Object.values(W.ed||{}).map(v=>v&&v.name),...(W.add||[]).map(v=>v&&v.name)].filter(Boolean));Object.defineProperty(G,'_custNames',{enumerable:false,writable:true,configurable:true,value:G._custNames});}
  return G._custNames.has(t.name);}catch(e){return false;}}
// ── homecoming: one home game a season, on the rivalry game when it is at home, else a home game near midseason ──
function hcHome(g){return!!g&&g.type==='regular'&&g.oppId!=null&&!g._empty&&((g.wk|0)+G.myId)%2===0;}
function hcWk(){if(typeof G==='undefined'||!G||!G.sched)return null;const H=G.hc,started=G.sched.some(g=>g.type==='regular'&&g.result);
  if(H&&H.yr===G.yr&&started)return H.wk;const R=G.sched.filter(hcHome);
  const rv=R.find(g=>g.isRivalry||isRivalry(G.myId,g.oppId)),mid=R.filter(g=>g.wk>1).sort((a,b)=>Math.abs(a.wk-5)-Math.abs(b.wk-5))[0]||R[0],g=rv||mid;
  G.hc={yr:G.yr,wk:g?g.wk:null};return G.hc.wk;}
function hcIs(wk){return wk!=null&&hcWk()===wk;}
function hcTag(g){return g&&g.type==='regular'&&hcIs(g.wk)?' <span style="font-size:10px;font-weight:800;color:var(--gd)">Homecoming</span>':'';}
// ── rivalry week ──
const RIV_TROPHY=['Old Bell','Iron Skillet','Golden Helmet','Victory Bell','County Cup','Bronze Boot','Little Brown Jug','Rail Spike','Old Oaken Bucket','Silver Saddle','Paint Bucket','Brass Lantern','Steel Spur','Hatchet','Old Anvil','Milk Can'];
function rivTrophy(oppId){G.rivT=G.rivT||{};const k=Math.min(G.myId,oppId)+'-'+Math.max(G.myId,oppId);if(!G.rivT[k])G.rivT[k]={name:'The '+RIV_TROPHY[(G.myId*7+oppId*13)%RIV_TROPHY.length],w:0,l:0,holder:null};return G.rivT[k];}
function rivalryAfter(opp,win,my,op,silent){const T=rivTrophy(opp.id);if(win)T.w++;else T.l++;const kept=T.holder===(win?G.myId:opp.id);T.holder=win?G.myId:opp.id;
  G.morale=clamp((G.morale==null?60:G.morale)+(win?6:-6),0,100);G.prestige=clamp((G.prestige||1)+(win?0.05:-0.03),1,5);if(win)G.budget+=5000;
  const h=win?`${kept?'Keeps':'Takes back'} ${T.name}!`:`${T.name} goes to ${opp.name}`;
  try{addNews(win?'myteam':'bad',`Rivalry: ${h}`,`${myS().name} ${my}-${op} ${opp.name}. Series ${T.w}-${T.l}.${win?' +$5,000 from the rivalry crowd.':''} · via ${MEDIA.fni}`);}catch(e){}
  try{addLog(`<span style="color:${win?'var(--gd)':'var(--rd)'}">Rivalry week: ${h} Series ${T.w}-${T.l}.</span>`);}catch(e){}}
function rivalryWeekHtml(opp){if(!opp)return'';const T=rivTrophy(opp.id);return`<div style="font-size:12px;margin-top:6px;color:var(--gd);font-weight:800">Rivalry week: ${T.name} is on the line · series ${T.w}-${T.l}${T.holder?` · held by ${T.holder===G.myId?'you':opp.name}`:''}</div>`;}
// ── host a combine: invite college staffs, your players test, standouts get offers ──
const COMBINE_COST=2500,COMBINE_INV=600;
function combineAvail(){return!(G.combineYr===G.yr);}
// how far your program reaches: prestige, facilities and recent results decide how many college staffs answer your call
// and which ones (a small program gets nearby small colleges, a power gets FBS staffs from all over the country)
function invTier(){const pr=G.prestige||1,F=G.fac||{},fa=((F.weight||1)+(F.train||1)+(F.film||1)+(F.med||1))/4,h=(G.hist||[]).slice(-2),last=h[h.length-1];
  const wp=last?last.wins/Math.max(1,last.wins+last.losses):0.5,ch=h.some(x=>x&&(x.stateChamp||x.champ))?0.5:0,sc=clamp(pr+(fa-1)*0.3+(wp-0.5)*1.2+ch,1,6);
  const lv=['D2','D3','NAIA','JUCO'].concat(sc>=2?['FCS']:[],sc>=3?['FBS']:[]),fbsMax=sc>=5?100:sc>=4?85:70;
  const next=sc<2?'FCS staffs':sc<2.5?'out-of-state colleges':sc<3?'FBS staffs':sc<4?'bigger FBS programs':sc<5?'the top FBS programs':'';
  return{sc,pr,fa,last,ch,lv,fbsMax,oos:sc>=2.5,oosAll:sc>=3.5,comb:clamp(1+Math.round(sc*1.5),2,10),game:clamp(Math.round(sc*0.8),1,5),next};}
function invTierHtml(T,n){T=T||invTier();const L=T.last;return`<div style="font-size:12px;margin-bottom:10px;padding:8px 10px;border:1px solid var(--bd);border-radius:8px;background:var(--s2)"><b>Program reach ${T.sc.toFixed(1)} of 6</b> · prestige ${stars(Math.round(T.pr))} · facilities level ${T.fa.toFixed(1)}${L?` · last season ${L.wins}-${L.losses}`:''}${T.ch?' · recent state title':''}<br>You can invite up to <b>${n}</b> staff${n>1?'s':''}: ${T.lv.includes('FBS')?(T.fbsMax>=100?'every FBS program':T.fbsMax>=85?'most FBS programs':'smaller FBS programs')+', ':''}${T.lv.includes('FCS')?'FCS, ':''}D2, D3, NAIA and JUCO${T.oosAll?', from any state':T.oos?', small colleges from other states too':', in state only'}.${T.next?` <span style="color:var(--mu)">Win more, raise prestige and upgrade facilities to reach ${T.next}.</span>`:''}</div>`;}
window.invLim=function(el,cls,n){if(el.checked&&document.querySelectorAll('.'+cls+':checked').length>n){el.checked=false;notify(`You can invite up to ${n} staff${n>1?'s':''}.`,'w');}};
function combineColleges(T){const out=[];try{_colStReady();}catch(e){}const st=clsSt(G.cls);T=T||invTier();
  const per=Math.round(2+T.sc),nO=T.oos?Math.round((T.sc-2)*1.5):0,R=c=>_colRand(c.school+'|'+c.lvl+'#inv'+G.yr)();
  for(const l of['FBS','FCS','D2','D3','NAIA','JUCO']){if(!T.lv.includes(l))continue;const L=COLLEGES.filter(c=>c.lvl===l&&(l!=='FBS'||c.pr<=T.fbsMax));
    out.push(...L.filter(c=>c.st===st).sort((a,b)=>b.pr-a.pr).slice(0,per+(l==='FBS'?2:0)));
    if(nO>0&&(T.oosAll||l!=='FBS'&&l!=='FCS'))out.push(...L.filter(c=>c.st!==st).sort((a,b)=>R(b)*(b.pr+20)-R(a)*(a.pr+20)).slice(0,nO+(l==='FBS'?1:0)));}
  return out;}
window.combineOpen=function(){if(!combineAvail()){notify('You already hosted a combine this year.','w');return;}const T=invTier(),N=T.comb,C=combineColleges(T);
  openMo(`<h2>Host a Combine</h2><div style="font-size:13px;color:var(--mu);margin-bottom:10px">Your sophomores, juniors and seniors run the 40, the shuttle, the vertical and the bench in front of the college staffs you invite. Standouts can pick up offers on the spot. Cost $${COMBINE_COST.toLocaleString()} plus $${COMBINE_INV} per staff you invite.</div>${invTierHtml(T,N)}
   <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:6px;max-height:46vh;overflow-y:auto">${C.map((c,i)=>`<label style="display:flex;gap:8px;align-items:center;font-size:13px;padding:6px 8px;border:1px solid var(--bd);border-radius:8px"><input type="checkbox" class="cb-c" value="${i}" onchange="invLim(this,'cb-c',${N})" style="width:auto;min-height:0"> ${colLogo(c,30)}<span><b>${c.school}</b><br><small style="color:var(--mu)">${c.lvl}${c.st===clsSt(G.cls)?' · in state':' · '+stName(c.st)}</small></span></label>`).join('')}</div>
   <div style="text-align:right;margin-top:12px;display:flex;gap:8px;justify-content:flex-end"><button class="bgh" onclick="clo()">Cancel</button><button class="btn bgn" onclick="combineRun()">Run the combine</button></div>`);window._cbC=C;window._cbN=N;};
window.combineRun=function(){const C=window._cbC||[],pick=[...document.querySelectorAll('.cb-c:checked')].map(x=>C[+x.value]).filter(Boolean).slice(0,window._cbN||6);
  const cost=COMBINE_COST+pick.length*COMBINE_INV;if(!pick.length){notify('Invite at least one college staff.','w');return;}if(!hasFunds(cost)){notify(`The combine costs $${cost.toLocaleString()}.`,'e');return;}
  if(!G.unlimitedMoney)G.budget-=cost;G.combineYr=G.yr;const pl=myP().concat(G.players.filter(p=>p.sId===G.myId&&p.onJV)).filter(p=>p.yr>=10&&!p.grad&&!(p.inj>0));
  const res=pl.map(p=>{const sp=atv(p,'spd'),ag=atv(p,'agi'),jm=atv(p,'jmp'),st=atv(p,'str');
    const forty=+(5.45-(sp-40)*0.016+(p.wt>230?(p.wt-230)*0.0025:0)+gaussR()*0.05).toFixed(2),shut=+(4.85-(ag-40)*0.012+gaussR()*0.06).toFixed(2),vert=Math.round(20+(jm-40)*0.33+gaussR()*1.5),bench=Math.max(0,Math.round(4+(st-40)*0.42+gaussR()*2));
    const z=(5.0-forty)*4+(4.45-shut)*3+(vert-28)/4+(bench-14)/6+(p.rat-55)/10;return{p,forty,shut,vert,bench,z};}).sort((a,b)=>b.z-a.z);
  const offers=[];for(const r of res.slice(0,10)){r.p.campStarB=(r.p.campStarB||0)+(r.z>2?0.5:r.z>0.5?0.25:0);if(r.p.committed||r.p.yr<10)continue;
    for(const c of pick){const L=recLevel(r.p)+r.z*4;if(Math.abs(c.pr-L)<=22&&colRoom(c,r.p,true)&&!(r.p.offers||[]).some(o=>o.school===c.school&&o.lvl===c.lvl)&&Math.random()<clamp(0.18+r.z*0.1,0.05,0.6)){r.p.offers=r.p.offers||[];addOffer(r.p,c,null,'combine standout');offers.push(`${r.p.fn} ${r.p.ln} → ${c.school}`);break;}}}
  addLog(`<span style="color:var(--gd)">You hosted a combine for ${pick.length} college staff${pick.length>1?'s':''} (-$${cost.toLocaleString()}). ${offers.length} offer${offers.length===1?'':'s'}.</span>`);
  try{addNews('myteam',`${myS().name} hosts a combine`,`${pick.map(c=>c.school).join(', ')} in attendance. ${offers.length} offer${offers.length===1?'':'s'} on the spot. · via ${MEDIA.rank}`);}catch(e){}
  openMo(`<h2>Combine results</h2><div style="font-size:13px;color:var(--mu);margin-bottom:8px">${offers.length?'<b style="color:var(--gn)">Offers: '+offers.join(' · ')+'</b>':'No offers on the spot, but the staffs saw your players: their recruiting got a boost.'}</div>
   <div style="overflow-x:auto;max-height:50vh"><table><thead><tr><th>Player</th><th>Pos</th><th>Yr</th><th>40</th><th>Shuttle</th><th>Vertical</th><th>Bench (185)</th></tr></thead><tbody>${res.slice(0,30).map(r=>`<tr class="cl" onclick="clo();showPlayer(${r.p.id})"><td>${r.p.fn} ${r.p.ln}</td><td>${r.p.pos}</td><td>${yrL(r.p.yr)}</td><td><b>${r.forty.toFixed(2)}</b></td><td>${r.shut.toFixed(2)}</td><td>${r.vert}"</td><td>${r.bench}</td></tr>`).join('')}</tbody></table></div>
   <div style="text-align:right;margin-top:10px"><button class="btn" onclick="clo();nav('recr')">Done</button></div>`);};
// ── invite college coaches to a game: big games in front of them can earn offers ──
const GAMEINV_COST=1000;
window.gameInviteOpen=function(){const g=G.sched.find(x=>!x.result&&x.type==='regular');if(!g){notify('No regular season game left to invite coaches to.','w');return;}
  if(G.gameInv&&G.gameInv.yr===G.yr&&G.gameInv.wk===g.wk){notify('Coaches are already coming to this game.','w');return;}const T=invTier(),N=T.game,C=combineColleges(T);
  openMo(`<h2>Invite coaches to Week ${g.wk}</h2><div style="font-size:13px;color:var(--mu);margin-bottom:10px">Pick the college staffs you want in the stands ($${GAMEINV_COST.toLocaleString()} each for their visit). Play well in front of them and offers can follow.</div>${invTierHtml(T,N)}
   <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:6px;max-height:46vh;overflow-y:auto">${C.map((c,i)=>`<label style="display:flex;gap:8px;align-items:center;font-size:13px;padding:6px 8px;border:1px solid var(--bd);border-radius:8px"><input type="checkbox" class="gi-c" value="${i}" onchange="invLim(this,'gi-c',${N})" style="width:auto;min-height:0"> ${colLogo(c,30)}<span><b>${c.school}</b><br><small style="color:var(--mu)">${c.lvl}${c.st===clsSt(G.cls)?' · in state':' · '+stName(c.st)}</small></span></label>`).join('')}</div>
   <div style="text-align:right;margin-top:12px;display:flex;gap:8px;justify-content:flex-end"><button class="bgh" onclick="clo()">Cancel</button><button class="btn bgn" onclick="gameInviteSend(${g.wk})">Send invitations</button></div>`);window._giC=C;window._giN=N;};
window.gameInviteSend=function(wk){const C=window._giC||[],pick=[...document.querySelectorAll('.gi-c:checked')].map(x=>C[+x.value]).filter(Boolean).slice(0,window._giN||3);if(!pick.length){notify('Pick at least one staff.','w');return;}
  const cost=pick.length*GAMEINV_COST;if(!hasFunds(cost)){notify(`That costs $${cost.toLocaleString()}.`,'e');return;}if(!G.unlimitedMoney)G.budget-=cost;
  G.gameInv={yr:G.yr,wk,list:pick.map(c=>c.school+'|'+c.lvl)};clo();notify(`${pick.length} staff${pick.length>1?'s':''} will be at Week ${wk}`);try{addLog(`<span style="color:var(--te)">College coaches invited to Week ${wk}: ${pick.map(c=>c.school).join(', ')}.</span>`);}catch(e){}nav(G._page||'dash',G._arg);};
function gameInviteResolve(wk,pops){const I=G.gameInv;if(!I||I.yr!==G.yr||I.wk!==wk)return;G.gameInv=null;const C=I.list.map(k=>COL_BY[k]).filter(Boolean);if(!C.length)return;
  const L=myP().filter(p=>p.yr>=10&&!p.committed).map(p=>{const g=(p.gameLog||[]).slice(-1)[0];const st=g&&g.w===wk?g.s:null;return{p,v:st?scorePerfEntry(st,p.pos)/((STREAK_BENCH[p.pos]||8)):0};}).filter(x=>x.v>0.9).sort((a,b)=>b.v-a.v).slice(0,6);
  const got=[];for(const x of L)for(const c of C){if((x.p.offers||[]).some(o=>o.school===c.school&&o.lvl===c.lvl))continue;const Lv=recLevel(x.p)+x.v*6;
    if(Math.abs(c.pr-Lv)<=25&&colRoom(c,x.p,true)&&Math.random()<clamp(0.15+x.v*0.12,0.1,0.55)){x.p.offers=x.p.offers||[];addOffer(x.p,c,pops,'saw him live');got.push(`${x.p.fn} ${x.p.ln} → ${c.school}`);break;}}
  try{addLog(`<span style="color:var(--te)">The visiting staffs left Week ${wk} with ${got.length?got.join(', '):'no new offers'}.</span>`);}catch(e){}}
// ── a neutral site for the state final: the flagship college stadium of your state ──
function stateFinalVenue(){try{_colStReady();}catch(e){}const st=clsSt(G.cls),c=COLLEGES.filter(x=>x.lvl==='FBS'&&x.st===st).sort((a,b)=>b.pr-a.pr)[0];return c?`${c.school} Stadium`:`${stName(st)} Championship Stadium`;}
// v2.16 coach any school: take over another program in the offseason, before its first game
function coachTakeOver(sid,quiet,anyLg){
  const ns=getS(sid),os=myS();if(!ns||!os||ns.id===G.myId)return false;
  const inLive=G.divisions.some(d=>d.teams.some(t=>t.id===ns.id)),L=!inLive&&G.allLeagues?G.allLeagues[ns.cls]:null;
  if(ns.intl||ns.lite||(!inLive&&!(anyLg&&L&&L.divisions.some(d=>d.teams.some(t=>t.id===ns.id))))){notify('You can only take over a school in your league.','e');return false;}
  if(G.phase!=='offseason'||G.sched.some(g=>g.type==='regular'&&g.result)){notify('Coaching changes happen in the offseason, before the first game of a season.','w');return false;}
  if(!quiet&&!confirm(`Leave ${os.name} and become the head coach of ${ns.name} ${ns.mascot}? Your record, trophies and history come with you; the roster, staff and facilities are theirs.`))return false;
  G.role='HC';
  // a job in another classification or state: that league becomes the one you play in, yours joins the others
  if(!inLive){G.allLeagues[G.cls]={divisions:G.divisions,champId:null,champName:null};G.divisions=L.divisions;delete G.allLeagues[ns.cls];
    G.reclsPressure=0;G.reclsLog=[];G.promotedYr=0;G.chosenRivals=[];G.lsch=null;try{_RK=null;_rkNames=null;}catch(e){}}
  os.prestige=G.prestige;os.trainLevel=G.trainLevel;os.isP=false;os.staff=G.staff;os.fac=G.fac;
  ns.isP=true;ns.staff=ns.staff||genStaff(true);ns.fac=ns.fac||{weight:1,film:1,train:1,med:1};
  G.myId=ns.id;G.cls=ns.cls;G.prestige=ns.prestige||1;G.offS=ns.offS;G.defS=ns.defS;G.staff=ns.staff;G.fac=ns.fac;G.trainLevel=ns.trainLevel||1;
  G.budget=Math.max(20000,40000+Math.round(G.prestige*8000));G.seasonRivalId=null;G.benched={};
  if(G.pbData){G.pbData.offSel=null;G.pbData.defSel=null;}
  G.jvRoster=G.players.filter(p=>p.sId===ns.id&&!p.grad&&p.onJV).map(p=>p.id);
  try{initJVRoster();}catch(e){}
  genSched();updateRats();
  if(!quiet)addLog(`<span style="color:var(--gd)">New job: you are the head coach of ${ns.name} ${ns.mascot}.</span>`);
  try{addNews('myteam',`New head coach at ${ns.name}`,`You left ${os.name} to take over the ${ns.mascot}.`);}catch(e){}
  try{updateTb();}catch(e){}clo();nav('dash');notify(quiet?`Welcome to ${ns.name}!`:`Welcome to ${ns.name}! Build your schedule to start the season.`);
}
function savePlayer(pid){const p=getP(pid);if(!p)return;p.fn=document.getElementById('ef').value||p.fn;p.ln=document.getElementById('el').value||p.ln;{const nv=parseInt(document.getElementById('en').value,10);p.num=Number.isFinite(nv)?clamp(nv,0,99):p.num;}{const p2=(document.getElementById('ep2')||{}).value||'';p.pos2=p2&&p2!==document.getElementById('ep').value?p2:null;}const newPos=document.getElementById('ep').value;if(newPos!==p.pos){p.pos=newPos;const sch=getS(p.sId);p.arch=pickArchetype(newPos,sch?sch.offS:'Pro Style',sch?sch.defS:'4-3');}if(!earnedOn()){const r0=p.rat,rIn=clamp(parseInt(document.getElementById('er').value)||p.rat,1,99);ovrSync(p,true);document.querySelectorAll('.at-in').forEach(i=>{const k=i.dataset.k,v=clamp(parseInt(i.value)||1,1,99);if(ATOP.has(k))p[k]=v;else p.at[k]=v;});if(rIn!==r0)attrShift(p,rIn);p.rat=ovrCalc(p);p._rc=p.rat;p.pot=clamp(parseInt(document.getElementById('ept').value)||p.pot,p.rat,99);}p.gpa=clamp(parseFloat(document.getElementById('eg').value)||p.gpa,1.5,4.0);if(!earnedOn()){p.dev=document.getElementById('ed').value;p.traits=Array.from(document.getElementById('et').selectedOptions).map(o=>o.value);}const eintEl=document.getElementById('eint');if(eintEl)p.interests=Array.from(eintEl.selectedOptions).map(o=>o.value);{const eq=eqRead();if(eq)p.eq=eq;}
  {const ft=parseInt(document.getElementById('eht-ft').value,10),inch=parseInt(document.getElementById('eht-in').value,10),w=parseInt(document.getElementById('ewt').value,10);
   if(Number.isFinite(ft)&&Number.isFinite(inch))p.ht=clamp(ft*12+clamp(inch,0,11),54,90);if(Number.isFinite(w))p.wt=clamp(w,90,420);
   const ye=document.getElementById('eyr');if(ye){const y=parseInt(ye.value,10);if(y>=9&&y<=12)p.yr=y;}
   lookRead(p);}
  try{gdFixNums(p);}catch(e){}updateRats();clo();nav(G._page,G._arg);notify(`${p.fn} ${p.ln} saved!`);}


