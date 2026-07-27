/**
 * API Layer — all calls to the FastAPI backend.
 * Base URL from config (defaults to http://localhost:8000).
 * Each function returns null on network failure so callers fall back to mock data.
 *
 * Transform functions map backend field names → frontend TypeScript type field names.
 * Backend and frontend use different naming conventions; transforms live here so
 * components and mock data never have to change.
 */
import { CONFIG } from '@/lib/config';
import type {
  TimelineResponse, NewsResponse, SocialResponse,
  DocumentaryTimestamps, CreateOrderResult,
  AccessToken, AccessVerification,
} from '@/types/api';

const BASE = `${CONFIG.api.baseUrl}${CONFIG.api.prefix}`;

async function get<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(CONFIG.api.timeoutMs),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/* ─────────────────────────────────────────────────────────────
   TRANSFORMS
   Backend returns snake_case field names that differ from our
   frontend TypeScript types. These functions normalise the shape
   so components always receive the type they expect.
───────────────────────────────────────────────────────────── */

function transformNewsResponse(raw: Record<string, unknown>): NewsResponse | null {
  if (!Array.isArray(raw?.articles)) return null;
  return {
    articles: (raw.articles as Record<string, unknown>[]).map((item, i) => ({
      id:           `${String(item.source_url ?? 'news')}-${i}`,
      title:        String(item.headline ?? ''),
      summary:      String(item.brief ?? ''),
      source:       String(item.source_name ?? ''),
      url:          String(item.source_url ?? '#'),
      published_at: String(item.published_at ?? new Date().toISOString()),
      image_url:    item.image_url ? String(item.image_url) : undefined,
      category:     item.category  ? String(item.category)  : undefined,
    })),
    fetched_at: String(raw.last_updated ?? new Date().toISOString()),
  };
}

function transformTimelineResponse(raw: Record<string, unknown>): TimelineResponse | null {
  if (!Array.isArray(raw?.events)) return null;
  return {
    events: (raw.events as Record<string, unknown>[]).map((ev) => ({
      year:        Number(ev.year),
      title:       String(ev.title ?? ''),
      category:    (ev.category as TimelineResponse['events'][number]['category']) ?? 'political',
      description: String(ev.description ?? ''),
      lat:         ev.lat != null ? Number(ev.lat) : undefined,
      lng:         ev.lng != null ? Number(ev.lng) : undefined,
      place:       ev.place ? String(ev.place) : undefined,
      imgUrl:      ev.image_url ? String(ev.image_url) : undefined,
    })),
  };
}

function transformSocialResponse(raw: Record<string, unknown>): SocialResponse | null {
  if (!Array.isArray(raw?.posts)) return null;
  return {
    posts: (raw.posts as Record<string, unknown>[]).map((post, i) => ({
      id:         `${String(post.post_url ?? 'post')}-${i}`,
      platform:   (post.platform as 'instagram' | 'twitter' | 'facebook') ?? 'twitter',
      handle:     String(post.author_handle ?? ''),
      name:       String(post.author ?? ''),
      content:    String(post.content ?? ''),
      image_url:  post.media_url ? String(post.media_url) : undefined,
      likes:      Number(post.likes ?? 0),
      comments:   Number(post.comments ?? 0),
      url:        String(post.post_url ?? '#'),
      posted_at:  String(post.posted_at ?? new Date().toISOString()),
    })),
    fetched_at: String(raw.last_updated ?? new Date().toISOString()),
  };
}

/* ─────────────────────────────────────────────────────────────
   API CALLS
───────────────────────────────────────────────────────────── */

export const api = {
  /* Documentary — timeline needs image_url → imgUrl transform */
  timeline: async (): Promise<TimelineResponse | null> => {
    try {
      const res = await fetch(`${BASE}/documentary/timeline`, {
        next: { revalidate: 900 },
        signal: AbortSignal.timeout(CONFIG.api.timeoutMs),
      });
      if (!res.ok) return null;
      return transformTimelineResponse(await res.json());
    } catch { return null; }
  },
  timestamps: () => get<DocumentaryTimestamps>('/documentary/timestamps'),

  /* News — backend endpoint is /news/feed, fields are transformed */
  news: async (): Promise<NewsResponse | null> => {
    try {
      const res = await fetch(`${BASE}/news/feed`, {
        next: { revalidate: 900 },
        signal: AbortSignal.timeout(CONFIG.api.timeoutMs),
      });
      if (!res.ok) return null;
      return transformNewsResponse(await res.json());
    } catch { return null; }
  },

  /* Social — backend endpoint is /social/feed, fields are transformed */
  social: async (): Promise<SocialResponse | null> => {
    try {
      const res = await fetch(`${BASE}/social/feed`, {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(CONFIG.api.timeoutMs),
      });
      if (!res.ok) return null;
      return transformSocialResponse(await res.json());
    } catch { return null; }
  },

  /* Payment — create Airpay order, returns form fields for redirect */
  createOrder: async (data: {
    email: string; name: string; phone: string;
    address?: string; city?: string; state?: string; pin_code?: string;
  }): Promise<CreateOrderResult | null> => {
    try {
      const res = await fetch(`${BASE}/payment/create-order`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      });
      if (!res.ok) return null;
      return (await res.json()) as CreateOrderResult;
    } catch { return null; }
  },

  /* Payment — verify JWT; backend is GET with Authorization header */
  verifyAccess: async (token: string): Promise<AccessVerification | null> => {
    try {
      const res = await fetch(`${BASE}/payment/verify-access`, {
        method:  'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) return null;
      return (await res.json()) as AccessVerification;
    } catch { return null; }
  },
};

/* ─────────────────────────────────────────────────────────────
   KASHMIR HARVEST CMS helpers
   JWT stored in localStorage, passed as Bearer token.
───────────────────────────────────────────────────────────── */

export function getCmsToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cms_token');
}

export function setCmsToken(token: string): void {
  localStorage.setItem('cms_token', token);
}

export function clearCmsToken(): void {
  localStorage.removeItem('cms_token');
}

function cmsHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = getCmsToken();
  return {
    ...(extra ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function cmsApi(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: cmsHeaders(init?.headers as Record<string, string>),
  });
  // Session expired or invalid → clear it and send the admin back to login,
  // instead of leaving them staring at a raw 401 error on a CMS page.
  if (res.status === 401 && typeof window !== 'undefined') {
    clearCmsToken();
    if (window.location.pathname !== '/cms') {
      window.location.href = '/cms';
    }
  }
  return res;
}
