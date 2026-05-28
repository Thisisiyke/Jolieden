"use client";

import { Avatar } from "./Avatar";
import { Heart, MessageCircle, Sparkles, Bot } from "lucide-react";
import type { Appointment } from "../lib/data";

export function AppointmentCard({
  appt,
  onClick,
  selected,
  draggable = true,
  onDragStart,
}: {
  appt: Appointment;
  onClick?: () => void;
  selected?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}) {
  const showRange = appt.status === "completed" && appt.end;
  const timeText = showRange ? `${appt.start} – ${appt.end}` : appt.start;
  return (
    <button
      type="button"
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
      className={
        "relative w-full text-left rounded-md border bg-white px-2.5 py-2 flex items-start gap-2 shadow-sm transition " +
        (selected
          ? "border-brand ring-2 ring-brand/20"
          : "border-ink-200 hover:border-ink-300 hover:shadow")
      }
    >
      {/* AI Concierge badge — top-right corner. Marks appointments the AI
          autonomously booked over SMS. Tiny so it doesn't crowd the card. */}
      {appt.aiBooked && (
        <span
          className="absolute -right-1 -top-1 z-10 flex h-4 items-center gap-0.5 rounded-full bg-brand px-1 py-0.5 font-mono text-[8px] uppercase tracking-wider text-white shadow"
          title="Booked by AI Concierge"
        >
          <Bot className="h-2.5 w-2.5" />
          AI
        </span>
      )}
      <Avatar name={appt.client} hue={appt.avatarHue} />
      <div className="min-w-0 flex-1 leading-tight">
        <div className="text-[11px] text-ink-500">{timeText}</div>
        <div className="text-[14px] font-semibold text-ink-900 truncate flex items-center gap-1">
          <span className="truncate">{appt.client}</span>
          {appt.pronouns && (
            <span className="text-[10px] font-normal text-ink-500">
              ({appt.pronouns})
            </span>
          )}
        </div>
        {(appt.isNewClient || appt.hasMessage || appt.isVip) && (
          <div className="mt-1 flex items-center gap-1">
            {appt.isNewClient && (
              <span className="inline-flex items-center gap-0.5 text-[9px] uppercase tracking-wide font-bold text-brand bg-brand-100 rounded px-1 py-0.5">
                <Sparkles className="h-2.5 w-2.5" /> New
              </span>
            )}
            {appt.hasMessage && (
              <MessageCircle className="h-3 w-3 text-sky-500" />
            )}
            {appt.isVip && <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />}
          </div>
        )}
      </div>
    </button>
  );
}
