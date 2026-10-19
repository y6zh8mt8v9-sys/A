# Gridiron 27 (beta, web version)

High school football career game with a playable Game Day engine.

## Files

| File | What it is |
| --- | --- |
| `app/` | The web app source (open `app/index.html`, or host the folder). |
| `Gridiron27_web_beta.zip` | The same folder zipped, ready to upload to your host. |
| `Gridiron27_code.txt` | `index.html` as plain text. |
| `sw.js` | The offline service worker (same as `app/sw.js`). |
| `supabase setup.sql` | The Online Play database script, now with Community Creations leagues. |
| `Gridiron27_online_setup_sql.txt` | The same script as text. |
| Older `Gridiron_*` zips, code files and `sw213.js` / `sw215.js` | Earlier builds, unchanged. |

## Deploying

1. Upload the contents of `Gridiron27_web_beta.zip` to your host, in the same place as before.
2. **Online Play database:** open Supabase → SQL Editor → paste the whole `supabase setup.sql` → Run.
   You can run it again safely; it keeps all data. This update adds section 9: the `community_leagues` table and the private
   `community` storage bucket for shared careers. Until you run it, Community Creations → Leagues asks for the update;
   everything else keeps working.
3. Players get the new build the next time they open the game (the offline cache is now `g27-beta-9`).
   The home-screen app also has new Gridiron 27 icons and splash screens; iPhones may keep the old splash until the app
   is removed from the home screen and added again.

## What's new

### Latest update
- **College career (Player Career):** after high school your player goes to the college he signed with.
  - He starts 15 to 30 overall lower (less for the best players and big stat lines), and every college roster is filled with the high school players it signed, rated the same way.
  - Conferences (four power conferences at FBS), 12 games, conference title games, the 12-team playoff and bowls; playoffs at FCS, Division II, Division III, NAIA and junior colleges.
  - Play each game on Game Day as your player or simulate it; depth chart, coach trust, weekly goals, redshirt (4 games), NIL money and spring brand deals, the January transfer portal.
  - The draft three years after high school: combine, 7 rounds, undrafted free agency or a spring league, then the pro career year by year.
- **Colleges:** every college has a mascot, colors and a real logo (no more plain letters). Edit any college (name, mascot, colors, logo icon, badge, uploaded logo, state, prestige, conference) from its profile or in League Setup.
- **Export teams only:** Load Game → Export teams saves every school, college and pro team of a career without players or progress; Team Builder imports it into a new career.
- **Fix:** a runner tackled inside the end zone now scores the touchdown.

### Previous update
- **Six-man, eight-man and nine-man football:** those classes play that many a side on Game Day and only schedule teams of their own format. Moving up switches to the next class's format (8-man or 11-man) and opens the rest of the class again. The home state now keeps all of its real classes (for example Texas 1A Six-Man), not only five.
- **Awards:** Player and Play of the Week, state and national Player and Freshman of the Year (every position can win), and postgame interviews.
- **Media page** with made-up outlets: PrepWire 365, The Rival Board and Friday Night Insider.
- **Careers:**
  - Host your own combine and invite college staffs, or invite coaches to a game.
  - Offensive and defensive coordinator jobs.
  - Automatic offers from the teams you created or edited.
  - Rivalry trophies with a series record and real stakes.
  - The state final is played at a neutral college stadium.
- **Game Day:**
  - Tip drill (catch tipped passes).
  - Fewer penalties on the opponent.
  - Real audibles before the snap.
  - Max chemistry: your QB throws as soon as you call for it.
  - Corners celebrate a breakup or a pick.
  - A small scorebug in Player Career, so it no longer covers the meter.
  - 2 players on one device in Free Practice.
- **Fixes:**
  - Game Day loads on Chromebooks, with a Try again button.
  - Career playoffs keep you as your player.
  - Simulated drives no longer give you stats you didn't earn.
  - Overall can't drop between seasons.
  - Smoother startup and menus on PC.
- **One look everywhere:** every page now uses the dashboard's club bar and tile headers.

