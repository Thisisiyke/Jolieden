# Jolieden Beauty Bar — Build Brief

> **Start here.** This is the single source of truth for the production build of Jolieden Beauty Bar. If a teammate hands you this file, you can find every other doc, the visual reference, the contract, and the open questions from it.

---

## 0 · TL;DR

- **What:** Replace Jolieden's Boulevard booking widget with a custom software platform. 7 surfaces, dual admin model (Owner + Manager), per-station kiosks, AI SMS Concierge, multi-location data architecture.
- **Who:** Built by **KufGroup LLC d/b/a AmbittMedia** (Kyle Kufuor, CEO) for **JOLIEDEN Beauty Bar** (Diéssou Kante, Owner). Lead delivery sub: Valere (via Upwork).
- **When:** Kickoff **June 15, 2026** → Final acceptance **February 15, 2027** (9 months). 5 milestones.
- **How much:** Fixed-fee **$170,000 USD**, 9 monthly installments via Wave, billed by ACH.
- **Where:** Production-stable web + iOS + Android. Primary location is **Jolieden Harlem** (2510 Lenox Ave). Built multi-location from day one.

---

## 1 · The handoff package

Read these in order:

| # | File | What it covers |
|---|---|---|
| 1 | **[`BUILD_BRIEF.md`](./BUILD_BRIEF.md)** ← *you are here* | Orientation, roadmap, links to everything |
| 2 | **[`DATA_MODEL.md`](./DATA_MODEL.md)** | Locked Postgres schema across 14 domains (~30 tables) — the contract between API and frontend |
| 3 | **[`DEAD_END_AUDIT.md`](./DEAD_END_AUDIT.md)** | Every click in the artifact that's stubbed; what's in scope vs deferred vs TBD |
| 4 | **`QUESTIONS_FRONTEND.md`** + **`QUESTIONS_BACKEND.md`** | Pre-emptive question lists from senior FE + BE perspective |
| 5 | **[`ARCHITECTURE.md`](./ARCHITECTURE.md)** | Tech stack, system architecture, deployment, NFRs (predates the artifact — see §3 for divergences) |
| 6 | **[`AI_CONCIERGE.md`](./AI_CONCIERGE.md)** | Twilio + Claude SMS bot: system prompt, tool schemas, escalation logic, cost model |
| 7 | **[`MVP_SCOPE.md`](./MVP_SCOPE.md)** | Phasing, what's in v1 vs Phase 2/3, team staffing |
| 8 | **[`PRODUCT_SPEC.md`](./PRODUCT_SPEC.md)** | Screen-by-screen reference for the older prototype (overlap with the artifact — see §3) |
| 9 | **`ai-eval-corpus.json`** | 32 starter regression cases for the Concierge |

### Outside this docs/ folder

- **The artifact:** `/Users/kylekufuor/Downloads/remixed-58c87693-v4-booking-site.html` — Diéssou's design language, 7 surfaces in one self-contained HTML file. Decode the `SURF` object to get individual surface files.
- **The decoded surfaces:** `/tmp/diessou-surfaces/{client,kiosk,stylist,owner,manager,shoot,site}.html`
- **The contract (signable PDF):** `/Users/kylekufuor/Downloads/AmbittMedia-Jolieden-MSA.pdf` and the source HTML at `/tmp/jolieden-contract.html`
- **The prototype repo:** `/Users/kylekufuor/Projects/Jolieden-iyke` (Next.js prototype — diverges from the artifact aesthetically; useful for component-level reference but **not** the visual ground truth)
- **The live prototype:** `https://jolieden.vercel.app` (will be replaced by this Build Brief)

---

## 2 · The seven surfaces

| # | Surface | Form factor | Audience | URL prefix |
|---|---|---|---|---|
| 1 | **Public Booking Website** | Desktop + mobile web | Anonymous visitors → first-time bookers | `joliedensbeautybar.com/book` (Boulevard replacement) |
| 2 | **Client Companion App** | iOS + Android | Returning clients, logged in | App-only |
| 3 | **Station Kiosk** | iPad locked to one station | Clients in the chair | LAN URL per station |
| 4 | **Stylist App** | iOS + Android (EN + FR) | Staff doing the work | App-only |
| 5 | **Admin — Owner** | Desktop web | Diéssou | `admin.jolieden.app/owner` |
| 6 | **Admin — Manager** | Desktop web | Floor managers | `admin.jolieden.app/floor` |
| 7 | **Catalog Shoot Ops** | Desktop web (Phase 2 add-on) | Diéssou + shoot organizers | `admin.jolieden.app/shoot` |

