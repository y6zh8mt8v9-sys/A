// ═══════════ STARS & OFFERS ═══════════

// FIX: calcOLScore, single clean function body (was duplicated/corrupted in original)
// OL score: rating + dev + physical attributes (no stats)
// Height, weight, mood, and traits all factor in. Stars harder to earn for OL.
function calcOLScore(p){
  const ratScore=(p.rat/99)*100;
  const devBonus={'Elite Dev':16,'Star':9,'Impact':4,'Normal':0}[p.dev]||0;
  const traits=p.traits||[];
  const traitBonus=traits.reduce((s,t)=>{
    return s+({'workhorse':4,'gym-rat':4,'coachable':2,'leader':3,'natural':3,'competitor':2}[t]||0);
  },0);
  const physStrBonus=((p.str-50)/50)*9;

  const htDiff=(p.ht||72)-76;
  const htBonus=htDiff>=2?6:htDiff>=0?3:htDiff>=-2?0:htDiff>=-4?-4:-8;

  const wt=p.wt||220;
  const wtBonus=wt>=290?7:wt>=275?4:wt>=255?1:wt>=235?-3:wt>=215?-7:-12;

  const moodTraitMod=traits.includes('hothead')?-10:
                     traits.includes('lazy')?-8:
                     traits.includes('showboat')?-5:
                     traits.includes('leader')?4:
                     traits.includes('workhorse')?3:
                     traits.includes('gym-rat')?3:0;

  const moodBonus={'high':4,'good':2,'neutral':0,'low':-6}[p.mood]||0;

  const rawScore=ratScore+devBonus+traitBonus+physStrBonus+htBonus+wtBonus+moodTraitMod+moodBonus;

  const devStiff={'Elite Dev':0.72,'Star':0.64,'Impact':0.57,'Normal':0.48}[p.dev]||0.48;
  const ratMod=p.rat>=85?0.06:p.rat>=78?0.04:p.rat>=70?0.01:p.rat>=60?-0.02:p.rat>=50?-0.05:-0.09;
  const traitStiffMod=traits.includes('lazy')?-0.07:
                      traits.includes('hothead')?-0.06:
                      traits.includes('showboat')?-0.04:
                      traits.includes('gym-rat')?0.04:
                      traits.includes('workhorse')?0.03:
                      traits.includes('natural')?0.02:0;
  const htStiffMod=p.ht>=78?0.03:p.ht>=76?0.01:p.ht<=70?-0.04:p.ht<=68?-0.07:0;
  const wtStiffMod=wt>=285?0.03:wt>=265?0.01:wt<=235?-0.04:wt<=215?-0.07:0;

  const stiffness=clamp(devStiff+ratMod+traitStiffMod+htStiffMod+wtStiffMod,0.40,0.75);
  return clamp(rawScore*stiffness,0,120);
}

// FIX: Kicker score: based on rating, accuracy (awr), and leg strength (str)
function calcKScore(p){
  const ratScore=(p.rat/99)*100;
  const devBonus={'Elite Dev':15,'Star':9,'Impact':5,'Normal':0}[p.dev]||0;
  const traitBonus=(p.traits||[]).reduce((s,t)=>{
    return s+({'clutch':6,'competitor':5,'coachable':4,'natural':4,'workhorse':3}[t]||0);
  },0);
  const awrBonus=((p.awr-50)/50)*8; // accuracy matters
  const strBonus=((p.str-50)/50)*6; // leg strength matters
  return clamp(ratScore+devBonus+traitBonus+awrBonus+strBonus,0,120);
}

// ── v1.94 efficiency stats ──
function stEff(s){s=s||{};const gp=s.gp||0,ch=(s.rec||0)+(s.drops||0);return{cmp:s.passAtt?s.passCmp/s.passAtt:null,ypc:s.rushAtt?s.rushYds/s.rushAtt:null,ypr:s.rec?s.recYds/s.rec:null,kr:s.krRet?s.krYds/s.krRet:null,
    drop:ch?(s.drops||0)/ch:null,ypgA:gp&&s.tgtA!=null?(s.ydsA||0)/gp:null,pkG:gp?(s.pancakes||0)/gp:null,saG:gp?(s.sacksA||0)/gp:null};}
function fmtPct(v){return v==null?'–':(v*100).toFixed(1)+'%';}
function fmtAvg(v){return v==null?'–':v.toFixed(1);}
// accurate passers, efficient runners, big-play receivers and dangerous returners grade out better than raw totals say
function effBonus(p,s){s=s||p.seasStats||{};const gp=Math.max(1,s.gp||1),e=stEff(s);let b=0;
  if(p.pos==='QB'&&(s.passAtt||0)>=12)b+=clamp((e.cmp-0.55)*35,-7,8);
  if((p.pos==='RB'||p.pos==='QB')&&(s.rushAtt||0)>=15)b+=clamp((e.ypc-(p.pos==='QB'?4:4.5))*(p.pos==='RB'?2.5:1.2),-4,6);
  if((p.pos==='WR'||p.pos==='TE'||p.pos==='RB')&&(s.rec||0)>=6)b+=clamp((e.ypr-(p.pos==='TE'?10:p.pos==='RB'?8:12))*(p.pos==='RB'?0.3:0.5),-3,4);
  if((s.krRet||0)>=3)b+=clamp((e.kr-20)*0.25,-2,4)+((s.krTD||0)/gp)*8;
  // sure hands vs. drops (share of catchable balls that hit the turf)
  if(['WR','TE','RB'].includes(p.pos)&&((s.rec||0)+(s.drops||0))>=8)b-=clamp((e.drop-0.07)*40,-2,5);
  // coverage: passes broken up, and the yards given up in the player's own assignment
  if(['CB','S','LB'].includes(p.pos)){b+=Math.min(6,((s.pbu||0)/gp)*(p.pos==='LB'?3:4));if(p.pos!=='LB'&&(s.gp||0)>=2&&s.tgtA!=null)b-=clamp(((s.ydsA||0)/gp-(p.pos==='CB'?30:18))*0.08,-3,4);}
  return b;}
// offensive line production: pancakes and sacks allowed per game
function olBonus(p,s){s=s||p.seasStats||{};const gp=s.gp||0;if(p.pos!=='OL'||gp<2)return 0;return clamp(((s.pancakes||0)/gp-1.5)*3,-4,8)-clamp(((s.sacksA||0)/gp-0.35)*8,-2,6);}
function calcSS(p,st){const b=calcSSBase(p,st);return p.pos==='K'?b:p.pos==='OL'?b+olBonus(p,st):b+effBonus(p,st);}
function calcSSBase(p,st){
  if(p.pos==='OL')return calcOLScore(p);
  if(p.pos==='K')return calcKScore(p); // FIX: kickers use rating-based score
  const s=st||p.seasStats,gp=Math.max(1,s.gp||1);
  if(p.pos==='QB')return((s.passYds||0)/gp)/12+((s.passTD||0)/gp)*7-((s.passInt||0)/gp)*4;
  if(p.pos==='RB')return((s.rushYds||0)/gp)/5+((s.rushTD||0)/gp)*9;
  if(['WR','TE'].includes(p.pos))return((s.recYds||0)/gp)/5+((s.recTD||0)/gp)*9;
  if(['LB','DL'].includes(p.pos))return((s.tackles||0)/gp)*1.5+((s.sacks||0)/gp)*7;
  if(['CB','S'].includes(p.pos))return((s.tackles||0)/gp)*1.5+((s.ints||0)/gp)*9;
  return p.rat*.5;
}

// ═══════════ PLAYER AWARDS ═══════════
// Award score = 70% normalised season stats + 20% rating + 10% dev trait
function calcAwardScore(p){
  const DEV_SCORE={'Elite Dev':100,'Star':75,'Impact':50,'Normal':25};
  const devScore=(DEV_SCORE[p.dev]||25)/100; // 0-1
  // Normalise rating 0-1
  const ratScore=p.rat/99;
  // Normalised stat score, reuse calcSS but cap at 120 then scale 0-1
  const ss=clamp(calcSS(p),0,120)/120;
  // OL and K are purely rating-based and less comparable to skill positions; exclude from award pool
  if(p.pos==='OL'||p.pos==='K')return 0;
  // Must have played at least 3 games to be eligible
  if((p.seasStats?.gp||0)<3)return 0;
  return ss*0.70 + ratScore*0.20 + devScore*0.10;
}

// ═══════════ STARS, COLLEGE OFFERS AND CAMPS (v1.88 rework) ═══════════
// Stars come from overall rating + development trait (+ a projection bonus for underclassmen), with only a small
// nudge from stats, size and camp showings. Colleges recruit by prestige: better programs go after better players,
// with real-life variation and the odd reach offer for a kid with monster numbers.
// stars rank a player within his own class year, like real recruiting services: share of the class at or above each star
const STAR_SHARE=[1,0.045,0.024,0.01,0.0035,0.001];
// ratings are banded by classification; scouts partly look past that, so smaller-school standouts can still earn stars
function recClsAdj(p){const s=getS(p.sId);return s?({'5A':0,'4A':3,'3A':6,'2A':9,'1A':12}[clsEq(s.cls)]||0)+(XCLS[s.cls]?1:0):0;}
function recBase(p){const dv={'Elite Dev':6,'Star':4,'Impact':2,'Normal':0}[p.dev]||0;return p.rat+dv+sizeFit(p)*0.5+recClsAdj(p);}
// v2.06: two scales from one ranking of every class year.
//  T = the scouts' grade (p.sg): the recruiting engine (offers, camps, commitments) keeps using it, so recruiting is exactly as hard as before.
//  N = the national star rating shown everywhere (p.stars): fixed numbers per class across the country, like the recruiting services,
//      about 32 five-stars, 280 four-stars, 1,150 three-stars and 1,000 two-stars per class (v2.11) by the end of senior year. There are no
//      one-star players; everyone else is unranked and can still earn offers.
const NAT_STARS={5:32,4:280,3:1150,2:1000};
let NAT_POOL_FULL=22000;                    // players per class in the full 13-state country (about 22,000); with fewer players the counts scale down
const NAT_YR_F={12:1,11:1,10:0.6,9:0.25};    // underclassmen are only partly ranked yet
function _recPools(){
  const key=G.yr+'|'+(G.week||0)+'|'+(G.phase||'')+'|'+G.players.length;
  if(!G._thr||G._thr.key!==key){const by={};
    const byD={};
    for(const p of G.players){if(p.grad||p.yr<9||p.yr>12||!p.sId)continue;const v=recScore(p);(by[p.yr]=by[p.yr]||[]).push(v);if(!p.lt)(byD[p.yr]=byD[p.yr]||[]).push(v);}
    const virt=USA.on&&USA.virt?USA.virt:0;
    const T={},N={},C={};for(const y in by){const a=by[y].sort((x,z)=>z-x),n=a.length,D=(byD[y]||a).slice().sort((x,z)=>z-x),nd=D.length||1;T[y]=STAR_SHARE.map((f,i)=>i?D[Math.min(nd-1,Math.max(0,Math.ceil(nd*f)-1))]:-1e9);
      const sc=Math.min(1,(virt?(byD[y]||[]).length+virt:n)/NAT_POOL_FULL)*(NAT_YR_F[y]||1);let cum=0;const t=[-1e9,Infinity,0,0,0,0];
      for(let s=5;s>=2;s--){cum+=NAT_STARS[s]*sc;const i=Math.round(cum)-1;t[s]=i<0?Infinity:a[Math.min(n-1,i)];}
      N[y]=t;C[y]=Math.round(NAT_STARS[5]*sc);}
    Object.defineProperty(G,'_thr',{value:{key,T,N,C},writable:true,configurable:true,enumerable:false});}
  return G._thr;
}
function starCap5(){if(!G||!G.players)return;const R=_recPools(),by={};for(const p of G.players)if(!p.grad&&p.stars===5&&p.yr>=9&&p.yr<=12)(by[p.yr]=by[p.yr]||[]).push(p);
  for(const y in by){const cap=R.C&&R.C[y]!=null?R.C[y]:32,L=by[y];if(L.length<=cap)continue;L.sort((a,b)=>recScore(b)-recScore(a));for(const p of L.slice(cap))p.stars=4;}}
function starThr(yr){const R=_recPools();return R.T[yr]||R.T[12]||[ -1e9,80,84,87,89,91];}
function natThr(yr){const R=_recPools();return R.N[yr]||R.N[12]||[-1e9,Infinity,Infinity,Infinity,Infinity,Infinity];}

