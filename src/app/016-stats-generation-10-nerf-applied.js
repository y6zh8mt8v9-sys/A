// ═══════════ STATS GENERATION (10% nerf applied to all output values) ═══════════
const STAT_NERF=0.9;

// Apply archetype + scheme + streak multiplier to a stat value
function applyArchMod(p,stat,val,offScheme,defScheme){
  if(!p||p.pos==='OL'||p.pos==='K')return val;
  const key=archModKey(p.pos,p.arch||'');
  const mod=ARCH_STAT_MOD[key];
  let mult=mod&&mod[stat]!==undefined?mod[stat]:1.0;
  // scheme fit bonus
  const scheme=(p.pos==='DL'||p.pos==='LB'||p.pos==='CB'||p.pos==='S')?defScheme:offScheme;
  mult*=archSchemeMult(p.arch||'',scheme);
  // streak multiplier (hot=1.18, cold=0.82)
  if(p.streak==='hot'&&p.streakGamesLeft>0)mult*=1.18;
  else if(p.streak==='cold'&&p.streakGamesLeft>0)mult*=0.82;
  return Math.max(0,Math.round(val*mult));
}

// v2.06 pass rush vs the opponent's pass protection: a front that is better than the line it faces gets home more often
function _prSc(p){return p.rat*0.5+(p.spd||p.rat)*0.25+(p.str||p.rat)*0.25;}
function _pbSc(p){return p.rat*0.55+(p.str||p.rat)*0.3+(p.awr||p.rat)*0.15;}
function sackMult(rushers,oppId){
  if(oppId==null||!rushers.length)return 1;
  const dOf=(p,k)=>p.depth&&p.depth[k]!==undefined?p.depth[k]:999;
  const ol=sPlayers(oppId).filter(p=>p.pos==='OL'&&!(p.inj>0)).sort((a,b)=>dOf(a,'OL')-dOf(b,'OL')||b.rat-a.rat).slice(0,5);
  if(!ol.length)return 1.8;
  const pr=rushers.reduce((a,p)=>a+_prSc(p),0)/rushers.length,pb=ol.reduce((a,p)=>a+_pbSc(p),0)/ol.length;
  return clamp(Math.exp((pr-pb)*0.045),0.4,2.6);
}
function _pois(l){let k=0,pr=1;const L=Math.exp(-l);do{k++;pr*=Math.random();}while(pr>L&&k<12);return k-1;}
function genStats(players,teamScore,won,offScheme,defScheme,schId,oppId){
  const stats={};
  const cnt=getStarterCnt(schId);
  const byPos={};for(const p of players){if(!byPos[p.pos])byPos[p.pos]=[];byPos[p.pos].push(p);}
  for(const pos in byPos)byPos[pos].sort((a,b)=>{
    const ao=a.depth&&a.depth[pos]!==undefined?a.depth[pos]:999;
    const bo=b.depth&&b.depth[pos]!==undefined?b.depth[pos]:999;
    if(ao!==bo)return ao-bo;return b.rat-a.rat;
  });
  // two-way players also line up at their second position (where the depth chart puts them); your own Player Career player starts there when he starts
  for(const p of players){if(!pcTwo(p))continue;const L=byPos[p.pos2]||(byPos[p.pos2]=[]);L.push(p);depthOrder(L,p.pos2);if(pcOwnPick(p))try{if(pcRole(p).start){L.splice(L.indexOf(p),1);L.unshift(p);}}catch(e){}}
  const starter=(pos,n=0)=>byPos[pos]&&byPos[pos][n]?byPos[pos][n]:null;
  function sc(p,base,spread){if(!p)return 0;const r=(p.rat-55)/50;const sb=p.traits&&p.traits.includes('showboat')&&Math.random()<.35?1.25:1;return Math.max(0,Math.round((base+r*spread+rng(-Math.round(spread*.22),Math.round(spread*.22)))*sb*STAT_NERF));}

  const fg=rng(0,2);const pts=Math.max(7,teamScore-fg*3);
  let totalTDs=Math.max(1,Math.round(pts/7));
  // kick returns: the two fastest RB / WR / CB field kickoffs; speed and vision set the average, a burner can take one back
  const krSt={},krs=players.filter(p=>['RB','WR','CB'].includes(p.pos)&&!(p.inj>0)).sort((a,b)=>(b.spd||0)-(a.spd||0)||b.rat-a.rat).slice(0,2);
  if(krs.length){const nK=rng(1,3)+(won?rng(0,1):rng(1,2));
    for(let k=0;k<nK;k++){const r=k&&krs[1]&&Math.random()<0.28?krs[1]:krs[0],sp=r.spd||60,o=krSt[r.id]||(krSt[r.id]={krRet:0,krYds:0,krTD:0});
      const shifty=['Shifty','Track Speed','Speedster','Gadget','Big Play'].includes(r.arch)?1.5:0;
      const tdP=clamp(0.003+(sp-72)*0.0008+(r.rat-60)*0.0002+shifty*0.001,0.001,0.025);
      o.krRet++;if(totalTDs>=2&&Math.random()<tdP){o.krTD++;o.krYds+=rng(80,100);totalTDs--;}
      else o.krYds+=clamp(Math.round(16+(sp-60)*0.28+(r.rat-60)*0.06+shifty+gaussR()*7),0,65);}}
  const isAR=offScheme==='Air Raid',isSp=offScheme==='Spread',isWT=['Wing-T','Option'].includes(offScheme),isIF=offScheme==='I-Formation';

  // QB archetype influences rush/pass split
  const qb=starter('QB');
  const qbArch=qb?qb.arch||'Field General':'Field General';
  const qbIsRunner=['Pure Runner','Scrambler','Tank'].includes(qbArch);
  const qbIsGunslinger=qbArch==='Gunslinger';

  const rushTDPctBase=isAR?.10:isSp?.25:isWT?.60:isIF?.45:.40;
  const rushTDPct=qbIsRunner?Math.min(rushTDPctBase+0.12,0.75):qbIsGunslinger?Math.max(rushTDPctBase-0.08,0.05):rushTDPctBase;
  const rushTDs=clamp(Math.round(totalTDs*rushTDPct+rng(-1,1)),0,totalTDs);
  const passTDs=totalTDs-rushTDs;

  const passBaseRaw=isAR?290:isSp?230:isWT?110:isIF?150:190;
  let totalPassYds=0,qbCp=0.55;
  if(qb){
    const qbRat=(qb.rat-55)/50;
    let passYdsRaw=clamp(Math.round((passBaseRaw+qbRat*80+rng(-40,60))*STAT_NERF),Math.max(0,passTDs*5),Math.round(450*STAT_NERF));
    passYdsRaw=applyArchMod(qb,'passYds',passYdsRaw,offScheme,defScheme);
    if(window._wxPass&&window._wxPass<1)passYdsRaw=Math.max(passTDs*5,Math.round(passYdsRaw*window._wxPass));
    // completion %: rating, awareness, archetype and scheme; accurate passers move the chains and throw fewer picks
    qbCp=clamp(0.565+(qb.rat-60)*0.0042+((qb.awr||60)-60)*0.0012+({'Field General':0.03,'Gunslinger':-0.03,'Pure Runner':-0.05,'Scrambler':-0.02,'Tank':-0.02}[qbArch]||0)+(isAR?0.02:isWT||offScheme==='Option'?-0.03:0)+gaussR()*0.05,0.36,0.8);
    passYdsRaw=Math.max(passTDs*5,Math.round(passYdsRaw*clamp(1+(qbCp-0.55)*0.7,0.82,1.18)));
    totalPassYds=passYdsRaw;
    const passInt=Math.max(0,rng(0,qb.rat>65?1:2)+(qbCp<0.45&&Math.random()<0.35?1:0)-(qbCp>0.66&&Math.random()<0.4?1:0));

    // QB rushing stats, always generated, scaled by archetype
    const qbRushBase=qbArch==='Pure Runner'?70:qbArch==='Scrambler'?45:qbArch==='Tank'?30:qbArch==='Field General'?12:15;
    const qbRushSchMult=isWT?1.4:isSp?1.2:isAR?0.8:isIF?1.1:1.0;
    let qbRushYds=Math.max(0,Math.round((qbRushBase+rng(-8,20))*qbRushSchMult*STAT_NERF));
    qbRushYds=applyArchMod(qb,'rushYds',qbRushYds,offScheme,defScheme);
    const qbRushTD=qbIsRunner&&rushTDs>0?Math.min(rng(0,2),rushTDs):Math.random()<(qbIsRunner?0.35:0.12)?1:0;
    const passTDmod=Math.max(0,applyArchMod(qb,'passTD',passTDs,offScheme,defScheme));
    stats[qb.id]={passYds:passYdsRaw,passTD:passTDmod,passInt,rushYds:qbRushYds,rushTD:qbRushTD};
  }

  // Spread TDs across receivers with per-player cap of 2
  let recTDsLeft=passTDs;
  const wrCount=Math.min(byPos.WR?.length||0,cnt.WR||2);
  const wrShares=isAR?[.35,.26,.20,.13]:[.38,.26,.18,.10];
  let passYdsLeft=totalPassYds;

  // RB receiving weight, boosted for Receiving Back archetype
  const rb0=byPos.RB&&byPos.RB[0];
  const rb0IsRecBack=rb0&&rb0.arch==='Receiving Back';
  const rbRecWgt=rb0IsRecBack?2.2:isAR?1.4:isSp?1.2:0.8;

  const recPool=[];
  if(byPos.WR){
    for(let i=0;i<Math.min(byPos.WR.length,4);i++){
      const wgt=i===0?3.0:i===1?2.0:i===2?1.0:0.5;
      recPool.push({p:byPos.WR[i],wgt,type:'WR',idx:i});
    }
  }
  if(byPos.TE&&byPos.TE[0]&&cnt.TE>0){
    const teArch=byPos.TE[0].arch||'Sure Hands';
    const teWgt=teArch==='Athletic Freak'?2.2:teArch==='Hybrid'?1.8:teArch==='Blocker'?0.6:1.5;
    recPool.push({p:byPos.TE[0],wgt:teWgt,type:'TE',idx:0});
  }
  if(rb0)recPool.push({p:rb0,wgt:rbRecWgt,type:'RB_rec',idx:0});

  const tdCounts={};
  for(const item of recPool)tdCounts[item.p.id]=0;
  let safetyBreak=0;
  while(recTDsLeft>0&&safetyBreak<50){
    safetyBreak++;
    const eligible=recPool.filter(item=>tdCounts[item.p.id]<2);
    if(!eligible.length)break;
    const totalWgt=eligible.reduce((s,e)=>s+e.wgt,0);
    let roll=Math.random()*totalWgt,chosen=null;
    for(const e of eligible){roll-=e.wgt;if(roll<=0){chosen=e;break;}}
    if(!chosen)chosen=eligible[0];
    tdCounts[chosen.p.id]=(tdCounts[chosen.p.id]||0)+1;
    recTDsLeft--;
  }
  // Overflow rec TDs go to QB scramble
  if(recTDsLeft>0&&qb&&stats[qb.id]){
    stats[qb.id].rushYds=(stats[qb.id].rushYds||0)+Math.round(recTDsLeft*9*STAT_NERF);
    stats[qb.id].rushTD=(stats[qb.id].rushTD||0)+recTDsLeft;
    recTDsLeft=0;
  }

  for(let i=0;i<(byPos.WR?.length||0);i++){
    const wr=byPos.WR[i];
    if(i<wrCount){
      const share=wrShares[i]||.05;
      const recTD=tdCounts[wr.id]||0;
      const minYds=recTD*rng(8,22);
      let baseYds=Math.round(passYdsLeft*(share*(0.8+Math.random()*.4))*STAT_NERF);
      baseYds=applyArchMod(wr,'recYds',baseYds,offScheme,defScheme);
      const recY=Math.max(minYds,baseYds);
      passYdsLeft=Math.max(0,passYdsLeft-Math.round(recY/STAT_NERF));
      const recTDmod=applyArchMod(wr,'recTD',recTD,offScheme,defScheme);
      // Gadget WR: small rush contribution
      const wrRushYds=(wr.arch==='Gadget'&&Math.random()<0.3)?applyArchMod(wr,'rushYds',rng(5,25),offScheme,defScheme):0;
      stats[wr.id]={recYds:recY,recTD:recTDmod,...(wrRushYds>0?{rushYds:wrRushYds,rushTD:0}:{})};
    } else if(Math.random()<.25){stats[wr.id]={recYds:rng(0,Math.round(15*STAT_NERF)),recTD:tdCounts[wr.id]||0};}
  }

  if(byPos.TE&&byPos.TE[0]&&cnt.TE>0){
    const te=byPos.TE[0];
    const teTD=tdCounts[te.id]||0;
    const minYds=teTD*rng(6,18);
    let baseYds=Math.round(totalPassYds*.10*(0.7+Math.random()*.5)*STAT_NERF);
    baseYds=applyArchMod(te,'recYds',baseYds,offScheme,defScheme);
    const tY=Math.max(minYds,baseYds);
    const teTDmod=applyArchMod(te,'recTD',teTD,offScheme,defScheme);
    stats[te.id]={recYds:Math.max(0,tY),recTD:teTDmod};
  }

  const rbStarters=cnt.RB||1;
  if(byPos.RB){
    const rushBase=isAR?45:isWT?130:isIF?110:80;
    let rbTDsLeft=rushTDs;
    for(let i=0;i<byPos.RB.length;i++){
      const rbp=byPos.RB[i];
      if(i===0){
        let rushYds=sc(rbp,rushBase,50);
        rushYds=applyArchMod(rbp,'rushYds',rushYds,offScheme,defScheme);
        let rbTD=rbTDsLeft>0?Math.min(rbTDsLeft,rng(0,Math.min(rbTDsLeft,3))):0;
        rbTDsLeft-=rbTD;
        rbTD=applyArchMod(rbp,'rushTD',rbTD,offScheme,defScheme);
        const rbRecTD=tdCounts[rbp.id]||0;
        const minRushYds=rbTD*rng(5,15);
        // RB receiving yards, always generated, Receiving Back gets much more
        const rbRecBase=rb0IsRecBack?(isAR?65:isSp?55:35):isAR?22:isSp?18:8;
        let rbRecYds=Math.max(0,Math.round((rbRecBase+rng(-5,15))*STAT_NERF));
        rbRecYds=applyArchMod(rbp,'recYds',rbRecYds,offScheme,defScheme);
        const rbRecTDmod=applyArchMod(rbp,'recTD',rbRecTD,offScheme,defScheme);
        stats[rbp.id]={rushYds:Math.max(minRushYds,rushYds),rushTD:rbTD,recYds:rbRecYds,recTD:rbRecTDmod};
      } else if(i===1&&rbStarters>=2){
        let rushYds=Math.max(0,Math.round((stats[byPos.RB[0]?.id]?.rushYds||30)*.22+rng(-5,10)));
        rushYds=applyArchMod(rbp,'rushYds',rushYds,offScheme,defScheme);
        const rbTD=rbTDsLeft>0&&Math.random()<.3?1:0;if(rbTD)rbTDsLeft--;
        const minRushYds=rbTD*rng(4,12);
        stats[rbp.id]={rushYds:Math.max(minRushYds,rushYds),rushTD:rbTD};
      } else if(Math.random()<.2){stats[rbp.id]={rushYds:rng(0,Math.round(10*STAT_NERF)),rushTD:0};}
    }
    if(rbTDsLeft>0&&qb&&stats[qb.id]){
      stats[qb.id].rushYds=(stats[qb.id].rushYds||0)+Math.round(rbTDsLeft*8*STAT_NERF);
      stats[qb.id].rushTD=(stats[qb.id].rushTD||0)+rbTDsLeft;
    }
  }

  // ── catches from yards per catch, completions / attempts from catches and accuracy, carries from yards per carry ──
  {const olL=(byPos.OL||[]).slice(0,5),olAvg=olL.length?olL.reduce((a,q)=>a+q.rat,0)/olL.length:55;
    const yprOf=q=>clamp((q.pos==='TE'?10.5:q.pos==='RB'?7.8:12.5)+((q.spd||60)-60)*(q.pos==='RB'?0.05:0.09)+({'Speedster':2,'Big Play':2.2,'Deep Threat':2,'Jump Ball':1.2,'Possession':-1.5,'Sure Hands':-0.8,'Slot':-1.2,'Receiving Back':0.6,'Athletic Freak':1}[q.arch]||0)+gaussR()*2.2,4,24);
    const ypcOf=q=>clamp((q.pos==='QB'?4.2:4.3)+(q.rat-60)*0.03+((q.spd||60)-60)*0.025+(olAvg-60)*0.03+({'Track Speed':0.5,'Shifty':0.35,'Contact Seeker':-0.2,'Pure Runner':0.6,'Scrambler':0.4}[q.arch]||0)+gaussR()*0.9,1.5,11);
    let cmpSum=0;
    for(const q of players){const st=stats[q.id];if(!st)continue;
      if(q.pos!=='QB'&&((st.recYds||0)>0||(st.recTD||0)>0)){st.rec=Math.max(1,st.recTD||0,Math.round((st.recYds||0)/yprOf(q)));cmpSum+=st.rec;
        // drops: hands (rating + awareness), archetype and a little luck; drops cost the receiver yards he would have had
        const dr=clamp(0.06-(q.rat-60)*0.0012-((q.awr||60)-60)*0.0007+({'Sure Hands':-0.03,'Possession':-0.02,'Receiving Back':-0.01,'Big Play':0.01,'Speedster':0.01,'Blocker':0.02,'TE_Blocker':0.02}[q.arch]||0)+gaussR()*0.015,0.01,0.18);
        let dN=0;for(let k=0;k<st.rec;k++)if(Math.random()<dr)dN++;if(dN){st.drops=dN;st.recYds=Math.max(st.recTD?st.recTD*5:0,Math.round(st.recYds*(1-Math.min(0.25,dN*0.04))));}}
      if((st.rushYds||0)>0||(st.rushTD||0)>0){const y=ypcOf(q);
        // the workload comes from the scheme and the role; yards = carries x yards per carry, so efficient runners gain more
        const rbBase=isWT?22:isIF?20:offScheme==='Option'?17:isAR?10:isSp?14:17,rb0=byPos.RB&&byPos.RB[0],rb1=byPos.RB&&byPos.RB[1];
        let att=q===rb0?rbBase+rng(-4,4):q===rb1?Math.round(rbBase*0.3)+rng(-2,2):q.pos==='QB'?Math.round(({'Pure Runner':12,'Scrambler':8,'Tank':7}[q.arch]||3)*(isWT||offScheme==='Option'?1.4:1))+rng(-2,3):Math.max(1,Math.round((st.rushYds||0)/y));
        att=Math.max(1,st.rushTD||0,att);st.rushAtt=att;
        st.rushYds=Math.max((st.rushTD||0)*3,Math.round(att*y+gaussR()*Math.sqrt(att)*2));}}
    if(qb&&stats[qb.id]){const q=stats[qb.id],c=Math.max(cmpSum,q.passTD||0,(q.passYds||0)>0?1:0);q.passCmp=c;q.passAtt=Math.max(c,Math.min(Math.round(c/qbCp)+(Math.random()<0.5?0:1),c+20));}
    for(const id in krSt)stats[id]=Object.assign(stats[id]||{},krSt[id]);
    // offensive line: pancakes (strength, rating, run-heavy schemes, Run Blocker) and sacks allowed (the weaker links give them up)
    const runHeavy=isWT||isIF||offScheme==='Option',ols=olL;
    if(ols.length){const teamSacks=Math.max(0,Math.round(1.4+(58-olAvg)*0.05+(isAR?0.6:isSp?0.3:0)+gaussR()*1.1));
      const w=ols.map(o=>Math.max(0.2,1.6-(o.rat-40)/40));const wS=w.reduce((a,b)=>a+b,0);const sa=ols.map(()=>0);
      for(let k=0;k<teamSacks;k++){let r=Math.random()*wS,i=0;while(i<ols.length-1&&(r-=w[i])>0)i++;sa[i]++;}
      ols.forEach((o,i)=>{const lam=clamp(1.1+(o.rat-60)*0.07+((o.str||60)-60)*0.035+(runHeavy?0.6:isAR?-0.4:0)+(o.arch==='Run Blocker'?0.8:o.arch==='Pass Blocker'?-0.3:0),0.1,6);
        let pk=0,L=Math.exp(-lam),k=0,pr=1;do{k++;pr*=Math.random();}while(pr>L&&k<20);pk=k-1;
        stats[o.id]=Object.assign(stats[o.id]||{},{pancakes:pk,sacksA:sa[i]});});}}

  // Realistic defensive stats with archetype modifiers
  const dSt=DEF_SCHEME_STARTERS[defScheme]||DEF_SCHEME_STARTERS['4-3'],covSt={},oppPass=Math.round(rng(90,210)*(won?0.85:1.15)*STAT_NERF);
  const dlSt=byPos.DL?byPos.DL.slice(0,dSt.DL||4):[],skM=sackMult(dlSt,oppId),dlPR=dlSt.length?dlSt.reduce((a,p)=>a+_prSc(p),0)/dlSt.length:60;
  for(const[pos,c]of Object.entries(dSt)){
    if(!byPos[pos])continue;
    byPos[pos].slice(0,c).forEach((p,starterIdx)=>{
      const ratMod=(p.rat-55)/50;
      let tkl=0,sk=0,it=0;
      if(pos==='LB'){
        const base=rng(6,12);tkl=Math.max(1,Math.round((base+ratMod*4)*STAT_NERF));
        sk=_pois((0.5+(ratMod>.3?0.35:0))*Math.sqrt(skM));
        it=Math.random()<.08?1:0;
      } else if(pos==='DL'){
        const base=rng(3,7);tkl=Math.max(1,Math.round((base+ratMod*3)*STAT_NERF));
        sk=_pois(0.72*skM*clamp(1+(_prSc(p)-dlPR)*0.03,0.6,1.6));
      } else if(pos==='CB'){
        const base=rng(3,7);tkl=Math.max(1,Math.round((base+ratMod*3)*STAT_NERF));
        it=Math.random()<(.12+ratMod*.08)?1:0;
        if(starterIdx>0)tkl=Math.max(1,tkl-rng(0,2));
      } else if(pos==='S'){
        const base=rng(4,9);tkl=Math.max(1,Math.round((base+ratMod*4)*STAT_NERF));
        it=Math.random()<(.10+ratMod*.06)?1:0;
      } else {
        tkl=sc(p,7,5);sk=['LB','DL'].includes(pos)?rng(0,2):0;it=['CB','S','LB'].includes(pos)?rng(0,1):0;
      }
      if(pos==='CB'||pos==='S'||pos==='LB'){const sh=pos==='CB'?(starterIdx===0?0.27:0.23):pos==='S'?0.13:0.07,cov=clamp(1-(p.rat-60)*0.012-((p.spd||60)-60)*0.006,0.45,1.6);
        covSt[p.id]={tgtA:Math.max(0,Math.round(oppPass/11*sh*cov*1.6+gaussR())),ydsA:Math.max(0,Math.round(oppPass*sh*cov*(0.8+Math.random()*0.4))),
          pbu:(()=>{const lam=clamp((pos==='CB'?0.55:pos==='S'?0.35:0.15)+(p.rat-60)*0.012,0.03,1.6);let k=0,pr=1;const L=Math.exp(-lam);do{k++;pr*=Math.random();}while(pr>L&&k<8);return k-1;})()};}
      // Apply archetype mods to defensive stats
      tkl=applyArchMod(p,'tackles',tkl,offScheme,defScheme);
      sk=applyArchMod(p,'sacks',sk,offScheme,defScheme);
      it=applyArchMod(p,'ints',it,offScheme,defScheme);
      const statObj=Object.assign({tackles:tkl},covSt[p.id]||{});
      if(sk>0)statObj.sacks=sk;
      if(it>0)statObj.ints=it;
      stats[p.id]=Object.assign(stats[p.id]||{},statObj);
    });
    byPos[pos].slice(c).forEach(p=>{

      if(Math.random()<.3){
        const bkpTkl=rng(0,2);
        if(bkpTkl>0)stats[p.id]=Object.assign(stats[p.id]||{},{tackles:bkpTkl});
      }
    });
  }
  // v2.14 sim extras: yards after the catch, tackles for loss and punt returns
  for(const q of players){const st=stats[q.id];if(!st)continue;
    if((st.rec||0)>0&&(st.recYds||0)>0){const f=clamp((q.pos==='RB'?0.75:q.pos==='TE'?0.42:0.45)+({'Shifty':0.08,'Speedster':0.06,'Big Play':0.06,'Possession':-0.08,'Deep Threat':-0.1}[q.arch]||0)+gaussR()*0.06,0.15,0.95);st.yac=Math.round(st.recYds*f);}
    if(['DL','LB','S','CB'].includes(q.pos)&&(st.tackles||0)>0){const lam=(q.pos==='DL'?0.45:q.pos==='LB'?0.35:0.12)*clamp(1+(q.rat-60)*0.02,0.5,1.8);const t=(st.sacks||0)+_pois(lam);if(t>0)st.tfl=Math.min(t,(st.tackles||0)+(st.sacks||0));}
  }
  if(krs.length){const r=krs[0],n=_pois(won?1.3:2.2);if(n>0){const o=stats[r.id]||(stats[r.id]={});o.prRet=n;o.prYds=Math.max(0,Math.round(n*(7+((r.spd||60)-60)*0.15)+gaussR()*4*Math.sqrt(n)));}}
  return stats;
}

