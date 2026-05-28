# Jolieden — Product spec (screen-by-screen)

> Every derived/computed value on every screen, with the rule that produces it and the production-replacement note for where the prototype's logic differs from what you should build.
>
> Use this when a developer asks **"how is X calculated?"** without making them read the code first. Pairs with [ARCHITECTURE.md](./ARCHITECTURE.md), [AI_CONCIERGE.md](./AI_CONCIERGE.md), [MVP_SCOPE.md](./MVP_SCOPE.md).

---

## How to read this doc

For every screen, the format is:

- **Route** — Next.js path in the prototype
- **Audience** — who uses this screen
- **Sections** — each visual block on the screen
- **Derived values** — for each, the rule (prototype) and the production note (what to replace it with)

Where the prototype's logic is "good enough for prod with minor tweaks," I say so. Where it's "demo-only and the real product needs a different rule," I flag it explicitly.

---

# Surface 1 — `/me/[clientSlug]` (Client mobile app)

## Home — `/me/[clientSlug]`

The landing tab. Sephora/Ulta-style scroll with hero carousel + photo rows + cards.

### Section: Greeting header

| Element | Rule (prototype) | Production note |
|---|---|---|
| `Hi, {firstName}` | `client.firstName` | Same |
| Eyebrow: `{visits} visits · welcome back` | If `client.visits > 0`, show count; else `"✨ Welcome"` | Replace `client.visits` with `count(appointments WHERE client_id = ? AND status = 'completed')` — single query |

### Section: Hero carousel (3-4 swipeable cards)

Cards composed by `buildHeroCards(client, slug, showBirthday, daysToBday, featuredPhoto)`.

| Card | When it appears | Rule |
|---|---|---|
| Birthday card | `showBirthday && daysToBday !== null` (Naomi only) | Title varies: "Happy birthday 🎉" if `daysToBday === 0`, "1 day to..." if 1, "X days to..." else |
| Featured style card | Always | Hardcoded title "Bora Bora Boho"; backgroundImage = first popular style's photo. **Production: pull the trending style each week from a `featured_styles` admin-curated table.** |
| Refer & earn card | Always | Static copy. **Production: only show if referral program is enabled per location.** |
| AI Concierge card | Always | Links to `/demo/sms`. **Production: links to the salon's SMS number with `sms:+1...` URI.** |

Pagination dots track active card via scroll position: `Math.round(scrollLeft / 312)` (card width 300 + gap 12).

### Section: Upcoming appointment card

| Element | Rule (prototype) | Production note |
|---|---|---|
| Shown? | First row in `appointmentsForClient(slug).filter(a => a.date >= TODAY && a.status !== "completed")` sorted by date asc | Same query with real `now()` |
| "Check in now" vs "Open check-in QR" CTA label | "Check in now" if `appt.date <= TODAY` (today/past); "Open..." if future | Same |
| Birthday flag chip | `(appt.tags || []).includes("Birthday")` | Replace `tags` with the explicit `appointments.birthday_flag` column from §A.2 |

### Section: Birthday hero (Naomi-persona only)

Shown when `clientSlug === CAST.clients.birthday` AND `daysUntilBirthday ≤ 14`. Renders:

- Title varies by `daysAway` (same logic as carousel card)
- Tier label from `tierFor(client)` — see Rewards page below
- **Gift list** built by:
  - Always: "Comp Wash & Blow" + "200 bonus points"
  - Add "Hand-written card from Diéssou" only if `tier === "Platinum" || tier === "Gold"`

**Production note:** the gift list rule is currently hard-coded. Should move to a `birthday_gift_rules` table the owner edits — e.g. `{tier: "Platinum", gifts: [...]}`.

### Section: "Rebook your usual" card (loyalist personas only)

Shown when `clientSlug === CAST.clients.loyalist && lastCompleted exists`. Title is the last completed service name. Links to `/book?as={slug}` which surfaces the rebook banner on `/book`.

**Production note:** rule is "if the client has 3+ completed visits in the same service with the same stylist, treat as a 'usual.'" Today the prototype just uses the most recent completed.

### Section: Cold-start welcome card

Shown when `clientSlug === CAST.clients.coldStart && !lastCompleted`. Static welcome copy + "Browse the gallery" CTA. **Production:** triggered by `client.total_visits == 0`.

### Section: Next-visit recommendation card

Shown when `nextRecommendedVisit(lastCompleted)` returns non-null.

**Computation** (see `nextRecommendedVisit()` in home page):

```typescript
function parseWeeks(freq?: string): number | null {
  // Matches "Every 8 wks" → 8, "Every 12 wks" → 12. Null if unparseable.
  const m = freq?.match(/(\d+)\s*wk/i);
  return m ? parseInt(m[1], 10) : null;
}

function nextRecommendedVisit(lastAppt?: Appointment) {
  if (!lastAppt) return null;
  const weeks = parseWeeks(lastAppt.avgFrequency) || 8;  // default 8 for braids
  const next = new Date(lastAppt.date);
  next.setDate(next.getDate() + weeks * 7);
  if (next < new Date(TODAY)) return null;  // skip if already past
  return { date: prettyDate(next), weeks };
}
```

