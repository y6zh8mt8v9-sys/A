// v2.14: true inside the native app wrapper (Capacitor or a WKWebView shell)
var IS_AND=/Android/i.test(navigator.userAgent||''),IS_LOWEND=IS_AND&&((navigator.deviceMemory||8)<=4||(navigator.hardwareConcurrency||8)<=4);
try{if(IS_AND)document.documentElement.classList.add('and');if(IS_LOWEND)document.documentElement.classList.add('lowend');}catch(e){}
var IS_NATIVE=!!(window.Capacitor&&(window.Capacitor.isNativePlatform?window.Capacitor.isNativePlatform():true))||location.protocol==='capacitor:'||location.protocol==='ionic:';
'use strict';

// ═══════════ v2.16 team colors: the whole menu takes your school's colors ═══════════
function _thHex(h){h=String(h||'').replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return isNaN(n)?null:[n>>16&255,n>>8&255,n&255];}
function _thLum(c){return(0.2126*c[0]+0.7152*c[1]+0.0722*c[2])/255;}
function _thBright(c){ // raise HSL lightness to at least .46 (saturation kept) so dark maroon becomes red, not pink
  let[r,g,b]=c.map(v=>v/255);const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,S=0,L=(mx+mn)/2;
  if(mx!==mn){const d=mx-mn;S=L>0.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h/=6;}
  if(_thLum(c)>=0.3)return c.slice();L=Math.max(L,S<0.15?0.62:0.46);if(S>0.15)S=Math.max(S,0.62);
  const f=(p,q,t)=>{if(t<0)t+=1;if(t>1)t-=1;return t<1/6?p+(q-p)*6*t:t<1/2?q:t<2/3?p+(q-p)*(2/3-t)*6:p;};
  if(!S)return[L,L,L].map(v=>Math.round(v*255));const q=L<0.5?L*(1+S):L+S-L*S,p=2*L-q;return[f(p,q,h+1/3),f(p,q,h),f(p,q,h-1/3)].map(v=>Math.round(v*255));}
function _thDeep(c){ // light mode: at most HSL lightness .40, so the color reads on white
  let[r,g,b]=c.map(v=>v/255);const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,S=0,L=(mx+mn)/2;
  if(mx!==mn){const d=mx-mn;S=L>0.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h/=6;}
  if(L<=0.4)return c.slice();L=0.4;if(S>0.15)S=Math.max(S,0.6);
  const f=(p,q,t)=>{if(t<0)t+=1;if(t>1)t-=1;return t<1/6?p+(q-p)*6*t:t<1/2?q:t<2/3?p+(q-p)*(2/3-t)*6:p;};
  if(!S)return[L,L,L].map(v=>Math.round(v*255));const q=L<0.5?L*(1+S):L+S-L*S,p=2*L-q;return[f(p,q,h+1/3),f(p,q,h),f(p,q,h-1/3)].map(v=>Math.round(v*255));}
