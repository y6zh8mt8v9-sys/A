#!/usr/bin/env python3
"""Builds app/index.html from the files listed in src/manifest.txt (in order).

  python3 tools/build.py          write app/index.html
  python3 tools/build.py --check  only report whether app/index.html is up to date
  python3 tools/build.py --engine write app/gd_test.html (the Game Day engine on its own, for tests)
  python3 tools/build.py --release also write dist/index.html and dist/sw.js: the same game with every script
                                   minified and its local names scrambled (needs: cd tools && npm ci)

__ASSET:path__ in any source file becomes a data: URI of src/assets/path, and __BUILD_ID__ a short hash of
the sources, so every build carries its own fingerprint.

The game ships as one file, so deploying stays the same: upload app/index.html and sw.js.
Files under src/engine/ keep the escaped form the engine needs inside its <script> holder
(write <\\/tag> instead of </tag>).
"""
import sys,os,re,base64,hashlib,shutil,subprocess
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def parts():
    for l in open(os.path.join(R,'src','manifest.txt'),encoding='utf-8'):
        l=l.strip()
        if l and not l.startswith('#'):yield l
MIME={'webp':'image/webp','png':'image/png','svg':'image/svg+xml','jpg':'image/jpeg'}
def asset(m):
    p=m.group(1);d=open(os.path.join(R,'src','assets',p),'rb').read()
    return 'data:'+MIME[p.rsplit('.',1)[1]]+';base64,'+base64.b64encode(d).decode()
def build():
    out=''.join(open(os.path.join(R,'src',p),encoding='utf-8',newline='').read() for p in parts())
    out=out.replace('__BUILD_ID__',hashlib.sha1(out.encode('utf-8')).hexdigest()[:10])
    return re.sub(r'__ASSET:([\w./-]+)__',asset,out)
def engine(html):
    a=html.index('<script type="text/x-gameday" id="gd-src">')+len('<script type="text/x-gameday" id="gd-src">')
    b=html.index('</script>',a)
    return html[a:b].replace('<\\/','</').replace('<\\!--','<!--')
if __name__=='__main__':
    out=build();dst=os.path.join(R,'app','index.html')
    if '--check' in sys.argv:
        cur=open(dst,encoding='utf-8',newline='').read()
        print('up to date' if cur==out else 'app/index.html differs from src/: run tools/build.py');sys.exit(0 if cur==out else 1)
    open(dst,'w',encoding='utf-8',newline='').write(out)
    if '--engine' in sys.argv:open(os.path.join(R,'app','gd_test.html'),'w',encoding='utf-8',newline='').write(engine(out))
    print('built app/index.html',len(out),'bytes')
    if '--release' in sys.argv:
        os.makedirs(os.path.join(R,'dist'),exist_ok=True)
        rel=os.path.join(R,'dist','index.src.html')   # local copies stop working in the release (see 000a-copyright.js)
        assert out.count('const G27_LOCAL=true;')==1
        open(rel,'w',encoding='utf-8',newline='').write(out.replace('const G27_LOCAL=true;','const G27_LOCAL=false;'))
        subprocess.run(['node',os.path.join(R,'tools','minify.js'),rel,os.path.join(R,'dist','index.html')],check=True);os.remove(rel)
        shutil.copy(os.path.join(R,'sw.js'),os.path.join(R,'dist','sw.js'))
