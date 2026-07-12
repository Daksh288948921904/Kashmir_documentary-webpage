'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTimeline } from '@/hooks/useTimeline';
import type { TimelineEvent, TimelineDoc } from '@/types/api';

gsap.registerPlugin(ScrollTrigger);

/* ── Leaflet — client-only ── */
const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--color-deep-slate-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-ash-text)', letterSpacing: '0.14em' }}>
        Loading map…
      </span>
    </div>
  ),
});

/* ── Types & constants ── */
type Category = 'all' | 'political' | 'conflict' | 'cultural' | 'humanitarian';

const CATEGORY_COLORS: Record<string, string> = {
  political:    '#C97B2B',
  conflict:     '#8B2F3F',
  cultural:     '#4A7B8C',
  humanitarian: '#5A7B5A',
};
const CATEGORY_BG: Record<string, string> = {
  political:    'rgba(201,123,43,0.07)',
  conflict:     'rgba(139,47,63,0.12)',
  cultural:     'rgba(74,123,140,0.09)',
  humanitarian: 'rgba(90,123,90,0.10)',
};
const CATEGORY_GLOW: Record<string, string> = {
  political:    'radial-gradient(ellipse 65% 55% at 72% 50%, rgba(201,123,43,0.14) 0%, transparent 70%)',
  conflict:     'radial-gradient(ellipse 65% 55% at 72% 50%, rgba(139,47,63,0.20) 0%, transparent 70%)',
  cultural:     'radial-gradient(ellipse 65% 55% at 72% 50%, rgba(74,123,140,0.14) 0%, transparent 70%)',
  humanitarian: 'radial-gradient(ellipse 65% 55% at 72% 50%, rgba(90,123,90,0.14) 0%, transparent 70%)',
};
const FILTERS: { key: Category; label: string }[] = [
  { key: 'all',          label: 'All' },
  { key: 'political',    label: 'Political' },
  { key: 'conflict',     label: 'Conflict' },
  { key: 'cultural',     label: 'Cultural' },
  { key: 'humanitarian', label: 'Humanitarian' },
];

type EraId = 'ancient' | 'colonial' | 'partition' | 'conflictEra' | 'modern';
const ERAS: { id: EraId; label: string; range: string; accent: string }[] = [
  { id: 'ancient',     label: 'Sultanate · Mughal · Afghan', range: '1339 – 1800', accent: 'rgba(201,123,43,0.50)' },
  { id: 'colonial',    label: 'Colonial Period',             range: '1819 – 1946', accent: 'rgba(201,123,43,0.40)' },
  { id: 'partition',   label: 'Partition & Wars',            range: '1947 – 1983', accent: 'rgba(139,47,63,0.55)' },
  { id: 'conflictEra', label: 'Conflict Era',                range: '1984 – 2004', accent: 'rgba(139,47,63,0.65)' },
  { id: 'modern',      label: 'Contemporary Kashmir',        range: '2005 – 2026', accent: 'rgba(74,123,140,0.55)' },
];
function getEraId(year: number): EraId {
  if (year <= 1800) return 'ancient';
  if (year <= 1946) return 'colonial';
  if (year <= 1983) return 'partition';
  if (year <= 2004) return 'conflictEra';
  return 'modern';
}

/* ── Canvas effect system (verbatim from Timeline) ── */
interface Dot  { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; }
interface Ring { x: number; y: number; r: number; maxR: number; alpha: number; }

function getEffectType(event: TimelineEvent): string {
  const yr = event.year;
  if (yr === 1947) return 'partition';
  if (yr === 1948 || yr === 1965) return 'shockwave';
  if (yr === 1984) return 'snow';
  if (yr === 1989) return 'fire';
  if (yr === 1990) return 'exodus';
  if (yr === 1999) return 'shockwave';
  if (yr === 2019) return 'partition';
  if (yr === 1931) return 'fire';
  switch (event.category) {
    case 'conflict':     return 'embers';
    case 'humanitarian': return 'drift';
    case 'political':    return 'scanlines';
    case 'cultural':     return 'ripple';
    default:             return 'drift';
  }
}

