// ═══════════ SCHEDULE ═══════════
// ═══ RIVALRY SYSTEM ═══
// divOf is defined in HELPERS section above
function getRival(teamId,div){
  const teams=div.teams;const idx=teams.findIndex(t=>t.id===teamId);
  if(idx===-1)return null;const n=teams.length;
  const r1=(idx%2===0)?Math.min(idx+1,n-1):idx-1;
  return teams[r1]&&teams[r1].id!==teamId?teams[r1]:null;
}
function getRival2(teamId,div){
  const teams=div.teams;const idx=teams.findIndex(t=>t.id===teamId);
  if(idx===-1)return null;const n=teams.length;
  const r2idx=(idx+2)%n;const r2=teams[r2idx];
  return r2&&r2.id!==teamId?r2:null;
}
function isRivalry(myId,oppId){
  // Check player-chosen rivalries first
  if(G&&G.chosenRivals&&G.chosenRivals.includes(oppId))return true;
  const div=divOf(myId);if(!div)return false;
  const r1=getRival(myId,div);if(r1&&r1.id===oppId)return true;
  const cls=getS(myId)?.cls||'';
  if(cls==='4A'||cls==='5A'){const r2=getRival2(myId,div);if(r2&&r2.id===oppId)return true;}
  return false;
}

// ─── SCHEDULE BUILDER ────────────────────────────────────────────────────────
// genSched builds the fixed 5-game division slate (rivalry in week 5),
// marks G.customSchedPending = true, then openScheduleBuilder() is called
// to let the coach fill remaining slots from any classification.
function genSched(){
  const md=myDiv();
  const inDiv=md.teams.filter(s=>s.id!==G.myId);
  const maxG={1:8,2:9,3:10,4:11,5:12}[clsNum(G.cls)]||10;
  const DIV_GAMES=5; // always exactly 5 division games

  // Use the season-chosen rival if set, otherwise fall back to structural rival
  const seasonRivalId = G.seasonRivalId || null;
  const r1=getRival(G.myId,md);
  const rivalId = seasonRivalId || (r1?r1.id:null);

  // Pick 4 other division opponents (no duplicate, rivalry handled separately)
  let divOpps=inDiv.filter(s=>s.id!==rivalId).sort(()=>Math.random()-.5).slice(0,4);
  // If we have a rivalry, it fills slot 5; if not, pick a 5th division opp
  const divSlate=rivalId
    ?[...divOpps.slice(0,4), getS(rivalId)].filter(Boolean)
    :inDiv.sort(()=>Math.random()-.5).slice(0,5);

  // Weeks 1-4: division games; week 5: rivalry (or div game if no rival)
  G.sched=divSlate.map((opp,i)=>({
    wk:i+1, type:'regular', oppId:opp.id, result:null, my:0, opp:0,
    date:fmtDate(i), isRivalry: i===4&&rivalId?true:isRivalry(G.myId,opp.id),
    isDivision:true
  }));

  // Remaining custom slots (unfilled), weeks 6 to maxG
  const customCount=maxG-DIV_GAMES;
  for(let i=0;i<customCount;i++){
    G.sched.push({wk:DIV_GAMES+i+1,type:'regular',oppId:null,result:null,my:0,opp:0,
      date:fmtDate(DIV_GAMES+i),isRivalry:false,isDivision:false,custom:true,_empty:true});
  }

  // Playoff bye slots (as many rounds as the league's playoff field needs)
  G.poN=poRules().n;
  for(let r=0;r<poRoundsN(G.poN);r++){
    G.sched.push({wk:maxG+r+1,type:'bye',oppId:null,result:null,my:0,opp:0,
      date:fmtDate(maxG+r),playoffRound:r+1,label:`Playoff Round ${r+1}`});
  }

  G.week=0;G.wins=0;G.losses=0;G.playoff=null;
  for(const s of allSchoolsAll()){s.wins=0;s.losses=0;}

  G.customSchedPending=true;
}

