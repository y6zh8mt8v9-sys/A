/* ===================== special teams setup ===================== */
function setupKickoff(kickTeam,spot){try{gpHotseat(kickTeam);}catch(e){}
  const K=G.teams[kickTeam],R=G.teams[1-kickTeam];autoSubs(K);autoSubs(R);
  G.offTeam=1-kickTeam;G.flip=gpFlipFor(G.offTeam);
  const ky=110-spot,L=[];
  const kicker=K.byPos('K')[0];
  const kick=addE(L,K,kicker,'d','K',CX,ky+4,'K');
  const cover=fillUnit(K,10,[kicker],['LB','S','CB','DL','WR','RB','TE']);
  const xs=[3.5,8,12.5,17,21.5],of=typeof G.onsideNext==='string'?G.onsideNext:null;
  if(of==='left'||of==='right'){const sd=of==='left'?-1:1;   // overload: seven stacked to the kick side, three to hold the other
    cover.forEach((p,i)=>{const x=i<7?CX+sd*(2.2+i*2.6):CX-sd*(6+(i-7)*7);addE(L,K,p,'d','COV',clamp(x,1.5,FW-1.5),ky+0.8,'COV'+i);});}
  else cover.forEach((p,i)=>{const side=i%2?1:-1,j=Math.floor(i/2);addE(L,K,p,'d','COV',CX+side*xs[j]*(of==='popup'?0.7:1),ky+0.8,'COV'+i);});
  const rets=fastest(R,['RB','WR','CB'],[]).slice(0,2);
  const kr1=addE(L,R,rets[0],'o','KR',CX-6,12,'KR'),kr2=addE(L,R,rets[1],'o','KR',CX+6,13,'KR2');
  const blk=fillUnit(R,9,rets,['TE','LB','WR','RB','S','OL','DL']);
  const fx=[8,16,CX,FW-16,FW-8],mx=[CX-9,CX-3,CX+3,CX+9];
  blk.forEach((p,i)=>{const[x,y]=i<5?[fx[i],ky-10.5]:[mx[i-5],ky-25];addE(L,R,p,'o','BLK',x,y,'BLK'+i);});
  G.ents=L;G.refs=mkRefs(ky);G.refs[0].y=ky+6;G.refs[3].y=10;
  G.play={kind:'kickoff',kickTeam,spot,kicker:kick,rets:[L.find(e=>e.slot==='KR'),L.find(e=>e.slot==='KR2')],onside:!!G.onsideNext,oform:of||'std',ky};G.onsideNext=false;
  G.linesW=null;resetBall();
}
function setupPunt(puntTeam,los){
  const P=G.teams[puntTeam],R=G.teams[1-puntTeam];autoSubs(P);autoSubs(R);
  G.offTeam=1-puntTeam;G.flip=gpFlipFor(G.offTeam);
  const ly=110-los,L=[];
  const punter=P.byPos('P')[0],ls=slotPlayer(P,'C');
  const pe=addE(L,P,punter,'d','P',CX,Math.min(ly+14,119),'P');
  addE(L,P,ls,'d','LS',CX,ly+0.8,'LS');
  const line=fillUnit(P,8,[punter,ls],['OL','TE','LB','WR','RB','DL']);
  const gun=fastest(P,['WR','CB','RB','S'],[punter,ls,...line]).slice(0,2);
  const lineFixed=line.slice(0,4),wings=line.slice(4,6),pp=line[6];
  [[-1.9,0.9],[1.9,0.9],[-3.8,1.0],[3.8,1.0]].forEach(([dx,dy],i)=>addE(L,P,lineFixed[i],'d','PL',CX+dx,ly+dy,'PL'+i));
  [[-5.3,1.8],[5.3,1.8]].forEach(([dx,dy],i)=>addE(L,P,wings[i],'d','PL',CX+dx,ly+dy,'W'+i));
  addE(L,P,pp,'d','PL',CX+0.8,ly+5,'PP');
  const g1=addE(L,P,gun[0],'d','GUN',3,ly+0.9,'GUN1'),g2=addE(L,P,gun[1],'d','GUN',FW-3,ly+0.9,'GUN2');
  const pr=fastest(R,['RB','WR','CB'],[])[0];
  const others=fillUnit(R,10,[pr],['LB','DL','CB','S','TE','WR']);
  [-1,1,-3,3,-5.5,5.5].forEach((dx,i)=>addE(L,R,others[i],'o','RUSH',CX+dx,ly-1.2,'RU'+i));
  addE(L,R,others[6],'o','JAM',3.6,ly-1.5,'JAM1');addE(L,R,others[7],'o','JAM',FW-3.6,ly-1.5,'JAM2');
  addE(L,R,others[8],'o','HOLD',CX-6,ly-10,'HU1');addE(L,R,others[9],'o','HOLD',CX+6,ly-10,'HU2');
  const pre=addE(L,R,pr,'o','PR',CX,Math.max(8,ly-40),'PR');
  G.ents=L;G.refs=mkRefs(ly);G.refs[0].y=ly+17;G.refs[3].y=Math.max(4,ly-44);
  G.play={kind:'punt',puntTeam,los,punter:pe,ret:pre,gunners:[g1,g2]};
  G.linesW={los:ly,fd:null};resetBall();
}
function setupFG(kind){
  const O=G.teams[G.offTeam],D=G.teams[1-G.offTeam];autoSubs(O);autoSubs(D);pcLineup();G.flip=gpFlipFor(G.offTeam);
  const ly=10+G.los,L=[];
  const k=O.byPos('K')[0],holder=O.byPos('P')[0];
  const ke=addE(L,O,k,'o','K',CX-1.6,ly-9.6,'K'),he=addE(L,O,holder,'o','H',CX,ly-7,'H');
  const line=[slotPlayer(O,'C'),slotPlayer(O,'LG'),slotPlayer(O,'RG'),slotPlayer(O,'LT'),slotPlayer(O,'RT'),slotPlayer(O,'TE')];
  const ext=fillUnit(O,3,[k,holder,...line],['TE','OL','DL','LB']);
  [[0,-0.8],[-1.9,-0.8],[1.9,-0.8],[-3.8,-1],[3.8,-1],[5.6,-1.4]].forEach(([dx,dy],i)=>addE(L,O,line[i],'o',i===0?'LS':'OL',CX+dx,ly+dy,'FL'+i));
  [[-5.6,-1.4],[-6.6,-2.2],[6.6,-2.2]].forEach(([dx,dy],i)=>addE(L,O,ext[i],'o','OL',CX+dx,ly+dy,'FX'+i));
  const rush=[...DSLOTS.map(([s])=>slotPlayer(D,s))];
  [-0.9,0.9,-2.8,2.8,-4.7,4.7,-6.8,6.8,0].forEach((dx,i)=>addE(L,D,rush[i],'d','FGR',CX+dx,ly+(i===8?6:1.2),'FR'+i));
  addE(L,D,rush[9],'d','S',CX-8,ly+11,'FS1');addE(L,D,rush[10],'d','S',CX+8,ly+11,'FS2');
  G.ents=L;G.refs=mkRefs(ly);G.refs[3].y=Math.min(122,ly+30);
  G.play={kind,kicker:ke,holder:he,two:false};
  G.linesW={los:ly,fd:null};resetBall();
}