**Production note:** replace with:
- Read `services.avg_frequency_days` from the catalog (each service has its own cycle — braids 56d, silk press 21d, color 42d)
- Compute `next = last_visit_date + interval`
- Show only if `next > now()` AND `next - now() <= 7 days` (i.e. due soon)
- Hide if client already has an upcoming appointment within the recommended window

### Section: Rewards card

| Element | Rule |
|---|---|
| Points balance | `Math.round(client.totalSpend)` — 1 pt per $1 |
| Tier label | `tierFor(client)` — honors explicit `client.membership` if set, else computes from points (see Tier ladder below) |
| Pts-to-next-tier | `nextTierFor(client).pointsToGo` |
| Progress bar fill | `((nextMin - pointsToGo) / nextMin) * 100`, min 5%, max 100% |

**Tier ladder** (from `src/lib/rewards.ts`):

```typescript
const TIERS = [
  { id: "Bronze",   min: 0    },
  { id: "Silver",   min: 500  },
  { id: "Gold",     min: 1500 },
  { id: "Platinum", min: 3000 },
];
```

**Production:** rule is correct as written. Just back the points calc with `client.lifetime_spend_cents / 100` and persist tier as a column updated by a trigger so we don't recompute on every read.

### Section: "Inspired by your style" photo row

| Element | Rule |
|---|---|
| Title | If `lastCompleted`, `"Like your last {service.toLowerCase()}"`; else `"Picked for you"` |
| Eyebrow | `"✨ Inspired by your style"` |
| Styles shown | `pickInspirations(client, popular)`: if `client.preferredStylistSlug` exists AND `stylesByStylist(slug).length >= 4`, return that stylist's styles; else fall back to `popularStyles()` |
| Count | Up to 6 |

**Production note:** the "prefer the preferred stylist's portfolio" rule is good. But "Like your last X" wording is naive — if last visit was "Knotless Braids" and we surface Silk Press styles, the row is misleading. Should match category too: `WHERE category = lastService.category`.

### Section: Stylist Spotlight card

| Element | Rule |
|---|---|
| Which stylist | If `client.preferredStylistSlug` resolves to a cast stylist, use that. Else rotate: `castStylists[parseInt(TODAY.slice(-2), 10) % castStylists.length]` |
| Avatar | Initials of stylist name in a colored circle (stylist.color hue) |
| Bio | `stylist.bio` from `src/lib/personas.ts` |
| Work strip | First 3 of `stylesByStylist(slug)` |
| CTA | `Book with {firstName}` → `/book?as=` (currently no stylist pre-filter on /book) |

**Production note:** the date-modulo rotation is a prototype hack. Real spotlight should:
- Rotate weekly (Monday) across all stylists at the client's home location
- Skip stylists on vacation (`shifts` table)
- Prefer ones with available capacity in the next 14 days (otherwise the CTA leads to disappointment)

### Section: "Trending this month" photo row

| Element | Rule (prototype) | Production note |
|---|---|---|
| Eyebrow | `"🔥 Most booked at Jolieden"` | — |
| Title | `"Trending this month"` | — |
| Styles shown | `popularStyles()` = `STYLES.filter(s => s.popular)`, hand-curated via the `.popular: true` flag in the gallery seed | **Replace with:** `SELECT s.* FROM styles s JOIN appointments a ON a.modifier_choices->>'style_slug' = s.slug WHERE a.date >= now() - interval '30 days' AND a.status = 'completed' GROUP BY s.id ORDER BY count(*) DESC LIMIT 6`. Rolling 30-day booking count. If <10 bookings in 30 days at this location, fall back to org-wide. |

### Section: Care tip card

Personalized by the category of the last completed service. Uses `tipForService(serviceName, daysSince)` from `src/lib/careTips.ts`.

| Step | Logic |
|---|---|
| 1. Determine days since | `(TODAY - lastAppt.date) / 86400000` rounded |
| 2. Determine category | `categoryFromService(serviceName)` — regex-matches service name against keywords: `"silk press"|"blow"|"press"` → `silk-press`; `"color"|"balayage"|"highlight"` → `color`; etc. Default = `braids` |
| 3. Pick tip | `CARE_TIPS[category][Math.min(tips.length - 1, Math.floor(daysSince / 3))]` — rotates every 3 days |
| 4. Optional product upsell | `tip.product` — appears on some tips, not all |

**Production note:** category mapping via string-matching is fragile. Replace with `services.category` column lookup. The "rotates every 3 days" rule is fine; could also rotate by `daysSince` modulo `tips.length` if you want forever-rotation rather than capping at last tip.

---

## Browse — `/me/[clientSlug]/browse`

### Section: "Your saved styles" tile

Links to `/me/[slug]/wishlist`. Always shown.

### Section: Search affordance

Tappable input → `/book`. Not actually functional in prototype.

**Production note:** wire up to a real client-side search over the styles catalog with substring match on style.name + category.

### Section: "Most booked" carousel

Same logic as `/me` home's "Trending this month" — `popularStyles().slice(0, 6)`. **Production note: same replacement.**

