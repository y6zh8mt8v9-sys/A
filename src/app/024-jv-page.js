// ══════════ JV PAGE ══════════
function pgJV(){
  if(!G.jvRoster)G.jvRoster=[];
  initJVRoster();
  const jvPl=jvPlayers().sort((a,b)=>{
    if(a.yr!==b.yr)return a.yr-b.yr;
    return b.rat-a.rat;
  });
  // Varsity-eligible players who could be relegated (yr<=10, not on JV)
  const varsigyEligible=G.players.filter(p=>p.sId===G.myId&&p.yr<=10&&!p.onJV).sort((a,b)=>b.rat-a.rat);
  const yrLabel={8:'<span style="color:var(--y8,#88ccff);font-weight:700">8th</span>',9:'<span class="yf">Fr</span>',10:'<span class="ys">So</span>'};
  // Compute standout threshold BEFORE building table rows that reference it
  const sortedRats=jvPl.map(p=>p.rat).sort((a,b)=>b-a);
  const standoutThreshold=sortedRats.length>0?(sortedRats[Math.floor(sortedRats.length*0.25)]||0):Infinity;
  const standouts=sortedRats.length>0?jvPl.filter(p=>p.rat>=standoutThreshold).length:0;
  const jvTableRows=jvPl.map(p=>{
    const isStandout=p.rat>=standoutThreshold&&sortedRats.length>0;
    return`
    <tr${isStandout?' style="background:rgba(245,192,48,.07)"':''}>
      <td style="color:var(--mu)">${p.num}</td>
      <td><div style="display:flex;align-items:center;gap:6px">${face(p.fs,26)}<span>${p.fn} ${p.ln}${isStandout?' <span style="font-size:9px;color:var(--gd);font-weight:800">★ PROSPECT</span>':''}</span></div></td>
      <td><span class="pb2">${p.pos}</span></td>
      <td>${yrLabel[p.yr]||yrL(p.yr)}</td>
      <td>${rb(p.rat)}</td>
      <td>${devB(p.dev)}</td>
      <td style="font-size:11px;color:var(--mu)">${(p.traits||[]).map(t=>trB(t)).join('')}</td>
      <td>
        <button class="btn bgn bxs" onclick="callUpToVarsity(${p.id})" title="Call up to Varsity">Call Up</button><button class="bgh bxs" onclick="talkOpen(${p.id})" title="Talk him into moving up">Talk</button>
      </td>
    </tr>`;
  }).join('');
  const varsityTableRows=varsigyEligible.map(p=>`
    <tr>
      <td style="color:var(--mu)">${p.num}</td>
      <td><div style="display:flex;align-items:center;gap:6px">${face(p.fs,26)}<span>${p.fn} ${p.ln}</span></div></td>
      <td><span class="pb2">${p.pos}</span></td>
      <td>${yrL(p.yr)}</td>
      <td>${rb(p.rat)}</td>
      <td>${devB(p.dev)}</td>
      <td style="font-size:11px;color:var(--mu)">${(p.traits||[]).map(t=>trB(t)).join('')}</td>
      <td>
        <button class="btn bsm" style="background:var(--gd);color:#000;padding:2px 7px;font-size:10px" onclick="relegateToJV(${p.id})" title="Send to JV">JV</button>
      </td>
    </tr>`).join('');
  const cnt8=jvPl.filter(p=>p.yr===8).length;
  const cntFr=jvPl.filter(p=>p.yr===9).length;
  const cntSo=jvPl.filter(p=>p.yr===10).length;
  const varsityCount=myP().length;
  const atCap=varsityCount>=MAX_VARSITY;
  return`
  <div class="pnl" style="margin-bottom:14px">
    <div class="ph">JV Team <span style="font-size:12px;color:var(--mu);font-weight:400">${jvPl.length} players</span>
      <div style="display:flex;gap:6px;align-items:center">
        <span style="background:#0a1a30;border:1px solid #336;color:#88ccff;border-radius:4px;padding:2px 8px;font-size:11px;font-weight:700">8th: ${cnt8}</span>
        <span class="rb rb-l">Fr: ${cntFr}</span>
        <span class="rb rb-m">So: ${cntSo}</span>
        ${standouts>0?`<span class="rb rb-h" title="Standout prospects">★ ${standouts} standout${standouts!==1?'s':''}</span>`:''}
        <span style="background:${atCap?'rgba(204,34,34,.18)':'rgba(34,184,112,.12)'};border:1px solid ${atCap?'var(--rd)':'var(--gn)'};color:${atCap?'var(--rd)':'var(--gn)'};border-radius:4px;padding:2px 8px;font-size:11px;font-weight:700" title="Varsity roster vs 85-player limit">Varsity: ${varsityCount}/${MAX_VARSITY}${atCap?' AT CAP':''}</span>
      </div>
    </div>
    <div class="pb" style="font-size:12px;color:var(--mu);margin-bottom:6px">
      All incoming freshmen start on JV. Juniors automatically move up to varsity. You can call up any JV player early or send eligible varsity players down to develop.
      ${atCap?`<span style="color:var(--rd);font-weight:700"> Roster full: calling up a player will displace the weakest ${String.fromCharCode(8226)} at that position.</span>`:''}
    </div>
    <div style="overflow-x:auto">
      <table>
        <thead><tr><th>#</th><th>Name</th><th>Pos</th><th>Yr</th><th>Rat</th><th>Dev</th><th>Traits</th><th>Action</th></tr></thead>
        <tbody>${jvTableRows||'<tr><td colspan="8" style="text-align:center;color:var(--mu);padding:16px">No JV players yet, new freshmen will arrive at end of season.</td></tr>'}</tbody>
      </table>
    </div>
  </div>
  <div class="pnl">
    <div class="ph">Varsity Players Eligible for JV Demotion
      <span style="font-size:11px;color:var(--mu);font-weight:400">(Fr/So on varsity)</span>
    </div>
    <div class="pb" style="font-size:12px;color:var(--mu);margin-bottom:6px">
      Sophomores and below currently on varsity. You can send them down to JV to develop with less pressure.
    </div>
    <div style="overflow-x:auto">
      <table>
        <thead><tr><th>#</th><th>Name</th><th>Pos</th><th>Yr</th><th>Rat</th><th>Dev</th><th>Traits</th><th>Action</th></tr></thead>
        <tbody>${varsityTableRows||'<tr><td colspan="8" style="text-align:center;color:var(--mu);padding:16px">No varsity players eligible for JV demotion.</td></tr>'}</tbody>
      </table>
    </div>
  </div>`;
}

