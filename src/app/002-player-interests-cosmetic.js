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
// Each player gets a dream school based on dev potential and position.
// If that school ever offers them, they instantly commit.
const _DREAM_FBS_ELITE=['Llano Grande','Coralina','Magnolia','Cascadia','Coralina State','Llano Grande State','Cumberland','Crestfield','Magnolia State','Llano Grande A&M','Wakota','Summit','Acadia','Cascadia State','Tierra Alta','Cumberland State'];
const _DREAM_FBS_MID=['Crestfield Tech','Tierra Alta State','Central Tierra Alta','Beckett University','Cascadia Tech','Summit State','Winslow University','Wickham University','Ranger Christian','Summit Mines','Acadia Tech','Crestfield State','Magnolia A&M','Northam University','South Acadia','Ormsby University','Western Llano Grande','Eastern Magnolia','Southern Cascadia','Cumberland Tech','Borger State','Harrington University','Sonora State','Ravenwood','Elgin'];
const _DREAM_FCS_SCHOOLS=['Silsbee State','Kaimana','Seguin','Dumas','Sandberg State','Kountze','Sweetwater Christian','Dalhart State','Cotulla State','Lampasas State','Southern Acadia State','Abilene','Northern Summit','Crestwood State','Westby State'];
colKeepArr(_DREAM_FBS_ELITE,'FBS');colKeepArr(_DREAM_FBS_MID,'FBS');colKeepArr(_DREAM_FCS_SCHOOLS,'FCS');
if(!_DREAM_FBS_MID.length)_DREAM_FBS_MID.push(...D1FBS.slice(-10));if(!_DREAM_FCS_SCHOOLS.length)_DREAM_FCS_SCHOOLS.push(...D1FCS.slice(0,8));