### Section: Categories list

`CATEGORIES` from `src/lib/catalog.ts` — every row links to `/book?category={slug}`.

---

## Bookings list — `/me/[clientSlug]/bookings`

Lists upcoming + past appointments. Order: upcoming first by date asc, then past by date desc.

| Element | Rule |
|---|---|
| Upcoming filter | `appt.date >= TODAY && appt.status !== "completed" && appt.status !== "cancelled"` |
| Past filter | `appt.status === "completed"` |
| Status pill color | Maps `appt.status` → `--status-{statusName}` color token |

**Production note:** add a "cancelled / no-show" tab that surfaces those terminal states for transparency.

---

## Booking detail — `/me/[clientSlug]/bookings/[appointmentId]`

Smart router: renders different content based on `appt.status`. See `BookingDetailCard.tsx`.

| Status | Primary CTA | Notes |
|---|---|---|
| `unconfirmed` | "Confirm appointment" | Implies deposit was held but not charged |
| `confirmed` | "Open check-in QR" | Future visit |
| `arrived` | (stylist view: "Start service") | Client sees a "stylist will be with you" state |
| `active` | (stylist view: "Mark complete") | Client sees the in-service state |
| `completed` | "Rate your visit" + "View receipt" | Completed flow |
| `cancelled`/`noshow` | "Book again" | Recovery |

**Production note:** the prototype router is a straightforward `switch` on status. The replacement should also factor in `appointment.tip_cents` to decide if tipping flow runs on `completed`.

---

## Journey — `/me/[clientSlug]/journey`

Visual timeline. Aaliyah has 6 seeded entries; other personas have empty state.

| Element | Rule |
|---|---|
| Entries shown | `journeyForClient(slug)` sorted by `occurredOn desc` |
| Empty state | "No looks captured yet — your next visit kicks off your journey." Shown when entries.length === 0 |
| Per-entry card | photo + service name + stylist + date + optional note |

**Production note:** the prototype's `journey_entries` are pre-seeded. Real entries are populated by:
- Stylist captures before/after via `/pro/[slug]/capture/[apptId]` → writes to `journey_entries`
- Auto-created on `complete_appointment` RPC if both photo URLs are non-null

---

## Profile — `/me/[clientSlug]/profile`

iOS settings-style screen with grouped sections. Each row is a `Row` component.

### Section: Hero card

| Element | Rule |
|---|---|
| Avatar gradient | HSL based on `client.avatarHue ?? 320` |
| Member-since year | `client.lastVisit ? year(lastVisit) : currentYear` |
| Membership label | `client.membership || "Guest"` |

### Section: Rewards & membership rows

| Row | Value | Links to |
|---|---|---|
| `{tier} member` | `pointsFor(client)` formatted with thousands separator | `/me/{slug}/rewards` |
| Membership tier | — | `/me/{slug}/membership` |
| Refer a friend | `"+100 pts each"` | `/me/{slug}/referrals` |
| Saved styles | — | `/me/{slug}/wishlist` |

### Section: Contact rows

| Row | Value | Notes |
|---|---|---|
| Phone | `client.phone` | Editable in production |
| Email | `client.email` | Editable |
| Pronouns | `"She/Her"` (hardcoded) | **Should pull from `client.pronouns` column** |

### Section: Style preferences rows

| Row | Value | Source |
|---|---|---|
| Preferred stylist | `resolveStylist(client.preferredStylistSlug)?.name` else `"No preference"` | `client.preferred_stylist_id` |
| Hair texture | `"4B / 4C"` (hardcoded) | **Should be `client.accommodations.texture`** |
| Scalp accommodations | `"None"` (hardcoded) | `client.accommodations.scalp` |
| Allergies | `"None on file"` (hardcoded) | `client.accommodations.allergies` |

### Section: Notifications

Three iOS-style toggles. State persists to memory only; not actually wired to a backend.

| Toggle | Default | Persists? |
|---|---|---|
| Appointment reminders | `client.text_opt_in` | **Production: writes to `client.text_opt_in` column** |
| Marketing emails | `client.email_opt_in` | `client.email_opt_in` |
| Birthday surprises | `true` (hardcoded) | Should be a new column `client.birthday_opt_in` |

### Section: Payment rows

| Row | Value | Links to |
|---|---|---|
| Saved card | `"Visa •• 4242"` (hardcoded) | **Production: pull from Stripe customer's saved payment methods** |
| Apple Pay | `"Set up"` (hardcoded) | Should reflect actual setup state from Stripe |
| Gift cards | — | `/me/{slug}/gift-cards` |
| Account credit | — | `/me/{slug}/credit` |

### Section: Forms & consent / Language / Account

- Intake form row → `/me/{slug}/intake`
- **Language toggle** (real): `LanguageToggle` component — reads/writes `locale[clientSlug]` from Zustand store. EN/FR switching applies to MeTabBar labels live.
- Account rows → Privacy, Report a service issue, Help & support, Sign out

---

## Rewards — `/me/[clientSlug]/rewards`

Full screen. Already-computed values match `/me` home's Rewards card.

