/**
 * Animated backgrounds for the bold look.
 *
 * Two layers: a low-resolution colour field (always), and a full-resolution
 * scene chosen per business. Scenes are small particle/line systems drawn
 * with additive blending so they glow against the dark page. Budget: ~30 fps,
 * fewer elements on phones, paused when the tab is hidden, one static frame
 * when the OS asks for reduced motion.
 */

export type SceneName = 'aurora' | 'trails' | 'stripes' | 'waves' | 'circuit' | 'rain' | 'airflow';

type Palette = { h: number; s: number; accent: string; hsla: (h: number, s: number, l: number, a: number) => string };
type Scene = { init(w: number, h: number): void; draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, dt: number): void };

function hexToHsl(hex: string): [number, number, number] {
  const m = hex.replace('#', '');
  const n = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  const r = parseInt(n.slice(0, 2), 16) / 255, g = parseInt(n.slice(2, 4), 16) / 255, b = parseInt(n.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
  }
  return [h, s * 100, l * 100];
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/* ── the colour field: large soft blobs drifting ──────────────────── */
function aurora(p: Palette, mobile: boolean, voidColor: string): Scene {
  const blobs = [
    { hue: p.h, sat: p.s, lum: 52, alpha: 0.55, r: 0.55, sx: 0.00011, sy: 0.00009, px: 0.0, py: 1.2, ox: 0.25, oy: 0.30 },
    { hue: p.h - 150, sat: Math.min(p.s, 70), lum: 45, alpha: 0.42, r: 0.60, sx: 0.00008, sy: 0.00012, px: 2.1, py: 0.4, ox: 0.75, oy: 0.65 },
    { hue: p.h + 40, sat: p.s, lum: 55, alpha: 0.30, r: 0.45, sx: 0.00013, sy: 0.00007, px: 4.0, py: 2.6, ox: 0.60, oy: 0.15 },
    { hue: p.h - 190, sat: 60, lum: 40, alpha: 0.28, r: 0.50, sx: 0.00007, sy: 0.00010, px: 1.0, py: 3.3, ox: 0.20, oy: 0.85 },
  ].slice(0, mobile ? 3 : 4);
  return {
    init() {},
    draw(ctx, w, h, t) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = voidColor;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      const base = Math.min(w, h);
      for (const b of blobs) {
        const x = w * (b.ox + 0.22 * Math.sin(t * b.sx + b.px));
        const y = h * (b.oy + 0.22 * Math.cos(t * b.sy + b.py));
        const r = base * b.r * (1 + 0.08 * Math.sin(t * 0.0002 + b.px));
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, p.hsla(b.hue, b.sat, b.lum, b.alpha));
        g.addColorStop(0.55, p.hsla(b.hue, b.sat, b.lum, b.alpha * 0.35));
        g.addColorStop(1, p.hsla(b.hue, b.sat, b.lum, 0));
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
    },
  };
}

/* ── auto: night-road light trails ────────────────────────────────── */
function trails(p: Palette, mobile: boolean): Scene {
  type T = { x: number; y: number; v: number; len: number; wdt: number; a: number; white: boolean };
  let items: T[] = [];
  const count = mobile ? 18 : 40;
  const make = (w: number, h: number, fresh: boolean): T => {
    const white = Math.random() < 0.4;           // oncoming headlights go the other way
    const depth = Math.random();                 // 0 far, 1 near
    const y = h * (0.28 + depth * 0.62);
    const v = (0.25 + depth * 0.9) * (white ? -1 : 1);
    const len = 80 + depth * 320;
    return { x: fresh ? rand(-len, w + len) : (v > 0 ? -len : w + len), y, v, len, wdt: 1 + depth * 2.5, a: 0.25 + depth * 0.5, white };
  };
  return {
    init(w, h) { items = Array.from({ length: count }, () => make(w, h, true)); },
    draw(ctx, w, h, _t, dt) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      for (let i = 0; i < items.length; i++) {
        const s = items[i];
        s.x += s.v * dt;
        if ((s.v > 0 && s.x - s.len > w) || (s.v < 0 && s.x + s.len < 0)) items[i] = make(w, h, false);
        const tail = s.v > 0 ? s.x - s.len : s.x + s.len;
        const g = ctx.createLinearGradient(tail, s.y, s.x, s.y);
        const c = s.white ? (a: number) => `hsla(45, 30%, 92%, ${a})` : (a: number) => p.hsla(p.h, p.s, 60, a);
        g.addColorStop(0, c(0));
        g.addColorStop(1, c(s.a));
        ctx.strokeStyle = g;
        ctx.lineWidth = s.wdt;
        ctx.beginPath(); ctx.moveTo(tail, s.y); ctx.lineTo(s.x, s.y); ctx.stroke();
      }
    },
  };
}

