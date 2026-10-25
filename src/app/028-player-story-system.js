// ═══════════ PLAYER STORY SYSTEM ═══════════
// Stories generate 3-5 game-years after a player graduates, based on
// dev trait, rating, college level, position, and random life events.

const _STORY_JOBS = {
  elite:   ['NGL starter','All-League selection','Pro All-Star honoree','Gridiron Bowl champion','NGL MVP candidate','perennial starter','franchise cornerstone','two-time Pro All-Starer','starter who earned a second contract','key contributor on a Gridiron Bowl roster'],
  good:    ['NGL roster player','NGL practice squad veteran','MGL starter','SFL starter','indoor football veteran','special teams ace','backup who saw significant playing time','depth piece who stuck around for five seasons','MGL all-star','SFL team captain','core special teamer who played over 100 games'],
  avg:     ['MGL depth player','SFL backup','indoor football player','semi-pro player','Arena League contributor','regional league standout','USFL roster member','fan-favorite in the IFL','tryout player who made the most of his shot'],
  low:     ['recreational league player','flag football coach','youth football coach','high school assistant coach','college scout']
};
const _STORY_JOBS_INTL = [
  'ELF (European League of Football) starter','ELF All-Star','German Football League import star',
  'Canadian Football League veteran','MGL Maple Cup champion',
  'Japan X League import player','X League All-Star',
  'Liga de Fútbol Americano Profesional (Mexico) star',
  'Vanier Cup champion (Canada)','Australian Football League convert',
  'Finland American Football League MVP','Austrian Football League import'];
const _STORY_CAREERS = [
  'firefighter','police officer','high school teacher','college professor','physical therapist','sports agent',
  'real estate investor','entrepreneur','financial advisor','construction foreman','military officer',
  'personal trainer','sports broadcaster','high school head coach','college assistant coach','athletic director',
  'chiropractor','paramedic','electrician','software developer','social worker','pastor','marketing director',
  'strength and conditioning coach','insurance agent','car dealership owner','youth program director',
  'certified personal trainer','hospital administrator','school principal','commercial pilot','landscape architect',
  'restaurant owner','civil engineer','occupational therapist','data analyst','logistics coordinator',
  'sports nutritionist','nonprofit director','mortgage broker','high school principal','dental hygienist'
];
const _STORY_PLACES = [
  'back in {city}','in {city}','just outside {city}',
  'in a city he always dreamed of living in','far from where he grew up',
  'closer to family after years on the road','near his alma mater',
  'in the same neighborhood where he first learned to play',
  'in a suburb of {city} where he bought his first house',
  'somewhere quieter than the life he used to live',
  'two hours from {city}, where he put down roots'
];
const _STORY_FAMILY = [
  'got married','had his first child','welcomed twins','got engaged',
  'reconnected with family he had drifted from during his playing days',
  'became a mentor in his community','adopted a rescue dog with his wife',
  'bought his first home','moved back to take care of his mother','had a second child',
  'got married in a small ceremony attended by former teammates','became a foster parent',
  'started a foundation for underprivileged youth athletes','coaches his son\'s youth team on weekends',
  'is raising three kids and coaching youth flag football','married his high school sweetheart',
  'welcomed a daughter he says changed everything for him',
  'became a deacon at his local church','launched a summer football camp for kids in his neighborhood',
  'volunteers as a reading tutor at a local elementary school'
];
const _STORY_TRAGIC = [
  'suffered a career-ending knee injury in his first pro season',
  'was released after a hamstring tear that never fully healed',
  'battled chronic pain from repeated concussions and retired early',
  'lost his starting job to injury and never recaptured his form',
  'struggled with the transition out of football and spent time finding himself',
  'was cut in final roster reductions three years running before finally hanging it up',
  'retired abruptly after a training camp injury redefined his future',
  'sustained a serious ankle injury that shortened what could have been a long career',
  'tore his Achilles in only his second professional game',
  'never fully recovered from a torn labrum suffered in his rookie season',
  'was part of a wave of cuts that ended his pro hopes before they really began',
  'was released on the eve of the regular season and never caught on elsewhere',
  'walked away from the game after a third concussion in two years',
  'had a promising start cut short by a fractured tibia in training camp'
];
const _STORY_DRAFT_TEAMS = ['Crestfield Comets','Bayport Admirals','Iron City Forge','Lakeshore Storm','Summit Avalanche','Granite Quarrymen','Cascadia Timberwolves','Aurora Huskies','Kaimana Surf','Coralina Barracudas','Magnolia Monarchs','Acadia Bayou Kings','Cumberland Miners','Llano Grande Stampede','Tierra Alta Scorpions','Wakota Twisters','Capital City Senators','Riverton Rapids','Silver Lake Sentinels','Mesa Rattlers','Harbor City Anchors','Pine Valley Lumberjacks','Red Rock Outlaws','Gulf Coast Tarpons','Prairie Stallions','Midland Mustangs','Steel Valley Ironmen','Desert Sidewinders','Highland Pioneers','Bluewater Navigators','Twin Rivers Kingfishers','Northgate Knights'];
const _STORY_BROADCAST_LINES = [
  'occasionally appears as a color commentator on local sports radio',
  'has a popular football podcast with over 50,000 subscribers',
  'was featured in a documentary about small-town football programs',
  'gave an interview about his journey that went viral on social media',
  'was inducted into his college\'s athletic hall of fame',
  'co-hosts a weekly sports talk segment on regional TV',
  'wrote a memoir about growing up in a football family that was well-received',
  'runs a popular Instagram account where he breaks down film for young players',
  'became a pitchman for a regional athletic brand after retirement',
  'returned to his high school to speak to the team every spring',
  'has been a guest on two national sports podcasts discussing his career',
  'started a YouTube channel that gained a following among high school coaches'
];

