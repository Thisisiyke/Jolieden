"use client";

// Real-time floor view — visual salon layout. Each station shows the
// stylist + their current client (if any) + chair status. Refreshes as
// the operator app updates appointment statuses.

import Link from "next/link";
import { ArrowLeft, AlertCircle, Sparkles } from "lucide-react";
import clsx from "clsx";
import { useAppointmentsForDate, TODAY } from "@/lib/store";
import { STAFF } from "@/lib/data";

const STATION_LAYOUT: { stylistName: string; slot: { row: number; col: number } }[] = [
  { stylistName: "Mame Diarra", slot: { row: 1, col: 1 } },
  { stylistName: "Oumou D.", slot: { row: 1, col: 2 } },
  { stylistName: "Frederick Douglass", slot: { row: 1, col: 3 } },
  { stylistName: "Naomi K.", slot: { row: 2, col: 1 } },
  { stylistName: "Fatou Ciss", slot: { row: 2, col: 2 } },
  { stylistName: "Dieynaba D.", slot: { row: 2, col: 3 } },
  { stylistName: "Adja Timite", slot: { row: 3, col: 1 } },
  { stylistName: "Aminata Diawara", slot: { row: 3, col: 2 } },
  { stylistName: "Bebe Kaba", slot: { row: 3, col: 3 } },
];

function Station({
  stylistName,
  appt,
}: {
  stylistName: string;
  appt: { id: string; client: string; status: string; service?: string } | null;
}) {
  const stylist = STAFF.find((s) => s.name === stylistName);
  const isBusy = appt?.status === "active" || appt?.status === "arrived";
  const initials = stylistName.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div
      className={clsx(
        "relative flex flex-col rounded-2xl border-2 p-3 transition-colors",
        appt?.status === "active"
          ? "border-status-active bg-status-active/5"
          : appt?.status === "arrived"
            ? "border-status-arrived bg-status-arrived/5"
            : appt?.status === "confirmed"
              ? "border-ink-200 bg-white"
              : "border-dashed border-ink-200 bg-paper",
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
          style={{ background: stylist?.color || "#888" }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <div className="truncate text-xs font-semibold text-ink-900">{stylistName}</div>
          <div className="font-mono text-[9px] uppercase tracking-wider text-ink-500">
            {isBusy ? "On the chair" : appt?.status === "confirmed" ? "Setting up" : "Open"}
          </div>
        </div>
      </div>
      {appt ? (
        <div className="mt-2 border-t border-ink-200 pt-2 text-xs">
          <div className="truncate font-medium text-ink-900">{appt.client}</div>
          {appt.service && <div className="truncate text-ink-500">{appt.service}</div>}
        </div>
      ) : (
        <div className="mt-2 border-t border-dashed border-ink-200 pt-2 text-xs text-ink-500">
          No active client
        </div>
      )}
      {/* "Needs help" badge for some active stations */}
      {appt?.status === "active" && appt.id.endsWith("5") && (
        <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-status-pending text-white">
          <AlertCircle className="h-3 w-3" />
        </div>
      )}
    </div>
  );
}

export default function FloorViewPage() {
  const todayAppts = useAppointmentsForDate(TODAY);
  const stationAppts = new Map<string, typeof todayAppts[number] | null>();
  for (const a of todayAppts) {
    // Pick the "current" appointment for each stylist — prefer active > arrived > confirmed.
    if (!a.staff) continue;
    const existing = stationAppts.get(a.staff);
    const priority = (s: typeof a) =>
      s.status === "active" ? 3 : s.status === "arrived" ? 2 : s.status === "confirmed" ? 1 : 0;
    if (!existing || priority(a) > priority(existing)) {
      stationAppts.set(a.staff, a);
    }
  }

  const arrived = todayAppts.filter((a) => a.status === "arrived").length;
  const active = todayAppts.filter((a) => a.status === "active").length;
  const waitingClients = arrived;

  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      <Link href="/manage" className="-ml-2 inline-flex items-center gap-1 text-sm text-ink-500 hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Manage
      </Link>
      <header className="mt-2 flex items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-brand">
            <Sparkles className="h-3 w-3" /> Live floor view
          </div>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-brand">
            Today on the floor
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {active} active services · {arrived} clients arrived · {waitingClients > 0 ? `${waitingClients} waiting` : "no one waiting"}
          </p>
        </div>
        <div className="hidden sm:flex sm:items-center sm:gap-3 sm:text-xs">
          {[
            { label: "Active", cls: "bg-status-active" },
            { label: "Arrived", cls: "bg-status-arrived" },
            { label: "Confirmed", cls: "bg-ink-300" },
            { label: "Open", cls: "border border-ink-300" },
          ].map((l) => (
            <span key={l.label} className="flex items-center gap-1.5 text-ink-700">
              <span className={"inline-block h-2.5 w-2.5 rounded-sm " + l.cls} />
              {l.label}
            </span>
          ))}
        </div>
      </header>

      {/* Floor grid */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {STATION_LAYOUT.map((s) => (
          <Station key={s.stylistName} stylistName={s.stylistName} appt={stationAppts.get(s.stylistName) || null} />
        ))}
      </div>

      {/* Bottom strip */}
      <section className="mt-8 grid grid-cols-3 gap-3 rounded-2xl border border-ink-200 bg-white p-4 text-center">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">Reception</div>
          <div className="mt-1 text-sm font-semibold text-ink-900">2 walk-ins in queue</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">Wash bowls</div>
          <div className="mt-1 text-sm font-semibold text-ink-900">3 of 4 busy</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">Avg wait</div>
          <div className="mt-1 text-sm font-semibold text-ink-900">~12 min</div>
        </div>
      </section>
    </div>
  );
}
