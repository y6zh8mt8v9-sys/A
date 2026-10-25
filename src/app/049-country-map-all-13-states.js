// ═══════════ v2.07 COUNTRY MAP: all 13 states on one map ═══════════
// One coordinate space for the whole country. The mainland states share their borders exactly (every border is
// one edge used by both neighbors), the far north (Aurora) and the islands (Kaimana) sit in insets like on a real map.
// The whole country is a big scrollable map; tapping a state zooms in on it and shows its counties and job offers.
function _wig(x0,y0,x1,y1,amp,seed,steps){
  const out=[],nx=-(y1-y0),ny=(x1-x0),L=Math.hypot(nx,ny)||1;
  for(let i=0;i<=steps;i++){const t=i/steps,end=i===0||i===steps,w=end?0:(Math.sin(t*Math.PI*5+seed)*0.62+Math.sin(t*Math.PI*13+seed*2.3)*0.38)*amp*Math.sin(Math.PI*t);
    out.push([+(x0+(x1-x0)*t+nx/L*w).toFixed(1),+(y0+(y1-y0)*t+ny/L*w).toFixed(1)]);}
  return out;
}
const _polyPath=P=>'M'+P.map(p=>p[0]+','+p[1]).join(' L ')+' Z';
const _polyLine=P=>'M'+P.map(p=>p[0]+','+p[1]).join(' L ');
const MAP_W=1100,MAP_H=720;
const _MV={P1:[245,85],P2:[400,72],P3:[560,70],P4:[765,78],P5:[940,108],P6:[1065,175],P7:[1075,300],P8:[1035,395],P9:[1005,455],P10:[1025,560],P11:[1005,655],
  P12:[960,600],P13:[940,500],P14:[850,515],P15:[760,540],P16:[690,548],P17:[635,600],P18:[595,662],P19:[530,612],P20:[480,560],P21:[390,568],P22:[265,575],
  P23:[210,470],P24:[195,330],P25:[210,200],J1:[390,250],J2:[360,330],J3:[540,240],J4:[560,410],J5:[480,430],J6:[750,250],J7:[780,430],J8:[660,450],J10:[910,370]};
// edge character: coast (ragged), river (meandering), straight (surveyed line), default = a slightly irregular land border
const _MET={'P1|P2':'straight','P2|P3':'straight','P3|P4':'straight','P4|P5':'border','P5|P6':'coast','P6|P7':'coast','P7|P8':'coast','P8|P9':'coast','P10|P9':'coast',
  'P10|P11':'coast','P11|P12':'coast','P12|P13':'coast','P13|P14':'coast','P14|P15':'coast','P15|P16':'coast','P16|P17':'coast','P17|P18':'coast',
  'P18|P19':'river','P19|P20':'river','P20|P21':'straight','P21|P22':'straight','P22|P23':'coast','P23|P24':'coast','P24|P25':'coast','P1|P25':'coast',
  'J6|J7':'river','J5|P20':'river','J8|P16':'river','J7|P14':'river','J1|P2':'straight','J1|J3':'straight','J3|P3':'straight','J1|J2':'straight','J2|P24':'straight',
  'J2|J5':'straight','J3|J4':'straight','J4|J5':'border','J3|J6':'border','J6|P4':'border','J10|P8':'border','J10|J7':'border','J4|J8':'border','J7|J8':'border'};
const _MAMP={coast:8,river:6,straight:0,border:2.2};
const _meCache={};
function _edgePts(a,b){
  const flip=a>b,k=flip?b+'|'+a:a+'|'+b;
  if(!_meCache[k]){const A=_MV[flip?b:a],B=_MV[flip?a:b],ty=_MET[k]||'border',len=Math.hypot(B[0]-A[0],B[1]-A[1]);
    let h=0;for(const c of k)h=(h*31+c.charCodeAt(0))%9973;
    _meCache[k]={ty,pts:ty==='straight'?[A.slice(),B.slice()]:_wig(A[0],A[1],B[0],B[1],_MAMP[ty]*(ty==='coast'?Math.min(1.4,len/90):1),h/97,Math.max(6,Math.round(len/(ty==='coast'?5:7))))};}
  const P=_meCache[k].pts;return flip?P.slice().reverse():P;
}
function _cycle(vs){const out=[];for(let i=0;i<vs.length;i++){const e=_edgePts(vs[i],vs[(i+1)%vs.length]);for(let j=0;j<e.length-1;j++)out.push(e[j]);}return out;}
const _MSTV={CS:['P1','P2','J1','J2','P24','P25'],GR:['P2','P3','J3','J1'],WK:['P3','P4','J6','J3'],CU:['P4','P5','P6','P7','P8','J10','J7','J6'],
  SU:['J1','J3','J4','J5','J2'],CF:['J3','J6','J7','J8','J4'],TA:['J2','J5','P20','P21','P22','P23','P24'],LG:['J5','J4','J8','P16','P17','P18','P19','P20'],
  AC:['J8','J7','P14','P15','P16'],MG:['J7','J10','P8','P9','P13','P14'],CO:['P9','P10','P11','P12','P13']};
