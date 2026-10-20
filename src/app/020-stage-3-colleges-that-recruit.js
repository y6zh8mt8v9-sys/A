// ═══════════ v2.09 STAGE 3: colleges that recruit ═══════════
// Every college has a home state. Colleges lean on their own state like real programs do (share of a roster that
// comes from the home state: FBS about 32%, FCS about 45%, D2 about 60%, D3 about 75%, NAIA about 50%, JUCO about 65%;
// big states keep more of their own players, small ones far fewer). AI prospects commit during the season too,
// colleges that lose a target go after a replacement late in the year, and in the final two weeks colleges with open
// spots hold paid "needs camps" where only the host can offer. Unfilled spots at signing day go to transfers and
// walk-ons, so the number of high school offers (and how hard recruiting is) stays where it was.
const COL_IN_RATE={FBS:.32,FCS:.45,D2:.60,D3:.75,NAIA:.50,JUCO:.65};
let _colStDone=false;const _ST_SIZE={};
// home states are worked out on first use (the state tables are defined further down the file)
function _colStReady(){if(_colStDone)return;_colStDone=true;
(function(){
  const towns={},add=(arr,st)=>{for(const t of arr||[]){const k=String(t).replace(/ (Norte|Sur)$/,'');if(!towns[k])towns[k]=st;}};
  for(const st of ST_ORDER){if(st==='CF')continue;const T=XTOWN[st]||{};add(T.one,st);add(T.es,st);add(T.cnty,st);add(T.en,st);}
  add(typeof CITIES!=='undefined'?CITIES:[],'CF');add(typeof _BASE_CITIES!=='undefined'?_BASE_CITIES:[],'CF');
  const names=ST_ORDER.map(s=>[s,stName(s)]).sort((a,b)=>b[1].length-a[1].length);
  const W=ST_ORDER.map(s=>[s,XST[s]?XST[s].cls.reduce((a,c)=>a+XCLS[c].t,0):375]),tot=W.reduce((a,b)=>a+b[1],0);
  for(const c of COLLEGES){let st=null;
    for(const[s,n]of names)if(c.school===n||c.school.startsWith(n+' ')||c.school.endsWith(' '+n)||c.school.includes(' '+n+' ')){st=s;break;}
    if(!st){const w=c.school.replace(/ (State|University|College|CC|Junior College|Community College|Christian|Baptist|Wesleyan|Lutheran|Methodist|Nazarene|County CC|Valley CC)$/,'').replace(/^Saint /,'');
      st=towns[w]||towns[w.split(' ')[0]]||null;}
    if(!st){let h=7;for(const ch of c.school)h=(h*31+ch.charCodeAt(0))>>>0;let r=(h%100000)/100000*tot;for(const[s,x]of W){if((r-=x)<0){st=s;break;}}}
    c.st=st||'CF';}
})();
(function(){let a=0;for(const s of ST_ORDER){_ST_SIZE[s]=XST[s]?XST[s].cls.reduce((x,c)=>x+XCLS[c].t,0):375;a+=_ST_SIZE[s];}_ST_SIZE._avg=a/ST_ORDER.length;})();
}
// junior-college fallback: an in-state JUCO with a high-school spot left (none left: the player does not sign)
function jucoPick(p){try{const L=COLLEGES.filter(c=>c.lvl==='JUCO'&&colRoom(c,p,false));if(!L.length)return null;const P=colPreferIn(L,p,'JUCO');return pick(P.length?P:L).school;}catch(e){return null;}}
function colPIn(lvl,st){_colStReady();if(!st||!_ST_SIZE[st])return 0;return clamp((COL_IN_RATE[lvl]||.4)*Math.pow(_ST_SIZE[st]/_ST_SIZE._avg,0.55),0.02,0.9);}
function plSt(p){try{return stOf(getS(p.sId));}catch(e){return null;}}
// choose between the in-state and out-of-state candidates like a real staff would
function colPreferIn(list,p,lvl){_colStReady();const st=plSt(p);if(!st||!list.length)return list;const inS=list.filter(c=>c.st===st),outS=list.filter(c=>c.st!==st);
  if(!inS.length)return list;if(Math.random()<colPIn(lvl||list[0].lvl,st))return inS;return outS.length?outS:list;}