| Section | Rule |
|---|---|
| Hero | Same tier + points + progress as card |
| Tier ladder | Renders all 4 tiers; active one is highlighted |
| "Your tier perks" | `TIERS.find(t => t.id === tier).perks` — hardcoded array per tier |
| Redemption catalog | `REDEMPTIONS` array in `rewards.ts` — 5 hardcoded options |
| Redemption row enabled? | `points >= redemption.cost` |
| Activity log | `activityFor(client)` — generates 1-4 synthetic entries based on `client.visits` count |

**Production note:**
- Replace synthetic activity log with real `rewards_ledger` table (similar shape to `account_credit_ledger` from Appendix A.3)
- Redemption catalog moves to `redemption_offers` table (per location, can be turned off)
- "Earn more" / refer-a-friend section is static; should pull `client.referral_code` from `referral_links` (Appendix A.8)

---

## Wishlist — `/me/[clientSlug]/wishlist`

Pulls from Zustand `wishlist[clientSlug]` slice (persisted to localStorage). Aaliyah is pre-seeded with 3 saved styles.

| Element | Rule |
|---|---|
| Styles shown | `STYLES.filter(s => wishlist.includes(s.slug))` |
| Empty state | "Nothing saved yet" + "Tap the heart on any style in the gallery to add it here." |

**Production note:** replace store slice with `wishlist_entries` table (Appendix A.6). Heart toggle on style cards calls `POST /api/wishlist/toggle`.

---

## Gift cards — `/me/[clientSlug]/gift-cards`

Per-persona mock data via `balanceFor()` and `historyFor()`. Aaliyah has $75, Naomi has $50, others have $0.

**Production:** swap with real `gift_cards` table (Appendix A.2) query: `SELECT * FROM gift_cards WHERE current_holder_client_id = ? AND active`.

---

## Account credit — `/me/[clientSlug]/credit`

Same pattern: `creditFor(slug)` returns mock. Aaliyah $30, Imani $10, others $0.

**Production:** sum from `account_credit_ledger` view `client_credit_balance`.

---

## Membership — `/me/[clientSlug]/membership`

Tier ladder + perks + lifetime year.

| Element | Rule |
|---|---|
| Hero gradient | `TIER_BG[tier]` — different colors per Bronze/Silver/Gold/Platinum |
| Lifetime since | `client.lastVisit` year, or current year |

**Production:** if Diéssou confirms memberships are dropped (per MVP_SCOPE), this whole screen gets removed from `/me`. Schema retains the column for future-add.

---

## Referrals — `/me/[clientSlug]/referrals`

Per-persona mock. Aaliyah has 300 earned + 100 pending + 4 history entries; others have 0.

**Production:** real `referral_links` + `referral_redemptions` tables. Code = `JBB-{FirstName}{LastInitial}`.

---

## Intake form — `/me/[clientSlug]/intake`

3-step form. All inputs pre-filled with "good enough" defaults. Submit is a no-op in prototype.

**Production:** writes to `client_intake_forms` table (not yet specified — should add to Appendix A). Triggers e-signature flow via DocuSign embed or hand-rolled signature pad.

---

## QR check-in — `/me/[clientSlug]/checkin`

| Element | Rule |
|---|---|
| Which appointment | `appointmentsForClient(slug).filter(a => a.date >= TODAY && a.status in ['confirmed', 'arrived', 'active']).sort(date asc)[0]` |
| QR payload format | `"jolieden:checkin:{appointmentId}:{clientSlug}"` |
| QR image | `api.qrserver.com/v1/create-qr-code/?size=320x320&qzone=2&format=svg&color=431926&bgcolor=fbf7f5&data={encoded}` |
| Empty state | "No upcoming visit on the books" + "Book a visit" CTA |
| Birthday call-out | If `appt.tags.includes("Birthday")` → "Comp Wash & Blow applies automatically at scan" |
| Demo simulate button | Flips `appointments[id].status` to `arrived` via Zustand action |

**Production:** Replace public QR API with self-hosted (`qrcode-generator` lib) so payloads never leave our infra. Payload format is good — short, parseable, includes the salon namespace.

---

## Report a service issue — `/me/[clientSlug]/report-issue`

3-step client form. Picks past completed appointments from `appointmentsForClient(slug).filter(status === "completed").slice(0, 6)`. Uses File API for photo uploads (data URLs, never persisted).

**Production:** POST to `/api/repair/report` (Appendix A.4) which writes a `repair_requests` row, uploads photos to R2, and Twilio-MMS-notifies Diéssou.

---

## "See it on you" try-on — `/me/[clientSlug]/try-on/[styleSlug]`

Three states (`upload` / `processing` / `result`):
- Upload: file picker, or "use my profile photo" → defaults to gradient avatar
- Processing: spinner animation, runs for 2.4s
- Result: style photo with selfie tucked into corner + side-by-side reference

**Production:** the composite is fake (no real ML). Replace with ModiFace, Banuba, or a custom Stable Diffusion pipeline.

---

## Digital receipt — `/me/[clientSlug]/receipts/[appointmentId]`