/* ===================== movement helpers ===================== */
function desire(e,tx,ty,spd){const dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy);if(d<0.08)return[0,0];const s=spd*Math.min(1,d/0.6);return[dx/d*s,dy/d*s];}
function accel(e,tvx,tvy,dt,acc){const a=(acc||e.acc)*dt;let dx=tvx-e.vx,dy=tvy-e.vy;const d=Math.hypot(dx,dy);if(d>a){dx*=a/d;dy*=a/d;}e.vx+=dx;e.vy+=dy;}
function past(r,tau){const t=G.t-tau,h=r.hist;for(let i=h.length-1;i>=0;i--)if(h[i].t<=t)return h[i];return h[0]||{x:r.x,y:r.y,vx:r.vx,vy:r.vy};}
const attackDir=e=>e.side==='o'?1:-1;
const foesOf=c=>G.ents.filter(e=>e.side!==c.side&&!e.down&&!e.hurt);
function glue(e){const d=e.engWith,f=G.carrier||G.qb||e;let ux=f.x-d.x,uy=f.y-d.y;const l=Math.hypot(ux,uy)||1;return desire(e,d.x+ux/l*0.85,d.y+uy/l*0.85,7);}
function blockerSeek(e){
  if(e.engWith)return glue(e);
  const c=G.carrier,ad=attackDir(c);let best=null,bs=1e9;
  for(const d of G.ents){if(d.side===e.side||d.eng>0||d.engCD>0||d.down||(d.y-c.y)*ad<-3)continue;const de=dist(d,e);if(de>9)continue;const s=de+0.5*dist(d,c);if(s<bs){bs=s;best=d;}}
  return best?desire(e,best.x,best.y,e.spd):desire(e,c.x+(e.x>c.x?3:-3),c.y+3*ad,e.spd*0.8);
}
function pursuit(d,c){
  let t=dist(d,c)/Math.max(1,d.spd),px=c.x,py=c.y;
  for(let i=0;i<3;i++){t=Math.min(t,1.1);px=c.x+c.vx*t;py=c.y+c.vy*t;t=Math.hypot(px-d.x,py-d.y)/Math.max(1,d.spd);}
  // full effort in pursuit; the faster man (speed rating and legs left) wins the race
  const os=gpOutside(),back=os&&(d.x-CX)*os<-3?0.94:1,rel=c.pl&&d.pl?clamp(1.01+((d.pl.spd||70)-(c.pl.spd||75))*0.0035,0.93,1.08):1;
  return desire(d,clamp(px,0,FW),py,d.spd*rel*back);
}

