"use client";

// Operator-side Oopsie / Repair queue. Lists every reported issue grouped by
// status so a manager can triage at a glance. Per Diéssou's Must-Have.

import Link from "next/link";
import { ArrowLeft, Camera, CheckCircle2, Clock, AlertTriangle, CalendarCheck } from "lucide-react";
import clsx from "clsx";
import { REPAIRS, type RepairRequest, type RepairStatus } from "@/lib/data";

const STATUS_ORDER: RepairStatus[] = ["open", "in-review", "scheduled", "resolved"];

const STATUS_LABEL: Record<RepairStatus, string> = {
  "open": "Open · needs triage",
  "in-review": "In review",
  "scheduled": "Fix scheduled",
  "resolved": "Resolved",
};

const STATUS_TONE: Record<RepairStatus, string> = {
  "open": "bg-status-pending/15 text-status-pending border-status-pending/30",
  "in-review": "bg-sky-100 text-sky-700 border-sky-200",
  "scheduled": "bg-status-confirmed/15 text-status-confirmed border-status-confirmed/30",
  "resolved": "bg-ink-100 text-ink-600 border-ink-200",
};

const STATUS_ICON: Record<RepairStatus, typeof AlertTriangle> = {
  "open": AlertTriangle,
  "in-review": Clock,
  "scheduled": CalendarCheck,
  "resolved": CheckCircle2,
};

function RepairCard({ r }: { r: RepairRequest }) {
  const Icon = STATUS_ICON[r.status];
  return (
    <article className="rounded-2xl border border-ink-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-ink-900">{r.clientName}</h3>
            <span
              className={clsx(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider",
                STATUS_TONE[r.status],
              )}
            >
              <Icon className="h-2.5 w-2.5" />
              {STATUS_LABEL[r.status]}
            </span>
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Original: {r.originalService}
            {r.originalStylist ? ` · ${r.originalStylist}` : ""} · Reported {r.reportedAt}
          </div>
        </div>
      </div>
      <p className="mt-3 text-sm text-ink-700">{r.description}</p>
      {r.photoCount > 0 && (
        <div className="mt-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-brand">
          <Camera className="h-3 w-3" /> {r.photoCount} photo{r.photoCount === 1 ? "" : "s"} attached
        </div>
      )}
      {r.photoCount > 0 && (
        <div className="mt-2 flex gap-1.5">
          {Array.from({ length: r.photoCount }).map((_, i) => (
            <div
              key={i}
              className="aspect-square w-16 rounded-md bg-paper"
              style={{
                background: `linear-gradient(140deg, hsl(${(i * 47) % 360}, 30%, 75%), hsl(${(i * 47 + 30) % 360}, 35%, 60%))`,
              }}
              aria-hidden="true"
            />
          ))}
        </div>
      )}
      {r.staffNotes && (
        <div className="mt-3 rounded-md border border-ink-200 bg-paper p-2 text-xs text-ink-700">
          <span className="font-mono text-[9px] uppercase tracking-wider text-ink-500">Staff note ·</span>{" "}
          {r.staffNotes}
        </div>
      )}
      {r.scheduledFor && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-status-confirmed">
          <CalendarCheck className="h-3.5 w-3.5" />
          Fix booked for <strong>{r.scheduledFor}</strong>
        </div>
      )}
      {r.resolvedAt && (
        <div className="mt-3 font-mono text-[10px] uppercase tracking-wider text-ink-500">
          Closed {r.resolvedAt}
        </div>
      )}

      {r.status !== "resolved" && (
        <div className="mt-4 flex gap-2 border-t border-ink-100 pt-3">
          <button
            type="button"
            className="flex-1 rounded-md bg-brand py-2 text-xs font-semibold text-white hover:bg-brand-700"
          >
            Schedule fix
          </button>
          <button
            type="button"
            className="flex-1 rounded-md border border-ink-200 bg-white py-2 text-xs font-medium text-ink-700 hover:border-brand"
          >
            Add note
          </button>
          <button
            type="button"
            className="rounded-md border border-ink-200 bg-white px-3 py-2 text-xs font-medium text-ink-700 hover:border-brand"
          >
            Resolve
          </button>
        </div>
      )}
    </article>
  );
}

export default function RepairsPage() {
  const grouped: Record<RepairStatus, RepairRequest[]> = {
    "open": [],
    "in-review": [],
    "scheduled": [],
    "resolved": [],
  };
  for (const r of REPAIRS) grouped[r.status].push(r);

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <Link href="/manage" className="-ml-2 inline-flex items-center gap-1 text-sm text-ink-500 hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Manage
      </Link>
      <header className="mt-2">
        <div className="font-mono text-[10px] uppercase tracking-wider text-brand">
          🛠 Oopsie / Repair queue
        </div>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-brand">
          Service issues flagged this week
        </h1>
        <p className="mt-1 text-sm text-ink-700">
          {grouped["open"].length} need triage · {grouped["in-review"].length} in review ·
          {" "}{grouped["scheduled"].length} fix{grouped["scheduled"].length === 1 ? "" : "es"} booked
        </p>
      </header>

      <div className="mt-6 space-y-6">
        {STATUS_ORDER.map((status) => {
          const items = grouped[status];
          if (items.length === 0) return null;
          return (
            <section key={status}>
              <h2 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-ink-500">
                {STATUS_LABEL[status]} ({items.length})
              </h2>
              <div className="grid gap-3 lg:grid-cols-2">
                {items.map((r) => (
                  <RepairCard key={r.id} r={r} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
