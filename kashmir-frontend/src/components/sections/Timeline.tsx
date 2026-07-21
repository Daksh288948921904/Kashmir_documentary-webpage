'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useTimeline } from '@/hooks/useTimeline';
import type { TimelineEvent, TimelineDoc } from '@/types/api';

/* ─── Historical eras ──────────────────────────────────────────────────── */
const ERAS = [
  {
    id: 'medieval',
    num: '01',
    name: 'Before the Wound',
    range: '1339 – 1845',
    tagline: 'Sultanates, Mughals, Afghans, and Sikhs — five centuries in which this valley belonged to itself.',
    from: 1339, to: 1845,
    accent: '#3A9CB5',
  },
  {
    id: 'colonial',
    num: '02',
    name: 'Sold, Not Heard',
    range: '1846 – 1946',
    tagline: 'The British sell an entire people to a Dogra maharaja for ₹75 lakh. No Kashmiri is present at the table.',
    from: 1846, to: 1946,
    accent: '#C9901A',
  },
  {
    id: 'partition',
    num: '03',
    name: 'The Unfinished Partition',
    range: '1947 – 1988',
    tagline: 'Independence divides a subcontinent — but not this question. Three wars. A UN resolution. No plebiscite.',
    from: 1947, to: 1988,
    accent: '#C03050',
  },
  {
    id: 'fire',
    num: '04',
    name: 'Fire Season',
    range: '1989 – 2018',
    tagline: 'Armed insurgency. 250,000 Pandits displaced. An estimated 70,000 dead. Three decades of fire.',
    from: 1989, to: 2018,
    accent: '#D4622A',
  },
  {
    id: 'present',
    num: '05',
    name: 'The New Reality',
    range: '2019 – Present',
    tagline: 'Article 370 revoked. Statehood dissolved. Operation Sindoor. The wound remains open.',
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

/* ─── Primary source document ──────────────────────────────────────────── */
function DocPanel({ doc, onClose }: { doc: TimelineDoc; onClose: () => void }) {
  return (
    <div style={{
      marginTop: '1.25rem',
      background: 'rgba(201,144,26,0.07)',
      border: '1px solid rgba(201,144,26,0.35)',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 0 24px rgba(201,144,26,0.08)',
    }}>
      {/* Doc header bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.65rem 1rem',
        background: 'rgba(201,144,26,0.12)',
        borderBottom: '1px solid rgba(201,144,26,0.25)',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.58rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#C9901A',
        }}>
          Primary Source · {doc.kind}
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.35)', fontSize: '1rem',
            cursor: 'pointer', lineHeight: 1, padding: '0 0 0 0.75rem',
          }}
        >×</button>
      </div>

      <div style={{ padding: '1rem 1.25rem 1.25rem' }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1rem',
          color: 'var(--color-snow)',
          lineHeight: 1.3,
          marginBottom: '0.3rem',
        }}>
          {doc.name}
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.62rem',
          letterSpacing: '0.07em',
          color: 'rgba(201,144,26,0.75)',
          marginBottom: '0.875rem',
        }}>
          {doc.date} · {doc.source}
        </div>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.875rem',
          color: 'var(--color-snow-dim)',
          lineHeight: 1.72,
          margin: '0 0 1rem',
        }}>
          {doc.desc}
        </p>
        <a
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.62rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#C9901A',
            textDecoration: 'none',
            borderBottom: '1px solid rgba(201,144,26,0.35)',
            paddingBottom: '1px',
            cursor: 'pointer',
          }}
        >
          Read full document →
        </a>
      </div>
    </div>
  );
}

/* ─── Single event card ─────────────────────────────────────────────────── */
function EventCard({
  event,
  accent,
  isLast,
}: {
  event: TimelineEvent;
  accent: string;
  isLast: boolean;
}) {
  const [showDoc, setShowDoc] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cat = CAT[event.category] ?? { color: accent, label: event.category };
  const isLong = event.description.length > 280;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(22px)';
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        obs.disconnect();
      }
    }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        display: 'grid',
        gridTemplateColumns: '68px 1fr',
        gap: '0 1.25rem',
        transition: 'opacity 0.5s ease, transform 0.55s ease',
        paddingBottom: isLast ? 0 : '1.75rem',
      }}
    >
      {/* Year column */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.88rem',
          fontWeight: 700,
          color: accent,
          letterSpacing: '0.03em',
          textAlign: 'center',
          paddingTop: '0.85rem',
          lineHeight: 1,
          textShadow: `0 0 14px ${accent}80`,
        }}>
          {event.year}
        </div>
        {/* Timeline node dot */}
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: accent,
          boxShadow: `0 0 8px ${accent}CC, 0 0 18px ${accent}50`,
          margin: '0.45rem 0 0',
          flexShrink: 0,
        }} />
        {!isLast && (
          <div style={{
            width: '2px',
            flexGrow: 1,
            minHeight: '24px',
            background: `linear-gradient(to bottom, ${accent}70 0%, ${accent}12 100%)`,
            marginTop: '0.2rem',
            borderRadius: '1px',
          }} />
        )}
      </div>

      {/* Card */}
      <div style={{
        background: 'rgba(255,255,255,0.042)',
        border: '1px solid rgba(255,255,255,0.11)',
        borderLeft: `3px solid ${cat.color}`,
        borderRadius: '8px',
        padding: '0.9rem 1.1rem',
        transition: 'background 0.2s, box-shadow 0.2s',
        cursor: 'default',
      }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.065)'; el.style.boxShadow = `0 0 0 1px ${cat.color}40`; }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.042)'; el.style.boxShadow = 'none'; }}
      >
        {/* Title row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '0.75rem',
          marginBottom: '0.35rem',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(0.95rem, 1.6vw, 1.05rem)',
            color: 'var(--color-snow)',
            fontWeight: 500,
            lineHeight: 1.25,
            margin: 0,
          }}>
            {event.title}
          </h3>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.55rem',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: cat.color,
            border: `1px solid ${cat.color}38`,
            borderRadius: '3px',
            padding: '2px 6px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            marginTop: '2px',
          }}>
            {cat.label}
          </span>
        </div>

        {/* Place */}
        {event.place && (
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.48)',
            marginBottom: '0.65rem',
          }}>
            ◦ {event.place}
          </div>
        )}

        {/* Description */}
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
          color: 'var(--color-snow-dim)',
          lineHeight: 1.72,
          margin: '0 0 0.75rem',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical' as const,
          WebkitLineClamp: expanded || !isLong ? 'unset' : 3,
        }}>
          {event.description}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {isLong && (
            <button
              onClick={() => setExpanded(v => !v)}
              style={{
                background: 'none', border: 'none', padding: 0,
                fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.3)', cursor: 'pointer',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)'; }}
            >
              {expanded ? '↑ Less' : '↓ Read more'}
            </button>
          )}

          {event.doc && (
            <button
              onClick={() => { setExpanded(true); setShowDoc(v => !v); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.28rem 0.65rem',
                background: showDoc ? 'rgba(201,144,26,0.2)' : 'rgba(201,144,26,0.09)',
                border: `1px solid ${showDoc ? 'rgba(201,144,26,0.6)' : 'rgba(201,144,26,0.32)'}`,
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: showDoc ? '#C9901A' : 'rgba(201,144,26,0.85)',
                cursor: 'pointer', transition: 'all 0.15s',
                boxShadow: showDoc ? '0 0 12px rgba(201,144,26,0.25)' : 'none',
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(201,144,26,0.18)'; el.style.borderColor = 'rgba(201,144,26,0.55)'; el.style.color = '#C9901A'; el.style.boxShadow = '0 0 10px rgba(201,144,26,0.2)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = showDoc ? 'rgba(201,144,26,0.2)' : 'rgba(201,144,26,0.09)'; el.style.borderColor = showDoc ? 'rgba(201,144,26,0.6)' : 'rgba(201,144,26,0.32)'; el.style.color = showDoc ? '#C9901A' : 'rgba(201,144,26,0.85)'; el.style.boxShadow = showDoc ? '0 0 12px rgba(201,144,26,0.25)' : 'none'; }}
            >
              📄 {showDoc ? 'Hide source' : 'Primary source'}
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

/* ─── Era chapter header ────────────────────────────────────────────────── */
function EraHeader({ era, count }: { era: typeof ERAS[number]; count: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateX(-12px)';
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.style.opacity = '1';
        el.style.transform = 'translateX(0)';
        obs.disconnect();
      }
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        marginBottom: '2rem',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}
    >
      {/* Number + accent line */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1rem',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(3rem, 6vw, 5rem)',
          color: `${era.accent}35`,
          lineHeight: 1,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          userSelect: 'none',
          textShadow: `0 0 40px ${era.accent}25`,
        }}>
          {era.num}
        </span>
        <div style={{
          height: '2px',
          flexGrow: 1,
          background: `linear-gradient(to right, ${era.accent}A0, ${era.accent}25, transparent)`,
          borderRadius: '1px',
        }} />
      </div>

      <div style={{
        padding: '1.25rem 1.5rem',
        background: `${era.accent}0E`,
        border: `1px solid ${era.accent}30`,
        borderLeft: `4px solid ${era.accent}`,
        borderRadius: '0 8px 8px 0',
        boxShadow: `inset 4px 0 28px ${era.accent}0C`,
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: era.accent,
          marginBottom: '0.4rem',
          textShadow: `0 0 10px ${era.accent}60`,
        }}>
          {era.range} · {count} event{count !== 1 ? 's' : ''}
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.4rem, 3vw, 2rem)',
          color: 'var(--color-snow)',
          fontWeight: 400,
          lineHeight: 1.1,
          margin: '0 0 0.5rem',
        }}>
          {era.name}
        </h2>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 'clamp(0.875rem, 1.4vw, 0.975rem)',
          color: 'rgba(255,255,255,0.58)',
          lineHeight: 1.6,
          margin: 0,
        }}>
          {era.tagline}
        </p>
      </div>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────────────── */
