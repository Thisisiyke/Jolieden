"use client";

// Smart router for the Appointment object. Same component, two views:
//   - "client": rendered inside /me/[clientSlug]/bookings/[id]
//   - "stylist": rendered inside /pro/[stylistSlug]/schedule/[id]
//
// Status drives both the visible state and the primary CTA. Tapping the CTA
// advances the status via Zustand — change reflects on the other surfaces
// immediately (operator kanban, /pro queue, etc.) because they all read from
// the same store.

import { useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  MapPin,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Camera,
  StickyNote,
  XCircle,
  RefreshCcw,
  Cake,
  Star,
  Clock,
} from "lucide-react";
import clsx from "clsx";
import { useStore } from "@/lib/store";
import { stylistByName } from "@/lib/personas";
import type { ApptStatus, Stylist } from "@/lib/data";

type View = "client" | "stylist";

type Props = {
  appointmentId: string;
  view: View;
};

// ───────────────────── status helpers ─────────────────────

const STATUS_BADGE: Record<ApptStatus, { label: string; cls: string }> = {
  unconfirmed: { label: "Awaiting confirmation", cls: "bg-status-pending/15 text-status-pending border-status-pending/40" },
  confirmed: { label: "Confirmed", cls: "bg-status-confirmed/15 text-status-confirmed border-status-confirmed/40" },
  walkin: { label: "Walk-in", cls: "bg-status-walkin/15 text-status-walkin border-status-walkin/40" },
  arrived: { label: "Checked in", cls: "bg-status-arrived/15 text-status-arrived border-status-arrived/40" },
  active: { label: "In service", cls: "bg-status-active/15 text-status-active border-status-active/40" },
  completed: { label: "Complete", cls: "bg-status-completed/15 text-status-completed border-status-completed/40" },
};

// next-status mapping per view
const CLIENT_NEXT: Partial<Record<ApptStatus, ApptStatus>> = {
  unconfirmed: "confirmed",
  confirmed: "arrived", // simulates iPad self check-in
};

const STYLIST_NEXT: Partial<Record<ApptStatus, ApptStatus>> = {
  unconfirmed: "confirmed",
  confirmed: "arrived",
  arrived: "active",
  active: "completed",
};

// CTA label per view × status
const PRIMARY_CTA: Record<View, Partial<Record<ApptStatus, string>>> = {
  client: {
    unconfirmed: "Confirm this booking",
    confirmed: "I've arrived",
  },
  stylist: {
    unconfirmed: "Confirm with client",
    confirmed: "Mark client arrived",
    arrived: "Start service",
    active: "Mark complete",
  },
};

// ───────────────────── helpers ─────────────────────

