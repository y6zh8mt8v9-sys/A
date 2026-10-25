// ═══════════ v2.16 PLAYER ATTRIBUTES + POSITION OVERALL ═══════════
// Like Madden / College Football: every player has physical and position skill ratings, and his overall is a
// position-specific weighted blend of them (awareness counts a lot everywhere, throw power means nothing to a lineman).
// p.rat stays the overall the rest of the game reads; ovrSync keeps the two in step both ways:
// progression that moves p.rat spreads the change over the position's skills, and edited / trained skills move p.rat.
const ATTRS=[
  ['Physical',[['spd','Speed'],['acl','Acceleration'],['agi','Agility'],['str','Strength'],['jmp','Jumping'],['sta','Stamina'],['awr','Awareness']]],
  ['Passing',[['thp','Throw power'],['sac','Short accuracy'],['dac','Deep accuracy'],['tup','Throw under pressure']]],
  ['Ball carrier',[['car','Carrying'],['elu','Elusiveness'],['btk','Break tackle']]],
  ['Receiving',[['cth','Catching'],['cit','Catch in traffic'],['rte','Route running']]],
  ['Blocking',[['pbk','Pass block'],['rbk','Run block']]],
  ['Front seven',[['pmv','Power moves'],['fmv','Finesse moves'],['bsh','Block shedding'],['tak','Tackling'],['hpw','Hit power']]],
  ['Coverage',[['mcv','Man coverage'],['zcv','Zone coverage'],['prs','Press']]],
  ['Kicking',[['kpw','Kick power'],['kac','Kick accuracy']]]];
const AK=ATTRS.flatMap(g=>g[1].map(a=>a[0])),AN=Object.fromEntries(ATTRS.flatMap(g=>g[1]));
const ATOP=new Set(['spd','str','awr']); // these three live on the player itself (older code reads them directly)
// position weights (relative). Built from how EA describes its ratings: overall = position-weighted attributes, awareness heavy
const OVR_W={
  QB:{thp:16,sac:18,dac:12,tup:10,awr:22,spd:4,acl:3,agi:3,car:2,sta:1},
  RB:{spd:14,acl:12,agi:10,car:12,elu:12,btk:10,str:5,cth:6,awr:10,pbk:2,sta:4},
  WR:{spd:16,acl:8,agi:8,cth:18,cit:8,rte:18,jmp:6,awr:12,elu:4,sta:2},
  TE:{cth:14,cit:8,rte:10,rbk:14,pbk:8,str:10,spd:8,acl:4,awr:14,sta:2},
  OL:{pbk:26,rbk:26,str:20,awr:18,agi:4,acl:4,sta:2},
  DL:{pmv:16,fmv:14,bsh:18,str:16,tak:12,awr:12,acl:8,spd:4,sta:2},
  LB:{tak:18,bsh:10,spd:10,acl:6,zcv:10,mcv:4,hpw:8,awr:22,str:8,pmv:2,fmv:2,sta:2},
  CB:{mcv:20,zcv:16,prs:8,spd:18,acl:8,agi:8,awr:12,tak:4,jmp:4,cth:2},
  S:{zcv:18,mcv:8,tak:12,hpw:6,spd:14,acl:6,awr:22,agi:6,jmp:4,cth:4},
  K:{kpw:45,kac:45,awr:10}};
// typical physical profile per position (what an average starter looks like before his rating moves it)
const APHYS={QB:{agi:-4,jmp:-6},RB:{agi:6,jmp:2},WR:{agi:6,jmp:6},TE:{agi:-4,jmp:0},OL:{agi:-18,jmp:-20,acl:-12},DL:{agi:-10,jmp:-12},LB:{agi:-2,jmp:-2},CB:{agi:8,jmp:5},S:{agi:4,jmp:4},K:{agi:-12,jmp:-14}};
function atv(p,k){if(ATOP.has(k)){if(!p.at&&p.pos){const v=atVirtual(p)['_'+k];if(v!=null)return v;}return p[k]!=null?p[k]:p.rat||50;}return p.at&&p.at[k]!=null?p.at[k]:atVirtual(p)[k];}
// players outside your program don't store their skills: they come from a seed of the player's id and are fitted to his
// overall, so the same player always shows the same numbers (and keeps them if he ever joins your team)
const _atC=new Map();
function atVirtual(p){const key=(p.id||0)+'|'+p.pos+'|'+(p.rat||50)+'|'+(p.spd||0)+'|'+(p.str||0)+'|'+(p.awr||0);let a=_atC.get(key);if(a)return a;
  if(_atC.size>30000)_atC.clear();const q={id:p.id,pos:p.pos,rat:clamp(p.rat||50,1,99),spd:p.spd,str:p.str,awr:p.awr,yr:p.yr,traits:p.traits};q.at=null;genAttrs(q);attrShift(q,q.rat);for(const k of ATOP)if(q[k]!==p[k])q.at['_'+k]=q[k];_atC.set(key,q.at);return q.at;}
