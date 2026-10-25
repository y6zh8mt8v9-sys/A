// ═══════════ v2.00 NEIGHBOR STATES: Wakota (Midwest) and Tierra Alta (Mexican border) ═══════════
// Two full states border Crestfield. Their schools replace the old out-of-state opponents: every team has a real
// roster, a division, a schedule, stats, rankings, recruiting and a state champion, and they are a little weaker than
// Crestfield class for class. Codes: WK-C / WK-B / WK-A (Wakota) and TA-4 … TA-1 (Tierra Alta, Division I is biggest).
const XST={
  WK:{name:'Wakota',abbr:'WK',tag:'Midwest farm country: river towns, grain elevators and small-town Friday nights',cls:['WK-C','WK-B','WK-A']},
  TA:{name:'Tierra Alta',abbr:'TA',tag:'Border country: desert valleys, mountain towns and the Río Grande',cls:['TA-4','TA-3','TA-2','TA-1']}};
const XCLS={
  'WK-C':{st:'WK',lbl:'Class C',t:48,d:6,r:[28,38],mean:46,eq:'1A'},
  'WK-B':{st:'WK',lbl:'Class B',t:40,d:5,r:[36,50],mean:51,eq:'2A'},
  'WK-A':{st:'WK',lbl:'Class A',t:32,d:4,r:[52,70],mean:57,eq:'4A'},
  'TA-4':{st:'TA',lbl:'Division IV',t:48,d:6,r:[28,38],mean:45,eq:'1A'},
  'TA-3':{st:'TA',lbl:'Division III',t:40,d:5,r:[34,46],mean:49,eq:'2A'},
  'TA-2':{st:'TA',lbl:'Division II',t:40,d:5,r:[44,58],mean:53,eq:'3A'},
  'TA-1':{st:'TA',lbl:'Division I',t:32,d:4,r:[56,76],mean:58,eq:'4A'}};
const XCLS_ORDER=['WK-C','WK-B','WK-A','TA-4','TA-3','TA-2','TA-1'];
const ST_ORDER=['CF','WK','TA'];
function clsEq(c){return XCLS[c]?XCLS[c].eq:(CLS_SZ[c]?c:'3A');}
function clsNum(c){return c==='INTL'?3:+clsEq(c)[0];}
function clsSt(c){return XCLS[c]?XCLS[c].st:c==='INTL'?'INTL':c==='OOS'?'OOS':'CF';}
function stOf(s){return s?clsSt(s.cls||G.cls):'CF';}
let CF_NAME='Crestfield';const CF_LBL={};let _abbrUsed=new Set();
function stName(st){return st==='CF'?CF_NAME:XST[st]?XST[st].name:st==='INTL'?'International':'Out of State';}
function clsL(c){return XCLS[c]?XCLS[c].lbl:CF_LBL[c]||c;} // the short class label players see: the state's own name for it
function clsName(c){return XCLS[c]?`${stName(XCLS[c].st)} ${XCLS[c].lbl}`:c==='INTL'?'International':c==='OOS'?'Out of State':`${CF_NAME} ${CF_LBL[c]||c}`;}
function cfExtra(){return XCLS_ORDER.filter(c=>XCLS[c]&&XCLS[c].st==='CF');}
function clsOfSt(st){return st==='CF'?cfExtra().concat(CLS_ORDER):XST[st]?XST[st].cls.slice():[];}
// how many players a side: six-man, eight-man and nine-man classes play their own game (and only each other)
function clsFmt(c){const l=String(clsL(c)||'');return/six|6[- ]?man/i.test(l)?6:/8[- ]?man/i.test(l)?8:/9[- ]?man|^9[AB]|^9AA/i.test(l)?9:11;}
function fmtName(n){return n===6?'six-man':n===8?'eight-man':n===9?'nine-man':'11-man';}
function myClsOrder(){return clsOfSt(clsSt(G.cls));}
function makeDivsAny(c){return XCLS[c]?makeStateDivisions(c):makeDivisions(c);}
function clsSz(c){return XCLS[c]?{r:XCLS[c].r,t:XCLS[c].t,d:XCLS[c].d}:CLS_SZ[c]||CLS_SZ['3A'];}
function isUSSchool(s){const st=stOf(s);return st==='CF'||!!XST[st];}
const XDIV_NAMES={
  WK:['Big River Conference','Corn Belt Conference','Tallgrass Conference','North Star Conference','Iron Range Conference','Prairie Lakes Conference',
      'Heartland Conference','Bluestem Conference','Twin Rivers Conference','Lakeshore Conference','Cedar Valley Conference',
      'Northern Plains Conference','Mississippi Bluffs Conference','Sandhills Conference','Pioneer Trail Conference'],
  TA:['Río Grande District','Sierra Madre District','Mesa Verde District','Desierto Sur District','Valle del Sol District','Frontera District',
      'Llano Alto District','Copper Basin District','Canyonlands District','Sonoran Edge District','Pecos Valley District',
      'Saguaro District','Monte Azul District','Ocotillo District','Río Bravo District','Camino Real District',
      'Sangre Peaks District','Painted Desert District','Laguna Seca District','Mesquite Flats District']};
const XTOWN={
  WK:{a:['Cedar','Prairie','Willow','Elm','Maple','Bur Oak','Clear','Silver','Spring','Pleasant','Twin','Long','Grand','Fox','Deer','Elk','Beaver','Otter',
        'Turkey','Plum','Walnut','Hickory','Linden','Ash','Iron','Lone','Kettle','Pike','Rock','Mill','Stone','Sugar','Bear','Crow','Swan','Goose','Eagle',
        'Wolf','Mound','Red Oak','White Pine','Buffalo','Sauk','Bluff','Corn','Wheat','Clover','Lark','Meadow','Bloom'],
      b:['Falls','Grove','Rapids','Bluff','Prairie','Center','Junction','Creek','Ridge','Lake','Valley','City','Springs','Point','Hills','Ford','River',
        'Lakes','Mills','Hollow','Corners','Bend','Haven','Crossing','Landing','Fork'],
      one:['Harlan','Osage','Lindgren','Westby','Arcadia','Elkader','Pella','Viborg','Waverly','Decorah','Hartley','Sutton','Emmet','Truman','Albion',
        'Bancroft','Clarion','Garner','Kimball','Lenox','Marion','Nora','Oakland','Pilger','Remsen','Sheldon','Tilden','Ulysses','Verdigre','Akron',
        'Brandt','Colfax','Dunlap','Everly','Fenton','Gilmore','Holstein','Ida','Jewell','Kanawha','Lohrville','Manson','Odebolt','Primghar',
        'Quimby','Rolfe','Schaller','Thor','Vinton','Woden','Lund','Nygaard','Mortenson','Halvorsen','Sandberg','Thorson','Ulrich','Vogel'],
      cnty:['Tamarack','Bluestem','Harlan','Bremer','Dakin','Fenwick','Gustavson','Ingram','Jessup','Kettering','Mortenson','Olmsted','Petersen','Rasmus','Wendt','Yoder','Zimmer','Lindquist']},
  TA:{es:['San Isidro','San Benito','Santa Elena','Santa Rosa','San Marcos','Santa Lucía','San Ignacio','Santa Teresa','San Miguel','San Pablo','San Rafael',
        'San Lorenzo','Santa Clara','San Jacinto','San Elizario','Santo Tomás','San Felipe','Santa Inés','San Gabriel','Santa Cruz','San Andrés','San Cayetano'],
      a:['Río','Mesa','Sierra','Valle','Loma','Agua','Cerro','Puerto','Arroyo','Paso','Ojo','Peña','Villa','Llano','Cañada','Laguna','Vista','Puente'],
      b:['Verde','Blanca','Alta','Seca','Dulce','Grande','Hondo','Bonita','Dorada','Prieta','Larga','del Sol','de la Luna','Colorada','Fría','Linda',
        'del Norte','Escondida','Azul','de Oro','Hermosa','del Valle','Encantada','Plata'],
      en:['Desert Vista','Canyon Ridge','Saguaro','Mesquite','Copper Hills','Red Mesa','Sunset Ridge','Ocotillo','Yucca Valley','Turquoise','Sandstone',
        'Painted Rock','Coyote Wells','Ironwood','Silver Basin','Juniper Flats','Cactus Springs','Adobe Hills','Sagebrush','Dry Creek','Lone Butte',
        'Mission Hills','Rattlesnake Gap','Kiva Point','Pinyon Ridge','Desert Hot Springs','Agave Flats','Smoke Tree','Borderland','Twin Buttes']}};
