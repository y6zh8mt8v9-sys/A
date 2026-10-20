/* ═══════════ v2.13 player profiles and saves on your account ═══════════
   Profiles: a display name, an emblem avatar in your own colors, a short bio and a home state.
   Saves: career saves are gzip-compressed on the device and kept in a private Supabase Storage folder that
   only you can read (bucket "saves", folder = your user id). A small table lists them so the list loads fast. */
const PF_COLS='id,username,display_name,avatar,bio,home_state',PF_BASE='id,username';
const AV_COLORS=['#c8102e','#e35205','#f2a900','#ffd100','#2e7d32','#00843d','#006747','#00a3ad','#0072ce','#1d428a','#002244','#4b2e83','#7d2248','#a6192e','#5c4033','#8a8d8f','#111111','#ffffff'];
function avMascots(){if(avMascots._l)return avMascots._l;const t=s=>s.replace(/\b\w/g,c=>c.toUpperCase());avMascots._l=Object.keys(_LK).filter(k=>/^[a-z][a-z .'-]+$/.test(k)).map(t).sort();return avMascots._l;}
function pfName(p){return p?(p.display_name&&p.display_name.trim()?p.display_name.trim():p.username):'';}
function pfHash(s){let h=7;for(const c of String(s||''))h=(h*31+c.charCodeAt(0))>>>0;return h;}
// the avatar: your chosen emblem in your colors, or your initial on a colored disc until you pick one
function pfAvatar(p,sz){sz=sz||32;if(!p)return'';const a=p.avatar&&typeof p.avatar==='object'?p.avatar:null,nm=pfName(p)||'?';
  if(a&&a.m){try{return`<span class="pf-av" style="width:${sz}px;height:${sz}px">${sLogo({name:nm,mascot:a.m,c1:a.c1||'#1d428a',c2:a.c2||'#ffffff'},sz)}</span>`;}catch(e){}}
  const c=AV_COLORS[pfHash(p.username||nm)%10];
  return`<span class="pf-av pf-ini" style="width:${sz}px;height:${sz}px;background:${c};font-size:${Math.round(sz*0.46)}px">${olEsc(nm.slice(0,1).toUpperCase())}</span>`;}
function pfTag(p,sz){if(!p)return'';const dn=pfName(p);return`<span class="pf-tag">${pfAvatar(p,sz||26)}<span><b>${olEsc(dn)}</b>${p.display_name&&p.display_name.trim()&&p.display_name.trim()!==p.username?` <span class="ol-mu">@${olEsc(p.username)}</span>`:''}</span></span>`;}
function pfClean(o){const out={};
  if(o.display_name!=null){out.display_name=String(o.display_name).replace(/[\u0000-\u001f<>]/g,'').trim().slice(0,24)||null;if(out.display_name&&pfBad(out.display_name))out.display_name=null;}
  if(o.bio!=null&&pfBad(o.bio))o.bio='';
  if(o.bio!=null)out.bio=String(o.bio).replace(/[\u0000-\u0009\u000b-\u001f<>]/g,'').trim().slice(0,120)||null;
  if(o.home_state!=null)out.home_state=ST_ORDER.includes(o.home_state)?o.home_state:null;
  if(o.avatar!=null){const a=o.avatar,hex=/^#[0-9a-f]{6}$/i;out.avatar=a&&a.m?{m:String(a.m).slice(0,30),c1:hex.test(a.c1)?a.c1:'#1d428a',c2:hex.test(a.c2)?a.c2:'#ffffff'}:null;}
  return out;}

/* ---- gzip on the device (falls back to plain text in very old browsers) ---- */
async function cgZip(str){if(typeof CompressionStream==='undefined')return{blob:new Blob([str],{type:'application/json'}),enc:'raw'};
  const cs=new Blob([str]).stream().pipeThrough(new CompressionStream('gzip'));return{blob:await new Response(cs).blob(),enc:'gzip'};}
async function cgUnzip(blob,enc){if(enc==='raw'||typeof DecompressionStream==='undefined')return await blob.text();
  const ds=blob.stream().pipeThrough(new DecompressionStream('gzip'));return await new Response(ds).text();}

/* ---- backend pieces, added to both backends ---- */
function cloudSupabaseExt(B,cfg,getSb,err){
  const miss=e=>e&&/column .* does not exist|42703|PGRST204|cloud_saves|Bucket not found|bucket/i.test((e.message||'')+' '+(e.code||'')+' '+(e.error||''));
  const NEED='Your online database needs the latest update: run the new supabase_setup.sql in the Supabase SQL Editor (it keeps all your data).';
  const sel=async(q)=>{const sb=getSb();let r=await q(sb.from('profiles').select(PF_COLS));if(r.error&&miss(r.error)){OLS.pfOld=true;r=await q(sb.from('profiles').select(PF_BASE));}err(r.error);return r.data;};
  B.profile=async uid=>await sel(x=>x.eq('id',uid).maybeSingle());
  B.profiles=async ids=>ids.length?(await sel(x=>x.in('id',ids)))||[]:[];
  B.search=async q=>(await sel(x=>x.ilike('username',q.replace(/[%_\\]/g,'\\$&')+'%').limit(12)))||[];
  B.updateProfile=async(uid,patch)=>{const{error}=await getSb().from('profiles').update(pfClean(patch)).eq('id',uid);if(error&&miss(error))throw new Error(NEED);err(error);};
  B.cloudList=async uid=>{const{data,error}=await getSb().from('cloud_saves').select('id,meta,size,enc,updated_at').eq('user_id',uid).order('updated_at',{ascending:false});if(error&&miss(error))throw new Error(NEED);err(error);return data||[];};
  B.cloudPut=async(uid,id,meta,str)=>{const z=await cgZip(str),sb=getSb();
    const up=await sb.storage.from('saves').upload(`${uid}/${id}.save`,z.blob,{upsert:true,contentType:'application/octet-stream',cacheControl:'0'});
    if(up.error){if(miss(up.error)||/not found|row-level|security/i.test(up.error.message||''))throw new Error(/too large|exceeded|maximum/i.test(up.error.message||'')?'This save is too big for your storage plan.':NEED);err(up.error);}
    const{error}=await sb.from('cloud_saves').upsert({user_id:uid,id,meta,size:z.blob.size,enc:z.enc,updated_at:new Date().toISOString()},{onConflict:'user_id,id'});if(error&&miss(error))throw new Error(NEED);err(error);return z.blob.size;};
  B.cloudGet=async(uid,id,enc)=>{const{data,error}=await getSb().storage.from('saves').download(`${uid}/${id}.save`);if(error)throw new Error(error.message||'Could not download the save');return await cgUnzip(data,enc);};
  B.cloudDel=async(uid,id)=>{const sb=getSb();await sb.storage.from('saves').remove([`${uid}/${id}.save`]);const{error}=await sb.from('cloud_saves').delete().eq('user_id',uid).eq('id',id);err(error);};
  // v2.14: delete your account, block and report players, send saves to friends
  const NEED14='Your online database needs the latest update: run the new supabase_setup.sql in the Supabase SQL Editor (it keeps all your data).',
    miss14=e=>e&&/does not exist|42P01|42883|PGRST20[0-9]|schema cache|shared_saves|blocks|reports|delete_my_account|Bucket not found|bucket/i.test((e.message||'')+' '+(e.code||'')+' '+(e.error||''));
  B.sharedList=async uid=>{const{data,error}=await getSb().from('shared_saves').select('id,sender,recipient,meta,path,enc,size,created_at').order('created_at',{ascending:false}).limit(100);if(error&&miss14(error))return[];err(error);return data||[];};
  B.sharedGet=async row=>{const{data,error}=await getSb().storage.from('shared').download(row.path);if(error)throw new Error(error.message||'Could not download the save');return await cgUnzip(data,row.enc);};
  B.sharedDel=async row=>{const sb=getSb();await sb.storage.from('shared').remove([row.path]);const{error}=await sb.from('shared_saves').delete().eq('id',row.id);err(error);};
  B.shareSave=async(uid,to,meta,str)=>{const z=await cgZip(str),sb=getSb(),path=`${to}/${uid}/${Date.now().toString(36)}.save`;
    const up=await sb.storage.from('shared').upload(path,z.blob,{upsert:false,contentType:'application/octet-stream',cacheControl:'0'});
    if(up.error){if(miss14(up.error)||/row-level|security/i.test(up.error.message||''))throw new Error(/too large|exceeded|maximum/i.test(up.error.message||'')?'This save is too big to send.':NEED14);err(up.error);}
    const{error}=await sb.from('shared_saves').insert({sender:uid,recipient:to,meta,path,enc:z.enc,size:z.blob.size});
    if(error){try{await sb.storage.from('shared').remove([path]);}catch(e){}if(miss14(error))throw new Error(NEED14);err(error);}};
  B.blocks=async uid=>{const{data,error}=await getSb().from('blocks').select('blocked').eq('blocker',uid);if(error&&miss14(error))return[];err(error);return(data||[]).map(r=>r.blocked);};
  B.block=async(uid,other)=>{const{error}=await getSb().from('blocks').insert({blocker:uid,blocked:other});if(error&&miss14(error))throw new Error(NEED14);if(error&&!/duplicate/i.test(error.message||''))err(error);};
  B.unblock=async(uid,other)=>{const{error}=await getSb().from('blocks').delete().eq('blocker',uid).eq('blocked',other);err(error);};
  B.reportUser=async(uid,other,reason)=>{const{error}=await getSb().from('reports').insert({reporter:uid,reported:other,reason});if(error&&miss14(error))throw new Error(NEED14);err(error);};
  const NEED15='Your online database needs the latest update for community teams: run the new supabase_setup.sql in the Supabase SQL Editor (it keeps all your data).',
    miss15=e=>e&&/does not exist|42P01|42883|PGRST20[0-9]|schema cache|community/i.test((e.message||'')+' '+(e.code||''));
  B.commList=async sort=>{const{data,error}=await getSb().from('community_teams').select('id,owner,username,name,ovr,downloads,created_at').order(sort==='top'?'downloads':'created_at',{ascending:false}).limit(60);if(error&&miss15(error))throw new Error(NEED15);err(error);return data||[];};
  B.commGet=async id=>{const sb=getSb();const{data,error}=await sb.from('community_teams').select('data').eq('id',id).maybeSingle();err(error);if(!data)throw new Error('That team was removed.');try{await sb.rpc('community_download',{tid:id});}catch(e){}return data.data;};
  B.commPublish=async(uid,username,name,ovr,data)=>{const{error}=await getSb().from('community_teams').insert({owner:uid,username,name,ovr,data});if(error&&miss15(error))throw new Error(NEED15);if(error&&/row-level|security/i.test(error.message||''))throw new Error('You can publish up to 20 teams. Remove one first.');err(error);};
  B.commDel=async id=>{const{error}=await getSb().from('community_teams').delete().eq('id',id);err(error);};
  // v2.16 community worlds
  const NEED16='Your online database needs the update for Community Creations: run the new supabase_setup.sql in the Supabase SQL Editor (it keeps all your data).',
    miss16=e=>e&&/does not exist|42P01|42883|PGRST20[0-9]|schema cache|community_worlds/i.test((e.message||'')+' '+(e.code||''));
  B.worldList=async sort=>{const{data,error}=await getSb().from('community_worlds').select('id,owner,username,name,info,downloads,created_at').order(sort==='top'?'downloads':'created_at',{ascending:false}).limit(60);if(error&&miss16(error))throw new Error(NEED16);err(error);return data||[];};
  B.worldGet=async id=>{const sb=getSb();const{data,error}=await sb.from('community_worlds').select('data').eq('id',id).maybeSingle();err(error);if(!data)throw new Error('That world was removed.');try{await sb.rpc('community_world_download',{wid:id});}catch(e){}return data.data;};
  B.worldPublish=async(uid,username,name,info,data)=>{const{error}=await getSb().from('community_worlds').insert({owner:uid,username,name,info,data});if(error&&miss16(error))throw new Error(NEED16);if(error&&/row-level|security/i.test(error.message||''))throw new Error('You can publish up to 10 worlds. Remove one first.');err(error);};
  B.worldDel=async id=>{const{error}=await getSb().from('community_worlds').delete().eq('id',id);err(error);};
  // community leagues: whole career saves (every team, player and record), stored like saves sent to friends
  const NEED17='Your online database needs the latest update for community leagues: run the new supabase_setup.sql in the Supabase SQL Editor (it keeps all your data).',
    miss17=e=>e&&/does not exist|42P01|42883|PGRST20[0-9]|schema cache|community_leagues|bucket not found/i.test((e.message||'')+' '+(e.code||''));
  B.leagueList=async sort=>{const{data,error}=await getSb().from('community_leagues').select('id,owner,username,name,info,path,enc,size,downloads,created_at').order(sort==='top'?'downloads':'created_at',{ascending:false}).limit(60);if(error&&miss17(error))throw new Error(NEED17);err(error);return data||[];};
  B.leagueGet=async row=>{const sb=getSb(),{data,error}=await sb.storage.from('community').download(row.path);if(error)throw new Error(error.message||'Could not download the league');try{await sb.rpc('community_league_download',{lid:row.id});}catch(e){}return await cgUnzip(data,row.enc);};
  B.leaguePublish=async(uid,username,name,info,str)=>{const z=await cgZip(str),sb=getSb(),path=`${uid}/${Date.now().toString(36)}.save`;
    const up=await sb.storage.from('community').upload(path,z.blob,{upsert:false,contentType:'application/octet-stream',cacheControl:'0'});
    if(up.error){if(/too large|exceeded|maximum/i.test(up.error.message||''))throw new Error('This league is too big to publish.');if(miss17(up.error)||/row-level|security/i.test(up.error.message||''))throw new Error(NEED17);err(up.error);}
    const{error}=await sb.from('community_leagues').insert({owner:uid,username,name,info,path,enc:z.enc,size:z.blob.size});
    if(error){try{await sb.storage.from('community').remove([path]);}catch(e){}if(miss17(error))throw new Error(NEED17);if(/row-level|security/i.test(error.message||''))throw new Error('You can publish up to 5 leagues. Remove one first.');err(error);}};
  B.leagueDel=async row=>{const sb=getSb();try{await sb.storage.from('community').remove([row.path]);}catch(e){}const{error}=await sb.from('community_leagues').delete().eq('id',row.id);err(error);};
  B.deleteAccount=async uid=>{const sb=getSb();
    try{const L=await B.cloudList(uid);if(L.length)await sb.storage.from('saves').remove(L.map(r=>`${uid}/${r.id}.save`));}catch(e){}
    try{const S=await B.sharedList(uid);if(S.length)await sb.storage.from('shared').remove(S.map(r=>r.path));}catch(e){}
    try{const{data}=await sb.from('community_leagues').select('path').eq('owner',uid);if(data&&data.length)await sb.storage.from('community').remove(data.map(r=>r.path));}catch(e){}
    const{error}=await sb.rpc('delete_my_account');if(error&&miss14(error))throw new Error(NEED14);err(error);try{await sb.auth.signOut();}catch(e){}};
  return B;}
// test mode: profiles live with the test accounts, "account" saves live in a separate store in this browser
function cloudLocalExt(B){
  const K='gpm_ol_local',ld=()=>{try{return JSON.parse(localStorage.getItem(K)||'null')||{users:[],fr:[],m:[],seq:1};}catch(e){return{users:[],fr:[],m:[],seq:1};}},sv=d=>localStorage.setItem(K,JSON.stringify(d));
  const pub=u=>({id:u.id,username:u.username,display_name:u.display_name||null,avatar:u.avatar||null,bio:u.bio||null,home_state:u.home_state||null});
  B.profile=async uid=>{const u=ld().users.find(x=>x.id===uid);return u?pub(u):null;};
  B.profiles=async ids=>ld().users.filter(u=>ids.includes(u.id)).map(pub);
  B.search=async q=>ld().users.filter(u=>u.username.toLowerCase().startsWith(q.toLowerCase())).slice(0,12).map(pub);
  B.updateProfile=async(uid,patch)=>{const d=ld(),u=d.users.find(x=>x.id===uid);if(!u)throw new Error('Not signed in');Object.assign(u,pfClean(patch));sv(d);};
  const idb=()=>new Promise((res,rej)=>{const q=indexedDB.open('gpgm_cloud_test',1);q.onupgradeneeded=()=>q.result.createObjectStore('s',{keyPath:'k'});q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error);});
  const tx=(mode,fn)=>idb().then(db=>new Promise((res,rej)=>{const t=db.transaction('s',mode),st=t.objectStore('s');let out;out=fn(st);t.oncomplete=()=>res(out&&out.result!==undefined?out.result:out);t.onerror=()=>rej(t.error);}));
  B.cloudList=async uid=>((await tx('readonly',s=>s.getAll()))||[]).filter(r=>r.uid===uid).map(r=>({id:r.id,meta:r.meta,size:r.size,enc:r.enc,updated_at:r.updated_at})).sort((a,b)=>a.updated_at<b.updated_at?1:-1);
  B.cloudPut=async(uid,id,meta,str)=>{const z=await cgZip(str);await tx('readwrite',s=>s.put({k:uid+'|'+id,uid,id,meta,size:z.blob.size,enc:z.enc,blob:z.blob,updated_at:new Date().toISOString()}));return z.blob.size;};
  B.cloudGet=async(uid,id,enc)=>{const r=await tx('readonly',s=>s.get(uid+'|'+id));if(!r)throw new Error('Save not found');return await cgUnzip(r.blob,r.enc||enc);};
  B.cloudDel=async(uid,id)=>{await tx('readwrite',s=>s.delete(uid+'|'+id));};
  // v2.14 test mode: shared saves sit in the same browser store, blocks and reports in the test accounts
  B.sharedList=async uid=>((await tx('readonly',s=>s.getAll()))||[]).filter(r=>r.share&&(r.recipient===uid||r.sender===uid)).map(r=>({id:r.k,sender:r.sender,recipient:r.recipient,meta:r.meta,path:r.k,enc:r.enc,size:r.size,created_at:r.created_at})).sort((a,b)=>a.created_at<b.created_at?1:-1);
  B.sharedGet=async row=>{const r=await tx('readonly',s=>s.get(row.path));if(!r)throw new Error('Save not found');return await cgUnzip(r.blob,r.enc);};
  B.sharedDel=async row=>{await tx('readwrite',s=>s.delete(row.path));};
  B.leagueList=async sort=>((await tx('readonly',s=>s.getAll()))||[]).filter(r=>r.league).map(r=>({id:r.k,owner:r.owner,username:r.username,name:r.name,info:r.info,size:r.size,downloads:r.downloads||0,created_at:r.created_at,path:r.k,enc:r.enc})).sort((a,b)=>sort==='top'?b.downloads-a.downloads:(a.created_at<b.created_at?1:-1));
  B.leagueGet=async row=>{const r=await tx('readonly',s=>s.get(row.path));if(!r)throw new Error('That league was removed.');r.downloads=(r.downloads||0)+1;await tx('readwrite',s=>s.put(r));return await cgUnzip(r.blob,r.enc);};
  B.leaguePublish=async(uid,username,name,info,str)=>{const all=(await tx('readonly',s=>s.getAll()))||[];if(all.filter(r=>r.league&&r.owner===uid).length>=5)throw new Error('You can publish up to 5 leagues. Remove one first.');
    const z=await cgZip(str),k='league|'+uid+'|'+Date.now().toString(36);await tx('readwrite',s=>s.put({k,league:1,owner:uid,username,name,info,size:z.blob.size,enc:z.enc,blob:z.blob,downloads:0,created_at:new Date().toISOString()}));};
  B.leagueDel=async row=>{await tx('readwrite',s=>s.delete(row.path));};
  B.shareSave=async(uid,to,meta,str)=>{const z=await cgZip(str),k='share|'+to+'|'+uid+'|'+Date.now().toString(36);await tx('readwrite',s=>s.put({k,share:1,sender:uid,recipient:to,meta,size:z.blob.size,enc:z.enc,blob:z.blob,created_at:new Date().toISOString()}));};
  B.blocks=async uid=>(ld().blocks||[]).filter(b=>b[0]===uid).map(b=>b[1]);
  B.block=async(uid,o)=>{const d=ld();d.blocks=(d.blocks||[]).filter(b=>!(b[0]===uid&&b[1]===o));d.blocks.push([uid,o]);sv(d);};
  B.unblock=async(uid,o)=>{const d=ld();d.blocks=(d.blocks||[]).filter(b=>!(b[0]===uid&&b[1]===o));sv(d);};
  B.reportUser=async(uid,o,reason)=>{const d=ld();(d.reports=d.reports||[]).push({reporter:uid,reported:o,reason,at:Date.now()});sv(d);};
  B.commList=async sort=>{const L=(ld().comm||[]).map(c=>({id:c.id,owner:c.owner,username:c.username,name:c.name,ovr:c.ovr,downloads:c.downloads||0,created_at:c.created_at}));return L.sort((a,b)=>sort==='top'?b.downloads-a.downloads:(a.created_at<b.created_at?1:-1));};
  B.commGet=async id=>{const d=ld(),c=(d.comm||[]).find(x=>x.id===id);if(!c)throw new Error('That team was removed.');c.downloads=(c.downloads||0)+1;sv(d);return c.data;};
  B.commPublish=async(uid,username,name,ovr,data)=>{const d=ld();d.comm=d.comm||[];if(d.comm.filter(c=>c.owner===uid).length>=20)throw new Error('You can publish up to 20 teams. Remove one first.');d.comm.push({id:'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),owner:uid,username,name,ovr,data,downloads:0,created_at:new Date().toISOString()});sv(d);};
  B.commDel=async id=>{const d=ld();d.comm=(d.comm||[]).filter(c=>c.id!==id);sv(d);};
  B.worldList=async sort=>{const L=(ld().worlds||[]).map(c=>({id:c.id,owner:c.owner,username:c.username,name:c.name,info:c.info,downloads:c.downloads||0,created_at:c.created_at}));return L.sort((a,b)=>sort==='top'?b.downloads-a.downloads:(a.created_at<b.created_at?1:-1));};
  B.worldGet=async id=>{const d=ld(),c=(d.worlds||[]).find(x=>x.id===id);if(!c)throw new Error('That world was removed.');c.downloads=(c.downloads||0)+1;sv(d);return c.data;};
  B.worldPublish=async(uid,username,name,info,data)=>{const d=ld();d.worlds=d.worlds||[];if(d.worlds.filter(c=>c.owner===uid).length>=10)throw new Error('You can publish up to 10 worlds. Remove one first.');d.worlds.push({id:'w'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),owner:uid,username,name,info,data,downloads:0,created_at:new Date().toISOString()});sv(d);};
  B.worldDel=async id=>{const d=ld();d.worlds=(d.worlds||[]).filter(c=>c.id!==id);sv(d);};
  B.deleteAccount=async uid=>{const d=ld();d.users=d.users.filter(u=>u.id!==uid);d.comm=(d.comm||[]).filter(c=>c.owner!==uid);d.worlds=(d.worlds||[]).filter(c=>c.owner!==uid);d.fr=d.fr.filter(f=>f.requester!==uid&&f.addressee!==uid);d.blocks=(d.blocks||[]).filter(b=>b[0]!==uid&&b[1]!==uid);sv(d);
    const all=(await tx('readonly',s=>s.getAll()))||[];for(const r of all)if(r.uid===uid||r.sender===uid||r.recipient===uid)await tx('readwrite',s=>s.delete(r.k));try{sessionStorage.removeItem('gpm_ol_local_sess');}catch(e){}};
  return B;}

/* ---- v2.14 safety, privacy and saves with friends ---- */
const PF_BAD=['fuck','shit','cunt','nigg','faggot','bitch','whore','slut','rapist','nazi','hitler','porn','pussy','asshole','retard'];
function pfBad(s){const t=String(s||'').toLowerCase().replace(/0/g,'o').replace(/[1!|]/g,'i').replace(/3/g,'e').replace(/[4@]/g,'a').replace(/[5$]/g,'s').replace(/7/g,'t').replace(/[^a-z]/g,'');return PF_BAD.some(w=>t.includes(w));}
// v2.14: set this to your support email before publishing (shown in Privacy, Terms and Settings)
const SUPPORT_EMAIL='';
function supportHtml(){return SUPPORT_EMAIL?`<a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>`:'the support contact on the game\'s store page';}
function legalTop(){try{const t=document.getElementById('title');document.getElementById('mo').classList.toggle('ontop',!!t&&!t.classList.contains('hid'));}catch(e){}}
function termsOpen(){try{closeSettings();}catch(e){}legalTop();openMo(`<div style="font-weight:900;font-size:20px;margin-bottom:8px">Terms of use</div><div style="font-size:13px;line-height:1.55;max-height:60vh;overflow-y:auto">
  <p>Playing offline needs no account. The account rules below apply to Online Play.</p>
  <p><b>No objectionable content or abusive players.</b> There is zero tolerance for offensive, hateful, sexual, threatening or harassing usernames, profiles, messages or shared saves, and for cheating that ruins other players' games.</p>
  <p><b>Reporting and blocking.</b> You can block or report any player from their profile or your friends list. Reports are reviewed within 24 hours; content that breaks these terms is removed and the account responsible can be suspended or deleted.</p>
  <p><b>Your account.</b> Keep your password private. You can delete your account at any time under Online Play → Account.</p>
  <p><b>The game.</b> All teams, leagues, schools and players in the game are fictional. The game is provided as is.</p>
  <p><b>Price and refunds.</b> The game is free and has no purchases, so there is nothing to refund.</p>
  <p><b>Contact.</b> ${SUPPORT_EMAIL?supportHtml():'Use the support contact on the game\'s store page.'}</p></div>
  <div style="text-align:right;margin-top:10px"><button class="btn" onclick="clo()">Close</button></div>`);}
function privacyOpen(){try{closeSettings();}catch(e){}legalTop();openMo(`<div style="font-weight:900;font-size:20px;margin-bottom:8px">Privacy policy</div><div style="font-size:13px;line-height:1.55;max-height:60vh;overflow-y:auto">
  <p><b>Playing without an account.</b> Your careers, settings and replays stay on your device (browser storage). None of it is sent anywhere.</p>
  <p><b>Cookies and storage.</b> The game sets no cookies. It keeps your saves, settings and a short error log in your browser's local storage so the game works and so you can copy a problem report yourself (Settings, Copy problem report). Clearing your browser data deletes them.</p>
  <p><b>Outside services.</b> Fonts load from Google Fonts, so Google sees your IP address the way any website visit does. Online Play, Community Creations and account backups use Supabase for accounts, matches and shared files; its code loads from jsDelivr when you use one of them. If you sign in, a sign-in token is kept in local storage so you stay signed in.</p>
  <p><b>Online Play account (optional).</b> If you create one, the game stores your username, email address (used only to sign in), the profile you fill in (display name, emblem, bio, home state), your friends list, the results of games you play online, saves you back up or send to friends, and reports or blocks you make. Your email is never shown to other players.</p>
  <p><b>Who sees what.</b> Other players can see your username, profile and online record. Saves on your account are private; a save you send is visible only to the friend you sent it to.</p>
  <p><b>No ads, no tracking, no selling.</b> The game has no advertising, no analytics and does not sell or share your data.</p>
  <p><b>Deleting your data.</b> Use Online Play → Account → Delete my account at any time. It removes your account and everything stored with it. Saves on this device can be deleted from Load Game.</p>
  <p><b>Children.</b> The game is meant for everyone; online accounts need an email address and should be created by players 13 or older, or with a parent's help.</p>
  <p><b>Contact.</b> Questions or a request about your data: ${supportHtml()}.</p></div>
  <div style="text-align:right;margin-top:10px"><button class="btn" onclick="clo()">Close</button></div>`);}
async function olDeleteAccount(){
  const t=prompt('This permanently deletes your online account and everything stored with it. Type DELETE to confirm.');
  if(t!=='DELETE'){if(t!=null)notify('Account not deleted (type DELETE in capitals to confirm).','w');return;}
  try{OLS.busy=true;olRender();await OLS.backend.deleteAccount(OLS.user.id);await olSetUser(null);OLS.cloud=null;OLS.pfEdit=null;OLS.friends=null;OLS.matches=null;OLS.shared=null;notify('Your account was deleted.');}
  catch(e){notify('Could not delete the account: '+e.message,'e');}
  OLS.busy=false;olRender();try{ttRefreshCloud();}catch(e){}
}
async function olBlock(uid,fid){
  if(!confirm('Block this player? They are removed from your friends and cannot send you requests or saves.'))return;
  try{if(fid!=null)try{await OLS.backend.removeFriend(fid);}catch(e){}await OLS.backend.block(OLS.user.id,uid);notify('Player blocked');await olLoadSocial(true);olRender();}catch(e){notify(e.message,'e');}
}
async function olUnblock(uid){try{await OLS.backend.unblock(OLS.user.id,uid);notify('Player unblocked');await olLoadSocial(true);olRender();}catch(e){notify(e.message,'e');}}
async function olReport(uid){
  const r=prompt('Report this player. What is wrong? (for example an offensive name or profile)');if(r==null)return;const reason=String(r).replace(/[<>]/g,'').trim().slice(0,300);
  if(!reason){notify('Add a short reason to send the report.','w');return;}
  try{await OLS.backend.reportUser(OLS.user.id,uid,reason);notify('Thanks, the report was sent. You can also block this player.');}catch(e){notify(e.message,'e');}
}
function blockedHtml(){const L=OLS.blocked||[];if(!L.length)return'';
  return`<div class="pnl" style="margin-bottom:14px"><div class="ph">Blocked players <span class="ol-mu">${L.length}</span></div><div class="pb">${L.map(id=>{const P=(OLS.blockedP||[]).find(x=>x.id===id);return`<div class="ol-fr">${P?pfTag(P,22):`<span class="ol-mu">${olEsc(String(id).slice(0,8))}…</span>`}<button class="bgh bsm" onclick="olUnblock('${olEsc(id)}')">Unblock</button></div>`;}).join('')}</div></div>`;}
// send a career save to a friend: pick the save, it is compressed and goes into their inbox
async function shareOpen(to){
  let L=[];try{L=await svList();}catch(e){}
  const f=(OLS.friends||[]).find(x=>x.other===to);
  openMo(`<div style="font-weight:900;font-size:20px;margin-bottom:4px">Send a save to ${olEsc(f?f.otherName:'your friend')}</div>
    <div style="font-size:13px;color:var(--mu);margin-bottom:10px">They get their own copy of the career to play. Your save stays yours.</div>
    ${L.length?L.map(m=>`<div class="ol-fr"><span>${olEsc(m.name)} ${olEsc(m.mascot)} · ${m.season} · ${olEsc(m.rec)}</span><button class="btn bsm" onclick="shareSend('${olEsc(to)}','${olEsc(m.id)}',this)">Send</button></div>`).join(''):'<div class="ol-mu">No saves on this device yet.</div>'}
    <div style="text-align:right;margin-top:10px"><button class="bgh" onclick="clo()">Close</button></div>`);
}
async function shareSend(to,id,btn){
  try{if(btn){btn.disabled=true;btn.textContent='Sending…';}const meta=(await svList()).find(m=>m.id===id),json=await svGetData(id);if(!meta||!json)throw new Error('Save not found');
    await OLS.backend.shareSave(OLS.user.id,to,Object.assign({},meta,{from:olName()}),json);clo();notify('Save sent!');}
  catch(e){notify('Could not send: '+e.message,'e');if(btn){btn.disabled=false;btn.textContent='Send';}}
}
function sharedInHtml(){const me=OLS.user&&OLS.user.id,L=(OLS.shared||[]).filter(r=>r.recipient===me);
  return`<div class="pnl" style="margin-bottom:14px"><div class="ph">Saves from friends <span class="ol-mu">${L.length}</span></div><div class="pb">
    ${L.length?L.map((r,i)=>{const m=r.meta||{};return`<div class="ol-fr"><span>${olEsc(m.name||'Career')} ${olEsc(m.mascot||'')} · ${olEsc(String(m.season||''))} · ${olEsc(m.rec||'')} <span class="ol-mu">from ${olEsc(m.from||'a friend')}</span></span><span><button class="btn bsm" onclick="sharedTake(${i},this)">Add to my saves</button> <button class="bgh bsm" onclick="sharedDrop(${i})">Delete</button></span></div>`;}).join(''):'<div class="ol-mu">When a friend sends you a career save, it shows up here. Send one from the Friends tab.</div>'}</div></div>`;}
function _sharedIn(i){const me=OLS.user&&OLS.user.id;return(OLS.shared||[]).filter(r=>r.recipient===me)[i];}
async function sharedTake(i,btn){const r=_sharedIn(i);if(!r)return;
  try{if(btn){btn.disabled=true;btn.textContent='Adding…';}let json=await OLS.backend.sharedGet(r);const nid='f'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
    try{const d=JSON.parse(json);if(d&&d.G){d.G.saveId=nid;json=JSON.stringify(d);}}catch(e){throw new Error('That save could not be read');}
    const m=Object.assign({},r.meta||{},{id:nid,savedAt:Date.now(),size:json.length});await svSave(m,json);
    try{await OLS.backend.sharedDel(r);}catch(e){}await olLoadSocial(true);olRender();try{ttRefresh();}catch(e){}notify('Added to your saves. Find it under Load Game.');}
  catch(e){notify('Could not add the save: '+e.message,'e');if(btn){btn.disabled=false;btn.textContent='Add to my saves';}}}
async function sharedDrop(i){const r=_sharedIn(i);if(!r||!confirm('Delete this save from your inbox?'))return;try{await OLS.backend.sharedDel(r);await olLoadSocial(true);olRender();}catch(e){notify(e.message,'e');}}

/* ---- automatic backup: after a save on this device, the same save goes to your account ---- */
function cloudAutoOn(){try{return localStorage.getItem('gpm_cloud_auto')!=='0';}catch(e){return true;}}
function cloudSetAuto(on){try{localStorage.setItem('gpm_cloud_auto',on?'1':'0');}catch(e){}olRender&&olRender(true);ttRefresh&&ttRefresh();}
// only wake the online code if this device has signed in before (no script download for players who never use it)
function cloudMaySignedIn(){try{const c=olCfg();if(!c)return false;if(c.mode==='local')return!!sessionStorage.getItem('gpm_ol_local_sess');return!!localStorage.getItem('gpm-ol-auth');}catch(e){return false;}}
async function cloudReady(){if(!cloudMaySignedIn())return null;try{const B=await olBackend();return B&&OLS.user&&B.cloudPut?B:null;}catch(e){return null;}}
const CLOUD={busy:false,again:null,last:0,status:''};
function cloudAfterSave(meta,json,manual){
  if(!cloudAutoOn())return;
  // a manual save always goes up; autosaves at most every 3 minutes (a save is a few megabytes)
  if(!manual&&Date.now()-CLOUD.last<180000)return;
  if(CLOUD.busy){CLOUD.again=[meta,json,manual];return;}
  if(json==null){try{json=saveJson();}catch(e){return;}} // built only when a backup really goes up
  CLOUD.busy=true;CLOUD.status='Backing up to your account…';
  (async()=>{try{const B=await cloudReady();if(!B){CLOUD.status='';if(manual)notify('Game saved on this device. Find it under Load Game.');return;}
      const n=await B.cloudPut(OLS.user.id,meta.id,meta,json);CLOUD.last=Date.now();CLOUD.status=`Backed up to your account ${ttFmtDate(Date.now())} (${(n/1048576).toFixed(1)} MB)`;
      if(manual)notify('Saved on this device and on your account');
    }catch(e){CLOUD.status='Account backup failed: '+e.message;if(manual)notify('Saved on this device. Account backup failed: '+e.message,'e');}
    finally{CLOUD.busy=false;const a=CLOUD.again;CLOUD.again=null;if(a)cloudAfterSave(a[0],a[1],a[2]);}})();}
async function cloudUpload(id,btn){try{if(btn)btn.disabled=true;const B=await cloudReady();if(!B)throw new Error('Sign in under Online Play → Account first');
    const meta=(await svList()).find(m=>m.id===id),json=await svGetData(id);if(!meta||!json)throw new Error('Save not found');
    const n=await B.cloudPut(OLS.user.id,id,meta,json);notify(`Uploaded to your account (${(n/1048576).toFixed(1)} MB)`);OLS.cloud=null;ttRefresh();olRender(true);}
  catch(e){notify(e.message,'e');}finally{if(btn)btn.disabled=false;}}
async function cloudDownload(id,btn,andLoad){try{if(btn)btn.disabled=true;const B=await cloudReady();if(!B)throw new Error('Sign in first');
    const row=(OLS.cloud||await B.cloudList(OLS.user.id)).find(r=>r.id===id);if(!row)throw new Error('Save not found on your account');
    const local=(await svList()).find(m=>m.id===id);
    if(local&&local.savedAt>((row.meta&&row.meta.savedAt)||0)+1000&&!confirm('The copy on this device is newer than the one on your account. Replace it with the account copy?'))return;
    notify('Downloading…');const json=await B.cloudGet(OLS.user.id,id,row.enc);
    try{const d=JSON.parse(json);if(!d||!d.G)throw 0;}catch(e){throw new Error('The downloaded save is damaged');}
    await svSave(Object.assign({},row.meta,{id}),json);
    if(andLoad){if(applySaveText(json)){const ov=document.getElementById('ol');if(ov&&!ov.classList.contains('hid'))olClose();hideTitle();}}else{notify('Saved on this device. Find it under Load Game.');ttRefresh();olRender(true);}}
  catch(e){notify(e.message,'e');}finally{if(btn)btn.disabled=false;}}
async function cloudDelete(id){if(!confirm('Delete this save from your account? The copy on this device (if any) stays.'))return;
  try{const B=await cloudReady();await B.cloudDel(OLS.user.id,id);OLS.cloud=null;await cloudRefresh();notify('Deleted from your account');}catch(e){notify(e.message,'e');}}
async function cloudRefresh(){const B=await cloudReady();if(!B){OLS.cloud=null;OLS.cloudErr=null;}else{try{OLS.cloud=await B.cloudList(OLS.user.id);OLS.cloudErr=null;}catch(e){OLS.cloud=[];OLS.cloudErr=e.message;}}
  try{olRender(true);}catch(e){}try{ttRefreshCloud();}catch(e){}}
function cloudRowHtml(r,inTitle){const m=r.meta||{};
  return`<div class="tt-row"><div class="tt-row-logo">${sLogo({name:m.name,mascot:m.mascot,c1:m.c1,c2:m.c2},inTitle?46:38)}</div>
    <div class="tt-row-info"><div class="tt-row-t">${olEsc(m.name||'')} ${olEsc(m.mascot||'')}</div><div class="tt-row-s">${m.coach?olEsc(m.coach)+' · ':''}${olEsc(m.cls||'')} · ${m.season||''} season · ${olEsc(m.rec||'')}</div>
    <div class="tt-row-s">On your account · ${ttFmtDate(Date.parse(r.updated_at))} · ${(r.size/1048576).toFixed(1)} MB</div></div>
    <div class="tt-row-b"><button class="btn bsm" onclick="cloudDownload('${olEsc(r.id)}',this,true)">Load</button><button class="bgh bsm" onclick="cloudDownload('${olEsc(r.id)}',this,false)">Download</button><button class="bgh bsm tt-del" onclick="cloudDelete('${olEsc(r.id)}')">Delete</button></div></div>`;}
// the account part of the Load Game screen
function ttRefreshCloud(){const box=document.getElementById('tt-cloud');if(!box)return;
  if(!olCfg()){box.innerHTML='';return;}
  if(!OLS.user){box.innerHTML=`<div class="tt-cloud-h">Saves on your account</div><div class="tt-empty">Sign in under <a href="#" onclick="olOpen();olTab('acct');return false">Online Play → Account</a> to keep your saves on your account and continue them on any device.</div>`;return;}
  const L=OLS.cloud;
  box.innerHTML=`<div class="tt-cloud-h">Saves on your account <span>${pfTag(OLS.profile,20)}</span></div>
    <label class="tt-auto"><input type="checkbox" ${cloudAutoOn()?'checked':''} onchange="cloudSetAuto(this.checked)"> Back up automatically after every save</label>
    ${CLOUD.status?`<div class="tt-row-s" style="margin:4px 0 8px">${olEsc(CLOUD.status)}</div>`:''}
    ${OLS.cloudErr?`<div class="ol-note ol-err">${olEsc(OLS.cloudErr)}</div>`:''}
    ${L==null?'<div class="tt-empty">Loading…</div>':L.length?L.map(r=>cloudRowHtml(r,true)).join(''):'<div class="tt-empty">No saves on your account yet. Use Upload on a save above, or just save your game while signed in.</div>'}`;}

/* ---- the profile editor (Online Play → Account) ---- */
function pfEditHtml(){const p=OLS.profile||{username:olName()},E=OLS.pfEdit||(OLS.pfEdit={display_name:p.display_name||'',bio:p.bio||'',home_state:p.home_state||'',avatar:p.avatar&&p.avatar.m?Object.assign({},p.avatar):{m:'',c1:'#1d428a',c2:'#ffffff'}});
  const prev=Object.assign({},p,{display_name:E.display_name,avatar:E.avatar.m?E.avatar:null});
  const sw=(k)=>AV_COLORS.map(c=>`<button class="pf-sw${E.avatar[k]===c?' on':''}" style="background:${c}" title="${c}" onclick="OLS.pfEdit.avatar.${k}='${c}';olRender()"></button>`).join('');
  return`<div class="pnl" style="margin-bottom:14px"><div class="ph">Your profile</div><div class="pb">
    ${OLS.pfOld?`<div class="ol-note ol-err">Profiles need the latest database update: run the new supabase_setup.sql in the Supabase SQL Editor (your data is kept).</div>`:''}
    <div class="pf-ed"><div class="pf-prev">${pfAvatar(prev,96)}<div class="pf-prev-n">${olEsc(pfName(prev))}</div><div class="ol-mu">@${olEsc(p.username||'')}</div>${E.home_state?`<div class="ol-mu">${olEsc(stName(E.home_state))}</div>`:''}${E.bio?`<div class="pf-bio">${olEsc(E.bio)}</div>`:''}</div>
      <div class="ol-form pf-form">
        <label>Display name<input maxlength="24" value="${olEsc(E.display_name)}" placeholder="${olEsc(p.username||'')}" oninput="OLS.pfEdit.display_name=this.value" onchange="olRender()"></label>
        <label>Avatar emblem<select onchange="OLS.pfEdit.avatar.m=this.value;olRender()"><option value="">Your initial</option>${avMascots().map(m=>`<option${E.avatar.m===m?' selected':''}>${olEsc(m)}</option>`).join('')}</select></label>
        <div class="pf-cg"><div class="pf-cl">Main color</div><div class="pf-sws">${sw('c1')}</div></div><div class="pf-cg"><div class="pf-cl">Second color</div><div class="pf-sws">${sw('c2')}</div></div>
        <label>Home state<select onchange="OLS.pfEdit.home_state=this.value;olRender()"><option value="">Not shown</option>${ST_ORDER.map(s=>`<option value="${s}"${E.home_state===s?' selected':''}>${stName(s)}</option>`).join('')}</select></label>
        <label>Bio<textarea maxlength="120" rows="2" placeholder="A line about you or your program (120 characters)" oninput="OLS.pfEdit.bio=this.value">${olEsc(E.bio)}</textarea></label>
        <div class="ol-row"><button class="btn bgn" onclick="pfSave(this)">Save profile</button><button class="bgh" onclick="OLS.pfEdit=null;olRender()">Reset</button></div></div></div></div></div>`;}
async function pfSave(btn){const E=OLS.pfEdit;if(!E||!OLS.user)return;try{btn.disabled=true;await OLS.backend.updateProfile(OLS.user.id,{display_name:E.display_name,bio:E.bio,home_state:E.home_state||null,avatar:E.avatar&&E.avatar.m?E.avatar:null});
    OLS.profile=await OLS.backend.profile(OLS.user.id);OLS.pfEdit=null;notify('Profile saved');olRender();}catch(e){notify(e.message,'e');btn.disabled=false;}}
function cloudAcctHtml(){const L=OLS.cloud;
  return`<div class="pnl" style="margin-bottom:14px"><div class="ph">Saves on your account</div><div class="pb">
    <p class="ol-p">Your career saves can live on your account, so you can continue them on any device where you sign in. They are compressed and only you can open them.</p>
    <label class="tt-auto"><input type="checkbox" ${cloudAutoOn()?'checked':''} onchange="cloudSetAuto(this.checked)"> Back up automatically after every save (autosaves at most every 3 minutes)</label>
    ${CLOUD.status?`<div class="ol-mu" style="margin:4px 0 8px">${olEsc(CLOUD.status)}</div>`:''}${OLS.cloudErr?`<div class="ol-note ol-err">${olEsc(OLS.cloudErr)}</div>`:''}
    ${L==null?'<div class="ol-mu">Loading…</div>':L.length?L.map(r=>cloudRowHtml(r,false)).join(''):'<div class="ol-mu">No saves on your account yet.</div>'}
    <div class="ol-cl-local">${(OLS.saves||[]).length?`<div class="pf-cl" style="margin-top:12px">On this device</div>`+(OLS.saves||[]).map(m=>{const up=(L||[]).some(r=>r.id===m.id&&((r.meta&&r.meta.savedAt)||0)>=m.savedAt);
      return`<div class="ol-fr"><span>${olEsc(m.name)} ${olEsc(m.mascot)} · ${m.season} · ${olEsc(m.rec)} <span class="ol-mu">${up?'· backed up':''}</span></span><button class="bgh bsm" onclick="cloudUpload('${olEsc(m.id)}',this)">${up?'Upload again':'Upload'}</button></div>`;}).join(''):''}</div>
    <div style="margin-top:10px"><button class="bgh bsm" onclick="OLS.saves=null;olSaves().then(cloudRefresh)">Refresh</button></div></div></div>`;}
/*</cloud>*/


function renderStoryCard(p,compact){
  const isGrad=!G.players.find(x=>x.id===p.id);
  if(!isGrad)return'';
  if((G.hofArchive||[]).some(x=>x.id===p.id)){try{return aiCareerCard(p,compact);}catch(err){console.error('aiCareerCard',err);}}
  // Only show story if 3+ years have passed since graduation
  const yearsOut=(G.yr-1)-(p.gradYr||0);
  if(yearsOut<3)return`<div style="margin-top:8px;padding:8px 10px;background:var(--s2);border:1px solid var(--bd);border-radius:6px;font-size:11px;color:var(--mu)"> Story unlocks in ${3-yearsOut} year${3-yearsOut!==1?'s':''}</div>`;
  const st=generatePlayerStory(p);
  const cf=_genCollegeCareerFacts(p);
  if(compact){
    return`<div style="margin-top:8px;padding:8px 10px;background:rgba(47,111,237,.06);border:1px solid rgba(47,111,237,.2);border-radius:6px;cursor:pointer" onclick="event.stopPropagation();showPlayer(${p.id})">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px"><span>${st.icon}</span><span style="font-family:var(--hd);font-weight:800;font-size:12px;color:var(--te)">${st.outcome}</span><span style="font-size:10px;color:var(--mu)">${st.storyYr}</span></div>
      <div style="font-size:11px;color:var(--tx);line-height:1.4">${st.headline}</div>
      ${cf?`<div style="font-size:10px;color:var(--mu);margin-top:3px"> ${cf.school} (${cf.lvl}) · ${cf.statsBlock.split(' ').slice(0,4).join(' ')}…</div>`:''}
    </div>`;
  }
  // Build college career block
  const fbsPrestigeLabel=cf&&cf.lvl==='FBS'?(cf.fbsTier==='elite'?' <span style="color:var(--gd);font-size:10px">★ Elite Program</span>':cf.fbsTier==='good'?' <span style="color:var(--mu);font-size:10px">★ Major Program</span>':''):'';
  const collegeHtml=cf?`
    <div style="background:rgba(34,184,112,.05);border:1px solid rgba(34,184,112,.2);border-radius:8px;padding:12px 14px;margin-bottom:10px">
      <div style="font-family:var(--hd);font-weight:900;font-size:13px;color:var(--gn);letter-spacing:.3px;margin-bottom:8px"> College Career, ${cf.school} (${cf.lvl})${fbsPrestigeLabel}</div>
      ${cf.dreamNote?`<div style="font-size:11px;color:var(--gd);margin-bottom:6px;font-style:italic"> ${cf.dreamNote}</div>`:''}
      <div style="font-size:12px;color:var(--tx);margin-bottom:6px"> <strong>Stats:</strong> ${cf.statsBlock}</div>
      ${cf.awards.length?`<div style="font-size:12px;color:var(--gd);margin-bottom:6px"> <strong>Awards:</strong> ${cf.awards.join(', ')}</div>`:''}
      ${cf.injury?`<div style="font-size:12px;color:var(--rd);margin-bottom:6px"> <strong>Injury:</strong> ${p.fn} ${cf.injury}.</div>`:''}
      ${cf.scandal?`<div style="font-size:12px;color:#ff9900;margin-bottom:2px"> <strong>Incident:</strong> ${p.fn} ${cf.scandal}.</div>`:''}
    </div>`:'';
  return`<div style="margin-top:10px">
    ${collegeHtml}
    <div style="background:rgba(47,111,237,.06);border:1px solid rgba(47,111,237,.25);border-radius:8px;padding:14px 16px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="font-size:20px">${st.icon}</span>
        <div>
          <div style="font-family:var(--hd);font-weight:900;font-size:15px;color:var(--te);letter-spacing:.3px">${st.outcome} · ${st.storyYr}</div>
          <div style="font-size:12px;font-weight:700;color:var(--tx);margin-top:1px">${st.headline}</div>
        </div>
      </div>
      <div style="font-size:12px;color:var(--mu);line-height:1.6;border-top:1px solid rgba(47,111,237,.15);padding-top:8px">${st.body}</div>
    </div>
  </div>`;
}

// ── End Player Story System ──

function pgWatch(){
  // Include both active players AND graduated players stored in G.wlArchive
  const wl=G.players.filter(p=>p.wl);
  const arch=(G.wlArchive||[]);
  const allWl=[...wl,...arch];
  return`<div class="pnl"><div class="ph">Watchlist <span style="font-size:12px;font-weight:400;color:var(--mu)">${allWl.length} players</span></div>
  ${!allWl.length?'<div class="pb" style="color:var(--mu)">No players watchlisted. Click ☆ on any player to add them.</div>':
  `<table><thead><tr><th>★</th><th>Name</th><th>School</th><th>Pos</th><th>Yr</th><th>Rat</th><th>Stars</th><th>Dev</th><th>GPA</th><th>Offers</th><th></th><th>Story</th></tr></thead>
  <tbody>${allWl.map(p=>{const sch=getS(p.sId);const isGrad=!G.players.find(x=>x.id===p.id);return`<tr class="cl" onclick="showPlayer(${p.id})">
    <td><button class="wbtn" onclick="event.stopPropagation();togWl(${p.id})">★</button></td>
    <td>${p.fn} ${p.ln}</td><td><div style="display:flex;align-items:center;gap:4px">${sch?sLogo(sch,26)+' '+sch.name:'Alumni'}</div></td>
    <td><span class="pb2">${p.pos}</span></td><td>${yrL(p.yr)}</td>
    <td>${rb(p.rat)}</td><td>${stars(p.stars)}</td><td>${devB(p.dev)}</td><td>${gpaL(p.gpa)}</td><td>${p.offers.length||'–'}</td>
    <td>${isGrad?'<span style="font-size:10px;color:var(--gd)">Alumni</span>':''}</td>
    <td>${isGrad&&(G.yr-1-(p.gradYr||0))>=3?renderStoryCard(p,true):''}</td>
  </tr>`;}).join('')}</tbody></table>`}</div>`;}
function togWl(id){
  // Search active players first, then wlArchive
  let p=getP(id);
  const archIdx=(G.wlArchive||[]).findIndex(x=>x.id===id);
  if(!p&&archIdx===-1)return;
  if(p){
    p.wl=!p.wl;
    // If removing watchlist from active player, also remove from archive just in case
    if(!p.wl&&archIdx!==-1)G.wlArchive.splice(archIdx,1);
    notify(p.wl?'Added to watchlist!':'Removed.','w');
  } else {
    // Graduated player in archive, just remove from archive
    G.wlArchive.splice(archIdx,1);
    notify('Removed from watchlist.','w');
  }
  if(G._page==='watch')nav('watch');
}

// HoF pagination state
if(typeof window._hofPage==='undefined')window._hofPage=0;
if(typeof window._hofSearch==='undefined')window._hofSearch='';
const HOF_PAGE_SIZE=20;

// SVG face cache, keyed by "seed_size", avoids regenerating identical SVGs on each render
if(typeof window._faceCache==='undefined')window._faceCache={};
function faceCached(seed,sz){
  const safeSeed=(typeof seed==='number'&&isFinite(seed))?seed:Math.abs(String(seed||'x').split('').reduce((a,c)=>a+c.charCodeAt(0),0)||42);
  const k=safeSeed+'_'+sz;
  if(!window._faceCache[k])window._faceCache[k]=face(safeSeed,sz);
  return window._faceCache[k];
}

function pgHoF(){
  // Deduplicate: for each player, prefer the hofArchive copy (graduated) over the active roster copy
  const arch=(G.hofArchive||[]);
  const archIds=new Set(arch.map(x=>x.id));
  const activeHof=G.players.filter(p=>p.hof&&!archIds.has(p.id));
  const allHof=[...activeHof,...arch];

  // Pre-build active-player id set once, avoids O(n²) .find() inside the render loop
  const activeIds=new Set(G.players.map(x=>x.id));

  // Apply search filter
  const q=(window._hofSearch||'').toLowerCase().trim();
  const filtered=q?allHof.filter(p=>(p.fn+' '+p.ln).toLowerCase().includes(q)||p.pos.toLowerCase().includes(q)):allHof;

  // Clamp page
  const totalPages=Math.max(1,Math.ceil(filtered.length/HOF_PAGE_SIZE));
  if(window._hofPage>=totalPages)window._hofPage=totalPages-1;
  if(window._hofPage<0)window._hofPage=0;
  const page=window._hofPage;
  const slice=filtered.slice(page*HOF_PAGE_SIZE,(page+1)*HOF_PAGE_SIZE);

  const searchBar=`<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap">
    <input id="hof-search" type="text" placeholder="Search by name or position…" value="${(window._hofSearch||'').replace(/"/g,'&quot;')}"
      style="background:var(--s2);border:1px solid var(--bd);border-radius:6px;padding:5px 10px;color:var(--tx);font-size:12px;width:220px"
      oninput="window._hofSearch=this.value;window._hofPage=0;nav('hof')" />
    ${q?`<button onclick="window._hofSearch='';window._hofPage=0;nav('hof')" style="background:none;border:1px solid var(--bd);border-radius:5px;padding:4px 9px;color:var(--mu);cursor:pointer;font-size:11px">✕ Clear</button>`:''}
    <span style="font-size:11px;color:var(--mu);margin-left:auto">${filtered.length} of ${allHof.length} shown</span>
  </div>`;

  const pager=(filtered.length>HOF_PAGE_SIZE)?`<div style="display:flex;align-items:center;gap:8px;margin-top:12px;justify-content:center">
    <button onclick="window._hofPage=Math.max(0,window._hofPage-1);nav('hof')" ${page===0?'disabled':''} style="background:var(--s2);border:1px solid var(--bd);border-radius:5px;padding:4px 12px;color:var(--tx);cursor:pointer;opacity:${page===0?.4:1}">Prev</button>
    <span style="font-size:12px;color:var(--mu)">Page ${page+1} of ${totalPages}</span>
    <button onclick="window._hofPage=Math.min(${totalPages-1},window._hofPage+1);nav('hof')" ${page>=totalPages-1?'disabled':''} style="background:var(--s2);border:1px solid var(--bd);border-radius:5px;padding:4px 12px;color:var(--tx);cursor:pointer;opacity:${page>=totalPages-1?.4:1}">Next</button>
  </div>`:'';

  return`<div class="pnl"><div class="ph"> Hall of Fame <span style="font-size:12px;font-weight:400;color:var(--mu)">${allHof.length} enshrined</span></div>
  ${!allHof.length?'<div class="pb" style="color:var(--mu)">No players enshrined. Click  on any player to add them.</div>':
  `<div class="pb">${aiHofFeed()}${searchBar}${!slice.length?`<div style="color:var(--mu)">No players match "${q}".</div>`:`<div style="display:flex;flex-wrap:wrap;gap:10px">${slice.map(p=>{const isGrad=!activeIds.has(p.id);return`<div style="background:var(--s2);border:1px solid var(--gd);border-radius:8px;padding:12px;min-width:200px;max-width:260px;cursor:pointer;position:relative;display:flex;flex-direction:column" onclick="showPlayer(${p.id})">
    ${faceCached(p.fs,36)}<div style="font-weight:700;font-size:12px;margin-top:5px">${p.fn} ${p.ln}</div>
    <div>${stars(p.stars)} ${rb(p.rat)}</div><div><span class="pb2">${p.pos}</span> ${yrL(p.yr)}</div>
    ${p.committed?`<div style="font-size:10px;color:var(--gd);margin-top:3px">${p.committed.school}</div>`:''}
    ${isGrad?`<div style="font-size:9px;color:var(--gd);margin-top:3px">Alumni</div>`:''}
    ${isGrad&&p.gradYr?renderStoryCard(p,true):''}
    <button class="hbtn" style="font-size:11px;margin-top:4px" onclick="event.stopPropagation();togHof(${p.id})">✕ Remove</button>
  </div>`;}).join('')}</div>`}${pager}</div>`}</div>`;}
function togHof(id){
  let p=getP(id);
  const archIdx=(G.hofArchive||[]).findIndex(x=>x.id===id);
  if(!p&&archIdx===-1)return;
  // Only allow HoF for player's own team
  if(p&&p.sId!==G.myId){notify('Only your own players can be enshrined in the HoF.','e');return;}
  if(p){
    p.hof=!p.hof;
    if(!p.hof&&archIdx!==-1)G.hofArchive.splice(archIdx,1);
    notify(p.hof?'Enshrined in HoF! ':'Removed.','w');
  } else {
    G.hofArchive.splice(archIdx,1);
    notify('Removed from Hall of Fame.','w');
  }
  if(G._page==='hof')nav('hof');
}

function pgHist(){
  const rks=['passYds','passTD','rushYds','rushTD','recYds','recTD','krYds','krTD','tackles','sacks','ints','pbu','pancakes'];
  const rl={passYds:'Pass Yards',passTD:'Pass TDs',rushYds:'Rush Yards',rushTD:'Rush TDs',recYds:'Rec Yards',recTD:'Rec TDs',krYds:'Kick Return Yards',krTD:'Kick Return TDs',tackles:'Tackles',sacks:'Sacks',ints:'INTs',pbu:'Pass Breakups',pancakes:'Pancake Blocks'};
  const recRow=(type,label)=>`<div style="margin-bottom:14px"><div style="font-family:var(--hd);font-size:13px;font-weight:800;color:var(--te);margin-bottom:6px;">${label}</div>
    <table><thead><tr><th>Category</th><th>Record</th><th>Player</th><th>Pos</th><th>Season</th></tr></thead>
    <tbody>${rks.map(k=>{const rec=G.schoolRecs?.[type]?.[k];return`<tr>
      <td style="font-weight:700;color:var(--mu)">${rl[k]}</td>
      <td><span style="font-family:var(--hd);font-size:20px;font-weight:900;color:var(--gd)">${rec&&rec.val?rec.val:'–'}</span></td>
      <td>${rec&&rec.pid?`<span class="cl" style="color:var(--te);cursor:pointer" onclick="showPlayer(${rec.pid})">${rec.name}</span>`:'–'}</td>
      <td>${rec&&rec.pos?`<span class="pb2">${rec.pos}</span>`:'–'}</td>
      <td style="color:var(--mu)">${rec&&rec.date?rec.date:'–'}</td>
    </tr>`;}).join('')}</tbody></table></div>`;

  // League History table, supports all classifications via filter
  let _histClsFilter=window._histClsFilter||'ALL';
  window._setHistCls=function(cls){window._histClsFilter=cls;nav('hist');};
  const histClsBar=`<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px;align-items:center;">
    <span style="font-size:10px;color:var(--mu);letter-spacing:1px;font-weight:700;margin-right:4px;">Filter Class:</span>
    ${['ALL','1A','2A','3A','4A','5A'].map(cls=>`<button onclick="_setHistCls('${cls}')" style="background:${_histClsFilter===cls?'var(--ac)':'var(--s2)'};border:1px solid ${_histClsFilter===cls?'var(--ac)':'var(--bd)'};color:${_histClsFilter===cls?'var(--tOn,#fff)':'var(--tx)'};padding:3px 11px;border-radius:4px;cursor:pointer;font-family:var(--hd);font-weight:700;font-size:12px;">${cls==='ALL'?' ALL':clsL(cls)}${cls===G.cls?' ★':''}</button>`).join('')}
  </div>`;
  function _awardCell(aw,icon,color){
    if(!aw)return`<td style="color:var(--mu)">–</td>`;
    const isMe=aw.sId===G.myId;
    return`<td style="font-weight:${isMe?700:400}"><span style="color:${isMe?color:'var(--tx)'}">${isMe?icon+' ':''}<span class="cl" style="cursor:pointer;color:${isMe?color:'var(--te)'}" onclick="showPlayer(${aw.pid})">${aw.name}</span></span><br><span style="font-size:10px;color:var(--mu)">${aw.pos}, ${aw.schName}</span></td>`;
  }
  const histToShow=_histClsFilter==='ALL'?G.hist:G.hist.filter(h=>(h.cls||G.cls)===_histClsFilter);

  // Build current-season snapshot of other-league leaders to show below history table
  const otherLeagueLiveRows=(G.allLeagues&&_histClsFilter==='ALL')?
    Object.entries(G.allLeagues).filter(([cls])=>CLS_SZ[cls]).map(([cls,lg])=>{
      const allT=lg.divisions.flatMap(d=>d.teams);
      const leader=[...allT].sort((a,b)=>{const aw=a.wins/(a.wins+a.losses+.001),bw=b.wins/(b.wins+b.losses+.001);return bw-aw;})[0];
      const champName=lg.champName||'TBD';
      return`<tr>
        <td style="font-weight:700;color:var(--gd)">${2026+(G.yr-1)} (Current)</td>
        <td><span style="font-family:var(--hd);font-weight:700;color:var(--te)">${clsL(cls)}</span></td>
        <td style="color:var(--mu);font-style:italic">In Progress</td>
        <td colspan="3" style="font-size:11px;color:var(--mu)">Current leader: ${leader?`${leader.name} ${leader.mascot} (${leader.wins}-${leader.losses})`:'–'} · Last champ: ${champName}</td>
        <td colspan="2" style="color:var(--mu)">–</td>
      </tr>`;
    }).join('') : '';

  const leagueHistHtml=!G.hist.length&&!otherLeagueLiveRows?'<div style="color:var(--mu);padding:10px 0">No seasons completed yet.</div>':
    histClsBar+`<div style="overflow-x:auto"><table style="margin-bottom:16px"><thead><tr>
      <th>Season</th><th>Class</th><th> State Champion</th>${G.divisions.map(d=>`<th> ${d.name}</th>`).join('')}<th> Mr. Football</th><th> Fr. of Year</th>
    </tr></thead>
    <tbody>
    ${otherLeagueLiveRows}
    ${[...histToShow].reverse().map(h=>{
      const yr=2026+(h.yr-1);
      const isMyStateChamp=h.stateChamp;
      const _scRec=(()=>{if(isMyStateChamp)return`${h.wins}-${h.losses}`;if(h.stateChampId){const _scDiv=h.divWinners&&h.divWinners.find(d=>d.id===h.stateChampId);if(_scDiv)return _scDiv.rec;}return null;})();
      // Also pull other-league champs stored in hist snapshot
      const othChamps=h.otherLeagueChamps||{};
      const champCls=h.cls||G.cls;
      // Main state champ cell
      const champCell=h.stateChampName
        ?`<td style="font-weight:700;color:${isMyStateChamp?'var(--gd)':'var(--tx)'}">${isMyStateChamp?' ':''}<span style="color:${isMyStateChamp?'var(--gd)':'var(--te)'}">${h.stateChampName}</span>${!isMyStateChamp&&_scRec?` <span style="color:var(--mu);font-size:10px">(${_scRec})</span>`:''}</td>`
        :h.otherChampName?`<td style="color:var(--te);font-weight:700"> ${h.otherChampName}</td>`
        :`<td style="color:var(--mu)">–</td>`;
      const divCells=(h.divWinners||[]).length
        ?G.divisions.map(div=>{
            const dw=(h.divWinners||[]).find(dv=>dv.divName===div.name);
            if(!dw)return`<td style="color:var(--mu)">–</td>`;
            const isMe=dw.id===G.myId;
            return`<td style="font-weight:${isMe?700:400};color:${isMe?'var(--gd)':'var(--tx)'}">${isMe?' ':''}${dw.name} <span style="color:var(--mu);font-size:10px">${dw.rec}</span></td>`;
          }).join('')
        :G.divisions.map(()=>`<td style="color:var(--mu)">–</td>`).join('');
      const clsCell=`<td><span style="font-family:var(--hd);font-weight:700;color:var(--te)">${clsL(champCls)}</span></td>`;
      return`<tr><td style="font-weight:700;color:var(--gd)">${yr}</td>${clsCell}${champCell}${divCells}${_awardCell(h.mrFootball,'','var(--gd)')}${_awardCell(h.freshmanOTY,'','var(--b2)')}</tr>`;
    }).join('')}${!histToShow.length&&!otherLeagueLiveRows?`<tr><td colspan="20" style="color:var(--mu);text-align:center;padding:14px">No history for this classification yet.</td></tr>`:''}</tbody></table></div>

    ${G.hist.length&&Object.values(G.hist.some(h=>h.otherLeagueChamps&&Object.keys(h.otherLeagueChamps).length>0)?G.hist:[])?`
    <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--bd);">
      <div style="font-family:var(--hd);font-size:13px;font-weight:800;color:var(--te);margin-bottom:8px;"> All Classification Champions by Season</div>
      <div style="overflow-x:auto"><table><thead><tr>
        <th>Season</th>${['1A','2A','3A','4A','5A'].map(cls=>`<th${cls===G.cls?` style="color:var(--te)"`:''}>${clsL(cls)}${cls===G.cls?' ★':''}</th>`).join('')}
      </tr></thead><tbody>
      ${[...G.hist].reverse().map(h=>{
        const yr=2026+(h.yr-1);
        const othChamps=h.otherLeagueChamps||{};
        return`<tr>
          <td style="font-weight:700;color:var(--gd)">${yr}</td>
          ${['1A','2A','3A','4A','5A'].map(cls=>{
            if(cls===(h.cls||G.cls)){
              const isMine=h.stateChamp;
              const nm=h.stateChampName||'–';
              return`<td style="font-weight:${isMine?700:500};color:${isMine?'var(--gd)':'var(--tx)'}">${isMine?' ':''}${nm}</td>`;
            }
            const oc=othChamps[cls];
            return oc?`<td style="color:var(--te)">${oc.name} <span style="color:var(--mu);font-size:10px">${oc.rec}</span></td>`:`<td style="color:var(--mu)">–</td>`;
          }).join('')}
        </tr>`;
      }).join('')}
      </tbody></table></div>
    </div>`:''}

    ${(()=>{ // v2.00: national champions and the neighbor states' champions
      const nh=(G.natHist||[]).slice().reverse();
      const natT=`<div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--bd);"><div style="font-family:var(--hd);font-size:13px;font-weight:800;color:var(--te);margin-bottom:8px;">National Championship Games</div>
        ${nh.length?`<div style="overflow-x:auto"><table><thead><tr><th>Season</th><th>Champion</th><th>Score</th><th>Runner-up</th><th>Venue</th></tr></thead><tbody>${nh.map(h=>{const me=h.w===G.myId,ml=h.l===G.myId;return`<tr>
          <td style="font-weight:700;color:var(--gd)">${2026+(h.yr-1)}</td><td style="font-weight:${me?800:600};color:${me?'var(--gd)':'var(--tx)'}">${h.wName} <span style="font-size:10px;color:var(--mu)">${stName(h.wSt)} · ${h.wCls}</span></td>
          <td style="font-weight:700">${h.ws}-${h.ls}${h.ot?' OT':''}</td><td style="color:${ml?'var(--te)':'var(--tx)'}">${h.lName} <span style="font-size:10px;color:var(--mu)">${stName(h.lSt)} · ${h.lCls}</span></td><td style="font-size:11px;color:var(--mu)">${h.venue||''}</td></tr>`;}).join('')}</tbody></table></div>`:'<div style="color:var(--mu);font-size:12px">The first National Championship is played after this season&#39;s state playoffs, between the top two teams in the final national poll.</div>'}</div>`;
      const stT=ST_ORDER.filter(k=>k!=='CF').map(k=>{const cl=clsOfSt(k),xs=G.hist.filter(h=>(h.otherLeagueChamps&&cl.some(c=>h.otherLeagueChamps[c]))||cl.includes(h.cls));if(!xs.length)return'';
        return`<div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--bd);"><div style="font-family:var(--hd);font-size:13px;font-weight:800;color:var(--te);margin-bottom:8px;">${stName(k)} State Champions</div>
        <div style="overflow-x:auto"><table><thead><tr><th>Season</th>${cl.map(c=>`<th title="${clsName(c)}">${XCLS[c].lbl}</th>`).join('')}</tr></thead><tbody>${xs.slice().reverse().map(h=>`<tr><td style="font-weight:700;color:var(--gd)">${2026+(h.yr-1)}</td>${cl.map(c=>{const oc=c===h.cls?(h.stateChampName?{name:h.stateChampName,rec:''}:null):(h.otherLeagueChamps||{})[c];return oc?`<td style="color:var(--te)">${oc.name} <span style="color:var(--mu);font-size:10px">${oc.rec}</span></td>`:'<td style="color:var(--mu)">–</td>';}).join('')}</tr>`).join('')}</tbody></table></div></div>`;}).join('');
      return _histClsFilter==='ALL'?natT+stT:'';})()}
    ${(_histClsFilter==='ALL'&&G.allLeagues&&Object.keys(G.allLeagues).length)?`
    <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--bd);">
      <div style="font-family:var(--hd);font-size:13px;font-weight:800;color:var(--te);margin-bottom:8px;"> All-Time State Champions by Classification</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        ${['1A','2A','3A','4A','5A'].map(cls=>{
          let champName='–';
          // Look through history for most recent champ at this cls
          const clsHist=[...G.hist].reverse();
          if(cls===(G.cls)){
            const h=clsHist.find(h=>(h.stateChamp||h.stateChampName));
            champName=h?(h.stateChamp?`${myS().name} ${myS().mascot}`:h.stateChampName||'–'):'–';
          } else {
            // Check hist snapshots first
            const hSnap=clsHist.find(h=>h.otherLeagueChamps&&h.otherLeagueChamps[cls]);
            if(hSnap)champName=hSnap.otherLeagueChamps[cls].name;
            else if(G.allLeagues[cls]&&G.allLeagues[cls].champName)champName=G.allLeagues[cls].champName;
          }
          const isMyCls=cls===G.cls;
          return`<div style="background:var(--s2);border:1px solid ${isMyCls?'var(--ac)':'var(--bd)'};border-radius:6px;padding:8px 12px;min-width:130px;text-align:center;">
            <div style="font-family:var(--hd);font-size:13px;font-weight:800;color:${isMyCls?'var(--te)':'var(--te)'};">${clsL(cls)}${isMyCls?' ★':''}</div>
            <div style="font-size:11px;font-weight:700;color:var(--tx);margin-top:3px">${champName}</div>
            <div style="font-size:10px;color:var(--mu)">Last State Champ</div>
          </div>`;
        }).join('')}
      </div>
    </div>`:''}
    `;

  return`<div class="pnl"><div class="ph"> History: ${myS().name} ${myS().mascot}</div><div class="pb">
    <div class="tabs" style="margin-bottom:12px">
      <button class="tab on" onclick="swRTab(this,'hist-my')">My Team</button>
      <button class="tab" onclick="swRTab(this,'hist-lg')">League History</button>
      <button class="tab" onclick="swRTab(this,'hist-aw')"> Awards</button>
      <button class="tab" onclick="swRTab(this,'hist-rc')">School Records</button>
    </div>
    <div id="hist-my">
    ${!G.hist.length?'<div style="color:var(--mu)">No seasons completed yet.</div>':
    `<table style="margin-bottom:16px"><thead><tr><th>Season</th><th>Record</th><th>Class</th><th>Prestige</th><th>Achievements</th></tr></thead>
    <tbody>${G.hist.map(h=>`<tr>
      <td>${2026+(h.yr-1)}</td><td>${recStr(h.wins,h.losses)}</td>
      <td><span style="font-family:var(--hd);font-weight:700;color:var(--te)">${clsL(h.cls||G.cls)}</span></td>
      <td>${''.repeat(Math.round(h.prestige))}</td>
      <td>${h.natl&&h.natl.done&&h.natl.w===G.myId?'National Champion · ':h.natl&&h.natl.done&&h.natl.l===G.myId?'National runner-up · ':''}${h.stateChamp?' State Champion':h.champ?' Division Champ':'–'}</td>
    </tr>`).join('')}</tbody></table>`}
    ${G.trophies&&G.trophies.length?`<div style="margin-bottom:16px"><div style="font-family:var(--hd);font-size:13px;font-weight:800;color:var(--te);margin-bottom:8px;"> Trophy Cabinet</div>
    <div style="display:flex;flex-wrap:wrap;gap:10px">${G.trophies.map(t=>`<div class="tc"><div style="font-size:30px">${t.type==='State'?'':''}</div><div style="font-family:var(--hd);font-size:13px;font-weight:800;color:var(--gd);margin-top:5px">${t.type==='National'?'National champs':t.type==='State'?'State champs':'Division champs'}</div><div style="font-size:11px;color:var(--mu);margin-top:3px">${2026+(t.yr-1)} | ${t.rec}</div></div>`).join('')}</div></div>`:''}
    </div>
    <div id="hist-lg" class="hid">${leagueHistHtml}</div>
    <div id="hist-aw" class="hid">${(()=>{
      if(!G.hist.length)return'<div style="color:var(--mu)">No seasons completed yet.</div>';
      const awClsBar=`<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px;align-items:center;">
        <span style="font-size:10px;color:var(--mu);letter-spacing:1px;font-weight:700;margin-right:4px;">Filter Class:</span>
        ${['ALL','1A','2A','3A','4A','5A'].map(cls=>`<button onclick="_setHistCls('${cls}')" style="background:${_histClsFilter===cls?'var(--ac)':'var(--s2)'};border:1px solid ${_histClsFilter===cls?'var(--ac)':'var(--bd)'};color:${_histClsFilter===cls?'var(--tOn,#fff)':'var(--tx)'};padding:3px 11px;border-radius:4px;cursor:pointer;font-family:var(--hd);font-weight:700;font-size:12px;">${cls==='ALL'?' ALL':clsL(cls)}${cls===G.cls?' ★':''}</button>`).join('')}
      </div>`;
      const awHistToShow=_histClsFilter==='ALL'?G.hist:G.hist.filter(h=>(h.cls||G.cls)===_histClsFilter);
      function awardDetailRow(aw, icon, color, label){
        if(!aw)return`<tr><td colspan="5" style="color:var(--mu)">–</td></tr>`;
        const isMe=aw.sId===G.myId;
        const s=aw.stats||{};
        let statStr='';
        if(aw.pos==='QB')statStr=`${s.passYds||0} Pass Yds, ${s.passTD||0} TD, ${s.passInt||0} INT`;
        else if(aw.pos==='RB')statStr=`${s.rushYds||0} Rush Yds, ${s.rushTD||0} TD`;
        else if(['WR','TE'].includes(aw.pos))statStr=`${s.recYds||0} Rec Yds, ${s.recTD||0} TD`;
        else if(['LB','DL'].includes(aw.pos))statStr=`${s.tackles||0} Tkl, ${s.sacks||0} Sacks`;
        else if(['CB','S'].includes(aw.pos))statStr=`${s.tackles||0} Tkl, ${s.ints||0} INTs`;
        return`<tr style="${isMe?'background:rgba(245,192,48,.06)':''}">
          <td style="font-weight:700">${icon} ${label}</td>
          <td><span class="cl" style="cursor:pointer;color:${isMe?color:'var(--te)'};font-weight:${isMe?700:400}" onclick="showPlayer(${aw.pid})">${isMe?'★ ':''}${aw.name}</span></td>
          <td><span class="pb2">${aw.pos}</span></td>
          <td style="font-size:11px;color:var(--mu)">${aw.schName}</td>
          <td style="font-size:11px;color:var(--tx)">${statStr||rb(aw.rat||0)}</td>
        </tr>`;
      }
      return awClsBar+`<div style="overflow-x:auto"><table><thead><tr>
        <th>Award</th><th>Season</th><th>Class</th><th>Winner</th><th>Pos</th><th>School</th><th>Key Stats</th>
      </tr></thead><tbody>
      ${[...awHistToShow].reverse().map(h=>{
        const yr=2026+(h.yr-1);
        const mrIsMe=h.mrFootball&&h.mrFootball.sId===G.myId;
        const frIsMe=h.freshmanOTY&&h.freshmanOTY.sId===G.myId;
        const cls=`<span style="font-family:var(--hd);font-weight:700;color:var(--te)">${h.cls?clsL(h.cls):'–'}</span>`;
        function aRow(aw,icon,color,label){
          if(!aw)return`<tr><td style="font-weight:700;color:var(--mu)">${icon} ${label}</td><td>${yr}</td><td>${clsL(cls)}</td><td colspan="4" style="color:var(--mu)">–</td></tr>`;
          const isMe=aw.sId===G.myId;
          const s=aw.stats||{};
          let statStr='';
          if(aw.pos==='QB')statStr=`${s.passYds||0} Pass Yds, ${s.passTD||0} TD`;
          else if(aw.pos==='RB')statStr=`${s.rushYds||0} Rush Yds, ${s.rushTD||0} TD`;
          else if(['WR','TE'].includes(aw.pos))statStr=`${s.recYds||0} Rec Yds, ${s.recTD||0} TD`;
          else if(['LB','DL'].includes(aw.pos))statStr=`${s.tackles||0} Tkl, ${s.sacks||0} Sacks`;
          else if(['CB','S'].includes(aw.pos))statStr=`${s.tackles||0} Tkl, ${s.ints||0} INTs`;
          return`<tr style="${isMe?'background:rgba(245,192,48,.06)':''}">
            <td style="font-weight:700;color:${color}">${icon} ${label}</td>
            <td style="font-weight:700;color:var(--gd)">${yr}</td>
            <td>${clsL(cls)}</td>
            <td><span class="cl" style="cursor:pointer;color:${isMe?color:'var(--te)'};font-weight:${isMe?700:400}" onclick="showPlayer(${aw.pid})">${isMe?'★ ':''}${aw.name}</span><br><span style="font-size:10px;color:var(--mu)">${aw.schName}</span></td>
            <td><span class="pb2">${aw.pos}</span></td>
            <td style="font-size:11px;color:var(--mu)">${rb(aw.rat||0)} ${devB(aw.dev||'Normal')}</td>
            <td style="font-size:11px;color:var(--tx)">${statStr||'–'}</td>
          </tr>`;
        }
        return aRow(h.mrFootball,'','var(--gd)','Mr. Football')+aRow(h.freshmanOTY,'','var(--b2)','Fr. of Year');
      }).join('')}${!awHistToShow.length?`<tr><td colspan="7" style="color:var(--mu);text-align:center;padding:14px">No awards history for this classification.</td></tr>`:''}
      </tbody></table></div>`;
    })()}</div>
    <div id="hist-rc" class="hid">
      <div class="tabs" style="margin-bottom:10px">
        <button class="tab on" onclick="swRTab2(this,'rc-gm')">Single Game</button>
        <button class="tab" onclick="swRTab2(this,'rc-se')">Season</button>
        <button class="tab" onclick="swRTab2(this,'rc-ca')">Career</button>
      </div>
      <div id="rc-gm">${recRow('game','Single-Game Records')}</div>
      <div id="rc-se" class="hid">${recRow('season','Season Records')}</div>
      <div id="rc-ca" class="hid">${recRow('career','Career Records')}</div>
    </div>
  </div></div>`;
}
function swRTab(btn,id){
  // Top-level history page tabs (hist-my, hist-lg, hist-rc)
  document.querySelectorAll('#ct [id^="hist-"]').forEach(el=>el.classList.add('hid'));
  const el=document.getElementById(id);if(el)el.classList.remove('hid');
  // Only toggle top-level tabs (direct children of the tab row)
  btn.closest('.tabs').querySelectorAll('.tab').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
}
function swRTab2(btn,id){
  // Nested records tabs inside hist-rc
  document.querySelectorAll('#hist-rc [id^="rc-"]').forEach(el=>el.classList.add('hid'));
  const el=document.getElementById(id);if(el)el.classList.remove('hid');
  btn.closest('.tabs').querySelectorAll('.tab').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
}

