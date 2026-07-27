'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTimestamps } from '@/hooks/useTimestamps';
import { CONFIG } from '@/lib/config';
import { FILM } from '@/content/film';
import { api } from '@/lib/api';
import type { UserTimestamp, TimestampMarker } from '@/types/api';

gsap.registerPlugin(ScrollTrigger);

/* ── Constants ── */
const STORAGE_KEY = 'kashmir_user_timestamps';
const JWT_KEY     = 'ue_access';
const EMAIL_RE    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type AccessState = 'loading' | 'gate' | 'granted';

/* ── Helpers ── */
function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
function loadUserTimestamps(): UserTimestamp[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); }
  catch { return []; }
}
function saveUserTimestamps(ts: UserTimestamp[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ts));
}

/* ── Chapter Strip ── */
function ChapterStrip({
  markers, userTimestamps, currentTime, onSeek, onDeleteUser,
}: {
  markers: TimestampMarker[];
  userTimestamps: UserTimestamp[];
  currentTime: number;
  onSeek: (s: number) => void;
  onDeleteUser: (id: string) => void;
}) {
  const totalDuration = FILM.durationMinutes * 60;

  const allMarkers = [
    ...markers.map(m => ({ ...m, type: 'director' as const, id: `d-${m.timestamp_seconds}` })),
    ...userTimestamps.map(u => ({
      timestamp_seconds: u.timestamp_seconds, title: u.note,
      description: '', chapter: 'Your Moment', type: 'user' as const, id: u.id,
    })),
  ].sort((a, b) => a.timestamp_seconds - b.timestamp_seconds);

  const activeIdx = allMarkers.reduce((acc, m, i) => m.timestamp_seconds <= currentTime ? i : acc, 0);

  return (
    <div style={{ position: 'relative', paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-4)' }}>
      {/* Track line */}
      <div style={{
        position: 'absolute', top: '50%', left: 0, right: 0,
        height: '1px', backgroundColor: 'var(--color-ash-dim)', transform: 'translateY(-50%)',
      }}>
        <div style={{
          height: '100%', backgroundColor: 'var(--color-saffron)',
          width: `${(currentTime / totalDuration) * 100}%`, transition: 'width 0.5s',
        }} />
      </div>

      {/* Markers */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
        {allMarkers.map((m, i) => {
          const isActive = i === activeIdx;
          const isUser   = m.type === 'user';
          const pct      = (m.timestamp_seconds / totalDuration) * 100;
          return (
            <div
              key={m.id}
              data-cursor-hover
              title={`${formatTime(m.timestamp_seconds)} — ${m.title}`}
              onClick={() => onSeek(m.timestamp_seconds)}
              style={{
                position: 'absolute', left: `${pct}%`, transform: 'translateX(-50%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '6px', cursor: 'none', zIndex: 2,
              }}
            >
              <div style={{
                width: isUser ? '8px' : '10px', height: isUser ? '8px' : '10px',
                borderRadius: isUser ? '2px' : '50%',
                backgroundColor: isActive ? 'var(--color-saffron)' : isUser ? 'var(--color-snow-dim)' : 'var(--color-ash)',
                border: isActive ? '2px solid var(--color-saffron-glow)' : 'none',
                boxShadow: isActive ? 'var(--glow-saffron-sm)' : 'none',
                transition: 'all 300ms', transform: isUser ? 'rotate(45deg)' : 'none',
              }} />
              {isActive && (
                <div style={{
                  position: 'absolute', top: '18px',
                  backgroundColor: 'var(--color-deep-slate-hi)',
                  border: 'var(--border-saffron)', borderRadius: 'var(--radius-sm)',
                  padding: '4px 8px', whiteSpace: 'nowrap', zIndex: 10,
                }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.20em', color: 'var(--color-saffron)', textTransform: 'uppercase' }}>
                    {formatTime(m.timestamp_seconds)}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-snow)' }}>
                    {m.title}
                  </div>
                </div>
              )}
              {isUser && (
                <button
                  onClick={e => { e.stopPropagation(); onDeleteUser(m.id); }}
                  style={{ background: 'none', border: 'none', cursor: 'none', color: 'var(--color-ash-text)', fontSize: 'var(--text-xs)', padding: 0 }}
                  title="Remove your moment"
                >×</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Chapter List — top-level to prevent remounting on Watch re-renders ── */
function ChapterListSection({
  markers,
  userTimestamps,
  onChapterClick,
  onDeleteUser,
  onAddMoment,
}: {
  markers: TimestampMarker[];
  userTimestamps: UserTimestamp[];
  onChapterClick: (seconds: number) => void;
  onDeleteUser: (id: string) => void;
  onAddMoment: () => void;
}) {
  return (
    <div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
        letterSpacing: '0.20em', textTransform: 'uppercase',
        color: 'var(--color-ash-text)', marginBottom: 'var(--space-5)',
      }}>
        Chapter Guide · {markers.length} chapters
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {markers.map((m) => (
          <div
            key={m.timestamp_seconds}
            data-cursor-hover
            onClick={() => onChapterClick(m.timestamp_seconds)}
            style={{
              display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-sm)', cursor: 'none', transition: 'background-color 200ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-deep-slate-hi)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-saffron)', flexShrink: 0, paddingTop: '2px' }}>
              {formatTime(m.timestamp_seconds)}
            </span>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-snow)', marginBottom: '2px' }}>
                {m.title}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-snow-dim)', lineHeight: 1.5 }}>
                {m.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      {userTimestamps.length > 0 && (
        <div style={{ marginTop: 'var(--space-6)', borderTop: 'var(--border-dim)', paddingTop: 'var(--space-6)' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
            letterSpacing: '0.20em', textTransform: 'uppercase',
            color: 'var(--color-snow-dim)', marginBottom: 'var(--space-3)',
          }}>
            Your Saved Moments · {userTimestamps.length}
          </div>
          {userTimestamps.map(u => (
            <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: 'var(--border-dim)' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-saffron)', marginRight: 'var(--space-3)' }}>
                  {formatTime(u.timestamp_seconds)}
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-snow-dim)' }}>
                  {u.note}
                </span>
              </div>
              <button
                onClick={() => onDeleteUser(u.id)}
                data-cursor-hover
                style={{ background: 'none', border: 'none', cursor: 'none', color: 'var(--color-ash-text)', fontSize: '12px' }}
                aria-label={`Remove moment at ${formatTime(u.timestamp_seconds)}`}
              >×</button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onAddMoment}
        data-cursor-hover
        style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          marginTop: 'var(--space-5)', background: 'none',
          border: 'var(--border-dim)', borderRadius: 'var(--radius-sm)',
          padding: 'var(--space-3) var(--space-4)', cursor: 'none',
          fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
          letterSpacing: '0.20em', textTransform: 'uppercase',
          color: 'var(--color-snow-dim)', transition: 'border-color 200ms, color 200ms',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-saffron-border)'; e.currentTarget.style.color = 'var(--color-saffron)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-ash-dim)'; e.currentTarget.style.color = 'var(--color-snow-dim)'; }}
      >
        + Save a Moment
      </button>
    </div>
  );
}

/* ── Poster Column — top-level to prevent remounting on Watch re-renders ── */
function PosterColumn({
  innerRef,
  caption,
}: {
  innerRef: RefObject<HTMLDivElement | null>;
  caption: ReactNode;
}) {
  return (
    <div ref={innerRef}>
      <div style={{
        position: 'relative', aspectRatio: '2/3', maxWidth: '360px',
        borderRadius: 'var(--radius-md)', overflow: 'hidden', border: 'var(--border-dim)',
      }}>
        <Image
          src={CONFIG.media.posterUrl}
          alt={FILM.title}
          fill quality={85} sizes="360px"
          style={{ objectFit: 'cover', filter: 'brightness(0.45) contrast(1.1) saturate(0.5)' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(10,12,15,0.95) 0%, transparent 50%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: 'var(--space-6)',
        }}>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'var(--text-base)', color: 'var(--color-snow-dim)', lineHeight: 1.5 }}>
            {caption}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ── */
export default function Watch() {
  const sectionRef = useRef<HTMLElement>(null);
  const posterRef  = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { markers } = useTimestamps();

  /* Player & timestamp state */
  const [currentTime, setCurrentTime]      = useState(0);
  const [userTimestamps, setUserTimestamps] = useState<UserTimestamp[]>([]);
  const [addingNote, setAddingNote]         = useState(false);
  const [noteText, setNoteText]             = useState('');
  const [noteTime, setNoteTime]             = useState(0);

  /* Access state — start 'loading' unless dev bypass is on */
  const [access, setAccess] = useState<AccessState>(
    CONFIG.payment.devBypass ? 'granted' : 'loading'
  );

  /* Payment form state */
  const [payName, setPayName]     = useState('');
  const [payEmail, setPayEmail]   = useState('');
  const [payPhone, setPayPhone]   = useState('');
  const [paying, setPaying]       = useState(false);
  const [payError, setPayError]   = useState<string | null>(null);

  const filmAvailable = CONFIG.features.filmAvailable;
  const filmUrl       = CONFIG.media.filmUrl;

  /* Rig360 screening session */
  type ScreeningSession = { playbackUrl: string; keyToken: string; expiresIn: number };
  const [session, setSession] = useState<ScreeningSession | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  /* Load user timestamps from localStorage */
  useEffect(() => {
    setUserTimestamps(loadUserTimestamps());
  }, []);

  /* Check URL for Airpay callback token */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const token = params.get('token');
    if (paymentStatus === 'success' && token) {
      localStorage.setItem(JWT_KEY, token);
      setAccess('granted');
      window.history.replaceState({}, '', window.location.pathname + '#watch');
    } else if (paymentStatus === 'failed') {
      setPayError('Payment was not completed. Please try again.');
      setAccess('gate');
      window.history.replaceState({}, '', window.location.pathname + '#watch');
    }
  }, []);

  /* JWT access check — only runs when film is available and no dev bypass */
  useEffect(() => {
    if (!filmAvailable || CONFIG.payment.devBypass) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment')) return;
    const token = localStorage.getItem(JWT_KEY);
    if (!token) {
      setAccess('gate');
      return;
    }
    api.verifyAccess(token).then(res => {
      if (res?.valid) {
        setAccess('granted');
      } else {
        localStorage.removeItem(JWT_KEY);
        setAccess('gate');
      }
    }).catch(() => {
      setAccess('gate');
    });
  }, [filmAvailable]);

  /* Fetch Rig360 screening session once access is granted */
  useEffect(() => {
    if (access !== 'granted') return;
    const token = localStorage.getItem(JWT_KEY);
    // Dev bypass: no token available — skip session fetch, fall back to filmUrl
    if (!token) return;
    fetch('/api/screening/session', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then((s: ScreeningSession | null) => { if (s?.playbackUrl) setSession(s); })
      .catch(() => null);
  }, [access]);

  /* Dev bypass: fetch a dev screening session (includes keyToken for decryption) */
  useEffect(() => {
    if (!CONFIG.payment.devBypass || session) return;
    fetch('/api/screening/dev-session')
      .then(r => r.ok ? r.json() : null)
      .then((s: ScreeningSession | null) => { if (s?.playbackUrl) setSession(s); })
      .catch(() => null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Mount hls.js when session is ready */
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !session) return;
    let hls: import('hls.js').default | null = null;
    import('hls.js').then(({ default: Hls }) => {
      if (!Hls.isSupported()) {
        video.src = session.playbackUrl;
        return;
      }
      hls = new Hls({
        xhrSetup: (xhr: XMLHttpRequest, url: string) => {
          if (url.includes('/key')) {
            xhr.setRequestHeader('Authorization', `Bearer ${session.keyToken}`);
          }
        },
      });
      hls.loadSource(session.playbackUrl);
      hls.attachMedia(video);
    });
    return () => { hls?.destroy(); };
  }, [session]);

  /* Payment flow — dispatches to Airpay (form submit) or Razorpay (JS modal) */
  const handleWatch = async () => {
    if (!payName.trim()) { setPayError('Please enter your full name.'); return; }
    if (!EMAIL_RE.test(payEmail)) { setPayError('Please enter a valid email address.'); return; }
    if (!/^[6-9]\d{9}$/.test(payPhone.trim())) { setPayError('Please enter a valid 10-digit Indian mobile number.'); return; }

    setPaying(true);
    setPayError(null);

    const order = await api.createOrder({
      email: payEmail.trim(),
      name:  payName.trim(),
      phone: payPhone.trim(),
    });

    if (!order) {
      setPayError('Could not reach the payment server. Please try again in a moment.');
      setPaying(false);
      return;
    }

    if (order.gateway === 'razorpay') {
      // Load Razorpay checkout script then open the modal
      const loadScript = () => new Promise<void>((resolve, reject) => {
        if ((window as any).Razorpay) { resolve(); return; }
        const s = document.createElement('script');
        s.src = 'https://checkout.razorpay.com/v1/checkout.js';
        s.onload  = () => resolve();
        s.onerror = () => reject(new Error('Failed to load Razorpay'));
        document.body.appendChild(s);
      });

      try {
        await loadScript();
      } catch {
        setPayError('Could not load payment window. Please try again.');
        setPaying(false);
        return;
      }

      const rzp = new (window as any).Razorpay({
        key:         order.key_id,
        order_id:    order.order_id,
        amount:      order.amount,
        currency:    order.currency,
        name:        order.name,
        description: order.description,
        prefill: {
          name:    payName.trim(),
          email:   payEmail.trim(),
          contact: payPhone.trim(),
        },
        theme: { color: '#c97b2b' },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id:   string;
          razorpay_signature:  string;
        }) => {
          // Verify signature server-side
          const res = await fetch('/api/payment/callback', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(response),
          });
          const data = await res.json() as { success: boolean; token?: string; message?: string };
          if (data.success && data.token) {
            window.location.href = `/?payment=success&token=${data.token}#watch`;
          } else {
            setPayError(data.message ?? 'Payment verification failed. Please contact support.');
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => { setPaying(false); },
        },
      });
      rzp.open();
      return;
    }

    // Airpay — hidden form submit
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = order.post_url;
    form.style.display = 'none';

    for (const [key, value] of Object.entries(order.form_fields)) {
      const input = document.createElement('input');
      input.type  = 'hidden';
      input.name  = key;
      input.value = value;
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
  };

  /* User timestamp actions */
  const addUserTimestamp = () => {
    const ts: UserTimestamp = {
      id: `u-${Date.now()}`,
      timestamp_seconds: noteTime,
      note: noteText || `Moment at ${formatTime(noteTime)}`,
      created_at: new Date().toISOString(),
    };
    const updated = [...userTimestamps, ts];
    setUserTimestamps(updated);
    saveUserTimestamps(updated);
    setAddingNote(false);
    setNoteText('');
  };

  const deleteUserTimestamp = (id: string) => {
    const updated = userTimestamps.filter(t => t.id !== id);
    setUserTimestamps(updated);
    saveUserTimestamps(updated);
  };

  /* Keyboard: T = add timestamp (guarded — don't fire while typing) */
  useEffect(() => {
    if (access !== 'granted') return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) return;
      if (e.key === 't' || e.key === 'T') {
        setNoteTime(currentTime);
        setAddingNote(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentTime, access]);

  /* ScrollTrigger entrance */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from([posterRef.current, contentRef.current].filter(Boolean), {
        opacity: 0, y: 36, stagger: 0.15, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);


  /* ─────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────── */
  return (
    <section
      id="watch"
      ref={sectionRef}
      style={{ position: 'relative', zIndex: 1, padding: 'var(--section-py) 0', minHeight: '90vh' }}
    >
      <div className="section-mist-top" />
      <div className="section-container">

        {filmAvailable ? (
          /* ── FILM IS AVAILABLE — show access-controlled view ── */
          <>
            {/* Loading — JWT check in progress */}
            {access === 'loading' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    border: '2px solid var(--color-ash-dim)',
                    borderTopColor: 'var(--color-saffron)',
                    animation: 'spin 0.8s linear infinite',
                    margin: '0 auto var(--space-4)',
                  }} />
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--color-ash-text)' }}>
                    Checking access…
                  </p>
                </div>
              </div>
            )}

            {/* Granted — show player */}
            {access === 'granted' && (
              <div>
                <span className="eyebrow">Now Watching</span>
                <div style={{
                  backgroundColor: 'var(--color-deep-slate-mid)',
                  borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                  border: 'var(--border-dim)', marginBottom: 'var(--space-6)',
                }}>
                  <div style={{ aspectRatio: '16/9', backgroundColor: '#000', position: 'relative' }}>
                    {(session || (CONFIG.payment.devBypass && filmUrl)) ? (
                      <video
                        ref={videoRef}
                        controls
                        playsInline
                        onTimeUpdate={e => setCurrentTime(Math.floor(e.currentTarget.currentTime))}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: '#000' }}
                      />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-ash-text)', textAlign: 'center', padding: 'var(--space-6)' }}>
                          Preparing your screening…
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <ChapterStrip
                  markers={markers}
                  userTimestamps={userTimestamps}
                  currentTime={currentTime}
                  onSeek={setCurrentTime}
                  onDeleteUser={deleteUserTimestamp}
                />

                <div style={{ marginTop: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--color-ash-text)' }}>
                    Press <kbd style={{ backgroundColor: 'var(--color-deep-slate-hi)', border: 'var(--border-base)', padding: '1px 5px', borderRadius: '3px', color: 'var(--color-saffron)' }}>T</kbd> to save a moment
                  </span>
                </div>
              </div>
            )}

            {/* Gate — payment required */}
            {access === 'gate' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 'clamp(3rem, 6vw, 6rem)',
                alignItems: 'start',
              }}>
                <PosterColumn innerRef={posterRef} caption={<>Two truths.<br />Same sky. Same soil.</>} />

                <div ref={contentRef}>
                  <span className="eyebrow">Access</span>
                  <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
                    fontWeight: 400, color: 'var(--color-snow)',
                    lineHeight: 1.1, marginBottom: 'var(--space-6)',
                  }}>
                    Watch the documentary.
                  </h2>

                  <p style={{
                    fontFamily: 'var(--font-display)', fontStyle: 'italic',
                    fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
                    color: 'var(--color-snow-dim)', lineHeight: 1.65,
                    marginBottom: 'var(--space-8)',
                    borderLeft: '2px solid var(--color-saffron)',
                    paddingLeft: 'var(--space-4)',
                  }}>
                    &ldquo;{FILM.primaryPullQuote}&rdquo;
                  </p>

                  {/* Price */}
                  <div style={{ marginBottom: 'var(--space-6)' }}>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(3rem, 6vw, 4rem)',
                      color: 'var(--color-saffron)', lineHeight: 1,
                      marginBottom: 'var(--space-2)',
                    }}>
                      {CONFIG.pricing.amountDisplay}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--color-ash-text)' }}>
                      {CONFIG.pricing.description}
                    </div>
                  </div>

                  {CONFIG.features.paymentEnabled ? (
                    /* Payment form */
                    <div style={{
                      padding: 'var(--space-6)',
                      backgroundColor: 'var(--color-deep-slate-mid)',
                      border: 'var(--border-saffron)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: 'var(--space-6)',
                    }}>
                      {/* Name */}
                      <div style={{ marginBottom: 'var(--space-4)' }}>
                        <label style={{
                          fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
                          letterSpacing: '0.20em', textTransform: 'uppercase',
                          color: 'var(--color-ash-text)', display: 'block',
                          marginBottom: 'var(--space-2)',
                        }}>
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={payName}
                          onChange={e => { setPayName(e.target.value); setPayError(null); }}
                          onKeyDown={e => e.key === 'Enter' && handleWatch()}
                          placeholder="Your name"
                          disabled={paying}
                          style={{
                            width: '100%', padding: 'var(--space-3) var(--space-4)',
                            backgroundColor: 'var(--color-deep-slate)',
                            border: 'var(--border-base)', borderRadius: 'var(--radius-sm)',
                            fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)',
                            color: 'var(--color-snow)', outline: 'none', cursor: 'text',
                            opacity: paying ? 0.5 : 1,
                          }}
                        />
                      </div>

                      {/* Email */}
                      <div style={{ marginBottom: 'var(--space-4)' }}>
                        <label style={{
                          fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
                          letterSpacing: '0.20em', textTransform: 'uppercase',
                          color: 'var(--color-ash-text)', display: 'block',
                          marginBottom: 'var(--space-2)',
                        }}>
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={payEmail}
                          onChange={e => { setPayEmail(e.target.value); setPayError(null); }}
                          onKeyDown={e => e.key === 'Enter' && handleWatch()}
                          placeholder="you@example.com"
                          disabled={paying}
                          style={{
                            width: '100%', padding: 'var(--space-3) var(--space-4)',
                            backgroundColor: 'var(--color-deep-slate)',
                            border: 'var(--border-base)', borderRadius: 'var(--radius-sm)',
                            fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)',
                            color: 'var(--color-snow)', outline: 'none', cursor: 'text',
                            opacity: paying ? 0.5 : 1,
                          }}
                        />
                      </div>

                      {/* Phone */}
                      <div style={{ marginBottom: 'var(--space-5)' }}>
                        <label style={{
                          fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
                          letterSpacing: '0.20em', textTransform: 'uppercase',
                          color: 'var(--color-ash-text)', display: 'block',
                          marginBottom: 'var(--space-2)',
                        }}>
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={payPhone}
                          onChange={e => { setPayPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setPayError(null); }}
                          onKeyDown={e => e.key === 'Enter' && handleWatch()}
                          placeholder="10-digit mobile number"
                          disabled={paying}
                          style={{
                            width: '100%', padding: 'var(--space-3) var(--space-4)',
                            backgroundColor: 'var(--color-deep-slate)',
                            border: 'var(--border-base)', borderRadius: 'var(--radius-sm)',
                            fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)',
                            color: 'var(--color-snow)', outline: 'none', cursor: 'text',
                            opacity: paying ? 0.5 : 1,
                          }}
                        />
                      </div>

                      {/* Error */}
                      {payError && (
                        <div style={{
                          marginBottom: 'var(--space-4)',
                          padding: 'var(--space-3) var(--space-4)',
                          backgroundColor: 'rgba(255,80,80,0.08)',
                          border: '1px solid rgba(255,80,80,0.25)',
                          borderRadius: 'var(--radius-sm)',
                          fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
                          color: '#FF8080',
                        }}>
                          {payError}
                        </div>
                      )}

                      {/* CTA */}
                      <button
                        onClick={handleWatch}
                        disabled={paying}
                        data-cursor-hover
                        className="btn btn-primary"
                        style={{ width: '100%', opacity: paying ? 0.7 : 1, cursor: paying ? 'wait' : 'none' }}
                      >
                        {paying ? 'Redirecting to Airpay…' : `Watch Now · ${CONFIG.pricing.amountDisplay}`}
                      </button>
                    </div>
                  ) : (
                    /* Payment not yet configured */
                    <div style={{
                      padding: 'var(--space-5) var(--space-6)',
                      backgroundColor: 'var(--color-deep-slate-mid)',
                      border: 'var(--border-saffron)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: 'var(--space-6)',
                    }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--color-saffron)', marginBottom: 'var(--space-2)' }}>
                        Film is Ready
                      </div>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-snow-dim)', lineHeight: 1.6 }}>
                        The film is available. Payment is being configured — check back shortly.
                      </p>
                    </div>
                  )}

                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--color-ash-text)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span style={{ width: '14px', height: '14px', display: 'inline-block', borderRadius: '50%', border: '1px solid var(--color-ash)' }}>🔒</span>
                    Secure Payment by Airpay · Instant Access
                  </div>

                  {/* Chapter preview */}
                  <div style={{ marginTop: 'var(--space-10)' }}>
                    <ChapterListSection
                      markers={markers}
                      userTimestamps={userTimestamps}
                      onChapterClick={(s) => { setCurrentTime(s); setNoteTime(s); }}
                      onDeleteUser={deleteUserTimestamp}
                      onAddMoment={() => { setNoteTime(0); setAddingNote(true); }}
                    />
                  </div>
                </div>
              </div>
            )}
          </>

        ) : (
          /* ── COMING SOON — film not yet available ── */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(3rem, 6vw, 6rem)',
            alignItems: 'center',
          }}>
            <PosterColumn innerRef={posterRef} caption={<>The film is being prepared.<br />The chapters are placed.<br />The story is ready.</>} />

            <div ref={contentRef}>
              <span className="eyebrow">Access</span>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
                fontWeight: 400, color: 'var(--color-snow)',
                lineHeight: 1.1, marginBottom: 'var(--space-6)',
              }}>
                Watch the documentary.
              </h2>

              <p style={{
                fontFamily: 'var(--font-display)', fontStyle: 'italic',
                fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
                color: 'var(--color-snow-dim)', lineHeight: 1.65,
                marginBottom: 'var(--space-8)',
                borderLeft: '2px solid var(--color-saffron)',
                paddingLeft: 'var(--space-4)',
              }}>
                &ldquo;{FILM.primaryPullQuote}&rdquo;
              </p>

              {/* Price */}
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(3rem, 6vw, 4rem)',
                  color: 'var(--color-saffron)', lineHeight: 1,
                  marginBottom: 'var(--space-2)',
                }}>
                  {CONFIG.pricing.amountDisplay}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--color-ash-text)' }}>
                  {CONFIG.pricing.description}
                </div>
              </div>

              {/* Coming soon panel */}
              <div style={{
                padding: 'var(--space-5) var(--space-6)',
                backgroundColor: 'var(--color-deep-slate-mid)',
                border: 'var(--border-saffron)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-6)',
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--color-saffron)', marginBottom: 'var(--space-2)' }}>
                  Coming Soon
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-snow-dim)', lineHeight: 1.6 }}>
                  The film is in post-production. The chapter timeline is ready — you can explore it below while you wait.
                </p>
              </div>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--color-ash-text)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ width: '14px', height: '14px', display: 'inline-block', borderRadius: '50%', border: '1px solid var(--color-ash)' }}>🔒</span>
                Secure Payment by Airpay · Instant Access
              </div>

              <div style={{ marginTop: 'var(--space-10)' }}>
                <ChapterListSection
                  markers={markers}
                  userTimestamps={userTimestamps}
                  onChapterClick={(s) => { setCurrentTime(s); setNoteTime(s); }}
                  onDeleteUser={deleteUserTimestamp}
                  onAddMoment={() => { setNoteTime(0); setAddingNote(true); }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Add timestamp modal — available in all states ── */}
        {addingNote && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Save a moment"
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              backgroundColor: 'rgba(10,12,15,0.88)',
              backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onClick={e => { if (e.target === e.currentTarget) setAddingNote(false); }}
          >
            <div style={{
              backgroundColor: 'var(--color-deep-slate-hi)',
              border: 'var(--border-saffron)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-8)',
              width: '100%', maxWidth: '420px',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--color-saffron)', marginBottom: 'var(--space-2)' }}>
                Save a Moment
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-snow)', marginBottom: 'var(--space-6)' }}>
                {formatTime(noteTime)}
              </div>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--color-ash-text)', display: 'block', marginBottom: 'var(--space-2)' }}>
                  What made you stop here?
                </label>
                <input
                  type="text"
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addUserTimestamp(); if (e.key === 'Escape') setAddingNote(false); }}
                  placeholder="Your note…"
                  autoFocus
                  style={{
                    width: '100%', padding: 'var(--space-3) var(--space-4)',
                    backgroundColor: 'var(--color-deep-slate)',
                    border: 'var(--border-base)', borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-body)', fontSize: 'var(--text-md)',
                    color: 'var(--color-snow)', outline: 'none', cursor: 'text',
                  }}
                />
              </div>

              <div style={{ marginBottom: 'var(--space-6)' }}>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--color-ash-text)', display: 'block', marginBottom: 'var(--space-2)' }}>
                  At which moment? ({formatTime(noteTime)})
                </label>
                <input
                  type="range"
                  min={0}
                  max={FILM.durationMinutes * 60}
                  value={noteTime}
                  onChange={e => setNoteTime(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-saffron)', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button onClick={addUserTimestamp} data-cursor-hover className="btn btn-primary" style={{ flex: 1 }}>
                  Save Moment
                </button>
                <button onClick={() => setAddingNote(false)} data-cursor-hover className="btn btn-ghost">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="section-mist-bottom" />
    </section>
  );
}
