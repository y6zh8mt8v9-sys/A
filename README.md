# Gridiron Prep GM v2.14

High school football GM with a playable Game Day engine.

## Files

| File | What it is |
| --- | --- |
| `app/` | The web app source (open `app/index.html`, or host the folder). |
| `Gridiron_web_app_v2_14.zip` | The same folder zipped, ready to upload to your host. |
| `Gridiron_v2_14_code.txt` | `index.html` as plain text. |
| `sw214.js` | The offline service worker (same as `app/sw.js`). |
| `supabase setup.sql` | The Online Play database script, updated for v2.14. |
| `Gridiron_web_app_v2_13.zip`, `Gridiron_v2_13_code.txt`, `sw213.js` | The previous version, unchanged. |

## Deploying v2.14

1. Upload the contents of `Gridiron_web_app_v2_14.zip` to your host (same place as v2.13).
2. **Online Play database:** open Supabase → SQL Editor → paste the whole `supabase setup.sql` → Run.
   It is safe to run again and keeps all data. It adds what the new online features need:
   account deletion, blocking, reporting and sending saves to friends.
   Until you run it, those buttons show a message asking for the update; everything else keeps working.
3. Players get the new version the next time they open the game (the service worker cache is now `gpgm-2.14`).

## What's new in 2.14

### Game Day
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

### Stats and careers
- New stats: tackles for loss, yards after catch, punt returns and safeties (Game Day and simulated games).
- Player cards gain **Game Log** and **Career** (season by season) tabs.
- **Play-call splits** for each game, plus season totals on Staff & Playbook.
- **XP for game performances** (10 XP = 1 skill point).
- **Player Career:** create your own player at the start. Follow him on Home → My Player through high school, college and the pros.

### Team and league
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

### Fixes
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

### Interface
- **Navigation:** 5 sections (Home, Team, Season, League, Program), each with its own short row of pages. On phones the sections are a bottom tab bar.
- The Game Day "sky" look is now the default theme (dark is still in Settings).
- The schedule builder has an **Auto-fill** button.
- The tutorial has new pages for every feature.

### Online, privacy and App Store
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
