// Gridiron 27 (beta, web version). Copyright (c) 2026 Kanra Digital. All rights reserved.
// The game, its code, art, data and names belong to Kanra Digital and may not be copied, re-hosted, modified for
// redistribution or sold without written permission.
const G27_COPY=Object.freeze({owner:'Kanra Digital',year:2026,get line(){return`© ${this.year} ${this.owner}. All rights reserved.`},mark:'g27-7f3a91c4',build:'__BUILD_ID__'});
// Official sites. Empty: the game runs anywhere. With hosts listed, a copy on any other site (or framed by one)
// shows an "unofficial copy" screen instead of the game. Subdomains count; local testing always works.
const G27_HOSTS=['gridiron27.neocities.org'];
const G27_HOME='https://gridiron27.neocities.org';   // the official address shown on that screen
function g27Official(h){h=(h||'').toLowerCase();if(!G27_HOSTS.length||!h||h==='localhost'||h==='127.0.0.1')return true;
  return G27_HOSTS.some(x=>h===x||h.endsWith('.'+x));}
(function(){
  let ok=location.protocol==='file:'||g27Official(location.hostname);
  // framed by another site: the parent has to be official too
  if(ok&&G27_HOSTS.length&&window.top!==window.self){let p='';try{p=window.top.location.hostname;}catch(e){try{p=(location.ancestorOrigins&&location.ancestorOrigins[0])||document.referrer;p=new URL(p).hostname;}catch(_){p='?';}}ok=g27Official(p);}
  try{document.documentElement.setAttribute('data-g27',G27_COPY.mark);document.documentElement.setAttribute('data-owner',G27_COPY.owner);
    console.info('%cGridiron 27','font-weight:800;font-size:14px','\n'+G27_COPY.line+' Build '+G27_COPY.build+'. Do not copy or re-host this game.');}catch(e){}
  if(ok)return;
  const show=()=>{const a=G27_HOME?`<p><a href="${G27_HOME}" target="_top" style="color:#f6a62a">Play the official game</a></p>`:'';
    document.body.innerHTML=`<div style="position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:24px;text-align:center;background:#0c0c0d;color:#e9e9ea;font:500 15px/1.5 system-ui,sans-serif"><h1 style="margin:0;font-size:22px">Unofficial copy</h1><p style="margin:0;max-width:420px">This copy of Gridiron 27 is hosted without permission.</p>${a}<p style="margin:0;font-size:12px;color:#8a8a8f">${G27_COPY.line}</p></div>`;};
  if(document.body)show();else document.addEventListener('DOMContentLoaded',show);
  throw new Error('Gridiron 27: unofficial host');
})();
