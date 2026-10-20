// ═══════════ PLAYER INTERESTS (COSMETIC) ═══════════
const INTERESTS=[
  {k:'gaming',l:'Gaming',e:''},{k:'fishing',l:'Fishing',e:''},{k:'biking',l:'Biking',e:''},
  {k:'weightroom',l:'Weightroom',e:''},{k:'reading',l:'Reading',e:''},{k:'music',l:'Music',e:''},
  {k:'cooking',l:'Cooking',e:''},{k:'hunting',l:'Hunting',e:''},{k:'basketball',l:'Basketball',e:''},
  {k:'baseball',l:'Baseball',e:''},{k:'drawing',l:'Drawing',e:''},{k:'cars',l:'Cars',e:''},
  {k:'sneakers',l:'Sneakers',e:''},{k:'hiking',l:'Hiking',e:''},{k:'chess',l:'Chess',e:''},
  {k:'movies',l:'Movies',e:''},{k:'wrestling',l:'Wrestling',e:''},{k:'skateboarding',l:'Skateboarding',e:''},
  {k:'swimming',l:'Swimming',e:''},{k:'volunteering',l:'Volunteering',e:''},
];

function genInterests(){
  const cnt=rng(1,4);const pool=[...INTERESTS];const chosen=[];
  for(let i=0;i<cnt;i++){if(!pool.length)break;const idx=rng(0,pool.length-1);chosen.push(pool.splice(idx,1)[0].k);}
  return chosen;
}

function interestBadges(ints){
  if(!ints||!ints.length)return '<span style="color:var(--mu);font-size:11px">None listed</span>';
  return ints.map(k=>{const t=INTERESTS.find(x=>x.k===k);if(!t)return'';return`<span class="int-tag">${t.e} ${t.l}</span>`;}).join('');
}

// ═══════════ DREAM SCHOOL ═══════════
// Each player gets a dream school based on dev potential and position, taken from this world's colleges (so renamed
// and custom colleges show up). If that school ever offers them, they instantly commit.
function _dreamPools(){const F=D1FBS,C=D1FCS.length?D1FCS:F,n=Math.min(16,F.length);
  return{el:F.slice(0,n),mid:F.length>n?F.slice(n,Math.min(60,F.length)):F,fcs:C.slice(0,Math.min(30,C.length)),d2:D2.length?D2:C,d3:D3.length?D3:C};}
function dreamOk(d){return!!(d&&typeof COL_BY!=='undefined'&&COL_BY[d.school+'|'+d.lvl]);}
function genDreamSchool(dev, pot, pos){
  const r=Math.random(),P=_dreamPools(),fcsL=D1FCS.length?'FCS':'FBS',d2L=D2.length?'D2':fcsL,d3L=D3.length?'D3':fcsL;
  // Elite dev or high pot, dream big
  if(dev==='Elite Dev'||pot>=88){
    return r<0.65?{lvl:'FBS',school:pick(P.el)}:{lvl:'FBS',school:pick(P.mid)};
  }
  if(dev==='Star'||pot>=76){
    if(r<0.35)return{lvl:'FBS',school:pick(P.el)};
    if(r<0.70)return{lvl:'FBS',school:pick(P.mid)};
    return{lvl:fcsL,school:pick(P.fcs)};
  }
  if(dev==='Impact'||pot>=64){
    if(r<0.15)return{lvl:'FBS',school:pick(P.mid)};
    if(r<0.55)return{lvl:fcsL,school:pick(P.fcs)};
    return{lvl:d2L,school:pick(P.d2)};
  }
  // Normal dev, modest dreams
  if(r<0.25)return{lvl:fcsL,school:pick(P.fcs)};
  if(r<0.60)return{lvl:d2L,school:pick(P.d2)};
  return{lvl:d3L,school:pick(P.d3)};
}

const GAME_DATES=[];
function buildSeasonDates(startYear){
  GAME_DATES.length=0;
  let d=new Date(startYear,7,18);
  while(d.getDay()!==5)d.setDate(d.getDate()+1);
  for(let w=0;w<20;w++){const nd=new Date(d);nd.setDate(nd.getDate()+w*7);GAME_DATES.push(nd);}
}

