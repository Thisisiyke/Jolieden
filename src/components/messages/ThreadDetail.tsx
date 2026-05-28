"use client";

import Link from "next/link";
import clsx from "clsx";
import { Sparkles, Calendar as CalendarIcon, ArrowRight, Send, HandIcon } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import type { Conversation, Appointment, ConversationTurn } from "@/lib/data";
import { APPOINTMENTS } from "@/lib/data";

// Look up an appointment linked to a thread. Prefer explicit bookingId on
// the conversation; fall back to matching by client name + aiBooked flag.
function findApptForThread(conv: Conversation): Appointment | undefined {
  if (conv.bookingId) {
    const byId = APPOINTMENTS.find((a) => a.id === conv.bookingId);
    if (byId) return byId;
  }
  return APPOINTMENTS.find(
    (a) => a.aiBooked && a.client.toLowerCase().trim() === conv.name.toLowerCase().trim(),
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-ink-500/60"
          style={{
            animation: `imsg-bounce 1.2s ${i * 0.15}s infinite ease-in-out`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes imsg-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-3px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function Bubble({ turn }: { turn: ConversationTurn }) {
  const right = turn.from === "client";
  return (
    <div className={clsx("flex w-full", right ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-[75%] rounded-2xl px-3.5 py-2 text-[14px] leading-snug shadow-sm",
          right
            ? "rounded-br-md bg-[#3b82f6] text-white"
            : turn.from === "ai"
              ? "rounded-bl-md bg-[#e9e9eb] text-ink-900"
              : "rounded-bl-md border border-brand/40 bg-brand-50 text-ink-900",
        )}
      >
        {turn.from === "ai" && (
          <div className="mb-0.5 flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-ink-500">
            <Sparkles className="h-3 w-3" /> Jolieden AI
          </div>
        )}
        {turn.from === "staff" && (
          <div className="mb-0.5 font-mono text-[10px] uppercase tracking-wider text-brand">
            Salon staff — taken over
          </div>
        )}
        <p className="whitespace-pre-wrap">{turn.body}</p>
        {turn.ts && (
          <div className={clsx("mt-0.5 text-right font-mono text-[9px]", right ? "text-white/70" : "text-ink-400")}>
            {turn.ts}
          </div>
        )}
      </div>
    </div>
  );
}

function BookingCard({ appt }: { appt: Appointment }) {
  return (
    <div className="my-2 flex justify-center">
      <Link
        href={`/calendar?focus=${appt.id}`}
        className="block w-full max-w-[420px] rounded-2xl border border-status-confirmed/40 bg-status-confirmed/5 px-4 py-3 shadow-sm hover:border-status-confirmed"
      >
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-status-confirmed">
          <CalendarIcon className="h-3 w-3" /> 📅 AI committed this booking
        </div>
        <div className="mt-1 text-sm font-semibold text-ink-900">{appt.service}</div>
        <div className="mt-0.5 text-xs text-ink-700">
          {appt.date} · {appt.start}
          {appt.end ? `–${appt.end}` : ""} · with {appt.staff}
        </div>
        <div className="mt-1 font-mono text-[10px] text-ink-500">
          ${appt.price} · $25 deposit auto-applied
        </div>
        <div className="mt-2 flex items-center gap-1 text-[10px] font-medium text-status-confirmed">
          Open on calendar
          <ArrowRight className="h-3 w-3" />
        </div>
      </Link>
    </div>
  );
}

export default function ThreadDetail({ conv }: { conv: Conversation }) {
  const linkedAppt = findApptForThread(conv);
  const isLive = conv.aiState === "ai-replying";
  const needsHuman = conv.aiState === "needs-you";

  return (
    <section className="flex flex-1 flex-col">
      {/* Conversation header */}
      <div className="flex h-14 items-center gap-3 border-b border-ink-200 px-5">
        <Avatar name={conv.name === "Unknown" ? "U N" : conv.name} size={36} />
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate text-sm font-semibold text-ink-900">{conv.name}</div>
          <div className="font-mono text-[10px] text-ink-500">
            {conv.phone || "—"}
          </div>
        </div>
        {needsHuman && (
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
          >
            <HandIcon className="h-3 w-3" />
            Take over
          </button>
        )}
      </div>

      {/* AI summary banner */}
      {conv.aiSummary && (
        <div
          className={clsx(
            "border-b px-5 py-2 text-xs",
            needsHuman
              ? "border-status-pending/30 bg-status-pending/5 text-status-pending"
              : "border-status-confirmed/30 bg-status-confirmed/5 text-ink-700",
          )}
        >
          <Sparkles className="mr-1 inline h-3 w-3 text-brand" />
          {conv.aiSummary}
        </div>
      )}

      {/* Conversation pane */}
      <div className="flex-1 space-y-2 overflow-y-auto bg-white px-5 py-4">
        {conv.transcript?.map((t, i) => (
          <div key={i}>
            <Bubble turn={t} />
            {/* Drop the booking card right after the AI's commit line */}
            {linkedAppt && i === (conv.transcript?.length || 0) - 1 && conv.aiState === "ai-handled" && (
              <BookingCard appt={linkedAppt} />
            )}
          </div>
        ))}
        {isLive && (
          <div className="flex w-full justify-start">
            <div className="rounded-2xl bg-[#e9e9eb]">
              <TypingDots />
            </div>
          </div>
        )}
        {!conv.transcript && (
          <div className="flex flex-1 items-center justify-center text-center text-sm text-ink-500">
            System notification thread — no client conversation.
          </div>
        )}
      </div>

      {/* Composer (disabled in needs-you to nudge takeover) */}
      <div className="flex items-center gap-2 border-t border-ink-200 p-3">
        <input
          placeholder={
            needsHuman
              ? "Tap 'Take over' first to reply directly…"
              : isLive
                ? "AI is replying right now — pause it to type"
                : "Type a message…"
          }
          disabled={needsHuman || isLive}
          className="h-10 flex-1 rounded border border-ink-300 px-3 text-sm outline-none focus:border-brand disabled:bg-ink-50 disabled:text-ink-400"
        />
        <button
          type="button"
          disabled={needsHuman || isLive}
          className="flex h-10 items-center gap-1 rounded bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
          Send
        </button>
      </div>
    </section>
  );
}
