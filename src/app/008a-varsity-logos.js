// Team logos drawn like real high school athletic marks. Each school gets one primary mark from its name:
// a varsity block letter, an overlapping monogram, its mascot with a two-color outline, the mascot over a letter,
// a baseball script, its name arched over the mascot, or a round seal. Small sizes use a simpler cut of the same mark.
const _LGINK='#0b1118';
// a run of glyphs from a glyph table, left edge at x 0 and baseline at y 0 (cap height 100)
function _vgRun(T,t,track){let x=0,o='';const tr=track||0;
  for(const c of t){const g=T[c]||T[' '];if(!g){x+=30;continue;}if(g[1])o+=`<path d="${g[1]}" transform="translate(${x.toFixed(1)} 0)"/>`;x+=g[0]+tr;}
  return{o,w:Math.max(1,x-tr)};}
// markup m drawn three times: ink outer line, color band, then the fill. bw and ow are in logo units; sc is m's scale
function _vgInk(m,tf,sc,fill,band,bw,ow){const k=2/sc,j='stroke-linejoin="round" stroke-linecap="round"';
  return`<g transform="${tf}">`+(ow?`<g fill="${_LGINK}" stroke="${_LGINK}" stroke-width="${((bw+ow)*k).toFixed(2)}" ${j}>${m}</g>`:'')
    +(bw?`<g fill="${band}" stroke="${band}" stroke-width="${(bw*k).toFixed(2)}" ${j}>${m}</g>`:'')+`<g fill="${fill}">${m}</g></g>`;}
// a word centered on cx with its baseline at base, cap height h, never wider than maxW
function _vgWord(T,t,cx,base,h,maxW,fill,band,bw,ow,track){const r=_vgRun(T,t,track);let sc=h/100;if(r.w*sc>maxW)sc=maxW/r.w;
  return _vgInk(r.o,`translate(${(cx-r.w*sc/2).toFixed(2)} ${base}) scale(${sc.toFixed(4)})`,sc,fill,band,bw,ow);}
// text on a circle around (cx,cy): top reads along the outside of the arc, bottom along the inside
function _vgArc(T,t,cx,cy,R,h,maxDeg,top,fill,band,bw,ow){
  let sc=h/100;const adv=[...t].map(c=>((T[c]||T[' '])||[30])[0]+9),tot=adv.reduce((a,b)=>a+b,0)-9;
  const rm=top?R+h*.45:R-h*.45;let span=tot*sc/rm*180/Math.PI;if(span>maxDeg){sc*=maxDeg/span;span=maxDeg;}
  let o='',a=top?-span/2:180+span/2;const rad=Math.PI/180;let i=0;
  for(const c of t){const g=T[c]||T[' '],da=adv[i++]*sc/rm/rad,gh=(g?g[0]:30)*sc/rm/rad/2,mid=top?a+gh:a-gh;
    if(g&&g[1]){const x=cx+R*Math.sin(mid*rad),y=cy-R*Math.cos(mid*rad),rot=top?mid:mid-180;
      o+=`<path d="${g[1]}" transform="translate(${(x/sc).toFixed(1)} ${(y/sc).toFixed(1)}) rotate(${rot.toFixed(1)}) translate(${(-g[0]/2).toFixed(1)} 0)"/>`;}
    a+=top?da:-da;}
  return _vgInk(o,`scale(${sc.toFixed(4)})`,sc,fill,band,bw,ow);}
// the same artwork as one solid shape (every fill and line in col, grown by w) for a mascot's outline
function _vgSil(art,col,w){return`<g fill="${col}" stroke="${col}" stroke-width="${(w*2).toFixed(2)}" stroke-linejoin="round" stroke-linecap="round">`
  +art.replace(/\sstroke-dasharray="[^"]*"/g,'').replace(/\sopacity="[^"]*"/g,'').replace(/fill="(?!none)[^"]*"/g,`fill="${col}"`).replace(/stroke="[^"]*"/g,`stroke="${col}"`)
    .replace(/stroke-width="([\d.]+)"/g,(m,n)=>`stroke-width="${(+n+w*2).toFixed(2)}"`)+'</g>';}
// mascot art fitted into a box (x,y,w,h) with a band in col and an ink line around it
function _vgMascot(art,x,y,w,h,band,bw,ow){const bb=_lgm(art);if(!bb)return'';
  const sc=Math.min(w/bb.width,h/bb.height),tx=x+(w-bb.width*sc)/2-bb.x*sc,ty=y+(h-bb.height*sc)/2-bb.y*sc,k=1/sc;
  return`<g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${sc.toFixed(4)})">`+(ow?_vgSil(art,_LGINK,(bw+ow)*k):'')+(bw?_vgSil(art,band,bw*k):'')+art+'</g>';}
