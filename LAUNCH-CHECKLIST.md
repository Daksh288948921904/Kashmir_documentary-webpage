# Kashmir Platform — Launch Checklist

Everything that must be done **before the site goes live on the public internet**
and handles real customers / real money.

Nothing here blocks development. The platform works today for building and testing.
These are the gap between "works for us on localhost" and "safe for strangers online."

---

## ✅ Already fixed

- **C1 — Order price tampering** — the server now looks up every product's real
  price from the database, recomputes the total, and ignores whatever the browser
  sends. Verified: a faked ₹1 order for a ₹499 product was stored as ₹998.
  Fake/inactive product IDs are rejected. *(orders.py)*
- **M1 — Database connection reuse** — Supabase client is now cached instead of
  rebuilt on every request. *(supabase_client.py)*
- **M3 — Expired CMS session** — an expired/invalid login now clears the token and
  redirects to the login page instead of showing a raw error. *(lib/api.ts)*
- **Double-order bug** — checkout button locks after one click. *(shop/page.tsx)*

---

## 🔴 MUST DO before public launch

### 1. Real secret keys (C4)
- [ ] Generate long random values for `JWT_SECRET`, `CMS_JWT_SECRET`, `APP_SECRET_KEY`
      in `kashmir-backend/app/.env` (currently placeholder "…change-in-production").
- [ ] Pick a strong `CMS_PASSWORD` (current dev value is in the team's shared `.env` — replace with a long, unique value before launch).
- [ ] Confirm no `.env` file is ever committed to GitHub.

### 2. Rate limiting (C3)
- [ ] Add rate limiting to `/api/auth/login` (e.g. 5 attempts/min/IP) so the single
      CMS password can't be brute-forced.
- [ ] Add rate limiting to `/api/orders` so nobody can spam orders (each order sends
      2 emails — an unthrottled endpoint is an email-bomb).
- Recommended tool: `slowapi` for FastAPI.

### 3. Film content protection (C2) — only when the real film exists
- [ ] Do NOT expose the film URL as `NEXT_PUBLIC_FILM_URL` (that ships it to every
      browser). Serve it from a server route that checks the paid JWT first.
- [ ] Verify the "access granted" check is enforced server-side, not just in React.
- Until the real film is ready this is not urgent (it's in "coming soon" mode).

### 4. Payment go-live (Airpay)
- [ ] Obtain a real Airpay merchant account (business documents required).
- [ ] Fill Airpay keys in `.env`; set the real film price (currently ₹1 test).
- [ ] Set `filmAvailable` / `paymentEnabled` in `config.ts` appropriately.

### 5. Hosting & domain
- [ ] Deploy frontend + backend to a real host (not localhost).
- [ ] Set `NEXT_PUBLIC_SITE_URL` and `BACKEND_URL` to real URLs.
- [ ] Point `NEXT_PUBLIC_API_URL` / proxy targets at the deployed backend.
- [ ] Add a real `/public/og-image.jpg` and set `NEXT_PUBLIC_OG_IMAGE_URL`
      (social-share previews are broken without it).

---

## 🟡 CONTENT — replace placeholders before launch

- [ ] **UPI ID** in payment emails — currently a personal ID in `brevo_service.py`.
      Set the official business UPI, or switch to real gateway checkout.
- [ ] **Contact email** on the shop success screen — currently
      `harvest@kashmir-untoldechoes.in` (dead domain) (`shop/page.tsx`).
- [ ] **Director name** — currently "Rig 360 Media" (`lib/config.ts`, `content/film.ts`).
- [ ] **Film assets** — real trailer URL, film URL, poster, and hero images
      (currently stock Pexels photos).
- [ ] **Products** — delete any "Test" product; add the real catalogue with real photos via the CMS.
- [ ] **Brevo sender** — currently a personal Gmail; switch to an official address
      on the project domain and verify it in Brevo.

---

## 🟢 NICE TO HAVE / cleanup (not blocking)

- [ ] **M2 — Remove duplicate backend code.** Documentary/news/social/payment exist
      both in FastAPI (`routers/`) and in Next.js (`src/server/`). The site uses the
      Next.js copies; the FastAPI copies for these four are unused. Delete them or
      document that FastAPI = CMS/shop only, to prevent future confusion.
- [ ] **M4 — Input validation.** Use `EmailStr` for order emails and `ge=0` for
      product prices in the Pydantic models.
- [ ] **M5 — Auth the `/cms/social/config` endpoint** (currently public).
- [ ] **M6 — Fix/replace the broken "The Wire" RSS feed** (parse error every fetch;
      running on 4 of 5 news sources).
- [ ] **L3 — Order confirmation number** shown to customer + optional status-change
      emails (currently follow-up is manual WhatsApp by design).
- [ ] **L5 — Accessibility pass** — keyboard/screen-reader support for clickable
      `<div>`s in the film timeline and CMS tables; the custom `cursor:none` UI.

---

## Account handover (when moving off personal accounts)

If any of the cloud services (Supabase / Brevo / Ayrshare) are currently under a
personal account as a stopgap, hand over with **zero data loss** by inviting the
official account as **Owner** on each service, then leaving — the database, orders,
and images stay put, keys unchanged. Take a CSV backup of each table first as insurance.