// ── Position-specific pro career flavor lines ──
const _STORY_POS_PRO_ELITE={
  QB:['emerged as a franchise quarterback capable of winning playoff games',
      'became one of the more reliable starters in the league at his position',
      'broke multiple passing records in his first three seasons',
      'led his team to back-to-back playoff appearances in his first two years as a starter'],
  RB:['became one of the most electric backs in the league',
      'rushed for over 1,000 yards in each of his first three seasons',
      'earned a reputation as a workhorse who thrived between the tackles',
      'became the kind of back teams scheme around on third down'],
  WR:['became the go-to receiver in a high-octane offense',
      'led his team in receiving yards for three straight seasons',
      'earned a reputation as one of the league\'s best route runners',
      'emerged as a deep threat who redefined his team\'s passing game'],
  TE:['earned a reputation as one of the best blocking tight ends in the league',
      'became a matchup nightmare in the red zone, hauling in double-digit TDs his second season',
      'emerged as the kind of receiving tight end that changes how defenses play a team'],
  OL:['anchored an offensive line that allowed fewer than 25 sacks in his first full season',
      'developed into one of the more respected linemen at his position',
      'earned the reputation of a road-grader who makes life easy for his running backs'],
  DL:['became a disruptive presence off the edge, racking up double-digit sacks',
      'earned a reputation as one of the better interior pass rushers in his conference',
      'led his team in sacks in back-to-back seasons'],
  LB:['became the defensive centerpiece of a unit that finished in the top ten in scoring defense',
      'led his team in tackles for three straight seasons',
      'developed into one of the better coverage linebackers in the league'],
  CB:['developed into a lockdown corner who was rarely tested deep',
      'led the league in pass deflections his second season',
      'became a shutdown corner opposing coordinators game-planned around'],
  S:['became a ball-hawk safety with a nose for the big play',
      'was one of the better box safeties in the league at reading the run',
      'earned a reputation as the kind of safety quarterbacks think twice about targeting'],
  K:['became one of the more reliable kickers in the league, converting over 88% of his field goals',
      'hit a game-winning field goal in a playoff game that cemented his legacy',
      'was consistently among the top-five kickers in field goal percentage']
};
const _STORY_POS_PRO_GOOD={
  QB:['carved out a career as a reliable backup who started when his team needed him most',
      'served as a capable bridge starter who kept his team competitive'],
  RB:['carved out a role as a reliable third-down back and kick returner',
      'found a niche as a change-of-pace back who thrived in short-yardage situations'],
  WR:['carved out a role as a slot receiver and special teams contributor',
      'found steady work as a possession receiver who rarely dropped a ball'],
  TE:['served as a reliable blocking tight end who saw spot action in the passing game',
      'carved out a role as a safety valve over the middle'],
  OL:['served as a versatile swing lineman able to play three positions',
      'made his living as a depth piece who stepped in and held his own'],
  DL:['contributed as a rotational lineman and situational pass rusher',
      'carved out a role as a run-stuffing backup who played in key packages'],
  LB:['served as a core special teamer and backup linebacker',
      'made his living as a reliable depth player who always knew his assignment'],
  CB:['contributed as a nickel corner and special teams stalwart',
      'earned a reputation as a tough cover corner in the slot'],
  S:['served as a versatile safety who could play single high or in the box',
      'carved out a role as a core special teamer and reliable backup'],
  K:['bounced between two rosters before earning a stable role as a starting kicker',
      'found steady work as a reliable kicker in a smaller market']
};

// ── Draft team registry: prevents same team being assigned twice in one grad year ──
function _claimDraftTeam(gradYr,preferredIdx,rngFn){
  if(!G.draftTeamRegistry)G.draftTeamRegistry={};
  const reg=G.draftTeamRegistry;
  const n=_STORY_DRAFT_TEAMS.length; // 32
  // Try preferred, then walk forward through teams
  for(let offset=0;offset<n;offset++){
    const idx=(preferredIdx+offset)%n;
    const key=`${gradYr}-${idx}`;
    if(!reg[key]){reg[key]=true;return _STORY_DRAFT_TEAMS[idx];}
  }
  // All 32 teams used this year (shouldn't happen for small rosters), just return preferred
  return _STORY_DRAFT_TEAMS[preferredIdx%n];
}
// Key: `${gradYr}-${round}-${pick}`, value: true
// Stored on G so it persists with save data and resets correctly
function _getDraftRegistry(){
  if(!G.draftRegistry)G.draftRegistry={};
  return G.draftRegistry;
}

function _claimDraftSlot(gradYr,round,preferredPick,rngFn){
  const reg=_getDraftRegistry();
  // Try preferred pick, then shuffle outward until a free slot is found
  for(let offset=0;offset<32;offset++){
    const pick=((preferredPick-1+offset)%32)+1;
    const key=`${gradYr}-${round}-${pick}`;
    if(!reg[key]){reg[key]=true;return pick;}
  }
  // All 32 slots claimed, assign overflow picks starting at 33
  for(let extra=33;extra<=64;extra++){
    const key=`${gradYr}-${round}-${extra}`;
    if(!reg[key]){reg[key]=true;return extra;}
  }
  return 32; // absolute fallback
}

// Prestige tiers for FBS schools, affects stat volume and award chances
// FBS colleges are listed best first, so the tier follows the college's place in this world's list (renamed ones keep theirs)
function _fbsPrestigeTier(school){
  const i=D1FBS.indexOf(school);
  if(i>=0&&i<13)return'elite';
  if(i>=13&&i<24)return'good';
  return'mid';
}

function _seededRand(seed){
  // Simple seeded PRNG for deterministic stories
  let s=seed|0;
  s=Math.imul(48271,s+1)>>>0;
  return (s>>>16)/65536;
}

// ── Stat variance helper: adds realistic noise around a base value ──
function _statVar(base,rngFn,idx,variance=0.28){
  // Returns value between base*(1-variance) and base*(1+variance), slightly skewed
  const v=rngFn(idx);
  // Use a slight bell curve approximation (average of two randoms)
  const bell=(v+rngFn(idx+0.5))/2;
  return Math.round(base*(1-variance)+base*variance*2*bell);
}