function useCanvasEffect(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  event: TimelineEvent | null,
  color: string,
) {
  useEffect(() => {
    if (!event || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const type = getEffectType(event);
    const dpr = window.devicePixelRatio || 1;
    const setSize = () => {
      const W = canvas.offsetWidth; const H = canvas.offsetHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setSize();
    let frame = 0; let dots: Dot[] = []; let rings: Ring[] = [];
    let crackPoints: [number, number][] | null = null;
    let raf: number;
    if (type === 'partition') {
      const W = canvas.offsetWidth; const H = canvas.offsetHeight;
      crackPoints = [[W * 0.5, 0]];
      let y = 0;
      while (y < H + 20) { y += 5 + Math.random() * 12; crackPoints.push([W * 0.5 + (Math.random() - 0.5) * 28, y]); }
    }
    const loop = () => {
      const W = canvas.offsetWidth; const H = canvas.offsetHeight;
      ctx.clearRect(0, 0, W, H);
      if (type === 'partition' && crackPoints) {
        const progress = Math.min(1, frame / 110); const drawUpTo = H * progress;
        const glow = 0.5 + Math.sin(frame * 0.04) * 0.15;
        ctx.save(); ctx.lineWidth = 1.8; ctx.strokeStyle = color; ctx.shadowColor = '#fff'; ctx.shadowBlur = 14; ctx.globalAlpha = glow;
        ctx.beginPath();
        for (let i = 0; i < crackPoints.length - 1; i++) {
          const [x1,y1]=crackPoints[i]; const [x2,y2]=crackPoints[i+1];
          if (y1 > drawUpTo) break;
          const t=Math.min(1,(drawUpTo-y1)/Math.max(1,y2-y1)); const ex=x1+(x2-x1)*t; const ey=Math.min(y2,drawUpTo);
          if (i===0) ctx.moveTo(x1,y1); else ctx.lineTo(ex,ey);
        }
        ctx.stroke(); ctx.restore();
        ctx.save(); ctx.lineWidth=5; ctx.strokeStyle=color; ctx.shadowColor=color; ctx.shadowBlur=28; ctx.globalAlpha=glow*0.25;
        ctx.beginPath();
        for (let i=0;i<crackPoints.length-1;i++){const[x1,y1]=crackPoints[i];const[x2,y2]=crackPoints[i+1];if(y1>drawUpTo)break;const t=Math.min(1,(drawUpTo-y1)/Math.max(1,y2-y1));const ex=x1+(x2-x1)*t;const ey=Math.min(y2,drawUpTo);if(i===0)ctx.moveTo(x1,y1);else ctx.lineTo(ex,ey);}
        ctx.stroke(); ctx.restore();
        if (progress > 0.25 && frame % 4 === 0 && dots.length < 70) {
          const idx=Math.floor(Math.random()*Math.floor(crackPoints.length*progress));
          const pt=crackPoints[Math.min(idx,crackPoints.length-1)];
          if (pt) dots.push({x:pt[0],y:pt[1],vx:(Math.random()-0.5)*2.5,vy:(Math.random()-0.5)*2.5,life:0,maxLife:28+Math.random()*22,size:0.8+Math.random()*1.8});
        }
        dots=dots.filter(d=>{d.x+=d.vx;d.y+=d.vy;d.life++;const a=(1-d.life/d.maxLife)*0.85;if(a<=0.01)return false;ctx.save();ctx.globalAlpha=a;ctx.fillStyle='#fff';ctx.shadowColor=color;ctx.shadowBlur=10;ctx.beginPath();ctx.arc(d.x,d.y,d.size,0,Math.PI*2);ctx.fill();ctx.restore();return true;});
      } else if (type==='shockwave') {
        if(frame%38===0&&rings.length<7){const cx=W*0.1+Math.random()*W*0.8;const cy=H*0.1+Math.random()*H*0.8;rings.push({x:cx,y:cy,r:3,maxR:55+Math.random()*90,alpha:1});if(dots.length<50)for(let i=0;i<6;i++){const a=(Math.PI*2*i)/6+Math.random()*0.6;dots.push({x:cx,y:cy,vx:Math.cos(a)*(1.5+Math.random()*2.5),vy:Math.sin(a)*(1.5+Math.random()*2.5),life:0,maxLife:22+Math.random()*18,size:1.5+Math.random()*2});}}
        rings=rings.filter(ring=>{ring.r+=2;ring.alpha=Math.pow(1-ring.r/ring.maxR,1.4)*0.75;if(ring.alpha<=0.01)return false;ctx.save();ctx.globalAlpha=ring.alpha;ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.shadowColor=color;ctx.shadowBlur=12;ctx.beginPath();ctx.arc(ring.x,ring.y,ring.r,0,Math.PI*2);ctx.stroke();ctx.restore();return true;});
        dots=dots.filter(d=>{d.x+=d.vx;d.y+=d.vy;d.vx*=0.93;d.vy*=0.93;d.life++;const a=(1-d.life/d.maxLife)*0.9;if(a<=0.01)return false;ctx.save();ctx.globalAlpha=a;ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=8;ctx.beginPath();ctx.arc(d.x,d.y,d.size,0,Math.PI*2);ctx.fill();ctx.restore();return true;});
      } else if (type==='snow') {
        if(frame%3===0&&dots.length<90)dots.push({x:Math.random()*W,y:-8,vx:(Math.random()-0.5)*0.7,vy:0.55+Math.random()*1.2,life:0,maxLife:(H+20)/0.85,size:0.8+Math.random()*2.4});
        dots=dots.filter(d=>{d.x+=d.vx+Math.sin(frame*0.018+d.y*0.06)*0.35;d.y+=d.vy;d.life++;const a=0.35+0.45*(1-d.life/d.maxLife);if(d.y>H+10)return false;ctx.save();ctx.globalAlpha=a;ctx.fillStyle='rgba(190,215,255,0.95)';ctx.shadowColor='#b0d8ff';ctx.shadowBlur=d.size*2;ctx.beginPath();ctx.arc(d.x,d.y,d.size,0,Math.PI*2);ctx.fill();ctx.restore();return true;});
      } else if (type==='fire') {
        if(frame%2===0&&dots.length<80)dots.push({x:W*0.2+Math.random()*W*0.6,y:H*0.7+Math.random()*H*0.25,vx:(Math.random()-0.5)*2,vy:-(1.8+Math.random()*3),life:0,maxLife:55+Math.random()*50,size:2+Math.random()*4});
        dots=dots.filter(d=>{d.x+=d.vx+Math.sin(frame*0.04+d.y*0.04)*0.5;d.y+=d.vy;d.vx*=0.99;d.life++;const p=d.life/d.maxLife;let a=p<0.15?p/0.15:p>0.45?(1-p)/0.55:1;a*=0.85;if(a<=0.01||d.y<-10)return false;const hex=p<0.3?'#FF6030':p<0.6?color:'#FF9060';ctx.save();ctx.globalAlpha=a;ctx.fillStyle=hex;ctx.shadowColor=color;ctx.shadowBlur=d.size*4;ctx.beginPath();ctx.arc(d.x,d.y,d.size,0,Math.PI*2);ctx.fill();ctx.restore();return true;});
      } else if (type==='exodus') {
        if(frame%2===0&&dots.length<100)dots.push({x:W+15,y:H*0.1+Math.random()*H*0.8,vx:-(1.4+Math.random()*2.2),vy:(Math.random()-0.5)*0.5,life:0,maxLife:(W+30)/1.8,size:1.8+Math.random()*2.5});
        const grd=ctx.createLinearGradient(W,0,0,0);grd.addColorStop(0,`${color}00`);grd.addColorStop(0.5,`${color}15`);grd.addColorStop(1,`${color}00`);ctx.fillStyle=grd;ctx.fillRect(0,0,W,H);
        dots=dots.filter(d=>{d.x+=d.vx;d.y+=d.vy;d.life++;const p=d.life/d.maxLife;let a=p<0.08?p/0.08:p>0.82?(1-p)/0.18:0.55;if(a<=0.01||d.x<-15)return false;ctx.save();ctx.globalAlpha=a;ctx.fillStyle=color;ctx.beginPath();ctx.arc(d.x,d.y,d.size,0,Math.PI*2);ctx.fill();ctx.restore();return true;});
      } else if (type==='embers') {
        if(frame%3===0&&dots.length<65)dots.push({x:W*0.2+Math.random()*W*0.6,y:H*0.75+Math.random()*H*0.2,vx:(Math.random()-0.5)*1.8,vy:-(1.2+Math.random()*2.2),life:0,maxLife:65+Math.random()*55,size:1.2+Math.random()*3});
        dots=dots.filter(d=>{d.x+=d.vx+Math.sin(frame*0.03+d.y*0.05)*0.4;d.y+=d.vy;d.life++;const p=d.life/d.maxLife;let a=p<0.15?p/0.15:p>0.5?(1-p)/0.5:0.75;if(a<=0.01||d.y<-10)return false;ctx.save();ctx.globalAlpha=a;ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=d.size*3.5;ctx.beginPath();ctx.arc(d.x,d.y,d.size,0,Math.PI*2);ctx.fill();ctx.restore();return true;});
      } else if (type==='drift') {
        if(frame%5===0&&dots.length<45)dots.push({x:W+10,y:H*0.05+Math.random()*H*0.9,vx:-(0.5+Math.random()*1),vy:-(0.15+Math.random()*0.3),life:0,maxLife:110+Math.random()*80,size:1.2+Math.random()*2});
        dots=dots.filter(d=>{d.x+=d.vx;d.y+=d.vy;d.life++;const p=d.life/d.maxLife;let a=p<0.2?p/0.2:p>0.7?(1-p)/0.3:0.4;if(a<=0.01||d.x<-15||d.y<-15)return false;ctx.save();ctx.globalAlpha=a;ctx.fillStyle=color;ctx.beginPath();ctx.arc(d.x,d.y,d.size,0,Math.PI*2);ctx.fill();ctx.restore();return true;});
      } else if (type==='ripple') {
        if(frame%48===0&&rings.length<5)rings.push({x:W*0.55+(Math.random()-0.5)*W*0.3,y:H*0.5+(Math.random()-0.5)*H*0.3,r:0,maxR:Math.min(W,H)*(0.4+Math.random()*0.3),alpha:0.45});
        rings=rings.filter(ring=>{ring.r+=1.1;ring.alpha=(1-ring.r/ring.maxR)*0.38;if(ring.alpha<=0.005)return false;ctx.save();ctx.globalAlpha=ring.alpha;ctx.strokeStyle=color;ctx.lineWidth=1;ctx.beginPath();ctx.arc(ring.x,ring.y,ring.r,0,Math.PI*2);ctx.stroke();ctx.restore();return true;});
        const cx=W*0.6,cy=H*0.5,hexR=Math.min(W,H)*0.18,rot=frame*0.003;
        ctx.save();ctx.globalAlpha=0.07+Math.sin(frame*0.03)*0.03;ctx.strokeStyle=color;ctx.lineWidth=1;ctx.beginPath();
        for(let i=0;i<6;i++){const a=(Math.PI/3)*i+rot;const x=cx+hexR*Math.cos(a);const y=cy+hexR*Math.sin(a);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
        ctx.closePath();ctx.stroke();ctx.restore();
      } else if (type==='scanlines') {
        const n=5;for(let i=0;i<n;i++){const speed=0.35+i*0.07;const y=((frame*speed+i*(H/n))%H);const a=0.07+0.05*Math.sin(frame*0.05+i*1.3);ctx.save();ctx.globalAlpha=a;ctx.strokeStyle=color;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();ctx.restore();}
        if(frame%60===0&&dots.length<12)for(let i=0;i<4;i++)dots.push({x:Math.random()*W,y:H,vx:0,vy:-(2+Math.random()*3),life:0,maxLife:30+Math.random()*20,size:1});
        dots=dots.filter(d=>{d.y+=d.vy;d.life++;const a=(1-d.life/d.maxLife)*0.5;if(a<=0.01||d.y<0)return false;ctx.save();ctx.globalAlpha=a;ctx.strokeStyle=color;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(d.x,d.y);ctx.lineTo(d.x,d.y+12);ctx.stroke();ctx.restore();return true;});
      }
      frame++; raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.year, event?.title, color]);
}

function PanelCanvas({ event, color }: { event: TimelineEvent; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useCanvasEffect(canvasRef, event, color);
  return (
    <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1, opacity: 0.7 }} />
  );
}

/* ── DocChip ── */
function DocChip({ doc, color, onClick }: { doc: TimelineDoc; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      data-cursor-hover
      style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', textAlign: 'left', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderLeft: `2px solid ${color}60`, borderRadius: '2px', padding: '10px 14px', cursor: 'none', transition: 'background 220ms, border-left-color 220ms' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderLeftColor = color; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderLeftColor = `${color}60`; }}
    >
      <svg width="13" height="15" viewBox="0 0 13 15" fill="none" style={{ flexShrink: 0, color: 'var(--color-ash)', opacity: 0.55 }}>
        <rect x="0.5" y="0.5" width="12" height="14" rx="1" stroke="currentColor" strokeWidth="1"/>
        <line x1="3" y1="4.5" x2="10" y2="4.5" stroke="currentColor" strokeWidth="0.8"/>
        <line x1="3" y1="7.5" x2="10" y2="7.5" stroke="currentColor" strokeWidth="0.8"/>
        <line x1="3" y1="10.5" x2="7.5" y2="10.5" stroke="currentColor" strokeWidth="0.8"/>
      </svg>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.20em', textTransform: 'uppercase', color, marginBottom: '3px' }}>{doc.kind}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.04em', color: 'var(--color-snow-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</div>
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-ash)', opacity: 0.35, flexShrink: 0 }}>→</span>
    </button>
  );
}

/* ── DocModal ── */
function DocModal({ doc, color, onClose }: { doc: TimelineDoc; color: string; onClose: () => void }) {
  useEffect(() => {
    const lenis = (window as unknown as { lenis?: { stop: () => void; start: () => void } }).lenis;
    if (lenis) lenis.stop(); else document.body.style.overflow = 'hidden';
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => {
      if (lenis) lenis.start(); else document.body.style.overflow = '';
      document.removeEventListener('keydown', handler);
    };
  }, [onClose]);

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(10,8,6,0.82)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: '560px', background: 'rgba(16,12,8,0.98)', border: '1px solid rgba(255,255,255,0.07)', borderTop: `2px solid ${color}90`, borderRadius: '3px', padding: 'var(--space-7)', boxShadow: '0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.03)' }}>
        <button onClick={onClose} data-cursor-hover aria-label="Close" style={{ position: 'absolute', top: '14px', right: '16px', background: 'none', border: 'none', cursor: 'none', color: 'var(--color-snow-dim)', fontSize: '20px', lineHeight: 1, padding: '4px 6px', opacity: 0.75, transition: 'opacity 180ms' }} onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }} onMouseLeave={e => { e.currentTarget.style.opacity = '0.75'; }}>×</button>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.20em', textTransform: 'uppercase', color, marginBottom: 'var(--space-3)' }}>Primary Source · {doc.kind}</div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(1.1rem, 2.5vw, 1.45rem)', color: 'var(--color-snow)', lineHeight: 1.2, marginBottom: 'var(--space-2)' }}>{doc.name}</h3>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.20em', color: 'var(--color-ash-text)', marginBottom: 'var(--space-5)' }}>{doc.date}</div>
        <div style={{ height: '1px', background: `linear-gradient(to right, ${color}45, transparent)`, marginBottom: 'var(--space-5)' }} />
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', lineHeight: 1.85, color: 'var(--color-snow-dim)', marginBottom: 'var(--space-6)' }}>{doc.desc}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--color-ash-text)', opacity: 0.7 }}>Source: {doc.source}</div>
          <a href={doc.url} target="_blank" rel="noopener noreferrer" data-cursor-hover style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.20em', textTransform: 'uppercase', color, cursor: 'none', textDecoration: 'none', borderBottom: `1px solid ${color}45`, paddingBottom: '3px', transition: 'letter-spacing 220ms' }} onMouseEnter={e => { e.currentTarget.style.letterSpacing = '0.28em'; }} onMouseLeave={e => { e.currentTarget.style.letterSpacing = '0.20em'; }}>View source document →</a>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────────────────────── */
