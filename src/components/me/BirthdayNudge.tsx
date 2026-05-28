"use client";

// Deferred birthday collection — replaces the wizard's identity step. Shows
// on /me home for clients with no birthday on file, with the perk made
// explicit (free Wash & Blow). Matches Sephora Beauty Insider / Ulta
// Ultamate pattern: don't ask at signup, ask after the user has seen
// value.
//
// SECURITY — birthday is WRITE-ONCE from the client app. Once a user saves
// it, this card flips to a locked confirmation state and the in-app
// editor disappears for good. Prevents gaming the birthday-perk loyalty
// system by changing the date repeatedly to claim the free Wash & Blow.
// Operator-side staff (Diéssou + front desk) can still override on the
// /clients/[id] profile — they have authority. Production enforces this
// at the database layer: the `clients.birthday_set_at` column gets
// stamped on first write, and the RLS policy rejects subsequent UPDATEs
// from `auth.role() = 'authenticated'` requests where it's non-null.
// Operator service-role updates bypass the check.

import { useEffect, useState } from "react";
import { Cake, ChevronRight, Check, Lock, X } from "lucide-react";
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

// Persists the saved birthday across navigations within the demo session so
// the locked state feels real. Production reads from the client record
// instead of sessionStorage.
const SAVED_KEY = "jolieden-birthday-saved";

type Mode = "collapsed" | "expanded" | "saved" | "dismissed";

type Saved = { month: number; day: number };

function readSaved(): Saved | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SAVED_KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

export default function BirthdayNudge() {
  // Hydration-safe: start in collapsed mode, then check sessionStorage on
  // mount. Prevents a flash of "Add" CTA when the value is already saved.
  const [mode, setMode] = useState<Mode>("collapsed");
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);

  useEffect(() => {
    const saved = readSaved();
    if (saved) {
      setMonth(saved.month);
      setDay(saved.day);
      setMode("saved");
    }
  }, []);

  const persistAndLock = () => {
    try {
      window.sessionStorage.setItem(
        SAVED_KEY,
        JSON.stringify({ month, day }),
      );
    } catch {
      // Quota errors are non-fatal — the demo just won't survive a
      // reload. Production writes to the clients table.
    }
    setMode("saved");
  };

  if (mode === "dismissed") return null;

  if (mode === "saved") {
    return (
      <section className="rounded-2xl border border-status-confirmed/30 bg-status-confirmed/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-status-confirmed/15">
            <Check className="h-4 w-4 text-status-confirmed" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-status-confirmed">
              🎂 Birthday saved
              <span className="inline-flex items-center gap-0.5 rounded-full bg-status-confirmed/15 px-1.5 py-0.5 font-mono text-[9px] text-status-confirmed">
                <Lock className="h-2.5 w-2.5" />
                Locked
              </span>
            </div>
            <div className="mt-0.5 text-sm text-ink-700">
              {MONTHS[month - 1]} {day} — your free Wash &amp; Blow unlocks
              the week of.
            </div>
            <p className="mt-2 font-mono text-[10px] leading-relaxed text-ink-500">
              Birthday is set once to keep our perks fair. Made a mistake?
              Ask Diéssou at your next visit to update it.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMode("dismissed")}
            aria-label="Dismiss"
            className="rounded-full p-1 text-ink-400 hover:bg-white hover:text-ink-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
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
            onClick={persistAndLock}
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Save birthday
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="flex items-center justify-center gap-1.5 rounded-md border border-ink-200 bg-white/50 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-ink-600">
            <Lock className="h-3 w-3" />
            <span className="normal-case tracking-normal text-[11px] text-ink-700">
              Heads up — once saved, you can&apos;t change this in-app.
            </span>
          </div>
          <p className="text-center font-mono text-[10px] text-ink-500">
            Keeps perks fair · year stays private
          </p>
        </>
      )}
    </section>
  );
}
