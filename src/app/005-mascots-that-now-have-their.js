// ═══════════ v2.08 mascots that now have their own emblem ═══════════
(function(){
const M={badger:'Badgers,Honey Badgers',wolverine:'Wolverines',otter:'Otters',beaver:'Beavers',raccoon:'Raccoons',opossum:'Possums,Opossums',skunk:'Skunks',porcupine:'Porcupines',
 coyote:'Coyotes,Howlers',jackrabbit:'Jackrabbits,Rabbits,Bunnies,Hares',kangaroo:'Kangaroos,Roos',elephant:'Elephants,Red Elephants',rhino:'Rhinos',hippo:'Hippos',gorilla:'Gorillas',
 leopard:'Leopards',cheetah:'Cheetahs',hyena:'Hyenas',camel:'Camels',goat:'Goats,Billy Goats',mule:'Mules',boar:'Razorbacks,Hogs,Boars,Wild Hogs',stag:'Stags,Elk,Elks',
 antelope:'Antelope,Antelopes,Pronghorns',panda:'Pandas',bat:'Bats',seal:'Seals',walrus:'Walruses',whale:'Whales',squirrel:'Squirrels',terrier:'Terriers,Scotties',
 hound:'Hounds,Bloodhounds,Foxhounds',llama:'Llamas',giraffe:'Giraffes',lamb:'Lambs,Sheep',gopher:'Gophers,Golden Gophers',
 duck:'Ducks,Fighting Ducks',goose:'Geese',swan:'Swans',crane:'Cranes',gull:'Gulls,Seagulls',penguin:'Penguins',roadrunner:'Roadrunners',rooster:'Roosters,Gamecocks',turkey:'Turkeys',
 crow:'Crows',bluejay:'Blue Jays,Bluejays',oriole:'Orioles',robin:'Robins',hummingbird:'Hummingbirds',flamingo:'Flamingos',parrot:'Parrots,Macaws',pheasant:'Pheasants',
 barracuda:'Barracudas',piranha:'Piranhas',pike:'Muskies,Pike,Walleyes',trout:'Trout',bass:'Bass,Black Bass',catfish:'Catfish',eel:'Eels',seahorse:'Seahorses',octopus:'Octopi,Octopus',
 crab:'Crabs,Fiddler Crabs',lobster:'Lobsters',frog:'Frogs,Bullfrogs',hornedtoad:'Horned Frogs,Horned Toads',lizard:'Lizards,Geckos',terrapin:'Terrapins,Turtles',bee:'Bees,Honey Bees,Busy Bees',
 scorpion:'Scorpions',spider:'Spiders',ant:'Ants,Fire Ants',dragonfly:'Dragonflies',weevil:'Boll Weevils,Weevils',firefly:'Fireflies',
 admiral:'Admirals',captain:'Captains',cadet:'Cadets',minuteman:'Minutemen',musketeer:'Musketeers',highlander:'Highlanders',thistle:'Scots',shamrock:'Shamrocks,Irish,Fighting Irish,Celtics',
 windmill:'Dutchmen,Flying Dutchmen,Hollanders',friar:'Friars',angel:'Angels',demon:'Demons,Blue Demons',wizard:'Wizards',witch:'Witches',leprechaun:'Leprechauns',pharaoh:'Pharaohs',
 sphinx:'Sphinx',gargoyle:'Gargoyles',griffin:'Griffins,Gryphons',kraken:'Kraken',bigfoot:'Bigfoot,Sasquatch',cyclops:'Cyclops',unicorn:'Unicorns',pegasus:'Pegasus',
 fireman:'Firemen,Firefighters',locomotive:'Railroaders,Rails,Engineers',jet:'Jets',aviator:'Aviators,Flyers',clipper:'Clippers,Schooners',anvil:'Blacksmiths,Smiths,Ironmen',
 hammer:'Hammers,Hammerheads',saber:'Sabers,Sabres',shield:'Defenders',cannon:'Gunners,Cannoneers',drill:'Drillers',steelbeam:'Steelers,Steelmen',lantern:'Lamplighters',
 torch:'Torchbearers,Torches',trident:'Tritons',compass:'Explorers,Navigators',gear:'Gearheads,Mechanics',atom:'Atoms,Atomics',scholar:'Scholars',rook:'Rooks,Castles',
 glove:'Boxers,Fighters,Battlers',conch:'Conchs',sun:'Suns,Sunrays',moon:'Crescents,Moonlighters',meteor:'Meteors',tornado:'Tornadoes,Golden Tornadoes,Twisters',
 snowflake:'Snowflakes,Flakes',iceberg:'Icebergs',oak:'Oaks,Mighty Oaks',acorn:'Acorns',mapleleaf:'Maples,Maple Leafs',cactus:'Cactus,Saguaros',palm:'Palms',corn:'Cornhuskers,Huskers',
 wheat:'Wheat Kings,Reapers',potato:'Spuds',peach:'Peaches',apple:'Appleknockers,Apples',orange:'Orangemen,Oranges',grapes:'Vintners',cherries:'Cherries',sunflower:'Sunflowers',rose:'Roses',
 rainbow:'Rainbows',cloud:'Rain,Thunderclouds',tumbleweed:'Tumbleweeds',wagon:'Settlers,Wagoneers',goldpan:'Prospectors,Forty Niners,49ers',boot:'Buckaroos',brand:'Ranchers',
 pilgrim:'Pilgrims',quaker:'Quakers',horseshoe:'Horseshoes,Farriers',bell:'Bells,Liberty Bells,Bellringers',lighthouse:'Lighthouse Keepers,Keepers',pinecone:'Pinecones',
 hilltop:'Hilltoppers',anchorchain:'Sailors,Seafarers'};
for(const k in M)for(const n of M[k].split(','))_LK[n.toLowerCase()]=[k,''];
})();

