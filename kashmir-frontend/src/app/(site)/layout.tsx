import { FILM } from '@/content/film';
import { CONFIG } from '@/lib/config';
import Grain              from '@/components/effects/Grain';
import AtmosphereCanvas   from '@/components/effects/AtmosphereCanvas';
import TemperatureOverlay from '@/components/effects/TemperatureOverlay';
import CursorGlow         from '@/components/effects/CursorGlow';
import SmoothScroll       from '@/components/effects/SmoothScroll';
import Nav from '@/components/layout/Nav';
import ConsentBanner from '@/components/ui/ConsentBanner';

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
      {/* Skip to main content — keyboard / screen-reader navigation */}
      <a href="#main-content" className="skip-link">Skip to content</a>
      <SmoothScroll>
        {/* Persistent atmospheric effects */}
        <AtmosphereCanvas />
        <TemperatureOverlay />
        <Grain />
        <CursorGlow />
        <Nav />
        <main id="main-content">{children}</main>
        <ConsentBanner />
      </SmoothScroll>
    </>
  );
}
