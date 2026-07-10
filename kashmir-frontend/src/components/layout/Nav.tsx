'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { label: 'Film',     href: '#film' },
  { label: 'Trailer',  href: '#trailer' },
  { label: 'History',  href: '#timeline' },
  { label: 'News',     href: '#news' },
  { label: 'Social',   href: '#social' },
];

export default function Nav() {
  const [isScrolled, setIsScrolled]     = useState(false);
  const [activeLink, setActiveLink]     = useState('');
  const [menuOpen, setMenuOpen]         = useState(false);
  const indicatorRef                    = useRef<HTMLSpanElement>(null);
  const linksRef                        = useRef<(HTMLAnchorElement | null)[]>([]);
  const pathname                        = usePathname();
  const isShop                          = pathname === '/shop';

  /* Scrolled state — call immediately so a browser-restored scroll position
     doesn't leave the nav transparent until the user moves */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Active section detection.
     Lenis absorbs native scroll events, so we subscribe to Lenis directly
     when it initialises (Hero mounts it after Nav). A 100ms interval also
     runs as a catch-all for the initial page load and any edge cases. */
  useEffect(() => {
    const NAV_HEIGHT = 72;
    const OFFSET     = 100;
    let last         = '';

    const detect = () => {
      let current = '';
      for (const link of NAV_LINKS) {
        const el = document.querySelector(link.href);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= NAV_HEIGHT + OFFSET) current = link.href;
      }
      if (current !== last) { last = current; setActiveLink(current); }
    };

    detect();

    // Subscribe to Lenis scroll events once Lenis initialises
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lenisOff: (() => void) | null = null;
    const waitForLenis = setInterval(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const l = (window as any).lenis;
      if (l?.on) {
        clearInterval(waitForLenis);
        l.on('scroll', detect);
        lenisOff = () => l.off('scroll', detect);
      }
    }, 100);

    return () => {
      clearInterval(waitForLenis);
      lenisOff?.();
    };
  }, []);

  /* Slide the saffron indicator under active link */
  useEffect(() => {
    const activeIdx = NAV_LINKS.findIndex(l => l.href === activeLink);
    const activeEl  = linksRef.current[activeIdx];
    if (indicatorRef.current && activeEl) {
      indicatorRef.current.style.left   = `${activeEl.offsetLeft}px`;
      indicatorRef.current.style.width  = `${activeEl.offsetWidth}px`;
      indicatorRef.current.style.opacity = '1';
    } else if (indicatorRef.current) {
      indicatorRef.current.style.opacity = '0';
    }
  }, [activeLink]);

  const scrollTo = useCallback((href: string) => {
    const el = document.querySelector(href);
    if (!el) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lenis = (window as any).lenis;
    if (lenis) {
      lenis.scrollTo(el, { offset: -72, duration: 1.6 });
    } else {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMenuOpen(false);
  }, []);

  return (
    <>
      <nav className={`nav-base${isScrolled || isShop ? ' is-scrolled' : ''}`}>
        <div className="section-container w-full flex items-center justify-between gap-8">

          {/* Brand */}
          <a
            href={isShop ? '/' : '#'}
            onClick={e => { if (isShop) return; e.preventDefault(); scrollTo('#hero'); }}
            className="font-mono uppercase text-snow hover:text-saffron transition-colors duration-200 shrink-0"
            style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-snow)', letterSpacing: '0.22em', fontWeight: 500 }}
          >
            KASHMIR&nbsp;—&nbsp;FIGHTING FOR PEACE
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8 relative">
            {NAV_LINKS.map((link, i) => (
              <a
                key={link.href}
                ref={el => { linksRef.current[i] = el; }}
                href={isShop ? `/${link.href}` : link.href}
                onClick={e => { if (isShop) return; e.preventDefault(); scrollTo(link.href); }}
                className="nav-link"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  letterSpacing: '0.20em',
                  textTransform: 'uppercase',
                  color: activeLink === link.href ? 'var(--color-saffron)' : 'var(--color-snow-dim)',
                  transition: 'color 200ms var(--ease-decisive)',
                  paddingBottom: '4px',
                }}
              >
                {link.label}
              </a>
            ))}
            {/* Sliding indicator */}
            <span
              ref={indicatorRef}
              style={{
                position: 'absolute',
                bottom: '-1px',
                height: '1px',
                backgroundColor: 'var(--color-saffron)',
                transition: 'left 300ms var(--ease-decisive), width 300ms var(--ease-decisive), opacity 200ms',
                opacity: 0,
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/shop"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--color-saffron)',
                border: '1px solid rgba(175,108,30,0.5)',
                borderRadius: '4px',
                padding: '0.45rem 1rem',
                textDecoration: 'none',
                transition: 'background 200ms, border-color 200ms',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(175,108,30,0.12)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(175,108,30,0.9)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(175,108,30,0.5)'; }}
            >
              Kashmir Harvest
            </Link>
            <a
              href={isShop ? '/#watch' : '#watch'}
              onClick={e => { if (isShop) return; e.preventDefault(); scrollTo('#watch'); }}
              className="btn btn-primary btn-pulse"
              style={{ fontSize: 'var(--text-xs)', padding: '0.55rem 1.25rem' }}
            >
              Watch Now
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            style={{ cursor: 'none', border: 'none', background: 'none' }}
          >
            {[0,1,2].map(i => (
              <span
                key={i}
                style={{
                  display: 'block',
                  width: '24px',
                  height: '1px',
                  backgroundColor: 'var(--color-snow)',
                  transition: 'transform 300ms var(--ease-decisive), opacity 200ms',
                  transform: menuOpen
                    ? i === 0 ? 'translateY(7px) rotate(45deg)'
                    : i === 2 ? 'translateY(-7px) rotate(-45deg)'
                    : 'scaleX(0)'
                    : 'none',
                  opacity: menuOpen && i === 1 ? 0 : 1,
                }}
              />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile fullscreen menu */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(10,12,15,0.98)',
            zIndex: 99,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-8)',
            backdropFilter: 'blur(16px)',
          }}
        >
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={isShop ? `/${link.href}` : link.href}
              onClick={e => { if (isShop) { setMenuOpen(false); return; } e.preventDefault(); scrollTo(link.href); }}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-4xl)',
                color: 'var(--color-snow)',
                cursor: 'none',
              }}
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/shop"
            onClick={() => setMenuOpen(false)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xl)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--color-saffron)',
              textDecoration: 'none',
            }}
          >
            Kashmir Harvest
          </Link>
          <a
            href={isShop ? '/#watch' : '#watch'}
            onClick={e => { if (isShop) { setMenuOpen(false); return; } e.preventDefault(); scrollTo('#watch'); setMenuOpen(false); }}
            className="btn btn-primary"
            style={{ marginTop: 'var(--space-8)' }}
          >
            Watch Now
          </a>
        </div>
      )}
    </>
  );
}
