// Release minification for tools/build.py --release: node tools/minify.js <in.html> <out.html>
// Every inline <script> is compressed and its local names are scrambled; top-level names stay, because the
// page's onclick handlers and the separate script blocks call them by name. The Game Day engine page (stored
// escaped inside <script type="text/x-gameday">) is unescaped, minified the same way and escaped again.
// Comments are dropped except the copyright and license lines and /*! markers (the sprite loader looks for one).
const fs=require('fs'),{minify}=require('terser');
const OPT={compress:{passes:2},mangle:true,keep_fnames:true,keep_classnames:true,format:{comments:/^!|Kanra Digital|@license|@preserve/,inline_script:true}};
async function page(html){
  const re=/<script>([\s\S]*?)<\/script>/g;let out='',last=0,m;
  while((m=re.exec(html))){
    const r=await minify(m[1],OPT);
    out+=html.slice(last,m.index)+'<script>'+r.code+'</script>';last=re.lastIndex;
  }
  return out+html.slice(last);
}
(async()=>{
  const [src,dst]=process.argv.slice(2);let html=fs.readFileSync(src,'utf8');
  const open='<script type="text/x-gameday" id="gd-src">',a=html.indexOf(open)+open.length,b=html.indexOf('</script>',a);
  let eng=html.slice(a,b).replace(/<\\\//g,'</').replace(/<\\!--/g,'<!--');
  eng=(await page(eng)).replace(/<\//g,'<\\/').replace(/<!--/g,'<\\!--');
  const head=await page(html.slice(0,a-open.length)),tail=await page(html.slice(b));
  fs.writeFileSync(dst,head+open+eng+tail);
  console.log('minified',src,html.length,'->',fs.statSync(dst).size,'bytes');
})().catch(e=>{console.error(e);process.exit(1);});
