import Link from "next/link";
import { Bell, ChevronRight, CalendarClock } from "lucide-react";
import { STAFF } from "@/lib/data";
import { CATEGORIES } from "@/lib/catalog";

export default function WaitlistPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <header>
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-brand">
          <Bell className="h-3 w-3" /> Online waitlist
        </div>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-brand">
          Be the first to know when a slot opens
        </h1>
        <p className="mt-2 max-w-md text-sm text-ink-700">
          Tell us what you want and we&apos;ll text you the second something matches — no need to
          refresh the calendar.
        </p>
      </header>

      <section className="mt-6 space-y-4 rounded-2xl border border-ink-200 bg-white p-5">
        {/* Service */}
        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Service category
          </label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {CATEGORIES.map((c, i) => {
              const active = c.slug === "braids";
              return (
                <button
                  key={c.slug}
                  type="button"
                  className={
                    "rounded-full border px-3 py-1.5 text-xs font-medium " +
                    (active
                      ? "border-brand bg-brand text-white"
                      : "border-ink-200 bg-white text-ink-700")
                  }
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preferred stylist */}
        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Preferred stylist (optional)
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {STAFF.filter((s) => s.specialty).map((s) => {
              const active = s.slug === "oumou-d";
              return (
                <button
                  key={s.slug}
                  type="button"
                  className={
                    "flex flex-col items-start rounded-lg border p-3 text-left " +
                    (active
                      ? "border-brand bg-brand/5"
                      : "border-ink-200 bg-white")
                  }
                >
                  <span className="text-sm font-medium text-ink-900">{s.name}</span>
                  <span className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-500">
                    {s.specialty}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time window */}
        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Window you can take
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="rounded-md border border-ink-200 bg-white px-3 py-2.5 text-sm">
              <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">From</div>
              <div className="text-ink-900">Apr 16, 2026</div>
            </div>
            <div className="rounded-md border border-ink-200 bg-white px-3 py-2.5 text-sm">
              <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">To</div>
              <div className="text-ink-900">May 10, 2026</div>
            </div>
          </div>
        </div>

        {/* Time of day */}
        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Time of day
          </label>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {["Mornings", "Afternoons", "Evenings"].map((t, i) => {
              const active = i === 1;
              return (
                <button
                  key={t}
                  type="button"
                  className={
                    "rounded-md border py-2 text-xs font-medium " +
                    (active
                      ? "border-brand bg-brand text-white"
                      : "border-ink-200 bg-white text-ink-700")
                  }
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contact */}
        <div className="border-t border-ink-200 pt-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            We&apos;ll text you here
          </div>
          <input
            defaultValue="(917) 555-0388"
            className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-1.5 rounded-md bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Add me to the waitlist
          <ChevronRight className="h-4 w-4" />
        </button>
      </section>

      <section className="mt-6 flex items-start gap-3 rounded-xl border border-ink-200 bg-paper p-4 text-xs text-ink-700">
        <CalendarClock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
        Average wait this month: <strong className="text-ink-900">~6 days</strong> for braids,
        <strong className="text-ink-900"> 2 days</strong> for silk press.
      </section>

      <Link
        href="/book"
        className="mt-6 inline-flex items-center gap-1 text-sm text-brand hover:underline"
      >
        ← Back to gallery
      </Link>
    </div>
  );
}
