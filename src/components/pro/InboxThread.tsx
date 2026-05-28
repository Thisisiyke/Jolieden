"use client";

// Single AI conversation transcript with a "Take over" CTA. When tapped,
// the stylist effectively claims the conversation — for the prototype we
// just toggle local state to show the takeover succeeded.

import { useState } from "react";
import clsx from "clsx";
import { Bot, User, Sparkles, CheckCircle2 } from "lucide-react";
import { reasonLabel, type AIEscalation } from "@/lib/aiInbox";

type Props = { escalation: AIEscalation };

export default function InboxThread({ escalation }: Props) {
  const [takenOver, setTakenOver] = useState(false);
  const [draft, setDraft] = useState("");
  const [resolved, setResolved] = useState(false);
  const [sent, setSent] = useState<string[]>([]);

  return (
    <div className="rounded-xl border border-ink-200 bg-white">
      <div className="border-b border-ink-200 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-ink-900">{escalation.clientName}</h3>
            <p className="font-mono text-[10px] text-ink-500">{escalation.clientPhone}</p>
          </div>
          <span className="shrink-0 rounded-full bg-status-pending/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-status-pending">
            {reasonLabel(escalation.reason)}
          </span>
        </div>
        <p className="mt-2 text-xs text-ink-700">
          <Sparkles className="mr-1 inline h-3 w-3 text-brand" />
          <span className="font-medium text-brand">AI:</span> {escalation.aiSummary}
        </p>
      </div>
      <ul className="space-y-2 px-4 py-3">
        {escalation.transcript.map((m, i) => (
          <li
            key={i}
            className={clsx(
              "flex gap-2 text-xs",
              m.from === "client" ? "flex-row" : "flex-row-reverse text-right",
            )}
          >
            <div
              className={clsx(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                m.from === "client" ? "bg-ink-100 text-ink-500" : "bg-brand text-white",
              )}
            >
              {m.from === "client" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
            </div>
            <div
              className={clsx(
                "max-w-[80%] rounded-lg px-3 py-1.5",
                m.from === "client" ? "bg-paper text-ink-900" : "bg-brand/5 text-ink-900",
              )}
            >
              <p>{m.body}</p>
              <span className="mt-0.5 block font-mono text-[9px] text-ink-500">{m.at}</span>
            </div>
          </li>
        ))}
      </ul>
      {/* Stylist's outbound replies (local state only — production wires
          to the Twilio Conversations API per AI_CONCIERGE.md §6). */}
      {sent.length > 0 && (
        <ul className="space-y-2 border-t border-ink-200 bg-paper px-4 py-3">
          {sent.map((body, i) => (
            <li key={i} className="flex flex-row-reverse gap-2 text-xs">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-status-confirmed text-white">
                <User className="h-3 w-3" />
              </div>
              <div className="max-w-[80%] rounded-lg bg-status-confirmed/10 px-3 py-1.5 text-right">
                <p>{body}</p>
                <span className="mt-0.5 block font-mono text-[9px] text-ink-500">
                  just now
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="border-t border-ink-200 bg-paper-mute px-4 py-3">
        {resolved ? (
          <div className="flex items-center justify-center gap-1.5 rounded-md bg-status-confirmed/10 px-3 py-2 text-xs font-medium text-status-confirmed">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Resolved — thread closed
          </div>
        ) : takenOver ? (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-status-confirmed">
              <CheckCircle2 className="h-3.5 w-3.5" />
              You&apos;ve taken over this conversation
            </div>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Reply directly to the client…"
              rows={2}
              className="w-full resize-none rounded-md border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setResolved(true)}
                className="rounded-md border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:border-status-confirmed hover:text-status-confirmed"
              >
                Mark resolved
              </button>
              <button
                type="button"
                disabled={!draft.trim()}
                onClick={() => {
                  setSent((p) => [...p, draft.trim()]);
                  setDraft("");
                }}
                className="rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                Send reply
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setTakenOver(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Take over
          </button>
        )}
      </div>
    </div>
  );
}
