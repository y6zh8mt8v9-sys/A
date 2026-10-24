// ═══════════ AUDIO MIX: the game's sound plays under the player's own music ═══════════
// "Let other apps keep playing music" (Settings, on by default): the page uses the ambient audio session (Safari 17+),
// sound effects are Web Audio only and nothing claims the media session, so Spotify, Apple Music or a video keep playing.
// Returns true when mixing is on (gpAudioUnlock then only starts the shared audio context).
function gpAudioMode(){const mix=gdsMain().mixAudio!==false;
  try{if(navigator.audioSession){const t=mix?'ambient':'playback';if(navigator.audioSession.type!==t)navigator.audioSession.type=t;}}catch(e){}
  if(!mix)return false;
  try{if(window.__GPSIL){window.__GPSIL.pause();window.__GPSIL.removeAttribute('src');window.__GPSIL=null;}}catch(e){}  // the old silent loop would take over other apps' audio
  try{const AC=window.AudioContext||window.webkitAudioContext;if(AC){if(!window.__GPAC)window.__GPAC=new AC({latencyHint:'interactive'});if(window.__GPAC.state==='suspended')window.__GPAC.resume().catch(()=>{});}}catch(e){}
  try{const f=document.getElementById('gd-if'),w=f&&f.contentWindow;if(w&&w.GDS){w.GDS.mixAudio=true;if(w.navigator.audioSession)w.navigator.audioSession.type='ambient';}}catch(e){}
  return true;}
// a slider: store the value without redrawing the settings (a redraw would drop the slider mid-drag); a running game hears it at once
function gdsMainPut(k,v){const o=gdsMain();o[k]=v;try{localStorage.setItem('gpgm_gd',JSON.stringify(o));}catch(e){}
  try{const f=document.getElementById('gd-if'),w=f&&f.contentWindow;if(w&&w.GDS)w.GDS[k]=v;}catch(e){}}
