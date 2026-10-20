/* ===================== route breaks that fool defenders ===================== */
function breakCut(e,fake){
  const ag=e.pl?(e.pl.rte?e.pl.agi*0.4+e.pl.rte*0.6:e.pl.agi):75;
  for(const d of G.ents){
    if(d.side!=='d'||d.down||d.eng>0||!d.cover||d.slip>0)continue;
    const dd=dist(d,e),isMan=d.cover.type==='man'&&d.cover.man===e;
    if(!(isMan&&dd<4.5)&&!(d.cover.type==='zone'&&!d.cover.deep&&dd<3)&&!(d.cover.type==='zone'&&d.cover.deep&&fake&&dd<6))continue;
    let p=0.14+(ag-((isMan?d.pl.mcv:d.pl.zcv)||d.pl.cov||60))*0.011+((e.pl?e.pl.spd:80)-d.pl.spd)*0.004+(fake?0.3:0)+(isMan?0.06:0)+WX.wet*0.07+WX.sn*0.09-(isMan?sla(d.team,'man',0.12):sla(d.team,'zone',0.12));
    if(Math.random()<clamp(p,0.03,0.82)){
      d.slip=fake?rnd(0.5,0.75):rnd(0.25,0.5);
      if(!isAI(e.team)&&!G.test&&d.slip>0.42)flash(fake?'He bit on the double move!':'Broke his ankles!');
    }
  }
}

