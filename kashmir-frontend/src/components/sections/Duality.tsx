'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CONFIG } from '@/lib/config';

/* ─────────────────────────────── Data ─────────────────────────────── */

interface Witness {
  id: string;
  role: string;
  label: string;
  description: string;
  image: string;
  objectPosition: string;
  revealMs: number;
  line1: string;
  line2: string;
  note: string;
  numeral: string;
}

const WITNESSES: Witness[] = [
  {
    id: 'journalist',
    role: 'THE UNTETHERED JOURNALIST',
    label: 'Journeying past the headlines to touch the open wounds',
    description: 'A relentless voyager seeking the unvarnished truth, navigating the fog of a fractured land to become a quiet vessel for its untold grief. Sitting face-to-face with shattered victims, a captive militant, and the weary guardians of Kashmir, this journey is a profound excavation of the human soul. With every steady question, the broken threads of the valley are woven together — bridging the agonizing chasm between those who bleed to protect it, those manipulated to destroy it, and those left mourning in the dark.',
    image: '/people/witness-01.png',
    objectPosition: '50% 20%',
    revealMs: 1800,
    line1: '"Beyond the curated broadcasts lies a forgotten landscape where grief wears no single uniform."',
    line2: '"My lens sought to understand the chaos, but captured instead the tragic portrait of a people bleeding from within."',
    note: 'Truth is the echo that remains long after the gunfire fades.',
    numeral: '01',
  },
  {
    id: 'deceived',
    role: 'THE DECEIVED',
    label: 'Waking to the quiet ashes of a borrowed war',
    description: 'His gaze carries the heavy, quiet wreckage of a shattered illusion. Lured across the mountains by whispered tales of an oppressed brotherhood, he was forged into an instrument for a holy war that only existed in the minds of his handlers. He brought borrowed fire to save a people he believed were suffering, only to find that the very hands that disarmed him belonged to the brothers he was sent to rescue. This is the terrifying reality of the unseen proxy war — a generation hollowed out by distant architects of chaos, who weaponize innocent devotion to burn a harmony they were told was already in ashes.',
    image: '/people/witness-02.png',
    objectPosition: '50% 25%',
    revealMs: 1600,
    line1: '"They gave me a fire to burn the chains of my brothers, but the only prisoner in the dark was me."',
    line2: '"I crossed a border to save my faith, only to realize the men who captured me were the ones actually protecting it."',
    note: 'The cruelest wars are fought with the weapons of manipulated devotion.',
    numeral: '02',
  },
  {
    id: 'waiting-father',
    role: 'THE WAITING FATHER',
    label: 'A solitary anchor in the quiet echoes of a stolen youth',
    description: 'At just fifteen, his son\'s innocent mind was hijacked — lured from the sanctuary of home and consumed by the fatal mirage of extremism. Today, this father stands entirely alone in the quiet devastation of a shattered house. Broken by the waiting, the boy\'s mother lies permanently bedridden, her mind fractured by a grief too heavy to bear. Left to navigate these ruins, the father carries an impossible tragedy: knowing his boy is still out there, yet irreparably lost to an ideology that burned the only bridge back to the family who loves him.',
    image: '/people/witness-03.png',
    objectPosition: '50% 20%',
    revealMs: 2000,
    line1: '"His son called him once... He begged the boy for just one final meeting, but the voice on the line whispered that the shadows he chose allow no return."',
    line2: '"Grief has shattered his mother\'s reality. Bedridden and a ghost in her own home, she endlessly begs the empty walls to give back her little boy."',
    note: 'Extremism\'s cruelest theft is erasing a child\'s path back to the arms that raised him.',
    numeral: '03',
  },
  {
    id: 'fatherless',
    role: 'A FATHERLESS WORLD',
    label: 'Inheriting a cold reality and an agonizing, unanswered question',
    description: 'The familiar footsteps they waited for will never arrive. He was a dedicated policeman returning from his shift — a man defined by his unwavering duty and the fierce, sheltering love he poured into his daughters. Now, they are thrust into a sudden, terrifying reality. Their home, once kept safe by his warmth, is entirely hollowed out by his violent erasure. Stripped of his profound love, these girls are forced to walk into a daunting future without their protector, carrying the brutal weight of a single question: what was his fault, other than standing as an uncompromising shield of law against those who crave violence?',
    image: '/people/witness-04.png',
    objectPosition: '50% 30%',
    revealMs: 2200,
    line1: '"What was his fault? That he stood for the law and became a hurdle for those who bring terror? He only wanted to protect his people and bring his love home to us."',
    line2: '"God took our angel back. A soul that pure was never meant to bleed in a world this dark."',
    note: 'The heaviest price of duty is paid by the daughters left waiting for a love that will never return.',
    numeral: '04',
  },
  {
    id: 'mothers-stolen-son',
    role: "A MOTHER'S STOLEN SON",
    label: 'When years of family sacrifice are erased by militant brainwashing',
    description: 'She endured years of crushing poverty to educate him, trusting he would be the one to finally pull their family out of hardship. He was the heartbeat of their home — a devoted son who would walk through the door and immediately call out for his mother. But at twenty-two, everything she built was erased. Brainwashed by extremists, he turned his back on the parents who starved to raise him. He abandoned his education and his mother\'s unconditional love for a violent path, leaving her to mourn a boy who is still alive but entirely lost to them.',
    image: '/people/witness-05.png',
    objectPosition: '50% 20%',
    revealMs: 1600,
    line1: '"He wouldn\'t rest until he heard my voice. How did they convince my boy that a gun was worth more than his mother?"',
    line2: '"We starved to buy his books and build his future. In a single day, they poisoned his mind and took it all away."',
    note: 'The deepest tragedy of radicalization is the family left behind to mourn a living son.',
    numeral: '05',
  },
  {
    id: 'cost-of-uniform',
    role: 'THE COST OF THE UNIFORM',
    label: "A daughter's grief for a protector lost to manipulated hate",
    description: 'He wore his uniform to uphold the law and his turban with unwavering pride. On a routine journey, his bus was intercepted by a crowd weaponized by foreign extremists who distort the peaceful tenets of faith to sow chaos. Targeted solely for being a Sikh law enforcer, he was dragged into the street and relentlessly beaten with stones and rods. The trauma was so profound that doctors recorded a rare medical anomaly: his heart physically ruptured from the blunt force. He fell not to a clash of religions, but to a violent mirage orchestrated by those who profit from a fractured society.',
    image: '/people/witness-06.png',
    objectPosition: '50% 25%',
    revealMs: 2000,
    line1: '"The stones that physically ruptured his heart were thrown by hands guided by a borrowed hatred."',
    line2: '"He lived to guard their peace, yet died at their hands — a protector sacrificed to a violent lie masquerading as faith."',
    note: 'The deepest tragedy of a hijacked narrative is watching a community destroy its own shield.',
    numeral: '06',
  },
  {
    id: 'heaviest-shoulder',
    role: 'THE HEAVIEST SHOULDER',
    label: "A shattered patriarch caught between his daughter's wedding and his son's final rites",
    description: "He raised his boy to proudly wear the police uniform and continue their family's legacy, resting in the quiet comfort that this strong son would one day carry him to his final rest. But time delivered a crushing betrayal. On the exact morning their home awoke for his daughter's wedding — a date lovingly fixed by the brother she just lost — an aging father was forced to shoulder his child's casket instead. Wiping his tears in a house dressed for a celebration, he finds his only anchor in faith, surrendering to a heartbreaking truth: his son was a sacred gift from Allah, and the ultimate test of a father's love is yielding that blessing back to the Creator.",
    image: '/people/witness-07.png',
    objectPosition: '50% 20%',
    revealMs: 1800,
    line1: '"He was the one who fixed the date for his sister\'s wedding. We awoke expecting to celebrate, only to carry my boy out of a house still draped in flowers."',
    line2: '"You raise a boy trusting he will carry you at the end. You never prepare to carry him."',
    note: 'The cruelest theft of time is a father shouldering the child who was meant to carry him home.',
    numeral: '07',
  },
  {
    id: 'war-beyond-trigger',
    role: 'THE WAR BEYOND THE TRIGGER',
    label: 'Dismantling the roots of radicalization to salvage the soul of a generation',
    description: "The true weight of command in Kashmir is measured not by casualties, but by the fragile lives pulled back from radicalization. For this officer, the conflict hinges on deconstructing a single word: Terror-ism. While physical terror can be swiftly neutralized by military might, the ism — a deeply entrenched, heavily funded nexus of radical ideology — is the true enemy. Dismantling this toxic network demands immense restraint. Even during intense gunfights, his forces will pause to let families plead for surrenders, prioritizing the fight to salvage a generation's soul over the finality of a bullet.",
    image: '/people/witness-08.png',
    objectPosition: '50% 20%',
    revealMs: 1800,
    line1: '"I am not interested in terrorists killed. My pride is in how many we pull back from the fringe of becoming one."',
    line2: '"Force easily erases the \'terror.\' It is the \'ism\' — the entrenched belief system — that we must strike at the core."',
    note: 'True victory lies not in silencing the gun, but in dismantling the ideology that loaded it.',
    numeral: '08',
  },
  {
    id: 'final-resort',
    role: 'THE FINAL RESORT',
    label: 'When peace is rejected, the uncompromising might of the military becomes the absolute answer',
    description: 'When intelligence pinpoints a hidden threat in the dead of night, the fragile silence of the valley is shattered by the calculated breach of a surgical strike. This is the raw, visceral reality of a close-quarters hunt through claustrophobic corridors, where elite operators confront heavily armed radicals hiding among the vulnerable. In these pitch-black rooms, there is no time for negotiation; the armed forces step directly into the lethal crossfire, absorbing the ultimate risk to ensure the innocent families trapped nearby survive to see the dawn.',
    image: '/people/witness-09.png',
    objectPosition: '50% 30%',
    revealMs: 1800,
    line1: '"We offer every chance for peace, but when they choose violence, we answer with absolute might. The terror will end; they only get to choose how."',
    line2: '"We are the final wall between chaos and the innocent. If they refuse to drop their weapons, we bring the darkness to ensure they never hold them again."',
    note: 'Terror will always meet its end; when peace is refused, absolute force is the final consequence.',
    numeral: '09',
  },
];

