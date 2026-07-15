'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useTimeline } from '@/hooks/useTimeline';
import type { TimelineEvent } from '@/types/api';

/* ── Eras ─────────────────────────────────────────────────────────────── */
const ERAS = [
  {
    id: 'medieval',
    name: 'Before the Wound',
    range: '1339 – 1845',
    tagline: 'Kingdoms, Mughals, and Sikhs — centuries before the map was drawn in blood.',
    from: 1339, to: 1845,
    color: '#4A7B8C',
    bg: 'rgba(74,123,140,0.06)',
  },
  {
    id: 'colonial',
    name: 'Sold, Not Heard',
    range: '1846 – 1946',
    tagline: 'The British sell a people for 75 lakh rupees. A century of Dogra rule follows.',
    from: 1846, to: 1946,
    color: '#8B6914',
    bg: 'rgba(139,105,20,0.07)',
  },
  {
    id: 'partition',
    name: 'The Unfinished Partition',
    range: '1947 – 1988',
    tagline: 'Independence divides a subcontinent — but not this question. Three wars. One unresolved border.',
    from: 1947, to: 1988,
    color: '#8B2F3F',
    bg: 'rgba(139,47,63,0.08)',
  },
  {
    id: 'insurgency',
    name: 'Fire Season',
    range: '1989 – 2018',
    tagline: 'Armed insurgency erupts. An estimated 70,000 dead. 250,000 Pandits displaced. Three decades of fire.',
    from: 1989, to: 2018,
    color: '#B85C38',
    bg: 'rgba(184,92,56,0.07)',
  },
  {
    id: 'present',
    name: 'The New Reality',
    range: '2019 – Present',
    tagline: 'Article 370 revoked. Statehood dissolved. Operation Sindoor. The question remains open.',
    from: 2019, to: 9999,
    color: '#7B5EA7',
    bg: 'rgba(123,94,167,0.07)',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  political:    '#C97B2B',
  conflict:     '#8B2F3F',
  cultural:     '#4A7B8C',
  humanitarian: '#5A7B5A',
};

const CATEGORY_LABELS: Record<string, string> = {
  political: 'Political', conflict: 'Conflict',
  cultural: 'Cultural', humanitarian: 'Humanitarian',
};

type Filter = 'all' | 'political' | 'conflict' | 'cultural' | 'humanitarian';

/* ── Source Document Panel ─────────────────────────────────────────────── */
function SourcePanel({ doc, onClose }: { doc: TimelineEvent['doc']; onClose: () => void }) {
  if (!doc) return null;
  return (
    <div style={{
      marginTop: '1rem',
      padding: '1rem 1.25rem',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(201,123,43,0.25)',
      borderRadius: '6px',
      position: 'relative',
    }}>
      <button
        onClick={onClose}
        aria-label="Close source"
        style={{
          position: 'absolute', top: '0.75rem', right: '0.75rem',
          background: 'none', border: 'none', color: 'var(--color-ash-text)',
          fontSize: '1rem', cursor: 'pointer', lineHeight: 1,
        }}
      >×</button>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
        letterSpacing: '0.18em', textTransform: 'uppercase',
        color: '#C97B2B', marginBottom: '0.35rem',
      }}>
        Primary Source · {doc.kind}
      </div>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: '1rem',
        color: 'var(--color-snow)', marginBottom: '0.5rem',
      }}>
        {doc.name}
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
        color: 'var(--color-ash-text)', marginBottom: '0.75rem',
      }}>
        {doc.date} · {doc.source}
      </div>
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: '0.875rem',
        color: 'var(--color-snow-dim)', lineHeight: 1.65,
        marginBottom: '0.75rem',
      }}>
        {doc.desc}
      </p>
      <a
        href={doc.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: '#C97B2B', textDecoration: 'none',
          borderBottom: '1px solid rgba(201,123,43,0.4)',
          paddingBottom: '1px',
        }}
      >
        Read full document →
      </a>
    </div>
  );
}

