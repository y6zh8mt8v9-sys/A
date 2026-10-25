// ═══════════ GENERATION ═══════════

// ── Global school name registry (prevents duplicates across all classes) ──
const _usedSchoolNames = new Set();
// Track how many schools exist in each city (for directional prefixes)
const _citySchoolCount = {};

// County names exposed for city pool (shared with COUNTIES which is defined later,
// so we duplicate them here as a base city pool)
const _BASE_CITIES = [
  'Springfield','Franklin','Madison','Georgetown','Clinton','Salem','Fairview','Greenville','Kingston','Chester',
  'Dayton','Marion','Lexington','Bristol','Newport','Oxford','Hudson','Burlington','Winchester','Milford',
  'Dover','Camden','Seaford','Harrington','Newark','Wilmington','Smyrna','Middletown','Benton','Ashville',
  'Riverside','Lakewood','Hilldale','Cedarburg','Oakfield','Sunbury','Clearfield','Westfield','Eastport','Northbrook',
  'Midvale','Brookhaven','Clarkston','Fairfield','Glendale','Maplewood','Cedarville','Pinehurst','Oakdale','Millbrook',
  'Ashwood','Baxter','Caldwell','Denton','Elmore','Fairmont','Granville','Harmon','Ivywood','Jasper',
  'Kendall','Laurel','Norwood','Pinecrest','Quinton','Ravenwood','Sutter','Talbot','Ulmer','Vernon',
  'Westgate','Exeter','Yarmouth','Alton','Brecken','Clover','Dunmore','Elmdale','Foxwood','Gilmore',
  'Harwick','Inglewood','Jameson','Kirkland','Linwood','Moorefield','Newburgh','Orchard','Parkside','Ridgeway',
  'Stanton','Thomaston','Uniondale','Vicksburg','Weston','Bayfield','Crestwood','Elsworth','Forrest','Glenmore',
  'Hartwell','Irondale','Jonesboro','Kentwood','Crossroads','Zenith','Lakeside','Sunridge','Crestview','Lakeview',
  'Pemberton','Stratford','Holbrook','Waverly','Carleton','Haverford','Millstone','Edgewood','Copperfield','Redstone',
  'Danforth','Emerson','Garrison','Holloway','Ingram','Jennings','Kessler','Langford','Mercer','Prescott',
  'Shelton','Tillman','Underwood','Vandermeer','Wexford','Olmstead','Norfield','Copley','Garfield','Hancock',
  'Abilene','Beaumont','Corsicana','Denison','Enfield','Florence','Hebron','Ironton','Janesville','Kenosha',
  'Lockhart','Muncie','Natchez','Opelika','Ponca','Rockdale','Seguin','Tifton','Uvalde','Vidalia',
  'Albertville','Blytheville','Conroe','Durant','Eunice','Ferriday','Gonzales','Harlingen','Idabel','Kaufman',
  'Levelland','Monahans','Nacogdoches','Pampa','Refugio','Stephenville','Brownwood','Clarksville','Decatur','Edinburg'
];

// Directional/qualifier prefixes for same-city schools
const _DIR_PFX = ['North','South','East','West','Central'];
// Independent themed prefixes as last resort
const _THEME_PFX = [
  'Lake','River','Pine','Oak','Valley','Ridge','Hill','Riverside','Jefferson','Lincoln',
  'Washington','Adams','Monroe','Roosevelt','Kennedy','Harrison','Grant','Wilson','Hamilton',
  'Lafayette','Eisenhower','Heritage','Freedom','Liberty','Patriot','Frontier','Woodside',
  'Greenfield','Westview','Hillcrest','Stonegate','Ironwood','Clearwater','Magnolia','Cypress',
  'Peachtree','Redwood','Silverwood','Meadow','Summit','Canyon','Creekside','Elmwood','Fairway',
  'Glenwood','Juniper','Kingswood','Larkspur','Maple','Northwood','Pinewood','Rosewood','Wildwood',
  'Autumn','Bayview','Cedarwood','Eaglewood','Graystone','Harborview','Jackson','Lakeshore'
];

