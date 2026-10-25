// ═══════════ v2.16 7-ON-7 SUMMER LEAGUE: after the state championship, an optional passing tournament ═══════════
// Pick seven players for offense and seven for defense, pay the entry fee and play the best programs of your class.
// Quarterfinal and semifinal are single games, the league title is a best-of-five series. Standouts get college looks.
const S7_FEE=5000;
function s7Str(sid,picks){const L=(picks?G.players.filter(p=>picks.includes(p.id)):(sid===G.myId?myP():sPlayers(sid))).filter(p=>!(p.inj>0));
  const top=(pos,n)=>L.filter(p=>p.pos===pos).sort((a,b)=>b.rat-a.rat).slice(0,n).map(p=>p.rat);
  const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:40,qb=top('QB',1),rec=[...top('WR',3),...top('TE',1),...top('RB',1)],def=[...top('LB',2),...top('CB',3),...top('S',2)];
  return{off:(qb.length?qb[0]:45)*0.45+avg(rec)*0.55,def:avg(def)};}
function s7SimGame(a,b){const A=s7Str(a,a===G.myId?G.s7.picks:null),B=s7Str(b,b===G.myId?G.s7.picks:null);
  const pts=(o,d)=>{let p=0;for(let i=0;i<8;i++){const pr=clamp(0.42+(o-d)/55,0.12,0.82);if(Math.random()<pr)p+=Math.random()<0.6?7:Math.random()<0.5?8:6;}return p;};
  let x=pts(A.off,B.def),y=pts(B.off,A.def);if(x===y){if(Math.random()<0.5)x+=7;else y+=7;}return[x,y];}
function s7Start(){
  const opps=allSchools().filter(t=>t.id!==G.myId&&t.cls===G.cls).sort((a,b)=>teamOvr(b.id)-teamOvr(a.id)).slice(0,7);
  if(opps.length<3){notify('Not enough teams in your class for a 7-on-7 league','w');return;}
  const field=[G.myId,...opps.map(t=>t.id)].sort((a,b)=>teamOvr(b)-teamOvr(a));
  // bracket by seed: 1v8, 4v5, 2v7, 3v6
  const sd=[0,7,3,4,1,6,2,5].filter(i=>i<field.length).map(i=>field[i]);const pairs=[];for(let i=0;i+1<sd.length;i+=2)pairs.push([sd[i],sd[i+1]]);
  G.s7={yr:G.yr,picks:G.s7&&G.s7.yr===G.yr?G.s7.picks:[],field,round:0,rounds:[pairs.map(([a,b])=>({a,b,w:null,sc:null}))],series:null,done:false,res:[]};}
window.s7Open=function(){
  if(!G.s7||G.s7.yr!==G.yr||!G.s7.paid){if(pcAuto()){s7AutoEnter();return;}s7Signup();return;}s7Render();};
// Player Career: the coach enters the league with his best 14
function s7AutoEnter(){if(!G.unlimitedMoney&&G.budget<S7_FEE){notify('The program can\'t afford the 7-on-7 entry fee this year','w');return;}
  const ids=s7AutoPick();s7Start();if(!G.s7||G.s7.yr!==G.yr||!G.s7.rounds)return;if(!G.unlimitedMoney)G.budget-=S7_FEE;G.s7.picks=ids;G.s7.paid=true;addLog(`<span style="color:var(--gd)">The coach entered the 7-on-7 Summer League (-$${S7_FEE.toLocaleString()})</span>`);s7Render();}
