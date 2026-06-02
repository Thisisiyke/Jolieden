# Backend Build Questions

A pre-kickoff question list for Diéssou and Jolieden staff. Generated from the seven HTML surface mockups (`site.html`, `client.html`, `kiosk.html`, `stylist.html`, `owner.html`, `manager.html`, `shoot.html`), the signed MSA / Exhibit A (`jolieden-contract.html`), and the existing `docs/ARCHITECTURE.md`, `docs/AI_CONCIERGE.md`, and `docs/PRODUCT_SPEC.md`.

Goal: every question is concrete enough to answer in a sentence or a checkbox so devs are unblocked when building. Items grouped by topic, prioritised loosely top-to-bottom within each group.

A handful of places where the mockup, contract, and old ARCHITECTURE.md disagree are flagged in **§19 Conflicts**.

---

## 1. Data model — core entities

### 1.1 Client / Influencer

- The mockups switch between "client" and "influencer." Is "Influencer" purely cosmetic, or does it carry data (e.g., follower count, content rights)?
- Required fields at first save: first name, last name, mobile — anything else (email, ZIP, referred-by)?
- Is email required or optional? Many flows imply SMS-first.
- Are children booked under a parent record, or do they get their own row?
- Hard or soft delete? GDPR "right to delete" — do we redact PII and keep the row, or wipe?
- Do we keep a single "merged" client record when two profiles turn out to be the same person (front-desk dedupe)?
- What's the canonical phone format — E.164 with country code, or US-only 10-digit?
- Should we support multiple phones per client (a work line + personal)?
- Are "tags" (e.g., `Tender-headed`, `VIP`, `Brand trip`) an enum we define up front or a free-form tag table the front desk can extend?

### 1.2 Stylist / Braider

- Stylist tiers in the mockups: Apprentice / Stylist / Senior / Master. Are these the only four? Any pay-rate or commission implications per tier we need to model?
- The site.html calls them "Influencer" tiers (Stylist Influencer, Senior Influencer, Master Influencer). Same enum, different label?
- Do stylists belong to exactly one location, or can a stylist work multiple locations?
- Stylist "specialties" (Braids, Color, Silk Press, Natural) — single-select, multi-select, or free text?
- Does every stylist have an Instagram handle / portfolio link in profile? Required or optional?
- Stylist photos / headshots — required for go-live? Where do they live (S3-equivalent)?
- Is there a stylist hierarchy beyond tier (e.g., "lead braider" vs senior)?
- Default working language per stylist (EN / FR / ES) so we can pick the right inbox copy?

### 1.3 Service / Catalog

- Owner > Services & pricing builder has `styling`, `service fee`, `hair fee`. Is the client-shown price always `styling + service fee + hair fee`, or are there other line items (deposit, tax, tip suggestion)?
- The site.html and stylist app both show a different price formula. **Conflict — see §19.**
- "Hair fee" applies when the salon includes hair (French curl, boho curls). Should hair fee be `0` when the client brings own hair, or a discount applied?
- Sizes XS / S / M / L / XL / Jumbo — fixed enum or per-service overridable?
- Lengths (Bob, Shoulder, Mid-back, Waist, Hip, Tailbone, Thigh) — fixed enum or per-service overridable?
- A service can be `specType = 'rows'` or `'part'` — is the dichotomy strict, or could a service need a different spec axis later (e.g., loc count)?
- Service can be turned "on/off" without deletion — soft-disable flag? What about pricing changes — do we version pricing so old appointments keep their priced amount?
- Do we model add-ons (Wash & condition, Edge styling, Beads, Color gloss) as service modifiers, or as their own line items? Many mockups treat them as modifiers, but `manager-modal.html` and the kiosk imply they show as separate ledger entries.

### 1.4 Appointment

- Statuses in the existing prototype: `unconfirmed | confirmed | arrived | active | completed | cancelled | noshow | walkin`. Do we need additional states for the new surfaces (e.g., `prep_pending`, `awaiting_before_photos`, `in_progress`, `oopsie_pending`)?
- The stylist app's 4-stage progress (`Sectioning | Braiding | Finishing | All Done`) — is this its own status track, or just a UX overlay on top of `active`?
- Can a single appointment span two stylists (sectioning by an apprentice, braiding by senior)? Mockup doesn't show but Sarah-Mensah-style "group" + birthday flows suggest it could.
- Group bookings — is one row per person, or a parent + children? Client wizard supports group; need data shape.
- Lifecycle of `walkin` — does it skip `unconfirmed`?
- What's the difference between `arrived` (client checked in) and `active` (in chair)? Are both required, or can we collapse to one?
- Does an appointment have a station-assignment row (station picked at "Ready for client") that's separate from stylist assignment?
- Can a client move between stations during an appointment (e.g., one chair for sectioning, another for braiding)?
- Birthday-flagged appointment — is `is_birthday_appt` a derived flag (date matches client.birthday this week) or stored?

### 1.5 Modifiers / Pricing

- Booking sheet on `site.html` shows: size, length, parting, color, add-ons. Each one carries a `+$N` delta. Are deltas stored per modifier-value or computed per service?
- "First color swatch is no charge" — is "natural black" always the free baseline across every service, or per-service?
- Are length deltas linear (bob -$30, shoulder $0, mid-back +$15, waist +$30, hip +$50) or service-specific?

### 1.6 Soft vs hard delete (the big-picture answer)

- For PII (clients, stylists, employees): soft-delete + tombstone with redaction is safer for legal and analytics. Confirm OK.
- For catalog (services, modifiers): tombstone — old appointments need historical pricing. Confirm.
- For appointments: never hard-delete. `cancelled` / `noshow` is the audit trail. Confirm.

### 1.7 Indices we'd expect to build day-one