/* ===================== route running ===================== */
function routeRun(e){
  const r=e.route;if(!r)return[0,0];
  const jam=e.jam>0?0.35:1;
  if(r.delay&&G.t<r.delay)return desire(e,e.hx-0.6,e.hy-0.8,1.6);
  let pt=r.pts[r.i];
  if(pt){
    const dp=Math.hypot(pt.x-e.x,pt.y-e.y);
    r.wt=(r.wt||0)+1/60;
    const passed=dp<1.4&&((pt.x-e.x)*e.vx+(pt.y-e.y)*e.vy)<0&&Math.hypot(e.vx,e.vy)>1;
    if(dp<0.45||passed||r.wt>3.5){if((pt.c<0.6||pt.fake)&&r.i<r.pts.length-1){e.plant=0.18;breakCut(e,pt.fake);}r.i++;r.wt=0;pt=r.pts[r.i];}
  }
  if(pt){
    const d=Math.hypot(pt.x-e.x,pt.y-e.y),cut=pt.c*e.spd,v=Math.min(e.spd,Math.sqrt(cut*cut+2*6.5*d))*jam;
    let vx=(pt.x-e.x)/d*v,vy=(pt.y-e.y)/d*v;
    // swerve: a defender sitting right in the route's path is stepped around, not run into
    for(const o of G.ents){if(o.side!=='d'||o.down)continue;const ox=o.x-e.x,oy=o.y-e.y,od=Math.hypot(ox,oy);if(od>1.6||od<0.01)continue;
      const ahead=(ox*vx+oy*vy)/(od*(v||1));if(ahead<0.55)continue;
      const side=(ox*vy-oy*vx)>0?-1:1,k=(1.6-od)/1.6*0.85,px=-vy,py=vx;vx+=px*side*k;vy+=py*side*k;const m=Math.hypot(vx,vy)||1;vx=vx/m*v;vy=vy/m*v;}
    return[vx,vy];
  }
  const z=r.pts[r.pts.length-1];
  if(r.end==='cont'){
    const a=r.pts[r.pts.length-2]||{x:e.hx,y:e.hy};let dx=z.x-a.x,dy=z.y-a.y;const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;
    if((e.x<2.2&&dx<0)||(e.x>FW-2.2&&dx>0)){dx=0;dy=1;}
    if(e.y>117)dy=Math.min(dy,0);
    return[dx*e.spd*jam,dy*e.spd*jam];
  }
  e.settled=true;
  if(!e.hole||G.t>e.holeT){
    e.holeT=G.t+0.3;let best={x:e.x,y:e.y},bs=-1;
    for(let i=0;i<9;i++){
      const a=i/9*Math.PI*2,rr=i===0?0:1.6,c={x:clamp(z.x+Math.cos(a)*rr,2,FW-2),y:Math.max(G.linesW.los+2,z.y+Math.sin(a)*rr)};
      let m=99;for(const d of G.ents)if(d.side==='d'&&!d.down)m=Math.min(m,Math.hypot(d.x-c.x,d.y-c.y));
      const s=m-0.25*Math.hypot(c.x-e.x,c.y-e.y);if(s>bs){bs=s;best=c;}
    }
    e.hole=best;
  }
  return desire(e,e.hole.x,e.hole.y,2.4);
}