function _thRL(c){const f=x=>{x/=255;return x<=0.03928?x/12.92:Math.pow((x+0.055)/1.055,2.4);};return 0.2126*f(c[0])+0.7152*f(c[1])+0.0722*f(c[2]);}
function _thCr(a,b){const x=_thRL(a),y=_thRL(b);return(Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);}
function _thSat(c){const mx=Math.max(...c),mn=Math.min(...c);return mx?((mx-mn)/mx):0;}
let _thKey='';
function applyTeamTheme(){
  let s=null;try{s=typeof G!=='undefined'&&G&&G.myId?myS():null;}catch(e){}
  const lightUI=document.documentElement.classList.contains('light'),key=s?(s.c1+'|'+s.c2+'|'+lightUI):'';if(key===_thKey)return;_thKey=key;const R=document.documentElement.style;
  if(!s){for(const v of['--tA','--tB','--tRGB','--tOn','--tT'])R.removeProperty(v);return;}
  const a=_thHex(s.c1),b=_thHex(s.c2);if(!a)return;
  // the main color is the more colorful one (white or black trim stays the second color)
  const sc=c=>{const l=_thLum(c);return _thSat(c)*0.55+(l>0.12&&l<0.88?0.45:0)+(l>0.25&&l<0.75?0.2:0);};
  let m=a;if(b&&sc(b)>sc(a))m=b;
  let acc=lightUI?_thDeep(m):_thBright(m);
  const dk=(_thLum(m)>0.5?m.map(v=>Math.round(v*0.45)):m.map(v=>Math.round(v*0.7))),hex=c=>'#'+c.map(v=>v.toString(16).padStart(2,'0')).join('');
  R.setProperty('--tA',hex(acc));R.setProperty('--tB',hex(dk));{let d=(_thLum(m)<0.08?acc:m).slice();for(let i=0;i<12&&_thLum(d)>0.3;i++)d=d.map(v=>Math.round(v*0.82));R.setProperty('--tRGB',d.join(','));}R.setProperty('--tOn',_thCr(acc,[17,17,17])>_thCr(acc,[255,255,255])?'#111':'#fff');
  // team color used as text: lifted (dark screens) or deepened (light screens) until it reads at 4.5:1 on the panels
  {let t=acc.slice();const bg=lightUI?[233,235,238]:[32,36,42];for(let i=0;i<24&&_thCr(t,bg)<4.6;i++)t=t.map(v=>Math.round(lightUI?v*0.9:v+(255-v)*0.12));R.setProperty('--tT',hex(t));}
  try{const mt=document.querySelector('meta[name=theme-color]');if(mt)mt.setAttribute('content',hex(dk));}catch(e){}
}
// ═══════════ THEME ═══════════
function setTheme(mode){
  setTimeout(()=>{try{_thKey='';applyTeamTheme();}catch(e){}},0);
  if(mode==='light'){
    document.documentElement.classList.add('light');
    try{localStorage.setItem('gpgm_theme','light');}catch(e){}
  } else {
    document.documentElement.classList.remove('light');
    try{localStorage.setItem('gpgm_theme','dark');}catch(e){}
  }
  // Sync setup-screen buttons (still present on setup screen)
  const db=document.getElementById('theme-dark-btn');
  const lb=document.getElementById('theme-light-btn');
  if(db&&lb){
    if(mode==='light'){db.className='bgh';db.style.background='';lb.className='btn';lb.style.background='var(--ac)';}
    else{db.className='btn';db.style.background='var(--ac)';lb.className='bgh';lb.style.background='';}
  }
  // Sync settings modal buttons
  const sdb=document.getElementById('set-dark-btn');
  const slb=document.getElementById('set-light-btn');
  if(sdb&&slb){
    if(mode==='light'){sdb.className='bgh';sdb.style.background='';slb.className='btn';slb.style.background='var(--ac)';}
    else{sdb.className='btn';sdb.style.background='var(--ac)';slb.className='bgh';slb.style.background='';}
  }
}
function toggleTheme(){
  const isLight=document.documentElement.classList.contains('light');
  setTheme(isLight?'dark':'light');
}

