@AGENTS.md

# Jolieden's Beauty Bar — working brief

A clickable prototype + spec for **Jolieden's Beauty Bar** (full-service Black hair salon, joliedensbeautybar.com). Replaces the Boulevard booking widget on the website and adds mobile companion apps for clients and stylists.

## 📚 If you're picking up this project for production: start here

This repo is the UI prototype. The production build references three engineering specs:

1. **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — full technical architecture: tech stack, data model + ERD + DDL, API surface, auth + multi-tenancy, real-time, integrations, mobile platform decision, infrastructure + cost, security + compliance, NFRs, 7-phase build plan.
2. **[docs/AI_CONCIERGE.md](docs/AI_CONCIERGE.md)** — deep-dive on the headline AI SMS feature: system prompt, full tool schemas with examples, RAG knowledge-base structure, escalation logic, Twilio plumbing, worked conversation trace, cost monitoring, testing strategy.
3. **[docs/MVP_SCOPE.md](docs/MVP_SCOPE.md)** — phasing: Phase 1 (Day-1 cutover, 16 wk) vs Phase 2 (AI + mobile, 12 wk) vs Phase 3 (multi-location + premium, 12 wk), budget anchors, open decisions for Diéssou.

[README.md](README.md) has the full Excel feature coverage audit (every Boulevard + Custom App feature mapped to its prototype route + status).

## What surfaces live here

Single Next.js repo. Routes prefixed by audience:

| Prefix       | Surface                                | Form factor           |
|--------------|----------------------------------------|------------------------|
| `/` (root)   | Operator / admin web app (existing)    | Desktop                |
| `/book`      | Client booking web app (replaces Boulevard) | Desktop + mobile web |
| `/me`        | Client mobile companion app            | Mobile (locked vp)     |
| `/pro`       | Stylist mobile app                     | Mobile (locked vp)     |

Operator app already existed when we started; new surfaces extend the existing types, fixtures, and brand tokens — they do not rewrite them.

## The flowing object

