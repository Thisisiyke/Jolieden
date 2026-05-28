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
            │  ServiceModifier│   ──── ModifierOption
            │  (length, color)│
            └─────────────────┘

   ┌─────────────────┐
   │  Client         │──── ClientNote, Tag, Accommodation, OptIn
   └────────┬────────┘
            │ 1 : N
            ▼
   ┌─────────────────┐    1 : N    ┌─────────────────┐
   │  Appointment    │────────────▶│  AppointmentLine │ ──── Modifier choices
   │  (booking)      │             │  (service + add-ons)
   └────────┬────────┘             └─────────────────┘
            │
            ├──── Status (unconfirmed → ... → completed)
            ├──── Photos (before/after)
            ├──── Payment
            └──── HairJourneyEntry (timeline)

   ┌─────────────────┐
   │  Conversation   │──── Message[] (client + AI + staff turns)
   │  (SMS thread)   │     └─ AiAction (tool calls, escalations)
   └─────────────────┘

   ┌─────────────────┐
   │  RepairRequest  │──── Photos, status, scheduled fix
   │  (oopsie)       │
   └─────────────────┘
```

### 3.2 Core tables (Postgres DDL sketch)

> All tables include `id uuid pk default gen_random_uuid()`, `created_at`, `updated_at`, `location_id uuid fk` for tenancy, and RLS policies.

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

### 4.1 Convention

Single conceptual API consumed by web + mobile.

- **Reads**: PostgREST via Supabase JS SDK (`supabase.from('appointments').select(...)`). Replaces 90% of GET endpoints. RLS handles auth.
- **Writes that touch external systems** (Stripe, Twilio): Edge Functions invoked as RPC. E.g. `supabase.functions.invoke('book_appointment', {body})`. The function:
  1. Validates input
  2. Charges deposit via Stripe
  3. Writes the row
  4. Triggers any side effects (calendar update, SMS confirmation)
  5. Returns the new row
- **Mutations with simple side effects** (status changes, wishlist toggle): Use Supabase's `update()` with RLS — atomic in Postgres.

### 4.2 Key Edge Functions

| Function | Inputs | Side effects |
|---|---|---|
| `book_appointment` | `{client_id, service_id, modifier_choices, addon_ids, staff_id, start_at, payment_method_id}` | Stripe deposit, DB write, Twilio confirmation SMS, calendar push |
| `cancel_appointment` | `{appointment_id, reason}` | Refund logic, SMS, calendar |
| `checkin_appointment` | `{appointment_id}` | DB update, push notification to stylist app |
| `complete_appointment` | `{appointment_id, final_price_cents, tip_cents, addons_used}` | Stripe charge final, payout, journey entry, follow-up scheduled |
| `ai_concierge_webhook` | Twilio inbound SMS payload | Spawns AI worker (see §5) |
| `assistance_request` | `{client_id, type}` | Push to all on-floor staff |
| `report_repair` | `{client_id, original_appt_id, description, photo_urls[]}` | DB write, notify Diéssou via SMS |
| `kiosk_checkin` | `{qr_payload or phone}` | Matches + flips status to `arrived` |
| `stripe_webhook` | Stripe event | Payment status sync |
| `twilio_status_webhook` | Twilio message delivery status | Update message row |

### 4.3 Public endpoints (for marketing site → booking flow)

- `POST /api/book/quote` — no auth, returns price + duration estimate for a configured service
- `POST /api/book/intent` — creates an unconfirmed appointment + Stripe deposit intent
- `POST /api/book/confirm` — finalizes after Stripe handshake

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

```
Twilio Conversations ─┐
                       │  inbound webhook  ┌────────────────────┐
                       └─────────────────▶ │  Edge Function     │
                                           │  ai_concierge      │
                                           └─────────┬──────────┘
                                                     │
                            ┌────────────────────────┼─────────────────────────┐
                            ▼                        ▼                         ▼
                    ┌────────────────┐    ┌────────────────┐         ┌────────────────┐
                    │  Postgres      │    │  Anthropic     │         │  Pinecone /    │
                    │  (history,     │    │  Claude        │         │  pgvector      │
                    │   client       │    │  (tool use)    │         │  (RAG over     │
                    │   profile)     │    │                │         │   salon docs)  │
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

---

## 8. Integrations

### 8.1 Twilio Conversations

- **Why Conversations, not raw SMS**: built-in threading, multi-channel (SMS now, WhatsApp later), agent-handoff primitives ("conversation participant" can be AI or human).
- **Setup**:
  1. Register the Jolieden number with Twilio.
  2. **10DLC registration** for US business SMS (Diéssou must complete the brand vetting; ~$30/mo + per-message rate). This is non-negotiable for US SMS sending at any volume.
  3. Webhook → Edge Function `ai_concierge_webhook`.
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

*End of document. Next artifacts to draft: MVP scope (which Phase-1 features ship Day 1 vs cut), AI Concierge deep-dive (full prompt + tool sequences with worked examples), Boulevard migration runbook.*
