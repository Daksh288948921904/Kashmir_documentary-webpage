'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-deep-slate)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-8)',
      textAlign: 'center',
      fontFamily: 'var(--font-body)',
    }}>
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '9px',
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        color: 'var(--color-saffron)',
        marginBottom: 'var(--space-6)',
      }}>
        Something went wrong
      </p>

      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 400,
        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
        color: 'var(--color-snow)',
        marginBottom: 'var(--space-5)',
        lineHeight: 1.15,
      }}>
        An unexpected error occurred
      </h1>

      <p style={{
        color: 'var(--color-snow-dim)',
        lineHeight: 1.75,
        maxWidth: '420px',
        marginBottom: 'var(--space-10)',
      }}>
        We apologise for the interruption. Please try again, or return to the film.
      </p>

      <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={reset}
          data-cursor-hover
          className="btn btn-primary"
        >
          Try again
        </button>
        <a
          href="/"
          data-cursor-hover
          className="btn btn-ghost"
        >
          ← Back to the Film
        </a>
      </div>
    </div>
  );
}