function StylistRow({ stylist }: { stylist: Stylist | undefined }) {
  if (!stylist) return null;
  return (
    <div className="flex items-center gap-3 rounded-lg border border-ink-200 bg-white p-3">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
        style={{ background: stylist.color }}
      >
        {stylist.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-ink-900">{stylist.name}</div>
        <div className="truncate text-xs text-ink-500">{stylist.specialty || stylist.role}</div>
      </div>
    </div>
  );
}

function ClientStateSection({ status, hasBirthday }: { status: ApptStatus; hasBirthday: boolean }) {
  if (status === "arrived") {
    return (
      <div className="rounded-lg border border-status-arrived/30 bg-status-arrived/5 p-4 text-sm text-ink-900">
        <div className="flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-4 w-4 text-status-arrived" /> You&apos;re checked in
        </div>
        <p className="mt-1 text-xs text-ink-700">
          Your stylist will be ready for you in about 5 minutes. Take a seat — drinks are on us.
        </p>
        {hasBirthday && (
          <div className="mt-3 flex items-start gap-2 rounded-md border border-gold/40 bg-gold-soft p-3">
            <Cake className="mt-0.5 h-4 w-4 text-brand" />
            <div>
              <div className="text-sm font-medium text-brand">Happy birthday week!</div>
              <p className="mt-0.5 text-xs text-ink-700">
                A complimentary Wash &amp; Blow has been added to your appointment.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }
  if (status === "active") {
    return (
      <div className="rounded-lg border border-status-active/30 bg-status-active/5 p-4 text-sm">
        <div className="flex items-center gap-2 font-medium text-ink-900">
          <Sparkles className="h-4 w-4 text-status-active" /> Service in progress
        </div>
        <p className="mt-1 text-xs text-ink-700">
          Your stylist will let you know when it&apos;s time for any choices. Relax and unwind.
        </p>
      </div>
    );
  }
  if (status === "completed") {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-status-completed/30 bg-status-completed/5 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-ink-900">
            <CheckCircle2 className="h-4 w-4 text-status-completed" /> Service complete
          </div>
          <p className="mt-1 text-xs text-ink-700">Hope you love it. Care tips coming via SMS shortly.</p>
        </div>
        <div className="rounded-lg border border-ink-200 bg-white p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-ink-500">Rate your experience</div>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className="rounded-full p-1 text-ink-300 hover:text-gold"
                aria-label={`${n} stars`}
              >
                <Star className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (status === "confirmed") {
    return (
      <div className="rounded-lg border border-status-confirmed/30 bg-status-confirmed/5 p-4 text-sm text-ink-900">
        <div className="flex items-center gap-2 font-medium">
          <CalendarCheck className="h-4 w-4 text-status-confirmed" /> You&apos;re all set
        </div>
        <p className="mt-1 text-xs text-ink-700">
          We&apos;ll send you a reminder 24 hours before. Show up 5 minutes early for the calmest check-in.
        </p>
      </div>
    );
  }
  if (status === "unconfirmed") {
    return (
      <div className="rounded-lg border border-status-pending/30 bg-status-pending/5 p-4 text-sm">
        <div className="flex items-center gap-2 font-medium text-ink-900">
          <Clock className="h-4 w-4 text-status-pending" /> Confirm to lock this time
        </div>
        <p className="mt-1 text-xs text-ink-700">
          Your booking holds for 30 minutes. Confirm below to keep it.
        </p>
      </div>
    );
  }
  return null;
}

function StylistStateSection({
  status,
  notes,
  onAddNote,
}: {
  status: ApptStatus;
  notes: string[];
  onAddNote: (note: string) => void;
}) {
  const [draft, setDraft] = useState("");
  if (status === "active") {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-status-active/30 bg-status-active/5 p-4 text-sm">
          <div className="flex items-center gap-2 font-medium text-ink-900">
            <Sparkles className="h-4 w-4 text-status-active" /> Service in progress
          </div>
          <p className="mt-1 text-xs text-ink-700">
            Capture before/after photos for the client&apos;s hair journey. Log products as you go.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className="flex items-center justify-center gap-1.5 rounded-md border border-ink-200 bg-white py-2 text-xs font-medium text-ink-900 hover:bg-paper"
          >
            <Camera className="h-3.5 w-3.5" /> Capture photo
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-1.5 rounded-md border border-ink-200 bg-white py-2 text-xs font-medium text-ink-900 hover:bg-paper"
          >
            <StickyNote className="h-3.5 w-3.5" /> Log product
          </button>
        </div>
        <div className="rounded-lg border border-ink-200 bg-white p-3">
          <label className="text-xs font-medium uppercase tracking-wider text-ink-500">Quick note</label>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Client preferred lighter color this time…"
            rows={2}
            className="mt-1 w-full resize-none rounded-md border border-ink-200 bg-paper px-2 py-1.5 text-sm focus:border-brand focus:outline-none"
          />
          <button
            type="button"
            disabled={!draft.trim()}
            onClick={() => {
              if (!draft.trim()) return;
              onAddNote(draft.trim());
              setDraft("");
            }}
            className="mt-2 rounded-md bg-brand px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
          >
            Add note
          </button>
          {notes.length > 0 && (
            <ul className="mt-3 space-y-1.5 border-t border-ink-200 pt-2 text-xs text-ink-700">
              {notes.map((n, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <StickyNote className="mt-0.5 h-3 w-3 text-ink-500" />
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }
  if (status === "completed") {
    return (
      <div className="rounded-lg border border-status-completed/30 bg-status-completed/5 p-4 text-sm">
        <div className="flex items-center gap-2 font-medium text-ink-900">
          <CheckCircle2 className="h-4 w-4 text-status-completed" /> Service summary
        </div>
        <p className="mt-1 text-xs text-ink-700">
          Client checked out. Photo + notes auto-saved to her journey timeline.
        </p>
      </div>
    );
  }
  if (status === "arrived") {
    return (
      <div className="rounded-lg border border-status-arrived/30 bg-status-arrived/5 p-4 text-sm text-ink-900">
        <div className="flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-4 w-4 text-status-arrived" /> Client at the chair
        </div>
        <p className="mt-1 text-xs text-ink-700">
          Confirm the booked options, capture a before photo, then start the service.
        </p>
      </div>
    );
  }
  if (status === "confirmed" || status === "unconfirmed") {
    return (
      <div className="rounded-lg border border-ink-200 bg-white p-4 text-sm text-ink-700">
        Pre-arrival. You&apos;ll see prep notes here once the client confirms options on their end.
      </div>
    );
  }
  return null;
}

// ───────────────────── card ─────────────────────

export default function BookingDetailCard({ appointmentId, view }: Props) {
  const appt = useStore((s) => s.appointments[appointmentId]);
  const setAppointmentStatus = useStore((s) => s.setAppointmentStatus);
  const [notes, setNotes] = useState<string[]>([]);

  if (!appt) {
    return (
      <div className="px-5 py-6 text-sm text-ink-500">
        That booking isn&apos;t available anymore.
      </div>
    );
  }

  const stylist = stylistByName(appt.staff);
  const hasBirthday = (appt.tags || []).includes("Birthday");
  const badge = STATUS_BADGE[appt.status];
  const nextMap = view === "client" ? CLIENT_NEXT : STYLIST_NEXT;
  const next = nextMap[appt.status];
  const ctaLabel = PRIMARY_CTA[view][appt.status];

  const advance = () => {
    if (next) setAppointmentStatus(appt.id, next);
  };

  const cancel = () => {
    // Prototype: just nudge to completed/cancelled-like state for demo.
    setAppointmentStatus(appt.id, "completed");
  };

  return (
    <div className="space-y-4 px-5 py-6">
      {/* Status badge + ID */}
      <div className="flex items-center justify-between">
        <span
          className={clsx(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
            badge.cls,
          )}
        >
          {badge.label}
        </span>
        <span className="font-mono text-[10px] text-ink-500">#{appt.id}</span>
      </div>

      {/* Service */}
      <div>
        <h1 className="font-serif text-xl font-semibold text-brand">{appt.service}</h1>
        {appt.serviceDetail && (
          <p className="mt-0.5 text-xs text-ink-500">{appt.serviceDetail}</p>
        )}
      </div>

      {/* Birthday flag (visible in either view if tag present) */}
      {hasBirthday && (
        <div className="flex items-center gap-2 rounded-lg border border-gold/40 bg-gold-soft px-3 py-2">
          <Cake className="h-4 w-4 text-brand" />
          <div className="text-xs text-ink-900">
            <span className="font-medium">Birthday booking</span> — comp Wash &amp; Blow attached.
          </div>
        </div>
      )}

      {/* Stylist or client row */}
      {view === "client" ? (
        <StylistRow stylist={stylist} />
      ) : (
        <div className="rounded-lg border border-ink-200 bg-white p-3">
          <div className="text-xs uppercase tracking-wider text-ink-500">Client</div>
          <div className="mt-0.5 text-sm font-medium text-ink-900">{appt.client}</div>
          {appt.numVisits !== undefined && (
            <div className="mt-0.5 font-mono text-[10px] text-ink-500">
              {appt.numVisits} prior visits
              {appt.avgFrequency ? ` · ${appt.avgFrequency}` : ""}
            </div>
          )}
        </div>
      )}

      {/* When + Where + Price grid */}
      <div className="grid grid-cols-3 gap-2 rounded-lg border border-ink-200 bg-white p-3 text-xs">
        <div>
          <div className="font-mono uppercase tracking-wider text-ink-500">Date</div>
          <div className="mt-0.5 text-sm font-medium text-ink-900">{appt.date}</div>
        </div>
        <div>
          <div className="font-mono uppercase tracking-wider text-ink-500">Time</div>
          <div className="mt-0.5 text-sm font-medium text-ink-900">{appt.start}</div>
        </div>
        <div className="text-right">
          <div className="font-mono uppercase tracking-wider text-ink-500">Price</div>
          <div className="mt-0.5 font-mono text-sm font-semibold text-brand">${appt.price ?? 0}</div>
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs text-ink-500">
        <MapPin className="h-3 w-3" />
        Jolieden Beauty Bar · New York
      </div>

      {/* Status-specific section */}
      {view === "client" ? (
        <ClientStateSection status={appt.status} hasBirthday={hasBirthday} />
      ) : (
        <StylistStateSection
          status={appt.status}
          notes={notes}
          onAddNote={(n) => setNotes((prev) => [...prev, n])}
        />
      )}

      {/* Primary CTA */}
      {ctaLabel && next && (
        <button
          type="button"
          onClick={advance}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {ctaLabel}
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Secondary CTAs */}
      {view === "client" && (appt.status === "confirmed" || appt.status === "unconfirmed") && (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className="flex items-center justify-center gap-1.5 rounded-md border border-ink-200 bg-white py-2 text-xs font-medium text-ink-700 hover:bg-paper"
          >
            <RefreshCcw className="h-3.5 w-3.5" /> Reschedule
          </button>
          <button
            type="button"
            onClick={cancel}
            className="flex items-center justify-center gap-1.5 rounded-md border border-ink-200 bg-white py-2 text-xs font-medium text-ink-700 hover:bg-paper"
          >
            <XCircle className="h-3.5 w-3.5" /> Cancel
          </button>
        </div>
      )}

      {view === "client" && appt.status === "completed" && (
        <Link
          href="/book"
          className="flex w-full items-center justify-center gap-1.5 rounded-md border border-brand bg-white py-2.5 text-sm font-medium text-brand hover:bg-brand hover:text-white"
        >
          <RefreshCcw className="h-3.5 w-3.5" /> Rebook the same
        </Link>
      )}
    </div>
  );
}
