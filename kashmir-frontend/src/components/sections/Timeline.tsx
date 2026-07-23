'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useTimeline } from '@/hooks/useTimeline';
import type { TimelineEvent, TimelineDoc } from '@/types/api';

/* ─── Eras ─────────────────────────────────────────────────────────────── */
const ERAS = [
  {
    id: 'medieval' as const,
    num: 'I',
    name: 'Before the Wound',
    range: '1339 – 1845',
    tab: 'Before the Wound (1339–1845)',
    desc: 'For five centuries Kashmir lived through dynastic change yet retained its cultural continuity. The valley was ruled by locals, Mughals, Afghans and Sikhs in turn — but never partitioned, never sold.',
    quote: '"A land of gardens and scholars, passed between empires but never divided against itself."',
    from: 1339, to: 1845,
    accent: '#C9901A',
  },
  {
    id: 'colonial' as const,
    num: 'II',
    name: 'Sold, Not Heard',
    range: '1846 – 1946',
    tab: 'Sold, Not Heard (1846–1946)',
    desc: 'The Treaty of Amritsar transfers Kashmir to the Dogra dynasty for 75 lakh Nanakshahee rupees. For a century the people live under a hereditary maharaja, excluded from power, until independence movements of the 1930s awaken a new political consciousness.',
    quote: '"The British sell an entire people to a Dogra maharaja for ₹75 lakh. Not one Kashmiri is present at the table."',
    from: 1846, to: 1946,
    accent: '#C9901A',
  },
  {
    id: 'partition' as const,
    num: 'III',
    name: 'Unfinished Partition',
    range: '1947 – 1988',
    tab: 'Unfinished Partition (1947–1988)',
    desc: "Independence brings accession, war and a special constitutional status. Kashmir becomes the most disputed territory on earth — caught between two nuclear powers, its fate deferred by diplomacy and frozen by force.",
    quote: '"The plebiscite promised in 1948 was never held. What followed was a slow hardening of borders and a generation born into dispute."',
    from: 1947, to: 1988,
    accent: '#C9901A',
  },
  {
    id: 'fire' as const,
    num: 'IV',
    name: 'Insurgency, Exile & Impasse',
    range: '1989 – 2018',
    tab: 'Insurgency & Exile (1989–2018)',
    desc: 'Thirty years of armed conflict, mass civilian trauma, the exile of a community, and a slow grinding negotiation that leads nowhere. A generation born into curfew.',
    quote: '"A new militancy generation emerges, drawn by ideology as much as grievance. The valley\'s wounds multiply."',
    from: 1989, to: 2018,
    accent: '#C9901A',
  },
  {
    id: 'present' as const,
    num: 'V',
    name: 'The New Normal',
    range: '2019 – Present',
    tab: 'New Normal (2019–2026)',
    desc: 'Article 370 is gone. Statehood is suspended. An internet blackout. New domicile laws. A decade\'s worth of constitutional change compressed into a single midnight session of Parliament.',
    quote: '"The archive\'s final entry — for now. The wound remains open."',
    from: 2019, to: 9999,
    accent: '#C9901A',
  },
] as const;

type EraId = typeof ERAS[number]['id'];

const CAT: Record<string, { color: string; label: string }> = {
  political:    { color: '#C9901A', label: 'Political' },
  conflict:     { color: '#C03050', label: 'Conflict' },
  cultural:     { color: '#3A9CB5', label: 'Cultural' },
  humanitarian: { color: '#3D9A3D', label: 'Humanitarian' },
};

type Filter = 'all' | 'political' | 'conflict' | 'cultural' | 'humanitarian';

const SPINE_GOLD = '#C9901A';
const SPINE_GOLD_DIM = 'rgba(201,144,26,0.55)';