/*</emb_map>*/
// ═══════════ v2.07 new emblems for the new states' mascots (same 100×100 frame and outline style as the others) ═══════════
(function(){
const ST=(P,d,w,c)=>`<path d="${d}" fill="none" stroke="${P.O}" stroke-width="${w+5}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c||P.F}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
Object.assign(_LGO,{
// oil derrick with a gusher (Roughnecks, Oilers)
derrick:(P)=>{let s=`<rect x="20" y="84" width="60" height="10" rx="2" fill="${P.D}" stroke="${P.O}" stroke-width="4" stroke-linejoin="round"/>`;
 s+=ST(P,'M30,86 L46,16',6)+ST(P,'M70,86 L54,16',6);
 s+=`<g stroke="${P.O}" stroke-width="5.5" stroke-linecap="round"><path d="M42,34 L58,34 M38,52 L62,52 M34,70 L66,70 M42,34 L62,52 M58,34 L38,52 M38,52 L66,70 M62,52 L34,70"/></g>`;
 s+=`<g stroke="${P.L}" stroke-width="2.2" stroke-linecap="round"><path d="M42,34 L58,34 M38,52 L62,52 M34,70 L66,70 M42,34 L62,52 M58,34 L38,52 M38,52 L66,70 M62,52 L34,70"/></g>`;
 s+=`<rect x="42" y="8" width="16" height="10" rx="2" fill="${P.A}" stroke="${P.O}" stroke-width="3.5"/>`;
 s+=`<path d="M58,10 C70,2 86,6 90,18 C84,14 78,14 74,20 C80,22 84,28 82,36 C78,28 70,26 64,30 C66,22 62,14 58,10Z" fill="#15181d" stroke="${P.O}" stroke-width="2.5" stroke-linejoin="round"/>`;
 s+=`<path d="M84,40 C86,44 86,47 84,48 C82,47 82,44 84,40Z M76,44 C78,48 78,51 76,52 C74,51 74,48 76,44Z" fill="#15181d"/>`;return s;},
// armadillo in profile, banded shell
armadillo:(P)=>{let s=_s1('M18,70 C16,46 34,30 56,30 C76,30 90,44 90,64 L90,70Z',P);
 s+=`<path d="M18,70 C17,58 22,48 30,42 L30,70Z" fill="${P.L}" opacity=".55"/>`;
 s+=_l('M34,34 C30,46 30,58 32,70 M46,31 C43,44 43,58 44,70 M58,30 C57,44 57,58 57,70 M70,33 C71,46 71,58 70,70 M81,40 C83,50 83,60 82,70',P,2.6);
 s+=_s1('M20,60 C10,58 4,62 2,70 L8,72 L22,70Z',P,P.L)+_s1('M18,58 L14,44 L22,54Z',P,P.L);
 s+=`<circle cx="12" cy="64" r="1.8" fill="${P.O}"/>`;
 s+=_s1('M26,70 L24,82 L32,82 L34,70Z',P,P.D)+_s1('M74,70 L72,82 L80,82 L82,70Z',P,P.D);
 s+=ST(P,'M90,62 C96,66 98,72 96,80',3,P.L);return s;},
// pelican with a big pouch (Pelicans, Herons, Egrets, Flamingos)
pelican:(P)=>{let s=_s1('M20,94 C14,76 18,58 32,48 C40,42 44,36 42,28 C40,18 46,8 58,8 C68,8 74,16 72,26 L70,30 C62,30 56,36 56,44 C56,52 62,58 62,68 C62,84 48,94 34,96Z',P);
 s+=`<path d="M24,90 C22,76 26,64 36,56" fill="none" stroke="${P.L}" stroke-width="4" stroke-linecap="round" opacity=".7"/>`;
 s+=_s1('M60,14 C74,14 90,18 98,24 L96,28 C88,26 76,24 66,24Z',P,P.A);
 s+=_s1('M66,24 C76,24 88,26 96,28 C92,40 80,48 70,44 C66,40 64,30 66,24Z',P,_mx(P.A,'#ffffff',.35));
 s+=`<path d="M70,28 C78,32 86,32 92,30" fill="none" stroke="${P.O}" stroke-width="1.6" opacity=".6"/>`;
 s+=`<circle cx="60" cy="17" r="3.2" fill="#111"/><circle cx="59" cy="16" r="1" fill="#fff"/>`;
 s+=_s1('M30,62 C42,60 54,66 60,78 C50,78 38,76 28,80Z',P,P.D)+_l('M36,66 C44,67 50,70 54,75',P,1.6);return s;},
// curling wave (Waves, Surf, Tides, Crimson Tide)
wave:(P)=>{let s=_s1('M4,86 C10,56 30,30 58,24 C80,20 96,32 96,48 C96,60 86,66 76,64 C66,62 62,52 68,46 C72,42 80,44 80,50 C84,44 80,36 70,36 C50,36 40,58 40,86Z',P);
 s+=`<path d="M40,86 C40,62 50,42 70,36" fill="none" stroke="${P.L}" stroke-width="4" stroke-linecap="round" opacity=".8"/>`;
 s+=`<path d="M14,80 C18,62 30,46 46,38" fill="none" stroke="${P.D}" stroke-width="3" stroke-linecap="round"/>`;
 s+=`<g fill="#ffffff" stroke="${P.O}" stroke-width="2"><circle cx="86" cy="58" r="4"/><circle cx="92" cy="50" r="3"/><circle cx="78" cy="62" r="3"/><circle cx="60" cy="22" r="3"/><circle cx="70" cy="18" r="2.4"/></g>`;
 s+=_s1('M2,88 C20,82 40,92 58,86 C74,80 86,86 98,84 L98,96 L2,96Z',P,P.A);return s;},
// sea turtle seen from above (Honu, Sea Turtles)
turtle:(P)=>{let s=_s1('M50,6 C58,6 62,12 62,18 C62,24 56,28 50,28 C44,28 38,24 38,18 C38,12 42,6 50,6Z',P,P.L);
 s+=_s1('M30,40 C16,28 6,30 4,38 C14,40 22,46 30,52Z',P,P.L)+_s1('M70,40 C84,28 94,30 96,38 C86,40 78,46 70,52Z',P,P.L);
 s+=_s1('M34,74 C24,82 20,90 24,94 C30,90 36,84 40,78Z',P,P.L)+_s1('M66,74 C76,82 80,90 76,94 C70,90 64,84 60,78Z',P,P.L);
 s+=_s1('M50,24 C70,24 80,40 80,56 C80,76 66,88 50,88 C34,88 20,76 20,56 C20,40 30,24 50,24Z',P);
 s+=`<g fill="none" stroke="${P.K}" stroke-width="2.4" stroke-linejoin="round"><path d="M50,40 L60,47 L60,60 L50,67 L40,60 L40,47Z"/><path d="M50,24 L50,40 M60,47 L76,40 M60,60 L77,68 M50,67 L50,88 M40,60 L23,68 M40,47 L24,40"/></g>`;
 s+=`<circle cx="45" cy="14" r="2" fill="${P.O}"/><circle cx="55" cy="14" r="2" fill="${P.O}"/>`;return s;},
// magnolia blossom (Magnolias)
flower:(P)=>{let s='';for(let i=0;i<6;i++){const a=i*60-90;s+=`<g transform="rotate(${a+90} 50 52)">${_s1('M50,52 C38,40 38,16 50,6 C62,16 62,40 50,52Z',P,'#fbf7ef')}</g>`;}
 for(let i=0;i<6;i++){const a=i*60-60;s+=`<g transform="rotate(${a+90} 50 52)"><path d="M50,46 C46,38 46,26 50,18" fill="none" stroke="#e6dccb" stroke-width="2"/></g>`;}
 s+=`<circle cx="50" cy="52" r="11" fill="${P.A}" stroke="${P.O}" stroke-width="3.5"/>`;
 for(let i=0;i<8;i++){const a=i*Math.PI/4;s+=`<circle cx="${(50+Math.cos(a)*6).toFixed(1)}" cy="${(52+Math.sin(a)*6).toFixed(1)}" r="1.8" fill="${P.F}"/>`;}
 s+=_s1('M30,86 C40,74 52,72 62,78 C52,84 42,88 30,86Z',P)+_s1('M70,88 C66,78 70,68 82,64 C82,74 78,84 70,88Z',P);return s;},
// evergreen tree (Evergreens, Pine Knots)
pine:(P)=>{let s=`<rect x="44" y="76" width="12" height="18" fill="#6b4a2b" stroke="${P.O}" stroke-width="3.5"/>`;
 s+=_s1('M50,4 L72,30 L62,30 L80,52 L68,52 L88,78 L12,78 L32,52 L20,52 L38,30 L28,30Z',P);
 s+=`<path d="M50,4 L38,30 L44,30 L32,52 L40,52 L26,78 L50,78Z" fill="${P.L}" opacity=".35"/>`;
 s+=_l('M40,30 L60,30 M32,52 L68,52',P,2.4);
 s+=`<g fill="#ffffff" opacity=".9"><path d="M44,12 L50,4 L56,12 L52,14 L50,11 L47,14Z"/></g>`;return s;},
// crawfish (Crawdads, Mudbugs)
crawfish:(P)=>{let s=_s1('M42,40 C42,30 46,24 50,24 C54,24 58,30 58,40 L58,70 C58,80 54,88 50,96 C46,88 42,80 42,70Z',P);
 s+=`<path d="M42,50 L58,50 M42,58 L58,58 M43,66 L57,66 M44,74 L56,74 M46,82 L54,82" fill="none" stroke="${P.D}" stroke-width="2.2"/>`;
 s+=_s1('M42,36 C34,34 26,26 22,16 C18,8 24,4 30,8 L28,16 L34,12 C36,20 40,26 44,30Z',P);
 s+=_s1('M58,36 C66,34 74,26 78,16 C82,8 76,4 70,8 L72,16 L66,12 C64,20 60,26 56,30Z',P);
 s+=`<path d="M44,44 L30,52 M44,52 L30,60 M56,44 L70,52 M56,52 L70,60" fill="none" stroke="${P.O}" stroke-width="2.8" stroke-linecap="round"/>`;
 s+=`<path d="M47,24 C40,14 34,8 26,4 M53,24 C60,14 66,8 74,4" fill="none" stroke="${P.O}" stroke-width="1.8" stroke-linecap="round"/>`;
 s+=`<circle cx="46" cy="30" r="2.4" fill="#111"/><circle cx="54" cy="30" r="2.4" fill="#111"/>`;
 s+=_s1('M44,90 L50,98 L56,90 L50,94Z',P,P.D);return s;},
// fleur-de-lis (Cajuns, Saints)
fleur:(P)=>{let s=_s1('M50,4 C62,18 62,38 54,58 L46,58 C38,38 38,18 50,4Z',P);
 s+=_s1('M46,58 C34,58 20,52 16,40 C12,28 22,20 30,26 C24,28 24,36 30,40 C36,44 42,46 46,48Z',P);
 s+=_s1('M54,58 C66,58 80,52 84,40 C88,28 78,20 70,26 C76,28 76,36 70,40 C64,44 58,46 54,48Z',P);
 s+=`<rect x="28" y="56" width="44" height="10" rx="3" fill="${P.A}" stroke="${P.O}" stroke-width="4"/>`;
 s+=_s1('M46,66 C44,78 38,86 30,92 L42,92 C46,88 48,82 50,76 C52,82 54,88 58,92 L70,92 C62,86 56,78 54,66Z',P);
 s+=`<path d="M50,10 C46,22 46,38 49,54" fill="none" stroke="${P.L}" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>`;return s;},
// snow-capped peaks (Mountaineers, Peaks, Avalanche, Glaciers)
mountain:(P)=>{let s=_s1('M2,88 L36,28 L52,54 L66,34 L98,88Z',P);
 s+=`<path d="M36,28 L24,50 L32,46 L36,52 L42,44 L46,48Z" fill="#ffffff" stroke="${P.O}" stroke-width="2.4" stroke-linejoin="round"/>`;
 s+=`<path d="M66,34 L58,46 L64,44 L68,50 L72,42 L76,46Z" fill="#ffffff" stroke="${P.O}" stroke-width="2.4" stroke-linejoin="round"/>`;
 s+=`<path d="M36,28 L52,54 L44,88 L62,88 L52,54 L66,34" fill="${P.D}" opacity=".35"/>`;
 s+=`<circle cx="82" cy="20" r="9" fill="${P.A}" stroke="${P.O}" stroke-width="3"/>`;
 s+=_s1('M2,88 C20,80 34,84 50,80 C66,76 82,82 98,80 L98,94 L2,94Z',P,P.D);return s;},
// moonshine jug (Moonshiners)
jug:(P)=>{let s=_s1('M38,30 L38,20 L62,20 L62,30 C80,36 88,52 88,68 C88,86 72,94 50,94 C28,94 12,86 12,68 C12,52 20,36 38,30Z',P,'#d9c7a3');
 s+=`<path d="M62,30 C74,30 82,36 82,46" fill="none" stroke="${P.O}" stroke-width="8"/><path d="M62,30 C74,30 82,36 82,46" fill="none" stroke="#d9c7a3" stroke-width="3.5"/>`;
 s+=`<rect x="40" y="10" width="20" height="12" rx="3" fill="#7a5233" stroke="${P.O}" stroke-width="3.5"/>`;
 s+=`<path d="M12,58 C30,52 70,52 88,58 L88,66 C70,60 30,60 12,66Z" fill="${P.F}" stroke="${P.O}" stroke-width="2.6"/>`;
 s+=`<g stroke="${P.D}" stroke-width="5" stroke-linecap="round"><path d="M28,72 L40,86 M40,72 L28,86 M44,72 L56,86 M56,72 L44,86 M60,72 L72,86 M72,72 L60,86"/></g>`;return s;},
// crossed pickaxes (Miners, Coal Miners)
pick:(P)=>{let s=ST(P,'M18,92 L80,22',6,'#8a5a32')+ST(P,'M82,92 L20,22',6,'#8a5a32');
 const head=(rot)=>`<g transform="rotate(${rot} 50 50)">${_s1('M14,30 C30,14 50,10 70,14 C54,16 40,22 30,32 Z',P)}${_s1('M70,14 C80,16 88,22 92,30 C84,26 78,24 70,22Z',P,'#c9d1da')}</g>`;
 s+=head(0)+`<g transform="${_MR}">${head(0)}</g>`;
 s+=`<circle cx="50" cy="56" r="7" fill="${P.A}" stroke="${P.O}" stroke-width="3"/>`;return s;},
// orca breaching (Orcas)
orca:(P)=>{let s=_s1('M8,70 C18,44 44,30 68,32 C82,33 94,42 96,54 C88,62 74,64 62,62 L56,74 C40,80 22,80 8,70Z',P,'#16191f');
 s+=_s1('M44,34 L52,6 L62,32Z',P,'#16191f');
 s+=`<path d="M70,40 C76,38 82,40 84,44 C78,46 72,45 70,40Z" fill="#f4f6f8"/>`;
 s+=`<path d="M30,62 C42,58 54,58 62,62 C56,70 40,74 24,70Z" fill="#f4f6f8"/>`;
 s+=_s1('M8,70 L0,58 L4,76 L-2,88 L12,76Z',P,'#16191f');
 s+=`<circle cx="80" cy="47" r="1.8" fill="#f4f6f8"/>`;
 s+=_s1('M2,90 C20,82 40,92 58,86 C74,80 86,88 98,84 L98,96 L2,96Z',P);return s;},
// leaping salmon (Steelheads, Salmon Kings)
salmon:(P)=>{let s=_s1('M8,78 C18,52 40,32 66,26 C78,24 88,26 96,30 C90,38 80,44 70,46 C54,50 40,62 30,76 L22,90 L18,78 L6,86Z',P);
 s+=`<path d="M24,72 C36,56 54,44 76,38" fill="none" stroke="${P.L}" stroke-width="4" stroke-linecap="round" opacity=".8"/>`;
 s+=_s1('M56,30 L60,16 L70,28Z',P,P.D)+_s1('M48,56 L42,66 L54,58Z',P,P.D);
 s+=`<circle cx="84" cy="31" r="2.6" fill="#111"/><path d="M90,34 C86,36 82,36 80,35" fill="none" stroke="${P.O}" stroke-width="1.6"/>`;
 s+=`<g fill="${P.D}"><circle cx="54" cy="40" r="1.6"/><circle cx="62" cy="36" r="1.6"/><circle cx="46" cy="46" r="1.6"/><circle cx="58" cy="44" r="1.6"/></g>`;
 s+=`<g fill="#ffffff" stroke="${P.O}" stroke-width="1.6"><circle cx="14" cy="88" r="3"/><circle cx="26" cy="92" r="2.4"/></g>`;return s;},
// moose head with palmate antlers (Moose)
moose:(P)=>{let s=_sy('M44,30 C36,30 30,24 24,26 C16,28 10,22 8,14 C14,18 18,16 20,10 C24,16 26,14 28,8 C32,14 34,12 36,6 C38,14 40,18 44,22Z',P,P.L);
 s+=_s1('M38,26 C44,22 56,22 62,26 C66,34 66,44 64,56 C66,64 66,72 62,80 C58,88 42,88 38,80 C34,72 34,64 36,56 C34,44 34,34 38,26Z',P);
 s+=_s1('M38,30 L26,36 L34,40Z',P)+_s1('M62,30 L74,36 L66,40Z',P);
 s+=`<path d="M40,68 C44,76 56,76 60,68 C58,84 42,84 40,68Z" fill="${P.D}"/><circle cx="45" cy="76" r="1.8" fill="${P.O}"/><circle cx="55" cy="76" r="1.8" fill="${P.O}"/>`;
 s+=`<circle cx="43" cy="46" r="2.6" fill="#111"/><circle cx="57" cy="46" r="2.6" fill="#111"/>`;
 s+=_s1('M46,86 C46,94 54,94 54,86Z',P,P.D);return s;},
// erupting volcano (Volcanoes, Mauna Kings)
volcano:(P)=>{let s=`<path d="M38,30 C30,20 34,8 44,10 C46,2 58,2 60,10 C70,8 74,20 64,28Z" fill="#59606b" stroke="${P.O}" stroke-width="2.6" stroke-linejoin="round" opacity=".9"/>`;
 s+=_s1('M4,92 L38,34 L62,34 L96,92Z',P);
 s+=_s1('M38,34 C42,40 46,36 50,42 C54,36 58,40 62,34 L64,38 C60,50 58,62 62,74 C56,66 52,56 50,46 C48,58 42,66 36,74 C40,62 40,50 36,38Z',P,'#f05a1a');
 s+=`<path d="M44,30 L40,12 M50,30 L50,8 M56,30 L62,12" stroke="${P.O}" stroke-width="6" stroke-linecap="round"/><path d="M44,30 L40,12 M50,30 L50,8 M56,30 L62,12" stroke="#ffb02e" stroke-width="3" stroke-linecap="round"/>`;
 s+=`<path d="M38,34 L20,64 L30,62 L24,80 L44,52Z" fill="${P.D}" opacity=".35"/>`;
 s+=_s1('M2,92 C18,86 34,94 50,90 C66,86 82,92 98,90 L98,98 L2,98Z',P,P.A);return s;}
});
})();

/*<emb_a>*/
