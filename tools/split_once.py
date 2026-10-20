# One-time split of app/index.html into src/ (kept for reference). Run from the repo root.
import re,os,sys
src=open('app/index.html',encoding='utf-8').read()
L=src.splitlines(keepends=True)
N=len(L)
def ln(i):return L[i-1]
def slug(t):
    t=re.sub(r'v\d+(\.\d+)*','',t);t=re.sub(r'[^A-Za-z0-9]+','-',t).strip('-').lower()
    w=[x for x in t.split('-') if x][:5];return '-'.join(w) or 'part'
def find(p,a,b):return [i for i in range(a,b+1) if re.match(p,ln(i))]
def chunks(a,b,hdr,minlen,big=60000):
    cuts=[a]
    for i in find(hdr,a+1,b):cuts.append(i)
    for i in range(a,b+1):
        if len(ln(i))>big:
            cuts+= [i,i+1]
    cuts=sorted(set(c for c in cuts if a<=c<=b))
    # merge small ones into the previous (never merge a big data line or its neighbour)
    out=[]
    for c in cuts:
        if out and c-out[-1]<minlen and len(ln(out[-1]))<=big and len(ln(c))<=big and not(c>a and len(ln(c-1))>big):continue
        out.append(c)
    segs=[]
    for k,c in enumerate(out):
        e=(out[k+1]-1) if k+1<len(out) else b
        segs.append((c,e))
    return segs
def name_for(a,e,prefix):
    l=ln(a)
    if len(l)>60000:
        m=re.match(r'\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)',l);return 'data-'+(m.group(1).strip('_').lower() if m else 'blob')
    for i in range(a,min(e,a+3)+1):
        m=re.match(r'\s*(?://|/\*)\s*[═=─]+\s*(.*?)\s*[═=─*/ ]*$',ln(i))
        if m and m.group(1):return slug(m.group(1))
    return prefix
plan=[]  # (relpath, a, e)
plan.append(('shell/00-head.html',1,49))
# the stylesheet: one file per design layer
css_cuts=[50]+find(r'/\* ═{4,}',51,913)+[914]
css_cuts=sorted(set(css_cuts))
for k in range(len(css_cuts)-1):
    a=css_cuts[k];e=css_cuts[k+1]-1
    nm='base' if k==0 else slug(re.sub(r'/\*|\*/|═','',ln(a)))
    plan.append((f'styles/{k:02d}-{nm}.css',a,e))
plan.append(('shell/10-style-end-body.html',914,1278))
segs=chunks(1279,18177,r'(//|/\*) ?═{3,}',140)
for k,(a,e) in enumerate(segs):plan.append((f'app/{k:03d}-{name_for(a,e,"app")}.js',a,e))
plan.append(('shell/20-app-end-engine-start.html',18178,18178))
plan.append(('engine/shell/00-page.html',18179,18522))
segs=chunks(18523,19323,r'\s*/\* ={5,}',200)
for k,(a,e) in enumerate(segs):plan.append((f'engine/sprites/{k:02d}-{name_for(a,e,"sprites")}.js',a,e))
segs=chunks(19324,25586,r'/\* ={5,}',120)
for k,(a,e) in enumerate(segs):plan.append((f'engine/game/{k:03d}-{name_for(a,e,"game")}.js',a,e))
plan.append(('engine/shell/90-page-end.html',25587,25587))
plan.append(('shell/90-tail.html',25588,N))
# sanity: contiguous and complete
pos=1
for p,a,e in plan:
    assert a==pos,(p,a,pos);assert e>=a,(p,a,e);pos=e+1
assert pos==N+1,(pos,N)
seen=set()
os.makedirs('src',exist_ok=True)
with open('src/manifest.txt','w') as M:
    M.write('# Build order for app/index.html (tools/build.py). One file per line, relative to src/.\n')
    for p,a,e in plan:
        q=p;i=2
        while q in seen:q=p.replace('.',f'-{i}.',1);i+=1
        seen.add(q);os.makedirs(os.path.dirname('src/'+q),exist_ok=True)
        open('src/'+q,'w',encoding='utf-8',newline='').write(''.join(L[a-1:e]))
        M.write(q+'\n')
print(len(plan),'files')
