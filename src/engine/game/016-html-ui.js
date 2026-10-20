/* ===================== HTML UI ===================== */
function show(id){$(id).hidden=false;}
function hide(id){$(id).hidden=true;}
function ballOn(l){const t=G.teams[G.poss]||{abbr:''},o=G.teams[1-G.poss]||{abbr:''};l=Math.round(l);return l<50?`${t.abbr} ${l}`:l===50?'50':`${o.abbr} ${100-l}`;}
function mmss(s){s=Math.max(0,Math.ceil(s));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}
const UI={};
function setHTML(id,v){if(UI[id]!==v){UI[id]=v;$(id).innerHTML=v;}}
function updateHUD(){
  setHTML('s0',String(G.score[0]));setHTML('s1',String(G.score[1]));
  if(GP&&GP.practice&&GP.practice.mode==='tut'){setHTML('qtr','Coach');setHTML('clock','Tutorial');}
  else if(GP&&GP.practice){setHTML('qtr','Rep');setHTML('clock',`${Math.min((G.pReps||0)+1,GP.practice.reps)}/${GP.practice.reps}`);}
  else{setHTML('qtr',G.q>4?(G.ot?`OT${G.ot.round}`:'OT'):qLbl(G.q));setHTML('wxl',wxHudText());
  setHTML('clock',G.q>4?'':mmss(G.clock));}
  const dn=['','1st','2nd','3rd','4th'][Math.min(G.down,4)],tg=gpTgTxt(G.los,G.toGo);
  const pk=G.play&&['presnap','live'].includes(G.phase)?G.play.kind:null;
  const sit=G.conv?(G.conv.two?'Two-point try':'Extra point'):pk==='kickoff'?'Kickoff':pk==='punt'?'Punt':pk==='fg'?`Field goal · ${Math.round(100-G.los+17)} yds`:`<b>${dn} &amp; ${tg}<\/b> · ${ballOn(G.los)}`;
  setHTML('dd',sit);
  for(const t of[0,1]){setHTML('to'+t,[0,1,2].map(i=>`<i class="${i<G.to[t]?'':'u'}"><\/i>`).join(''));
    const on=G.poss===t&&G.phase!=='menu';if(UI['pos'+t]!==on){UI['pos'+t]=on;$('pos'+t).classList.toggle('on',on);}}
  const pc=G.phase==='presnap'&&G.play&&(G.play.kind==='scrimmage'||(!ON&&!(GP&&GP.practice)&&!isAI(G.play.kind==='kickoff'?G.play.kickTeam:G.play.kind==='punt'?G.play.puntTeam:G.offTeam)&&!G.test))?String(Math.max(0,Math.ceil(G.playClock))):'';
  setHTML('pc',pc);$('pc').classList.toggle('warn',pc!==''&&G.playClock<6);
  setHTML('hint',['live','presnap'].includes(G.phase)?(G.hintS||(GDS.tips||tutOn()?G.hint:'')||''):'');
}
function showModal(t,s,btns){
  if(G.phase!=='over'&&G.phase!=='decide')G.phase='modal';
  $('mT').textContent=t;$('mS').textContent=s;const box=$('mB');box.innerHTML='';
  for(const[l,c,f]of btns){const b=document.createElement('button');b.className='btn '+(c||'');b.textContent=l;b.onclick=()=>{hide('modal');f();};box.appendChild(b);}
  show('modal');setTimeout(()=>{const b=box.querySelector('button');b&&b.focus();},50);
}
function restartAnim(el){el.classList.remove('show');void el.offsetWidth;el.classList.add('show');}
function toast(a,b){if(ON&&!G.client)olEvt('toast',[a,b||'']);$('t1').textContent=a;$('t2').textContent=b||'';restartAnim($('toast'));}
function flash(a){if(ON&&!G.client)olEvt('flash',a);$('flash').textContent=a;restartAnim($('flash'));}
function btn(box,l,c,f,key){const b=document.createElement('button');b.className='btn '+(c||'');b.textContent=l;b.onclick=e=>{e.stopPropagation();try{b.blur();}catch(_){}f();};b.onpointerdown=e=>e.stopPropagation();if(key)b.dataset.k=key;box.appendChild(b);return b;}
function setTray(mode){
  const box=$('tray');box.innerHTML='';G.hint='';G.hintS='';
  if(G.test)return;
  if(mode==='presnap'){
    const P=G.play,uOff=G.offTeam===G.me;
    if(P.kind==='scrimmage'&&pcOn()){const me=G.ents.find(e=>pcMe(e));
      if(uOff&&!pcAIQB()){btn(box,'Snap','go',doSnap,'enter');if(!G.conv)btn(box,'Audible','alt',gpPlayAudOpen);}else if(uOff&&me&&me.role!=='OL')btn(box,G.pcWant?'Ball called':'Call for ball','go',pcCallBall,'b');if(uOff&&me&&me.route&&['WR','TE','SL','SR','X','Z','Y'].some(r=>me.role===r||me.slot===r||(me.pl&&me.pl.pos===r)))btn(box,'Flip side','alt',gpPcFlip);
      G.hint=me?`Coach's call: ${(G.pbp&&G.pbp.call)||'–'}. You are #${me.pl.num}, the ringed player${uOff&&!pcAIQB()?'. Snap when ready.':'. The ball is snapped for you.'}`:'Coach has you on the sideline for this play.';
    }else if(P.kind==='scrimmage'){
      if(uOff){btn(box,'Snap','go',doSnap,'enter');if(!ON&&!G.conv)btn(box,'Audible','alt',gpPlayAudOpen);G.hint='Routes and names show before the snap. Tap Snap when ready, or Audible to change the play.';}
      else{btn(box,'Switch player','alt',switchUser);
        if(gpDAdjOK()){const A=G.dAdj||{};btn(box,DADJ_COV[A.cov||0],A.cov?'go':'alt',()=>gpDAdj('cov'),'v');btn(box,A.spy?'QB spy: on':'QB spy: off',A.spy?'go':'alt',()=>gpDAdj('spy'),'y');btn(box,A.con?'Contain: on':'Contain: off',A.con?'go':'alt',()=>gpDAdj('con'),'n');}
        G.hint=ON?'Tap a linebacker or defensive back to control him. Your opponent snaps the ball.':'Tap a linebacker or defensive back to control him. The offense will snap soon.';}
      if(G.to[G.me]>0)btn(box,`Timeout (${G.to[G.me]})`,'alt',()=>{if(callTimeout(G.me))setTray('presnap');},'t');
    }else if(P.fake&&!isAI(G.me)&&(P.kind==='punt'?P.puntTeam:G.offTeam)===G.me){btn(box,'Snap','go',doSnap,'enter');G.hintS='Fake! Snap it: your '+(P.kind==='punt'?'punter':'holder')+' keeps the ball.';}
    else if(G.meter){G.hint='Tap the field or press Space to stop the meter.';}
    else if(ON&&olKickWait()!=null&&olKickWait()!==G.me){G.hintS='Waiting for your opponent to kick.';}
    else if(P.kind==='punt'&&uOff)G.hint='Punt return: tap Fair catch while the ball is in the air to call for it.';
    else if(P.kind==='kickoff'&&uOff)G.hint='Kick return: your returner fields the kick, then you run it back.';
  }else if(mode==='celebrate'){
    const pg=G.celebPg||0,per=12;
    TD_CELEBS.forEach(([k,l],i)=>{if(Math.floor(i/per)!==pg)return;btn(box,l,k==='dunk'?'go':'alt',()=>{const c=G.celebPick;if(c&&!c.celeb)startCeleb(c,k);setTray('dead');},i<10?String((i+1)%10):null);});
    btn(box,pg?'Back to first page':'More celebrations','alt',()=>{G.celebPg=pg?0:1;setTray('celebrate');});
    G.hintS='Touchdown! Pick a celebration'+(GPC?' (keys 1–9)':'')+'.';
  }else if(mode==='dead'){
    if(!ON||G.client)btn(box,'Replay','alt',startReplay);
  }
}
function setCtl(){
  const box=$('ctl');box.innerHTML='';
  if(G.test||G.phase!=='live'&&G.phase!=='presnap')return;
  const c=G.carrier,P=G.play;
  if(pcOn()&&G.phase==='live'&&!pcMe(c)&&!passingUser()&&!(G.ballState==='air'&&(G.cm&&G.cm.target&&pcMe(G.cm.target)||G.im&&G.im.def&&pcMe(G.im.def)))){
    if(G.offTeam===G.me&&G.ballState==='qb'&&!pcMe(G.qb)&&GP.pc.pos!=='OL'){btn(box,G.pcWant?'Ball called':'Call for ball','go',pcCallBall,'b');padLegend(box,[[3,'Call for ball']]);G.hint='Run your route: drag, use the stick or the arrow keys to move him, or let go and he runs the play as drawn. Call for the ball when you are open.';}
    else if(G.uctl&&G.uctl.team===G.me&&!G.uctl.down&&gpDefending(G.me)){btn(box,'Tackle','go',userTackle,kb('tackle'));padLegend(box,[[0,'Tackle']]);G.hint='Drag anywhere to move your player. Tackle near the ball carrier.';}
    return;}
  if(G.phase==='live'&&c&&!isAI(c.team)&&c.team===G.me){
    if(GDS.moveUI==='wheel')gpMoveWheel(box);
    else{btn(box,'Dive','alt',tryDive,kb('dive'));btn(box,'Hurdle','alt',tryHurdle,kb('hurdle'));btn(box,'Truck','alt',tryTruck,kb('truck'));btn(box,'Stiff arm','alt',tryStiff,kb('stiff'));btn(box,'Spin','',trySpin,kb('spin'));btn(box,'Juke','',gpAutoJuke,kb('jukeU')+'/'+kb('jukeD'));}
    G.hint='Swipe up or down to juke, forward to dive, back to slow down. Hurdle beats low tackles, Truck runs through them.';
    if(GDS.moveUI==='wheel')padLegend(box,[[6,'Slow']]);else padLegend(box,[[4,'Juke (or flick right stick)'],[2,'Spin'],[1,'Stiff arm'],[5,'Truck'],[3,'Hurdle'],[7,'Dive'],[6,'Slow']]);
    if(P&&P.kind==='kickoff'&&(G.client?OL.kneelOK:c.y<10&&G.kneelOK>0))btn(box,'Take a knee','go',()=>olKneel(),'k');
  }else if(G.phase==='live'&&gpDefending(G.me)&&!isAI(G.me)&&!G.test){
    if(G.uctl&&G.uctl.team===G.me&&!G.uctl.down)btn(box,'Tackle','go',userTackle,kb('tackle'));
    btn(box,'Switch','alt',switchUser,kb('switch'));
    padLegend(box,[[0,'Tackle'],[6,'Switch player']]);
    if(G.phase==='live')G.hint=G.im&&G.ballState==='air'?`${G.im.def===G.uctl?'Your man':'#'+G.im.def.pl.num} can make a play on the ball: tap the screen when the marker hits green.`:'Drag anywhere to move your player. Tackle near the ball carrier. When a meter pops up over a defender, tap the screen in the green.';
  }else if(G.phase==='live'&&G.ballState==='air'&&G.im&&G.im.def&&G.im.def.team===G.me&&!(G.cm&&G.cm.target&&G.cm.target.team===G.me)){
    G.hint=(G.im.def===G.uctl?'Interception chance':'#'+G.im.def.pl.num+' can make a play')+': tap the screen when the marker hits green.';
  }else if(G.phase==='live'&&G.ballState==='air'&&G.cm&&G.cm.target&&G.cm.target.team===G.me){
    G.hint=G.cm.diff>0.66?'Hard catch: deep, covered or off target. Tap right in the small green zone.':G.cm.need?'Tough catch: tap the screen when the marker hits green.':'Easy catch: tap in the green for a sure grab.';
  }else if(G.phase==='live'&&G.ballState==='qb'&&!isAI(G.offTeam)&&G.offTeam===G.me&&P.kind==='scrimmage'&&P.off.kind==='pass'){
    G.hint='Pull back to aim, release to throw. Tap the screen (or Space) to switch between a bullet and a lob; every play starts with a bullet. Drag from the QB to step around the pocket.';
    btn(box,'Pass: '+PT_N[G.lob?'lob':'bullet'],G.lob?'alt':'go',gpCyclePT,'Space');btn(box,'QB run','alt',scramble,kb('scramble'));
    {const n=gpThrowTargets().length;padLegend(box,[[0,'Receiver 1'],[1,'Receiver 2'],[2,'Receiver 3'],[3,'Receiver 4'],[5,'Receiver 5']].slice(0,n).concat([[6,'Scramble'],[7,'Pass type']]));}
  }
  if(G.phase==='presnap'&&P&&pcOn()&&!G.meter){if(pcAIQB()&&G.offTeam===G.me)padLegend(box,[[3,'Call for ball']]);}
  else if(G.phase==='presnap'&&P&&!isAI(G.me)&&!G.meter){if(G.offTeam===G.me&&P.kind==='scrimmage')padLegend(box,[[0,'Snap'],[9,'Pause']].filter(x=>x[0]<8));else if(gpDefending(G.me))padLegend(box,[[6,'Switch player']]);}
  if(G.phase==='live'&&P&&P.kind==='punt'&&G.offTeam===G.me&&!isAI(G.me)&&(G.ballState==='kick'||G.ballState==='punter'||G.ballState==='snap'))btn(box,G.fair?'Fair catch called':'Fair catch','go',()=>olFair(),kb('fair'));
}
// is team t the defending side right now (no ball, or chasing the man who has it)?
function gpDefending(t){if(G.phase==='presnap')return G.offTeam!==t&&!!G.play;if(G.phase!=='live')return false;
  if(G.carrier)return G.carrier.team!==t;if(G.ballState==='loose')return false;return G.offTeam!==t;}
