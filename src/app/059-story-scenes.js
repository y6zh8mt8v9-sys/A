// ═══════════ STORY SCENES: short cutscene cards at the big moments of a career ═══════════
// Player Career: first practice, post-game talks (the coach, or teammates heading to a diner), rivalry week, offers,
// official visits (junior and senior year, schools that offered), commitment and signing day, and the pro combine.
// Coach mode gets a light version: a word with the captain or a coordinator after a big win or a bad loss.
// Scenes never interrupt a sim: moments are queued (G.story.q) and shown when you are on the dashboard with nothing
// else open. A few per season at most; every scene can be skipped. Choices nudge morale, coach trust, chemistry,
// followers, and on visits his interest in the school and theirs in him.
const ST_CAP_PC=6,ST_CAP_CO=3,ST_DINERS=['the Blue Plate Diner','Main Street Grill','the Corner Diner',"Rosie's Diner",'the Lamplight Diner','the Depot Grill'];
function stS(){if(!G)return null;const S=G.story||(G.story={q:[],seen:{},n:{},gw:{},vis:{},offN:0});S.q=S.q||[];S.seen=S.seen||{};S.n=S.n||{};S.gw=S.gw||{};S.vis=S.vis||{};return S;}
function stYk(){return(ccOn()?'c':'h')+G.yr;}
function stH(s){let h=7;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return h;}
function stPick(a,seed){return a[(seed>>>0)%a.length];}
function stEsc(t){return String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));}
// who the scenes are about: your player (high school or college), or nobody (coach mode)
function stMe(){if(!G||G.myPlayerId==null)return null;if(ccOn())return G.cc.stage==='college'&&G.cc.p?G.cc.p:null;
  const p=getP(G.myPlayerId);return p&&p.sId===G.myId&&!p.grad?p:null;}
// faces: a coach (staff name as the seed, team colors) or a player
function stCoach(name,role,c1,c2,age){return{nm:name,role,fc:{s:stH(name),o:{coach:true,c1:c1||'#24477f',c2:c2||'#ffffff',age:age||50,cap:true,ini:(name||'C')[0]}}};}
function stPl(p,role){return{nm:`${p.fn} ${p.ln}`,role,fc:{s:p.fs!=null?p.fs:p.id}};}
function stHsCoach(){const s=myS()||{},n=(G.staff&&G.staff.hc&&G.staff.hc.name)||'Coach';return stCoach('Coach '+n.split(' ').slice(-1)[0],`Head coach, ${s.name||''}`,s.c1,s.c2,52);}
function stColCoach(k){const I=colInfo(k),h=stH(k);return stCoach(`Coach ${SFSFX[(h>>>3)%SFSFX.length]}`,`Head coach, ${I.name}`,I.c1,I.c2,46+h%14);}
// a teammate to talk to: the captain, the QB for a receiver (or a receiver for the QB), else the best player on the other side of the ball
function stMate(p){const L=(ccOn()?ccRoster(G.cc.k):myP()).filter(q=>q&&q.id!==p.id&&q.fn);if(!L.length)return null;
  const cap=ccOn()?[]:captains().map(getP).filter(q=>q&&q.id!==p.id);if(cap.length)return cap[0];
  const R=['WR','TE','RB'];if(R.includes(p.pos)){const q=L.filter(x=>x.pos==='QB').sort((a,b)=>b.rat-a.rat)[0];if(q)return q;}
  if(p.pos==='QB'){const r=L.filter(x=>R.includes(x.pos)).sort((a,b)=>b.rat-a.rat)[0];if(r)return r;}
  const D=['DL','LB','CB','S'],mine=D.includes(p.pos);return L.filter(x=>D.includes(x.pos)===mine).sort((a,b)=>b.rat-a.rat)[0]||L[0];}
// queue: one per key, a few per season (must: first practice, commitment, signing day), at most 4 waiting
function stQueue(sc){const S=stS();if(!S||!sc||!sc.key||S.seen[sc.key])return false;const yk=stYk(),cap=stMe()?ST_CAP_PC:ST_CAP_CO;
  if(!sc.must&&(S.n[yk]||0)>=cap)return false;S.seen[sc.key]=1;if(!sc.must)S.n[yk]=(S.n[yk]||0)+1;sc.yk=yk;S.q.push(sc);
  while(S.q.length>4){const i=S.q.findIndex(x=>!x.must);if(i<0)break;S.q.splice(i,1);}return true;}

