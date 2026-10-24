// ═══════════ MODAL ═══════════
function openMo(html){document.getElementById('mc2').innerHTML=html;document.getElementById('mo').classList.add('open');}
function clo(){const m=document.getElementById('mo');m.classList.remove('open');m.classList.remove('ontop');}
function clov(e){if(e.target===document.getElementById('mo'))clo();}

// ═══════════ TOPBAR ═══════════
function updateTb(){
  const ms=myS();const curYr=2026+(G.yr-1);
  document.getElementById('tbl').innerHTML=sLogo(ms,32);
  document.getElementById('tbn').textContent=`${ms.name} ${ms.mascot}`;
  document.getElementById('tbr').innerHTML=recStr(G.wins,G.losses);
  document.getElementById('tbyr').textContent=curYr;
  const phTxt=G.phase==='offseason'?`Off ${['','',''][G.osPhase]||''}`:G.phase==='playoffs'?'Playoffs':G.phase==='postseason'?'Post-Season':G.phase.charAt(0).toUpperCase()+G.phase.slice(1);
  document.getElementById('tbph').textContent=phTxt;
  document.getElementById('tbwk').textContent=G.week||'–';
  document.getElementById('tbof').textContent=G.offR;document.getElementById('tbdf').textContent=G.defR;
  document.getElementById('tbpr').textContent='★'.repeat(Math.round(G.prestige));
  document.getElementById('tbbd').textContent=G.unlimitedMoney?'∞':`$${(G.budget/1000).toFixed(0)}k`;
  updateSbCard();
}

// ═══════════ NOTIFY ═══════════
let _nT;function notify(msg,type=''){const el=document.getElementById('nf');el.textContent=msg;el.className='show'+(type==='w'?' nfw':type==='e'?' nfe':'');clearTimeout(_nT);_nT=setTimeout(()=>el.classList.remove('show'),3200);}

// ═══════════ SAVE/LOAD ═══════════
// ── Chunked localStorage helpers (bypasses 5 MB per-key limit) ──────────────
const LS_KEY='gpgm_v7';
const LS_CHUNK=1800000; // ~1.8 MB per chunk, well under the 5 MB limit

function lsSave(key,str){
  try{
    let i=0;
    while(localStorage.getItem(key+'_c'+i)!==null){localStorage.removeItem(key+'_c'+i);i++;}
    localStorage.removeItem(key);
    const total=Math.ceil(str.length/LS_CHUNK);
    for(let c=0;c<total;c++){
      localStorage.setItem(key+'_c'+c, str.slice(c*LS_CHUNK,(c+1)*LS_CHUNK));
    }
    localStorage.setItem(key+'_chunks', String(total));
  }catch(e){}
}

function lsLoad(key){
  try{
    const nStr=localStorage.getItem(key+'_chunks');
    if(nStr!==null){
      const n=parseInt(nStr,10);
      let out='';
      for(let c=0;c<n;c++){
        const part=localStorage.getItem(key+'_c'+c);
        if(part===null) return null;
        out+=part;
      }
      return out;
    }
    return localStorage.getItem(key);
  }catch(e){return null;}
}

