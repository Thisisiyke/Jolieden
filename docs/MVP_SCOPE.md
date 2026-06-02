# Jolieden — MVP scope

> Bucketing every feature in [Diéssou's Apr-15 assessment](https://github.com/Thisisiyke/Jolieden/blob/main/README.md#excel-feature-coverage) into ship-windows so a dev shop can quote against scope, not aspiration.
> Pairs with [ARCHITECTURE.md](./ARCHITECTURE.md).

## Phasing definitions

- **Phase 1 (Day-1 cutover, ~16 weeks)**: Diéssou turns off Boulevard. The salon runs entirely on the new app. The booking widget on joliedensbeautybar.com is ours. SMS still goes through a human (no AI) — that's fine for week 1.
- **Phase 2 (~12 weeks after Phase 1)**: AI Concierge live; client mobile app in TestFlight; stylist mobile app in TestFlight.
- **Phase 3 (~12 weeks after Phase 2)**: multi-location rollout (Atlanta, Houston); premium features (try-on, journey timeline, weekly goals, EotM).
- **P+1 / nice-to-have**: anything Diéssou marked Nice-to-Have or Don't-Need.

Total Day-1-to-feature-complete: ~10 months for a 2-engineer team.

---

## Phase 0 — prerequisites (before any engineering)

Two weeks of paperwork and audits that must start Day 1 of week -2 (i.e. before the team is told to start coding). Skipping these is the #1 reason production launch dates slip in this stack.

### 0.1 Paperwork (Diéssou + PM)

- [ ] **10DLC brand registration** with The Campaign Registry — 4-6 weeks approval. Without it, US carriers throttle/block SMS at production volume. File on day 1.
- [ ] **Apple Developer Program** enrollment for "Jolieden Inc." ($99/yr) — Apple review takes 1-2 weeks, so submit first TestFlight 4 weeks before public launch.
- [ ] **Google Play Console** developer account ($25 one-time).
- [ ] **Stripe Connect application** for the platform account (per Diéssou's salon LLC). Connect Express onboarding for each stylist follows in Phase 1 wk 3.
- [ ] **Google Business Profile API** access (requires Google Cloud project + billing).
- [ ] **OpenAI API account** for embeddings (or Voyage AI if first-party AI matters).
- [ ] **Anthropic API account** + workspace billing.

### 0.2 Source-of-truth audits (lead engineer + Diéssou)

- [ ] **Services catalog audit** — `src/lib/catalog.ts` from the prototype contains placeholder prices. Diéssou confirms each service's name, base price, duration, and modifier options against her current price book. This is the source of truth for both AI quoting and booking-deposit math; getting it wrong costs revenue every appointment. **~3 hours with Diéssou.**
- [ ] **Staff roster audit** — Names, phones, emails, roles, commission percentages, location assignments. Goes into `seed_staff.sql` for Phase 1 wk 2.
- [ ] **Hours of operation per location** — JSON shape per `locations.hours_json` (see [Architecture Appendix A.14](./ARCHITECTURE.md#a14-locations--staff_locations)). Holiday closures captured for the AI knowledge base.
- [ ] **Cancellation / deposit / late policies** — Final wording, sign-off from Diéssou. Lives in `knowledge_documents` and is quoted verbatim by the AI.
- [ ] **Prep instructions per service** — 1-2 paragraphs each. Knowledge-base seed content for Phase 2 AI launch (don't wait until Phase 2 to draft).

### 0.3 Tech onboarding (engineering)

- [ ] **Read Next.js 16 + App Router + Edge Runtime docs** (per AGENTS.md, Next.js APIs have shifted; don't rely on training-data familiarity). Specifically: route handlers, signature verification patterns, `waitUntil()` semantics, Edge Function size limits.
- [ ] **Familiarize with Supabase RLS gotchas** — Realtime + RLS interaction (filters fire server-side per §7.2), the `auth.uid()` claim shape, and the `service_role` bypass.
- [ ] **Boulevard data export** — Pull a sample CSV (the actual file, not the schema) from Diéssou's Boulevard admin. Eyeball the shape before writing the importer.
- [ ] **Walk through the clickable prototype** — Run `npm run dev`, click every screen in `/demo`, read `CLAUDE.md` end-to-end. The product design is in working code; production rebuilds it but keeps the same flows.

**Estimated Phase 0 duration: 2 calendar weeks** (paperwork runs in parallel with audits and tech onboarding).

---

## Phase 1 — Day-1 cutover (16 weeks)

Goal: **Diéssou can turn off Boulevard and run the salon on Day 1.**

A salon day with this scope: front-desk staff check clients in, the calendar shows everyone's day, payments go through, clients book online through a working flow, and SMS confirmations/reminders fire. AI is not live yet — staff replies to SMS manually like they do today.

### Operator app (Day 1)

| Feature | Why must |
|---|---|
| Front Desk kanban (Unconfirmed → Confirmed → Walk-In → Arrived → Active → Completed) | Core daily workflow |
| Calendar view (day + week) with drag/drop, staff filter, time blocks | Replaces Boulevard calendar |
| New appointment creation drawer | Front desk creates walk-ins all day |
| Rescheduling + cancellation tracking with reason | Operational essential |
| Prebooking (book next visit during checkout) | Boulevard Must-Have, kept |
| Appointment preview popover | Quick triage on the kanban |
| Client database: search, profile, contact, history, notes, tags, accommodations, alerts, merge, photo gallery, marketing opt-in, export | Direct replacement |
| Block client | Compliance for problem clients |
| SMS Inbox (manual, no AI) — open/closed tabs, automatic confirmations/reminders/same-day, after-hours auto-response | Replaces Boulevard SMS. AI ships Phase 2. |
| Sales: Orders list, Payments list, Cash/Card/Tips/Split, Account Credit, Refunds, Voiding, Email Receipts, Sales Tax auto-include | Daily check-out |
| Cash Register: drawer open/close, pay-in/out, count, history, variance | Daily reconciliation |
| Gift Card Sales / Redemption / Balance Tracking | Toggleable per Diéssou's notes |
| Package Sales (no Redemption tracking yet — confirm with Diéssou) | Must Have from Excel |
| Reports: Service Sales, Product Sales, Staff Performance, Daily Summary, Operator Activity, Detailed Line Item, Custom Reports | Owner needs these |
| Staff: Profiles, Roles, Permission Groups, Schedules, Time Clock, Commission Settings + Tracking | Day-1 ops + payroll |
| Services Setup: Categories, Pricing (incl. Staff-Level), Duration, Processing Time, Add-Ons, Modifiers | Catalog must be configurable |
| Products & Inventory: Catalog, Tracking, Low Stock Alerts, Purchase Orders, Suppliers, Returns | Retail side |
| Forms & Charts: Intake, Consent, Photo Upload (basic), Digital Signatures (real e-sig, not stub) | Compliance + onboarding |
| Settings: Location, Hours, Tax, Calendar, Notifications, Social Media, Online Booking | Tenant config |
| **iPad Kiosk Check-In** (real, with QR scan + phone fallback + photo confirm) | Core in-salon hardware |
| Global search palette (Cmd+K) | Staff productivity |
| Stripe Terminal integration (card reader) | Payments hardware |
| Receipt printer + Barcode scanner | Boulevard parity |
| Caller ID (client info on inbound call) | Boulevard Must-Have |

### Client booking web (Day 1)

| Feature | Why must |
|---|---|
| Photo-first gallery on `booking.jolieden.com` | The marketing pitch |
| Style detail with modifiers (length comparison photos, color swatch photos, size comparison) | Replaces Boulevard widget |
| Stylist profiles (`/book/stylist/[slug]`) + "Meet our Stylists" directory | Diéssou Must-Have |
| Service selection + Staff selection + Real-Time Availability + Precision Scheduling | Boulevard parity |
| Booking deposits + Card on File requirement | Diéssou Must-Have, configurable |
| Online Rescheduling (toggleable) + Online Waitlist | Diéssou Must-Have |
| Apple Pay (Day 1 per Diéssou) | Must Have |
| Klarna / Afterpay (toggleable) | Optional |
| Google Reviews strip (pulled from Google Business Profile API) | Diéssou Must-Have |
| Cutover from Boulevard widget on Shopify site | The actual launch moment |

### Backend (Day 1)

| Component | Notes |
|---|---|
| Postgres schema + migrations | Per ARCHITECTURE.md §3 |
| Supabase project + RLS policies | Single-tenant for Frederick Douglass first |
| Auth: magic link (clients), magic link + 2FA (staff) | Per ARCHITECTURE.md §6 |
| Boulevard CSV → Jolieden DB migration script | Maps client IDs, dedupes by phone |
| Stripe Connect onboarding for each stylist | Per ARCHITECTURE.md §8.2 |
| Twilio Conversations setup + 10DLC registration | 4-6 wk pre-launch |
| Cloudflare R2 buckets for photos | Signed-URL access |
| Sentry + Vercel Analytics + structured logs | Observability |

### Out of scope for Phase 1

- AI Concierge (Phase 2)
- Mobile apps `/me` `/pro` (Phase 2)
- Multi-location (Phase 3)
- Hair journey timeline (Phase 3)
- Wishlist (Phase 3)
- **Rewards / loyalty** — Diéssou marked "Don't Need" (uses Stripe discounts). Prototype contains a Rewards UI for stakeholder demos; **production v1 does NOT include it.** Schema includes `clients.lifetime_spend_cents` for tier hints in case Diéssou reverses, but no surfaces are built.
- **Memberships** — Same. Prototype has a Membership screen for demo; production v1 ships without it.
- **Referral program** — Diéssou marked "Optional." **Production v1 does NOT include it.** Database has `referral_links` + `referral_redemptions` tables so we can add it without a migration later, but no UI is built.
- Marketing campaigns / email blast (Don't Need — uses third-party tools)
- Try-on / AR (P+1)
- Community feature (P+1)

**The Excel coverage table in [README.md](../README.md) marks the prototype-built UI for these as `R` (real implementation).** That's about the **prototype** showing the surface for stakeholder buy-in, not the production scope. If Diéssou reverses on any of these, **add an extra 2–3 weeks per surface** to wire it up; they're not in the Phase 1 estimate.

---

## Phase 2 — AI + mobile (12 weeks)

Goal: **AI Concierge handles >90% of inbound SMS without staff. Mobile apps in TestFlight.**

### AI Concierge (full)

| Feature | Reference |
|---|---|
| Anthropic Claude integration with tool calling | [AI_CONCIERGE.md](./AI_CONCIERGE.md) §3 |
| 5 tools: `read_availability`, `commit_booking`, `lookup_client_history`, `search_knowledge_base`, `escalate` | AI_CONCIERGE.md §3.2 |
| RAG over salon docs (hours, prices, policies, prep) via pgvector | AI_CONCIERGE.md §4 |
| Confidence-based escalation | AI_CONCIERGE.md §5 |
| Sentiment classifier (complaint routing) | AI_CONCIERGE.md §5.3 |
| Human Takeover Dashboard in operator Messages | Already designed in prototype |
| Conversation Analytics (`/messages/analytics`) | Already designed in prototype |
| Personalized Responses (uses client history tool) | AI Must-Have |
| FAQ Knowledge Base | RAG corpus |
| Multi-Language: English + French (internal staff channel) | French is for braiders per Diéssou |
| Smart Escalation rules engine | AI_CONCIERGE.md §5 |
| Audit log of every AI tool call | Compliance + tuning |

### Client mobile app (`/me`) MVP

| Feature | Notes |
|---|---|
| React Native + Expo skeleton with magic-link auth | EAS Build → TestFlight |
| Home: greeting, upcoming visit with QR check-in CTA, rewards summary card, photo-row sections | Reuse web designs |
| Browse: search + category filter + photo grid | Mobile-native gestures |
| Bookings: list of upcoming + past | |
| Booking detail (smart router by status) | Mirrors operator detail |
| Journey timeline | Pulls from `journey_entries` |
| Profile: contact, prefs, payment, language toggle | Same shape as prototype |
| QR check-in screen with real QR generation | Wire to kiosk scanner |
| Client Assistance FAB → push to floor managers | Push via Expo Notifications |
| Report a service issue (Oopsie) — 3-step flow with photo upload | Real R2 uploads |
| Birthday banner (when applicable) | Pulled from `clients.birthday_month` |
| Personalized care follow-ups | Computed from last visit category |
| Push notifications: reminder, your-stylist-is-ready, AI-replied, birthday | Expo Notifications |
| Receipt screen (digital receipts only) | Diéssou Must-Have |

### Stylist mobile app (`/pro`) MVP

| Feature | Notes |
|---|---|
| Skeleton with magic-link + role check | RN + Expo |
| Today: daily + weekly goal cards, next-up appointment, AI escalations | Pulls live from Postgres |
| Schedule: today/tomorrow/week view | |
| Schedule detail: appointment + status transitions | |
| Inbox: AI takeover queue with transcripts | Real Twilio handoff |
| Clients: roster filtered to own clients | |
| Profile: bio, photo, schedule, earnings dashboard | |
| Capture flow: before/after photos → R2 + journey entry | Native camera |
| Quick notes during service | Persist to `service_notes_md` |
| Push: AI escalations, daily reminders | |

### What ships at Phase 2 launch

- AI handles 70-90% of SMS volume on Day 1 of Phase 2 (rises after tuning)
- Both apps in TestFlight; public Play / App Store release at Phase 2 + 4 weeks (Apple review)
- Operator app gets the "AI is replying" pulse + inline booking cards in Messages (already designed)
- Calendar gets the 🤖 AI badge on AI-booked appointments

---

## Phase 3 — Multi-location + premium (12 weeks)

Goal: **Atlanta and Houston pop-ups onboard. Premium features land.**

### Multi-location

| Feature | Notes |
|---|---|
| Locations CRUD in operator app | Already designed |
| LocationSwitcher in operator TopNav | Already designed |
| Per-location RLS policies (already in schema) | Just exercising them |
| Centralized Reporting ("All locations" mode) | Roll-up queries |
| Per-location revenue tracking | Daily / weekly goal already segments |
| Atlanta + Houston onboarding (data, staff, hardware) | ~2 weeks per location |

### Premium client features

| Feature | Notes |
|---|---|
| Wishlist (save styles, dedicated screen) | Already designed |
| Hair Journey Timeline (real, with before/after photos populated by stylist app) | Visual history |
| Next-visit reminders (personalized cadence) | Already designed |
| Auto follow-up SMS (Day-1 + Day-3 + Day-7 after visit, customized to service) | Care tips, retention |
| Membership tiers display (Bronze/Silver/Gold/Platinum) — read-only if Diéssou keeps "Don't Need membership plans" | Already designed |
| Refer-a-friend program with Stripe coupon integration | If Diéssou turns it on |

### Premium staff features

| Feature | Notes |
|---|---|
| Real-time Floor view | Already designed |
| Daily + Weekly Goals tracking | Already shipped in prototype |
| Employee of the Month (auto-computed from weekly leaderboards) | Already designed |
| Live Revenue Tracker | Already shipped |
| Staff Status Board with break timer | Diéssou note: "When employee on break we should have a timer to let them know when time is almost up" |
| Repair queue (Oopsie tracking — operator side) | Already designed |
| Photo Markup tool for capture flow | Per Diéssou's Must-Have |
| Client Assistance Alerts (real push routing) | Already wired in prototype |

### Birthday system (full)

| Feature | Notes |
|---|---|
| Auto Birthday Detection | Already designed |
| Birthday Alert to Staff (notify before client arrives) | New |
| Birthday Message Automation (auto-text on birthday) | New |
| Celebration UI on `/me` home (banner + gifts list) | Already designed |
| Birthday flag on appointment + auto-applied comp Wash & Blow | Already designed |
| Stylist app: pre-arrival alert | New |

### Out of scope for Phase 3

- Try-on / AR (P+1)
- Snapchat-style camera measurement (P+1)
- Community feature (P+1)
- Boulevard Duo lease replacement (depends on Stripe Terminal vendor choice)
- White-label for franchising (P+1)
- Whole-language Wolof support (Phase 4)

---

## P+1 — Nice-to-have backlog

- Style try-on (real AR via ModiFace / Banuba / custom Stable Diffusion)
- Snapchat-style camera for face/hair measurement
- Community feature (clients share results)
- Wolof language support
- Franchise-ready white-label (separate sub-brands per franchisee)
- Custom integrations (per-customer specifics)
- Multi-Location centralized reporting in BI tool (Metabase, Sigma)
- Birthday Tier System (Diéssou marked Don't Need — leave as future option)

---

## Team & ownership split

The 2-engineer estimate below assumes this split. **Confirm with the dev shop / Diéssou before kickoff.**

| Role | Owns | Headcount | Reports to |
|---|---|---|---|
| **Senior full-stack lead** | Architecture decisions, data model + migrations, Postgres RPCs, RLS policies, Stripe Connect integration, AI Concierge prompt + tools, infra (Vercel + Supabase + Cloudflare R2), CI/CD | 1 FTE | Diéssou (functionally) |
| **Mid full-stack** | Next.js operator app + booking web, Twilio plumbing, Boulevard importer, Stripe Terminal integration, basic Realtime subscriptions, integration tests | 1 FTE | Lead |
| **Mobile engineer (Phase 2)** | React Native + Expo apps (`/me` + `/pro`), shared package boundaries, push notifications, native camera/AR, App Store submissions | 1 FTE starting Phase 2 wk 1 | Lead |
| **Designer** | Figma source-of-truth for any UI not already in prototype, design tokens audit, `/owner/knowledge` editor UX, accessibility review | 0.5 FTE Phase 1; 0.25 FTE Phase 2+ | Diéssou |
| **PM / launch lead** | Sprint planning, 10DLC + Apple/Play registration, Boulevard migration scheduling, Diéssou stakeholder cadence, QA coordination | 0.5 FTE | Diéssou |
| **AI specialist (advisory)** | Eval suite authoring + tuning, knowledge base structuring with Diéssou, prompt iterations, multi-language quality | 0.25 FTE Phase 2 onward | Lead |

**Total Phase 1:** 2 FTE + 0.5 design + 0.5 PM = ~3 FTE-weeks per week.
**Total Phase 2:** 3 FTE + 0.25 design + 0.5 PM + 0.25 AI = ~4 FTE-weeks per week.
**Total Phase 3:** Same as Phase 2 plus rotating onboarding support.

### What the dev shop should NOT staff

- Backend infra ops — Supabase + Vercel are managed; no DevOps role until 10k+ MAU.
- Separate iOS / Android engineers — RN + Expo means one mobile eng covers both.
- Separate QA engineer in Phase 1 — leads + mids self-test via the test pyramid (§12.5 in ARCHITECTURE.md). Add a dedicated QA in Phase 3.

## Budget anchors

Internal — managed by AmbittMedia. Not in this dev brief.

Ongoing infra is roughly $3k/yr per location for hosting + services (Twilio scales with SMS volume); this is a Client pass-through per the engagement letter, not Service Provider revenue.

---

## Decision points before sign-off (pasted from ARCHITECTURE.md §14)

These need Diéssou's input before estimating:

1. Mobile platform commitment: React Native + Expo confirmed?
2. Boulevard migration: hard cutover vs parallel run?
3. AI behavior: can it charge a card autonomously?
4. Multi-language at launch: French internal — Day 1 or Phase 2?
5. Photo data ownership: salon retains marketing rights?
6. Tip splitting: 100% to stylist?
7. Membership program: permanently dropped?
8. Loyalty/Rewards points: permanently dropped?
9. Referral program: on or off?
10. Hardware vendor: Stripe Terminal — replace Boulevard Duo lease?
11. 10DLC brand registration: when does Diéssou file?
12. App Store review window: plan first submission 4 wk before launch?
13. Liability insurance: AI-booking errors covered by current E&O?

---

*End of MVP scope. Final pre-handoff doc: [AI_CONCIERGE.md](./AI_CONCIERGE.md) — the full spec for the headline feature.*
