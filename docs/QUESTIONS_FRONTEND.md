# Frontend Build Questions

> Pre-kickoff questionnaire for **Jolieden Beauty Bar** (KufGroup × Jolieden MSA, June 15, 2026). Compiled from a read of all seven surface mockups (`site.html`, `client.html`, `kiosk.html`, `stylist.html`, `owner.html`, `manager.html`, `shoot.html`), Exhibit A of the contract, and `docs/ARCHITECTURE.md` / `docs/PRODUCT_SPEC.md`. Goal: surface every yes/no decision the product/design team needs to make before the dev team starts cutting tickets.

Each surface has its own H2. Categories under each surface group questions by **states**, **animations**, **responsive**, **accessibility**, **errors / edge cases**, **forms / validation**, **i18n**, **reuse**, **platform**, **dead ends**, and **conflicts**. Skip categories that don't apply.

---

## Cross-cutting (applies to every surface)

### Design system / component reuse

- Is there a single design-token spec, or do we extract palette + type from the seven mockups manually? The `--clay`, `--ochre`, `--espresso`, `--cream` palette appears in every mockup but the contract doesn't reference a brand book.
- Do all seven surfaces share **one** typography stack (Fraunces serif + Hanken Grotesk sans), or does the operator console use a different sans for density?
- Brand-token conflict: the existing prototype's `docs/ARCHITECTURE.md` calls the primary `--brand #431926` (deep burgundy). Diéssou's new mockups use `--clay #A8623C` and `--espresso #2C241D`. Which is correct for production?
- Should we adopt **shadcn/ui** (as `ARCHITECTURE.md §2` mandates) or hand-roll primitives that match the mockup's exact look? The mockups are hand-rolled.
- Shared components we'd centralize: `Sheet`, `Chip`, `Toggle`, `StatusChip`, `Avatar`, `TierBadge`, `MoneyDisplay`, `ProgressTracker`, `StylistCard`, `EmptyState`. Approve this list?
- Logo / wordmark: the "JOLIEDEN" mark with italic "Beauty Bar" subtitle — is there a vector SVG file, or do we typeset it in Fraunces? Any minimum-size rules?

### Accessibility (WCAG 2.1 AA baseline)

- Target compliance level: WCAG 2.1 **AA** across all surfaces, or stricter (AAA) on any specific surface?
- All clay/cream/ochre combinations need a contrast audit — clay (`#A8623C`) on cream is roughly 4.0:1, borderline AA for body text. OK to bump body text to espresso and reserve clay for large headings and accents?
- Should we honor `prefers-reduced-motion` and disable the bell-swing, orb pulse, fade-in screen transitions, and aftercare-banner pulse?
- Keyboard navigation: which surfaces are required to be fully keyboard-traversable? (Stylist app + Kiosk are touch-only physical devices, so probably exempt.)
- Are screen-reader live regions required for the kiosk break banner, stylist progress stepper, owner-floor "Assistance requests" feed?
- Touch-target minimum: confirm 44×44pt minimum on iOS and 48dp on Android per platform HIG. Several mockup buttons are smaller.

### Internationalization

