'use client';

import { useEffect, useRef } from 'react';
import { CONFIG } from '@/lib/config';

interface Blob {
  x: number; y: number; vx: number; vy: number;
  r: number; opacity: number; warm: boolean;
}

interface Firefly {
  nx: number;
  ny: number;
  vx: number;
  vy: number;
  avx: number;
  avy: number;
  phase: number;
  blinkSpeed: number;
  wavePhase: number;
  waveFreqX: number;
  waveFreqY: number;
  glowR: number;
  coreR: number;
}

const BLOB_DEFS: Blob[] = [
  { x: 0.15, y: 0.20, vx:  0.00008, vy:  0.00005, r: 0.42, opacity: 0.045, warm: true  },
  { x: 0.50, y: 0.55, vx:  0.00010, vy: -0.00004, r: 0.48, opacity: 0.038, warm: true  },
  { x: 0.85, y: 0.75, vx: -0.00008, vy: -0.00006, r: 0.34, opacity: 0.025, warm: false },
];

// Grid-jitter: one fly per cell so they spread evenly, never cluster
function makeFireflies(count: number): Firefly[] {
  const cols = 5, rows = Math.ceil(count / cols);
  const cells: Array<{ c: number; r: number }> = [];
  for (let c = 0; c < cols; c++)
    for (let r = 0; r < rows; r++)
      cells.push({ c, r });
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return cells.slice(0, count).map(({ c, r }) => ({
    nx: (c + 0.12 + Math.random() * 0.76) / cols,
    ny: (r + 0.10 + Math.random() * 0.80) / rows,
    vx: (Math.random() - 0.5) * 0.000110,
    vy: (Math.random() - 0.5) * 0.000075,
    avx: 0, avy: 0,
    phase:      Math.random() * Math.PI * 2,
    blinkSpeed: 0.45 + Math.random() * 0.90,
    wavePhase:  Math.random() * Math.PI * 2,
    waveFreqX:  0.30 + Math.random() * 0.28,
    waveFreqY:  0.24 + Math.random() * 0.22,
    glowR: 38 + Math.random() * 28,
    coreR: 1.0  + Math.random() * 0.9,
  }));
}

// Dusk horizon glow rising from the valley floor (Jhelum banks)
function drawValleyGlow(c: CanvasRenderingContext2D, W: number, H: number) {
  const grad = c.createRadialGradient(W * 0.5, H * 1.15, 0, W * 0.5, H * 1.15, W * 0.72);
  grad.addColorStop(0,   'rgba(140, 68,  8, 0.12)');
  grad.addColorStop(0.4, 'rgba(100, 45,  4, 0.06)');
  grad.addColorStop(1,   'rgba(  0,  0,  0, 0)'   );
  c.fillStyle = grad;
  c.fillRect(0, 0, W, H);
}

