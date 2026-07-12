import Link from 'next/link';

export default function NotFound() {
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
        404
      </p>

      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 400,
        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
        color: 'var(--color-snow)',
        marginBottom: 'var(--space-5)',
        lineHeight: 1.15,
      }}>
        Page not found
      </h1>

      <p style={{
        color: 'var(--color-snow-dim)',
        lineHeight: 1.75,
        maxWidth: '420px',
        marginBottom: 'var(--space-10)',
      }}>
        The page you are looking for has moved, or perhaps it never existed.
        Return to the film.
      </p>

      <Link
        href="/"
        data-cursor-hover
        className="btn btn-primary"
      >
        ← Back to the Film
      </Link>
    </div>
  );
}