/* ── barber: pole stripes drifting diagonally ─────────────────────── */
function stripes(p: Palette, mobile: boolean): Scene {
  const band = mobile ? 90 : 130;
  return {
    init() {},
    draw(ctx, w, h, t) {
      ctx.globalCompositeOperation = 'lighter';
      const diag = Math.hypot(w, h);
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(-Math.PI / 4);
      const offset = (t * 0.02) % (band * 3);
      for (let x = -diag; x < diag; x += band * 3) {
        const xx = x + offset;
        // one accent band, one pale band, one gap — a pole, slowed right down
        ctx.fillStyle = p.hsla(p.h, p.s, 58, 0.055);
        ctx.fillRect(xx, -diag, band, diag * 2);
        ctx.fillStyle = 'hsla(0, 0%, 100%, 0.022)';
        ctx.fillRect(xx + band * 1.5, -diag, band * 0.7, diag * 2);
      }
      ctx.restore();
    },
  };
}

/* ── salon: flowing strands ───────────────────────────────────────── */
function waves(p: Palette, mobile: boolean): Scene {
  const n = mobile ? 4 : 6;
  const seg = mobile ? 40 : 80;
  return {
    init() {},
    draw(ctx, w, h, t) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      for (let i = 0; i < n; i++) {
        const base = h * (0.25 + (i / n) * 0.55);
        const amp = h * (0.05 + 0.03 * Math.sin(i * 1.7));
        const k = 0.0025 + i * 0.0004;
        const sp = 0.00035 + i * 0.00006;
        for (const pass of [{ wdt: 10, a: 0.05 }, { wdt: 1.6, a: 0.35 }]) {
          ctx.beginPath();
          for (let s = 0; s <= seg; s++) {
            const x = (w * s) / seg;
            const y = base + amp * Math.sin(x * k + t * sp + i * 1.3) + amp * 0.4 * Math.sin(x * k * 2.3 - t * sp * 1.4 + i);
            s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          const g = ctx.createLinearGradient(0, 0, w, 0);
          g.addColorStop(0, p.hsla(p.h, p.s, 65, 0));
          g.addColorStop(0.5, i % 2 ? `hsla(0,0%,100%,${pass.a})` : p.hsla(p.h, p.s, 65, pass.a));
          g.addColorStop(1, p.hsla(p.h + 30, p.s, 65, 0));
          ctx.strokeStyle = g;
          ctx.lineWidth = pass.wdt;
          ctx.stroke();
        }
      }
    },
  };
}

