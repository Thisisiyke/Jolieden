# Jolieden — Technical Architecture

> Engineering spec for the production build that follows the clickable prototype.
> Audience: technical co-founder / CTO / external dev shop responsible for estimating, scoping, and shipping the v1.
> Author: Kyle (with Claude as co-author).
> Last updated: 2026-05-28.

---

## 0. TL;DR

| Concern | Recommendation |
|---|---|
| Web stack | Next.js 16 (App Router, Turbopack) + React 19 + TypeScript |
| Web component library | **shadcn/ui** (Radix primitives + Tailwind) + the prototype's hand-built drawers/selects extracted to `packages/ui-web` |
| Mobile UI library | **Tamagui** (cross-platform tokens + animations, share `packages/tokens`) |
| Database | Postgres via **Supabase** (managed, RLS, auth, storage, realtime in one) |
| Mobile | **React Native + Expo** (reuse TS types from the web; ship to App Store / Play) |
| AI Concierge | **Anthropic Claude** (tool-use) + RAG over salon docs |
| SMS layer | **Twilio Conversations API** (threading + handoff built-in) |
| Payments | **Stripe Connect** (split per stylist, deposits, tips, gift cards) |
| Photos | **Cloudflare R2** + Image Resizing (cheaper than S3 for media-heavy app) |
| Hosting | **Vercel** for web; mobile builds via **EAS Build** |
| Auth | Supabase Auth (magic link for clients, SSO for staff) |
| Multi-location | One organization, N location tenants, row-level isolation |
| Real-time | Supabase Realtime (Postgres → WebSocket) for floor view, AI status |

---

## 1. Product surfaces

| Surface | Audience | Form factor | Path in prototype | Production deploy |
|---|---|---|---|---|
| Operator web | Owner, manager, front desk | Desktop + tablet | `/` (Front Desk, Calendar, Messages, Sales, Clients, Reports, Marketing, Manage, Owner) | `app.jolieden.com` |
| Client booking | Anyone visiting joliedensbeautybar.com | Desktop + mobile web | `/book` | embedded behind "Book Now" on Shopify store |
| Client mobile app | Existing + new clients | iOS + Android native | `/me/[clientSlug]` | App Store + Play Store: "Jolieden" |
| Stylist mobile app | Stylists on the floor | iOS + Android native | `/pro/[stylistSlug]` | App Store + Play Store: "Jolieden Pro" |
| iPad kiosk | Front desk hardware | iPad fullscreen | `/kiosk` | PWA installed on a kiosked iPad |

All web surfaces share a single Next.js codebase and database. Mobile apps consume the same backend via REST/GraphQL.

---

## 2. Tech stack & architecture overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Marketing site (Shopify)                     │
│                    joliedensbeautybar.com                           │
│                       "Book Now" button                              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  Next.js app on Vercel (web)                        │
│      Operator app · /book · /me · /pro · /kiosk · /demo             │
│                  Edge functions for API routes                       │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │  REST / RPC over HTTPS
                             │  Supabase JS client (PostgREST)
                             │  WebSocket (realtime channels)
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Supabase (managed Postgres)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │
│  │  Postgres    │  │  Auth        │  │  Realtime    │                │
│  │  + RLS       │  │  (magic link │  │  (WebSocket  │                │
│  │              │  │   + SSO)     │  │   over WAL)  │                │
│  └──────────────┘  └──────────────┘  └──────────────┘                │
│  ┌──────────────────────────────────────────────────────┐            │
│  │  Edge Functions (Deno) for server-side jobs          │            │
│  │  · AI worker · webhook receivers · cron              │            │
│  └──────────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────────┘
        │              │                │              │
        ▼              ▼                ▼              ▼
   Twilio        Anthropic         Stripe         Cloudflare R2
   Conversations Claude API        Connect        (photos)
   (SMS)         (LLM + tools)     (payments)

┌─────────────────────────────────────────────────────────────────────┐
│              Mobile apps (Expo / React Native)                       │
│       "Jolieden" client app   ·   "Jolieden Pro" stylist app         │
│   Shares types via internal npm package @jolieden/types              │
│   Uses Supabase JS SDK (same as web) for data + realtime             │
│   Native modules: camera, push (Expo Notifications), AR (P+1)        │
└─────────────────────────────────────────────────────────────────────┘
```

### Component library + design tokens

| Layer | Decision | Rationale |
|---|---|---|
| Web primitives | **shadcn/ui** (copy-in pattern over Radix + Tailwind) | Owns the source code, no runtime lock-in, plays well with Tailwind v4 tokens. |
| Web salon-specific components | Extract from prototype into `packages/ui-web` | The hand-built `Drawer`, `CustomSelect`, `StaffDropdown`, `BookingDetailCard`, `MobileFrame` carry product knowledge; rewriting them is waste. |
| Mobile primitives | **Tamagui** | Cross-platform (RN + web fallback), reads the same design tokens as Tailwind via a small shim, performance-tuned animations native to React Native. |
| Design tokens (shared) | `packages/tokens` exports both a Tailwind config (web) and a Tamagui config (mobile) | Brand colors + typography stay in one source of truth. |
| Icons | `lucide-react` (web) + `@expo/vector-icons` (mobile, lucide subset) | Already used in prototype. |
| Forms | `react-hook-form` + `zod` resolvers | Standard, validated by Vercel templates. |
| Tables (operator) | `@tanstack/react-table` | The reports + clients DB need sorting/filtering at scale. |

**The CLAUDE.md prototype-only rule** ("Don't reach for shadcn unless the primitive you need isn't already in src/components") **does NOT apply to the production build.** It exists because the prototype is a single-purpose demo where pulling in shadcn would have been over-engineering. Production should adopt shadcn primitives as the default and lift the hand-built ones into `packages/ui-web` for the salon-specific compositions.

### Why these choices

- **Next.js + Supabase** is the fastest path for a small team. Supabase handles auth, DB, storage, realtime, and edge functions in one console. A 1–3 developer team can ship Day 1 with this stack; AWS/custom infra is overkill until you outgrow it (10k+ MAU).
- **React Native via Expo** lets the existing TypeScript domain logic move directly to mobile. EAS Build handles signing. Push notifications, native camera, and (later) AR all work out of the box. Avoids the cost of a separate Swift/Kotlin team.
- **Claude over GPT-4** for the AI: better long-context (relevant for client history personalization), strong tool use, and Anthropic's pricing on Sonnet matches our cost envelope (~$0.03–$0.05 per conversation). Multi-language support is competitive with GPT.
- **Twilio Conversations** (not raw SMS) gives us thread management + multi-channel (SMS → WhatsApp later) + AI/human handoff via "agents." Saves us from rebuilding threading.

---

## 3. Data model

### 3.1 ERD overview

```
            ┌─────────────────┐
            │  Organization   │
            │  (Jolieden)     │
            └────────┬────────┘
                     │ 1 : N
                     ▼
            ┌─────────────────┐         ┌─────────────────┐
            │  Location       │◀────────│  StaffMember    │
            │  (NYC/ATL/HOU)  │  N : N  │                 │
            └────────┬────────┘  (via   └────┬────────────┘
                     │           Assignment)  │
                     │ 1 : N                  │ 1 : N
                     ▼                        ▼
            ┌─────────────────┐         ┌─────────────────┐
            │  Service        │         │  Shift          │
            │  (catalog)      │         │  (worked hours) │
            └────────┬────────┘         └─────────────────┘
                     │ 1 : N
                     ▼
            ┌─────────────────┐
            │  ServiceModifier│   ──── options jsonb (length, color)
            │  (catalog)      │
            └─────────────────┘

   ┌─────────────────┐
   │  Client         │──── notes, tags, accommodations, opt-ins (all on the row)
   └────────┬────────┘
            │ 1 : N
            ▼
   ┌────────────────────────────────────────┐
   │  Appointment                           │
   │  · modifier_choices jsonb              │
   │  · addon_ids uuid[]                    │
   │  · status enum                         │
   │  · before/after photo URLs             │
   │  · payment_id fk                       │
   │  · journey_entry_id fk                 │
   │  · ai_booked + source_conversation_id  │
   └────────────────────────────────────────┘

   ┌─────────────────┐
   │  Conversation   │──── Message[] (client + AI + staff turns + tool_calls jsonb)
   │  (SMS thread)   │
   └─────────────────┘

   ┌─────────────────┐
   │  RepairRequest  │──── photo_urls jsonb, status, scheduled fix
   │  (oopsie)       │
   └─────────────────┘
