// ═══════════ v2.08 new emblems, batch C: people, legends, machines and tools ═══════════
(function(){
const W='#ffffff',B='#16181d',G='#f0b72f';
const fill=(d,f,P,w)=>`<path d="${d}" fill="${f}" stroke="${P.O}" stroke-width="${w||3}" stroke-linejoin="round"/>`;
const ln=(d,c,w)=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w||2}" stroke-linecap="round" stroke-linejoin="round"/>`;
const st=(d,w,c,P)=>ln(d,P.O,w+5)+ln(d,c,w);
const dot=(x,y,r,c)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c||'#111'}"/>`;
const circ=(x,y,r,f,P,w)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" stroke="${P.O}" stroke-width="${w||3}"/>`;
const star=(x,y,r,f,P)=>{let d='';for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r*0.45:r;d+=(i?'L':'M')+(x+Math.cos(a)*q).toFixed(1)+','+(y+Math.sin(a)*q).toFixed(1);}return fill(d+'Z',f,P,1.6);};
Object.assign(_LGO,{
admiral:(P)=>{let s=fill('M4,62 C14,36 34,24 50,24 C66,24 86,36 96,62 C80,56 66,54 50,54 C34,54 20,56 4,62Z',P.F,P,3.5)+fill('M8,60 C22,54 36,52 50,52 C64,52 78,54 92,60 L94,66 C78,60 64,58 50,58 C36,58 22,60 6,66Z',G,P,2);
 s+=circ(50,40,9,G,P,2.4)+ln('M50,34 L50,47 M45,38 L55,38 M44,44 C46,48 54,48 56,44',P.O,1.8)+fill('M50,24 C46,16 54,12 56,18Z','#f4f4f4',P,1.4);return s;},
captain:(P)=>{let s=fill('M14,46 C14,28 32,18 50,18 C68,18 86,28 86,46Z','#f4f4f4',P,3.5)+fill('M14,46 L86,46 L84,58 L16,58Z',P.F,P,3);
 s+=fill('M14,58 C30,66 70,66 86,58 C82,74 68,80 50,80 C32,80 18,74 14,58Z','#1f2229',P,3)+ln('M26,52 L74,52',G,2.4)+star(50,32,8,G,P)+fill('M30,60 C40,62 60,62 70,60',G,P,1.6);return s;},
cadet:(P)=>{let s=fill('M24,24 L76,24 L72,74 L28,74Z',P.F,P,3.5)+fill('M20,74 L80,74 C78,82 70,86 50,86 C30,86 22,82 20,74Z','#1f2229',P,3);
 s+=fill('M22,24 L78,24 L78,32 L22,32Z',G,P,2)+fill('M50,4 C54,4 56,8 56,12 L54,24 L46,24 L44,12 C44,8 46,4 50,4Z','#f4f4f4',P,2)+circ(50,48,9,G,P,2)+star(50,48,5,P.F,P)+ln('M28,66 L72,66',G,2);return s;},
minuteman:(P)=>{let s=st('M12,92 L86,18',4,'#8a5a32',P)+st('M80,24 L94,10',2.6,'#9aa3ad',P);
 s+=fill('M8,60 C20,44 36,36 50,40 C64,36 80,44 92,60 C76,58 64,64 50,72 C36,64 24,58 8,60Z','#22252b',P,3.5)+fill('M50,40 C42,30 42,22 50,18 C58,22 58,30 50,40Z','#22252b',P,3)+ln('M14,58 C26,52 38,52 50,62 C62,52 74,52 86,58',G,2.2)+circ(66,50,4,'#f4f4f4',P,1.6);return s;},
musketeer:(P)=>{let s=fill('M6,60 C10,40 30,30 50,30 C70,30 88,40 94,54 C80,50 66,52 50,56 C34,52 18,54 6,60Z',P.F,P,3.5)+fill('M28,40 C30,24 40,16 50,16 C62,16 70,24 72,38 Z',P.F,P,3);
 s+=fill('M60,24 C70,10 88,4 98,10 C88,12 80,20 76,30 C72,22 66,22 60,24Z','#f4f4f4',P,2.4)+ln('M66,22 C76,16 86,12 94,12',P.L,1.4)+fill('M28,38 C40,42 60,42 72,36 L72,42 C60,46 40,46 28,44Z',G,P,1.6);
 s+=st('M24,92 L80,66',2.4,'#c9d1da',P)+fill('M70,62 C74,58 80,60 82,66 L78,70Z',G,P,1.6);return s;},
highlander:(P)=>{let s=st('M20,94 L80,24',4,'#c9d1da',P)+fill('M70,30 L88,12 L80,34Z M66,26 L84,20 L74,36Z',G,P,1.6)+fill('M24,82 L32,74 L38,80 L30,88Z',G,P,1.6);
 s+=fill('M18,56 C18,40 32,30 50,30 C68,30 82,40 82,56 C70,60 30,60 18,56Z',P.F,P,3.5)+fill('M16,56 C30,62 70,62 84,56 L84,64 C70,68 30,68 16,64Z',P.D,P,2);
 s+=circ(50,24,7,'#d62828',P,2.4)+ln('M24,50 L76,50',P.L,1.6)+ln('M30,42 L70,42',P.L,1.2);let ch='';for(let x=24;x<80;x+=8)ch+=`M${x},62 l4,0 `;s+=ln(ch,'#fff',2);return s;},
shamrock:(P)=>{const leaf=(r)=>`<g transform="rotate(${r} 50 50)">${fill('M50,48 C38,40 30,26 38,16 C44,10 50,16 50,22 C50,16 56,10 62,16 C70,26 62,40 50,48Z','#2e9e4f',P,3.2)}${ln('M50,46 L50,24','#7fd38f',2)}</g>`;
 return st('M50,52 C52,70 58,82 70,94',4.4,'#2e9e4f',P)+leaf(0)+leaf(120)+leaf(240)+circ(50,50,5,'#2e9e4f',P,2);},
thistle:(P)=>{let s=st('M50,58 L50,96',4,'#3f8a4a',P)+fill('M50,72 C36,64 22,66 14,74 C26,74 36,78 46,84Z M50,78 C64,70 78,72 86,80 C74,80 64,84 54,90Z','#3f8a4a',P,2.4);
 s+=fill('M34,44 C34,32 40,26 50,26 C60,26 66,32 66,44 C66,54 60,60 50,60 C40,60 34,54 34,44Z','#3f8a4a',P,3)+ln('M38,36 L62,52 M62,36 L38,52 M50,30 L50,58',P.L,1.4);
 let t='';for(let i=0;i<9;i++){const x=32+i*4.5;t+=`M${x},30 L${x+(i-4)*1.6},${6+Math.abs(i-4)*2.4} `;}s+=ln(t,P.O,4.4)+ln(t,'#9c4fd8',2.4);return s;},
windmill:(P)=>{let s=fill('M38,96 L42,46 L58,46 L62,96Z',P.F,P,3.5)+fill('M36,48 L50,34 L64,48Z',P.D,P,3)+fill('M46,96 L46,82 C46,78 54,78 54,82 L54,96Z','#5a3a22',P,2);
 const blade=r=>`<g transform="rotate(${r} 50 42)">${fill('M48,42 L48,4 L54,4 L54,42Z','#f2ead8',P,2.4)}${ln('M48,12 L54,12 M48,20 L54,20 M48,28 L54,28',P.O,1.2)}</g>`;
 s+=blade(15)+blade(105)+blade(195)+blade(285)+circ(50,42,4,G,P,2);return s;},
friar:(P)=>{let s=fill('M14,96 C14,70 26,52 40,46 L60,46 C74,52 86,70 86,96Z','#7a5a3a',P,3.5)+fill('M28,40 C28,22 38,10 50,10 C62,10 72,22 72,40 C72,52 62,60 50,60 C38,60 28,52 28,40Z','#7a5a3a',P,3.5);
 s+=fill('M36,38 C36,28 42,22 50,22 C58,22 64,28 64,38 C64,48 58,54 50,54 C42,54 36,48 36,38Z','#f1c7a0',P,2)+dot(45,38,1.8)+dot(55,38,1.8)+ln('M44,46 C48,50 52,50 56,46',P.O,1.6);
 s+=ln('M30,72 C40,76 60,76 70,72',G,3)+ln('M66,74 L70,94',G,2.4)+fill('M68,92 L74,92 L71,98Z',G,P,1.2);return s;},
angel:(P)=>{let s=fill('M46,46 C30,30 10,30 4,42 C10,46 16,54 18,64 C26,56 36,54 46,58Z M54,46 C70,30 90,30 96,42 C90,46 84,54 82,64 C74,56 64,54 54,58Z','#f4f6f8',P,3);
 s+=ln('M10,42 C18,44 26,48 32,54 M90,42 C82,44 74,48 68,54',P.L,1.6)+fill('M36,96 C36,76 42,58 50,58 C58,58 64,76 64,96Z',P.F,P,3)+circ(50,44,12,'#f1c7a0',P,3);
 s+=`<ellipse cx="50" cy="24" rx="16" ry="5" fill="none" stroke="${P.O}" stroke-width="6"/><ellipse cx="50" cy="24" rx="16" ry="5" fill="none" stroke="${G}" stroke-width="3"/>`+dot(46,44,1.6)+dot(54,44,1.6)+ln('M46,50 C48,52 52,52 54,50',P.O,1.4);return s;},
demon:(P)=>{let s=fill('M30,30 C22,20 18,8 24,2 C26,12 32,18 40,22Z M70,30 C78,20 82,8 76,2 C74,12 68,18 60,22Z','#2a2a30',P,2.6);
 s+=fill('M50,20 C70,20 82,34 82,52 C82,70 68,90 50,94 C32,90 18,70 18,52 C18,34 30,20 50,20Z','#b71c1c',P,3.5)+fill('M30,46 L44,52 L32,56Z M70,46 L56,52 L68,56Z','#ffeb3b',P,1.6);
 s+=fill('M34,70 C42,76 58,76 66,70 L60,82 C54,86 46,86 40,82Z','#1c0a0a',P,1.6)+ln('M40,72 L42,77 L45,73 L48,78 L50,74 L52,78 L55,73 L58,77 L60,72',W,1.2)+fill('M50,82 L46,98 L54,98Z','#b71c1c',P,1.6);return s;},
wizard:(P)=>{let s=fill('M50,4 C46,20 40,40 30,62 L70,62 C62,46 58,28 66,14 C60,16 54,12 50,4Z',P.F,P,3.5)+fill('M10,66 C24,58 76,58 90,66 C80,72 20,72 10,66Z',P.F,P,3);
 s+=star(46,34,6,G,P)+star(58,50,4,G,P)+star(38,52,3.5,G,P)+ln('M40,64 C44,80 56,90 60,96 M60,64 C58,80 48,90 44,96',W,3)+fill('M38,64 C40,82 46,94 50,98 C54,94 60,82 62,64Z','#f4f4f4',P,2);return s;},
witch:(P)=>{let s=st('M8,90 L82,34',3.4,'#8a5a32',P)+fill('M80,36 L96,24 L98,40 L88,44Z','#c9a46a',P,2)+ln('M84,38 L94,28 M86,42 L97,36',P.O,1.2);
 s+=fill('M44,6 C42,22 38,36 30,50 L66,50 C60,38 58,24 62,10 C56,12 50,10 44,6Z','#26292f',P,3.5)+fill('M10,54 C24,46 72,46 86,54 C74,60 22,60 10,54Z','#26292f',P,3)+fill('M32,46 L64,46 L66,52 L30,52Z','#7b3fa0',P,1.8)+fill('M44,44 L52,44 L52,52 L44,52Z',G,P,1.4);return s;},
leprechaun:(P)=>{let s=fill('M26,16 L74,16 L70,56 L30,56Z','#2e9e4f',P,3.5)+fill('M12,58 C24,50 76,50 88,58 C76,66 24,66 12,58Z','#2e9e4f',P,3);
 s+=fill('M30,44 L70,44 L70,54 L30,54Z','#1f2229',P,2)+fill('M42,42 L58,42 L58,56 L42,56Z',G,P,2)+fill('M46,46 L54,46 L54,52 L46,52Z','#1f2229',P,1);
 s+=circ(80,78,5,'#c9a46a',P,1.8)+ln('M80,78 L58,88 M80,74 C82,66 88,62 92,58',P.O,2.2)+fill('M70,90 C70,84 74,82 78,82 L80,92Z','#c9a46a',P,1.6)+star(26,82,6,G,P);return s;},
pharaoh:(P)=>{let s=fill('M50,10 C70,10 86,24 86,46 L92,94 L66,80 L34,80 L8,94 L14,46 C14,24 30,10 50,10Z','#2f6fd6',P,3.5);let st2='';for(let i=0;i<6;i++)st2+=`M${18+i*3},${50+i*7} L${32+i*1},${50+i*6} M${82-i*3},${50+i*7} L${68-i*1},${50+i*6} `;
 s+=ln(st2,G,3.6)+fill('M34,30 C34,22 42,18 50,18 C58,18 66,22 66,30 L66,58 C66,70 58,80 50,80 C42,80 34,70 34,58Z','#c98a5a',P,3)+fill('M30,22 C40,16 60,16 70,22 L70,30 C60,26 40,26 30,30Z',G,P,2);
 s+=fill('M50,4 C54,8 54,14 50,18 C46,14 46,8 50,4Z',G,P,1.6)+ln('M40,44 L46,44 M54,44 L60,44',P.O,2.6)+ln('M38,44 L34,46 M62,44 L66,46',P.O,1.6)+fill('M46,78 L54,78 L52,96 L48,96Z',G,P,1.6);return s;},
sphinx:(P)=>{let s=fill('M4,88 L4,78 C14,74 26,72 40,72 L40,56 C40,42 46,32 56,30 C66,28 76,34 78,44 L80,72 L96,74 L96,88Z','#d8b878',P,3.5);
 s+=fill('M56,30 C68,28 80,34 82,46 L84,60 L76,58 C76,48 70,40 60,40 C54,40 50,44 48,48 L46,40 C48,34 52,30 56,30Z','#2f6fd6',P,2.4)+ln('M50,40 L48,58 M56,40 L56,58 M62,40 L64,58',G,2);
 s+=dot(66,48,1.8)+ln('M62,58 C64,60 68,60 70,58',P.O,1.4)+ln('M10,82 L34,82',P.D,2);return s;},
gargoyle:(P)=>{let s=fill('M50,40 C34,26 16,20 4,24 C12,30 16,40 16,52 C24,46 34,44 44,50Z M50,40 C66,26 84,20 96,24 C88,30 84,40 84,52 C76,46 66,44 56,50Z','#6e7176',P,3);
 s+=fill('M32,94 C30,76 36,60 50,58 C64,60 70,76 68,94Z','#8a8d92',P,3)+fill('M50,26 C64,26 72,36 72,48 C72,60 62,68 50,68 C38,68 28,60 28,48 C28,36 36,26 50,26Z','#8a8d92',P,3.5);
 s+=fill('M34,30 L28,12 L42,26Z M66,30 L72,12 L58,26Z','#6e7176',P,2)+fill('M38,44 L46,48 L38,50Z M62,44 L54,48 L62,50Z','#ffb02e',P,1.2)+fill('M40,58 C46,62 54,62 60,58 L56,64 L44,64Z','#1c0a0a',P,1.4);return s;},
griffin:(P)=>{let s=fill('M62,40 C78,30 92,30 98,40 C90,42 84,48 80,56 Z',P.L,P,2.6);
 s+=fill('M24,92 C20,72 26,52 38,40 C34,28 40,14 54,10 C66,6 76,14 76,24 L90,30 L76,36 C72,46 64,52 56,56 C60,68 60,80 58,92Z',P.F,P,3.5);
 s+=fill('M76,24 L92,30 L78,36Z',G,P,1.8)+dot(62,22,2.6)+ln('M44,14 L38,4 M50,10 L48,2',P.O,2.6)+ln('M34,52 C38,60 40,72 38,82',P.L,2.4);return s;},
kraken:(P)=>{let s=fill('M2,70 C20,62 34,74 50,68 C66,62 80,72 98,66 L98,98 L2,98Z','#2b86c4',P,2.6);
 const T=(d)=>ln(d,P.O,10)+ln(d,'#7b3fa0',6);s+=T('M14,72 C10,52 22,40 30,24 C34,16 30,10 24,12')+T('M86,72 C92,52 80,40 74,22 C72,14 78,10 82,14')+T('M38,70 C36,58 42,52 46,44');
 s+=fill('M48,58 L72,58 L68,66 L52,66Z','#8a5a32',P,2)+ln('M60,58 L60,30',P.O,2.4)+fill('M60,32 L76,48 L60,48Z','#f4f4f4',P,1.8)+ln('M20,40 L24,42 M24,32 L28,34 M80,38 L76,40',W,1.6);return s;},
bigfoot:(P)=>{let s=fill('M50,30 C66,30 74,44 74,62 C74,82 64,96 50,96 C36,96 28,84 28,66 C28,46 36,30 50,30Z','#5a4632',P,3.5);
 s+=circ(30,26,7,'#5a4632',P,3)+circ(44,16,7.5,'#5a4632',P,3)+circ(60,14,7.5,'#5a4632',P,3)+circ(74,22,7,'#5a4632',P,3)+circ(82,36,6,'#5a4632',P,3);
 s+=ln('M40,50 C44,56 44,64 40,70 M58,52 C56,60 58,70 62,76',P.D,2.4);return s;},
cyclops:(P)=>{let s=fill('M50,10 C72,10 86,28 86,52 C86,76 70,94 50,94 C30,94 14,76 14,52 C14,28 28,10 50,10Z',P.F,P,3.5);
 s+=`<ellipse cx="50" cy="44" rx="18" ry="14" fill="#fff" stroke="${P.O}" stroke-width="2.6"/><circle cx="50" cy="45" r="8" fill="${G}"/>`+dot(50,45,4.4)+dot(47,41,1.8,'#fff');
 s+=fill('M32,32 L68,32 L66,26 L34,26Z',P.D,P,1.6)+fill('M34,68 C42,76 58,76 66,68 L60,82 L40,82Z','#1c0a0a',P,1.6)+ln('M40,70 L42,76 M50,72 L50,78 M60,70 L58,76',W,1.6)+fill('M36,10 L40,0 L46,10Z',P.D,P,1.6);return s;},
unicorn:(P)=>{let s=fill('M20,96 C18,78 24,62 36,52 C32,40 36,26 48,20 L50,8 L56,20 C70,20 82,30 86,44 L92,58 C90,64 84,66 78,64 C72,64 66,62 62,60 C62,74 64,86 66,96Z','#f4f6f8',P,3.5);
 s+=fill('M50,20 L66,2 L60,24Z',G,P,2)+ln('M54,16 L60,14 M56,20 L62,18',P.O,1.2)+dot(66,36,2.4);
 const mane='M44,24 C36,30 30,40 30,52 C28,62 22,70 20,80 M48,30 C42,38 38,48 38,58';s+=ln(mane,P.O,8)+ln(mane,'#c87ad8',5)+ln(mane,'#7ac6e8',2);return s;},
pegasus:(P)=>{let s=fill('M44,46 C34,28 20,20 6,22 C14,26 18,34 20,42 C10,40 4,44 2,50 C12,50 22,54 30,60Z','#f4f6f8',P,3)+ln('M12,26 C20,30 26,38 30,46 M6,46 C16,48 24,52 30,56',P.L,1.6);
 s+=fill('M36,96 C34,80 38,64 48,54 C44,42 48,28 60,22 L62,12 L68,22 C80,24 90,34 92,46 L96,58 C94,64 88,66 82,64 C76,64 72,62 68,60 C68,74 70,86 72,96Z','#f4f6f8',P,3.5);
 s+=dot(76,38,2.4)+ln('M58,26 C50,34 46,46 46,56',P.O,6)+ln('M58,26 C50,34 46,46 46,56',P.F,3.4);return s;},
fireman:(P)=>{let s=fill('M14,64 C14,36 30,18 50,18 C70,18 86,36 86,64Z','#c62828',P,3.5)+fill('M4,64 C20,58 80,58 96,64 C96,74 80,80 50,80 C20,80 4,74 4,64Z','#c62828',P,3)+fill('M86,64 C94,70 98,80 96,90 C90,84 84,78 78,74Z','#c62828',P,2.6);
 s+=fill('M38,30 L62,30 L60,58 L40,58Z',G,P,2.4)+fill('M46,10 C50,6 54,10 54,18 L46,18Z',G,P,1.6)+ln('M50,36 L50,52 M42,44 L58,44',P.O,2.4)+ln('M24,40 C28,30 36,24 44,22',P.L,2);return s;},
locomotive:(P)=>{let s=fill('M10,40 L58,40 L58,72 L10,72Z',P.F,P,3.5)+fill('M58,26 L86,26 L86,72 L58,72Z',P.D,P,3.5)+fill('M54,22 L90,22 L90,28 L54,28Z','#1f2229',P,2)+fill('M64,32 L80,32 L80,46 L64,46Z','#cfe3f2',P,2);
 s+=fill('M16,26 L28,26 L26,40 L18,40Z','#1f2229',P,2.4)+`<g fill="#c9c9c2" stroke="${P.O}" stroke-width="1.8"><circle cx="22" cy="14" r="5"/><circle cx="32" cy="8" r="4"/><circle cx="42" cy="4" r="3"/></g>`;
 s+=fill('M0,72 L12,62 L12,72Z',G,P,2)+circ(22,78,9,'#1f2229',P,3)+circ(44,78,9,'#1f2229',P,3)+circ(74,80,7,'#1f2229',P,3)+ln('M22,78 L74,80',G,2.4);return s;},
jet:(P)=>{let s=fill('M50,4 C56,10 58,24 58,40 L94,62 L94,70 L58,60 L56,82 L68,92 L68,96 L50,92 L32,96 L32,92 L44,82 L42,60 L6,70 L6,62 L42,40 C42,24 44,10 50,4Z','#c9d1da',P,3.5);
 s+=fill('M46,16 C46,10 54,10 54,16 L54,30 L46,30Z','#2b86c4',P,1.8)+ln('M42,44 L12,62 M58,44 L88,62',P.F,3)+fill('M44,92 L50,100 L56,92Z','#ff7a1a',P,1.6);return s;},
aviator:(P)=>{let s=fill('M10,46 L90,46 L90,56 L10,56Z',P.F,P,3)+fill('M24,52 C24,40 34,34 50,34 C66,34 78,40 82,52 C78,62 64,68 50,68 C34,68 24,62 24,52Z','#c9d1da',P,3.5);
 s+=fill('M84,52 L96,52 L96,44 L98,44 L98,60 L96,60 L96,54Z',P.D,P,2)+fill('M14,30 L20,30 L20,74 L14,74Z','#5a5f68',P,2)+fill('M4,42 L30,42 L30,62 L4,62Z',P.D,P,1.4)+circ(17,52,4,G,P,1.6);
 s+=fill('M44,34 C44,26 56,26 58,34Z','#2b86c4',P,1.8)+fill('M54,68 L60,80 L64,68Z','#5a5f68',P,1.6)+circ(60,82,4,'#1f2229',P,1.6);return s;},
clipper:(P)=>{let s=fill('M6,70 L94,70 L82,86 L18,86Z','#7a4a2a',P,3.5)+ln('M34,70 L34,8 M62,70 L62,14',P.O,3);
 s+=fill('M36,12 C48,18 50,30 36,36Z M36,40 C50,46 52,58 36,64Z M64,18 C76,24 78,36 64,42Z M64,46 C78,52 80,62 64,66Z','#f4f1e6',P,2.4)+fill('M30,8 L34,4 L38,8Z',P.F,P,1.4)+fill('M62,10 L76,14 L62,18Z',P.F,P,1.6);
 s+=fill('M2,88 C20,82 40,94 60,88 C76,84 88,90 98,88 L98,98 L2,98Z','#2b86c4',P,2);return s;},
anvil:(P)=>{let s=fill('M10,40 L72,40 C80,40 92,34 98,30 C96,44 86,52 72,54 L64,54 L64,68 L76,84 L24,84 L36,68 L36,54 L22,54 C14,54 10,48 10,40Z','#4a4f58',P,3.5);
 s+=ln('M14,44 L70,44',P.L,2)+st('M44,6 L66,30',4.2,'#8a5a32',P)+fill('M30,10 L52,-2 L58,8 L36,20Z','#9aa3ad',P,2.4)+`<g fill="#ffb02e"><circle cx="76" cy="22" r="2.4"/><circle cx="84" cy="14" r="1.8"/><circle cx="70" cy="12" r="1.6"/></g>`;return s;},
hammer:(P)=>{let s=st('M30,92 L70,30',5.5,'#8a5a32',P)+fill('M44,10 L84,36 L76,48 L36,22Z','#9aa3ad',P,3.5)+fill('M78,38 L94,48 L88,58 L72,48Z','#7a818b',P,2.6)+fill('M44,10 L34,4 L28,14 L36,22Z','#7a818b',P,2.6)+ln('M30,92 L36,82',P.D,6);return s;},
saber:(P)=>{const blade=(m)=>{let s=fill('M20,84 C30,60 50,34 84,8 C68,36 46,62 26,88Z','#d6dde5',P,2.6)+fill('M14,78 L30,92 L34,88 L18,74Z',G,P,2)+fill('M8,94 L18,84 L22,88 L12,98Z','#5a3a22',P,2);return m?`<g transform="${_MR}">${s}</g>`:s;};
 return blade(0)+blade(1)+circ(50,52,6,G,P,2.4);},
shield:(P)=>{let s=fill('M50,4 L88,16 C88,52 76,78 50,96 C24,78 12,52 12,16Z',P.F,P,4)+fill('M50,12 L80,22 C80,52 70,72 50,86Z',P.D,P,1);
 s+=fill('M50,4 L50,96',P.O,P,2)+ln('M14,40 L86,40',G,5)+star(50,62,10,G,P);return s;},
cannon:(P)=>{let s=fill('M14,62 L78,30 C84,28 90,32 90,38 C90,44 86,46 82,48 L24,76Z','#2a2d33',P,3.5)+circ(88,38,4,'#1f2229',P,2)+ln('M30,56 L34,64 M54,44 L58,52',G,3);
 s+=circ(34,76,16,'#8a5a32',P,3.5)+ln('M34,62 L34,90 M20,76 L48,76 M24,66 L44,86 M44,66 L24,86',P.O,2)+circ(34,76,4,G,P,1.6)+`<g fill="#2a2d33" stroke="${P.O}" stroke-width="1.6"><circle cx="66" cy="88" r="5"/><circle cx="78" cy="88" r="5"/><circle cx="72" cy="80" r="5"/></g>`;return s;},
drill:(P)=>{let s=fill('M36,4 L64,4 L64,30 L36,30Z',P.F,P,3.5)+fill('M30,30 L70,30 L66,40 L34,40Z',P.D,P,3);
 s+=fill('M42,40 L58,40 L56,52 L60,58 L54,66 L58,72 L52,80 L54,86 L50,98 L46,86 L48,80 L42,72 L46,66 L40,58 L44,52Z','#c9d1da',P,2.6)+ln('M44,50 L58,56 M42,62 L58,68 M44,74 L56,80',P.O,1.4)+ln('M42,12 L58,12 M42,20 L58,20',P.L,2);return s;},
steelbeam:(P)=>{let s=fill('M10,26 L90,26 L90,38 L56,38 L56,62 L90,62 L90,74 L10,74 L10,62 L44,62 L44,38 L10,38Z','#7f8a96',P,3.5);
 s+=ln('M12,30 L88,30 M12,66 L88,66',P.L,1.8)+`<g fill="#c9d1da" stroke="${P.O}" stroke-width="1.2"><circle cx="20" cy="32" r="2.2"/><circle cx="80" cy="32" r="2.2"/><circle cx="20" cy="68" r="2.2"/><circle cx="80" cy="68" r="2.2"/></g>`;
 s+=star(50,50,5,G,P)+ln('M2,86 L98,86',P.F,4);return s;},
lantern:(P)=>{let s=ln('M50,2 L50,10',P.O,3)+`<path d="M40,10 C40,2 60,2 60,10" fill="none" stroke="${P.O}" stroke-width="3"/>`+fill('M34,10 L66,10 L62,20 L38,20Z','#2a2d33',P,3);
 s+=fill('M36,20 L64,20 L66,76 L34,76Z','#ffe08a',P,3)+`<ellipse cx="50" cy="48" rx="9" ry="16" fill="#ffb02e"/><path d="M50,36 C54,44 54,54 50,60 C46,54 46,44 50,36Z" fill="#fff59d"/>`+ln('M42,20 L42,76 M58,20 L58,76',P.O,1.8)+fill('M30,76 L70,76 L66,88 L34,88Z','#2a2d33',P,3);return s;},
torch:(P)=>{let s=fill('M42,52 L58,52 L54,96 L46,96Z','#8a5a32',P,3)+fill('M36,46 L64,46 L60,56 L40,56Z',G,P,2.6);
 s+=fill('M50,4 C60,14 72,24 68,38 C66,44 60,48 50,48 C40,48 34,44 32,38 C28,26 38,22 40,12 C44,18 46,22 50,24 C48,16 48,10 50,4Z','#ff7a1a',P,3)+fill('M50,20 C56,28 60,34 58,40 C56,44 54,46 50,46 C46,46 42,44 42,38 C42,32 48,28 50,20Z','#ffd23f',P,1);return s;},
trident:(P)=>{let s=st('M50,30 L50,98',4,'#c9a46a',P);
 s+=fill('M20,8 L28,26 C28,38 38,44 50,44 C62,44 72,38 72,26 L80,8 L84,30 C82,46 70,54 54,56 L46,56 C30,54 18,46 16,30Z',G,P,3)+fill('M50,2 L58,22 L54,22 L54,44 L46,44 L46,22 L42,22Z',G,P,2.6)+fill('M14,10 L20,2 L24,12Z M86,10 L80,2 L76,12Z',G,P,2);return s;},
compass:(P)=>{let s=circ(50,50,40,'#f4f1e6',P,4)+circ(50,50,32,'none',P,1.6);let t='';for(let i=0;i<16;i++){const a=i*Math.PI/8,r1=i%4?34:30;t+=`M${(50+Math.cos(a)*r1).toFixed(1)},${(50+Math.sin(a)*r1).toFixed(1)} L${(50+Math.cos(a)*38).toFixed(1)},${(50+Math.sin(a)*38).toFixed(1)} `;}
 s+=ln(t,P.O,1.4)+fill('M50,14 L58,50 L50,86 L42,50Z',P.F,P,2.2)+fill('M14,50 L50,42 L86,50 L50,58Z',P.D,P,2.2)+fill('M50,14 L58,50 L50,50Z','#c62828',P,1)+circ(50,50,4,G,P,1.6);return s;},
gear:(P)=>{let t='';for(let i=0;i<10;i++){const a=i*Math.PI/5;t+=`<rect x="44" y="4" width="12" height="16" rx="2" fill="${P.F}" stroke="${P.O}" stroke-width="3" transform="rotate(${(a*180/Math.PI).toFixed(1)} 50 50)"/>`;}
 return t+circ(50,50,34,P.F,P,3.5)+circ(50,50,14,'#f4f4f4',P,3)+circ(50,50,24,'none',P,1.4)+ln('M28,40 L36,44',P.L,2.4);},
atom:(P)=>{const orb=r=>`<ellipse cx="50" cy="50" rx="44" ry="15" fill="none" stroke="${P.O}" stroke-width="7" transform="rotate(${r} 50 50)"/><ellipse cx="50" cy="50" rx="44" ry="15" fill="none" stroke="${P.F}" stroke-width="3.4" transform="rotate(${r} 50 50)"/>`;
 return orb(0)+orb(60)+orb(120)+circ(50,50,9,G,P,3)+circ(91,50,4,'#2ac6e8',P,1.6)+circ(28,13,4,'#2ac6e8',P,1.6)+circ(28,87,4,'#2ac6e8',P,1.6);},
scholar:(P)=>{let s=fill('M8,64 C20,58 36,58 50,64 L50,94 C36,88 20,88 8,94Z','#f4f1e6',P,3)+fill('M92,64 C80,58 64,58 50,64 L50,94 C64,88 80,88 92,94Z','#f4f1e6',P,3)+ln('M14,70 L42,70 M14,76 L42,76 M58,70 L86,70 M58,76 L86,76',P.L,1.4);
 s+=fill('M50,8 L94,26 L50,44 L6,26Z','#1f2229',P,3)+fill('M24,32 L24,46 C36,54 64,54 76,46 L76,32 L50,44Z','#1f2229',P,3)+ln('M88,28 L88,48',G,2.4)+fill('M84,48 L92,48 L90,56 L86,56Z',G,P,1.4);return s;},
rook:(P)=>{let s=fill('M22,8 L34,8 L34,18 L44,18 L44,8 L56,8 L56,18 L66,18 L66,8 L78,8 L78,30 L68,38 L70,72 L80,82 L80,94 L20,94 L20,82 L30,72 L32,38 L22,30Z',P.F,P,3.5);
 s+=ln('M24,30 L76,30 M32,40 L68,40 M30,72 L70,72 M22,84 L78,84',P.O,2)+fill('M44,50 C44,44 56,44 56,50 L56,62 L44,62Z','#1f2229',P,1.6);return s;},
glove:(P)=>{let s=fill('M24,40 C24,20 40,10 58,12 C76,14 86,28 84,46 C84,58 78,66 70,70 L70,84 L30,84 L30,68 C26,62 24,52 24,40Z','#c62828',P,3.5);
 s+=fill('M24,44 C14,42 10,52 16,60 C20,64 26,62 30,58Z','#c62828',P,3)+fill('M28,84 L72,84 L72,96 L28,96Z','#f4f4f4',P,3)+ln('M34,88 L66,88',P.L,1.6)+ln('M40,24 C52,18 66,20 74,30',P.L,3)+ln('M36,46 C48,42 60,42 72,48',P.D,2);return s;},
conch:(P)=>{let s=fill('M20,70 C10,56 14,36 30,24 C46,12 70,10 86,20 C94,26 94,36 86,42 C92,50 92,60 84,66 C76,74 62,76 52,72 L44,86 C40,92 32,92 30,86 Z','#f4c4a8',P,3.5);
 s+=fill('M30,24 L22,10 L38,20Z M48,14 L46,2 L58,14Z M70,12 L74,2 L80,16Z','#e8b090',P,2)+ln('M30,36 C44,30 62,30 78,38 M26,50 C42,44 62,46 80,52 M28,62 C42,58 58,60 72,66',P.D,1.8)+fill('M52,72 C58,60 70,56 84,60 C80,70 68,76 52,72Z','#e86a8a',P,1.6);return s;}
});
})();

