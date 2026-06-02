// Empty-state reference for devs.
//
// Diéssou's artifact at `/` shows the happy path with populated data.
// This page covers the other 80% — what each surface looks like when
// there's no data, and what CTAs / copy should appear.
//
// Two-mode design language matches the artifact:
//   - Client/public surfaces (cream/champagne)
//   - Admin/manager surfaces (dark warm/champagne)
//
// Self-contained inline styles so devs can copy/paste patterns without
// fighting Tailwind tokens. Built on Fraunces + Hanken Grotesk.

import Link from "next/link";

const PALETTE = {
  // Client side
  cream: "#FBF7EF",
  panel: "#F4ECDD",
  panel2: "#EFE5D2",
  espresso: "#2C241D",
  espressoSoft: "#5C4B3E",
  clay: "#A8623C",
  ochre: "#C2912F",
  birthday: "#9C5C8F",
  teal: "#4E7E76",
  // Admin side
  ink: "#0F0C09",
  inkSoft: "#241A0F",
  inkText: "#F1E9DB",
  lineDark: "rgba(241,233,219,.12)",
} as const;

type StateCard = {
  title: string;
  when: string;        // when this state fires
  copy: string;        // what message/CTA should appear
  visual: React.ReactNode; // static visualization
  mode: "client" | "admin";
  surface: string;
};

const btnPrimary: React.CSSProperties = {
  background: PALETTE.clay, color: "#fff", border: 0, borderRadius: 100,
  padding: "12px 22px", fontFamily: "'Hanken Grotesk', sans-serif",
  fontWeight: 700, fontSize: 12.5, letterSpacing: ".04em", cursor: "pointer",
};
const btnPrimaryDark: React.CSSProperties = { ...btnPrimary };
const btnGhost: React.CSSProperties = {
  background: "transparent", color: PALETTE.espresso, border: `1px solid ${PALETTE.espresso}`,
  borderRadius: 100, padding: "12px 22px", fontFamily: "'Hanken Grotesk', sans-serif",
  fontWeight: 600, fontSize: 12.5, cursor: "pointer",
};