function generatePlayerStory(p){
  if(p.story)return p.story; // already generated

  const seed=p.id*17+p.rat*31+(p.stars||1)*97;
  const rng=(i)=>_seededRand(seed+i*1000);

  const dev=p.dev||'Normal';
  const rat=p.rat||50;
  const stars=p.stars||1;
  const lvl=p.committed?.lvl||'none';
  const school=p.committed?.school||null;
  const pos=p.pos||'QB';
  const mySchoolName=myS()?.name||'the program';
  const gradYr=(p.gradYr||G.yr)+(G.baseYear||2026)-1;
  const storyYr=gradYr+Math.floor(3+rng(0)*4); // 3-6 yrs later

  // ── Determine outcome tier (more granular, uses rat more precisely) ──
  let tier='low';
  if((dev==='Elite Dev'||stars>=5)&&lvl==='FBS'&&rat>=82) tier='elite';
  else if((dev==='Elite Dev'||dev==='Star Dev')&&lvl==='FBS'&&rat>=72) tier='elite';
  else if((dev==='Elite Dev'||stars>=4)&&(lvl==='FBS'||lvl==='FCS')&&rat>=68) tier='good';
  else if(dev==='Star Dev'&&(lvl==='FBS'||lvl==='FCS')&&rat>=62) tier='good';
  else if(dev==='Impact'&&rat>=65&&(lvl==='FBS'||lvl==='FCS')) tier='good';
  else if(dev==='Elite Dev'&&rat>=58) tier='good';
  else if((dev==='Normal'||dev==='Impact')&&rat>=55&&stars>=3) tier='avg';
  else if(rat>=60&&lvl!=='none') tier='avg';
  else if(dev==='Impact'&&rat>=52) tier='avg';

  const cityRef=_STORY_PLACES[Math.floor(rng(1)*_STORY_PLACES.length)].replace('{city}',p.city||mySchoolName);
  const familyEvent=_STORY_FAMILY[Math.floor(rng(2)*_STORY_FAMILY.length)];
  const civilianJob=_STORY_CAREERS[Math.floor(rng(3)*_STORY_CAREERS.length)];
  const hasTragedy=tier!=='elite'&&rng(4)<(tier==='good'?0.22:tier==='avg'?0.3:0.18);
  const hasIntl=(tier==='good'&&rng(5)<0.28)||(tier==='avg'&&rng(5)<0.12);
  const broadcastLine=rng(6)<0.22?_STORY_BROADCAST_LINES[Math.floor(rng(7)*_STORY_BROADCAST_LINES.length)]:null;

  // College career quality descriptor, now also depends on school prestige
  const collegeLine=school?`After a ${_collegeCareerDesc(dev,lvl,rng(8),school)} career at ${school}`:'After going undrafted';

  // ── Generate college facts first (needed to inform pro narrative) ──
  const cf=_genCollegeCareerFacts(p);
  const colInjured=cf&&cf.injury;
  const colScandal=cf&&cf.scandal;
  // College injury/scandal can reduce tier for pro career narrative
  const proTierPenalty=(colInjured&&rng(50)<0.4)||(colScandal&&rng(51)<0.3);

  // ── Position-specific flavor pools (fall back to generic if pos not in pool) ──
  const posKey=['QB','RB','WR','TE','OL','DL','LB','CB','S','K'].includes(pos)?pos:'LB';
  const _pickPosElite=(r)=>{const pool=_STORY_POS_PRO_ELITE[posKey]||_STORY_POS_PRO_ELITE['LB'];return pool[Math.floor(r*pool.length)];}
  const _pickPosGood=(r)=>{const pool=_STORY_POS_PRO_GOOD[posKey]||_STORY_POS_PRO_GOOD['LB'];return pool[Math.floor(r*pool.length)];}

  // ── Helpers for rich body text variation ──
  function _ordinal(n){if(n===1)return'1st';if(n===2)return'2nd';if(n===3)return'3rd';return n+'th';}
  function _draftSlotDesc(round,pick,overall){
    if(round===1&&overall<=5)return`the coveted ${_ordinal(overall)} overall pick`;
    if(round===1)return`the ${_ordinal(overall)} overall pick`;
    if(round===2)return`the ${_ordinal(overall)} overall selection (2nd round)`;
    return`the ${_ordinal(overall)} overall pick (3rd round)`;
  }

  // ── Story narrative variant selector, adds real variation to body text ──
  const narrativeVariant=Math.floor(rng(30)*4); // 0-3, determines sentence structure

  let headline='', body='', icon='', outcome='';

  if(tier==='elite'&&!proTierPenalty){
    const fbsTier=lvl==='FBS'?_fbsPrestigeTier(school||''):null;
    const r1Threshold=fbsTier==='elite'?88:fbsTier==='good'?90:93;
    const r2Threshold=fbsTier==='elite'?80:fbsTier==='good'?83:86;
    const draftRound=rat>=r1Threshold?1:rat>=r2Threshold?2:3;
    const basePick=Math.floor(rng(9)*32)+1;
    const draftPick=_claimDraftSlot(gradYr,draftRound,basePick,rng);
    const overallPick=draftRound===1?draftPick:(draftRound-1)*32+draftPick;
    const draftTeam=_claimDraftTeam(gradYr,Math.floor(rng(10)*_STORY_DRAFT_TEAMS.length),rng);
    icon='';
    headline=`${p.fn} ${p.ln} drafted Round ${draftRound}, Pick ${draftPick} (No. ${overallPick} overall) by the ${draftTeam}`;
    outcome=`NGL Draft: Round ${draftRound}`;
    const draftSlotDesc=_draftSlotDesc(draftRound,draftPick,overallPick);
    const colStats=cf?`After posting ${cf.statsBlock} at ${school}`:`After a standout college career at ${school}`;

    const posFlavorElite=_pickPosElite(rng(21));
    // Multiple body narrative variants for elite NGL picks
    if(narrativeVariant===0){
      body=`${colStats}, ${p.fn} was selected by the ${draftTeam} with ${draftSlotDesc}. `+
        `In the pros, he ${posFlavorElite}${draftRound===1?', living up to every expectation that came with his draft position':draftRound===2?', surpassing what most scouts expected from a second-round pick':'a steal for the ${draftTeam} in the third round'}. `+
        (hasTragedy?_STORY_TRAGIC[Math.floor(rng(12)*_STORY_TRAGIC.length)]+', though he found a way to move forward. ':
          `Away from the game, he ${familyEvent} ${cityRef}. `)+
        (broadcastLine?'He '+broadcastLine+'.':'');
    } else if(narrativeVariant===1){
      const hsDraft=`When the ${draftTeam} called his name${draftRound===1?' in the first round':draftRound===2?' in the second round':' on Day 2'}, it validated everything ${p.fn} worked for coming out of ${mySchoolName}. `;
      body=hsDraft+
        `He quickly ${posFlavorElite}. `+
        (hasTragedy?_STORY_TRAGIC[Math.floor(rng(12)*_STORY_TRAGIC.length)]+'. '+`Despite the setback, he remained a respected voice in the locker room. `:
          `By ${storyYr}, he ${familyEvent} and put down roots ${cityRef}. `)+
        (broadcastLine?'He '+broadcastLine+'.':'');
    } else if(narrativeVariant===2){
      body=`${p.fn} was one of the most coveted prospects from the ${gradYr} class, and the ${draftTeam} didn't hesitate, selecting him with ${draftSlotDesc}. `+
        `At the pro level, he ${posFlavorElite}. `+
        (hasTragedy?'Off the field, '+_STORY_TRAGIC[Math.floor(rng(12)*_STORY_TRAGIC.length)]+' cast a shadow over what had been a promising start. ':
          `Outside the game, he ${familyEvent} and settled in ${cityRef}. `)+
        (broadcastLine?'He also '+broadcastLine+'.':'');
    } else {
      const fbsNote=fbsTier==='elite'?` Playing at ${school} had honed him into an NGL-ready prospect.`:fbsTier==='good'?` His time at ${school} gave him the tools to compete at the next level.`:'';
      body=`${colStats}.${fbsNote} The ${draftTeam} made it official, trading up to take him with ${draftSlotDesc}. `+
        `He went on to ${posFlavorElite}${draftRound===1?', cementing himself as a franchise piece':' and carving out a long career'}. `+
        (hasTragedy?_STORY_TRAGIC[Math.floor(rng(12)*_STORY_TRAGIC.length)]+' tested his resolve, but he pushed through. ':
          `In ${storyYr}, he ${familyEvent} ${cityRef}. `)+
        (broadcastLine?'He '+broadcastLine+'.':'');
    }

  } else if(tier==='elite'&&proTierPenalty){
    const basePick=Math.floor(rng(9)*32)+1;
    const draftPick=_claimDraftSlot(gradYr,3,basePick,rng);
    const overallPick=64+draftPick;
    const draftTeam=_claimDraftTeam(gradYr,Math.floor(rng(10)*_STORY_DRAFT_TEAMS.length),rng);
    const tragic=_STORY_TRAGIC[Math.floor(rng(12)*_STORY_TRAGIC.length)];
    icon='';
    headline=`${p.fn} ${p.ln} drafted Round 3 by the ${draftTeam}, career cut short`;
    outcome='NGL Draft Pick';
    if(narrativeVariant<2){
      body=`The talent was never in question, the ${draftTeam} saw enough to take ${p.fn} in the third round. But ${tragic}, and the career everyone expected never fully materialized. `+
        `He ${familyEvent} and rebuilt his life ${cityRef}. `+
        (broadcastLine?'He still '+broadcastLine+'.':'He speaks with honesty about what the game gave him and what it took away.');
    } else {
      body=`${p.fn} entered the draft with legitimate buzz, landing with the ${draftTeam} in round three. Unfortunately, ${tragic}. `+
        `He has since found a new path as a ${civilianJob} ${cityRef}, and by ${storyYr} ${familyEvent}. `+
        (broadcastLine?'He '+broadcastLine+'.':'Those who played with him say his attitude never wavered.');
    }

  } else if(tier==='good'&&hasIntl){
    const intlLeague=_STORY_JOBS_INTL[Math.floor(rng(13)*_STORY_JOBS_INTL.length)];
    icon='';
    headline=`${p.fn} ${p.ln} takes his game overseas, ${intlLeague}`;
    outcome='International Pro';
    if(narrativeVariant<2){
      body=`When the domestic opportunities dried up, ${p.fn} took his game overseas and never looked back. `+
        `He signed on as a ${intlLeague} and built a reputation as one of the more reliable American imports in the league. `+
        (hasTragedy?'Unfortunately, '+_STORY_TRAGIC[Math.floor(rng(14)*_STORY_TRAGIC.length)]+'. ':
          `By ${storyYr}, coaches and teammates abroad were singing his praises. `)+
        `Off the field, he ${familyEvent} ${cityRef}.`;
    } else {
      body=`${collegeLine}, ${p.fn} weighed his options and bet on himself, signing as a ${intlLeague}. `+
        (hasTragedy?'Things didn\'t go as planned: '+_STORY_TRAGIC[Math.floor(rng(14)*_STORY_TRAGIC.length)]+'. He still found a way to enjoy his time abroad. ':
          `He thrived internationally, becoming one of the top players at his position in the league by ${storyYr}. `)+
        `He ${familyEvent} and made a life ${cityRef}.`;
    }

  } else if(tier==='good'){
    const proJob=_STORY_JOBS.good[Math.floor(rng(15)*_STORY_JOBS.good.length)];
    const posFlavorGood=_pickPosGood(rng(22));
    icon='';
    // More varied headlines based on college level and path
    if(lvl==='FBS'){
      headline=`${p.fn} ${p.ln} fights his way onto an NGL roster as a ${proJob}`;
    } else if(lvl==='FCS'){
      headline=`${p.fn} ${p.ln} earns a pro contract, ${proJob}`;
    } else {
      headline=`${p.fn} ${p.ln} keeps the dream alive as a ${proJob}`;
    }
    outcome='Professional Football';
    const colContext=cf?`After ${cf.statsBlock.split(',')[0]} at ${school}`:`After his time at ${school}`;

    if(narrativeVariant===0){
      body=`${colContext}, ${p.fn} went undrafted but refused to let that be the end of his story. He signed as a ${proJob} and ${posFlavorGood}. `+
        (hasTragedy?_STORY_TRAGIC[Math.floor(rng(16)*_STORY_TRAGIC.length)]+'. ':` He ${familyEvent} and made a life ${cityRef}. `)+
        (broadcastLine?'He also '+broadcastLine+'.':'By '+storyYr+', he looked back on a football life well-lived.');
    } else if(narrativeVariant===1){
      body=`Not every pro story starts on Draft Day. ${p.fn} signed as a ${proJob} after going undrafted, and then ${posFlavorGood}. `+
        (hasTragedy?'His time in the game was cut short, '+_STORY_TRAGIC[Math.floor(rng(16)*_STORY_TRAGIC.length)]+'. ':'He '+familyEvent+' and settled down '+cityRef+'. ')+
        (broadcastLine?'He '+broadcastLine+'.':'He often talks about what it meant to make a living at the game he loves.');
    } else if(narrativeVariant===2){
      body=`${p.fn} never heard his name called on draft day, but he earned his spot anyway. Working his way up as a ${proJob}, he ${posFlavorGood}. `+
        (hasTragedy?'The run ended when '+_STORY_TRAGIC[Math.floor(rng(16)*_STORY_TRAGIC.length)]+'. ':
          `Off the field, he ${familyEvent} and put down roots ${cityRef}. `)+
        (broadcastLine?'He '+broadcastLine+'.':'');
    } else {
      body=`The scouts didn't come calling, but ${p.fn} signed with a team anyway as a ${proJob}. He ${posFlavorGood}, and proved he belonged at the next level. `+
        (hasTragedy?_STORY_TRAGIC[Math.floor(rng(16)*_STORY_TRAGIC.length)]+'. ':'He '+familyEvent+' in ${storyYr} and lives '+cityRef+'. ')+
        (broadcastLine?'He also '+broadcastLine+'.':'Teammates remember him as the hardest worker in every room he entered.');
    }

  } else if(tier==='avg'){
    const keepPlaying=rng(17)<0.5;
    if(keepPlaying){
      const avgjob=_STORY_JOBS.avg[Math.floor(rng(18)*_STORY_JOBS.avg.length)];
      icon='';
      headline=`${p.fn} ${p.ln} keeps playing, ${avgjob}`;
      outcome='Semi-Pro Career';
      if(narrativeVariant<2){
        body=`${collegeLine}, ${p.fn} wasn't ready to hang up his cleats. He competed as a ${avgjob}, bringing the same work ethic he developed at ${mySchoolName}. `+
          `He ${familyEvent} along the way and built a life ${cityRef}. `+
          (broadcastLine?'He '+broadcastLine+'.':'By '+storyYr+', he had balanced football with everything else life threw at him.');
      } else {
        body=`The collegiate career ended, but ${p.fn}'s playing days didn't. He found a home as a ${avgjob}, where his experience and football IQ made him a leader even at that level. `+
          `He ${familyEvent} and lives ${cityRef}. `+
          (broadcastLine?'He '+broadcastLine+'.':'He still has game tape from those years and watches it with his kids.');
      }
    } else {
      icon='';
      // Varied endings for avg players who leave football
      const leaveVariant=Math.floor(rng(31)*3);
      if(leaveVariant===0){
        headline=`${p.fn} ${p.ln} trades in the cleats for a career as a ${civilianJob}`;
        outcome='Post-Football Career';
        body=`${collegeLine}, ${p.fn} made the decision to step away from the game. He found his footing as a ${civilianJob} and hasn't looked back. `+
          `He ${familyEvent} and has built a solid life ${cityRef}. `+
          `He still bleeds football on Saturdays and stops by practice whenever he's in town.`;
      } else if(leaveVariant===1){
        headline=`${p.fn} ${p.ln} walks away from football and builds a new life`;
        outcome='Post-Football Career';
        body=`After college, ${p.fn} took a hard look at what came next and chose a different path, becoming a ${civilianJob} ${cityRef}. `+
          `He ${familyEvent}, and by ${storyYr} he was known in his community for more than just football. `+
          `He coaches youth ball on weekends and is exactly the kind of guy kids look up to.`;
      } else {
        headline=`${p.fn} ${p.ln} turns the page, life as a ${civilianJob}`;
        outcome='Post-Football Career';
        body=`Football gave ${p.fn} a lot: discipline, friendships, and a platform to prove himself. After his college career ended, he channeled all of that into becoming a ${civilianJob}. `+
          `He ${familyEvent} and has built a good life ${cityRef}. `+
          `He credits ${mySchoolName} with teaching him the habits that carried him forward.`;
      }
    }
  } else {
    // Low tier, more diverse endings
    const lowVariant=Math.floor(rng(32)*4);
    icon='';
    if(lowVariant===0){
      headline=`${p.fn} ${p.ln} finds a calling as a ${civilianJob}`;
      outcome='New Chapter';
      body=`Football prepared ${p.fn} for more than he realized at the time. After his playing days ended, he became a ${civilianJob} ${cityRef}. `+
        `He ${familyEvent} and is known for the work ethic he built on the practice field at ${mySchoolName}. `+
        `He still shows up on Friday nights and sometimes helps with the JV squad.`;
    } else if(lowVariant===1){
      const tragi=_STORY_TRAGIC[Math.floor(rng(20)*_STORY_TRAGIC.length)];
      icon='';
      headline=`${p.fn} ${p.ln} moves on from football`;
      outcome='Life After Football';
      body=`${p.fn} gave everything he had on the field. In the end, ${tragi}. `+
        `By ${storyYr}, he had built a new life as a ${civilianJob} and ${familyEvent} ${cityRef}. `+
        `He speaks warmly about his time at ${mySchoolName} and what the game taught him about himself.`;
    } else if(lowVariant===2){
      icon='';
      headline=`${p.fn} ${p.ln} gives back, coaching and community`;
      outcome='Giving Back';
      body=`Life after football took ${p.fn} in an unexpected direction. He became a ${civilianJob} ${cityRef} and threw himself into giving back to youth sports in his community. `+
        `He ${familyEvent} and by ${storyYr} had coached over a hundred young athletes through summer programs. `+
        `Former teammates describe him as the person they'd call in a tough spot.`;
    } else {
      icon='';
      headline=`${p.fn} ${p.ln}, where the game took him`;
      outcome='Life After Football';
      body=`Not every football story ends on a big stage. ${p.fn} played hard every time he laced up at ${mySchoolName}, and that drive followed him into civilian life. `+
        `He became a ${civilianJob}, ${familyEvent}, and settled in ${cityRef}. `+
        `By ${storyYr}, football was a chapter, not the whole story, and he wouldn't have it any other way.`;
    }
  }

  const story={headline,body,icon,outcome,tier,storyYr,generated:true};
  p.story=story;
  return story;
}

