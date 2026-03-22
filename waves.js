// Simplex 2D noise — adapted from Stefan Gustavson's implementation

const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;

const grad3 = [
  [1,1],[-1,1],[1,-1],[-1,-1],
  [1,0],[-1,0],[0,1],[0,-1],
  [1,1],[-1,1],[1,-1],[-1,-1],
];

function buildPermTable() {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  const perm = new Uint8Array(512);
  const permMod12 = new Uint8Array(512);
  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255];
    permMod12[i] = perm[i] % 12;
  }
  return { perm, permMod12 };
}

function createNoise2D() {
  const { perm, permMod12 } = buildPermTable();

  return function noise2D(xin, yin) {
    let n0, n1, n2;
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const x0 = xin - (i - t);
    const y0 = yin - (j - t);

    let i1, j1;
    if (x0 > y0) { i1 = 1; j1 = 0; }
    else { i1 = 0; j1 = 1; }

    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;

    const ii = i & 255;
    const jj = j & 255;

    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 < 0) n0 = 0;
    else {
      t0 *= t0;
      const gi0 = permMod12[ii + perm[jj]];
      n0 = t0 * t0 * (grad3[gi0][0] * x0 + grad3[gi0][1] * y0);
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 < 0) n1 = 0;
    else {
      t1 *= t1;
      const gi1 = permMod12[ii + i1 + perm[jj + j1]];
      n1 = t1 * t1 * (grad3[gi1][0] * x1 + grad3[gi1][1] * y1);
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 < 0) n2 = 0;
    else {
      t2 *= t2;
      const gi2 = permMod12[ii + 1 + perm[jj + 1]];
      n2 = t2 * t2 * (grad3[gi2][0] * x2 + grad3[gi2][1] * y2);
    }

    return 70 * (n0 + n1 + n2);
  };
}

// --- Waves rendered to canvas, shown through clock text ---

