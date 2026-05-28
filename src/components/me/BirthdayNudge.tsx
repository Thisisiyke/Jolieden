"use client";

// Deferred birthday collection — replaces the wizard's identity step. Shows
// on /me home for clients with no birthday on file, with the perk made
// explicit (free Wash & Blow). Matches Sephora Beauty Insider / Ulta
// Ultamate pattern: don't ask at signup, ask after the user has seen value.
// Local state only — the prototype dismisses the card on save; production
// would write { birthdayMonth, birthdayDay } to clients via Supabase Auth's
// authenticated user record.

import { useState } from "react";
import { Cake, ChevronRight, Check, X } from "lucide-react";
import clsx from "clsx";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

type Mode = "collapsed" | "expanded" | "saved" | "dismissed";

export default function BirthdayNudge() {
  const [mode, setMode] = useState<Mode>("collapsed");
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);

  if (mode === "dismissed") return null;

  if (mode === "saved") {
    return (
      <section className="flex items-center gap-3 rounded-2xl border border-status-confirmed/30 bg-status-confirmed/5 p-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-status-confirmed/15">
          <Check className="h-4 w-4 text-status-confirmed" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] uppercase tracking-wider text-status-confirmed">
            🎂 Birthday saved
          </div>
          <div className="mt-0.5 text-sm text-ink-700">
            {MONTHS[month - 1]} {day} — your free Wash &amp; Blow unlocks the
            week of.
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMode("dismissed")}
          aria-label="Dismiss"
          className="rounded-full p-1 text-ink-400 hover:bg-white hover:text-ink-700"
        >
          <X className="h-4 w-4" />
        </button>
      </section>
    );
  }

  const daysInMonth = new Date(2000, month, 0).getDate();
  const dayOptions = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <section
      className={clsx(
        "relative overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-br from-gold-soft via-paper to-brand-50 p-4",
        mode === "expanded" ? "space-y-3" : "",
      )}
    >
      <button
        type="button"
        onClick={() => setMode("dismissed")}
        aria-label="Dismiss"
        className="absolute right-2 top-2 rounded-full p-1 text-ink-400 hover:bg-white hover:text-ink-700"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-center gap-3 pr-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/20 text-brand">
          <Cake className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] uppercase tracking-wider text-brand">
            🎂 Unlock your birthday perk
          </div>
          <div className="mt-0.5 text-sm font-semibold text-ink-900">
            Free Wash &amp; Blow on your birthday
          </div>
          <div className="font-mono text-[10px] text-ink-500">
            Plus 200 bonus points · just tell us the month + day
          </div>
        </div>
        {mode === "collapsed" && (
          <button
            type="button"
            onClick={() => setMode("expanded")}
            aria-label="Add birthday"
            className="rounded-md bg-brand px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
          >
            Add
          </button>
        )}
      </div>

      {mode === "expanded" && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10))}
              className="w-full rounded-md border border-ink-300 bg-white px-3 py-2.5 text-sm focus:border-brand focus:outline-none"
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={day}
              onChange={(e) => setDay(parseInt(e.target.value, 10))}
              className="w-full rounded-md border border-ink-300 bg-white px-3 py-2.5 text-sm focus:border-brand focus:outline-none"
            >
              {dayOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => setMode("saved")}
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Save birthday
            <ChevronRight className="h-4 w-4" />
          </button>
          <p className="text-center font-mono text-[10px] uppercase tracking-wider text-ink-500">
            📅 Year stays private
          </p>
        </>
      )}
    </section>
  );
}