function _atRnd(id,i){let h=((id||0)*2654435761^(i+1)*40503)>>>0;const u=()=>{h=(h+0x6D2B79F5)>>>0;let t=Math.imul(h^h>>>15,1|h);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};return(u()+u()+u()-1.5)*2;}
function ovrRaw(p){const W=OVR_W[p.pos]||OVR_W.WR;let s=0,t=0;for(const k in W){s+=W[k]*atv(p,k);t+=W[k];}return s/t;}
function ovrCalc(p){return clamp(Math.round(ovrRaw(p)),1,99);}
function genAttrs(p){
  const W=OVR_W[p.pos]||OVR_W.WR,mx=Math.max(...Object.values(W)),r=p.rat||50,tr=p.traits||[],ph=APHYS[p.pos]||{};p.at={};
  AK.forEach((k,i)=>{if(ATOP.has(k))return;const rel=(W[k]||0)/mx,g=_atRnd(p.id,i);let v;
    if(k==='acl')v=(p.spd||r)+(ph.acl||0)+g*4;
    else if(k==='agi'||k==='jmp')v=((p.spd||r)+r)/2+(ph[k]||0)+g*6;
    else if(k==='sta')v=50+((p.yr||10)-9)*2.5+r*0.25+g*8+(tr.includes('workhorse')?7:0)+(tr.includes('gym-rat')?3:0)-(tr.includes('lazy')?7:0);
    else v=r-(1-rel)*24-(rel===0?8:0)+g*(rel>0.4?5:7);
    p.at[k]=clamp(Math.round(v),12,99);});
}
// move the position's skills (not the measured speed / strength / awareness, not stamina) until the weighted overall hits `target`
function attrShift(p,target){
  const W=OVR_W[p.pos]||OVR_W.WR,T=Object.values(W).reduce((a,b)=>a+b,0),adj=Object.keys(W).filter(k=>!ATOP.has(k)&&k!=='sta');
  const set=(k,v)=>{v=clamp(Math.round(v),10,99);if(ATOP.has(k))p[k]=v;else p.at[k]=v;};
  // skills first; if they hit the floor or ceiling, awareness; then the measurables
  for(const extra of[[],['awr'],['spd','str']]){const ks=adj.concat(extra.filter(k=>W[k])),Wa=ks.reduce((a,k)=>a+W[k],0)||1;
    for(let it=0;it<4;it++){const need=target-ovrRaw(p);if(Math.abs(need)<0.5)break;const c=need*T/Wa;for(const k of ks)set(k,atv(p,k)+c);}
    // fine tune one point at a time on the heaviest ratings so the rounded overall lands exactly
    const byW=ks.slice().sort((a,b)=>W[b]-W[a]);
    for(let i=0;i<80&&ovrCalc(p)!==target;i++){const up=ovrCalc(p)<target,k=byW[i%byW.length],v=atv(p,k);if(up?v<99:v>10)set(k,v+(up?1:-1));}
    if(ovrCalc(p)===target)break;}
}
// your own players (and anyone you edit) keep their skills on the player: training and edits move them, and the overall follows
function ovrSync(p,force){
  if(!p||!p.pos||p.grad)return;
  if(!p.at){if(!force&&!(G&&p.sId===G.myId))return;const v=atVirtual(p);p.at={};for(const k in v){if(k[0]==='_')p[k.slice(1)]=v[k];else p.at[k]=v[k];}p.rat=ovrCalc(p);p._rc=p.rat;return;}
  if(p._rc!=null&&p.rat!==p._rc){const t=clamp(ovrCalc(p)+(p.rat-p._rc),1,99);attrShift(p,t);}  // progression moved the overall: spread it over the skills
  p.rat=ovrCalc(p);p._rc=p.rat;
  if(p.pot!=null&&p.rat>p.pot){p.pot=p.rat;if(p.potHi!=null&&p.potHi<p.rat)p.potHi=p.rat;}  // skills trained past the ceiling: the ceiling moves up, the rating stays
}
function ovrSyncAll(){if(!G||!G.players)return;const me=G.myId;for(const p of G.players)if(!p.grad&&(p.at||p.sId===me))ovrSync(p);}
// which three skills matter most for a position (shown on the card next to the overall)
function keyAttrs(pos){const W=OVR_W[pos]||OVR_W.WR;return Object.keys(W).filter(k=>k!=='awr').sort((a,b)=>W[b]-W[a]).slice(0,3);}
function attrColor(v){return v>=85?'var(--gn)':v>=70?'var(--tx)':v>=55?'var(--mu)':'#e5534b';}
function attrPanel(p,edit){
  const W=OVR_W[p.pos]||OVR_W.WR;
  return ATTRS.map(([g,list])=>{const rows=list.filter(([k])=>edit||W[k]||k==='sta'||ATOP.has(k)||atv(p,k)>=60);if(!rows.length)return'';
    return`<div style="margin-bottom:8px"><div style="font-weight:700;font-size:11px;color:var(--te);margin-bottom:3px">${g.toUpperCase()}</div>${rows.map(([k,n])=>{const v=atv(p,k),w=W[k];
      return edit?`<div class="fg" style="margin-bottom:4px"><label>${n}${w?` <span style="color:var(--te)">· ${Math.round(w/Object.values(W).reduce((a,b)=>a+b,0)*100)}% of OVR</span>`:''}</label><input class="ei at-in" type="number" data-k="${k}" value="${v}" min="1" max="99" oninput="atPrev()"></div>`
        :`<div class="dr"><span class="a">${n}${w?' <span style="color:var(--te);font-size:10px">●</span>':''}</span><span style="color:${attrColor(v)};font-weight:${w?700:400}">${v}</span></div>`;}).join('')}</div>`;}).join('');
}
// live overall preview while editing attributes
window.atPrev=function(){const pid=window._eqPid,p=getP(pid);if(!p)return;const q={id:p.id,pos:(document.getElementById('ep')||{}).value||p.pos,rat:p.rat,at:Object.assign({},p.at||atVirtual(p)),spd:p.spd,str:p.str,awr:p.awr};
  document.querySelectorAll('.at-in').forEach(i=>{const k=i.dataset.k,v=clamp(parseInt(i.value)||1,1,99);if(ATOP.has(k))q[k]=v;else q.at[k]=v;});
  const o=document.getElementById('at-ovr');if(o)o.textContent=ovrCalc(q);};

