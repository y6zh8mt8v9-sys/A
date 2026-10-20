// ═══════════ WEEKLY PRACTICE ═══════════
const PRAC_REPS=12;
function pracKey(){const g=(G.sched||[]).find(x=>(x.type==='regular'||x.type==='playoff')&&!x.result);return G.yr+'-'+(g?g.type+g.wk:'x');}
function pracDone(){return!!(G.pracDone&&G.pracDone[pracKey()]);}
function pracAvailable(){return(G.phase==='regular'||G.phase==='playoffs')&&!pracDone();}
function pracKit(s,off,qbCol){const u=uniOf(s,'home');
  const base={helmet:u.helmet,hstripe:u.hstripe,mask:u.mask,pants:u.pants,pstripe:u.pstripe,cleat:'#151a22'};
  if(off)return Object.assign({},base,{jersey:'#f2f2f2',trim:'#cfd3d8',num:'#151515',sock:'#f2f2f2'});
  return Object.assign({},base,{jersey:'#17191d',trim:'#2c3036',num:'#f4f4f4',sock:'#17191d'});}
function pracOpen(){
  if(!pracAvailable()){notify('This week\'s practice is already done.','w');return;}
  const qc=window._pracQB||'#d8333b';
  const sw=[['#d8333b','Red'],['#2fa84f','Green'],['#2f7fe0','Blue']].map(([c,l])=>`<button class="gd-uni${qc===c?' on':''}" onclick="window._pracQB='${c}';pracOpen()" style="padding:6px 12px"><span style="display:inline-block;width:18px;height:18px;border-radius:50%;background:${c};border:1px solid #fff;vertical-align:middle"></span> ${l}</button>`).join('');
  openMo(`<div style="padding:4px 2px">
    <div style="font-weight:900;font-size:20px;margin-bottom:4px">Weekly Practice</div>
    <div style="display:inline-block;font-weight:900;font-size:13px;padding:4px 12px;border-radius:999px;background:var(--ac);color:var(--tOn,#fff);margin-bottom:8px">${PRAC_REPS} reps per practice · no game clock</div>
    <div style="font-size:13px;color:var(--mu);margin-bottom:12px">Each rep is one play from the 35. Offense wears white, defense black. Players earn XP for taking reps and for big plays; every 10 XP becomes a skill point. One practice per week.</div>
    ${(()=>{const me=myS(),pi=pracInfo(stadOf(me),me.stadC,me);return`<div style="font-size:12px;margin:-4px 0 12px"><b>Venue:</b> ${pi.name}${pi.pl?'':' (your own practice field comes at stadium tier 5)'}</div>`;})()}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px;margin-bottom:12px">
      <button class="btn bgn" onclick="clo();pracStart('off')" style="min-height:56px">Offense vs Defense<br><small style="font-weight:600">You run the offense</small></button>
      <button class="btn bbl" onclick="clo();pracStart('def')" style="min-height:56px">Defense vs Offense<br><small style="font-weight:600">You play defense</small></button>
      <button class="btn" onclick="clo();pracStart('air')" style="min-height:56px">Offense on air<br><small style="font-weight:600">Timing reps, no defense</small></button>
      <button class="bgh" onclick="clo();pracSim()" style="min-height:56px">Sim practice<br><small style="font-weight:600">Quick, fewer XP</small></button>
    </div>
    <label style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;margin-bottom:12px;cursor:pointer"><input type="checkbox" ${window._pracJV!==false?'checked':''} onchange="window._pracJV=this.checked"> JV team plays the scout team (they earn practice XP too)</label>
    <div style="font-size:12px;font-weight:800;color:var(--mu);margin-bottom:6px">Quarterback non-contact jersey</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">${sw}</div></div>`);
}
function pracStart(mode){
  const me=myS(),qc=window._pracQB||'#d8333b',offK=pracKit(me,true),defK=pracKit(me,false);
  const userOff=mode!=='def';
  _gdAnchor=_gdTop(me);_gdTAdj=0;
  const jvIn=window._pracJV!==false&&G.players.some(p=>p.sId===G.myId&&p.onJV);
  const tOff=gdTeam(me,'home',offK,{scout:jvIn&&!userOff}),tDef=gdTeam(me,'home',defK,{scout:jvIn&&userOff});
  const t0=userOff?tOff:tDef,t1=userOff?tDef:tOff;
  t0.name=userOff?'Offense':'Defense';t1.name=userOff?'Defense':'Offense';t0.city=me.mascot;t1.city=me.mascot;
  const qk=Object.assign({},offK,{jersey:qc,trim:'#ffffff',num:'#ffffff',sock:'#f2f2f2'});
  const qbPack={helmet:qk.helmet,helmetStripe:qk.hstripe,helmetLogo:qk.hstripe,facemask:qk.mask,jersey:qk.jersey,jerseyTrim:qk.trim,pants:qk.pants,pantsStripe:qk.pstripe,belt:'#1d1d22',socks:qk.sock,sockStripe:qk.trim,cleats:qk.cleat,cleatAccent:qk.trim,gloves:qk.trim,number:qk.num,numberTrim:null,armSleeve:'skin'};
  window.__GP={teams:[t0,t1],home:0,practice:{mode,reps:PRAC_REPS},qbPack,stadium:pracInfo(stadOf(me),me.stadC,me),ez:_gdDark(me.c1||'#1c3766',.25),ezText:'#ffffff'};
  _gdCtx={kind:'prac',mode};gdLaunch();
}
// ── v2.00 gameplay tutorial: an interactive walkthrough on your own practice field before the first game of a career ──
function tutPracStart(){
  if(!G||!G.myId){notify('Start or load a career first: the tutorial uses your own team.','w');return;}
  const me=myS(),offK=pracKit(me,true),defK=pracKit(me,false);
  _gdAnchor=_gdTop(me);_gdTAdj=0;
  const t0=gdTeam(me,'home',offK),t1=gdTeam(me,'home',defK);
  t0.name='Starters';t1.name='Scout team';t0.city=me.mascot;t1.city=me.mascot;
  window.__GP={teams:[t0,t1],home:0,practice:{mode:'tut',reps:99},stadium:pracInfo(stadOf(me),me.stadC,me),ez:_gdDark(me.c1||'#1c3766',.25),ezText:'#ffffff'};
  G.tutAsked=true;_gdCtx={kind:'prac',mode:'tut'};gdLaunch();
}
function tutFinish(res){
  const done=res&&res.tut==='done';G.tutAsked=true;if(done)G.tutDone=true;
  // a short practice's worth of XP for everyone who took a rep (the weekly practice is still available)
  const rows=[];for(const mid of(res.played||[])){const p=getP(+mid);if(!p||p.sId!==G.myId)continue;p.xp=(p.xp||0)+2;let sp=0;while(p.xp>=10){p.xp-=10;sp++;}if(sp)p.sp=(p.sp||0)+sp;rows.push(p);}
  addLog(`<span style="color:var(--gn)">Gameplay tutorial ${done?'completed':'ended early'}: ${rows.length} players earned 2 XP.</span>`);
  nav('dash');
  openMo(`<div style="font-weight:900;font-size:20px;margin-bottom:6px">${done?'Tutorial complete':'Tutorial closed'}</div>
    <div style="font-size:13px;color:var(--mu);margin-bottom:12px">${done?'You know the core controls: play calls, the slingshot throw, catch meters, ball-carrier moves, defense and the kick meter.':'You can restart it any time from Help → Gameplay.'} ${rows.length} players earned 2 XP. Your weekly practice is still available.</div>
    <div style="text-align:right"><button class="btn" onclick="clo()">Done</button></div>`);
}
function tutOffer(then){
  openMo(`<div style="text-align:center;padding:4px 2px">
    <div style="font-weight:900;font-size:20px;margin-bottom:6px">Before your first game</div>
    <div style="font-size:13px;color:var(--mu);margin-bottom:14px">Run a short, interactive <b>gameplay tutorial</b> on your practice field: call plays, throw, catch, make moves, play defense and kick a field goal with your own players. It takes about five minutes.</div>
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
      <button class="btn bgn" style="min-width:190px" onclick="clo();tutPracStart()">Start the tutorial</button>
      <button class="bgh" style="min-width:190px" onclick="G.tutAsked=true;clo();(${then?'advWk':'()=>{}'})()">Skip, play week 1</button></div></div>`);
}
function pracGrant(gains){
  try{progPractice();}catch(e){}
  const rows=[];
  for(const[id,xp]of Object.entries(gains)){const p=getP(+id);if(!p||p.sId!==G.myId)continue;
    p.xp=(p.xp||0)+xp;let sp=0;while(p.xp>=10){p.xp-=10;sp++;}if(sp)p.sp=(p.sp||0)+sp;rows.push({p,xp,sp});}
  G.pracDone=G.pracDone||{};G.pracDone[pracKey()]=1;
  rows.sort((a,b)=>b.xp-a.xp);
  const tot=rows.reduce((a,r)=>a+r.sp,0);
  addLog(`<span style="color:var(--gn)">Practice complete: ${rows.length} players earned XP${tot?`, ${tot} new skill point${tot>1?'s':''}`:''}.</span>`);
  return rows;
}
function pracShow(rows,title){
  nav('dash');
  openMo(`<div style="font-weight:900;font-size:20px;margin-bottom:6px">${title}</div>
    <div style="font-size:12px;color:var(--mu);margin-bottom:10px">XP earned this practice. Every 10 XP becomes 1 skill point (spend it on the player's page or in Offseason).</div>
    <div style="max-height:52vh;overflow-y:auto">${rows.slice(0,24).map(r=>`<div style="display:flex;align-items:center;gap:10px;padding:6px 4px;border-bottom:1px solid var(--bd)">${face(r.p.fs,30)}<div style="flex:1;min-width:0"><b>${r.p.fn} ${r.p.ln}</b> <span style="color:var(--mu);font-size:12px">${r.p.pos} #${r.p.num}</span></div><div style="font-weight:800;color:var(--te)">+${r.xp} XP</div>${r.sp?`<div style="font-weight:900;color:var(--gn)">+${r.sp} SP</div>`:''}<div style="font-size:11px;color:var(--mu);width:52px;text-align:right">${r.p.xp||0}/10</div></div>`).join('')}</div>
    <div style="text-align:right;margin-top:12px"><button class="btn" onclick="clo()">Done</button></div>`);
}
function pracFinish(res){
  const gains={};
  for(const mid of(res.played||[])){const st=(res.stats||{})[mid]||{};
    let xp=3+Math.min(6,Math.round((st.passYds||0)/40+(st.rushYds||0)/15+(st.recYds||0)/15+(st.passTD||0)*2+(st.rushTD||0)*2+(st.recTD||0)*2+(st.rec||0)*0.5+(st.krYds||0)/25+(st.krTD||0)*2+(st.pancakes||0)*0.8+(st.pbu||0)*1+(st.tackles||0)*0.8+(st.sacks||0)*2+(st.ints||0)*3));
    const p=getP(+mid);if(p){if(p.traits&&p.traits.includes('hard-worker'))xp+=1;if(p.yr<=10)xp+=1;
      if(res.pracMode==='off'&&['DL','LB','CB','S'].includes(p.pos))xp+=3+Math.min(3,Math.round(((st.tackles||0)+(st.sacks||0)*2+(st.ints||0)*3+(st.pbu||0))*0.6));}
    gains[mid]=(gains[mid]||0)+xp;}
  const rows=pracGrant(gains);
  try{showLoading('Practice wrap-up',myS(),5,()=>pracShow(rows,'Practice results'));}catch(e){pracShow(rows,'Practice results');}
}
function pracSim(){
  const ps=myP().filter(p=>!(p.inj>0)).sort((a,b)=>b.rat-a.rat).slice(0,30),gains={};
  for(const p of ps){let xp=2+Math.floor(Math.random()*3);if(p.traits&&p.traits.includes('hard-worker'))xp+=1;if(p.yr<=10)xp+=1;gains[p.id]=xp;}
  if(window._pracJV!==false)for(const p of G.players.filter(q=>q.sId===G.myId&&q.onJV&&!(q.inj>0))){let xp=2+Math.floor(Math.random()*2);if(p.traits&&p.traits.includes('hard-worker'))xp+=1;gains[p.id]=(gains[p.id]||0)+xp;}
  const rows=pracGrant(gains);pracShow(rows,'Simulated practice');
}

// ═══════════ INTERNATIONAL TEAMS (fixed, hand-made) ═══════════
const INTL_TEAMS=[
 {id:9001,name:'Berlin Adler Academy',city:'Berlin, Germany',ctry:'GER',mascot:'Adler',abbr:'BAA',c1:'#0b1f3a',c2:'#d4a017',c3:'#c8102e',base:58,offS:'Pro Style',defS:'4-3',prestige:4,tag:'Elite youth academy of the German capital'},
 {id:9002,name:'Rhein-Ruhr Selection',city:'Düsseldorf, Germany',ctry:'GER',mascot:'Steel Wolves',abbr:'RRS',c1:'#3a3f46',c2:'#f2f2f2',c3:'#e2231a',base:54,offS:'Spread',defS:'4-3',prestige:3,tag:'All-star selection from the Rhine and Ruhr region'},
 {id:9003,name:'London Gridiron Academy',city:'London, England',ctry:'UK',mascot:'Lions',abbr:'LGA',c1:'#7a0019',c2:'#ffffff',c3:'#0b2a63',base:56,offS:'Air Raid',defS:'Cover 2',prestige:3,tag:'London\u2019s top American football academy'},
 {id:9004,name:'Northern Knights Travel Team',city:'Manchester, England',ctry:'UK',mascot:'Knights',abbr:'NKT',c1:'#1b1b1b',c2:'#c9a227',c3:'#7d8c99',base:50,offS:'Wing-T',defS:'3-4',prestige:2,tag:'Travel team of the best players in the North of England'},
 {id:9005,name:'Madrid Toros Academia',city:'Madrid, Spain',ctry:'ESP',mascot:'Toros',abbr:'MTA',c1:'#c60b1e',c2:'#ffc400',c3:'#1a1a1a',base:52,offS:'Spread',defS:'46',prestige:2,tag:'Spain\u2019s national youth football academy'},
 {id:9006,name:'Selección Monterrey',city:'Monterrey, Mexico',ctry:'MEX',mascot:'Jaguares',abbr:'SMT',c1:'#00594f',c2:'#f2f2f2',c3:'#c8102e',base:62,offS:'Option',defS:'4-3',prestige:4,tag:'Selection of the best players from the Monterrey high school leagues'},
 {id:9007,name:'Kobe Seiryo High School',city:'Kobe, Japan',ctry:'JPN',mascot:'Blue Fighters',abbr:'KSH',c1:'#0b3d91',c2:'#ffffff',c3:'#8fb8ff',base:57,offS:'Spread',defS:'Cover 2',prestige:4,tag:'Perennial power of Japanese high school football'},
 {id:9008,name:'Tokyo Akatsuki High School',city:'Tokyo, Japan',ctry:'JPN',mascot:'Samurai',abbr:'TAH',c1:'#b11226',c2:'#111111',c3:'#ffffff',base:53,offS:'Pro Style',defS:'3-4',prestige:3,tag:'Disciplined Tokyo high school program'},
 {id:9009,name:'Polynesian All-Star Selection',city:'Honolulu, Hawaii',ctry:'POLY',mascot:'Voyagers',abbr:'PAS',c1:'#0a7c8c',c2:'#f4e2b8',c3:'#1b1b1b',base:64,offS:'Option',defS:'46',prestige:4,tag:'All-stars from Samoa, Tonga, Hawaii and Aotearoa'}];
INTL_TEAMS.push(
 {id:9010,name:'Kyoto Higashiyama High School',city:'Kyoto, Japan',ctry:'JPN',mascot:'Kitsune',abbr:'KHH',c1:'#e86a10',c2:'#ffffff',c3:'#2b1b17',base:55,offS:'Spread',defS:'4-3',prestige:3,tag:'Shrine-city school named for the fox spirits of Fushimi Inari'},
 {id:9011,name:'Sapporo Hokusei High School',city:'Sapporo, Japan',ctry:'JPN',mascot:'Snow Cranes',abbr:'SHH',c1:'#d7263d',c2:'#ffffff',c3:'#0b1f3a',base:51,offS:'Pro Style',defS:'Cover 2',prestige:2,tag:'Hokkaido program named for the red-crowned crane'},
 {id:9012,name:'München Isar Academy',city:'Munich, Germany',ctry:'GER',mascot:'Löwen',abbr:'MIA',c1:'#0066b3',c2:'#ffffff',c3:'#c9a227',base:57,offS:'Pro Style',defS:'4-3',prestige:4,tag:'Bavarian academy carrying the lion of the old Wittelsbach crest'},
 {id:9013,name:'Hamburg Hanse Selection',city:'Hamburg, Germany',ctry:'GER',mascot:'Freibeuter',abbr:'HHS',c1:'#111111',c2:'#e30613',c3:'#ffffff',base:53,offS:'Spread',defS:'46',prestige:3,tag:'Port-city selection named after Störtebeker’s Likedeeler pirates'},
 {id:9014,name:'Nairobi Savannah Academy',city:'Nairobi, Kenya',ctry:'AFR',mascot:'Rhinos',abbr:'NSA',c1:'#006600',c2:'#bb0000',c3:'#111111',base:55,offS:'Option',defS:'4-3',prestige:3,tag:'East African academy built around speed and power'},
 {id:9015,name:'Bergen Fjord Selection',city:'Bergen, Norway',ctry:'NORD',mascot:'Trolls',abbr:'BFS',c1:'#0b3c5d',c2:'#d8e6f3',c3:'#ba0c2f',base:50,offS:'Wing-T',defS:'3-4',prestige:2,tag:'Nordic all-stars from the fjords, named for the mountain trolls'},
 {id:9016,name:'Paris Gridiron Académie',city:'Paris, France',ctry:'FRA',mascot:'Coqs',abbr:'PGA',c1:'#002395',c2:'#ffffff',c3:'#ed2939',base:54,offS:'Air Raid',defS:'Cover 2',prestige:3,tag:'French academy under the Gallic rooster'},
 {id:9017,name:'Aotearoa Selection',city:'Auckland, New Zealand',ctry:'NZ',mascot:'Taniwha',abbr:'AOS',c1:'#000000',c2:'#ffffff',c3:'#8c8c8c',base:60,offS:'Option',defS:'46',prestige:4,tag:'Named for the guardian water spirits of Māori legend'},
 {id:9018,name:'Buenos Aires Pampas Selección',city:'Buenos Aires, Argentina',ctry:'SAM',mascot:'Cóndores',abbr:'BAP',c1:'#75aadb',c2:'#ffffff',c3:'#f6b40e',base:52,offS:'Spread',defS:'4-3',prestige:2,tag:'South American selection named for the Andean condor'},
 {id:9019,name:'Wien Alpine Academy',city:'Vienna, Austria',ctry:'AUT',mascot:'Steinböcke',abbr:'WAA',c1:'#c8102e',c2:'#ffffff',c3:'#3c3c3c',base:51,offS:'Pro Style',defS:'3-4',prestige:2,tag:'Alpine academy named for the ibex of the Austrian Alps'},
 {id:9020,name:'Roma Accademia',city:'Rome, Italy',ctry:'ITA',mascot:'Gladiatori',abbr:'RAC',c1:'#7a0019',c2:'#d4af37',c3:'#ffffff',base:55,offS:'Pro Style',defS:'4-3',prestige:3,tag:'Roman academy inspired by the gladiators of the Colosseum'});
const INTL_REGION={GER:'Europe & Africa',UK:'Europe & Africa',ESP:'Europe & Africa',FRA:'Europe & Africa',ITA:'Europe & Africa',AUT:'Europe & Africa',NORD:'Europe & Africa',AFR:'Europe & Africa',MEX:'Americas & Pacific',SAM:'Americas & Pacific',JPN:'Americas & Pacific',POLY:'Americas & Pacific',NZ:'Americas & Pacific'};
const OOS_TEAMS=[
 ['Sedona Red Rock High','Sedona, AZ','Javelinas','#b5462b','#f2c46d',58],['Bayou Teche High','St. Martinville, LA','Crawdads','#c1272d','#1b1b1b',52],
 ['Tombstone Desert High','Tombstone, AZ','Marshals','#5b3a29','#e8c070',49],['Timberline High','Government Camp, OR','Sasquatch','#2e4a2b','#c0a080',55],
 ['Galveston Island High','Galveston, TX','Pelicans','#0077b6','#f4d35e',61],['Point Pleasant River High','Point Pleasant, WV','Mothmen','#3d0c45','#e63946',50],
 ['Nantucket Whaling Academy','Nantucket, MA','Harpooners','#14213d','#e5e5e5',47],['Taos Mesa High','Taos, NM','Roadrunners','#d4a373','#264653',53],
 ['Deadwood Hills High','Deadwood, SD','Prospectors','#3a3a3a','#d4af37',51],['Northern Plains High','Fargo, ND','Blizzard','#4a90c2','#ffffff',57],
 ['Delta Kings High','Clarksdale, MS','Kings','#2b2d42','#f6bd60',54],['Space Coast High','Titusville, FL','Astronauts','#0b3d91','#fc3d21',63],
 ['Pine Barrens High','Hammonton, NJ','Jersey Devils','#7b0d1e','#111111',56],['Champlain Valley High','Burlington, VT','Champs','#2a9d8f','#f1faee',48],
 ['Kodiak Island High','Kodiak, AK','Kodiaks','#4b3621','#9fc5e8',50],['Kilauea High','Hilo, HI','Lava','#d62828','#2b2b2b',59],
 ['Dodge City Frontier High','Dodge City, KS','Stampede','#8b4513','#f4e3b2',55],['Wright Brothers High','Kitty Hawk, NC','Aviators','#1d3557','#f1c40f',60]];
const OOS_LOGO={javelinas:'bull',crawdads:'claw',marshals:'star',sasquatch:'bear',pelicans:'eagle',mothmen:'ghost',harpooners:'anchor',roadrunners:'falcon',prospectors:'axes',blizzard:'cyclone',kings:'crown',astronauts:'rocket','jersey devils':'devil',champs:'dragon',kodiaks:'bear',lava:'flame',stampede:'horse',aviators:'hawk'};
const INTL_NAMES={
 GER:[['Lukas','Jonas','Leon','Finn','Noah','Elias','Paul','Felix','Maximilian','Ben','Luca','Tim','Niklas','Jannik','Moritz','Tobias','Marvin','Dennis','Emre','Yannick','Malik','Julian'],['Müller','Schmidt','Schneider','Fischer','Weber','Meyer','Wagner','Becker','Hoffmann','Schulz','Koch','Richter','Klein','Wolf','Neumann','Zimmermann','Krüger','Hartmann','Lange','Brandt','Yilmaz','Kowalski','Okafor','Haas']],
 UK:[['Oliver','Harry','Jack','Charlie','George','Alfie','Jacob','Thomas','James','Kai','Callum','Rhys','Ethan','Marcus','Jamal','Tyrese','Liam','Connor','Ryan','Josh'],['Smith','Jones','Taylor','Brown','Williams','Wilson','Evans','Roberts','Walker','Wright','Robinson','Thompson','Hughes','Edwards','Green','Mensah','Adeyemi','Campbell','Murphy','Clarke','Davies']],
 ESP:[['Hugo','Pablo','Mateo','Álvaro','Daniel','Alejandro','Javier','Diego','Sergio','Adrián','Marcos','Iker','Rubén','Carlos','Mario','Raúl'],['García','Fernández','González','Rodríguez','López','Martínez','Sánchez','Pérez','Gómez','Martín','Jiménez','Ruiz','Hernández','Díaz','Moreno','Álvarez','Romero','Navarro','Torres','Domínguez']],
 MEX:[['Santiago','Mateo','Sebastián','Leonardo','Emiliano','Diego','Iker','Rodrigo','Héctor','Luis','Jorge','Andrés','Ángel','Fernando','Ricardo','Joaquín'],['Hernández','García','Martínez','López','González','Rodríguez','Pérez','Sánchez','Ramírez','Cruz','Flores','Gómez','Morales','Vázquez','Reyes','Jiménez','Torres','Ortiz','Castillo','Mendoza']],
 JPN:[['Haruto','Sota','Yuto','Riku','Hinata','Kaito','Ren','Daiki','Takumi','Shota','Kenta','Yuki','Ryota','Kazuki','Hayato','Sho','Taiga','Kota'],['Sato','Suzuki','Takahashi','Tanaka','Watanabe','Ito','Yamamoto','Nakamura','Kobayashi','Kato','Yoshida','Yamada','Sasaki','Matsumoto','Inoue','Kimura','Hayashi','Shimizu']],
 AFR:[['Kevin','Brian','Dennis','Emmanuel','Chinedu','Kwame','Tunde','Samuel','Joseph','Victor','Amani','Baraka','Juma','Ade','Kofi','Musa'],['Otieno','Kamau','Mwangi','Odhiambo','Okafor','Adeyemi','Mensah','Kiprop','Wanjala','Ochieng','Njoroge','Abubakar','Boateng','Kariuki','Chege','Onyango']],
 NORD:[['Magnus','Henrik','Lars','Erik','Oskar','Sindre','Mathias','Jonas','Aksel','Emil','Elias','Viktor','Kasper','Mikkel','Olav','Sander'],['Hansen','Johansen','Olsen','Larsen','Andersen','Nilsen','Berg','Haugen','Lund','Dahl','Eriksen','Lie','Moen','Solberg','Bakken','Strand']],
 FRA:[['Lucas','Hugo','Louis','Gabriel','Arthur','Jules','Adam','Raphaël','Mathis','Théo','Nathan','Enzo','Moussa','Yanis','Kylian','Bastien'],['Martin','Bernard','Dubois','Thomas','Robert','Richard','Petit','Durand','Leroy','Moreau','Simon','Laurent','Lefebvre','Michel','Diallo','Traoré']],
 NZ:[['Tama','Rawiri','Nikau','Manaia','Liam','Jack','Oliver','Hemi','Tane','Wiremu','Mason','Ari','Kauri','Lachlan','Ihaia','Koa'],['Ngata','Parata','Smith','Wilson','Tipene','Walker','Te Hira','Kingi','Brown','Nikora','Hohaia','Tamihana','Williams','Rewiti','Paewai','Taylor']],
 SAM:[['Santiago','Mateo','Thiago','Tomás','Benjamín','Joaquín','Lautaro','Facundo','Matías','Felipe','Gonzalo','Ignacio','Nicolás','Agustín','Bruno','Lucas'],['González','Rodríguez','Fernández','López','Martínez','Pereira','Silva','Gómez','Díaz','Romero','Álvarez','Sosa','Torres','Ruiz','Acosta','Benítez']],
 AUT:[['Lukas','David','Jakob','Maximilian','Felix','Paul','Tobias','Simon','Elias','Florian','Moritz','Julian','Fabian','Sebastian','Raphael','Dominik'],['Gruber','Huber','Bauer','Wagner','Müller','Pichler','Steiner','Moser','Mayer','Hofer','Leitner','Berger','Fuchs','Eder','Fischer','Schmid']],
 ITA:[['Leonardo','Francesco','Alessandro','Lorenzo','Mattia','Andrea','Gabriele','Riccardo','Tommaso','Edoardo','Matteo','Giuseppe','Luca','Marco','Davide','Federico'],['Rossi','Russo','Ferrari','Esposito','Bianchi','Romano','Colombo','Ricci','Marino','Greco','Bruno','Gallo','Conti','De Luca','Mancini','Costa']],
 POLY:[['Tavita','Sione','Malakai','Ioane','Tevita','Kainoa','Keoni','Manaia','Siosaia','Tanielu','Rangi','Wiremu','Nikau','Pita','Kalani','Makoa','Semisi','Losaline'],['Tuiasosopo','Fifita','Taufa','Mauga','Leota','Tuilagi','Kaufusi','Vainikolo','Faleolo','Kealoha','Kahananui','Tupou','Fonoti','Aumua','Paepae','Ngata','Havili','Fuimaono']]};
const INTL_SKIN={GER:[0,6],UK:[0,7],ESP:[1,4],MEX:[2,5],JPN:[1,3],POLY:[3,6],AFR:[5,7],NORD:[0,2],FRA:[0,7],NZ:[2,6],SAM:[1,5],AUT:[0,3],ITA:[0,4],US:[0,7]};
function _intlRng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function intlLogoMap(){
  if(typeof _LK==='undefined')return;
  const cp=(k,src,fb)=>{if(!_LK[k])_LK[k]=_LK[src]||fb;};
  cp('adler','eagles',['eagle','']);cp('steel wolves','wolves',['wolf','']);cp('toros','bulls',['bull','']);cp('jaguares','jaguars',['cat','']);
  cp('blue fighters','knights',['knight','']);cp('samurai','warriors',['swords','']);cp('voyagers','mariners',['anchor','']);
  cp('kitsune','foxes',['fox','']);cp('snow cranes','falcons',['falcon','']);cp('löwen','lions',['cat','lion']);cp('freibeuter','pirates',['pirate','']);cp('rhinos','bulls',['bull','']);
  cp('trolls','vikings',['viking','']);cp('coqs','phoenix',['phoenix','']);cp('taniwha','dragons',['dragon','']);cp('cóndores','condors',['condor','']);cp('steinböcke','rams',['ram','']);cp('gladiatori','gladiators',['knight','']);
  for(const k in OOS_LOGO)if(!_LK[k])_LK[k]=[OOS_LOGO[k],''];
}
function intlTarget(t){const r=_intlRng(t.id*977+(G.yr||1)*131);let f=(r()-.5)*10;if(r()<.12)f+=7+r()*4;return Math.round(t.base+f);}
function intlStyle(p,t){
  const r=_intlRng(p.id*7919+13),N=INTL_NAMES[t.ctry]||[FN,LN],sk=INTL_SKIN[t.ctry]||[0,7];
  p.fn=N[0][Math.floor(r()*N[0].length)];p.ln=N[1][Math.floor(r()*N[1].length)];
  if(typeof faceSkinHex==='function'&&typeof FACE_SKIN!=='undefined'){let seed=p.fs||p.id;for(let k=0;k<60;k++){const i=FACE_SKIN.indexOf(faceSkinHex(seed));if(i>=sk[0]&&i<=sk[1])break;seed=seed*31+7;}p.fs=seed;}
  p._intl=t.ctry;
}
function intlFit(s,t){
  // keep the team near this season's target strength
  const ps=sPlayers(s.id).sort((a,b)=>b.rat-a.rat),top=ps.slice(0,22);if(!top.length)return;
  const avg=top.reduce((a,p)=>a+p.rat,0)/top.length,d=Math.round(s.intlTarget-avg);
  if(Math.abs(d)>=1)for(const p of ps){p.rat=clamp(p.rat+d,25,95);p.pot=Math.max(p.pot,p.rat);if(p.potHi)p.potHi=Math.max(p.potHi,p.rat);}
}
function _mkIntlSchool(t,cls){return{id:t.id,name:t.name,city:t.city,mascot:t.mascot,cls,dIdx:0,abbr:t.abbr,c1:t.c1,c2:t.c2,c3:t.c3,prestige:t.prestige,wins:0,losses:0,isP:false,offS:t.offS,defS:t.defS,
  fac:{weight:2,film:2,train:2,med:2},staff:{hc:{name:'Asst. Head Coach',lvl:2},oc:{name:'Off. Coordinator',lvl:2},dc:{name:'Def. Coordinator',lvl:2},rc:{name:'Scout',lvl:2}},trophies:[],tier:t.base>=58?'good':'avg',trainLevel:6,intl:t.ctry,intlTag:t.tag,stad:Math.max(5,Math.min(16,Math.round(t.base/5)))};}
const OOS_DEF=OOS_TEAMS.map((o,i)=>({id:9101+i,name:o[0],city:o[1],ctry:'US',mascot:o[2],abbr:o[0].split(/\s+/).map(w=>w[0]).join('').slice(0,3).toUpperCase(),c1:o[3],c2:o[4],c3:'#ffffff',base:o[5],offS:['Spread','Pro Style','Option','Air Raid','Wing-T'][i%5],defS:['4-3','3-4','Cover 2','46'][i%4],prestige:2+(i%3),tag:'Out-of-state opponent from '+o[1]}));
function rosterMin(s){const c=getStarterCnt(s.id),add={QB:1,RB:1,WR:2,TE:1,OL:2,K:0,DL:2,LB:1,CB:1,S:1},m={};for(const p in c)m[p]=(c[p]||0)+(add[p]||1);m.K=Math.max(1,m.K||1);return m;}
function rosterFix(s){
  const ps=sPlayers(s.id).filter(p=>!p.onJV),need=rosterMin(s),have={};ps.forEach(p=>{have[p.pos]=(have[p.pos]||0)+1;});
  for(const pos in need){let k=0;while((have[pos]||0)<need[pos]&&k++<12){let p=null;for(let t=0;t<14;t++){const q=genPlayer(s.id,[9,10,11,12][Math.floor(Math.random()*4)],s.cls,{[pos]:60});if(q.pos===pos){p=q;break;}}
    if(!p)continue;if(s.intl){const T=(s.cls==='OOS'?OOS_DEF:INTL_TEAMS).find(x=>x.id===s.id);if(T)intlStyle(p,T);}G.players.push(p);have[pos]=(have[pos]||0)+1;}}
}
function intlEnsure(){
  if(typeof G==='undefined'||!G||!G.myId||!G.allLeagues)return;intlLogoMap();
  let lg=G.allLeagues.INTL;
  if(!lg)lg=G.allLeagues.INTL={divisions:[],champId:null,champName:null};
  // two regional divisions
  const regs=['Europe & Africa','Americas & Pacific'];
  if(lg.divisions.length!==2||lg.divisions.some((d,i)=>d.name!==regs[i])){
    const old={};lg.divisions.forEach(d=>d.teams.forEach(t=>{old[t.id]=t;}));
    lg.divisions=regs.map(n=>({name:n,teams:[]}));
    for(const t of INTL_TEAMS){const s=old[t.id]||_mkIntlSchool(t,'INTL');s.dIdx=regs.indexOf(INTL_REGION[t.ctry]);lg.divisions[s.dIdx].teams.push(s);}
  }else{for(const t of INTL_TEAMS){if(!lg.divisions.some(d=>d.teams.some(x=>x.id===t.id))){const s=_mkIntlSchool(t,'INTL');s.dIdx=regs.indexOf(INTL_REGION[t.ctry]);lg.divisions[s.dIdx].teams.push(s);}}}
  try{ensureStates();}catch(e){console.error('states',e);}
  const oo=G.allLeagues.OOS; // v2.00: retired (kept only while a game on your schedule still points at it)
  const all=[...lg.divisions.flatMap(d=>d.teams),...(oo?oo.divisions[0].teams:[])];
  for(const s of all){
    const t=(s.cls==='OOS'?OOS_DEF:INTL_TEAMS).find(x=>x.id===s.id);if(!t)continue;
    let ps=sPlayers(s.id); // the per-school index (scanning all 70,000+ players for each team made every page change slow)
    if(ps.length<38){const need=44-ps.length;for(let i=0;i<need;i++){const p=genPlayer(s.id,[9,10,11,12][i%4],s.cls,null);G.players.push(p);}_spVer++;ps=sPlayers(s.id);}
    for(const p of ps)if(!p._intl)intlStyle(p,t);
    if(s.intlYr!==G.yr){s.intlYr=G.yr;s.intlTarget=intlTarget(t);intlFit(s,t);}
  }
  // every AI team keeps a full roster at every position (same roster rules as yours), once per season
  if(G.rosterFixYr!==G.yr){G.rosterFixYr=G.yr;for(const s of allSchoolsAll())if(s.id!==G.myId&&!s.lite)rosterFix(s);}
}