function saveGameLegacy(){
  // Step 1: always try to download the file, no size limit, most reliable
  let downloadOk=false;
  try{
    const json=saveJson();
    const blob=new Blob([json],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=`gridiron_${2026+(G.yr-1)}_s${G.yr}.json`;
    a.style.display='none';
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    downloadOk=true;
    // Step 2: also try browser save (chunked) as a quick-resume backup
    try{
      lsSave(LS_KEY,json);
    }catch(lsErr){
      // Browser save failed (private browsing or storage full), file download already worked, so just continue
      console.warn('Browser save skipped:',lsErr);
    }
    notify('Game saved! Check your Downloads folder.');
  }catch(e){
    // File download failed (rare, e.g. some mobile browsers)
    // Fall back to browser-only chunked save
    try{
      const json=saveJson();
      lsSave(LS_KEY,json);
      notify('Saved to browser (no file). Export a backup soon!','w');
    }catch(e2){
      notify('Save failed! Try a different browser.','e');
      console.error('Save error:',e2);
    }
  }
}

/* saves can come from other players (shared saves, leagues, files), and their text ends up in the page. Every string is made
   safe: allowed formatting tags in the log stay, anything else that could become markup or break out of an attribute goes,
   colors must be colors and logos must be image data. */
const SCRUB_TAG=/^<(\/?)(span|b|strong|i|em|br|small|div|u)(\s+style="[^"<>]*")?\s*\/?>$/i;
function scrubStr(v,k){
  if(k==='customLogo'||k==='logo'||k==='img')return/^data:image\/(png|jpe?g|webp|gif|bmp|avif|svg\+xml)(;charset=[\w-]+)?(;base64)?,[A-Za-z0-9+\/=\-_.!~*'()%]+$/.test(v)?v:null;
  if(k==='c1'||k==='c2'||k==='c3'||k==='color'||k==='col')return/^#[0-9a-f]{3,8}$/i.test(v)||/^[a-z]{3,20}$/i.test(v)?v:'#444444';
  if(!/[<>"`]/.test(v))return v;
  if(v.indexOf('<')<0)return v.replace(/[<>"`]/g,'');
  return v.split(/(<[^<>]*>)/).map(x=>{if(x[0]==='<'){if(!SCRUB_TAG.test(x))return'';return/url\(|expression|javascript:|@import/i.test(x)?x.replace(/\s+style="[^"]*"/i,''):x;}return x.replace(/[<>"`]/g,'');}).join('');}
function saveScrub(o,k){if(typeof o==='string')return scrubStr(o,k);
  if(Array.isArray(o)){for(let i=0;i<o.length;i++){const x=o[i];if(typeof x==='string'){const y=scrubStr(x,k);if(y!==x)o[i]=y;}else if(x&&typeof x==='object')saveScrub(x,k);}return o;}
  if(o&&typeof o==='object')for(const kk in o){const x=o[kk];if(typeof x==='string'){const y=scrubStr(x,kk);if(y!==x)o[kk]=y;}else if(x&&typeof x==='object')saveScrub(x,kk);}
  return o;}
function applySaveText(txt){
  try{
        const data=typeof txt==='string'?parseSave(txt):txt;if(!data||!data.G)throw new Error('Invalid save');saveScrub(data);
        G=data.G;_sId=data._sId||1;_pId=data._pId||1;_spVer++;_pIx=null;_sIx=null;
        if(!G.schoolRecs)initRecs();if(!G.trophies)G.trophies=[];if(!G.playoff)G.playoff=null;if(!G.osPhase)G.osPhase=0;if(!G.rivalHistory)G.rivalHistory={};if(!G.wlArchive)G.wlArchive=[];if(!G.hofArchive)G.hofArchive=[];if(!G.benched)G.benched={};if(!G.chosenRivals)G.chosenRivals=[];if(G.seasonRivalId===undefined)G.seasonRivalId=null;
        // v2 JV migration
        if(!G.jvRoster)G.jvRoster=[];
        if(G.reclsPressure===undefined)G.reclsPressure=0;
        if(!G.reclsLog)G.reclsLog=[];
        if(G.promotedYr===undefined)G.promotedYr=0;
        if(G.unlimitedMoney===undefined)G.unlimitedMoney=false;
        // Mark existing 8th grade players as JV if not already marked
        for(const p of G.players){if(p.sId===G.myId&&p.yr===8&&p.onJV===undefined){p.onJV=true;if(!G.jvRoster.includes(p.id))G.jvRoster.push(p.id);}}
        // v1.18 migration: add allLeagues if missing (old save)
        if(!G.allLeagues){
          G.allLeagues={};
          for(const cls of ['1A','2A','3A','4A','5A']){
            if(cls===G.cls)continue;
            const otherDivs=makeDivisions(cls);
            for(const div of otherDivs)for(const t of div.teams){t.cls=cls;}
            G.allLeagues[cls]={divisions:otherDivs,champId:null,champName:null};
            for(const div of otherDivs)for(const s of div.teams)genTeamPlayers(s);
          }
        }
        // Stamp cls on own-league teams if missing
        for(const div of G.divisions)for(const t of div.teams)if(!t.cls)t.cls=G.cls;
        for(const p of G.players){
          if(!p.seasStats)p.seasStats=emS();if(!p.carStats)p.carStats={...p.stats};if(!p.depth)p.depth={};
          if(p.dev==='Elite')p.dev='Elite Dev';
          if(!p.interests)p.interests=genInterests();if(!p.dreamSchool)p.dreamSchool=genDreamSchool(p.dev||'Normal',p.pot||50,p.pos||'QB');
          if(!p.arch)p.arch=pickArchetype(p.pos,getS(p.sId)?.offS||'Pro Style',getS(p.sId)?.defS||'4-3');
          if(!p.streak)p.streak=null;if(!p.streakUsed)p.streakUsed=false;if(!p.streakGamesLeft)p.streakGamesLeft=0;if(!p.perfHistory)p.perfHistory=[];
          if(!p.fn&&p.firstName){p.fn=p.firstName;p.ln=p.lastName;p.rat=p.rating;p.pot=p.potential;p.spd=p.speed;p.str=p.strength;p.awr=p.awareness;p.sId=p.schoolId;p.inj=p.injuryWeeks||0;p.sp=p.skillPoints||0;p.wl=p.watchlisted||false;p.yr=p.year;p.ht=p.heightIn||72;p.wt=p.weightLbs||200;p.num=p.number!=null?p.number:posN(p.pos,p.sId);p.fs=p.faceS||p.id;p.camp=p.campAttended||false;}
        }
        // Migrate hofArchive and wlArchive players, same fixups as active players
        // (old saves stored raw snapshots that may be missing newer fields like p.fs)
        function _migrateArchivedPlayer(p){
          if(!p.fn&&p.firstName){p.fn=p.firstName;p.ln=p.lastName;p.rat=p.rating;p.pot=p.potential;p.spd=p.speed;p.str=p.strength;p.awr=p.awareness;p.sId=p.schoolId;p.yr=p.year;p.ht=p.heightIn||72;p.wt=p.weightLbs||200;p.num=p.number!=null?p.number:posN(p.pos||'QB',p.sId);p.camp=p.campAttended||false;}
          if(!p.fn)p.fn='Unknown';
          if(!p.ln)p.ln='Player';
          if(!p.pos)p.pos='QB';
          if(!p.rat)p.rat=50;
          if(p.dev==='Elite')p.dev='Elite Dev';
          if(!p.dev)p.dev='Normal';
          if(!p.stars)p.stars=0;
          if(!p.fs)p.fs=p.id||(Math.abs((p.fn||'').charCodeAt(0)*31+(p.ln||'').charCodeAt(0)*17));
          if(!p.offers)p.offers=[];
          if(!p.carStats)p.carStats=p.stats||emS();
          if(!p.seasStats)p.seasStats=emS();
          if(!p.depth)p.depth={};
          if(!p.perfHistory)p.perfHistory=[];
          p._cf=undefined; // clear any stale cached college facts
          p.story=null;    // clear stale story so it regenerates fresh
        }
        // v2.06: the old star ratings become the scouts' grade; national star ratings are set from the current classes
        try{bodyMigrate();}catch(e){console.error('bodies',e);}
        try{worldApply(G.world||{},true);}catch(e){console.error('league setup',e);}
        try{colMigrate();}catch(e){console.error('colleges',e);}
        try{proMigrate();}catch(e){console.error('pro names',e);}
        try{colMigrate3();}catch(e){console.error('colleges v3',e);}
        // a dream school that is not one of this world's colleges (renamed or replaced) is picked again
        try{for(const p of G.players)if(p.dreamSchool&&!dreamOk(p.dreamSchool))p.dreamSchool=genDreamSchool(p.dev||'Normal',p.pot||50,p.pos||'QB');}catch(e){}
        if(G.players.some(p=>p.sg===undefined)){G._thr=null;for(const p of G.players)if(p.sg===undefined){p.sg=p.stars||0;p.stars=p.grad?(p.stars||0):natTarget(p);}}
        for(const p of (G.hofArchive||[]))_migrateArchivedPlayer(p);
        for(const p of (G.wlArchive||[]))_migrateArchivedPlayer(p);
        for(const s of allSchoolsAll()){if(!s.offS&&s.offScheme)s.offS=s.offScheme;if(!s.defS&&s.defScheme)s.defS=s.defScheme;if(!s.fac&&s.facilities)s.fac=s.facilities;if(!s.trophies)s.trophies=[];if(!s.cls)s.cls=G.cls;}
        if(!G.offR&&G.offRat){G.offR=G.offRat;G.defR=G.defRat;}
        if(!G.offS&&G.offScheme){G.offS=G.offScheme;G.defS=G.defScheme;}
        if(!G.baseYear)G.baseYear=2026;
        if(!G.sched.some(g=>g.type==='playoff'||g.type==='bye')){
          const regWks=G.sched.length;
          for(let r=0;r<4;r++){G.sched.push({wk:regWks+r+1,type:'bye',oppId:null,result:null,my:0,opp:0,date:fmtDate(regWks+r),playoffRound:r+1,label:`Playoff Round ${r+1}`});}
        }
        _spVer++;buildSeasonDates(2026+(G.yr-1));
        document.getElementById('setup').classList.add('hid');document.getElementById('app').classList.remove('hid');if(typeof hideTitle==='function')hideTitle();const _cc2=document.getElementById('coachc');if(_cc2)_cc2.classList.add('hid');
        updateRats();checkAndFillRosters();nav('dash');notify('Save loaded!');setTimeout(()=>{try{saveSlimOffer();}catch(e){}},1200);
          _autoKey='';if(typeof _RK!=='undefined')_RK=null;
    return true;
  }catch(err){notify('Invalid save: '+err.message,'e');return false;}
}
function loadGame(){
  const input=document.createElement('input');input.type='file';input.accept='.json,application/json';
  input.onchange=function(e){
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=function(ev){if(applySaveText(ev.target.result)){setTimeout(()=>saveGame(true),200);}};
    reader.readAsText(file);
  };input.click();
}


