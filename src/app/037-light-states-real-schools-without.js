// ═══════════ LIGHT STATES: real schools without full rosters ═══════════
// A light state keeps every school (name, town, logo, class, division, record, game log) and a team strength, plays its
// season and a state playoff bracket, and tracks only its top prospects as real players: the top tail of the class a full
// roster would have, so stars, offers, camps and commitments work there exactly like in a detailed state.
const LITE_SD=6.5;
function isLiteCls(c){const X=XCLS[c];return!!(X&&X.lite);}
function liteQuota(ab,yr){const X=USA.X,m=X&&X.st[ab]?X.st[ab].meta[0]:(USST[ab]||[100])[0];return Math.ceil((2462*m/USST_PROG_ALL*1.6+2)*({9:0.45,10:0.75}[yr]||1));}
function _phi(x){const t=1/(1+0.2316419*Math.abs(x)),d=0.3989423*Math.exp(-x*x/2),p=d*t*(0.3193815+t*(-0.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));return x>0?1-p:p;}
function _phiInv(p){p=clamp(p,1e-9,1-1e-9);const a=[-39.69683,220.9461,-275.9285,138.3578,-30.66480,2.506628],b=[-54.47610,161.5858,-155.6990,66.80131,-13.28068],c=[-0.007784894,-0.3223964,-2.400758,-2.549732,4.374664,2.938164],d=[0.007784696,0.3224671,2.445134,3.754409];
  const q=p<0.02425?Math.sqrt(-2*Math.log(p)):p>1-0.02425?Math.sqrt(-2*Math.log(1-p)):0;
  if(p<0.02425)return(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  if(p>1-0.02425)return-(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  const r=p-0.5,t=r*r;return(((((a[0]*t+a[1])*t+a[2])*t+a[3])*t+a[4])*t+a[5])*r/(((((b[0]*t+b[1])*t+b[2])*t+b[3])*t+b[4])*t+1);}
function liteAdj(s){return({'5A':0,'4A':3,'3A':6,'2A':9,'1A':12}[clsEq(s.cls)]||0)+(XCLS[s.cls]?1:0);}
function liteMu0(s){const X=XCLS[s.cls],q=teamQ(s,s.id,0.5,s.tier==='good'?0.55:s.tier==='bad'?0.1:0.3);return(X?X.mean:({'5A':64,'4A':60,'3A':56,'2A':52,'1A':48}[s.cls]||56))+(q-0.5)*24;} // the same class average genPlayer uses
function liteMu(s,yr){const o=G.liteYr&&G.liteYr[yr];return liteMu0(s)+(o!=null?o:((yr||10.5)-10.5)*3);}
function liteSd(yr){return(G.liteSd&&G.liteSd[yr])||LITE_SD;}
// how the detailed states' players really sit above their school's base, class year by class year (growth included)
function liteYrCalib(){const sum={},sq={},n={};
  for(const p of G.players){if(p.lt||p.grad||!p.yr||p.yr<9||p.yr>12||p.sId===G.myId)continue;const s=getS(p.sId);if(!s||s.lite||s.intl||s.fp)continue;const r=p.rat-liteMu0(s);sum[p.yr]=(sum[p.yr]||0)+r;sq[p.yr]=(sq[p.yr]||0)+r*r;n[p.yr]=(n[p.yr]||0)+1;}
  const o={},sd={};for(const y of[9,10,11,12]){if(!(n[y]>50))continue;const m=sum[y]/n[y];o[y]=+m.toFixed(2);sd[y]=+clamp(Math.sqrt(Math.max(1,sq[y]/n[y]-m*m)),3,12).toFixed(2);}
  if(Object.keys(o).length===4){G.liteYr=o;G.liteSd=sd;}
  // the real spread, tails included: light prospects are drawn from it, so a light state's best players look like a detailed state's
  const R={9:[],10:[],11:[],12:[]};for(const p of G.players){if(p.lt||p.grad||!R[p.yr]||p.sId===G.myId)continue;const s=getS(p.sId);if(!s||s.lite||s.intl||s.fp)continue;R[p.yr].push(p.rat-liteMu0(s));}
  for(const y in R)R[y].sort((a,b)=>a-b);Object.defineProperty(G,'_lr',{value:R,writable:true,configurable:true,enumerable:false});}
function liteRes(yr){if(!G._lr)liteYrCalib();const A=G._lr&&G._lr[yr];return A&&A.length>200?A:null;}
function _lrIdx(A,x){let lo=0,hi=A.length;while(lo<hi){const m=(lo+hi)>>1;if(A[m]<x)lo=m+1;else hi=m;}return lo;}
// share of a class year above x (relative to the school's base), and one draw from above it
function liteTail(yr,x){const A=liteRes(yr);if(!A)return 1-_phi((x-((G.liteYr&&G.liteYr[yr])||0))/liteSd(yr));return(A.length-_lrIdx(A,x))/A.length;}
function liteDraw(yr,x){const A=liteRes(yr);if(!A){const o=(G.liteYr&&G.liteYr[yr])||0,SD=liteSd(yr),u0=_phi((x-o)/SD);return o+SD*_phiInv(u0+Math.random()*(1-u0));}
  const i=_lrIdx(A,x);if(i>=A.length)return x+Math.random()*1.5;return A[i+Math.floor(Math.random()*(A.length-i))];}
function liteN(s){const r=clsSz(s.cls).r;return(r[0]+r[1])/8;}   // players a full roster would have in one class year
function liteStates(){const by={};if(!G||!G.allLeagues)return by;for(const c in G.allLeagues){if(!isLiteCls(c))continue;const st=XCLS[c].st;for(const d of G.allLeagues[c].divisions)for(const t of d.teams){t.lite=1;(by[st]=by[st]||[]).push(t);}}return by;}
// the line (rating + class adjustment) above which a full class year of this state would have `quota` players
function liteThr(teams,yr,quota){let lo=10,hi=150;const P=teams.map(s=>[liteAdj(s)+liteMu0(s),liteN(s)]);
  for(let it=0;it<36;it++){const T=(lo+hi)/2;let e=0;for(const[m,n]of P)e+=n*liteTail(yr,T-m);if(e>quota)lo=T;else hi=T;}return(lo+hi)/2;}
function liteMake(s,yr,T){const a=liteAdj(s),mu=liteMu0(s),r=mu+liteDraw(yr,T-a-mu);
  const p=genPlayer(s.id,yr,s.cls,null),R=clamp(Math.round(r),20,99);p.rat=R;p.potLo=clamp(R+rng(3,12),R,99);p.potHi=clamp(p.potLo+rng(8,20),p.potLo,99);p.pot=p.potLo;
  const tr=Math.random();p.dev=p.potHi>=94&&tr<.5?'Elite Dev':p.potHi>=85&&tr<.35?'Star':p.potHi>=75&&tr<.3?'Impact':'Normal';try{adjDev(p,s);}catch(e){}
  try{xStylePlayer(p,s);}catch(e){}p.lt=1;G.players.push(p);return p;}
// add `k` prospects of class year `yr` to a state's schools, each school in proportion to how many it would have
function liteAdd(teams,yr,T,k){if(k<=0||!teams.length)return[];const w=teams.map(s=>liteN(s)*liteTail(yr,T-liteAdj(s)-liteMu0(s))),tot=w.reduce((a,b)=>a+b,0)||1,out=[];
  for(let i=0;i<k;i++){let r=Math.random()*tot,j=0;for(;j<w.length-1;j++){r-=w[j];if(r<=0)break;}out.push(liteMake(teams[j],yr,T));}return out;}
function liteStr(s){const o=G.liteOfs!=null?G.liteOfs:6;return clamp(Math.round(liteMu(s,11)+o+gaussR()*2.5),25,92);}
function liteCalib(){if(G.liteOfs!=null)return;const L=[];for(const s of allSchoolsAll()){if(s.lite||s.intl||s.id===G.myId)continue;L.push(s);if(L.length>=500)break;}
  G.liteOfs=L.length?+(L.reduce((a,s)=>a+teamOvr(s.id)-liteMu(s,11),0)/L.length).toFixed(2):6;}
function liteInit(){const by=liteStates(),fresh=[];if(!Object.keys(by).length)return fresh;if(!G.liteYr)liteYrCalib();liteCalib();
  for(const st in by){const T0=by[st];for(const s of T0)if(s.str==null)s.str=liteStr(s);
    if(sPlayersAny(T0))continue; // this state already has its prospects (a loaded career)
    const ab=USA.ab[st]||st;for(const yr of[9,10,11,12]){const q=liteQuota(ab,yr),T=liteThr(T0,yr,q);for(const p of liteAdd(T0,yr,T,q))fresh.push(p);}}
  return fresh;}
// a big save from before light states: offer to keep full detail only near home (the rest becomes light states)
function saveSlimOffer(){if(!G||!USA.on||!USA.cfg||USA.cfg.v!==1||USA.cfg.detail||G.players.length<90000)return;
  openMo(`<h2>Make this save lighter?</h2><div style="font-size:13px;color:var(--mu);line-height:1.5;margin-bottom:12px">This career tracks <b>${G.players.length.toLocaleString()}</b> players in every state, which can make phones slow down or crash. Gridiron 27 can keep your home state and its neighbors in full detail and turn the other states into light states: their schools keep playing, keep their strength and state playoffs, and their stars, recruits with offers and commits stay. Your team, records and history do not change.</div>
    <div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap"><button class="bgh" onclick="clo()">Keep everything</button><button class="btn bgn" onclick="saveSlim()">Make it lighter</button></div>`);}
window.saveSlim=function(){clo();showLoading('Making your save lighter…',myS(),10,()=>{try{
  const cfg=Object.assign({},USA.cfg),det=usaAutoDetail(cfg.states,cfg.home,USA.X),homeAb=cfg.home;cfg.detail=det;
  const str={};for(const s of allSchoolsAll()){if(s.intl||s.id===G.myId)continue;const ab=USA.ab[clsSt(s.cls)]||(clsSt(s.cls)==='CF'?homeAb:null);if(ab&&!det.includes(ab))str[s.id]=teamOvr(s.id);}
  G.world=G.world||{};G.world.geo=cfg;worldApply(G.world,true);
  for(const s of allSchoolsAll())if(str[s.id]!=null){s.lite=1;s.str=str[s.id];}
  const before=G.players.length;
  G.players=G.players.filter(p=>{const s=getS(p.sId);if(!s||!s.lite)return true;if(p.id===G.myPlayerId)return true;const keep=(p.stars>=2)||(p.sg>=2)||p.committed||(p.offers&&p.offers.length);if(keep)p.lt=1;return keep;});
  _spVer++;G._thr=null;G.lsch=null;if(typeof _RK!=='undefined')_RK=null;G.liteYr=null;liteYrCalib();G.liteOfs=null;liteCalib();try{starCap5();}catch(e){}
  updateRats();saveGame(true);nav('dash');notify(`Done: ${(before-G.players.length).toLocaleString()} untracked players removed. Full detail: ${det.map(a=>USA.X.st[a].name).join(', ')}.`);
}catch(e){console.error('slim',e);notify('Could not make the save lighter: '+e.message,'e');}});};
function sPlayersAny(teams){for(const s of teams)if(sPlayers(s.id).length)return true;return false;}
// the offseason: seniors leave, everyone grows, new freshmen, late bloomers join, the ones who fell away are dropped, strengths move
function liteOffseason(){const by=liteStates();if(!Object.keys(by).length)return;liteYrCalib();G.liteOfs=null;liteCalib();
  const ids=new Set();for(const st in by)for(const s of by[st])ids.add(s.id);
  G.players=G.players.filter(p=>!(p.lt&&ids.has(p.sId)&&p.yr>=12));
  for(const p of G.players){if(!p.lt||!ids.has(p.sId))continue;p.yr++;try{bodyGrow(p);}catch(e){}const g=p.pot-p.rat;p.rat=clamp(Math.round(p.rat+Math.max(0,g*.1+rngF(-1,3))),1,Math.max(p.pot,p.rat));p.seasStats=emS();p.inj=0;p.injName=null;p.injSeason=false;}
  const byS={};for(const p of G.players)if(p.lt&&ids.has(p.sId))(byS[p.sId]=byS[p.sId]||[]).push(p);
  const drop=new Set(),fresh=[];
  for(const st in by){const T0=by[st],ab=USA.ab[st]||st;for(const s of T0)s.str=liteStr(s);
    for(const yr of[9,10,11,12]){const q=liteQuota(ab,yr),T=liteThr(T0,yr,q);let have=0;
      for(const s of T0)for(const p of byS[s.id]||[]){if(p.yr!==yr)continue;const v=p.rat+liteAdj(s);if(v>=T)have++;else if(v<T-10&&!p.committed&&!(p.offers&&p.offers.length)&&p.id!==G.myPlayerId)drop.add(p.id);}
      for(const p of liteAdd(T0,yr,T,Math.max(0,Math.round(q-have))))fresh.push(p);}}
  if(drop.size)G.players=G.players.filter(p=>!drop.has(p.id));
  G._thr=null;for(const p of fresh)starsInit(p);try{starCap5();}catch(e){}}
// stand-ins for a light school's untracked players, so its prospects get a normal share of the team's stats (never stored)
const _LT_PH={};
function litePH(s){const need={QB:1,RB:2,WR:3,TE:1,OL:5,K:1,DL:4,LB:3,CB:3,S:2},out=[];let k=0;
  for(const pos in need)for(let i=0;i<need[pos];i++){const key=pos+i;const o=_LT_PH[key]||(_LT_PH[key]={id:-100-k,pos,traits:[],depth:{},spd:62,seasStats:emS()});o.rat=Math.round((s.str||55)-4);o.inj=0;out.push(o);k++;}return out;}
// a full roster for one game against a light school: its prospects plus players made for the day (not kept)
const _LT_TMP=new Map();
function liteGameRoster(s){const k=s.id+'|'+G.yr;let L=_LT_TMP.get(k);if(L)return L.concat(sPlayers(s.id));if(_LT_TMP.size>6)_LT_TMP.clear();
  const n0=_pId,gen=[];for(let i=0;i<46;i++){const p=_genPlayer0(s.id,[9,10,11,12][i%4],s.cls,null);p.rat=clamp(Math.round((s.str||55)-5+gaussR()*5+((p.yr||10)-10.5)*2),20,95);p.pot=Math.max(p.pot,p.rat);gen.push(p);}
  _LT_TMP.set(k,gen);return gen.concat(sPlayers(s.id));}
// ── state playoffs for every league (detailed and light): division winners and the best records, seeded, single elimination ──
function lgStatePO(lg,cls){
  if(lg.po&&lg.po.yr===G.yr)return lg.po;
  const T=lg.divisions.flatMap(d=>d.teams);if(T.length<2){lg.po={yr:G.yr,champ:T[0]?T[0].id:null};return lg.po;}
  const wp=t=>(t.wins+0.5)/(t.wins+t.losses+1),srt=(a,b)=>wp(b)-wp(a)||b.wins-a.wins||teamOvr(b.id)-teamOvr(a.id);
  const n0=T.length<=12?4:T.length<=40?8:T.length<=120?16:32,RU=G.rules||{},n=RU.poN?Math.min(poRules().n,Math.max(2,1<<Math.floor(Math.log2(T.length)))):n0,q=[];
  if(RU.poQ!=='record')for(const d of lg.divisions){const b=d.teams.slice().sort(srt)[0];if(b&&q.length<n)q.push(b);}
  for(const t of T.slice().sort(srt)){if(q.length>=n)break;if(!q.includes(t))q.push(t);}
  q.sort(srt);let field=q.slice(),round=0,fin=null;const order=k=>{const o=[0,1];while(o.length<k){const m=o.length*2,x=[];for(const i of o)x.push(i,m-1-i);o.splice(0,o.length,...x);}return o;};
  field=order(field.length).map(i=>field[i]).filter(Boolean);
  while(field.length>1){const nx=[];for(let i=0;i<field.length;i+=2){const a=field[i],b=field[i+1];if(!b){nx.push(a);continue;}
      const pa=1/(1+Math.exp(-(teamOvr(a.id)-teamOvr(b.id)+(wp(a)-wp(b))*6)/7)),w=Math.random()<pa?a:b;if(field.length===2)fin={a:a.id,b:b.id,w:w.id};nx.push(w);}field=nx;round++;}
  lg.po={yr:G.yr,champ:field[0]?field[0].id:null,fin,n:q.length};return lg.po;}
function ensureStates(skipStars){
  if(typeof G==='undefined'||!G||!G.allLeagues)return false;xLogoMap();
  const fresh=[];
  for(const c of XCLS_ORDER){
    if(G.allLeagues[c]||c===G.cls)continue;
    const divs=(typeof _allClsDivs!=='undefined'&&_allClsDivs&&_allClsDivs[c]&&!_allClsDivs[c].some(d=>d.teams.some(t=>getS(t.id))))?_allClsDivs[c]:makeStateDivisions(c);
    for(const d of divs)for(const t of d.teams)t.cls=c;
    G.allLeagues[c]={divisions:divs,champId:null,champName:null};
    if(isLiteCls(c)){for(const d of divs)for(const s of d.teams)s.lite=1;continue;}
    for(const d of divs)for(const s of d.teams){const n0=G.players.length;genTeamPlayers(s);for(let i=n0;i<G.players.length;i++){xStylePlayer(G.players[i],s);fresh.push(G.players[i]);}}
  }
  try{for(const p of liteInit())fresh.push(p);}catch(e){console.error('light states',e);}
  if(fresh.length&&!skipStars){G._thr=null;for(const p of fresh)if(!p.grad)starsInit(p);
    for(const p of fresh)if(!p.grad&&p.yr>=11&&p.sg>=1){p.offers=p.offers||[];for(let k=0;k<1+p.sg;k++)genOffers(p,true,null);}}
  if(fresh.length){G.lsch=null;if(typeof _RK!=='undefined')_RK=null;_rkNames=null;}
  xRetireOOS();
  return fresh.length>0;
}
// the old out-of-state teams are gone: unplayed games against them move to a similar team from Wakota or Tierra Alta,
// and the league is dropped once no game on your schedule points at it
function xRetireOOS(){
  const oo=G.allLeagues&&G.allLeagues.OOS;if(!oo)return;
  const ids=new Set(oo.divisions.flatMap(d=>d.teams.map(t=>t.id)));
  const taken=new Set((G.sched||[]).map(g=>g.oppId).filter(x=>x!=null));
  const pool=XCLS_ORDER.flatMap(c=>G.allLeagues[c]?G.allLeagues[c].divisions.flatMap(d=>d.teams):[]);
  for(const g of(G.sched||[])){if(g.oppId==null||!ids.has(g.oppId)||g.result)continue;
    const o=teamOvr(g.oppId),c=pool.filter(s=>!taken.has(s.id)).sort((a,b)=>Math.abs(teamOvr(a.id)-o)-Math.abs(teamOvr(b.id)-o)).slice(0,6);
    if(!c.length)continue;const s=c[Math.floor(Math.random()*c.length)];taken.add(s.id);g.oppId=s.id;G.lsch=null;}
  if((G.sched||[]).some(g=>g.oppId!=null&&ids.has(g.oppId)))return;
  delete G.allLeagues.OOS;G.players=G.players.filter(p=>!ids.has(p.sId));G.lsch=null;
}

// ═══════════ v2.00 NATIONAL CHAMPIONSHIP ═══════════
// After the state playoffs, the two best teams in the final national poll meet at a
// neutral site. State champions get a lift in the final poll; your team plays the game itself if it is one of the two.
const NAT_VENUES=['Crestfield Capital Stadium','Llano Grande Lone Star Field','Coralina Citrus Bowl','Wakota Prairie Bowl','Magnolia Classic Stadium','Cascadia Evergreen Dome','Tierra Alta Sun Bowl','Acadia Bayou Bowl','Summit Mile High Field','Cumberland Ridge Stadium'];
function natVenue(yr){return NAT_VENUES[((yr||1)-1)%NAT_VENUES.length];}
function natChampIds(){
  const ids=new Set();if(G.playoff&&G.playoff.stateChampId)ids.add(G.playoff.stateChampId);
  // the other classifications crown their state playoff champion
  for(const c of[...CLS_ORDER,...XCLS_ORDER]){if(c===G.cls||!G.allLeagues||!G.allLeagues[c])continue;const po=lgStatePO(G.allLeagues[c],c);if(po&&po.champ)ids.add(po.champ);}
  return ids;
}
function natEnsure(){
  if(!G||G.phase!=='postseason')return null;
  if(G.natl&&G.natl.yr===G.yr)return G.natl;
  _RK=null;const R=rkCompute();if(!R||R.nat.length<2)return null;
  const ch=natChampIds(),L=R.nat.map(r=>({r,sc:r.ns+(ch.has(r.id)?0.6:0)})).sort((x,y)=>y.sc-x.sc||y.r.ov-x.r.ov);
  const a=L[0].r.s,b=L[1].r.s;
  G.natl={yr:G.yr,a:a.id,b:b.id,done:false,venue:natVenue(G.yr)};
  addNews('playoff',`National Championship set: ${a.name} ${a.mascot} vs ${b.name} ${b.mascot}`,`The two best teams in the final national poll meet at ${G.natl.venue}.`);
  return G.natl;
}
function natMine(){const n=G.natl;return!!(n&&n.yr===G.yr&&!n.done&&(n.a===G.myId||n.b===G.myId));}
function natOpp(){const n=G.natl;return n?getS(n.a===G.myId?n.b:n.a):null;}
// record the result: trophies, prestige and money for the winner, history and news
function natRecord(wId,lId,ws,ls,ot){
  const n=G.natl,w=getS(wId),l=getS(lId);if(!n||!w||!l)return null;
  n.done=true;n.w=wId;n.l=lId;n.sa=n.a===wId?ws:ls;n.sb=n.a===wId?ls:ws;n.ot=ot?1:0;
  w.trophies=w.trophies||[];w.trophies.push({type:'National',yr:G.yr});w.prestige=clamp((w.prestige||1)+.5,1,5);
  G.natHist=G.natHist||[];G.natHist=G.natHist.filter(h=>h.yr!==G.yr);
  G.natHist.push({yr:G.yr,w:wId,l:lId,ws,ls,ot:ot?1:0,wName:`${w.name} ${w.mascot}`,lName:`${l.name} ${l.mascot}`,wSt:stOf(w),lSt:stOf(l),wCls:w.cls,lCls:l.cls,venue:n.venue});
  const yr=2026+(G.yr-1);
  if(wId===G.myId){G.trophies=G.trophies||[];G.trophies.push({type:'National',yr:G.yr,rec:`${G.wins}-${G.losses}`,cls:G.cls});G.prestige=clamp(G.prestige+.6,1,5);G.budget+=100000;
    addLog(`<span style="color:var(--gd)">National champions! ${ws}-${ls} vs ${l.name} ${l.mascot} +$100,000</span>`);}
  else if(lId===G.myId){G.prestige=clamp(G.prestige+.2,1,5);G.budget+=25000;addLog(`<span style="color:var(--te)">National Championship: lost ${ls}-${ws} to ${w.name} ${w.mascot} (+$25,000 for the appearance)</span>`);}
  addNews('playoff',`${w.name} ${w.mascot} win the ${yr} National Championship`,`${ws}-${ls}${ot?' (OT)':''} over ${l.name} ${l.mascot} at ${n.venue}.`);
  _RK=null;
  const mine=wId===G.myId||lId===G.myId;
  return bEvPop(wId===G.myId?'National champions!':'National Champion Crowned',
    wId===G.myId?`${w.name} ${w.mascot} beat ${l.name} ${l.mascot} <strong>${ws}-${ls}</strong>${ot?' in overtime':''} at ${n.venue}.<br><br>Your program is the <strong style="color:var(--gd)">${yr} National Champion</strong>! <strong style="color:var(--gd)">+$100,000</strong>`
      :`<strong style="color:var(--gd)">${w.name} ${w.mascot}</strong> (${stName(stOf(w))}) beat ${l.name} ${l.mascot} (${stName(stOf(l))}) <strong>${ws}-${ls}</strong>${ot?' in overtime':''} at ${n.venue} to win the <strong>${yr} National Championship</strong>.${mine?'<br><br>Reaching the title game still lifts your program: <strong>+$25,000</strong>.':''}`,
    sLogo(w,64),'var(--gd)');
}
// AI vs AI (or your game when you simulate it from the offseason button)
function natSim(){
  const n=G.natl;if(!n||n.done)return null;
  if(n.a===G.myId||n.b===G.myId)return natResolve(null,true);
  const a=getS(n.a),b=getS(n.b);if(!a||!b){n.done=true;return null;}
  const oa=teamOvr(a.id),ob=teamOvr(b.id),pa=1/(1+Math.exp(-(oa-ob)/5.5)),aW=Math.random()<pa,sc=lgScore(oa,ob,aW);
  try{lgPlay(a,sc[0],aW,b.id);lgPlay(b,sc[1],!aW,a.id);}catch(e){}
  return aW?natRecord(a.id,b.id,sc[0],sc[1],sc[2]):natRecord(b.id,a.id,sc[1],sc[0],sc[2]);
}
// your national title game: forced = result from Game Day, silent = no pop-up queue handling here
function natResolve(forced,silent){
  const n=G.natl,opp=natOpp();if(!n||n.done||!opp)return null;
  const myOvr=(G.offR+G.defR)/2,oppOvr=teamOvr(opp.id),big=myP().filter(p=>p.traits.includes('big-game')).length*.03,eff=teamEffEdge(G.myId)-teamEffEdge(opp.id);
  let iWin=Math.random()<clamp(.5+(myOvr-oppOvr+eff)/100+big,0.03,0.97);if(forced)iWin=forced.my>forced.opp;
  const sc=forced?[forced.my,forced.opp,false]:lgScore(myOvr,oppOvr,iWin);
  const pl=myP().filter(p=>p.inj===0),_nsm=forced&&forced.sm?forced.sm:genStats(pl,sc[0],iWin,G.offS,G.defS,G.myId,opp.id);glSet('Natl',opp,sc[0],sc[1],'nat');try{applyStats(_nsm);}finally{_glCtx=null;}gateAfter(opp,'nat');try{checkStreaks(_nsm,[],true);}catch(e){}
  try{lgPlay(opp,sc[1],!iWin,G.myId);}catch(e){}
  const pop=iWin?natRecord(G.myId,opp.id,sc[0],sc[1],sc[2]):natRecord(opp.id,G.myId,sc[1],sc[0],sc[2]);
  for(const p of myP()){checkStarsOffers(p,[],false);checkCommit(p);}
  if(silent)return pop;
  updateTb();if(pop){_popQ=[pop];_popI=0;_popCb=()=>nav('dash');showPop();}else nav('dash');return pop;
}
function natPlay(){
  const n=natEnsure(),opp=natOpp();if(!n||!opp||!natMine()){nav('dash');return;}
  const label=`National Championship at ${n.venue}: vs ${opp.name} ${opp.mascot}`;
  gdChoose('nat',{opp,label},()=>showLoading('National Championship',myS(),12,()=>natResolve(null)));
}