The **Booking Website** (#1) and **Client Companion** (#2) share the booking engine. The public site has no account required — visitors browse + claim a chair + pay deposit; logged-in app users get the same flow with their saved details + rewards already applied.

---

## 3 · Divergences from the older docs

`docs/ARCHITECTURE.md` + `docs/PRODUCT_SPEC.md` were written from an earlier prototype Kyle built before Diéssou shared her own artifact. **Where the older docs and the artifact disagree, the artifact wins.** The most important deltas:

| Topic | Older docs | Artifact (the truth) |
|---|---|---|
| **Number of surfaces** | 5 | **7** (added: Owner/Manager split into two, Catalog Shoot as Phase 2 add-on) |
| **Operator split** | Single operator app | **Owner** (strategy + targets + KPIs) vs **Manager** (floor ops + Concierge + Oopsie) |
| **Kiosk** | One iPad at front desk | **One tablet per station** — runs a "settle in and sign in" flow at the chair |
| **Brand palette** | Cream + burgundy + gold | **Dual-mode**: cream + champagne for client/site; dark warm + champagne for admin |
| **Typography** | Inter + brand sans | **Fraunces** italic gold accents for headings; **Hanken Grotesk** for body |
| **Stylist titles** | "Senior Braider", "Color Specialist", etc. | **Apprentice / Stylist / Senior / Master Influencer** — branded as "Influencers" |
| **Floor states** | unconfirmed/confirmed/arrived/active/completed (Boulevard-style) | **Available / Occupied / Finishing / Birthday / Needs attention / On break / Offline** — more conversational |
| **Salon scale** | ~8 stylists | **30 chairs**, ~23 active — Harlem mega-salon |
| **Birthday week** | Soft visual on `/me` home | **Manager floor map shows a Birthday state for the station + auto-perks at checkout** |
| **Catalog gallery photos** | Seed photos | **5-day October Lookbook studio shoot** with stylist-influencer trade — own operational surface |

Where the older docs are still correct (auth flow, multi-tenancy strategy, AI Concierge architecture, RLS policy patterns), keep referencing them.

---

## 4 · Visual language at a glance

**Cream surfaces (client app, booking site, kiosk):**
- Background: `#FBF7EF` (or `#F4ECDD` for panels)
- Ink: `#2C241D`, soft ink: `#5C4B3E`
- Accents: `#C2912F` (ochre/gold), `#A8623C` (clay/copper)
- Birthday-specific: `#9C5C8F` (mauve)
- Teal hint: `#4E7E76`

**Dark surfaces (owner + manager admin):**
- Background: `#0F0C09` → `#241A0F` warm dark
- Cream text: `#F1E9DB`
- Gold accents: `#C2912F`
- Clay CTAs: `#A8623C`

**Type:**
- Display (headings, proper nouns): **Fraunces** — italic emphasis on the "noun" word, gold color
- Body (everything else): **Hanken Grotesk**
- Numbers: tabular-nums for tables + financial values

**Component patterns:** dashed teal borders for "fill-this-in" inputs (signature box, date box, birthday lock), pills with letter-spacing for status/eyebrow labels, photo cards with 4:5 aspect ratio.

See the contract PDF's Exhibit A page or the artifact's hub for the canonical palette in use.

---

## 5 · 9-month roadmap

| M | Date | What ships | Acceptance trigger |
|---|---|---|---|
| **M1** | Aug 15, 2026 | Foundation: infrastructure (Vercel + Postgres + storage), auth (phone OTP), multi-tenant data model, brand tokens applied, AI Concierge plumbing (Twilio webhooks + Anthropic API live) | Staging URL with login + one end-to-end booking through fake Stripe |
| **M2** | Oct 15, 2026 | Owner + Manager admin v1. **Boulevard cutover** — operator switches over to Jolieden v1. Floor map live. Weekly booking goal operational. Register count + cash drawer working. AI Concierge MVP handling routine asks. | Production cutover from Boulevard widget |
| **M3** | Nov 30, 2026 | Public booking website launch on joliedensbeautybar.com — photo-first gallery, configurable booking sheet, Wave-routed deposit flow | Public launch — `joliedensbeautybar.com/book` redirects from Boulevard |
| **M4** | Jan 31, 2027 | Companion mobile apps (Client + Stylist, iOS + Android beta on TestFlight + Play internal track) + station kiosk software ready for hardware install | Beta builds delivered to Diéssou for internal testing in Harlem |
| **M5** | Feb 15, 2027 | Final acceptance: production-stable, Severity 1+2 defects cleared, EN/FR toggle shipped in Stylist app | Diéssou signs off on M5 acceptance form; final payment due |

Catalog Shoot (Phase 2) is acknowledged as a separate, optional engagement — production logistics out of scope under the $170k.

---

## 6 · Tech stack (binding from `ARCHITECTURE.md`)

- **Web frontend (booking site, admin):** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4 + design tokens
- **Mobile apps (client, stylist):** React Native + Tamagui (per ARCHITECTURE.md §15)
- **Backend:** Vercel API routes for all server-side logic. Postgres via Supabase (multi-region read replicas optional Phase 2)
- **Auth:** Supabase Auth — phone OTP primary; email + magic-link for recovery; sessions issued by Auth, RLS policies on every table
- **Storage:** Supabase Storage (S3-compatible) for hair-journey photos, catalog shoot assets, stylist portraits, kiosk signatures
- **AI:** Anthropic Claude (Sonnet 4.6+) via API for the SMS Concierge. Tool calls for `lookup_availability`, `book_appointment`, `reschedule_appointment`, `escalate_to_human`, `find_lost_item`, `add_to_waitlist`. System prompt + cost model in `AI_CONCIERGE.md`
- **SMS:** Twilio Conversations API on the salon's number. Single number per location
- **Payments:** Stripe Connect Standard per stylist for commission payouts; deposit + checkout via Stripe Payment Intents on the booking site
- **Invoicing AmbittMedia ↔ Jolieden:** Wave (waveapps.com) — ACH from Wave invoices
- **Hosting:** Vercel for web + APIs. Database on Supabase. Domains via Diéssou's existing registrar
- **CI/CD:** GitHub Actions → Vercel preview deploys per PR; main → production
- **Monitoring:** Vercel Analytics + Sentry for error tracking; PostHog for product analytics (consent-gated)
- **Mobile distribution:** App Store + Play under **Jolieden Beauty Bar** developer accounts (Diéssou owns)

---

## 7 · Multi-tenancy / multi-location strategy

Built multi-location from day one, even though Harlem is the only location at launch:

- Every business-data table carries `location_id`
- RLS policies on every table filter by `auth.jwt() -> location_id`
- Sessions issued with `location_id` claim
- Stylists can be assigned to multiple locations via `stylist_locations`
- Clients have a `primary_location_id` but visit history per location lives in `client_locations`
- AI Concierge has one Twilio number per location → routes by `from_number` to thread on the right location
- Owner UI gets a location switcher when 2+ active locations exist

Why this matters now: avoids the expensive migration later when Diéssou opens her second location.

---

## 8 · Auth flow (single source of truth)

```
[ Visitor lands on joliedensbeautybar.com/book ]
         │
         │  Browse looks anonymously
         ▼
[ Tap a look → Booking sheet → Hold the chair · $40 deposit ]
         │
         │  Stripe Payment Intent → 3DS if required
         │  After successful Payment Intent:
         ▼
[ Phone OTP gate: enter phone → 6-digit code ]
         │
         │  If phone matches existing client:
         │     attach booking to that client, app account already exists
         │  If phone is new:
         │     create client + send name/email prompt next
         ▼
[ Booking confirmed → SMS + email confirmation sent → option to install mobile app ]

[ Mobile app: open → phone OTP → SMS + email collected → ready to use ]

[ Admin: phone OTP → step-up auth (email magic link) for Founder Access actions ]
```

Birthday is collected via the in-app BirthdayNudge — **not** at signup. Written once via `birthday_set_at` timestamp; operator can override with audit log.

---

## 9 · Open questions → see `QUESTIONS_FRONTEND.md` + `QUESTIONS_BACKEND.md`

The two agent-generated question lists are aggregated into `OPEN_QUESTIONS.md` once both complete. That doc becomes the **questionnaire we send Diéssou** before any major build decisions.

Critical buckets:

1. **Business rules with no current default:** deposit amount, cancellation window, no-show fee %, commission %, birthday-week boundaries, points-per-dollar, kid-policy specifics, etc. (~25 items)
2. **Brand decisions:** what stays "Influencer" branded vs reverts to "Stylist", logo files for the apps, Apple/Google developer account setup, brand voice review of all transactional SMS/email
3. **Data:** Boulevard export format + migration strategy (currently out of scope per Exhibit A.4)
4. **Hardware:** kiosk iPads — model, mount, sleep policy, kiosk-mode setup. Diéssou procures hardware per contract
5. **Phase 2 plans:** Catalog Shoot timing, second-location plans, multi-language scope

---

## 10 · What's intentionally NOT in v1

Per Exhibit A.4 of the contract:

- Hardware procurement (Diéssou's responsibility)
- Hosting + SaaS recurring fees (pass-through under §3.6)
- Content production beyond placeholder seeding (Catalog Shoot = Phase 2)
- Boulevard pre-2026 data migration (separate engagement)
- Marketing & SEO
- Calendar sync (Google/Apple) — Phase 2
- Inventory cost accounting (COGS)
- Stylist payroll (only commission accrual tracked in v1)

---

## 11 · Project conventions

- **Time:** All timestamps stored as `timestamptz`. UI presents in the **location's timezone** (Harlem = `America/New_York`). Stylist app shows times in user-local time when traveling.
- **Money:** All values stored as **integer cents** in `bigint` columns. Never use floats for money.
- **Phone numbers:** All stored as E.164 (`+16465550100`). Display in human format (`(646) 555-0100`).
- **Names:** Title case in storage. Don't auto-correct.
- **Languages:** EN default; FR added in M5 to the Stylist app. Other surfaces TBD (open question).
- **Emojis in copy:** Diéssou's voice uses 💛 sparingly. Don't over-emoji.
- **Branding:** **JOLIEDEN Beauty Bar** in titles. **Diéssou Kante** as Owner.
- **The "Influencer" framing for stylists is intentional** — preserves her brand voice. Don't quietly rename to "Stylist" without permission.

---

## 12 · Where to file new questions

As you build, if you hit a TBD: add it to `OPEN_QUESTIONS.md` with the surface, the specific scenario, and what we need from Diéssou to unblock you. Don't invent business rules — flag them.

---

*Last updated when this brief was generated. Subsequent edits should bump the date in the commit message.*
