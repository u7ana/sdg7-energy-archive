// Imperative shelf engine. It runs one requestAnimationFrame loop and writes
// transforms straight to the DOM, so React never re-renders per frame.
// React owns structure and the occasional state change (active film, cursor mode).
import { FILMS, N, TOT, HALF, YMIN, YMAX } from './data.js';

const P_ = 1400;
const mod = (a, n) => ((a % n) + n) % n;
const sm = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
const rel = (v, s) => { const r = (((v - s) % TOT) + TOT) % TOT; return r >= HALF ? r - TOT : r; };
const B = (r) => (Math.abs(r) < 1 ? (r + Math.sin(Math.PI * r) / Math.PI) / 2 : r < 0 ? -0.5 : 0.5);

export const START = 4;

export function createShelf(o) {
  const { shelf, stage, probe, ring, cursor, dot, tl } = o;
  const RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tapes = [...stage.querySelectorAll('.tape')].map((el, v) => ({
    v, el, sp: el.querySelector('.sp'), cv: el.querySelector('.cv'), cvi: el.querySelector('.cvi'),
    lift: 0, hid: false, on: false, sx: 0, sy: 0, hw: 0, hh: 0,
  }));

  let H, ws, dd, gap, U, XS, shelfCY = 0, W = innerWidth;
  const F = (r) => r * (ws + gap) + (dd - ws + 1.4 * gap) * B(r);
  const scl = (u) => 1 / (1 + Math.pow(Math.abs(u) / U, 1.6));
  const xsc = (u) => {
    const a = Math.abs(u) / 2, i = Math.min(XS.length - 2, Math.floor(a)), fr = Math.min(1, a - i);
    const v = XS[i] + (XS[i + 1] - XS[i]) * fr;
    return u < 0 ? -v : v;
  };
  function measure() {
    H = probe.getBoundingClientRect().height || 400;
    ws = (H * 142) / 840; dd = (H * 474) / 900; gap = H * 0.035;
    U = H * (innerWidth < 768 ? 1.05 : 1.3); W = innerWidth;
    XS = [0];
    const n = Math.ceil((3 * U) / 2); let a = 0;
    for (let i = 1; i <= n; i++) { a += 2 / (1 + Math.pow((i * 2) / U, 1.6)); XS.push(a); }
    const r = shelf.getBoundingClientRect(); shelfCY = r.top + r.height / 2;
    tapes.forEach((t) => { t.cv.style.transform = `rotateY(90deg) translateZ(${ws / 2}px)`; });
  }

  let s = START + N, T = s, dragging = false, hoverV = -1;
  let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
  let tiltX = 0, tiltY = 0, dotY = null, rs = 0, curState = '';
  let activeIdx = mod(Math.round(s), N);
  let last = performance.now(), raf = 0, dead = false;

  function setCur(onCover) {
    const t = o.cursorTarget();
    const st = t && t.closest && t.closest('a,button,.tl,.box,input,label') ? 'btn'
      : onCover ? 'open' : (!o.isDetailOpen() && tapeAt(mx, my) >= 0 ? 'spine' : '');
    if (st !== curState) { curState = st; o.onCursor(st); }
  }

  function frame(now) {
    if (dead) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const k = dragging ? 18 : 5.2;
    if (RM || Math.abs(T - s) < 0.0005) s = T; else s += (T - s) * (1 - Math.exp(-k * dt));
    if (Math.abs(s) > TOT * 4) { const sh = Math.sign(s) * TOT * 4; s -= sh; T -= sh; }
    const ai = mod(Math.round(s), N);
    if (ai !== activeIdx) { const dir = Math.sign(T - s) || 1; activeIdx = ai; o.onActive(ai, dir); }

    const open = o.isDetailOpen();
    const settled = Math.abs(T - s) < 0.3 && !open;
    const onCover = settled && Math.abs(mx - W / 2) < 0.55 * dd && Math.abs(my - shelfCY) < 0.55 * H;
    let tx, ty;
    if (onCover) { tx = ((mx - W / 2) / (0.55 * dd)) * 8; ty = (-(my - shelfCY) / (H / 2)) * 5; }
    else { tx = ((mx - W / 2) / W) * 4; ty = 0; }
    const ke = 1 - Math.exp(-7 * dt);
    tiltY += (tx - tiltY) * ke; tiltX += (ty - tiltX) * ke;
    const kl = 1 - Math.exp(-12 * dt);

    for (const t of tapes) {
      const r = rel(t.v, s), o_ = sm(Math.max(0, 1 - Math.abs(r))), u = F(r);
      if (Math.abs(u) > U * 1.8) {
        t.on = false;
        if (!t.hid) { t.el.style.display = 'none'; t.hid = true; }
        continue;
      }
      if (t.hid) { t.el.style.display = ''; t.hid = false; }
      const tgt = t.v === hoverV && Math.abs(r) > 0.5 ? 1 : 0; t.lift += (tgt - t.lift) * kl;
      const sc = scl(u), kk = 1 / sc;
      const z = P_ * (1 - kk) + o_ * H * 0.1;
      const x = xsc(u) * kk;
      const y = (H * 0.5 * (1 - sc) * 0.42 + o_ * H * 0.012 - t.lift * H * 0.05) * kk;
      t.sx = W / 2 + xsc(u); t.hw = sc * ((ws / 2) * (1 - o_) + (dd / 2) * o_);
      t.sy = shelfCY + (H * 0.5 * (1 - sc) * 0.42 + o_ * H * 0.012 - t.lift * H * 0.05); t.hh = (sc * H) / 2; t.on = true;
      const ry = -Math.sign(u) * Math.min(1, Math.abs(u) / U) * 26 * (1 - o_) - 90 * o_ + tiltY * o_;
      const rx = tiltX * o_;
      t.el.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${z.toFixed(2)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      t.sp.style.setProperty('--shade', Math.min(0.6, o_ * 0.55 + (1 - sc) * 0.32).toFixed(3));
      t.cvi.style.setProperty('--shade', ((1 - o_) * 0.82).toFixed(3));
      t.cvi.style.transform = `scaleX(${Math.max(0.001, sm(o_ / 0.4)).toFixed(3)})`;
    }

    const rt = open ? 0 : sm(Math.max(0, 1 - Math.abs(T - s) * 3));
    rs += (rt - rs) * (1 - Math.exp(-18 * dt)); ring.style.setProperty('--rs', rs.toFixed(3));

    const fl = Math.floor(s), fr = s - fl, a = FILMS[mod(fl, N)], b = FILMS[mod(fl + 1, N)];
    const yr = mod(fl, N) === N - 1 ? (fr < 0.5 ? a.year : b.year) : a.year + (b.year - a.year) * fr;
    if (dotY === null || Math.abs(yr - dotY) > 6) dotY = yr; else dotY += (yr - dotY) * (1 - Math.exp(-14 * dt));
    dot.style.left = ((dotY - YMIN) / (YMAX - YMIN)) * 100 + '%';

    cx += (mx - cx) * (1 - Math.exp(-16 * dt)); cy += (my - cy) * (1 - Math.exp(-16 * dt));
    cursor.style.transform = `translate(${cx.toFixed(1)}px,${cy.toFixed(1)}px)`;
    setCur(onCover);
    raf = requestAnimationFrame(frame);
  }

  function tapeAt(px, py) {
    let best = -1, bd = 1e9;
    for (const t of tapes) {
      if (!t.on || t.hid) continue;
      if (Math.abs(py - t.sy) > t.hh) continue;
      const d = Math.abs(px - t.sx);
      if (d <= t.hw && d / t.hw < bd) { bd = d / t.hw; best = t.v; }
    }
    return best;
  }

  /* ---- input ---- */
  let down = false, downTape = -1, dx0 = 0, T0 = 0, moved = false, vel = 0, lastX = 0, lastT = 0, wt = 0;
  const step = (n) => { T = Math.round(T) + n; };
  const jumpFilm = (i) => { T = i + N * Math.round((Math.round(T) - i) / N); };

  const onDown = (e) => {
    if (o.isDetailOpen()) return;
    dragging = false; moved = false; dx0 = e.clientX; T0 = T; downTape = tapeAt(e.clientX, e.clientY);
    lastX = e.clientX; lastT = performance.now(); vel = 0; down = true;
    try { shelf.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
  };
  const onShelfMove = (e) => {
    if (!down) return;
    const dx = e.clientX - dx0;
    if (!moved && Math.abs(dx) > 5) { moved = true; dragging = true; }
    if (moved) {
      T = T0 - dx / (ws + gap);
      const now = performance.now(), dtm = now - lastT;
      if (dtm > 0) { const iv = -(e.clientX - lastX) / (ws + gap) / (dtm / 1000); vel = vel * 0.6 + iv * 0.4; }
      lastX = e.clientX; lastT = now;
    }
  };
  const onUp = () => {
    if (!down) return;
    down = false; dragging = false;
    if (moved) {
      let proj = Math.max(-3, Math.min(3, vel * 0.22));
      if (performance.now() - lastT > 90) proj = 0;
      T = Math.round(T + proj); moved = false; return;
    }
    if (downTape >= 0) {
      const r = rel(downTape, s);
      if (Math.abs(r) < 0.5 && Math.abs(T - s) < 0.3) o.onOpen(); else T = Math.round(T + r);
    }
  };
  const onCancel = () => { down = false; dragging = false; moved = false; T = Math.round(T); };
  const onDocMove = (e) => {
    mx = e.clientX; my = e.clientY; o.setCursorTarget(e.target);
    if (!down) hoverV = o.isDetailOpen() ? -1 : tapeAt(e.clientX, e.clientY);
  };
  const onWheel = (e) => {
    if (o.isDetailOpen()) return;
    e.preventDefault();
    const dl = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    T += (dl / (ws + gap)) * 0.5; clearTimeout(wt); wt = setTimeout(() => { T = Math.round(T); }, 160);
  };
  const onKey = (e) => {
    if (o.isDetailOpen()) return;
    if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'Enter' && document.activeElement === document.body) o.onOpen();
  };
  let rz = 0;
  const onResize = () => { clearTimeout(rz); rz = setTimeout(measure, 60); };

  shelf.addEventListener('pointerdown', onDown);
  shelf.addEventListener('pointermove', onShelfMove);
  shelf.addEventListener('pointerup', onUp);
  shelf.addEventListener('pointercancel', onCancel);
  document.addEventListener('pointermove', onDocMove, { passive: true });
  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('keydown', onKey);
  window.addEventListener('resize', onResize);

  measure();
  raf = requestAnimationFrame((n) => { last = n; frame(n); });

  return {
    measure,
    step,
    jumpFilm,
    jumpYear(clientX) {
      const r = tl.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (clientX - r.left) / r.width)), yr = YMIN + p * (YMAX - YMIN);
      let bi = 0, bd = 1e9;
      FILMS.forEach((f, i) => { const d = Math.abs(f.year - yr); if (d < bd) { bd = d; bi = i; } });
      jumpFilm(bi);
    },
    snap() { T = Math.round(T); s = T; return mod(T, N); },
    coverRect() {
      const t = tapes.find((t) => Math.abs(rel(t.v, s)) < 0.5) || tapes[0];
      return t.cv.getBoundingClientRect();
    },
    destroy() {
      dead = true; cancelAnimationFrame(raf); clearTimeout(wt); clearTimeout(rz);
      shelf.removeEventListener('pointerdown', onDown);
      shelf.removeEventListener('pointermove', onShelfMove);
      shelf.removeEventListener('pointerup', onUp);
      shelf.removeEventListener('pointercancel', onCancel);
      document.removeEventListener('pointermove', onDocMove);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    },
  };
}
