import Script from 'next/script';
import { FILM } from '@/content/film';
import { CONFIG } from '@/lib/config';
import Grain              from '@/components/effects/Grain';
import AtmosphereCanvas   from '@/components/effects/AtmosphereCanvas';
import TemperatureOverlay from '@/components/effects/TemperatureOverlay';
import CursorGlow         from '@/components/effects/CursorGlow';
import SmoothScroll       from '@/components/effects/SmoothScroll';
import Nav from '@/components/layout/Nav';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Movie',
  name: FILM.title,
  description: FILM.synopsis.long,
  director: { '@type': 'Organization', name: FILM.productionCompany },
  productionCompany: { '@type': 'Organization', name: FILM.productionCompany },
  genre: [...FILM.genres],
  duration: `PT${FILM.durationMinutes}M`,
  inLanguage: ['hi', 'en'],
  contentRating: FILM.certificate,
  url: CONFIG.seo.siteUrl,
  image: CONFIG.seo.ogImage,
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SmoothScroll>
        <AtmosphereCanvas />
        <TemperatureOverlay />
        <Grain />
        <CursorGlow />
        <Nav />
        <main>{children}</main>
      </SmoothScroll>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
    </>
  );
}