// ══════════ RECLASSIFICATION PAGE ══════════
function pgRecls(){
  if(!G.reclsPressure&&G.reclsPressure!==0)G.reclsPressure=0;
  if(!G.reclsLog)G.reclsLog=[];
  if(!G.promotedYr)G.promotedYr=0;
  const pressure=G.reclsPressure||0;
  const clsIdx=myClsOrder().indexOf(G.cls);
  const canGoDown=clsIdx>0;
  const canGoUp=clsIdx<myClsOrder().length-1;
  const nextDown=canGoDown?myClsOrder()[clsIdx-1]:null;
  const nextUp=canGoUp?myClsOrder()[clsIdx+1]:null;
  const pressureColor=pressure>=75?'var(--rd)':pressure>=50?'var(--gd)':pressure>=25?'#f59e0b':'var(--gn)';
  const pressureLabel=pressure>=75?'CRITICAL':pressure>=50?'High':pressure>=25?'Moderate':'Low';
  const barPct=pressure.toFixed(0);
  // 3-year immunity status
  const yearsAtNewCls=G.promotedYr>0?G.yr-G.promotedYr:999;
  const immunityActive=G.promotedYr>0&&yearsAtNewCls<=3;
  const immunityYearsLeft=immunityActive?3-yearsAtNewCls+1:0;
  // Classification pressure delta explanations
  const rules=[
    {pct:'+50%',label:'Terrible season (<20% wins)','col':'var(--rd)'},
    {pct:'+38%',label:'Poor season (20–35% wins)','col':'var(--ac)'},
    {pct:'+28%',label:'Below-average (35–50% wins)','col':'var(--gd)'},
    {pct:'+18%',label:'Adequate season (50–60% wins)','col':'#f59e0b'},
    {pct:'+10%',label:'Decent season (60–70% wins)','col':'var(--mu)'},
    {pct:'0%',label:'Strong season (70–80% wins)','col':'var(--tx)'},
    {pct:'−10%',label:'Dominant season (80%+ wins)','col':'var(--gn)'},
    {pct:'−10% bonus',label:'Division Champion (stacks with record)','col':'var(--b2)'},
    {pct:'Reset to 0%',label:'State Championship','col':'#44ffaa'},
  ];
  const sosRules=[
    {pct:'−8% extra',label:'Dominant season + Elite SOS (70+)','col':'var(--gn)'},
    {pct:'−4% extra',label:'Dominant season + Solid SOS (55–69)','col':'var(--gn)'},
    {pct:'−6% extra',label:'Strong season + Elite SOS (70+)','col':'#44ffaa'},
    {pct:'−2% extra',label:'Strong season + Solid SOS (55–69)','col':'var(--tx)'},
    {pct:'−3% extra',label:'Decent season + Elite SOS (70+)','col':'var(--mu)'},
    {pct:'No effect',label:'Low SOS (<55), record alone counts','col':'var(--mu)'},
    {pct:'No effect',label:'Bad season: SOS never saves you','col':'var(--rd)'},
  ];
  const ruleRows=rules.map(r=>`
    <div class="dr">
      <span class="a">${r.label}</span>
      <span style="color:${r.col};font-weight:700">${r.pct}</span>
    </div>`).join('');
  const sosRuleRows=sosRules.map(r=>`
    <div class="dr">
      <span class="a">${r.label}</span>
      <span style="color:${r.col};font-weight:700">${r.pct}</span>
    </div>`).join('');
  const logRows=G.reclsLog.slice().reverse().map(e=>{
    const yr=2026+(e.yr-1);
    const col=e.delta>0?'var(--rd)':e.delta<0?'var(--gn)':'var(--mu)';
    const sign=e.delta>0?'+':'';
    const sosBit=e.sos!=null?`<span style="font-size:10px;color:var(--mu);margin-left:4px">SOS:${e.sos}</span>`:'';
    return`<div class="dr">
      <span class="a">${yr} (${e.wins}–${e.losses})${sosBit}</span>
      <span style="font-size:11px;color:var(--mu)">${e.reason}</span>
      <span style="color:${col};font-weight:700;margin-left:8px">${sign}${e.delta}% → <strong>${e.after}%</strong></span>
    </div>`;
  }).join('');
  // Move-up info
  const champAtCurrent=(G.hist||[]).filter(h=>(h.stateChamp||h.champ)&&h.cls===G.cls).length>0
    ||(G.trophies||[]).filter(t=>t.type==='State'&&(t.cls===G.cls||!t.cls)).length>0;
  const moveUpCost=CLS_MOVEUP_COST[clsEq(G.cls)]||0;
  const canAffordUp=G.unlimitedMoney||G.budget>=moveUpCost;
  return`
  ${immunityActive?`<div style="background:#0a2a12;border:2px solid var(--gn);border-radius:7px;padding:10px 14px;margin-bottom:14px;display:flex;align-items:center;gap:10px">
    <div>
      <div style="font-family:var(--hd);font-size:14px;font-weight:800;color:var(--gn);">Demotion Immunity Active</div>
      <div style="font-size:11px;color:var(--mu);margin-top:2px">You moved up to <strong style="color:var(--tx)">${clsL(G.cls)}</strong>: you cannot be relegated for <strong style="color:var(--gn)">${immunityYearsLeft} more season${immunityYearsLeft!==1?'s':''}</strong>. Use this time to build your program.</div>
    </div>
  </div>`:''}
  <div class="g2" style="margin-bottom:14px;align-items:start">
    <div>
      <div class="pnl" style="margin-bottom:14px">
        <div class="ph">Reclassification Status</div>
        <div class="pb">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
            <div style="flex:1">
              <div style="font-family:var(--hd);font-size:13px;font-weight:800;color:var(--mu);margin-bottom:4px">Current Classification</div>
              <div style="font-family:var(--hd);font-size:28px;font-weight:900;color:var(--te)">${clsL(G.cls)}</div>
            </div>
            ${canGoDown?`<div style="text-align:center">
              <div style="font-size:10px;color:var(--mu);margin-bottom:3px">If demoted</div>
              <div style="font-family:var(--hd);font-size:18px;font-weight:800;color:var(--rd)">${nextDown}</div>
            </div>`:'<div style="color:var(--mu);font-size:11px">Lowest class</div>'}
            ${canGoUp?`<div style="text-align:center">
              <div style="font-size:10px;color:var(--mu);margin-bottom:3px">Can move up to</div>
              <div style="font-family:var(--hd);font-size:18px;font-weight:800;color:var(--gn)">${nextUp}</div>
            </div>`:'<div style="color:var(--mu);font-size:11px">Top class</div>'}
          </div>
          <div style="margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
              <span style="font-family:var(--hd);font-size:13px;font-weight:800;">Demotion Pressure ${pressureLabel}</span>
              <span style="font-family:var(--hd);font-size:18px;font-weight:900;color:${pressureColor}">${barPct}%</span>
            </div>
            <div style="background:var(--s3);border-radius:6px;height:14px;overflow:hidden;border:1px solid var(--bd)">
              <div style="height:100%;width:${barPct}%;background:${pressureColor};border-radius:6px;transition:width .4s;${pressure>=100?'animation:pulse 1s infinite':''}"></div>
            </div>
            <div style="font-size:11px;color:var(--mu);margin-top:4px">${immunityActive?`<span style="color:var(--gn)">Immune from demotion for ${immunityYearsLeft} more season${immunityYearsLeft!==1?'s':''}, keep building!</span>`:pressure>=100?'<span style="color:var(--rd);font-weight:700">Pressure at 100%, demotion occurs at season end!</span>':pressure>=75?'<span style="color:var(--rd)">Danger zone: win games to reduce pressure.</span>':pressure>=50?'<span style="color:var(--gd)">Elevated pressure: a strong season will help.</span>':'Pressure is manageable.'}</div>
          </div>
          <div style="background:var(--s2);border:1px solid var(--bd);border-radius:5px;padding:8px 12px;font-size:12px;color:var(--mu)">
            ${canGoDown?(immunityActive?`<strong style="color:var(--gn)">Immunity:</strong> After moving up you cannot be demoted for 3 seasons. Then pressure applies normally.`:`<strong style="color:var(--tx)">Demotion:</strong> Pressure hits 100% → auto-demotion to <strong>${nextDown}</strong>. Bad seasons add pressure; wins reduce it.`):'<strong style="color:var(--tx)">Lowest classification</strong>: cannot be demoted further.'}
        </div>
      </div>

      <div class="pnl">
        <div class="ph">Move Up</div>
        <div class="pb">
          ${canGoUp?`<div style="font-size:12px;color:var(--mu);margin-bottom:10px">
            Voluntarily move up to <strong style="color:var(--gn)">${nextUp}</strong> classification.
            Requires one State Championship at ${clsL(G.cls)} and $${(moveUpCost/1000).toFixed(0)}k budget.
            <strong style="color:var(--gn)">Grants 3-year demotion immunity.</strong>
          </div>
          <div style="margin-bottom:10px">
            <div class="dr"><span class="a">State Champ at ${clsL(G.cls)}</span><span style="color:${champAtCurrent?'var(--gn)':'var(--rd)'};font-weight:700">${champAtCurrent?'✓ Earned':' Not yet'}</span></div>
            <div class="dr"><span class="a">Budget needed</span><span style="color:${canAffordUp?'var(--gn)':'var(--rd)'};font-weight:700">$${(moveUpCost/1000).toFixed(0)}k (have $${(G.budget/1000).toFixed(0)}k)</span></div>
          </div>
          ${pcAuto()?`<div style="font-size:12px;color:var(--mu)">The school moves up on its own once it qualifies.</div>`:`<button class="btn bgn" ${champAtCurrent&&canAffordUp?'':'disabled'} onclick="confirmMoveUp()" style="width:100%${champAtCurrent&&canAffordUp?'':';opacity:.45'}">Move Up to ${nextUp}</button>`}`
          :`<div style="font-size:12px;color:var(--mu)">Already in the highest classification (${myClsOrder().slice(-1)[0]}).</div>`}
        </div>
      </div>
    </div>

    <div>
      <div class="pnl" style="margin-bottom:14px">
        <div class="ph">Pressure Rules</div>
        <div class="pb">${ruleRows}
          <div style="margin-top:8px;padding:7px 10px;background:var(--s3);border-left:3px solid var(--ac);border-radius:0 4px 4px 0;font-size:11px;color:var(--mu)">Pressure accumulates over multiple bad seasons. A single turnaround season can significantly reduce it.</div>
        </div>
      </div>
      <div class="pnl" style="margin-bottom:14px">
        <div class="ph">SOS Modifier</div>
        <div class="pb">${sosRuleRows}
          <div style="margin-top:8px;padding:7px 10px;background:var(--s3);border-left:3px solid var(--gd);border-radius:0 4px 4px 0;font-size:11px;color:var(--mu)">Scheduling tough opponents only pays off if you <em>win</em>. A losing record ignores SOS entirely.</div>
        </div>
      </div>
      <div class="pnl">
        <div class="ph">Pressure History</div>
        <div class="pb">${logRows||'<div style="color:var(--mu);font-size:12px">No history yet: complete a season to see your first entry.</div>'}</div>
      </div>
    </div>
  </div>`;
}