/* ── phone repair: circuit traces with signal pulses ──────────────── */
function circuit(p: Palette, mobile: boolean): Scene {
  type Pt = [number, number];
  let traces: Pt[][] = [];
  let pulses: { tr: number; pos: number; v: number }[] = [];
  const cell = mobile ? 48 : 60;
  return {
    init(w, h) {
      const cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
      const n = mobile ? 22 : 44;
      traces = Array.from({ length: n }, () => {
        let x = Math.floor(rand(0, cols)), y = Math.floor(rand(0, rows));
        const pts: Pt[] = [[x, y]];
        const steps = 3 + Math.floor(rand(0, 5));
        let horizontal = Math.random() < 0.5;
        for (let i = 0; i < steps; i++) {
          const d = Math.floor(rand(1, 5)) * (Math.random() < 0.5 ? 1 : -1);
          if (horizontal) x = Math.max(0, Math.min(cols, x + d)); else y = Math.max(0, Math.min(rows, y + d));
          pts.push([x, y]);
          horizontal = !horizontal;
        }
        return pts.map(([a, b]) => [a * cell, b * cell] as Pt);
      });
      pulses = Array.from({ length: mobile ? 10 : 22 }, () => ({ tr: Math.floor(rand(0, n)), pos: Math.random(), v: rand(0.00008, 0.0002) }));
    },
    draw(ctx, w, h, _t, dt) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'hsla(0,0%,100%,0.10)';
      ctx.fillStyle = 'hsla(0,0%,100%,0.16)';
      for (const tr of traces) {
        ctx.beginPath();
        tr.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.stroke();
        for (const [x, y] of tr) ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
      }
      for (const pu of pulses) {
        pu.pos += pu.v * dt;
        if (pu.pos > 1) { pu.pos = 0; pu.tr = Math.floor(rand(0, traces.length)); }
        const tr = traces[pu.tr];
        // locate the point at `pos` along the polyline
        let total = 0; const lens: number[] = [];
        for (let i = 1; i < tr.length; i++) { const l = Math.hypot(tr[i][0] - tr[i - 1][0], tr[i][1] - tr[i - 1][1]); lens.push(l); total += l; }
        let d = pu.pos * total, x = tr[0][0], y = tr[0][1];
        for (let i = 0; i < lens.length; i++) {
          if (d <= lens[i]) { const f = lens[i] ? d / lens[i] : 0; x = tr[i][0] + (tr[i + 1][0] - tr[i][0]) * f; y = tr[i][1] + (tr[i + 1][1] - tr[i][1]) * f; break; }
          d -= lens[i];
        }
        const g = ctx.createRadialGradient(x, y, 0, x, y, 14);
        g.addColorStop(0, p.hsla(p.h, p.s, 70, 0.9));
        g.addColorStop(1, p.hsla(p.h, p.s, 70, 0));
        ctx.fillStyle = g;
        ctx.fillRect(x - 14, y - 14, 28, 28);
      }
    },
  };
}

/* ── roofer: rain, with the odd flash ─────────────────────────────── */
function rain(p: Palette, mobile: boolean): Scene {
  type D = { x: number; y: number; v: number; len: number; a: number };
  let drops: D[] = [];
  let nextFlash = 5000, flash = 0;
  const count = mobile ? 70 : 160;
  const slant = 0.22;
  return {
    init(w, h) {
      drops = Array.from({ length: count }, () => ({ x: rand(-h * slant, w), y: rand(-h, h), v: rand(0.5, 1.2), len: rand(14, 36), a: rand(0.12, 0.42) }));
    },
    draw(ctx, w, h, t, dt) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      ctx.lineWidth = 1.2;
      for (const d of drops) {
        d.y += d.v * dt; d.x += d.v * dt * slant;
        if (d.y > h + d.len) { d.y = -d.len; d.x = rand(-h * slant, w); }
        ctx.strokeStyle = `hsla(205, 40%, 85%, ${d.a})`;
        ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - d.len * slant, d.y - d.len); ctx.stroke();
      }
      // a soft flash every so often, fading over ~400 ms
      if (t > nextFlash) { flash = 1; nextFlash = t + rand(7000, 14000); }
      if (flash > 0) {
        ctx.fillStyle = `hsla(210, 60%, 90%, ${0.12 * flash})`;
        ctx.fillRect(0, 0, w, h);
        flash = Math.max(0, flash - dt / 400);
      }
    },
  };
}

