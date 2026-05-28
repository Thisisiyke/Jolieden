# Jolieden's Beauty Bar — clickable prototype

Replacement for the Boulevard booking widget on [joliedensbeautybar.com](https://www.joliedensbeautybar.com/) plus two mobile companion apps — one for clients, one for stylists. All four surfaces live in this single Next.js repo and share the same brand tokens, persona registry, and Zustand store, so a booking created in one surface shows up live in the others.

> **Demo it:** start the dev server with `npm run dev` and open [`/demo`](http://localhost:3000/demo) — the tabbed walkthrough hub is the prototype's table of contents.

## Surfaces

| Prefix       | Surface                                    | Form factor              |
|--------------|--------------------------------------------|--------------------------|
| `/` (root)   | Operator / admin web app (pre-existing)    | Desktop                  |
| `/book`      | Client booking web (replaces Boulevard)    | Desktop + mobile web     |
| `/me`        | Client mobile companion app                | Mobile (locked viewport) |
| `/pro`       | Stylist mobile app                         | Mobile (locked viewport) |
| `/demo`      | Walk-through hub linking into all of them  | Desktop                  |

On `/demo`, `/book`, `/me`, and `/pro` the operator `TopNav` is suppressed and each surface renders its own chrome.

## Running locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000/demo> — the demo hub. Click any tile to walk a persona through their surface.

Useful checks before committing:

```bash
npx tsc --noEmit       # type check
npm run build          # production build
```

## Routes (the important ones)

**Demo hub**
- `/demo` — tabbed entry point. 4 tabs × per-persona scenario tiles.

**Operator app** (pre-existing, only minor wiring this round)
- `/` — Front Desk kanban
- `/calendar` — staff schedule
- `/clients` — client database
- `/messages` — SMS inbox (AI threads land here)
- `/sales`, `/marketing`, `/manage`, `/owner`, `/reports`, `/settings`, `/timeclock` — all built

**Client booking web**
- `/book` — photo-first gallery (filters by `?category=`, hot-start via `?as=<clientSlug>`)
- `/book/style/[styleSlug]` — style detail with modifier picker (length, parting, color, ends, add-ons)
- `/book/checkout` — stylist + time + confirm. Submit creates the appointment in store + routes to `/me/.../bookings/[newId]`

**Client mobile app**
- `/me/[clientSlug]` — persona-aware home (birthday banner for Naomi, Rebook-Usual for Aaliyah, Welcome wizard for Imani)
- `/me/[clientSlug]/browse` — placeholder (full gallery in P8+)
- `/me/[clientSlug]/bookings` — Upcoming + Past lists
- `/me/[clientSlug]/bookings/[appointmentId]` — booking detail smart router (CTAs advance the status)
- `/me/[clientSlug]/journey` — visual timeline of past looks (real photos for Aaliyah)
- `/me/[clientSlug]/profile` — placeholder

**Stylist mobile app**
- `/pro/[stylistSlug]` — Today tab. Owner sees floor pulse; stylists see next-up + today schedule + AI inbox preview
- `/pro/[stylistSlug]/schedule` — day-grouped appointment list
- `/pro/[stylistSlug]/schedule/[appointmentId]` — booking detail (stylist view of the smart router)
- `/pro/[stylistSlug]/clients` — placeholder
- `/pro/[stylistSlug]/inbox` — AI takeover queue with transcripts + Take-over CTA
- `/pro/[stylistSlug]/profile` — placeholder

**API**
- `POST /api/comments` / `GET /api/comments?page=<path>` — backs the stakeholder feedback widget via GitHub Issues.

## Cast (the named personas)

These are the people the prototype is built around. Browse [`src/lib/personas.ts`](src/lib/personas.ts) for slugs and resolvers.

| Persona             | Role                                   | Slug          | Demoes                                      |
|----------------------|----------------------------------------|---------------|----------------------------------------------|
| **Diéssou**         | Owner / Founder                        | `diessou`     | Owner overview in `/pro`; operator-app demos |
| **Oumou D.**        | Senior Braider (knotless, boho)        | `oumou-d`     | Braids gallery anchor; Aaliyah's usual       |
| **Fatou Ciss**      | Natural Hair Specialist                | `fatou-c`     | Silk press category; Naomi's birthday appt   |
| **Dieynaba D.**     | Color Specialist                       | `dieynaba-d`  | Color category; Imani's booked balayage      |
| **Imani Webb**      | Cold-start client                      | `imani-w`     | First-time booking flow; empty home          |
| **Aaliyah Jackson** | Loyalist (rebooks every 8 wks)         | `aaliyah-j`   | Rebook-usual shortcut; full hair journey     |
| **Naomi Brooks**    | Birthday-demo client (Apr 18)          | `naomi-b`     | Birthday hero + comp Wash &amp; Blow demo  |

> Distinct from **Naomi K.** — a stylist in the legacy operator fixtures. The two are not the same person.

## Stakeholder feedback widget

A draggable comment chip sits bottom-right on every page (mounted in `<Providers>` in `src/app/layout.tsx`). It POSTs to `/api/comments`, which creates a GitHub Issue labeled `comment` + `page:<route>`. Closing the issue on GitHub makes it disappear from the in-app panel automatically (the widget filters by `state=open`).

### One-time setup

1. Push this repo to GitHub.
2. **GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens.** Create a new token with:
   - **Repository access:** Only select repositories → this repo
   - **Repository permissions:** Issues → Read and write
3. Add env vars at Vercel:
   - `GITHUB_TOKEN` — the PAT (Production + Preview)
   - `GITHUB_REPO` (optional) — `owner/repo` override; defaults to `Thisisiyke/Jolieden`
4. Redeploy.

When `GITHUB_TOKEN` is unset (local dev), the widget gracefully shows the error banner and the rest of the app keeps working.

## Deploy

Auto-deploys on push to `main` via Vercel:

- **Main** → production URL
- **Feature branch** → preview URL per push

Run `vercel link` once locally if you want to push previews from the CLI. Otherwise pushing to GitHub is enough.

## Architecture notes (the important ones)

- **One Next.js app, four surfaces** — route prefixes (`/book`, `/me`, `/pro`) own their chrome; the operator `TopNav` is hidden on those paths.
- **Zustand store** (`src/lib/store.ts`) hydrates from `data.ts` fixtures, persists to localStorage, and is the source of truth for live cross-surface state (cart, appointment status changes, new bookings). Use `useShallow` on collection selectors.
- **Persona registry** (`src/lib/personas.ts`) is the single resolver layer between URL params and entities. Pages never hardcode persona refs in JSX — they `resolveClient(useParams().slug)`.
- **Service catalog** (`src/lib/catalog.ts`) mirrors the Boulevard widget's modifier structure (length, parting, color, ends, add-ons) so anything the salon offers can be modeled. Pricing recomputes via `computePricing()`.
- **Gallery** (`src/lib/gallery.ts`) — 14 real Jolieden photos pulled from the Shopify CDN populate every Braids and Natural style; categories the salon doesn't currently advertise (Silk Press, Color, Cuts, Treatments) fall back to category-palette gradients.
- **No auth, no tests** — this is a clickable prototype, not a production app.

## Phases shipped

- **P1** Foundation: brand tokens, types, catalog, Zustand store, persona registry, comments widget, CLAUDE.md.
- **P2** Demo hub at `/demo` + stubs for `/book`, `/me`, `/pro`.
- **P3** Per-surface scaffolding: `/book` salon header, `/me` mobile shell + 5 tabs, `/pro` mobile shell + 5 tabs.
- **P4** Appointment lifecycle smart router (`BookingDetailCard`).
- **P5** Photo-first booking flow end-to-end at `/book`.
- **P6** Real Jolieden photos + Aaliyah's hair journey timeline.
- **P7** AI takeover queue in `/pro`, birthday celebration UI for Naomi, persona-aware `/me` home, real `/pro` Today tab.
- **P8** README + Vercel deploy.
- **P9** iPhone-frame polish, Profile + Browse + Clients tabs filled.
- **P10** AI SMS Concierge auto-play simulator at `/demo/sms`.
- **P11** Rewards screen + enhanced birthday hero with gift tracking.
- **P12** QR check-in screen + visual home rebuild (Sephora/Ulta carousel + photo rows + stylist spotlight).
- **P13** Mobile-app completeness: wishlist + gift cards + account credit + membership + referrals + intake forms.
- **P14** Booking web upgrades: stylist profile pages, online waitlist, payment options (Apple Pay / Klarna / Afterpay).
- **P15** Stylist app additions: before/after capture, daily goals widget, Employee of the Month.
- **P16** Operator additions: AI conversation analytics, live floor view, iPad kiosk standalone route.

## Excel feature coverage

Audit of every feature listed in the original Excel assessment. **R** = real implementation, **S** = visual stub or thin demo, **N/A** = out-of-scope for the prototype (white-label config, hardware integrations, etc.).

### Boulevard features (operator core)

| Section | Feature | Status | Location |
|---|---|---|---|
| Front Desk | Kanban (Unconfirmed → Confirmed → Walk-In → Arrived → Active → Completed) | R | `/` |
| Front Desk | Client check-in | R | iPad `/kiosk` + `/me/.../checkin` |
| Front Desk | Walk-in management | R | `/` + `/calendar` |
| Front Desk | Waitlist management | R | `/book/waitlist` (client) + operator waitlist drawer |
| Front Desk | Global search | S | TopNav search icon |
| Calendar | Day/week/month views | R | `/calendar` |
| Calendar | Drag & drop appointments | R | `/calendar` |
| Calendar | Staff filter | R | `/calendar` |
| Calendar | New appointment | R | `/calendar` drawer |
| Calendar | Time blocks | R | `/calendar` |
| Calendar | Rescheduling | R | `/calendar` drag |
| Calendar | Cancellations | R | `/calendar` drawer |
| Online booking | Self-booking | R | `/book` flow |
| Online booking | Service selection | R | `/book/style/[slug]` |
| Online booking | Staff selection | R | `/book/checkout` + `/book/stylist/[slug]` |
| Online booking | Online waitlist | R | `/book/waitlist` |
| Online booking | Booking deposits | R | `/book/checkout` payment section |
| Online booking | Card on file | R | `/book/checkout` payment options |
| Messages | SMS inbox | R | `/messages` |
| Messages | Appointment reminders | S | mocked in `/messages` |
| Messages | Rating requests | R | `/me/.../bookings/[id]` completed state |
| Sales | Orders list | R | `/sales/orders` |
| Sales | Payments | R | `/sales/transactions` |
| Sales | Gift card sales/redemption | R | `/sales/gift-cards` + `/me/.../gift-cards` |
| Sales | Memberships | R | `/sales/memberships` + `/me/.../membership` |
| Sales | Refunds, voiding | R | `/sales/order/[uuid]` |
| Clients | Database, search, profile | R | `/clients` + `/clients/[id]` |
| Clients | Tags, accommodations, alerts | R | `/clients/[id]` |
| Clients | Merge profiles | R | `/clients` MergeClientsDrawer |
| Clients | Marketing opt-in tracking | R | client profile |
| Reports | Service sales, staff perf | R | `/reports` + `/reports/beta` |
| Marketing | Email campaigns | R | `/marketing/blast` |
| Marketing | Text marketing | R | `/marketing/blast` |
| Marketing | Audiences | R | `/clients` (Audiences panel) |
| Marketing | Loyalty program | R | `/me/.../rewards` + tiers |
| Marketing | Referral program | R | `/me/.../referrals` |
| Staff | Profiles, roles, permissions | R | `/owner/staff`, `/owner/staff-roles`, `/owner/permission-groups` |
| Staff | Time clock | R | `/timeclock` |
| Staff | Commission tracking | R | `/pro/.../profile` earnings |
| Services | Categories, pricing, duration | R | `/owner/services` + `src/lib/catalog.ts` |
| Services | Add-ons, modifiers | R | catalog + booking flow |
| Products | Catalog, inventory, purchase orders | R | `/manage/products`, `/manage/purchase-orders`, `/owner/suppliers` |
| Forms | Intake forms | R | `/me/.../intake` + `/owner/forms-and-charts` |
| Settings | Location, hours, tax, notifications | R | `/manage/details`, `/manage/payment-processing`, `/settings/notifications` |
| Hardware | iPad kiosk | R | `/kiosk` |
| Hardware | Professional mobile app | R | `/pro/[slug]` |

### Custom app features (the AI-first differentiator)

| Section | Feature | Status | Location |
|---|---|---|---|
| AI Concierge | Auto-responses, FAQ | R | `/demo/sms` simulator + `/pro/.../inbox` |
| AI Concierge | Booking via SMS | R | scenario 1 in `/demo/sms` |
| AI Concierge | Smart escalation | R | scenario 3 in `/demo/sms` + `/pro/.../inbox` |
| AI Concierge | Conversation analytics | R | `/messages/analytics` |
| AI Concierge | Personalized responses | S | implied in simulator |
| AI Concierge | Multi-language | S | language row in `/me/.../profile` |
| Visual booking | Photo-based style selection | R | `/book` gallery with real Jolieden photos |
| Visual booking | Color swatch | R | `/book/style/[slug]` color modifier |
| Visual booking | Stylist profiles with photos | R | `/book/stylist/[slug]` |
| Visual booking | Before/after gallery | R | `/me/.../journey` (real photos) + stylist profile work |
| Visual booking | Mobile-first design | R | `/me` iPhone-framed |
| Visual booking | Instant price updates | R | `/book/style/[slug]` modifier picker |
| Birthday | Auto detection | R | `daysUntilBirthday()` helper |
| Birthday | Staff alert | R | `/pro/.../schedule/[id]` birthday badge |
| Birthday | Tier system | R | gift list adapts by client tier |
| Birthday | Gift tracking | R | birthday hero on `/me/naomi-b` |
| Birthday | Message automation | R | scenario 4 in `/demo/sms` |
| Birthday | Celebration UI | R | gold-soft hero + booking detail banner |
| Check-in | iPad self check-in | R | `/kiosk` |
| Check-in | Photo confirmation | S | placeholder in `/kiosk` scan flow |
| Check-in | Service confirmation | R | `/me/.../checkin` |
| Check-in | Wait time display | R | `/manage/floor` |
| Hair journey | Timeline | R | `/me/.../journey` (Aaliyah seeded with 6 entries) |
| Hair journey | Before/after capture | R | `/pro/.../capture/[id]` |
| Hair journey | Wishlist | R | `/me/.../wishlist` (Aaliyah seeded with 3) |
| Hair journey | Auto follow-ups (care tips) | S | care-tip card on `/me` home |
| Hair journey | Next visit reminders | S | implied via SMS reminder |
| Hair journey | Client app/portal | R | `/me/[clientSlug]` |
| Manager ops | Real-time floor view | R | `/manage/floor` |
| Manager ops | Live revenue tracker | R | `/pro/diessou` Today |
| Manager ops | Staff status board | R | `/manage/floor` station grid |
| Manager ops | Daily goals tracking | R | `/pro/[slug]` (personal) + `/pro/diessou` (salon) |
| Staff tools | Stylist mobile app | R | `/pro/[slug]` |
| Staff tools | Daily schedule widget | R | `/pro/[slug]/schedule` |
| Staff tools | Quick notes | R | `BookingDetailCard` active state |
| Staff tools | Commission dashboard | R | `/pro/[slug]/profile` earnings |
| Staff tools | Before/after camera | R | `/pro/[slug]/capture/[id]` |
| Staff tools | Employee of the Month | R | `/pro/diessou` Today widget |
| Payment | Apple Pay / Google Pay | R | `/book/checkout` payment options |
| Payment | Afterpay / Klarna | R | `/book/checkout` payment options |
| Payment | Tipping suggestions | R | `BookingDetailCard` completed state (rating widget) |
| Payment | Digital receipts | S | implied via SMS scenario |
| White-label | Custom branding | R | the prototype itself is the example |
| White-label | Custom domain | N/A | Vercel deploy step |
| White-label | Multi-location | N/A | out of scope |
| White-label | Centralized reporting | N/A | out of scope |
| White-label | Custom integrations | N/A | out of scope |

See [CLAUDE.md](CLAUDE.md) for the working brief that future agents (and you) read to pick up the project cleanly.
