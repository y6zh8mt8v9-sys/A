// ═══════════ SIMULATION ═══════════
function calcTeamScore(myOvr,oppOvr,offS,defS,iWin,prestige){
  const offBonus={'Air Raid':8,'Spread':5,'Wing-T':-3,'Option':2,'I-Formation':1,'Pro Style':0}[offS]||0;
  const ovrDiff=myOvr-oppOvr; // positive = I'm better, negative = I'm weaker

  // Scoring base driven heavily by OVR gap.
  // Each OVR point advantage = ~1.1 pts. At +20 gap dominant team scores ~22 pts more.
  // At even OVR base is ~24 pts before variance.
  const gapScore=ovrDiff*1.1;

  // Variance shrinks as the gap grows (blowouts are more predictable)
  const absGap=Math.abs(ovrDiff);
  const varRange=clamp(16-absGap*0.30,3,16);
  const variance=rngF(-varRange,varRange);

  const base=clamp(24+gapScore+offBonus+variance,0,84);

  // Convert to football scores
  if(base<4)return 0;
  if(base<7)return Math.random()<0.5?3:0;

  const tds=Math.max(0,Math.round((base*0.82)/7));
  const fgs=rng(0,clamp(Math.round((base-tds*7)/4),0,3));
  let pts=tds*7+fgs*3;

  // High-OVR shootout: both elite teams can go back and forth for big scores
  const bothElite=(myOvr>72&&oppOvr>72);
  if(bothElite&&Math.random()<0.30)pts+=rng(7,14);

  // Blowout extension for dominant teams
  if(pts>=56&&Math.random()<0.20)pts+=7;
  if(pts>=63&&Math.random()<0.10)pts+=7;

  return clamp(pts,0,84);
}

function teamEffEdge(sId){try{
  const pl=(sId===G.myId?myP():sPlayers(sId)).filter(p=>!(p.inj>0));if(!pl.length)return 0;
  const best=pos=>pl.filter(p=>p.pos===pos).sort((a,b)=>{const ao=a.depth&&a.depth[pos]!=null?a.depth[pos]:999,bo=b.depth&&b.depth[pos]!=null?b.depth[pos]:999;return ao-bo||b.rat-a.rat;})[0];
  let e=0;const qb=best('QB'),rb=best('RB');
  if(qb){const s=qb.seasStats||{},cp=(s.passAtt||0)>=20?s.passCmp/s.passAtt:0.565+(qb.rat-60)*0.0042;e+=clamp((cp-0.53)*6,-0.6,0.6);}
  if(rb){const s=rb.seasStats||{},y=(s.rushAtt||0)>=20?s.rushYds/s.rushAtt:4.3+(rb.rat-60)*0.03;e+=clamp((y-4.5)*0.3,-0.5,0.6);}
  const kr=pl.filter(p=>['RB','WR','CB'].includes(p.pos)).sort((a,b)=>(b.spd||0)-(a.spd||0))[0];
  if(kr){const s=kr.seasStats||{},a=(s.krRet||0)>=4?s.krYds/s.krRet:16+((kr.spd||60)-60)*0.28;e+=clamp((a-20)*0.08,-0.6,0.8);}
  // receivers who drop the ball stall drives; corners who give up chunks get picked on; the line opens holes or lets the QB get hit
  let ch=0,dr=0;for(const p of pl)if(['WR','TE'].includes(p.pos)){const s=p.seasStats||{};ch+=(s.rec||0)+(s.drops||0);dr+=s.drops||0;}
  if(ch>=15)e-=clamp((dr/ch-0.07)*8,-0.3,0.6);
  const dbs=pl.filter(p=>p.pos==='CB'||p.pos==='S').filter(p=>(p.seasStats?.gp||0)>=2);
  if(dbs.length){const ya=dbs.reduce((a,p)=>a+(p.seasStats.ydsA||0)/p.seasStats.gp,0)/dbs.length,pb=dbs.reduce((a,p)=>a+(p.seasStats.pbu||0)/p.seasStats.gp,0)/dbs.length;e+=clamp((25-ya)*0.03,-0.6,0.5)+clamp((pb-0.35)*0.6,-0.2,0.4);}
  const ol=pl.filter(p=>p.pos==='OL'&&(p.seasStats?.gp||0)>=2);
  if(ol.length){const pk=ol.reduce((a,p)=>a+(p.seasStats.pancakes||0)/p.seasStats.gp,0)/ol.length,sa=ol.reduce((a,p)=>a+(p.seasStats.sacksA||0)/p.seasStats.gp,0);e+=clamp((pk-1.5)*0.3,-0.4,0.6)-clamp((sa-1.8)*0.25,-0.3,0.6);}
  return clamp(e,-3,3);}catch(err){return 0;}}