const XMASC={
  WK:['Threshers','Harvesters','Pheasants','Bison','Badgers','Blizzard','Twisters','Northmen','Lumberjacks','Rivermen','Plainsmen','Muskies','Walleyes',
      'Prairie Dogs','Farmers','Golden Eagles','Eagles','Panthers','Bulldogs','Wildcats','Cardinals','Vikings','Cyclones','Thunder','Storm','Knights',
      'Bluejays','Trojans','Spartans','Wolverines','Coyotes','Falcons','Mustangs','Raiders','Warriors','Comets','Rockets','Royals','Hornets','Lions',
      'Tigers','Bears','Rams','Broncos','Pirates','Mariners','Wolves','Foxes','Elks','Bucks','Owls','Hawks','Huskies','Cougars','Gophers','Badgers','Pheasants','Cornhuskers','Ducks','Spuds','Oaks','Hilltoppers','Robins','Orioles'],
  TA:['Javelinas','Roadrunners','Coyotes','Scorpions','Diablos','Toros','Lobos','Halcones','Águilas','Jaguares','Conquistadores','Vaqueros','Sidewinders',
      'Gila Monsters','Mustangs','Broncos','Rattlers','Dust Devils','Pumas','Osos','Cardenales','Matadors','Cougars','Falcons','Eagles','Hawks',
      'Thunderbirds','Bandits','Rangers','Outlaws','Wranglers','Longhorns','Stallions','Panthers','Tigers','Wildcats','Bobcats','Bulldogs','Knights',
      'Titans','Warriors','Spartans','Rebels','Chargers','Comets','Storm','Firebirds','Coyotes','Roadrunners','Scorpions','Cactus','Saguaros','Tumbleweeds','Lizards','Coyotes','Prospectors']};
// logo artwork for the new mascots, borrowed from the closest existing emblem
const XLOGO={threshers:['tractor',''],harvesters:['tractor',''],farmers:['tractor',''],pheasants:['falcon',''],blizzard:['cyclone',''],twisters:['cyclone',''],
  northmen:['viking',''],lumberjacks:['axes',''],rivermen:['anchor',''],plainsmen:['hat',''],muskies:['marlin',''],walleyes:['marlin',''],'prairie dogs':['fox',''],
  bluejays:['cardinal',''],royals:['crown',''],elks:['buck',''],javelinas:['bull',''],roadrunners:['falcon',''],scorpions:['hornet',''],diablos:['devil',''],
  toros:['bull',''],lobos:['wolf',''],halcones:['hawk',''],'águilas':['eagle',''],jaguares:['catside',''],conquistadores:['helm',''],vaqueros:['hat',''],
  sidewinders:['snake',''],'gila monsters':['gator',''],'dust devils':['cyclone',''],pumas:['catside',''],osos:['bear',''],cardenales:['cardinal',''],
  matadors:['knight',''],bandits:['hat',''],rangers:['star','']};
// ═══════════ v2.07 TEN MORE STATES: the whole country ═══════════
// Every state is fully simulated like Crestfield, Wakota and Tierra Alta: real rosters, divisions, schedules, stats,
// rankings, playoffs, recruiting and a state champion. Sizes follow their real-life inspirations: a huge Gulf-and-border
// state, a big peninsula, the Deep South, the bayou, Appalachia, the Rockies, the high plains, the Pacific Northwest,
// the far north and the islands.
Object.assign(XST,{
  LG:{name:'Llano Grande',abbr:'LG',tag:'Big-sky ranch country, oil towns and Friday night stadiums from the Gulf to the Río Grande',cls:['LG-1','LG-2','LG-3','LG-4','LG-5','LG-6']},
  CO:{name:'Coralina',abbr:'CO',tag:'The sunshine peninsula: beach towns, citrus groves, swamps and speed everywhere',cls:['CO-1','CO-3','CO-5','CO-7']},
  MG:{name:'Magnolia',abbr:'MG',tag:'Deep South football: red clay, pine woods and courthouse squares',cls:['MG-A','MG-AA','MG-AAA','MG-AAAA']},
  AC:{name:'Acadia',abbr:'AC',tag:'Bayou country: parishes, sugar cane, Cajun towns and the delta',cls:['AC-1','AC-3','AC-5']},
  CU:{name:'Cumberland',abbr:'CU',tag:'Appalachian hollows, river cities and the Atlantic shore',cls:['CU-A','CU-AA','CU-AAA']},
  SU:{name:'Summit',abbr:'SU',tag:'The high Rockies: mountain towns, mining camps and the Front Range',cls:['SU-1','SU-3','SU-5']},
  GR:{name:'Granite',abbr:'GR',tag:'High plains and ranch land: long bus rides and tiny towns that love football',cls:['GR-C','GR-B','GR-A']},
  CS:{name:'Cascadia',abbr:'CS',tag:'The rainy Pacific Northwest: timber towns, harbors and volcanoes',cls:['CS-1A','CS-2A','CS-3A','CS-4A']},
  AU:{name:'Aurora',abbr:'AU',tag:'The far north: fishing ports, oil camps and games on frozen fields',cls:['AU-3','AU-2','AU-1']},
  KM:{name:'Kaimana',abbr:'KM',tag:'The islands: volcanoes, surf towns and some of the toughest linemen anywhere',cls:['KM-2','KM-1','KM-O']}});