// ── the colleges' recruiting classes: who is committed where (computed from the players, nothing extra stored) ──
function colCommitMap(){const key=G.yr+'|'+(G.week||0)+'|'+(G.phase||'')+'|'+G.players.length+'|'+(G._cmv||0);
  if(G._cm&&G._cm.key===key)return G._cm.m;const m={};
  for(const p of G.players){if(p.grad||!p.committed||p.yr<10||p.yr>12)continue;const k=p.committed.school+'|'+p.committed.lvl;(m[k]=m[k]||[]).push(p);}
  Object.defineProperty(G,'_cm',{value:{key,m},writable:true,configurable:true,enumerable:false});return m;}
// signing day: every senior picks from his open offers; the signed classes are kept for one year so they can be browsed
function colSigningDay(){
  const by={};
  for(const p of G.players){if(p.grad||p.yr!==12||!p.sId)continue;if(!p.committed&&p.sId!==G.myId){try{commitPlayer(p);}catch(e){}}
    if(!p.committed)continue;const k=p.committed.school+'|'+p.committed.lvl,s=getS(p.sId);
    (by[k]=by[k]||[]).push([p.fn+' '+p.ln,p.pos,p.stars||0,p.rat,s?s.name:'',s?stOf(s):'',p.sId===G.myId?1:0]);}
  G.colSigned={yr:G.yr,by};
}
// ── late-season replacements: a college whose targets went elsewhere offers the next best fit at that position ──
function _seasonLeft(){const R=(G.sched||[]).filter(g=>g.type==='regular');return R.filter(g=>!g.result).length;}
function colNeedsWeek(pops){_colStReady();
  if(!G||!G.sched)return;const left=_seasonLeft();
  try{ncampTick(left,pops);}catch(e){console.error('needs camps',e);}
  if(!(left<=3||G.phase==='playoffs'||G.phase==='postseason'))return;
  const cy=G.yr,cand={};
  for(const p of G.players){if(p.grad||p.yr!==12||p.committed||!p.sId||p.pos==='K')continue;(cand[p.pos]=cand[p.pos]||[]).push([recLevel(p),p]);}
  for(const k in cand)cand[k].sort((a,b)=>a[0]-b[0]);
  // FBS staffs also flip seniors already committed to a lower level (FCS, D2, D3, NAIA, JUCO)
  const flip={};for(const p of G.players){if(p.grad||p.yr!==12||!p.committed||p.committed.lvl==='FBS'||!p.sId||p.pos==='K'||(p.dreamSchool&&p.dreamSchool.school===p.committed.school&&p.dreamSchool.lvl===p.committed.lvl))continue;(flip[p.pos]=flip[p.pos]||[]).push([recLevel(p),p]);}
  for(const k in flip)flip[k].sort((a,b)=>a[0]-b[0]);
  if(!G.colRep||G.colRep.yr!==G.yr)G.colRep={yr:G.yr,n:{}};
  for(const c of COLLEGES){const o=colCls(c,cy),key=c._k||(c._k=c.school+'|'+c.lvl),hl=colHsLeft(o);let made=0;if(hl<=0)continue;
    for(const pos in o.need){if(made>=Math.min(2,hl))break;const open=Math.min(hl,o.need[pos]-(o.com[pos]||0));if(open<=0)continue;
      const rk=key+'#'+pos;if((G.colRep.n[rk]||0)>=open*2)continue;
      if(c.lvl==='FBS'&&colFlip(c,pos,flip[pos],pops)){G.colRep.n[rk]=(G.colRep.n[rk]||0)+1;made++;continue;}
      const A=cand[pos];if(!A||!A.length)continue;
      // suitable players: rated just below to a little above what this program usually signs (late in the year an FBS staff takes any FBS-level player)
      let lo=0,hi=A.length;const lv=c.lvl==='FBS'?Math.min(c.pr-24,44):c.pr-12;while(lo<hi){const m=(lo+hi)>>1;if(A[m][0]<lv)lo=m+1;else hi=m;}
      const pool=[];for(let i=lo;i<A.length&&A[i][0]<=c.pr+6;i++){const p=A[i][1];if(!p.offers.some(x=>x.school===c.school&&x.lvl===c.lvl))pool.push(p);}
      if(!pool.length)continue;const st=pool.filter(p=>plSt(p)===c.st),usein=st.length&&Math.random()<colPIn(c.lvl,c.st);
      const P=(usein?st:pool)[Math.floor(Math.random()*(usein?st:pool).length)];
      if(!colRoom(c,P,false))continue;addOffer(P,c,P.sId===G.myId?pops:null,'filling a need');G.colRep.n[rk]=(G.colRep.n[rk]||0)+1;made++;}}
}
// an FBS offer late in the year: the best fitting senior committed to a smaller program usually flips (about 3 in 4 do)
function colFlip(c,pos,A,pops){if(!A||!A.length)return false;const lv=Math.min(c.pr-24,44);
  const pool=A.filter(([r,p])=>r>=lv&&r<=c.pr+6&&p.committed&&p.committed.lvl!=='FBS'&&!p.offers.some(x=>x.school===c.school&&x.lvl===c.lvl));if(!pool.length)return false;
  pool.sort((a,b)=>b[0]-a[0]);const P=pool[Math.floor(Math.random()*Math.min(4,pool.length))][1];if(!colRoom(c,P,false))return false;
  addOffer(P,c,P.sId===G.myId?pops:null,'filling a need');if(Math.random()>0.75)return true;
  const old=P.committed,oc=COL_BY[old.school+'|'+old.lvl];if(oc){const S=colCls(oc,colClassYr(P));if(S.com[P.pos]>0)S.com[P.pos]--;}
  P.committed=P.offers[P.offers.length-1];colTakeCommit(P,P.committed);
  if(P.sId===G.myId){addLog(`<span style="color:var(--gn)"> ${P.fn} ${P.ln} flipped from ${old.school} (${old.lvl}) to ${c.school} (FBS)!</span>`);addNews('offer',` ${P.fn} ${P.ln} Flips to ${c.school}`,`${P.pos} • FBS late offer`);}
  return true;}
