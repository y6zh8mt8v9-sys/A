  const MATS = ATLAS.materials;
  const MI = {}; MATS.forEach((n, i) => (MI[n] = i));
  const SKIN_TONES = ["#f3cfb0", "#e2ad8a", "#c98c63", "#a86c45", "#7f4c2f", "#5b3420"];
  const DEFAULT_TEAM = {"helmet": "#7c1d2c", "helmetStripe": "#f0b429", "helmetLogo": "#7c1d2c", "facemask": "#9aa1aa", "jersey": "#7c1d2c", "jerseyTrim": "#f0b429", "pants": "#ebedf0", "pantsStripe": "#7c1d2c", "belt": "#1d1d22", "socks": "#7c1d2c", "sockStripe": "#f0b429", "cleats": "#25252b", "cleatAccent": "#e8e8ea", "gloves": "#e6e7ea", "skin": "#a86c45", "armSleeve": "#a86c45", "faceDark": "#1b1216", "ball": "#7a3214", "laces": "#f5f5f2", "towel": "#f2f2f2", "refWhite": "#f2f3f5", "refBlack": "#1c1c20", "refPants": "#e9eaee", "cap": "#1c1c20", "capTrim": "#f2f3f5", "flag": "#f5d10c", "whistle": "#b9bcc4", "hair": "#24180f"};
  const POSITION_BUILD = {
    QB: 'skill', RB: 'skill', HB: 'skill', WR: 'skill', CB: 'skill', S: 'skill', FS: 'skill', SS: 'skill',
    DB: 'skill', K: 'skill', P: 'skill', KR: 'skill', PR: 'skill', ATH: 'skill',
    TE: 'big', FB: 'big', LB: 'big', MLB: 'big', OLB: 'big', ILB: 'big', DE: 'big', EDGE: 'big',
    OL: 'line', OT: 'line', OG: 'line', C: 'line', T: 'line', G: 'line', DL: 'line', DT: 'line', NT: 'line',
  };
  const DIGITS = {
    0: ['111', '101', '101', '101', '111'], 1: ['010', '110', '010', '010', '111'],
    2: ['111', '001', '111', '100', '111'], 3: ['111', '001', '111', '001', '111'],
    4: ['101', '101', '111', '001', '001'], 5: ['111', '100', '111', '001', '111'],
    6: ['111', '100', '111', '101', '111'], 7: ['111', '001', '010', '010', '010'],
    8: ['111', '101', '111', '101', '111'], 9: ['111', '101', '111', '001', '111'],
  };

  // ---------------------------------------------------------------- colour ramps (mirrors palette.py)
  function roundHalfEven(x) {
    const f = Math.floor(x), d = x - f;
    if (Math.abs(d - 0.5) < 1e-9) return f % 2 === 0 ? f : f + 1;
    return Math.round(x);
  }
  function hex2rgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16));
  }
  function rgbToHsv(r, g, b) {   // python colorsys
    const maxc = Math.max(r, g, b), minc = Math.min(r, g, b), v = maxc;
    if (minc === maxc) return [0, 0, v];
    const s = (maxc - minc) / maxc;
    const rc = (maxc - r) / (maxc - minc), gc = (maxc - g) / (maxc - minc), bc = (maxc - b) / (maxc - minc);
    let h;
    if (r === maxc) h = bc - gc; else if (g === maxc) h = 2.0 + rc - bc; else h = 4.0 + gc - rc;
    h = ((h / 6.0) % 1.0 + 1.0) % 1.0;
    return [h, s, v];
  }
  function hsvToRgb(h, s, v) {   // python colorsys
    if (s === 0) return [v, v, v];
    let i = Math.floor(h * 6.0);
    const f = h * 6.0 - i, p = v * (1 - s), q = v * (1 - s * f), t = v * (1 - s * (1 - f));
    i = i % 6;
    return [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i];
  }
  function hueToward(h, target, amt) {
    const d = (((target - h + 540) % 360) + 360) % 360 - 180;
    const step = Math.max(-Math.abs(d), Math.min(Math.abs(d), amt)) * (d >= 0 ? 1 : -1);
    return (((h + step) % 360) + 360) % 360;
  }
  function ramp(hex) {
    const base = hex2rgb(hex);
    const [h0, s, v] = rgbToHsv(base[0] / 255, base[1] / 255, base[2] / 255);
    const h = h0 * 360, grey = s < 0.10, hh = grey ? 222 : h;
    const clamp = x => Math.max(0, Math.min(1, x));
    const mk = (hue, sat, val) => hsvToRgb(((hue % 360) + 360) % 360 / 360, clamp(sat), clamp(val)).map(c => roundHalfEven(c * 255));
    let hi, sh, dk;
    if (grey) {
      hi = mk(hh, s * 0.5, Math.min(1, v + Math.min((1 - v) * 0.55 + 0.05, 0.16 + v * 0.6)));
      sh = mk(hh, s + 0.10, v * 0.74);
      dk = mk(hh, s + 0.20, v * 0.46);
    } else {
      hi = mk(hueToward(h, 55, 6), s * 0.86, Math.min(1, v + Math.min((1 - v) * 0.38 + 0.07, 0.16 + v * 0.6)));
      sh = mk(hueToward(h, 235, 9), s * 1.08 + 0.06, v * 0.72);
      dk = mk(hueToward(h, 245, 18), s * 1.12 + 0.14, v * 0.44);
    }
    return [dk, sh, base, hi];
  }

  function numberGrid(num) {
    const [NW, NH] = ATLAS.numberGrid;
    const g = Array.from({ length: NH }, () => new Array(NW).fill(0));
    let s = String(Math.abs(parseInt(num, 10) || 0));
    let offs;
    if (s.length === 1) offs = [3]; else { s = s.slice(-2); offs = [1, 5]; }
    [...s].forEach((ch, k) => DIGITS[ch].forEach((row, yy) => [...row].forEach((c, xx) => {
      if (c === '1') g[1 + yy][offs[k] + xx] = 1;
    })));
    const out = g.map(r => r.slice());
    for (let y = 0; y < NH; y++) for (let x = 0; x < NW; x++) {
      if (g[y][x]) continue;
      for (const [dy, dx] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const yy = y + dy, xx = x + dx;
        if (yy >= 0 && yy < NH && xx >= 0 && xx < NW && g[yy][xx] === 1) out[y][x] = 2;
      }
    }
    return out;
  }

  // ---------------------------------------------------------------- loading
  function loadImage(src) {
    return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
  }
  function toData(im) {
    const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
    const x = c.getContext('2d'); x.drawImage(im, 0, 0);
    return x.getImageData(0, 0, im.width, im.height);
  }

  async function load() {
    const keyMap = new Map();
    for (const k in ATLAS.keys) {
      const [m, l] = k.split(',').map(Number); const c = ATLAS.keys[k];
      keyMap.set((c[0] << 16) | (c[1] << 8) | c[2], m * 4 + l);
    }
    const data = {};
    for (const name in SHEETS) {
      const s = SHEETS[name];
      data[name] = { px: toData(await loadImage(s.img)), num: s.num ? toData(await loadImage(s.num)) : null };
    }
    const cache = new Map();

    function resolvePalette(team, skin) {
      const t = Object.assign({}, DEFAULT_TEAM, team || {});
      const skinHex = typeof skin === 'number' ? SKIN_TONES[Math.max(0, Math.min(SKIN_TONES.length - 1, skin))]
        : (skin || SKIN_TONES[3]);
      t.skin = skinHex;
      if (!team || !team.armSleeve || team.armSleeve === 'skin') t.armSleeve = skinHex;
      if (team && team.hair) t.hair = team.hair;
      const pal = MATS.map(n => ramp(t[n]));
      const fm = pal[MI.facemask][3]; pal[MI.facemask][3] = fm.map(c => Math.min(255, c + 30));
      const numberHex = (team && team.number) || '#f4f4f4';
      const trimHex = team && team.numberTrim ? team.numberTrim : null;
      return { pal, num: ramp(numberHex), trim: trimHex ? ramp(trimHex) : null, jerseyRamp: pal[MI.jersey], bare: (team && team.bare) || null, slim: !!(team && team.slim) };
    }
    // ---- bare heads (helmet off, 7v7): the helmet is lifted out of the frame and a head with the player's hair is drawn in.
    // Letters: h hair, s skin, e eye; the digit is the shade (0 dark … 3 light). Side views face right; the anchor row sits on the helmet's bottom.
    const BARE_T = (() => { const P = s => s.trim().split('\n').map(r => r.trim().split(/\s+/)); return {
      side: P(`
. . h1 h1 h2 h2 h1 . .
. h1 h2 h2 h3 h3 h2 h1 .
h0 h1 h2 h2 h2 h2 h2 h2 h1
h0 h1 h1 h2 h2 s2 s2 s2 s2
h0 h1 s1 s1 s2 s2 s3 e0 s2
h0 s1 s0 s1 s2 s2 s2 s3 s3
. s1 s1 s2 s2 s2 s2 s2 s1
. . s1 s2 s2 s2 s2 s1 .
. . s1 s2 s2 s1 s0 . .
. . s1 s2 s2 s1 . . .`),
      front: P(`
. . h1 h2 h2 h2 h1 . .
. h1 h2 h3 h3 h2 h2 h1 .
h0 h1 h2 h2 h2 h2 h2 h1 h0
h0 s1 s2 s2 s2 s2 s2 s1 h0
s0 s1 e0 s2 s3 s2 e0 s1 s0
s0 s1 s2 s2 s2 s2 s2 s1 s0
. s1 s2 s2 s1 s2 s2 s1 .
. . s1 s2 s2 s2 s1 . .
. . . s1 s2 s1 . . .
. . . s1 s2 s1 . . .`),
      back: P(`
. . h1 h2 h2 h2 h1 . .
. h1 h2 h2 h3 h2 h2 h1 .
h0 h1 h2 h2 h2 h2 h2 h1 h0
h0 h1 h2 h2 h2 h2 h2 h1 h0
s0 h1 h1 h2 h2 h2 h1 h1 s0
s0 h0 h1 h1 h1 h1 h1 h0 s0
. s1 h0 h1 h1 h1 h0 s1 .
. . s1 s1 s2 s1 s1 . .
. . . s1 s2 s1 . . .
. . . s1 s2 s1 . . .`) }; })();
    const bareC = new Map();
    function bareGrid(view, style) {
      const key = view + '|' + style; if (bareC.has(key)) return bareC.get(key);
      let g = BARE_T[view].map(r => r.slice()), ar = g.length - 1; const w = g[0].length;
      if (style === 'buzz') g = g.map((r, y) => r.map(t => t[0] === 'h' ? (y >= (view === 'back' ? 3 : 2) ? 's' + t[1] : 'h' + Math.min(1, +t[1])) : t));
      else if (style === 'big') { // afro / curls / high-top: more volume above and at the sides
        g.unshift(['.', 'h0', 'h1', 'h2', 'h2', 'h2', 'h1', 'h0', '.'], ['h0', 'h1', 'h2', 'h3', 'h3', 'h2', 'h2', 'h1', 'h0']); ar += 2;
        for (let y = 2; y <= 4; y++) { if (g[y][0] === '.') g[y][0] = 'h0'; if (g[y][w - 1] === '.') g[y][w - 1] = 'h0'; } }
      else if (style === 'long') { // locs, braids, flow: hair hangs past the neck
        g.push(new Array(w).fill('.'), new Array(w).fill('.'));
        if (view === 'side') { for (let y = 3; y < g.length; y++) { g[y][0] = 'h0'; g[y][1] = y % 2 ? 'h1' : 'h2'; } }
        else if (view === 'front') { for (let y = 3; y < g.length; y++) { g[y][0] = 'h0'; g[y][w - 1] = 'h0'; if (y >= 6) { g[y][1] = 'h1'; g[y][w - 2] = 'h1'; } } }
        else { for (let y = 4; y < g.length; y++) for (let x = 1; x < w - 1; x++) g[y][x] = 'h' + (x % 2 ? 1 : 2); } }
      const res = { g, ar }; bareC.set(key, res); return res;
    }
    // 7v7: no shoulder pads under the shirt, so the boxy pad corners and the raised pad tops come off
    function slimPads(o, mat, hx, hy) {
      const fw = ATLAS.frameW, fh = ATLAS.frameH, JE = MI.jersey, JT = MI.jerseyTrim, isJ = m => m === JE || m === JT;
      let top = -1; for (let y = Math.max(0, hy - 2); y < fh && top < 0; y++) for (let x = 0; x < fw; x++) if (isJ(mat[y * fw + x])) { top = y; break; }
      if (top < 0) return;
      const clr = k => { o[k * 4 + 3] = 0; mat[k] = -2; };
      for (let pass = 0; pass < 2; pass++) { const cut = [];
        for (let y = top; y <= top + 3 && y < fh; y++) for (let x = 0; x < fw; x++) { const k = y * fw + x; if (!isJ(mat[k]) || Math.abs(x - hx) <= 3) continue;
          const up = y > 0 ? mat[k - fw] : -2, L = x > 0 ? mat[k - 1] : -2, R = x < fw - 1 ? mat[k + 1] : -2;
          if (up === -2 && (L === -2 || R === -2 || pass === 0)) cut.push(k); }
        cut.forEach(clr); }
    }
    function bareStamp(sheet, id, o, mat, lv, P) {
      const fw = ATLAS.frameW, fh = ATLAS.frameH, HE = MI.helmet, HS = MI.helmetStripe, HL = MI.helmetLogo, FM = MI.facemask, FD = MI.faceDark, SK = MI.skin;
      const isH = m => m === HE || m === HS || m === HL;
      let n = 0, sx = 0, fn = 0, fxs = 0, x0 = 99, x1 = -1, y0 = 99, y1 = -1;
      for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) { const m = mat[y * fw + x]; if (!(isH(m) || m === FM)) continue;
        if (isH(m)) { n++; sx += x; } else { fn++; fxs += x; } x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      if (n + fn < 6) return;
      if (P.slim) slimPads(o, mat, (x0 + x1) / 2, y1);
      if (!P.bare) return;
      const hair = P.pal[MI.hair], skin = P.pal[MI.skin], eye = [26, 18, 16];
      const set = (x, y, c) => { const j = (y * fw + x) * 4; o[j] = c[0]; o[j + 1] = c[1]; o[j + 2] = c[2]; o[j + 3] = 255; mat[y * fw + x] = -4; };
      const cw = x1 - x0 + 1, ch = y1 - y0 + 1, face = fn && n ? Math.sign(Math.round(fxs / fn - sx / n)) : 0;
      if (!(cw >= 8 && cw <= 16 && ch >= 6 && ch <= 13)) { // lying or tumbling: keep the outline, recoloured as hair and face
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const m = mat[y * fw + x], l = lv[y * fw + x];
          if (isH(m)) set(x, y, hair[l]); else if (m === FM) set(x, y, skin[Math.min(3, l + 1)]); else if (m === FD) set(x, y, skin[1]); }
        return; }
      for (let y = y0; y <= y1; y++) for (let x = Math.max(0, x0 - 1); x <= Math.min(fw - 1, x1 + 1); x++) { const k = y * fw + x, m = mat[k];
        if (isH(m) || m === FM || m === FD || m === SK) { o[k * 4 + 3] = 0; mat[k] = -2; } }
      if (!BACK_ROWS[sheet]) backRows(sheet);
      const cols = data[sheet].px.width / fw, back = BACK_ROWS[sheet].has(Math.floor(id / cols));
      const view = back || !fn ? 'back' : face === 0 ? 'front' : 'side', T = bareGrid(view, P.bare), G = T.g, gw = G[0].length, mir = view === 'side' && face < 0;
      const ox = view === 'side' ? (face > 0 ? x1 - 1 - (gw - 1) : x0 + 1) : Math.round((x0 + x1) / 2 - (gw - 1) / 2), oy = y1 - T.ar;
      const JE = MI.jersey, JT = MI.jerseyTrim;
      for (let gy = 0; gy < G.length; gy++) for (let gx = 0; gx < gw; gx++) { const t = G[gy][mir ? gw - 1 - gx : gx]; if (!t || t === '.') continue;
        const X = ox + gx, Y = oy + gy; if (X < 0 || Y < 0 || X >= fw || Y >= fh) continue; const m = mat[Y * fw + X];
        // never over the ball, the arms or the hands; long hair may fall over the jersey
        if (!(m === -2 || m === -1 || m === SK || (gy > T.ar - 2 && (m === JE || m === JT)))) continue;
        set(X, Y, t[0] === 'h' ? hair[+t[1]] : t[0] === 's' ? skin[+t[1]] : eye); }
    }

    function recolor(sheetName, P, number, mirrorNumbers) {
      const src = data[sheetName], W = src.px.width, H = src.px.height;
      const out = new ImageData(W, H), d = src.px.data, o = out.data;
      const nd = src.num ? src.num.data : null;
      const grid = number != null && nd ? numberGrid(number) : null;
      const [NW] = ATLAS.numberGrid;
      const jer = MI.jersey;
      for (let i = 0; i < d.length; i += 4) {
        const a = d[i + 3];
        if (a === 0) continue;
        if (a !== 255) { o[i] = d[i]; o[i + 1] = d[i + 1]; o[i + 2] = d[i + 2]; o[i + 3] = a; continue; } // shadow
        const id = keyMap.get((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]);
        if (id === undefined) { o[i] = d[i]; o[i + 1] = d[i + 1]; o[i + 2] = d[i + 2]; o[i + 3] = 255; continue; }
        const m = id >> 2, l = id & 3;
        let c = P.pal[m][l];
        if (grid && m === jer && nd[i + 3]) {
          const t = nd[i] - 1; let tx = t % NW; const ty = (t - tx) / NW;
          if (mirrorNumbers) tx = NW - 1 - tx;
          const v = grid[ty][tx];
          if (v === 1) c = P.num[Math.max(1, l)];
          else if (v === 2 && P.trim) c = P.trim[Math.max(1, l)];
        }
        o[i] = c[0]; o[i + 1] = c[1]; o[i + 2] = c[2]; o[i + 3] = 255;
      }
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      cv.getContext('2d').putImageData(out, 0, 0);
      if (mirrorNumbers) {   // pre-flip so drawing is a plain blit
        const f = document.createElement('canvas'); f.width = W; f.height = H;
        const fx = f.getContext('2d');
        const fw = ATLAS.frameW, cols = W / fw;
        for (let c = 0; c < cols; c++) {
          fx.save(); fx.translate((c + 1) * fw, 0); fx.scale(-1, 1);
          fx.drawImage(cv, c * fw, 0, fw, H, 0, 0, fw, H); fx.restore();
        }
        return f;
      }
      return cv;
    }

    class Sprite {
      constructor(sheetName, P, number) {
        this.sheet = sheetName; this.meta = ATLAS.sheets[sheetName].anims;
        this.right = recolor(sheetName, P, number, false);
        this.left = recolor(sheetName, P, number, true);
        this.anims = Object.keys(this.meta);
      }
      info(anim) { return this.meta[anim]; }
      frameAt(anim, seconds) {
        const a = this.meta[anim]; const f = Math.floor(seconds * a.fps);
        return a.loop ? f % a.frames : Math.min(f, a.frames - 1);
      }
      draw(ctx, anim, frame, x, y, opt = {}) {
        const a = this.meta[anim]; if (!a) throw new Error('unknown animation: ' + anim);
        const s = opt.scale || 1, fw = ATLAS.frameW, fh = ATLAS.frameH, flip = !!opt.flip;
        frame = ((frame % a.frames) + a.frames) % a.frames;
        const ax = flip ? fw - ATLAS.anchor[0] : ATLAS.anchor[0];
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(flip ? this.left : this.right, frame * fw, a.row * fh, fw, fh,
          Math.round(x - ax * s), Math.round(y - ATLAS.anchor[1] * s), fw * s, fh * s);
      }
      /** ball centre in this frame relative to the ground anchor (null when the ball is not drawn) */
      ballOffset(anim, frame, flip = false) {
        const b = this.meta[anim].info[frame].ball; if (!b) return null;
        return { x: (flip ? ATLAS.frameW - b[0] : b[0]) - (flip ? ATLAS.frameW - ATLAS.anchor[0] : ATLAS.anchor[0]), y: b[1] - ATLAS.anchor[1] };
      }
    }

    function cached(key, make) { if (!cache.has(key)) cache.set(key, make()); return cache.get(key); }

    // ---- light mode (added for Gridiron Prep: Game Day): one recoloured sheet, numbers as overlay pixels
    const numMaps = {};
    function numberPixels(sheetName) {
      if (numMaps[sheetName]) return numMaps[sheetName];
      const src = data[sheetName]; if (!src.num) return (numMaps[sheetName] = null);
      const W = src.px.width, d = src.px.data, nd = src.num.data, fw = ATLAS.frameW, fh = ATLAS.frameH, cols = W / fw;
      const map = new Map();
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] !== 255 || !nd[i + 3]) continue;
        const id = keyMap.get((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]);
        if (id === undefined || (id >> 2) !== MI.jersey) continue;
        const p = i / 4, px = p % W, py = (p - px) / W, cell = Math.floor(py / fh) * cols + Math.floor(px / fw);
        if (!map.has(cell)) map.set(cell, []);
        map.get(cell).push([px % fw, py % fh, nd[i] - 1, id & 3]);
      }
      return (numMaps[sheetName] = map);
    }
    // ---- per-player equipment (gloves, cleats, sleeves, bands, undershirts, towel, mouthpiece) drawn as pixel overlays
    const eqMaps = {};
    // rows drawn from behind (no towel visible at the front hip)
    const BACK_ROWS = {};
    function backRows(sheetName) { const s = new Set(), A = ATLAS.sheets[sheetName].anims; for (const k in A) if (/(^|_)back$|^run_back|^stand_back|coach_back/.test(k)) s.add(A[k].row); BACK_ROWS[sheetName] = s; }
    function eqCell(sheetName, cell) {
      const M = eqMaps[sheetName] || (eqMaps[sheetName] = new Map()); if (M.has(cell)) return M.get(cell);
      if (!BACK_ROWS[sheetName]) backRows(sheetName);
      const src = data[sheetName], Wd = src.px.width, d = src.px.data, fw = ATLAS.frameW, fh = ATLAS.frameH, cols = Wd / fw;
      const cx0 = (cell % cols) * fw, cy0 = Math.floor(cell / cols) * fh;
      const mat = new Int8Array(fw * fh).fill(-2), lv = new Int8Array(fw * fh);
      for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) { const i = ((cy0 + y) * Wd + cx0 + x) * 4; if (d[i + 3] !== 255) continue;
        const id = keyMap.get((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]); if (id === undefined) { mat[y * fw + x] = -1; continue; } mat[y * fw + x] = id >> 2; lv[y * fw + x] = id & 3; }
      const at = (x, y) => (x < 0 || y < 0 || x >= fw || y >= fh) ? -3 : mat[y * fw + x];
      const ARM = MI.armSleeve, GL = MI.gloves, JE = MI.jersey, JT = MI.jerseyTrim, CL = MI.cleats, SK = MI.skin, FM = MI.facemask, HE = MI.helmet;
      const PANTS = [MI.pants, MI.pantsStripe, MI.belt], HELM = [HE, MI.helmetStripe, MI.helmetLogo];
      const out = { glove: [], cleat: [], arm: [], neck: [], hem: [], baggy: [], towel: null, mouth: null, knee: [], sock: [], towelPx: null, helm: [], mask: [], shoulder: [] };
      let hx = 0, hn = 0, fx = 0, fn = 0, fyMax = -1, hyMax = -1;
      for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) { const m = mat[y * fw + x];
        if (m === GL) out.glove.push([x, y, lv[y * fw + x]]); else if (m === CL) out.cleat.push([x, y, lv[y * fw + x]]);
        if (HELM.includes(m)) { hx += x; hn++; hyMax = Math.max(hyMax, y); out.helm.push([x, y, lv[y * fw + x], m]); } if (m === FM) { fx += x; fn++; fyMax = Math.max(fyMax, y); out.mask.push([x, y, lv[y * fw + x]]); } }
      const face = fn && hn ? Math.sign(Math.round(fx / fn - hx / hn)) : 0;
      const backRowAll = !!(BACK_ROWS[sheetName] && BACK_ROWS[sheetName].has(Math.floor(cell / cols)));
      // visor: the top two rows of face showing through the facemask (none from behind)
      out.visor = [];
      if (fn && hn && !backRowAll) { let hy0 = 99, hx0 = 99, hx1 = -1; for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) { const m = mat[y * fw + x]; if (HELM.includes(m) || m === FM) { hy0 = Math.min(hy0, y); hx0 = Math.min(hx0, x); hx1 = Math.max(hx1, x); } }
        const F = []; for (let y = hy0; y <= Math.max(hyMax, fyMax); y++) for (let x = hx0; x <= hx1; x++) { const m = mat[y * fw + x]; if (m === SK || m === MI.faceDark) F.push([x, y]); }
        if (F.length) { const y0 = Math.min(...F.map(f => f[1])); for (const [x, y] of F) if (y <= y0 + 1) out.visor.push([x, y, y === y0 ? 1 : 0]); out.faceSk = F; out.faceY0 = y0; } }
      // arm pixels: distance (through the arm) from the jersey sleeve and from the glove, split into the two arms
      const dJ = new Int16Array(fw * fh).fill(99), dG = new Int16Array(fw * fh).fill(99), comp = new Int16Array(fw * fh).fill(-1), N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      const bfs = (dist, seed) => { const q = []; for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) if (mat[y * fw + x] === ARM && N4.some(([a, b]) => seed(at(x + a, y + b)))) { dist[y * fw + x] = 0; q.push(y * fw + x); }
        for (let h = 0; h < q.length; h++) { const p = q[h], x = p % fw, y = (p - x) / fw; for (const [a, b] of N4) { const X = x + a, Y = y + b; if (at(X, Y) !== ARM) continue; const k = Y * fw + X; if (dist[k] <= dist[p] + 1) continue; dist[k] = dist[p] + 1; q.push(k); } } };
      bfs(dG, m => m === GL);
      const comps = []; for (let p0 = 0; p0 < fw * fh; p0++) { if (mat[p0] !== ARM || comp[p0] >= 0) continue; const id = comps.length, q = [p0]; comp[p0] = id; let over = 0;
        for (let h = 0; h < q.length; h++) { const p = q[h], x = p % fw, y = (p - x) / fw; if (at(x - 1, y) === JE && at(x + 1, y) === JE) over++; for (const [a, b] of N4) { const X = x + a, Y = y + b; if (at(X, Y) !== ARM) continue; const k = Y * fw + X; if (comp[k] >= 0) continue; comp[k] = id; q.push(k); } }
        comps.push({ id, n: q.length, over }); }
      // sleeve opening = each arm's highest pixels touching the jersey (a hanging arm also touches the torso all the way down)
      { const adjJ = (x, y) => N4.some(([a, b]) => { const m = at(x + a, y + b); return m === JE || m === JT; }), top = {}, q = [];
        let jTop = 99, jBot = -1; for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) if (mat[y * fw + x] === JE || mat[y * fw + x] === JT) { jTop = Math.min(jTop, y); jBot = Math.max(jBot, y); }
        const zone = jTop + Math.max(5, (jBot - jTop) * 0.55);
        for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) { const k = y * fw + x; if (mat[k] !== ARM || !adjJ(x, y) || y > zone) continue; const c = comp[k]; if (top[c] == null || y < top[c]) top[c] = y; }
        // bent-over bodies (low stances, 3-point) put the shoulder below that zone: fall back to the arm's highest contact with the jersey
        for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) { const k = y * fw + x; if (mat[k] !== ARM || !adjJ(x, y)) continue; const c = comp[k]; if (top[c] == null && !comps[c].fb) { top[c] = y; comps[c].fb = 1; } }
        for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) { const k = y * fw + x; if (mat[k] !== ARM || !adjJ(x, y) || top[comp[k]] == null) continue; if (y <= top[comp[k]] + 1) { dJ[k] = 0; q.push(k); } }
        for (let h = 0; h < q.length; h++) { const p = q[h], x = p % fw, y = (p - x) / fw; for (const [a, b] of N4) { const X = x + a, Y = y + b; if (at(X, Y) !== ARM) continue; const k = Y * fw + X; if (dJ[k] <= dJ[p] + 1) continue; dJ[k] = dJ[p] + 1; q.push(k); } } }
      const order = comps.slice().sort((a, b) => (b.over - a.over) || (b.n - a.n)), rank = {}; order.forEach((c, i) => rank[c.id] = i);
      for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) { const k = y * fw + x; if (mat[k] !== ARM) continue; out.arm.push([x, y, lv[k], dJ[k], dG[k], rank[comp[k]] || 0]);
        if (dJ[k] <= 5) for (const [a, b] of N4) { const X = x + a, Y = y + b; if (at(X, Y) === -2 && !out.baggy.some(q => q[0] === X && q[1] === Y)) out.baggy.push([X, Y, 1, rank[comp[k]] || 0]); } }
      // v2.14 shoulder stripes: jersey pixels just above each sleeve opening, by distance (through the jersey) from it
      { const seen = new Int16Array(fw * fh).fill(99), q = [];
        for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) { const k = y * fw + x; if (mat[k] !== ARM || dJ[k] !== 0) continue;
          for (const [a, b] of N4) { const X = x + a, Y = y + b, m = at(X, Y); if (m !== JE && m !== JT) continue; const kk = Y * fw + X; if (seen[kk] > 0) { seen[kk] = 0; q.push(kk); } } }
        for (let h = 0; h < q.length; h++) { const p = q[h], x = p % fw, y = (p - x) / fw; if (seen[p] >= 4) continue;
          for (const [a, b] of N4) { const X = x + a, Y = y + b, m = at(X, Y); if (m !== JE && m !== JT) continue; const kk = Y * fw + X; if (seen[kk] <= seen[p] + 1) continue; seen[kk] = seen[p] + 1; q.push(kk); } }
        for (const p of q) { const x = p % fw, y = (p - x) / fw; out.shoulder.push([x, y, lv[p], seen[p]]); } }
      // collar (neck skin touching the jersey) and the shirt tail just under the jersey
      for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) { const m = mat[y * fw + x];
        if (m === SK && y > hyMax - 3 && N4.some(([a, b]) => at(x + a, y + b) === JE || at(x + a, y + b) === JT)) out.neck.push([x, y, lv[y * fw + x]]);
        if (PANTS.includes(m)) { const u1 = at(x, y - 1), u2 = at(x, y - 2); if (u1 === JE || u1 === JT) out.hem.push([x, y, 2, 1]); else if ((u2 === JE || u2 === JT) && PANTS.includes(u1)) out.hem.push([x, y, 1, 2]); } }
      // legs: the lowest pants rows over each leg (shorts show the knee) and the sock pixels (low / no socks show the shin)
      { const PNT = [MI.pants, MI.pantsStripe], SO = [MI.socks, MI.sockStripe];
        for (let x = 0; x < fw; x++) { let bot = -1; for (let y = fh - 1; y >= 0; y--) if (PNT.includes(mat[y * fw + x])) { bot = y; break; }
          if (bot >= 0 && (SO.includes(at(x, bot + 1)) || (at(x, bot + 1) === -1 && (SO.includes(at(x - 1, bot + 1)) || SO.includes(at(x + 1, bot + 1)))))) for (let y = bot; y > bot - 3 && y >= 0; y--) if (PNT.includes(mat[y * fw + x])) out.knee.push([x, y, lv[y * fw + x]]);
          let sb = -1; for (let y = fh - 1; y >= 0; y--) if (SO.includes(mat[y * fw + x])) { sb = y; break; }
          for (let y = 0; y < fh; y++) if (SO.includes(mat[y * fw + x])) out.sock.push([x, y, lv[y * fw + x], y >= sb ? 1 : 0]); }
        // which leg each pixel belongs to: split the sock pixels into two columns (k-means on x); the "sleeve leg" is the
        // near leg in side views (drawn brighter) and the left one from the front / back, so it stays on the same leg as he runs
        const xs = out.sock.map(s => s[0]); let c0 = Math.min(...xs), c1 = Math.max(...xs);
        for (let it = 0; it < 6 && xs.length; it++) { let a0 = 0, n0 = 0, a1 = 0, n1 = 0; for (const x of xs) { if (Math.abs(x - c0) <= Math.abs(x - c1)) { a0 += x; n0++; } else { a1 += x; n1++; } } if (n0) c0 = a0 / n0; if (n1) c1 = a1 / n1; }
        const two = xs.length && Math.abs(c1 - c0) >= 2.5, legOf = x => !two ? 0 : (Math.abs(x - c0) <= Math.abs(x - c1) ? 0 : 1);
        let sleeveLeg = 0;
        if (two) { const lvAvg = g => { let s = 0, n = 0; for (const q of out.sock) if (legOf(q[0]) === g) { s += q[2]; n++; } return n ? s / n : 0; }; const l0 = lvAvg(0), l1 = lvAvg(1); sleeveLeg = Math.abs(l0 - l1) >= 0.3 ? (l1 > l0 ? 1 : 0) : 0; }
        for (const s of out.sock) s.push(legOf(s[0])); for (const k of out.knee) k.push(legOf(k[0])); out.legs = two ? 2 : 1; out.sleeveLeg = sleeveLeg; out.legC = [c0, c1]; }
      // cropped jersey: the bottom two jersey rows above the pants show the undershirt (front / side) or the back plate (back)
      out.crop = []; out.back = backRowAll;
      for (let x = 0; x < fw; x++) { let yb = -1; for (let y = fh - 1; y >= 0; y--) { const m = mat[y * fw + x]; if ((m === JE || m === JT) && (PANTS.includes(at(x, y + 1)) || PANTS.includes(at(x, y + 2)))) { yb = y; break; } }
        if (yb < 0) continue; for (let y = yb; y > yb - 2 && y >= 0; y--) { const m = mat[y * fw + x]; if (m === JE || m === JT) out.crop.push([x, y, lv[y * fw + x]]); } }
      if (out.crop.length && face) { const xs = out.crop.map(c => c[0]), bx = face > 0 ? Math.min(...xs) : Math.max(...xs); out.cropBack = bx; }
      // towel tucked in at the front hip, mouthpiece hanging off the bottom of the facemask
      let wy = -1, wx0 = 99, wx1 = -1; for (let y = 0; y < fh && wy < 0; y++) for (let x = 0; x < fw; x++) if (mat[y * fw + x] === MI.pants || mat[y * fw + x] === MI.belt) { wy = y; break; }
      if (wy >= 0) { for (let x = 0; x < fw; x++) if (PANTS.includes(at(x, wy)) || PANTS.includes(at(x, wy + 1))) { wx0 = Math.min(wx0, x); wx1 = Math.max(wx1, x); }
        const tx = face > 0 ? wx1 - 3 : face < 0 ? wx0 + 1 : Math.round((wx0 + wx1) / 2) - 3; out.towel = [tx, wy + 1, face];
        // the towel only shows where it isn't behind an arm, the torso or the far side of the body
        const backRow = BACK_ROWS[sheetName] && BACK_ROWS[sheetName].has(Math.floor(cell / cols));
        if (backRow) out.towel = null; else { const ok = new Set([-2, MI.pants, MI.pantsStripe, MI.belt, MI.socks, MI.sockStripe]); out.towelPx = (x, y) => ok.has(at(x, y)); } }
      if (fn) { let bx = -1; for (let x = 0; x < fw; x++) if (at(x, fyMax) === FM && (bx < 0 || (face >= 0 ? x > bx : x < bx))) bx = x; if (face === 0) { let s = 0, c = 0; for (let x = 0; x < fw; x++) if (at(x, fyMax) === FM) { s += x; c++; } bx = Math.round(s / c); }
        out.mouth = [bx - (face > 0 ? 1 : 0), fyMax + 1]; }
      out.face = face; M.set(cell, out); return out;
    }
    // follow one physical leg through an animation (legs swap front and back while running), so a single
    // leg sleeve stays on the same leg instead of jumping to whichever leg is in front
    const legTrackC = {};
    function legSleeveFor(sheetName, cell, E) {
      const cols = data[sheetName].px.width / ATLAS.frameW, row = Math.floor(cell / cols), key = sheetName + '|' + row;
      if (!legTrackC[key]) { let n = 1; const A = ATLAS.sheets[sheetName].anims; for (const k in A) if (A[k].row === row) { n = A[k].frames; break; }
        const C = []; for (let f = 0; f < n; f++) { const e = eqCell(sheetName, row * cols + f); C.push(e.legs === 2 ? e.legC : null); }
        const res = new Array(n).fill(0), i0 = C.findIndex(c => c);
        if (i0 >= 0 && n > 1) { let a = C[i0][0], b = C[i0][1], va = 0, vb = 0;
          for (let k = 1; k < n; k++) { const f = (i0 + k) % n; if (!C[f]) { a += va; b += vb; continue; }
            const [p0, q0] = C[f], pa = a + va, pb = b + vb;
            if (Math.abs(p0 - pa) + Math.abs(q0 - pb) <= Math.abs(p0 - pb) + Math.abs(q0 - pa)) { res[f] = 0; va = p0 - a; vb = q0 - b; a = p0; b = q0; }
            else { res[f] = 1; va = q0 - a; vb = p0 - b; a = q0; b = p0; } }
          legTrackC[key] = { res, base: E && n > 1 ? 0 : null }; }
        else legTrackC[key] = { res: null }; }
      const T = legTrackC[key], f = cell % cols; return T.res ? T.res[f] : (E.sleeveLeg || 0); }
    const eqCss = new Map();
    function eqRamp(hex) { if (!eqCss.has(hex)) eqCss.set(hex, ramp(hex).map(css)); return eqCss.get(hex); }
    function drawEq(ctx, sheet, cell, ax, ay, sx, sy, eq, skin, hp) {
      const E = eqCell(sheet, cell), R = (x, y, c) => { ctx.fillStyle = c; ctx.fillRect((x - ax) * sx, (y - ay) * sy, sx + 0.04, sy + 0.04); };
      // v2.14 jersey style: stripes across the shoulders (team uniform setting)
      if (eq.shoulder && eq.shoulder.mode && eq.shoulder.mode !== 'none' && E.shoulder) { const r = eqRamp(eq.shoulder.c || '#ffffff'), D = { single: [2], double: [1, 3], triple: [1, 2, 3] }[eq.shoulder.mode] || [2];
        for (const [x, y, l, d] of E.shoulder) if (D.includes(d)) R(x, y, r[Math.max(1, l)]); }
      // v2.14 helmet style (player setting): shell finish, stripe on or off, facemask colour
      if (eq.helm && hp && E.helm) { const H = eq.helm, sh = l => H.shell === 'matte' ? hp[[0, 1, 1, 1][l]] : H.shell === 'chrome' ? [hp[0], hp[2], hp[3], '#ffffff'][l] : hp[l];
        if ((H.shell && H.shell !== 'gloss') || H.stripe === 'none') for (const [x, y, l, m] of E.helm) { if (m === MI.helmetStripe && H.stripe === 'none') R(x, y, sh(l)); else if (m === MI.helmet && H.shell && H.shell !== 'gloss') R(x, y, sh(l)); }
        if (H.mask) { const r = eqRamp(H.mask); for (const [x, y, l] of E.mask) R(x, y, r[l]); } }
      if (skin && eq.pants === 'short') for (const [x, y, l] of E.knee) R(x, y, skin[l]);
      if (skin && (eq.socks === 'low' || eq.socks === 'none')) for (const [x, y, l, bottom] of E.sock) if (eq.socks === 'none' || !bottom) R(x, y, skin[l]);
      // leg sleeves: from the knee to the ankle, on one leg or both
      if (eq.legS && eq.legS.mode && eq.legS.mode !== 'none') { const r = eqRamp(eq.legS.c), one = eq.legS.mode === 'one' || eq.legS.mode === 'onefar', l0 = one ? legSleeveFor(sheet, cell, E) : 0, leg = eq.legS.mode === 'onefar' ? 1 - l0 : l0, ok = g => !one || (E.legs || 1) < 2 || g === leg;
        if (eq.pants === 'short') for (const [x, y, l, g] of E.knee) if (ok(g)) R(x, y, r[Math.max(1, l)]);
        for (const [x, y, l, bottom, g] of E.sock) if (!bottom && ok(g)) R(x, y, r[Math.max(1, l)]); }
      // cropped jersey: undershirt at the midriff from the front and sides, back plate from behind (faintly at the side)
      if (eq.crop && E.crop && E.crop.length) { const U0 = eq.under && eq.under.mode !== 'none' ? eq.under.c : '#2b2f36', ru = eqRamp(U0), rp = eqRamp('#d9dee5');
        if (E.back) { const xs = E.crop.map(c => c[0]), x0 = Math.min(...xs), x1 = Math.max(...xs), m0 = x0 + (x1 - x0) * 0.18, m1 = x1 - (x1 - x0) * 0.18;
          for (const [x, y, l] of E.crop) R(x, y, x >= m0 && x <= m1 ? rp[Math.min(3, l + 1)] : ru[Math.max(1, l)]); }
        else { for (const [x, y, l] of E.crop) R(x, y, ru[Math.max(1, l)]);
          if (E.cropBack != null) { ctx.globalAlpha = 0.55; for (const [x, y, l] of E.crop) if (x === E.cropBack) R(x, y, rp[2]); ctx.globalAlpha = 1; } } }
      const U = eq.under, S = eq.sleeve, B = eq.band;
      if (U && U.mode !== 'none') { const r = eqRamp(U.c);
        const lim = U.mode === 'long' ? 99 : U.mode === 'quarter' ? 3 : 5;
        for (const [x, y, l, dj] of E.arm) if (dj <= lim) R(x, y, r[Math.max(1, l)]);
        if (U.mode === 'jamo') { for (const [x, y] of E.baggy) R(x, y, r[0]); for (const [x, y, l] of E.hem) R(x, y, r[l]); }
        for (const [x, y, l] of E.neck) R(x, y, r[Math.max(1, l)]); }
      if (S && S.mode !== 'none') { const r = eqRamp(S.c), side = S.mode === 'onefar' ? 1 : 0; for (const [x, y, l, dj, dg, c] of E.arm) if (dj >= 1 && (S.mode === 'both' || c === side)) R(x, y, r[Math.max(1, l)]); }
      if (B && B.mode !== 'none') { const r = eqRamp(B.c), bic = /^bicep/.test(B.mode), one = /1/.test(B.mode), side = /f$/.test(B.mode) ? 1 : 0; for (const [x, y, l, dj, dg, c] of E.arm) { const hit = bic ? (dj >= 2 && dj <= 3) : dg <= 1; if (hit && (!one || c === side)) R(x, y, r[Math.min(3, Math.max(2, l + 1))]); } }
      if (eq.glove) { const r = eqRamp(eq.glove); for (const [x, y, l] of E.glove) R(x, y, r[l]); }
      if (eq.cleat) { const r = eqRamp(eq.cleat); for (const [x, y, l] of E.cleat) R(x, y, r[l]); }
      if (eq.noGlove && skin) for (const [x, y, l] of E.glove) R(x, y, skin[l]); // quarterbacks throw bare-handed
      if (eq.visor && E.visor && E.visor.length) { const r = eqRamp(eq.visor), xs = E.visor.map(v => v[0]), gx = Math.min(...xs) + 1; for (const [x, y, top] of E.visor) R(x, y, top ? r[2] : (x === gx ? r[3] : r[1])); }
      if (eq.towel && E.towel) { const r = eqRamp(eq.towel), [tx, ty, f] = E.towel, ok = E.towelPx || (() => true), T = (x, y, c) => { if (ok(x, y)) R(x, y, c); };
        for (let k = 0; k < 6; k++) { T(tx - 1, ty + k, r[0]); T(tx + 3, ty + k, r[0]); for (let j = 0; j < 3; j++) if (!(k === 5 && j === 1)) T(tx + j, ty + k, r[j === 1 ? 3 : 2 - (j === 2 && f > 0 ? 1 : 0)]); } T(tx, ty + 6, r[0]); T(tx + 2, ty + 6, r[0]); }
      // ski mask: the face and neck under the helmet in the mask colour, an eye slit left open
      if (eq.ski) { const r = eqRamp(eq.ski); if (E.faceSk) for (const [x, y] of E.faceSk) if (y !== E.faceY0) R(x, y, r[y === E.faceY0 + 1 ? 1 : 2]); for (const [x, y, l] of E.neck) R(x, y, r[Math.max(1, l)]); }
      if (eq.mouth && E.mouth) { const r = eqRamp(eq.mouth), [mx, my] = E.mouth; R(mx, my, r[3]); R(mx + 1, my, r[2]); R(mx, my + 1, r[2]); R(mx + 1, my + 1, r[1]); R(mx, my + 2, r[1]); }
      if (eq.mouth2 && E.mouth) { const r = eqRamp(eq.mouth2), [m0, my] = E.mouth, mx = m0 + (E.face < 0 ? 3 : -3); R(mx, my, r[3]); R(mx + 1, my, r[2]); R(mx, my + 1, r[2]); R(mx + 1, my + 1, r[1]); R(mx, my + 2, r[1]); }
      // guardian cap: a padded, ribbed soft shell over the helmet, a little taller than the shell
      if (eq.gcap && E.helm && E.helm.length) { const r = eqRamp(eq.gcap), H = new Set(E.helm.map(h => h[0] + ',' + h[1])), top = {};
        for (const [x, y] of E.helm) { if (top[x] == null || y < top[x]) top[x] = y; }
        for (const [x, y] of E.helm) { const edge = !H.has((x + 1) + ',' + y) || !H.has((x - 1) + ',' + y) || !H.has(x + ',' + (y - 1)); R(x, y, edge ? r[0] : r[(x >> 1) % 2 ? 2 : 3]); }
        for (const x in top) R(+x, top[x] - 1, r[0]); }
    }
    const gridCache = new Map();
    function gridFor(n) { if (!gridCache.has(n)) gridCache.set(n, numberGrid(n)); return gridCache.get(n); }
    const css = c => `rgb(${c[0]},${c[1]},${c[2]})`;
    class LiteSprite {
      constructor(sheetName, P) {
        this.sheet = sheetName; this.meta = ATLAS.sheets[sheetName].anims;
        // v2.06: frames are recoloured lazily into small shared pages instead of one full recoloured sheet
        // per team/build/skin (a full sheet is ~8 MB of canvas memory; 30+ of them crashed phones mid-game)
        this.P = P; this.pages = []; this.cells = new Map(); this.free = 0;
        this.num = P.num.map(css); this.trim = P.trim ? P.trim.map(css) : null;
        this.skin = P.pal[MI.skin].map(css); this.helm = P.pal[MI.helmet].map(css);
        this.cols = data[sheetName].px.width / ATLAS.frameW;
      }
      cell(id) {
        let c = this.cells.get(id); if (c) return c;
        const fw = ATLAS.frameW, fh = ATLAS.frameH, PER = 8, slot = this.free++, pi = Math.floor(slot / (PER * PER));
        if (!this.pages[pi]) { const cv = document.createElement('canvas'); cv.width = PER * fw; cv.height = PER * fh; this.pages[pi] = cv; }
        const k = slot % (PER * PER), tx = (k % PER) * fw, ty = Math.floor(k / PER) * fh;
        const src = data[this.sheet], W = src.px.width, d = src.px.data, P = this.P;
        const cx = (id % this.cols) * fw, cy = Math.floor(id / this.cols) * fh;
        const out = new ImageData(fw, fh), o = out.data, mat = P.bare || P.slim ? new Int8Array(fw * fh).fill(-2) : null, lv = mat ? new Int8Array(fw * fh) : null;
        for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) {
          const i = ((cy + y) * W + cx + x) * 4, j = (y * fw + x) * 4, a = d[i + 3];
          if (a === 0) continue;
          if (a !== 255) { o[j] = d[i]; o[j + 1] = d[i + 1]; o[j + 2] = d[i + 2]; o[j + 3] = a; if (mat) mat[y * fw + x] = -1; continue; }
          const kid = keyMap.get((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]);
          if (kid === undefined) { o[j] = d[i]; o[j + 1] = d[i + 1]; o[j + 2] = d[i + 2]; o[j + 3] = 255; if (mat) mat[y * fw + x] = -1; continue; }
          const col = P.pal[kid >> 2][kid & 3];
          o[j] = col[0]; o[j + 1] = col[1]; o[j + 2] = col[2]; o[j + 3] = 255;
          if (mat) { mat[y * fw + x] = kid >> 2; lv[y * fw + x] = kid & 3; }
        }
        if (mat) bareStamp(this.sheet, id, o, mat, lv, P);
        this.pages[pi].getContext('2d').putImageData(out, tx, ty);
        c = [this.pages[pi], tx, ty]; this.cells.set(id, c); return c;
      }
      has(anim) { return !!this.meta[anim]; }
      info(anim) { return this.meta[anim]; }
      draw(ctx, anim, frame, x, y, sx, sy, flip, number, eq) {
        const a = this.meta[anim]; if (!a) return;
        const fw = ATLAS.frameW, fh = ATLAS.frameH, ax = ATLAS.anchor[0], ay = ATLAS.anchor[1];
        frame = ((frame % a.frames) + a.frames) % a.frames;
        ctx.imageSmoothingEnabled = false;
        const m = ctx.getTransform();
        ctx.translate(x, y); if (flip) ctx.scale(-1, 1);
        const C = this.cell(a.row * this.cols + frame);
        ctx.drawImage(C[0], C[1], C[2], fw, fh, -ax * sx, -ay * sy, fw * sx, fh * sy);
        if (number != null) {
          const map = numberPixels(this.sheet), list = map && map.get(a.row * this.cols + frame);
          if (list) {
            const g = gridFor(number), NW = ATLAS.numberGrid[0];
            for (const [px, py, t, l] of list) {
              let tx = t % NW; const ty = (t - tx) / NW; if (flip) tx = NW - 1 - tx;
              const v = g[ty] && g[ty][tx]; if (!v) continue;
              const col = v === 1 ? this.num[Math.max(1, l)] : (this.trim ? this.trim[Math.max(1, l)] : null); if (!col) continue;
              ctx.fillStyle = col; ctx.fillRect((px - ax) * sx, (py - ay) * sy, sx + 0.04, sy + 0.04);
            }
          }
        }
        if (eq && this.sheet !== 'referee') drawEq(ctx, this.sheet, a.row * this.cols + frame, ax, ay, sx, sy, eq, this.skin, this.helm);
        ctx.setTransform(m);
      }
    }

    return {
      ATLAS, SKIN_TONES, POSITION_BUILD, ramp,
      lite(sheetName, team, skin) {
        return cached(JSON.stringify(['L', sheetName, team, skin]), () => new LiteSprite(sheetName, resolvePalette(team, skin)));
      },
      isCached(sheetName, team, skin) { return cache.has(JSON.stringify(['L', sheetName, team, skin])); },
      memInfo() { let pages = 0, cells = 0, sprites = 0; for (const v of cache.values()) if (v && v.pages) { sprites++; pages += v.pages.length; cells += v.cells.size; } return { sprites, pages, cells, mb: Math.round(pages * 512 * 512 * 4 / 1e6) }; },
      // add a new animation row (drawn in the atlas key colours) to a sheet, so it recolours like the originals
      addAnim(sheetName, name, cv, frames, fps, loop) {
        const src = data[sheetName], fw = ATLAS.frameW, fh = ATLAS.frameH, Wd = src.px.width, Hd = src.px.height, rows = Hd / fh;
        const grow = (img, art) => { const c = document.createElement('canvas'); c.width = Wd; c.height = Hd + fh; const x = c.getContext('2d');
          x.putImageData(img, 0, 0); if (art) x.drawImage(art, 0, Hd); return x.getImageData(0, 0, Wd, Hd + fh); };
        src.px = grow(src.px, cv); if (src.num) src.num = grow(src.num, null);
        ATLAS.sheets[sheetName].anims[name] = { row: rows, frames, fps, loop, info: Array.from({ length: frames }, () => ({ ball: null })) };
        delete numMaps[sheetName]; delete eqMaps[sheetName]; for (const k in legTrackC) if (k.startsWith(sheetName + '|')) delete legTrackC[k]; cache.clear();
      },
      // raw key/number pixels of one frame, plus helpers to add a row built from raw pixels (stays recolourable, keeps jersey numbers)
      frameRaw(sheetName, anim, frame) {
        const src = data[sheetName], a = ATLAS.sheets[sheetName].anims[anim], fw = ATLAS.frameW, fh = ATLAS.frameH, Wd = src.px.width;
        const cp = (img) => { if (!img) return null; const o = new Uint8ClampedArray(fw * fh * 4);
          for (let y = 0; y < fh; y++) { const s = ((a.row * fh + y) * Wd + frame * fw) * 4; o.set(img.data.subarray(s, s + fw * 4), y * fw * 4); } return o; };
        return { px: cp(src.px), num: cp(src.num) };
      },
      addAnimsRaw(sheetName, list) {
        const src = data[sheetName], fw = ATLAS.frameW, fh = ATLAS.frameH, Wd = src.px.width, Hd = src.px.height, rows = Hd / fh, n = list.length;
        const grow = (img, key) => { const o = new ImageData(Wd, Hd + fh * n); o.data.set(img.data);
          list.forEach((A, r) => A.frames.forEach((f, i) => { const d = f[key]; if (!d) return; for (let y = 0; y < fh; y++) o.data.set(d.subarray(y * fw * 4, (y + 1) * fw * 4), ((Hd + r * fh + y) * Wd + i * fw) * 4); })); return o; };
        src.px = grow(src.px, 'px'); if (src.num) src.num = grow(src.num, 'num');
        list.forEach((A, r) => { ATLAS.sheets[sheetName].anims[A.name] = { row: rows + r, frames: A.frames.length, fps: A.fps, loop: A.loop, info: A.info || Array.from({ length: A.frames.length }, () => ({ ball: null })) }; });
        delete numMaps[sheetName]; delete eqMaps[sheetName]; for (const k in legTrackC) if (k.startsWith(sheetName + '|')) delete legTrackC[k]; delete BACK_ROWS[sheetName]; cache.clear();
      },
      editFrames(sheetName, fn) {
        const src = data[sheetName], fw = ATLAS.frameW, fh = ATLAS.frameH, Wd = src.px.width;
        for (const anim in ATLAS.sheets[sheetName].anims) { const a = ATLAS.sheets[sheetName].anims[anim];
          for (let f = 0; f < a.frames; f++) { const R = this.frameRaw(sheetName, anim, f); if (!fn(R, anim, f)) continue;
            for (let y = 0; y < fh; y++) { const s = ((a.row * fh + y) * Wd + f * fw) * 4; src.px.data.set(R.px.subarray(y * fw * 4, (y + 1) * fw * 4), s); if (src.num && R.num) src.num.data.set(R.num.subarray(y * fw * 4, (y + 1) * fw * 4), s); } } }
        delete numMaps[sheetName]; delete eqMaps[sheetName]; for (const k in legTrackC) if (k.startsWith(sheetName + '|')) delete legTrackC[k]; cache.clear();
      },
      // v1.97 helmets: every head is redrawn from one hand-made helmet per view (side / front / back / dive), anchored
      // to where the artist put the head, so the helmet looks the same in every frame. Letters: A shell, B stripe,
      // C logo, D facemask, Q face shadow, O skin; the digit is the shade (0 dark … 3 light).
      helmetTemplates() {
        const P = s => s.trim().split('\n').map(r => r.trim().split(/\s+/));
        return {
          side: { g: P(`
. . . . A0 A0 A0 A0 A0 . . . . .
. . A0 A0 B2 B3 B3 B3 B3 A0 A0 . . .
. A0 A1 A2 A2 A2 A3 A3 A3 A3 A3 A0 . .
A0 A1 A2 A2 A2 A2 A2 A3 A3 A3 A3 A3 A0 .
A0 A1 A2 C0 C1 C2 C2 C1 A2 A3 A3 A3 A0 .
A0 A1 A2 C1 C2 C3 C3 C2 A2 A2 A2 A2 A2 A0
A0 A1 A2 C1 C2 C3 C2 C2 A2 A2 A1 A0 A0 D2
A0 A1 A1 C0 C1 C2 C1 A2 A2 A1 Q0 Q0 O1 D3
. A0 A1 A1 A2 A2 A2 A2 A1 D1 D2 D2 D2 D3
. . A0 A0 A1 A1 A1 A1 A0 Q0 O1 O2 Q0 D2
. . . . A0 A0 A0 A0 D1 D2 D2 D2 D2 D2`), cx: 6, by: 10 },
          // diving / lunging: the same helmet tipped forward (crown leading, mask underneath)
          dive: { g: P(`
. . . . A0 A0 A0 A0 . . . .
. . A0 A0 A2 A2 A3 B3 A0 . . .
. A0 A1 A2 A2 A3 A3 A3 B3 A0 . .
A0 A1 A2 A2 A2 A2 A3 A3 A3 B3 A0 .
A0 A1 C1 C2 C2 A2 A2 A3 A3 A3 B2 A0
A0 A1 C2 C3 C2 A2 A2 A2 A2 A3 A2 A0
A0 A1 C1 C2 C1 A2 A2 A2 A0 A0 A2 A0
. A0 A1 A1 A2 A2 A1 A0 Q0 Q0 A0 D2
. . A0 A1 A1 A1 A0 Q0 O1 Q0 D2 D3
. . . A0 A0 A1 D1 O1 Q0 D2 D3 .
. . . . . A0 D1 D2 D2 D3 . .`), cx: 6, by: 10 },
          front: { g: P(`
. . . A0 A0 B2 B2 A0 A0 . . .
. A0 A0 A2 A3 B3 B3 A3 A2 A0 A0 .
A0 A1 A2 A2 A3 B3 B3 A3 A3 A2 A1 A0
A0 A1 A2 A2 A2 B3 B3 A2 A2 A2 A1 A0
A0 A1 A1 A0 A0 A0 A0 A0 A0 A1 A1 A0
A0 A1 D1 Q0 Q0 Q0 Q0 Q0 Q0 D1 A1 A0
A0 A1 D1 O1 Q0 O2 O2 Q0 O1 D1 A1 A0
. A0 D2 D3 D3 D3 D3 D3 D3 D2 A0 .
. A0 D1 O1 Q0 D2 D2 Q0 O1 D1 A0 .
. . A0 D1 D2 D3 D3 D2 D1 A0 . .`), cx: 5.5, by: 9 },
          // head turned a little toward the camera (pre-snap glance): crown stripe slides toward the face, face opens up
          q3: { g: P(`
. . . . A0 A0 A0 A0 A0 . . . .
. . A0 A0 A2 A2 B2 B3 A3 A0 A0 . .
. A0 A1 A2 A2 A2 B3 B3 A3 A3 A3 A0 .
A0 A1 A2 A2 A2 A2 B3 B3 A3 A3 A3 A2 A0
A0 A1 C1 C2 A2 A2 A2 B2 A2 A3 A3 A2 A0
A0 A1 C2 C3 A2 A2 A1 A0 A0 A0 A0 A0 A0
A0 A1 C1 C2 A2 A1 D1 Q0 Q0 Q0 Q0 D1 A0
A0 A1 A1 A2 A2 A1 D1 O1 Q0 O2 Q0 D2 A0
. A0 A1 A2 A1 A0 D2 D3 D3 D3 D3 D3 D2
. . A0 A1 A1 A0 D1 Q0 O1 O2 Q0 D2 .
. . . A0 A0 A0 A0 D1 D2 D2 D2 D1 .`), cx: 6, by: 10 },
          // head turned a little away from the camera: more shell and logo, only the edge of the mask
          q3a: { g: P(`
. . . . A0 A0 A0 A0 A0 . . . .
. . A0 A0 B2 B3 A2 A3 A3 A0 A0 . .
. A0 A1 B2 B3 A2 A2 A3 A3 A3 A3 A0 .
A0 A1 B2 B3 A2 A2 A2 A2 A3 A3 A3 A3 A0
A0 A1 A2 A2 A2 A2 C1 C2 C2 A2 A3 A2 A0
A0 A1 A2 A2 A2 C1 C2 C3 C3 C2 A2 A2 A0
A0 A1 A2 A2 A2 C1 C2 C3 C2 C2 A2 A0 D2
A0 A1 A1 A2 A2 A2 C1 C2 C1 A2 A1 A0 D3
. A0 A1 A1 A2 A2 A2 A2 A2 A1 A0 D2 D3
. . A0 A1 A1 A1 A1 A1 A1 A0 D1 D2 .
. . . A0 A0 A0 A0 A0 A0 D1 D2 . .`), cx: 6, by: 10 },
          back: { g: P(`
. . . A0 A0 B2 B2 A0 A0 . . .
. A0 A0 A2 A2 B3 B3 A3 A3 A0 A0 .
A0 A1 A2 A2 A2 B3 B3 A3 A3 A2 A1 A0
A0 A1 A2 A2 A2 B3 B3 A2 A3 A2 A1 A0
A0 A1 A2 A2 A2 B2 B2 A2 A2 A2 A1 A0
A0 A1 A1 A2 A2 B2 B2 A2 A2 A1 A1 A0
A0 A1 A1 A1 A2 A2 A2 A2 A1 A1 A1 A0
. A0 A1 A1 A1 A1 A1 A1 A1 A1 A0 .
. D1 A0 A0 A0 A0 A0 A0 A0 A0 D1 .`), cx: 5.5, by: 8 } };
      },
      improveHelmets(sheetName, only, force) { this.editFrames(sheetName, (R, anim) => (!only || only.test(anim)) && this.helmetStamp(R, anim, force || null, sheetName)); },
      // redraw one frame's head from the helmet templates; `force` picks the view (head-turn frames use the 3/4 views)
      helmetStamp(R, anim, force, sheetName) {
        const fw = ATLAS.frameW, fh = ATLAS.frameH, K = ATLAS.keys, HE = MI.helmet, HS = MI.helmetStripe, HL = MI.helmetLogo, FM = MI.facemask, FD = MI.faceDark, SK = MI.skin;
        const T = this._helmT || (this._helmT = this.helmetTemplates()), LET = { A: HE, B: HS, C: HL, D: FM, Q: FD, O: SK };
        {
          const d = R.px, mat = new Int8Array(fw * fh).fill(-2), lv = new Int8Array(fw * fh);
          for (let i = 0; i < fw * fh; i++) { if (d[i * 4 + 3] !== 255) continue; const id = keyMap.get((d[i * 4] << 16) | (d[i * 4 + 1] << 8) | d[i * 4 + 2]); mat[i] = id === undefined ? -1 : id >> 2; lv[i] = id === undefined ? 0 : id & 3; }
          const at = (x, y) => (x < 0 || y < 0 || x >= fw || y >= fh) ? -3 : mat[y * fw + x];
          const put = (x, y, m, l) => { const c = K[m + ',' + l]; if (!c) return; const i = (y * fw + x) * 4; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; mat[y * fw + x] = m; lv[y * fw + x] = l; if (R.num) R.num[i + 3] = 0; };
          const clear = (x, y) => { const i = (y * fw + x) * 4; d[i + 3] = 0; mat[y * fw + x] = -2; if (R.num) R.num[i + 3] = 0; };
          const isShell = m => m === HE || m === HS || m === HL;
          // the head is the biggest connected blob of shell + mask pixels; stray outline pixels that share a helmet colour stay put
          const lab = new Int16Array(fw * fh), sizes = [0]; let best = 0;
          for (let i = 0; i < fw * fh; i++) { const m0 = mat[i]; if (lab[i] || !(isShell(m0) || m0 === FM)) continue; const id = sizes.length; let cnt = 0; const st = [i]; lab[i] = id;
            while (st.length) { const j = st.pop(); cnt++; const jx = j % fw, jy = (j - jx) / fw;
              for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const X = jx + dx, Y = jy + dy; if (X < 0 || Y < 0 || X >= fw || Y >= fh) continue; const k = Y * fw + X, mk = mat[k]; if (!lab[k] && (isShell(mk) || mk === FM)) { lab[k] = id; st.push(k); } } }
            sizes.push(cnt); if (cnt > sizes[best]) best = id; }
          if (!best) return false;
          // an arm across the face can split the mask off the shell: pull in shell / mask pieces right next to the main blob
          let qx0 = 99, qx1 = -1, qy0 = 99, qy1 = -1;
          for (let i = 0; i < fw * fh; i++) if (lab[i] === best) { const X = i % fw, Y = (i - X) / fw; qx0 = Math.min(qx0, X); qx1 = Math.max(qx1, X); qy0 = Math.min(qy0, Y); qy1 = Math.max(qy1, Y); }
          const near = new Set([best]);
          for (let i = 0; i < fw * fh; i++) { const id = lab[i]; if (!id || near.has(id)) continue; const X = i % fw, Y = (i - X) / fw; if (mat[i] === FM || (X >= qx0 - 4 && X <= qx1 + 4 && Y >= qy0 - 3 && Y <= qy1 + 1)) near.add(id); }
          const inHead = i => near.has(lab[i]);
          let n = 0, sx = 0, sy = 0, x0 = 99, x1 = -1, y0 = 99, y1 = -1, fn = 0, fx = 0, fyS = 0, mx0 = 99, mx1 = -1, my0 = 99, my1 = -1;
          for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) { if (!inHead(y * fw + x)) continue; const m = mat[y * fw + x];
            if (isShell(m)) { n++; sx += x; sy += y; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
            else if (m === FM) { fn++; fx += x; fyS += y; mx0 = Math.min(mx0, x); mx1 = Math.max(mx1, x); my0 = Math.min(my0, y); my1 = Math.max(my1, y); } }
          // looking straight up at the ball the shell can hide behind the arms entirely; the mask alone places the head
          const faceOnly = n < 4 && fn >= 10 && /catch_high|spike|celebrate/.test(anim);
          if (faceOnly) { n = fn; sx = fx; sy = fyS; x0 = mx0; x1 = mx1; y0 = my0; y1 = my1; }
          else if (n < 12 && !(n >= 4 && fn >= 6)) return false;
          const cx = sx / n, cy = sy / n, w = x1 - x0 + 1, h = y1 - y0 + 1;
          const f = faceOnly ? 0 : fn ? (Math.abs(fx / fn - cx) >= 1.5 ? Math.sign(fx / fn - cx) : 0) : 0;
          // only upright heads get the drawn helmet; rolled / lying heads keep the artist's pixels
          const bx0 = Math.min(x0, fn ? mx0 : 99), bx1 = Math.max(x1, fn ? mx1 : -1), cw = bx1 - bx0 + 1, ch = Math.max(y1, fn ? my1 : -1) - y0 + 1;
          const upright = cw >= 9 && cw <= 16 && ch >= 7 && ch <= 12 && w >= 5 && (!fn || fyS / fn > cy - 2.5);
          if (!upright && typeof window !== 'undefined') (window.__helmSkip = window.__helmSkip || {})[sheetName + ':' + anim] = [w, h, fn ? +(fyS / fn - cy).toFixed(1) : null];
          // heads tipped back between raised arms (high catch, spike) read as a face-on helmet looking up
          const lookUp = (faceOnly || !upright) && /catch_high|spike|celebrate/.test(anim);
          if (!force && !upright && !f && !lookUp) return false;
          const view = force ? force : lookUp ? 'front' : !upright ? 'dive' : /(^|_)back$|^run_back|^stand_back|coach_back/.test(anim) ? 'back' : /(^|_)front$|^run_front|^stand_front/.test(anim) ? 'front' : fn ? (f ? 'side' : 'front') : 'back', V = T[view], G = V.g, gw = G[0].length, gh = G.length;
          const bottom = fn ? Math.max(y1, my1) : y1;
          // side views line up the back of the shell, front / back views the middle of the head
          const vf = view === 'side' || view === 'dive' || view === 'q3' || view === 'q3a' ? (f || 1) : 0, ox = view === 'dive' ? (vf > 0 ? bx1 - (gw - 1) : bx0) : vf > 0 ? bx0 : vf < 0 ? bx1 - (gw - 1) : Math.round((bx0 + bx1) / 2 - V.cx), oy = bottom - V.by;
          // 1) lift the old head off: shell + mask everywhere, face pixels inside the old mask / helmet box
          const fx0 = Math.min(x0, fn ? mx0 : 99), fx1 = Math.max(x1, fn ? mx1 : -1), fy0 = y0, fy1 = bottom;
          for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) { const m = mat[y * fw + x];
            if (inHead(y * fw + x) || m === FM) clear(x, y);
            else if ((m === SK || m === FD) && y >= fy0 && y <= fy1 && x >= fx0 - 1 && x <= fx1 + 1 && y < bottom + (view === 'back' ? 0 : 1)) clear(x, y);
            else if (m === -1 && y >= fy0 && y <= fy1 && x >= fx0 - 1 && x <= fx1 + 1) clear(x, y); }
          // 2) stamp the drawn helmet (mirrored when facing left); never over the body or the ball
          for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) { const t = G[gy][vf < 0 ? gw - 1 - gx : gx]; if (!t || t === '.') continue;
            const X = ox + gx, Y = oy + gy; if (X < 0 || Y < 0 || X >= fw || Y >= fh) continue; const m = mat[Y * fw + X];
            if (!(m === -2 || m === -1 || isShell(m) || m === FM || m === SK || m === FD)) continue;
            put(X, Y, LET[t[0]], +t[1]); }
          return true;
        }
      },
      // the football in a player's hands is redrawn larger (about 8px long instead of 6) with a dark rim, a highlight and white laces,
      // turned to match the artist's ball; arms, hands and skin stay in front of it
      enlargeBall(sheetName, skip) {
        const fw = ATLAS.frameW, fh = ATLAS.frameH, BA = MI.ball, LA = MI.laces, K = ATLAS.keys, keep = new Set([MI.gloves, MI.armSleeve, MI.skin, MI.towel]);
        const P = s => s.trim().split('\n').map(r => r.trim().split(/\s+/));
        const H = P(`
. . R0 R0 R0 R0 . .
. R0 R2 R3 R3 R2 R0 .
R0 R1 R2 S3 S3 R2 R1 R0
. R0 R1 R2 R2 R1 R0 .
. . R0 R0 R0 R0 . .`);
        const D = P(`
. . . . R0 R0 .
. . . R0 R3 R2 R0
. . R0 R2 S3 R2 R0
. R0 R2 S3 R2 R1 R0
R0 R2 R2 R1 R1 R0 .
R0 R1 R1 R0 R0 . .
. R0 R0 . . . .`);
        const V = H[0].map((_, i) => H.map(r => r[i])), Dm = D.map(r => r.slice().reverse());
        this.editFrames(sheetName, (R, anim) => {
          if (skip && skip.test(anim)) return false;
          const d = R.px, src = d.slice(), mat = i => { if (src[i * 4 + 3] !== 255) return -2; const id = keyMap.get((src[i * 4] << 16) | (src[i * 4 + 1] << 8) | src[i * 4 + 2]); return id === undefined ? -1 : id >> 2; };
          const pts = []; for (let i = 0; i < fw * fh; i++) { const m = mat(i); if (m === BA || m === LA) pts.push([i % fw, Math.floor(i / fw), i]); }
          if (pts.length < 6) return false;
          let cx = 0, cy = 0; for (const [x, y] of pts) { cx += x; cy += y; } cx /= pts.length; cy /= pts.length;
          let sxx = 0, syy = 0, sxy = 0; for (const [x, y] of pts) { sxx += (x - cx) ** 2; syy += (y - cy) ** 2; sxy += (x - cx) * (y - cy); }
          // long axis of the visible ball (screen y points down); a roundish blob (hand over it) stays horizontal
          const ang = 0.5 * Math.atan2(2 * sxy, sxx - syy) * 180 / Math.PI, ecc = Math.hypot(sxx - syy, 2 * sxy) / Math.max(1e-6, sxx + syy);
          const G = ecc < 0.18 ? H : Math.abs(ang) < 22.5 ? H : Math.abs(ang) > 67.5 ? V : ang > 0 ? Dm : D;
          const gw = G[0].length, gh = G.length, ox = Math.round(cx + 0.5 - gw / 2), oy = Math.round(cy + 0.5 - gh / 2), cover = new Set();
          for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) { const t = G[gy][gx]; if (t === '.') continue; const X = ox + gx, Y = oy + gy; if (X < 0 || Y < 0 || X >= fw || Y >= fh) continue;
            const j = Y * fw + X; cover.add(j); if (keep.has(mat(j))) continue; const c = K[(t[0] === 'S' ? LA : BA) + ',' + t[1]]; if (!c) continue;
            d[j * 4] = c[0]; d[j * 4 + 1] = c[1]; d[j * 4 + 2] = c[2]; d[j * 4 + 3] = 255; if (R.num) R.num[j * 4 + 3] = 0; }
          // bits of the old ball outside the new one: drop them at the silhouette, otherwise they become rim
          const c0 = K[BA + ',0'];
          for (const [x, y, i] of pts) { if (cover.has(i)) continue; const open = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => { const X = x + a, Y = y + b; return X < 0 || Y < 0 || X >= fw || Y >= fh || src[(Y * fw + X) * 4 + 3] !== 255; });
            if (open) d[i * 4 + 3] = 0; else { d[i * 4] = c0[0]; d[i * 4 + 1] = c0[1]; d[i * 4 + 2] = c0[2]; } }
          return true;
        });
      },
      matOf(r, g, b) { const id = keyMap.get((r << 16) | (g << 8) | b); return id === undefined ? -1 : id >> 2; },
      matIndex(n) { return MI[n]; },
      // equipment anchor points of one frame (used by the sprite checks)
      eqInfo(sheetName, anim, f) { const a = ATLAS.sheets[sheetName].anims[anim], cols = data[sheetName].px.width / ATLAS.frameW; return eqCell(sheetName, a.row * cols + f); },
      addAnimRaw(sheetName, name, frames, fps, loop) {
        const src = data[sheetName], fw = ATLAS.frameW, fh = ATLAS.frameH, Wd = src.px.width, Hd = src.px.height, rows = Hd / fh;
        const grow = (img, key) => { const o = new ImageData(Wd, Hd + fh); o.data.set(img.data);
          frames.forEach((f, i) => { const d = f[key]; if (!d) return; for (let y = 0; y < fh; y++) o.data.set(d.subarray(y * fw * 4, (y + 1) * fw * 4), ((Hd + y) * Wd + i * fw) * 4); }); return o; };
        src.px = grow(src.px, 'px'); if (src.num) src.num = grow(src.num, 'num'); delete eqMaps[sheetName]; for (const k in legTrackC) if (k.startsWith(sheetName + '|')) delete legTrackC[k];
        ATLAS.sheets[sheetName].anims[name] = { row: rows, frames: frames.length, fps, loop, info: Array.from({ length: frames.length }, () => ({ ball: null })) };
        delete numMaps[sheetName]; delete eqMaps[sheetName]; for (const k in legTrackC) if (k.startsWith(sheetName + '|')) delete legTrackC[k]; cache.clear();
      },
      frameKeyCanvas(sheetName, anim, frame) {
        const src = data[sheetName], a = ATLAS.sheets[sheetName].anims[anim], fw = ATLAS.frameW, fh = ATLAS.frameH;
        const full = document.createElement('canvas'); full.width = src.px.width; full.height = src.px.height; full.getContext('2d').putImageData(src.px, 0, 0);
        const c = document.createElement('canvas'); c.width = fw; c.height = fh; const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
        x.drawImage(full, frame * fw, a.row * fh, fw, fh, 0, 0, fw, fh); return c;
      },
      keyColor(mat, level) { const c = ATLAS.keys[MI[mat] + ',' + level]; return c ? `rgb(${c[0]},${c[1]},${c[2]})` : '#000'; },
      materials: MATS.slice(),
      player(o = {}) {
        const build = o.build || POSITION_BUILD[(o.position || 'RB').toUpperCase()] || 'skill';
        const P = resolvePalette(o.team, o.skin == null ? 3 : o.skin);
        const key = JSON.stringify(['p', build, o.team, o.skin, o.number]);
        return cached(key, () => new Sprite('player_' + build, P, o.number == null ? null : o.number));
      },
      referee(o = {}) {
        const P = resolvePalette(o.colors || {}, o.skin == null ? 2 : o.skin);
        return cached(JSON.stringify(['r', o.skin, o.colors]), () => new Sprite('referee', P, null));
      },
      /** quick team palette from two school colours */
      teamColors(primary, secondary, opt = {}) {
        const pants = opt.pants || '#ebedf0';
        return {
          helmet: opt.helmet || primary, helmetStripe: secondary, helmetLogo: opt.helmetLogo || primary,
          facemask: opt.facemask || '#9aa1aa', jersey: opt.jersey || primary, jerseyTrim: secondary,
          pants, pantsStripe: opt.pantsStripe || primary, belt: opt.belt || '#1d1d22',
          socks: opt.socks || primary, sockStripe: secondary, cleats: opt.cleats || '#25252b',
          cleatAccent: opt.cleatAccent || '#e8e8ea', gloves: opt.gloves || '#e6e7ea',
          number: opt.number || '#f4f4f4', numberTrim: opt.numberTrim || null,
          armSleeve: opt.armSleeve || 'skin',
        };
      },
    };
  }

  const api = { load, ramp };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.GridironSprites = api;
})(typeof window !== 'undefined' ? window : globalThis);
<\/script>
