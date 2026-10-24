// Career story scenes: queued at the big moments, shown on the dashboard, choices apply their effects, every scene can be skipped.
const {boot,newCareer,ok,done}=require('./_lib');
const SHOTS=process.env.SHOTS||require('path').join(require('os').tmpdir(),'g27-story-shots');
require('fs').mkdirSync(SHOTS,{recursive:true});
const scene=page=>page.evaluate(()=>{const e=document.getElementById('st-scene');const mo=document.getElementById('mo');return e&&mo.classList.contains('open')?e.dataset.key:null;});
async function waitScene(page,ms=6000){for(let t=0;t<ms;t+=250){const k=await scene(page);if(k)return k;await page.waitForTimeout(250);}return null;}
async function shot(page,name){await page.screenshot({path:`${SHOTS}/${name}.png`});}
async function run(vp,tag){
  const {browser,page,errors}=await boot({ctx:{viewport:vp,deviceScaleFactor:vp.width<500?2:1}});
  console.log(`story scenes (${tag})`);
  await newCareer(page);
  await page.evaluate(()=>{pcCreate({fn:'Jordan',ln:'Hayes',pos:'WR',num:4,lock:true});G.morale=60;nav('mine');});
  // 1. first practice: shows on My Player, the choice changes coach trust
  let k=await waitScene(page);ok(k==='first',`first practice scene shows (${k})`);await shot(page,`${tag}-first-practice`);
  let r=await page.evaluate(()=>{const p=myPlayer(),b=p.rel;storyPick(0);return{b,a:p.rel,sum:!!document.querySelector('.st-end .st-fx')};});
  ok(r.a===r.b+3&&r.sum,`choice applies coach trust (${r.b} -> ${r.a}) and shows what changed`);
  await page.evaluate(()=>storyDone());ok(!(await scene(page)),'continue closes the scene');
  // 2. a big win in a silent sim: queued, never opened during the sim; shows back on the dashboard
  r=await page.evaluate(()=>{const i=G.sched.findIndex(g=>g.type==='regular'&&!g.result);const p=myPlayer();const g=G.sched[i];g.isRivalry=false;
    simGame(i,true,{my:45,opp:10,sm:{[p.id]:{gp:1,rec:9,recYds:182,recTD:3}}});return{open:document.getElementById('mo').classList.contains('open'),q:G.story.q.map(x=>x.kind)};});
  ok(!r.open&&r.q.length===1&&/coach|diner/.test(r.q[0]),`big game queued without interrupting the sim (${r.q})`);
  await page.evaluate(()=>nav('dash'));k=await waitScene(page);ok(/^g:/.test(k||''),`post-game talk shows on the dashboard (${k})`);await shot(page,`${tag}-postgame`);
  // skip: no effect, gone from the queue
  r=await page.evaluate(()=>{const p=myPlayer(),b=[p.rel,G.morale,soc().fol];storySkip();return{b,a:[p.rel,G.morale,soc().fol],q:G.story.q.length};});
  ok(JSON.stringify(r.b)===JSON.stringify(r.a)&&r.q===0&&!(await scene(page)),'skipping changes nothing and removes the scene');
  // 3. rivalry week
  await page.evaluate(()=>{const g=G.sched.find(g=>g.type==='regular'&&!g.result);g.isRivalry=true;G.phase='regular';nav('dash');});
  k=await waitScene(page);ok(/^riv:/.test(k||''),`rivalry week scene (${k})`);await shot(page,`${tag}-rivalry`);
  r=await page.evaluate(()=>{const b=soc().fol;storyPick(2);storyDone();return soc().fol-b;});ok(r>0,`rivalry post on Huddle adds followers (+${r})`);
  // 4. an offer: the college coach calls; the reply moves his interest in the school
  r=await page.evaluate(()=>{const p=myPlayer();p.yr=11;p.offers=p.offers||[];const c=COLLEGES.filter(c=>c.lvl==='FBS').sort((a,b)=>b.pr-a.pr)[3];addOffer(p,c,null,'');nav('dash');return c.school+'|'+c.lvl;});
  const offK=r;k=await waitScene(page);ok(k==='off:'+offK,`offer call scene (${k})`);await shot(page,`${tag}-offer`);
  r=await page.evaluate(k=>{const p=myPlayer(),o=p.offers.find(o=>o.school+'|'+o.lvl===k),b=colPr(o);storyPick(1);storyDone();return{b,a:colPr(o),vis:o.vis,ti:o.ti};},offK);
  ok(r.a===r.b+3&&r.vis===3&&r.ti===51,`offer reply: his interest +3 (${r.b} -> ${r.a}), theirs ${r.ti}`);
  // 5. official visit (junior year): the invite opens a three-part visit, effects on both interests
  k=await waitScene(page);ok(/^vinv:/.test(k||''),`official visit invite (${k})`);
  await page.evaluate(()=>storyPick(0));await page.waitForTimeout(150);
  k=await scene(page);ok(/^visit:/.test(k||''),`visit starts (${k})`);await shot(page,`${tag}-visit-coach`);
  await page.evaluate(()=>storyPick(1));await page.waitForTimeout(100);await shot(page,`${tag}-visit-campus`);
  await page.evaluate(()=>storyPick(0));await page.waitForTimeout(100);
  r=await page.evaluate(k=>{const p=myPlayer(),o=p.offers.find(o=>o.school+'|'+o.lvl===k);storyPick(0);const chips=[...document.querySelectorAll('.st-fx span')].map(s=>s.textContent);return{vis:o.vis,ti:o.ti,chips};},offK);
  await shot(page,`${tag}-visit-summary`);
  ok(r.vis===3+2+3+2&&r.ti===51+4+3,`visit: his interest ${r.vis}, theirs ${r.ti} (${r.chips.join(', ')})`);
  await page.evaluate(()=>storyDone());
  // My Player has the plan-a-visit card while visits are left
  await page.evaluate(()=>{const p=myPlayer(),c=COLLEGES.filter(c=>c.lvl==='FCS')[0];addOffer(p,c,null,'');G.story.offN=p.offers.length;G.story.q=[];nav('mine');});await page.waitForTimeout(300);
  r=await page.evaluate(()=>({card:!!document.getElementById('st-vcard'),left:3-(G.story.vis[stYk()]||0)}));ok(r.card&&r.left===2,`My Player shows official visits (${r.left} left)`);
  // 6. season cap
  r=await page.evaluate(()=>{for(let w=1;w<12;w++)storyGame(true,{opp:'X',my:50,op:0,wk:w*3,sm:{}});return{n:G.story.n[stYk()],q:G.story.q.length};});
  ok(r.n<=6,`at most 6 scenes a season (${r.n}, ${r.q} waiting)`);
  await page.evaluate(()=>{G.story.q=[];});
  // 7. commitment and signing day, then the combine before the draft
  await page.evaluate(k=>{const p=myPlayer();p.committed=p.offers.find(o=>o.school+'|'+o.lvl===k);nav('dash');},offK);
  k=await waitScene(page);ok(k==='cm:'+offK,`commitment scene (${k})`);await page.evaluate(()=>{storyPick(1);storyDone();G.story.q=[];});
  await page.evaluate(()=>{const p=myPlayer();ccCreate(p,true);ccBegin();nav('dash');});
  k=await waitScene(page);ok(k==='sign',`signing day scene in college (${k})`);await shot(page,`${tag}-signing`);
  r=await page.evaluate(()=>{const b=G.cc.trust;storyPick(0);storyDone();return G.cc.trust-b;});ok(r===3,`signing day: college coach trust +${r}`);
  await page.waitForTimeout(1200);await page.evaluate(()=>{clo();G.story.q=[];});
  await page.evaluate(()=>{G.cc.car=[{gp:12,st:{rec:60,recYds:900,recTD:8}}];ccDraftRun();});
  k=await scene(page);ok(/^combine:/.test(k||''),`the draft opens with the combine (${k})`);await shot(page,`${tag}-combine-40`);
  await page.evaluate(()=>{storyPick(0);});await page.waitForTimeout(80);await page.evaluate(()=>{storyPick(1);storyPick(0);});await shot(page,`${tag}-combine-interview`);
  await page.evaluate(()=>{storyPick(0);});
  r=await page.evaluate(()=>{const t=[...document.querySelectorAll('.st-cmb b')].map(b=>b.textContent);storyDone();return{t,d:G.cc.draft&&G.cc.draft.cmb,txt:(document.getElementById('mc2')||{}).textContent||''};});
  ok(r.d&&r.t.length===4&&r.txt.includes(String(r.d.forty))&&r.txt.includes('Draft'),`draft uses the combine results (${r.d&&r.d.forty} 40, ${r.d&&r.d.bench} reps)`);
  await shot(page,`${tag}-draft`);
  // 8. coach mode: a word with the captain or a coordinator after a blowout
  await newCareer(page);
  r=await page.evaluate(()=>{G.morale=60;const i=G.sched.findIndex(g=>g.type==='regular'&&!g.result);G.sched[i].isRivalry=false;simGame(i,true,{my:49,opp:3});nav('dash');return G.story.q.map(x=>x.kind);});
  ok(r.length===1&&/captain|coord/.test(r[0]),`coach mode post-game talk queued (${r})`);
  k=await waitScene(page);ok(/^c:/.test(k||''),`coach mode scene shows (${k})`);await shot(page,`${tag}-coach-mode`);
  r=await page.evaluate(()=>{const b=G.morale;storyPick(0);storyDone();return G.morale-b;});ok(r>0,`coach mode choice lifts morale (+${r})`);
  // scenes can be turned off
  r=await page.evaluate(()=>{gdsMainSet('scenes',false);G.story.q=[{key:'t',kind:'coach',steps:[{lines:[],ch:[{t:'x'}]}],cast:[]}];storyShow();const o=document.getElementById('mo').classList.contains('open');gdsMainSet('scenes',true);G.story.q=[];return o;});
  ok(!r,'Settings can turn scenes off');
  ok(errors.length===0,'no page errors'+(errors.length?': '+errors.slice(0,4).join(' | '):''));
  await browser.close();
}
(async()=>{await run({width:390,height:844},'phone');await run({width:1280,height:860},'desktop');done();})();