### Earlier update
- **AI coaches:** go for it on 4th and short (no more punting at 4th and inches), kick field goals in range, and pass when they trail late instead of running.
- **Game Day:**
  - A stiff arm or juke on a jet sweep no longer sends your runner back to the old sweep path.
  - Throws fly on a flatter arc, and every play starts on a lob (tap to switch to bullet).
  - Player Career: only your own player gets a catch meter, and the close camera keeps the whole field (sideline to sideline) and crops the stands instead.
- **7v7:** pick 1 or 2 quarters per game in the Summer League window.
- **Coach careers:** job offers from other schools after a good season (Dashboard, until your first game). Your home state shows its real division names.
- **Player Career:**
  - No coach to create in Player Career mode.
  - New player creator: archetype, height and weight, interests (3), character traits (2), look, accessories and attribute points for a 40 to 55 overall.
  - Levels and skill points: games earn XP, every level brings 3 skill points to spend on attributes (My Player).
- **Cleaner screen and faster:** in the compact layout the top bars are gone (Save, Settings, Help and Menu sit in the club bar). The schedule builder shows 60 schools at a time with Show more (it could reload the page on phones), simulated weeks are faster, and Game Day caps its resolution on big or high-DPI PC screens and lowers quality sooner if frames run long.
- **Transfers all year:** meet scouted players during the season; if they say yes they finish the season at their school and join you next season. Your own players can also want out, depending on what they care about (playing time, exposure, winning, coaching, teammates), their traits and morale: at most 15% of your roster per year. Talk to them from the dashboard's Players leaving tile to change their mind; they leave when offseason training ends. Dashboard tiles: Transfers coming in, Players leaving.
- **New dashboard:** a club bar with your crest, name and a big Continue button, a Year/Week strip, then tiles (Next game, Team management, Training, Standings, Schedule, Recruiting, Seniors, News, Scouting, Top players, Program, League) that open their page. ☰ opens the full menu.
- **Compact menu:** the Dashboard lists every section with its pages and gold dots for things to do; pages open on their own with a Home button. Settings → Menu layout switches back to the classic tabs.

### Older update
- **New look on the home screen:** Gridiron 27 splash screens, app icons and loading screen (the old ones still said Gridiron Prep GM).
- **Player Career:**
  - A ring shows where every pass and kick will come down.
  - The camera follows your player closer (Settings: Close, Normal or Wide; landing marker for Career, Always or Off).
- **Controls:**
  - Holding the stick before the snap now runs from the first step.
  - On defense, tap another player with a second finger to switch while you keep steering; after a switch he keeps running your way.
- **Laptop freezes:** a stuck or virtual controller (common on gaming laptops) no longer pauses the game or steers your player. The keyboard always wins over an idle stick. The title screen highlights run in small slices.
- **Helmets off:** the player shows his own hair (color and style from his portrait), face and ears instead of a brown helmet.
- **Skin tones:** players on the field have the exact skin tone of their portrait.
- **7v7:** no helmets or pads (slimmer shoulders, shorts), everyone shows his hair, and it's real two-hand touch: no dives, trucks or stiff arms.
- **Onside kicks:** the receiving team reacts at the kick. The kicking team now recovers about 8–21% (was 58–86%).
- **Broadcast:**
  - Scorebug styles TV, Slab, Tower, Mini and Classic.
  - Camera Wide, Broadcast or Tight.
  - A crowd noise meter: the home crowd gets loud on the visitors' downs and can cause false starts, missed audibles and a little less focus on catches.