/* ===================== AI brains ===================== */
function offBrain(e){
  const st=G.ballState,P=G.play,run=P.off.kind==='run',RD=P.off.data,ly=G.linesW.los;
  if(st==='carrier')return e.role==='QB'&&G.carrier!==e?[0,0]:blockerSeek(e);
  if(run){
    const carrierRole=RD.qb?G.qb:G.rb;
    if(RD.jet&&e===G.rb&&!G.carrier)return desire(e,e.x+(e.moDir||1)*6,ly-3.1,e.spd);
    if(RD.jet&&e===G.qb&&!G.carrier)return desire(e,CX+(G.rb.moDir||1)*0.3,ly-4.2,2.5);
    if(e===G.moMan&&!RD.jet&&G.t<1.3&&RD.mo&&RD.mo.k==='jet')return desire(e,e.x+(e.moDir||1)*6,ly-2.6,e.spd);
    if(e===carrierRole&&!RD.qb){
      if(RD.delay&&G.t<RD.delay)return desire(e,e.hx,e.hy,1);
      const p0=RD.path[0];
      if(RD.toss)return desire(e,CX+p0[0],ly+p0[1],e.spd); // toss: the back is already flying to the edge when the pitch comes
      return desire(e,lerp(G.qb.x,CX+p0[0],0.35),G.qb.y+0.9,e.spd);
    }
    if(e===G.qb){if(RD.delay&&G.t<RD.delay)return desire(e,e.hx,ly-7,3);return desire(e,e.hx,e.hy-0.4,1.5);}
    if(e.role==='OL'||e.role==='TE'){if(e.engWith)return glue(e);
      if(e.role==='TE'&&!e.engWith){const de=G.ents.find(d=>d.slot==='DE2'&&d.eng<=0);if(de&&dist(de,e)<5)return desire(e,de.x-0.3,de.y,e.spd);}
      {const os=gpOutside();if(os){const bl=G.ents.filter(o=>o.side===e.side&&(o.role==='OL'||o.role==='TE'));const edge=bl.reduce((m,o)=>((o.x-CX)*os>(m.x-CX)*os?o:m),bl[0]);
        if(edge===e){let tgt=null,tm=-1e9;for(const d of G.ents)if(d.side!==e.side&&!d.down&&d.eng<=0&&(d.role==='DL'||d.role==='LB')&&dist(d,e)<9){const v=(d.x-CX)*os;if(v>tm){tm=v;tgt=d;}}
          if(tgt)return desire(e,tgt.x+os*0.6,tgt.y,e.spd*1.05);}}}
      let best=null,bd=8.5;const _os=gpOutside();for(const d of G.ents)if(d.side==='d'&&d.eng<=0&&d.engCD<=0&&!d.down){const dd=dist(d,e)+(d.role==='DL'?0:1.5)+(_os&&(d.x-CX)*_os<-2?2.5:0)-(_os&&(d.x-CX)*_os>1?0.8:0);if(dd<bd&&d.y>e.y-1){bd=dd;best=d;}}
      return best?desire(e,best.x,best.y,e.spd):desire(e,e.x,e.y+2,3);}
    if(e.fb&&e!==G.rb){if(e.engWith)return glue(e);
      const p0=(RD.path&&RD.path[RD.toss?1:0])||[0,0],hx=CX+p0[0]*(RD.toss?1:0.9);
      if(G.t<0.55&&!G.carrier)return desire(e,lerp(e.x,hx,0.6),ly-0.6,e.spd*0.95);
      let tgt=null,bs=1e9;for(const d of G.ents){if(d.side==='o'||d.down||d.eng>0||d.engCD>0)continue;const dd=Math.hypot(d.x-hx,d.y-(ly+1.5))+(d.role==='DL'?1.5:0);if(dd<bs&&dd<9){bs=dd;tgt=d;}}
      return tgt?desire(e,tgt.x,tgt.y-0.3,e.spd*1.02):desire(e,hx,ly+3,e.spd);}
    if(e.role==='WR'||(e.role==='TE'&&gpOutside()))return gpStalk(e);
    return desire(e,e.x,e.y+3,4);
  }
  const PD=P.off.data||{};
  if(e.role==='QB'){if(PD.pa)return G.t<0.7?desire(e,e.hx+0.6,e.hy+0.2,2):desire(e,CX+8,ly-6.5,4.4);if(PD.screen)return desire(e,e.hx,ly-8,3.4);{const qd=(G.form&&G.form.qbD)||5;return desire(e,e.hx,ly-qd-(qd<4?4.2:2.6),3.6);}}
  if(PD.pa&&e===G.rb&&G.t<0.8)return desire(e,CX+1.5,ly+0.5,e.spd*0.9);
  if(PD.screen&&e.role==='OL'&&G.t>0.9){if(e.engWith&&G.t<1.2)return glue(e);e.engWith=null;return desire(e,clamp(G.rb.x-2+(e.hx-CX)*0.8,1,FW-1),ly+1.5,e.spd);}
  if(e.role==='OL'||(e.role==='TE'&&e.block)||(e.role==='RB'&&e.block)){
    if(e.engWith)return glue(e);
    let best=null,bd=e.role==='OL'?4.5:6;for(const d of G.ents){if(d.side!=='d'||d.eng>0||d.down)continue;const dd=dist(d,e.role==='OL'?e:G.qb);if(dd<bd){bd=dd;best=d;}}
    if(!best)return desire(e,e.hx,e.role==='OL'?e.hy-1.5:G.qb.y+0.5,3);
    const q=G.qb;let ux=q.x-best.x,uy=q.y-best.y;const l=Math.hypot(ux,uy)||1;
    return desire(e,best.x+ux/l*0.9,best.y+uy/l*0.9,e.spd);
  }
  if(st==='air'&&G.recv.includes(e)){
    const a=G.air,c=a.cur,IX=x=>clamp(x,0.55,FW-0.55),IY=y=>Math.min(y,119.4); // keep the feet in: toe-tap rather than run out
    if(c&&c.h<4.2&&Math.hypot(e.x-c.x,e.y-c.y)<3.2)return desire(e,IX(c.x),IY(c.y),e.spd*1.12);
    if(e===a.intended&&(a.t>a.T*0.2||a.D<14))return desire(e,IX(a.tx),IY(a.ty),e.spd*1.1);
  }
  return routeRun(e);
}
function eyeDrift(z,e){
  let tx,ty;
  if(G.aim&&!G.aim.run){tx=G.qb.x+G.aim.dx*G.aim.D;ty=G.qb.y+G.aim.dy*G.aim.D;}
  else if(G.qbLook&&G.ballState==='qb'){tx=G.qbLook.x;ty=G.qbLook.y;}else return[0,0];
  const f=e&&e.readF?e.readF:1;
  return[clamp((tx-z.x)*0.22*f,-3*f,3*f),clamp((ty-z.y)*0.12*f,-2*f,2*f)];
}
function coverBrain(e){
  const ly=G.linesW.los,C=e.cover,PD=(G.play&&G.play.off&&G.play.off.data)||{};
  if(!C||C.type==='rush'||C.type==='blitz'){const A=G.dAdj;
    // contain: the two edge rushers keep the quarterback inside them instead of running past him
    if(A&&A.con&&e.role==='DL'&&Math.abs(e.hx-CX)>4){const sd=Math.sign(e.hx-CX);return desire(e,G.qb.x+sd*2.4,Math.max(G.qb.y,ly-1.5),e.spd);}
    return desire(e,G.qb.x,G.qb.y,e.spd);}
  if(C.type==='spy')return desire(e,clamp(G.qb.x,CX-9,CX+9),ly+4.5,e.spd*0.95); // mirror the quarterback from 4-5 yards
  if(PD.pa&&G.t<0.75&&(e.role==='LB'||(e.role==='S'&&C.type==='zone'&&!C.deep)))return desire(e,lerp(e.x,G.rb.x,0.4),ly+2,e.spd*0.8);
  if(C.kind==='robber'){
    // sit in the middle hole, read the quarterback and jump crossers
    let th=null,bd=6;for(const r of G.recv){if(r.y<ly+3||r.y>ly+14)continue;const d=Math.abs(r.x-CX);if(d<bd){bd=d;th=r;}}
    const[ex2]=eyeDrift(C,e);
    if(th)return desire(e,lerp(th.x,G.qb.x,0.12),clamp(th.y+0.8,ly+5,ly+13),e.spd);
    return desire(e,C.x+ex2*1.6,C.y,e.spd*0.85);
  }
  if(C.kind==='tampa'){
    // Mike opens and runs to the deep middle, carrying any seam
    let seam=null;for(const r of G.recv)if(r.y>ly+7&&Math.abs(r.x-CX)<7&&(!seam||r.y>seam.y))seam=r;
    if(seam)return desire(e,lerp(seam.x,CX,0.3),Math.min(118,seam.y+1.5),e.spd);
    return desire(e,CX,Math.min(118,ly+Math.min(15,4+G.t*6)),e.spd*0.95);
  }
  if(C.type==='man'){
    const r=C.man;
    if(r.block||!r.route){e.cover=zone(CX,ly+6,6);return coverBrain(e);}
    const p=past(r,e.tau),lev=Math.sign(CX-r.x)||1;
    if(r.y>e.y+0.5)return desire(e,r.x+r.vx*0.3,r.y+r.vy*0.3,e.spd*e.spdF);
    const cush=e.press?Math.max(0.6,1.2-G.t*0.5):Math.max(0.9,e.cush0-G.t*1.9);
    const ld=e.edge>8?Math.min(0.7,(e.edge-8)*0.05):0;
    return desire(e,p.x+p.vx*(0.2+ld)+lev*0.55,p.y+p.vy*(0.2+ld)+Math.max(0.35,cush-ld),e.spd*e.spdF);
  }
  const[ex,ey]=eyeDrift(C,e);
  const home={x:C.x+ex,y:Math.min(118.5,C.y+ey)};
  if(C.deep){
    // stay over the top of the deepest threat in your third/half/quarter, but never leave it
    let deep=null;for(const r of G.recv)if(r.y>ly+6&&Math.abs(r.x-C.x)<C.hw&&(!deep||r.y>deep.y))deep=r;
    if(C.kind==='match'){
      // quarters: carry a vertical inside your quarter man-to-man past 10 yards, otherwise help underneath
      let v=null;for(const r of G.recv)if(r.y>ly+9&&Math.abs(r.x-C.x)<C.hw+2&&r.vy>2&&(!v||r.y>v.y))v=r;
      if(v)return desire(e,v.x+Math.sign(CX-v.x)*0.6,Math.min(119,v.y+1.8),e.spd*e.spdF);
      let s2=null;for(const r of G.recv)if(r.y>ly+3&&r.y<ly+12&&Math.abs(r.x-C.x)<C.hw)s2=r;
      if(s2)return desire(e,lerp(home.x,s2.x,0.5),Math.max(ly+9,s2.y+3),e.spd*0.9);
    }
    if(deep){const tx=clamp(deep.x*0.7+home.x*0.3,C.x-C.hw*0.6,C.x+C.hw*0.6),ty=Math.min(119,Math.max(deep.y+3.2,ly+10));return desire(e,tx,ty,e.spd*0.95);}
    return desire(e,home.x,home.y,e.spd*0.8);
  }
  // underneath zone: only receivers inside the zone count, chosen by how close they are to the zone, not to the defender
  let th=null,bd=1e9;
  for(const r of G.recv){
    const dx=Math.abs(r.x-home.x),dyy=r.y-home.y;
    if(dx>C.hw||r.y<ly-1||dyy>5.5||dyy<-8)continue;
    const d=Math.hypot(dx,dyy*1.3);if(d<bd){bd=d;th=r;}
  }
  if(th){
    let ux=G.qb.x-th.x,uy=G.qb.y-th.y;const l=Math.hypot(ux,uy)||1;
    let ox=th.x+ux/l*1.2-home.x,oy=th.y+uy/l*1.2-home.y;const ol=Math.hypot(ox,oy),R=C.hw*0.55;
    if(ol>R){ox*=R/ol;oy*=R/ol;}
    return desire(e,home.x+ox,clamp(home.y+oy,ly+2,Math.min(118,C.y+4)),e.spd*0.92);
  }
  return desire(e,home.x,home.y,e.spd*0.85);
}
function defBrain(e){
  const st=G.ballState;
  if(st==='carrier'){
    if(G.carrier.side===e.side)return blockerSeek(e);
    const _os=gpOutside();
    {const RDj=G.play.off&&G.play.off.data;if(RDj&&RDj.jet&&e.role==='DL'&&G.t<0.85&&!e.engWith&&(e.x-CX)*(G.carrier.moDir||1)>1.5&&!e.jetRead){
      // the end on the jet side crashes the mesh unless he reads it in time
      if(e.jetBite==null)e.jetBite=Math.random()<clamp(0.75-((e.pl.awr||70)-70)*0.02,0.25,0.9);
      if(e.jetBite)return desire(e,CX,e.y-1.4*attackDir(G.carrier),e.spd*0.95);}}
    if(_os&&(e.role==='DL'||(e.cover&&(e.cover.type==='rush'||e.cover.type==='blitz')))&&G.t<0.75&&!e.engWith)return desire(e,e.x+(e.x-CX)*0.05,e.y-2.2*attackDir(G.carrier),e.spd*0.9);
    const _jet=G.play.off&&G.play.off.data&&(G.play.off.data.jet||G.play.off.data.touch);
    const reading=G.play.kind==='scrimmage'&&(G.play.off.kind==='run'||_jet)&&G.t<e.read+(_os&&e.role!=='DL'?0.6:0)+(_jet&&e.role!=='DL'?0.25:0)&&e.cover&&e.cover.type!=='rush'&&e.cover.type!=='blitz';
    if(gpScrambling()&&e.cover&&e.cover.type!=='rush'&&e.cover.type!=='blitz'){if(e.bite==null)e.bite=e.cover.type==='spy'||gpBite(e);if(!e.bite&&dist(e,G.carrier)>3.5)return coverBrain(e);}
    return reading?coverBrain(e):pursuit(e,G.carrier);
  }
  if(st==='air'){
    const a=G.air,since=G.t-G.throwT;
    if(!e.cover||e.cover.type==='rush'||e.cover.type==='blitz')return since>0.4&&a.intended?desire(e,a.intended.x,a.intended.y,e.spd):coverBrain(e);
    if(since>e.react){
      const reach=Math.hypot(e.x-a.tx,e.y-a.ty)/e.spd,remain=Math.max(0,a.T-a.t);
      if(reach<remain+0.7)return desire(e,a.tx,a.ty,e.spd*1.02);
      if(a.intended)return desire(e,a.intended.x,a.intended.y,e.spd);
    }
  }
  return coverBrain(e);
}
function looseBrain(e){const L=G.loose;if(L.kind==='inc')return desire(e,e.x,e.y,0);if(dist(e,L)<15)return desire(e,L.x,L.y,e.spd*1.05);return[e.vx*0.5,e.vy*0.5];}

