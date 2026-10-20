// ═══════════ DIVISION NAMES (per classification, 8 names each) ═══════════
const DIV_NAMES={
  '1A':['Valley League','Hilltop Conference','Ridgeline Division','Prairie Circuit','Creekside League','Pinewood Division','Crossroads Conference','Lakeshore Circuit'],
  '2A':['Greater Springfield Division','Blue Ridge Conference','Riverbend League','Heartland Circuit','Maplewood Division','Timberline Conference','Clearwater League','Stonegate Division'],
  '3A':['Metro Valley Conference','Ironwood Division','Summit League','Lakeview Circuit','Heritage Conference','Frontier Division','Silverado League','Crestview Conference'],
  '4A':['Greater Capital Division','Coastal Plains Conference','Mountain West League','Riverside Circuit','Grand Valley Division','Northern Lights Conference','Prairie Fire League','Bayshore Division'],
  '5A':['Premier Metro Conference','Great Lakes Division','Pacific Ridge League','Southern Plains Circuit','Capitol Region Division','Northern Valley Conference','Lakefront Premier League','Titan Coast Division'],
};
const POS=['QB','RB','WR','TE','OL','DL','LB','CB','S','K'];
// college jersey number rules (Rule 1-4-1). OL 50-79 is a hard rule; all others are recommended ranges.
// Number 0 legal in college since 2020. Each entry is an array of [min,max] ranges.
const POS_NUM={QB:[[0,19]],RB:[[0,49]],WR:[[0,49],[80,89]],TE:[[0,49],[80,89]],OL:[[50,79]],DL:[[50,79],[90,99]],LB:[[0,59],[90,99]],CB:[[0,49]],S:[[0,49]],K:[[0,19]]};
// Max varsity roster size (matches college scholarship limit for atmosphere)
const MAX_VARSITY=85;
// Side of ball for jersey number sharing, same number allowed if one is offense, one is defense
const POS_OFFENSE=new Set(['QB','RB','WR','TE','OL','K']);
const POS_DEFENSE=new Set(['DL','LB','CB','S']);
const POS_CNT_BASE={QB:2,RB:3,WR:5,TE:2,OL:8,DL:6,LB:5,CB:4,S:3,K:1};
const OFF_STARTERS={QB:1,RB:1,WR:2,TE:1,OL:5,K:1};
const DEF_STARTERS={DL:4,LB:3,CB:2,S:2};
const SCHEME_STARTERS={
  'Pro Style':{WR:2,TE:2,RB:1},'Spread':{WR:4,TE:1,RB:1},'Air Raid':{WR:4,TE:1,RB:0},'Wing-T':{WR:2,TE:2,RB:2},'Option':{WR:2,TE:1,RB:2},'I-Formation':{WR:2,TE:2,RB:1},
};
const DEF_SCHEME_STARTERS={
  '4-3':{DL:4,LB:3,CB:2,S:2},'3-4':{DL:3,LB:4,CB:2,S:2},'46':{DL:4,LB:3,CB:2,S:2},'Cover 2':{DL:4,LB:3,CB:2,S:2},'Flex':{DL:3,LB:4,CB:2,S:2},
};
const DEV=['Normal','Impact','Star','Elite Dev'];
const DEV_SP={Normal:3,Impact:6,Star:9,'Elite Dev':13};
const DEV_C={Normal:'dev-n',Impact:'dev-i',Star:'dev-s','Elite Dev':'dev-e'};
// ═══════════ ARCHETYPES ═══════════
const ARCHETYPES={
  QB:['Tank','Field General','Scrambler','Pure Runner','Gunslinger'],
  RB:['Contact Seeker','Receiving Back','Blocker','Shifty','Track Speed'],
  WR:['Jump Ball','Shifty','Big Play','Speedster','Gadget'],
  TE:['Blocker','Athletic Freak','Sure Hands','Hybrid'],
  OL:['Agile','Run Blocker','Pass Blocker'],
  DL:['Speed Rusher','Power Rusher','Pure Power','Edge Setter'],
  LB:['Coverage Specialist','Thumper','Physical','Hitsticker'],
  CB:['Field','Zone','Bump and Run'],
  S:['Coverage Specialist','Box Specialist','Hybrid'],
  K:['Accurate','Power'],
};
// Which offensive schemes each archetype thrives in
const ARCH_SCHEME={
  // QB
  'Tank':['I-Formation','Wing-T','Option'],'Field General':['Pro Style','I-Formation'],'Scrambler':['Option','Spread'],'Pure Runner':['Option','Wing-T'],'Gunslinger':['Air Raid','Spread'],
  // RB
  'Contact Seeker':['I-Formation','Wing-T','Pro Style'],'Receiving Back':['Spread','Air Raid'],'Blocker':['I-Formation','Wing-T'],'Shifty':['Spread','Option'],'Track Speed':['Air Raid','Spread','Option'],
  // WR
  'Jump Ball':['Pro Style','I-Formation'],'Shifty':['Spread','Option'],'Big Play':['Air Raid','Spread'],'Speedster':['Air Raid','Spread'],'Gadget':['Wing-T','Option','Spread'],
  // TE
  'Blocker':['I-Formation','Wing-T','Pro Style'],'Athletic Freak':['Spread','Air Raid'],'Sure Hands':['Pro Style','I-Formation'],'Hybrid':['Spread','Pro Style'],
  // OL
  'Pass Blocker':['Air Raid','Spread','Pro Style'],'Run Blocker':['I-Formation','Wing-T','Option'],'Agile':['Spread','Option','Wing-T'],
  // DL
  'Speed Rusher':['46','Flex','4-3'],'Power Rusher':['4-3','3-4'],'Pure Power':['3-4','4-3'],'Edge Setter':['4-3','46'],
  // LB
  'Thumper':['4-3','46'],'LB_Coverage Specialist':['3-4','Cover 2','Flex'],'LB_Physical':['4-3','3-4','46'],'LB_Hitsticker':['46','4-3'],
  // CB
  'Field':['4-3','46','Cover 2'],'Zone':['Cover 2','3-4'],'Bump and Run':['46','4-3'],
  // S
  'Coverage Specialist':['Cover 2','3-4','Flex'],'Box Specialist':['4-3','46'],'Hybrid':['Cover 2','4-3'],
};
// Stat modifiers per archetype (multipliers applied in genStats)
const ARCH_STAT_MOD={
  // QB archetypes
  'Tank':      {passYds:.75,passTD:.85,rushYds:2.2,rushTD:2.5},
  'Field General':{passYds:1.1,passTD:1.15,rushYds:.7,rushTD:.6},
  'Scrambler': {passYds:.9,passTD:.95,rushYds:1.8,rushTD:2.0},
  'Pure Runner':{passYds:.5,passTD:.6,rushYds:2.8,rushTD:3.0},
  'Gunslinger':{passYds:1.25,passTD:1.2,rushYds:.6,rushTD:.5},
  // RB archetypes
  'Contact Seeker':{rushYds:1.2,rushTD:1.25,recYds:.6,recTD:.6},
  'Receiving Back':{rushYds:.85,rushTD:.8,recYds:2.0,recTD:1.8},
  'Blocker':   {rushYds:.75,rushTD:.85,recYds:.5,recTD:.5},
  'Shifty':    {rushYds:1.1,rushTD:1.0,recYds:1.2,recTD:1.1},
  'Track Speed':{rushYds:1.3,rushTD:1.15,recYds:1.1,recTD:1.0},
  // WR archetypes
  'Jump Ball': {recYds:1.0,recTD:1.4},
  'Big Play':  {recYds:1.3,recTD:1.2},
  'Speedster': {recYds:1.25,recTD:1.05},
  'Gadget':    {recYds:1.1,recTD:1.1,rushYds:0.3,rushTD:0.2},
  // WR Shifty handled via key 'WR_Shifty' to avoid collision with RB Shifty
  'WR_Shifty': {recYds:1.15,recTD:1.0},
  // TE archetypes
  'Athletic Freak':{recYds:1.4,recTD:1.3},
  'Sure Hands':{recYds:1.1,recTD:1.2},
  'TE_Hybrid': {recYds:1.2,recTD:1.1},
  'TE_Blocker':{recYds:.6,recTD:.7},
  // DL archetypes
  'Speed Rusher':{tackles:.9,sacks:1.7},
  'Power Rusher':{tackles:1.2,sacks:1.3},
  'Pure Power': {tackles:1.4,sacks:1.1},
  'Edge Setter':{tackles:1.1,sacks:1.4},
  // LB archetypes
  'LB_Thumper':          {tackles:1.35,sacks:1.1,ints:.75},
  'LB_Coverage Specialist':{tackles:.85,sacks:.8,ints:1.5},
  'LB_Physical':         {tackles:1.3,sacks:1.15,ints:.8},
  'LB_Hitsticker':       {tackles:1.4,sacks:1.2,ints:.7},
  // CB archetypes
  'CB_Field':  {tackles:1.3,ints:.9},
  'CB_Zone':   {tackles:.9,ints:1.35},
  'CB_Bump and Run':{tackles:1.1,ints:1.1},
  // S archetypes
  'Coverage Specialist':{tackles:.85,ints:1.5},
  'Box Specialist':{tackles:1.4,ints:.75},
  'S_Hybrid':  {tackles:1.1,ints:1.1},
};

