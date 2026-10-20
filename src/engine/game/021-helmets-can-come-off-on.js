/* ===================== v2.14 helmets can come off on big hits ===================== */
// About one big hit in 25 (more from strong hitters) knocks the ball carrier's helmet off. By rule he has to sit out the next play.
function gpHelmetPop(c,f){
  if(!c||!c.pl||c.pl.helmetOff||G.demo)return;
  const pr=clamp(0.035*((f&&f.pl&&f.pl.str)||75)/75,0.02,0.07);if(Math.random()>pr)return;
  c.pl.helmetOff=true;
  (G.helmets||(G.helmets=[])).push({x:c.x,y:c.y,h:1.7,vx:rnd(-2.5,2.5)+c.vx*0.3,vy:rnd(-2,2)+c.vy*0.3,vh:rnd(3.5,5.5),team:c.team,rot:0,vr:rnd(-12,12)});
  if(!(c.pl.inj&&c.pl.inj.plays>1))c.pl.inj={type:'helmet came off',plays:1};
  setTimeout(()=>{try{flash(`#${c.pl.num} ${nm(c.pl)} loses his helmet! He sits out a play`);}catch(e){}},500);
}
function gpHelmetsStep(dt){
  const L=G.helmets;if(!L||!L.length)return;
  for(const h of L){h.x+=h.vx*dt;h.y+=h.vy*dt;h.vh-=GRAV*0.8*dt;h.h+=h.vh*dt;h.rot+=h.vr*dt;
    if(h.h<0){h.h=0;if(Math.abs(h.vh)>1.5){h.vh=-h.vh*0.35;h.vx*=0.55;h.vy*=0.55;h.vr*=0.5;}else{h.vh=0;h.vx*=0.85;h.vy*=0.85;h.vr*=0.8;}}}
}
function drawHelmets(){
  const L=G.helmets;if(!L||!L.length)return;
  for(const h of L){const[wx,wy]=toW(h.x,h.y),g=proj(wx,wy,0),p=proj(wx,wy,vh(h.h)),z=p.k*0.0212,col=(PACK_TEAMS[h.team]||{}).helmet||'#888',fm=(PACK_TEAMS[h.team]||{}).facemask||'#ccc';
    ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(g.sx,g.sy,6*z,2*z,0,0,Math.PI*2);ctx.fill();
    const m0=ctx.getTransform();ctx.translate(p.sx,p.sy-3*z);ctx.rotate(h.rot);ctx.scale(z,z);
    ctx.fillStyle=col;ctx.strokeStyle='#111';ctx.lineWidth=0.9;ctx.beginPath();ctx.arc(0,0,5.2,Math.PI*0.95,Math.PI*2.25);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.strokeStyle=fm;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(3.2,-0.6);ctx.lineTo(6.6,0.4);ctx.moveTo(3.4,1.6);ctx.lineTo(6.4,2.4);ctx.moveTo(5.6,-0.4);ctx.lineTo(5.6,3);ctx.stroke();
    ctx.setTransform(m0);}
}
// bare-headed look for the sprite pack: the helmet comes out of the frame and the player's own hair goes in (style: buzz / short / big / long)
const PACK_BARE={};
function packBare(team,skin,hair,hst,slim){const h=/^#[0-9a-f]{6}$/i.test(hair||'')?hair:'#1e140d',st=['buzz','short','big','long'].includes(hst)?hst:'short',k=team+':'+skin+':'+h+':'+st+(slim?':s':'');
  if(PACK_BARE[k])return PACK_BARE[k];const t=PACK_TEAMS[team]||PACK_TEAMS[0];return PACK_BARE[k]=Object.assign({},t,{hair:h,bare:st},slim?{slim:true}:{});}
function gpNoHelm(){return SEVENS();} // 7v7: no helmets, no pads

