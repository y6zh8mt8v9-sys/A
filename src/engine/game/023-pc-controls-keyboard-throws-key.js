/* ===================== v2.14 PC controls: keyboard throws, key badges, a controls guide ===================== */
const GPC=(()=>{try{return matchMedia('(hover:hover) and (pointer:fine)').matches;}catch(e){return false;}})();
if(GPC&&!DEMO)document.body.classList.add('kbm');
function gpThrowTargets(){
  // v2.16 online guest: the receivers are the host's players at their live spots (the guest's own copy of the field doesn't move)
  if(G.client){const F=OL.lastF;if(!F||!OL.recvN)return[];return OL.recvN.filter(r=>F.ents.some(S=>S.nk===r.n)).map(r=>{const e=olProxyOf(r.n,G.me,F);e.route={name:r.r,col:r.c};return e;});}
  return(G.recv||[]).filter(r=>r.route&&!r.block&&!r.down);}
function gpKeyThrow(i){
  if(!passingUser())return false;const r=gpThrowTargets()[i];if(!r)return false;
  if(G.client){olCmd('throwr',{n:r.nk,b:G.bullet?1:0,l:G.lob?1:0});return true;}
  const q=G.qb,D0=dist(q,r),lb=!!G.lob&&D0>=8,bul=G.bullet||D0<12&&!lb,f=flight(D0,bul,lb);
  throwTo(r.x+r.vx*f.T,r.y+r.vy*f.T+(D0>16?0.6:0.2),bul,0.8,userThrowMeter,lb);return true;
}
function drawKeyBadges(){
  gpThrowTargets().forEach((r,i)=>{if(i>4)return;const[wx,wy]=toW(r.x,r.y),p=proj(wx,wy,0),z=p.k*0.0212,y=p.sy-132*z;
    ctx.save();ctx.translate(p.sx,y);ctx.beginPath();ctx.arc(0,0,5.4,0,Math.PI*2);ctx.fillStyle=(r.route&&r.route.col)||'#fff';ctx.fill();ctx.lineWidth=1;ctx.strokeStyle='#0d2a43';ctx.stroke();
    ctx.font='900 7px Nunito, sans-serif';ctx.fillStyle='#0d2a43';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(i+1),0,0.5);ctx.restore();});
}
const KB={wait:null};
function gpControlsHtml(){
  const K=k=>`<kbd>${k}<\/kbd>`,B=a=>K(kbLabel(kb(a)));
  return`<div class="ctlg">
    <div class="ctlh">Before the snap<\/div>
    <div>${K('Enter')} or ${K('Space')} snap the ball<\/div><div>Tap / click a receiver: audible his route<\/div>
    <div>${K('T')} timeout<\/div><div>${K('P')} or ${K('Esc')} pause<\/div>
    <div class="ctlh">Passing<\/div>
    <div>${K('1')}–${K('5')} throw to that receiver (numbers float over them)<\/div><div>Mouse / finger: pull back like a slingshot, let go to throw<\/div>
    <div>${K('Space')} or a quick tap: switch bullet / lob (every play starts with a bullet)<\/div><div>${B('scramble')} or the QB run button: tuck it and run<\/div>
    <div class="ctlh">Ball carrier<\/div>
    <div>${K('↑')}${K('↓')}${K('←')}${K('→')} steer your runner (full speed every way)<\/div><div>${B('jukeU')}/${B('jukeD')} juke · ${B('dive')} dive · ${B('slow')} slow down<\/div>
    <div>${B('spin')} spin · ${B('stiff')} stiff arm<\/div><div>${B('truck')} truck · ${B('hurdle')} hurdle · ${K('K')} take a knee (kickoff)<\/div>
    <div>Touch: the skill-move wheel (bottom right): tap a slice, or press and slide onto one<\/div><div>Each slice shows its key or controller button (Settings → Move buttons: Row or Wheel)<\/div>
    <div class="ctlh">Defense<\/div>
    <div>${K('W')}${K('A')}${K('S')}${K('D')} or arrows: move your player · hold ${B('sprint')} to sprint<\/div><div>${B('tackle')} tackle (picks the type) · ${B('switch')} switch to the man nearest the ball<\/div>
    <div>${B('form')} form tackle (sure, short gain) · ${B('stick')} hit stick (big hit, can force a fumble)<\/div><div>${B('bite')} ankle bite (longest reach, trips fast runners) · press early and he launches once in reach<\/div>
    <div>Click / tap a defender: take control of him<\/div><div>${B('play')} or ${K('Space')}: play the ball when the meter is up<\/div>
    <div class="ctlh">Player Career<\/div>
    <div>The coach calls the play: its card shows your job before the snap<\/div><div>Receivers: steer your route (drag, stick or arrows); let go and he runs it as drawn<\/div>
    <div>${K('B')} / Y / Triangle: call for the ball, before or during the play<\/div><div>Defense: you always control your own player<\/div>
    <div class="ctlh">Kicking and catches<\/div>
    <div>${K('Space')} or click: stop the kick meters<\/div><div>${K('Space')} or click: catch meter (hit the green)<\/div>
    <div>${B('fair')} fair catch on punts<\/div><div>${K('1')}–${K('9')} pick a touchdown celebration<\/div>
    <div class="ctlh">Controller<\/div>
    <div>Left stick: move · ${K('A')} snap / tackle / meters<\/div><div>${K('A')}${K('B')}${K('X')}${K('Y')}${K('RB')}: throw to receivers 1–5<\/div>
    <div>Ball carrier: ${K('X')} spin · ${K('B')} stiff arm · ${K('Y')} hurdle · ${K('RB')} truck · ${K('RT')} dive · ${K('LB')} juke<\/div><div>${K('LT')} tuck and run / switch player · ${K('Start')} pause · d-pad and ${K('A')} in menus<\/div>
    <div>Defense: ${K('A')} tackle · ${K('B')} form tackle · ${K('Y')} hit stick · ${K('X')} ankle bite · hold ${K('RT')} sprint<\/div><div>Touch: the tackle wheel (bottom right) plus a Sprint button to hold<\/div>
  <\/div>`;
}
// rebinding: click an action, press a key; a key already in use swaps with it
function gpKeysHtml(){return`<div class="ctlg kbg">${KB_ACT.map(([a,l])=>`<div class="prow"><span>${l}<\/span><button class="btn alt kbb" data-a="${a}">${KB.wait===a?'Press a key…':kbLabel(kb(a))}<\/button><\/div>`).join('')}<\/div>`;}
function gpKeysWire(box,rerender){
  box.querySelectorAll('.kbb').forEach(b=>b.onclick=()=>{KB.wait=b.dataset.a;rerender();});}