const _VG_STAR='M0 -10 L2.35 -3.24 L9.51 -3.09 L3.8 1.24 L5.88 8.09 L0 4 L-5.88 8.09 L-3.8 1.24 L-9.51 -3.09 L-2.35 -3.24Z';
function _sLogoBody(s,sz,ck){
  let c1=_hx(s.c1)?s.c1:'#33415c',c2=_hx(s.c2)?s.c2:'#ffffff';
  const h=[...(s.name||'')+'|'+(s.mascot||'')].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7),h2=h>>>7,h3=h>>>13;
  if(h2%4===3){const t=c1;c1=c2;c2=t;}
  if(Math.abs(_lm(c1)-_lm(c2))<.28)c2=_lm(c1)>.5?'#141b24':'#f2f4f7';
  const small=sz<=44,V=_LG_V,bw=small?6:4.6,ow=small?3:2.2;
  const up=t=>String(t||'').toUpperCase().replace(/[^A-Z0-9 &.]/g,'').replace(/\s+/g,' ').trim();
  const words=String(s.name||'').split(/\s+/).filter(w=>/[A-Za-z]/.test(w));
  const core=words.filter(w=>!/^(high|school|hs)$/i.test(w));
  const ini=(((s.name||'')+' '+(s.mascot||'')).match(/[A-Za-z0-9]/)||['H'])[0].toUpperCase();
  const two=(words.length>1?(words[0][0]+words[1][0]):(ini+'H')).toUpperCase().replace(/[^A-Z]/g,'')||ini;
  const isHS=!!s.cls||/\bhigh\b/i.test(s.name||'');
  // mascot art in the team palette
  const P={var:(h>>>11)%2,F:c1,K:_lm(c1)>.45?_mx(c1,'#000000',.7):'#f4f6f8',L:_mx(c1,'#ffffff',.42),D:_mx(c1,'#000000',.4),A:Math.abs(_lm(c1)-_lm('#f0b72f'))<.22?c2:'#f0b72f',O:_LGINK,ch:ini};
  const mk=(s.mascot||'').toLowerCase(),key=(s.logoKey&&_LGO[s.logoKey])?[s.logoKey,'']:_LK[mk];
  let art='',k='';
  if(key){k=key[0];let v=key[1];const alts=s.logoKey?null:_ALT[mk];if(alts&&h3%3===0){k=alts[(h3>>>2)%alts.length];v='';}
    let PP=P;if(v==='polar')PP=Object.assign({},P,{F:'#eef2f6',L:'#ffffff',D:'#aebbc8',K:'#1b2430'});else if(v==='zebra')PP=Object.assign({},P,{F:'#f2f2f2',L:'#ffffff',D:'#17191c',K:'#111111'});else if(v==='raven')PP=Object.assign({},P,{F:'#23262d',L:'#5a6170',D:'#0d0e11',K:'#f4f6f8'});
    try{art=_LGO[k](PP,v);if(_FLIP.has(k)&&(h3>>>4)%2)art=`<g transform="${_MR}">${art}</g>`;}catch(e){art='';}}
  // which mark this school uses
  const pick=h%20;let sty=pick<6?'block':pick<9?'mono':pick<14?'mascot':pick<16?'letter':pick<17?'script':pick<18?'arch':pick<19?'seal':'script';
  if(s.logoKey&&art)sty='mascot';
  if(!art){if(sty==='mascot')sty='block';else if(sty==='letter')sty='mono';else if(sty==='arch')sty='seal';}
  const scrW=[s.mascot,core[0]].map(x=>String(x||'').replace(/[^A-Za-z]/g,'')).find(x=>x.length>=3&&x.length<=9);
  if(sty==='script'&&!scrW)sty='block';
  const topName=up(core.join(' ')||s.name||'');
  if((sty==='arch'&&topName.length>12)||(sty==='seal'&&topName.length>16))sty=art?'mascot':'block';
  if(sty==='mono'&&two.length<2)sty='block';
  if(sty==='letter'&&/[OQCGDU]/.test(ini))sty='block'; // a mascot at the lower right turns these into a Q
  if(small){if(sty==='script'||sty==='seal')sty='block';else if(sty==='arch'||sty==='letter')sty='mascot';}
  let body='';
  if(sty==='block'){const r=_vgRun(V,ini);const sc=Math.min((100-2*(bw+ow)-2)/r.w,(small?84:80)/100);
    body=_vgInk(r.o,`translate(${(50-r.w*sc/2).toFixed(2)} ${(50+50*sc).toFixed(2)}) scale(${sc.toFixed(4)})`,sc,c1,c2,bw,ow);}
  else if(sty==='mono'){const a=two[0],b=two[1];
    body=_vgWord(V,a,small?36:35,small?66:64,small?58:54,small?54:48,c1,c2,bw,ow)+_vgWord(V,b,small?66:66,small?94:92,small?54:50,small?50:44,c1,c2,bw,ow);}
  else if(sty==='mascot')body=_vgMascot(art,8,8,84,84,c2,bw,ow);
  else if(sty==='letter'){const r=_vgRun(V,ini);const sc=Math.min(82/r.w,.74);
    body=_vgInk(r.o,`translate(${(42-r.w*sc/2).toFixed(2)} ${(10+100*sc).toFixed(2)}) scale(${sc.toFixed(4)})`,sc,c1,c2,bw,ow)+_vgMascot(art,50,50,46,46,c2,bw,ow);}
  else if(sty==='script'){const r=_vgRun(_LG_S,scrW.charAt(0).toUpperCase()+scrW.slice(1).toLowerCase());const sc=Math.min(86/r.w,.5),x0=50-r.w*sc/2,base=60;
    const tl=(x)=>((x-x0)/sc).toFixed(1),tb=(y)=>((y-base)/sc).toFixed(1);
    const sw=`<path d="M${tl(x0+4)} ${tb(base+9)} C${tl(36)} ${tb(base+20)} ${tl(66)} ${tb(base+19)} ${tl(96)} ${tb(base+3)} C${tl(70)} ${tb(base+13)} ${tl(38)} ${tb(base+14)} ${tl(x0+4)} ${tb(base+9)}Z"/>`;
    body=`<g transform="rotate(-8 50 52)">`+_vgInk(r.o+sw,`translate(${x0.toFixed(2)} ${base}) scale(${sc.toFixed(4)})`,sc,c1,c2,bw,ow)+'</g>';}
  else if(sty==='arch'){body=_vgArc(V,topName,50,98,60,14,90,true,c1,c2,3.4,1.8)+_vgMascot(art,26,45,48,50,c2,bw,ow);}
  else if(sty==='seal'){const bot=isHS?'HIGH SCHOOL':up(s.mascot||'')||'ATHLETICS';
    body=`<circle cx="50" cy="50" r="48" fill="${_LGINK}"/><circle cx="50" cy="50" r="46" fill="${c1}"/><circle cx="50" cy="50" r="31" fill="${c2}" stroke="${_LGINK}" stroke-width="2"/>`
      +_vgArc(V,topName,50,50,35.5,9.5,128,true,c2,'',0,0)+_vgArc(V,bot.slice(0,16),50,50,44,8.5,104,false,c2,'',0,0)
      +[-1,1].map(d=>`<path d="${_VG_STAR}" transform="translate(${50+d*38.8} 50) scale(.36)" fill="${c2}"/>`).join('');
    const r=_vgRun(V,ini);const sc=Math.min(40/r.w,.4);
    body+=_vgInk(r.o,`translate(${(50-r.w*sc/2).toFixed(2)} ${(50+50*sc).toFixed(2)}) scale(${sc.toFixed(4)})`,sc,c1,_LGINK,1.6,0);}
  // mascot mashup: the second mascot as a round badge
  if(s.mash&&_LGO[s.mash]){try{const P2=Object.assign({},P,{F:c2,L:_mx(c2,'#ffffff',.42),D:_mx(c2,'#000000',.4),K:_lm(c2)>.45?_mx(c2,'#000000',.7):'#f4f6f8'});
    body+=`<circle cx="80" cy="80" r="17" fill="${c1}" stroke="${_LGINK}" stroke-width="3"/><g transform="translate(68 68) scale(.24)">${_LGO[s.mash](P2,'')}</g>`;}catch(e){}}
  const out=`<svg width="__SZ__" height="__SZ__" viewBox="0 0 100 100" class="lg" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;overflow:visible">${body}</svg>`;
  _LGC.set(ck,out);return out.split('__SZ__').join(sz);
}
