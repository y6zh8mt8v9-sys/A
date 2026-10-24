// Varsity mascot art (100x100) for the most common US high school mascots. Palette P: F base, D shadow, L light,
// K detail, A accent (eyes, beak), O ink. Used when the mascot library has no image for a school.
const _VMA={};
const _VM_W='#f6f3ec',_VM_MOUTH='#3a0c10',_VM_TONG='#c9474f';
const _vmo=(P,w)=>`stroke="${P.O}" stroke-width="${w||3.2}" stroke-linejoin="round" stroke-linecap="round"`;
// big cat, front view, snarling: tiger, lion, lynx (wildcat, bobcat), panther, cougar, jaguar
_VMA.cat=(P,v)=>{
 const lion=v==='lion',lynx=v==='lynx',pan=v==='panther',cou=v==='cougar',jag=v==='jaguar',tig=v==='tiger'||v==='';
 const muz=pan?P.L:_VM_W;let s='';
 let mane='';
 if(lion){const ring=(r1,r2,n,cy)=>{const T=Math.PI*2/n,pt=(a,r)=>(50+Math.sin(a)*r).toFixed(1)+','+(cy-Math.cos(a)*r).toFixed(1);let d='M'+pt(0,r2);
   for(let i=0;i<n;i++){const a0=i*T;d+=` Q${pt(a0+T*.15,r1*.98)} ${pt(a0+T*.78,r1)} Q${pt(a0+T*.7,(r1+r2)/2)} ${pt(a0+T,r2)}`;}return d+'Z';};
  mane=`<path d="${ring(49,38,13,52)}" fill="${P.D}" ${_vmo(P)}/><path d="${ring(41,33,13,53)}" fill="${_mx(P.D,P.F,.45)}"/>`;}
 // head silhouette
 const ear=lion?'C58,22 62,20 66,20 C72,18 78,22 80,30':'C56,22 60,21 63,20 L'+(lynx?'77,4':'76,8')+' L84,30';
 const ruff=pan||cou||jag?'C90,38 92,46 91,54 C90,62 88,68 82,74':'C88,34 90,38 90,42 L96,47 L89,52 L95,59 L87,63 L91,71 L80,74';
 const R=`M50,22 ${ear} ${ruff} C76,84 66,92 50,95`;
 s+=`<path d="${_vmMirror(R)}" fill="${P.F}" ${_vmo(P,3.4)}/>`;
 // inner ears
 if(!lion)s+=_m(`<path d="M66,22 L${lynx?'76,9':'75,13'} L80,28 C76,25 71,23 66,22Z" fill="${P.D}"/>`);
 else s+=_m(`<path d="M68,23 C72,21 76,24 77,29 C73,27 70,26 68,23Z" fill="${P.D}"/>`);
 if(lynx)s+=_m(`<path d="M76,9 L79,0 L80,12Z" fill="${P.O}" ${_vmo(P,1.6)}/>`);
 // forehead light bridge
 s+=`<path d="M50,38 C54,44 56,51 57,57 L43,57 C44,51 46,44 50,38Z" fill="${P.L}" opacity=".55"/>`;
 // tiger stripes, jaguar spots, cougar tear lines
 if(tig)s+=`<path d="M50,24 L47,35 L50,33 L53,35Z" fill="${P.O}"/>`+_m(`<path d="M58,25 L55,36 L54,26Z M88,44 L75,47 L86,49Z M93,57 L77,56 L89,61Z M85,67 L74,64 L81,71Z M70,24 L64,34 L66,24Z" fill="${P.O}"/>`);
 if(jag||lynx)s+=_m(`<circle cx="58" cy="31" r="2.2" fill="${P.D}"/><circle cx="66" cy="34" r="1.8" fill="${P.D}"/><circle cx="80" cy="50" r="2.4" fill="${P.D}"/><circle cx="84" cy="60" r="2" fill="${P.D}"/><circle cx="76" cy="58" r="1.6" fill="${P.D}"/>`);
 // cel shading: cheeks below the eyes
 s+=_m(`<path d="M58,52 C66,52 76,50 86,46 C84,56 80,64 72,70 C70,62 64,56 58,52Z" fill="${P.D}" opacity=".55"/>`);
 // muzzle
 s+=`<path d="M50,55 C56,55 61,57 64,60 C70,62 74,67 73,73 C72,80 66,85 58,86 L50,87 L42,86 C34,85 28,80 27,73 C26,67 30,62 36,60 C39,57 44,55 50,55Z" fill="${muz}" ${_vmo(P,2)}/>`;
 if(cou)s+=_m(`<path d="M57,51 C60,56 62,60 62,64" fill="none" stroke="${P.O}" stroke-width="2.4" stroke-linecap="round"/>`);
 // eyes with an angry brow
 s+=_m(`<path d="M55,49 C59,44 65,42 72,42 C70,47 64,51 57,51Z" fill="${P.A}" ${_vmo(P,1.6)}/><ellipse cx="64" cy="47" rx="1.5" ry="3.2" fill="${P.O}"/><circle cx="66" cy="45.2" r=".9" fill="#fff"/>`
  +`<path d="M52,47 L72,38 L76,40 C69,42 62,45 56,50Z" fill="${P.O}"/>`);
 // nose, mouth, fangs
 s+=`<path d="M50,64 L50,69" stroke="${P.O}" stroke-width="2"/>`;
 s+=`<path d="M38,70 C42,67 46,67 50,69 C54,67 58,67 62,70 C62,78 57,85 50,86 C43,85 38,78 38,70Z" fill="${_VM_MOUTH}" ${_vmo(P,2)}/><ellipse cx="50" cy="81" rx="6" ry="3" fill="${_VM_TONG}"/>`;
 s+=_m(`<path d="M55,69.2 L57.5,79 L59.6,69.8Z" fill="#fff" ${_vmo(P,1)}/><path d="M53,85 L54.5,80 L56.5,84.4Z" fill="#fff" ${_vmo(P,.8)}/>`);
 s+=`<path d="M43.5,57 L56.5,57 C56.5,60.5 53,63.5 50,64.5 C47,63.5 43.5,60.5 43.5,57Z" fill="${pan?P.O:'#2a1416'}" ${_vmo(P,1.4)}/>`;
 s+=_m(`<circle cx="58" cy="66" r=".9" fill="${P.O}"/><circle cx="61" cy="63.5" r=".9" fill="${P.O}"/><circle cx="62" cy="67.5" r=".9" fill="${P.O}"/>`);
  return lion?mane+`<g transform="translate(50 60) scale(.8) translate(-50 -56)">${s}</g>`:s;};