// at least one state championship at the current classification
function moveUpChamp(){return G.hist.filter(h=>(h.stateChamp||h.champ)&&h.cls===G.cls).length>0||G.trophies.filter(t=>t.type==='State'&&(t.cls===G.cls||!t.cls)).length>0;}
function buildMoveUpPop(){
  // Called at end of season, offer move-up if eligible
  const ms=myS();
  const clsIdx=myClsOrder().indexOf(G.cls);
  if(clsIdx>=myClsOrder().length-1)return null; // already 5A
  const nextCls=myClsOrder()[clsIdx+1];
  const cost=CLS_MOVEUP_COST[clsEq(G.cls)]||0;
  // Requirement: at least one state championship at current classification
  const champAtCurrent=moveUpChamp();
  if(!champAtCurrent){
    // Show info pop, not yet eligible
    return `<div class="pc" style="border-top-color:var(--mu)">
      <h3 style="color:var(--mu)">Reclassification</h3>
      <div style="font-size:13px;line-height:1.7;margin-top:10px">
        <div style="margin-bottom:10px">You are currently in <strong style="color:var(--te)">${clsL(G.cls)}</strong>.</div>
        <div style="margin-bottom:10px">To move up to <strong>${nextCls}</strong> you need:</div>
        <div style="margin-bottom:6px"><strong>1 State Championship</strong> at ${clsL(G.cls)} <span style="color:var(--te)">not yet achieved</span></div>
        <div><strong>$${(cost/1000).toFixed(0)}k budget</strong> to reclassify</div>
      </div>
      <div style="margin-top:12px;font-size:11px;color:var(--mu)">Win a State title to unlock the move-up option.</div>
    </div>`;
  }
  const canAfford=G.unlimitedMoney||G.budget>=cost;
  const popId='moveup-pop-'+Date.now();
  return `<div class="pc" style="border-top-color:var(--gd)">
    <h3 style="color:var(--gd)">Move Up to ${nextCls}?</h3>
    <div style="font-size:13px;line-height:1.7;margin-top:10px">
      <div style="margin-bottom:10px">You've won a State Championship at <strong style="color:var(--gd)">${clsL(G.cls)}</strong>! You're eligible to move up.</div>
      <div style="margin-bottom:6px">▲ <strong>Next class:</strong> ${nextCls}</div>
      <div style="margin-bottom:6px"><strong>Cost:</strong> $${(cost/1000).toFixed(0)}k ${canAfford?'<span style="color:var(--gd)">✓</span>':'<span style="color:var(--te)">(insufficient funds)</span>'}</div>
      <div style="margin-bottom:12px;font-size:11px;color:var(--mu)">Moving up means tougher competition, larger rosters, and bigger recruiting classes.</div>
    </div>
    <div style="display:flex;gap:8px;margin-top:4px">
      <button class="btn" style="flex:1;font-size:13px" onclick="confirmMoveUp()" ${canAfford?'':'disabled'}>Move Up</button>
      <button class="bgh" style="flex:1;font-size:13px" onclick="declineMoveUp()">Stay in ${clsL(G.cls)}</button>
    </div>
  </div>`;
}