Object.assign(XCLS,{
  'LG-1':{st:'LG',lbl:'Class 1A',t:40,d:5,r:[28,38],mean:46,eq:'1A'},
  'LG-2':{st:'LG',lbl:'Class 2A',t:40,d:5,r:[34,46],mean:50,eq:'2A'},
  'LG-3':{st:'LG',lbl:'Class 3A',t:40,d:5,r:[42,56],mean:54,eq:'3A'},
  'LG-4':{st:'LG',lbl:'Class 4A',t:40,d:5,r:[50,66],mean:58,eq:'4A'},
  'LG-5':{st:'LG',lbl:'Class 5A',t:32,d:4,r:[56,74],mean:61,eq:'5A'},
  'LG-6':{st:'LG',lbl:'Class 6A',t:32,d:4,r:[60,80],mean:64,eq:'5A'},
  'CO-1':{st:'CO',lbl:'Class 1A',t:32,d:4,r:[28,40],mean:47,eq:'1A'},
  'CO-3':{st:'CO',lbl:'Class 2A',t:40,d:5,r:[38,52],mean:53,eq:'3A'},
  'CO-5':{st:'CO',lbl:'Class 3A',t:40,d:5,r:[50,66],mean:58,eq:'4A'},
  'CO-7':{st:'CO',lbl:'Class 4A',t:32,d:4,r:[58,76],mean:63,eq:'5A'},
  'MG-A':{st:'MG',lbl:'Class A',t:32,d:4,r:[28,38],mean:46,eq:'1A'},
  'MG-AA':{st:'MG',lbl:'Class AA',t:32,d:4,r:[34,48],mean:51,eq:'2A'},
  'MG-AAA':{st:'MG',lbl:'Class AAA',t:32,d:4,r:[44,60],mean:56,eq:'3A'},
  'MG-AAAA':{st:'MG',lbl:'Class AAAA',t:32,d:4,r:[54,72],mean:61,eq:'4A'},
  'AC-1':{st:'AC',lbl:'Class 1A',t:32,d:4,r:[28,40],mean:46,eq:'1A'},
  'AC-3':{st:'AC',lbl:'Class 2A',t:32,d:4,r:[38,54],mean:52,eq:'3A'},
  'AC-5':{st:'AC',lbl:'Class 3A',t:24,d:3,r:[52,70],mean:58,eq:'4A'},
  'CU-A':{st:'CU',lbl:'Class A',t:32,d:4,r:[28,40],mean:46,eq:'1A'},
  'CU-AA':{st:'CU',lbl:'Class AA',t:32,d:4,r:[36,50],mean:51,eq:'2A'},
  'CU-AAA':{st:'CU',lbl:'Class AAA',t:32,d:4,r:[48,64],mean:57,eq:'4A'},
  'SU-1':{st:'SU',lbl:'Class 1A',t:24,d:3,r:[26,36],mean:44,eq:'1A'},
  'SU-3':{st:'SU',lbl:'Class 2A',t:32,d:4,r:[36,50],mean:50,eq:'2A'},
  'SU-5':{st:'SU',lbl:'Class 3A',t:24,d:3,r:[50,68],mean:56,eq:'4A'},
  'GR-C':{st:'GR',lbl:'Class C',t:20,d:3,r:[24,32],mean:43,eq:'1A'},
  'GR-B':{st:'GR',lbl:'Class B',t:16,d:2,r:[30,40],mean:47,eq:'1A'},
  'GR-A':{st:'GR',lbl:'Class A',t:16,d:2,r:[40,54],mean:52,eq:'3A'},
  'CS-1A':{st:'CS',lbl:'Class 1A',t:32,d:4,r:[28,38],mean:46,eq:'1A'},
  'CS-2A':{st:'CS',lbl:'Class 2A',t:32,d:4,r:[34,46],mean:50,eq:'2A'},
  'CS-3A':{st:'CS',lbl:'Class 3A',t:32,d:4,r:[42,56],mean:55,eq:'3A'},
  'CS-4A':{st:'CS',lbl:'Class 4A',t:32,d:4,r:[52,70],mean:60,eq:'4A'},
  'AU-3':{st:'AU',lbl:'Division III',t:8,d:1,r:[24,32],mean:41,eq:'1A'},
  'AU-2':{st:'AU',lbl:'Division II',t:8,d:1,r:[30,40],mean:45,eq:'1A'},
  'AU-1':{st:'AU',lbl:'Division I',t:8,d:1,r:[42,56],mean:50,eq:'2A'},
  'KM-2':{st:'KM',lbl:'Division II',t:8,d:1,r:[28,38],mean:45,eq:'1A'},
  'KM-1':{st:'KM',lbl:'Division I',t:8,d:1,r:[38,52],mean:50,eq:'2A'},
  'KM-O':{st:'KM',lbl:'Open Division',t:12,d:2,r:[54,74],mean:57,eq:'4A'}});
const ST_NEW=['LG','CO','MG','AC','CU','SU','GR','CS','AU','KM'];
for(const st of ST_NEW){ST_ORDER.push(st);for(const c of XST[st].cls)XCLS_ORDER.push(c);}
Object.assign(XDIV_NAMES,{
  LG:['Gulf Coast District','Piney Woods District','Hill Country District','Panhandle District','Big Bend District','Brazos District','Permian District','Coastal Bend District','Cross Timbers District','Blackland District','Llano Estacado District','Trinity District','Rolling Plains District','Concho Valley District','Nueces District','Sabine District','Red River District','Caprock District','Pecos District','Mesquite District','Bluebonnet District','Prairie Lakes District','Lone Oak District','San Saba District','Frio District','Guadalupe District','Lavaca District','Colorado River District'],
  CO:['Gold Coast Conference','Suncoast Conference','Big Bend Conference','Panhandle Conference','Treasure Coast Conference','Space Coast Conference','Glades Conference','Citrus Conference','First Coast Conference','Emerald Coast Conference','Keys Conference','Nature Coast Conference','Heartland Conference','Springs Conference','Palm Beach Conference','Mangrove Conference','Lake Region Conference','Tamiami Conference'],
  MG:['Black Belt Region','Wiregrass Region','Piedmont Region','Tennessee Valley Region','Gulf Region','Pine Belt Region','Red Clay Region','Delta Region','Coastal Plain Region','Chattahoochee Region','Sand Mountain Region','Cotton Region','Hill Region','River Region','Longleaf Region','Magnolia Region'],
  AC:['Bayou District','Acadiana District','River Parish District','Delta District','Teche District','Atchafalaya District','Prairie District','Lakeshore District','Sabine District','Cane District','Gulf District'],
  CU:['Blue Ridge Conference','Smoky Mountain Conference','Cumberland Plateau Conference','Bluegrass Conference','Tidewater Conference','Outer Banks Conference','Piedmont Conference','Coalfield Conference','Holston Conference','Clinch Valley Conference','River City Conference','Foothills Conference'],
  SU:['Front Range League','Western Slope League','San Juan League','Arkansas Valley League','Continental League','High Peaks League','Sangre League','Wasatch League','Plateau League','Gunnison League'],
  GR:['Big Horn Conference','Powder River Conference','Hi-Line Conference','Yellowstone Conference','Wind River Conference','Sweetwater Conference','Missouri Breaks Conference'],
  CS:['Puget Sound League','Olympic League','Cascade League','Columbia Basin League','Willamette League','Coastal League','Palouse League','Yakima Valley League','Evergreen League','Skagit League','Rainier League','Klickitat League','Snake River League','Siskiyou League','Hood League','Chinook League'],
  AU:['Railbelt Conference','Southeast Conference','Peninsula Conference'],
  KM:['Windward Conference','Leeward Conference','Big Island Conference','Garden Isle Conference']});
