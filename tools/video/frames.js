// node frames.js '<cfg json>' <outdir> : seeks the card's GSAP timeline 30 times a second and screenshots each frame
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{const c=JSON.parse(process.argv[2]),out=process.argv[3];const b=await chromium.launch();
 const p=await b.newPage({viewport:{width:1080,height:1920}});await p.goto('file://'+__dirname+'/card.html');
 await p.evaluate(c=>window.build(c),c);await p.waitForTimeout(300);
 const n=Math.ceil(c.dur*30),png=!c.solid&&!c.img;
 for(let i=0;i<n;i++){await p.evaluate(t=>{window._tl.seek(t,false);},i/30);
   await p.screenshot({path:`${out}/f${String(i).padStart(4,'0')}.${png?'png':'jpg'}`,omitBackground:png,type:png?'png':'jpeg',quality:png?undefined:92});}
 await b.close();})();
