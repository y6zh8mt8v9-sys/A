// The game's sound must mix with the player's own music: ambient audio session, no media element, no media session.
const {boot,newCareer,ok,done}=require('./_lib');
// every frame (the app and the Game Day frame) gets a stand-in for Safari's navigator.audioSession and counts media playback
const init=()=>{try{Object.defineProperty(navigator,'audioSession',{value:{type:'auto'},configurable:true});}catch(e){}
  window.__mediaPlays=0;const pl=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){window.__mediaPlays++;return pl.call(this);};
  window.__msTouched=0;try{if(navigator.mediaSession){for(const k of['setActionHandler','setPositionState'])if(navigator.mediaSession[k]){const f=navigator.mediaSession[k].bind(navigator.mediaSession);navigator.mediaSession[k]=(...a)=>{window.__msTouched++;return f(...a);};}
    let md=navigator.mediaSession.metadata;Object.defineProperty(navigator.mediaSession,'metadata',{get:()=>md,set:v=>{window.__msTouched++;md=v;},configurable:true});}}catch(e){}};
(async()=>{
  const {browser,page,errors}=await boot({init});
  console.log('audio mix');
  ok(await page.evaluate(()=>gdsMain().mixAudio===true&&gdsMain().crowdVol===1),'defaults: let other apps keep playing music is on, crowd volume full');
  await page.mouse.click(5,5);await page.waitForTimeout(100);
  let r=await page.evaluate(()=>({t:navigator.audioSession.type,plays:window.__mediaPlays,sil:!!window.__GPSIL}));
  ok(r.t==='ambient',`tap sets the ambient audio session (${r.t})`);
  ok(r.plays===0&&!r.sil,`no media element plays (${r.plays})`);
  // the setting: off restores the old speaker-even-on-silent mode, on goes back to mixing
  await page.evaluate(()=>gdsMainSet('mixAudio',false));await page.mouse.click(5,5);await page.waitForTimeout(100);
  r=await page.evaluate(()=>({t:navigator.audioSession.type,sil:!!window.__GPSIL}));
  ok(r.t==='playback'&&r.sil,`setting off: playback session (${r.t})`);
  await page.evaluate(()=>gdsMainSet('mixAudio',true));await page.waitForTimeout(50);
  r=await page.evaluate(()=>({t:navigator.audioSession.type,sil:!!window.__GPSIL}));
  ok(r.t==='ambient'&&!r.sil,`setting back on: ambient, silent loop stopped (${r.t})`);
  await page.evaluate(()=>{window.__mediaPlays=0;window.__msTouched=0;});
  // Settings shows the toggle and the crowd slider
  await newCareer(page);
  const hasRow=await page.evaluate(()=>{try{openSettings();}catch(e){}renderGdSettings();const el=document.getElementById('set-gd');return el?{mix:/Let other apps keep playing music/.test(el.textContent),cv:!!el.querySelector('input[aria-label="Crowd and band volume"]')}:null;});
  ok(hasRow&&hasRow.mix&&hasRow.cv,'Settings shows the music toggle and the crowd and band volume');
  await page.evaluate(()=>{gdsMainPut('crowdVol',0.4);try{closeSettings();}catch(e){}});
  ok(await page.evaluate(()=>gdsMain().crowdVol===0.4),'crowd volume is stored');
  // Game Day: the engine's own audio setup keeps the ambient session
  await page.evaluate(()=>{fpOpen();const T=FP.store.teams;FP.a=T[0].id;FP.b=(T[1]||T[0]).id;FP.mode='exh';fpStart();});
  let fr=null;for(let i=0;i<60&&!fr;i++){await page.waitForTimeout(250);fr=page.frames().find(f=>f!==page.mainFrame()&&/gd|blob|about:srcdoc/.test(f.url()+'')&&f.url()!=='about:blank');}
  if(!fr)fr=page.frames().find(f=>f!==page.mainFrame());
  ok(!!fr,'Game Day frame opened');
  if(fr){await page.waitForTimeout(1500);const box=await page.$('#gd-if');if(box){const b=await box.boundingBox();if(b)await page.mouse.click(b.x+b.width/2,b.y+b.height/2);}await page.waitForTimeout(400);
    const g=await fr.evaluate(()=>({t:navigator.audioSession&&navigator.audioSession.type,plays:window.__mediaPlays,ms:window.__msTouched,snd:!!(typeof SND!=='undefined'&&SND.ctx),cv:typeof sndCV==='function'?sndCV():null,band:typeof bandVol==='function'?bandVol():null})).catch(e=>({err:String(e)}));
    ok(g.snd,'engine sound started '+JSON.stringify(g));
    ok(g.t==='ambient',`engine keeps the ambient session (${g.t})`);
    ok(g.plays===0&&g.ms===0,'engine plays no media element and leaves the media session alone');
    ok(Math.abs(g.cv-0.4)<1e-9,`engine uses the crowd and band volume (${g.cv})`);}
  const top=await page.evaluate(()=>({plays:window.__mediaPlays,ms:window.__msTouched}));
  ok(top.plays===0&&top.ms===0,'app never played a media element or claimed the media session');
  ok(errors.length===0,'no page errors'+(errors.length?': '+errors.slice(0,3).join(' | '):''));
  await browser.close();done();
})();
