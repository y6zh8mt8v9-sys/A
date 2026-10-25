// ═══════════ SEASON SCHEDULE FOR EVERY AI TEAM ═══════════
// Division games first (5 for international teams), then non-division games against other divisions and
// other classifications; nobody plays the same opponent twice; open dates are filled with out-of-state teams.
function lgWeeks(){return(G.sched||[]).filter(g=>g.type==='regular').map(g=>g.wk).sort((a,b)=>a-b);}
function lgMySig(){return G.yr+'|'+(G.sched||[]).filter(g=>g.type==='regular').map(g=>g.wk+':'+g.oppId).join(',')+'|'+allSchoolsAll().length;}
function _lsRng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function _rounds(ids){const arr=ids.slice();if(arr.length%2)arr.push(null);const n=arr.length,out=[];for(let r=0;r<n-1;r++){const rest=arr.slice(1),rot=rest.slice(r).concat(rest.slice(0,r)),full=[arr[0]].concat(rot),pr=[];for(let i=0;i<n/2;i++)pr.push([full[i],full[n-1-i]]);out.push(pr);}return out;}
function lgBuildSchedule(){
  const sig=lgMySig();
  if(G.lsch&&G.lsch.yr===G.yr&&(G.lsch.locked||G.lsch.sig===sig))return G.lsch;
  const W=lgWeeks(),R=_lsRng(G.yr*7919+(G.myId||1)*31),myOpp={};
  (G.sched||[]).filter(g=>g.type==='regular'&&g.oppId!=null).forEach(g=>{myOpp[g.wk]=g.oppId;});
  const games={},busy=new Set(),played=new Set(),cnt={};W.forEach(w=>games[w]=[]);
  // numeric keys (pair = small*2^21+big, team-week = id*64+week): string keys made this the slowest part of a simulated week
  const K=(a,b)=>a<b?a*2097152+b:b*2097152+a,B=(id,w)=>busy.has(id*64+w);
  const add=(w,a,b)=>{games[w].push([a,b]);busy.add(a*64+w);busy.add(b*64+w);played.add(K(a,b));cnt[a]=(cnt[a]||0)+1;cnt[b]=(cnt[b]||0)+1;};
  for(const w of W)if(myOpp[w]!=null){busy.add(myOpp[w]*64+w);played.add(K(myOpp[w],G.myId));}
  const divOf={},clsOf={};
  for(const d of lgDivs())for(const t of d.teams){divOf[t.id]=d;clsOf[t.id]=t.cls;}
  // 1) division games
  for(const d of lgDivs()){
    const ids=d.teams.map(t=>t.id).filter(id=>id!==G.myId);if(!ids.length||clsOf[ids[0]]==='OOS')continue;
    const target=clsOf[ids[0]]==='INTL'?5:Math.min(ids.length-1,Math.max(3,W.length-3));
    const rounds=_rounds(ids.sort((a,b)=>a-b));
    for(const r of rounds.slice(0,target)){
      let best=null,bn=-1;for(const w of W){let n=0;for(const[a,b]of r)if(a!=null&&b!=null&&!B(a,w)&&!B(b,w)&&!played.has(K(a,b)))n++;if(n>bn){bn=n;best=w;}}
      if(best==null)continue;for(const[a,b]of r)if(a!=null&&b!=null&&!B(a,best)&&!B(b,best)&&!played.has(K(a,b)))add(best,a,b);
    }
  }
  // 2) non-division games: other divisions and other classifications
  const pool=lgDivs().flatMap(d=>d.teams.map(t=>t.id)).filter(id=>id!==G.myId&&clsOf[id]!=='OOS');
  const stOfId={},cnOf={},fmOf={};for(const id of pool){stOfId[id]=clsSt(clsOf[id]);cnOf[id]=clsOf[id]==='INTL'?0:clsNum(clsOf[id]);fmOf[id]=clsFmt(clsOf[id]);}
  for(const w of W){
    const free=pool.filter(id=>!B(id,w));for(let i=free.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[free[i],free[j]]=[free[j],free[i]];}
    const left=new Set(free),byStL={};for(const id of free)(byStL[stOfId[id]]=byStL[stOfId[id]]||new Set()).add(id);
    const del=id=>{left.delete(id);const S=byStL[stOfId[id]];if(S)S.delete(id);};
    for(const a of free){if(!left.has(a))continue;del(a);
      let best=null,bs=-1e9,seen=0;const sa=stOfId[a],cands=sa==='INTL'?[byStL.CF||[]]:[byStL[sa]||[],byStL.INTL||[]];
      // the remaining teams are in shuffled order: the best of the first 40 open opponents is as good a match and far cheaper
      for(const cand of cands)for(const b of cand){if(seen>=40)break;if(divOf[b]===divOf[a]||played.has(K(a,b))||fmOf[b]!==fmOf[a])continue;seen++;
        const ca=clsOf[a],cb=clsOf[b],ia=ca==='INTL',ib=cb==='INTL';let sc=R()*1.5;
        if(ia||ib)sc+=ia&&ib?-2:(stOfId[ia?b:a]==='CF'?1.2:-1.5);else{const gap=Math.abs(cnOf[a]-cnOf[b]);sc+=gap===0?0.6:gap===1?1.4:gap===2?0.2:-2;if(stOfId[a]!==stOfId[b])sc-=1.1;}
        sc-=Math.max(0,(cnt[b]||0)-(cnt[a]||0))*0.1;if(sc>bs){bs=sc;best=b;}}
      if(best!=null){del(best);add(w,a,best);}
      else{const c=pool.filter(x=>x!==a&&!B(x,w)&&!played.has(K(a,x))&&stOfId[x]!=='INTL'&&stOfId[x]!==stOfId[a]&&fmOf[x]===fmOf[a]);if(c.length)add(w,a,c[Math.floor(R()*c.length)]);}
    }
  }
  G.lsch={yr:G.yr,sig,games,locked:false};
  return G.lsch;
}
function lgOppAt(id,wk){
  if(G.sched&&G.sched.some(g=>g.type==='regular'&&g.wk===wk&&g.oppId===id))return G.myId;
  const S=lgBuildSchedule(),g=(S.games[wk]||[]).find(p=>p[0]===id||p[1]===id);
  return g?(g[0]===id?g[1]:g[0]):null;
}

