// Build Brief landing page — the homepage at jolieden.vercel.app.
// Replaces the operator Front Desk demo that lived here previously.
// The original Front Desk view is preserved at /front-desk. All other
// prototype surfaces (/demo, /me, /pro, /book, /kiosk, /owner) are
// linked from the Visual References section below.

import Link from "next/link";

type DocCard = {
  num: string;
  title: string;
  desc: string;
  href?: string;
  audience: "All" | "Devs" | "Client";
  status?: "Locked" | "Draft" | "Reference";
};

const REPO_BASE = "https://github.com/Thisisiyke/Jolieden/blob/main/docs/";

const docs: DocCard[] = [
  {
    num: "01",
    title: "Build Brief",
    desc: "Orientation, roadmap, links to everything. The single source of truth.",
    href: `${REPO_BASE}BUILD_BRIEF.md`,
    audience: "All",
    status: "Locked",
  },
  {
    num: "02",
    title: "Data Model",
    desc: "Locked Postgres schema. 14 domains, ~30 tables, full DDL + triggers + indices.",
    href: `${REPO_BASE}DATA_MODEL.md`,
    audience: "Devs",
    status: "Locked",
  },
  {
    num: "03",
    title: "Dead-End Audit",
    desc: "Every stubbed click in Diéssou's artifact, categorized by scope / deferred / spec'd / TBD.",
    href: `${REPO_BASE}DEAD_END_AUDIT.md`,
    audience: "Devs",
    status: "Locked",
  },
  {
    num: "04",
    title: "Open Questions for Diéssou",
    desc: "Curated 75-item pre-kickoff questionnaire. Only the answers Diéssou can give.",
    href: `${REPO_BASE}OPEN_QUESTIONS.md`,
    audience: "Client",
    status: "Draft",
  },
  {
    num: "05",
    title: "Frontend Build Questions",
    desc: "369 dev-grade frontend questions from a deep read of the artifact + contract.",
    href: `${REPO_BASE}QUESTIONS_FRONTEND.md`,
    audience: "Devs",
    status: "Reference",
  },
  {
    num: "06",
    title: "Backend Build Questions",
    desc: "369 dev-grade backend questions. Data, business rules, integrations, security.",
    href: `${REPO_BASE}QUESTIONS_BACKEND.md`,
    audience: "Devs",
    status: "Reference",
  },
  {
    num: "07",
    title: "Technical Architecture",
    desc: "Stack, system architecture, deployment, NFRs. Predates the artifact — see BUILD_BRIEF §3 for divergences.",
    href: `${REPO_BASE}ARCHITECTURE.md`,
    audience: "Devs",
    status: "Reference",
  },
  {
    num: "08",
    title: "AI Concierge Spec",
    desc: "Twilio + Claude SMS bot — system prompt, tool schemas, escalation logic, cost model.",
    href: `${REPO_BASE}AI_CONCIERGE.md`,
    audience: "Devs",
    status: "Reference",
  },
  {
    num: "09",
    title: "MVP Scope",
    desc: "Phase 1 vs Phase 2 vs Phase 3, team staffing, budget anchors.",
    href: `${REPO_BASE}MVP_SCOPE.md`,
    audience: "All",
    status: "Reference",
  },
  {
    num: "10",
    title: "Product Spec (legacy)",
    desc: "Screen-by-screen reference for the older prototype. Defer to artifact when in conflict.",
    href: `${REPO_BASE}PRODUCT_SPEC.md`,
    audience: "Devs",
    status: "Reference",
  },
];

const surfaces = [
  { name: "Booking Website", href: "/book", desc: "Anonymous · photo-first · Boulevard replacement" },
  { name: "Client Companion App", href: "/me", desc: "Logged-in mobile · journey, rewards, bookings" },
  { name: "Station Kiosk", href: "/kiosk", desc: "Per-chair tablet · check-in · live progress mirror" },
  { name: "Stylist App", href: "/pro", desc: "Schedule · capture · earnings · EN/FR toggle" },
  { name: "Owner Admin", href: "/owner", desc: "Strategy · goals · revenue · register" },
  { name: "Front Desk (legacy demo)", href: "/front-desk", desc: "Original prototype's operator view" },
  { name: "Demo hub (persona walkthrough)", href: "/demo", desc: "Persona-driven prototype walkthrough" },
];