// Player Career: you play the 7-on-7 games only when the coach picked your player
function s7MineIn(){const p=pcActive();return!!(p&&!(p.inj>0)&&G.s7&&G.s7.picks.includes(p.id));}
function s7Signup(){
  const pl=myP().filter(p=>!(p.inj>0)),O=['QB','WR','TE','RB'],D=['CB','S','LB'],sel=new Set((G.s7&&G.s7.yr===G.yr&&G.s7.picks)||s7AutoPick());
  const row=p=>`<label style="display:flex;gap:8px;align-items:center;padding:3px 0;font-size:13px"><input type="checkbox" class="s7-ck" value="${p.id}" style="width:auto;min-height:0" ${sel.has(p.id)?'checked':''} onchange="s7Count()"><b style="width:30px">${p.pos}</b>${p.fn} ${p.ln}<span style="margin-left:auto;color:var(--mu)">${p.rat} · ${['','','','','','','','','','Fr','So','Jr','Sr'][p.yr]||''}</span></label>`;
  openMo(`<h2>7-on-7 Summer League</h2>
    <div style="font-size:13px;color:var(--mu);margin-bottom:10px">The season is over, but the passing league is just starting. Seven on seven, no helmets or pads, two-hand touch and a four-second pass clock. You face the best programs of your class: single-game quarterfinal and semifinal, then a <b>best-of-five</b> series for the league title. College coaches come to watch: your standouts can pick up offers. Entry fee <b>$${S7_FEE.toLocaleString()}</b>, the champion takes home $10,000.</div>
    <div class="g2" style="gap:12px"><div><div style="font-weight:800;margin-bottom:4px">Offense: pick 7 (one QB)</div><div style="max-height:40vh;overflow-y:auto">${pl.filter(p=>O.includes(p.pos)).sort((a,b)=>O.indexOf(a.pos)-O.indexOf(b.pos)||b.rat-a.rat).map(row).join('')}</div></div>
      <div><div style="font-weight:800;margin-bottom:4px">Defense: pick 7</div><div style="max-height:40vh;overflow-y:auto">${pl.filter(p=>D.includes(p.pos)).sort((a,b)=>D.indexOf(a.pos)-D.indexOf(b.pos)||b.rat-a.rat).map(row).join('')}</div></div></div>
    <div id="s7-cnt" style="font-size:12px;margin:8px 0"></div>
    <div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap"><button class="bgh" onclick="s7Auto()">Best 14</button><button class="bgh" onclick="clo()">Not this year</button><button class="btn bgn" id="s7-go" onclick="s7Pay()">Enter for $${S7_FEE.toLocaleString()}</button></div>`);
  s7Count();}
function s7AutoPick(){const pl=myP().filter(p=>!(p.inj>0)),t=(pos,n)=>pl.filter(p=>p.pos===pos).sort((a,b)=>b.rat-a.rat).slice(0,n);
  const off=[...t('QB',1),...t('WR',4),...t('TE',1),...t('RB',1)],def=[...t('CB',3),...t('S',2),...t('LB',2)];
  const fill=(arr,poss)=>{for(const p of pl.filter(q=>poss.includes(q.pos)&&!arr.includes(q)).sort((a,b)=>b.rat-a.rat)){if(arr.length>=7)break;arr.push(p);}return arr.slice(0,7);};
  return[...fill(off,['WR','TE','RB']),...fill(def,['CB','S','LB'])].map(p=>p.id);}
window.s7Auto=function(){const ids=new Set(s7AutoPick());document.querySelectorAll('.s7-ck').forEach(c=>c.checked=ids.has(+c.value));s7Count();};
window.s7Count=function(){const ids=[...document.querySelectorAll('.s7-ck:checked')].map(c=>+c.value),ps=ids.map(getP).filter(Boolean),o=ps.filter(p=>['QB','WR','TE','RB'].includes(p.pos)),d=ps.filter(p=>['CB','S','LB'].includes(p.pos)),qb=o.filter(p=>p.pos==='QB').length;
  const ok=o.length===7&&d.length===7&&qb===1,el=document.getElementById('s7-cnt'),b=document.getElementById('s7-go');
  if(el)el.innerHTML=`Offense ${o.length}/7${qb!==1?` · <span style="color:var(--rd)">exactly one QB</span>`:''} · Defense ${d.length}/7`;if(b){b.disabled=!ok;b.style.opacity=ok?1:.45;}return ok?ids:null;};
