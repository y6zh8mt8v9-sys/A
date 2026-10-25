// v2.16 each state's real classifications, smallest first (the league and division names stay invented)
const USCLS={AL:['1A','2A','3A','4A','5A','6A','7A'],AK:['Division III','Division II','Division I'],AZ:['1A','2A','3A','4A','5A','6A'],AR:['2A','3A','4A','5A','6A','7A'],
  CA:['Division 7','Division 6','Division 5','Division 4','Division 3','Division 2','Division 1'],CO:['6-Man','8-Man','1A','2A','3A','4A','5A'],CT:['Class S','Class M','Class L','Class LL'],
  DE:['Division II','Division I'],FL:['Rural','1A','2A','3A','4A','5A','6A','7A'],GA:['A Division II','A Division I','2A','3A','4A','5A','6A'],HI:['Division II','Division I','Open Division'],
  ID:['1A D2','1A D1','2A','3A','4A','5A'],IL:['1A','2A','3A','4A','5A','6A','7A','8A'],IN:['1A','2A','3A','4A','5A','6A'],IA:['8-Man','A','1A','2A','3A','4A','5A'],
  KS:['8-Man D2','8-Man D1','1A','2A','3A','4A','5A','6A'],KY:['1A','2A','3A','4A','5A','6A'],LA:['Division IV','Division III','Division II','Division I','Select'],
  ME:['Class D','Class C','Class B','Class A'],MD:['1A','2A','3A','4A'],MA:['Division 8','Division 7','Division 6','Division 5','Division 4','Division 3','Division 2','Division 1'],
  MI:['Division 8','Division 7','Division 6','Division 5','Division 4','Division 3','Division 2','Division 1'],MN:['9-Man','A','2A','3A','4A','5A','6A'],
  MS:['1A','2A','3A','4A','5A','6A','7A'],MO:['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6'],MT:['6-Man','8-Man C','Class B','Class A','Class AA'],
  NE:['6-Man','Class D2','Class D1','Class C2','Class C1','Class B','Class A'],NV:['1A','2A','3A','4A','5A'],NH:['Division IV','Division III','Division II','Division I'],
  NJ:['Group 1','Group 2','Group 3','Group 4','Group 5','Non-Public B','Non-Public A'],NM:['6-Man','8-Man','2A','3A','4A','5A','6A'],
  NY:['8-Man','Class D','Class C','Class B','Class A','Class AA'],NC:['1A','2A','3A','4A','5A','6A','7A','8A'],ND:['9B','9A','11B','11A','11AA'],
  OH:['Division VII','Division VI','Division V','Division IV','Division III','Division II','Division I'],OK:['Class C','Class B','A','2A','3A','4A','5A','6A-II','6A-I'],
  OR:['1A','2A','3A','4A','5A','6A'],PA:['1A','2A','3A','4A','5A','6A'],RI:['Division IV','Division III','Division II','Division I'],SC:['1A','2A','3A','4A','5A'],
  SD:['9B','9A','9AA','11B','11A','11AA','11AAA'],TN:['1A','2A','3A','4A','5A','6A','D-II A','D-II AA'],TX:['1A Six-Man','2A','3A','4A','5A','6A'],UT:['1A','2A','3A','4A','5A','6A'],
  VT:['Division III','Division II','Division I'],VA:['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6'],WA:['1B','2B','1A','2A','3A','4A'],WV:['Class A','Class AA','Class AAA'],
  WI:['8-Player','Division 7','Division 6','Division 5','Division 4','Division 3','Division 2','Division 1'],WY:['6-Man','1A','2A','3A','4A']};