export default function BuildBriefHome() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#1F2937]">
      {/* ── Top bar ── */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative h-3 w-3 rotate-45 bg-[#1E1F4D]">
              <div className="absolute inset-0.5 rotate-0 bg-[#2F8A82]" />
            </div>
            <span className="text-base font-bold tracking-tight text-[#1E1F4D]">
              AmbittMedia <span className="text-slate-400">·</span> Jolieden
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="rounded-full bg-emerald-50 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-emerald-700">
              In planning
            </span>
            <span>v1.0</span>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-12">
        <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#C9A961]">
          Build Brief
        </div>
        <h1 className="mt-3 font-serif text-5xl font-bold tracking-tight text-[#1E1F4D] sm:text-6xl">
          Jolieden <span className="italic text-[#C9A961]">Beauty Bar</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          The complete handoff package for the 9-month build of Jolieden&apos;s custom salon software platform.
          Seven product surfaces, dual admin model, AI SMS Concierge, multi-location ready.
        </p>

        {/* Project facts strip */}
        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
          <Fact label="Total fee" value="$170,000" sub="9 monthly payments via Wave" />
          <Fact label="Kickoff" value="Jun 15, 2026" sub="9-month build" />
          <Fact label="Final acceptance" value="Feb 15, 2027" sub="5 milestones · M1 → M5" />
          <Fact label="Surfaces" value="7" sub="Site · Client · Kiosk · Stylist · Owner · Manager · Shoot" />
        </div>
      </section>

      {/* ── TL;DR ── */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid gap-10 lg:grid-cols-3">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#1E1F4D]">What we&apos;re building</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                A custom replacement for Diéssou&apos;s current Boulevard booking widget. Photo-first
                public booking site, returning-client mobile app, per-station tablets for check-in
                and live progress mirroring, stylist app with EN/FR toggle and 4-angle capture,
                two admin views (Owner sets targets, Manager runs the floor), AI SMS Concierge on
                the salon&apos;s number.
              </p>
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-[#1E1F4D]">Who&apos;s building</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Built by KufGroup LLC (d/b/a <span className="font-semibold">AmbittMedia</span>) under
                contract with JOLIEDEN Beauty Bar. Lead delivery sub via Upwork. Final acceptance and
                IP assignment fire at full payment per Exhibit A.
              </p>
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-[#1E1F4D]">Where to start (devs)</h2>
              <ol className="mt-3 space-y-2 text-sm text-slate-600">
                <li>1. Read the <strong>Build Brief (01)</strong> end-to-end.</li>
                <li>2. Skim the <strong>Data Model (02)</strong>.</li>
                <li>3. Audit your area in the <strong>Dead-End doc (03)</strong>.</li>
                <li>4. Push any new questions to <strong>04 / 05 / 06</strong>.</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ── Handoff docs ── */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#C9A961]">
              The handoff package
            </div>
            <h2 className="mt-3 font-serif text-3xl font-bold text-[#1E1F4D]">10 documents</h2>
          </div>
          <p className="hidden max-w-sm text-sm italic text-slate-500 sm:block">
            Read in order. The Build Brief (01) tells you where everything else lives. Questions
            stay in 04/05/06 as they come up.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {docs.map((d) => (
            <a
              key={d.num}
              href={d.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-slate-200 bg-white p-6 transition hover:border-[#1E1F4D] hover:shadow-lg"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xs font-bold text-[#C9A961]">{d.num}</span>
                <div className="flex items-center gap-1.5">
                  <AudienceChip a={d.audience} />
                  {d.status && <StatusChip s={d.status} />}
                </div>
              </div>
              <h3 className="mt-2 font-serif text-lg font-bold text-[#1E1F4D] group-hover:underline">
                {d.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{d.desc}</p>
            </a>
          ))}
        </div>
      </section>

      {/* ── Surface visual references ── */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#C9A961]">
            Visual references
          </div>
          <h2 className="mt-3 font-serif text-3xl font-bold text-[#1E1F4D]">
            The artifact + the prototype
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
            <span className="font-semibold">Diéssou&apos;s artifact</span> is the visual ground truth —
            cream/champagne for client surfaces, dark warm + champagne for admin. The legacy
            prototype routes below are functional reference (different palette, older direction —
            useful for component-level questions but not for color/typography).
          </p>

          <div className="mt-6 rounded-2xl border-2 border-dashed border-[#C9A961] bg-[#F4ECD8]/40 p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#1E1F4D]">
              Source artifact (always defer to this for visual direction)
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <code className="rounded-md bg-white px-3 py-1.5 text-xs text-slate-700">
                ~/Downloads/remixed-58c87693-v4-booking-site.html
              </code>
              <span className="text-xs italic text-slate-500">
                Decoded surfaces at <code>/tmp/diessou-surfaces/*.html</code>
              </span>
            </div>
          </div>

          <h3 className="mt-10 font-serif text-lg font-bold text-[#1E1F4D]">
            Legacy prototype surfaces (deployed here)
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {surfaces.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 transition hover:border-[#2F8A82]"
              >
                <div>
                  <div className="font-semibold text-[#1E1F4D] group-hover:text-[#2F8A82]">
                    {s.name}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">{s.desc}</div>
                </div>
                <span className="text-slate-400 group-hover:text-[#2F8A82]">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Status / next ── */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#C9A961]">
            Where we are
          </div>
          <h2 className="mt-2 font-serif text-2xl font-bold text-[#1E1F4D]">
            Pre-kickoff — Q&amp;A round with Diéssou
          </h2>
          <ol className="mt-5 space-y-3 text-sm text-slate-600">
            <li className="flex gap-3">
              <span className="font-mono font-bold text-emerald-600">✓</span>
              Contract signed (KufGroup LLC ↔ JOLIEDEN, $170k / 9 months)
            </li>
            <li className="flex gap-3">
              <span className="font-mono font-bold text-emerald-600">✓</span>
              Visual artifact locked from Diéssou&apos;s mockup
            </li>
            <li className="flex gap-3">
              <span className="font-mono font-bold text-emerald-600">✓</span>
              4 missing items added to her artifact (Birthday Lock · Invite to App · AI Concierge · Public Booking Site)
            </li>
            <li className="flex gap-3">
              <span className="font-mono font-bold text-emerald-600">✓</span>
              Data model locked
            </li>
            <li className="flex gap-3">
              <span className="font-mono font-bold text-emerald-600">✓</span>
              Dead-end audit completed
            </li>
            <li className="flex gap-3">
              <span className="font-mono font-bold text-amber-600">→</span>
              <span>
                <strong>Send open-question doc to Diéssou.</strong> 75 curated questions for her;
                369 each for FE/BE devs filed separately.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-slate-300">○</span>
              Kickoff call · June 15, 2026
            </li>
            <li className="flex gap-3">
              <span className="text-slate-300">○</span>
              M1 Foundation due · Aug 15, 2026
            </li>
          </ol>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-[#1E1F4D] py-10 text-slate-300">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-base font-bold text-white">
                <div className="relative h-3 w-3 rotate-45 bg-white">
                  <div className="absolute inset-0.5 bg-[#2F8A82]" />
                </div>
                AmbittMedia
              </div>
              <p className="mt-2 max-w-md text-xs text-slate-400">
                KufGroup LLC d/b/a AmbittMedia · Texas LLC · kylekufuor@gmail.com · (539) 444-6517
              </p>
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <a
                href="https://github.com/Thisisiyke/Jolieden"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C9A961] hover:underline"
              >
                Source on GitHub →
              </a>
              <a href="/demo" className="text-slate-400 hover:text-white">
                Prototype demo hub →
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Fact({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </div>
      <div className="mt-1.5 font-serif text-2xl font-bold text-[#1E1F4D]">{value}</div>
      <div className="mt-0.5 text-xs text-slate-500">{sub}</div>
    </div>
  );
}

function AudienceChip({ a }: { a: DocCard["audience"] }) {
  const styles = {
    All: "bg-slate-100 text-slate-700",
    Devs: "bg-indigo-50 text-indigo-700",
    Client: "bg-amber-50 text-amber-700",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${styles[a]}`}
    >
      {a}
    </span>
  );
}

function StatusChip({ s }: { s: NonNullable<DocCard["status"]> }) {
  const styles = {
    Locked: "bg-emerald-50 text-emerald-700",
    Draft: "bg-amber-50 text-amber-700",
    Reference: "bg-slate-100 text-slate-500",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${styles[s]}`}
    >
      {s}
    </span>
  );
}