function simGame(idx,silent=false,forced=null){
  const game=G.sched[idx];if(!game||game.type!=='regular')return null;
  const opp=getS(game.oppId);
  const myOvr=(G.offR+G.defR)/2+progEdge(),oppOvr=teamOvr(opp.id);
  const offMod={'Spread':2,'Air Raid':4,'Wing-T':-1,'Option':1,'I-Formation':0,'Pro Style':0}[G.offS]||0;
  const defMod={'46':2,'4-3':1,'3-4':0,'Cover 2':0,'Flex':1}[G.defS]||0;
  const clutchPl=myP().filter(p=>p.traits.includes('clutch')||p.traits.includes('competitor')).length;
  const adjMy=myOvr+offMod*.5+defMod*.5+clutchPl*.3+teamEffEdge(G.myId);
  const adjOpp=oppOvr+({'Air Raid':4,'Spread':2,'Wing-T':-1,'Option':1,'I-Formation':0,'Pro Style':0}[opp.offS]||0)*.5+teamEffEdge(opp.id);
  const diff=(adjMy-adjOpp)/100;
  // RIVALRY penalty: 15-20% harder (accumulated +1% per year played against same rival, max +5%)
  const rivalGame=game.isRivalry||isRivalry(G.myId,opp.id);
  const rivalYrs=G.rivalHistory?.[opp.id]||0;
  const rivalPenalty=rivalGame?(0.15+Math.min(rivalYrs*0.01,0.05)):0;
  // Win probability based on OVR gap.
  // Upset chances for the underdog by gap size (raw OVR, not /100):
  //   >=25 gap → underdog wins ~1%  (favorite ~99%)
  //   >=20 gap → underdog wins ~2%  (favorite ~98%)
  //   >=15 gap → underdog wins ~3%  (favorite ~97%)
  //   >=10 gap → underdog wins ~5%  (favorite ~95%)
  //   >= 5 gap → underdog wins ~10% (favorite ~90%)
  //   < 5 gap  → normal close-game odds
  const rawGap=adjMy-adjOpp; // positive = I'm the favorite
  let winP;
  if(rawGap>=25)      winP=0.99;   // underdog has 1%
  else if(rawGap>=20) winP=0.98;   // underdog has 2%
  else if(rawGap>=15) winP=0.97;   // underdog has 3%
  else if(rawGap>=10) winP=0.95;   // underdog has 5%
  else if(rawGap>=5)  winP=0.90;   // underdog has 10%
  else if(rawGap<=-25) winP=0.01;  // I'm the big underdog, 1% chance
  else if(rawGap<=-20) winP=0.02;
  else if(rawGap<=-15) winP=0.03;
  else if(rawGap<=-10) winP=0.05;
  else if(rawGap<=-5)  winP=0.10;
  else{
    // Close game (gap < 5 either way): use smooth probability
    const diff2=rawGap/100;
    winP=clamp(.5+diff2*2.5+(G.prestige-3)*.02-rivalPenalty-0.07,0.30,0.70);
  }
  // Rivalry always makes it tougher for the favorite
  if(rivalGame) winP=clamp(winP-(rawGap>0?0.08:-0.08),0.01,0.99);
  // bad weather is the great equalizer: fewer points and more upsets
  const _wx=forced?null:gdWxFor('reg',{idx,opp}),_wf=wxSimF(_wx);winP=.5+(winP-.5)*_wf.upset;
  let iWin=Math.random()<winP;if(forced)iWin=forced.my>forced.opp;

  const _sc0=lgScore(adjMy,adjOpp,iWin),_sc=wxScale(_sc0[0],_sc0[1],_wf.sc);_sc[2]=_sc0[2];let myScore=_sc[0],oppScore=_sc[1];game.ot=_sc[2]?1:0;if(forced){myScore=forced.my;oppScore=forced.opp;game.ot=0;game.played=1;}

  game.result=iWin?'W':'L';game.my=myScore;game.opp=oppScore;
  if(iWin){G.wins++;myS().wins++;}else{G.losses++;myS().losses++;}
  if(iWin)opp.losses++;else opp.wins++;
  // Track rivalry history (years played against this opponent)
  if(rivalGame){if(!G.rivalHistory)G.rivalHistory={};G.rivalHistory[opp.id]=(G.rivalHistory[opp.id]||0)+1;try{rivalryAfter(opp,iWin,myScore,oppScore,silent);}catch(e){console.error('rivalry',e);}}

  const pl=myP().filter(p=>p.inj===0);
  const weekPops=[];
  window._wxPass=_wf.pass;let sm;try{sm=forced&&forced.sm?forced.sm:genStats(pl,myScore,iWin,G.offS,G.defS,G.myId,opp.id);}finally{window._wxPass=1;}
  glSet(game.wk,opp,myScore,oppScore,'reg');try{applyStats(sm);}finally{_glCtx=null;}gateAfter(opp,'reg',game.wk);
  checkStreaks(sm,silent?[]:weekPops,silent);
  checkRecs(sm,game.wk);
  try{storyGame(iWin,{opp:opp.name,my:myScore,op:oppScore,rival:rivalGame,sm,wk:game.wk});}catch(e){console.error('story',e);}
  try{progAfterGame(iWin,{rival:rivalGame,sm,margin:myScore-oppScore});progBattles(game.wk);}catch(e){console.error('program',e);}

  for(const p of pl){
    const injChance=(p.traits&&p.traits.includes('injury-prone')?0.06:0.025)*clamp(1.35-atv(p,'sta')/150,0.7,1.15); // v2.16 well-conditioned players get hurt less
    if(Math.random()<injChance){
      const inj=rollInjury(p,false);
      p.injName=inj.name;
      p.inj=inj.weeks;
      if(inj.isCareer){
        if(!silent)triggerCareerEndingInjury(p);
        addNews('careerinjury',' Career-Ending Injury',`${p.fn} ${p.ln} (${p.pos}) suffered a ${inj.name}. Their career is over.`);
      } else if(inj.isSeason){
        p.injSeason=true;
        if(!silent)weekPops.push(bEvPop(' Season-Ending Injury!',`<strong>${p.fn} ${p.ln}</strong> (${p.pos}) suffered a <strong>${inj.name}</strong> and is out for the season.`,face(p.fs,52),'var(--rd)'));
        addLog(`<span style="color:var(--rd)"> ${p.fn} ${p.ln}, ${inj.name} (Season-Ending)</span>`);
        addNews('injury',' Season-Ending Injury',`${p.fn} ${p.ln} (${p.pos}), ${inj.name}. Out for the season.`);
      } else {
        if(!silent)weekPops.push(bEvPop(' Injury',`<strong>${p.fn} ${p.ln}</strong> (${p.pos}) suffered a <strong>${inj.name}</strong> and is out <strong>${inj.weeks} week${inj.weeks!==1?'s':''}</strong>.`,face(p.fs,52),'var(--ac)'));
        addLog(`<span style="color:var(--te)"> ${p.fn} ${p.ln}, ${inj.name} (${inj.weeks}w)</span>`);
        addNews('injury',' Injury Report',`${p.fn} ${p.ln} (${p.pos}), ${inj.name}. Out ${inj.weeks} week${inj.weeks!==1?'s':''}.`);
      }
    }
  }
  for(const p of myP()){if(p.inj>0&&!p.injSeason&&!p.injCareer){p.inj--;if(p.inj===0){const nm=p.injName;p.injName=null;p.injSeason=false;if(nm&&!silent)weekPops.push(bEvPop(' Player Returns',`<strong>${p.fn} ${p.ln}</strong> (${p.pos}) has recovered from their <strong>${nm}</strong> and is back on the roster.`,face(p.fs,52),'var(--gn)'));if(nm&&!silent){addLog(`<span style="color:var(--gn)"> ${p.fn} ${p.ln}, returned from ${nm}</span>`);addNews('return',' Player Returns',`${p.fn} ${p.ln} (${p.pos}) is back after recovering from a ${nm}.`);}}}}
  for(const p of myP()){checkStarsOffers(p,silent?[]:weekPops,false);checkCommit(p);}
  try{campInviteWeek(game.wk,silent?null:weekPops);}catch(e){console.error('camps',e);}

  lgSimWeek(game.wk,opp.id,silent,oppScore,myScore,!iWin);
  try{weeklyAwards(game.wk,silent?null:weekPops);}catch(e){console.error('weekly awards',e);}
  try{gameInviteResolve(game.wk,silent?null:weekPops);}catch(e){console.error('game invites',e);}
  try{colNeedsWeek(silent?null:weekPops);}catch(e){console.error('college needs',e);}

  if(!silent){const ev=tryEvent(sm,iWin,myScore,oppScore);if(ev)weekPops.push(ev);}

  // ── League-wide news: interesting results from other same-class teams ──
  if(!silent){
    // Collect AI game scores this week for newsworthy items
    const _lgNews=[];
    for(const div of G.divisions){for(const s of div.teams){if(s.id===G.myId||!s.gl||s.gl.yr!==G.yr)continue;const e=s.gl.g.find(x=>x.wk===game.wk&&!x.po);if(!e||e.us<=e.them)continue;const o=getS(e.o);if(!o||o.id===G.myId)continue;const gap=teamOvr(s.id)-teamOvr(o.id);
      if(gap<=-8)_lgNews.push({type:'upset',headline:`Upset! ${s.name} ${s.mascot} beat ${o.name} ${o.mascot} ${e.us}-${e.them}`,sub:`Week ${game.wk} shocker in ${div.name}. The underdog delivers.`});
      else if(e.us-e.them>=28)_lgNews.push({type:'great',headline:`${s.name} ${s.mascot} rout the ${o.mascot} ${e.us}-${e.them}`,sub:`${s.name} improves to ${s.wins}-${s.losses}.`});}}
    // Other-league news: occasionally surface a notable result
    if(G.allLeagues&&Math.random()<0.35){
      for(const [cls,lg] of Object.entries(G.allLeagues)){
        for(const div of lg.divisions){
          const leader=[...div.teams].sort((a,b)=>(b.wins/(b.wins+b.losses||1))-(a.wins/(a.wins+a.losses||1)))[0];
          if(leader&&leader.wins>=4&&leader.losses===0){
            _lgNews.push({type:'general',icon:'',headline:`${leader.name} ${leader.mascot} unbeaten in ${clsName(cls)}`,sub:`${leader.wins}-${leader.losses} through Week ${game.wk}. Best record in ${clsName(cls)}.`});
            break;
          }
        }
        break; // only one other-league item per week
      }
    }
    // Pick at most 2 league news items to avoid spam
    const _pickedNews=_lgNews.sort(()=>Math.random()-.5).slice(0,2);
    for(const n of _pickedNews)addNews(n.type,n.headline,n.sub);
  }

  // ── In-season rating growth ──────────────────────────────────────────────
  // Players grow a small amount each game based on performance vs their potential.
  // The gap to pot drives growth; higher dev = more growth. Win gives a small bonus.
  for(const p of myP().filter(p=>p.inj===0)){
    const pst=sm[p.id];
    const gap=Math.max(0,effPot(p)-p.rat);
    if(gap<1)continue; // already at effective pot ceiling
    // Base: devTier * 0.04 of the gap, small random noise, win bonus
    const devMult={Normal:0.8,Impact:1.2,Star:1.6,'Elite Dev':2.2}[p.dev]||0.8;
    // Performance signal from game stats (if available)
    let perfBoost=0;
    if(pst){
      if(p.pos==='QB'&&(pst.passYds>200||pst.passTD>=2||((pst.passAtt||0)>=10&&pst.passCmp/pst.passAtt>=0.68)))perfBoost=0.015;
      else if((pst.krYds||0)>=80||(pst.krTD||0)>0||(p.pos==='RB'&&(pst.rushAtt||0)>=8&&pst.rushYds/pst.rushAtt>=6.5))perfBoost=0.015;
      else if((p.pos==='RB'||p.pos==='WR')&&(pst.rushYds>80||pst.recYds>80||pst.rushTD>=1||pst.recTD>=1))perfBoost=0.015;
      else if((p.pos==='DL'||p.pos==='LB')&&(pst.tackles>=6||pst.sacks>=1))perfBoost=0.015;
      else if((p.pos==='CB'||p.pos==='S')&&(pst.tackles>=4||pst.ints>=1))perfBoost=0.015;
    }
    const winBoost=iWin?0.008:0;
    const rawGain=((gap*0.022*devMult)+perfBoost+winBoost+rngF(-0.01,0.02))*(1+pcoachLvl(p.pos)*0.06);
    const gain=Math.max(0,rawGain);
    if(gain<0.5)continue; // only apply meaningful gains
    const prevRat=p.rat;
    p.rat=clamp(Math.round(p.rat+gain),p.rat,effPot(p));
    if(p.rat>prevRat){
      // Store season gain delta so UI can show highlight + "+N"
      p.ratGain=(p.ratGain||0)+(p.rat-prevRat);
    }
  }
  // ────────────────────────────────────────────────────────────────────────

  updateRats();
  addLog(`<span style="color:${iWin?'var(--gn)':'var(--te)'}">${iWin?'Win':'Loss'} vs ${opp.name} ${opp.mascot}: ${myScore}-${oppScore} (${game.date})</span>`);
  const sorted=Object.entries(sm).map(([pid,st])=>({p:getP(parseInt(pid)),st})).filter(x=>x.p);
  const tQB=sorted.filter(x=>x.p.pos==='QB').sort((a,b)=>b.st.passYds-a.st.passYds)[0];
  const tRB=sorted.filter(x=>x.p.pos==='RB').sort((a,b)=>b.st.rushYds-a.st.rushYds)[0];
  if(tQB)addLog(`&nbsp;&nbsp;<span style="color:var(--gd)">${tQB.p.fn} ${tQB.p.ln}: ${tQB.st.passYds} pass yds, ${tQB.st.passTD} TD</span>`);
  if(tRB)addLog(`&nbsp;&nbsp;<span style="color:var(--gd)">${tRB.p.fn} ${tRB.p.ln}: ${tRB.st.rushYds} rush yds, ${tRB.st.rushTD} TD</span>`);
  // News: game result
  if(iWin){
    const margin=myScore-oppScore;
    if(margin>=21)addNews('myteam',` Blowout! ${myS()?.mascot} ${myScore}–${oppScore}`,`Dominant win over ${opp.name} ${opp.mascot} in Week ${game.wk}.`);
    else addNews('myteam',` Win vs ${opp.name} ${opp.mascot} ${myScore}–${oppScore}`,`${myS()?.mascot} improve to ${G.wins}-${G.losses} this season.`);
  } else {
    addNews('bad',` Loss to ${opp.name} ${opp.mascot} ${oppScore}–${myScore}`,`${myS()?.mascot} fall to ${G.wins}-${G.losses}. Bounce back next week.`);
  }
  // News: big individual performances
  if(tQB&&tQB.st.passYds>=280){addNews('great',` ${tQB.p.fn} ${tQB.p.ln} Lights Up Scoreboard`,`${tQB.st.passYds} pass yds, ${tQB.st.passTD} TD in Week ${game.wk} ${iWin?'win':'loss'}.`);}
  if(tRB&&tRB.st.rushYds>=150){addNews('great',` ${tRB.p.fn} ${tRB.p.ln} Rushes for ${tRB.st.rushYds} Yards`,`Dominant ground performance in Week ${game.wk}.`);}

  G.week=game.wk;
  if(!silent&&weekPops.length){_popQ=weekPops;_popI=0;showPop();}
  return game;
}