const GDX={"FW":58,"CX":29,"ROUTES":{"go":{"p":[[0.6,3,1],[1.4,45,1]],"end":"cont","fade":1},"seam":{"p":[[-0.5,4,1],[-0.9,45,1]],"end":"cont"},"slant":{"p":[[0,2.5,0.8],[-6,8,1]],"end":"cont"},"qout":{"p":[[0,5,0.4],[5,5,1]],"end":"cont"},"out":{"p":[[0,10,0.45],[8,10,1]],"end":"cont"},"hitch":{"p":[[0,6,0.3],[-0.3,5,0]],"end":"settle"},"curl":{"p":[[0,11,0.35],[-1.2,9.5,0]],"end":"settle"},"comeback":{"p":[[0,14,0.35],[2,12,0]],"end":"settle"},"dig":{"p":[[0,12,0.5],[-10,12.5,1]],"end":"cont"},"post":{"p":[[0,11,0.75],[-7,22,1]],"end":"cont"},"corner":{"p":[[0,11,0.75],[7,19,1]],"end":"cont"},"drag":{"p":[[0,2,0.85],[-10,5,1],[-30,6,1]],"end":"cont"},"flat":{"p":[[1,0.5,0.9],[7,2.5,1]],"end":"cont"},"wheel":{"p":[[4,1,0.85],[7,5,0.8],[7,40,1]],"end":"cont"},"check":{"p":[[1.5,3,0.3],[1.5,4,0]],"end":"settle"},"angle":{"p":[[3,1.5,0.4],[-2,5,1]],"end":"cont"},"stick":{"p":[[0,5,0.4],[1.5,5.5,0]],"end":"settle"},"in6":{"p":[[0,6,0.5],[-10,6,1]],"end":"cont"},"cross":{"p":[[0,4,0.85],[-8,12,1],[-30,16,1]],"end":"cont"},"stutter":{"p":[[0,5,0.3,"f"],[0.8,8,1],[1.4,45,1]],"end":"cont","fade":1},"outup":{"p":[[0,6,0.4],[3,6.4,0.45,"f"],[3.6,40,1]],"end":"cont","fade":1},"sluggo":{"p":[[0,2.5,0.7],[-3,5,0.55,"f"],[-2.4,40,1]],"end":"cont"},"whip":{"p":[[0,5,0.4],[-3,5.5,0.4,"f"],[4,5,1]],"end":"cont"},"postcorner":{"p":[[0,10,0.7],[-3,14,0.6,"f"],[6,22,1]],"end":"cont"},"screen":{"p":[[3,-1.2,0.6],[5.5,-1.6,0]],"end":"settle","delay":0.9},"flatarrow":{"p":[[3,1,0.9],[9,3,1]],"end":"cont"},"jet":{"p":[[-5,0.3,1],[-11,2.2,1]],"end":"cont"},"block":null},"FORMS":{"base":{"n":"Shotgun","pos":{"X":[4,0.9],"Z":[54,1.6],"SL":[46,1.6],"TE":[34.8,1.1],"RB":[27.4,5.3]},"sub":{}},"trips":{"n":"Trips Right","pos":{"X":[4,0.9],"Z":[54,0.9],"SL":[48,1.6],"TE":[42.5,1.6],"RB":[27.4,5.3]},"sub":{"TE":"WR"}},"tripsTE":{"n":"Trips TE","pos":{"X":[4,0.9],"Z":[54,0.9],"SL":[48,1.6],"TE":[42.5,1.6],"RB":[27.4,5.3]},"sub":{}},"empty":{"n":"Empty","pos":{"X":[4,0.9],"Z":[54,0.9],"SL":[47,1.6],"TE":[41,1.6],"RB":[11,1.6]},"sub":{"TE":"WR","RB":"WR"}},"emptyTE":{"n":"Empty TE","pos":{"X":[4,0.9],"Z":[54,0.9],"SL":[47,1.6],"TE":[11,1.6],"RB":[41,1.6]},"sub":{"RB":"WR"}},"iform":{"n":"I-Formation","qbD":2.6,"pos":{"X":[4,0.9],"Z":[54,1.6],"SL":[29,4.3],"TE":[34.8,1.1],"RB":[29,6.9]},"sub":{"SL":"FB"}},"split":{"n":"Split Backs","qbD":2.6,"pos":{"X":[4,0.9],"Z":[54,1.6],"SL":[31.3,5.2],"TE":[34.8,1.1],"RB":[26.7,5.2]},"sub":{"SL":"FB"}},"pistol":{"n":"Pistol Twins","qbD":3.6,"pos":{"X":[4,0.9],"Z":[54,1.6],"SL":[47,1.6],"TE":[34.8,1.1],"RB":[29,6.4]},"sub":{}},"wingt":{"n":"Wing-T","qbD":2.6,"pos":{"X":[4,0.9],"Z":[37.2,2.0],"SL":[29,4.3],"TE":[34.8,1.1],"RB":[26.4,5.0]},"sub":{"SL":"FB"}}},"TRIPS":[{"n":"Flood","r":["dig","go","out","flatarrow","check"],"d":"Three levels to the trips side"},{"n":"Verticals","r":["post","go","seam","go","check"],"d":"Four deep, overload the safety"},{"n":"Snag","r":["curl","corner","stick","flatarrow","flat"],"d":"Triangle read on the trips"},{"n":"Drive","r":["dig","go","drag","stick","check"],"d":"Shallow under the dig"},{"n":"Smash","r":["hitch","corner","hitch","stick","check"],"d":"Corner over the hitch, trips side"},{"n":"Stick","r":["go","qout","stick","flatarrow","check"],"d":"Quick stick-flat to the trips"}],"EMPTY":[{"n":"Spacing","r":["hitch","hitch","stick","curl","qout"],"d":"Five quick, spread thin"},{"n":"Verticals","r":["go","go","seam","seam","seam"],"d":"Five vertical, someone is open"},{"n":"Mesh","r":["go","corner","drag","drag","stick"],"d":"Crossers with no back in"},{"n":"Quick Slants","r":["slant","slant","qout","stick","slant"],"d":"Hot throws, beat the blitz"},{"n":"Smash","r":["hitch","corner","hitch","corner","stick"],"d":"Two smash pairs, no back"},{"n":"Levels","r":["dig","hitch","in6","drag","stick"],"d":"In-breakers at three depths"}],"PASSES":[{"n":"Four Verts","r":["go","go","seam","block","check"],"d":"Stretch the safeties deep"},{"n":"Smash","r":["hitch","hitch","corner","stick","check"],"d":"High-low the corner"},{"n":"Mesh","r":["drag","corner","seam","drag","flat"],"d":"Crossers underneath"},{"n":"Slant-Flat","r":["slant","slant","qout","stick","flat"],"d":"Quick game"},{"n":"Curl-Flat","r":["curl","curl","qout","seam","check"],"d":"Beat zone underneath"},{"n":"Dagger","r":["dig","go","seam","drag","check"],"d":"Seam clears the dig"},{"n":"Flood","r":["dig","go","out","flat","check"],"d":"Three levels to one side"},{"n":"Post-Wheel","r":["post","comeback","seam","block","wheel"],"d":"Shot play"},{"n":"Drive","r":["dig","go","drag","stick","angle"],"d":"Shallow and dig"},{"n":"Sail","r":["curl","go","corner","flat","check"],"d":"Corner over the flat"},{"n":"Stick","r":["go","qout","stick","flatarrow","check"],"d":"Quick stick and flat"},{"n":"Levels","r":["dig","hitch","in6","drag","check"],"d":"Two in-breakers stacked"},{"n":"Y-Cross","r":["post","comeback","go","cross","flat"],"d":"Deep crosser behind the backers"},{"n":"Spacing","r":["hitch","hitch","curl","stick","flat"],"d":"Five short, spread wide"},{"n":"Stutter-Go","r":["stutter","stutter","seam","block","check"],"d":"Double move, sell the hitch"},{"n":"Sluggo-Seam","r":["sluggo","out","seam","drag","check"],"d":"Slant fake, then go"},{"n":"Out-and-Up","r":["go","outup","whip","stick","check"],"d":"Fake the out, go deep"},{"n":"Post-Corner","r":["postcorner","curl","seam","drag","check"],"d":"Bend it back outside"},{"n":"RB Screen","r":["go","go","drag","block","screen"],"d":"Let them rush, dump it off","screen":1},{"n":"PA Boot","r":["post","dig","corner","cross","flat"],"d":"Fake the run, roll right","pa":1},{"n":"Jet Touch Pass","r":["jet","go","seam","block","block"],"mo":{"s":"X","k":"jet"},"touch":1,"d":"Jet motion, flip it forward on the run"},{"n":"Jet Flood","r":["jet","go","out","stick","check"],"mo":{"s":"X","k":"jet"},"d":"Jet the X into the flat, flood the right"},{"n":"Motion Smash","r":["hitch","hitch","corner","drag","check"],"mo":{"s":"SL","k":"across"},"d":"Slot motions across, high-low the corner"},{"n":"Motion Slants","r":["slant","slant","qout","stick","check"],"mo":{"s":"Z","k":"short"},"d":"Z motions in tight, quick slants"},{"n":"Shallow Cross","r":["drag","dig","go","cross","check"],"d":"Shallow under the dig, crosser behind"},{"n":"Hi-Lo Cross","r":["cross","dig","drag","seam","flat"],"d":"Two crossers stacked on the backers"},{"n":"Bench","r":["out","out","seam","stick","check"],"d":"Deep outs to the sideline"},{"n":"Comeback Seam","r":["comeback","comeback","seam","drag","check"],"d":"Comebacks outside, seam inside"},{"n":"Double Post","r":["post","post","drag","stick","check"],"d":"Two posts split the safety"},{"n":"Whip Go","r":["go","whip","go","stick","check"],"d":"Fake inside, whip back out"},{"n":"Corner Flat","r":["corner","corner","flat","seam","check"],"d":"Corners over the flats"},{"n":"Hitch Seam","r":["hitch","hitch","seam","seam","check"],"d":"Quick hitches, seams up the middle"},{"n":"Angle Screen","r":["go","go","drag","block","angle"],"d":"Back angles inside behind the rush"},{"n":"PA Deep Shot","r":["post","go","dig","cross","flat"],"pa":1,"d":"Fake the run, take the top off"},{"n":"Play Action Flat","f":"iform","r":["post","go","flat","dig","check"],"pa":1,"d":"Two backs, play fake, fullback to the flat"},{"n":"Triple Slants","f":"pistol","r":["slant","slant","slant","stick","check"],"d":"Three slants from the pistol"},{"n":"Play Action Flood","f":"split","r":["dig","go","out","flat","check"],"pa":1,"d":"Play fake, flood the right side"},{"n":"Waggle","f":"wingt","r":["post","corner","flat","cross","flat"],"d":"Fake the buck sweep, QB rolls out to a flood","pa":1}],"RUNS":[{"n":"Inside Zone","path":[[1,0.3],[1.5,6]],"d":"Downhill between the tackles"},{"n":"Outside Zone","path":[[10,-1.2],[12.5,1],[13,6]],"d":"Stretch to the edge"},{"n":"Power","path":[[-2.8,0.4],[-3,6]],"d":"Hit the B gap"},{"n":"Counter","path":[[1.4,-5.4],[-3,0.4],[-3.5,6]],"d":"Fake right, cut back left"},{"n":"Draw","path":[[0,0.4],[0,6]],"delay":1,"d":"Sell pass, then hand off"},{"n":"QB Sneak","path":[[0.4,0.8],[0.4,5]],"qb":1,"d":"Short yardage push"},{"n":"QB Draw","path":[[0,-1.8],[0.4,0.4],[0.6,6]],"qb":1,"d":"Show pass, then the QB runs it up the middle"},{"n":"QB Power","path":[[-1.2,-0.6],[-2.8,0.4],[-3,6]],"qb":1,"d":"Guard pulls, QB follows him through the B gap"},{"n":"QB Counter","path":[[1.4,-0.8],[-2.6,0.2],[-3.2,6]],"qb":1,"d":"Step one way, cut back behind the pullers"},{"n":"QB Sweep","path":[[7,-1.6],[11,0.4],[11.5,6]],"qb":1,"d":"QB takes it to the edge"},{"n":"HB Dive","path":[[0.6,0.4],[0.8,6]],"d":"Quick hitter up the middle"},{"n":"Toss","path":[[9,-3.2],[12,-0.6],[12.8,6]],"toss":1,"d":"Pitch it wide and race the edge"},{"n":"Trap","path":[[-0.8,0.3],[-0.8,6]],"d":"Let the tackle in, kick him out"},{"n":"Read Option","path":[[1,0.3],[1.5,6]],"option":1,"keep":[[7.5,-0.5],[9.5,5]],"d":"QB reads the end: give or keep"},{"n":"Duo","path":[[0.4,0.3],[-0.9,6]],"d":"Double teams, read the backer"},{"n":"Sweep","path":[[9.5,-3.4],[13,-0.8],[13.6,6]],"toss":1,"d":"Race everyone to the sideline"},{"n":"Delay","path":[[-0.6,0.4],[-0.6,6]],"delay":0.7,"d":"Pass set, then a late hand-off"},{"n":"Iso","f":"iform","lead":1,"path":[[0.4,0.3],[0.6,6]],"d":"Fullback isolates the backer"},{"n":"Lead Power","f":"iform","lead":1,"path":[[-2.6,0.4],[-2.9,6]],"d":"Fullback kicks out, back hits B gap"},{"n":"Off Tackle","f":"iform","lead":1,"path":[[3.9,0.2],[4.4,6]],"d":"Lead through the C gap"},{"n":"I Toss","f":"iform","lead":1,"toss":1,"path":[[9,-3.4],[12,-0.6],[12.8,6]],"d":"Pitch wide behind the fullback"},{"n":"FB Dive","f":"iform","fbc":1,"path":[[0.3,0.3],[0.4,5]],"d":"Fullback hits it straight ahead"},{"n":"Split Zone","f":"split","lead":1,"path":[[1.2,0.3],[1.6,6]],"d":"Back on the zone, fullback kicks the end"},{"n":"Split Counter","f":"split","lead":1,"path":[[1.4,-1.4],[-2.6,0.4],[-3.1,6]],"d":"Step away, cut back behind the fullback"},{"n":"Pistol Power","f":"pistol","path":[[-2.6,0.4],[-2.9,6]],"d":"Downhill power from the pistol"},{"n":"Jet Sweep","mo":{"s":"X","k":"jet"},"jet":1,"path":[[12,-2.2],[15,0.4],[15.5,7]],"d":"Hand it to the jet man at full speed"},{"n":"Jet Fake Zone","mo":{"s":"X","k":"jet"},"path":[[-1,0.3],[-1.5,6]],"d":"Fake the jet, hand it to the back"},{"n":"Motion Power","mo":{"s":"Z","k":"short"},"path":[[-2.8,0.4],[-3,6]],"d":"Z motions in to crack the edge"},{"n":"Stretch","path":[[9,-1.6],[11.5,0.6],[12,6]],"d":"Wide zone, one cut and go"},{"n":"Wham","path":[[0.9,0.3],[1.2,6]],"d":"Tight end blocks the tackle, back hits it"},{"n":"Pin-Pull Sweep","toss":1,"path":[[10,-3],[13,-0.6],[13.6,6]],"d":"Linemen pull and lead the sweep"},{"n":"Power Read","option":1,"path":[[7.5,-0.5],[10,0.6],[10.5,5]],"keep":[[-2.8,0.4],[-3,6]],"d":"Back sweeps, QB keeps it inside on power"},{"n":"Speed Option","option":1,"path":[[9,-2.6],[12,-0.4],[12.6,6]],"keep":[[6,-0.5],[7.5,5]],"d":"QB attacks the edge, pitch or keep"},{"n":"Downhill Zone","f":"pistol","path":[[1,0.3],[1.5,6]],"d":"Downhill zone from the pistol"},{"n":"Quick Dive","f":"split","lead":1,"path":[[0.5,0.3],[0.7,6]],"d":"Quick dive, fullback leads"},{"n":"Jet Counter","mo":{"s":"X","k":"jet"},"path":[[1.4,-5.4],[-3,0.4],[-3.5,6]],"d":"Jet motion one way, counter the other"},{"n":"QB Keep Boot","qb":1,"path":[[-4,-1.2],[-9,0.2],[-10,6]],"d":"Fake the zone, QB bootlegs away"},{"n":"Buck Sweep","f":"wingt","path":[[3,-4.2],[9.5,-1.4],[12.8,0.6],[13.2,6]],"d":"The Wing-T staple: guards pull, halfback bends around the edge"},{"n":"Wing-T Trap","f":"wingt","fbc":1,"path":[[-0.6,0.3],[-0.7,6]],"d":"Fullback trap straight up the middle"},{"n":"Belly","f":"wingt","fbc":1,"path":[[2.6,0.2],[3.2,6]],"d":"Fullback off tackle behind the wingback"},{"n":"Rocket Toss","f":"wingt","toss":1,"path":[[-9,-3],[-12,-0.6],[-12.8,6]],"d":"Halfback takes the pitch to the weak side"}],"DCALLS":[{"id":"C0","n":"Cover 0 Blitz","d":"All-out pressure, man everywhere"},{"id":"DAG","n":"Double A-Gap","d":"Both backers through the middle"},{"id":"C1","n":"Cover 1 Man","d":"Man with a deep safety"},{"id":"C1R","n":"Cover 1 Robber","d":"Man, safety robs crossers"},{"id":"NBZ","n":"Nickel Blitz","d":"Slot corner comes, man behind"},{"id":"C2","n":"Cover 2","d":"Two deep halves, squat corners"},{"id":"C2M","n":"2-Man Under","d":"Man underneath, two deep"},{"id":"T2","n":"Tampa 2","d":"Mike carries the deep middle"},{"id":"C3","n":"Cover 3","d":"Three deep, four under"},{"id":"CBZ","n":"Corner Blitz","d":"Corner comes, safety rotates"},{"id":"FZ","n":"Fire Zone","d":"Linebacker blitz, three deep"},{"id":"C4","n":"Cover 4","d":"Quarters, protect deep"},{"id":"C6","n":"Cover 6","d":"Quarters left, Cover 2 right"},{"id":"C3B","n":"Cover 3 Buzz","d":"Three deep, safety buzzes to the hook"},{"id":"C1S","n":"Cover 1 Spy","d":"Man, a linebacker spies the QB"},{"id":"C2I","n":"Cover 2 Invert","d":"Corners bail deep, safeties take the flats"},{"id":"SIM","n":"Sim Pressure","d":"Mike blitzes, an end drops: four rush, three deep"}]};
// ═══════════ PLAYBOOKS + PLAY DESIGNER (pass + run, drag to align) ═══════════
const RT_LABEL={jet:'Jet (motion man)',go:'Go',seam:'Seam',slant:'Slant',qout:'Quick out',out:'Out',hitch:'Hitch',curl:'Curl',comeback:'Comeback',dig:'Dig',post:'Post',corner:'Corner',drag:'Drag',flat:'Flat',wheel:'Wheel',check:'Check-down',angle:'Angle',stick:'Stick',in6:'In',cross:'Cross',stutter:'Stutter-go',outup:'Out-and-up',sluggo:'Sluggo',whip:'Whip',postcorner:'Post-corner',screen:'Screen',flatarrow:'Arrow',block:'Block'};
const PB_FORMS=[['base','Shotgun'],['trips','Trips Right'],['tripsTE','Trips TE'],['empty','Empty'],['emptyTE','Empty TE'],['iform','I-Formation (2 backs)'],['split','Split Backs (2 backs)'],['pistol','Pistol']];
const PB_SLOTS=['X','Z','SL','TE','RB'],PB_COL=['#ffd23f','#4fd1ff','#ff7ad9','#b6ff6a','#ff9f43'];
const OFF_PB={
 'Air Raid':{passP:.66,plays:['Four Verts','Mesh','Y-Cross','Stick','Spacing','Dagger','Smash','Levels','Drive','Sail','T:Snag','T:Verticals','T:Flood','E:Spacing','E:Verticals','E:Quick Slants','RB Screen','Jet Flood','Motion Smash','Shallow Cross','Hi-Lo Cross','Double Post','Hitch Seam','Angle Screen','T:Smash','T:Stick','E:Smash','E:Levels'],runs:['Inside Zone','Draw','HB Dive','Delay','Jet Fake Zone','QB Draw','Stretch','Wham']},
 'Spread':{passP:.56,plays:['Slant-Flat','Smash','Mesh','Stick','Spacing','Curl-Flat','Flood','Post-Wheel','Stutter-Go','Sluggo-Seam','T:Snag','T:Drive','E:Mesh','RB Screen','Jet Touch Pass','Jet Flood','Motion Slants','Shallow Cross','Whip Go','Corner Flat','Angle Screen','Triple Slants','T:Smash','T:Stick','E:Levels'],runs:['Inside Zone','Outside Zone','Read Option','Draw','Counter','Duo','Sweep','Jet Sweep','Jet Fake Zone','QB Draw','QB Power','Power Read','Downhill Zone','Jet Counter','Stretch']},
 'Pro Style':{passP:.5,plays:['Curl-Flat','Dagger','Flood','Post-Wheel','Drive','Sail','Smash','Levels','Y-Cross','Post-Corner','Out-and-Up','PA Boot','TE:Snag','Motion Smash','Motion Slants','Bench','Comeback Seam','Double Post','PA Deep Shot','Play Action Flat','Hi-Lo Cross'],runs:['Inside Zone','Outside Zone','Power','Counter','Toss','Draw','HB Dive','Iso','Lead Power','Pistol Power','Motion Power','QB Draw','Stretch','Wham','Pin-Pull Sweep','Downhill Zone']},
 'Option':{passP:.3,plays:['Slant-Flat','Four Verts','PA Boot','Stick','Curl-Flat','Sluggo-Seam','PA Deep Shot','Triple Slants','Play Action Flood','Hitch Seam'],runs:['Read Option','Inside Zone','Outside Zone','Counter','Toss','QB Sneak','Trap','Split Zone','Split Counter','Pistol Power','Jet Sweep','QB Power','QB Counter','QB Sweep','QB Draw','Speed Option','Power Read','Downhill Zone','Quick Dive','QB Keep Boot']},
 'Wing-T':{passP:.32,plays:['Waggle','PA Boot','Sail','Flood','Curl-Flat','Out-and-Up','Post-Wheel','Jet Touch Pass','Play Action Flood','PA Deep Shot','Corner Flat'],runs:['Buck Sweep','Wing-T Trap','Belly','Rocket Toss','Counter','Trap','Toss','Power','HB Dive','Outside Zone','Split Counter','Split Zone','Off Tackle','Sweep','Jet Sweep','Jet Fake Zone','Motion Power','QB Sweep','Jet Counter','Pin-Pull Sweep','Quick Dive','QB Keep Boot']},
 'I-Formation':{passP:.42,plays:['Curl-Flat','Post-Wheel','Dagger','Smash','PA Boot','Levels','Sail','Play Action Flat','Bench','Comeback Seam','PA Deep Shot','Angle Screen'],runs:['Iso','Lead Power','Off Tackle','I Toss','FB Dive','Power','HB Dive','Draw','QB Sneak','Wham','Stretch','Pin-Pull Sweep','Counter']}};
