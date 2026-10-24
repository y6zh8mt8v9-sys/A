// ═══════════ GRIDIRON AI v2, on-device career engine (no network, no API key) ═══════════
// Base rates: ~1.5% of draft-eligible college players are drafted (nearly all FBS); 7 rounds / ~257 picks;
// average NGL career ~3.3 years (drafted ~5-6, first-rounders ~9); RB careers shortest, QB/K longest.
const AI_VER=2;
const AI_NGL=['Crestfield Comets','Bayport Admirals','Iron City Forge','Lakeshore Storm','Summit Avalanche','Granite Quarrymen','Cascadia Timberwolves','Aurora Huskies','Kaimana Surf','Coralina Barracudas','Magnolia Monarchs','Acadia Bayou Kings','Cumberland Miners','Llano Grande Stampede','Tierra Alta Scorpions','Wakota Twisters','Capital City Senators','Riverton Rapids','Silver Lake Sentinels','Mesa Rattlers','Harbor City Anchors','Pine Valley Lumberjacks','Red Rock Outlaws','Gulf Coast Tarpons','Prairie Stallions','Midland Mustangs','Steel Valley Ironmen','Desert Sidewinders','Highland Pioneers','Bluewater Navigators','Twin Rivers Kingfishers','Northgate Knights'];
const AI_SFL=['Bayport Blaze','Riverton Rivermen','Capital City Guardians','Pine Valley Grizzlies','Harbor City Hammers','Silver Lake Saber-tooths','Red Rock Wranglers','Northgate Nighthawks'];
const AI_MGL=['Westshore Orcas','Foothill Stallions','Plains Harvesters','Lakehead Voyageurs','Bay of Pines Loons','Riverside Steelmen','Lakeport Lancers','Capital Rideau Rangers','Old Port Royals'];
const AI_CONF={'Southern Athletic':['Llano Grande','Summit Mines','Cascadia State','Summit','Magnolia','Wakota Tech','Cumberland','Acadia State','Acadia Tech','Wakota State','Llano Grande A&M','Llano Grande Tech','Tierra Alta','Crestfield','Crestfield State','Canadian'],'Great Lakes':['Western Llano Grande','Coralina Tech','Crestfield Tech','East Coralina','Cascadia','Ormsby University','Eastern Magnolia','Summit State','Northern Llano Grande','Coralina','Acadia','Wakota','Southern Cascadia','Western Cumberland','Shelton University','Magnolia State','Cumberland Tech','Tierra Alta State'],'Plains Twelve':['Granite','Harrington University','Wickham University','Southern Crestfield','Hereford State','Beckett University','Salado State','Central Tierra Alta','Milford State','Brookhaven University','Eastern Llano Grande','Winslow University','Ainsworth University','Beeville Christian','Cascadia Tech','Ranger Christian'],'Atlantic Coast League':['Junction','Haskell','Coralina State','Mason State','Magnolia A&M','Rockford','Northam University','Cumberland State','South Acadia','Langford University','Benton State','Western Crestfield','Borger State','Spearman Christian','Shelbyville','North Summit','Ganado'],Independent:['Llano Grande State']};
// v2.12: with 27 FBS programs, the top 14 form two power conferences of 7 (like the real Power Four share); the other 13 are the rest of FBS
{const old={};for(const c in AI_CONF)AI_CONF[c].forEach(n=>{old[n]=c;});const top=D1FBS.slice(0,14),N={'Southern Athletic':[],'Great Lakes':[]};
  for(const n of top){const c=old[n];const tgt=(c==='Southern Athletic'||c==='Great Lakes')&&N[c].length<7?c:(N['Southern Athletic'].length<=N['Great Lakes'].length?'Southern Athletic':'Great Lakes');N[tgt].push(n);}
  for(const c in AI_CONF)delete AI_CONF[c];Object.assign(AI_CONF,N);}
const AI_P4={};for(const c in AI_CONF)AI_CONF[c].forEach(s=>{AI_P4[s]=c;});
const AI_CONF_BASE=JSON.parse(JSON.stringify(AI_CONF));
// v2.14: League Setup can rename or replace the FBS list; the top 14 split into the two power conferences again
function aiConfRebuild(){const old={};for(const c in AI_CONF_BASE)AI_CONF_BASE[c].forEach(n=>{old[n]=c;});const N={'Southern Athletic':[],'Great Lakes':[]};
  for(const n of D1FBS.slice(0,14)){const c=old[n];const tgt=c&&N[c]&&N[c].length<7?c:(N['Southern Athletic'].length<=N['Great Lakes'].length?'Southern Athletic':'Great Lakes');N[tgt].push(n);}
  for(const c in AI_CONF)delete AI_CONF[c];Object.assign(AI_CONF,N);for(const k in AI_P4)delete AI_P4[k];for(const c in AI_CONF)AI_CONF[c].forEach(s=>{AI_P4[s]=c;});}
const AI_BOWLS_TOP=['Garden Bowl','Bayou Bowl','Tropic Bowl','Frontier Bowl','Desert Bowl','Orchard Bowl'];
const AI_BOWLS=['Citrus Bowl','ReliaQuest Bowl','Alamo Bowl','Holiday Bowl','Gator Bowl','Music City Bowl','Liberty Bowl','Las Vegas Bowl','Sun Bowl','Pinstripe Bowl','Texas Bowl',"Duke's Mayo Bowl",'Armed Forces Bowl','Birmingham Bowl','Independence Bowl','Hawaii Bowl','Boca Raton Bowl','New Mexico Bowl','First Responder Bowl','Camellia Bowl'];
const AI_GROW={'Elite Dev':2.1,'Star':1.7,'Star Dev':1.7,'Impact':1.25,'Normal':.75};
const AI_RET={RB:29.5,WR:31.5,CB:31,DL:32.5,LB:31.5,S:32,TE:32.5,OL:34,QB:37,K:39};
const AI_DECL={RB:27,WR:29,CB:28,DL:30,LB:29,S:30,TE:30,OL:31,QB:34,K:38};
const AI_INJ={RB:.30,LB:.26,DL:.25,WR:.24,CB:.24,S:.24,TE:.23,OL:.22,QB:.18,K:.04};
const AI_MINOR=['high ankle sprain','hamstring strain','MCL sprain','turf toe','concussion','shoulder sprain','rib injury','groin strain','calf strain','hip pointer','quad contusion','sprained wrist'];
const AI_MOD=['broken hand','sports hernia','high ankle sprain','knee sprain','fractured fibula','dislocated shoulder','PCL sprain'];
const AI_MAJOR=['torn ACL','torn Achilles','fractured leg','torn labrum','torn pectoral','Lisfranc injury','broken collarbone','torn meniscus','neck injury'];
const AI_OFF=['QB','RB','WR','TE','OL','K'];
const AI_PV={QB:4,DL:2.5,OL:1.5,CB:1.5,WR:1,S:0,LB:-.5,TE:-.5,RB:-1.5,K:-9};
const AI_LVADJ={P4:0,G5:-3,FCS:-5.5,D2:-9,D3:-13,JUCO:-11};
const AI_THR={P4:78,G5:72,FCS:69,D2:63,D3:56,JUCO:61};
const AI_GP={P4:12,G5:12,FCS:11,D2:11,D3:10,JUCO:10};
const AI_POSAWD={QB:["Gunslinger Award",'Player of the Year Award','Golden Arm Award'],RB:['Feature Back Award'],WR:['Golden Hands Award'],TE:['Tight End of the Year Award'],OL:['Trench Trophy','Center of the Year Award','Offensive Line of the Year Award'],DL:['Iron Wall Award','Defender of the Year Trophy','Pass Rusher of the Year Award','Lineman of the Year Award'],LB:['Linebacker of the Year Award','Iron Wall Award','Defender of the Year Trophy'],CB:['Defensive Back of the Year Award'],S:['Defensive Back of the Year Award'],K:['Kicker of the Year Award']};
const AI_MAJORS=['Business Administration','Communications','Kinesiology','Criminal Justice','Sociology','Marketing','Exercise Science','General Studies','Sport Management','Psychology','Education','Finance','Engineering','Journalism','Economics','Biology'];
const AI_TRK=[
 {s:'becomes a high school head coach',y:['wins his first playoff game as head coach','is named district coach of the year','sends his first player to a college program','takes over a bigger program','is named state coach of the year','is inducted into his school athletic hall of fame']},
 {s:'takes a position-coach job at a college',y:['coaches his first all-conference player','is promoted to a coordinator role','helps his team to a bowl game','is courted by a bigger program','becomes known as a top recruiter','is named an assistant head coach']},
 {s:'joins a network as a studio analyst',y:['lands a Saturday game-day desk spot','is added to the network\'s pregame show','signs a multi-year broadcast deal','calls his first national game','launches a weekly podcast','is named lead analyst for a major game']},
 {s:'opens a youth training facility',y:['trains his first college signee','opens a second location','hosts a summer camp for 400 kids','partners with local high schools','sends three players to college rosters','is honored by the city for community work']},
 {s:'starts a foundation for local kids',y:['funds a new weight room at his old school','awards his first scholarships','expands the foundation into a second state','hosts a charity game','is named community leader of the year','dedicates a youth field in his name']},
 {s:'joins a front office as a scout',y:['covers his first college all-star game','is promoted to area scout','helps his team land a draft steal','is named regional scouting director','joins the draft-room staff','is promoted to assistant general manager']},
 {s:'starts a real estate company',y:['closes his first big deal','hires a staff of ten','opens a second office','sponsors the local youth league','is named a top local entrepreneur','returns to fund his school\'s stadium upgrade']},
 {s:'becomes a financial advisor',y:['builds a client list of 100 families','starts a program for young athletes','is named to a local business board','opens a second office','publishes a guide on money for athletes','is honored as a mentor of the year']}];
