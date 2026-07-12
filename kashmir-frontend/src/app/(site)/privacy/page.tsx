import type { Metadata } from 'next';
import Link from 'next/link';
import { FILM } from '@/content/film';

export const metadata: Metadata = {
  title: `Privacy Policy — ${FILM.title}`,
  description: 'How Kashmir — Fighting for Peace collects, uses, and protects your personal information.',
};

const SECTIONS = [
  {
    title: 'What We Collect',
    body: `When you purchase access to the film, we collect your name, email address, and phone number solely to process your order and issue your lifetime access token. We do not collect this information at any other time. We do not use tracking cookies, advertising pixels, or third-party analytics on this platform.`,
  },
  {
    title: 'How We Use It',
    body: `Your personal details are used exclusively to fulfil your purchase — verifying payment, issuing your access token, and (once enabled) sending your order receipt by email. We do not sell, share, or rent your information to any third party. We do not use it for marketing without your explicit consent.`,
  },
  {
    title: 'Access Tokens',
    body: `After a successful payment, a signed access token (JWT) is issued and stored in your browser's localStorage. This token grants lifetime access to the film on the device where it is stored. It contains no personal data — only a signed confirmation that payment was completed. Clearing your browser data will remove the token; contact us to restore access.`,
  },
  {
    title: 'Data Storage & Security',
    body: `Payment processing is handled by our payment partner. We do not store your card details. Personal data submitted during checkout is processed securely over HTTPS. We retain order records for a minimum period required under Indian accounting law (currently 8 years under the Companies Act).`,
  },
  {
    title: 'Your Rights (DPDP Act 2023)',
    body: `Under India's Digital Personal Data Protection Act 2023, you have the right to access the personal data we hold about you, correct inaccurate data, withdraw consent for non-essential processing, and request erasure of your data where legally permissible. To exercise any of these rights, email us at the address below.`,
  },
  {
    title: 'International Visitors',
    body: `If you are accessing this platform from the European Economic Area or United Kingdom, you also have rights under the General Data Protection Regulation (GDPR). We process only the minimum data necessary for the purpose stated and retain it no longer than required. You may lodge a complaint with your local data protection authority.`,
  },
  {
    title: 'Changes to This Policy',
    body: `We may update this policy as the platform evolves. Material changes will be noted at the top of this page with the date of revision. Continued use of the platform after a change constitutes acceptance of the updated policy.`,
  },
  {
    title: 'Contact',
    body: `For privacy-related queries, data requests, or to exercise your rights, email: harvest@kashmir-fightingforpeace.in`,
  },
];

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '72px', position: 'relative', zIndex: 1 }}>
      <div style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1.25rem, 4vw, 2rem) clamp(4rem, 8vw, 6rem)',
      }}>

        <div style={{ marginBottom: 'clamp(2rem, 4vw, 3rem)' }}>
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--color-ash-text)', textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              transition: 'color 200ms',
            }}
          >
            ← Back to the Film
          </Link>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 400,
          fontSize: 'clamp(2rem, 4vw, 2.8rem)',
          color: 'var(--color-snow)', marginBottom: 'var(--space-3)',
          letterSpacing: '-0.01em',
        }}>
          Privacy Policy
        </h1>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '11px',
          letterSpacing: '0.16em', textTransform: 'uppercase',
          color: 'var(--color-ash-text)', marginBottom: 'clamp(2.5rem, 5vw, 4rem)',
        }}>
          {FILM.productionCompany} · Last updated July 2026
        </p>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 'clamp(2rem, 4vw, 3rem)' }}>
          {SECTIONS.map((s, i) => (
            <div key={i} style={{ marginBottom: 'clamp(2rem, 4vw, 3rem)' }}>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontWeight: 400,
                fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
                color: 'var(--color-snow)', marginBottom: 'var(--space-4)',
              }}>
                {s.title}
              </h2>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(0.88rem, 1.3vw, 0.95rem)',
                color: 'var(--color-snow-dim)', lineHeight: 1.8,
              }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          paddingTop: 'clamp(2rem, 4vw, 3rem)',
          display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap',
        }}>
          {[
            { label: 'Terms of Use',  href: '/terms'   },
            { label: 'Refund Policy', href: '/refunds' },
          ].map(l => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: '10px',
                letterSpacing: '0.16em', textTransform: 'uppercase',
                color: 'var(--color-ash-text)', textDecoration: 'none',
                transition: 'color 200ms',
              }}
            >
              {l.label} →
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