const COL_BY={},COLLEGES=[];
// v2.14: rebuilt when League Setup changes the college lists
function buildColleges(){const L=COLLEGES;L.length=0;const acad={'Franklin Lutheran':3.4,"Ravenscroft College":3.5,"Sonora Methodist":3.4,'Killeen Wesleyan':3.4,"Rolfe College":3.4,"Overton College":3.4,"Dalhart Lutheran":3.3,"Cisco Methodist":3.3,"Decorah Lutheran":3.3,'Loring College':3.3,"Stephenville State":3.2,"Canadian":3.1,"Northern Llano Grande":3.2,"Cotulla State":3.5,"Lampasas State":3.5,"Southern Acadia State":3.6,"Wharton":3.4,"Northern Magnolia":3.4,"Chesterton College":3.3,"South Granite":3.4,"Foxwood State":3.4,"Borger State":3.4,'Llano Grande State':3.2,"Mason State":3.2,'Ganado':3.0,'Junction':3.0,"Ozona State":3.0,"Tyler State":3.0,'Clarion':3.0};
  // program strength spreads evenly from the top of each level to its floor, however long the list is
  const add=(arr,lvl,hi,lo,ac)=>arr.forEach((n,i)=>L.push({school:n,lvl,pr:Math.round(hi-(hi-lo)*i/Math.max(1,arr.length-1)),acad:ac?(acad[n]||0):0}));
  add(D1FBS,'FBS',99,56,1);add(D1FCS,'FCS',55,30,1);add(D2,'D2',38,18);add(D3,'D3',24,5,1);add(NAIA,'NAIA',29,12);add(JUCO,'JUCO',20,3);
  for(const c of L)c.pr=Math.max(1,c.pr);const _st={};for(const k in COL_BY){if(COL_BY[k].st)_st[k]=COL_BY[k].st;delete COL_BY[k];}for(const c of L){const k=c.school+'|'+c.lvl;COL_BY[k]=c;if(_st[k])c.st=_st[k];}
  try{const M=colMetaSrc();for(const k in M){const c=COL_BY[k];if(!c)continue;if(M[k].pr)c.pr=clamp(Math.round(+M[k].pr)||c.pr,1,99);if(M[k].st)c.st=M[k].st;}}catch(e){}return L;}
// ── college identity: every college has a mascot, colors, abbreviation and a real logo like the high schools.
// Defaults come from the name (always the same), edits live in this save's world (G.world.colMeta) or in League Setup.
const COL_MASC=['Tigers','Bulldogs','Eagles','Wildcats','Bears','Lions','Panthers','Huskies','Knights','Spartans','Trojans','Rams','Mustangs','Cougars','Falcons','Hawks','Owls','Pirates','Vikings','Cardinals','Bison','Longhorns','Hurricanes','Wolves','Broncos','Jaguars','Bobcats','Grizzlies','Wolverines','Badgers','Griffins','Raptors','Gladiators','Crusaders','Lancers','Cavaliers','Raiders','Mariners','Rattlers','Outlaws','Patriots','Rebels','Mavericks','Warriors','Chargers','Rockets','Comets','Redhawks','Seahawks','Stallions','Coyotes','Lynx','Sharks','Ospreys','Thunderbolts','Blazers','Minutemen','Centurions','Sentinels','Loggers'];
const COL_PAL=[['#8c1d18','#ffffff'],['#002f6c','#f0b323'],['#00543c','#ffffff'],['#4b2e83','#e8d3a2'],['#bf5700','#ffffff'],['#9e1b32','#828a8f'],['#0021a5','#fa4616'],['#13294b','#e84a27'],['#782f40','#ceb888'],['#000000','#ffc72c'],['#cc0033','#000000'],['#154734','#c4a35a'],['#003087','#ffffff'],['#a6192e','#ffb81c'],['#006747','#ffcd00'],['#5d2a2c','#ffffff'],['#041e42','#a2aaad'],['#860038','#fdbb30'],['#2d68c4','#ffffff'],['#ff8200','#58595b'],['#ce1141','#002d72'],['#6a2c91','#ffffff'],['#00205b','#c8102e'],['#7a0019','#ffcc33'],['#1b365d','#7ba4db'],['#ba0c2f','#ffffff'],['#0c2340','#d1aa5b'],['#e00122','#ffffff']];
function colMetaSrc(){try{if((window._wsRendering||(window._wsColEdit&&document.getElementById('ws-col')))&&WS.draft)return WS.draft.colMeta||(WS.draft.colMeta={});}catch(e){}
  try{if(typeof G!=='undefined'&&G&&G.world)return G.world.colMeta||(G.world.colMeta={});}catch(e){}
  try{if(WORLD&&typeof WORLD==='object')return WORLD.colMeta||(WORLD.colMeta={});}catch(e){}return{};}
function colHash(t){let h=7;for(const ch of String(t||''))h=(h*31+ch.charCodeAt(0))>>>0;return h;}
function colAbbr(n){const w=String(n||'').replace(/\b(University|College|of|the|CC)\b/g,' ').trim().split(/\s+/).filter(x=>/[A-Za-z]/.test(x));
  if(!w.length)return'COL';if(w.length===1)return w[0].replace(/[^A-Za-z]/g,'').slice(0,4).toUpperCase();return w.map(x=>x.replace(/[^A-Za-z&]/g,'')[0]||'').join('').toUpperCase().slice(0,4);}
const _colDefC={};
function colDef(k){if(_colDefC[k])return _colDefC[k];const i=k.lastIndexOf('|'),n=k.slice(0,i),lv=k.slice(i+1),h=colHash(n);
  let ms=COL_MASC.filter(m=>typeof _LK==='undefined'||_LK[m.toLowerCase()]);if(!ms.length)ms=COL_MASC;const pal=COL_PAL[(h>>>5)%COL_PAL.length];
  return _colDefC[k]={k,name:n,lvl:lv,mascot:ms[h%ms.length],c1:pal[0],c2:pal[1],abbr:colAbbr(n)};}
function colInfo(k){if(k&&typeof k==='object')k=k.school+'|'+k.lvl;const c=COL_BY[k],M=colMetaSrc()[k]||{},I=Object.assign({},colDef(k),M);
  I.k=k;I.name=c?c.school:I.name;I.pr=c?c.pr:(M.pr||0);I.st=M.st||(c&&c.st)||'CF';I.lvl=c?c.lvl:I.lvl;try{I.conf=colConfOf(k);}catch(e){}return I;}
function colLogo(k,sz){try{const I=colInfo(k);return sLogo({name:I.name,mascot:I.mascot,c1:I.c1,c2:I.c2,logoKey:I.logoKey,mash:I.mash,customLogo:I.customLogo},sz||24);}catch(e){return'';}}
function colTeamObj(k){const I=colInfo(k);return{name:I.name,mascot:I.mascot,c1:I.c1,c2:I.c2,abbr:I.abbr,logoKey:I.logoKey,mash:I.mash,customLogo:I.customLogo,col:k};}
function colConfOf(k){try{const C=G&&G.cc&&G.cc.conf;if(C&&C.by&&C.by[k]!=null)return C.list[C.by[k]].name;}catch(e){}return'';}
// renaming a college moves every reference: offers, commitments, dream schools, class books, signing lists, alumni, college career
function colRename(oldK,newName){const i=oldK.lastIndexOf('|'),on=oldK.slice(0,i),lv=oldK.slice(i+1),nk=newName+'|'+lv;if(nk===oldK)return oldK;
  const A={FBS:D1FBS,FCS:D1FCS,D2,D3,NAIA,JUCO}[lv];if(!A)return oldK;if(A.includes(newName))throw new Error('There is already a '+lv+' college called '+newName+'.');
  const j=A.indexOf(on);if(j<0)return oldK;A[j]=newName;
  const W=(typeof G!=='undefined'&&G&&G.world)?G.world:WORLD;if(W){W.colleges=W.colleges||{};W.colleges[lv]=A.slice();}
  const M=colMetaSrc();if(M[oldK]){M[nk]=M[oldK];delete M[oldK];}delete _colDefC[oldK];
  const oldSt=COL_BY[oldK]&&COL_BY[oldK].st;buildColleges();if(COL_BY[nk]&&oldSt&&!COL_BY[nk].st)COL_BY[nk].st=oldSt;try{aiConfRebuild();}catch(e){}
  if(typeof G!=='undefined'&&G){const seen=new Set(),walk=(o,d)=>{if(!o||typeof o!=='object'||d>9||seen.has(o))return;seen.add(o);
      if(Array.isArray(o)){for(let x=0;x<o.length;x++){const v=o[x];if(v===oldK)o[x]=nk;else if(v&&typeof v==='object')walk(v,d+1);}return;}
      if(o.school===on&&(o.lvl===lv||o.lvl==null))o.school=newName;if(o.k===oldK)o.k=nk;
      for(const key of Object.keys(o)){const v=o[key];if(key===oldK){o[nk]=v;delete o[oldK];}if(v===oldK)o[key]=nk;else if(v&&typeof v==='object')walk(v,d+1);}};
    for(const key of Object.keys(G))if(key!=='world'&&key!=='divisions'&&key!=='allLeagues')walk(G[key],0);}
  return nk;}
// the editor: the same fields as Edit School for high schools
function colFormHtml(I,ctx){const lg=Object.keys(_LGO||{}).sort(),opt=(v,l,c)=>`<option value="${v}"${v===c?' selected':''}>${l}</option>`;
  const conf=(ctx==='save'&&G&&G.cc&&G.cc.conf)?G.cc.conf:null;
  return`<div style="display:flex;gap:14px;align-items:center;margin-bottom:10px"><div id="ce-prev">${colLogo(I.k,84)}</div><div style="font-size:12px;color:var(--mu)">${I.lvl} · prestige ${I.pr}${I.conf?' · '+I.conf:''}<br>Change anything below. The logo updates as you type.</div></div>
   <div class="g2" style="gap:8px">
    <label style="font-size:12px;display:flex;flex-direction:column;gap:3px">Name<input id="ce-n" maxlength="40" value="${I.name}" oninput="colEditPrev()"></label>
    <label style="font-size:12px;display:flex;flex-direction:column;gap:3px">Mascot<input id="ce-m" maxlength="24" value="${I.mascot}" list="ce-ml" oninput="colEditPrev()"><datalist id="ce-ml">${(typeof avMascots==='function'?avMascots():[]).map(m=>`<option value="${m}">`).join('')}</datalist></label>
    <label style="font-size:12px;display:flex;flex-direction:column;gap:3px">Abbreviation<input id="ce-a" maxlength="5" value="${I.abbr||''}"></label>
    <label style="font-size:12px;display:flex;flex-direction:column;gap:3px">State<select id="ce-st">${ST_ORDER.map(x=>opt(x,stName(x),I.st)).join('')}</select></label>
    <label style="font-size:12px;display:flex;flex-direction:column;gap:3px">Primary color<input type="color" id="ce-c1" value="${I.c1}" oninput="colEditPrev()"></label>
    <label style="font-size:12px;display:flex;flex-direction:column;gap:3px">Secondary color<input type="color" id="ce-c2" value="${I.c2}" oninput="colEditPrev()"></label>
    <label style="font-size:12px;display:flex;flex-direction:column;gap:3px">Logo icon<select id="ce-lk" onchange="colEditPrev()">${opt('','Automatic (from the mascot)',I.logoKey||'')}${lg.map(x=>opt(x,x,I.logoKey||'')).join('')}</select></label>
    <label style="font-size:12px;display:flex;flex-direction:column;gap:3px">Badge (mascot mashup)<select id="ce-mash" onchange="colEditPrev()">${opt('','None',I.mash||'')}${lg.map(x=>opt(x,x,I.mash||'')).join('')}</select></label>
    <label style="font-size:12px;display:flex;flex-direction:column;gap:3px">Prestige (1-99)<input type="number" id="ce-pr" min="1" max="99" value="${I.pr||50}"></label>
    ${conf?`<label style="font-size:12px;display:flex;flex-direction:column;gap:3px">Conference<select id="ce-cf">${conf.list.map((c,i)=>c.lvl===I.lvl?opt(String(i),c.name,String(conf.by[I.k])):'').join('')}</select></label>`:''}
   </div>
   <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:8px"><label class="bgh bsm" style="cursor:pointer">Upload a logo<input type="file" accept="image/*" style="display:none" onchange="colEditUpload(this)"></label><button class="bgh bsm" onclick="colEditClearLogo()">Remove uploaded logo</button><button class="bgh bsm" onclick="colEditReset()">Back to default</button><span id="ce-up" style="font-size:12px;color:var(--mu)">${I.customLogo?'Custom logo in use':''}</span></div>`;}
window._ceLogo=undefined;
function colEditRead(){const v=id=>{const e=document.getElementById(id);return e?e.value:'';};return{name:wsClean(v('ce-n')),mascot:wsClean(v('ce-m')).slice(0,24),abbr:wsClean(v('ce-a')).toUpperCase().replace(/[^A-Z&]/g,'').slice(0,5),st:v('ce-st'),c1:v('ce-c1'),c2:v('ce-c2'),logoKey:v('ce-lk')||undefined,mash:v('ce-mash')||undefined,pr:clamp(Math.round(+v('ce-pr'))||50,1,99),cf:v('ce-cf')};}
window.colEditPrev=function(){const r=colEditRead(),I=colInfo(window._ceK),lg=window._ceLogo!==undefined?window._ceLogo:I.customLogo,e=document.getElementById('ce-prev');
  if(e)e.innerHTML=sLogo({name:r.name||I.name,mascot:r.mascot||I.mascot,c1:r.c1,c2:r.c2,logoKey:r.logoKey,mash:r.mash,customLogo:lg},84);};
