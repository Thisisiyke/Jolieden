# Open Questions for Diéssou — Pre-Kickoff Questionnaire

> **Hi Diéssou — please read through this before our kickoff call on June 15.**
>
> These are the decisions only you can make. They unblock 8+ months of build work, so the more concrete you can be, the faster we move. **Most answers are 1 sentence or a number.** Skip anything you're not sure about — we'll flag it on the call.
>
> The technical decisions (frameworks, databases, API design) are answered separately in `QUESTIONS_BACKEND.md` and `QUESTIONS_FRONTEND.md` — those don't need your input. This file is just yours.
>
> **75 questions total**, grouped by theme. Most are checkboxes or short answers.

---

## 1 · Money & booking rules

| # | Question | Why we need to know |
|---|---|---|
| 1.1 | **Deposit amount.** Is it always **$40** flat, or is it a **percentage of the total (e.g., 30%)**? Or **per-service** (e.g., $40 for braids, $20 for silk press)? | Drives every booking flow. We have to pick one and code it. |
| 1.2 | **Cancellation window.** How many hours before the appointment can a client cancel and get the full deposit back? *(industry standard: 48 hours)* | The app refunds automatically if they're inside the window. |
| 1.3 | **Late cancellation.** If they cancel inside that window, do they: forfeit the deposit, get partial credit, or get full credit toward a future booking? | |
| 1.4 | **No-show.** Client doesn't show up at all. Do they get charged: just the deposit, a fixed no-show fee, or % of the booking total? | |
| 1.5 | **Late arrival grace.** If a client is **15 minutes** late, do we hold the chair? **30 minutes?** What's the cutoff before it becomes a no-show? | Affects the floor map "Needs attention" trigger. |
| 1.6 | **Tipping flow.** Where does tipping happen — at the chair (paper/cash), in the app at checkout, both? Recommended tip %s shown? | |
| 1.7 | **Refunds.** If a service goes wrong, what's the maximum refund a manager can issue without your approval? *(example: up to $200 by a manager, more requires Diéssou)* | We code two refund permission tiers. |
| 1.8 | **Sales tax.** Confirm New York state + NYC = **8.875%**. Is hair always taxed at the same rate? Are tips taxable? | |
| 1.9 | **Service price + hair fee.** Some services include hair, some don't. Is the **hair fee** shown as a separate line item on the receipt, or rolled into the service price? | The owner.html builder shows separate fields — confirm. |
| 1.10 | **Quoted price → actual price.** What if the stylist needs to upcharge mid-service (extra length, more hair than expected)? Who approves — manager or stylist? Does the client get a heads-up first? | |

---

## 2 · Stylist commission & pay

| # | Question | Why |
|---|---|---|
| 2.1 | **Commission %.** What % does a stylist earn on a service? Is it the same across all tiers (Apprentice / Stylist / Senior / Master), or different per tier? | |
| 2.2 | **Commission on add-ons.** Same % as the base service, or different (e.g., beads earn less)? | |
| 2.3 | **Hair fee commission.** Does the stylist earn % on the hair fee, or is the hair fee 100% house? | |
| 2.4 | **Tips.** 100% to the stylist always, or split (e.g., 80/20 with house)? | |
| 2.5 | **Oopsie clawback.** When a client has an Oopsie repair, does the original stylist lose 100% of the commission for that service, or partial? | |
| 2.6 | **Payout cadence.** Weekly, biweekly, or end-of-month? On what day? | |
| 2.7 | **Payout method.** Stripe Connect (instant to debit card), ACH bank transfer, or cash from the register? | |

---

## 3 · Membership tiers + rewards

