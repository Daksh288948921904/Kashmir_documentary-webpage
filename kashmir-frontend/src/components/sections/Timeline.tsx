'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useTimeline } from '@/hooks/useTimeline';
import type { TimelineEvent, TimelineDoc } from '@/types/api';

/* ─── Historical eras ──────────────────────────────────────────────────── */
const ERAS = [
  {
    id: 'medieval' as const,
    num: 'I',
    name: 'Before the Wound',
    range: '1339 – 1845',
    tab: 'Before the Wound',
    desc: 'For five centuries Kashmir lived through dynastic change while retaining its cultural identity. The valley was governed by the Shah Mir Sultanate, the Mughals, Afghan Durranis, and finally the Sikh Empire — never partitioned, never stripped of its autonomy.',
    quote: 'Sultanates, Mughals, Afghans, and Sikhs — five centuries in which this valley belonged to itself.',
    from: 1339, to: 1845,
    accent: '#3A9CB5',
  },
  {
    id: 'colonial' as const,
    num: 'II',
    name: 'Sold, Not Heard',
    range: '1846 – 1946',
    tab: 'Sold, Not Heard',
    desc: 'The Treaty of Amritsar transferred Kashmir to the Dogra Maharaja Gulab Singh for seventy-five lakh Nanakshahee rupees. No Kashmiri was consulted. For a century the people lived under hereditary rule, excluded from power, until the 1930s brought the first stirrings of political consciousness.',
    quote: 'The British sell an entire people to a Dogra maharaja for ₹75 lakh. No Kashmiri is present at the table.',
    from: 1846, to: 1946,
    accent: '#C9901A',
  },
  {
    id: 'partition' as const,
    num: 'III',
    name: 'The Unfinished Partition',
    range: '1947 – 1988',
    tab: 'Unfinished Partition',
    desc: "Independence divides a subcontinent — but not this question. Kashmir's accession is contested from day one. Three wars, UN resolutions, a special constitutional status, and a plebiscite promised but never held. A generation grows up in a valley caught between two nuclear powers.",
    quote: 'Three wars. A UN resolution. No plebiscite. Independence divides a subcontinent — but not this question.',
    from: 1947, to: 1988,
    accent: '#C03050',
  },
  {
    id: 'fire' as const,
    num: 'IV',
    name: 'Fire Season',
    range: '1989 – 2018',
    tab: 'Fire Season',
    desc: 'The valley erupts. Armed insurgency begins; the Kashmiri Pandit community is displaced in the winter of 1990; an estimated 70,000 people die over three decades. The AFSPA blankets the region. Dialogue is attempted and abandoned. The ceasefire line hardens into a Line of Control.',
    quote: 'Armed insurgency. 250,000 Pandits displaced. An estimated 70,000 dead. Three decades of fire.',
    from: 1989, to: 2018,
    accent: '#D4622A',
  },
  {
    id: 'present' as const,
    num: 'V',
    name: 'The New Reality',
    range: '2019 – Present',
    tab: 'The New Reality',
    desc: 'On 5 August 2019 India revokes Article 370, bifurcates Jammu and Kashmir into two Union Territories, and suspends statehood. A communications blackout follows. New domicile laws are introduced. Operation Sindoor reshapes the security calculus. The archive remains open.',
    quote: 'Article 370 revoked. Statehood dissolved. Operation Sindoor. The wound remains open.',
    from: 2019, to: 9999,
    accent: '#7C5EC8',
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

/* ─── Primary source panel ─────────────────────────────────────────────── */
function DocPanel({ doc, onClose }: { doc: TimelineDoc; onClose: () => void }) {
  return (
    <div style={{
      marginTop: '1rem',
      background: 'rgba(201,144,26,0.07)',
      border: '1px solid rgba(201,144,26,0.35)',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 0 24px rgba(201,144,26,0.08)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.6rem 1rem',
        background: 'rgba(201,144,26,0.12)',
        borderBottom: '1px solid rgba(201,144,26,0.25)',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.57rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#C9901A',
        }}>
          Primary Source · {doc.kind}
        </span>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '1rem', cursor: 'pointer', lineHeight: 1, padding: '0 0 0 0.75rem' }}
        >×</button>
      </div>
      <div style={{ padding: '0.875rem 1.1rem 1.1rem' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--color-snow)', lineHeight: 1.3, marginBottom: '0.25rem' }}>
          {doc.name}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.07em', color: 'rgba(201,144,26,0.75)', marginBottom: '0.75rem' }}>
          {doc.date} · {doc.source}
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--color-snow-dim)', lineHeight: 1.72, margin: '0 0 0.875rem' }}>
          {doc.desc}
        </p>
        <a
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: '#C9901A', textDecoration: 'none',
            borderBottom: '1px solid rgba(201,144,26,0.35)', paddingBottom: '1px',
          }}
        >
          Read full document →
        </a>
      </div>
    </div>
  );
}