// v2.14 a readable 2-4 letter short name for a school (some schools carry a one-letter abbreviation)
function schAbbr(x){if(!x)return'?';return(x.abbr&&x.abbr.length>=2?x.abbr:String(x.name||'').replace(/\s+(High|Academy|Prep).*$/,'').replace(/[^A-Za-z ]/g,'').slice(0,4)).toUpperCase()||'?';}
// v2.14 compact stat line (only the numbers that are not zero)
function stCompact(st){const o={};for(const k in st)if(st[k])o[k]=st[k];return o;}
// season-by-season history: one line per season, kept for the rest of the player's career (and his story after it)
function archiveSeason(p,yr,ab){
  const s=p.seasStats||{};if(!(s.gp>0))return;
  if(!Array.isArray(p.seasons))p.seasons=[];if(p.seasons.some(x=>x.y===yr&&x.t===ab))return;
  p.seasons.push({y:yr,g:p.yr,t:ab,jv:p.onJV?1:0,r:p.rat,s:stCompact(s)});p.gameLog=[];
}
// who played this game: set by the game functions so every stat line lands in the right player's game log
let _glCtx=null;
// v2.15 gate money: every home game sells tickets and concessions; the crowd follows wins, prestige, rivals and price
const TICKET={low:[3,0.15,'Low'],normal:[5,0,'Normal'],high:[8,-0.12,'High'],premium:[12,-0.28,'Premium']};
function gateAfter(opp,kind,wk,my,op){
  try{const s=myS();if(!s||!opp)return;
    const home=kind==='reg'?(((wk|0)+G.myId)%2===0):kind==='po'?((G.wins||0)>=(opp.wins||0)):true;
    if(!home&&kind==='reg')return;
    const cap=stadBase(stadOf(s)).cap,T=TICKET[G.ticket||'normal']||TICKET.normal,gp=(G.wins||0)+(G.losses||0),wp=gp?(G.wins||0)/gp:0.5;
    const rival=(typeof isRivalry==='function'&&isRivalry(G.myId,opp.id))?0.18:0,hc=kind==='reg'&&hcIs(wk);
    let demand=(hc?0.2:0)+0.42+0.07*((G.prestige||1)-1)+0.3*(wp-0.5)+rival+0.04*((opp.prestige||1)-2)+(kind==='po'?0.3:0)+(kind==='nat'?0.5:0)+T[1];
    const att=Math.min(cap,Math.round(cap*clamp(demand,0.12,1)*(0.95+Math.random()*0.1)));
    let rev=Math.round(att*(T[0]+1.5));if(kind==='po')rev=Math.round(rev*0.6);if(kind==='nat')rev=Math.round(rev*0.5);
    G.budget+=rev;
    if(!G.gate||G.gate.yr!==G.yr)G.gate={yr:G.yr,n:0,att:0,rev:0};
    G.gate.n++;G.gate.att+=att;G.gate.rev+=rev;G.gate.last={att,cap,rev,opp:opp.mascot||opp.name,kind};
    if(hc){const g=G.sched.find(x=>x.type==='regular'&&x.wk===wk),r=g&&g.result?` ${g.result==='W'?'beat':'fell to'} ${opp.name} ${g.my}-${g.opp}`:` hosted ${opp.name}`;
      try{addNews('myteam',`Homecoming: ${s.mascot}${r}`,`${att.toLocaleString()} fans packed the stands for homecoming week: the parade, the court at halftime and alumni back in town.`);}catch(e){}}
    addLog(`<span style="color:var(--gn)">${hc?'Homecoming gate':'Gate'} vs ${opp.mascot||opp.name}: ${att.toLocaleString()} fans (${Math.round(att/cap*100)}% full) · +$${rev.toLocaleString()}${kind==='po'?' (playoff share)':kind==='nat'?' (neutral-site share)':''}</span>`);
  }catch(e){console.error('gate',e);}
}
function trophySvg(col,big){const w=big?64:46;return`<svg viewBox="0 0 64 72" width="${w}" height="${Math.round(w*72/64)}"><defs><linearGradient id="tg${col.slice(1)}" x1="0" x2="1"><stop offset="0" stop-color="${col}"/><stop offset=".45" stop-color="#fff8dc"/><stop offset="1" stop-color="${col}"/></linearGradient></defs>
  <path d="M14 6h36v14c0 12-8 20-18 20S14 32 14 20z" fill="url(#tg${col.slice(1)})" stroke="rgba(0,0,0,.35)"/><path d="M14 10H6c0 10 4 15 10 16M50 10h8c0 10-4 15-10 16" fill="none" stroke="${col}" stroke-width="3"/>
  <rect x="28" y="40" width="8" height="12" fill="${col}"/><rect x="18" y="52" width="28" height="6" rx="1" fill="${col}"/><rect x="14" y="58" width="36" height="10" rx="2" fill="#4a3324"/></svg>`;}
