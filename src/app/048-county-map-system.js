// ═══════════ COUNTY MAP SYSTEM ═══════════
// 60 fictional counties in a grid-like arrangement across the state of Crestfield
// Each county has a name and a set of polygon points within the 560×420 SVG viewBox
// ── CRESTFIELD STATE MAP ──
// 60 counties defined as irregular polygons clipped inside a US-state-shaped outline.
// The state has a distinctive non-rectangular silhouette (inspired by a composite of
// real US state shapes). Counties are generated via a seeded Voronoi-like subdivision
// clipped to the state boundary.

const STATE_PATH = "M 64,44 L 214,44 L 214,38 L 402,38 L 404.2,37.2 L 406.5,37.7 L 409.0,38.3 L 411.0,36.8 L 413.5,36.6 L 415.9,35.5 L 417.6,37.4 L 419.7,39.0 L 422.5,39.2 L 424.5,37.4 L 427.2,37.9 L 429.0,39.8 L 431.8,39.7 L 433.2,42.1 L 435.5,43.4 L 436,46 L 438.6,45.2 L 441.3,45.8 L 442.6,48.5 L 445.6,48.9 L 446.7,51.3 L 448.8,53.0 L 451.2,54.0 L 453.7,54.9 L 454.9,57.5 L 457.4,59.0 L 460.1,58.1 L 462.9,58.9 L 465.0,60.7 L 467.7,61.2 L 469.7,63.2 L 470,66 L 471.8,67.2 L 473.9,67.6 L 475.5,69.0 L 476.7,70.7 L 478.9,72.0 L 478.8,74.5 L 478.1,76.6 L 478.3,78.8 L 478.9,81.4 L 481.3,82.2 L 479.5,84.1 L 480.1,86.6 L 482.1,87.6 L 482.7,89.7 L 483.9,91.5 L 486,92 L 487.4,93.9 L 489.2,95.5 L 487.0,97.2 L 487.4,99.9 L 489.4,100.8 L 490.6,102.8 L 492.7,102.3 L 494.8,103.0 L 497.5,102.8 L 498.6,105.2 L 500.9,104.8 L 502.4,103.0 L 504.1,104.0 L 505.8,104.7 L 508.2,105.6 L 508,108 L 508.9,109.4 L 508.2,110.8 L 508.1,112.5 L 509.5,113.4 L 508.3,114.7 L 508.4,116.4 L 509.9,117.2 L 510.4,118.9 L 509.8,120.4 L 508.5,121.5 L 508.2,123.1 L 507.3,124.4 L 506.3,126.0 L 507.2,127.8 L 508.9,128.4 L 509.7,130.1 L 509.3,131.6 L 509.2,133.1 L 509.5,134.6 L 510.2,136.0 L 509.1,137.1 L 508.5,138.5 L 507.5,139.7 L 507.2,141.2 L 505.5,141.7 L 505.2,143.4 L 505.7,145.1 L 504.3,146.2 L 503.9,147.8 L 503.2,149.3 L 501.4,148.7 L 500,150 L 501.3,151.0 L 502.5,152.1 L 503.6,153.4 L 504.0,155.0 L 505.5,155.6 L 506.9,156.5 L 507.9,157.9 L 508.6,159.4 L 509.3,161.0 L 510.6,162.1 L 510.7,163.8 L 511.0,165.5 L 512.5,166.9 L 512.0,168.8 L 512.0,170.8 L 510.4,172.0 L 511.9,172.9 L 513.5,173.8 L 513.0,175.7 L 514.1,177.3 L 514.1,179.0 L 514.5,180.7 L 515.8,181.8 L 516.5,183.3 L 514.8,184.2 L 514.5,186.2 L 514.5,188.1 L 515.4,189.7 L 515.4,191.3 L 515.2,193.0 L 514.0,194.2 L 514,196 L 513.1,197.1 L 511.9,197.5 L 510.4,197.9 L 509.8,199.2 L 510.3,200.7 L 509.1,201.8 L 509.6,203.4 L 508.2,204.3 L 507.2,205.5 L 507.5,207.0 L 506.8,208.3 L 507.1,209.8 L 505.5,210.2 L 503.9,209.6 L 503.0,210.9 L 502.0,212.2 L 503.1,213.2 L 503.9,214.5 L 502.9,215.7 L 503.3,217.3 L 502.8,218.9 L 504.1,220.0 L 504.7,221.4 L 506.3,221.7 L 506.7,222.9 L 507.1,224.2 L 508.4,225.3 L 507.7,226.9 L 507.2,228.3 L 506.1,229.2 L 505.9,230.6 L 506,232 L 507.3,232.6 L 508.0,233.7 L 509.4,233.9 L 510.2,235.2 L 510.6,236.5 L 511.2,237.8 L 511.7,239.4 L 510.4,240.4 L 511.6,240.9 L 512.9,240.6 L 514.5,240.7 L 514.8,242.3 L 516.1,243.0 L 517.4,242.3 L 517.6,243.8 L 519.1,244.3 L 518.6,245.5 L 517.9,246.5 L 518.0,247.9 L 517.0,248.9 L 516.8,250.3 L 515.8,251.3 L 515.8,252.6 L 515.9,253.9 L 517.1,255.2 L 518.7,254.7 L 520.1,255.3 L 521.3,256.1 L 521.7,257.6 L 521.7,259.1 L 521.2,260.6 L 522,262 L 523.1,265.1 L 520.9,267.6 L 518.7,269.6 L 515.8,270.4 L 513.1,269.8 L 510.4,269.4 L 508.0,270.9 L 505.6,272.2 L 503.6,274.6 L 500.6,273.8 L 500.7,276.8 L 498.2,278.6 L 496.9,280.9 L 496.6,283.5 L 494.8,285.7 L 492,286 L 491.2,283.7 L 488.8,283.8 L 486.7,283.4 L 485.1,284.9 L 484.4,287.2 L 482.4,288.4 L 481.0,285.9 L 478.4,286.8 L 478.4,284.7 L 476.7,283.5 L 475.5,281.7 L 476.3,279.7 L 474.6,278.3 L 474.2,276.1 L 472.1,277.0 L 470,276 L 471.6,278.0 L 473.5,279.9 L 473.1,282.6 L 471.4,284.7 L 470.8,287.1 L 470.1,289.4 L 467.7,290.1 L 465.9,291.6 L 463.1,291.6 L 462.4,294.3 L 460.1,295.7 L 460.4,298.3 L 458.4,296.3 L 455.7,296.7 L 453.7,298.1 L 452,300 L 453.2,302.3 L 455.8,301.8 L 455.6,304.1 L 457.1,305.8 L 457.7,307.6 L 458.6,309.4 L 460.3,310.5 L 461.6,312.0 L 461.9,315.0 L 459.1,316.2 L 461.4,317.9 L 461.2,320.6 L 463.5,321.1 L 465.4,322.4 L 467.0,323.9 L 468,326 L 466.5,328.2 L 467.0,330.9 L 465.4,333.3 L 462.5,333.2 L 460.1,332.5 L 457.8,331.6 L 456.0,333.5 L 453.5,334.2 L 451.2,335.1 L 448.9,334.2 L 448.2,337.0 L 445.3,337.1 L 446.5,339.8 L 444.7,342.2 L 442.4,343.2 L 440,344 L 437.2,343.8 L 434.5,344.7 L 433.7,341.5 L 430.5,341.0 L 428.1,339.7 L 425.5,339.7 L 423.6,342.2 L 420.5,341.4 L 418.1,343.2 L 415.1,343.5 L 415.9,346.6 L 413.9,349.2 L 411.2,350.1 L 408.5,349.1 L 405.3,349.0 L 404,352 L 403.8,354.6 L 404.1,357.2 L 401.7,358.3 L 400.0,360.4 L 397.8,361.0 L 395.5,361.4 L 393.1,361.3 L 390.8,361.7 L 388.5,362.6 L 388.0,364.9 L 386.5,366.8 L 384.1,366.7 L 383.7,368.9 L 382.2,370.5 L 380.1,371.6 L 380,374 L 377.2,374.4 L 376.2,377.1 L 374.0,375.8 L 371.4,376.4 L 370.1,374.0 L 367.5,373.4 L 364.7,372.3 L 362.7,374.5 L 360.4,375.0 L 358.2,375.8 L 355.5,375.8 L 354.0,373.7 L 351.5,375.4 L 349.2,373.5 L 348.1,371.3 L 346,370 L 344.2,371.4 L 342.9,373.3 L 342.0,375.4 L 340.1,376.7 L 337.9,375.7 L 335.4,375.5 L 333.9,377.8 L 331.2,377.8 L 329.1,378.8 L 326.7,378.4 L 325.1,380.0 L 323.8,381.8 L 321.3,382.7 L 321.3,385.3 L 319.4,386.4 L 318,388 L 316.0,387.4 L 314.8,385.8 L 312.9,385.1 L 310.9,385.7 L 310.3,383.7 L 308.4,382.9 L 307.7,381.2 L 306.8,379.5 L 305.8,377.7 L 303.8,377.0 L 301.9,377.0 L 300.0,376.6 L 298.4,375.5 L 297.7,373.6 L 297.6,371.6 L 296.2,370.3 L 294.5,369.5 L 292.6,369.1 L 290.9,368.3 L 289.6,366.9 L 287.6,366.9 L 285.8,366.2 L 284.3,367.6 L 282.2,367.4 L 280.3,366.7 L 279.1,365.2 L 277.2,364.6 L 275.3,365.1 L 274.1,363.6 L 273.1,362.0 L 271.9,360.4 L 270,360 L 268.4,359.7 L 267.0,358.9 L 266.1,357.4 L 264.4,356.9 L 262.7,356.4 L 261.2,357.3 L 259.7,358.0 L 258.2,358.4 L 257.3,356.9 L 255.6,356.6 L 254.3,355.5 L 254.2,353.8 L 252.5,353.9 L 251.5,352.5 L 250.1,351.8 L 249.0,350.8 L 247.6,350.0 L 246.1,350.3 L 244.7,349.9 L 243.3,349.7 L 242.1,348.5 L 240.5,348.8 L 239.0,348.0 L 237.5,348.9 L 236.4,350.0 L 234.9,350.5 L 233.5,351.4 L 232.0,351.9 L 230.6,350.9 L 228.9,351.3 L 227.2,351.2 L 226,350 L 224.1,350.2 L 222.5,349.1 L 220.8,348.5 L 219.1,348.0 L 217.7,346.9 L 216.6,345.5 L 214.8,344.7 L 214.0,342.9 L 213.1,341.2 L 211.3,340.7 L 209.5,340.1 L 208.5,338.5 L 207.0,337.1 L 205.1,337.3 L 203.2,337.9 L 201.5,336.8 L 200.5,335.2 L 200.4,333.2 L 199.2,331.6 L 197.5,330.8 L 195.8,330.0 L 194.3,328.8 L 192.7,327.8 L 190.8,327.8 L 189.1,326.9 L 188.2,325.2 L 186.5,324.6 L 184.9,323.7 L 183.1,323.4 L 181.6,322.4 L 179.8,321.9 L 178,322 L 176.8,323.3 L 175.0,323.2 L 173.5,322.8 L 171.9,322.7 L 170.4,322.4 L 169.0,321.7 L 167.4,321.4 L 166.2,320.4 L 164.9,319.2 L 164.5,317.6 L 162.9,317.4 L 161.4,316.5 L 159.9,316.8 L 158.3,316.9 L 157.1,315.5 L 155.4,315.4 L 154.1,314.5 L 152.4,314.3 L 150.8,313.8 L 149.3,314.8 L 148.5,316.4 L 146.8,316.6 L 145.3,317.0 L 143.8,317.4 L 142.3,317.8 L 140.8,318.5 L 139.2,318.9 L 138.0,319.9 L 136.3,319.8 L 135.2,318.4 L 133.5,319.0 L 132,318 L 130.6,318.6 L 129.2,318.8 L 127.7,318.6 L 126.3,317.9 L 124.7,317.7 L 123.4,318.7 L 122.4,317.3 L 120.7,317.4 L 119.6,316.4 L 118.2,316.0 L 116.7,316.0 L 115.6,314.9 L 114.1,314.9 L 112.7,314.5 L 111.2,314.5 L 110.1,313.4 L 110.1,311.8 L 110.7,310.2 L 110.3,308.5 L 108.7,307.6 L 107.3,306.9 L 106.6,305.4 L 106.2,304.0 L 105.8,302.5 L 104.2,302.2 L 102.6,302.4 L 101.3,301.5 L 99.7,301.1 L 97.9,300.6 L 97.2,299.0 L 96.0,297.7 L 96,296 L 64,296 Z";

