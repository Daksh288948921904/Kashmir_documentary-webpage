import type { Metadata } from 'next';
import Link from 'next/link';
import { FILM } from '@/content/film';

export const metadata: Metadata = {
  title: `Refund Policy — ${FILM.title}`,
  description: 'Refund and cancellation policy for Kashmir — Fighting for Peace film access and Kashmir Harvest shop orders.',
};

const SECTIONS = [
  {
    title: 'Film Access — Refund Window',
    body: `If you purchased access to "Kashmir — Fighting for Peace" and experienced a technical issue that prevented you from watching the film, you may request a full refund within 7 days of purchase. We will investigate the issue and, if confirmed, process your refund within 5–7 business days to the original payment method. Refunds are not available after you have successfully streamed any portion of the film, or after 7 days from the date of purchase, whichever comes first.`,
  },
  {
    title: 'Film Access — No Refund Circumstances',
    body: `Refunds for film access will not be issued in the following circumstances: you changed your mind after purchase; you lost your access token by clearing browser data (contact us to restore access instead); the film did not meet your personal expectations; or more than 7 days have passed since purchase.`,
  },
  {
    title: 'Lost Access Token',
    body: `Your access token is stored in your browser's localStorage. If you clear your browser data, switch devices, or use a private browsing window, the token will not be present. This is not a reason for a refund — it is a technical condition of the access mechanism. Email us with your original payment details and we will restore your access manually within 48 hours.`,
  },
  {
    title: 'Kashmir Harvest Shop — Order Cancellation',
    body: `Shop orders may be cancelled within 2 hours of placement, before dispatch. To cancel, email us immediately with your order reference. Once an order has been dispatched, it cannot be cancelled.`,
  },
  {
    title: 'Kashmir Harvest Shop — Returns',
    body: `We accept returns for shop products within 14 days of delivery if: the product arrived damaged or defective; the wrong product was sent; or the product was significantly not as described. To initiate a return, email us with your order reference and photographs of the issue. We will arrange a replacement or full refund including return shipping costs. Returns are not accepted for perishable goods that have been opened, or for products returned without prior approval.`,
  },
  {
    title: 'Shop — Non-Returnable Items',
    body: `The following shop items are non-returnable: opened food products (spices, teas, honey) for hygiene and safety reasons; products with broken or removed tamper-evident seals; and items that have been used or consumed.`,
  },
  {
    title: 'Refund Processing',
    body: `Approved refunds are processed to the original payment method within 5–7 business days. Depending on your bank, the credit may take an additional 3–5 business days to appear in your account. We will email you confirmation when the refund is initiated.`,
  },
  {
    title: 'How to Request a Refund',
    body: `Email harvest@kashmir-fightingforpeace.in with the subject line "Refund Request — [your order reference]". Include your name, the email address used for the order, the date of purchase, and a brief description of the issue. We will respond within 48 hours.`,
  },
];

export default function RefundsPage() {
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
          Refund Policy
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
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms of Use',   href: '/terms'   },
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
