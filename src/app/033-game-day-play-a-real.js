// ═══════════ GAME DAY: play a real game or simulate it ═══════════
// Ratings are mapped around the matchup's average so talent gaps show up clearly on the field
// (a 10-point OVR gap is about 11 engine points on every attribute, including speed).
let _gdAnchor=55;
function _gdE(v){return Math.max(30,Math.min(99,Math.round(66+((+v||50)-_gdAnchor)*1.1)));}
function _gdTop(s){if(s&&s.lite)return(s.str||55)+4;const ps=(s.fp?s.roster:(G&&s.id===G.myId?myP():sPlayers(s.id))).filter(p=>!(p.inj>0)).sort((a,b)=>b.rat-a.rat).slice(0,22);return ps.length?ps.reduce((a,p)=>a+p.rat,0)/ps.length:50;}
function _gdLum(c){const h=String(c||'#777').replace('#','');const f=h.length===3?h.split('').map(x=>x+x).join(''):h;const n=parseInt(f,16);return((n>>16&255)*.299+(n>>8&255)*.587+(n&255)*.114)/255;}
function _gdDark(c,t){const h=String(c||'#333').replace('#','');const f=h.length===3?h.split('').map(x=>x+x).join(''):h;const n=parseInt(f,16);const k=1-(t||.35);return'#'+[n>>16&255,n>>8&255,n&255].map(v=>Math.round(v*k).toString(16).padStart(2,'0')).join('');}
function gdKit(s,home){
  const c1=s.c1||'#1d3557',c2=s.c2||'#ffffff',lite=_gdLum(c1)>.62;
  const numOn=(bg,pref)=>Math.abs(_gdLum(bg)-_gdLum(pref))>.3?pref:(_gdLum(bg)>.5?'#111111':'#ffffff');
  if(home){const j=lite?c2:c1,t=lite?c1:c2;return{helmet:c1,hstripe:c2,mask:_gdLum(c2)>.5?c2:'#9aa3ad',jersey:j,trim:t,num:numOn(j,t),pants:_gdLum(c2)>.5?c2:'#d9dde2',pstripe:c1,sock:j,cleat:'#151a22',glove:t,sleeve:j};}
  const j='#f4f4f2',t=lite?c2:c1;return{helmet:c1,hstripe:c2,mask:_gdLum(c2)>.5?c2:'#9aa3ad',jersey:j,trim:t,num:numOn(j,t),pants:lite?'#d9dde2':c1,pstripe:t,sock:t,cleat:'#f4f4f4',glove:t,sleeve:j};
}
function sLogoStandalone(s,sz){
  let svg=sLogo(s,sz);const ids=[...new Set([...svg.matchAll(/(?:url\(#|href="#)([\w-]+)/g)].map(m=>m[1]))];
  let defs='';ids.forEach(id=>{const el=document.getElementById(id);if(el)defs+=el.outerHTML;});
  const i=svg.indexOf('>')+1;svg=svg.slice(0,i)+'<defs>'+defs+'</defs>'+svg.slice(i);
  if(!/xmlns=/.test(svg.slice(0,i)))svg=svg.replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"');
  return svg;
}
const GD_NEED={QB:2,RB:2,WR:5,TE:2,OL:7,DL:6,LB:4,CB:3,S:3,K:1};
const GD_WALKON=['Avery','Blake','Cody','Drew','Evan','Finn','Gage','Heath','Ian','Jett','Kade','Lane','Miles','Nash','Reid','Shane'];
let _gdTAdj=0;
// Engine's own per-position ranges (pro scale). Ratings place a player inside (or below) that range,
// so a low-rated high schooler is clearly slower and less skilled than a high-rated one.
const GD_R={QB:{spd:[72,90],str:[55,70],hands:[50,65],acc:[72,92],pow:[72,92],tkl:[30,45]},RB:{spd:[85,95],str:[62,82],hands:[60,80],tkl:[35,50],agi:[82,95]},
  WR:{spd:[85,97],str:[50,66],hands:[72,94],tkl:[30,45],agi:[80,94]},TE:{spd:[74,84],str:[70,84],hands:[66,84],tkl:[40,55]},OL:{spd:[55,64],str:[80,95],tkl:[40,55]},
  DL:{spd:[66,82],str:[78,94],tkl:[70,88]},LB:{spd:[76,88],str:[70,84],tkl:[74,92],cov:[60,78],hands:[45,65]},CB:{spd:[86,96],str:[50,64],tkl:[58,76],cov:[74,92],hands:[55,76],agi:[84,95]},
  S:{spd:[82,92],str:[60,74],tkl:[70,88],cov:[68,86],hands:[55,72]},K:{spd:[55,65],str:[45,55],kpow:[76,93],kacc:[76,93]}};
const GD_BASE={hands:[40,55],tkl:[35,50],cov:[25,40],acc:[20,40],pow:[30,50],kpow:[20,40],kacc:[20,40],agi:[60,80],spd:[60,75],str:[55,70]};
function gdPlayer(p,i){
  const _sk=p.streakGamesLeft>0?(p.streak==='hot'?4:p.streak==='cold'?-4:0):0;
  const r=(p.rat||50)+_sk,spd=atv(p,'spd')+_sk,str=atv(p,'str')+_sk,awr=atv(p,'awr')+_sk,pos=p.pos,R=GD_R[pos]||{};
  const a=k=>atv(p,k)+_sk;
  const M=(key,val)=>{const[lo,hi]=R[key]||GD_BASE[key];const q=Math.max(0,Math.min(1.05,(val-30)/60));const w=key==='spd'?24:14;return Math.max(25,Math.min(99,Math.round(lo-w+(hi-lo+w+(key==='spd'?2:0))*q+_gdTAdj)));};
  const h=(p.id||i)*2654435761>>>0,sk=faceSkinHex(p.fs!=null?p.fs:p.id),_ft=faceTraits(p.fs!=null?p.fs:p.id);
  return{mid:p.id,fs:p.fs!=null?p.fs:p.id,arch:p.arch||null,traits:(p.traits||[]).slice(),pos,pos2:p.pos2&&p.pos2!==pos?p.pos2:null,first:p.fn||'Player',last:p.ln||'',num:p.num!=null?p.num:(10+i),ht:p.ht||74,wt:p.wt||210,
    spd:M('spd',spd),str:M('str',str),agi:M('agi',a('agi')),hands:M('hands',a('cth')*.85+awr*.15),acc:M('acc',a('sac')*.85+awr*.15),pow:M('pow',a('thp')),
    tkl:M('tkl',a('tak')),cov:M('cov',(a('mcv')+a('zcv'))/2*.85+awr*.15),
    dac:M('acc',a('dac')),tup:M('acc',a('tup')),car:M('hands',a('car')),elu:M('agi',a('elu')),btk:M('str',a('btk')),cit:M('hands',a('cit')),rte:M('agi',a('rte')),jmp:M('agi',a('jmp')),
    pbk:M('str',a('pbk')),rbk:M('str',a('rbk')),pmv:M('str',a('pmv')),fmv:M('agi',a('fmv')),bsh:M('tkl',a('bsh')),hpw:M('str',a('hpw')),mcv:M('cov',a('mcv')),zcv:M('cov',a('zcv')),prs:M('cov',a('prs')),end:clamp(Math.round(a('sta')),1,99),awr:Math.max(30,Math.min(99,Math.round(40+awr*0.6+_gdTAdj))),kpow:M('kpow',a('kpw')),kacc:M('kacc',a('kac')),ovr:r,stars:p.stars>=2?Math.min(5,p.stars):0,skin:sk,
    pk:sk,hair:_ft.hc,hst:hairCat(_ft.hs),eb:_ft.eb||null,sl:h%5===3?1:h%5===4?2:0,visor:h%9===0,ls:h%2===0,band:h%7<3,eq:eqOf(p),...gdForm(p),...progGdP(p)};
}
// season form the engine uses: QBs trust sure-handed receivers, attack corners who give up yards, linemen who bury people keep doing it
function gdForm(p){const s=p.seasStats||{},e=stEff(s),o={};if(e.drop!=null&&((s.rec||0)+(s.drops||0))>=6)o.dropR=+e.drop.toFixed(3);if(e.ypgA!=null&&(s.gp||0)>=2)o.ypgA=+e.ypgA.toFixed(1);if((s.gp||0)>=2){o.pbuR=+((s.pbu||0)/s.gp).toFixed(2);if(p.pos==='OL')o.pkR=+((s.pancakes||0)/s.gp).toFixed(2);}return o;}
const GD_AFF={QB:['WR','RB','S','CB'],RB:['WR','CB','LB','S'],WR:['CB','RB','S','TE'],TE:['OL','LB','DL','WR'],OL:['DL','TE','LB'],DL:['OL','LB','TE'],LB:['S','DL','RB','TE'],CB:['S','WR','RB'],S:['CB','LB','WR'],K:['QB','WR','S','CB','RB']};
const GD_OFF=new Set(['QB','RB','WR','TE','OL']),GD_DEF=new Set(['DL','LB','CB','S']);
let _gdPc=null;
function gdTeam(s,kind,kitOv,opt){
  const isMe=!s.fp&&!!G&&s.id===G.myId,base=s.fp?s.roster.slice():(isMe?myP():s.lite?liteGameRoster(s):sPlayers(s.id)).filter(p=>!(p.inj>0)&&!(opt&&opt.only&&!opt.only.has(p.id))),jv=isMe&&!(opt&&opt.only)?G.players.filter(p=>p.sId===G.myId&&p.onJV&&!(p.inj>0)&&p.yr>=9):[];
  // v2.14 scout team for practice: the JV goes first, then varsity backups (worst first), so the JV gets real reps
  const scout=!!(opt&&opt.scout&&isMe);
  const roster=[],cnt={},uOff=new Set(),uDef=new Set(),uSp=new Set();
  const unitOf=pos=>GD_OFF.has(pos)?uOff:GD_DEF.has(pos)?uDef:uSp;
  const add=(p,pos)=>{const q=gdPlayer(Object.assign({},p,{pos}),roster.length);q.mid=p.id;roster.push(q);cnt[pos]=(cnt[pos]||0)+1;unitOf(pos).add(p.id);};
  try{ovrSyncAll();}catch(e){}
  (scout?jv.slice().sort((a,b)=>b.rat-a.rat).concat(base.slice().sort((a,b)=>a.rat-b.rat)):base.slice().sort((a,b)=>(b.id===_gdPc)-(a.id===_gdPc)||b.rat-a.rat)).forEach(p=>{if(GD_NEED[p.pos]&&(cnt[p.pos]||0)<GD_NEED[p.pos]+(scout?0:3)&&!unitOf(p.pos).has(p.id))add(p,p.pos);});
  const avg=base.length?base.reduce((a,p)=>a+p.rat,0)/base.length:45,used=new Set(roster.map(q=>q.num));
  for(const pos in GD_NEED){
    const U=unitOf(pos),need=()=>GD_NEED[pos]-(cnt[pos]||0);
    const tryList=list=>{for(const p of list.slice().sort((a,b)=>b.rat-a.rat)){if(need()<=0)return;if(U.has(p.id))continue;add(p,pos);}};
    tryList(jv.filter(p=>p.pos===pos));
    for(const ap of GD_AFF[pos]||[]){if(need()<=0)break;tryList(base.concat(jv).filter(p=>p.pos===ap));}
    let k=0;while(need()>0){let n=pos==='OL'?60+k:pos==='DL'?90+k:pos==='LB'?45+k:pos==='TE'?85+k:20+k;while(used.has(n))n++;used.add(n);
      const w=gdPlayer({id:null,pos,rat:Math.round(avg-8),fn:GD_WALKON[k%GD_WALKON.length],ln:'(walk-on)',num:n,fs:(s.id*31+k)},roster.length);w.mid=null;roster.push(w);cnt[pos]=(cnt[pos]||0)+1;k++;}
  }
  // your depth chart's starters start on Game Day too (your own career player follows his playing time instead)
  if(isMe&&!scout)try{const n={};for(const p of getStarters(G.myId)){const i=n[p.pos]=(n[p.pos]||0)+1;if(p.id===_gdPc)continue;const q=roster.find(x=>x.mid===p.id&&x.pos===p.pos);if(q)q.dep=i-1;}}catch(e){}
  const kk=roster.filter(q=>q.pos==='K').sort((a,b)=>b.ovr-a.ovr)[0];if(kk)roster.push(Object.assign({},kk,{pos:'P'}));
  for(const q of roster){try{q.eq=eqResolve(q.eq,s);}catch(e){q.eq=null;}if(q.pos==='QB'){q.eq=q.eq||{};q.eq.noGlove=true;q.eq.glove=null;}if(q.eb&&q.eb!=='none'){q.eq=q.eq||{};q.eq.eb=q.eb;}}
  const u=kitOv||uniOf(s,kind),kit=Object.assign({glove:u.trim,sleeve:u.jersey},u);
  for(const q of roster){q.eq=q.eq||{};q.eq.helm={shell:u.hShell||'gloss',stripe:u.hStripe||'team',mask:''};}
  if(u.shoulder&&u.shoulder!=='none')for(const q of roster){q.eq=q.eq||{};q.eq.shoulder={mode:u.shoulder,c:u.shoulderC||u.trim};}
  const pack={helmet:kit.helmet,helmetStripe:kit.hstripe,helmetLogo:kit.hstripe,facemask:kit.mask,jersey:kit.jersey,jerseyTrim:kit.trim,pants:kit.pants,pantsStripe:kit.pstripe,belt:'#1d1d22',socks:kit.sock,sockStripe:kit.trim,cleats:kit.cleat,cleatAccent:kit.trim,gloves:kit.glove,number:kit.num,numberTrim:_gdLum(kit.jersey)>.6?null:'#f4f4f4',armSleeve:'skin'};
  const logo=sLogoStandalone(s,100),inner=logo.slice(logo.indexOf('>')+1,logo.lastIndexOf('</svg>')),c1=s.c1||'#1d3557';
  let pb=null,dpb=null,coachSkin='#c68a5e';try{pb=pbForTeam(s,'off');dpb=pbForTeam(s,'def');}catch(e){}
  try{coachSkin=!s.fp&&G&&s.id===G.myId&&G.coach&&G.coach.look&&G.coach.look.ti!=null?FACE_SKIN[G.coach.look.ti]:faceSkinHex((s.id||1)*13+5);}catch(e){}
  return{pb,dpb,coachSkin,rec:(s.wins||s.losses)?`${s.wins||0}-${s.losses||0}`:'',city:s.name.replace(/\s+High.*$/,''),name:s.mascot,abbr:(s.abbr||s.name.slice(0,3)).toUpperCase().slice(0,4),kit,pack,hud:'linear-gradient(180deg,'+c1+','+_gdDark(c1,.35)+')',players:roster,logoInner:inner,logoUrl:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(logo)};
}
function gdOppKind(opp,myKind,me){const mj=uniOf(me||myS(),myKind).jersey,h=uniOf(opp,'home').jersey,a=uniOf(opp,'away').jersey;return Math.abs(_gdLum(h)-_gdLum(mj))>=Math.abs(_gdLum(a)-_gdLum(mj))?'home':'away';}
function gdPickUni(k){window._gdUni=k;document.querySelectorAll('.gd-uni').forEach(b=>b.classList.toggle('on',b.dataset.k===k));}
// the score bug shows a ranked team's national rank, or its rank in its state classification when not nationally ranked
function hcLine(){return`<div style="font-size:12px;margin-top:6px;color:var(--gd);font-weight:800;text-align:center">Homecoming week: a packed house, the parade and the court at halftime</div>`;}
function gdRankOf(s){const k=rkOf(s.id);return k.n&&k.n<=25?k.n:k.c&&k.c<=25?k.c:0;}
let _gdCtx=null;
function gdChoose(kind,info,simFn){
  if(ccOn()){notify('Your player is in college now: the high school season plays out in the background.','w');return;}
  const opp=info.opp,me=myS();if(!opp||window._gdAutoSim){simFn();return;}
  const pa=pcAuto();
  if(pa){ // Player Career: the staff runs practice and picks the uniform; a game your player can't play in is simulated
    if(kind==='reg'||kind==='po')try{if(pracAvailable())pracSimRows();}catch(e){console.error('practice',e);}
    const pp=pcActive();if(!pp||pp.inj>0){simFn();return;}
    let hi=0;if(kind==='reg'){const gm=G.sched[info.idx];hi=gm&&((gm.wk+G.myId)%2===1)?1:0;}else if(kind==='po')hi=(G.wins||0)>=(opp.wins||0)?0:1;window._gdUni=hi?'away':'home';}
  window._gdSim=simFn;window._gdInfo={kind,info};
  openMo(`<div style="text-align:center;padding:6px 4px 2px">
    <div style="font-size:13px;color:var(--mu);margin-bottom:10px">${info.label||''}</div>
    <div style="display:flex;align-items:center;justify-content:center;gap:18px;margin-bottom:16px">
      <div style="text-align:center">${sLogo(me,64)}<div style="font-weight:800;margin-top:4px">${me.mascot}</div></div>
      <div style="font-weight:900;font-size:22px;color:var(--mu)">VS</div>
      <div style="text-align:center">${sLogo(opp,64)}<div style="font-weight:800;margin-top:4px">${opp.mascot}</div></div></div>
    ${(()=>{let hi=0;if(kind==='reg'){const gm=G.sched[info.idx];hi=gm&&((gm.wk+G.myId)%2===1)?1:0;}else hi=(G.wins||0)>=(opp.wins||0)?0:1;const H=hi?opp:me,si=stadInfo(stadOf(H));if(kind==='nat')return`<div style="font-size:12px;color:var(--mu);margin:-6px 0 12px">Neutral site · ${(G.natl&&G.natl.venue)||'National Championship'}</div>`;if(kind==='po'&&info.slot&&poRoundName(info.slot.playoffRound)==='State Final')return`<div style="font-size:12px;color:var(--gd);font-weight:800;margin:-6px 0 12px">State Final · neutral site · ${stateFinalVenue()}</div>`;if(kind==='reg'&&G.sched[info.idx]&&G.sched[info.idx].isRivalry)return rivalryWeekHtml(opp)+(hcIs(G.sched[info.idx].wk)?hcLine():'')+`<div style="height:8px"></div>`;if(kind==='reg'&&G.sched[info.idx]&&hcIs(G.sched[info.idx].wk))return hcLine()+`<div style="height:8px"></div>`;return`<div style="font-size:12px;color:var(--mu);margin:-6px 0 12px">${hi?'Away':'Home'} game · ${si.name} (tier ${si.tier})</div>`;})()}
    ${(()=>{const w=gdWxFor(kind,info);return w?`<div class="gd-wx">${wxIcon(w,22)}<div><b>${wxLine(w)}</b><div>${wxEffects(w)}</div></div></div>`:'';})()}
    ${pa?'':`<div style="font-size:12px;font-weight:800;color:var(--mu);margin-bottom:6px">Your uniform</div>
    <div style="display:flex;gap:8px;justify-content:center;margin-bottom:14px">${[['home','Home'],['away','Away'],['alt','Alternate']].map(([k,l])=>`<button class="gd-uni${(window._gdUni||'home')===k?' on':''}" data-k="${k}" onclick="gdPickUni('${k}')">${uniSvg(uniOf(me,k),(myP()[0]||{}).num,54)}<span>${l}</span></button>`).join('')}</div>
    <div style="font-size:12px;font-weight:800;color:var(--mu);margin-bottom:6px">How do you want to play?</div>
    <div class="gd-modes" style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-bottom:14px">${[['all','Full game','You play every snap'],['coach','Coach mode','You call plays, the team runs them'],['off','Offense only','Defense drives are simmed'],['def','Defense only','Offense drives are simmed']].map(([k,l,d])=>`<button class="gd-uni gd-mode${(window._gdMode||'all')===k?' on':''}" data-k="${k}" onclick="window._gdMode='${k}';document.querySelectorAll('.gd-mode').forEach(b=>b.classList.toggle('on',b.dataset.k==='${k}'))" style="padding:8px 12px;min-width:120px"><span style="font-weight:900">${l}</span><small style="display:block;font-size:10px;opacity:.75;font-weight:600">${d}</small></button>`).join('')}</div>`}
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
      <button class="btn bgn" style="min-width:180px;font-size:16px" onclick="clo();gdStart()">Play Game</button>
      <button class="bgh" style="min-width:180px;font-size:16px" onclick="clo();window._gdSim&&window._gdSim()">Simulate</button></div>
    <div style="font-size:11px;color:var(--mu);margin-top:12px">${pa?'Play it as your player (the coach calls the plays), or let the sim decide.':'Play it yourself with your real roster, or let the sim decide.'}</div></div>`);
}
function gdStart(){
  const ctx=window._gdInfo;if(!ctx)return;const opp=ctx.info.opp,me=myS();_gdCtx=ctx;
  const mk=window._gdUni||'home';
  _gdPc=G.pcLock&&pcActive()?G.myPlayerId:null;
  let homeIdx=0;
  if(ctx.kind==='reg'){const gm=G.sched[ctx.info.idx];homeIdx=gm&&((gm.wk+G.myId)%2===1)?1:0;}else homeIdx=(G.wins||0)>=(opp.wins||0)?0:1;
  const H=homeIdx?opp:me;
  const _o1=_gdTop(me),_o2=_gdTop(opp);_gdAnchor=(_o1+_o2)/2;
  // team strength on top of individual ratings: every player of the better team gets a bump, the weaker team a drop
  _gdTAdj=Math.round((_o1-_gdAnchor)*0.5+clamp(progEdge()*0.6,-3,3));const _t1=Object.assign(gdTeam(me,mk),{ovr:Math.round(_o1)});
  _gdTAdj=Math.round((_o2-_gdAnchor)*0.5);const _t2=Object.assign(gdTeam(opp,gdOppKind(opp,mk)),{ovr:Math.round(_o2)});_gdTAdj=0;
  try{_t1.rk=gdRankOf(me);_t2.rk=gdRankOf(opp);}catch(e){}
  const _mer=(()=>{try{return mercyOn()?35:0;}catch(e){return 0;}})();
  if(G.role==='OC')window._gdMode='off';else if(G.role==='DC')window._gdMode='def';
  const _fmt=ctx.kind==='s7'?11:clsFmt(me.cls||G.cls);
  window.__GP={mercy:_mer,mode:window._gdMode||'all',rival:(()=>{try{return ctx.kind==='reg'&&!!(G.sched[ctx.info.idx].isRivalry||isRivalry(G.myId,opp.id));}catch(e){return false;}})(),big:ctx.kind!=='reg',teams:[_t1,_t2],home:homeIdx,weather:gdWxFor(ctx.kind,ctx.info),stadium:stadInfo(stadOf(H),H.stadC,H),ez:_gdDark(H.c1||'#1c3766',.25),ezText:_gdLum(H.c2||'#fff')>.35?(H.c2||'#ffffff'):'#ffffff'};
  try{window.__GP.previewHtml=gdPreviewHtml(me,opp,homeIdx);}catch(e){console.error(e);}
  if(_fmt<11){window.__GP.fmt=_fmt;window.__GP.previewHtml=(window.__GP.previewHtml||'')+`<div style="text-align:center;font-weight:800;margin-top:6px">${fmtName(_fmt)[0].toUpperCase()+fmtName(_fmt).slice(1)} football: ${_fmt} players a side</div>`;}
  try{if(ctx.kind==='po'&&ctx.info.slot&&poRoundName(ctx.info.slot.playoffRound)==='State Final'){const v=stateFinalVenue();window.__GP.stadium=Object.assign(stadInfo(20,null,H),{name:v,logo:'logo'});window.__GP.neutral=true;window.__GP.midLogoUrl=stateFinalLogoUrl();window.__GP.previewHtml=(window.__GP.previewHtml||'')+`<div style="text-align:center;font-weight:800;margin-top:6px">State Final · neutral site · ${v}</div>`;}}catch(e){}
  try{if(window.__GP.rival)window.__GP.previewHtml=(window.__GP.previewHtml||'')+rivalryWeekHtml(opp);}catch(e){}
  try{if(ctx.kind==='reg'&&hcIs(G.sched[ctx.info.idx].wk)){window.__GP.big=true;window.__GP.previewHtml=(window.__GP.previewHtml||'')+hcLine();}}catch(e){}
  if(ctx.kind==='s7'&&G.s7){_gdTAdj=0;window.__GP.sevens=true;window.__GP.s7q=G.s7.qn===1?1:2;window.__GP.big=true;window.__GP.teams[0]=Object.assign(gdTeam(me,mk,null,{only:new Set(G.s7.picks)}),{ovr:Math.round(_o1)});window.__GP.previewHtml='';}
  try{pcGP(ctx);}catch(e){console.error('player career',e);}
  gdLaunch();
}
// v2.16: closing Game Day frees the whole engine first (blank frame, no references), so a phone low on memory does not reload the page
function gdTeardown(){try{clearInterval(window._gdWatch);}catch(e){}try{const f=document.getElementById('gd-if');if(f&&f.contentWindow&&f.contentWindow.__gpSndStop)f.contentWindow.__gpSndStop();}catch(e){}const ov=document.getElementById('gd-ov');if(!ov)return;const f=ov.querySelector('iframe');
  try{if(f&&f.contentWindow){try{f.contentWindow.__G=null;}catch(e){}f.src='about:blank';}}catch(e){}try{if(f)f.remove();}catch(e){}ov.remove();window.__GP=null;}
// v2.16 sound: the audio starts from the tap or click that opens Game Day. By default the game's sound mixes with the player's own
// music (Spotify, Apple Music, a video): the ambient audio session, no media element. With "Let other apps keep playing music" off,
// iOS plays it through the speaker even with the ringer switch on silent (media playback, which pauses other apps)
function gpAudioUnlock(){
  if(gpAudioMode())return;
  try{if(navigator.audioSession&&navigator.audioSession.type!=='playback')navigator.audioSession.type='playback';}catch(e){}
  try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;if(!window.__GPAC)window.__GPAC=new AC({latencyHint:'interactive'});if(window.__GPAC.state!=='running')window.__GPAC.resume().catch(()=>{});}catch(e){}
  // older iOS: a silent media element in a loop moves the page to the playback audio session
  try{if(!window.__GPSIL){const a=new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=');a.loop=true;a.volume=0.01;a.setAttribute('playsinline','');window.__GPSIL=a;}
    const p=window.__GPSIL.play();if(p&&p.catch)p.catch(()=>{});}catch(e){}
}
addEventListener('pointerdown',gpAudioUnlock,{passive:true});addEventListener('keydown',gpAudioUnlock);
function gdLaunch(){
  try{gpAudioUnlock();}catch(e){}
  try{if(window.__GP){const cs=getComputedStyle(document.documentElement),v=k=>cs.getPropertyValue(k).trim();window.__GP.ui={tA:v('--tA')||'#d8443a',tB:v('--tB')||'#8c2019',tRGB:v('--tRGB')||'140,32,25',tOn:v('--tOn')||'#fff',light:document.documentElement.classList.contains('light')};}}catch(e){}
  // v2.16: a career game saves first, so a crash or reload during or right after the game never costs more than that game
  // the frame is only built once that save is written, so the save and the game never use memory at the same time
  let sv=null;try{if(_gdCtx&&!['prac','free','online'].includes(_gdCtx.kind)&&typeof G!=='undefined'&&G&&G.myId&&gdsMain().autosave!==false)sv=_svBusy&&_svP?_svP.then(()=>saveGame(true)):saveGame(true);}catch(e){}  // a running autosave is waited for, then this one is written
  if(sv&&sv.then){const ld=document.getElementById('loading-screen');try{if(ld){document.getElementById('loading-label').textContent='Saving before kickoff…';ld.classList.add('active');}}catch(e){}
    let done=false;const go=()=>{if(done)return;done=true;try{if(ld)ld.classList.remove('active');}catch(e){}gdLaunchFrame();};sv.then(go,go);setTimeout(go,10000);return;}
  gdLaunchFrame();
}
// end zone lettering in the stadium's font: the letter outlines go to the engine with the game (they work offline)
function gdEzGlyphs(P){if(!P)return;const k=P.stadium&&P.stadium.ezFont;delete P.ezGlyphs;if(!k||k==='std')return;
  const T=k==='script'?_LG_S:_LG_V,H=P.teams&&P.teams[P.home||0];if(!H||!T)return;const s=String(H.name||'')+' '+String(H.city||''),g={' ':T[' ']||[30,'']};
  for(const c of s.toUpperCase()+s.toLowerCase())if(T[c])g[c]=T[c];P.ezGlyphs={k,g};}
function gdLaunchFrame(){
  try{gdEzGlyphs(window.__GP);}catch(e){}
  let ov=document.getElementById('gd-ov');if(ov)gdTeardown();
  ov=document.createElement('div');ov.id='gd-ov';
  ov.innerHTML=`<iframe id="gd-if" title="Game Day" allow="autoplay; web-share; fullscreen"></iframe>`;
  document.body.appendChild(ov);
  const src=document.getElementById('gd-src');if(!src){notify('Game Day is missing from this file','e');ov.remove();return;}
  const BS=String.fromCharCode(92),html=src.textContent.split('<'+BS+'/').join('</').split('<'+BS+'!--').join('<'+'!--');
  const f=document.getElementById('gd-if');window._gdErr=null;
  // write the game straight into the frame (more reliable on iOS/Safari than a huge srcdoc attribute)
  try{const w=f.contentWindow,d=f.contentDocument||w.document;d.open();try{w.onerror=function(m){window._gdErr=String(m);};}catch(e){}d.write(html);d.close();}
  catch(e){window._gdErr=e.message;try{f.srcdoc=html;}catch(_){}}
  // slow laptops and Chromebooks can take well over 12 seconds to start the engine: keep waiting while the frame is still loading
  clearInterval(window._gdWatch);const t0=Date.now();
  window._gdWatch=setInterval(()=>{let ok=false,ready=false;try{ok=!!(f.contentWindow&&f.contentWindow.__G);ready=!!(f.contentDocument&&f.contentDocument.readyState==='complete');}catch(e){}
    if(ok||!document.getElementById('gd-ov')||document.getElementById('gd-if')!==f){clearInterval(window._gdWatch);return;}
    const el=Date.now()-t0;
    if((ready&&el>30000)||el>75000){clearInterval(window._gdWatch);gdFail(window._gdErr||'The game engine did not load.');}},1000);
}
// ── v1.95 title screen: live touchdown clips from the real Game Day engine play behind the menu ──
function ttDemoOn(){
  const T=document.getElementById('title');if(!T||document.getElementById('tt-demo'))return;
  try{if(gdsMain().gfx==='fast'||((IS_LOWEND||(navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory||8)<=4)&&gdsMain().gfx!=='high'))return;}catch(e){}
  try{if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;}catch(e){}
  const src=document.getElementById('gd-src');if(!src)return;
  const f=document.createElement('iframe');f.id='tt-demo';f.setAttribute('data-demo','1');f.setAttribute('aria-hidden','true');f.tabIndex=-1;f.title='Touchdown highlights';
  const sh=document.createElement('div');sh.id='tt-demo-sh';
  T.insertBefore(sh,T.firstChild);T.insertBefore(f,T.firstChild);
  const BS=String.fromCharCode(92),html=src.textContent.split('<'+BS+'/').join('</').split('<'+BS+'!--').join('<'+'!--');
  try{const w=f.contentWindow,d=f.contentDocument||w.document;d.open();d.write(html);d.close();}catch(e){try{f.srcdoc=html;}catch(_){}}
}
function ttDemoOff(){const f=document.getElementById('tt-demo');if(f){try{f.contentWindow.__G.demo=null;}catch(e){}f.remove();}const s=document.getElementById('tt-demo-sh');if(s)s.remove();}
window.addEventListener('message',e=>{const m=e.data&&e.data.gdDemo;if(!m)return;if(m==='off'){ttDemoOff();return;}const f=document.getElementById('tt-demo');if(f)f.style.opacity=m==='clip'?'1':'0';const s=document.getElementById('tt-demo-sh');if(s)s.style.opacity=m==='clip'?'1':'0';});
(function(){const T=document.getElementById('title');if(!T)return;const sync=()=>{if(T.classList.contains('hid'))ttDemoOff();else setTimeout(()=>{if(!T.classList.contains('hid'))ttDemoOn();},400);};
  new MutationObserver(sync).observe(T,{attributes:true,attributeFilter:['class']});if(document.readyState==='complete')sync();else window.addEventListener('load',sync);})();
function gdFail(msg){
  const ov=document.getElementById('gd-ov');if(ov)ov.remove();const ctx=_gdCtx;_gdCtx=null;window._gdRetryCtx=ctx;
  if(ctx&&ctx.kind==='online'){openMo(`<div style="text-align:center;padding:8px"><div style="font-weight:900;font-size:18px;margin-bottom:8px">The online game could not start</div><div style="font-size:13px;color:var(--mu);margin-bottom:14px">${String(msg).replace(/</g,'&lt;')}</div><button class="btn" onclick="clo();olAfterGame()">Back to Online Play</button></div>`);return;}
  openMo(`<div style="text-align:center;padding:8px"><div style="font-weight:900;font-size:18px;margin-bottom:8px">Game Day could not start</div><div style="font-size:13px;color:var(--mu);margin-bottom:14px">${String(msg).replace(/</g,'&lt;')}</div><div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap"><button class="btn" onclick="clo();if(window._gdRetryCtx&&window.__GP){_gdCtx=window._gdRetryCtx;gdLaunchFrame();}">Try again</button><button class="btn bgn" onclick="clo();window._gdSim&&window._gdSim()">Simulate this game instead</button></div><div style="font-size:11px;color:var(--mu);margin-top:10px">Tip: close other tabs, or set Settings → Graphics to Fast on older laptops and Chromebooks.</div></div>`);
}
window.gdSaveFile=function(name,data){_fileSave(name,data);};
function gdSimRest(){const f=document.getElementById('gd-if');try{f.contentWindow.gpSimRest();}catch(e){notify('Could not simulate: '+e.message,'e');}}
function gdConv(st){const o={passYds:0,passTD:0,passInt:0,rushYds:0,rushTD:0,recYds:0,recTD:0,tackles:0,sacks:0,ints:0};const m={passAtt:'passAtt',passCmp:'passCmp',passYds:'passYds',passTD:'passTD',passInt:'passInt',rushAtt:'rushAtt',rushYds:'rushYds',rushTD:'rushTD',rec:'rec',recYds:'recYds',recTD:'recTD',tackles:'tackles',sacks:'sacks',ints:'ints',fga:'fga',fgm:'fgm',xpa:'xpa',xpm:'xpm',krRet:'krRet',krYds:'krYds',krTD:'krTD',drops:'drops',pbu:'pbu',tgtA:'tgtA',ydsA:'ydsA',pancakes:'pancakes',sacksA:'sacksA',tfl:'tfl',yac:'yac',safeties:'safeties',prRet:'prRet',prYds:'prYds',prTD:'prTD',cmpA:'cmpA'};for(const k in st)if(m[k])o[m[k]]=st[k];return o;}
window.gdFinish=function(res){
  try{res=JSON.parse(JSON.stringify(res));}catch(e){}   // a copy that does not keep the game frame alive
  try{pcAfterGame(res,_gdCtx);}catch(e){console.error('player career',e);}
  try{interviewMaybe(res,_gdCtx);}catch(e){}
  setTimeout(()=>{
    gdTeardown();
    const ctx=_gdCtx;_gdCtx=null;if(!ctx)return;
    if(ctx.kind==='online'){olFinish(res);return;}
    if(ctx.kind==='col'){ccGdDone(res,ctx);return;}
    if(ctx.kind==='free'){fpFinish(res,ctx);return;}
    if(ctx.kind==='prac'&&ctx.mode==='tut'){tutFinish(res);return;}
    if(ctx.kind==='prac'){res.pracMode=ctx.mode;pracFinish(res);return;}
    if(ctx.kind==='s7'){let a=res.score[0],b=res.score[1];if(a===b){if(Math.random()<.5)a+=7;else b+=7;}nav('dash');s7Record(a,b);return;}
    let my=res.score[0],op=res.score[1];if(my===op){if(Math.random()<.5)my+=3;else op+=3;}
    const mine={},theirs={};
    (res.played||[]).forEach(mid=>{const p=getP(+mid);if(!p)return;const st=gdConv((res.stats||{})[mid]||{});(p.sId===G.myId?mine:theirs)[p.id]=st;});
    const opp=ctx.info.opp;
    const apply=()=>{window._gdOppStats={sid:opp.id,sm:theirs};
      try{
        if(ctx.kind==='reg'){G.phase='regular';simGame(ctx.info.idx,false,{my,opp:op,sm:mine});nav('dash');const g=G.sched[ctx.info.idx];if(!_popQ.length)notify(`Week ${g.wk}: ${g.result==='W'?'Victory!':'Defeat'} ${g.my}-${g.opp}`);}
        else if(ctx.kind==='nat'){natResolve({my,opp:op,sm:mine});}
        else{_doAdvPlayoffWeek(ctx.info.slot,opp,{my,opp:op,sm:mine});}
      }finally{window._gdOppStats=null;}};
    // the stat recap always follows the game, after any pop-ups are dismissed (a failure in the season update never blocks it)
    try{splitsAdd(res.splits&&res.splits[0]);}catch(e){}
    const box=()=>{try{const h=gdBoxHtml({stats:res.stats,score:[my,op],splits:res.splits,xp:_glXP.slice()},myS(),opp);let tries=0;const tryShow=()=>{const pu=document.getElementById('pu'),mo=document.getElementById('mo'),busy=(pu&&pu.classList.contains('open'))||(mo&&mo.classList.contains('open'));if(busy&&tries++<600){setTimeout(tryShow,500);return;}openMo(h);};setTimeout(tryShow,350);}catch(e){console.error(e);}};
    const run=()=>{try{apply();}catch(e){console.error('post-game update',e);}try{if(gdsMain().autosave!==false){_autoKey=G.yr+'|'+G.phase+'|'+G.week+'|'+(G.osPhase||0);setTimeout(()=>saveGame(true),250);}}catch(e){}box();};
    try{showLoading(`Final: ${myS().mascot} ${my}, ${opp.mascot} ${op}`,myS(),8,run);}catch(e){run();}
  },60);
};
// v2.14 play-call splits: how often each call was run and what it gained (offense), what each coverage gave up (defense)
function splitsAdd(sp){
  if(!sp||!G)return;if(!G.pSplits||G.pSplits.yr!==G.yr)G.pSplits={yr:G.yr,g:0,o:{},d:{}};const S=G.pSplits;S.g++;
  for(const k of['o','d'])for(const n in sp[k]||{}){const a=sp[k][n],b=S[k][n]||(S[k][n]={n:0,yds:0,td:0});b.n+=a.n||0;b.yds+=a.yds||0;b.td+=a.td||0;if(a.fd)b.fd=(b.fd||0)+a.fd;if(a.to)b.to=(b.to||0)+a.to;if(a.k)b.k=a.k;}
}
function splitsHtml(sp,title){
  if(!sp)return'';const row=(n,a,def)=>`<tr><td style="text-align:left">${n}${a.k?` <span style="color:var(--mu);font-size:10px">${a.k}</span>`:''}</td><td>${a.n}</td><td>${(a.yds/a.n).toFixed(1)}</td><td>${a.yds}</td><td>${a.td||0}</td><td>${def?(a.to||0):(a.fd||0)}</td></tr>`;
  const sec=(k,lbl,def)=>{const L=Object.entries(sp[k]||{}).sort((a,b)=>b[1].n-a[1].n);if(!L.length)return'';
    return`<div class="bx-h">${lbl}</div><div style="overflow-x:auto"><table style="width:100%;font-size:12px"><thead><tr><th style="text-align:left">Call</th><th>Runs</th><th>Avg</th><th>Yds</th><th>TD</th><th>${def?'TO':'1st'}</th></tr></thead><tbody>${L.map(([n,a])=>row(n,a,def)).join('')}</tbody></table></div>`;};
  const h=sec('o','Offense: Plays run',false)+sec('d','Defense: What each call gave up',true);
  return h?`<div class="bx-sub">${title}</div>${h}`:'';
}
function gdBoxHtml(res,me,opp){
  const rows={0:[],1:[]};
  for(const mid in(res.stats||{})){const p=getP(+mid);if(!p)continue;const t=p.sId===me.id?0:p.sId===opp.id?1:-1;if(t<0)continue;rows[t].push({p,s:res.stats[mid]});}
  const sec=(t,title,f,line)=>{const L=rows[t].filter(r=>f(r.s)).sort((a,b)=>line(b.s)[0]-line(a.s)[0]).slice(0,4);if(!L.length)return'';
    return`<div class="bx-h">${title}</div>`+L.map(r=>`<div class="bx-r"><span>#${r.p.num} ${r.p.fn[0]}. ${r.p.ln} <i>${r.p.pos}</i></span><b>${line(r.s)[1]}</b></div>`).join('');};
  const col=(t,s)=>`<div class="bx-col" style="--tA:${_hx(s.c1)?s.c1:'#33415c'}"><div class="bx-team">${sLogo(s,30)}${s.mascot}</div>
    ${sec(t,'Passing',x=>x.passAtt,x=>[x.passYds||0,`${x.passCmp||0}/${x.passAtt} (${Math.round((x.passCmp||0)/x.passAtt*100)}%) · ${x.passYds||0} yds · ${x.passTD||0} TD${x.passInt?' · '+x.passInt+' INT':''}`])}
    ${sec(t,'Rushing',x=>x.rushAtt,x=>[x.rushYds||0,`${x.rushAtt} car · ${x.rushYds||0} yds · ${((x.rushYds||0)/x.rushAtt).toFixed(1)} avg${x.rushTD?' · '+x.rushTD+' TD':''}`])}
    ${sec(t,'Receiving',x=>x.rec||x.drops,x=>[x.recYds||0,`${x.rec||0} rec · ${x.recYds||0} yds${x.rec?' · '+((x.recYds||0)/x.rec).toFixed(1)+' avg':''}${x.yac?' · '+x.yac+' YAC':''}${x.recTD?' · '+x.recTD+' TD':''}${x.drops?' · '+x.drops+' drop'+(x.drops>1?'s':''):''}`])}
    ${sec(t,'Kick returns',x=>x.krRet,x=>[x.krYds||0,`${x.krRet} ret · ${x.krYds||0} yds · ${((x.krYds||0)/x.krRet).toFixed(1)} avg${x.krTD?' · '+x.krTD+' TD':''}`])}
    ${sec(t,'Punt returns',x=>x.prRet,x=>[x.prYds||0,`${x.prRet} ret · ${x.prYds||0} yds · ${((x.prYds||0)/x.prRet).toFixed(1)} avg${x.prTD?' · '+x.prTD+' TD':''}`])}
    ${sec(t,'Defense',x=>x.tackles||x.sacks||x.ints||x.pbu||x.tfl||x.safeties,x=>[(x.tackles||0)+(x.sacks||0)*3+(x.tfl||0)*2+(x.ints||0)*4+(x.pbu||0)*2+(x.safeties||0)*4,`${x.tackles||0} tkl${x.tfl?' · '+x.tfl+' TFL':''}${x.sacks?' · '+x.sacks+' sack':''}${x.ints?' · '+x.ints+' INT':''}${x.pbu?' · '+x.pbu+' PBU':''}${x.safeties?' · '+x.safeties+' safety':''}`])}
    ${sec(t,'Coverage',x=>x.tgtA,x=>[x.ydsA||0,`${x.cmpA||0}/${x.tgtA} allowed · ${x.ydsA||0} yds${x.pbu?' · '+x.pbu+' PBU':''}`])}
    ${sec(t,'Blocking',x=>x.pancakes||x.sacksA,x=>[(x.pancakes||0)*2-(x.sacksA||0)*3,`${x.pancakes||0} pancake${(x.pancakes||0)===1?'':'s'}${x.sacksA?' · '+x.sacksA+' sack'+(x.sacksA>1?'s':'')+' allowed':''}`])}
    ${sec(t,'Kicking',x=>x.fga||x.xpa,x=>[x.fgm||0,`FG ${x.fgm||0}/${x.fga||0} · XP ${x.xpm||0}/${x.xpa||0}`])}</div>`;
  const xpL=(res.xp||[]).filter(r=>r.xp>0).sort((a,b)=>b.xp-a.xp).slice(0,8);
  const xpH=xpL.length?`<div class="bx-h">XP earned (10 XP = 1 skill point)</div><div class="bx-xp">${xpL.map(r=>`<span>${r.p.fn[0]}. ${r.p.ln} <b style="color:var(--te)">+${r.xp}</b>${r.sp?` <b style="color:var(--gn)">+${r.sp} SP</b>`:''}</span>`).join('')}</div>`:'';
  const fin=(s,i)=>{const c=_hx(s.c1)?s.c1:'#33415c',w=res.score[i]>res.score[1-i];return`<div class="bx-f${i?' bx-f2':''}${w?' won':''}" style="background:${c};color:${_lm(c)>.55?'#111113':'#fff'}">${sLogo(s,40)}<span class="bx-fn">${s.mascot}</span><span class="bx-fs">${res.score[i]}</span></div>`;};
  return`<div class="bx"><div class="bx-top"><span>Final</span>Box score</div><div class="bx-fin">${fin(me,0)}${fin(opp,1)}</div><div class="bx-note">These stats were added to every player's season and career totals.</div>
    <div class="bx-cols">${col(0,me)}${col(1,opp)}</div>${splitsHtml(res.splits&&res.splits[0],'This game: your play calls')}${xpH}<div style="text-align:right;margin-top:12px"><button class="btn" onclick="clo()">Done</button></div></div>`;
}