// v2.15 controllers (standard gamepad mapping): d-pad or left stick moves between buttons, A presses, B goes back
const PADN={prev:[],f:null,rep:0,dir:null,on:false,flick:0};
// Some laptops expose a virtual "gamepad" with a button or stick stuck on, which kept pausing the game or steering the player.
// A pad only counts once it has really been used, standard controllers win, and anything held when the pad first showed up is
// ignored until it has been let go.
const PADS={};
function padAny(){let L=[];try{L=navigator.getGamepads?navigator.getGamepads():[];}catch(e){}for(const g of L)if(g&&g.connected)return true;return false;}
function padGet(){let L=[];try{L=navigator.getGamepads?navigator.getGamepads():[];}catch(e){}let best=null,bR=null;
  for(const g of L){if(!g||!g.connected)continue;const k=g.index+'|'+g.id,bs=Array.from(g.buttons,x=>!!(x&&(x.pressed||x.value>0.5))),ax=Array.from(g.axes,v=>v||0);
    let r=PADS[k];if(!r)r=PADS[k]={b0:bs.slice(),a0:ax.slice(),live:false};
    bs.forEach((x,i)=>{if(r.b0[i]&&!x)r.b0[i]=false;});ax.forEach((v,i)=>{if(r.a0[i]!=null&&Math.abs(v-r.a0[i])>0.3)r.a0[i]=null;});
    if(!r.live&&(bs.some((x,i)=>x&&!r.b0[i])||ax.some((v,i)=>r.a0[i]==null&&Math.abs(v)>0.3)))r.live=true;
    if(r.live&&(!best||(g.mapping==='standard'&&best.mapping!=='standard'))){best=g;bR=r;}}
  if(!best)return null;
  return{id:best.id,index:best.index,mapping:best.mapping,connected:true,
    buttons:Array.from(best.buttons,(x,i)=>bR.b0[i]?{pressed:false,value:0}:{pressed:!!(x&&x.pressed),value:x?x.value:0}),
    axes:Array.from(best.axes,(v,i)=>bR.a0[i]!=null&&Math.abs(v||0)>0.3?0:(v||0))};}
function padBtns(g){return Array.from(g.buttons,x=>!!(x&&(x.pressed||x.value>0.5)));}
function padVis(el){if(!el||el.hidden)return false;const cs=getComputedStyle(el);return cs.display!=='none'&&cs.visibility!=='hidden';}
function padFoc(root){return[...root.querySelectorAll('button,select,input,textarea,a[href],[onclick]')].filter(e=>{if(e.disabled)return false;const r=e.getBoundingClientRect();if(r.width<2||r.height<2||r.bottom<0||r.top>innerHeight*3)return false;const cs=getComputedStyle(e);return cs.visibility!=='hidden'&&cs.pointerEvents!=='none'&&!e.closest('[hidden]');});}
function padMove(list,cur,dx,dy){if(!cur||!list.includes(cur))return list[0]||null;const a=cur.getBoundingClientRect(),ax=a.left+a.width/2,ay=a.top+a.height/2;let best=null,bs=1e9;
  for(const e of list){if(e===cur||e.contains(cur)||cur.contains(e))continue;const r=e.getBoundingClientRect(),x=r.left+r.width/2-ax,y=r.top+r.height/2-ay,p=x*dx+y*dy;if(p<=4)continue;const sc=p+(Math.abs(x*dy)+Math.abs(y*dx))*2.2;if(sc<bs){bs=sc;best=e;}}
  return best||cur;}
function padSetFocus(e){if(PADN.f&&PADN.f!==e)PADN.f.classList.remove('padf');PADN.f=e;if(e){e.classList.add('padf');try{e.focus({preventScroll:true});}catch(_){}try{e.scrollIntoView({block:'nearest',inline:'nearest'});}catch(_){}}}
function padDir(g,b){if(b[12])return[0,-1];if(b[13])return[0,1];if(b[14])return[-1,0];if(b[15])return[1,0];
  const x=g.axes[0]||0,y=g.axes[1]||0;if(Math.hypot(x,y)<0.6)return null;return Math.abs(x)>Math.abs(y)?[Math.sign(x),0]:[0,Math.sign(y)];}
function padNavStep(g,b,root,back){
  const d=padDir(g,b),now=performance.now(),list=padFoc(root);
  if(PADN.f&&!list.includes(PADN.f))padSetFocus(null);
  if(!PADN.f&&list.length&&root!==document.body)padSetFocus(list[0]);
  if(d){const key=d.join(',');if(key!==PADN.dir||now>PADN.rep){const first=key!==PADN.dir;PADN.dir=key;PADN.rep=now+(first?380:140);const cur=PADN.f;
      if(cur&&cur.tagName==='SELECT'&&d[0]){cur.selectedIndex=Math.max(0,Math.min(cur.options.length-1,cur.selectedIndex+d[0]));cur.dispatchEvent(new Event('change',{bubbles:true}));}
      else if(cur&&cur.type==='range'&&d[0]){d[0]>0?cur.stepUp():cur.stepDown();cur.dispatchEvent(new Event('input',{bubbles:true}));cur.dispatchEvent(new Event('change',{bubbles:true}));}
      else padSetFocus(cur?padMove(list,cur,d[0],d[1]):list[0]||null);}}
  else PADN.dir=null;
  if(b[0]&&!PADN.prev[0]){if(PADN.f)PADN.f.click();else padSetFocus(list[0]||null);}
  if(b[1]&&!PADN.prev[1]&&back)back();
}
function padStart(step){if(PADN.on)return;PADN.on=true;const loop=()=>{if(!padAny()){PADN.on=false;if(PADN.f)padSetFocus(null);return;}try{step();}catch(e){}requestAnimationFrame(loop);};requestAnimationFrame(loop);}