/*</emb_c>*/
/*<emb_d>*/
// ═══════════ v2.08 new emblems, batch D: sky, land, harvest and the frontier ═══════════
(function(){
const W='#ffffff',B='#16181d',G='#f0b72f';
const fill=(d,f,P,w)=>`<path d="${d}" fill="${f}" stroke="${P.O}" stroke-width="${w||3}" stroke-linejoin="round"/>`;
const ln=(d,c,w)=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w||2}" stroke-linecap="round" stroke-linejoin="round"/>`;
const st=(d,w,c,P)=>ln(d,P.O,w+5)+ln(d,c,w);
const dot=(x,y,r,c)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c||'#111'}"/>`;
const circ=(x,y,r,f,P,w)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" stroke="${P.O}" stroke-width="${w||3}"/>`;
const leaf=(x,y,r,f,P)=>`<g transform="rotate(${r} ${x} ${y})">${fill(`M${x},${y} C${x+6},${y-10} ${x+16},${y-12} ${x+22},${y-6} C${x+14},${y+2} ${x+6},${y+2} ${x},${y}Z`,f,P,2)}</g>`;
Object.assign(_LGO,{
sun:(P)=>{let r='';for(let i=0;i<12;i++){r+=`<path d="M46,10 L50,-2 L54,10Z" fill="${i%2?G:'#ff7a1a'}" stroke="${P.O}" stroke-width="2.2" stroke-linejoin="round" transform="rotate(${i*30} 50 50)"/>`;}
 return r+circ(50,50,32,G,P,3.5)+circ(50,50,24,'#ffd23f',P,0)+dot(40,46,3)+dot(60,46,3)+ln('M38,58 C44,66 56,66 62,58',P.O,2.6)+ln('M30,40 C32,34 36,30 42,28',W,2.4);},
moon:(P)=>{let s=fill('M62,6 C36,8 16,28 16,54 C16,78 36,96 60,96 C72,96 82,92 90,84 C64,84 44,66 44,44 C44,28 50,14 62,6Z','#f6e7b0',P,3.5);
 s+=dot(32,50,4,'#e6d38e')+dot(40,72,5,'#e6d38e')+dot(28,32,2.6,'#e6d38e');let t='';[[76,22,5],[88,40,3.5],[70,46,3]].forEach(([x,y,r])=>{let d='';for(let i=0;i<8;i++){const a=-Math.PI/2+i*Math.PI/4,q=i%2?r*0.4:r;d+=(i?'L':'M')+(x+Math.cos(a)*q).toFixed(1)+','+(y+Math.sin(a)*q).toFixed(1);}t+=fill(d+'Z',G,P,1.4);});return s+t;},
meteor:(P)=>{let s=fill('M58,48 C40,40 20,24 6,6 C24,14 46,24 64,38Z','#ffd23f',P,2.4)+fill('M52,58 C34,56 16,48 2,36 C22,40 42,44 60,50Z','#ff7a1a',P,2.4)+fill('M44,40 C34,28 26,16 22,4 C32,14 42,24 54,34Z','#ff7a1a',P,2);
 s+=circ(68,64,24,'#8a6a52',P,3.5)+dot(60,58,4,'#6e523e')+dot(74,72,5,'#6e523e')+dot(76,54,3,'#6e523e')+ln('M52,52 C56,46 62,42 68,42',P.L,2.4);return s;},
tornado:(P)=>{let s='';const R=[[50,12,40,7],[52,24,33,6.5],[54,35,26,6],[54,46,20,5.5],[52,56,15,5],[50,65,11,4.5],[49,73,8,4],[50,81,5,3.5]];
 R.slice().reverse().forEach(([x,y,rx,ry],k)=>{const i=R.length-1-k;s+=`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry+3}" fill="${i%2?P.F:P.L}" stroke="${P.O}" stroke-width="2.6"/>`;});
 s+=fill('M48,84 C46,90 48,96 54,98 C52,92 52,88 54,84Z',P.F,P,2)+ln('M20,12 C30,16 44,16 56,12 M34,34 C42,38 54,38 64,34',W,1.6)+`<g fill="#8a6a52" stroke="${P.O}" stroke-width="1.4"><rect x="18" y="74" width="7" height="5" transform="rotate(20 21 76)"/><rect x="74" y="62" width="6" height="6" transform="rotate(-15 77 65)"/></g>`;return s;},
snowflake:(P)=>{const arm='M50,50 L50,6 M50,18 L42,10 M50,18 L58,10 M50,30 L40,22 M50,30 L60,22';let s='';for(let i=0;i<6;i++){s+=`<g transform="rotate(${i*60} 50 50)">${ln(arm,P.O,9)}</g>`;}
 for(let i=0;i<6;i++){s+=`<g transform="rotate(${i*60} 50 50)">${ln(arm,'#8fd3f4',4.4)}</g>`;}return s+circ(50,50,7,'#ffffff',P,2.4);},
iceberg:(P)=>{let s=fill('M2,62 C20,56 40,66 58,60 C74,56 86,62 98,58 L98,98 L2,98Z','#2b86c4',P,2.6)+fill('M18,96 L10,72 L28,64 L44,66 L60,64 L80,70 L90,96Z','#7ec3e6',P,2);
 s+=fill('M14,64 L30,26 L42,40 L56,10 L72,38 L86,64Z','#f4fbff',P,3.5)+fill('M56,10 L50,40 L58,64 L72,38Z','#cfe9f7',P,1.4)+fill('M30,26 L26,48 L36,64 L42,40Z','#cfe9f7',P,1.2);return s;},
oak:(P)=>{let s=fill('M42,96 L44,64 L36,56 L44,58 L46,48 L54,48 L56,58 L64,54 L56,64 L58,96Z','#7a4a2a',P,3);
 [[50,24,22],[28,40,18],[72,40,18],[36,58,15],[64,58,15],[50,46,20]].forEach(([x,y,r])=>{s+=circ(x,y,r,'#3f8a3a',P,3);});
 [[50,24,22],[28,40,18],[72,40,18],[36,58,15],[64,58,15],[50,46,20]].forEach(([x,y,r])=>{s+=dot(x,y,r-3,'#3f8a3a');});s+=dot(44,20,5,'#5fb04f')+dot(26,36,4,'#5fb04f')+dot(66,34,4,'#5fb04f');return s;},
acorn:(P)=>{let s=fill('M24,44 C24,70 36,92 50,94 C64,92 76,70 76,44Z','#c88a4a',P,3.5)+ln('M36,52 C38,68 44,80 50,84',P.L,3);
 s+=fill('M18,46 C16,28 32,18 50,18 C68,18 84,28 82,46Z','#7a4a2a',P,3.5)+ln('M26,36 L74,36 M24,28 L76,28 M32,22 L68,22',P.D,1.6)+ln('M30,22 L40,44 M50,18 L50,46 M70,22 L60,44',P.D,1.6)+st('M50,18 C50,10 54,6 60,4',2.6,'#7a4a2a',P);return s;},
mapleleaf:(P)=>{let s=fill('M50,4 L58,22 L70,16 L66,36 L84,26 L80,40 L96,44 L84,54 L90,62 L70,62 L72,72 L54,64 L54,90 L46,90 L46,64 L28,72 L30,62 L10,62 L16,54 L4,44 L20,40 L16,26 L34,36 L30,16 L42,22Z','#d62828',P,3.5);
 s+=ln('M50,88 L50,22 M50,56 L76,40 M50,56 L24,40 M50,64 L70,62 M50,64 L30,62',P.D,1.8);return s;},
cactus:(P)=>{let s=fill('M40,96 L40,20 C40,8 60,8 60,20 L60,96Z','#3f9a4a',P,3.5)+fill('M40,58 L28,58 C18,58 16,50 16,44 L16,30 C16,22 26,22 26,30 L26,46 L40,46Z','#3f9a4a',P,3)+fill('M60,48 L72,48 L72,24 C72,16 82,16 82,24 L82,48 C82,56 78,60 70,60 L60,60Z','#3f9a4a',P,3);
 s+=ln('M50,14 L50,92 M45,24 L45,90 M55,24 L55,90',P.L,1.4)+fill('M44,8 C46,2 54,2 56,8 L50,12Z','#f06292',P,1.6)+ln('M2,96 L98,96',P.O,3)+fill('M4,96 C14,88 30,90 40,96 M60,96 C70,90 86,88 96,96','#d8b878',P,2);return s;},
palm:(P)=>{let s=fill('M44,96 C46,74 46,56 50,38 L56,38 C54,56 56,74 58,96Z','#9a6a3a',P,3)+ln('M46,52 L56,52 M46,64 L56,64 M46,76 L57,76 M46,88 L58,88',P.D,1.6);
 const fr=(d)=>fill(d,'#2e9e4f',P,2.8);s+=fr('M52,38 C40,24 24,22 8,30 C20,30 30,34 40,42Z')+fr('M52,38 C64,24 80,22 94,30 C82,30 72,34 62,42Z')+fr('M52,38 C44,30 40,16 42,4 C50,14 54,26 54,36Z')+fr('M52,38 C38,40 26,48 20,62 C30,54 40,48 50,46Z')+fr('M52,38 C66,40 78,48 84,62 C74,54 64,48 54,46Z');
 s+=circ(48,42,4,'#7a4a2a',P,1.6)+circ(56,44,4,'#7a4a2a',P,1.6);return s;},
corn:(P)=>{let s=fill('M50,8 C64,8 70,26 70,48 C70,72 62,90 50,94 C38,90 30,72 30,48 C30,26 36,8 50,8Z','#f5c518',P,3.5);let k='';
 for(let y=16;y<88;y+=7)for(let x=36;x<66;x+=7){if(Math.hypot((x-50)/20,(y-50)/42)<1)k+=`<rect x="${x}" y="${y}" width="5.4" height="5.4" rx="1.6" fill="#ffe066" stroke="#c99a10" stroke-width=".8"/>`;}
 s+=k+fill('M50,96 C32,90 18,72 16,48 C26,60 36,70 46,76Z','#5fb04f',P,3)+fill('M50,96 C68,90 82,72 84,48 C74,60 64,70 54,76Z','#4a9a3c',P,3);return s;},
wheat:(P)=>{let s='';const stalk=(r)=>{let g=ln('M50,96 L50,30',P.O,5)+ln('M50,96 L50,30','#d8a840',2.4);for(let i=0;i<5;i++){const y=34+i*9;g+=fill(`M50,${y} C42,${y-4} 40,${y-12} 44,${y-16} C50,${y-12} 52,${y-6} 50,${y}Z`,'#f0c050',P,1.8)+fill(`M50,${y} C58,${y-4} 60,${y-12} 56,${y-16} C50,${y-12} 48,${y-6} 50,${y}Z`,'#f0c050',P,1.8);}
  g+=fill('M50,24 C46,16 48,8 50,4 C52,8 54,16 50,24Z','#f0c050',P,1.8);return `<g transform="rotate(${r} 50 96)">${g}</g>`;};
 s+=stalk(-24)+stalk(24)+stalk(0)+fill('M38,80 L62,80 L62,88 L38,88Z',P.F,P,2.4);return s;},
potato:(P)=>{let s=fill('M20,40 C24,22 46,14 64,18 C84,22 94,40 88,60 C82,80 60,90 40,86 C20,82 14,58 20,40Z','#c49a6a',P,3.5);
 s+=dot(40,36,2.4,'#8a6a3a')+dot(66,32,2,'#8a6a3a')+dot(74,58,2.6,'#8a6a3a')+dot(34,64,2,'#8a6a3a')+`<circle cx="44" cy="50" r="5" fill="#fff" stroke="${P.O}" stroke-width="1.6"/><circle cx="62" cy="48" r="5" fill="#fff" stroke="${P.O}" stroke-width="1.6"/>`+dot(45,51,2.6)+dot(63,49,2.6)+ln('M46,64 C52,70 60,68 64,62',P.O,2.4)+ln('M36,26 C42,22 50,20 58,22',P.L,2.4);return s;},
peach:(P)=>{let s=fill('M50,28 C68,20 90,34 88,58 C86,80 68,94 50,94 C32,94 14,80 12,58 C10,34 32,20 50,28Z','#ffab76',P,3.5)+ln('M50,30 C46,48 46,70 50,92',P.D,2.4);
 s+=`<path d="M22,52 C22,40 32,32 42,34" fill="none" stroke="#ffd2b0" stroke-width="5" stroke-linecap="round"/>`+st('M50,30 L52,14',3,'#7a4a2a',P)+leaf(52,18,-20,'#4a9a3c',P);return s;},
apple:(P)=>{let s=fill('M50,28 C62,18 86,22 88,48 C90,72 72,94 58,92 C54,92 52,90 50,90 C48,90 46,92 42,92 C28,94 10,72 12,48 C14,22 38,18 50,28Z','#d62828',P,3.5);
 s+=`<path d="M24,46 C24,36 30,30 38,30" fill="none" stroke="#ff8a80" stroke-width="5" stroke-linecap="round"/>`+st('M50,28 C50,20 52,14 56,10',3,'#7a4a2a',P)+leaf(54,16,-10,'#4a9a3c',P);return s;},
orange:(P)=>{let s=circ(50,56,38,'#ff8a1a',P,3.5);let d='';for(let i=0;i<14;i++){const a=i*0.9;d+=dot((50+Math.cos(a)*(10+i*2)).toFixed(1),(56+Math.sin(a)*(10+i*2)).toFixed(1),1.2,'#e06a00');}
 s+=d+`<path d="M24,48 C26,36 34,28 44,26" fill="none" stroke="#ffc07a" stroke-width="5" stroke-linecap="round"/>`+circ(50,19,3,'#4a9a3c',P,1.6)+leaf(52,18,-30,'#4a9a3c',P)+leaf(48,18,190,'#3f8a3a',P);return s;},
grapes:(P)=>{let s=st('M50,20 C50,12 54,8 60,6',3,'#7a4a2a',P)+leaf(56,14,-10,'#4a9a3c',P);
 [[38,28],[50,28],[62,28],[32,40],[44,40],[56,40],[68,40],[38,52],[50,52],[62,52],[44,64],[56,64],[50,76]].forEach(([x,y])=>{s+=circ(x,y,8,'#7b3fa0',P,2.4)+dot(x-2.6,y-2.6,2,'#b98ad6');});return s;},
cherries:(P)=>{let s=st('M30,70 C34,46 46,24 64,10 M70,72 C68,48 66,28 64,10',2.4,'#5a7a2a',P)+leaf(64,10,10,'#4a9a3c',P);
 s+=circ(30,74,16,'#c2185b',P,3.5)+circ(70,74,16,'#c2185b',P,3.5)+`<path d="M20,70 C20,64 24,60 30,60" fill="none" stroke="#f48fb1" stroke-width="4" stroke-linecap="round"/><path d="M60,70 C60,64 64,60 70,60" fill="none" stroke="#f48fb1" stroke-width="4" stroke-linecap="round"/>`;return s;},
sunflower:(P)=>{let s=st('M50,62 L50,98',3.4,'#3f8a3a',P)+leaf(50,82,30,'#4a9a3c',P)+leaf(50,80,150,'#4a9a3c',P);
 for(let i=0;i<14;i++)s+=`<g transform="rotate(${i*360/14} 50 40)">${fill('M50,40 C46,30 46,14 50,6 C54,14 54,30 50,40Z','#ffc107',P,2)}</g>`;
 s+=circ(50,40,15,'#5a3a22',P,3);let d='';for(let i=0;i<10;i++){const a=i*0.8;d+=dot((50+Math.cos(a)*(3+i)).toFixed(1),(40+Math.sin(a)*(3+i)).toFixed(1),1.2,'#8a6a3a');}return s+d;},
rose:(P)=>{let s=st('M50,52 C48,70 52,84 50,98',3,'#3f8a3a',P)+leaf(50,74,200,'#4a9a3c',P)+leaf(50,82,-20,'#4a9a3c',P)+fill('M46,62 L40,60 L44,66Z',P.O,P,1);
 s+=fill('M50,56 C30,56 22,40 26,26 C34,32 40,34 44,30 C44,20 48,14 50,10 C52,14 56,20 56,30 C60,34 66,32 74,26 C78,40 70,56 50,56Z','#d62828',P,3.5);
 s+=ln('M38,34 C40,42 46,46 54,44 C62,42 64,34 60,28 M44,28 C46,24 50,22 54,24',P.D,2);return s;},
rainbow:(P)=>{const C=['#e53935','#fb8c00','#fdd835','#43a047','#1e88e5','#8e24aa'];let s=`<path d="M6,74 A44,44 0 0 1 94,74" fill="none" stroke="${P.O}" stroke-width="3"/><path d="M42,74 A8,8 0 0 1 58,74" fill="none" stroke="${P.O}" stroke-width="3"/>`;
 C.forEach((c,i)=>{const r=42-i*6;s+=`<path d="M${50-r},74 A${r},${r} 0 0 1 ${50+r},74" fill="none" stroke="${c}" stroke-width="6"/>`;});
 s+=`<g fill="#ffffff" stroke="${P.O}" stroke-width="2.6"><circle cx="14" cy="76" r="10"/><circle cx="26" cy="80" r="9"/><circle cx="86" cy="76" r="10"/><circle cx="74" cy="80" r="9"/></g>`;return s;},
cloud:(P)=>{let s=`<g fill="#5a6876" stroke="${P.O}" stroke-width="3"><circle cx="30" cy="44" r="16"/><circle cx="52" cy="34" r="20"/><circle cx="72" cy="46" r="15"/><rect x="22" y="44" width="56" height="18" rx="9"/></g><g fill="#5a6876"><circle cx="30" cy="44" r="13"/><circle cx="52" cy="34" r="17"/><circle cx="72" cy="46" r="12"/><rect x="24" y="46" width="52" height="14"/></g>`;
 s+=fill('M52,58 L40,80 L50,80 L42,98 L64,72 L54,72 L62,58Z',G,P,2.4)+ln('M28,66 L24,76 M72,66 L68,78 M36,70 L33,78',P.L,2.6)+ln('M40,30 C44,24 52,22 58,24',W,2.4);return s;},
tumbleweed:(P)=>{let s=circ(50,52,36,'none',P,3);let d='';for(let i=0;i<18;i++){const a=i*0.7,b=a+2.2;d+=`M${(50+Math.cos(a)*34).toFixed(1)},${(52+Math.sin(a)*34).toFixed(1)} Q50,52 ${(50+Math.cos(b)*34).toFixed(1)},${(52+Math.sin(b)*34).toFixed(1)} `;}
 s+=ln(d,P.O,4)+ln(d,'#c9a46a',2)+ln('M2,94 L22,94 M8,88 L18,88',P.L,2.4)+ln('M80,94 L98,94',P.O,2);return s;},
wagon:(P)=>{let s=fill('M14,58 C14,30 30,18 50,18 C70,18 86,30 86,58Z','#f4f1e6',P,3.5)+ln('M30,22 L28,58 M50,18 L50,58 M70,22 L72,58',P.D,1.8)+fill('M8,58 L92,58 L88,70 L12,70Z','#8a5a32',P,3);
 s+=circ(26,78,12,'none',P,3.5)+circ(74,78,12,'none',P,3.5)+ln('M26,66 L26,90 M14,78 L38,78 M17,70 L35,86 M35,70 L17,86 M74,66 L74,90 M62,78 L86,78 M65,70 L83,86 M83,70 L65,86',P.O,1.6)+circ(26,78,3,G,P,1.4)+circ(74,78,3,G,P,1.4);return s;},
goldpan:(P)=>{let s=`<ellipse cx="50" cy="62" rx="44" ry="20" fill="#5a5f68" stroke="${P.O}" stroke-width="3.5"/><ellipse cx="50" cy="58" rx="34" ry="13" fill="#7a818b" stroke="${P.O}" stroke-width="1.6"/>`;
 s+=`<g fill="${G}" stroke="${P.O}" stroke-width="1.4"><path d="M40,56 L46,52 L52,56 L48,62Z"/><circle cx="58" cy="60" r="3"/><circle cx="64" cy="55" r="2"/><path d="M30,60 L35,57 L38,62Z"/></g>`;
 let sp='';[[24,30],[50,22],[76,30],[36,14],[64,14]].forEach(([x,y])=>{sp+=`<path d="M${x},${y-6} L${x+2},${y-2} L${x+6},${y} L${x+2},${y+2} L${x},${y+6} L${x-2},${y+2} L${x-6},${y} L${x-2},${y-2}Z" fill="#fff59d" stroke="${P.O}" stroke-width="1.2"/>`;});return s+sp;},
boot:(P)=>{let s=fill('M30,8 L58,8 L58,58 C68,62 84,64 92,70 C96,74 96,84 90,86 L26,86 C22,74 24,52 26,40Z','#8a5a32',P,3.5);
 s+=fill('M24,86 L90,86 L90,92 L24,92Z','#3a2414',P,2.4)+fill('M26,86 L36,86 L36,96 L28,96Z','#3a2414',P,2)+ln('M34,20 C40,30 48,30 52,20 M34,36 C40,46 48,46 52,36',G,2.4)+fill('M28,8 L60,8 L60,14 L28,14Z','#6a4022',P,2);
 s+=`<circle cx="18" cy="74" r="7" fill="none" stroke="${P.O}" stroke-width="5"/><circle cx="18" cy="74" r="7" fill="none" stroke="#c9d1da" stroke-width="2.4"/>`+ln('M25,74 L32,74',P.O,3);return s;},
brand:(P)=>{let s=st('M84,92 L52,40',3.6,'#5a5f68',P)+fill('M84,92 L92,86 L96,94 L88,98Z','#8a5a32',P,2);
 s+=fill('M14,10 L50,10 L50,20 L30,20 L30,30 L46,30 L46,40 L30,40 L30,56 L14,56Z','#ff7a1a',P,3)+fill('M40,46 L58,46 L58,56 L40,56Z','#ff7a1a',P,2.4)+`<g fill="#ffd23f"><circle cx="58" cy="20" r="2"/><circle cx="64" cy="12" r="1.6"/><circle cx="8" cy="30" r="1.6"/></g>`;return s;},
pilgrim:(P)=>{let s=fill('M28,10 L72,10 L76,66 L24,66Z','#26292f',P,3.5)+fill('M6,66 C22,58 78,58 94,66 C82,76 18,76 6,66Z','#26292f',P,3);
 s+=fill('M26,50 L74,50 L75,60 L25,60Z','#5a3a22',P,2)+fill('M42,48 L58,48 L58,62 L42,62Z',G,P,2.2)+fill('M46,52 L54,52 L54,58 L46,58Z','#26292f',P,1)+ln('M34,16 L36,48',P.L,1.6);return s;},
quaker:(P)=>{let s=fill('M14,54 C18,30 32,20 50,20 C68,20 82,30 86,54Z','#4a4f58',P,3.5)+fill('M2,54 C20,46 80,46 98,54 C86,64 14,64 2,54Z','#4a4f58',P,3);
 s+=fill('M14,52 C30,48 70,48 86,52 L86,58 C70,54 30,54 14,58Z','#2a2d33',P,1.6)+ln('M30,30 C36,26 44,24 50,24',P.L,2)+fill('M40,70 C40,64 60,64 60,70 L58,96 L42,96Z','#c9c9c2',P,2.4);return s;},
horseshoe:(P)=>{let s=`<path d="M22,90 L22,48 C22,26 34,12 50,12 C66,12 78,26 78,48 L78,90" fill="none" stroke="${P.O}" stroke-width="24" stroke-linejoin="round"/><path d="M22,90 L22,48 C22,26 34,12 50,12 C66,12 78,26 78,48 L78,90" fill="none" stroke="#9aa3ad" stroke-width="16"/>`;
 s+=`<path d="M22,90 L22,48 C22,26 34,12 50,12 C66,12 78,26 78,48 L78,90" fill="none" stroke="#c9d1da" stroke-width="5"/>`+`<g fill="${P.O}"><circle cx="22" cy="60" r="2.4"/><circle cx="22" cy="76" r="2.4"/><circle cx="78" cy="60" r="2.4"/><circle cx="78" cy="76" r="2.4"/><circle cx="30" cy="30" r="2.4"/><circle cx="70" cy="30" r="2.4"/></g>`+fill('M12,90 L32,90 L32,96 L12,96Z M68,90 L88,90 L88,96 L68,96Z','#7a818b',P,2);return s;},
bell:(P)=>{let s=fill('M50,8 C66,8 74,22 74,40 C74,56 78,66 88,76 L12,76 C22,66 26,56 26,40 C26,22 34,8 50,8Z',G,P,3.5)+fill('M8,76 L92,76 L92,84 L8,84Z',G,P,3);
 s+=circ(50,90,7,'#c99a10',P,2.6)+ln('M38,20 C34,30 34,44 34,56',W,3)+ln('M50,22 L50,40 L44,52',P.D,2.4)+circ(50,6,4,G,P,2);return s;},
lighthouse:(P)=>{let s=fill('M34,90 L40,30 L60,30 L66,90Z','#f4f4f4',P,3.5)+fill('M36,72 L64,72 L65,84 L35,84Z M38,48 L62,48 L63,60 L37,60Z','#d62828',P,1.6);
 s+=fill('M38,18 L62,18 L62,30 L38,30Z','#ffe08a',P,3)+fill('M34,18 L50,6 L66,18Z','#d62828',P,3)+fill('M62,20 L98,10 L98,36 L62,28Z','#fff59d',P,0)+fill('M38,20 L2,10 L2,36 L38,28Z','#fff59d',P,0);
 s+=fill('M2,92 C20,86 40,96 60,90 C76,86 88,92 98,90 L98,98 L2,98Z','#2b86c4',P,2)+fill('M26,92 L74,92 L70,86 L30,86Z','#7a818b',P,2);return s;},
pinecone:(P)=>{let s=fill('M50,10 C66,18 76,36 74,58 C72,78 62,92 50,96 C38,92 28,78 26,58 C24,36 34,18 50,10Z','#8a5a32',P,3.5);let d='';
 for(let r=0;r<7;r++)for(let c=0;c<3+(r>1&&r<6?1:0);c++){const w=3+(r>1&&r<6?1:0),x=50+(c-(w-1)/2)*12,y=24+r*10;d+=fill(`M${x-6},${y} L${x},${y+8} L${x+6},${y}Z`,'#c88a4a',P,1.4);}
 s+=d+st('M50,10 L50,2',3,'#5a3a22',P);return s;},
hilltop:(P)=>{let s=fill('M2,92 C18,60 34,46 50,46 C66,46 82,60 98,92Z','#4a9a3c',P,3.5)+fill('M22,92 C32,74 42,66 50,66 C60,66 70,74 80,92Z','#5fb04f',P,1.6);
 s+=st('M50,48 L50,6',2.4,'#5a5f68',P)+fill('M52,6 L84,14 L52,24Z',P.F,P,2.6);return s;},
anchorchain:(P)=>{let s='';for(let i=0;i<7;i++){const y=6+i*13;s+=`<ellipse cx="50" cy="${y}" rx="${i%2?5:9}" ry="${i%2?9:6}" fill="none" stroke="${P.O}" stroke-width="7"/><ellipse cx="50" cy="${y}" rx="${i%2?5:9}" ry="${i%2?9:6}" fill="none" stroke="#9aa3ad" stroke-width="3.4"/>`;}
 s+=fill('M20,86 C30,98 70,98 80,86 L74,82 C66,90 34,90 26,82Z','#9aa3ad',P,2.6);return s;}
});

})();