// ─── SOS HELPER (projected, for builder UI) ───────────────────────────────
function calcProjectedSOS(){
  // Average OVR of all currently-scheduled opponents (including div games)
  const scheduled=G.sched.filter(g=>g.oppId&&!g._empty&&g.type!=='bye');
  if(!scheduled.length)return 0;
  const ovrs=scheduled.map(g=>teamOvr(g.oppId)).filter(v=>v>0);
  return ovrs.length?Math.round(ovrs.reduce((a,v)=>a+v,0)/ovrs.length):0;
}

function sosTierLabel(sos){
  if(sos>=80)return{label:'Elite',color:'var(--gd)',icon:''};
  if(sos>=70)return{label:'Tough',color:'var(--ac)',icon:''};
  if(sos>=60)return{label:'Average',color:'var(--tx)',icon:''};
  if(sos>=50)return{label:'Easy',color:'var(--mu)',icon:''};
  return{label:'Cupcake',color:'var(--rd)',icon:''};
}

// ─── SCHEDULE BUILDER UI ─────────────────────────────────────────────────────
let _sbCls=null; // active filter in the schedule builder
let _sbSearch='';
let _sbStep=0; // 0 = pick rivalry, 1 = pick custom games
let _sbTargetWk=null; // which week slot is currently selected for filling

function openScheduleBuilder(){
  if(pcAuto()||window._pcNewCareer){pcAutoSched();return;} // Player Career: the coaching staff builds it
  G.customSchedPending=false;
  _sbCls=G.cls; // default to own classification
  _sbSearch='';window._sbShow=60;
  _sbStep=0; // always start at rivalry pick step
  _sbTargetWk=null;
  renderScheduleBuilder();
}

// ─── STEP 0: Rivalry Picker ─────────────────────────────────────────────────
function renderRivalryPicker(){
  const md=myDiv();
  const inDiv=md.teams.filter(s=>s.id!==G.myId);
  const myOvr=Math.round((G.offR+G.defR)/2);
  const yr=2026+(G.yr-1);

  // current chosen rival
  const currentRival=G.seasonRivalId?getS(G.seasonRivalId):null;

  const divCards=inDiv.map(s=>{
    const ovr=teamOvr(s.id);
    const diff=ovr-myOvr;
    const diffStr=diff>0?`<span style="color:var(--rd);font-size:11px;font-weight:700">+${diff} OVR</span>`:
      diff<0?`<span style="color:var(--gn);font-size:11px;font-weight:700">${diff} OVR</span>`:
      `<span style="color:var(--mu);font-size:11px">EVEN</span>`;
    const isSel=G.seasonRivalId===s.id;
    const isOldRival=G.chosenRivals&&G.chosenRivals.includes(s.id);
    const histCount=(G.rivalHistory&&G.rivalHistory[s.id])||0;
    return`<div onclick="window._pickSeasonRival(${s.id})" style="background:${isSel?'rgba(245,192,48,.12)':'var(--s2)'};border:2px solid ${isSel?'var(--gd)':'var(--bd)'};border-radius:8px;padding:12px 14px;cursor:pointer;transition:all .12s;display:flex;align-items:center;gap:12px" onmouseover="if(!${isSel})this.style.borderColor='var(--ac)'" onmouseout="if(!${isSel})this.style.borderColor='var(--bd)'">
      ${sLogo(s,43)}
      <div style="flex:1;min-width:0">
        <div style="font-family:var(--hd);font-weight:800;font-size:14px">${s.name} ${s.mascot}</div>
        <div style="font-size:10px;color:var(--mu)">${s.city} · ${s.wins||0}-${s.losses||0} last season${histCount?` · <span style="color:var(--gd)">${histCount} rivalry game${histCount!==1?'s':''}</span>`:''}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
        ${rb(ovr)}
        ${diffStr}
        ${isOldRival?'<span style="font-size:9px;background:rgba(245,192,48,.2);color:var(--gd);border-radius:3px;padding:1px 5px;font-weight:700">Ongoing rival</span>':''}
      </div>
      ${isSel?'<span style="font-size:11px;font-weight:800;color:var(--gn)">Selected</span>':''}
    </div>`;
  }).join('');

  const canContinue=!!G.seasonRivalId;
  const rivalInfo=currentRival?`<div style="background:rgba(245,192,48,.1);border:1px solid var(--gd);border-radius:6px;padding:10px 14px;margin-bottom:14px;display:flex;align-items:center;gap:10px">
    ${sLogo(currentRival,38)}
    <div><div style="font-family:var(--hd);font-weight:800;font-size:14px;color:var(--gd)">${currentRival.name} ${currentRival.mascot}</div>
    <div style="font-size:11px;color:var(--mu)">Selected as your ${yr} Rivalry Game (Week 5)</div></div>
  </div>`:'';

  openMo(`<h2>${yr} Season, Pick Your Rivalry Game</h2>
  <div style="font-size:12px;color:var(--mu);margin-bottom:14px">
    Every season you choose <strong style="color:var(--gd)">one division opponent</strong> as your <strong style="color:var(--gd)">Rivalry Game</strong> (always Week 5). Rivalry games carry extra prestige, affect recruiting, and can shift the season narrative. Choose wisely: your rival resets each year.
  </div>
  ${rivalInfo}
  <div style="overflow-y:auto;max-height:45vh;margin-bottom:14px">
    <div style="display:flex;flex-direction:column;gap:8px">${divCards}</div>
  </div>
  <div style="display:flex;gap:10px;justify-content:flex-end;align-items:center;border-top:1px solid var(--bd);padding-top:12px;margin-top:4px">
    <button class="bgh" onclick="window._skipRivalryPick()" style="font-size:13px">Skip (auto-assign)</button>
    ${canContinue
      ? `<button class="btn bgd" onclick="window._confirmRivalryPick()" style="font-size:14px;padding:9px 22px">Continue → Build Schedule</button>`
      : `<button class="btn" onclick="notify('Pick a rival first, or use Skip to auto-assign.','w')" style="font-size:14px;padding:9px 22px;background:var(--s3);border:2px solid var(--gd);color:var(--gd)">Continue</button>`
    }
  </div>`);
}

