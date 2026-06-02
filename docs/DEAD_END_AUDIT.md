# Dead-End Audit — Diéssou's Artifact

**Purpose:** Catalog every interaction in the 7-surface mockup that *looks* live but isn't — to prevent devs from chasing them as if they're already designed.

**Format per row:** Surface → location → click/interaction → what currently happens → what we believe should happen → category.

**Categories:**
- 🟢 **In scope** — Phase 1 build target. Behavior needs spec, not the existence question.
- 🟡 **Deferred** — Phase 2 / future. Don't build now.
- 🔴 **Spec'd elsewhere** — Already covered by `docs/PRODUCT_SPEC.md`, `docs/ARCHITECTURE.md`, or `docs/AI_CONCIERGE.md` — point devs there.
- ⚪ **TBD by Diéssou** — Question for the questionnaire.

---

## 1. Public Booking Website (`site.html` — added v4)

| Location | Interaction | Current state | Expected | Category |
|---|---|---|---|---|
| Top nav | "Need help? Text us" chip | href="#" | Opens `sms:+1...` deep link OR slides up a Concierge chat sheet | 🟢 |
| Filter bar | All 8 pills (Knotless / Box / Fulani / Silk / Natural set / Kids / Color & gloss) | Visual-only — `filt()` toggles `on` class but doesn't filter the grid | Filter the gallery by category, with smooth fade, ?cat= URL param, SSR-friendly | 🟢 |
| Gallery card | Tap on style card | Opens booking sheet pre-filled with hardcoded style | Open booking sheet with this look's modifier preset + stylist | 🟢 |
| Booking sheet | "1 · Size of braid" — XS/S/M/L | Updates running total via JS math | Server-driven price calc (don't trust client math at checkout) | 🟢 |
| Booking sheet | "2 · Length" — Bob/Shoulder/Mid-back/Waist/Hip | Same — JS only | Same — server-driven | 🟢 |
| Booking sheet | "4 · Color" — 6 swatches | Static color names + price deltas | Catalog-managed; some categories don't have color choice | 🟢 |
| Booking sheet | "5 · Add-ons" — 5 rows | Toggle on/off works locally | Each add-on can also extend duration; conflict rules (e.g., "takedown" only if client had previous Jolieden style) | 🟢 |
| Booking sheet | "6 · Your chair" — 6 stylists shown | Hardcoded list | Filter to stylists qualified for the service + available in window | 🟢 |
| Booking sheet | "7 · Pick a slot" — 6 hardcoded slots | Static buttons | Real-time availability query, day picker for further dates | 🟢 |
| Booking sheet | "8 · Your details" — Name/phone/notes | Pre-filled placeholder values | Validation: phone format, required fields, returning client lookup by phone | 🟢 |
| Booking sheet | "Hold the chair · pay $40 deposit" | Toast, no real charge | Stripe Payment Intent → 3DS handling → on success: appointment.confirmed | 🟢 |
| Sticky filter bar | Sort options | Not present | TBD: sort by price / duration / popularity / soonest? | ⚪ |
| Footer | (646) 555-0100 link | tel: link works | Real number TBD | ⚪ |
| Footer | "@jolieden" Instagram | href="#" | Real social URLs | ⚪ |
| Booking sheet | Service variants like Silk Press shouldn't show "Size of braid" | Always-on for all styles | Modifier groups attached to specific services, hidden when N/A | 🟢 |
| Booking sheet | Birthday week perk surfacing | Not present | If client phone matches a birthday-week record → show "Comp Wash & Blow included" tag | 🟢 |
| Browser | Anonymous session / cart persistence | Not present | localStorage cart so they can browse multiple styles and come back | 🟢 |

---

## 2. Client Companion App (`client.html`)

| Location | Interaction | Current state | Expected | Category |
|---|---|---|---|---|
| Home tab — "Knotless Box Braids" upcoming card | "Check in" button | Static button | Opens kiosk QR / triggers floor map check-in | 🟢 |
| Home tab — "Knotless Box Braids" upcoming card | "Manage" button | Static button | Reschedule / cancel / add-on changes | 🟢 |
| Home tab — "Employee of the Month" carousel | Tap | No handler | Should open stylist profile / portfolio | 🟢 |
| Home tab — "Your birthday is coming" pill | Tap | No handler | Should open birthday-week details / book celebration appointment | 🟢 |
| Home tab — "New styles just dropped" | Tap | No handler | Should open Browse with "New" filter active | 🟢 |
| Home tab — assistance bell location | N/A | Not on home | Confirmed not needed — bell lives on kiosk only | 🔴 |
| Book tab | Browse gallery | Same as site.html — partly stubbed | Same expectations | 🟢 |
| Consultant tab | AI consultant chat | Static UI | Live Anthropic-backed chat; see `docs/AI_CONCIERGE.md` for system prompt; different from SMS Concierge (in-app vs SMS) | 🟢 |
| Journey tab | "1 year ago today" memory | Static text | Triggered when visit anniversary matches a Hair Journey entry | 🟢 |
| Journey tab | Past visit cards | Static | Server-fetched from `hair_journey_entries` | 🟢 |
| Journey tab | "Want it again?" button on memory card | No handler | Pre-fills booking with the past style configuration | 🟢 |
| Wishlist tab | Saved styles | Static placeholder | Server-fetched; star icon on style cards toggles | 🟢 |
| Profile tab | "Your membership" Manage button | Calls `showToast()` | Opens membership management → pause/resume/cancel via Stripe | 🟢 |
| Profile tab | ABOUT YOU / Birthday row (v1) | Toast on tap | Confirmed locked-state messaging, no edit allowed | 🔴 |
| Profile tab | Hair profile — Texture/Length/Scalp/Allergies rows | Static | Editable; updates client record | 🟢 |
| Profile tab | "Meet our stylists" stylist directory | Renders but no detail | Tap → stylist profile screen | 🟢 |
| Profile tab | Payment & card on file | Toast | Stripe-hosted card management | 🟢 |
| Profile tab | VIP early access toggle | Toggle UI only | Persists to client preferences | 🟢 |
| Profile tab | Oopsie row | Toast | Opens Oopsie ticket creation flow | 🟢 |
| Profile tab | Notifications toggle | Toggle UI only | Maps to `client_consents` fields | 🟢 |
| Aftercare screen | Care instructions | Static copy | Triggered automatically 1, 7, 14 days post-service based on service type | 🟢 |
| Header — bell icon | Notifications tray | Not implemented | Push notification history | 🟢 |
| Tab bar | "Browse" vs "Book" — implication | Both exist, unclear separation | Confirm with Diéssou: "Browse" = look catalog, "Book" = booking flow | ⚪ |

---

## 3. Station Kiosk (`kiosk.html`)

| Location | Interaction | Current state | Expected | Category |
|---|---|---|---|---|
| First name + Last name inputs | Submit | Form alerts | Match against `clients` table → if found, mark `appointment.checked_in_at`. If not, walk-in flow. | 🟢 |
| "Demo: stylist on break" toggle | Visible toggle | Demo-only — not in production | Remove for prod | 🔴 |
| Reset button | Visible | Demo-only | Remove for prod | 🔴 |
| Live style progress mirroring | NOT in mockup | Should mirror stylist's progress stepper in real-time | 🟢 |
| Assistance bell | NOT in mockup but referenced in hub | Need to design + build per-station bell with reason picker | 🟢 |
| Birthday celebration full-screen | Referenced ("Birthday celebration · Full-screen moment fires when a birthday client checks in") | Not in mockup | Needs design — animated overlay on check-in for birthday clients | ⚪ |
| Image release signature capture | NOT in mockup | Needed for catalog shoot influencers | ⚪ |
| Re-check (going to bathroom, returning) | NOT in mockup | Behavior TBD | ⚪ |

---

## 4. Stylist App (`stylist.html`)

| Location | Interaction | Current state | Expected | Category |
|---|---|---|---|---|
| Header | EN / FR toggle | Toggle visible | Maps to user's `preferred_language`; UI strings switch via i18n file | 🟢 |
| "Clocked in · Since 8:02 AM" | Static | Clock-in/out via API; geofenced? | 🟢 + ⚪ |
| "Next break: Available" pill | Static | Live state from `breaks` table + break-cap check (4 of 30) | 🟢 |
| Current appointment card | Amara N. with "Birthday" badge | Should be live appointment data | 🟢 |
| 🔊 audio playback icons | Visible but no handler | TTS reads service details aloud — for stylists who don't read English well | 🟢 |
| "AMARA'S STYLE PROGRESS · Live on her screen" | Stepper visible | Tap to advance step → mirrors to kiosk + logs to `service_progress_events` | 🟢 |
| "Start braiding" CTA | Static button | Updates `service_progress.current_step` | 🟢 |
| Next appointment rows (3:30 Halima, 5:00 Treasure) | Static | Live appointment list | 🟢 |
| Today / Capture / Break / Earnings / Portal tabs | Today only shown filled | All 5 tabs need designs + builds | 🟢 |
| Capture tab | NOT implemented | 4-angle photo flow with audio playback of service details | 🟢 |
| Break tab | NOT implemented | Break timer with cap warning + manager request flow | 🟢 |
| Earnings tab | NOT implemented | Per-day, per-week, per-month earnings + commission accrual + tips | 🟢 |
| Portal tab | NOT implemented | Sent items from manager (announcements, pay deductions, bonuses, coaching) | 🟢 |
| AI takeover queue | Mentioned in scope but not in stylist mockup | Stylist sees Concierge escalations for their assigned clients | 🟢 |
| Size & length guide | Mentioned in hub | Not in mockup — what is it? Reference card? Modifier-option encyclopedia? | ⚪ |
| Push notification on next-up | Not visible | When 15 min from next appointment → push | 🟢 |

---

## 5. Owner Admin (`owner.html`)

| Location | Interaction | Current state | Expected | Category |
|---|---|---|---|---|
| Top tabs (Overview / Calendar / Floor map / +) | Click | nav() works | Calendar + Floor map content largely stubbed | 🟢 |
| "Founder access" gold pill | Decoration | Visible role marker — confirm RBAC behavior | 🟢 |
| Weekly booking goal | Editable target, progress bar | "Set goal" button → `alert()` | Persists target; system computes gap-to-goal nightly | 🟢 |
| Revenue this week | Static $48.6k | Materialized view fed from `payments` | 🟢 |
| Register count today | Static $3,240 | Pulled from current `register_session` | 🟢 |
| Utilization 77% | Static | Computed: occupied chair-hours / total chair-hours | 🟢 |
| Active members 312 | Static | Count of `memberships.cancelled_at IS NULL` | 🟢 |
| Calendar tab | Partial | Owner sees all stylists; drag to reschedule; conflict highlighting | 🟢 |
| Floor map tab | Same as Manager but with overrides | Real-time data; force-state options for owner | 🟢 |
| Other admin tabs (Team & spotlight, Membership, Reports, Birthday center, etc.) | Many stubs | See Manager surface for shared ones | 🟢 |
| Reports tab | Placeholder | Need spec: which reports? Revenue / utilization / commission / cohort / NPS? | ⚪ |
| Membership tab | Stub | Spec: editing tiers, perks, pricing? | ⚪ |
| Catalog / services editor | NOT in mockup | Editing services / modifier groups / add-ons / looks | 🟢 |
| Multi-location switcher | NOT in mockup | Owner sees a location dropdown when 2+ locations active | 🟢 |
| Founder-only override (refund > $500, birthday lock override, stylist termination) | NOT in mockup | Requires step-up auth + audit log entry | 🟢 |

---

## 6. Manager Admin (`manager.html`)

| Location | Interaction | Current state | Expected | Category |
|---|---|---|---|---|
| Sidebar — Calendar | Stub | Day/week grid with drag-to-reschedule | 🟢 |
| Sidebar — Floor map | Renders | Real-time station state from `station_states`; tap a station → action sheet | 🟢 |
| Sidebar — Birthday center | Stub | 48h advance notice list + day-of prep checklist | 🟢 |
| Sidebar — Concierge | v3 — fully rendered | Per-thread message persistence, AI/human turns, takeover flow | 🔴 + ⚪ |
| Sidebar — Oopsie repair | Renders queue with red "2" pip | "Assess" button → `alert()`. Real flow: assess photos / set repair pricing / assign stylist | 🟢 |
| Sidebar — Team & spotlight | Static stylist directory | Edit roster, set tiers, manage Employee of the Month | 🟢 |
| Sidebar — Daily Brief | Composer + history visible | Posting + delivery to stylists' Portal tab | 🟢 |
| Sidebar — Stylist Portal | Composer for sending to stylists | "Send" → `sendPortalItem()` is alert | Send pay adjustments, bonuses, coaching notes, announcements; logs to `portal_items` (new table — add to data model) | 🟢 |
| Sidebar — Register | Detailed cash drawer UI | Submit count → `submitCount()` updates `register_sessions`; reconcile variance | 🟢 |
| Sidebar — Clients | v2 — App column added | Full client table; search, filters, "Invite to app" | 🔴 + 🟢 |
| Sidebar — Ratings | Stub | Aggregate per-stylist; flag low ratings | 🟢 |
| Sidebar — Inventory | Stub | Stock counts, reorder thresholds, movements | 🟢 |
| Sidebar — Services & pricing | Stub for managers | Maybe owner-only — confirm RBAC | ⚪ |
| Floor map — station tap | Cards have `cursor:pointer` but openModal isn't wired for live state | Station details modal w/ state override, assistance request resolve | 🟢 |
| Floor map — "Live ETA" panel | Mockup shows stuck appointment + "Adjust / Send update" | Send rebalance proposal to affected client | 🟢 |
| Floor map — "Smart waitlist" | Renders waitlist names | Offer + accept flow for filling gaps | 🟢 |
| Assistance requests panel | "Acknowledge" buttons | Mark `acknowledged_at`; trigger floor router | 🟢 |
| Live update toggle | "Live" indicator | Confirm: websocket subscription? polling interval? | ⚪ |
| Manager handoff at shift end | NOT in mockup | Manager → Manager handoff (cash drawer count, open Oopsies, etc.) | ⚪ |

---

## 7. Catalog Shoot (`shoot.html`)

| Location | Interaction | Current state | Expected | Category |
|---|---|---|---|---|
| All content | Marketing-style explainer | No interactive elements at all | Phase 2 add-on; if engaged: signup form, slot calendar, image-release intake, asset upload, look-mapping | 🟡 |
| "Influencer claims a style" | Described in copy | Need: live list of available looks, claim-on-tap, send confirmation SMS | 🟡 |
| "5-day standby waitlist" | Mentioned | Need: backfill flow when an influencer drops | 🟡 |
| "Photographed for the app" | Mentioned | Need: photographer upload portal → review → publish to gallery | 🟡 |
| Image release signing | Mentioned | At kiosk before chair; signature captured | 🟡 |

---

## 8. Across all surfaces — global

| Topic | Current state in artifact | Needs spec |
|---|---|---|
| Auth — login screen | NOT in any surface | Phone OTP entry, code verification, name + email collection, success | 🟢 |
| Onboarding — first launch | Not represented in her artifact (browse-first per P32) | Confirm: does Diéssou agree that client app is logged-in but anonymous browsing on `site.html` is the wedge? | ⚪ |
| Sign-out | NOT shown | Standard | 🟢 |
| Network error / offline | Not represented | Standard | 🟢 |
| Loading skeletons | Not represented | Standard | 🟢 |
| Empty states | Sometimes (e.g., Concierge "no threads in filter") | Confirm each list view | 🟢 |
| Push notification permission prompt | Not shown | Per Apple/Google best practice — show priming first | 🟢 |
| SMS opt-in interstitial | Not shown | Required at account creation + at first SMS send | 🟢 |
| Cookie / data privacy consent on site | NOT shown | Required for booking site (GDPR/CCPA) | 🟢 |
| Accessibility — keyboard nav | Not tested | Mandatory for site.html + admin surfaces | 🟢 |
| Accessibility — screen reader labels | Not annotated | Add aria-labels to icon-only buttons | 🟢 |
| Animation reduce-motion | Not handled | Honor `prefers-reduced-motion` | 🟢 |
| Print stylesheets (receipts) | Not shown | Receipts print or email; format TBD | 🟢 |
| Multi-language strings (EN/FR) | EN/FR toggle on stylist app only | Confirm scope: stylist only, or everywhere? | ⚪ |
| Booking confirmation email | Not shown | Standard transactional email + SMS | 🟢 |
| 24h reminder SMS | Not shown | Configurable cadence | 🟢 |
| Lost-and-found inventory | Not shown | Add simple lost-found table for Concierge AI to query | ⚪ |
| Birthday week boundaries | Mentioned but undefined | When does birthday week start/end (3 days before–3 after?) | ⚪ |
| Tipping flow | NOT shown | At checkout: tip %, custom, no tip | 🟢 |
| Receipts | NOT shown | View / download / email | 🟢 |
| Privacy / Terms pages | Linked but blank | Standard legal copy | 🟢 |
| Operator login (Diéssou vs Manager) | NOT shown | Phone OTP + step-up for owner-only actions | 🟢 |

---

## 9. Summary counts

| Category | Approx. count |
|---|---|
| 🟢 In scope — needs spec only | ~85 |
| 🟡 Deferred (Phase 2) | ~6 |
| 🔴 Spec'd elsewhere | ~12 |
| ⚪ TBD by Diéssou | ~22 (fed into questionnaire) |