// ── needs camps in the last two weeks: pay to send a player, only the host can offer ──
const NCAMP_FEE={FBS:9000,FCS:6000,D2:4000,NAIA:3000,D3:2500};
function ncampFee(c){return Math.round((NCAMP_FEE[c.lvl]||3000)*(0.8+c.pr/250)/100)*100;}
function ncampMake(){_colStReady();
  const cy=G.yr,L=[],per={FBS:3,FCS:4,D2:4,NAIA:2,D3:3};let n=0;
  for(const lvl in per){const C=COLLEGES.filter(c=>c.lvl===lvl).map(c=>{const o=colCls(c,cy),hl=colHsLeft(o);let open=0;const pos=[];for(const k in o.need){const r=Math.min(hl,o.need[k]-(o.com[k]||0));if(r>0){open+=r;pos.push([k,r]);}}return{c,open:Math.min(open,hl),pos};}).filter(x=>x.open>0).sort((a,b)=>b.open-a.open||Math.random()-.5);
    const pick=C.slice(0,per[lvl]*4).sort(()=>Math.random()-.5).slice(0,per[lvl]);
    for(const x of pick){const pos=x.pos.sort((a,b)=>b[1]-a[1]).slice(0,1+Math.floor(Math.random()*2)),spots=Math.min(4,pos.reduce((a,b)=>a+b[1],0));
      L.push({id:'n'+G.yr+'_'+(n++),host:x.c.school,lvl:x.c.lvl,pr:x.c.pr,st:x.c.st,pos:pos.map(a=>a[0]),spots,fee:ncampFee(x.c),att:[],mine:[],done:false,res:null});}}
  // other high schools send their own seniors at those positions
  const S=G.players.filter(p=>!p.grad&&p.yr===12&&!p.committed&&p.sId&&p.sId!==G.myId&&p.pos!=='K');
  for(const C of L){const cand=S.filter(p=>C.pos.includes(p.pos)),near=cand.map(p=>[Math.abs(recLevel(p)-(C.pr-6)),p]).filter(a=>a[0]<16).sort((a,b)=>a[0]-b[0]).slice(0,C.spots*12);
    const want=C.spots*(3+Math.floor(Math.random()*3));for(const[,p]of near.sort(()=>Math.random()-.5)){if(C.att.length>=want)break;if(plSt(p)!==C.st&&Math.random()>0.45)continue;C.att.push(p.id);}}
  return L;}