/* ── hvac: warm and cool air currents ─────────────────────────────── */
function airflow(p: Palette, mobile: boolean): Scene {
  type A = { x: number; y: number; px: number; py: number; warm: boolean; a: number; tail: number };
  let parts: A[] = [];
  const count = mobile ? 80 : 180;
  return {
    init(w, h) {
      parts = Array.from({ length: count }, () => { const x = rand(0, w), y = rand(0, h); return { x, y, px: x, py: y, warm: y > h / 2, a: rand(0.3, 0.75), tail: rand(6, 14) }; });
    },
    draw(ctx, w, h, t, dt) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      ctx.lineWidth = 1.6;
      for (const q of parts) {
        const k = 0.004;
        const vx = 0.08 + 0.05 * Math.sin(q.y * k + t * 0.0006) + (q.warm ? -0.02 : 0.02);
        const vy = 0.05 * Math.cos(q.x * k * 1.3 + t * 0.0005) + (q.warm ? -0.012 : 0.012);
        q.x += vx * dt; q.y += vy * dt;
        // the streak trails several frames behind, so the current reads as a line, not a dot
        q.px = q.x - vx * dt * q.tail; q.py = q.y - vy * dt * q.tail;
        if (q.x > w + 10) { q.x = -10; q.px = q.x; q.y = rand(0, h); q.py = q.y; q.warm = q.y > h / 2; }
        if (q.y < -10 || q.y > h + 10) { q.y = q.warm ? h - 5 : 5; q.py = q.y; }
        ctx.strokeStyle = q.warm ? `hsla(28, 90%, 62%, ${q.a})` : p.hsla(p.h, p.s, 65, q.a);
        ctx.beginPath(); ctx.moveTo(q.px, q.py); ctx.lineTo(q.x, q.y); ctx.stroke();
      }
    },
  };
}

const factories: Record<Exclude<SceneName, 'aurora'>, (p: Palette, mobile: boolean) => Scene> = {
  trails, stripes, waves, circuit, rain, airflow,
};

export function startAmbient(fieldCanvas: HTMLCanvasElement, sceneCanvas: HTMLCanvasElement | null, sceneName: SceneName) {
  const css = getComputedStyle(document.documentElement);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = matchMedia('(max-width: 767px)').matches;
  const accent = css.getPropertyValue('--color-hivis').trim() || '#f2690a';
  const [h, s] = hexToHsl(accent.startsWith('#') ? accent : '#f2690a');
  const palette: Palette = { h, s, accent, hsla: (hh, ss, ll, a) => `hsla(${(hh + 360) % 360}, ${ss}%, ${ll}%, ${a})` };
  const voidColor = css.getPropertyValue('--color-void').trim() || '#07090d';

  const field = aurora(palette, mobile, voidColor);
  const fctx = fieldCanvas.getContext('2d')!;
  const scene = sceneName !== 'aurora' && sceneCanvas ? factories[sceneName](palette, mobile) : null;
  const sctx = sceneCanvas?.getContext('2d') ?? null;

  let fw = 0, fh = 0, sw = 0, sh = 0;
  function resize() {
    const scale = mobile ? 0.12 : 0.18;                  // the field is soft: tiny canvas, upscaled
    fw = Math.max(64, Math.floor(innerWidth * scale)); fh = Math.max(64, Math.floor(innerHeight * scale));
    fieldCanvas.width = fw; fieldCanvas.height = fh;
    if (sceneCanvas && scene) {
      const dpr = Math.min(devicePixelRatio || 1, mobile ? 1.5 : 1.25); // lines need pixels, but not all of them
      sw = Math.floor(innerWidth * dpr); sh = Math.floor(innerHeight * dpr);
      sceneCanvas.width = sw; sceneCanvas.height = sh;
      scene.init(sw, sh);
    }
  }
  resize();
  let resizeTimer = 0;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = window.setTimeout(resize, 150); }, { passive: true });

  function frame(t: number, dt: number) {
    field.draw(fctx, fw, fh, t, dt);
    if (scene && sctx) {
      sctx.globalCompositeOperation = 'source-over';
      sctx.clearRect(0, 0, sw, sh);
      scene.draw(sctx, sw, sh, t, dt);
    }
  }

  if (reduced) { frame(1200, 16); return; }
  let last = 0, running = true;
  const fps = mobile ? 24 : 30;
  const step = (t: number) => {
    if (!running) return;
    if (t - last >= 1000 / fps) { frame(t, Math.min(t - last, 100)); last = t; }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) { last = performance.now(); requestAnimationFrame(step); }
  });
}