// Chinar tree silhouettes — the iconic trees of Kashmir at dusk
function drawChinars(c: CanvasRenderingContext2D, W: number, H: number) {
  c.save();
  // Near-black fill: slightly darker and warmer than the page background,
  // creating subtle silhouettes against the valley glow
  c.fillStyle = 'rgba(0, 0, 0, 0.92)';

  function ellipse(cx: number, cy: number, rx: number, ry: number) {
    c.beginPath();
    c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    c.fill();
  }

  // One Chinar tree. tH = tree height in px, base at y=H (bottom of canvas)
  function chinar(x: number, tH: number) {
    const base = H;
    // Trunk — narrow, straight
    c.beginPath();
    c.rect(x - tH * 0.030, base - tH * 0.42, tH * 0.060, tH * 0.42);
    c.fill();
    // Chinar's signature wide spreading canopy (5 lobes)
    ellipse(x,                base - tH * 0.64, tH * 0.30, tH * 0.26); // centre mass
    ellipse(x - tH * 0.22,   base - tH * 0.54, tH * 0.20, tH * 0.22); // left lobe
    ellipse(x + tH * 0.24,   base - tH * 0.52, tH * 0.18, tH * 0.20); // right lobe
    ellipse(x - tH * 0.09,   base - tH * 0.80, tH * 0.15, tH * 0.13); // upper-left
    ellipse(x + tH * 0.11,   base - tH * 0.78, tH * 0.13, tH * 0.12); // upper-right
  }

  // Distant mountain ridge — barely visible, sets the valley depth
  c.fillStyle = 'rgba(0, 0, 0, 0.45)';
  c.beginPath();
  c.moveTo(0, H * 0.72);
  c.lineTo(W * 0.08, H * 0.62);
  c.lineTo(W * 0.18, H * 0.68);
  c.lineTo(W * 0.30, H * 0.58);
  c.lineTo(W * 0.44, H * 0.65);
  c.lineTo(W * 0.56, H * 0.54);
  c.lineTo(W * 0.68, H * 0.62);
  c.lineTo(W * 0.80, H * 0.52);
  c.lineTo(W * 0.90, H * 0.60);
  c.lineTo(W,        H * 0.56);
  c.lineTo(W, H);
  c.lineTo(0, H);
  c.closePath();
  c.fill();

  // Chinar trees in the valley foreground
  c.fillStyle = 'rgba(0, 0, 0, 0.92)';
  chinar(W * 0.08,  H * 0.32);   // tall left tree
  chinar(W * 0.14,  H * 0.22);   // shorter left neighbour
  chinar(W * 0.87,  H * 0.28);   // right tree
  chinar(W * 0.94,  H * 0.18);   // small right edge tree

  // Jhelum riverbank: a very faint horizontal reflective strip near the tree bases
  const river = c.createLinearGradient(0, H * 0.88, 0, H * 0.94);
  river.addColorStop(0, 'rgba(120, 65, 10, 0)');
  river.addColorStop(0.5, 'rgba(120, 65, 10, 0.055)');
  river.addColorStop(1, 'rgba(120, 65, 10, 0)');
  c.fillStyle = river;
  c.fillRect(W * 0.15, H * 0.88, W * 0.70, H * 0.06);

  c.restore();
}

function drawBlobs(c: CanvasRenderingContext2D, W: number, H: number, blobs: Blob[]) {
  const lenis    = (window as unknown as { lenis?: { velocity: number } }).lenis;
  const vel      = Math.abs(lenis?.velocity ?? 0);
  const speedMul = 1 + Math.min(1, vel / 8) * 1.5;

  blobs.forEach(blob => {
    blob.x += blob.vx * speedMul;
    blob.y += blob.vy * speedMul;
    if (blob.x < -0.5) blob.x =  1.5;
    if (blob.x >  1.5) blob.x = -0.5;
    if (blob.y < -0.5) blob.y =  1.5;
    if (blob.y >  1.5) blob.y = -0.5;

    const cx = blob.x * W;
    const cy = blob.y * H;
    const r  = blob.r * Math.min(W, H);
    const color = blob.warm
      ? `rgba(201,123,43,${blob.opacity})`
      : `rgba(90,140,165,${blob.opacity})`;

    const grad = c.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, color);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = grad;
    c.fillRect(0, 0, W, H);
  });
}

function drawFireflies(
  c: CanvasRenderingContext2D,
  W: number, H: number,
  t: number,
  flies: Firefly[],
  mx: number, my: number,
) {
  const ATTRACT_R = 220;

  flies.forEach(fly => {
    fly.avx *= 0.93;
    fly.avy *= 0.93;

    let attrX = 0, attrY = 0;
    if (mx >= 0) {
      const fx = fly.nx * W, fy = fly.ny * H;
      const dx = mx - fx, dy = my - fy;
      const d  = Math.sqrt(dx * dx + dy * dy) + 1;
      if (d < ATTRACT_R && d > 12) {
        const strength = ((ATTRACT_R - d) / ATTRACT_R) * 0.38;
        attrX = (dx / d) * strength * 0.000065;
        attrY = (dy / d) * strength * 0.000050;
      }
    }

    const waveX = Math.sin(t * fly.waveFreqX + fly.wavePhase) * 0.000088;
    const waveY = Math.cos(t * fly.waveFreqY + fly.wavePhase) * 0.000070;

    fly.nx += fly.vx + fly.avx + attrX + waveX;
    fly.ny += fly.vy + fly.avy + attrY + waveY;

    if (fly.nx < -0.02) fly.nx = 1.02;
    if (fly.nx >  1.02) fly.nx = -0.02;
    if (fly.ny < -0.02) fly.ny = 1.02;
    if (fly.ny >  1.02) fly.ny = -0.02;

    const raw = Math.sin(t * fly.blinkSpeed + fly.phase);
    const lit = Math.max(0, raw * raw * raw * raw);

    const fx = fly.nx * W;
    const fy = fly.ny * H;

    // Outer glow
    if (lit > 0.02) {
      const grad = c.createRadialGradient(fx, fy, 0, fx, fy, fly.glowR);
      grad.addColorStop(0,   `rgba(220,140,40,${(lit * 0.26).toFixed(3)})`);
      grad.addColorStop(0.5, `rgba(200,110,25,${(lit * 0.10).toFixed(3)})`);
      grad.addColorStop(1,   'rgba(0,0,0,0)');
      c.fillStyle = grad;
      c.fillRect(fx - fly.glowR, fy - fly.glowR, fly.glowR * 2, fly.glowR * 2);
    }

    // Core dot — always faintly present
    c.beginPath();
    c.arc(fx, fy, fly.coreR, 0, Math.PI * 2);
    c.fillStyle = `rgba(240,168,55,${(0.06 + lit * 0.90).toFixed(3)})`;
    c.fill();
  });
}