window.colEditUpload=function(inp){const f=inp.files&&inp.files[0];if(!f)return;logoShrink(f,d=>{window._ceLogo=d;const u=document.getElementById('ce-up');if(u)u.textContent='Custom logo in use';colEditPrev();});};
window.colEditClearLogo=function(){window._ceLogo=null;const u=document.getElementById('ce-up');if(u)u.textContent='';colEditPrev();};
window.colEditReset=function(){const M=colMetaSrc(),k=window._ceK;delete M[k];window._ceLogo=undefined;if(!window._wsColEdit)try{buildColleges();}catch(e){}colEditReopen(k);};
function colEditApply(){let k=window._ceK;const r=colEditRead(),M=colMetaSrc();if(!r.name){notify('Give the college a name.','w');return null;}const _on=colInfo(k).name;if(r.name!==_on&&r.abbr===colAbbr(_on))r.abbr='';
  if(r.name!==colInfo(k).name){if(window._wsColEdit){const lv=k.slice(k.lastIndexOf('|')+1),D=WS.draft,O=worldOrig(),list=(D.colleges&&D.colleges[lv]&&D.colleges[lv].length?D.colleges[lv]:O.colleges[lv]).slice(),j=list.indexOf(colInfo(k).name);
      if(list.includes(r.name)){notify('There is already a '+lv+' college called '+r.name+'.','e');return null;}if(j>=0)list[j]=r.name;D.colleges=D.colleges||{};D.colleges[lv]=list;const nk=r.name+'|'+lv;if(M[k]){M[nk]=M[k];delete M[k];}k=nk;}
    else{try{k=colRename(k,r.name);}catch(e){notify(e.message,'e');return null;}}}
  const D=colDef(k),m=M[k]||{};m.mascot=r.mascot&&r.mascot!==D.mascot?r.mascot:undefined;m.abbr=r.abbr&&r.abbr!==D.abbr?r.abbr:undefined;m.c1=r.c1!==D.c1?r.c1:undefined;m.c2=r.c2!==D.c2?r.c2:undefined;
  m.logoKey=r.logoKey;m.mash=r.mash;m.st=r.st;m.pr=r.pr;if(window._ceLogo!==undefined)m.customLogo=window._ceLogo||undefined;
  for(const x in m)if(m[x]===undefined)delete m[x];M[k]=m;window._ceLogo=undefined;
  if(r.cf!==''&&G&&G.cc&&G.cc.conf&&!window._wsColEdit){try{ccSetConf(k,+r.cf);}catch(e){}}
  if(!window._wsColEdit){try{buildColleges();}catch(e){}if(COL_BY[k]){COL_BY[k].pr=r.pr;COL_BY[k].st=r.st;}}return k;}
function colEditReopen(k){if(window._wsColEdit){WS.colEdit=k;wsRender();}else openColEdit(k);}
window.openColEdit=function(k){window._wsColEdit=false;window._ceK=k;window._ceLogo=undefined;const I=colInfo(k);
  openMo(`<h2>Edit college</h2>${colFormHtml(I,'save')}<div style="text-align:right;margin-top:12px;display:flex;gap:8px;justify-content:flex-end"><button class="bgh" onclick="clo()">Cancel</button><button class="btn bgn" onclick="colEditSave()">Save</button></div>`);};
window.colEditSave=function(){const k=colEditApply();if(!k)return;clo();notify(colInfo(k).name+' saved');try{if(G&&G.page)nav(G.page);}catch(e){}};
buildColleges();
// v1.94: every college signs a class of 30-85 players, split across positional needs. Offers stop once a
// position board is crowded (3x the open spots), commits stop once the spots are filled.
const POS_NEED_W={QB:3,RB:4,WR:8,TE:3,OL:11,DL:9,LB:7,CB:6,S:5,K:1};
function _colRand(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}
  return()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