function ncampActive(){return G.ncamp&&G.ncamp.yr===G.yr&&!G.ncamp.done;}
function ncampTick(left,pops){
  if(G.phase!=='regular'&&G.phase!=='offseason')return;
  if(left<=2&&left>0&&(!G.ncamp||G.ncamp.yr!==G.yr)){G.ncamp={yr:G.yr,done:false,list:ncampMake()};
    addNews('offer',' College needs camps',`${G.ncamp.list.length} colleges with open spots hold camps over the final two weeks. Send a senior from the Recruiting page.`);
    if(pops)pops.push(bEvPop(' Needs Camps Open',`${G.ncamp.list.length} colleges still have open spots and are holding camps over the <strong>final two weeks</strong> of the season. You can pay to send a senior at a position they need; other schools send theirs too, and only the host college can offer.<div style="margin-top:6px;font-size:12px;color:var(--mu)">Open the Recruiting page to send players.</div>`,null,'var(--b2)'));}
  if(left===0&&ncampActive())ncampResolve(pops);
}
function ncampSend(cid,pid){
  const C=ncampActive()&&G.ncamp.list.find(x=>x.id===cid),p=getP(pid);if(!C||!p)return;
  if(C.mine.includes(pid)||C.att.includes(pid)){notify('He is already going to that camp.','w');return;}
  if(G.ncamp.list.some(x=>x.mine.includes(pid))){notify('He is already going to a needs camp that weekend.','w');return;}
  if(!G.unlimitedMoney&&(G.budget||0)<C.fee){notify('Not enough budget for the camp fee.','e');return;}
  if(!G.unlimitedMoney)G.budget-=C.fee;C.mine.push(pid);
  addLog(`<span style="color:var(--te)"> ${p.fn} ${p.ln} (${p.pos}) is going to the ${C.host} needs camp, $${C.fee.toLocaleString()}.</span>`);
  try{updateTb();}catch(e){}nav('recr');}
function ncampResolve(pops){
  G.ncamp.done=true;const mineRes=[];
  for(const C of G.ncamp.list){const col=COL_BY[C.host+'|'+C.lvl];if(!col)continue;
    const all=[...C.att,...C.mine].map(id=>getP(id)).filter(p=>p&&!p.grad&&!p.committed);
    const graded=all.map(p=>{const r=campGrade(p);return{p,...r};}).sort((a,b)=>b.cg-a.cg);
    const need=52+C.pr*0.3-6;let left=Math.max(0,Math.min(C.spots,col?(()=>{const o=colCls(col,G.yr);return Math.min(colHsLeft(o),C.pos.reduce((a,k)=>a+Math.max(0,o.need[k]-(o.com[k]||0)),0));})():C.spots));
    const offered=[];
    for(const g of graded){g.p.campStarB=clamp((g.p.campStarB||0)+g.bump,-2,5);(g.p.camps=g.p.camps||[]).push({yr:G.yr,name:C.host+' Needs Camp',grade:g.grade,offers:0});
      if(left>0&&g.cg>=need&&!g.p.offers.some(o=>o.school===C.host&&o.lvl===C.lvl)){addOffer(g.p,col,null,'needs camp');left--;offered.push(g.p.id);g.p.camps[g.p.camps.length-1].offers=1;}
      try{starStep(g.p,null,true);}catch(e){}}
    C.res={n:graded.length,offered};
    for(const id of C.mine){const p=getP(id),g=graded.find(x=>x.p.id===id);if(p&&g)mineRes.push([p,C,g.grade,offered.includes(id)]);}}
  if(mineRes.length){const h=mineRes.map(([p,C,gr,ok])=>`<div style="margin:4px 0"><strong>${p.fn} ${p.ln}</strong> (${p.pos}) at ${C.host}, grade <b>${gr}</b> · ${ok?'<span style="color:var(--gn)">OFFER!</span>':'<span style="color:var(--mu)">no offer</span>'}</div>`).join('');
    addNews('offer',' Needs camp results',mineRes.map(([p,C,,ok])=>`${p.fn} ${p.ln}: ${ok?'offer from '+C.host:'no offer'}`).join(' · '));
    if(pops)pops.push(bEvPop(' Needs Camp Results',h,null,'var(--gd)'));}
}
// the workout grade every camp uses (same formula as the camp circuit)
function campGrade(p){
  const dv={'Elite Dev':6,'Star':4,'Impact':2,'Normal':0}[p.dev]||0,tr=p.traits||[];
  const cg=p.rat*0.55+(p.spd||p.rat)*0.2+(p.awr||p.rat)*0.1+(p.str||p.rat)*0.1+recClsAdj(p)*0.95+dv*1.5+sizeFit(p)*2.5+(tr.includes('competitor')||tr.includes('clutch')?3:0)+(tr.includes('workhorse')||tr.includes('coachable')?1.5:0)-(tr.includes('lazy')?4:0)+gauss()*6;
  const grade=cg>=82?'A+':cg>=75?'A':cg>=68?'B':cg>=60?'C':'D';return{cg,grade,bump:{'A+':3,'A':2,'B':1,'C':0,'D':-1}[grade]};}