function pgTrophy(){
  const T=G.trophies||[],H=G.hist||[],me=myS();
  const kinds=[['National','National Champions','#d9a520',true],['State','State Champions','#e3b341',true],['Division','League Champions','#a9b4c2',false]];
  const shelf=kinds.map(([k,l,c,big])=>{const L=T.filter(t=>t.type===k).sort((a,b)=>a.yr-b.yr);if(!L.length)return'';
    return`<div class="pnl" style="margin-bottom:14px"><div class="ph">${l} <span style="font-size:12px;color:var(--mu)">${L.length}</span></div><div class="pb" style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end;background:linear-gradient(180deg,transparent 78%,rgba(120,80,40,.18) 78%)">
      ${L.map(t=>`<div style="text-align:center;min-width:70px">${trophySvg(c,big)}<div style="font-weight:800;font-size:13px">${(G.baseYear||2026)+t.yr-1}</div><div style="font-size:11px;color:var(--mu)">${t.rec||''}${t.cls?' · '+clsL(t.cls):''}</div></div>`).join('')}</div></div>`;}).join('');
  const ind=[];for(const h of H){for(const[k,l]of[['mrFootball','Mr. Football'],['freshmanOTY','Freshman of the Year']]){const a=h[k];if(a&&a.sId===G.myId)ind.push({yr:h.yr,l,a});}}
  const best=H.slice().sort((a,b)=>(b.wins-b.losses)-(a.wins-a.losses))[0],tw=H.reduce((n,h)=>n+(h.wins||0),0),tl=H.reduce((n,h)=>n+(h.losses||0),0);
  const hof=(G.hofArchive||[]).filter(p=>p.sId===G.myId||p.hsId===G.myId).length;
  const empty=!shelf&&!ind.length;
  return`<div class="pnl" style="margin-bottom:14px"><div class="ph"><span style="display:inline-flex;align-items:center;gap:8px">${sLogo(me,30)}${me.name} Trophy Case</span></div><div class="pb">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px">
        ${[['Seasons',H.length],['All-time record',`${tw}-${tl}`],['Best season',best?`${best.wins}-${best.losses} (${(G.baseYear||2026)+best.yr-1})`:'–'],['Titles',T.filter(t=>t.type!=='Division').length],['League titles',T.filter(t=>t.type==='Division').length],['Player awards',ind.length]].map(([l,v])=>`<div style="background:var(--s2);border:1px solid var(--bd);border-radius:10px;padding:10px"><div style="font-size:11px;color:var(--mu);letter-spacing:.06em">${l}</div><div style="font-weight:900;font-size:20px">${v}</div></div>`).join('')}
      </div>${empty?`<p style="color:var(--mu);margin:12px 0 0">The case is empty for now. League titles, state and national championships and your players' awards will be displayed here.</p>`:''}</div></div>
    ${shelf}
    ${ind.length?`<div class="pnl"><div class="ph">Player awards</div><div class="pb" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px">
      ${ind.map(x=>`<div class="cl" style="display:flex;gap:10px;align-items:center;background:var(--s2);border:1px solid var(--bd);border-radius:10px;padding:8px" onclick="showPlayer(${x.a.pid})">${trophySvg(x.l==='Mr. Football'?'#d9a520':'#7fa6d8',false)}<div><div style="font-weight:800">${x.l}</div><div>${x.a.name}</div><div style="font-size:11px;color:var(--mu)">${(G.baseYear||2026)+x.yr-1}${x.a.pos?' · '+x.a.pos:''}</div></div></div>`).join('')}</div></div>`:''}`;}
function ticketSet(k){if(!TICKET[k])return;G.ticket=k;nav(G._page||'staff',G._arg);}


