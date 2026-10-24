// shared helpers for the browser tests: serve app/ on PORT (default 8796) and run node tests/<name>.js
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const PORT=process.env.PORT||8796,URL=`http://localhost:${PORT}/index.html`;
async function boot(opt={}){
  const browser=await chromium.launch();const ctx=await browser.newContext(Object.assign({viewport:{width:1280,height:860}},opt.ctx||{}));
  if(opt.init)await ctx.addInitScript(opt.init);
  const page=await ctx.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(String(e&&e.stack||e)));
  page.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|favicon|supabase/i.test(m.text()))errors.push('console: '+m.text());});
  await page.goto(URL,{waitUntil:'load'});await page.waitForTimeout(600);
  return{browser,ctx,page,errors};
}
// a new coach career at the first school of a fresh league (no setup screens)
async function newCareer(page,cls='3A'){
  await page.evaluate(c=>{const divs=makeDivisions(c);_pId=1;initGame('Test Coach',divs,0,0,[]);try{checkAndFillRosters();}catch(e){}
    document.getElementById('setup').classList.add('hid');document.getElementById('app').classList.remove('hid');
    for(const id of['ts','title','loading'])try{const el=document.getElementById(id);if(el)el.classList.remove('active');}catch(e){}
    try{hideTitle();}catch(e){}clo();nav('dash');},cls);
  await page.waitForTimeout(300);
}
let fails=0;
function ok(cond,msg){if(cond)console.log('  ok   '+msg);else{fails++;console.log('  FAIL '+msg);}}
function done(){console.log(fails?`${fails} failed`:'all passed');process.exitCode=fails?1:0;}
module.exports={boot,newCareer,ok,done,URL};
