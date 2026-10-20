// ═══════════ TUTORIAL ═══════════
const TUT_PAGES=[
  {tab:'Welcome',icon:'',title:'Welcome to Gridiron 27!',body:`
    <p>You are the head coach and general manager of a high school football program. Your mission: build a dynasty from the ground up, develop raw talent into college prospects, win a State Championship and, one day, the National Championship.</p>
    <p>Every season runs through three phases:</p>
    <ul>
      <li><strong style="color:var(--gd)">Regular Season</strong>: Play weekly games, manage injuries, protect your division standing, and fight for a playoff berth.</li>
      <li><strong style="color:var(--te)">Playoffs</strong>: Single-elimination bracket. Upsets happen. Win your region to reach the State Final.</li>
      <li><strong style="color:var(--gn)">Training</strong>: Train your returners, welcome incoming freshmen to JV, upgrade staff, and build your schedule for next year.</li>
    </ul>
    <p>Everything lives in <strong>five sections</strong>: <b>Home</b>, <b>Team</b>, <b>Season</b>, <b>League</b> and <b>Program</b> (big tabs at the top, or at the bottom on a phone). Pick a section and its pages show up in the row right next to it. The <strong>top info bar</strong> always shows your ratings, prestige, budget, week and phase.</p>
    <p><b>Not sure what to do next?</b> The big button on the Dashboard is always the next step: build your schedule, play this week's game, start the playoffs or begin the offseason.</p>
    <div class="tip">Tip: the game saves on this device automatically. Hit <strong>Save</strong> any time to save right away (and back it up to your account if you have one).</div>
  `},
  {tab:'Ratings',icon:'',title:'Player ratings and overall',body:`
    <p>Every player has <b>physical ratings</b> (speed, acceleration, agility, strength, jumping, stamina, awareness) and <b>position skills</b> (throw power, short and deep accuracy, throwing under pressure, carrying, elusiveness, break tackle, catching, catch in traffic, route running, pass and run blocking, power and finesse moves, block shedding, tackling, hit power, man and zone coverage, press, kick power and accuracy).</p>
    <p>Like the big football games, his <b>overall is a weighted blend of the ratings that matter for his position</b>: awareness counts a lot everywhere, accuracy and throw power make a quarterback, blocking makes a lineman, coverage makes a corner. The player card marks the ratings that count toward his overall, and the editor shows each one's share.</p>
    <p>Each rating does its own job in Game Day: deep accuracy on long throws, pressure throwing with a rusher in his face, route running to get open, catch in traffic on contested balls, pass block against power and finesse rushers, block shedding against the run, elusiveness for jukes and spins, break tackle for trucks and stiff arms, carrying against big hitters, man or zone coverage depending on the call, press at the line.</p>
    <p><b>Stamina</b> decides how fast a player tires during a game and how quickly he gets his legs back on the sideline, and well-conditioned players get hurt a little less. Train it with the <b>Conditioning</b> focus in the offseason; <b>Technique</b> works on each player's key position skills.</p>
    <p>When a player develops, the gain is spread over his skills; when you raise a skill yourself, his overall follows.</p>`},
  {tab:'Getting around',icon:'',title:'Getting Around: the Five Sections',body:`
    <ul>
      <li><b>Home</b>: Dashboard (your next step and this week's game), My Player (with a player career) and News.</li>
      <li><b>Team</b>: Roster, Depth Chart, JV Team, Training, Staff &amp; Playbook and Customize (uniforms, stadium).</li>
      <li><b>Season</b>: Schedule, Standings, Rankings and Playoffs.</li>
      <li><b>League</b>: Teams, Leaders and Recruiting.</li>
      <li><b>Program</b>: Assistant GM, Watchlist, Hall of Fame, History and Reclassify.</li>
    </ul>
    <p>A dot on <b>Home</b> means unread news; a dot on <b>Program</b> means new alumni stories.</p>
    <div class="tip">Tip: "Begin Offseason" always asks first if games are left. It never sims your season by surprise.</div>
  `},
  {tab:'Dashboard',icon:'',title:'Dashboard & News',body:`
    <p>The <strong>Dashboard</strong> is your command center. Start here every week.</p>
    <ul>
      <li><strong>Advance Week</strong>: Simulates the next game or moves the offseason forward one phase. Everything flows from this button.</li>
      <li><strong>Next Game Panel</strong>: Shows your upcoming opponent, their OVR, win probability, and rivalry status. Click the opponent name to scout their roster.</li>
      <li><strong>Team Stats</strong>: Your live offensive and defensive ratings, updated after every transaction.</li>
      <li><strong>Activity Log</strong>: Every game result, injury, milestone, and event appears here in chronological order.</li>
    </ul>
    <p>The <strong>News</strong> tab keeps a filterable feed of league-wide events: upsets, other classification results, player milestones, and more. Check it to track your rivals and spot trends.</p>
    <div class="tip"> Tip: During the offseason the Dashboard switches to show phase-by-phase controls. Each phase is a separate step, training, staff, recruiting, and schedule all happen in sequence.</div>
  `},
  {tab:'Roster',icon:'',title:'Roster: Your Varsity Players',body:`
    <p>The <strong>Roster</strong> tab is your varsity squad, Juniors, Seniors, and any underclassmen you have called up from JV.</p>
    <ul>
      <li><strong>OVR</strong>: The combined rating driving game performance. Raw freshmen start around 30–50 depending on your classification; elite seniors can reach 90+.</li>
      <li><strong>Year</strong>: Fr / So / Jr / Sr. Seniors graduate after each season. Plan for their departure.</li>
      <li><strong>Dev Trait</strong>: Determines how fast a player improves each offseason. Elite Dev is the fastest; Normal is the slowest. Traits can upgrade or downgrade based on performance.</li>
      <li><strong>INJ</strong>: Weeks remaining on an injury. Injured players are automatically skipped in games.</li>
      <li><strong>Click any player</strong> to open their full card: career stats, traits, archetype, interests, skill point upgrades, college offers, and more.</li>
    </ul>
    <div class="tip"> Tip: Sort by OVR to quickly find your weakest position groups, those are your upgrade priorities in the offseason.</div>
  `},
  {tab:'JV Team',icon:'',title:'JV Team: Your Development Pipeline',body:`
    <p>The <strong>JV Team</strong> is your feeder program, 8th graders, freshmen, and sophomores developing before they are ready for varsity. Think of it as your talent pipeline.</p>
    <ul>
      <li><strong>All incoming freshmen start on JV</strong> automatically. They arrive each offseason after seniors graduate.</li>
      <li><strong>Juniors auto-promote to varsity</strong>: when a JV player ages into Junior year, they move up automatically and you'll see a log entry announcing it.</li>
      <li><strong>Call Up Early</strong>: If a freshman or sophomore is good enough right now, use the  Call Up button to move them to your varsity roster immediately.</li>
      <li><strong>Send Down</strong>: You can also demote varsity freshmen or sophomores back to JV to let them develop with less pressure.</li>
      <li><strong> PROSPECT</strong> badges mark your top-rated JV players, these are the ones worth watching and potentially calling up early.</li>
    </ul>
    <p>There is no roster cap on JV, 8th graders are generated each offseason to keep the pipeline full. New 8th graders appear with wide OVR variance: most are raw, but a few standouts slip through every year.</p>
    <div class="tip"> Tip: Check JV at the start of each season for newly arrived 8th graders with Star or Impact dev traits, they are worth fast-tracking to varsity.</div>
  `},
  {tab:'Depth Chart',icon:'',title:'Depth Chart: Who Starts',body:`
    <p>The <strong>Depth Chart</strong> controls who takes the field at each position. The player at the top of each slot gets the snaps, earns the stats, and drives your team OVR.</p>
    <ul>
      <li>Players are auto-sorted by rating within each position group, but you can manually reorder to override.</li>
      <li>Injured players are automatically skipped; the next healthy player in the slot steps up.</li>
      <li><strong>Scheme fit matters</strong>: players whose archetype aligns with your offensive or defensive scheme get a performance multiplier in games.</li>
      <li>After a big offseason, lots of training gains or new call-ups from JV, always revisit the depth chart to make sure your best players are actually starting.</li>
    </ul>
    <div class="tip"> Tip: A sophomore with a 65 OVR who fits your scheme will often outperform a 68 OVR senior who doesn't. Check the archetype column.</div>
  `},
  {tab:'Program',icon:'',title:'Program: Morale, Chemistry, Captains',body:`
    <p>The <strong>Program</strong> panel sits at the top of the Depth Chart.</p>
    <ul>
      <li><strong>Team morale</strong> (0–100) rises with wins (rivalry and playoff wins most) and drops with losses. High morale adds a little to every rating on Game Day and in simulated games; low morale costs a little.</li>
      <li><strong>Quarterback chemistry</strong> with each starting receiver, tight end and running back grows with every game and practice they play together. Low chemistry makes his throws to that man looser and the catch a little harder.</li>
      <li><strong>Captains</strong>: name up to three from a player's profile. They lift morale after wins, soften losses, speed up chemistry when the quarterback is one, and get +3 awareness on Game Day.</li>
      <li><strong>Position battles</strong>: every week the last starter at a position and the best backup fight it out in practice when they're within 4 overall. The winner earns +1 overall.</li>
      <li><strong>Position coaches</strong> (Staff page): one per position group, levels 1–5. Each speeds up his group's growth in season and in offseason training.</li>
      <li><strong>Senior Night</strong>: before the winter offseason the graduating class is honored.</li>
      <li><strong>League rules</strong> (Settings, per career): 4, 8, 16 or 32 playoff teams; best records or division winners first; <strong>earned progression</strong> locks typing in ratings, so players earn them in practice, games, battles and with SP. A backup who wins a battle then takes the job.</li>
    </ul>
    <div class="tip"> Tip: Keep your quarterback and top receivers together: chemistry carries over from season to season and only fades a little.</div>
  `},
  {tab:'Careers',icon:'',title:'Careers: Job Offers, Player Creator, Levels',body:`
    <ul>
      <li><strong>Menu</strong>: the Dashboard lists every section (Team, Season, League, Program) with its pages. A gold dot marks a page that needs you (new news, a schedule to build, practice, skill points). Each page opens on its own; <strong>‹ Home</strong> takes you back. Settings → Menu layout switches back to the classic tabs.</li>
      <li><strong>Job offers</strong>: after a good season other schools in your league call about their head coaching job. The offers sit on the Dashboard until your first game of the new season. A rebuild job comes with a bigger budget.</li>
      <li><strong>Division names</strong>: in a real-states world your home state uses its own class names (Texas 2A to 6A, Ohio Division VII to I, Class S to LL in Connecticut...).</li>
      <li><strong>Player Career</strong>: pick a school on the map, then build your player: name, position, archetype, height and weight, up to 3 interests and 2 character traits, his look and his gear. Attribute points build a freshman between 40 and 55 overall. In Player Career mode the school already has a head coach, so you don't create one.</li>
      <li><strong>Levels and skill points</strong>: every game earns your player XP (more for big games, wins and the playoffs). Each level gives 3 skill points to spend on any attribute on the My Player page. Ratings under 60 cost 1 point, then 2, 3, 4 and 5 above 90.</li>
      <li><strong>Catch meter</strong>: in Player Career only your own player gets one.</li>
      <li><strong>Transfers</strong>: meet a scouted player any time. During the season a yes means he joins you next season (seniors can't, they graduate). Your own players may want to transfer out, depending on what they care about, their traits and morale; never more than 15% of your roster in a year. Talk to them from the Players leaving tile; they leave when offseason training ends.</li>
    </ul>
    <div class="tip"> Tip: Spend skill points on the attributes marked ● first: those count toward your overall at your position.</div>
  `},
  {tab:'College career',icon:'',title:'College Career: Play Your Player in College',body:`
    <ul>
      <li><strong>After high school</strong>: in Player Career mode your player goes to the college he signed with (no offer: he walks on at a small college or junior college). The dashboard becomes his college dashboard; the high school world keeps going in the background.</li>
      <li><strong>College rating</strong>: he starts 15 to 30 overall lower than in high school. The best high school players and big stat lines lose the least. Every college roster is filled with the high school players it signed, rated the same way.</li>
      <li><strong>The season</strong>: real conferences (four power conferences at FBS), 12 games with conference games at the end, conference title games, the 12-team playoff (the five best-ranked champions get in, the top four get a bye) and bowls for six-win teams. FCS, Division II, Division III, NAIA and junior colleges play their own playoffs.</li>
      <li><strong>Every week</strong>: play the game on Game Day (you control only your player) or simulate it. Starters play every snap of their unit, backups get the series the coach gives them. Weekly goals and good games raise coach trust and move you up the depth chart.</li>
      <li><strong>Redshirt</strong>: play 4 games or fewer and the season does not count against your 4 seasons of eligibility (once, within 5 years).</li>
      <li><strong>NIL</strong>: money every year from your rating, position, school, stats and awards, plus a brand deal each spring (cash, skill points or XP).</li>
      <li><strong>Transfer portal</strong>: every January. Schools that want you show your role and their NIL offer; transfers play right away.</li>
      <li><strong>Draft</strong>: three years after high school (or when your eligibility runs out) you can declare. Combine, then 7 rounds; or undrafted free agency, a spring league, or no pro team. The pro career goes on year by year.</li>
      <li><strong>Colleges</strong>: every college has a mascot, colors and a logo. Edit any of them (name, mascot, colors, logo icon, uploaded logo, state, prestige, conference) from its profile or in League Setup.</li>
    </ul>
  `},
  {tab:'New this update',icon:'',title:'A new look, new team logos and fewer crashes',body:`
    <ul>
      <li><strong>New look</strong>: every screen uses one Friday night style, with your team's colors on buttons, tabs and the club bar. Light mode got the same treatment.</li>
      <li><strong>Game Day menus</strong>: the matchup preview, pause menu and play calling match the new style.</li>
      <li><strong>Team logos</strong>: every school and college has a new patch logo in its colors, with the mascot or a monogram inside. They stay clear at small sizes.</li>
      <li><strong>Title screen</strong>: a short intro plays once per visit. It is skipped if your device asks for reduced motion.</li>
      <li><strong>Fewer crashes on PC</strong>: replays use much less memory, and if Game Day runs into repeated errors it now finishes the game by simulation instead of freezing.</li>
      <li><strong>Earlier this beta</strong>: combined state packs, mixed conferences, defensive adjustments (keys V, Y and N), the Huddle feed, new celebrations and hairstyles.</li>
    </ul>
  `},
  {tab:'Offseason',icon:'',title:'Offseason: Training & Development',body:`
    <p>The <strong>Training</strong> tab is where your roster actually gets better. It unlocks after the final playoff game each season.</p>
    <ul>
      <li><strong>Skill Points (SP)</strong>: Every player earns SP each offseason phase based on their Dev Trait, performance, training level, and staff quality. SP permanently raises OVR.</li>
      <li><strong>Dev Trait checks</strong>: At season end, players with great performance can upgrade their Dev Trait (e.g. Normal → Impact). Poor seasons can downgrade it.</li>
      <li><strong>Training Level</strong>: Upgrade your program's overall training infrastructure to increase SP gains for everyone on your roster. Higher levels unlock more of each player's potential ceiling.</li>
      <li><strong>Camps</strong>: Players earn camp invites with good games, stars, the right size for their position and steady play (bigger classifications and program prestige help). Several colleges watch each camp: a strong showing can earn offers and raise stars. Each player can attend one camp per year for every star of program prestige.</li>
      <li><strong>Potential Range</strong>: Every player has a floor and ceiling. Training level determines how much of that ceiling is reachable.</li>
    </ul>
    <div class="tip"> Tip: Invest in Training Level early. It compounds: every player on your roster benefits from it every single offseason.</div>
  `},
  {tab:'Staff',icon:'',title:'Staff & Playbook',body:`
    <p>The <strong>Staff</strong> tab is where you hire coaches and lock in your schemes. Both decisions have direct on-field consequences.</p>
    <ul>
      <li><strong>Offensive Scheme</strong>: Choose from Pro Style, Spread, Air Raid, Wing-T, Option, or I-Formation. Each scheme amplifies specific player archetypes.</li>
      <li><strong>Defensive Scheme</strong>: 4-3, 3-4, 46, Cover 2, or Flex. Match it to your best defensive players' archetypes.</li>
      <li><strong>Assistant Head Coach</strong>: Higher level improves overall SP gains for the whole roster each offseason.</li>
      <li><strong>Offensive / Defensive Coordinators</strong>: Boost performance for their respective unit during games.</li>
      <li><strong>Recruiting Coordinator (RC)</strong>: Higher RC level increases the odds of getting Elite Dev and Star dev players in your incoming freshmen class.</li>
    </ul>
    <p>The <strong>Customize</strong> tab lets you edit your school name, mascot, colors, and upload a custom logo, purely cosmetic but great for immersion.</p>
    <div class="tip"> Tip: Don't change your scheme mid-season unless you have to. Players who fit your scheme are already performing well, switching disrupts that.</div>
  `},
  {tab:'Schedule',icon:'',title:'Schedule, Standings & Playoffs',body:`
    <p>The <strong>Season</strong> group covers everything from Week 1 to the State Final.</p>
    <ul>
      <li><strong>Schedule</strong>: Built at the start of each season in two steps: first pick your rivalry game (Week 5), then fill custom slots with opponents from any classification, from the neighbor states of Wakota and Tierra Alta, or from the international academies. Strength of Schedule (SOS) directly affects playoff seeding.</li>
      <li><strong>Standings</strong>: Division win-loss records updated in real time. Top teams advance to the playoffs. Your team is highlighted, watch your position relative to division rivals.</li>
      <li><strong>Playoffs</strong>: Single-elimination bracket seeded by record and SOS. Survive enough rounds and you reach the State Championship. Upsets are possible: every game matters.</li>
      <li><strong>National Championship</strong>: After the state playoffs, the top two teams in the final national poll meet at a neutral site. State champions get a lift in that final poll. If your team is one of the two, the dashboard shows a <strong>National Championship</strong> button and you play it like any other game.</li>
    </ul>
    <p>You can simulate games one at a time from the Dashboard, or use <strong>Sim All</strong> to fast-forward through all remaining regular season games at once.</p>
    <div class="tip"> Tip: Schedule at least one tough out-of-classification or out-of-state opponent early. It tanks your win probability but boosts your SOS, which pays off in playoff seeding if you win your division.</div>
  `},
  {tab:'League',icon:'',title:'League, Leaders & Recruiting',body:`
    <p><strong>Rankings</strong> (Rankings tab): each of the 13 states has an <strong>All-State Top 25</strong> and the <strong>National Top 25</strong> ranks every team in the country on one scale. Rankings blend team rating, record (weighted more as the season goes on), strength of schedule, unbeaten teams and program prestige, and update after every week. Ranked teams show a badge next to their name: <span class="rkb rk-n">#2</span> in <strong>blue</strong> is the national rank and <span class="rkb rk-a">#3</span> in <strong>gold</strong> the rank in the team&#39;s own state. The national rank shows first; <strong>tap a badge</strong> to switch.</p>
    <p>The <strong>League</strong> group gives you visibility into the broader football world beyond your own program.</p>
    <ul>
      <li><strong>Teams</strong>: Browse every school in your classification (and other classifications). See OVR, record, schemes, prestige, and division. Click any team to scout their full roster.</li>
      <li><strong>Leaders</strong>: Season-wide statistical leaderboards across all teams: rushing yards, passing TDs, receiving yards, tackles, sacks, interceptions, and more. See where your players rank.</li>
      <li><strong>Recruiting</strong>: Tracks college scholarship offers your players have earned. Higher-rated seniors and players with Academic traits attract FBS, FCS, D2, D3, NAIA offers and JUCO interest. Small colleges recruit mostly on production and character traits. Prestige matters: elite programs attract better scouts.</li>
    </ul>
    <div class="tip"> Tip: Check the Leaders board mid-season to spot your breakout players, if someone is top-5 in their stat category, they are likely earning college offers and dev trait upgrades.</div>
  `},
  {tab:'History',icon:'',title:'Watchlist, Hall of Fame, History & Reclassify',body:`
    <p>The <strong>Program</strong> group tracks your dynasty's legacy and long-term health.</p>
    <ul>
      <li><strong>Watchlist</strong>: Flag any player for personal tracking. Useful for monitoring injury returns, breakout candidates, or JV call-up targets. Flagged players show a  icon on the roster.</li>
      <li><strong>Hall of Fame</strong>: Players who reached elite status and graduated are enshrined here with their career stats. Every legend your program produces lives on in this tab.</li>
      <li><strong>History & Records</strong>: Season-by-season records, championship trophies, and all-time school records for every statistical category. Records are broken in real time during seasons.</li>
      <li><strong>Reclassify</strong>: If your program underperforms consistently, reclassification pressure builds. Hit 100% and you get demoted to a lower classification. You can also voluntarily move up if you've won a title and have the budget. Higher classifications mean tougher competition but bigger prestige rewards.</li>
    </ul>
    <div class="tip"> Tip: Prestige compounds over time. Every championship, Hall of Famer, and dominant season raises your school's prestige, which in turn brings better incoming freshmen classes year after year.</div>
  `},
  {tab:'Advisor & Alumni',icon:'',title:'Assistant GM and Alumni Career Tracker',body:`
    <p>Gridiron 27 has a built-in AI. It runs entirely inside your browser: <strong>no API key, no internet and no account</strong>. It is a rules-and-simulation engine, not an online chatbot, and it can only see your own save.</p>
    <p><strong>Assistant GM</strong> (Program group, top nav bar)</p>
    <ul>
      <li><strong>What I recommend</strong>: A ranked to-do list built from your live roster, schedule and budget: open schedule slots, holes in your starting lineup, injured starters, unspent skill points, your next opponent, the best use of your budget, and Hall of Fame candidates.</li>
      <li><strong>Ask the advisor</strong>: Tap a topic or type a question (for example "who is injured", "how do I beat my next opponent", "where should I spend money"). It answers from your current data.</li>
      <li>The win chance it shows is a rough estimate from team ratings. It is not the game's exact odds.</li>
    </ul>
    <p><strong>Alumni career tracker</strong></p>
    <ul>
      <li>Enshrine a player in the <strong>Hall of Fame</strong>. After he graduates, the AI writes one update <strong>every season</strong>: signing and NIL deals, redshirts (including medical redshirts), full season stat lines, team records, bowl games and the National Playoff, conference and national awards, injuries with games missed, transfer-portal moves, all-star games, NGL Combine results, the NGL Draft (round and pick) or undrafted and SFL/MGL paths, pro seasons with playoff runs, Pro All-Stars and All-League teams, contracts, extensions, franchise tags and trades, retirement, life afterwards, and even the College Football and Pro Football Halls of Fame.</li>
      <li>Open the player's profile (story tab) or the Hall of Fame page to read the full timeline. A badge on the Advisor button shows unread updates, and big moments also appear in the News tab.</li>
      <li>Careers use real-world base rates: only about 1 to 2 percent of draft-eligible college players are drafted, almost all from big FBS programs, and the average NGL career is only a few years (running backs shortest, quarterbacks and kickers longest). Real colleges, NGL, SFL and MGL teams and college award names are used, but the players and their stats are fictional.</li>
      <li>Players you do not enshrine keep the older one-time story. Alumni results are generated from each player's ratings and development, so great players usually, but not always, thrive.</li>
    </ul>
    <div class="tip">Tip: Enshrine seniors with Star or Elite development and high ratings. Ask the advisor about "Hall of Fame picks" to see their projected draft odds first.</div>
  `},
  {tab:'States & National',icon:'',title:'Your States and the National Title',body:`
    <p><strong>Real USA (new careers):</strong> on the setup screen, <b>Choose states</b> lets you play in any of the <strong>50 real states</strong>, from just your home state to all fifty. The map uses each state's real counties and towns, and every high school is fictional, named after the real town it sits in. Every state has its <strong>real number of high schools</strong> (about 15,100 for the whole country), and each state names its classes its own way (1A to 6A, Division I to V, Class C to AA and so on).</p>
    <p><strong>Full detail and light states:</strong> up to <b>5 states</b> are played in full detail, with every player on every team (your home state always is). Every other state is a <b>light state</b>: its schools play every game with their own strength, keep records and game logs, and crown a champion in a state playoff. The game follows each light state's top prospects as real players, so stars, offers, camps and commitments work everywhere. A school's profile shows whether it is light. You can take jobs only in detailed states, and the detailed states together hold up to 1,500 schools so the game stays fast on phones.</p>
    <p>The number of colleges, the national star counts and the recruiting quotas grow with the part of the country you pick. With all 50 states you get the full national numbers (about 32 five-stars, 280 four-stars and 1,150 three-stars a class) and roughly 840 colleges; a smaller world gets its share, never more. College and pro team names are invented from real places, never a real school's or team's name. Your home state offers you nine jobs; every other detailed state offers a few.</p>
    <p><strong>Classic country:</strong> you can still pick the original fictional country in the same window. Older saves keep the world they started with.</p>
    <p>In the classic country there are <strong>13 states</strong>, and every one is fully simulated: real rosters, divisions, schedules, stats, recruiting, rankings and state champions. You can <strong>start your career in any of them</strong>. The career map shows the whole country (scroll or drag it, then tap a state to zoom in on its counties); Crestfield offers you nine jobs and every other state five.</p>
    <ul>
      <li><strong>Crestfield</strong> (the heartland, 1A to 5A): the home state and the biggest league.</li>
      <li><strong>Llano Grande</strong> (Class 1A to 6A): ranch and oil country from the Gulf to the Río Grande. The biggest state after Crestfield, and its 6A schools are the strongest anywhere.</li>
      <li><strong>Coralina</strong> (Class 1A to 4A): the sunshine peninsula. Speed everywhere.</li>
      <li><strong>Magnolia</strong> (Class A to AAAA): Deep South football in red-clay and pine-woods towns.</li>
      <li><strong>Acadia</strong> (Class 1A to 3A): bayou parishes, Cajun towns and the delta.</li>
      <li><strong>Cumberland</strong> (Class A to AAA): Appalachian hollows, river cities and the Atlantic shore.</li>
      <li><strong>Wakota</strong> (Class C, B, A): Midwest farm country on the northern border.</li>
      <li><strong>Tierra Alta</strong> (Division IV to I): desert and mountain towns on the Mexican border.</li>
      <li><strong>Summit</strong> (Class 1A to 3A): the high Rockies and mining towns.</li>
      <li><strong>Granite</strong> (Class C, B, A): high plains and ranch land with tiny schools.</li>
      <li><strong>Cascadia</strong> (Class 1A to 4A): the rainy Pacific Northwest.</li>
      <li><strong>Aurora</strong> (Division III to I): the far north, only 24 schools.</li>
      <li><strong>Kaimana</strong> (Division II, I and Open): the islands, 28 schools with some of the toughest linemen around.</li>
    </ul>
    <p>Each state has its own mascots, its own lettering style on school logos and its own flavor in names and playbooks. AI teams and you can schedule teams from any state on open dates.</p>
    <p><strong>National view:</strong> Standings, League, Leaders and Rankings all have a <strong>State</strong> row with every state plus <strong>National</strong>, which shows every school and player in the country (the Leaders page becomes the national statistics board).</p>
    <p><strong>National Championship:</strong> after the state playoffs, the top two teams in the final national poll meet at a neutral site that rotates around the country. Winning it is worth $100,000 and a big prestige boost; just reaching it pays $25,000. Every title game is recorded under History → League History.</p>
    <p><strong>Colleges:</strong> all colleges belong to the game's own country (from the big state flagships down to junior colleges), with the same number of programs at every level as in real life: FBS, FCS, D2, D3, NAIA and JUCO.</p>
  `},
  {tab:'Gameplay',icon:'',title:'Gameplay Tutorial on the Practice Field',body:`
    <p>Before the first game of every new career you are offered an <strong>interactive gameplay tutorial</strong> on your own practice field with your own players. A coach card walks you through each control and waits until you have done it:</p>
    <ul>
      <li><strong>Calling a play</strong> and snapping the ball</li>
      <li><strong>Passing</strong>: press and pull back like a slingshot, release to throw; a quick tap switches between a bullet and a lob, the QB run button scrambles</li>
      <li><strong>Catch meters</strong>: tap while the marker is in the green</li>
      <li><strong>Running</strong>: swipe up or down to juke, forward to dive, back to slow down, plus the Spin, Stiff arm, Truck and Hurdle buttons</li>
      <li><strong>Defense</strong>: pick your defender, drag to move, tap Tackle</li>
      <li><strong>Kicking</strong>: stop the power and accuracy meters in the green</li>
    </ul>
    <p>Nothing counts on your record, every player who takes a rep earns 2 XP, and your weekly practice stays available.</p>
    <div style="margin-top:10px"><button class="btn bgn" onclick="closeTutorial();tutPracStart()">Start the gameplay tutorial</button></div>
  `},
  {tab:'Online',icon:'',title:'Online Play: Head to Head with a Code',body:`
    <p><strong>Online Play</strong> on the main menu lets you play a full Game Day match against a friend on another device.</p>
    <ul>
      <li><strong>Pick your team:</strong> any Free Practice team (with its roster, playbooks and uniforms), or the varsity squad from one of your career saves exactly as it is in that save. Importing never changes the save.</li>
      <li><strong>Host or join:</strong> the host taps <strong>Create match</strong> and sends the 6-character code; the friend enters it under <strong>Join a match</strong>. The host is the home team and kicks off when both teams are in. If both teams wear similar jerseys, the away team switches to its most contrasting uniform.</li>
      <li><strong>Both coaches call their own plays.</strong> Offense calls a play and snaps, defense calls a coverage and picks its defender, kickers stop their own meter, the receiving team calls fair catches. The away team calls the coin toss; penalties, onside kicks and two-point tries are decided by the team they belong to.</li>
      <li><strong>Fair play clock:</strong> a play that is not called within 35 seconds is called by the coordinator, and a question nobody answers within 30 seconds takes its first choice, so nobody can stall the game.</li>
      <li><strong>Connection:</strong> the two devices connect directly when they can (smoothest), otherwise through the server relay. If one player loses the connection or reloads, the game pauses; rejoin with the same code to continue. The host's device runs the game, so the host should keep the game in front.</li>
    </ul>
    <p><strong>Accounts, friends and records:</strong> create an account (username, email and password) on the <strong>Account</strong> tab, then add friends by username. Every game between two signed-in players is saved once the guest's device confirms the final score. <strong>Stats &amp; records</strong> shows your online record, points for and against, streaks, standings between you and your friends, your head-to-head record against each friend, single-game records (biggest win, most points, team yards, and passing, rushing, receiving and touchdown highs by one player) and your recent games.</p>
    <div class="tip">Tip: online play needs the site owner to connect a free Supabase project once (see ONLINE_SETUP.md). Without one, test mode lets you try it between two browser tabs on the same device.</div>
  `},
  {tab:'Game Day modes',icon:'',title:'Game Day: Modes, Settings and Sound',body:`
    <p>Before every game pick how you want to play:</p>
    <ul><li><b>Full game</b>: you play every snap.</li><li><b>Coach mode</b>: you call every play on offense and defense, your team runs them.</li>
      <li><b>Offense only</b> / <b>Defense only</b>: the other side's drives are simulated.</li></ul>
    <p>The <b>pause menu</b> (top left) can switch coach mode and the game mode at any time, <b>sim to the end of the quarter</b>, sim the rest of the game, and open <b>Settings</b>: sound effects and volume, crowd noise, gameplay tips (hidden by default), ball size, which way your offense drives (right, left, or switching each quarter like a real game) and vibration.</p>
    <p>In close games late, on fourth down and in overtime you feel the pressure: a heartbeat, a red edge on the screen and a louder crowd. Clutch and big-game players stay calm; others get smaller catch windows and faster kick meters.</p>
    <p>Celebrate: 14 touchdown celebrations to pick from, plus sack and first-down celebrations. Big hits can knock a helmet off (that player sits a play). The <b>stiff arm</b> now shoves defenders away and can put them on the ground.</p>
    <p>On defense, <b>tap any of your players</b> during the play to take control of him.</p>
    <p><b>Kick returns</b> can be skipped (Settings → Kick returns: Skip): the kickoff resolves straight away and your drive starts. The <b>scorebug</b> comes in a TV look or the classic one.</p>
    <p><b>Difficulty sliders</b> (Settings → Sliders, or Pause → Settings → Difficulty sliders): speed, acceleration, strength, awareness, throwing accuracy, ball speed, catching, interceptions, man and zone coverage, fumbles and juking, separately for you and the CPU, plus the game speed. Presets: Easy, Normal, Hard and Legend.</p>
    <p><b>Slow phone?</b> Settings → Graphics: Fast lowers the resolution and turns off the title screen highlights; Fans in the stands: Light or Off draws fewer fans.</p>
  `},
  {tab:'PC controls',icon:'',title:'Playing on a Computer',body:`
    <p>Every action has a key (the guide also opens the first time you play on a computer, and lives under Pause → Settings and controls).</p>
    <ul>
      <li><b>Snap</b>: Enter or Space · <b>Timeout</b>: T · <b>Pause</b>: P or Esc</li>
      <li><b>Pass</b>: 1–5 throw to that receiver (the numbers float over them), Space switches bullet / lob, C to run with the QB, or pull back with the mouse like a slingshot</li>
      <li><b>Ball carrier</b>: W/S or ↑/↓ juke, D or → dive, A or ← slow down, E spin, Q stiff arm, R truck, H hurdle</li>
      <li><b>Defense</b>: WASD or arrows move, J tackle, Tab switch, click a player to control him, K or Space when the ball meter is up</li>
      <li><b>Kicks and catches</b>: Space or click to stop the meters · F fair catch · 1–9 pick a celebration</li>
    </ul>
    <p><b>Change any key</b>: Pause → Settings → Change keys. Click an action, press the new key.</p>
    <p><b>Controllers</b> (Xbox, PlayStation and most others) work too. Left stick moves your player, flick it up or down to juke. Passing: A, B, X, Y and RB throw to receivers 1–5, LT tucks and runs. Ball carrier: X spin, B stiff arm, Y hurdle, RB truck, RT dive, LB juke. Defense: A tackle, LT switch player. Start pauses; in menus the d-pad moves, A selects, B goes back, and LB/RB switch sections.</p>
  `},
  {tab:'Stats & careers',icon:'',title:'Stats, Game Logs and Careers',body:`
    <p>Every player card has a <b>Game Log</b> (each game this season) and a <b>Career</b> tab (season by season, career totals, awards and college).</p>
    <p>New stats: tackles for loss, yards after the catch, punt returns and safeties, in Game Day and in simulated games.</p>
    <p><b>Play-call splits</b>: after each Game Day game the box score shows every call you ran, its average gain, touchdowns and first downs, and what each of your coverages gave up. Season totals are on Staff &amp; Playbook.</p>
    <p><b>Game XP</b>: players earn XP for what they do in games (big games earn more, playoff games a bonus). Every 10 XP becomes a skill point.</p>
    <p><b>Hot and cold streaks</b> need three straight games, count in the playoffs, show up in Game Day, and a player can heat up again later in the season.</p>
  `},
  {tab:'Own player',icon:'',title:'Your own player in a coach career',body:`
    <p>On the setup screen tick <b>Create my own player</b>, pick his name, position and number. He joins your team as a freshman with star potential.</p>
    <p>Follow him on <b>Home → My Player</b>: his ratings, this season's game log, offers and commitment, and his high school career. After he graduates his college and pro career plays out year by year.</p>
  `},
  {tab:'Meetings',icon:'',title:'JV Talks, Transfer Meetings and Practice',body:`
    <p><b>JV talks</b>: tap <b>Talk</b> next to a JV player to convince him to move up. Every player cares most about one thing (playing time, college exposure, winning, coaching or his teammates); his traits hint at it. The right pitch works much better. Calling a player up without talking to him can hurt his morale if he would sit on the bench.</p>
    <p><b>Transfer meetings</b>: open another school's player and tap <b>Set up a meeting</b>. Four meetings per season, $1,500 each. Prestige, your record, playing time and the right pitch decide it.</p>
    <p><b>Practice</b>: the JV plays the scout team against your starters and earns practice XP too.</p>
    <p><b>Playbooks</b>: every standard playbook has new plays (shallow cross, bench, double post, play action from the I and split backs, stretch, wham, power read, speed option and more) and four new defenses (Cover 3 Buzz, Cover 1 Spy, Cover 2 Invert, Sim Pressure).</p>
  `},
  {tab:'States & conferences',icon:'',title:'Choose your states and build your own conferences',body:`
    <ol style="padding-left:20px">
      <li><b>Pick the states.</b> Tap <b>Start New Game</b>, then <b>Choose states</b> under Your World. Tap states on the map or tick them in the list, or use a preset (Every state, The South, Only my home state and more). Set your <b>Home state</b>: it is gold on the map. Dark blue states get full detail (every school has a full roster); the others still play every game, playoff and top prospect. Tap <b>Use these states</b>.</li>
      <li><b>Open the Team Builder.</b> Tap <b>Teams</b> on the setup screen. Choose a <b>State</b>, then a classification. Every division in it is listed with its schools.</li>
      <li><b>Make real teams.</b> Tap the pencil on a school to change its name, mascot, city, abbreviation, colors, prestige and logo (upload your own picture). Tap <b>Save changes</b>.</li>
      <li><b>Build a conference that mixes classifications.</b> On the division you want, tap <b>Bring in a school</b>, search any school in that state and tap <b>Bring here</b>. It plays its league games in that division from now on. You can also use <b>Move to Division</b> while editing a school.</li>
      <li><b>Add or remove schools.</b> <b>Add a new team</b> creates a school in that division; the x removes one.</li>
      <li><b>Name and size the divisions.</b> Tap <b>League Setup</b>, open <b>Divisions &amp; sizes</b>, pick the state, set teams and divisions per classification and type the division names, one per line. Tap <b>Save League Setup</b>.</li>
      <li><b>Combine packs from different states.</b> Pick every state you need first (step 1). Then in the Team Builder open <b>Export / Import</b> and tap <b>Load team pack</b> for each file: a Michigan pack goes into Michigan and an Indiana pack into Indiana, so both stay. <b>Export all schools</b> saves your own work as a file to share.</li>
    </ol>
    <div class="tip">Everything you change is saved on this device right away and used for your next career. If you change your states later, your edits for a state you removed are kept and come back when you add it again. <b>Discard my changes</b> in the Team Builder starts over.</div>
  `},
  {tab:'League Setup',icon:'',title:'League Setup and Customizing',body:`
    <p>On the setup screen, <b>League Setup</b> lets you rename every state and county, edit or add colleges at every level, change the pro teams, rename and resize divisions, and set how many players get each star rating and how big recruiting classes are. New careers use your setup; each save keeps the world it started with.</p>
    <p>In <b>Edit Player</b> choose a helmet finish (gloss, matte, chrome), take the stripe off or pick a facemask color. In the uniform designer add <b>shoulder stripes</b> (single, double or triple). Jersey number 0 works everywhere.</p>
    <p><b>Edit Player</b> also changes height, weight, class and the player's <b>face</b>: skin tone, hairstyle, hair and eye color, facial hair. Changing a position no longer changes a player's size.</p>
    <p><b>Edit many players at once</b> (Team → Roster): add points to, set or raise the overall, potential, speed, strength or awareness of the whole team, the offense, the defense, one position or the JV.</p>
  `},
  {tab:'Player Career',icon:'',title:'Player Career: be one player',body:`
    <p>Pick <b>Player Career</b> on the title screen (or tick <b>Player Career mode</b> under <b>Create my own player</b>). You create one freshman and choose his high school on the map.</p>
    <ul>
      <li><b>In Game Day you control only your player.</b> The coach calls every play on both sides of the ball and the ball is snapped for you (a quarterback snaps it himself). Your player wears a ring under his feet and the camera is zoomed in on him.</li>
      <li><b>Drives without you are simulated.</b> An offensive player sits while the defense is out there, and the other way round.</li>
      <li><b>Playing time</b>: starters play every drive of their side. A backup rotates in for a share of the series, and that share grows with coach trust, so a trusted backup plays most drives. The Dashboard shows your spot on the depth chart.</li>
      <li><b>Coach trust</b> (0 to 100) goes up with good games and wins and down with turnovers, drops and losses. Trust also moves you up the depth chart.</li>
      <li><b>Call for the ball</b> (B key, Y / Triangle or the button) makes your quarterback look your way, and a running back gets a run called for him. Do not ask on every play: the coach notices.</li>
      <li><b>Transfer</b> from the Dashboard in the offseason, before the first game: you join a school in your league and start over with neutral trust.</li>
      <li>After your senior year, follow his college and pro career on <b>My Player</b>.</li>
    </ul>`},
  {tab:'Money & trophies',icon:'',title:'Ticket Sales and the Trophy Case',body:`
    <p><strong>7-on-7 Summer League:</strong> after the state championship you can enter your program's passing league team (entry $5,000). Pick 7 players for offense (one quarterback) and 7 for defense. It is played without helmets or pads, two-hand touch, passes only, with a four-second pass clock, and every drive starts at your own 40. The quarterfinal and semifinal are single games; the league title is a best-of-five series. Play each game yourself or simulate it. College coaches come to watch, so your standouts can pick up offers, and the champion wins $10,000 and a trophy.</p>
    <p><strong>Program income:</strong> besides ticket sales, boosters give after every game (more after wins and in rivalries), home games sell team gear, playoff and rivalry games bring broadcast money, and each senior who signs with a college earns a placement bonus: up to $25,000 for an FBS signee plus up to $25,000 more for a five-star. Once a season you can sign a local sponsor and hold a fundraiser, and in the offseason you can host a youth summer camp (Program &gt; Facilities &gt; Program income).</p>
    <p><b>Ticket sales</b> (Team → Staff): every home game earns money from tickets and concessions. Winning, prestige, rivalry games and playoff games bring bigger crowds; a bigger stadium holds more fans. Pick the price: low prices fill the stands, high prices earn more per fan but keep some away. Playoff games pay a share of the gate.</p>
    <p>Your <b>Assistant Head Coach</b> is a staff member: you are the head coach.</p>
    <p>The <b>Trophy Case</b> (Program) shows your national, state and division titles, your players' awards and your program's records.</p>
  `},
  {tab:'Free Practice teams',icon:'',title:'Team Builder and Community Teams',body:`
    <p>In <b>Free Practice → Teams</b> build as many teams as you want: name, colors, uniforms, playbooks and overall. Click any player on the roster to edit his name, number, position, ratings, height, weight and face.</p>
    <p><b>Share code</b> turns a team into one line of text a friend can paste under <b>Import a code</b>.</p>
    <p><b>Community teams</b> (needs an Online Play account): publish your team for everyone, browse the newest or most downloaded teams and download them with one tap. Report or block anything offensive.</p>
  `},
  {tab:'Online & privacy',icon:'',title:'Online Play: Friends, Saves and Privacy',body:`
    <p>From the <b>Friends</b> tab you can <b>send a career save</b> to a friend; theirs show up under Account → Saves from friends, ready to add to Load Game.</p>
    <p>You can <b>block</b> or <b>report</b> any player. Account → <b>Delete my account</b> removes your account and everything stored with it; the privacy policy and terms of use are on the same page.</p>
  `},
  {tab:'Tips',icon:'',title:'Key Tips & Strategies',body:`
    <p>Everything you need to build a dynasty, condensed:</p>
    <ul>
      <li> <strong>Check JV every offseason.</strong> That's where your next stars are hiding. Call up Elite Dev prospects early, they have years to develop on varsity.</li>
      <li> <strong>Upgrade Training Level first.</strong> It benefits every player on your roster, every season. It compounds faster than any single hire.</li>
      <li> <strong>Hire the Recruiting Coordinator early.</strong> A high RC level dramatically improves the quality of your incoming freshman classes.</li>
      <li> <strong>Build a smart schedule.</strong> Mix cupcakes (easy wins) with 1–2 tough opponents to spike your SOS for playoff seeding purposes.</li>
      <li> <strong>Pick your rivalry game deliberately.</strong> Rivalry wins boost prestige and recruiting more than any other regular season game.</li>
      <li> <strong>Save often.</strong> Download the .json file after every session. One browser refresh can erase an entire season.</li>
      <li> <strong>Scheme fit is real.</strong> A player whose archetype matches your scheme performs noticeably better in games. Check it before the season starts.</li>
      <li> <strong>Watch your reclassification pressure.</strong> A couple of bad seasons can start a countdown toward demotion. Win your division to reset it.</li>
    </ul>
    <div class="tip"> You can reopen this tutorial anytime using the <strong> Help</strong> button on the far right of the nav bar.</div>
  `},
];