function padMainStep(){
  const g=padGet();if(!g)return;const b=padBtns(g),P=PADN.prev,pr=i=>b[i]&&!P[i];
  if(document.getElementById('gd-ov')){if(PADN.f)padSetFocus(null);PADN.prev=b;return;}
  const mo=document.getElementById('mo');let root=document.body,back=null;
  if(mo&&mo.classList.contains('open')){root=mo;back=()=>{try{clo();}catch(e){}};}
  else{let el=document.elementFromPoint(innerWidth/2,innerHeight/2);while(el&&el!==document.body){const cs=getComputedStyle(el);if(cs.position==='fixed'&&(+cs.zIndex||0)>=100&&padFoc(el).length){root=el;break;}el=el.parentElement;}}
  if((pr(4)||pr(5))&&root===document.body){const nb=[...document.querySelectorAll('#nav-prim .np')].filter(e=>e.offsetParent);const i=nb.findIndex(e=>e.classList.contains('on'));if(nb.length){nb[(i+(pr(5)?1:-1)+nb.length)%nb.length].click();}}
  padNavStep(g,b,root,back);PADN.prev=b;
}
addEventListener('gamepadconnected',()=>{if(!PADN.on)try{notify('Controller connected: d-pad to move, A to select, B to go back, LB/RB to switch sections');}catch(e){}padStart(padMainStep);});
setTimeout(()=>{if(padAny())padStart(padMainStep);},800);
(function(){const go=()=>{const ct=document.getElementById('ct');if(!ct||ct._hdr)return;ct._hdr=1;let last=0,acc=0;
  // the header only comes back after a real upward scroll: changes caused by the header itself resizing the page,
  // the bounce at the bottom of a page and tiny finger wobbles are ignored
  let hold=0,ch=0;const set=on=>{if(document.body.classList.contains('hdr-hide')===on)return;document.body.classList.toggle('hdr-hide',on);hold=performance.now()+450;acc=0;};
  ct.addEventListener('scroll',()=>{const y=ct.scrollTop,d=y-last,h=ct.clientHeight,max=ct.scrollHeight-h;last=y;
    if(y<24){set(false);return;}
    if(performance.now()<hold||h!==ch){ch=h;acc=0;return;}
    if(y>=max-6&&d<0){acc=0;return;}
    acc=(d>0)===(acc>0)?acc+d:d;if(acc>36)set(true);else if(acc<-80)set(false);},{passive:true});};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();})();