```

**Modeling decision: appointments are single-service rows, not parent + lines.**

There is no `appointment_lines` table in v1. Each `appointment` row represents one client × one base service × N add-ons, stored inline:

- `service_id` — the base service (e.g. "XS Knotless Braids")
- `modifier_choices` (jsonb) — selected modifier options
- `addon_ids` (uuid[]) — selected add-on services

Multi-service visits (e.g. "Silk press + cut" same day, same chair) are modeled as **two separate appointments** with the same `client_id` and overlapping or sequential `starts_at`/`ends_at`. The calendar render layer stacks them.

Trade-off: simpler schema, faster v1 ship, but you can't query "every visit that included an ACV Wash add-on" by joining a child table — you'd need a `jsonb_array_elements` over `addon_ids`. Acceptable until we have analytics requirements that demand it (likely Phase 3+). At that point, migrate to an `appointment_services` join table.

### 3.2 Core tables (Postgres DDL sketch)

> **Standard columns on every domain table** (omitted from individual definitions below for brevity):
> - `id uuid primary key default gen_random_uuid()`
> - `org_id uuid not null references organizations(id)` — the top-level tenant. Required on every domain table for RLS consistency, even when single-org today.
> - `location_id uuid not null references locations(id)` — for location-scoped data. Omit only on tables that are explicitly org-wide (`gift_cards`, `referral_links`, `staff` — staff can work multiple locations via `staff_locations`).
> - `created_at timestamptz not null default now()`
> - `updated_at timestamptz not null default now()` (with a trigger to auto-update)
> - RLS enabled with policies per §3.3.

#### `clients`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | pk |
| `slug` | `text unique` | for URL routing |
| `first_name` | `text not null` | |
| `last_name` | `text not null` | |
| `phone` | `text unique not null` | E.164 format |
| `email` | `citext` | optional |
| `birthday_month` | `int` | 1–12 |
| `birthday_day` | `int` | 1–31 |
| `preferred_stylist_id` | `uuid fk staff(id)` | |
| `membership_tier` | `text` | Bronze/Silver/Gold/Platinum |
| `lifetime_spend_cents` | `bigint default 0` | drives tier |
| `text_opt_in` | `bool default true` | |
| `email_opt_in` | `bool default true` | |
| `marketing_opt_in` | `bool default true` | |
| `blocked` | `bool default false` | Boulevard "Block client" |
| `notes_md` | `text` | markdown notes |
| `accommodations` | `jsonb` | structured: scalp, allergies, etc. |
| `tags` | `text[]` | VIP, Loyalist, etc. |
| `referral_code` | `text unique` | for the referral program |
| `referred_by` | `uuid fk clients(id)` | |
| `home_location_id` | `uuid fk locations(id)` | primary salon |

#### `appointments`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | pk |
| `client_id` | `uuid fk` | |
| `staff_id` | `uuid fk` | the booked stylist |
| `location_id` | `uuid fk` | which shop |
| `service_id` | `uuid fk services` | base service |
| `modifier_choices` | `jsonb` | `{length:"waist", parting:"triangle", color:"1B/27"}` |
| `addon_ids` | `uuid[]` | add-ons selected |
| `starts_at` | `timestamptz not null` | |
| `ends_at` | `timestamptz not null` | |
| `status` | `appt_status enum` | `unconfirmed`, `confirmed`, `arrived`, `active`, `completed`, `cancelled`, `noshow`, `walkin` |
| `quoted_price_cents` | `bigint` | computed at booking |
| `final_price_cents` | `bigint` | after add-ons + tax + tip |
| `tip_cents` | `bigint default 0` | |
| `payment_id` | `uuid fk payments` | |
| `ai_booked` | `bool default false` | true when committed via Concierge |
| `source_conversation_id` | `uuid fk conversations` | if AI-booked |
| `before_photo_url` | `text` | |
| `after_photo_url` | `text` | |
| `service_notes_md` | `text` | stylist notes for next visit |
| `birthday_flag` | `bool default false` | birthday-week visit |

#### `services` (catalog)
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | pk |
| `slug` | `text unique` | for routing |
| `name` | `text not null` | "XS Knotless Braids" |
| `category` | `service_category enum` | braids, weaves, silk_press, etc. |
| `base_price_cents` | `bigint not null` | |
| `base_duration_min` | `int not null` | |
| `processing_time_min` | `int default 0` | |
| `description_md` | `text` | |
| `popular` | `bool default false` | featured |
| `active` | `bool default true` | |
| `staff_pricing` | `jsonb` | `{staff_id: price_cents}` overrides |

#### `service_modifiers`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | pk |
| `service_id` | `uuid fk` | |
| `label` | `text` | "Length" |
| `kind` | `modifier_kind enum` | size, length, color, parting, ends |
| `required` | `bool default true` | |
| `options` | `jsonb` | array of `{value, label, price_delta_cents, photo_url}` |

#### `conversations` (SMS threads)
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | pk |
| `client_id` | `uuid fk` | nullable (Unknown threads) |
| `phone` | `text` | client's phone |
| `twilio_sid` | `text unique` | Twilio Conversations SID |
| `ai_state` | `ai_state enum` | `needs_human`, `ai_handled`, `ai_replying`, `closed` |
| `ai_reason` | `ai_reason enum` | escalation, complaint, auto_booking, faq, etc. |
| `ai_summary` | `text` | one-line of what's happening |
| `booking_id` | `uuid fk appointments` | if AI booked something in this thread |
| `assigned_staff_id` | `uuid fk staff` | when escalated |
| `last_activity_at` | `timestamptz` | |

#### `messages` (per-turn within conversations)
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | pk |
| `conversation_id` | `uuid fk` | |
| `from` | `message_sender enum` | `client`, `ai`, `staff` |
| `staff_id` | `uuid fk staff` | when from=staff |
| `body` | `text` | |
| `attachments` | `jsonb` | photo URLs |
| `tool_calls` | `jsonb` | when from=ai: what Claude invoked |
| `confidence` | `numeric` | 0–1, when from=ai |

#### Other key tables
- `locations` (org tenants)
- `staff` (with `role`, `permissions`, `commission_pct`)
- `staff_locations` (N:N assignments)
- `shifts` (clock-in/out, time tracking)
- `payments` (Stripe payment intent references)
- `gift_cards`, `account_credit_ledger`
- `repair_requests` (oopsie tracking)
- `journey_entries` (hair journey timeline)
- `wishlist_entries` (`client_id`, `style_slug`)
- `referral_links` (`code`, `referrer_id`, `redeemed_by_id`, `status`)
- `audit_log` (everything that mutates)

### 3.3 Row-Level Security (RLS) sketch

```sql
-- Clients can only see their own data
create policy "Clients see own row"
  on clients for select
  using (auth.uid() = id);

-- Staff see all clients in their assigned locations
create policy "Staff see clients in their locations"
  on clients for select
  using (
    exists (
      select 1 from staff_locations sl
      where sl.staff_id = auth.uid()
        and sl.location_id = clients.home_location_id
    )
  );

-- Owners see everything in the org
create policy "Owners see all"
  on clients for all
  using (
    exists (select 1 from staff where id = auth.uid() and role = 'owner')
  );