// Parse the state path into an array of [x,y] points
function parseStatePath(d) {
  const pts = [];
  const re = /[ML]\s*([\d.]+),([\d.]+)/g;
  let m;
  while ((m = re.exec(d)) !== null) pts.push([parseFloat(m[1]), parseFloat(m[2])]);
  return pts;
}

// Point-in-polygon (ray casting)
function pointInPoly(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}

// Clip a polygon to the state boundary using Sutherland-Hodgman
function clipPolyToState(subjectPoly, clipPoly) {
  if (!subjectPoly.length) return [];
  let output = [...subjectPoly];
  for (let i = 0; i < clipPoly.length; i++) {
    if (!output.length) return [];
    const input = output;
    output = [];
    const edgeA = clipPoly[i];
    const edgeB = clipPoly[(i + 1) % clipPoly.length];
    const inside = (p) => {
      return (edgeB[0] - edgeA[0]) * (p[1] - edgeA[1]) - (edgeB[1] - edgeA[1]) * (p[0] - edgeA[0]) >= 0;
    };
    const intersect = (a, b) => {
      const dx1 = b[0] - a[0], dy1 = b[1] - a[1];
      const dx2 = edgeB[0] - edgeA[0], dy2 = edgeB[1] - edgeA[1];
      const denom = dx1 * dy2 - dy1 * dx2;
      if (Math.abs(denom) < 1e-10) return a;
      const t = ((edgeA[0] - a[0]) * dy2 - (edgeA[1] - a[1]) * dx2) / denom;
      return [a[0] + t * dx1, a[1] + t * dy1];
    };
    for (let j = 0; j < input.length; j++) {
      const cur = input[j];
      const prev = input[(j + input.length - 1) % input.length];
      if (inside(cur)) {
        if (!inside(prev)) output.push(intersect(prev, cur));
        output.push(cur);
      } else if (inside(prev)) {
        output.push(intersect(prev, cur));
      }
    }
  }
  return output;
}