- Exhibit A says EN/FR toggle ships on the **Stylist App** only. But the stylist portal shows EN/FR/ES, and the kiosk Assistance "Translate Please" mentions EN/FR/ES. Which languages do we actually localize, on which surfaces?
- Is the **client app** localized? The mockup is English-only but Diéssou's clientele is partially francophone.
- Is the **public booking website** localized? French-speaking walk-in clients arriving via Google may need it.
- Are the **owner / manager admin** consoles English-only?
- TTS for the stylist Portal "Listen" button — the mockup uses browser `speechSynthesis` as a placeholder. Confirm we ship **ElevenLabs** (recommended in the code comments) or a different vendor?
- Where do translation strings live — `next-intl`, a JSON file per locale, or a CMS like Lokalise / Phrase? Who owns the translations (Diéssou's team or a paid translator)?
- Number, date, time, and currency formatting — locale-aware (`Intl.NumberFormat`) for all locales, including the FR comma decimal separator?
- Pluralization rules (e.g., "1 visit" vs "2 visits") — handled via ICU MessageFormat, or hardcoded English plural forms?

### Error & network handling (cross-surface)

- Offline behavior: which surfaces must work offline / degrade gracefully? Specifically kiosk (no internet → can it still capture the assistance bell?) and stylist app (capturing 4 angles in a dead zone)?
- Should mutations be queued and retried, or is "must be online" acceptable for v1?
- Network-failure UI: do we want a standard global toast ("Connection lost — retrying"), a banner, or per-component error states?
- Slow-network strategy: skeleton loaders vs. spinners vs. optimistic UI. The prototype uses optimistic inserts for comments (`P37`). Apply same pattern site-wide?
- Image loading: gallery images are CDN-hosted from `joliedensbeautybar.com`. Use `next/image` with blur placeholders? CDN provider in production?
- 404 / 500 / maintenance pages — need branded versions for each surface?

### Auth & identity

- How does a client log into the **client app**? Phone-OTP per Exhibit A — confirm Twilio Verify, or another OTP provider?
- Is there a "forgot phone number" recovery? What if a client changes carriers / SIMs?
- Biometric (FaceID/TouchID) re-auth on mobile after first login? Required or nice-to-have?
- Stylist app — same phone-OTP, or manager-issued credentials?
- Kiosk — name-only sign-in is by design (no lookup). What's the fallback if two clients share a name at the same time?
- Owner vs Manager role gating — the owner.html uses `data-role="owner"` to hide sections. Is this a single login that toggles role, or are there separate user accounts with role on the user record?
- Does **Diéssou** ever use the manager app, or only the owner console?
- Multi-tenancy: contract says "multi-location ready." Is location selected at login (like Square), per-URL subdomain, or per-account?

### Analytics / observability

- Which events do we instrument (booking funnel, gallery taps, AI takeover acceptance, assistance bell taps, kiosk session length)?
- Tool: PostHog, Mixpanel, Amplitude, or Vercel Web Analytics + custom?
- Error monitoring: Sentry on all surfaces? Real User Monitoring on the public site?

---

## Surface 1 · Public Booking Website (`site.html`)

### Component states

- The 8-step booking sheet shows defaults pre-filled. What's the **empty / nothing-selected** state for each step — does the CTA stay disabled, or do we ship with sensible defaults like the prototype?
- "From $280" pricing on the gallery cards — what does the price show when modifiers move it down (e.g., XS −$40)? Always show **from** the lowest, never the configured live total, on the gallery card?
- A style with no available slots in the next 14 days — how does the gallery card present? Greyed? Hidden? "Waitlist" badge?
- What if a stylist is fully booked: do we still let the user pick that stylist and then show "no slots," or filter the stylist grid?
- Filter pills counts (`121`, `34`, `22`) — are these live counts from the API or hand-curated? What if a category goes to zero?
- "Honey Ombré · Fulani" is tagged "Most loved" — what's the rule that drives this tag (top N this month, manual editorial pick)?
- "New" tag — auto-applied for X days after a Style is published, or manual?
- The success toast "Chair held — confirmation texted to (646) 555-0123 💛" — what's the post-booking screen for users who want a receipt? Email confirmation immediately after? A booking-detail page they can return to?
- What happens after the toast disappears — does the sheet close completely, or fall back to the gallery? Should we route to a `/book/confirmed/[id]` page so the user can refresh and still see it?

### Animations & transitions

- Sheet open/close: the mockup uses a 0.35s slide. Specify exact easing — `cubic-bezier(.2,.7,.3,1)` per the CSS, or use platform standard?
- Gallery card hover: `translateY(-3px)` + shadow on desktop only. Disable for touch devices to avoid sticky-hover?
- Filter scroll behavior: should the active pill scroll into view when tapped? On mobile, should swiping the filter strip be sticky horizontally while the page scrolls?
- Mobile sheet: drag-to-dismiss via the handle? Currently the handle is decorative.

### Responsive behavior

- Breakpoints used in `site.html`: 480, 560, 640. Are these the canonical breakpoints we ship, or do we conform to Tailwind defaults (sm 640, md 768, lg 1024, xl 1280)?
- Mobile sheet: bottom sheet (`translateY`) vs desktop side sheet (`translateX`) toggle at 560px. Confirm threshold?
- Does the gallery support a 2-column layout on phones (currently `auto-fill,minmax(240px,1fr)` would give 1 column at 380px)?
- iPad portrait / landscape: any special treatment, or just "wider mobile"?

### Accessibility

- Sheet should trap focus when open. When closed, where does focus return?
- Scrim click closes the sheet — also `Escape` key?
- Each gallery card is a `div` with `onclick`. Should we use `<button>` or add `role="button"`, `tabindex`, and keyboard handlers?
- Add-on rows are clickable `div`s — same question.
- Color swatches: how does a screen reader announce "Cherry Cola +$35"? `aria-label` per swatch?
- The "Honey Ombré · Fulani" italic emphasis is decorative — should we wrap it in `<em>` semantically or just visually?

### Errors & edge cases

- Deposit fails (declined card, network error during Stripe call) — what's the user message and recovery path? Does the chair release immediately?
- Race condition: client A and client B both pick the 11:00a slot simultaneously. Who wins, and what does the loser see?
- Double-tap "Confirm" — debounce / disable button after first tap?
- User refreshes mid-booking — does the sheet state persist, or do they start over?
- Phone number validation — US-only `(646) 555-0123`, or international with libphonenumber?
- What if the user enters their existing client account's phone — do we recognize and auto-fill their name + preferences?
- Cancellation policy: "cancel free up to 48 hr before" — does the booking sheet show this on the confirmation? What happens at 47 hours?

### Forms / validation

- First name / last name — required? Length min/max?
- Phone — format-as-you-type, or accept any and normalize? Mask `(___) ___-____` or international `+1`?
- "Anything we should know" — optional. Character limit?
- Validation timing — on blur, on submit, or both? Inline errors below each field, or summary at top of sheet?

### Form factors / SEO

- Public site is SEO-critical (Boulevard cutover). What's the page structure for the gallery — single SPA route or per-style URL (`/styles/cherry-cola-knotless`) for indexability?
- Does each style get its own page with Open Graph metadata? (Implied by ARCHITECTURE.md but not shown.)
- Schema.org markup — `LocalBusiness` + `HairSalon`? `Service` per gallery item with `priceRange`?

### Dead ends

- Nav-right "Need help? Text us" — does this open `sms:` link or do nothing in the mockup?
- "@jolieden" Instagram link in footer — confirm Instagram handle.
- Phone number `(646) 555-0100` — what's the real number?
- Map link / directions on "2510 Lenox Ave, Harlem" — required?
- Group booking flow (referenced in the client app but not in `site.html`) — does the public site support it, or is group only via the app?

### Conflicts

- `site.html` shows **deposit-only** ("$40 deposit") flow. `client.html` shows **50% deposit at booking, remaining at checkout**. Which is the production rule for new bookings?
- `PRODUCT_SPEC.md` references styles with "from" pricing that's already inclusive of a service fee, but the owner services panel adds the fee separately and shows the stylist-facing split. Which pricing model does the public site display?

---

## Surface 2 · Client Companion App (`client.html`)

### Component states

- Home banners (birthday, VIP) — when do they appear/disappear? Birthday banner: how many days before/after? Always visible during birthday month?
- "Live break banner" (toggled by the "Enter the chair" demo button) — what triggers this in production? Stylist hits "Start break" in their app and the kiosk + client app pick it up simultaneously?
- "Care reminder · Time for a takedown" card — driven by what rule? X weeks since last install? Booked manually by stylist?
- "Aftercare" entry only appears `hadVisit=true` — confirmed rule: after a service is marked **complete** in the stylist app. How long does aftercare stay accessible? Forever, or until next visit?
- Wishlist empty state is implemented. Booking flow empty states (no upcoming appointment) — not shown. Spec please.
- Journey timeline — what does it look like for a brand-new client (0 visits)? The "1 year ago today" memory card needs at least 12 months of history; what's the cold-start UI?
- "Most loved" / "Featured styles" — server-driven, or hardcoded? What if user has already saved them all?
- Style Consultant orb-loading state — has a fallback error UI (`cerr` class). Specify timeout (currently no client timeout on the `fetch`).
- Style Consultant — what if the user denies camera permission for the photo upload? Skip photos gracefully?
- "Memory" card ("1 year ago today") — what if no visit happened that day a year ago? Hide the card entirely?

### Animations & transitions

- Screen change animation: `fade` 0.42s with translateY. Confirm.
- Aftercare entry banner has `abpulse` 2.6s glow loop — should this stop after first viewing to avoid distraction?
- Style Consultant orb: 3-dot bouncing animation. Confirm duration / count.
- Toast: 2.6s display, no swipe-to-dismiss. Add swipe?
- Floating help (FAB) bell: pulse ring. Confirm.
- Live break banner `lbar` animates 1%/sec width fill — what's the real source of truth (stylist's break timer)?

