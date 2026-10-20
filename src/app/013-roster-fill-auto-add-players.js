// ═══════════ ROSTER FILL (auto-add players when team drops below 28) ═══════════
function checkAndFillRosters(){
  if(!G||!G.divisions)return;
  const MIN_ROSTER=28;
  const FILL_COUNT=5;
  const allSchs=allSchoolsAll();
  for(const sch of allSchs){
    if(sch.lite)continue;
    const roster=sPlayers(sch.id);
    if(roster.length<MIN_ROSTER){
      const needed=FILL_COUNT;
      for(let i=0;i<needed;i++){
        // Pick a random underclassman year: 9 (Fr) or 10 (So)
        const yr=Math.random()<0.5?9:10;
        const pos=pick(POS)||'WR';
        // Build player manually to force Normal dev and class-appropriate low OVR
        const id=_pId++;
        // Use the bottom 35% of this classification's band for fill players
        const CLS_FILL_BAND={'5A':[48,62],'4A':[40,55],'3A':[32,48],'2A':[24,40],'1A':[18,34]};
        const [fMin,fMax]=CLS_FILL_BAND[clsEq(sch.cls||G.cls)]||[32,48];
        const rat=rng(fMin,fMax);
        const CLS_POT_CAP={'5A':88,'4A':82,'3A':75,'2A':68,'1A':62};
        const potCap=(CLS_POT_CAP[clsEq(sch.cls||G.cls)]||75);
        const potLo=clamp(rat+rng(3,10),rat,potCap);
        const potHi=clamp(potLo+rng(8,18),potLo,potCap);
        const pot=potLo;
        const hb={QB:74,RB:70,WR:72,TE:76,OL:76,DL:75,LB:73,CB:70,S:71,K:71};
        const wb={QB:215,RB:210,WR:188,TE:245,OL:285,DL:268,LB:235,CB:182,S:198,K:182};
        const tCnt=rng(1,2);const traits=[];const tp=[...TRAITS];
        for(let t=0;t<tCnt;t++){if(!tp.length)break;const idx=rng(0,tp.length-1);traits.push(tp.splice(idx,1)[0].k);}
        const isAc=traits.includes('academic');
        const gpa=clamp(parseFloat((rng(15,35)/10+(isAc?rng(2,6)/10:0)).toFixed(1)),1.5,4.0);
        const schOffS=sch.offS||'Pro Style',schDefS=sch.defS||'4-3';
        const arch=pickArchetype(pos,schOffS,schDefS);
        const p={id,sId:sch.id,pos,yr,fn:pick(FN),ln:pick(LN),rat,pot,potLo,potHi,
          dev:'Normal',traits,gpa,
          mood:pick(['good','neutral','neutral','neutral','low']),
          morale:rng(45,70),spd:rng(35,65),str:rng(35,65),awr:rng(30,60),
          stats:emS(),seasStats:emS(),carStats:emS(),
          stars:0,offers:[],committed:null,inj:0,
          ht:clamp((hb[pos]||72)+rng(-3,3),62,82),
          wt:clamp((wb[pos]||210)+rng(-18,18),155,355),
          num:posN(pos,sch.id),sp:0,camp:false,wl:false,hof:false,fs:id,
          depth:{},interests:genInterests(),arch,
          streak:null,streakUsed:false,streakGamesLeft:0,perfHistory:[]};
        bodyNew(p,sch);G.players.push(p);
      }
      if(sch.id===G.myId){
        addLog(`<span style="color:var(--te)"> Roster below 28, added ${FILL_COUNT} Normal dev freshmen/sophomores to your roster.</span>`);
      }
    }
  }
}