window.s7Pay=function(){const ids=s7Count();if(!ids)return;if(!G.unlimitedMoney&&G.budget<S7_FEE){notify('Not enough money for the entry fee','e');return;}
  if(!G.unlimitedMoney)G.budget-=S7_FEE;s7Start();G.s7.picks=ids;G.s7.paid=true;addLog(`<span style="color:var(--gd)">Entered the 7-on-7 Summer League (-$${S7_FEE.toLocaleString()})</span>`);clo();s7Render();};
function s7Name(id){const t=getS(id);return t?`${t.name} ${t.mascot}`:'?';}
function s7MyGame(){const S=G.s7;if(!S||S.done)return null;
  if(S.series){const sr=S.series;return sr.w==null?{kind:'series',opp:sr.a===G.myId?sr.b:sr.a}:null;}
  const R=S.rounds[S.round];const g=R&&R.find(x=>(x.a===G.myId||x.b===G.myId)&&x.w==null);return g?{kind:'game',g,opp:g.a===G.myId?g.b:g.a}:null;}
function s7Render(){const S=G.s7;if(!S)return;const my=s7MyGame(),rn=['Quarterfinals','Semifinals','League final'];
  const rows=S.rounds.map((R,i)=>`<div style="margin-bottom:8px"><div style="font-weight:800;font-size:12px;color:var(--mu)">${rn[i]||'Round '+(i+1)}</div>${R.map(g=>`<div class="dr"><span>${g.a===G.myId?'<b>':''}${s7Name(g.a)}${g.a===G.myId?'</b>':''} vs ${g.b===G.myId?'<b>':''}${s7Name(g.b)}${g.b===G.myId?'</b>':''}</span><span>${g.sc?g.sc.join('-'):'–'}</span></div>`).join('')}</div>`).join('')
    +(S.series?`<div style="font-weight:800;font-size:12px;color:var(--mu)">League final · best of five</div><div class="dr"><span>${s7Name(S.series.a)} vs ${s7Name(S.series.b)}</span><span>${S.series.wa}-${S.series.wb}</span></div>${S.series.games.map((g,i)=>`<div style="font-size:12px;color:var(--mu)">Game ${i+1}: ${g.join('-')}</div>`).join('')}`:'');
  openMo(`<h2>7-on-7 Summer League</h2><div style="font-size:13px;margin-bottom:10px">${S.done?(S.champ===G.myId?'<b style="color:var(--gd)">League champions!</b>':`Your run is over. Champion: <b>${s7Name(S.champ)}</b>`):my?`Next: <b>${s7Name(my.opp)}</b>${my.kind==='series'?` · league final, game ${S.series.games.length+1}`:''}`:'Waiting on the other games…'}</div>
    ${rows}<div style="display:flex;gap:8px;justify-content:flex-end;align-items:center;margin-top:10px;flex-wrap:wrap">${my?`<label style="font-size:12px;display:flex;gap:6px;align-items:center;margin-right:auto">Game length <select style="width:auto;min-height:0" onchange="G.s7.qn=+this.value"><option value="1"${S.qn===1?' selected':''}>1 quarter</option><option value="2"${S.qn!==1?' selected':''}>2 quarters</option></select></label>${!pcAuto()||s7MineIn()?`<button class="btn bgn" onclick="s7Play()">Play it</button>`:''}<button class="bgh" onclick="s7Sim()">Simulate</button>`:''}<button class="bgh" onclick="clo()">Close</button></div>`);}