// three-letter school abbreviations like the scoreboards use: Allen High → AHS, Cedar Hill High → CHH, Waco Christian Academy → WCA
function abbr3(name,used){
  const W=String(name||'').replace(/[^A-Za-z\s'-]/g,' ').split(/[\s-]+/).filter(w=>/[A-Za-z]/.test(w)&&!/^(the|of|and)$/i.test(w));
  const core=W.filter(w=>!/^(High|School)$/i.test(w)),hi=W.some(w=>/^High$/i.test(w));
  const C=[],up=s=>s.toUpperCase().replace(/[^A-Z]/g,'');
  if(core.length===1)C.push(up(core[0][0]+(hi?'HS':'S')),up(core[0].slice(0,2)+'H'),up(core[0][0]+core[0].slice(-1)+'H'),up(core[0].slice(0,3)));
  else if(core.length===2)C.push(up(core[0][0]+core[1][0]+(hi?'H':'S')),up(core[0][0]+core[1][0]+'S'),up(core[0][0]+core[1].slice(0,2)),up(core[0].slice(0,2)+core[1][0]));
  else C.push(up(core.slice(0,3).map(w=>w[0]).join('')),up(core[0][0]+core[1][0]+core[core.length-1][0]),up(core[0][0]+core[1][0]+'H'));
  const L='ABCDEFGHIJKLMNOPRSTUVWY',base=C[0]||'HSX';
  for(const c of C)if(c.length===3&&!(used&&used.has(c))){used&&used.add(c);return c;}
  for(let i=0;i<L.length;i++){const c=base.slice(0,2)+L[i];if(!(used&&used.has(c))){used&&used.add(c);return c;}}
  return base.slice(0,3);
}
// ═══════════ v2.16 REAL USA: the 50 real states, their real counties and towns, fictional high schools ═══════════
// Geography: simplified Census county / state shapes (us-atlas, Albers USA with Alaska and Hawaii insets) and every
// town of 1,000+ people (GeoNames) placed in its real county. You pick which states are in your world (1 to 50) and
// your home state. League size follows each state's real number of high school football programs (about 1 in 8 of them,
// so all 50 states make the same size world as the classic country), and colleges, star counts and recruiting quotas
// scale with how much of the country you pick (never more than the real national numbers, e.g. 32 five-stars a class).
// College and pro names are invented: real places, never a real school's or team's name.
// [programs, region, flavor (classic state whose mascots / playbooks / names fit), class label style, strength]
const USST={AL:[400,'S','MG','nA',3],AK:[34,'W','AU','Div',-3],AZ:[260,'W','TA','nA',1],AR:[230,'S','AC','nA',1],CA:[1000,'W','CS','Div',3],
  CO:[270,'W','SU','nA',0],CT:[150,'NE','CF','Div',-1],DE:[48,'NE','CU','Div',-1],FL:[600,'S','CO','nA',4],GA:[450,'S','MG','nA',3],
  HI:[60,'W','KM','Div',0],ID:[140,'W','SU','nA',-1],IL:[560,'MW','WK','nA',1],IN:[330,'MW','WK','nA',1],IA:[330,'MW','WK','nA',0],
  KS:[340,'MW','GR','nA',0],KY:[230,'S','CU','nA',1],LA:[300,'S','AC','nA',3],ME:[80,'NE','CF','CBA',-3],MD:[200,'S','CU','nA',1],
  MA:[300,'NE','CF','Div',0],MI:[610,'MW','WK','Div',2],MN:[400,'MW','WK','nA',0],MS:[280,'S','MG','nA',2],MO:[360,'MW','WK','Cls',1],
  MT:[170,'W','GR','CBA',-2],NE:[290,'MW','GR','CBA',0],NV:[110,'W','SU','nA',0],NH:[70,'NE','CF','Div',-2],NJ:[330,'NE','CF','Grp',2],
  NM:[120,'W','TA','nA',-1],NY:[550,'NE','CF','CBA',0],NC:[420,'S','CU','nA',2],ND:[110,'MW','GR','A',-2],OH:[720,'MW','WK','Div',3],
  OK:[380,'S','LG','nA',2],OR:[250,'W','CS','nA',0],PA:[560,'NE','CU','nA',2],RI:[40,'NE','CF','Div',-2],SC:[230,'S','MG','nA',2],
  SD:[140,'MW','GR','A',-2],TN:[370,'S','CU','nA',2],TX:[1250,'S','LG','nA',4],UT:[130,'W','SU','nA',1],VT:[30,'NE','CF','Div',-3],
  VA:[320,'S','CU','Cls',2],WA:[380,'W','CS','nA',1],WV:[120,'S','CU','A',0],WI:[450,'MW','WK','Div',0],WY:[70,'W','GR','nA',-2]};
const USST_PROG_ALL=Object.values(USST).reduce((a,v)=>a+v[0],0);
let USA_SCALE=0.159; // v2.16 share of each state's real programs in the game: up to 45%, capped at about 2,600 schools in all (set by geoBuild)
const USA_BUDGET=2150,USA_MAXSCALE=0.45;
function usaScaleFor(states,X){const t=states.reduce((a,s)=>a+((X&&X.st[s]?X.st[s].meta:USST[s])||[0])[0],0)||1;return Math.min(USA_MAXSCALE,USA_BUDGET/t);}
const USA_REG={S:'The South',MW:'The Midwest',W:'The West',NE:'The Northeast'};
// the big-time programs: [state, name], strongest first. Invented names built from real places, never the real school's name.
const USFBS=[['AL','Black Warrior University'],['OH','Scioto University'],['GA','Classic City University'],['TX','Colorado River University'],['LA','Bayou State University'],
  ['OR','McKenzie River University'],['MI','Huron River University'],['IN','St. Joseph River University'],['SC','Keowee University'],['CA','Exposition Park University'],
  ['OK','Canadian River University'],['PA','Centre County University'],['FL','Peninsula University'],['TN','Smoky Mountain University'],['TX','Brazos Valley A&M'],
  ['FL','Coral Gables University'],['AL','Loachapoka Tech'],['FL','Tallahassee Capital State'],['MS','Lyceum University'],['IN','Monroe Lake University'],
  ['WA','Montlake University'],['SC','Congaree University'],['MO','Missouri River University'],['NE','Platte River University'],['WI','Four Lakes University'],
  ['IA','Cedar River University'],['UT','Wasatch University'],['KY','Bluegrass University'],['AR','Boston Mountains University'],['MS','Starkville A&M'],
  ['CA','Westwood University'],['MI','Red Cedar University'],['KY','Ohio Falls University'],['NC','Chapel Hill University'],['CO','Front Range University'],
  ['AZ','Saguaro State'],['TX','Bosque University'],['TX','Cowtown University'],['TX','Llano Estacado Tech'],['KS','Flint Hills State'],
  ['OK','Cimarron State'],['UT','Timpanogos University'],['CA','Palo Alto University'],['CA','Berkeley Hills University'],['FL','Space Coast University'],
  ['OH','Mill Creek University'],['TX','Buffalo Bayou University'],['AZ','Sonoran University'],['WV','Monongahela University'],['IA','Corn Belt State'],
  ['MN','North Star University'],['IL','Champaign Prairie University'],['IL','Lake Shore University'],['IN','West Lafayette Tech'],['MD','Chesapeake University'],
  ['NJ','Raritan University'],['NC','Raleigh Tech'],['NC','Bull City University'],['NC','Forsyth University'],['VA','Rivanna University'],
  ['VA','New River Tech'],['PA','Three Rivers University'],['NY','Adirondack University'],['MA','Chestnut Hill University'],['GA','Midtown Tech'],
  ['TN','Belle Meade University'],['KS','Mount Oread University'],['WA','Palouse State'],['OR',"Mary's River State"],['CA','Mission Bay State'],
  ['ID','Snake River University'],['TX','Highland Park University'],['LA','Crescent City University'],['TN','Bluff City University'],['FL','Tampa Bay University'],
  ['NV','Mojave State'],['NV','High Desert University'],['CA','Central Valley State'],['CA','Silicon Valley State'],['UT','Cache Valley State'],
  ['CO','Poudre Valley State'],['CO','Pikes Peak Academy'],['NM','Sandia University'],['NM','Mesilla Valley State'],['WY','Laramie Plains University'],
  ['HI','Leeward University'],['TX','Montrose University'],['TX','Denton State'],['TX','Franklin Mountains University'],['TX','Alamo City University'],
  ['TX','San Marcos River State'],['TX','Piney Woods State'],['LA','Ruston Tech'],['LA','Acadiana University'],['LA','Monroe Bayou Tech'],
  ['MS','Pine Belt University'],['AL','Birmingham Steel University'],['AL','Pike County State'],['AL','Mobile Bay University'],['AL','Anniston State'],
  ['FL','Gold Coast University'],['FL','Biscayne International'],['GA','Ogeechee State'],['GA','Peachtree State'],['GA','Cobb County State'],
  ['SC','Grand Strand University'],['NC','Mecklenburg State'],['NC','Pamlico State'],['NC','Blue Ridge State'],['VA','Tidewater University'],
  ['VA','Massanutten University'],['VA','Candler Mountain University'],['TN','Stones River State'],['KY','Barren River State'],['WV','Huntington River University'],
  ['OH','Portage State'],['OH','Athens Hills University'],['OH','Black Swamp State'],['OH','Maumee University'],['OH','Rubber City University'],
  ['OH','Talawanda University'],['MI','Chippewa River State'],['MI','Kalamazoo River State'],['MI','Ypsilanti State'],['IN','Muncie State'],
  ['IL','DeKalb State'],['NY','Niagara Frontier University'],['NY','Hudson Highlands Academy'],['MD','Severn Academy'],['MA','Pioneer Valley University'],
  ['CT','Nutmeg University'],['OK','Arkansas River University'],['AR','Jonesboro A&M'],['DE','Brandywine University'],['MO','Ozark Plateau State'],
  ['ID','Clearwater University'],['MT','Bitterroot University'],['MT','Gallatin State'],['ND','Red River Valley State'],['SD','Jackrabbit Prairie State'],['PA','Broad Street University']];
// lower levels, national totals for all 50 states (the classic country's sizes)
const USCOL_TOT={FCS:129,D2:153,D3:222,NAIA:87,JUCO:109},USFBS_TOT=137;
// town names that real colleges already use with these endings: skipped for generated names
const USCOL_BLOCK=new Set(('Kent|Ball|Boise|Fresno|San Jose|San Diego|Sacramento|Portland|Wichita|Youngstown|Murray|Morehead|Jacksonville|Delaware|Montana|Weber|Idaho|Iowa|Kansas|Ohio|Oregon|Washington|Texas|Florida|Georgia|Arizona|Michigan|Mississippi|Alabama|Missouri|Illinois|Indiana|Kennesaw|Alcorn|Jackson|Norfolk|Morgan|Coppin|Savannah|Albany|Valdosta|Augusta|Columbus|Pittsburg|Emporia|Fort Hays|Truman|Ferris|Grand Valley|Saginaw Valley|Wayne|Bemidji|St. Cloud|Winona|Dickinson|Minot|Mayville|Valley City|Chadron|Peru|Angelo|Sul Ross|Midwestern|Tarleton|Henderson|Delta|Fayetteville|Winston-Salem|Elizabeth City|Bowie|Frostburg|Plymouth|Keene|Fitchburg|Framingham|Bridgewater|Westfield|Worcester|Salem|Adams|Black Hills|Northern|Southern|Eastern|Western|Central|Humboldt|Chico|Sonoma|Kearney|Wayne|Arkansas|Tennessee|Kentucky|Louisiana|Nicholls|McNeese|Grambling|Norfolk|Cleveland|Cortland|Ithaca|Springfield|Hampton|Howard|Lincoln|Cheyney|Kutztown|Shippensburg|Millersville|Bloomsburg|Clarion|Edinboro|Mansfield|Lock Haven|Slippery Rock|West Chester|California|Concord|Shepherd|Fairmont|Glenville|Marshall|Austin|Stephen F. Austin|Sam Houston|Abilene|Hardin|Howard Payne|Wofford|Furman|Citadel|Rice|Duke|Tulane|Tulsa|Toledo|Akron|Buffalo|Temple|Memphis|Houston|Miami|Charlotte|Liberty|Troy|Army|Navy|Air Force|Hawaii|Nevada|Utah|Wyoming|Colorado|Minnesota|Wisconsin|Nebraska|Rutgers|Syracuse|Boston|Pittsburgh|Louisville|Cincinnati|Baylor|Clemson|Auburn|Purdue|Stanford|Vanderbilt|Princeton|Yale|Harvard|Brown|Dartmouth|Cornell|Columbia|Penn|Villanova|Richmond|Towson|Monmouth|Albany|Stony Brook|Maine|New Hampshire|Rhode Island|Vermont|Hofstra|Fordham|Lehigh|Lafayette|Bucknell|Colgate|Holy Cross|Georgetown|Marist|Drake|Butler|Dayton|Valparaiso|Davidson|Stetson|Mercer|Samford|Campbell|Elon|Gardner-Webb|Presbyterian|Chattanooga|Austin Peay|Lamar|Prairie View|Alabama A&M|Jackson|Bethune|Florida A&M|Southern Utah|Northern Arizona|Portland State|Sacramento|Davis|Cal Poly|Abilene|Incarnate Word|Tarleton|Utah Tech|Lindenwood|Southeast Missouri|Eastern Illinois|Western Illinois|Murray|Tennessee Tech|UT Martin|Indiana State|Illinois State|North Dakota|South Dakota|Youngstown|Montana Tech|Carroll|Kearney|Lewis and Clark|Lewis-Clark|Northwest|Southwest|Southeast|Northeast|Lake Superior|Lake Erie|Coastal|Gulf Coast|Mount Union|Mount St. Joseph').split('|'));
// 32 pro teams in real football markets with invented nicknames
const USPRO=['Arizona Scorpions','Atlanta Firebirds','Baltimore Clippers','Buffalo Blizzard','Carolina Copperheads','Chicago Ironmen','Cincinnati Pilots','Cleveland Foundrymen',
  'Dallas Wranglers','Denver Peaks','Detroit Motormen','Green Bay Lumberjacks','Houston Wildcatters','Indianapolis Racers','Jacksonville Manatees','Kansas City Stampede',
  'Las Vegas High Rollers','Los Angeles Condors','Los Angeles Quakes','Miami Barracudas','Minnesota Voyageurs','New England Lobstermen','New Orleans Krewe','New York Knights',
  'New York Harbor Kings','Philadelphia Founders','Pittsburgh Smelters','San Francisco Fog','Seattle Sasquatch','Tampa Bay Pelicans','Tennessee Thunder','Washington Statesmen'];
const USA={on:false,cfg:null,home:null,code:{},ab:{},rest:[],geo:null,cnty:{}};
function usaCode(ab){return ab===USA.home?'CF':ab==='CO'?'COL':ab;}
// decode the packed shapes: half-unit grid, zigzag deltas in a 64-symbol alphabet (32 continue + 32 final)
const _UGA='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_';let _UGI=null;
function _ugDec(s){if(!_UGI){_UGI={};for(let i=0;i<64;i++)_UGI[_UGA[i]]=i;}const out=[];let i=0,x=0,y=0;
  const num=()=>{let n=0,sh=0;for(;;){const v=_UGI[s[i++]];if(v>=32){n+=(v-32)*Math.pow(2,sh);sh+=5;}else{n+=v*Math.pow(2,sh);break;}}return n%2?-(n+1)/2:n/2;};
  while(i<s.length){x+=num();y+=num();out.push([x/2,y/2]);}return out;}
function _ugRings(p){return p.split('~').map(_ugDec).filter(r=>r.length>=3);}
function _ugArea(P){let A=0;for(let k=0;k<P.length;k++){const a=P[k],b=P[(k+1)%P.length];A+=a[0]*b[1]-b[0]*a[1];}return A/2;}
function _ugCen(P){let A=0,cx=0,cy=0;for(let k=0;k<P.length;k++){const a=P[k],b=P[(k+1)%P.length],c=a[0]*b[1]-b[0]*a[1];A+=c;cx+=(a[0]+b[0])*c;cy+=(a[1]+b[1])*c;}
  if(Math.abs(A)<1e-6){const n=P.length;return[P.reduce((s,p)=>s+p[0],0)/n,P.reduce((s,p)=>s+p[1],0)/n];}return[cx/(3*A),cy/(3*A)];}
// geography decoded once
function usaGeo(){
  if(USA.geo)return USA.geo;const st={},cn={};
  for(const ab in USGEO.st){const R=_ugRings(USGEO.st[ab].p).sort((a,b)=>Math.abs(_ugArea(b))-Math.abs(_ugArea(a)));st[ab]={name:USGEO.st[ab].n,rings:R};cn[ab]=[];}
  for(const[ab,nm,p,tw]of USGEO.c){const R=_ugRings(p).sort((a,b)=>Math.abs(_ugArea(b))-Math.abs(_ugArea(a)));if(!R.length||!cn[ab])continue;
    const towns=tw?tw.split(';').map(x=>{const[n,k]=x.split('|');return[n,+k||1];}):[];
    cn[ab].push({ab,key:ab+'|'+nm,name:nm,rings:R,towns,pop:Math.max(2,towns.reduce((a,t)=>a+t[1],0))});}
  return USA.geo={st,cn};
}
// outline of a group of counties: the edges only one county uses are the border (neighbors share their edges exactly)
function usaUnion(cs){const E=new Map(),k=p=>p[0]+','+p[1];
  for(const c of cs)for(const r of c.rings)for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length],ka=k(a),kb=k(b);if(ka===kb)continue;const key=ka<kb?ka+'|'+kb:kb+'|'+ka,e=E.get(key);if(e)e.n++;else E.set(key,{a,b,ka,kb,n:1});}
  const adj=new Map(),add=(p,e)=>{let l=adj.get(p);if(!l)adj.set(p,l=[]);l.push(e);};for(const e of E.values())if(e.n===1){add(e.ka,e);add(e.kb,e);}
  const used=new Set(),rings=[];
  for(const e0 of E.values()){if(e0.n!==1||used.has(e0))continue;used.add(e0);const ring=[e0.a];let cur=e0.kb,cp=e0.b;
    for(let g=0;g<200000&&cur!==e0.ka;g++){ring.push(cp);const nx=(adj.get(cur)||[]).find(x=>!used.has(x));if(!nx)break;used.add(nx);if(nx.ka===cur){cur=nx.kb;cp=nx.b;}else{cur=nx.ka;cp=nx.a;}}
    if(ring.length>=3)rings.push(ring);}
  return rings.sort((a,b)=>Math.abs(_ugArea(b))-Math.abs(_ugArea(a)));}