/* ─── Primary source panel ─────────────────────────────────────────────── */
function DocPanel({ doc, onClose }: { doc: TimelineDoc; onClose: () => void }) {
  return (
    <div style={{
      marginTop: '0.875rem',
      background: 'rgba(201,144,26,0.07)',
      border: '1px solid rgba(201,144,26,0.35)',
      borderRadius: '8px',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0.55rem 0.875rem',
        background: 'rgba(201,144,26,0.12)',
        borderBottom: '1px solid rgba(201,144,26,0.22)',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: SPINE_GOLD }}>
          Primary Source · {doc.kind}
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '1rem', cursor: 'pointer', lineHeight: 1, padding: '0 0 0 0.5rem' }}>×</button>
      </div>
      <div style={{ padding: '0.75rem 0.875rem 0.875rem' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--color-snow)', lineHeight: 1.3, marginBottom: '0.2rem' }}>{doc.name}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'rgba(201,144,26,0.75)', marginBottom: '0.625rem' }}>{doc.date} · {doc.source}</div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-snow-dim)', lineHeight: 1.72, margin: '0 0 0.75rem' }}>{doc.desc}</p>
        <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: SPINE_GOLD, textDecoration: 'none', borderBottom: '1px solid rgba(201,144,26,0.35)', paddingBottom: '1px' }}>
          Read full document →
        </a>
      </div>
    </div>
  );
}