// Get archetype stat mod key (handles pos-specific collisions)
function archModKey(pos,arch){
  if(pos==='WR'&&arch==='Shifty')return'WR_Shifty';
  if(pos==='TE'&&arch==='Blocker')return'TE_Blocker';
  if(pos==='TE'&&arch==='Hybrid')return'TE_Hybrid';
  if(pos==='LB')return`LB_${arch}`;
  if(pos==='CB')return`CB_${arch}`;
  if(pos==='S'&&arch==='Hybrid')return'S_Hybrid';
  if(pos==='S'&&arch==='Coverage Specialist')return'Coverage Specialist';
  return arch;
}

// Scheme-fit bonus multiplier for stat generation
function archSchemeMult(arch,scheme,pos){
  const key=pos?archSchemeKey(pos,arch):arch;
  const fits=ARCH_SCHEME[key]||ARCH_SCHEME[arch];
  if(!fits)return 1.0;
  return fits.includes(scheme)?1.12:1.0;
}

// Key for ARCH_SCHEME lookup (handles LB collision with S Coverage Specialist)
function archSchemeKey(pos,arch){
  if(pos==='LB'&&(arch==='Coverage Specialist'||arch==='Physical'||arch==='Hitsticker'))return`LB_${arch}`;
  return arch;
}

// Pick archetype for a player, biased toward their school's scheme
function pickArchetype(pos,offS,defS){
  const opts=ARCHETYPES[pos];
  if(!opts||!opts.length)return null;
  // Weight options by scheme fit
  const weights=opts.map(a=>{
    const key=archSchemeKey(pos,a);
    const fits=ARCH_SCHEME[key]||ARCH_SCHEME[a];
    if(!fits)return 1;
    return(fits.includes(offS)||fits.includes(defS))?3:1;
  });
  const total=weights.reduce((s,w)=>s+w,0);
  let r=Math.random()*total;
  for(let i=0;i<opts.length;i++){r-=weights[i];if(r<=0)return opts[i];}
  return opts[opts.length-1];
}