addEventListener('keydown',ev=>{if(!KB.wait)return;ev.preventDefault();ev.stopImmediatePropagation();
  const a=KB.wait,k=String(ev.key||'').toLowerCase();if(!k)return;KB.wait=null;
  if(k!=='escape'){
    const DEF=['jukeU','jukeD','dive','slow','spin','stiff','truck','hurdle','scramble'];
    if(!DEF.includes(a)&&['w','a','s','d'].includes(k)){flash('W A S D move your defender. Pick another key.');}
    else if(/^[0-9]$/.test(k)||['p','t','enter',' '].includes(k)){flash('That key is taken by another control.');}
    else{GDS.keys=Object.assign({},GDS.keys||{});const other=KB_ACT.find(x=>x[0]!==a&&kb(x[0])===k);if(other)GDS.keys[other[0]]=kb(a);GDS.keys[a]=k;gdsSave();}}
  if(typeof gpPauseRender==='function')gpPauseRender('keys');},true);
function gpPcIntro(){
  if(!GPC||DEMO||!GP||(GP.online&&G.client))return;let seen=false;try{seen=localStorage.getItem('gpgm_pcTut')==='1';}catch(e){}if(seen)return;
  const ov=document.createElement('div');ov.className='ov';ov.style.zIndex='400';
  ov.innerHTML=`<div class="card glass pm" style="max-width:640px;width:min(96vw,640px)"><h2>Playing on a computer?<\/h2><p style="margin:0 0 6px">Every control has a key. You can always find this again under Pause → Settings and controls.<\/p>${gpControlsHtml()}<div class="pmb"><button class="btn go" id="pcGot">Got it<\/button><\/div><\/div>`;
  document.body.appendChild(ov);ov.querySelector('#pcGot').onclick=()=>{try{localStorage.setItem('gpgm_pcTut','1');}catch(e){}ov.remove();};
}
setTimeout(()=>{try{gpPcIntro();}catch(e){}},900);
/* ===================== v2.15 controller ===================== */
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