function adjDev(p,sch){
  if(!sch)return;
  // adjDev should only UPGRADE dev, never downgrade freshmen who already earned a good trait in genPlayer
  const rcLvl=(sch.staff&&sch.staff.rc)?sch.staff.rc.lvl:1;
  const pf=sch.prestige/5;
  const hf=sch.wins/(sch.wins+sch.losses+1);
  // Previous success bonus from school history (only relevant for player's own team)
  const hist=(G&&G.hist)||[];
  const prevWins=hist.filter(h=>h.wins>(h.losses||0)).length;
  const prevChamps=hist.filter(h=>h.champ||h.stateChamp).length;
  const successBonus=clamp((prevWins*0.015)+(prevChamps*0.04),0,0.18);
  // RC upgrade chance: higher RC level = better chance to bump dev up one tier
  const rcUpgradeChance=[0,0.04,0.09,0.15,0.22,0.32][clamp(rcLvl,1,5)];
  const env=pf*.5+hf*.2+Math.random()*.3;
  const cur=DEV.indexOf(p.dev);
  // Elite Dev: high-pot players only get upgraded, never downgraded
  if((p.potHi||p.pot)>=94){
    if(p.dev!=='Elite Dev'&&Math.random()<(.50+rcUpgradeChance+successBonus))p.dev='Elite Dev';
    return;
  }
  // Upgrade path: environment + RC level + prestige can push dev up one tier
  const upgradeThreshold=clamp(env*.5+rcUpgradeChance+pf*.15+successBonus,0,0.80);
  if(Math.random()<upgradeThreshold&&cur<3){
    p.dev=DEV[cur+1];
  }
  // Never downgrade freshmen, their dev earned in genPlayer is a floor
}