const AI_TR=['wants a clearer path to the starting job','follows his position coach after a staff change','wants to be closer to family','wants to test himself on a bigger stage','is drawn by a better scheme fit','wants more snaps before the draft'];
const AI_LIFE=['enrolls at a community college and studies business','starts a trade apprenticeship','joins the military','takes a job in the family business','plays club football and coaches youth teams','works full time and attends night classes','starts studying to become a teacher'];
const AI_LIFE2=['gets promoted at work','buys a first home','coaches a youth football team on weekends','finishes a degree','starts a small business','is named employee of the year','returns to the school to speak to current players','celebrates the birth of a child','runs a local charity 5K','is invited back as an honored alumnus'];
// ── helpers ──
function aiH(){let h=2166136261;for(let j=0;j<arguments.length;j++){const s=String(arguments[j]);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}}return h>>>0;}
function aiRng(seed){let a=seed>>>0;return function(){a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
const aiCl=(v,a,b)=>Math.max(a,Math.min(b,v));
const aiLp=(r,q)=>r[0]+(r[1]-r[0])*q;
const aiPk=(r,arr)=>arr[Math.floor(r()*arr.length)];
const aiRi=(r,a,b)=>a+Math.floor(r()*(b-a+1));
const aiN=r=>{let u=0,v=0;while(!u)u=r();while(!v)v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);};
const aiNum=n=>Math.round(n).toLocaleString('en-US');
function aiOrd(n){const s=['th','st','nd','rd'],v=n%100;return n+(s[(v-20)%10]||s[v]||s[0]);}
function aiMoney(m){return m>=100?'$'+Math.round(m)+' million':m>=10?'$'+m.toFixed(1).replace(/\.0$/,'')+' million':m>=1?'$'+m.toFixed(2).replace(/0$/,'').replace(/\.$/,'')+' million':'$'+Math.round(m*1000)+'K';}
function aiTier(a){if(a.lvl==='NAIA')return'D3';if(a.lvl!=='FBS')return a.lvl;return AI_P4[a.school]?'P4':'G5';}
function aiConfName(a){return AI_P4[a.school]&&AI_P4[a.school]!=='Independent'?AI_P4[a.school]:'conference';}
function aiQ(ovr,b,s){return aiCl((ovr-b)/s,0,1);}
function aiSide(pos){return AI_OFF.includes(pos)?'Offensive':'Defensive';}
function aiList(name){try{const v={D1FBS:typeof D1FBS!=='undefined'?D1FBS:null,D1FCS:typeof D1FCS!=='undefined'?D1FCS:null,D2:typeof D2!=='undefined'?D2:null,D3:typeof D3!=='undefined'?D3:null,JUCO:typeof JUCO!=='undefined'?JUCO:null}[name];return v&&v.length?v:null;}catch(e){return null;}}
function aiSchool(r,tier,avoid){
  let L;if(tier==='P4')L=Object.keys(AI_P4);else if(tier==='G5')L=(aiList('D1FBS')||['Llano State','Sonora State','Canyon State']).filter(s=>!AI_P4[s]);else if(tier==='FCS')L=aiList('D1FCS')||['Silsbee State'];else if(tier==='D2')L=aiList('D2')||['Osage State'];else if(tier==='D3')L=aiList('D3')||['Middletown College'];else L=aiList('JUCO')||['Jim Hogg County CC'];
  if(!L.length)L=['State University'];let s=aiPk(r,L),g=0;while(s===avoid&&g++<8)s=aiPk(r,L);return s;
}
function aiLvlOf(t){return t==='P4'||t==='G5'?'FBS':t;}
// ── player creation ──
function aiNew(p){
  const r=aiRng(aiH('new',p.id,p.fn,p.ln));const c=p.committed;let lvl=c&&c.lvl,school=c&&c.school,path='college',walk=false;
  const tr=p.traits||[];
  if(!lvl||!school){
    if(p.rat>=50&&r()<.35){lvl='JUCO';school=aiSchool(r,'JUCO');}
    else if(r()<.45){lvl=r()<.5?'D2':'D3';school=aiSchool(r,lvl);walk=true;}
    else path='life';
  }
  const a={v:2,id:p.id,gy:p.gradYr,path,stage:path==='life'?'life':'college',lvl,school,walk,pos:p.pos,ovr:p.rat+(p.stars>=4?1:0),dev:p.dev||'Normal',pot:p.potHi||p.pot||(p.rat+10),dur:tr.includes('injury-prone')?.7:1,
    spd:p.spd||60,str:p.str||60,awr:p.awr||60,gpa:p.gpa||3,cy:0,pl:0,elig:0,tr:0,rsUsed:false,mrs:false,ct:{},pt:{},awl:[],inj:[],entries:[],last:undefined,team:null,lg:null,pick:null,rd:0,und:false,py:0,cYrs:0,aav:0,post:0,done:false,retY:null,
    major:aiPk(r,AI_MAJORS),fail:0,sb:0,pb:0,ap1:0,ap2:0,mvp:0,canton:null,cfh:null,talent:aiN(r)*2.2,cc:false,lastRole:null,lastPerf:0,aa1:0,hei:false,deg:false,capt:false,colEnd:null,injPrev:false,optn:false};
  a.tier=a.lvl?aiTier(a):null;return a;
}
function aiGrow(a,r,pro,age){
  const young=(a.cy+a.py)<=4;let g=(AI_GROW[a.dev]||1.3)*(young?1:.45)*(pro?.5:1)*(.55+r()*.9);
  if(pro){const d=AI_DECL[a.pos]||30;if(age>=d)g=-(1.2+r()*2)-(age-d)*.55;}
  const cap=Math.min(99,(a.pot||a.ovr)+2);a.ovr=g>0?aiCl(a.ovr+g,30,Math.max(cap,a.ovr)):aiCl(a.ovr+g,30,99);
  if(!pro){a.str=aiCl(a.str+r()*3,30,99);if(a.cy<=2)a.spd=aiCl(a.spd+r()*1.5,30,99);}
}
function aiInjury(a,r,pro){
  const base=(AI_INJ[a.pos]||.24)*(pro?1.12:1)/(a.dur||1)*(1+a.inj.filter(x=>x.sev==='major').length*.12);
  if(r()>base)return null;const x=r();
  if(x<.6)return{sev:'minor',name:aiPk(r,AI_MINOR),lost:aiRi(r,1,3),wk:aiRi(r,1,14)};
  if(x<.87)return{sev:'mod',name:aiPk(r,AI_MOD),lost:aiRi(r,4,7),wk:aiRi(r,1,12)};
  return{sev:'major',name:aiPk(r,AI_MAJOR),lost:0,wk:aiRi(r,1,12)};
}
const AI_RF={Starter:1,Rotation:.5,Backup:.16,Redshirt:0,'Practice squad':0};
// ── team season context ──
function aiTeamSeason(r,tier,pro,y,team){
  if(pro){const sbx=aiSbTeams(y),q=aiCl(.5+aiN(aiRng(aiH('nflq',team,y)))*.18,.1,.92);let w=Math.round(aiCl(q*17+aiN(r)*1.6,1,16));
    if(team===sbx.champ)w=Math.max(w,12);else if(team===sbx.loser)w=Math.max(w,11);
    return{w,l:17-w,po:w>=10||(w===9&&r()<.5)||team===sbx.champ||team===sbx.loser,champ:team===sbx.champ,lost:team===sbx.loser,q,pass:.5+aiN(r)*.06};}
  const g=AI_GP[tier]||11,base={P4:.58,G5:.52,FCS:.55,D2:.55,D3:.55,JUCO:.55}[tier]||.55,q=aiCl(base+aiN(r)*.2,.05,.97);let w=Math.round(aiCl(q*g+aiN(r)*1.2,0,g));
  return{w,l:g-w,g,q,pass:.5+aiN(r)*.07};
}
// ── stat generation (role, quality, form, team context) ──
function aiPR(cmp,att,yd,td,it,nfl){if(!att)return 0;if(nfl){const c=x=>aiCl(x,0,2.375),a=c((cmp/att-.3)*5),b=c((yd/att-3)*.25),d=c(td/att*20),e=c(2.375-it/att*25);return Math.round((a+b+d+e)/6*1000)/10;}return Math.round((8.4*yd+330*td+100*cmp-200*it)/att*10)/10;}
const AI_SR={col:{QB:{att:[230,500],cp:[.55,.68],ypa:[6.1,9.1],td:[12,44],int:[13,5],ry:[30,560],rt:[1,10]},RB:{att:[110,290],ypc:[4.1,6.6],td:[3,22],rec:[8,42],ypr:[6.5,11]},WR:{rec:[22,105],ypr:[11.5,16.8],td:[2,15]},TE:{rec:[12,62],ypr:[9.5,13.8],td:[1,10]},DL:{tkl:[18,62],sk:[1.5,14],tfl:[3,21],ff:[0,4],qbh:[3,22]},LB:{tkl:[38,132],sk:[.5,9],tfl:[3,18],int:[0,3],pd:[1,7]},CB:{tkl:[20,62],int:[0,6],pd:[4,19]},S:{tkl:[32,104],int:[0,6],pd:[3,13]},K:{fga:[14,28],pct:[.7,.93],lng:[44,57]},OL:{sa:[5,0],pen:[6,1]}},
  pro:{QB:{att:[420,640],cp:[.6,.7],ypa:[6.2,8.4],td:[15,44],int:[15,6],ry:[30,700],rt:[0,9]},RB:{att:[140,330],ypc:[3.7,5.5],td:[3,18],rec:[15,75],ypr:[6,9.5]},WR:{rec:[35,125],ypr:[10.8,15.6],td:[2,14]},TE:{rec:[22,105],ypr:[9,12.8],td:[2,11]},DL:{tkl:[18,58],sk:[2,18],tfl:[3,22],ff:[0,5],qbh:[6,34]},LB:{tkl:[55,165],sk:[.5,9],tfl:[3,16],int:[0,4],pd:[1,9]},CB:{tkl:[28,78],int:[0,7],pd:[5,22]},S:{tkl:[45,120],int:[0,6],pd:[3,14]},K:{fga:[20,40],pct:[.76,.94],lng:[46,61]},OL:{sa:[6,0],pen:[8,2]}}};
function aiStat(pos,q,role,gpF,r,pro,tm){
  const S=(pro?AI_SR.pro:AI_SR.col)[pos],rf=(pos==='QB'?{Starter:1,Rotation:.2,Backup:.05}[role]:AI_RF[role])||0,form=aiCl(1+aiN(r)*.13,.68,1.32),f=rf*gpF*(.9+.1*form),pass=tm?aiCl(tm.pass,.4,.6):.5,tq=tm?(.88+tm.q*.24):1,ps=Math.sqrt(pass/.5);
  const qq=aiCl(q+aiN(r)*.07,0,1),q2=Math.pow(qq,1.35),j=()=>aiCl(1+aiN(r)*.09,.75,1.25);let k={},t='';
  if(pos==='QB'){const att=Math.min(pro?690:600,Math.round(aiLp(S.att,qq)*f*ps)),cp=aiCl(aiLp(S.cp,qq)+aiN(r)*.018,.48,.76),cmp=Math.round(att*cp),yd=Math.round(att*aiCl(aiLp(S.ypa,qq)*j()*tq,5,pro?9.2:10)),td=Math.min(pro?52:55,Math.round(aiLp(S.td,q2)*f*j()*tq*ps*(.85+.15*form))),it=Math.max(0,Math.round(aiLp(S.int,q2)*f*j())),ry=Math.round(aiLp(S.ry,qq*.6)*f*j()*(.4+r()*.9)),rt=Math.round(aiLp(S.rt,q2)*f*r()*1.3),lg=att?aiRi(r,48,85):0,sk=Math.round(att*(.045+(1-qq)*.035)*j());
    k={att,cmp,yd,td,int:it,ryd:ry,rtd:rt,sk};const pr=aiPR(cmp,att,yd,td,it,pro);t=`${cmp}/${att} (${att?(cmp/att*100).toFixed(1):'0.0'}%), ${aiNum(yd)} yds, ${td} TD, ${it} INT, ${pro?'rating':'efficiency'} ${pr}`+(ry>=100?`; ${aiNum(ry)} rush yds, ${rt} rush TD`:'')+(att>=150?`; long ${lg}`:'');}
  else if(pos==='RB'){const att=Math.min(pro?380:340,Math.round(aiLp(S.att,qq)*f*Math.sqrt(1.5-pass))),ypc=aiCl(aiLp(S.ypc,qq)*j()*(.92+tq*.1),2.8,pro?6.2:7.6),yd=Math.round(att*ypc),td=Math.round(aiLp(S.td,q2)*f*j()*tq),rec=Math.round(aiLp(S.rec,q2)*f*j()),ry=Math.round(rec*aiLp(S.ypr,qq)*j()),fum=Math.round(att/aiRi(r,90,260)),lg=att?aiRi(r,25,84):0;
    k={att,yd,td,rec,ryd:ry,fum};t=`${att} carries, ${aiNum(yd)} yds (${att?(yd/att).toFixed(1):'0.0'} avg), ${td} TD, long ${lg}; ${rec} catches, ${aiNum(ry)} yds`+(fum?`; ${fum} fumble${fum>1?'s':''}`:'');}
  else if(pos==='WR'||pos==='TE'){const rec=Math.min(pro?145:130,Math.round(aiLp(S.rec,q2)*f*j()*ps)),yd=Math.min(pro?1900:1950,Math.round(rec*aiLp(S.ypr,qq)*j())),td=Math.round(aiLp(S.td,q2)*f*j()*tq),tgt=Math.round(rec/aiCl(.58+qq*.12+aiN(r)*.03,.5,.78)),lg=rec?aiRi(r,22,82):0;
    k={rec,yd,td,tgt};t=`${rec} catches on ${tgt} targets, ${aiNum(yd)} yds (${rec?(yd/rec).toFixed(1):'0.0'} avg), ${td} TD, long ${lg}`;}
  else if(pos==='DL'){const tk=Math.round(aiLp(S.tkl,qq)*f*j()),sk=Math.min(22.5,Math.round(aiLp(S.sk,q2)*f*j()*(.8+.2*form)*2)/2),tf=Math.max(Math.ceil(sk),Math.round(aiLp(S.tfl,q2)*f*j())),ff=Math.round(aiLp(S.ff,q2)*f*(r()+.35)),qh=Math.round(aiLp(S.qbh,q2)*f*j());
    k={tkl:tk,sk,tfl:tf,ff,qbh:qh};t=`${tk} tackles, ${tf} TFL, ${sk} sacks, ${qh} QB hits, ${ff} forced fumble${ff!==1?'s':''}`;}
  else if(pos==='LB'){const tk=Math.round(aiLp(S.tkl,qq)*f*j()),sk=Math.round(aiLp(S.sk,q2)*f*j()*2)/2,tf=Math.max(Math.ceil(sk),Math.round(aiLp(S.tfl,q2)*f*j())),it=Math.round(aiLp(S.int,q2)*f*(r()+.25)),pd=Math.round(aiLp(S.pd,q2)*f*j());
    k={tkl:Math.min(pro?175:160,tk),sk,tfl:tf,int:it,pd};t=`${tk} tackles, ${tf} TFL, ${sk} sacks, ${it} INT, ${pd} pass breakups`;}
  else if(pos==='CB'||pos==='S'){const tk=Math.round(aiLp(S.tkl,qq)*f*j()),it=Math.round(aiLp(S.int,q2)*f*(r()+.25)),pd=Math.max(it,Math.round(aiLp(S.pd,q2)*f*j())),tdr=it&&r()<.15?1:0;
    k={tkl:tk,int:it,pd,tdr};t=`${tk} tackles, ${it} INT${tdr?' (1 returned for a TD)':''}, ${pd} passes defended`;}
  else if(pos==='K'){const fga=Math.round(aiLp(S.fga,qq)*f*j()),fgm=Math.min(fga,Math.round(fga*aiCl(aiLp(S.pct,qq)+aiN(r)*.04,.55,1))),lg=fgm?Math.round(aiLp(S.lng,qq)+aiN(r)*3):0,xp=Math.round((pro?38:44)*f*tq*j());
    k={fga,fgm,lng:lg,xp};t=`${fgm}/${fga} field goals (${fga?(fgm/fga*100).toFixed(1):'0.0'}%), long of ${lg}, ${xp} extra points`;}
  else{const gs=role==='Starter'?Math.round((pro?17:12)*gpF):0,sa=Math.max(0,Math.round(aiLp(S.sa,qq)*gpF*j()*(role==='Starter'?1:.3))),pen=Math.max(0,Math.round(aiLp(S.pen,qq)*gpF*j()));
    k={gs,sa,pen};t=gs?`${gs} starts, ${sa} sack${sa!==1?'s':''} allowed, ${pen} penalties`:`${sa} sack${sa!==1?'s':''} allowed in reserve snaps`;}
  return{k,t,form};
}
function aiAdd(t,k){for(const x in k){if(x==='lng')t.lng=Math.max(t.lng||0,k[x]);else t[x]=(t[x]||0)+k[x];}}
function aiTot(pos,t){
  if(!t||!Object.keys(t).length)return '';
  if(pos==='QB')return `${aiNum(t.cmp||0)}/${aiNum(t.att||0)}, ${aiNum(t.yd||0)} pass yds, ${t.td||0} TD, ${t.int||0} INT`+((t.ryd||0)>=300?`, ${aiNum(t.ryd)} rush yds`:'');
  if(pos==='RB')return `${aiNum(t.yd||0)} rush yds, ${t.td||0} TD, ${t.rec||0} rec, ${aiNum(t.ryd||0)} rec yds`;
  if(pos==='WR'||pos==='TE')return `${aiNum(t.rec||0)} rec, ${aiNum(t.yd||0)} yds, ${t.td||0} TD`;
  if(pos==='DL'||pos==='LB')return `${aiNum(t.tkl||0)} tackles, ${t.tfl||0} TFL, ${t.sk||0} sacks`+((t.int||0)?`, ${t.int} INT`:'');
  if(pos==='CB'||pos==='S')return `${aiNum(t.tkl||0)} tackles, ${t.int||0} INT, ${t.pd||0} passes defended`;
  if(pos==='K')return `${t.fgm||0}/${t.fga||0} FG (${t.fga?(t.fgm/t.fga*100).toFixed(1):'0'}%), long ${t.lng||0}`;
  return `${t.gs||0} starts, ${t.sa||0} sacks allowed`;
}
function aiEntry(a,y,age,st,hl,tx,extra){return Object.assign({y,age,st,hl,tx:tx||[],stl:null,aw:[],tg:[],nw:false,ovr:Math.round(a.ovr)},extra||{});}
// ── signing ──
function aiSign(a,p,Y,r,base){
  const y=base+Y-1,age=18;
  if(a.ci)return aiEntry(a,y,age,'life',`${p.fn} ${p.ln}'s playing career ends early`,[`A career-ending injury closes the book on ${p.fn}'s football days, and the program enshrines him anyway.`,`He ${aiPk(r,AI_LIFE)}.`]);
  if(a.path==='life')return aiEntry(a,y,age,'life',`${p.fn} ${p.ln} chooses life after football`,[`With no college offers, ${p.fn} ${aiPk(r,AI_LIFE)}.`,'The program remembers him as one of its all-time greats.']);
  const tier=a.tier=aiTier(a),conf=aiConfName(a);
  const tx=[a.walk?`No scholarship offers came, but ${p.fn} earns a roster spot as a preferred walk-on at ${a.school}.`:`${p.fn} signs with ${a.school}${tier==='P4'&&conf!=='conference'?' of the '+conf:''} as a ${p.stars?p.stars+'-star ':''}${p.pos}.`,`He enrolls in ${a.major}${tier==='P4'||tier==='G5'?' and reports for summer workouts in June':''}.`];
  if(p.stars>=4&&(tier==='P4')&&r()<.5)tx.push(`Signs early NIL deals worth an estimated ${aiMoney(p.stars>=5?.25+r()*.6:.03+r()*.12)} before his first snap.`);
  return aiEntry(a,y,age,'sign',a.walk?`${p.fn} ${p.ln} walks on at ${a.school}`:`${p.fn} ${p.ln} signs with ${a.school} (${a.lvl})`,tx,{tg:['Signing']});
}
// ── college season ──
function aiCollAwards(a,r,perf,role,gpF,yrIdx,tier,tm){
  const out=[];if(role!=='Starter'&&role!=='Rotation')return out;if(gpF<.5)return out;const off=AI_OFF.includes(a.pos),pos=a.pos,conf=aiConfName(a),cn=conf==='conference'?'All-Conference':`All-${conf}`;
  if(yrIdx===1&&perf>=.55&&(tier==='P4'||tier==='G5'||tier==='FCS'))out.push('Freshman All-American');
  if(tier==='JUCO'){if(perf>=.7)out.push('junior college All-American');return out;}
  if(perf>=.84)out.push(cn+' First Team');else if(perf>=.72)out.push(cn+' Second Team');else if(perf>=.64&&r()<.5)out.push(cn+' Honorable Mention');
  if(perf>=.93&&r()<.45)out.push(conf==='conference'?(off?'Conference Offensive Player of the Year':'Conference Defensive Player of the Year'):`${conf} ${off?'Offensive':'Defensive'} Player of the Year`);
  if(tier==='P4'||tier==='G5'){
    const aaB=tier==='P4'?0:.05;
    if(perf>=.9+aaB&&r()<.45){out.push('First-Team All-American');a.aa1++;}else if(perf>=.83+aaB&&r()<.4)out.push('Second-Team All-American');
    const aw=aiPk(r,AI_POSAWD[pos]||['Iron Wall Award']);
    if(perf>=.95&&r()<.3)out.push('Winner of the '+aw);else if(perf>=.9&&r()<.45)out.push(aw+' finalist');else if(perf>=.82&&r()<.35)out.push(aw+' semifinalist');
    if((pos==='QB'||pos==='RB'||pos==='WR')&&perf>=.94&&tm.w>=10){const x=r();if(x<(pos==='QB'?.25:.1)){out.push('Golden Helmet Trophy winner');a.hei=true;}else if(x<.55)out.push('Golden Helmet Trophy finalist');}
  }else if(tier==='FCS'){if(perf>=.86)out.push('FCS All-American');if(perf>=.94&&r()<.3)out.push(off?'Walter Payton Award winner':'Buck Buchanan Award winner');else if(perf>=.88&&r()<.4)out.push(off?'Walter Payton Award finalist':'Buck Buchanan Award finalist');}
  else if(tier==='D2'){if(perf>=.86)out.push('D2 All-American');if(perf>=.9&&off&&r()<.4)out.push('Harlon Hill Trophy finalist');}
  else if(tier==='D3'){if(perf>=.86)out.push('D3 All-American');if(perf>=.9&&r()<.35)out.push('Gagliardi Trophy finalist');}
  if(a.gpa>=3.3&&r()<.55)out.push(tier==='P4'||tier==='G5'?'Academic All-Conference':'Academic All-American');
  return out;
}
function aiPost(a,tm,tier,r,p){
  const tx=[];
  if(tier==='P4'||tier==='G5'){
    if(tm.w>=11||(tier==='G5'&&tm.w>=11&&r()<.5)){const rd=r();tx.push(`${a.school} goes ${tm.w}-${tm.l} and earns a National Playoff berth`+(rd<.12?` and wins the national championship!`:rd<.3?`, reaching the national title game.`:rd<.55?`, falling in the semifinals.`:`.`));if(rd<.12)tm.title=true;}
    else if(tm.w>=9&&tier==='P4')tx.push(`${a.school} finishes ${tm.w}-${tm.l} and plays in the ${aiPk(r,AI_BOWLS_TOP)} (${r()<.55?'win':'loss'}).`);
    else if(tm.w>=6)tx.push(`${a.school} goes ${tm.w}-${tm.l} and plays in the ${aiPk(r,AI_BOWLS)} (${r()<.5?'win':'loss'}).`);
    else tx.push(`${a.school} finishes ${tm.w}-${tm.l} and misses a bowl.`);
  }else if(tier==='FCS'){if(tm.w>=8)tx.push(`${a.school} goes ${tm.w}-${tm.l} and reaches the FCS playoffs`+(r()<.12?' and wins the national title!':'.'));else tx.push(`${a.school} finishes ${tm.w}-${tm.l}.`);}
  else if(tier==='D2'||tier==='D3'){if(tm.w>=8)tx.push(`${a.school} goes ${tm.w}-${tm.l} and makes the ${tier} playoffs`+(r()<.1?' and wins it all!':'.'));else tx.push(`${a.school} finishes ${tm.w}-${tm.l}.`);}
  else tx.push(`${a.school} finishes ${tm.w}-${tm.l}.`);
  return tx;
}
function aiCollege(a,p,Y,r,base){
  const y=base+Y-1,k=Y-a.gy,age=18+k-1;a.cy++;a.tier=a.tier||aiTier(a);const tier=a.tier,thr=AI_THR[tier]||66,G=AI_GP[tier]||11;aiGrow(a,r,false,age);
  const tx=[],tg=[];if(a.cc){tx.push(`New coaching staff at ${a.school} this season.`);a.cc=false;}
  const rv=a.ovr+a.talent+Math.min(3,a.pl)*1.4+aiN(r)*4.5;let role=rv>=thr?'Starter':rv>=thr-7?'Rotation':'Backup';
  if(a.pl===0&&!a.rsUsed&&(tier==='P4'||tier==='G5'||tier==='FCS')&&role!=='Starter'&&r()<.62){role='Redshirt';a.rsUsed=true;}
  const tm=aiTeamSeason(r,tier,false,y,a.school);
  const inj=role==='Redshirt'?null:aiInjury(a,r,false);let gp=G+(tm.w>=6&&tier!=='D3'?1:0)+(r()<.15?1:0),gpF=1;
  if(role==='Redshirt')gp=Math.min(4,aiRi(r,0,4));
  else if(inj){if(inj.sev==='major'){gp=aiCl(inj.wk-1,0,G);}else gp=Math.max(1,gp-inj.lost);gpF=gp/G;}
  let medRS=false;if(inj&&inj.sev==='major'&&gp<=4&&!a.mrs){medRS=true;a.mrs=true;}
  if(role!=='Redshirt'&&!medRS){a.pl++;a.elig++;}else if(role!=='Redshirt'){a.pl++;}
  const q=aiQ(a.ovr+a.talent,{P4:58,G5:52,FCS:50,D2:44,D3:38,JUCO:46}[tier]||50,38);
  const stt=(gp===0)?null:aiStat(a.pos,q,role==='Redshirt'?'Backup':role,gpF,r,false,tm);
  const perf=stt?aiCl(q*(role==='Starter'?1:.8)*Math.min(1.1,stt.form)+aiN(r)*.05,0,1):0;a.lastPerf=perf;a.lastRole=role;
  const cls=['freshman','sophomore','junior','senior','fifth-year senior','sixth-year senior'][Math.min(5,a.cy-1)];
  let hl;
  if(role==='Redshirt'){hl=`${p.fn} redshirts at ${a.school}`;tx.push(`${p.fn} appears in ${gp} game${gp!==1?'s':''} and keeps his redshirt (the rules allow up to four), spending the year in the weight room.`);tg.push('Redshirt');}
  else{hl=role==='Starter'?`${p.fn} ${p.ln} starts as a ${cls} at ${a.school}`:role==='Rotation'?`${p.fn} ${p.ln} earns rotation snaps as a ${cls} at ${a.school}`:`${p.fn} ${p.ln} spends his ${cls} year as a reserve at ${a.school}`;
    tx.push(`${p.pos} · ${gp} game${gp!==1?'s':''}${role==='Starter'?' · starter':''} · ${tier==='P4'?'Power conference':tier==='G5'?'Group of Five':tier}`);}
  if(stt){aiAdd(a.ct,stt.k);}
  if(stt&&stt.form>1.18&&role!=='Backup')tx.push('A breakout season by any measure.');else if(stt&&stt.form<.8&&role==='Starter')tx.push('An up-and-down year that leaves scouts wanting more.');
  let aw=[];if(stt&&!medRS){aw=aiCollAwards(a,r,perf,role,gpF,a.pl,tier,tm);aw.forEach(n=>a.awl.push({y,n}));}
  if(aw.length)tg.push('Award');
  if(inj){a.inj.push({y,name:inj.name,sev:inj.sev});tg.push('Injury');
    if(inj.sev==='major'){tx.push(`Injury: suffers a ${inj.name} in week ${inj.wk} and misses the rest of the season.`+(medRS?' He is granted a medical redshirt and keeps the year of eligibility.':''));a.ovr=aiCl(a.ovr-1.5-r()*2,30,99);a.injPrev=true;}
    else if(inj.sev==='mod')tx.push(`Injury: a ${inj.name} costs him ${inj.lost} games.`);else tx.push(`Minor ${inj.name}, misses ${inj.lost} game${inj.lost>1?'s':''}.`);}
  else a.injPrev=false;
  if(role==='Starter'&&a.pl>=3&&!a.capt&&r()<.35){a.capt=true;tx.push('Voted a team captain.');}
  if(role==='Starter'&&tier==='P4'&&perf>.7&&r()<.35)tx.push(`NIL valuation climbs to about ${aiMoney((a.pos==='QB'?1.2:.35)*perf*(.6+r()))} per year.`);
  if(role!=='Redshirt')aiPost(a,tm,tier,r,p).forEach(x=>tx.push(x));
  if(!a.deg&&a.cy>=4&&r()<.75){a.deg=true;tx.push(`Earns his degree in ${a.major}.`);}
  if(r()<.12){a.cc=true;}
  const e=aiEntry(a,y,age,'col',hl,tx,{stl:stt?stt.t:null,aw,tg,team:a.school});
  if(aw.some(n=>/Golden Helmet|national championship|First-Team All-American|Winner/.test(n))||tm.title)e.nw=true;
  return aiOffseason(a,p,e,r,Y,base,perf,role);
}
// ── draft grade, declare, transfer ──
function aiGrade(a,r){
  const tier=a.tier||aiTier(a),awN=a.awl.filter(x=>/All-American|Player of the Year|Award|Golden Helmet|Trophy/.test(x.n)).length;
  const prod=aiCl(a.lastPerf,0,1)*6,maj=a.inj.filter(x=>x.sev==='major').length;
  return a.ovr+a.talent+(AI_PV[a.pos]||0)+(AI_LVADJ[tier]||0)+Math.min(9,awN*2)+prod-maj*2.5+(a.pl<=3?1.5:0);
}
function aiProj(g){return Math.round(260*Math.exp(-(g-85)/14));}
function aiOffseason(a,p,e,r,Y,base,perf,role){
  const tier=a.tier,elig=a.elig,yearsOut=a.cy;
  if(tier==='JUCO'){
    if(a.cy>=2||(role==='Starter'&&perf>.62)){const g=aiGrade(a,r),nt=g>=86?'P4':g>=80?'G5':g>=74?'FCS':'D2',old=a.school;a.school=aiSchool(r,nt,old);a.lvl=aiLvlOf(nt);a.tier=nt;a.tr++;
      e.tx.push(`Signs with ${a.school} (${nt==='P4'?'Power conference':nt==='G5'?'Group of Five':nt}) after his juco run.`);e.tg.push('Transfer');e.nw=true;e.hl=`${p.fn} ${p.ln} moves up from ${old} to ${a.school}`;}
    return e;}
  const exhausted=elig>=4||a.cy>=6,canDeclare=yearsOut>=3;
  const g=aiGrade(a,r),proj=aiProj(g);
  if(canDeclare&&(exhausted||(proj<=45&&r()<.85)||(proj<=90&&r()<.3))){
    return aiDraft(a,p,e,r,Y,base,g,exhausted);
  }
  if(exhausted)return aiDraft(a,p,e,r,Y,base,g,true);
  // transfer portal decision
  let want=role==='Backup'?.3:role==='Rotation'?.13:role==='Redshirt'?.05:.02;
  const up=role==='Starter'&&perf>=.8&&tier!=='P4'&&a.tr===0;
  if(up&&a.tr===0)want+=.09+(e.aw&&e.aw.some(x=>/First Team|All-American|Player of the Year/.test(x))?.1:0);
  if(a.cc)want+=.12;if(a.deg&&elig<4)want+=.08;if(a.tr>=2)want-=.35;
  if(r()<aiCl(want,0,.75)){
    const order=['D3','D2','FCS','G5','P4'];let nt=tier;
    if(up){const i=order.indexOf(tier);nt=order[Math.min(4,i+(perf>.9&&r()<.5?2:1))];}
    else if(role==='Backup'||role==='Rotation'){const i=order.indexOf(tier);nt=tier==='P4'?(r()<.6?'G5':'FCS'):r()<.55?order[Math.max(0,i-1)]:tier;}
    const old=a.school,ns=aiSchool(r,nt,old);a.school=ns;a.tier=nt;a.lvl=aiLvlOf(nt);a.tr++;a.cc=false;
    const why=up?'wants to test himself on a bigger stage':role==='Starter'?(a.cc?'follows his position coach after a staff change':aiPk(r,['wants a better scheme fit','wants to be closer to family','is drawn by a bigger NIL opportunity'])):aiPk(r,AI_TR);
    e.tx.push(`Enters the transfer portal in December: ${p.fn} ${why}. Commits to ${ns} (${nt==='P4'?'Power conference':nt==='G5'?'Group of Five':nt})${a.deg?' as a graduate transfer':''} and is eligible immediately.`);e.tg.push('Transfer');e.nw=true;e.hl=`${p.fn} ${p.ln} transfers from ${old} to ${ns}`;
  }
  return e;
}
function aiCombine(a,r){
  const pos=a.pos,b={QB:4.8,RB:4.52,WR:4.48,TE:4.7,OL:5.25,DL:4.85,LB:4.65,CB:4.45,S:4.52,K:4.95}[pos]||4.7;
  const forty=aiCl(b-(a.spd-70)*.006+aiN(r)*.05,4.22,5.6),bench=Math.round(aiCl(({OL:26,DL:24,TE:18,LB:20,RB:17,QB:12,WR:13,CB:13,S:15,K:8}[pos]||15)+(a.str-70)*.25+aiN(r)*3,4,45)),vert=Math.round(aiCl(({WR:36,CB:37,S:36,RB:35,LB:34,TE:33,QB:31,DL:31,OL:28,K:28}[pos]||32)+(a.spd-70)*.08+aiN(r)*2,22,44)*2)/2;
  return{forty:forty.toFixed(2),bench,vert};
}
function aiRookieDeal(pk){const pts=[[1,45],[10,30],[32,14.5],[33,10.5],[64,7.2],[100,5.8],[135,4.9],[170,4.5],[210,4.2],[257,4.1]];if(pk<=0)return 3;for(let i=0;i<pts.length-1;i++){if(pk<=pts[i+1][0]){const t=(pk-pts[i][0])/(pts[i+1][0]-pts[i][0]);return pts[i][1]+(pts[i+1][1]-pts[i][1])*t;}}return 4.1;}
function aiDraft(a,p,e,r,Y,base,g,exhausted){
  const dy=e.y+1,tier=a.tier;a.colEnd=e.y;a.dg=g;e.tg.push('Draft');e.nw=true;
  if(!exhausted)e.tx.push(`Declares early for the ${dy} NGL Draft with eligibility remaining.`);
  if(!a.deg&&exhausted){a.deg=true;e.tx.push(`Finishes his degree in ${a.major}.`);}
  const proj=aiProj(g),inv=proj<=300;
  if(inv&&exhausted&&proj<=180&&r()<.7)e.tx.push(`Plays in the ${proj<=110?'Senior Classic':aiPk(r,['Coast-to-Coast Bowl','Island All-Star Bowl','Players Collegiate Bowl'])}.`);
  const cmb=aiCombine(a,r);
  if(proj<=290&&(tier==='P4'||tier==='G5'||proj<=200))e.tx.push(`NGL Combine: ${cmb.forty} 40-yard dash, ${cmb.bench} bench reps, ${cmb.vert}-inch vertical.`);
  else e.tx.push(`Pro day: ${cmb.forty} 40-yard dash, ${cmb.vert}-inch vertical.`);
  // combine moves stock
  const bAdj=({QB:4.8,RB:4.52,WR:4.48,TE:4.7,OL:5.25,DL:4.85,LB:4.65,CB:4.45,S:4.52,K:4.95}[a.pos]||4.7)-parseFloat(cmb.forty);
  const g2=g+bAdj*12+aiN(r)*2.2;
  const pD=1/(1+Math.exp(-(g2-104)/8)),pK=a.pos==='K'?.35:1;
  if(r()<pD*pK){
    let pk=Math.round(aiProj(g2)*Math.exp(aiCl(aiN(r),-2,2)*.45));if(pk>257)pk=200+aiRi(r,0,57);pk=aiCl(pk,1,257);
    const rd=pk<=32?1:pk<=64?2:pk<=100?3:pk<=135?4:pk<=176?5:pk<=220?6:7;
    a.stage='pro';a.dy=dy;a.team=aiPk(r,AI_NGL);a.pick=pk;a.rd=rd;a.und=false;a.lg='NGL';a.cYrs=4;const tot=aiRookieDeal(pk);a.aav=tot/4;a.optn=rd===1;
    a.ovr=aiCl(a.ovr-12+aiN(r)*3,35,99);
    e.hl=`${p.fn} ${p.ln} is picked #${pk} overall (round ${rd}) by the ${a.team}`;
    e.tx.push(`${dy} NGL Draft: selected in round ${rd}, pick ${pk}, by the ${a.team}. Rookie deal: 4 years, about ${aiMoney(tot)}${rd===1?' with a fifth-year team option':''}.`);
    if(pk<=5)e.tx.push('One of the top picks in the class.');else if(proj<pk-40)e.tx.push('Slides further than projected on draft weekend.');else if(proj>pk+40)e.tx.push('A big riser who goes much earlier than projected.');
  }else if(r()<aiCl((g2-70)/22,0,.7)){
    a.stage='pro';a.dy=dy;a.und=true;a.rd=0;a.pick=0;a.lg='NGL';a.team=aiPk(r,AI_NGL);a.cYrs=3;a.aav=.9;a.ovr=aiCl(a.ovr-12+aiN(r)*3,35,99);
    e.hl=`${p.fn} ${p.ln} goes undrafted, signs with the ${a.team}`;e.tx.push(`Goes undrafted in ${dy} but signs a priority free-agent deal with the ${a.team} (signing bonus about $${aiRi(r,5,25)*1000}).`);
  }else if(r()<aiCl((g2-60)/30,0,.55)){
    const lg=r()<.6?'SFL':'MGL';a.stage='pro';a.dy=dy;a.lg=lg;a.team=aiPk(r,lg==='SFL'?AI_SFL:AI_MGL);a.und=true;a.cYrs=2;a.aav=.08;a.pick=0;a.rd=0;a.ovr=aiCl(a.ovr-12+aiN(r)*3,35,99);
    e.hl=`${p.fn} ${p.ln} signs with the ${a.team} (${lg})`;e.tx.push(`Not selected in the ${dy} draft; ${p.fn} signs with the ${a.team} of the ${lg} to keep chasing the NGL.`);
  }else{
    a.stage='post';a.lg=null;a.retY=e.y;a.trk=Math.floor(r()*AI_TRK.length);e.hl=`${p.fn} ${p.ln} finishes his playing career`;
    e.tx.push(`${p.fn} works out at his pro day but does not get a pro contract. He ${AI_TRK[a.trk].s}.`);e.tg.push('Career end');
  }
  return e;
}
// ── pro seasons ──
const AI_AAV={QB:[2,58],DL:[1.3,40],WR:[1.2,38],CB:[1.2,30],OL:[1.2,29],LB:[1.2,21],S:[1.2,20],TE:[1.2,19],RB:[1.2,19],K:[1.2,6]};
function aiProAwards(a,r,perf,role,gpF,tmS,injBack){
  const out=[];if(role!=='Starter'&&role!=='Rotation')return out;if(gpF<.55)return out;const off=AI_OFF.includes(a.pos),side=off?'Offensive':'Defensive';
  if(a.py===1){if(role==='Starter'&&perf>=.72&&r()<.45)out.push(`AP ${side} Rookie of the Year`);else if(perf>=.55&&r()<.7)out.push('PFWA All-Rookie Team');}
  if(perf>=.96&&r()<.2)out.push(`AP ${side} Player of the Year`);
  if((a.pos==='QB'&&perf>=.96&&tmS.w>=11&&r()<.3)||(a.pos==='RB'&&perf>=.98&&r()<.06))out.push('AP NGL MVP');
  if(perf>=.9&&r()<.35)out.push('First-Team All-League');else if(perf>=.83&&r()<.3)out.push('Second-Team All-League');
  if(perf>=.78&&r()<.42)out.push('Pro All-Star');
  if(injBack&&perf>=.72&&r()<.35)out.push('AP Comeback Player of the Year');
  if(a.py>=4&&perf>=.6&&r()<.025)out.push('Walter Payton Man of the Year');
  return out;
}
function aiSbTeams(Y){const c=aiH('sb',Y)%32;let l=aiH('sbL',Y)%32;if(l===c)l=(l+7)%32;return{champ:AI_NGL[c],loser:AI_NGL[l]};}
function aiHof(a){return a.pb*2+a.ap1*3+(a.ap2||0)*1+a.mvp*6+a.sb*1.5+a.awl.filter(x=>/Player of the Year/.test(x.n)&&!/Comeback|Rookie/.test(x.n)).length*3+(a.py>=12?3:0);}
function aiPro(a,p,Y,r,base){
  const y=base+Y-1,age=18+(Y-a.gy)-1;a.py++;const lg=a.lg,nfl=lg==='NGL';aiGrow(a,r,true,age);
  const tx=[],tg=[];let hl;const thr=nfl?80:73,gpN=nfl?17:(lg==='MGL'?18:10);
  const bonus=a.pick&&a.pick<=32?5:a.pick&&a.pick<=100?2:a.und?-4:0;
  const rv=a.ovr+a.talent+bonus*(a.py<=3?1:.3)+aiN(r)*4.5;
  let role=rv>=thr?'Starter':rv>=thr-7?'Rotation':rv>=thr-15?'Backup':'Practice squad';
  const tmS=aiTeamSeason(r,null,true,y,a.team);
  const inj=aiInjury(a,r,true);let gp=gpN,gpF=1;
  if(inj){if(inj.sev==='major'){gp=aiCl(inj.wk-1,0,gpN);}else gp=Math.max(2,gp-inj.lost);gpF=gp/gpN;}
  if(role==='Practice squad')gp=0;
  const q=aiQ(a.ovr+a.talent,nfl?67:59,32),stt=(role==='Practice squad'||gp===0)?null:aiStat(a.pos,q,role,gpF,r,true,tmS);
  const perf=stt&&gp?aiCl(q*(role==='Starter'?1:.82)*Math.min(1.1,stt.form)+aiN(r)*.05,0,1):0;
  const ord=a.py===1?'rookie':aiOrd(a.py)+'-year';
  if(role==='Practice squad'){hl=`${p.fn} ${p.ln} spends the year on the ${a.team} practice squad`;tx.push(r()<.4?'Gets elevated for one game late in the season.':'Does not appear in a game but keeps working toward a roster spot.');}
  else{hl=role==='Starter'?`${p.fn} ${p.ln}: ${ord} starter for the ${a.team}`:role==='Rotation'?`${p.fn} ${p.ln} works in the ${a.team} rotation`:`${p.fn} ${p.ln} is a depth player for the ${a.team}`;
    tx.push(`${lg} · ${a.team} · ${gp} game${gp!==1?'s':''}${role==='Starter'&&gp?', starter':''} · team ${tmS.w}-${tmS.l}`);if(stt)aiAdd(a.pt,stt.k);}
  let aw=[];
  if(nfl&&role!=='Practice squad'){
    aw=aiProAwards(a,r,perf,role,gpF,tmS,a.injPrev);
    if(tmS.champ&&(role==='Starter'||role==='Rotation')&&gpF>=.4){aw.push('Gridiron Bowl champion');a.sb++;if(role==='Starter'&&perf>=.7&&r()<.12)aw.push('Gridiron Bowl MVP');}
    else if(tmS.lost&&role!=='Backup')tx.push(`The ${a.team} reach the Gridiron Bowl but lose.`);
    else if(tmS.po&&role!=='Backup')tx.push(r()<.5?`The ${a.team} make the playoffs and lose in the wild-card round.`:`The ${a.team} reach the divisional round of the playoffs.`);
  }else if(!nfl&&role==='Starter'&&perf>.8&&r()<.4){aw.push(`All-${lg} Team`);}
  aw.forEach(n=>a.awl.push({y,n}));
  if(aw.some(n=>/Pro All-Star/.test(n)))a.pb++;if(aw.includes('First-Team All-League'))a.ap1++;if(aw.includes('Second-Team All-League'))a.ap2=(a.ap2||0)+1;if(aw.includes('AP NGL MVP'))a.mvp++;
  if(aw.length)tg.push('Award');
  if(inj){a.inj.push({y,name:inj.name,sev:inj.sev});tg.push('Injury');
    if(inj.sev==='major'){tx.push(`Injury: a ${inj.name} in week ${inj.wk} lands him on injured reserve for the rest of the season.`);a.ovr=aiCl(a.ovr-1.5-r()*2.5,30,99);a.injPrev=true;}
    else{a.injPrev=false;tx.push(inj.sev==='mod'?`Injury: a ${inj.name} sidelines him for ${inj.lost} games.`:`Misses ${inj.lost} game${inj.lost>1?'s':''} with a ${inj.name}.`);}}
  else a.injPrev=false;
  const e=aiEntry(a,y,age,'pro',hl,tx,{stl:stt?stt.t:null,aw,tg,team:a.team});
  if(aw.some(n=>/Rookie of the Year|Player of the Year|MVP|Gridiron Bowl|First-Team All-League/.test(n))||(inj&&inj.sev==='major'&&role==='Starter'))e.nw=true;
  if(stt&&a.pos==='QB'&&stt.k.yd>=4000)tx.push('Throws for over 4,000 yards.');
  if(stt&&a.pos==='RB'&&stt.k.yd>=1000)tx.push('Rushes for over 1,000 yards.');
  if(stt&&(a.pos==='WR'||a.pos==='TE')&&stt.k.yd>=1000)tx.push('Tops 1,000 receiving yards.');
  if(stt&&(a.pos==='DL'||a.pos==='LB')&&stt.k.sk>=10)tx.push('Reaches double-digit sacks.');
  const tt=a.pt;if(a.pos==='QB'&&tt.yd>=30000&&!a.m30){a.m30=1;tx.push(`Passes 30,000 career passing yards.`);}
  if(a.pos==='RB'&&tt.yd>=10000&&!a.m10){a.m10=1;tx.push('Joins the 10,000-yard rushing club.');}
  if((a.pos==='WR'||a.pos==='TE')&&tt.yd>=10000&&!a.m10){a.m10=1;tx.push('Passes 10,000 career receiving yards.');}
  if(a.pos==='DL'&&tt.sk>=100&&!a.m100){a.m100=1;tx.push('Records his 100th career sack.');}
  const ra=(AI_RET[a.pos]||32)+aiN(r)*2+(nfl?0:-1);
  if(age>=ra||(inj&&inj.sev==='major'&&age>=29&&r()<.4)||(a.ovr<60&&a.py>=3))return aiRetire(a,p,e,r,y,age,age>=ra?'announces his retirement':'retires after an injury-shortened run');
  // contracts and team moves
  a.cYrs--;
  const fall=(role==='Practice squad'&&a.py>=2)||(role==='Backup'&&a.ovr<thr-14&&r()<.45);
  if(fall&&a.py>=2&&r()<.7){
    if(nfl&&r()<.45&&a.ovr>=58){a.lg=r()<.6?'SFL':'MGL';a.team=aiPk(r,a.lg==='SFL'?AI_SFL:AI_MGL);e.tx.push(`Released by the NGL club; signs with the ${a.team} of the ${a.lg}.`);e.tg.push('Transfer');}
    else return aiRetire(a,p,e,r,y,age,'is released and cannot find another roster spot');
  }else if(!nfl&&role==='Starter'&&perf>.78&&r()<.45){const t=aiPk(r,AI_NGL);a.lg='NGL';a.team=t;a.cYrs=2;a.aav=1.1;e.tx.push(`His ${lg} play earns an NGL contract with the ${t}.`);e.tg.push('Transfer');e.nw=true;}
  else if(nfl&&a.optn&&a.py===3&&role==='Starter'&&perf>.6){a.cYrs+=1;a.optn=false;e.tx.push(`The ${a.team} pick up his fifth-year option.`);}
  else if(nfl&&a.cYrs===1&&role==='Starter'&&perf>=.7&&r()<.6){const aav=aiLp(AI_AAV[a.pos]||[2,20],aiCl(perf*1.05-.05,.15,1)),yrs=aiRi(r,3,5),gtd=Math.round(aav*yrs*(.4+r()*.25));a.cYrs+=yrs;a.aav=aav;e.tx.push(`Signs a ${yrs}-year extension with the ${a.team}: about ${aiMoney(aav*yrs)} (${aiMoney(aav)} per year, ${aiMoney(gtd)} guaranteed).`);e.nw=e.nw||aav>=(AI_AAV[a.pos]||[0,20])[1]*.8;}
  else if(a.cYrs<=0){
    const star=role==='Starter'&&perf>=.55;
    if(nfl&&star&&perf>=.85&&r()<.25){a.cYrs=1;a.aav=aiLp(AI_AAV[a.pos]||[2,20],.85);e.tx.push(`The ${a.team} use the franchise tag on him (about ${aiMoney(a.aav)} for one year).`);}
    else if(star&&r()<.8){const aav=aiLp(AI_AAV[a.pos]||[2,20],aiCl(perf*1.05-.05,.1,1)),yrs=aiRi(r,2,5),gtd=Math.round(aav*yrs*(.35+r()*.25));a.cYrs=yrs;a.aav=aav;
      if(r()<.4){a.team=aiPk(r,AI_NGL.filter(t=>t!==a.team));if(!nfl){a.lg='NGL';}e.tx.push(`Hits free agency and signs with the ${a.team}: ${yrs} years, about ${aiMoney(aav*yrs)} (${aiMoney(gtd)} guaranteed).`);e.tg.push('Transfer');e.nw=e.nw||perf>=.8;}
      else e.tx.push(`Re-signs with the ${a.team}: ${yrs} years, about ${aiMoney(aav*yrs)} (${aiMoney(gtd)} guaranteed).`);}
    else if(r()<.65){a.cYrs=aiRi(r,1,2);a.aav=1.2+r()*2;if(r()<.5){const t=aiPk(r,AI_NGL.filter(t=>t!==a.team));a.team=t;e.tx.push(`Signs a ${a.cYrs}-year veteran deal with the ${t}.`);e.tg.push('Transfer');}else e.tx.push('Re-signs on a short-term deal.');}
    else return aiRetire(a,p,e,r,y,age,'is not re-signed and decides to step away');
  }else if(nfl&&role==='Starter'&&a.py>=3&&r()<.05){const t=aiPk(r,AI_NGL.filter(t=>t!==a.team));e.tx.push(`Traded from the ${a.team} to the ${t}${r()<.5?' for a draft pick':' in a player swap'}.`);a.team=t;e.tg.push('Transfer');e.nw=true;}
  else if(nfl&&role==='Starter'&&a.py>=5&&r()<.08)e.tx.push('Voted a team captain.');
  return e;
}
function aiRetire(a,p,e,r,y,age,why){
  a.stage='post';a.retY=y;const s=aiTot(a.pos,a.pt);
  e.hl=`${p.fn} ${p.ln} ${why.startsWith('announces')?'retires':'ends his career'}`;e.tg.push('Retirement');e.nw=a.pb>0||a.py>=6;
  e.tx.push(`${p.fn} ${why} after ${a.py} season${a.py!==1?'s':''} in ${a.lg==='NGL'?'the NGL':'pro football'} (age ${age}).`);if(s)e.tx.push(`Career line: ${s}.`);
  const hi=[];if(a.pb)hi.push(`${a.pb} Pro All-Star${a.pb>1?'s':''}`);if(a.ap1)hi.push(`${a.ap1}x First-Team All-League`);if(a.sb)hi.push(`${a.sb} Gridiron Bowl title${a.sb>1?'s':''}`);if(a.mvp)hi.push(`${a.mvp>1?a.mvp+'x ':''}NGL MVP`);
  if(hi.length)e.tx.push('Honors: '+hi.join(', ')+'.');
  a.trk=Math.floor(r()*AI_TRK.length);e.tx.push(`${p.fn} ${AI_TRK[a.trk].s}.`);return e;
}
function aiPostY(a,p,Y,r,base){
  const y=base+Y-1,age=18+(Y-a.gy)-1;a.post++;let hl,tx=[],nw=false;const tg=[];const hs=aiHof(a),trk=AI_TRK[a.trk==null?0:a.trk];
  const yrsRet=a.retY!=null?y-a.retY:a.post;
  if(a.py&&a.lg==='NGL'&&!a.canton&&yrsRet>=5&&yrsRet<=25&&hs>=26){
    const first=yrsRet===5,pr=hs>=46?(first?.8:.9):hs>=36?(first?.2:.3):hs>=30?.1:.03;
    if(r()<pr){a.canton=y+1;hl=`${p.fn} ${p.ln} elected to the Gridiron Hall of Fame`;tx=[first?`A first-ballot Hall of Famer: ${p.fn} is voted into the Gridiron Hall of Fame in his first year of eligibility (Class of ${y+1}).`:`After ${yrsRet-4} years on the ballot, ${p.fn} is voted into the Gridiron Hall of Fame (Class of ${y+1}).`];tg.push('Hall of Fame');nw=true;}
    else{hl=`${p.fn} ${p.ln} named a Hall of Fame ${hs>=34?'finalist':'semifinalist'}`;tx=[`${p.fn} is a ${hs>=34?'finalist':'semifinalist'} for the Gridiron Hall of Fame but falls short this year.`];}
  }else if(a.aa1>=1&&!a.cfh&&a.colEnd&&y-a.colEnd>=10&&a.stage==='post'&&r()<aiCl(.004+a.aa1*.009+(a.hei?.05:0),0,.08)){
    a.cfh=y;hl=`${p.fn} ${p.ln} enters the College Football Hall of Fame`;tx=[`The former ${a.school} star is inducted into the College Football Hall of Fame in Atlanta.`];tg.push('Hall of Fame');nw=true;
  }else{hl=`${p.fn} ${p.ln}: life after football`;const l=trk.y[a.post-1];tx=[l?`${p.fn} ${l}.`:`${p.fn} stays active in the game as a respected alumnus.`];if(r()<.2)tx.push('Visits his old high school to talk with the current team.');}
  const doneAt=Math.min(8,trk.y.length+1);
  if(a.post>=doneAt&&!(a.py&&a.lg==='NGL'&&hs>=26&&!a.canton&&yrsRet<25)&&!(a.aa1&&!a.cfh&&a.colEnd&&y-a.colEnd<12)){a.done=true;tx.push(`${p.fn} remains a legend of the program.`);}
  if(a.post>=30)a.done=true;
  return aiEntry(a,y,age,'post',hl,tx,{tg,nw});
}
function aiLifeY(a,p,Y,r,base){
  const y=base+Y-1,age=18+(Y-a.gy)-1;a.post++;a.u=a.u||[];let k,g=0;do{k=Math.floor(r()*AI_LIFE2.length);}while(a.u.includes(k)&&g++<20);a.u.push(k);
  const tx=[`${p.fn} ${AI_LIFE2[k]}.`];if(a.post>=6){a.done=true;tx.push(`${p.fn} remains a well-loved face at the school.`);}
  return aiEntry(a,y,age,'life',`${p.fn} ${p.ln}: life after high school`,tx);
}
function aiFix(a){ // upgrade v1 states
  if(a.v===2)return;a.v=2;a.talent=a.talent||0;a.elig=a.elig!=null?a.elig:a.pl||0;a.spd=a.spd||65;a.str=a.str||65;a.awr=a.awr||65;a.gpa=a.gpa||3;a.aa1=a.aa1||a.awl.filter(x=>x.n==='First-Team All-American').length;
  if(a.lvl&&!a.tier)a.tier=aiTier(a);if(a.ap2==null)a.ap2=0;
}
function aiStep(a,p,Y,base,salt){
  base=base||2026;aiFix(a);const r=aiRng(aiH('step',p.id,Y,salt||''));
  if(Y===a.gy)return aiSign(a,p,Y,r,base);
  if(a.stage==='college')return aiCollege(a,p,Y,r,base);
  if(a.stage==='pro')return aiPro(a,p,Y,r,base);
  if(a.stage==='post')return aiPostY(a,p,Y,r,base);
  return aiLifeY(a,p,Y,r,base);
}
function aiProject(p,N){
  N=N||60;let nd=0,n1=0,nfl=0;const c=p.committed;let lvl=c&&c.lvl,school=c&&c.school;
  if(!lvl){const o=(p.offers||[]),ord=['FBS','FCS','D2','NAIA','D3','JUCO'];lvl=ord.find(l=>o.some(x=>x.lvl===l))||(p.rat>=72?'FCS':p.rat>=58?'D2':'D3');const of=o.find(x=>x.lvl===lvl);school=of&&of.school||null;}
  for(let i=0;i<N;i++){
    const q=Object.assign({},p,{gradYr:1,committed:{lvl,school:school||'Projection'}}),a=aiNew(q);a.talent=aiN(aiRng(aiH('pt',p.id,i)))*2.2;
    for(let Y=1;Y<=8&&a.stage==='college';Y++){try{aiStep(a,q,Y,2026,'proj'+i);}catch(e){break;}}
    if(a.lg==='NGL'){nfl++;if(a.pick){nd++;if(a.rd===1)n1++;}}
  }
  return{lvl,pDraft:nd/N,pR1:n1/N,pNfl:nfl/N};
}