const COL_RENAME={"Alabama":"Llano Grande","Ohio State":"Coralina","Georgia":"Magnolia","Texas":"Crestfield","LSU":"Cumberland","Oregon":"Acadia","Michigan":"Cascadia","Notre Dame":"Llano Grande State","Clemson":"Coralina State","USC":"Magnolia State","Oklahoma":"Llano Grande A&M","Penn State":"Wakota","Florida":"Summit","Tennessee":"Tierra Alta","Texas A&M":"Crestfield State","Miami":"Cumberland State","Auburn":"Cascadia State","Florida State":"Magnolia A&M","Ole Miss":"Acadia State","Indiana":"Coralina Tech","Washington":"Cumberland Tech","South Carolina":"Llano Grande Tech","Missouri":"Wakota State","Nebraska":"Summit State","Wisconsin":"Tierra Alta State","Iowa":"Crestfield Tech","Utah":"Cascadia Tech","Kentucky":"Wakota Tech","Arkansas":"Summit Mines","Mississippi State":"Acadia Tech","UCLA":"Shelton University","Michigan State":"Ormsby University","Louisville":"Northam University","North Carolina":"Langford University","Colorado":"Beckett University","Arizona State":"Harrington University","Baylor":"Wickham University","TCU":"Winslow University","Texas Tech":"Ainsworth University","Kansas State":"Brookhaven University","Oklahoma State":"Eastern Llano Grande","BYU":"Southern Crestfield","Iowa State":"Central Tierra Alta","SMU":"Western Crestfield","NC State":"South Acadia","Virginia Tech":"North Summit","Minnesota":"Eastern Magnolia","Illinois":"Western Llano Grande","Maryland":"East Coralina","Purdue":"Southern Cascadia","Rutgers":"Western Cumberland","Northwestern":"Northern Llano Grande","West Virginia":"Ranger Christian","Pitt":"Benton State","Syracuse":"Spearman Christian","Duke":"Mason State","Georgia Tech":"Rockford","Virginia":"Shelbyville","Wake Forest":"Ganado","Boston College":"Junction","Stanford":"Borger State","California":"Haskell","Arizona":"Granite","Houston":"Salado State","Cincinnati":"Hereford State","UCF":"Beeville Christian","Kansas":"Milford State","Vanderbilt":"Canadian","Boise State":"Sonora State","Tulane":"Canyon State","Memphis":"Llano State","James Madison":"Kaimana","Liberty":"Jasper State","UNLV":"Hico State","Army":"Ozona State","Navy":"Tyler State","Air Force":"Clarion","San Diego State":"Elgin","Fresno State":"Ravenwood","Oregon State":"Waco","Washington State":"Aurora","Utah State":"San Miguel Christian","Colorado State":"Graham State","Toledo":"Odessa","Appalachian State":"Kerrville State","Coastal Carolina":"Pampa State","Louisiana":"Elmdale Christian","Marshall":"San Benito State","South Florida":"Fairfield State","UTSA":"Granite State","North Texas":"Wilmington","Texas State":"Breckenridge","Western Kentucky":"Katy State","Georgia Southern":"Dover State","Troy":"Uvalde State","Old Dominion":"Electra State","Arkansas State":"Snyder","South Alabama":"Alvin State","Southern Miss":"Kaimana State","Georgia State":"San Gabriel","Louisiana-Monroe":"Ulysses State","East Carolina":"Garner State","Temple":"Comanche State","Tulsa":"Childress State","Rice":"Stephenville State","UAB":"Santa Rosa","Charlotte":"Belton State","FAU":"Lamesa State","Wyoming":"Bryan","Hawaii":"Cleveland State","Nevada":"Gatesville State","New Mexico":"Santa Inés State","San Jose State":"Hallettsville State","Miami (OH)":"Madison","Ohio":"Brenham Christian","Northern Illinois":"Cuero State","Bowling Green":"Coleman State","Buffalo":"Rocksprings","Western Michigan":"Stinnett State","Central Michigan":"Wellington","Eastern Michigan":"Ballinger Christian","Ball State":"Hudson","Kent State":"Refugio","Akron":"Eastland","UMass":"Santa Lucía State","UConn":"Killeen State","Jacksonville State":"Santo Tomás State","Sam Houston":"Dumas","Louisiana Tech":"Linwood","Middle Tennessee":"Edna State","New Mexico State":"Gonzales Christian","UTEP":"Vernon","FIU":"Denton State","Kennesaw State":"Munday","Delaware":"Thomasville State","Missouri State":"Quanah Christian","Sacramento State":"Sweetwater Christian","North Dakota State":"Silsbee State","Montana State":"West Summit","South Dakota State":"Sandberg State","Montana":"Seguin","Villanova":"Dalhart State","UC Davis":"Hutto","Idaho":"Brady State","Southern Illinois":"Crestwood State","North Dakota":"Sinton State","South Dakota":"Shamrock","Illinois State":"Northern Summit","Northern Iowa":"Luling State","Youngstown State":"Westby State","Tarleton State":"Daingerfield","Abilene Christian":"San Jacinto State","Incarnate Word":"Perryton","Furman":"Santa Clara","Mercer":"Santa Teresa","Chattanooga":"Lufkin","Rhode Island":"East Tierra Alta State","New Hampshire":"Ashville","Richmond":"Silverton State","Lehigh":"Lindell College","Lafayette":"Mexia State","Holy Cross":"Saint Gresham","Harvard":"Southern Acadia State","Yale":"Lampasas State","Princeton":"Cotulla State","Penn":"Northern Magnolia","Dartmouth":"Wharton","Brown":"Foxwood State","Columbia":"South Granite","Cornell":"Chesterton College","William & Mary":"North Granite State","Elon":"San Rafael State","Towson":"Hondo State","Albany":"Vance College","Maine":"Smyrna State","Stony Brook":"Eastern Tierra Alta State","Monmouth":"Seymour State","Campbell":"Lockhart State","North Carolina A&T":"Central Coralina","Crestfield State":"Southern Granite","Hampton":"Crossroads State","Bryant":"Central Kaimana State","Weber State":"Kountze","Eastern Washington":"Abilene","Northern Arizona":"Seaford State","Idaho State":"Nora State","Portland State":"Northbrook","Northern Colorado":"Irondale","Cal Poly":"Saint Thornton","Southern Utah":"Madsen College","Utah Tech":"Lexington","Central Arkansas":"East Aurora","Austin Peay":"Dunlap State","Eastern Kentucky":"Radford College","North Alabama":"Orchard Hill","West Georgia":"Clarkston State","Lamar":"West Cascadia State","McNeese":"Saint Keswick","Nicholls":"Western Coralina","Northwestern State":"Oakwood","Southeastern Louisiana":"West Coralina","Stephen F. Austin":"Burlington State","Houston Christian":"Central Cascadia","East Texas A&M":"Harmon State","UTRGV":"Wadsworth College","Samford":"Eastern Wakota","Western Carolina":"South Llano Grande","ETSU":"Saint Loring","Wofford":"Laramie","The Citadel":"Western Tierra Alta","VMI":"Northern Cascadia State","Fordham":"Northern Granite","Colgate":"West Cumberland","Bucknell":"Dunmore College","Georgetown":"Ridgefield College","Murray State":"West Kaimana","Indiana State":"San Elizario State","Tennessee State":"Centerville State","Tennessee Tech":"Santa Cruz State","UT Martin":"North Magnolia State","Southeast Missouri State":"Shelton College","Eastern Illinois":"Pella State","Western Illinois":"Maplewood State","Lindenwood":"Winchester State","Gardner-Webb":"Southern Summit State","Charleston Southern":"Weston State","Jackson State":"Dunmore","Florida A&M":"Jensen State","Alabama State":"Zetland","Southern":"Schaller State","Prairie View A&M":"Central Cumberland","Grambling State":"Vinton","Alcorn State":"Harlan State","Alabama A&M":"South Wakota","Bethune-Cookman":"Laurelton State","Texas Southern":"Lohrville State","Arkansas-Pine Bluff":"Camden State","Mississippi Valley State":"Parkside","North Carolina Central":"Hartwell","South Carolina State":"Chester State","Howard":"North Cascadia","Morgan State":"Newburgh State","Delaware State":"Saint Harrington","Norfolk State":"East Granite","Duquesne":"East Cascadia","Central Connecticut":"Uniondale State","Saint Francis (PA)":"Cranston College","Robert Morris":"Emberly College","LIU":"Yoakum State","Wagner":"Forrest Hills State","Stonehill":"East Acadia","Mercyhurst":"Pinebrook State","New Haven":"Central Llano Grande","Merrimack":"East Magnolia State","Sacred Heart":"Fairview","St. Thomas (MN)":"Walton State","San Diego":"Yorktown State","Dayton":"Eastern Aurora","Drake":"Eastport State","Butler":"Hilldale State","Davidson":"North Wakota","Marist":"East Wakota","Morehead State":"Gilmer","Presbyterian":"Saint Lyndon","Stetson":"Viborg","Valparaiso":"San Lorenzo","Grand Valley State":"Osage State","Ferris State":"San Isidro","Harding":"Remsen State","Valdosta State":"Elmore State","Pittsburg State":"Vicksburg State","Northwest Missouri State":"Lakewood State","Colorado School of Mines":"Glendale State","Minnesota State":"Odebolt State","Slippery Rock":"Manson State","Kutztown":"Corwin College","West Florida":"Bayfield University","Central Missouri":"Middletown University","Lenoir-Rhyne":"Exeter","Ouachita Baptist":"Northdale University","Delta State":"Waverly State","Angelo State":"Easton College","Indiana (PA)":"Clearfield","Shepherd":"Northam College","Bemidji State":"Kirkland University","Augustana (SD)":"Central Wakota","Wingate":"Holstein State","Minnesota Duluth":"Newark State","Missouri Western":"Lenox State","Fort Hays State":"Newport","Washburn":"Quimby","Emporia State":"Marion State","Nebraska-Kearney":"Salem State","Central Oklahoma":"Midvale State","Missouri Southern":"Grandview State","Northeastern State":"Eastern Kaimana","Saginaw Valley State":"Moorefield State","Davenport":"Ida State","Michigan Tech":"Clinton State","Northern Michigan":"Brookhaven State","Wayne State (MI)":"Grantham College","Ashland":"Fenton State","Findlay":"Redding College","Hillsdale":"Millfield State","Tiffin":"Sutton State","Walsh":"Pembroke College","Ohio Dominican":"Brandt State","Thomas More":"Belmont","Kentucky Wesleyan":"Allendale State","Indianapolis":"Oakland","McKendree":"Hartley State","Missouri S&T":"San Felipe State","Quincy":"Arcadia","Truman State":"North Crestfield","William Jewell":"Cedarburg University","Wakota State":"Thorson University","Southwest Baptist":"Kingston State","Upper Iowa":"Gilmore","Winona State":"Oakley College","Concordia-St. Paul":"Colfax State","Mary":"Bellmont College","Sioux Falls":"Southern Coralina","MSU Moorhead":"Upton University","Southwest Minnesota State":"Jonesville State","Tierra Alta A&M":"Western Wakota","Northern State":"South Summit","Minot State":"Jewell State","Wayne State (NE)":"Verdigre State","CSU Pueblo":"Taylorsville State","Colorado Mesa":"San Marcos","Western Colorado":"San Ignacio University","Black Hills State":"West Acadia","Chadron State":"Norwood University","Adams State":"Halvorsen","Fort Lewis":"Kanawha State","New Mexico Highlands":"Kentwood State","Northern Wakota":"Quincyville State","South Dakota Mines":"Inglewood State","West Texas A&M":"Rolfe State","Texas A&M-Kingsville":"Ormsby College","Midwestern State":"San Pablo University","Eastern New Mexico":"San Cayetano State","Western New Mexico":"San Andrés State","UT Permian Basin":"Thor","Sul Ross State":"Vogel State","Central Washington":"Lindgren","West Crestfield":"Everly University","Western Oregon":"Oakfield State","Henderson State":"Riverside State","Arkansas Tech":"Oxford State","Southern Arkansas":"Nygaard State","Arkansas-Monticello":"Sunbury State","East Central":"Kimball University","Southeastern Oklahoma State":"Pilger","Southwestern Oklahoma State":"Harrington State","Northwestern Oklahoma State":"South Crestfield","Río Grande State":"Woden","Oklahoma Baptist":"Bancroft University","Southern Nazarene":"Mortenson","North Greenville":"Primghar State","West Alabama":"Ulrich State","Mississippi College":"Elkader State","Shorter":"Ivywood State","Carson-Newman":"Lund State","Catawba":"Decorah University","Mars Hill":"Emmet State","Newberry":"Tilden State","Tusculum":"Chesterton","UVA Wise":"Kensington College","Emory & Henry":"Bristol","Charleston (WV)":"Lockwood State","Concord":"Bramwell State","Fairmont State":"Ormsby","Frostburg State":"Norwood College","Glenville State":"Mercer Hill University","West Liberty":"Sutcliffe State","West Virginia State":"Lyndon State","West Virginia Wesleyan":"Mercer Hill State","Wheeling":"Southern Wakota","Bloomsburg":"Sheldon","PennWest California":"Larchmont State","East Stroudsburg":"Mayfield State","Gannon":"Redding State","Lock Haven":"West Magnolia","Millersville":"Dalton University","Seton Hill":"Northern Kaimana","Shippensburg":"Whitmore State","West Chester":"Delmar","American International":"Yardley State","Assumption":"North Llano Grande","Bentley":"Gresham University","Pace":"Osgood University","Saint Anselm":"Easton State","Southern Connecticut State":"Alderman State","Bowie State":"Calloway College","Elizabeth City State":"Larkspur State","Fayetteville State":"Fulton College","Johnson C. Smith":"Everett State","Lincoln (PA)":"Lindell University","Livingstone":"South Magnolia","Shaw":"Ridgefield University","Virginia State":"Oakley","Virginia Union":"Ravenscroft State","Winston-Salem State":"Shelton State","Albany State":"Larchmont","Allen":"Northam State","Benedict":"Ashbury University","Central State":"Hadley","Clark Atlanta":"Dorchester","Edward Waters":"Upton State","Fort Valley State":"Queensbury College","Kentucky State":"Ormsby State","Lane":"Wickham","Miles":"Ivydale State","Morehouse":"Oakley State","Savannah State":"Ashford University","Tuskegee":"Iverson","Lincoln (MO)":"Whitcomb College","Chowan":"Lyndon University","Mary Hardin-Baylor":"Merriweather","Mount Union":"Middletown College","Wisconsin-Whitewater":"Edna Wesleyan","North Central College":"Saint Wickham","Johns Hopkins":"Franklin Lutheran","Cortland":"Gresham College","Wartburg":"Saint Easton","Linfield":"Fielding","Wisconsin-La Crosse":"Whitcomb","Bethel MN":"Pinehurst College","Saint John's (MN)":"Cleveland Lutheran","Trinity (TX)":"Childress College","Hardin-Simmons":"Kirkland College","Delaware Valley":"Beeville Methodist","Wheaton IL":"Wexford College","Rowan":"Belton Methodist","Wisconsin-Oshkosh":"Jessop College","Wisconsin-Platteville":"Saint Ainsworth","Wisconsin-River Falls":"Edgewood College","Wisconsin-Stevens Point":"Gilchrist College","Wisconsin-Stout":"Abernathy College","Wisconsin-Eau Claire":"Chester College","John Carroll":"Saint Carrington","Baldwin Wallace":"Seymour Wesleyan","Capital":"Saint Merriweather","Heidelberg":"Saint Larkspur","Marietta":"Harrington College","Muskingum":"Nolan College","Ohio Northern":"Prentiss College","Otterbein":"Langford College","Wilmington (OH)":"Sheffield","Wabash":"Lyndon College","DePauw":"Garner Lutheran","Denison":"Dempsey","Wittenberg":"Quincy Lutheran","Kenyon":"Saint Pembroke","Oberlin":"Foxcroft College","Ohio Wesleyan":"Llano Lutheran","Hiram":"Caldwell College","Wooster":"Harrington","Allegheny":"Ranger Methodist","Augustana (IL)":"Hartwell College","Carthage":"Sinton College","Elmhurst":"Mexia Methodist","Illinois Wesleyan":"Borger College","Millikin":"Garrison College","North Park":"Saint Tillman","Washington U. (MO)":"Loring College","Carroll (WI)":"Talbot","Concordia-Moorhead":"Spearman Lutheran","Gustavus Adolphus":"Thornton College","Hamline":"Walton Wesleyan","St. Olaf":"Abernathy","Carleton":"Ballinger Lutheran","Augsburg":"Kilgore Methodist","Central (IA)":"Langford","Coe":"Yorkshire College","Dubuque":"Lockhart Lutheran","Loras":"Uvalde College","Luther":"Allendale Lutheran","Simpson":"Gatesville College","Buena Vista":"Alvin College","Nebraska Wesleyan":"Kimbrough College","Monmouth (IL)":"Liberty Lutheran","Ripon":"Saint Edgewood","Lawrence":"Bramwell College","Beloit":"Quanah College","Knox":"Saint Blakemore","Illinois College":"Merriweather College","Lake Forest":"Ozona Methodist","Cornell College":"Lamesa College","Grinnell":"Rockwell College","Crestfield Lutheran":"Osgood College","Macalester":"Saint Newbury","Chicago":"Sonora Methodist","Albion":"Underhill College","Alma":"Hensley College","Adrian":"Saint Ashbury","Hope":"Saint Mercer Hill","Kalamazoo":"Somerset College","Olivet":"Larkspur College","Trine":"Blakemore","Anderson (IN)":"Fielding College","Bluffton":"Prescott College","Ashwood College":"Kendrick","Defiance":"Vandermeer College","Franklin":"Ingram","Hanover":"Graham Methodist","Manchester":"Lampasas Wesleyan","Mount St. Joseph":"Canyon College","Rose-Hulman":"Saint Varnell","Bethany (WV)":"Saint Yardley","Carnegie Mellon":"Killeen Wesleyan","Case Western Reserve":"Marlowe College","Geneva":"Hawthorne College","Grove City":"Sweetwater College","Kendall College":"Kerrville Methodist","Saint Vincent":"Jasper College","Thiel":"Ashford College","Waynesburg":"Saint Dalton","Westminster PA":"Ivydale College","Washington & Jefferson":"Everett College","Albright":"Fairbanks College","King's (PA)":"Nash College","Lebanon Valley":"Saint Tanglewood","Lycoming":"Salado College","Misericordia":"Stinnett Lutheran","Stevenson":"Kingsbury College","Widener":"Brenham College","Wakota Lutheran":"Silsbee College","Wilkes":"Mayfield","Dickinson":"Hereford Lutheran","Franklin & Marshall":"Mason Wesleyan","Gettysburg":"Shelton","McDaniel":"Osage College","Moravian":"Truett College","Muhlenberg":"Tyler Wesleyan","Ursinus":"Brady Wesleyan","Hobart":"Lund College","Rochester":"Primghar Wesleyan","RPI":"Hico Methodist","Prairie Methodist":"Hadley College","St. Lawrence":"Varnell College","Union (NY)":"Tanglewood College","WPI":"Hondo Lutheran","Alfred":"Pelham College","Alfred State":"Santa Cruz Lutheran","Brockport":"Cotulla College","Buffalo State":"Chamberlain College","Ithaca":"Pella College","Morrisville State":"Electra Wesleyan","Utica":"Grandview Wesleyan","Kean":"Westcott College","Santa Elena College":"Upton College","Montclair State":"Laurelton College","Salisbury":"Weston","TCNJ":"Stephenville College","William Paterson":"Saint Pritchard","Christopher Newport":"Benton Methodist","Coast Guard":"Coleman Methodist","Merchant Marine":"Saint Hillsdale","MIT":"Ravenscroft College","Norwich":"San Rafael College","Springfield":"Nolan","Amherst":"Rolfe College","Bates":"Beckett College","Bowdoin":"Dalhart Lutheran","Colby":"Brookhaven Lutheran","Hamilton":"Cuero College","Middlebury":"Cisco Methodist","Trinity (CT)":"Crestwood Lutheran","Tufts":"Decorah Lutheran","Wesleyan":"Hawthorne","Williams":"Overton College","Bridgewater State":"Rutherford College","Fitchburg State":"Pampa College","Framingham State":"Lenox Methodist","Plymouth State":"Saint Ainsley","UMass Dartmouth":"Milford College","Westfield State":"Yoakum Lutheran","Worcester State":"Dunlap College","Massachusetts Maritime":"Colfax College","Endicott":"Maplewood Methodist","Western New England":"Schaller Methodist","Nichols":"Dorchester College","Curry":"Comanche College","Salve Regina":"Luling Methodist","Husson":"San Cayetano College","Maine Maritime":"Saint Somerset","Gallaudet":"Albany Methodist","Bridgewater (VA)":"Taylorsville College","Ferrum":"San Elizario Methodist","Guilford":"Overton","Hampden-Sydney":"Talbot College","Randolph-Macon":"Georgetown Lutheran","Shenandoah":"Katy Lutheran","Washington & Lee":"San Felipe Lutheran","Averett":"Everly College","Belhaven":"Carrington College","Brevard":"Saint Nash","Greensboro":"Winchester College","Huntingdon":"Whitmore College","LaGrange":"Temple Methodist","Maryville (TN)":"Tilden Lutheran","Methodist":"Glendale Methodist","North Carolina Wesleyan":"Kirkland","Berry":"San Benito Methodist","Centre":"Taylor Lutheran","Hendrix":"Thorson Lutheran","Millsaps":"Saint Chamberlain","Rhodes":"Gonzales Lutheran","Sewanee":"Quincyville Lutheran","Howard Payne":"Saint Wadsworth","East Texas Baptist":"Newbury","McMurry":"Truman Methodist","Southwestern (TX)":"Bramwell","Texas Lutheran":"Thomasville College","Austin College":"Dalton College","Whitworth":"Saint Gilchrist","Pacific Lutheran":"San Pablo College","Puget Sound":"Fairbanks","Willamette":"Elmdale Wesleyan","Lewis & Clark":"Tillman College","George Fox":"Rollins College","Pacific (OR)":"Tolliver College","Chapman":"Newark Methodist","Redlands":"Sutcliffe College","Cal Lutheran":"Holstein Wesleyan","La Verne":"Akron Lutheran","Pomona-Pitzer":"Brandt Wesleyan","Claremont-Mudd-Scripps":"Hallettsville Wesleyan","Greenville":"Dalton","Northwestern (MN)":"Ashford","Martin Luther":"Keswick","Crown":"Riverside College","Minnesota Morris":"Salem College","Eureka":"Santo Tomás College","Wisconsin Lutheran":"Osgood","Concordia Chicago":"Jensen Lutheran","Concordia Wisconsin":"San Andrés Wesleyan","Benedictine (IL)":"Inglewood Wesleyan","Aurora":"Oakfield College","Morningside":"Dover Christian","Grand View":"Harmon Wesleyan","Northwestern IA":"Santa Lucía Wesleyan","Keiser":"Sunbury Wesleyan","Lindsey Wilson":"Oxford Christian","Marian IN":"Santa Inés Baptist","Benedictine KS":"Forrest Hills Christian","Kansas Wesleyan":"San Ignacio Wesleyan","Reinhardt":"Kingston Christian","Georgetown KY":"Seaford Christian","Bethel TN":"Pinebrook Baptist","Southern Oregon":"Eastport Wesleyan","College of Idaho":"Northdale Baptist","Carroll MT":"Nygaard Christian","Montana Tech":"Odebolt Christian","Dordt":"Hartley Wesleyan","Saint Francis IN":"Vogel Christian","Campbellsville":"Verdigre Wesleyan","Missouri Valley":"Sutton Wesleyan","Indiana Wesleyan":"Marion Wesleyan","Baker":"Westby Baptist","Central Methodist":"Norwood Wesleyan","Evangel":"Greenville Christian","Graceland":"Santa Elena Baptist","MidAmerica Nazarene":"Ivywood Baptist","Peru State":"Mayfield College","William Penn":"Yorktown Christian","Crestfield Christian":"Cedarburg Wesleyan","Culver-Stockton":"Kendrick College","Bethany (KS)":"San Miguel Baptist","Bethel (KS)":"San Jacinto Baptist","Avila":"Kentwood Christian","Wakota Wesleyan":"Silverton Baptist","Friends":"Clarkston Nazarene","McPherson":"Jonesville Christian","Ottawa (KS)":"Jewell Baptist","Southwestern (KS)":"Kimball Baptist","Sterling":"Fenton Christian","San Isidro University":"Upton Baptist","Tabor":"Quinlan College","Eastern Oregon":"Westfield Wesleyan","Montana Western":"Moorefield Wesleyan","Montana State-Northern":"Yardley College","Mesa Verde Baptist":"Kanawha Christian","Rocky Mountain":"Millfield Wesleyan","Concordia (NE)":"Bancroft Wesleyan","Doane":"Fairfield Nazarene","Hastings":"Foxwood Baptist","Cedar Bluff College":"Glenwood College","Midland":"Denton Baptist","Briar Cliff":"Lohrville Baptist","Dakota Wesleyan":"Uniondale Wesleyan","Mount Marty":"Centerville Wesleyan","Taylor":"Remsen Christian","Lawrence Tech":"Kendall Wesleyan","Siena Heights":"Emmet Wesleyan","Olivet Nazarene":"Crossroads Christian","Saint Xavier":"Hilldale Christian","Madonna":"Clinton Christian","Cumberland":"Elmore Wesleyan","Cumberlands":"Bayfield Christian","Kentucky Christian":"Midvale Wesleyan","Pikeville":"Elkader Baptist","Union (KY)":"Ida Wesleyan","Langston":"Manson Baptist","Texas Wesleyan":"Mercer Hill College","Wayland Baptist":"Newburgh Wesleyan","Ottawa (AZ)":"Nora Baptist","Arizona Christian":"Vicksburg Wesleyan","Texas College":"Fairhaven Wesleyan","SAGU":"Camden Wesleyan","Louisiana Christian":"Waverly Christian","Lyon":"Sandberg Wesleyan","Oklahoma Panhandle State":"Smyrna Nazarene","Ave Maria":"Lakewood Christian","Warner":"Burlington Wesleyan","Webber International":"Ulrich Christian","Southeastern (FL)":"Ingram Wesleyan","Point":"Harlan Baptist","Faulkner":"Pruitt Christian","Valley City State":"Fielding Christian","Mayville State":"Ulysses Christian","Jamestown":"Tanglewood Christian","Dickinson State":"Rollins Christian","Dakota State":"Pembroke Wesleyan","Waldorf":"Fairhaven College","Saint Mary (KS)":"Newbury Wesleyan","Iowa Western CC":"Crestwood CC","Hutchinson CC":"Fayette County CC","Butler CC":"Jim Hogg County CC","Garden City CC":"Lampasas CC","Dodge City CC":"Bandera County CC","Coffeyville CC":"Granite Valley CC","Independence CC":"Lavaca County CC","Fort Scott CC":"Nueces County CC","Highland CC":"Hidalgo County CC","East Mississippi CC":"Sonora Community College","Jones College":"Coke County CC","NW Mississippi CC":"Mexia Junior College","Hinds CC":"Presidio County CC","Itawamba CC":"Burnet County CC","Mississippi Gulf Coast CC":"Schleicher County CC","Copiah-Lincoln CC":"Llano County CC","Pearl River CC":"Starr County CC","Coahoma CC":"Gillespie County CC","Holmes CC":"Uvalde County CC","Southwest Mississippi CC":"Forrest Hills CC","East Central CC":"Sutton County CC","Northeast Mississippi CC":"Hondo CC","Mississippi Delta CC":"Kaimana Valley CC","Navarro College":"Ozona Junior College","Kilgore College":"Pella CC","Blinn College":"Stephenville CC","Trinity Valley CC":"Brazos County CC","Tyler JC":"Alvin CC","Cisco College":"Sterling County CC","Arizona Western":"Victoria County CC","Snow College":"Lampasas County CC","NEO A&M":"Quanah CC","Ellsworth CC":"San Andrés CC","Georgia Military College":"Val Verde County CC","Crestfield CC":"Coleman CC","Lackawanna College":"Belton CC","ASA Miami":"Holstein CC","Nassau CC":"Kinney County CC","Hudson Valley CC":"Kimble County CC","Ashwood County CC":"Salado Junior College","Monroe College":"Crestfield Valley CC","Erie CC":"Comal County CC","NDSCS":"Young County CC","Rochester CC&TC":"Medina County CC","Itasca CC":"Glendale CC","Wakota Valley CC":"Childress CC","Vermilion CC":"Aurora Valley CC","Central Lakes College":"San Patricio County CC","Minnesota West":"Luling CC","Minnesota State CTC":"Irion County CC","Tierra Alta CC":"Spearman CC","Riverland CC":"Callahan County CC","City College of San Francisco":"Bexar Norte County CC","Saddleback College":"Frio County CC","Riverside City College":"Real County CC","Río Grande Valley CC":"Comanche CC","Mt. San Antonio College":"Blanco County CC","Fullerton College":"Mason CC","Palomar College":"Maverick County CC","Bakersfield College":"Pecos County CC","Long Beach City College":"Mills County CC","El Camino College":"Edna CC","Fresno City College":"Jasper CC","Sierra College":"Goliad County CC","American River College":"Lakewood CC","Laney College":"Colfax CC","Mesa del Sol CC":"San Jacinto CC","College of San Mateo":"Runnels County CC","Butte College":"Katy Junior College","Chabot College":"Kerrville CC","Diablo Valley College":"Ida Junior College","Modesto JC":"Dalhart CC","Feather River College":"Brady CC","Shasta College":"Hallettsville CC","Santa Rosa JC":"Reeves County CC","Hartnell College":"Stinnett CC","West Hills Coalinga":"Harmon CC","Reedley College":"Travis Norte County CC","Ventura College":"Seymour CC","Pasadena City College":"Caddo County CC","LA Harbor College":"Gonzales County CC","LA Pierce College":"Cleveland CC","LA Valley College":"Atascosa County CC","Antelope Valley College":"Dimmit County CC","Citrus College":"Canyon CC","Chaffey College":"Hereford CC","Victor Valley College":"Wakota Valley CC","San Bernardino Valley College":"Brenham CC","Mt. San Jacinto College":"Marion CC","Southwestern College":"Killeen CC","Grossmont College":"Webb County CC","San Diego Mesa College":"Crossroads Junior College","Santa Barbara City College":"Hico CC","Allan Hancock College":"Magnolia Valley CC","Santa Monica College":"Ranger CC","Compton College":"Sunbury CC","Cerritos College":"Pampa Community College","East LA College":"Santa Cruz CC","Glendale CC (CA)":"Ballinger CC","Orange Coast College":"Zavala County CC","College of the Canyons":"Cedarburg CC","San Joaquin Delta College":"Uvalde CC","Merced College":"Tom Green County CC","Contra Costa College":"Gatesville Junior College","Gavilan College":"Edwards County CC","Mendocino College":"Inglewood Junior College","College of the Siskiyous":"Wilson County CC","Yuba College":"McMullen County CC","Lassen College":"Karnes County CC"};
// v2.14: pro leagues, teams and awards are fictional now; older saves carry the old names in their alumni stories
const PRO_MIGRATE={"Arizona Cardinals": "Crestfield Comets", "Atlanta Falcons": "Bayport Admirals", "Baltimore Ravens": "Iron City Forge", "Buffalo Bills": "Lakeshore Storm", "Carolina Panthers": "Summit Avalanche", "Chicago Bears": "Granite Quarrymen", "Cincinnati Bengals": "Cascadia Timberwolves", "Cleveland Browns": "Aurora Huskies", "Dallas Cowboys": "Kaimana Surf", "Denver Broncos": "Coralina Barracudas", "Detroit Lions": "Magnolia Monarchs", "Green Bay Packers": "Acadia Bayou Kings", "Houston Texans": "Cumberland Miners", "Indianapolis Colts": "Llano Grande Stampede", "Jacksonville Jaguars": "Tierra Alta Scorpions", "Kansas City Chiefs": "Wakota Twisters", "Las Vegas Raiders": "Capital City Senators", "Los Angeles Chargers": "Riverton Rapids", "Los Angeles Rams": "Silver Lake Sentinels", "Miami Dolphins": "Mesa Rattlers", "Minnesota Vikings": "Harbor City Anchors", "New England Patriots": "Pine Valley Lumberjacks", "New Orleans Saints": "Red Rock Outlaws", "New York Giants": "Gulf Coast Tarpons", "New York Jets": "Prairie Stallions", "Philadelphia Eagles": "Midland Mustangs", "Pittsburgh Steelers": "Steel Valley Ironmen", "San Francisco 49ers": "Desert Sidewinders", "Seattle Seahawks": "Highland Pioneers", "Tampa Bay Buccaneers": "Bluewater Navigators", "Tennessee Titans": "Twin Rivers Kingfishers", "Washington Commanders": "Northgate Knights", "Arlington Renegades": "Bayport Blaze", "DC Defenders": "Riverton Rivermen", "Houston Roughnecks": "Capital City Guardians", "Memphis Showboats": "Pine Valley Grizzlies", "Michigan Panthers": "Harbor City Hammers", "San Antonio Brahmas": "Silver Lake Saber-tooths", "Birmingham Stallions": "Red Rock Wranglers", "St. Louis Battlehawks": "Northgate Nighthawks", "BC Lions": "Westshore Orcas", "Calgary Stampeders": "Foothill Stallions", "Edmonton Elks": "Plains Harvesters", "Saskatchewan Roughriders": "Lakehead Voyageurs", "Winnipeg Blue Bombers": "Bay of Pines Loons", "Hamilton Tiger-Cats": "Riverside Steelmen", "Toronto Argonauts": "Lakeport Lancers", "Ottawa Redblacks": "Capital Rideau Rangers", "Montreal Alouettes": "Old Port Royals"},PRO_TXT=[["NFL", "NGL"], ["UFL", "SFL"], ["CFL", "MGL"], ["Super Bowl", "Gridiron Bowl"], ["Pro Bowl", "Pro All-Star"], ["All-Pro", "All-League"], ["Grey Cup", "Maple Cup"], ["Heisman Trophy", "Golden Helmet Trophy"], ["Pro Football Hall of Fame", "Gridiron Hall of Fame"], ["Canton", "the Gridiron Hall of Fame"], ["Biletnikoff Award", "Golden Hands Award"], ["Doak Walker Award", "Feature Back Award"], ["Butkus Award", "Linebacker of the Year Award"], ["Thorpe Award", "Defensive Back of the Year Award"], ["Outland Trophy", "Trench Trophy"], ["Lombardi Award", "Lineman of the Year Award"], ["Nagurski Trophy", "Defender of the Year Trophy"], ["Maxwell Award", "Player of the Year Award"], ["Bednarik Award", "Iron Wall Award"], ["Manning Award", "Field General Award"], ["O'Brien Award", "Gunslinger Award"], ["Mackey Award", "Tight End of the Year Award"], ["Groza Award", "Kicker of the Year Award"], ["Rimington", "Center of the Year"], ["Senior Bowl", "Senior Classic"], ["Shrine Bowl", "Coast-to-Coast Bowl"]];
function proMigrate(){
  if(G.proV>=1)return;const fix=t=>{if(typeof t!=='string')return t;for(const k in PRO_MIGRATE)if(t.includes(k))t=t.split(k).join(PRO_MIGRATE[k]);for(const[a,b]of PRO_TXT)if(t.includes(a))t=t.split(a).join(b);return t;};
  const st=[G.ai&&G.ai.alumni].filter(Boolean);
  while(st.length){const o=st.pop();if(!o||typeof o!=='object')continue;
    if(Array.isArray(o)){for(let i=0;i<o.length;i++){if(typeof o[i]==='string')o[i]=fix(o[i]);else if(o[i]&&typeof o[i]==='object')st.push(o[i]);}continue;}
    for(const k in o){const v=o[k];if(typeof v==='string')o[k]=fix(v);else if(v&&typeof v==='object')st.push(v);}}
  for(const p of[...(G.players||[]),...(G.hofArchive||[]),...(G.wlArchive||[])]){p.story=null;p._cf=undefined;}
  G.draftTeamRegistry={};G.proV=1;
}
// v2.07: older saves still name real colleges; every school reference moves to its fictional counterpart once
function colMigrate(){
  if(G.colV>=2)return;const R=COL_RENAME,CONF={SEC:'Southern Athletic','Big Ten':'Great Lakes','Big 12':'Plains Twelve',ACC:'Atlantic Coast League'};
  const st=[G];
  while(st.length){const o=st.pop();if(!o||typeof o!=='object')continue;
    if(Array.isArray(o)){for(const v of o)if(v&&typeof v==='object')st.push(v);continue;}
    for(const k of['school','host'])if(typeof o[k]==='string'&&R[o[k]]){const old=o[k];o[k]=R[old];if(k==='host'&&typeof o.name==='string'&&o.name.startsWith(old+' '))o.name=R[old]+o.name.slice(old.length);}
    if(typeof o.conf==='string'&&CONF[o.conf])o.conf=CONF[o.conf];
    for(const k in o){const v=o[k];if(v&&typeof v==='object')st.push(v);}}
  if(G.colCls&&typeof G.colCls==='object')for(const y in G.colCls){const Y=G.colCls[y],N={};for(const k in Y){const i=k.lastIndexOf('|'),s=k.slice(0,i);N[(R[s]||s)+k.slice(i)]=Y[k];}G.colCls[y]=N;}
  for(const p of[...G.players,...(G.hofArchive||[]),...(G.wlArchive||[])]){p.story=null;p._cf=undefined;}
  G.colV=2;
}
function colMigrate3(){
  if(G.colV>=3)return;const LV=new Set(['FBS','FCS','D2','D3','NAIA','JUCO']),st=[G],seen=new Set();
  while(st.length){const o=st.pop();if(!o||typeof o!=='object'||seen.has(o))continue;seen.add(o);
    if(Array.isArray(o)){for(const v of o)if(v&&typeof v==='object')st.push(v);continue;}
    if(typeof o.school==='string'&&LV.has(o.lvl))o.school=colRemapName(o.school,o.lvl);
    for(const k in o){const v=o[k];if(v&&typeof v==='object')st.push(v);}}
  for(const p of G.players){if(!Array.isArray(p.offers))continue;const u=new Set();p.offers=p.offers.filter(o=>{const k=o.school+'|'+o.lvl;if(u.has(k))return false;u.add(k);return true;});}
  if(G.colSigned&&G.colSigned.by)for(const k in G.colSigned.by)if(!COL_BY[k])delete G.colSigned.by[k];
  if(G.ncamp&&Array.isArray(G.ncamp.list))G.ncamp.list=G.ncamp.list.filter(C=>COL_BY[C.host+'|'+C.lvl]);
  G.colCls={};G.colRep=null;G._cm=null;
  for(const p of G.players){if(p.grad||!p.sId||p.yr<10||p.yr>12)continue;const cy=colClassYr(p);
    for(const o of p.offers||[]){const c=COL_BY[o.school+'|'+o.lvl];if(c){const S=colCls(c,cy);S.off[p.pos]=(S.off[p.pos]||0)+1;}}
    if(p.committed){const c=COL_BY[p.committed.school+'|'+p.committed.lvl];if(c){const S=colCls(c,cy);S.com[p.pos]=(S.com[p.pos]||0)+1;}}}
  G.colV=3;
}
function colClassYr(p){return(G.yr||1)+(12-clamp(p.yr||12,9,12));}
let _colPruned=null,_colPrunedYr=0;
function colCls(c,cy){
  if(!G.colCls||typeof G.colCls!=='object')G.colCls={};
  if(_colPruned!==G.colCls||_colPrunedYr!==G.yr){for(const y in G.colCls)if(+y<(G.yr||1)-1)delete G.colCls[y];_colPruned=G.colCls;_colPrunedYr=G.yr;}
  const Y=G.colCls[cy]||(G.colCls[cy]={}),k=c._k||(c._k=c.school+'|'+c.lvl);let o=Y[k];
  if(!o){const r=_colRand(k+'#'+cy),cap=colClsSize(c,r()),need={};let sum=0;const W=Object.values(POS_NEED_W).reduce((a,b)=>a+b,0);
    for(const pos in POS_NEED_W){need[pos]=Math.max(1,Math.round(cap*POS_NEED_W[pos]/W*(0.7+r()*0.6)));sum+=need[pos];}
    // trim / pad the big position groups so the class adds up to the cap
    const order=['OL','DL','WR','LB','CB','S','RB','TE','QB'];let i=0;while(sum!==cap&&i<400){const pos=order[i%order.length];if(sum>cap&&need[pos]>1){need[pos]--;sum--;}else if(sum<cap){need[pos]++;sum++;}i++;}
    o=Y[k]={cap,need,com:{},off:{}};}
  if(o.hs==null||o.hs!==o.cap)o.hs=o.cap;
  return o;}