// the far north: a ragged peninsula with an island tail; the islands: a chain of volcanic islands
function _blob(cx,cy,rx,ry,seed,n){const out=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2,r=1+Math.sin(a*3+seed)*0.12+Math.sin(a*7+seed*2.1)*0.07;out.push([+(cx+Math.cos(a)*rx*r).toFixed(1),+(cy+Math.sin(a)*ry*r).toFixed(1)]);}return out;}
const _AU_RAW=[[34,46],[96,30],[150,36],[160,80],[172,122],[150,156],[118,160],[96,178],[70,200],[44,214],[18,224],[34,200],[40,176],[22,150],[16,104]];
const _AU_POLY=(()=>{const out=[];for(let i=0;i<_AU_RAW.length;i++){const a=_AU_RAW[i],b=_AU_RAW[(i+1)%_AU_RAW.length],e=_wig(a[0],a[1],b[0],b[1],5,i*1.7,Math.max(5,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/5)));for(let j=0;j<e.length-1;j++)out.push(e[j]);}return out;})();
const _KM_ISL=[_blob(186,676,27,22,1.1,22),_blob(146,646,15,10,2.4,16),_blob(120,627,12,5,3.3,14),_blob(132,656,5,4,4.1,10),_blob(88,612,13,9,5.2,16),_blob(42,592,11,9,6.3,14),_blob(22,588,4,3,7.1,8)];
const MAP_STATES={};
(function(){
  const meta={CF:[[201,182,138],[118,160,92],'1A to 5A · the heartland, lakes in the north'],WK:[[196,198,132],[110,158,84],'Class C, B, A · farm country on the northern border'],
    TA:[[222,190,140],[186,146,104],'Division IV to I · desert and mountains on the Mexican border'],LG:[[214,192,140],[150,160,96],'Class 1A to 6A · ranches, oil towns, the Gulf and the Río Grande'],
    CO:[[150,196,120],[88,160,92],'Class 1A to 4A · the sunshine peninsula'],MG:[[176,168,112],[96,140,76],'Class A to AAAA · red clay and pine woods'],
    AC:[[150,170,110],[84,132,84],'Class 1A to 3A · bayous and the delta'],CU:[[150,176,112],[86,136,82],'Class A to AAA · Appalachia and the Atlantic shore'],
    SU:[[186,180,150],[120,140,104],'Class 1A to 3A · the high Rockies'],GR:[[208,196,148],[156,152,104],'Class C, B, A · high plains and ranch land'],
    CS:[[122,170,120],[70,128,86],'Class 1A to 4A · rain forests, harbors and volcanoes'],AU:[[196,208,200],[120,150,130],'Division III to I · the far north'],
    KM:[[130,190,110],[80,150,90],'Division II, I and Open · the islands']};
  for(const st in meta){
    const polys=st==='AU'?[_AU_POLY]:st==='KM'?_KM_ISL:[_cycle(_MSTV[st])];
    const xs=polys.flat().map(p=>p[0]),ys=polys.flat().map(p=>p[1]);
    // label point: area centroid of the largest piece
    const P=polys[0];let A=0,cx=0,cy=0;for(let k=0;k<P.length;k++){const a=P[k],b=P[(k+1)%P.length],c=a[0]*b[1]-b[0]*a[1];A+=c;cx+=(a[0]+b[0])*c;cy+=(a[1]+b[1])*c;}cx/=3*A;cy/=3*A;
    if(st==='KM'){cx=110;cy=700;}if(st==='CO'){cx=985;cy=555;}if(st==='AU'){cx=92;cy=110;}
    MAP_STATES[st]={name:stName(st),polys,poly:polys[0],path:polys.map(_polyPath).join(' '),land:meta[st].slice(0,2),tag:meta[st][2],
      bb:[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)],lx:cx,ly:cy};
  }
})();
// counties: Voronoi cells inside every state (the islands are their own counties)
const MAP_CNTY_N={CF:54,WK:40,TA:36,LG:60,CO:36,MG:40,AC:30,CU:44,SU:32,GR:28,CS:40,AU:14};
const WK_COUNTY_NAMES=XTOWN.WK.cnty.concat(['Prairie Rose','Cottonwood','Sandhill','Bur Oak','Kettle River','Thorvald','Nygaard','Halvorsen','Sorensen','Brekke','Aldrich','Bjornson','Carlsen','Dahlberg','Engstrom','Fosdick','Grimstad','Haugen','Iverson','Jorgensen','Kvale','Lundeen','Moberg','Nordby']);
const TA_COUNTY_NAMES=['Doña Luz','Sierra Plata','Arroyo Seco','Cañon Rojo','Mesa Ancha','Loma Alta','Piedra Lisa','Agua Fría','Los Olivos','Santa Inés','Paloma','Río Bonito','Valle Escondido','Cerro Pardo','Tres Cruces','La Joya Alta','Las Ánimas Altas','Ojo Dorado','Peña Blanca','Sotol','Encinal','Vado Viejo','San Isidro','Mimbres','Gila Alta','Jornada','Organo','Tularosa','Hueco','Socorro Alto','Chama','Pecos Alto','Animas','Zuni Rim','Datil','Magdalena'];
const CF_COUNTY_NAMES=['Ashwood','Baxter','Caldwell','Denton','Elmore','Fairmont','Granville','Harmon','Ivywood','Jasper','Kendall','Laurel','Millbrook','Norwood','Oakdale','Pinecrest','Quinton','Ravenwood','Sutter','Talbot',
  'Ulmer','Vernon','Westgate','Exeter','Yarmouth','Zenith','Alton','Brecken','Clover','Dunmore','Elmdale','Foxwood','Gilmore','Harwick','Inglewood','Jameson','Kirkland','Linwood','Moorefield','Newburgh',
  'Orchard','Parkside','Quincyfield','Ridgeway','Stanton','Thomaston','Uniondale','Vicksburg','Weston','Crossroads','Bayfield','Crestwood','Dover','Elsworth'];
