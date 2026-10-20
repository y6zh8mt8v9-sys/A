// ══════════ JV TEAM HELPERS ══════════
// Generate initial JV pool at game start only, NOT called during the season on page views.
function initJVRoster(){
  if(!G.jvRoster)G.jvRoster=[];
  if(G.week>0||G.phase!=='offseason')return;
  const jvPl=G.players.filter(p=>p.sId===G.myId&&p.onJV);
  if(jvPl.length>=15)return;
  const needed=clamp(30-jvPl.length,0,30);
  for(let i=0;i<needed;i++){
    const p=genJVPlayer(G.myId);
    G.players.push(p);
    G.jvRoster.push(p.id);
  }
}

// JV players at a Tierra Alta school carry the same border-country names
function _jvStyle(p,sId){try{xStylePlayer(p,getS(sId));}catch(e){}return p;}
function genJVPlayer(sId){return _jvStyle(bodyNew(_genJVPlayer0(sId),getS(sId)),sId);}
function _genJVPlayer0(sId){
  const pos=pick(Object.keys(POS_CNT_BASE));
  // Wide OVR bands per class, JV should have real spread from raw to elite prospect
  const CLS_BAND={'5A':[28,72],'4A':[24,68],'3A':[20,64],'2A':[16,60],'1A':[12,56]};
  const [cMin,cMax]=CLS_BAND[clsEq(G.cls)]||[18,62];

  // ~12% chance to be a standout prospect (top 30% of band)
  // ~18% chance to be clearly above average (top 50%)
  // ~40% typical mid-range, ~30% raw/low
  const roll=Math.random();
  let base;
  const cRange=cMax-cMin;
  if(roll<0.12){
    // Standout, top 30% of band with tighter high end
    base=rng(Math.round(cMin+cRange*0.68),cMax);
  } else if(roll<0.30){
    // Above average, upper-mid band
    base=rng(Math.round(cMin+cRange*0.48),Math.round(cMin+cRange*0.70));
  } else if(roll<0.70){
    // Typical, middle of band
    base=rng(Math.round(cMin+cRange*0.22),Math.round(cMin+cRange*0.52));
  } else {
    // Raw / developmental, bottom of band
    base=rng(cMin,Math.round(cMin+cRange*0.28));
  }

  // Pot spread also varies: standouts get larger ceilings
  const potSpread=roll<0.12?rng(18,30):roll<0.30?rng(14,24):rng(8,20);
  const potLo=clamp(base+rng(4,14),base,99);
  const potHi=clamp(potLo+potSpread,potLo,99);
  const id=_pId++;
  const ms=myS();
  const arch=pickArchetype(pos,(ms&&ms.offS)||'Pro Style',(ms&&ms.defS)||'4-3');
  const tCnt=rng(1,3);const traits=[];const tp=[...TRAITS];
  for(let i=0;i<tCnt;i++){if(!tp.length)break;const idx=rng(0,tp.length-1);traits.push(tp.splice(idx,1)[0].k);}
  const gpa=clamp(parseFloat((rng(16,40)/10).toFixed(1)),1.5,4.0);
  const hb={QB:70,RB:68,WR:69,TE:72,OL:72,DL:71,LB:70,CB:68,S:69,K:68};
  const wb={QB:175,RB:165,WR:160,TE:205,OL:240,DL:220,LB:195,CB:158,S:170,K:158};
  // Dev trait: standouts get boosted odds; raw players stay Normal
  let dev='Normal';
  const devRoll=Math.random();
  if(roll<0.12){
    if(potHi>=85&&devRoll<0.30)dev='Star';
    else if(potHi>=72&&devRoll<0.55)dev='Impact';
    else dev='Impact';
  } else if(roll<0.30){
    if(devRoll<0.18)dev='Impact';
  } else {
    if(devRoll<0.06)dev='Impact';
  }
  return{id,sId,pos,yr:8,fn:pick(FN),ln:pick(LN),rat:base,pot:potLo,potLo,potHi,
    dev,traits,gpa,mood:'neutral',morale:rng(50,88),
    spd:rng(32,72),str:rng(28,68),awr:rng(26,64),stats:emS(),seasStats:emS(),carStats:emS(),
    stars:0,offers:[],committed:null,inj:0,ht:clamp((hb[pos]||70)+rng(-4,4),60,78),
    wt:clamp((wb[pos]||180)+rng(-18,18),138,315),num:posN(pos,sId),sp:0,camp:false,
    wl:false,hof:false,fs:id,depth:{},interests:genInterests(),arch,streak:null,
    streakUsed:false,streakGamesLeft:0,perfHistory:[],onJV:true};
}

function jvPlayers(){
  if(!G||!G.jvRoster)return[];
  return G.jvRoster.map(id=>getP(id)).filter(Boolean);
}

// Eligibility: only yr 8,9,10 can be on JV
function canBeOnJV(p){return p.yr<=10&&p.sId===G.myId;}

