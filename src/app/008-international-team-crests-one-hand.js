// ═══════════ v1.95 INTERNATIONAL TEAM CRESTS, one hand-built badge per program ═══════════
// every function returns artwork in a 100x100 box; a = primary, b = secondary, c = tertiary, o = ink
const _IL_O='#0b1118';
function _ilMir(s){return`<g transform="translate(100 0) scale(-1 1)">${s}</g>`;}
function _ilStar(cx,cy,r1,r2,n,rot){let d='';for(let i=0;i<n*2;i++){const r=i%2?r2:r1,a=(rot||-90)*Math.PI/180+i*Math.PI/n;d+=(i?'L':'M')+(cx+Math.cos(a)*r).toFixed(1)+','+(cy+Math.sin(a)*r).toFixed(1);}return d+'Z';}
function _ilRays(cx,cy,r1,r2,n,col,w){let s='';for(let i=0;i<n;i++){const a=i*2*Math.PI/n;s+=`<path d="M${(cx+Math.cos(a)*r1).toFixed(1)},${(cy+Math.sin(a)*r1).toFixed(1)} L${(cx+Math.cos(a)*r2).toFixed(1)},${(cy+Math.sin(a)*r2).toFixed(1)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;}return s;}
function _ilLeaf(x,y,rot,col){return`<ellipse cx="${x}" cy="${y}" rx="6.5" ry="2.8" transform="rotate(${rot} ${x} ${y})" fill="${col}" stroke="${_IL_O}" stroke-width="1.2"/>`;}
const INTL_LOGO={
 // Berlin Adler Academy, heraldic eagle on a navy roundel
 9001:({a,b,c})=>{const wing=`<path d="M48,42 C38,30 24,24 9,27 L16,33 L7,37 L16,42 L9,48 L19,51 L14,57 L26,58 L22,64 C34,62 42,57 48,52 Z" fill="${b}" stroke="${_IL_O}" stroke-width="2.4" stroke-linejoin="round"/><path d="M44,40 C34,33 24,31 15,33 M44,46 C34,42 24,42 15,44 M44,51 C36,50 28,52 22,56" fill="none" stroke="${_IL_O}" stroke-width="1.5" opacity=".65"/>`;
  return`<circle cx="50" cy="50" r="47" fill="${a}" stroke="${_IL_O}" stroke-width="3"/><circle cx="50" cy="50" r="41" fill="none" stroke="${b}" stroke-width="3"/>${wing}${_ilMir(wing)}
  <path d="M42,66 L36,82 L45,76 L50,85 L55,76 L64,82 L58,66 Z" fill="${b}" stroke="${_IL_O}" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M43,36 C43,29 57,29 57,36 L59,62 C57,72 43,72 41,62 Z" fill="${b}" stroke="${_IL_O}" stroke-width="2.4"/>
  <path d="M45,46 L55,46 M44,53 L56,53 M45,60 L55,60" stroke="${_IL_O}" stroke-width="1.4" opacity=".6"/>
  <circle cx="49" cy="27" r="8" fill="${b}" stroke="${_IL_O}" stroke-width="2.4"/><path d="M42,25 L33,29 L42,31 Z" fill="${b}" stroke="${_IL_O}" stroke-width="2" stroke-linejoin="round"/><path d="M35,29.5 L30,33 L37,31 Z" fill="${c}"/>
  <circle cx="47" cy="25.5" r="1.8" fill="${_IL_O}"/><path d="M40,70 L37,76 M60,70 L63,76" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`;},
 // Rhein-Ruhr Selection, steel wolf head inside an industrial gear
 9002:({a,b,c})=>{let teeth='';for(let i=0;i<12;i++)teeth+=`<rect x="44" y="1" width="12" height="12" rx="1.5" transform="rotate(${i*30} 50 50)" fill="${a}" stroke="${_IL_O}" stroke-width="2"/>`;
  return`${teeth}<circle cx="50" cy="50" r="41" fill="${a}" stroke="${_IL_O}" stroke-width="2.5"/><circle cx="50" cy="50" r="35" fill="${_IL_O}" opacity=".35"/>
  ${[0,90,180,270].map(r=>`<circle cx="${(50+Math.cos(r*Math.PI/180)*38).toFixed(1)}" cy="${(50+Math.sin(r*Math.PI/180)*38).toFixed(1)}" r="1.8" fill="${b}"/>`).join('')}
  <path d="M27,20 L39,40 L30,45 Z M73,20 L61,40 L70,45 Z" fill="${b}" stroke="${_IL_O}" stroke-width="2.2" stroke-linejoin="round"/><path d="M30,26 L36,38 L32,40 Z M70,26 L64,38 L68,40 Z" fill="${c}"/>
  <path d="M29,45 L38,36 L50,40 L62,36 L71,45 L67,63 L57,79 L50,84 L43,79 L33,63 Z" fill="#c6ccd4" stroke="${_IL_O}" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M38,36 L44,56 L33,63 M62,36 L56,56 L67,63 M50,40 L50,55" fill="none" stroke="${_IL_O}" stroke-width="1.3" opacity=".45"/>
  <path d="M42,57 L50,54 L58,57 L55,72 L50,77 L45,72 Z" fill="${b}" stroke="${_IL_O}" stroke-width="1.8" stroke-linejoin="round"/><path d="M45,69 L55,69 L50,75 Z" fill="${_IL_O}"/>
  <path d="M36,48 L46,51 L39,55 Z M64,48 L54,51 L61,55 Z" fill="${c}" stroke="${_IL_O}" stroke-width="1.4"/>`;},
 // London Gridiron Academy, crowned lion head on a heater shield
 9003:({a,b,c})=>`<path d="M10,14 L90,14 L90,44 C90,70 72,86 50,96 C28,86 10,70 10,44 Z" fill="${c}" stroke="${_IL_O}" stroke-width="3"/><path d="M16,20 L84,20 L84,44 C84,66 69,80 50,89 C31,80 16,66 16,44 Z" fill="${a}"/>
  <path d="${_ilStar(50,56,30,21,16)}" fill="#e3a63a" stroke="${_IL_O}" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M36,48 C36,38 64,38 64,48 L62,64 C60,74 54,80 50,80 C46,80 40,74 38,64 Z" fill="#f0c66b" stroke="${_IL_O}" stroke-width="2.2"/>
  <circle cx="35" cy="42" r="4.5" fill="#f0c66b" stroke="${_IL_O}" stroke-width="2"/><circle cx="65" cy="42" r="4.5" fill="#f0c66b" stroke="${_IL_O}" stroke-width="2"/>
  <path d="M41,52 L47,54 M59,52 L53,54" stroke="${_IL_O}" stroke-width="2.6" stroke-linecap="round"/><path d="M45,63 L55,63 L50,69 Z" fill="${_IL_O}"/><path d="M50,69 L50,72 M44,74 C47,77 53,77 56,74" fill="none" stroke="${_IL_O}" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M33,23 L37,9 L44,17 L50,6 L56,17 L63,9 L67,23 Z" fill="${b}" stroke="${_IL_O}" stroke-width="2.2" stroke-linejoin="round"/><rect x="32" y="22" width="36" height="6" rx="1.5" fill="${b}" stroke="${_IL_O}" stroke-width="2"/><circle cx="50" cy="25" r="1.8" fill="${a}"/><circle cx="41" cy="25" r="1.5" fill="${c}"/><circle cx="59" cy="25" r="1.5" fill="${c}"/>`,
 // Northern Knights, great helm with a plume on a kite shield
 9004:({a,b,c})=>`<path d="M50,4 L88,14 C88,52 74,78 50,97 C26,78 12,52 12,14 Z" fill="${a}" stroke="${_IL_O}" stroke-width="3"/><path d="M50,10 L82,18 C81,50 69,72 50,89 C31,72 19,50 18,18 Z" fill="none" stroke="${b}" stroke-width="2.5"/>
  <path d="M52,24 C60,8 80,6 88,16 C78,13 68,16 60,26 Z" fill="${b}" stroke="${_IL_O}" stroke-width="2" stroke-linejoin="round"/><path d="M58,22 C64,14 74,12 82,14" fill="none" stroke="${_IL_O}" stroke-width="1.2" opacity=".5"/>
  <path d="M31,34 C31,22 69,22 69,34 L69,70 C69,76 31,76 31,70 Z" fill="${c}" stroke="${_IL_O}" stroke-width="2.4"/><path d="M34,36 C34,28 44,26 50,26" fill="none" stroke="#ffffff" stroke-width="2" opacity=".55"/>
  <rect x="31" y="42" width="38" height="5" fill="${_IL_O}"/><rect x="48" y="47" width="4" height="27" fill="${_IL_O}"/>
  ${[0,1,2].map(i=>`<circle cx="40" cy="${54+i*6}" r="1.4" fill="${_IL_O}"/><circle cx="60" cy="${54+i*6}" r="1.4" fill="${_IL_O}"/>`).join('')}
  <path d="M31,58 L69,58" stroke="${b}" stroke-width="2"/>`,
 // Madrid Toros, charging bull head with sweeping horns
 9005:({a,b,c})=>`<circle cx="50" cy="52" r="45" fill="${a}" stroke="${_IL_O}" stroke-width="3"/><circle cx="50" cy="52" r="39" fill="none" stroke="${b}" stroke-width="3"/>
  <path d="M37,40 C24,41 13,33 9,18 C17,27 27,31 39,32 Z" fill="#f4e6c4" stroke="${_IL_O}" stroke-width="2.2" stroke-linejoin="round"/><path d="M63,40 C76,41 87,33 91,18 C83,27 73,31 61,32 Z" fill="#f4e6c4" stroke="${_IL_O}" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M30,42 L38,40 L37,48 Z M70,42 L62,40 L63,48 Z" fill="${c}" stroke="${_IL_O}" stroke-width="2"/>
  <path d="M37,36 C37,30 63,30 63,36 L61,62 C59,76 55,84 50,84 C45,84 41,76 39,62 Z" fill="${c}" stroke="${_IL_O}" stroke-width="2.4"/>
  <path d="M44,33 C47,28 53,28 56,33 C52,31 48,31 44,33 Z" fill="${b}"/><path d="M41,50 L47,53 L42,55 Z M59,50 L53,53 L58,55 Z" fill="${b}"/>
  <ellipse cx="50" cy="75" rx="9.5" ry="7" fill="#4a3a36" stroke="${_IL_O}" stroke-width="2"/><ellipse cx="46" cy="75" rx="1.8" ry="2.6" fill="${_IL_O}"/><ellipse cx="54" cy="75" rx="1.8" ry="2.6" fill="${_IL_O}"/>
  <path d="M50,82 C47,86 47,90 50,91 C53,90 53,86 50,82" fill="none" stroke="${b}" stroke-width="2"/>`,
 // Selección Monterrey, jaguar head in front of the saddle-back mountain
 9006:({a,b,c})=>{const sp=[[38,46],[62,46],[34,58],[66,58],[44,40],[56,40]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3.2" fill="none" stroke="${_IL_O}" stroke-width="1.8"/><circle cx="${x}" cy="${y}" r="1.1" fill="${_IL_O}"/>`).join('');
  return`<path d="M50,3 L92,20 L86,72 L50,97 L14,72 L8,20 Z" fill="${a}" stroke="${_IL_O}" stroke-width="3"/>
  <path d="M12,44 L30,22 L40,32 L50,18 L60,32 L70,22 L88,44 Z" fill="${b}" opacity=".9"/><path d="M50,18 L50,32" stroke="${a}" stroke-width="2"/>
  <circle cx="31" cy="36" r="7" fill="#e7a83a" stroke="${_IL_O}" stroke-width="2.2"/><circle cx="69" cy="36" r="7" fill="#e7a83a" stroke="${_IL_O}" stroke-width="2.2"/><circle cx="31" cy="36" r="3" fill="${_IL_O}" opacity=".5"/><circle cx="69" cy="36" r="3" fill="${_IL_O}" opacity=".5"/>
  <path d="M28,48 C28,34 72,34 72,48 C72,64 64,82 50,86 C36,82 28,64 28,48 Z" fill="#e7a83a" stroke="${_IL_O}" stroke-width="2.4"/>${sp}
  <path d="M40,62 C40,56 60,56 60,62 C60,72 56,80 50,80 C44,80 40,72 40,62 Z" fill="#fbe8c4" stroke="${_IL_O}" stroke-width="1.8"/>
  <path d="M39,51 L47,53 L41,56 Z M61,51 L53,53 L59,56 Z" fill="${c}" stroke="${_IL_O}" stroke-width="1.4"/><path d="M45,62 L55,62 L50,67 Z" fill="${_IL_O}"/>
  <path d="M43,72 L46,77 M57,72 L54,77" stroke="${_IL_O}" stroke-width="1.6" stroke-linecap="round"/><path d="M46,73 L48,78 L50,73 L52,78 L54,73" fill="#ffffff" stroke="${_IL_O}" stroke-width="1"/>`;},
 // Kobe Seiryo Blue Fighters, rising fist over a harbor wave burst
 9007:({a,b,c})=>`<circle cx="50" cy="50" r="47" fill="${a}" stroke="${_IL_O}" stroke-width="3"/>${_ilRays(50,50,20,44,16,c,3)}<circle cx="50" cy="50" r="47" fill="none" stroke="${b}" stroke-width="3"/>
  <path d="M10,74 C22,64 32,70 40,64 C48,58 56,62 62,68 C70,74 80,66 90,72 L88,82 C70,96 30,96 12,82 Z" fill="${b}" stroke="${_IL_O}" stroke-width="2"/><path d="M18,80 C30,74 40,80 50,76 C60,72 72,80 84,76" fill="none" stroke="${a}" stroke-width="2"/>
  ${[0,1,2,3].map(i=>`<rect x="${31+i*10}" y="22" width="10" height="16" rx="4.5" fill="${b}" stroke="${_IL_O}" stroke-width="2.2"/>`).join('')}
  <path d="M31,34 L71,34 L71,52 C71,60 64,64 58,64 L44,64 C37,64 31,60 31,52 Z" fill="${b}" stroke="${_IL_O}" stroke-width="2.4"/>
  <path d="M32,44 C42,40 54,42 58,48 L56,53 C48,49 40,49 32,52 Z" fill="${b}" stroke="${_IL_O}" stroke-width="2" stroke-linejoin="round"/>
  <rect x="36" y="62" width="30" height="12" rx="2" fill="${c}" stroke="${_IL_O}" stroke-width="2.2"/><rect x="36" y="66" width="30" height="3" fill="${a}"/>`,
 // Tokyo Akatsuki, samurai kabuto in front of the dawn sun
 9008:({a,b,c})=>`<circle cx="50" cy="50" r="47" fill="${c}" stroke="${_IL_O}" stroke-width="3"/><circle cx="50" cy="44" r="34" fill="${a}"/>
  <path d="M29,30 C36,8 64,8 71,30 C63,20 37,20 29,30 Z" fill="#e8c35a" stroke="${_IL_O}" stroke-width="2.2"/>
  <path d="M28,56 C28,32 72,32 72,56 Z" fill="${b}" stroke="${_IL_O}" stroke-width="2.4"/><path d="M50,34 L50,56 M40,36 L42,56 M60,36 L58,56" stroke="#5a5f68" stroke-width="1.6"/><circle cx="50" cy="40" r="3" fill="#e8c35a" stroke="${_IL_O}" stroke-width="1.4"/>
  <path d="M18,56 L82,56 L76,72 L24,72 Z" fill="${b}" stroke="${_IL_O}" stroke-width="2.4" stroke-linejoin="round"/><path d="M21,62 L79,62 M23,67 L77,67" stroke="${a}" stroke-width="2"/>
  <path d="M18,56 L10,46 L26,52 Z M82,56 L90,46 L74,52 Z" fill="${b}" stroke="${_IL_O}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M37,72 L63,72 L59,88 L41,88 Z" fill="${a}" stroke="${_IL_O}" stroke-width="2.2" stroke-linejoin="round"/><path d="M42,78 L58,78" stroke="${c}" stroke-width="2.4"/><path d="M44,78 L44,82 M48,78 L48,82 M52,78 L52,82 M56,78 L56,82" stroke="${_IL_O}" stroke-width="1"/>`,
 // Polynesian Voyagers, double-hull canoe under a crab-claw sail and a guiding star
 9009:({a,b,c})=>`<circle cx="50" cy="50" r="47" fill="${a}" stroke="${_IL_O}" stroke-width="3"/><circle cx="50" cy="50" r="41" fill="none" stroke="${b}" stroke-width="2.5" stroke-dasharray="5 3"/>
  <path d="${_ilStar(73,24,8,2.6,4,-90)}" fill="${b}"/><circle cx="26" cy="30" r="1.6" fill="${b}"/><circle cx="34" cy="20" r="1.2" fill="${b}"/>
  <path d="M50,70 C32,58 24,36 30,12 C38,32 45,46 50,54 C55,46 62,32 70,12 C76,36 68,58 50,70 Z" fill="${b}" stroke="${_IL_O}" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M36,30 L41,36 L36,40 Z M40,46 L46,50 L41,54 Z M64,30 L59,36 L64,40 Z M60,46 L54,50 L59,54 Z" fill="${c}"/><path d="M32,16 C38,36 44,50 50,58 C56,50 62,36 68,16" fill="none" stroke="${c}" stroke-width="2.4"/>
  <path d="M20,70 L80,70 C76,78 24,78 20,70 Z" fill="${c}" stroke="${_IL_O}" stroke-width="2"/><path d="M26,76 L74,76 C70,82 30,82 26,76 Z" fill="${c}" opacity=".8"/>
  <path d="M22,84 C28,80 32,87 38,84 C44,80 48,87 54,84 C60,80 64,87 70,84 C73,83 76,83 78,84" fill="none" stroke="${b}" stroke-width="2.6" stroke-linecap="round"/>`,
 // Kyoto Higashiyama Kitsune, white fox mask with shrine-red markings and fox fire
 9010:({a,b,c})=>`<circle cx="50" cy="52" r="45" fill="${a}" stroke="${_IL_O}" stroke-width="3"/><circle cx="50" cy="52" r="39" fill="${c}" opacity=".25"/>
  <path d="M18,30 C14,22 20,14 24,20 C22,24 24,28 18,30 Z M82,30 C86,22 80,14 76,20 C78,24 76,28 82,30 Z" fill="#ffd27a"/>
  <path d="M50,88 L33,64 C26,52 28,42 33,35 L27,11 L44,29 C48,28 52,28 56,29 L73,11 L67,35 C72,42 74,52 67,64 Z" fill="${b}" stroke="${_IL_O}" stroke-width="2.6" stroke-linejoin="round"/>
  <path d="M30,17 L40,30 L34,33 Z M70,17 L60,30 L66,33 Z" fill="${a}"/>
  <path d="M36,42 C40,38 45,38 47,44 C43,42 40,43 36,46 Z M64,42 C60,38 55,38 53,44 C57,42 60,43 64,46 Z" fill="${a}"/>
  <path d="M37,51 C40,48 45,48 47,52 C43,54 40,54 37,51 Z M63,51 C60,48 55,48 53,52 C57,54 60,54 63,51 Z" fill="${c}"/>
  <path d="M48,34 C49,40 51,40 52,34" fill="none" stroke="${a}" stroke-width="2.6" stroke-linecap="round"/><path d="M45,76 L55,76 L50,82 Z" fill="${c}"/>
  <path d="M40,64 C44,68 56,68 60,64" fill="none" stroke="${a}" stroke-width="2.2" stroke-linecap="round"/>`,
 // Sapporo Hokusei Snow Cranes, red-crowned crane head and neck with a snowflake
 9011:({a,b,c})=>{const fl=[0,60,120].map(r=>`<g transform="rotate(${r} 76 26)"><path d="M76,16 L76,36" stroke="${b}" stroke-width="2.2" stroke-linecap="round"/><path d="M73,19 L76,22 L79,19 M73,33 L76,30 L79,33" fill="none" stroke="${b}" stroke-width="1.6"/></g>`).join('');
  return`<circle cx="50" cy="50" r="47" fill="${c}" stroke="${_IL_O}" stroke-width="3"/><circle cx="50" cy="50" r="41" fill="none" stroke="${a}" stroke-width="3"/>${fl}
  <path d="M22,92 C16,70 30,58 40,52 C48,47 50,40 46,34 C52,38 56,46 50,56 C42,66 34,76 40,92 Z" fill="${b}" stroke="${_IL_O}" stroke-width="2.4"/>
  <path d="M46,34 C40,28 40,20 48,16 C56,14 62,20 60,28 C58,32 54,34 50,34 Z" fill="${b}" stroke="${_IL_O}" stroke-width="2.4"/>
  <path d="M44,22 C46,30 46,40 42,50 C40,56 34,62 28,66 C34,58 38,52 40,46 C42,38 40,30 44,22 Z" fill="${_IL_O}"/>
  <path d="M60,26 L86,34 L60,30 Z" fill="#c9b27a" stroke="${_IL_O}" stroke-width="1.8" stroke-linejoin="round"/><path d="M47,17 C50,13 56,13 58,17 C54,16 50,16 47,17 Z" fill="${a}" stroke="${_IL_O}" stroke-width="1"/>
  <circle cx="54" cy="24" r="2" fill="${_IL_O}"/>`;},
 // München Isar Löwen, golden lion rampant on blue-and-white lozenges
 9012:({a,b,c})=>{let lz='';for(let y=0;y<7;y++)for(let x=0;x<7;x++)if((x+y)%2===0)lz+=`<path d="M${x*16-6},${y*16+4} L${x*16+2},${y*16-4} L${x*16+10},${y*16+4} L${x*16+2},${y*16+12} Z" fill="${a}"/>`;
  return`<defs><clipPath id="ilc9012"><path d="M14,12 L86,12 L86,44 C86,68 70,84 50,92 C30,84 14,68 14,44 Z"/></clipPath></defs>
  <path d="M8,6 L92,6 L92,44 C92,72 74,90 50,98 C26,90 8,72 8,44 Z" fill="${c}" stroke="${_IL_O}" stroke-width="3"/>
  <g clip-path="url(#ilc9012)"><rect x="0" y="0" width="100" height="100" fill="${b}"/>${lz}</g>
  <path d="M62,58 C76,56 80,44 74,34 C80,36 86,46 82,56 C78,64 70,66 62,63 Z" fill="${c}" stroke="${_IL_O}" stroke-width="2"/><path d="M74,34 C70,28 76,24 80,28 C78,30 76,32 74,34 Z" fill="${c}" stroke="${_IL_O}" stroke-width="1.6"/>
  <path d="M44,32 C57,34 65,45 62,59 L67,82 L58,82 L54,66 L47,71 L45,86 L36,86 L38,66 C33,56 35,44 44,32 Z" fill="${c}" stroke="${_IL_O}" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M42,40 L26,33 L23,39 L38,47 Z M47,47 L30,52 L30,58 L47,55 Z" fill="${c}" stroke="${_IL_O}" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="${_ilStar(41,27,12,8,10,-80)}" fill="#b98a1e" stroke="${_IL_O}" stroke-width="1.8" stroke-linejoin="round"/><circle cx="40" cy="27" r="7" fill="${c}" stroke="${_IL_O}" stroke-width="2"/>
  <path d="M33,28 L28,31 L34,32 Z" fill="#c8102e"/><circle cx="38" cy="25" r="1.5" fill="${_IL_O}"/>`;},
 // Hamburg Hanse Freibeuter, Hanseatic cog under a red sail with a skull
 9013:({a,b,c})=>`<circle cx="50" cy="50" r="47" fill="${a}" stroke="${_IL_O}" stroke-width="3"/><circle cx="50" cy="50" r="41" fill="none" stroke="${b}" stroke-width="3"/>
  <rect x="48" y="12" width="4" height="58" fill="#8a6a43" stroke="${_IL_O}" stroke-width="1.4"/><path d="M52,10 L66,14 L52,18 Z" fill="${b}"/>
  <path d="M26,22 C40,18 60,18 74,22 L72,58 C58,54 42,54 28,58 Z" fill="${b}" stroke="${_IL_O}" stroke-width="2.4" stroke-linejoin="round"/>
  <circle cx="50" cy="35" r="8" fill="${c}" stroke="${_IL_O}" stroke-width="1.6"/><rect x="45" y="40" width="10" height="6" rx="1" fill="${c}" stroke="${_IL_O}" stroke-width="1.4"/><circle cx="47" cy="34" r="2.2" fill="${_IL_O}"/><circle cx="53" cy="34" r="2.2" fill="${_IL_O}"/>
  <path d="M40,48 L60,42 M40,42 L60,48" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M14,62 L86,62 L80,76 C64,82 36,82 20,76 Z" fill="#6b4a2c" stroke="${_IL_O}" stroke-width="2.4" stroke-linejoin="round"/><path d="M14,62 L24,56 L30,62 Z M86,62 L76,56 L70,62 Z" fill="#6b4a2c" stroke="${_IL_O}" stroke-width="2"/><path d="M20,68 L80,68" stroke="${b}" stroke-width="2"/>
  <path d="M24,84 C30,80 34,87 40,84 C46,80 50,87 56,84 C62,80 66,87 72,84 C74,83 76,83 77,84" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/>`,
 // Nairobi Savannah Rhinos, rhino head in profile against the sun, flag-stripe ring
 9014:({a,b,c})=>`<circle cx="50" cy="50" r="47" fill="${c}" stroke="${_IL_O}" stroke-width="3"/><circle cx="50" cy="50" r="42" fill="${b}"/><circle cx="50" cy="50" r="37" fill="${a}"/>
  <circle cx="60" cy="40" r="20" fill="#f0a020" opacity=".9"/><path d="M13,70 L87,70 L84,78 L16,78 Z" fill="#c9a24a" opacity=".85"/><path d="M20,70 L22,62 L24,70 M74,70 L76,60 L78,70 M30,70 L31,64 L33,70" stroke="#c9a24a" stroke-width="1.6" fill="none"/>
  <path d="M30,41 C27,33 29,26 34,21 C36,28 39,34 39,40 Z" fill="#5b5f66" stroke="${_IL_O}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M14,66 C14,50 24,40 38,38 C46,37 54,38 60,40 L72,46 C78,48 84,54 86,62 L84,68 C76,72 66,72 58,74 C46,78 30,78 22,74 C17,72 14,70 14,66 Z" fill="#5b5f66" stroke="${_IL_O}" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M73,48 C75,36 79,26 84,19 C85,31 85,43 82,53 Z" fill="#e8e2d0" stroke="${_IL_O}" stroke-width="1.8" stroke-linejoin="round"/><path d="M61,42 C63,36 65,32 68,29 C68,35 68,40 67,45 Z" fill="#e8e2d0" stroke="${_IL_O}" stroke-width="1.6" stroke-linejoin="round"/>
  <circle cx="60" cy="53" r="2.3" fill="${_IL_O}"/><path d="M70,66 C75,67 79,67 84,65" fill="none" stroke="${_IL_O}" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M34,46 C32,54 32,62 34,70 M40,44 C38,52 38,62 40,72" fill="none" stroke="${_IL_O}" stroke-width="1.5" opacity=".5"/><path d="M48,58 C54,60 60,62 64,62" fill="none" stroke="#7d828a" stroke-width="2"/>`,
 // Bergen Fjord Trolls, shaggy mountain troll in front of the fjord peaks
 9015:({a,b,c})=>`<path d="M50,3 L94,24 L94,62 C94,80 72,92 50,97 C28,92 6,80 6,62 L6,24 Z" fill="${a}" stroke="${_IL_O}" stroke-width="3"/>
  <path d="M8,56 L28,28 L38,40 L52,20 L66,40 L76,30 L92,56 Z" fill="${b}" opacity=".85"/><path d="M28,28 L32,34 L26,36 Z M52,20 L57,28 L48,28 Z M76,30 L80,36 L73,36 Z" fill="#ffffff"/>
  <path d="M24,50 C20,32 34,22 50,22 C66,22 80,32 76,50 C82,46 86,50 84,56 C80,54 78,56 76,58 L70,40 L60,36 L50,40 L40,36 L30,40 L24,58 C22,56 20,54 16,56 C14,50 18,46 24,50 Z" fill="${c}" stroke="${_IL_O}" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M28,46 L26,40 L34,44 Z M72,46 L74,40 L66,44 Z" fill="#9db3a8" stroke="${_IL_O}" stroke-width="1.8"/>
  <path d="M32,46 C32,40 68,40 68,46 L66,70 C64,82 58,88 50,88 C42,88 36,82 34,70 Z" fill="#9db3a8" stroke="${_IL_O}" stroke-width="2.4"/>
  <path d="M38,52 C41,49 45,50 46,53 M62,52 C59,49 55,50 54,53" fill="none" stroke="${_IL_O}" stroke-width="2.2" stroke-linecap="round"/><circle cx="42" cy="55" r="1.8" fill="${_IL_O}"/><circle cx="58" cy="55" r="1.8" fill="${_IL_O}"/>
  <path d="M47,52 C46,62 42,70 46,74 C49,77 55,76 56,72 C58,66 53,60 53,52 Z" fill="#8aa396" stroke="${_IL_O}" stroke-width="2"/>
  <path d="M40,79 C46,83 54,83 60,79" fill="none" stroke="${_IL_O}" stroke-width="2" stroke-linecap="round"/><path d="M42,79 L44,74 L46,80 M58,79 L56,74 L54,80" fill="#ffffff" stroke="${_IL_O}" stroke-width="1.2"/>`,
 // Paris Gridiron Académie, Gallic rooster head with tricolour hackles
 9016:({a,b,c})=>`<circle cx="50" cy="50" r="47" fill="${b}" stroke="${_IL_O}" stroke-width="3"/><circle cx="50" cy="50" r="41" fill="none" stroke="${a}" stroke-width="3"/>
  <path d="M30,92 C26,70 30,52 40,42 C46,36 56,34 64,36 C70,38 74,44 72,50 C70,56 62,58 60,64 C58,72 64,84 66,92 Z" fill="${a}" stroke="${_IL_O}" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M34,90 C32,74 34,60 42,50 M46,90 C42,76 44,62 50,54 M58,90 C54,78 54,68 58,60" fill="none" stroke="${b}" stroke-width="3.2" stroke-linecap="round"/><path d="M40,90 C38,76 40,62 46,52 M52,90 C48,78 49,66 54,58" fill="none" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M46,38 C44,28 48,22 52,26 C52,18 58,16 60,22 C62,14 70,16 68,24 C74,22 78,28 72,32 C70,36 58,38 46,38 Z" fill="${c}" stroke="${_IL_O}" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M71,42 L84,46 L71,50 Z" fill="#f2b632" stroke="${_IL_O}" stroke-width="1.8" stroke-linejoin="round"/><path d="M68,52 C72,54 72,62 66,64 C64,60 64,56 68,52 Z" fill="${c}" stroke="${_IL_O}" stroke-width="1.8"/>
  <circle cx="62" cy="43" r="3" fill="${b}" stroke="${_IL_O}" stroke-width="1.4"/><circle cx="62.5" cy="43" r="1.5" fill="${_IL_O}"/>`,
 // Aotearoa Selection, taniwha water guardian drawn from koru spirals
 9017:({a,b,c})=>`<circle cx="50" cy="50" r="47" fill="${a}" stroke="${b}" stroke-width="3"/><circle cx="50" cy="50" r="41" fill="none" stroke="${c}" stroke-width="1.6"/>
  <path d="M18,78 C24,72 30,80 36,76 C42,72 48,80 54,76 C60,72 66,80 72,76 C76,74 80,76 84,78" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M26,70 C24,54 40,50 50,52 C60,54 70,48 70,36 C70,24 60,18 50,22 C42,25 42,36 50,36 C55,36 57,31 54,28" fill="none" stroke="${b}" stroke-width="8" stroke-linecap="round"/>
  <path d="M26,70 C24,54 40,50 50,52 C60,54 70,48 70,36 C70,24 60,18 50,22 C42,25 42,36 50,36 C55,36 57,31 54,28" fill="none" stroke="${a}" stroke-width="2" stroke-linecap="round" stroke-dasharray="1 5"/>
  <path d="M26,70 C28,78 36,82 44,78 C38,78 34,74 34,70" fill="none" stroke="${b}" stroke-width="6" stroke-linecap="round"/>
  ${[[60,52,30],[66,46,10],[71,38,-10],[40,52,60]].map(([x,y,r])=>`<path d="M${x},${y} l4,-9 l3,8 Z" transform="rotate(${r} ${x} ${y})" fill="${b}"/>`).join('')}
  <circle cx="62" cy="27" r="3.4" fill="${b}"/><circle cx="62" cy="27" r="1.5" fill="${a}"/><path d="M73,34 L82,30 L76,38 Z" fill="${b}"/>`,
 // Buenos Aires Pampas Cóndores, soaring condor over the Andes and a rayed sun
 9018:({a,b,c})=>`<circle cx="50" cy="50" r="47" fill="${a}" stroke="${_IL_O}" stroke-width="3"/><circle cx="50" cy="30" r="10" fill="${c}"/>${_ilRays(50,30,13,20,16,c,2.4)}
  <path d="M6,76 L26,54 L36,64 L50,46 L64,62 L74,52 L94,76 Z" fill="${b}" stroke="${_IL_O}" stroke-width="1.6" stroke-linejoin="round"/><path d="M26,54 L30,60 L24,61 Z M50,46 L55,54 L46,54 Z" fill="#dfe8f2"/>
  <path d="M48,52 C38,46 24,46 6,52 L12,55 L5,58 L13,60 L7,63 L16,64 C28,62 40,60 48,58 Z" fill="#1d1d22" stroke="${_IL_O}" stroke-width="2" stroke-linejoin="round"/><path d="M44,54 C34,52 24,53 14,56" stroke="#ffffff" stroke-width="2.4" fill="none" opacity=".85"/>
  <path d="M52,52 C62,46 76,46 94,52 L88,55 L95,58 L87,60 L93,63 L84,64 C72,62 60,60 52,58 Z" fill="#1d1d22" stroke="${_IL_O}" stroke-width="2" stroke-linejoin="round"/><path d="M56,54 C66,52 76,53 86,56" stroke="#ffffff" stroke-width="2.4" fill="none" opacity=".85"/>
  <path d="M44,50 C44,44 56,44 56,50 L56,64 C55,70 45,70 44,64 Z" fill="#1d1d22" stroke="${_IL_O}" stroke-width="2"/><ellipse cx="50" cy="48" rx="7" ry="3.2" fill="#ffffff" stroke="${_IL_O}" stroke-width="1.4"/>
  <circle cx="50" cy="42" r="4.5" fill="#b35a4a" stroke="${_IL_O}" stroke-width="1.6"/><path d="M50,44 L48,49 L52,49 Z" fill="#e8c35a"/><path d="M45,68 L42,76 L50,72 L58,76 L55,68 Z" fill="#1d1d22" stroke="${_IL_O}" stroke-width="1.6" stroke-linejoin="round"/>`,
 // Wien Alpine Steinböcke, ibex with ridged swept horns on red-white-red
 9019:({a,b,c})=>{const ridge=(s)=>[0,1,2,3,4].map(i=>`<path d="M${s.x0+i*s.dx},${s.y0+i*s.dy} l${s.lx},${s.ly}" stroke="${_IL_O}" stroke-width="1.4" opacity=".6"/>`).join('');
  return`<defs><clipPath id="ilc9019"><path d="M50,5 L90,18 L90,52 C90,74 72,90 50,97 C28,90 10,74 10,52 L10,18 Z"/></clipPath></defs>
  <path d="M50,5 L90,18 L90,52 C90,74 72,90 50,97 C28,90 10,74 10,52 L10,18 Z" fill="${a}" stroke="${_IL_O}" stroke-width="3"/><g clip-path="url(#ilc9019)"><rect x="0" y="38" width="100" height="26" fill="${b}"/></g>
  <path d="M44,36 C38,18 26,8 14,14 C24,14 32,24 38,38 Z" fill="#a8916a" stroke="${_IL_O}" stroke-width="2.2" stroke-linejoin="round"/>${ridge({x0:22,y0:14,dx:4,dy:4,lx:4,ly:-3})}
  <path d="M56,36 C62,18 74,8 86,14 C76,14 68,24 62,38 Z" fill="#a8916a" stroke="${_IL_O}" stroke-width="2.2" stroke-linejoin="round"/>${ridge({x0:78,y0:14,dx:-4,dy:4,lx:-4,ly:-3})}
  <path d="M34,40 L42,38 L40,46 Z M66,40 L58,38 L60,46 Z" fill="${c}" stroke="${_IL_O}" stroke-width="1.8"/>
  <path d="M41,36 C41,31 59,31 59,36 L57,62 C55,72 53,78 50,78 C47,78 45,72 43,62 Z" fill="#8e7a5f" stroke="${_IL_O}" stroke-width="2.4"/><path d="M47,40 L50,64 L53,40" fill="none" stroke="#c9b48e" stroke-width="2"/>
  <path d="M43,48 L48,50 L44,52 Z M57,48 L52,50 L56,52 Z" fill="${_IL_O}"/><ellipse cx="50" cy="73" rx="5" ry="3.5" fill="#5f513f"/>
  <path d="M46,77 L50,92 L54,77 Z" fill="${c}" stroke="${_IL_O}" stroke-width="1.6" stroke-linejoin="round"/>`;},
 // Roma Accademia Gladiatori, crested gladiator helmet inside a laurel wreath
 9020:({a,b,c})=>{let lv='';for(let i=0;i<7;i++){const t=0.55+i*0.32,x=50-Math.cos(t)*40,y=54+Math.sin(t)*38;lv+=_ilLeaf(x.toFixed(1),y.toFixed(1),(-t*57+70).toFixed(0),b)+_ilLeaf((100-x).toFixed(1),y.toFixed(1),(t*57-70).toFixed(0),b);}
  return`<circle cx="50" cy="50" r="47" fill="${a}" stroke="${_IL_O}" stroke-width="3"/>${lv}
  <path d="M34,30 C40,10 70,8 84,22 C76,20 66,22 58,30 Z" fill="${a}" stroke="${b}" stroke-width="2.4" stroke-linejoin="round"/><path d="M42,24 C50,16 64,14 76,18" fill="none" stroke="${b}" stroke-width="1.4"/>
  <path d="M28,58 C28,38 40,28 56,28 C70,28 78,40 78,54 L80,62 L66,62 L66,70 L76,72 L74,80 L44,80 C34,78 28,70 28,58 Z" fill="${b}" stroke="${_IL_O}" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M58,40 L76,40 L76,58 L58,58 Z" fill="${_IL_O}" opacity=".8"/>${[0,1,2].map(i=>[0,1,2].map(j=>`<circle cx="${62+i*5.5}" cy="${44+j*5.5}" r="1.6" fill="${b}"/>`).join('')).join('')}
  <path d="M30,62 C38,66 48,66 54,62" fill="none" stroke="${_IL_O}" stroke-width="1.6" opacity=".5"/><path d="M32,46 C34,38 40,34 46,32" fill="none" stroke="#ffffff" stroke-width="2" opacity=".55"/>`;}
};
function intlLogoSvg(s,sz){const f=INTL_LOGO[s.id];if(!f)return null;
  const ck='intl|'+s.id+'|'+s.c1+'|'+s.c2+'|'+(s.c3||'')+'|'+(sz>44?1:0),hit=_LGC.get(ck);if(hit)return hit.split('__SZ__').join(sz);
  const a=_hx(s.c1)?s.c1:'#33415c',b=_hx(s.c2)?s.c2:'#ffffff',c=_hx(s.c3||'')?s.c3:_mx(a,'#000000',.4);
  const id=_lgf(_lm(b)>.5?b:'#f2f4f7',sz>44),out=`<svg width="__SZ__" height="__SZ__" viewBox="0 0 100 100" class="lg" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;overflow:visible"><g filter="url(#${id})"><g transform="translate(4 4) scale(.92)">${f({a,b,c})}</g></g></svg>`;
  _LGC.set(ck,out);return out.split('__SZ__').join(sz);}
function sLogo(s,sz=28){
  _lgFonts();
  if(!s)return'';
  if(s.customLogo)return`<svg width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}"><image href="${s.customLogo}" x="0" y="0" width="${sz}" height="${sz}" preserveAspectRatio="xMidYMid meet"/></svg>`;
  if(s.intl&&s.intl!=='US'&&INTL_LOGO[s.id]){const L=intlLogoSvg(s,sz);if(L)return L;}
  const ck=[s.name,s.mascot,s.c1,s.c2,s.cls||'',sz>44?1:0,s.logoKey||'',s.mash||''].join('|'),hit=_LGC.get(ck);if(hit)return hit.split('__SZ__').join(sz);
  let _st='CF';try{_st=s.cls?clsSt(s.cls):'CF';}catch(e){}_LGcur=_ST_GLYPHS[_st]||null;
  try{return _sLogoBody(s,sz,ck);}finally{_LGcur=null;}
}
function _sLogoBody(s,sz,ck){
  let c1=_hx(s.c1)?s.c1:'#33415c',c2=_hx(s.c2)?s.c2:'#ffffff';
  const h=[...(s.name||'')+'|'+(s.mascot||'')].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7),h2=h>>>7,h3=h>>>13;
  if(h2%4===3){const t=c1;c1=c2;c2=t;}
  if(Math.abs(_lm(c1)-_lm(c2))<.28)c2=_lm(c1)>.5?'#141b24':'#f2f4f7';
  const ini=((s.name||s.mascot||'?').match(/[A-Za-z]/)||['?'])[0].toUpperCase();
  const P={var:(h>>>11)%2,F:c1,K:_lm(c1)>.45?_mx(c1,'#000000',.7):'#f4f6f8',L:_mx(c1,'#ffffff',.42),D:_mx(c1,'#000000',.4),A:Math.abs(_lm(c1)-_lm('#f0b72f'))<.22?c2:'#f0b72f',O:'#0b1118',ch:ini};
  const rm=['shade','shade','shade','flat','flat','mono'][(h>>>9)%6];if(rm==='mono'){P.L=c2;P.A=c2;P.D=_mx(c1,'#000000',.35);}
  const mk=(s.mascot||'').toLowerCase(),key=(s.logoKey&&_LGO[s.logoKey])?[s.logoKey,'']:_LK[mk],tc=_lm(c2)<.4?_mx(c2,'#ffffff',.6):c2;
  const FONT="font-family=\"'Alfa Slab One',Impact,'Arial Black',sans-serif\"";
  let body;
  const small=sz<=44,up=t=>String(t||'').toUpperCase();
  const words=(s.name||'').replace(/\bHigh\b/ig,' ').trim().split(/\s+/).filter(w=>/[A-Za-z]/.test(w));
  const two=(words.length>1?(words[0][0]+words[1][0]):(ini+'H')).toUpperCase();
  const word=up(s.mascot||''),scr=(s.mascot||'').charAt(0).toUpperCase()+(s.mascot||'').slice(1).toLowerCase();
  const TX=(x,y,fs,t,ex)=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="${fs}" font-weight="400" fill="${c1}" ${ex||''}>${t}</text>`;
  let k='',mas='';
  if(key){k=key[0];let v=key[1];const alts=s.logoKey?null:_ALT[mk];if(alts&&h3%3===0){k=alts[(h3>>>2)%alts.length];v='';}
    let PP=P;if(v==='polar')PP=Object.assign({},P,{F:'#eef2f6',L:'#ffffff',D:'#aebbc8',K:'#1b2430'});else if(v==='zebra')PP=Object.assign({},P,{F:'#f2f2f2',L:'#ffffff',D:'#17191c',K:'#111111'});else if(v==='raven')PP=Object.assign({},P,{F:'#23262d',L:'#5a6170',D:'#0d0e11',K:'#f4f6f8'});
    mas=_LGO[k](PP,v);if(_FLIP.has(k)&&(h3>>>4)%2)mas=`<g transform="${_MR}">${mas}</g>`;
    if(rm==='shade'&&PP!==P&&PP.F!==c1)mas=mas.split(`fill="${PP.F}"`).join(`fill="url(#${_lgG(PP.F)})"`);}
  let sty=['block','block','inter','outline','word','head','head','head','letter','script','stack','tag'][h%12];
  if(!key&&!['block','inter'].includes(sty))sty=(h>>>3)%2?'block':'inter';
  if(!key&&!['block','inter','outline','stack'].includes(sty))sty=(h>>>3)%2?'block':'inter';
  if(small&&['word','script','stack','tag'].includes(sty))sty=key?'head':'block';
  if(k==='paw'||k==='claw')sty=small?'head':(sty==='word'?'word':'head');
  if(s.logoKey&&_LGO[s.logoKey])sty='head';
  const ol=(g)=>g.replace(/fill="[^"]*" stroke="[^"]*" stroke-width="[^"]*"/,`fill="${P.O}" stroke="${P.O}" stroke-width="20"`);
  const sw1=(words[0]||s.name||'').toUpperCase().slice(0,12);
  if(sty==='block')body=_gt(ini,50,92,96,94,c1);
  else if(sty==='outline')body=_gt(ini,50,92,96,94,c1,30)+_gt(ini,50,92,96,94,tc,4);
  else if(sty==='stack')body=_gt(sw1,50,40,24,94,c1,8)+_gt(word||ini,50,84,36,96,c1,9)+`<path d="M8,51 L92,51" stroke="${c1}" stroke-width="5" stroke-linecap="round"/>`;
  else if(sty==='tag')body=`<g transform="translate(2 0) scale(.8)">${mas}</g>`+_gt(two,78,96,24,36,tc,8);
  else if(sty==='inter'){const g2=_gt(two[1],63,95,70,60,c1);body=_gt(two[0],38,80,82,70,c1)+ol(g2)+g2;}
  else if(sty==='word')body=`<g transform="translate(19 0) scale(.62)">${mas}</g>`+_gt(word,50,98,22,94,c1,8);
  else if(sty==='script')body=`<text class="scr" x="50" y="62" text-anchor="middle" font-size="44" fill="${c1}" textLength="90" lengthAdjust="spacingAndGlyphs" transform="rotate(-7 50 55)">${scr}</text><path d="M10,78 C36,90 68,86 94,66" fill="none" stroke="${c1}" stroke-width="5.5" stroke-linecap="round"/>`;
  else if(sty==='letter')body=_gt(ini,50,94,104,96,tc)+`<g transform="translate(15 4) scale(.72)">${mas}</g>`;
  else body=`<g transform="translate(8 7) scale(.84)">${mas}</g>`;
  // v2.16 mascot mashup: a second icon as a badge on the logo
  if(s.mash&&_LGO[s.mash]){try{const P2=Object.assign({},P,{F:c2,L:_mx(c2,'#ffffff',.42),D:_mx(c2,'#000000',.4),K:_lm(c2)>.45?_mx(c2,'#000000',.7):'#f4f6f8'});body+=`<g transform="translate(56 56) scale(.46)">${_LGO[s.mash](P2,'')}</g>`;}catch(e){}}
  if(rm==='shade')body=body.split(`fill="${c1}"`).join(`fill="url(#${_lgG(c1)})"`);
  const big=sz>44,id=_lgf(c2,big);
  const bb=_lgm(body);let tf='';
  if(bb){const SK={anchor:10,cyclone:11,buck:8,axes:7,wheel:9,swords:9,pirate:7,ram:8,hornet:5,tractor:4,stingray:4,dolphin:3,marlin:3,shark:3};const pad=Math.max(sty==='outline'?15:['block','inter','stack','letter','tag','word'].includes(sty)?4:0,SK[k]||0);const sc=Math.min(1.2,(84-2*pad)/Math.max(bb.width,bb.height,1));tf=`translate(${(50-(bb.x+bb.width/2)*sc).toFixed(2)} ${(50-(bb.y+bb.height/2)*sc).toFixed(2)}) scale(${sc.toFixed(3)})`;}
  const out=`<svg width="__SZ__" height="__SZ__" viewBox="0 0 100 100" class="lg" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;overflow:visible"><g filter="url(#${id})"><g transform="${tf}">${body}</g></g></svg>`;
  _LGC.set(ck,out);return out.split('__SZ__').join(sz);
}

function fmtDate(idx){if(!GAME_DATES[idx])return'';const d=GAME_DATES[idx];const mn=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];return`${mn[d.getMonth()]} ${d.getDate()}`;}

function _fmx(a,b,t){const h=c=>{c=c.replace('#','');if(c.length===3)c=c.split('').map(x=>x+x).join('');return[0,2,4].map(i=>parseInt(c.substr(i,2),16));};const A=h(a),B=h(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('');}
function _faceTeam(seed){try{if(typeof G==='undefined'||!G||!G.players)return null;let p=G.players.find(x=>x.fs===seed);if(!p)p=(G.hofArchive||[]).find(x=>x.fs===seed)||(G.wlArchive||[]).find(x=>x.fs===seed);if(!p)return null;const s=getS(p.sId);return s&&/^#[0-9a-f]{3,6}$/i.test(s.c1||'')&&/^#[0-9a-f]{3,6}$/i.test(s.c2||'')?{c1:s.c1,c2:s.c2}:null;}catch(e){return null;}}
const FACE_SKIN=['#f3d2b8','#ebbf9e','#ddab85','#c99069','#b0774f','#93603d','#74482c','#56331f'];
// v2.15: a player edited in Edit Player carries p.look; G.looks maps his face seed to it so every face() call shows it
function lookOf(seed){if(window._lkRaw)return null;try{const a=typeof G!=='undefined'&&G&&G.looks&&G.looks[seed];if(a)return a;
  const f=typeof FP!=='undefined'&&FP&&FP.store&&FP.store.looks&&FP.store.looks[seed];return f||null;}catch(e){return null;}}
function face(seed,sz=48,o){
  o=o||null;{const L=(o&&o.coach)?null:lookOf(seed);if(L)o=Object.assign({},L,o||{});}
  seed=(typeof seed==='number'&&isFinite(seed))?seed:Math.abs(String(seed||'x').split('').reduce((a,c)=>a*31+c.charCodeAt(0)|0,7));
  let st=(Math.imul(seed^0x5bd1e995,2654435761)>>>0)||1;
  const r=()=>{st=(st+0x6D2B79F5)|0;let t=Math.imul(st^(st>>>15),1|st);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};
  const id='fc'+seed+(o?'x'+(window._FCN=(window._FCN||0)+1):''),f1=v=>v.toFixed(1);
  let ti=Math.floor(r()*FACE_SKIN.length);if(o&&o.ti!=null)ti=Math.max(0,Math.min(FACE_SKIN.length-1,o.ti));const sk=FACE_SKIN[ti];
  const skL=_fmx(sk,'#ffffff',.14),skD=_fmx(sk,'#000000',.24),skDD=_fmx(sk,'#000000',.45);
  const dark=ti>=4;
  let hc=dark?['#141010','#1b1511','#241a14','#2e2119','#141010','#1b1511','#3a2a1e','#c9a25a'][Math.floor(r()*8)]:['#0e0b09','#1b1511','#2e2119','#3d2c1e','#4a3020','#5c4128','#6b4a2b','#8a6a46','#a07a46','#b89a64','#c49a5c','#d8c08a','#ece0b8','#9c4a22','#b5562e','#7a3b1e','#6b5a4a','#2e2119'][Math.floor(r()*18)];if(o&&o.hc)hc=o.hc;
  const hcL=_fmx(hc,'#ffffff',.2),hcD=_fmx(hc,'#000000',.35);
  let eyeC=ti<=2&&r()<.45?['#4a6fa5','#5b7f5a','#6e7f86','#7a5a32'][Math.floor(r()*4)]:['#3a2416','#4b2e1a','#2b1a10','#5a3a22'][Math.floor(r()*4)];if(o&&o.eye)eyeC=o.eye;
  const tm=(o&&o.c1)?{c1:o.c1,c2:o.c2||'#ffffff'}:_faceTeam(seed)||{c1:['#1d3557','#7a1f2b','#1b4332','#3c2a6e','#222'][seed%5],c2:'#e8e8e8'};
  const top=21+r()*3,hw=15.6+r()*2.6,jaw=hw*(.6+r()*.22),chinY=67+r()*3,cheekY=47,hl=top+9+r()*2.4;
  const head=`M50,${f1(top)} C${f1(50+hw*.95)},${f1(top)} ${f1(50+hw+1.2)},${f1(top+10)} ${f1(50+hw)},${cheekY} C${f1(50+hw-.4)},${cheekY+7} ${f1(50+jaw+2.5)},${f1(chinY-7)} ${f1(50+jaw*.5)},${f1(chinY-1.2)} Q50,${f1(chinY+1.2)} ${f1(50-jaw*.5)},${f1(chinY-1.2)} C${f1(50-jaw-2.5)},${f1(chinY-7)} ${f1(50-hw+.4)},${cheekY+7} ${f1(50-hw)},${cheekY} C${f1(50-hw-1.2)},${f1(top+10)} ${f1(50-hw*.95)},${f1(top)} 50,${f1(top)}Z`;
  let s=`<defs><radialGradient id="${id}g" cx=".42" cy=".36" r=".78"><stop offset="0" stop-color="${skL}"/><stop offset=".58" stop-color="${sk}"/><stop offset="1" stop-color="${skD}"/></radialGradient>
   <linearGradient id="${id}n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${skDD}"/><stop offset=".45" stop-color="${skD}"/><stop offset="1" stop-color="${sk}"/></linearGradient>
   <linearGradient id="${id}j" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${_fmx(tm.c1,'#ffffff',.12)}"/><stop offset="1" stop-color="${_fmx(tm.c1,'#000000',.3)}"/></linearGradient>
   <clipPath id="${id}h"><path d="${head}"/></clipPath></defs>`;
  const TX=[3,4,5,6,11,12,13,17,18,20,24,25,26,30,0,1,2,8,9,22],ST=[0,1,2,7,10,14,15,16,19,20,13,9,21,22,23,24,27,28,29],pr=r(),pool=(ti>=4?(pr<.82?TX:ST):ti<=1?(pr<.86?ST:TX):(pr<.5?TX:ST));
  let hs=pool[Math.floor(r()*pool.length)];if(o&&o.hs!=null)hs=o.hs;else hs=hsVariant(hs,seed);
  // back hair (long flow)
  if(hs===17){let d='';const cx=50,cy=top+10,rx=hw+8.5,ry=20,nb=22;for(let i=0;i<=nb;i++){const a=Math.PI*2*i/nb,am=Math.PI*2*(i-.5)/nb;const x=cx+rx*Math.cos(a),y=cy+ry*Math.sin(a);if(i===0)d=`M${f1(x)},${f1(y)}`;else d+=` Q${f1(cx+(rx+2.4)*Math.cos(am))},${f1(cy+(ry+2.4)*Math.sin(am))} ${f1(x)},${f1(y)}`;}s+=`<path d="${d}Z" fill="${hcD}"/>`;}
  if(hs===29)s+=`<path d="M${f1(50-hw-3)},${f1(chinY+10)} C${f1(50-hw-6)},${f1(top+4)} ${f1(50-hw*.4)},${f1(top-4)} 50,${f1(top-4)} C${f1(50+hw*.4)},${f1(top-4)} ${f1(50+hw+6)},${f1(top+4)} ${f1(50+hw+3)},${f1(chinY+10)} L${f1(50+hw-1)},${f1(chinY+12)} L${f1(50-hw+1)},${f1(chinY+12)}Z" fill="${hcD}"/>`;
  if(hs===16)s+=`<path d="M${f1(50-hw+1)},${f1(cheekY+1)} C${f1(50-hw)},${f1(chinY+2)} ${f1(50-11)},${f1(chinY+9)} ${f1(50-9)},${f1(chinY+11)} L${f1(50+9)},${f1(chinY+11)} C${f1(50+11)},${f1(chinY+9)} ${f1(50+hw)},${f1(chinY+2)} ${f1(50+hw-1)},${f1(cheekY+1)}Z" fill="${hcD}"/>`;
  if(hs===14)s+=`<path d="M${f1(50-hw-3)},${f1(cheekY+3)} C${f1(50-hw-5)},${f1(top+2)} ${f1(50-hw*.4)},${f1(top-5)} 50,${f1(top-5)} C${f1(50+hw*.4)},${f1(top-5)} ${f1(50+hw+5)},${f1(top+2)} ${f1(50+hw+3)},${f1(cheekY+3)} L${f1(50+hw-2)},${f1(cheekY)} L${f1(50-hw+2)},${f1(cheekY)}Z" fill="${hcD}"/>`;
  if(hs===10)s+=`<path d="M${f1(50-hw-3)},${f1(cheekY+10)} C${f1(50-hw-5)},${f1(top+2)} ${f1(50-hw*.4)},${f1(top-4)} 50,${f1(top-4)} C${f1(50+hw*.4)},${f1(top-4)} ${f1(50+hw+5)},${f1(top+2)} ${f1(50+hw+3)},${f1(cheekY+10)} L${f1(50+hw-2)},${f1(cheekY+8)} L${f1(50-hw+2)},${f1(cheekY+8)}Z" fill="${hcD}"/>`;
  // shoulders + jersey
  s+=`<path d="M3,100 C5,86 21,79 35,77 L65,77 C79,79 95,86 97,100Z" fill="url(#${id}j)"/>`;
  s+=`<path d="M22,82 Q27,90 25,100 M78,82 Q73,90 75,100" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="1"/>`;
  // neck
  s+=`<path d="M${f1(50-8.5)},${f1(chinY-9)} L${f1(50-9.6)},79 Q50,90 ${f1(50+9.6)},79 L${f1(50+8.5)},${f1(chinY-9)}Z" fill="url(#${id}n)"/>`;
  if(o&&o.coach)s+=`<path d="M36,77 L44,90 L50,80 Z M64,77 L56,90 L50,80 Z" fill="${tm.c2}" stroke="#000" stroke-opacity=".2" stroke-width=".6"/><path d="M50,82 L50,96" stroke="#000" stroke-opacity=".25" stroke-width=".8"/><circle cx="50" cy="86" r=".9" fill="${tm.c2}"/><circle cx="50" cy="91" r=".9" fill="${tm.c2}"/>`;
  else s+=`<path d="M36,77.4 Q50,92 64,77.4" fill="none" stroke="${tm.c2}" stroke-width="3.2" stroke-linecap="round"/>`;
  if(hs===11||hs===12){const n=hs===11?7:9,len=hs===11?36:40,wd=hs===11?3:2.2;
    [-1,1].forEach(d=>{for(let i=0;i<n;i++){const x0=50+d*(hw*.35+i*(hw*.75/n)),y0=top+2+i*1.2,x1=50+d*(hw+1+i*.9+r()*1.5),y1=y0+len-i*1.6+r()*3;
      const pth=`M${f1(x0)},${f1(y0)} Q${f1(50+d*(hw+3))},${f1(y0+len*.35)} ${f1(x1)},${f1(y1)}`;
      s+=`<path d="${pth}" fill="none" stroke="${i%2?hc:hcD}" stroke-width="${wd}" stroke-linecap="round"/>`;
      if(hs===12)s+=`<path d="${pth}" fill="none" stroke="${hcL}" stroke-opacity=".35" stroke-width="${wd*.55}" stroke-dasharray="1.4 1.2"/>`;
      else s+=`<path d="${pth}" fill="none" stroke="${hcL}" stroke-opacity=".18" stroke-width=".7"/>`;}});}
  // ears
  [-1,1].forEach(d=>{const ex=50+d*(hw+.2);s+=`<ellipse cx="${f1(ex)}" cy="49.5" rx="2.9" ry="5.3" fill="${sk}"/><path d="M${f1(ex-d*.2)},46.5 Q${f1(ex+d*1.3)},49.5 ${f1(ex-d*.1)},53" fill="none" stroke="${skDD}" stroke-opacity=".45" stroke-width=".8"/>`;});
  // head
  s+=`<path d="${head}" fill="url(#${id}g)"/>`;
  s+=`<g clip-path="url(#${id}h)"><ellipse cx="50" cy="${f1(chinY+3)}" rx="${f1(jaw+5)}" ry="6" fill="#000" opacity=".1"/>`;
  [-1,1].forEach(d=>{s+=`<path d="M${f1(50+d*(hw-2))},${cheekY+1} Q${f1(50+d*(hw-4.6))},${cheekY+9} ${f1(50+d*jaw)},${f1(chinY-6)}" fill="none" stroke="${skDD}" stroke-opacity=".16" stroke-width="3.2" stroke-linecap="round"/>`;});
  s+=`<ellipse cx="47" cy="${f1(top+9)}" rx="8" ry="3.4" fill="#fff" opacity=".1"/>`;
  // facial hair (young players: mostly none)
  let fh=r();if(o&&o.fh)fh={none:.99,stubble:.1,mustache:.3,goatee:.38,beard:.99}[o.fh]||.99;if(fh<.24)s+=`<path d="M${f1(50-jaw-2)},${f1(chinY-9)} Q50,${f1(chinY+4)} ${f1(50+jaw+2)},${f1(chinY-9)} L${f1(50+jaw*.6)},${f1(chinY-6)} Q50,${f1(chinY-1)} ${f1(50-jaw*.6)},${f1(chinY-6)}Z" fill="${hc}" opacity=".13"/>`;
  s+=`</g>`;
  // eyes
  const ex=7.2+r()*1.3,ey=46.3,es=3.8+r()*.6,tilt=(r()-.5)*1.1,gz=(r()-.5)*.6;
  [-1,1].forEach((d,i)=>{const x=50+d*ex,cid=id+'e'+i;
    s+=`<ellipse cx="${f1(x)}" cy="${f1(ey-2.4)}" rx="${f1(es+1.4)}" ry="2.6" fill="${skDD}" opacity=".13"/>`;
    const al=`M${f1(x-es)},${f1(ey+d*tilt*.2)} Q${f1(x)},${f1(ey-es*.75)} ${f1(x+es)},${f1(ey-d*tilt*.2)} Q${f1(x)},${f1(ey+es*.55)} ${f1(x-es)},${f1(ey+d*tilt*.2)}Z`;
    s+=`<clipPath id="${cid}"><path d="${al}"/></clipPath><path d="${al}" fill="#f2ede6"/><g clip-path="url(#${cid})"><circle cx="${f1(x+gz)}" cy="${f1(ey+.1)}" r="${f1(es*.48)}" fill="${eyeC}"/><circle cx="${f1(x+gz)}" cy="${f1(ey+.1)}" r="${f1(es*.22)}" fill="#0c0c0c"/><circle cx="${f1(x+gz-.7)}" cy="${f1(ey-.7)}" r=".55" fill="#fff"/><path d="M${f1(x-es)},${f1(ey-1)} Q${f1(x)},${f1(ey-es*.9)} ${f1(x+es)},${f1(ey-1)}" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="1.2"/></g>`;
    s+=`<path d="M${f1(x-es-.4)},${f1(ey+.1+d*tilt*.2)} Q${f1(x)},${f1(ey-es*.86)} ${f1(x+es+.4)},${f1(ey-d*tilt*.2)}" fill="none" stroke="#1a1210" stroke-width="1.05" stroke-linecap="round"/>`;
    s+=`<path d="M${f1(x-es+.8)},${f1(ey+es*.5)} Q${f1(x)},${f1(ey+es*.72)} ${f1(x+es-.8)},${f1(ey+es*.45)}" fill="none" stroke="${skDD}" stroke-opacity=".28" stroke-width=".6"/>`;
  });
  const by=ey-5.8-r()*.7,bw=1.3+r()*1.1,ba=(r()-.5)*1.6;
  [-1,1].forEach(d=>{const x=50+d*ex,i=x-d*(es+.6),o=x+d*(es+.9);s+=`<path d="M${f1(i)},${f1(by+.6+ba*.3)} Q${f1(x)},${f1(by-1.5)} ${f1(o)},${f1(by+.6-ba*.2)}" fill="none" stroke="${_fmx(hc,'#000000',.1)}" stroke-width="${f1(bw)}" stroke-linecap="round"/>`;});
  if(r()<.2&&!(o&&o.coach))[-1,1].forEach(d=>{const x=50+d*ex;s+=`<rect x="${f1(x-3.4)}" y="${f1(ey+3.6)}" width="6.8" height="2.2" rx=".6" fill="#111" opacity=".88"/>`;});
  // nose
  const nw=3.1+r()*1.6,ny=56+r()*1.4;
  s+=`<path d="M48.4,47.5 Q47.4,${f1(ny-4)} ${f1(50-nw)},${f1(ny-.4)}" fill="none" stroke="${skDD}" stroke-opacity=".3" stroke-width=".9"/><ellipse cx="50" cy="${f1(ny-1.8)}" rx="1.5" ry="1.1" fill="#fff" opacity=".14"/>`;
  s+=`<path d="M${f1(50-nw)},${f1(ny)} Q50,${f1(ny+2.7)} ${f1(50+nw)},${f1(ny)}" fill="none" stroke="${skDD}" stroke-opacity=".65" stroke-width=".9" stroke-linecap="round"/>`;
  [-1,1].forEach(d=>{s+=`<ellipse cx="${f1(50+d*nw*.5)}" cy="${f1(ny+.7)}" rx=".95" ry=".55" fill="${skDD}" opacity=".6"/>`;});
  // mouth
  const my=62.6+r()*1.2,mw=5+r()*1.7,sm=(r()-.35)*1.1,lip=_fmx(sk,'#9c4a46',.33);
  s+=`<path d="M${f1(50-mw)},${f1(my)} Q${f1(50-mw*.45)},${f1(my-1.7)} 50,${f1(my-.8)} Q${f1(50+mw*.45)},${f1(my-1.7)} ${f1(50+mw)},${f1(my)} Q50,${f1(my+.4)} ${f1(50-mw)},${f1(my)}Z" fill="${_fmx(lip,'#000000',.14)}"/>`;
  s+=`<path d="M${f1(50-mw+.6)},${f1(my+.2)} Q50,${f1(my+3.6)} ${f1(50+mw-.6)},${f1(my+.2)} Q50,${f1(my+1)} ${f1(50-mw+.6)},${f1(my+.2)}Z" fill="${lip}"/>`;
  s+=`<path d="M${f1(50-mw)},${f1(my-sm*.4)} Q50,${f1(my+.7)} ${f1(50+mw)},${f1(my-sm*.4)}" fill="none" stroke="${skDD}" stroke-opacity=".7" stroke-width=".75" stroke-linecap="round"/><ellipse cx="50" cy="${f1(my+5.6)}" rx="3.2" ry="1.2" fill="#000" opacity=".1"/>`;
  if(fh>=.24&&fh<.34)s+=`<path d="M${f1(50-mw-.5)},${f1(my-1.3)} Q50,${f1(my-3.6)} ${f1(50+mw+.5)},${f1(my-1.3)} Q50,${f1(my-2.1)} ${f1(50-mw-.5)},${f1(my-1.3)}Z" fill="${hc}" opacity=".8"/>`;
  if(fh>=.34&&fh<.42)s+=`<path d="M46,${f1(my+2.6)} Q50,${f1(my+9.5)} 54,${f1(my+2.6)} Q50,${f1(my+5)} 46,${f1(my+2.6)}Z" fill="${hc}" opacity=".85"/><path d="M${f1(50-mw-.5)},${f1(my-1.3)} Q50,${f1(my-3.4)} ${f1(50+mw+.5)},${f1(my-1.3)} Q50,${f1(my-2.1)} ${f1(50-mw-.5)},${f1(my-1.3)}Z" fill="${hc}" opacity=".8"/>`;
  // hair
  const cap=(lift,op)=>`<path d="M${f1(50-hw-.3)},${f1(hl+6.5)} C${f1(50-hw-1.2)},${f1(top+3-lift)} ${f1(50-hw*.6)},${f1(top-1.2-lift)} 50,${f1(top-1.2-lift)} C${f1(50+hw*.6)},${f1(top-1.2-lift)} ${f1(50+hw+1.2)},${f1(top+3-lift)} ${f1(50+hw+.3)},${f1(hl+6.5)} C${f1(50+hw-3)},${f1(hl)} ${f1(55)},${f1(hl-1)} 50,${f1(hl-1)} C45,${f1(hl-1)} ${f1(50-hw+3)},${f1(hl)} ${f1(50-hw-.3)},${f1(hl+6.5)}Z" fill="${hc}" opacity="${op}"/>`;
  const sheen=`<ellipse cx="46" cy="${f1(top+2)}" rx="6.5" ry="1.8" fill="#fff" opacity=".1"/>`;
  const mass=(lift,drop,amp,nb,fr,cyAdj)=>{const L=50-hw-1.3,R=50+hw+1.3,yS=hl+5+drop,cy=hl+3+(cyAdj||0),rx=hw+1.5,ry=cy-(top-1.5-lift);let d=`M${f1(L)},${f1(yS)} L${f1(50-rx)},${f1(cy)}`;
    for(let i=0;i<nb;i++){const a0=Math.PI*(1-i/nb),a1=Math.PI*(1-(i+1)/nb),am=(a0+a1)/2;d+=` Q${f1(50+(rx+amp)*Math.cos(am))},${f1(cy-(ry+amp)*Math.sin(am))} ${f1(50+rx*Math.cos(a1))},${f1(cy-ry*Math.sin(a1))}`;}
    d+=` L${f1(R)},${f1(yS)}`;
    if(fr){const n=9;let px=R;for(let i=1;i<=n;i++){const x=R-(R-L)*i/n,xm=(px+x)/2;d+=` Q${f1(xm)},${f1(hl+1+fr)} ${f1(x)},${f1(hl+(i===n?yS-hl:0)+.5)}`;px=x;}}
    else d+=` C${f1(50+hw-3)},${f1(hl)} 55,${f1(hl-1)} 50,${f1(hl-1)} C45,${f1(hl-1)} ${f1(50-hw+3)},${f1(hl)} ${f1(L)},${f1(yS)}`;
    return`<path d="${d}Z" fill="${hc}"/>`;};
  const curls=(n,y0,y1,w)=>{let c='';for(let i=0;i<n;i++){const x=50+(r()*2-1)*w,y=y0+r()*(y1-y0);c+=`<path d="M${f1(x-1.4)},${f1(y)} q1.4,-1.8 2.8,0" fill="none" stroke="${hcL}" stroke-opacity=".38" stroke-width=".6" stroke-linecap="round"/><path d="M${f1(x-1)},${f1(y+1)} q1,1.2 2,0" fill="none" stroke="${hcD}" stroke-opacity=".5" stroke-width=".55" stroke-linecap="round"/>`;}return c;};
  // v2.17 lineups and cornrow variations: a crisp edge-up along the hairline, braided rows straight back, zig-zag, swept to the side, over a fade
  const lineup=()=>`<path d="M${f1(50-hw*.86)},${f1(hl+4.2)} L${f1(50-hw*.86)},${f1(hl+.4)} Q${f1(50-hw*.84)},${f1(hl-.3)} ${f1(50-hw*.62)},${f1(hl-.3)} L${f1(50+hw*.62)},${f1(hl-.3)} Q${f1(50+hw*.84)},${f1(hl-.3)} ${f1(50+hw*.86)},${f1(hl+.4)} L${f1(50+hw*.86)},${f1(hl+4.2)}" fill="none" stroke="${hcD}" stroke-width="1.1" stroke-linejoin="miter"/>`;
  const rows=(n,shape)=>{let c='';for(let i=0;i<n;i++){const u=n>1?i/(n-1):.5,x0=50-hw*.66+u*hw*1.32;let d;
      if(shape==='zig'){d=`M${f1(x0)},${f1(hl-.4)}`;for(let k=1;k<=5;k++)d+=` L${f1(x0+(k%2?1.6:-1.6))},${f1(hl-.4-(hl-top+1)*k/5)}`;}
      else if(shape==='side'){d=`M${f1(x0)},${f1(hl-.4)} Q${f1(x0+hw*.55)},${f1((hl+top)/2)} ${f1(x0+hw*.9)},${f1(top+1)}`;}
      else d=`M${f1(x0)},${f1(hl-.4)} Q${f1(x0+(x0-50)*.15)},${f1((hl+top)/2)} ${f1(x0+(x0-50)*.35)},${f1(top-1)}`;
      c+=`<path d="${d}" fill="none" stroke="${hc}" stroke-width="2.6" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${hcL}" stroke-opacity=".45" stroke-width="1.1" stroke-dasharray="1.2 1.1" stroke-linecap="round"/>`;}return c;};
  if(hs===31)s+=cap(0,.45)+`<path d="M${f1(50-hw*.8)},${f1(hl+.8)} C${f1(50-hw*.85)},${f1(top-4)} ${f1(50+hw*.85)},${f1(top-4)} ${f1(50+hw*.8)},${f1(hl+.8)} Z" fill="${hc}"/>`+sheen+lineup();
  else if(hs===32){s+=cap(1.2,.97)+lineup();for(let i=0;i<4;i++)s+=`<path d="M${f1(50-hw*.7)},${f1(top+1+i*2.6)} Q${f1(50-hw*.35)},${f1(top-1+i*2.6)} 50,${f1(top+1+i*2.6)} T${f1(50+hw*.7)},${f1(top+1+i*2.6)}" fill="none" stroke="${hcL}" stroke-opacity=".34" stroke-width=".8"/>`;}
  else if(hs===33)s+=cap(.4,.85)+rows(6,'back');
  else if(hs===34)s+=cap(.4,.85)+rows(5,'zig');
  else if(hs===35)s+=cap(.4,.85)+rows(6,'side');
  else if(hs===36)s+=cap(0,.38)+rows(4,'back')+lineup();
  else if(hs===0)s+=cap(0,.72);
  else if(hs===1)s+=cap(2.5,.97)+sheen+[-1,1].map(d=>`<rect x="${f1(d<0?50-hw-.2:50+hw-2.2)}" y="${f1(hl+4)}" width="2.4" height="6" fill="${hc}" opacity=".9"/>`).join('');
  else if(hs===2)s+=cap(0,.42)+`<path d="M${f1(50-hw*.78)},${f1(hl+.5)} C${f1(50-hw*.85)},${f1(top-7)} ${f1(50+hw*.85)},${f1(top-7)} ${f1(50+hw*.78)},${f1(hl+.5)} C55,${f1(hl-2)} 45,${f1(hl-2)} ${f1(50-hw*.78)},${f1(hl+.5)}Z" fill="${hc}"/>`+sheen;
  else if(hs===3){s+=cap(0,.5)+mass(5,-1,1.6,14,0,-1)+curls(14,top-3,hl-1,hw*.75);}
  else if(hs===4){s+=cap(1.5,.97);for(let i=0;i<4;i++)s+=`<path d="M${f1(50-hw*.7)},${f1(top+1+i*2.6)} Q${f1(50-hw*.35)},${f1(top-1+i*2.6)} 50,${f1(top+1+i*2.6)} T${f1(50+hw*.7)},${f1(top+1+i*2.6)}" fill="none" stroke="${hcL}" stroke-opacity=".32" stroke-width=".7"/>`;}
  else if(hs===5){s+=cap(1,.97);for(let i=-2;i<=2;i++)s+=`<path d="M${f1(50+i*4.2)},${f1(hl-.5)} Q${f1(50+i*4.8)},${f1(top+2)} ${f1(50+i*5.4)},${f1(top-1)}" fill="none" stroke="${hcD}" stroke-opacity=".7" stroke-width="1"/>`;}
  else if(hs===6){s+=mass(3.5,0,.8,10,1.6);for(let i=0;i<11;i++){const x=50-hw*.8+i*(hw*1.6/10);s+=`<path d="M${f1(x)},${f1(top-1)} L${f1(x+(r()-.5)*1.2)},${f1(hl+2.2)}" stroke="${i%2?hcD:hcL}" stroke-opacity=".55" stroke-width="1.3" stroke-linecap="round" stroke-dasharray="1.4 1"/>`;}}
  else if(hs===7){s+=cap(2.2,.97)+`<path d="M${f1(50-hw*.9)},${f1(hl+1)} C${f1(50-hw*.4)},${f1(hl-6)} ${f1(50+hw*.6)},${f1(hl-5)} ${f1(50+hw+.5)},${f1(hl+3)} L${f1(50+hw)},${f1(hl-3)} C${f1(50+hw*.4)},${f1(top-4)} ${f1(50-hw*.6)},${f1(top-4)} ${f1(50-hw*.9)},${f1(hl+1)}Z" fill="${hc}"/><path d="M${f1(50-hw*.35)},${f1(top+1)} L${f1(50-hw*.3)},${f1(hl-2)}" stroke="${skD}" stroke-opacity=".5" stroke-width=".6"/>`+sheen;}
  else if(hs===8){s+=cap(0,.28)+`<path d="M${f1(50-hw*.42)},${f1(hl+1)} C${f1(50-hw*.48)},${f1(top-9)} ${f1(50+hw*.48)},${f1(top-9)} ${f1(50+hw*.42)},${f1(hl+1)} Q50,${f1(hl-1)} ${f1(50-hw*.42)},${f1(hl+1)}Z" fill="${hc}"/>`+curls(8,top-6,hl-1,hw*.3);}
  else if(hs===9)s+=cap(0,.16)+`<ellipse cx="45" cy="${f1(top+4)}" rx="6" ry="2.4" fill="#fff" opacity=".18"/>`;
  else if(hs===10)s+=cap(2.4,.98)+`<path d="M${f1(50-hw-.5)},${f1(hl+2)} C${f1(50-hw*.5)},${f1(hl+4)} ${f1(50-2)},${f1(hl)} ${f1(50+hw*.3)},${f1(hl+3.5)} C${f1(50+hw*.6)},${f1(hl+1)} ${f1(50+hw+.5)},${f1(hl+3)} ${f1(50+hw+.5)},${f1(hl+2)} L${f1(50+hw)},${f1(hl-3)} L${f1(50-hw)},${f1(hl-3)}Z" fill="${hc}"/>`+sheen;
  else if(hs===11){s+=cap(2.5,1);for(let i=0;i<9;i++){const x=50-hw*.75+i*(hw*1.5/8);s+=`<path d="M${f1(x)},${f1(top+1)} Q${f1(x+(r()-.5)*2)},${f1(hl+2)} ${f1(x+(r()-.5)*3)},${f1(hl+5+r()*3)}" fill="none" stroke="${i%2?hc:hcD}" stroke-width="2.8" stroke-linecap="round"/>`;}s+=sheen;}
  else if(hs===12){s+=cap(1.5,1);for(let i=-3;i<=3;i++)s+=`<path d="M${f1(50+i*3.6)},${f1(hl-.5)} Q${f1(50+i*4.2)},${f1(top+2)} ${f1(50+i*4.8)},${f1(top-1)}" fill="none" stroke="${hcL}" stroke-opacity=".4" stroke-width=".8" stroke-dasharray="1.3 1"/>`;}
  else if(hs===13){s+=cap(0,.32)+mass(8.5,-3,2.4,15,2.2,-2)+curls(18,top-6,hl,hw*.8);}
  else if(hs===14){s+=cap(2.6,1)+`<path d="M${f1(50-hw-.5)},${f1(hl+5)} L${f1(50-hw*.6)},${f1(hl+8)} L${f1(50-hw*.35)},${f1(hl+5.5)} L${f1(50-hw*.1)},${f1(hl+8.5)} L${f1(50+hw*.15)},${f1(hl+5.5)} L${f1(50+hw*.42)},${f1(hl+8)} L${f1(50+hw*.7)},${f1(hl+5)} L${f1(50+hw+.5)},${f1(hl+6)} L${f1(50+hw)},${f1(hl-3)} L${f1(50-hw)},${f1(hl-3)}Z" fill="${hc}"/>`+sheen;}
  else if(hs===15){s+=cap(.5,.9)+`<path d="M${f1(50-hw*.8)},${f1(hl+1)} C${f1(50-hw*.7)},${f1(top-6)} ${f1(50+hw*.2)},${f1(top-11)} ${f1(50+hw*.7)},${f1(top-5)} C${f1(50+hw*.9)},${f1(top-1)} ${f1(50+hw*.8)},${f1(hl-2)} ${f1(50+hw*.75)},${f1(hl+1)} C55,${f1(hl-2)} 45,${f1(hl-2)} ${f1(50-hw*.8)},${f1(hl+1)}Z" fill="${hc}"/>`;for(let i=0;i<5;i++)s+=`<path d="M${f1(44+i*3)},${f1(hl-1)} Q${f1(46+i*3)},${f1(top-4)} ${f1(52+i*2.4)},${f1(top-8+i*.6)}" fill="none" stroke="${hcL}" stroke-opacity=".3" stroke-width=".7"/>`;}
  else if(hs===16){s+=cap(1.6,1)+sheen+`<path d="M${f1(50-hw*.7)},${f1(hl+.5)} Q${f1(50-hw*.35)},${f1(hl+3)} 50,${f1(hl+1)} Q${f1(50+hw*.35)},${f1(hl+3)} ${f1(50+hw*.7)},${f1(hl+.5)}" fill="${hc}"/>`;}
  else if(hs===17){s+=mass(9,2,2.2,18,1.4,-1)+curls(16,top-6,hl,hw*.9);}
  else if(hs===18){s+=cap(0,.38);for(let row=0;row<3;row++)for(let i=0;i<8;i++){const x=50-hw*.72+i*(hw*1.44/7)+(row%2?1.2:0);s+=`<ellipse cx="${f1(x)}" cy="${f1(top+1+row*3.4)}" rx="1.7" ry="${f1(3.4+r()*1.2)}" fill="${(i+row)%2?hc:hcD}"/>`;}}
  else if(hs===19)s+=cap(2.2,1)+sheen+`<circle cx="50" cy="${f1(top-5)}" r="5.2" fill="${hc}"/><path d="M45.5,${f1(top-1.5)} L54.5,${f1(top-1.5)}" stroke="${hcD}" stroke-width="1.6"/><path d="M${f1(50-hw*.6)},${f1(top+3)} Q50,${f1(top-2)} ${f1(50+hw*.6)},${f1(top+3)}" fill="none" stroke="${hcL}" stroke-opacity=".3" stroke-width=".7"/>`;
  else if(hs===20){s+=mass(4,6,1.8,16,2.6,1)+curls(16,top-3,hl+2,hw*.85);}
  else if(hs===21){s+=cap(2.2,1)+`<path d="M50,${f1(top+1)} C${f1(50-hw*.35)},${f1(hl-2)} ${f1(50-hw*.75)},${f1(hl+2)} ${f1(50-hw-.6)},${f1(hl+7)} L${f1(50-hw)},${f1(hl-2)} C${f1(50-hw*.6)},${f1(top-1)} ${f1(50-6)},${f1(top-1.5)} 50,${f1(top+1)}Z M50,${f1(top+1)} C${f1(50+hw*.35)},${f1(hl-2)} ${f1(50+hw*.75)},${f1(hl+2)} ${f1(50+hw+.6)},${f1(hl+7)} L${f1(50+hw)},${f1(hl-2)} C${f1(50+hw*.6)},${f1(top-1)} ${f1(50+6)},${f1(top-1.5)} 50,${f1(top+1)}Z" fill="${hc}"/><path d="M50,${f1(top-.5)} L50,${f1(hl-1)}" stroke="${skD}" stroke-opacity=".55" stroke-width=".7"/>`+sheen;}
  else if(hs===22){s+=cap(1.4,.93)+sheen+`<path d="M${f1(50-hw*.55)},${f1(hl-.6)} Q50,${f1(hl-2.2)} ${f1(50+hw*.55)},${f1(hl-.6)}" fill="none" stroke="${hcL}" stroke-opacity=".3" stroke-width=".6"/>`;}
  else if(hs===23){s+=cap(1,.95)+`<path d="M${f1(50-hw*.85)},${f1(hl+1)} C${f1(50-hw*.8)},${f1(top-9)} ${f1(50+hw*.5)},${f1(top-12)} ${f1(50+hw*.85)},${f1(top-4)} C${f1(50+hw*.95)},${f1(top)} ${f1(50+hw*.9)},${f1(hl-2)} ${f1(50+hw*.8)},${f1(hl+1)} C55,${f1(hl-2.5)} 45,${f1(hl-2.5)} ${f1(50-hw*.85)},${f1(hl+1)}Z" fill="${hc}"/>`;for(let i=0;i<5;i++)s+=`<path d="M${f1(50-hw*.6+i*3)},${f1(hl-1)} C${f1(50-hw*.5+i*3)},${f1(top-6)} ${f1(50+i*2)},${f1(top-9)} ${f1(50+hw*.6)},${f1(top-6+i)}" fill="none" stroke="${hcL}" stroke-opacity=".3" stroke-width=".7"/>`;s+=sheen;}
  else if(hs===24){s+=cap(0,.4)+`<path d="M${f1(50-hw*.82)},${f1(hl+2.6)} C${f1(50-hw*.9)},${f1(top-3)} ${f1(50+hw*.9)},${f1(top-3)} ${f1(50+hw*.82)},${f1(hl+2.6)} Z" fill="${hc}"/>`+curls(6,top-1,hl,hw*.6);}
  else if(hs===25){s+=cap(0,.36)+`<path d="M${f1(50-hw*.78)},${f1(hl+1)} L${f1(50-hw*.8)},${f1(top-6)} Q${f1(50-hw*.8)},${f1(top-9)} ${f1(50-hw*.55)},${f1(top-9)} L${f1(50+hw*.55)},${f1(top-9)} Q${f1(50+hw*.8)},${f1(top-9)} ${f1(50+hw*.8)},${f1(top-6)} L${f1(50+hw*.78)},${f1(hl+1)} Q50,${f1(hl-1)} ${f1(50-hw*.78)},${f1(hl+1)}Z" fill="${hc}"/><path d="M${f1(50-hw*.55)},${f1(top-8.6)} L${f1(50+hw*.55)},${f1(top-8.6)}" fill="none" stroke="${hcL}" stroke-opacity=".3" stroke-width="1"/>`+curls(12,top-8,hl,hw*.7);}
  else if(hs===26){s+=cap(0,.36)+mass(3,-2,1,12,0,-1);for(let i=0;i<12;i++){const x=50-hw*.75+i*(hw*1.5/11),y0=top-2+(i%2)*1.5;s+=`<path d="M${f1(x)},${f1(y0)} L${f1(x+(r()-.5)*1.5)},${f1(hl+1.5+r()*2)}" stroke="${i%2?hc:hcD}" stroke-width="2.4" stroke-linecap="round"/><path d="M${f1(x)},${f1(y0+.8)} L${f1(x)},${f1(hl+1)}" stroke="${hcL}" stroke-opacity=".25" stroke-width=".6" stroke-dasharray="1 1"/>`;}}
  else if(hs===27){s+=cap(1.5,.98);let d=`M${f1(50-hw*.8)},${f1(top+3)}`;for(let i=0;i<8;i++){const x0=50-hw*.8+i*(hw*1.6/8),x1=x0+hw*1.6/8;d+=` L${f1((x0+x1)/2+(r()-.5)*1.5)},${f1(top-5-r()*3)} L${f1(x1)},${f1(top+2.5)}`;}s+=`<path d="${d} Z" fill="${hc}"/>`+sheen;}
  else if(hs===28){s+=cap(0,.3)+`<path d="M${f1(50-hw*.75)},${f1(hl+2)} C${f1(50-hw*.8)},${f1(top-6)} ${f1(50+hw*.5)},${f1(top-8)} ${f1(50+hw+1.5)},${f1(top+3)} C${f1(50+hw*.6)},${f1(top+1)} ${f1(50+hw*.4)},${f1(hl-1)} ${f1(50+hw*.75)},${f1(hl+3)} C${f1(50+2)},${f1(hl-1)} ${f1(50-6)},${f1(hl-1)} ${f1(50-hw*.75)},${f1(hl+2)}Z" fill="${hc}"/>`+sheen;}
  else if(hs===29){s+=cap(2.4,1)+`<path d="M50,${f1(top)} C${f1(50-hw*.4)},${f1(hl-1)} ${f1(50-hw*.8)},${f1(hl+1)} ${f1(50-hw-1)},${f1(hl+9)} L${f1(50-hw)},${f1(hl-2)} Z M50,${f1(top)} C${f1(50+hw*.4)},${f1(hl-1)} ${f1(50+hw*.8)},${f1(hl+1)} ${f1(50+hw+1)},${f1(hl+9)} L${f1(50+hw)},${f1(hl-2)} Z" fill="${hc}"/>`+sheen;}
  else if(hs===30){s+=cap(0,.8)+`<path d="M${f1(50-hw*.7)},${f1(hl+1.2)} L${f1(50-hw*.15)},${f1(hl+.2)}" stroke="${sk}" stroke-width=".9"/><path d="M${f1(50+hw*.35)},${f1(top+2)} L${f1(50+hw*.6)},${f1(hl-.5)}" stroke="${skL}" stroke-width=".8" stroke-opacity=".9"/>`;}
  if(o&&o.fh==='beard')s+=`<path d="M${f1(50-hw+.6)},${f1(cheekY+2)} C${f1(50-hw+1)},${f1(chinY-2)} ${f1(50-jaw)},${f1(chinY+4)} 50,${f1(chinY+5)} C${f1(50+jaw)},${f1(chinY+4)} ${f1(50+hw-1)},${f1(chinY-2)} ${f1(50+hw-.6)},${f1(cheekY+2)} C${f1(50+hw-3)},${f1(my+1)} 56,${f1(my+2.5)} 50,${f1(my+2.5)} C44,${f1(my+2.5)} ${f1(50-hw+3)},${f1(my+1)} ${f1(50-hw+.6)},${f1(cheekY+2)}Z" fill="${hc}" opacity=".92"/><path d="M${f1(50-mw-.6)},${f1(my-1.2)} Q50,${f1(my-3.8)} ${f1(50+mw+.6)},${f1(my-1.2)} Q50,${f1(my-2)} ${f1(50-mw-.6)},${f1(my-1.2)}Z" fill="${hc}"/>`;
  if(o&&o.age>=45){const op=Math.min(.35,(o.age-40)/80);s+=`<g fill="none" stroke="${skDD}" stroke-opacity="${op}" stroke-width=".55" stroke-linecap="round"><path d="M42,${f1(top+12)} Q50,${f1(top+10.5)} 58,${f1(top+12)}"/><path d="M43.5,${f1(top+14.6)} Q50,${f1(top+13.2)} 56.5,${f1(top+14.6)}"/><path d="M${f1(50-ex-es-1.5)},${f1(ey+.5)} l-1.6,-1 M${f1(50-ex-es-1.5)},${f1(ey+1.6)} l-1.7,.6 M${f1(50+ex+es+1.5)},${f1(ey+.5)} l1.6,-1 M${f1(50+ex+es+1.5)},${f1(ey+1.6)} l1.7,.6"/><path d="M${f1(50-nw-1)},${f1(ny+2)} Q${f1(50-nw-3)},${f1(my)} ${f1(50-mw-1)},${f1(my+1.5)} M${f1(50+nw+1)},${f1(ny+2)} Q${f1(50+nw+3)},${f1(my)} ${f1(50+mw+1)},${f1(my+1.5)}"/></g>`;}
  if(o&&o.glasses)s+=`<g fill="rgba(200,230,255,.18)" stroke="#1b1f24" stroke-width="1.1"><rect x="${f1(50-ex-es-1.2)}" y="${f1(ey-3.4)}" width="${f1(2*es+2.4)}" height="6.6" rx="2"/><rect x="${f1(50+ex-es-1.2)}" y="${f1(ey-3.4)}" width="${f1(2*es+2.4)}" height="6.6" rx="2"/></g><path d="M${f1(50-ex+es+1.2)},${f1(ey-1)} Q50,${f1(ey-2.4)} ${f1(50+ex-es-1.2)},${f1(ey-1)}" fill="none" stroke="#1b1f24" stroke-width="1"/>`;
  if(o&&o.cap)s+=`<path d="M${f1(50-hw-1.5)},${f1(hl+3)} C${f1(50-hw-1.5)},${f1(top-7)} ${f1(50+hw+1.5)},${f1(top-7)} ${f1(50+hw+1.5)},${f1(hl+3)}Z" fill="${tm.c1}"/><path d="M${f1(50-hw-1.5)},${f1(hl+3)} C${f1(50-hw-1.5)},${f1(top-7)} ${f1(50+hw+1.5)},${f1(top-7)} ${f1(50+hw+1.5)},${f1(hl+3)}Z" fill="url(#${id}cg)"/><path d="M${f1(50-hw-3)},${f1(hl+3.6)} Q50,${f1(hl+.4)} ${f1(50+hw+3)},${f1(hl+3.6)} Q50,${f1(hl+8.6)} ${f1(50-hw-3)},${f1(hl+3.6)}Z" fill="${_fmx(tm.c1,'#000000',.25)}"/><circle cx="50" cy="${f1(top-4.6)}" r="1.4" fill="${tm.c2}"/><path d="M50,${f1(top-3.4)} L50,${f1(hl+1)}" stroke="#000" stroke-opacity=".2" stroke-width=".6"/><text x="50" y="${f1(hl-.6)}" text-anchor="middle" font-size="7" font-weight="900" fill="${tm.c2}" font-family="Georgia,serif">${(o.ini||'').slice(0,1)}</text>`;
  if(o&&o.cap)s=s.replace('</defs>',`<linearGradient id="${id}cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>`);
  return`<svg width="${sz}" height="${sz}" viewBox="13 10 74 74" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0">${s}</svg>`;
}

// hair colour and style of a player's portrait (same random sequence as face()), so Game Day can show it when the helmet comes off
function faceTraits(seed){
  let o=null;{const L=lookOf(seed);if(L)o=Object.assign({},L);}
  seed=(typeof seed==='number'&&isFinite(seed))?seed:Math.abs(String(seed||'x').split('').reduce((a,c)=>a*31+c.charCodeAt(0)|0,7));
  let st=(Math.imul(seed^0x5bd1e995,2654435761)>>>0)||1;
  const r=()=>{st=(st+0x6D2B79F5)|0;let t=Math.imul(st^(st>>>15),1|st);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};
  let ti=Math.floor(r()*FACE_SKIN.length);if(o&&o.ti!=null)ti=Math.max(0,Math.min(FACE_SKIN.length-1,o.ti));
  const dark=ti>=4;
  let hc=dark?['#141010','#1b1511','#241a14','#2e2119','#141010','#1b1511','#3a2a1e','#c9a25a'][Math.floor(r()*8)]:['#0e0b09','#1b1511','#2e2119','#3d2c1e','#4a3020','#5c4128','#6b4a2b','#8a6a46','#a07a46','#b89a64','#c49a5c','#d8c08a','#ece0b8','#9c4a22','#b5562e','#7a3b1e','#6b5a4a','#2e2119'][Math.floor(r()*18)];if(o&&o.hc)hc=o.hc;
  if(ti<=2)r();r();          // eye colour
  r();r();r();r();r();       // head shape
  const TX=[3,4,5,6,11,12,13,17,18,20,24,25,26,30,0,1,2,8,9,22],ST=[0,1,2,7,10,14,15,16,19,20,13,9,21,22,23,24,27,28,29],pr=r(),pool=(ti>=4?(pr<.82?TX:ST):ti<=1?(pr<.86?ST:TX):(pr<.5?TX:ST));
  let hs=pool[Math.floor(r()*pool.length)];if(o&&o.hs!=null)hs=o.hs;else hs=hsVariant(hs,seed);
  return{ti,hc,hs};
}
// some cornrow, fade and waves heads get a lineup or a cornrow variation (from the seed, so no other part of the face changes)
function hsVariant(hs,seed){const h=((seed||0)*2654435761+7)>>>0;if(hs===5&&h%2===0)return[33,34,35,36][(h>>>4)%4];if(hs===2&&h%3===0)return 31;if(hs===4&&h%3===0)return 32;return hs;}
function hairCat(hs){return[0,9,30,2,31,36].includes(hs)?'buzz':[3,20,17,8,25,26,14,23].includes(hs)?'big':[10,16,29,11,12,6].includes(hs)?'long':'short';}
function faceSkinHex(seed){
  {const L=lookOf(seed);if(L&&L.ti!=null)return FACE_SKIN[Math.max(0,Math.min(FACE_SKIN.length-1,L.ti))];}
  seed=(typeof seed==='number'&&isFinite(seed))?seed:Math.abs(String(seed||'x').split('').reduce((a,c)=>a*31+c.charCodeAt(0)|0,7));
  let st=(Math.imul(seed^0x5bd1e995,2654435761)>>>0)||1;
  const r=()=>{st=(st+0x6D2B79F5)|0;let t=Math.imul(st^(st>>>15),1|st);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};
  return FACE_SKIN[Math.floor(r()*FACE_SKIN.length)];
}