| Computed value | Rule |
|---|---|
| Subtotal | `appt.price` |
| Tax | `subtotal * 0.08875` rounded to cents (NYC sales tax) |
| Tip | `subtotal * 0.20` rounded (20% locked in prototype) |
| Deposit | `25` (hardcoded $25 flat) |
| Total charged | `subtotal + tax + tip - deposit` |
| Visa •• 4242 | Hardcoded |

**Production:**
- Tax: per-location from `locations.tax_rate` column (not yet in schema — add)
- Tip: actual amount client paid, not auto-computed
- Deposit: from `appointments.deposit_cents` column
- Card: actual payment method via Stripe customer

---

## Client Assistance FAB

Floating "I need…" button. Opens bottom sheet with 6 options. Tap → 700ms simulated send → "A manager is on the way" confirmation.

**Production:** `POST /api/assistance/request` (Appendix A.4) → Expo push to all on-shift staff at the client's location.

---

# Surface 2 — `/pro/[stylistSlug]` (Stylist mobile app)

## Today — `/pro/[stylistSlug]`

Two distinct views based on whether `stylistSlug === CAST.owner` (Diéssou).

### Owner view (Diéssou)

| Section | Rule |
|---|---|
| Top metrics (Appts today / On chair / AI inbox / Revenue today) | Counts from `appointmentsForDate(TODAY)` filtered by status; revenue = sum of `price` where status = `completed` |
| Top 2 AI escalations | First 2 of `ESCALATIONS` array (which is hardcoded in `src/lib/aiInbox.ts`) |
| Weekly goal card | `$18,200 / $22,000` (83%) — hardcoded values |
| Daily goal card | `mockRevenueToday / $3,500` |
| Employee of the Month | "Oumou D." with 42 services + 96% rebook rate — hardcoded |
| Floor map placeholder | Static count of arrived + active |

**Production note:**
- Weekly goal: query `appointments WHERE location_id = ? AND status = 'completed' AND date BETWEEN (week_start, week_end)` summing `final_price_cents`
- Daily goal target: from `locations.daily_revenue_target_cents` (new column)
- Employee of Month: aggregate query over the prior month — `SELECT staff_id, count(*) AS services, AVG(rating) AS avg_rating FROM appointments WHERE status = 'completed' AND date >= now() - interval '30 days' GROUP BY staff_id ORDER BY (services * 0.7 + avg_rating * 100 * 0.3) DESC LIMIT 1`. The weighting (70% volume, 30% quality) should be Diéssou's call.

### Stylist view (Oumou, Fatou, Dieynaba)

| Section | Rule |
|---|---|
| Personal weekly goal | `$3,820 / $4,500` (85%) — hardcoded |
| Personal daily goal | Computed: `myToday.filter(a => a.status === "completed").length / Math.max(myToday.length, 3)` |
| Next-up appointment | First `myToday` row where status is `confirmed` / `arrived` / `active` |
| Today's schedule preview | `myToday.slice(0, 4)` |

**Production:**
- Personal weekly: same query as owner but filtered to `staff_id = me`
- Personal daily: same shape, but target should come from each stylist's `staff.daily_service_target` (new column) or default to a location-wide rule

---

## Schedule — `/pro/[stylistSlug]/schedule`

Day picker (Today / Tomorrow / week) + list of `appointmentsForStylist(slug)` filtered to the picked day. Color-coded by status.

**Production:** just a query. RLS ensures stylists only see their own appointments. No derived values worth noting.

---

## Schedule detail — `/pro/[stylistSlug]/schedule/[appointmentId]`

Smart router (same as client side). Stylist-specific CTAs: "Start service" → flips to `active`; "Mark complete" → flips to `completed`. Plus an "Open before/after capture" link to `/pro/[slug]/capture/[id]`.

---

## Inbox — `/pro/[stylistSlug]/inbox`

AI escalation queue.

| Element | Rule |
|---|---|
| Items shown | `escalationsForStylist(slug)` from `src/lib/aiInbox.ts` — filtered hardcoded list |
| Items shown for owner | All escalations (Diéssou triages anything) |
| Items shown for stylist | Only `escalation.assignedTo === stylistSlug` |

**Production:**
- Query `conversations WHERE ai_state = 'needs_human' AND assigned_staff_id = ?`
- Sort by `last_activity_at desc`
- Real-time updates via `escalations:staff:{my_id}` channel (per ARCHITECTURE §7.1)

---

## Inbox thread — `/pro/[stylistSlug]/inbox/[conversationId]`

Shows the AI's transcript so far + a "Take over" composer. Composer is disabled until takeover is engaged.

**Production:** identical to operator `/messages` ThreadDetail (already designed), but scoped to one assigned conversation.

---

## Capture — `/pro/[stylistSlug]/capture/[appointmentId]`

Two photo upload tiles (Before + After) + service notes textarea. Upload is mock; nothing persists in prototype.

**Production:**
- Before/After tap → Expo Camera → R2 upload → write URLs to `appointments.before_photo_url` / `after_photo_url`
- Notes → save to `appointments.service_notes_md`
- Auto-creates a `journey_entries` row on save

---

## Clients — `/pro/[stylistSlug]/clients`