export default function HistorySection() {
  const sectionRef    = useRef<HTMLElement>(null);
  const headerRef     = useRef<HTMLDivElement>(null);
  const gridRef       = useRef<HTMLDivElement>(null);
  const panelRef      = useRef<HTMLDivElement>(null);
  const bgOverlayRef  = useRef<HTMLDivElement>(null);
  const glowRef       = useRef<HTMLDivElement>(null);
  const ambientYearRef = useRef<HTMLDivElement>(null);
  const panelYearRef  = useRef<HTMLSpanElement>(null);
  const activeRowRef  = useRef<HTMLDivElement | null>(null);

  const [activeFilter, setActiveFilter] = useState<Category>('all');
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [openDoc, setOpenDoc] = useState<{ doc: TimelineDoc; color: string } | null>(null);
  const { events, isLoading } = useTimeline();

  useEffect(() => { setOpenDoc(null); }, [selectedEvent]);

  const filtered = activeFilter === 'all' ? events : events.filter(e => e.category === activeFilter);

  const grouped = useMemo(() =>
    ERAS.map(era => ({
      era,
      events: filtered.filter(e => getEraId(e.year) === era.id),
    })).filter(g => g.events.length > 0),
  [filtered]);

  const isActive = (e: TimelineEvent) =>
    selectedEvent?.year === e.year && selectedEvent?.title === e.title;

  const color = selectedEvent ? (CATEGORY_COLORS[selectedEvent.category] ?? '#C97B2B') : '#C97B2B';

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach(e => { counts[e.category] = (counts[e.category] ?? 0) + 1; });
    return counts;
  }, [events]);

  /* Section entrance */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        opacity: 0, y: 26, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
      });
      gsap.from(gridRef.current, {
        opacity: 0, y: 20, duration: 1.0, ease: 'power3.out', delay: 0.15,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  /* Panel transition on event change */
  useEffect(() => {
    if (!panelRef.current) return;
    if (selectedEvent) {
      gsap.from(panelRef.current.querySelectorAll('.pcr'), {
        opacity: 0, y: 14, stagger: 0.06, duration: 0.5, ease: 'power3.out',
      });
      if (ambientYearRef.current) {
        gsap.from(ambientYearRef.current, { opacity: 0, scale: 0.9, duration: 0.75, ease: 'power3.out' });
      }
      if (panelYearRef.current) {
        const el = panelYearRef.current;
        const target = selectedEvent.year;
        gsap.from({}, {
          duration: 0.85, ease: 'power2.out',
          onUpdate: function () { el.textContent = String(Math.round(this.progress() * target)); },
          onComplete: () => { el.textContent = String(target); },
        });
      }
      const cat = selectedEvent.category;
      if (bgOverlayRef.current) {
        bgOverlayRef.current.style.backgroundColor = CATEGORY_BG[cat] ?? 'transparent';
        gsap.to(bgOverlayRef.current, { opacity: 1, duration: 0.9, ease: 'power2.inOut' });
      }
      if (glowRef.current) {
        glowRef.current.style.background = CATEGORY_GLOW[cat] ?? '';
        gsap.to(glowRef.current, { opacity: 1, duration: 0.7, ease: 'power2.out' });
      }
      if (activeRowRef.current) {
        activeRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } else {
      if (bgOverlayRef.current) gsap.to(bgOverlayRef.current, { opacity: 0, duration: 0.6 });
      if (glowRef.current)      gsap.to(glowRef.current,      { opacity: 0, duration: 0.5 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEvent]);

  const handleSelect = useCallback((event: TimelineEvent) => {
    setSelectedEvent(prev =>
      prev?.year === event.year && prev?.title === event.title ? null : event
    );
  }, []);

  return (
    <section
      id="timeline"
      ref={sectionRef}
      style={{ position: 'relative', zIndex: 1, padding: 'var(--section-py) 0', overflow: 'hidden' }}
    >
      {/* Atmosphere overlays */}
      <div ref={bgOverlayRef} style={{ position: 'absolute', inset: 0, backgroundColor: 'transparent', opacity: 0, transition: 'background-color 0.6s', pointerEvents: 'none', zIndex: 0 }} />
      <div ref={glowRef}      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0 }} />

      <div className="section-mist-top" />

      <div className="section-container" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Section header ── */}
        <div ref={headerRef} style={{ marginBottom: 'var(--space-5)' }}>
          <span className="eyebrow">1339 – 2026 · 687 Years of History</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--space-3)', marginTop: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(1.9rem, 4vw, 3rem)', color: 'var(--color-snow)', lineHeight: 1.08, margin: 0 }}>
              Kashmir Through Time
            </h2>
            {/* Shared filter pills */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {FILTERS.map(f => {
                const fc = CATEGORY_COLORS[f.key] ?? '#C97B2B';
                const isOn = activeFilter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => { setActiveFilter(f.key); setSelectedEvent(null); }}
                    data-cursor-hover
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
                      letterSpacing: '0.18em', textTransform: 'uppercase',
                      padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-pill)',
                      cursor: 'none',
                      border: `1px solid ${isOn ? fc : 'rgba(255,255,255,0.11)'}`,
                      backgroundColor: isOn ? fc : 'transparent',
                      color: isOn ? 'var(--color-deep-slate)' : 'var(--color-snow-dim)',
                      transition: 'all 250ms var(--ease-decisive)',
                      fontWeight: isOn ? 700 : 400,
                    }}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Three-zone grid ── */}
        <div ref={gridRef} className="hist-grid">

          {/* LEFT: Timeline rail */}
          <div className="hist-rail" data-lenis-prevent>
            <div style={{ position: 'relative', padding: '4px 8px 16px 10px' }}>
              {/* Spine */}
              <div style={{ position: 'absolute', left: '61px', top: 0, bottom: 0, width: '1px', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.06) 8%, rgba(255,255,255,0.06) 92%, transparent)', pointerEvents: 'none' }} />

              {isLoading && (
                <div style={{ padding: '48px 0 48px 72px', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.14em', color: 'var(--color-ash-text)' }}>Loading…</div>
              )}
              {!isLoading && grouped.length === 0 && (
                <div style={{ padding: '64px 0 64px 72px', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--color-ash)', opacity: 0.4 }}>
                  No {activeFilter} events
                </div>
              )}

              {grouped.map(({ era, events: eraEvents }) => (
                <div key={era.id}>
                  {/* Era separator */}
                  <div style={{ padding: '18px 0 5px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '50px', flexShrink: 0 }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--color-snow)', fontWeight: 500, flexShrink: 0 }}>
                        {era.label}
                      </span>
                      <div style={{ flex: 1, height: '1px', background: `linear-gradient(to right, ${era.accent}, transparent)` }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.20em', color: era.accent.replace(/[\d.]+\)$/, '1)'), flexShrink: 0, fontWeight: 600 }}>
                        {era.range}
                      </span>
                    </div>
                  </div>

                  {/* Events */}
                  {eraEvents.map(event => {
                    const ec     = CATEGORY_COLORS[event.category] ?? '#C97B2B';
                    const active = isActive(event);
                    const dimmed = selectedEvent !== null && !active;
                    return (
                      <div
                        key={`${event.year}-${event.title}`}
                        ref={el => { if (active) activeRowRef.current = el; }}
                        onClick={() => handleSelect(event)}
                        data-cursor-hover
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: active ? '9px 6px 9px 0' : '6px 6px 6px 0',
                          cursor: 'none',
                          opacity: dimmed ? 0.18 : 1,
                          transition: 'opacity 350ms ease, background-color 200ms, padding 200ms',
                          backgroundColor: active ? `${ec}12` : 'transparent',
                          borderRadius: '3px',
                          borderLeft: active ? `2px solid ${ec}` : '2px solid transparent',
                          paddingLeft: active ? '5px' : '0',
                        }}
                        onMouseEnter={e => { if (!active && !dimmed) e.currentTarget.style.backgroundColor = `${ec}07`; }}
                        onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = active ? `${ec}12` : 'transparent'; }}
                      >
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: active ? '1.1rem' : '0.92rem', fontWeight: 400, color: active ? ec : `${ec}50`, lineHeight: 1, width: '50px', flexShrink: 0, textAlign: 'right', transition: 'all 280ms', textShadow: active ? `0 0 20px ${ec}55` : 'none', letterSpacing: '-0.01em' }}>
                          {event.year}
                        </span>
                        <div style={{ width: active ? '6px' : '4px', height: active ? '6px' : '4px', borderRadius: '50%', backgroundColor: active ? ec : `${ec}40`, flexShrink: 0, transition: 'all 280ms', boxShadow: active ? `0 0 8px ${ec}90` : 'none' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: active ? '0.875rem' : '0.8rem', fontWeight: 400, color: active ? 'var(--color-snow)' : 'var(--color-snow-dim)', lineHeight: 1.3, marginBottom: '2px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', transition: 'color 280ms, font-size 280ms' }}>
                            {event.title}
                          </div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.16em', textTransform: 'uppercase', color: active ? ec : 'var(--color-snow-dim)', opacity: active ? 1 : 0.55, transition: 'all 280ms', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {event.category}{event.place ? ` · ${event.place}` : ''}
                          </div>
                        </div>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: ec, opacity: active ? 0.9 : 0.3, flexShrink: 0, transition: 'opacity 280ms' }} />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* CENTER: Map (id="map" anchor lives here) */}
          <div className="hist-map-col" id="map">
            <LeafletMap
              events={filtered}
              selectedEvent={selectedEvent}
              onSelectEvent={setSelectedEvent}
            />
          </div>

          {/* RIGHT: Detail / idle panel */}
          <div className="hist-panel" ref={panelRef}>
            {selectedEvent ? (
              /* ── Selected event detail ── */
              <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 'clamp(1.25rem, 2.2vw, 2rem)', overflow: 'hidden', backgroundColor: `${color}06`, border: `1px solid ${color}18`, transition: 'border-color 0.5s, background-color 0.5s' }}>
                <PanelCanvas event={selectedEvent} color={color} />

                {/* Ambient year */}
                <div ref={ambientYearRef} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontFamily: 'var(--font-display)', fontSize: 'clamp(5rem, 10vw, 9rem)', fontWeight: 400, lineHeight: 0.9, color, opacity: 0.04, pointerEvents: 'none', whiteSpace: 'nowrap', letterSpacing: '-0.04em', userSelect: 'none', zIndex: 0 }}>
                  {selectedEvent.year}
                </div>

                {/* Inner glow */}
                <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 80% 60% at 10% 100%, ${color}12 0%, transparent 65%)`, pointerEvents: 'none', zIndex: 0 }} />

                {/* Close */}
                <button
                  onClick={() => setSelectedEvent(null)}
                  data-cursor-hover
                  style={{ position: 'absolute', top: 'var(--space-4)', right: 'var(--space-4)', background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '50%', width: '26px', height: '26px', cursor: 'none', color: 'var(--color-ash-text)', fontSize: '13px', lineHeight: '26px', textAlign: 'center', transition: 'border-color 200ms, color 200ms', zIndex: 3 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = color; (e.currentTarget as HTMLButtonElement).style.color = color; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-ash-text)'; }}
                >×</button>

                {/* Content */}
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div className="pcr" style={{ marginBottom: 'var(--space-3)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.20em', textTransform: 'uppercase', color, borderBottom: `1px solid ${color}50`, paddingBottom: '3px' }}>
                      {selectedEvent.category}
                    </span>
                  </div>
                  <div className="pcr" style={{ marginBottom: 'var(--space-2)' }}>
                    <span ref={panelYearRef} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 3.5vw, 3rem)', fontWeight: 400, color, lineHeight: 1, textShadow: `0 0 40px ${color}50`, letterSpacing: '-0.02em' }}>
                      {selectedEvent.year}
                    </span>
                  </div>
                  <div className="pcr" style={{ marginBottom: 'var(--space-2)' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(1rem, 1.6vw, 1.4rem)', color: 'var(--color-snow)', lineHeight: 1.2, margin: 0 }}>
                      {selectedEvent.title}
                    </h3>
                  </div>
                  <div className="pcr" style={{ marginBottom: 'var(--space-4)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--color-ash-text)' }}>
                      ◎ {selectedEvent.place}
                    </span>
                  </div>
                  <div className="pcr" style={{ height: '1px', background: `linear-gradient(to right, ${color}60, transparent)`, marginBottom: 'var(--space-4)' }} />
                  <div className="pcr" style={{ marginBottom: selectedEvent.doc ? 'var(--space-4)' : 0 }}>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', lineHeight: 1.80, color: 'var(--color-snow-dim)', margin: 0 }}>
                      {selectedEvent.description}
                    </p>
                  </div>
                  {selectedEvent.doc && (
                    <div className="pcr">
                      <DocChip doc={selectedEvent.doc} color={color} onClick={() => setOpenDoc({ doc: selectedEvent.doc!, color })} />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ── Idle: chronicle overture ── */
              <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 'clamp(1.25rem, 2.2vw, 2rem)', backgroundColor: 'var(--color-deep-slate-mid)' }}>
                {/* Ambient rings */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{ position: 'absolute', top: '40%', left: '55%', transform: 'translate(-50%, -50%)', width: `${i * 90}px`, height: `${i * 90}px`, borderRadius: '50%', border: '1px solid rgba(201,123,43,0.06)', animation: `histPulse ${2.2 + i * 0.8}s ease-out infinite`, animationDelay: `${i * 0.7}s` }} />
                  ))}
                </div>

                {/* Top */}
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 5.5vw, 5rem)', fontWeight: 400, color: 'rgba(201,123,43,0.12)', lineHeight: 0.9, letterSpacing: '-0.03em', userSelect: 'none', marginBottom: 'var(--space-3)' }}>1339</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.20em', textTransform: 'uppercase', color: 'rgba(201,123,43,0.30)' }}>687 years of documented history</div>
                </div>

                {/* Category bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.entries(CATEGORY_COLORS).map(([cat, col]) => {
                    const count = categoryCounts[cat] ?? 0;
                    if (!count) return null;
                    return (
                      <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '20px', height: '1px', backgroundColor: col, opacity: 0.5, flexShrink: 0 }} />
                        <div style={{ flex: 1, height: '1px', background: `linear-gradient(to right, ${col}22, transparent)`, position: 'relative' }}>
                          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${(count / events.length) * 100}%`, background: `linear-gradient(to right, ${col}55, ${col}15)`, transition: 'width 0.8s ease' }} />
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.20em', textTransform: 'uppercase', color: col, opacity: 0.7, width: '80px', textAlign: 'right', flexShrink: 0 }}>
                          {count} {cat}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom */}
                <div>
                  <div style={{ height: '1px', background: 'linear-gradient(to right, rgba(201,123,43,0.25), transparent)', marginBottom: 'var(--space-4)' }} />
                  <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(0.8rem, 1.4vw, 1rem)', color: 'rgba(245,240,232,0.18)', lineHeight: 1.4, marginBottom: 'var(--space-3)' }}>
                    Every year carries the weight<br />of a people's endurance.
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.20em', textTransform: 'uppercase', color: 'rgba(201,123,43,0.35)' }}>
                    ← Select a moment to explore
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 5.5vw, 5rem)', fontWeight: 400, color: 'rgba(201,123,43,0.07)', lineHeight: 0.9, letterSpacing: '-0.03em', userSelect: 'none', marginTop: 'var(--space-3)', textAlign: 'right' }}>
                    2026
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>{/* end .hist-grid */}

        {/* LoC legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
          <div style={{ width: '24px', height: '1px', borderBottom: '1px dashed rgba(139,47,63,0.6)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--color-crimson-dim)' }}>
            Line of Control
          </span>
        </div>

      </div>{/* end .section-container */}

      <div className="section-mist-bottom" />

      {/* ── Responsive grid CSS ── */}
      <style>{`
        .hist-grid {
          display: grid;
          grid-template-columns: 30fr 46fr 24fr;
          height: clamp(560px, 72vh, 820px);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          overflow: hidden;
          column-gap: 1px;
          background: rgba(255,255,255,0.04);
        }
        .hist-rail {
          overflow-y: auto;
          height: 100%;
          scrollbar-width: thin;
          scrollbar-color: rgba(201,123,43,0.20) transparent;
          background: var(--color-base, #0a0c0f);
        }
        .hist-map-col {
          position: relative;
          height: 100%;
          background: var(--color-base, #0a0c0f);
        }
        .hist-panel {
          position: relative;
          height: 100%;
          overflow: hidden;
          background: var(--color-base, #0a0c0f);
        }
        @media (max-width: 1099px) {
          .hist-grid { grid-template-columns: 40% 60%; }
          .hist-panel { display: none; }
          .hist-map-col { border-right: none; }
        }
        @media (max-width: 767px) {
          .hist-grid { grid-template-columns: 1fr; height: auto; }
          .hist-map-col { height: 360px; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); }
          .hist-rail { height: clamp(360px, 45vh, 480px); border-right: none; }
          .hist-panel { display: none; }
        }
        @keyframes histPulse {
          0%   { transform: translate(-50%,-50%) scale(1);   opacity: 0.4; }
          100% { transform: translate(-50%,-50%) scale(3.2); opacity: 0;   }
        }
      `}</style>

      {openDoc && (
        <DocModal doc={openDoc.doc} color={openDoc.color} onClose={() => setOpenDoc(null)} />
      )}
    </section>
  );
}
