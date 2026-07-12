# Kashmir Platform — Live Services Setup Guide

The code is complete. These three signups connect it to live services.
After each step, paste the keys into `kashmir-backend/app/.env` and restart the backend.

---

## 1. Supabase (database + image storage) — REQUIRED FIRST

This unlocks: CMS Products / Orders / Social pages, the shop catalogue, checkout orders, image uploads.

1. Go to https://supabase.com → **Start your project** → sign up (free tier is enough).
2. Click **New project**:
   - Name: `kashmir-harvest` (anything works)
   - Database password: pick one and save it somewhere safe (you rarely need it again)
   - Region: `Mumbai (ap-south-1)` — closest to your users
3. Wait ~2 minutes for the project to be created.
4. Left sidebar → **SQL Editor** → **New query** → paste the entire contents of
   `setup/supabase-schema.sql` → click **Run**. You should see "Success. No rows returned".
5. Left sidebar → **Project Settings** (gear icon) → **API**:
   - Copy **Project URL** → paste as `SUPABASE_URL=` in the .env
   - Copy the **service_role** key (under "Project API keys" — click reveal) → paste as `SUPABASE_SERVICE_ROLE_KEY=`
   - ⚠️ The service_role key is a master key. Never put it in the frontend or share it publicly.

**Test:** restart the backend, open `localhost:3000/cms/products` → the error disappears,
you see "No products yet". Add a product → it appears at `localhost:3000/shop`.

---

## 2. Brevo (order notification emails)

This unlocks: an email to the admin every time a customer places a shop order.
The shop works fine without this — orders still land in CMS → Orders.

1. Go to https://www.brevo.com → sign up free (300 emails/day free tier).
2. Verify your email address when prompted (this becomes your "sender").
3. Top-right profile menu → **SMTP & API** → **API Keys** tab → **Generate a new API key**.
4. Paste into .env:
   - `BREVO_API_KEY=` the key
   - `BREVO_FROM_EMAIL=` the email you verified in step 2
   - `BREVO_ADMIN_EMAIL=` the email that should RECEIVE order alerts

**Test:** place a test order on the shop → the admin email gets a notification.

---

## 3. Ayrshare (publish social posts from the CMS)

This unlocks: the Publish button in CMS → Social actually posting to Instagram / Facebook / X.
Drafting posts works without this.

1. Go to https://www.ayrshare.com → sign up (free tier: 1 user profile, limited posts/month).
2. In the Ayrshare dashboard → **Social Accounts** → click **Connect** on
   Instagram, Facebook (and X if wanted) and complete each login.
   - Instagram must be a Business/Creator account linked to a Facebook Page.
3. Dashboard → **API Key** → copy it.
4. Paste into .env: `AYRSHARE_API_KEY=`

**Test:** CMS → Social → the platform chips (IG / FB / X) turn from ✕ to ✓.

---

## Not needed yet (skip for now)

- **Airpay** (film payment) — needs a real merchant account with business documents.
  `NEXT_PUBLIC_DEV_BYPASS_PAYMENT=true` already lets you test the film unlock flow without it.
- **Apify** (live social feed scraping) — the site shows curated mock posts without it.

---

## After pasting keys — restart the backend

```
cd kashmir-backend
python -m uvicorn app.main:app --port 8000
```

Frontend (if not running):
```
cd kashmir-frontend
npm run dev
```

CMS: http://localhost:3000/cms — password is the `CMS_PASSWORD` in your `.env` (ask the team lead if you don't have it).