Object.assign(XTOWN,{
  LG:{one:['Abilene','Cotulla','Lufkin','Odessa','Tyler','Brenham','Seguin','Kerrville','Lampasas','Mexia','Gilmer','Kilgore','Beeville','Uvalde','Sonora','Ozona','Brady','Cuero','Refugio','Hondo','Sinton','Alvin','Katy','Temple','Waco','Bryan','Killeen','Pampa','Borger','Dumas','Hereford','Canyon','Lamesa','Snyder','Sweetwater','Ballinger','Coleman','Comanche','Gatesville','Hamilton','Hico','Llano','Mason','Junction','Rocksprings','Carthage','Daingerfield','Jasper','Silsbee','Kountze','Liberty','Dayton','Cleveland','Wharton','Edna','Ganado','Hallettsville','Yoakum','Gonzales','Luling','Lockhart','Elgin','Taylor','Hutto','Belton','Salado','Stephenville','Graham','Breckenridge','Cisco','Ranger','Eastland','Albany','Haskell','Munday','Seymour','Electra','Vernon','Quanah','Childress','Memphis','Wellington','Shamrock','Canadian','Perryton','Spearman','Stinnett','Dalhart'],
      a:['Cedar','Mesquite','Pecan','Live Oak','Red','Big','Lone','Post','Iron','Copper','Spring','Cypress','Bluebonnet','Willow','Pine','Sandy','Shady','Rock','Bear','Salt','Deer','Buffalo','Eagle','Prairie','Gold'],
      b:['Creek','Springs','Hill','Valley','Bend','Ridge','Grove','Point','Lake','Crossing','Flats','Wells','Gap','Mills','Bluff','Prairie','Hollow','Falls','Station','Park'],
      es:['San Saba','Santa Anna','San Diego','Del Rio','El Campo','Los Fresnos','La Feria','San Benito','Rio Hondo','La Joya','Mission Valle','Santa Maria','San Juan','La Grange','El Paso Norte','Agua Dulce','Rio Vista','San Augustine','Laredo Sur','Palo Duro','Los Indios','Encinal','Zapata'],
      cnty:['Brazos','Bexar Norte','Caddo','Comal','Concho','Frio','Gillespie','Guadalupe','Hidalgo','Jim Hogg','Karnes','Kendall','Kinney','Lavaca','Llano','Maverick','Medina','Nueces','Pecos','Presidio','Reeves','San Patricio','Starr','Terrell','Uvalde','Val Verde','Webb','Zavala','Atascosa','Bandera','Blanco','Burnet','Callahan','Coke','Crockett','Dimmit','Edwards','Fayette','Goliad','Gonzales','Hays','Irion','Jack','Kimble','Lampasas','McMullen','Menard','Mills','Nolan','Real','Runnels','Schleicher','Sterling','Sutton','Tom Green','Travis Norte','Victoria','Wilson','Young','Zapata Sur','Hardeman','Kenedy','Loving']},
  CO:{one:['Palatka','Okeechobee','Immokalee','Arcadia','Wauchula','Sebring','Avon Park','Bartow','Mulberry','Plant City','Brooksville','Inverness','Dunnellon','Ocala','Belleview','Umatilla','Eustis','Tavares','Apopka','Sanford','Deland','Titusville','Cocoa','Melbourne','Vero','Stuart','Jupiter','Belle Glade','Pahokee','Clewiston','Labelle','Naples','Marco','Venice','Bradenton','Palmetto','Largo','Dunedin','Tarpon','Crestview','Milton','Niceville','Chipley','Marianna','Quincy','Madison','Perry','Live Oak','Lake City','Starke','Callahan','Yulee','Hilliard','Bunnell','Keystone','Chiefland','Bronson','Williston','Newberry','Hawthorne'],
      a:['Palm','Coral','Sea','Pelican','Gulf','Mangrove','Citrus','Orange','Sunset','Bay','Key','Sand','Lake','Cypress','Royal','Golden','Pine','Silver','Crystal','Ocean','Harbor','Island','Seminole Pines','Heron','Osprey'],
      b:['Beach','Shores','Springs','Grove','Harbor','Isles','Point','Bay','Lakes','Key','Gardens','Park','Haven','Pines','City','Coast','Sound','Inlet','Hammock','Landing'],
      es:['Boca Grande','San Mateo','Santa Fe','Vista del Mar','Punta Gorda','Cabo Coral','Las Palmas','San Carlos','Isla Verde','La Playa'],
      cnty:['Alachua','Baker','Bradford','Calhoun','Citrus','Clay','Collier','Columbia','DeSoto','Dixie','Flagler','Franklin','Gadsden','Gilchrist','Glades','Gulf','Hamilton','Hardee','Hendry','Hernando','Highlands','Holmes','Indian River','Jefferson','Lafayette','Lake','Levy','Liberty','Manatee','Marion','Martin','Monroe','Nassau','Okaloosa','Osceola','Pasco','Putnam','Sumter','Suwannee','Taylor','Union','Wakulla','Walton']},
  MG:{one:['Opelika','Selma','Demopolis','Eufaula','Ozark','Enterprise','Andalusia','Brewton','Atmore','Greenville','Troy','Clanton','Talladega','Sylacauga','Alexander','Jasper','Cullman','Arab','Guntersville','Scottsboro','Fort Payne','Albertville','Oneonta','Hartselle','Athens','Florence','Sheffield','Russellville','Hamilton','Vernon','Fayette','Carrollton','Aliceville','Thomasville','Grove Hill','Butler','Linden','Marion','Camden','Hayneville','Tuskegee','Union Springs','Abbeville','Headland','Dothan','Hartford','Geneva','Elba','Luverne','Brantley','Moultrie','Tifton','Valdosta','Cairo','Thomasville Pines','Bainbridge','Americus','Cordele','Fitzgerald','Douglas','Waycross','Jesup','Baxley','Vidalia','Swainsboro','Statesboro','Sylvania','Waynesboro','Thomson','Washington Hill','Eatonton','Madison Hill','Monroe','Winder','Commerce','Toccoa','Cornelia','Dahlonega','Jasper Ridge','Calhoun','Dalton','Lafayette','Rome','Cedartown','Rockmart','Carrollton Hill','Newnan','Lagrange','Hogansville','Manchester','Thomaston','Barnesville','Forsyth'],
      a:['Magnolia','Pine','Red Clay','Cotton','Oak','Peach','Pecan','Dogwood','Holly','Cedar','Sweetgum','Hickory','Willow','Cane','Sandy','Mossy','Long Leaf','Possum','Bear','Turkey','Shady','Clear','Cypress','Big','Little'],
      b:['Springs','Grove','Hill','Creek','Ridge','Bluff','Mill','Crossroads','Hollow','Station','Valley','Ferry','Landing','Bottom','Gap','Branch','Fork','Flat','Chapel','Junction'],
      cnty:['Autauga','Baldwin','Barbour','Bibb','Blount','Bullock','Butler','Chambers','Cherokee','Chilton','Choctaw','Clarke','Clay','Cleburne','Coffee','Colbert','Conecuh','Coosa','Covington','Crenshaw','Dale','Dallas','Elmore','Escambia','Etowah','Fayette','Geneva','Greene','Hale','Henry','Lamar','Lawrence','Lowndes','Macon','Marengo','Monroe','Perry','Pickens','Pike','Randolph','Sumter','Tallapoosa','Washington','Wilcox','Winston']},
  AC:{one:['Thibodaux','Houma','Raceland','Lockport','Galliano','Cut Off','Golden Meadow','Abbeville','Kaplan','Gueydan','Crowley','Rayne','Eunice','Ville Platte','Mamou','Opelousas','Breaux Bridge','Henderson','Cecilia','Carencro','Scott','Broussard','Youngsville','Maurice','Erath','Delcambre','Jeanerette','Loreauville','Franklin','Baldwin','Patterson','Morgan','Berwick','Plaquemine','Donaldsonville','Gonzales','Lutcher','Gramercy','Vacherie','Hahnville','Luling','Destrehan','Kenner','Chalmette','Arabi','Belle Chasse','Hammond','Ponchatoula','Amite','Kentwood','Bogalusa','Franklinton','Covington','Mandeville','Slidell','Natchitoches','Leesville','DeRidder','Jennings','Welsh','Iowa','Sulphur','Vinton','Cameron','Oberlin','Kinder','Oakdale','Marksville','Bunkie','Alexandria','Pineville','Jena','Winnfield','Ruston','Monroe Bayou','Bastrop','Minden','Homer','Haynesville','Many','Zwolle'],
      a:['Bayou','Belle','Grand','Petit','Pointe','Lake','Cypress','Live Oak','Pecan','Sugar','Cane','Magnolia','Prairie','Saint','Isle','River','Bois','Chenier','Fleur','Bon'],
      b:['Bayou','Isle','Pointe','Ville','Landing','Grove','Ridge','Prairie','Lake','Bend','Island','Chenier','Plantation','Crossing','Coulee','Parish'],
      cnty:['Acadia','Allen','Ascension','Assumption','Avoyelles','Beauregard','Bienville','Calcasieu','Cameron','Catahoula','Concordia','DeSoto','Evangeline','Iberia','Iberville','Jefferson Davis','Lafourche','LaSalle','Livingston','Natchitoches','Plaquemines','Pointe Coupee','Rapides','Sabine','St. Bernard','St. Charles','St. Helena','St. James','St. Landry','St. Martin','St. Mary','St. Tammany','Tangipahoa','Terrebonne','Vermilion','Vernon','Washington','West Feliciana']},
  CU:{one:['Harlan','Hazard','Pikeville','Prestonsburg','Paintsville','Ashland','Morehead','Somerset','Corbin','London','Middlesboro','Jellico','Lafollette','Oneida','Jamestown','Crossville','Cookeville','Sparta','Smithville','McMinnville','Tullahoma','Shelbyville','Lewisburg','Columbia','Pulaski','Lawrenceburg','Waynesboro','Savannah','Selmer','Bolivar','Covington','Dyersburg','Union City','Paris','Camden','Dickson','Ashland City','Springfield','Gallatin','Lebanon','Carthage','Gainesboro','Livingston','Kingsport','Bristol','Elizabethton','Erwin','Greeneville','Newport','Sevierville','Maryville','Madisonville','Athens','Cleveland','Dayton','Pikeville Gap','Boone','Wilkesboro','Sparta Ridge','Elkin','Mount Airy','Asheboro','Lexington','Albemarle','Wadesboro','Lumberton','Whiteville','Wilmington Beach','Jacksonville','Morehead City','Beaufort','Manteo','Elizabeth City','Edenton','Plymouth','Williamston','Tarboro','Wilson','Kinston','Goldsboro'],
      a:['Laurel','Coal','Hickory','Chestnut','Big Stone','Pine','Cedar','Clinch','Holston','Copper','Iron','Rocky','Shady','Mountain','Blue','Laurel Fork','Sugar','Pigeon','Possum Trot','Elk','Bear','Turkey','Sandy','Cane','Locust'],
      b:['Gap','Hollow','Creek','Ridge','Fork','Valley','Mountain','Run','Springs','Mill','Bluff','Knob','Cove','Branch','Station','Ferry','Falls','Mines','Point','Grove'],
      cnty:['Adair','Bell','Breathitt','Carter','Clay','Cumberland','Elliott','Estill','Floyd','Harlan','Jackson','Johnson','Knott','Knox','Laurel','Lawrence','Lee','Leslie','Letcher','Lincoln','Magoffin','Martin','Menifee','Morgan','Owsley','Perry','Pike','Powell','Pulaski','Rockcastle','Rowan','Russell','Wayne','Whitley','Wolfe','Avery','Ashe','Alleghany','Watauga','Yancey','Mitchell','Madison','Haywood','Swain','Graham','Cherokee','Macon','Jackson Cove','Transylvania','Carteret','Dare','Hyde','Currituck','Pamlico']},
  SU:{one:['Leadville','Silverton','Ouray','Telluride','Durango','Cortez','Pagosa','Salida','Buena Vista','Gunnison','Crested Butte','Montrose','Delta','Paonia','Rifle','Glenwood','Aspen','Basalt','Eagle','Vail','Breckenridge','Frisco','Kremmling','Granby','Walden','Steamboat','Craig','Meeker','Rangely','Fruita','Palisade','Grand Junction','Moab','Monticello','Blanding','Price','Helper','Vernal','Roosevelt','Heber','Park City','Kamas','Coalville','Tooele','Nephi','Manti','Richfield','Beaver','Cedar City','Kanab','Trinidad','Walsenburg','Alamosa','Monte Vista','Del Norte','Canon City','Florence','Woodland Park','Castle Rock','Golden','Evergreen','Conifer','Estes Park','Loveland','Berthoud','Longmont','Fort Lupton','Brighton','Sterling','Julesburg','Burlington','Limon','La Junta','Lamar','Springfield Plains'],
      a:['Silver','Gold','Aspen','Pine','Elk','Bighorn','Eagle','Granite','Blue','Spruce','Copper','Iron','Red','Bear','Crystal','Cedar','Lodgepole','Twin','High','Snow'],
      b:['Peak','Ridge','Park','Springs','Creek','Canyon','Mesa','Pass','Valley','Basin','Gulch','Falls','Lake','Flats','Butte','Summit','Junction','Crossing'],
      cnty:['Alamosa','Archuleta','Chaffee','Clear Creek','Conejos','Costilla','Custer','Dolores','Eagle','Fremont','Garfield','Gilpin','Grand','Gunnison','Hinsdale','Huerfano','Jackson','Lake','La Plata','Mineral','Moffat','Montezuma','Montrose','Ouray','Park','Pitkin','Rio Blanco','Rio Grande','Routt','Saguache','San Juan','San Miguel','Summit','Teller','Uintah','Wasatch']},
  GR:{one:['Lusk','Douglas','Glenrock','Casper','Riverton','Lander','Dubois','Thermopolis','Worland','Basin','Greybull','Lovell','Powell','Cody','Meeteetse','Sheridan','Buffalo','Kaycee','Gillette','Wright','Moorcroft','Sundance','Hulett','Upton','Newcastle','Torrington','Wheatland','Chugwater','Pine Bluffs','Rawlins','Saratoga','Encampment','Baggs','Kemmerer','Pinedale','Big Piney','Afton','Jackson Hole','Miles City','Glendive','Sidney','Wolf Point','Glasgow','Malta','Chinook','Havre','Shelby','Cut Bank','Choteau','Conrad','Fort Benton','Lewistown','Roundup','Harlowton','Big Timber','Livingston','Bozeman Trail','Belgrade','Townsend','Dillon','Twin Bridges','Ennis','Philipsburg','Deer Lodge','Anaconda','Hamilton','Darby','Polson','Ronan','Eureka','Libby','Plains','Thompson Falls','Broadus','Ekalaka','Baker','Circle','Jordan','Scobey','Plentywood'],
      a:['Big Horn','Powder','Sweetwater','Antelope','Sage','Elk','Cottonwood','Badger','Wind','Lone','Medicine','Crazy','Spotted','Red','Buffalo','Eagle','Coal','Cedar'],
      b:['Creek','Butte','Ridge','Springs','Draw','Flats','Coulee','Basin','Gap','Crossing','Bend','Rim','Valley','Station','Junction','Fork'],
      cnty:['Albany','Big Horn','Campbell','Carbon','Converse','Crook','Fremont','Goshen','Hot Springs','Johnson','Laramie','Lincoln','Natrona','Niobrara','Park','Platte','Sheridan','Sublette','Sweetwater','Teton','Uinta','Washakie','Weston','Beaverhead','Blaine','Carter','Chouteau','Custer','Daniels','Dawson','Fallon','Fergus','Garfield','Glacier','Golden Valley','Judith Basin','McCone','Musselshell','Petroleum','Phillips','Pondera','Powder River','Prairie','Richland','Roosevelt','Rosebud','Sanders','Sheridan Plains','Stillwater','Sweet Grass','Toole','Treasure','Valley','Wheatland','Wibaux']},
  CS:{one:['Aberdeen','Hoquiam','Montesano','Elma','Shelton','Olympia','Tumwater','Centralia','Chehalis','Napavine','Winlock','Castle Rock','Kelso','Longview','Kalama','Woodland','Camas','Washougal','Stevenson','Goldendale','Yakima','Selah','Naches','Toppenish','Wapato','Sunnyside','Grandview','Prosser','Kennewick','Pasco','Richland','Walla Walla','Dayton','Pomeroy','Pullman','Colfax','Cheney','Spokane Valley','Deer Park','Chewelah','Colville','Kettle Falls','Republic','Omak','Okanogan','Tonasket','Oroville','Brewster','Chelan','Wenatchee','Cashmere','Leavenworth','Ellensburg','Cle Elum','Moses Lake','Ephrata','Quincy','Othello','Ritzville','Odessa Wheat','Forks','Port Angeles','Sequim','Port Townsend','Chimacum','Bremerton','Poulsbo','Kingston','Anacortes','Burlington','Sedro-Woolley','Concrete','Mount Vernon','Stanwood','Arlington','Marysville','Snohomish','Monroe Valley','Sultan','Enumclaw','Buckley','Orting','Eatonville','Astoria','Seaside','Tillamook','Newport Bay','Lincoln Beach','Florence Dunes','Coos Bay','Bandon','Brookings','Roseburg','Sutherlin','Cottage Grove','Albany Falls','Corvallis','Silverton','Woodburn','McMinnville','Hood River','The Dalles','Pendleton','Hermiston','La Grande','Baker','Ontario','Burns','Bend','Redmond','Sisters','Madras','Prineville','Klamath'],
      a:['Cedar','Fir','Hemlock','Spruce','Alder','Maple','Salmon','Raven','Rain','Fern','Moss','Mist','Harbor','Bay','Tide','Ocean','Lake','River','Mountain','Evergreen','Douglas','Huckleberry','Elk','Orca','Eagle'],
      b:['Falls','Harbor','Point','Ridge','Creek','Valley','Bay','Sound','Lake','Prairie','Grove','Heights','Landing','Cove','Hills','Springs','Crossing','Hollow','Pass','Gorge'],
      cnty:['Adams','Asotin','Benton','Chelan','Clallam','Columbia','Cowlitz','Douglas','Ferry','Franklin','Garfield','Grant','Grays Harbor','Island','Jefferson','Kitsap','Kittitas','Klickitat','Lewis','Lincoln','Mason','Okanogan','Pacific','Pend Oreille','San Juan','Skagit','Skamania','Snohomish','Stevens','Wahkiakum','Walla Walla','Whatcom','Whitman','Yakima','Clatsop','Tillamook','Lane','Linn','Marion','Polk','Yamhill','Hood River','Wasco','Umatilla','Deschutes','Crook','Josephine','Douglas Fir','Coos','Curry','Klamath','Malheur','Harney','Wallowa']},
  AU:{one:['Kodiak','Homer','Seward','Valdez','Cordova','Kenai','Soldotna','Nikiski','Palmer','Wasilla','Houston','Talkeetna','Glennallen','Tok','Delta Junction','Nenana','Healy','Ketchikan','Sitka','Petersburg','Wrangell','Haines','Skagway','Craig','Metlakatla','Dillingham','Bethel','Nome','Kotzebue','Barrow','Unalaska','Eagle River','Chugiak','Girdwood','North Pole','Fairbanks','Juneau','Anchorage Hill','Ninilchik','Seldovia'],
      a:['Glacier','Bear','Raven','Eagle','Salmon','Spruce','Moose','Caribou','Polar','North','Aurora','Frost','Ice','Tundra','Halibut'],
      b:['Bay','Point','Creek','Harbor','Pass','Lake','River','Ridge','Cove','Inlet','Sound','Flats'],
      cnty:['Kenai','Kodiak Island','Matanuska','Susitna','Denali','Fairbanks','Juneau','Ketchikan','Sitka','Haines','Bristol Bay','Bethel','Nome','North Slope','Northwest Arctic','Aleutians','Yukon','Copper River','Valdez','Petersburg']},
  KM:{one:['Hilo','Kona','Waimea','Honokaa','Pahoa','Keaau','Kau','Kapaa','Lihue','Waimea Bay','Hanapepe','Koloa','Kahului','Wailuku','Lahaina','Kihei','Makawao','Hana','Kaunakakai','Lanai City','Kailua','Kaneohe','Waianae','Nanakuli','Ewa','Waipahu','Pearl City','Aiea','Mililani','Wahiawa','Haleiwa','Laie','Kahuku','Waimanalo','Kapolei','Makaha','Kalihi','Kaimuki','Manoa','Moanalua'],
      a:['Mauna','Kai','Hale','Moana','Lani','Nalu','Koa','Pua','Ala','Wai','Hono','Kea'],
      b:['Kai','Lani','Nui','Loa','Hale','Wai','Pali','Uka','Makai','Moana'],
      cnty:['Hawaii','Maui','Kauai','Oahu','Molokai','Lanai','Niihau','Kahoolawe','Kona','Hilo','Puna','Hamakua','Kohala','Kau','Lahaina','Hana']}});