window._pickSeasonRival=function(schId){
  G.seasonRivalId=G.seasonRivalId===schId?null:schId;
  renderRivalryPicker();
};

window._skipRivalryPick=function(){
  // Auto-pick the structural rival if no player choice
  const md=myDiv();const r1=getRival(G.myId,md);
  G.seasonRivalId=r1?r1.id:null;
  // Re-run genSched with the chosen rival then go to step 1
  genSched();
  _sbStep=1;
  _sbTargetWk=null;
  renderScheduleBuilder();
};

window._confirmRivalryPick=function(){
  if(!G.seasonRivalId){notify('Pick a rival first!','w');return;}
  // Update chosenRivals to include this season's pick
  G.chosenRivals=G.chosenRivals||[];
  if(!G.chosenRivals.includes(G.seasonRivalId))G.chosenRivals.push(G.seasonRivalId);
  // Track rivalry history
  G.rivalHistory=G.rivalHistory||{};
  G.rivalHistory[G.seasonRivalId]=(G.rivalHistory[G.seasonRivalId]||0)+1;
  // Rebuild schedule with new rival in slot 5
  genSched();
  _sbStep=1;
  _sbTargetWk=null;
  renderScheduleBuilder();
};

function renderScheduleBuilder(){
  // Route to rivalry picker first
  if(_sbStep===0){renderRivalryPicker();return;}

  // Count empty custom slots
  const emptySlots=G.sched.filter(g=>g.custom&&g._empty);
  const filled=G.sched.filter(g=>g.custom&&!g._empty&&g.oppId);
  const totalCustom=G.sched.filter(g=>g.custom).length;
  const clsList=['1A','2A','3A','4A','5A'].concat(XCLS_ORDER.filter(c=>G.allLeagues&&G.allLeagues[c])).concat(G.allLeagues&&G.allLeagues.INTL?['INTL']:[]).concat(G.allLeagues&&G.allLeagues.OOS?['OOS']:[]);

  // SOS projection
  const projSOS=calcProjectedSOS();
  const sosTier=sosTierLabel(projSOS);
  const myOvr2=Math.round((G.offR+G.defR)/2);
  // Estimate playoff seed impact: relative to an average SOS of 65
  const sosBoost=Math.round((projSOS-65)*4); // each OVR point above 65 = +4 seed pts
  const sosSeedStr=sosBoost>0?`<span style="color:var(--gd)">+${sosBoost} seed pts</span>`:sosBoost<0?`<span style="color:var(--rd)">${sosBoost} seed pts</span>`:`<span style="color:var(--mu)">avg seeding</span>`;

  // Candidates: all schools except already-scheduled opponents and own school
  const scheduled=new Set(G.sched.filter(g=>g.oppId).map(g=>g.oppId));
  scheduled.add(G.myId);

  // Fetch all teams across selected cls
  let candidates=[];
  if(!_sbCls||_sbCls==='ALL'){
    candidates=allSchoolsAll().filter(s=>!scheduled.has(s.id));
  } else if(_sbCls.startsWith('ST:')){
    const k=_sbCls.slice(3);candidates=allSchoolsAll().filter(s=>!scheduled.has(s.id)&&stOf(s)===k);
  } else {
    const own=allSchools().filter(s=>s.cls===_sbCls||(!s.cls&&_sbCls===G.cls));
    const other=G.allLeagues&&G.allLeagues[_sbCls]?G.allLeagues[_sbCls].divisions.flatMap(d=>d.teams):[];
    candidates=[...own,...other].filter(s=>!scheduled.has(s.id));
  }

  {const f=clsFmt(G.cls);candidates=candidates.filter(x=>clsFmt(x.cls||G.cls)===f);} // six/eight-man teams only play their own format
  // Search filter
  if(_sbSearch){
    const q=_sbSearch.toLowerCase();
    candidates=candidates.filter(s=>(s.name+' '+s.mascot+' '+s.city).toLowerCase().includes(q));
  }

  // Sort by OVR desc
  const _ov=new Map();for(const s of candidates)_ov.set(s.id,teamOvr(s.id));
  candidates=candidates.sort((a,b)=>_ov.get(b.id)-_ov.get(a.id));
  // draw a page at a time: thousands of logo cards at once ran phones out of memory (the page reloaded)
  const _sbN=window._sbShow||60,_shown=candidates.slice(0,_sbN);

  const divGames=G.sched.filter(g=>g.isDivision&&g.oppId);

  const schedPreview=G.sched.filter(g=>g.type==='regular'||g._empty).map(g=>{
    if(g.isDivision){
      const s=getS(g.oppId);
      return`<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--bd)">
        <span style="font-family:var(--hd);font-weight:800;font-size:12px;color:var(--mu);min-width:22px">Wk${g.wk}</span>
        ${s?sLogo(s,32):''}
        <span style="font-size:12px;flex:1">${s?s.name+' '+s.mascot:'?'}</span>
        ${g.isRivalry?'<span style="font-size:10px;font-weight:800;color:var(--gd)">RIVALRY</span>':'<span style="font-size:10px;color:var(--te);font-weight:700">DIV</span>'}
        ${s?`<span style="font-size:11px">${rb(teamOvr(s.id))}</span>`:''}
      </div>`;
    }
    if(g._empty){
      const isSel=_sbTargetWk===g.wk;
      return`<div onclick="_sbSelectSlot(${g.wk})" style="display:flex;align-items:center;gap:8px;padding:5px 6px;border-bottom:1px solid var(--bd);border-radius:4px;cursor:pointer;background:${isSel?'rgba(47,111,237,.18)':'transparent'};border:${isSel?'1px solid var(--ac)':'1px solid transparent'};margin:1px 0;transition:all .12s" onmouseover="if(${!isSel})this.style.background='rgba(47,111,237,.07)'" onmouseout="if(${!isSel})this.style.background='transparent'">
        <span style="font-family:var(--hd);font-weight:800;font-size:12px;color:var(--mu);min-width:22px">Wk${g.wk}</span>
        <span style="font-size:12px;color:${isSel?'var(--te)':'var(--bd)'};flex:1;font-style:italic;font-weight:${isSel?700:400}">${isSel?'← pick a team':'open slot –'}</span>
        <span style="font-size:10px;color:${isSel?'var(--te)':'var(--te)'};font-weight:700">${isSel?'Selecting':'Custom'}</span>
      </div>`;
    }
    const s=getS(g.oppId);
    const cls=s?s.cls||G.cls:'?';
    return`<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--bd)">
      <span style="font-family:var(--hd);font-weight:800;font-size:12px;color:var(--mu);min-width:22px">Wk${g.wk}</span>
      ${s?sLogo(s,32):''}
      <span style="font-size:12px;flex:1">${s?s.name+' '+s.mascot:'?'}</span>
      <span style="font-size:10px;font-weight:700;color:var(--te)">${clsL(cls)}</span>
      ${s?`<span style="font-size:11px">${rb(teamOvr(s.id))}</span>`:''}
      <button onclick="removeCustomGame(${g.wk})" style="background:none;border:none;color:var(--rd);cursor:pointer;font-size:12px;padding:0 2px" title="Remove">✕</button>
    </div>`;
  }).join('');

  const canFinish=emptySlots.length===0;

  const builderHtml=`
  <div style="display:flex;gap:16px;height:72vh;min-height:400px">
    <!-- LEFT: current schedule -->
    <div style="width:260px;flex-shrink:0;display:flex;flex-direction:column;gap:8px">
      <div style="font-family:var(--hd);font-size:13px;font-weight:800;color:var(--te)">Your Schedule</div>
      <div style="font-size:11px;color:var(--mu)">${filled.length}/${totalCustom} custom slots filled · ${emptySlots.length} remaining</div>
      ${emptySlots.length>0?`<div style="font-size:10px;color:var(--te);font-weight:700;background:rgba(47,111,237,.1);border-radius:3px;padding:3px 7px"> Click a week slot, then pick a team →</div><button class="bgh" onclick="sbAutoFill()" style="width:100%;font-size:13px;padding:7px">Auto-fill open slots</button>`:''}
      <div style="flex:1;overflow-y:auto;background:var(--s2);border:1px solid var(--bd);border-radius:6px;padding:8px 10px">${schedPreview}</div>
      <button class="btn bgn" ${canFinish?'onclick="finalizeSchedule()"':'disabled style="opacity:.45"'} style="width:100%;font-size:14px;padding:9px">
        ${canFinish?'Lock In Schedule →':'Fill all '+emptySlots.length+' open slots'}
      </button>
      ${canFinish?'':'<div style="font-size:11px;color:var(--mu);text-align:center">Fill all open slots to continue</div>'}
    </div>
    <!-- RIGHT: team picker -->
    <div style="flex:1;display:flex;flex-direction:column;gap:8px;overflow:hidden">
      <div style="font-family:var(--hd);font-size:13px;font-weight:800;color:var(--te)">Pick Opponents</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
        <select onchange="_sbSetCls(this.value)" style="background:var(--s2);color:var(--tx);border:1px solid var(--bd);border-radius:4px;padding:3px 6px;font-family:var(--hd);font-weight:700;font-size:12px">${[...ST_ORDER,...(G.allLeagues&&G.allLeagues.INTL?['INTL']:[])].map(k=>{const v=k==='INTL'?'INTL':'ST:'+k,on=_sbSt()===k;return`<option value="${v}"${on?' selected':''}>${k==='INTL'?'International':stName(k)}</option>`;}).join('')}</select>
        ${clsList.filter(c=>_sbSt()!=='INTL'&&clsSt(c)===_sbSt()).map(c=>`<button title="${clsName(c)}" onclick="_sbSetCls('${c}')" style="background:${_sbCls===c?'var(--ac)':'var(--s2)'};border:1px solid ${_sbCls===c?'var(--ac)':'var(--bd)'};color:${_sbCls===c?'var(--tOn,#fff)':'var(--tx)'};padding:3px 10px;border-radius:4px;cursor:pointer;font-family:var(--hd);font-weight:700;font-size:12px">${clsL(c)}${c===G.cls?' ★':''}</button>`).join('')}
        <button onclick="_sbSetCls('ALL')" style="background:${!_sbCls||_sbCls==='ALL'?'var(--ac)':'var(--s2)'};border:1px solid ${!_sbCls||_sbCls==='ALL'?'var(--ac)':'var(--bd)'};color:${!_sbCls||_sbCls==='ALL'?'var(--tOn,#fff)':'var(--tx)'};padding:3px 10px;border-radius:4px;cursor:pointer;font-family:var(--hd);font-weight:700;font-size:12px">ALL</button>
      </div>
      <div>
        <input id="sb-search" placeholder="Search team or mascot…" value="${_sbSearch}" oninput="const _v=this.value;clearTimeout(window._sbQT);window._sbQT=setTimeout(()=>{_sbSearch=_v;window._sbShow=60;renderScheduleBuilder();const _e=document.getElementById('sb-search');if(_e){_e.focus();try{_e.setSelectionRange(_e.value.length,_e.value.length);}catch(x){}}},250)" style="background:var(--s2);border:1px solid var(--bd);color:var(--tx);padding:6px 10px;border-radius:4px;font-size:12px;width:100%;outline:none">
      </div>
      <div style="flex:1;overflow-y:auto">
        ${emptySlots.length===0?`<div style="padding:24px;text-align:center;color:var(--gn);font-weight:700">All slots filled! Lock in your schedule above.</div>`:''}
        ${candidates.length===0&&emptySlots.length>0?`<div style="padding:24px;text-align:center;color:var(--mu)">No available teams match your filter.</div>`:''}
        ${candidates.length>0?`<div style="font-size:10px;color:var(--mu);padding:2px 2px 6px">${candidates.length} team${candidates.length!==1?'s':''} available</div>`:''}
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px;padding:2px">
          ${_shown.map(s=>{
            const ovr=_ov.get(s.id);
            const cls=s.cls||G.cls;
            const isHigher=clsNum(cls)>clsNum(G.cls)&&cls!=='INTL';
            const isLower=clsNum(cls)<clsNum(G.cls)&&cls!=='INTL';
            const diffLabel=isHigher?`<span style="font-size:9px;color:var(--rd);font-weight:800">▲ ${clsL(cls)}</span>`:isLower?`<span style="font-size:9px;color:var(--gn);font-weight:800">▼ ${clsL(cls)}</span>`:`<span style="font-size:9px;color:var(--te);font-weight:800">${clsL(cls)}</span>`;
            const myOvr=Math.round((G.offR+G.defR)/2);
            const diff=ovr-myOvr;
            const diffStr=diff>0?`<span style="color:var(--rd);font-size:10px">+${diff}</span>`:diff<0?`<span style="color:var(--gn);font-size:10px">${diff}</span>`:`<span style="color:var(--mu);font-size:10px">EVEN</span>`;
            // SOS seeding impact badge
            const sosImpact=Math.round((ovr-65)*0.4); // scaled impact per game
            const sosBadge=ovr>=75?`<span style="font-size:9px;background:rgba(245,192,48,.15);color:var(--gd);border-radius:3px;padding:1px 5px;font-weight:700">+SOS</span>`:ovr>=65?`<span style="font-size:9px;color:var(--mu)">avg SOS</span>`:`<span style="font-size:9px;color:var(--mu)">−SOS</span>`;
            const divOfTeam=divOf(s.id);
            return`<div style="background:var(--s2);border:1px solid var(--bd);border-radius:6px;padding:9px 11px;cursor:pointer;transition:border-color .12s" onmouseover="this.style.borderColor='var(--ac)'" onmouseout="this.style.borderColor='var(--bd)'" onclick="addCustomGame(${s.id})">
              <div style="display:flex;align-items:center;gap:7px;margin-bottom:4px">
                ${sLogo(s,32)}
                <div style="flex:1;min-width:0">
                  <div style="font-weight:700;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.name} ${s.mascot}</div>
                  <div style="font-size:10px;color:var(--mu)">${s.city}${XCLS[cls]?' · '+clsName(cls):''}</div>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:6px;justify-content:space-between">
                ${rb(ovr)} ${diffStr} ${diffLabel}
                <span style="font-size:9px;color:var(--mu)">${s.wins||0}-${s.losses||0}</span>
              </div>
              <div style="margin-top:4px">${sosBadge}</div>
            </div>`;
          }).join('')}
        </div>
        ${candidates.length>_shown.length?`<div style="text-align:center;padding:10px"><button class="bgh" onclick="window._sbShow=(window._sbShow||60)+60;renderScheduleBuilder()">Show more (${candidates.length-_shown.length} more)</button></div>`:''}
      </div>
    </div>
  </div>`;

  const rivalSch=G.seasonRivalId?getS(G.seasonRivalId):null;
  const yr2=2026+(G.yr-1);
  openMo(`<h2>Build Your ${yr2} Schedule</h2>
  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;align-items:stretch">
    <div style="background:var(--s2);border:1px solid var(--bd);border-radius:6px;padding:9px 14px;flex:1;min-width:140px">
      <div style="font-size:10px;color:var(--mu);letter-spacing:1px;font-weight:700;margin-bottom:4px">Division Games (Locked)</div>
      <div style="font-family:var(--hd);font-size:20px;font-weight:900;color:var(--te)">5 Games</div>
      <div style="font-size:11px;color:var(--mu)">Weeks 1–5 · Rival in Wk 5</div>
    </div>
    ${rivalSch?`<div style="background:rgba(245,192,48,.08);border:1px solid var(--gd);border-radius:6px;padding:9px 14px;flex:1;min-width:140px;display:flex;align-items:center;gap:10px">
      ${sLogo(rivalSch,38)}
      <div>
        <div style="font-size:10px;color:var(--gd);letter-spacing:1px;font-weight:700;margin-bottom:2px">Rivalry (Wk 5)</div>
        <div style="font-family:var(--hd);font-size:14px;font-weight:800">${rivalSch.name} ${rivalSch.mascot}</div>
        <div style="font-size:10px;color:var(--mu)">${rb(teamOvr(rivalSch.id))}</div>
      </div>
    </div>`:''}
    <div style="background:var(--s2);border:1px solid var(--bd);border-radius:6px;padding:9px 14px;flex:1;min-width:140px">
      <div style="font-size:10px;color:var(--mu);letter-spacing:1px;font-weight:700;margin-bottom:4px">Custom Slots</div>
      <div style="font-family:var(--hd);font-size:20px;font-weight:900;color:var(--te)">${filled.length}/${totalCustom} Filled</div>
      <div style="font-size:11px;color:var(--mu)">${emptySlots.length} remaining · any class</div>
    </div>
    <div style="background:var(--s2);border:1px solid var(--bd);border-radius:6px;padding:9px 14px;flex:1;min-width:140px">
      <div style="font-size:10px;color:var(--mu);letter-spacing:1px;font-weight:700;margin-bottom:4px">Strength of Schedule</div>
      <div style="font-family:var(--hd);font-size:18px;font-weight:900;color:${sosTier.color}">${sosTier.icon} ${sosTier.label} (${projSOS||'?'} OVR)</div>
      <div style="font-size:11px;color:var(--mu)">Playoff seeding: ${sosSeedStr}</div>
    </div>
  </div>
  <div style="font-size:11px;color:var(--mu);margin-bottom:10px;background:var(--s3);border-radius:4px;padding:6px 10px;border-left:3px solid var(--gd)">
    <strong style="color:var(--gd)">SOS matters in playoffs.</strong> Scheduling tougher opponents, especially from higher classifications, directly boosts your playoff seeding score. Two teams with the same record are separated by SOS.
  </div>
  ${builderHtml}`);
}