// ── effects ──
function stOffer(k){const p=stMe()||myPlayer();return p&&(p.offers||[]).find(o=>o.school+'|'+o.lvl===k)||null;}
function stFx(fx){const out=[],me=stMe(),col=ccOn();if(!fx)return out;const add=(l,d)=>{if(d)out.push([l,d]);};
  if(fx.trust){if(col){const b=G.cc.trust==null?50:G.cc.trust;G.cc.trust=clamp(b+fx.trust,0,100);add('Coach trust',G.cc.trust-b);}
    else if(me){const b=me.rel==null?50:me.rel;me.rel=clamp(b+fx.trust,0,100);add('Coach trust',me.rel-b);}}
  if(fx.morale&&!col){const b=moraleOf();G.morale=clamp(Math.round(b+fx.morale),5,100);add('Team morale',G.morale-b);}
  if(fx.chem&&!col){const q=progQB(),R=progRcv();let done=false;
    if(me&&q&&me.id===q.id&&R.length){for(const r of R)chemAdd(q.id,r.id,fx.chem);done=true;}
    else if(me&&q&&R.some(r=>r.id===me.id)){chemAdd(q.id,me.id,fx.chem);done=true;}
    else if(!me&&q&&R.length){for(const r of R)chemAdd(q.id,r.id,fx.chem);done=true;}
    if(done)add('QB chemistry',fx.chem);else{const b=moraleOf();G.morale=clamp(Math.round(b+fx.chem/2),5,100);add('Team chemistry',G.morale-b);}}
  if(fx.fol&&typeof socOn==='function'&&socOn()){const S=soc(),b=S.fol;socGrow(fx.fol);add('Followers',S.fol-b);}
  if(fx.k){const o=stOffer(fx.k),I=colInfo(fx.k);if(o){if(o.pr0==null)o.pr0=o.pr!=null?o.pr:colPr(o);
    if(fx.vis){const b=o.vis||0;o.vis=clamp(b+fx.vis,-8,12);o.pr=o.pr0+o.vis;add(`Your interest in ${I.name}`,o.vis-b);}
    if(fx.ti){const b=o.ti==null?50:o.ti;o.ti=clamp(b+fx.ti,0,100);add(`${I.name}'s interest in you`,o.ti-b);}}}
  return out;}
function stChips(L){return L.length?`<div class="st-fx">${L.map(([l,d])=>`<span class="${d>0?'up':'dn'}">${stEsc(l)} ${d>0?'+':''}${d}</span>`).join('')}</div>`:'';}