// ── SETTINGS MODAL ──
// v2.14 Game Day settings shared with the game (stored on this device)
const GDS_MAIN_DEF={sound:true,band:true,vol:0.8,crowd:true,tips:false,ball:1,dir:'right',haptics:true,kr:true,gfx:'auto',crowdV:'full',bug:'tv',autosave:true,moveUI:'wheel',clickTk:true,pcCam:'close',land:'pc',cam:'broadcast',noiseM:true,cnav:true,mixAudio:true,crowdVol:1,scenes:true};
const SL_KEYS_M=[['spd','Speed'],['acc','Acceleration'],['str','Strength'],['iq','Awareness (IQ)'],['thr','Throwing accuracy'],['bsp','Ball speed'],['cat','Catching'],['int','Interceptions'],['man','Man coverage'],['zone','Zone coverage'],['fum','Fumbles'],['juk','Juke ability']];
function slOpen(){try{closeSettings();}catch(e){}const o=gdsMain(),S=o.sl||{u:{},c:{}},v=(w,k)=>{const x=S[w]&&S[w][k];return x==null?50:x;};
  openMo(`<h2>Difficulty sliders</h2><p style="font-size:13px;color:var(--mu);margin:4px 0 10px">How your team and the CPU play in Game Day. 50 is normal; higher means better at it (for Fumbles, higher means more fumbles). Online games always use 50.</p>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px"><button class="bgh bsm" onclick="slPreset('easy')">Easy</button><button class="bgh bsm" onclick="slPreset('normal')">Normal</button><button class="bgh bsm" onclick="slPreset('hard')">Hard</button><button class="bgh bsm" onclick="slPreset('legend')">Legend</button></div>
    <div class="slg" style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr) minmax(0,1.2fr);gap:6px 10px;align-items:center;font-size:13px">
      <b></b><b style="text-align:center">You</b><b style="text-align:center">CPU</b>
      ${SL_KEYS_M.map(([k,l])=>`<span>${l}</span><input type="range" min="0" max="100" step="5" value="${v('u',k)}" oninput="slSet('u','${k}',this.value)"><input type="range" min="0" max="100" step="5" value="${v('c',k)}" oninput="slSet('c','${k}',this.value)">`).join('')}
      <span>Game speed</span><input type="range" min="0.75" max="1.25" step="0.05" value="${o.gspd||1}" oninput="slGs(this.value)" style="grid-column:span 2">
    </div><div style="margin-top:12px;text-align:right"><button class="btn" onclick="clo()">Done</button></div>`);}
function slGs(v){const o=gdsMain();o.gspd=+v;try{localStorage.setItem('gpgm_gd',JSON.stringify(o));}catch(e){}}
function slSet(w,k,v){const o=gdsMain();o.sl=o.sl||{u:{},c:{}};o.sl[w]=o.sl[w]||{};o.sl[w][k]=+v;try{localStorage.setItem('gpgm_gd',JSON.stringify(o));}catch(e){}}
function slPreset(n){const o=gdsMain(),u={},c={},lv={easy:[65,35],normal:[50,50],hard:[40,60],legend:[30,72]}[n]||[50,50];
  for(const[k]of SL_KEYS_M){u[k]=k==='fum'?100-lv[0]:lv[0];c[k]=k==='fum'?100-lv[1]:lv[1];}
  o.sl={u,c};try{localStorage.setItem('gpgm_gd',JSON.stringify(o));}catch(e){}slOpen();}