- `(client_id, starts_at)` on appointments — for client history.
- `(stylist_id, starts_at)` on appointments — for the stylist app's "Today."
- `(location_id, starts_at, status)` — for the floor map.
- `(starts_at, status)` filtered by `confirmed | arrived | active` — for the waitlist / smart-fill matching.
- Birthday calendar: index on `clients(birthday_month, birthday_day)` so the daily cron is cheap.
- Confirm we should add any others (e.g., for the AI Concierge's "find a slot" search)?

---

## 2. Business rules — money

### 2.1 Deposits

- `site.html` shows a flat **$40 deposit**. `client.html` shows **50% deposit**. **Conflict — which is canonical?** Different per-tier? Per-service-class (long braids need more)?
- Are deposits non-refundable in any case (e.g., < 48 hr cancel), or always credited toward the final balance?
- Does a deposit apply to walk-ins?
- Does the deposit unlock the chair (deferred-capture hold) or get charged immediately?

### 2.2 Cancellation & no-show

- Cancellation copy says "cancel free up to 48 hr before." What happens between 48 hr and the appointment? Deposit forfeited, or charged a fixed fee?
- After the appointment time passes without check-in, when does the appointment auto-flip to `noshow`? 15 min? 30 min? Owner-configurable?
- No-show fee — flat, percentage of service, or deposit forfeit?
- Three no-shows in 12 months — is there a lock-out / require-prepay rule?
- Group bookings: does one person's no-show cancel the whole group or just their slot?

### 2.3 Tipping

- Tipped at checkout via kiosk, on the website after, or both?
- Default tip presets (18 / 20 / 22 / custom)?
- Tip goes 100% to stylist? What if there were two stylists on the appointment?
- Cash tips — captured in any system, or only credit-card tips?
- Tip on pre-tax or post-tax base?

### 2.4 Commission

- Stylist app says "50/50 split on styling price." Confirm: 50% commission, computed off **styling price only** (not service fee, not hair fee, not tip).
- Is the 50% the same across tiers (Apprentice / Stylist / Senior / Master) or does it scale?
- Cash payments — does the stylist take the cash and we deduct from their next direct deposit, or does cash go in the register and we pay them later?
- Refund effects on commission — clawback from next payout, or write-off at the salon level?
- Oopsie repair clause in owner mockup: "repair deducts from the original stylist and transfers to the stylist who fixed it." Confirm — full styling-price deduction, or just labor portion?
- Late fees (the $1/min deduction): does this come off the stylist's pay before or after commission is computed?
- Goal bonuses (Owner > Portal composer): how are these funded? Owner-set, ad-hoc, not tied to a formula?

### 2.5 Refunds & Oopsie

- Who can authorise a refund? Owner only, or managers too? Threshold ($X) above which Owner approval required?
- Oopsie repair: free regardless of cause, or capped (e.g., one free repair per visit)?
- Repair window: 24 hr SLA in the mockup. What's the contractual upper bound — 48 hr? 7 days?
- Does an oopsie repair count toward the original stylist's rebook rate / rating, positively or negatively?

### 2.6 Taxes

- New York sales tax on hair services — currently 4.5%? 8.875% combined? Already applied to client total, or added on top?
- Tax on tips? Service charges? Hair fee?
- Multi-location: Maryland / Atlanta vs Harlem — do tax rules need per-location overrides?
- Are we issuing receipts that itemise tax (probably yes for NY)? Need this on the receipt PDF.

### 2.7 Late fees (stylist-side)

- The portal composer ships with a "$1/minute late" rate. Is that the only rate, or is it owner-configurable per stylist / per tier?
- Late penalty caps: max $X per shift?
- Is there a grace period (first 5 min free)?
- Does the late fee dock the stylist's payout, or only their portion of commission?

### 2.8 Birthday eligibility & comp

- Client `client.html` profile says "Locked after first save — set once so the comp Wash & Blow stays fair." Confirm: birthday is write-once from the client app; only Owner / front desk can correct it after.
- Comp service: Wash & Blow — what is the exact comp? Style, dollar value, time-of-day restriction?
- Window: must be booked within X days of the actual birthday? Mockup says ±48 hr advance notice — is that the day-of-prep cutoff, not the comp window itself?
- One comp per year, redeemable in their birthday month? Or strictly the day itself?
- If a Diamond's birthday falls on a closed day, does it roll to the next open day or expire?

---

## 3. Auth & identity

### 3.1 Client auth

- Phone OTP — Twilio Verify? Twilio SMS + custom OTP? Length, expiry, max attempts?
- Resend cooldown?
- Account creation: phone OTP only, or phone + name + email? Booking-without-account ("guest") — supported?
- If guest booking, can the same phone "claim" the account later (account linking)?
- Session lifetime: 30 days mobile rolling, 24 hours web? Refresh-token strategy?
- Multi-device — Amara can be signed in on iPhone + iPad simultaneously?
- Sign-out everywhere — Owner-initiated for security, or only client-initiated?
- Lost-phone recovery: name + birthday at the front desk = manual override? Audit trail?

### 3.2 Kiosk auth

- Kiosk currently signs in with first + last name typed by the client. Is that really enough? What if two clients share a name? Do we cross-reference today's appointment list to disambiguate, or just trust the first match?
- Kiosk session timeout (auto-sign-out for next client): how long of inactivity?
- "Not you? Sign out" CTA — does it just clear local state, or notify the stylist?
- Should the kiosk be tied to a station (Station 14) so it auto-finds the correct appointment without typing?

### 3.3 Stylist auth

- Stylist app: phone OTP? Email + password? SSO via Apple / Google for app-store sign-in?
- "Clocked in" badge in stylist app: separate from login (you can be logged-in but not clocked-in)? How is clock-in implemented — geofence, kiosk pairing, manual tap?
- Stylist on personal phone vs salon-issued device: any device-pinning required?
- Stylist offboarding: who revokes access, and how quickly do future appointments get reassigned?

### 3.4 Owner / Manager auth

- Owner-only override (Founder access) — are there additional MFA requirements for sensitive screens (refund > $X, deleting a client, opening priority booking)?
- Manager 2FA required at first sign-in?
- Permission boundary: ARCHITECTURE.md lists roles as `owner`, `manager`, `stylist`, `front_desk`, `client`. Are `front_desk` and `manager` actually different in practice, or can we collapse?
- "Head Manager" vs regular manager — is that a real distinction, or just a job title?

### 3.5 Account linking

- A client signs up at the kiosk with name only, then later downloads the app and enters her phone. How do we match?
- Two phone numbers attempt to claim the same name + birthday combo — manual resolve flow at the front desk?
- Stylist becomes a client (gets braids done) — same person, two roles? Single account with `roles = [stylist, client]`?

---

## 4. Multi-tenancy / multi-location

### 4.1 Location model

- Client app's location picker cycles `Harlem → Atlanta → Maryland`. Are those three real or demo? Which exist now, which are planned, which are aspirational?
- A single Postgres + RLS by `location_id` (per old ARCHITECTURE.md) — confirm we're not going multi-DB per location.
- Does each location get its own subdomain (`harlem.joliedensbeautybar.com`) or do we route everything through the main URL with `?loc=` / cookie state?
- Booking site (`site.html`) — does the public website show all locations and let the client pick, or do we deploy a separate site per location?

### 4.2 Cross-location data sharing

- Client database: shared across all locations (so Amara at Harlem can walk into Maryland and stylists see her hair profile)? Or isolated per location?
- Membership tier (`Bronze | Silver | Gold | Diamond`) — earned salon-wide or per-location?
- Points balance: shared or per-location?
- Loyalty perks (priority booking window) — Owner-set globally, or per-location?
- Birthday celebration: redeemable at any location?

### 4.3 Cross-location stylists

- Can a stylist work multiple locations? The model needs to handle a stylist temporarily covering Atlanta for a week.
- If yes — appointment ownership: stylist + location both needed on every appointment?
- Stylist commission across locations: does revenue split per stylist's home location, or per the location where the service happened?

### 4.4 "All locations" mode (per ARCHITECTURE.md §6.4)

- Diéssou's owner view across all locations — needs an aggregate dashboard. Is the current mockup showing only Harlem, with an unbuilt "all locations" toggle?
- Reporting: do KPIs roll up automatically, or does she need to filter?
- Cash drawer per location, or one cross-location register?

### 4.5 Inventory per location

- Inventory (braiding hair packs, beads) — confirmed per-location. Confirm a stylist can request a transfer from another location's stock.

---

## 5. AI Concierge (SMS)

### 5.1 Model selection & versioning

- Production model: `claude-sonnet-4-5` (or whichever is latest at the time of build)? `client.html` currently calls `claude-sonnet-4-20250514` from the browser — confirm we move this server-side and pin a specific version.
- Should we pin the model version (e.g., `claude-sonnet-4-5-20251015`) for stability, or always track latest?
- Eval-before-deploy workflow (ARCHITECTURE.md §11.3) — confirm we adopt this for both prompt changes AND model upgrades.

### 5.2 System prompt scope

- The prompt currently lives in `client.html` for the Style Consultant only. Production AI is the SMS Concierge — different system prompt. Confirm we'll author it together with Diéssou before kickoff.
- Tone constraints currently say "no em dashes, no 'luxury' or 'crown'." Any other words / phrases blacklisted?
- Confirm the AI speaks in first person as "Jolieden" (not "I'm an AI assistant").

### 5.3 Tool calls allowed

- ARCHITECTURE.md / AI_CONCIERGE.md lists: `read_availability`, `commit_booking`, `lookup_client_history`, `search_knowledge_base`, `create_waitlist_entry`, `escalate`. Are these all in scope at M1?
- Can the AI also: refund a deposit, change a stylist on an existing appointment, apply a discount code, mark a client as VIP? **Probable NO across the board** — confirm.
- AI initiated outbound (birthday reminders, no-show recovery): Owner approves a campaign template, then AI sends? Or never autonomous outbound?
- AI sending after-hours: 24/7 with a soft "Diéssou's team responds tomorrow at 9 AM" tag, or auto-mute outside business hours?

### 5.4 Conversation context

- How many turns back does the AI see — last 20 messages, or full thread? Truncation strategy when context fills?
- When a human takes over via the takeover queue, does the AI's prior context get sent to the human as a summary, or do they read the raw thread?
- Conversation handoff back from human → AI: is that ever allowed, or does human takeover end the AI's involvement for that thread?

### 5.5 Escalation triggers

- Hardcoded keyword overrides (already in AI_CONCIERGE.md §5.3): "lawyer," "attorney," "lawsuit," "discrimination" → instant escalate to Owner. Confirm + any additions?
- Sentiment classifier — Haiku per message, or Sonnet's own judgment? Cost trade-off.
- After how many turns without resolution does the AI auto-escalate? 5? 10?

### 5.6 Fallback for outages

- Anthropic API down — what does the client see? "We'll text you back shortly" auto-reply + queue, or full silence?
- Twilio webhook fails — retry policy, dead-letter queue?
- If the AI generates a malformed tool call, what's the recovery? Retry, fall back to text-only, or escalate?

### 5.7 Transcript retention

- How long do we keep SMS transcripts? 1 yr? 3 yr? Indefinite?
- TCPA opt-out: when a client texts STOP, we honour immediately, AI never replies again. Confirm.
- HIPAA-style consideration — client may share medical info (allergies, scalp condition) via SMS. Treated as PII, encrypted at rest. Confirm.

### 5.8 Cost monitoring

- Per-conversation budget cap (ARCHITECTURE.md mentions $0.10/conv): hard cut-off or soft warning?
- Daily salon-wide cost cap: $50/day? $100/day? Who gets the alert when 80% reached?

### 5.9 AI Style Consultant (client.html, the in-app one)

- Currently calls Anthropic API directly from browser with no key. That's a prototype-only setup. Production needs server-side proxy.
- Photo uploads (the optional 3-photo flow): what's the retention? Tied to the client record permanently, or session-only?
- Does the Style Consultant write the recommended styles to the client's wishlist automatically?
- Is the Style Consultant the same model + system prompt as the SMS Concierge, or a separate persona?

---

## 6. Payments

### 6.1 Stripe architecture

- **Stripe Connect with per-stylist accounts**, or a **single salon account** with stylist commission paid via payroll outside Stripe?
- The mockup shows weekly direct deposit and the commission split is internal — strongly suggests **single account, internal payroll**. Confirm.
- If Connect-per-stylist is wanted, who handles 1099 / W2 paperwork — Stripe Connect Express does it, but stylists need to onboard.

### 6.2 Deposit flow

- Stripe `payment_intent` with capture_method = manual? Or immediate capture?
- Hold the deposit until appointment is `confirmed` then capture, or capture upfront and refund if cancelled?
- Saved card on file (`client.html` shows "Visa ending 4242 + Apple Pay") — is this default mode for repeat clients?

### 6.3 Final charge / checkout

- Is final balance charged automatically at "All Done" status, or is it a manual ring-up at the kiosk?
- Tipping captured at checkout — POS terminal flow or app flow?
- Split tender (cash + card) — supported on Day 1?
- Apple Pay / Google Pay support — required for app store launch?

### 6.4 Refund flow

- Refund to original payment method only? Always full refund, or partial supported?
- Refund authorisation gating (who can hit "refund"): manager up to $X, owner above?
- Refund triggers commission clawback automatically — yes. Confirm formula.

### 6.5 Cash register (owner > Register view)

- Confirm: cash register is a separate ledger from Stripe, used for cash tips, cash tendered for service, and pay-outs from drawer (supply runs, bank drops).
- Sign-off model: each manager signs off on their own count. Audit chain. Confirm.
- Short / over: any threshold above which there's an auto-investigation flag? E.g., $50 short = automatic escalation to Owner?
- Cash drops to safe — do they require dual sign-off (counting manager + authorising manager)?
- End of day vs end of shift: do we close one register per day, or per manager handoff?

### 6.6 Tax handling

- Sales tax computed at booking time (frozen) or at checkout (current rate)?
- Tax-exempt clients (rare but possible) — supported?
- Tax remittance reports — what format does the bookkeeper need?

### 6.7 Receipts

- SMS receipt, email receipt, both, neither?
- Printed receipt at the front desk — physical printer integration?
- Receipt format: itemised (styling, service fee, hair fee, tip, tax) or rolled up?

### 6.8 Subscriptions (Jolieden Circle)

- The Circle membership in `client.html` says "Active · renews June 12." Is the Circle a paid subscription (Stripe Subscriptions), a points-based tier, or both?
- Profile mockup shows "Manage, pause, or cancel anytime" — so it's a subscription. What's the price? Monthly or annual?
- What does pausing actually mean for points accrual and perks?
- Failed payment on renewal: grace period, then downgrade?
- Membership comes with "monthly maintenance visit included" — how is the comp service billed (free, $0 ticket, marked `comped`)?

---

## 7. Notifications

### 7.1 SMS (Twilio)

- 10DLC registration: brand registration done already, or do we do it during M1?
- One number per location, or one shared salon number with location routing?
- Outbound types: appointment confirmation, 24-hr reminder, 2-hr reminder, cancellation, deposit charged, birthday wishes — confirm full list.
- Reminder timing: 24 hr + 2 hr fixed, or client-configurable?
- STOP / HELP keywords: standard Twilio compliance.
- Quiet hours: never send SMS between 9 PM and 8 AM client local time. Confirm.

### 7.2 Push notifications

- iOS APNs + Android FCM — Expo Push as the unified layer (per ARCHITECTURE.md)? Confirm.
- Push notification types: appointment status changes, "Stylist is back from break," birthday-window-opens, AI Concierge replied, oopsie response. Confirm full set.
- "Style progress" — does the client get a push when the stylist advances `Sectioning → Braiding`, or is it kiosk-only?
- Bell sound at the kiosk (`kiosk.html` uses Web Audio API) — same sound on staff devices for assistance requests?

### 7.3 Email

- Transactional emails: deposit receipt, weekly stylist payout summary, "you've earned X points" — what's the full list?
- Provider: Postmark? Resend? SendGrid? (ARCHITECTURE.md hasn't picked.)
- Templated emails: who's the designer? Do we need a Diéssou-editable email template UI, or can email templates be hardcoded?

### 7.4 EN / FR / ES localisation

- Stylist portal supports EN/FR/ES (per stylist.html). Are SMS / push / email templates also translated to all three?
- Default language at signup: from device locale? Client-selectable in profile?
- Style consultant in client.html runs in English only — does it also need FR/ES?
- "Translate Please" assistance request (kiosk.html) — does that flag the floor manager to find a translator, or is it the AI translating?

### 7.5 Opt-in / opt-out

- TCPA: explicit opt-in language at signup. Where does this live?
- Can clients opt out of marketing (Circle promos) but keep transactional (appointment reminders)? Granular controls required?

---

## 8. Floor map real-time

### 8.1 Transport

- WebSockets via Supabase Realtime, or polling? Per ARCHITECTURE.md, Realtime — confirm.
- Refresh rate / heartbeat — every 1s? 5s?
- What happens when the floor map view is open but the device goes offline? Stale-data indicator?

### 8.2 Station / chair model

- Stations are numbered 1–30 per the mockup. Is the count per-location, configurable by Owner?
- Each station has a status (`available | occupied | finishing | birthday | attention | break | offline`). Is this derived from the appointment lifecycle, or stored as its own field?
- "Offline" stations — who marks a station offline? Owner / manager only?
- Per-station equipment / wash-basin tags — needed for routing certain services to certain chairs?

### 8.3 "On break" — who writes it?

- The stylist app has a "Start break" button that sets state. Can a manager also mark someone on break (e.g., for safety/medical)?
- Break cap (4 simultaneous, per ARCHITECTURE.md). Hard enforcement: stylist sees "Wait, two more on break already"?
- Break duration: 30 min hardcoded? Configurable?
- After break overrun, who gets pinged?

### 8.4 Concurrency / conflict resolution

- Two managers simultaneously assign the same waitlist client to the same open chair — who wins? Optimistic locking with a "this chair just got booked" toast for the loser?
- Two stylists pick the same station number at "Ready for client" — same question.
- Status transitions: only the appointment's assigned stylist can mark "Mark complete," or any manager?

### 8.5 Floor map → ETA suggestions

- Owner panel shows "Station 14 is running over · Suggested update to the 2:30 client: new start around 3:00." Is this an AI-generated suggestion (Claude) or a deterministic ETA calc?
- Send-button flow: when manager hits "Send update," does the client get an SMS, a push, or both? What's the message template?
- Auto-ETA without manager review — when, if ever?

### 8.6 "Acknowledge" on assistance requests

- Kiosk client taps "Water" → request goes to floor view. Manager hits "Acknowledge." What does Acknowledge do beyond removing it from the open list?
  - SLA timer for "acknowledged but not fulfilled" — yes?
  - Does the client see "On the way" automatically when acknowledged?
  - If no one acknowledges within X minutes, what happens — escalate to owner?
- Audit trail: who acknowledged what, when? (Important for "we never got our water" claims.)

### 8.7 Live break overlay (client kiosk)

- When the stylist starts a break, the kiosk overlay says "Zainab is on a lunch break … back around 2:38." Where does "2:38" come from — `break_start + 30 min` always?
- If the stylist comes back early or late, does the kiosk update in real time? Stale-data semantics?

---

## 9. Inventory, Register, Catalog Shoot

### 9.1 Inventory model

- Mockup shows pre-stretched hair by color + on-hand count + status (`Stocked | Reorder soon | Reorder now`). Thresholds — Owner-set per item or system defaults?
- Auto-deduct on appointment completion: does the system know how many packs Knotless Box uses, or does the stylist log it manually?
- Per-location stock — required. Inter-location transfer flow?
- Suppliers / PO model — needed for M1, or fully manual?
- Beads, cuffs, edge gel, etc. — same inventory table or separate?
- Birthday gifts inventory — separate?

### 9.2 Register (already covered in §6.5)

- See §6 — but one more: does the register support payouts to stylists in cash (rare, but possible)?
- Currency: USD only, ever?

### 9.3 Catalog Shoot (per shoot.html)

- Are we building a "Shoot Operations" tool, or is this purely an internal planning doc?
- If a tool — model needed:
  - Shoot day (date, salon-closed flag, day number 1–5).
  - Style claim (which influencer claimed which style, first-come-first-served).
  - Image release signature capture (legal artifact).
  - Photo upload pipeline → maps to the public booking gallery.
  - Standby list per day.
- Is "Influencer" here the same as "Client" or a separate entity (potentially with content rights / handle)?
- Image release storage — needs to be PDF-stamped, signed, and retrievable for legal purposes. Build with DocuSign or homegrown?
- The shoot files naming: `JOLIEDEN_OCT_[StyleNo]_[Category]_[Angle].jpg` — automated rename pipeline?
- Phase 2 in the contract (§A.6) explicitly says: production logistics out of scope; technical integration only. Confirm what "technical integration" includes (asset pipeline, gallery seeding, release-tracking tool)?

---

## 10. Search / browsing (public site)

### 10.1 Site search

- `site.html` has filter pills (`All looks | Knotless | Box braids | Fulani | …`) but no free-text search. Required for M3, or backlog?
- Sort options: most-booked, newest, price-low-to-high — required at launch?

### 10.2 SEO

- Each style page indexable (`/looks/knotless-box-medium-waist`) so Google can find them?
- OG tags for social sharing? Style cards in iMessage / WhatsApp need a preview image.
- Sitemap: required for Day 1.
- Schema.org markup (LocalBusiness, HairSalon)?

### 10.3 Booking widget embedability

- Boulevard replacement — is the gallery + booking sheet served from `joliedensbeautybar.com` directly, or embedded as an iframe in a Shopify / Squarespace shell?
- If embed, what's the parent platform? CSP / cross-origin implications.

### 10.4 Performance

- Photo gallery currently loads 12+ images from joliedensbeautybar.com's Shopify CDN. For 121-style production catalog, do we use Next.js Image with our own CDN (Cloudflare Images / Cloudinary)?
- Lazy-load / pagination strategy?

---

## 11. Reporting / analytics

### 11.1 Compute strategy

- KPIs in the Owner overview (`weekly revenue`, `register count today`, `utilization`, `active members`, `floor rating`) — live-computed each page load, materialised views, or async batch?
- Suggested split: real-time (floor, current week) live-computed; historical (last month, YoY) from a warehouse.
- Where's the warehouse? Postgres FDW to BigQuery? Just Postgres analytic queries on a read replica? Snowflake?

### 11.2 Specific metrics

- "Floor rating" 4.8 — computed from what? Last 30 days of post-visit reviews? Lifetime?
- "Rebook %" per stylist — within 8 weeks? Within 12?
- "Utilization 77%" — booked-time / available-time? Confirm definition.
- "Reviews this month" / "Response rate 71%" — what's the denominator (clients who had a visit this month and were asked for a review)?

### 11.3 Exports

- Owner needs CSV / Excel export of reports for accountant — yes? Which reports?
- Payroll export (commission summary) — into Wave, QuickBooks, or what?
- Tax report (sales tax owed) — monthly, quarterly?

### 11.4 Birthday ROI tracking

- Owner reports section mentions "birthday ROI tracking." Define: did the birthday-comp service drive a rebook within 30 days? What ratio is the success bar?

### 11.5 Privacy

- Private feedback in Reviews view "Internal only, never shown publicly." Confirm: nothing client-facing on the site even by client ID — stylists see anonymised aggregate only?

---

## 12. Storage & assets

### 12.1 Hair journey photos

- Stylist app captures 4 angles before + 4 angles after — where stored? S3? Supabase Storage? Cloudflare R2?
- Per ARCHITECTURE.md, Supabase Storage. Confirm.
- Lifecycle: kept indefinitely? Migrated to cold storage after 1 yr?
- Resolutions: original + thumbnail + display?
- Can the client see her own hair-journey photos in the app (`client.html` has a Journey tab — yes)? Privacy: only client + her stylist + Owner can see.

### 12.2 Catalog shoot assets (Phase 2)

- See §9.3.
- Probable bucket: `jolieden-public-catalog` (public read) vs `jolieden-private-journey` (RLS-gated).

### 12.3 Stylist portraits / headshots

- Where stored? Public-read (since they show on the public site)?
- Update flow: stylist uploads via app, manager approves?

### 12.4 Inspiration photos uploaded at booking

- Client uploads "Inspiration photos (up to 2)" in the booking wizard. Stored, attached to appointment, deleted after 30 days? Or kept forever in client profile?

### 12.5 Oopsie photos

- Required photo upload when filing an Oopsie. Stored with the appointment, accessible to Owner / manager for review.

### 12.6 Aftercare videos (client.html shows aftercare-with-video flow)

- Are these real videos for production, or placeholder UI? If real, who produces them? Stored on a CDN (Bunny, Mux)?

### 12.7 Image releases (legal docs)

- Phase 2 catalog shoot: every influencer signs an image release. PDF storage + searchable index by influencer.

---

## 13. Security & compliance

### 13.1 PCI

- Confirm: Stripe Elements / Stripe SDK on the client side, server never touches raw card numbers. Goal: PCI-DSS SAQ A.
- Apple Pay / Google Pay flow — same scope?

### 13.2 PII

- All PII fields encrypted at rest (column-level for SSN if we ever store, transparent disk encryption for everything else)?
- PII in logs — Sentry / observability tooling needs `before_send` to strip phone, email, addresses, hair-condition notes.

### 13.3 TCPA (SMS)

- Explicit opt-in on signup ("Yes, send me SMS about my appointments and the Jolieden Circle").
- Separate marketing opt-in vs transactional.
- STOP / HELP keywords honoured.
- Quiet hours (per §7).

### 13.4 GDPR / CCPA right-to-delete

- Self-service in the client app, or front-desk-only?
- Anonymise client row but keep appointment history (we still need the audit chain).
- Data export request: client can download all PII + appointment history as JSON / CSV.

### 13.5 Photo consent (image releases)

- For client hair-journey photos: implicit consent for stylist & owner viewing, but does Jolieden have rights to use them in marketing? Probable NO without explicit opt-in. Confirm.
- Catalog shoot: explicit signed release required (per shoot.html and contract A.6).
- Different consent for: "use my photo in your gallery for clients to see" vs "use in social media marketing."

### 13.6 Employment data

- Stylist portal contains formal notices, late deductions, pay adjustments — PII tied to employment. Retention requirements per state employment law?
- Audit trail: who saw what / when, for HR-relevant interactions.

### 13.7 Minors

- Kids services exist. Special consent flow for under-18? Parent/guardian record linkage?

---

## 14. Operations

### 14.1 Hosting

- Vercel for the Next.js app (per ARCHITECTURE.md). Confirm.
- Supabase for Postgres + Auth + Realtime + Storage. Confirm.
- AWS / Cloudflare for any other services? CDN for images?
- Expo EAS for mobile builds.

### 14.2 Environments

- dev / staging / production — yes. Anything else?
- Per-environment data: production-mirrored staging with PII scrubbed?

### 14.3 Backups

- Postgres point-in-time recovery (Supabase default)? Retention 7 days, 30 days?
- Storage bucket backups (photos): cross-region replication?
- Catastrophe drill: every quarter we restore to a sandbox and verify integrity? Who runs?

### 14.4 Monitoring & error tracking

- Sentry for exceptions? Datadog / Grafana for metrics? Loki / Datadog logs?
- Uptime monitoring (Pingdom, BetterUptime)?

### 14.5 On-call

- Post-acceptance support: 90-day Severity-1 / Severity-2 SLA per contract §7. What's the on-call rotation? Single dev, or team?
- After 90 days, support transitions to separate maintenance agreement — covered in contract.

### 14.6 Feature flags

- Per ARCHITECTURE.md mentions LaunchDarkly-style flags? Or simpler env var toggles?
- Who can flip flags — owner via UI, or engineering only?

### 14.7 Deploy cadence

- CI: GitHub Actions per ARCHITECTURE.md. Branch protection: PR review required for main?
- Deploy to production: Vercel auto from `main`, or behind a manual gate?
- Mobile app store cadence: weekly TestFlight, monthly App Store / Play Store?

---

## 15. Dead ends — UI implies, spec doesn't say

Many UI affordances in the mockups don't have a defined backend behavior. Each needs a short answer.

### 15.1 Kiosk

- **Tap "Refreshment"** → who gets pinged (front desk? stylist?), what does the receiver see, and is there a per-day cap ("one per visit")?
- **Tap "Translate Please"** → does it actually summon a human translator, or open a translation tool the client uses themselves?
- **Tap "Bathroom Break"** → does this pause the appointment timer? Notify the stylist via push?
- **Tap "Phone Charger"** → does the system know which type of charger to bring? (Iphone or Android prompt? Or hardcoded conversation?)
- **Tap "Too Tight or Discomfort"** → who's notified, what's the escalation if no response in N minutes?
- **"Not you? Sign out"** → does this clear all session data, or specifically allow a different client at the same station to sign in?

### 15.2 Owner / Manager floor map

- **Tap a station** → opens modal with details. Can the manager **reassign** the stylist from this modal (drag-drop on floor map)?
- **"Adjust" button on Live ETA panel** → opens a free-text override of the suggested message? Edits the time + message both?
- **"Offer" button on Smart waitlist** → sends an SMS to the waitlist person ("Chair just opened, accept?")? What's the timeout to accept?
- **"Set goal" on weekly booking goal** → does this just edit display, or fan out to staff (e.g., "Goal increased, push more bookings")?

### 15.3 Owner portal composer

- **"Late deduction" preset** → does send-to-portal immediately dock stylist pay, or queue for next payroll?
- **"Formal notice" → "Escalated to Diessou"** — what does this mean in practice? Email Diéssou, or just a flag in her queue?
- **Manager permissions toggles (announce / notes / pay / formal)** — who can flip these? Owner only? Are they per-manager or salon-wide?

### 15.4 Stylist app

- **"Tapped too soon? Step back" on stage progress** — does this undo the stage on the client's view too? Audit trail?
- **"Translate Please" / Translate button in portal feed** — language-switch is whole-feed; is that intentional, or per-item?
- **"I have read and understood" on formal notice** — what's the legal weight? Does it create an HR record? Email-back-to-Diéssou with timestamp?
- **Audio button on appointment briefs ("Playing client brief …")** → currently shows TTS placeholder. Production: pre-generated audio per appointment, or real-time TTS?

### 15.5 Client app

- **"Manage" on upcoming appointment** → opens what? Reschedule UI? Cancel UI? Toast says "Reschedule locks 48 hr before" — what if it's < 48 hr, do they get a "contact us" CTA?
- **"Check in" QR code on appointment** → does the QR encode the appointment ID? Where do we scan it (kiosk camera? phone at desk?)?
- **"Oopsie" submission** — confirms within 24 hr. Who manages the 24-hr SLA? Auto-escalate if unresolved?
- **"Care reminder" → "Book takedown"** — does this just add takedown as an add-on to the next booking, or auto-create a takedown appointment slot?
- **Wishlist** — is this just local state, or synced server-side so stylist can see it at prep time?
- **"Birthday locked"** — confirmed write-once from client. But what if client mistypes (Nov 22 instead of Nov 21)? Front-desk override flow — what's the audit log?

### 15.6 Public site

- **"Need help? Text us"** button — opens the SMS app pre-filled? Or starts a web chat that becomes SMS?
- **"Cherry Cola Knotless · with Aminata D."** — clicking gallery pre-fills stylist; but is Aminata bookable from this view? What if she's fully booked for the next 6 weeks?
- **121 looks claim** — is that real catalog count, or a placeholder? After cutover the count is dynamic.

### 15.7 Catalog shoot tool

- **"Mark claimed" on a style** — does that just hide it for other influencers, or remove from the booking flow entirely?
- **Standby list** — is it FIFO, or owner-curated each day?

---

## 16. AI Style Consultant in `client.html` (separate from SMS)

- Distinct from SMS Concierge — same backend or different?
- Calls Anthropic API directly from browser (key-less, dev mode). Production: server-side proxy with rate limiting + auth.
- The 6-question + 3-photo flow → 3 style recommendations. Backend storage: just the recs (for re-display), or full transcript including the photos?
- Recommendations write to wishlist automatically, or only on user tap?
- Cost cap: how many consultations per client per month before throttling?

---

## 17. Birthday system

- Birthday window defined by what — exactly the day, ±3 days, or the calendar month?
- Gift / champagne fulfillment — tracked in inventory? Manual prep checklist?
- Birthday SMS templates per tier (Standard / Silver / Gold / Diamond): authored by Diéssou, version-controlled?
- "Birthday calendar" in owner mockup shows colors: `Booked | Not booked | VIP not booked`. Auto-outreach to "VIP not booked" 48 hr prior — handled by AI Concierge or front desk?
- Birthdays falling on closed days (Sunday / Monday): roll forward, roll back, or alert?
- Day-of-prep checklist (Sarah M. mockup shows `Gift ready | Station ready | Staff notified | Champagne pending`) — is this auto-generated per booking, or manually maintained?

---

## 18. Catalog Shoot (Phase 2 add-on) — re-call out

Per contract §A.6, Phase 2 is acknowledged but **not in scope** for the base engagement. Technical integration is in scope; production logistics are out. Still, scoping questions:

- Does the M1–M5 work include placeholder image hosting / gallery seeding tools that will receive the shoot output?
- Image release tool: built in M1–M5 or quoted separately?
- Asset pipeline (naming, ingest, gallery binding) — built in M1–M5 or quoted separately?

---

## 19. Conflicts — places sources disagree

| # | Topic | Source A | Source B | Question |
|---|-------|----------|----------|----------|
| 1 | Deposit amount | `site.html`: $40 flat | `client.html`: 50% of total | Which is canonical? |
| 2 | Service pricing display | `site.html`: shows itemised (base + size + length + color + addons) | `client.html`: shows `service fee baked in silently` ("client sees one price") | Is the breakdown shown or hidden? |
| 3 | Stylist tier label | `site.html`: "Aminata D. · Master **Influencer**" | `stylist.html`: "Senior **Braiding Influencer**" | Are tier names plus a specialty suffix the standard, or just the tier? |
| 4 | Locations | `client.html` location picker cycles Harlem / Atlanta / Maryland | Contract & ARCHITECTURE.md: Harlem now, multi-location ready | Are Atlanta and Maryland real day-1, or aspirational? |
| 5 | "Influencer" vs "Client" | All admin mockups: "Influencer" | client.html: "Welcome back, Amara" (uses "client") | Pick one canonical noun for backend; aliases for UI display. |
| 6 | Stylist count | Floor map shows 30 stations + ~23 stylists working | Shoot doc says "35 braiders" | Salon has 30 stations and 35 stylists with rotation? Confirm. |
| 7 | Membership renew | Profile shows "Active · renews June 12" implying paid sub | Owner mockup describes the Circle entirely via points-earned tiers (Bronze 0-500, etc.) | Is the Circle paid + points, points only, or paid with points as a multiplier? |
| 8 | Boulevard staff | CLAUDE.md says don't rename existing staff (Mame Diarra, Frederick Douglass, Naomi K.) | All new mockups use Aminata D., Zainab O., Mariama B., etc. | Are the prototype operator-app staff fictional placeholders, replaced by these in production? |
| 9 | AI model | `client.html` Style Consultant uses `claude-sonnet-4-20250514` | ARCHITECTURE.md is model-agnostic | Lock a specific model + version for production, or always track latest? |
| 10 | Languages | Stylist app: EN/FR/ES (portal) and EN/FR (today view) | AI_CONCIERGE.md: EN/FR day 1, Wolof Phase 3 | Where does Spanish actually fit — staff-app only? client-facing too? |
| 11 | Birthday lock-out | Profile: "Birthday locks after first save" (client app) | No mention in ARCHITECTURE.md | Confirm front desk override flow + audit. |
| 12 | "Brand trip raffle" | Tier table: Diamond 4,000+ pts eligibility | Membership perk list shows it as Diamond-tier benefit | What's the raffle mechanic, and how does the backend implement (manual draw vs random)? |

---

## 20. Misc / catch-all

### 20.1 Time zones

- Salon clock vs client clock: Harlem on ET, Atlanta on ET, Maryland on ET — all eastern. Display in salon-local always?
- Atlanta is ET too, but if a future location is CT or PT, do appointment times follow salon TZ?

### 20.2 Calendar / holidays

- Owner can mark salon-closed days (October catalog shoot week, holidays). Where does this live? Affects booking availability.
- Per-stylist time-off: vacation, sick, training. Does the stylist app support requesting time off, or owner-only?

### 20.3 Front-desk role

- The CLAUDE.md mentions a "front desk" surface (Phase 36 referenced "front-desk → app conversion" + Invite to App SMS flow). Is the front desk a separate UI we still need to build, or is it baked into the Manager view?
- "Naomi K." (operator-app stylist) and "Frederick Douglass" appear in CLAUDE.md. Are they real production staff or prototype placeholders?

### 20.4 Audit log

- Every status change, refund, deposit charge, formal notice, register sign-off — needs an immutable audit log. Single events table, or per-domain (audit.appointments, audit.payments)?
- Retention: 7 yr for tax / employment? Confirm with accountant.

### 20.5 Soft-launch / cutover from Boulevard

- M3 = Boulevard cutover. Customer impact: do we run both systems in parallel for 2 weeks? Forward existing bookings on Boulevard's calendar?
- Historical Boulevard data (per contract A.5): not in scope; separate engagement. Confirm Diéssou's expectation.
- Boulevard customer phone book — exported and imported as client records pre-launch?

### 20.6 Disaster scenarios — how do we degrade gracefully?

- Internet down at the salon — kiosks fall back to what? Stylist app can run offline (cached today schedule)?
- Stripe outage during checkout — manual cash fallback? Hold-and-charge-later?
- Supabase outage — read-only mode? "We're unavailable, please call the salon"?
- Twilio outage — AI Concierge silent? Auto-failover to a "we'll text back tomorrow" auto-responder?

### 20.7 Internationalisation

- Currency: USD only forever, or do we leave space for future Lagos / Dakar locations?
- Date format: US (`Nov 22`) hardcoded, or locale-aware?

### 20.8 Accessibility

- WCAG 2.1 AA for the client mobile app + public site? Stylist app + kiosk?
- Voice-over / screen-reader testing — covered in QA?
- Kiosk: physical accessibility — height of mount? Audio assistance for sight-impaired clients?

### 20.9 Future-proofing

- Walk-ins booked the same day at the kiosk by the front desk — separate flow?
- Gift cards — required for M1, or backlog?
- Referral codes — `100 points each` per Owner mockup; built in M1?

---

## How to use this doc

1. Diéssou + Larysa go through every section, answer or "TBD" each question.
2. The answered version becomes the basis for: data model freeze, system prompt approval, payment provider config, and the staging-environment seed.
3. **Unanswered questions block their respective milestones** — flag them in the M1 kickoff retro.

*Live document. Add new questions inline as the prototype evolves and re-export at sprint boundaries.*