const USA_RESERVED=new Set(['CF','WK','TA','LG','CO','MG','AC','CU','SU','GR','CS','AU','KM','COL','INTL','OOS','NAT','ALL','ST']);
function usaCustomClean(cu){const seen=new Set();return(Array.isArray(cu)?cu:[]).slice(0,30).map(c=>({ab:String((c&&c.ab)||'').toUpperCase().replace(/[^A-Z]/g,'').slice(0,3),name:wsClean(c&&c.name),
  counties:Array.isArray(c&&c.counties)?[...new Set(c.counties.slice(0,4000).map(x=>String(x).slice(0,60)))]:[]})).filter(c=>c.ab.length>=2&&c.name&&!USST[c.ab]&&!USA_RESERVED.has(c.ab)&&!seen.has(c.ab)&&seen.add(c.ab));}
function usaWorld(custom){
  const cu=usaCustomClean(custom),key=JSON.stringify(cu);if(USA._wk===key&&USA._w)return USA._w;
  const G0=usaGeo(),st={},byKey=new Map(),owner={},popOf={};for(const ab in G0.st){popOf[ab]=G0.cn[ab].reduce((a,c)=>a+c.pop,0);for(const c of G0.cn[ab])byKey.set(c.key,c);}
  const take=new Map();for(const c of cu)for(const k of c.counties)if(byKey.has(k)&&!take.has(k))take.set(k,c.ab);
  for(const ab in G0.st){const cs=G0.cn[ab].filter(c=>!take.has(c.key));if(!cs.length)continue;const ch=cs.length!==G0.cn[ab].length,M=USST[ab].slice();
    if(ch)M[0]=Math.max(4,Math.round(M[0]*cs.reduce((a,c)=>a+c.pop,0)/popOf[ab]));
    st[ab]={name:G0.st[ab].name,abbr:ab,rings:ch?usaUnion(cs):G0.st[ab].rings,counties:cs,meta:M,custom:false};}
  for(const c of cu){const cs=c.counties.map(k=>byKey.get(k)).filter(x=>x&&take.get(x.key)===c.ab);if(!cs.length)continue;
    // a custom state is as big as the people it took, and plays like the state most of them came from
    const by={};let prog=0;for(const x of cs){prog+=USST[x.ab][0]*x.pop/popOf[x.ab];by[x.ab]=(by[x.ab]||0)+x.pop;}
    const main=Object.keys(by).sort((a,b)=>by[b]-by[a])[0],M=USST[main].slice();M[0]=Math.max(4,Math.round(prog));
    st[c.ab]={name:c.name,abbr:c.ab,rings:usaUnion(cs),counties:cs,meta:M,custom:true};}
  for(const ab in G0.st){const t={};for(const c of G0.cn[ab]){const o=take.get(c.key)||ab;t[o]=(t[o]||0)+c.pop;}owner[ab]=Object.keys(t).sort((a,b)=>t[b]-t[a])[0];}
  USA._wk=key;return USA._w={st,owner,custom:cu};
}
function usaDefault(){return{mode:'usa',states:Object.keys(USST),home:'TX',v:2};}
// detailed states get full rosters; every other state is light: real schools, results, state playoffs and its top prospects
const USA_DETAIL_MAX=5,USA_DETAIL_CAP=1500; // schools in full detail (all detailed states together); the home state always fits
function usaDetailSize(list,X){return list.reduce((a,ab)=>a+usaTeams(ab,X,1),0);}
function usaDetailFix(list,home,sel,X){const out=[home];for(const a of list){if(out.length>=USA_DETAIL_MAX)break;if(a===home||!sel.includes(a)||out.includes(a))continue;
    if(usaDetailSize(out.concat(a),X)>USA_DETAIL_CAP)continue;out.push(a);}return out;}