| Element | Rule |
|---|---|
| Roster | Clients matched to `appointmentsForStylist(slug)` by name string — sorted by `lastVisit desc` |
| Fallback when no matches | Top 8 clients by `totalSpend desc` (so the screen never looks empty in demo) |
| VIP star | `client.tags.includes("VIP")` |

**Production:** real query `SELECT DISTINCT c.* FROM clients c JOIN appointments a ON a.client_id = c.id WHERE a.staff_id = me ORDER BY MAX(a.date) DESC`. Drop the fallback.

---

## Profile — `/pro/[stylistSlug]/profile`

| Section | Rule |
|---|---|
| Earnings · Today | `completedToday.reduce((acc, a) => acc + (a.price ?? 0), 0)` |
| Earnings · MTD | Same sum filtered to `appt.date.startsWith("2026-04")` (hardcoded month) |
| Bookings count | `appointmentsForStylist(slug).length` |

**Production:** `SUM(final_price_cents * commission_pct)` where stylist owns the row. MTD = `date >= date_trunc('month', now())`.

---

# Surface 3 — `/book` (Client booking web)

## Gallery — `/book`

| Section | Rule |
|---|---|
| Hot-start banner | Shows when `?as={slug}` AND client has a `completed` appointment — title pulls last completed service |
| Category chips | `CATEGORIES` array; tapping filters via `?category={slug}` |
| "Most booked" row | `popularStyles().slice(0, 4)` — only shown when no category filter active |
| Grid | If category set: `stylesByCategory(slug)`; else `STYLES` (all) |
| Reviews strip | `GOOGLE_REVIEWS` array (6 hardcoded entries) + `REVIEW_STATS` (4.9 / 287 / 91% 5★) |

**Production:**
- Popular = real 30-day booking count (same as `/me` Trending)
- Reviews: pull from Google Business Profile API; cache 6 hours; show "View all on Google" link
- Stats card: `AVG(rating)` + `COUNT(*)` from Google API

---

## Style detail — `/book/style/[styleSlug]?as={clientSlug}`

| Section | Rule |
|---|---|
| Hero photo | `style.photoUrl` or category-palette gradient fallback |
| Title / category | `style.name` / `style.categorySlug` |
| Modifiers | `service.modifiers` from catalog. Each renders as a chip-row; required ones are flagged |
| Add-ons | `service.addOns` from catalog |
| Live price | `service.basePrice + sum(modifier.priceDelta) + sum(addOn.priceDelta)` |
| Live duration | `service.baseDurationMin + sum(modifier.durationDelta)` |
| "See it on you" CTA | Only shown when `?as={slug}` present, links to `/me/{slug}/try-on/{style.slug}` |

---

## Checkout — `/book/checkout`

| Section | Rule |
|---|---|
| Cart line | Pulls from Zustand `cart` slice |
| Stylist picker | `STAFF` filtered to those who do the service category |
| Time picker | Hardcoded 5 demo slots per day; no real availability check |
| Payment options | 4 hardcoded: Visa, Apple Pay, Klarna 4-pay, Afterpay 4-pay. Klarna/Afterpay split = `line.computedPrice / 4` rounded |
| Confirm | Creates a new `Appointment` via `addAppointment` Zustand action; redirects to `/booking/{newId}` |

**Production:** the time picker is the big rebuild. Use `read_availability` Edge Function (same logic the AI uses) backed by `staff` schedule + existing `appointments`. Payment options come from Stripe Elements; deposit charged via Stripe Connect on Confirm.

---

## Stylist profile — `/book/stylist/[stylistSlug]`

| Section | Rule |
|---|---|
| Hero | Stylist initials + specialty + 4.9 hardcoded rating + 142 reviews |
| Bio | `stylist.bio` |
| Work portfolio | `stylesByStylist(slug)` — variable count |
| Reviews | 3 hardcoded `MOCK_REVIEWS` |
| Book CTA | Links to `/book?stylist={slug}` (no real filter behavior in prototype) |

**Production:** Reviews join `reviews WHERE staff_id = me`. Rating = AVG of those. "Book with" CTA should prefilter the gallery + skip the stylist picker step in checkout.

---

## Waitlist — `/book/waitlist`

Pre-filled form. Service category chips (default braids), preferred stylist (default Oumou), date window (Apr 16 – May 10), time of day (default Afternoons), phone number. Submit is a no-op.

**Production:** writes to `waitlist_entries` table (not yet in schema — should add). Cron job nightly checks for matching openings, sends SMS notification.

---

## Stylists directory — `/book/stylists`

| Element | Rule |
|---|---|
| Cards shown | `STAFF.filter(s => s.specialty || s.role matches stylist/braider)` |
| Per-card rating | "4.9" hardcoded |
| Per-card 3-photo work strip | `stylesByStylist(s.slug).slice(0, 3)` |

---

# Surface 4 — Operator app (key screens)

## Front Desk — `/`

Kanban board. Columns are `appt.status` values: `unconfirmed → confirmed → walkin → arrived → active → completed`.