### Responsive behavior

- Mobile app is phone-only. Tablet behavior — same single-column or two-column?
- "Locked viewport" per the prototype CLAUDE.md — for the production mobile app, does it lock at 390×844 (iPhone 14) or render full-screen on every device?
- Landscape: support it or lock to portrait?

### Accessibility

- Bottom-nav 5 items — each has icon + 9.5px label. Labels are very small, fail readability. Bump to 11px or larger?
- VoiceOver: should each style card announce "Knotless Box, starting at $245, saved to wishlist"?
- Heart toggle button — currently `onclick` on a `div`. Needs `<button>`.
- Style Consultant question options use radio-like behavior but the markup is `div` not `<input type="radio">`. Need proper semantics for screen readers.
- Photo upload (`<input type="file">`) — does it work with screen readers? Need labels.
- Color swatches: the "Natural Black" / "Honey Ombré" swatches are small (38px). Are they accessible color picks via VoiceOver?
- Dark backgrounds (Points card, Aftercare hero, Spotlight) — contrast on cream-on-espresso text needs check.

### Errors & edge cases

- Style Consultant Claude call fails (rate-limit, network) — currently shows `cerr` block. Should it offer "Try again" or "Browse the gallery instead"?
- Style Consultant photo upload — file too large (>10MB)? Wrong format (HEIC)? Multiple files in one slot?
- Booking wizard abandoned mid-flow — save draft and restore, or always reset?
- Wishlist sync — if the user removes a wishlist item on another device, does this app update in real-time?
- "Birthday" — locked write-once per the contract. What if the user picks the wrong year initially? Banner says "Ask at the front desk." Is there a self-service "request correction" flow with manager approval?
- Membership card "renews June 12" — what happens at renewal? Auto-charge? Reminder?
- Notifications permission denied on first launch — re-prompt strategy?
- "Oopsie, fix my style" submission — does the issue type chip require selection? It looks optional in mockup.
- "Oopsie" photo upload — required per copy ("Photos of the problem (required)"). Validation?
- Check-in QR code — what if the camera at the kiosk can't read it (low light)? Fallback to name entry?