/* ---- special teams brains ---- */
function kickoffBrain(e){
  const P=G.play,K=G.kick;
  if(G.loose&&G.loose.kind==='onside'&&e.role!=='K'){const L=G.loose;if(e.side==='o'&&L.t<(P.oform==='popup'?0.1:P.oform==='std'?0.72:0.6))return desire(e,e.hx,e.hy+1,2.5);return desire(e,L.x+L.vx*0.25,L.y+L.vy*0.25,e.spd*(e.side==='o'?0.93:1));} // the hands team reacts at the kick
  if(e.side==='d'){
    if(e.role==='K'){if(!K)return desire(e,CX,e.hy-3.5,4.5);return desire(e,CX,e.hy-14,3);}
    if(P.onside&&e.role==='COV'&&G.t>P.kickAt-0.35&&!G.loose)return desire(e,e.hx+(CX-e.hx)*0.2,e.hy-3,e.spd*0.9);
    if(!K||G.t<P.kickAt)return[0,0];
    return desire(e,e.hx,e.hy-40,e.spd);
  }
  if(e.role==='KR'){
    const tgt=K?[K.tx,K.ty]:[e.hx,e.hy];
    const lead=P.rets.reduce((a,b)=>K&&Math.hypot(b.x-K.tx,b.y-K.ty)<Math.hypot(a.x-K.tx,a.y-K.ty)?b:a);
    if(e===lead)return desire(e,tgt[0],tgt[1],e.spd);
    return desire(e,lerp(e.hx,tgt[0],0.4),tgt[1]+6,e.spd*0.7);
  }
  if(!K)return[0,0];
  return desire(e,e.hx,Math.max(14,(K.ty||15)+16),e.spd*0.8);
}
function puntBrain(e){
  const P=G.play,K=G.kick,ly=G.linesW.los;
  if(e.side==='d'){
    if(e.role==='P'){if(!K&&G.t>1.4)return desire(e,e.hx,e.hy-1.2,2.5);return[0,0];}
    if(e.role==='GUN')return K?desire(e,K.tx+(e.hx<CX?-1.5:1.5),K.ty+1,e.spd*1.05):desire(e,e.hx<CX?5:FW-5,ly-30,e.spd*1.05);
    if(!K&&G.t<1.1){if(e.engWith)return glue(e);return desire(e,e.hx,e.hy+0.6,1.5);}
    const tx=K?K.tx:CX,ty=K?K.ty:ly-35;return desire(e,lerp(e.hx,tx,0.6),ty+3,e.spd*1.05);
  }
  if(e.role==='PR'){if(K)return desire(e,K.tx,K.ty,e.spd);return desire(e,e.hx,e.hy,2);}
  if(e.role==='RUSH'){if(!K)return desire(e,P.punter.x,P.punter.y,e.spd);return desire(e,e.x,Math.max(ly-25,K.ty+12),e.spd*0.8);}
  if(e.role==='JAM'){const g=P.gunners[e.slot==='JAM1'?0:1];if(e.engWith)return glue(e);return desire(e,g.x,g.y,e.spd);}
  return desire(e,e.hx,K?K.ty+14:e.hy,e.spd*0.7);
}
function fgBrain(e){
  const P=G.play;
  if(e.side==='o'){
    if(e.role==='K'){if(G.t<0.55)return[0,0];if(!G.kick)return desire(e,P.holder.x-0.3,P.holder.y-0.5,4.2);return desire(e,e.x,e.y+0.5,1);}
    if(e.role==='H')return[0,0];
    if(e.engWith)return glue(e);
    let best=null,bd=2.5;for(const d of G.ents)if(d.side==='d'&&d.eng<=0&&!d.down){const dd=dist(d,e);if(dd<bd){bd=dd;best=d;}}
    return best?desire(e,best.x,best.y-0.5,3):[0,0];
  }
  if(e.role==='S')return desire(e,e.hx,e.hy+3,2);
  return desire(e,P.holder.x,P.holder.y,e.spd*0.9);
}