function _collegeCareerDesc(dev,lvl,r,school){
  // School prestige modifies descriptor for FBS
  const fbsTier=lvl==='FBS'?_fbsPrestigeTier(school||''):'mid';
  if(lvl==='FBS'){
    if(dev==='Elite Dev'){
      if(fbsTier==='elite')return['dominant','record-breaking','trophy-caliber'][Math.floor(r*3)];
      return['standout','dominant','breakout'][Math.floor(r*3)];
    }
    if(dev==='Star Dev'){
      if(fbsTier==='elite')return['solid','productive','quietly impressive'][Math.floor(r*3)];
      return['standout','impressive','breakout'][Math.floor(r*3)];
    }
    if(dev==='Impact')return['solid','productive','respectable'][Math.floor(r*3)];
    return (fbsTier==='elite'?['limited','developing','redshirt-heavy']:['quiet','modest','developing'])[Math.floor(r*3)];
  }
  if(lvl==='FCS'){
    if(dev==='Elite Dev')return['dominant','record-breaking','All-American'][Math.floor(r*3)];
    if(dev==='Star Dev')return['strong','standout','impressive'][Math.floor(r*3)];
    return ['solid','competitive','steady'][Math.floor(r*3)];
  }
  if(lvl==='D2')  return ['successful','productive','steady'][Math.floor(r*3)];
  if(lvl==='D3')  return ['meaningful','character-building','rewarding'][Math.floor(r*3)];
  if(lvl==='NAIA')return ['productive','hard-nosed','steady'][Math.floor(r*3)];
  return ['short','brief','cup of coffee'][Math.floor(r*3)];
}