### Forms / validation

- Booking wizard "gentle validation" — uses toasts ("Pick a category to continue"). Is this the production pattern, or do we shift to inline field errors?
- Special-requests textarea (3 rows) — character limit?
- Inspiration photo upload — max 2, what file size limit?
- Style Consultant — multi-select question (`look`) has no max. Cap at 3?
- "Show this code at the kiosk" — is the QR generated client-side or server-side? Expiry?

### Form factors / mobile platform-specifics

- Native iOS + Android app per Exhibit A. **React Native, Expo, or Flutter?** ARCHITECTURE.md mentions Expo; confirm.
- Push notifications: which events fire (booking confirmation, 24-hour reminder, birthday week, aftercare ready, oopsie response, VIP early-access drop)?
- Push provider: Firebase Cloud Messaging + APNs via Expo, or OneSignal?
- Deep links: tapping a SMS reminder opens the app to the right appointment. Universal links for iOS, App Links for Android?
- Biometric auth (FaceID, TouchID, fingerprint) for re-opening the app?
- Camera permission: needed for Style Consultant + Oopsie photo + QR scan. Trigger at point-of-use, not on launch.
- Photo library permission: same.
- Add to Apple Wallet / Google Wallet for the booking + membership card? Could be a delighter.
- Apple Sign In: required by App Store guidelines if we offer any third-party sign-in. We use phone-OTP only, so likely exempt — confirm.
- Apple Pay / Google Pay for deposit at booking?
- App Store rating prompt — when (after first completed appointment, after 3 visits)?
- Background fetch / silent push to refresh appointment status?
- App icon, splash screen — assets ready?
- iOS 17+ Live Activities for "in the chair" status on lock screen — in scope?
- App Store screenshots, copy, privacy policy URL — owned by who?

### Dead ends

- Bottom-nav "Wishlist" tab has a full screen. The home preview row also exists. Should they reconcile (same data, two views — OK).
- "Apple Pay" mentioned on Payment row — actually wire up the Apple Pay flow or just badge?
- "Notifications" row — opens what screen? Toast in mockup only.
- "Translate Please" assistance option — clicked, then what (assigns a multilingual team member how?)
- Location picker (`Harlem, NYC` → `Atlanta` → `Maryland`) — multi-location selector. Is this v1 with one location, or actually multi-location at launch?
- The "Welcome back, Amara" name comes from where on first login when we only have phone? Onboarding screen not in mockup.
- Group booking entry exists but the multi-member flow stops at the wizard — what's the "add members" UI?
- The Style Consultant lives in `/book` entry. After getting results, the only CTA is "Book one of these" which navigates to `book` entry, not pre-filling. Should it pre-fill the recommended style?
- Stylist directory in profile — tapping a stylist shows a toast but should arguably open the stylist's profile / book-with-them flow. Confirm intent.

### Conflicts

- `client.html` shows 8-question Style Consultant (6 + photos + thinking); `PRODUCT_SPEC.md` doesn't list a Style Consultant. New feature?
- Hair Journey: `client.html` shows 4 timeline entries with points status bar (Bronze/Silver/Gold/Diamond). `PRODUCT_SPEC.md` Journey section is different. Re-anchor to the new mockup.
- Birthday banner copy: client.html says "Book your celebration appointment." PRODUCT_SPEC describes "comp Wash & Blow" as the birthday perk. Is the comp service auto-added at booking, or does the client choose any service that week?
- Aftercare videos: mockup uses gradient placeholders. Are these real videos shot for production? Who films them?

---

## Surface 3 · Station Kiosk (`kiosk.html`)

### Component states

- Sign-in: requires first AND last name. What's the "I don't know my last name" or "I only go by one name" path?
- Tracker: 4 progress stages — Sectioning, Braiding, Finishing, All done. What does the kiosk show **before** sectioning starts (between sign-in and the stylist marking stage 1)?
- "All done" terminal state — what does the kiosk show after? Auto-sign-out? Promo for next booking?
- Break overlay — `breakState.show`. Specifies stylist on lunch break. What about a bathroom break (shorter), or no-show?
- Assistance request — once tapped, the confirmation modal shows. What if the user wants to request something else immediately? Multiple pending requests?
- "Already requested water" state — should the Water tile dim or show a checkmark to prevent duplicate requests?
- What if the manager/floor team doesn't respond in N minutes — does the kiosk surface a follow-up prompt?

### Animations & transitions

- Bell ring: SVG swings + scale wave + audio chime. Should the chime respect device mute? Currently uses Web Audio API.
- Confirm modal: scale-up + scrim blur. Confirm.
- Break ring: conic gradient grows over time. What's the exact stylist-side input — start time + duration, or just a "break started" event?
- Stage transitions on the tracker — should the dot pulse on transition?