window.s7Play=function(){const my=s7MyGame();if(!my)return;if(pcAuto()&&!s7MineIn()){s7Sim();return;}const opp=getS(my.opp);clo();window._gdMode='all';window._gdInfo={kind:'s7',info:{opp,label:'7-on-7 Summer League'}};gdStart();};
window.s7Sim=function(){const my=s7MyGame();if(!my)return;const[a,b]=s7SimGame(G.myId,my.opp);s7Record(a,b);};
// a result for your game; the other games of the round are simulated, then the bracket moves on
function s7Record(my,op){const S=G.s7,g=s7MyGame();if(!g)return;
  if(g.kind==='series'){const sr=S.series,mineA=sr.a===G.myId;sr.games.push(mineA?[my,op]:[op,my]);if(my>op){if(mineA)sr.wa++;else sr.wb++;}else{if(mineA)sr.wb++;else sr.wa++;}
    if(sr.wa>=3||sr.wb>=3){sr.w=sr.wa>=3?sr.a:sr.b;s7Finish(sr.w);}}
  else{const x=g.g;x.sc=x.a===G.myId?[my,op]:[op,my];x.w=my>op?G.myId:g.opp;s7Advance();}
  S.res.push([g.opp,my,op]);notify(`7-on-7: ${my>op?'Win':'Loss'} ${my}-${op}`);s7Render();}
function s7Advance(){const S=G.s7,R=S.rounds[S.round];
  for(const x of R)if(x.w==null&&x.a!==G.myId&&x.b!==G.myId){const sc=s7SimGame(x.a,x.b);x.sc=sc;x.w=sc[0]>sc[1]?x.a:x.b;}
  if(R.some(x=>x.w==null))return;
  const win=R.map(x=>x.w);
  if(!win.includes(G.myId)){// you are out: the rest of the bracket plays out
    let W=win;while(W.length>2){const nr=[];for(let i=0;i+1<W.length;i+=2){const sc=s7SimGame(W[i],W[i+1]);nr.push(sc[0]>sc[1]?W[i]:W[i+1]);}W=nr;}
    let wa=0,wb=0;while(wa<3&&wb<3){const sc=s7SimGame(W[0],W[1]);if(sc[0]>sc[1])wa++;else wb++;}s7Finish(wa>=3?W[0]:W[1]);return;}
  if(win.length===2){S.series={a:win[0],b:win[1],wa:0,wb:0,games:[],w:null};return;}
  const nr=[];for(let i=0;i+1<win.length;i+=2)nr.push({a:win[i],b:win[i+1],w:null,sc:null});S.rounds.push(nr);S.round++;}
function s7Finish(champ){const S=G.s7;S.done=true;S.champ=champ;
  const won=S.res.filter(r=>r[1]>r[2]).length,me=champ===G.myId;
  if(me){G.budget+=10000;G.prestige=clamp((G.prestige||1)+0.05,1,5);G.trophies=G.trophies||[];G.trophies.push({type:'7v7',yr:G.yr,rec:`${won}-${S.res.length-won}`,cls:G.cls});
    addNews('myteam','7-on-7 League Champions!',`Your passing league team won the title (+$10,000).`);}
  // college coaches were watching: standouts pick up offers
  let n=0;for(const id of S.picks){const p=getP(id);if(!p||p.committed)continue;const ch=0.12+won*0.07+(me?0.15:0)+clamp((p.rat-55)/100,0,0.3);
    if(Math.random()<ch){try{genOffers(p,true,null);n++;}catch(e){}p.morale=clamp((p.morale||65)+4,0,100);}}
  if(n)addNews('offer',`${n} of your 7-on-7 players drew college offers`,'Coaches liked what they saw at the summer passing league.');
  addLog(`<span style="color:var(--gd)">7-on-7 league ${me?'champions':'finished'} · ${won} win${won===1?'':'s'}${n?` · ${n} new offer${n===1?'':'s'}`:''}</span>`);}