function usaAutoDetail(sel,home,X){const c=ab=>_ugCen(X.st[ab].rings[0]),h=c(home);
  return usaDetailFix(sel.filter(a=>a!==home&&a!=='AK'&&a!=='HI').sort((a,b)=>{const p=c(a),q=c(b);return Math.hypot(p[0]-h[0],p[1]-h[1])-Math.hypot(q[0]-h[0],q[1]-h[1]);}),home,sel,X);}
function usaNorm(cfg){const X=usaWorld(cfg&&cfg.custom),all=Object.keys(X.st);let s=(cfg&&Array.isArray(cfg.states)?cfg.states:all).filter(a=>X.st[a]);if(!s.length)s=[X.st.TX?'TX':all[0]];
  s=[...new Set(s)].sort();let h=cfg&&X.st[cfg.home]&&s.includes(cfg.home)?cfg.home:s.slice().sort((a,b)=>X.st[b].meta[0]-X.st[a].meta[0])[0];const o={mode:'usa',states:s,home:h};if(X.custom.length)o.custom=X.custom;
  if(cfg&&cfg.v===1){o.v=1;if(Array.isArray(cfg.detail))o.detail=[h,...cfg.detail.filter(a=>a!==h&&s.includes(a))].slice(0,USA_DETAIL_MAX);return o;} // a career saved before light states: every chosen state keeps full detail at the scaled size
  o.v=2;o.detail=cfg&&Array.isArray(cfg.detail)?usaDetailFix(cfg.detail,h,s,X):usaAutoDetail(s,h,X);return o;}
// class labels in each state's style, smallest class first
function usaTeams(ab,X,sc){const w=X||USA.X,m=w&&w.st[ab]?w.st[ab].meta:USST[ab];return m?Math.max(16,Math.round(m[0]*(sc||USA_SCALE))):16;}
function usaTeamsReal(ab,sc){return Math.max(16,Math.round(USST[ab][0]*(sc||USA_SCALE)));}
// a state's classification list (custom states use the one of the state most of their people came from)
function usaClsList(ab,X){const w=X||USA.X,st=w&&w.st[ab];if(USCLS[ab])return USCLS[ab];const c=st&&st.counties;if(c&&c.length){const by={};for(const x of c)by[x.ab]=(by[x.ab]||0)+x.pop;const m=Object.keys(by).sort((a,b)=>by[b]-by[a])[0];return USCLS[m]||['1A','2A','3A','4A'];}return['1A','2A','3A','4A'];}
// ── the snapshot of the classic world, so a classic save can be loaded after a real-USA career in the same session ──
let _geoClassic=null,_geoMode='classic';
function _geoSnap(){if(_geoClassic)return;const cp=o=>JSON.parse(JSON.stringify(o));
  _geoClassic={XST:cp(XST),XCLS:cp(XCLS),XCLS_ORDER:XCLS_ORDER.slice(),ST_ORDER:ST_ORDER.slice(),XDIV_NAMES:cp(XDIV_NAMES),MAP_STATES:Object.assign({},MAP_STATES),MAPC:MAPC.slice(),
    CLS_SZ:cp(CLS_SZ),DIV_NAMES:cp(DIV_NAMES),CF_NAME,col:{FBS:D1FBS.slice(),FCS:D1FCS.slice(),D2:D2.slice(),D3:D3.slice(),NAIA:NAIA.slice(),JUCO:JUCO.slice()},
    NGL:AI_NGL.slice(),VEN:NAT_VENUES.slice(),HSQ:cp(COL_HS_Q),XNAMES_CF:XNAMES.CF,XMASC_CF:XMASC.CF,XOFF_CF:XOFF.CF};}