const _STATE_POLY = parseStatePath(STATE_PATH);

// Generate 60 Voronoi-like seed points inside the state
function genSeedPoints(n, statePoly) {
  const seeds = [];
  // Bounding box of state
  const xs = statePoly.map(p => p[0]), ys = statePoly.map(p => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  // Use a deterministic pseudo-random approach
  const r = (i, s) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
  let attempt = 0;
  while (seeds.length < n && attempt < n * 40) {
    const x = minX + r(attempt, 1) * (maxX - minX);
    const y = minY + r(attempt, 2) * (maxY - minY);
    if (pointInPoly(x, y, statePoly)) seeds.push([x, y]);
    attempt++;
  }
  // Fallback: if not enough, add centroid-ish points
  while (seeds.length < n) {
    const cx = (minX + maxX) / 2 + (seeds.length * 7.3 % 30) - 15;
    const cy = (minY + maxY) / 2 + (seeds.length * 11.7 % 40) - 20;
    seeds.push([cx, cy]);
  }
  return seeds;
}

// Build Voronoi regions clipped to state using a simple rasterized approach
// For each seed, compute its clipped polygon region
function buildVoronoiCounties(seeds, statePoly, viewW, viewH) {
  // For each seed, we'll define its Voronoi cell by building a bounding polygon
  // from the perpendicular bisectors with all other seeds, then clip to state.
  // Simplified: use a large bounding box polygon, intersect half-planes for each neighbor.
  const BIG = 1200;
  const regions = seeds.map((seed, i) => {
    // Start with a big rectangle
    let poly = [[-BIG, -BIG], [BIG, -BIG], [BIG, BIG], [-BIG, BIG]];
    // Clip against half-plane for each other seed
    for (let j = 0; j < seeds.length; j++) {
      if (i === j || !poly.length) continue;
      const ox = seeds[j][0], oy = seeds[j][1];
      const mx = (seed[0] + ox) / 2, my = (seed[1] + oy) / 2;
      const dx = ox - seed[0], dy = oy - seed[1];
      // Keep points on seed's side: dot(p - mid, d) <= 0
      const newPoly = [];
      for (let k = 0; k < poly.length; k++) {
        const cur = poly[k];
        const prev = poly[(k + poly.length - 1) % poly.length];
        const dCur = (cur[0] - mx) * dx + (cur[1] - my) * dy;
        const dPrev = (prev[0] - mx) * dx + (prev[1] - my) * dy;
        if (dCur <= 0) {
          if (dPrev > 0) {
            // intersection
            const t = dPrev / (dPrev - dCur);
            newPoly.push([prev[0] + t * (cur[0] - prev[0]), prev[1] + t * (cur[1] - prev[1])]);
          }
          newPoly.push(cur);
        } else if (dPrev <= 0) {
          const t = dPrev / (dPrev - dCur);
          newPoly.push([prev[0] + t * (cur[0] - prev[0]), prev[1] + t * (cur[1] - prev[1])]);
        }
      }
      poly = newPoly;
    }
    // Clip to state boundary
    poly = clipPolyToState(poly, statePoly);
    const cx = poly.length ? poly.reduce((s, p) => s + p[0], 0) / poly.length : seed[0];
    const cy = poly.length ? poly.reduce((s, p) => s + p[1], 0) / poly.length : seed[1];
    return { pts: poly, cx, cy };
  });
  return regions;
}


function _gridSeeds(n,poly){
  const xs=poly.map(p=>p[0]),ys=poly.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
  const jit=(i,s)=>{const v=Math.sin(i*127.1+s*311.7)*43758.5453;return v-Math.floor(v);};
  const gen=sp=>{const out=[];let i=0;for(let y=y0+sp/2;y<y1;y+=sp)for(let x=x0+sp/2;x<x1;x+=sp){i++;const px=x+(jit(i,1)-.5)*sp*.32,py=y+(jit(i,2)-.5)*sp*.32;if(pointInPoly(px,py,poly))out.push([px,py]);}return out;};
  let lo=10,hi=120,best=null;for(let k=0;k<40;k++){const m=(lo+hi)/2,s=gen(m);if(s.length>=n){best=s;lo=m;}else hi=m;}
  if(!best)return genSeedPoints(n,poly);
  if(best.length>n){const cx=(x0+x1)/2,cy=(y0+y1)/2;best.sort((a,b)=>Math.hypot(a[0]-cx,a[1]-cy)-Math.hypot(b[0]-cx,b[1]-cy));best=best.slice(0,n);best.sort((a,b)=>a[1]-b[1]||a[0]-b[0]);}
  return best;
}
function _cellsInState(seeds,poly){
  return seeds.map((seed,i)=>{
    let pg=poly.map(p=>[p[0],p[1]]);
    for(let j=0;j<seeds.length&&pg.length;j++){if(i===j)continue;
      const ox=seeds[j][0],oy=seeds[j][1],mx=(seed[0]+ox)/2,my=(seed[1]+oy)/2,dx=ox-seed[0],dy=oy-seed[1],np=[];
      for(let k=0;k<pg.length;k++){const cur=pg[k],prev=pg[(k+pg.length-1)%pg.length],dc=(cur[0]-mx)*dx+(cur[1]-my)*dy,dp=(prev[0]-mx)*dx+(prev[1]-my)*dy;
        if(dc<=0){if(dp>0){const t=dp/(dp-dc);np.push([prev[0]+t*(cur[0]-prev[0]),prev[1]+t*(cur[1]-prev[1])]);}np.push(cur);}
        else if(dp<=0){const t=dp/(dp-dc);np.push([prev[0]+t*(cur[0]-prev[0]),prev[1]+t*(cur[1]-prev[1])]);}}
      pg=np;}
    let A=0,cx=0,cy=0;for(let k=0;k<pg.length;k++){const a=pg[k],b=pg[(k+1)%pg.length],cr=a[0]*b[1]-b[0]*a[1];A+=cr;cx+=(a[0]+b[0])*cr;cy+=(a[1]+b[1])*cr;}
    if(Math.abs(A)>1e-6){cx/=3*A;cy/=3*A;}else{cx=seed[0];cy=seed[1];}
    if(!pointInPoly(cx,cy,poly)){cx=seed[0];cy=seed[1];}
    return{pts:pg,cx,cy};
  });
}

const COUNTIES = (function () {
  const COUNTY_NAMES = [
    'Ashwood','Baxter','Caldwell','Denton','Elmore','Fairmont','Granville','Harmon','Ivywood','Jasper',
    'Kendall','Laurel','Millbrook','Norwood','Oakdale','Pinecrest','Quinton','Ravenwood','Sutter','Talbot',
    'Ulmer','Vernon','Westgate','Exeter','Yarmouth','Zenith','Alton','Brecken','Clover','Dunmore',
    'Elmdale','Foxwood','Gilmore','Harwick','Inglewood','Jameson','Kirkland','Linwood','Moorefield','Newburgh',
    'Orchard','Parkside','Quincyfield','Ridgeway','Stanton','Thomaston','Uniondale','Vicksburg','Weston','Crossroads',
    'Bayfield','Crestwood','Dover','Elsworth','Forrest','Glenmore','Hartwell','Irondale','Jonesboro','Kentwood'
  ];
  const seeds = _gridSeeds(60, _STATE_POLY);
  const regions = _cellsInState(seeds, _STATE_POLY);
  return regions.map((reg, i) => ({
    id: i,
    name: COUNTY_NAMES[i] || `County ${i + 1}`,
    pts: reg.pts,
    ptsStr: reg.pts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' '),
    cx: reg.cx,
    cy: reg.cy,
    teams: [],
    offers: []
  }));
})();

