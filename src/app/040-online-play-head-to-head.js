// ═══════════ v2.03 ONLINE PLAY: head-to-head matches with a code, accounts, friends, records ═══════════
// ┌─ SETUP ──────────────────────────────────────────────────────────────────────────────────────────────┐
// │ Paste your Supabase project URL and its publishable (anon) key between the quotes below, then upload  │
// │ this file to your site. Everyone who opens the game from your site then shares the same accounts,     │
// │ friends and match records. ONLINE_SETUP.md explains the five-minute setup (database script included). │
// └───────────────────────────────────────────────────────────────────────────────────────────────────────┘
const OL_CONFIG={url:'https://enjanwolodzylsnvpvqw.supabase.co',key:'sb_publishable_tZtlVVbTFZej0Xz3sBuHLw_2b1eefZj'};
const OL_SB_SRC='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.116.0/dist/umd/supabase.js';
const OL_ICE=[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'}];
const OLS={tab:'play',backend:null,user:null,profile:null,src:'fp',fpId:null,saveId:null,saves:null,uni:'home',busy:false,
  friends:null,matches:null,statsErr:null,lobby:null,cfgOpen:false,msg:'',authMode:'in'};
function olEsc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function olCfg(){let c=null;try{c=JSON.parse(localStorage.getItem('gpm_ol_cfg')||'null');}catch(e){}
  if(OL_CONFIG.url&&OL_CONFIG.key)return{mode:'supabase',url:OL_CONFIG.url.trim(),key:OL_CONFIG.key.trim(),builtIn:true};
  return c&&c.mode?c:null;}
// one id per browser tab (it survives a reload, so a player who refreshes can rejoin his match)
function olGid(){let g=null;try{g=sessionStorage.getItem('gpm_ol_gid');}catch(e){}if(!g){g='g'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);try{sessionStorage.setItem('gpm_ol_gid',g);}catch(e){}}return g;}

/* ─────────── backend: Supabase ─────────── */
function olLoadScript(src){return new Promise((res,rej)=>{if(window.supabase&&window.supabase.createClient)return res();const s=document.createElement('script');s.src=src;s.async=true;s.onload=()=>res();s.onerror=()=>rej(new Error('Could not load the online library. Check your internet connection.'));document.head.appendChild(s);});}
function olSupabase(cfg){
  // a database that was never set up answers "relation does not exist" / PGRST205: say what to do instead
  let sb=null;const err=e=>{if(!e)return;const t=(e.message||String(e))+' '+(e.code||'');
    if(/does not exist|PGRST20[0-9]|schema cache|function public\./i.test(t))throw new Error('The online database is not set up yet. Run supabase_setup.sql in the Supabase SQL Editor (see ONLINE_SETUP.md).');
    throw new Error(e.message||String(e));};
  const B={kind:'supabase',
    async init(){await olLoadScript(OL_SB_SRC);sb=window.supabase.createClient(cfg.url,cfg.key,{auth:{persistSession:true,autoRefreshToken:true,storageKey:'gpm-ol-auth'}});
      const{data,error}=await sb.auth.getSession();err(error);return data&&data.session?data.session.user:null;},
    onAuth(cb){sb.auth.onAuthStateChange((ev,session)=>cb(session?session.user:null));},
    async usernameFree(name){const{data,error}=await sb.from('profiles').select('id').ilike('username',name.replace(/[%_\\]/g,'\\$&')).limit(1);err(error);return!(data&&data.length);},
    async signUp(username,email,password){const{data,error}=await sb.auth.signUp({email,password,options:{data:{username},emailRedirectTo:IS_NATIVE?undefined:location.href.split('#')[0]}});err(error);return{user:data.user,session:!!data.session};},
    async signIn(email,password){const{data,error}=await sb.auth.signInWithPassword({email,password});err(error);return data.user;},
    async signOut(){await sb.auth.signOut();},
    async profile(uid){const{data,error}=await sb.from('profiles').select('id,username').eq('id',uid).maybeSingle();err(error);return data;},
    async profiles(ids){if(!ids.length)return[];const{data,error}=await sb.from('profiles').select('id,username').in('id',ids);err(error);return data||[];},
    async search(q){const{data,error}=await sb.from('profiles').select('id,username').ilike('username',q.replace(/[%_\\]/g,'\\$&')+'%').limit(12);err(error);return data||[];},
    async friendships(){const{data,error}=await sb.from('friendships').select('id,requester,addressee,status,created_at');err(error);return data||[];},
    async addFriend(me,uid){const{error}=await sb.from('friendships').insert({requester:me,addressee:uid});err(error);},
    async acceptFriend(id){const{error}=await sb.from('friendships').update({status:'accepted'}).eq('id',id);err(error);},
    async removeFriend(id){const{error}=await sb.from('friendships').delete().eq('id',id);err(error);},
    async report(row){const{data,error}=await sb.from('matches').insert(row).select('id').single();err(error);return data.id;},
    async confirm(id){const{error}=await sb.rpc('confirm_match',{mid:id});err(error);},
    async matches(){const{data,error}=await sb.from('matches').select('*').order('created_at',{ascending:false}).limit(1000);err(error);return data||[];},
    channel(name,onMsg,onStatus){const ch=sb.channel(name,{config:{broadcast:{self:false,ack:false}}});
      ch.on('broadcast',{event:'m'},m=>onMsg(m&&m.payload));ch.subscribe(st=>onStatus(st));
      return{send:p=>{try{ch.send({type:'broadcast',event:'m',payload:p});}catch(e){}},close:()=>{try{sb.removeChannel(ch);}catch(e){}}};}
  };
  return cloudSupabaseExt(B,cfg,()=>sb,err);
}
/* ─────────── backend: this device only (two browser tabs), for trying online play without a server ─────────── */
function olLocal(){
  const K='gpm_ol_local',S='gpm_ol_local_sess',ld=()=>{try{return JSON.parse(localStorage.getItem(K)||'null')||{users:[],fr:[],m:[],seq:1};}catch(e){return{users:[],fr:[],m:[],seq:1};}},sv=d=>localStorage.setItem(K,JSON.stringify(d));
  const me=()=>{try{return sessionStorage.getItem(S);}catch(e){return null;}},user=id=>{const u=ld().users.find(x=>x.id===id);return u?{id:u.id,email:u.email,user_metadata:{username:u.username}}:null;};
  const tab='t'+Math.random().toString(36).slice(2,9);let auth=null;
  const friendsOf=(d,uid)=>d.fr.filter(f=>f.status==='accepted'&&(f.requester===uid||f.addressee===uid)).map(f=>f.requester===uid?f.addressee:f.requester);
  return cloudLocalExt({kind:'local',
    async init(){return me()?user(me()):null;},onAuth(cb){auth=cb;},
    async usernameFree(n){return!ld().users.some(u=>u.username.toLowerCase()===n.toLowerCase());},
    async signUp(username,email,password){const d=ld();if(d.users.some(u=>u.email===email))throw new Error('That email is already registered');if(!(await this.usernameFree(username)))throw new Error('That username is taken');
      const id='u'+(d.seq++)+'-'+Math.random().toString(36).slice(2,6);d.users.push({id,email,pw:password,username});sv(d);sessionStorage.setItem(S,id);const u=user(id);auth&&auth(u);return{user:u,session:true};},
    async signIn(email,password){const u=ld().users.find(x=>x.email===email&&x.pw===password);if(!u)throw new Error('Invalid login credentials');sessionStorage.setItem(S,u.id);const o=user(u.id);auth&&auth(o);return o;},
    async signOut(){sessionStorage.removeItem(S);auth&&auth(null);},
    async profile(uid){const u=ld().users.find(x=>x.id===uid);return u?{id:u.id,username:u.username}:null;},
    async profiles(ids){return ld().users.filter(u=>ids.includes(u.id)).map(u=>({id:u.id,username:u.username}));},
    async search(q){return ld().users.filter(u=>u.username.toLowerCase().startsWith(q.toLowerCase())).slice(0,12).map(u=>({id:u.id,username:u.username}));},
    async friendships(){const id=me(),d=ld();return d.fr.filter(f=>f.requester===id||f.addressee===id);},
    async addFriend(m,uid){const d=ld();if(d.fr.some(f=>(f.requester===m&&f.addressee===uid)||(f.requester===uid&&f.addressee===m)))throw new Error('You already have a request with this player');d.fr.push({id:d.seq++,requester:m,addressee:uid,status:'pending',created_at:new Date().toISOString()});sv(d);},
    async acceptFriend(id){const d=ld(),f=d.fr.find(x=>x.id===id);if(f&&f.addressee===me())f.status='accepted';sv(d);},
    async removeFriend(id){const d=ld(),u=me();d.fr=d.fr.filter(f=>!(f.id===id&&(f.requester===u||f.addressee===u)));sv(d);},
    async report(row){const d=ld();if(row.host_id!==me())throw new Error('not allowed');const id=d.seq++;d.m.push(Object.assign({id,created_at:new Date().toISOString(),guest_ok:false},row));sv(d);return id;},
    async confirm(id){const d=ld(),m=d.m.find(x=>x.id===id);if(m&&m.guest_id===me())m.guest_ok=true;sv(d);},
    async matches(){const d=ld(),u=me(),vis=new Set([u,...friendsOf(d,u)]);return d.m.filter(m=>vis.has(m.host_id)||vis.has(m.guest_id)).sort((a,b)=>b.id-a.id);},
    channel(name,onMsg,onStatus){let bc=null;try{bc=new BroadcastChannel('gpm-'+name);}catch(e){setTimeout(()=>onStatus('CHANNEL_ERROR'),0);return{send(){},close(){}};}
      bc.onmessage=e=>{const m=e.data;if(m&&m.tab!==tab)onMsg(m.p);};setTimeout(()=>onStatus('SUBSCRIBED'),0);
      return{send:p=>{try{bc.postMessage({tab,p});}catch(e){}},close:()=>{try{bc.close();}catch(e){}}};}
  });
}
async function olBackend(){
  if(OLS.backend)return OLS.backend;
  const c=olCfg();if(!c)return null;
  const B=c.mode==='local'?olLocal():olSupabase(c);
  const u=await B.init();OLS.backend=B;await olSetUser(u);
  B.onAuth(async u=>{if((u&&u.id)!==(OLS.user&&OLS.user.id)){await olSetUser(u);olRender();}});
  return B;
}
async function olSetUser(u){OLS.user=u||null;OLS.profile=null;OLS.friends=null;OLS.matches=null;
  if(u){try{OLS.profile=await OLS.backend.profile(u.id);}catch(e){}if(!OLS.profile&&u.user_metadata&&u.user_metadata.username)OLS.profile={id:u.id,username:u.user_metadata.username};OLS.cloud=null;setTimeout(()=>{try{cloudRefresh();}catch(e){}},0);}}