// v2.12: realistic recruiting classes (high school signees per year), bigger at the stronger programs of each level
const COL_CLS_RNG={FBS:[20,26],FCS:[18,24],D2:[18,26],D3:[20,36],NAIA:[16,30],JUCO:[20,36]};
function colClsSize(c,r){const q=COL_CLS_RNG[c.lvl]||[18,26],pr=COL_PR_RNG[c.lvl]||[0,100],pn=clamp((c.pr-pr[0])/Math.max(1,pr[1]-pr[0]),0,1);return Math.round(q[0]+(q[1]-q[0])*(0.5*r+0.5*pn));}
// v2.11: only some of each class comes straight from high school. About 15-20% of seniors play college football;
// the rest of a 30-85 man class is transfers, junior-college players and walk-ons from outside the game.
const COL_HS_Q={FBS:[14,26],FCS:[2,6],D2:[2,7],D3:[2,7],NAIA:[2,7],JUCO:[5,12]},COL_PR_RNG={FBS:[56,99],FCS:[30,55],D2:[18,38],D3:[5,24],NAIA:[12,29],JUCO:[3,20]};
function colHsQuota(c,cy){const q=COL_HS_Q[c.lvl]||[3,6],pr=COL_PR_RNG[c.lvl]||[0,100],r=_colRand((c._k||c.school+'|'+c.lvl)+'#hs'+cy)();
  const pn=clamp((c.pr-pr[0])/Math.max(1,pr[1]-pr[0]),0,1);return Math.round(q[0]+(q[1]-q[0])*(0.55*r+0.45*pn));}