**`Appointment`** moves through the salon. Status lifecycle (carried verbatim from Boulevard so the operator's existing Front Desk kanban stays consistent):

```
unconfirmed → confirmed → arrived → active → completed
                                        ↘ cancelled / noshow (terminal)
```

`walkin` is also a status (Boulevard convention) — used when an operator creates an appointment for someone already on the floor. Status type lives in `src/lib/data.ts`.

## The cast (canon — read `src/lib/personas.ts` for slugs)

| Persona            | Role                                  | Slug          | Why they exist                                  |
|---------------------|---------------------------------------|----------------|--------------------------------------------------|
| **Diéssou**        | Owner / Founder                       | `diessou`     | "You" in the operator-app + stylist-app demos    |
| **Oumou D.**       | Senior Braider (knotless, boho)       | `oumou-d`     | Anchors the Braids category                       |
| **Fatou Ciss**     | Natural Hair Specialist (silk press)  | `fatou-c`     | Anchors Silk Press + Natural categories           |
| **Dieynaba D.**    | Color Specialist                      | `dieynaba-d`  | Anchors Color category                            |
| **Imani Webb**     | Cold-start client (first-time on the app) | `imani-w` | Demos zero-state booking flow & onboarding       |
| **Aaliyah Jackson**| Hot-start loyalist (rebooks every 8wks) | `aaliyah-j` | Demos rebook-usual + hair journey timeline       |
| **Naomi Brooks**   | Hot-start, birthday in 4 days (Apr 18) | `naomi-b`   | Demos birthday celebration system end-to-end     |

> **Naomi K.** is also in the operator fixtures — she's a stylist, not the same person as Naomi Brooks. Don't confuse the two.

## "No typing" rule

The prototype is a guided tour. Every form input is pre-filled with realistic dummy values. The viewer's only job is to click the obvious primary CTA on each screen to advance state. The shipped product's CTAs ARE the next-step controls — never add a separate "Next" UI.

- Booking flow: tapping a gallery photo pre-fills the cart with that style's modifiers; tapping "Confirm" advances the Appointment status.
- Onboarding wizards: every field starts populated; the primary button just advances.
- Status transitions in `/booking/[id]` happen via the CTAs that the operator/client would naturally tap.

## Photo-first booking

Headline differentiator versus the Boulevard widget. Clients browse a **gallery of finished looks** (`/book` landing), tap one, see what it includes, and book — instead of filling out the dropdown-heavy Boulevard form (Length / Parting / Hair Brand / Color / Ends / Add-Ons).

- Gallery entries live in `src/lib/gallery.ts` (`Style[]`). Each one maps to a `CatalogService` slug + preselected modifier choices.
- When a Style is tapped, the booking flow opens with everything pre-filled. The client adjusts if needed, then confirms.

## AI SMS Concierge (the differentiator)

**SMS only.** Clients text the Jolieden number from their phone's native Messages app — the AI replies via SMS. We do NOT host AI chat inside `/me` or `/book`.

Where it surfaces in the prototype:
- **Operator app** — Messages area shows AI-handled threads + conversation analytics dashboard.
- **Stylist app** (`/pro`) — Inbox tab includes a "Human takeover" queue: conversations the AI escalated for stylist response.
- **Client surfaces** — never. Clients don't see the AI in-app. The salon's SMS number is the surface.

## Brand tokens

Lives in `src/app/globals.css` as Tailwind v4 `@theme inline` tokens. Existing palette (do not rewrite):

- `--brand` = `#431926` (deep burgundy — primary CTAs)
- `--brand-700`, `--brand-500`, `--brand-100`, `--brand-50` (mauve scale)
- `--ink-50`…`--ink-900` (warm-leaning grayscale)
- `--status-pending|confirmed|walkin|arrived|active|completed` (appointment kanban)

Added for the new surfaces:
- `--paper`, `--paper-mute` (warm cream backgrounds for the gallery & cards)
- `--gold`, `--gold-soft` (champagne accent for VIP / celebration moments)
- `--font-mono` (for IDs, money, timestamps, eyebrow tags)

**Usage rules:**
- Use brand class names (`bg-brand`, `text-ink-700`, `bg-status-confirmed`). NEVER raw Tailwind colors like `text-blue-500`.
- `--gold` is for VIP markers, the birthday celebration overlay, and the JOLIEDEN wordmark. Don't sprinkle.
- `--brand` is the primary action color. Reserve for the dominant CTA on a screen.

## State management

Zustand 5 + persist (`src/lib/store.ts`). The store hydrates from existing fixtures (`APPOINTMENTS`, `CLIENTS`, `STAFF` from `src/lib/data.ts`) plus `JOURNEY` (gallery). 

**Read pattern:** Always wrap collection selectors in `useShallow` from `zustand/react/shallow` — selecting `Object.values(state.x)` directly causes `getServerSnapshot should be cached` infinite loops. Per-id selectors don't need `useShallow`.

Convenience selectors already exported: `useAllAppointments`, `useAppointment(id)`, `useAllClients`, `useClientBySlug`, `useAllStylists`, `useJourneyForClient`, `useCart`, `useActivePersona`.

**Action surface:** `setAppointmentStatus`, `addAppointment`, `upsertClient`, `addJourneyEntry`, cart actions (`addCartLine`, `setCartStylist`, `setCartTime`, `resetCart`).

**Operator app integration:** existing operator pages still read directly from `data.ts` fixtures. Hot paths that need live state from new surfaces (Calendar, Front Desk, Clients) should switch to `useAllAppointments()` etc. when they need to reflect bookings made in `/book`.

## Persona registry

`src/lib/personas.ts` is the **single resolver layer** between URL params and concrete entities. Pages read slug from `useParams()` and call `resolveClient(slug)` / `resolveStylist(slug)`.

- NEVER hardcode persona imports (`aaliyahJackson.id`) into JSX.
- URLs are built dynamically from `client.slug` / `stylist.slug` so a single `[client]` dynamic route serves every persona.
- `CAST` const exports the canonical owner / flagship-stylist / cast-client slugs — the landing page reads from this to surface entry tiles.

## Demo data anchor

`TODAY = "2026-04-14"` in `src/lib/data.ts`. The operator fixtures (Front Desk kanban, Calendar) are anchored here. New seed data should also reference this constant — don't sprinkle real "today" dates.

## Comments widget (stakeholder feedback loop)

Draggable card mounted in `<Providers>` (`src/components/Providers.tsx`), visible on every page. Reviewers (Diéssou + team) click it to leave per-screen feedback.

- **Backend:** GitHub Issues. Each comment = 1 Issue with labels `comment` + `page:<route-with-underscores>`. Close on GitHub → it disappears from the widget (filtered by `state=open`).
- **Required env vars:**
  - `GITHUB_TOKEN` — fine-grained PAT with **Issues: Read+Write** on the target repo. Add to Vercel (Production + Preview).
  - `GITHUB_REPO` — optional override, defaults to `Thisisiyke/Jolieden`.
- **Setup workflow** (one-time per deploy):
  1. GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens
  2. Repository access: "Only select repositories" → this repo
  3. Repository permissions → Issues: Read and write
  4. Generate token, add to Vercel env vars, redeploy

## File map

```
src/
├── app/
│   ├── api/comments/route.ts   GitHub Issues bridge
│   ├── (operator routes)       calendar/, clients/, manage/, marketing/,
│   │                            messages/, owner/, reports/, sales/,
│   │                            settings/, timeclock/  (existing)
│   ├── book/                   client booking web (to be built — P3+)
│   ├── me/                     client mobile app (to be built — P3+)
│   ├── pro/                    stylist mobile app (to be built — P3+)
│   ├── globals.css             brand tokens
│   └── layout.tsx              root layout + <Providers>
├── components/
│   ├── Providers.tsx           client root wrapper + mounts Comments widget
│   ├── CommentsWidget.tsx      draggable feedback card
│   └── (operator components — existing)
└── lib/
    ├── data.ts                 STAFF, CLIENTS, APPOINTMENTS fixtures + types
    ├── catalog.ts              ServiceCategory, CatalogService, Modifier types + seed
    ├── gallery.ts              Style type (photo gallery entries; seeded in P6)
    ├── journey.ts              HairJourneyEntry type (seeded in P6)
    ├── personas.ts             slug-keyed resolver layer + CAST canon
    ├── store.ts                Zustand store + selector hooks
    └── (per-feature data — existing)
```

## Don't do

- Don't hardcode persona names in JSX. Always go through `resolveClient(slug)` / `resolveStylist(slug)`.
- Don't add a "Next" button when the natural CTA already advances state — the CTA IS the next-step control.
- Don't use raw Tailwind colors (`text-blue-500`) — only the brand/ink/status tokens.
- Don't fetch from external APIs except GitHub (for the Comments widget).
- Don't add auth, tests, or migrations. This is a prototype.
- Don't rename existing operator-app staff (Mame Diarra, Frederick Douglass, Naomi K., etc.) — operator fixtures reference them by name string.
- Don't change `TODAY` without re-anchoring every fixture date.
- Don't introduce a second state library. Zustand is it.
- **Prototype rule only**: don't reach for shadcn unless the primitive you need isn't already in `src/components`. The codebase has hand-built `Drawer`, `CustomSelect`, `StaffDropdown` — extend those. This rule applies only to the clickable prototype to keep its dependency surface minimal. **The production build uses shadcn/ui as the default** — see [docs/ARCHITECTURE.md §2](docs/ARCHITECTURE.md#component-library--design-tokens).

## Phasing (where we are)

- ✅ **P1 — Foundation.** Brand tokens extended, types + catalog + store + personas + Comments widget all in place.
- ⏭ **P2 — Landing / demo hub.** Tabbed entry per surface, cold/hot persona tiles.
- **P3** Per-surface scaffolding (`/book`, `/me`, `/pro` shells)
- **P4** Appointment lifecycle smart router
- **P5** Photo-first booking flow
- **P6** Seed personas + scraped photos
- **P7** Polish (birthday, empty states, AI takeover surfaces)
- **P8** README.md + Vercel deploy

After each phase: `npx tsc --noEmit`, `npm run build`, commit. Push to `main` → Vercel auto-deploys. Push to feature branches → preview URLs.