function _genSchoolName(){
  // ~65% chance: name after city, ~20% county-style name, ~15% themed prefix
  const roll = Math.random();
  let nm, city;

  if(roll < 0.65){
    // City-named school: "Springfield High", "Franklin High"
    // Shuffle city pool and try each
    const cityPool = [..._BASE_CITIES].sort(()=>Math.random()-.5);
    for(const c of cityPool){
      const base = `${c} High`;
      if(!_usedSchoolNames.has(base)){
        nm = base; city = c;
        break;
      }
      // City already has a school, try directional prefixes
      const dirsLeft = _DIR_PFX.filter(d=>!_usedSchoolNames.has(`${c} ${d} High`));
      if(dirsLeft.length > 0){
        const d = dirsLeft[Math.floor(Math.random()*dirsLeft.length)];
        nm = `${c} ${d} High`; city = c;
        break;
      }
    }
  } else if(roll < 0.85){
    // County-style: "Ashwood County High", "Kendall High"
    const countyNames = [
      'Ashwood','Baxter','Caldwell','Denton','Elmore','Fairmont','Granville','Harmon','Ivywood','Jasper',
      'Kendall','Laurel','Millbrook','Norwood','Oakdale','Pinecrest','Quinton','Ravenwood','Sutter','Talbot',
      'Ulmer','Vernon','Westgate','Exeter','Yarmouth','Zenith','Alton','Brecken','Clover','Dunmore',
      'Elmdale','Foxwood','Gilmore','Harwick','Inglewood','Jameson','Kirkland','Linwood','Moorefield','Newburgh',
      'Orchard','Parkside','Ridgeway','Stanton','Thomaston','Uniondale','Vicksburg','Weston','Bayfield','Crestwood',
      'Elsworth','Forrest','Glenmore','Hartwell','Irondale','Jonesboro','Kentwood','Crossroads'
    ].sort(()=>Math.random()-.5);
    for(const cn of countyNames){
      const base = `${cn} High`;
      if(!_usedSchoolNames.has(base)){
        nm = base; city = cn;
        break;
      }
    }
  }

  // Fallback: themed prefix + city
  if(!nm){
    const pfxPool = [..._THEME_PFX].sort(()=>Math.random()-.5);
    const cityPool = [..._BASE_CITIES].sort(()=>Math.random()-.5);
    outer: for(const p of pfxPool){
      for(const c of cityPool){
        const candidate = `${p} High`;
        if(!_usedSchoolNames.has(candidate)){
          nm = candidate; city = c;
          break outer;
        }
      }
    }
  }

  // Ultimate fallback: themed prefix combos
  if(!nm){
    const extraPfx=['Crestfield','Stonehaven','Maplehurst','Ridgemont','Pinehaven','Oakmount','Lakemont',
      'Birchwood','Sprucewood','Ashcroft','Briarwood','Cedarmont','Fernwood','Groveton','Hazelwood',
      'Kingsford','Marshfield','Northgate','Oakmont','Peakview','Reedsburg','Sandstone','Thornwood',
      'Westmont','Yarborough','Zionsville','Abington','Berkshire','Cornwall','Devonshire','Edgemont',
      'Fallbrook','Glenbrook','Hillsboro','Ivanhoe','Kearney','Lockwood','Meadowbrook','Northhaven'];
    const allPfx=[..._THEME_PFX,...extraPfx].sort(()=>Math.random()-.5);
    for(const p of allPfx){
      const candidate=`${p} High`;
      if(!_usedSchoolNames.has(candidate)){nm=candidate;city=p;break;}
    }
  }
  if(!nm){
    const dirs=['North','South','East','West','Central','Upper','New','Lake','River','Pine'];
    const places=['Ridge','Valley','Grove','Creek','Falls','Pines','Oaks','Fields','Bluff','Crossing'];
    outer2: for(const d of dirs)for(const pl of places){
      const candidate=`${d} ${pl} High`;
      if(!_usedSchoolNames.has(candidate)){nm=candidate;city=`${d} ${pl}`;break outer2;}
    }
  }
  if(!nm){nm='Crestfield High';city='Crestfield';}

  _usedSchoolNames.add(nm);
  if(!_citySchoolCount[city]) _citySchoolCount[city]=0;
  _citySchoolCount[city]++;
  return {nm, city};
}