const TRAITS=[
  {k:'leader',l:'Leader',c:'#0a2040',tc:'#66aaff',d:'Boosts morale'},
  {k:'workhorse',l:'Workhorse',c:'#0a3020',tc:'#44cc88',d:'Extra training gains'},
  {k:'hothead',l:'Hothead',c:'#440a0a',tc:'#ff8888',d:'Mood swings'},
  {k:'academic',l:'Academic',c:'#2a2a0a',tc:'#ddcc44',d:'Higher GPA, D3 offers'},
  {k:'clutch',l:'Clutch',c:'#200a30',tc:'#bb66ee',d:'Big-game performer'},
  {k:'lazy',l:'Lazy',c:'#1a1a1a',tc:'#aaa',d:'Slower development'},
  {k:'coachable',l:'Coachable',c:'#0a1a30',tc:'#66aacc',d:'Coaching bonus'},
  {k:'showboat',l:'Showboat',c:'#2a1a0a',tc:'#ddaa44',d:'Big plays, inconsistent'},
  {k:'competitor',l:'Competitor',c:'#1a0a20',tc:'#aa88ee',d:'Wins close games'},
  {k:'injury-prone',l:'Glass Bones',c:'#2a0a0a',tc:'#ee8888',d:'Higher injury risk'},
  {k:'gym-rat',l:'Gym Rat',c:'#0a2a2a',tc:'#44ddcc',d:'Extra speed/strength'},
  {k:'natural',l:'Natural',c:'#1a2a0a',tc:'#88dd44',d:'Faster rating gains'},
  {k:'humble',l:'Humble',c:'#0a1a1a',tc:'#88ccaa',d:'Never loses attitude offers'},
  {k:'film-junkie',l:'Film Junkie',c:'#1a1a2a',tc:'#88aadd',d:'Awareness grows faster'},
  {k:'big-game',l:'Big Game',c:'#220a22',tc:'#dd88cc',d:'Bonus in championships'},
];
const OFF_SCH=['Pro Style','Spread','Air Raid','Wing-T','Option','I-Formation'];
const DEF_SCH=['4-3','3-4','46','Cover 2','Flex'];
// v2.07: the colleges of the game's own country (all fictional), one program per real-life slot at every level
// (FBS, FCS, D2, D3, NAIA and junior college), each list ordered roughly by program strength
const D1FBS=["Llano Grande", "Coralina", "Magnolia", "Crestfield", "Cumberland", "Acadia", "Cascadia", "Llano Grande State", "Coralina State", "Magnolia State", "Llano Grande A&M", "Wakota", "Summit", "Tierra Alta", "Crestfield State", "Cumberland State", "Cascadia State", "Magnolia A&M", "Acadia State", "Coralina Tech", "Cumberland Tech", "Llano Grande Tech", "Wakota State", "Summit State", "Tierra Alta State", "Crestfield Tech", "Cascadia Tech", "Wakota Tech", "Summit Mines", "Acadia Tech", "Shelton University", "Ormsby University", "Northam University", "Langford University", "Beckett University", "Harrington University", "Wickham University", "Winslow University", "Ainsworth University", "Brookhaven University", "Eastern Llano Grande", "Southern Crestfield", "Central Tierra Alta", "Western Crestfield", "South Acadia", "North Summit", "Eastern Magnolia", "Western Llano Grande", "East Coralina", "Southern Cascadia", "Western Cumberland", "Northern Llano Grande", "Ranger Christian", "Benton State", "Spearman Christian", "Mason State", "Rockford", "Shelbyville", "Ganado", "Junction", "Borger State", "Haskell", "Granite", "Salado State", "Hereford State", "Beeville Christian", "Milford State", "Canadian", "Sonora State", "Canyon State", "Llano State", "Kaimana", "Jasper State", "Hico State", "Ozona State", "Tyler State", "Clarion", "Elgin", "Ravenwood", "Waco", "Aurora", "San Miguel Christian", "Graham State", "Odessa", "Kerrville State", "Pampa State", "Elmdale Christian", "San Benito State", "Fairfield State", "Granite State", "Wilmington", "Breckenridge", "Katy State", "Dover State", "Uvalde State", "Electra State", "Snyder", "Alvin State", "Kaimana State", "San Gabriel", "Ulysses State", "Garner State", "Comanche State", "Childress State", "Stephenville State", "Santa Rosa", "Belton State", "Lamesa State", "Bryan", "Cleveland State", "Gatesville State", "Santa Inés State", "Hallettsville State", "Madison", "Brenham Christian", "Cuero State", "Coleman State", "Rocksprings", "Stinnett State", "Wellington", "Ballinger Christian", "Hudson", "Refugio", "Eastland", "Santa Lucía State", "Killeen State", "Santo Tomás State", "Dumas", "Linwood", "Edna State", "Gonzales Christian", "Vernon", "Denton State", "Munday", "Thomasville State", "Quanah Christian", "Sweetwater Christian"];
const D1FCS=["Silsbee State", "West Summit", "Sandberg State", "Seguin", "Dalhart State", "Hutto", "Brady State", "Crestwood State", "Sinton State", "Shamrock", "Northern Summit", "Luling State", "Westby State", "Daingerfield", "San Jacinto State", "Perryton", "Santa Clara", "Santa Teresa", "Lufkin", "East Tierra Alta State", "Ashville", "Silverton State", "Lindell College", "Mexia State", "Saint Gresham", "Southern Acadia State", "Lampasas State", "Cotulla State", "Northern Magnolia", "Wharton", "Foxwood State", "South Granite", "Chesterton College", "North Granite State", "San Rafael State", "Hondo State", "Vance College", "Smyrna State", "Eastern Tierra Alta State", "Seymour State", "Lockhart State", "Central Coralina", "Southern Granite", "Crossroads State", "Central Kaimana State", "Kountze", "Abilene", "Seaford State", "Nora State", "Northbrook", "Irondale", "Saint Thornton", "Madsen College", "Lexington", "East Aurora", "Dunlap State", "Radford College", "Orchard Hill", "Clarkston State", "West Cascadia State", "Saint Keswick", "Western Coralina", "Oakwood", "West Coralina", "Burlington State", "Central Cascadia", "Harmon State", "Wadsworth College", "Eastern Wakota", "South Llano Grande", "Saint Loring", "Laramie", "Western Tierra Alta", "Northern Cascadia State", "Northern Granite", "West Cumberland", "Dunmore College", "Ridgefield College", "West Kaimana", "San Elizario State", "Centerville State", "Santa Cruz State", "North Magnolia State", "Shelton College", "Pella State", "Maplewood State", "Winchester State", "Southern Summit State", "Weston State", "Dunmore", "Jensen State", "Zetland", "Schaller State", "Central Cumberland", "Vinton", "Harlan State", "South Wakota", "Laurelton State", "Lohrville State", "Camden State", "Parkside", "Hartwell", "Chester State", "North Cascadia", "Newburgh State", "Saint Harrington", "East Granite", "East Cascadia", "Uniondale State", "Cranston College", "Emberly College", "Yoakum State", "Forrest Hills State", "East Acadia", "Pinebrook State", "Central Llano Grande", "East Magnolia State", "Fairview", "Walton State", "Yorktown State", "Eastern Aurora", "Eastport State", "Hilldale State", "North Wakota", "East Wakota", "Gilmer", "Saint Lyndon", "Viborg", "San Lorenzo"];
const D2=["Osage State", "San Isidro", "Remsen State", "Elmore State", "Vicksburg State", "Lakewood State", "Glendale State", "Odebolt State", "Manson State", "Corwin College", "Bayfield University", "Middletown University", "Exeter", "Northdale University", "Waverly State", "Easton College", "Clearfield", "Northam College", "Kirkland University", "Central Wakota", "Holstein State", "Newark State", "Lenox State", "Newport", "Quimby", "Marion State", "Salem State", "Midvale State", "Grandview State", "Eastern Kaimana", "Moorefield State", "Ida State", "Clinton State", "Brookhaven State", "Grantham College", "Fenton State", "Redding College", "Millfield State", "Sutton State", "Pembroke College", "Brandt State", "Belmont", "Allendale State", "Oakland", "Hartley State", "San Felipe State", "Arcadia", "North Crestfield", "Cedarburg University", "Thorson University", "Kingston State", "Gilmore", "Oakley College", "Colfax State", "Bellmont College", "Southern Coralina", "Upton University", "Jonesville State", "Western Wakota", "South Summit", "Jewell State", "Verdigre State", "Taylorsville State", "San Marcos", "San Ignacio University", "West Acadia", "Norwood University", "Halvorsen", "Kanawha State", "Kentwood State", "Quincyville State", "Inglewood State", "Rolfe State", "Ormsby College", "San Pablo University", "San Cayetano State", "San Andrés State", "Thor", "Vogel State", "Lindgren", "Everly University", "Oakfield State", "Riverside State", "Oxford State", "Nygaard State", "Sunbury State", "Kimball University", "Pilger", "Harrington State", "South Crestfield", "Woden", "Bancroft University", "Mortenson", "Primghar State", "Ulrich State", "Elkader State", "Ivywood State", "Lund State", "Decorah University", "Emmet State", "Tilden State", "Chesterton", "Kensington College", "Bristol", "Lockwood State", "Bramwell State", "Ormsby", "Norwood College", "Mercer Hill University", "Sutcliffe State", "Lyndon State", "Mercer Hill State", "Southern Wakota", "Sheldon", "Larchmont State", "Mayfield State", "Redding State", "West Magnolia", "Dalton University", "Northern Kaimana", "Whitmore State", "Delmar", "Yardley State", "North Llano Grande", "Gresham University", "Osgood University", "Easton State", "Alderman State", "Calloway College", "Larkspur State", "Fulton College", "Everett State", "Lindell University", "South Magnolia", "Ridgefield University", "Oakley", "Ravenscroft State", "Shelton State", "Larchmont", "Northam State", "Ashbury University", "Hadley", "Dorchester", "Upton State", "Queensbury College", "Ormsby State", "Wickham", "Ivydale State", "Oakley State", "Ashford University", "Iverson", "Whitcomb College", "Lyndon University"];
const D3=["Merriweather", "Middletown College", "Edna Wesleyan", "Saint Wickham", "Franklin Lutheran", "Gresham College", "Saint Easton", "Fielding", "Whitcomb", "Pinehurst College", "Cleveland Lutheran", "Childress College", "Kirkland College", "Beeville Methodist", "Wexford College", "Belton Methodist", "Jessop College", "Saint Ainsworth", "Edgewood College", "Gilchrist College", "Abernathy College", "Chester College", "Saint Carrington", "Seymour Wesleyan", "Saint Merriweather", "Saint Larkspur", "Harrington College", "Nolan College", "Prentiss College", "Langford College", "Sheffield", "Lyndon College", "Garner Lutheran", "Dempsey", "Quincy Lutheran", "Saint Pembroke", "Foxcroft College", "Llano Lutheran", "Caldwell College", "Harrington", "Ranger Methodist", "Hartwell College", "Sinton College", "Mexia Methodist", "Borger College", "Garrison College", "Saint Tillman", "Loring College", "Talbot", "Spearman Lutheran", "Thornton College", "Walton Wesleyan", "Abernathy", "Ballinger Lutheran", "Kilgore Methodist", "Langford", "Yorkshire College", "Lockhart Lutheran", "Uvalde College", "Allendale Lutheran", "Gatesville College", "Alvin College", "Kimbrough College", "Liberty Lutheran", "Saint Edgewood", "Bramwell College", "Quanah College", "Saint Blakemore", "Merriweather College", "Ozona Methodist", "Lamesa College", "Rockwell College", "Osgood College", "Saint Newbury", "Sonora Methodist", "Underhill College", "Hensley College", "Saint Ashbury", "Saint Mercer Hill", "Somerset College", "Larkspur College", "Blakemore", "Fielding College", "Prescott College", "Kendrick", "Vandermeer College", "Ingram", "Graham Methodist", "Lampasas Wesleyan", "Canyon College", "Saint Varnell", "Saint Yardley", "Killeen Wesleyan", "Marlowe College", "Hawthorne College", "Sweetwater College", "Kerrville Methodist", "Jasper College", "Ashford College", "Saint Dalton", "Ivydale College", "Everett College", "Fairbanks College", "Nash College", "Saint Tanglewood", "Salado College", "Stinnett Lutheran", "Kingsbury College", "Brenham College", "Silsbee College", "Mayfield", "Hereford Lutheran", "Mason Wesleyan", "Shelton", "Osage College", "Truett College", "Tyler Wesleyan", "Brady Wesleyan", "Lund College", "Primghar Wesleyan", "Hico Methodist", "Hadley College", "Varnell College", "Tanglewood College", "Hondo Lutheran", "Pelham College", "Santa Cruz Lutheran", "Cotulla College", "Chamberlain College", "Pella College", "Electra Wesleyan", "Grandview Wesleyan", "Westcott College", "Upton College", "Laurelton College", "Weston", "Stephenville College", "Saint Pritchard", "Benton Methodist", "Coleman Methodist", "Saint Hillsdale", "Ravenscroft College", "San Rafael College", "Nolan", "Rolfe College", "Beckett College", "Dalhart Lutheran", "Brookhaven Lutheran", "Cuero College", "Cisco Methodist", "Crestwood Lutheran", "Decorah Lutheran", "Hawthorne", "Overton College", "Rutherford College", "Pampa College", "Lenox Methodist", "Saint Ainsley", "Milford College", "Yoakum Lutheran", "Dunlap College", "Colfax College", "Maplewood Methodist", "Schaller Methodist", "Dorchester College", "Comanche College", "Luling Methodist", "San Cayetano College", "Saint Somerset", "Albany Methodist", "Taylorsville College", "San Elizario Methodist", "Overton", "Talbot College", "Georgetown Lutheran", "Katy Lutheran", "San Felipe Lutheran", "Everly College", "Carrington College", "Saint Nash", "Winchester College", "Whitmore College", "Temple Methodist", "Tilden Lutheran", "Glendale Methodist", "Kirkland", "San Benito Methodist", "Taylor Lutheran", "Thorson Lutheran", "Saint Chamberlain", "Gonzales Lutheran", "Quincyville Lutheran", "Saint Wadsworth", "Newbury", "Truman Methodist", "Bramwell", "Thomasville College", "Dalton College", "Saint Gilchrist", "San Pablo College", "Fairbanks", "Elmdale Wesleyan", "Tillman College", "Rollins College", "Tolliver College", "Newark Methodist", "Sutcliffe College", "Holstein Wesleyan", "Akron Lutheran", "Brandt Wesleyan", "Hallettsville Wesleyan", "Dalton", "Ashford", "Keswick", "Riverside College", "Salem College", "Santo Tomás College", "Osgood", "Jensen Lutheran", "San Andrés Wesleyan", "Inglewood Wesleyan", "Oakfield College"];
const NAIA=["Dover Christian", "Harmon Wesleyan", "Santa Lucía Wesleyan", "Sunbury Wesleyan", "Oxford Christian", "Santa Inés Baptist", "Forrest Hills Christian", "San Ignacio Wesleyan", "Kingston Christian", "Seaford Christian", "Pinebrook Baptist", "Eastport Wesleyan", "Northdale Baptist", "Nygaard Christian", "Odebolt Christian", "Hartley Wesleyan", "Vogel Christian", "Verdigre Wesleyan", "Sutton Wesleyan", "Marion Wesleyan", "Westby Baptist", "Norwood Wesleyan", "Greenville Christian", "Santa Elena Baptist", "Ivywood Baptist", "Mayfield College", "Yorktown Christian", "Cedarburg Wesleyan", "Kendrick College", "San Miguel Baptist", "San Jacinto Baptist", "Kentwood Christian", "Silverton Baptist", "Clarkston Nazarene", "Jonesville Christian", "Jewell Baptist", "Kimball Baptist", "Fenton Christian", "Upton Baptist", "Quinlan College", "Westfield Wesleyan", "Moorefield Wesleyan", "Yardley College", "Kanawha Christian", "Millfield Wesleyan", "Bancroft Wesleyan", "Fairfield Nazarene", "Foxwood Baptist", "Glenwood College", "Denton Baptist", "Lohrville Baptist", "Uniondale Wesleyan", "Centerville Wesleyan", "Remsen Christian", "Kendall Wesleyan", "Emmet Wesleyan", "Crossroads Christian", "Hilldale Christian", "Clinton Christian", "Elmore Wesleyan", "Bayfield Christian", "Midvale Wesleyan", "Elkader Baptist", "Ida Wesleyan", "Manson Baptist", "Mercer Hill College", "Newburgh Wesleyan", "Nora Baptist", "Vicksburg Wesleyan", "Fairhaven Wesleyan", "Camden Wesleyan", "Waverly Christian", "Sandberg Wesleyan", "Smyrna Nazarene", "Lakewood Christian", "Burlington Wesleyan", "Ulrich Christian", "Ingram Wesleyan", "Harlan Baptist", "Pruitt Christian", "Fielding Christian", "Ulysses Christian", "Tanglewood Christian", "Rollins Christian", "Pembroke Wesleyan", "Fairhaven College", "Newbury Wesleyan"];
const JUCO=["Crestwood CC", "Fayette County CC", "Jim Hogg County CC", "Lampasas CC", "Bandera County CC", "Granite Valley CC", "Lavaca County CC", "Nueces County CC", "Hidalgo County CC", "Sonora Community College", "Coke County CC", "Mexia Junior College", "Presidio County CC", "Burnet County CC", "Schleicher County CC", "Llano County CC", "Starr County CC", "Gillespie County CC", "Uvalde County CC", "Forrest Hills CC", "Sutton County CC", "Hondo CC", "Kaimana Valley CC", "Ozona Junior College", "Pella CC", "Stephenville CC", "Brazos County CC", "Alvin CC", "Sterling County CC", "Victoria County CC", "Lampasas County CC", "Quanah CC", "San Andrés CC", "Val Verde County CC", "Coleman CC", "Belton CC", "Holstein CC", "Kinney County CC", "Kimble County CC", "Salado Junior College", "Crestfield Valley CC", "Comal County CC", "Young County CC", "Medina County CC", "Glendale CC", "Childress CC", "Aurora Valley CC", "San Patricio County CC", "Luling CC", "Irion County CC", "Spearman CC", "Callahan County CC", "Bexar Norte County CC", "Frio County CC", "Real County CC", "Comanche CC", "Blanco County CC", "Mason CC", "Maverick County CC", "Pecos County CC", "Mills County CC", "Edna CC", "Jasper CC", "Goliad County CC", "Lakewood CC", "Colfax CC", "San Jacinto CC", "Runnels County CC", "Katy Junior College", "Kerrville CC", "Ida Junior College", "Dalhart CC", "Brady CC", "Hallettsville CC", "Reeves County CC", "Stinnett CC", "Harmon CC", "Travis Norte County CC", "Seymour CC", "Caddo County CC", "Gonzales County CC", "Cleveland CC", "Atascosa County CC", "Dimmit County CC", "Canyon CC", "Hereford CC", "Wakota Valley CC", "Brenham CC", "Marion CC", "Killeen CC", "Webb County CC", "Crossroads Junior College", "Hico CC", "Magnolia Valley CC", "Ranger CC", "Sunbury CC", "Pampa Community College", "Santa Cruz CC", "Ballinger CC", "Zavala County CC", "Cedarburg CC", "Uvalde CC", "Tom Green County CC", "Gatesville Junior College", "Edwards County CC", "Inglewood Junior College", "Wilson County CC", "McMullen County CC", "Karnes County CC"];
// v2.12: the game's 13 states get about a fifth of the real number of college programs (real: ~134 FBS, ~128 FCS, ~160 D2,
// ~240 D3, ~95 NAIA, ~130 junior colleges). The best FBS programs stay; the other levels are spread over the states by size.
const COL_KEEP={"FBS": ["Llano Grande", "Coralina", "Magnolia", "Crestfield", "Cumberland", "Acadia", "Cascadia", "Llano Grande State", "Coralina State", "Magnolia State", "Llano Grande A&M", "Wakota", "Summit", "Tierra Alta", "Crestfield State", "Cumberland State", "Cascadia State", "Magnolia A&M", "Acadia State", "Coralina Tech", "Cumberland Tech", "Llano Grande Tech", "Wakota State", "Summit State", "Tierra Alta State", "Crestfield Tech", "Cascadia Tech"], "FCS": ["Crestwood State", "Ashville", "Saint Gresham", "Foxwood State", "Chesterton College", "Smyrna State", "Sandberg State", "Westby State", "San Jacinto State", "Santa Clara", "Silsbee State", "Seguin", "Dalhart State", "Central Coralina", "Madsen College", "Lindell College", "Northern Magnolia", "Southern Acadia State", "Lexington", "West Summit", "South Granite", "North Granite State", "West Cascadia State", "Central Cascadia", "East Aurora", "Central Kaimana State"], "D2": ["Vicksburg State", "Lakewood State", "Glendale State", "Bayfield University", "Middletown University", "Exeter", "Northdale University", "Osage State", "Remsen State", "San Isidro", "Northam College", "Grantham College", "Larchmont State", "Delmar", "North Llano Grande", "Alderman State", "Southern Coralina", "Lockwood State", "Ridgefield University", "Elmore State", "Corwin College", "West Acadia", "Kentwood State", "Easton College", "Newport", "South Summit", "Mayfield State", "Upton University", "Grandview State", "Kingston State", "Chesterton", "Eastern Kaimana"], "D3": ["Middletown College", "Saint Wickham", "Whitcomb", "Pinehurst College", "Kirkland College", "Wexford College", "Saint Ainsworth", "Edgewood College", "Chester College", "Saint Carrington", "Harrington College", "Saint Easton", "Garner Lutheran", "Thornton College", "Fielding", "Abernathy College", "Lyndon College", "Dempsey", "Foxcroft College", "Edna Wesleyan", "Cleveland Lutheran", "Childress College", "Beeville Methodist", "Belton Methodist", "Seymour Wesleyan", "Franklin Lutheran", "Gilchrist College", "Quincy Lutheran", "Walton Wesleyan", "Saint Larkspur", "Sheffield", "Saint Blakemore", "Ashford College", "Merriweather", "Larkspur College", "Prentiss College", "Osgood College", "Somerset College", "Jessop College", "Everett College", "Gresham College", "Saint Merriweather", "Hensley College", "Shelton", "Grandview Wesleyan", "Fairbanks College", "Fairbanks", "Saint Pembroke"], "NAIA": ["Dover Christian", "Harmon Wesleyan", "Sunbury Wesleyan", "Oxford Christian", "Nygaard Christian", "Santa Lucía Wesleyan", "Santa Inés Baptist", "Kendall Wesleyan", "Pruitt Christian", "Yardley College", "Rollins Christian", "Greenville Christian", "Kendrick College", "Kentwood Christian", "Quinlan College", "Silverton Baptist", "Upton Baptist", "Kingston Christian", "Mayfield College"], "JUCO": ["Crestwood CC", "Forrest Hills CC", "Crestfield Valley CC", "Glendale CC", "Lakewood CC", "Harmon CC", "Crossroads Junior College", "Sunbury CC", "Cedarburg CC", "Sutton County CC", "Pella CC", "Holstein CC", "Colfax CC", "San Andrés CC", "San Jacinto CC", "Santa Cruz CC", "Fayette County CC", "Jim Hogg County CC", "Lampasas CC", "Bandera County CC", "Lavaca County CC", "Nueces County CC", "Magnolia Valley CC", "Granite Valley CC", "Aurora Valley CC", "Kaimana Valley CC"]};
const _COL_ALL={FBS:D1FBS.slice(),FCS:D1FCS.slice(),D2:D2.slice(),D3:D3.slice(),NAIA:NAIA.slice(),JUCO:JUCO.slice()};
function colKeepArr(A,lvl){const S=new Set(COL_KEEP[lvl]);const f=A.filter(n=>S.has(n));A.length=0;A.push(...f);return A;}
[[D1FBS,'FBS'],[D1FCS,'FCS'],[D2,'D2'],[D3,'D3'],[NAIA,'NAIA'],[JUCO,'JUCO']].forEach(([A,l])=>colKeepArr(A,l));
// a removed program maps to the kept program of the same level closest to it in prestige
function colRemapName(school,lvl){const K=COL_KEEP[lvl],A=_COL_ALL[lvl];if(!K||!A||K.includes(school))return school;const i=A.indexOf(school);if(i<0)return school;
  let best=K[0],bd=1e9;for(const n of K){const d=Math.abs(A.indexOf(n)-i);if(d<bd){bd=d;best=n;}}return best;}
