import type { Metadata } from 'next';
import Link from 'next/link';
import { FILM } from '@/content/film';

export const metadata: Metadata = {
  title: `Terms of Use — ${FILM.title}`,
  description: 'Terms and conditions for accessing and using the Kashmir — Fighting for Peace documentary platform.',
};

const SECTIONS = [
  {
    title: 'Acceptance of Terms',
    body: `By accessing or using this platform, you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree, please do not use this platform. These terms are governed by the laws of India.`,
  },
  {
    title: 'Access to the Film',
    body: `Purchase of access grants you a personal, non-transferable, lifetime licence to watch "Kashmir — Fighting for Peace" on the device(s) where your access token is stored. This licence is for private, non-commercial viewing only. You may not screen the film publicly, broadcast it, share access credentials, or reproduce any portion of it without prior written permission from ${FILM.productionCompany}.`,
  },
  {
    title: 'Intellectual Property',
    body: `All content on this platform — including the film, its footage, soundtrack, still photographs, written text, design elements, and code — is the intellectual property of ${FILM.productionCompany} or its licensors and is protected under Indian and international copyright law. Unauthorised reproduction, distribution, or modification of any content is strictly prohibited.`,
  },
  {
    title: 'Kashmir Harvest Shop',
    body: `Products listed in the Kashmir Harvest shop are authentic regional goods from Kashmir. Product descriptions, weights, and prices are accurate to the best of our knowledge at the time of listing. We reserve the right to correct errors and update listings without notice. Orders are subject to product availability. We are not responsible for agricultural variability (colour, aroma, and flavour variation between harvests is natural and expected).`,
  },
  {
    title: 'Payment & Pricing',
    body: `All prices are in Indian Rupees (INR) inclusive of applicable taxes unless stated otherwise. Payment is processed through our payment partner. We do not store card details. Transactions are final subject to our Refund Policy.`,
  },
  {
    title: 'Prohibited Uses',
    body: `You may not use this platform to transmit unlawful, defamatory, or infringing content; attempt to gain unauthorised access to any part of the platform; reverse-engineer, decompile, or reproduce the platform's code or content; use automated tools to scrape or harvest data; or impersonate ${FILM.productionCompany} or any of its representatives.`,
  },
  {
    title: 'Disclaimers',
    body: `The platform is provided "as is" without warranties of any kind, express or implied. ${FILM.productionCompany} does not warrant that the platform will be uninterrupted, error-free, or free from viruses. The documentary presents multiple perspectives on events in Kashmir; the views expressed by subjects of the film do not necessarily represent the views of the production company.`,
  },
  {
    title: 'Limitation of Liability',
    body: `To the fullest extent permitted by applicable law, ${FILM.productionCompany} shall not be liable for indirect, incidental, special, or consequential damages arising from use of or inability to use this platform, even if advised of the possibility of such damages. Our total liability shall not exceed the amount you paid for access.`,
  },
  {
    title: 'Changes to Terms',
    body: `We reserve the right to modify these terms at any time. Changes will be posted on this page with the revision date. Continued use of the platform after changes constitutes acceptance of the revised terms.`,
  },
  {
    title: 'Contact',
    body: `For questions about these terms, email: harvest@kashmir-fightingforpeace.in`,
  },
];

export default function TermsPage() {
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
          Terms of Use
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
