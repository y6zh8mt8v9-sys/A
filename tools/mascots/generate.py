#!/usr/bin/env python3
"""Mascot art library for team logos.

  python3 tools/mascots/generate.py gen [--only key1,key2] [--jobs 4]   generate missing images with Gemini
  python3 tools/mascots/generate.py process                             raw PNGs -> transparent grayscale WebP
  python3 tools/mascots/generate.py pack                                WebP files -> src/app/003b-data-mascot-images.js
  python3 tools/mascots/generate.py sheet out.png                       contact sheet of the processed art

The API key is read from SKILL_IMAGE_GEN_GEMINI_KEY (or GEMINI_API_KEY). Images are drawn in grayscale so the
game can tint each one with the team's own colors. Raw images go to tools/mascots/raw/ (not committed).
"""
import argparse, base64, json, os, sys, time
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SUBJECTS = os.path.join(HERE, 'subjects.json')
RAW = os.path.join(HERE, 'raw')
OUT = os.path.join(ROOT, 'src', 'assets', 'mascots')
PACK = os.path.join(ROOT, 'src', 'app', '003b-data-mascot-images.js')
MODEL = os.environ.get('MASCOT_IMAGE_MODEL', 'gemini-2.5-flash-image')
SIZE = 176

PROMPT = ("Professional high school athletics mascot logo: {subject}. Fierce and confident, realistic anatomy and "
          "proportions, in the style of a modern college or professional sports team primary logo. Clean vector "
          "illustration, bold dark outlines, crisp cel shading with three or four tones. Grayscale only: black, white "
          "and shades of gray, no color at all. One subject, centered, filling most of the frame, isolated on a plain "
          "pure white background. An original design that does not copy any real school's or team's logo. "
          "No text, no letters, no numbers, no border, no badge, no circle, no ground shadow.")


def load():
    with open(SUBJECTS, encoding='utf-8') as f:
        return json.load(f)


def key_env():
    k = os.environ.get('SKILL_IMAGE_GEN_GEMINI_KEY') or os.environ.get('GEMINI_API_KEY')
    if not k:
        sys.exit('Set SKILL_IMAGE_GEN_GEMINI_KEY in the environment first.')
    return k


def gen_one(api_key, key, subject):
    import requests
    path = os.path.join(RAW, key + '.png')
    if os.path.exists(path):
        return key, 'exists'
    url = f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent'
    body = {'contents': [{'parts': [{'text': PROMPT.format(subject=subject)}]}],
            'generationConfig': {'responseModalities': ['TEXT', 'IMAGE'], 'imageConfig': {'aspectRatio': '1:1'}}}
    for attempt in range(6):
        try:
            r = requests.post(url, headers={'x-goog-api-key': api_key, 'Content-Type': 'application/json'}, json=body, timeout=180)
        except requests.RequestException as e:
            err = str(e)
        else:
            if r.status_code == 200:
                data = r.json()
                for c in data.get('candidates', []):
                    for p in (c.get('content') or {}).get('parts', []):
                        d = p.get('inlineData') or p.get('inline_data')
                        if d and d.get('data'):
                            with open(path, 'wb') as f:
                                f.write(base64.b64decode(d['data']))
                            return key, 'ok'
                err = 'no image: ' + json.dumps(data.get('promptFeedback') or data)[:200]
                break
            err = f'HTTP {r.status_code}: {r.text[:200]}'
            if r.status_code not in (429, 500, 502, 503, 504):
                break
        time.sleep(min(60, 4 * 2 ** attempt))
    return key, 'failed ' + err


def cmd_gen(a):
    api_key = key_env()
    S = load()
    os.makedirs(RAW, exist_ok=True)
    keys = [k for k in S if not a.only or k in a.only.split(',')]
    with ThreadPoolExecutor(a.jobs) as ex:
        for key, st in ex.map(lambda k: gen_one(api_key, k, S[k]['subject']), keys):
            print(key, st, flush=True)


def to_mascot(src):
    """grayscale, white background removed (flood fill from the edges), cropped and centered on a square"""
    from PIL import Image, ImageFilter, ImageOps
    im = Image.open(src).convert('RGB')
    g = ImageOps.grayscale(im)
    w, h = g.size
    px = g.load()
    bg = Image.new('L', (w, h), 0)
    bp = bg.load()
    stack = [(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)]
    while stack:
        x, y = stack.pop()
        if bp[x, y] or px[x, y] < 232:
            continue
        bp[x, y] = 255
        if x > 0: stack.append((x - 1, y))
        if x < w - 1: stack.append((x + 1, y))
        if y > 0: stack.append((x, y - 1))
        if y < h - 1: stack.append((x, y + 1))
    alpha = ImageOps.invert(bg.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(1.2)))
    out = Image.merge('LA', (g, alpha))
    box = alpha.point(lambda v: 255 if v > 24 else 0).getbbox()
    if not box:
        return None
    out = out.crop(box)
    side = max(out.size)
    sq = Image.new('LA', (side, side), (255, 0))
    sq.paste(out, ((side - out.size[0]) // 2, (side - out.size[1]) // 2))
    return sq.resize((SIZE, SIZE), Image.LANCZOS)


def cmd_process(a):
    os.makedirs(OUT, exist_ok=True)
    for key in load():
        src = os.path.join(RAW, key + '.png')
        if not os.path.exists(src):
            continue
        m = to_mascot(src)
        if m is None:
            print(key, 'empty after background removal')
            continue
        m.convert('RGBA').save(os.path.join(OUT, key + '.webp'), 'WEBP', quality=80, method=6)
        print(key, 'processed')


def cmd_pack(a):
    S = load()
    imgs, names = {}, {}
    for key, v in S.items():
        f = os.path.join(OUT, key + '.webp')
        if not os.path.exists(f):
            continue
        with open(f, 'rb') as fh:
            imgs[key] = 'data:image/webp;base64,' + base64.b64encode(fh.read()).decode()
        for n in v['names']:
            names[n.lower()] = key
    js = ('// Mascot art library: grayscale illustrations tinted with each team\'s colors (tools/mascots/generate.py).\n'
          'const _MIMG=' + json.dumps(imgs, separators=(',', ':')) + ';\n'
          'const _MIMG_N=' + json.dumps(names, separators=(',', ':'), ensure_ascii=False) + ';\n')
    with open(PACK, 'w', encoding='utf-8') as f:
        f.write(js)
    print(f'packed {len(imgs)} of {len(S)} subjects, {len(js) // 1024} KB')


def cmd_sheet(a):
    from PIL import Image
    files = sorted(f for f in os.listdir(OUT) if f.endswith('.webp'))
    cols = 12
    sheet = Image.new('RGB', (cols * SIZE, max(1, -(-len(files) // cols)) * SIZE), (233, 237, 242))
    for i, f in enumerate(files):
        im = Image.open(os.path.join(OUT, f)).convert('RGBA')
        sheet.paste(im, ((i % cols) * SIZE, (i // cols) * SIZE), im)
    sheet.save(a.out)
    print(a.out, len(files))


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    sp = ap.add_subparsers(dest='cmd', required=True)
    g = sp.add_parser('gen'); g.add_argument('--only'); g.add_argument('--jobs', type=int, default=4)
    sp.add_parser('process'); sp.add_parser('pack')
    s = sp.add_parser('sheet'); s.add_argument('out')
    a = ap.parse_args()
    {'gen': cmd_gen, 'process': cmd_process, 'pack': cmd_pack, 'sheet': cmd_sheet}[a.cmd](a)