const PFX=['North','South','East','West','Central','Lake','River','Pine','Oak','Valley','Ridge','Hill','Riverside','Jefferson','Lincoln','Washington','Adams','Madison','Monroe','Roosevelt','Kennedy','Harrison','Franklin','Grant','Wilson','Hamilton','Lafayette','Eisenhower','Jackson','Union','Heritage','Freedom','Liberty','Patriot','Frontier','Lakeview','Woodside','Greenfield','Westview','Hillcrest','Maplewood','Cedar','Elmwood','Oakdale','Sunridge','Stonegate','Ironwood','Clearwater','Crestview','Harborview','Bayshore','Timberline','Ridgemont','Sunnydale','Brookfield','Fairmont','Lakeside','Pineview','Wheatland','Bluewater','Silverado','Goldfield','Redwood','Blackhawk','Whiteoak','Greenbrier','Copperfield','Sagebrush','Plainview','Highpoint','Creekside','Willowbrook','Springdale','Marshfield','Deerfield','Copperstone','Starfield','Thunderbird','Irongate','Stonefield','Silverstone','Goldenrod','Mosswood','Harborside','Lakecrest','Riverbend','Summerfield','Winterhaven','Autumn Ridge','Sunrise','Sunset','Meadowbrook','Prairieville','Cornerstone','Eastgate','Westgate'];
const CITIES=['Springfield','Franklin','Madison','Georgetown','Clinton','Salem','Fairview','Greenville','Kingston','Chester','Dayton','Marion','Lexington','Bristol','Newport','Oxford','Hudson','Burlington','Winchester','Milford','Dover','Camden','Seaford','Harrington','Newark','Wilmington','Smyrna','Middletown','Benton','Ashville','Riverside','Lakewood','Hilldale','Cedarburg','Oakfield','Sunbury','Clearfield','Westfield','Eastport','Northbrook','Midvale','Brookhaven','Clarkston','Fairfield','Glendale','Hartwell','Irondale','Jonesville','Kirkland','Laurelton','Maplewood','Norwood','Oakwood','Pinebrook','Quincy','Rockford','Shelbyville','Thomasville','Uniondale','Vernon','Walton','Exeter','Yorktown','Zetland','Allendale','Belmont','Centerville','Denton','Elmore','Forrest Hills','Grandview','Hamilton','Ivywood','Jasper','Kendall','Linwood','Moorefield','Newburgh','Orchard Hill','Parkside','Quincyville','Ravenwood','Silverton','Taylorsville','Upton','Vicksburg','Weston','Crossroads','Bayfield','Crestwood','Dunmore','Elmdale','Foxwood','Gilmore','Harmon','Inglewood','Jensen','Kentwood','Laramie','Millfield','Northdale'];
const MCTS=['Eagles','Eagles','Panthers','Panthers','Bulldogs','Vikings','Wildcats','Tigers','Lions','Cougars','Pirates','Pirates','Red Devils','Redhawks','Huskies','Sharks','Dolphins','Hurricanes','Marlins','Seahawks','Loggers','Bucks','Golden Bears','Mariners','Cubs','Bronchos','Rattlers','Zebras','Polar Bears','Tractors','Rough Riders','Wampus Cats','Stingrays','Yellowjackets','Golden Eagles','Blue Devils','Ravens','Thunderbirds','Eagles','Tigers','Lions','Bears','Panthers','Bulldogs','Wildcats','Falcons','Mustangs','Raiders','Warriors','Vikings','Spartans','Trojans','Knights','Wolves','Cougars','Hawks','Rams','Cardinals','Chargers','Thunder','Storm','Blazers','Rockets','Cobras','Gators','Hornets','Bison','Stallions','Griffins','Titans','Patriots','Rebels','Coyotes','Bobcats','Monarchs','Phantoms','Jaguars','Gladiators','Sentinels','Comets','Cyclones','Dragons','Raptors','Cougars','Vipers','Wolfpack','Thunderhawks','Ironmen','Crusaders','Centurions','Marauders','Minutemen','Greyhounds','Bulldogs','Lancers','Pioneers','Cavaliers','Chargers','Nighthawks','Timberwolves','Grizzlies','Bobcats','Outlaws','Roughnecks','Wranglers','Longhorns','Steers','Broncos','Colts','Stallions','Bengals','Lynx','Wolverines','Coyotes','Foxes','Badgers','Otters','Falcons','Owls','Condors','Ospreys','Thunderbolts','Firebirds','Phoenixes','Inferno','Blaze','Fury','Force','Surge','Sting','Vipers','Mavericks','Desperados','Gunslingers','Badgers','Wolverines','Beavers','Otters','Gophers','Ducks','Penguins','Bees','Admirals','Cadets','Minutemen','Highlanders','Shamrocks','Dutchmen','Friars','Angels','Demons','Wizards','Jets','Aviators','Hammers','Defenders','Steelers','Torchbearers','Tritons','Explorers','Atoms','Scholars','Rooks','Boxers','Oaks','Acorns','Tornadoes','Meteors','Pilgrims','Quakers','Bells','Hilltoppers','Squirrels','Bats','Kangaroos','Elephants','Gorillas','Leopards','Goats','Mules','Razorbacks','Stags','Hounds','Terriers','Swans','Cranes','Turkeys','Crows','Robins','Orioles','Parrots','Spiders','Ants','Frogs','Lizards','Terrapins','Angels','Unicorns','Griffins','Gargoyles','Cyclops','Sabers','Gunners','Drillers','Firemen','Railroaders','Lamplighters','Suns','Crescents','Snowflakes','Maples','Apples','Sunflowers','Roses','Bigfoot','Captains','Musketeers','Witches','Leprechauns','Pharaohs','Sphinx','Kraken','Pegasus','Clippers','Blacksmiths','Gearheads','Conchs','Cherries'];
const LCOLS=[['#c41230','#fff'],['#003087','#c8aa37'],['#002244','#c60c30'],['#0c2340','#e9c046'],['#006341','#ffc72c'],['#4b0082','#ffd700'],['#8b0000','#c0c0c0'],['#ff6600','#000'],['#006db0','#fff'],['#2d2926','#e8b000'],['#003366','#b3862c'],['#1a1a2e','#e94560'],['#533483','#e8e8e8'],['#1b4332','#95d5b2'],['#7f1d1d','#fef3c7'],['#1e3a5f','#f4a460'],['#2d4a22','#ffd700'],['#4a1942','#e0c0ff'],['#1a2f4e','#ff8c00'],['#2c1810','#d4a070'],['#0d3026','#50c878'],['#3d1a00','#ff9933'],['#001a33','#66b3ff'],['#2a0a2a','#ff80ff'],['#001400','#80ff80'],['#330000','#ff6666'],['#001133','#3399ff'],['#1a0033','#cc99ff'],['#003300','#66ff66'],['#330033','#ff66ff'],['#0a1628','#4fc3f7'],['#1a2e05','#a5d6a7'],['#2e1503','#ffcc80'],['#1a1a3e','#9fa8da'],['#3e1a00','#ffab91'],['#001a1a','#80ffff'],['#1a3e1a','#b9f6ca'],['#3e001a','#ff80ab'],['#1a3e3e','#80d8ff'],['#0a2e0a','#ccff90']];
const FN=['Kai','Liam','Noah','Carter','Kaden','Trey','Jamal','Terrell','Javon','Keon','Ty','Brady','Gavin','Landon','Jace','Easton','Bryson','Colton','Dominic','Gabriel','Mateo','Santiago','Diego','Adrian','Julian','Marco','Luis','Carlos','Mario','Josiah','Jeremiah','Malachi','Ezekiel','Desmond','Quentin','Cedric','Lamar','Darnell','Reggie','Dante','Khalil','Jamir','Kobe','Keenan','Tariq','Hassan','Yusuf','Ibrahim','Kofi','Emeka','Tobi','Chidi','Hiroshi','Kenji','Daniel','David','Samuel','Joshua','Matthew','Nicholas','Sean','Patrick','Connor','Brendan','Finn','Grady','Holden','Beckett','Rhett','Brooks','Sawyer','Tucker','Hayden','Silas','Jett','Maddox','Knox','Zane','Kingston','Bryant','Marquise','Trevion','Jaylin','DeMarcus','Javier','Anthony','Vincent','Joey','Nico','Riley','Reid','Paxton','Ashton','Quinton','Rodney','Kameron','Kyree','Deion','Ahmad','Ronan','Declan','Everett','Malik','DeShawn','Jaylen','Marcus','Darius','Kevin','Tyrone','Andre','Devon','Cameron','Brandon','Isaiah','Caleb','Jordan','Tyler','Austin','Hunter','Cody','Blake','Drew','Xavier','Elijah','Aaron','Damien','Nate','Chris','Alex','Trevon','Micah','Logan','Mason','Aiden','Jalen','Devin','Zion','Tanner','Cole','Luke','Ryan','Bryce','Jayden','Amari','Keaton','Quincy','Darryl','Brett','Caden','Miles','Eli','Travis','Donovan','Kentrell','Rashad','Deon','Theo','Garrett','Parker','Reed','Chase','Wade','Hank','Levi','Seth','Owen','Wyatt','Joel','Gabe','Beau','Colt','Trace','Kendrick','Zach','Dylan','Ethan','Jason','Leon','Omar','Peyton','Victor','Warren'];
const LN=['Anderson','Thomas','Martinez','Hernandez','Lopez','Gonzalez','Ramirez','Torres','Gomez','Reyes','Morales','Ortiz','Gutierrez','Chavez','Ramos','Ruiz','Mendoza','Castillo','Jimenez','Vasquez','Romero','Herrera','Medina','Aguilar','Kim','Nguyen','Patel','Chen','Park','Tran','Okafor','Adeyemi','Mensah','Owusu','Boateng','Ali','Khan','Hassan','Sullivan','Kelly','Ryan','Gallagher','Kowalski','Novak','Schmidt','Mueller','Fischer','Weber','Becker','Hoffman','Schultz','Larson','Olson','Carlson','Peterson','Hansen','Jensen','Bishop','Booker','Dawson','Fields','Graves','Holloway','Jefferson','Lawson','McCoy','Porter','Spencer','Woods','Freeman','Gibson','Stephens','Wallace','Ford','Hunt','Marshall','Owens','Payne','Pierce','Stone','Warren','Watkins','Wheeler','Banks','Bennett','Brooks','Burke','Cannon','Carroll','Chambers','Cunningham','Daniels','Duncan','Ellis','Fletcher','Fowler','Gardner','Grant','Hamilton','Harper','Harrison','Hodges','Holland','Hudson','Lambert','Lucas','Mack','Malone','Mann','Mathis','McDaniel','Nash','Newton','Norris','Parsons','Quinn','Ray','Rhodes','Sharp','Shaw','Snyder','Steele','Sutton','Tate','Tucker','Wade','Webb','Wells','Whitaker','Wolfe','Williams','Johnson','Smith','Brown','Davis','Wilson','Moore','Taylor','Jackson','White','Harris','Martin','Thompson','Robinson','Clark','Lewis','Lee','Walker','Hall','Young','Allen','King','Wright','Scott','Green','Baker','Adams','Nelson','Carter','Mitchell','Perez','Roberts','Turner','Phillips','Campbell','Parker','Evans','Edwards','Collins','Stewart','Sanchez','Morris','Rogers','Reed','Cook','Morgan','Bell','Murphy','Bailey','Rivera','Henderson','Coleman','Jenkins','Perry','Powell','Long','Patterson','Hughes','Flores','Washington','Butler','Simmons','Foster','Gonzales','Bryant','Alexander','Russell','Griffin','Diaz','Hayes','Cruz','Cooper','Ward'];
const SKN=['#f4c89a','#e8b87a','#d4956a','#c07850','#a05830','#804020','#5a2e10'];
const HRC=['#1a0a00','#3a1a00','#5a3a10','#8a6030','#b89060','#d4b080','#e8e0c0','#cc3333','#3333cc','#222'];
const EYC=['#3a2a10','#2a3a10','#103a5a','#5a3a10','#2a2a2a'];
const SFPFX=['Mike','Jim','Tom','Dave','Rich','Bill','Greg','Paul','Mark','Dan','Steve','Joe'];
const SFSFX=['Thompson','Williams','Johnson','Davis','Martinez','Anderson','Taylor','White','Jackson','Harris'];