function s7Panel(){if(!G||G.phase!=='postseason')return'';const S=G.s7&&G.s7.yr===G.yr?G.s7:null;
  if(S&&S.done)return'';
  if(pcAuto()&&!(S&&S.paid)&&!G.unlimitedMoney&&G.budget<S7_FEE)return'';
  return`<div class="pnl" style="margin-bottom:14px"><div class="ph">7-on-7 Summer League</div><div class="pb" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><div style="flex:1;min-width:200px;font-size:13px;color:var(--mu)">${S&&S.paid?'Your passing league team is in the bracket.':pcAuto()?'The coach takes his best 7 on offense and 7 on defense to the passing league. Best-of-five final; standouts get college looks.':'Optional: pick 7 on offense and 7 on defense and play the best programs of your class. Best-of-five final; standouts get college looks. Entry $'+S7_FEE.toLocaleString()+'.'}</div><button class="btn" onclick="s7Open()">${S&&S.paid?'Open bracket':pcAuto()?'See the bracket':'Enter the league'}</button></div></div>`;}
const _pgDash0=pgDash;pgDash=function(){if(gdsMain().cnav!==false)return _pgDash0();let x='';try{x=jobPanel()+s7Panel();}catch(e){}try{x=pcPanel()+x;}catch(e){}return x+_pgDash0();};
// ═══════════ v2.16 PROGRAM MONEY: boosters, merchandise, broadcasts, sponsors, fundraisers, summer camps ═══════════
function finYr(){if(!G.fin||G.fin.yr!==G.yr)G.fin={yr:G.yr,boost:0,merch:0,tv:0,spons:0,fund:0,camp:0,sign:0,fundDone:false,sponsDone:false,campDone:false};return G.fin;}
function finAdd(k,v,msg){v=Math.round(v);if(!(v>0))return;G.budget+=v;const F=finYr();F[k]=(F[k]||0)+v;if(msg)addLog(`<span style="color:var(--gn)">${msg} +$${v.toLocaleString()}</span>`);}
// after every game: the booster club gives more after wins and to winning programs; home games sell gear; big games are broadcast
function moneyAfterGame(opp,kind,wk){
  try{const s=myS();if(!s||!opp)return;const gp=(G.wins||0)+(G.losses||0),wp=gp?(G.wins||0)/gp:0.5,pr=G.prestige||1;
    const home=kind==='reg'?(((wk|0)+G.myId)%2===0):kind==='po'?((G.wins||0)>=(opp.wins||0)):true;
    const rival=typeof isRivalry==='function'&&isRivalry(G.myId,opp.id);
    finAdd('boost',(pr*500+wp*2200)*(rival?1.4:1)*(kind==='po'?1.5:1)*(0.85+Math.random()*0.3),null);
    if(home){const cap=stadBase(stadOf(s)).cap;finAdd('merch',cap*(0.18+0.05*pr)*(0.6+wp*0.8)*(rival?1.3:1)*(kind==='reg'&&hcIs(wk)?1.3:1)*(0.85+Math.random()*0.3),null);}
    if(kind==='po'||kind==='nat'||rival)finAdd('tv',kind==='nat'?40000:kind==='po'?6000+pr*1500:2500+pr*700,kind==='po'?'Playoff broadcast rights':kind==='nat'?'National title broadcast':'Rivalry game streaming deal');
  }catch(e){console.error('money',e);}
}
const _gateAfter0=gateAfter;gateAfter=function(opp,kind,wk,my,op){_gateAfter0(opp,kind,wk,my,op);moneyAfterGame(opp,kind,wk);};
// once a season: a local sponsor (bigger for winners and champions), a fundraiser, and a summer camp in the offseason
function finTitles(){return(G.trophies||[]).length;}
window.finSponsor=function(){const F=finYr();if(F.sponsDone){notify('You already signed a sponsor this season','w');return;}F.sponsDone=true;
  const v=Math.round((5000+(G.prestige||1)*6000+finTitles()*4000)*(0.85+Math.random()*0.3));
  const who=pick(['Hometown Ford','Main Street Bank','Valley Pizza Co.','Riverside Auto Body','First Community Credit Union','Lone Pine Hardware','Summit Physical Therapy','Prairie Farm Supply','Big Al\'s BBQ','Coastline Insurance']);
  finAdd('spons',v,`${who} signs a sponsorship deal`);notify(`${who} sponsors the program: +$${v.toLocaleString()}`);nav(G._page,G._arg);};