// ten states, ten personalities on the sideline
Object.assign(XMASC,{
  LG:['Longhorns','Roughnecks','Oilers','Armadillos','Mustangs','Rattlers','Javelinas','Wranglers','Rangers','Bobcats','Steers','Broncos','Panthers','Eagles','Bulldogs','Cowboys','Tigers','Lions','Hornets','Owls','Bearkats','Pirates','Buffaloes','Matadors','Coyotes','Wildcats','Cougars','Hawks','Lobos','Bluebonnets','Pumas','Thunder','Storm','Chargers','Stallions','Badgers','Mavericks','Outlaws','Desperados','Rams','Bears','Gators','Riverhawks','Big Reds','Bison','Golden Bears','Jackrabbits','Horned Frogs','Roadrunners','Buckaroos','Drillers','Ranchers','Tumbleweeds','Cactus','Prospectors','Scorpions','Coyotes'],
  CO:['Gators','Pelicans','Manatees','Flamingos','Hurricanes','Sharks','Dolphins','Marlins','Barracudas','Stingrays','Tarpons','Herons','Ospreys','Panthers','Seahawks','Mariners','Pirates','Buccaneers','Sailfish','Waves','Surf','Tides','Storm','Lightning','Rockets','Astronauts','Orange Devils','Citrus Kings','Raiders','Cougars','Bobcats','Wildcats','Knights','Spartans','Patriots','Eagles','Falcons','Bulldogs','Tigers','Lions','Rattlers','Cobras','Mustangs','Royals','Gladiators','Commodores','Sea Turtles','Crocs','Flamingos','Crabs','Lobsters','Seahorses','Palms','Orangemen','Pelicans','Hummingbirds','Parrots','Conchs','Sunrays','Barracudas'],
  MG:['Crimson Wave','Gamecocks','Rebels','Wildcats','Bulldogs','Tigers','Bears','Eagles','Panthers','Yellowjackets','Hornets','Boll Weevils','Catfish','Gators','Rattlers','Generals','Colonels','Cavaliers','Patriots','Raiders','Warriors','Bulldogs','Blue Devils','Red Devils','Trojans','Spartans','Wolverines','Rams','Knights','Mustangs','Falcons','Owls','Hawks','Lions','Cougars','Jaguars','Cardinals','Magnolias','Pine Knots','Sawmillers','Red Elephants','Golden Tigers','Wolves','Bobcats','Dragons','Hornets','Possums','Boll Weevils','Peaches','Gamecocks','Catfish','Turkeys','Mules','Bluejays','Acorns','Roses'],
  AC:['Pelicans','Gators','Crawdads','Bayou Bengals','Cajuns','Ragin Gators','Garfish','Mudbugs','Egrets','Herons','Tigers','Panthers','Eagles','Wildcats','Bulldogs','Hornets','Trojans','Rebels','Pirates','Buccaneers','Lions','Cougars','Rams','Mustangs','Hawks','Falcons','Owls','Spartans','Knights','Saints','Bears','Wolves','Warriors','Bobcats','Cardinals','Riverhawks','Catfish','Crabs','Frogs','Bullfrogs','Ducks','Lizards','Herons','Fireflies'],
  CU:['Mountaineers','Highlanders','Moonshiners','Coal Miners','Hillcats','Black Bears','Bobcats','Volunteers','Rifles','Pioneers','Frontiersmen','Ridgerunners','Cardinals','Wildcats','Tigers','Bulldogs','Eagles','Panthers','Hornets','Rebels','Generals','Patriots','Rangers','Raiders','Trojans','Spartans','Lions','Bears','Falcons','Hawks','Owls','Cougars','Pirates','Mariners','Seahawks','Lighthouse Keepers','Buccaneers','Rams','Knights','Mustangs','Wolves','Colonels','Thunder','Hilltoppers','Possums','Raccoons','Squirrels','Hounds','Bells','Lighthouse Keepers','Sailors','Black Bears','Cardinals'],
  SU:['Grizzlies','Bighorns','Avalanche','Miners','Mountain Lions','Elk','Buffaloes','Peaks','Summit Kings','Yeti','Ravens','Golden Eagles','Eagles','Falcons','Hawks','Wolves','Coyotes','Bears','Wildcats','Bobcats','Panthers','Cougars','Pioneers','Trailblazers','Rangers','Outlaws','Stallions','Broncos','Mustangs','Knights','Spartans','Trojans','Titans','Thunder','Storm','Blizzard','Rockets','Comets','Prospectors','Stags','Pronghorns','Goats','Meteors','Snowflakes','Rams'],
  GR:['Cowboys','Broncs','Bison','Wranglers','Antelope','Rustlers','Mavericks','Longhorns','Grizzlies','Bobcats','Badgers','Coyotes','Wolves','Eagles','Hawks','Falcons','Owls','Rams','Mustangs','Stallions','Pioneers','Trailblazers','Miners','Rough Riders','Outlaws','Thunder','Blizzard','Bulldogs','Panthers','Tigers','Lions','Bears','Spartans','Knights','Antelope','Jackrabbits','Prospectors','Wagoneers','Ranchers','Buckaroos','Spuds','Pheasants','Badgers'],
  CS:['Orcas','Steelheads','Salmon Kings','Loggers','Timberwolves','Ospreys','Evergreens','Sasquatch','Lumberjacks','Rain','Thunderbirds','Seahawks','Ravens','Eagles','Falcons','Hawks','Bears','Wolves','Cougars','Bobcats','Wildcats','Huskies','Beavers','Ducks','Mariners','Pirates','Sea Kings','Clippers','Spartans','Trojans','Knights','Titans','Vikings','Royals','Rams','Mustangs','Panthers','Tigers','Lions','Bulldogs','Storm','Mountaineers','Steelheads','Clippers','Ospreys','Beavers','Ducks','Otters','Seals','Whales','Oaks','Crows'],
  AU:['Kodiaks','Moose','Huskies','Mushers','Orcas','Ice Dogs','Caribou','Polar Bears','Grizzlies','Wolves','Ravens','Eagles','Salmon Kings','Glaciers','Northstars','Auroras','Wolverines','Seawolves','Walruses','Seals','Whales','Snowflakes','Icebergs','Stags'],
  KM:['Volcanoes','Na Koa','Menehune','Sharks','Honu','Rainbows','Mauna Kings','Tradewinds','Surf','Waves','Sea Riders','Warriors','Navigators','Voyagers','Seasiders','Owls','Eagles','Falcons','Hawks','Wildcats','Dragons','Spartans','Knights','Trojans','Titans','Raiders','Red Raiders','Saints','Panthers','Tigers','Whales','Octopi','Rainbows','Sharks','Parrots','Palms','Sunrays']});