function switchUser(){
  if(G.client){olCmd('switch');return;}if(pcOn())return;
  const t=G.act;if(!gpDefending(t))return;const live=G.phase==='live';
  const cands=G.ents.filter(e=>e.team===t&&e.pl&&!e.down&&!e.hurt&&!(e.seqLock)&&!['K','P','H'].includes(e.role)&&(live||['DL','LB','CB','NB','S'].includes(e.role)));
  if(!cands.length)return;
  const ref=G.carrier||(G.air&&G.air.cur)||(G.kick&&G.kick.cur)||G.loose||G.qb||cands[0];
  cands.sort((a,b)=>dist(a,ref)-dist(b,ref));
  const cur=G.uctl&&G.uctl.team===t?G.uctl:null;
  // live: the man closest to the ball carrier who is not the one you had; before the snap: step through from the ball outward
  const nx=live?(cands.find(e=>e!==cur)||cands[0]):cands[(cands.indexOf(cur)+1)%cands.length];
  if(cur&&cur!==nx){cur.idle=0;}
  G.uctl=nx;if(!live||['LB','CB','NB','S'].includes(nx.role)){G.uSlot=nx.slot;G.uSlotT[G.act]=nx.slot;}setCtl();
}
/* the user's pre-snap defensive adjustments: press or soft corners, a linebacker spying the quarterback, contain on the edges.
   They last for one play. */