### Responsive behavior

- Mockup targets iPad landscape. What about portrait orientation? `@media(max-width:900px)` shifts to single column.
- Multiple iPad sizes (10.2", 11", 12.9") — verify layout on all three.
- What kiosk-mode browser do we use — Mosyle / Jamf managed iPad in Guided Access, or a native iOS app wrapper?
- Auto-rotate on rotation, or lock to one orientation?

### Accessibility

- Name input — large 26px text. Auto-capitalize first letter? Auto-correct off (currently not specified)?
- Voice input button — useful for accessibility?
- Color-blind safe — the break-state teal and the requesting-attention clay are differentiable, but check.
- VoiceOver: kiosk is shared device, VoiceOver state for each new client?
- Keyboard: the kiosk uses on-screen iPad keyboard. Any external keyboard support? Tab order?

### Errors & edge cases

- Kiosk loses network mid-session — does the bell still work locally (queued)? Stale progress data?
- "Not you? Sign out" — confirms with no warning. What if a client signs in by mistake and another client is at the chair — does this break flow?
- Multiple identical first+last (two "Amara N." in same week) — disambiguation?
- App backgrounded (someone hits home button) — should we lock to single-app mode?
- Sign-in lookup: per Exhibit A "no QR or lookup required." So the kiosk doesn't validate against an appointment — what if the client typo's their name?
- Stylist forgets to advance the stage — does the kiosk get stuck on "Sectioning" forever? Time-out / nudge stylist?
- Stylist marks "All done" but client hasn't paid / left — what's the kiosk's UX?
- iPad battery dies / unplugged — recover gracefully?

### Forms / validation

- Name validation: any minimum length? Allow apostrophes, hyphens, accents (Diéssou, N'Diaye, Côte)?
- Block emoji in name entry?

### Form factors / hardware

- Hardware: iPad (which model?) is client-procured per A.4. **What model are we targeting?** iPad 10.9 (2022) basic? Affects screen sizes and rendering.
- Mount: Heckler Design, custom-built? Affects orientation lock.
- Connectivity: dedicated kiosk SSID + VLAN? Per-iPad cellular fallback?
- Sound: do all 30 kiosks output audio for the bell chime, or is it muted in the salon (other clients would hear)?

### Dead ends

- Confirm modal "Got it" closes — what if user double-taps? Debounce.
- "Sign out" button position — could be accidentally tapped during a session. Confirm before exit?
- Demo controls (`toggleBreak`, `endSession`) — verify these are removed in production build.

### Conflicts

- The kiosk and the **client app** both show progress trackers. If a client is using the app on their phone while sitting in front of the kiosk, both must stay in sync. Verify single source of truth (server push? WebSocket?).
- Kiosk requires first + last name; the client app already knows the client's name from their account. If the same person, they should match. What if the kiosk name doesn't match any client record — does the salon backend create a walk-in record?

---

## Surface 4 · Stylist App (`stylist.html`)

### Component states

- Clock-in strip: "Clocked in · Since 8:02 AM" vs "Clocked out." How does a stylist clock out? Where's the button?
- "Next break · Available" → during break → "On break · 12:34 remaining." Visual transition state when starting break?
- Today's schedule: appointments with `now`, `next`, `done` strip classes. What about `cancelled`, `no-show`?
- Empty schedule day — copy + illustration?
- Group booking (`grp-pill`) — does the prep view show all group members or just the one tapped?
- Capture screen: 0/4 → 4/4 angles. What if stylist needs to retake one? Can they tap an already-done angle to redo?
- Style-progress card "Tapped too soon? Step back" — only shows after stageIdx > 0. Confirm.
- Earnings card: "Tips today $95" — how are tips entered? At checkout by client, or stylist self-enters?
- Weekly goal: stylist can edit their own target via `prompt()`. Production replaces with proper modal — what fields?
- Goal-met state: turns teal. Stays on for the week?
- Portal feed unread count drives badge. Read state synced across devices?
- Formal notice "Acknowledged" — disables button. Is this permanent or reset on re-render?
- Pay-impact summary updates live from bonuses + deductions. What's the cutoff (current pay period boundaries)?

### Animations & transitions

- Screen fade in: 0.45s. Confirm.
- Break ring: animated conic over real elapsed time. Once the 30-min mark passes, ring turns red and overage timer counts up. Confirm.
- 5-min and 1-min break warnings — visual only (text fade), or also haptic / push notification?
- Audio bar slide-in for "Brief: Amara N." voice playback. 4.2s display.
- Bell wave when assistance request is acked from manager side — does the stylist's app show a visual ping?

### Responsive behavior

- Phone-only. Tablet support — required for the stylists who use iPads as personal device?
- Locked viewport at 390×800 in prototype. Production renders full device size.
- Landscape support?

### Accessibility

- 5-tab bottom nav with 10px labels — bump readability.
- Speaker icon on appointment cards triggers TTS — accessible alternative for hard-of-hearing stylists?
- Capture screen relies on visual checkmarks — VoiceOver announcement?
- Break timer screen — VoiceOver should announce time remaining periodically.
- High contrast mode: dark backgrounds on the earnings hero need test.

### Errors & edge cases

- Clock-in by GPS / geofence — required? What if stylist is at the salon but GPS is off?
- Late arrival auto-deduction: the portal items show "$1/min deduction." Is this automatic (clock-in vs scheduled start) or manager-triggered? What if traffic / sick / approved late?
- 4-angle capture: required before stylist can mark "complete"? Or just before/after at install time?
- Photo capture fails (camera permission denied, storage full) — recovery?
- Photos large file size — compress on device before upload?
- Network drop mid-capture — queue and upload later?
- Stylist accidentally marks "All done" — Step back is available, but does the client kiosk also revert?
- Style-progress sync: stylist taps "Start braiding" — kiosk updates instantly via WebSocket or polling? What's the SLA (1 sec, 5 sec)?
- Stylist has 6 appointments today: what if they need to swap order (Amara wants to come at 4 instead of 1)? In-app rescheduling, or manager-only?
- Break-cap: salon-wide 4 simultaneous breaks. If 4 are on break and 5th tries to start — error message? Wait-list?
- Station picker: 30 stations, some taken. What if the stylist tries to take a taken station (race)?
- Portal Formal notice never acknowledged — does it block other features until acked? Notification escalates how?
- Tip changes after stylist clocks out — does it sync?
- Stylist quits / fired — how is account deactivated? Data retention?

### Forms / validation

- Goal-set prompt: minimum $100. Maximum?
- Late deduction rate: configurable per stylist or salon-wide?
- Station picker: confirm-button disabled until selection. Confirmed.

### Forms / mobile platform-specifics

- React Native (same stack as client app)?
- Push notifications for: 15-min appointment warning, AI takeover assigned, formal notice, pay-period close, break warning, manager message.
- Critical-priority notifications for AI takeover that the stylist needs to answer now?
- Deep links: tap "Acknowledge" in a push, open the formal-notice screen directly.
- Quick Actions / iOS Shortcuts: "Clock in," "Start break"?
- Background refresh for appointment changes?
- Camera permission required for capture screen.
- Microphone permission needed for the "Listen" / TTS feature? No, TTS is output-only.
- Apple Watch companion for break timer, next-up alert? In scope or v2?

### Dead ends

- Speaker icon on appointment plays audio "Amara N., Knotless Box…" — is this AI-generated TTS in production (ElevenLabs)?
- "AI takeover queue" — referenced in Exhibit A but **not in the stylist mockup**. Where does this surface? On the Today tab? A new tab?
- "Up next" appointment card click goes to Prep — same screen as "now." Should there be different content (e.g., disable Capture if it's not their current client)?
- Inspiration / Previous-styles photo blocks in Prep — taps do nothing. Should they zoom?
- Size & length guide opens via "Size and length guide" button — content is per-service. Where does the spec come from? Owner's Services & Pricing builder. Confirmed connection.
- Stylist Portal "Translate" button cycles through EN→FR→ES for the whole feed. Should it only translate the tapped card, or whole feed (current behavior is whole feed)?

### Conflicts

- Exhibit A says **Stylist App is EN/FR only**. The Portal supports **EN/FR/ES**. Which is canonical? Suggest aligning on EN/FR/ES across the stylist app since labor reality at the salon includes Spanish-speakers.
- Exhibit A says the stylist app includes "AI takeover queue." Not present in mockup. Need design.
- Exhibit A says "4-angle capture: Before / after photo flow." Mockup only shows the Before flow. Confirm After capture is identical or different.

---

## Surface 5 · Owner Admin (`owner.html`)

### Component states

- Overview KPIs are static fixtures. Spec for **loading** state on each panel (revenue, register, utilization, etc.). Skeleton shimmer or spinner?
- Weekly goal "set goal" uses `prompt()`. Need a proper modal: form, validation, audit log of changes.
- Register section — many states: open / awaiting count / counted balanced / counted short / counted over / closed / handoff in progress. All implemented in mockup. Confirm all required.
- Register denomination inputs — what if user enters negative or non-numeric?
- Membership tier toggles — turning off "Bronze" affects 312 active members. Confirmation modal needed?
- Per-perk toggles — does turning a perk off retroactively affect current members or only future?
- Inventory: "9 packs left" / "Reorder now" — does the system auto-reorder? Integrate with Sally Beauty / wholesale supplier?
- Calendar: week and day views. What about month view (per Boulevard)?
- Calendar empty cell — clickable to create appointment? Or readonly?
- Stylist portal composer — what happens after "Send to portal"? Confirmation? Recall option?
- Service builder — adding a service requires name, price, sizes, lengths. Edit existing service via "tap a price to edit" — not implemented in mockup. Spec edit flow.
- Birthday calendar — clicking a day shows nothing currently. Should it show the birthday clients on that day?
- Oopsie queue: "Assess" alerts. Need a real assessment modal (photo review, repair classification, stylist assignment, pricing).

### Animations & transitions

- View change: 0.4s fade with translateY. Confirm.
- Tier card flip / collapse when toggled off?
- Flagged station station-card pulses (`flagpulse`). Confirm.
- Modal in/out — 0.3s scale + scrim blur.
- Live clock ticking — exact time format `2:08 PM`. Confirm.

### Responsive behavior

- Desktop-first. Breakpoint at 1100px collapses sidebar to horizontal scroll. Tablet OK?
- Sidebar fixed height 100vh — does it scroll independently if content overflows?
- Main content `padding:26px 32px 60px` — gutters on smaller screens?
- Calendar grid scrolls horizontally on narrow viewports. Confirm.

### Accessibility

- Sidebar nav: `<div>` with `onclick`. Should be `<nav>` + `<button>`s.
- Modal: focus trap? Esc to close?
- Table rows: data tables are properly `<table>`, good. Sort, filter not implemented — required?
- Search input on Clients tab — works, but could use clear-button, debounce.
- Charts (peak hours bar chart) — accessible alternative (data table for screen reader)?
- Color-only signals: green/red/amber chips. Add icon for color-blind support?

### Errors & edge cases

- Concurrent edits: two managers editing the same client / service / register session at once.
- Register count saved by manager A, then manager B re-counts before close — what happens?
- Stylist portal "Recently sent" log — can items be deleted? Audit-only?
- Formal notice once sent, can it be retracted? What if it was a misclick on the wrong stylist?
- Service deletion: if a service has historical bookings, do we soft-delete or block?
- Tier deletion / membership pause: 312 members rely on these. Hardcoded safeguards?
- Manager permissions for the Portal section have toggles ("Managers can post pay adjustments") — implemented as instant toggle. Audit log?
- Birthday client gift "Champagne pending" — checklist state. Who moves it to "ready"?
- Oopsie commission reversal — the copy says "commission transfers automatically." Confirm the rule + show a worked example in the UI.
- Pay-out reason validation — required, but no length or specifics. Allow notes?
- Handoff validation — float must be >= 0. Maximum? Pin code / signature for the receiving manager?
- What if a register session is left open overnight (manager forgot to close)?

### Forms / validation

- Service builder: styling price, service fee, hair fee. All positive integers? Decimals?
- Service name uniqueness?
- Size spec inputs — text strings, no validation. Should we enforce a format ("X.X in part")?
- Lengths offered — must pick at least one?
- Late deduction rate (`changeRate()`) uses `prompt()`. Need a proper input with min/max.
- Bonus amount in portal composer — max?
- Brief textarea: character limit?
- Client search — debounce input? Min characters?

### i18n

- Owner / manager UI English-only confirmed?
- Calendar week-start: Monday or Sunday?
- Currency: USD only? What about Atlanta / Maryland locations with same currency.

### Dead ends

- "Stylist directory" rows — clickable in stylist app, but no detail screen on owner side. Tap-into stylist profile?
- "Employee of the Month" change → alert(). Need proper picker.
- "Open register" link from overview — implemented (nav to register), good.
- "Reports & finance" page — only utilization + performance + peak-hours. What about full P&L, payroll export, tax reports? Out of scope or implied?
- Inventory: no add/edit/delete UI. Read-only v1?
- Settings / Location / Hours / Holidays / Booking rules — none in mockup. Owner has no way to change open hours, blackout dates, no-show fees, deposit rules. **Major scope gap** — confirm.
- Staff onboarding (adding a new stylist) — no UI in mockup.
- Refunds — Exhibit A mentions "founder access" for refunds. Where's the refund screen?
- Notifications / SMS templates for marketing — out of scope?

### Conflicts

- Service builder allows custom service fees per service. Public site shows a single inclusive price ("from $280"). Confirm the math: client always sees `styling + serviceFee + hairFee` total.
- 50/50 commission split is mentioned in the service preview. Tier-based commission (Master 60/40, Apprentice 40/60) — not configurable here. Is it really fixed at 50/50?
- Owner's Floor Map and Manager's Floor Map are visually identical. Should Owner see additional data (revenue per station)?
- Concierge tab not in owner sidebar but lives in manager. Should Owner have read-only access?

---

## Surface 6 · Manager Admin (`manager.html`, `manager-concierge.html`, `manager-thread.html`)

### Component states

- Same as Owner where overlap. Manager-specific:
- AI Concierge inbox: "Needs you" / "All" / "AI auto" / "Resolved" tabs. Define exactly what state each thread is in: per-thread `state` field with allowed values.
- Thread modal: shows AI conversation history + reply box. Send button — does it send via SMS through Twilio? Confirmation toast?
- "Reply sends as Diessou" — does the AI persona's name ever change? What if Larysa replies — does it still send as Diessou?
- Concierge needs-action without reply timeout — does AI escalate elsewhere (call Diessou)?
- Sorting / filtering of threads — by time, by state, by client tier?
- Cards on the manager-floor view: "Station 14 running over" suggested-update banner. What if manager neither sends nor adjusts within X minutes — auto-send?
- Floor map list view (`tabList`) — sort by station number, status, time-in-chair?
- Smart waitlist — what's the offer flow when "Offer" is clicked? SMS goes out automatically?
- Assistance request — once acknowledged, removed. Should there be an "in progress" state between "open" and "done"?

### Animations & transitions

- AI Concierge thread modal slide in — confirm.
- "AI auto" chip pulses subtly to indicate active vs static? Or no?
- Reply send button — loading state on tap?

### Responsive behavior

- Same as Owner.
- Manager is often on the floor with iPad — confirm tablet-first design and verify all tap targets.

### Accessibility

- Thread modal: dark background with cream text. Reply textarea contrast — check.
- AI vs human bubble distinction — color + label. Add icon for color-blind.

### Errors & edge cases

- AI gives a wrong answer that's already been sent (out of band) — can manager retract or send correction?
- AI says it booked something but it failed — reconciliation flow?
- Concurrent reply: two managers reply at the same time to the same thread.
- Client sends 50 messages in a minute (rage texts) — UI shouldn't lock up. Coalesce?
- Concierge thread for a client who's also in the app — does the thread surface in the app too, or stays SMS-only?
- Manager assigns a thread to a specific stylist — stylist app shows it in the AI takeover queue. Verify connection.
- Lost & found example shows AI alerted "front desk" — what surface receives that?

### Forms / validation

- Reply box: character limit (SMS 160 chars per segment — split with warning)?
- Empty reply prevented — confirm.

### Forms / mobile

- Manager is mostly desktop / iPad. Native app or web?

### i18n

- Manager admin English-only?
- AI replies in the client's language — does it auto-detect? Manager sees AI reply translated for them?

### Dead ends

- "Notes" / "tags" on concierge threads — implied but not in mockup. Need for triage?
- Search across threads — required?
- Bulk actions (mark all as resolved) — required?

### Conflicts

- Manager has a "Concierge" sidebar item; Owner does not. Owner can see operating data but not interact with concierge — confirm.
- The "Smart waitlist" panel is on the Floor view in both Owner and Manager. Same data + same actions?

---

## Surface 7 · Catalog Shoot Ops (`shoot.html`)

### Note

This is a one-time **internal planning document** rather than a shipping product surface. Contract Exhibit A.6 explicitly says **Phase 2, optional add-on, separate fee**. Questions below are limited to scoping the deliverable IF Phase 2 is engaged.

### Component states

- The shoot page is essentially a static HTML doc with interactive filters and checkboxes. **Is this what ships,** or do we build a real tool with login, claim sheet, photo-upload pipeline, day-of station assignment?
- The 121-style claim sheet — does Diéssou's team mark claims live during the shoot, or is it pre-filled and printed?
- Image-release tracking — currently checkbox in checklist only. Need a real consent form + signature capture?
- Multi-user editing of the checklist?

### Responsive

- Desktop and mobile both shown.

### Errors & edge cases

- A claimed style is no-show'd — re-open to standby list. Manual re-open?
- Photo naming convention (`JOLIEDEN_OCT_05_KNOTLESS_FRONT.jpg`) — enforced by a tool, or manual file naming?
- Two influencers claim the same code — currently allowed in mockup. Lock once claimed?
- File uploads from Jimi's studio go where? Direct to a Vercel Blob / S3 bucket, then ingested by the app?

### Conflicts

- Contract A.6 says "technical integration only (asset pipeline, gallery seeding, release-tracking tool)." That's a separate tool — clarify whether this `shoot.html` is the spec for that tool, or a static planning doc.

---

## Final wrap-up questions (delivery-level)

- What's the staging environment URL we'll use for client review, and who has access?
- Demo data: do we keep the prototype's named personas (Diéssou, Amara, Aminata, Zainab, etc.) or seed with synthetic data?
- App Store / Play Store accounts: under Jolieden's developer accounts or KufGroup's, with later transfer?
- Privacy policy & terms of service — owned and drafted by Diéssou's counsel, or do we provide a template?
- COPPA / minors: "Kids" category exists — do we need parental consent flow if a 12-year-old has a booking?
- HIPAA / scalp-condition data: hair profile notes mention "tender-headed" / "sensitive scalp" — does this count as health data?
- Email vendor: SendGrid, Resend, Postmark?
- SMS vendor for all non-AI traffic: Twilio (same number as the AI)? A2P 10DLC registration handled by us?
- Payment processor: Stripe Connect (for stylist payouts) confirmed?
- Stylist 1099 / W-2 reporting — out of scope?
- What does "production-ready" mean to Diéssou specifically (no defects, EN/FR shipped, etc.) — confirm the M5 checklist.

---

*Document prepared: pre-kickoff, June 2, 2026. Send back as a single doc with answers inline or in a follow-up review session before June 15, 2026 kickoff.*