- **Program** (top of the Depth Chart): team morale, quarterback–receiver chemistry, up to three captains, weekly position battles; position coaches on the Staff page; Senior Night before the offseason.
- **League rules** (Settings, per career): 4, 8, 16 or 32 playoff teams, best records or division winners first, proper 1-vs-N seeding, and earned progression (ratings can't be typed in).
- **Equipment:** ski mask, guardian cap, a second mouthpiece; arm bands, arm sleeves and leg sleeves on the near or far side.
- **Community Creations:**
  - New Leagues tab: share a whole career (every team, player and record) from Load Game; others add it to their saves.
  - World files and shared worlds now carry every school you changed in Team Builder.
- **Fixes:**
  - Customize no longer cuts abbreviations to two letters.
  - Text in team colors stays readable.
  - Recruiting tabs and Game Day buttons match the new look.

- **Real number of high schools in every state** (about 15,100 for the whole country).
  - Pick up to **5 states in full detail** (League Setup → Choose your states). Every player on every team is simulated there.
  - Every other state is a **light state**. Its schools play every game, keep their strength and records, and crown a champion in a **state playoff**. The game tracks their top prospects, so stars, offers, camps and commitments work everywhere.
  - Light-state prospects are drawn from the detailed states' real rating spread, so stars are shared fairly. **At most 32 five-stars per class.**
  - Detailed states together hold up to 1,500 schools; your home state always counts as detailed. Every other league now also crowns its champion in a playoff bracket.
- **Fewer crashes on phones.**
  - The default world tracks about 70,000 players instead of 154,000.
  - Saves are about 40% smaller.
  - A big save from before this update can be made lighter when you load it.
- **Transfers** now show up on your roster right away.
- **Offensive line:** good linemen win again. Runners were going down on first contact after the new ratings arrived.
- **Look:**
  - The console look now also covers light mode, Settings and the Game Day menus, all in your team's colors.
  - The header no longer pops back on tiny scrolls.
- **Game Day:**
  - Skill moves sit on a wheel by default, with PlayStation, Xbox or keyboard buttons on each slice.
  - There are only two throws, bullet and lob. Tap the screen (or press Space) to switch; every play starts with a bullet. "QB run" sits on its own button.
- **Helmets:** finish and stripe are set for the whole team in Customize → Uniforms.
- **Player Career:**
  - Before every snap, a card shows the coach's call with your player circled and your job ("Run a post", "Man coverage on #84").
  - Receivers can steer their own route and call for the ball during the play.
- **Team Builder:**
  - Works for every state, with a search and real 3-letter abbreviations.
  - Every change is saved on the device as you go, so you can build your league over several sessions. League Setup keeps unsaved progress the same way.
  - Any school can be edited mid-season from its profile or from Customize.
- **Saving:** the career is saved right before every game, even when an autosave was still running when you pressed Play Game.
- **Error report:** Settings → Error report shows the last errors on your device, so you can copy them when you report a problem.

### Player Career
- **Player Career** on the title screen. You create one player, pick his high school, and in Game Day you control only him.
- **The coach does the rest:**
  - He calls every play.
  - The ball is snapped for you (a quarterback snaps it himself).
  - Drives your player is not on the field for are simulated.
- **Depth chart and coach trust:** starters play every drive of their side, and backups play some of them. Coach trust (0–100) rises with good games and wins.
- **Call for the ball** (B key, Y / Triangle, or the button) gets the quarterback looking your way.
- **Camera:** zoomed in on your player, who has a ring at his feet.
- **Transfers:** in the offseason, before the first game.
- **After high school:** college and pro careers are followed on My Player.

### Game Day
- **Controller prompts, Madden style:**
  - PlayStation or Xbox button icons over every receiver.
  - A legend for skill moves, tackling, switching and the snap.
- **Running:** sideways moves are as fast as running straight. Arrows or the left stick steer the ball carrier at full speed, and flicking the right stick jukes.
- **Sound now plays on every device:**
  - It starts with the tap that opens Game Day.
  - On iPhone it plays even with the silent switch on.
  - New, fuller effects are mixed loud enough for phone and laptop speakers.
- **7-on-7 Summer League** after the state championship:
  - Optional, with a $5,000 entry fee.
  - Pick 7 players for offense and 7 for defense.
  - No helmets or pads, two-hand touch, a four-second pass clock.
  - Quarterfinal and semifinal, then a best-of-five series for the league title.
  - Standouts pick up college offers.
- **Online Play fix:** the away team can pass again on PC, and the receiver numbers no longer get stuck on the sideline.

### World and schools
- **Real US states** with real counties and cities, and fictional high schools with fixed names. The same school is always in the same town.
- **Abbreviations:** three letters for every school, unique within each state.
- **Each state:**
  - Real classification and division counts.
  - Realistic numbers of schools.
  - Leagues with fictional names.
- **Colleges:** more than 135, with at most 32 five-star recruits per class.
- **World editor** (League Setup → Map editor):
  - Build custom states from real counties.
  - Rename counties.
- **Sharing:** save and load world files, or share them in **Community Creations** on the title screen.

### Look and money
- **New name:** Gridiron 27, labeled as a beta / web version (no version numbers in the game).
- **Look:** a console-style dark design in your team's colors.
- **New income:**
  - Sponsors
  - Booster fundraisers
  - Summer camps
  - Gate money after every game
- **Signing bonuses:** bigger for seniors who sign with colleges, scaled by level and star rating.

### Fixes
- The "divs.length" crash at the start of a new game after using Team Builder is fixed.
- A full test sweep of Game Day, careers, saves, playoffs and the US world shows no errors.

## Earlier updates

### Update 2.15

#### Game Day
- **Move buttons and keys:** Juke and Dive buttons join Spin, Stiff arm, Truck and Hurdle, all labelled with their key.
  Every key can be changed (Pause → Settings → Change keys).
- **Controllers:** Xbox, PlayStation and most other gamepads work in the game and in the menus.
- **Kick returns can be skipped** (Settings → Kick returns): the kickoff resolves at once.
- **Difficulty sliders** for you and the CPU:
  - speed, acceleration, strength, awareness
  - throwing accuracy, ball speed, catching, interceptions
  - man and zone coverage, fumbles, juking
  - game speed
  - presets: Easy, Normal, Hard, Legend
- **Balance:**
  - Jump balls and contested catches are decided by coverage and hands ratings, overall and height.
  - Catching is a little harder.
  - Good offensive lines hold up much better.
  - Fast players are clearly faster than slow ones.
  - Tall QBs throw over linebackers more easily, and tall receivers win high balls.
- **TV-style scorebug** (the classic one is still in Settings).
- **Cheerleaders** at every stadium, in the home team's colors.
- **Slow phones:**
  - Settings → Graphics: Fast lowers the resolution and turns off the title-screen highlights.
  - Fans in the stands: Light or Off.
- **Halftime** now explains who kicks off and why.

#### Career
- **Edit Player:** height, weight, class and the face (skin tone, hairstyle, hair and eye color, facial hair).
- **Edit many players at once** (Roster): add to, set or raise ratings for the whole team, offense, defense, a position or the JV.
- **Ticket sales:**
  - Home games earn gate and concession money, depending on stadium size, winning, prestige, rivals and playoffs.
  - You set the ticket price on the Staff page.
- **Trophy Case** (Program): titles, player awards and program records.
- The staff "Head Coach" slot is now the **Assistant Head Coach**; you are the head coach.

#### Free Practice
- Click any player on a Free Practice roster to edit him: name, number, position, ratings, size and face.
- **Share codes** to send a team to a friend.
- **Community teams** (Online Play account): publish your teams, browse and download other players' teams, report or block.

#### Fixes
- A player who changes position keeps his height and weight.
  His body no longer gets forced into the new position's size range.
- The Sliders, Privacy policy and Terms windows no longer open behind the Settings window.

### Update 2.14

#### Game Day
- **Celebrations:** 8 new touchdown celebrations (14 in total), plus sack celebrations and better first-down celebrations.
  Big first downs and 3rd/4th-down conversions get a crowd reaction.
- **Sound:** synthesized sound effects (whistle, snap, pads, hits, throws, catches, kicks, horn) and crowd noise that follows the home team.
  No audio files are used.
- **Pressure ("nervosity"):** late close games, 4th downs, two-point tries and overtime bring a heartbeat, a red screen edge and a louder crowd.
  Players without clutch traits get smaller catch windows and faster kick meters.
- **Stiff arm rework:** it now shoves the first defender who closes in, and can put him on the ground.
- **Helmets can come off** on big hits. That player sits out the next play.
- **Tap to switch defenders** during a live play.
- **Gameplay tips** (juke/truck explanations) are hidden by default; you can turn them back on in Settings.
- **Settings:** ball size, drive direction (right / left / switch each quarter), sound, crowd, vibration.
- **Coach mode** (call plays, the team runs them), **offense-only / defense-only** games, and **sim to end of quarter**.
- **PC controls:** keys 1–5 throw to receivers, C to scramble, P/Esc to pause, T for timeout, number keys pick celebrations.
  Key labels appear on the buttons, and a controls guide shows the first time you play on a computer.
- **Replay video:** recording is lighter, so saving a replay no longer makes the game stutter.

#### Stats and careers
- New stats: tackles for loss, yards after catch, punt returns and safeties (Game Day and simulated games).
- Player cards gain **Game Log** and **Career** (season by season) tabs.
- **Play-call splits** for each game, plus season totals on Staff & Playbook.
- **XP for game performances** (10 XP = 1 skill point).
- **Player Career:** create your own player at the start. Follow him on Home → My Player through high school, college and the pros.

#### Team and league
- JV players form the practice scout team and earn XP.
- **Talk to JV players** to move them up, and hold **transfer meetings** with other schools' players. The right pitch matters.
- New plays in every standard playbook (13 passes, 4 Trips/Empty, 9 runs), plus 4 new defenses.
- **Helmet styles** in Edit Player (gloss, matte or chrome; stripe on or off; facemask color).
- **Shoulder stripes** in the uniform designer.
- **League Setup** (setup screen):
  - rename states and counties
  - edit or add colleges at every level, and edit the pro teams
  - rename and resize divisions
  - set star-rating counts and recruiting class sizes

#### Fixes
- Jersey **#0**: the editor accepts it, and loading old saves no longer replaces it.
- **Hot/cold streaks:**
  - they now need 3 games
  - they count down in the playoffs and affect Game Day
  - bench players no longer go "ice cold"
  - a player can get another streak later in the season
- Season history is recorded before seniors graduate.
- The setup screen no longer cuts off its top on small screens.
- **Begin Offseason** asks before simulating remaining games.
  A new season's main button is now "Play Week 1" instead of an offseason button that simmed the whole season.

#### Interface
- **Navigation:** 5 sections (Home, Team, Season, League, Program), each with its own short row of pages. On phones the sections are a bottom tab bar.
- The Game Day "sky" look is now the default theme (dark is still in Settings).
- The schedule builder has an **Auto-fill** button.
- The tutorial has new pages for every feature.

#### Online, privacy and App Store
- In-app **Delete my account** (removes the account, cloud saves and shared saves), plus a **privacy policy**.
- **Block** and **report** players, and a word filter on usernames and display names.
- **Send a career save to a friend**; it shows up under Account → Saves from friends.
- Real trademarks are replaced with fictional names:
  - pro leagues and teams (NFL/UFL/CFL), the Super Bowl, Pro Bowl and Grey Cup
  - college award names (Heisman and others) and bowl games
  - recruiting sites and real players' names in move labels
  Existing saves are migrated automatically.

## App Store notes

- The App Store needs a native app, so wrap the web app with a tool like Capacitor or a WKWebView shell.
  Online Play needs network access.
- In App Store Connect, provide a privacy policy URL; the in-game policy text (Settings → Privacy policy) can be published as that page.
  Data collected: account email and username (only if a player signs up for Online Play). No tracking.
- Account deletion is available in the game (Online Play → Account → Delete my account), as Apple requires for apps with sign-up.
- User-generated content (usernames, profiles) has blocking, reporting and a word filter.
  Reports land in the `reports` table in your Supabase dashboard.
- Online Play sign-up requires agreeing to the in-game **Terms of use** (zero tolerance for objectionable content).
  Apple expects reports to be acted on within 24 hours, as the terms promise.
- **Before publishing:** set `SUPPORT_EMAIL` in `app/index.html` (search for `const SUPPORT_EMAIL`) so the support contact shows in Settings, Privacy and Terms.
- In Supabase → Authentication → URL Configuration, set the **Site URL** to your hosted web version.
  Sign-up confirmation emails from the iOS app link there, because the app's own address can't be opened from an email.
- Inside the native app the offline service worker is switched off automatically (the files are bundled in the app).
- All colleges, pro teams, leagues, awards and bowls are fictional.
