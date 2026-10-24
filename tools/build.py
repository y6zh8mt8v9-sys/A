#!/usr/bin/env python3
"""Builds app/index.html from the files listed in src/manifest.txt (in order).

  python3 tools/build.py          write app/index.html
  python3 tools/build.py --check  only report whether app/index.html is up to date
  python3 tools/build.py --engine write app/gd_test.html (the Game Day engine on its own, for tests)

The game ships as one file, so deploying stays the same: upload app/index.html and sw.js.
Files under src/engine/ keep the escaped form the engine needs inside its <script> holder
(write <\\/tag> instead of </tag>).
"""
import sys,os
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def parts():
    for l in open(os.path.join(R,'src','manifest.txt'),encoding='utf-8'):
        l=l.strip()
        if l and not l.startswith('#'):yield l
def build():
    return ''.join(open(os.path.join(R,'src',p),encoding='utf-8',newline='').read() for p in parts())
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