(function () {
  const container = document.getElementById('waves-bg');
  const clockEl = document.getElementById('clock');
  if (!container || !clockEl) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.style.display = 'none';
  container.appendChild(canvas);

  const noise = createNoise2D();
  const X_GAP = 8;
  const Y_GAP = 8;
  let vLines = [];
  let hLines = [];
  let cW = 0;
  let cH = 0;
  let waveMode = localStorage.getItem('newtab_wave_mode') || 'vertical';

  window.setWaveMode = function (mode) {
    waveMode = mode;
  };
  let dpr = window.devicePixelRatio || 1;

  const mouse = {
    x: -10, y: 0,
    lx: 0, ly: 0,
    sx: 0, sy: 0,
    v: 0, vs: 0, a: 0,
    set: false,
  };

  function setSize() {
    // size canvas to full viewport for the wave field
    cW = window.innerWidth;
    cH = window.innerHeight;
    canvas.width = cW * dpr;
    canvas.height = cH * dpr;
    ctx.scale(dpr, dpr);
  }

  function setLines() {
    vLines = [];
    hLines = [];
    const pad = 100;

    // vertical lines (points stacked top to bottom)
    const totalVLines = Math.ceil((cW + pad * 2) / X_GAP);
    const totalVPoints = Math.ceil((cH + pad * 2) / Y_GAP);

    for (let i = 0; i < totalVLines; i++) {
      const points = [];
      for (let j = 0; j < totalVPoints; j++) {
        points.push({
          x: -pad + X_GAP * i,
          y: -pad + Y_GAP * j,
          wave: { x: 0, y: 0 },
          cursor: { x: 0, y: 0, vx: 0, vy: 0 },
        });
      }
      vLines.push(points);
    }

    // horizontal lines (points laid out left to right)
    const totalHLines = Math.ceil((cH + pad * 2) / Y_GAP);
    const totalHPoints = Math.ceil((cW + pad * 2) / X_GAP);

    for (let i = 0; i < totalHLines; i++) {
      const points = [];
      for (let j = 0; j < totalHPoints; j++) {
        points.push({
          x: -pad + X_GAP * j,
          y: -pad + Y_GAP * i,
          wave: { x: 0, y: 0 },
          cursor: { x: 0, y: 0, vx: 0, vy: 0 },
        });
      }
      hLines.push(points);
    }
  }

  function moveAllPoints(allLines, time) {
    for (let i = 0; i < allLines.length; i++) {
      const points = allLines[i];
      for (let j = 0; j < points.length; j++) {
        const p = points[j];

        const move = noise(
          (p.x + time * 0.008) * 0.003,
          (p.y + time * 0.003) * 0.002
        ) * 8;

        p.wave.x = Math.cos(move) * 12;
        p.wave.y = Math.sin(move) * 6;

        const dx = p.x - mouse.sx;
        const dy = p.y - mouse.sy;
        const d = Math.hypot(dx, dy);
        const l = Math.max(175, mouse.vs);

        if (d < l) {
          const s = 1 - d / l;
          const f = Math.cos(d * 0.001) * s;
          p.cursor.vx += Math.cos(mouse.a) * f * l * mouse.vs * 0.00035;
          p.cursor.vy += Math.sin(mouse.a) * f * l * mouse.vs * 0.00035;
        }

        p.cursor.vx += -p.cursor.x * 0.01;
        p.cursor.vy += -p.cursor.y * 0.01;
        p.cursor.vx *= 0.95;
        p.cursor.vy *= 0.95;
        p.cursor.x += p.cursor.vx;
        p.cursor.y += p.cursor.vy;
        p.cursor.x = Math.min(50, Math.max(-50, p.cursor.x));
        p.cursor.y = Math.min(50, Math.max(-50, p.cursor.y));
      }
    }
  }

  function drawLinesToCanvas(allLines) {
    for (let i = 0; i < allLines.length; i++) {
      const points = allLines[i];
      if (points.length < 2) continue;

      ctx.beginPath();
      const f = points[0];
      ctx.moveTo(f.x + f.wave.x, f.y + f.wave.y);

      for (let j = 1; j < points.length; j++) {
        const p = points[j];
        ctx.lineTo(
          p.x + p.wave.x + p.cursor.x,
          p.y + p.wave.y + p.cursor.y
        );
      }
      ctx.stroke();
    }
  }

  function drawToCanvas() {
    ctx.clearRect(0, 0, cW, cH);
    if (waveMode === 'none') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
      ctx.fillRect(0, 0, cW, cH);
      return;
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1;
    drawLinesToCanvas(vLines);
    if (waveMode === 'grid') drawLinesToCanvas(hLines);
  }

  function applyToBackground() {
    const dataUrl = canvas.toDataURL();
    clockEl.style.backgroundImage = 'url(' + dataUrl + ')';
    clockEl.style.backgroundSize = cW + 'px ' + cH + 'px';

    const rect = clockEl.getBoundingClientRect();
    clockEl.style.backgroundPosition = (-rect.left) + 'px ' + (-rect.top) + 'px';
  }

  function tick(time) {
    mouse.sx += (mouse.x - mouse.sx) * 0.1;
    mouse.sy += (mouse.y - mouse.sy) * 0.1;

    const dx = mouse.x - mouse.lx;
    const dy = mouse.y - mouse.ly;

    mouse.v = Math.hypot(dx, dy);
    mouse.vs += (mouse.v - mouse.vs) * 0.1;
    mouse.vs = Math.min(100, mouse.vs);

    mouse.lx = mouse.x;
    mouse.ly = mouse.y;
    mouse.a = Math.atan2(dy, dx);

    moveAllPoints(vLines, time);
    if (waveMode === 'grid') moveAllPoints(hLines, time);
    drawToCanvas();
    applyToBackground();

    requestAnimationFrame(tick);
  }

  setSize();
  setLines();

  window.addEventListener('resize', () => {
    dpr = window.devicePixelRatio || 1;
    setSize();
    setLines();
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.pageX;
    mouse.y = e.pageY;
    if (!mouse.set) {
      mouse.sx = mouse.x;
      mouse.sy = mouse.y;
      mouse.lx = mouse.x;
      mouse.ly = mouse.y;
      mouse.set = true;
    }
  });

  requestAnimationFrame(tick);
})();