function olName(){return OLS.profile?pfName(OLS.profile):(OLS.guestName||'Guest');}

/* ─────────── connection between the two players ───────────
   Both join a broadcast channel named after the match code (lobby, signalling and the fallback relay), then open a
   direct WebRTC data channel for the game itself. If the direct link can't be made, the game runs over the relay. */
const NET={ch:null,code:null,role:null,gid:null,peer:null,pc:null,dc:null,dcOpen:false,iceQ:[],lastRx:0,up:true,chunks:{},hb:null,hello:null,sigStart:0};
function netOpen(code,role){netClose();NET.code=code;NET.role=role;NET.gid=olGid();NET.peer=null;NET.lastRx=Date.now();NET.up=true;
  return new Promise((res,rej)=>{let done=false;
    NET.ch=OLS.backend.channel('gpm-'+code,p=>netRx(p,'relay'),st=>{if(st==='SUBSCRIBED'&&!done){done=true;res();}else if((st==='CHANNEL_ERROR'||st==='TIMED_OUT')&&!done){done=true;rej(new Error('Could not reach the match server ('+st+')'));}});
    setTimeout(()=>{if(!done){done=true;rej(new Error('The match server did not answer'));}},12000);});}
function netClose(){clearInterval(NET.hb);NET.hb=null;clearInterval(NET.hello);NET.hello=null;try{NET.dc&&NET.dc.close();}catch(e){}try{NET.pc&&NET.pc.close();}catch(e){}
  NET.dc=null;NET.pc=null;NET.dcOpen=false;NET.iceQ=[];if(NET.ch)NET.ch.close();NET.ch=null;NET.chunks={};}
function netRelay(y,d){if(NET.ch)NET.ch.send({f:NET.gid,to:NET.peer,s:JSON.stringify({y,d})});}
function netSend(y,d){
  const s=JSON.stringify({y,d}),dc=NET.dcOpen&&NET.dc&&NET.dc.readyState==='open'?NET.dc:null,lim=dc?60000:24000;
  const out=s.length>lim?(()=>{const id=Math.random().toString(36).slice(2,9),n=Math.ceil(s.length/lim),a=[];for(let k=0;k<n;k++)a.push(JSON.stringify({y:'~',d:{i:id,n,k,p:s.slice(k*lim,(k+1)*lim)}}));return a;})():[s];
  for(const m of out){if(dc){try{dc.send(m);continue;}catch(e){}}if(NET.ch)NET.ch.send({f:NET.gid,to:NET.peer,s:m});}
}
function netRx(p,via){
  if(!p)return;let m;
  if(via==='relay'){if(p.f===NET.gid)return;if(p.to&&p.to!==NET.gid)return;if(NET.peer&&p.f!==NET.peer){try{const q=JSON.parse(p.s);if(q.y==='hello'&&NET.role==='host')netRelayTo(p.f,'full',1);}catch(e){}return;}
    try{m=JSON.parse(p.s);}catch(e){return;}m.from=p.f;}
  else{try{m=JSON.parse(p);}catch(e){return;}m.from=NET.peer;}
  if(m.y==='~'){const c=m.d,b=NET.chunks[c.i]||(NET.chunks[c.i]={n:c.n,got:0,p:[]});if(b.p[c.k]==null){b.p[c.k]=c.p;b.got++;}if(b.got<b.n)return;delete NET.chunks[c.i];try{const w=JSON.parse(b.p.join(''));w.from=m.from;m=w;}catch(e){return;}}
  NET.lastRx=Date.now();if(!NET.up){NET.up=true;olNetUp(true);}
  olOnMsg(m);
}
function netRelayTo(to,y,d){if(NET.ch)NET.ch.send({f:NET.gid,to,s:JSON.stringify({y,d})});}
function netHeartbeat(){clearInterval(NET.hb);NET.hb=setInterval(()=>{if(!NET.peer)return;netSend('hb',0);
  if(Date.now()-NET.lastRx>9000&&NET.up){NET.up=false;olNetUp(false);}},2000);}
// direct link (WebRTC); signalling messages always travel over the channel
function netRtcSetupDC(dc){NET.dc=dc;dc.onopen=()=>{NET.dcOpen=true;olGdRate();olRender(true);};dc.onclose=()=>{NET.dcOpen=false;olGdRate();olRender(true);};dc.onmessage=e=>netRx(e.data,'dc');}
function netRtcNew(){if(typeof RTCPeerConnection==='undefined')return null;
  const pc=new RTCPeerConnection({iceServers:OL_ICE});NET.pc=pc;NET.iceQ=[];NET.sigStart=Date.now();
  pc.onicecandidate=e=>{if(e.candidate)netRelay('ice',e.candidate.toJSON?e.candidate.toJSON():e.candidate);};
  pc.onconnectionstatechange=()=>{if(['failed','closed'].includes(pc.connectionState)){NET.dcOpen=false;olGdRate();olRender(true);}};
  return pc;}
async function netRtcOffer(){try{const pc=netRtcNew();if(!pc)return;netRtcSetupDC(pc.createDataChannel('g',{ordered:true}));
  await pc.setLocalDescription(await pc.createOffer());netRelay('sdp',pc.localDescription.toJSON?pc.localDescription.toJSON():pc.localDescription);}catch(e){console.warn('webrtc',e);}}
async function netRtcSignal(y,d){
  try{
    if(y==='sdp'){
      if(d.type==='offer'){if(NET.pc){try{NET.pc.close();}catch(e){}}const pc=netRtcNew();if(!pc)return;pc.ondatachannel=e=>netRtcSetupDC(e.channel);
        await pc.setRemoteDescription(d);for(const c of NET.iceQ)try{await pc.addIceCandidate(c);}catch(e){}NET.iceQ=[];
        await pc.setLocalDescription(await pc.createAnswer());netRelay('sdp',pc.localDescription.toJSON?pc.localDescription.toJSON():pc.localDescription);}
      else if(d.type==='answer'&&NET.pc){await NET.pc.setRemoteDescription(d);for(const c of NET.iceQ)try{await NET.pc.addIceCandidate(c);}catch(e){}NET.iceQ=[];}
    }else if(y==='ice'){if(NET.pc&&NET.pc.remoteDescription)await NET.pc.addIceCandidate(d);else NET.iceQ.push(d);}
  }catch(e){console.warn('webrtc',e);}
}
function olLinkLabel(){return NET.dcOpen?'Direct connection':'Relay connection';}