// close a right-half path by mirroring it onto the left side
function _vmMirror(R){
 const toks=R.trim().split(/\s+/);
 // parse into segments of [cmd, [points]]
 const segs=[];let cur=null;for(const t of toks){if(/^[MCL]/.test(t)){cur=[t[0],[]];segs.push(cur);const r=t.slice(1);if(r)cur[1].push(r);}else cur[1].push(t);}
 const P=x=>x.split(',').map(Number),F=([x,y])=>`${(100-x).toFixed(1)},${y}`;
 let d='M'+segs[0][1][0];for(let j=1;j<segs.length;j++)d+=' '+segs[j][0]+segs[j][1].join(' ');
 // walk back
 for(let j=segs.length-1;j>=1;j--){const[c,ps]=segs[j];const prev=j===1?segs[0][1][0]:segs[j-1][1][segs[j-1][1].length-1];
  if(c==='L')d+=' L'+F(P(prev));else d+=' C'+F(P(ps[1]))+' '+F(P(ps[0]))+' '+F(P(prev));}
 return d+'Z';}
// bird of prey head in profile facing right: eagle (white head or team color), hawk, falcon (dark cheek mark), cardinal (crest, short beak), raven
_VMA.eagle=(P,v)=>{
 const card=v==='cardinal',fal=v==='falcon',rav=v==='raven',bald=!v&&!P.var,hd=bald?_VM_W:P.F,sh=bald?'#c4c9d1':P.D;
 const gold=Math.abs(_lm(P.F)-_lm('#f2b81f'))<.12&&!bald?'#fbf3dc':'#f2b81f',bk=card?'#f29a16':gold,bkD=_mx(bk,'#000000',.3);let s='';
 if(card)s+=`<path d="M38,30 L16,12 L36,17 L26,2 L46,15 L52,4 L58,22Z" fill="${hd}" ${_vmo(P)}/>`;
 // beak first, so the head feathers sit over its base
 if(card)s+=`<path d="M70,30 C84,30 95,36 98,45 C92,47 82,47 70,46Z" fill="${bk}" ${_vmo(P,2.6)}/><path d="M70,46 L96,47 C93,53 84,57 70,55Z" fill="${bkD}" ${_vmo(P,2.6)}/>`;
 else s+=`<path d="M66,50 L87,50 C89,54 88,59 83,61 L66,62Z" fill="${bkD}" ${_vmo(P,2.6)}/><path d="M66,22 C86,18 98,29 99,44 C99,54 95,61 88,65 C91,58 90,53 86,50 L66,50Z" fill="${bk}" ${_vmo(P,2.6)}/>`
  +`<path d="M84,25 C91,27 95,33 96,40" fill="none" stroke="${_mx(bk,'#ffffff',.5)}" stroke-width="2.2" stroke-linecap="round"/>`;
 // head and neck with a feathered nape; the front edge curves over the beak
 s+=`<path d="M56,19 C66,17 72,19 76,22 C79,28 76,35 79,41 C81,47 77,56 66,62 L74,68 L62,68 L68,76 L54,73 L57,84 L44,77 L45,91 L34,82 L31,95 L24,85 L16,92 L16,80 L6,81 L13,70 L3,67 L14,59 L5,52 L17,46 C21,31 38,21 56,19Z" fill="${hd}" ${_vmo(P,3.4)}/>`;
 s+=`<path d="M17,46 C21,33 33,24 48,20 C37,28 30,38 28,50 C27,62 32,71 41,77 L34,82 L31,95 L24,85 L16,92 L16,80 L6,81 L13,70 L3,67 L14,59 L5,52Z" fill="${sh}"/>`;
 s+=`<path d="M34,58 L45,62 L38,67 M44,46 L55,51 L48,55 M27,71 L37,73" fill="none" stroke="${P.O}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>`;
 if(fal||rav)s+=`<path d="M64,44 C63,53 59,60 52,64 C56,56 57,49 57,43Z" fill="${P.O}"/>`;
 if(card)s+=`<path d="M60,34 L78,27 C80,36 80,46 76,56 L72,58 C66,53 62,45 60,34Z" fill="${P.O}"/>`;
 // eye under a flat, heavy brow
 s+=`<path d="M54,40 C58,36 65,34 71,35 C69,40 64,43 57,43Z" fill="${card?'#ffffff':'#f2b81f'}" ${_vmo(P,1.6)}/><circle cx="64.5" cy="38.6" r="2.1" fill="${P.O}"/><circle cx="65.3" cy="37.8" r=".7" fill="#fff"/>`;
 s+=`<path d="M46,35 L77,25 L81,30 C71,32 63,35 55,42Z" fill="${P.O}"/>`;
 return s;};