// regional playbooks
const XOFF={WK:['Pro Style','Wing-T','I-Formation','Wing-T','Spread','Option','Pro Style','I-Formation'],TA:['Spread','Air Raid','Option','Spread','Air Raid','Pro Style','Wing-T','Option'],
  LG:['Spread','Spread','Air Raid','Pro Style','Wing-T','Option','Spread','I-Formation'],CO:['Spread','Spread','Air Raid','Pro Style','Spread','Option','I-Formation','Air Raid'],
  MG:['I-Formation','Pro Style','Option','Wing-T','Spread','I-Formation','Option','Pro Style'],AC:['Option','Wing-T','I-Formation','Spread','Pro Style','Option','I-Formation','Spread'],
  CU:['I-Formation','Wing-T','Pro Style','Option','Spread','I-Formation','Wing-T','Pro Style'],SU:['Spread','Option','Wing-T','Pro Style','Spread','Air Raid','I-Formation','Option'],
  GR:['Wing-T','I-Formation','Option','Wing-T','Pro Style','Spread','Option','I-Formation'],CS:['Spread','Air Raid','Pro Style','Spread','Wing-T','I-Formation','Spread','Option'],
  AU:['Wing-T','I-Formation','Spread','Option','Pro Style','Wing-T','Spread','I-Formation'],KM:['Spread','Run and Shoot','Air Raid','Spread','Pro Style','Option','Air Raid','I-Formation'].map(x=>x==='Run and Shoot'?'Air Raid':x)};
