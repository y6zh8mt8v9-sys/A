// ═══════════ INIT ═══════════
function initGame(coach,divs,dIdx,sIdx,chosenRivals){
  const ms=divs[dIdx].teams[sIdx];ms.isP=true;ms.staff=genStaff(true);ms.tier='bad';
  const baseYr=2026;
  G={proV:1,coach,cls:ms.cls,myId:ms.id,divisions:divs,players:[],yr:1,baseYear:baseYr,week:0,phase:'offseason',osPhase:0,wins:0,losses:0,prestige:1,budget:50000,offR:0,defR:0,tFocus:'balanced',offS:ms.offS,defS:ms.defS,sched:[],log:[],hist:[],wl:[],hof:[],wlArchive:[],hofArchive:[],fac:ms.fac,staff:ms.staff,trainLevel:ms.trainLevel||1,schoolRecs:{game:{},season:{},career:{}},trophies:[],playoff:null,benched:{},_page:'dash',allLeagues:{},
    // Store player-chosen rivalries as a set of opponent team IDs
    chosenRivals:chosenRivals||[],
    seasonRivalId:null, // reset each season, player picks their rival at schedule builder
    // JV ROSTER: array of player IDs currently on JV team (8th grade, freshmen, sophs)
    jvRoster:[],
    // RECLASSIFICATION PRESSURE: 0-100%, accumulates after bad seasons; hitting 100 forces demotion
    reclsPressure:0,
    // History of reclassification pressure changes
    reclsLog:[],
    // Year the player last moved UP a classification (for 3-year demotion immunity)
    promotedYr:0,
    // Cheat flags (toggled via Settings)
    unlimitedMoney:false};
  initRecs();
  for(const div of G.divisions)for(const s of div.teams)genTeamPlayers(s);
  distributeStars();

  // ── Build other-classification leagues ──
  // Use _allClsDivs if available (team builder was used), otherwise generate fresh
  for(const cls of ['1A','2A','3A','4A','5A']){
    if(cls===G.cls)continue;
    const otherDivs=(_allClsDivs&&_allClsDivs[cls])?_allClsDivs[cls]:makeDivisions(cls);
    // Stamp cls on each team
    for(const div of otherDivs)for(const t of div.teams){t.cls=t.cls||cls;}
    G.allLeagues[cls]={divisions:otherDivs,champId:null,champName:null};
    // Generate players for every team in other leagues (lightweight, AI only)
    for(const div of otherDivs)for(const s of div.teams){
      if(!G.players.find(p=>p.sId===s.id))genTeamPlayers(s);
    }
  }
  // Also stamp cls on player's own division teams
  for(const div of G.divisions)for(const t of div.teams)t.cls=t.cls||G.cls;
  try{ensureStates(true);}catch(e){console.error('states',e);}
  G._thr=null;for(const p of G.players)if(!p.grad)starsInit(p);try{starCap5();}catch(e){}
  for(const p of G.players)if(!p.grad&&p.yr>=11&&p.sg>=1){p.offers=p.offers||[];for(let k=0;k<1+p.sg;k++)genOffers(p,true,null);}

  // Player's team should always be low-to-mid of their classification.
  // Clamp all their players to the bottom 50% of the class OVR band.
  (function(){
    const mean=XCLS[G.cls]?XCLS[G.cls].mean:({'5A':64,'4A':60,'3A':56,'2A':52,'1A':48}[G.cls]||56);
    const cMin=mean-26,cMax=Math.min(95,mean+30);
    const myRatCap=mean+4; // a rebuilding program: nobody far above the class average yet
    const myRatFloor=cMin;
    for(const p of G.players.filter(p=>p.sId===G.myId)){
      p.rat=clamp(p.rat,myRatFloor,myRatCap);
      // Clamp pot range, then sync effective pot
      if(!p.potLo||!p.potHi){p.potLo=Math.max(p.rat,p.pot-5);p.potHi=Math.min(99,p.pot+8);}
      p.potLo=clamp(p.potLo,p.rat,cMax);
      p.potHi=clamp(p.potHi,p.potLo,cMax);
      p.pot=clamp(p.pot,p.rat,cMax);
    }
  })();

  // ── Auto-assign player's freshmen (yr 9) to JV at game start ──
  // Any fr/soph on the player's own team starts on JV; juniors/seniors stay varsity
  for(const p of G.players.filter(p=>p.sId===G.myId&&p.yr<=9)){
    p.onJV=true;
    if(!G.jvRoster.includes(p.id))G.jvRoster.push(p.id);
  }
  // Supplement with generated 8th graders
  initJVRoster();

  buildSeasonDates(baseYr);
  genSched();updateRats();
  // Open schedule builder immediately after game init
  openScheduleBuilder();
}

function initRecs(){
  const keys=['passYds','passTD','rushYds','rushTD','recYds','recTD','tackles','sacks','ints'];
  G.schoolRecs={game:{},season:{},career:{}};
  for(const t of['game','season','career'])for(const k of keys)G.schoolRecs[t][k]={val:0,pid:null,name:'',yr:0,pos:'',date:''};
}