/* ─── Event card ────────────────────────────────────────────────────────── */
function EventCard({ event, accent }: { event: TimelineEvent; accent: string }) {
  const [showDoc, setShowDoc]   = useState(false);
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cat = CAT[event.category] ?? { color: accent, label: event.category };
  const isLong = event.description.length > 220;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        obs.disconnect();
      }
    }, { threshold: 0.06 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(255,255,255,0.032)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'opacity 0.5s ease, transform 0.5s ease, box-shadow 0.2s',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 1px ${accent}35, 0 8px 32px rgba(0,0,0,0.28)`; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
    >
      {/* Card header — year + category + location */}
      <div style={{
        position: 'relative',
        background: `linear-gradient(135deg, ${accent}1E 0%, ${accent}07 100%)`,
        borderBottom: `1px solid ${accent}22`,
        padding: '1rem 1.1rem 0.875rem',
        overflow: 'hidden',
      }}>
        {/* Ghost year watermark */}
        <div aria-hidden style={{
          position: 'absolute',
          right: '0.25rem',
          top: '-1rem',
          fontFamily: 'var(--font-display)',
          fontSize: '5.5rem',
          fontWeight: 700,
          color: accent,
          opacity: 0.07,
          lineHeight: 1,
          userSelect: 'none',
          letterSpacing: '-0.04em',
          pointerEvents: 'none',
        }}>
          {event.year}
        </div>

        {/* Category badge + location row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.55rem' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.54rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: cat.color,
            border: `1px solid ${cat.color}42`,
            borderRadius: '3px',
            padding: '2px 7px',
          }}>
            {cat.label}
          </span>
          {event.place && (
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.54rem',
              color: 'rgba(255,255,255,0.38)',
              letterSpacing: '0.05em',
            }}>
              ◦ {event.place}
            </span>
          )}
        </div>

        {/* Year — visual anchor */}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2.1rem',
          fontWeight: 700,
          color: accent,
          lineHeight: 1,
          letterSpacing: '-0.025em',
          textShadow: `0 0 16px ${accent}55`,
        }}>
          {event.year}
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '0.875rem 1.1rem 1.1rem', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(0.9rem, 1.5vw, 1rem)',
          color: 'var(--color-snow)',
          fontWeight: 500,
          lineHeight: 1.28,
          margin: 0,
        }}>
          {event.title}
        </h3>

        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.855rem',
          color: 'var(--color-snow-dim)',
          lineHeight: 1.72,
          margin: 0,
          flexGrow: 1,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical' as const,
          WebkitLineClamp: expanded || !isLong ? 'unset' : 4,
        }}>
          {event.description}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', alignItems: 'center', paddingTop: '0.2rem' }}>
          {isLong && (
            <button
              onClick={() => setExpanded(v => !v)}
              style={{
                background: 'none', border: 'none', padding: 0,
                fontFamily: 'var(--font-mono)', fontSize: '0.56rem',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.28)', cursor: 'pointer',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.28)'; }}
            >
              {expanded ? '↑ Less' : '↓ Read more'}
            </button>
          )}
          {event.doc && (
            <button
              onClick={() => { setExpanded(true); setShowDoc(v => !v); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                padding: '0.22rem 0.6rem',
                background: showDoc ? 'rgba(201,144,26,0.2)' : 'rgba(201,144,26,0.08)',
                border: `1px solid ${showDoc ? 'rgba(201,144,26,0.58)' : 'rgba(201,144,26,0.3)'}`,
                borderRadius: '3px',
                fontFamily: 'var(--font-mono)', fontSize: '0.56rem',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: showDoc ? '#C9901A' : 'rgba(201,144,26,0.85)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(201,144,26,0.18)'; el.style.borderColor = 'rgba(201,144,26,0.55)'; el.style.color = '#C9901A'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = showDoc ? 'rgba(201,144,26,0.2)' : 'rgba(201,144,26,0.08)'; el.style.borderColor = showDoc ? 'rgba(201,144,26,0.58)' : 'rgba(201,144,26,0.3)'; el.style.color = showDoc ? '#C9901A' : 'rgba(201,144,26,0.85)'; }}
            >
              📄 Primary source
            </button>
          )}
        </div>

        {showDoc && event.doc && (
          <DocPanel doc={event.doc} onClose={() => setShowDoc(false)} />
        )}
      </div>
    </div>
  );
}

/* ─── Era intro — two-column header block ───────────────────────────────── */
function EraIntro({ era, count }: { era: typeof ERAS[number]; count: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = '0';
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.style.opacity = '1'; obs.disconnect(); }
    }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'clamp(1.5rem, 4vw, 3.5rem)',
        marginBottom: 'clamp(1.75rem, 3vw, 2.5rem)',
        paddingBottom: 'clamp(1.75rem, 3vw, 2.5rem)',
        borderBottom: `1px solid ${era.accent}1C`,
        transition: 'opacity 0.7s ease',
      }}
    >
      {/* Left: era label + name + description */}
      <div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6rem',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: era.accent,
          marginBottom: '0.75rem',
          textShadow: `0 0 10px ${era.accent}60`,
        }}>
          ERA {era.num} · {era.range} · {count} event{count !== 1 ? 's' : ''}
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
          fontWeight: 700,
          color: 'var(--color-snow)',
          lineHeight: 1.06,
          letterSpacing: '-0.025em',
          margin: '0 0 0.875rem',
        }}>
          {era.name}
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'clamp(0.85rem, 1.2vw, 0.925rem)',
          color: 'rgba(255,255,255,0.56)',
          lineHeight: 1.78,
          margin: 0,
        }}>
          {era.desc}
        </p>
      </div>

      {/* Right: pull quote */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 'clamp(1.25rem, 2.5vw, 2rem)',
        borderLeft: `3px solid ${era.accent}45`,
      }}>
        <blockquote style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 'clamp(0.975rem, 1.6vw, 1.2rem)',
          color: 'rgba(255,255,255,0.72)',
          lineHeight: 1.6,
          margin: 0,
          letterSpacing: '-0.01em',
        }}>
          "{era.quote}"
        </blockquote>
      </div>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────────────── */
export default function Timeline() {
  const { events }  = useTimeline();
  const [filter, setFilter]     = useState<Filter>('all');
  const [search, setSearch]     = useState('');
  const [activeEra, setActiveEra] = useState<EraId>('medieval');
  const eraRefs   = useRef<Partial<Record<EraId, HTMLElement | null>>>({});
  const sectionRef = useRef<HTMLElement>(null);

  const allEvents = events as TimelineEvent[];
  const docCount  = allEvents.filter(e => e.doc).length;

  /* Filter + search */
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

  /* Group by era */
  const grouped = useMemo(() =>
    ERAS.map(era => ({
      era,
      events: filtered.filter(e => e.year >= era.from && e.year <= era.to),
    })),
  [filtered]);

  /* Highlight active era on scroll */
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

  const activeEraData = ERAS.find(e => e.id === activeEra) ?? ERAS[0];

  return (
    <section
      id="history"
      ref={sectionRef}
      style={{ position: 'relative', zIndex: 1, paddingBottom: 'var(--section-py)' }}
    >
      <div className="section-mist-top" />

      {/* ══ Sticky archive header ══════════════════════════════════════════ */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        backgroundColor: 'rgba(6,8,10,0.96)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        {/* Top row — title · tagline · stats */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          padding: '0.625rem clamp(1rem, 4vw, 2.5rem)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--color-snow)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}>
            Kashmir Research Archive
          </span>

          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.57rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.28)',
            flex: 1,
            textAlign: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            700 Years · One Valley · No Easy Answer
          </span>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '1.25rem', flexShrink: 0 }}>
            {[
              { n: allEvents.length, label: 'Events' },
              { n: docCount, label: 'Sources' },
              { n: '1339–2026', label: 'Years' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center', lineHeight: 1 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-saffron)' }}>
                  {s.n}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginTop: '2px' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row — era tabs + filter pills + search */}
        <div style={{
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'space-between',
          padding: '0 clamp(1rem, 4vw, 2.5rem)',
          overflowX: 'auto',
          gap: '1rem',
        }}>
          {/* Era tabs */}
          <nav aria-label="Jump to era" style={{ display: 'flex', flexShrink: 0 }}>
            {ERAS.map(era => {
              const on = activeEra === era.id;
              return (
                <button
                  key={era.id}
                  onClick={() => scrollToEra(era.id)}
                  aria-current={on ? 'true' : undefined}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.57rem',
                    letterSpacing: '0.09em',
                    textTransform: 'uppercase',
                    padding: '0.625rem 0.75rem',
                    background: 'none',
                    border: 'none',
                    borderBottom: `2px solid ${on ? era.accent : 'transparent'}`,
                    color: on ? era.accent : 'rgba(255,255,255,0.35)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                    lineHeight: 1,
                  }}
                  onMouseEnter={e => { if (!on) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)'; }}
                  onMouseLeave={e => { if (!on) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'; }}
                >
                  {era.tab}
                  <span style={{ opacity: 0.45, marginLeft: '0.35rem', fontSize: '0.52rem' }}>
                    {era.range.split(' ')[0]}–{era.range.split('– ')[1] ?? ''}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Filter pills + search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0, paddingLeft: '0.5rem', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', marginRight: '0.15rem', whiteSpace: 'nowrap' }}>
              Filter:
            </span>
            {(['all', 'political', 'conflict', 'cultural', 'humanitarian'] as Filter[]).map(f => {
              const on = filter === f;
              const color = f === 'all' ? 'rgba(255,255,255,0.75)' : (CAT[f]?.color ?? 'white');
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.54rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '3px',
                    border: `1px solid ${on ? color : 'rgba(255,255,255,0.08)'}`,
                    background: on ? (f === 'all' ? 'rgba(255,255,255,0.08)' : `${color}18`) : 'transparent',
                    color: on ? color : 'rgba(255,255,255,0.28)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.6,
                  }}
                >
                  {f === 'all' ? 'All' : CAT[f]?.label}
                </button>
              );
            })}

            {/* Search */}
            <div style={{ position: 'relative', marginLeft: '0.25rem' }}>
              <span style={{ position: 'absolute', left: '0.55rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.22)', fontSize: '0.8rem', pointerEvents: 'none' }}>⌕</span>
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
                style={{
                  width: '130px',
                  padding: '0.28rem 0.6rem 0.28rem 1.5rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.8rem',
                  color: 'var(--color-snow)',
                  outline: 'none',
                  cursor: 'text',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ══ Content ════════════════════════════════════════════════════════ */}
      <div className="section-container" style={{ paddingTop: 'clamp(2.5rem, 5vw, 4rem)' }}>

        {/* Active era accent spine (decorative) */}
        <div aria-hidden style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          width: '1px',
          background: `linear-gradient(to bottom, transparent 0%, ${activeEraData.accent}18 15%, ${activeEraData.accent}10 85%, transparent 100%)`,
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          zIndex: 0,
          transition: 'background 0.6s ease',
        }} />

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '6rem 0', position: 'relative', zIndex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'rgba(255,255,255,0.28)', marginBottom: '1.5rem' }}>
              No events match the active filter
            </div>
            <button
              onClick={() => { setSearch(''); setFilter('all'); }}
              style={{
                background: 'none', border: '1px solid rgba(255,255,255,0.12)',
                padding: '0.5rem 1.5rem', borderRadius: '5px',
                fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
                letterSpacing: '0.13em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
              }}
            >
              Clear filters
            </button>
          </div>
        )}

        {/* ── Era sections ── */}
        {grouped.map(({ era, events: eraEvents }) => {
          if (eraEvents.length === 0 && filter !== 'all' && search === '') return null;

          return (
            <div
              key={era.id}
              data-era={era.id}
              ref={el => { eraRefs.current[era.id] = el; }}
              style={{ marginBottom: 'clamp(3.5rem, 7vw, 6rem)', scrollMarginTop: '8rem', position: 'relative', zIndex: 1 }}
            >
              <EraIntro era={era} count={eraEvents.length} />

              {eraEvents.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(240px, 28vw, 320px), 1fr))',
                  gap: '1.125rem',
                }}>
                  {eraEvents.map((event, i) => (
                    <EventCard key={`${event.year}-${i}`} event={event} accent={era.accent} />
                  ))}
                </div>
              ) : (
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  color: 'rgba(255,255,255,0.16)',
                  letterSpacing: '0.06em',
                }}>
                  No events in this era match the active filter.
                </p>
              )}
            </div>
          );
        })}

        {/* Archive closing note */}
        {filtered.length > 0 && (
          <div style={{
            marginTop: '1rem',
            padding: '2rem',
            textAlign: 'center',
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.6rem 1.25rem',
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px',
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-saffron)', boxShadow: '0 0 8px rgba(201,144,26,0.6)' }} />
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.58rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.28)',
              }}>
                Archive · {allEvents.length} events · {docCount} primary sources · 1339 – 2026
              </span>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-saffron)', boxShadow: '0 0 8px rgba(201,144,26,0.6)' }} />
            </div>
          </div>
        )}
      </div>

      <div className="section-mist-bottom" />
    </section>
  );
}