function genDreamSchool(dev, pot, pos){
  const r=Math.random();
  // Elite dev or high pot, dream big
  if(dev==='Elite Dev'||pot>=88){
    return r<0.65?{lvl:'FBS',school:pick(_DREAM_FBS_ELITE)}:{lvl:'FBS',school:pick(_DREAM_FBS_MID)};
  }
  if(dev==='Star'||pot>=76){
    if(r<0.35)return{lvl:'FBS',school:pick(_DREAM_FBS_ELITE)};
    if(r<0.70)return{lvl:'FBS',school:pick(_DREAM_FBS_MID)};
    return{lvl:'FCS',school:pick(_DREAM_FCS_SCHOOLS)};
  }
  if(dev==='Impact'||pot>=64){
    if(r<0.15)return{lvl:'FBS',school:pick(_DREAM_FBS_MID)};
    if(r<0.55)return{lvl:'FCS',school:pick(_DREAM_FCS_SCHOOLS)};
    return{lvl:'D2',school:pick(D2)};
  }
  // Normal dev, modest dreams
  if(r<0.25)return{lvl:'FCS',school:pick(_DREAM_FCS_SCHOOLS)};
  if(r<0.60)return{lvl:'D2',school:pick(D2)};
  return{lvl:'D3',school:pick(D3)};
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
const _LG_G={"A":[95.8,"M-0.9 0V-8.1H6.4L40.3 -100H54.7L88.7 -8.1H97.3V0H55.1V-8.1H63.9L56.5 -28.5H22.7L15.1 -8.1H25.9V0ZM25.7 -36.6H53.5L39.7 -74.9Z"],"B":[104.3,"M5.8 0V-8.1H17.3V-91.9H5.8V-100H59.1Q75.6 -100 83.9 -93.8Q92.1 -87.7 92.1 -75.3Q92.1 -66.4 86.4 -61.2Q80.7 -55.9 69.5 -54.6Q83.1 -53.2 90.3 -46.6Q97.5 -39.9 97.5 -28.9Q97.5 -14.1 87.4 -7Q77.4 0 55.8 0ZM40.5 -58.3H48.4Q58.8 -58.3 63.8 -62.5Q68.8 -66.6 68.8 -75.3Q68.8 -84 63.9 -87.9Q59.1 -91.9 48.4 -91.9H40.5ZM40.5 -8.1H49.2Q60.6 -8.1 66.2 -13.2Q71.7 -18.3 71.7 -28.9Q71.7 -39.7 66.1 -44.9Q60.5 -50.2 49.2 -50.2H40.5Z"],"C":[98.3,"M92 -28.5Q88.4 -13.1 79.2 -5.6Q70 1.9 54.5 1.9Q31.6 1.9 18.4 -12Q5.2 -26 5.2 -49.9Q5.2 -73.9 18.4 -87.8Q31.6 -101.8 54.5 -101.8Q62.4 -101.8 71.1 -99.7Q79.8 -97.5 89.5 -93.2V-68.6H81.8Q79.5 -81.2 73.3 -87.4Q67.1 -93.7 56.9 -93.7Q43.7 -93.7 37.4 -83Q31 -72.2 31 -49.9Q31 -27.6 37.4 -16.9Q43.7 -6.2 57 -6.2Q66 -6.2 71.7 -11.7Q77.4 -17.3 80 -28.5Z"],"D":[107.0,"M40.5 -8.1H48.9Q63 -8.1 69.5 -18.2Q76.1 -28.2 76.1 -50.1Q76.1 -71.9 69.6 -81.9Q63 -91.9 48.9 -91.9H40.5ZM5.8 0V-8.1H17.3V-91.9H5.8V-100H52Q76.2 -100 89 -87.1Q101.9 -74.3 101.9 -50.1Q101.9 -25.8 89 -12.9Q76.2 0 52 0Z"],"E":[94.0,"M5.8 0V-8.1H17.3V-91.9H5.8V-100H86.7V-76.4H78.4V-90.8H40.5V-58.7H64.1V-71.5H72.3V-36.9H64.1V-49.6H40.5V-9.2H79.5V-23.6H87.7V0Z"],"F":[87.6,"M5.8 0V-8.1H17.3V-91.9H5.8V-100H86V-76.4H77.8V-90.8H40.7V-58.7H63.5V-71.5H71.7V-36.9H63.5V-49.6H40.7V-8.1H54.8V0Z"],"G":[105.4,"M84.9 -68.6Q82.3 -81.8 75.9 -87.8Q69.6 -93.7 58.1 -93.7Q44.1 -93.7 37.5 -83.2Q31 -72.6 31 -49.9Q31 -27.4 37.3 -16.8Q43.5 -6.2 56.8 -6.2Q61.8 -6.2 66.2 -7.4Q70.5 -8.7 74.1 -11.3V-38.7H63.2V-46.8H95.6V-8.4Q85.5 -3.1 75.5 -0.6Q65.4 1.9 54.8 1.9Q31.6 1.9 18.4 -11.9Q5.2 -25.8 5.2 -49.9Q5.2 -74.1 18.4 -87.9Q31.6 -101.8 54.8 -101.8Q64.4 -101.8 73.8 -99.7Q83.1 -97.5 92.6 -93.2V-68.6Z"],"H":[116.6,"M5.8 0V-8.1H17.3V-91.9H5.8V-100H52.1V-91.9H40.5V-58.3H76.3V-91.9H64.8V-100H111.1V-91.9H99.5V-8.1H111.1V0H64.8V-8.1H76.3V-49.1H40.5V-8.1H52.1V0Z"],"I":[57.7,"M5.8 0V-8.1H17.3V-91.9H5.8V-100H52.1V-91.9H40.5V-8.1H52.1V0Z"],"J":[58.4,"M-9 24V8.2H-1.2Q-0.9 14.5 1.5 17.5Q3.8 20.4 8.4 20.4Q14.2 20.4 16.5 15.4Q18.9 10.4 18.9 -3.3V-91.9H5.8V-100H53.7V-91.9H42.2V-2.7Q42.2 13.5 34.8 21Q27.5 28.5 11.3 28.5Q6.3 28.5 1.2 27.4Q-3.8 26.3 -9 24Z"],"K":[107.3,"M5.8 0V-8.1H17.3V-91.9H5.8V-100H52.1V-91.9H40.5V-55.4L78.6 -91.9H69V-100H102.6V-91.9H90.6L58.3 -61L102.2 -8.1H111.1V0H80.6L40.5 -48.6V-8.1H52.1V0Z"],"L":[86.8,"M5.8 0V-8.1H17.3V-91.9H5.8V-100H52.1V-91.9H40.5V-9.2H76V-25H84.1V0Z"],"M":[136.6,"M5.2 0V-8.1H16.6V-91.9H5.2V-100H42.3L68 -35.8L93.8 -100H130.9V-91.9H119.4V-8.1H130.9V0H84.6V-8.1H96V-84.4L68.1 -14.7H52.8L25.1 -84.4V-8.1H36.5V0Z"],"N":[112.8,"M5.4 0V-8.1H16.9V-91.9H5.4V-100H33.6L87.9 -29.2V-91.9H76.4V-100H107.9V-91.9H96.4V0H80.6L25.5 -72.3V-8.1H36.9V0Z"],"O":[107.5,"M53.7 -6.2Q65.2 -6.2 70.8 -16.9Q76.4 -27.7 76.4 -49.9Q76.4 -72.1 70.8 -82.9Q65.2 -93.7 53.7 -93.7Q42.3 -93.7 36.6 -82.8Q31 -71.9 31 -49.9Q31 -27.9 36.6 -17Q42.3 -6.2 53.7 -6.2ZM53.7 1.9Q31 1.9 18.1 -11.9Q5.2 -25.7 5.2 -49.9Q5.2 -74.1 18.1 -88Q31.1 -101.8 53.7 -101.8Q76.4 -101.8 89.3 -88Q102.2 -74.2 102.2 -49.9Q102.2 -25.7 89.3 -11.9Q76.4 1.9 53.7 1.9Z"],"P":[92.8,"M5.8 0V-8.1H17.3V-91.9H5.8V-100H57Q72.1 -100 80.9 -92.1Q89.8 -84.1 89.8 -70.8Q89.8 -57.4 80.9 -49.4Q72 -41.4 57 -41.4H40.5V-8.1H55.1V0ZM40.5 -49.5H47.3Q55.1 -49.5 59.8 -55.3Q64.4 -61.1 64.4 -70.8Q64.4 -80.4 59.8 -86.2Q55.2 -91.9 47.3 -91.9H40.5Z"],"Q":[107.5,"M53.3 1.9Q30.5 1.5 17.8 -12.1Q5.2 -25.8 5.2 -49.9Q5.2 -74.1 18.1 -88Q31.1 -101.8 53.7 -101.8Q76.4 -101.8 89.3 -88Q102.2 -74.2 102.2 -49.9Q102.2 -28.6 92.3 -15.3Q82.4 -2.1 64.1 1.1Q67.2 4.9 71.8 6.6Q76.4 8.2 83.7 8.2H86.8V24.7H85.1Q73.6 24.7 65.9 19.2Q58.3 13.7 53.3 1.9ZM53.7 -6.2Q65.2 -6.2 70.8 -16.9Q76.4 -27.7 76.4 -49.9Q76.4 -72.1 70.8 -82.9Q65.2 -93.7 53.7 -93.7Q42.3 -93.7 36.6 -82.8Q31 -71.9 31 -49.9Q31 -27.9 36.6 -17Q42.3 -6.2 53.7 -6.2Z"],"R":[102.5,"M65.5 -48.8Q70.9 -48 74.5 -44.9Q78.2 -41.8 81 -36L94.1 -8.1H103.3V0H73.7L59.3 -30.2Q55.2 -39.6 52.3 -42.2Q49.4 -44.7 44.2 -44.7H40.5V-8.1H52.1V0H5.8V-8.1H17.3V-91.9H5.8V-100H57.1Q72.8 -100 81.3 -93Q89.9 -86 89.9 -73.1Q89.9 -62.7 83.8 -56.6Q77.8 -50.6 65.5 -48.8ZM40.5 -52.8H48.4Q56.9 -52.8 61.4 -57.9Q66 -63 66 -72.4Q66 -81.8 61.4 -86.9Q56.9 -91.9 48.4 -91.9H40.5Z"],"S":[89.1,"M9.5 -4.8V-28.5H17.1Q19 -17.3 25.5 -11.7Q31.9 -6.2 43.5 -6.2Q52.8 -6.2 57.7 -10.1Q62.6 -14.1 62.6 -21.7Q62.6 -27.7 59.2 -31.1Q55.9 -34.4 45.5 -37.3L32.1 -41Q18.9 -44.7 13.5 -51.4Q8.2 -58.1 8.2 -70.4Q8.2 -85.3 17 -93.5Q25.9 -101.8 41.9 -101.8Q49.8 -101.8 58.4 -100.3Q66.9 -98.9 76.1 -95.9V-73.8H68.5Q66.6 -84.1 60.8 -88.9Q54.9 -93.7 43.9 -93.7Q35 -93.7 30.5 -90.3Q25.9 -86.8 25.9 -80Q25.9 -73.7 29.1 -70.5Q32.2 -67.2 44.4 -63.8L57.9 -60.1Q70.5 -56.6 76.1 -49.2Q81.7 -41.9 81.7 -28.9Q81.7 -13.8 72.3 -5.9Q63 1.9 44.7 1.9Q35.9 1.9 27.2 0.3Q18.5 -1.4 9.5 -4.8Z"],"T":[91.8,"M22.4 0V-8.1H34.3V-90.8H9.6V-75H1.4V-100H90.6V-75H82.5V-90.8H57.6V-8.1H69.7V0Z"],"U":[107.6,"M15.7 -91.9H4.2V-100H50.5V-91.9H39V-41.9Q39 -23.2 44.2 -15.7Q49.5 -8.2 62.2 -8.2Q74.6 -8.2 79.8 -15.8Q85.1 -23.3 85.1 -41.9V-91.9H73.6V-100H105V-91.9H93.4V-40.5Q93.4 -17.5 84.5 -7.8Q75.6 1.9 54.5 1.9Q33.6 1.9 24.6 -7.9Q15.7 -17.7 15.7 -40.6Z"],"V":[95.8,"M97.6 -100V-91.9H90.1L56.1 0H41.8L7.8 -91.9H-0.7V-100H41.5V-91.9H32.8L57.1 -25.7L81.6 -91.9H70.9V-100Z"],"W":[138.6,"M105.2 0H89.7L69.3 -72.8L49 0H33.4L7.7 -91.9H-1V-100H41.7V-91.9H32L49.2 -30.5L68.6 -100H85.7L105.5 -29.3L123 -91.9H112.3V-100H140.2V-91.9H130.9Z"],"X":[95.8,"M41.9 -38.5 23.1 -8.1H34.2V0H2.2V-8.1H13.3L37 -46.3L8.8 -91.9H0.6V-100H45.3V-91.9H35.4L52.8 -63.8L70.1 -91.9H59.6V-100H91V-91.9H79.8L57.6 -56L87.1 -8.1H95.6V0H50.8V-8.1H60.8Z"],"Y":[88.1,"M21.3 0V-8.1H33.4V-41.4L6.6 -91.9H-1V-100H42.1V-91.9H32.2L52.4 -53.8L72.5 -91.9H63.6V-100H89.4V-91.9H81.7L56.7 -44.9V-8.1H68.9V0Z"],"Z":[90.1,"M4.6 0V-9.4L58.3 -90.8H15.2V-75.9H7V-100H85.1V-90.6L31.9 -9.2H77.4V-23.2H85.7V0Z"]," ":[42.9,""]};
// v2.07: each state's schools letter their logos in their own typeface (Crestfield keeps the classic varsity block)