const DEF_PB={
 '4-3':{w:{}},
 '3-4':{w:{FZ:1.8,CBZ:1.5,NBZ:1.3,C3:1.2,C2:0.8,T2:0.6,DAG:1.2,SIM:1.8,C3B:1.3}},
 '46':{w:{C0:2,DAG:2,C1:1.6,C1R:1.3,NBZ:1.3,C2:0.4,T2:0.3,C4:0.3,C6:0.3,C3:0.8,FZ:1.2,C2M:0.6,C1S:1.6,SIM:1.3,C2I:0.3}},
 'Cover 2':{w:{C2:2.2,T2:2,C2M:1.6,C4:1.2,C6:1.4,C3:0.8,C1:0.6,C0:0.3,DAG:0.3,NBZ:0.4,FZ:0.6,CBZ:0.5,C1R:0.5,C2I:1.8,C3B:0.6,C1S:0.4,SIM:0.5}},
 'Flex':{w:{C3:1.5,C4:1.4,C6:1.3,C1:1.1,FZ:1.1,C3B:1.4,C1S:1.2,C2I:1.1,SIM:1.2}}};
function pbEmpty(){return{plays:[],off:{},def:{},offSel:null,defSel:null};}
function pbData(){
  if(window._fpMode&&window.FP)return FP.store.pb||(FP.store.pb=pbEmpty());
  if(!G)return window._pbTmp||(window._pbTmp=pbEmpty());
  if(!G.pbData)G.pbData=pbEmpty();return G.pbData;
}
// v2.16 the built-in playbooks can be edited (add catalog or custom plays); the edit lives in this career / Free Practice
function pbOffBook(name){const D=pbData();return(D.ext&&D.ext[name])||OFF_PB[name]||D.off[name];}
function pbDefBook(name){const D=pbData();return(D.extDef&&D.extDef[name])||DEF_PB[name]||D.def[name];}
function pbResetBook(name,def){const D=pbData();if(def){if(D.extDef)delete D.extDef[name];}else if(D.ext)delete D.ext[name];window._pbB=null;if(window._fpMode)fpSave();notify(`"${name}" is back to the original.`);pbRerender();}
function pbRerender(){if(window._fpMode&&typeof fpRender==='function')fpRender();else nav('cust');}
function pbOffList(){return Object.keys(OFF_PB).concat(Object.keys(pbData().off));}
function pbDefList(){return Object.keys(DEF_PB).concat(Object.keys(pbData().def));}
function pbCustom(id){return pbData().plays.find(p=>p.id===id);}
function pbResolvePlay(ref){
  if(ref.startsWith('C:')){const c=pbCustom(ref.slice(2));if(!c||(c.kind||'pass')!=='pass')return null;const o={n:c.n,f:c.f==='base'?undefined:c.f,r:c.r.slice(),pos:c.pos?JSON.parse(JSON.stringify(c.pos)):undefined,d:c.d||'Custom play',custom:1};if(c.mo&&c.mo.s)o.mo={s:c.mo.s,k:c.mo.k};if(c.touch&&o.mo&&o.mo.k==='jet')o.touch=1;return o;}
  const m=ref.match(/^(T|TE|E|EE):(.+)$/);
  if(m){const list=m[1][0]==='T'?GDX.TRIPS:GDX.EMPTY,f={T:'trips',TE:'tripsTE',E:'empty',EE:'emptyTE'}[m[1]],p=list.find(x=>x.n===m[2]);return p?{n:p.n,f,r:p.r.slice(),d:p.d}:null;}
  const p=GDX.PASSES.find(x=>x.n===ref);return p?JSON.parse(JSON.stringify(p)):null;
}
function pbResolveRun(ref){
  if(ref.startsWith('C:')){const c=pbCustom(ref.slice(2));if(!c||c.kind!=='run')return null;
    const o={n:c.n,f:c.f==='base'?undefined:c.f,path:c.path.map(p=>p.slice()),pos:c.pos?JSON.parse(JSON.stringify(c.pos)):undefined,d:c.d||'Custom run',custom:1};
    if(c.carrier==='QB')o.qb=1;if(c.carrier==='OPT'&&c.keep&&c.keep.length>1){o.option=1;o.keep=c.keep.map(p=>p.slice());}if(c.carrier==='FB')o.fbc=1;if(c.toss)o.toss=1;if(c.lead)o.lead=1;if(c.delay)o.delay=0.7;if(c.mo&&c.mo.s){o.mo={s:c.mo.s,k:c.mo.k};if(c.carrier==='JET'&&c.mo.k==='jet'){o.jet=1;delete o.qb;delete o.fbc;}}return o;}
  const r=GDX.RUNS.find(x=>x.n===ref);return r?JSON.parse(JSON.stringify(r)):null;
}
function pbForTeam(s,side){
  const D=pbData(),mine=G&&s.id===G.myId;
  if(side==='off'){const name=(mine&&D.offSel)||s.offS||'Pro Style',B=pbOffBook(name)||OFF_PB['Pro Style'];
    const plays=B.plays.map(pbResolvePlay).filter(Boolean),runPlays=(B.runs||[]).map(pbResolveRun).filter(Boolean);
    return{name,passP:B.passP,plays:plays.length?plays:GDX.PASSES.slice(0,6),runs:runPlays.length?runPlays.map(r=>r.n):['Inside Zone'],runPlays:runPlays.length?runPlays:[pbResolveRun('Inside Zone')]};}
  const name=(mine&&D.defSel)||s.defS||'4-3',B=pbDefBook(name)||DEF_PB['4-3'];
  const w={};for(const c of GDX.DCALLS)w[c.id]=B.ids?(B.ids.includes(c.id)?1:0):(B.w[c.id]!=null?B.w[c.id]:1);
  if(!Object.values(w).some(v=>v>0))for(const c of GDX.DCALLS)w[c.id]=1;
  return{name,w};
}
// ── drawing (shared by previews, lists and the drag editor) ──
const PBX=x=>6+x/GDX.FW*108,PBY=d=>46-d*1.55;
function pbMoEnd(x,d,k){const FW=GDX.FW,CX=GDX.CX,dir=x<CX?1:-1;if(k==='jet')return[CX-dir*4.5,3.1,dir];if(k==='across')return[CX+dir*5,d,dir];return[Math.max(x<CX?1.5:CX+5.5,Math.min(x<CX?CX-5.5:FW-1.5,x+dir*5)),d,dir];}
function pbPos(f,pos){const F=GDX.FORMS[f||'base']||GDX.FORMS.base,o={};for(const k of PB_SLOTS)o[k]=((pos&&pos[k])||F.pos[k]).slice();return o;}
function pbSVG(P,opt){
  opt=opt||{};const PBY=d=>46-d*(opt.edit?3.4:1.55),PBX=x=>6+x/GDX.FW*108;const FW=GDX.FW,CX=GDX.CX,F=GDX.FORMS[P.f||'base']||GDX.FORMS.base,pos=pbPos(P.f,P.pos),qbD=F.qbD||5,ed=!!opt.edit,run=P.kind==='run';
  const isFB=k=>k==='SL'&&F.sub.SL==='FB';
  let moS=null,moStart=null,moDir=1;const mo=P.mo&&P.mo.s&&pos[P.mo.s]?P.mo:null;
  if(mo){moS=mo.s;moStart=pos[moS].slice();const e=pbMoEnd(moStart[0],moStart[1],mo.k);moDir=e[2];pos[moS]=[e[0],e[1]];
}
  let s=`<svg viewBox="0 ${ed?-16:0} 120 ${ed?94:64}" width="${opt.w||240}" ${ed?'id="pb-edit" style="touch-action:none;background:linear-gradient(180deg,#3d9a4d,#2c7c3c);border-radius:12px;max-width:100%;height:auto"':'style="background:linear-gradient(180deg,#3d9a4d,#2c7c3c);border-radius:10px"'}>`;
  for(let y=5;y<=40;y+=5)s+=`<line x1="2" y1="${PBY(y)}" x2="118" y2="${PBY(y)}" stroke="#fff" stroke-opacity=".12" stroke-width=".5"/>`;
  s+=`<line x1="2" y1="46" x2="118" y2="46" stroke="#fff" stroke-opacity=".7" stroke-width=".8"/>`;
  [-3.8,-1.9,0,1.9,3.8].forEach(x=>s+=`<rect x="${(PBX(CX+x)-1.8).toFixed(1)}" y="${(PBY(-0.8)-1.8).toFixed(1)}" width="3.6" height="3.6" rx=".8" fill="#dfe9f2"/>`);
  if(run){
    const car=P.carrier||(P.jet?'JET':'RB'),st=car==='QB'?[CX,qbD]:(car==='JET'&&moS)?pos[moS]:car==='FB'&&isFB('SL')?pos.SL:pos.RB,pts=[[st[0],-st[1]],...P.path.map(([dx,dy])=>[CX+dx,dy])];
    if(P.lead&&isFB('SL')&&car!=='FB'){const p0=P.path[P.toss?1:0]||[0,0];s+=`<polyline points="${PBX(pos.SL[0]).toFixed(1)},${PBY(-pos.SL[1]).toFixed(1)} ${PBX(CX+p0[0]).toFixed(1)},${PBY(1.5).toFixed(1)}" fill="none" stroke="#fff" stroke-width="1.3" stroke-dasharray="2 1.4"/>`;}
    s+=`<polyline points="${pts.map(([x,d])=>PBX(x).toFixed(1)+','+PBY(d).toFixed(1)).join(' ')}" fill="none" stroke="#ffd23f" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`;
    const e=pts[pts.length-1],q=pts[pts.length-2];const ang=Math.atan2(PBY(e[1])-PBY(q[1]),PBX(e[0])-PBX(q[0]));
    s+=`<path d="M0,0 L-3.2,-1.8 L-3.2,1.8Z" fill="#ffd23f" transform="translate(${PBX(e[0]).toFixed(1)},${PBY(e[1]).toFixed(1)}) rotate(${(ang*180/Math.PI).toFixed(0)})"/>`;
    if(car==='OPT'&&P.keep){const kp=[[CX,-qbD],...P.keep.map(([dx,dy])=>[CX+dx,dy])];s+=`<polyline points="${kp.map(([x,d])=>PBX(x).toFixed(1)+','+PBY(d).toFixed(1)).join(' ')}" fill="none" stroke="#4fd1ff" stroke-width="1.8" stroke-dasharray="2.4 1.4" stroke-linejoin="round"/>`;
      if(ed)P.keep.forEach(([dx,dy],i)=>s+=`<circle data-q="${i}" cx="${PBX(CX+dx).toFixed(1)}" cy="${PBY(dy).toFixed(1)}" r="3.4" fill="#4fd1ff" fill-opacity=".35" stroke="#4fd1ff" stroke-width="1" style="cursor:grab"/>`);}
    if(ed)P.path.forEach(([dx,dy],i)=>s+=`<circle data-w="${i}" cx="${PBX(CX+dx).toFixed(1)}" cy="${PBY(dy).toFixed(1)}" r="3.4" fill="#ffd23f" fill-opacity=".35" stroke="#ffd23f" stroke-width="1" style="cursor:grab"/>`);
  }else{
    PB_SLOTS.forEach((k,i)=>{const R=GDX.ROUTES[P.r[i]],[x0,d0]=[pos[k][0],-pos[k][1]],out=k===moS&&mo.k==='jet'?(moStart[0]<CX?-1:1):x0<CX?-1:1;
      if(R){const pts=[[x0,d0],...R.p.map(([dx,dy])=>[Math.max(1.5,Math.min(FW-1.5,x0+dx*out)),d0+Math.min(dy,ed?20:26)])];s+=`<polyline points="${pts.map(([x,d])=>PBX(x).toFixed(1)+','+PBY(d).toFixed(1)).join(' ')}" fill="none" stroke="${PB_COL[i]}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>`;}
      else s+=`<line x1="${PBX(x0)}" y1="${PBY(d0)}" x2="${PBX(x0)}" y2="${PBY(d0)-3}" stroke="#fff" stroke-width="1.6"/>`;});
  }
  if(moS)s+=`<polyline points="${PBX(moStart[0]).toFixed(1)},${PBY(-moStart[1]).toFixed(1)} ${PBX(pos[moS][0]).toFixed(1)},${PBY(-pos[moS][1]).toFixed(1)}" fill="none" stroke="#fff" stroke-width="1.1" stroke-dasharray="1.4 1.2"/><circle cx="${PBX(moStart[0]).toFixed(1)}" cy="${PBY(-moStart[1]).toFixed(1)}" r="1.6" fill="#fff" fill-opacity=".45"/>`;
  PB_SLOTS.forEach((k,i)=>{const[x,d]=pos[k],lab=k==='SL'&&isFB(k)?'FB':k;
    s+=`<g ${ed?`data-k="${k}" style="cursor:grab"`:''}><circle cx="${PBX(x).toFixed(1)}" cy="${PBY(-d).toFixed(1)}" r="${ed?2.5:2.2}" fill="${run?(isFB(k)?'#ffe6a8':'#fff'):PB_COL[i]}" stroke="#0d2a43" stroke-width=".7"/>${ed?`<text x="${PBX(x).toFixed(1)}" y="${(PBY(-d)+1.2).toFixed(1)}" font-size="2.6" font-weight="900" text-anchor="middle" fill="#0d2a43" font-family="Archivo,sans-serif" pointer-events="none">${lab}</text>`:''}</g>`;});
  s+=`<circle cx="${PBX(CX).toFixed(1)}" cy="${PBY(-qbD).toFixed(1)}" r="${ed?2.5:2.2}" fill="#fff" stroke="#0d2a43" stroke-width=".7"/>${ed?`<text x="${PBX(CX).toFixed(1)}" y="${(PBY(-qbD)+1.2).toFixed(1)}" font-size="2.6" font-weight="900" text-anchor="middle" fill="#0d2a43" font-family="Archivo,sans-serif">QB</text>`:''}</svg>`;
  return s;
}
function pbThumb(p,w){return pbSVG(p.kind==='run'?{kind:'run',f:p.f,pos:p.pos,path:p.path,carrier:p.carrier,keep:p.keep,lead:p.lead,toss:p.toss,mo:p.mo}:{kind:'pass',f:p.f,r:p.r,pos:p.pos,mo:p.mo},{w});}
// ── designer state ──
window._pbD=null;window._pbB=null;
function pbDraftInit(){if(!window._pbD)window._pbD={kind:'pass',n:'',f:'base',r:['go','go','seam','block','check'],pos:null,d:'',path:[[1,0.3],[1.5,6]],keep:[[7.5,-0.5],[9.5,5]],carrier:'RB',toss:false,lead:false,delay:false};return window._pbD;}
function pbSetR(i,v){pbDraftInit().r[i]=v;pbRefresh();}
function pbSetKind(k){const D=pbDraftInit();D.kind=k;pbRerender();}
function pbSetForm(f){const D=pbDraftInit();D.f=f;D.pos=null;const two=(GDX.FORMS[f]||{}).sub&&GDX.FORMS[f].sub.SL==='FB';if(!two){if(D.carrier==='FB')D.carrier='RB';D.lead=false;}pbRerender();}
function pbFromRun(n){const r=GDX.RUNS.find(x=>x.n===n);if(!r)return;const D=pbDraftInit();D.kind='run';D.path=r.path.map(p=>p.slice());D.f=r.f||'base';D.pos=null;D.toss=!!r.toss;D.lead=!!r.lead;D.delay=!!r.delay;D.carrier=r.option?'OPT':r.qb?'QB':r.fbc?'FB':r.jet?'JET':'RB';if(r.keep)D.keep=r.keep.map(p=>p.slice());D.mo=r.mo?{s:r.mo.s,k:r.mo.k}:null;pbRerender();}
function pbSetMo(s,k){const D=pbDraftInit();if(!s){D.mo=null;if(D.carrier==='JET')D.carrier='RB';D.touch=false;}else D.mo={s,k:k||(D.mo&&D.mo.k)||'jet'};if(D.mo&&D.mo.k!=='jet'){if(D.carrier==='JET')D.carrier='RB';D.touch=false;}pbRerender();}
function pbMoCtl(D,two){const mo=D.mo||{};const sl=[['','No motion'],['X','X (wide left)'],['Z','Z (wide right)'],['SL',two?'FB':'Slot'],['TE','TE / slot #3'],['RB','Running back']];
  return`<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px;padding:8px;border-radius:10px;background:var(--s2)">
    <label style="font-size:12px;color:var(--mu)">Pre-snap motion <select onchange="pbSetMo(this.value)">${sl.map(([v,l])=>`<option value="${v}"${(mo.s||'')===v?' selected':''}>${l}</option>`).join('')}</select></label>
    ${mo.s?`<label style="font-size:12px;color:var(--mu)">Type <select onchange="pbSetMo('${mo.s}',this.value)">${[['jet','Jet (full speed across)'],['across','Across the formation'],['short','Short, in tight']].map(([v,l])=>`<option value="${v}"${mo.k===v?' selected':''}>${l}</option>`).join('')}</select></label>`:''}
    ${D.kind==='pass'&&mo.k==='jet'?`<label style="display:inline-flex;align-items:center;gap:6px;font-size:12px"><input type="checkbox" ${D.touch?'checked':''} onchange="pbDraftInit().touch=this.checked">Touch pass to the jet man</label>`:''}</div>`;}