function cNeeds(sId){
  const pl=sPlayers(sId).filter(p=>p.yr<12);const cnt={};
  for(const pos of POS)cnt[pos]=0;for(const p of pl)cnt[p.pos]=(cnt[p.pos]||0)+1;
  const needs={};
  for(const[pos,b]of Object.entries(POS_CNT_BASE)){const h=cnt[pos]||0,w=b*.8;needs[pos]=h<w?2.5:h<w*1.5?1:.5;}
  return needs;
}

function genTeamPlayers(sch){
  const cfg=clsSz(sch.cls);const total=rng(cfg.r[0],cfg.r[1]);
  const sp=[.25,.25,.25,.25],yrs=[9,10,11,12];
  for(let y=0;y<4;y++){const cnt=Math.round(total*sp[y]);for(let i=0;i<cnt;i++){const p=genPlayer(sch.id,yrs[y],sch.cls,null);adjDev(p,sch);G.players.push(p);}}
}

// ═══════════ STAR DISTRIBUTION ═══════════
// Targets: 20×5★, 50×4★, 120×3★, 250×2★, 400×1★ spread across all teams
// Good teams get far more; bad teams get almost none
function distributeStars(){
  // stars follow the recruiting score (overall + development) from day one
  return;
  const STAR_TARGETS=[
    {s:5,total:20},{s:4,total:50},{s:3,total:120},{s:2,total:250},{s:1,total:400}
  ];
  // Tier weights: how likely a team is to receive stars at each level
  const TIER_W={good:{5:10,4:8,3:5,2:2,1:1},avg:{5:2,4:3,3:4,2:4,1:3},bad:{5:0,4:0.5,3:1,2:2,1:2}};
  // Classification multipliers for AI teams only, higher stars get progressively rarer in lower classes.
  // 5A is the top class so it gets no penalty. Lower classes are increasingly limited at elite star levels.
  // Format: [5★, 4★, 3★, 2★, 1★]
  const CLS_MULT={
    '5A':[1.00, 1.00, 1.00, 1.00, 1.00],
    '4A':[0.45, 0.60, 0.80, 0.95, 1.00],
    '3A':[0.15, 0.30, 0.60, 0.85, 1.00],
    '2A':[0.04, 0.12, 0.38, 0.72, 0.95],
    '1A':[0.00, 0.04, 0.18, 0.55, 0.90],
  };
  for(const {s,total} of STAR_TARGETS){
    const starIdx=5-s; // index 0=5★, 4=1★
    const minRat={5:70,4:62,3:54,2:44,1:34}[s]||30;
    const eligible=[];
    for(const p of G.players){
      if(p.sg>0)continue;
      if(p.rat<minRat)continue;
      const sch=getS(p.sId);
      const tier=sch?sch.tier:'avg';
      const isAI=sch&&sch.id!==G.myId; // only apply cls penalty to AI teams
      let w=(TIER_W[tier]||TIER_W['avg'])[s]||0;
      if(isAI&&w>0){
        const cls=sch.cls||'3A';
        const mult=(CLS_MULT[cls]||CLS_MULT['3A'])[starIdx];
        w*=mult;
      }
      if(w>0)eligible.push({p,w});
    }
    let remaining=Math.min(total,eligible.length);
    const pool=[...eligible];
    while(remaining>0&&pool.length>0){
      const totalW=pool.reduce((a,x)=>a+x.w,0);
      if(totalW<=0)break;
      let r=Math.random()*totalW;
      let idx=0;
      for(let i=0;i<pool.length;i++){r-=pool[i].w;if(r<=0){idx=i;break;}}
      pool[idx].p.sg=s;
      pool.splice(idx,1);
      remaining--;
    }
  }
}

