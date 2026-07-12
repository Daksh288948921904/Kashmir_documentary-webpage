# Kashmir — Fighting for Peace

> A cinematic documentary website chronicling 687 years of Kashmir's history — from the Sultanate era to the present day, plus the **Kashmir Harvest** direct-from-farmer shop and a full admin CMS.

Built by **RIG 360 Media** as a design-led platform combining immersive storytelling, interactive geography, real-time news, and e-commerce into a single experience.

---

## Overview

This platform serves as the digital home for the documentary film *Kashmir — Fighting for Peace*, alongside the Kashmir Harvest shop for regional produce and an admin CMS for both. It presents the region's history through an interactive timeline, a geographic map of the conflict zones, curated news feeds, a direct film-access purchase flow, and a small e-commerce section.

**Key design philosophy:** every section is treated as a visual chapter — cinematic atmosphere, intentional typography, and motion that respects the weight of the subject.

---

## Features

- **Hero** — full-screen cinematic opener with atmospheric canvas effects and montage imagery
- **Film Overview** — nine witnesses, film synopsis, and director's statement
- **Trailer** — embedded trailer with custom controls
- **History (Three-Zone Command Center)** — unified section combining:
  - Scrollable timeline rail (687 years, 5 eras, categorized events)
  - Interactive Leaflet map with territory polygons, Line of Control, and event markers
  - Detail panel with GSAP-animated canvas effects per historical event
- **News Feed** — live RSS-aggregated Kashmir news from multiple sources
- **Social Feed** — curated social media coverage
- **Watch** — film access via Airpay payment integration
- **Kashmir Harvest Shop** — regional produce catalogue with cart, checkout, order emails, and UPI-QR payment fallback
- **CMS** — admin panel for products, orders, and social-media posts (Instagram / Facebook / X via Ayrshare)
- **Legal pages** — Privacy Policy, Terms of Use, Refund Policy (DPDP 2023 + GDPR-shaped templates — review with a lawyer before launch)
- **Responsive** — desktop three-column layout, tablet two-column, mobile stacked

---

## Tech Stack

### Frontend — `kashmir-frontend/`

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | CSS custom properties + inline styles (design token system) |
| Animation | GSAP 3.15 + ScrollTrigger, Lenis smooth scroll |
| Map | Leaflet 1.9 (dynamic import, SSR disabled) |
| UI | React 19 |

### Backend — `kashmir-backend/`

| Layer | Technology |
|---|---|
| Framework | FastAPI |
| Runtime | Python 3.11+ |
| Database | Supabase (Postgres + Storage) |
| Payments | Airpay (film) + UPI QR (shop) |
| Emails | Brevo (transactional) |
| Social | Ayrshare (Instagram/Facebook/X publishing) |
| Auth | JWT (python-jose) |
| News | feedparser + BeautifulSoup4 |

---

## Project Structure

```
Kashmir-Platform/
├── kashmir-frontend/          # Next.js app
│   ├── src/
│   │   ├── app/               # App Router pages + API routes
│   │   │   ├── (site)/        # Public film site + shop + legal pages
│   │   │   ├── api/           # Next.js API routes (proxy + own logic)
│   │   │   └── cms/           # Admin CMS pages (guarded by JWT)
│   │   ├── components/       # Effects, layout, sections, UI
│   │   ├── content/          # Film metadata, product definitions
│   │   ├── hooks/            # Data-fetching hooks
│   │   ├── lib/              # Config, API client, CMS helpers
│   │   ├── server/           # Server-side data/logic
│   │   └── styles/           # Design tokens
│   └── public/                # Static assets
│
├── kashmir-backend/           # FastAPI backend
│   └── app/
│       ├── routers/           # /documentary /news /social /payment /cms/*
│       ├── services/          # Supabase, Brevo, Ayrshare, payments, scraping
│       ├── models/            # Pydantic schemas
│       └── .env.example       # Environment variable template
│
├── setup/                     # ⭐ NEW — first-time setup for Supabase/Brevo/Ayrshare
│   ├── supabase-schema.sql    # DB blueprint — paste into Supabase SQL Editor
│   └── SETUP-GUIDE.md         # Step-by-step signups
│
├── Beauty of Kashmir/         # 24 landscape reference images
├── Montage/                   # Documentary montage source images
├── The People/                # 12 portrait reference images
│
├── LAUNCH-CHECKLIST.md        # ⭐ NEW — what's left before public launch
├── ROAD-TO-LAUNCH.md          # ⭐ NEW — full commercial gap analysis + 8-week plan
├── PROJECT_BRIEF.md
└── KASHMIR_FIGHTING_FOR_PEACE_FRONTEND_BRIEF.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- A Supabase project (see `setup/SETUP-GUIDE.md`) — CMS and shop won't function without it

### 1. Backend (FastAPI)

```bash
cd kashmir-backend
python -m venv venv
venv\Scripts\activate         # Windows
# source venv/bin/activate    # Mac/Linux
pip install -r requirements.txt
cp app/.env.example app/.env
# fill in Supabase + Brevo + Ayrshare + CMS credentials (see SETUP-GUIDE.md)
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend (Next.js)

```bash
cd kashmir-frontend
npm install
# create .env.local (see Environment Variables below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). CMS is at `/cms`.

---

## Environment Variables

See `setup/SETUP-GUIDE.md` for the complete list. Short version:

**`kashmir-backend/app/.env`** — all server secrets:
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `BREVO_API_KEY`, `BREVO_FROM_EMAIL`, `BREVO_ADMIN_EMAIL`
- `AYRSHARE_API_KEY`
- `CMS_PASSWORD`, `CMS_JWT_SECRET`
- `JWT_SECRET`, `APP_SECRET_KEY`
- Optional: Airpay credentials (film payment), Apify (social scraping)

**`kashmir-frontend/.env.local`**:
- `NEXT_PUBLIC_API_URL=` (empty — use built-in proxy routes)
- `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
- `NEXT_PUBLIC_DEV_BYPASS_PAYMENT=true` (dev only)

> **Never commit real API keys.** `.env` and `.env.local` are git-ignored. Share via a password manager (Bitwarden), not email or Slack.

---

## Documentation

- **[setup/SETUP-GUIDE.md](./setup/SETUP-GUIDE.md)** — step-by-step Supabase, Brevo, and Ayrshare signup with test verification
- **[LAUNCH-CHECKLIST.md](./LAUNCH-CHECKLIST.md)** — must-do items before public launch (secrets, rate limits, hosting)
- **[ROAD-TO-LAUNCH.md](./ROAD-TO-LAUNCH.md)** — full commercial-readiness analysis with 8-week plan

---

## Scripts

```bash
# Frontend
npm run dev       # Development server (localhost:3000)
npm run build     # Production build
npm run start     # Production server
npm run lint      # ESLint

# Backend
uvicorn app.main:app --reload    # Dev server (localhost:8000)
```

---

## Built by

**RIG 360 Media**
Documentary filmmaking & digital storytelling

---

*"Beyond the curated broadcasts lies a forgotten landscape where grief wears no single uniform."*
