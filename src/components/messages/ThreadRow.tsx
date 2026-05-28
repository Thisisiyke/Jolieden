"use client";

import clsx from "clsx";
import { Sparkles, Bot, AlertTriangle, Calendar as CalendarIcon, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import type { Conversation, AiReason } from "@/lib/data";

const REASON_LABEL: Record<AiReason, string> = {
  "escalation": "AI escalated",
  "complaint": "Complaint",
  "no-availability": "No availability",
  "cancellation": "Late cancellation",
  "auto-reply": "Auto-reply",
  "auto-booking": "Auto-booked",
  "faq": "FAQ answered",
  "reminder": "Reminder sent",
};

const REASON_ICON: Record<AiReason, typeof Bot> = {
  "escalation": AlertTriangle,
  "complaint": AlertTriangle,
  "no-availability": AlertTriangle,
  "cancellation": AlertTriangle,
  "auto-reply": Bot,
  "auto-booking": CalendarIcon,
  "faq": MessageCircle,
  "reminder": MessageCircle,
};

const REASON_TONE: Record<AiReason, string> = {
  "escalation": "bg-status-pending/15 text-status-pending",
  "complaint": "bg-rose-100 text-rose-700",
  "no-availability": "bg-status-pending/15 text-status-pending",
  "cancellation": "bg-rose-100 text-rose-700",
  "auto-reply": "bg-ink-100 text-ink-600",
  "auto-booking": "bg-status-confirmed/15 text-status-confirmed",
  "faq": "bg-sky-100 text-sky-700",
  "reminder": "bg-ink-100 text-ink-600",
};

export default function ThreadRow({
  conv,
  selected,
  onClick,
}: {
  conv: Conversation;
  selected: boolean;
  onClick: () => void;
}) {
  const isLive = conv.aiState === "ai-replying";
  const Icon = conv.aiReason ? REASON_ICON[conv.aiReason] : Bot;

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "flex w-full items-start gap-3 border-b border-ink-100 px-4 py-3 text-left transition-colors",
        selected ? "bg-brand-50" : "hover:bg-ink-50",
      )}
    >
      <Avatar name={conv.name === "Unknown" ? "U N" : conv.name} size={32} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-[13.5px] font-semibold text-ink-900">
              {conv.name === "Unknown" && conv.phone ? conv.phone : conv.name}
            </span>
            {isLive && (
              <span className="flex items-center gap-1 rounded-full bg-status-active/15 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-status-active">
                <span className="relative inline-flex h-1.5 w-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-status-active opacity-70" />
                  <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-status-active" />
                </span>
                Live
              </span>
            )}
          </div>
          <span className="shrink-0 font-mono text-[10px] text-ink-500">{conv.time}</span>
        </div>
        <div className="mt-0.5 line-clamp-1 text-[12px] text-ink-500">{conv.preview}</div>
        {conv.aiReason && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <span
              className={clsx(
                "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider",
                REASON_TONE[conv.aiReason],
              )}
            >
              <Icon className="h-2.5 w-2.5" />
              {REASON_LABEL[conv.aiReason]}
            </span>
            {conv.aiState === "ai-handled" && !isLive && (
              <span className="font-mono text-[9px] uppercase tracking-wider text-ink-500">
                <Sparkles className="mr-0.5 inline h-2.5 w-2.5 text-brand" />
                AI
              </span>
            )}
          </div>
        )}
      </div>
      {conv.unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand" />}
    </button>
  );
}
