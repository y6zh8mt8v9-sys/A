const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const OUT=__dirname+'/';
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 if(process.argv[2]!=='noplay'){const ctx=await b.newContext({viewport:{width:1280,height:720},recordVideo:{dir:OUT+'raw',size:{width:1280,height:720}}});const p=await ctx.newPage();
  await p.addInitScript(()=>{Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});Object.defineProperty(navigator,'deviceMemory',{get:()=>8});});
  await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(4000);
  await p.addStyleTag({content:'#title>*:not(#tt-demo){opacity:0!important} #tt-demo-sh{display:none!important} #tt-demo{opacity:1!important}'});
  await p.waitForTimeout(60000);await ctx.close();}
 const ctx=await b.newContext({viewport:{width:405,height:720},deviceScaleFactor:2.6667,isMobile:true,hasTouch:true});const p=await ctx.newPage();
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
 await p.addInitScript(()=>{try{localStorage.setItem('gpgm_pcTut','1');}catch(e){}});
 await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(4000);
 const shot=async n=>{await p.waitForTimeout(600);await p.screenshot({path:OUT+'s_'+n+'.png'});console.log('shot',n);};
 const close=async()=>p.evaluate(()=>{for(let i=0;i<300;i++){const pu=document.getElementById('pu');if(pu&&pu.classList.contains('open')){nxp();continue;}break;}const mo=document.getElementById('mo');if(mo&&mo.classList.contains('open'))clo();try{closeTutorial();}catch(e){}});
 await p.addStyleTag({content:'#tt-demo,#tt-demo-sh{display:none!important}'});await shot('title');
 await p.evaluate(()=>ttNew());await p.waitForTimeout(600);
 await p.evaluate(()=>{const o=_mapOffers[0];selectOfferSchool(o.team.id,o.countyId);startGame();});await p.waitForTimeout(7000);await close();
 await p.evaluate(()=>{G.tutAsked=true;openScheduleBuilder();window._skipRivalryPick&&window._skipRivalryPick();sbAutoFill();finalizeSchedule();});await close();
 await p.evaluate(()=>nav('dash'));await shot('dash');
 // the box score, from a real game
 await p.evaluate(()=>{const me=myS(),g=G.sched.find(x=>!x.result&&x.oppId!=null),opp=getS(g.oppId);const st={};
   const mine=G.players.filter(x=>x.sId===me.id),th=G.players.filter(x=>x.sId===opp.id),f=(a,ps)=>a.find(x=>x.pos===ps);
   [[mine,1],[th,0]].forEach(([a,k])=>{const Q=f(a,'QB'),R=f(a,'RB'),W=f(a,'WR'),L=f(a,'LB');if(Q)st[Q.id]={passAtt:27,passCmp:19,passYds:264,passTD:3,passInt:k?0:1};if(R)st[R.id]={rushAtt:21,rushYds:118,rushTD:1};if(W)st[W.id]={rec:7,recYds:121,recTD:2,yac:44};if(L)st[L.id]={tackles:11,tfl:2,sacks:1};});
   openMo(gdBoxHtml({stats:st,score:[35,21],splits:[{o:{'Slant':{n:7,yds:61,td:1,fd:4},'Power':{n:9,yds:48,td:1,fd:3}},d:{'Cover 3':{n:9,yds:44,to:1}}}],xp:[{p:mine[0],xp:45,sp:4}]},me,opp));});
 await shot('box');await close();
 // another team's jerseys
 await p.evaluate(()=>{const o=allSchools().find(s=>s.id!==G.myId);openEditSch(o.id);});await p.waitForTimeout(600);
 await p.evaluate(()=>{const e=document.getElementById('sch-uni');if(e)e.scrollIntoView({block:'start'});});await shot('jersey');await close();
 // gear on a player
 await p.evaluate(()=>{const q=G.players.find(x=>x.sId===G.myId&&x.pos==='WR');editPlayer(q.id);});await p.waitForTimeout(2500);
 await p.evaluate(()=>{const e=document.getElementById('eq-prev')||document.querySelector('#mb canvas');if(e)e.scrollIntoView({block:'center'});});await shot('gear');await close();
 // season, rankings and playoff bracket
 for(let i=0;i<14;i++){await p.evaluate(()=>{try{if(G.phase==='regular'||G.phase==='offseason')advWk();}catch(e){}});await p.waitForTimeout(500);
   await p.evaluate(()=>{const b=[...document.querySelectorAll('#mb button')].find(x=>/^Sim/.test(x.textContent.trim()));if(b)b.click();});await p.waitForTimeout(1600);await close();
   if(await p.evaluate(()=>G.phase!=='regular'&&G.phase!=='offseason'))break;}
 await p.evaluate(()=>nav('rank'));await shot('rank');
 await p.evaluate(()=>{try{if(G.phase!=='playoffs')startPlayoffs();}catch(e){}});await close();
 await p.evaluate(()=>nav('playoff'));await shot('bracket');
 console.log('phase',await p.evaluate(()=>G.phase+' wk'+G.week+' '+G.wins+'-'+G.losses));
 console.log(errs.slice(0,4).join('|')||'no errors');await b.close();})();