// bulldog, front view: heavy jowls, underbite with lower fangs, spiked collar
_VMA.bulldog=(P,v)=>{let s='';const muz=_VM_W,MT='#c9cdd4';
 // spiked collar behind the jaw
 s+=`<path d="M14,80 C28,92 72,92 86,80 L90,92 C72,104 28,104 10,92Z" fill="${P.D}" ${_vmo(P)}/>`;
 s+=[18,32,50,68,82].map((x,i)=>{const y=[89,94,96,94,89][i];return`<path d="M${x-4},${y} L${x},${y+8} L${x+4},${y}Z" fill="${MT}" ${_vmo(P,1.4)}/>`;}).join('');
 // ears
 s+=_m(`<path d="M72,20 C84,12 97,16 98,30 C92,29 86,32 81,38Z" fill="${P.D}" ${_vmo(P)}/>`);
 // head
 s+=`<path d="${_vmMirror('M50,15 C66,15 79,21 84,33 C88,43 88,53 86,61 C91,69 89,80 80,86 C72,92 60,94 50,94')}" fill="${P.F}" ${_vmo(P,3.4)}/>`;
 // brow wrinkles and forehead shading
 s+=`<path d="M50,20 C47,28 46,35 47,42 L53,42 C54,35 53,28 50,20Z" fill="${P.D}" opacity=".6"/>`;
 s+=_m(`<path d="M56,27 C62,25 68,26 72,29 M57,33 C62,31 67,32 70,34" fill="none" stroke="${P.O}" stroke-width="1.8" stroke-linecap="round"/>`);
 s+=_m(`<path d="M76,56 C84,60 88,70 84,80 C80,86 74,88 68,88 C76,80 78,68 76,56Z" fill="${P.D}" opacity=".6"/>`);
 // muzzle
 s+=`<path d="${_vmMirror('M50,50 C61,50 71,55 75,62 C79,71 74,80 65,84 L50,87')}" fill="${muz}" ${_vmo(P,2)}/>`;
 // underbite mouth with lower fangs
 s+=`<path d="M34,72 C42,69 58,69 66,72 C66,81 59,88 50,88 C41,88 34,81 34,72Z" fill="${_VM_MOUTH}" ${_vmo(P,2)}/><ellipse cx="50" cy="83" rx="7" ry="3" fill="${_VM_TONG}"/>`;
 s+=_m(`<path d="M57,73 L60,64 L63,73Z" fill="#fff" ${_vmo(P,1.2)}/><path d="M51.5,73 L53,69 L54.5,73Z M54.5,73 L56,69.5 L57.5,73Z" fill="#fff" ${_vmo(P,.8)}/>`);
 // jowls over the top of the mouth
 s+=_m(`<path d="M50,62 C55,67 63,67 70,64 C73,70 69,76 62,75 C57,74 53,71 50,68Z" fill="${muz}" ${_vmo(P,2)}/>`);
 // nose
 s+=`<path d="M40,53 C45,49 55,49 60,53 C61,58 56,62 50,63 C44,62 39,58 40,53Z" fill="#241617" ${_vmo(P,1.6)}/><path d="M44,53 C47,51 50,51 52,52" fill="none" stroke="#ffffff" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>`;
 // eyes under a heavy brow
 s+=_m(`<path d="M56,45 C59,41 64,40 69,41 C68,45 63,48 58,47Z" fill="${P.A}" ${_vmo(P,1.6)}/><circle cx="63" cy="44" r="1.9" fill="${P.O}"/><circle cx="63.7" cy="43.3" r=".6" fill="#fff"/>`
  +`<path d="M52,42 L72,35 L75,39 C68,40 62,42 56,47Z" fill="${P.O}"/>`);
 return s;};
