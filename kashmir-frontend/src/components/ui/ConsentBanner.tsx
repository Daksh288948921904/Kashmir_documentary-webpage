'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'kfp_consent_v1';

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      /* localStorage unavailable — skip banner */
    }
  }, []);

  function acknowledge() {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Data notice"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        backgroundColor: 'rgba(10,12,15,0.97)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
        padding: 'clamp(1rem, 2.5vw, 1.5rem) clamp(1rem, 4vw, 2.5rem)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'clamp(1rem, 3vw, 2rem)',
        flexWrap: 'wrap',
      }}
    >
      <p style={{
        flex: 1,
        fontFamily: 'var(--font-body)',
        fontSize: 'clamp(0.75rem, 1.2vw, 0.82rem)',
        color: 'var(--color-ash-text)',
        lineHeight: 1.6,
        margin: 0,
        minWidth: '240px',
      }}>
        This platform stores your access token locally and may collect your name, email, and
        phone number when you make a purchase — solely to process your order. No tracking cookies
        or third-party analytics are used.{' '}
        <Link
          href="/privacy"
          style={{ color: 'var(--color-saffron)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
        >
          Privacy Policy
        </Link>
      </p>

      <button
        onClick={acknowledge}
        style={{
          flexShrink: 0,
          padding: '8px 22px',
          backgroundColor: 'transparent',
          border: '1px solid rgba(201,123,43,0.5)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--color-saffron)',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'background-color 200ms, border-color 200ms',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = 'rgba(201,123,43,0.1)';
          e.currentTarget.style.borderColor = 'var(--color-saffron)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.borderColor = 'rgba(201,123,43,0.5)';
        }}
      >
        I Understand
      </button>
    </div>
  );
}