/* ─── Photo card (in the card grid below the spine) ────────────────────── */
function PhotoCard({ event }: { event: TimelineEvent }) {
  const [showDoc, setShowDoc] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cat = CAT[event.category] ?? { color: SPINE_GOLD, label: event.category };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; obs.disconnect(); }
    }, { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(18,20,25,0.9)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'opacity 0.5s ease, transform 0.5s ease, border-color 0.2s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.14)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}
    >
      {/* Photo */}
      <div style={{
        height: '190px',
        flexShrink: 0,
        position: 'relative',
        background: 'linear-gradient(170deg, #191b21 0%, #22242c 45%, #13151a 100%)',
        overflow: 'hidden',
      }}>
        {event.imgUrl && (
          <img
            src={event.imgUrl}
            alt={event.title}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center top',
              filter: 'sepia(0.18) brightness(0.82) contrast(1.05)',
            }}
          />
        )}
        {/* Subtle film-grain texture */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 4px)',
          pointerEvents: 'none',
        }} />
        {/* Bottom gradient vignette over image */}
        <div aria-hidden style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
          background: 'linear-gradient(to bottom, transparent, rgba(6,8,10,0.55))',
          pointerEvents: 'none',
        }} />
        {/* Image attribution */}
        {event.imgUrl?.includes('wikimedia.org') && (
          <div aria-hidden style={{
            position: 'absolute', bottom: '7px', right: '7px',
            fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
            color: 'rgba(255,255,255,0.8)', letterSpacing: '0.04em',
            pointerEvents: 'none', userSelect: 'none',
            background: 'rgba(0,0,0,0.55)',
            padding: '2px 6px',
            borderRadius: '3px',
          }}>
            © Wikimedia Commons
          </div>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: '0.875rem 1rem 1rem', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {/* Year + category badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.25rem',
            fontWeight: 700,
            color: SPINE_GOLD,
            lineHeight: 1,
            letterSpacing: '-0.025em',
          }}>
            {event.year}
          </div>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.52rem',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: cat.color,
            border: `1px solid ${cat.color}40`,
            borderRadius: '3px',
            padding: '2px 7px',
            whiteSpace: 'nowrap',
          }}>
            {cat.label}
          </span>
        </div>

        {/* Location */}
        {event.place && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>◦</span> {event.place.toUpperCase()}
          </div>
        )}

        {/* Title */}
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'var(--color-snow)', lineHeight: 1.25, margin: 0 }}>
          {event.title}
        </h3>

        {/* Description */}
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.845rem',
          color: 'rgba(255,255,255,0.72)',
          lineHeight: 1.68,
          margin: 0,
          flexGrow: 1,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical' as const,
          WebkitLineClamp: 3,
        }}>
          {event.description}
        </p>

        {/* Primary source */}
        {event.doc && (
          <div style={{ paddingTop: '0.25rem' }}>
            <button
              onClick={() => setShowDoc(v => !v)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                fontFamily: 'var(--font-mono)', fontSize: '0.54rem',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: showDoc ? SPINE_GOLD : 'rgba(201,144,26,0.7)',
                border: 'none', background: 'none', cursor: 'pointer', padding: 0,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = SPINE_GOLD; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = showDoc ? SPINE_GOLD : 'rgba(201,144,26,0.7)'; }}
            >
              <span style={{ fontSize: '0.75rem' }}>📄</span> Primary Source
            </button>
            {showDoc && event.doc && <DocPanel doc={event.doc} onClose={() => setShowDoc(false)} />}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Era block (header + spine events + card grid) ────────────────────── */
function EraBlock({
  era,
  events,
  eraRef,
}: {
  era: typeof ERAS[number];
  events: TimelineEvent[];
  eraRef: (el: HTMLElement | null) => void;
}) {
  const blockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = blockRef.current;
    if (!el) return;
    el.style.opacity = '0';
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.style.opacity = '1'; obs.disconnect(); }
    }, { threshold: 0.03 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={el => { blockRef.current = el; eraRef(el); }}
      data-era={era.id}
      style={{
        position: 'relative',
        marginBottom: 'clamp(4rem, 8vw, 7rem)',
        scrollMarginTop: '90px',
        transition: 'opacity 0.7s ease',
      }}
    >
      {/* ── Continuous golden spine line ── */}
      <div aria-hidden style={{
        position: 'absolute',
        left: '50%',
        top: 0,
        bottom: 0,
        width: '2px',
        background: `linear-gradient(to bottom, ${SPINE_GOLD}00 0%, ${SPINE_GOLD_DIM} 3%, ${SPINE_GOLD_DIM} 97%, ${SPINE_GOLD}00 100%)`,
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* ── Era header (2-col with spine through centre) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        paddingBottom: 'clamp(3rem, 6vw, 5rem)',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Left: era meta */}
        <div style={{ paddingRight: 'clamp(2.5rem, 6vw, 5rem)' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: SPINE_GOLD,
            marginBottom: '0.875rem',
          }}>
            ERA {era.num} · {era.range}
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)',
            fontWeight: 700,
            color: 'var(--color-snow)',
            lineHeight: 1.02,
            letterSpacing: '-0.03em',
            margin: '0 0 1.25rem',
          }}>
            {era.name}
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(0.875rem, 1.2vw, 0.95rem)',
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.78,
            margin: 0,
          }}>
            {era.desc}
          </p>
        </div>

        {/* Right: pull quote */}
        <div style={{
          paddingLeft: 'clamp(2.5rem, 6vw, 5rem)',
          display: 'flex',
          alignItems: 'center',
        }}>
          <blockquote style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 'clamp(1.1rem, 2vw, 1.55rem)',
            color: 'rgba(255,255,255,0.72)',
            lineHeight: 1.5,
            margin: 0,
            letterSpacing: '-0.015em',
          }}>
            {era.quote}
          </blockquote>
        </div>
      </div>

      {/* ── Spine events ── */}
      {events.map((event, i) => {
        const cat = CAT[event.category] ?? { color: SPINE_GOLD, label: event.category };
        return (
          <div
            key={`spine-${event.year}-${i}`}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              paddingBottom: 'clamp(2.25rem, 4vw, 3.5rem)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Left: category label + event title (right-aligned toward spine) */}
            <div style={{ paddingRight: 'clamp(2.5rem, 6vw, 5rem)', textAlign: 'right' }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.57rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: cat.color,
                marginBottom: '0.35rem',
              }}>
                {cat.label}
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.2rem, 2.2vw, 1.75rem)',
                fontWeight: 700,
                color: 'var(--color-snow)',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}>
                {event.title}
              </div>
            </div>

            {/* Right: brief description (left-aligned from spine) */}
            <div style={{ paddingLeft: 'clamp(2.5rem, 6vw, 5rem)', paddingTop: '0.35rem' }}>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.42)',
                lineHeight: 1.68,
                margin: 0,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical' as const,
                WebkitLineClamp: 3,
              }}>
                {event.description}
              </p>
            </div>

            {/* Gold dot on spine */}
            <div aria-hidden style={{
              position: 'absolute',
              left: '50%',
              top: '0.35rem',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: SPINE_GOLD,
              boxShadow: `0 0 0 3px rgba(6,8,10,1), 0 0 10px ${SPINE_GOLD}BB, 0 0 20px ${SPINE_GOLD}55`,
              transform: 'translateX(-50%)',
              zIndex: 2,
            }} />
          </div>
        );
      })}

      {/* ── Photo card grid ── */}
      {events.length > 0 && (
        <div style={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(220px, 22vw, 285px), 1fr))',
          gap: '1.125rem',
          paddingTop: 'clamp(1rem, 3vw, 2rem)',
        }}>
          {events.map((event, i) => (
            <PhotoCard key={`card-${event.year}-${i}`} event={event} />
          ))}
        </div>
      )}

      {events.length === 0 && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.15)', position: 'relative', zIndex: 1 }}>
          No events match the active filter.
        </p>
      )}
    </div>
  );
}