// ── AI programs move up and down classifications like you do ──
// Same pressure meter as your program: bad seasons build it, good ones and titles relieve it; 100% means a drop.
// Dominant teams (a state title or two straight great seasons) can step up. At most two moves each way per class a year.
function aiReclassify(champs){
  const isChamp=id=>Object.values(champs||{}).some(c=>c&&c.id===id)||(G.playoff&&G.playoff.stateChampId===id);
  const moves=[];
  for(const st of ST_ORDER){const L=clsOfSt(st);
    const ups={},downs={};
    for(let i=0;i<L.length;i++){const c=L[i],divs=divisionsForCls(c);if(!divs||!divs.length)continue;
      for(const d of divs)for(const t of d.teams){if(t.id===G.myId)continue;const g=(t.wins||0)+(t.losses||0);if(!g)continue;const r=t.wins/g,ch=isChamp(t.id);
        const dl=ch?-(t.rp||0):r>=0.83?-10:r>=0.7?0:r>=0.58?8:r>=0.5?15:r>=0.38?25:r>=0.25?38:50;
        t.rp=clamp((t.rp||0)+dl,0,100);const prev=t.lr;t.lr=r;
        if(t.rp>=100&&i>0&&!(t.upYr&&G.yr-t.upYr<=3)&&(downs[i]||0)<2){downs[i]=(downs[i]||0)+1;moves.push([t,c,L[i-1],'down']);}
        else if(i<L.length-1&&(ch||(r>=0.9&&prev!=null&&prev>=0.8))&&Math.random()<0.5&&(ups[i]||0)<2&&!(t.dnYr&&G.yr-t.dnYr<=1)){ups[i]=(ups[i]||0)+1;moves.push([t,c,L[i+1],'up']);}}}}
  for(const[t,from,to,dir]of moves){const A=divisionsForCls(from),B=divisionsForCls(to);if(!A||!B||!B.length)continue;
    const d=A.find(x=>x.teams.includes(t));if(!d||d.teams.length<=4)continue;const tgt=B.slice().sort((a,b)=>a.teams.length-b.teams.length)[0];
    d.teams.splice(d.teams.indexOf(t),1);tgt.teams.push(t);t.cls=to;t.dIdx=B.indexOf(tgt);t.rp=0;if(dir==='up')t.upYr=G.yr;else t.dnYr=G.yr;
    if(Math.random()<0.25||isChamp(t.id))addNews('othercls',` ${t.name} ${t.mascot} move ${dir}`,`${dir==='up'?'Moving up':'Dropping down'} from ${clsName(from)} to ${clsName(to)} next season.`);}
  if(moves.length){G.lsch=null;if(typeof _RK!=='undefined')_RK=null;_spVer++;}
  return moves.length;
}