// ═══════════ HELPERS ═══════════
function allSchools(){return G.divisions.flatMap(d=>d.teams);}
// All schools across every classification (own + other leagues)
function allSchoolsAll(){
  const own=allSchools();
  if(!G.allLeagues)return own;
  const others=Object.values(G.allLeagues).flatMap(lg=>lg.divisions.flatMap(d=>d.teams));
  return [...own,...others];
}
// All divisions for a given cls (or own cls if null)
function divisionsForCls(cls){
  if(!cls||cls===G.cls)return G.divisions;
  if(G.allLeagues&&G.allLeagues[cls])return G.allLeagues[cls].divisions;
  return [];
}
// v2.00 indexes: rebuilt when G.players is replaced or shrinks, extended when players are appended; _spVer is bumped
// wherever a player changes school (transfers, save migration), so the per-school lists never go stale
let _pIx=null,_spVer=0,_sIx=null;
function _pIndex(){
  const A=G.players;
  if(_pIx&&_pIx.a===A&&_pIx.v===_spVer&&_pIx.n===A.length)return _pIx;
  if(_pIx&&_pIx.a===A&&_pIx.v===_spVer&&A.length>_pIx.n){for(let i=_pIx.n;i<A.length;i++)_pIxAdd(_pIx,A[i]);_pIx.n=A.length;return _pIx;}
  const ix={a:A,v:_spVer,n:A.length,byId:new Map(),byS:new Map()};for(const q of A)_pIxAdd(ix,q);return(_pIx=ix);
}
function _pIxAdd(ix,q){if(!q)return;if(!ix.byId.has(q.id))ix.byId.set(q.id,q);let l=ix.byS.get(q.sId);if(!l)ix.byS.set(q.sId,l=[]);l.push(q);}
function _sIndex(){
  const D=G.divisions||[],L=G.allLeagues||{},refs=[];for(const d of D)refs.push(d.teams);for(const c in L)for(const d of(L[c].divisions||[]))refs.push(d.teams);
  let n=0;for(const t of refs)n+=t.length;
  if(_sIx&&_sIx.G===G&&_sIx.n===n&&_sIx.refs.length===refs.length&&_sIx.refs.every((t,i)=>t===refs[i])){_sIx.t=performance.now();return _sIx;}
  const m=new Map();for(const t of refs)for(const s of t)if(s&&!m.has(s.id))m.set(s.id,s);return(_sIx={G,n,refs,m,t:performance.now()});
}
// v2.07: with 1,600+ schools the full validity check is too slow to run on every lookup; a fresh index is trusted for a moment,
// and a miss always re-checks (so schools created a moment ago are found)
function myS(){return allSchools().find(s=>s.id===G.myId);}
function myP(){return sPlayers(G.myId).filter(p=>!p.onJV);}
function sPlayers(id){const l=_pIndex().byS.get(id);return l?l.slice():[];}
function getS(id){if(_sIx&&_sIx.G===G&&performance.now()-_sIx.t<250){const s=_sIx.m.get(id);if(s!==undefined)return s;}return _sIndex().m.get(id);}
function getP(id){return _pIndex().byId.get(id);}
function myDiv(){return G.divisions.find(d=>d.teams.some(t=>t.id===G.myId));}
function divOf(sid){
  const own=G.divisions.find(d=>d.teams.some(t=>t.id===sid));
  if(own)return own;
  if(G.allLeagues){for(const lg of Object.values(G.allLeagues)){const d=lg.divisions.find(d=>d.teams.some(t=>t.id===sid));if(d)return d;}}
  return null;
}

function getStarterCnt(schId){
  const sch=getS(schId)||{offS:'Pro Style',defS:'4-3'};
  const oS=SCHEME_STARTERS[sch.offS]||SCHEME_STARTERS['Pro Style'];
  const dS=DEF_SCHEME_STARTERS[sch.defS]||DEF_SCHEME_STARTERS['4-3'];
  return{QB:1,RB:oS.RB!==undefined?oS.RB:1,WR:oS.WR||2,TE:oS.TE||1,OL:5,K:1,...dS};
}

function getStarters(sid){
  const benchedForTeam=(sid===G.myId&&G.benched)?G.benched:{};
  const pl=sPlayers(sid).filter(p=>p.inj===0);
  const byPos={};for(const p of pl){if(!byPos[p.pos])byPos[p.pos]=[];byPos[p.pos].push(p);}
  const cnt=getStarterCnt(sid);
  const st=[];
  for(const pos in cnt){
    if(!byPos[pos]||cnt[pos]===0)continue;
    // Exclude benched players for the user's team
    const eligible=byPos[pos].filter(p=>!(benchedForTeam[pos]||[]).includes(p.id));
    eligible.sort((a,b)=>{
      const ao=a.depth&&a.depth[pos]!==undefined?a.depth[pos]:999;
      const bo=b.depth&&b.depth[pos]!==undefined?b.depth[pos]:999;
      if(ao!==bo)return ao-bo;return b.rat-a.rat;
    });
    st.push(...eligible.slice(0,cnt[pos]));
  }
  return st;
}

// two-way players: a second position on the other side of the ball makes him a candidate there too,
// a little behind the specialists unless the depth chart puts him ahead
function posPool(pl,pos){return pl.filter(p=>p.pos===pos||(p.pos2===pos&&typeof pcTwo==='function'&&pcTwo(p)));}
function depthOrder(L,pos){const k=p=>p.depth&&p.depth[pos]!==undefined?p.depth[pos]:999,r=p=>p.rat-(p.pos===pos?0:4);return L.sort((a,b)=>k(a)-k(b)||r(b)-r(a));}

function teamOvr(sid){{const s=getS(sid);if(s&&s.lite)return s.str||50;}const st=getStarters(sid);if(!st.length)return 50;return Math.round(st.reduce((a,p)=>a+p.rat,0)/st.length);}

function updateRats(){
  const st=getStarters(G.myId);
  const off=st.filter(p=>['QB','RB','WR','TE','OL'].includes(p.pos));
  const def=st.filter(p=>['DL','LB','CB','S'].includes(p.pos));
  G.offR=off.length?Math.round(off.reduce((a,p)=>a+p.rat,0)/off.length):50;
  G.defR=def.length?Math.round(def.reduce((a,p)=>a+p.rat,0)/def.length):50;
  checkAndFillRosters();
}
function addLog(msg){G.log.unshift(msg);if(G.log.length>150)G.log.pop();}

