/* ===================== touchdown, sack & first-down celebrations ===================== */
const TD_CELEBS=[['spike','Spike'],['dunk','Goal post dunk'],['griddy','Grid shuffle'],['dance','Dance'],['sky','Point to the sky'],['bump','Jump bump'],
  ['airplane','Airplane'],['heisman','Trophy pose'],['raise','Raise the roof'],['kick','Kick it into the stands'],['jumper','Jump shot'],['nap','Take a nap'],['bow','Take a bow'],['team','Team pile-on'],
  ['rock','Shoulder rock'],['arrow','Bow and arrow'],['baby','Rock the baby'],['salute','Salute'],['moon','Moonwalk'],['sprinkler','Sprinkler'],
  ['robot','Robot'],['worm','The worm'],['phone','Call me'],['shrug','Shrug']];
const SACK_CELEBS=['sackflex','sackarms','sackpoint','sackdance','sackwings'];
const FD_CELEBS=['fdpoint','fdflex','fdhype','fdchop','fdspin'];
function gpMateFor(e,used){let mate=null,bd=1e9;for(const o of G.ents)if(o!==e&&o.team===e.team&&o.pl&&!o.down&&!o.hurt&&!o.celeb&&o.role!=='OL'&&!(used&&used.has(o))){const d=dist(o,e);if(d<bd){bd=d;mate=o;}}return mate;}
function startCeleb(e,type){
  if(G.client){if(e&&e.olProxy){olCmd('celeb',{c:type});setTray('dead');}return;}
  if(!e||e.celeb&&e.celeb.type===type)return;
  if(e.tdLand){e.celebQ=type;return;} // still in the air / on the ground after a diving score
  const ad=e.side==='o'?1:-1;
  e.celeb={type,t:0,ad,released:false,a0:Math.atan2(e.vy||ad,e.vx||0)};e.down=false;e.downT=0;e.seqLock=false;
  if(type==='bump'||type==='sackarms'&&Math.random()<0.6||type==='fdchop'&&Math.random()<0.5){
    const mate=gpMateFor(e);
    if(mate&&dist(mate,e)<16){mate.celeb={type:'bumpmate',t:0,ad,partner:e};e.celeb.partner=mate;}
  }
  if(type==='team'){ // up to four teammates run in and everybody jumps together
    const used=new Set();e.celeb.mates=[];
    for(let i=0;i<4;i++){const m=gpMateFor(e,used);if(!m||dist(m,e)>30)break;used.add(m);m.celeb={type:'pileon',t:0,ad,partner:e,slot:i};e.celeb.mates.push(m);}
  }
  const small=/^(fd|sack|bumpmate|pileon)/.test(type);
  if(!small){G.cheer=Math.max(G.cheer,2.5);setTray('none');}
  else if(/^sack/.test(type))G.cheer=Math.max(G.cheer,1.6);
}
function celebMove(e,dt){
  const C=e.celeb;C.t+=dt;let tv=[0,0];
  const T=C.type;
  if(T==='dunk'){
    const gy=C.ad>0?119.4:0.6;
    if(!C.jumped){tv=desire(e,CX+(e.x<CX?-0.6:0.6),gy,e.spd*0.85);if(Math.hypot(e.x-CX,e.y-gy)<1.4||C.t>3.5){C.jumped=true;C.jt=C.t;e.jumpT=0.6;}}
    else if(!C.released&&C.t-C.jt>0.3){C.released=true;C.noBall=true;G.cball={x:e.x,y:e.y+C.ad*0.4,h:3.9,vx:0,vy:C.ad*2.2,vh:1.5};flash('Over the crossbar!');}
  }else if(T==='spike'){if(!C.released&&C.t>0.32){C.released=true;C.noBall=true;G.cball={x:e.x+0.3,y:e.y+C.ad*0.5,h:1.6,vx:rnd(-1,1),vy:C.ad*1.5,vh:-7};dust(e.x,e.y,8);}}
  else if(T==='griddy'){tv=[Math.sin(C.t*5)*1.3,0];}
  else if(T==='dance'||T==='sackdance'){tv=[Math.sin(C.t*3)*0.6,Math.cos(C.t*3)*0.4];}
  else if(T==='bump'||T==='bumpmate'){
    const P=C.partner;if(P&&!C.jumped){const d=dist(e,P);if(T==='bumpmate')tv=desire(e,P.x+(e.x<P.x?-0.9:0.9),P.y,e.spd);
      if((d<1.3&&C.t>0.3)||C.t>2.2){C.jumped=true;e.jumpT=0.55;if(P.celeb&&!P.celeb.jumped&&P.celeb.type!=='team'){P.celeb.jumped=true;P.jumpT=0.55;}dust((e.x+P.x)/2,(e.y+P.y)/2,10);}}
  }
  else if(T==='airplane'||T==='sackwings'){ // arms out, banking in a wide circle
    if(C.t<(T==='airplane'?3.2:1.8)){const a=C.a0+C.t*1.9,sp=e.spd*0.55;tv=[Math.cos(a)*sp,Math.sin(a)*sp];}
  }
  else if(T==='kick'){if(!C.released&&C.t>0.55){C.released=true;C.noBall=true;G.cball={x:e.x,y:e.y+C.ad*0.4,h:0.8,vx:rnd(-2,2),vy:C.ad*rnd(9,12),vh:rnd(13,16)};flash('Into the stands!');}}
  else if(T==='jumper'){if(!C.jumped&&C.t>0.35){C.jumped=true;e.jumpT=0.55;}if(!C.released&&C.t>0.55){C.released=true;C.noBall=true;G.cball={x:e.x,y:e.y,h:2.6,vx:(CX-e.x)*0.35,vy:C.ad*4.2,vh:8.5};}}
  else if(T==='team'){if(!C.jumped&&C.t>1.7){C.jumped=true;e.jumpT=0.55;for(const m of C.mates||[])if(m.celeb){m.celeb.jumped=true;m.jumpT=0.55;}dust(e.x,e.y,14);}}
  else if(T==='pileon'){const P=C.partner;if(P&&!C.jumped){const a=C.slot*Math.PI/2+0.6;tv=desire(e,P.x+Math.cos(a)*1.05,P.y+Math.sin(a)*1.05,e.spd);}}
  else if(T==='rock'){tv=[Math.sign(Math.sin(C.t*7))*0.9,0];}
  else if(T==='moon'){if(C.t<3)tv=[0,-C.ad*1.6];}
  else if(T==='worm'){if(C.t<3.2)tv=[0,C.ad*(Math.floor(C.t*2.5)%2?1.4:0.2)];}
  else if(T==='robot'){tv=Math.floor(C.t*3.3)%4===1?[0.9,0]:Math.floor(C.t*3.3)%4===3?[-0.9,0]:[0,0];}
  else if(T==='arrow'){if(!C.released&&C.t>1.1){C.released=true;flash('Bow and arrow!');}}
  else if(T==='fdspin'){if(!C.released&&C.t>0.45){C.released=true;C.noBall=true;G.cball={x:e.x+0.5,y:e.y+C.ad*0.3,h:0.12,vx:0,vy:0,vh:0,spin:1};}}
  accel(e,tv[0],tv[1],dt,14);e.x+=e.vx*dt;e.y=clamp(e.y+e.vy*dt,-0.3,120.3);e.x=clamp(e.x,-1.5,FW+1.5);e.anim+=Math.hypot(e.vx,e.vy)*dt*2.1;
  if(T==='bump'||T==='bumpmate'||T==='pileon'){const P=C.partner;if(P)e.dir=Math.sign((G.flip?-1:1)*(P.y-e.y))*(G.flip?-1:1)||e.dir;}
}
function celebStepAll(dt){
  for(const e of G.ents)if(e.celeb)celebMove(e,dt);
  const B=G.cball;if(B){B.x+=B.vx*dt;B.y+=B.vy*dt;B.vh-=GRAV*0.8*dt;B.h+=B.vh*dt;if(B.h<0){B.h=0;if(Math.abs(B.vh)>2){B.vh=-B.vh*0.5;B.vx*=0.6;B.vy*=0.6;}else{B.vh=0;B.vx*=0.9;B.vy*=0.9;}}
    if(B.y>124||B.y<-4)G.cball=null;} // the ball went into the stands
}
/* animation frames for celebrations, from the sprite pack */
function celebAnim(e,A,Lp){
  const C=e.celeb;if(!C)return null;const t=C.t;
  const arms=()=>A('spike',(4+(Math.floor(t*5)%2))/6+0.01); // both arms up, pumping
  const rise=(d,then)=>t<d?A('getup',0.35+0.65*t/d):then;    // off the turf first (sacks, first downs)
  switch(C.type){
    case'spike':return t<0.6?A('spike',t/0.6):Lp('celebrate',t);
    case'dunk':if(!C.jumped)return['run_ball',Math.floor(Math.abs(e.anim)*1.15)%8];if(!C.released)return A('catch_high',0.55);return t-C.jt<0.9?A('catch_high',0.3):Lp('celebrate',t);
    case'griddy':{const f=Math.floor(t*9)%8;return['run',[1,3,5,7][f%4]];}
    case'dance':{const k=Math.floor(t*4)%4;return k<2?A('celebrate',k/4+0.1):A('juke',0.2+0.25*(k-2));}
    case'sky':return t<0.7?A('getup',0.45):A('catch_onehand',0.3);
    case'bump':case'bumpmate':if(!C.jumped)return C.type==='bumpmate'?['run',Math.floor(Math.abs(e.anim)*1.15)%8]:Lp('celebrate',t);return A('catch_high',0.3);
    case'airplane':return A('celebrate',0.1+0.2*(Math.floor(t*3)%2));
    case'heisman':return t<0.35?A('stiff_arm',t/0.35*0.5):A('stiff_arm',0.5);
    case'raise':return arms();
    case'kick':return t<0.9?A('kick',Math.min(0.99,t/0.9)):arms();
    case'jumper':return t<0.35?A('catch_hands',0.3):t<0.95?A('throw',clamp((t-0.35)/0.6,0,0.99)):A('catch_onehand',0.3);
    case'nap':return t<0.55?A('tackled',t/0.55):A('tackled',0.99);
    case'bow':return t<0.4?A('idle',0):t<2.2?A('tackle',0.22):A('idle',0);
    case'team':return C.jumped?A('catch_high',0.3):arms();
    case'pileon':return C.jumped?A('catch_high',0.3):['run',Math.floor(Math.abs(e.anim)*1.15)%8];
    case'sackflex':return rise(0.45,Lp('celebrate',t));
    case'sackarms':return rise(0.45,arms());
    case'sackpoint':return rise(0.45,A('stiff_arm',0.55));
    case'sackdance':return rise(0.4,(()=>{const k=Math.floor(t*4)%4;return k<2?A('celebrate',k/4+0.1):A('juke',0.2+0.25*(k-2));})());
    case'sackwings':return rise(0.35,A('celebrate',0.1+0.2*(Math.floor(t*3)%2)));
    case'fdpoint':return t<0.5?A('getup',t/0.5):A('stiff_arm',0.55);
    case'fdflex':return t<0.5?A('getup',t/0.5):A('celebrate',0.6);
    case'fdhype':return rise(0.45,arms());
    case'fdchop':return rise(0.45,A('throw',(Math.floor(t*4)%2?0.15:0.3)));
    case'fdspin':return t<0.6?A('tackle',0.22):Lp('celebrate',t);
    case'rock':return A('juke',0.2+0.25*(Math.floor(t*3.5)%2));
    case'arrow':return t<1.1?A('stiff_arm',Math.min(0.55,t/1.1*0.55)):t<1.5?A('throw',0.85):A('catch_onehand',0.3);
    case'baby':return A('catch_hands',0.25+0.1*Math.sin(t*6));
    case'salute':return t<0.4?A('getup',0.9):A('catch_onehand',0.3);
    case'moon':return t<3?['run',7-Math.floor(Math.abs(e.anim)*1.15)%8]:Lp('celebrate',t);
    case'sprinkler':return A('stiff_arm',0.55);
    case'robot':return Math.floor(t*3.3)%2?A('stiff_arm',0.5):A('idle',0);
    case'worm':return t<3.2?A(Math.floor(t*2.5)%2?'tackled':'getup',Math.floor(t*2.5)%2?0.8:0.3):Lp('celebrate',t);
    case'phone':return A('catch_onehand',Math.min(0.3,t/0.4*0.3));
    case'shrug':return t<2?A('catch_hands',Math.min(0.5,t)):Lp('celebrate',t);
  }
  return null;
}
function celebFlip(e){const C=e.celeb;if(!C)return 0;
  if(/^fd/.test(C.type))return(G.flip?-1:1)*(e.side==='o'?1:-1);
  if(C.type==='griddy')return Math.floor(C.t*3.3)%2?-1:1;
  if(C.type==='dance'||C.type==='sackdance')return Math.floor(C.t*2)%2?-1:1;
  if(C.type==='sackpoint'&&C.qb){const s=Math.sign(C.qb.y-e.y);return s?(G.flip?-s:s):0;}
  if(C.type==='heisman'||C.type==='bow'||C.type==='arrow')return(G.flip?-1:1)*(C.ad>0?1:-1);
  if(C.type==='rock'||C.type==='robot')return Math.floor(C.t*3.3)%2?-1:1;
  if(C.type==='sprinkler')return Math.floor(C.t*2.2)%2?-1:1;
  if(C.type==='moon'&&C.t<3)return(G.flip?-1:1)*(C.ad>0?1:-1);
  return 0;}