const _repl=(o,n)=>{for(const k in o)delete o[k];Object.assign(o,n);};
function geoBuild(cfg){
  _geoSnap();const want=cfg&&cfg.mode==='usa'?usaNorm(cfg):null,key=want?JSON.stringify(want):'classic';
  if(key===_geoMode)return false;_geoMode=key;_worldOrig=null;
  const C=_geoClassic,cp=o=>JSON.parse(JSON.stringify(o));
  if(!want){USA.on=false;USA.cfg=null;
    _repl(XST,cp(C.XST));_repl(XCLS,cp(C.XCLS));_setArr(XCLS_ORDER,C.XCLS_ORDER);_setArr(ST_ORDER,C.ST_ORDER);_repl(XDIV_NAMES,cp(C.XDIV_NAMES));
    _repl(MAP_STATES,C.MAP_STATES);_setArr(MAPC,C.MAPC);_repl(CLS_SZ,cp(C.CLS_SZ));_repl(DIV_NAMES,cp(C.DIV_NAMES));CF_NAME=C.CF_NAME;
    _setArr(D1FBS,C.col.FBS);_setArr(D1FCS,C.col.FCS);_setArr(D2,C.col.D2);_setArr(D3,C.col.D3);_setArr(NAIA,C.col.NAIA);_setArr(JUCO,C.col.JUCO);
    for(const k in CF_LBL)delete CF_LBL[k];USA_SCALE=0.159;
    _setArr(AI_NGL,C.NGL);_setArr(NAT_VENUES,C.VEN);_repl(COL_HS_Q,cp(C.HSQ));NAT_POOL_FULL=22000;
    XNAMES.CF=C.XNAMES_CF;XMASC.CF=C.XMASC_CF;XOFF.CF=C.XOFF_CF;for(const k of['XNAMES','XMASC','XOFF']){const o={XNAMES,XMASC,XOFF}[k];for(const s in o)if(s.length===2&&USST[s]&&!C.XST[s]&&s!=='CO')delete o[s];}
    buildColleges();return true;}
  const G0=usaGeo(),X=usaWorld(want.custom),sel=want.states;USA.X=X;USA.on=true;USA_SCALE=want.v===1?usaScaleFor(sel,X):1;USA.detail=want.v===1?(want.detail||sel).slice():want.detail.slice();USA.virt=0;USA.cur={};USA.cfg=want;USA.home=want.home;USA.code={};USA.ab={};
  for(const ab of sel){const c=usaCode(ab);USA.code[ab]=c;USA.ab[c]=ab;}
  const rnd=_colRand('usa|'+key);const pick=a=>a[Math.floor(rnd()*a.length)];
  // classes and divisions for every state; the home state uses the 1A-5A slots
  _repl(XST,{});_repl(XCLS,{});XCLS_ORDER.length=0;ST_ORDER.length=0;_repl(XDIV_NAMES,{});ST_ORDER.push('CF');
  const order=sel.filter(a=>a!==want.home).sort((a,b)=>X.st[a].name.localeCompare(X.st[b].name));
  const divNames=(ab,n)=>{const cs=X.st[ab].counties.slice().sort((a,b)=>b.pop-a.pop),out=[],used=new Set(),dist=['TX','LA','OK','AL','MS','GA','AR','NM'].includes(ab);
    for(let i=0;out.length<n;i++){if(dist||i>=cs.length*2){out.push((dist?'District ':'Region ')+(out.length+1));continue;}const c=cs[i%cs.length],nm=`${c.name} ${pick(['Conference','League','Valley Conference','Area Conference','Athletic League'])}`;if(!used.has(nm)){used.add(nm);out.push(nm);}}
    return out;};
  const meanEq={'1A':46,'2A':50,'3A':54,'4A':58,'5A':62},rEq={'1A':[28,38],'2A':[34,46],'3A':[42,56],'4A':[50,66],'5A':[58,78]};
  for(const ab of[want.home,...order]){
    const M=X.st[ab].meta,N=usaTeams(ab),code=usaCode(ab),nm=X.st[ab].name;
    if(code==='CF'){const sz={},RL=usaClsList(ab,X);
      // the home state plays in the five 1A-5A slots, named after its own classes
      for(const k in CF_LBL)delete CF_LBL[k];
      {let lab=RL.slice(-5);if(RL.length<5){const o=[0,1,2,3,4].map(i=>RL[Math.floor(i*RL.length/5)]),cnt={},seen={};o.forEach(x=>cnt[x]=(cnt[x]||0)+1);
        lab=o.map(x=>{if(cnt[x]<2)return x;seen[x]=(seen[x]||0)+1;return x+' '+['I','II','III'][cnt[x]-seen[x]];});} // fewer than five real classes: split the small ones (Class S II, Class S I)
       CLS_ORDER.forEach((c,i)=>{CF_LBL[c]=lab[i];});}
      const EXTRA=RL.length>5?RL.slice(0,RL.length-5):[],nC=5+EXTRA.length;
      CLS_ORDER.forEach((c,i)=>{const t=Math.max(8,Math.round(N/nC)),d=Math.max(1,Math.round(t/8));sz[c]={r:rEq[c].map(v=>v+M[4]),t,d};});
      // the classes below the five main ones (six-man, eight-man, the smallest divisions) are real leagues of the home state too
      {let dsum=0;EXTRA.forEach((lb,i)=>{const c='CF-'+(i+1),t=Math.max(8,Math.round(N/nC)),d=Math.max(1,Math.round(t/8));
        XCLS[c]={st:'CF',lbl:lb,t,d,r:rEq['1A'].map(v=>v+M[4]-3),mean:meanEq['1A']+M[4]*0.6-2,eq:'1A',home:1};XCLS_ORDER.push(c);dsum+=d;});
       if(EXTRA.length)XDIV_NAMES.CF=divNames(ab,dsum).map(n=>n);}
      _repl(CLS_SZ,sz);const all=divNames(ab,CLS_ORDER.reduce((s,c)=>s+sz[c].d,0));let k=0;const dv={};for(const c of CLS_ORDER){dv[c]=all.slice(k,k+sz[c].d);k+=sz[c].d;}_repl(DIV_NAMES,dv);
      CF_NAME=nm;continue;}
    const lb=usaClsList(ab,X),n=lb.length,w=lb.map(()=>1),ws=n;
    const cls=[];let dtot=0;
    for(let i=0;i<n;i++){const c=code+'-'+(i+1),eq=['1A','2A','3A','4A','5A'][Math.round(i*4/Math.max(1,n-1))],t=Math.max(8,Math.round(N*w[i]/ws)),d=Math.max(1,Math.round(t/8));
      const lite=!USA.detail.includes(ab);
      XCLS[c]={st:code,lbl:lb[i],t,d,r:rEq[eq].map(v=>v+M[4]),mean:meanEq[eq]+M[4]*0.6,eq};if(lite){XCLS[c].lite=true;USA.virt+=t*(XCLS[c].r[0]+XCLS[c].r[1])/8;}cls.push(c);XCLS_ORDER.push(c);dtot+=d;}
    XST[code]={name:nm,abbr:ab,tag:`${USA_REG[M[1]]} · ${N.toLocaleString()} schools · ${lb[0]} to ${lb[lb.length-1]}${USA.detail.includes(ab)?' · full detail':' · light: results, playoffs and top prospects'}`,cls};if(!USA.detail.includes(ab))XST[code].lite=true;XDIV_NAMES[code]=divNames(ab,dtot);ST_ORDER.push(code);
    // regional flavor borrowed from the classic state it resembles
    const F=M[2];XMASC[code]=XMASC[F]||MCTS;if(XOFF[F])XOFF[code]=XOFF[F];if(XNAMES[F])XNAMES[code]=XNAMES[F];else delete XNAMES[code];}
  {const F=X.st[want.home].meta[2];XNAMES.CF=XNAMES[F]||C.XNAMES_CF;XMASC.CF=XMASC[F]||C.XMASC_CF;XOFF.CF=XOFF[F]||C.XOFF_CF;}
  // map: the chosen states and their real counties; the rest of the country is drawn as grey land
  _repl(MAP_STATES,{});MAPC.length=0;USA.rest=[];
  for(const ab in X.st){const S=X.st[ab],path=S.rings.map(_polyPath).join(' ');
    if(!USA.code[ab]){const c=_ugCen(S.rings[0]);USA.rest.push({ab,name:S.name,path,lx:c[0],ly:c[1]});continue;}
    const code=USA.code[ab],xs=S.rings.flat().map(p=>p[0]),ys=S.rings.flat().map(p=>p[1]);let[lx,ly]=_ugCen(S.rings[0]);
    if(ab==='HI'){lx=(Math.min(...xs)+Math.max(...xs))/2;ly=Math.max(...ys)+8;}
    const land=(_geoClassic.MAP_STATES[X.st[ab].meta[2]]||_geoClassic.MAP_STATES.TA).land;
    MAP_STATES[code]={name:S.name,polys:S.rings,poly:S.rings[0],path,land,tag:code==='CF'?`Your home state · ${usaTeams(ab).toLocaleString()} schools · full detail`:XST[code].tag,bb:[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)],lx,ly};
    for(const c of X.st[ab].counties){const[cx,cy]=_ugCen(c.rings[0]);MAPC.push({id:MAPC.length,st:code,name:c.name,key:c.key,pts:c.rings[0],multi:c.rings.length>1?c.rings:null,ptsStr:'',cx,cy,teams:[],offers:[],towns:c.towns,pop:c.pop});}}
  USA.cnty={};for(const c of MAPC)(USA.cnty[c.st]=USA.cnty[c.st]||[]).push(c);
  USA.cid={};for(const c of MAPC)if(c.key)USA.cid[c.key]=c.id;
  // colleges: the big programs of the chosen states (topped up from the nearest states), the lower levels in proportion
  const share=sel.reduce((a,s)=>a+X.st[s].meta[0],0)/USST_PROG_ALL,cen={};for(const ab in X.st)cen[ab]=_ugCen(X.st[ab].rings[0]);
  const near=ab=>{const[x,y]=cen[ab];return Object.keys(X.st).filter(s=>!sel.includes(s)).sort((a,b)=>Math.hypot(cen[a][0]-x,cen[a][1]-y)-Math.hypot(cen[b][0]-x,cen[b][1]-y));};
  let fbs=USFBS.filter(([s])=>sel.includes(X.owner[s])).map(x=>x[1]);const fbsWant=Math.max(4,Math.round(USFBS_TOT*share));
  if(fbs.length<fbsWant){const add=[];for(const s of near(want.home))for(const[ss,n]of USFBS)if(X.owner[ss]===s&&!fbs.includes(n)&&add.length<fbsWant-fbs.length)add.push(n);fbs=USFBS.map(x=>x[1]).filter(n=>fbs.includes(n)||add.includes(n));}
  const used=new Set(fbs),gen=(lvl)=>{const tot=Math.max(3,Math.round(USCOL_TOT[lvl]*share)),out=[],w=sel.map(s=>X.st[s].meta[0]),ws=w.reduce((a,b)=>a+b,0);
    for(let i=0;out.length<tot&&i<tot*40;i++){let r=rnd()*ws,k=0;for(;k<sel.length-1;k++){r-=w[k];if(r<=0)break;}const ab=sel[k],cs=X.st[ab].counties;if(!cs.length)continue;
      const c=cs[Math.floor(Math.pow(rnd(),lvl==='D3'||lvl==='NAIA'?1.6:1.2)*cs.length)],tw=c.towns.length?c.towns[Math.floor(rnd()*Math.min(4,c.towns.length))][0]:c.name;
      let nm;const rr=rnd();
      if(lvl==='JUCO')nm=rr<0.5?`${c.name} County CC`:rr<0.8?`${tw} Community College`:`${tw} Junior College`;
      else if(lvl==='NAIA')nm=`${tw} ${pick(['Christian','Wesleyan','Baptist','Nazarene','Methodist','College'])}`;
      else if(lvl==='D3')nm=rr<0.35?`${tw} College`:rr<0.6?`${tw} ${pick(['Lutheran','Wesleyan','Presbyterian','Methodist'])}`:rr<0.8?`Saint ${pick(['Ambrose','Bede','Cyril','Dunstan','Edmund','Felix','Gregory','Hilary','Jerome','Kilian','Lucian','Martin','Norbert','Oswald','Quentin','Rupert','Silas','Teresa','Ursula','Vincent'])} College`:`${tw} University`;
      else if(lvl==='D2')nm=rr<0.55?`${tw} State`:rr<0.8?`${c.name} State`:`${tw} University`;
      else nm=rr<0.6?`${tw} State`:rr<0.8?`${c.name} Valley University`:`${tw} Tech`;
      const base=nm.replace(/ (State|University|College|Tech|Christian|Wesleyan|Baptist|Nazarene|Methodist|Lutheran|Presbyterian|Community College|Junior College|County CC|Valley University)$/,'');
      if(USCOL_BLOCK.has(base)||used.has(nm)||nm.length>34)continue;used.add(nm);out.push(nm);}
    return out;};
  _setArr(D1FBS,fbs);_setArr(D1FCS,gen('FCS'));_setArr(D2,gen('D2'));_setArr(D3,gen('D3'));_setArr(NAIA,gen('NAIA'));_setArr(JUCO,gen('JUCO'));
  // keep recruiting as balanced as the full country: a level with more colleges than its share signs fewer high schoolers each
  const H=cp(C.HSQ),ratio=(lvl,n)=>clamp((lvl==='FBS'?USFBS_TOT:USCOL_TOT[lvl])*share/Math.max(1,n),0.15,1);
  for(const[lvl,n]of[['FBS',fbs.length],['FCS',D1FCS.length],['D2',D2.length],['D3',D3.length],['NAIA',NAIA.length],['JUCO',JUCO.length]])H[lvl]=H[lvl].map(v=>Math.max(1,Math.round(v*ratio(lvl,n))));
  _repl(COL_HS_Q,H);
  _setArr(AI_NGL,USPRO);
  // national championship sites: the biggest towns of the chosen states
  const big=[];for(const ab of sel)for(const c of X.st[ab].counties)for(const t of c.towns.slice(0,1))big.push([t[1],`${t[0]}, ${ab}`]);
  big.sort((a,b)=>b[0]-a[0]);_setArr(NAT_VENUES,big.slice(0,10).map(([,n],i)=>`${n} ${['Stadium','Bowl','Field','Coliseum','Memorial Stadium'][i%5]}`));
  NAT_POOL_FULL=Math.round(13.2*Object.keys(USST).reduce((a,s)=>a+usaTeamsReal(s),0));
  // more schools per state means more seniors for the same colleges: each college takes more high schoolers (never past its class size)
  {const Tsel=want.v===1?sel.reduce((a,s)=>a+usaTeams(s),0):USA.detail.reduce((a,s)=>a+usaTeams(s),0)+sel.filter(s=>!USA.detail.includes(s)).reduce((a,s)=>a+liteQuota(s,12),0)/13.2,m=clamp(13.2*Tsel/(22000*Math.max(0.01,share)),1,6);for(const lvl in COL_HS_Q){const cap=(COL_CLS_RNG[lvl]||[20,26])[1];COL_HS_Q[lvl]=COL_HS_Q[lvl].map(v=>Math.max(1,Math.min(cap,Math.round(v*m))));}} // seniors in a full 50-state class (about 13.2-13.8 a school): stars never pass the national numbers
  buildColleges();return true;
}
// ── fictional high schools in real towns: bigger classes in the bigger towns, small schools out in the country ──
const USHS_PATRON=['Lincoln','Roosevelt','Jefferson','Washington','Franklin','Madison','Monroe','Kennedy','Truman','Eisenhower','Wilson','Hamilton','Adams','Jackson','Grant','Marshall','Edison','Carver','Douglass','Whitman'];
function usaSchoolName(code,frac,used){
  const cs=USA.cnty[code]||[],ab=USA.ab[code]||code;if(!cs.length)return{nm:`${stName(code)} Prep ${used.size}`,city:stName(code),cnty:null};
  // pick a county: big schools follow population, small ones are spread over the countryside
  const a=0.25+frac*1.1,ws=cs.map(c=>Math.pow(c.pop,a)),wt=ws.reduce((x,y)=>x+y,0);
  for(let k=0;k<300;k++){let r=Math.random()*wt,i=0;for(;i<cs.length-1;i++){r-=ws[i];if(r<=0)break;}const c=cs[i],T=c.towns;
    const tw=T.length?(frac>0.6?T[Math.floor(Math.random()*Math.min(2,T.length))]:frac>0.3?T[Math.floor(Math.random()*Math.min(5,T.length))]:T[Math.floor(Math.random()*T.length)]):null;
    const town=tw?tw[0]:c.name,big=tw&&tw[1]>=60,cw=ab==='LA'?'Parish':ab==='AK'?'Borough':'County',r2=Math.random();let nm;
    if(big&&frac>0.4&&r2<0.55)nm=r2<0.3?`${town} ${pick(['North','South','East','West','Central','Northwest','Southeast'])} High`:`${town} ${pick(USHS_PATRON)} High`;
    else if(!tw||r2<0.12)nm=/ City$/.test(c.name)?`${c.name} High`:`${c.name} ${cw} High`;
    else if(frac<0.35&&r2<0.24&&T.length>1){const t2=T[1+Math.floor(Math.random()*(T.length-1))][0];if(t2===town)continue;nm=`${town}-${t2} High`;}
    else if(r2<0.3)nm=`${town} ${pick(['Christian Academy','Catholic','Prep','Academy'])}`;
    else if(frac>0.5&&r2<0.45)nm=`${town} Senior High`;
    else nm=`${town} High`;
    if(nm.length>34||used.has(nm))continue;used.add(nm);return{nm,city:`${town}, ${ab}`,cnty:c.id};}
  const n=`${stName(code)} Prep ${used.size}`;used.add(n);return{nm:n,city:stName(code),cnty:null};
}
// ── v2.16 fixed schools: every state has the same schools in every career ──
// One school per real program, made from a seed of the state and its counties: name, town, county, mascot, colors,
// abbreviation and a priority. A smaller world keeps the schools with the highest priority, so a school you know
// is still there when the world gets bigger; the classes take them from the smallest to the biggest.
USA.poolCache={};
function usaPool(ab){
  const X=USA.X,st=X&&X.st[ab];if(!st)return[];const key=ab+'|'+st.counties.length+'|'+st.counties.reduce((a,c)=>a+c.pop,0);
  if(USA.poolCache[key])return USA.poolCache[key];
  const rnd=_colRand('pool|'+key),pk=a=>a[Math.floor(rnd()*a.length)],cs=st.counties,N=Math.max(16,st.meta[0]);
  const masc=XMASC[st.meta[2]]||MCTS,used=new Set(),abu=new Set(),combo=new Set(),out=[],B=10,cum=[];
  for(let b=0;b<B;b++){const a=0.25+(b/(B-1))*1.1;let t=0;cum.push(cs.map(c=>t+=Math.pow(c.pop,a)));}
  const cw=ab==='LA'?'Parish':ab==='AK'?'Borough':'County';
  for(let i=0;i<N;i++){const frac=N>1?i/(N-1):0.5,C=cum[Math.round(frac*(B-1))],tot=C[C.length-1];
    let made=null;
    for(let k=0;k<200&&!made;k++){const r=rnd()*tot;let lo=0,hi=C.length-1;while(lo<hi){const m=(lo+hi)>>1;if(C[m]<r)lo=m+1;else hi=m;}const c=cs[lo],T=c.towns;
      const tw=T.length?(frac>0.6?T[Math.floor(rnd()*Math.min(2,T.length))]:frac>0.3?T[Math.floor(rnd()*Math.min(5,T.length))]:T[Math.floor(rnd()*T.length)]):null;
      const town=tw?tw[0]:c.name,big=tw&&tw[1]>=60,r2=rnd();let nm;
      if(big&&frac>0.4&&r2<0.55)nm=r2<0.3?`${town} ${pk(['North','South','East','West','Central','Northwest','Southeast'])} High`:`${town} ${pk(USHS_PATRON)} High`;
      else if(!tw||r2<0.12)nm=/ City$/.test(c.name)?`${c.name} High`:`${c.name} ${cw} High`;
      else if(frac<0.35&&r2<0.24&&T.length>1){const t2=T[1+Math.floor(rnd()*(T.length-1))][0];if(t2===town)continue;nm=`${town}-${t2} High`;}
      else if(r2<0.3)nm=`${town} ${pk(['Christian Academy','Catholic','Prep','Academy'])}`;
      else if(frac>0.5&&r2<0.45)nm=`${town} Senior High`;
      else nm=`${town} High`;
      if(nm.length>34||used.has(nm))continue;used.add(nm);made={nm,town,ckey:c.key};}
    if(!made){const nm=`${st.name} Prep ${i+1}`;used.add(nm);made={nm,town:st.name,ckey:null};}
    // mascot and colors: no two schools in a state share both, and neighbors don't share a mascot
    let m,ci,g=0;do{m=mascPick(rnd,masc);ci=Math.floor(rnd()*LCOLS.length);g++;}while(g<60&&(combo.has(m+'|'+ci)||out.some(o=>o.ckey===made.ckey&&o.mascot===m)));combo.add(m+'|'+ci);
    const[c1,c2]=LCOLS[ci];
    out.push({nm:made.nm,city:`${made.town}, ${st.abbr||ab}`,ckey:made.ckey,mascot:m,c1,c2,abbr:abbr3(made.nm,abu),frac,prio:rnd(),tier:rnd()<0.3?'good':rnd()<0.5?'bad':'avg',prestige:1+Math.floor(rnd()*5)});}
  return USA.poolCache[key]=out;
}
// the schools of a state for this world (highest priority first, then smallest to biggest)
function usaPick(ab,n){const P=usaPool(ab);return P.map((p,i)=>[p,i]).sort((a,b)=>b[0].prio-a[0].prio).slice(0,n).sort((a,b)=>a[1]-b[1]).map(x=>x[0]);}
// next school for a class of this state; falls back to a made-up one when a league asks for more than the world planned
function usaTake(code){
  const ab=USA.ab[code]||code;if(!USA.cur)USA.cur={};let C=USA.cur[ab];
  if(!C){const need=code==='CF'?CLS_ORDER.reduce((a,c)=>a+CLS_SZ[c].t,0)+cfExtra().reduce((a,c)=>a+XCLS[c].t,0):(XST[code]?XST[code].cls.reduce((a,c)=>a+XCLS[c].t,0):0);C=USA.cur[ab]={list:usaPick(ab,need),i:0};}
  const p=C.list[C.i++];if(!p)return null;
  const cid=p.ckey!=null&&USA.cid?USA.cid[p.ckey]:null;return Object.assign({},p,{cnty:cid==null?null:cid});
}
// ── the state picker on the setup screen ──
const _upX=()=>_usaPick.X,_upR=r=>Object.keys(_upX().st).filter(s=>_upX().st[s].meta[1]===r);
const USA_PRESETS=[['Every state',()=>Object.keys(_upX().st)],['The South',()=>_upR('S')],['The Midwest',()=>_upR('MW')],
  ['The West',()=>_upR('W')],['The Northeast',()=>_upR('NE')],['Football hotbeds',()=>['TX','FL','GA','AL','LA','CA','OH','PA','MS','SC','OK','TN'].filter(s=>_upX().st[s])]];