// ═══════════ STATE ═══════════
let G=null,_sId=1,_pId=1,_popQ=[],_popI=0,_setupDivs=null,_popCb=null;

// ═══════════ UTILS ═══════════
const rng=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const rngF=(a,b)=>Math.random()*(b-a)+a;
const pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

// rb() with optional in-season gain highlight: shows green glow + "+N" badge if ratGain > 0
function rbDelta(p){
  const base=rb(p.rat);
  if(!p||!(p.ratGain>0))return base;
  return `<span style="position:relative;display:inline-flex;align-items:center;gap:3px">${base}<span style="font-size:9px;font-weight:800;color:#22c55e;background:rgba(34,197,94,.15);border:1px solid rgba(34,197,94,.4);border-radius:3px;padding:0 3px;line-height:14px">+${p.ratGain}</span></span>`;
}

// --- Training Level & Effective Potential Helpers ---
// Training level is 1-20 (replaces separate 1-5 facility levels)
// trainLevel is stored in G.trainLevel and myS().trainLevel
function getTrainLevel(){return(G&&G.trainLevel)||1;}
// Training factor 0→1 based on level (level 20 = full hi potential reachable)
function trainFactor(){return(getTrainLevel()-1)/19;}
// Sync the 4 old fac values from trainLevel (for backward compat with existing training bonuses)
function syncFacFromTrainLevel(){
  const lvl=getTrainLevel();
  // Map 1-20 → 1-5 per facility (every 4 levels = +1 fac)
  const fv=clamp(Math.ceil(lvl/4),1,5);
  if(G&&G.fac){G.fac.weight=fv;G.fac.train=fv;G.fac.film=fv;G.fac.med=fv;}
  if(G&&G.myId){const ms=getS(G.myId);if(ms&&ms.fac){ms.fac.weight=fv;ms.fac.train=fv;ms.fac.film=fv;ms.fac.med=fv;}}
}
// Effective pot for a player = lo + (hi-lo) * trainFactor (capped at potHi)
function effPot(p){
  if(!p.potLo||!p.potHi){
    // Legacy player, assign range around existing pot
    if(p.pot){p.potLo=Math.max(p.rat,p.pot-rng(5,12));p.potHi=clamp(p.pot+rng(0,8),p.potLo,99);}
    else{p.potLo=p.rat;p.potHi=p.rat;}
  }
  const tf=trainFactor();
  return clamp(Math.round(p.potLo+(p.potHi-p.potLo)*tf),p.potLo,p.potHi);
}
// Sync p.pot to effective value (called after training upgrades or season updates)
function syncPot(p){p.pot=effPot(p);}


function rb(r){let c='rb-p';if(r>=88)c='rb-e';else if(r>=75)c='rb-h';else if(r>=60)c='rb-m';else if(r>=45)c='rb-l';return`<span class="rb ${c}">${r}</span>`;}
function stars(s){let o='';for(let i=0;i<5;i++)o+=i<s?'★':'<span class="e">★</span>';return`<span class="st">${o}</span>`;}
function yrL(y){return{8:'<span style="color:var(--y8,#88ccff);font-weight:700">8th</span>',9:'<span class="yf">Fr</span>',10:'<span class="ys">So</span>',11:'<span class="yj">Jr</span>',12:'<span class="yr">Sr</span>'}[y]||y;}
function htf(n){return`${Math.floor(n/12)}'${n%12}"`;}
function gpaL(g){const c=g>=3.5?'ghi':g>=2.5?'gmi':'gli';return`<span class="${c}">${g.toFixed(1)}</span>`;}
function devB(d){return`<span class="${DEV_C[d]||'dev-n'}">${d||'Normal'}</span>`;}