/* ===================== v2.14 SOUND: crowd, effects, nerves (all synthesized, no audio files) ===================== */
const SND={ctx:null,master:null,crowd:null,crowdF:null,murmur:null,noise:null,on:false,lvl:0,beatT:0,last:{}};
function sndInit(){
  if(SND.ctx||DEMO||!GDS.sound)return;
  try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    let c=null;try{const P=window.parent&&window.parent!==window?window.parent.__GPAC:null;if(P&&P.state!=='closed')c=P;}catch(e){}
    if(!c)c=new AC({latencyHint:'interactive'});SND.ctx=c;try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch(e){}
    // v2.16 speaker chain: cut the rumble small speakers can't play, lift the presence range, compress and make up the level
    const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=70;
    const pres=c.createBiquadFilter();pres.type='peaking';pres.frequency.value=2400;pres.Q.value=0.8;pres.gain.value=4;
    const comp=c.createDynamicsCompressor();comp.threshold.value=-20;comp.knee.value=12;comp.ratio.value=4;comp.attack.value=0.004;comp.release.value=0.2;
    const mkup=c.createGain();mkup.gain.value=1.9;
    SND.master=c.createGain();SND.master.gain.value=GDS.vol;SND.master.connect(hp);hp.connect(pres);pres.connect(comp);comp.connect(mkup);mkup.connect(c.destination);SND.out=mkup;
    // when Game Day closes the parent stops this game's sound (the audio context outlives the game)
    window.__gpSndStop=()=>{try{SND.on=false;mkup.disconnect();}catch(e){}};
    const n=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=n.getChannelData(0);let b=0;
    for(let i=0;i<d.length;i++){const w=Math.random()*2-1;b=(b+0.02*w)/1.02;d[i]=w*0.6+b*3.5;}SND.noise=n;
    // crowd bed: filtered noise, two layers (a low murmur and a brighter roar)
    const mk=(f,q,g)=>{const src=c.createBufferSource();src.buffer=n;src.loop=true;src.playbackRate.value=0.5+Math.random()*0.1;
      const bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=f;bp.Q.value=q;const gn=c.createGain();gn.gain.value=0;
      src.connect(bp);bp.connect(gn);gn.connect(SND.master);src.start();return{gn,bp};};
    SND.murmur=mk(420,0.7,0);SND.crowd=mk(900,0.5,0);SND.on=true;
  }catch(e){SND.ctx=null;}
}
function sndUnlock(){sndInit();if(SND.ctx&&SND.ctx.state!=='running')SND.ctx.resume().catch(()=>{});}
// a controller button counts too (the parent's click already started the audio)
function sndPadKick(){if(!SND.ctx||SND.ctx.state!=='running')sndUnlock();}
addEventListener('pointerdown',sndUnlock,{passive:true});addEventListener('keydown',sndUnlock);
function sndOK(k,gap){if(!SND.on||!GDS.sound||G.noDraw||G.simming||DEMO)return false;const t=SND.ctx.currentTime;if(k&&SND.last[k]!=null&&t-SND.last[k]<(gap||0.05))return false;if(k)SND.last[k]=t;return true;}
function sndEnv(g,t,a,peak,dec){g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(0.0002,peak),t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+a+dec);}
function sndTone(type,f0,f1,dur,vol,delay){if(!SND.ctx)return;const c=SND.ctx,t=c.currentTime+(delay||0),o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);if(f1&&f1!==f0)o.frequency.exponentialRampToValueAtTime(f1,t+dur);
  o.connect(g);g.connect(SND.master);sndEnv(g,t,0.005,vol,dur);o.start(t);o.stop(t+dur+0.05);return o;}
function sndNoise(fType,f,q,dur,vol,delay,f1){if(!SND.ctx)return;const c=SND.ctx,t=c.currentTime+(delay||0),src=c.createBufferSource();src.buffer=SND.noise;src.playbackRate.value=1;
  const fl=c.createBiquadFilter();fl.type=fType;fl.frequency.setValueAtTime(f,t);if(f1)fl.frequency.exponentialRampToValueAtTime(f1,t+dur);fl.Q.value=q;const g=c.createGain();
  src.connect(fl);fl.connect(g);g.connect(SND.master);sndEnv(g,t,0.004,vol,dur);src.start(t,Math.random()*1.5);src.stop(t+dur+0.1);}