/* hooks into the play result: returns 'td', 'sack', 'fd' or false */
function celebrateAfter(S){
  // the corner (or whoever) who broke it up lets everybody know
  if(!G.simming&&!G.noDraw&&G.play&&G.play.kind==='scrimmage'&&!G.conv&&G.gpPbu&&!G.carrier){const pb=G.gpPbu;
    if(pb.pl&&!pb.hurt&&!pb.down){const t=pick(['sackwings','sackflex','fdpoint','fdchop']);setTimeout(()=>{if(G.phase==='dead'&&!pb.celeb)startCeleb(pb,t);},300);
      setTimeout(()=>{try{flash(`#${pb.pl.num} ${nm(pb.pl)} breaks it up!`);}catch(e){}},500);return'pbu';}}
  const c=G.carrier;if(!c||!c.pl)return false;
  // an interception (not returned for a score): the man who picked it celebrates
  if(S.td==null&&c.side==='d'&&c===G.picker&&!c.hurt&&!G.simming&&!G.noDraw){const t=pick(['sackdance','fdhype','fdspin','sackwings']);
    setTimeout(()=>{if(G.phase==='dead'&&!c.celeb)startCeleb(c,t);},350);setTimeout(()=>{try{flash(`Picked off by #${c.pl.num} ${nm(c.pl)}!`);}catch(e){}},600);return'int';}
  if(S.td!=null&&c.team===S.td&&!c.hurt){
    const land=c.tdLand?(c.dive||0)+1.2:0;
    if(!isAI(c.team)&&!G.test&&!pcAI(c)){G.celebPick=c;G.celebAuto=G.time+(ON?3.5:7)+land+(ON&&c.team!==G.me?1.5:0);if(c.team===G.me)setTray('celebrate');}
    else setTimeout(()=>{if(G.phase==='dead'&&!c.celeb)startCeleb(c,pick(TD_CELEBS)[0]);},350+land*1000);
    return'td';
  }
  if(G.simming||G.noDraw)return false;
  const P=G.play;if(!P||P.kind!=='scrimmage'||G.conv)return false;
  // sack: the man who got home celebrates over the quarterback, a teammate often joins him
  if(c.tkType==='sack'&&S.td==null){
    const sk=G.ents.find(x=>x.pl&&x.pl===G.gpTk&&x.side!==c.side);
    if(sk&&!sk.hurt){const type=pick(SACK_CELEBS);setTimeout(()=>{if(G.phase==='dead'&&!sk.celeb){startCeleb(sk,type);if(sk.celeb)sk.celeb.qb=c;}},300);
      setTimeout(()=>{try{flash(`#${sk.pl.num} ${nm(sk.pl)} gets home!`);}catch(e){}},600);return'sack';}
    return false;
  }
  if(S.first&&!S.td&&c.side==='o'&&S.gain>=1&&!c.hurt){
    const big=S.gain>=15||G.pbp&&G.pbp.d>=3;
    const type=big?pick(['fdhype','fdchop','fdspin','fdpoint']):pick(['fdpoint','fdpoint','fdflex','fdchop']);
    setTimeout(()=>{if(G.phase==='dead'&&c&&!c.celeb)startCeleb(c,type);},350);
    if(big){G.cheer=Math.max(G.cheer,1.4);const d=G.pbp&&G.pbp.d;setTimeout(()=>{try{flash(d===4?'Converts on 4th down!':d===3?'Moves the chains on 3rd down!':`Chunk play: ${Math.round(S.gain)} yards!`);}catch(e){}},700);}
    return'fd';
  }
  return false;
}
/* v2.17 touchdown card: a broadcast-style lower third with the scorer's face, name, number, position and his line so far this game.
   It never takes a tap (pointer-events off), leaves on its own, and only fades in with reduced motion. */
