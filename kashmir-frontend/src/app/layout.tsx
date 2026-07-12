import type { Metadata, Viewport } from 'next';
import { Playfair_Display, DM_Sans, Space_Mono } from 'next/font/google';
import './globals.css';
import { CONFIG } from '@/lib/config';
import { FILM } from '@/content/film';

/* ── Fonts ──────────────────────────────────────── */

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-space-mono',
  weight: ['400', '700'],
  display: 'swap',
});

/* ── Metadata ──────────────────────────────────── */

export const metadata: Metadata = {
  title: {
    default: CONFIG.film.title,
    template: `%s · ${CONFIG.film.title}`,
  },
  description: CONFIG.seo.defaultDescription,
  keywords: ['Kashmir', 'documentary', 'conflict', 'peace', 'India', 'Pakistan', 'film', 'Rig 360 Media'],
  authors: [{ name: CONFIG.film.productionCompany }],
  creator: CONFIG.film.productionCompany,
  publisher: CONFIG.film.productionCompany,
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: CONFIG.seo.siteUrl,
    siteName: CONFIG.seo.siteName,
    title: CONFIG.film.title,
    description: CONFIG.seo.defaultDescription,
    images: [
      {
        url: CONFIG.seo.ogImage,
        width: 1200,
        height: 630,
        alt: CONFIG.film.title,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: CONFIG.film.title,
    description: CONFIG.seo.defaultDescription,
    images: [CONFIG.seo.ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#0A0C0F',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

/* ── JSON-LD ───────────────────────────────────── */

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Movie',
  name: FILM.title,
  description: FILM.synopsis.long,
  director: {
    '@type': 'Organization',
    name: FILM.productionCompany,
  },
  productionCompany: {
    '@type': 'Organization',
    name: FILM.productionCompany,
  },
  genre: [...FILM.genres],
  duration: `PT${FILM.durationMinutes}M`,
  inLanguage: ['hi', 'en'],
  contentRating: FILM.certificate,
  url: CONFIG.seo.siteUrl,
  image: CONFIG.seo.ogImage,
};

/* ── Root Layout ───────────────────────────────── */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} ${spaceMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        {children}
      </body>
    </html>
  );
}
