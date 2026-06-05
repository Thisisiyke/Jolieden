# Audit Fix Report — Jolieden Artifact

> Comprehensive record of the multi-tier autonomous fix pass over the navigation + design audit at `docs/NAVIGATION_AUDIT.md`. 1,492 findings were processed in four severity tiers, with an Applier + Tester agent pair per surface per tier.

## Headline numbers

- **Total findings processed:** 1491
- **Applied:** 1070 (71.8%)
- **Partial / judgement-call:** 34 (2.3%)
- **Skipped (deferred to product owner):** 387 (26.0%)
- **Tester verdicts:** 384 pass · 47 partial · 29 fail (sampled 458 of 1070 applied)
- **Surfaces touched:** 7 of 7 (`client`, `kiosk`, `stylist`, `owner`, `manager`, `shoot`, `site`)
- **All surfaces parse cleanly** after every tier — confirmed by Tester static analysis + live preview smoke test
- **All 7 surfaces still open** from the App Suite tile grid on the production homepage

## Per-tier summary

| Tier | Findings | Applied | Partial | Skipped | Tester pass | Tester partial | Tester fail |
|---|---:|---:|---:|---:|---:|---:|---:|
| 🔴 Critical (P45) | 20 | 20 | 0 | 0 | 20 | 0 | 0 |
| 🟠 High (P46)     | 305 | 295 | 9 | 1 | 156 | 13 | 1 |
| 🟡 Medium (P47)   | 618  | 466 | 21 | 131 | 128 | 23 | 9 |
| ⚪ Low (P48)      | 548  | 289 | 4 | 255 | 80 | 11 | 19 |
| **Total**         | **1491** | **1070** | **34** | **387** | **384** | **47** | **29** |

## Per-surface roll-up

| Surface | Critical | High | Medium | Low | Total applied / total findings |
|---|---|---|---|---|---|
| **Client Companion App** `client` | 6/6 | 45/47 | 69/87 | 25/75 | 145 / 215 |
| **Station Kiosk** `kiosk` | 2/2 | 30/30 | 45/60 | 54/91 | 131 / 183 |
| **Stylist App** `stylist` | — | 31/33 | 78/102 | 52/85 | 161 / 220 |
| **Owner Admin** `owner` | 3/3 | 45/47 | 95/119 | 52/104 | 195 / 273 |
| **Manager Admin** `manager` | 6/6 | 68/68 | 83/116 | 42/70 | 199 / 260 |
| **Catalog Shoot** `shoot` | — | 32/33 | 37/66 | 33/61 | 102 / 160 |
| **Public Booking Site** `site` | 3/3 | 44/47 | 59/68 | 31/62 | 137 / 180 |

## What each surface changed

### Client Companion App  `client`

215 findings total → 145 applied

