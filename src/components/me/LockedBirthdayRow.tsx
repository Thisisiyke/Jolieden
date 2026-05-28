"use client";

// Read-only birthday row for the /me profile page. Surfaces the saved
// birthday (from the client record OR sessionStorage if collected this
// session via BirthdayNudge) and makes the lock visible. Tapping the
// help icon explains that operator staff can update it on the salon side
// — the in-app field is permanently read-only after first save.
//
// Same security rationale as BirthdayNudge: write-once from the client
// app, enforced server-side by the `clients.birthday_set_at` immutability
// trigger documented in docs/ARCHITECTURE.md §3.2.

import { useEffect, useState } from "react";
import { Lock, Cake } from "lucide-react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const SAVED_KEY = "jolieden-birthday-saved";

type Saved = { month: number; day: number };

export default function LockedBirthdayRow({
  birthdayMonth,
  birthdayDay,
}: {
  birthdayMonth?: number;
  birthdayDay?: number;
}) {
  // Prefer the persisted client record; fall back to the value the user
  // saved via BirthdayNudge during this demo session.
  const [resolved, setResolved] = useState<Saved | null>(
    birthdayMonth ? { month: birthdayMonth, day: birthdayDay ?? 1 } : null,
  );

  useEffect(() => {
    if (resolved) return;
    try {
      const raw = window.sessionStorage.getItem(SAVED_KEY);
      if (raw) setResolved(JSON.parse(raw) as Saved);
    } catch {
      // ignore
    }
  }, [resolved]);

  return (
    <div className="border-b border-ink-200 last:border-b-0">
      <div className="flex items-start justify-between gap-3 px-4 py-3 text-sm">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-ink-900">
            <Cake className="h-3.5 w-3.5 text-brand" />
            Birthday
          </div>
          <div className="mt-0.5 flex items-center gap-1 font-mono text-[10px] text-ink-500">
            <Lock className="h-2.5 w-2.5" />
            Locked · ask Diéssou to change it at your next visit
          </div>
        </div>
        <div className="shrink-0 text-right">
          {resolved ? (
            <span className="text-ink-700">
              {MONTHS[resolved.month - 1]} {resolved.day}
            </span>
          ) : (
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-400">
              Not set
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