function colHsLeft(o){let n=0;for(const k in o.com)n+=o.com[k]||0;return Math.max(0,(o.hs||0)-n);}
function colOffTot(o){let n=0;for(const k in o.off)n+=o.off[k]||0;return n;}
function colRoom(c,p,forOffer){if(!c||!p)return true;const o=colCls(c,colClassYr(p)),n=o.need[p.pos]||1,cm=o.com[p.pos]||0;if(colHsLeft(o)<=0)return false;return forOffer?(cm<n&&(o.off[p.pos]||0)<Math.min(n*3,o.hs*2)&&colOffTot(o)<o.hs*4):cm<n;}
function colTakeCommit(p,o){G._cmv=(G._cmv||0)+1;try{const c=COL_BY[o.school+'|'+o.lvl];if(!c)return;const S=colCls(c,colClassYr(p));S.com[p.pos]=(S.com[p.pos]||0)+1;}catch(e){}}
function colOpenOffers(p){return(p.offers||[]).filter(o=>{const c=COL_BY[o.school+'|'+o.lvl];return!c||colRoom(c,p,false);});}
function colPr(o){if(!o)return 0;if(o.pr!=null)return o.pr;const c=COL_BY[o.school+'|'+o.lvl];return c?c.pr:({FBS:70,FCS:45,D2:30,NAIA:24,D3:15,JUCO:10}[o.lvl]||10);}
const IDEAL_SIZE={QB:[75,215],RB:[70,205],WR:[73,190],TE:[76,245],OL:[76,295],DL:[75,275],LB:[73,230],CB:[71,185],S:[72,200],K:[71,185]};
// v1.94: how much each inch / each 10 lb above (u) or below (d) the ideal is worth, per position.
// QBs and corners want height, linemen want mass, backs want a compact frame (too tall or too light hurts), kickers ignore size.
const SIZE_PROF={QB:{hu:.45,hd:.5,wu:.04,wd:.12,hc:1.4},RB:{hu:-.18,hd:.12,wu:.22,wd:.35,hc:.4},WR:{hu:.38,hd:.28,wu:.06,wd:.14,hc:1.3},TE:{hu:.32,hd:.45,wu:.18,wd:.3,hc:1.1},
  OL:{hu:.18,hd:.35,wu:.24,wd:.5,hc:.8},DL:{hu:.24,hd:.35,wu:.2,wd:.42,hc:.9},LB:{hu:.2,hd:.32,wu:.18,wd:.36,hc:.7},CB:{hu:.35,hd:.38,wu:-.12,wd:.16,hc:1.2},S:{hu:.24,hd:.3,wu:.08,wd:.22,hc:.9},K:{hu:0,hd:0,wu:0,wd:0,hc:0}};
// v2.06: measured on the projected senior frame against a college-ready high school senior (old scale: generated average + the same margins)
const IDEAL_HS={QB:[73.5,185],RB:[69.5,175],WR:[72.5,172],TE:[74,215],OL:[73.5,265],DL:[73,242],LB:[71.5,195],CB:[71,168],S:[72,180],K:[70.5,171]};
function sizeFit(p){const I=IDEAL_HS[p.pos],S=SIZE_PROF[p.pos];if(!I||!S||!p.ht)return 0;const y=clamp(p.yr||12,8,12),ph=p.ht-HS_H_OFF[y],pw=(p.wt||I[1])/(1+HS_W_OFF[y]);const dh=ph-I[0],dw=(pw-I[1])/10;
  const h=dh>=0?Math.min(dh*S.hu,S.hc):dh*S.hd,w=dw>=0?Math.min(dw*S.wu,1):dw*S.wd;
  return clamp(h+w,-2,2);}
