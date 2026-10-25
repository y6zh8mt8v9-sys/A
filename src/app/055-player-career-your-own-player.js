// ═══════════ v2.14 PLAYER CAREER: your own player, from freshman year to the pros ═══════════
function pcReadForm(){
  const on=document.getElementById('pc-on');if(!on||!on.checked)return null;
  const v=id=>(document.getElementById(id)||{}).value||'';
  const clean=t=>String(t).replace(/[<>&"'`]/g,'').trim().slice(0,18);
  const n=parseInt(v('pc-num'),10);
  const lock=!!(document.getElementById('pc-lock')||{}).checked;
  if(_pcd)return Object.assign(JSON.parse(JSON.stringify(_pcd)),{lock,made:true});
  return{fn:clean(v('pc-fn'))||'Jordan',ln:clean(v('pc-ln'))||'Player',pos:v('pc-pos')||'WR',num:Number.isFinite(n)?clamp(n,0,99):1,lock};
}
function pcCreate(d){
  const p=genPlayer(G.myId,9,G.cls,null),sch=myS();
  p.pos=d.pos;p.fn=d.fn;p.ln=d.ln;p.num=d.num;
  try{p.arch=pickArchetype(d.pos,sch.offS,sch.defS);}catch(e){}
  // a freshman with real upside: a bit ahead of his class, star development, high ceiling
  const fr=myP().filter(q=>q.yr===9&&q.id!==p.id),avg=fr.length?fr.reduce((a,q)=>a+q.rat,0)/fr.length:p.rat;
  p.rat=clamp(Math.round(Math.max(p.rat,avg+6)),20,70);p.potLo=Math.max(p.potLo||0,82);p.potHi=Math.max(p.potHi||0,93);p.pot=Math.max(p.pot||0,88);p.dev='Star';
  p.onJV=false;p.mine=true;p.hof=true;p.wl=true;
  try{bodyNew(p,sch);}catch(e){}
  if(d.made){ // built in the player creator: his own ratings, body, archetype, traits, interests, look and gear
    const L=HS_LIM[p.pos]||HS_LIM.WR;p.ht=clamp(+d.ht||p.ht,L[0],L[1]);p.wt=clamp(+d.wt||p.wt,L[2],L[3]);
    if(d.arch)p.arch=d.arch;p.traits=(d.traits||[]).slice(0,PCC_TR);p.interests=(d.ints||[]).slice(0,PCC_INT);
    p.at={};for(const k of AK){const v=d.at&&d.at[k];if(v==null)continue;if(ATOP.has(k))p[k]=v;else p.at[k]=v;}
    p.rat=clamp(ovrCalc(p),PCC_OVR[0],PCC_OVR[1]);p._rc=p.rat;
    p.fs=d.fs;if(d.look&&Object.keys(d.look).length){G.looks=G.looks||{};G.looks[p.fs]=Object.assign({},d.look);}
    if(d.eq)p.eq=d.eq;}
  p.pcLv=1;p.pcXP=0;p.pcSP=0;_pcd=null;window._pccDone=false;
  if(!G.players.includes(p))G.players.push(p);
  G.myPlayerId=p.id;p.rel=50;G.pcLock=!!d.lock;
  addLog(`<span style="color:var(--gd)">Player Career: ${p.fn} ${p.ln} (${p.pos}, #${p.num}) joins the program as a freshman.</span>`);
}
// ── Player Career mode: coach trust, playing time and transfers ──
const PC_STARTERS={QB:1,RB:1,WR:3,TE:1,OL:5,DL:4,LB:3,CB:2,S:2,K:1,P:1};
function pcActive(){const p=myPlayer();return!!(G&&G.pcLock&&p&&G.players.includes(p)&&p.sId===G.myId&&!p.grad)?p:null;}
// ── Player Career mode runs the team for you: the head coach handles schedule, depth chart, training, staff and recruiting ──
function pcAuto(){return!!(typeof G!=='undefined'&&G&&G.pcLock);}
// coach pages are hidden; in college the high school team's pages go too
// in college the high school league's pages go too: his college page has its own schedule, standings, rankings and roster
const CC_HS_PG=['roster','sched','recls','stand','rank','playoff','teams','leads','media','watch','hof','trophy','hist'];
const CC_TAB={sched:'sched',stand:'stand',rank:'rank',playoff:'post',roster:'roster',teams:'cols',leads:'stats'};
function pcHidePg(pg){return pcAuto()&&(['depth','jv','recr','scout','training','staff','cust','advisor'].includes(pg)||(ccOn()&&CC_HS_PG.includes(pg)));}
// run a coach action without its toasts and page changes
function pcQuiet(fn){const n=nav,nt=notify;nav=function(){};notify=function(){};try{return fn();}finally{nav=n;notify=nt;}}
// the schedule: the rival in week 5 (an ongoing rival from the division, or the usual one), the open dates filled with fair
// opponents, then locked in (no builder)
function pcAutoSched(){if(!G||!Array.isArray(G.sched))return;const C=G.sched.filter(g=>g.custom),E=C.filter(g=>g._empty);
  if(E.length&&E.length===C.length&&!G.sched.some(g=>g.result)){const md=myDiv(),cr=md&&(G.chosenRivals||[]).find(id=>id!==G.myId&&md.teams.some(t=>t.id===id)),r=md?getRival(G.myId,md):null;
    G.seasonRivalId=cr||(r?r.id:null);genSched();}
  if(G.sched.some(g=>g.custom&&g._empty)){sbFill();schedLock();}G.customSchedPending=false;}
function pcAutoSP(){let n=0;for(const p of G.players)if(p.sId===G.myId&&!p.grad&&p.sp>0){spApply(p);n++;}if(n)try{updateRats();}catch(e){}}
// captains: the best upperclassmen (leaders first) when a spot is open
function pcAutoCaptains(){const c=captains();if(c.length>=3)return;const sc=p=>p.rat+(p.yr===12?3:0)+((p.traits||[]).includes('leader')?5:0);
  const L=myP().filter(p=>p.yr>=11&&!c.includes(p.id)&&!p.xferOut).sort((a,b)=>sc(b)-sc(a));while(c.length<3&&L.length)c.push(L.shift().id);}
// money: a sponsor and a fundraiser every season, the summer camp in the offseason
function pcAutoMoney(){const F=finYr();try{if(!F.sponsDone)pcQuiet(()=>finSponsor());if(!F.fundDone)pcQuiet(()=>finFund());if(!F.campDone&&G.phase==='offseason')pcQuiet(()=>finCamp());}catch(e){console.error('player career money',e);}}
// staff, facilities and training level, bought in the Assistant GM's order of value (facilities once training is maxed:
// a training upgrade resets them), keeping a little money in the bank
function pcAutoBudget(){const keep=10000,all=G.players.filter(p=>p.sId===G.myId);
  for(let i=0;i<60;i++){const tl=getTrainLevel(),o=aiBudgetOpts({all}).find(x=>x.ok&&x.id&&(x.id[0]!=='f'||tl>=20)&&(G.unlimitedMoney||G.budget-x.c>=keep));if(!o)break;const b=G.budget;
    pcQuiet(()=>o.id[0]==='t'?upgradeTrainLevel():o.id[0]==='s'?upgSt(o.id[1],o.c):upgFac(o.id[1],o.c));if(!G.unlimitedMoney&&G.budget===b)break;
    addLog(`<span style="color:var(--gn)">Program upgrade: ${o.k} for $${o.c.toLocaleString()}.</span>`);}}
// reclassification: the school moves up when it can (state title and the money)
function pcMoveUp(){const O=myClsOrder(),i=O.indexOf(G.cls);if(i<0||i>=O.length-1||!moveUpChamp()||!hasFunds(CLS_MOVEUP_COST[clsEq(G.cls)]||0))return null;
  const old=G.cls;if(!moveUpDo())return null;return bEvPop('Moving up',`After the state title the school moves up from <strong>${clsL(old)}</strong> to <strong style="color:var(--gd)">${clsL(G.cls)}</strong>.`,null,'var(--gd)');}
// his college: in Player Career only you commit him (never the dream school, the AI or signing day on its own)
function pcOwnPick(p){return!!(p&&typeof G!=='undefined'&&G&&G.pcLock&&G.myPlayerId!=null&&p.id===G.myPlayerId);}
function pcOffers(p){return colOpenOffers(p).slice().sort((a,b)=>colPr(b)-colPr(a));}
function pcOfferRows(p){const L=pcOffers(p);return L.length?L.map((o,i)=>`<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--bd)"><span style="flex:1;min-width:0">${ofB(o)}${p.dreamSchool&&o.school===p.dreamSchool.school&&o.lvl===p.dreamSchool.lvl?' <span style="font-size:11px;color:var(--gd)">Dream school</span>':''}</span><button class="btn bsm bgn" onclick="pcCommit(${i})">Commit</button></div>`).join(''):'<div style="color:var(--mu);font-size:13px">No open offers right now.</div>';}
window.pcCommit=function(i){const p=pcActive();if(!p||p.committed)return;const o=pcOffers(p)[i];if(!o)return;const c=COL_BY[o.school+'|'+o.lvl];if(c&&!colRoom(c,p,false)){notify(`${o.school} already filled its ${p.pos} spots in this class.`,'w');return;}
  if(!confirm(`Commit to ${o.school} (${o.lvl})?`))return;p.committed=o;colTakeCommit(p,o);addLog(`<span style="color:var(--gn)">${p.fn} ${p.ln} committed to ${o.school} (${o.lvl}).</span>`);try{addNews('offer',`${p.fn} ${p.ln} commits to ${o.school}`,`${p.pos} · ${o.lvl}`);}catch(e){}
  notify(`${p.fn} ${p.ln} committed to ${o.school}`);clo();const cb=window._pcSignCb;window._pcSignCb=null;if(cb)cb();else nav(G._page||'mine',G._arg);};
// signing day: a senior with open offers and no commitment chooses before the offseason goes on
function pcSignAsk(then){const p=pcActive();if(!p||p.yr!==12||p.committed||p.pcNoCol===G.yr||!pcOffers(p).length)return false;window._pcSignCb=then;
  openMo(`<h2>Signing Day</h2><div style="font-size:13px;color:var(--mu);margin-bottom:10px">${p.fn} ${p.ln} has not committed yet. Choose where he plays college football, or go without an offer (he walks on at a smaller college).</div><div style="max-height:52vh;overflow-y:auto">${pcOfferRows(p)}</div>
    <div style="text-align:right;margin-top:12px"><button class="bgh" onclick="pcNoCollege()">No commitment, walk on</button></div>`);return true;}
window.pcNoCollege=function(){const p=pcActive();if(p)p.pcNoCol=G.yr;clo();const cb=window._pcSignCb;window._pcSignCb=null;if(cb)cb();};
// two-way: your player can also line up on the other side of the ball
function pcUnitOf(pos){return['QB','RB','WR','TE','OL'].includes(pos)?'o':['DL','LB','CB','S'].includes(pos)?'d':'k';}
function pcTwo(p){return!!(p&&p.pos2&&p.pos2!==p.pos&&pcUnitOf(p.pos)!=='k'&&pcUnitOf(p.pos2)!=='k'&&pcUnitOf(p.pos2)!==pcUnitOf(p.pos));}
window.pcSetPos2=function(v){const p=myPlayer();if(!p)return;p.pos2=v&&v!==p.pos&&pcUnitOf(v)!==pcUnitOf(p.pos)?v:null;notify(p.pos2?`${p.fn} ${p.ln} also plays ${p.pos2}`:`${p.fn} ${p.ln} plays only ${p.pos}`);nav(G._page||'mine',G._arg);};
function pcTwoPanel(p){if(pcUnitOf(p.pos)==='k')return'';const O=(pcUnitOf(p.pos)==='o'?['DL','LB','CB','S']:['QB','RB','WR','TE']);
  return`<div class="pnl"><div class="ph">Two-way player</div><div class="pb" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span style="font-size:13px">Also plays</span><select style="width:auto;min-height:0" onchange="pcSetPos2(this.value)"><option value="">Nothing else</option>${O.map(x=>`<option value="${x}"${p.pos2===x?' selected':''}>${x}</option>`).join('')}</select><span style="font-size:11px;color:var(--mu)">A two-way player is on the field for offense and defense, on Game Day and in simulated games.</span></div></div>`;}
// on every page change: nothing the coach would handle is left waiting
function pcAutoTick(){if(!pcAuto()||ccOn()||!G.myId||!myS()||!Array.isArray(G.players))return;
  if(!G.pcAutoV){G.pcAutoV=1;G.benched={};for(const p of G.players)if(p.sId===G.myId)p.depth={};} // older saves: the hand-set depth chart goes
  else if(G.benched&&Object.keys(G.benched).some(k=>(G.benched[k]||[]).length))G.benched={};
  if(Array.isArray(G.sched)&&G.sched.some(g=>g.custom&&g._empty))pcAutoSched();
  pcAutoSP();pcAutoCaptains();pcAutoMoney();}
// ═══════════ COLLEGE CAREER ═══════════
// Player Career goes on after high school: you play for the college you signed with. Every college fields the high school
// players it signed (rated for college: 15 to 30 overall lower than in high school, less for the best players and big stat
// lines), conferences play a full season with title games, FBS has the 12-team playoff and bowls, the other levels their
// own playoffs. Redshirts (4 games), coach trust, weekly goals, NIL money, the transfer portal in January and the pro draft
// once you are three years out of high school, or undrafted free agency, or no pro team at all.
const CC_LV=['FBS','FCS','D2','D3','NAIA','JUCO'];
const CC_G={FBS:12,FCS:11,D2:11,D3:10,NAIA:10,JUCO:9},CC_CG={FBS:8,FCS:8,D2:8,D3:8,NAIA:8,JUCO:6};
const CC_PO={FBS:12,FCS:24,D2:28,D3:32,NAIA:16,JUCO:8},CC_CLS={FBS:22,FCS:20,D2:19,D3:22,NAIA:17,JUCO:28};
const CC_ENT={FBS:[60,70],FCS:[53,61],D2:[49,56],D3:[43,51],NAIA:[46,53],JUCO:[47,55]};
const CC_LVN={FBS:'FBS',FCS:'FCS',D2:'Division II',D3:'Division III',NAIA:'NAIA',JUCO:'Junior college'};
const CC_STAD={FBS:20,FCS:16,D2:13,D3:10,NAIA:10,JUCO:8};
const CC_CN={FBS:['Southern Athletic','Great Lakes','Pacific Union','Atlantic Coast Alliance','Heartland','Frontier','Gulf Coast','Mid-Plains','Mountain Range','Tidewater','Northern Valley','Bayou','Desert Sun','Keystone','Cascade'],
  FCS:['Coastal Athletic Union','Great Plains Football','River Valley','Big Prairie','Southland Coast','Sky Peaks','Ivy Hills','Northeast Shore','Blue Ridge Union','Delta Athletic','Patriot Heights','Granite League','Bluebonnet'],
  D2:['Lone Prairie','Great Northern','Peach Belt Union','Gulf South Union','Rocky Peaks','Mid-America Union','Keystone Valley','Northern Sun Union','South Atlantic Union','Great Midwest Union','Mountain East Union','Pacific Rim Union','Heartland Union','Bluegrass Union','Golden Plains'],
  D3:['Centennial Union','Liberty Union','Midwest Athletic','Ohio River Union','Empire Union','New England Union','Northwest Union','Southern Collegiate','Commonwealth Coast','Upper Midwest','Old Dominion Union','Lakes Union','Iowa Prairie','Hill Country','Minnesota North','Lakeshore','Allegheny','Hudson Valley','Piedmont','Great Western','Bay State'],
  NAIA:['Frontier Union','Heart of America Union','Kansas Plains','Mid-States','Sooner Plains','Great Plains Union','Appalachian Union','Sun Coast Union','Mid-South','Cascade Collegiate'],
  JUCO:['Jayhawk Plains','Southwest Junior','Northern Junior','Delta Junior','Western States Junior','Midwest Junior','Coastal Junior','Golden State Junior','Empire Junior','Lone Star Junior','Bayou Junior']};
const CC_BOWLS=['Sunshine Classic','Desert Gold Bowl','Lone Prairie Bowl','Harbor Lights Bowl','Magnolia Bowl','Peach Orchard Bowl','Mountain Pass Bowl','River City Bowl','Gulf Breeze Bowl','Pine Ridge Bowl','Liberty Bell Bowl','Silver State Bowl','High Plains Bowl','Bluegrass Bowl','Copper Bowl','Evergreen Bowl','Lakeshore Bowl','Bayside Bowl','Capital Bowl','Heartland Bowl','Island Bowl','Canyon Bowl','Twin Rivers Bowl','Redwood Bowl','Prairie Wind Bowl','Gateway Bowl','Crescent City Bowl','Keystone Bowl','Northern Lights Bowl','Sugarcane Bowl','Riverboat Bowl','Hall of Champions Bowl','Coastal Classic','Big Country Bowl','Frontier Trail Bowl','Golden Isles Bowl'];
const CC_TOPB=['Garden Bowl','Bayou Bowl','Tropic Bowl','Orchard Bowl'];
const CC_MVP={FBS:'Gridiron Crown Trophy',FCS:'Prairie Cup',D2:'Hill Country Trophy',D3:'Small College Crown',NAIA:'Heartland Medal',JUCO:'Junior College Player of the Year'};
const CC_POSAW={QB:'Field General Award',RB:'Iron Stallion Award',WR:'Golden Hands Award',TE:'Keystone Award',OL:'Granite Wall Trophy',DL:'Ironclad Trophy',LB:'Linebacker Lion Award',CB:'Shutdown Award',S:'Shutdown Award',K:'Steady Boot Award'};
const CC_GOAL={QB:['passYds',250,'250 passing yards'],RB:['rushYds',100,'100 rushing yards'],WR:['recYds',80,'80 receiving yards'],TE:['rec',5,'5 catches'],OL:['pancakes',3,'3 pancake blocks'],DL:['sacks',1,'a sack'],LB:['tackles',8,'8 tackles'],CB:['pbu',2,'2 pass breakups or a pick'],S:['tackles',6,'6 tackles'],K:['fgm',2,'2 field goals']};
const CC_DEAL=[['Hometown Motors','a local car dealership ad'],['Bolt Hydration','a sports drink commercial'],['PeakForm Training','a training app partnership'],['Campus Eats','a food delivery promo'],['Gridiron Gear','a cleats and gloves deal'],['StreamLine Gaming','a gaming stream sponsorship'],['Summit Bank','a bank billboard'],['Iron Temple Gym','a gym membership deal']];
function ccOn(){return!!(typeof G!=='undefined'&&G&&G.cc&&G.cc.on);}
function ccR(seed){let h=(seed>>>0)||1;return()=>{h=(h+0x6D2B79F5)>>>0;let t=Math.imul(h^h>>>15,1|h);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function ccH(...a){let h=2166136261;for(const ch of a.join('|'))h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0;}
function ccN(r){return(r()+r()+r()-1.5)*2;}
let _ccIxN=-1,_ccIx=new Map();
function ccIx(k){if(_ccIxN!==COLLEGES.length||!_ccIx.has(k)){_ccIx=new Map();COLLEGES.forEach((c,i)=>_ccIx.set(c.school+'|'+c.lvl,i));_ccIxN=COLLEGES.length;}const i=_ccIx.get(k);return i==null?(ccH(k)%5000)+1000:i;}
function ccName(k){const i=k.lastIndexOf('|');return k.slice(0,i);}
function ccLvlOf(k){return k.slice(k.lastIndexOf('|')+1);}
function ccYear(){return 2026+(G.yr-1);}
// how a high school player starts in college: 15 to 30 under his high school overall (the best players and big stat lines lose the least)
function ccEntryDrop(rat,perf,noise){const q=clamp((rat-60)/35,0,1)*0.7+clamp(perf||0,0,1)*0.3;return clamp(Math.round(30-15*q+(noise||0)),15,30);}
function ccHsPerf(p){try{return clamp((calcSS(p)||0)/90,0,1);}catch(e){return 0.3;}}
function ccPotC(ent,dev,hsGap){return clamp(Math.round(ent+({Elite:17,Star:14,Impact:11,Normal:8}[dev]||9)+Math.max(0,hsGap||0)*0.5),ent+3,99);}
// ── rosters: every signee is kept as a short record (no ratings stored: they come from the player's id, position and overall);
// the rest of the depth chart is generated from a seed, so a college always shows the same players
function ccTup(p,lvl){const drop=ccEntryDrop(p.rat,ccHsPerf(p),(((p.id||1)*2654435761>>>0)%7-3)/2),ent=clamp(p.rat-drop,25,95),s=getS(p.sId);
  return[p.id,p.fn,p.ln,p.pos,ent,G.yr,ccPotC(ent,p.dev,(p.pot||p.rat)-p.rat),p.stars||0,s?s.id:0,p.fs!=null?p.fs:p.id,(p.dev||'N')[0]];}
function ccGrow(id,dev){const h=((id||1)*2246822519)>>>0;return 2+(h%5)+({E:2,S:1,I:0,N:-1}[dev]||0);}
function ccPosPick(r){const T=Object.entries(POS_CNT_BASE),tot=T.reduce((a,b)=>a+b[1],0);let x=r()*tot;for(const[p,n]of T){if((x-=n)<0)return p;}return'WR';}
let _ccPrM=null,_ccPrN=-1;
function ccPrN(c){if(_ccPrN!==COLLEGES.length||!_ccPrM){_ccPrM={};for(const x of COLLEGES){const m=_ccPrM[x.lvl]||(_ccPrM[x.lvl]=[99,1]);m[0]=Math.min(m[0],x.pr);m[1]=Math.max(m[1],x.pr);}_ccPrN=COLLEGES.length;}const m=_ccPrM[c.lvl]||[0,1];return m[1]>m[0]?(c.pr-m[0])/(m[1]-m[0]):0.5;}
// a few rosters stay in memory (yours and this week's opponent); strengths are kept per season
const _ccRC={v:null,m:new Map()};
function ccRosterInv(){_ccRC.v=null;_ccRC.m.clear();}
function ccRoster(k,noKeep){const c=COL_BY[k];if(!c||!G.cc)return[];const ck=G.yr+'|'+(G.cc.rv||0);if(_ccRC.v!==ck){_ccRC.m.clear();_ccRC.v=ck;}const hit=_ccRC.m.get(k);if(hit)return hit;
  const Y=G.yr,lvl=c.lvl,maxY=lvl==='JUCO'?2:5,real=(G.cc.R&&G.cc.R[k])||[],ci=ccIx(k),pn=ccPrN(c),E=CC_ENT[lvl]||[50,56],out=[];
  for(let cy=0;cy<maxY;cy++){const eY=Y-cy,yr=cy+1,mine=real.filter(t=>t[5]===eY);
    for(const t of mine){if(G.cc.p&&t[0]===G.cc.pid)continue;const rat=Math.min(t[6],Math.round(t[4]+ccGrow(t[0],t[10])*(Y-eY))),hs=getS(t[8]),IS=IDEAL_SIZE[t[3]]||[73,200],h=((t[0]||1)*2654435761)>>>0;
      out.push({id:t[0],fn:t[1],ln:t[2],pos:t[3],rat,pot:t[6],yr,stars:t[7],hs:hs?hs.name:'',hst:hs?stOf(hs):'',fs:t[9],ht:IS[0]+(h%5)-2,wt:IS[1]+(h>>>3)%31-15,real:true});}
    const r=ccR(ccH('fill',ci,eY)),n=Math.max(0,(CC_CLS[lvl]||20)-mine.length);
    for(let i=0;i<n;i++){const pos=ccPosPick(r),ent=Math.round(E[0]+(E[1]-E[0])*pn+ccN(r)*4),pot=Math.min(99,Math.round(ent+6+r()*12)),gr=2+Math.floor(r()*5),fn=FN[Math.floor(r()*FN.length)],ln=LN[Math.floor(r()*LN.length)];
      const IS=IDEAL_SIZE[pos]||[73,200],ht=Math.round(IS[0]+ccN(r)*1.5),wt=Math.round(IS[1]+ccN(r)*12),keep=r();
      if(cy===4&&keep>0.35)continue;if(cy===3&&ent>=72&&keep<0.4)continue; // most fifth years are gone, some juniors left early for the draft
      out.push({id:6000000+ci*600+(eY%10)*45+i,fn,ln,pos,rat:Math.min(pot,ent+gr*cy),pot,yr,stars:ent>=74?4:ent>=67?3:ent>=58?2:1,hs:'',hst:'',fs:ccH(ci,eY,i)%100000,ht,wt,real:false});}}
  if(k===G.cc.k&&G.cc.p)out.push(G.cc.p);
  const nums={};if(k===G.cc.k&&G.cc.p&&G.cc.p.num!=null)nums[G.cc.p.num]=1;
  for(const q of out){if(q===G.cc.p)continue;const L=posNums(q.pos),b=(q.id>>>0)%L.length;let n=L[b];for(let j=1;nums[n]&&j<L.length;j++)n=L[(b+j)%L.length];nums[n]=1;q.num=n;}
  if(!noKeep){if(_ccRC.m.size>=8)_ccRC.m.delete(_ccRC.m.keys().next().value);_ccRC.m.set(k,out);}return out;}
const CC_ST={QB:1,RB:1,WR:3,TE:1,OL:5,DL:4,LB:3,CB:2,S:2,K:1};
function ccStrOf(list){let s=0,n=0;for(const pos in CC_ST){const L=list.filter(p=>p.pos===pos).map(p=>p.rat).sort((a,b)=>b-a).slice(0,CC_ST[pos]);for(let i=0;i<CC_ST[pos];i++){s+=L[i]!=null?L[i]:(L.length?L[L.length-1]-6:45);n++;}}return n?s/n:50;}
function ccStr(k){const S=G.cc.str||(G.cc.str={});if(S[k]==null)S[k]=Math.round(ccStrOf(ccRoster(k,k!==G.cc.k))*10)/10;return S[k];}
// ── conferences: grouped by region; at FBS the strongest programs form four power conferences
function ccRegion(st){try{const u=USST[st];return(u?u[1]:'Z')+st;}catch(e){return'Z'+st;}}
function ccChunk(a,n){n=Math.max(1,Math.min(n,a.length));const out=[];for(let i=0;i<n;i++)out.push(a.slice(Math.floor(i*a.length/n),Math.floor((i+1)*a.length/n)));return out.filter(x=>x.length);}
function ccBuildConf(){try{_colStReady();}catch(e){}const list=[],by={};
  for(const lvl of CC_LV){const T=COLLEGES.filter(c=>c.lvl===lvl).map(c=>({k:c.school+'|'+c.lvl,pr:c.pr,rg:ccRegion(colInfo(c.school+'|'+c.lvl).st)}));if(!T.length)continue;
    const geo=a=>a.slice().sort((x,y)=>x.rg<y.rg?-1:x.rg>y.rg?1:y.pr-x.pr);let groups=[],p4=0;
    const size={FBS:11,FCS:11,D2:12,D3:9,NAIA:10,JUCO:10}[lvl];
    if(lvl==='FBS'&&T.length>=56){const P=Math.min(68,Math.round(T.length*0.48)),S=T.slice().sort((a,b)=>b.pr-a.pr);groups=ccChunk(geo(S.slice(0,P)),4);p4=groups.length;groups=groups.concat(ccChunk(geo(S.slice(P)),Math.max(1,Math.round((T.length-P)/size))));}
    else groups=ccChunk(geo(T),Math.max(1,Math.round(T.length/size)));
    const N=CC_CN[lvl]||[];groups.forEach((g,i)=>{const ix=list.length;list.push({name:(N[i]||(CC_LVN[lvl]+' Conference '+(i+1)))+(N[i]&&!/(League|Union|Conference|Alliance)$/.test(N[i])?' Conference':''),lvl,t:g.map(x=>x.k),p4:i<p4});for(const x of g)by[x.k]=ix;});}
  return{list,by};}
function ccConfFix(){const C=G.cc.conf;if(!C)return;for(const c of COLLEGES){const k=c.school+'|'+c.lvl;if(C.by[k]!=null&&C.list[C.by[k]]&&C.list[C.by[k]].t.includes(k))continue;
    const opts=C.list.map((x,i)=>[x,i]).filter(([x])=>x.lvl===c.lvl).sort((a,b)=>a[0].t.length-b[0].t.length);if(!opts.length)continue;opts[0][0].t.push(k);C.by[k]=opts[0][1];}
  for(const x of C.list)x.t=x.t.filter(k=>COL_BY[k]&&C.by[k]===C.list.indexOf(x));}
function ccSetConf(k,i){const C=G.cc&&G.cc.conf;if(!C||!C.list[i]||C.list[i].lvl!==ccLvlOf(k))return;const o=C.by[k];if(o===i)return;if(o!=null&&C.list[o])C.list[o].t=C.list[o].t.filter(x=>x!==k);C.list[i].t.push(k);C.by[k]=i;}
function ccConfName(k){const C=G.cc&&G.cc.conf;const i=C&&C.by[k];return i!=null&&C.list[i]?C.list[i].name:'';}
// ── the season: every level plays its schedule, conference games at the end of the season
function ccRound(list){const a=list.slice();if(a.length%2)a.push(null);const n=a.length,R=[];for(let r=0;r<n-1;r++){const pr=[];for(let i=0;i<n/2;i++){const x=a[i],y=a[n-1-i];if(x&&y)pr.push(r%2?[y,x]:[x,y]);}R.push(pr);a.splice(1,0,a.pop());}return R;}
function ccBuildSeason(){const S={},r=ccR(ccH('season',G.yr,G.cc.pid));
  for(const lvl of CC_LV){const confs=G.cc.conf.list.filter(c=>c.lvl===lvl&&c.t.length);const T=confs.flatMap(c=>c.t);if(T.length<2)continue;
    const R=CC_G[lvl],W=[];for(let w=0;w<R;w++)W.push([]);const met={},busy=W.map(()=>new Set());
    const mk=(a,b)=>((met[a]||(met[a]=new Set())).add(b),(met[b]||(met[b]=new Set())).add(a));
    for(const cf of confs){const sh=cf.t.slice().sort(()=>r()-.5),rounds=ccRound(sh),cg=Math.min(CC_CG[lvl],rounds.length,R-1);
      for(let i=0;i<cg;i++){const w=R-cg+i;for(const[a,b]of rounds[i]){W[w].push({a,b,h:r()<.5?0:1,c:1});busy[w].add(a);busy[w].add(b);mk(a,b);}}}
    for(let w=0;w<R;w++){const pool=T.filter(k=>!busy[w].has(k)).sort(()=>r()-.5);
      while(pool.length>1){const a=pool.shift(),ca=G.cc.conf.by[a];let j=pool.findIndex(b=>G.cc.conf.by[b]!==ca&&!(met[a]&&met[a].has(b)));if(j<0)j=pool.findIndex(b=>!(met[a]&&met[a].has(b)));if(j<0)j=0;const b=pool.splice(j,1)[0];W[w].push({a,b,h:r()<.5?0:1,c:0});mk(a,b);}}
    const rec={};for(const k of T)rec[k]=[0,0,0,0,0,0];S[lvl]={T,W,rec};}
  return S;}
function ccPts(x){x=Math.max(0,x);const td=Math.floor(x/7),rem=x-td*7,fg=rem>=4.5?2:rem>=1.5?1:0;let p=td*7+fg*3;if(td>0&&Math.random()<.06)p--;return Math.max(0,p);}
function ccSimScore(sa,sb,ha){const d=sa-sb+(ha===0?2.5:ha===1?-2.5:0),m=d*1.5+gaussR()*12,tot=48+gaussR()*9+(sa+sb-130)*0.15;let A=ccPts((tot+m)/2),B=ccPts((tot-m)/2);
  if(A===B){if(Math.random()<1/(1+Math.exp(-d/6)))A+=Math.random()<.6?7:3;else B+=Math.random()<.6?7:3;}return[A,B];}
function ccRec(lvl,a,b,sa,sb,conf){const R=G.cc.S[lvl].rec,x=R[a]||(R[a]=[0,0,0,0,0,0]),y=R[b]||(R[b]=[0,0,0,0,0,0]);
  if(sa>sb){x[0]++;y[1]++;if(conf){x[2]++;y[3]++;}}else{y[0]++;x[1]++;if(conf){y[2]++;x[3]++;}}x[4]+=sa;x[5]+=sb;y[4]+=sb;y[5]+=sa;}
function ccMyGameAt(w){const L=G.cc.S[G.cc.lvl];if(!L||!L.W[w])return null;return L.W[w].find(g=>g.a===G.cc.k||g.b===G.cc.k)||null;}
function ccSimWeekRest(w){for(const lvl in G.cc.S){const L=G.cc.S[lvl];for(const g of L.W[w]||[]){if(g.s)continue;if(g.a===G.cc.k||g.b===G.cc.k)continue;g.s=ccSimScore(ccStr(g.a),ccStr(g.b),g.h);ccRec(lvl,g.a,g.b,g.s[0],g.s[1],g.c);}}}
// rankings: record, margin, schedule strength and roster strength (the strength matters most early in the season)
function ccRank(lvl){const L=G.cc.S&&G.cc.S[lvl];if(!L)return[];const wp=k=>{const x=L.rec[k];return x&&(x[0]+x[1])?x[0]/(x[0]+x[1]):0.5;},opp={};
  for(const W of L.W)for(const g of W)if(g.s){(opp[g.a]||(opp[g.a]=[])).push(g.b);(opp[g.b]||(opp[g.b]=[])).push(g.a);}
  const P=G.cc.P&&G.cc.P[lvl];if(P)for(const g of(P.all||[]))if(g.s){(opp[g.a]||(opp[g.a]=[])).push(g.b);(opp[g.b]||(opp[g.b]=[])).push(g.a);}
  const sc=k=>{const x=L.rec[k]||[0,0,0,0,0,0],gp=x[0]+x[1],o=opp[k]||[],sos=o.length?o.reduce((a,b)=>a+wp(b),0)/o.length:0.5;return wp(k)*55+clamp(gp?(x[4]-x[5])/gp:0,-30,30)*0.55+sos*20+ccStr(k)*(gp<4?0.45:0.3);};
  return L.T.map(k=>({k,s:sc(k)})).sort((a,b)=>b.s-a.s).map(x=>x.k);}
// ── postseason: FBS conference title games, the 12-team playoff (5 highest-ranked champions get in, straight seeding, top 4
// get byes) and bowls for six-win teams; the other levels play brackets with byes for the top seeds
function ccSeedOrder(P){let a=[1];while(a.length<P){const n=a.length*2,b=[];for(const s of a){b.push(s,n+1-s);}a=b;}return a;}
function ccBracket(field){let P=1;while(P<field.length)P*=2;return{P,cur:ccSeedOrder(P).map(s=>field[s-1]||null),seed:Object.fromEntries(field.map((k,i)=>[k,i+1])),rd:0};}
function ccRoundName(lvl,n){if(n<=2)return lvl==='FBS'?'National Championship':CC_LVN[lvl]+' National Championship';if(n<=4)return'Semifinal';if(n<=8)return'Quarterfinal';if(n<=16&&lvl!=='FBS')return'Second Round';return'First Round';}
function ccBrGames(lvl,br){const g=[],n=br.cur.length;for(let i=0;i<n;i+=2){const a=br.cur[i],b=br.cur[i+1];if(a&&b)g.push({a,b,h:lvl==='FBS'&&n===16?0:n<=4?2:0,c:0,po:1,i,n:ccRoundName(lvl,n)+(lvl==='FBS'&&n===8?' · '+CC_TOPB[(i/2)%4]:'')});}return g;}
function ccBrAdvance(br,games){const nx=[];for(let i=0;i<br.cur.length;i+=2){const a=br.cur[i],b=br.cur[i+1];if(a&&!b)nx.push(a);else if(b&&!a)nx.push(b);else if(a&&b){const g=games.find(x=>x.i===i);nx.push(g&&g.s?(g.s[0]>g.s[1]?g.a:g.b):a);}else nx.push(null);}br.cur=nx;br.rd++;}
function ccPostStart(){G.cc.P={};G.cc.pw=0;for(const lvl in G.cc.S){const L=G.cc.S[lvl],n=L.T.length,P={lvl,all:[],stage:'po',pend:[]};G.cc.P[lvl]=P;
    if(lvl==='FBS'){P.stage='ccg';const rk=ccRank(lvl),ri=Object.fromEntries(rk.map((k,i)=>[k,i]));
      for(const cf of G.cc.conf.list.filter(c=>c.lvl==='FBS'&&c.t.length>=4)){const t=cf.t.filter(k=>L.rec[k]).sort((a,b)=>{const x=L.rec[a],y=L.rec[b],cx=x[2]/(x[2]+x[3]||1),cy=y[2]/(y[2]+y[3]||1);return cy-cx||(y[0]-x[0])||(ri[a]-ri[b]);});
        if(t.length>=2)P.pend.push({a:t[0],b:t[1],h:2,c:1,po:1,ccg:1,n:cf.name+' Championship'});}
      if(!P.pend.length)ccFieldFBS(P);}
    else{const N=Math.min(CC_PO[lvl]||8,Math.floor(n/3));if(N<2){P.stage='done';P.champ=ccRank(lvl)[0]||null;continue;}P.br=ccBracket(ccRank(lvl).slice(0,N));P.pend=ccBrGames(lvl,P.br);}}}
function ccFieldFBS(P){const L=G.cc.S.FBS,rk=ccRank('FBS'),n=L.T.length,N=n>=48?12:n>=24?8:4,auto=N===12?5:N===8?3:0,champs=[];
  for(const cf of G.cc.conf.list.filter(c=>c.lvl==='FBS'&&c.t.length)){const g=P.all.find(x=>x.ccg&&cf.t.includes(x.a));let ch=g&&g.s?(g.s[0]>g.s[1]?g.a:g.b):null;
    if(!ch)ch=cf.t.filter(k=>L.rec[k]).sort((a,b)=>{const x=L.rec[a],y=L.rec[b];return(y[2]/(y[2]+y[3]||1))-(x[2]/(x[2]+x[3]||1))||rk.indexOf(a)-rk.indexOf(b);})[0];if(ch)champs.push(ch);}
  P.champs=champs;const inn=new Set(champs.slice().sort((a,b)=>rk.indexOf(a)-rk.indexOf(b)).slice(0,auto));for(const k of rk){if(inn.size>=N)break;inn.add(k);}
  const field=rk.filter(k=>inn.has(k));P.field=field;P.br=ccBracket(field);P.stage='po';P.pend=ccBrGames('FBS',P.br);
  const el=rk.filter(k=>!inn.has(k)&&L.rec[k]&&L.rec[k][0]>=6).slice(0,72);P.bowls=[];for(let i=0;i+1<el.length&&P.bowls.length<CC_BOWLS.length;i+=2)P.bowls.push({a:el[i],b:el[i+1],h:2,c:0,po:1,bowl:1,n:CC_BOWLS[P.bowls.length]});P.bowlDone=false;}
// games still to play this postseason week (bowls go with the playoff quarterfinals)
function ccPostWeek(){const out=[];for(const lvl in G.cc.P){const P=G.cc.P[lvl];if(P.stage==='done')continue;for(const g of P.pend)if(!g.s)out.push([lvl,g]);
    if(lvl==='FBS'&&P.stage==='po'&&P.br&&P.br.cur.length===Math.min(8,P.br.P)&&!P.bowlDone)for(const g of P.bowls||[])if(!g.s)out.push([lvl,g]);}return out;}
function ccMyPost(){return ccPostWeek().find(([l,g])=>g.a===G.cc.k||g.b===G.cc.k)||null;}
function ccPostResolve(lvl,g){const L=G.cc.S[lvl];ccRec(lvl,g.a,g.b,g.s[0],g.s[1],0);G.cc.P[lvl].all.push(g);void L;}
function ccPostRest(){for(const[lvl,g]of ccPostWeek()){if(g.a===G.cc.k||g.b===G.cc.k)continue;g.s=ccSimScore(ccStr(g.a),ccStr(g.b),g.h);ccPostResolve(lvl,g);}}
function ccPostAdvance(){for(const lvl in G.cc.P){const P=G.cc.P[lvl];if(P.stage==='done')continue;if(P.pend.some(g=>!g.s))continue;
    if(lvl==='FBS'&&P.br&&P.br.cur.length===Math.min(8,P.br.P)&&!P.bowlDone){if((P.bowls||[]).some(g=>!g.s))continue;P.bowlDone=true;}
    if(P.stage==='ccg'){ccFieldFBS(P);continue;}
    ccBrAdvance(P.br,P.pend);if(P.br.cur.filter(Boolean).length<=1){P.stage='done';P.champ=P.br.cur.find(Boolean)||null;P.pend=[];
      try{const me=P.champ===G.cc.k;addNews(me?'myteam':'general',`${ccName(P.champ)} win the ${lvl==='FBS'?'National Championship':CC_LVN[lvl]+' title'}`,`${ccYear()} champions: ${colInfo(P.champ).name} ${colInfo(P.champ).mascot}.`);}catch(e){}}
    else P.pend=ccBrGames(lvl,P.br);}
  G.cc.pw++;}
function ccPostDone(){return!!G.cc.P&&Object.values(G.cc.P).every(P=>P.stage==='done');}
// ── your player: role on the depth chart, coach trust, redshirt and eligibility
function ccMe(){return G.cc&&G.cc.p;}
function ccRole(){const p=ccMe(),tr=G.cc.trust==null?50:G.cc.trust,sc=q=>q.rat+(q===p?(tr-50)/6:0);const mates=ccRoster(G.cc.k).filter(q=>q.pos===p.pos).sort((a,b)=>sc(b)-sc(a)),rank=Math.max(0,mates.indexOf(p)),n=PC_STARTERS[p.pos]||1;
  return{start:rank<n,rank:rank+1,n,share:clamp(0.25+(tr-40)/90,0.15,0.9),mates};}
function ccClassLbl(){const ys=G.yr-G.cc.y0+1,L=['Freshman','Sophomore','Junior','Senior','Fifth year'];return G.cc.rsUsed?(ys>=2?'Redshirt '+L[Math.min(3,ys-2)]:'Freshman'):L[Math.min(4,ys-1)];}
function ccYrsOut(){return G.yr-G.cc.y0+1;}
function ccEligLeft(){return Math.max(0,Math.min(4-(G.cc.used||0),5-(G.cc.car||[]).length));}
function ccSeasonsDone(){return(G.cc.car||[]).length;}
function ccRsLocked(){return!!(G.cc.rsWant&&!G.cc.rsUsed&&(G.cc.gp||0)>=4);}
// stat lines for simulated games, by position and role
function ccPois(l){let k=0,p=Math.exp(-l),s=p,u=Math.random();while(u>s&&k<12){k++;p*=l/k;s+=p;}return k;}
function ccGenLine(p,start,share,edge){const r=p.rat,f=start?1:share*0.6,e=clamp(1+edge*0.02,0.7,1.3),o={};
  if(p.pos==='QB'){const att=Math.round((28+gaussR()*6)*f),cp=clamp(0.52+(r-60)*0.006+gaussR()*0.05,0.4,0.8),ypa=clamp(6+(r-60)*0.06+gaussR()*1.2,3,13)*e;o.passAtt=att;o.passCmp=Math.round(att*cp);o.passYds=Math.round(att*ypa);o.passTD=ccPois(1.6*f*e*r/72);o.passInt=ccPois(0.8*f*72/r);o.rushAtt=Math.round(4*f);o.rushYds=Math.round((10+gaussR()*15)*f);o.rushTD=ccPois(0.2*f);}
  else if(p.pos==='RB'){const att=Math.round((16+gaussR()*5)*f);o.rushAtt=Math.max(0,att);o.rushYds=Math.round(o.rushAtt*clamp(3.8+(r-60)*0.05+gaussR()*1.1,1,9)*e);o.rushTD=ccPois(0.8*f*e);o.rec=ccPois(2*f);o.recYds=Math.round(o.rec*(8+gaussR()*3));}
  else if(p.pos==='WR'||p.pos==='TE'){const tg=p.pos==='WR'?4.5:2.6;o.rec=ccPois(tg*f*e*r/72);o.recYds=Math.round(o.rec*clamp((p.pos==='WR'?12:10)+(r-60)*0.1+gaussR()*3,4,25));o.recTD=ccPois((p.pos==='WR'?0.45:0.25)*f*e);}
  else if(p.pos==='OL'){o.pancakes=ccPois(2*f*r/70);}
  else if(p.pos==='DL'){o.tackles=ccPois(3*f);o.sacks=ccPois(0.45*f*r/72);}
  else if(p.pos==='LB'){o.tackles=ccPois(7*f);o.sacks=ccPois(0.3*f);o.ints=ccPois(0.06*f);}
  else if(p.pos==='CB'){o.tackles=ccPois(4*f);o.pbu=ccPois(0.9*f*r/72);o.ints=ccPois(0.15*f*r/72);}
  else if(p.pos==='S'){o.tackles=ccPois(6*f);o.ints=ccPois(0.15*f);o.pbu=ccPois(0.5*f);}
  else if(p.pos==='K'){o.fga=start?ccPois(2):0;o.fgm=Math.min(o.fga,Math.round(o.fga*clamp(0.6+(r-60)*0.01,0.4,0.95)));o.xpm=start?ccPois(3):0;}
  if(pcTwo(p)){const d=ccGenLine(Object.assign({},p,{pos:p.pos2,pos2:null,rat:r-4}),start,share,edge);for(const k in d)o[k]=(o[k]||0)+d[k];} // two-way: his snaps on the other side
  return o;}
const CC_SK=['passAtt','passCmp','passYds','passTD','passInt','rushAtt','rushYds','rushTD','rec','recYds','recTD','tackles','sacks','ints','pbu','pancakes','fga','fgm','xpm'];
function ccAddSt(a,b){for(const k of CC_SK)if(b[k])a[k]=(a[k]||0)+b[k];return a;}
function ccLine(pos,s){if(!s)return'';const x=k=>s[k]||0;const P=[];
  if(x('passAtt'))P.push(`${x('passCmp')}/${x('passAtt')}, ${x('passYds')} pass yds, ${x('passTD')} TD, ${x('passInt')} INT`);
  if(x('rushAtt')||x('rushYds'))P.push(`${x('rushAtt')} car, ${x('rushYds')} rush yds${x('rushTD')?`, ${x('rushTD')} TD`:''}`);
  if(x('rec'))P.push(`${x('rec')} rec, ${x('recYds')} yds${x('recTD')?`, ${x('recTD')} TD`:''}`);
  if(x('tackles')||x('sacks')||x('ints')||x('pbu'))P.push(`${x('tackles')} tkl${x('sacks')?`, ${x('sacks')} sacks`:''}${x('ints')?`, ${x('ints')} INT`:''}${x('pbu')?`, ${x('pbu')} PBU`:''}`);
  if(x('pancakes'))P.push(`${x('pancakes')} pancakes`);if(x('fga'))P.push(`${x('fgm')}/${x('fga')} FG`);
  return P.join(' · ')||'No stats';}
// production per game against what a strong starter at the position puts up (0 to 15)
function ccPerf(pos,s,gp){if(!s||!gp)return 0;const g=k=>(s[k]||0)/gp;let v=0;
  if(pos==='QB')v=g('passYds')/250*5+g('passTD')/2*5-g('passInt')*1.5+g('rushYds')/40;else if(pos==='RB')v=g('rushYds')/100*7+g('rushTD')*3+g('recYds')/40;
  else if(pos==='WR')v=g('recYds')/80*7+g('recTD')*4+g('rec')/5;else if(pos==='TE')v=g('recYds')/50*6+g('recTD')*4+g('rec')/4;else if(pos==='OL')v=g('pancakes')/2.5*8;
  else if(pos==='DL')v=g('sacks')*8+g('tackles')/4*3;else if(pos==='LB')v=g('tackles')/8*7+g('sacks')*3+g('ints')*6;else if(pos==='CB')v=g('pbu')*4+g('ints')*12+g('tackles')/5;
  else if(pos==='S')v=g('tackles')/7*5+g('ints')*10+g('pbu')*3;else if(pos==='K')v=g('fgm')*3+(s.fga?(s.fgm/s.fga)*4:0);return clamp(v,0,15);}
// ── NIL: what your name, image and likeness bring in a year (revenue share and collective money plus endorsements)
function ccNilVal(k,p,perf){k=k||G.cc.k;p=p||ccMe();const c=COL_BY[k]||{pr:50},lvl=ccLvlOf(k);
  const lm={FBS:1,FCS:.22,D2:.07,D3:.015,NAIA:.045,JUCO:.035}[lvl]||.05,pm={QB:1.8,WR:1.2,DL:1.2,RB:1.0,CB:1.0,OL:1.1,TE:.9,LB:.9,S:.85,K:.3}[p.pos]||1;
  const fr=ccYrsOut()<=1?({5:2,4:1.3}[p.stars]||1):1,aw=(G.cc.aw||[]).some(a=>a.y===G.yr-1&&a.big)?1.5:1;
  const fol=(G.soc&&G.soc.fol)||0; // social reach: about $5K for every 1,000 followers at FBS
  return Math.round((17000*Math.exp((p.rat-62)*0.15)*pm*lm*(0.5+c.pr/140)*fr*aw*(1+(perf||0)/30)+fol*5*lm)/100)*100;}
function ccMoney(v){return v>=1e6?'$'+(v/1e6).toFixed(v>=1e7?0:1)+'M':v>=1000?'$'+Math.round(v/1000)+'K':'$'+v;}
// ── draft: three years out of high school (or no eligibility left) you can declare
function ccCombine(p){const sp=atv(p,'spd'),ag=atv(p,'agi'),jm=atv(p,'jmp'),st=atv(p,'str');
  return{forty:+(5.35-(sp-40)*0.017+(p.wt>230?(p.wt-230)*0.0025:0)+gaussR()*0.04).toFixed(2),shut:+(4.8-(ag-40)*0.012+gaussR()*0.05).toFixed(2),vert:Math.round(22+(jm-40)*0.34+gaussR()*1.5),bench:Math.max(0,Math.round(6+(st-40)*0.45+gaussR()*2))};}
function ccDraftScore(cmb){const p=ccMe(),last=(G.cc.car||[]).slice(-1)[0],perf=last?ccPerf(p.pos,last.st,last.gp):0,aw=(G.cc.aw||[]).filter(a=>a.big).length;
  const lv={FBS:0,FCS:-3,D2:-6,D3:-9,NAIA:-7,JUCO:-8}[G.cc.lvl]||-6,ps=p.pos==='K'?-6:p.pos==='QB'?1:0;
  let c=0;if(cmb){const b={QB:4.8,RB:4.52,WR:4.48,TE:4.7,OL:5.25,DL:4.85,LB:4.65,CB:4.45,S:4.52,K:4.95}[p.pos]||4.7;c=clamp((b-cmb.forty)*14,-3,3);}
  return p.rat+perf*0.3+Math.min(3,aw)+c+lv+ps;}
function ccProj(ds){if(ds>=92)return'Top 5 pick';if(ds>=88)return'1st round';if(ds>=85)return'2nd round';if(ds>=82)return'3rd round';if(ds>=80)return'4th round';if(ds>=78)return'5th round';if(ds>=76)return'6th round';if(ds>=74)return'7th round';if(ds>=70)return'Undrafted free agent';if(ds>=64)return'Spring league';return'No pro interest yet';}
function ccPickOf(ds){const K=[[95,1],[92,4],[88,20],[85,50],[82,90],[80,120],[78,165],[76,210],[74,250]];if(ds>=95)return 1;for(let i=1;i<K.length;i++){const[a,pa]=K[i-1],[b,pb]=K[i];if(ds>=b){const t=(a-ds)/(a-b);return Math.round(pa+(pb-pa)*t);}}return 999;}

// ── starting college: at graduation your player takes his commitment (or walks on) and is rated for college
function ccCreate(p,on){const c=p.committed;let k=c?c.school+'|'+c.lvl:null,walk=false;
  if(!k||!COL_BY[k]){walk=true;let st='CF';try{st=stOf(myS());}catch(e){}try{_colStReady();}catch(e){}
    const lv=p.rat>=74?'FCS':p.rat>=64?'D2':'JUCO',L=COLLEGES.filter(x=>x.lvl===lv).sort((a,b)=>(b.st===st)-(a.st===st)||a.pr-b.pr);const c0=L[0]||COLLEGES[COLLEGES.length-1];k=c0.school+'|'+c0.lvl;}
  const q=JSON.parse(JSON.stringify(p)),perf=ccHsPerf(p),drop=ccEntryDrop(p.rat,perf,0);
  try{ovrSync(q,true);}catch(e){}if(!q.at)q.at={};try{attrShift(q,p.rat-drop);}catch(e){}q.rat=ovrCalc(q);q._rc=q.rat;
  q.pot=ccPotC(q.rat,q.dev,(p.pot||p.rat)-p.rat);q.potLo=q.pot;q.potHi=q.pot;q.grad=false;q.inj=0;q.seasStats=emS();q.offers=[];q.yr=12;
  G.cc={v:1,on:on!==false,pid:p.id,p:q,k,lvl:ccLvlOf(k),y0:G.yr+1,hsRat:p.rat,drop,walk,trust:clamp(44+(p.stars||0)*3+(walk?-4:0),38,62),used:0,rsUsed:false,rsWant:false,gp:0,
    R:{},conf:null,phase:'start',os:0,wk:0,S:null,P:null,pw:0,st:{},log:[],car:[],aw:[],nil:{cash:0,val:0,deals:[]},rv:0,stage:'college',hs:(myS()||{}).name||''};
  return G.cc;}
// every college's signing class joins its roster (the seniors are still in the world at this point)
function ccIntake(){const C=G.cc,ny=G.yr+1;let n=0;C.R=C.R||{};
  for(const k in C.R)C.R[k]=C.R[k].filter(t=>t[5]>ny-5);
  const cnt={};for(const p of G.players){if(p.grad||p.yr!==12||!p.committed||p.id===C.pid)continue;const k=p.committed.school+'|'+p.committed.lvl;if(!COL_BY[k])continue;
    cnt[k]=(cnt[k]||0)+1;if(cnt[k]>(CC_CLS[p.committed.lvl]||20)*1.5)continue;const t=ccTup(p,p.committed.lvl);t[5]=ny;(C.R[k]||(C.R[k]=[])).push(t);n++;}
  C.rv=(C.rv||0)+1;ccRosterInv();return n;}
// called at graduation (finalizeOffseason), after signing day
function ccGradHook(grad){if(G.myPlayerId==null)return;
  if(!G.cc){const p=grad.find(q=>q.id===G.myPlayerId);if(p)ccCreate(p,!!G.pcLock);}
  if(G.cc&&G.cc.on&&G.cc.stage==='college')ccIntake();}
window.ccOptIn=function(){if(!G.cc)return;G.cc.on=true;try{const g=aiG();delete g.alumni[G.cc.pid];}catch(e){}ccIntake();nav('dash');};
// ── the season
function ccBegin(){const C=G.cc;if(!C.conf)C.conf=ccBuildConf();ccConfFix();ccRosterInv();C.str={};C.S=ccBuildSeason();C.P=null;C.pw=0;C.wk=0;C.phase='reg';C.gp=0;C.st={};C.log=[];C.rsWant=false;
  C.nil.val=ccNilVal();try{addNews('myteam',`${ccYear()} college season: ${C.p.fn} ${C.p.ln} at ${ccName(C.k)}`,`${CC_LVN[C.lvl]} · ${ccConfName(C.k)} · ${ccClassLbl()} · ${C.p.pos} · ${C.p.rat} overall.`);}catch(e){}}
function ccMaxWk(){let m=0;for(const l in G.cc.S)m=Math.max(m,G.cc.S[l].W.length);return m;}
window.ccNext=function(){const C=G.cc;if(!C)return;
  if(C.stage==='pro'||C.stage==='done'){ccProNext();return;}
  if(C.phase==='start'){ccBegin();ccWelcome();return;}
  if(C.phase==='reg'){const g=ccMyGameAt(C.wk);if(g&&!g.s){ccPregame(g,null);return;}ccWeekDone();return;}
  if(C.phase==='post'){const m=ccMyPost();if(m){ccPregame(m[1],m[0]);return;}ccPostStep();return;}
  if(C.phase==='off'){ccOffStep();return;}};
function ccLabel(){const C=G.cc;if(!C)return'Continue';if(C.stage==='pro')return'Next season';if(C.stage==='done')return'Career complete';
  if(C.phase==='start')return`Start ${ccYear()} season`;
  if(C.phase==='reg'){const g=ccMyGameAt(C.wk);return g&&!g.s?`Play week ${C.wk+1}`:`Sim week ${C.wk+1}`;}
  if(C.phase==='post'){const m=ccMyPost();return m?'Play '+(m[1].n||'postseason'):(ccPostDone()?'Season wrap-up':'Sim postseason');}
  return['','Portal & draft','Spring practice',`Start ${ccYear()+1} season`][C.os]||'Continue';}
function ccWeekDone(){const C=G.cc;ccSimWeekRest(C.wk);C.wk++;if(C.wk>=ccMaxWk()){ccPostStart();C.phase='post';
    try{const P=C.P[C.lvl];const inF=P&&P.field&&P.field.includes(C.k);addNews('myteam',`${ccYear()} regular season ends`,`${ccName(C.k)} finish ${ccRecStr(C.k)}${ccRankOf(C.k)?' · ranked #'+ccRankOf(C.k):''}.`);}catch(e){}}
  ccSave();nav('dash');}
function ccPostStep(){ccPostRest();ccPostAdvance();if(ccPostDone()){ccSeasonEnd();return;}ccSave();nav('dash');}
function ccSave(){try{if(gdsMain().autosave!==false)setTimeout(()=>saveGame(true),200);}catch(e){}}
function ccRecStr(k,lvl){const L=G.cc.S&&G.cc.S[lvl||ccLvlOf(k)],x=L&&L.rec[k];return x?`${x[0]}-${x[1]}`:'0-0';}
function ccConfRecStr(k){const L=G.cc.S&&G.cc.S[ccLvlOf(k)],x=L&&L.rec[k];return x?`${x[2]}-${x[3]}`:'0-0';}
let _ccRk={v:'',m:{}};
function ccRankOf(k){const lvl=ccLvlOf(k),v=G.yr+'|'+G.cc.wk+'|'+G.cc.pw+'|'+lvl;if(_ccRk.v!==v){_ccRk={v,m:{}};ccRank(lvl).slice(0,25).forEach((x,i)=>_ccRk.m[x]=i+1);}return _ccRk.m[k]||0;}
// ── before a game: your role, the weekly goal, redshirt, play it or sim it
function ccOppOf(g){return g.a===G.cc.k?g.b:g.a;}
function ccHomeSide(g){const me=g.a===G.cc.k;return g.h===2?2:(me?g.h:1-g.h);} // 0: you are home, 1: away, 2: neutral
function ccPregame(g,plvl){const C=G.cc,o=ccOppOf(g),me=C.k,r=ccRole(),lk=ccRsLocked(),GL=CC_GOAL[C.p.pos]||CC_GOAL.WR,hs=ccHomeSide(g),rk=ccRankOf(o),mk=ccRankOf(me),IO=colInfo(o),IM=colInfo(me);
  window._ccG={g,plvl};
  openMo(`<div style="text-align:center;padding:4px">
    <div style="font-size:12px;color:var(--mu);font-weight:800;letter-spacing:.05em">${g.n||('Week '+(C.wk+1)+(g.c?' · Conference game':' · Non-conference'))}${hs===2?' · Neutral site':hs===0?' · Home':' · Away'}</div>
    <div style="display:flex;align-items:center;justify-content:center;gap:18px;margin:10px 0 12px">
      <div>${colLogo(me,70)}<div style="font-weight:800">${mk?'#'+mk+' ':''}${IM.name}</div><div style="font-size:12px;color:var(--mu)">${ccRecStr(me)}</div></div>
      <div style="font-weight:900;font-size:22px;color:var(--mu)">${hs===1?'AT':'VS'}</div>
      <div>${colLogo(o,70)}<div style="font-weight:800">${rk?'#'+rk+' ':''}${IO.name}</div><div style="font-size:12px;color:var(--mu)">${ccRecStr(o)} · ${ccConfName(o)}</div></div></div>
    <div style="font-size:13px;margin-bottom:6px"><b>${C.p.fn} ${C.p.ln}</b> · ${C.p.pos} · ${C.p.rat} OVR · ${r.start?'<span style="color:var(--gn);font-weight:800">Starter</span>':`Backup (#${r.rank} on the depth chart)`}</div>
    ${lk?`<div style="font-size:13px;color:var(--gd);margin-bottom:8px">You have played 4 games: you sit out the rest of the season to keep your redshirt.</div>`:`<div style="font-size:13px;margin-bottom:8px">Weekly goal: <b>${GL[2]}</b> (bonus XP and coach trust)</div>`}
    ${!C.rsUsed&&!lk?`<label style="display:inline-flex;gap:6px;align-items:center;font-size:12px;color:var(--mu);margin-bottom:10px"><input type="checkbox" style="width:auto;min-height:0" ${C.rsWant?'checked':''} onchange="G.cc.rsWant=this.checked"> Redshirt this season (play 4 games at most and keep a year of eligibility)</label>`:''}
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
      ${lk?'':`<button class="btn bgn" style="min-width:170px;font-size:16px" onclick="clo();ccGdStart()">Play Game</button>`}
      <button class="bgh" style="min-width:170px;font-size:16px" onclick="clo();ccSimMine()">Simulate</button></div>
    <div style="font-size:11px;color:var(--mu);margin-top:10px">${r.start?'You start: you play every snap of your unit.':'As a backup you get the series the coach gives you. Good games and practice move you up.'}</div></div>`);}
window.ccSimMine=function(){const x=window._ccG;if(!x)return;const{g,plvl}=x,C=G.cc,o=ccOppOf(g),r=ccRole(),lk=ccRsLocked(),ms=ccStr(C.k),os=ccStr(o),hs=ccHomeSide(g);
  const sc=ccSimScore(ms,os,hs===0?0:hs===1?1:2),played=!lk&&(r.start||Math.random()<r.share+0.25),st=played?ccGenLine(C.p,r.start,r.share,(ms-os)+(sc[0]-sc[1])/4):{};
  ccMyResult(g,plvl,sc[0],sc[1],st,played,'sim');};
// Game Day: both colleges with their real rosters; you control only your player
function ccTeamObj(k){const I=colInfo(k),ci=ccIx(k),r=ccR(ccH('sch',k)),L=G.cc.S&&G.cc.S[ccLvlOf(k)],x=L&&L.rec[k];
  return{id:900000+ci,fp:true,roster:ccRoster(k).filter(p=>!(p.inj>0)),name:I.name,mascot:I.mascot,c1:I.c1,c2:I.c2,abbr:(I.abbr||colAbbr(I.name)).slice(0,4),logoKey:I.logoKey,mash:I.mash,customLogo:I.customLogo,
    offS:OFF_SCH[Math.floor(r()*OFF_SCH.length)],defS:DEF_SCH[Math.floor(r()*DEF_SCH.length)],cls:G.cls,wins:x?x[0]:0,losses:x?x[1]:0,col:k};}
window.ccGdStart=function(){const x=window._ccG;if(!x)return;const{g,plvl}=x,C=G.cc,o=ccOppOf(g),hs=ccHomeSide(g);
  const me=ccTeamObj(C.k),op=ccTeamObj(o),homeIdx=hs===1?1:0,H=homeIdx?op:me,Hk=homeIdx?o:C.k;
  const _o1=_gdTop(me),_o2=_gdTop(op);_gdAnchor=(_o1+_o2)/2;_gdPc=C.p.id;const mk=homeIdx?'away':'home';
  _gdTAdj=Math.round((_o1-_gdAnchor)*0.5);const t1=Object.assign(gdTeam(me,mk),{ovr:Math.round(_o1)});
  _gdTAdj=Math.round((_o2-_gdAnchor)*0.5);const t2=Object.assign(gdTeam(op,gdOppKind(op,mk,me)),{ovr:Math.round(_o2)});_gdTAdj=0;
  let si;try{si=stadInfo(CC_STAD[ccLvlOf(Hk)]||14,null,H);si.st=colInfo(Hk).st;if(hs===2)si.name=g.n&&/Bowl|Classic/.test(g.n)?g.n.replace(/^.*· /,''):'Neutral site';}catch(e){si=stadInfo(16,null,H);}
  let wx=null;try{wx=wxMake(colInfo(Hk).st,GAME_DATES[Math.min(GAME_DATES.length-1,C.wk)]||null,ccH('wx',G.yr,C.wk,C.k)>>>0);}catch(e){}
  window.__GP={mode:'all',rival:false,big:!!plvl,teams:[t1,t2],home:homeIdx,weather:wx,stadium:si,ez:_gdDark(H.c1||'#1c3766',.25),ezText:_gdLum(H.c2||'#fff')>.35?(H.c2||'#ffffff'):'#ffffff',neutral:hs===2};
  window.__GP.previewHtml=`<div style="text-align:center;font-weight:800">${g.n||('Week '+(C.wk+1))} · ${ccConfName(C.k)}</div>`;
  const r=ccRole();if(!ccRsLocked())window.__GP.pc={mid:C.p.id,pos:C.p.pos,start:r.start,share:r.share,two:pcTwo(C.p)};
  _gdCtx={kind:'col',info:{g,plvl,opp:op}};gdLaunch();};
function ccGdDone(res,ctx){const{g,plvl}=ctx.info,C=G.cc;let my=res.score[0],op=res.score[1];if(my===op){if(Math.random()<.5)my+=3;else op+=3;}
  const raw=(res.stats||{})[C.p.id]||null,st=raw?gdConv(raw):{},played=(res.played||[]).map(Number).includes(C.p.id)||!!raw;
  for(const k in st)if(!st[k])delete st[k];ccMyResult(g,plvl,my,op,st,played,'gd');}
function ccMyResult(g,plvl,my,op,st,played,how){const C=G.cc,p=C.p,isA=g.a===C.k,o=ccOppOf(g);g.s=isA?[my,op]:[op,my];g.mine=1;
  if(plvl)ccPostResolve(plvl,g);else ccRec(C.lvl,g.a,g.b,g.s[0],g.s[1],g.c);
  const win=my>op,GL=CC_GOAL[p.pos]||CC_GOAL.WR,goal=played&&((st[GL[0]]||0)+(p.pos==='CB'?(st.ints||0)*2:0))>=GL[1];let xp=0;
  if(played){C.gp++;ccAddSt(C.st,st);const pf=ccPerf(p.pos,st,1);const before=C.trust;C.trust=clamp(C.trust+Math.round(clamp(pf/2-2,-4,5)+(win?1.5:-1)+(goal?2:0)),0,100);
    xp=Math.round(35+pf*6+(win?15:0)+(plvl?30:0)+(goal?60:0));try{pcGainXP(p,xp);}catch(e){}void before;}
  else{try{pcGainXP(p,12);}catch(e){}}
  C.log.push({w:plvl?'P':C.wk+1,o,h:ccHomeSide(g),s:[my,op],st:played?st:null,n:g.n||'',how});try{socGame(played?st:null,{r:(win?'W ':'L ')+my+'-'+op,o:ccName(o),k:plvl?'po':'reg'});}catch(e){}
  try{if(played&&(goal||win&&ccPerf(p.pos,st,1)>=9))addNews('myteam',`${p.fn} ${p.ln}: ${ccLine(p.pos,st)}`,`${ccName(C.k)} ${win?'beat':'fall to'} ${ccName(o)} ${my}-${op}${g.n?' · '+g.n:''}.`);}catch(e){}
  const res=`<div style="text-align:center;padding:6px"><div style="font-size:12px;color:var(--mu);font-weight:800;">${g.n||'Week '+(C.wk+1)} · Final</div>
    <div style="display:flex;align-items:center;justify-content:center;gap:14px;margin:10px 0">${colLogo(C.k,56)}<div style="font:900 34px/1 var(--hd)">${my} - ${op}</div>${colLogo(o,56)}</div>
    <div style="font-weight:900;font-size:18px;color:${win?'var(--gn)':'var(--rd)'}">${win?'Win':'Loss'} ${win?'over':'to'} ${ccName(o)}</div>
    <div style="margin-top:8px;font-size:13px">${played?`<b>${p.fn} ${p.ln}</b>: ${ccLine(p.pos,st)}`:'You did not get on the field.'}</div>
    ${played?`<div style="font-size:12px;margin-top:4px;color:${goal?'var(--gn)':'var(--mu)'}">Weekly goal (${GL[2]}): ${goal?'done ✓':'missed'}</div>`:''}
    <div style="font-size:12px;color:var(--mu);margin-top:4px">Coach trust ${C.trust}/100${xp?` · +${xp} XP`:''}</div>
    <div style="margin-top:12px"><button class="btn" onclick="clo();nav('dash')">Continue</button></div></div>`;
  if(plvl)ccPostRest(),ccPostAdvance();else{ccSimWeekRest(C.wk);C.wk++;if(C.wk>=ccMaxWk()){ccPostStart();C.phase='post';}}
  const end=plvl&&ccPostDone();ccSave();nav('dash');setTimeout(()=>openMo(res),how==='gd'?400:30);
  if(end)ccSeasonEnd(true);}
function ccWelcome(){const C=G.cc,I=colInfo(C.k),r=ccRole();
  openMo(`<div style="text-align:center;padding:6px">${colLogo(C.k,90)}<h2 style="margin:8px 0 4px">${C.p.fn} ${C.p.ln} · ${I.name} ${I.mascot}</h2>
   <div style="font-size:13px;color:var(--mu)">${CC_LVN[C.lvl]} · ${ccConfName(C.k)}${C.walk?' · walk-on':''}</div>
   <div style="margin:12px 0;font-size:14px">You start college at <b>${C.p.rat} overall</b> (${C.hsRat} in high school: college players are bigger, faster and older). Your potential is <b>${C.p.pot}</b>.</div>
   <div style="font-size:13px;margin-bottom:6px">Depth chart: <b>${r.start?'starter':'#'+r.rank+' at '+C.p.pos}</b>. Play well and earn the coach's trust to move up.</div>
   <div style="font-size:12px;color:var(--mu);text-align:left;max-width:520px;margin:10px auto 0"><b>How college works</b>: ${CC_G[C.lvl]} regular season games, conference games at the end and a conference title game. FBS: the top 12 make the playoff (the five best conference champions get in, the top four seeds get a bye), six wins makes you bowl eligible. Play 4 games or fewer and you keep your redshirt (once). In January the transfer portal opens; three years after high school you can declare for the pro draft. NIL money comes with your rating, position, stats and school.</div>
   <div style="margin-top:14px"><button class="btn bgn" onclick="clo();nav('dash')">Let's go</button></div></div>`);nav('dash');}
// ── season end: awards, eligibility, NIL money
function ccAwards(){const C=G.cc,p=C.p,lvl=C.lvl,L=C.S[lvl];if(!L)return[];const out=[],gp=C.gp||0;if(!gp)return out;
  const wp=k=>{const x=L.rec[k];return x&&(x[0]+x[1])?x[0]/(x[0]+x[1]):0.5;},posB={QB:9,RB:4,WR:3}[p.pos]||0,top=ccRank(lvl).slice(0,40),conf=G.cc.conf.list[G.cc.conf.by[C.k]];
  const cand=ks=>{const o=[];for(const k of ks){if(k===C.k)continue;for(const q of ccRoster(k,true))o.push({q,k,w:wp(k)});}return o;};
  const sc=(x,b)=>x.q.rat*0.6+x.w*25+(b?({QB:9,RB:4,WR:3}[x.q.pos]||0):0)+ccN(ccR(ccH('aw',G.yr,x.q.id)))*4;
  const perf=ccPerf(p.pos,C.st,gp),mine=b=>p.rat*0.6+wp(C.k)*25+(b?posB:0)+perf-(gp<8?(8-gp)*1.5:0)+(C.trust-50)/20;
  const A=cand(top),grp=pos=>pos==='CB'||pos==='S'?['CB','S']:[pos];
  {const all=A.map(x=>sc(x,1)).sort((a,b)=>b-a),m=mine(1),rk=all.filter(v=>v>m).length;if(rk===0)out.push({n:CC_MVP[lvl],big:true,t:'Winner'});else if(rk<4)out.push({n:CC_MVP[lvl],big:rk<2,t:'Finalist'});}
  if(lvl==='FBS'&&CC_POSAW[p.pos]){const G2=grp(p.pos),L2=A.filter(x=>G2.includes(x.q.pos)).map(x=>sc(x,0)).sort((a,b)=>b-a),m=mine(0),rk=L2.filter(v=>v>m).length;if(rk===0)out.push({n:CC_POSAW[p.pos],big:true,t:'Winner'});else if(rk<3)out.push({n:CC_POSAW[p.pos],t:'Finalist'});}
  {const n=PC_STARTERS[p.pos]||1,L2=A.filter(x=>x.q.pos===p.pos).map(x=>sc(x,0)).sort((a,b)=>b-a),m=mine(0),rk=L2.filter(v=>v>m).length;if(rk<n)out.push({n:lvl==='FBS'?'All-Nation team':'All-'+CC_LVN[lvl]+' team',big:lvl==='FBS',t:'1st team'});else if(rk<n*2)out.push({n:lvl==='FBS'?'All-Nation team':'All-'+CC_LVN[lvl]+' team',t:'2nd team'});}
  if(conf){const CA=cand(conf.t),n=PC_STARTERS[p.pos]||1,L2=CA.filter(x=>x.q.pos===p.pos).map(x=>sc(x,0)).sort((a,b)=>b-a),m=mine(0),rk=L2.filter(v=>v>m).length;
    if(rk<n)out.push({n:'All-'+conf.name,t:'1st team'});else if(rk<n*2)out.push({n:'All-'+conf.name,t:'2nd team'});
    const all=CA.map(x=>sc(x,1)).sort((a,b)=>b-a),m2=mine(1);if(all.filter(v=>v>m2).length===0)out.push({n:conf.name+' Player of the Year',big:true,t:'Winner'});}
  if(ccYrsOut()===1||(C.rsUsed&&ccYrsOut()===2)){const F=A.filter(x=>x.q.yr===1).map(x=>sc(x,1)).sort((a,b)=>b-a),m=mine(1);if(F.filter(v=>v>m).length===0)out.push({n:'First Light Award (freshman of the year)',big:true,t:'Winner'});}
  for(const a of out){a.y=ccYear();a.yr=G.yr;a.k=C.k;}return out;}
function ccSeasonEnd(quiet){const C=G.cc,p=C.p,lvl=C.lvl,P=C.P[lvl],champ=P&&P.champ===C.k,x=C.S[lvl]&&C.S[lvl].rec[C.k]||[0,0];
  const aw=ccAwards();C.aw=(C.aw||[]).concat(aw);
  const red=(C.gp||0)<=4&&!C.rsUsed;if(red)C.rsUsed=true;else C.used=(C.used||0)+1;
  const perf=ccPerf(p.pos,C.st,C.gp||0),earn=Math.round(C.nil.val*(1+perf/30));C.nil.cash+=earn;
  C.car.push({y:ccYear(),yr:G.yr,k:C.k,lvl,gp:C.gp||0,st:Object.assign({},C.st),ovr:p.rat,cls:ccClassLbl(),rec:[x[0],x[1]],rk:ccRankOf(C.k),champ,red,nil:earn,aw:aw.map(a=>a.n+' ('+a.t+')')});
  C.phase='off';C.os=1;
  const pops=[];pops.push(bEvPop(`${ccYear()} season: ${ccName(C.k)} ${x[0]}-${x[1]}`,`${champ?`<b style="color:var(--gd)">${lvl==='FBS'?'National champions!':CC_LVN[lvl]+' national champions!'}</b><br>`:''}${p.fn} ${p.ln}: ${C.gp||0} games · ${ccLine(p.pos,C.st)}${red?'<br><b>Redshirt year</b>: this season does not count against your eligibility.':''}<br>NIL earnings this year: <b>${ccMoney(earn)}</b>.`,colLogo(C.k,64),champ?'var(--gd)':'var(--mu)'));
  if(aw.length)pops.push(bEvPop('Awards',aw.map(a=>`<div><b>${a.n}</b>: ${a.t}</div>`).join(''),colLogo(C.k,48),'var(--gd)'));
  for(const a of aw)if(a.big)try{addNews('myteam',`${p.fn} ${p.ln}: ${a.n} ${a.t.toLowerCase()}`,`${ccName(C.k)} · ${ccYear()}`);socNote('award',`${p.fn} ${p.ln} (${ccName(C.k)}): ${a.n}, ${a.t.toLowerCase()}.`,2.5);}catch(e){}
  try{if(P&&P.champ)addNews('general',`${ccName(P.champ)} are the ${ccYear()} ${lvl==='FBS'?'national champions':CC_LVN[lvl]+' champions'}`,'');}catch(e){}
  ccSave();_popQ=pops;_popI=0;_popCb=()=>nav('dash');if(quiet)setTimeout(()=>{const pu=document.getElementById('pu'),mo=document.getElementById('mo');const go=()=>{if(mo&&mo.classList.contains('open')){setTimeout(go,500);return;}showPop();};go();},600);else showPop();}
// ── offseason: January (portal, draft decision), spring practice (growth, NIL deal), summer (the next class arrives)
function ccOffStep(){const C=G.cc;if(C.os===1){ccDecision();return;}if(C.os===2){ccSpring();return;}if(C.os===2.5){ccDealOpen();return;}if(C.os===3){ccSummer();return;}}
function ccDecision(){const C=G.cc,ys=ccSeasonsDone(),left=ccEligLeft(),canDraft=ys>=3||left<=0,ds=ccDraftScore(null);
  openMo(`<h2>January: what's next?</h2>
   <div style="font-size:13px;margin-bottom:10px">${C.p.fn} ${C.p.ln} · ${ccClassLbl()} · ${C.p.rat} OVR · ${left>0?`<b>${left}</b> season${left>1?'s':''} of eligibility left`:'<b>no eligibility left</b>'}${C.rsUsed?' (redshirt used)':''}</div>
   ${canDraft?`<div class="pnl"><div class="pb"><b>Draft projection: ${ccProj(ds)}</b><div style="font-size:12px;color:var(--mu)">Based on your rating, last season's production, awards and your level (${CC_LVN[C.lvl]}). The combine can move you up or down a round.</div></div></div>`:`<div style="font-size:12px;color:var(--mu);margin-bottom:8px">You can enter the pro draft three years after high school (after your third season).</div>`}
   <div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">
    ${left>0?`<button class="btn bgn" onclick="clo();G.cc.os=2;nav('dash')">Return to ${ccName(C.k)}</button><button class="bgh" onclick="clo();ccPortal()">Enter the transfer portal (Jan 2 to 16)</button>`:''}
    ${canDraft?`<button class="btn" onclick="clo();ccDraftRun()">Declare for the ${ccYear()+1} NGL Draft</button>`:''}
    ${left<=0&&!canDraft?`<button class="btn" onclick="clo();ccDraftRun()">Turn pro</button>`:''}
   </div>`);}
function ccPortalOffers(){const C=G.cc,p=C.p,last=(C.car||[]).slice(-1)[0],v=p.rat+(last?ccPerf(p.pos,last.st,last.gp):0)*0.4,out=[],r=ccR(ccH('portal',G.yr,p.id));
  for(const c of COLLEGES){const k=c.school+'|'+c.lvl;if(k===C.k)continue;const s=ccStr(k);if(v<s-4||v>s+12)continue;
    const R=ccRoster(k,true),ahead=R.filter(q=>q.pos===p.pos&&q.rat>v&&q.yr<4).length,n=PC_STARTERS[p.pos]||1;if(ahead>n)continue;if(r()>0.55)continue;
    out.push({k,pr:c.pr,role:ahead<n?'Projected starter':'Rotation player',nil:Math.round(ccNilVal(k,p)*(1.05+r()*0.35)/100)*100});}
  return out.sort((a,b)=>(a.role<b.role?-1:1)||b.pr-a.pr).slice(0,7);}
window.ccPortal=function(){const C=G.cc,O=ccPortalOffers();window._ccPO=O;
  openMo(`<h2>Transfer portal</h2><div style="font-size:13px;color:var(--mu);margin-bottom:10px">You are in the portal. Schools that want you, the role they see for you and their NIL offer. Transfers are eligible right away.</div>
   ${O.length?O.map((o,i)=>{const I=colInfo(o.k);return`<div class="dr" style="gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid var(--bd)">${colLogo(o.k,40)}<div style="flex:1"><b>${I.name} ${I.mascot}</b><div style="font-size:12px;color:var(--mu)">${CC_LVN[ccLvlOf(o.k)]} · ${ccConfName(o.k)} · prestige ${o.pr} · ${o.role}</div></div><div style="text-align:right"><b>${ccMoney(o.nil)}</b><div style="font-size:11px;color:var(--mu)">NIL / year</div></div><button class="btn bsm bgn" onclick="ccTransfer(${i})">Transfer</button></div>`;}).join(''):'<div style="color:var(--mu)">No offers came in. You can stay where you are.</div>'}
   <div style="text-align:right;margin-top:12px"><button class="bgh" onclick="clo();G.cc.os=2;nav('dash')">Withdraw and stay at ${ccName(C.k)}</button></div>`);};
window.ccTransfer=function(i){const C=G.cc,o=(window._ccPO||[])[i];if(!o)return;const from=C.k;C.k=o.k;C.lvl=ccLvlOf(o.k);C.trust=50;C.transfers=(C.transfers||0)+1;C.nilBonus=o.nil;ccRosterInv();C.str={};
  try{addNews('myteam',`${C.p.fn} ${C.p.ln} transfers to ${ccName(o.k)}`,`From ${ccName(from)} · ${CC_LVN[C.lvl]} · NIL ${ccMoney(o.nil)} a year.`);}catch(e){}
  clo();C.os=2;notify(`Welcome to ${ccName(o.k)}!`);ccSave();nav('dash');};
function ccSpring(){const C=G.cc,p=C.p,last=(C.car||[]).slice(-1)[0],start=last&&last.gp>=6;
  const g=({Elite:6,Star:5,Impact:4,Normal:3}[p.dev]||3)+(start?1:0)+((p.traits||[]).includes('gym-rat')?1:0)+((p.traits||[]).includes('lazy')?-1:0)+Math.round(gaussR());
  const before=p.rat,tgt=clamp(Math.min(p.pot,p.rat+Math.max(1,g)),1,99);if(tgt>p.rat){try{attrShift(p,tgt);}catch(e){}p.rat=Math.max(before,ovrCalc(p));p._rc=p.rat;}
  const v=ccNilVal(),r=ccR(ccH('deal',G.yr,p.id)),D=CC_DEAL.slice().sort(()=>r()-.5).slice(0,3);
  C.dealOffer=[{d:D[0],cash:Math.max(500,Math.round(v*0.18/100)*100),sp:0,xp:0},{d:D[1],cash:Math.max(300,Math.round(v*0.08/100)*100),sp:2,xp:0},{d:D[2],cash:Math.max(200,Math.round(v*0.04/100)*100),sp:0,xp:450}];
  C.os=2.5;C.springMsg=`${p.fn} ${p.ln} worked all spring: <b>${before} → ${p.rat} OVR</b>${p.rat>=p.pot?' (at his potential)':''}.`;ccSave();ccDealOpen();}
function ccDealOpen(){const C=G.cc,offs=C.dealOffer||[];
  openMo(`<h2>Spring practice</h2><div style="font-size:14px;margin-bottom:10px">${C.springMsg||''}</div>
   <div style="font-weight:800;margin-bottom:6px">NIL brand deal: pick one</div>
   ${offs.map((o,i)=>`<button class="bgh" style="display:flex;justify-content:space-between;width:100%;text-align:left;margin-bottom:6px;padding:10px 12px" onclick="ccDeal(${i})"><span><b>${o.d[0]}</b><br><small style="color:var(--mu)">${o.d[1]}</small></span><span style="text-align:right"><b>${ccMoney(o.cash)}</b>${o.sp?`<br><small style="color:var(--gd)">+${o.sp} skill points</small>`:''}${o.xp?`<br><small style="color:var(--gd)">+${o.xp} XP</small>`:''}</span></button>`).join('')}`);}
window.ccDeal=function(i){const C=G.cc,o=(C.dealOffer||[])[i];if(!o)return;C.nil.cash+=o.cash;C.nil.deals.push({y:ccYear(),n:o.d[0],cash:o.cash});if(o.sp)C.p.pcSP=(C.p.pcSP||0)+o.sp;if(o.xp)try{pcGainXP(C.p,o.xp);}catch(e){}
  C.dealOffer=null;C.os=3;clo();notify(`Signed with ${o.d[0]}`);ccSave();nav('dash');};
// the player's current team for the loading screen: his college in college, his high school before that
function ccLoadTeam(){const C=G.cc;return C&&C.k&&C.stage==='college'?colTeamObj(C.k):myS();}
function ccSummer(){const C=G.cc;let ld=null;try{ld=loadingHold('The high school season plays out and the new recruits arrive…',ccLoadTeam());}catch(e){}
  setTimeout(()=>{try{ccHsYear();}catch(e){console.error('high school year',e);}try{if(ld)ld.classList.remove('active');}catch(e){}
    if(ccEligLeft()<=0){ccDraftRun();return;}ccBegin();ccSave();nav('dash');notify(`${ccYear()} season: the new signing classes are on campus`);},60);}
// the high school world plays its year in the background so the colleges get their next signing classes
function ccHsYear(){const all=allSchoolsAll();for(const s of all){const w=clamp(Math.round(5+((s.prestige||2)-2.5)*1.3+gaussR()*2),0,10);s.wins=w;s.losses=10-w;}
  const ms=myS();if(ms){G.wins=ms.wins;G.losses=ms.losses;}
  const CS=COLLEGES.slice().sort((a,b)=>a.pr-b.pr),prs=CS.map(c=>c.pr);
  for(const p of G.players){if(p.grad||p.yr!==12||p.committed||(p.offers&&p.offers.length>=2))continue;if(!p.offers)p.offers=[];let L;try{L=recLevel(p);}catch(e){continue;}
    let lo=0,hi=CS.length;while(lo<hi){const m=(lo+hi)>>1;if(prs[m]<L-10)lo=m+1;else hi=m;}const cand=[];for(let i=lo;i<CS.length&&CS[i].pr<=L+10;i++)cand.push(CS[i]);
    for(let t=0;t<3&&cand.length;t++){const c=cand.splice(Math.floor(Math.random()*cand.length),1)[0];try{if(colRoom(c,p,true)&&!p.offers.some(o=>o.school===c.school&&o.lvl===c.lvl))addOffer(p,c,null,'senior season');}catch(e){}}}
  const sp=showPop,nv=nav,om=openMo,osb=openScheduleBuilder;
  showPop=function(){_popQ=[];_popI=0;_popCb=null;const pu=document.getElementById('pu');if(pu)pu.classList.remove('open');};nav=function(){};openMo=function(){};openScheduleBuilder=function(){};
  try{G.phase='offseason';finalizeOffseason();}finally{showPop=sp;nav=nv;openMo=om;openScheduleBuilder=osb;_popQ=[];_popCb=null;G.customSchedPending=false;}}
// ── the draft: combine, then the 7 rounds; or undrafted free agency, a spring league, or the end of the road
window.ccDraftRun=function(){const C=G.cc,p=C.p,cmb=window._ccCmb||ccCombine(p);window._ccCmb=null;const ds=ccDraftScore(cmb),pk=ccPickOf(ds+gaussR()*1.5),r=Math.random();let res;
  if(pk<=257){const rd=pk<=32?1:pk<=64?2:pk<=100?3:pk<=135?4:pk<=176?5:pk<=220?6:7;res={lg:'NGL',team:AI_NGL[Math.floor(r*AI_NGL.length)],pick:pk,rd,und:false};}
  else if(ds>=70&&r<0.8)res={lg:'NGL',team:AI_NGL[Math.floor(Math.random()*AI_NGL.length)],pick:0,rd:0,und:true};
  else if(ds>=63)res={lg:Math.random()<0.6?'SFL':'MGL',pick:0,rd:0,und:true};else res=null;
  if(res&&res.lg!=='NGL')res.team=(res.lg==='SFL'?AI_SFL:AI_MGL)[Math.floor(Math.random()*(res.lg==='SFL'?AI_SFL:AI_MGL).length)];
  C.draft={y:ccYear()+1,cmb,ds:Math.round(ds),res};const hl=!res?`${p.fn} ${p.ln} goes undrafted and gets no pro offer`:res.pick?`${p.fn} ${p.ln} is picked #${res.pick} overall (round ${res.rd}) by the ${res.team}`:res.lg==='NGL'?`${p.fn} ${p.ln} signs with the ${res.team} as an undrafted free agent`:`${p.fn} ${p.ln} signs with the ${res.team} (${res.lg})`;
  try{addNews('myteam',hl,`${ccYear()+1} NGL Draft · combine: ${cmb.forty} 40, ${cmb.vert}" vertical, ${cmb.bench} reps`);}catch(e){}
  ccProStart(res,hl);
  openMo(`<div style="text-align:center;padding:6px"><h2>${ccYear()+1} NGL Draft</h2>
   <div style="font-size:13px;color:var(--mu);margin-bottom:8px">Combine: <b>${cmb.forty}</b> 40-yard dash · <b>${cmb.shut}</b> shuttle · <b>${cmb.vert}"</b> vertical · <b>${cmb.bench}</b> bench reps</div>
   <div style="font-size:18px;font-weight:900;margin:12px 0;color:${res&&res.pick?'var(--gd)':res?'var(--gn)':'var(--rd)'}">${hl}.</div>
   ${res&&res.pick?`<div style="font-size:13px">Rookie deal: 4 years, about ${aiMoney(aiRookieDeal(res.pick))}.</div>`:''}
   <div style="font-size:12px;color:var(--mu);margin-top:10px">College career: ${(C.car||[]).length} season${(C.car||[]).length===1?'':'s'} · NIL earnings ${ccMoney(C.nil.cash)}${(C.aw||[]).filter(a=>a.big).length?` · ${(C.aw||[]).filter(a=>a.big).length} major award${(C.aw||[]).filter(a=>a.big).length===1?'':'s'}`:''}.</div>
   <div style="margin-top:14px"><button class="btn" onclick="clo();nav('dash')">Continue</button></div></div>`);};
function ccProStart(res,hl){const C=G.cc,p=C.p;C.stage=res?'pro':'done';ccSave();if(!res)return;
  try{const g=aiG(),src=Object.assign({},p,{gradYr:C.y0-1,committed:{lvl:C.lvl,school:ccName(C.k)}}),a=aiNew(src);
    Object.assign(a,{stage:'pro',lvl:C.lvl,school:ccName(C.k),dy:ccYear()+1,team:res.team,pick:res.pick,rd:res.rd,und:res.und,lg:res.lg,py:0,cYrs:res.pick?4:res.lg==='NGL'?3:2,aav:res.pick?aiRookieDeal(res.pick)/4:res.lg==='NGL'?.9:.08,optn:res.rd===1,ovr:clamp(Math.round(p.rat-4+gaussR()*2),35,99),last:G.yr});
    a.entries=[{y:ccYear()+1,age:18+(G.yr-a.gy),st:'pro',hl,tx:[hl+'.'],stl:'',aw:[],tg:['Draft'],nw:true,ovr:a.ovr,team:res.team}];g.alumni[C.pid]=a;}catch(e){console.error('pro start',e);}}
function ccProNext(){const C=G.cc;if(C.stage==='done'){openMo(`<div style="text-align:center;padding:8px"><h2>Career complete</h2><div style="font-size:13px;color:var(--mu);margin-bottom:12px">${C.p.fn} ${C.p.ln}'s football story is written. You can keep the save and go back to the high school.</div><button class="btn" onclick="clo();ccBackToHs()">Back to the high school</button></div>`);return;}
  let ld=null;try{ld=loadingHold('A year goes by…',ccLoadTeam());}catch(e){}
  setTimeout(()=>{try{ccHsYear();}catch(e){console.error(e);}try{const g=aiG(),a=g.alumni[C.pid],src=(G.hofArchive||[]).find(x=>x.id===C.pid)||C.p;if(a&&!a.done&&a.last<G.yr)aiAdvance(a,src,G.yr,true);const e=a&&a.entries[a.entries.length-1];if(a&&a.done)C.stage='done';
      if(e)openMo(`<div style="padding:6px"><h2>${e.y}</h2><div style="font-weight:800;margin-bottom:6px">${e.hl||''}</div>${(e.tx||[]).map(t=>`<div style="font-size:13px;margin-bottom:4px">${t}</div>`).join('')}<div style="text-align:right;margin-top:10px"><button class="btn" onclick="clo()">Continue</button></div></div>`);}catch(e){console.error(e);}
    try{if(ld)ld.classList.remove('active');}catch(e){}ccSave();nav('dash');},60);}
window.ccBackToHs=function(){if(!G.cc)return;G.cc.on=false;G.cc.stage=G.cc.stage==='college'?'left':G.cc.stage;nav('dash');};

// ── college screens: the dashboard, the College page (schedule, standings, rankings, roster, postseason, stats) and My Player
function ccTeamLn(k,extra){const I=colInfo(k),rk=ccRankOf(k);return`<span style="display:inline-flex;align-items:center;gap:6px;min-width:0">${colLogo(k,22)}<span class="dt-ln${k===G.cc.k?' me':''}">${rk?'<b>#'+rk+'</b> ':''}${I.name}</span>${extra||''}</span>`;}
function ccConfStand(ci){const C=G.cc,cf=C.conf.list[ci];if(!cf)return[];const L=C.S&&C.S[cf.lvl];return cf.t.slice().sort((a,b)=>{const x=(L&&L.rec[a])||[0,0,0,0,0,0],y=(L&&L.rec[b])||[0,0,0,0,0,0];return(y[2]-y[3])-(x[2]-x[3])||(y[0]-y[1])-(x[0]-x[1])||((y[4]-y[5])-(x[4]-x[5]));});}
function ccMyGames(){const C=G.cc,L=C.S&&C.S[C.lvl];const out=[];if(L)L.W.forEach((W,w)=>{const g=W.find(x=>x.a===C.k||x.b===C.k);out.push({w,g});});
  const P=C.P&&C.P[C.lvl];if(P)for(const g of P.all.concat(P.pend,P.bowls||[]))if((g.a===C.k||g.b===C.k)&&!out.some(x=>x.g===g))out.push({w:'P',g});return out;}
function ccGameCell(x){const C=G.cc,g=x.g;if(!g)return`<div><b>W${x.w+1}</b><span class="dt-ln" style="color:var(--mu)">Bye week</span></div>`;const o=ccOppOf(g),hs=ccHomeSide(g);
  let r='';if(g.s){const me=g.a===C.k?g.s[0]:g.s[1],op=g.a===C.k?g.s[1]:g.s[0];r=`<span style="font-weight:800;color:${me>op?'var(--gn)':'var(--rd)'}">${me>op?'W':'L'} ${me}-${op}</span>`;}
  return`<div><b>${x.w==='P'?'P':'W'+(x.w+1)}</b>${colLogo(o,20)}<span class="dt-ln">${hs===1?'at ':hs===2?'vs ':''}${ccName(o)}${g.n?` <small style="color:var(--mu)">${g.n}</small>`:''}</span>${r||`<span class="dt-mu">${g.c?'Conf':'Non-conf'}</span>`}</div>`;}
function ccDash(){const C=G.cc,p=C.p,I=colInfo(C.k),lvl=C.lvl;if(C.stage==='pro'||C.stage==='done')return ccProDash();
  if(!C.S||!C.conf)return`<div class="dt-club"><div class="dt-crest">${colLogo(C.k,58)}</div><div class="dt-name">${I.name} ${I.mascot}<small>${CC_LVN[lvl]} · ${p.fn} ${p.ln} signed${C.walk?' as a walk-on':''}</small></div><div class="dt-go"><button class="btn bgn" onclick="ccNext()">${ccLabel()} ›</button></div></div>
    <div class="dt-strip"><b>${ccYear()} · College career</b></div><div class="pnl"><div class="pb" style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">${face(p.fs,72)}<div style="flex:1;min-width:220px"><div style="font:900 22px/1.1 var(--hd)">${p.fn} ${p.ln} · ${p.pos}</div><div style="font-size:13px;margin-top:4px">College rating <b>${p.rat}</b> (was ${C.hsRat} in high school) · potential ${p.pot}</div><div style="font-size:12px;color:var(--mu);margin-top:6px">Press <b>${ccLabel()}</b> to meet your new team: conferences, the schedule and your spot on the depth chart.</div></div></div></div>`;
  const tools=`<div class="dt-tools"><button onclick="saveGame()" title="Save"><svg viewBox="0 0 24 24"><path d="M5 3h11l3 3v15H5zM8 3v6h8V3M8 21v-7h8v7"/></svg>Save</button><button onclick="openSettings()" title="Settings"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>Settings</button><button onclick="showTutorial()" title="Help"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.01"/></svg>Help</button><button onclick="confirmMainMenu()" title="Main menu"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>Menu</button></div>`;
  const go=`<div class="dt-go"><button class="btn bgn" onclick="ccNext()">${ccLabel()} ›</button>${C.phase==='post'&&!ccMyPost()&&!ccPostDone()?`<button class="bgh" style="margin-left:6px" onclick="ccSimPost()">Sim to the end</button>`:''}</div>`;
  const club=`<div class="dt-club" style="--tA:${I.c1}"><button class="dt-menu" onclick="dtMenu()" aria-label="Menu"><svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button><div class="dt-crest">${colLogo(C.k,58)}</div><div class="dt-name">${I.name} ${I.mascot}<small>${CC_LVN[lvl]} · ${ccConfName(C.k)} · ${p.fn} ${p.ln}, ${ccClassLbl()}</small></div>${tools}${go}</div>`;
  const ph=C.phase==='start'?'Preseason':C.phase==='reg'?`Week ${C.wk+1}`:C.phase==='post'?'Postseason':['','January','Spring','Summer'][Math.floor(C.os)]||'Offseason';
  const rk=ccRankOf(C.k),strip=`<div class="dt-strip"><span class="dt-pill">${ccRecStr(C.k)} (${ccConfRecStr(C.k)})</span><b>${ccYear()} season · ${ph}</b><div class="dt-pills">${rk?`<span class="dt-pill">#${rk}</span>`:''}<span class="dt-pill">${ccMoney(C.nil.val)}/yr NIL</span></div></div>`;
  // next game
  let ng='<div class="dt-sub">Season not started.</div>';const g=C.phase==='reg'?ccMyGameAt(C.wk):C.phase==='post'?(ccMyPost()||[])[1]:null;
  if(g&&!g.s){const o=ccOppOf(g),IO=colInfo(o),hs=ccHomeSide(g),ork=ccRankOf(o);ng=`<div class="dt-ng"><div><div class="dt-sub">${g.n||('Week '+(C.wk+1)+(g.c?' · conference':''))}${hs===1?' · away':hs===2?' · neutral':' · home'}</div><div class="dt-big">${ork?'#'+ork+' ':''}${IO.name} ${IO.mascot}</div><div class="dt-sub">${ccRecStr(o)} · ${ccConfName(o)}</div>${dtChips([Math.round(ccStr(C.k)),Math.round(ccStr(o)),''].slice(0,2).concat([Math.round(ccStr(o))]))}</div><div class="dt-logo">${colLogo(o,70)}</div></div>`;}
  else if(C.phase==='reg')ng=`<div class="dt-sub">Bye week: the rest of college football plays.</div>`;
  else if(C.phase==='post')ng=`<div class="dt-sub">${ccPostDone()?'The season is over.':ccMyPostStatus()}</div>`;
  else if(C.phase==='off')ng=`<div class="dt-sub">${['','January: transfer portal and draft decisions.','Spring practice: get better and pick an NIL deal.','Summer: the new signing classes arrive.'][Math.floor(C.os)]||''}</div>`;
  ng=ng.replace(/<div class="dt-chips">[\s\S]*?<\/div>/,`<div class="dt-chips"><span>You: <b>${Math.round(ccStr(C.k))}</b></span><span>Them: <b>${g&&!g.s?Math.round(ccStr(ccOppOf(g))):'–'}</b></span></div>`);
  const r=ccRole(),tr=C.trust;
  const me=`<div style="display:flex;gap:10px;align-items:center">${face(p.fs,52)}<div><div class="dt-big">${p.pos} · ${p.rat} OVR</div><div class="dt-sub">${r.start?'<b style="color:var(--gn)">Starter</b>':'Backup #'+r.rank}${ccRsLocked()?' · redshirting':C.rsWant?' · redshirt planned':''} · ${C.gp||0} games</div></div></div>
    <div class="dt-sub" style="margin-top:8px">Coach trust ${tr}/100</div><div class="dt-bar"><i style="width:${tr}%;background:${tr>=70?'var(--gn)':tr>=45?'var(--gd)':'var(--rd)'}"></i></div><div class="dt-sub">Level ${p.pcLv||1}${p.pcSP?` · <b style="color:var(--gd)">${p.pcSP} skill points</b>`:''} · eligibility ${ccEligLeft()} yr${ccEligLeft()===1?'':'s'}</div>`;
  const ci=C.conf.by[C.k],cs=ccConfStand(ci).slice(0,8),cst=cs.map((k,i)=>`<div><b>${i+1}</b>${ccTeamLn(k)}<span class="dt-mu">${ccConfRecStr(k)} · ${ccRecStr(k)}</span></div>`).join('');
  const t25=ccRank(lvl).slice(0,8).map((k,i)=>`<div><b>${i+1}</b>${colLogo(k,20)}<span class="dt-ln${k===C.k?' me':''}">${ccName(k)}</span><span class="dt-mu">${ccRecStr(k)}</span></div>`).join('');
  const sch=ccMyGames().filter(x=>x.w==='P'||x.w>=C.wk-1).slice(0,6).map(ccGameCell).join('');
  const last=(C.car||[]).slice(-1)[0],dsTxt=ccSeasonsDone()>=2||ccEligLeft()<=1?`Draft stock: <b>${ccProj(ccDraftScore(null))}</b>`:'Draft: eligible after three seasons';
  const nil=`<div class="dt-big">${ccMoney(C.nil.val)} <small style="font-size:13px;color:var(--mu)">a year</small></div><div class="dt-sub">Career NIL earnings: <b>${ccMoney(C.nil.cash)}</b>${(C.nil.deals||[]).length?' · '+C.nil.deals.length+' brand deal'+(C.nil.deals.length>1?'s':''):''}</div><div class="dt-sub" style="margin-top:8px">${dsTxt}</div>`;
  const dep=r.mates.slice(0,6).map((q,i)=>`<div><b>${i+1}</b><span class="dt-ln${q===p?' me':''}">${q.fn} ${q.ln}${q.real&&q.hs?` <small style="color:var(--mu)">${q.hs}</small>`:''}</span><span class="dt-mu">${['','Fr','So','Jr','Sr','5th'][q===p?Math.min(5,ccYrsOut()):q.yr]||''} · ${q.rat}</span></div>`).join('');
  const st=`<div class="dt-sub">${C.gp?ccLine(p.pos,C.st):'No games yet this season.'}</div>${last?`<div class="dt-sub" style="margin-top:6px">Last season: ${last.gp} games · ${ccLine(p.pos,last.st)}</div>`:''}${(C.aw||[]).length?`<div class="dt-sub" style="margin-top:6px">Awards: ${(C.aw||[]).slice(-3).map(a=>a.n+' ('+a.t+')').join(', ')}</div>`:''}`;
  const tiles=[dtTile('Next game',"ccNext()",ng,'dt-tall'),dtTile('My player',"nav('mine')",me,'dt-tall'),dtTile(ccConfName(C.k)||'Conference',"nav('college','stand')",`<div class="dt-list">${cst}</div>`),dtTile(`Top 25 · ${CC_LVN[lvl]}`,"nav('college','rank')",`<div class="dt-list">${t25}</div>`),
    dtTile('Schedule',"nav('college','sched')",`<div class="dt-list">${sch||'<div class="dt-sub">No games.</div>'}</div>`),dtTile('NIL and draft',"nav('college','stats')",nil),dtTile(`${p.pos} depth chart`,"nav('college','roster')",`<div class="dt-list">${dep}</div>`),dtTile('Season stats',"nav('college','stats')",st)];
  return`${club}${strip}<div class="dt-grid">${tiles.join('')}</div>`;}
function ccMyPostStatus(){const C=G.cc,P=C.P&&C.P[C.lvl];if(!P)return'';if(P.champ===C.k)return'National champions!';
  const inF=P.br&&Object.prototype.hasOwnProperty.call(P.br.seed,C.k),alive=P.br&&P.br.cur.includes(C.k);
  if(P.stage==='ccg')return'Conference championship week.';if(alive)return'Your next playoff game comes after this week.';if(inF)return'Eliminated from the playoff.';
  const b=(P.bowls||[]).find(g=>g.a===C.k||g.b===C.k);if(b)return b.s?`${b.n}: played.`:`${b.n} is coming up.`;return'Your season is over. The postseason plays on.';}
window.ccSimPost=function(){let n=0;while(!ccPostDone()&&!ccMyPost()&&n++<12){ccPostRest();ccPostAdvance();}if(ccPostDone()){ccSeasonEnd();return;}ccSave();nav('dash');};
// ── the College page
function pgCollege(tab){const C=G.cc;if(!C||!C.S){return`<div class="pnl"><div class="ph">College</div><div class="pb" style="color:var(--mu)">${C?'The college season starts from the dashboard.':'No college career in this save.'}</div></div>`;}
  tab=tab||G._ccTab||'sched';G._ccTab=tab;const T=[['sched','Schedule'],['stand','Standings'],['rank','Rankings'],['roster','Roster'],['post','Postseason'],['stats','Stats & awards'],['cols','All colleges']];
  const bar=`<div class="tabs" style="margin-bottom:10px">${T.map(([k,l])=>`<button class="tab ${tab===k?'on':''}" onclick="nav('college','${k}')">${l}</button>`).join('')}</div>`;
  const lvl=G._ccLvl&&C.S[G._ccLvl]?G._ccLvl:C.lvl,lvSel=`<div class="tabs" style="margin-bottom:8px">${CC_LV.filter(l=>C.S[l]).map(l=>`<button class="tab ${l===lvl?'on':''}" onclick="G._ccLvl='${l}';nav('college','${tab}')">${CC_LVN[l]}</button>`).join('')}</div>`;
  let body='';const row=(k,i,ex)=>`<tr class="cl" onclick="colShow('${k.replace(/'/g,"\\'")}')"${k===C.k?' style="background:rgba(245,192,48,.12)"':''}><td>${i}</td><td style="white-space:nowrap">${ccTeamLn(k)}</td>${ex}</tr>`;
  if(tab==='sched'){body=`<div class="pnl"><div class="ph">${ccName(C.k)} · ${ccYear()} schedule</div><div class="pb"><div class="dt-list">${ccMyGames().map(ccGameCell).join('')}</div></div></div>`;}
  else if(tab==='stand'){const L=C.S[lvl];body=lvSel+C.conf.list.map((cf,ci)=>cf.lvl!==lvl||!cf.t.length?'':`<div class="pnl"><div class="ph">${cf.name}${cf.p4?' <small style="color:var(--mu)">power conference</small>':''}</div><div style="overflow-x:auto"><table><thead><tr><th>#</th><th>Team</th><th>Conf</th><th>Overall</th><th>PF</th><th>PA</th></tr></thead><tbody>${ccConfStand(ci).map((k,i)=>{const x=L.rec[k]||[0,0,0,0,0,0];return row(k,i+1,`<td>${x[2]}-${x[3]}</td><td>${x[0]}-${x[1]}</td><td>${x[4]}</td><td>${x[5]}</td>`);}).join('')}</tbody></table></div></div>`).join('');}
  else if(tab==='rank'){body=lvSel+`<div class="pnl"><div class="ph">${lvl==='FBS'?'Selection committee ranking':CC_LVN[lvl]+' rankings'} · top 25</div><div style="overflow-x:auto"><table><thead><tr><th>#</th><th>Team</th><th>Record</th><th>Conference</th><th>Strength</th></tr></thead><tbody>${ccRank(lvl).slice(0,25).map((k,i)=>row(k,i+1,`<td>${ccRecStr(k,lvl)}</td><td>${ccConfName(k)}</td><td>${Math.round(ccStr(k))}</td>`)).join('')}</tbody></table></div></div>`;}
  else if(tab==='roster'){const R=ccRoster(C.k).slice().sort((a,b)=>(Object.keys(CC_ST).indexOf(a.pos)-Object.keys(CC_ST).indexOf(b.pos))||b.rat-a.rat);
    body=`<div class="pnl"><div class="ph">${ccName(C.k)} roster <small style="color:var(--mu)">${R.length} players · ${R.filter(q=>q.real).length} from the high school world</small></div><div style="overflow-x:auto"><table><thead><tr><th>#</th><th>Name</th><th>Pos</th><th>Class</th><th>OVR</th><th>Stars</th><th>From</th></tr></thead><tbody>${R.map(q=>`<tr${q===C.p?' style="background:rgba(245,192,48,.12)"':''}><td>${q.num||''}</td><td style="white-space:nowrap">${q.fn} ${q.ln}${q===C.p?' <b style="color:var(--gd)">You</b>':''}</td><td><span class="pb2">${q.pos}</span></td><td>${['','Fr','So','Jr','Sr','5th'][q===C.p?Math.min(5,ccYrsOut()):q.yr]||''}</td><td>${rb(q.rat)}</td><td>${stars(q.stars||0)}</td><td style="font-size:12px;color:var(--mu)">${q===C.p?C.hs:q.real?`${q.hs}${q.hst?' ('+stName(q.hst)+')':''}`:'Out of area'}</td></tr>`).join('')}</tbody></table></div></div>`;}
  else if(tab==='post'){const P=C.P&&C.P[lvl];if(!P)body=lvSel+'<div class="pnl"><div class="pb" style="color:var(--mu)">The postseason starts after the regular season.</div></div>';
    else{const gl=G2=>G2.map(g=>`<div class="dr"><span class="a">${g.n||''}</span><span>${colLogo(g.a,18)} ${ccName(g.a)} ${g.s?`<b>${g.s[0]}-${g.s[1]}</b>`:'vs'} ${ccName(g.b)} ${colLogo(g.b,18)}</span></div>`).join('');
      const fld=P.field||(P.br?Object.keys(P.br.seed):[]);
      body=lvSel+`<div class="pnl"><div class="ph">${lvl==='FBS'?'National Championship Series':CC_LVN[lvl]+' playoffs'}${P.champ?` · champion: ${ccName(P.champ)}`:''}</div><div class="pb">${fld.length?`<div style="font-size:12px;color:var(--mu);margin-bottom:6px">Field (seed order): ${fld.map((k,i)=>`${i+1}. ${ccName(k)}`).join(' · ')}</div>`:''}${gl(P.all.filter(g=>!g.bowl))}${gl(P.pend.filter(g=>!g.s))}</div></div>
        ${lvl==='FBS'&&(P.bowls||[]).length?`<div class="pnl"><div class="ph">Bowl games</div><div class="pb">${gl(P.bowls)}</div></div>`:''}`;}}
  else if(tab==='stats'){const p=C.p;body=`<div class="pnl"><div class="ph">${p.fn} ${p.ln} · college career</div><div style="overflow-x:auto"><table><thead><tr><th>Season</th><th>School</th><th>Class</th><th>GP</th><th>Stats</th><th>Team</th><th>OVR</th><th>NIL</th></tr></thead><tbody>${(C.car||[]).map(s=>`<tr><td>${s.y}${s.red?' <small style="color:var(--gd)">RS</small>':''}</td><td style="white-space:nowrap">${colLogo(s.k,18)} ${ccName(s.k)}</td><td>${s.cls}</td><td>${s.gp}</td><td style="font-size:12px">${ccLine(p.pos,s.st)}</td><td>${s.rec[0]}-${s.rec[1]}${s.champ?' (champions)':''}</td><td>${s.ovr}</td><td>${ccMoney(s.nil||0)}</td></tr>`).join('')}${C.gp?`<tr><td>${ccYear()} (now)</td><td>${ccName(C.k)}</td><td>${ccClassLbl()}</td><td>${C.gp}</td><td style="font-size:12px">${ccLine(p.pos,C.st)}</td><td>${ccRecStr(C.k)}</td><td>${p.rat}</td><td></td></tr>`:''}</tbody></table></div></div>
    <div class="pnl"><div class="ph">Awards</div><div class="pb">${(C.aw||[]).length?C.aw.map(a=>`<div class="dr"><span class="a">${a.y}</span><span><b>${a.n}</b> · ${a.t}</span></div>`).join(''):'<span style="color:var(--mu)">No awards yet.</span>'}</div></div>
    <div class="pnl"><div class="ph">NIL</div><div class="pb"><div class="dr"><span class="a">Value this year</span><b>${ccMoney(C.nil.val)}</b></div><div class="dr"><span class="a">Career earnings</span><b>${ccMoney(C.nil.cash)}</b></div>${(C.nil.deals||[]).map(d=>`<div class="dr"><span class="a">${d.y} · ${d.n}</span><span>${ccMoney(d.cash)}</span></div>`).join('')}</div></div>
    <div class="pnl"><div class="ph">This season's games</div><div class="pb">${(C.log||[]).map(l=>`<div class="dr"><span class="a">${l.w==='P'?l.n:'Week '+l.w} · ${l.h===1?'at ':'vs '}${ccName(l.o)}</span><span>${l.s[0]>l.s[1]?'W':'L'} ${l.s[0]}-${l.s[1]} · <span style="font-size:12px">${l.st?ccLine(p.pos,l.st):'did not play'}</span></span></div>`).join('')||'<span style="color:var(--mu)">No games yet.</span>'}</div></div>`;}
  else if(tab==='cols'){body=lvSel+`<div class="pnl"><div class="ph">${CC_LVN[lvl]} colleges</div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:6px;padding:10px">${C.S[lvl].T.slice().sort((a,b)=>(COL_BY[b]||{}).pr-(COL_BY[a]||{}).pr).map(k=>`<button class="bgh" style="display:flex;gap:8px;align-items:center;text-align:left;padding:6px 8px" onclick="colShow('${k.replace(/'/g,"\\'")}')">${colLogo(k,30)}<span style="font-size:12px;line-height:1.2"><b>${ccName(k)}</b><br><small style="color:var(--mu)">${colInfo(k).mascot} · ${ccRecStr(k,lvl)}</small></span></button>`).join('')}</div></div>`;}
  return`<div class="pnl" style="margin-bottom:10px"><div class="pb" style="display:flex;align-items:center;gap:12px">${colLogo(C.k,48)}<div style="flex:1"><div style="font:900 22px/1.1 var(--hd)">${colInfo(C.k).name} ${colInfo(C.k).mascot}</div><div style="font-size:12px;color:var(--mu)">${CC_LVN[C.lvl]} · ${ccConfName(C.k)} · ${ccRecStr(C.k)}</div></div><button class="btn bgn" onclick="ccNext()">${ccLabel()} ›</button></div></div>${bar}${body}`;}
// My Player in college (and after)
function ccMine(){const C=G.cc,p=C.p,I=colInfo(C.k);let skill='';try{if(C.stage==='college'||C.stage==='pro')skill=pcSkillPanel(p);}catch(e){}
  const head=`<div class="pnl"><div class="pb" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap"><div>${face(p.fs,84)}</div>
    <div style="flex:1;min-width:220px"><div style="font-size:12px;color:var(--mu);font-weight:800;letter-spacing:.06em;">My Player · ${C.stage==='college'?ccClassLbl():C.stage==='pro'?'Pro':'Career over'}</div>
      <div style="font-family:var(--hd);font-size:30px;font-weight:900;line-height:1.05">#${p.num} ${p.fn} ${p.ln}</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:4px"><span class="pb2">${p.pos}</span>${rb(p.rat)} ${stars(p.stars||0)} ${devB(p.dev)} ${p.arch?`<span style="font-size:11px;color:var(--mu)">${p.arch}</span>`:''}</div>
      <div style="font-size:12px;color:var(--mu);margin-top:6px">${I.name} ${I.mascot} · potential ${p.pot} · Level ${p.pcLv||1} · high school: ${C.hs} (${C.hsRat} OVR)</div></div>
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px">${colLogo(C.k,64)}${C.stage!=='done'?'<button class="bgh bsm" onclick="myGearOpen()">Look and equipment</button>':''}</div></div></div>`;
  let pro='';if(C.stage!=='college'){try{const a=aiG().alumni[C.pid];if(a)pro=`<div class="pnl"><div class="ph">Pro career</div><div class="pb">${aiCareerCard(a,p)}</div></div>`;else if(C.stage==='done')pro=`<div class="pnl"><div class="ph">After college</div><div class="pb">No pro team signed ${p.fn} after the draft. His football career is over.</div></div>`;}catch(e){}}
  return head+skill+pro+pgCollege('stats').replace(/^[\s\S]*?<div class="tabs"[\s\S]*?<\/div>/,'');}
function ccProDash(){const C=G.cc,p=C.p,D=C.draft||{},a=(()=>{try{return aiG().alumni[C.pid];}catch(e){return null;}})();
  const tm=a&&a.team?a.team:D.res&&D.res.team||'';
  return`<div class="dt-club"><div class="dt-crest">${face(p.fs,58)}</div><div class="dt-name">${p.fn} ${p.ln}<small>${C.stage==='pro'?`${tm}${a&&a.lg?' · '+a.lg:''}`:'Football career complete'} · ${p.pos}</small></div><div class="dt-tools"><button onclick="saveGame()">Save</button><button onclick="openSettings()">Settings</button><button onclick="confirmMainMenu()">Menu</button></div><div class="dt-go"><button class="btn bgn" onclick="ccNext()">${ccLabel()} ›</button></div></div>
   <div class="dt-strip"><b>${ccYear()} · ${C.stage==='pro'?'Pro career':'Retired'}</b></div>
   <div class="g2" style="align-items:start"><div class="pnl"><div class="ph">${C.stage==='pro'?'Pro career':'Draft'}</div><div class="pb">${a?aiCareerCard(a,p):`<div>${D.res?'':'Undrafted, no pro offers.'}</div>`}</div></div>
   <div class="pnl"><div class="ph">College career</div><div class="pb">${(C.car||[]).map(s=>`<div class="dr"><span class="a">${s.y} · ${colLogo(s.k,16)} ${ccName(s.k)}</span><span style="font-size:12px">${s.gp} GP · ${ccLine(p.pos,s.st)}</span></div>`).join('')}<div class="dr"><span class="a">NIL earnings</span><b>${ccMoney(C.nil.cash)}</b></div>${(C.aw||[]).filter(x=>x.big).map(x=>`<div class="dr"><span class="a">${x.y}</span><span>${x.n} · ${x.t}</span></div>`).join('')}
   <div style="margin-top:10px"><button class="bgh bsm" onclick="ccBackToHs()">Back to the high school (coach view)</button></div></div></div></div>`;}