| Element | Rule |
|---|---|
| Cards in column | `appointmentsForDate(TODAY).filter(a => a.status === column)` |
| Card content | client name, service, time, stylist, status badges (new client / VIP / has message) |
| AI badge | `appt.aiBooked` — small chip in card corner |

**Production:** real-time subscription to `appointments:location:{my_loc}` channel.

---

## Calendar — `/calendar`

Day/week grid by stylist. Each event is a `<AppointmentCard>`. Drag-and-drop rescheduling already wired in prototype (mutates local state).

**Production:** drag → optimistic update + `POST /api/appointment/reschedule` with conflict check.

---

## Messages — `/messages`

| Section | Rule |
|---|---|
| "🚨 Needs you" section | `CONVERSATIONS.filter(c => c.aiState === "needs-you")` |
| "✨ AI handled" section | `CONVERSATIONS.filter(c => c.aiState === "ai-handled" \|\| "ai-replying" \|\| !c.aiState)` |
| Live pulse on row | When `c.aiState === "ai-replying"` |
| Reason chips | Tone-coded per `c.aiReason` (escalation = pending, complaint = rose, auto-booking = confirmed, etc.) |
| Inline booking card | When conversation has a linked appointment AND `aiState === "ai-handled"` — uses `findApptForThread()` to match by id or by client name + `aiBooked` flag |

**Production:**
- Filtering is the same query — just RLS-scoped to user's locations
- Linked appointment: just use `conversations.booking_id` column directly (already in schema)
- Live pulse: subscribe to `conversations:location:{loc}` channel

---

## AI Conversation Analytics — `/messages/analytics`

| Metric | Rule (prototype) | Production |
|---|---|---|
| Total threads | `487` hardcoded | `COUNT(*) FROM conversations WHERE created_at >= now() - 7d` |
| AI resolved | `451` hardcoded | `... AND ai_state IN ('ai_handled', 'closed') AND assigned_staff_id IS NULL` |
| Escalated | `36` hardcoded | `... AND ai_state = 'needs_human'` |
| Avg response | `8s` hardcoded | `AVG(conversation_metrics.ai_first_reply_ms) / 1000` |
| Resolve rate | `aiResolved / total` percentage | Same shape |
| Bookings via AI | `88` hardcoded | `COUNT(*) FROM appointments WHERE ai_booked = true AND created_at >= now() - 7d` |
| Escalation reasons | `ESCALATIONS.reduce(...)` group by `reason` | `SELECT ai_reason, COUNT(*) FROM conversations WHERE ai_state = 'needs_human' AND created_at >= now() - 7d GROUP BY ai_reason` |

**Suggested actions section is hardcoded** in the prototype. In production, derive from:
- Reasons with `count >= 3` over 7d → "create knowledge doc for X"
- High after-hours volume → "auto-response time band review"

---

## Floor view — `/manage/floor`

| Element | Rule (prototype) | Production |
|---|---|---|
| 9-station grid | Hardcoded `STATION_LAYOUT` (`{stylistName, slot}` per station) | Per-location `locations.station_layout jsonb` |
| Per-station appointment | `stationAppts.get(stylistName)` — picks active > arrived > confirmed for that stylist | Real query joined to `shifts` |
| "Needs help" badge | `appt.status === "active" && appt.id.endsWith("5")` — pure demo trick | Trigger from a real `appointment.needs_help` flag set by the Client Assistance FAB |
| Reception / wash bowls / avg wait | Hardcoded `2 walk-ins`, `3 of 4 busy`, `~12 min` | `COUNT(*) WHERE status = 'waiting'`, `... resource_id = ?`, `AVG(arrived_at - created_at)` |

---

## Repairs — `/manage/repairs`

Lists from `REPAIRS` seed array, grouped by `status`. Per-status counts in header. Per-card actions are static.

**Production:** real `repair_requests` table query. Status transitions write to `audit_log`.

---

## Sales Register — `/sales/register`

Existing prototype. Drawer list on left, drawer detail on right.

| Element | Rule |
|---|---|
| Drawer list | `DRAWERS` array from `src/lib/sales.ts` |
| Per-drawer cash sales / refunds / paid-in / etc. | Stored on the drawer fixture |
| Expected total | `drawer.expected` |
| End-of-day variance | `drawer.expected - 12` (hardcoded fake variance) |
| Pay-In / Pay-Out / Count modals | Local React state; no persistence |

**Production:** drawer = `cash_drawers` table. Transactions = `cash_movements` ledger. Variance computed from `count - expected`.

---

# Surface 5 — `/kiosk` (iPad self check-in)

| State | Rule |
|---|---|
| Welcome | Shown by default; two options: Scan QR / Phone number |
| Scan mode | Animated scanning indicator; "Demo · simulate scan" button matches Aaliyah |
| Phone mode | Input → on Continue, `arriveByPhone()` looks up `clients[].phone` matching normalized input |
| Confirm mode (new R3) | Avatar + name + booking id; "Is this you?" / "Not me" buttons |
| Success | Personalized greeting + birthday-gift note |

**Phone match logic:**
```typescript
const normalized = phone.replace(/\D/g, "");
const client = Object.values(clients).find(
  c => c.phone.replace(/\D/g, "") === normalized
);
```