window._sbSetCls=function(cls){_sbCls=cls==='ALL'?null:cls;window._sbShow=60;renderScheduleBuilder();};
function _sbSt(){const v=_sbCls||G.cls;return v==='INTL'?'INTL':v.startsWith('ST:')?v.slice(3):clsSt(v);}

window._sbSelectSlot=function(wk){
  _sbTargetWk=(_sbTargetWk===wk)?null:wk; // toggle off if clicking selected
  renderScheduleBuilder();
};

window.addCustomGame=function(schId){
  // Use targeted week if set, otherwise first empty slot
  let emptySlot=null;
  if(_sbTargetWk!==null){
    emptySlot=G.sched.find(g=>g.custom&&g._empty&&g.wk===_sbTargetWk);
  }
  if(!emptySlot){
    emptySlot=G.sched.find(g=>g.custom&&g._empty);
  }
  if(!emptySlot){notify('No open slots left!','w');return;}
  const s=getS(schId);if(!s)return;
  emptySlot.oppId=schId;
  emptySlot._empty=false;
  emptySlot.isRivalry=G.chosenRivals&&G.chosenRivals.includes(schId);
  emptySlot.date=fmtDate(emptySlot.wk-1);
  // Auto-advance to next empty slot so user can keep clicking teams
  const nextEmpty=G.sched.find(g=>g.custom&&g._empty);
  _sbTargetWk=nextEmpty?nextEmpty.wk:null;
  renderScheduleBuilder();
};