/* ──────────────────────── Ember system ──────────────────────── */

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number;
}

class EmberSystem {
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private raf: number | null = null;
  private last = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.tick = this.tick.bind(this);
  }

  burst(canvas: HTMLCanvasElement, count: number, spreadX = 0) {
    const originX = canvas.width * 0.625;
    for (let i = 0; i < count; i++) {
      window.setTimeout(() => {
        this.particles.push({
          x: originX + (Math.random() - 0.5) * Math.max(spreadX, 8),
          y: canvas.height * (0.2 + Math.random() * 0.6),
          vx: (Math.random() - 0.5) * 1.6,
          vy: -(0.9 + Math.random() * 1.8),
          life: 1400 + Math.random() * 700,
          maxLife: 2100,
        });
        if (!this.raf) this.raf = requestAnimationFrame(this.tick);
      }, i * 115);
    }
  }

  private tick(t: number) {
    const dt = Math.min(t - this.last, 50);
    this.last = t;
    const { ctx } = this;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) { this.particles.splice(i, 1); continue; }
      p.x += p.vx;
      p.y += p.vy;
      p.vx += Math.sin(t * 0.0018 + i) * 0.05;
      const alpha = (p.life / p.maxLife) * 0.9;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,123,43,${alpha.toFixed(2)})`;
      ctx.fill();
    }
    if (this.particles.length > 0) {
      this.raf = requestAnimationFrame(this.tick);
    } else {
      this.raf = null;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  }

  destroy() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
    this.particles = [];
  }
}

/* ──────────────────────────── Component ──────────────────────────── */

export default function Duality() {

  /* ── DOM refs ── */
  const wrapperRef    = useRef<HTMLDivElement>(null);
  const stickyRef     = useRef<HTMLDivElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const curtainRef    = useRef<HTMLDivElement>(null);   // portrait dark bloom curtain
  const locRef        = useRef<HTMLDivElement>(null);   // Line of Control divider
  const rippleRef     = useRef<HTMLDivElement>(null);   // ripple container
  const blackoutDivRef = useRef<HTMLDivElement>(null);  // full-screen black cut overlay

  /* ── Mutable state refs (no re-render needed) ── */
  const lockRef        = useRef(false);
  const witnessIdxRef  = useRef(0);
  const exitRef        = useRef(false);
  const exitPhaseRef   = useRef(-1);   // mirrors exitPhase state, readable in wheel handler
  const timersRef      = useRef<number[]>([]);
  const rippleIntervalRef = useRef<number | null>(null);
  const emberRef          = useRef<EmberSystem | null>(null);
  const sectionPassedRef       = useRef(false);                // true once user has passed through the section once
  const reviewModeRef          = useRef(false);               // mirrors reviewMode, readable in wheel handler
  const lenisStoppedRef        = useRef(false);               // true when we stopped Lenis; restored on exit
  const reviewSelectedRef      = useRef<number | null>(null); // mirrors reviewSelected
  const pendingDirRef          = useRef(0);                   // scroll direction queued while lockRef is true
  const pendingGalleryTimerRef = useRef<number | null>(null); // auto-gallery transition timer id
  const galleryJustOpenedRef   = useRef(false); // true for 600ms after gallery first activates, so it's visible before exit
  const lockedEventCountRef    = useRef(0);     // count of ↓ scroll events received while locked; ≥4 triggers auto-advance on lock release
  const lastWitnessHoldRef     = useRef(false); // true after first ↓ scroll on last witness; second scroll exits

  /* ── React state (drives renders) ── */
  const [witnessIdx,    setWitnessIdx]    = useState(0);
  const [step,          setStep]          = useState(0);
  const [entryVisible,  setEntryVisible]  = useState(false);
  const [exitPhase,     setExitPhase]     = useState(-1);
  const [reviewMode,    setReviewMode]    = useState(false);
  const [reviewSelected,setReviewSelected]= useState<number | null>(null);
  const [galleryHover,  setGalleryHover]  = useState<number | null>(null);
  const isMobileGallery = typeof window !== 'undefined' && window.innerWidth < 768;

  /* ── Stable function refs (latest version available to effects) ── */
  const activateRef = useRef<(idx: number, instant?: boolean) => void>(() => {});
  const advanceRef  = useRef<(next: number) => void>(() => {});
  const exitTrigRef = useRef<() => void>(() => {});

  /* ── Helper: schedule a timer, track it for cleanup ── */
  function scheduleTimer(ms: number, fn: () => void): number {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }

  function clearAllTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  function stopRippleInterval() {
    if (rippleIntervalRef.current !== null) {
      clearInterval(rippleIntervalRef.current);
      rippleIntervalRef.current = null;
    }
  }

  // Instantly black the screen (no CSS transition — overrides any in-progress fade).
  // Uses scheduleTimer so clearAllTimers() can cancel the callback before it fires.
  function fastBlack(onFull: () => void) {
    const el = blackoutDivRef.current;
    if (!el) { onFull(); return; }
    el.style.transition = 'none';
    el.style.opacity = '1';
    scheduleTimer(32, onFull); // ~2 frames: browser paints full-black, then we snap
  }

  // Fade the black overlay back to clear (smooth 0.55s ease).
  function fastReveal() {
    const el = blackoutDivRef.current;
    if (!el) return;
    el.style.transition = 'opacity 0.55s ease';
    el.style.opacity = '0';
  }

  // Slow cinematic fade to black (used for the final exit, not witness cuts).
  function slowBlack(onFull: () => void) {
    const el = blackoutDivRef.current;
    if (!el) { onFull(); return; }
    el.style.transition = 'opacity 1.2s ease';
    el.style.opacity = '1';
    scheduleTimer(1200, onFull);
  }

  // Medium fade to black (used for gallery exit — faster than slowBlack, softer than fastBlack).
  function mediumBlack(onFull: () => void) {
    const el = blackoutDivRef.current;
    if (!el) { onFull(); return; }
    el.style.transition = 'opacity 0.5s ease';
    el.style.opacity = '1';
    scheduleTimer(500, onFull);
  }

  // Slow reveal — used after the exit fade so the conclusion text eases in gently.
  function slowReveal() {
    const el = blackoutDivRef.current;
    if (!el) return;
    el.style.transition = 'opacity 1.0s ease';
    el.style.opacity = '0';
  }

  function handleGallerySelect(idx: number) {
    reviewSelectedRef.current = idx;
    setReviewSelected(idx);
    // activateRef is called from the useEffect([reviewSelected]) below,
    // after React has re-rendered and curtainRef is attached.
  }

  function handleGalleryBack() {
    clearAllTimers();
    stopRippleInterval();
    lockRef.current = false;
    pendingDirRef.current = 0;
    setStep(0);
    reviewSelectedRef.current = null;
    setReviewSelected(null);
  }

  /* ── Portrait bloom: dark curtain fades from opaque to clear ── */
  function bloomPortrait(revealMs: number) {
    const el = curtainRef.current;
    if (!el) return;
    // Reset to full dark, no transition
    el.style.transition = 'none';
    el.style.opacity    = '1';
    // Double RAF ensures browser processes the reset before starting the transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!curtainRef.current) return;
        el.style.transition = `opacity ${revealMs}ms cubic-bezier(0.25,0.46,0.45,0.94)`;
        el.style.opacity    = '0';
      });
    });
  }

  /* ── Line of Control color warmth ── */
  function setLocWarmth(stepVal: number) {
    const el = locRef.current;
    if (!el) return;
    const warmth = [
      'rgba(245,240,232,0.07)',
      'rgba(201,123,43,0.14)',
      'rgba(201,123,43,0.27)',
      'rgba(201,123,43,0.42)',
    ];
    el.style.transition       = 'background-color 0.5s ease';
    el.style.backgroundColor  = warmth[Math.min(stepVal, warmth.length - 1)];
  }

  function pulseLOC() {
    const el = locRef.current;
    if (!el) return;
    el.style.transition      = 'background-color 0.12s ease';
    el.style.backgroundColor = 'rgba(139,47,63,0.82)';
    window.setTimeout(() => {
      if (!locRef.current) return;
      el.style.transition      = 'background-color 0.75s ease';
      el.style.backgroundColor = 'rgba(201,123,43,0.35)';
    }, 260);
  }

  /* ── Add a single saffron ripple at a random position ── */
  function addRipple() {
    const container = rippleRef.current;
    if (!container) return;
    const div = document.createElement('div');
    const x   = 4 + Math.random() * 92;
    const y   = 4 + Math.random() * 92;
    div.style.cssText = `
      position: absolute;
      left: ${x}%;
      top: ${y}%;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(201,123,43,0.3);
      box-shadow: 0 0 10px rgba(201,123,43,0.2);
      transform: translate(-50%,-50%) scale(0);
      animation: duality-ripple 2.4s ease-out forwards;
      pointer-events: none;
    `;
    container.appendChild(div);
    window.setTimeout(() => {
      if (container.contains(div)) container.removeChild(div);
    }, 2400);
  }

  /* ─────────────────────────────────────────────────────────────────
     activateWitness — bloom portrait, run testimony timer chain
     Reassigned every render so it always has fresh closures.
  ───────────────────────────────────────────────────────────────── */
  activateRef.current = function activateWitness(idx: number, instant = false) {
    lockRef.current = true;
    clearAllTimers();
    stopRippleInterval();

    witnessIdxRef.current = idx;
    setWitnessIdx(idx);
    setStep(0);
    setLocWarmth(0);

    const w = WITNESSES[idx];
    if (instant) {
      // Portrait already covered by blackout — open curtain immediately so it's
      // fully visible the moment fastReveal clears the blackout overlay.
      const curtain = curtainRef.current;
      if (curtain) { curtain.style.transition = 'none'; curtain.style.opacity = '0'; }
    } else {
      bloomPortrait(w.revealMs);
    }

    // Testimony reveal chain
    scheduleTimer(600,  () => { setStep(1); setLocWarmth(1); });
    scheduleTimer(1200, () => { setStep(2); setLocWarmth(2); });
    scheduleTimer(1900, () => { setStep(3); setLocWarmth(3); });
    scheduleTimer(2700, () => {
      setStep(4);
      pulseLOC();
      if (emberRef.current && canvasRef.current) {
        emberRef.current.burst(canvasRef.current, 12, 30);
      }
    });

    // Last witness: auto-trigger exit after reading time (cancelled if user scrolls first)
    if (idx === WITNESSES.length - 1) {
      scheduleTimer(2700 + 600, () => {
        if (!exitRef.current && !lockRef.current) exitTrigRef.current();
      });
    }

    // Ambient ripples start after portrait has revealed
    scheduleTimer(w.revealMs + 500, () => {
      stopRippleInterval();
      addRipple();
      rippleIntervalRef.current = window.setInterval(addRipple, 3000);
    });

    scheduleTimer(150, () => {
      lockRef.current = false;
      const eventCount = lockedEventCountRef.current;
      lockedEventCountRef.current = 0;
      const pending = pendingDirRef.current;
      pendingDirRef.current = 0;
      if (pending !== 0) {
        const next = witnessIdxRef.current + pending;
        if (next < 0) return;
        if (next > 8) { exitTrigRef.current(); return; }
        advanceRef.current(next);
        return;
      }
      // Auto-advance: ≥10 rapid events arrived while locked but no deliberate gesture was
      // detected. Threshold 10 distinguishes sustained rapid scrolling (16ms intervals →
      // 16 events/lock) from a normal deliberate scroll with residual momentum ticks (≤8
      // events in a 262ms window). Without this, rapid scrollers get stuck mid-section when
      // their momentum runs out inside a lock window.
      if (eventCount >= 10 && !exitRef.current) {
        const next = witnessIdxRef.current + 1;
        if (next > 8) { exitTrigRef.current(); return; }
        advanceRef.current(next);
      }
    });
  };

  /* ─────────────────────────────────────────────────────────────────
     advanceToWitness — documentary cut → swap → bloom
  ───────────────────────────────────────────────────────────────── */
  advanceRef.current = function advanceToWitness(next: number) {
    if (lockRef.current) return;
    lockRef.current = true;

    clearAllTimers();
    stopRippleInterval();
    setStep(0);

    // Black flash covers the swap; portrait curtain opens instantly so the photo
    // is fully visible the moment the blackout fades — no slow bloom delay.
    fastBlack(() => {
      scheduleTimer(80, () => {
        fastReveal();
        activateRef.current(next, true);
      });
    });
  };

  /* ─────────────────────────────────────────────────────────────────
     triggerExit — 5-phase exit sequence
  ───────────────────────────────────────────────────────────────── */
  exitTrigRef.current = function triggerExit() {
    if (lockRef.current || exitRef.current) return;
    lockRef.current = true;
    exitRef.current = true;

    clearAllTimers();
    stopRippleInterval();
    // Testimony stays visible — setStep(0) deferred until screen is fully black

    // Slow cinematic fade while testimony is still showing — dissolve, not a cut
    slowBlack(() => {
      setStep(0); // clear testimony now that screen is fully dark
      scheduleTimer(150, () => {
        // Skip portrait grid entirely — reveal the Nine Voices statement directly
        setExitPhase(2); exitPhaseRef.current = 2;
        slowReveal(); // ease gently back in over 1s
      });
    });

    // Film title — 900ms after statement visible (~t=2250ms)
    scheduleTimer(2250, () => { setExitPhase(3); exitPhaseRef.current = 3; });
    // CTA + unlock — 900ms after film title (~t=3150ms)
    scheduleTimer(3150, () => {
      setExitPhase(4); exitPhaseRef.current = 4;
      lockRef.current = false;
      pendingGalleryTimerRef.current = window.setTimeout(() => {
        pendingGalleryTimerRef.current = null;
        if (!reviewModeRef.current) {
          reviewModeRef.current = true;
          setReviewMode(true);
          setReviewSelected(null);
          reviewSelectedRef.current = null;
          sectionPassedRef.current = true;
        }
      }, 800);
    });
  };

  /* ─────────────────────────────────────────────────────────────────
     Main mount effect — event listeners, observers, canvas
  ───────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const sticky  = stickyRef.current;
    const canvas  = canvasRef.current;
    if (!wrapper || !sticky || !canvas) return;

    // Ember canvas
    const ctx = canvas.getContext('2d');
    if (ctx) emberRef.current = new EmberSystem(ctx);

    // Size canvas to sticky panel
    function resizeCanvas() {
      if (!canvas || !sticky) return;
      canvas.width  = sticky.offsetWidth;
      canvas.height = sticky.offsetHeight;
    }
    resizeCanvas();
    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(sticky);

    // Jump to scroll position y for exit scrolls.
    // Lenis.onWheel does NOT check event.defaultPrevented, so e.preventDefault() alone doesn't
    // stop Lenis from scrolling. Instead we call lenis.stop() when the section is pinned.
    // On exit we restart Lenis from the new position so normal smooth scroll resumes.
    function lenisExitTo(y: number) {
      const lenis = (window as any).lenis;
      window.scrollTo({ top: y, behavior: 'instant' });
      if (lenis && lenisStoppedRef.current) {
        lenisStoppedRef.current = false;
        lenis.start();
      }
    }


    // Entry: trigger once when section scrolls into view
    let entered = false;
    let entryComplete = false; // true once entry card finishes and witness 0 loads
    let entrySkipped  = false; // set when user scrolls to skip the entry card

    function skipEntryCard() {
      entrySkipped  = true;
      entryComplete = true;
      setEntryVisible(false);
      activateRef.current(0);
    }

    // Immediate section exit: pending already queued + another scroll = user wants out
    function bypass() {
      pendingDirRef.current = 0;
      lockedEventCountRef.current = 0;
      clearAllTimers();
      stopRippleInterval();
      lockRef.current = false;
      exitRef.current = true;
      exitPhaseRef.current = 4;
      setExitPhase(4);
      setStep(0);
      sectionPassedRef.current = true;
      // Show gallery immediately so the section doesn't render as an empty black screen
      reviewModeRef.current = true;
      setReviewMode(true);
      setReviewSelected(null);
      reviewSelectedRef.current = null;
      leavingUpward = true;
      fastBlack(() => {
        // Past sticky-release point: wrapper.bottom - vh + 21 → isStuck()=false immediately
        const exitY = wrapper!.offsetTop + wrapper!.offsetHeight - window.innerHeight + 21;
        lenisExitTo(exitY);
        scheduleTimer(80, () => {
          fastReveal();
          leavingUpward = false;
        });
      });
    }

    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || entered) return;
      entered = true;
      lockRef.current = true; // hold scroll during entry card
      setEntryVisible(true);
      window.setTimeout(() => {
        if (entrySkipped) return;
        setEntryVisible(false);
        window.setTimeout(() => {
          if (entrySkipped) return;
          entryComplete = true;
          activateRef.current(0);
        }, 300);
      }, 1400);
    }, { threshold: 0.06 });
    io.observe(wrapper);

    // Determine if sticky section is currently pinned
    function isStuck(): boolean {
      if (!wrapper) return false;
      const r = wrapper.getBoundingClientRect();
      return r.top <= 20 && r.bottom >= window.innerHeight - 20;
    }

    // Wheel capture — prevents Lenis from processing scroll while section is active
    let lastWheelTime = 0;  // timestamp of last dir≠0 wheel event — used to detect new gestures
    let leavingUpward = false; // true while smooth upward exit scroll is in progress

    function handleWheel(e: WheelEvent) {
      if (!isStuck()) return;

      // Stop Lenis while the section is pinned. Lenis.onVirtualScroll checks isStopped and
      // exits early — unlike defaultPrevented which Lenis ignores entirely.
      const lenis = (window as any).lenis;
      if (lenis && !lenis.isStopped) { lenis.stop(); lenisStoppedRef.current = true; }
      e.preventDefault();

      const dir = e.deltaY > 25 ? 1 : e.deltaY < -25 ? -1 : 0;
      if (dir === 0) return;

      // Gap since last meaningful scroll event. Trackpad momentum fires at ~16ms intervals.
      // A gap > 100ms means the user started a new deliberate gesture.
      const now = Date.now();
      const gap = now - lastWheelTime;
      lastWheelTime = now;

      // Block all input while the upward exit scroll is animating
      if (leavingUpward) { e.preventDefault(); return; }
      // Block exit for 600ms after gallery first opens — gives React time to render it visibly
      if (galleryJustOpenedRef.current) { e.preventDefault(); return; }

      // ── Post-experience: gallery shows persistently, one scroll exits ───────
      // After the user has passed through the section once (slow, one-by-one,
      // or rapid bypass), gallery is the permanent state. Any scroll in either
      // direction exits in one clean cut. Gallery images are still clickable;
      // one scroll while a detail is open closes it and returns to gallery,
      // the next scroll exits. reviewMode is left true so gallery renders
      // immediately on the next re-entry without a witness-view flash.
      if (sectionPassedRef.current) {
        e.preventDefault();

        // Ensure gallery mode is active (handles re-entry after bypass where
        // reviewMode may still be false from the initial session state).
        // On first activation this turn: show gallery for 600ms before allowing exit,
        // so the user actually sees it rather than zooming through on the entry scroll.
        if (!reviewModeRef.current) {
          reviewModeRef.current = true;
          setReviewMode(true);
          reviewSelectedRef.current = null;
          setReviewSelected(null);
          galleryJustOpenedRef.current = true;
          window.setTimeout(() => { galleryJustOpenedRef.current = false; }, 600);
          return;
        }

        // Witness detail open → close it, stay in gallery (next scroll exits)
        if (reviewSelectedRef.current !== null) {
          clearAllTimers();
          stopRippleInterval();
          setStep(0);
          reviewSelectedRef.current = null;
          setReviewSelected(null);
          return;
        }

        // Gallery overview → soft exit; reviewMode stays true for re-entry
        leavingUpward = true;
        lockRef.current = true;
        mediumBlack(() => {
          const exitY = dir === 1
            ? wrapper!.offsetTop + wrapper!.offsetHeight - window.innerHeight + 21
            : Math.max(0, wrapper!.offsetTop - 30);
          lenisExitTo(exitY);
          scheduleTimer(80, () => {
            fastReveal();
            lockRef.current = false;
            leavingUpward = false;
          });
        });
        return;
      }

      // ── Exit-sequence handling ──────────────────────────────────────
      if (exitRef.current) {
        if (exitPhaseRef.current < 4) {
          // Only skip to phase 4 on a deliberate gesture — momentum must not snap through
          if (dir === 1 && gap > 200) {
            clearAllTimers();
            fastReveal();
            setExitPhase(4); exitPhaseRef.current = 4;
            lockRef.current = false;
            // Gallery auto-appears after CTA (shorter delay since user is impatient)
            pendingGalleryTimerRef.current = window.setTimeout(() => {
              pendingGalleryTimerRef.current = null;
              if (!reviewModeRef.current) {
                reviewModeRef.current = true;
                setReviewMode(true);
                setReviewSelected(null);
                reviewSelectedRef.current = null;
                sectionPassedRef.current = true;
              }
            }, 600);
          }
          e.preventDefault();
          return;
        }

        // Phase 4: CTA visible. ↓ scroll immediately shows gallery (or gallery auto-appears after timer).
        if (dir === 1) {
          if (pendingGalleryTimerRef.current !== null) {
            window.clearTimeout(pendingGalleryTimerRef.current);
            pendingGalleryTimerRef.current = null;
          }
          if (!reviewModeRef.current) {
            reviewModeRef.current = true;
            setReviewMode(true);
            setReviewSelected(null);
            reviewSelectedRef.current = null;
            sectionPassedRef.current = true;
            // Prevent immediate ↑ bounce from flipping back to CTA
            leavingUpward = true;
            window.setTimeout(() => { leavingUpward = false; }, 500);
          }
          e.preventDefault();
          return;
        }

        // ↑ at phase 4: snap above section for fast upward pass-through
        if (window.scrollY > wrapper!.offsetTop) {
          e.preventDefault();
          leavingUpward = true;
          lockRef.current = true;
          fastBlack(() => {
            // 30px above sticky top boundary → isStuck()=false immediately
            const topY = Math.max(0, wrapper!.offsetTop - 30);
            lenisExitTo(topY);
            scheduleTimer(80, () => {
              fastReveal();
              lockRef.current = false;
              leavingUpward = false;
            });
          });
        }
        return;
      }

      // ── Normal witness navigation ────────────────────────────────────
      const next = witnessIdxRef.current + dir;

      // ↑: navigate backwards through witnesses; exit above when at witness 0
      if (dir === -1) {
        if (witnessIdxRef.current <= 0) {
          // At witness 0 (or sentinel): set sentinel so re-entry starts fresh from witness 0,
          // then let Lenis exit naturally if near the top, or snap above if deep inside.
          witnessIdxRef.current = -1;
          if (window.scrollY <= wrapper!.offsetTop + 60) return;
          e.preventDefault();
          leavingUpward = true;
          lockedEventCountRef.current = 0;
          lockRef.current = true;
          fastBlack(() => {
            const topY = Math.max(0, wrapper!.offsetTop - 30);
            lenisExitTo(topY);
            scheduleTimer(80, () => { fastReveal(); lockRef.current = false; leavingUpward = false; });
          });
          return;
        }
        // At witness N > 0: go back one witness instead of exiting
        e.preventDefault();
        pendingDirRef.current = 0;
        lockedEventCountRef.current = 0;
        lastWitnessHoldRef.current = false;
        advanceRef.current(witnessIdxRef.current - 1);
        return;
      }

      if (next < 0) return;

      e.preventDefault();

      if (lockRef.current) {
        if (!entryComplete) {
          if (dir === 1) skipEntryCard();
          return;
        }
        if (dir === 1) {
          lockedEventCountRef.current++; // count rapid ↓ events; ≥4 triggers auto-advance on lock release
          // gap > 200ms = deliberate new gesture (not trackpad momentum at 16ms).
          // First such scroll while locked queues a pending advance.
          // Second fires bypass — user clearly wants to exit, not just advance.
          if (gap > 200) {
            if (pendingDirRef.current !== 0) {
              bypass();
            } else {
              pendingDirRef.current = dir;
            }
          }
        }
        return;
      }

      if (next > 8) {
        // Only trigger exit on a fresh deliberate gesture (gap > 200ms).
        // This blocks trackpad momentum that continues after arriving at the last image,
        // without requiring a mechanical two-step that feels like a stutter.
        if (gap <= 200) {
          e.preventDefault();
          return;
        }
        lastWitnessHoldRef.current = false;
        exitTrigRef.current();
        return;
      }

      lastWitnessHoldRef.current = false;
      if (next === witnessIdxRef.current) return;
      advanceRef.current(next);
    }

    // Touch support
    let touchStartY = 0;
    function onTouchStart(e: TouchEvent) { touchStartY = e.touches[0].clientY; }
    function onTouchEnd(e: TouchEvent) {
      const dy = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(dy) < 50) return;
      handleWheel({ deltaY: dy > 0 ? 80 : -80, preventDefault() {} } as WheelEvent);
    }

    // capture:true fires our handler BEFORE Lenis (which uses non-capture),
    // so e.preventDefault() actually prevents Lenis from scrolling the page
    // while the section is active.
    window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend',   onTouchEnd,   { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel, { capture: true });
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      ro.disconnect();
      io.disconnect();
      emberRef.current?.destroy();
      timersRef.current.forEach(clearTimeout);
      if (rippleIntervalRef.current !== null) clearInterval(rippleIntervalRef.current);
      if (pendingGalleryTimerRef.current !== null) window.clearTimeout(pendingGalleryTimerRef.current);
    };
  }, []);

  /* Activate testimony after React mounts the witness view (curtainRef attaches) */
  useEffect(() => {
    if (!reviewMode || reviewSelected === null) return;
    activateRef.current(reviewSelected);
  }, [reviewMode, reviewSelected]);

  /* ──────────────────────────── Render ──────────────────────────── */

  const w = WITNESSES[witnessIdx];

  return (
    <div
      id="duality"
      ref={wrapperRef}
      style={{ height: '900vh', position: 'relative', zIndex: 1 }}
    >
      {/* ── Sticky viewport: pins while wrapper scrolls ── */}
      <div
        ref={stickyRef}
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
          backgroundColor: 'var(--color-deep-slate)',
        }}
      >
        {/* Ember canvas — full sticky surface */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 6,
            pointerEvents: 'none',
          }}
        />

        {/* Documentary-cut black curtain — controlled via blackoutDivRef, not React state */}
        <div
          ref={blackoutDivRef}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            backgroundColor: '#000',
            opacity: 0,
            pointerEvents: 'none',
          }}
        />

        {/* ══════════════════ WITNESS VIEW ══════════════════ */}
        {(exitPhase < 0 || (reviewMode && reviewSelected !== null)) && (
          <div
            className="duality-layout"
            style={{
              position: 'absolute',
              inset: '16px',
              display: 'flex',
              overflow: 'hidden',
            }}
          >

            {/* ── LEFT PANEL: Portrait ── */}
            <div
              className="duality-portrait"
              style={{
                flex: '0 0 62%',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* All portraits preloaded and stacked; only current is visible */}
              {WITNESSES.map((wd, i) => (
                <div
                  key={wd.id}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: i === witnessIdx ? 1 : 0,
                  }}
                >
                  <Image
                    src={wd.image}
                    alt={`${wd.role}`}
                    fill
                    sizes="62vw"
                    quality={88}
                    priority={i === 0}
                    loading={i === 0 ? undefined : 'eager'}
                    style={{
                      objectFit: 'cover',
                      objectPosition: wd.objectPosition,
                    }}
                  />
                </div>
              ))}

              {/* Dark bloom curtain — animated via direct DOM in bloomPortrait() */}
              <div
                ref={curtainRef}
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 2,
                  backgroundColor: 'var(--color-deep-slate)',
                  opacity: 1,
                  pointerEvents: 'none',
                }}
              />

              {/* Ambient ripple container */}
              <div
                ref={rippleRef}
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 3,
                  overflow: 'hidden',
                  pointerEvents: 'none',
                }}
              />

              {/* Merge gradient → right edge */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 4,
                  background:
                    'linear-gradient(to right, transparent 50%, rgba(6,8,10,0.72) 100%)',
                  pointerEvents: 'none',
                }}
              />

              {/* Vignette frame */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 4,
                  background:
                    'radial-gradient(ellipse 78% 84% at 50% 50%, transparent 32%, rgba(0,0,0,0.58) 100%)',
                  pointerEvents: 'none',
                }}
              />

              {/* 7-dot film-strip progress */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '1.5rem',
                  left: '1.75rem',
                  zIndex: 5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  opacity: step >= 1 ? 1 : 0,
                  transition: 'opacity 0.6s ease',
                }}
              >
                {WITNESSES.map((_, di) => (
                  <div
                    key={di}
                    style={{
                      width: di === witnessIdx ? '7px' : '5px',
                      height: di === witnessIdx ? '7px' : '5px',
                      borderRadius: '50%',
                      flexShrink: 0,
                      backgroundColor:
                        di === witnessIdx
                          ? 'rgba(201,123,43,1)'
                          : di < witnessIdx
                          ? 'rgba(201,123,43,0.38)'
                          : 'rgba(245,240,232,0.14)',
                      boxShadow:
                        di === witnessIdx ? '0 0 7px rgba(201,123,43,0.6)' : 'none',
                      transition:
                        'width 0.35s ease, height 0.35s ease, background-color 0.35s ease, box-shadow 0.35s ease',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* ── LINE OF CONTROL ── */}
            <div
              ref={locRef}
              className="duality-loc"
              style={{
                flex: '0 0 1px',
                position: 'relative',
                zIndex: 2,
                backgroundColor: 'rgba(245,240,232,0.07)',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) rotate(-90deg)',
                  transformOrigin: 'center center',
                  whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '8px',
                  letterSpacing: '0.20em',
                  textTransform: 'uppercase',
                  color: 'rgba(139,47,63,0.5)',
                  userSelect: 'none',
                }}
              >
                Line of Control
              </div>
            </div>

            {/* ── RIGHT PANEL: Testimony ── */}
            <div
              className="duality-testimony"
              style={{
                flex: 1,
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: 'rgba(6,8,10,0.88)',
              }}
            >
              {/* Editorial numeral watermark */}
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  bottom: '-0.08em',
                  right: '0.04em',
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: 'clamp(8rem, 18vw, 16rem)',
                  lineHeight: 1,
                  color: 'var(--color-snow)',
                  opacity: 0.042,
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              >
                {w.numeral}
              </div>

              {/* Section eyebrow — static */}
              <div
                style={{
                  position: 'absolute',
                  top: '2rem',
                  left: 'clamp(1.75rem, 4vw, 3rem)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  letterSpacing: '0.20em',
                  textTransform: 'uppercase',
                  color: 'rgba(201,123,43,0.45)',
                  userSelect: 'none',
                }}
              >
                Two Truths · Same Sky · Same Soil
              </div>

              {/* Back-to-gallery button — review mode only */}
              {reviewMode && (
                <button
                  onClick={handleGalleryBack}
                  aria-label="Return to all witnesses"
                  style={{
                    position: 'absolute',
                    top: '1.65rem',
                    right: 'clamp(1.75rem, 4vw, 3rem)',
                    background: 'none',
                    border: '1px solid rgba(230,220,197,0.18)',
                    borderRadius: '2px',
                    padding: '5px 14px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    letterSpacing: '0.20em',
                    textTransform: 'uppercase',
                    color: 'rgba(230,220,197,0.45)',
                    cursor: 'pointer',
                    zIndex: 10,
                    transition: 'border-color 0.2s, color 0.2s',
                  }}
                >
                  ← All Witnesses
                </button>
              )}

              {/* Testimony content block */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: w.description ? 'flex-start' : 'center',
                  padding: 'clamp(2rem, 4.5vw, 3.75rem)',
                  paddingTop: '5.5rem',
                  paddingBottom: 'clamp(2rem, 4.5vw, 3.75rem)',
                  gap: w.description ? '0.65rem' : '1rem',
                  overflowY: 'hidden',
                }}
              >
                {/* ① Role label */}
                <div
                  style={{
                    opacity: step >= 1 ? 1 : 0,
                    transform: step >= 1 ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'opacity 0.65s ease, transform 0.65s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.3rem',
                    marginBottom: '0.35rem',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xs)',
                      letterSpacing: '0.20em',
                      textTransform: 'uppercase',
                      color: 'var(--color-saffron)',
                    }}
                  >
                    {w.role}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'clamp(0.72rem, 1.05vw, 0.84rem)',
                      color: 'var(--color-snow-dim)',
                      opacity: 0.65,
                    }}
                  >
                    {w.label}
                  </span>
                </div>

                {/* ② Description */}
                {w.description && (
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'clamp(0.68rem, 0.95vw, 0.8rem)',
                      lineHeight: 1.75,
                      color: 'rgba(245,240,232,0.52)',
                      opacity: step >= 1 ? 1 : 0,
                      transform: step >= 1 ? 'translateY(0)' : 'translateY(10px)',
                      transition: 'opacity 0.65s ease 0.1s, transform 0.65s ease 0.1s',
                      margin: 0,
                      marginBottom: '0.25rem',
                    }}
                  >
                    {w.description}
                  </p>
                )}

                {/* ③ First testimony line */}
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                    fontSize: 'clamp(1.05rem, 1.9vw, 1.5rem)',
                    lineHeight: 1.65,
                    color: 'var(--color-snow)',
                    opacity: step >= 2 ? 1 : 0,
                    transform: step >= 2 ? 'translateY(0)' : 'translateY(14px)',
                    transition: 'opacity 0.72s ease, transform 0.72s ease',
                    margin: 0,
                  }}
                >
                  {w.line1}
                </p>

                {/* ④ Second testimony line */}
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                    fontSize: 'clamp(1.05rem, 1.9vw, 1.5rem)',
                    lineHeight: 1.65,
                    color: 'var(--color-snow-dim)',
                    opacity: step >= 3 ? 0.85 : 0,
                    transform: step >= 3 ? 'translateY(0)' : 'translateY(14px)',
                    transition: 'opacity 0.72s ease 0.08s, transform 0.72s ease 0.08s',
                    margin: 0,
                  }}
                >
                  {w.line2}
                </p>

                {/* ⑤ Interpretive note */}
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'clamp(0.72rem, 1.05vw, 0.84rem)',
                    color: 'var(--color-saffron)',
                    opacity: step >= 4 ? 0.7 : 0,
                    transform: step >= 4 ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'opacity 0.85s ease 0.14s, transform 0.85s ease 0.14s',
                    margin: 0,
                    marginTop: '0.5rem',
                    letterSpacing: '0.02em',
                  }}
                >
                  — {w.note}
                </p>

                {/* Scroll cue */}
                <div
                  style={{
                    marginTop: '1.5rem',
                    opacity: step >= 4 ? 1 : 0,
                    transition: 'opacity 1.1s ease 0.9s',
                  }}
                >
                  {reviewMode ? (
                    <div
                      style={{
                        display: 'flex',
                        gap: '10px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        color: 'rgba(230,220,197,0.28)',
                        letterSpacing: '0.08em',
                      }}
                    >
                      <span>↑</span>
                      <span>↓</span>
                    </div>
                  ) : (
                    <div
                      style={{
                        width: '1px',
                        height: '32px',
                        transformOrigin: 'top center',
                        background:
                          'linear-gradient(to bottom, rgba(201,123,43,0.55) 0%, transparent 100%)',
                        animation: 'duality-scroll-cue 2.4s ease-in-out infinite',
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════ ENTRY CARD ══════════════════ */}
        {entryVisible && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(6,8,10,0.96)',
              animation: 'duality-fade-in 0.9s ease forwards',
            }}
          >
            <div style={{ textAlign: 'center', maxWidth: '520px', padding: '2rem' }}>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  letterSpacing: '0.20em',
                  textTransform: 'uppercase',
                  color: 'var(--color-saffron)',
                  opacity: 0.65,
                  marginBottom: '1.4rem',
                }}
              >
                Testimony
              </p>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
                  fontWeight: 400,
                  color: 'var(--color-snow)',
                  lineHeight: 1.2,
                  marginBottom: '0.75rem',
                }}
              >
                Nine Voices
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'clamp(0.78rem, 1.15vw, 0.9rem)',
                  color: 'var(--color-snow-dim)',
                  opacity: 0.6,
                  letterSpacing: '0.1em',
                }}
              >
                One Valley
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════ EXIT SEQUENCE ══════════════════ */}
        {exitPhase >= 0 && !reviewMode && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 15,
              backgroundColor: '#000',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2.75rem',
            }}
          >
            {/* Phase 0–1: 7-portrait strip (hidden from phase 2+ to avoid layout gap) */}
            <div
              style={{
                display: 'flex',
                gap: '6px',
                opacity: exitPhase <= 1 ? 1 : 0,
                transition: 'opacity 1.1s ease',
                visibility: exitPhase >= 2 ? 'hidden' : 'visible',
                height: exitPhase >= 2 ? 0 : undefined,
                overflow: 'hidden',
              }}
            >
              {WITNESSES.map((wd, i) => (
                <div
                  key={wd.id}
                  style={{
                    position: 'relative',
                    width: 'clamp(56px, 7.5vw, 105px)',
                    height: 'clamp(78px, 10.5vw, 145px)',
                    overflow: 'hidden',
                    opacity: exitPhase >= 1 ? 0.13 : 1,
                    transform: exitPhase >= 1 ? 'scale(0.96)' : 'scale(1)',
                    transition: `opacity 1.7s ease ${i * 0.065}s, transform 1.7s ease ${i * 0.065}s`,
                    filter: 'grayscale(0.55) brightness(0.78)',
                    animation:
                      exitPhase === 0
                        ? `duality-fade-in 0.55s ease ${i * 0.09}s both`
                        : 'none',
                  }}
                >
                  <Image
                    src={wd.image}
                    alt=""
                    fill
                    sizes="120px"
                    style={{ objectFit: 'cover', objectPosition: wd.objectPosition }}
                  />
                </div>
              ))}
            </div>

            {/* Phase 2+: Conclusion block — ALL elements present from phase 2 so the
                layout is fixed and "Nine Voices" never shifts position as later
                phases fade in. Phases 3 and 4 use opacity transitions, not
                conditional renders, to avoid layout reflow. */}
            {exitPhase >= 2 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2rem',
                }}
              >
                {/* Nine Voices — fades in at phase 2 */}
                <div style={{ textAlign: 'center', animation: 'duality-fade-only 1.4s ease forwards' }}>
                  <h2
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontStyle: 'italic',
                      fontSize: 'clamp(1.65rem, 3.5vw, 3rem)',
                      fontWeight: 400,
                      color: 'var(--color-snow)',
                      letterSpacing: '-0.01em',
                      lineHeight: 1.2,
                    }}
                  >
                    Nine Voices — One Valley
                  </h2>
                </div>

                {/* Film title — space reserved at phase 2, opacity 0→1 at phase 3 */}
                <div
                  style={{
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                    opacity: exitPhase >= 3 ? 1 : 0,
                    transition: 'opacity 1.2s ease',
                  }}
                >
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--color-saffron)', opacity: 0.65 }}>
                    {CONFIG.film.productionCompany}
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(0.72rem, 1.1vw, 0.88rem)', color: 'var(--color-snow-dim)', opacity: 0.55, letterSpacing: '0.09em' }}>
                    {CONFIG.film.title}
                  </p>
                </div>

                {/* CTA — space reserved at phase 2, opacity 0→1 at phase 4 */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1.25rem',
                    opacity: exitPhase >= 4 ? 1 : 0,
                    transition: 'opacity 1.4s ease 0.3s',
                  }}
                >
                  <div style={{ width: '48px', height: '1px', backgroundColor: 'rgba(201,123,43,0.28)' }} />
                  <a href={CONFIG.duality.ctaHref} className="btn btn-primary btn-pulse" style={{ fontSize: '12px', letterSpacing: '0.26em', padding: '1.25rem 3.75rem' }}>
                    {CONFIG.duality.ctaLabel}
                  </a>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.20em', textTransform: 'uppercase', color: 'rgba(230,220,197,0.2)', margin: 0 }}>
                    {CONFIG.film.releaseYear}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════ GALLERY (re-entry) ══════════════════ */}
        {reviewMode && reviewSelected === null && (
          isMobileGallery ? (
            /* ── Mobile: compact 3×3 grid centered ── */
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 20,
                backgroundColor: 'rgba(4,5,7,0.97)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                animation: 'duality-fade-in 0.6s ease forwards',
              }}
            >
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--color-saffron)', opacity: 0.7, marginBottom: '0.75rem' }}>
                Nine Witnesses
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 400, color: 'var(--color-snow)', marginBottom: '0.5rem', textAlign: 'center' }}>
                Revisit a voice
              </h2>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.20em', color: 'rgba(230,220,197,0.3)', marginBottom: '2.5rem' }}>
                scroll ↓ to continue
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, clamp(70px, 7.5vw, 92px))', gap: '20px 12px', justifyContent: 'center' }}>
                {WITNESSES.map((wd, i) => (
                  <button key={wd.id} onClick={() => handleGallerySelect(i)} onMouseEnter={() => setGalleryHover(i)} onMouseLeave={() => setGalleryHover(null)} aria-label={`View testimony: ${wd.role}`}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', padding: 0, width: '100%' }}
                  >
                    <div style={{ position: 'relative', width: '100%', height: 'clamp(84px, 9vw, 110px)', overflow: 'hidden', borderRadius: '2px', border: galleryHover === i ? '1px solid rgba(201,123,43,0.75)' : '1px solid rgba(230,220,197,0.12)', boxShadow: galleryHover === i ? '0 0 18px rgba(201,123,43,0.22)' : 'none', transition: 'border-color 0.2s, box-shadow 0.2s', filter: 'brightness(0.88) saturate(0.9)' }}>
                      <Image src={wd.image} alt={wd.role} fill sizes="92px" quality={75} style={{ objectFit: 'cover', objectPosition: wd.objectPosition }} />
                      <div style={{ position: 'absolute', top: '5px', left: '7px', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'rgba(201,123,43,0.7)', letterSpacing: '0.20em', pointerEvents: 'none' }}>{wd.numeral}</div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center', width: '100%', wordBreak: 'break-word', lineHeight: 1.45, color: galleryHover === i ? 'rgba(201,123,43,0.85)' : 'rgba(230,220,197,0.38)', transition: 'color 0.2s' }}>
                      {wd.role.replace('THE ', '')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ── Desktop: full-screen immersive grid ── */
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 20,
                backgroundColor: 'rgba(4,5,7,0.97)',
                display: 'flex',
                flexDirection: 'column',
                animation: 'duality-fade-in 0.6s ease forwards',
              }}
            >
              {/* Header */}
              <div style={{ flexShrink: 0, padding: '1.25rem 2rem', textAlign: 'center', borderBottom: '1px solid rgba(230,220,197,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--color-saffron)', opacity: 0.7, margin: 0 }}>
                  Nine Witnesses
                </p>
                <span style={{ color: 'rgba(230,220,197,0.2)', fontSize: 'var(--text-xs)' }}>·</span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(1rem, 2vw, 1.4rem)', fontWeight: 400, color: 'var(--color-snow)', margin: 0 }}>
                  Revisit a voice
                </h2>
                <span style={{ color: 'rgba(230,220,197,0.2)', fontSize: 'var(--text-xs)' }}>·</span>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.20em', color: 'rgba(230,220,197,0.25)', margin: 0 }}>
                  scroll ↓ to continue
                </p>
              </div>

              {/* Full-screen 3×3 image grid */}
              <div
                style={{
                  flex: 1,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gridTemplateRows: 'repeat(3, 1fr)',
                  gap: '2px',
                  overflow: 'hidden',
                }}
              >
                {WITNESSES.map((wd, i) => (
                  <button
                    key={wd.id}
                    onClick={() => handleGallerySelect(i)}
                    onMouseEnter={() => setGalleryHover(i)}
                    onMouseLeave={() => setGalleryHover(null)}
                    aria-label={`View testimony: ${wd.role}`}
                    style={{
                      position: 'relative',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      overflow: 'hidden',
                      outline: 'none',
                    }}
                  >
                    <Image
                      src={wd.image}
                      alt={wd.role}
                      fill
                      sizes="33vw"
                      quality={80}
                      style={{
                        objectFit: 'cover',
                        objectPosition: wd.objectPosition,
                        filter: galleryHover === i
                          ? 'brightness(0.75) saturate(1.0)'
                          : 'brightness(0.55) saturate(0.8)',
                        transform: galleryHover === i ? 'scale(1.04)' : 'scale(1)',
                        transition: 'filter 0.35s ease, transform 0.55s ease',
                      }}
                    />
                    {/* Numeral */}
                    <div style={{ position: 'absolute', top: '14px', left: '16px', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'rgba(201,123,43,0.65)', letterSpacing: '0.20em', pointerEvents: 'none' }}>
                      {wd.numeral}
                    </div>
                    {/* Bottom label gradient */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0, left: 0, right: 0,
                        padding: '2.5rem 1.25rem 1.25rem',
                        background: 'linear-gradient(to top, rgba(4,5,7,0.92) 0%, rgba(4,5,7,0.5) 55%, transparent 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        pointerEvents: 'none',
                      }}
                    >
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(0.6rem, 0.75vw, 0.75rem)', letterSpacing: '0.18em', textTransform: 'uppercase', color: galleryHover === i ? 'rgba(201,123,43,0.95)' : 'rgba(230,220,197,0.55)', transition: 'color 0.2s', lineHeight: 1.5 }}>
                        {wd.role.replace('THE ', '')}
                      </span>
                    </div>
                    {/* Hover border overlay */}
                    <div style={{ position: 'absolute', inset: 0, border: galleryHover === i ? '1.5px solid rgba(201,123,43,0.60)' : '1.5px solid transparent', transition: 'border-color 0.25s', pointerEvents: 'none' }} />
                  </button>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
