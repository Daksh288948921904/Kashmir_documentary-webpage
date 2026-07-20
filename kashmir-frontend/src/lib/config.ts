/**
 * Application Configuration
 * All environment-specific and project-specific values live here.
 * NEVER hardcode values in components — import from this file.
 */

export const CONFIG = {
  /* ── Backend API ───────────────────────
     Same-origin: the backend now lives in Next.js API routes under /api.
     baseUrl is empty so requests resolve to relative '/api/...'.
  ─────────────────────────────────────── */
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? '',
    prefix: '/api',
    timeoutMs: 10_000,
  },

  /* ── Film Identity ─────────────────────
     Source of truth: src/content/film.ts
     Backend returns stale data — do NOT use for identity.
  ─────────────────────────────────────── */
  film: {
    title: 'Kashmir — Fighting for Peace',
    titleShort: 'Kashmir',
    subtitle: 'Fighting for Peace',
    tagline: 'Two truths. Same sky. Same soil.',
    productionCompany: 'Rig 360 Media',
    director: 'Rig 360 Media',
    durationMinutes: 70,
    releaseYear: 2026,
    genres: ['Documentary', 'History', 'Human Rights'],
    language: 'Hindi / English',
    certificate: 'U/A',
  },

  /* ── Pricing ────────────────────────── */
  pricing: {
    currency: 'INR',
    currencySymbol: '₹',
    amount: 1,
    amountDisplay: '₹1',
    accessType: 'Lifetime',
    description: 'Lifetime Access · Full HD',
  },

  /* ── Payment ────────────────────────── */
  payment: {
    provider: 'airpay' as const,
    callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/api/payment/callback`,
    devBypass: process.env.NEXT_PUBLIC_DEV_BYPASS_PAYMENT === 'true',
  },

  /* ── Media ───────────────────────────── */
  media: {
    trailerUrl: process.env.NEXT_PUBLIC_TRAILER_URL ?? 'https://drive.google.com/file/d/1Qsl_BWfq9hNnXqBkknqQoja_c_M4vgK1/preview',
    /* Full film URL — empty = requires payment */
    filmUrl: process.env.NEXT_PUBLIC_FILM_URL ?? '',
    posterUrl: process.env.NEXT_PUBLIC_POSTER_URL ?? '/poster.jpg',
  },

  /* ── Hero Images (Pexels Kashmir placeholders — swap for production stills) ── */
  heroImages: {
    /* Primary: Kashmir peaks dissolving into mist, dark pine treeline foreground */
    primary: 'https://images.pexels.com/photos/14651212/pexels-photo-14651212.jpeg?auto=compress&cs=tinysrgb&w=1920&q=85',
    /* Alt 1: Storm clouds over Kashmir peaks, stone ruins foreground */
    alt1: 'https://images.pexels.com/photos/8303558/pexels-photo-8303558.jpeg?auto=compress&cs=tinysrgb&w=1920&q=85',
    /* Alt 2: Spare slot for production still once available */
    alt2: 'https://images.pexels.com/photos/8303558/pexels-photo-8303558.jpeg?auto=compress&cs=tinysrgb&w=1920&q=85',
  },

  /* ── Section Images (used in Film Overview, Duality, etc.) ── */
  sectionImages: {
    /* Kashmir valley for Film/Overview section poster */
    poster: '/poster.jpg',
  },

  /* ── Features / Coming Soon Toggles ──── */
  features: {
    trailerAvailable: true,
    filmAvailable: true,
    paymentEnabled: true,
    socialFeedEnabled: true,
    newsFeedEnabled: true,
    mapEnabled: true,
  },

  /* ── Effects Flags ───────────────────── */
  effects: {
    grainEnabled: false,
    cursorEnabled: false,
    cursorLightEnabled: false,
    smoothScrollEnabled: true,
    /* Future WebGL upgrade — each is a swap point */
    webglHeroEnabled: false,
    webglDualityEnabled: false,
    /* Atmosphere background system */
    atmosphereEnabled: true,
    atmosphereNoiseEnabled: false,
  },

  /* ── Social Links ────────────────────── */
  social: {
    instagram: '',
    twitter: '',
    youtube: '',
    facebook: '',
  },

  /* ── Duality Section ─────────────────── */
  duality: {
    enabled: true,
    ctaHref: '#watch',
    ctaLabel: 'Watch the Film',
  },

  /* ── SEO ─────────────────────────────── */
  seo: {
    siteName: 'Kashmir — Fighting for Peace',
    // REQUIRED BEFORE DEPLOYMENT: set NEXT_PUBLIC_SITE_URL=https://yourdomain.com in your hosting env vars.
    // Without it, sitemap, canonical tags, and structured data will point to localhost.
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    defaultDescription:
      'A documentary about ordinary people living in extraordinary circumstances. Kashmir — Fighting for Peace by Rig 360 Media.',
    // REQUIRED BEFORE DEPLOYMENT: add your own /public/og-image.jpg and set NEXT_PUBLIC_OG_IMAGE_URL=https://yourdomain.com/og-image.jpg
    // Without a self-hosted image, broken Pexels URLs will break every social share preview.
    ogImage: process.env.NEXT_PUBLIC_OG_IMAGE_URL ?? '/poster.jpg',
  },
} as const;

export type Config = typeof CONFIG;
