// ═══════════ LEAGUES AND PLAYOFF DIVISIONS ═══════════
// Leagues (the regional groups in G.divisions / G.allLeagues[cls].divisions) decide league games and standings.
// Playoff divisions are separate: a classification with enough schools is split by school size into Division I (larger)
// and Division II (smaller), each with its own bracket and state champion. A league can hold schools from both.
const PD_AUTO_MIN=16; // a classification needs this many schools before it splits into two playoff divisions
function pdSchools(cls){try{return divisionsForCls(cls).flatMap(d=>d.teams);}catch(e){return[];}}
function pdSettings(){if(!G.pdN){let w={};try{w=(worldLoad()||{}).pdN||{};}catch(e){}G.pdN=Object.assign({},w);}return G.pdN;}
// how many playoff divisions a classification has: the save's choice, else the world's, else by size
function pdN(cls){const v=pdSettings()[cls];if(v===1||v===2)return v;return pdSchools(cls).length>=PD_AUTO_MIN?2:1;}
// enrollment decides the split; schools without one get a steady number from their id
function schEnr(s){if(!s.enr){let h=((s.id||1)*2654435761)>>>0;s.enr=250+(h%1650);}return s.enr;}
// the larger half of a classification is Division I; a school's own setting (s.pdFix) wins
function pdAssign(cls){const L=pdSchools(cls).filter(s=>!(s.pdFix===1||s.pdFix===2)).sort((a,b)=>schEnr(b)-schEnr(a)),fixed=pdSchools(cls).filter(s=>s.pdFix===1||s.pdFix===2);
  const n1=Math.max(0,Math.ceil(pdSchools(cls).length/2)-fixed.filter(s=>s.pdFix===1).length);L.forEach((s,i)=>{s.pd=i<n1?1:2;});fixed.forEach(s=>{s.pd=s.pdFix;});}
function pdOf(s){if(!s)return 1;const cls=s.cls||G.cls;if(pdN(cls)<2)return 1;if(s.pdFix===1||s.pdFix===2)return s.pdFix;if(s.pd!==1&&s.pd!==2)pdAssign(cls);return s.pd===2?2:1;}
// the name of a playoff division; states whose classifications are already called "Division" get large/small school brackets
function pdName(cls,pd){if(pdN(cls)<2)return'';const lbl=String(clsL(cls)||'');return/division/i.test(lbl)?(pd===1?'Large school bracket':'Small school bracket'):(pd===1?'Division I':'Division II');}
function pdShort(cls,pd){if(pdN(cls)<2)return'';return/division/i.test(String(clsL(cls)||''))?(pd===1?'Large':'Small'):(pd===1?'D-I':'D-II');}
// "3A Division I" or just "3A" when the classification has one bracket
function pdFull(cls,pd){const n=pdName(cls,pd);return clsL(cls)+(n?' '+n:'');}
// the other playoff division(s) of your classification play their own bracket alongside yours, round by round
function pdSeedList(pd){return allSchools().filter(s=>pdOf(s)===pd).map(s=>{const wr=s.wins/(s.wins+s.losses+.001);return{id:s.id,seed:wr*1000+calcSOS(s.id)*8+(s.prestige||1)*5};}).sort((a,b)=>b.seed-a.seed);}
function pdOthersBuild(N,myPd){const out=[];if(pdN(G.cls)<2)return out;
  for(const pd of[1,2]){if(pd===myPd)continue;const L=pdSeedList(pd),n=Math.min(N,1<<Math.floor(Math.log2(Math.max(2,L.length))));if(L.length<2)continue;
    const field=L.slice(0,n).map(x=>x.id);out.push({pd,field,bracket:poOrder(field.length).map(i=>field[i-1]).filter(x=>x!=null),round:0,rounds:[],stateChampId:null});}
  return out;}
function pdSimRound(B){if(!B||B.stateChampId||B.bracket.length<2)return;const res=[],sv=[];
  for(let i=0;i<B.bracket.length;i+=2){const a=B.bracket[i],b=B.bracket[i+1];if(b==null){sv.push(a);res.push({a,b:null,winner:a,score:'Bye'});continue;}
    const oa=teamOvr(a),ob=teamOvr(b),gap=oa-ob,ag=Math.abs(gap),fav=ag>=25?0.97:ag>=20?0.95:ag>=15?0.92:ag>=10?0.87:ag>=5?0.78:0.5+ag*0.056,aw=Math.random()<(gap>=0?fav:1-fav);
    const w=aw?a:b,l=aw?b:a,sc=lgScore(teamOvr(w),teamOvr(l),true);res.push({a,b,winner:w,loser:l,wScore:sc[0],lScore:sc[1]});sv.push(w);}
  B.round++;B.rounds.push({round:B.round,results:res});B.bracket=sv;
  if(sv.length===1){B.stateChampId=sv[0];const s=getS(sv[0]);if(s)try{addNews('general',`${s.name} ${s.mascot} win the ${pdFull(G.cls,B.pd)} state title`,`${2026+(G.yr-1)} · ${recStr(s.wins,s.losses)}`);}catch(e){}}}
function pdOthersRound(){for(const B of(G.playoff&&G.playoff.others)||[])pdSimRound(B);}
function pdOthersFinishSafe(){try{pdOthersFinish();}catch(e){console.error('other playoff divisions',e);}}
function pdOthersFinish(){for(const B of(G.playoff&&G.playoff.others)||[]){let k=0;while(!B.stateChampId&&B.bracket.length>1&&k++<8)pdSimRound(B);}}
// the playoff division tag next to a school in standings and lists
function pdTag(s){const cls=s.cls||G.cls;if(pdN(cls)<2)return'';const pd=pdOf(s);return`<span class="pd-tag pd${pd}" title="${pdName(cls,pd)} playoffs">${pdShort(cls,pd)}</span>`;}
// one or two playoff brackets for a classification (before its playoffs start)
window.pdSetN=function(cls,n){if(G.playoff&&cls===G.cls){notify('The playoffs already started: change it next season.','w');return;}pdSettings()[cls]=n;for(const s of pdSchools(cls))delete s.pd;nav(G._page||'playoff');};
// a new season: sizes can change with reclassification, so everyone is placed again (a school's own choice stays)
function pdNewSeason(){try{for(const s of allSchoolsAll())delete s.pd;}catch(e){}}