function clsExpo(p){const s=getS(p.sId);if(!s)return 0;return({'1A':-6,'2A':-3,'3A':0,'4A':3,'5A':6}[clsEq(s.cls)]||0)-(XCLS[s.cls]?1:0);}
function progStars(p){const s=getS(p.sId);if(!s)return 1;return s.id===G.myId?(G.prestige||1):(s.prestige||1);}
function recStat(p){if(p.pos==='OL'||p.pos==='K')return 0;const gp=(p.seasStats&&p.seasStats.gp)||0;if(gp<1)return 0;return clamp((clamp(calcSSBase(p),0,120)-45)*0.06,-2,3)*Math.min(1,gp/4);}
function recScore(p){return recBase(p)+recStat(p)+(p.campStarB||0);}
function starTarget(p){const sc=recScore(p),T=starThr(p.yr);let t=0;for(let s=5;s>=1;s--)if(sc>=T[s]){t=s;break;}return Math.min(t,p.pos==='K'?3:5);}
function natTarget(p){if(p.grad||!p.yr||p.yr<9)return 0;const sc=recScore(p),N=natThr(Math.min(12,p.yr));let t=0;for(let s=5;s>=2;s--)if(sc>=N[s]){t=s;break;}return Math.min(t,p.pos==='K'?3:5);}
// set both scales straight away (new players, a new career, an old save)
function starsInit(p){p.sg=starTarget(p);p.stars=natTarget(p);}
// kept for older callers
function getStarCap(p){return p.pos==='K'?3:5;}
function getStarThreshold(dev,pos,yr){const T=starThr(yr||12);return{1:+T[1].toFixed(1),2:+T[2].toFixed(1),3:+T[3].toFixed(1),4:+T[4].toFixed(1),5:+T[5].toFixed(1)};}
function starStep(p,pops,force){
  // scouts' grade (drives recruiting)
  {const t=starTarget(p),g=p.sg||0;let n=g;
    if(t>g){if(force||Math.random()<0.55)n=g+(t-g>=2&&Math.random()<0.35?2:1);}else if(t<g&&(force||Math.random()<0.3))n=g-1;
    p.sg=clamp(n,0,getStarCap(p));}
  // national star rating (what everyone sees)
  const t=natTarget(p),prev=p.stars||0;
  if(t>prev){const gap=t-prev;if(force||Math.random()<0.55)p.stars=Math.max(prev+(gap>=2&&Math.random()<0.35?2:1),prev===0?Math.min(2,t):0);}
  else if(t<prev&&(force||Math.random()<0.3))p.stars=t<2&&prev<=2?0:prev-1;
  p.stars=clamp(p.stars||0,0,getStarCap(p));if(p.stars===1)p.stars=0;
  if(p.stars>prev&&p.sId===G.myId&&pops){
    pops.push(bEvPop(p.stars-prev>1?` Star surge! +${p.stars-prev} Stars!`:` ${p.fn} ${p.ln} Gained a Star!`,`Now ${stars(p.stars)}, ${p.pos}, ${p.rat} OVR, ${p.dev} dev.`,face(p.fs,48),'var(--gd)'));
    addNews('stargain',` ${p.fn} ${p.ln} Now ${p.stars}★`,`${p.pos} rising. OVR ${p.rat}, ${p.dev} dev.`);}
}
function checkStarsOffers(p,pops,isAI=false){
  starStep(p,pops,false);
  if(p.committed)return;
  if(p.yr>=11||(p.yr===10&&(p.sg||0)>=4))genOffers(p,isAI&&Math.random()<0.12,pops);
  try{smallOffers(p,pops);}catch(e){console.error('smallOffers',e);}
  if(p.id===G.myPlayerId)try{pcOfferSpread(p,pops);}catch(e){console.error('pcOfferSpread',e);}
}
// Player Career: like a real recruit, your player hears from more than one rung of the ladder and more than one state:
// a reach offer one level up now and then, schools a level or two down that would love to have him, and staffs from other states
function pcOfferSpread(p,pops){
  if(p.committed||p.yr<10||(p.yr===10&&(p.sg||0)<3))return;p.offers=p.offers||[];_colStReady();
  const gp=(p.seasStats&&p.seasStats.gp)||0,cg=(p.carStats&&p.carStats.gp)||0;if(gp<1&&cg<3&&p.pos!=='OL'&&p.pos!=='K')return;
  const L=recLevel(p);if(L<-5&&!((p.gpa||0)>=3.3||recCrazy(p)))return;
  const st=plSt(p),O=p.offers,jr=p.yr===12?1:p.yr===11?0.75:0.45,sg=p.sg||0,have=new Set(O.map(o=>o.school+'|'+o.lvl));
  const ok=c=>c&&!have.has(c.school+'|'+c.lvl)&&colRoom(c,p,true)&&(!c.acad||(p.gpa||0)>=c.acad)&&!((p.gpa||0)<2.0&&c.lvl==='FBS');
  const pickIn=(lo,hi,f)=>{const A=colRange(lo,hi).filter(c=>ok(c)&&(!f||f(c)));return A.length?A[Math.floor(Math.random()*A.length)]:null;};
  const Lc=Math.max(2,L),nUp=O.filter(o=>colPr(o)>Lc+9).length,nDn=O.filter(o=>colPr(o)<Lc-12).length,nOut=O.filter(o=>{const c=COL_BY[o.school+'|'+o.lvl];return c&&c.st!==st;}).length;
  // reach: rare, and the bigger the jump the rarer (a 2-star sees an FBS offer or two at most)
  if(nUp<2&&Math.random()<0.03*jr){const c=pickIn(Lc+8,Lc+16);if(c)addOffer(p,c,pops,'reach offer');}
  // a level or two down: steady interest from schools where he would start early (blue-chip recruits rarely hear from them)
  if(nDn<4&&Math.random()<(sg>=4?0.02:sg>=3?0.08:0.14)*jr){const c=pickIn(Math.max(0,Lc-32),Lc-13);if(c)addOffer(p,c,pops,'');}
  // out of state: staffs from other states recruit him at his level
  if(st&&O.length>=2&&nOut<O.length*0.45&&Math.random()<0.15*jr){const c=pickIn(Lc-9,Lc+7,x=>x.st!==st);if(c)addOffer(p,c,pops,'out-of-state staff');}
}
// where a player sits on the college ladder (0 = D3 bottom, 100 = blue blood)
function recLevel(p){const T=starThr(p.yr),sc=recScore(p);
  // 5★ ~ blue bloods (95), 4★ ~ power programs (80), 3★ ~ G5 (62), 2★ ~ FCS (48), 1★ ~ D2 (32), below that D2/D3 depth
  const knots=[[T[5],95],[T[4],80],[T[3],62],[T[2],48],[T[1],32],[T[1]-3,16],[T[1]-6,0]];
  if(sc>=knots[0][0])return Math.min(100,95+(sc-knots[0][0])*1.5);
  for(let i=1;i<knots.length;i++){const[a,va]=knots[i-1],[b,vb]=knots[i];if(sc>=b)return vb+(sc-b)/Math.max(0.01,a-b)*(va-vb);}
  return-10;}
function recCrazy(p){const gp=(p.seasStats&&p.seasStats.gp)||0;return p.pos!=='OL'&&p.pos!=='K'&&gp>=3&&calcSSBase(p)>=80;}
// ── small-college recruiting (v1.94): D2, D3 and NAIA staffs (and JUCO coaches) recruit on film and character –
// production against the player's position group, work traits and a solid rating; size and stars matter little
function prodVal(p){if(p.pos==='K')return p.rat;if(p.pos==='OL')return calcSS(p);const gp=(p.seasStats&&p.seasStats.gp)||0,cg=(p.carStats&&p.carStats.gp)||0;
  if(gp>=2)return calcSS(p);if(cg>=3)return calcSS(p,p.carStats)*0.92;return null;}
function prodPct(p){
  const key=G.yr+'|'+(G.week||0)+'|'+(G.phase||'')+'|'+G.players.length;
  if(!G._pp||G._pp.key!==key){const by={};for(const q of G.players){if(q.grad||!q.sId||q.yr<9||q.yr>12)continue;const v=prodVal(q);if(v==null)continue;(by[q.pos]=by[q.pos]||[]).push(v);}
    for(const k in by)by[k].sort((a,b)=>a-b);Object.defineProperty(G,'_pp',{value:{key,by},writable:true,configurable:true,enumerable:false});}
  const A=G._pp.by[p.pos],v=prodVal(p);if(v==null)return 0;if(!A||!A.length)return 0.5;
  let lo=0,hi=A.length;while(lo<hi){const m=(lo+hi)>>1;if(A[m]<v)lo=m+1;else hi=m;}return lo/A.length;}
const SMALL_TR={leader:3,workhorse:3,competitor:3,coachable:3,clutch:2,'gym-rat':2,'film-junkie':2,natural:2,'big-game':2,academic:2,humble:1,lazy:-5,hothead:-4,showboat:-1,'injury-prone':-3};
function smallScore(p){const tr=(p.traits||[]).reduce((a,t)=>a+(SMALL_TR[t]||0),0),dv={'Elite Dev':4,'Star':3,'Impact':2,'Normal':0}[p.dev]||0;
  return prodPct(p)*45+clamp((p.rat-35)/50,0,1)*25+tr+dv+sizeFit(p)*1.2+(p.sg||0)*1.5;}
const SMALL_LV={D2:{thr:55,k:0.006,cap:0.18,max:6},D3:{thr:49,k:0.007,cap:0.2,max:6},NAIA:{thr:52,k:0.006,cap:0.16,max:5},JUCO:{thr:53,k:0.0055,cap:0.15,max:4}};
function smallPick(lv,p,sc){const have=new Set((p.offers||[]).map(o=>o.school+'|'+o.lvl));const L0=COLLEGES.filter(c=>c.lvl===lv&&!have.has(c.school+'|'+c.lvl)&&colRoom(c,p,true)).sort((a,b)=>b.pr-a.pr);if(!L0.length)return null;
  const L=colPreferIn(L0,p,lv);
  // the better programs at each level call the better players first
  const q=clamp(sc/80,0,1),i=clamp(Math.round((1-q)*(L.length-1)+gauss()*L.length*0.25),0,L.length-1);return L[i];}
