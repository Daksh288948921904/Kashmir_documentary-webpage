'use client';

import { useEffect, useRef, type ReactElement } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FILM } from '@/content/film';
import { CONFIG } from '@/lib/config';

gsap.registerPlugin(ScrollTrigger);

const NAV_LINKS = [
  { label: 'Film',     href: '#film' },
  { label: 'Trailer',  href: '#trailer' },
  { label: 'History',  href: '#timeline' },
  { label: 'News',     href: '#news' },
  { label: 'Social',   href: '#social' },
  { label: 'Watch',    href: '#watch' },
];

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Use',   href: '/terms'   },
  { label: 'Refund Policy',  href: '/refunds' },
];

const SOCIAL_ICONS: Record<string, ReactElement> = {
  instagram: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  ),
  twitter: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  youtube: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  facebook: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
};

export default function Footer() {
  const footerRef  = useRef<HTMLElement>(null);
  const titleRef   = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const linksRef   = useRef<HTMLDivElement>(null);
  const legalRef   = useRef<HTMLDivElement>(null);
  const lastRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Mist closes over — darkening overlay on scroll into footer */
      gsap.from(footerRef.current, {
        opacity: 0,
        scrollTrigger: { trigger: footerRef.current, start: 'top 90%', end: 'top 60%', scrub: true },
      });

      gsap.from([titleRef.current, taglineRef.current, linksRef.current, legalRef.current, lastRef.current], {
        opacity: 0, y: 20, stagger: 0.12, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: footerRef.current, start: 'top 80%', once: true },
      });
    }, footerRef);
    return () => ctx.revert();
  }, []);

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (!el) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lenis = (window as any).lenis;
    if (lenis) lenis.scrollTo(el, { offset: -72, duration: 1.6 });
    else el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer
      ref={footerRef}
      style={{
        position: 'relative',
        zIndex: 1,
        borderTop: 'var(--border-dim)',
        padding: 'clamp(4rem, 8vw, 6rem) 0 clamp(2rem, 4vw, 3rem)',
        overflow: 'hidden',
      }}
    >
      {/* Grain heavier in footer */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(201,123,43,0.03) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="section-container">
        <div style={{ textAlign: 'center' }}>

          {/* Title */}
          <div ref={titleRef} style={{ marginBottom: 'var(--space-3)' }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 400,
              fontSize: 'clamp(1.6rem, 4vw, 2.5rem)',
              color: 'var(--color-snow)',
              letterSpacing: '-0.01em',
            }}>
              {FILM.title}
            </span>
          </div>

          {/* Tagline */}
          <div ref={taglineRef} style={{ marginBottom: 'var(--space-10)' }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: 'clamp(0.9rem, 1.6vw, 1.1rem)',
              color: 'var(--color-saffron)',
              opacity: 0.8,
            }}>
              {FILM.tagline}
            </span>
          </div>

          {/* Nav links */}
          <div
            ref={linksRef}
            style={{
              display: 'flex', gap: 'clamp(1rem, 3vw, 2.5rem)',
              justifyContent: 'center', flexWrap: 'wrap',
              marginBottom: 'var(--space-10)',
              paddingBottom: 'var(--space-8)',
              borderBottom: 'var(--border-dim)',
            }}
          >
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={e => { e.preventDefault(); scrollTo(link.href); }}
                data-cursor-hover
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
                  letterSpacing: '0.20em', textTransform: 'uppercase',
                  color: 'var(--color-ash-text)',
                  transition: 'color 200ms',
                  cursor: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-saffron)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-ash-text)'; }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Legal policy links */}
          <div
            style={{
              display: 'flex', justifyContent: 'center', gap: 'clamp(1rem, 3vw, 2rem)',
              flexWrap: 'wrap', marginBottom: 'var(--space-6)',
            }}
          >
            {LEGAL_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
                  letterSpacing: '0.16em', textTransform: 'uppercase',
                  color: 'var(--color-ash-text)',
                  textDecoration: 'none',
                  transition: 'color 200ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-saffron)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-ash-text)'; }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Legal row */}
          <div
            ref={legalRef}
            style={{
              display: 'flex', justifyContent: 'center', gap: 'var(--space-6)',
              flexWrap: 'wrap', marginBottom: 'var(--space-6)',
            }}
          >
            {[
              `© ${FILM.releaseYear} ${FILM.productionCompany}`,
              'All Rights Reserved',
              FILM.language,
            ].map((item, i) => (
              <span key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--color-ash-text)' }}>
                {item}
              </span>
            ))}
          </div>

          {/* Social icons — only render when URLs are configured */}
          {Object.entries(CONFIG.social).some(([, v]) => v) && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-5)', marginBottom: 'var(--space-8)' }}>
              {(Object.entries(CONFIG.social) as [keyof typeof CONFIG.social, string][])
                .filter(([, url]) => url)
                .map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={platform}
                    data-cursor-hover
                    style={{
                      color: 'var(--color-ash-text)',
                      transition: 'color 200ms',
                      cursor: 'none',
                      display: 'flex', alignItems: 'center',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-saffron)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-ash-text)'; }}
                  >
                    {SOCIAL_ICONS[platform]}
                  </a>
                ))
              }
            </div>
          )}

          {/* Closing line */}
          <div ref={lastRef}>
            <p style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: 'clamp(0.8rem, 1.2vw, 0.9rem)',
              color: 'var(--color-snow-dim)',
              letterSpacing: '0.01em',
            }}>
              &ldquo;This story does not end when you leave.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