// ═══════════ INJURY SYSTEM ═══════════
// Named injuries by position group, with [minWeeks, maxWeeks] and career-ending eligibility
const INJURY_TABLE = {
  // Skill positions, speed/contact
  skill: [
    {name:'Hamstring Strain',    wk:[1,2], career:false},
    {name:'Quad Contusion',      wk:[1,2], career:false},
    {name:'High Ankle Sprain',   wk:[2,4], career:false},
    {name:'Knee Sprain (MCL)',   wk:[2,5], career:false},
    {name:'Knee Sprain (LCL)',   wk:[2,4], career:false},
    {name:'Groin Pull',          wk:[1,3], career:false},
    {name:'Pulled Hamstring',    wk:[2,3], career:false},
    {name:'Calf Strain',         wk:[1,2], career:false},
    {name:'ACL Tear',            wk:[99,99],career:true },  // season-ender, possible career
    {name:'Meniscus Tear',       wk:[6,99], career:true },
    {name:'Turf Toe',            wk:[1,3], career:false},
    {name:'Shin Splints',        wk:[1,2], career:false},
  ],
  // Linemen, power/collision
  line: [
    {name:'Shoulder Sprain',     wk:[1,3], career:false},
    {name:'Shoulder Separation', wk:[2,5], career:false},
    {name:'Rotator Cuff Strain', wk:[2,4], career:false},
    {name:'Dislocated Shoulder', wk:[4,99], career:true },
    {name:'Hand Fracture',       wk:[2,4], career:false},
    {name:'Wrist Sprain',        wk:[1,3], career:false},
    {name:'Finger Dislocation',  wk:[1,2], career:false},
    {name:'Knee Sprain (MCL)',   wk:[2,5], career:false},
    {name:'ACL Tear',            wk:[99,99],career:true },
    {name:'Torn Pectoral',       wk:[99,99],career:true },
    {name:'Back Sprain',         wk:[1,3], career:false},
    {name:'Hip Pointer',         wk:[1,2], career:false},
  ],
  // All positions
  general: [
    {name:'Concussion',          wk:[1,3], career:false},
    {name:'Rib Contusion',       wk:[1,2], career:false},
    {name:'Ankle Sprain',        wk:[1,3], career:false},
    {name:'Stinger (Neck)',      wk:[1,2], career:false},
    {name:'Hip Flexor Strain',   wk:[1,2], career:false},
    {name:'Knee Contusion',      wk:[1,2], career:false},
    {name:'Stress Fracture',     wk:[3,6], career:false},
    {name:'Broken Collarbone',   wk:[4,99], career:true },
    {name:'Broken Leg',          wk:[99,99],career:true },
  ],
};

// Pick a random injury for a player, respecting context
// Returns {name, weeks, isSeason, isCareer}
function rollInjury(p, isPlayoff){
  const linePos=['OL','DL'];
  const pool=linePos.includes(p.pos)
    ?[...INJURY_TABLE.line,...INJURY_TABLE.general]
    :[...INJURY_TABLE.skill,...INJURY_TABLE.general];

  // Career-ending base chance: 0.3% per injury event, slightly higher for injury-prone
  const careerChance=(p.traits&&p.traits.includes('injury-prone'))?0.008:0.003;
  // Season-ending base chance: ~8% per injury event
  const seasonChance=(p.traits&&p.traits.includes('injury-prone'))?0.14:0.08;

  const carRoll=Math.random();
  let entry;
  if(carRoll<careerChance){
    // Career-ender, must pick from career:true pool
    const careerPool=pool.filter(x=>x.career);
    entry=careerPool.length?pick(careerPool):pool[pool.length-1];
  } else if(carRoll<careerChance+seasonChance){
    // Season-ender, prefer high-week entries
    const severePool=pool.filter(x=>x.wk[1]>=6);
    entry=severePool.length?pick(severePool):pick(pool);
  } else {
    // Normal, prefer low-week entries
    const normalPool=pool.filter(x=>x.wk[1]<=5&&!x.career);
    entry=normalPool.length?pick(normalPool):pick(pool);
  }

  const isCareer=entry.career&&carRoll<careerChance;
  // Season-ending: weeks = remainder of season (use 99 as sentinel)
  const isSeason=!isCareer&&entry.wk[1]>=99;
  let weeks;
  if(isCareer||isSeason){weeks=99;}
  else{weeks=rng(entry.wk[0],entry.wk[1]);}

  return{name:entry.name, weeks, isSeason, isCareer};
}

// ── Injury display helpers (avoids nested template literal issues in sandboxed iframes) ──
function injBadgeTable(p){
  if(!p.inj||p.inj<=0)return '<span style="color:var(--gn)">OK</span>';
  const col=p.injCareer?'#ff0066':p.injSeason?'var(--rd)':'var(--ac)';
  const nm=p.injName||'Injured';
  let suffix='';
  if(p.injCareer)suffix=' <span style="font-size:9px;font-weight:800;background:rgba(255,0,102,.2);border:1px solid #ff0066;border-radius:3px;padding:0 3px">CAREER</span>';
  else if(p.injSeason)suffix=' <span style="font-size:9px;font-weight:800;background:rgba(204,34,34,.2);border:1px solid var(--rd);border-radius:3px;padding:0 3px">SEASON</span>';
  else suffix=' <span style="font-size:10px;color:var(--mu)">('+p.inj+'w)</span>';
  return '<span style="color:'+col+'"> '+nm+suffix+'</span>';
}
function injBadgeDepth(p){
  if(!p.inj||p.inj<=0)return '';
  const col=p.injCareer?'#ff0066':p.injSeason?'var(--rd)':'var(--ac)';
  const lbl=p.injCareer?'CAREER':p.injSeason?'SEASON':p.inj+'w';
  const nm=p.injName||'Injured';
  return '<span style="color:'+col+';font-size:10px" title="'+nm+'"> '+lbl+'</span>';
}
function injBadgePopup(p){
  if(!p.inj||p.inj<=0)return '';
  const col=p.injCareer?'#ff0066':p.injSeason?'var(--rd)':'var(--ac)';
  const nm=p.injName||'Injured';
  let detail='';
  if(p.injCareer)detail='<strong style="color:#ff0066">CAREER-ENDING</strong>';
  else if(p.injSeason)detail='<strong style="color:var(--rd)">Season-Ending</strong>';
  else detail='Out '+p.inj+' week'+(p.inj!==1?'s':'');
  return '<span style="color:'+col+';font-size:11px"> '+nm+detail+'</span>';
}