// ── College classes tab on the recruiting page ──
let _colF={lvl:'FBS',st:'ALL',q:''};
window._colFilt=function(k,v){_colF[k]=v;nav('recr');};
function pgColleges(){_colStReady();
  const m=colCommitMap(),cy=G.yr,q=(_colF.q||'').toLowerCase();
  const list=COLLEGES.filter(c=>(_colF.lvl==='ALL'||c.lvl===_colF.lvl)&&(_colF.st==='ALL'||c.st===_colF.st)&&(!q||c.school.toLowerCase().includes(q))).sort((a,b)=>b.pr-a.pr);
  const sel=(k,opts,cur)=>`<select onchange="_colFilt('${k}',this.value)" style="background:var(--s2);color:var(--tx);border:1px solid var(--bd);border-radius:4px;padding:4px 6px">${opts.map(([v,l])=>`<option value="${v}"${v===cur?' selected':''}>${l}</option>`).join('')}</select>`;
  const rows=list.slice(0,120).map(c=>{const k=c.school+'|'+c.lvl,ps=m[k]||[],sr=ps.filter(p=>p.yr===12),jr=ps.filter(p=>p.yr<12),o=colCls(c,cy),inS=sr.filter(p=>plSt(p)===c.st).length,top=sr.reduce((a,p)=>Math.max(a,p.stars||0),0);
    return`<tr class="cl" onclick="colShow('${k.replace(/'/g,"\\'")}')"><td style="font-weight:700;white-space:nowrap"><span style="display:inline-flex;align-items:center;gap:6px">${colLogo(k,24)}${c.school}</span></td><td>${c.lvl}</td><td>${stName(c.st)}</td><td>${c.pr}</td><td><b>${sr.length}</b> <span style="color:var(--mu)">/ ${o.hs}</span></td><td>${jr.length}</td><td>${sr.length?Math.round(inS/sr.length*100)+'%':'–'}</td><td>${top?stars(top):'–'}</td></tr>`;}).join('');
  return`<div class="pnl"><div class="ph">College recruiting classes</div><div class="pb">
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">${sel('lvl',[['ALL','All levels'],...['FBS','FCS','D2','D3','NAIA','JUCO'].map(x=>[x,x])],_colF.lvl)}${sel('st',[['ALL','All states'],...ST_ORDER.map(s=>[s,stName(s)])],_colF.st)}
      <input placeholder="Search college…" value="${(_colF.q||'').replace(/"/g,'&quot;')}" onchange="_colFilt('q',this.value)" style="background:var(--s2);color:var(--tx);border:1px solid var(--bd);border-radius:4px;padding:4px 8px;min-width:160px"></div>
    <div style="font-size:12px;color:var(--mu);margin-bottom:8px">Each college signs a realistic recruiting class: about 20 to 26 at FBS, 18 to 24 at FCS, 18 to 26 in Division II, 20 to 36 in Division III, 16 to 30 in the NAIA and 20 to 36 at junior colleges. <b>Class</b> = seniors committed now / spots in this year's class; <b>Jr</b> = early commits for next year. Tap a college to see its class and needs.${list.length>120?` Showing the top 120 of ${list.length}.`:''}</div>
    <div style="overflow-x:auto"><table><thead><tr><th>College</th><th>Level</th><th>State</th><th>Prestige</th><th>Class</th><th>Jr</th><th>In-state</th><th>Top</th></tr></thead><tbody>${rows||'<tr><td colspan="8" style="color:var(--mu)">No colleges match.</td></tr>'}</tbody></table></div></div></div>`;
}
window.colShow=function(k){_colStReady();
  const c=COL_BY[k];if(!c)return;const m=colCommitMap(),ps=(m[k]||[]).slice().sort((a,b)=>b.yr-a.yr||(b.stars||0)-(a.stars||0)||b.rat-a.rat),o=colCls(c,G.yr),yr0=2026+(G.yr-1);
  const need=Object.keys(o.need).map(pos=>{const cm=o.com[pos]||0,n=o.need[pos];return`<span style="display:inline-block;margin:2px 4px 2px 0;padding:2px 7px;border-radius:999px;background:${cm>=n?'rgba(40,180,90,.18)':'var(--s2)'};border:1px solid var(--bd);font-size:11px"><b>${pos}</b> ${cm}/${n}</span>`;}).join('');
  const row=p=>{const s=getS(p.sId);return`<tr class="cl" onclick="clo();showPlayer(${p.id})"><td>${p.fn} ${p.ln}${p.sId===G.myId?' <span style="color:var(--gd);font-size:10px">YOURS</span>':''}</td><td><span class="pb2">${p.pos}</span></td><td>${stars(p.stars)}</td><td>${p.rat}</td><td>${s?s.name:''}</td><td>${s?stName(stOf(s)):''}${s&&stOf(s)===c.st?' <span style="color:var(--gn);font-size:10px">IN-STATE</span>':''}</td></tr>`;};
  const sr=ps.filter(p=>p.yr===12),jr=ps.filter(p=>p.yr<12);
  const sg=G.colSigned&&G.colSigned.by&&G.colSigned.by[k]||[];
  const signed=sg.length?`<div style="margin-top:12px;font-weight:900">Signed last year (${2026+(G.colSigned.yr-1)})</div><div style="font-size:12px;color:var(--mu);margin-bottom:4px">${sg.length} high school signees</div>
    <div style="overflow-x:auto"><table><tbody>${sg.slice().sort((a,b)=>b[2]-a[2]||b[3]-a[3]).map(x=>`<tr><td>${x[0]}${x[6]?' <span style="color:var(--gd);font-size:10px">YOURS</span>':''}</td><td><span class="pb2">${x[1]}</span></td><td>${stars(x[2])}</td><td>${x[3]}</td><td>${x[4]}</td><td>${stName(x[5])}</td></tr>`).join('')}</tbody></table></div>`:'';
  const CI=colInfo(k);openMo(`<div style="padding:4px 2px"><div style="display:flex;align-items:center;gap:12px;margin-bottom:6px">${colLogo(k,64)}<div style="flex:1"><div style="font-weight:900;font-size:20px">${c.school} ${CI.mascot}</div><div style="font-size:12px;color:var(--mu)">${CI.abbr}${CI.conf?' · '+CI.conf:''}</div></div><button class="bgh bsm" onclick="openColEdit('${k.replace(/'/g,"\\'")}')">Edit</button></div><div style="font-size:12px;color:var(--mu);margin-bottom:8px">${c.lvl} · ${stName(c.st)} · prestige ${c.pr} · signs a ${o.cap}-player class this year (${colHsLeft(o)} spots still open; about ${Math.round(colPIn(c.lvl,c.st)*100)}% from ${stName(c.st)})</div>
    <div style="font-weight:800;margin-bottom:4px">Class of ${yr0+1} needs</div><div>${need}</div>
    <div style="margin-top:10px;font-weight:900">Committed seniors (${sr.length})</div>${sr.length?`<div style="overflow-x:auto"><table><tbody>${sr.map(row).join('')}</tbody></table></div>`:'<div style="color:var(--mu);font-size:12px">No senior commitments yet.</div>'}
    ${jr.length?`<div style="margin-top:10px;font-weight:900">Early commitments (${jr.length})</div><div style="overflow-x:auto"><table><tbody>${jr.map(row).join('')}</tbody></table></div>`:''}
    ${signed}<div style="text-align:right;margin-top:12px"><button class="btn" onclick="clo()">Close</button></div></div>`);
};
// the needs camps panel on the recruiting page
function ncampHtml(){
  if(!G.ncamp||G.ncamp.yr!==G.yr)return'';const act=!G.ncamp.done;
  const busy=new Set(G.ncamp.list.flatMap(C=>C.mine)); // the camps all run the same weekend: one needs camp per player
  const mine=myP().filter(p=>p.yr===12&&!p.committed&&!(p.inj>0)&&!busy.has(p.id));
  const rows=G.ncamp.list.slice().sort((a,b)=>b.pr-a.pr).map(C=>{const elig=mine.filter(p=>C.pos.includes(p.pos));
    const sent=C.mine.map(id=>getP(id)).filter(Boolean);
    return`<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:8px 0;border-top:1px solid var(--bd)">
      <div style="flex:1 1 240px;min-width:0"><div style="font-weight:800">${C.host} <span style="font-size:11px;color:var(--mu)">${C.lvl} · ${stName(C.st)}</span></div>
      <div style="font-size:12px">Needs: <b>${C.pos.join(', ')}</b> · ${C.spots} spot${C.spots>1?'s':''} · ${C.att.length+C.mine.length} attending · fee <b>$${C.fee.toLocaleString()}</b></div>
      ${sent.length?`<div style="font-size:11px;color:var(--gn)">Sending: ${sent.map(p=>p.fn+' '+p.ln).join(', ')}</div>`:''}
      ${C.res?`<div style="font-size:11px;color:var(--mu)">Result: ${C.res.offered.length} offer${C.res.offered.length!==1?'s':''} from ${C.res.n} campers</div>`:''}</div>
      ${act?elig.map(p=>`<button class="btn bsm bgn" onclick="ncampSend('${C.id}',${p.id})">Send ${p.fn[0]}. ${p.ln} (${p.pos})</button>`).join(''):''}</div>`;}).join('');
  return`<div class="pnl" style="margin-bottom:14px"><div class="ph">College needs camps ${act?'<span style="font-size:12px;color:var(--gd);font-weight:700">· final two weeks</span>':'<span style="font-size:12px;color:var(--mu);font-weight:600">· finished</span>'}</div><div class="pb">
    <div style="font-size:12px;color:var(--mu)">These colleges still have open spots. Pay the fee to send an uncommitted senior at a position they need. Other high schools send players too, and <b>only the host can offer</b>: the best workouts get the open spots. Camps are held after the last regular-season game.</div>${rows}</div></div>`;
}

