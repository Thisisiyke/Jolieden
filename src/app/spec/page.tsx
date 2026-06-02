// Dev-facing Build Brief landing at /spec.
// Strictly what devs need to know to build the thing — no commercials,
// no commentary on who's building, no engagement-status timeline.
// Just: project name, the 10 specs in order, and the visual references.

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
    desc: "Orientation, roadmap, links to everything. Read this first.",
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
    desc: "Every stubbed click in the artifact, categorized by scope / deferred / spec'd / TBD.",
    href: `${REPO_BASE}DEAD_END_AUDIT.md`,
    audience: "Devs",
    status: "Locked",
  },
  {
    num: "04",
    title: "Open Questions",
    desc: "Curated 75-item pre-kickoff questionnaire for the product owner.",
    href: `${REPO_BASE}OPEN_QUESTIONS.md`,
    audience: "Client",
    status: "Draft",
  },
  {
    num: "05",
    title: "Frontend Build Questions",
    desc: "369 frontend questions across all 7 surfaces.",
    href: `${REPO_BASE}QUESTIONS_FRONTEND.md`,
    audience: "Devs",
    status: "Reference",
  },
  {
    num: "06",
    title: "Backend Build Questions",
    desc: "369 backend questions covering data, business rules, integrations, security.",
    href: `${REPO_BASE}QUESTIONS_BACKEND.md`,
    audience: "Devs",
    status: "Reference",
  },
  {
    num: "07",
    title: "Technical Architecture",
    desc: "Stack, system architecture, deployment, NFRs.",
    href: `${REPO_BASE}ARCHITECTURE.md`,
    audience: "Devs",
    status: "Reference",
  },
  {
    num: "08",
    title: "AI Concierge Spec",
    desc: "Twilio + Claude SMS bot — system prompt, tools, escalation logic.",
    href: `${REPO_BASE}AI_CONCIERGE.md`,
    audience: "Devs",
    status: "Reference",
  },
  {
    num: "09",
    title: "MVP Scope",
    desc: "Phase 1 vs Phase 2 vs Phase 3, team staffing.",
    href: `${REPO_BASE}MVP_SCOPE.md`,
    audience: "All",
    status: "Reference",
  },
  {
    num: "10",
    title: "Product Spec (legacy)",
    desc: "Screen-by-screen reference for the older prototype. Defer to the artifact when in conflict.",
    href: `${REPO_BASE}PRODUCT_SPEC.md`,
    audience: "Devs",
    status: "Reference",
  },
];

const surfaces = [
  { name: "Empty States Reference", href: "/states", desc: "What each surface looks like with no data — copy + CTA rules" },
  { name: "Booking Website", href: "/book", desc: "Anonymous · photo-first · Boulevard replacement" },
  { name: "Client Companion App", href: "/me", desc: "Logged-in mobile · journey, rewards, bookings" },
  { name: "Station Kiosk", href: "/kiosk", desc: "Per-chair tablet · check-in · live progress mirror" },
  { name: "Stylist App", href: "/pro", desc: "Schedule · capture · earnings · EN/FR toggle" },
  { name: "Owner Admin", href: "/owner", desc: "Strategy · goals · revenue · register" },
  { name: "Front Desk (legacy demo)", href: "/front-desk", desc: "Original prototype's operator view" },
];

export default function BuildBriefHome() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#1F2937]">
      {/* ── Hero ── */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16">
        <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#C9A961]">
          Build Brief
        </div>
        <h1 className="mt-3 font-serif text-5xl font-bold tracking-tight text-[#1E1F4D] sm:text-6xl">
          Jolieden
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Specification package for the production build. Seven product surfaces, dual admin model,
          AI SMS Concierge, multi-location data architecture. Start with doc 01.
        </p>
      </section>

      {/* ── Handoff docs ── */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-4 md:grid-cols-2">
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

      {/* ── Visual references ── */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#C9A961]">
            Visual references
          </div>
          <h2 className="mt-3 font-serif text-3xl font-bold text-[#1E1F4D]">Artifact + prototype</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
            The artifact suite at the homepage is the visual ground truth — cream/champagne for
            client surfaces, dark warm + champagne for admin. The legacy prototype routes below
            are functional reference (different palette, older direction).
          </p>

          <div className="mt-6 rounded-2xl border-2 border-dashed border-[#C9A961] bg-[#F4ECD8]/40 p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#1E1F4D]">
              Source artifact (always defer to this for visual direction)
            </div>
            <div className="mt-2">
              <Link
                href="/"
                className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-[#1E1F4D] underline hover:bg-slate-50"
              >
                Open the artifact suite →
              </Link>
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
    </main>
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