const states: StateCard[] = [
  // ─────────── PUBLIC BOOKING WEBSITE ───────────
  {
    surface: "Booking website",
    mode: "client",
    title: "Filter returns zero styles",
    when: "User picks a category (e.g., Kids · 0) that has nothing live this week.",
    copy: "Be specific: name the category, offer the next-best move (clear filter / browse all / put me on the list).",
    visual: (
      <div style={{
        textAlign: "center", padding: "48px 24px", color: PALETTE.espressoSoft,
        fontFamily: "'Fraunces', serif", fontStyle: "italic",
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%", background: PALETTE.panel2,
          margin: "0 auto 18px", display: "flex", alignItems: "center", justifyContent: "center",
          color: PALETTE.clay, fontSize: 22, fontStyle: "normal",
        }}>—</div>
        <div style={{ fontSize: 18, color: PALETTE.espresso, marginBottom: 6 }}>
          No <em style={{ color: PALETTE.ochre }}>Kids</em> looks live this week
        </div>
        <div style={{ fontSize: 13, maxWidth: 280, margin: "0 auto 18px", fontStyle: "italic" }}>
          The October catalog adds 8 kids looks. In the meantime, your nearest match:
        </div>
        <button style={btnGhost}>Browse all 121 looks</button>
      </div>
    ),
  },
  {
    surface: "Booking website",
    mode: "client",
    title: "No slots available in next 14 days",
    when: "User taps a style; the booking sheet opens; we query availability and get nothing in the default window.",
    copy: "Offer the waitlist and surface the *next* available slot — never just say 'no.' Mention the chair's name to soften it.",
    visual: (
      <div style={{ padding: "32px 24px" }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, color: PALETTE.espresso, marginBottom: 4 }}>
          Cherry Cola <em style={{ color: PALETTE.ochre }}>Knotless</em>
        </div>
        <div style={{ fontSize: 11.5, color: PALETTE.espressoSoft, fontFamily: "'Fraunces', serif", fontStyle: "italic", marginBottom: 18 }}>
          with Aminata D.
        </div>
        <div style={{
          background: PALETTE.panel, borderRadius: 14, padding: 16, marginBottom: 14,
        }}>
          <div style={{ fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: PALETTE.clay, fontWeight: 700, marginBottom: 6 }}>
            Aminata is booked solid this fortnight
          </div>
          <div style={{ fontSize: 13, color: PALETTE.espresso, lineHeight: 1.5 }}>
            Next open: <strong>Saturday Dec 6 · 11:00a</strong>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...btnPrimary, flex: 1 }}>Hold Dec 6</button>
          <button style={{ ...btnGhost, flex: 1 }}>Join waitlist</button>
        </div>
      </div>
    ),
  },

  // ─────────── CLIENT APP ───────────
  {
    surface: "Client app · Home",
    mode: "client",
    title: "New user with no upcoming bookings",
    when: "First-launch right after signup, or a returning client between visits.",
    copy: "No 'No data' framing. Frame it as forward motion — 'find your next look' with a clear browse CTA.",
    visual: (
      <div style={{ padding: "28px 22px" }}>
        <div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: PALETTE.ochre, fontWeight: 600, marginBottom: 8 }}>
          ✨ Welcome
        </div>
        <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, color: PALETTE.espresso, lineHeight: 1.1, marginBottom: 8 }}>
          Hi, Amara
        </h3>
        <div style={{
          background: PALETTE.panel, borderRadius: 18, padding: 22, marginTop: 16,
        }}>
          <div style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: PALETTE.ochre, fontWeight: 700, marginBottom: 8 }}>
            ✨ Find your first look
          </div>
          <h4 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: PALETTE.espresso, marginBottom: 10, lineHeight: 1.15 }}>
            Tap a photo, walk in <em style={{ color: PALETTE.ochre }}>styled</em>
          </h4>
          <div style={{ fontSize: 13, color: PALETTE.espressoSoft, lineHeight: 1.55, marginBottom: 16 }}>
            Browse finished looks from real clients. Pick one and we&apos;ll pre-fill length, parting, color, and a chair.
          </div>
          <button style={btnPrimary}>Browse 121 looks &rsaquo;</button>
        </div>
      </div>
    ),
  },
  {
    surface: "Client app · Journey",
    mode: "client",
    title: "First-time client with no journey entries",
    when: "Brand new account with zero completed visits.",
    copy: "Anticipatory: 'Your journey starts after your first visit.' Show what a journey entry WILL look like to set expectations.",
    visual: (
      <div style={{ padding: "32px 24px", textAlign: "center" }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%", background: PALETTE.panel,
          margin: "0 auto 20px", display: "grid", placeItems: "center",
        }}>
          <span style={{ fontSize: 28 }}>💛</span>
        </div>
        <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: PALETTE.espresso, lineHeight: 1.1, marginBottom: 10 }}>
          Your <em style={{ color: PALETTE.ochre }}>journey</em> starts soon
        </h3>
        <p style={{
          fontSize: 14, color: PALETTE.espressoSoft, lineHeight: 1.55, maxWidth: 280, margin: "0 auto 22px",
          fontFamily: "'Fraunces', serif", fontStyle: "italic",
        }}>
          After your first visit, before-and-after captures go here. One year from now you&apos;ll have a real timeline to look back on.
        </p>
        <button style={btnPrimary}>Book your first chair &rsaquo;</button>
      </div>
    ),
  },
  {
    surface: "Client app · Wishlist",
    mode: "client",
    title: "No saved styles",
    when: "User opens Wishlist tab without ever tapping a heart icon.",
    copy: "Teach the gesture. Show a tappable example of how to save. Don't lecture.",
    visual: (
      <div style={{ padding: "36px 24px", textAlign: "center" }}>
        <svg viewBox="0 0 24 24" width={56} height={56} fill="none" stroke={PALETTE.clay} strokeWidth={1.4} style={{ margin: "0 auto 18px", display: "block" }}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: PALETTE.espresso, marginBottom: 8 }}>
          Save looks you <em style={{ color: PALETTE.ochre }}>love</em>
        </h3>
        <p style={{ fontSize: 13.5, color: PALETTE.espressoSoft, fontFamily: "'Fraunces', serif", fontStyle: "italic", lineHeight: 1.55, maxWidth: 270, margin: "0 auto" }}>
          Tap the heart on any look while you browse. They&apos;ll show up here so you can find them later — or send them to the group chat.
        </p>
      </div>
    ),
  },

  // ─────────── STYLIST APP ───────────
  {
    surface: "Stylist app · Today",
    mode: "client",
    title: "Stylist clocked in, no appointments today",
    when: "Light schedule day or an apprentice with no booked clients yet.",
    copy: "Don't say 'empty.' Reframe as opportunity: walk-ins might still come; offer the next bookable slot.",
    visual: (
      <div style={{ padding: "26px 22px" }}>
        <div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: PALETTE.ochre, fontWeight: 600, marginBottom: 8 }}>
          Today · 0 appointments
        </div>
        <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: PALETTE.espresso, marginBottom: 8 }}>
          Open chair, <em style={{ color: PALETTE.ochre }}>Zainab</em>
        </h3>
        <div style={{
          background: PALETTE.panel, borderRadius: 16, padding: 18, marginTop: 18,
        }}>
          <div style={{ fontSize: 13, color: PALETTE.espresso, lineHeight: 1.55, fontFamily: "'Fraunces', serif" }}>
            You&apos;re clocked in at 8:02a — walk-ins may still come through. The floor manager will route the next one your way.
          </div>
        </div>
        <div style={{
          display: "flex", justifyContent: "space-between", padding: "16px 0",
          borderBottom: `1px solid ${PALETTE.panel2}`, marginTop: 18,
        }}>
          <span style={{ fontSize: 12, color: PALETTE.espressoSoft }}>Next break</span>
          <span style={{ fontSize: 12, color: PALETTE.espresso, fontWeight: 600 }}>Available</span>
        </div>
        <div style={{
          display: "flex", justifyContent: "space-between", padding: "16px 0",
        }}>
          <span style={{ fontSize: 12, color: PALETTE.espressoSoft }}>Earnings · today</span>
          <span style={{ fontSize: 12, color: PALETTE.espresso, fontWeight: 600 }}>$0</span>
        </div>
      </div>
    ),
  },
  {
    surface: "Stylist app · Earnings",
    mode: "client",
    title: "Apprentice with no completed services",
    when: "Day-1 apprentice or a stylist with zero billable hours this week.",
    copy: "Show what a real earnings row will look like once one fires. Anti-anxiety framing.",
    visual: (
      <div style={{ padding: "26px 22px" }}>
        <div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: PALETTE.ochre, fontWeight: 600, marginBottom: 8 }}>
          This week
        </div>
        <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 38, color: PALETTE.espresso, marginBottom: 4 }}>
          $0
        </h3>
        <div style={{ fontSize: 12, color: PALETTE.espressoSoft, marginBottom: 22, fontFamily: "'Fraunces', serif", fontStyle: "italic" }}>
          First completed service lands here within minutes of checkout.
        </div>
        <div style={{
          background: PALETTE.panel, borderRadius: 14, padding: 14, opacity: 0.55,
          fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 12.5,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ color: PALETTE.espressoSoft }}>example · Amara N.</span>
            <span style={{ color: PALETTE.espresso, fontWeight: 700 }}>$140.00</span>
          </div>
          <div style={{ fontSize: 11, color: PALETTE.espressoSoft, fontStyle: "italic", fontFamily: "'Fraunces', serif" }}>
            Knotless Box, medium · waist
          </div>
        </div>
      </div>
    ),
  },

  // ─────────── STATION KIOSK ───────────
  {
    surface: "Station kiosk",
    mode: "client",
    title: "Idle — no client at the chair",
    when: "Between appointments, after a client checks out and stylist isn&apos;t ready for the next.",
    copy: "Calm, welcoming. Subtle pulse on the JD mark. Don&apos;t prompt for input — wait until a client sits.",
    visual: (
      <div style={{ padding: "60px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 10, letterSpacing: ".3em", textTransform: "uppercase", color: PALETTE.ochre, fontWeight: 600, marginBottom: 36, fontFamily: "'Fraunces', serif" }}>
          Jolieden · Station 14
        </div>
        <div style={{
          width: 88, height: 88, borderRadius: "50%", background: PALETTE.panel,
          margin: "0 auto 28px", display: "grid", placeItems: "center",
          fontFamily: "'Fraunces', serif", fontSize: 32, color: PALETTE.ochre, fontStyle: "italic",
        }}>
          JD
        </div>
        <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: PALETTE.espresso, fontStyle: "italic", marginBottom: 10 }}>
          Have a seat
        </h3>
        <p style={{ fontSize: 13.5, color: PALETTE.espressoSoft, fontFamily: "'Fraunces', serif", fontStyle: "italic", maxWidth: 260, margin: "0 auto" }}>
          Your stylist will be over in a moment.
        </p>
      </div>
    ),
  },

  // ─────────── ADMIN — OWNER ───────────
  {
    surface: "Owner admin · Goals",
    mode: "admin",
    title: "Weekly goal not yet set",
    when: "First Monday in the new app, or after an unset week (vacation, training).",
    copy: "Don&apos;t show 0 / 240 — show 'Set a goal so we can track it.' Frame it as Diéssou's leadership move.",
    visual: (
      <div style={{ padding: "26px 22px" }}>
        <div style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: PALETTE.ochre, fontWeight: 700, marginBottom: 12 }}>
          Weekly booking goal
        </div>
        <div style={{
          border: `1.5px dashed ${PALETTE.lineDark}`, borderRadius: 18, padding: 24,
          background: "transparent",
        }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: PALETTE.inkText, marginBottom: 6 }}>
            Set a goal to start the week
          </div>
          <div style={{ fontSize: 12.5, color: "rgba(241,233,219,.6)", lineHeight: 1.55, marginBottom: 18, fontFamily: "'Fraunces', serif", fontStyle: "italic" }}>
            The team books faster when there&apos;s a number on the wall. Last week was 208 of 240.
          </div>
          <button style={btnPrimaryDark}>Set goal &rsaquo;</button>
        </div>
      </div>
    ),
  },
  {
    surface: "Owner admin · Register",
    mode: "admin",
    title: "Register not opened today",
    when: "Pre-open of business hours, or the day after a manager forgot to close-out.",
    copy: "Block strategic stats until register opens. Ground it: 'Open the register to start tracking today's revenue.'",
    visual: (
      <div style={{ padding: "26px 22px" }}>
        <div style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: PALETTE.ochre, fontWeight: 700, marginBottom: 12 }}>
          Register count · today
        </div>
        <div style={{
          background: "rgba(168,98,60,.1)", border: `1px solid rgba(168,98,60,.3)`, borderRadius: 14, padding: 18,
        }}>
          <div style={{ fontSize: 13, color: PALETTE.inkText, lineHeight: 1.5, marginBottom: 14, fontFamily: "'Fraunces', serif", fontStyle: "italic" }}>
            Register hasn&apos;t been opened yet. Numbers won&apos;t flow until someone counts the drawer.
          </div>
          <button style={btnPrimaryDark}>Open register &rsaquo;</button>
        </div>
      </div>
    ),
  },

  // ─────────── ADMIN — MANAGER ───────────
  {
    surface: "Manager admin · Floor map",
    mode: "admin",
    title: "Salon closed (overnight)",
    when: "Before open hours, or on a day the salon is closed.",
    copy: "Show actual open hours. Don't show empty stations — show countdown to opening.",
    visual: (
      <div style={{ padding: "36px 24px", textAlign: "center" }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%", background: "rgba(241,233,219,.06)",
          margin: "0 auto 20px", display: "grid", placeItems: "center",
        }}>
          <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke={PALETTE.ochre} strokeWidth={1.6}>
            <circle cx={12} cy={12} r={9} />
            <path d="M12 7v5l3 2" />
          </svg>
        </div>
        <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: PALETTE.inkText, marginBottom: 8 }}>
          Salon opens in <em style={{ color: PALETTE.ochre }}>5 hr 18 min</em>
        </h3>
        <p style={{ fontSize: 13, color: "rgba(241,233,219,.55)", maxWidth: 280, margin: "0 auto", fontFamily: "'Fraunces', serif", fontStyle: "italic" }}>
          Tuesday — Saturday · 9a to 8p. The floor map wakes up when the first stylist clocks in.
        </p>
      </div>
    ),
  },
  {
    surface: "Manager admin · Concierge",
    mode: "admin",
    title: "AI handling everything · no escalations",
    when: "Quiet hour. The AI is auto-replying without flagging anything for a human.",
    copy: "Positive empty state. 'You're in good shape.' Show the AI's auto-handled count today as proof.",
    visual: (
      <div style={{ padding: "36px 24px", textAlign: "center" }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%", background: "rgba(122,155,110,.18)",
          margin: "0 auto 20px", display: "grid", placeItems: "center",
        }}>
          <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke="#A6C79A" strokeWidth={2}>
            <path d="M5 13l4 4 10-10" />
          </svg>
        </div>
        <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: PALETTE.inkText, marginBottom: 8 }}>
          All <em style={{ color: PALETTE.ochre }}>handled</em>
        </h3>
        <p style={{ fontSize: 13, color: "rgba(241,233,219,.55)", maxWidth: 300, margin: "0 auto", fontFamily: "'Fraunces', serif", fontStyle: "italic" }}>
          The AI Concierge has answered 28 messages today without needing a human. We&apos;ll ping you the moment something needs you.
        </p>
      </div>
    ),
  },
  {
    surface: "Manager admin · Oopsie",
    mode: "admin",
    title: "Oopsie queue empty",
    when: "No active repair tickets. A good day.",
    copy: "Quietly satisfying. Don't gamify it — just acknowledge the team's work.",
    visual: (
      <div style={{ padding: "36px 24px", textAlign: "center" }}>
        <div style={{
          fontSize: 32, marginBottom: 16,
        }}>
          💛
        </div>
        <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: PALETTE.inkText, marginBottom: 8 }}>
          Nothing to fix
        </h3>
        <p style={{ fontSize: 13, color: "rgba(241,233,219,.55)", maxWidth: 280, margin: "0 auto", fontFamily: "'Fraunces', serif", fontStyle: "italic" }}>
          Three repairs were resolved this week. The team is shipping clean work.
        </p>
      </div>
    ),
  },
];