window.callUpToVarsity=function(pid){
  const p=G.players.find(x=>x.id===pid);
  if(!p){notify('Player not found','e');return;}
  if(!canBeOnJV(p)){notify('Only 8th grade, freshmen, and sophomores can move between rosters.','e');return;}
  const idx=G.jvRoster.indexOf(pid);
  if(idx===-1){notify('Player not on JV','e');return;}

  const varsity=myP(); // excludes JV
  if(varsity.length>=MAX_VARSITY){
    // Find the weakest player at the same position on varsity
    const samePos=varsity.filter(v=>v.pos===p.pos).sort((a,b)=>a.rat-b.rat);
    const bump=samePos.length?samePos[0]:null;
    if(bump&&bump.rat<p.rat){
      // Bump the weaker player, send to JV if eligible, cut if not
      if(canBeOnJV(bump)){
        bump.onJV=true;
        G.jvRoster.push(bump.id);
        addLog(`<span style="color:var(--gd)"> ${bump.fn} ${bump.ln} sent to JV to make room for ${p.fn} ${p.ln}.</span>`);
        addNews('general',` Roster Move: ${p.fn} ${p.ln} Up, ${bump.fn} ${bump.ln} Down`,`${p.pos} depth shuffled, roster at ${MAX_VARSITY}.`);
      } else {
        G.players=G.players.filter(x=>x.id!==bump.id);
        if(G.benched)for(const pos of Object.keys(G.benched))G.benched[pos]=G.benched[pos].filter(id=>id!==bump.id);
        addLog(`<span style="color:var(--rd)"> ${bump.fn} ${bump.ln} cut to make room, roster full (${MAX_VARSITY}).`);
        addNews('general',` ${bump.fn} ${bump.ln} released`,`Roster at cap (${MAX_VARSITY}). ${p.fn} ${p.ln} (${p.pos}) called up from JV.`);
      }
    } else {
      notify(`Roster full (${MAX_VARSITY} players). No weaker ${p.pos} to displace.`,'e');
      return;
    }
  }
  // Move from JV to varsity
  G.jvRoster.splice(idx,1);
  p.onJV=false;
  if(!p._talked&&myDepthRank(p)>1&&Math.random()<0.5){p.morale=clamp((p.morale||65)-8,0,100);addLog(`<span style="color:var(--gd)">${p.fn} ${p.ln} is not sure he is ready to sit on the varsity bench. (Talk to JV players first to keep them happy.)</span>`);}
  p._talked=0;
  addLog(`<span style="color:var(--gn)"> ${p.fn} ${p.ln} called up from JV to Varsity!</span>`);
  notify(`${p.fn} ${p.ln} called up to Varsity!`);
  nav('jv');
};

window.relegateToJV=function(pid){
  const p=G.players.find(x=>x.id===pid);
  if(!p){notify('Player not found','e');return;}
  if(!canBeOnJV(p)){notify('Only sophomores and below can be sent to JV.','e');return;}
  if(p.yr>10){notify('Only sophomores (Yr 10) and below can play JV.','e');return;}
  if(G.jvRoster.includes(pid)){notify('Player already on JV','e');return;}
  // Move from varsity to JV
  p.onJV=true;
  G.jvRoster.push(pid);
  addLog(`<span style="color:var(--gd)"> ${p.fn} ${p.ln} sent down to JV.</span>`);
  notify(`${p.fn} ${p.ln} sent to JV.`);
  nav('jv');
};

// ── CUT PLAYER ──
window.confirmCutPlayer=function(pid){
  const p=G.players.find(x=>x.id===pid);if(!p)return;
  openMo(`<h2 style="color:var(--rd)"> Cut Player</h2>
  <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
    ${face(p.fs,52)}
    <div>
      <div style="font-family:var(--hd);font-size:18px;font-weight:900">${p.fn} ${p.ln}</div>
      <div style="font-size:12px;color:var(--mu);margin-top:3px">${p.pos} • ${yrL(p.yr)} • ${rb(p.rat)}</div>
      <div style="font-size:12px;color:var(--mu);margin-top:2px">${devB(p.dev)} ${stars(p.stars)}</div>
    </div>
  </div>
  <div style="background:rgba(204,34,34,.1);border:1px solid rgba(204,34,34,.4);border-radius:6px;padding:10px 14px;margin-bottom:16px;font-size:13px;color:var(--tx)">
     Cutting this player <strong>permanently removes them from your roster</strong>. This cannot be undone. They will not graduate or count toward your program history.
  </div>
  <div style="display:flex;gap:8px">
    <button class="btn" style="flex:1;background:var(--rd)" onclick="cutPlayer(${pid})"> Confirm Cut</button>
    <button class="bgh" style="flex:1" onclick="clo()">Cancel</button>
  </div>`);
};

window.cutPlayer=function(pid){
  const p=G.players.find(x=>x.id===pid);if(!p){clo();notify('Player not found','e');return;}
  const name=`${p.fn} ${p.ln}`;
  // Remove from all tracking structures
  G.players=G.players.filter(x=>x.id!==pid);
  if(G.jvRoster)G.jvRoster=G.jvRoster.filter(id=>id!==pid);
  // Remove from benched lists
  if(G.benched){for(const pos of Object.keys(G.benched))G.benched[pos]=G.benched[pos].filter(id=>id!==pid);}
  // Remove from watchlist archive if present
  if(G.wlArchive)G.wlArchive=G.wlArchive.filter(x=>x.id!==pid);
  addLog(`<span style="color:var(--rd)"> ${name} has been cut from the roster.</span>`);
  updateRats();
  clo();
  notify(`${name} cut from roster.`,'w');
  nav('roster',G.myId);
};