/* ─── Main Timeline component ────────────────────────────────────────────── */
export default function Timeline() {
  const { events }  = useTimeline();
  const [filter, setFilter]     = useState<Filter>('all');
  const [search, setSearch]     = useState('');
  const [activeEra, setActiveEra] = useState<EraId>('medieval');
  const eraRefs = useRef<Partial<Record<EraId, HTMLElement | null>>>({});

  const allEvents = events as TimelineEvent[];
  const docCount  = allEvents.filter(e => e.doc).length;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allEvents.filter(e => {
      if (filter !== 'all' && e.category !== filter) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        String(e.year).includes(q) ||
        (e.place ?? '').toLowerCase().includes(q)
      );
    });
  }, [allEvents, filter, search]);

  const grouped = useMemo(() =>
    ERAS.map(era => ({
      era,
      events: filtered.filter(e => e.year >= era.from && e.year <= era.to),
    })),
  [filtered]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-era') as EraId;
            if (id) setActiveEra(id);
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px' },
    );
    ERAS.forEach(era => {
      const el = eraRefs.current[era.id];
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const scrollToEra = (id: EraId) => {
    eraRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section id="history" style={{ position: 'relative', zIndex: 1, paddingBottom: 'var(--section-py)' }}>
      <div className="section-mist-top" />

      {/* ══ Sticky archive header ══════════════════════════════════════════ */}
      <div style={{
        position: 'sticky',
        top: 72,
        zIndex: 20,
        background: 'rgba(6,8,10,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Row 1: Archive name · tagline · stats */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0.625rem clamp(1rem, 5vw, 3rem)',
          gap: '2rem',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-snow)', whiteSpace: 'nowrap', flexShrink: 0 }}>
            Kashmir Research Archive
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.57rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', flex: 1, textAlign: 'center', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            700 Years. One Valley. No Easy Answer.
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0', flexShrink: 0 }}>
            {[
              { n: allEvents.length, label: 'EVENTS' },
              { n: docCount,         label: 'SOURCES' },
              { n: '1339–2026',      label: 'YEARS' },
            ].map((s, i) => (
              <div key={s.label} style={{
                textAlign: 'center', padding: '0 1rem',
                borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none',
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color: 'var(--color-snow)', lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.48rem', letterSpacing: '0.16em', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: Era tabs + filter */}
        <div style={{
          display: 'flex',
          alignItems: 'stretch',
          padding: '0 clamp(1rem, 5vw, 3rem)',
          overflowX: 'auto',
          gap: '0',
        }}>
          {/* ALL ERAS tab */}
          <button
            onClick={() => eraRefs.current['medieval']?.closest('section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '0.7rem 0.875rem', background: 'none', border: 'none',
              borderBottom: activeEra === 'medieval' ? `2px solid ${SPINE_GOLD}` : '2px solid transparent',
              color: 'rgba(255,255,255,0.55)', cursor: 'pointer', whiteSpace: 'nowrap', lineHeight: 1,
            }}
          >
            All Eras
          </button>

          {ERAS.map(era => {
            const on = activeEra === era.id;
            return (
              <button
                key={era.id}
                onClick={() => scrollToEra(era.id)}
                aria-current={on ? 'true' : undefined}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.08em', textTransform: 'uppercase',
                  padding: '0.7rem 0.875rem', background: 'none', border: 'none',
                  borderBottom: on ? `2px solid ${SPINE_GOLD}` : '2px solid transparent',
                  color: on ? SPINE_GOLD : 'rgba(255,255,255,0.35)',
                  cursor: 'pointer', whiteSpace: 'nowrap', lineHeight: 1, transition: 'color 0.15s',
                }}
              >
                {era.tab}
              </button>
            );
          })}

          {/* Separator + filter */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem', paddingLeft: '1.5rem', borderLeft: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.53rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', marginRight: '0.25rem' }}>
              Filter:
            </span>
            {(['all', 'political', 'conflict', 'cultural'] as Filter[]).map(f => {
              const on = filter === f;
              const color = f === 'all' ? 'rgba(255,255,255,0.75)' : CAT[f]?.color ?? '#fff';
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.53rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                    padding: '0.22rem 0.6rem',
                    borderRadius: '20px',
                    border: `1px solid ${on ? color : 'rgba(255,255,255,0.12)'}`,
                    background: on ? (f === 'all' ? 'rgba(255,255,255,0.09)' : `${color}18`) : 'transparent',
                    color: on ? color : 'rgba(255,255,255,0.32)',
                    cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap', lineHeight: 1.6,
                  }}
                >
                  {f === 'all' ? 'All' : CAT[f]?.label}
                </button>
              );
            })}

            {/* Search */}
            <div style={{ position: 'relative', marginLeft: '0.375rem' }}>
              <span style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem', pointerEvents: 'none' }}>⌕</span>
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
                style={{
                  width: '120px', padding: '0.28rem 0.5rem 0.28rem 1.4rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-body)', fontSize: '0.8rem',
                  color: 'var(--color-snow)', outline: 'none', cursor: 'text',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ══ Content ════════════════════════════════════════════════════════ */}
      <div className="section-container" style={{ paddingTop: 'clamp(3rem, 6vw, 5rem)' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '6rem 0' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'rgba(255,255,255,0.25)', marginBottom: '1.5rem' }}>
              No events match the active filter
            </p>
            <button
              onClick={() => { setSearch(''); setFilter('all'); }}
              style={{
                background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '5px',
                padding: '0.5rem 1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
                letterSpacing: '0.13em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
              }}
            >
              Clear filters
            </button>
          </div>
        )}

        {grouped.map(({ era, events: eraEvents }) => (
          <EraBlock
            key={era.id}
            era={era}
            events={eraEvents}
            eraRef={el => { eraRefs.current[era.id] = el; }}
          />
        ))}

        {/* Archive closing mark */}
        {filtered.length > 0 && (
          <div style={{ textAlign: 'center', paddingTop: '2rem', paddingBottom: '1rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '32px', height: '1px', background: `linear-gradient(to right, transparent, ${SPINE_GOLD}60)` }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)' }}>
                {allEvents.length} Events · {docCount} Primary Sources · 1339 – 2026
              </span>
              <div style={{ width: '32px', height: '1px', background: `linear-gradient(to left, transparent, ${SPINE_GOLD}60)` }} />
            </div>
          </div>
        )}
      </div>

      <div className="section-mist-bottom" />
    </section>
  );
}
