'use client';

import { useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FILM } from '@/content/film';
import { CONFIG } from '@/lib/config';

gsap.registerPlugin(ScrollTrigger);

const CHAR_ROWS = [
  FILM.characters.slice(0, 4),
  FILM.characters.slice(4, 8),
] as const;

export default function FilmOverview() {
  const sectionRef = useRef<HTMLElement>(null);
  const festivalRef = useRef<HTMLDivElement>(null);
  const heroRef    = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const charsRef   = useRef<HTMLDivElement>(null);
  const quoteRef   = useRef<HTMLDivElement>(null);
  const ctaRef     = useRef<HTMLDivElement>(null);

  const scrollTo = useCallback((href: string) => {
    const el = document.querySelector(href);
    if (!el) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lenis = (window as any).lenis;
    if (lenis) lenis.scrollTo(el, { offset: -72, duration: 1.6 });
    else el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const trig = { trigger: sectionRef.current, start: 'top 78%', once: true };

      gsap.from(festivalRef.current, {
        opacity: 0, y: 10, duration: 0.6, ease: 'power2.out',
        scrollTrigger: trig,
      });
      gsap.from(heroRef.current, {
        opacity: 0, y: 24, duration: 1.2, ease: 'power3.out', delay: 0.15,
        scrollTrigger: trig,
      });
      gsap.from(contentRef.current, {
        opacity: 0, y: 20, duration: 1.0, ease: 'power3.out',
        scrollTrigger: { trigger: contentRef.current, start: 'top 80%', once: true },
      });
      gsap.from(charsRef.current, {
        opacity: 0, y: 16, duration: 0.9, ease: 'power2.out',
        scrollTrigger: { trigger: charsRef.current, start: 'top 85%', once: true },
      });

      const qEl = quoteRef.current;
      if (qEl) {
        const qTrigger = { trigger: qEl, start: 'top 82%', once: true };
        gsap.from(qEl.querySelector<HTMLElement>('.q-bar'), {
          scaleY: 0, duration: 0.55, ease: 'power2.inOut', transformOrigin: 'top center',
          scrollTrigger: qTrigger,
        });
        gsap.from(qEl.querySelector<HTMLElement>('.q-text'), {
          opacity: 0, x: -28, duration: 1.0, ease: 'power3.out', delay: 0.22,
          scrollTrigger: qTrigger,
        });
        gsap.from(qEl.querySelector<HTMLElement>('.q-attr'), {
          opacity: 0, duration: 0.7, delay: 0.58,
          scrollTrigger: qTrigger,
        });
      }

      gsap.from(ctaRef.current, {
        opacity: 0, y: 20, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: ctaRef.current, start: 'top 88%', once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="film"
      ref={sectionRef}
      style={{ position: 'relative', zIndex: 1 }}
    >
      <div className="section-mist-top" />

      <div className="section-container" style={{ paddingTop: 'clamp(6rem, 8vw, 8rem)', paddingBottom: 0 }}>

        {/* ── FESTIVAL CREDENTIAL ── */}
        <div ref={festivalRef} style={{ marginBottom: 'clamp(1.5rem, 3vw, 2rem)' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)',
            padding: '6px 14px 6px 10px',
            border: '1px solid rgba(201,123,43,0.25)',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(201,123,43,0.04)',
          }}>
            <div style={{
              width: '4px', height: '4px', borderRadius: '50%',
              backgroundColor: 'var(--color-saffron)', flexShrink: 0,
            }} />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
              letterSpacing: '0.20em', textTransform: 'uppercase',
              color: 'var(--color-saffron)',
            }}>
              Waves Film Bazaar 2026
            </span>
            <span style={{ width: '1px', height: '10px', background: 'rgba(201,123,43,0.25)', display: 'block' }} />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
              letterSpacing: '0.20em', textTransform: 'uppercase',
              color: 'var(--color-ash-text)',
            }}>
              Selected For
            </span>
          </div>
        </div>

        {/* ── HERO: BADGE + PORTRAIT POSTER ── */}
        <div
          ref={heroRef}
          style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 4vw, 3rem)' }}
        >
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
            letterSpacing: '0.20em', textTransform: 'uppercase',
            color: 'var(--color-saffron)', marginBottom: '1.25rem',
          }}>
            Documentary · Kashmir · {FILM.releaseYear}
          </p>

          <div style={{
            position: 'relative', width: '360px', maxWidth: '90vw', margin: '0 auto',
            borderRadius: 'var(--radius-sm)', overflow: 'hidden',
            boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
          }}>
            <Image
              src={CONFIG.sectionImages.poster}
              alt={`${FILM.title} — film poster`}
              width={360}
              height={504}
              style={{
                width: '100%', height: 'auto', aspectRatio: '5/7',
                objectFit: 'cover', objectPosition: 'center top',
                filter: 'brightness(1)',
                display: 'block',
              }}
            />
          </div>
        </div>

      </div>

      {/* ── CONTENT STRIP ── */}
      <div className="section-container" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <div ref={contentRef}>

          {/* Tagline */}
          <h2 style={{
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
            fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
            fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.02em',
            color: 'var(--color-snow)',
            marginBottom: 'clamp(1.25rem, 2.5vw, 1.75rem)',
          }}>
            &ldquo;{FILM.synopsis.short}&rdquo;
          </h2>

          <div style={{
            borderTop: '1px solid var(--color-ash-dim)',
            marginBottom: 'clamp(1.25rem, 2.5vw, 1.75rem)',
          }} />

          {/* Two-column: blockquote+body left | director+label+cta right */}
          <div
            className="grid grid-cols-1 md:grid-cols-[1fr_1px_1fr]"
            style={{ marginBottom: 'clamp(1.75rem, 3.5vw, 2.5rem)', alignItems: 'start' }}
          >
            <div style={{ paddingRight: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
              <div style={{
                borderLeft: '2px solid rgba(201,123,43,0.45)',
                paddingLeft: 'var(--space-5)',
                marginBottom: 'var(--space-5)',
              }}>
                <p style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  fontSize: 'clamp(0.95rem, 1.4vw, 1.06rem)',
                  lineHeight: 1.85, color: 'var(--color-snow-dim)', margin: 0,
                }}>
                  It places ordinary human beings in front of the lens and asks them to speak. Then it listens.
                </p>
              </div>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(0.8rem, 1.0vw, 0.88rem)',
                lineHeight: 1.95, color: 'var(--color-snow-dim)', margin: 0,
              }}>
                A conflict covered from the outside for decades. This film was made from inside.
              </p>
            </div>

            {/* Vertical separator — desktop only */}
            <div
              className="hidden md:block"
              style={{ backgroundColor: 'var(--color-ash-dim)' }}
            />

            <div
              className="mt-8 md:mt-0"
              style={{
                paddingLeft: 'clamp(1.5rem, 3vw, 2.5rem)',
                display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', gap: 'var(--space-6)',
              }}
            >
              <div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
                  letterSpacing: '0.20em', textTransform: 'uppercase',
                  color: 'var(--color-saffron)', marginBottom: '4px',
                }}>
                  Director
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-base)',
                  color: 'var(--color-snow)', fontWeight: 500,
                }}>
                  {FILM.director}
                </div>
              </div>

              <div>
                <p style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  fontSize: 'clamp(1rem, 1.4vw, 1.15rem)',
                  color: 'var(--color-saffron)', lineHeight: 1.4,
                  marginBottom: 'var(--space-2)',
                }}>
                  Some lives you will not forget.
                </p>
                <p style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  fontSize: 'clamp(0.82rem, 1.0vw, 0.9rem)',
                  color: 'var(--color-ash-text)', margin: 0,
                }}>
                  Their stories are inside the film.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── CHARACTER GRID ── */}
        <div ref={charsRef} style={{ marginBottom: 'clamp(2.5rem, 5vw, 4rem)' }}>
          {CHAR_ROWS.map((row, ri) => (
            <div
              key={ri}
              style={{
                borderTop: '1px solid var(--color-ash-dim)',
                paddingTop: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                paddingBottom: 'clamp(1.25rem, 2.5vw, 1.75rem)',
              }}
            >
              <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 0 }}>
                {row.map((person, ci) => (
                  <div
                    key={person.role}
                    className={ci < row.length - 1 ? 'md:border-r border-[var(--color-ash-dim)]' : ''}
                    style={{
                      padding: `0 clamp(0.75rem, 1.5vw, 1.1rem)`,
                      paddingLeft: ci === 0 ? 0 : undefined,
                      paddingRight: ci === row.length - 1 ? 0 : undefined,
                    }}
                  >
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
                      letterSpacing: '0.20em', textTransform: 'uppercase',
                      color: 'var(--color-saffron)', marginBottom: '6px',
                    }}>
                      {person.role}
                    </div>
                    <p style={{
                      fontFamily: 'var(--font-display)', fontStyle: 'italic',
                      fontSize: 'clamp(0.8rem, 1.0vw, 0.9rem)',
                      color: 'var(--color-snow-dim)', lineHeight: 1.7, margin: 0,
                    }}>
                      {person.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PULL QUOTE BAND ── */}
      <div
        ref={quoteRef}
        style={{
          borderTop: '1px solid var(--color-ash-dim)',
          background: 'linear-gradient(to right, rgba(7,9,12,0.95), rgba(13,15,19,0.95))',
          padding: 'clamp(2.5rem, 5vw, 4.5rem) 0',
        }}
      >
        <div className="section-container">
          <div style={{
            display: 'flex', alignItems: 'flex-start',
            gap: 'var(--space-8)', maxWidth: '740px',
          }}>
            <div
              className="q-bar"
              style={{
                width: '3px', flexShrink: 0, alignSelf: 'stretch',
                minHeight: '58px', backgroundColor: 'var(--color-saffron)',
                borderRadius: '2px',
              }}
            />
            <div>
              <blockquote
                className="q-text"
                style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  fontSize: 'clamp(1.18rem, 2.4vw, 1.72rem)',
                  lineHeight: 1.58, letterSpacing: '0.005em',
                  color: 'var(--color-snow)', margin: 0,
                  marginBottom: 'var(--space-4)',
                }}
              >
                &ldquo;{FILM.primaryPullQuote}&rdquo;
              </blockquote>
              <div
                className="q-attr"
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
                  letterSpacing: '0.20em', textTransform: 'uppercase',
                  color: 'var(--color-saffron)',
                }}
              >
                — {FILM.title}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── WATCH CTA ── */}
      <div
        ref={ctaRef}
        style={{
          borderTop: '1px solid var(--color-ash-dim)',
          padding: 'clamp(3rem, 6vw, 5rem) 0',
          textAlign: 'center',
        }}
      >
        <div className="section-container">
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
            letterSpacing: '0.20em', textTransform: 'uppercase',
            color: 'var(--color-ash-text)',
            marginBottom: 'var(--space-5)',
          }}>
            ₹299 · Lifetime access
          </p>
          <button
            onClick={() => scrollTo('#watch')}
            className="btn btn-primary btn-pulse"
            data-cursor-hover
            style={{ minWidth: '200px' }}
          >
            Watch the Film
          </button>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
            letterSpacing: '0.20em', textTransform: 'uppercase',
            color: 'var(--color-ash-text)',
            marginTop: 'var(--space-4)',
          }}>
            Secure payment · Airpay · Instant access
          </p>
        </div>
      </div>

      <div className="section-mist-bottom" />
    </section>
  );
}
