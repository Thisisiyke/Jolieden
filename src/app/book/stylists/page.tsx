import Link from "next/link";
import { ArrowRight, Star, Camera } from "lucide-react";
import { STAFF } from "@/lib/data";
import { stylesByStylist } from "@/lib/gallery";

// Only include stylists who actually take clients (skip front desk / owners
// who don't appear on the booking flow). Heuristic: have a specialty.
const TAKES_CLIENTS = STAFF.filter((s) => s.specialty || s.role.toLowerCase().includes("stylist") || s.role.toLowerCase().includes("braider"));

function StylistCard({ s }: { s: (typeof STAFF)[number] }) {
  const works = stylesByStylist(s.slug).slice(0, 3);
  const initials = s.name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  return (
    <Link
      href={`/book/stylist/${s.slug}`}
      className="group overflow-hidden rounded-2xl border border-ink-200 bg-white hover:border-brand hover:shadow-sm"
    >
      <div className="flex items-start gap-3 p-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-semibold text-white"
          style={{ background: s.color }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h2 className="truncate text-base font-semibold text-ink-900">{s.name}</h2>
            <span className="flex items-center gap-0.5 rounded-full bg-gold-soft px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-brand">
              <Star className="h-2.5 w-2.5 fill-gold text-gold" />
              4.9
            </span>
          </div>
          <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-500">
            {s.specialty || s.role}
            {s.yearsAtSalon ? ` · ${s.yearsAtSalon} yr` : ""}
          </div>
          {s.bio && <p className="mt-2 line-clamp-2 text-xs leading-snug text-ink-700">{s.bio}</p>}
        </div>
      </div>
      {works.length > 0 && (
        <div className="flex gap-1 border-t border-ink-200 bg-paper px-4 py-2">
          {works.map((w) => (
            <div
              key={w.id}
              className="aspect-square flex-1 overflow-hidden rounded-md"
              style={
                w.photoUrl
                  ? { backgroundImage: `url(${w.photoUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                  : { background: "linear-gradient(140deg, #f5e6d8, #d4a89b)" }
              }
            />
          ))}
        </div>
      )}
      <div className="flex items-center justify-between border-t border-ink-200 px-4 py-2.5 text-xs">
        <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-ink-500">
          <Camera className="h-3 w-3" /> {works.length} looks
        </span>
        <span className="flex items-center gap-1 font-medium text-brand group-hover:underline">
          See profile <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}

export default function StylistsDirectoryPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-brand">
          💜 The Jolieden team
        </div>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-brand sm:text-4xl">
          Meet our stylists
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-700">
          {TAKES_CLIENTS.length} licensed stylists, each with a signature look. Tap a profile to see
          their portfolio, read reviews, and book directly with them.
        </p>
      </header>

      {/* Stats strip */}
      <section className="mt-6 grid grid-cols-3 gap-3 rounded-2xl border border-ink-200 bg-paper p-4 text-center">
        <div>
          <div className="font-serif text-2xl font-semibold text-brand">
            {TAKES_CLIENTS.length}
          </div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Stylists
          </div>
        </div>
        <div>
          <div className="font-serif text-2xl font-semibold text-brand">10+</div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Specialties
          </div>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1 font-serif text-2xl font-semibold text-brand">
            4.9
            <Star className="h-4 w-4 fill-gold text-gold" />
          </div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Avg rating
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TAKES_CLIENTS.map((s) => (
          <StylistCard key={s.slug} s={s} />
        ))}
      </section>

      <Link
        href="/book"
        className="mt-8 inline-flex items-center gap-1 text-sm text-brand hover:underline"
      >
        ← Back to gallery
      </Link>
    </div>
  );
}