/*</recruit3>*/
// kept for older callers (spring and preseason hooks)
function campInviteCheck(p,pops,force){if(force){try{campInviteWeek(0,pops);}catch(e){console.error(e);}}}
// a prospect works out at a camp: grade, star movement, offers from the programs watching
function campRun(p,C,silent){
  const dv={'Elite Dev':6,'Star':4,'Impact':2,'Normal':0}[p.dev]||0,tr=p.traits||[];
  const cg=p.rat*0.55+(p.spd||p.rat)*0.2+(p.awr||p.rat)*0.1+(p.str||p.rat)*0.1+recClsAdj(p)*0.95+dv*1.5+sizeFit(p)*2.5+(tr.includes('competitor')||tr.includes('clutch')?3:0)+(tr.includes('workhorse')||tr.includes('coachable')?1.5:0)-(tr.includes('lazy')?4:0)+gauss()*6;
  const grade=cg>=82?'A+':cg>=75?'A':cg>=68?'B':cg>=60?'C':'D',bump={'A+':3,'A':2,'B':1,'C':0,'D':-1}[grade];
  p.campStarB=clamp((p.campStarB||0)+bump,-2,5);if(p.campYr!==G.yr){p.campYr=G.yr;p.campN=0;}p.campN++;p.camp=true;
  const before=p.stars||0;if(grade==='A+'&&Math.random()<0.5)p.sg=Math.min(getStarCap(p),(p.sg||0)+1);starStep(p,null,true);
  const got=[];
  for(const s of C.schools){if((p.offers||[]).some(o=>o.school===s.school&&o.lvl===s.lvl)||p.committed||!colRoom(COL_BY[s.school+'|'+s.lvl]||s,p,true))continue;
    // v1.95: camps are where offers happen, a solid workout in front of a staff is often enough
    if(got.length>=3)break;
    const need=52+s.pr*0.3,pOf=clamp(0.02+(cg-need)*0.025+(s.school===C.host?0.08:0)+(grade==='A+'?0.08:grade==='A'?0.04:0),0.02,0.7)*(p.yr<=10?0.25:1); // offers come from junior year, rarely before
    if(Math.random()<pOf){p.offers=p.offers||[];addOffer(p,COL_BY[s.school+'|'+s.lvl]||s,silent?null:null,'camp offer');got.push(s);}}
  (p.camps=p.camps||[]).push({yr:G.yr,name:C.name,grade,offers:got.length});
  return{grade,got,before,bump};
}
function campAttend(id){
  const inv=(G.campInv||[]).find(v=>v.id===id);if(!inv)return;const p=getP(inv.pid);if(!p){G.campInv=G.campInv.filter(v=>v!==inv);nav('recr');return;}
  if(campsUsed(p)>=campCap()){notify(`${p.fn} ${p.ln} already used his ${campCap()} camp${campCap()>1?'s':''} this year.`,'w');return;}
  if(p.inj>0){notify('He is injured and cannot work out.','e');return;}
  const C=inv.camp,{grade,got,before,bump}=campRun(p,C,false);
  G.campInv=G.campInv.filter(v=>v!==inv);
  const col=grade==='A+'||grade==='A'?'var(--gd)':grade==='B'?'var(--te)':grade==='C'?'var(--mu)':'var(--rd)';
  const body=`<div style="font-size:28px;font-weight:900;color:${col}">${grade}</div><div>${p.fn} ${p.ln} at the <strong>${C.name}</strong></div>
    <div style="margin-top:6px">${got.length?`Offers: ${got.map(s=>`<span class="ob ${({FBS:'of',FCS:'oc',D2:'od',NAIA:'on',D3:'ot',JUCO:'oj'})[s.lvl]||'od'}">${s.lvl}: ${s.school}</span>`).join(' ')}`:'No offers this time.'}</div>
    <div style="margin-top:6px">${p.stars>before?`Stock up: now ${stars(p.stars)}`:bump<0?'Stock down after a rough day.':bump>0?'Scouts liked what they saw.':'Nothing changed.'}</div>`;
  addNews('offer',` Camp: ${p.fn} ${p.ln} grades ${grade}`,`${C.name}, ${got.length} offer${got.length!==1?'s':''}.`);
  _popQ=[bEvPop(' Camp Results',body,face(p.fs,56),col)];_popI=0;_popCb=()=>nav('recr');showPop();
}
function campDecline(id){G.campInv=(G.campInv||[]).filter(v=>v.id!==id);nav('recr');}