/* ── Event Card ────────────────────────────────────────────────────────── */
function EventCard({ event, eraColor }: { event: TimelineEvent; eraColor: string }) {
  const [expanded, setExpanded] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const catColor = CATEGORY_COLORS[event.category] ?? eraColor;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; } },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: 0, transform: 'translateY(24px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        display: 'grid', gridTemplateColumns: '72px 1fr',
        gap: '0 1.25rem', paddingBottom: '2rem',
      }}
    >
      {/* Year + spine */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '2px' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
          fontWeight: 700, color: eraColor, letterSpacing: '0.05em',
          marginBottom: '0.5rem', textAlign: 'center',
        }}>
          {event.year}
        </div>
        <div style={{ width: '1px', flexGrow: 1, background: `${eraColor}30` }} />
      </div>

      {/* Card */}
      <div style={{
        background: 'rgba(255,255,255,0.025)',
        border: `1px solid rgba(255,255,255,0.07)`,
        borderLeft: `3px solid ${catColor}`,
        borderRadius: '8px',
        padding: '1rem 1.25rem',
        cursor: 'pointer',
        transition: 'background 0.2s',
      }}
        onClick={() => setExpanded(e => !e)}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.025)'; }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{
            fontFamily: 'var(--font-body)', fontWeight: 600,
            fontSize: 'clamp(0.95rem, 1.5vw, 1.05rem)',
            color: 'var(--color-snow)', lineHeight: 1.3,
          }}>
            {event.title}
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: catColor, whiteSpace: 'nowrap', flexShrink: 0,
            border: `1px solid ${catColor}40`, borderRadius: '3px',
            padding: '2px 6px', marginTop: '2px',
          }}>
            {CATEGORY_LABELS[event.category]}
          </div>
        </div>

        {/* Location */}
        {event.place && (
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
            letterSpacing: '0.12em', color: 'var(--color-ash-text)',
            marginBottom: '0.6rem',
          }}>
            📍 {event.place}
          </div>
        )}

        {/* Description — always show, expand for full */}
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '0.9rem',
          color: 'var(--color-snow-dim)', lineHeight: 1.7,
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: expanded ? 'unset' : 3,
          WebkitBoxOrient: 'vertical' as const,
          overflow: expanded ? 'visible' : 'hidden',
        }}>
          {event.description}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
            style={{
              background: 'none', border: 'none', padding: 0,
              fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--color-ash-text)', cursor: 'pointer',
            }}
          >
            {expanded ? '↑ Less' : '↓ Read more'}
          </button>

          {event.doc && (
            <button
              onClick={e => { e.stopPropagation(); setExpanded(true); setShowSource(v => !v); }}
              style={{
                background: 'none', border: 'none', padding: 0,
                fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: '#C97B2B', cursor: 'pointer',
                textDecoration: showSource ? 'underline' : 'none',
              }}
            >
              📄 Primary Source
            </button>
          )}
        </div>

        {showSource && event.doc && (
          <SourcePanel doc={event.doc} onClose={() => setShowSource(false)} />
        )}
      </div>
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────────────────── */
export default function Timeline() {
  const { events } = useTimeline();
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [activeEra, setActiveEra] = useState<string | null>(null);
  const eraRefs = useRef<Record<string, HTMLElement | null>>({});
  const sectionRef = useRef<HTMLElement>(null);

  const filtered = useMemo(() => {
    return (events as TimelineEvent[]).filter(e => {
      const matchCat = filter === 'all' || e.category === filter;
      const q = search.toLowerCase();
      const matchSearch = !q || e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || String(e.year).includes(q);
      return matchCat && matchSearch;
    });
  }, [events, filter, search]);

  /* Highlight active era on scroll */
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveEra(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -50% 0px' },
    );
    ERAS.forEach(era => {
      const el = eraRefs.current[era.id];
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const scrollToEra = (id: string) => {
    eraRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const eventsByEra = useMemo(() => {
    return ERAS.map(era => ({
      era,
      events: filtered.filter(e => e.year >= era.from && e.year <= era.to),
    }));
  }, [filtered]);

  const totalShown = filtered.length;
  const hasSource = (events as TimelineEvent[]).filter(e => e.doc).length;

  return (
    <section
      id="history"
      ref={sectionRef}
      style={{ position: 'relative', zIndex: 1, padding: 'var(--section-py) 0' }}
    >
      <div className="section-mist-top" />
      <div className="section-container">

        {/* Header */}
        <div style={{ maxWidth: '680px', marginBottom: 'clamp(2.5rem, 5vw, 4rem)' }}>
          <span className="eyebrow">History</span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 400, color: 'var(--color-snow)',
            lineHeight: 1.1, marginBottom: '1rem',
          }}>
            700 years of a people's story.
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
            color: 'var(--color-snow-dim)', lineHeight: 1.7,
            marginBottom: '0.5rem',
          }}>
            An interactive research archive spanning the medieval sultanate to Operation Sindoor.
            {hasSource > 0 && (
              <> {hasSource} events link directly to primary source documents — treaties, UN resolutions, constitutional orders, court judgments.</>
            )}
          </p>
        </div>

        {/* Search + filters */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '0.75rem',
          marginBottom: '2.5rem', alignItems: 'center',
        }}>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search events, years, places…"
            style={{
              flex: '1 1 240px', minWidth: '220px',
              padding: '0.55rem 1rem',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              fontFamily: 'var(--font-body)', fontSize: '0.9rem',
              color: 'var(--color-snow)',
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {(['all', 'political', 'conflict', 'cultural', 'humanitarian'] as Filter[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  padding: '0.4rem 0.8rem', borderRadius: '4px',
                  border: `1px solid ${filter === f ? (CATEGORY_COLORS[f] ?? 'var(--color-saffron)') : 'rgba(255,255,255,0.12)'}`,
                  background: filter === f ? `${CATEGORY_COLORS[f] ?? 'var(--color-saffron)'}18` : 'transparent',
                  color: filter === f ? (CATEGORY_COLORS[f] ?? 'var(--color-saffron)') : 'var(--color-ash-text)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {f === 'all' ? `All (${totalShown})` : CATEGORY_LABELS[f]}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'clamp(160px,18vw,220px) 1fr', gap: '0 3rem', alignItems: 'start' }}>

          {/* Left: Era nav (sticky) */}
          <div style={{ position: 'sticky', top: '5rem' }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--color-ash-text)', marginBottom: '1rem',
            }}>
              Jump to era
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {ERAS.map(era => {
                const count = eventsByEra.find(e => e.era.id === era.id)?.events.length ?? 0;
                const isActive = activeEra === era.id;
                return (
                  <button
                    key={era.id}
                    onClick={() => scrollToEra(era.id)}
                    style={{
                      textAlign: 'left', border: 'none',
                      padding: '0.5rem 0.75rem',
                      borderLeft: `2px solid ${isActive ? era.color : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: '0 4px 4px 0',
                      background: isActive ? `${era.color}0f` : 'transparent',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
                      letterSpacing: '0.1em',
                      color: isActive ? era.color : 'var(--color-ash-text)',
                      marginBottom: '1px',
                    }}>
                      {era.range}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-body)', fontSize: '0.78rem',
                      color: isActive ? 'var(--color-snow)' : 'var(--color-snow-dim)',
                      lineHeight: 1.3, fontWeight: isActive ? 600 : 400,
                    }}>
                      {era.name}
                    </div>
                    {count > 0 && (
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
                        color: `${era.color}80`, marginTop: '2px',
                      }}>
                        {count} event{count !== 1 ? 's' : ''}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Source legend */}
            <div style={{
              marginTop: '2rem', paddingTop: '1.5rem',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                letterSpacing: '0.18em', textTransform: 'uppercase',
                color: 'var(--color-ash-text)', marginBottom: '0.75rem',
              }}>Legend</div>
              {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: color, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-ash-text)' }}>
                    {CATEGORY_LABELS[cat]}
                  </span>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.6rem' }}>
                <span style={{ fontSize: '0.7rem' }}>📄</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-ash-text)' }}>
                  Primary source
                </span>
              </div>
            </div>
          </div>

          {/* Right: Events by era */}
          <div>
            {eventsByEra.map(({ era, events: eraEvents }) => {
              if (eraEvents.length === 0 && (filter !== 'all' || search)) return null;
              return (
                <div
                  key={era.id}
                  id={era.id}
                  ref={el => { eraRefs.current[era.id] = el; }}
                  style={{ marginBottom: '3.5rem' }}
                >
                  {/* Era header */}
                  <div style={{
                    padding: '1.25rem 1.5rem',
                    background: era.bg,
                    border: `1px solid ${era.color}25`,
                    borderLeft: `4px solid ${era.color}`,
                    borderRadius: '8px',
                    marginBottom: '2rem',
                  }}>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                      letterSpacing: '0.18em', textTransform: 'uppercase',
                      color: era.color, marginBottom: '0.3rem',
                    }}>
                      {era.range}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
                      color: 'var(--color-snow)', marginBottom: '0.4rem',
                    }}>
                      {era.name}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-display)', fontStyle: 'italic',
                      fontSize: '0.9rem', color: 'var(--color-snow-dim)', lineHeight: 1.5,
                    }}>
                      {era.tagline}
                    </div>
                  </div>

                  {/* Events */}
                  {eraEvents.length > 0 ? (
                    eraEvents.map((event, i) => (
                      <EventCard key={`${event.year}-${i}`} event={event} eraColor={era.color} />
                    ))
                  ) : (
                    <p style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                      color: 'var(--color-ash-text)', padding: '1rem 0',
                    }}>
                      No events match the current filter in this era.
                    </p>
                  )}
                </div>
              );
            })}

            {totalShown === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--color-snow-dim)' }}>
                  No events found.
                </div>
                <button
                  onClick={() => { setSearch(''); setFilter('all'); }}
                  style={{
                    marginTop: '1rem', background: 'none',
                    border: '1px solid rgba(255,255,255,0.15)',
                    padding: '0.5rem 1.25rem', borderRadius: '4px',
                    fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: 'var(--color-snow-dim)', cursor: 'pointer',
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}

            {/* Footer note */}
            <div style={{
              marginTop: '2rem', paddingTop: '2rem',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
              <p style={{
                fontFamily: 'var(--font-display)', fontStyle: 'italic',
                fontSize: 'clamp(0.9rem, 1.5vw, 1.05rem)',
                color: 'var(--color-snow-dim)', lineHeight: 1.7, margin: 0,
              }}>
                Every year in this archive carries the weight of a people's endurance.
                This timeline is a living document — as history unfolds, it will be updated.
              </p>
            </div>
          </div>

        </div>
      </div>
      <div className="section-mist-bottom" />
    </section>
  );
}
