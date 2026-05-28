import { notFound } from "next/navigation";
import { Users, Copy, MessageCircle, Mail, Share2, Check } from "lucide-react";
import { resolveClient } from "@/lib/personas";

function referralsFor(slug: string): {
  earned: number;
  pending: number;
  history: { id: string; name: string; date: string; status: "earned" | "pending"; amount: number }[];
} {
  if (slug === "aaliyah-j")
    return {
      earned: 300,
      pending: 100,
      history: [
        { id: "r1", name: "Janelle F.", date: "2026-02-10", status: "earned", amount: 100 },
        { id: "r2", name: "Mekka J.", date: "2025-12-04", status: "earned", amount: 100 },
        { id: "r3", name: "Chanel M.", date: "2025-10-20", status: "earned", amount: 100 },
        { id: "r4", name: "Tia (invited 3d ago)", date: "2026-04-11", status: "pending", amount: 100 },
      ],
    };
  return { earned: 0, pending: 0, history: [] };
}

export default async function ReferralsPage({
  params,
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;
  const client = resolveClient(clientSlug);
  if (!client) notFound();

  const code = `JBB-${client.firstName.toUpperCase()}${client.lastName[0].toUpperCase()}`;
  const link = `joliedensbeautybar.com/?ref=${code}`;
  const { earned, pending, history } = referralsFor(clientSlug);

  return (
    <div className="space-y-5 px-4 py-5">
      <header>
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-brand">
          <Users className="h-3 w-3" /> 🤝 Refer a friend
        </div>
        <h1 className="mt-1 font-serif text-[28px] font-semibold leading-tight text-ink-900">
          Bring a friend, both win
        </h1>
        <p className="mt-1 text-xs text-ink-500">
          You both get <strong className="text-brand">100 points</strong> when they finish their
          first visit.
        </p>
      </header>

      {/* Hero — code + share */}
      <section className="overflow-hidden rounded-2xl border border-brand/30 bg-gradient-to-br from-brand-50 via-paper to-paper p-5">
        <div className="font-mono text-[10px] uppercase tracking-wider text-brand">Your referral code</div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <code className="font-mono text-2xl font-semibold tracking-wider text-ink-900">{code}</code>
          <button
            type="button"
            className="flex items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
          >
            <Copy className="h-3.5 w-3.5" /> Copy code
          </button>
        </div>
        <div className="mt-3 rounded-md border border-ink-200 bg-white px-3 py-2 font-mono text-[10px] text-ink-700 break-all">
          {link}
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-ink-200 bg-white px-3 py-2 text-xs font-medium text-ink-900 hover:border-brand"
          >
            <MessageCircle className="h-3.5 w-3.5" /> SMS
          </button>
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-ink-200 bg-white px-3 py-2 text-xs font-medium text-ink-900 hover:border-brand"
          >
            <Mail className="h-3.5 w-3.5" /> Email
          </button>
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-ink-200 bg-white px-3 py-2 text-xs font-medium text-ink-900 hover:border-brand"
          >
            <Share2 className="h-3.5 w-3.5" /> Share
          </button>
        </div>
      </section>

      {/* Counters */}
      <section className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-ink-200 bg-white p-3">
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">Earned</div>
          <div className="mt-1 font-serif text-xl font-semibold text-brand tabular-nums">
            {earned} <span className="text-xs text-ink-500">pts</span>
          </div>
        </div>
        <div className="rounded-xl border border-ink-200 bg-white p-3">
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">Pending</div>
          <div className="mt-1 font-serif text-xl font-semibold text-ink-700 tabular-nums">
            {pending} <span className="text-xs text-ink-500">pts</span>
          </div>
        </div>
      </section>

      {/* History */}
      <section>
        <h2 className="px-1 pb-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-500">
          Your referrals
        </h2>
        {history.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink-300 bg-white p-6 text-center">
            <Users className="mx-auto h-6 w-6 text-ink-400" />
            <p className="mt-2 text-sm text-ink-900">No referrals yet</p>
            <p className="mt-1 text-xs text-ink-500">
              Share your code above — points drop after their first visit.
            </p>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-xl border border-ink-200 bg-white">
            {history.map((h) => (
              <li
                key={h.id}
                className="flex items-center justify-between gap-2 border-b border-ink-200 px-4 py-2.5 last:border-b-0"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm text-ink-900">{h.name}</div>
                  <div className="font-mono text-[10px] text-ink-500">{h.date}</div>
                </div>
                <div className="flex items-center gap-2">
                  {h.status === "earned" ? (
                    <span className="flex items-center gap-1 rounded-full bg-status-confirmed/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-status-confirmed">
                      <Check className="h-3 w-3" /> Earned
                    </span>
                  ) : (
                    <span className="rounded-full bg-status-pending/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-status-pending">
                      Pending
                    </span>
                  )}
                  <span className="font-mono text-sm font-semibold text-brand tabular-nums">
                    +{h.amount}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