/* ─────────── your team: a Free Practice team, or the varsity squad from one of your career saves ─────────── */
function olFpTeams(){if(!FP.store)fpLoad();return FP.store.teams;}
async function olSaves(){if(!OLS.saves){try{OLS.saves=await svList();}catch(e){OLS.saves=[];}}return OLS.saves;}
// runs fn with a career save as the active game, then restores whatever was loaded before
function olWithSave(data,fn){
  if(!data||!data.G)throw new Error('This save could not be read');
  const keep=G,fpm=window._fpMode;G=data.G;_pIx=null;_sIx=null;_spVer++;window._fpMode=false;
  try{if(!G.players||!G.divisions||!G.myId)throw new Error('This save is missing its team. Load it once in the game, save, then try again.');
    const me=myS();if(!me)throw new Error('Your school is missing from this save');return fn(me);}
  finally{G=keep;_pIx=null;_sIx=null;_spVer++;window._fpMode=fpm;}
}
function olKitPack(s,kind){const u=uniOf(s,kind),kit=Object.assign({glove:u.trim,sleeve:u.jersey},u);
  return{kit,pack:{helmet:kit.helmet,helmetStripe:kit.hstripe,helmetLogo:kit.hstripe,facemask:kit.mask,jersey:kit.jersey,jerseyTrim:kit.trim,pants:kit.pants,pantsStripe:kit.pstripe,belt:'#1d1d22',socks:kit.sock,sockStripe:kit.trim,cleats:kit.cleat,cleatAccent:kit.trim,gloves:kit.glove,number:kit.num,numberTrim:_gdLum(kit.jersey)>.6?null:'#f4f4f4',armSleeve:'skin'}};}
