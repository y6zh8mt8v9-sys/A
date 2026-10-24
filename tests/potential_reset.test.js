// Regression: a player rated past his potential must keep his rating through the offseason,
// and a potential set in Edit Player must stick.
const {boot,newCareer,ok,done}=require('./_lib');
(async()=>{
  const {browser,page,errors}=await boot();
  await newCareer(page);
  console.log('potential reset');
  // 1. skills trained past the ceiling (practice, spending points): overall rises above potential
  const r1=await page.evaluate(()=>{G.trainLevel=1;const p=myP().filter(q=>q.pos!=='K')[0];ovrSync(p,true);syncPot(p);
    const pot0=p.pot;attrShift(p,Math.min(99,p.pot+8));p.rat=ovrCalc(p);p._rc=p.rat;const rat0=p.rat;
    _osFocusSel='balanced';for(let ph=0;ph<3;ph++)applyPhaseTrain(ph);ovrSyncAll();return{pot0,rat0,rat:p.rat,pot:p.pot};});
  ok(r1.rat0>r1.pot0,`setup: overall ${r1.rat0} is above potential ${r1.pot0}`);
  ok(r1.rat>=r1.rat0,`offseason training keeps his overall (${r1.rat0} -> ${r1.rat})`);
  ok(r1.pot>=r1.rat,`potential rises to match (${r1.pot} >= ${r1.rat})`);
  // 2. Edit Player: raise overall above potential and set a new potential, through the real form
  const pid=await page.evaluate(()=>{const p=myP().filter(q=>q.pos!=='K')[1];return p.id;});
  await page.evaluate(id=>editPlayer(id),pid);await page.waitForTimeout(150);
  const cur=await page.evaluate(id=>{const p=getP(id);return{rat:p.rat,pot:p.pot,lo:p.potLo,hi:p.potHi};},pid);
  const wantR=Math.min(95,cur.pot+6),wantP=Math.min(99,wantR+4);
  await page.fill('#er',String(wantR));await page.fill('#ept',String(wantP));
  await page.evaluate(id=>savePlayer(id),pid);await page.waitForTimeout(150);
  const r2=await page.evaluate(id=>{const p=getP(id);const a={rat:p.rat,pot:p.pot};syncPot(p);updDev(p);a.potSync=p.pot;
    _osFocusSel='balanced';for(let ph=0;ph<3;ph++)applyPhaseTrain(ph);ovrSyncAll();a.ratOs=p.rat;a.potOs=p.pot;return a;},pid);
  ok(r2.rat===wantR,`edit saved overall ${wantR} (got ${r2.rat})`);
  ok(r2.pot===wantP,`edit saved potential ${wantP} (got ${r2.pot})`);
  ok(r2.potSync===wantP,`edited potential survives a sync (got ${r2.potSync})`);
  ok(r2.ratOs>=wantR,`offseason keeps the edited overall (${wantR} -> ${r2.ratOs})`);
  ok(r2.potOs>=wantP&&r2.potOs>=r2.ratOs,`offseason keeps the edited potential (${wantP} -> ${r2.potOs})`);
  // 3. lowering potential below the overall in the editor keeps the overall
  await page.evaluate(id=>editPlayer(id),pid);await page.waitForTimeout(100);
  await page.fill('#ept',String(wantR-10));await page.evaluate(id=>savePlayer(id),pid);
  const r3=await page.evaluate(id=>{const p=getP(id);syncPot(p);_osFocusSel='balanced';applyPhaseTrain(0);ovrSyncAll();return{rat:p.rat,pot:p.pot};},pid);
  ok(r3.rat>=wantR&&r3.pot>=r3.rat,`potential below overall: overall stays ${r3.rat}, potential ${r3.pot}`);
  // 4. the whole season rollover (finalizeOffseason) never lowers anyone on the team
  const r4=await page.evaluate(()=>{const before=new Map();for(const p of myP()){if(p.yr<12){attrShift(p,Math.min(99,p.pot+3));p.rat=ovrCalc(p);p._rc=p.rat;before.set(p.id,p.rat);}}
    let err=null;try{finalizeOffseason();}catch(e){err=String(e);}try{clo();}catch(e){}ovrSyncAll();
    let lowered=0,checked=0,under=0;for(const [id,r] of before){const p=getP(id);if(!p||p.sId!==G.myId)continue;checked++;if(p.rat<r)lowered++;if(p.pot<p.rat)under++;}
    return{err,lowered,checked,under};});
  ok(!r4.err,'finalizeOffseason ran'+(r4.err?': '+r4.err:''));
  ok(r4.checked>10&&r4.lowered===0,`season rollover lowered ${r4.lowered} of ${r4.checked} players`);
  ok(r4.under===0,`no player left under his potential after rollover (${r4.under})`);
  ok(errors.length===0,'no page errors'+(errors.length?': '+errors.slice(0,3).join(' | '):''));
  await browser.close();done();
})();