let _usaPick=null;
function usaGeoCfg(){const W=worldLoad();return W.geo&&W.geo.mode==='classic'?{mode:'classic'}:usaNorm(W.geo||usaDefault());}
function usaPickOpen(){const g=usaGeoCfg(),cu=(worldLoad().geo||{}).custom;_usaPick=g.mode==='usa'?{mode:'usa',states:new Set(g.states),home:g.home,custom:g.custom||[],detail:new Set(g.detail||[g.home])}:{mode:'classic',states:null,home:'TX',custom:cu||[],detail:null};_usaPick.X=usaWorld(_usaPick.custom);if(!_usaPick.states)_usaPick.states=new Set(Object.keys(_usaPick.X.st));usaPickRender();}
function usaPickRender(){
  const P=_usaPick,X=P.X,G0={st:X.st},names=Object.keys(X.st).sort((a,b)=>(X.st[a].custom-X.st[b].custom)||X.st[a].name.localeCompare(X.st[b].name)),n=P.states.size;
  if(!P.detail)P.detail=new Set(usaAutoDetail([...(P.states||[])],P.home,X));
  {const fx=usaDetailFix([...P.detail],P.home,[...P.states],X);P.detail=new Set(fx);}
  const tot=[...P.states].reduce((a,s)=>a+usaTeams(s,X,1),0),sh=[...P.states].reduce((a,s)=>a+X.st[s].meta[0],0)/USST_PROG_ALL,dSz=usaDetailSize([...P.detail],X);
  const map=Object.keys(X.st).map(ab=>{const on=P.states.has(ab),hm=P.home===ab;return`<path d="${X.st[ab].rings.map(_polyPath).join(' ')}" fill="${hm?'#f7b928':on&&P.detail.has(ab)?'#1f6fd1':on?'#8cc8f5':'#cfc6ae'}" stroke="#2c2416" stroke-width="1" style="cursor:pointer" onclick="usaPickTog('${ab}')"><title>${G0.st[ab].name}</title></path>`;}).join('');
  openMo(`<div style="font-weight:900;font-size:22px">Choose your states</div>
    <div style="font-size:12px;color:var(--mu);margin:2px 0 8px">Real states, real counties and towns, fictional high schools. Tap states on the map or in the list (1 to 50). Gold is your home state, dark blue the states played in full detail, light blue the light states. Every state has its real number of high schools.</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px"><label style="font-size:12px;font-weight:800;display:flex;gap:6px;align-items:center"><input style="width:auto;margin:0;flex:none" type="radio" name="usam" ${P.mode==='usa'?'checked':''} onchange="_usaPick.mode='usa';usaPickRender()"> Real USA</label>
      <label style="font-size:12px;font-weight:800;display:flex;gap:6px;align-items:center"><input style="width:auto;margin:0;flex:none" type="radio" name="usam" ${P.mode==='classic'?'checked':''} onchange="_usaPick.mode='classic';usaPickRender()"> Classic fictional country (13 made-up states)</label></div>
    ${P.mode==='usa'&&P.custom&&P.custom.length?`<div style="font-size:11px;color:var(--mu);margin-bottom:6px">★ = your custom states (make more in League Setup → Map editor)</div>`:''}
    ${P.mode==='usa'?`<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">${USA_PRESETS.map(([l],i)=>`<button class="bgh bxs" onclick="usaPickPreset(${i})">${l}</button>`).join('')}<button class="bgh bxs" onclick="_usaPick.states=new Set([_usaPick.home]);usaPickRender()">Only my home state</button></div>
    <svg viewBox="0 0 1100 720" style="width:100%;max-height:42vh;background:#7fc6ee;border-radius:10px">${map}</svg>
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:8px 0"><label style="font-size:12px;font-weight:800">Home state <select id="usa-home" onchange="_usaPick.home=this.value;_usaPick.states.add(this.value);_usaPick.detail=null;usaPickRender()" style="padding:5px 8px;border-radius:8px">${names.map(a=>`<option value="${a}"${a===P.home?' selected':''}>${G0.st[a].name}</option>`).join('')}</select></label>
      <span style="font-size:12px;color:var(--mu)"><b>${n}</b> state${n===1?'':'s'} · about <b>${(Math.round(tot/50)*50).toLocaleString()}</b> high schools · about <b>${Math.max(3,Math.round(837*sh))+0}</b> colleges · up to <b>${Math.round(32*Math.min(1,sh))}</b> five-stars a class</span></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:3px 8px;max-height:22vh;overflow-y:auto;font-size:12px">${names.map(a=>`<label style="display:flex;gap:5px;align-items:center;cursor:pointer"><input style="width:auto;margin:0;flex:none" type="checkbox" ${P.states.has(a)?'checked':''} onchange="usaPickTog('${a}')">${G0.st[a].name}${G0.st[a].custom?' ★':''}</label>`).join('')}</div>
    <div style="margin-top:10px;padding:10px;border:1px solid var(--bd);border-radius:6px">
      <div style="font-weight:800;font-size:13px">Full detail: up to ${USA_DETAIL_MAX} states</div>
      <div style="font-size:11px;color:var(--mu);margin:2px 0 6px">Detailed states have every player on every team. Light states still play every game, crown state champions in a playoff, and track their top prospects, so stars, offers and commitments work everywhere. To keep the game fast on phones the detailed states together can have up to ${USA_DETAIL_CAP.toLocaleString()} schools (your home state always counts as detailed).</div>
      <div style="font-size:12px;margin-bottom:6px">${[...P.detail].map(a=>X.st[a].name).join(', ')} · <b style="color:${dSz>USA_DETAIL_CAP?'var(--gd)':'var(--gn)'}">${dSz.toLocaleString()}</b> / ${USA_DETAIL_CAP.toLocaleString()} schools</div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;max-height:16vh;overflow-y:auto">${[...P.states].sort((a,b)=>X.st[a].name.localeCompare(X.st[b].name)).map(a=>{const on=P.detail.has(a),hm=a===P.home,fits=on||(P.detail.size<USA_DETAIL_MAX&&usaDetailSize([...P.detail,a],X)<=USA_DETAIL_CAP);
        return`<button class="${on?'btn':'bgh'} bxs" style="padding:3px 8px;min-height:26px;${!fits&&!on?'opacity:.45':''}" ${hm?'disabled title="Your home state is always detailed"':''} onclick="usaPickDet('${a}')">${X.st[a].name} <span style="opacity:.7">${usaTeams(a,X,1).toLocaleString()}</span></button>`;}).join('')}</div>
    </div>`
    :`<div style="font-size:13px;color:var(--mu);margin:10px 0">The original made-up country: Crestfield, Llano Grande, Coralina and ten more invented states.</div>`}
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px"><button class="bgh" onclick="clo()">Cancel</button><button class="btn bgn" onclick="usaPickSave()">Use these states</button></div>`);
}
window.usaPickDet=function(ab){const P=_usaPick,X=P.X;if(ab===P.home)return;if(P.detail.has(ab)){P.detail.delete(ab);usaPickRender();return;}
  if(P.detail.size>=USA_DETAIL_MAX){notify(`Up to ${USA_DETAIL_MAX} states in full detail. Turn one off first.`,'w');return;}
  if(usaDetailSize([...P.detail,ab],X)>USA_DETAIL_CAP){notify(`${X.st[ab].name} would put the detailed states over ${USA_DETAIL_CAP.toLocaleString()} schools. Turn a big one off first, or pick a smaller state.`,'w');return;}
  P.detail.add(ab);usaPickRender();};