const SFX={
  whistle(){if(!sndOK('wh',0.4))return;sndNoise('bandpass',2900,6,0.4,0.08);const o=sndTone('sine',2850,2700,0.42,0.22);if(o){const l=SND.ctx.createOscillator(),lg=SND.ctx.createGain();l.frequency.value=28;lg.gain.value=90;l.connect(lg);lg.connect(o.frequency);l.start();l.stop(SND.ctx.currentTime+0.5);}},
  hut(){if(!sndOK('hut',0.3))return;sndNoise('bandpass',900,2.5,0.12,0.3);sndTone('sawtooth',210,150,0.12,0.07);sndNoise('bandpass',2200,3,0.05,0.1,0.02);},
  pads(n){if(!sndOK('pads',0.15))return;for(let i=0;i<(n||5);i++){const d=0.02+Math.random()*0.22;sndNoise('bandpass',1100+Math.random()*1800,2.5,0.06,0.12+Math.random()*0.07,d);sndNoise('bandpass',350+Math.random()*200,2,0.07,0.08,d);}},
  hit(big){if(!sndOK('hit',0.08))return;
    // body (felt on big speakers) + plastic crack of helmets and pads (heard on any speaker) + a short grunt
    sndNoise('lowpass',big?900:650,0.8,big?0.2:0.12,big?0.45:0.26);sndTone('sine',big?110:130,55,big?0.22:0.13,big?0.4:0.24);
    sndNoise('bandpass',big?1900:2300,2.2,big?0.07:0.05,big?0.42:0.26);sndNoise('bandpass',420,1.5,big?0.12:0.08,big?0.3:0.18,0.005);
    if(big){sndNoise('bandpass',3200,3,0.06,0.2,0.012);sndTone('sawtooth',170,120,0.16,0.05,0.03);}
    if(big&&GDS.haptics){try{navigator.vibrate&&navigator.vibrate(40);}catch(e){}}},
  throw(){if(!sndOK('thr',0.2))return;sndNoise('bandpass',700,1.2,0.3,0.2,0,2800);sndNoise('bandpass',1600,2,0.08,0.12);},
  catch_(){if(!sndOK('cat',0.15))return;sndNoise('bandpass',1400,2.2,0.05,0.35);sndTone('sine',300,180,0.08,0.22);sndNoise('highpass',3200,1,0.03,0.12);},
  kick(){if(!sndOK('kick',0.3))return;sndNoise('bandpass',1300,1.8,0.06,0.55);sndTone('sine',200,70,0.16,0.45);sndNoise('lowpass',1500,1,0.07,0.35);sndNoise('bandpass',3000,2,0.03,0.2,0.005);},
  horn(){if(!sndOK('horn',1.5))return;for(const f of[233,294,349])sndTone('sawtooth',f,f*0.98,1.1,0.05);},
  chime(){if(!sndOK('chime',0.5))return;sndTone('triangle',784,784,0.16,0.12);sndTone('triangle',1047,1047,0.3,0.12,0.12);},
  flag(){if(!sndOK('flag',0.6))return;SFX.whistle();setTimeout(()=>{SND.last.wh=null;SFX.whistle();},180);},
  beat(k){if(!sndOK('beat',0.25))return;sndTone('sine',58,40,0.13,0.32*k);sndTone('sine',52,38,0.12,0.22*k,0.17);},
  click(){if(!sndOK('clk',0.03))return;sndTone('square',1800,1200,0.025,0.035);},
  // crowd one-shots: a roar swells and fades, a groan bends down, a gasp is short and sharp
  roar(v,dur){if(!sndOK('roar',0.6)||!GDS.crowd)return;sndNoise('bandpass',1000,0.45,dur||2.6,0.3*(v||1));sndNoise('bandpass',2300,0.7,(dur||2.6)*0.8,0.14*(v||1),0.05);sndNoise('bandpass',600,0.8,(dur||2.6)*0.9,0.12*(v||1),0.08);},
  groan(){if(!sndOK('groan',1)||!GDS.crowd)return;sndNoise('bandpass',700,1.4,1.4,0.16,0,280);},
  gasp(){if(!sndOK('gasp',0.6)||!GDS.crowd)return;sndNoise('bandpass',1300,1.6,0.45,0.2,0,2600);},
  boo(){if(!sndOK('boo',1)||!GDS.crowd)return;sndNoise('bandpass',260,3,1.6,0.2);sndNoise('bandpass',330,3,1.5,0.12,0.1);}
};
/* v2.16 the home band: a drumline between plays, the fight song after home touchdowns, "Charge!" and DE-FENSE claps on big home
   defensive downs. Everything is synthesized like the rest of the sound (no audio files). */
