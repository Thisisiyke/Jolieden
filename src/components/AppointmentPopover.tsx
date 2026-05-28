"use client";

import {
  Phone,
  X,
  Edit3,
  Printer,
  ChevronDown,
  RotateCcw,
  ExternalLink,
  Receipt,
  CheckCircle2,
  Send,
} from "lucide-react";
import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Appointment } from "../lib/data";
import { resolveClientByName } from "../lib/personas";
import InviteToAppDrawer from "./operator/InviteToAppDrawer";

export function AppointmentPopover({
  appt,
  anchor,
  onClose,
  onAdvance,
  onCancelAppt,
  onRebook,
}: {
  appt: Appointment;
  anchor: HTMLElement | null;
  onClose: () => void;
  onAdvance: () => void;
  onCancelAppt: () => void;
  onRebook?: () => void;
}) {
  const isCompleted = appt.status === "completed";
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  // Resolve the appointment's client by name so the invite drawer can
  // pre-fill recipient, opt-in status, and the app deep-link slug.
  // Returns undefined for walk-ins not yet in the clients table — we
  // still allow the button (operator gets a graceful "no record yet"
  // state by tapping it).
  const client = resolveClientByName(appt.client);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!anchor) return;
    const compute = () => {
      const r = anchor.getBoundingClientRect();
      const W = 340;
      const margin = 8;
      let left = r.left;
      if (left + W > window.innerWidth - margin) left = window.innerWidth - W - margin;
      if (left < margin) left = margin;
      let top = r.bottom + 6;
      // If it would overflow bottom (estimated 420px popover), flip above
      if (top + 420 > window.innerHeight - margin) {
        top = Math.max(margin, r.top - 420 - 6);
      }
      setPos({ top, left });
    };
    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, true);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
    };
  }, [anchor]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mounted || !pos) return null;

  return createPortal(
    <div
      style={{ top: pos.top, left: pos.left, position: "fixed" }}
      className="z-50 w-[340px] bg-white rounded-lg shadow-xl border border-ink-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-4 pt-3 pb-2 flex items-start justify-between">
        <div>
          <div className="text-brand font-semibold text-[14px] tracking-wide flex items-center gap-2">
            {appt.client.toUpperCase()}
            {appt.pronouns && (
              <span className="text-[10px] text-ink-500 font-normal">
                ({appt.pronouns})
              </span>
            )}
          </div>
          {appt.phone && (
            <div className="text-[12px] text-ink-700">{appt.phone}</div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button className="text-ink-500 hover:text-ink-900 p-1">
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="text-ink-500 hover:text-ink-900 p-1"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-4 pb-2 grid grid-cols-3 gap-2 text-[11px] text-ink-700">
        <Stat label="Show Rate" value={`${appt.showRate ?? 100}%`} />
        <Stat
          label={isCompleted ? "Avg. Frequency" : "Avg. Visit"}
          value={
            isCompleted
              ? appt.avgFrequency ?? "—"
              : `$${appt.avgVisit ?? 0}`
          }
        />
        <Stat label="Num Visits" value={`${appt.numVisits ?? 0}`} />
      </div>

      <div className="border-t border-ink-200 px-4 py-3 text-[12px]">
        <div className="text-ink-700 font-medium">
          {appt.date}
          {appt.start ? ` · ${appt.start}` : ""}
          {appt.end ? ` – ${appt.end}` : ""}
        </div>
        <div className="mt-2 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-ink-900 font-medium truncate">
              {appt.start}{" "}
              <span className="text-ink-700 font-normal">{appt.service}</span>
            </div>
            {appt.serviceDetail && (
              <div className="text-[11px] text-ink-500 mt-0.5 truncate">
                {appt.serviceDetail}
              </div>
            )}
          </div>
          {appt.staff && (
            <span className="inline-flex items-center gap-1 text-[11px] text-ink-700 whitespace-nowrap">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              {appt.staff}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-ink-700">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-ink-900">
              ${appt.price?.toFixed(2)}
            </span>
            <button className="text-ink-500 hover:text-ink-900">
              <Printer className="h-3.5 w-3.5" />
            </button>
          </div>
          {appt.bookedBy && (
            <span className="text-[10px] text-ink-500 truncate">
              Booked by {appt.bookedBy} on {appt.bookedAt}
            </span>
          )}
        </div>
      </div>

      <div className="border-t border-ink-200 px-4 py-3">
        <div className="text-[11px] text-ink-500 mb-1">Appointment Tags</div>
        <div className="flex items-center gap-1 flex-wrap">
          {(appt.tags ?? []).map((t) => (
            <span
              key={t}
              className="text-[10px] font-semibold uppercase tracking-wide text-brand bg-brand-100 rounded px-1.5 py-0.5"
            >
              {t}
            </span>
          ))}
          <button className="text-[11px] uppercase tracking-wide font-semibold text-ink-700 border border-ink-300 rounded px-2 py-0.5 hover:bg-ink-50">
            Add tags +
          </button>
        </div>
      </div>

      <div className="border-t border-ink-200 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <IconBtn title="Call">
            <Phone className="h-4 w-4" />
          </IconBtn>
          {client && (
            <IconBtn
              title="Send confirmation + app invite"
              onClick={() => setInviteOpen(true)}
            >
              <Send className="h-4 w-4" />
            </IconBtn>
          )}
          {!isCompleted && (
            <IconBtn
              title="Cancel appointment"
              tone="danger"
              onClick={onCancelAppt}
            >
              <X className="h-4 w-4" />
            </IconBtn>
          )}
          {!isCompleted && onRebook && (
            <IconBtn title="Rebook" onClick={onRebook}>
              <RotateCcw className="h-4 w-4" />
            </IconBtn>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isCompleted ? (
            <>
              <button className="h-8 px-3 text-[12px] rounded border border-ink-300 text-ink-700 hover:bg-ink-50 inline-flex items-center gap-1">
                <ExternalLink className="h-3.5 w-3.5" /> View Appointment
              </button>
              <button className="h-8 px-3 text-[12px] rounded bg-brand text-white hover:bg-brand-700 font-semibold inline-flex items-center gap-1">
                <Receipt className="h-3.5 w-3.5" /> View Order
              </button>
            </>
          ) : (
            <>
              <button className="h-8 px-3 text-[12px] rounded border border-ink-300 text-ink-700 hover:bg-ink-50 inline-flex items-center gap-1">
                <Edit3 className="h-3.5 w-3.5" /> Edit
              </button>
              <button
                onClick={onAdvance}
                className={
                  "h-8 px-3 text-[12px] rounded font-semibold inline-flex items-center gap-1 " +
                  (appt.status === "arrived" || appt.status === "active"
                    ? "bg-brand text-white hover:bg-brand-700"
                    : "bg-sky-500 text-white hover:bg-sky-600")
                }
              >
                {labelForAdvance(appt.status)}
                {appt.status === "arrived" && (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
              </button>
            </>
          )}
        </div>
      </div>
      {client && (
        <InviteToAppDrawer
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
          client={client}
          appt={appt}
        />
      )}
    </div>,
    document.body,
  );
}

function labelForAdvance(s: Appointment["status"]): string {
  switch (s) {
    case "unconfirmed":
      return "Mark as Confirmed";
    case "confirmed":
      return "Check In";
    case "walkin":
      return "Start Service";
    case "arrived":
      return "Start Service";
    case "active":
      return "Checkout";
    default:
      return "Advance";
  }
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="leading-tight">
      <div className="text-ink-500">{label}</div>
      <div className="text-ink-900 font-medium">{value}</div>
    </div>
  );
}

function IconBtn({
  children,
  title,
  onClick,
  tone = "default",
}: {
  children: React.ReactNode;
  title: string;
  onClick?: () => void;
  tone?: "default" | "danger";
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={
        "h-8 w-8 rounded flex items-center justify-center " +
        (tone === "danger"
          ? "text-rose-600 hover:bg-rose-50"
          : "text-ink-700 hover:bg-ink-100")
      }
    >
      {children}
    </button>
  );
}