// Dev trait popup, shows trait info + chance of increase/decrease for a given player
function devBClickable(p){
  const d=p.dev;
  return`<span class="${DEV_C[d]||'dev-n'}" style="cursor:pointer;text-decoration:underline dotted" onclick="showDevTraitPopup(${p.id})">${d||'Normal'}</span>`;
}
window.showDevTraitPopup=function(pid){
  const p=getP(pid);if(!p)return;
  // Dynamic SP: base from dev + performance modifier (-1 to +3) + training level modifier (0 to +3)
  const tLvlNow=getTrainLevel();
  const trainModNow=tLvlNow>=16?3:tLvlNow>=11?2:tLvlNow>=6?1:0;
  const ssNow=clamp(calcSS(p),0,120);
  let perfModNow=0;
  if(ssNow>=80)perfModNow=3;else if(ssNow>=55)perfModNow=2;else if(ssNow>=30)perfModNow=1;else if(ssNow>=15)perfModNow=0;else perfModNow=-1;
  const perfLabel=ssNow>=80?' Elite':ssNow>=55?' Good':ssNow>=30?' Average':ssNow>=15?' Below Avg':' Poor';
  function dynSP(base){return Math.max(1,base+perfModNow+trainModNow);}
  const DEV_INFO={
    'Normal':    {icon:'',color:'var(--mu)',desc:`Standard development pace. Base: <strong>3 SP</strong>/phase, adjusted by performance & training level.`,spPerPhase:dynSP(3)},
    'Impact':    {icon:'',color:'var(--te)',desc:`Above-average development. Base: <strong>6 SP</strong>/phase, adjusted by performance & training level.`,spPerPhase:dynSP(6)},
    'Star':      {icon:'',color:'var(--gd)',desc:`High-ceiling talent. Base: <strong>9 SP</strong>/phase, adjusted by performance & training level.`,spPerPhase:dynSP(9)},
    'Elite Dev': {icon:'',color:'var(--gn)',desc:`Generational talent. Base: <strong>13 SP</strong>/phase, adjusted by performance & training level. Fastest star gains.`,spPerPhase:dynSP(13)},
  };
  const info=DEV_INFO[p.dev]||DEV_INFO['Normal'];
  const DEV=['Normal','Impact','Star','Elite Dev'];
  const devIdx=DEV.indexOf(p.dev);

  // Calculate upgrade/downgrade chance based on seasonDevCheck logic
  const ss=calcSS(p);
  const perfScore=clamp(ss,0,100);
  const perfFactor=perfScore/100;
  const upgradeChance=clamp(0.01+(perfFactor*0.04)*(1-(devIdx/4)),0,0.05);
  const downgradeChance=clamp(0.01+((1-perfFactor)*0.04)*(0.5+(devIdx/4)),0,0.05);
  const upgradeDisplay=devIdx<3?(upgradeChance*100).toFixed(1)+'%':'MAX';
  const downgradeDisplay=devIdx>0?(downgradeChance*100).toFixed(1)+'%':'MIN';
  const nextDev=devIdx<3?DEV[devIdx+1]:null;
  const prevDev=devIdx>0?DEV[devIdx-1]:null;

  // Potential shift info
  const potShiftChance=(0.01+perfFactor*0.04)*100;
  const potDirection=perfFactor>=0.5?'increase':'decrease';
  const extremity=Math.abs(perfFactor-0.5)*2;
  const potMag=Math.max(1,Math.round(extremity*5));

  openMo(`<h2 style="color:${info.color}">${info.icon} Dev Trait: ${p.dev}</h2>
  <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">
    ${face(p.fs,52)}
    <div>
      <div style="font-family:var(--hd);font-size:17px;font-weight:800">${p.fn} ${p.ln}</div>
      <div style="font-size:12px;color:var(--mu)">${p.pos} • ${yrL(p.yr)} • ${rbDelta(p)} OVR</div>
    </div>
  </div>

  <div style="background:var(--s2);border:1px solid var(--bd);border-radius:6px;padding:12px 14px;margin-bottom:14px">
    <div style="font-size:13px;color:var(--tx);margin-bottom:6px">${info.desc}</div>
    <div style="font-size:13px;color:var(--te);font-weight:700;margin-bottom:8px">+${info.spPerPhase} SP per offseason phase (current)</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;font-size:11px">
      <div style="background:var(--s3);border:1px solid var(--bd);border-radius:4px;padding:4px 9px">
        <span style="color:var(--mu)">Perf:</span> <strong style="color:${perfModNow>=2?'var(--gn)':perfModNow>=0?'var(--tx)':'var(--rd)'}">${perfLabel} (${perfModNow>=0?'+':''}${perfModNow} SP)</strong>
      </div>
      <div style="background:var(--s3);border:1px solid var(--bd);border-radius:4px;padding:4px 9px">
        <span style="color:var(--mu)">Train Lvl ${tLvlNow}:</span> <strong style="color:${trainModNow>0?'var(--gn)':'var(--mu)'}">${trainModNow>0?'+'+trainModNow+' SP':'No bonus'}</strong>
      </div>
    </div>
  </div>

  <div style="font-family:var(--hd);font-size:13px;font-weight:800;color:var(--te);margin-bottom:8px;">Dev Progression Ladder</div>
  <div style="display:flex;gap:6px;margin-bottom:6px;flex-wrap:wrap">
    ${DEV.map((d,i)=>`<div style="background:${d===p.dev?'var(--s3)':'var(--s2)'};border:${d===p.dev?`2px solid ${info.color}`:'1px solid var(--bd)'};border-radius:5px;padding:7px 12px;text-align:center;min-width:80px">
      <div style="font-size:${d===p.dev?'15px':'12px'};font-weight:${d===p.dev?900:600};color:${DEV_INFO[d].color}">${DEV_INFO[d].icon} ${d}</div>
      <div style="font-size:10px;color:var(--mu);margin-top:2px">${DEV_SP[d]} base SP</div>
    </div>`).join('')}
  </div>
  <div style="font-size:11px;color:var(--mu);margin-bottom:14px">SP values above are base. Final SP per phase = base + performance (−1 to +3) + training level (0 to +3) + staff & traits.</div>

  <div style="font-family:var(--hd);font-size:13px;font-weight:800;color:var(--te);margin-bottom:8px;">Next Offseason Chances</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
    <div style="background:rgba(34,184,112,.1);border:1px solid rgba(34,184,112,.3);border-radius:6px;padding:10px;text-align:center">
      <div style="font-size:11px;color:var(--mu);margin-bottom:4px">Upgrade chance</div>
      <div style="font-family:var(--hd);font-size:24px;font-weight:900;color:var(--gn)">${upgradeDisplay}</div>
      ${nextDev?`<div style="font-size:11px;color:var(--gn);margin-top:3px">→ ${nextDev}</div>`:'<div style="font-size:10px;color:var(--mu);margin-top:3px">Already at maximum</div>'}
    </div>
    <div style="background:rgba(204,34,34,.1);border:1px solid rgba(204,34,34,.3);border-radius:6px;padding:10px;text-align:center">
      <div style="font-size:11px;color:var(--mu);margin-bottom:4px">Downgrade chance</div>
      <div style="font-family:var(--hd);font-size:24px;font-weight:900;color:var(--te)">${downgradeDisplay}</div>
      ${prevDev?`<div style="font-size:11px;color:var(--te);margin-top:3px">→ ${prevDev}</div>`:'<div style="font-size:10px;color:var(--mu);margin-top:3px">Already at minimum</div>'}
    </div>
  </div>

  <div style="font-family:var(--hd);font-size:13px;font-weight:800;color:var(--te);margin-bottom:8px;">Potential Range</div>
  <div style="background:var(--s2);border:1px solid var(--bd);border-radius:6px;padding:10px 14px;margin-bottom:14px">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
      <div style="text-align:center">
        <div style="font-size:10px;color:var(--mu);font-weight:700">Floor</div>
        <div style="font-family:var(--hd);font-size:22px;font-weight:900;color:var(--gn)">${p.potLo||p.pot}</div>
      </div>
      <div style="flex:1;background:var(--bd);border-radius:3px;height:8px;position:relative">
        <div style="position:absolute;left:0;top:0;height:8px;border-radius:3px;background:linear-gradient(90deg,var(--gn),#f0b429);width:${Math.round((effPot(p)-(p.potLo||p.pot))/Math.max(1,(p.potHi||p.pot)-(p.potLo||p.pot))*100)}%"></div>
      </div>
      <div style="text-align:center">
        <div style="font-size:10px;color:var(--mu);font-weight:700">Ceiling</div>
        <div style="font-family:var(--hd);font-size:22px;font-weight:900;color:var(--pot,#f0b429)">${p.potHi||p.pot}</div>
      </div>
    </div>
    <div style="font-size:12px;color:var(--tx);margin-bottom:4px">
      ${(potShiftChance).toFixed(1)}% chance of range shift at season end.
    </div>
    <div style="font-size:12px;color:var(--mu)">
      Performance likely to <strong style="color:${potDirection==='increase'?'var(--gn)':'var(--te)'}">${potDirection}</strong> the range by ~${potMag} pts.
      ${(p.yr===9||p.yr===10)?'<span style="color:var(--gn)"> Fr/So, 70% protected from decreases.</span>':''}
    </div>
    <div style="font-size:11px;color:var(--mu);margin-top:4px">Training facility unlocks <strong style="color:var(--tx)">${Math.round(trainFactor()*100)}%</strong> of ceiling. Upgrade to reach higher.</div>
  </div>

  <div style="background:var(--s3);border-left:3px solid var(--gd);padding:8px 12px;border-radius:0 4px 4px 0;font-size:11px;color:var(--gd)">
     Potential ranges shift at <strong>season end</strong>. Great seasons raise the ceiling; poor seasons or inactivity lower it. Train hard and upgrade your facility to unlock full potential!
  </div>`);
};