// Called each offseason: promote aged-out JV players; replenish with new 8th graders.
// Player yr++ already happened in the main offseason loop, do NOT increment again here.
// ── Auto JV call-up: if varsity lacks healthy players at a position, promote the best JV player(s) there ──
function autoJVCallup(silent){
  if(typeof G==='undefined'||!G||!G.myId||!Array.isArray(G.players))return 0;
  if(!G.jvRoster)G.jvRoster=[];
  const cnt=getStarterCnt(G.myId),moved=[];
  for(const pos in cnt){
    const need=cnt[pos]||0;if(!need)continue;
    let short=need-myP().filter(p=>p.pos===pos&&!(p.inj>0)).length;
    if(short<=0)continue;
    const pool=G.players.filter(p=>p.sId===G.myId&&p.onJV&&p.pos===pos&&!(p.inj>0)).sort((a,b)=>(b.yr>=9)-(a.yr>=9)||b.rat-a.rat);
    for(const p of pool){
      if(short<=0)break;
      if(myP().length>=MAX_VARSITY)break;
      p.onJV=false;G.jvRoster=G.jvRoster.filter(id=>id!==p.id);moved.push(p);short--;
    }
  }
  if(moved.length){
    for(const p of moved)addLog(`<span style="color:var(--gn)">${p.fn} ${p.ln} (${p.pos}) automatically called up from JV to fill a varsity opening.</span>`);
    addNews('general',`JV call-up: ${moved.map(p=>p.fn+' '+p.ln).join(', ')}`,`Varsity was short at ${[...new Set(moved.map(p=>p.pos))].join(', ')}.`);
    if(typeof updateRats==='function')updateRats();
    if(!silent)notify(`${moved.length} JV player${moved.length>1?'s':''} called up to fill varsity openings.`);
  }
  return moved.length;
}

function promoteJVAgeUp(){
  if(!G.jvRoster)G.jvRoster=[];
  const toPromote=[];
  for(const pid of G.jvRoster){
    const p=G.players.find(x=>x.id===pid);
    if(!p)continue;
    if(p.yr>=11){p.onJV=false;toPromote.push(p);}
  }
  // Clean JV list of promoted / over-age players first
  G.jvRoster=G.jvRoster.filter(pid=>{
    const p=G.players.find(x=>x.id===pid);
    return p&&p.yr<=10&&p.onJV;
  });

  for(const p of toPromote){
    const varsity=myP();
    if(varsity.length<MAX_VARSITY){
      // Room on roster, promote cleanly
      addLog(`<span style="color:var(--gn)"> ${p.fn} ${p.ln} (${p.pos}) promoted from JV, now a ${p.yr===11?'Junior':'Senior'} on Varsity!</span>`);
    } else {
      // Roster full, find weakest same-pos player on varsity
      const samePos=varsity.filter(v=>v.pos===p.pos).sort((a,b)=>a.rat-b.rat);
      const bump=samePos.length?samePos[0]:null;
      if(bump&&bump.rat<p.rat){
        if(canBeOnJV(bump)){
          bump.onJV=true;
          G.jvRoster.push(bump.id);
          addLog(`<span style="color:var(--gd)"> ${bump.fn} ${bump.ln} moved to JV, displaced by promoted ${p.fn} ${p.ln} (roster at ${MAX_VARSITY}).</span>`);
        } else {
          G.players=G.players.filter(x=>x.id!==bump.id);
          if(G.benched)for(const pos of Object.keys(G.benched))G.benched[pos]=G.benched[pos].filter(id=>id!==bump.id);
          addLog(`<span style="color:var(--rd)"> ${bump.fn} ${bump.ln} released, roster full, ${p.fn} ${p.ln} promoted from JV.</span>`);
        }
        addLog(`<span style="color:var(--gn)"> ${p.fn} ${p.ln} (${p.pos}) promoted from JV, now a ${p.yr===11?'Junior':'Senior'} on Varsity!</span>`);
      } else {
        // No weaker player to displace, JV player gets cut instead
        G.players=G.players.filter(x=>x.id!==p.id);
        addLog(`<span style="color:var(--rd)"> ${p.fn} ${p.ln} (${p.pos}) cut, roster full at ${MAX_VARSITY} and no weaker ${p.pos} to replace.</span>`);
      }
    }
  }

  // Replenish JV with new 8th graders (always uncapped, JV is separate from varsity limit)
  const jvCount=G.jvRoster.length;
  const needed=clamp(rng(22,30)-jvCount,0,20);
  for(let i=0;i<needed;i++){
    const p=genJVPlayer(G.myId);
    G.players.push(p);
    G.jvRoster.push(p.id);
  }
}