export default function Timeline() {
  const { events } = useTimeline();
  const [filter, setFilter]   = useState<Filter>('all');
  const [search, setSearch]   = useState('');
  const [activeEra, setActiveEra] = useState<EraId>('medieval');
  const eraRefs = useRef<Partial<Record<EraId, HTMLElement | null>>>({});

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
      { rootMargin: '-25% 0px -65% 0px' },
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
    <section
      id="history"
      style={{ position: 'relative', zIndex: 1, padding: 'var(--section-py) 0' }}
    >
      <div className="section-mist-top" />
      <div className="section-container">

        {/* ── Section intro ── */}
        <div style={{ maxWidth: '700px', marginBottom: 'clamp(2.5rem, 5vw, 4rem)' }}>
          <span className="eyebrow">Research Archive</span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 5.5vw, 3.75rem)',
            fontWeight: 400,
            color: 'var(--color-snow)',
            lineHeight: 1.05,
            marginBottom: '1.1rem',
          }}>
            700 years.<br />One valley.<br />
            <span style={{ color: 'rgba(255,255,255,0.35)' }}>No easy answer.</span>
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(0.95rem, 1.5vw, 1.05rem)',
            color: 'var(--color-snow-dim)',
            lineHeight: 1.72,
            margin: '0 0 1.5rem',
          }}>
            An independent historical archive spanning the Shah Mir sultanate to Operation Sindoor.
            {docCount > 0 && (
              <> {docCount} events are linked to primary sources — treaties, UN resolutions, constitutional orders, and court judgments you can read in full.</>
            )}
          </p>

          {/* Stat pills */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {[
              { n: allEvents.length, label: 'Events' },
              { n: docCount, label: 'Primary sources' },
              { n: `${1339}–${2026}`, label: 'Years covered' },
            ].map(s => (
              <div key={s.label} style={{
                display: 'flex', alignItems: 'baseline', gap: '0.35rem',
                padding: '0.4rem 0.75rem',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: 'var(--color-saffron)',
                }}>
                  {s.n}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.58rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--color-ash-text)',
                }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Search + filter ── */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.6rem',
          marginBottom: '3rem',
          padding: '0.875rem 1rem',
          background: 'rgba(255,255,255,0.024)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '10px',
          alignItems: 'center',
        }}>
          <div style={{ position: 'relative', flex: '1 1 220px', minWidth: '180px' }}>
            <span style={{
              position: 'absolute', left: '0.7rem', top: '50%',
              transform: 'translateY(-50%)', pointerEvents: 'none',
              color: 'rgba(255,255,255,0.25)', fontSize: '0.9rem',
            }}>
              ⌕
            </span>
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search events, years, locations…"
              style={{
                width: '100%',
                padding: '0.5rem 0.875rem 0.5rem 1.875rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: '6px',
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                color: 'var(--color-snow)',
                outline: 'none',
                cursor: 'text',
              }}
            />
          </div>

          <div className="timeline-filter-bar" style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
            {(['all', 'political', 'conflict', 'cultural', 'humanitarian'] as Filter[]).map(f => {
              const on = filter === f;
              const color = f === 'all' ? 'var(--color-saffron)' : CAT[f]?.color ?? 'var(--color-saffron)';
              const cnt = f === 'all'
                ? filtered.length
                : filtered.filter(e => e.category === f).length;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6rem',
                    letterSpacing: '0.13em',
                    textTransform: 'uppercase',
                    padding: '0.38rem 0.7rem',
                    borderRadius: '4px',
                    border: `1px solid ${on ? color : 'rgba(255,255,255,0.1)'}`,
                    background: on ? (f === 'all' ? 'rgba(201,144,26,0.12)' : `${color}14`) : 'transparent',
                    color: on ? color : 'rgba(255,255,255,0.35)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {f === 'all' ? `All (${cnt})` : `${CAT[f]?.label} (${cnt})`}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Body grid ── */}
        <div className="timeline-body-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'clamp(150px, 15vw, 200px) 1fr',
          gap: '0 2.5rem',
          alignItems: 'start',
        }}>

          {/* ── Left sticky nav ── */}
          <div className="timeline-era-nav" style={{ position: 'sticky', top: '5rem' }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.56rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.25)',
              marginBottom: '0.75rem',
              paddingLeft: '0.75rem',
            }}>
              Eras
            </div>

            <nav aria-label="Jump to historical era">
              {ERAS.map(era => {
                const on = activeEra === era.id;
                const cnt = grouped.find(g => g.era.id === era.id)?.events.length ?? 0;
                return (
                  <button
                    key={era.id}
                    onClick={() => scrollToEra(era.id)}
                    aria-current={on ? 'true' : undefined}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      border: 'none',
                      background: on ? `${era.accent}18` : 'none',
                      padding: '0.5rem 0.75rem',
                      borderLeft: `2px solid ${on ? era.accent : 'rgba(255,255,255,0.07)'}`,
                      borderRadius: '0 5px 5px 0',
                      marginBottom: '2px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: on ? `inset 2px 0 10px ${era.accent}20` : 'none',
                    }}
                  >
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.58rem',
                      letterSpacing: '0.08em',
                      color: on ? era.accent : 'rgba(255,255,255,0.25)',
                      marginBottom: '1px',
                    }}>
                      {era.range}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.77rem',
                      color: on ? 'var(--color-snow)' : 'rgba(255,255,255,0.45)',
                      lineHeight: 1.3,
                      fontWeight: on ? 600 : 400,
                    }}>
                      {era.name}
                    </div>
                    {cnt > 0 && (
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.54rem',
                        color: on ? `${era.accent}80` : 'rgba(255,255,255,0.18)',
                        marginTop: '1px',
                      }}>
                        {cnt} event{cnt !== 1 ? 's' : ''}
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Category legend */}
            <div style={{
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.56rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.25)',
                marginBottom: '0.6rem',
                paddingLeft: '0.1rem',
              }}>
                Legend
              </div>
              {Object.entries(CAT).map(([key, { color, label }]) => (
                <div key={key} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.3rem',
                  paddingLeft: '0.1rem',
                }}>
                  <div style={{
                    width: '8px', height: '8px',
                    borderRadius: '50%',
                    background: color,
                    boxShadow: `0 0 6px ${color}90`,
                    flexShrink: 0,
                  }} />
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6rem',
                    color: 'rgba(255,255,255,0.5)',
                  }}>
                    {label}
                  </span>
                </div>
              ))}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '0.4rem',
                paddingLeft: '0.1rem',
              }}>
                <span style={{ fontSize: '0.6rem' }}>📄</span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6rem',
                  color: 'rgba(255,255,255,0.3)',
                }}>
                  Primary source
                </span>
              </div>
            </div>
          </div>

          {/* ── Event feed ── */}
          <div>
            {grouped.map(({ era, events: eraEvents }) => {
              /* Hide empty eras when filtering */
              if (eraEvents.length === 0 && (filter !== 'all' || search.trim() !== '')) return null;

              return (
                <div
                  key={era.id}
                  data-era={era.id}
                  ref={el => { eraRefs.current[era.id] = el; }}
                  style={{ marginBottom: '4.5rem', scrollMarginTop: '5rem' }}
                >
                  <EraHeader era={era} count={eraEvents.length} />

                  {eraEvents.length > 0 ? (
                    eraEvents.map((event, i) => (
                      <EventCard
                        key={`${event.year}-${i}`}
                        event={event}
                        accent={era.accent}
                        isLast={i === eraEvents.length - 1}
                      />
                    ))
                  ) : (
                    <p style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.7rem',
                      letterSpacing: '0.06em',
                      color: 'rgba(255,255,255,0.18)',
                      padding: '0.75rem 0',
                    }}>
                      No events in this era match the active filter.
                    </p>
                  )}
                </div>
              );
            })}

            {/* Empty state */}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem 0 3rem' }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.2rem',
                  color: 'rgba(255,255,255,0.3)',
                  marginBottom: '1.25rem',
                }}>
                  No events found
                </div>
                <button
                  onClick={() => { setSearch(''); setFilter('all'); }}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(255,255,255,0.12)',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '5px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    letterSpacing: '0.13em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.3)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; }}
                >
                  Clear filters
                </button>
              </div>
            )}

            {/* Closing note */}
            {filtered.length > 0 && (
              <div style={{
                marginTop: '1rem',
                paddingTop: '2.5rem',
                borderTop: '1px solid rgba(255,255,255,0.05)',
              }}>
                <p style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: 'clamp(0.9rem, 1.4vw, 1.05rem)',
                  color: 'rgba(255,255,255,0.22)',
                  lineHeight: 1.7,
                  margin: 0,
                }}>
                  Every year in this archive is a weight carried by real people.
                  This is a living document — updated as history unfolds.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="section-mist-bottom" />
    </section>
  );
}