function gpDAdjOK(){return!!(G.play&&G.play.kind==='scrimmage'&&G.phase==='presnap'&&!G.client&&!pcOn()&&G.offTeam!==G.me&&!isAI(G.me)&&!SEVENS()&&G.ents.some(d=>d.side==='d'&&d.role==='LB'));}
function gpDAdj(k){if(!gpDAdjOK())return;const A=G.dAdj=G.dAdj||{cov:0,spy:0,con:0};
  if(k==='cov')A.cov=(A.cov+1)%3;else A[k]=A[k]?0:1;gpDAdjApply();setTray('presnap');}
function gpDAdjApply(){const A=G.dAdj;if(!A)return;const ly=G.linesW.los;
  for(const d of G.ents){if(d.side!=='d'||!d.pl||!d.cover)continue;
    if(!d._adj0)d._adj0={y:d.hy,press:d.press,cush0:d.cush0,cover:d.cover};
    const o=d._adj0;d.press=o.press;d.cush0=o.cush0;d.cover=o.cover;let y=o.y;
    if((d.role==='CB'||d.role==='NB')&&o.cover.type!=='blitz'){
      if(A.cov===1){d.press=true;y=ly+1.4;d.cush0=1.2;}
      else if(A.cov===2){d.press=false;y=Math.max(o.y,ly+8);d.cush0=Math.max(o.cush0||1.5,y-ly);}}
    d.y=d.hy=Math.min(119,y);}
  if(A.spy){const lb=G.ents.filter(d=>d.side==='d'&&d.role==='LB'&&d._adj0&&d._adj0.cover.type!=='blitz').sort((a,b)=>Math.abs(a.x-CX)-Math.abs(b.x-CX))[0];
    if(lb){lb.cover={type:'spy'};lb.press=false;lb.y=lb.hy=ly+4.5;}}}