function gdsMain(){let o={};try{o=JSON.parse(localStorage.getItem('gpgm_gd')||'{}')||{};}catch(e){}return Object.assign({},GDS_MAIN_DEF,o);}
function gdsMainSet(k,v){const o=gdsMain();o[k]=v;try{localStorage.setItem('gpgm_gd',JSON.stringify(o));}catch(e){}renderGdSettings();if(k==='mixAudio')try{gpAudioMode();}catch(e){}if(k==='cnav')try{if(typeof G!=='undefined'&&G&&G.myId)nav(G._page||'dash',G._arg);}catch(e){}}
function renderGdSettings(){const el=document.getElementById('set-gd');if(!el)return;const S=gdsMain();
  const seg=(k,opts)=>`<div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end">${opts.map(([v,l])=>`<button class="${S[k]===v?'btn':'bgh'} bxs" style="min-height:30px;padding:4px 10px" onclick='gdsMainSet(${JSON.stringify(k)},${JSON.stringify(v)})'>${l}</button>`).join('')}</div>`;
  const row=(l,h)=>`<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px;flex-wrap:wrap"><span style="font-size:13px;font-weight:700">${l}</span>${h}</div>`;
  el.innerHTML=row('Sound effects',seg('sound',[[true,'On'],[false,'Off']]))+row('Volume',`<input type="range" min="0" max="1" step="0.05" value="${S.vol}" oninput="gdsMainPut('vol',+this.value)" style="width:140px">`)
    +row('Let other apps keep playing music',seg('mixAudio',[[true,'On'],[false,'Off']]))+(S.mixAudio!==false?`<div style="font-size:11px;color:var(--mu);margin:-4px 0 8px">Spotify, Apple Music or a video keep playing under the game. On iPhone, game sound follows the ringer switch.</div>`:'')
    +row('Crowd and band volume',`<input type="range" min="0" max="1" step="0.05" value="${S.crowdVol!=null?S.crowdVol:1}" oninput="gdsMainPut('crowdVol',+this.value)" style="width:140px" aria-label="Crowd and band volume">`)
    +row('Crowd noise',seg('crowd',[[true,'On'],[false,'Off']]))+row('Marching band',seg('band',[[true,'On'],[false,'Off']]))+row('Gameplay tips',seg('tips',[[false,'Hidden'],[true,'Shown']]))
    +row('Ball size',seg('ball',[[0.85,'S'],[1,'M'],[1.25,'L'],[1.5,'XL']]))+row('Your offense drives',seg('dir',[['right','Right'],['left','Left'],['real','Switch each quarter']]))
    +row('Vibration',seg('haptics',[[true,'On'],[false,'Off']]))+row('Kick returns',seg('kr',[[true,'Play them'],[false,'Skip']]))+row('Auto-save',seg('autosave',[[true,'On'],[false,'Off']]))+row('Career story scenes',seg('scenes',[[true,'On'],[false,'Off']]))+row('Menu layout',seg('cnav',[[true,'Compact hub'],[false,'Classic tabs']]))+row('Difficulty',`<button class="bgh bxs" onclick="slOpen()">Sliders…</button>`)+row('Scorebug',seg('bug',[['tv','TV'],['slab','Slab'],['tower','Tower'],['mini','Mini'],['classic','Classic']]))+row('Camera',seg('cam',[['wide','Wide'],['broadcast','Broadcast'],['tight','Tight']]))+row('Crowd noise meter',seg('noiseM',[[true,'On'],[false,'Off']]))+row('Move buttons',seg('moveUI',[['row','Row'],['wheel','Wheel']]))+row('Career camera',seg('pcCam',[['close','Close'],['mid','Normal'],['wide','Wide']]))+row('Landing marker',seg('land',[['pc','Player Career'],['all','Always'],['off','Off']]))+row('Mouse: click to tackle',seg('clickTk',[[true,'On'],[false,'Off']]))
    +row('Graphics',seg('gfx',[['auto','Auto'],['fast','Fast (slow phones)']]))+row('Fans in the stands',seg('crowdV',[['full','Full'],['light','Light'],['off','Off']]))
    +`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px"><button class="bgh bxs" onclick="closeSettings();showTutorial();setTimeout(()=>{const i=TUT_PAGES.findIndex(p=>p.tab==='PC controls');if(i>=0)goTutTab(i);},50)">Keyboard controls</button><button class="bgh bxs" onclick="gpReport()">Copy problem report</button><button class="bgh bxs" onclick="privacyOpen()">Privacy policy</button><button class="bgh bxs" onclick="termsOpen()">Terms of use</button></div>${SUPPORT_EMAIL?`<div style="font-size:12px;margin-top:8px;opacity:.8">Support: ${supportHtml()}</div>`:''}`;}