const BAND={next:0,step:0,bar:0,on:false,lastCall:-9,lastChant:-9};
const BAND_SN='x.x.xx.xx.x.x.xx',BAND_BD='x...x...x..xx...';
function bandOK(){return SND.on&&GDS.sound&&GDS.band!==false&&GDS.crowd&&!G.noDraw&&!G.simming&&!G.paused&&!DEMO&&!(GP&&GP.practice)&&G.phase!=='replay';}
function bandVol(){const tier=GP&&GP.stadium&&GP.stadium.tier?clamp(GP.stadium.tier/20,0.35,1):0.6;return 0.55*tier;}
function bandSnare(t,v){const c=SND.ctx,src=c.createBufferSource();src.buffer=SND.noise;const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=1800;const g=c.createGain();
  src.connect(hp);hp.connect(g);g.connect(SND.master);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.09*v,t+0.003);g.gain.exponentialRampToValueAtTime(0.0001,t+0.11);src.start(t,Math.random());src.stop(t+0.15);}
function bandBass(t,v){const c=SND.ctx,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(85,t);o.frequency.exponentialRampToValueAtTime(48,t+0.18);
  o.connect(g);g.connect(SND.master);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.32*v,t+0.005);g.gain.exponentialRampToValueAtTime(0.0001,t+0.3);o.start(t);o.stop(t+0.35);}
function bandBrass(t,f,dur,v){const c=SND.ctx,lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(900,t);lp.frequency.linearRampToValueAtTime(2600,t+0.06);lp.connect(SND.master);
  for(const[m,det]of[[1,0],[1,7],[0.5,-5],[1.5,3]]){const o=c.createOscillator(),g=c.createGain();o.type='sawtooth';o.frequency.value=f*m;o.detune.value=det;o.connect(g);g.connect(lp);
    const a=m===1?1:0.45;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.035*v*a,t+0.03);g.gain.setValueAtTime(0.035*v*a,t+dur*0.7);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.start(t);o.stop(t+dur+0.05);}}
const NOTE=n=>440*Math.pow(2,(n-69)/12);
// fight song: an original 4-bar tune in B-flat
const FIGHT=[[70,.5],[74,.5],[77,1],[74,.5],[77,.5],[82,1.5],[81,.5],[79,.5],[77,.5],[75,.5],[74,.5],[72,1],[70,.5],[72,.5],[74,.5],[75,.5],[77,1],[74,.5],[70,.5],[77,2]];
function bandFight(){if(!bandOK())return;const c=SND.ctx,v=bandVol(),b=60/150;let t=c.currentTime+0.1;
  for(const[n,d]of FIGHT){bandBrass(t,NOTE(n),d*b*0.92,v);t+=d*b;}for(let i=0;i<32;i++){const tt=c.currentTime+0.1+i*b/2;if(BAND_SN[i%16]==='x')bandSnare(tt,v);if(i%4===0)bandBass(tt,v);}}
// the bugle "Charge!" call (traditional) followed by the crowd
function bandCharge(){if(!bandOK())return;const c=SND.ctx,v=bandVol(),t0=c.currentTime+0.05,s=0.13;
  [[67,1],[72,1],[76,1],[79,2],[76,1],[79,4]].reduce((t,[n,d])=>{bandBrass(t,NOTE(n),d*s*0.95,v*1.1);return t+d*s;},t0);
  setTimeout(()=>{try{SFX.roar(0.9,1.6);}catch(e){}},1400);}
// DE-FENSE: two crowd syllables and two claps, three times
function crowdChant(){if(!bandOK())return;const c=SND.ctx,v=bandVol()*1.4,b=0.32;
  for(let r=0;r<3;r++){const t=c.currentTime+0.05+r*b*4;
    sndNoise('bandpass',520,4,0.22,0.12*v,t-c.currentTime);sndNoise('bandpass',380,4,0.3,0.12*v,t-c.currentTime+b);
    sndNoise('highpass',2200,1,0.05,0.16*v,t-c.currentTime+b*2);sndNoise('highpass',2200,1,0.05,0.16*v,t-c.currentTime+b*3);}}