function olSummary(s,top,src){let logo='';try{logo='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(sLogoStandalone(s,72));}catch(e){}
  return{name:s.name,mascot:s.mascot,abbr:(s.abbr||s.name.slice(0,3)).toUpperCase().slice(0,4),c1:s.c1||'#1d3557',c2:s.c2||'#ffffff',ovr:Math.round(top),logo,src};}
// everything the match needs from this device's team: a card for the lobby, its strength, and a builder for Game Day
async function olMyTeam(){
  if(OLS.src==='career'){
    const saves=await olSaves(),m=saves.find(x=>x.id===OLS.saveId)||saves[0];if(!m)throw new Error('There are no career saves on this device yet.');
    OLS.saveId=m.id;if(!OLS.saveData||OLS.saveData.id!==m.id){const j=await svGetData(m.id);if(!j)throw new Error('Save not found');OLS.saveData={id:m.id,d:parseSave(j)};}
    const D=OLS.saveData.d;
    return olWithSave(D,me=>{const top=_gdTop(me);return{sum:olSummary(me,top,`Career · ${m.season} season · ${m.rec}`),top,
      stadium:stadInfo(stadOf(me),me.stadC,me),
      build:(kind,adj)=>olWithSave(D,s=>{_gdTAdj=adj;try{const t=Object.assign(gdTeam(s,kind),{ovr:Math.round(_gdTop(s))});t.kits={};for(const k of['home','away','alt'])t.kits[k]=olKitPack(s,k);return t;}finally{_gdTAdj=0;}})};});
  }
  const A=(olFpTeams(),fpT(OLS.fpId))||olFpTeams()[0];if(!A)throw new Error('Make a team in Free Practice first');OLS.fpId=A.id;
  const top=_gdTop(A),fpm=window._fpMode;
  return{sum:olSummary(A,top,'Free Practice team'),top,stadium:stadInfo(FP.tier||12,FP.store.stadC,A),
    build:(kind,adj)=>{window._fpMode=true;_gdTAdj=adj;try{const t=Object.assign(gdTeam(A,kind),{ovr:Math.round(top)});t.kits={};for(const k of['home','away','alt'])t.kits[k]=olKitPack(A,k);return t;}finally{_gdTAdj=0;window._fpMode=fpm;}}};
}
function olTeamCard(s,label,extra){if(!s)return`<div class="ol-tc ol-tc-empty"><div class="ol-tc-l">${olEsc(label)}</div><div class="ol-tc-w">Waiting for a player…</div></div>`;
  return`<div class="ol-tc"><div class="ol-tc-l">${olEsc(label)}</div>${s.logo?`<img src="${s.logo}" alt="" width="64" height="64">`:''}<div class="ol-tc-n">${olEsc(s.name)} ${olEsc(s.mascot)}</div><div class="ol-tc-s">${olEsc(s.src||'')} · ${s.ovr} OVR</div>${extra||''}</div>`;}

/* ─────────── the lobby ─────────── */
function olCode(){const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';const r=new Uint32Array(6);try{crypto.getRandomValues(r);}catch(e){for(let i=0;i<6;i++)r[i]=Math.random()*1e9;}for(let i=0;i<6;i++)s+=A[r[i]%A.length];return s;}
function olMe(){const p=OLS.profile;return{gid:NET.gid,uid:OLS.user?OLS.user.id:null,name:olName(),un:p?p.username:null,av:p&&p.avatar?p.avatar:null};}
async function olHost(){
  if(OLS.busy)return;OLS.busy=true;olRender();
  try{const B=await olBackend();if(!B)throw new Error('Online play is not set up yet');
    const T=await olMyTeam();const code=olCode();await netOpen(code,'host');
    OLS.lobby={role:'host',code,my:T,me:olMe(),opp:null,oppTeam:null,stage:'wait'};netHeartbeat();
  }catch(e){notify(e.message,'e');OLS.lobby=null;netClose();}
  OLS.busy=false;olRender();
}
async function olJoin(){
  if(OLS.busy)return;const el=document.getElementById('ol-code'),code=(el?el.value:'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  if(code.length!==6){notify('Enter the 6-character match code from your friend','e');return;}
  OLS.busy=true;olRender();
  try{const B=await olBackend();if(!B)throw new Error('Online play is not set up yet');
    const T=await olMyTeam();await netOpen(code,'guest');
    OLS.lobby={role:'guest',code,my:T,me:olMe(),opp:null,oppTeam:null,stage:'joining'};
    const hi=()=>netRelay('hello',{me:OLS.lobby.me,sum:T.sum,top:T.top,inMatch:!!OLS.lobby.live});
    hi();let n=0;clearInterval(NET.hello);NET.hello=setInterval(()=>{if(!OLS.lobby||OLS.lobby.role!=='guest'||OLS.lobby.opp){clearInterval(NET.hello);return;}if(++n>10){clearInterval(NET.hello);notify('No match found with that code. Check it and try again.','e');olLeave();return;}hi();},2000);
    netHeartbeat();
  }catch(e){notify(e.message,'e');OLS.lobby=null;netClose();}
  OLS.busy=false;olRender();
}
function olLeave(){const L=OLS.lobby;if(L&&NET.peer)netSend('bye',1);OLS.lobby=null;netClose();const ov=document.getElementById('gd-ov');if(ov&&_gdCtx&&_gdCtx.kind==='online'){ov.remove();_gdCtx=null;}olRender();}
function olOnMsg(m){
  const L=OLS.lobby;if(!L)return;const y=m.y,d=m.d;
  if(y==='sdp'||y==='ice'){netRtcSignal(y,d);return;}
  if(y!=='g'&&d&&typeof d==='object')try{saveScrub(d);}catch(e){} // the other player's profile, team and setup are made safe before anything shows them
  if(y==='hb')return;
  if(y==='g'){const f=document.getElementById('gd-if');try{if(f&&f.contentWindow&&f.contentWindow.olRecv)f.contentWindow.olRecv(d.t,d.d);}catch(e){}return;}
  if(L.role==='host'){
    if(y==='hello'){
      if(L.opp&&L.opp.me.gid!==m.from){netRelayTo(m.from,'full',1);return;}
      const first=!L.opp;NET.peer=m.from;L.opp={me:d.me,sum:d.sum,top:+d.top||50};
      netSend('welcome',{me:L.me,sum:L.my.sum,top:L.my.top,live:!!L.live});
      if(first||!NET.pc||['failed','closed','disconnected'].includes(NET.pc.connectionState))netRtcOffer();
      if(L.live&&L.gp){netSend('init',{gp:olGuestGP(L.gp),resume:1});setTimeout(()=>olGdPost('resync',1),1200);}
      if(first)notify(`${d.me.name} joined your match`);olRender();return;}
    if(y==='team'){if(!L.opp)return;L.oppTeam=d.team;L.stage='ready';olRender();return;}
    if(y==='bye'){if(L.live){olGdPost('net',{up:false});notify('Your opponent left the match','e');}else{L.opp=null;L.oppTeam=null;NET.peer=null;L.stage='wait';try{NET.pc&&NET.pc.close();}catch(e){}NET.dcOpen=false;olRender();}return;}
  }else{
    if(y==='full'){notify('That match already has two players','e');olLeave();return;}
    if(y==='welcome'){const first=!L.opp;NET.peer=m.from;L.opp={me:d.me,sum:d.sum,top:+d.top||50};clearInterval(NET.hello);
      if(first&&!d.live){const anchor=(L.my.top+L.opp.top)/2;let team;try{team=L.my.build(OLS.uni,Math.round((L.my.top-anchor)*0.5));}catch(e){notify('Could not prepare your team: '+e.message,'e');olLeave();return;}
        team.pick=OLS.uni;netSend('team',{team});L.stage='ready';}
      olRender();return;}
    if(y==='init'){L.gp=d.gp;L.live=true;olLaunch(d.gp);return;}
    if(y==='res'){olShowResult(d,false);return;}
    if(y==='bye'){notify('The host ended the match','e');olLeave();return;}
  }
}
function olNetUp(up){olGdPost('net',{up});olRender(true);}
function olGdPost(t,d){const f=document.getElementById('gd-if');try{if(f&&f.contentWindow&&f.contentWindow.olRecv)f.contentWindow.olRecv(t,d);}catch(e){}}
function olGdRate(){olGdPost('rate',NET.dcOpen?20:10);}
window.olGdSend=function(t,d){if(OLS.lobby&&OLS.lobby.live)netSend('g',{t,d});};
// the guest's team takes a uniform that stands out against the host's jersey
function olPickKit(hostJersey,T){const pref=T.pick||'home',L=_gdLum(hostJersey),diff=k=>Math.abs(_gdLum(T.kits[k].kit.jersey)-L);
  if(T.kits[pref]&&diff(pref)>=0.28)return pref;return['home','away','alt'].filter(k=>T.kits[k]).sort((a,b)=>diff(b)-diff(a))[0]||pref;}
function olGuestGP(gp){return Object.assign({},gp,{online:Object.assign({},gp.online,{role:'guest',me:1})});}
function olKickoff(){
  const L=OLS.lobby;if(!L||L.role!=='host'||!L.oppTeam||L.live)return;
  let t0;const anchor=(L.my.top+L.opp.top)/2;
  try{t0=L.my.build(OLS.uni,Math.round((L.my.top-anchor)*0.5));}catch(e){notify('Could not prepare your team: '+e.message,'e');return;}
  const g=L.oppTeam,k=olPickKit(t0.kit.jersey,g),t1=Object.assign({},g,g.kits[k]);delete t1.kits;delete t1.pick;delete t0.kits;
  const names={};[t0,t1].forEach((T,ti)=>T.players.forEach((p,i)=>{p.mid=(ti+1)*1000+i;names[p.mid]={t:ti,n:`${p.first} ${p.last}`.trim(),pos:p.pos,num:p.num};}));
  const s=L.my.sum,gp={teams:[t0,t1],home:0,stadium:L.my.stadium,ez:_gdDark(s.c1||'#1c3766',.25),ezText:_gdLum(s.c2||'#fff')>.35?(s.c2||'#ffffff'):'#ffffff',
    online:{role:'host',me:0,code:L.code,names:[L.me.name,L.opp.me.name]}};
  try{gp.weather=wxMake((L.my.stadium&&L.my.stadium.st)||'CF',new Date(),(Math.random()*4294967295)>>>0);}catch(e){}
  L.gp=gp;L.names=names;L.live=true;
  netSend('init',{gp:olGuestGP(gp)});olLaunch(gp);
}
function olLaunch(gp){
  window.__GP=gp;_gdCtx={kind:'online'};const f=document.getElementById('ol');if(f)f.classList.add('hid');
  gdLaunch();setTimeout(olGdRate,1500);
}

/* ─────────── after the final whistle: one summary for both players, saved to the records ─────────── */
function olSum(res){
  const L=OLS.lobby,names=L.names||{},st=res.stats||{},gp=L.gp,T=gp.teams;
  const tot=[0,1].map(()=>({passYds:0,passTD:0,passInt:0,rushYds:0,rushTD:0,recYds:0,tackles:0,sacks:0,ints:0,fgm:0}));
  const lines=[];
  for(const mid in st){const nm=names[mid];if(!nm)continue;const s=st[mid],t=tot[nm.t];for(const k in t)t[k]+=s[k]||0;
    const imp=(s.passYds||0)+(s.rushYds||0)+(s.recYds||0)+((s.passTD||0)+(s.rushTD||0)+(s.recTD||0))*20+(s.tackles||0)*8+(s.sacks||0)*20+(s.ints||0)*30;
    if(imp>0)lines.push({t:nm.t,n:nm.n,pos:nm.pos,num:nm.num,s:{passCmp:s.passCmp||0,passAtt:s.passAtt||0,passYds:s.passYds||0,passTD:s.passTD||0,passInt:s.passInt||0,rushAtt:s.rushAtt||0,rushYds:s.rushYds||0,rushTD:s.rushTD||0,rec:s.rec||0,recYds:s.recYds||0,recTD:s.recTD||0,tackles:s.tackles||0,sacks:s.sacks||0,ints:s.ints||0},imp});}
  lines.sort((a,b)=>b.imp-a.imp);
  const team=(i,sm)=>({name:T[i].city,mascot:T[i].name,abbr:T[i].abbr,c1:sm.c1,c2:sm.c2,ovr:T[i].ovr||sm.ovr,logo:sm.logo});
  return{code:L.code,score:res.score,ot:!!res.ot,yds:res.yds||[0,0],tot,lines:lines.slice(0,24).map(x=>{delete x.imp;return x;}),
    users:[gp.online.names[0],gp.online.names[1]],teams:[team(0,L.my.sum),team(1,L.opp.sum)],at:new Date().toISOString()};
}
async function olFinish(res){
  const L=OLS.lobby;if(!L){return;}
  const sum=olSum(res);let mid=null,saved='';
  if(OLS.user&&OLS.backend){try{
      const t=x=>({name:x.name,mascot:x.mascot,abbr:x.abbr,c1:x.c1,c2:x.c2,ovr:x.ovr});
      mid=await OLS.backend.report({code:L.code,host_id:OLS.user.id,guest_id:L.opp.me.uid||null,host_name:L.me.name,guest_name:L.opp.me.name,
        host_team:t(sum.teams[0]),guest_team:t(sum.teams[1]),host_score:sum.score[0]|0,guest_score:sum.score[1]|0,ot:sum.ot,summary:Object.assign({},sum,{teams:sum.teams.map(t)})});
      saved='Saved to your records.';OLS.matches=null;
    }catch(e){saved='Could not save the result: '+e.message;}}
  else saved='Sign in to keep a record of your online games.';
  netSend('res',Object.assign({mid,hostUid:OLS.user?OLS.user.id:null},sum));
  olShowResult(Object.assign({mid},sum),true,saved);
}
async function olShowResult(d,isHost,savedMsg){
  const ov=document.getElementById('gd-ov');if(ov)ov.remove();_gdCtx=null;
  const L=OLS.lobby;if(L){L.live=false;L.done=true;}
  let msg=savedMsg||'';
  if(!isHost){if(d.mid&&OLS.user&&OLS.backend&&L&&L.me.uid===OLS.user.id){try{await OLS.backend.confirm(d.mid);msg='Saved to your records.';OLS.matches=null;}catch(e){msg='Could not confirm the result: '+e.message;}}
    else if(!d.mid)msg='This game was not saved: the host was not signed in.';else msg='Sign in to keep a record of your online games.';}
  const me=isHost?0:1,sc=d.score,won=sc[me]>sc[1-me],tie=sc[0]===sc[1];
  const lead=(k,lab)=>{let b=null;for(const x of d.lines||[])if((x.s[k]||0)>(b?b.s[k]:0))b=x;return b?`<div class="ol-ld"><span>${lab}: #${b.num} ${olEsc(b.n)} <i>${olEsc(d.teams[b.t].mascot)}</i></span><b>${b.s[k]}</b></div>`:'';};
  openMo(`<div class="ol-res"><div class="ol-res-h">${tie?'Tie game':won?'You win!':'You lose'}</div>
    <div class="ol-res-sc">${[0,1].map(i=>`<div>${d.teams[i].logo?`<img src="${d.teams[i].logo}" width="56" height="56" alt="">`:''}<div class="ol-res-t">${olEsc(d.teams[i].mascot)}</div><div class="ol-res-u">${olEsc(d.users[i])}</div><b>${sc[i]}</b></div>`).join('<span>–</span>')}</div>
    ${d.ot?'<div class="ol-res-ot">Final in overtime</div>':''}
    ${lead('passYds','Passing yards')}${lead('rushYds','Rushing yards')}${lead('recYds','Receiving yards')}${lead('tackles','Tackles')}${lead('sacks','Sacks')}${lead('ints','Interceptions')}
    <div class="ol-res-m">${olEsc(msg)}</div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px;flex-wrap:wrap"><button class="bgh" onclick="clo();olTab('stats')">Records</button><button class="btn" onclick="clo();olAfterGame()">Done</button></div></div>`);
}
function olAfterGame(){OLS.lobby=null;netClose();olOpen();}

/* ─────────── records and stats, worked out from the saved games this account can see ─────────── */
function olRecs(rows,friendIds){
  const me=OLS.user&&OLS.user.id,P={},names={};
  const per=uid=>P[uid]||(P[uid]={uid,gp:0,w:0,l:0,t:0,pf:0,pa:0,streak:0,sk:'',best:0,pass:0,rush:0,td:0,int:0,sacks:0,last:[]});
  const H={},REC={big:null,pts:null,yds:null,pass:null,rush:null,recv:null,tds:null};
  const games=rows.filter(r=>r.guest_id&&r.guest_ok).sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));
  for(const r of games){names[r.host_id]=r.host_name;names[r.guest_id]=r.guest_name;
    const S=r.summary||{},sides=[[r.host_id,r.host_score,r.guest_score,0],[r.guest_id,r.guest_score,r.host_score,1]];
    for(const[uid,us,them,ti]of sides){const p=per(uid);p.gp++;p.pf+=us;p.pa+=them;const res=us>them?'W':us<them?'L':'T';
      if(res==='W')p.w++;else if(res==='L')p.l++;else p.t++;
      p.streak=p.sk===res?p.streak+1:1;p.sk=res;if(res==='W')p.best=Math.max(p.best,p.streak);p.last.unshift(res);if(p.last.length>5)p.last.pop();
      const t=(S.tot||[])[ti]||{};p.pass+=t.passYds||0;p.rush+=t.rushYds||0;p.td+=(t.passTD||0)+(t.rushTD||0);p.int+=t.ints||0;p.sacks+=t.sacks||0;
      const op=ti?r.host_id:r.guest_id,hk=uid+'|'+op,h=H[hk]||(H[hk]={w:0,l:0,t:0,pf:0,pa:0,last:null});if(res==='W')h.w++;else if(res==='L')h.l++;else h.t++;h.pf+=us;h.pa+=them;h.last=r;
      const team=(S.teams||[])[ti]||{},who={uid,name:names[uid],team:team.mascot||'',date:r.created_at,opp:names[op],score:`${us}-${them}`};
      const up=(k,v,extra)=>{if(v>0&&(!REC[k]||v>REC[k].v))REC[k]=Object.assign({v},who,extra||{});};
      up('big',us-them);up('pts',us);up('yds',(S.yds||[])[ti]||0);}
    for(const x of S.lines||[]){const uid=x.t===0?r.host_id:r.guest_id,who={uid,name:names[uid],player:`#${x.num} ${x.n}`,date:r.created_at,opp:names[x.t===0?r.guest_id:r.host_id]};
      const up=(k,v)=>{if(v>0&&(!REC[k]||v>REC[k].v))REC[k]=Object.assign({v},who);};
      up('pass',x.s.passYds);up('rush',x.s.rushYds);up('recv',x.s.recYds);up('tds',(x.s.passTD||0)+(x.s.rushTD||0)+(x.s.recTD||0));}
  }
  for(const uid in P)P[uid].name=names[uid]||'';
  const circle=new Set([me,...friendIds]);
  const board=Object.values(P).filter(p=>circle.has(p.uid)).sort((a,b)=>(b.w+b.t/2)/Math.max(1,b.gp)-(a.w+a.t/2)/Math.max(1,a.gp)||b.w-a.w||(b.pf-b.pa)-(a.pf-a.pa));
  return{P,H,REC,board,games,names};
}
async function olLoadSocial(force){
  const B=OLS.backend;if(!B||!OLS.user)return;
  if(OLS.friends&&OLS.matches&&!force)return;
  try{const fr=await B.friendships(),ids=[...new Set(fr.flatMap(f=>[f.requester,f.addressee]))].filter(x=>x!==OLS.user.id),pr=await B.profiles(ids),nm={};for(const p of pr)nm[p.id]=p;
    try{OLS.blocked=B.blocks?await B.blocks(OLS.user.id):[];OLS.blockedP=OLS.blocked.length?await B.profiles(OLS.blocked):[];}catch(e){OLS.blocked=[];OLS.blockedP=[];}
    const bl=new Set(OLS.blocked);
    OLS.friends=fr.map(f=>{const other=f.requester===OLS.user.id?f.addressee:f.requester,P=nm[other];return Object.assign({},f,{other,otherP:P||null,otherName:P?pfName(P):'(player)',mine:f.requester===OLS.user.id});}).filter(f=>!bl.has(f.other));
    try{OLS.shared=B.sharedList?await B.sharedList(OLS.user.id):[];}catch(e){OLS.shared=[];}
    OLS.matches=await B.matches();OLS.statsErr=null;
  }catch(e){OLS.statsErr=e.message;OLS.friends=OLS.friends||[];OLS.matches=OLS.matches||[];}
}

/* ─────────── the Online Play screen ─────────── */
async function olOpen(){
  hideTitle();let el=document.getElementById('ol');if(!el){el=document.createElement('div');el.id='ol';document.body.appendChild(el);}
  el.classList.remove('hid');OLS.hidden=['setup','app'].filter(id=>{const e=document.getElementById(id);if(e&&!e.classList.contains('hid')){e.classList.add('hid');return true;}return false;});
  olFpTeams();if(!OLS.fpId&&FP.store.teams[0])OLS.fpId=FP.store.teams[0].id;
  olRender();
  if(olCfg()&&!OLS.backend){try{await olBackend();}catch(e){OLS.msg=e.message;}olRender();}
  olSaves().then(()=>olRender(true));
}
function olClose(){if(OLS.lobby&&OLS.lobby.live)return;if(OLS.lobby)olLeave();const el=document.getElementById('ol');if(el)el.classList.add('hid');(OLS.hidden||[]).forEach(id=>{const e=document.getElementById(id);if(e)e.classList.remove('hid');});OLS.hidden=[];showTitle(false);}
function olTab(t){OLS.tab=t;const el=document.getElementById('ol');if(!el||el.classList.contains('hid'))olOpen();else olRender();
  if((t==='stats'||t==='friends')&&OLS.user)olLoadSocial(true).then(()=>olRender(true));
  if(t==='acct'&&OLS.user){OLS.saves=null;olSaves().then(()=>cloudRefresh());}}
function olRender(soft){
  const el=document.getElementById('ol');if(!el||el.classList.contains('hid'))return;
  if(soft&&document.activeElement&&el.contains(document.activeElement)&&/INPUT|SELECT/.test(document.activeElement.tagName))return;
  const cfg=olCfg(),u=OLS.user;
  const tabs=[['play','Play'],['friends','Friends'],['stats','Stats & records'],['acct',u?'Account':'Sign in']].map(([k,l])=>`<button class="tab ${OLS.tab===k?'on':''}" onclick="olTab('${k}')">${l}</button>`).join('');
  let body='';
  if(!cfg||OLS.cfgOpen)body=olSetupHtml(cfg);
  else if(OLS.tab==='play')body=olPlayHtml();else if(OLS.tab==='friends')body=olFriendsHtml();else if(OLS.tab==='stats')body=olStatsHtml();else body=olAcctHtml();
  const y=el.scrollTop;
  el.innerHTML=`<div class="fp-wrap"><div class="fp-head"><button class="bgh bsm" onclick="olClose()">Main menu</button><h2>Online Play</h2>
    <span class="fp-sub">${cfg?(cfg.mode==='local'?'Test mode: this device only':OLS.backend?'Connected to your online server':'Connecting to your online server…'):'Not set up yet'}${u?` · signed in as <b>${olEsc(olName())}</b>`:''}</span></div>
    ${cfg&&!OLS.cfgOpen?`<div class="tabs fp-tabs">${tabs}</div>`:''}${OLS.msg?`<div class="ol-note ol-err">${olEsc(OLS.msg)}</div>`:''}${body}</div>`;
  el.scrollTop=y;
}
function olSetupHtml(cfg){
  const c=cfg||{};
  return`<div class="pnl"><div class="ph">Set up online play</div><div class="pb">
    <p class="ol-p">Online play needs a free <b>Supabase</b> project behind your site: it stores accounts, friends and results, and connects two players. The setup guide (ONLINE_SETUP.md) walks through it in about five minutes and includes the database script.</p>
    <p class="ol-p">Best: paste the project URL and key into <code>OL_CONFIG</code> at the top of the game's online code before you upload it, so everyone on your site is connected automatically. For a quick test you can also enter them here (saved on this device only).</p>
    <div class="ol-form"><label>Project URL<input id="ol-url" placeholder="https://abcdefgh.supabase.co" value="${olEsc(c.mode==='supabase'?c.url:'')}" autocomplete="off"></label>
      <label>Publishable (anon) key<input id="ol-key" placeholder="sb_publishable_… or eyJ…" value="${olEsc(c.mode==='supabase'?c.key:'')}" autocomplete="off"></label></div>
    <div class="ol-row"><button class="btn bgn" onclick="olSaveCfg()">Connect</button>${cfg&&!cfg.builtIn?`<button class="bgh" onclick="OLS.cfgOpen=false;olRender()">Cancel</button>`:''}</div>
    <hr class="ol-hr"><p class="ol-p"><b>No server yet?</b> Try online play on this device: open the game in two browser tabs, create a match in one and join it from the other. Accounts and records in test mode stay in this browser.</p>
    <button class="bgh" onclick="olUseLocal()">Use test mode on this device</button></div></div>`;
}
async function olSaveCfg(){const url=(document.getElementById('ol-url').value||'').trim().replace(/\/+$/,''),key=(document.getElementById('ol-key').value||'').trim();
  if(!/^https:\/\/[^\s/]+$/.test(url)||key.length<20){notify('Enter the project URL (https://…supabase.co) and the publishable key','e');return;}
  try{localStorage.setItem('gpm_ol_cfg',JSON.stringify({mode:'supabase',url,key}));}catch(e){}
  OLS.backend=null;OLS.cfgOpen=false;OLS.msg='';olRender();try{await olBackend();notify('Connected');}catch(e){OLS.msg=e.message;}olRender();}
async function olUseLocal(){try{localStorage.setItem('gpm_ol_cfg',JSON.stringify({mode:'local'}));}catch(e){}OLS.backend=null;OLS.cfgOpen=false;OLS.msg='';await olBackend();olRender();}
function olPlayHtml(){
  const L=OLS.lobby,busy=OLS.busy;
  if(L)return olLobbyHtml(L);
  const teams=olFpTeams(),saves=OLS.saves||[];
  const fpOpts=teams.map(t=>`<option value="${t.id}"${t.id===OLS.fpId?' selected':''}>${olEsc(t.name)} ${olEsc(t.mascot)} (${t.ovr})</option>`).join('');
  const svOpts=saves.map(m=>`<option value="${olEsc(m.id)}"${m.id===OLS.saveId?' selected':''}>${olEsc(m.name)} ${olEsc(m.mascot)} · ${m.season} · ${m.rec}</option>`).join('');
  const A=fpT(OLS.fpId),pv=OLS.src==='fp'&&A?`<div class="ol-pick-pv">${sLogo(A,56)}<div><b>${olEsc(A.name)} ${olEsc(A.mascot)}</b><div class="ol-mu">${A.offS} offense · ${A.defS} defense · ${A.ovr} OVR</div></div></div>`:'';
  return`<div class="pnl" style="margin-bottom:14px"><div class="ph">Your team</div><div class="pb">
      <div class="ol-seg"><button class="${OLS.src==='fp'?'btn bbl':'bgh'} bsm" onclick="OLS.src='fp';olRender()">Free Practice team</button><button class="${OLS.src==='career'?'btn bbl':'bgh'} bsm" onclick="OLS.src='career';olRender()">Squad from a career save</button></div>
      ${OLS.src==='fp'?`<label class="ol-lab">Team<select onchange="OLS.fpId=+this.value;olRender()">${fpOpts}</select></label>${pv}<div class="ol-mu">Edit teams, rosters, playbooks and uniforms in Free Practice.</div>`
        :(saves.length?`<label class="ol-lab">Career save<select onchange="OLS.saveId=this.value;OLS.saveData=null;olRender()">${svOpts}</select></label>${(()=>{const m=saves.find(x=>x.id===OLS.saveId)||saves[0];return m?`<div class="ol-pick-pv">${sLogo({name:m.name,mascot:m.mascot,c1:m.c1,c2:m.c2},56)}<div><b>${olEsc(m.name)} ${olEsc(m.mascot)}</b><div class="ol-mu">${olEsc(m.cls||'')} · ${m.season} season · ${m.rec}${m.coach?' · '+olEsc(m.coach):''}</div></div></div>`:'';})()}<div class="ol-mu">Your current varsity roster, ratings, playbooks and uniforms, exactly as they are in that save. The save itself is not changed.</div>`:`<div class="ol-mu">No career saves on this device yet.</div>`)}
      <label class="ol-lab">Uniform<select onchange="OLS.uni=this.value">${[['home','Home'],['away','Away'],['alt','Alternate']].map(([k,l])=>`<option value="${k}"${OLS.uni===k?' selected':''}>${l}</option>`).join('')}</select></label>
      ${OLS.user?'':`<label class="ol-lab">Your name<input id="ol-gname" maxlength="20" value="${olEsc(OLS.guestName||'')}" placeholder="Guest" oninput="OLS.guestName=this.value.trim().slice(0,20)"></label><div class="ol-mu">Playing without an account works, but only games between two signed-in players are saved to records.</div>`}
    </div></div>
    <div class="ol-cols">
      <div class="pnl"><div class="ph">Host a match</div><div class="pb"><p class="ol-p">Get a code and send it to your friend. You are the home team and the game runs on your device.</p>
        <button class="btn bgn" ${busy?'disabled':''} onclick="olHost()">Create match</button></div></div>
      <div class="pnl"><div class="ph">Join a match</div><div class="pb"><p class="ol-p">Enter the code your friend sent you.</p>
        <div class="ol-row"><input id="ol-code" class="ol-code-in" maxlength="7" placeholder="ABC123" autocapitalize="characters" autocomplete="off" onkeydown="if(event.key==='Enter')olJoin()"><button class="btn bbl" ${busy?'disabled':''} onclick="olJoin()">Join</button></div></div></div>
    </div>`;
}
function olLobbyHtml(L){
  const host=L.role==='host',meS=L.my.sum,opS=L.opp?L.opp.sum:null;
  const status=host?(!L.opp?'Waiting for your friend to join with the code…':!L.oppTeam?`${olEsc(L.opp.me.name)} joined. Getting their team ready…`:`${olEsc(L.opp.me.name)} is ready.`)
    :(!L.opp?'Looking for the match…':'Connected. Waiting for the host to kick off…');
  return`<div class="pnl"><div class="ph">${host?'Your match':'Joined match'} <span class="ol-mu" style="font-weight:600;text-transform:none">${L.opp?olLinkLabel():''}</span></div><div class="pb">
    ${host?`<div class="ol-codebox"><div class="ol-mu">Match code</div><div class="ol-codev">${L.code}</div><button class="bgh bsm" onclick="olCopy('${L.code}')">Copy code</button></div>`:`<div class="ol-mu" style="text-align:center">Match ${L.code}</div>`}
    <div class="ol-vs">${olTeamCard(host?meS:opS,host?`${L.me.name} (home)`:L.opp?`${L.opp.me.name} (home)`:'Home')}<div class="ol-vsx">VS</div>${olTeamCard(host?opS:meS,host?(L.opp?`${L.opp.me.name} (away)`:'Away'):`${L.me.name} (away)`)}</div>
    ${L.opp?`<div class="ol-players">${pfTag({username:L.me.un||L.me.name,display_name:L.me.name,avatar:L.me.av},30)}<span class="ol-mu">vs</span>${pfTag({username:L.opp.me.un||L.opp.me.name,display_name:L.opp.me.name,avatar:L.opp.me.av},30)}</div>`:''}
    <div class="ol-status">${status}</div>
    <div class="ol-row" style="justify-content:center">${host?`<button class="btn bgn" ${L.oppTeam?'':'disabled'} onclick="olKickoff()">Kick off</button>`:''}<button class="bgh" onclick="olLeave()">Leave</button></div>
    <div class="ol-mu" style="text-align:center;margin-top:8px">Keep this screen open on both devices. If the game closes for one player, rejoin with the same code to pick up where you left off.</div></div></div>`;
}
function olCopy(t){try{navigator.clipboard.writeText(t).then(()=>notify('Code copied'),()=>notify('Code: '+t));}catch(e){notify('Code: '+t);}}
function olNeedSignIn(what){return`<div class="pnl"><div class="pb"><p class="ol-p">Sign in to ${what}.</p><button class="btn" onclick="olTab('acct')">Sign in or create an account</button></div></div>`;}
function olFriendsHtml(){
  if(!OLS.user)return olNeedSignIn('add friends and see your records against them');
  const F=OLS.friends;if(!F)return`<div class="ol-note">Loading…</div>`;
  const R=olRecs(OLS.matches||[],F.filter(f=>f.status==='accepted').map(f=>f.other)),me=OLS.user.id;
  const inc=F.filter(f=>f.status==='pending'&&!f.mine),out=F.filter(f=>f.status==='pending'&&f.mine),acc=F.filter(f=>f.status==='accepted');
  const h2h=o=>{const h=R.H[me+'|'+o];return h?`${h.w}-${h.l}${h.t?'-'+h.t:''}`:'0-0';};
  return`${OLS.statsErr?`<div class="ol-note ol-err">${olEsc(OLS.statsErr)}</div>`:''}
    <div class="pnl" style="margin-bottom:14px"><div class="ph">Add a friend</div><div class="pb"><div class="ol-row"><input id="ol-fq" placeholder="Username" maxlength="20" onkeydown="if(event.key==='Enter')olFind()"><button class="btn bsm" onclick="olFind()">Search</button></div><div id="ol-fres"></div></div></div>
    ${inc.length?`<div class="pnl" style="margin-bottom:14px"><div class="ph">Friend requests</div><div class="pb">${inc.map(f=>`<div class="ol-fr">${pfTag(f.otherP||{username:f.otherName})}<span><button class="btn bgn bsm" onclick="olFriendAct('accept',${f.id})">Accept</button> <button class="bgh bsm" onclick="olFriendAct('remove',${f.id})">Decline</button> <button class="bgh bsm" onclick="olBlock('${olEsc(f.other)}',${f.id})">Block</button></span></div>`).join('')}</div></div>`:''}
    ${acc.length?`<div class="pnl" style="margin-bottom:14px"><div class="ph">Friends: share and safety</div><div class="pb">${acc.map(f=>`<div class="ol-fr">${pfTag(f.otherP||{username:f.otherName},22)}<span><button class="btn bsm" onclick="shareOpen('${olEsc(f.other)}')">Send a save</button> <button class="bgh bsm" onclick="olReport('${olEsc(f.other)}')">Report</button> <button class="bgh bsm" onclick="olBlock('${olEsc(f.other)}',${f.id})">Block</button></span></div>`).join('')}</div></div>`:''}
    <div class="pnl" style="margin-bottom:14px"><div class="ph">Friends <span class="ol-mu">${acc.length}</span></div><div class="pb">${acc.length?`<table class="ol-t"><thead><tr><th>Player</th><th>Your record vs them</th><th>Their record</th><th></th></tr></thead><tbody>${acc.map(f=>{const p=R.P[f.other];return`<tr><td>${pfTag(f.otherP||{username:f.otherName})}${f.otherP&&f.otherP.bio?`<div class="ol-mu pf-bio-s">${olEsc(f.otherP.bio)}</div>`:''}</td><td>${h2h(f.other)}</td><td>${p?`${p.w}-${p.l}${p.t?'-'+p.t:''}`:'0-0'}</td><td style="text-align:right"><button class="bgh bsm" onclick="if(confirm('Remove this friend?'))olFriendAct('remove',${f.id})">Remove</button></td></tr>`;}).join('')}</tbody></table>`:'<div class="ol-mu">No friends yet. Search for a username above.</div>'}</div></div>
    ${out.length?`<div class="pnl"><div class="ph">Sent requests</div><div class="pb">${out.map(f=>`<div class="ol-fr"><span>${olEsc(f.otherName)} <i class="ol-mu">pending</i></span><button class="bgh bsm" onclick="olFriendAct('remove',${f.id})">Cancel</button></div>`).join('')}</div></div>`:''}`;
}
async function olFind(){const q=(document.getElementById('ol-fq').value||'').trim(),box=document.getElementById('ol-fres');if(q.length<2){box.innerHTML='<div class="ol-mu">Type at least 2 letters.</div>';return;}
  try{const r=(await OLS.backend.search(q)).filter(p=>p.id!==OLS.user.id),known=new Set((OLS.friends||[]).map(f=>f.other));
    const bl=new Set(OLS.blocked||[]),r2=r.filter(p=>!bl.has(p.id));
    box.innerHTML=r2.length?r2.map(p=>`<div class="ol-fr">${pfTag(p)}<span>${known.has(p.id)?'<span class="ol-mu">already added</span>':`<button class="btn bsm" onclick="olFriendAdd('${olEsc(p.id)}',this)">Add friend</button>`} <button class="bgh bsm" onclick="olReport('${olEsc(p.id)}')">Report</button></span></div>`).join(''):'<div class="ol-mu">No player with that name.</div>';}
  catch(e){box.innerHTML=`<div class="ol-mu">${olEsc(e.message)}</div>`;}}
async function olFriendAdd(id,b){try{b.disabled=true;await OLS.backend.addFriend(OLS.user.id,id);notify('Friend request sent');await olLoadSocial(true);olRender();}catch(e){notify(e.message,'e');b.disabled=false;}}
async function olFriendAct(a,id){try{if(a==='accept')await OLS.backend.acceptFriend(id);else await OLS.backend.removeFriend(id);await olLoadSocial(true);olRender();}catch(e){notify(e.message,'e');}}
function olStatsHtml(){
  if(!OLS.user)return olNeedSignIn('see your online record and stats');
  if(!OLS.matches)return`<div class="ol-note">Loading…</div>`;
  const fr=(OLS.friends||[]).filter(f=>f.status==='accepted'),R=olRecs(OLS.matches,fr.map(f=>f.other)),me=OLS.user.id,P=R.P[me];
  const rec=p=>p?`${p.w}-${p.l}${p.t?'-'+p.t:''}`:'0-0',pct=p=>p&&p.gp?((p.w+p.t/2)/p.gp).toFixed(3).replace(/^0/,''):'.000',dt=s=>{try{return new Date(s).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});}catch(e){return'';}};
  const card=(l,v,s)=>`<div class="ol-kpi"><div class="ol-kpi-v">${v}</div><div class="ol-kpi-l">${l}</div>${s?`<div class="ol-mu">${s}</div>`:''}</div>`;
  const RL=[['big','Biggest win','pts margin'],['pts','Most points in a game','pts'],['yds','Most team yards','yds'],['pass','Passing yards, one player','yds'],['rush','Rushing yards, one player','yds'],['recv','Receiving yards, one player','yds'],['tds','Touchdowns, one player','TD']];
  const mine=R.games.filter(g=>g.host_id===me||g.guest_id===me).slice(-15).reverse();
  const unconf=(OLS.matches||[]).filter(m=>(m.host_id===me||m.guest_id===me)&&m.guest_id&&!m.guest_ok).length;
  return`${OLS.statsErr?`<div class="ol-note ol-err">${olEsc(OLS.statsErr)}</div>`:''}
    <div class="pnl" style="margin-bottom:14px"><div class="ph">Your online record</div><div class="pb"><div class="ol-kpis">
      ${card('Record',rec(P),P?pct(P)+' win pct':'')}${card('Points',P?`${P.pf}-${P.pa}`:'0-0','for / against')}${card('Streak',P?P.streak+P.sk:'–',P?'best win streak '+P.best:'')}
      ${card('Passing yards',P?P.pass:0)}${card('Rushing yards',P?P.rush:0)}${card('Touchdowns',P?P.td:0)}${card('Interceptions',P?P.int:0,'by your defense')}${card('Sacks',P?P.sacks:0)}</div>
      ${unconf?`<div class="ol-mu" style="margin-top:8px">${unconf} game${unconf>1?'s are':' is'} waiting for the other player to confirm and is not counted yet.</div>`:''}</div></div>
    <div class="pnl" style="margin-bottom:14px"><div class="ph">Standings: you and your friends</div><div class="pb">${R.board.length?`<div style="overflow-x:auto"><table class="ol-t"><thead><tr><th>#</th><th>Player</th><th>W-L-T</th><th>Pct</th><th>PF</th><th>PA</th><th>Streak</th><th>Last 5</th></tr></thead><tbody>
      ${R.board.map((p,i)=>`<tr${p.uid===me?' class="ol-me"':''}><td>${i+1}</td><td>${(()=>{const P=p.uid===me?OLS.profile:((OLS.friends||[]).find(f=>f.other===p.uid)||{}).otherP;return P?pfTag(P,22):`<b>${olEsc(p.name)}</b>`;})()}</td><td>${rec(p)}</td><td>${pct(p)}</td><td>${p.pf}</td><td>${p.pa}</td><td>${p.streak}${p.sk}</td><td>${p.last.join(' ')}</td></tr>`).join('')}</tbody></table></div>`:'<div class="ol-mu">Play a friend to start the standings.</div>'}</div></div>
    <div class="pnl" style="margin-bottom:14px"><div class="ph">Head to head</div><div class="pb">${fr.length?`<table class="ol-t"><thead><tr><th>Opponent</th><th>Your record</th><th>Points</th><th>Last meeting</th></tr></thead><tbody>${fr.map(f=>{const h=R.H[me+'|'+f.other];const lm=h&&h.last;return`<tr><td>${pfTag(f.otherP||{username:f.otherName},22)}</td><td>${h?`${h.w}-${h.l}${h.t?'-'+h.t:''}`:'0-0'}</td><td>${h?`${h.pf}-${h.pa}`:'–'}</td><td>${lm?`${dt(lm.created_at)} · ${lm.host_id===me?lm.host_score+'-'+lm.guest_score:lm.guest_score+'-'+lm.host_score}`:'–'}</td></tr>`;}).join('')}</tbody></table>`:'<div class="ol-mu">Add friends to compare records.</div>'}</div></div>
    <div class="pnl" style="margin-bottom:14px"><div class="ph">Records among you and your friends</div><div class="pb"><table class="ol-t"><tbody>${RL.map(([k,l,u])=>{const r=R.REC[k];return`<tr><td>${l}</td><td>${r?`<b>${r.v} ${u}</b>`:'–'}</td><td>${r?`${olEsc(r.name)}${r.player?' · '+olEsc(r.player):''}${r.opp?' vs '+olEsc(r.opp):''}${r.score?' ('+r.score+')':''}`:''}</td><td class="ol-mu">${r?dt(r.date):''}</td></tr>`;}).join('')}</tbody></table></div></div>
    <div class="pnl"><div class="ph">Recent games</div><div class="pb">${mine.length?`<table class="ol-t"><tbody>${mine.map(g=>{const h=g.host_id===me,us=h?g.host_score:g.guest_score,th=h?g.guest_score:g.host_score,w=us>th?'W':us<th?'L':'T',tm=(h?g.host_team:g.guest_team)||{},ot=(h?g.guest_team:g.host_team)||{};
      return`<tr><td class="ol-${w}">${w}</td><td>${us}-${th}${g.ot?' (OT)':''}</td><td>${olEsc(tm.mascot||'')} vs ${olEsc(h?g.guest_name:g.host_name)}'s ${olEsc(ot.mascot||'')}</td><td class="ol-mu">${dt(g.created_at)}</td></tr>`;}).join('')}</tbody></table>`:'<div class="ol-mu">No saved games yet.</div>'}
      <div style="margin-top:10px"><button class="bgh bsm" onclick="olLoadSocial(true).then(()=>olRender())">Refresh</button></div></div></div>`;
}
function olAcctHtml(){
  const c=olCfg(),srv=`<div class="ol-mu" style="margin-top:12px">${c.mode==='local'?'Test mode: accounts and records live in this browser only.':'Online server: '+olEsc(c.url.replace(/^https:\/\//,''))}${c.builtIn?'':` · <a href="#" onclick="OLS.cfgOpen=true;olRender();return false">change</a>`}</div>`;
  if(OLS.user)return pfEditHtml()+cloudAcctHtml()+sharedInHtml()+`<div class="pnl" style="margin-bottom:14px"><div class="ph">Account</div><div class="pb"><p class="ol-p">Signed in as ${pfTag(OLS.profile||{username:olName()},24)}${OLS.user.email?` (${olEsc(OLS.user.email)})`:''}.</p><div class="ol-row"><button class="bgh" onclick="olSignOut()">Sign out</button><button class="bgh" onclick="privacyOpen()">Privacy policy</button><button class="bgh" onclick="termsOpen()">Terms of use</button></div>${srv}</div></div>
    ${blockedHtml()}
    <div class="pnl" style="border-color:var(--rd)"><div class="ph" style="color:var(--rd)">Delete account</div><div class="pb"><p class="ol-p">Permanently deletes your account, profile, friends list, the saves on your account and the saves you sent or received. Saves on this device stay. This cannot be undone.</p><button class="btn" style="background:var(--rd);border-color:var(--rd)" onclick="olDeleteAccount()">Delete my account</button></div></div>`;
  const up=OLS.authMode==='up';
  return`<div class="pnl"><div class="ph">${up?'Create an account':'Sign in'}</div><div class="pb">
    <div class="ol-form">${up?`<label>Username<input id="ol-un" maxlength="20" autocomplete="username" placeholder="3-20 letters, numbers or _"></label>`:''}
      <label>Email<input id="ol-em" type="email" autocomplete="email"></label><label>Password<input id="ol-pw" type="password" autocomplete="${up?'new-password':'current-password'}" placeholder="${up?'at least 8 characters':''}" onkeydown="if(event.key==='Enter')olAuth()"></label>${up?`<label style="display:flex;align-items:flex-start;gap:8px;font-weight:600"><input id="ol-tos" type="checkbox" style="width:auto;margin-top:3px"><span>I agree to the <a href="#" onclick="termsOpen();return false">Terms of use</a>: no offensive or abusive content.</span></label>`:''}</div>
    <div class="ol-row"><button class="btn bgn" ${OLS.busy?'disabled':''} onclick="olAuth()">${up?'Create account':'Sign in'}</button><button class="bgh" onclick="OLS.authMode='${up?'in':'up'}';olRender()">${up?'I already have an account':'Create an account'}</button></div>
    <p class="ol-mu">Your username is what friends search for. Your email is only used to sign in. <a href="#" onclick="privacyOpen();return false">Privacy policy</a> · <a href="#" onclick="termsOpen();return false">Terms of use</a></p>${srv}</div></div>`;
}
async function olAuth(){
  const up=OLS.authMode==='up',v=id=>(document.getElementById(id)||{}).value||'',em=v('ol-em').trim(),pw=v('ol-pw'),un=v('ol-un').trim();
  if(up&&!/^[A-Za-z0-9_]{3,20}$/.test(un)){notify('Username: 3 to 20 letters, numbers or _','e');return;}
  if(up&&pfBad(un)){notify('Please pick a different username.','e');return;}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){notify('Enter a valid email','e');return;}
  if(pw.length<(up?8:1)){notify(up?'Use at least 8 characters for the password':'Enter your password','e');return;}
  if(up&&!(document.getElementById('ol-tos')||{}).checked){notify('Please agree to the Terms of use to create an account','e');return;}
  OLS.busy=true;olRender();
  try{const B=await olBackend();
    if(up){if(!(await B.usernameFree(un)))throw new Error('That username is taken');const r=await B.signUp(un,em,pw);
      if(!r.session){notify('Account created. Check your email and tap the link to confirm it, then sign in.');OLS.authMode='in';}
      else{await olSetUser(r.user);notify('Welcome, '+olName()+'!');OLS.tab='play';}}
    else{const u=await B.signIn(em,pw);await olSetUser(u);notify('Signed in as '+olName());OLS.tab='play';}
  }catch(e){notify(e.message,'e');}
  OLS.busy=false;olRender();
}
async function olSignOut(){try{await OLS.backend.signOut();}catch(e){}await olSetUser(null);OLS.cloud=null;OLS.pfEdit=null;olRender();try{ttRefreshCloud();}catch(e){}}
/*<cloud>*/