// who plays where: family names on each state's rosters, with the matching skin-tone range ([share, name set, skin range or null])
const XNAMES={TA:[[0.55,'MEX',null],[0.2,'MEXLN',null]],LG:[[0.38,'MEX',null],[0.1,'MEXLN',null]],CO:[[0.2,'MEX',null],[0.06,'FRA',[4,7]]],AC:[[0.3,'CAJUN',null]],
  SU:[[0.18,'MEX',null]],CS:[[0.06,'JPN',[1,3]],[0.08,'POLY',[3,6]]],AU:[[0.18,'NORD',[0,2]],[0.06,'POLY',[3,6]]],KM:[[0.45,'POLY',[3,6]],[0.18,'HAW',[3,6]],[0.15,'JPN',[1,3]]]};
const XN_EXTRA={CAJUN:[['Remy','Andre','Luc','Jules','Beau','Etienne','Pierre','Gabriel','Landry','Marcel','Theo','Rhett','Cade','Brody','Jacques','Felix'],
    ['Thibodeaux','Boudreaux','LeBlanc','Guidry','Landry','Broussard','Hebert','Fontenot','Arceneaux','Robichaux','Comeaux','Doucet','Trahan','Romero','Breaux','Babineaux','Fontenot','Melancon','Prejean','Richard','Savoie','Sonnier','Theriot','Vidrine','Champagne','Dugas','Gautreaux','Mouton','Naquin','Picard']],
  HAW:[['Kainoa','Keoni','Makoa','Kawika','Ikaika','Koa','Nainoa','Kekoa','Kaleo','Kai','Noa','Keanu','Kanoa','Alika','Kaimana','Kahiau','Pono','Laakea','Kapena','Mana'],
    ['Kahale','Kealoha','Kamakana','Akana','Kalani','Nakoa','Kahananui','Kaleikini','Kamakau','Kanahele','Kapule','Keawe','Mahoe','Nahale','Palakiko','Kekumu','Kaneshiro','Kauhane','Lindo','Kupau']]};
// logo artwork for the new mascots (new emblems are drawn in _LGO; the rest borrow the closest existing one)
Object.assign(XLOGO,{roughnecks:['derrick',''],oilers:['derrick',''],armadillos:['armadillo',''],cowboys:['hat',''],bearkats:['bear',''],
  buffaloes:['bull','bison'],'big reds':['star',''],'golden bears':['bear',''],bluebonnets:['star',''],
  pelicans:['pelican',''],manatees:['dolphin',''],flamingos:['pelican',''],barracudas:['marlin',''],tarpons:['marlin',''],sailfish:['marlin',''],herons:['pelican',''],
  buccaneers:['pirate',''],waves:['wave',''],surf:['wave',''],tides:['wave',''],lightning:['bolt',''],astronauts:['rocket',''],'orange devils':['devil',''],
  'citrus kings':['crown',''],commodores:['anchor',''],'sea turtles':['turtle',''],crocs:['gator',''],
  'crimson tide':['wave',''],gamecocks:['cardinal',''],'boll weevils':['hornet',''],catfish:['marlin',''],generals:['star',''],colonels:['star',''],
  magnolias:['flower',''],'pine knots':['pine',''],sawmillers:['axes',''],'red elephants':['bull',''],'golden tigers':['cat','tiger'],
  crawdads:['crawfish',''],'bayou bengals':['cat','tiger'],cajuns:['fleur',''],'ragin gators':['gator',''],garfish:['gator',''],mudbugs:['crawfish',''],egrets:['pelican',''],saints:['fleur',''],riverhawks:['hawk',''],
  mountaineers:['mountain',''],highlanders:['helm',''],moonshiners:['jug',''],'coal miners':['pick',''],hillcats:['cat','lynx'],'black bears':['bear',''],volunteers:['star',''],
  rifles:['star',''],frontiersmen:['hat',''],ridgerunners:['fox',''],'lighthouse keepers':['tower',''],
  bighorns:['ram',''],avalanche:['mountain',''],miners:['pick',''],'mountain lions':['catside',''],elk:['buck',''],peaks:['mountain',''],'summit kings':['crown',''],yeti:['bear','polar'],trailblazers:['flame',''],blizzard:['cyclone',''],
  broncs:['horse',''],antelope:['buck',''],rustlers:['hat',''],
  orcas:['orca',''],steelheads:['salmon',''],'salmon kings':['salmon',''],evergreens:['pine',''],sasquatch:['bear',''],rain:['cyclone',''],beavers:['bear',''],ducks:['falcon',''],'sea kings':['crown',''],clippers:['anchor',''],
  kodiaks:['bear',''],moose:['moose',''],mushers:['husky',''],'ice dogs':['husky',''],caribou:['buck',''],glaciers:['mountain',''],northstars:['star',''],auroras:['comet',''],seawolves:['wolf',''],
  volcanoes:['volcano',''],'na koa':['helm',''],menehune:['helm',''],honu:['turtle',''],rainbows:['wave',''],'mauna kings':['volcano',''],tradewinds:['wave',''],'sea riders':['wave',''],
  navigators:['anchor',''],voyagers:['anchor',''],seasiders:['wave',''],'red raiders':['pirate','']});