// Corinthian helmet in profile facing right with a swept crest: Spartans, Trojans, Warriors, Titans, Gladiators
_VMA.helm=(P,v)=>{let s='';const pl=P.A,plD=_mx(pl,'#000000',.3),tr=_mx(P.F,'#ffffff',.55);
 // crest
 s+=`<path d="M86,30 C85,11 67,0 46,2 C25,4 9,19 4,46 L8,44 L7,52 L13,46 C19,30 31,21 46,19 C60,17 72,21 79,30Z" fill="${pl}" ${_vmo(P)}/>`;
 s+=[[78,10,70,22],[66,4,62,19],[52,2,52,18],[38,5,42,19],[25,11,32,23],[15,21,23,29],[8,33,16,37]].map(([a,b,c,d])=>`<path d="M${a},${b} L${c},${d}" stroke="${plD}" stroke-width="1.8" stroke-linecap="round"/>`).join('');
 // helmet shell
 s+=`<path d="M34,40 C38,24 52,16 66,17 C80,18 90,29 90,43 L90,72 L82,77 L80,59 C76,57 72,59 70,63 L72,85 C70,91 62,93 54,91 L46,79 C40,83 30,87 20,87 C25,79 29,71 30,61 C30,53 31,46 34,40Z" fill="${P.F}" ${_vmo(P,3.4)}/>`;
 s+=`<path d="M42,30 C50,22 60,20 70,21 C60,24 52,28 46,36Z" fill="${tr}" opacity=".7"/>`;
 s+=`<path d="M30,61 C30,53 31,46 34,40 C36,50 40,58 46,64 C42,72 36,80 20,87 C25,79 29,71 30,61Z" fill="${P.D}"/>`;
 // brow band and edge trim
 s+=`<path d="M40,42 C52,36 72,36 90,40" fill="none" stroke="${pl}" stroke-width="4.5" stroke-linecap="round"/><path d="M40,42 C52,36 72,36 90,40" fill="none" stroke="${P.O}" stroke-width="1.2" stroke-linecap="round" transform="translate(0 3)"/>`;
 // eye slot and face opening
 s+=`<path d="M60,47 L90,45 L90,53 L81,55 L80,59 C76,57 72,59 70,63 L63,60 C61,56 60,51 60,47Z" fill="${P.O}"/>`;
 s+=`<path d="M46,79 L54,91 M58,66 C60,74 63,82 66,89" fill="none" stroke="${P.O}" stroke-width="2" stroke-linecap="round"/>`;
 s+=[[44,52],[48,66],[38,72]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.6" fill="${tr}" ${_vmo(P,1)}/>`).join('');
 return s;};
// horse head in profile facing right with a flowing mane: Mustangs, Broncos, Colts, Stallions (zebra stripes as a variant)
_VMA.horse=(P,v)=>{let s='';const zb=v==='zebra',F=zb?'#f2f2f2':P.F,D=zb?'#17191c':P.D,mn=zb?'#17191c':P.D;
 // mane
 s+=`<path d="M50,12 C38,12 28,20 23,30 L35,29 C24,37 15,48 13,60 L25,56 C16,66 10,77 8,90 L21,84 C19,89 19,93 21,97 L31,97 C29,70 37,42 52,22Z" fill="${mn}" ${_vmo(P)}/>`;
 // head and neck
 s+=`<path d="M26,97 C28,70 36,41 49,23 L53,4 L61,16 C67,16 73,20 77,26 C85,38 92,50 96,60 C98,66 96,72 90,75 L84,77 C80,81 74,81 70,77 C64,73 60,67 54,67 C52,77 55,88 61,97Z" fill="${F}" ${_vmo(P,3.4)}/>`;
 if(zb)s+=`<path d="M40,46 L56,40 L42,54Z M36,62 L54,56 L38,70Z M34,80 L52,76 L36,88Z M60,24 L66,34 L56,30Z" fill="#17191c"/>`;
 // cheek, inner ear, forelock
 s+=`<path d="M83,46 C89,53 95,59 96,63 C97,69 94,74 88,76 L84,77 C80,80 75,80 72,77 C77,69 81,58 83,46Z" fill="${zb?'#d9d9d9':P.L}"/>`;
 s+=`<path d="M54,67 C51,56 56,46 66,45 C72,45 76,48 78,52" fill="none" stroke="${P.O}" stroke-width="2.2" stroke-linecap="round"/>`;
 s+=`<path d="M44,22 C36,28 30,36 26,44 M38,40 C30,48 24,58 21,68 M30,64 C24,72 20,80 18,88" fill="none" stroke="${_mx(mn,'#ffffff',.3)}" stroke-width="1.8" stroke-linecap="round"/>`;
 s+=`<path d="M54,9 L58,16 L55,18Z" fill="${D}"/><path d="M60,15 C62,22 60,28 56,32 C62,30 66,26 66,20Z" fill="${mn}" ${_vmo(P,1.6)}/>`;
 // nostril, mouth
 s+=`<path d="M88,62 C91,60 94,62 94,65 C92,67 89,66 88,62Z" fill="${P.O}"/><path d="M84,77 C86,74 90,73 93,73" fill="none" stroke="${P.O}" stroke-width="2" stroke-linecap="round"/>`;
 s+=`<path d="M74,52 C80,54 84,58 86,62" fill="none" stroke="${P.O}" stroke-width="1.8" stroke-linecap="round"/>`;
 // eye under a heavy brow
 s+=`<path d="M61,35 C65,31 71,30 75,32 C73,36 68,39 63,39Z" fill="#ffffff" ${_vmo(P,1.5)}/><circle cx="70" cy="34.4" r="2" fill="${P.O}"/>`;
 s+=`<path d="M58,32 L76,26 L78,30 C72,31 67,33 62,37Z" fill="${P.O}"/>`;
 return s;};
const _VM_SKIN='#e2a47c',_VM_BONE='#efe6cf';
// viking, front view: horned helmet with nose guard, shouting face, braided beard
_VMA.viking=(P,v)=>{let s='';const bd=P.var?'#b98545':'#7a4a24',bdD=_mx(bd,'#000000',.35),MT=_mx(P.F,'#ffffff',.5);
 s+=_m(`<path d="M76,32 C88,28 95,17 92,3 C99,13 100,31 86,42Z" fill="${_VM_BONE}" ${_vmo(P)}/><path d="M84,34 L88,30 M88,26 L92,22" stroke="${P.O}" stroke-width="1.6" stroke-linecap="round"/>`);
 // face
 s+=`<path d="M25,44 L75,44 C77,55 74,63 70,67 L30,67 C26,63 23,55 25,44Z" fill="${_VM_SKIN}" ${_vmo(P,3)}/>`;
 // beard and moustache
 s+=`<path d="${_vmMirror('M50,64 C62,66 72,62 78,52 C77,66 79,80 68,91 L61,85 L57,97 L50,88')}" fill="${bd}" ${_vmo(P,3)}/>`;
 s+=`<path d="M40,72 C44,69 56,69 60,72 C59,80 55,83 50,83 C45,83 41,80 40,72Z" fill="${_VM_MOUTH}" ${_vmo(P,1.8)}/><path d="M42,72.5 L58,72.5 L57,75 L43,75Z" fill="#fff"/>`;
 s+=_m(`<path d="M50,66 C56,63 64,64 70,70 C64,70 58,70 52,72Z" fill="${bdD}" ${_vmo(P,1.6)}/><path d="M56,84 L58,92 M62,80 L66,88" stroke="${bdD}" stroke-width="1.8" stroke-linecap="round"/>`);
 // eyes and brows under the brim
 s+=_m(`<path d="M55,53 C58,50 63,49 67,50 C66,54 62,56 57,55Z" fill="#fff" ${_vmo(P,1.4)}/><circle cx="62" cy="52.3" r="1.7" fill="${P.O}"/><path d="M52,50 L70,45 L72,48 C66,49 60,51 55,54Z" fill="${P.O}"/>`);
 s+=`<path d="M46,52 L50,62 L54,52Z" fill="${_mx(_VM_SKIN,'#000000',.15)}"/>`;
 // helmet
 s+=`<path d="M18,46 C18,25 32,12 50,12 C68,12 82,25 82,46Z" fill="${P.F}" ${_vmo(P,3.4)}/><path d="M30,24 C36,17 44,15 50,15 C42,19 36,24 33,32Z" fill="${MT}" opacity=".6"/>`;
 s+=`<path d="M16,42 L84,42 L84,49 L16,49Z" fill="${P.D}" ${_vmo(P,2.6)}/><path d="M46,14 L54,14 L54,40 L46,40Z" fill="${P.D}" ${_vmo(P,2)}/><path d="M46,46 L54,46 L53,61 L50,64 L47,61Z" fill="${P.D}" ${_vmo(P,2.4)}/>`;
 s+=[22,32,68,78].map(x=>`<circle cx="${x}" cy="45.5" r="1.5" fill="${MT}"/>`).join('');
 return s;};
// ram, front view with spiral horns
_VMA.ram=(P,v)=>{let s='';const hn=_VM_BONE,hnD=_mx(hn,'#000000',.32);
 const sp='M58,28 C70,12 95,16 97,38 C99,57 81,67 71,57 C63,49 70,38 78,43';
 s+=_m(`<path d="${sp}" fill="none" stroke="${P.O}" stroke-width="18" stroke-linecap="round"/><path d="${sp}" fill="none" stroke="${hn}" stroke-width="12.4" stroke-linecap="round"/>`
  +`<path d="${sp}" fill="none" stroke="${hnD}" stroke-width="12.4" stroke-dasharray="1.6 5.2" stroke-linecap="butt"/>`);
 s+=`<path d="M50,22 C61,22 67,31 67,43 C67,59 61,74 57,86 C55,93 45,93 43,86 C39,74 33,59 33,43 C33,31 39,22 50,22Z" fill="${P.F}" ${_vmo(P,3.4)}/>`;
 s+=`<path d="M50,26 C47,40 46,56 47,72 L53,72 C54,56 53,40 50,26Z" fill="${P.L}" opacity=".5"/>`;
 s+=`<path d="M42,28 L46,34 L50,27 L54,34 L58,28" fill="none" stroke="${P.D}" stroke-width="2" stroke-linejoin="round"/>`;
 s+=`<ellipse cx="50" cy="83" rx="9.5" ry="7.5" fill="${P.L}" ${_vmo(P,2)}/>`+_m(`<path d="M53,81 C55,79 58,80 58,82 C57,84 55,84 53,81Z" fill="${P.O}"/>`)+`<path d="M45,88 C48,90 52,90 55,88" fill="none" stroke="${P.O}" stroke-width="1.6" stroke-linecap="round"/>`;
 s+=_m(`<path d="M54,51 C57,47 62,46 66,47 C65,51 61,53 56,53Z" fill="${P.A}" ${_vmo(P,1.5)}/><rect x="59" y="48.6" width="4.4" height="2.4" rx="1" fill="${P.O}"/><path d="M51,48 L68,42 L70,45 C64,46 59,48 54,52Z" fill="${P.O}"/>`);
 return s;};
// hornet in profile facing right: striped abdomen and stinger, angry face, wings
_VMA.hornet=(P,v)=>{let s='';const Y=P.F,WG='#eef4fb';
 s+=`<path d="M46,42 C38,18 52,4 66,8 C72,20 62,36 52,46Z" fill="${WG}" opacity=".95" ${_vmo(P,2.6)}/><path d="M42,46 C26,30 26,14 38,10 C48,18 50,32 46,46Z" fill="${WG}" opacity=".95" ${_vmo(P,2.6)}/>`;
 s+=`<path d="M52,40 L58,30 M56,36 L62,22" stroke="#b8c6d8" stroke-width="1.4" stroke-linecap="round"/>`;
 s+=`<path d="M44,54 C42,74 28,90 10,95 C9,80 16,60 32,49 C36,46 42,48 44,54Z" fill="${Y}" ${_vmo(P,3.2)}/>`;
 s+=`<path d="M38,51 C40,58 38,66 33,72 L26,78 C31,71 34,62 32,53Z M26,62 C27,70 23,79 17,86 L13,89 C18,81 21,73 20,65Z" fill="${P.O}"/>`;
 s+=`<path d="M10,95 L1,100 L8,90Z" fill="${P.O}" ${_vmo(P,1.6)}/>`;
 s+=`<circle cx="52" cy="54" r="11" fill="${P.D}" ${_vmo(P,3.2)}/>`;
 s+=`<path d="M48,62 C44,70 46,78 52,82 M56,64 C58,72 62,76 68,76" fill="none" stroke="${P.O}" stroke-width="3" stroke-linecap="round"/>`;
 s+=`<path d="M66,30 C78,28 88,36 88,48 C88,58 80,64 70,62 C62,60 58,52 60,42 C61,36 63,32 66,30Z" fill="${Y}" ${_vmo(P,3.2)}/>`;
 s+=`<path d="M70,30 C70,18 76,10 84,8 M76,32 C80,22 88,18 96,20" fill="none" stroke="${P.O}" stroke-width="2.4" stroke-linecap="round"/>`;
 s+=`<path d="M72,42 C76,38 82,38 86,40 C84,45 80,47 74,46Z" fill="#fff" ${_vmo(P,1.5)}/><circle cx="80.5" cy="42.6" r="1.8" fill="${P.O}"/><path d="M68,40 L86,33 L88,37 C82,38 76,40 71,44Z" fill="${P.O}"/>`;
 s+=`<path d="M82,56 L92,60 L84,64 M80,60 L86,68" fill="none" stroke="${P.O}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
 return s;};

// these drawings replace the older ones; the mascot names below point at them
Object.assign(_LGO,{cat:_VMA.cat,eagle:_VMA.eagle,hawk:P=>_VMA.eagle(P,'hawk'),falcon:(P,v)=>_VMA.eagle(P,v==='raven'?'raven':'falcon'),cardinal:P=>_VMA.eagle(P,'cardinal'),
  bulldog:_VMA.bulldog,helm:_VMA.helm,horse:_VMA.horse,viking:_VMA.viking,ram:_VMA.ram,hornet:_VMA.hornet});
for(const[n,k]of [['panthers',['cat','panther']],['cougars',['cat','cougar']],['pumas',['cat','cougar']],['mountain lions',['cat','cougar']],['jaguars',['cat','jaguar']],['jaguares',['cat','jaguar']],
  ['bearcats',['cat','lynx']],['hillcats',['cat','lynx']],['golden tigers',['cat','tiger']],['bayou bengals',['cat','tiger']],['warriors',['helm','']],['titans',['helm','']],['wolverines',['wolverine','']],
  ['badgers',['badger','']],['otters',['otter','']],['patriots',['minuteman','']],['halcones',['falcon','']],['águilas',['eagle','']],['cardenales',['cardinal','']],['riverhawks',['hawk','']],
  ['lobos',['wolf','']],['osos',['bear','']],['black bears',['bear','']],['kodiaks',['bear','']],['broncs',['horse','']],['toros',['bull','']],['big reds',['bull','']],['buffaloes',['bull','bison']],['northmen',['viking','']],['bighorns',['ram','']]])_LK[n]=k;
