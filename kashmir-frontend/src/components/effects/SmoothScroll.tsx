'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CONFIG } from '@/lib/config';

gsap.registerPlugin(ScrollTrigger);

/**
 * SmoothScroll — Lenis cinematic scroll provider
 *
 * Duration 1.4s with expo easing creates the weighted, unhurried feeling
 * of moving through a serious documentary world.
 * GSAP ScrollTrigger is connected via the raf loop.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!CONFIG.effects.smoothScrollEnabled) return;

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    /* Expose lenis globally for components that call lenis.scrollTo() */
    (window as unknown as Record<string, unknown>).lenis = lenis;

    /* Sync Lenis scroll position into GSAP ScrollTrigger every frame */
    lenis.on('scroll', ScrollTrigger.update);

    const tickerFn = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerFn);
      lenis.off('scroll', ScrollTrigger.update);
      lenis.destroy();
      delete (window as unknown as Record<string, unknown>).lenis;
    };
  }, []);

  return <>{children}</>;
}