function bandStep(){
  if(!bandOK()){BAND.on=false;return;}
  const c=SND.ctx,home=gpHomeTeam(),between=G.phase==='call'||G.phase==='dead'||G.phase==='modal';
  // the drumline plays between snaps and falls silent once the offense breaks the huddle
  if(between){const v=bandVol()*0.8,b=60/120/4;if(!BAND.on||BAND.next<c.currentTime-0.5){BAND.on=true;BAND.next=c.currentTime+0.05;BAND.step=0;}
    while(BAND.next<c.currentTime+0.25){const i=BAND.step%16;if(BAND_SN[i]==='x')bandSnare(BAND.next,v*(i%4===0?1:0.75));if(BAND_BD[i]==='x')bandBass(BAND.next,v);BAND.step++;BAND.next+=b;}}
  else BAND.on=false;
  // big home defensive downs: "Charge!" once, then the DE-FENSE chant
  if(G.phase==='presnap'&&G.play&&G.play.kind==='scrimmage'&&G.offTeam!==home&&(G.down>=3||gpNerves(home)>0.4)){
    const now=c.currentTime;if(now-BAND.lastCall>40){BAND.lastCall=now;bandCharge();}else if(now-BAND.lastChant>14&&now-BAND.lastCall>4){BAND.lastChant=now;crowdChant();}}
}
// which side the crowd is on: the home team (GP.home); with no host info the player's team is home
function gpHomeTeam(){return GP&&GP.home!=null?GP.home:0;}
/* crowd noise: the home crowd gets loud when the visitors have the ball (bigger stadium, tense moments, rivalry, big plays).
   It drives the crowd sound and the meter under the scorebug, and it gets to the visitors: false starts, missed audibles,
   a little less focus on catches */
function gpNoiseStep(dt){
  if(!GP||GP.practice||SEVENS()||G.demo||G.test){G.noise=0;gpNoiseHud();return;}
  const home=gpHomeTeam(),stad=GP.stadium&&GP.stadium.tier?clamp(GP.stadium.tier/20,0.3,1):0.6;let t=0.08;
  if(G.play&&G.play.kind==='scrimmage'&&G.offTeam!==home&&['presnap','live','call'].includes(G.phase)){
    t=stad*(0.38+gpNerves(home)*0.4+(G.down>=3?0.14:0)+(GP.rival?0.12:0)+Math.min(0.15,(G.cheer||0)*0.06));if(G.phase==='live')t*=0.75;}
  G.noise=(G.noise||0)+(clamp(t,0,1)-(G.noise||0))*Math.min(1,dt*1.6);gpNoiseHud();
}
function gpNoiseFor(t){return t!=null&&t!==gpHomeTeam()?(G.noise||0):0;}
function gpNoiseFS(){const n=gpNoiseFor(G.offTeam);if(n<0.55)return false;
  if(Math.random()<(n-0.55)*(isAI(G.offTeam)?0.16:0.08)){flash('False start! The crowd got to them');try{setTray('none');}catch(e){}preSnapFoul(G.offTeam,'False start',5);return true;}return false;}
function gpNoiseHud(){const b=$('bug');if(!b)return;let el=$('noiseM');const show=GDS.noiseM!==false&&GP&&!GP.practice&&!SEVENS()&&!G.noDraw&&!G.demo;
  if(!show){if(el)el.hidden=true;return;}
  if(!el){el=document.createElement('div');el.id='noiseM';el.innerHTML='<span>CROWD<\/span><i><b><\/b><\/i>';b.parentNode.appendChild(el);}
  el.hidden=false;
  // sits just under the scorebug, whichever scorebug style is on
  {const pr=b.parentNode.getBoundingClientRect(),br=b.getBoundingClientRect(),k=pr.width?b.parentNode.offsetWidth/pr.width:1,L=((br.left-pr.left+br.width/2)*k).toFixed(0)+'px',T=((br.bottom-pr.top+4)*k).toFixed(0)+'px';
    if(el.style.left!==L)el.style.left=L;if(el.style.top!==T)el.style.top=T;}
  const n=clamp(G.noise||0,0,1);if(Math.abs((el._n||0)-n)<0.01)return;el._n=n;
  const f=el.querySelector('b');f.style.width=(n*100).toFixed(1)+'%';f.style.background=`hsl(${Math.round(120-120*n)},85%,50%)`;el.classList.toggle('loud',n>0.7);}