// ── Generate a rich college career fact block for the Story tab ──
function _genCollegeCareerFacts(p){
  if(p._cf!==undefined)return p._cf; // cached, generated once per player
  const seed=p.id*41+p.rat*13+(p.stars||1)*71;
  const sr=(i)=>_seededRand(seed+i*777);
  const dev=p.dev||'Normal';
  const rat=p.rat||50;
  const lvl=p.committed?.lvl||'none';
  const school=p.committed?.school||null;
  const pos=p.pos||'QB';
  if(!school||lvl==='none'){p._cf=null;return null;}

  // ── Stat scale: dev trait × level × school prestige ──
  const devMult={
    'Elite Dev':  {FBS:1.5,FCS:1.35,D2:1.15,D3:1.0,JUCO:0.85},
    'Star Dev':   {FBS:1.2,FCS:1.1, D2:0.95,D3:0.82,JUCO:0.72},
    'Impact':     {FBS:0.92,FCS:0.85,D2:0.78,D3:0.68,JUCO:0.58},
    'Normal':     {FBS:0.68,FCS:0.65,D2:0.6, D3:0.55,JUCO:0.48},
  }[dev]||{FBS:0.68,FCS:0.65,D2:0.6,D3:0.55,JUCO:0.48};
  const baseMult=devMult[lvl]||0.55;

  // School prestige modifier for FBS
  const fbsTier=lvl==='FBS'?_fbsPrestigeTier(school):'mid';
  // At elite programs, average players get fewer stats (deeper roster, less playing time)
  // Elite players at elite programs get more stats (better teammates, bowl games, etc.)
  const prestigeAdj=(dev==='Elite Dev'||dev==='Star Dev')
    ?(fbsTier==='elite'?1.12:fbsTier==='good'?1.05:1.0)
    :(fbsTier==='elite'?0.82:fbsTier==='good'?0.92:1.0);
  const statScale=baseMult*prestigeAdj;

  // Seasons played (redshirts, injuries reduce it)
  const baseSeasons=dev==='Elite Dev'?4:dev==='Star Dev'?3.5:3;
  const seasons=Math.max(1,Math.round(_statVar(baseSeasons,sr,1,0.22)));
  const gamesPerSeason=lvl==='FBS'?Math.round(_statVar(12,sr,0,0.15)):
                       lvl==='FCS'?Math.round(_statVar(11,sr,0,0.15)):
                       Math.round(_statVar(10,sr,0,0.18));

  // ── Position-specific stats with real variance ──
  let statsBlock='';
  let statsObj={};

  if(pos==='QB'){
    // Yards per season at full scale ~2800-4200 for elite FBS, down to ~800-1400 for normal D3
    const baseYdsSeason={FBS:3400,FCS:2600,D2:2100,D3:1500,JUCO:1800}[lvl]||1500;
    const yds=Math.round(_statVar(baseYdsSeason*statScale*seasons,sr,2,0.3));
    const tdBase={FBS:26,FCS:22,D2:18,D3:14,JUCO:18}[lvl]||14;
    const td=Math.round(_statVar(tdBase*statScale*seasons,sr,3,0.32));
    // INTs inversely correlated with dev, elite QBs throw fewer
    const intBase={FBS:9,FCS:8,D2:7,D3:6,JUCO:8}[lvl]||8;
    const intMult=dev==='Elite Dev'?0.55:dev==='Star Dev'?0.75:dev==='Impact'?1.0:1.3;
    const ints=Math.max(1,Math.round(_statVar(intBase*intMult*seasons,sr,4,0.35)));
    const cmpPct=Math.round(_statVar(dev==='Elite Dev'?66:dev==='Star Dev'?62:dev==='Impact'?58:54,sr,5,0.1));
    statsObj={yds,td,ints,cmpPct,seasons};
    statsBlock=`${yds.toLocaleString()} passing yards, ${td} TDs, ${ints} INTs (${cmpPct}% completion) over ${seasons} season${seasons!==1?'s':''}`;
  } else if(pos==='RB'){
    const baseYdsSeason={FBS:950,FCS:850,D2:780,D3:650,JUCO:750}[lvl]||650;
    const yds=Math.round(_statVar(baseYdsSeason*statScale*seasons,sr,2,0.32));
    const tdBase={FBS:10,FCS:9,D2:8,D3:7,JUCO:9}[lvl]||7;
    const td=Math.round(_statVar(tdBase*statScale*seasons,sr,3,0.3));
    const avgBase=dev==='Elite Dev'?5.6:dev==='Star Dev'?5.1:dev==='Impact'?4.6:4.1;
    const avg=(_statVar(avgBase,sr,6,0.15)).toFixed(1);
    const recYds=Math.round(_statVar(180*statScale*seasons,sr,7,0.4));
    statsObj={yds,td,avg,recYds,seasons};
    statsBlock=`${yds.toLocaleString()} rushing yards (${avg} ypc), ${td} TDs, ${recYds} receiving yards over ${seasons} season${seasons!==1?'s':''}`;
  } else if(pos==='WR'){
    const baseRecSeason={FBS:58,FCS:50,D2:45,D3:38,JUCO:44}[lvl]||38;
    const rec=Math.round(_statVar(baseRecSeason*statScale*seasons,sr,2,0.3));
    const ypcBase=dev==='Elite Dev'?15.8:dev==='Star Dev'?14.5:dev==='Impact'?13.2:12.0;
    const ypc=(_statVar(ypcBase,sr,6,0.14)).toFixed(1);
    const yds=Math.round(rec*parseFloat(ypc));
    const tdBase={FBS:7,FCS:6,D2:5,D3:4,JUCO:5}[lvl]||4;
    const td=Math.round(_statVar(tdBase*statScale*seasons,sr,4,0.32));
    statsObj={rec,yds,td,ypc,seasons};
    statsBlock=`${rec} receptions, ${yds.toLocaleString()} yards (${ypc} ypc), ${td} TDs over ${seasons} season${seasons!==1?'s':''}`;
  } else if(pos==='TE'){
    const baseRecSeason={FBS:38,FCS:32,D2:28,D3:22,JUCO:26}[lvl]||22;
    const rec=Math.round(_statVar(baseRecSeason*statScale*seasons,sr,2,0.3));
    const ypcBase=dev==='Elite Dev'?13.5:dev==='Star Dev'?12.2:11.0;
    const ypc=(_statVar(ypcBase,sr,6,0.14)).toFixed(1);
    const yds=Math.round(rec*parseFloat(ypc));
    const td=Math.round(_statVar(5*statScale*seasons,sr,4,0.35));
    statsObj={rec,yds,td,seasons};
    statsBlock=`${rec} receptions, ${yds.toLocaleString()} yards, ${td} TDs over ${seasons} season${seasons!==1?'s':''}`;
  } else if(pos==='OL'){
    // OL stats: starts, all-conference mentions
    const starts=Math.round(_statVar(gamesPerSeason*seasons*statScale,sr,2,0.2));
    statsObj={starts,seasons};
    statsBlock=`${starts} career starts over ${seasons} season${seasons!==1?'s':''}${dev==='Elite Dev'?'anchored an offensive line that allowed fewer than 20 sacks per season':dev==='Star Dev'?'earned a reputation as a reliable pass protector':''}`;
  } else if(pos==='DL'){
    const baseSckSeason={FBS:6.5,FCS:7.0,D2:8.0,D3:7.5,JUCO:7.0}[lvl]||6.0;
    const sck=(_statVar(baseSckSeason*statScale*seasons,sr,2,0.35)).toFixed(1);
    const tckBase={FBS:45,FCS:50,D2:55,D3:50,JUCO:48}[lvl]||45;
    const tck=Math.round(_statVar(tckBase*statScale*seasons,sr,3,0.28));
    const tfl=Math.round(_statVar(12*statScale*seasons,sr,4,0.3));
    statsObj={sck,tck,tfl,seasons};
    statsBlock=`${sck} sacks, ${tck} tackles, ${tfl} TFL over ${seasons} season${seasons!==1?'s':''}`;
  } else if(pos==='LB'){
    const baseTckSeason={FBS:72,FCS:80,D2:88,D3:82,JUCO:78}[lvl]||72;
    const tck=Math.round(_statVar(baseTckSeason*statScale*seasons,sr,2,0.28));
    const sck=(_statVar(4.5*statScale*seasons,sr,3,0.35)).toFixed(1);
    const ints=Math.round(_statVar(2.5*statScale*seasons,sr,4,0.4));
    const tfl=Math.round(_statVar(10*statScale*seasons,sr,5,0.3));
    statsObj={tck,sck,ints,tfl,seasons};
    statsBlock=`${tck} tackles, ${sck} sacks, ${tfl} TFL, ${ints} INT${ints!==1?'s':''} over ${seasons} season${seasons!==1?'s':''}`;
  } else if(pos==='CB'){
    const basePDSeason={FBS:9,FCS:8,D2:7,D3:6,JUCO:7}[lvl]||6;
    const pd=Math.round(_statVar(basePDSeason*statScale*seasons,sr,2,0.32));
    const ints=Math.round(_statVar(3.5*statScale*seasons,sr,3,0.38));
    const tck=Math.round(_statVar(40*statScale*seasons,sr,4,0.28));
    statsObj={pd,ints,tck,seasons};
    statsBlock=`${pd} pass deflections, ${ints} INT${ints!==1?'s':''}, ${tck} tackles over ${seasons} season${seasons!==1?'s':''}`;
  } else if(pos==='S'){
    const tck=Math.round(_statVar(65*statScale*seasons,sr,2,0.28));
    const ints=Math.round(_statVar(3.0*statScale*seasons,sr,3,0.4));
    const pd=Math.round(_statVar(7*statScale*seasons,sr,4,0.32));
    statsObj={tck,ints,pd,seasons};
    statsBlock=`${tck} tackles, ${ints} INT${ints!==1?'s':''}, ${pd} pass deflections over ${seasons} season${seasons!==1?'s':''}`;
  } else if(pos==='K'){
    const fgAtt=Math.round(_statVar(18*statScale*seasons,sr,2,0.3));
    const fgPct=Math.round(_statVar(dev==='Elite Dev'?82:dev==='Star Dev'?76:70,sr,3,0.1));
    const long=Math.round(_statVar(dev==='Elite Dev'?52:dev==='Star Dev'?48:44,sr,4,0.12));
    statsObj={fgAtt,fgPct,long,seasons};
    statsBlock=`${fgAtt} FG attempts (${fgPct}%), long of ${long} yards over ${seasons} season${seasons!==1?'s':''}`;
  } else {
    statsObj={seasons};
    statsBlock=`started ${seasons} season${seasons!==1?'s':''} and was a key contributor`;
  }

  // ── Awards, position-specific, prestige-aware, realistically sparse ──
  // Only Elite Dev players at good schools regularly win awards; most players win nothing
  const _posAwards={
    QB:{elite:['Golden Helmet Trophy finalist','Field General Award winner','Field General Award finalist','Gunslinger Award winner','Gunslinger Award semifinalist','first-team All-American'],
        mid:['Conference Offensive Player of the Year','first-team All-Conference QB','second-team All-Conference QB','bowl game MVP']},
    RB:{elite:['Golden Helmet Trophy finalist','Feature Back Award winner','Feature Back Award finalist','first-team All-American RB','second-team All-American RB'],
        mid:['Conference Offensive Player of the Year','first-team All-Conference RB','second-team All-Conference RB','bowl game MVP']},
    WR:{elite:['Golden Hands Award winner','Golden Hands Award finalist','first-team All-American WR','second-team All-American WR','Senior Classic MVP'],
        mid:['first-team All-Conference WR','second-team All-Conference WR','Conference Offensive Player of the Year','bowl game MVP']},
    TE:{elite:['Tight End of the Year Award winner','Tight End of the Year Award finalist','first-team All-American TE','second-team All-American TE'],
        mid:['first-team All-Conference TE','second-team All-Conference TE','Conference Offensive Player of the Year']},
    OL:{elite:['Trench Trophy winner','Trench Trophy finalist','Center of the Year Award winner','first-team All-American OL','Lineman of the Year Award finalist'],
        mid:['first-team All-Conference OL','second-team All-Conference OL','Conference Offensive Lineman of the Year']},
    DL:{elite:['Trench Trophy finalist','Lineman of the Year Award winner','Lineman of the Year Award finalist','first-team All-American DL','Defender of the Year Trophy finalist'],
        mid:['first-team All-Conference DL','second-team All-Conference DL','Conference Defensive Lineman of the Year']},
    LB:{elite:['Linebacker of the Year Award winner','Linebacker of the Year Award finalist','Defender of the Year Trophy finalist','first-team All-American LB','Iron Wall Award finalist'],
        mid:['first-team All-Conference LB','second-team All-Conference LB','Conference Defensive Player of the Year']},
    CB:{elite:['Defensive Back of the Year Award winner','Defensive Back of the Year Award finalist','Iron Wall Award finalist','first-team All-American CB','Defender of the Year Trophy finalist'],
        mid:['first-team All-Conference CB','second-team All-Conference CB','Conference Defensive Player of the Year']},
    S: {elite:['Defensive Back of the Year Award finalist','Iron Wall Award finalist','first-team All-American S','second-team All-American S','Defender of the Year Trophy semifinalist'],
        mid:['first-team All-Conference S','second-team All-Conference S','Conference Defensive Player of the Year']},
    K: {elite:['Kicker of the Year Award winner','Kicker of the Year Award finalist','first-team All-American K'],
        mid:['first-team All-Conference K','Conference Special Teams Player of the Year']}
  };
  // Universal fallbacks
  const _AWARDS_GENERIC_MID=['team captain','bowl game MVP','Conference Freshman of the Year','Senior Classic invitee','Academic All-Conference'];
  const _AWARDS_FCS_POS=['FCS All-American','FCS All-American honorable mention','All-Conference first-team','conference Defensive/Offensive Player of the Year','FCS playoff standout'];
  const _AWARDS_D_POS=['conference champion','team captain','Academic All-Conference','conference MVP','team MVP'];

  const posKey2=['QB','RB','WR','TE','OL','DL','LB','CB','S','K'].includes(pos)?pos:'LB';
  const posAw=_posAwards[posKey2];

  let awardPool;
  if(lvl==='FBS'&&fbsTier==='elite'&&(dev==='Elite Dev'||dev==='Star Dev')){
    awardPool=[...posAw.elite,...posAw.mid,..._AWARDS_GENERIC_MID];
  } else if(lvl==='FBS'){
    awardPool=[...posAw.mid,..._AWARDS_GENERIC_MID];
  } else if(lvl==='FCS'){
    awardPool=[..._AWARDS_FCS_POS,..._AWARDS_GENERIC_MID];
  } else {
    awardPool=[..._AWARDS_D_POS,..._AWARDS_GENERIC_MID];
  }

  // Most players win nothing, awards are rare. Rates by dev:
  // Elite Dev at elite FBS: ~65% chance of 1 award, ~25% chance of 2
  // Elite Dev at mid FBS / FCS: ~40% chance of 1
  // Star Dev: ~20% chance of 1
  // Impact/Normal: ~7% chance of 1 (team captain, Academic, etc.)
  const awardRoll=sr(5);
  let numAwards=0;
  if(dev==='Elite Dev'){
    if(lvl==='FBS'&&fbsTier==='elite'){numAwards=awardRoll<0.25?2:awardRoll<0.65?1:0;}
    else if(lvl==='FBS'||lvl==='FCS'){numAwards=awardRoll<0.40?1:0;}
    else{numAwards=awardRoll<0.22?1:0;}
  } else if(dev==='Star Dev'){
    numAwards=awardRoll<0.20?1:0;
  } else if(dev==='Impact'){
    numAwards=awardRoll<0.09?1:0;
  } else {
    numAwards=awardRoll<0.06?1:0;
  }
  // If awarded, pick non-repeating entries from the pool
  const awards=[];
  for(let i=0;i<numAwards;i++){const a=awardPool[Math.floor(sr(5+i*0.4)*awardPool.length)];if(a&&!awards.includes(a))awards.push(a);}

  // ── Injury (more likely for skill positions, slightly reduces stats narrative) ──
  const injRisk=pos==='QB'?0.22:['RB','WR'].includes(pos)?0.32:0.28;
  const hadInjury=sr(8)<(dev==='Elite Dev'?injRisk*0.7:injRisk);
  const _INJURIES=[
    'missed most of his sophomore year with a torn ACL','battled a shoulder injury for two seasons',
    'sat out six games with a broken collarbone','missed his junior year with a stress fracture',
    'dealt with a recurring hamstring strain that limited his explosiveness',
    'underwent knee surgery after his freshman season and redshirted',
    'sat out four games with a high ankle sprain','battled through a wrist injury his senior year',
    'required offseason hip surgery between his junior and senior seasons'
  ];
  const injury=hadInjury?_INJURIES[Math.floor(sr(9)*_INJURIES.length)]:null;

  // ── Scandal ──
  const hadScandal=sr(10)<0.07;
  const _SCANDALS=['was suspended two games for a team conduct violation',
    'was briefly suspended after a social media incident that drew national attention',
    'sat out a bowl game following an academic eligibility issue',
    'was involved in a locker room dispute that briefly made headlines',
    'faced minor legal trouble that resulted in a one-game suspension',
    'was suspended for the first game of his senior year for a policy violation'];
  const scandal=hadScandal?_SCANDALS[Math.floor(sr(11)*_SCANDALS.length)]:null;

  // ── Dream school fulfilled note ──
  const dreamNote=(p.dreamSchool&&p.dreamSchool.school===school)?
    `${school} was always his dream school, and he proved he belonged.`:null;

  const _cf={school,lvl,statsBlock,statsObj,awards,injury,scandal,dreamNote,seasons,gamesPerSeason,fbsTier};
  p._cf=_cf;
  return _cf;
}