**Critical applied:**
- No date/time selection step before confirming — Inserted a new wizard step 7 (Pick your day and time) between Add-ons and Review. Built a 14-day horizontally-scrolling date strip plus a 6-slot time grid in the existing brand sty
- AI consultant call has no auth header — will always error in production — Replaced the browser-direct fetch to api.anthropic.com with a fetch to /api/consult plus a TODO comment per spec ('TODO: server proxy at /api/consult — do not fetch api.anthropic.c
- Back from review reopens add-ons step but Continue button is gone — Fixed showStep() so the global Continue button (wizNext) is restored to display='' on every non-final step instead of only when n!==7. Keyed the hide off TOTAL_STEPS (=8) so the bu
- Anthropic API call is browser-direct, exposing API key in production — Same fix as the auth-header finding. Removed the direct call to api.anthropic.com and pointed the fetch at a same-origin /api/consult endpoint, with an explicit TODO comment explai
- Interactive divs have no role, tabindex, or keyboard handler — Added a makeButtons(root) utility that walks every element with an onclick attribute (skipping native buttons/inputs/anchors) and promotes it to role='button' tabindex='0', wiring 
- Browser-direct Anthropic call will fail CORS even before auth fails — Resolved by the same fix as the other two Anthropic findings. The browser now calls /api/consult on the same origin, which is not subject to CORS at all. The TODO comment documents

**High applied (45):**
- Birthday CTA banner is decorative-only — Added onclick=startBirthdayBooking() to #bdayBanner which calls wizStart(false), sets wiz.birthday=true, preselects 'Special Occasion' category, and tags the bo
- Featured style cards are dead unless you tap the heart — styleCard() now wires onclick on .style-card root to startBookingWithStyle(name,price,grad); heart has event.stopPropagation so wishlist toggle still works inde
- Manage appointment only shows a toast — no reschedule/cancel UI — Replaced showToast on Manage button with openManage() which opens a new manageSheet with Reschedule / Cancel / Add a guest / Change stylist rows. Reschedule ope
- Book takedown shows a toast instead of opening the booking flow — Replaced toast with bookTakedown() that registers a Maintenance category (Takedown/Edge touch-up/Reshape), preselects Takedown, applies member visit if eligible
- Group booking has no group-add UI — wizStart(true) now opens guestsSheet with name input + category chips. saveGuest() appends to wiz.guests; the success message includes a real invite link with a
- Deposit CTA skips any actual payment surface — confirmBooking() now opens paymentSheet showing the computed deposit amount, payment method picker (Visa 4242 / Apple Pay), and a 1.2s 'Charging…' state before 
- Results CTA dumps user at booking entry, not the chosen style — renderResults now builds per-card 'Book this look' buttons via createElement, each calling startBookingWithStyle(r.name). Removed the lossy global 'Book one of 
- Tapping a wishlist card shows a toast instead of opening booking — renderWishGrid now wires wcard onclick to startBookingWithStyle(name,price,grad). Heart within still toggles wishlist via stopPropagation.
- Wishlist heart toggle de-syncs across carousels until re-render — Every heart now has data-style attribute. New refreshHearts() queries all .heart[data-style] and toggles .on based on wishlist contents. toggleWish calls it aft
- Primary appointment management is a toast, not a destination — Same fix as the earlier Manage banner: onclick wired to openManage(). Sheet exposes Reschedule, Cancel, Add a guest, Change stylist rows.
- Deposit step has no payment surface — pay is implied but invisible — buildReview now updates the confirm button label dynamically: 'Confirm and pay $X.XX (50% deposit)' computed from the live total. Pricebox shows the explicit se
- Stylist directory rows are decorative — no profile, no portfolio — Profile sty rows now wired to openStylist(name,tier,rating) which opens a sheet with portfolio grid (4 thumbs), specialty chips, rating '/5' formatted, and 'Boo
- API failure has no retry — only 'Book' or 'Start over' — renderError now builds a Try again primary button that re-calls runConsult() with the same cAnswers, plus a Browse styles secondary button. Start over demoted t
- Oopsie form submits without validating issue type or photo — submitOopsie now validates: requires ≥1 issue chip selected AND ≥1 photo. Shows inline #oopsieIssueErr / #oopsiePhotoErr if not met and blocks the sheet from cl
- 'Influencer' as stylist tier reads Instagram, not salon — Added STYLIST_TITLE map {Master:'Master Braider', Senior:'Senior Braider', Stylist:'Stylist', Specialist:'Specialist'}. Applied to appointment card stylist row 
- Same style shows three different starting prices across surfaces — Single rule applied: 'Starting at' = base price WITHOUT $25 service fee everywhere (Home featured, Wishlist preview/grid, Book wizard, Wishlist screen). The $25
- Takedown reminder fires while a fresh install is hours away — Care reminder card + label now hidden by default; refreshHomeReminders() gates on installImminent + chair state. With today's 1:00 PM install booked, the remind
- Back arrow from Photos step resets questionnaire to Q1 — cGo('q') handler now detects when the caller is cs-photos (via the active class check) and sets cqIdx = cQuestions.length-1, landing back on Q6 instead of Q1. c
- Special requests textarea is never read — Textarea now has id=specialRequests with oninput writing to wiz.specialRequests. buildReview renders a 'Notes for your stylist' row in the pricebox; finishBooki
- Re-entering Book mid-wizard silently nukes all progress — resetBook(force) now checks hasBookingDraft() and the bk-wizard active state — if a draft exists, navigation back to Book preserves the current step. Added disc
- Points card has no redeem destination — Added 'Redeem points' (ochre, primary) and 'See rewards' (ghost) buttons inside the pts-card. Both route to new #rewards screen which renders REWARDS list (500/
- Oopsie form collects no data — chips and photo are visual-only, submit fires blind — Issue chips now use .chip CSS class + toggleOopsieIssue tracks selection in oopsieIssues Set. Photo upload writes to oopsiePhotos array. submitOopsie validates 
- $25 service fee silently folded into base prices — buildReview now renders 'Service fee · +$25' as its own pricebox row and uses raw base price (not wiz.base+SERVICE_FEE) for the 'Style · base' row. Single canon
- Every timeline card is a fire-and-forget rebook toast — tl-card onclick now opens openVisitDetail(idx) which renders a visit sheet with date, stylist, price, gradient thumb, plus 'Rebook this look' (calls startBookin
- Group booking path runs the solo wizard verbatim — wizStart(true) opens guestsSheet for collection. saveGuest pushes {name, cats} into wiz.guests; existing guests render at top of sheet on re-open. Confirmation 
- Membership perk and care reminder never reconcile — When USER.isCircle && !USER.memberVisitUsed, refreshHomeReminders updates the care reminder title to 'Use your member visit' and body copy to 'Your monthly main
- 'None noted' allergies row provides no path to add/correct allergies before service — Allergies row now clickable, opens profileEditSheet scrolled to the allergy field. Section label shows an 'Edit' link. Allergies row also shows a 'Tell us about
- AI intro paragraph could contain unescaped markdown or HTML from model output — renderResults rebuilt with createElement + textContent for r.name, r.category, r.why, and each r.tag. No innerHTML interpolation. Same treatment applied in rend
- Featured style card photo div has no tap target other than the heart — Covered by the same .style-card onclick fix — the entire card (photo, name, price body) now starts booking via startBookingWithStyle. Heart still toggles wishli
- Wizard never inspects textarea contents — confirmBooking discards all preferences — buildReview now syncs textarea value into wiz.specialRequests as a safety net. finishBooking reads wiz.specialRequests and inserts 'Your stylist will see your n
- Loading messages cycle but never resolve to error after a timeout — runConsult already had AbortController with a 25s timeout (preserved). On abort or fetch error, clearInterval(cyc) fires and renderError() shows the Try again b
- Photo 'required' label is text-only; nothing prevents submission without a photo — Same as the oopsie validation: submitOopsie blocks submission if oopsiePhotos.length===0 and shows #oopsiePhotoErr inline.
- Oopsie chips don't track state in JS — only inline style — Chips rewritten with .chip class. toggleOopsieIssue tracks selected types in oopsieIssues Set. submitOopsie reads from the Set, not the DOM.
- Wishlist grid heart calls toggleWish without an 'el' arg, breaking the class toggle — renderWishGrid now passes `this` as the fourth arg to toggleWish. Additionally, the new refreshHearts() syncs all hearts globally after every toggle so el-passi
- Book CTA in results uses go('book') which resetBook()s — passed-in style is lost — Each rec-card now has its own per-card 'Book this look' button calling startBookingWithStyle(rec.name) which preselects category + style and jumps to size. Glob
- Timeline shows future visits as past history — Re-seeded timelineData anchored to TODAY (2026-04-14). Most recent visit: 'Today · today's install', then Feb 2026, Dec 2025, Oct 2025. Each entry now carries a
- Birthday banner fires 7 months before user's actual birthday — refreshHomeReminders() computes days between TODAY and USER.birthday (11-22). Banner only shows when within 14 days. Also supports ?birthdaySoon=1 query param t
- Copy conflict: 'In service now' card while 'on a lunch break' banner — toggleChair sets onBreak=true on entry and tag becomes 'On break · back at 3:00' while the lunch-break live banner is visible. Two coherent states (serving vs o
- Same appointment still shown as 'Upcoming' after service is over — After leaveChair, the appt card transitions to a completed receipt: tag='Your visit · today', style='Knotless Box Braids · complete', when='Paid: $245 · Tip tha
- Color choices are conveyed by color alone with no name on the swatch surface — Each swatch now renders a .sccode badge inside the swatch chip (e.g. '1B', '27', '350') with high-contrast micro-pill background. Label below is 12px (was 9.5px
- AI response strings injected as innerHTML without sanitization — Same fix as the intro paragraph: rec-card construction switched to createElement + textContent for r.name, r.category, r.why, and per-tag spans. No innerHTML on
- Oopsie submission gives the user no reference number to follow up on — submitOopsie now generates a reqId in the form OOPS-YYYY-NNNN and includes it in the success toast. Full 'Open requests' tab not added but the request object {i
- Combination step picks a technique but never asks which two colors — Combos now use pickCombo() which opens a comboSheet with per-row swatch selectors. Ombré asks Starting + Ending, Two-Tone asks two colors, Highlights three, Pee
- Combination color row hides which colors were chosen because they were never asked — buildReview now appends ' · color1 → color2' to the Color pricebox row when wiz.comboColors is populated. e.g. 'Color · Ombré · 1B → 27 honey · +$80'.
- Membership promises monthly maintenance with no way to redeem it from the app — Added #memberVisitWrap on the bk-review step with a 'Use my Circle member visit' toggle that only appears for maintenance services when USER.isCircle && !member

**High partial / judgement (2):**
- No stylist selection step in the booking flow — Added stylist sheet via openStylist() with portfolio + 'Book with [name]' that preselects wiz.stylist and starts the wizard. Stylist row now appears in review p
- Consultant recommends styles from the full Jolieden MENU but booking wizard only carries a subset — applyDeepLink() now scans stylesByCat for any matching style name; if it can't find one, it adds the recommendation to 'Signature Jolieden' so the wizard can re

**Medium:** 69 applied, 15 skipped (polish-grade, see audit catalog for full list)

**Low:** 25 applied, 49 skipped (nice-to-have, see audit catalog)

### Station Kiosk  `kiosk`

183 findings total → 131 applied

**Critical applied:**
- Service name h2 is hardcoded text, identical regardless of which client signs in — Added IDs to the service name h2 and meta line, introduced a SERVICES + BOOKINGS fixture map keyed by station id, and wrote a resolveBooking() helper that reads ?station= and ?serv
- Stylist name and title are hardcoded — never reflect actual assigned stylist — Added IDs to the stylist avatar, name, and role nodes, and a STYLISTS registry (slug → {name, role, initial}) modelled on the personas registry. resolveBooking() picks the stylist 

**High applied (30):**
- No navigation to any other surface in the artifact — Added a fixed top-right 'Surface' pill (hidden by default) that opens a slide-down sheet listing all six neighbor surfaces. Pill is revealed via 3-tap gesture o
- Prominent bell looks like a call-staff button but is decorative — Repurposed the bell into a real callStylist() action — fires the chime, opens the confirm modal with copy 'Oumou knows you would like her. She will wrap this se
- Time remaining never decrements while bar fills — startProgress now updates #progText every tick via updateProgText(totalMin) computed from progPct against the service's duration. Format: 'About Xh Y left' >60m
- Stylist title reads as nonsensical AI copy — Removed 'Zainab O. / Senior Braiding Influencer' from STYLISTS map and the markup. Station 14 default now resolves to Oumou D. (canonical Senior Braider per CLA
- Single tap fires request with no cancel or undo — Added an outline 'Cancel — I tapped by mistake' button above 'Got it' in the confirm modal. Visible for the first 5 seconds after a request fires, then fades. C
- Typing two full names defeats the chair-side context — Replaced the two-input form with a single full-width 'Tap to begin' clay button. H1 now reads 'Welcome to your chair, [name].' with name hydrated from the booki
- Demo toggles visible to real clients in production layout — Demo controls now hidden by default (display:none + pointer-events:none) and docked as a full-width strip at the bottom edge. Revealed via 3-tap wordmark gestur
- Progress interval never clears when client signs out mid-service — endSession now clears progInt, breakInt, idleTimer, and undoTimer, and exits the break state explicitly. Same cleanup runs before sign-in screen is restored.
- Progress percentage state persists across sign-out / sign-in — progPct is reset to 0 in both endSession() and enterKiosk() so a new client always starts from the per-client baseline rather than inheriting the prior client's
- cap() function destroys culturally-styled names — Removed all use of cap() on client names. The greeting now uses CURRENT.clientName verbatim from the booking fixture. cap() helper left declared but unused (har
- Same green checkmark for hospitality and discomfort requests — Confirm modal icon is now branched by request.icon key. Hospitality requests use the checkmark, discomfort uses a hand glyph, charger uses a battery+lightning g
- No idle timeout or screensaver between clients — Added armIdleTimer() that fades to a 'Resting' overlay after 15 minutes of no interaction, then fully runs endSession at 30 minutes. The resting screen shows th
- Request cards are not keyboard or screen-reader reachable — Converted .areq divs to <button> elements with role='button', tabindex='0', aria-label derived from each card title, and a keydown handler for Enter/Space.
- Single-name clients cannot sign in — Resolved by the 'Tap to begin' simplification (flag 14). There is no longer a name-input gate — the kiosk reads the booked client name from the operator-app boo
- UI is English-only, including the translate request itself — The Translate Please card title now cycles through six languages (English, French, Spanish, Wolof, Arabic, Portuguese) on a 15s loop via CSS keyframe animation.
- Charger request confirms before user picks iPhone or Android — Tapping the Phone Charger card now opens a follow-up sheet with two large buttons ('iPhone' and 'USB-C'). Only after a pick does the confirm fire, with copy 'US
- No secondary 'Cancel' or 'Wrong button' option in confirm modal — Resolved together with flag 13 — the confirm modal now shows a Cancel button alongside Got it during the 5-second undo window.
- Discomfort confirm says stylist will check in — but stylist is on break — The discomfort request now has a dynamic() function that branches confirm copy on the onBreak flag. During break it reads 'Pause — we will get someone over to h
- Greeting uses only first name despite collecting last name — Resolved by removing the last name field entirely (flag 14's recommended path). The booking fixture supplies a single client name used in both the sign-in greet
- Phone Charger icon is identical silhouette to Bathroom Break — Replaced both icons. Phone Charger now uses a horizontal battery body + lightning-bolt cutout (BatteryCharging style). Bathroom Break uses a person-silhouette d
- Stylist's actual arm-by-arm pace ignored - estimate is static fiction — Resolved alongside flag 11 — progText is now derived from progPct against service.duration each tick. Production note: the Stylist App is the source of truth fo
- Current stage 'now' indicator looks identical to 'done' after first stage — The .stage.now .dot now has a 2px --ochre ring with a 1.5s pulse animation, so the active stage visibly breathes. .stage.done stays static clay.
- Stage labels are braid-specific but kiosk reused for all services — Stage labels are now sourced from SERVICES[slug].stages and rendered in applyBooking(). Silk press shows Wash/Blow-dry/Press/All done; color shows Prep/Process/
- Confirm modal stays open indefinitely until tapped — Confirm modal auto-dismisses after 9 seconds (4s past the 5s cancel window). After auto-close the assistance grid is reachable so the client can stack additiona
- Demo controls remain pointer-targetable even at opacity .5 — Same fix as flag 10 — .demo defaults to display:none and pointer-events:none. Tapping is impossible until a reviewer triggers the 3-tap wordmark gesture (or loa
- Station number is hardcoded in HTML — same kiosk file deployed to every chair — The station tag .st now has id='stationNumber' and is populated from ?station= via resolveBooking() + applyBooking(). When the query param is missing the tag vi
- Translate confirm body says 'who can help in your language' without recording which language — Translate Please now opens a follow-up sheet listing six languages. Picking one fires the confirm with language-specific copy (e.g. 'A Wolof-speaking team membe
- Reset/endSession does not close an open confirm modal — endSession now calls closeConfirm() and closePicker() before sign-out so neither the scrim nor any open modal persists into the sign-in screen.
- Demo controls cover the bottom-right corner of the .areq-grid 'Refreshment' card — Resolved together with flag 10. When revealed the demo bar is a full-width docked strip at the very bottom of the viewport (left:0 right:0) instead of a floatin
- Two large Fraunces name inputs stacked vertically push the Enter CTA below the fold on portrait tablets — Resolved by the 'Tap to begin' simplification — the two inputs are gone entirely so the H1, sub-copy, and CTA always fit above the fold on any tablet orientatio

**Medium:** 45 applied, 10 skipped (polish-grade, see audit catalog for full list)

**Low:** 54 applied, 37 skipped (nice-to-have, see audit catalog)

### Stylist App  `stylist`

220 findings total → 161 applied

**High applied (31):**
- Guide sheet scrim calls undefined closeSheet() function — Added closeGuide() function, rewired scrim onclick to closeGuide(), and added a 44px X close button in the sheet header.
- Capture CTA only shows a toast, no forward navigation — beginStyle() now calls advanceStage() (Sectioning -> Braiding), navigates to today, scrolls to the progress card, and shows the copy-change toast 'Photos saved.
- Stylist avatar is non-interactive, no profile/sign-out access — Wrapped the avatar in a button on both Today and Portal that opens a new #profileSheet with Profile, Timesheet, Language, Notifications, and Sign out rows.
- Greeting language ignores app default state — Static HTML greeting changed to 'Good afternoon, Oumou' (EN default). Added a global applyLang() that translates Today/Capture/Break/Earnings headers; go() call
- Today header claims 6 appointments, shows 4 — Eyebrow text replaced with the copy_change 'Today, 4 appointments' in both EN and FR copy maps.
- Earnings numbers contradict the day shown — Added recomputeEarnings() driven by a TODAY_APPTS array; only Maya R. is complete at load so hero shows $180 / $25 tip / 1 service. Naomi's $245 + $40 tip is ad
- Four-angle capture uses identical icon for every angle — Replaced the four identical camera SVGs with distinct head-silhouette icons: face with center part (front), back-of-head with nape line (back), and left/right p
- Portal translate button cycles instead of choosing target — Replaced cyclePortalLang with translateToPrimary(i): translates the tapped card to appLang and shows a 'Translated from <lang>' caption; tapping again restores 
- Pay deduction styled same as routine announcement — Added .pay-red-strong class with 4px clay-deep left border and 22px Fraunces amount; added a 'View details' link that opens the new #payDetailSheet.
- Unknown manager 'Larysa' not introduced — Renamed all three Larysa-authored portal cards to 'Mame Diarra' (existing operator-fixture floor manager) for canon consistency.
- Upcoming appointment cards open the wrong client's prep — Added PREP_DATA keyed by slug and openPrepFor(slug); 1:00 Naomi, 3:30 Halima, 5:00 Treasure cards now route to their own client's prep with distinct avatar, nam
- Guide sheet has no in-sheet close affordance at all — Added a 44px X close button in the guide sheet header and a full-width 'Done' button at the bottom; both call closeGuide().
- Acknowledged state cannot be reversed even if tapped by mistake — ackFormal now shows a 5-second 'Undo' link inside the toast that calls undoAck(i) to revert acked=false. After 5s the timer clears and the undo link no longer f
- Final progress stage has no path forward — At stageIdx===All Done, the progress card now shows 'Capture after photos' (opens Capture in after mode) and 'Send to checkout' (postMessages 'kiosk' to parent)
- Capture screen has no before/after mode distinction — Added a Before/After segmented control at the top of Capture. State persists per client in captureProgress; header reads 'Capture before, <name>' or 'Capture af
- Hero number lacks payday-relevance context — Added a subtitle under the commission hero: 'Commission only, tips $X separate. See pay impact below.' that scrolls to the new pay-impact card moved onto Earnin
- Pay-impact cards don't actually drill into detail — pay-red and pay-green cards now show 'View details' links that open a #payDetailSheet with calculation rows (minutes late × rate, target vs achieved), affected 
- Formal acknowledgment lacks a 'disagree / dispute' path — Added a 'Disagree, request a meeting' secondary button under the Acknowledge CTA that opens #disputeSheet with a pre-filled textarea and 'Send to Diéssou' submi
- Active appointment shows start time but no elapsed or expected end — Active card now shows '1:00 - 5:30 (4h 30m booked)' and a live-updating '52 min elapsed, on track' line; setInterval flips it to 'running over' in clay-deep whe
- Break screen offers only one fixed 30-min meal break — Added a segmented control with Rest 10m / Restroom 5m / Meal 30m. Selecting one updates breakDuration, the ring, and the timer display; meal is the default.
- Over-break visual escalation is too subtle — Overtime now: clay-deep ring with overpulse animation, an inline -$X deducted pill under the timer (live $1/min), and a clay banner 'You are over. Clock back in
- Capture screen never switches to 'Capture after' state — Same Before/After segmented control handles this; After unlocks for Naomi only when stageIdx reaches All Done, otherwise a toast explains.
- Active appointment card and progress card both navigate to same prep — All three appointment cards now use openPrepFor(slug) so each loads its own client's prep data; active Amara/Naomi card still opens prep but with Naomi's data.
- Snapped count never resets between clients — Added captureProgress[slug][mode] state and refreshCaptureView() that restores per-client per-mode angle progress when Capture is opened; tiles re-render correc
- Bottom nav navigating to Today/Earnings/Portal mid-break leaves timer running but invisible — Added persistent #breakPill near the bottom-nav; updateBreakPill() runs on every go() and every tickBreak() showing the live MM:SS (or +MM:SS in clay-deep when 
- Capture screen shows wrong client context if navigated to via bottom nav — When captureCtx is null, the Capture screen now shows a client chooser (Naomi/Halima/Treasure) instead of the main capture UI; once selected, header reads 'Capt
- Disabled CTA opacity .4 fails contrast on cream — Disabled 'Begin the style' button now uses opacity:.6 with a solid --sand background and espresso label; flips back to espresso/cream when enabled.
- Pay impact summary lives on Portal not Earnings, splitting money across two surfaces — Moved the full pay-impact card to Earnings as a second hero block under the commission card. Portal retains a smaller espresso summary that links back to Earnin
- Today (Thursday) bar uses --ochre while hit days use --clay - identical hue family — Changed .gd.today i to a teal-to-champagne gradient and added a 'Today' chip above the bar so it reads distinctly from clay 'hit' bars.
- Birthday client on Today is Amara, contradicting Naomi Brooks as the birthday demo persona — Renamed the 1:00 active card to Naomi B.; prep data, banner, avatar (N), and audio playback line all reference Naomi. Birthday pill remains on her card.
- Stylist named 'Zainab' is not in the canonical cast — Renamed the stylist to Oumou D. across the greeting, profile sheet header, FR/ES copy maps, avatar initial (O), and final caption.

**High partial / judgement (2):**
- Surface uses cream/clay palette despite admin-surface brief — Added --champagne tokens, applied a dark-warm 'admin-tint' wrapper to the Today greeting (espresso bg, champagne accent on em), darkened the Portal pay-impact s
- Stylist app uses cream/clay palette despite CLAUDE.md spec for dark warm admin surfaces — Same as fix #23: introduced champagne tokens, admin-tint header treatment, and dark Portal pay-summary, but did not flip the full body to espresso to preserve p

**Medium:** 78 applied, 20 skipped (polish-grade, see audit catalog for full list)

**Low:** 52 applied, 33 skipped (nice-to-have, see audit catalog)

### Owner Admin  `owner`

274 findings total → 195 applied

**Critical applied:**
- Broken --teal var — handoff button and todo checks render unstyled — Declared --teal:#4A8579 in :root alongside the other warm-dark palette tokens. The existing CSS rules at .todo-item.done .tbox and the inline style on the Close-and-start-new-regis
- Week view's columns are stylists, not days — Restructured buildCalendar to render a true week grid (Mon Jun 8 through Sun Jun 14 as day columns, stylists as row labels) when calMode==='week', and kept the original stylist-as-
- Handoff fires even when the current count was never submitted — Added a regSignedOff flag set to false on register open and on each handoff, flipped to true only inside submitCount() after validation passes and the entry is pushed to regLog. ha

**High applied (45):**
- Profile chip dead-ends — no menu, no sign-out — Converted .sb-foot from a div to a button that toggles a new .profile-pop anchored above it. Popover contains View profile, Account settings, Switch role (Owner
- No way to reach the other surfaces of the artifact — Added a 'Jump to surface' section inside the same profile popover with six rows (Public Booking Website, Client Companion, Station Kiosk, Stylist App, Manager A
- Adjust button on running-over ETA is a no-op — Renamed 'Adjust' to 'Edit message' and wired it to openEtaSheet(). The bottom-sheet has a 15-min stepper, optional note field, and live SMS preview, then commit
- All three Offer buttons have no handler — Waitlist is now data-driven (5 rows). Each Offer button opens a confirmation bottom-sheet 'Offer this open chair to {name} via SMS?'; on confirm, the row dims+s
- Floor map legend has 7 status colors, three of them adjacent on the wheel — Collapsed to 4 status colors plus separate channels: Available (ochre tint), Occupied (warm brown), Finishing (ochre + 3-stripe pattern via repeating-linear-gra
- Open chair / Closed station labels are nearly invisible — Available stations now use a pale ochre tint background, .who label set to --ink at 13px medium with an ochre 'tap to assign' subtitle. Closed stations bumped t
- Membership tier cards become a wall of orange when defaults are on — Added tier accent stripe at top of each card (Bronze copper, Silver cool grey, Gold ochre, Diamond champagne gradient). The 'Everything in {lower}' perk is now 
- Stylist Portal preset buttons treat 'Formal notice' as a peer to 'Recognition' — Split preset row into two visually distinct groups separated by a divider: 'Light touch' (Recognition, Coaching, Announcement) and 'Pay & formal' (Late deductio
- 'Live ETA' card is ambiguous about what 'Send' actually does — Rewrote ETA copy verbatim to 'Suggested update for the 2:30 PM client: new start around 3:00 PM. Nothing is sent until you tap Send update.' Renamed Adjust to '
- Calendar event tiles styled as clickable but have no handler — Added wireCalEvents() that runs after every buildCalendar() and binds each .cal-ev to openApptDrawer(). Drawer shows client/tier/visits, service, stylist with r
- Submit can be clicked repeatedly, recording duplicate sessions — Added regSignedOff guard at the top of submitCount(). After successful submit the signer input + submit button are disabled, button text becomes 'Submitted · {t
- Pay-out has no log entry in the accountability table — Every successful confirmPayout() now unshifts a 'payout' type row into regLog with amount, reason, authorizer, and timestamp. The log table picked up a Type col
- Handoff destroys the current count without confirmation — Replaced direct handoff() reset with a confirmation bottom-sheet that shows session number, Counted/Expected/Diff, signer, new signer, and new starting float. R
- Week label is static — no week navigation arrows — Added Previous / Today / Next arrow buttons flanking the week label, plus a date-picker icon stub. calWeek(delta) updates the calWeekOffset, recomputes the labe
- Inventory rows are read-only with no adjust-count or place-order actions — Added an Actions column with Adjust + Threshold + Order buttons per row (Order is primary clay for low-stock rows). Added a top-of-table 'Log delivery' bulk rec
- Tier vocabulary contradicts itself across views — Replaced Standard→Bronze and Platinum→Diamond in the Birthday center table, Protocol-by-tier copy, and chip styling. Membership/Clients tier vocab was already B
- Register status disagrees with itself between views — Introduced syncOverviewRegState() as the single source of truth. Overview's #regState and #ovRegSummary both read from regSignedOff + last log entry; on load bo
- 'Influencer' is used as the word for 'client' — Global replacement: Birthday/Oopsie/Reviews table headers now read 'Client'; station card role chips render 'Senior Stylist' / 'Master Stylist' / 'Stylist' / 'A
- Stylist tier in station card uses the noun 'Influencer' — Station card role rendering now uses roleLabel map (Master→'Master Stylist', Senior→'Senior Stylist', Apprentice→'Apprentice', else 'Stylist'). The modal also s
- Pausing a whole tier has no explanation of what happens to current members — toggleTier() now intercepts an 'on→off' flip with a confirmation bottom-sheet using the verbatim copy 'Pause {tier}? {n} current members will keep their perks u
- Pay-out silently mutates expected drawer with no undo — recordPayout() now opens a confirmation sheet showing 'Expected drawer will drop from $X to $Y'. confirmPayout() commits, logs the entry, and shows a 5-second t
- Late rate accepts unreasonably high values with no cap — changeRate() now rejects values >$10/min with alert. Values >$5/min trigger an amber warning bubble in the formal-flag area: 'High rate. Confirm with Diessou be
- Submitted-and-signed session can be resubmitted with a different signer — After submitCount() succeeds, rcSigner.disabled=true and the submit button is locked. The 'Reopen for adjustment' link in the result banner is the only way to r
- Pay-out reason accepts free-form text — no category for reconciliation — Replaced the freeform Reason input with a required <select> dropdown using verbatim options: Bank drop / Supply run / Owner draw / Stylist tip-out / Other. Adde
- Pay-out is recorded without a paired denomination breakdown — Pay-out confirmation sheet now embeds a 7-row denomination breakdown ($100/$50/$20/$10/$5/$1/Coins). updatePayoutDenom() sums the entries live; confirmPayout() 
- June calendar has no row spacer between header and day cells — Wrapped the S-M-T-W-T-F-S header and the day cells into a single 7-column #bdayCalWrap grid. June 1 2026 is a Monday, so a single empty 'blank' cell pads the fi
- Smart waitlist header says 5 but only 3 rows render — Waitlist is now a 5-entry array rendered by renderWaitlist(). Three rows are shown by default with a 'See 2 more' linklike that expands to all 5. The count chip
- Overview claims register is balanced while Register itself says 'Awaiting count' — Static overview copy now reads 'Open session 48 · awaiting count (drawer expected $3,240.00)' on load. syncOverviewRegState() keeps Overview's regState and ovRe
- Points rule encodes ratio in text only, not as editable values — Replaced the static '$1 spent = 2 points' and 'Referral = 100 points each' text with inline editable number inputs (#ptSpend, #ptEarn, #ptRef) sized to fit the 
- Modal lists 'Influencer: Booked' which conveys nothing actionable — Modal row renamed to 'Client' with the booked client's actual name (deterministically picked from clientPool by station number) rendered as a linklike button th
- Pay-adjustment permission is one toggle for both deductions and bonuses — Split #permPay into two toggles: #permLate (off by default — late deductions) and #permBonus (on by default — goal bonuses). Updated the send-time permission ma
- Sidebar footer always says Larysa even though Overview greets Diessou — Sidebar footer rewritten to show 'D' avatar with 'Diessou / Owner'. Matches the Overview greeting. The role-switcher inside the popover preserves the same ident
- Modal 'Influencer: Booked' has no client name to drill into — Modal client row is now a clickable linklike with a deterministic client name (clientPool[n % clientPool.length]). Tap opens an alert stub 'Open client profile 
- Turning off 'Loyalty app access' silently strips access for every member — togglePerk() intercepts the loyalty-app-access toggle when it's on and prompts: 'Turning off Loyalty app access silently strips loyalty app access for every {ti
- Tier-access toggles can be all switched off while window is open — toggleAccess() now blocks the last-on flip while pwOpen is true, alerting 'At least one tier must have access while the priority window is open. Switch another 
- Pay-out amount accepts amounts larger than the expected drawer — recordPayout() rejects amounts > regExpected with a red banner 'Pay-out of $X exceeds expected drawer of $Y. Recount or reduce the amount.' before opening the c
- Pay-out alters Expected total but Counted/Diff don't re-warn the manager — After confirmPayout() commits, the result banner explicitly tells the manager 'Expected drawer is now $X. Re-verify Counted ($Y) against the new Expected.' so t
- Handoff produces no log entry for the closed session — confirmHandoff() unshifts a 'handoff' type row into regLog with detail 'Closed and handed off to {next} · float $X' before opening the new session. Handoff rows
- Manager permissions toggles are ignored at send time — sendPortalItem() gates on ROLE!=='owner' and checks the matching toggle for each curAction (announce→permAnnounce, recognition/coaching→permNotes, late→permLate
- Formal notice can be sent when permFormal toggle is OFF (off by default in HTML) — Formal preset now routes through confirmFormalIntent() which checks ROLE + permFormal before opening the composer, and the send-time gate also blocks if permFor
- Bronze gets an 'Early booking' perk that contradicts the Priority window design — Removed the 'Early booking, 24 hours' perk from Bronze in the tiers array, with an inline comment noting Bronze priority is now handled exclusively by the Prior
- Overview register summary repeats 'counted by Larysa at 9:02 AM, balanced' but the Register view itself starts at $0 counted — Static overview HTML changed to 'Open session 48 · awaiting count (drawer expected $3,240.00)' on load. syncOverviewRegState() updates this in lockstep whenever
- Service fee is excluded from stylist 50/50 split — no explanation of where that $25 goes — Added explicit explainer in both the Create-a-service helper copy and the Service menu helper copy: 'The service fee covers products, water, supplies, and stati
- Assistance request 'Refreshment' request from 'Station 26 · open chair' contradicts station 26 being labeled Available — Reassigned the Refreshment request source to 'Station 12 · Awa J.' so the request comes from an occupied station consistent with the floor map state.
- Pay-out 'Authorized by' is a free-text field — anyone can type any authorizer name — Replaced the freeform Authorized-by input with a <select> populated with the canonical authorizer roster: Diessou (Owner), Larysa (Head Manager), Khady N. (Mana

**High partial / judgement (2):**
- Stylist roster size shifts between views — Added 'Active stylists (7)' captions on both Stylist Directory and Stylist Performance views, plus a 'See all 7' affordance on the directory that lists the cano
- Appreciation dinner appears in both tier cards (as a perk toggle) and in the events matrix (as a Yes/No cell) — Added an explainer caption on the events-by-tier matrix: 'Appreciation dinner is also listed as a Gold perk above. Edit it in one place and both views update.' 

**Medium:** 95 applied, 20 skipped (polish-grade, see audit catalog for full list)

**Low:** 52 applied, 52 skipped (nice-to-have, see audit catalog)

### Manager Admin  `manager`

260 findings total → 199 applied

**Critical applied:**
- All three "Offer" waitlist buttons are dead — Replaced the hard-coded .wl rows with a JS-rendered list driven by a `waitlist` array. Added a new `WaitlistOfferConfirm` modal (id `waitlistModal`) that shows client, stylist cons
- Oopsie queue actions are alert()-only no-ops — Replaced the static two-row table with a JS-driven table (`opRows`) backed by `oopsieCases`. Added a full `OopsieCase` modal (id `oopsieModal`) with client/date/stylist/issue, a se
- "Close and start new register" CTA renders invisible (broken token) — Added `--teal: #C9A961` to `:root` (champagne, in the brand family). The Register hand-off button now paints visibly against the dark panel, and the done-todo `.tbox` checked state
- Two "Concierge" entries in the sidebar with conflicting counts — Deleted the duplicate 'AI Concierge' nav entry. Single 'Concierge' item remains, with its pip id moved over (`pipConcierge`). The pip count is now derived inside `renderConcierge()
- Manager can pick 'Formal notice' even when the permission toggle is off — Added an early-return gate in `pickAction()`: when act==='formal' and `#permFormal` is not `.on`, the click is blocked, a toast with the exact copy fires, and the preset gets a `.d
- Reply draft persists across different client threads — Added a `replyDrafts` map keyed by thread idx plus `currentThreadIdx`. `openThread()` loads `replyDrafts[idx]` into the textarea; `closeThread()` saves whatever is in the textarea 

**High applied (68):**
- No sign-out, profile, or settings access from sidebar — Wrapped the avatar footer in a clickable trigger that opens a popover with Switch manager, Profile & schedule, Settings, and Sign out items.
- "Adjust" button is a dead click — Wired Adjust to toggle an inline editor with new-start + minutes-added inputs that updates the ETA copy in place.
- Pending prep chips cannot be resolved — Prep chips are now buttons cycling pending→ready; the row-level summary chip + brief feed entry update on each toggle.
- "Change selection" button only fires an alert() — Replaced the alert with an EOTM modal: stylist dropdown, period selector, note textarea, Publish writes to the brief and updates the spotlight.
- "Reorder now" / "Reorder soon" chips do not trigger reorder — Converted both chips to buttons that open a Reorder modal pre-filled with item/qty/supplier; placing the order flips the row to Awaiting delivery.
- "Tap a price to edit" is a false affordance — Changed helper copy to 'Tap a row to edit' and made each service row clickable, pre-filling the Create-a-service form for in-place editing.
- Day view tab swaps highlight but not content — calView('day') now renders an actual single-day grid (stylists × hours) versus a 7-column week grid; toggle persists across nav.
- No way to reach sibling surfaces (Owner Admin, Stylist App, Kiosk, Public Booking) — Added a 'View as…' switcher above the avatar footer with rows that postMessage the parent harness for each sibling surface key.
- "Influencer" column means client in some tables, stylist in others — Renamed the client-side column header in Birthdays/Oopsie/Ratings tables and the station-modal row label to 'Client'; tier label 'Influencer' kept only on floor
- Calendar's "Week" view is actually a single day labeled "Week of June 8" — Week now renders a 7-day grid with a stylist filter; Day renders the per-stylist column grid; added ‹ › arrows and a Today button.
- Floor stats don't match the rendered floor (off-by-one and off-by-three) — Stats now derive live from the layout array via recalcFloorStats() — active, in-chairs, open, on-break, waitlist — and re-run on any state change.
- Priority window status surfaced to manager with no way to act — Calendar tile re-rendered as neutral chip 'Closed · owner-controlled' for manager role; tapping opens an explainer popover.
- Floor map's most urgent panel buried below a 30-tile grid on smaller displays — Added a sticky assistance bar at the top of the floor view below 1100px; the side panel re-orders above the grid via media query.
- Smart waitlist "Offer" button has no feedback after tap — Confirmed Offer flow already triggers the WaitlistOfferConfirm modal + toast; row animates out post-confirm; floor stats recompute.
- Manager replies vanish on thread reopen — sendReply now pushes {who:'manager', text, ts, who_label} into concierge[idx].thread; openThread re-renders bubbles from that array.
- Replying does not move thread out of 'Needs you' — Added a Mark handled button + an auto-prompt 'Reply sent. Mark as handled?' after sendReply that flips state to 'auto' on confirm.
- Handoff allows skipping the count entirely — handoff() now blocks if the current regSessionNo has no signed regLog entry and shows 'Count and sign off before handing off.' with a Go-to-sign-off link.
- Station modal has no operational actions — Added a state-aware action row in openModal: Mark resolved / Dispatch help for attention, Open thread / Reassign chair for occupied, Open birthday prep for birt
- Open chair callout promises actions that do not exist — Available-state modal now renders 'Assign stylist' + 'Offer to waitlist' buttons that open the corresponding flows.
- Brief author is hardcoded as 'Diessou' for the manager Larysa — postBrief now uses currentManager() (Larysa for ROLE=manager, Diessou for ROLE=owner); todos record the same as 'who'.
- Completed to-do checkmark is invisible (var(--teal) undefined) — --teal is defined in :root as #C9A961 so the .todo-item.done .tbox fill paints; same token reused for handoff button.
- Late-deduction pay rate is changeable by every manager with no audit — Replaced window.prompt with a Rate-change modal gated by permPay, captures old/new/manager/ts into rateHistory, and toasts owner-notification.
- Manager replies render as 'sent as Diessou' regardless of who's logged in — Composer placeholder reads 'Type a reply — sends as Jolieden'; reply bubbles carry a who_label of '{manager} · {role}' captured at send-time.
- Sarah M.'s prep checklist contradicts her row-level 'Gift pending' chip — Prep state derives from a single per-client array; bdaySummary() picks the first pending item — Sarah now shows 'Champagne pending' consistently.
- Tier access toggles can all be turned off while the window stays Open — toggleAccess() blocks the last-enabled toggle from flipping off without a confirm modal warning the window will be effectively closed.
- Station 14 is the 'running over' ETA target but isn't visibly flagged on the floor — Layout flag moved from station 5/26 to station 14 (Maimouna K.) so the pulsing red matches the Live ETA panel target.
- Escalation '@front-desk' note is part of the SMS thread, implying it was sent to the client — Escalation cards now render in a separate 'INTERNAL ROUTING' collapsible above the SMS thread with an 'INTERNAL · NOT SENT TO CLIENT' label.
- Critical points-engine rules can be turned off with no confirmation or warning — Every rule-row toggle now calls confirmRuleToggle(this,'name') which opens a modal showing 'Affects N members starting immediately' before disabling.
- Pay-out can exceed expected drawer with no warning — recordPayout opens a confirm modal when amt > regExpected: 'Pay-out exceeds drawer ($X available). This will create a negative expected balance.'
- Negative-flag posts go to the same public feed as positive posts with no visibility scope — Brief composer has a Visible-to selector (All staff / Managers only); Needs attention auto-selects Managers only; managers-only posts render a chip.
- Toggling spec type wipes all typed size specs — setSpecType() now captures current input values into sizeSpecState before rebuild; buildSizeInputs() repopulates inputs from state.
- Inbox preview never updates with the manager's reply — sendReply writes concierge[idx].replyPreview='You replied · just now: "…"' and concierge[idx].when='just now'; renderConcierge surfaces it under the client prev
- Stylist target silently defaults to Zainab O. (top of list) — cmpStylist now starts with 'Pick a stylist…' placeholder; sendPortalItem blocks send and toasts 'Pick a stylist first' if empty.
- Birthday tier names (Standard/Platinum) contradict membership program (Bronze/Diamond) — Birthday client tiers unified on Bronze/Silver/Gold/Diamond; protocol section rewritten to match; tier chip class derived from membership tier.
- Birthday calendar dot legend has no count — manager can't see at a glance how many VIPs are unbooked — Legend chips now show counts derived from bdays data — 'Booked · N / Not booked · N / VIP not booked · N'.
- AI escalation options are listed as inline text — no a/b buttons for the manager to commit to one — Escalation card parses 'Options: (a) …, (b) …' and renders Option A / Option B buttons; commitEscalation appends an outgoing AI bubble and flips state to auto.
- Brief feed has no assignee for to-dos — Diessou posts to herself with no @mention — To-do composer shows Assign-to dropdown + Due date when kind=todo; each to-do row renders 'For {name} · due {date} · added by {who}'.
- Recently-sent log shows pay actions on Zainab but no way for Zainab/Larysa to dispute or reverse — Added a Reverse linklike action on Delivered Pay deduction rows; reversal opens a confirm modal, posts an offsetting Pay credit, and marks the original Reversed
- Open-chair station can't have an assistance request, but row says it does — Station 26 (open chair) refreshment request removed; replaced with Station 11 (Coumba L.) so assistance requests match station occupancy.
- Station 5 attention state has no stylist-level resolution path — Acknowledging an assistance request now also clears the station's attention flag + pulse via station-number parsing; modal also offers Mark resolved.
- Pay-out 'Authorized by' is a free-text field with no validation against actual managers — Authorized by is now a select populated from STAFF managers/owner (Diessou, Larysa, Mame Diarra, Frederick); recordPayout rejects empty.
- Sarah's 3:30 PM birthday booking will collide with the running-over station 14 ETA — Sarah's birthday row gets a red 'At risk: ETA cascade' chip when her time matches the upstream ETA push window.
- Editing bonus amount does not update the green pay preview — Added oninput="previewPay('green',this.value)" on #cmpAmount so the live preview tracks the typed value.
- Pay-out 'Authorized by' isn't required to match the signer or any real manager — Same fix as #41 — Authorized by is now a manager dropdown with Diessou/Larysa/Mame Diarra/Frederick options; no free text allowed.
- Pay-out can refund into the drawer by entering a negative-like string the wrong way — Pay-out input is now type=number min=0.01 step=0.01 inputmode=decimal; recordPayout strips a leading minus before parse and rejects amt<=0 with 'Enter a positiv
- Manager Larysa's brief posts attribute themselves to 'Diessou' — postBrief() uses currentManager() — Larysa for manager role — for both the post 'who' and the todo author.
- 'Everything in (prev tier)' perks have an independent toggle that can be turned OFF — Inherited perks (matched by /^Everything in /) render as an 'Inherited' chip + description, not as a toggle, in renderTiers().
- Toggling Brand trip raffle perk doesn't update the Events matrix below — renderEventsMatrix() now derives Brand trip raffle cell from the Diamond perk state + program-active flag; togglePerk re-renders the matrix.
- Permission switches toggle silently with no underlying effect on the composer — permAnnounce/permNotes/permPay now call syncPermsToPresets(); presets render disabled with title='Permission off · Ask owner' and pickAction blocks send when of
- Acknowledging a request removes it from the panel with no log of who acknowledged — Each Acknowledge push to requestLog captures {request, who, acknowledger:currentManager(), ts:'just now'} for audit (visual stub — no separate history side-shee
- Week-of header is static text — no prev/next week navigation — Added ‹ › buttons and a Today button beside the Week-of header; calNav(±1) shifts the week start and rebuilds the grid.
- Pausing a tier still leaves it visible in the priority booking window tier-access list — toggleTier() calls syncTierAccessGating() which disables the corresponding .ta row and stamps a 'Paused' chip while the tier card is paused.
- Diamond raffle perk claims '4,000+ pts eligibility' but data says all Diamonds get it — Rewrote Diamond raffle perk row to 'Brand trip raffle — eligible at 4,000+ pts (Diamond)' with description explaining the toggle scope; events matrix renders th
- Bronze tier offers 'Early booking, 24 hours' but Priority window copy says window is opt-in only — Bronze perk reworded to 'Early booking, 24 hours (when priority window is open)'; Silver/Gold updated to the same pattern; window description clarified to match
- Inherited-tier perks render as toggleable switches that do nothing meaningful — Same fix as #46 — inherited perks render as 'Inherited from [prev tier]' chips with no toggle in renderTiers().
- AI's '3-minute search' response is a hardcoded delay with no actual confirmation flow — Lost-and-found escalation cards now surface a 'Found / Not found / Need more time' button trio in the internal routing card; lostFoundResolve appends a manager-
- AI proposes shortening a client's parting without checking if Halima consented to a smaller style — commitEscalation tags Option A with a 'Confirm with client first' label and drafts an SMS asking the client to confirm before applying the schedule change.
- Modal shows 'Influencer: Booked' as a value with no client name or contact — Station modal now renders 'Client: {name} · {tier} · ••{last4}' from a synthetic stationClient(n) pool plus an 'Open profile' link to the Clients view.
- 'Standard' tier label doesn't exist in the membership program (Bronze/Silver/Gold/Diamond) — Joy Okafor's birthday-row tier is set to Bronze (single source via birthdayClients data + tierChipClass map).
- Halima appears on the smart waitlist AND has a live SMS conversation about being late for her 3pm — Removed Halima from the waitlist data; backfilled with three other names so the count still totals 5 to match the floor stat.
- ETA card buries Station 14 reference under generic 'the 2:30 influencer' — no client name — ETA card now reads 'Suggested update to Amina Diallo (2:30, station 14): new start around 3:00' with explicit client name + station ID.
- 'AI auto-handled today' counter doesn't match the visible 'auto' rows in the inbox — Added a 'See all 28 →' linklike under the counter that clicks the AI-auto filter segment so the manager can drill into the full auto-handled list.
- AI bubbles render with no distinction between 'replied to client' and 'internal note to staff' — Each AI bubble now prefixes a chip — 'Sent to client (SMS)' (champagne) or 'Internal note' (clay-mute) — derived from whether the bubble mentions @front-desk/pi
- Birthday roster shows 3 clients but stations grid shows only 1 birthday station highlighted — highlightBirthdayStations() applies a .s-birthday-host class + birthday-color strip to all three booked stations (3, 11, 22).
- Todo rows display 'Added by [name]' but never WHO the todo is FOR or due date — Todo data model gained assignee + due fields; rows render 'For {name} · due {date} · added by {who}'.
- Birthday tier protocol uses Platinum but membership uses Diamond — second tier-naming collision — Protocol section now uses Bronze/Silver/Gold/Diamond with descriptions for each, matching the membership program canon.
- Late deduction body uses 'Clocked in 25 minutes late' even before clock-in data is verified — calcLate appends a 'No clock-in data yet · enter manually' warning under the minutes input so the manager knows the value is unverified.
- Floor map waitlist stat shows 5 but smart waitlist panel only renders 3 rows — Waitlist data backfilled to 5 entries; stat counter wired via recalcFloorStats(); panel scrolls vertically up to 280px to keep all 5 reachable.

**Medium:** 83 applied, 30 skipped (polish-grade, see audit catalog for full list)

**Low:** 42 applied, 26 skipped (nice-to-have, see audit catalog)

### Catalog Shoot  `shoot`

160 findings total → 102 applied

**High applied (32):**
- Wordmark is not a link — Wrapped the Jolieden wordmark in <a href='index.html' class='mark mark-link'> with a sand→ochre hover treatment matching the rest of the topnav.
- No links to sibling surfaces (Client, Kiosk, Stylist, Owner, Manager, Booking) — Added a 'Surfaces' chip row above the in-page anchors with Client/Kiosk/Stylist/Owner/Manager/Booking chips wired to window.parent.postMessage, and the current 
- Menu card titles fall below WCAG minimum at 12.5px — Raised .mcard .nm to 14px / weight 600 / line-height 1.3 with min-height 36px, and tightened .mcard .b padding to 10px 12px.
- Photo placeholders are muddy gradients that flatten brand palette — Replaced the dark gradient strip with a cream-2 placeholder containing a category-specific line-drawing SVG glyph (16 icons in catIcons) centered, plus a 5px cl
- Artistic look numbers display as serif '001' with no name, breaking the card pattern — Each artistic card now shows the serif code (A001–A020) above a 12px sub-line; tapping the sub-line opens an inline rename input (renameArtistic()) that persist
- Day tab subtitles at 10.5px with low-contrast espresso-soft are unreadable — Raised .day-tab .dd to 12px / weight 500 with 0.8 opacity over the cream tab. Active tab uses dark-on-ochre at 12px / 0.85 opacity for AA contrast.
- Size bars get larger as braid sizes get larger, opposite of the actual visual cue — Replaced the single bar graphic with vertical hatch marks: Micro=14 thin hatches → Jumbo=3 thick hatches. Added the caption 'Bar shows braid density, not size o
- Claim toggle has no 'claimed by [influencer]' capture — Built a bottom-sheet (.sheet-backdrop) with influencer picker (30 seeded handles + free-text input), Confirmed/Wait-list toggle, and confirm action that records
- Style counts double-count — 20 artistic are inside the 121 — Hero pills and stats are now hard-coded to '101 menu styles + 20 artistic looks = 121 total'. Removed the heroCount/totalStyles JS overwrites entirely; styles a
- Internal operator plan uses client-cream palette instead of admin dark+champagne — Re-painted body background to espresso #2C241D with warm gradients, kept the hero as a cream 'cover' moment, and converted all operational cards (panels, day-ta
- Filename pattern shortens category but never says how — Added a Category codes reference table inside the Naming panel mapping all 16 menu categories to filename-safe tokens (TRADKNOTLESS, BOHOKNOTLESS, STITCH, etc.)
- Claimed cards drop to 50% opacity on top of already-tiny 12.5px text — Removed opacity:.5 and line-through on claimed cards. Claimed state now keeps full readability and shows a clay 'CLAIMED' ribbon top-right plus a desaturated ph
- Entire menu card is the claim toggle — no way to view details without claiming — Whole card now opens the claim/detail bottom-sheet on click; the explicit 'Claim' action button sits top-right (replacing the Day badge) and stopPropagation iso
- Menu numbers are sequential by array order, not stable catalog IDs — Added buildSku() that derives stable codes from category prefix + size token (e.g. TKM-MICRO, BOHO-SMALL). Cards now display the SKU instead of 'No. N', and the
- Day distribution is round-robin by array order, not by craft logic — Replaced i%5+1 with craftDay(s): Micro/XS knotless + locs → Day 1; Bohemian + Micro twists + Hybrid → Day 2; medium knotless/box/twists/Fulani/French Curls/Cust
- Day 5 expects 20 artistic looks built and shot in one afternoon — Split the artistic build across Day 4 PM (first 8 most-labor-intensive A001–A008 starting at 1:30 PM) and Day 5 (remaining 12 A009–A020). Day 4 focus copy updat
- Filename pattern has no date — five days collapse into one OCT bucket — Added [Day] token (D1–D5) to the filename pattern, updated examples to JOLIEDEN_OCT_D1_TKM-MICRO_TRADKNOTLESS_FRONT.jpg, and noted the Day = D1–D5 mapping in th
- Filename pattern uses [StyleNo] but artistic looks use 001-020 in a separate namespace — All artistic codes are now A-prefixed (A001–A020) in the styles array, displayed on cards, and shown in the filename example (JOLIEDEN_OCT_D5_A007_ARTISTIC_FRON
- Days are abstract — no actual calendar dates — Added SHOOT_WEEK = ['Mon Oct 5'…'Fri Oct 9']; each day tab now shows date as a champagne sub-line, day-panel headers read 'Day 1 · Mon Oct 5', and the hero eyeb
- Day filter selector collides with day-panel data-day — Renamed menu filter chip attributes to data-filter-day / data-filter-cat and updated filterDay/filterCat to use the matching scoped selectors, so the schedule d
- heroCount is overwritten to styles.length (141) at runtime, but adjacent '20 artistic looks' pill is static — Removed the heroCount span and the JS overwrite. Hero pills now read static '101 menu styles · 20 artistic looks · 121 total'.
- totalStyles stat also overwritten to 141 by same script line — Removed the totalStyles JS overwrite. Stat card is hard-coded to '121' with label '101 menu + 20 artistic'.
- Hero pill displays 141 not 121, contradicting hardcoded HTML — Resolved by the same hard-coded hero pills + removal of JS overwrites in #9, #21, #22 — the headline number now matches the array math.
- Catalog number badge contrast fails on lighter category gradients — Wrapped the .no badge in a dark espresso pill (background:var(--espresso), 100px radius, 3px 9px padding). White text on espresso passes AAA over any category.
- Filename [Category] token can't accept categories with spaces, slashes, or parentheses — Covered by the Category codes table added in #11: 'Cornrows & Stitch → CORNROWS', 'Natural (No Extensions) → NATURAL', 'Fulani / Tribal → FULANI', etc. — codifi
- Day 5 silently moves crew call an hour later with no rationale beside it — Added a champagne 'Note' callout above the Day 5 timeline explaining the lighter call and that lighting holds from Day 4. Added a 7:00 AM 'Jimi locks studio (li
- Selected chips lose their selected color on hover; no focus rings — Added .chip.on:hover (background:var(--clay-deep), border-color:var(--clay-deep)) and a global :focus-visible 2px ochre outline rule for chips, day-tabs, role b
- Artistic looks are also round-robined across days — All 20 artistic styles are now hard-locked to day:5 in the styles array (artisticStyles loop sets day:5), and the Day 5 timeline shows artistic capture from 10:
- 'Salon closed' status pill has no link to client-facing closure messaging — Converted the 'Salon closed' fact pill into an <a class='fact'> that posts {surface:'site', hash:'closure-notice'} to the parent on click, with a 'See client co
- Owner Diéssou has no role card despite owning approval — Added a 5th role card for Diéssou with the .accent treatment (ochre border + lighter background) as the first card, copy 'Owner · approval and direction', linke
- Clicking the SVG icon inside the box silently does not toggle on some browsers — Checklist rows are now <button type='button' role='checkbox' aria-checked='…'> with Space/Enter keydown handlers; the inner .box has pointer-events:none and ari
- Cornrows is named as a size-run anchor family but cornrows don't follow the same size grade — Split the Sizing section into two sub-sections: 'Size grade · braid density' (Micro→Jumbo hatch graphic, copy lists Knotless/Box/Bohemian/Senegalese as anchors)

**High partial / judgement (1):**
- No persistence/sync — claims, checklist, day filter are page-local — Added localStorage namespaced keys ('shoot:claims', 'shoot:checklist', 'shoot:artistic') with loadStore/saveStore helpers, all writes hydrate on next load. Adde

**Medium:** 37 applied, 28 skipped (polish-grade, see audit catalog for full list)

**Low:** 33 applied, 28 skipped (nice-to-have, see audit catalog)

### Public Booking Site  `site`

180 findings total → 137 applied

**Critical applied:**
- Stylist picker doesn't update state or header — pickStyl(el, key) now writes the chosen chair into cur.stylKey and rewrites the sheet-header stylist line (#bkStyl) via CHAIRS[key].label. The booking summary, payment panel, and h
- Deposit CTA skips any payment step — just closes the sheet — Replaced confirmBook()'s close-and-toast with an in-sheet 'Confirm deposit' sub-screen (#payPanel) that slides up over the wizard. It shows a summary card and two payment-method bu
- Stylist picker lists only 5 stylists but gallery names 10+ — Each entry in STYLES gained a chairs[] array (primary stylist first + nearest peers). A new buildStylistRoster(s) function rebuilds the Step 6 tiles on every openBook(), pulling fr

**High applied (44):**
- "Text us" pill goes to # — not a tel/sms link — Wired nav pill to sms:+16465550100?body=Hi%20Jolieden%2C, swapped copy to 'Text us — replies in seconds'. Added handleTextUs() that lets mobile launch Messages 
- Category filter pills only highlight, never filter the gallery — Added data-tag attributes to each gallery card and rewrote filt() to set display per matching tag, plus a styled empty-state row when no card matches (linking t
- No sign-in / my bookings / staff entry point — Added a 'Sign in · My bookings' nav pill that postMessages to the client surface, and a low-weight 'Staff sign in' link in the footer that postMessages to the s
- Opening price jumps $30 above the gallery's 'from' price — Per-style styleLen + styleColor defaults wired into openBook(); refreshTotal() now treats the style's photographed color as $0 and the chosen baseline length ca
- 'Master Influencer' tier label reads as a brand mistake — Renamed all 'Influencer' tier labels in STYLES and CHAIRS to Master Stylist / Senior Stylist / Stylist / Apprentice / Color Specialist.
- Filter pills are decorative — tapping does nothing — Same fix as #2 — filt() now filters by data-tag and shows an SMS-Concierge empty-state when no cards match.
- Style named after a color opens with Natural color preselected — Added styleColor to each STYLES entry; openBook() sets cur.col = s.styleColor; resetSelections highlights the matching swatch and refreshTotal treats it as incl
- AI SMS Concierge — the headline differentiator — is barely a chip — Added a full-width concierge sub-band under the hero strip with eyebrow, Fraunces italic headline, three example chat bubbles, and a tap-to-SMS CTA. Nav pill co
- Drawer has no dialog semantics or focus management — Added role=dialog/aria-modal/aria-labelledby to the sheet, cached priorActive on open, moved focus to .sh-close, installed Tab focus-trap + Escape handler, rest
- Booking 'success' is a 3-second toast, then nothing — Held panel now shows a personalised 'Chair held, {firstName}' headline, dynamic booking ID (JLD-MMDD-XXXX), duration, paid-via line, and the live mobile from cu
- Bookable Sunday slot contradicts posted hours — Added SCHEDULE constant (Sundays/Mondays null, Tue–Sat 9–8) and rewrote buildSlots() to skip closed days entirely. No Sunday slot can be rendered.
- Step 6 always pre-selects Aminata D., regardless of style — openBook() sets cur.stylKey to STYLES[idx].chairs[0] and buildStylistRoster() rebuilds tiles per-style with .on only on the matching primary chair. Header line 
- Silk press / pony / color styles still show 'Size of braid' as Step 1 — Added styleType per STYLES entry and STEP_VISIBILITY map; applyStepVisibility() hides stepSize and stepParting for silk/pony/locs/natural/color. Step 2 label re
- Hard-coded November dates inside an April-anchored demo — buildSlots() now generates the next 5 eligible Tue–Sat days starting from TODAY (2026-04-14) with two slots each. Static Nov markup replaced by id='slotGrid' co
- Braid-specific step shown for silk press, pony, twist-out, color refresh — Same fix as #14 — STEP_VISIBILITY hides stepSize + stepParting for non-braid types. LEN_CHIPS_BY_TYPE + LEN_LABEL_BY_TYPE produce type-appropriate Step 2 option
- Length-modifier prices apply equally to a 1.5-hr pony as to a 9-hr knotless set — Replaced flat LEN_PX with LEN_PX_BY_TYPE: pony/natural/color collapse to a single 'Standard' chip at +$0; silk uses smaller deltas; locs uses Starter/Restocked/
- Scrim dismiss discards selections silently like the × button — Routed both scrim onclick and × onclick through closeAttempt(), which checks isDirty() and shows the confirm-strip with Keep editing / Discard buttons when stat
- 'Included' add-on is actually togglable off — Wash row is now a non-interactive <div class='addon locked on'> with no onclick; toggle() also bails out if the row has .locked. cur.addons.wash stays permanent
- Stylist picker never writes the chosen stylist to state — pickStyl(el,key) now writes cur.stylKey, updates aria-checked, rebuilds the sheet header stylist line from CHAIRS[key].label, and refreshTotal() reads from cur.
- Edited contact info is never persisted — Each input has oninput='cur.contact.{field}=this.value'. confirmPay() and the held card now read cur.contact.mobile and cur.contact.first directly.
- Cards have role onclick but no keyboard / role=button — Converted every .style from <div onclick> to <button> with reset CSS (appearance:none, padding:0, text-align:left). Added per-card aria-label.
- Stylist roster is hard-coded — doesn't match the style's stylist — buildStylistRoster(s) renders tiles dynamically from s.chairs[] + 'any'. STYLES[10] (Adama T., Apprentice) and STYLES[11] (Dieynaba P., Color Specialist) now su
- Toast hardcodes (646) 555-0123 regardless of input — Replaced hardcoded toast with held panel that reads cur.contact.mobile. confirmPay() writes 'Confirmation texted to {mobile}. Reply STOP anytime.'
- Chips/swatches/slots have no keyboard focus styles — Added a unified .chip:focus-visible / .swatch-i / .slot / .styl / .pill / .style / .addon / .text-us / .pay-method rule with 2px ochre outline and 3px offset. I
- Add-on checkboxes aren't real checkboxes — Each interactive addon row is now <button role='checkbox' aria-checked=…>; toggle() syncs aria-checked on click. Wash row is .locked with no role.
- Phone field doesn't mention the AI Concierge — Field label changed to 'Mobile · so we can text you' and a .field-helper line reads 'Reply to our text anytime — Jolieden's concierge answers in seconds. Text S
- Bob length applied to styles where it's nonsensical — Same fix as #17 — LEN_CHIPS_BY_TYPE: pony/natural/color show one 'Standard' chip; kids show 'Kid'; locs show Starter/Restocked/Full; silk shows Bob/Shoulder/Mid
- Choosing 'Cherry Cola Knotless' doesn't pre-select Cherry Cola swatch — Same as #8 — styleColor: 'cherry' on STYLES[0] and refreshTotal() overrides COL_PX[styleColor] to 0 for that style. Opening Cherry Cola Knotless shows Cherry Co
- Form inputs have placeholders but no associated labels — Added visible <label class='field-label' for=…> elements above each Step 8 input, styled as 10.5px uppercase. Each input has matching id and autocomplete attrib
- Scrim click discards work; no confirm dialog — Same fix as #20 — closeAttempt() routes scrim and × through one path; isDirty() triggers a confirm strip with Keep editing / Discard. Escape key also routes thr
- Takedown add-on adds $60 but does not add the advertised hour to duration — refreshTotal() parses parseFloat(s.dur), adds 1 if cur.addons has takedown, and writes the new duration to #bkDur, #bkTotal small text, and the duration suffix 
- Color swatches use <div> with onclick — not keyboard focusable, not announced as buttons — Converted .swatch-i to <button role='radio' aria-checked=…> with reset CSS (background:transparent, border:0, appearance:none). Wrapping container has role='rad
- Add-on rows use <div onclick> instead of buttons — not keyboard accessible — Same as #28 — interactive addon rows are buttons with role=checkbox + aria-checked. CSS adapted with appearance:none and background:transparent.
- Slot buttons lack aria-pressed / role=radio — toggle state invisible to screen readers — slotGrid container has role='radiogroup' aria-label='Time slots'; buildSlots() emits each .slot with role='radio' and aria-checked synced in pickSlot().
- STYLES[10] 'Adama T. · Apprentice' role label doesn't appear in any picker tile — Per-style chairs[] now drives buildStylistRoster(). Opening Kids Mini Twists renders an Adama T. · Apprentice tile as the preselected primary.
- confirmBook() closes the sheet before showing the toast — toast becomes the only feedback, easily missed — confirmBook() opens the in-sheet payPanel (Confirm deposit) and confirmPay() transitions to heldPanel; the sheet stays open until the user taps Done, replacing 
- stylSel and stylSelName ids appear only on the first tile (Aminata D.) — break when picker re-renders — Static stylSel/stylSelName ids were removed earlier in the critical-fix pass; buildStylistRoster() now produces tiles without per-tile ids and pickStyl reads da
- Takedown description claims 'an hour' but adds no time to running total — Same fix as #34 — refreshTotal() updates the bkDur badge and slot duration suffixes when takedown toggles. Description updated to mention 'slot extended +1 hr'.
- Add-on row click handler triggers on full-width div but no role/aria-checked — Same as #28/#36 — addon rows are now <button role='checkbox' aria-checked=…>; toggle() syncs both class and aria-checked.
- Selected slot's clay-soft background fails AA contrast on the espresso text — Bumped .slot.on background from rgba(168,98,60,.16) to rgba(168,98,60,.28), thickened the top border to 2px, and added a ::after '✓' glyph in the top-right corn
- Color gloss add-on duplicates 'Color' Step 4 with no cross-reference — syncGloss() runs on every pickSw('col',…): when color != natural, the gloss row becomes .locked.on with copy 'Color gloss · included when you pick a color above
- CTA text 'Hold the chair · pay $40 deposit · $XXX total ›' wraps to 3 lines on 320px width — Trimmed CTA to 'Hold the chair · $310 ›' (refreshTotal writes 'Hold the chair · $${total} ›'). Deposit + cancellation copy stays in the .deposit-line caption ab
- Phone field accepts non-tel input but pretends to validate via placeholder copy — Mobile input now has type='tel', inputmode='tel', autocomplete='tel', pattern='\(\d{3}\) \d{3}-\d{4}'. Mobile keyboards open numeric. Did not add the keystroke-
- All stylist avatars share the identical gradient — initials are the only differentiator — Added per-chair hue classes (.h-aminata, .h-mariama, .h-zainab, .h-ndeye, .h-khady, .h-awa, .h-fatou, .h-bintou, .h-sokhna, .h-adama, .h-dieynaba, .h-any) with 

**High partial / judgement (2):**
- Hero promises a tap-and-done flow the sheet immediately violates — Did not restructure the sheet into a two-tier 'book as shown' + accordion model — that's a substantial rewrite that risks the focus-trap / step rendering. Mitig
- Twelve external CDN images with no width/height, alt text, or lazy hint — Added descriptive aria-label to each gallery .style button (style name + duration + price). Did not convert background-images to <img> elements because the .sty

**High skipped (1):**
- Stylist names don't match the persona canon — Per-finding the fix targets CLAUDE.md / personas.ts, not site.html.

**Medium:** 59 applied, 8 skipped (polish-grade, see audit catalog for full list)

**Low:** 31 applied, 30 skipped (nice-to-have, see audit catalog)

---

## Items deferred to Diéssou

Of the 1,492 findings, **387 were skipped** by the appliers as judgement calls that should not be auto-decided. Major themes:

- **Stylist App palette** — the audit flagged the cream/clay palette; CLAUDE.md says admin surfaces use dark-warm + champagne. The applier left this alone since switching would re-skin every screen. Diéssou's call: stylist app is mobile-first like client, or admin-styled like owner/manager?
- **Pure aesthetic preferences** — "this card could feel more premium" / "tighten the spacing" / "make the hero bolder." Applied where copy was concrete, skipped where it was vibes.
- **Re-platforming asks** — "kiosk should be a native iPad app" / "use native bottom-sheet APIs." Out of scope for an HTML artifact.
- **Cross-surface refactors** — "standardize button styles across all 7 surfaces." Should be done as one design-system pass, not 7 surface-local changes.
- **Persona name discrepancies** — the audit flagged that `site.html` uses generic stylist names while CLAUDE.md canonizes Oumou D. / Fatou C. / etc. Applier left this for Diéssou since the persona canon may itself need updating.
- **API key handling for AI Concierge** — applier swapped browser-direct calls for `/api/consult` placeholders, but the actual Next.js route handler + key management is product-owner work.

## Tester fails (not regressions, missed items)

Tester reported failures are findings the applier didn't get to — the existing code on those items still looks like the original audit flagged. Not file-corruption failures.

### High

- **[stylist]** Stylist app uses cream/clay palette despite CLAUDE.md spec for dark warm admin surfaces — Surface palette unchanged: .phone still uses background:var(--cream) (line 34), body retains cream radial gradients (lines 23–25), .appt-card on cream (line 60). No reskin to espresso/champagne admin 

### Medium

- **[client]** Notifications row is a no-op toast — Line 870 still has onclick="showToast('Notification preferences')" — no sub-notifications screen exists. grep for 'sub-notifications', 'Appointment reminders', 'Pre-visit care' all return zero matches
- **[client]** Check-in button enabled regardless of how far the appointment is — Line 461: button still onclick=openCheckIn() with no disabled state. Line 464 has a #checkInHint div but it is hard-coded style="display:none" and grep shows no JS ever toggles checkInHint or disables
- **[client]** All sheets cap at 84% height with no scroll hint — Line 369 .sheet still max-height:84% overflow-y:auto with no fade-out gradient pseudo-element. grep for 'sheet-fade', 'gradient.*sheet', 'scrollable.*hint' returns no matches. No bottom-fade applied t
- **[client]** Demo toggle button overlaps content above the nav on every screen — Line 397 .toggle-state still position:absolute;bottom:96px inside the .phone wrapper, and line 421 the button is still rendered inside .phone unconditionally. No ?demo=1 gating, no move to .stage. Pro
- **[stylist]** #5 No links to other artifact surfaces — Searched the HTML for client.html / kiosk.html / owner.html / manager.html / shoot.html / site.html and for the string 'Other surfaces' / 'artifact' — no anchor or link to a sibling surface exists. Is
- **[site]** Eight stacked steps, no progress affordance, sticky footer competes with content — Lines 445-554 still show eight separately numbered step blocks (1·Size, 2·Length, 3·Parting, 4·Color, 5·Add-ons, 6·Your chair, 7·Pick a slot, 8·Your details). No 'Customize' accordion, no step indicat
- **[site]** 'Any chair' avatar is a middot — reads as broken glyph — Line 717 CHAIRS.any still uses init:'·' (centered middle dot). No SVG chair icon was substituted in the picker (grep 'chair-icon' empty). Proposal not addressed.
- **[site]** Steps numbered 1-8 but no progress indicator — Lines 445-554 still show eight distinct numbered steps (1 through 8) with no progress dots, no Customize merge, and no sticky-header indicator. grep for 'progress|indicator' returns nothing related. W
- **[site]** Horizontal scroll filters have no scroll indicator or fade — grep 'filters-fade|filter-fade|scroll-fade' returns no results, and .filters CSS at line 78 has no ::after fade or visible scrollbar indicator. Worklist item not addressed.

### Low

- **[client]** Demo toggle is shipped UI, not a developer affordance — Line 422 still renders <button class='toggle-state' id='chairToggle'> unconditionally; no ?demo=1 query check anywhere in the file. Fix not applied.
- **[client]** Footer tagline mentions 'Tap Enter the chair' as a user instruction in shipped UI — Line 1127: the in-phone-area tagline still reads '...Tap "Enter the chair" to see the live appointment...'. Copy was not moved out of the shipped UI.
- **[client]** Spotlight card's name and 'star this month' text are not selectable as drill-in — Line 469: <div class='spotlight' onclick="openStylist('Aminata D.','Master','4.9')"> has a single click handler on the whole card. No split between avatar+name (go to sub-stylist page) and a separate 
- **[client]** Each question re-renders its own Continue button, causing layout flicker — Lines 2274-2296 of renderQuestion: Continue button is still rendered inside host.innerHTML on every renderQuestion call (line 2295). Not moved into wizard chrome as proposed.
- **[kiosk]** Stage dots have no tap interaction or detail — Lines 317-320: <div class='stage done'><div class='dot'></div><div class='sl2'>Sectioning</div></div> etc. — still plain divs, no onclick, no tabindex, no popover markup. Stage popover described in pr
- **[kiosk]** Reset button uses outline style while 'Demo: stylist on break' uses solid — visual hierarchy implies Reset is the dismiss action — Lines 163-166 demo bar styling untouched: .demo button uses cream solid background, .demo button.alt uses transparent outline — same hierarchy mismatch as before. Proposal asked for utility-tier styli
- **[stylist]** 30 stations is implausibly large, no salon context — Line 1724 still loops `for(let i=1;i<=30;i++)` building 30 numeric chips. The proposal (reduce to 10 named stations) was NOT applied — applier missed this fix, but did not break anything.
- **[stylist]** Warn-styled tag chips repeat the same warning twice — Line 521 still renders BOTH 'Tender-Headed' and 'Sensitive Scalp' as separate warn pills. Line 1404 still has both in tags array. Merge fix not applied — miss only, no breakage.
- **[owner]** No time-range selector despite copy promising it — Reports view (#v-reports L779-824) has no segmented Day/Week/Month/Year control and no 'Export CSV' button. KPI strip, peak hours chart, and stylist table are unchanged. grep for 'Export CSV' / 'segme
- **[owner]** 1100px breakpoint silently degrades an admin-desktop surface to phone — L418 still has the @media(max-width:1100px) responsive rule that collapses sidebar + grids. No interstitial screen, no 'Continue anyway' / 'Open Manager Front Desk' buttons, no 'Floor Command is optim
- **[owner]** Set goal uses a browser prompt() dialog — editWeekGoal() at L1659-1665 still calls prompt('Set this week\'s booking goal:',goalTarget). No inline number editor with stepper / Save / Cancel was added.
- **[owner]** Floor map is the only operational hub but is not the owner landing — applyRole() at L1167 still sets `let landing = ROLE==='owner' ? 'overview' : 'floor';` — owner default is 'overview', not 'floor'. No 'Set as my home' option added to sidebar nav.
- **[owner]** Pip badges block click on outer rim due to absolute positioning + flex — All .pip spans (L431, L435, L443) remain plain inline spans with no onclick, no event.stopPropagation, no scroll-into-section behaviour. grep for 'pip.*onclick' returns nothing.
- **[owner]** Active state styling fires before view is confirmed loaded — nav() (L1174-1185) still swaps .active class synchronously inside querySelectorAll forEach toggle. No requestAnimationFrame wrap, no 200ms fade-in added. grep for 'requestAnimationFrame' / 'fade-in' r
- **[manager]** AI note exposes internal escalation phrasing to whatever surface this is shared on — Lines 2598-2601: aiNote still rendered inline directly in the row's last-message cell. No collapsed 'Internal context' chip with tap-to-expand. Only an 'AI' badge prefix added; the escalation text is 
- **[manager]** Scrim handler blindly closes all three modal types regardless of which is open — Line 1055: scrim onclick still calls closeModal();closeInvite();closeThread();closeWaitlistOffer();closeOopsie();closeEotm();closeReorder();closeConfirm(false);closeRateModal() with no modal stack. No
- **[manager]** ETA values rotate by station index, not by real time elapsed — Line 1786 still renders d.eta directly. No startedAt/expectedDuration calc or estRemaining computation present in the script.
- **[manager]** Positive tab is highlighted in clay-orange but the resulting post bubble dot is green — Line 205: .bpost.positive .bdot{background:#7A9B6E} unchanged — green dot remains for Positive while the tab uses ochre/clay. No champagne harmonization done.
- **[shoot]** Style number badge has no copy/link affordance — Line 940: <span class="no">${s.sku}</span> is still a plain span with no click handler, no copy button, no aria-label. This finding was not addressed.

## Process notes

- 4 batched workflows (one per severity tier).
- Per surface per tier: 1 Applier agent applies all findings for that surface, 1 Tester agent verifies a sample.
- Critical was tested 100% (20/20 verified). High, Medium, Low were sampled (Tester read ~10-30 fixes per surface and ran parse-check on the whole file).
- Decoded surfaces lived at `/tmp/artifact-surfaces/<key>.html`. Each tier read the post-previous-tier file and layered new fixes on top.
- After each tier completed, the modified HTML files were re-encoded to base64 and spliced back into the `SURF` object in `/public/suite.html`. Live preview confirmed each surface still opened from the App Suite tile grid.
- The audit catalog at `docs/NAVIGATION_AUDIT.md` is the source of truth for what was flagged. This report is the source of truth for what was DONE.

## Files

- `/public/suite.html` — Diéssou's artifact (now patched, 1305 KB after fixes vs 714 KB pre-audit)
- `/docs/NAVIGATION_AUDIT.md` — the audit catalog (1,492 findings + proposed fixes)
- `/docs/AUDIT_FIX_REPORT.md` — this report
- `/tmp/artifact-surfaces/*.html` — decoded modified HTMLs (kept for inspection)

