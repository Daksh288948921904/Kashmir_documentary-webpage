# Road to Launch — Kashmir Platform

**A complete, honest picture of what's left to make this platform legally live, commercially working, and safe for real customers.**

Written after full technical audit. Read once, then work through it top-to-bottom. Each item has: **what**, **why it matters**, and **how to do it**.

---

## Where we are today ✅

The platform runs end-to-end: film site + Kashmir Harvest shop + CMS + database + email + social publishing. All three cloud services (Supabase, Brevo, Ayrshare) are wired in. You can add a product, a customer can order it, the admin gets an email, the order shows in the CMS, and posts can be published to Instagram/Facebook.

**Missing to be a real business.** Everything below.

---

## PART 1 — Paperwork the team must do (no code)

These block the launch regardless of how good the code is.

### 1.1 Register the business
**What:** a legal entity — proprietorship, LLP, or Pvt Ltd — that owns "Kashmir Harvest" and the documentary.
**Why:** payment gateways, bank accounts, and GST all require a registered business. You cannot open a merchant account otherwise.
**How:** for a small start, **Sole Proprietorship** is simplest (₹0–2,000, 1 week via a CA). Later upgrade to LLP or Pvt Ltd if scaling. Ask any CA.

### 1.2 GST registration
**What:** a GSTIN number for the business.
**Why:** mandatory in India for e-commerce sales above ₹40 lakh/year (or from day 1 if selling inter-state). Also required by every payment gateway.
**How:** apply at [gst.gov.in](https://gst.gov.in) — free, ~10 days. Needs the business registration from 1.1.

### 1.3 FSSAI food licence
**What:** a licence to sell food products (saffron, walnuts, teas, honey — everything in your shop is food).
**Why:** it's illegal to sell food in India without one.
**How:** apply at [foscos.fssai.gov.in](https://foscos.fssai.gov.in). For turnover under ₹12 lakh/year → Basic Registration (₹100/year). Above that → State/Central Licence. Takes 7–60 days.

### 1.4 Business bank account
**What:** a current account in the business's name.
**Why:** payment gateway settles here; personal accounts get flagged as unregistered commerce.
**How:** any bank; needs the business registration + GSTIN + PAN.

### 1.5 Payment gateway merchant account
**What:** approved merchant account with Airpay (or Razorpay/PayU/Cashfree).
**Why:** the film payment is currently disabled because there are no real gateway keys. The shop uses UPI-manual only.
**How:** apply on the gateway's website after 1.1–1.4 are done. Takes 3–15 days. **Suggestion:** Razorpay is easier to onboard than Airpay if the team isn't tied to Airpay.

### 1.6 Domain name
**What:** the real address of the site (e.g. `kashmir-fightingforpeace.in` or `kashmirharvest.in`).
**Why:** `localhost:3000` isn't a business.
**How:** buy at Namecheap, GoDaddy, or Cloudflare Registrar. ₹700–1,500/year. Ideally two — one for the film, one for the shop, or one master.

### 1.7 Have a lawyer review the legal pages
**What:** the Privacy Policy, Terms of Use, Refund Policy pages we generated are templates.
**Why:** DPDP (India) and GDPR (if any EU visitor) require accurate policies. A wrong policy is worse than none.
**How:** any Indian tech-startup lawyer, 1–2 hours consultation, ~₹5,000–15,000.

---

## PART 2 — Content the team must produce

The platform is ready; the content isn't.

### 2.1 The actual film
**What:** the finished 70-minute documentary file, plus a real trailer.
**Why:** the paywall protects a URL that doesn't exist yet. This is the product.
**How:** production team work. Export as MP4, H.264, 1080p, ~5–10 GB.

### 2.2 Real product catalogue
**What:** replace any test product with real saffron, walnuts, kahwa, etc. Real names, prices, weights, GI info, photos.
**How:** log in to CMS → Products → **+ ADD PRODUCT** → fill in → upload real photo → Save.

### 2.3 Real UPI ID (or gateway checkout)
**What:** currently the customer email shows a QR pointing at a personal UPI (see `brevo_service.py`). Change to the business UPI, or switch to real gateway checkout.
**How:** edit `kashmir-backend/app/services/brevo_service.py` lines 5–6 (`_UPI_ID` and `_UPI_NAME`).

### 2.4 Real contact email
**What:** the shop success screen and email footer say `harvest@kashmir-untoldechoes.in` — that domain doesn't exist.
**How:** register a real email on your real domain (Zoho Mail free, Google Workspace ₹125/user/month). Update in the code + set as Brevo sender.

### 2.5 Director name and film details
**What:** currently says "Rig 360 Media" as director — should be the real person's name.
**How:** edit `src/content/film.ts`.

### 2.6 Real hero/poster images
**What:** homepage hero and film poster currently use Pexels stock photos.
**How:** production stills → replace URLs in `src/lib/config.ts` under `heroImages` and `media.posterUrl`.

### 2.7 Real film price
**What:** currently ₹1 (test).
**How:** change in `src/lib/config.ts` (`pricing.amount` + `amountDisplay`) and `kashmir-backend/app/.env` (`DOCUMENTARY_PRICE_INR`).

---

## PART 3 — Standard e-commerce features we don't have

The shop works, but it's missing things every real online store has.

### 3.1 Inventory / stock tracking
**What:** the CMS lets you mark products active/hidden, but not "5 units in stock." Customers can order things you don't have.
**How:** add a `stock` column to `products` in Supabase; decrement it in the order-create endpoint; hide out-of-stock in the shop. ~2 hours.

### 3.2 Shipping cost calculation
**What:** "Free shipping above ₹999" is displayed text only — the code doesn't actually charge shipping under ₹999, and doesn't vary by weight or destination.
**How:** add shipping rules to the order-total calculation (backend). Options: flat rate per weight bucket, or integrate a courier API (Shiprocket, Delhivery).

### 3.3 Order status emails
**What:** customer gets ONE email (confirmation). No email when order ships or delivered.
**How:** hook the order status-change endpoint to Brevo; add two more email templates.

### 3.4 Order confirmation number visible to customer
**What:** currently they get a database UUID buried in their email. No friendly order number like "KH-2026-0042" on the success screen.
**How:** add a sequential order-number column to the DB; show it on the success page and in emails.

### 3.5 Return/refund workflow in the CMS
**What:** the CMS has no button for "issue refund" or "process return".
**How:** add a "Refund" action to CMS Orders; add refund records to DB; connect to payment gateway's refund API when live.

### 3.6 Real shipping label / AWB flow
**What:** currently admin manually creates courier waybills.
**How:** integrate Shiprocket (₹0 base, per-shipment fees) or Delhivery API.

### 3.7 GST invoice generation
**What:** no PDF invoice generated for orders.
**Why:** legally required for any GST-registered sale.
**How:** generate PDF invoices with the GSTIN and tax breakdown per order; attach to customer email.

---

## PART 4 — Standard documentary/media platform gaps

The film side is thinner than the shop side.

### 4.1 User accounts (not just paywall)
**What:** currently, one payment gives access on **one browser only**. Watch on your phone? Pay again — the access token isn't there.
**Why:** every real streaming platform has accounts. Customers won't tolerate paying twice.
**How:** add email/password (or magic-link) signup; store user records; issue longer-lived tokens tied to the user. ~1 week of dev work, or use Supabase Auth (built-in, ~2 days integration).

### 4.2 Server-side film protection
**What:** the film URL is currently exposed in the browser bundle. Anyone can read the page source and grab the URL.
**Why:** the paywall is decoration, not security.
**How:** move the film URL to a server-only variable; serve the video through a Next.js route that checks the JWT before returning it. Or better: use a video-hosting service that handles signed URLs (see 4.3).

### 4.3 Video hosting (CDN)
**What:** a 70-min HD film served from your own server will crush it under real traffic.
**How:** use a video CDN. Options:
- **Bunny Stream** (~$5/month base, cheap per-GB) — good starter
- **Cloudflare Stream** ($5/1000 minutes stored + $1/1000 minutes delivered)
- **Mux** — most professional, more expensive
All three handle: signed URLs, adaptive bitrate, no piracy of the source file.

### 4.4 Subtitles / captions
**What:** none.
**Why:** a Kashmir documentary needs Hindi and English at minimum. Also required for accessibility.
**How:** generate `.vtt` subtitle files; upload alongside the video; ReactPlayer supports them natively.

### 4.5 Watch analytics
**What:** no data on how many people watched, how far they got, which chapters.
**How:** if using a video CDN (4.3), most give this for free. Otherwise Google Analytics events on play/pause/end.

---

## PART 5 — Security & reliability (before public URL)

The moment the site is public, strangers will poke at it. These items prepare it.

### 5.1 Real secret keys
**What:** `.env` still says `...change-in-production`. Anyone reading GitHub can forge admin sessions and film access tokens.
**How:** generate long random values for `JWT_SECRET`, `CMS_JWT_SECRET`, `APP_SECRET_KEY`, and a stronger `CMS_PASSWORD`. Use a password manager, never commit `.env`.

### 5.2 Rate limiting on login and orders
**What:** currently anyone can try 1 million CMS passwords per minute, or spam 1 million fake orders (each triggering 2 emails = email bomb).
**How:** ~30 lines of code using `slowapi` in FastAPI. Limits: 5 login tries/min/IP, 10 orders/min/IP.

### 5.3 HTTPS + real domain
**What:** production must be `https://kashmirharvest.in`, not `http://localhost:3000`.
**How:** the hosting service (Vercel, Netlify, Fly.io) provides this automatically once the domain is pointed at it.

### 5.4 Monitoring & error tracking
**What:** if something crashes at 3 AM in production, nobody knows.
**How:** Sentry (free tier ~5k errors/month) — 10 minutes to set up. Uptime Robot (free) pings the site every 5 minutes.

### 5.5 Automatic backups
**What:** if the database is corrupted, everything is gone.
**How:** Supabase does automatic daily backups on paid tier (₹2,000/month). On free tier, set a calendar reminder to export tables to CSV weekly (dashboard → Table Editor → export).

### 5.6 Input validation
**What:** the shop accepts any email format (`"lol"` would be stored). Prices could be negative in the CMS.
**How:** small backend edits — swap `str` for `EmailStr` and add `ge=0` constraints in the Pydantic models. ~15 minutes.

### 5.7 The broken news source
**What:** "The Wire — Kashmir" RSS feed errors every fetch. Silently ignored, so the site runs on 4/5 sources.
**How:** find their new RSS URL or remove that feed from the list.

---

## PART 6 — Deployment (making it public)

### 6.1 Frontend hosting
**Recommended:** **Vercel** (free tier is plenty for now). Push code to GitHub → connect Vercel → auto-deploys. Real HTTPS, real domain, done.

### 6.2 Backend hosting
**Recommended:** **Render** or **Fly.io** free/starter tier. Runs the FastAPI backend permanently. ~₹500–800/month.

### 6.3 Point the domain
Buy at Cloudflare Registrar (cheapest, cleanest). Point to Vercel/Render via DNS records — takes 15 minutes.

### 6.4 Set production env vars
On Vercel and Render, add all `.env` values in their dashboard (never in code). Use the real Supabase / Brevo / Ayrshare keys. Replace the `dev-` secrets.

### 6.5 Real Brevo sender email
Switch Brevo's "from address" from a personal Gmail to `orders@yourdomain`. Verify that address inside Brevo. Free.

---

## PART 7 — Nice to have (post-launch OK)

These are real improvements but don't block launch.

- **Discount codes** — add a coupons table + validation logic in checkout
- **Admin analytics dashboard** — revenue, top products, orders over time (Recharts + Supabase queries, ~1 day)
- **SEO audit** — run Lighthouse, fix red flags
- **Performance** — image compression pass, code-splitting audit
- **Accessibility fixes** — the site uses custom `cursor:none` and many clickable `<div>`s that fail screen readers. Real WCAG audit before claiming accessibility
- **Password recovery** — for the customer accounts added in 4.1
- **Cookie banner region** — check GDPR wording if targeting EU visitors
- **Business address / Impressum footer** — legally required in many jurisdictions
- **Support inbox** — email or a widget (Crisp, Tawk.to — free)
- **Load testing** — can the site handle 500 concurrent users? Test with k6 or Locust

---

## PART 8 — The order you should tackle this in

**Weeks 1–3 — foundations (mostly paperwork):**
Business registration → GST → FSSAI → business bank account → apply for payment gateway → buy domain.

**Weeks 3–4 — content & polish (while gateway approves):**
Real products, real photos, real UPI/gateway keys, real film assets, real emails, review legal pages with a lawyer.

**Week 5 — build the missing e-commerce features:**
Inventory (3.1), shipping cost (3.2), invoice generation (3.7), status emails (3.3), order numbers (3.4).

**Week 6 — build the missing film features:**
User accounts via Supabase Auth (4.1), server-side film gate (4.2), sign up for a video CDN (4.3), upload film + subtitles.

**Week 7 — security & deployment:**
Real secrets (5.1), rate limiting (5.2), monitoring (5.4), deploy to Vercel + Render (6.x), point domain, set env vars.

**Week 8 — soft launch:**
Friends & family test purchases, watch flow, iterate. Then open publicly.

---

## Money check — realistic monthly running costs

| Item | Cost/month |
|---|---|
| Domain | ~₹100 |
| Vercel (frontend) | ₹0 (free tier fine to start) |
| Render (backend) | ₹700 |
| Supabase | ₹0 (free tier fine to start), ₹2,000 when you scale |
| Brevo | ₹0 (free tier 300 emails/day) |
| Ayrshare | ₹0 (free tier limited) or $29/month |
| Video CDN | ₹500–2,000 depending on viewers |
| Google Workspace email | ₹125/user |
| Sentry monitoring | ₹0 free tier |
| **Total early** | **~₹1,500–3,500/month** |

Payment gateway takes 2–3% per transaction, not a flat fee.

---

## The bottom line

**This platform is technically 70% ready.** The remaining 30% is:
- Half paperwork the team must do
- Quarter content the team must produce
- Quarter engineering (inventory, viewer accounts, video CDN, deployment)

Nothing here is a mystery, an emergency, or a broken foundation. You have a real working platform. The list above turns "working" into "commercial."

Do the items **in the order given** and there are no dead-ends. Skip an early item and later items get blocked.