export default function AtmosphereCanvas() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const rafRef      = useRef<number>(0);
  const blobsRef    = useRef<Blob[]>(BLOB_DEFS.map(b => ({ ...b })));
  const fliesRef    = useRef<Firefly[]>([]);
  const mouseRef    = useRef<{ x: number; y: number }>({ x: -1, y: -1 });
  const timeRef     = useRef<number>(0);
  const lastTickRef = useRef<number>(0);

  useEffect(() => {
    if (!CONFIG.effects.atmosphereEnabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctxRaw = canvas.getContext('2d');
    if (!ctxRaw) return;
    const ctx = ctxRaw;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile     = window.innerWidth < 768;

    fliesRef.current = CONFIG.effects.atmosphereNoiseEnabled
      ? makeFireflies(isMobile ? 6 : 10)
      : [];

    function setSize() {
      if (!canvas) return;
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function loop(now: number) {
      if (!canvas) return;
      rafRef.current = requestAnimationFrame(loop);
      if (now - lastTickRef.current < 33) return; // ~30fps cap
      lastTickRef.current = now;

      timeRef.current += 0.012;
      const t = timeRef.current;
      const W = canvas.width;
      const H = canvas.height;
      const { x: mx, y: my } = mouseRef.current;

      ctx.clearRect(0, 0, W, H);
      drawBlobs(ctx, W, H, blobsRef.current);
      drawValleyGlow(ctx, W, H);
      drawChinars(ctx, W, H);
      if (fliesRef.current.length > 0) drawFireflies(ctx, W, H, t, fliesRef.current, mx, my);
    }

    setSize();
    if (reduceMotion) return;

    rafRef.current = requestAnimationFrame(loop);

    const onMouseMove  = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onMouseLeave = ()              => { mouseRef.current = { x: -1, y: -1 }; };
    const onClick      = (e: MouseEvent) => {
      const W = canvas?.width  ?? window.innerWidth;
      const H = canvas?.height ?? window.innerHeight;
      fliesRef.current.forEach(fly => {
        const fx = fly.nx * W, fy = fly.ny * H;
        const dx = fx - e.clientX, dy = fy - e.clientY;
        const d  = Math.sqrt(dx * dx + dy * dy) + 1;
        const force = Math.max(0, 200 - d) / 200;
        fly.avx += (dx / d) * force * 0.00180;
        fly.avy += (dy / d) * force * 0.00145;
      });
    };
    const onResize      = () => setSize();
    const onVisibility  = () => {
      if (document.visibilityState === 'hidden') cancelAnimationFrame(rafRef.current);
      else rafRef.current = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove',          onMouseMove,   { passive: true });
    document.addEventListener('mouseleave',        onMouseLeave);
    window.addEventListener('click',              onClick,       { passive: true });
    window.addEventListener('resize',             onResize,      { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove',          onMouseMove);
      document.removeEventListener('mouseleave',        onMouseLeave);
      window.removeEventListener('click',              onClick);
      window.removeEventListener('resize',             onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  if (!CONFIG.effects.atmosphereEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position:      'fixed',
        inset:         0,
        width:         '100vw',
        height:        '100vh',
        zIndex:        0,
        pointerEvents: 'none',
      }}
    />
  );
}