function sndCrowdFor(team,good){if(!GDS.crowd)return;const home=team===gpHomeTeam();if(home===good)SFX.roar(good?1:0.8);else if(good)SFX.groan();else SFX.boo();}
/* nerves: how tense this moment is for team t (0..1). Late and close, fourth down, a two-point try, overtime */
function gpNerves(t){
  if(!G||G.q==null||(GP&&GP.practice)||G.demo)return 0;
  const diff=Math.abs(G.score[0]-G.score[1]);let n=0;
  if(G.q>4)n=0.8;else if(G.q===4&&diff<=8)n=0.35+clamp((150-G.clock)/150,0,1)*0.45;else if(G.q===2&&G.clock<40&&diff<=8)n=0.25;
  if(G.conv&&G.conv.two)n+=0.35;if(G.down===4&&G.phase!=='menu'&&!G.conv)n+=0.25;else if(G.down===3&&G.toGo>=5)n+=0.1;
  if(G.play&&(G.play.kind==='fg')&&G.q>=4&&diff<=3)n+=0.4;
  if(GP&&GP.big)n+=0.15; // playoffs and title games
  return clamp(n,0,1);
}
// composure: clutch players, veterans with high awareness stay calm; others feel it
function gpComposure(pl){if(!pl)return 0.6;if(gpTr(pl,'clutch')||gpTr(pl,'big-game'))return 0;return clamp((82-(pl.awr||70))/30,0.15,1);}
function gpNervesFx(dt){
  let el=$('nerveFx');const k=(G.phase==='presnap'||G.phase==='live'||G.phase==='call')&&!G.noDraw&&!isAI(G.me)?gpNerves(G.me):0;
  if(!el&&k>0){el=document.createElement('div');el.id='nerveFx';el.style.cssText='position:absolute;inset:0;pointer-events:none;border-radius:inherit;z-index:1;opacity:0;transition:opacity .4s';$('wrap').appendChild(el);}
  if(el){const pulse=0.55+0.45*Math.sin(G.time*(5+k*5));el.style.opacity=k>0.3?(k*0.55*pulse).toFixed(3):'0';
    el.style.background='radial-gradient(ellipse at center,rgba(0,0,0,0) 55%,rgba(120,0,0,.55) 100%)';}
  if(k>0.45&&(G.phase==='presnap'||G.phase==='call')){SND.beatT-=dt;if(SND.beatT<=0){SND.beatT=60/(70+k*60);SFX.beat(k);}}
}
function sndStep(dt){
  if(!SND.on)return;const c=SND.ctx;if(!c)return;
  SND.master.gain.setTargetAtTime(GDS.sound?GDS.vol:0,c.currentTime,0.05);
  if(G.noDraw||G.simming||!GDS.crowd||G.paused||G.phase==='replay'){SND.murmur.gn.gain.setTargetAtTime(0,c.currentTime,0.3);SND.crowd.gn.gain.setTargetAtTime(0,c.currentTime,0.3);return;}
  const prac=GP&&GP.practice,stad=GP&&GP.stadium&&GP.stadium.tier?clamp(GP.stadium.tier/20,0.3,1):0.6;
  // the home crowd gets loud when its defense is on the field before the snap
  const homeD=G.phase==='presnap'&&G.play&&G.play.kind==='scrimmage'&&G.offTeam!==gpHomeTeam();
  const n=gpNerves(gpHomeTeam());
  let bed=prac?0.01:(0.035+n*0.05)*stad,roar=prac?0:Math.max(0,Math.min(1,G.cheer/2.5))*0.3*stad+(homeD?0.03+n*0.04+(G.noise||0)*0.14:0);
  SND.murmur.gn.gain.setTargetAtTime(bed,c.currentTime,0.4);SND.crowd.gn.gain.setTargetAtTime(roar,c.currentTime,0.25);
  SND.crowd.bp.frequency.setTargetAtTime(800+roar*1400,c.currentTime,0.3);
  // v2.16 a livelier crowd: the bed breathes, and now and then someone yells or whistles
  if(!prac){SND.murmur.bp.frequency.setTargetAtTime(380+Math.sin(G.time*0.37)*70+Math.sin(G.time*1.3)*25,c.currentTime,0.5);
    if(Math.random()<dt*0.12*stad)sndNoise('bandpass',900+Math.random()*900,6,0.25+Math.random()*0.3,0.05*stad);
    if(Math.random()<dt*0.04*stad)sndTone('sine',2400+Math.random()*600,2900+Math.random()*500,0.35,0.025*stad);}
  try{bandStep();}catch(e){}
}
