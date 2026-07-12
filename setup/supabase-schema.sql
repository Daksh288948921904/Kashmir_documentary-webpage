-- ═══════════════════════════════════════════════════════════════
-- Kashmir Harvest CMS — Supabase database schema
-- Derived exactly from kashmir-backend/app/routers/*.py
-- Run this once in: Supabase Dashboard → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════

-- ── PRODUCTS ────────────────────────────────────────────────────
-- The CMS admin creates these; the shop page displays active ones.
create table if not exists products (
  id          text primary key default gen_random_uuid()::text,
  name        text not null,
  subtitle    text,
  region      text,
  weight      text,
  price       numeric not null,
  category    text not null,
  badge       text,
  description text,
  hue         text default '#9a1f1a',
  img_url     text,
  active      boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ── ORDERS ──────────────────────────────────────────────────────
-- Created by shop checkout; managed in CMS → Orders.
-- status flow: new → contacted → confirmed → shipped → delivered / cancelled
create table if not exists orders (
  id               uuid primary key default gen_random_uuid(),
  customer_name    text not null,
  customer_email   text not null,
  customer_phone   text not null,
  delivery_address text not null,
  items            jsonb not null default '[]',
  total            numeric not null,
  status           text not null default 'new',
  notes            text,
  created_at       timestamptz not null default now()
);

-- ── SOCIAL POSTS ──────────────────────────────────────────────────
-- Drafted in CMS → Social; published to Instagram/Facebook/X via Ayrshare.
create table if not exists social_posts (
  id             uuid primary key default gen_random_uuid(),
  content_type   text not null,               -- post | story | reel
  caption        text,
  media_url      text,
  platforms      jsonb not null default '[]', -- e.g. ["instagram","x"]
  publish_status jsonb not null default '{}',
  overall_status text not null default 'draft', -- draft | published | partial | failed
  created_at     timestamptz not null default now(),
  updated_at     timestamptz
);

-- ── SECURITY ─────────────────────────────────────────────────────
-- The backend talks to Supabase with the service-role key, which
-- bypasses row-level security. Enabling RLS with no public policies
-- means ONLY the backend can touch these tables. This is correct.
alter table products     enable row level security;
alter table orders       enable row level security;
alter table social_posts enable row level security;

-- ── STORAGE BUCKET (product images) ──────────────────────────
-- Public bucket so uploaded product images are viewable in the shop.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;