function pbResetPos(){pbDraftInit().pos=null;pbRefresh();}
function pbAddWp(){const D=pbDraftInit();if(D.path.length>=4)return;const l=D.path[D.path.length-1];D.path.push([l[0],Math.min(20,l[1]+4)]);pbRefresh();}
function pbDelWp(){const D=pbDraftInit();if(D.path.length>2)D.path.pop();pbRefresh();}
function pbRefresh(){const D=pbDraftInit(),el=document.getElementById('pb-prev');if(el){el.innerHTML=pbSVG(D,{edit:true,w:420});pbBindDrag();}}
function pbBindDrag(){
  const svg=document.getElementById('pb-edit');if(!svg||svg._bound)return;svg._bound=true;const FW=GDX.FW,CX=GDX.CX;
  const toF=ev=>{const pt=svg.createSVGPoint();pt.x=ev.clientX;pt.y=ev.clientY;const p=pt.matrixTransform(svg.getScreenCTM().inverse());return[(p.x-6)/108*FW,(46-p.y)/3.4];};
  let drag=null;
  svg.addEventListener('pointerdown',ev=>{const g=ev.target.closest('[data-k],[data-w],[data-q]');if(!g)return;ev.preventDefault();drag=g.dataset.k?{k:g.dataset.k}:g.dataset.q!=null?{q:+g.dataset.q}:{w:+g.dataset.w};try{svg.setPointerCapture(ev.pointerId);}catch(e){}});
  svg.addEventListener('pointermove',ev=>{if(!drag)return;ev.preventDefault();const D=pbDraftInit();let[x,y]=toF(ev);
    if(drag.k){if(!D.pos)D.pos=pbPos(D.f,null);let dep=Math.max(0.9,Math.min(9,-y));x=Math.max(1.5,Math.min(FW-1.5,x));
      if(dep<2.4&&Math.abs(x-CX)<5.2)dep=2.4;const qd=(GDX.FORMS[D.f]||GDX.FORMS.base).qbD||5;if(Math.abs(x-CX)<1.1&&Math.abs(dep-qd)<1)x=CX+(x<CX?-1.2:1.2);
      D.pos[drag.k]=[+x.toFixed(1),+dep.toFixed(1)];}
    else if(drag.q!=null){if(!D.keep)D.keep=[[7.5,-0.5],[9.5,5]];D.keep[drag.q]=[+Math.max(-26,Math.min(26,x-CX)).toFixed(1),+Math.max(-4,Math.min(22,y)).toFixed(1)];}
    else D.path[drag.w]=[+Math.max(-26,Math.min(26,x-CX)).toFixed(1),+Math.max(drag.w===0?-6:-4,Math.min(drag.w===0?2.5:22,y)).toFixed(1)];
    const tmp=document.createElement('div');tmp.innerHTML=pbSVG(D,{edit:true,w:420});svg.innerHTML=tmp.firstElementChild.innerHTML;});
  const end=()=>{drag=null;};svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
}
function pbSavePlay(){
  const D=pbDraftInit(),n=(document.getElementById('pb-n').value||'').trim();if(!n){notify('Name your play first.','e');return;}
  const d=(document.getElementById('pb-d').value||'').trim(),P=pbData(),id='p'+Date.now().toString(36);
  const mo=D.mo&&D.mo.s?{s:D.mo.s,k:D.mo.k}:null;
  if(D.kind==='run')P.plays.push({id,kind:'run',n,f:D.f,pos:D.pos?JSON.parse(JSON.stringify(D.pos)):null,path:D.path.map(p=>p.slice()),carrier:D.carrier==='JET'&&!(mo&&mo.k==='jet')?'RB':D.carrier,keep:D.carrier==='OPT'?(D.keep||[[7.5,-0.5],[9.5,5]]).map(p=>p.slice()):null,toss:!!D.toss,lead:!!D.lead,delay:!!D.delay,mo,d});
  else P.plays.push({id,kind:'pass',n,f:D.f,r:D.r.slice(),pos:D.pos?JSON.parse(JSON.stringify(D.pos)):null,mo,touch:!!(D.touch&&mo&&mo.k==='jet'),d});
  window._pbD=null;if(window._fpMode)fpSave();notify(`"${n}" saved. Add it to a playbook below.`);pbRerender();
}
function pbDelPlay(id){const P=pbData();P.plays=P.plays.filter(p=>p.id!==id);for(const k in P.off){P.off[k].plays=P.off[k].plays.filter(x=>x!=='C:'+id);P.off[k].runs=(P.off[k].runs||[]).filter(x=>x!=='C:'+id);}if(window._fpMode)fpSave();pbRerender();}
function pbBuildInit(){if(!window._pbB){const base=pbOffBook((G&&!window._fpMode&&myS().offS)||'Pro Style')||OFF_PB['Pro Style'];window._pbB={n:'',passP:base.passP,plays:base.plays.slice(),runs:base.runs.slice()};}return window._pbB;}
function pbToggle(kind,ref){const B=pbBuildInit(),a=B[kind],i=a.indexOf(ref);if(i>=0)a.splice(i,1);else a.push(ref);}
function pbCopyFrom(name){const B=pbOffBook(name);if(!B)return;window._pbB={n:name,passP:B.passP,plays:B.plays.slice(),runs:B.runs.slice()};pbRerender();}
function pbSaveBook(){
  const B=pbBuildInit(),n=(document.getElementById('pbb-n').value||'').trim();if(!n){notify('Name your playbook first.','e');return;}
  if(!B.plays.length||!B.runs.length){notify('Pick at least one pass and one run play.','e');return;}
  if(OFF_PB[n]){if(!confirm(`Update the built-in "${n}" playbook in this ${window._fpMode?'Free Practice':'career'}? Every team that runs it will use your version. You can reset it later.`))return;
    const D=pbData();D.ext=D.ext||{};D.ext[n]={passP:B.passP,plays:B.plays.slice(),runs:B.runs.slice()};window._pbB=null;if(window._fpMode)fpSave();notify(`"${n}" updated.`);pbRerender();return;}
  pbData().off[n]={passP:B.passP,plays:B.plays.slice(),runs:B.runs.slice()};if(!window._fpMode)pbData().offSel=n;window._pbB=null;if(window._fpMode)fpSave();notify(`Playbook "${n}" saved${window._fpMode?'. Pick it for a team above.':' and selected.'}`);pbRerender();
}
function pbSaveDef(){
  const n=(document.getElementById('pbd-n').value||'').trim();if(!n){notify('Name your defensive playbook first.','e');return;}
  const ids=[...document.querySelectorAll('.pbd-ck:checked')].map(x=>x.value);if(!ids.length){notify('Pick at least one coverage.','e');return;}
  if(DEF_PB[n]){if(!confirm(`Update the built-in "${n}" defense in this ${window._fpMode?'Free Practice':'career'}?`))return;const D=pbData();D.extDef=D.extDef||{};D.extDef[n]={ids};if(window._fpMode)fpSave();notify(`"${n}" updated.`);pbRerender();return;}
  pbData().def[n]={ids};if(!window._fpMode)pbData().defSel=n;if(window._fpMode)fpSave();notify(`Defensive playbook "${n}" saved.`);pbRerender();
}
function pbEditorHtml(){
  setTimeout(pbBindDrag,0);
  const P=pbData(),D=pbDraftInit(),B=pbBuildInit(),fp=!!window._fpMode,ms=!fp&&G?myS():null,offSel=fp?null:(P.offSel||ms.offS),defSel=fp?null:(P.defSel||ms.defS);
  const opt=(list,sel)=>list.map(x=>`<option${x===sel?' selected':''}>${x}</option>`).join('');
  const F=GDX.FORMS[D.f]||GDX.FORMS.base,two=F.sub&&F.sub.SL==='FB';
  const slots=[['X','Wide left'],['Z','Wide right'],['SL',two?'Fullback':'Slot'],['TE','TE / slot #3'],['RB','Running back']];
  const rOpts=i=>Object.keys(RT_LABEL).filter(k=>k!=='block'||i>=2).map(k=>`<option value="${k}"${D.r[i]===k?' selected':''}>${RT_LABEL[k]}</option>`).join('');
  const ck=(kind,ref,label)=>`<label style="display:inline-flex;align-items:center;gap:5px;margin:0 10px 6px 0;font-size:12px"><input type="checkbox" ${B[kind].includes(ref)?'checked':''} onchange="pbToggle('${kind}','${ref.replace(/'/g,"\\'")}')">${label}</label>`;
  const cPass=P.plays.filter(p=>(p.kind||'pass')==='pass'),cRun=P.plays.filter(p=>p.kind==='run');
  const passRefs=GDX.PASSES.map(p=>ck('plays',p.n,p.n)).join('')+'<br>'+GDX.TRIPS.map(p=>ck('plays','T:'+p.n,'Trips: '+p.n)+ck('plays','TE:'+p.n,'Trips TE: '+p.n)).join('')+'<br>'+GDX.EMPTY.map(p=>ck('plays','E:'+p.n,'Empty: '+p.n)+ck('plays','EE:'+p.n,'Empty TE: '+p.n)).join('')+(cPass.length?'<br>'+cPass.map(p=>ck('plays','C:'+p.id,'★ '+p.n)).join(''):'');
  const fn=f=>f&&GDX.FORMS[f]?GDX.FORMS[f].n+': ':'';
  const runRefs=GDX.RUNS.map(r=>ck('runs',r.n,fn(r.f)+r.n)).join('')+(cRun.length?'<br>'+cRun.map(p=>ck('runs','C:'+p.id,'★ '+p.n)).join(''):'');
  const book=!fp&&pbOffBook(offSel);
  const tog=(k,l)=>`<button class="tab ${D.kind===k?'on':''}" onclick="pbSetKind('${k}')">${l}</button>`;
  const passCtl=slots.map(([k,l],i)=>`<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="width:110px;font-size:12px;font-weight:700;color:var(--mu)">${l}</span><select onchange="pbSetR(${i},this.value)" style="flex:1">${rOpts(i)}</select></div>`).join('');
  const runCtl=`<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
      <label style="font-size:12px;color:var(--mu)">Ball carrier <select onchange="pbDraftInit().carrier=this.value;pbRerender()">${['RB'].concat(two?['FB']:[]).concat(['QB','OPT']).concat(D.mo&&D.mo.k==='jet'?['JET']:[]).map(c=>`<option value="${c}"${D.carrier===c?' selected':''}>${c==='JET'?'Jet man (jet sweep)':c==='OPT'?'QB option (read the end: give or keep)':c}</option>`).join('')}</select></label>
      <label style="font-size:12px;color:var(--mu)">Start from <select onchange="pbFromRun(this.value)"><option value="">a run play…</option>${GDX.RUNS.map(r=>`<option value="${r.n}">${fn(r.f)}${r.n}</option>`).join('')}</select></label></div>
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:8px;font-size:12px">
      <label style="display:inline-flex;align-items:center;gap:6px"><input type="checkbox" ${D.toss?'checked':''} onchange="pbDraftInit().toss=this.checked">Pitch (toss)</label>
      <label style="display:inline-flex;align-items:center;gap:6px"><input type="checkbox" ${D.delay?'checked':''} onchange="pbDraftInit().delay=this.checked">Delayed hand-off</label>
      ${two?`<label style="display:inline-flex;align-items:center;gap:6px"><input type="checkbox" ${D.lead?'checked':''} onchange="pbDraftInit().lead=this.checked;pbRefresh()">Fullback leads</label>`:''}</div>
    <div style="display:flex;gap:6px;margin-bottom:6px"><button class="bgh bsm" onclick="pbAddWp()">+ Path point</button><button class="bgh bsm" onclick="pbDelWp()">− Path point</button></div>`;
  return`${fp?'':`<div class="pnl" style="margin-bottom:14px"><div class="ph">Active playbooks</div><div class="pb" style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-end">
      <label style="font-size:12px;color:var(--mu)">Offense<br><select onchange="pbData().offSel=this.value;nav('cust')">${opt(pbOffList(),offSel)}</select></label>
      <label style="font-size:12px;color:var(--mu)">Defense<br><select onchange="pbData().defSel=this.value;nav('cust')">${opt(pbDefList(),defSel)}</select></label>
      <div style="font-size:12px;color:var(--mu)">${book?`${Math.round(book.passP*100)}% pass · ${book.plays.length} pass plays · ${book.runs.length} runs`:''}. The computer calls plays from each team's playbook, and in games you play your call screen shows yours.</div></div></div>`}
    <div class="pnl" style="margin-bottom:14px"><div class="ph">Design a play</div><div class="pb">
      <div class="tabs" style="margin-bottom:10px">${tog('pass','Pass play')}${tog('run','Run play')}</div>
      <div style="display:flex;gap:18px;flex-wrap:wrap">
      <div style="flex:0 1 420px;min-width:0"><div id="pb-prev">${pbSVG(D,{edit:true,w:420})}</div>
        <div style="font-size:11px;color:var(--mu);margin-top:6px">Drag any receiver or back to line him up${D.kind==='run'?', and drag the yellow points to shape the run path'+(D.carrier==='OPT'?' (the give to the back) and the blue points for the QB keep':''):''}. <a href="#" onclick="pbResetPos();return false" style="color:var(--te)">Reset alignment</a></div></div>
      <div style="flex:1 1 280px;min-width:0">
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px"><input id="pb-n" placeholder="Play name" maxlength="22" value="${D.n.replace(/"/g,'&quot;')}" oninput="pbDraftInit().n=this.value" style="flex:1 1 140px">
          <select onchange="pbSetForm(this.value)">${PB_FORMS.map(([k,l])=>`<option value="${k}"${D.f===k?' selected':''}>${l}</option>`).join('')}</select></div>
        ${pbMoCtl(D,two)}${D.kind==='run'?runCtl:passCtl}
        <input id="pb-d" placeholder="Short description (optional)" maxlength="40" value="${(D.d||'').replace(/"/g,'&quot;')}" oninput="pbDraftInit().d=this.value" style="width:100%;margin:4px 0 8px">
        <button class="btn bgn bsm" onclick="pbSavePlay()">Save ${D.kind==='run'?'run':'pass'} play</button>
      </div></div>
      ${P.plays.length?`<div style="margin-top:14px;font-size:12px;font-weight:800;color:var(--mu)">Your plays</div><div style="display:flex;flex-wrap:wrap;gap:10px">${P.plays.map(p=>`<div style="display:flex;align-items:center;gap:8px;margin-top:6px;flex:1 1 260px">${pbThumb(p,96)}<div style="flex:1;min-width:0"><b>${p.n}</b><div style="font-size:11px;color:var(--mu)">${p.kind==='run'?'Run':'Pass'} · ${(PB_FORMS.find(x=>x[0]===p.f)||['','Shotgun'])[1]}${p.d?' · '+p.d:''}</div></div><button class="bgh bsm" onclick="pbDelPlay('${p.id}')">Delete</button></div>`).join('')}</div>`:''}
    </div></div>
    <div class="pnl" style="margin-bottom:14px"><div class="ph">Build an offensive playbook</div><div class="pb">
      <div style="font-size:12px;color:var(--mu);margin-bottom:8px">Pick a playbook to edit it (built-in ones too: add any play, including your own ★ plays), or type a new name to save a copy.</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:10px"><input id="pbb-n" placeholder="Playbook name" maxlength="20" value="${(B.n||'').replace(/"/g,'&quot;')}" oninput="pbBuildInit().n=this.value" style="flex:1 1 160px">
        <label style="font-size:12px;color:var(--mu)">Edit / start from <select onchange="pbCopyFrom(this.value)"><option></option>${opt(pbOffList(),B.n||'')}</select></label>
        <label style="font-size:12px;color:var(--mu)">Pass rate <b id="pbb-pp">${Math.round(B.passP*100)}%</b> <input type="range" min="15" max="85" value="${Math.round(B.passP*100)}" oninput="pbBuildInit().passP=this.value/100;document.getElementById('pbb-pp').textContent=this.value+'%'"></label></div>
      <div style="font-size:12px;font-weight:800;color:var(--mu);margin:4px 0">Pass plays</div><div>${passRefs}</div>
      <div style="font-size:12px;font-weight:800;color:var(--mu);margin:8px 0 4px">Run plays</div><div>${runRefs}</div>
      <button class="btn bgn bsm" style="margin-top:8px" onclick="pbSaveBook()">Save playbook</button>
      ${Object.keys(P.ext||{}).length?`<div style="margin-top:10px;font-size:12px;color:var(--mu)">Edited built-in playbooks: ${Object.keys(P.ext).map(n=>`<b>${n}</b> <button class="bgh bxs" onclick="pbResetBook('${n.replace(/'/g,"\\'")}')">Reset</button>`).join(' ')}</div>`:''}</div></div>
    <div class="pnl"><div class="ph">Build a defensive playbook</div><div class="pb">
      <div style="font-size:12px;color:var(--mu);margin-bottom:8px">Type a built-in name (4-3, 3-4, 46, Cover 2, Flex) to change which coverages it calls, or a new name for your own.</div>
      <input id="pbd-n" placeholder="Defensive playbook name" maxlength="20" style="margin-bottom:8px">
      ${Object.keys(P.extDef||{}).length?`<div style="margin-bottom:8px;font-size:12px;color:var(--mu)">Edited: ${Object.keys(P.extDef).map(n=>`<b>${n}</b> <button class="bgh bxs" onclick="pbResetBook('${n.replace(/'/g,"\\'")}',true)">Reset</button>`).join(' ')}</div>`:''}
      <div>${GDX.DCALLS.map(c=>`<label style="display:inline-flex;align-items:center;gap:5px;margin:0 10px 6px 0;font-size:12px"><input type="checkbox" class="pbd-ck" value="${c.id}" checked>${c.n}</label>`).join('')}</div>
      <button class="btn bgn bsm" style="margin-top:8px" onclick="pbSaveDef()">Save defensive playbook</button></div></div>`;
}