window.usaPickTog=function(ab){const P=_usaPick;if(P.states.has(ab)){if(P.states.size===1)return;P.states.delete(ab);if(P.home===ab)P.home=[...P.states].sort((a,b)=>P.X.st[b].meta[0]-P.X.st[a].meta[0])[0];}else P.states.add(ab);usaPickRender();};
window.usaPickPreset=function(i){const s=USA_PRESETS[i][1]();_usaPick.states=new Set(s);if(!s.includes(_usaPick.home))_usaPick.home=s.slice().sort((a,b)=>_usaPick.X.st[b].meta[0]-_usaPick.X.st[a].meta[0])[0];usaPickRender();};
window.usaPickSave=function(){const P=_usaPick,W=worldLoad(),old=JSON.stringify(W.geo||null);
  W.geo=P.mode==='usa'?usaNorm({states:[...P.states],home:P.home,custom:P.custom,detail:P.detail?[...P.detail]:null,v:2}):{mode:'classic',custom:P.custom&&P.custom.length?P.custom:undefined};
  // renames and sizes were made for the other map: they don't carry over
  if(JSON.stringify(W.geo)!==old&&(W.custFor||'classic')!==(W.geo.mode)){for(const k of['states','counties','divs','xdivs','size'])delete W[k];}
  W.custFor=W.geo.mode;worldStore(W);clo();
  notify('Building your world…');setTimeout(()=>{try{_allClsDivs=null;_usedSchoolNames.clear();Object.keys(_citySchoolCount).forEach(k=>delete _citySchoolCount[k]);initCountyMap();usaSetupInfo();}catch(e){console.error('world',e);}},40);};
function usaSetupInfo(){const el=document.getElementById('usa-info');if(!el)return;const g=usaGeoCfg();
  el.innerHTML=g.mode==='usa'?`<b>Real USA</b> · ${g.states.length} state${g.states.length===1?'':'s'} · home: ${usaWorld(g.custom).st[g.home].name}${g.detail&&g.detail.length>1?` · full detail: ${g.detail.map(a=>usaWorld(g.custom).st[a].name).join(', ')}`:''}${g.custom&&g.custom.length?` · ${g.custom.length} custom`:''}`:'<b>Classic</b> fictional country';}