function renderLeagueRules(){const el=document.getElementById('set-league');if(!el)return;
  if(typeof G==='undefined'||!G||!G.myId){el.innerHTML='';return;}
  const R=poRules(),cur=G.rules||{};
  const seg=(k,v0,opts)=>`<div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end">${opts.map(([v,l])=>`<button class="${v0===v?'btn':'bgh'} bxs" style="min-height:30px;padding:4px 10px" onclick='ruleSet(${JSON.stringify(k)},${JSON.stringify(v)})'>${l}</button>`).join('')}</div>`;
  const row=(l,sub,h)=>`<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px;flex-wrap:wrap"><div style="flex:1;min-width:150px"><div style="font-size:13px;font-weight:700">${l}</div>${sub?`<div style="font-size:11px;color:var(--mu);margin-top:2px">${sub}</div>`:''}</div>${h}</div>`;
  const later=G.poN&&G.poN!==R.n;
  el.innerHTML=`<div style="font-size:12px;font-weight:800;color:var(--mu);margin:4px 0 8px;letter-spacing:.06em">League rules (this career)</div>`
    +row('Playoff teams',later?`This season keeps ${G.poN} teams; ${R.n} from next season.`:'Teams in your classification\'s state playoffs.',seg('poN',R.n,[[4,'4'],[8,'8'],[16,'16'],[32,'32']]))
    +row('Who qualifies','Division winners first: every division champion is in, then the best records.',seg('poQ',R.q,[['record','Best records'],['div','Division winners first']]))
    +row('Earned progression','On: ratings can\'t be typed in. Players earn them in practice, games, position battles and with SP.',seg('earned',!!cur.earned,[[false,'Off'],[true,'On']]));}
window.ruleSet=function(k,v){if(typeof G==='undefined'||!G)return;G.rules=G.rules||{};G.rules[k]=v;
  if(k==='poN'&&poApplyNow())notify(`This season's playoffs now take ${v} teams.`);
  renderLeagueRules();try{const pg=G._page||'';if(['sched','playoff','dash'].includes(pg))nav(pg,G._arg);}catch(e){}};
function openSettings(){
  try{renderGdSettings();}catch(e){}try{renderLeagueRules();}catch(e){}
  // Sync unlimited money button state
  syncUnlimBtn();
  // Sync theme buttons to current state
  const isLight=document.documentElement.classList.contains('light');
  setTheme(isLight?'light':'dark');
  document.getElementById('settings-modal').style.display='flex';
}
function closeSettings(e){
  if(e&&e.target!==document.getElementById('settings-modal'))return;
  document.getElementById('settings-modal').style.display='none';
}

// ── UNLIMITED MONEY ──
function syncUnlimBtn(){
  const btn=document.getElementById('set-unlim-btn');
  if(!btn)return;
  const on=!!(G&&G.unlimitedMoney);
  btn.textContent=on?'ON':'OFF';
  btn.style.background=on?'var(--gn)':'var(--s3)';
  btn.style.color=on?'#000':'var(--mu)';
  btn.style.borderColor=on?'var(--gn)':'var(--bd)';
  // Update budget pill display
  const bdEl=document.getElementById('tbbd');
  if(bdEl&&G){bdEl.textContent=on?'∞':`$${(G.budget/1000).toFixed(0)}k`;}
}
function toggleUnlimitedMoney(){
  if(!G)return;
  G.unlimitedMoney=!G.unlimitedMoney;
  syncUnlimBtn();
  notify(G.unlimitedMoney?' Unlimited Money ON, budget costs bypassed!':' Unlimited Money OFF','w');
}
// Helper: returns true if unlimited money is active, use this before every budget check
function hasFunds(cost){return !!(G&&G.unlimitedMoney)||((G&&G.budget)||0)>=cost;}
// Apply saved theme on load
(function(){try{const t=localStorage.getItem('gpgm_theme');if(t==='light')setTheme('light');else setTheme('dark');}catch(e){setTheme('dark');}}());

const CLS_SZ={'1A':{r:[28,38],t:75,d:8},'2A':{r:[35,48],t:75,d:8},'3A':{r:[42,58],t:75,d:8},'4A':{r:[55,70],t:75,d:8},'5A':{r:[65,85],t:75,d:8}};
// Classification move-up costs and roster minimums for demotion
const CLS_ORDER=['1A','2A','3A','4A','5A'];
const CLS_MOVEUP_COST={'1A':100000,'2A':200000,'3A':350000,'4A':550000}; // cost to move UP from this class
const CLS_ROSTER_MIN={'5A':55,'4A':50,'3A':45,'2A':35,'1A':0}; // fall below → demoted