// v2.14: fill every open slot in one tap with fair opponents from your own classification (closest in strength first)
window.sbAutoFill=function(){
  if(!G.sched.some(g=>g.custom&&g._empty))return;sbFill();
  _sbTargetWk=null;renderScheduleBuilder();
};
function sbFill(){
  const empty=G.sched.filter(g=>g.custom&&g._empty);if(!empty.length)return;
  const myO=Math.round((G.offR+G.defR)/2),taken=new Set(G.sched.filter(g=>g.oppId).map(g=>g.oppId));taken.add(G.myId);
  const _f=clsFmt(G.cls);let pool=allSchools().filter(x=>!taken.has(x.id)&&(x.cls||G.cls)===G.cls);
  if(pool.length<empty.length)pool=pool.concat(allSchoolsAll().filter(x=>!taken.has(x.id)&&(x.cls||G.cls)!==G.cls&&clsFmt(x.cls)===_f));
  pool=pool.map(x=>({x,d:Math.abs(teamOvr(x.id)-myO)+Math.random()*6})).sort((a,b)=>a.d-b.d);
  for(const g of empty){const c=pool.shift();if(!c)break;g.oppId=c.x.id;g._empty=false;g.isRivalry=!!(G.chosenRivals&&G.chosenRivals.includes(c.x.id));g.date=fmtDate(g.wk-1);}
}
window.removeCustomGame=function(wk){
  const slot=G.sched.find(g=>g.wk===wk&&g.custom);
  if(!slot)return;
  slot.oppId=null;slot._empty=true;slot.isRivalry=false;
  _sbTargetWk=wk; // auto-select the now-empty slot
  renderScheduleBuilder();
};