**Production:**
- Real `POST /api/kiosk/checkin` with phone/QR payload
- Looks up via `clients.phone` (already E.164 normalized in DB)
- Flips first applicable appointment to `arrived`
- Sends push to stylist app

---

# Surface 6 — `/demo/sms` (AI SMS simulator)

| Element | Rule |
|---|---|
| Scenarios | 4 hardcoded `SCENARIOS` in `src/lib/smsScenarios.ts`: booking, FAQ, escalation, late |
| Auto-play | Cursor advances by `turn.delay` ms; AI/staff turns trigger typing dots for `turn.typingMs` before bubble lands |
| Scenario picker | Top chip strip; tap to swap script |
| Replay | Appears at end of script |

**Production:** this surface is **demo-only**. Real client conversations happen on the client's native SMS app + the Twilio number; this simulator is for stakeholder review of "what the AI feels like."

---

# Cross-cutting computations

## Persona resolution

`resolveClient(slug)` / `resolveStylist(slug)` in `src/lib/personas.ts`. Returns the matching fixture row or undefined.

**Production:** RLS-scoped `SELECT * FROM clients/staff WHERE slug = ?`. Slug is unique within the org.

## "Active client" — `?as={slug}` query param

Used across `/book` (rebook banner, try-on, post-booking write-back). Prototype just reads `searchParams.as`. **Production: real auth — `?as=` is dropped, the `client_id` comes from the JWT.**

## Birthday detection

```typescript
function daysUntilBirthday(client, today) {
  if (!client.birthdayMonth) return null;
  const day = client.birthdayDay ?? 1;
  // ... computes days until next birthday occurrence
}
```

Shows hero/banner when `result !== null && result <= 14`.

**Production:** same logic, but should be a Postgres computed column for fast filtering: `next_birthday_at`. Birthday-week banner shows when `next_birthday_at - now() <= 14 days`.

## Avatar gradient

`hsl({avatarHue}, 55%, 38%) → hsl({avatarHue + 30}, 60%, 50%)` 135° linear gradient. Hue is `(persona_id * 47) % 360` so it's stable per persona.

**Production:** retain the hue-based gradient as the default-when-no-photo. Once profile photo upload exists, prefer the actual photo.

## Date display formatting

- `formatPretty(date) = "April 13, 2026"` — used on next-visit recommendation
- Booking detail uses raw `appt.date` (`YYYY-MM-DD`) — should be replaced with localized format
- `client.lastVisit.year` parsed as `new Date(lastVisit).getFullYear()`

**Production:** Use `Intl.DateTimeFormat` honoring `client.locale` (when EN/FR toggle exists). Pin timezone to `locations.timezone`.

## TODAY constant

`src/lib/data.ts: export const TODAY = "2026-04-14"` — used to anchor all demo fixtures.

**Production:** see [ARCHITECTURE.md Appendix D](./ARCHITECTURE.md#appendix-d-today-decoupling-for-prototype--production). Replace with real `now()` honoring the location's timezone.

---

# Quick-reference index

For "where does X live?" lookups:

| Concern | File | Function/data |
|---|---|---|
| Service catalog | `src/lib/catalog.ts` | `CATALOG_SERVICES`, `CATEGORIES`, modifiers |
| Photo gallery | `src/lib/gallery.ts` | `STYLES`, `popularStyles()`, `stylesByStylist()`, `stylesByCategory()` |
| Rewards math | `src/lib/rewards.ts` | `TIERS`, `pointsFor()`, `tierFor()`, `nextTierFor()`, `REDEMPTIONS`, `activityFor()` |
| Care tips | `src/lib/careTips.ts` | `CARE_TIPS`, `categoryFromService()`, `tipForService()` |
| AI escalation queue | `src/lib/aiInbox.ts` | `ESCALATIONS`, `reasonLabel()`, `escalationsForStylist()` |
| AI SMS scenarios | `src/lib/smsScenarios.ts` | `SCENARIOS`, `getScenario()` |
| Google reviews mock | `src/lib/reviews.ts` | `GOOGLE_REVIEWS`, `REVIEW_STATS` |
| Locations + multi-tenant | `src/lib/owner.ts` | `LOCATIONS`, `DEFAULT_LOCATION_ID` |
| Personas (cast) | `src/lib/personas.ts` | `CAST`, `resolveClient`, `resolveStylist`, helpers |
| Persistent state | `src/lib/store.ts` | Zustand store + wishlist/locale slices |
| Repair requests | `src/lib/data.ts` (REPAIRS) | `RepairRequest` type + seed |
| Conversations | `src/lib/data.ts` (CONVERSATIONS) | `Conversation`, `aiState`, transcripts |
| Translations (EN/FR) | `src/lib/i18n.ts` | `STRINGS`, `t(key, locale)` |

---

*End of product spec. For backend shape see [ARCHITECTURE.md](./ARCHITECTURE.md); for AI behavior see [AI_CONCIERGE.md](./AI_CONCIERGE.md); for phasing see [MVP_SCOPE.md](./MVP_SCOPE.md).*