function padOverlay(){
  const ids=['pauseMenu','vidReady','modal','simBox','subs','call','gpPrev','rbar'];
  const ovs=[...document.querySelectorAll('.ov')].reverse().filter(padVis);
  for(const el of ovs.concat(ids.map(i=>document.getElementById(i)).filter(Boolean))){if(!padVis(el))continue;if(padFoc(el).length)return el;}
  if(G.phase==='dead'||G.phase==='over'){const t=$('tray');if(padVis(t)&&padFoc(t).length)return t;}
  return null;}
function padGameStep(){
  const g=padGet();if(!g||DEMO)return;const b=padBtns(g),P=PADN.prev,pr=i=>b[i]&&!P[i];
  if(b.some((x,i)=>x&&!P[i]))try{sndPadKick();}catch(e){}
  if(pr(9)&&!G.client&&G.phase!=='over'&&!G.recVid){gpPause(!G.paused);PADN.prev=b;return;}
  const ov=padOverlay();
  if(ov){G.pad=null;padNavStep(g,b,ov,()=>{if(G.paused)gpPause(false);});PADN.prev=b;return;}
  if(PADN.f)padSetFocus(null);
  const ax=g.axes[0]||0,ay=g.axes[1]||0;G.pad=Math.hypot(ax,ay)>0.2?{x:ax,y:ay}:null;
  if(!G.paused){const ph=G.phase;
    if(ph==='presnap'){
      if(G.meter){if(pr(0))meterTap();}
      else if(pcOn()&&G.play&&G.play.kind==='scrimmage'){if(pcAIQB()){if(pr(3))pcCallBall();}else if(G.offTeam===G.me&&pr(0))doSnap();}
      else if(G.play&&G.play.kind==='scrimmage'&&G.offTeam===G.me){if(pr(0))doSnap();}
      else if(gpDefending(G.me)&&(pr(6)||pr(8)))switchUser();
    }else if(ph==='live'){
      if(G.ballState==='air'&&pr(0)&&(G.cm||G.im)){if(G.cm&&G.cm.target&&G.cm.target.team===G.me)catchMeterTap();else intMeterTap();}
      else if(pcAIQB()&&G.ballState==='qb'){if(pr(3))pcCallBall();}
      else if(passingUser()){[0,1,2,3,5].forEach((k,i)=>{if(pr(k))gpKeyThrow(i);});if(pr(6))scramble();if(pr(7))gpCyclePT();}
      else if(userCarrier()){{const mi=[[2,1],[1,2],[3,4],[5,3],[7,5],[4,0]].find(([b])=>pr(b));if(mi&&G.mwMark)G.mwMark(mi[1]);}if(pr(2))trySpin();if(pr(1))tryStiff();if(pr(3))tryHurdle();if(pr(5))tryTruck();if(pr(7))tryDive();if(pr(4))gpAutoJuke();if(pr(6))trySlow();if(pr(0)&&G.kneelOK>0)olKneel();
        const ry=g.axes[3]||0,fl=ry<-0.75?-1:ry>0.75?1:0;if(fl&&fl!==PADN.flick)tryJuke(fl*(G.flip?-1:1));PADN.flick=fl;}
      else if(G.uctl&&G.uctl.team===G.me&&gpDefending(G.me)){{const mi=[[0,0],[1,1],[3,2],[2,3],[6,4]].find(([b])=>pr(b));if(mi&&G.mwMark)G.mwMark(mi[1]);}
        if(pr(0))userTackle();if(pr(1))userTackle('form');if(pr(3))userTackle('stick');if(pr(2))userTackle('bite');if(b[7])G.padSprT=G.time;if(pr(6)||pr(8))switchUser();}
      if(G.play&&G.play.kind==='punt'&&G.offTeam===G.me&&pr(0)&&!G.carrier)olFair();
    }}
  PADN.prev=b;
}
addEventListener('gamepadconnected',()=>{if(DEMO)return;if(!PADN.on)try{flash((padKind()==='ps'?'PlayStation':'Xbox')+' controller connected');}catch(e){}padStart(padGameStep);try{setCtl();}catch(e){}});
setTimeout(()=>{if(!DEMO&&padAny())padStart(padGameStep);},500);