function _cntyNames(st){return st==='CF'?CF_COUNTY_NAMES:st==='WK'?WK_COUNTY_NAMES:st==='TA'?TA_COUNTY_NAMES:(XTOWN[st]&&XTOWN[st].cnty)||[];}
function _mkCounties(st,poly,names,n,base){
  return _cellsInState(_gridSeeds(n,poly),poly).map((reg,i)=>({id:base+i,st,name:names[i]||`County ${i+1}`,pts:reg.pts,
    ptsStr:reg.pts.map(p=>`${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' '),cx:reg.cx,cy:reg.cy,teams:[],offers:[]}));
}
const _KM_KALAWAO=_blob(121,622.5,3.2,2.2,8.3,10);
const MAPC=(()=>{const out=[],used=new Set();
  // every county in the country has its own name: a name another state already uses is swapped for an unused local one
  const uniq=(st,nm,i)=>{if(!used.has(nm)){used.add(nm);return nm;}const T=XTOWN[st]||{},pool=[...(T.one||[]),...(T.es||[]),..._cntyNames(st)];
    for(let k=0;k<pool.length;k++){const c=pool[(i*7+k)%pool.length];if(c&&!used.has(c)&&!/\s(Norte|Sur)$/.test(c)){used.add(c);return c;}}
    for(let k=2;;k++){const c=nm+' '+['Valley','Hills','Plains','River','Lake','Ridge'][k%6];if(!used.has(c)){used.add(c);return c;}}};
  const cen=P=>{let A=0,cx=0,cy=0;for(let k=0;k<P.length;k++){const a=P[k],b=P[(k+1)%P.length],c=a[0]*b[1]-b[0]*a[1];A+=c;cx+=(a[0]+b[0])*c;cy+=(a[1]+b[1])*c;}return[cx/(3*A),cy/(3*A)];};
  for(const st of ST_ORDER){
    if(st==='KM'){ // the real island counties: Hawaii (Big Island), Maui (Maui, Molokai, Lanai), Kalawao, Honolulu (Oahu), Kauai (Kauai, Niihau)
      const I=_KM_ISL,mk=(name,polys,lab)=>{const c=lab||cen(polys[0]);used.add(name);out.push({id:out.length,st:'KM',name,pts:polys[0],multi:polys.length>1?polys:null,ptsStr:'',cx:c[0],cy:c[1],teams:[],offers:[]});};
      mk('Hawaii',[I[0]]);mk('Maui',[I[1],I[2],I[3]],cen(I[1]));mk('Kalawao',[_KM_KALAWAO],[121,617]);mk('Honolulu',[I[4]]);mk('Kauai',[I[5],I[6]],cen(I[5]));continue;}
    const M=MAP_STATES[st];for(const c of _mkCounties(st,M.poly,_cntyNames(st),MAP_CNTY_N[st]||30,out.length)){c.name=uniq(st,c.name,c.id);out.push(c);}}
  return out;})();
function cntyWord(st){if(USA.on){const ab=USA.ab[st]||st;return ab==='LA'?'Parish':ab==='AK'?'Borough':'County';}return st==='AC'?'Parish':st==='AU'?'Borough':'County';}
function cntyLbl(c){return c?(/ City$/.test(c.name)?c.name:`${c.name} ${cntyWord(c.st)}`):'';}