window.finFund=function(){const F=finYr();if(F.fundDone){notify('One fundraiser a season','w');return;}F.fundDone=true;
  const kind=pick(['car wash','golf outing','pancake breakfast','raffle night','alumni dinner']),v=Math.round((3000+(G.prestige||1)*1800+myP().length*60)*(0.7+Math.random()*0.6));
  finAdd('fund',v,`Team ${kind}`);for(const p of myP())p.morale=clamp((p.morale||65)+1,0,100);notify(`The ${kind} raised $${v.toLocaleString()}`);nav(G._page,G._arg);};
window.finCamp=function(){const F=finYr();if(G.phase!=='offseason'){notify('Summer camps are held in the offseason','w');return;}if(F.campDone){notify('You already held a camp this offseason','w');return;}F.campDone=true;
  const fac=(G.fac&&((G.fac.train||1)+(G.fac.weight||1)))||2,kids=Math.round(40+(G.prestige||1)*25+fac*6),v=Math.round(kids*(120+(G.prestige||1)*15)*(0.9+Math.random()*0.2));
  finAdd('camp',v,`Youth summer camp (${kids} campers)`);notify(`${kids} kids came to your summer camp: +$${v.toLocaleString()}`);nav(G._page,G._arg);};
function moneyHtml(){const F=finYr(),tot=['boost','merch','tv','spons','fund','camp','sign'].reduce((a,k)=>a+(F[k]||0),0),r=(l,v)=>`<div class="dr"><span class="a">${l}</span><span style="color:var(--gn);font-weight:700">$${(v||0).toLocaleString()}</span></div>`;
  return`<div class="pnl" style="margin-bottom:14px"><div class="ph">Program income</div><div class="pb">
    <div style="font-size:13px;color:var(--mu);margin-bottom:8px">Boosters give after every game (more when you win and in rivalries), home games sell team gear, playoff and rivalry games are broadcast, and seniors who sign with colleges earn placement bonuses. Once a season you can sign a sponsor and hold a fundraiser; in the offseason you can host a youth summer camp.</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
      <button class="${F.sponsDone?'bgh':'btn'} bsm" ${F.sponsDone?'disabled':''} onclick="finSponsor()">${F.sponsDone?'Sponsor signed':'Find a sponsor'}</button>
      <button class="${F.fundDone?'bgh':'btn'} bsm" ${F.fundDone?'disabled':''} onclick="finFund()">${F.fundDone?'Fundraiser held':'Hold a fundraiser'}</button>
      <button class="${F.campDone||G.phase!=='offseason'?'bgh':'btn'} bsm" ${F.campDone||G.phase!=='offseason'?'disabled':''} onclick="finCamp()">${F.campDone?'Camp held':G.phase==='offseason'?'Host a summer camp':'Summer camp (offseason)'}</button></div>
    <div class="g2" style="gap:6px 14px;font-size:13px">${r('Boosters',F.boost)}${r('Team gear',F.merch)}${r('Broadcasts',F.tv)}${r('Sponsors',F.spons)}${r('Fundraisers',F.fund)}${r('Summer camp',F.camp)}${r('Signing bonuses',F.sign)}${r('<b>This season</b>',tot)}</div></div></div>`;}
