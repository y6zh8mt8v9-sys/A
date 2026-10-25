/* ===================== animation: poses ===================== */
function runPose(e,mv){
  const ph=e.back?(8-(e.anim%8))%8:e.anim%8,f=Math.floor(ph)%8,t=ph-Math.floor(ph),A=RUN8[f],B=RUN8[(f+1)%8],o={};
  const s=clamp(mv/4.6,0.35,1);
  for(const k of JK){o[k]=[lerp(A[k][0],B[k][0],t),lerp(A[k][1],B[k][1],t)];}
  for(const k of['nk','nf','fk','ff','ne','nh','fe','fh'])o[k][0]*=s;
  const lean=e.back?-0.15:s;o.sh[0]=2+(o.sh[0]-2)*lean;o.hd[0]=5+(o.hd[0]-5)*lean;
  const bob=lerp(RBOB[f],RBOB[(f+1)%8],t)*s;
  for(const k of['hip','sh','hd','ne','nh','fe','fh'])o[k][1]+=bob;o.nk[1]+=bob*0.5;o.fk[1]+=bob*0.5;
  return o;
}
function holdsBall(e){
  const bs=G.ballState;
  if(e.celeb&&e.celeb.noBall)return false;
  if(e===G.carrier)return bs==='carrier'||G.seq&&G.seq.c===e;
  if(e===G.qb&&bs==='qb')return true;
  if(e.role==='P'&&bs==='punter')return true;
  if(e===G.picker&&G.phase!=='live')return true;
  return false;
}
function poseFor(e){
  const mv=Math.hypot(e.vx,e.vy),ca=e.ca,P=G.play,hb=holdsBall(e),bs=G.ballState;
  if(!e.pl){ // referees
    let R={...STAND};if(mv>0.5)Object.assign(R,runPose(e,mv));
    if(e.flagT>0)Object.assign(R,FLAGTHROW);
    if(G.cele!=null&&G.phase!=='live'&&G.result&&G.result.S&&G.result.S.td!=null)Object.assign(R,SIGNAL_TD);
    return R;
  }
  if(e.hurt&&e.down)return{...DOWN};
  if(e.celeb&&G.phase!=='live'){const T=e.celeb.type;return T==='nap'&&e.celeb.t>0.5?{...DOWNB}:T==='worm'&&Math.floor(e.celeb.t*2.5)%2&&e.celeb.t<3.2?{...DOWN}:/^(fdpoint|heisman|sackpoint|arrow|sprinkler)$/.test(T)?{...STAND,...STIFF,ball:null}:T==='spike'&&e.celeb.t<0.4?{...STAND,...REL}:{...STAND,...CHEER};}
  if(e.down){const D={...(e.fall==='back'?DOWNB:DOWN)};if(hb)D.ball=e.fall==='back'?[-30,-14]:[44,-10];return D;}
  const S=G.seq;
  if(S&&S.c===e){const u=S.t/S.dur;let Q;
    if(S.type==='hit')Q={...FALLB};else if(S.type==='shoe')Q={...STUMBLE};else Q=u<0.5?{...STAND,...runPose(e,2),...DRAG}:{...STUMBLE};
    Q.ball=S.type==='hit'?[0,-66]:[20,-44];return Q;}
  if(S&&S.v&&S.fs[0]===e)return{...(S.v==='form'?WRAP:S.v==='stick'?(S.t<S.dur*0.35?STICKT:HIT):BITET)};
  if(S&&S.fs.includes(e))return{...(S.type==='hit'?HIT:S.type==='shoe'?SHOE:S.type==='dive'?DIVE:WRAP)};
  if(e.lunge>0&&UTK[e.lt])return{...(e.lt==='form'?FORMT:e.lt==='stick'?STICKT:BITET)};
  if(e.lunge>0)return{...(e.lt==='shoe'?SHOE:e.lt==='hit'?HIT:DIVE)};
  if((ca&&ca.type==='dive')||e.dive>0){const Q={...DIVE};if(hb&&!(ca&&ca.drop))Q.ball=[44,-30];return Q;}
  if(e.kickT>0)return{...KICKP};
  if(P&&(P.kind==='fg'||P.kind==='xp')&&e.role==='H'){const Q={...HOLDER};if(bs==='held')Q.ball=[16,-6];return Q;}
  if(P&&P.special==='kneel'&&e===G.qb&&G.phase!=='presnap')return{...HOLDER,ball:[10,-40]};
  if(G.phase==='presnap'||(G.phase==='menu')||(G.phase==='live'&&G.t<0.05)){
    const r=e.role;
    if(r==='OL'||r==='DL'||r==='LS'||r==='PL'||r==='RUSH'||r==='FGR')return{...(r==='LS'?SNAPPER:STANCE3)};
    if(r==='QB')return{...SHOTGUN};
    if(r==='WR'||r==='TE'||r==='GUN'||r==='JAM')return{...WRSTANCE};
    if(r==='KR'||r==='PR'||r==='K'||r==='P'||r==='H'||r==='COV'||r==='BLK'||r==='HOLD')return{...STAND,...(r==='COV'||r==='BLK'?CROUCH:{})};
    return{...CROUCH};
  }
  let Q={...STAND};
  if(mv>0.6)Object.assign(Q,runPose(e,mv));
  if(ca&&ca.t<ca.dur*0.65){Object.assign(Q,CATCHP[ca.type]);if(ca.drop)delete Q.ball;return Q;}
  if(G.phase!=='live'&&G.cele!=null){
    if(e.team===G.cele){Q={...STAND,...CHEER};Q.bob=-Math.abs(Math.sin(G.time*9+e.seed))*12;if(hb)Q.ball=[8,-112];return Q;}
    return{...STAND,...SAD};
  }
  if(e===G.qb&&bs==='qb'){Object.assign(Q,G.pendThrow&&G.pendThrow.t>G.pendThrow.dur*G.pendThrow.rel*0.3?WIND:HOLD);if(!hb)delete Q.ball;}
  if(e.role==='P'&&bs==='punter')Object.assign(Q,HOLD);
  if(e.relT>0)Object.assign(Q,REL);
  if(e.plant>0&&!hb)Object.assign(Q,PLANT);
  if(hb&&e===G.carrier){
    if(e.trip>0)Object.assign(Q,TRIPP);
    else if(e.juke>0)Object.assign(Q,CUT,{ball:[6,-62]});
    else if(e.spin>0)Object.assign(Q,SPIN);
    else if(e.stiff>0)Object.assign(Q,STIFF);
    else if(e.truck>0)Object.assign(Q,HIT,{ball:CARRY.ball,ne:CARRY.ne,nh:CARRY.nh});
    else if(e.hurdle>0)Object.assign(Q,{nk:CATCHP.high.nk,nf:CATCHP.high.nf,fk:CATCHP.high.fk,ff:CATCHP.high.ff},CARRY);
    else Object.assign(Q,CARRY);
  }
  else if(e.jumpT>0)Object.assign(Q,REACH,{nk:CATCHP.high.nk,nf:CATCHP.high.nf,fk:CATCHP.high.fk,ff:CATCHP.high.ff});
  else if(e.swat>0)Object.assign(Q,SWAT);
  else if(bs==='air'&&G.air&&G.air.cur&&G.air.cur.h<4.5&&Math.hypot(e.x-G.air.cur.x,e.y-G.air.cur.y)<2.6&&e.role!=='OL'){const h=G.air.cur.h;Object.assign(Q,h>2.3?REACH:h<1.1?REACH_LOW:REACH_MID);}
  else if(G.kick&&G.kick.cur&&(e.role==='KR'||e.role==='PR')&&Math.hypot(e.x-G.kick.cur.x,e.y-G.kick.cur.y)<3&&G.kick.cur.h<5)Object.assign(Q,REACH_MID);
  else if(e.settled&&bs==='qb')Object.assign(Q,READY);
  else if(e.engWith||e.eng>0)Object.assign(Q,BLOCK);
  else if(e.role==='OL'&&bs==='qb'&&P.kind==='scrimmage'&&P.off.kind==='pass'&&mv<2)Object.assign(Q,PASSPRO);
  if(e.stun>0&&!e.engWith)Object.assign(Q,STUN);
  if(hb&&!Q.ball)Q.ball=CARRY.ball;
  return Q;
}
function easePose(e,dt){
  const T=poseFor(e);
  if(!e.pp){e.pp={};for(const k of JK)e.pp[k]=[...T[k]];e.pp.bob=T.bob||0;}
  const r=1-Math.exp(-dt*(T.flat?12:22));
  for(const k of JK){e.pp[k][0]+=(T[k][0]-e.pp[k][0])*r;e.pp[k][1]+=(T[k][1]-e.pp[k][1])*r;}
  e.pp.bob+=((T.bob||0)-e.pp.bob)*Math.min(1,r*1.5);e.pp.flat=T.flat;e.pp.ball=T.ball||null;
}
function updAnims(dt){
  for(const e of G.ents.concat(G.side||[])){
    if(e.swat>0)e.swat-=dt;if(e.kickT>0)e.kickT-=dt;if(G.kneelOK>0)G.kneelOK-=dt/G.ents.length;
    if(e.ca){
      const c=e.ca;c.t+=dt;const u=Math.min(1,c.t/c.dur);
      e.jz=c.type==='high'?Math.sin(Math.PI*u)*0.85:c.type==='onehand'?Math.sin(Math.PI*u)*0.3:c.type==='dive'?Math.sin(Math.PI*u)*0.45:0;
      if(c.t>=c.dur){e.jz=0;e.ca=null;
        if(c.type==='dive'){e.down=true;e.downT=c.drop?0.9:0;dust(e.x,e.y,9);if(e===G.carrier&&G.phase==='live')endPlay({type:'tackle',spot:e.y});}}
    }else e.jz=e.hurdle>0?Math.sin(Math.PI*(1-e.hurdle/0.6))*0.75:e.jumpT>0?Math.sin(Math.PI*(1-e.jumpT/0.55))*0.8:0;
    if(e.jumpT>0)e.jumpT-=dt;
    easePose(e,dt);
  }
  for(const r of G.refs)easePose(r,dt);
}
function updateFacing(e){
  if(!e.pl){if(Math.abs(e.vy)>0.6)e.dir=Math.sign(e.vy);else{const b=G.carrier||G.qb;if(b)e.dir=Math.sign(b.y-e.y)||e.dir;}return;}
  const def=e.side==='d'?-1:1;
  if(e.down||e.ca||G.seq&&(G.seq.c===e||G.seq.fs.includes(e)))return;
  const c=G.carrier;
  if(e.lunge>0&&c){e.dir=Math.sign(c.y-e.y)||e.dir;}
  else if(e.engWith){e.dir=Math.sign(e.engWith.y-e.y)||def;}
  else if(e.eng>0){const b=G.ents.find(o=>o.engWith===e);if(b)e.dir=Math.sign(b.y-e.y)||def;}
  else if(G.phase==='presnap'||G.ballState==='pre'||G.ballState==='tee')e.dir=def;
  else if(c&&G.ballState==='carrier'){if(Math.abs(e.vy)>1.2)e.dir=Math.sign(e.vy);}
  else if(G.ballState==='air'&&gpFaceBall(e)){e.dir=Math.sign(G.air.sy-e.y)||e.dir;}
  else if(G.ballState==='air'||G.ballState==='kick'||G.ballState==='loose'){if(Math.abs(e.vy)>1.5)e.dir=Math.sign(e.vy);}
  else if(e.side==='o'){
    if(e.settled)e.dir=Math.sign(G.qb.y-e.y)||-1;
    else if(e.role==='WR'||e.role==='RB'||e.role==='TE'){if(Math.abs(e.vy)>1.2)e.dir=Math.sign(e.vy);}
    else e.dir=1;
  }else e.dir=(e.role!=='DL'&&!e.blitz&&e.vy>3.2)?1:-1;
  e.back=Math.hypot(e.vx,e.vy)>0.6&&Math.abs(e.vy)>0.5&&Math.abs(e.vy)>Math.abs(e.vx)*0.9&&Math.sign(e.vy)!==e.dir&&!(e.side==='o'&&e.route);
}

