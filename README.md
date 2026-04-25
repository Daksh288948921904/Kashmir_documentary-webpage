# Kashmir: Untold Echoes

A full-stack documentary webpage for *Kashmir: Untold Echoes* — a 95-minute documentary exploring 700+ years of Kashmir's history, culture, and conflict.

---

## Overview

The project is split into two parts:

| Directory | Stack | Purpose |
|---|---|---|
| `app/` | Python · FastAPI | REST API backend |
| `kashmir-documentary/` | React · Vite | Frontend webpage |

---

## Features

- **Interactive History Roadmap** — SVG map of the Kashmir region with clickable historical events spanning political, cultural, conflict, and humanitarian categories
- **Documentary Overview** — film stats, synopsis, and chapter markers pulled from the API
- **Social Feed** — aggregated posts from Instagram & Twitter filtered by platform
- **News Dispatch** — live Kashmir news feed via RSS/News API
- **Payment & Access** — Razorpay integration for ₹299 documentary access with JWT-based session management
- **Movie Player** — gated video player page with chapter sidebar (video embed placeholder)

---

## Project Structure

```
Kashmir/
├── app/                        # FastAPI backend
│   ├── main.py                 # App entry point, CORS, router registration
│   ├── config.py               # Pydantic settings (reads from .env)
│   ├── requirements.txt
│   ├── .env.example            # Template for environment variables
│   ├── models/
│   │   └── schemas.py
│   ├── routers/
│   │   ├── documentary.py      # /api/documentary/*
│   │   ├── news.py             # /api/news/feed
│   │   ├── payement.py         # /api/payment/*
│   │   └── social.py           # /api/social/feed
│   └── services/
│       ├── documentary_data.py
│       ├── news_aggregator.py
│       ├── payments.py
│       └── social_scraper.py
│
└── kashmir-documentary/        # React + Vite frontend
    ├── index.html
    ├── vite.config.js
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx             # Main component (all sections)
    │   ├── App.css
    │   └── index.css
    └── public/
```

---

## Getting Started

### Backend

```bash
cd app

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Run the server
uvicorn app.main:app --reload
```

API runs at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd kashmir-documentary

npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## Environment Variables

Copy `app/.env.example` to `app/.env` and fill in:

| Variable | Description |
|---|---|
| `APIFY_API_TOKEN` | Apify token for social media scraping |
| `RAZORPAY_KEY_ID` | Razorpay public key |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key |
| `NEWS_API_KEY` | NewsAPI.org key |
| `APP_SECRET_KEY` | App secret (any random string) |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `FRONTEND_URL` | Frontend origin for CORS (default: `http://localhost:5173`) |
| `DOCUMENTARY_PRICE_INR` | Price in INR (default: `299`) |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/documentary/overview` | Film metadata |
| GET | `/api/documentary/timeline` | Historical events |
| GET | `/api/documentary/timestamps` | Chapter markers |
| GET | `/api/social/feed` | Social posts (filter: `?platform=instagram\|twitter`) |
| GET | `/api/news/feed` | Latest Kashmir news |
| POST | `/api/payment/create-order` | Create Razorpay order |
| POST | `/api/payment/verify` | Verify payment & issue JWT |
| GET | `/api/payment/verify-access` | Validate access token |

---

## Tech Stack

**Backend:** Python 3.11+, FastAPI, Uvicorn, Pydantic v2, Razorpay, APScheduler, BeautifulSoup4, Feedparser, python-jose

**Frontend:** React 19, Vite, Google Fonts (Cormorant Garamond, Libre Baskerville)