function gpTdLine(pl){const s=(G.gs||{})[pl.id]||{},o=[],n=(v,w)=>`${v} ${w}`;
  if(s.passAtt)o.push(`${s.passCmp||0}/${s.passAtt}, ${s.passYds||0} yds${s.passTD?', '+n(s.passTD,'TD'):''}${s.passInt?', '+n(s.passInt,'INT'):''}`);
  if(s.rushAtt)o.push(`${n(s.rushAtt,'car')}, ${s.rushYds||0} yds${s.rushTD?', '+n(s.rushTD,'TD'):''}`);
  if(s.rec)o.push(`${n(s.rec,'rec')}, ${s.recYds||0} yds${s.recTD?', '+n(s.recTD,'TD'):''}`);
  const rt=(s.krYds||0)+(s.prYds||0),rtd=(s.krTD||0)+(s.prTD||0);if(s.krRet||s.prRet)o.push(`${n((s.krRet||0)+(s.prRet||0),'ret')}, ${rt} yds${rtd?', '+n(rtd,'TD'):''}`);
  const d=[s.tackles?n(s.tackles,'tkl'):'',s.sacks?n(s.sacks,'sack'+(s.sacks>1?'s':'')):'',s.ints?n(s.ints,'INT'):''].filter(Boolean);if(d.length)o.push(d.join(', '));
  return o.slice(0,2).join(' · ')||'First score of the game';}