/*</emb_d>*/
const _LGC=new Map(),_LGF={};
function _lgf(c2,big){
  const id=(big?'glb':'gls')+c2.slice(1);if(_LGF[id])return id;
  let d=document.getElementById('lg-defs');
  if(!d){d=document.createElementNS('http://www.w3.org/2000/svg','svg');d.id='lg-defs';d.setAttribute('width','0');d.setAttribute('height','0');d.setAttribute('aria-hidden','true');d.style.cssText='position:absolute;width:0;height:0;overflow:hidden';d.setAttribute('class','lg');d.innerHTML='<defs></defs>';(document.body||document.documentElement).appendChild(d);}
  const f=big?`<filter id="${id}" x="-25%" y="-25%" width="150%" height="150%"><feMorphology in="SourceAlpha" operator="dilate" radius="4" result="d2"/><feMorphology in="SourceAlpha" operator="dilate" radius="2.3" result="d1"/><feFlood flood-color="#0b1118"/><feComposite in2="d2" operator="in" result="r2"/><feFlood flood-color="${c2}"/><feComposite in2="d1" operator="in" result="r1"/><feOffset in="SourceAlpha" dx="-2" dy="-2.6" result="o"/><feComposite in="SourceAlpha" in2="o" operator="out" result="e"/><feFlood flood-color="#000" flood-opacity=".3"/><feComposite in2="e" operator="in" result="sh"/><feOffset in="SourceAlpha" dx="2" dy="2.4" result="o2"/><feComposite in="SourceAlpha" in2="o2" operator="out" result="e2"/><feFlood flood-color="#fff" flood-opacity=".22"/><feComposite in2="e2" operator="in" result="hl"/><feMerge><feMergeNode in="r2"/><feMergeNode in="r1"/><feMergeNode in="SourceGraphic"/><feMergeNode in="hl"/><feMergeNode in="sh"/></feMerge></filter>`
   :`<filter id="${id}" x="-25%" y="-25%" width="150%" height="150%"><feMorphology in="SourceAlpha" operator="dilate" radius="3" result="d1"/><feFlood flood-color="${c2}"/><feComposite in2="d1" operator="in" result="r1"/><feMerge><feMergeNode in="r1"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
  d.firstChild.insertAdjacentHTML('beforeend',f);_LGF[id]=1;return id;
}
function _lgm(b){
  try{let m=document.getElementById('lg-m');
   if(!m){let d=document.getElementById('lg-defs');if(!d){_lgf('#000000',false);d=document.getElementById('lg-defs');}
    m=document.createElementNS('http://www.w3.org/2000/svg','g');m.id='lg-m';d.appendChild(m);}
   m.innerHTML=b;const r=m.getBBox();m.innerHTML='';return r.width>0&&r.height>0?r:null;}catch(e){return null;}
}