function ticketHtml(){const s=myS(),cap=stadBase(stadOf(s)).cap,g=G.gate&&G.gate.yr===G.yr?G.gate:null,cur=G.ticket||'normal';
  return`<div class="pnl" style="margin-bottom:14px"><div class="ph">Ticket sales</div><div class="pb">
    <div style="font-size:13px;color:var(--mu);margin-bottom:8px">Home games earn money from tickets and concessions. Winning, prestige, rivals and playoff games fill the stands; higher prices earn more per fan but keep some away. A bigger stadium (Facilities) holds more fans.</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">${Object.entries(TICKET).map(([k,v])=>`<button class="${k===cur?'btn bbl':'bgh'} bsm" onclick="ticketSet('${k}')">${v[2]} · $${v[0]}</button>`).join('')}</div>
    <div class="g2" style="gap:8px;font-size:13px">
      <div class="dr"><span class="a">Stadium capacity</span><span>${cap.toLocaleString()}</span></div>
      <div class="dr"><span class="a">Home gates this season</span><span>${g?g.n:0}</span></div>
      <div class="dr"><span class="a">Fans this season</span><span>${g?g.att.toLocaleString():0}</span></div>
      <div class="dr"><span class="a">Gate money this season</span><span style="color:var(--gn);font-weight:700">$${g?g.rev.toLocaleString():0}</span></div>
      ${g&&g.last?`<div class="dr" style="grid-column:1/-1"><span class="a">Last gate</span><span>${g.last.att.toLocaleString()} fans vs ${g.last.opp} · $${g.last.rev.toLocaleString()}</span></div>`:''}
    </div></div></div>`;}
function glSet(wk,opp,my,op,kind){_glCtx={w:wk,o:schAbbr(opp),r:(my>op?'W ':my<op?'L ':'T ')+my+'-'+op,k:kind||'reg'};_glXP=[];}
let _glXP=[];
// XP for what a player did in a game: everyone who played gets a little, big games get a lot more (10 XP = 1 skill point)
function gameXP(p,st){
  if(p.pos==='K'||p.pos==='P')return 1+Math.min(3,(st.fgm||0)+((st.xpm||0)>=3?1:0));
  if(p.pos==='OL')return 1+Math.min(4,Math.round((st.pancakes||0)*0.8-(st.sacksA||0)*0.6+1));
  const b=STREAK_BENCH[p.pos]||10,r=scorePerfEntry(st,p.pos)/b;
  let xp=1+clamp(Math.round(r*2),0,4);if(p.traits&&p.traits.includes('hard-worker'))xp+=1;if(_glCtx&&_glCtx.k!=='reg')xp+=1;
  return xp;
}
function applyStats(sm){
  for(const[pid,st]of Object.entries(sm)){
    const p=getP(parseInt(pid));if(!p)continue;
    try{wkAwardCand(p,st);}catch(e){}
    if(_glCtx&&p.sId===G.myId){try{
      if(!Array.isArray(p.gameLog))p.gameLog=[];p.gameLog.push({w:_glCtx.w,o:_glCtx.o,r:_glCtx.r,k:_glCtx.k,s:stCompact(st)});if(p.gameLog.length>20)p.gameLog.shift();
      const xp=gameXP(p,st);p.xp=(p.xp||0)+xp;let sp=0;while(p.xp>=10){p.xp-=10;sp++;}if(sp)p.sp=(p.sp||0)+sp;_glXP.push({p,xp,sp});
      if(p.id===G.myPlayerId){try{pcGainXP(p,xp*60+(/^W/.test(_glCtx.r)?50:0)+(_glCtx.k!=='reg'?75:0),'game');}catch(e){}try{socGame(st,{r:_glCtx.r,o:_glCtx.o,k:_glCtx.k});}catch(e){}}
    }catch(e){}}
    for(const k of Object.keys(st)){p.seasStats[k]=(p.seasStats[k]||0)+(st[k]||0);p.carStats[k]=(p.carStats[k]||0)+(st[k]||0);}
    p.seasStats.gp=(p.seasStats.gp||0)+1;p.carStats.gp=(p.carStats.gp||0)+1;
    // consistency: games at or above the position's typical good-game line
    if(p.pos!=='K'){const bm={QB:22,RB:15,WR:12,TE:10,LB:11,DL:9,CB:8,S:8,OL:3}[p.pos]||10;if(scorePerfEntry(st,p.pos)>=bm){p.seasStats.gg=(p.seasStats.gg||0)+1;p.carStats.gg=(p.carStats.gg||0)+1;}}
  }
}

