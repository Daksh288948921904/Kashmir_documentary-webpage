/**
 * API Response Type Definitions
 * Mirrors the FastAPI Pydantic schemas in kashmir-backend/app/models/schemas.py
 * after field-name transformation in src/lib/api.ts.
 */

/* ── Documentary ─────────────────── */

export interface DocumentaryOverview {
  title: string;
  tagline: string;
  synopsis: string;
  director: string;
  duration_minutes: number;
  release_year: number;
  trailer_url: string;
  poster_url: string;
  genres: string[];
}

export interface TimelineDoc {
  kind: string;
  name: string;
  date: string;
  desc: string;
  source: string;
  url: string;
}

export interface TimelineEvent {
  year: number;
  title: string;
  category: 'political' | 'conflict' | 'cultural' | 'humanitarian';
  description: string;
  lat?: number;
  lng?: number;
  place?: string;
  doc?: TimelineDoc;
  imgUrl?: string;
}

export interface TimelineResponse {
  events: TimelineEvent[];
}

export interface TimestampMarker {
  timestamp_seconds: number;
  title: string;
  description: string;
  chapter?: string;
}

export interface DocumentaryTimestamps {
  markers: TimestampMarker[];
}

/* ── News ────────────────────────── */

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  published_at: string;
  image_url?: string;
  category?: string;
}

export interface NewsResponse {
  articles: NewsArticle[];
  fetched_at: string;
}

/* ── Social ──────────────────────── */

export interface SocialPost {
  id: string;
  platform: 'instagram' | 'twitter' | 'facebook';
  handle: string;
  name: string;
  content: string;
  image_url?: string;
  likes: number;
  comments: number;
  url: string;
  posted_at: string;
}

export interface SocialResponse {
  posts: SocialPost[];
  fetched_at: string;
}

/* ── Payment ──────────────────────── */

export interface AirpayOrder {
  gateway: 'airpay';
  transaction_id: string;
  post_url: string;
  form_fields: Record<string, string>;
}

export interface RazorpayOrder {
  gateway: 'razorpay';
  order_id: string;
  key_id: string;
  amount: number;   // in paise
  currency: string;
  name: string;
  description: string;
}

export type CreateOrderResult = AirpayOrder | RazorpayOrder;

/* Backend returns { verified, access_token?, message } */
export interface AccessToken {
  verified: boolean;
  access_token?: string;
  message: string;
}

/* Backend returns { valid, expires } */
export interface AccessVerification {
  valid: boolean;
  expires?: number;
}

/* ── User Timestamps (localStorage) ─── */

export interface UserTimestamp {
  id: string;
  timestamp_seconds: number;
  note: string;
  created_at: string;
}