function gpTdFace(pl,team){const sd=pl.fs!=null?pl.fs:pl.mid!=null?pl.mid:pl.id;
  try{const f=window.parent&&window.parent!==window&&window.parent.face;if(typeof f==='function')return f(sd,64);}catch(e){}
  const k=KITS[team]||KITS[0],j=k.jersey.m,sk=(pl.look&&pl.look.skin&&pl.look.skin.m)||'#c68a5e'; // no portrait outside the full game: a plain bust
  return`<svg viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" fill="${k.helmet.s}"/><path d="M8 64c2-14 12-20 24-20s22 6 24 20z" fill="${j}"/><circle cx="32" cy="28" r="13" fill="${sk}"/><text x="32" y="60" text-anchor="middle" font-size="11" font-weight="900" fill="${k.num.m}" font-family="Archivo,sans-serif">${pl.num}<\/text><\/svg>`;}
function gpTdCard(S){
  const c=G.carrier,pl=c&&c.pl;if(!pl||G.simming||G.noDraw||G.demo||DEMO||G.test||G.client)return;
  let el=$('tdCard');if(!el){el=document.createElement('div');el.id='tdCard';el.setAttribute('role','status');el.hidden=true;$('wrap').appendChild(el);
    const st=document.createElement('style');st.textContent=`#tdCard{position:absolute;left:calc(var(--s)*10px);bottom:calc(var(--s)*58px);display:flex;align-items:stretch;max-width:min(78%,430px);pointer-events:none;z-index:6;border-radius:10px;overflow:hidden;box-shadow:0 10px 26px rgba(0,0,0,.45);background:rgba(10,16,26,.94);color:#fff;font-family:Archivo,system-ui,sans-serif}
#tdCard .tf{flex:0 0 auto;width:clamp(52px,calc(var(--s)*44px),76px);background:var(--tc,#1f3a68);display:flex;align-items:flex-end;justify-content:center}#tdCard .tf svg{width:100%;height:auto;display:block}
#tdCard .tx{padding:.45em .9em .5em;border-left:4px solid var(--tc2,#f2b632);min-width:0}#tdCard .tk{font:900 clamp(10px,calc(var(--s)*6px),13px)/1.1 Archivo,sans-serif;letter-spacing:.14em;color:var(--tc2,#f2b632)}
#tdCard .tn{font-weight:900;font-size:clamp(15px,calc(var(--s)*11px),24px);line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#tdCard .tp{font-weight:800;font-size:clamp(10px,calc(var(--s)*6px),13px);opacity:.8}
#tdCard .ts{font-weight:800;font-size:clamp(11px,calc(var(--s)*7px),15px);margin-top:.2em}
#tdCard.show{animation:tdIn 4.4s ease forwards}@keyframes tdIn{0%{opacity:0;transform:translateX(-40px)}8%{opacity:1;transform:none}88%{opacity:1;transform:none}100%{opacity:0;transform:translateX(-20px)}}
@media (prefers-reduced-motion: reduce){#tdCard.show{animation:tdFade 4.4s linear forwards}@keyframes tdFade{0%{opacity:0}5%,92%{opacity:1}100%{opacity:0}}}`;document.head.appendChild(st);}
  const t=c.team,T=G.teams[t]||{},k=KITS[t]||KITS[0];
  el.style.setProperty('--tc',k.jersey.m);el.style.setProperty('--tc2',k.trim?k.trim.l:'#f2b632');
  el.innerHTML=`<div class="tf">${gpTdFace(pl,t)}<\/div><div class="tx"><div class="tk">TOUCHDOWN<\/div><div class="tn">#${pl.num} ${pl.first} ${pl.last}<\/div><div class="tp">${pl.pos} · ${T.city?T.city+' ':''}${T.name||''}<\/div><div class="ts">${gpTdLine(pl)}<\/div><\/div>`;
  clearTimeout(G.tdCardT);G.tdCardT=setTimeout(()=>{el.hidden=false;restartAnim(el);G.tdCardT=setTimeout(()=>{el.hidden=true;el.classList.remove('show');},4500);},700);
}
