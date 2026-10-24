// ═══════════ UNIFORMS: tertiary colors, home/away/alternate designer, pregame choice ═══════════
const UNI_F=[['helmet','Helmet'],['hstripe','Helmet stripe'],['mask','Facemask'],['jersey','Jersey'],['trim','Jersey trim'],['num','Numbers'],['pants','Pants'],['pstripe','Pants stripe'],['sock','Socks'],['cleat','Cleats']];
function teamC3(s){
  if(!s)return'#ffffff';if(s.c3&&/^#[0-9a-f]{6}$/i.test(s.c3))return s.c3;
  const pal=['#ffffff','#111111','#c0c0c0','#b5a36a','#8a8d8f','#f2f2f2'],h=Math.abs(((s.id||1)*2654435761)|0);
  const far=c=>Math.abs(_gdLum(c)-_gdLum(s.c1||'#333'))>.18&&Math.abs(_gdLum(c)-_gdLum(s.c2||'#fff'))>.18;
  for(let i=0;i<pal.length;i++){const c=pal[(h+i)%pal.length];if(far(c))return c;}return'#c0c0c0';
}
function uniDefault(s,kind){
  if(kind==='alt'){const c1=s.c1||'#1d3557',c2=s.c2||'#ffffff',c3=teamC3(s),j=c3,t=_gdLum(c3)>.5?c1:c2;
    return{helmet:c3,hstripe:c1,mask:_gdLum(c1)>.5?c1:'#9aa3ad',jersey:j,trim:t,num:Math.abs(_gdLum(j)-_gdLum(c1))>.3?c1:(_gdLum(j)>.5?'#111111':'#ffffff'),pants:c3,pstripe:c1,sock:j,cleat:'#151a22'};}
  const k=gdKit(s,kind!=='away');return{helmet:k.helmet,hstripe:k.hstripe,mask:k.mask,jersey:k.jersey,trim:k.trim,num:k.num,pants:k.pants,pstripe:k.pstripe,sock:k.sock,cleat:k.cleat};
}
function uniOf(s,kind){const u=(s&&s.uni&&s.uni[kind])||null;const o=Object.assign(uniDefault(s,kind),u||{});if(!o.shoulder)o.shoulder='none';if(!o.shoulderC)o.shoulderC=o.trim;return o;}
function uniSvg(k,num,w){
  w=w||120;const n=String(num==null?'7':num);
  return`<svg width="${w}" height="${Math.round(w*1.45)}" viewBox="0 0 100 145" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <ellipse cx="50" cy="141" rx="30" ry="3.5" fill="#000" opacity=".25"/>
  <path d="M36,104 L35,128 L45,128 L47,104Z M64,104 L65,128 L55,128 L53,104Z" fill="${k.sock}"/>
  <path d="M33,126 h13 v8 h-15 q-1,-4 2,-8Z M67,126 h-13 v8 h15 q1,-4 -2,-8Z" fill="${k.cleat}"/>
  <path d="M32,78 L68,78 L66,106 L54,106 L50,92 L46,106 L34,106Z" fill="${k.pants}"/>
  <path d="M33,80 L35,104 M67,80 L65,104" stroke="${k.pstripe}" stroke-width="3"/>
  <path d="M28,40 Q50,32 72,40 L86,58 L76,66 L70,58 L69,80 L31,80 L30,58 L24,66 L14,58Z" fill="${k.jersey}"/>
  <path d="M14,58 L24,66 M86,58 L76,66" stroke="${k.trim}" stroke-width="4"/>
  ${k.shoulder&&k.shoulder!=='none'?({single:[0.42],double:[0.32,0.52],triple:[0.28,0.42,0.56]}[k.shoulder]||[]).map(a=>`<path d="M${(14+14*a).toFixed(1)},${(58-18*a).toFixed(1)} L${(24+12*a).toFixed(1)},${(66-16*a).toFixed(1)} M${(86-14*a).toFixed(1)},${(58-18*a).toFixed(1)} L${(76-12*a).toFixed(1)},${(66-16*a).toFixed(1)}" stroke="${k.shoulderC||k.trim}" stroke-width="2.6"/>`).join(''):''}
  <path d="M42,36 Q50,44 58,36" fill="none" stroke="${k.trim}" stroke-width="3"/>
  <text x="50" y="72" text-anchor="middle" font-size="24" font-weight="900" font-family="Arial,sans-serif" fill="${k.num}" stroke="${k.trim}" stroke-width="1" paint-order="stroke">${n}</text>
  <path d="M30,22 C30,6 70,6 70,22 L70,30 Q50,38 30,30Z" fill="${k.helmet}"/>
  ${k.hStripe==='none'?'':`<path d="M48,6.5 L52,6.5 L52,30 L48,30Z" fill="${k.hstripe}"/>`}
  <path d="M34,26 H66 M36,31 H64 M50,26 V36" stroke="${k.mask}" stroke-width="2.4" fill="none"/>
  ${k.hShell==='matte'?'':k.hShell==='chrome'?'<path d="M33,14 Q40,8 48,8" stroke="#fff" stroke-opacity=".85" stroke-width="3" fill="none"/><path d="M60,10 Q66,13 67,20" stroke="#fff" stroke-opacity=".55" stroke-width="2" fill="none"/>':'<path d="M33,14 Q40,8 48,8" stroke="#fff" stroke-opacity=".35" stroke-width="2" fill="none"/>'}</svg>`;
}
function _uniS(){return window._fpMode&&window._fpEditT?window._fpEditT:myS();}
function _uniNum(){const t=_uniS();if(t&&t.fp)return(t.roster.find(p=>p.pos==='QB')||t.roster[0]||{}).num;return(myP()[0]||{}).num;}
window._uniKind='home';
function uniSet(kind,f,v){if(window._fpMode)setTimeout(fpSave,0);const ms=_uniS();ms.uni=ms.uni||{};ms.uni[kind]=Object.assign(uniOf(ms,kind),ms.uni[kind]||{});ms.uni[kind][f]=v;uniRefresh();}
function uniReset(kind){if(window._fpMode)setTimeout(fpSave,0);const ms=_uniS();if(ms.uni)delete ms.uni[kind];pbRerender();}
function uniSetC3(v){if(window._fpMode)setTimeout(fpSave,0);_uniS().c3=v;pbRerender();}
function uniRefresh(){const el=document.getElementById('uni-prev');if(el)el.innerHTML=uniSvg(uniOf(_uniS(),window._uniKind),_uniNum(),170);
  UNI_F.forEach(([f])=>{const i=document.getElementById('uni-'+f);if(i)i.value=uniOf(_uniS(),window._uniKind)[f];});}
function uniEditorHtml(){
  const ms=_uniS(),kind=window._uniKind,u=uniOf(ms,kind),pal=[ms.c1,ms.c2,teamC3(ms),'#ffffff','#111111','#8a8d8f','#c0c0c0','#b5a36a','#7a1f2b','#0b3d91','#2e7d32','#f2b705','#e8731a','#5b2c83'];
  const tabs=[['home','Home'],['away','Away'],['alt','Alternate']].map(([k,l])=>`<button class="tab ${kind===k?'on':''}" onclick="window._uniKind='${k}';pbRerender()">${l}</button>`).join('');
  const rows=UNI_F.map(([f,l])=>`<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap"><label style="width:110px;font-size:12px;font-weight:700;color:var(--mu)">${l}</label>
    <input type="color" id="uni-${f}" value="${u[f]}" oninput="uniSet('${kind}','${f}',this.value)" style="width:46px;height:34px;padding:0;border-radius:8px;cursor:pointer">
    <div style="display:flex;gap:4px;flex-wrap:wrap">${pal.map(c=>`<button title="${c}" onclick="uniSet('${kind}','${f}','${c}')" style="width:22px;height:22px;min-height:22px;border-radius:50%;border:1px solid rgba(255,255,255,.45);background:${c};padding:0;cursor:pointer"></button>`).join('')}</div></div>`).join('');
  return`<div style="display:flex;gap:22px;flex-wrap:wrap">
    <div style="flex:0 0 190px;text-align:center"><div id="uni-prev" style="padding:10px;border-radius:16px;background:linear-gradient(180deg,#3f9a4f,#2a7a3b)">${uniSvg(u,_uniNum(),170)}</div>
      <div style="font-size:12px;color:var(--mu);margin-top:8px">Preview: ${kind==='home'?'Home':kind==='away'?'Away':'Alternate'} uniform</div></div>
    <div style="flex:1 1 300px;min-width:0">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap"><b style="font-size:13px">Team colors</b>
        <span style="width:26px;height:26px;border-radius:50%;background:${ms.c1};display:inline-block;border:1px solid rgba(255,255,255,.4)" title="Primary"></span>
        <span style="width:26px;height:26px;border-radius:50%;background:${ms.c2};display:inline-block;border:1px solid rgba(255,255,255,.4)" title="Secondary"></span>
        <label style="font-size:12px;color:var(--mu)">Tertiary <input type="color" value="${teamC3(ms)}" onchange="uniSetC3(this.value)" style="width:46px;height:30px;padding:0;border-radius:8px;vertical-align:middle"></label></div>
      <div class="tabs" style="margin-bottom:12px">${tabs}</div>
      ${rows}
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap"><label style="width:110px;font-size:12px;font-weight:700;color:var(--mu)">Shoulder stripes</label>
        <select onchange="uniSet('${kind}','shoulder',this.value);pbRerender()" style="padding:5px 8px;border-radius:8px">${[['none','None'],['single','Single stripe'],['double','Double stripe'],['triple','Triple stripe']].map(([v,l])=>`<option value="${v}"${(u.shoulder||'none')===v?' selected':''}>${l}</option>`).join('')}</select>
        <input type="color" value="${u.shoulderC||u.trim}" oninput="uniSet('${kind}','shoulderC',this.value)" style="width:46px;height:34px;padding:0;border-radius:8px;cursor:pointer" title="Stripe color"></div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap"><label style="width:110px;font-size:12px;font-weight:700;color:var(--mu)">Helmet finish</label>
        <select onchange="uniSet('${kind}','hShell',this.value);pbRerender()" style="padding:5px 8px;border-radius:8px">${[['gloss','Gloss'],['matte','Matte'],['chrome','Chrome']].map(([v,l])=>`<option value="${v}"${(u.hShell||'gloss')===v?' selected':''}>${l}</option>`).join('')}</select></div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap"><label style="width:110px;font-size:12px;font-weight:700;color:var(--mu)">Helmet stripe</label>
        <select onchange="uniSet('${kind}','hStripe',this.value);pbRerender()" style="padding:5px 8px;border-radius:8px">${[['team','Center stripe'],['none','No stripe']].map(([v,l])=>`<option value="${v}"${(u.hStripe||'team')===v?' selected':''}>${l}</option>`).join('')}</select></div>
      <button class="bgh bsm" onclick="uniReset('${kind}')">Reset this uniform to team colors</button>
      <div style="font-size:11px;color:var(--mu);margin-top:8px">Pick any color with the color picker or tap a swatch. You choose which uniform to wear before every game you play.</div>
    </div></div>`;
}
function gdFixNums(p){
  if(!p||!G||!G.players)return;const mates=G.players.filter(q=>q.sId===p.sId&&q.id!==p.id);
  for(const q of mates){if(q.num!==p.num)continue;
    const used=new Set(G.players.filter(x=>x.sId===p.sId&&x.id!==q.id).map(x=>x.num));
    let opts=(typeof posNums==='function'?posNums(q.pos):[]).filter(n=>!used.has(n));if(!opts.length){opts=[];for(let n=1;n<=99;n++)if(!used.has(n))opts.push(n);}
    if(opts.length){const old=q.num;q.num=opts[0];addLog(`${q.fn} ${q.ln} switches from #${old} to #${q.num} because ${p.fn} ${p.ln} now wears #${old}.`);}}
}

// ═══════════ STADIUMS (tiers 1-20), PRACTICE FIELDS, CUSTOMIZATION + PRE-GAME PREVIEW ═══════════
const STAD_NAMES=['Sandlot Field','Town Park Field','Community Field','School Field','Memorial Field','Booster Club Field','Hometown Stadium','District Stadium','Varsity Stadium','Community Stadium','Regional Stadium','The Lighted Bowl','Hall of Fame Stadium','Pride Stadium','Showcase Stadium','The Big House','Prep Coliseum','Elite Stadium','Signature Stadium','Crown Jewel Stadium'];
const PRAC_NAMES=['Back Lot Practice Field','Practice Field','Booster Practice Field','Varsity Practice Field','Practice Complex','Lighted Practice Complex','Turf Practice Field','Twin Turf Fields','Football Training Complex','Performance Complex','Elite Training Grounds','Championship Practice Complex','Prep Football Center','Premier Training Center','National Prep Complex','Indoor Performance Center'];
const STAD_TURF=[['classic','Classic green',0],['dark','Dark green',0],['light','Bright green',0],['blue','Blue',1],['red','Red',1],['black','Black',1],['gray','Gray',1],['purple','Purple',1],['team','Team color',1]];
const STAD_EZ=[['team','Team color'],['alt','Secondary color'],['checker','Checkerboard'],['dark','Black'],['turf','Field color']];
const STAD_SEATS=[['silver','Aluminum silver'],['team','Team color'],['alt','Secondary color'],['mixed','Team checker']];
const STAD_LOGO=[['logo','Team logo'],['initial','Big letter'],['none','No logo']];
const STAD_TRACK=[['red','Red'],['blue','Blue'],['black','Black'],['team','Team color']];
const STAD_EZTXT=[['mascot','Mascot'],['name','School name'],['none','Blank']];
const STAD_EZFONT=[['std','Bold'],['block','Varsity block'],['outline','Block outline'],['script','Script']]; // end zone lettering
function _stHex(h){h=String(h||'#777').replace('#','');if(h.length===3)h=h.split('').map(x=>x+x).join('');const n=parseInt(h,16)||0;return[n>>16&255,n>>8&255,n&255];}
function _stMix(a,b,t){const A=_stHex(a),B=_stHex(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('');}
function stadOf(s){
  if(!s)return 1;
  if(s.stad==null){const ci={'1A':0,'2A':1,'3A':2,'4A':3,'5A':4}[clsEq(s.cls)]||0,h=Math.abs(((s.id||1)*2654435761)|0);
    s.stad=Math.max(1,Math.min(20,Math.round(2+ci*2.6+((s.prestige||1)-1)*1.6+(h%5)-1)));}
  return s.stad;
}
// what a tier physically has, before the owner's paint choices
function stadBase(t){
  t=Math.max(1,Math.min(20,t|0));
  const span=[[60,60],[50,70],[44,76],[40,80],[36,84],[32,88],[28,92],[24,96],[20,100],[18,102],[14,106],[12,108],[10,110],[8,112],[-2,122],[-2,122],[-4,124],[-6,126],[-8,128],[-10,130]][t-1];
  return{tier:t,kind:'game',name:STAD_NAMES[t-1],cap:t===1?150:Math.round((150+t*t*38)/50)*50,
    turf:t===1?'dirt':t<=5?'worn':t<=11?'grass':'turf',stripes:t>=9,
    lineA:t===1?0.5:t===2?0.62:t<=4?0.78:0.92,nums:t>=3,hashes:t>=2,
    posts:t<=3?'h':'y',padded:t>=10,
    stands:t===1?'none':t===2?'wood':t<=9?'alum':t<=15?'concrete':'bowl',rows:t===1?0:t===2?3:t===3?4:t===4?5:t===5?6:7,
    xa:span[0],xb:span[1],upper:t>=16,roof:t>=14,endSeats:t>=19,
    fill:t===1?0:Math.min(.97,.22+t*.037),crowdLine:t<=2,trucks:t<=3,
    lights:t<=2?'pole':t<=6?'steel':t<=16?'tower':'led',bright:t===1?0.6:t===2?0.68:t<=4?0.78:t<=6?0.86:t<=9?0.93:1,
    towers:t===1?[28,92]:t===2?[18,60,102]:t<=6?[-6,40,80,126]:[-6,22,50,78,106,134],
    fence:t<=2?'rope':t<=11?'chain':'wall',
    board:t===1?null:t===2?'flip':t<=7?'small':t<=13?'medium':'video',
    pressBox:t<=4?null:t<=9?'shed':t<=15?'box':'tower',
    track:t>=8,scenery:t<=6?'rural':t<=14?'town':'city',
    cheer:t===1?4:t<=5?6:10,ezColor:t>=3,ezText:t>=4,logoDef:t>=5?'logo':'none',day:false,indoor:false};
}
// the owner's paint choices, resolved to real colours (s = the school, for team colours)
function stadApply(i,cust,s){
  const c=Object.assign({},cust||{}),c1=(s&&s.c1)||'#1f3a68',c2=(s&&s.c2)||'#f2b632',art=i.turf==='turf';
  const turfOpt=STAD_TURF.find(x=>x[0]===c.turf)||STAD_TURF[0],turfK=(turfOpt[2]&&!art)?'classic':turfOpt[0];
  const base={dirt:['#5f7438','#647a3b'],worn:['#43773a','#477d3c'],grass:['#2f7d33','#358a3a'],turf:['#2a8e45','#2d9449']}[i.turf];
  const TP={blue:['#1f4fa8','#2559b6'],red:['#9e242a','#aa2a30'],black:['#1b1e23','#23272d'],gray:['#5b626b','#646b75'],purple:['#4b2b88','#553296']};
  let tc=base;
  if(turfK==='dark')tc=base.map(x=>_stMix(x,'#0b2410',.28));else if(turfK==='light')tc=base.map(x=>_stMix(x,'#7fd36a',.22));
  else if(TP[turfK])tc=TP[turfK];else if(turfK==='team'){const d=_gdLum(c1)>.6?_gdDark(c1,.45):c1;tc=[_gdDark(d,.12),d];}
  i.turfK=turfK;i.turfA=tc[0];i.turfB=tc[1];i.turfOut=_gdDark(tc[0],.28);
  if(!i.stripes&&i.turf!=='turf')i.turfB=_stMix(tc[0],tc[1],.45);
  const ezK=(STAD_EZ.find(x=>x[0]===c.ez)||STAD_EZ[0])[0];
  i.ezK=i.ezColor?ezK:'turf';i.ez=i.ezK==='team'?_gdDark(c1,.25):i.ezK==='alt'?_gdDark(c2,.3):i.ezK==='dark'?'#15171b':i.ezK==='checker'?_gdDark(c1,.25):null;i.ez2=i.ezK==='checker'?_gdDark(c2,.35):null;
  const seatK=(STAD_SEATS.find(x=>x[0]===c.seats)||[i.stands==='concrete'||i.stands==='bowl'?'team':'silver'])[0];
  i.seatK=i.stands==='wood'?'wood':seatK;i.seat=i.seatK==='team'?c1:i.seatK==='alt'?c2:i.seatK==='wood'?'#8a6a43':'#9aa6b4';i.seat2=i.seatK==='mixed'?c2:null;if(i.seatK==='mixed')i.seat=c1;
  i.logo=(STAD_LOGO.find(x=>x[0]===c.logo)||[i.logoDef])[0];
  const trK=(STAD_TRACK.find(x=>x[0]===c.track)||STAD_TRACK[0])[0];i.trackK=trK;
  i.trackCol=trK==='blue'?['#2a4f8c','#3e67ad']:trK==='black'?['#24262b','#3a3d44']:trK==='team'?[_gdDark(c1,.2),_gdDark(c1,.02)]:['#8c3b2f','#b8574a'];
  i.ezTxtK=i.ezText?(STAD_EZTXT.find(x=>x[0]===c.eztxt)||STAD_EZTXT[0])[0]:'none';i.ezFont=(STAD_EZFONT.find(x=>x[0]===c.ezfont)||STAD_EZFONT[0])[0];
  i.wall=_gdDark(c1,.15);i.wall2=c2;i.c1=c1;i.c2=c2;
  return i;
}
/*<weather>*/
/* ── v2.10 weather: every state has its own Friday-night climate ──
   Month columns run Aug, Sep, Oct, Nov, Dec (the season and the playoffs).
   t  = typical temperature at a 7 pm kickoff (°F)      sd = night-to-night spread
   r  = chance of rain (or snow when it is cold enough)  s  = share of that rain that comes as a thunderstorm
   f  = chance of fog on a calm night                    w  = average wind (mph)
   alt = thin mountain air (kicks and deep balls carry a little farther)
   Based on normal evening temperatures and rainy-day counts of the real regions each state is modeled on. */
const WX_CLIM={
  CF:{t:[91,85,74,62,54],sd:6,r:[.07,.10,.10,.09,.09],s:[.55,.5,.4,.3,.2],f:[.02,.02,.03,.05,.06],w:9},            // central Texas hill country
  WK:{t:[76,68,55,41,29],sd:9,r:[.14,.13,.11,.09,.08],s:[.5,.4,.2,.08,0],f:[.04,.05,.06,.07,.07],w:11},              // Iowa / Nebraska farm country
  TA:{t:[82,76,63,50,41],sd:7,r:[.14,.09,.05,.04,.04],s:[.7,.6,.3,.1,0],f:[.01,.01,.01,.02,.02],w:10,alt:.5},         // New Mexico desert and mountains
  LG:{t:[90,86,78,68,60],sd:6,r:[.14,.15,.10,.09,.10],s:[.55,.5,.35,.25,.2],f:[.03,.03,.05,.08,.10],w:10},            // south Texas and the Gulf
  CO:{t:[86,85,79,71,65],sd:4,r:[.25,.22,.12,.07,.07],s:[.75,.7,.45,.2,.15],f:[.02,.02,.03,.05,.08],w:8},             // Florida
  MG:{t:[84,79,68,57,48],sd:6,r:[.12,.10,.08,.10,.12],s:[.55,.45,.25,.15,.1],f:[.04,.05,.06,.08,.09],w:6},            // Georgia / Alabama
  AC:{t:[86,83,74,63,55],sd:6,r:[.17,.14,.09,.11,.12],s:[.6,.5,.3,.2,.15],f:[.05,.06,.08,.12,.14],w:7},              // Louisiana bayou
  CU:{t:[78,72,60,48,40],sd:7,r:[.12,.11,.10,.11,.11],s:[.45,.35,.15,.08,.05],f:[.07,.08,.10,.10,.10],w:7},           // Appalachia and the Atlantic shore
  SU:{t:[72,63,50,38,30],sd:10,r:[.11,.08,.07,.07,.07],s:[.55,.3,.1,0,0],f:[.02,.02,.02,.02,.02],w:10,alt:1},          // Colorado Rockies
  GR:{t:[74,63,48,34,24],sd:10,r:[.08,.08,.07,.06,.06],s:[.45,.25,.05,0,0],f:[.02,.02,.02,.03,.03],w:16,alt:.5},       // Wyoming / Montana high plains
  CS:{t:[70,64,54,45,40],sd:5,r:[.07,.14,.35,.55,.55],s:[.15,.1,.05,.05,.05],f:[.05,.08,.14,.15,.15],w:8},            // Pacific Northwest
  AU:{t:[58,49,36,23,17],sd:7,r:[.22,.30,.25,.18,.18],s:[.03,.03,0,0,0],f:[.08,.10,.10,.08,.08],w:8},                 // Alaska
  KM:{t:[82,82,80,77,75],sd:3,r:[.14,.14,.18,.24,.25],s:[.05,.05,.07,.1,.1],f:[0,0,0,0,0],w:13}                       // Hawaii trade winds
};
function _wxRand(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function _wxLerp(a,x){const i=Math.floor(x),f=x-i;return i>=a.length-1?a[a.length-1]:a[i]*(1-f)+a[i+1]*f;}
// the forecast for one night in one state; the same seed always gives the same weather
function wxMake(st,date,seed){
  const C=WX_CLIM[st]||WX_CLIM.CF,R=_wxRand(seed),d=date instanceof Date&&!isNaN(date)?date:new Date(2026,9,2);
  const mx=Math.max(0,Math.min(4,d.getMonth()-7+(d.getDate()-15)/30));
  const nrm=()=>{let u=0;for(let i=0;i<4;i++)u+=R();return(u-2)/0.577;};
  let t=_wxLerp(C.t,mx)+nrm()*C.sd,w=C.w*(0.35+R()*1.1)*(R()<0.12?1.6:1),k='clear',i=0;
  const pr=_wxLerp(C.r,mx),ps=_wxLerp(C.s,mx),pf=_wxLerp(C.f,mx),u=R();
  if(u<pr){
    if(t<=34){k='snow';i=t<=26||R()<0.35?0.6+R()*0.4:0.25+R()*0.35;w*=1.1;}
    else if(R()<ps){k='storm';i=0.7+R()*0.3;w*=1.35;t-=4;}
    else{k='rain';i=0.25+R()*0.7;t-=3;}
  }else if(u<pr+pf&&w<10){k='fog';i=0.45+R()*0.55;w=Math.min(w,5);}
  else if(R()<0.22+pr*1.5)k='cloudy';
  return{k,i:Math.round(i*100)/100,t:Math.round(t),w:Math.round(w),d:Math.round(R()*359),st:WX_CLIM[st]?st:'CF',alt:C.alt||0,m:Math.round(mx*100)/100};
}
// a game's forecast: the home team's state, the game's date and a seed from the teams and the season
function gameWx(home,dateIdx,awayId){
  if(!home)return null;let st='CF';try{st=home.fp?'CF':stOf(home);}catch(e){}
  const d=GAME_DATES[dateIdx]||null,yr=(G&&G.yr)||1;
  const seed=((home.id|0)*2654435761^((yr*977+(dateIdx|0)*7919+((awayId|0)%997)*31)>>>0))>>>0;
  return wxMake(st,d,seed);
}
const WX_NAMES={clear:'Clear',cloudy:'Overcast',rain:'Rain',storm:'Thunderstorms',snow:'Snow',fog:'Fog'};
function wxName(w){if(!w)return'';if(w.k==='rain'&&w.i>0.65)return'Heavy rain';if(w.k==='snow'&&w.i>0.65)return'Heavy snow';if(w.k==='clear'&&w.w>=18)return'Windy';if(w.k==='clear'&&w.t>=90)return'Hot and humid';if(w.k==='clear'&&w.t<=32)return'Bitter cold';return WX_NAMES[w.k]||'Clear';}
function wxDirArrow(d){return['↓','↙','←','↖','↑','↗','→','↘'][Math.round(((d%360)+360)%360/45)%8];}
function wxLine(w){if(!w)return'';return`${wxName(w)} · ${w.t}°F · wind ${w.w} mph`;}
// what it changes on the field, in plain words
function wxEffects(w){if(!w)return'';const o=[];
  if(w.k==='rain'||w.k==='storm')o.push('wet ball: more drops and fumbles, shakier throws, slower cuts');
  if(w.k==='storm')o.push('lightning and heavy wind gusts');
  if(w.k==='snow')o.push('slick snow-covered field: slower players, more drops and fumbles, shorter kicks');
  if(w.k==='fog')o.push('fog: deep balls are harder to track');
  if(w.w>=14)o.push('wind pushes kicks and deep passes around');
  if(w.t>=90)o.push('heat: players tire faster');
  if(w.t<=30&&w.k!=='snow')o.push('freezing: a hard ball, shorter kicks, more drops');
  if(w.alt&&w.alt>=1)o.push('thin mountain air: the ball carries farther');
  return o.length?o.join(' · '):'good football weather';}
function wxIcon(w,sz){sz=sz||18;if(!w)return'';const k=w.k==='clear'&&w.w>=18?'wind':w.k;
  const sun='<circle cx="12" cy="12" r="4.6" fill="#ffd34a"/><g stroke="#ffd34a" stroke-width="1.8" stroke-linecap="round"><path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/></g>';
  const cloud=(c)=>`<path d="M6.5 17.5h11a3.6 3.6 0 0 0 .4-7.2 5.2 5.2 0 0 0-10-1.2A4.2 4.2 0 0 0 6.5 17.5z" fill="${c}"/>`;
  const body={clear:sun,cloudy:cloud('#aeb8c4'),
    rain:cloud('#8d99a8')+'<g stroke="#5fb0ff" stroke-width="1.8" stroke-linecap="round"><path d="M8 19.5l-1 2.5M12 19.5l-1 2.5M16 19.5l-1 2.5"/></g>',
    storm:cloud('#6f7a88')+'<path d="M12.5 15.5l-2.6 4.2h2.4l-1.4 3.6 4.2-5.3h-2.5l1.6-2.5z" fill="#ffd34a"/>',
    snow:cloud('#b9c3cf')+'<g fill="#ffffff" stroke="#8fb4d8" stroke-width=".5"><circle cx="8" cy="20.5" r="1.3"/><circle cx="12" cy="21.8" r="1.3"/><circle cx="16" cy="20.5" r="1.3"/></g>',
    fog:'<g stroke="#b9c3cf" stroke-width="2" stroke-linecap="round"><path d="M4 9h16M3 13h18M5 17h14"/></g>',
    wind:'<g fill="none" stroke="#9cc7e8" stroke-width="2" stroke-linecap="round"><path d="M3 9h11a3 3 0 1 0-3-3M3 14h15a3 3 0 1 1-3 3M3 19h8"/></g>'}[k]||sun;
  return`<svg viewBox="0 0 24 24" width="${sz}" height="${sz}" style="vertical-align:middle;flex-shrink:0" aria-hidden="true">${body}</svg>`;}
function wxChip(w){if(!w)return'';return`<span class="wx-chip" title="${wxEffects(w)}">${wxIcon(w,16)}<span>${wxName(w)} · ${w.t}°F · ${w.w} mph</span></span>`;}
// how much the weather pulls a simulated game around: fewer points, fewer passing yards, more upsets
function wxSimF(w){
  if(!w)return{sc:1,pass:1,upset:1};
  const wet=w.k==='rain'?0.35+0.65*w.i:w.k==='storm'?1:0,sn=w.k==='snow'?0.5+0.5*w.i:0,wd=Math.max(0,Math.min(1,(w.w-12)/18)),fg=w.k==='fog'?w.i:0,fr=w.t<=20?1:0;
  return{sc:1-wet*0.12-sn*0.18-wd*0.07-fg*0.04-fr*0.04,pass:1-wet*0.2-sn*0.25-wd*0.18-fg*0.07,upset:1-wet*0.12-sn*0.15-wd*0.06};
}
// scale a final score by the weather while keeping the same winner (and a tie a tie)
function wxScale(a,b,f){
  if(!(f<0.999))return[a,b];let x=Math.round(a*f),y=Math.round(b*f);
  if(a>b&&x<=y)x=y+Math.max(1,Math.round((a-b)*f));else if(b>a&&y<=x)y=x+Math.max(1,Math.round((b-a)*f));else if(a===b)y=x;
  return[x,y];}
// home team of a game the way Game Day decides it
function gdHomeIsOpp(kind,info){if(kind==='reg'){const gm=G.sched[info.idx];return!!(gm&&((gm.wk+G.myId)%2===1));}return!((G.wins||0)>=((info.opp&&info.opp.wins)||0));}
function gdWxFor(kind,info){
  try{if(kind==='nat')return wxMake('CF',GAME_DATES[Math.min(GAME_DATES.length-1,(G.sched||[]).length)]||null,((G.yr||1)*7331+(info.opp?info.opp.id:0))>>>0);
    const opp=info.opp,me=myS(),H=gdHomeIsOpp(kind,info)?opp:me,A=H===me?opp:me;
    const g=kind==='reg'?G.sched[info.idx]:info.slot;const di=g&&g.wk?g.wk-1:0;
    return gameWx(H,di,A&&A.id);}catch(e){return null;}}
/*</weather>*/
// the venue's state sets its scenery (desert mesas, bayou cypress, snowy peaks, the ocean …)
function stadSt(s){try{if(s&&s.fp)return(window.FP&&FP.store&&FP.store.vst)||'CF';return s?stOf(s):'CF';}catch(e){return'CF';}}
function stadInfo(t,cust,s){const i=stadApply(stadBase(t),cust,s);i.st=stadSt(s);return i;}
// practice venue: the stadium itself (afternoon, empty stands) until tier 5, then a dedicated practice field that improves every tier
function pracLevel(t){t=Math.max(1,Math.min(20,t|0));return t<5?0:t-4;}
function pracInfo(t,cust,s){
  t=Math.max(1,Math.min(20,t|0));const L=pracLevel(t);
  if(!L){const i=stadInfo(t,cust,s);return Object.assign(i,{kind:'prac',pracAt:'stadium',pl:0,name:i.name+' (practice)',fill:0,crowdLine:false,cheer:0,day:true,trucks:t<=2});}
  const b={tier:t,kind:'prac',pl:L,name:PRAC_NAMES[L-1],cap:0,
    turf:L<=2?'worn':L<=6?'grass':'turf',stripes:L>=4,lineA:L<=1?0.6:L<=3?0.78:0.92,nums:L>=3,hashes:true,
    posts:L<=3?'h':'y',padded:L>=9,stands:L>=6&&L<=15?'alum':'none',rows:L>=6?(L>=11?4:3):0,xa:44,xb:76,upper:false,roof:false,endSeats:false,
    fill:0,crowdLine:false,trucks:false,lights:L<=4?null:L<=10?'steel':'tower',bright:1,towers:L<=4?[]:L<=10?[-6,40,80,126]:[-6,22,50,78,106,134],
    fence:L<=3?'chain':L<=9?'screen':'wall',board:L>=8?'small':null,pressBox:null,track:false,scenery:L<=5?'rural':L<=11?'town':'city',
    cheer:0,ezColor:L>=5,ezText:L>=8,logoDef:L>=7?'logo':'none',day:true,indoor:L>=16,
    tower:L>=3,sleds:L<=2?1:L<=6?2:3,dummies:L<=2?3:L<=8?6:10,building:L<=5?'school':L<=11?'fieldhouse':'center',twin:L>=8&&L<=15};
  const o=stadApply(b,cust,s);o.st=stadSt(s);return o;
}
function stadDesc(i){
  if(i.kind==='prac'){if(!i.pl)return'Practice is held in your stadium until tier 5';
    return[i.indoor?'college-level indoor facility':'',i.turf==='turf'?'artificial turf':i.turf==='grass'?'natural grass':'worn grass',i.tower&&!i.indoor?'coaching tower':'',i.fence==='wall'?'padded walls':i.fence==='screen'?'wind screens':'chain-link fence',i.lights&&!i.indoor?'practice lights':'',i.stands!=='none'?'small bleachers':'',i.twin?'two fields':'',i.building==='center'&&!i.indoor?'training center':i.building==='fieldhouse'?'fieldhouse':''].filter(Boolean).join(' · ');}
  const st={none:'no stands',wood:'old wooden benches',alum:i.rows+'-row aluminum bleachers',concrete:'concrete grandstand',bowl:'two-deck bowl'}[i.stands];
  return[i.tier===1?'standing room only':`${i.cap.toLocaleString()} seats`,st,i.roof?'covered roof':'',{dirt:'patchy dirt field',worn:'worn natural grass',grass:'manicured grass',turf:'artificial turf'}[i.turf],i.track?'running track':'',
    {pole:'wooden light poles',steel:'steel light poles',tower:'light towers',led:'LED light banks'}[i.lights],i.board?{flip:'hand-flip scoreboard',small:'small scoreboard',medium:'scoreboard',video:'video board'}[i.board]:'no scoreboard',
    i.pressBox?{shed:'press booth',box:'press box',tower:'press tower'}[i.pressBox]:'',i.scenery==='city'?'city skyline':i.scenery==='town'?'town backdrop':'rural tree line'].filter(Boolean).join(' · ');
}
// the state's horizon in the venue preview (same scenery Game Day draws)
function stadPrevFar(st,day){
  const R=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
  const N=c=>day?c:_gdDark(c,.62),P=(pts,c)=>`<polygon points="${pts}" fill="${N(c)}"/>`,F={CF:'hills',WK:'plains',TA:'mesa',LG:'flat',CO:'ocean',MG:'pinehills',AC:'bayou',CU:'ridges',SU:'peaks',GR:'buttes',CS:'volcano',AU:'peaks',KM:'shield'}[st]||'hills';
  let o='';
  if(F==='peaks'){o+=P('0,44 20,22 34,32 52,12 70,30 88,18 108,36 126,14 146,30 166,20 186,34 206,10 226,30 246,18 266,32 284,16 300,28 300,44','#7f90a8');o+=P('46,18 52,12 58,18 54,17','#f4f7fa')+P('120,20 126,14 132,20 128,19','#f4f7fa')+P('200,16 206,10 212,16 208,15','#f4f7fa');if(st==='AU')o+=P('80,24 88,18 96,24','#f4f7fa')+P('278,22 284,16 290,22','#f4f7fa');}
  else if(F==='mesa'){o+=P('0,44 0,38 30,38 30,26 70,26 76,38 140,38 146,22 200,22 206,38 260,38 260,30 290,30 296,40 300,40 300,44','#c98d5c');}
  else if(F==='volcano'){o+=P('120,44 170,8 220,44','#8d9db3')+P('160,15 170,8 180,15 175,17 166,16','#f6f8fb')+P('0,44 0,36 40,34 90,38 140,35 200,37 260,34 300,36 300,44','#4d6a5b');}
  else if(F==='shield'){o+=P('40,44 150,16 260,44','#5b7f61');o+=R(0,40,300,4,N('#2f8fb5'));}
  else if(F==='ridges'){o+=P('0,44 0,30 50,24 100,30 150,22 200,28 250,22 300,28 300,44','#8aa0bf')+P('0,44 0,36 60,30 120,36 180,30 240,36 300,32 300,44','#7189ab');}
  else if(F==='buttes'){o+=P('0,44 0,40 40,40 46,30 90,30 96,40 180,40 186,32 220,32 226,40 300,40 300,44','#ad9c7a');}
  else if(F==='hills'||F==='pinehills'){o+=P('0,44 0,36 50,32 100,36 160,30 220,35 300,31 300,44',F==='hills'?'#93a684':'#5f8259');}
  else if(F==='ocean'){o+=R(0,38,300,6,N('#3f87b8'));}
  else if(F==='bayou'){o+=R(0,40,300,4,N('#4d5e45'));}
  else if(F==='plains'){for(const x of[60,150,240])o+=`<line x1="${x}" y1="40" x2="${x}" y2="18" stroke="${N('#e9edf1')}" stroke-width="1"/><path d="M${x} 18l-7-4M${x} 18l7-4M${x} 18v8" stroke="${N('#e9edf1')}" stroke-width="1"/>`;}
  return o;}
// small picture of the venue, drawn from the same descriptor the game uses
function stadPreviewSvg(i,w){
  w=w||300;const H=120,day=i.day,ind=i.indoor;let o='';
  const R=(x,y,ww,hh,c,op)=>`<rect x="${x}" y="${y}" width="${ww}" height="${hh}" fill="${c}"${op!=null?` opacity="${op}"`:''}/>`;
  if(ind){o+=R(0,0,300,76,'#4a505a');o+=R(0,0,300,52,'#2a2e35');o+=R(0,64,300,10,i.wall);for(let k=0;k<6;k++)o+=R(10+k*50,6,34,4,'#f4f7ff');for(let k=0;k<12;k++)o+=R(k*25,0,1,52,'#3a3f48');o+=R(0,30,300,24,i.wall);o+=`<text x="150" y="45" font-size="9" font-weight="900" text-anchor="middle" fill="${i.c2}" font-family="Nunito,sans-serif">Performance center</text>`;}
  else{o+=`<defs><linearGradient id="sk${i.tier}${i.kind}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${day?'#4f9de0':'#070b1c'}"/><stop offset="1" stop-color="${day?'#bfe3f7':'#1b2850'}"/></linearGradient></defs>`+R(0,0,300,56,`url(#sk${i.tier}${i.kind})`);
    if(day)o+=`<circle cx="262" cy="13" r="7" fill="#fff4c2"/>`;else o+=`<circle cx="262" cy="12" r="4" fill="#e9e7d6"/>`;
    o+=stadPrevFar(i.st||'CF',day);
    o+=R(0,40,300,16,day?'#3c6b37':'#0b1a12');
    if(i.scenery==='city')for(let k=0;k<14;k++){const hh=8+((k*37)%22);o+=R(k*22,40-hh,16,hh+2,day?'#8a97a8':'#151b28');}
    if(i.scenery==='town')for(let k=0;k<6;k++)o+=R(14+k*52,34,20,8,day?'#a58a6e':'#1a1f2a');}
  const sa=Math.max(0,(i.xa+10)/140*300),sb=Math.min(300,(i.xb+10)/140*300);
  for(const ty of i.towers||[]){const x=(ty+10)/140*300;if(ind||!i.lights)break;const tall=i.lights==='pole'?28:i.lights==='steel'?36:44;
    o+=R(x-1,52-tall,2,tall,i.lights==='pole'?'#6b4a2a':'#5a646e');o+=R(x-6,52-tall-3,12,6,'#252b33');if(!day)o+=`<circle cx="${x}" cy="${52-tall}" r="${i.lights==='led'?11:8}" fill="#fff6c8" opacity="${i.lights==='pole'?.25:.4}"/>`;}
  if(i.stands!=='none'&&!ind){const rows=i.rows+(i.upper?4:0),top=74-rows*3.2;
    if(i.roof)o+=R(sa-4,top-8,sb-sa+8,4,'#59636e');
    o+=R(sa,top,sb-sa,74-top,i.stands==='concrete'||i.stands==='bowl'?'#6b7078':'#2b333d');
    for(let r=0;r<rows;r++){const y=top+r*3.2+2;o+=R(sa,y,sb-sa,1.2,i.seat);if(i.seat2)for(let x=sa;x<sb;x+=12)o+=R(x,y,6,1.2,i.seat2);
      if(i.fill>0)for(let x=sa+1;x<sb-1;x+=3){if(((x*7+r*13)%100)/100<i.fill)o+=R(x,y-1.6,1.6,1.6,['#e7c39b','#8d5a3b','#c88f62','#5b3a25'][(x+r)%4]);}}
    if(i.pressBox){const pw=i.pressBox==='tower'?70:i.pressBox==='box'?52:26,ph=i.pressBox==='tower'?18:i.pressBox==='box'?12:8;o+=R(150-pw/2,top-ph,pw,ph,'#e3e7ec');o+=R(150-pw/2,top-ph,pw,2,i.c1);}}
  if(i.board&&!ind){const bw=i.board==='video'?56:i.board==='medium'?38:i.board==='small'?26:18,bh=i.board==='video'?24:i.board==='flip'?10:14;o+=R(262-bw/2,44-bh,bw,bh,i.board==='flip'?'#6b4a2a':'#11161d');if(i.board==='video')o+=R(264-bw/2,46-bh,bw-4,bh-4,'#2d5c9a');o+=R(261,44,2,12,'#3a424c');}
  if(i.kind==='prac'&&i.pl&&!ind){if(i.building==='school')o+=R(10,30,70,26,'#8a4b3a');else o+=R(8,22,90,34,i.building==='center'?'#cfd5dd':'#a7aeb8');if(i.building!=='school')o+=R(8,22,90,4,i.c1);}
  // field
  o+=R(0,74,300,46,i.turfOut);
  const fy=78,fh=34;for(let k=0;k<20;k++){const x=20+k*13;o+=R(x,fy,13,fh,k<2||k>=18?(i.ezK==='turf'?i.turfA:(i.ezK==='checker'&&k%2?i.ez2:i.ez)):(k%2?i.turfB:i.turfA));}
  if(i.turf==='dirt'||i.turf==='worn')for(let k=0;k<(i.turf==='dirt'?14:6);k++)o+=R(40+((k*53)%220),fy+4+((k*17)%24),10+(k%3)*4,5,'#8a6b45',.55);
  for(let k=2;k<=18;k++)o+=R(20+k*13,fy,0.8,fh,'#fff',i.lineA);
  if(i.logo!=='none')o+=`<ellipse cx="150" cy="${fy+fh/2}" rx="9" ry="7" fill="${i.c1}" stroke="${i.c2}" stroke-width="1.5"/>`;
  if(i.track)o+=R(0,112,300,8,i.trackCol[0]);
  if(i.fence==='wall'||i.fence==='screen')o+=R(0,72,300,3,i.wall);
  if(!day&&i.bright<1)o+=R(0,0,300,120,'#000814',(1-i.bright)*0.8);
  return`<svg viewBox="0 0 300 ${H}" width="${w}" height="${Math.round(w*H/300)}" style="display:block;border-radius:10px;max-width:100%">${o}</svg>`;
}
function stadCustHtml(cust,i,set){
  const cur={turf:i.turfK,ez:i.ezK,eztxt:i.ezTxtK,ezfont:i.ezFont,logo:i.logo,seats:i.seatK,track:i.trackK};
  const sel=(k,list,lab,dis)=>`<label style="font-size:12px;color:var(--mu)">${lab}<br><select ${dis?'disabled':''} onchange="${set}('${k}',this.value)">${list.map(([v,l,art])=>`<option value="${v}"${cur[k]===v?' selected':''}${art&&i.turf!=='turf'?' disabled':''}>${l}${art&&i.turf!=='turf'?' (turf only)':''}</option>`).join('')}</select></label>`;
  return`<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px">${sel('turf',STAD_TURF,'Field color')}${sel('ez',STAD_EZ,'End zones',!i.ezColor)}${sel('eztxt',STAD_EZTXT,'End zone text',!i.ezText)}${sel('ezfont',STAD_EZFONT,'End zone font',!i.ezText||i.ezTxtK==='none')}${sel('logo',STAD_LOGO,'Midfield')}
    ${sel('seats',STAD_SEATS,'Seats',i.stands==='none'||i.stands==='wood')}${sel('track',STAD_TRACK,'Track',!i.track)}</div>`;
}
function stadCost(t){return Math.round(12000*Math.pow(t,1.35)/1000)*1000;}
function upgStad(){const s=myS(),t=stadOf(s);if(t>=20)return;const c=stadCost(t);if(!hasFunds(c)){notify('Not enough budget for this upgrade.','e');return;}
  G.budget-=c;s.stad=t+1;addLog(`<span style="color:var(--gn)">Stadium upgraded to tier ${t+1}: ${STAD_NAMES[t]}.</span>`);if(t+1===5)addLog('<span style="color:var(--gn)">Your program now has its own practice field.</span>');notify(`Welcome to ${STAD_NAMES[t]}!`);nav('staff');}
function stadSetC(k,v){const s=myS();s.stadC=Object.assign({},s.stadC||{},{[k]:v});nav('staff');}
function stadPanel(){
  const s=myS(),t=stadOf(s),i=stadInfo(t,s.stadC,s),n=t<20?stadInfo(t+1,s.stadC,s):null,c=t<20?stadCost(t):0,can=t<20&&hasFunds(c),pi=pracInfo(t,s.stadC,s),pn=t<20?pracInfo(t+1,s.stadC,s):null;
  return`<div class="pnl" style="margin-bottom:14px"><div class="ph">Stadium <span style="font-size:12px;color:var(--mu);font-weight:600">Tier ${t}/20</span></div><div class="pb">
    <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start">
      <div style="flex:1 1 300px;max-width:420px">${stadPreviewSvg(i,420)}</div>
      <div style="flex:1 1 240px;min-width:0"><div style="font-weight:800;font-size:16px">${i.name}</div><div style="font-size:12px;color:var(--mu);margin-top:2px">${stadDesc(i)}</div>
      ${n?`<div style="font-size:12px;color:var(--te);margin-top:6px">Next: ${n.name} (${stadDesc(n)})</div>`:''}
      <button class="btn bsm bbl" style="margin-top:10px" ${can?'onclick="upgStad()"':'disabled style="opacity:.4;margin-top:10px"'}>${t>=20?'MAX':`Upgrade $${c.toLocaleString()}`}</button></div></div>
    <div style="display:flex;gap:2px;margin-top:10px">${Array.from({length:20},(_,k)=>`<div style="flex:1;height:6px;border-radius:2px;background:${k<t?'var(--ac)':'var(--bd)'}"></div>`).join('')}</div>
    <div style="font-size:12px;font-weight:800;color:var(--mu);margin-top:12px">Customize</div>${stadCustHtml(s.stadC||{},i,'stadSetC')}
    <div style="font-size:12px;font-weight:800;color:var(--mu);margin-top:16px">Practice facility</div>
    <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start;margin-top:6px">
      <div style="flex:1 1 240px;max-width:320px">${stadPreviewSvg(pi,320)}</div>
      <div style="flex:1 1 220px;min-width:0"><div style="font-weight:800">${pi.pl?pi.name+` <span style="font-size:11px;color:var(--mu)">Level ${pi.pl}/16</span>`:'No practice field yet'}</div><div style="font-size:12px;color:var(--mu);margin-top:2px">${stadDesc(pi)}</div>
        ${pn&&pn.pl?`<div style="font-size:12px;color:var(--te);margin-top:6px">Next: ${pn.name}${pn.pl===1?' (unlocks at stadium tier 5)':''}</div>`:''}</div></div>
    <div style="font-size:11px;color:var(--mu);margin-top:8px">Home games are held here. Better stadiums bring a nicer field, bigger and fuller stands, brighter lights, a track and a city backdrop. From tier 5 the team gets its own practice field, and it improves with every stadium upgrade up to a college-level indoor facility at tier 20.</div>
  </div></div>`;
}
// ── pre-game preview data ──
function _gdTeamLog(s){
  if(s.id===G.myId)return(G.sched||[]).filter(g=>g.result&&g.result!=='bye'&&g.my!=null).map(g=>({w:g.result==='W',us:g.my,them:g.opp,o:g.oppId}));
  return(s.gl&&s.gl.yr===G.yr?s.gl.g:[]).map(e=>({w:e.us>e.them,us:e.us,them:e.them,o:e.o}));
}
function _gdStreak(log){if(!log.length)return'';const last=log[log.length-1].w;let n=0;for(let i=log.length-1;i>=0&&log[i].w===last;i--)n++;return(last?'W':'L')+n;}
function _gdStatLine(p){const s=p.seasStats||{};
  if(p.pos==='QB'&&s.passYds)return`${s.passYds} pass yds, ${s.passTD||0} TD${s.passAtt?', '+fmtPct(s.passCmp/s.passAtt):''}`;
  if((p.pos==='RB')&&s.rushYds)return`${s.rushYds} rush yds, ${s.rushTD||0} TD${s.rushAtt?', '+fmtAvg(s.rushYds/s.rushAtt)+' ypc':''}`;
  if((p.pos==='WR'||p.pos==='TE')&&s.recYds)return`${s.recYds} rec yds, ${s.recTD||0} TD${s.rec?', '+fmtAvg(s.recYds/s.rec)+' per catch':''}`;
  if(['DL','LB','CB','S'].includes(p.pos)&&(s.tackles||s.sacks||s.ints))return`${s.tackles||0} tackles${s.sacks?', '+s.sacks+' sacks':''}${s.ints?', '+s.ints+' INT':''}`;
  return`${p.rat} OVR${p.stars?' · '+p.stars+'★ recruit':''}`;}
function _gdStars(s){const ps=(s.id===G.myId?myP():sPlayers(s.id)).filter(p=>!(p.inj>0));
  const sc=p=>p.rat+(p.stars||0)*2+((p.seasStats||{}).passYds||0)/200+((p.seasStats||{}).rushYds||0)/120+((p.seasStats||{}).recYds||0)/120+((p.seasStats||{}).tackles||0)/8;
  return ps.sort((a,b)=>sc(b)-sc(a)).slice(0,2);}
function gdPreviewHtml(me,opp,homeIdx){
  const T=[me,opp],logs=T.map(_gdTeamLog),rk=T.map(s=>typeof rkOf==='function'?rkOf(s.id):{c:0,a:0});
  const rec=s=>`${s.wins||0}-${s.losses||0}`,ppg=(l,k)=>l.length?(l.reduce((a,g)=>a+g[k],0)/l.length).toFixed(1):'–';
  const form=l=>l.slice(-3).map(g=>`<span style="display:inline-block;width:18px;height:18px;line-height:18px;border-radius:50%;font-size:10px;font-weight:900;color:#fff;background:${g.w?'#2fbf63':'#e0484b'};margin-right:2px">${g.w?'W':'L'}</span>`).join('')||'<span style="opacity:.6">no games yet</span>';
  const ovr=s=>s.id===G.myId?Math.round(((G.offR||0)+(G.defR||0))/2):teamOvr(s.id);
  const facts=[];
  T.forEach((s,i)=>{const l=logs[i],st=_gdStreak(l);if(st&&+st.slice(1)>=2)facts.push(`${s.mascot} have ${st[0]==='W'?'won':'lost'} ${st.slice(1)} straight.`);
    if(rk[i].n&&rk[i].n<=25)facts.push(`${s.mascot} are #${rk[i].n} in the National Top 25.`);else if(rk[i].a&&rk[i].a<=25)facts.push(`${s.mascot} are #${rk[i].a} in the All-${stName(stOf(s))} Top 25.`);
    if(l.length){const big=l.reduce((a,g)=>Math.max(a,g.us-g.them),-99);if(big>=21)facts.push(`${s.mascot} have won a game by ${big} this season.`);}
    if(l.length>=2){const pa=l.reduce((a,g)=>a+g.them,0)/l.length;if(pa<14)facts.push(`${s.mascot} defense allows only ${pa.toFixed(1)} points per game.`);const pf=l.reduce((a,g)=>a+g.us,0)/l.length;if(pf>=35)facts.push(`${s.mascot} offense is scoring ${pf.toFixed(1)} points per game.`);}
    if((s.prestige||0)>=4)facts.push(`${s.name} is a ${'★'.repeat(s.prestige)} program with a proud history.`);});
  const met=logs[0].find(g=>g.o===opp.id);if(met)facts.push(`Rematch: ${me.mascot} ${met.w?'won':'lost'} ${met.us}-${met.them} earlier this season.`);
  if(Math.abs(ovr(me)-ovr(opp))>=8)facts.push(`On paper the ${ovr(me)>ovr(opp)?me.mascot:opp.mascot} have a clear edge in talent.`);
  else facts.push('On paper this one is close. Expect a battle.');
  const home=T[homeIdx||0],si=stadInfo(stadOf(home));facts.push(`Tonight at ${si.name} (${si.tier===1?'standing room only':si.cap.toLocaleString()+' seats'}), home of the ${home.mascot}.`);
  try{const w=window.__GP&&window.__GP.weather;if(w)facts.push(`Forecast: ${wxLine(w).toLowerCase()}. ${wxEffects(w).replace(/^./,c=>c.toUpperCase())}.`);}catch(e){}
  const logo=s=>{const L=sLogoStandalone(s,64);return L;};
  const col=(s,i)=>`<div style="flex:1;min-width:0;text-align:center">${logo(s)}<div style="font-weight:900;font-size:17px;margin-top:2px">${s.name.replace(/\s+High.*$/,'')} ${s.mascot}</div>
    <div style="font-size:12px;opacity:.85">${rec(s)}${rk[i].n&&rk[i].n<=25?` · <b style="color:#8fc4ff">#${rk[i].n} National</b>`:rk[i].a&&rk[i].a<=25?` · <b style="color:#ffcf4a">#${rk[i].a} ${stName(stOf(s))}</b>`:rk[i].c&&rk[i].c<=25?` · <b style="color:#ff7a7a">#${rk[i].c} ${clsL(s.cls)}</b>`:''}</div></div>`;
  const row=(l,a,b)=>`<tr><td style="text-align:right;padding:3px 8px;font-weight:800">${a}</td><td style="text-align:center;opacity:.7;font-size:11px;padding:3px 8px">${l}</td><td style="text-align:left;padding:3px 8px;font-weight:800">${b}</td></tr>`;
  const star=(p,s)=>`<div style="display:flex;align-items:center;gap:8px;padding:6px;border-radius:12px;background:rgba(255,255,255,.08);margin-top:6px">${face(p.fs!=null?p.fs:p.id,46)}<div style="text-align:left;min-width:0"><div style="font-weight:800;font-size:13px">#${p.num} ${p.fn} ${p.ln}</div><div style="font-size:11px;opacity:.8">${p.pos} · ${s.mascot} · ${_gdStatLine(p)}</div></div></div>`;
  const stars=T.map(s=>_gdStars(s).map(p=>star(p,s)).join(''));
  return`<div style="font-family:Nunito,'Segoe UI',system-ui,sans-serif;color:#eef7ff">
    <div style="text-align:center;font-size:11px;letter-spacing:.12em;font-weight:900;opacity:.8">Matchup preview</div>
    <div style="display:flex;align-items:center;gap:10px;margin:8px 0 10px">${col(me,0)}<div style="font-weight:900;font-size:22px;opacity:.7">VS</div>${col(opp,1)}</div>
    <table style="margin:0 auto 10px;border-collapse:collapse;font-size:13px">${row('Record',rec(me),rec(opp))}${row('Last 3',form(logs[0]),form(logs[1]))}${row('Points for / game',ppg(logs[0],'us'),ppg(logs[1],'us'))}${row('Points against / game',ppg(logs[0],'them'),ppg(logs[1],'them'))}${row('Team rating',ovr(me),ovr(opp))}</table>
    <div style="font-size:12px;font-weight:900;opacity:.8;margin-bottom:4px">Keys to the game</div>
    <ul style="margin:0 0 10px 18px;padding:0;font-size:13px;line-height:1.45">${facts.slice(0,6).map(f=>`<li>${f}</li>`).join('')}</ul>
    <div style="font-size:12px;font-weight:900;opacity:.8">Players to watch</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap"><div style="flex:1 1 220px">${stars[0]}</div><div style="flex:1 1 220px">${stars[1]}</div></div></div>`;
}

