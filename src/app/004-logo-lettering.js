function _gw(t){const T=_LG_V;let w=0;for(const c of t){const g=T[c]||T[' '];w+=g[0];}return w;}
function _gt(t,cx,base,h,maxW,fill,sw,extra){t=String(t||'').toUpperCase().replace(/[^A-Z ]/g,'');const W=_gw(t)||1;let sc=h/100;if(maxW&&W*sc>maxW)sc=maxW/W;const T=_LG_V;let x=-W/2,o='';for(const c of t){const g=T[c]||T[' '];if(g[1])o+=`<path d="${g[1]}" transform="translate(${x.toFixed(1)} 0)"/>`;x+=g[0];}
  return`<g transform="translate(${cx} ${base}) scale(${sc.toFixed(4)})" fill="${fill}" stroke="${fill}" stroke-width="${sw==null?7:sw}" stroke-linejoin="round" ${extra||''}>${o}</g>`;}
function _hx(c){c=(c||'').trim();if(/^#[0-9a-f]{3}$/i.test(c))c='#'+[...c.slice(1)].map(x=>x+x).join('');return /^#[0-9a-f]{6}$/i.test(c)?[1,3,5].map(i=>parseInt(c.substr(i,2),16)):null;}
function _mx(a,b,t){const A=_hx(a)||[60,60,60],B=_hx(b)||[0,0,0];return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('');}
function _lm(c){const a=_hx(c)||[60,60,60];return(.2126*a[0]+.7152*a[1]+.0722*a[2])/255;}
const _MR='translate(100 0) scale(-1 1)';
const _m=s=>s+`<g transform="${_MR}">${s}</g>`;
const _sy=(d,P,f)=>`<g fill="none" stroke="${P.O}" stroke-width="4.6" stroke-linejoin="round"><path d="${d}"/><path d="${d}" transform="${_MR}"/></g><g fill="${f||P.F}"><path d="${d}"/><path d="${d}" transform="${_MR}"/></g>`;
const _s1=(d,P,f)=>`<path d="${d}" fill="${f||P.F}" stroke="${P.O}" stroke-width="4.6" stroke-linejoin="round" paint-order="stroke"/>`;
const _k=(d,P,f)=>`<path d="${d||''}" fill="${f||P.K}"/>`;
const _l=(d,P,w)=>`<path d="${d}" fill="none" stroke="${P.K}" stroke-width="${w||2}" stroke-linecap="round" stroke-linejoin="round"/>`;
const _LGO={
cat:(P,v)=>{let s='';const lion=v==='lion',ink=P.K;
 if(lion){const mc=P.D;s+=`<circle cx="50" cy="54" r="37" fill="${mc}" stroke="${P.O}" stroke-width="4.6"/><circle cx="50" cy="54" r="38" fill="none" stroke="${P.O}" stroke-width="11" stroke-dasharray="0 12.4" stroke-linecap="round"/><circle cx="50" cy="54" r="38" fill="none" stroke="${mc}" stroke-width="6.4" stroke-dasharray="0 12.4" stroke-linecap="round"/><circle cx="50" cy="54" r="37" fill="${mc}"/>`;
  s+=_sy('M50,84 C64,84 72,74 72,60 C72,48 64,38 50,38Z',P);}
 else{if(v==='lynx')s+=_sy('M74,58 L91,62 L80,69 L89,78 L72,80Z',P);
  s+=_sy('M50,86 L57,85 L63,91 L69,82 L77,84 L76,72 L86,68 L79,60 L83,47 L82,28 L64,38 C59,36 54.5,35.5 50,35.5Z',P);
  s+=_m(_k('M74,38 L75,50 L67,44Z',P,P.D));if(v==='lynx')s+=_m(_k('M82,28 L90,10 L76,34Z',P));}
 s+=`<ellipse cx="50" cy="67" rx="15" ry="11" fill="${P.L}" stroke="${ink}" stroke-width="1.6"/>`;
 if(v==='tiger')s+=_m(_k('M56,39 L55,47 L59,46Z M64,41 L62,49 L66,47Z M77,60 L69,60 L77,65Z',P))+_k('M48,38 L50,48 L52,38Z',P);
 if(!P.var)s+=`<path d="M38,70 Q50,64 62,70 L58,82 Q50,89 42,82Z" fill="#1c0a0a" stroke="${ink}" stroke-width="1.6"/><ellipse cx="50" cy="82" rx="6" ry="3.2" fill="#d64545"/>`+_m(`<path d="M54,69 L57,79 L60,70Z" fill="#fff" stroke="${ink}" stroke-width="1" stroke-linejoin="round"/>`);
 else s+=_l('M50,67 L50,72 M50,72 C46,77 41,76 38,72 M50,72 C54,77 59,76 62,72',P,2.2)+_m(`<path d="M55,73 L56.5,78 L58,73.5Z" fill="#fff" stroke="${ink}" stroke-width=".8"/>`);
 s+=_k('M44,60 L56,60 L50,67Z',P);
 s+=_m(`<path d="M54,54 Q62,47 71,51 Q65,59 54,58Z" fill="#fff" stroke="${ink}" stroke-width="1.6"/><circle cx="63" cy="53.5" r="3.4" fill="${P.A}"/><ellipse cx="63.2" cy="53.6" rx="1.3" ry="3" fill="${ink}"/>`)+_m(_k('M52,45 L73,45 L70,50 L54,52Z',P));
 return s;},
wolf:(P)=>{let s=_sy('M50,95 L58,87 C66,84 72,76 74,68 L85,67 L79,59 L87,52 L78,48 L88,15 L66,31 C60,28 55,27.5 50,27.5Z',P);
 s+=_m(_k('M76,27 L79,42 L68,34Z',P,P.D));
 s+=_m(`<path d="M50,48 L61,62 L59,76 L50,80Z" fill="${P.L}"/>`);
 if(!P.var)s+=`<path d="M43,77 Q50,73 57,77 L55,89 Q50,94 45,89Z" fill="#1c0a0a" stroke="${P.K}" stroke-width="1.6"/><ellipse cx="50" cy="88" rx="3.8" ry="2.4" fill="#d64545"/>`+_m(`<path d="M51.5,77 L53.5,87 L56,77.5Z" fill="#fff" stroke="${P.K}" stroke-width="1" stroke-linejoin="round"/>`);
 else s+=_l('M50,79 L50,86 M50,86 C47,90 43,89 41,86 M50,86 C53,90 57,89 59,86',P,2);
 s+=_k('M42,72 Q50,66 58,72 L50,79Z',P);
 s+=_m(`<path d="M55,48 L74,39 L71,50 L60,54Z" fill="#fff" stroke="${P.K}" stroke-width="1.6"/><path d="M60,48 L69,44 L68,50 L62,52Z" fill="${P.A}"/><circle cx="65" cy="48" r="1.7" fill="${P.K}"/>`)+_m(_k('M53,44 L77,35 L75,40 L56,49Z',P));
 return s;},
bear:(P)=>{let s=`<circle cx="30" cy="32" r="10" fill="${P.F}" stroke="${P.O}" stroke-width="4.6"/><circle cx="70" cy="32" r="10" fill="${P.F}" stroke="${P.O}" stroke-width="4.6"/><ellipse cx="50" cy="55" rx="29" ry="27" fill="${P.F}" stroke="${P.O}" stroke-width="4.6"/>`;
 s+=`<circle cx="30" cy="32" r="4.5" fill="${P.D}"/><circle cx="70" cy="32" r="4.5" fill="${P.D}"/><ellipse cx="50" cy="66" rx="15" ry="12" fill="${P.L}" stroke="${P.K}" stroke-width="1.8"/>`;
 if(!P.var)s+=`<path d="M40,68 Q50,64 60,68 L57,79 Q50,84 43,79Z" fill="#1c0a0a" stroke="${P.K}" stroke-width="1.6"/><ellipse cx="50" cy="79" rx="5" ry="2.6" fill="#d64545"/>`+_m(`<path d="M44,68 L46,74 L49,68.5Z" fill="#fff" stroke="${P.K}" stroke-width="1" stroke-linejoin="round"/>`);
 else s+=_l('M50,65 L50,70 M50,70 Q45,75 41,71 M50,70 Q55,75 59,71',P,2);
 s+=`<ellipse cx="50" cy="61" rx="6" ry="4.4" fill="${P.K}"/>`+_m(`<path d="M32,49 L45,52 L44,57 L34,55Z" fill="#fff" stroke="${P.K}" stroke-width="1.4"/><circle cx="40" cy="53.5" r="2.4" fill="${P.K}"/>`)+_m(_k('M30,43 L47,50 L47,46 L32,38Z',P));
 return s;},
eagle:(P)=>{let s=_s1('M14,90 L21,78 L15,70 L23,62 L19,52 C19,38 31,26 47,24 C59,22 69,26 74,34 L78,50 C80,58 77,67 71,75 L76,82 L65,80 L62,91 L54,78 L48,89 L41,77 L33,87 L29,76Z',P);
 if(!P.var){s+=`<path d="M70,44 L90,47 L92,55 L72,53Z" fill="#1c0a0a"/><ellipse cx="80" cy="51" rx="5" ry="2" fill="#d64545"/>`;
 s+=_s1('M68,31 C81,29 94,35 97,46 C96,53 90,52 87,47 C85,43 80,41 72,43Z',P,P.A);
 s+=_s1('M72,53 C80,53 88,56 92,60 C88,64 78,62 72,58Z',P,_mx(P.A,'#000000',.2));}
 else s+=_s1('M68,31 C81,29 94,35 97,47 C96,55 88,55 85,49 C83,45 79,44 72,47 L70,52 C76,51 82,52 84,54 C78,57 72,56 68,54Z',P,P.A);
 s+=`<ellipse cx="60" cy="42" rx="5" ry="4.4" fill="#fff" stroke="${P.K}" stroke-width="1.4"/><circle cx="61" cy="42.4" r="2.6" fill="${P.A}"/><circle cx="61.3" cy="42.5" r="1.3" fill="${P.K}"/>`+_k('M47,33 L69,43 L68,36 L54,27Z',P);
 s+=_l('M27,62 Q35,57 42,64 M29,72 Q39,67 47,74 M40,50 Q46,48 52,54',P,2);
 return s;},
owl:(P)=>{let s=_s1('M50,86 C32,86 24,72 24,54 C24,42 28,34 30,26 L41,35 C45,33 55,33 59,35 L70,26 C72,34 76,42 76,54 C76,72 68,86 50,86Z',P);
 s+=`<circle cx="38.5" cy="53" r="11" fill="#fff" stroke="${P.K}" stroke-width="2"/><circle cx="61.5" cy="53" r="11" fill="#fff" stroke="${P.K}" stroke-width="2"/><circle cx="40" cy="54" r="5" fill="${P.K}"/><circle cx="60" cy="54" r="5" fill="${P.K}"/>`;
 s+=_s1('M50,58 L45,66 L50,73 L55,66Z',P,P.A)+_l('M38,78 Q44,82 50,78 Q56,82 62,78',P,2);
 return s;},
bull:(P,v)=>{let s='';
 if(v==='bison')s+=_sy('M50,26 C34,24 24,34 24,52 L50,56Z',P,_mx(P.F,'#000',.35));
 const hl=v==='long';
 s+=_m(`<path d="M64,42 C${hl?'80,44 94,36 98,20':'76,42 86,36 90,24'} C${hl?'90,32 78,34':'84,32 76,32'} 64,34Z" fill="${P.A}" stroke="${P.O}" stroke-width="3.6" stroke-linejoin="round"/>`);
 s+=_sy('M50,86 C58,86 63,80 64,72 C67,64 68,56 66,46 L64,38 C60,36 55,35 50,35Z',P);
 s+=_m(`<path d="M65,47 C72,43 80,45 83,50 C77,54 70,54 66,53Z" fill="${P.F}" stroke="${P.O}" stroke-width="3.6" stroke-linejoin="round"/>`);
 s+=`<ellipse cx="50" cy="75" rx="11" ry="8" fill="${_mx(P.F,'#ffffff',.4)}" stroke="${P.K}" stroke-width="1.8"/>`+_m(`<circle cx="55" cy="76" r="2" fill="${P.K}"/>`)+_m(_k('M55,51 L62,49 L60,54Z',P));
 return s;},
ram:(P)=>{let s=_m(`<path d="M62,42 C82,32 94,50 82,64 C75,70 66,64 70,56" fill="none" stroke="${P.O}" stroke-width="13" stroke-linecap="round"/><path d="M62,42 C82,32 94,50 82,64 C75,70 66,64 70,56" fill="none" stroke="${P.A}" stroke-width="8" stroke-linecap="round"/>`);
 s+=_sy('M50,88 C58,88 62,82 62,72 L63,52 C63,43 57,38 50,38Z',P);
 s+=_m(_k('M55,54 L62,52 L60,57Z',P))+_k('M44,78 L56,78 L50,84Z',P)+_l('M50,60 L50,78',P,2);
 return s;},
horse:(P,v)=>{let s=_s1('M40,22 C28,26 20,40 18,56 L9,60 L18,64 L7,74 L20,74 L13,87 L30,93 C26,72 30,52 40,38Z',P,P.D);
 s+=_s1('M30,93 C26,72 30,52 40,38 L40,19 L50,30 C55,28 60,29 64,31 L59,14 L72,30 C80,38 88,52 92,62 C95,70 92,77 86,79 C80,80 74,77 70,73 C66,76 64,82 64,93Z',P);
 s+=`<path d="M41,23 L48,30 L42,32Z M60,17 L67,29 L62,30Z" fill="${P.D}"/>`;
 s+=`<path d="M55,42 Q62,37 70,43 Q63,48 55,46Z" fill="#fff" stroke="${P.K}" stroke-width="1.3"/><circle cx="63" cy="43" r="2" fill="#111"/><path d="M53,39 L71,40 L69,36 L56,35Z" fill="${P.K}"/>`;
 s+=`<ellipse cx="86" cy="67" rx="2.6" ry="1.6" transform="rotate(35 86 67)" fill="${P.K}"/>`+_l('M66,57 C61,63 63,70 70,73 M80,78 L90,73 M72,30 C68,44 70,52 66,57',P,1.8);if(v==='zebra')s+=`<g stroke="${P.D}" stroke-width="3.2" stroke-linecap="round" fill="none"><path d="M44,40 C40,50 38,60 38,72 M52,34 C48,44 46,54 46,66 M60,40 C58,48 58,56 60,62 M70,48 C68,54 70,60 74,64 M36,80 C42,78 48,80 52,86"/></g>`;
 return s;},
bulldog:(P)=>{let s=_m(`<path d="M68,34 C76,22 90,26 88,42 L77,44Z" fill="${P.D}" stroke="${P.O}" stroke-width="3.6" stroke-linejoin="round"/>`);
 s+=_sy('M50,86 C66,86 78,80 80,68 L85,52 C85,40 77,32 66,30 L50,28Z',P);
 s+=`<ellipse cx="50" cy="68" rx="22" ry="13" fill="${P.L}" stroke="${P.K}" stroke-width="1.8"/>`+_m(`<path d="M55,47 L72,42 L70,52 L58,54Z" fill="#fff" stroke="${P.K}" stroke-width="1.4"/><circle cx="64" cy="48.5" r="2.6" fill="${P.K}"/>`)+_m(_k('M53,42 L74,36 L72,43 L56,49Z',P));
 s+=_k('M40,58 L60,58 L56,67 L44,67Z',P)+`<path d="M34,72 Q50,66 66,72 Q58,82 50,80 Q42,82 34,72Z" fill="#1c0a0a" stroke="${P.K}" stroke-width="1.6"/>`+_m(`<path d="M38,77 L42.5,66 L47,77Z" fill="#fff" stroke="${P.K}" stroke-width="1.2" stroke-linejoin="round"/>`);
 s+=`<path d="M22,90 H78 L74,98 H26Z" fill="${P.A}" stroke="${P.O}" stroke-width="3" stroke-linejoin="round"/>`;
 return s;},
helm:(P)=>{let s=_s1('M34,32 C40,6 72,4 88,24 C74,16 56,18 48,30Z',P,P.A);
 s+=_s1('M26,66 C22,42 34,26 52,26 C70,26 80,40 78,58 L76,76 C76,84 70,86 66,82 L62,70 C58,72 52,72 48,68 L40,86 L30,86 C26,80 26,72 26,66Z',P);
 s+=_k('M54,46 L74,46 L72,56 L58,56Z',P)+_l('M62,56 L62,70',P,2.4)+_l('M30,60 C34,50 40,44 48,42',P,2);
 return s;},
knight:(P)=>{let s=_s1('M50,18 C46,2 62,0 76,8 C68,9 60,12 56,20Z',P,P.A);
 s+=_sy('M50,88 L66,84 C72,80 74,70 74,56 L74,38 C74,26 64,18 50,18Z',P);
 s+=_k('M32,44 L68,44 L68,52 L32,52Z',P)+_k('M47,52 L53,52 L53,74 L47,74Z',P)+_m(`<circle cx="62" cy="62" r="1.6" fill="${P.K}"/><circle cx="62" cy="68" r="1.6" fill="${P.K}"/><circle cx="62" cy="74" r="1.6" fill="${P.K}"/>`);
 return s;},
viking:(P)=>{let s=_m(`<path d="M69,44 C84,44 91,30 89,14 C83,27 77,31 68,31Z" fill="${P.A}" stroke="${P.O}" stroke-width="3.6" stroke-linejoin="round"/>`);
 s+=_sy('M50,28 C38,28 30,38 30,60 L50,60Z',P);
 s+=`<rect x="27" y="56" width="46" height="9" fill="${P.A}" stroke="${P.O}" stroke-width="3.2"/><path d="M45,40 L55,40 L55,76 L50,82 L45,76Z" fill="${P.F}" stroke="${P.O}" stroke-width="3.6" stroke-linejoin="round"/>`;
 s+=_m(_k('M56,47 L67,47 L65,53 L56,53Z',P));
 return s;},
skull:(P)=>{let s=_s1('M16,30 L50,6 L84,30 C72,25 28,25 16,30Z',P,_mx(P.F,'#000',.5));
 s+=`<path d="M26,28 H74" stroke="${P.A}" stroke-width="3.4"/>`;
 s+=_s1('M27,56 C27,36 38,28 50,28 C62,28 73,36 73,56 C73,64 69,67 66,69 L66,80 L34,80 L34,69 C31,67 27,64 27,56Z',P);
 s+=`<ellipse cx="39.5" cy="55" rx="7.5" ry="8.5" fill="${P.K}"/><ellipse cx="60.5" cy="55" rx="7.5" ry="8.5" fill="${P.K}"/>`+_k('M50,63 L45,72 L55,72Z',P)+_l('M42,80 V73 M50,80 V73 M58,80 V73',P,1.8);
 return s;},
hat:(P)=>{let s=_s1('M30,56 L32,32 C36,22 44,30 50,32 C56,30 64,22 68,32 L70,56Z',P);
 s+=`<path d="M31,50 H69 L70,57 H30Z" fill="${P.A}" stroke="${P.O}" stroke-width="3" stroke-linejoin="round"/>`;
 s+=_s1('M8,56 C22,68 78,68 92,56 C93,64 80,76 50,76 C20,76 7,64 8,56Z',P);
 return s;},
star:(P)=>{const p=[];for(let i=0;i<10;i++){const r=i%2?15:38,a=-Math.PI/2+i*Math.PI/5;p.push((50+r*Math.cos(a)).toFixed(1)+','+(54+r*Math.sin(a)).toFixed(1));}
 return _s1('M'+p.join('L')+'Z',P)+`<circle cx="50" cy="54" r="6" fill="${P.A}" stroke="${P.O}" stroke-width="2"/>`;},
bolt:(P)=>_s1('M60,8 L28,54 L45,54 L36,92 L74,42 L55,42 L68,8Z',P),
flame:(P)=>_s1('M50,8 C54,24 72,34 72,58 C72,76 62,90 50,90 C38,90 28,76 28,58 C28,46 34,40 38,30 C40,38 45,41 45,41 C43,28 45,18 50,8Z',P)+`<path d="M50,48 C55,56 61,62 61,71 C61,80 56,84 50,84 C44,84 39,80 39,71 C39,62 45,56 50,48Z" fill="${P.A}" stroke="${P.O}" stroke-width="2.4"/>`,
rocket:(P)=>{let s=_s1('M42,70 L58,70 L50,94Z',P,P.A)+_m(_s1('M36,56 L20,78 L36,74Z',P).replace(/<path /,'<path '));
 s+=_s1('M50,8 C64,22 68,44 65,70 L35,70 C32,44 36,22 50,8Z',P);
 s+=`<circle cx="50" cy="40" r="8" fill="${P.K}" stroke="${P.O}" stroke-width="2.4"/>`;return s;},
comet:(P)=>_s1('M56,42 C38,50 22,64 6,94 C26,86 44,80 60,62Z',P,P.A)+_s1('M64,52 C50,62 40,76 32,96 C48,88 58,80 68,66Z',P,_mx(P.A,'#ffffff',.35))+`<circle cx="68" cy="34" r="22" fill="${P.F}" stroke="${P.O}" stroke-width="4.6"/><circle cx="60" cy="27" r="6" fill="${P.K}" opacity=".5"/><circle cx="76" cy="40" r="3.4" fill="${P.K}" opacity=".5"/>`,
snake:(P)=>{let s=_s1('M50,94 C46,70 20,64 20,40 C20,26 34,18 50,18 C66,18 80,26 80,40 C80,64 54,70 50,94Z',P);
 s+=`<path d="M50,64 C60,54 62,46 57,40 C55,44 45,44 43,40 C38,46 40,54 50,64Z" fill="${P.A}" stroke="${P.O}" stroke-width="2"/>`+_m(`<ellipse cx="42" cy="32" rx="3.2" ry="2.4" fill="${P.K}"/>`).replace('cx="42"','cx="43"');
 return s+_l('M50,38 V46 M50,46 L46,51 M50,46 L54,51',P,1.8);},
gator:(P)=>{let s=`<path d="M8,60 L70,56 L88,70 L66,64Z" fill="#5c1a1a"/>`;
 s+=_s1('M8,62 L66,63 C76,63 84,66 88,72 C70,78 40,78 14,72Z',P,P.D);
 s+=`<path d="M14,64 L17,58 L20,64 M28,64 L31,58 L34,64 M42,64 L45,58 L48,64 M56,64 L59,58 L62,64" fill="#fff" stroke="${P.K}" stroke-width=".8" stroke-linejoin="round"/>`;
 s+=_s1('M5,52 C20,44 44,40 60,38 C64,30 76,28 82,36 C88,38 94,44 95,52 C90,56 80,57 70,57 L5,60Z',P);
 s+=`<path d="M12,60 L15,66 L18,60 M26,60 L29,67 L32,59.6 M40,59.4 L43,66 L46,59 M54,58.6 L57,65 L60,58.4" fill="#fff" stroke="${P.K}" stroke-width=".8" stroke-linejoin="round"/>`;
 s+=`<circle cx="72" cy="35" r="6.5" fill="${P.F}" stroke="${P.O}" stroke-width="3"/><ellipse cx="72" cy="35" rx="3.2" ry="2.6" fill="${P.A}"/><ellipse cx="72" cy="35" rx=".9" ry="2.3" fill="#111"/><path d="M66,31 L79,33" stroke="${P.K}" stroke-width="2.2" stroke-linecap="round"/>`;
 s+=`<circle cx="11" cy="49" r="2.2" fill="${P.F}" stroke="${P.O}" stroke-width="1.6"/>`+_l('M30,46 l3,-4 l3,4 M42,43 l3,-4 l3,4 M86,46 L92,50',P,1.8);return s;},
dragon:(P)=>{let s=_s1('M44,32 L32,4 L58,26Z',P,P.A);
 s+=_s1('M12,86 L20,72 L14,64 L24,58 C24,44 32,34 46,31 C60,28 72,34 82,44 L97,46 L88,54 L95,60 L80,62 C74,72 62,78 52,78 L48,93 L38,80 C28,82 20,86 12,86Z',P);
 s+=`<ellipse cx="62" cy="45" rx="5" ry="4" fill="${P.A}" stroke="${P.K}" stroke-width="1.4"/><circle cx="63" cy="45" r="1.8" fill="${P.K}"/><path d="M54,38 L72,46 L70,40Z" fill="${P.K}"/><circle cx="90" cy="48" r="1.6" fill="${P.K}"/>`+_l('M80,57 L90,56 M30,68 Q40,60 50,64',P,2);
 return s;},
hornet:(P)=>{let s=_m(`<ellipse cx="29" cy="40" rx="17" ry="8" transform="rotate(-28 29 40)" fill="#fff" fill-opacity=".85" stroke="${P.O}" stroke-width="3.4"/>`);
 s+=`<ellipse cx="50" cy="70" rx="13" ry="21" fill="${P.F}" stroke="${P.O}" stroke-width="4.6"/><path d="M37.6,64 H62.4 M38,74 H62 M42,83 H58" stroke="${P.K}" stroke-width="4.5"/><path d="M50,90 L50,98" stroke="${P.O}" stroke-width="4" stroke-linecap="round"/>`;
 s+=`<ellipse cx="50" cy="47" rx="11" ry="10" fill="${P.F}" stroke="${P.O}" stroke-width="4.6"/><circle cx="50" cy="26" r="11" fill="${P.F}" stroke="${P.O}" stroke-width="4.6"/><circle cx="45" cy="25" r="3" fill="${P.K}"/><circle cx="55" cy="25" r="3" fill="${P.K}"/>`;return s;},
crown:(P)=>_s1('M14,72 L10,30 L34,50 L50,18 L66,50 L90,30 L86,72Z',P)+`<rect x="14" y="74" width="72" height="12" fill="${P.A}" stroke="${P.O}" stroke-width="3.6" stroke-linejoin="round"/><circle cx="50" cy="60" r="5" fill="${P.K}"/><circle cx="30" cy="62" r="3.4" fill="${P.A}"/><circle cx="70" cy="62" r="3.4" fill="${P.A}"/>`,
ghost:(P)=>_s1('M24,88 L24,46 C24,28 36,16 50,16 C64,16 76,28 76,46 L76,88 L67,78 L58,88 L50,78 L42,88 L33,78Z',P)+`<ellipse cx="40" cy="46" rx="5" ry="7" fill="${P.K}"/><ellipse cx="60" cy="46" rx="5" ry="7" fill="${P.K}"/><ellipse cx="50" cy="64" rx="5" ry="6.5" fill="${P.K}"/>`,
wheel:(P)=>{let s=`<circle cx="50" cy="52" r="34" fill="none" stroke="${P.O}" stroke-width="12"/><circle cx="50" cy="52" r="34" fill="none" stroke="${P.F}" stroke-width="7"/>`;
 for(let i=0;i<8;i++){const a=i*Math.PI/4;s+=`<path d="M50,52 L${(50+34*Math.cos(a)).toFixed(1)},${(52+34*Math.sin(a)).toFixed(1)}" stroke="${P.O}" stroke-width="7.4" stroke-linecap="round"/><path d="M50,52 L${(50+34*Math.cos(a)).toFixed(1)},${(52+34*Math.sin(a)).toFixed(1)}" stroke="${P.F}" stroke-width="3.2" stroke-linecap="round"/>`;}
 return s+`<circle cx="50" cy="52" r="8" fill="${P.A}" stroke="${P.O}" stroke-width="3.4"/>`;},
hardhat:(P)=>_s1('M20,66 C20,40 34,26 50,26 C66,26 80,40 80,66Z',P)+`<path d="M45,26 H55 V66 H45Z" fill="${P.A}" stroke="${P.O}" stroke-width="3" stroke-linejoin="round"/><rect x="10" y="64" width="80" height="11" fill="${P.F}" stroke="${P.O}" stroke-width="4.6" stroke-linejoin="round"/>`,
tower:(P)=>_s1('M26,88 V42 H32 V30 H42 V42 H46 V30 H54 V42 H58 V30 H68 V42 H74 V88Z',P)+`<path d="M42,88 V68 C42,60 58,60 58,68 V88Z" fill="${P.K}"/><path d="M47,52 H53 V58 H47Z" fill="${P.K}"/>`,
paw:(P)=>{let s='';const t=(cx,cy,rx,ry,r)=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${r} ${cx} ${cy})" fill="${P.F}" stroke="${P.O}" stroke-width="4.6"/>`;
 s+=t(24,46,8.5,12,-24)+t(41,30,8.5,13,-8)+t(59,30,8.5,13,8)+t(76,46,8.5,12,24);
 s+=`<path d="M50,50 C70,50 82,64 80,76 C78,88 64,86 50,86 C36,86 22,88 20,76 C18,64 30,50 50,50Z" fill="${P.F}" stroke="${P.O}" stroke-width="4.6" stroke-linejoin="round"/>`;
 s+=_gt(P.ch,50,80,24,40,P.L,5);return s;},
cyclone:(P)=>{const b=(d,w)=>`<path d="${d}" fill="none" stroke="${P.O}" stroke-width="${w+6}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${P.F}" stroke-width="${w}" stroke-linecap="round"/>`;
 return b('M14,26 C44,12 90,22 86,44',10)+b('M24,44 C44,34 78,40 74,54',9)+b('M33,58 C48,52 68,56 63,67',8)+b('M44,73 C50,70 57,72 54,82',7)+`<path d="M46,88 L52,96" stroke="${P.A}" stroke-width="5" stroke-linecap="round"/>`;},
fbhelmet:(P)=>{let s=_s1('M16,60 C12,36 30,18 54,18 C78,18 90,38 88,60 L88,70 L66,72 L66,82 L40,84 C26,82 19,72 16,60Z',P);
 s+=`<path d="M28,40 C42,26 70,26 82,42" fill="none" stroke="${P.A}" stroke-width="7" stroke-linecap="round"/><circle cx="42" cy="58" r="5.5" fill="${P.K}"/>`;
 s+=`<g fill="none" stroke="${P.O}" stroke-width="9" stroke-linecap="round"><path d="M70,46 H96 M70,58 H96 M84,40 V74"/></g><g fill="none" stroke="${P.L}" stroke-width="4.4" stroke-linecap="round"><path d="M70,46 H96 M70,58 H96 M84,40 V74"/></g>`;return s;},
swords:(P)=>{const a=`<path d="M20,84 L80,16" stroke="${P.O}" stroke-width="14" stroke-linecap="round"/><path d="M20,84 L80,16" stroke="${P.L}" stroke-width="8" stroke-linecap="round"/><path d="M30,64 L44,76" stroke="${P.O}" stroke-width="12" stroke-linecap="round"/><path d="M30,64 L44,76" stroke="${P.A}" stroke-width="6.4" stroke-linecap="round"/>`;
 return a+`<g transform="${_MR}">${a}</g>`;},
hawk:(P)=>{let s=_s1('M16,90 C12,64 22,40 42,30 C54,24 68,26 74,34 L77,50 C78,58 74,68 66,76 L60,92 L50,80 C38,84 26,88 16,90Z',P);
 s+=_s1('M69,33 C79,31 90,35 93,44 C91,51 85,51 82,47 C80,43 76,42 72,44Z',P,P.A);
 s+=`<path d="M40,40 L76,44 L75,50 L42,48Z" fill="${P.D}"/><ellipse cx="62" cy="43" rx="4.6" ry="4" fill="${P.A}" stroke="${P.K}" stroke-width="1.4"/><circle cx="62.6" cy="43" r="2" fill="${P.K}"/>`+_k('M48,34 L68,41 L67,37 L56,29Z',P);
 s+=_l('M30,70 L38,76 L46,70 M28,80 L36,86 L44,80 M48,62 L55,68 L62,62',P,2.2);return s;},
falcon:(P)=>{let s=_s1('M18,90 C12,62 24,38 44,28 C58,22 72,28 76,40 L78,54 C78,64 72,72 66,78 L62,92 L52,80 C40,84 28,88 18,90Z',P);
 s+=`<path d="M24,58 C22,42 32,28 46,26 C60,24 72,30 75,40 L50,46 Z" fill="${P.D}"/><path d="M60,46 L68,66 L58,62Z" fill="${P.K}"/>`;
 s+=_s1('M72,37 C80,36 88,39 90,46 C88,52 83,51 81,48 C79,45 76,44 73,45Z',P,P.A);
 s+=`<ellipse cx="62" cy="40" rx="4.4" ry="3.8" fill="#fff" stroke="${P.K}" stroke-width="1.4"/><circle cx="62.6" cy="40" r="2" fill="${P.K}"/>`+_l('M30,72 L38,78 L46,72 M32,82 L40,88 L48,82',P,2.2);return s;},
cardinal:(P)=>{let s=_s1('M24,82 C16,62 22,40 40,30 L42,6 L56,24 C70,24 82,36 80,52 C78,68 66,80 50,86 C40,90 30,88 24,82Z',P);
 s+=`<path d="M62,42 L82,46 L78,62 L60,58Z" fill="${P.K}"/>`+_s1('M66,44 L90,54 L66,62Z',P,P.A);
 s+=`<circle cx="58" cy="46" r="3.8" fill="#fff" stroke="${P.K}" stroke-width="1.2"/><circle cx="59" cy="46" r="1.8" fill="${P.K}"/>`+_l('M30,66 Q38,62 44,68 M32,76 Q42,72 50,78',P,2);return s;},
condor:(P)=>{let s=_s1('M8,94 L14,76 L22,82 L28,66 L38,74 L48,60 L58,74 L68,66 L74,82 L84,76 L92,94Z',P,P.L);
 s+=_s1('M42,70 C38,46 44,24 58,22 C70,22 76,34 72,44 C72,52 66,60 62,70Z',P);
 s+=_s1('M70,36 C82,36 94,44 94,56 C90,62 82,60 78,54 C74,52 72,48 70,46Z',P,P.A);
 s+=`<circle cx="60" cy="36" r="4.4" fill="${P.A}" stroke="${P.K}" stroke-width="1.3"/><circle cx="60.8" cy="36" r="2" fill="${P.K}"/>`+_k('M50,30 L68,38 L66,33 L56,26Z',P);return s;},
wings:(P)=>{const w='M52,62 C64,44 80,30 98,22 C95,38 93,50 85,58 L92,62 C85,70 77,70 71,68 L73,75 C65,77 59,75 54,70Z';
 let s=_sy(w,P)+_m(_l('M60,60 C72,50 82,42 92,34 M62,66 C74,60 82,56 90,52',P,2));
 s+=_s1('M41,40 C41,26 59,26 59,40 C59,52 55,58 50,64 C45,58 41,52 41,40Z',P)+_s1('M45,48 L55,48 L50,64Z',P,P.A);
 s+=_m(`<ellipse cx="55.6" cy="38" rx="3.4" ry="2.8" fill="#fff" stroke="${P.K}" stroke-width="1.2"/><circle cx="56" cy="38" r="1.5" fill="${P.K}"/>`)+_m(_k('M52,32 L61,36 L60,33Z',P));return s;},
phoenix:(P)=>{let s=_sy('M52,62 C64,44 80,30 98,22 C95,38 93,50 85,58 L92,62 C85,70 77,70 71,68 L73,75 C65,77 59,75 54,70Z',P);
 s+=_s1('M50,60 C58,72 62,84 50,98 C38,84 42,72 50,60Z',P,P.A)+_s1('M41,40 C41,26 59,26 59,40 C59,52 55,58 50,64 C45,58 41,52 41,40Z',P)+_s1('M45,48 L55,48 L50,60Z',P,P.A)+_s1('M50,28 C54,20 50,12 46,6 C58,10 62,20 58,30Z',P,P.A);
 s+=_m(`<circle cx="55.4" cy="38" r="2.8" fill="#fff" stroke="${P.K}" stroke-width="1"/><circle cx="55.8" cy="38" r="1.3" fill="${P.K}"/>`);return s;},
catside:(P)=>{let s=_s1('M16,72 C14,50 26,32 44,28 L50,10 L60,26 C72,28 82,38 87,50 C90,58 88,64 82,66 L72,64 C66,76 56,82 44,82 C30,82 18,80 16,72Z',P);
 s+=_k('M50,12 L52,24 L58,26Z',P,P.D)+`<path d="M72,64 L82,66 L80,74 C74,78 68,76 66,70Z" fill="#1c0a0a" stroke="${P.K}" stroke-width="1.4"/><path d="M71,64 L73,71 L76,65Z" fill="#fff" stroke="${P.K}" stroke-width="1" stroke-linejoin="round"/><path d="M82,50 L90,52 L86,57Z" fill="${P.K}"/>`;
 s+=`<path d="M58,42 Q66,38 76,44 Q70,52 58,48Z" fill="${P.A}" stroke="${P.K}" stroke-width="1.5"/><ellipse cx="67" cy="45" rx="1.3" ry="3" fill="${P.K}"/>`+_k('M54,38 L78,42 L74,46 L58,43Z',P)+_l('M28,60 L36,64 M26,70 L34,72 M34,50 L40,56',P,2.2);return s;},
fox:(P)=>{let s=_sy('M50,94 L66,72 L84,56 L82,18 L62,33 C58,31 54,30.5 50,30.5Z',P);
 s+=_m(_k('M78,24 L80,42 L68,34Z',P,P.D))+_m(`<path d="M50,72 L70,62 L84,56 L66,78 L50,94Z" fill="${P.L}"/>`);
 s+=_m(`<path d="M56,50 L74,42 L71,52 L60,56Z" fill="#fff" stroke="${P.K}" stroke-width="1.4"/><path d="M61,50 L70,46 L69,52 L63,54Z" fill="${P.A}"/><circle cx="66" cy="50" r="1.6" fill="${P.K}"/>`)+_m(_k('M54,46 L77,38 L75,43 L57,52Z',P));
 s+=_k('M44,88 L56,88 L50,96Z',P)+_l('M50,64 L50,88',P,1.8);return s;},
claw:(P)=>{let s='';[0,25,50].forEach(o=>{s+=`<path transform="translate(${o} 0)" d="M12,6 C36,26 50,62 42,96 C30,72 20,44 4,24Z" fill="${P.F}" stroke="${P.O}" stroke-width="4.6" stroke-linejoin="round"/>`;});
 return s+_gt(P.ch,52,66,28,44,P.L,5);},
devil:(P)=>{let s=_m(`<path d="M63,34 C71,26 75,15 72,4 C82,13 84,29 73,41Z" fill="${P.L}" stroke="${P.O}" stroke-width="3.6" stroke-linejoin="round"/>`);
 s+=_m(`<path d="M74,48 L91,39 L80,59Z" fill="${P.F}" stroke="${P.O}" stroke-width="3.6" stroke-linejoin="round"/>`);
 s+=_sy('M50,92 L58,84 C66,78 74,68 76,56 C78,44 74,34 64,30 C58,28 54,28 50,28Z',P);
 s+=_m(`<path d="M55,52 L71,47 L69,55 L58,57Z" fill="#fff" stroke="${P.K}" stroke-width="1.4"/><circle cx="64" cy="52" r="2.2" fill="${P.A}"/><circle cx="64" cy="52" r="1" fill="${P.K}"/>`)+_m(_k('M52,46 L75,39 L73,45 L55,51Z',P));
 s+=_k('M45,63 L55,63 L50,68Z',P)+`<path d="M35,70 Q50,84 65,70 Q50,77 35,70Z" fill="#1c0a0a" stroke="${P.K}" stroke-width="1.4"/><path d="M39,71 Q50,77 61,71 L61,72.6 Q50,78.6 39,72.6Z" fill="#fff"/>`;
 s+=`<path d="M45,84 L50,99 L55,84 Q50,87 45,84Z" fill="${P.D}" stroke="${P.O}" stroke-width="2.4" stroke-linejoin="round"/>`;return s;},
husky:(P)=>{let s=_sy('M50,91 L60,83 C68,78 76,68 78,56 L84,20 L66,33 C60,30 55,30 50,30Z',P);
 s+=_m(_k('M76,28 L78,42 L68,35Z',P,'#f3f5f7'));
 s+=_m(`<path d="M50,44 C56,44 60,42 64,38 C66,47 70,55 73,61 C67,73 59,81 50,86Z" fill="#f3f5f7"/>`);
 s+=_m(`<path d="M55,50 L70,45 L68,53 L59,55Z" fill="#fff" stroke="${P.K}" stroke-width="1.4"/><circle cx="63.6" cy="50" r="2.4" fill="#7cc4f2"/><circle cx="63.6" cy="50" r="1.1" fill="#111"/>`)+_m(`<path d="M53,46 L73,39 L71,44 L56,50Z" fill="${P.D}"/>`);
 s+=`<path d="M42,72 Q50,67 58,72 L50,79Z" fill="#14181d"/><path d="M50,79 L50,84 M50,84 C46,88 41,86 39,83 M50,84 C54,88 59,86 61,83" fill="none" stroke="#14181d" stroke-width="2" stroke-linecap="round"/>`;return s;},
shark:(P)=>{let s=_s1('M48,34 L58,8 L70,36Z',P);
 s+=_s1('M4,62 C16,42 44,30 72,33 C84,34 94,42 96,52 L94,58 L62,60 L60,70 C46,78 26,78 12,72 L4,82 L8,66Z',P);
 s+=`<path d="M12,72 C26,78 46,78 60,70 L62,62 C48,68 30,70 14,66Z" fill="${P.L}"/>`;
 s+=`<path d="M60,58 L96,54 C94,66 84,74 72,74 L60,70Z" fill="#3a0d0d" stroke="${P.O}" stroke-width="2.6" stroke-linejoin="round"/>`;
 s+=`<path d="M64,58 L66,63 L69,58 L71,63 L74,57.5 L76,62.5 L79,57 L81,62 L84,56.5 L86,61 L89,56 L91,60 L94,55.5Z M64,71 L66,66 L69,71.5 L71,66 L74,72 L76,66.5 L79,72 L81,66 L84,71" fill="#fff" stroke="${P.K}" stroke-width=".8" stroke-linejoin="round"/>`;
 s+=`<circle cx="78" cy="44" r="3" fill="#111"/><circle cx="77" cy="43" r=".9" fill="#fff"/><path d="M73,40 L84,43" stroke="${P.K}" stroke-width="2.4" stroke-linecap="round"/>`+_l('M46,48 L44,58 M51,47 L49,57 M56,46 L54,56',P,2);return s;},
dolphin:(P)=>{let s=_s1('M50,28 L58,10 L66,30Z',P);
 s+=_s1('M24,86 C18,58 40,28 72,26 C82,26 88,30 92,36 L98,38 L92,42 C86,42 80,40 74,41 C52,44 34,62 32,88Z',P);
 s+=_s1('M28,84 L10,92 L18,80 L8,72 L24,76Z',P);
 s+=`<path d="M32,86 C34,64 50,48 72,44 L74,41 C52,44 34,62 30,86Z" fill="${P.L}"/><circle cx="76" cy="33" r="2.4" fill="#111"/><circle cx="75.4" cy="32.4" r=".7" fill="#fff"/>`+_l('M84,39 L92,39',P,1.6);return s;},
marlin:(P)=>{let s=_s1('M38,48 C42,26 58,20 70,40Z',P,P.D);
 s+=_s1('M16,72 C28,50 52,40 72,40 L99,30 L77,47 C77,57 67,66 53,70 C41,74 29,75 16,72Z',P);
 s+=_s1('M18,72 L3,56 L10,72 L2,88Z',P);
 s+=`<path d="M22,72 C34,74 48,72 58,66 L66,58 C54,64 40,68 24,68Z" fill="${P.L}"/><circle cx="68" cy="47" r="2.6" fill="#111"/><circle cx="67.3" cy="46.3" r=".8" fill="#fff"/>`+_l('M60,52 C58,56 58,60 60,64',P,1.8);return s;},
pirate:(P)=>{let s=`<g stroke-linecap="round"><path d="M14,90 L86,18 M86,90 L14,18" stroke="${P.O}" stroke-width="11"/><path d="M14,90 L86,18 M86,90 L14,18" stroke="#d9dde2" stroke-width="5.5"/><path d="M22,72 L32,82 M78,72 L68,82" stroke="${P.O}" stroke-width="10"/><path d="M22,72 L32,82 M78,72 L68,82" stroke="${P.A}" stroke-width="5"/></g>`;
 s+=_s1('M26,58 C26,38 37,28 50,28 C63,28 74,38 74,58 C74,66 70,70 66,72 L66,82 L34,82 L34,72 C30,70 26,66 26,58Z',P,'#efe9dc');
 s+=_s1('M24,50 C24,30 37,20 50,20 C63,20 76,30 76,50 C66,42 34,42 24,50Z',P)+_s1('M74,42 L90,36 L83,47 L92,52 L75,50Z',P);
 s+=`<path d="M24,50 C34,42 66,42 76,50" fill="none" stroke="${P.K}" stroke-width="1.6"/>`;
 s+=`<ellipse cx="39.5" cy="58" rx="7.5" ry="7.5" fill="#111"/><path d="M27,48 L52,66" stroke="#111" stroke-width="2.2"/><ellipse cx="60.5" cy="58" rx="7" ry="7.5" fill="#1c1c1c"/><circle cx="62" cy="57" r="1.8" fill="${P.A}"/>`;
 s+=`<path d="M50,64 L45,72 L55,72Z" fill="#1c1c1c"/><path d="M40,82 V75 M45,82 V75 M50,82 V75 M55,82 V75 M60,82 V75" stroke="#1c1c1c" stroke-width="1.6"/>`;return s;},
anchor:(P)=>{const st=(d,w)=>`<path d="${d}" fill="none" stroke="${P.O}" stroke-width="${w+6}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${P.F}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
 let s=st('M50,24 L50,88',9)+st('M30,34 L70,34',8)+st('M20,64 Q24,90 50,90 Q76,90 80,64',8);
 s+=`<circle cx="50" cy="15" r="8" fill="none" stroke="${P.O}" stroke-width="10"/><circle cx="50" cy="15" r="8" fill="none" stroke="${P.F}" stroke-width="4.5"/>`;
 s+=_s1('M10,68 L20,54 L28,70Z',P)+_s1('M90,68 L80,54 L72,70Z',P);
 s+=`<path d="M58,22 C76,30 74,46 58,50 C44,54 42,66 54,72" fill="none" stroke="${P.A}" stroke-width="3" stroke-linecap="round" stroke-dasharray="5 3"/>`;return s;},
axes:(P)=>{const one=`<path d="M22,92 L74,22" stroke="${P.O}" stroke-width="10" stroke-linecap="round"/><path d="M22,92 L74,22" stroke="#a0703c" stroke-width="5" stroke-linecap="round"/><path d="M62,24 C68,10 84,6 94,14 C88,22 86,32 90,42 C80,42 72,36 68,30Z" fill="${P.F}" stroke="${P.O}" stroke-width="4.2" stroke-linejoin="round"/><path d="M84,14 C80,22 80,30 84,38" fill="none" stroke="${P.L}" stroke-width="2"/>`;
 return one+`<g transform="${_MR}">${one}</g>`;},
buck:(P)=>{const ant='M57,34 C62,26 68,20 74,10 C77,5 77,2 75,0 M68,22 C74,20 80,18 88,12 M74,12 C80,10 84,6 86,2 M62,30 C68,30 74,32 82,30';
 let s=_m(`<path d="${ant}" fill="none" stroke="${P.O}" stroke-width="8" stroke-linecap="round"/><path d="${ant}" fill="none" stroke="${P.L}" stroke-width="3.6" stroke-linecap="round"/>`);
 s+=_m(`<path d="M60,44 C70,36 84,36 88,42 C80,49 70,51 62,50Z" fill="${P.F}" stroke="${P.O}" stroke-width="3.6" stroke-linejoin="round"/><path d="M64,45 C72,41 80,41 84,43 C78,47 71,48 65,48Z" fill="${P.L}"/>`);
 s+=_sy('M50,94 C57,94 61,89 61,81 L64,54 C66,45 62,38 56,36 L50,35Z',P);
 s+=`<path d="M41,80 C41,90 59,90 59,80 Q50,76 41,80Z" fill="${P.L}"/><path d="M43,83 Q50,79 57,83 Q56,88 50,89 Q44,88 43,83Z" fill="#14181d"/>`+_m(`<path d="M54,52 L63,49 L62,55 L56,56Z" fill="#14181d"/><circle cx="59" cy="52" r=".9" fill="#fff"/>`)+_l('M50,40 L50,56',P,1.6);return s;},
tractor:(P)=>{let s=`<path d="M76,42 L76,16" stroke="${P.O}" stroke-width="7" stroke-linecap="round"/><path d="M76,42 L76,16" stroke="#9aa3ad" stroke-width="3" stroke-linecap="round"/>`;
 s+=_s1('M30,56 L34,22 L62,22 L64,42 L92,46 L94,66 L30,66Z',P);
 s+=`<path d="M38,27 L58,27 L59,42 L37,42Z" fill="#cfe3f2" stroke="${P.O}" stroke-width="2.4"/><path d="M64,50 L90,52" stroke="${P.D}" stroke-width="2"/><path d="M66,56 L90,57" stroke="${P.D}" stroke-width="2"/>`;
 s+=`<circle cx="38" cy="70" r="22" fill="#15181d" stroke="${P.O}" stroke-width="3.6"/><circle cx="38" cy="70" r="19" fill="none" stroke="#3a3f48" stroke-width="4" stroke-dasharray="4 3"/><circle cx="38" cy="70" r="9" fill="${P.A}" stroke="${P.O}" stroke-width="2.4"/><circle cx="38" cy="70" r="3" fill="${P.O}"/>`;
 s+=`<circle cx="84" cy="78" r="12" fill="#15181d" stroke="${P.O}" stroke-width="3.2"/><circle cx="84" cy="78" r="5" fill="${P.A}" stroke="${P.O}" stroke-width="2"/>`;return s;},
stingray:(P)=>{let s=`<path d="M50,70 C52,82 58,92 68,98" fill="none" stroke="${P.O}" stroke-width="7" stroke-linecap="round"/><path d="M50,70 C52,82 58,92 68,98" fill="none" stroke="${P.F}" stroke-width="3" stroke-linecap="round"/>`;
 s+=_s1('M50,12 C66,24 90,38 97,50 C80,56 62,62 50,72 C38,62 20,56 3,50 C10,38 34,24 50,12Z',P);
 s+=`<path d="M50,20 C58,30 72,40 86,48 C72,52 60,56 50,64 C40,56 28,52 14,48 C28,40 42,30 50,20Z" fill="${P.L}" opacity=".35"/>`;
 s+=_m(`<ellipse cx="56" cy="34" rx="3.2" ry="2.4" fill="#111"/><circle cx="55" cy="33.3" r=".8" fill="#fff"/><path d="M52,29 L61,31" stroke="${P.K}" stroke-width="2" stroke-linecap="round"/>`);
 s+=[[38,46],[62,46],[30,50],[70,50],[44,54],[56,54]].map(c=>`<circle cx="${c[0]}" cy="${c[1]}" r="1.8" fill="${P.D}"/>`).join('');return s;}
};
const _ALT={panthers:['claw','cat'],wildcats:['paw','claw'],bobcats:['paw','claw'],cougars:['paw','cat'],jaguars:['paw','cat','claw'],tigers:['paw','claw','catside'],bengals:['paw','claw'],lynx:['paw','claw'],lions:['paw','claw'],bulldogs:['paw','claw'],bears:['paw','claw'],grizzlies:['paw','claw'],wolverines:['claw','paw'],badgers:['paw'],wolves:['paw','claw','fox'],coyotes:['paw','fox'],foxes:['paw'],spartans:['fbhelmet','swords'],trojans:['fbhelmet'],knights:['swords','fbhelmet'],crusaders:['swords'],cavaliers:['swords'],lancers:['swords'],gladiators:['swords','fbhelmet'],centurions:['swords'],raiders:['swords'],warriors:['swords','fbhelmet'],vikings:['swords'],chargers:['fbhelmet','bolt'],rams:['fbhelmet'],patriots:['fbhelmet'],ironmen:['fbhelmet'],mustangs:['fbhelmet'],broncos:['fbhelmet'],colts:['fbhelmet'],eagles:['wings','hawk','fbhelmet'],hawks:['wings','falcon'],falcons:['wings','hawk'],ospreys:['wings','eagle'],raptors:['wings','eagle'],nighthawks:['wings','falcon'],cardinals:['wings','fbhelmet'],condors:['wings'],griffins:['wings','eagle'],owls:['wings'],firebirds:['flame','wings'],phoenixes:['flame','wings'],thunderhawks:['eagle','hawk'],steers:['fbhelmet'],longhorns:['fbhelmet'],bison:['fbhelmet'],cobras:['claw'],vipers:['claw'],pirates:['skull','swords'],raiders:['skull','swords'],marauders:['skull'],'red devils':['flame','claw'],huskies:['paw','wolf'],sharks:['claw'],bucks:['fbhelmet'],hurricanes:['bolt'],mariners:['pirate'],loggers:['fbhelmet'],'golden bears':['paw','claw'],cubs:['paw'],bronchos:['fbhelmet'],redhawks:['wings','falcon'],seahawks:['wings','falcon'],rattlers:['claw'],zebras:['fbhelmet'],tractors:['fbhelmet'],stingrays:['shark'],yellowjackets:['claw'],ravens:['wings'],thunderbirds:['phoenix','bolt'],'polar bears':['paw','claw'],'blue devils':['flame','claw'],'golden eagles':['wings','hawk'],'wampus cats':['claw','catside'],'rough riders':['fbhelmet','swords']};
const _FLIP=new Set(['tractor','shark','dolphin','marlin','eagle','hawk','falcon','cardinal','condor','horse','dragon','gator','comet','rocket','hornet','catside']);
const _LK={};
[['cat','tiger','Tigers Bengals'],['cat','lion','Lions'],['cat','lynx','Lynx Bobcats Wildcats'],['cat','','Wildcats2'],
 ['wolf','','Wolves Wolfpack Timberwolves Coyotes Greyhounds'],['fox','','Foxes'],['catside','','Panthers Jaguars Cougars'],['bear','','Bears Grizzlies Wolverines Badgers Otters'],
 ['eagle','','Eagles Griffins'],['hawk','','Hawks Nighthawks Ospreys'],['falcon','','Falcons Raptors'],['cardinal','','Cardinals'],['condor','','Condors'],['wings','','Thunderhawks'],['phoenix','','Firebirds Phoenixes'],['owl','','Owls'],
 ['bull','bison','Bison'],['bull','long','Longhorns'],['bull','','Steers'],['ram','','Rams'],['horse','','Mustangs Stallions Broncos Colts'],['bulldog','','Bulldogs'],
 ['helm','','Spartans Trojans Gladiators Centurions'],['knight','','Knights Cavaliers Crusaders Lancers Ironmen Sentinels'],['viking','','Vikings'],
 ['pirate','','Pirates Raiders Marauders'],['devil','','Red Devils'],['husky','','Huskies'],['shark','','Sharks'],['dolphin','','Dolphins'],['marlin','','Marlins'],['anchor','','Mariners'],['axes','','Loggers'],['buck','','Bucks'],['bear','','Golden Bears Cubs'],['horse','','Bronchos'],['cyclone','','Hurricanes'],['hawk','','Redhawks Seahawks'],['snake','','Rattlers'],['hat','','Outlaws Desperados Gunslingers Wranglers'],['star','','Patriots Minutemen Rebels Mavericks Warriors'],
 ['bolt','','Thunder Thunderbolts Chargers Surge'],['flame','','Blazers Blaze Inferno Fury'],['rocket','','Rockets'],['comet','','Comets'],
 ['snake','','Cobras Vipers'],['gator','','Gators'],['dragon','','Dragons'],['hornet','','Hornets Sting'],['fbhelmet','','Titans Force'],['cyclone','','Cyclones Storm'],['crown','','Monarchs'],['ghost','','Phantoms'],['wheel','','Pioneers'],['hardhat','','Roughnecks']
].forEach(r=>r[2].split(' ').forEach(n=>{_LK[n.toLowerCase()]=[r[0],r[1]];}));
_LK['golden bears']=['bear',''];_LK['red devils']=['devil',''];_LK['blue devils']=['devil',''];_LK['polar bears']=['bear','polar'];_LK['rough riders']=['hat',''];_LK['wampus cats']=['cat','lynx'];_LK['golden eagles']=['eagle',''];
_LK['zebras']=['horse','zebra'];_LK['tractors']=['tractor',''];_LK['stingrays']=['stingray',''];_LK['yellowjackets']=['hornet',''];_LK['ravens']=['falcon','raven'];_LK['thunderbirds']=['wings',''];
/*<emb_map>*/