// ── the card ──
function stBusy(){const on=id=>{const e=document.getElementById(id);return!!e&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden';};
  const mo=document.getElementById('mo'),pu=document.getElementById('pu'),ld=document.getElementById('loading-screen'),ap=document.getElementById('app');
  return!!((mo&&mo.classList.contains('open'))||(pu&&pu.classList.contains('open'))||document.getElementById('gd-ov')||(ld&&ld.classList.contains('active'))||on('settings-modal')||on('tut-overlay')||!ap||ap.classList.contains('hid'));}
let _stT=null,_stTry=0;
function storyNav(page){if(!G||!G.myId)return;try{if(page==='mine')stVisitCard();}catch(e){console.error('story',e);}
  if(!['dash','mine','college'].includes(page))return;clearTimeout(_stT);_stTry=0;_stT=setTimeout(storyShow,700);}
function storyShow(){_stT=null;const S=stS();if(!S||gdsMain().scenes===false)return;try{stScan();}catch(e){console.error('story scan',e);}if(!S.q.length)return;
  if(!['dash','mine','college'].includes(G._page))return;
  if(stBusy()||!uiQuiet()){if(_stTry++<12)_stT=setTimeout(storyShow,1500);return;}
  const sc=S.q.shift();stRun(sc);}
// a scene: steps of lines and choices; the reply to a choice opens the next step, the last one shows what changed
function stRun(sc,live){window._stCur={sc,step:0,fx:[],reply:'',live:live||null};stDraw();}
function stDraw(){const C=window._stCur;if(!C)return;const sc=C.sc,st=sc.steps[C.step];
  const cast=st.cast||sc.cast,faceOf=c=>face(c.fc.s,72,c.fc.o||undefined);
  const lines=(st.lines||[]).map(([who,t])=>`<p class="st-line">${who?`<b>${stEsc(who)}</b>`:''}${t}</p>`).join('');
  openMo(`<div class="st-scene" id="st-scene" data-key="${stEsc(sc.key)}">
   <div class="st-top"><span class="st-place">${stEsc(st.place||sc.place||'')}</span><span class="st-step">${sc.steps.length>1?`${C.step+1} of ${sc.steps.length}`:''}</span></div>
   ${sc.title?`<h2 class="st-title">${stEsc(sc.title)}</h2>`:''}
   <div class="st-cast">${cast.map(c=>`<div class="st-who">${faceOf(c)}<div><div class="st-nm">${stEsc(c.nm)}</div><div class="st-role">${stEsc(c.role||'')}</div></div></div>`).join('')}</div>
   ${C.reply?`<p class="st-reply">${C.reply}</p>`:''}
   <div class="st-lines">${lines}</div>
   ${st.extra||''}
   <div class="st-ch">${st.ch.map((c,i)=>`<button class="${i===0?'btn':'bgh'} st-c" onclick="storyPick(${i})">${stEsc(c.t)}</button>`).join('')}</div>
   <div class="st-foot"><button class="bgh bxs st-skip" onclick="storySkip()">Skip scene</button></div></div>`);
  try{document.getElementById('mo').classList.add('ontop');}catch(e){}}
window.storyPick=function(i){const C=window._stCur;if(!C)return;const sc=C.sc,st=sc.steps[C.step],c=st.ch[i];if(!c)return;
  let r=c.r||'';try{if(c.do){const x=c.do(C);if(typeof x==='string')r=x;}}catch(e){console.error('story',e);}
  C.fx=C.fx.concat(stFx(c.fx));try{if(c.nx){stNext(c.nx);return;}}catch(e){console.error('story',e);}
  if(C.step<sc.steps.length-1){C.step++;C.reply=r;stDraw();return;}
  const sum={};for(const[l,d]of C.fx)sum[l]=(sum[l]||0)+d;const L=Object.entries(sum).filter(x=>x[1]);
  document.getElementById('mc2').innerHTML=`<div class="st-scene st-end"><div class="st-top"><span class="st-place">${stEsc(st.place||sc.place||'')}</span></div>
    ${r?`<p class="st-reply">${r}</p>`:''}${sc.end?sc.end():''}${stChips(L)}<div class="st-ch"><button class="btn" onclick="storyDone()">Continue</button></div></div>`;
  try{saveGame(true);}catch(e){}};
window.storySkip=function(){const C=window._stCur;window._stCur=null;clo();if(C&&C.live&&C.live.skip)try{C.live.skip();}catch(e){console.error('story',e);}else stAfter();};
window.storyDone=function(){const C=window._stCur;window._stCur=null;clo();if(C&&C.live&&C.live.done)try{C.live.done(C);}catch(e){console.error('story',e);}else stAfter();};
function stAfter(){const S=stS();try{nav(G._page||'dash',G._arg);}catch(e){}if(S&&S.q.length){clearTimeout(_stT);_stTry=0;_stT=setTimeout(storyShow,900);}}
function stNext(nx){if(nx.visit){window._stCur=null;stVisit(nx.visit);return;}}

// ── the moments ──
// high school and college games (hook in simGame and the playoff week): notable results queue a talk
function storyGame(win,o){if(!G||!G.myId||ccOn())return;  // college games come from the college log (stScan)
  o=o||{};const S=stS(),yk=stYk(),wk=o.wk||G.week||0,margin=(o.my||0)-(o.op||0),me=stMe();
  if(S.gw[yk]!=null&&wk-S.gw[yk]<2&&!o.playoff)return;
  if(me){const st=o.sm&&o.sm[me.id],pf=st?ccPerf(me.pos,st,1):0,big=pf>=9||(win&&(margin>=17||o.rival||o.playoff)),bad=!win&&(margin<=-14||o.rival||o.playoff||pf<=-2);
    if(!big&&!bad)return;const sc=stGameScene(me,win,{opp:o.opp,my:o.my,op:o.op,line:st?ccLine(me.pos,st):'',pf,rival:o.rival,playoff:o.playoff,wk});if(sc&&stQueue(sc))S.gw[yk]=wk;return;}
  const big=win&&(margin>=21||o.rival||o.playoff),bad=!win&&(margin<=-21||o.rival||o.playoff);if(!big&&!bad)return;
  const sc=stCoachScene(win,{opp:o.opp,my:o.my,op:o.op,rival:o.rival,playoff:o.playoff,wk});if(sc&&stQueue(sc))S.gw[yk]=wk;}
function stGameScene(p,win,x){const seed=stH(G.yr+'|'+x.wk+'|'+p.id),mate=stMate(p),diner=!!mate&&seed%2===0,col=ccOn(),coach=col?stColCoach(G.cc.k):stHsCoach();
  const sc=`${x.my}-${x.op}`,opp=x.opp||'them',ln=x.line?` ${stEsc(x.line)}.`:'',key=`g:${stYk()}:${x.wk}`,place=col?'Locker room, after the game':'Field house, after the game';
  if(win&&diner)return{key,kind:'diner',place:'Parking lot, after the game',title:`${sc} over ${opp}`,cast:[stPl(mate,mate.pos+', teammate')],steps:[{lines:[[mate.fn,`Big night.${ln?' You were everywhere.':''} A bunch of us are heading to ${stPick(ST_DINERS,seed)} for burgers. You coming?`],[mate.fn,'Coach says film is at 9 tomorrow, so nobody stays out late.']],
    ch:[{t:"I'm in. First round of fries is on me.",fx:{chem:3,morale:2,fol:15},r:'The whole booth cheers when the fries hit the table. You replay the big plays until the diner closes.'},
      {t:"Can't tonight. Ice bath and film.",fx:{trust:2,chem:-1},r:`${mate.fn} shakes his head and laughs. "Always working." Coach hears about it on Monday.`},
      {t:'Only if we get a team picture for Huddle.',fx:{fol:60,chem:1},r:'The picture of the whole table goes up before the food does.'}]}]};
  if(win)return{key,kind:'coach',place,title:`${sc} over ${opp}`,cast:[coach],steps:[{lines:[[coach.nm,`That is the player I knew we were getting.${ln}`],[coach.nm,x.playoff?'We play again next week. Enjoy tonight, then lock back in.':'Keep stacking games like that and people are going to notice.']],
    ch:[{t:'Thank you, coach. The guys up front made it easy.',fx:{trust:2,chem:2},r:'Coach nods. "That is what leaders say." He tells the linemen you said it.'},
      {t:'I want the ball even more next week.',fx:{trust:-1,fol:40},r:'"Earn it in practice," he says. Your post about it gets a lot of likes.'},
      {t:'Just doing my job, coach.',fx:{trust:2},r:'"Good. Do it again Friday." He almost smiles.'}]}]};
  if(diner)return{key,kind:'diner',place:'Parking lot, after the game',title:`${sc} loss to ${opp}`,cast:[stPl(mate,mate.pos+', teammate')],steps:[{lines:[[mate.fn,'That one stings. Nobody wants to go home and stare at the ceiling.'],[mate.fn,`We're going to ${stPick(ST_DINERS,seed)}. Come on, we lose together and we eat together.`]],
    ch:[{t:"Yeah. Let's stick together.",fx:{chem:3,morale:3,fol:10},r:'Nobody talks about the game for an hour. By the end of the night the team is laughing again.'},
      {t:'I need to get some work in at the field.',fx:{trust:2},r:'You run routes under the stadium lights until the janitor turns them off.'},
      {t:'Not tonight. I need to be alone.',fx:{morale:-1},r:`${mate.fn} pats your shoulder. "We got you next week."`}]}]};
  return{key,kind:'coach',place,title:`${sc} loss to ${opp}`,cast:[coach],steps:[{lines:[[coach.nm,'Sit down a minute.'],[coach.nm,`We will watch the film together tomorrow. Tell me what you saw out there.${ln}`]],
    ch:[{t:'I left plays out there. That is on me.',fx:{trust:3},r:'"That is why I trust you," he says. "Now go fix it."'},
      {t:'We have to get better as a team.',fx:{trust:1,morale:1},r:'"We will," he says. "Starting Monday."'},
      {t:'I was not getting the ball.',fx:{trust:-3,fol:20},r:'His jaw tightens. "Then make me give it to you." It is a long week of practice.'}]}]};}
function stCoachScene(win,x){const cap=captains().map(getP).filter(Boolean)[0]||myP().filter(p=>p.yr===12).sort((a,b)=>b.rat-a.rat)[0],s=myS()||{},sc=`${x.my}-${x.op}`,opp=x.opp||'them',key=`c:${stYk()}:${x.wk}`;
  const useCap=cap&&stH(key)%2===0,crd=(x.my||0)>=(35)||!win&&(x.op||0)>=35?'oc':'dc',cn=(G.staff&&G.staff[crd]&&G.staff[crd].name)||'Coach',co=stCoach(cn,crd==='oc'?'Offensive coordinator':'Defensive coordinator',s.c1,s.c2,44);
  if(useCap&&win)return{key,kind:'captain',place:'Locker room, after the game',title:`${sc} over ${opp}`,cast:[stPl(cap,'Team captain')],steps:[{lines:[[cap.fn,'Coach, the guys are flying right now.'],[cap.fn,'Some of us want to take the whole team out for wings tonight. You good with that?']],
    ch:[{t:'Go. You earned it. Back to work Monday.',fx:{morale:4},r:'The locker room erupts when he tells them.'},{t:'Celebrate tonight, film at 7 tomorrow.',fx:{morale:2,chem:2},r:'Nobody is late to film. They are hungry for more.'},{t:"Keep it quiet. We haven't won anything yet.",fx:{morale:-1,chem:2},r:'He nods slowly. The bus ride home is all business.'}]}]};
  if(useCap)return{key,kind:'captain',place:'Locker room, after the game',title:`${sc} loss to ${opp}`,cast:[stPl(cap,'Team captain')],steps:[{lines:[[cap.fn,'Coach, the locker room is dead quiet.'],[cap.fn,'What do you want me to tell them?']],
    ch:[{t:'Tell them I am proud of the fight.',fx:{morale:4},r:'Heads come up one by one.'},{t:'Extra conditioning Monday. We finish games.',fx:{morale:-2,chem:2},r:'It is a brutal Monday. Nobody quits.'},{t:'Say nothing. Let it burn until Friday.',fx:{morale:-1,chem:1},r:'The week of practice is the sharpest of the year.'}]}]};
  if(win)return{key,kind:'coord',place:'Coaches office, after the game',title:`${sc} over ${opp}`,cast:[co],steps:[{lines:[[co.nm,'That is the cleanest we have executed all year.'],[co.nm,'What do you want to do with the momentum?']],
    ch:[{t:'Give the players the credit in front of everyone.',fx:{morale:3},r:'The players hear it from you on Monday and stand a little taller.'},{t:'Install the next wrinkle while it is hot.',fx:{chem:3},r:'The new looks click in two days of practice.'},{t:'Same plan. Do not get comfortable.',fx:{morale:1,chem:1},r:'"Copy that, coach."'}]}]};
  return{key,kind:'coord',place:'Coaches office, after the game',title:`${sc} loss to ${opp}`,cast:[co],steps:[{lines:[[co.nm,'I have watched the bad series twice already.'],[co.nm,'We can simplify the plan, or we can coach them up. Your call.']],
    ch:[{t:'Simplify. Let them play fast.',fx:{morale:2,chem:1},r:'Practice is quicker and louder by Wednesday.'},{t:'Coach them up. Extra film for the starters.',fx:{chem:3,morale:-1},r:'The starters grumble, then start calling out the looks before the snap.'},{t:'It was on the coaches. I will tell the team.',fx:{morale:3},r:'Owning it in front of the team buys you a lot of respect.'}]}]};}
// the rest are found when you come back to the dashboard (no hooks in the recruiting or season code)
function stScan(){const S=stS(),me=stMe();if(!S||!me)return;const col=ccOn();
  if(!col){const s=myS()||{},coach=stHsCoach();
    if(!S.seen.first&&me.yr<=10)stQueue({key:'first',must:true,kind:'first',place:`${s.name||'Your school'} practice field, first day`,title:'First practice',cast:[coach],steps:[{lines:[[coach.nm,`So you are ${me.fn} ${me.ln}. I have heard about you.`],[coach.nm,'Nobody here cares what you did in middle school. You earn every snap on this field.']],
      ch:[{t:"Yes, coach. I'm here to work.",fx:{trust:3},r:'"We will see," he says, and blows the whistle.'},{t:'I want to start this year.',fx:{trust:-1,fol:25},r:'A few seniors laugh. Coach does not. "Then beat somebody out."'},{t:'Find the senior captain and ask for tips.',fx:{chem:3,trust:1},r:'The captain shows you how he warms up. You are his shadow by the end of practice.'}]}]});
    // rivalry week: the next game is the rival
    const nx=(G.sched||[]).find(g=>!g.result&&g.type==='regular'),opp=nx&&getS(nx.oppId);
    if(opp&&G.phase!=='offseason'&&(nx.isRivalry||isRivalry(G.myId,opp.id))){const T=(()=>{try{return rivTrophy(opp.id);}catch(e){return null;}})(),mate=stMate(me);
      stQueue({key:`riv:${stYk()}:${opp.id}`,kind:'rival',place:'Hallway, rivalry week',title:`Rivalry week: ${opp.name}`,cast:mate?[coach,stPl(mate,mate.pos+', teammate')]:[coach],steps:[{lines:[[coach.nm,`This is ${opp.name} week. The whole town will be in the stands.${T&&T.name?` ${stEsc(T.name)} is on the line.`:''}`],[mate?mate.fn:coach.nm,'Their guys have been talking all week. Somebody has to answer.']],
        ch:[{t:'Give the speech at the team dinner.',fx:{trust:2,morale:2},r:'The room is on its feet by the end. Coach gives you a long look and a nod.'},{t:'Stay locked in. My play does the talking.',fx:{trust:2,chem:1},r:'You are the first one in the film room every day of the week.'},{t:'Answer them on Huddle.',fx:{fol:120,trust:-2},r:'Your post goes everywhere. Coach is not happy about the bulletin board material.'}]}]});}
    // offers: the first one, and any bigger one (a college coach calls)
    const O=me.offers||[];if(O.length>(S.offN||0)){const fresh=O.slice(S.offN||0),best=fresh.slice().sort((a,b)=>colPr(b)-colPr(a))[0],prev=O.slice(0,S.offN||0).reduce((m,o)=>Math.max(m,colPr(o)),0);S.offN=O.length;
      if(best&&(!prev||colPr(best)>=prev+8)){const k=best.school+'|'+best.lvl,I=colInfo(k),cc=stColCoach(k);
        stQueue({key:'off:'+k,kind:'offer',place:'Phone call, after school',title:`${I.name} is calling`,cast:[cc],steps:[{lines:[[cc.nm,`${me.fn}, this is ${cc.nm} at ${I.name}. We have been watching your film all season.`],[cc.nm,`I am calling to offer you a scholarship to play ${me.pos} for the ${I.mascot||I.name}.`]],
          ch:[{t:'Thank you, coach. This means a lot to my family.',fx:{k,vis:2,ti:2,fol:30},r:'"Your family should be proud," he says. "We will be in touch."'},{t:'How do you see me fitting in?',fx:{k,vis:3,ti:1},r:'He talks for ten minutes about exactly how they would use you.'},{t:"I'm keeping my options open.",fx:{k,ti:-2,fol:15},r:'"I understand," he says. The call ends a little colder than it started.'}]}]});}}
    else S.offN=O.length;
    // commitment
    if(me.committed){const k=me.committed.school+'|'+me.committed.lvl,I=colInfo(k);
      stQueue({key:'cm:'+k,must:true,kind:'commit',place:'Your school gym, commitment day',title:`Committed to ${I.name}`,cast:[stPl(me,'You'),coach],steps:[{lines:[['',`Three hats on the table. Your family in the front row. The local news has a camera in the corner.`],[coach.nm,'Whenever you are ready, son.']],
        ch:[{t:'Thank my family first.',fx:{morale:2,fol:80},r:`You pull on the ${I.name} hat. Your mom is crying before you finish the sentence.`},{t:'Thank coach and my teammates.',fx:{trust:3,chem:2},r:'The whole team is in the bleachers. They chant your name.'},{t:'Keep it short and post the video.',fx:{fol:150},r:'The video is the most shared post of the week.'}]}]});}
    // official visits: once a year in the junior and senior season, an invite to pick a school
    if(stVisitOk(me)&&!S.seen['vinv:'+stYk()]){const L=stVisitList(me).slice(0,3);if(L.length)stQueue({key:'vinv:'+stYk(),kind:'visits',place:'Kitchen table, a letter from the colleges',title:'Official visits',cast:[coach],steps:[{lines:[[coach.nm,`You have ${(me.offers||[]).length} offer${(me.offers||[]).length===1?'':'s'}. You can take official visits this year: see the campus, meet the coaches and the players.`],[coach.nm,'Pick one to start with. You can plan more from My Player.']],
      ch:L.map(o=>({t:`Visit ${o.school} (${o.lvl})`,nx:{visit:o.school+'|'+o.lvl}})).concat([{t:'Not now. Focus on the season.',fx:{trust:1},r:'Coach approves. "The schools will still be there."'}])}]});}}
  else{const k=G.cc.k,I=colInfo(k),cc=stColCoach(k);
    if(!S.seen.sign)stQueue({key:'sign',must:true,kind:'sign',place:`${I.name} football facility, signing day`,title:'Signing day',cast:[stPl(me,'You'),cc],steps:[{lines:[['','The fax machine hums. The letter is signed. You are officially a college football player.'],[cc.nm,`Welcome to ${I.name}, ${me.fn}. Everybody starts at the bottom of the depth chart here.`]],
      ch:[{t:'I will outwork everybody in the room.',fx:{trust:3},r:'"We will see in August," he says, but he is smiling.'},{t:'Post the signing picture.',fx:{fol:200},r:'Your old high school teammates flood the comments.'},{t:'Ask when I can start lifting with the team.',fx:{trust:2,fol:40},r:'He hands you the summer workout schedule on the spot.'}]}]});
    // the coaches remember your official visit
    const o=(S.vis.log||[]).find(v=>v.k===k);if(o&&!S.tiDone){S.tiDone=1;const d=clamp(Math.round(((o.ti==null?50:o.ti)-50)/5),-6,6);if(d){G.cc.trust=clamp((G.cc.trust==null?50:G.cc.trust)+d,0,100);try{notify(`${I.name} remembers your official visit: coach trust ${d>0?'+':''}${d}`);}catch(e){}}}
    // college games: the newest result, when it was a big one
    const lg=G.cc.log||[],last=lg[lg.length-1];if(last&&last.s&&S.cgi!==G.yr+':'+lg.length){S.cgi=G.yr+':'+lg.length;const win=last.s[0]>last.s[1],m=last.s[0]-last.s[1],pf=last.st?ccPerf(me.pos,last.st,1):0;
      if(pf>=9||(win&&(m>=17||last.w==='P'))||(!win&&(m<=-14||last.w==='P'))){const sc=stGameScene(me,win,{opp:ccName(last.o),my:last.s[0],op:last.s[1],line:last.st?ccLine(me.pos,last.st):'',pf,playoff:last.w==='P',wk:'c'+lg.length});if(sc)stQueue(sc);}}}}

// ── official visits ──
function stVisitOk(p){return!!(p&&!ccOn()&&p.yr>=11&&!p.grad&&(p.offers||[]).length&&(stS().vis[stYk()]||0)<3);}
function stVisitList(p){const S=stS(),done=new Set((S.vis.log||[]).filter(v=>v.yk===stYk()).map(v=>v.k));return(p.offers||[]).filter(o=>!done.has(o.school+'|'+o.lvl)&&o.lvl!=='JUCO').sort((a,b)=>colPr(b)-colPr(a));}
function stVisitCard(){const p=stMe();if(!stVisitOk(p))return;const L=stVisitList(p);if(!L.length)return;const ct=document.getElementById('ct');if(!ct||document.getElementById('st-vcard'))return;
  const left=3-(stS().vis[stYk()]||0),el=document.createElement('div');el.className='pnl st-vcard';el.id='st-vcard';
  el.innerHTML=`<div class="pb"><div><div class="st-vc-h">Official visits</div><div class="st-vc-s">${left} visit${left===1?'':'s'} left this year · ${L.length} school${L.length===1?'':'s'} to see</div></div><button class="btn bsm" onclick="storyVisitPick()">Plan a visit</button></div>`;
  ct.insertBefore(el,ct.firstChild);}
window.storyVisitPick=function(){const p=stMe();if(!stVisitOk(p)){notify('No official visits available right now.','w');return;}const L=stVisitList(p).slice(0,8);
  openMo(`<h2>Plan an official visit</h2><p style="font-size:13px;color:var(--mu);margin:0 0 10px">Meet the head coach, tour the campus and spend a night with the players. It changes how much you like them, and how much they want you.</p>
   <div class="st-vlist">${L.map(o=>{const k=o.school+'|'+o.lvl,I=colInfo(k);return`<button class="bgh st-vrow" onclick="stVisitGo('${encodeURIComponent(k)}')">${colLogo(k,34)}<span><b>${stEsc(I.name)}</b><small>${stEsc(CC_LVN[o.lvl]||o.lvl)}${o.ti!=null?` · their interest ${o.ti}`:''}</small></span></button>`;}).join('')}</div>
   <div style="margin-top:12px;text-align:right"><button class="bgh bsm" onclick="clo()">Not now</button></div>`);};
window.stVisitGo=function(k){clo();stVisit(decodeURIComponent(k));};
function stVisit(k){const p=stMe(),o=stOffer(k);if(!p||!o)return;const S=stS(),I=colInfo(k),cc=stColCoach(k),h=stH(k+'|'+p.id),R=(()=>{try{return ccRoster(k);}catch(e){return[];}})().filter(q=>q&&q.fn);
  const host=R.filter(q=>q.pos===p.pos).sort((a,b)=>b.rat-a.rat)[0]||R[h%Math.max(1,R.length)]||{fn:FN[h%FN.length],ln:LN[(h>>>4)%LN.length],fs:h%900000,pos:p.pos},stad=[18000,24000,31000,42000,55000,68000,81000][I.lvl==='FBS'?3+h%4:h%3];
  const fit=clamp(Math.round((p.rat-(I.pr||50)*0.4-30)/6),-2,3),vibe=(h>>>7)%3-1;
  S.vis[stYk()]=(S.vis[stYk()]||0)+1;const rec={k,yk:stYk(),ti:o.ti==null?50:o.ti};S.vis.log=(S.vis.log||[]).concat([rec]).slice(-30);
  const sc={key:'visit:'+k+':'+stYk(),kind:'visit',title:`Official visit: ${I.name}`,cast:[cc],steps:[
    {place:`${I.name} football office`,cast:[cc],lines:[[cc.nm,`Welcome to ${I.name}, ${p.fn}. We have watched every snap of your film.`],[cc.nm,fit>0?`You would compete for snaps at ${p.pos} from the day you get here.`:`We see you as a guy who develops here and takes over a spot in a year or two.`]],
      ch:[{t:'What does my path to playing time look like?',fx:{k,vis:2+Math.max(0,fit),ti:2},r:'He pulls up the depth chart and walks you through it, name by name.'},{t:'Tell me about the academics.',fx:{k,vis:2,ti:4},r:'He lights up. His players graduate, and he can tell you the numbers.'},{t:'What is the NIL situation here?',fx:{k,vis:1,ti:-1,fol:30},r:'He gives you a straight answer and a phone number for the collective.'}]},
    {place:`${I.name} campus tour`,cast:[stPl(host,`${host.pos||p.pos}, your host`)],lines:[[host.fn,`I am ${host.fn}. Coach asked me to show you around.`],[host.fn,`That is the stadium. ${stad.toLocaleString()} seats, and it is loud on Saturdays.`]],
      ch:[{t:'Walk out of the tunnel onto the field.',fx:{k,vis:3},r:'Your name is up on the video board when you walk out. That gets you.'},{t:'Check out the weight room and the training staff.',fx:{k,vis:2,ti:2},r:'The strength coach puts you through a quick workout. He likes what he sees.'},{t:'Ask him what it is really like here.',fx:{k,vis:2+vibe*2,ti:1},r:vibe>0?'He loves it, and it shows.':vibe<0?'He hesitates before he answers. Not everything is perfect here.':'"It is a grind," he says. "But the guys are family."'}]},
    {place:'Downtown, the night of the visit',cast:[stPl(host,'Your host')],lines:[[host.fn,'A few of the guys are getting food downtown tonight.'],[host.fn,'No pressure. You in?']],
      ch:[{t:"I'm in.",fx:{k,vis:2,ti:3,fol:30},r:'You end up at a long table with half the team. They are already calling you a teammate.'},{t:'I will head back early. Big game this week.',fx:{k,ti:2,trust:1},r:'Word gets back to the head coach. He likes a recruit with priorities.'},{t:'Ask the guys about the coaching staff.',fx:{k,vis:1+vibe,ti:1},r:'You hear some stories you would not hear on the tour.'}]}]};
  stRun(sc,{done:C=>{rec.ti=o.ti==null?50:o.ti;try{addLog(`<span style="color:var(--te)">Official visit: ${p.fn} ${p.ln} visited ${I.name}.</span>`);}catch(e){}try{socPost({a:'me',h:socH(p),txt:`Thank you ${I.name} for having me this weekend.`,boost:1.4});}catch(e){}try{saveGame(true);}catch(e){}stAfter();},skip:()=>{S.vis[stYk()]=Math.max(0,(S.vis[stYk()]||1)-1);S.vis.log=(S.vis.log||[]).filter(v=>v!==rec);stAfter();}});}

// ── the combine: four drills and a team interview before the draft (wraps the draft step) ──
const ST_CMB_B={QB:4.8,RB:4.52,WR:4.48,TE:4.7,OL:5.25,DL:4.85,LB:4.65,CB:4.45,S:4.52,K:4.95};
function stGrade(d){return d>=0.12?'elite':d>=0.05?'great':d>=-0.03?'solid':d>=-0.1?'below average':'a red flag';}
function storyCombine(run){const C=G.cc,p=C&&C.p;if(!p){run();return;}const cmb=ccCombine(p),b=ST_CMB_B[p.pos]||4.7,g=()=>gaussR(),yr=ccYear()+1;
  const res=()=>`<div class="st-cmb"><span>40-yard dash <b>${cmb.forty.toFixed(2)}</b></span><span>Bench reps <b>${cmb.bench}</b></span><span>Vertical <b>${cmb.vert}"</b></span><span>Shuttle <b>${cmb.shut.toFixed(2)}</b></span></div>`;
  const agent={nm:'Marcus Hale',role:'Your agent',fc:{s:stH('agent'+p.id)}},gm=stCoach(`${stPick(SFPFX,stH('gm'+p.id))} ${stPick(SFSFX,stH('gm2'+p.id))}`,'General manager, pro team','#1d2b3a','#c9d3de',55);
  const sc={key:'combine:'+yr,kind:'combine',title:`${yr} pro combine`,cast:[agent],steps:[
    {place:'Combine, day one: the 40-yard dash',lines:[[agent.nm,'Every scout in the league is holding a stopwatch. Ten yards, twenty, forty.'],[agent.nm,'How do you want to come out of your stance?']],
      ch:[{t:'Explode out of the stance.',do:()=>{cmb.forty=+clamp(cmb.forty-0.035+g()*0.05,4.2,5.9).toFixed(2);return`You run a <b>${cmb.forty.toFixed(2)}</b>. That is ${stGrade(b-cmb.forty)} for a ${p.pos}.`;}},{t:'Smooth start, clean form.',do:()=>{cmb.forty=+clamp(cmb.forty+g()*0.015,4.2,5.9).toFixed(2);return`You run a <b>${cmb.forty.toFixed(2)}</b>. That is ${stGrade(b-cmb.forty)} for a ${p.pos}.`;}}]},
    {place:'Combine, day one: the bench press',lines:[[agent.nm,'Two hundred and twenty-five pounds, as many reps as you can.']],
      ch:[{t:'Pace the reps.',do:()=>`<b>${cmb.bench}</b> reps. Steady, no wasted energy.`},{t:'Go all out from the first rep.',do:()=>{cmb.bench=Math.max(0,cmb.bench+Math.round(1+g()*2));return`<b>${cmb.bench}</b> reps. The scouts in the front row lean forward.`;}}]},
    {place:'Combine, day two: the vertical jump',lines:[[agent.nm,'Vertical jump. Then the shuttle, and they look at your hips on every turn.']],
      ch:[{t:'Big arm swing, all legs.',do:()=>{cmb.vert=Math.max(15,cmb.vert+Math.round(1+g()*1.5));cmb.shut=+clamp(cmb.shut+g()*0.02,3.8,5.4).toFixed(2);return`<b>${cmb.vert}"</b> vertical and a <b>${cmb.shut.toFixed(2)}</b> shuttle.`;}},{t:'Plant hard on every turn in the shuttle.',do:()=>{cmb.shut=+clamp(cmb.shut-0.03+g()*0.05,3.8,5.4).toFixed(2);return`<b>${cmb.vert}"</b> vertical and a <b>${cmb.shut.toFixed(2)}</b> shuttle.`;}}]},
    {place:'Combine, team interviews',cast:[gm],lines:[[gm.nm,`Sit down, ${p.fn}. We have seen the tape. Tell us something the tape does not show.`]],extra:'',
      ch:[{t:'How I prepare: film every night, first one in.',fx:{fol:60},r:'He writes something down and underlines it twice.'},{t:'Point to my production. The numbers speak.',fx:{fol:90},r:'"They do," he says. "So does the competition you put them up against."'},{t:'Ask what they need at my position.',fx:{fol:40},r:'The room relaxes. Ten minutes later you are talking football like coaches.'}]}]};
  // the results so far sit under the lines of each step
  for(const s of sc.steps)Object.defineProperty(s,'extra',{get:res,configurable:true});sc.end=res;
  stRun(sc,{done:()=>{window._ccCmb=cmb;run();},skip:()=>{run();}});}
(function(){const f=window.ccDraftRun;if(typeof f!=='function'||f._st)return;const w=function(){if(gdsMain().scenes===false)return f.apply(this,arguments);storyCombine(()=>f());};w._st=true;window.ccDraftRun=w;})();