function smallOffers(p,pops){
  if(p.committed||p.yr<11)return;p.offers=p.offers||[];
  const gp=(p.seasStats&&p.seasStats.gp)||0,cg=(p.carStats&&p.carStats.gp)||0;
  if(gp<1&&cg<3&&p.pos!=='OL'&&p.pos!=='K')return; // no film yet
  const st=p.sg||0;if(st>=4)return; // blue-chip recruits are not on small-college boards
  const sc=smallScore(p),jr=p.yr===11?0.6:1,hi=p.offers.filter(o=>o.lvl==='FBS'||o.lvl==='FCS').length,gpa=p.gpa||0,tr=p.traits||[];
  for(const lv of['D2','D3','NAIA','JUCO']){const L=SMALL_LV[lv],have=p.offers.filter(o=>o.lvl===lv).length;if(have>=L.max)continue;
    if(st===3&&lv!=='D2'&&!(lv==='JUCO'&&gpa<2.3))continue;
    let ch=clamp((sc-L.thr)*L.k,0,L.cap)*jr;
    if(lv==='D3'&&sc>=L.thr-8){if(gpa>=3.0)ch+=0.012*jr;if(tr.includes('academic'))ch+=0.018*jr;} // D3 programs love good students who can play
    if(lv==='JUCO')ch*=gpa<2.3?1.8:gpa>=3.0?0.5:1; // JUCOs chase talented kids who may not qualify academically
    if(lv!=='D2')ch*=hi>=2?0.35:(p.sg||0)>=3?0.6:1; // kids with D1 offers in hand rarely hear from the small schools
    else if(hi>=3)ch*=0.5;
    ch*=Math.pow(0.8,have);
    if(Math.random()>=ch)continue;
    const c=smallPick(lv,p,sc);if(c)addOffer(p,c,pops,lv==='JUCO'?'JUCO interest':'');}
}
function gauss(){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
let _colSort=null;
function colSorted(){if(!_colSort||_colSort.src!==COLLEGES||_colSort.n!==COLLEGES.length){const a=COLLEGES.filter(c=>c.lvl!=='JUCO').sort((x,y)=>x.pr-y.pr);_colSort={src:COLLEGES,n:COLLEGES.length,a};}return _colSort.a;}
function colRange(lo,hi){const A=colSorted();let i=0,j=A.length;while(i<j){const m=(i+j)>>1;if(A[m].pr<lo)i=m+1;else j=m;}const out=[];for(let k=i;k<A.length&&A[k].pr<=hi;k++)out.push(A[k]);return out;}
function colPick(target,p,within,ignoreGpa){
  const have=new Set((p.offers||[]).map(o=>o.school+'|'+o.lvl));
  const ok=(within==null?COLLEGES:colRange(target-within,target+within)).filter(c=>(within==null||Math.abs(c.pr-target)<=within)&&c.lvl!=='JUCO'&&!have.has(c.school+'|'+c.lvl)&&colRoom(c,p,true)&&(!c.acad||(p.gpa||0)>=c.acad)&&(ignoreGpa||!((p.gpa||0)<2.0&&c.lvl==='FBS'))&&(within==null||Math.abs(c.pr-target)<=within));
  if(!ok.length)return null;ok.sort((a,b)=>Math.abs(a.pr-target)-Math.abs(b.pr-target));
  const L=colPreferIn(ok.slice(0,12),p,ok[0].lvl);return L[Math.floor(Math.random()*Math.min(3,L.length))];
}
function addOffer(p,c,pops,why){
  const o={lvl:c.lvl,school:c.school,pr:c.pr};p.offers.push(o);if(p.id===G.myPlayerId)try{socNote('offer',`${c.school} (${c.lvl}) has offered ${p.fn} ${p.ln}, ${p.pos}${p.stars?', '+p.stars+'-star recruit':''}.`);}catch(e){}
  try{const S=colCls(COL_BY[c.school+'|'+c.lvl]||c,colClassYr(p));S.off[p.pos]=(S.off[p.pos]||0)+1;}catch(e){}
  if(p.sId===G.myId){
    if(c.lvl==='FBS'){if(pops)pops.push(bEvPop(' FBS D1 Offer!',`${p.fn} ${p.ln} received an offer from <strong>${c.school}</strong>${why?` (${why})`:''}!`,face(p.fs,52),'var(--b2)'));addNews('offer',` FBS Offer! ${p.fn} ${p.ln} → ${c.school}`,`${p.pos} • ${stars(p.stars)} • OVR ${p.rat}`);}
    else if(c.lvl==='FCS')addNews('offer',` FCS Offer! ${p.fn} ${p.ln} → ${c.school}`,`${p.pos} • OVR ${p.rat}`);
    else if(c.lvl==='JUCO')addNews('offer',` JUCO Interest: ${p.fn} ${p.ln}`,`${c.school} wants the ${p.pos}.`);
    else addNews('offer',` ${c.lvl} Offer: ${p.fn} ${p.ln} → ${c.school}`,`${p.pos} • OVR ${p.rat}`);
    addLog(`<span style="color:var(--te)"> ${p.fn} ${p.ln} → ${c.lvl}: ${c.school}${why?' ('+why+')':''}</span>`);}
  if(!p.committed&&p.dreamSchool&&o.lvl===p.dreamSchool.lvl&&o.school===p.dreamSchool.school&&pcOwnPick(p)){try{addNews('offer',`Dream school offer: ${o.school}`,`${p.fn} ${p.ln} can commit on My Player.`);}catch(e){}} // Player Career: your choice
  else if(!p.committed&&p.dreamSchool&&o.lvl===p.dreamSchool.lvl&&o.school===p.dreamSchool.school&&colRoom(COL_BY[o.school+'|'+o.lvl],p,false)){p.committed=o;colTakeCommit(p,o);
    if(p.sId===G.myId){if(pops)pops.push(bEvPop(' Dream School Commit!',`${p.fn} ${p.ln} instantly committed to his dream school, <strong>${o.school}</strong> (${o.lvl})!`,face(p.fs,52),'var(--gd)'));
      addNews('offer',` Dream School! ${p.fn} ${p.ln} → ${o.school}`,`Instant commit: ${p.pos} always dreamed of playing there.`);}}
  return o;
}
function genOffers(p,scoutBoost,pops){
  if(p.committed)return;p.offers=p.offers||[];
  const L=recLevel(p),crazy=recCrazy(p),gB=p.gpa>=3.5?.04:p.gpa<2.2?-.05:0,expo=clsExpo(p)*0.006;
  if(L<-5&&!(p.gpa>=3.3||crazy))return; // below the college radar
  const pO=clamp(0.03+Math.max(0,L)/100*0.36+(scoutBoost?0.15:0)+(crazy?0.12:0)+gB+expo-(p.offers.length>=8?0.15:0),0.02,0.6);
  if(Math.random()>pO)return;
  let t=Math.max(2,L)+gauss()*8,why='';
  if(crazy&&Math.random()<0.35){t+=10+Math.random()*16;why='numbers too big to ignore';}
  let c=colPick(t,p,crazy?40:20);if(!c&&(p.gpa||0)<2.0&&Math.random()<0.5)c=colPick(t,p,crazy?40:20,true);if(c&&c.pr<=Math.max(8,L)+(crazy?36:18))addOffer(p,c,pops,why);
}
// v2.16 commitments can flip: a committed senior may jump to a clearly better offer before signing day, or you can push him to
function colRelease(p,o){try{const c=COL_BY[o.school+'|'+o.lvl];if(!c)return;const S=colCls(c,colClassYr(p));S.com[p.pos]=Math.max(0,(S.com[p.pos]||0)-1);}catch(e){}}
function colFlipTarget(p){if(!p.committed||p.yr!==12||!(G.phase==='regular'||G.phase==='playoffs'))return null;const cur=colPr(p.committed);
  const b=colOpenOffers(p).filter(o=>o.school!==p.committed.school&&colPr(o)>=cur+8).sort((a,b)=>colPr(b)-colPr(a))[0];return b||null;}
function plFlip(p,o,pushed){const old=p.committed;colRelease(p,old);p.committed=o;colTakeCommit(p,o);
  if(p.sId===G.myId){addLog(`<span style="color:var(--gd)">FLIP: ${p.fn} ${p.ln} flips from ${old.school} to ${o.school} (${o.lvl})${pushed?' after a talk with you':''}!</span>`);try{addNews('offer',`${p.fn} ${p.ln} flips to ${o.school}`,`Was committed to ${old.school}.`);}catch(e){}}}
function colAutoFlip(p){const o=colFlipTarget(p);if(o&&Math.random()<0.025)plFlip(p,o,false);}
window.pushFlip=function(pid){const p=getP(pid);if(!p||p.sId!==G.myId)return;const o=colFlipTarget(p);if(!o){notify('No better offer to flip to.','w');return;}
  if(p.flipYr===G.yr){notify(`You already talked to ${p.fn} about flipping this season.`,'w');return;}p.flipYr=G.yr;
  const ch=clamp(0.3+(G.prestige-1)*0.05+(colPr(o)-colPr(p.committed))*0.01+((p.morale||65)-60)*0.005,0.1,0.8);
  if(Math.random()<ch){plFlip(p,o,true);notify(`${p.fn} flips to ${o.school}!`);}else{p.morale=clamp((p.morale||65)-4,0,100);notify(`${p.fn} is sticking with ${p.committed.school}.`,'w');}
  clo();showPlayer(pid);};
function checkCommit(p){
  if(pcOwnPick(p))return; // Player Career: your player commits (and flips) only when you choose
  if(p.committed){colAutoFlip(p);return;}
  if(!p.offers||!p.offers.length||p.yr<11)return;
  const isSenior=p.yr===12,wk=G.week||0,urgency=isSenior?Math.min(0.22,0.07+wk*0.015):0.04;
  if(Math.random()>urgency)return;
  const open=colOpenOffers(p);if(!open.length)return;
  const sorted=open.sort((a,b)=>colPr(b)-colPr(a)),best=sorted[0];
  // high-end recruits wait a while for the big offer they expect
  if((p.sg||0)>=4&&isSenior&&wk<8&&colPr(best)<recLevel(p)-20)return;
  if(best.lvl==='JUCO'&&!(isSenior&&wk>=10))return; // JUCO is the late fallback, not an early pledge
  p.committed=best;colTakeCommit(p,best);
  if(p.sId===G.myId){addLog(`<span style="color:var(--gn)"> ${p.fn} ${p.ln} committed to ${best.school} (${best.lvl})!</span>`);
    addNews('offer',` ${p.fn} ${p.ln} Commits to ${best.school}`,`${p.pos} • ${best.lvl}${isSenior?'Signing Day approaching':''}`);}
}
// ── camps: invitations earned on the field, several colleges watching each camp ──
function campCap(){return Math.max(1,Math.round(G.prestige||1));}
function campsUsed(p){return p.campYr===G.yr?(p.campN||0):0;}
const CAMP_KIND=['Elite Camp','Prospect Camp','Showcase','Mega Camp','Skills Camp'];
function campMake(target){
  const CC=COLLEGES.filter(c=>c.lvl!=='JUCO');const host=CC.slice().sort((a,b)=>Math.abs(a.pr-target)-Math.abs(b.pr-target))[Math.floor(Math.random()*4)];
  const near=CC.filter(c=>c!==host&&Math.abs(c.pr-host.pr)<=16).sort(()=>Math.random()-0.5).slice(0,3+Math.floor(Math.random()*4));
  const kind=host.lvl==='FBS'&&host.pr>=85?(Math.random()<0.5?'Elite Camp':'Mega Camp'):CAMP_KIND[Math.floor(Math.random()*CAMP_KIND.length)];
  return{host:host.school,lvl:host.lvl,pr:host.pr,name:`${host.school} ${kind}`,schools:[host,...near].map(c=>({school:c.school,lvl:c.lvl,pr:c.pr})).sort((a,b)=>b.pr-a.pr)};
}
// ── v1.95 camp circuit: about 50 camps a year across the college ladder, each inviting 10-30 prospects.
// Invites go to players who produce per touch (yards per carry / catch, completion %, coverage, line play),
// do it week after week, and have the frame for their position; stars and rating help, but film matters most.
function campInviteScore(p){
  const s=p.seasStats||{},c=p.carStats||{},src=(s.gp||0)>=2?s:c,gp=src.gp||0,e=stEff(src);
  let eff=0;
  if(p.pos==='QB'&&(src.passAtt||0)>=15)eff=(e.cmp-0.55)*60+((src.passYds||0)/Math.max(1,src.passAtt)-6.5)*2;
  else if(p.pos==='RB'&&(src.rushAtt||0)>=15)eff=(e.ypc-4.4)*5+(e.ypr!=null?(e.ypr-8)*0.4:0);
  else if((p.pos==='WR'||p.pos==='TE')&&(src.rec||0)>=5)eff=(e.ypr-(p.pos==='TE'?9.5:12.5))*1.2-(e.drop!=null?(e.drop-0.06)*40:0)+((src.rec||0)/Math.max(1,gp)-2)*1.5;
  else if((p.pos==='CB'||p.pos==='S')&&gp>=2)eff=((src.pbu||0)/gp-0.35)*8-((src.ydsA||0)/gp-(p.pos==='CB'?29:17))*0.15+((src.ints||0)/gp)*10;
  else if(p.pos==='OL'&&gp>=2)eff=((src.pancakes||0)/gp-1.5)*3-((src.sacksA||0)/gp-0.3)*6;
  else if((p.pos==='LB'||p.pos==='DL')&&gp>=2)eff=((src.tackles||0)/gp-(p.pos==='LB'?6:3.5))*1.2+((src.sacks||0)/gp)*6;
  if((src.krRet||0)>=4)eff+=clamp((e.kr-20)*0.3,-2,4);
  eff=clamp(eff||0,-12,15);
  const cons=gp>=3?(src.gg||0)/gp:0.3;
  return prodPct(p)*22+eff+cons*18+sizeFit(p)*4+(p.sg||0)*6+clamp((p.rat-40)*0.35,-4,18)+clsExpo(p)*0.5+(progStars(p)-3)*1.5+(p.yr===10?-4:0)-(p.inj>0?6:0);
}
const CAMP_TIERS=[['FBS',12,0,0.035],['FCS',10,0.01,0.08],['D2',10,0.03,0.16],['NAIA',8,0.05,0.22],['D3',10,0.05,0.26]]; // level, camps, rank window in the prospect pool
function campMakeHost(host){
  const near=COLLEGES.filter(c=>c!==host&&c.lvl!=='JUCO'&&Math.abs(c.pr-host.pr)<=16).sort(()=>Math.random()-0.5).slice(0,3+Math.floor(Math.random()*4));
  const kind=host.lvl==='FBS'&&host.pr>=85?(Math.random()<0.5?'Elite Camp':'Mega Camp'):CAMP_KIND[Math.floor(Math.random()*CAMP_KIND.length)];
  return{host:host.school,lvl:host.lvl,pr:host.pr,name:`${host.school} ${kind}`,schools:[host,...near].map(c=>({school:c.school,lvl:c.lvl,pr:c.pr})).sort((a,b)=>b.pr-a.pr)};}
function campYear(){
  if(!G.campY||G.campY.yr!==G.yr){const L=[];let n=0;
    for(const[lvl,cnt,w0,w1]of CAMP_TIERS){const pool=COLLEGES.filter(c=>c.lvl===lvl).sort(()=>Math.random()-0.5);
      for(let i=0;i<cnt;i++){const host=pool[i%pool.length],c=campMakeHost(host);
        Object.assign(c,{cid:'k'+G.yr+'_'+(n++),wk:i<2?0:1+Math.floor(Math.random()*10),size:10+Math.floor(Math.random()*21),w0,w1,done:false,inv:0,att:0});L.push(c);}}
    G.campY={yr:G.yr,list:L};}
  return G.campY.list;}
// rank every uncommitted sophomore-senior once per week
function campPool(){const key=G.yr+'|'+(G.week||0)+'|'+(G.osPhase||0)+'|'+G.players.length;
  if(!G._cpool||G._cpool.key!==key){const A=[];for(const p of G.players){if(p.grad||!p.sId||p.yr<10||p.yr>12||p.committed||p.pos==='K')continue;
      const gp=((p.seasStats&&p.seasStats.gp)||0)+((p.carStats&&p.carStats.gp)||0);if(gp<1&&p.pos!=='OL')continue;A.push([campInviteScore(p)+gauss()*3,p]);}
    A.sort((a,b)=>b[0]-a[0]);Object.defineProperty(G,'_cpool',{value:{key,A},writable:true,configurable:true,enumerable:false});}
  return G._cpool.A;}
// one camp sends out its invitations; AI prospects attend on their own, the user's players wait on the Recruiting page
function campSendInvites(C,mineOut){
  const A=campPool(),N=A.length;if(!N)return;C.done=true;
  const lo=Math.floor(N*C.w0),hi=Math.max(lo+C.size*2,Math.floor(N*C.w1));
  const cand=A.slice(lo,Math.min(N,hi)).filter(([,p])=>!p.committed&&campsUsed(p)<campCapFor(p)&&!(p.camps||[]).some(k=>k.yr===G.yr&&k.name===C.name));
  // better-ranked prospects inside the window are likelier to be picked
  const picks=[];const used=new Set();
  for(let k=0;k<C.size*4&&picks.length<C.size&&cand.length;k++){const i=Math.floor(Math.pow(Math.random(),1.6)*cand.length),p=cand[i][1];if(used.has(p.id))continue;used.add(p.id);picks.push(p);}
  for(const p of picks){C.inv++;
    if(p.sId===G.myId&&p.id===G.myPlayerId&&pcAuto()){try{const r=campRun(p,C,true);C.att++;addNews('offer',`Camp: ${p.fn} ${p.ln} grades ${r.grade}`,`${C.name}, ${r.got.length} offer${r.got.length!==1?'s':''}.`);}catch(e){}} // Player Career: your player goes
    else if(p.sId===G.myId&&!pcAuto()){G.campInv=(G.campInv||[]).filter(v=>getP(v.pid)&&v.yr===G.yr);if(G.campInv.filter(v=>v.pid===p.id).length>=3)continue;
      const inv={id:'c'+Date.now().toString(36)+Math.floor(Math.random()*1e6),pid:p.id,yr:G.yr,wk:G.week||0,camp:{host:C.host,lvl:C.lvl,pr:C.pr,name:C.name,schools:C.schools,size:C.size}};
      G.campInv.push(inv);if(mineOut)mineOut.push([p,C]);}
    else if(Math.random()<0.8){try{campRun(p,C,true);C.att++;}catch(e){}}}
}
function campCapFor(p){return p.sId===G.myId?campCap():Math.max(1,Math.round(progStars(p)));}
function campInviteWeek(wk,pops){
  const mine=[];for(const C of campYear())if(!C.done&&C.wk<=wk)campSendInvites(C,mine);
  if(mine.length){addNews('offer',` ${mine.length} Camp Invite${mine.length>1?'s':''}`,mine.map(([p,C])=>`${p.fn} ${p.ln} → ${C.name}`).join(' · '));
    if(pops)pops.push(bEvPop(' Camp Invites!',mine.map(([p,C])=>`<div style="margin:4px 0"><strong>${p.fn} ${p.ln}</strong> (${p.pos}), ${C.name} <span style="color:var(--mu)">(${C.size} invited, ${C.schools.length} programs watching)</span></div>`).join('')+'<div style="margin-top:6px;font-size:12px;color:var(--mu)">Send them from the Recruiting page.</div>',null,'var(--b2)'));}
}
/*<recruit3>*/