function triggerCareerEndingInjury(p){
  p.injCareer=true;
  p.inj=99;
  const qualifiesHof=p.rat>=72||(p.sg!=null?p.sg:p.stars)>=3||(p.carStats&&(p.carStats.rushYds>2000||p.carStats.recYds>1500||p.carStats.passTD>40||p.carStats.tackles>150));
  const hofBlock=qualifiesHof?`
    <div style="background:rgba(245,192,48,.10);border:1px solid var(--gd);border-radius:6px;padding:12px 14px;margin:14px 0;text-align:center">
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:800;color:var(--gd);margin-bottom:4px"> Hall of Fame Worthy</div>
      <div style="font-size:12px;color:var(--tx);margin-bottom:10px">${p.fn} ${p.ln} had a career deserving recognition. Enshrine them in the Hall of Fame?</div>
      <div style="display:flex;gap:10px;justify-content:center">
        <button class="btn bgd" style="font-size:13px;padding:7px 18px" onclick="careerInjHof(${p.id},true)"> Yes, Enshrine</button>
        <button class="bgh" style="font-size:13px;padding:7px 18px" onclick="careerInjHof(${p.id},false)">Not This Time</button>
      </div>
    </div>`:
    `<div style="text-align:center;margin-top:14px">
      <button class="bgh" style="font-size:13px;padding:7px 18px" onclick="careerInjHof(${p.id},false)">Close</button>
    </div>`;

  const popup=`<div class="pc" style="border-top-color:var(--rd);text-align:left">
    <h3 style="color:var(--rd);text-align:center"> Career-Ending Injury</h3>
    <div style="margin:12px auto;text-align:center">${face(p.fs,60)}</div>
    <div style="text-align:center;margin-bottom:12px">
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:900">${p.fn} ${p.ln}</div>
      <div style="font-size:12px;color:var(--mu);margin-top:3px">${p.pos} · ${yrL(p.yr)} · ${rb(p.rat)} · ${stars(p.stars)}</div>
    </div>
    <div style="background:rgba(204,34,34,.12);border:1px solid rgba(204,34,34,.4);border-radius:6px;padding:12px 14px;margin-bottom:10px">
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:800;color:var(--rd);margin-bottom:4px"> ${p.injName||'Severe Injury'}</div>
      <div style="font-size:13px;color:var(--tx)">This injury ends <strong>${p.fn} ${p.ln}</strong>'s football career. They will be removed from the roster immediately.</div>
    </div>
    ${hofBlock}
  </div>`;

  // Queue the popup, it must be shown next
  _popQ.unshift(popup);
  _popI=0;
  document.getElementById('pun').style.display='none'; // hide Continue, buttons inside handle dismissal
  showPop();
}

window.careerInjHof=function(pid,enshrine){
  const p=G.players.find(x=>x.id===pid);
  if(p){
    if(enshrine){
      p.hof=true;
      if(!G.hofArchive)G.hofArchive=[];
      if(!G.hofArchive.find(x=>x.id===p.id)){G.hofArchive.push({...p});try{aiRegister(p);}catch(err){console.error(err);}}
      addLog(`<span style="color:var(--gd)"> ${p.fn} ${p.ln} enshrined in the Hall of Fame following a career-ending injury.</span>`);
    }
    // Remove from roster and JV
    G.players=G.players.filter(x=>x.id!==pid);
    if(G.jvRoster)G.jvRoster=G.jvRoster.filter(id=>id!==pid);
    if(G.benched){for(const pos of Object.keys(G.benched))G.benched[pos]=G.benched[pos].filter(id=>id!==pid);}
    updateRats();
  }
  // Restore Continue button and close popup
  document.getElementById('pun').style.display='';
  document.getElementById('pu').classList.remove('open');
  if(_popCb){const cb=_popCb;_popCb=null;cb();}
  else nav('dash');
};