const DADJ_COV=['Coverage: normal','Coverage: press','Coverage: soft'];
function userTackle(){
  if(G.client){olCmd('tackle');return;}
  const u=G.uctl,c=G.carrier;if(!u||u.down||u.lunge>0||!c||c.side===u.side)return;
  if(SEVENS()){if(dist(u,c)<1.5&&G.phase==='live'&&G.ballState==='carrier'){flash('Two-hand touch');endPlay({type:'tackle',spot:c.y});}return;} // 7v7: reach out and touch, no dives
  if(dist(u,c)<2.8)startLunge(u,c,chooseTackle(u,c));
  else{u.lunge=0.28;u.lt='dive';}
}
/* ---- play call screen ---- */
function diagramSVG(kind,data,hi){
  const X=x=>6+x/FW*108,Y=d=>46-d*1.55;let s=`<svg viewBox="0 0 120 64"><line x1="2" y1="46" x2="118" y2="46" stroke="#fff" stroke-opacity=".6" stroke-width=".8"/>`;
  const dot=(x,d,c='#fff')=>s+=`<circle cx="${X(x).toFixed(1)}" cy="${Y(d).toFixed(1)}" r="2.1" fill="${c}" stroke="#0d2a43" stroke-width=".7"/>`;
  const FF=FORMS[(data&&data.f&&FORMS[data.f]&&data.f)||'base'],pos={QB:[CX,-(FF.qbD||5)]},FPd=Object.assign({},FF.pos,(data&&data.pos)||{});for(const k in FPd)pos[k]=[FPd[k][0],-FPd[k][1]];
  if(kind==='pass'||kind==='run'){
    [-3.8,-1.9,0,1.9,3.8].forEach(x=>dot(CX+x,-0.8,'#dfe9f2'));
    const keys=['X','Z','SL','TE','RB'],outs=keys.map(k=>pos[k][0]<CX?-1:1),start={};
    if(data.mo&&pos[data.mo.s]){const k=data.mo.s,[x0,d0]=pos[k],[x1,d1,dir]=gpMoEnd(x0,-d0,data.mo.k);start[k]=[x0,d0];pos[k]=[x1,-d1];if(data.mo.k!=='jet')outs[keys.indexOf(k)]=x1<CX?-1:1;
      s+=`<polyline points="${X(x0).toFixed(1)},${Y(d0).toFixed(1)} ${X(x1).toFixed(1)},${Y(-d1).toFixed(1)}" fill="none" stroke="#fff" stroke-width="1.2" stroke-dasharray="1.4 1.2"/>`;
}
    if(kind==='pass')keys.forEach((k,i)=>{const R=ROUTES[data.r[i]],[x0,d0]=pos[k];
      if(R){let pts=[[x0,d0],...R.p.map(([dx,dy])=>[clamp(x0+dx*outs[i],1.5,FW-1.5),d0+Math.min(dy,26)])];
        s+=`<polyline points="${pts.map(([x,d])=>X(x).toFixed(1)+','+Y(d).toFixed(1)).join(' ')}" fill="none" stroke="${RCOL[i]}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>`;}
      else s+=`<line x1="${X(x0)}" y1="${Y(d0)}" x2="${X(x0)}" y2="${Y(d0)-3}" stroke="#fff" stroke-width="1.6"/>`;});
    else{const st=data.qb?pos.QB:data.jet&&data.mo?pos[data.mo.s]:data.fbc?pos.SL:pos.RB;const pth=[st,...data.path.map(([dx,dy])=>[CX+dx,dy])];
      if(data.lead&&FF.sub.SL==='FB'){const p0=data.path[data.toss?1:0]||[0,0];s+=`<polyline points="${X(pos.SL[0]).toFixed(1)},${Y(pos.SL[1]).toFixed(1)} ${X(CX+p0[0]).toFixed(1)},${Y(1.5).toFixed(1)}" fill="none" stroke="#fff" stroke-width="1.4" stroke-dasharray="2 1.4"/>`;}
      s+=`<polyline points="${pth.map(([x,d])=>X(x).toFixed(1)+','+Y(d).toFixed(1)).join(' ')}" fill="none" stroke="#ffd23f" stroke-width="2.2" stroke-linecap="round"/>`;}
    for(const k in start)dot(start[k][0],start[k][1],'rgba(255,255,255,.45)');
    for(const k in pos)dot(pos[k][0],pos[k][1],(k==='TE'&&FF.sub.TE)||(k==='RB'&&FF.sub.RB)?'#bfe7ff':(k==='SL'&&FF.sub.SL==='FB')?'#ffe6a8':'#fff');
    if(hi&&pos[hi])s+=`<circle cx="${X(pos[hi][0]).toFixed(1)}" cy="${Y(pos[hi][1]).toFixed(1)}" r="4.6" fill="none" stroke="#ffd23f" stroke-width="1.4"/>`;
  }else if(kind==='def'){
    // build the coverage on stand-in players so the card always matches what the defense really does
    const ly=0,mk=(x,y,role)=>({x,y,hx:x,hy:y,role,pl:{cov:75}}),O={X:mk(4,-0.9),Z:mk(FW-4,-1.6),SL:mk(FW-12,-1.6),TE:mk(CX+5.8,-1.1),RB:mk(CX-1.6,-5.3)};
    const P={};for(const[sl]of DSLOTS)P[sl]=mk(CX,1.2,sl.startsWith('D')?'DL':sl.endsWith('LB')?'LB':sl==='NB'?'NB':sl.startsWith('CB')?'CB':'S');
    [['DE1',CX-5.2],['DT1',CX-1.3],['DT2',CX+1.4],['DE2',CX+7]].forEach(([sl,x])=>{P[sl].x=x;});
    assignCoverage(data.id,P,O,ly);
    const zc=(x,d,r,c)=>s+=`<ellipse cx="${X(x).toFixed(1)}" cy="${Y(d).toFixed(1)}" rx="${(r*1.9).toFixed(1)}" ry="${(r*1.05).toFixed(1)}" fill="${c}" fill-opacity=".33" stroke="${c}" stroke-width=".8"/>`;
    for(const k in O)dot(O[k].x,O[k].y,'rgba(255,255,255,.55)');
    for(const sl in P){const d=P[sl],C=d.cover;
      if(C.type==='zone')zc(C.x,C.y,Math.min(C.hw,9)*(C.deep?0.62:0.5),C.deep?'#4fd1ff':C.kind==='robber'?'#ff7ad9':'#ffd23f');
      else if(C.type==='man')s+=`<line x1="${X(d.x).toFixed(1)}" y1="${Y(d.y).toFixed(1)}" x2="${X(C.man.x).toFixed(1)}" y2="${Y(C.man.y+1.5).toFixed(1)}" stroke="#ffd23f" stroke-width="1.2" stroke-dasharray="2 1.5"/>`;
      else if(C.type==='blitz')s+=`<line x1="${X(d.x).toFixed(1)}" y1="${Y(d.y).toFixed(1)}" x2="${X(lerp(d.x,CX,0.5)).toFixed(1)}" y2="${Y(-1.5).toFixed(1)}" stroke="#ff6b6b" stroke-width="1.8" stroke-linecap="round"/>`;}
    for(const sl in P)dot(P[sl].x,P[sl].y,P[sl].cover.type==='rush'||P[sl].cover.type==='blitz'?'#ff6b6b':'#ffe0e0');
    if(hi&&P[hi])s+=`<circle cx="${X(P[hi].x).toFixed(1)}" cy="${Y(P[hi].y).toFixed(1)}" r="4.6" fill="none" stroke="#ffd23f" stroke-width="1.4"/>`;
  }else{
    const ttl=kind==='punt'?'P':kind==='fg'?'K':kind==='kneel'?'QB':'QB';
    s+=`<text x="60" y="34" text-anchor="middle" font-size="16" font-weight="900" fill="#fff" font-family="Nunito,sans-serif">${ttl}<\/text>`;
  }
  return s+'<\/svg>';
}
let callCB=null,callTab='pass';
function showCall(mode,cb){
  callCB=cb;show('call');
  const sit=G.conv?`Two-point try from the ${Math.max(1,Math.round(100-G.los))}`:`${['','1st','2nd','3rd','4th'][G.down]} & ${gpTgTxt(G.los,G.toGo)} · ${ballOn(G.los)} · ${GP&&GP.practice?(GP.practice.mode==='tut'?'Gameplay tutorial':`Practice rep ${Math.min((G.pReps||0)+1,GP.practice.reps)} of ${GP.practice.reps}`):G.q>4?'OT':['1st','2nd','3rd','4th'][G.q-1]+' '+mmss(G.clock)}`;
  $('cT').textContent=mode==='off'?'Call your play':'Call your defense';$('cS').textContent=sit;
  const tabs=$('cTabs');tabs.innerHTML='';
  const PB=mode==='off'?gpPB(G.me):null,DPB=mode==='def'?gpDPB(G.me):null;
  const T=mode==='off'?(PB?(G.conv?[['pbp',PB.name+' passes'],['pbr','Runs']]:[['pbp',PB.name+' passes'],['pbr','Runs'],['st','Special']]):(G.conv?[['pass','Shotgun'],['trips','Trips'],['empty','Empty'],['run','Run']]:[['pass','Shotgun'],['trips','Trips'],['empty','Empty'],['run','Run'],['st','Special']])):[['def',DPB?DPB.name:'Coverage']];
  if(SEVENS()&&mode==='off'){for(let i=T.length-1;i>=0;i--)if(['run','pbr','st'].includes(T[i][0]))T.splice(i,1);if(['run','pbr','st'].includes(callTab))callTab=PB?'pbp':'pass';}
  if(mode==='def')callTab='def';else if(PB&&!['pbp','pbr','st'].includes(callTab))callTab='pbp';else if(!PB&&(callTab==='def'||callTab==='pbp'||callTab==='pbr'))callTab='pass';if(G.conv&&callTab==='st')callTab=PB?'pbp':'pass';
  for(const[k,l]of T){const b=document.createElement('button');b.className='tab'+(k===callTab?' on':'');b.textContent=l;b.onclick=()=>{callTab=k;showCall(mode,cb);};tabs.appendChild(b);}
  const cards=$('cCards');cards.innerHTML='';
  const card=(kind,data,name,desc,dis)=>{const b=document.createElement('button');b.className='pcard'+(dis?' dis':'');b.innerHTML=diagramSVG(kind,data)+`<b>${name}<\/b><small>${desc}<\/small>`;
    b.onclick=()=>{hide('call');callCB(kind==='def'?data:kind==='pass'||kind==='run'?{kind,data}:{kind});};cards.appendChild(b);};
  if(callTab==='pbp')PB.plays.forEach(p=>card('pass',p,(p.f&&FORMS[p.f]&&p.f!=='base'?FORMS[p.f].n+': ':'')+p.n+(p.custom?' ★':''),p.d||''));
  else if(callTab==='pbr')gpRunList(PB).forEach(r=>card('run',r,(r.f&&FORMS[r.f]&&r.f!=='base'?FORMS[r.f].n+': ':'')+r.n+(r.custom?' ★':''),r.d||'',false));
  else if(callTab==='pass')PASSES.forEach(p=>card('pass',p,p.n,p.d));
  else if(callTab==='trips')for(const f of['trips','tripsTE'])TRIPS_PLAYS.forEach(p=>card('pass',{...p,f},`${FORMS[f].n}: ${p.n}`,f==='trips'?p.d+' · 4 WR':p.d+' · TE as #3'));
  else if(callTab==='empty')for(const f of['empty','emptyTE'])EMPTY_PLAYS.forEach(p=>card('pass',{...p,f},`${FORMS[f].n}: ${p.n}`,f==='empty'?p.d+' · 5 WR':p.d+' · TE split out'));
  else if(callTab==='run')RUNS.forEach(r=>card('run',r,(r.f?FORMS[r.f].n+': ':'')+r.n,r.d,false));
  else if(callTab==='def')DCALLS.filter(d=>!DPB||!DPB.w||(DPB.w[d.id]||0)>0).forEach(d=>card('def',d,d.n,d.d));
  else{
    const fgd=Math.round(100-G.los+17);
    card('punt',null,'Punt','Flip the field');
    card('fakepunt',null,'Fake punt','The punter keeps it and runs');
    card('fg',null,'Field goal',fgd<=62?`${fgd} yards`:'Out of range',fgd>62);
    card('fakefg',null,'Fake field goal','The holder takes off',fgd>62);
    card('kneel',null,'QB kneel','Run the clock');
    card('spike',null,'Spike','Stop the clock, costs a down',!G.clockRun);
  }
  const ft=$('cFoot');ft.innerHTML='';
  if(G.lastRec&&G.lastRec.frames.length)btn(ft,'Replay last play','alt',()=>{hide('call');startReplay(()=>{if(G.pendCall){const pc=G.pendCall;G.pendCall=null;G.phase='call';applyCall(pc[0],pc[1]);return;}if(ON&&(!OL.callOpen||OL.mine))return;showCall(mode,cb);});});
  if(mode==='off')gpGodRow(ft);
  btn(ft,'Substitutions','alt',()=>{hide('call');openSubs(()=>showCall(mode,cb));});
  if(G.to[G.me]>0&&G.q<=5)btn(ft,`Timeout (${G.to[G.me]})`,'alt',()=>{if(callTimeout(G.me))showCall(mode,cb);});
}
/* ---- substitutions ---- */
let subBack=null,subSel=null,subTab='off';
function openSubs(back){subBack=back;subSel=null;show('subs');renderSubs();}
function renderSubs(){
  const T=G.teams[G.me];
  $('subSit').textContent=`Stamina drops each snap and recovers on the bench. Injured players can't play.`;
  const tabs=$('subTabs');tabs.innerHTML='';
  for(const[k,l]of[['off','Offense'],['def','Defense']]){const b=document.createElement('button');b.className='tab'+(k===subTab?' on':'');b.textContent=l;b.onclick=()=>{subTab=k;subSel=null;renderSubs();};tabs.appendChild(b);}
  const list=$('subList');list.innerHTML='';
  const set=subTab==='off'?OSLOTS:DSLOTS;
  const inUse=new Set(set.map(([s])=>T.lineup[s]));
  for(const[s,pos]of set){
    const p=slotPlayer(T,s),row=document.createElement('div');row.className='srow'+(subSel===s?' sel':'');
    row.innerHTML=`<span class="sl">${s}<\/span><span>#${p.num} ${nm(p)}<div class="meta">${pos} · ${Math.floor(p.ht/12)}'${p.ht%12}" ${p.wt} lb · OVR ${p.ovr}<\/div><\/span><div class="bar"><i class="${p.stamina<55?'lo':''}" style="width:${p.stamina}%"><\/i><\/div><span>${p.inj?`<span class="inj">${p.inj.type}<\/span>`:Math.round(p.stamina)+'%'}<\/span>`;
    row.onclick=()=>{subSel=subSel===s?null:s;renderSubs();};list.appendChild(row);
    if(subSel===s){
      const pk=document.createElement('div');pk.className='subpick';
      const inMid=new Set([...inUse].map(id=>{const q=T.get(id);return q&&q.mid;}).filter(m=>m!=null));const okq=q=>!inUse.has(q.id)&&!(q.mid!=null&&inMid.has(q.mid));
      const alts=T.roster.filter(q=>q.pos===pos&&okq(q)).concat(T.roster.filter(q=>q.pos!==pos&&q.pos!=='K'&&q.pos!=='P'&&okq(q)).sort((a,b)=>b.ovr-a.ovr).slice(0,8));
      if(!alts.length)pk.textContent='No backups at this position.';
      for(const q of alts){const b=document.createElement('button');b.textContent=`#${q.num} ${nm(q)} · ${q.inj?q.inj.type:Math.round(q.stamina)+'%'}`;b.disabled=!!q.inj;
        b.onclick=()=>{T.lineup[s]=q.id;T.lock=T.lock||{};T.lock[s]=1;subSel=null;renderSubs();};if(q.pos!==pos)b.textContent+=` (${q.pos})`;pk.appendChild(b);}
      list.appendChild(pk);
    }
  }
  const ft=$('subFoot');ft.innerHTML='';
  btn(ft,T.auto?'Auto-subs: on':'Auto-subs: off','alt',()=>{T.auto=!T.auto;renderSubs();});
  btn(ft,'Done','go',()=>{hide('subs');if(G.client)olCmd('sub',{l:T.lineup,a:T.auto?1:0,k:T.lock||{}});subBack&&subBack();});
}
/* ---- kick meter ---- */
function showMeter(){show('meter');$('mBar').classList.toggle('pow',G.meter.stage==='power');setTimeout(gpMeterLook,0);
  $('mLabel').textContent=G.meter.stage==='power'?'Kick power':'Kick accuracy';$('mSub').textContent=G.meter.stage==='power'?'Stop it in the green for full power':'Stop it in the middle';}
function meterTap(){
  const M=G.meter;if(!M||G.phase!=='presnap')return false;
  // a tap in the same frame the meter appears still has a value (the meter starts at its left end)
  if(M.stage==='power'){M.power=clamp(isFinite(M.val)?M.val:0,0,1);M.stage='acc';M.t=0;M.val=-1;showMeter();return true;}
  M.acc=clamp(isFinite(M.val)?M.val:-1,-1,1);if(G.client){olCmd('kick',{p:M.power,a:M.acc});OL.kickSent=true;G.meter=null;hide('meter');return true;}
  const P=G.play,k=P.kind==='kickoff'?P.kicker:P.kind==='punt'?P.punter:P.kicker;
  P.kres=kickResult(k,M.power,M.acc);G.meter=null;hide('meter');doSnap();return true;
}
function meterStep(dt){
  const M=G.meter;if(!M)return;M.t+=dt;
  if(M.stage==='power'){const u=(M.t/(M.pper||1.3))%2;M.val=u<1?u:2-u;}else{const u=(M.t/(M.per||1.0))%2;M.val=(u<1?u:2-u)*2-1;}
  $('mNeedle').style.left=(M.stage==='power'?M.val*100:(M.val+1)*50)+'%';
}