window.confirmMoveUp=function(){if(moveUpDo())nxp();};
function moveUpDo(){
  const clsIdx=myClsOrder().indexOf(G.cls);
  if(clsIdx>=myClsOrder().length-1)return false;
  const oldCls=G.cls;
  const nextCls=myClsOrder()[clsIdx+1];
  const cost=CLS_MOVEUP_COST[clsEq(G.cls)]||0;
  if(!hasFunds(cost)){notify('Not enough budget!','e');return false;}
  if(!G.unlimitedMoney)G.budget-=cost;

  // ── 1. Find player's school object and current division ──
  const ms=getS(G.myId);
  const myCurrentDiv=G.divisions.find(d=>d.teams.some(t=>t.id===G.myId));

  // ── 2. Remove player's team from their current division ──
  if(myCurrentDiv){
    myCurrentDiv.teams=myCurrentDiv.teams.filter(t=>t.id!==G.myId);
  }

  // ── 3. The old classification's divisions (minus the player's team) become an allLeague ──
  G.allLeagues[oldCls]={divisions:G.divisions,champId:null,champName:null};

  // ── 4. Grab new classification's divisions (already generated at game start) ──
  const newLeague=G.allLeagues[nextCls]||{divisions:makeDivsAny(nextCls),champId:null,champName:null};
  const newDivs=newLeague.divisions;

  // ── 5. Pick a random division in the new classification and insert player's team ──
  const targetDiv=newDivs[Math.floor(Math.random()*newDivs.length)];
  if(ms){ms.cls=nextCls;ms.dIdx=newDivs.indexOf(targetDiv);}
  if(myCurrentDiv&&myCurrentDiv.teams.length===0){
    // remove the now-empty old div from allLeagues record to keep things clean
  }
  targetDiv.teams.push(ms||{id:G.myId,cls:nextCls});

  // Stamp cls on the player's school
  if(ms)ms.cls=nextCls;

  // ── 6. The new classification's divisions become G.divisions (the "live" league) ──
  G.divisions=newDivs;
  delete G.allLeagues[nextCls]; // it's now the live league, not an other league

  // ── 7. Update top-level G state ──
  G.cls=nextCls;
  G.promotedYr=G.yr; // start 3-year demotion immunity
  G.reclsPressure=0; // fresh slate in new classification

  // Reset wins/losses so standings start fresh in the new division
  G.wins=0;G.losses=0;
  // Reset division win-loss records for the new league
  for(const div of G.divisions)for(const t of div.teams){t.wins=0;t.losses=0;}

  addLog(`<span style="color:var(--gd)">Reclassified UP to ${nextCls}! Joined the <strong>${targetDiv.name}</strong> division. You have 3 years of demotion immunity to adjust.</span>`);
  return true;
}

