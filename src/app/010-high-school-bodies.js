// ═══════════ v2.06 HIGH SCHOOL BODIES ═══════════
// Average senior on an average varsity roster (typical prep rosters: linemen ~6'1"-6'2" and 235-255 lb, skill players 5'9"-6'0"),
// younger classes are smaller. Strong programs (prestige, big classification, a deep roster, winning, a good recruiting coordinator)
// carry bigger kids; the weight room and practice field decide how much they put on each year. Every roster has outliers both ways.
const HS_BODY={QB:[72.5,185],RB:[69.5,180],WR:[71.5,170],TE:[74,215],OL:[73.5,255],DL:[73,235],LB:[71.5,200],CB:[70,165],S:[71,178],K:[70.5,168]};
const HS_H_OFF={12:0,11:-0.6,10:-1.4,9:-2.3,8:-3.3},HS_W_OFF={12:0,11:-0.055,10:-0.12,9:-0.19,8:-0.26};
const HS_W_SD={QB:12,RB:13,WR:11,TE:15,OL:24,DL:20,LB:14,CB:10,S:11,K:13},HS_LB_IN={OL:7,DL:6,TE:6};
const HS_LIM={QB:[64,79,120,250],RB:[61,75,115,250],WR:[62,79,110,225],TE:[66,80,145,290],OL:[65,81,160,375],DL:[65,80,150,350],LB:[64,77,130,270],CB:[61,76,105,215],S:[63,77,115,230],K:[62,77,105,240]};
function hsMean(pos,yr){const B=HS_BODY[pos]||HS_BODY.WR,y=clamp(yr||12,8,12);return[B[0]+HS_H_OFF[y],B[1]*(1+HS_W_OFF[y])];}
let _tbCache=null;
function _facOf(s){return s&&s.id===G.myId&&G.fac?G.fac:(s&&s.fac)||{};}
function _rcOf(s){const st=s&&s.id===G.myId&&G.staff?G.staff:(s&&s.staff);return(st&&st.rc&&st.rc.lvl)||1;}
function teamBodyF(s){
  if(!s)return{h:0,w:0,g:1,rc:0};
  const key=(G.yr||1)+'|'+(G.week||0)+'|'+(G.phase||'');if(!_tbCache||_tbCache.key!==key)_tbCache={key,m:new Map()};
  let f=_tbCache.m.get(s.id);if(f)return f;
  const pr=s.id===G.myId?(G.prestige||1):(s.prestige||1),ce={'5A':[0.45,6],'4A':[0.2,3],'3A':[0,0],'2A':[-0.3,-4],'1A':[-0.6,-8]}[clsEq(s.cls)]||[0,0];
  const ti={good:[0.2,3],avg:[0,0],bad:[-0.2,-3]}[s.tier]||[0,0],g=(s.wins||0)+(s.losses||0),wp=g?((s.wins||0)/g-0.5):0;
  let ov=0;try{const n=sPlayers(s.id).length;if(n>=11){const mean=XCLS[s.cls]?XCLS[s.cls].mean:({'5A':64,'4A':60,'3A':56,'2A':52,'1A':48}[clsEq(s.cls)]||56);ov=clamp((teamOvr(s.id)-mean)/10,-1.5,1.5);}}catch(e){}
  const fa=_facOf(s),wr=clamp(fa.weight||1,1,10),pf=clamp(fa.train||1,1,10);
  f={h:(pr-3)*0.3+ce[0]+ti[0]+ov*0.25,w:(pr-3)*4+ce[1]+ti[1]+ov*3+wp*4+(wr-1)*1.2,g:1+(wr-1)*0.07+(pf-1)*0.035+wp*0.1,rc:_rcOf(s)-1};
  _tbCache.m.set(s.id,f);return f;
}
function _hsClamp(p,loose){const L=loose?HS_LIM_ALL:(HS_LIM[p.pos]||HS_LIM.WR);p.ht=clamp(Math.round(p.ht),L[0],L[1]);p.wt=clamp(Math.round(p.wt),L[2],L[3]);}
// v2.15: a player moved to a new position keeps his body; growth only stops at the limits of any high school position
const HS_LIM_ALL=Object.values(HS_LIM).reduce((a,l)=>[Math.min(a[0],l[0]),Math.max(a[1],l[1]),Math.min(a[2],l[2]),Math.max(a[3],l[3])],[99,0,999,0]);
// a new player: classmates of the same position spread around the class average; the recruiting coordinator brings in bigger kids
function bodyNew(p,s){
  if(!p||!p.pos)return p;s=s||getS(p.sId);const F=teamBodyF(s),[mh,mw]=hsMean(p.pos,p.yr);
  const rc=(p.yr||12)<=9?F.rc:F.rc*0.4;
  let dh=gaussR()*2.1;const r=Math.random();if(r<0.025)dh+=3+Math.random()*2.5;else if(r<0.04)dh-=2.5+Math.random()*2;  // the odd giant, the odd small guy
  p.ht=mh+F.h+rc*0.12+dh;
  let dw=gaussR()*(HS_W_SD[p.pos]||12);const r2=Math.random();if(r2<0.03)dw+=(HS_W_SD[p.pos]||12)*2.2;else if(r2<0.05)dw-=(HS_W_SD[p.pos]||12)*1.4;
  p.wt=mw+F.w+rc*1.5+(p.ht-mh)*(HS_LB_IN[p.pos]||5)+dw;
  _hsClamp(p);return p;
}
// one year older: most of the growth spurt is in the first two years, some kids are late bloomers; strength work adds the weight
function bodyGrow(p,s){
  if(!p||!p.pos||!p.ht)return;s=s||getS(p.sId);const F=teamBodyF(s),y=clamp(p.yr||12,9,12);
  const[h1]=hsMean(p.pos,y),[h0]=hsMean(p.pos,y-1),[,w1]=hsMean(p.pos,y),[,w0]=hsMean(p.pos,y-1);
  const dh=Math.max(0,(h1-h0)*(0.35+Math.random()*1.3));
  const tr=p.traits||[],tw=(tr.includes('gym-rat')?4:0)+(tr.includes('workhorse')?2:0)-(tr.includes('lazy')?5:0);
  const dw=(w1-w0)*F.g*(0.55+Math.random()*0.9)+dh*(HS_LB_IN[p.pos]||5)+tw;
  p.ht+=dh;p.wt+=dw;_hsClamp(p,true);
}
// older saves: map every current player onto the high school scale once, keeping who is big and who is small on each roster
function bodyMigrate(){
  if(G.bodyV>=2)return;const hb={QB:74,RB:70,WR:72,TE:76,OL:76,DL:75,LB:73,CB:70,S:71,K:71},wb={QB:215,RB:210,WR:188,TE:245,OL:285,DL:268,LB:235,CB:182,S:198,K:182};
  for(const p of G.players){if(p.grad||!p.pos||!HS_BODY[p.pos])continue;const s=getS(p.sId),F=teamBodyF(s),[mh,mw]=hsMean(p.pos,p.yr);
    const zh=(p.ht||hb[p.pos])-hb[p.pos],zw=(p.wt||wb[p.pos])-wb[p.pos];
    p.ht=mh+F.h+zh*0.75;p.wt=mw+F.w+zw*0.9*(HS_W_SD[p.pos]||12)/12+(p.ht-mh)*(HS_LB_IN[p.pos]||5);_hsClamp(p);}
  G.bodyV=2;
}
function genPlayer(sId,yr,cls,needs){
  const pool=[];
  for(const[p,b]of Object.entries(POS_CNT_BASE)){const n=needs&&needs[p]?needs[p]:1;const w=Math.round(b*n);for(let i=0;i<w;i++)pool.push(p);}
  const pos=pick(pool)||'WR';
  // Use classification + tier to determine base rating range
  // allSchoolsAll() is used so that other-classification teams are found with their correct tier
  const sch=(G&&G.divisions)?getS(sId)||null:null;
  const tier=sch?sch.tier:'avg';
  const schCls=sch?sch.cls:(G?G.cls:'3A');
  // ── Per-classification floor/ceiling (15% weight) ──
  // Wider overlapping bands so a bad 5A can sit near a good 4A.
  const CLS_BAND={'5A':[48,99],'4A':[40,94],'3A':[32,89],'2A':[24,83],'1A':[18,77]};
  const [cMin,cMax]=CLS_BAND[clsEq(schCls)]||[28,77];
  const cRange=cMax-cMin;
  // Classification component: midpoint of band (0-1 within range)
  const clsMid=cMin+cRange*0.5;
  const clsFactor=0.15; // 15% weight

  // ── Previous season success + SOS (65% weight) ──
  // Uses last season's record from G.hist (if available) for player's own team.
  // For AI teams, uses current wins/losses + division proxy SOS.
  let successScore=0.5; // default middle
  if(sId===G.myId){
    const hist=(G&&G.hist)||[];
    const lastSeason=hist.length?hist[hist.length-1]:null;
    if(lastSeason){
      const totalGames=(lastSeason.wins||0)+(lastSeason.losses||0);
      const winPct=totalGames>0?(lastSeason.wins||0)/totalGames:0.5;
      // Win% maps to 0-0.85: .500=0.43, 1.000=0.85
      const winComponent=clamp(winPct*0.85,0,0.85);
      // Championship bonus: div champ +0.08, state champ +0.15
      const champBonus=(lastSeason.stateChamp?0.15:0)+(lastSeason.champ?0.08:0);
      // SOS bonus: tough (≥70) or elite (≥80) schedule adds up to +0.15
      const lastSOS=(G.lastSeasonSOS!=null)?G.lastSeasonSOS:50;
      const sosBonus=lastSOS>=80?0.15:lastSOS>=70?0.10:0;
      successScore=clamp(winComponent+champBonus+sosBonus,0,1);
    }
  } else {
    // AI teams: use current season record as proxy
    const aiWins=sch?sch.wins:0, aiLosses=sch?sch.losses:0;
    const totalAI=aiWins+aiLosses;
    const aiWinPct=totalAI>0?aiWins/totalAI:0.5;
    const aiSOSProxy=tier==='good'?72:tier==='bad'?44:57;
    const aiSosBonus=aiSOSProxy>=70?0.10:0;
    successScore=clamp(aiWinPct*0.85+aiSosBonus,0,1);
  }
  const successFactor=0.65; // 65% weight

  // ── Facilities / Training Level (20% weight) ──
  // trainFactor() returns 0→1 for levels 1→20 (player's school).
  let facilScore=0;
  if(sId===G.myId){
    facilScore=trainFactor(); // 0 at lvl 1, 1.0 at lvl 20
  } else {
    // AI proxy: good=0.55, avg=0.30, bad=0.10
    facilScore=tier==='good'?0.55:tier==='bad'?0.10:0.30;
  }
  const facilFactor=0.20; // 20% weight

  // ── Combine into a 0-1 score, then map into classification band ──
  // ── v1.92: every classification has elite and weak programs; the class sets the average ──
  // team strength q (0 weak … 1 elite) comes from the program's tier, nudged by recent results;
  // player rating = class average + team strength + class year + individual spread
  const q=teamQ(sch,sId,successScore,facilScore);
  const clsMean=XCLS[schCls]?XCLS[schCls].mean:({'5A':64,'4A':60,'3A':56,'2A':52,'1A':48}[schCls]||56);
  const yrAdj=((yr||10.5)-10.5)*3;
  let base=Math.round(clamp(clsMean+(q-0.5)*24+yrAdj+gaussR()*6.5,22,95));
  // Potential is now a range [potLo, potHi]. The player may reach anywhere in that range
  // depending on training level and performance over their career.
  const potSpread=rng(8,20); // gap between lo and hi
  const potLo=clamp(base+rng(3,12),base,99);
  const potHi=clamp(potLo+potSpread,potLo,99);
  const pot=potLo; // effective pot starts at low end; grows with training/perf
  // RC level (1-5), prestige (1-5), and previous success all boost dev trait chances
  const rcLvl=(G&&G.staff&&sId===G.myId)?G.staff.rc.lvl:(sch&&sch.staff)?sch.staff.rc.lvl:1;
  const schPrestige=(sch?sch.prestige:1);
  // Previous success: count winning seasons + championships from history
  const hist=(G&&G.hist)||[];
  const prevWins=hist.filter(h=>h.wins>(h.losses||0)).length;
  const prevChamps=hist.filter(h=>h.champ||h.stateChamp).length;
  const successBonus=clamp((prevWins*0.02)+(prevChamps*0.05),0,0.20);
  // RC bonus: lvl 1→0, lvl 2→0.04, lvl 3→0.08, lvl 4→0.13, lvl 5→0.20
  const rcBonus=[0,0,0.04,0.08,0.13,0.20][clamp(rcLvl,1,5)];
  // Prestige bonus: 0 at prestige 1, up to 0.10 at prestige 5
  const prestigeBonus=clamp((schPrestige-1)*0.025,0,0.10);
  const devBoost=rcBonus+prestigeBonus+successBonus;
  let dev='Normal';
  const tr=Math.random();
  if(potHi>=94&&tr<(.50+devBoost))dev='Elite Dev';
  else if(potHi>=85&&tr<(.35+devBoost))dev='Star';
  else if(potHi>=75&&tr<(.30+devBoost))dev='Impact';
  else if(potHi>=65&&tr<(.12+devBoost))dev='Impact'; // RC/prestige can unlock Impact for good-not-great prospects
  const tCnt=rng(1,3);const traits=[];const tp=[...TRAITS];
  for(let i=0;i<tCnt;i++){if(!tp.length)break;const idx=rng(0,tp.length-1);traits.push(tp.splice(idx,1)[0].k);}
  const isAc=traits.includes('academic');
  const gpa=clamp(parseFloat((rng(15,40)/10+(isAc?rng(3,8)/10:0)).toFixed(1)),1.5,4.0);
  const hb={QB:74,RB:70,WR:72,TE:76,OL:76,DL:75,LB:73,CB:70,S:71,K:71};
  const wb={QB:215,RB:210,WR:188,TE:245,OL:285,DL:268,LB:235,CB:182,S:198,K:182};
  const id=_pId++;
  const schOffS=sch?sch.offS:'Pro Style',schDefS=sch?sch.defS:'4-3';
  const arch=pickArchetype(pos,schOffS,schDefS);
  return{id,sId,pos,yr,fn:pick(FN),ln:pick(LN),rat:base,pot,potLo,potHi,dev,traits,gpa,mood:pick(['high','good','good','neutral','neutral','neutral','low']),morale:rng(55,90),spd:rng(40,80),str:rng(40,80),awr:rng(38,78),stats:emS(),seasStats:emS(),carStats:emS(),stars:0,offers:[],committed:null,inj:0,ht:clamp((hb[pos]||72)+rng(-3,3),62,82),wt:clamp((wb[pos]||210)+rng(-18,18),155,355),num:posN(pos,sId),sp:0,camp:false,wl:false,hof:false,fs:id,depth:{},interests:genInterests(),arch:arch,streak:null,streakUsed:false,streakGamesLeft:0,perfHistory:[],dreamSchool:genDreamSchool(dev,pot,pos)};}
const _genPlayer0=genPlayer;
genPlayer=function(sId,yr,cls,needs){const p=_genPlayer0(sId,yr,cls,needs);try{bodyNew(p,getS(sId));}catch(e){}try{xStylePlayer(p,getS(sId));}catch(e){}return p;};