function xLogoMap(){if(typeof _LK==='undefined')return;for(const k in XLOGO)if(!_LK[k])_LK[k]=XLOGO[k];}
function _xPick(a){return a[Math.floor(Math.random()*a.length)];}
function _xUsedNames(){const u=new Set();
  try{if(typeof _allClsDivs!=='undefined'&&_allClsDivs)for(const c in _allClsDivs)for(const d of(_allClsDivs[c]||[]))for(const t of d.teams)u.add(t.name);}catch(e){}
  try{if(typeof G!=='undefined'&&G&&G.divisions)for(const s of allSchoolsAll())u.add(s.name);}catch(e){}
  return u;}
function _xSchoolName(st,c,used){
  const T=XTOWN[st],small=c==='WK-C'||c==='WK-B'||c==='TA-4';
  for(let k=0;k<400;k++){let nm,city,r=Math.random();
    if(st==='WK'){
      const twn=()=>Math.random()<0.45?_xPick(T.one):_xPick(T.a)+' '+_xPick(T.b);
      if(small&&r<0.2){const a=_xPick(T.one),b=_xPick(T.one);if(a===b)continue;nm=`${a}-${b} High`;city=a;}
      else if(r<0.32){const cn=_xPick(T.cnty);nm=Math.random()<0.5?`${cn} County Central High`:`${cn} Valley High`;city=cn+' County';}
      else if(!small&&r<0.5){const t=twn();nm=Math.random()<0.5?`${t} Senior High`:`${_xPick(['North','South','East','West'])} ${t} High`;city=t;}
      else{const t=twn();nm=`${t} High`;city=t;}
    }else if(st!=='TA'){ // v2.07: the other states share one pattern set, flavored by their own town lists
      const sm=/-(1|C|A|1A|3|2)$/.test(c)&&!/-(AAA|AAAA)$/.test(c);
      const twn=()=>Math.random()<0.62?_xPick(T.one):(T.es&&Math.random()<0.3?_xPick(T.es):_xPick(T.a)+' '+_xPick(T.b));
      if(r<0.14&&T.cnty){const cn=_xPick(T.cnty);nm=st==='AC'?`${cn} Parish High`:st==='AU'||st==='KM'?`${cn} High`:`${cn} County High`;city=cn;}
      else if(!sm&&r<0.3){const t=twn();nm=Math.random()<0.55?`${_xPick(['North','South','East','West'])} ${t} High`:`${t} Senior High`;city=t;}
      else if(r<0.36){const t=twn();nm=`${t} ${_xPick(st==='KM'?['Academy','School','Prep']:['Academy','Christian','Catholic','Prep'])}`;city=t;}
      else{const t=twn();nm=`${t} High`;city=t;}
    }else{
      if(r<0.42){const t=Math.random()<0.5?_xPick(T.es):_xPick(T.a)+' '+_xPick(T.b);nm=`${t} High`;city=t;}
      else if(r<0.68){const t=_xPick(T.en);nm=`${t} High`;city=t;}
      else if(r<0.84){const t=_xPick(T.es);nm=Math.random()<0.5?`${t} Valley High`:`${t} Early College High`;city=t;}
      else{const t=_xPick(T.es);nm=`${t} Academy`;city=t;}
    }
    if(used.has(nm))continue;used.add(nm);return{nm,city:`${city}, ${st}`};}
  const n=`${stName(st)} Prep ${used.size}`;used.add(n);return{nm:n,city:stName(st)};
}
function makeStateDivisions(c){
  const X=XCLS[c],st=X.st,used=_xUsedNames(),names=XDIV_NAMES[st]||[],SC=st==='CF'?cfExtra():XST[st].cls;
  let off=0;for(const k of SC){if(k===c)break;off+=XCLS[k].d;}
  const sizes=[];const base=Math.floor(X.t/X.d);let rem=X.t-base*X.d;for(let d=0;d<X.d;d++)sizes.push(base+(rem-->0?1:0));
  // regional flavor in the playbooks: Midwest power and Wing-T, border-country spread and option
  const OFFP=XOFF[st]||XOFF.TA;
  const divs=[];
  for(let d=0;d<X.d;d++){const teams=[];
    const _ci=SC.indexOf(c),_cf=st==='CF'?0:SC.length>1?_ci/(SC.length-1):0.5;
    for(let t=0;t<sizes[d];t++){const U=USA.on?usaTake(st):null;
      const{nm,city,cnty}=U||(USA.on?usaSchoolName(st,_cf,used):_xSchoolName(st,c,used)),msc=U?U.mascot:mascPick(Math.random,XMASC[st]),ci=(_sId*7+d*3+t)%LCOLS.length,[c1,c2]=U?[U.c1,U.c2]:LCOLS[ci];if(U)used.add(nm);
      const abbr=U?U.abbr:abbr3(nm,_abbrUsed);
      teams.push({id:_sId++,name:nm,city,cnty:cnty==null?null:cnty,mascot:msc,cls:c,dIdx:d,abbr,c1,c2,prestige:rng(1,5),wins:0,losses:0,isP:false,offS:_xPick(OFFP),defS:pick(DEF_SCH),
        fac:{weight:1,film:1,train:1,med:1},staff:genStaff(false),trophies:[],tier:'avg',trainLevel:1});}
    divs.push({name:names[off+d]||`${stName(st)} District ${off+d+1}`,teams});}
  const all=divs.flatMap(v=>v.teams),nG=Math.max(1,Math.round(all.length*0.30)),nB=Math.max(1,Math.round(all.length*0.35)),sh=[...all].sort(()=>Math.random()-.5);
  sh.slice(0,nG).forEach(t=>t.tier='good');sh.slice(nG,nG+nB).forEach(t=>t.tier='bad');
  return divs;
}
// border-country rosters: most players carry Spanish family names
function xStylePlayer(p,s){
  if(!s||p._xs)return;const L=XNAMES[stOf(s)];if(!L)return;p._xs=1;
  if(typeof INTL_NAMES==='undefined')return;
  let r=Math.random();
  for(const[sh,key,sk]of L){if(r>=sh){r-=sh;continue;}
    if(key==='MEXLN'){p.ln=_xPick(INTL_NAMES.MEX[1]);return;}
    const N=XN_EXTRA[key]||INTL_NAMES[key];if(!N)return;p.fn=_xPick(N[0]);p.ln=_xPick(N[1]);
    if(sk&&typeof faceSkinHex==='function'&&typeof FACE_SKIN!=='undefined'){let seed=p.fs||p.id;for(let k=0;k<60;k++){const i=FACE_SKIN.indexOf(faceSkinHex(seed));if(i>=sk[0]&&i<=sk[1])break;seed=seed*31+7;}p.fs=seed;}
    return;}
}