window.finalizeSchedule=function(){
  schedLock();
  clo();
  nav('dash');
  notify('Schedule locked in! Season begins.');
};
function schedLock(){
  // Auto-fill any remaining empty slots with random in-classification teams (shouldn't happen)
  const scheduled=new Set(G.sched.filter(g=>g.oppId).map(g=>g.oppId));
  scheduled.add(G.myId);
  for(const g of G.sched.filter(g=>g.custom&&g._empty)){
    const pool=allSchools().filter(s=>!scheduled.has(s.id));
    if(pool.length){const s=pick(pool);g.oppId=s.id;g._empty=false;scheduled.add(s.id);}
  }
  // Renumber weeks cleanly
  const regGames=G.sched.filter(g=>g.type==='regular'||g._empty===false||g.isDivision);
  regGames.forEach((g,i)=>{g.wk=i+1;g.date=fmtDate(i);});
  const playoffSlots=G.sched.filter(g=>g.type==='bye');
  const regLen=regGames.length;
  playoffSlots.forEach((g,i)=>{g.wk=regLen+i+1;g.date=fmtDate(regLen+i);});
}
// ─────────────────────────────────────────────────────────────────────────────

function regSched(){return G.sched.filter(g=>g.type==='regular'&&!g._empty);}
function allRegDone(){return regSched().length>0&&regSched().every(g=>g.result);}