```

Same pattern repeated per table. RLS is the cornerstone of multi-location isolation.

---

## 4. API surface

### 4.1 Convention (single host for application logic)

**Decision: All server-side application logic lives in Next.js API routes on Vercel** (e.g. `app/api/twilio/inbound/route.ts`). This single-host approach was picked deliberately over a split between Vercel + Supabase Edge Functions because:

1. Twilio + Stripe webhooks need stable public HTTPS URLs; pinning them all to `app.jolieden.com` (Vercel) simplifies signature verification and DNS.
2. The AI Concierge prompt + tools + escalation logic should be co-located with the rest of the web codebase — Supabase Edge Functions run Deno and require a context switch.
3. Vercel Edge Runtime has lower cold-start than Supabase Edge Functions for webhook latency.
4. One deploy pipeline (Vercel preview-per-PR) instead of two.

**Supabase Edge Functions are NOT used for application logic in this architecture.** They're reserved for:
- Database triggers (e.g. embedding pipeline on `knowledge_documents` insert)
- Cron jobs (nightly reports rollup, birthday automations, follow-up SMS scheduling)

### 4.2 Read pattern

PostgREST via Supabase JS SDK (`supabase.from('appointments').select(...)`). Replaces 90% of GET endpoints. RLS handles auth. Used by all surfaces (web + mobile).

### 4.3 Write pattern

**Mutations with side effects** (book, cancel, check-in, complete, repair, assistance, kiosk): Next.js API routes (`POST /api/*`). Each route:

1. Validates input with `zod`.
2. Authorizes via Supabase JWT on the request.
3. Charges/refunds via Stripe (where applicable).
4. Writes the row(s) inside a Postgres transaction (`supabase.rpc('book_appointment', {...})` for atomicity).
5. Triggers downstream pushes (Twilio SMS, Expo Notifications) via fire-and-forget queue (Vercel `waitUntil`).
6. Returns the new row + any client-facing receipts.

**Mutations with simple side effects** (status changes, wishlist toggle): Use Supabase's `update()` with RLS — atomic in Postgres, no API route needed.

### 4.4 Key Next.js API routes

| Route | Inputs | Side effects |
|---|---|---|
| `POST /api/book/appointment` | `{client_id, service_id, modifier_choices, addon_ids, staff_id, start_at, payment_method_id}` | Stripe deposit, DB write (txn), Twilio confirmation SMS, calendar realtime push |
| `POST /api/book/cancel` | `{appointment_id, reason}` | Refund logic per policy, SMS, calendar realtime |
| `POST /api/book/checkin` | `{appointment_id}` | DB update, Expo push to stylist app |
| `POST /api/book/complete` | `{appointment_id, final_price_cents, tip_cents, addons_used}` | Stripe final charge, Connect tip payout, journey entry, follow-up SMS scheduled |
| `POST /api/twilio/inbound` | Twilio inbound SMS payload (signed) | Spawns AI Concierge worker (see §5 + [AI_CONCIERGE.md](./AI_CONCIERGE.md) §6) |
| `POST /api/twilio/status` | Twilio delivery status webhook | Updates `messages.delivery_status` |
| `POST /api/assistance/request` | `{client_id, type}` | Expo push to all on-floor staff at client's location |
| `POST /api/repair/report` | `{client_id, original_appt_id, description, photo_urls[]}` | DB write to `repair_requests`, Twilio MMS notification to owner |
| `POST /api/kiosk/checkin` | `{qr_payload or phone}` | Matches client + flips appointment status to `arrived` |
| `POST /api/stripe/webhook` | Stripe event (signed) | Syncs `payments.status`, retries failed Connect transfers |

### 4.5 Public unauthenticated endpoints (marketing site → booking flow)

- `GET /api/book/quote?service=<slug>&modifiers=<json>` — no auth, returns price + duration estimate
- `POST /api/book/intent` — creates an unconfirmed appointment + Stripe deposit intent (returns client secret)
- `POST /api/book/confirm` — finalizes after Stripe handshake (signed via Stripe event)

---

## 5. AI Concierge architecture (the headline)

The AI Concierge is the differentiator vs. Boulevard. It needs its own clarity.

### 5.1 What it does

1. Receives inbound SMS via Twilio Conversations webhook.
2. Loads conversation history + client profile.
3. Calls Claude with available tools.
4. Claude either responds in natural language, calls a tool (and responds), or signals escalation.
5. AI responses go back to client via Twilio.
6. Tool calls (e.g. `commit_booking`) execute real backend mutations.
7. On escalation, the conversation flips to `needs_human` and notifies on-floor staff via push.

### 5.2 Stack

> Per §4.1: the AI worker runs as a **Next.js API route on Vercel** (`app/api/twilio/inbound/route.ts`), not as a Supabase Edge Function. Supabase Edge Functions are reserved for DB triggers and cron only.

```
Twilio Conversations ─┐
                       │  inbound webhook  ┌──────────────────────────┐
                       └─────────────────▶ │  Next.js API route       │
                                           │  app/api/twilio/inbound  │
                                           │  (Vercel — see §4.1)     │
                                           └─────────┬────────────────┘
                                                     │
                            ┌────────────────────────┼─────────────────────────┐
                            ▼                        ▼                         ▼
                    ┌────────────────┐    ┌────────────────┐         ┌────────────────┐
                    │  Supabase      │    │  Anthropic     │         │  pgvector      │
                    │  Postgres      │    │  Claude        │         │  (RAG over     │
                    │  (history,     │    │  (tool use)    │         │   knowledge_   │
                    │   client       │    │                │         │   chunks)      │
                    │   profile)     │    │                │         │                │
                    └────────────────┘    └────────┬───────┘         └────────────────┘
                                                   │
                                          tool calls invoked
                                          (see §5.4)
                                                   │
                            ┌──────────────────────┼──────────────────────┐
                            ▼                      ▼                      ▼
                     read_availability       commit_booking         escalate
                     (Postgres query)        (real DB write)        (flip state)
                            │                      │                      │
                            └──────────────────────┴──────────────────────┘
                                                   │
                                                   ▼
                                         ┌────────────────┐
                                         │  Response sent │
                                         │  via Twilio    │
                                         └────────────────┘
```

### 5.3 Model + prompting

- **Model**: Anthropic `claude-sonnet-4` (or current Sonnet at build time). Sonnet beats Haiku for tool-use reliability; Opus is overkill for SMS.
- **System prompt** (~800 tokens): brand voice (warm, Senegalese-American salon energy, never robotic), policies (cancellation, deposits, late arrivals), tone calibration ("write like Diéssou texting back"), tool inventory, escalation criteria.
- **Per-message context** (cached): client's last 5 visits, current rewards balance, preferred stylist, birthday flag, latest booking status, tags.
- **Prompt caching**: client-profile context blocks marked `cache_control: ephemeral` to cut cost ~70% across multi-turn conversations.

### 5.4 Tool spec (function calling)

```typescript
const TOOLS = [
  {
    name: "read_availability",
    description: "Find open booking slots matching client request.",
    input_schema: {
      type: "object",
      properties: {
        date_window: { type: "object", properties: { from: "iso_date", to: "iso_date" }},
        service_slug: { type: "string" },
        staff_slug: { type: "string", description: "Optional preferred stylist" },
        time_of_day: { type: "string", enum: ["morning", "afternoon", "evening", "any"] }
      },
      required: ["date_window", "service_slug"]
    }
  },
  {
    name: "commit_booking",
    description: "Lock in an appointment. Requires deposit to be charged.",
    input_schema: {
      type: "object",
      properties: {
        client_id: { type: "string" },
        service_slug: { type: "string" },
        staff_id: { type: "string" },
        start_at: { type: "string", format: "date-time" },
        modifier_choices: { type: "object" },
        addon_slugs: { type: "array", items: { type: "string" }}
      },
      required: ["client_id", "service_slug", "staff_id", "start_at"]
    }
  },
  {
    name: "lookup_client_history",
    description: "Pull the client's last N visits and preferences. Use to personalize.",
    input_schema: { type: "object", properties: { client_id: "string", limit: { type: "number", default: 5 }}}
  },
  {
    name: "search_knowledge_base",
    description: "RAG over salon docs: hours, pricing, policies, prep instructions.",
    input_schema: { type: "object", properties: { query: "string" }, required: ["query"] }
  },
  {
    name: "escalate",
    description: "Hand off this conversation to a human. Use when (a) sentiment is angry/complaint, (b) custom pricing/color question, (c) AI confidence < 0.7, (d) refund/cancellation within penalty window, (e) request is outside catalog.",
    input_schema: {
      type: "object",
      properties: {
        reason: { type: "string", enum: ["complaint", "custom_pricing", "no_availability", "cancellation", "unknown"] },
        suggested_staff_slug: { type: "string", description: "Optional. AI's guess at who should handle." },
        summary: { type: "string", description: "1-sentence brief for the human." }
      },
      required: ["reason", "summary"]
    }
  }
];
```

### 5.5 RAG knowledge base

- Source docs: services catalog, hours, policies (cancellation/deposit/late), prep instructions per service, FAQ.
- Stored as `documents` rows with embeddings via OpenAI `text-embedding-3-small` (or Voyage AI for first-party-friendly).
- Retrieval: pgvector index, k=5 chunks per query.
- Diéssou owns the source docs via a simple CMS UI under `/owner/knowledge`. Edits trigger re-embedding.

### 5.6 Escalation logic

| Trigger | Action |
|---|---|
| Sentiment classifier flags negative > 0.7 | Auto-escalate, route to Diéssou |
| Claude calls `escalate(reason='complaint')` | Same |
| Confidence on a `commit_booking` tool call < 0.85 | Send proposal but require client confirmation |
| Knowledge base search returns nothing matching | Escalate with `unknown` |
| Client asks 3× in a row and no resolution | Auto-escalate |
| Request for refund within 24h penalty window | Auto-escalate |
| VIP client tag present + complaint keywords | Route directly to owner |

### 5.7 Cost projection

| Metric | Estimate |
|---|---|
| Avg input tokens per conversation (with cache) | ~3,000 |
| Avg output tokens per conversation | ~800 |
| Sonnet input cost | $3 / 1M tokens (cached: $0.30) |
| Sonnet output cost | $15 / 1M tokens |
| Cost per conversation | ~$0.03 average |
| Twilio SMS per conversation (5 inbound + 5 outbound, US) | ~$0.04 |
| **Per conversation all-in** | **~$0.07** |
| At 500 convos/week (Jolieden current SMS volume from `analytics`) | ~$35/wk = $1,820/yr |

Material but not gating. Multi-location 3× the volume is still under $6k/yr in AI + SMS.

### 5.8 Multi-language (Diéssou's note)

- **Client-facing**: Claude is natively multi-lingual. Detect language from inbound message; respond in same.
- **French internal for braiders**: separate Slack-like channel for staff that goes through the same AI for translation. Out of MVP.
- **Senegalese Wolof**: Claude has reasonable Wolof support but not perfect. Consider Anthropic's evolving language coverage at build time, or fall back to translation pre/post.

---

## 6. Auth + multi-tenancy

### 6.1 User types

| Type | Login flow | Where |
|---|---|---|
| **Client** | Magic link via SMS or email | `/me/*` mobile, `/book` checkout |
| **Stylist** | Magic link (work email) + 2FA | `/pro/*` mobile |
| **Manager** | Same as stylist + manager role | Operator web |
| **Owner (Diéssou)** | Same + all-locations scope | Operator web |
| **Front desk** | Manager-issued credential | Operator web (limited scope) |
| **iPad kiosk** | Long-lived service account | `/kiosk` |

### 6.2 Roles (matches Diéssou's Permission Groups Must-Have)

```typescript
type Role = "owner" | "manager" | "stylist" | "front_desk" | "client" | "kiosk";

type Permission =
  | "appointments.write"
  | "appointments.cancel"
  | "clients.view_all"
  | "clients.merge"
  | "messages.takeover"
  | "sales.refund"
  | "sales.void"
  | "reports.financial"
  | "reports.staff"
  | "settings.manage"
  | "staff.manage"
  | "locations.manage";

// Role → default Permission set, overridable per staff member.
```

### 6.3 Multi-location isolation

- One `Organization` row (Jolieden) with N `Location` rows.
- Every domain table has `location_id` (or `home_location_id` for clients).
- Staff have `staff_locations` join — staff member can work at multiple locations.
- RLS policy on every table: "user can read/write rows where their assigned locations match."
- Owner role bypasses location filtering (sees all).

### 6.4 "All locations" mode

Operators with multi-location scope can toggle the LocationSwitcher to "All." Implementation:
- Frontend stores `active_location_id = 'ALL'` in sessionStorage.
- API calls include `?location_id=ALL` query.
- Edge Functions interpret as bypassing the filter; aggregations roll up across locations.
- For reports specifically, charts label data by location.

---

## 7. Real-time strategy

What needs to be live, what can be polled:

| Surface | Live updates needed | Mechanism |
|---|---|---|
| Operator Front Desk kanban | Yes — stylist arrives, status flips | Supabase Realtime subscription on `appointments` filtered by today + location |
| Operator Messages inbox | Yes — new SMS, AI replying state | Realtime on `conversations` + `messages` |
| `/pro` Today tab | Yes — next-up changes, AI escalations | Realtime |
| Floor view | Yes — live chair status | Realtime on `appointments` + `shifts` |
| `/me` upcoming appointment | Yes (when in salon) — status changes | Realtime |
| `/me` rewards balance | No — refresh on focus is enough | Standard query |
| Stylist daily goal | Yes (when on the floor) | Realtime |
| Reports | No — daily refresh fine | Cron-refreshed materialized views |

Supabase Realtime publishes Postgres WAL events to subscribed clients via WebSocket. Cheap and natively integrated with RLS.

### 7.1 Channel + topic naming

| Topic | Subscribed by | Filter | Payload |
|---|---|---|---|
| `appointments:location:<location_id>` | Operator app (Front Desk, Calendar), `/manage/floor`, `/pro` Today | RLS via `location_id` | Appointment row changes (INSERT/UPDATE/DELETE) |
| `conversations:location:<location_id>` | Operator Messages | RLS via `location_id` | Conversation state changes (`ai_state`, last message) |
| `messages:conversation:<conversation_id>` | Operator Messages (when thread open) | RLS via conversation participants | New `messages` rows |
| `assistance:location:<location_id>` | `/pro` (on-floor staff) | Server-side push (not WAL) | `{client_id, type, summary}` |
| `escalations:staff:<staff_id>` | `/pro/.../inbox` for that stylist | RLS via assigned_staff_id | Conversation escalated to me |
| `notifications:client:<client_id>` | `/me` mobile app | RLS via client_id | Birthday alert, appointment ready, AI replied |
| `goals:location:<location_id>` | `/pro` Today (owner + stylist view) | RLS via location_id | Daily/weekly revenue updates |

### 7.2 RLS interaction (the sharp edge)

Supabase Realtime filters fire **on the publish side via RLS**, not in the client filter. This means:

- The `appointments:location:NYC` channel only broadcasts a row to a client if the client's JWT passes the RLS policy for that appointment's `location_id`.
- A staff member with multi-location access sees all their locations' channels.
- **Do not rely on client-side `filter()` in the `.subscribe()` call for security** — it's defense-in-depth only.

### 7.3 Channel lifecycle

- Open on page mount / route transition.
- Close on unmount or route exit.
- Use a connection-pool helper (one WS per logged-in user, multiplex topics) to avoid 5+ WebSocket connections per operator session.
- Hibernate (close all) when tab is backgrounded for >5 min; re-open on focus.

### 7.4 Non-Realtime push (Expo Notifications)

For mobile apps when the app is backgrounded:

- AI escalations to stylist → Expo Push
- Birthday wishes from clients → Expo Push
- "Your stylist is ready" client arrival → Expo Push
- Repair report submitted → Expo Push to Diéssou

Triggered server-side from Next.js API routes via Expo's HTTP API. Tokens stored in `staff_devices` and `client_devices` tables.

---

## 8. Integrations

### 8.1 Twilio Conversations

- **Why Conversations, not raw SMS**: built-in threading, multi-channel (SMS now, WhatsApp later), agent-handoff primitives ("conversation participant" can be AI or human).
- **Setup**:
  1. Register the Jolieden number with Twilio.
  2. **10DLC registration** for US business SMS (Diéssou must complete the brand vetting; ~$30/mo + per-message rate). This is non-negotiable for US SMS sending at any volume.
  3. Webhook → `POST /api/twilio/inbound` (Next.js API route on Vercel).
  4. Outbound messages via Twilio API from edge functions.
- **MMS** (image attachments): supported, increases per-message cost ~10×. Used for repair-photo replies, before/after.

### 8.2 Stripe Connect

- **Why Connect, not standard**: Diéssou wants per-stylist tip distribution (her Must-Have note). Connect lets each stylist have a sub-account; tips route directly to the stylist's payout.
- **Setup**:
  1. Jolieden as platform account; each stylist onboards as a connected account (Express).
  2. Deposit (charged at booking) flows to platform.
  3. Final service charge + tip flows to the stylist's connected account (minus platform fee).
  4. Refunds via `refund_application_fee` for stylist + platform.
- **Gift cards** and **account credit**: store balances in Postgres, reconcile against Stripe at checkout.
- **Apple Pay / Google Pay**: standard via Stripe Elements / Payment Sheet on mobile.
- **Klarna / Afterpay**: enabled per Diéssou's Nice-to-Have (toggleable per location).

### 8.3 Google Reviews

- **Google Business Profile API** to pull recent reviews (paid tier required for high frequency).
- **Post-visit prompt**: after a 5-star in-app rating, deep-link to the Google review form pre-loaded.
- **Owner replies** to Google reviews are written from the operator app via the same API.

### 8.4 Boulevard data migration

- Boulevard exports clients, appointments, products, gift card balances via CSV (per their docs) or API (paid Enterprise tier).
- Migration script (one-time) maps Boulevard's IDs → Jolieden UUIDs, normalizes phone numbers, dedupes.
- Plan a soft-launch window where both systems run in parallel; cut over Boulevard appointments after the in-prod ones have completed.

### 8.5 Hardware

| Device | Integration |
|---|---|
| iPad kiosk | PWA installed via Safari "Add to Home Screen." Camera via `getUserMedia` for QR scan. |
| Card reader | **Stripe Terminal** (Stripe-Reader-M2 or BBPOS WisePOS E). Connect via Stripe Terminal SDK in the kiosk PWA. |
| Receipt printer | ESC/POS-compatible (Star TSP143, Epson TM-m30). Connect via network printing or Bluetooth on iPad. |
| Barcode scanner | USB or Bluetooth scanner that acts as a keyboard. PWA captures via focused input. |

---

## 9. Mobile platform decision

### 9.1 Options considered

| Option | Pros | Cons |
|---|---|---|
| **PWA only** | Cheapest; one codebase | iOS push barely works; no native AR; not in App Store; Diéssou wants App Store presence |
| **React Native + Expo** ✅ | Reuse TS types; native push, camera, AR (Expo modules); EAS Build handles signing; one team | Some native modules need ejecting; ~30% UI rebuild from web |
| **Native iOS + Android** | Best UX, native AR | Doubles team cost; slowest velocity |
| **Capacitor (Ionic)** | Web reuse | Worse perf than RN; smaller ecosystem |

**Recommendation: React Native + Expo for both /me and /pro.**

### 9.2 What carries over from the prototype

- All TypeScript types (`Appointment`, `Client`, `Stylist`, `Style`, etc.) → published as `@jolieden/types` internal npm package.
- Business logic (rewards calculation, next-visit recommendation, AI scenarios, care tips) → published as `@jolieden/domain`.
- Brand tokens → `@jolieden/tokens` (Tailwind config for web, Tamagui config for RN).
- Component layouts inform RN screen designs but get rebuilt with NativeWind / Tamagui.

### 9.3 Native-only modules needed

- **expo-notifications**: push for AI escalations to stylist app, birthday alerts to clients, "your stylist is ready" notifications.
- **expo-camera**: for `/me` selfie upload (try-on), QR scanning on `/pro` (when stylist scans iPad QR), before/after capture.
- **expo-image-picker**: photo uploads for repair requests.
- **expo-secure-store**: client auth token.
- **expo-three** or **expo-gl**: future AR try-on (P+1).
- **react-native-stripe-stdk**: Stripe payment sheet.

### 9.4 Distribution

- **EAS Build** for CI builds → TestFlight (iOS) + Play Console internal (Android).
- App Store / Play Store accounts under Jolieden Inc.
- Diéssou listed as developer contact for App Store reviews.

---

## 10. Infrastructure

### 10.1 Hosting

| Component | Provider | Reasoning |
|---|---|---|
| Web app (Next.js) | **Vercel** Pro | Edge functions, ISR, preview deploys per PR. Already using for prototype. |
| Database | **Supabase** Pro ($25/mo + usage) | Managed Postgres, auth, realtime, storage in one. RLS + edge functions native. |
| Photos / large assets | **Cloudflare R2** + Image Resizing | $0 egress (vs S3's $90/TB); image resizing built-in. Material savings for photo-heavy app. |
| AI inference | **Anthropic** direct | Cheaper than via aggregators. |
| SMS | **Twilio** Conversations + Messaging | Mature, support for compliance. |
| Payments | **Stripe** Connect | Best-in-class. |
| Mobile builds | **Expo EAS** | Hosted React Native builds. |
| Email (system) | **Resend** | Transactional email for receipts, confirmations. |
| Monitoring | **Sentry** (errors) + **Vercel Analytics** (web vitals) | Standard stack. |
| Logs | **Logtail** or Vercel's built-in | |

### 10.2 Cost envelope (rough, per location, first year)

| Item | Monthly | Annual |
|---|---|---|
| Vercel Pro (shared across all surfaces) | $20 | $240 |
| Supabase Pro + storage growth | $50 | $600 |
| Anthropic Claude (Concierge) | $40 | $480 |
| Twilio (SMS + 10DLC) | $80 | $960 |
| Stripe (per-transaction) | variable | ~2.9% + 30¢/tx |
| Cloudflare R2 (photos) | $5 | $60 |
| Resend (email) | $10 | $120 |
| Sentry | $26 | $312 |
| Apple Developer Program | — | $99 |
| Google Play Developer | — | $25 (one-time) |
| EAS Build subscription | $19 | $228 |
| **Subtotal (excl. Stripe fees + 10DLC reg)** | **~$250** | **~$3,124** |
| Stripe fees @ $50k revenue/mo | $1,475 | $17,700 |

Doesn't include people. With Diéssou's 3 locations, infrastructure scales sub-linearly (~$350/mo total) due to shared Vercel/Supabase. Stripe scales with revenue regardless.

---

## 11. Security & compliance

### 11.1 PCI scope

- Card data **never touches our servers**. Stripe Elements (web) and Stripe SDK (mobile) tokenize at the boundary.
- Reduces PCI scope to **SAQ-A** (simplest tier).
- Annual self-attestation; no audit needed.

### 11.2 PII handling

- Client phone, email, photos are PII.
- **Stored encrypted at rest** (Supabase default, AES-256).
- **In transit**: TLS 1.3 everywhere.
- **Photos in R2**: signed URLs only; expire after 1 hour for public surfaces, persistent for staff via internal auth.
- **Logs**: scrubbed for phone/email; use client UUIDs.

### 11.3 Consent + audit trail

- Intake forms + e-signatures stored as immutable Postgres rows with hash chain.
- Every appointment status change writes to `audit_log` with `(user_id, ts, before, after)`.
- Required for any insurance dispute over service issues.

### 11.4 Data retention

- Client profiles: indefinite, or until deletion request.
- Conversations: 2 years (compliance + AI training).
- Photos: 5 years (insurance / journey).
- Card on file: managed by Stripe Customer object; can be detached on request.

### 11.5 Right to delete (GDPR / CCPA)

- `/me/.../profile/delete-account` triggers a function that:
  - Anonymizes the client row (`first_name='Deleted'`, `phone=null`)
  - Removes photos from R2
  - Strips client_id from messages (keep messages for record but un-linked)
  - Sends Stripe `customer.delete`
  - 30-day grace period before hard delete

### 11.6 Multi-tenant data leakage prevention

- RLS policies tested as part of CI: every table has a "fuzz" test that creates rows as Location A and asserts Location B's staff can't see them.

---

## 12. Non-functional requirements

| Concern | Target |
|---|---|
| Operator Front Desk load (p95) | < 1.5s |
| Booking flow page transitions | < 400ms |
| AI Concierge response time (avg) | < 10s end-to-end (Twilio + Claude + Twilio) |
| AI Concierge first reply | < 3s (typing indicator after) |
| `/me` cold-start (mobile) | < 2s |
| Realtime event latency | < 500ms |
| Uptime SLO | 99.9% (3 nines) |
| Recovery point objective | 24 hours (Supabase PITR) |
| Recovery time objective | 2 hours |
| Support escalation for outages | Diéssou's number + on-call rotation |
| Accessibility | WCAG 2.1 AA for operator + /book; AA for mobile (where Apple/Android allow) |
| Browser support | Chrome/Safari/Edge last 2 versions; iOS 15+; Android 10+ |
| Localization | en-US (Day 1), fr-FR (Day 1 — for braiders), wolof (Phase 2) |

---

## 12.5 Test infrastructure

Production tests are not optional. The clickable prototype ships without tests by design; production does not.

### 12.5.1 Test pyramid

| Layer | Tool | What it covers | Run on |
|---|---|---|---|
| Unit | **Vitest** | `packages/domain` business logic — rewards calc, next-visit recommendation, care-tip selection, modifier price computation, persona resolution | Every commit |
| RLS fuzz | **pgTAP** + custom harness | For every domain table: create row as Location A's staff → assert Location B's staff cannot SELECT/UPDATE/DELETE | Every commit + nightly |
| Postgres RPC | **pgTAP** | `book_appointment` concurrency (race condition: two clients book the same slot), `complete_appointment` (atomic charge + payout), credit-ledger over-apply | Every commit |
| API route integration | **Vitest** + msw + Supabase test DB | `POST /api/twilio/inbound` signature validation, replay rejection, persistence; `POST /api/book/*` happy + error paths | Every commit |
| E2E | **Playwright** | 8 critical user flows (see §12.5.3) | Every PR |
| Mobile E2E | **Maestro** | Login → Home → Browse → Book → Confirm; QR check-in; report repair | Nightly |
| AI eval suite | **Custom Vitest runner** | 200+ scenarios from [`docs/ai-eval-corpus.json`](./ai-eval-corpus.json); see [AI_CONCIERGE.md §10.1](./AI_CONCIERGE.md#101-eval-suite) | On prompt change + nightly |
| Load | **k6** | Booking RPC at 50 req/s, Twilio inbound at 20 req/s | Pre-launch + quarterly |
| Visual regression | **Chromatic** (Storybook) | `packages/ui-web` components | Every PR touching UI packages |

### 12.5.2 RLS fuzz harness (example)

```sql
-- supabase/tests/rls_appointments.sql
begin;
select plan(8);

-- Create two locations + one staff per location
insert into locations (id, org_id, name, short_name, address, city, state, zip, phone, hours_json, timezone)
values
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'A', 'A', 'a', 'a', 'NY', '00000', '0', '{}', 'America/New_York'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'B', 'B', 'b', 'b', 'NY', '00000', '0', '{}', 'America/New_York');

-- ... (staff, client, appointment setup with location_id = A)

-- Switch session to staff B; expect zero rows
set local role authenticated;
set local request.jwt.claim.sub to 'staff_b_uuid';

select is(
  (select count(*) from appointments),
  0::bigint,
  'staff B cannot see appointments in location A'
);

-- Attempted UPDATE should fail
prepare attempt_update as
  update appointments set status='cancelled' where id='appt_in_a';
select throws_ok('execute attempt_update', '42501', 'permission denied for table appointments');

select * from finish();
rollback;
```

This harness runs against a fresh local Supabase instance in CI. **Required for every new domain table.**

### 12.5.3 Playwright E2E happy paths (Phase 1)

1. Operator: Log in → see Front Desk kanban with today's appointments → drag confirmed → arrived → mark active → complete with payment.
2. Operator: Search palette (Cmd+K) → "Aaliyah" → jump to client profile → view history.
3. Operator: Calendar → create new appointment → save → appears on grid.
4. Operator: Messages → reply manually to an open thread → send → message persisted.
5. Booking web: From `booking.jolieden.com/book` → browse gallery → pick style → configure modifiers → checkout → Stripe Elements deposit → confirmation page.
6. Booking web: Online waitlist form → submit → success.
7. Kiosk: Phone number entry → match client → photo confirmation → arrive.
8. Sales: Open drawer → record pay-in → count drawer → reconcile → variance shown.

Phase 2 adds AI-driven SMS flows (mock Twilio); Phase 3 adds mobile flows via Maestro.

### 12.5.4 Test data

- Seed scripts: `scripts/seed_test.ts` populates a known fixture set per test run.
- Hermetic: every test creates + tears down its own data; no shared state.
- Faker: `@faker-js/faker` for names, phones (E.164 with NANP region), addresses.
- AI conversations: corpus lives at `docs/ai-eval-corpus.json` (see Appendix E in this doc, and AI_CONCIERGE.md §10.1).

### 12.5.5 Coverage targets

- `packages/domain`: 95% line coverage (it's pure logic, no excuse).
- API routes: 80% line coverage with 100% of error paths exercised.
- E2E: every Phase 1 user-facing flow has at least one test.
- Mobile E2E: every critical client flow has at least one test by Phase 2 end.

---

## 13. Build phasing

### Phase 0 — Foundation (4 weeks)

- Repo + monorepo (Turborepo: `apps/web`, `apps/mobile`, `packages/types`, `packages/domain`, `packages/tokens`)
- Supabase project + database schema + RLS policies
- Auth flow (magic link)
- Locations + roles + permissions
- Boulevard CSV import → seed prod DB
- CI/CD via Vercel + EAS

### Phase 1 — Operator MVP (8 weeks)

- Front Desk kanban (real, Realtime-driven)
- Calendar (drag & drop, day/week views)
- Clients DB (search, profile, notes, tags, history)
- Sales (checkout, refunds, gift cards, account credit)
- Messages inbox (Twilio plumbing, no AI yet — manual replies)
- Settings (location, hours, tax)
- Time clock (clock in/out)

**Demoable as a Boulevard replacement.** Diéssou can run a salon day on it.

### Phase 2 — Client booking web + AI Concierge (8 weeks)

- `/book` photo-first gallery flow on `booking.jolieden.com`
- Booking deposit + Stripe Connect plumbing
- Online waitlist
- AI Concierge MVP (auto-booking, FAQ, escalation)
- Conversation analytics
- Marketing site cutover (replace Boulevard widget on Shopify)

**Marketing site swap moment.** Diéssou turns off Boulevard.

### Phase 3 — Mobile apps (10 weeks)

- React Native shells (`/me` + `/pro`)
- Auth + magic link
- Home + Browse + Bookings + Profile (`/me`)
- Today + Schedule + Inbox + Clients (`/pro`)
- Push notifications
- Hair journey timeline
- Rewards screen
- QR check-in
- Submit to App Store + Play Store

**TestFlight by week 7, App Store by week 10.**

### Phase 4 — Birthday + premium features (4 weeks)

- Birthday auto-detection + gifting
- Personalized care tips
- Next visit reminders
- Wishlist
- Referral program with Stripe coupon mapping
- Try-on (mock or third-party AR integration)

### Phase 5 — Manager operations (4 weeks)

- Floor view (real, Realtime-driven)
- Weekly + daily goals tracking
- Employee of the Month
- Oopsie / Repair queue
- Real-time revenue tracker

### Phase 6 — Multi-location rollout (4 weeks)

- Atlanta + Houston onboarding
- Centralized reporting
- Location-switching everywhere
- Cross-location analytics

### Phase 7 — Hardware & polish (ongoing)

- iPad kiosk PWA deployment
- Stripe Terminal integration
- Receipt printer
- Barcode scanner for retail
- Performance + accessibility audit

**Total: ~42 weeks (~10 months) for a 2-engineer team.**

---

## 14. Open questions before kickoff

These need Diéssou's input before estimating with a dev shop:

1. **Mobile platform commitment**: confirm React Native (not native). Sign off on Expo as the framework.
2. **Boulevard migration timing**: hard cutover vs parallel run? If parallel, for how long?
3. **AI behavior boundary**: should the AI ever charge a card on its own (deposit at booking time), or always send a confirmation link?
4. **Multi-language scope at launch**: French for braiders (internal) is mentioned. Wolof? Is launching English-only Phase 1 acceptable?
5. **Photo data ownership**: does Jolieden retain rights to client before/after photos for marketing, or do clients own them? Affects consent form copy.
6. **Tip splitting**: 100% to stylist? Or platform fee on tips? Affects Stripe Connect setup.
7. **Membership program**: Diéssou said Don't Need (uses Stripe discounts instead). Confirm — saves us building it.
8. **Loyalty/Rewards points**: same. Confirm — we built a Rewards screen in the prototype; if she's truly Don't-Need, we can scope this out and save 2 weeks.
9. **Referral program**: Don't Need or optional? Affects Stripe coupon setup.
10. **Hardware vendor**: which card reader brand? Diéssou's current Boulevard Duo lease — does it carry over to Stripe Terminal? If not, hardware refresh is a sunk cost.
11. **10DLC brand registration**: Diéssou needs to file with The Campaign Registry. Allow 4-6 weeks for approval before any production SMS can flow.
12. **App Store review**: Apple's review can take 1-2 weeks. Plan first submission 4 weeks before public launch.
13. **Liability insurance**: AI books an appointment, client shows up, no slot actually open — who's liable? Standard E&O insurance for the salon should cover, but worth confirming with Diéssou's broker.

---

## 15. Appendix: prototype-to-production mapping

This prototype repo (Next.js, in-memory state) is a **reference implementation of the UI layer**, not the production codebase. The production build should:

- **Reuse**: brand tokens (`globals.css`), TypeScript types (`lib/data.ts`, `lib/catalog.ts`), service catalog seed data, persona slugs as URL routing, all designed screens.
- **Replace**: Zustand store → Supabase JS client; mock fixtures → DB seeds + migrations; client-side state for AI → server-side webhook + Claude calls; client-side wishlist/locale → DB columns + RLS.
- **Discard**: the demo hub (`/demo`), the AI SMS simulator (`/demo/sms`), the try-on mock (until real AR), the kiosk "simulate scan" demo button.

---

*End of main document. Appendices below contain full DDL for secondary tables, Boulevard CSV schema sample, and operator-side knowledge-base UI sketch — added in R2 to resolve handoff gaps flagged by a cold-read engineer review.*

---

## Appendix A. Full DDL for secondary tables

The core tables (`clients`, `appointments`, `services`, `service_modifiers`, `conversations`, `messages`) are sketched in §3.2. The remaining tables that touch revenue, compliance, and the AI Concierge:

### A.1 `payments` (Stripe payment intents + Connect transfers)

```sql
create table payments (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references appointments(id) on delete restrict,
  client_id uuid references clients(id) not null,
  location_id uuid references locations(id) not null,
  type payment_type not null,           -- 'deposit' | 'service_charge' | 'tip' | 'product_sale' | 'refund'
  amount_cents bigint not null,
  currency text default 'USD',
  stripe_payment_intent_id text unique, -- pi_xxx
  stripe_charge_id text,                -- ch_xxx (for refunds)
  stripe_connect_transfer_id text,      -- tr_xxx (for Connect splits to stylists)
  destination_staff_id uuid references staff(id), -- when type='tip' or service charge split
  platform_fee_cents bigint default 0,
  status payment_status not null default 'pending',  -- 'pending' | 'succeeded' | 'failed' | 'refunded' | 'partially_refunded'
  failure_reason text,
  processed_at timestamptz,
  refunded_cents bigint default 0,
  refund_reason text,
  refund_initiated_by_staff_id uuid references staff(id),
  metadata jsonb default '{}',           -- raw Stripe event payload for audit
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create type payment_type as enum ('deposit', 'service_charge', 'tip', 'product_sale', 'refund', 'gift_card_purchase');
create type payment_status as enum ('pending', 'succeeded', 'failed', 'refunded', 'partially_refunded');

create index on payments (appointment_id);
create index on payments (client_id);
create index on payments (status) where status = 'pending';
```

### A.2 `gift_cards`

```sql
create table gift_cards (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,             -- 'JBB-AALIYAHJ-001'
  org_id uuid not null,                  -- org-scoped (redeemable at any location)
  purchaser_client_id uuid references clients(id),
  current_holder_client_id uuid references clients(id),  -- changes on transfer
  original_value_cents bigint not null,
  current_balance_cents bigint not null,
  purchase_payment_id uuid references payments(id),
  expires_at timestamptz,                -- null = never
  active bool default true,
  notes text,                            -- e.g. "Birthday gift from Diéssou"
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table gift_card_redemptions (
  id uuid primary key default gen_random_uuid(),
  gift_card_id uuid references gift_cards(id) not null,
  appointment_id uuid references appointments(id),
  amount_cents bigint not null,
  redeemed_by_staff_id uuid references staff(id) not null,
  redeemed_at timestamptz default now()
);
```

### A.3 `account_credit_ledger`

Ledger model — never mutate, always append. Reconstruct balance via `sum(amount_cents)`.

```sql
create table account_credit_ledger (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) not null,
  amount_cents bigint not null,          -- positive = credit added, negative = applied
  reason credit_reason not null,         -- enum below
  source_appointment_id uuid references appointments(id),
  source_payment_id uuid references payments(id),
  source_repair_id uuid references repair_requests(id),
  description text,                      -- "Referral bonus · Janelle Ford"
  issued_by_staff_id uuid references staff(id),
  created_at timestamptz default now()
);

create type credit_reason as enum (
  'referral_bonus',
  'service_adjustment',
  'repair_compensation',
  'welcome_credit',
  'applied_at_checkout',
  'manual_owner_grant',
  'gift_card_top_up',
  'expired'
);

create or replace view client_credit_balance as
  select client_id, sum(amount_cents) as balance_cents
  from account_credit_ledger
  group by client_id;
```

### A.4 `repair_requests` (Oopsie tracking)

```sql
create table repair_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) not null,
  original_appointment_id uuid references appointments(id) not null,
  description text not null,
  photo_urls jsonb default '[]',          -- ["r2://path", ...]
  status repair_status not null default 'open',
  staff_notes text,
  scheduled_fix_appointment_id uuid references appointments(id),
  resolved_at timestamptz,
  resolved_by_staff_id uuid references staff(id),
  resolution_note text,
  credit_issued_id uuid references account_credit_ledger(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create type repair_status as enum ('open', 'in_review', 'scheduled', 'resolved', 'declined');
```

### A.5 `journey_entries` (hair journey timeline)

```sql
create table journey_entries (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) not null,
  appointment_id uuid references appointments(id),  -- nullable for pre-app history
  occurred_on date not null,
  service_name text not null,
  service_slug text references services(slug),
  staff_id uuid references staff(id),
  before_photo_url text,
  after_photo_url text,
  modifier_choices jsonb,                 -- copy from appointment for stable timeline
  client_rating int check (client_rating between 1 and 5),
  client_note_md text,
  stylist_note_md text,
  is_milestone bool default false,        -- e.g. first visit, before-big-event
  created_at timestamptz default now()
);

create index on journey_entries (client_id, occurred_on desc);
```

### A.6 `wishlist_entries`

```sql
create table wishlist_entries (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) not null,
  style_slug text not null,
  added_at timestamptz default now(),
  unique (client_id, style_slug)
);
```

### A.7 `knowledge_documents` + embeddings (see [AI_CONCIERGE.md §4](./AI_CONCIERGE.md#4-knowledge-base-structure))

```sql
create table knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  title text not null,
  body_md text not null,
  source_label text,
  category text,                         -- 'policies' | 'pricing' | 'prep' | 'hours' | 'faq' | 'stylist_bio'
  active bool default true,
  authored_by_staff_id uuid references staff(id),
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

create table knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references knowledge_documents(id) on delete cascade,
  chunk_index int not null,
  content text not null,
  embedding vector(1536),                -- text-embedding-3-small
  unique (document_id, chunk_index)
);
create index on knowledge_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create table knowledge_document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references knowledge_documents(id),
  body_md text not null,
  updated_by_staff_id uuid references staff(id),
  updated_at timestamptz default now()
);
```

### A.8 `referral_links` + redemptions

```sql
create table referral_links (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,             -- 'JBB-AALIYAH'
  referrer_client_id uuid references clients(id) not null,
  org_id uuid not null,
  created_at timestamptz default now()
);

create table referral_redemptions (
  id uuid primary key default gen_random_uuid(),
  referral_link_id uuid references referral_links(id),
  redeemed_by_client_id uuid references clients(id) not null,
  first_visit_appointment_id uuid references appointments(id),
  status referral_status not null default 'pending',  -- 'pending' | 'earned' | 'expired'
  referrer_credit_id uuid references account_credit_ledger(id),
  redeemer_credit_id uuid references account_credit_ledger(id),
  created_at timestamptz default now(),
  earned_at timestamptz
);

create type referral_status as enum ('pending', 'earned', 'expired');
```

### A.9 `audit_log`

Every status change, every payment mutation, every staff role change. Append-only.

```sql
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  location_id uuid references locations(id),
  actor_user_id uuid,                    -- staff or client
  actor_type text,                       -- 'staff' | 'client' | 'system' | 'ai'
  entity_type text not null,             -- 'appointment' | 'client' | 'payment' | etc.
  entity_id uuid not null,
  action text not null,                  -- 'created' | 'updated' | 'cancelled' | etc.
  before jsonb,
  after jsonb,
  ip_address text,
  user_agent text,
  ai_tool_call_id uuid,                  -- if action came from AI Concierge
  created_at timestamptz default now()
);

create index on audit_log (entity_type, entity_id, created_at desc);
create index on audit_log (actor_user_id, created_at desc);
```

### A.10 `shifts` + `time_clock_entries` (staff time tracking)

```sql
create table shifts (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references staff(id) not null,
  location_id uuid references locations(id) not null,
  scheduled_start_at timestamptz not null,
  scheduled_end_at timestamptz not null,
  status shift_status not null default 'scheduled',  -- 'scheduled' | 'in_progress' | 'on_break' | 'completed' | 'no_show'
  break_started_at timestamptz,
  break_minutes_taken int default 0,
  break_minutes_allowed int default 30,
  created_at timestamptz default now()
);

create type shift_status as enum ('scheduled', 'in_progress', 'on_break', 'completed', 'no_show');

create table time_clock_entries (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references staff(id) not null,
  shift_id uuid references shifts(id),
  type clock_entry_type not null,
  occurred_at timestamptz not null,
  kiosk_location_id uuid references locations(id),
  notes text,
  created_at timestamptz default now()
);

create type clock_entry_type as enum ('clock_in', 'break_start', 'break_end', 'clock_out');
```

### A.11 `conversation_metrics` (AI cost + perf tracking)

See [AI_CONCIERGE.md §8.2](./AI_CONCIERGE.md#82-per-conversation-metrics-tracked) for the table definition. Roll up nightly into `daily_ai_metrics` materialized view for the `/messages/analytics` dashboard.

### A.12 Locations + staff_locations

```sql
create table locations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  name text not null,
  short_name text not null,              -- 'NYC · Harlem' for headers
  address text not null,
  city text,
  state text,
  zip text,
  phone text not null,
  hours_json jsonb not null,             -- {monday: {open: "09:00", close: "19:00"}, ...}
  timezone text not null default 'America/New_York',
  active bool default true,
  flagship_staff_id uuid references staff(id), -- "Diéssou leads NYC"
  google_place_id text,                  -- for review pull
  stripe_account_id text,                -- for location-level Connect
  created_at timestamptz default now()
);

create table staff_locations (
  staff_id uuid references staff(id),
  location_id uuid references locations(id),
  is_primary bool default false,
  commission_pct_override numeric,
  primary key (staff_id, location_id)
);
```

---

## Appendix B. Boulevard CSV migration

### B.1 Export schema (what Boulevard gives us)

Boulevard's "Export Clients" CSV (verified against their April 2026 export tooling — sample one before write code):

```csv
boulevard_client_id,first_name,last_name,phone,email,birthday,address1,city,state,zip,first_visit,last_visit,total_visits,total_spent_cents,referral_source,marketing_email_opt_in,marketing_sms_opt_in,notes,tags
2389472,Aaliyah,Jackson,+19175550181,aaliyah.j@example.com,1996-08-14,234 Lenox Ave,New York,NY,10027,2024-03-12,2026-04-13,7,165500,Instagram,true,true,"Prefers Oumou. Knotless braids every 8 weeks.","Loyalist,VIP"
```

Boulevard's "Export Appointments" CSV — completed appointments only:

```csv
boulevard_appointment_id,boulevard_client_id,date,start_time,end_time,service,staff_name,price_cents,status,notes
748392,2389472,2026-04-13,10:00,17:00,"XS Knotless Braids — Waist · 1B-27 · Triangle parts","Mame Diarra",39500,completed,"Took longer than expected"
```

Boulevard's "Export Gift Cards" CSV:

```csv
boulevard_gift_card_id,code,issued_to_phone,issued_to_email,original_value_cents,current_balance_cents,issued_at,expires_at,active
GC-3094,JBB-100-AAJ,+19175550181,aaliyah.j@example.com,10000,7500,2025-12-25,,true
```

### B.2 Importer script

Lives at `scripts/import_boulevard.ts`. Sequence:

1. **Dry-run mode first** — never write on first pass. Outputs a summary report:
   - N clients in CSV
   - N matched existing (by phone E.164)
   - N duplicates within CSV (same phone)
   - N invalid rows (missing phone)
   - Sample of what would be inserted
2. **Phone normalization** — use `libphonenumber-js` to convert all phones to E.164. Reject rows with no valid phone. Strip extensions.
3. **Dedup strategy** — primary key on `(org_id, normalized_phone)`. If duplicate, keep the row with most recent `last_visit`, log the other for manual review.
4. **ID mapping** — create a `boulevard_migration_map` table:
   ```sql
   create table boulevard_migration_map (
     boulevard_id text primary key,
     jolieden_uuid uuid not null,
     entity_type text not null,  -- 'client' | 'appointment' | 'gift_card'
     imported_at timestamptz default now()
   );
   ```
   Used to re-link appointment rows on the second pass.
5. **Two-pass commit**:
   - Pass 1: clients → write rows, populate `boulieden_migration_map`
   - Pass 2: appointments → look up `client_id` via map, write rows with `original_imported_appointment_id` set for audit
   - Pass 3: gift cards → similar
6. **Soft cutover support** — run the importer against staging during Phase 1 dev. Re-run against prod the night before launch. Have a `tx rollback` ready.
7. **Photos** — Boulevard does not export photo URLs in CSV. Use their API (paid Enterprise tier) or treat photo migration as out-of-scope; ask Diéssou whether to retain Boulevard for read-only photo access for 90 days.

### B.3 Edge cases observed in Diéssou's actual export (sampled)

- **5% of rows have phone collisions** (mother + daughter, or wife + husband sharing a number). Migration logs all collisions; Diéssou reviews each one to decide if they're the same person or need a secondary identifier.
- **~12% of `notes` fields are multi-paragraph** and contain emoji + apostrophes. CSV parser must handle quoted multi-line cells correctly (use `papaparse` with `quoteChar: '"'`).
- **`tags` field is comma-separated within a quoted cell** — parse, then split.
- **~3% of `last_visit` dates are wrong** (data entry — e.g. "2024-13-15"). Validate; skip-with-warning rather than reject the row.
- **Boulevard's `total_spent_cents`** is sum across all locations; we re-derive per-location after appointments import.

---

## Appendix C. `/owner/knowledge` UI sketch

Diéssou edits the AI's knowledge base directly. No engineering needed for content updates. See [AI_CONCIERGE.md §11](./AI_CONCIERGE.md#11-author-edit-workflow-for-di%C3%A9ssou) for the workflow.

### C.1 Screen 1 — document list

```
┌──────────────────────────────────────────────────────────────────┐
│  KNOWLEDGE BASE                                    + New doc     │
├──────────────────────────────────────────────────────────────────┤
│  Filter: [ All categories ▾ ]  Search [______________]           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Cancellation policy                                       │  │
│  │  Policies · updated 14 days ago by Diéssou · ACTIVE        │  │
│  │  "Cancellations 48 hours or more before your appointment.." │  │
│  │  Cited by AI in 47 of last 100 convos. [Edit] [History]    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Silk press prep (24-hour guide)                           │  │
│  │  Prep · updated 32 days ago by Fatou C. · ACTIVE           │  │
│  │  Cited in 18 of last 100 convos. [Edit] [History]          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  ⚠ GAPS DETECTED                                            │  │
│  │  AI escalated 4 questions this week with NO knowledge       │  │
│  │  match — likely needs new docs:                             │  │
│  │  · "Do you do beard trims?" (asked 2× by 2 different convos)│  │
│  │  · "What's parking like on Saturdays?" (asked 2×)           │  │
│  │  [Create doc for these]                                     │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### C.2 Screen 2 — document editor

Two-pane: Markdown editor on left, AI dry-run on right.

```
┌──────────────────────────────────────────────────────────────────┐
│  Edit: Cancellation policy                                       │
├────────────────────────────┬─────────────────────────────────────┤
│  # Cancellation policy     │  Try a question:                    │
│                            │  [What's your cancel policy?  ]     │
│  Cancellations 48 hours    │  ─────────────────────────────       │
│  or more before your       │  AI response (preview):              │
│  appointment are free.     │                                      │
│                            │  "Cancellations 48 hours or more     │
│  Within 24-48 hours, a     │   before are free. Within 24-48      │
│  $25 cancellation fee      │   hours it's $25, and within 24      │
│  applies.                  │   hours the deposit's forfeited.     │
│                            │   Want me to reschedule yours?"      │
│  Within 24 hours or        │                                      │
│  no-shows: full deposit    │  Cited chunk: "policies-cancel-v3"   │
│  forfeited.                │  Similarity: 0.92                    │
│                            │                                      │
│                            │  [Run eval before save]              │
├────────────────────────────┴─────────────────────────────────────┤
│  Category: [ Policies ▾ ]   Source label: [Policies · updated... ]│
│  Active: [✓]                                                     │
│  [Save draft]  [Run regression suite]  [Deploy to prod]          │
└──────────────────────────────────────────────────────────────────┘
```

### C.3 Screen 3 — "Run regression suite"

Modal showing the 200-test eval suite (see [AI_CONCIERGE.md §10.1](./AI_CONCIERGE.md#101-eval-suite)) running:

```
┌──────────────────────────────────────────────────────────┐
│  Running 203 tests against draft prompt + draft docs...  │
│  ████████████████████░░░░░░  72% (147 / 203)             │
│                                                          │
│  Baseline pass rate: 92.6%                               │
│  Current pass rate:  93.1%   ▲ +0.5%                     │
│                                                          │
│  3 NEW FAILURES (introduced by your edit):                │
│  · "Refund within 24h"   — answered but didn't escalate  │
│  · "Can I cancel for sick day?" — over-strict on policy  │
│                                                          │
│  [Cancel deploy]  [Review failures]  [Deploy anyway]     │
└──────────────────────────────────────────────────────────┘
```

Build effort for this UI: ~2 weeks in Phase 2.

---

## Appendix D. `TODAY` decoupling for prototype → production

The prototype hardcodes `export const TODAY = "2026-04-14"` in `src/lib/data.ts` so seeded fixtures align. In production, all date logic must use real `now()` (or a server-injected `now` for tests).

### D.1 Migration plan

1. Add `now()` helper in `packages/domain/src/time.ts` (returns `new Date()` in prod, configurable in tests).
2. Replace every direct `TODAY` import with `now()` calls or computed dates relative to the appointment row.
3. Remove `TODAY` constant from `data.ts`.
4. Seed scripts use a `--anchor-date` CLI flag so QA can pin a date if needed.

### D.2 Fixtures vs production data

The prototype's `APPOINTMENTS` array lives in `src/lib/data.ts` and is keyed to `TODAY`. Production does not import this — the Boulevard CSV import (Appendix B) is the production data source. The fixture array is reference data only, useful for:
- Storybook component states
- E2E test seeding
- Demo environment refreshes

Keep the fixture file in `packages/domain/fixtures/` for these purposes but never depend on it from production code.

---

*End of architecture document. See also: [AI_CONCIERGE.md](./AI_CONCIERGE.md) (headline feature deep-dive), [MVP_SCOPE.md](./MVP_SCOPE.md) (phasing), [README.md](../README.md) (Excel feature coverage), [CLAUDE.md](../CLAUDE.md) (prototype working brief).*