function trB(k){const t=TRAITS.find(x=>x.k===k);if(!t)return'';return`<span class="tb2" style="background:${t.c};color:${t.tc}">${t.l}</span>`;}
function ofB(o){const m={FBS:'of',FCS:'oc',D2:'od',NAIA:'on',D3:'ot',JUCO:'oj'};return`<span class="ob ${m[o.lvl]||'od'}" style="display:inline-flex;align-items:center;gap:3px">${colLogo(o.school+'|'+o.lvl,14)}${o.lvl==='JUCO'?'JUCO interest':o.lvl}: ${o.school}</span>`;}
function posNums(pos){const ranges=POS_NUM[pos]||[[1,99]];const nums=[];for(const[a,b]of ranges)for(let n=a;n<=b;n++)nums.push(n);return nums;}
function posN(pos,sId){
  const valid=posNums(pos);
  if(!G||!G.players||sId===undefined)return valid[rng(0,valid.length-1)];
  const newSide=POS_OFFENSE.has(pos)?'off':POS_DEFENSE.has(pos)?'def':'spec';
  // A number is "taken" only if used by someone on the SAME side of the ball
  const used=new Set(sPlayers(sId).filter(p=>{
    const side=POS_OFFENSE.has(p.pos)?'off':POS_DEFENSE.has(p.pos)?'def':'spec';
    return side===newSide;
  }).map(p=>p.num));
  const free=valid.filter(n=>!used.has(n));
  const pool=free.length?free:valid; // fallback if all taken on that side
  return pool[rng(0,pool.length-1)];
}
function emSFull(){return{gp:0,passAtt:0,passCmp:0,passYds:0,passTD:0,passInt:0,rushAtt:0,rushYds:0,rushTD:0,rec:0,recYds:0,recTD:0,yac:0,krRet:0,krYds:0,krTD:0,prRet:0,prYds:0,prTD:0,drops:0,tackles:0,tfl:0,sacks:0,ints:0,pbu:0,safeties:0,tgtA:0,ydsA:0,pancakes:0,sacksA:0};}
const _ZS=emSFull(); // not frozen: an inherited read-only field would block the player's own write
// a stat line stores only the numbers a player really has; every other stat reads 0 from the shared record
function emS(){return Object.create(_ZS);}
function recStr(w,l){const s=`${w}-${l}`;return w>l?`<span class="rg">${s}</span>`:l>w?`<span class="rb_">${s}</span>`:`<span class="re">${s}</span>`;}
// v2.07: each state's schools letter their logos in their own typeface (Crestfield keeps the classic varsity block)
