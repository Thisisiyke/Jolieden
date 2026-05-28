"use client";

import Link from "next/link";
import { ArrowLeft, Bot, Sparkles, Clock, TrendingUp, MessageCircle } from "lucide-react";
import { ESCALATIONS, reasonLabel } from "@/lib/aiInbox";

// AI Conversation Analytics — operator-side dashboard showing how the AI
// Concierge is performing this week. Mock numbers + a real escalation
// breakdown computed from the seeded ESCALATIONS data.

const WEEK_METRICS = {
  totalThreads: 487,
  aiResolved: 451,
  escalated: 36,
  avgResponseSec: 8,
  avgClientWait: 2,
  bookingsViaAi: 88,
  faqViaAi: 122,
};

function Metric({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: typeof Bot;
}) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4">
      <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-500">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="mt-1 font-serif text-2xl font-semibold text-brand tabular-nums">{value}</div>
      {hint && <div className="mt-0.5 font-mono text-[10px] text-ink-500">{hint}</div>}
    </div>
  );
}

export default function AiAnalyticsPage() {
  const reasonCounts = ESCALATIONS.reduce<Record<string, number>>((acc, e) => {
    acc[e.reason] = (acc[e.reason] || 0) + 1;
    return acc;
  }, {});
  const reasonRows = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]);
  const resolveRate = Math.round((WEEK_METRICS.aiResolved / WEEK_METRICS.totalThreads) * 100);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <Link href="/messages" className="-ml-2 inline-flex items-center gap-1 text-sm text-ink-500 hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Messages
      </Link>
      <header className="mt-3">
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-brand">
          <Bot className="h-3 w-3" /> AI Concierge analytics · last 7 days
        </div>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-brand">
          How the AI handled this week
        </h1>
        <p className="mt-1 text-sm text-ink-700">
          {WEEK_METRICS.aiResolved} of {WEEK_METRICS.totalThreads} threads resolved without staff touching them.
        </p>
      </header>

      {/* Top metrics */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Threads" value={WEEK_METRICS.totalThreads} hint="All inbound SMS" icon={MessageCircle} />
        <Metric label="AI resolved" value={`${resolveRate}%`} hint={`${WEEK_METRICS.aiResolved} threads`} icon={Sparkles} />
        <Metric label="Escalated" value={WEEK_METRICS.escalated} hint="Routed to a stylist" icon={Bot} />
        <Metric label="Avg response" value={`${WEEK_METRICS.avgResponseSec}s`} hint="AI first message" icon={Clock} />
      </section>

      <section className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Metric label="Bookings via AI" value={WEEK_METRICS.bookingsViaAi} hint="Without staff hands-on" icon={TrendingUp} />
        <Metric label="FAQ answered" value={WEEK_METRICS.faqViaAi} hint="Policies, prep, hours" icon={Bot} />
        <Metric label="Client wait" value={`${WEEK_METRICS.avgClientWait}m`} hint="To full resolution" icon={Clock} />
      </section>

      {/* Escalation breakdown */}
      <section className="mt-8">
        <h2 className="font-serif text-xl font-semibold text-ink-900">Why threads escalate</h2>
        <p className="mt-1 text-sm text-ink-500">
          Top reasons the AI hands off to a human. Helps tune the knowledge base.
        </p>
        <ul className="mt-3 space-y-2">
          {reasonRows.map(([reason, count]) => {
            const pct = Math.round((count / WEEK_METRICS.escalated) * 100);
            return (
              <li key={reason} className="rounded-xl border border-ink-200 bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-ink-900">
                    {reasonLabel(reason as "policy_question")}
                  </span>
                  <span className="font-mono text-xs text-ink-500">
                    {count} this week · {pct}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-paper">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${Math.max(8, pct)}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Suggested actions */}
      <section className="mt-8 rounded-2xl border border-ink-200 bg-paper p-5">
        <div className="font-mono text-[10px] uppercase tracking-wider text-brand">
          💡 Suggested actions
        </div>
        <ul className="mt-2 space-y-1.5 text-sm text-ink-700">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 inline-block h-1 w-1 rounded-full bg-brand" />
            Add a "box dye + balayage compatibility" article to the AI knowledge base — 3 escalations this week.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 inline-block h-1 w-1 rounded-full bg-brand" />
            Publish updated Saturday hours to reduce after-hours scheduling escalations.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 inline-block h-1 w-1 rounded-full bg-brand" />
            Train the AI on lost-and-found protocol — 2 lost-item threads this week.
          </li>
        </ul>
      </section>
    </div>
  );
}