export default function EmptyStatesPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#F8FAFC", color: "#1F2937", fontFamily: "'Hanken Grotesk', sans-serif" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,700;1,9..144,400;1,9..144,500&family=Hanken+Grotesk:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Hero */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "72px 28px 32px" }}>
        <div style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: ".28em", textTransform: "uppercase", color: "#C9A961", marginBottom: 14 }}>
          Empty States · Reference
        </div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 56, fontWeight: 700, color: "#1E1F4D", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 18 }}>
          When there&apos;s no data
        </h1>
        <p style={{ maxWidth: 720, color: "#4B5563", lineHeight: 1.55, fontSize: 16 }}>
          Diéssou&apos;s artifact at <Link href="/" style={{ color: "#1E1F4D", textDecoration: "underline" }}>the homepage</Link>{" "}
          shows each surface in its populated, happy-path state. This page covers the other 80% — what each
          surface looks like with no data, why those moments fire, and what copy and CTA the user should see.
        </p>
        <p style={{ maxWidth: 720, color: "#6B7280", lineHeight: 1.5, fontSize: 13, marginTop: 16, fontStyle: "italic" }}>
          Each card is a real working layout — copy/paste safe. The mode tag (client vs admin) tells you which palette to apply.
        </p>
      </section>

      {/* Cards */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "8px 28px 80px" }}>
        <div style={{ display: "grid", gap: 28, gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))" }}>
          {states.map((s, i) => (
            <article
              key={i}
              style={{
                background: "white", borderRadius: 16, overflow: "hidden",
                border: "1px solid #E5E7EB",
                boxShadow: "0 6px 16px -8px rgba(11,23,53,.06)",
              }}
            >
              {/* Header */}
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #F1F5F9" }}>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6,
                }}>
                  <div style={{ fontFamily: "monospace", fontSize: 9.5, letterSpacing: ".18em", textTransform: "uppercase", color: "#9CA3AF", fontWeight: 700 }}>
                    {s.surface}
                  </div>
                  <ModeChip mode={s.mode} />
                </div>
                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 16, color: "#1E1F4D", fontWeight: 700, lineHeight: 1.25 }}>
                  {s.title}
                </h3>
              </div>

              {/* Visual */}
              <div style={{
                background: s.mode === "client" ? PALETTE.cream : PALETTE.ink,
                borderTop: `1px solid ${s.mode === "client" ? PALETTE.panel2 : PALETTE.lineDark}`,
                borderBottom: `1px solid ${s.mode === "client" ? PALETTE.panel2 : PALETTE.lineDark}`,
              }}>
                {s.visual}
              </div>

              {/* Notes */}
              <div style={{ padding: "16px 20px 18px" }}>
                <Note label="Fires when" value={s.when} />
                <Note label="Copy / CTA rule" value={s.copy} />
              </div>
            </article>
          ))}
        </div>

        {/* footer note */}
        <p style={{
          maxWidth: 760, margin: "60px auto 0", textAlign: "center",
          fontSize: 13, color: "#6B7280", fontStyle: "italic", lineHeight: 1.6,
        }}>
          Missing a state you need to build? Add it here, or note the question in <Link href="/spec" style={{ color: "#1E1F4D", textDecoration: "underline" }}>the spec landing</Link>.
        </p>
      </section>
    </main>
  );
}

function ModeChip({ mode }: { mode: "client" | "admin" }) {
  const isClient = mode === "client";
  return (
    <span style={{
      fontFamily: "monospace", fontSize: 9, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase",
      padding: "3px 8px", borderRadius: 100,
      background: isClient ? "#F4ECD8" : "#1E1F4D",
      color: isClient ? "#5C4B3E" : "#F1E9DB",
    }}>
      {isClient ? "Client mode" : "Admin mode"}
    </span>
  );
}

function Note({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{
        fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase", color: "#9CA3AF", fontWeight: 700, marginBottom: 3,
      }}>
        {label}
      </div>
      <div style={{ fontSize: 12.5, color: "#4B5563", lineHeight: 1.55 }}>{value}</div>
    </div>
  );
}