window.declineMoveUp=function(){
  nxp();
};

function seasonDevCheck(p){
  // Run at start of each season (seasStats still populated from prior season).
  // 1-5% chance to upgrade or downgrade dev trait based on performance + current dev.
  // 1-5 OVR shift to potential based on same signals.
  // Returns change object {devChanged,prevDev,newDev,devUp,potChanged,prevPot,newPot,potUp} or null.
  const ss=calcSS(p);
  const gp=p.seasStats?p.seasStats.gp||0:0;
  if(gp===0&&p.pos!=='OL'&&p.pos!=='K')return null; // must have played

  // Normalise stat score to 0-100 range for probability math
  const perfScore=clamp(ss,0,100);
  const devIdx=DEV.indexOf(p.dev); // 0=Normal,1=Impact,2=Star,3=Elite Dev

  // --- DEV TRAIT SHIFT ---
  // Upgrade: low base chance (1%) scaled up by great performance
  // Downgrade: low base chance (1%) scaled up by poor performance
  // Higher dev = harder to upgrade, easier to downgrade (regression toward mean)
  const upgradeBase=0.01;
  const downgradeBase=0.01;
  const perfFactor=perfScore/100; // 0-1
  // Upgrade chance: 1% base + up to 4% from performance, reduced by how elite you already are
  const upgradeChance=clamp(upgradeBase+(perfFactor*0.04)*(1-(devIdx/4)),0,0.05);
  // Downgrade chance: 1% base + up to 4% from poor performance (inverse), amplified for high dev
  const downgradeChance=clamp(downgradeBase+((1-perfFactor)*0.04)*(0.5+(devIdx/4)),0,0.05);

  const prevDev=p.dev;
  const roll=Math.random();
  if(roll<upgradeChance&&devIdx<3){
    p.dev=DEV[devIdx+1];
  } else if(roll<upgradeChance+downgradeChance&&devIdx>0){
    p.dev=DEV[devIdx-1];
  }
  const devChanged=p.dev!==prevDev;
  const devUp=devChanged&&DEV.indexOf(p.dev)>DEV.indexOf(prevDev);

  // --- POTENTIAL RANGE SHIFT ---
  // a good season can raise a player's ceiling (2-8% a season, more likely the better he played); a quiet one never lowers it,
  // so a backup who barely played keeps his potential. Training level decides how much of the range he reaches (effPot).
  const prevPotLo=p.potLo||p.pot;
  const prevPotHi=p.potHi||p.pot;
  const ownPc=typeof pcOwnPick==='function'&&pcOwnPick(p);
  // your own Player Career player: a solid season (a starter's numbers) raises his ceiling, a big one raises it more
  if(ownPc&&perfScore>=25){const up=clamp(Math.round((perfScore-25)/12)+1,1,4);p.potHi=Math.min(99,(p.potHi||p.pot)+up);p.potLo=Math.min(p.potHi,(p.potLo||p.pot)+Math.max(1,up-1));}
  if(!ownPc&&perfFactor>=0.5&&Math.random()<0.02+perfFactor*0.06){
    const mag=Math.max(1,Math.round((perfFactor-0.5)*10));
    p.potHi=clamp((p.potHi||p.pot)+mag,p.potHi||p.pot,99);
    if(perfFactor>0.8)p.potLo=clamp((p.potLo||p.pot)+Math.max(1,mag-2),p.potLo||p.pot,p.potHi);
    p.potLo=clamp(p.potLo||p.rat,p.rat,99);
    p.potHi=clamp(p.potHi||p.potLo,p.potLo,99);
  }
  // Sync effective pot from training level
  syncPot(p);
  const prevPot=Math.round(prevPotLo+(prevPotHi-prevPotLo)*trainFactor());
  const potChanged=p.pot!==prevPot||(p.potLo!==prevPotLo)||(p.potHi!==prevPotHi);
  const potUp=potChanged&&(p.potHi>prevPotHi||p.pot>prevPot);

  // Log notable dev changes for the player's team only
  if(p.sId===G.myId){
    if(devChanged){
      addLog(`<span style="color:${devUp?'var(--gd)':'var(--te)'}">${devUp?'▲':'▼'} ${p.fn} ${p.ln} dev ${devUp?'upgraded':'downgraded'}: ${prevDev} → ${p.dev}</span>`);
    }
  }

  // Return change summary for the caller (used by finalizeOffseason to build popups)
  if(devChanged||potChanged){
    return{devChanged,prevDev,newDev:p.dev,devUp,potChanged,prevPot,newPot:p.pot,prevPotLo,prevPotHi,newPotLo:p.potLo,newPotHi:p.potHi,potUp};
  }
  return null;
}
function updDev(p){
  syncPot(p); // ensure p.pot is synced to range+trainLevel
  const ss=calcSS(p),r=p.rat;const sch=getS(p.sId);
  const pf=sch?sch.prestige/5:.5,hf=sch?sch.wins/(sch.wins+sch.losses+1):.5;
  const env=pf*.5+hf*.2+Math.random()*.3;
  const hi=p.potHi||p.pot;
  if(hi>=94&&Math.random()<.5){p.dev='Elite Dev';return;}
  if(hi>=85&&Math.random()<.3&&p.dev==='Normal'){p.dev='Impact';}
  if((ss>80||r>80)&&Math.random()<.12+env*.05){const i=DEV.indexOf(p.dev);if(i>0)p.dev=DEV[i-1];}
  else if(ss<10&&r<50&&Math.random()<.08){const i=DEV.indexOf(p.dev);if(i<3)p.dev=DEV[i+1];}
}

function jucoFallback(p){if(p.rat>=48&&Math.random()<.3){const sc=jucoPick(p);if(sc){p.committed={lvl:'JUCO',school:sc};colTakeCommit(p,p.committed);}}}
function commitPlayer(p){
  if(p.committed||pcOwnPick(p))return; // Player Career: no signing day pick for your player
  if(!p.offers.length){jucoFallback(p);return;}
  const sorted=colOpenOffers(p).sort((a,b)=>colPr(b)-colPr(a));
  if(!sorted.length){jucoFallback(p);return;} // every program filled the spot
  const top=colPr(sorted[0]);p.committed=pick(sorted.filter(o=>colPr(o)>=top-3));colTakeCommit(p,p.committed);
}

