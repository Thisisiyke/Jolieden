"use client";

// Operator Messages with AI Concierge surfaced. Two-stack layout:
//   "Needs you"   — escalations, complaints, no-availability, cancellations
//   "AI handled"  — auto-replies, auto-bookings, FAQ closures, reminders
// Right pane: ThreadDetail with iMessage-style bubbles + inline booking
// card when the AI committed a calendar slot.

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, MoreHorizontal, Sparkles, Bot, BarChart3 } from "lucide-react";
import { CONVERSATIONS, type Conversation } from "@/lib/data";
import ThreadRow from "@/components/messages/ThreadRow";
import ThreadDetail from "@/components/messages/ThreadDetail";

function SectionHeader({
  emoji,
  label,
  count,
  tone,
}: {
  emoji: string;
  label: string;
  count: number;
  tone: "needs" | "handled";
}) {
  return (
    <div
      className={
        "flex items-center justify-between border-b border-ink-200 px-4 py-2 " +
        (tone === "needs" ? "bg-status-pending/5" : "bg-paper")
      }
    >
      <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-700">
        <span>{emoji}</span>
        <span>{label}</span>
      </span>
      <span
        className={
          "rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider " +
          (tone === "needs"
            ? "bg-status-pending/15 text-status-pending"
            : "bg-ink-100 text-ink-600")
        }
      >
        {count}
      </span>
    </div>
  );
}

export default function MessagesPage() {
  const [tab, setTab] = useState<"open" | "closed">("open");
  const [selectedId, setSelectedId] = useState<string | null>("c-ai-1");

  const list = useMemo(() => CONVERSATIONS.filter((c) => c.status === tab), [tab]);
  const needsYou: Conversation[] = list.filter((c) => c.aiState === "needs-you");
  const aiHandled: Conversation[] = list.filter(
    (c) => c.aiState === "ai-handled" || c.aiState === "ai-replying" || !c.aiState,
  );
  const sel = list.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-white">
      {/* Inbox column */}
      <aside className="flex w-[400px] shrink-0 flex-col border-r border-ink-200">
        <div className="flex items-center justify-between px-4 pb-2 pt-4">
          <div>
            <h1 className="text-[20px] font-semibold text-ink-900">Inbox</h1>
            <div className="mt-0.5 flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-brand">
              <Sparkles className="h-3 w-3" />
              AI Concierge active
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href="/messages/analytics"
              className="flex h-8 items-center gap-1 rounded border border-ink-200 px-2 text-[11px] text-ink-700 hover:border-brand hover:text-brand"
              title="AI conversation analytics"
            >
              <BarChart3 className="h-3 w-3" /> Analytics
            </Link>
            <button className="flex h-8 w-8 items-center justify-center rounded text-ink-500 hover:bg-ink-100">
              <MoreHorizontal className="h-4 w-4" />
            </button>
            <button className="inline-flex h-8 items-center gap-1 rounded bg-brand px-3 text-[12px] font-semibold text-white hover:bg-brand-700">
              <Plus className="h-3 w-3" /> New
            </button>
          </div>
        </div>

        {/* Open / Closed tabs */}
        <div className="flex items-center gap-4 border-b border-ink-200 px-4">
          {(["open", "closed"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "relative py-2 text-[14px] font-medium " +
                (tab === t ? "text-brand" : "text-ink-500")
              }
            >
              {t === "open" ? "Open" : "Closed"}
              {tab === t && (
                <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-brand" />
              )}
            </button>
          ))}
        </div>

        {/* Two stacked sections */}
        <div className="flex-1 overflow-y-auto">
          <SectionHeader
            emoji="🚨"
            label="Needs you"
            count={needsYou.length}
            tone="needs"
          />
          {needsYou.length === 0 ? (
            <div className="flex items-center justify-center px-4 py-6 text-center font-mono text-[10px] uppercase tracking-wider text-ink-500">
              No threads waiting for a human ✨
            </div>
          ) : (
            needsYou.map((c) => (
              <ThreadRow
                key={c.id}
                conv={c}
                selected={selectedId === c.id}
                onClick={() => setSelectedId(c.id)}
              />
            ))
          )}

          <SectionHeader
            emoji="✨"
            label="AI handled"
            count={aiHandled.length}
            tone="handled"
          />
          {aiHandled.map((c) => (
            <ThreadRow
              key={c.id}
              conv={c}
              selected={selectedId === c.id}
              onClick={() => setSelectedId(c.id)}
            />
          ))}
        </div>
      </aside>

      {/* Conversation pane */}
      {sel ? (
        <ThreadDetail conv={sel} />
      ) : (
        <section className="flex flex-1 items-center justify-center px-6 text-center">
          <div>
            <Bot className="mx-auto h-8 w-8 text-brand" />
            <div className="mt-3 text-[15px] font-semibold text-ink-900">
              Pick a thread to see the AI&apos;s work
            </div>
            <div className="mt-1 text-[12px] text-ink-500">
              Auto-bookings, escalations, and live conversations all land here.
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