| # | Question | Why |
|---|---|---|
| 3.1 | **Tier names.** The mockups show **Bronze / Silver / Gold / Diamond**. Confirm these are the four tiers, in this order. Any tier names you'd swap? | |
| 3.2 | **Tier qualification.** Do clients qualify by: dollars spent (lifetime), visits per year, points earned, or paid subscription? | The mockup says "Jolieden Circle" is paid — clarify what's auto vs. paid. |
| 3.3 | **Points per dollar.** How many points does a client earn for every $1 spent on services? Is tip earning the same rate? | |
| 3.4 | **Tier thresholds.** Approximate dollar/point thresholds for Silver / Gold / Diamond? | We can fine-tune later but need a starting number. |
| 3.5 | **Tier perks.** Confirm Diamond perks beyond what's in the mockup (priority booking, holiday slots, member pricing, monthly maintenance visit). Anything tier-specific you want? | |
| 3.6 | **Jolieden Circle.** Is the Circle a separate paid membership (subscription) with its own perks, OR is it just the top tier? Monthly fee if paid? | |
| 3.7 | **Referral program.** Referrer gets ___ points. Referee gets ___ (discount? free add-on?). When does the bonus fire (referee's first booking? completion?) | |

---

## 4 · Birthday system

| # | Question | Why |
|---|---|---|
| 4.1 | **Birthday week.** How many days before and after the actual birthday counts as "birthday week"? *(e.g., 3 days before to 3 days after)* | Drives the perk eligibility window. |
| 4.2 | **Birthday gift.** Confirm the comp gift: **free Wash & Blow**, OR a fixed-dollar credit (e.g., $50 off), OR something else? | |
| 4.3 | **Bonus points.** Bonus points added on a birthday-week booking? How many? | |
| 4.4 | **Birthday week boundaries — repeat visits.** If a client visits twice in their birthday week, does each visit get the perk or just the first? | |
| 4.5 | **Birthday celebration at the kiosk.** Confirm: when a birthday client signs in at the chair, the kiosk fires a **full-screen "Happy Birthday" celebration**. Should we do music? Confetti? Animated? *(default: confetti animation + signature message)* | |
| 4.6 | **Birthday locked after first save.** Confirm: once a client sets their birthday in the app, they can't change it themselves — has to come to the front desk. ✅ already set as default. | |
| 4.7 | **Birthday for kids.** A child booked under a parent — does the kid get their own birthday week? | |

---

## 5 · Stylist & staff specifics

| # | Question | Why |
|---|---|---|
| 5.1 | **"Influencer" naming.** The mockups call stylists **"Master Influencer," "Senior Influencer," etc.** Confirm this is the **public-facing** name. (Internal database calls them "stylists.") | |
| 5.2 | **Languages stylists speak.** Confirm the FR / EN toggle is only on the **stylist app** for francophone staff? Or do you want clients to be able to filter by stylist language (e.g., "I want a French-speaking braider")? | |
| 5.3 | **Stylist photos.** Do you have professional headshots for each of the ~23 stylists, or do we shoot them as part of the October Lookbook? | |
| 5.4 | **Stylist tier perks for staff.** Does a Master Influencer have any perks vs. an Apprentice (better hours, higher %, etc.)? | We'd encode this as eligibility flags. |
| 5.5 | **Front-desk role.** Is the **front desk** a separate role from Manager? Or are managers the front desk? | Affects who can issue refunds, send invites, override birthdays. |
| 5.6 | **Apprentice supervision.** Can apprentices be assigned bookings independently, or always with a senior overseeing? | |
| 5.7 | **Break cap.** Confirm: max **4 of 30** stylists on break at once? Default break length **30 minutes**? | |
| 5.8 | **Clock-in.** Stylists clock in via app. Do you want **geofence enforcement** (only if at the salon's location), or trust-based? | |

---

## 6 · The AI Concierge

| # | Question | Why |
|---|---|---|
| 6.1 | **Voice & tone.** The AI replies as "Diessou" — fully in your voice with 💛 and casual warmth, or more formal? *(default: warm, your voice, emoji sparingly)* | |
| 6.2 | **What the AI is allowed to do without asking.** Confirm: book appointments, reschedule, cancel, answer prep questions, check lost-and-found, send confirmations. **NOT allowed**: issue refunds, override prices, share other clients' info. | |
| 6.3 | **Escalation triggers.** When should the AI flag a manager? *(suggested defaults: VIP/Diamond clients, complaints, refund requests, anything ambiguous about kids policy, anything about cancellations < 48h)* | |
| 6.4 | **Response time SLA.** When the AI escalates, how fast should a human respond? *(e.g., during open hours: within 15 min)* | |
| 6.5 | **After hours.** When the salon is closed, does the AI: keep replying autonomously, send "we'll get back to you in the morning," or both depending on urgency? | |
| 6.6 | **Style Consultant in the app (separate from SMS).** Confirm: there's a separate AI inside the Client App (the "Consultant" tab) that helps clients pick looks. Same voice as Concierge? | |
| 6.7 | **AI transcripts.** OK to retain transcripts indefinitely for audit + AI quality review? Or delete after 30/90 days? | TCPA-compliance question. |

---

## 7 · Communication & SMS rules

| # | Question | Why |
|---|---|---|
| 7.1 | **Salon's outbound number.** Confirm: **(646) 555-0100** is the number SMS goes out from, and is also where clients text to reach the AI Concierge. *(real number TBD)* | |
| 7.2 | **24-hour reminder.** Send automated SMS 24 hours before every appointment? **Y/N** | |
| 7.3 | **Hour-of-service reminder.** Also a 1-hour reminder? Or 2-hour? | |
| 7.4 | **Birthday week outreach.** SMS the client the week of their birthday with the perk offer? | |
| 7.5 | **Post-visit thank-you.** SMS after the visit asking for a rating? **Y/N** | |
| 7.6 | **Marketing SMS.** Confirm: only sent to clients who explicitly opt in. Default at signup is **opt out** (TCPA-safe). | |
| 7.7 | **Email transactional vs. marketing.** OK to default email-on for booking confirmations + receipts, off for marketing? | |
| 7.8 | **Languages for SMS.** SMS goes out in English only, or also French? | |

---

## 8 · Public booking website

| # | Question | Why |
|---|---|---|
| 8.1 | **URL.** Will it live at **joliedensbeautybar.com/book**, **book.joliedensbeautybar.com**, or replace the homepage? *(default recommendation: `/book`)* | |
| 8.2 | **Existing site stays.** Confirm the rest of joliedensbeautybar.com (About, hours, contact) stays as-is. We only replace the Boulevard "Book Now" widget. | |
| 8.3 | **Anonymous browsing.** Confirm: visitors can browse the gallery without an account. Account only required at the moment they hit "Hold the chair." | |
| 8.4 | **First-time-visitor signup.** When someone books for the first time and has no account: collect phone (OTP), name, email at booking. **Anything else?** Address? Pronouns? | |
| 8.5 | **Filters on the gallery.** Confirm the filter categories: All / Knotless / Box braids / Fulani / Silk press / Natural set / Kids / Color & gloss. Any to add or remove? | |
| 8.6 | **Sort order default.** Most popular / Newest / Most affordable? | |
| 8.7 | **Slot picker date range.** Show next **14 days** by default, with "see more" for further out? Or further out by default? | |

---

## 9 · The Catalog Shoot (Phase 2)

| # | Question | Why |
|---|---|---|
| 9.1 | **Timeline.** The "October Lookbook" — which October? **2026?** This affects whether we can build it before launch or do it after M3. | |
| 9.2 | **In or out of base scope.** Per the contract, the **production logistics** (studio, photographer, influencer comp, image releases) are **out of scope** under the base engagement. Confirm. | |
| 9.3 | **Software for the shoot.** Do you want us to build a small **shoot-ops tool** (signups, claim-a-look, image release intake, asset upload, look mapping)? If yes, that's a Phase 2 add-on we'd quote separately. | |
| 9.4 | **Influencer recruitment.** Who recruits influencers — you, an agency, social outreach? | |
| 9.5 | **Image release.** Do you have a release form already, or do we draft? Signed digitally at the kiosk? | |

---

## 10 · Hardware & operations

| # | Question | Why |
|---|---|---|
| 10.1 | **Kiosk hardware.** Per contract you're buying the iPads. **iPad model preference?** *(recommend: iPad 10th gen Wi-Fi, base spec)* How many? | |
| 10.2 | **Kiosk mounts.** Stand at each chair, wall-mount, or counter-mount? Brand? | |
| 10.3 | **Kiosk Wi-Fi.** Salon Wi-Fi adequate for 30 tablets streaming progress + photo uploads? | We can recommend a router upgrade if needed. |
| 10.4 | **POS hardware.** Do you have a credit card reader / receipt printer / cash drawer? If yes, brand + model? If buying new, recommendation? | |
| 10.5 | **Kiosk auto-sleep.** Should the tablets dim/sleep when no client is in the chair, or stay always-on? | Battery life decision. |
| 10.6 | **Front-desk setup.** Is there a dedicated front-desk computer / iPad, or do staff work off their own phones + the floor map? | |
| 10.7 | **Phone routing.** When a client calls the salon, where does it ring — front desk, manager phone, voicemail with AI Concierge handoff? | |

---

## 11 · Multi-location & expansion

| # | Question | Why |
|---|---|---|
| 11.1 | **Second location.** Realistic timeline for opening a second salon? *(rough — this affects how aggressively we invest in multi-location features now)* | |
| 11.2 | **Same brand?** Same name + brand, or a different brand under your ownership? | |
| 11.3 | **Cross-location stylists.** Will a stylist ever work at two locations in the same week, or strictly one? | |
| 11.4 | **Shared client + rewards.** If a Harlem client visits the new location, do their points + tier follow them? | |

---

## 12 · Brand + visual decisions

| # | Question | Why |
|---|---|---|
| 12.1 | **Logo files.** Do you have a vector SVG of the JOLIEDEN logo (the gold script + "Beauty Bar" italic subhead)? | Needed for app icons + emails. |
| 12.2 | **App icon.** Should the iOS/Android app icon use the JD monogram, the JOLIEDEN wordmark, or both? | Mobile app store requires final art. |
| 12.3 | **Brand voice review.** Do you (or someone on your team) want to **review every piece of transactional copy** (confirmations, reminders, receipts) before launch, or trust us to write to your voice? | |
| 12.4 | **Photography style.** The October shoot will produce 121 photos. **Studio cyc with one background**, on-location at the salon, or a mix? | |
| 12.5 | **Stylist portrait style.** Same as above — studio headshots, in-chair candids, or both? | |
| 12.6 | **App color mode.** Confirm: client app + booking site = **cream/champagne**; admin = **dark warm + champagne**. Should the **mobile app support dark mode** that follows the user's iOS/Android system setting? | |

---

## 13 · Legal + compliance

| # | Question | Why |
|---|---|---|
| 13.1 | **Privacy policy + Terms.** Do you have existing legal copy for the website, or do we draft new? *(We can recommend a service like Termly for $99/yr.)* | |
| 13.2 | **Image releases for hair-journey photos.** When a stylist captures before/after for a client's Hair Journey, does the client need to sign a release for in-app use? *(Recommendation: yes, on first visit, broad consent.)* | |
| 13.3 | **Minor consent.** For kids' services — does the parent sign for everything (photos, app account, etc.)? | |
| 13.4 | **Boulevard data migration.** Do you want to export your existing client list from Boulevard and import into the new system? *(Per contract A.4, this is out of scope — separate engagement if you want it.)* | |
| 13.5 | **PCI compliance.** Confirm we'll use **Stripe-hosted payment fields** so the salon never touches raw card data. | |

---

## 14 · Operations going live

| # | Question | Why |
|---|---|---|
| 14.1 | **Beta tester list.** Identify **5-10 clients** for the closed beta in January. They'll get the mobile app early, give feedback. | |
| 14.2 | **Stylist training.** Who runs the training session for stylists on the new app? **You, a manager, or do you want us to lead it?** | |
| 14.3 | **Boulevard sunset date.** When you flip the switch from Boulevard to the new booking site, do you want a **soft launch** (both available for 2 weeks) or **hard cutover** (Boulevard off, new on)? | |
| 14.4 | **Press / announcement.** Do you want a public announcement when the new app launches (Instagram, email blast)? We can prep the copy. | |
| 14.5 | **Founder access.** Confirm: every "Founder Access" action (refunds > $X, birthday lock overrides, terminating staff) requires you to confirm with a **second factor** (email code) for security. | |

---

## 15 · Quick polls (one word each)

| # | Question | Answer (circle) |
|---|---|---|
| 15.1 | Apple Pay at the chair? | Yes / No |
| 15.2 | Google Pay at the chair? | Yes / No |
| 15.3 | Venmo accepted for tips? | Yes / No |
| 15.4 | Gift cards (purchasable + redeemable)? | Yes / No |
| 15.5 | Group bookings (multiple clients in one transaction)? | Yes / No |
| 15.6 | Online retail (products sold via the website)? | Yes / No |
| 15.7 | Stylist-direct booking links (each stylist gets their own shareable URL)? | Yes / No |
| 15.8 | Lost-and-found inventory in the system? | Yes / No |
| 15.9 | Customer reviews on the public site? | Yes / No |
| 15.10 | Loyalty referral codes? | Yes / No |

---

## How to answer

The fastest path:
1. **Type answers directly into this doc** in the empty cells. We'll sync it to the project.
2. Or print, mark up, and snap a photo back.
3. Or send a Loom video walking through your answers.

For anything you're unsure about, leave blank and we'll discuss on the **June 15 kickoff call**.

Items where you say "use the recommended default" are great answers — that's exactly what defaults are for.

— Kyle
