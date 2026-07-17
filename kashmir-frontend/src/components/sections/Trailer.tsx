'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CONFIG } from '@/lib/config';
import { FILM } from '@/content/film';

gsap.registerPlugin(ScrollTrigger);

export default function Trailer() {
  const sectionRef  = useRef<HTMLElement>(null);
  const frameRef    = useRef<HTMLDivElement>(null);
  const btnRef      = CONFIG.features.trailerAvailable ? useRef<HTMLDivElement>(null) : { current: null };
  const headRef     = useRef<HTMLDivElement>(null);
  const footRef     = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [showing, setShowing] = useState(true);

  /* GSAP scroll entrance */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(frameRef.current, {
        scale: 0.88,
        opacity: 0,
        duration: 1.4,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
        },
      });
      gsap.from([headRef.current, footRef.current], {
        opacity: 0,
        y: 18,
        stagger: 0.18,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 72%',
          once: true,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

/* Pulsing ring animation on the coming-soon button */
  useEffect(() => {
    if (CONFIG.features.trailerAvailable) return;
    const el = btnRef.current?.querySelector('.pulse-ring') as HTMLElement;
    if (!el) return;
    gsap.to(el, {
      scale: 1.35,
      opacity: 0,
      duration: 1.6,
      repeat: -1,
      ease: 'power1.out',
    });
  }, []);

  const handlePlayClick = () => {
    if (CONFIG.features.trailerAvailable) {
      setShowing(true);
    }
  };

  return (
    <section
      id="trailer"
      ref={sectionRef}
      style={{
        position: 'relative',
        zIndex: 1,
        padding: 'var(--section-py) 0',
        overflow: 'hidden',
      }}
    >
      {/* Ambient radial glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(139,47,63,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div className="section-container" style={{ position: 'relative', zIndex: 1 }}>

        {/* Section header */}
        <div
          ref={headRef}
          style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 4vw, 3rem)' }}
        >
          <span className="eyebrow">{FILM.productionCompany}</span>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 400,
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            color: 'var(--color-snow)', lineHeight: 1.1,
            marginTop: 'var(--space-2)',
          }}>
            {FILM.titleLine1}
            <span style={{ color: 'var(--color-saffron)', fontStyle: 'italic' }}>
              {' '}{FILM.titleLine2}
            </span>
          </h2>
        </div>

        {/* Cinematic frame */}
        <div
          ref={frameRef}
          style={{
            position: 'relative',
            maxWidth: '900px',
            margin: '0 auto',
            aspectRatio: '16 / 9',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
            cursor: CONFIG.features.trailerAvailable ? 'none' : 'default',
          }}
          data-cursor-hover={CONFIG.features.trailerAvailable || undefined}
          onClick={handlePlayClick}
        >
          {/* Poster / background image */}
          <Image
            src={CONFIG.media.posterUrl}
            alt={FILM.title}
            fill
            quality={85}
            sizes="(max-width: 960px) 95vw, 900px"
            priority={false}
            style={{
              objectFit: 'cover',
              objectPosition: 'center top',
              filter: CONFIG.features.trailerAvailable
                ? `brightness(${hovered ? 0.5 : 1})`
                : 'brightness(1)',
              transition: 'filter 600ms ease',
            }}
          />


          {/* Active video embed */}
          {showing && CONFIG.features.trailerAvailable && CONFIG.media.trailerUrl && (
            <iframe
              src={
                CONFIG.media.trailerUrl.includes('drive.google.com')
                  ? CONFIG.media.trailerUrl + (CONFIG.media.trailerUrl.includes('?') ? '&mute=1' : '?mute=1')
                  : CONFIG.media.trailerUrl + '?autoplay=1&mute=1&rel=0&modestbranding=1'
              }
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
              allow="autoplay; fullscreen"
              allowFullScreen
              {...({ muted: true } as object)}
            />
          )}

          {/* Play button — only shown when trailer is available */}
          {!showing && CONFIG.features.trailerAvailable && (
            <div
              ref={btnRef}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-4)',
                userSelect: 'none',
              }}
            >
              <div style={{
                width: '80px', height: '80px',
                borderRadius: '50%',
                backgroundColor: hovered ? 'rgba(201,123,43,0.25)' : 'rgba(10,12,15,0.7)',
                border: `1.5px solid ${hovered ? 'rgba(201,123,43,0.9)' : 'rgba(201,123,43,0.45)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(8px)',
                transition: 'background-color 400ms, border-color 400ms',
                boxShadow: hovered ? '0 0 40px rgba(201,123,43,0.25)' : '0 0 20px rgba(0,0,0,0.5)',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <polygon points="8,5 20,12 8,19" fill={hovered ? 'rgba(201,123,43,1)' : 'rgba(201,123,43,0.7)'} style={{ transition: 'fill 300ms' }} />
                </svg>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.22em', textTransform: 'uppercase', color: hovered ? 'rgba(201,123,43,1)' : 'rgba(245,240,232,0.6)', transition: 'color 300ms', whiteSpace: 'nowrap' }}>
                Play Trailer
              </span>
            </div>
          )}

        </div>

        {/* Footer text */}
        <div
          ref={footRef}
          style={{
            textAlign: 'center',
            marginTop: 'clamp(1.5rem, 3vw, 2.5rem)',
          }}
        >
          {!CONFIG.features.trailerAvailable && (
            <div style={{
              marginTop: 'var(--space-5)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
            }}>
              <span style={{
                display: 'inline-block', width: '6px', height: '6px',
                borderRadius: '50%', backgroundColor: 'var(--color-crimson)',
                animation: 'live-pulse 2.5s ease-in-out infinite',
              }} />
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
                letterSpacing: '0.20em', textTransform: 'uppercase',
                color: 'var(--color-ash-text)',
              }}>
                Currently in post-production · {FILM.releaseYear}
              </span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes live-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(1.4); }
        }
      `}</style>
    </section>
  );
}