function makeDivisions(cls){
  const cfg=CLS_SZ[cls];const divs=[];
  // Distribute teams as evenly as possible across divisions (7-12 each)
  const divNames=(DIV_NAMES[cls]||[]);
  const divSizes=[];
  const base=Math.floor(cfg.t/cfg.d);
  let rem=cfg.t-(base*cfg.d);
  for(let d=0;d<cfg.d;d++){divSizes.push(base+(rem-->0?1:0));}
  for(let d=0;d<cfg.d;d++){
    const perDiv=divSizes[d];
    const teams=[];
    for(let t=0;t<perDiv;t++){
      let nm,city,msc,cnty=null,c1,c2,abbr;const U=USA.on?usaTake('CF'):null;
      if(U){({nm,city,cnty}=U);msc=U.mascot;c1=U.c1;c2=U.c2;abbr=U.abbr;_usedSchoolNames.add(nm);}
      else{({nm,city,cnty}=USA.on?usaSchoolName('CF',CLS_ORDER.indexOf(cls)/4,_usedSchoolNames):_genSchoolName());msc=mascPick(Math.random,MCTS);const ci=(_sId-1)%LCOLS.length;[c1,c2]=LCOLS[ci];abbr=abbr3(nm,_abbrUsed);}
      teams.push({id:_sId++,name:nm,city,cnty,mascot:msc,cls,dIdx:d,abbr,c1,c2,prestige:rng(1,5),wins:0,losses:0,isP:false,offS:pick(OFF_SCH),defS:pick(DEF_SCH),fac:{weight:1,film:1,train:1,med:1},staff:genStaff(false),trophies:[],tier:'avg',trainLevel:1});
    }
    divs.push({name:divNames[d]||`League ${d+1}`,teams});
  }
  // Assign tiers: ~30% good (top-band), ~35% bad (bottom-band), ~35% average (middle)
  // This creates real OVR spread, every classification has both elite and weak programs.
  const allTeams=divs.flatMap(dv=>dv.teams);
  const nGood=Math.max(1,Math.round(allTeams.length*0.30));
  const nBad=Math.max(1,Math.round(allTeams.length*0.35));
  const shuffled=[...allTeams].sort(()=>Math.random()-.5);
  shuffled.slice(0,nGood).forEach(t=>t.tier='good');
  shuffled.slice(nGood,nGood+nBad).forEach(t=>t.tier='bad');
  // rest keep 'avg' default
  return divs;
}

function genStaff(p){const nm=()=>`${pick(SFPFX)} ${pick(SFSFX)}`;return{hc:{name:nm(),lvl:p?1:rng(1,3)},oc:{name:nm(),lvl:p?1:rng(1,3)},dc:{name:nm(),lvl:p?1:rng(1,3)},rc:{name:nm(),lvl:p?1:rng(1,2)}};}

function gaussR(){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.max(-3,Math.min(3,Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)));}
function teamQ(sch,sId,successScore,facilScore){
  if(sch&&sch.q==null){const t=sch.tier||'avg';sch.q=+(t==='good'?0.62+Math.random()*0.38:t==='bad'?Math.random()*0.38:0.3+Math.random()*0.42).toFixed(3);}
  let q=sch&&sch.q!=null?sch.q:0.5;
  if(G&&sId===G.myId){const h=(G.hist||[]).length;if(h)q=clamp(0.15+successScore*0.6+facilScore*0.25,0,1);}
  else if(sch&&(sch.wins+sch.losses)>0){q=q*0.75+successScore*0.25;}
  return clamp(q,0,1);
}