let _tutIdx=0;
function showTutorial(){
  _tutIdx=0;
  buildTutTabs();
  renderTutPane(_tutIdx);
  document.getElementById('tut-overlay').classList.add('open');
}
function closeTutorial(){document.getElementById('tut-overlay').classList.remove('open');}
function buildTutTabs(){
  const bar=document.getElementById('tut-tab-bar');
  bar.innerHTML=TUT_PAGES.map((p,i)=>`<button class="tut-tab${i===0?' on':''}" onclick="goTutTab(${i})">${p.icon} ${p.tab}</button>`).join('');
}
function goTutTab(i){
  _tutIdx=i;
  renderTutPane(i);
  document.querySelectorAll('.tut-tab').forEach((b,j)=>b.classList.toggle('on',j===i));
}
function renderTutPane(i){
  const p=TUT_PAGES[i];
  document.getElementById('tut-body').innerHTML=`<div class="tut-pane on"><h3>${p.icon} ${p.title}</h3>${p.body}</div>`;
  document.getElementById('tut-prog').textContent=`Tab ${i+1} of ${TUT_PAGES.length}`;
  document.getElementById('tut-prev').disabled=i===0;
  document.getElementById('tut-prev').style.opacity=i===0?'.4':'1';
  const isLast=i===TUT_PAGES.length-1;
  document.getElementById('tut-next').textContent=isLast?'Close':'Next';
  document.getElementById('tut-next').onclick=isLast?closeTutorial:()=>tutNav(1);
}
function tutNav(dir){
  const ni=Math.max(0,Math.min(TUT_PAGES.length-1,_tutIdx+dir));
  goTutTab(ni);
}

// the setup world (every school of every state, the map and the job offers) is only built when a new game is set up:
// loading a save or playing Free Practice never needs it
try{worldApply(worldLoad());}catch(e){console.error('league setup',e);}
function setupEnsure(){if(!_allClsDivs){try{initCountyMap();}catch(e){console.error('setup',e);}}}
