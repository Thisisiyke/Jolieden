import { notFound } from "next/navigation";
import { Gift, Plus, Copy, ChevronRight } from "lucide-react";
import { resolveClient } from "@/lib/personas";
import BackArrow from "@/components/me/BackArrow";

// Mock gift card data — picked per-persona so the screen reads as lived-in.
function balanceFor(slug: string): number {
  if (slug === "aaliyah-j") return 75;
  if (slug === "naomi-b") return 50;
  return 0;
}

function historyFor(slug: string): { id: string; date: string; label: string; amount: number }[] {
  if (slug === "aaliyah-j")
    return [
      { id: "g1", date: "2026-02-14", label: "Received from Janelle F.", amount: 50 },
      { id: "g2", date: "2025-12-25", label: "Holiday gift · self-purchase", amount: 100 },
      { id: "g3", date: "2025-12-25", label: "Redeemed against Knotless Braids", amount: -75 },
    ];
  if (slug === "naomi-b")
    return [{ id: "g1", date: "2026-04-11", label: "Birthday gift · received from Diéssou", amount: 50 }];
  return [];
}

export default async function GiftCardsPage({
  params,
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;
  const client = resolveClient(clientSlug);
  if (!client) notFound();

  const balance = balanceFor(clientSlug);
  const history = historyFor(clientSlug);
  const code = `JBB-${clientSlug.toUpperCase().replace(/-/g, "")}-${(client.id || "0").slice(-3)}`;

  return (
    <div className="space-y-5 px-4 py-5">
      <header>
        <BackArrow clientSlug={clientSlug} />
        <h1 className="mt-2 font-serif text-[28px] font-semibold leading-tight text-ink-900">Gift cards</h1>
        <p className="mt-1 text-xs text-ink-500">
          Balance, redemption code, and recent activity. Apply at checkout or in person.
        </p>
      </header>

      {/* Hero balance */}
      <section className="overflow-hidden rounded-2xl border border-ink-200 bg-gradient-to-br from-gold-soft via-paper to-brand-50 p-5">
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-brand">
          <Gift className="h-3 w-3" /> 🎁 Available balance
        </div>
        <div className="mt-2 font-serif text-4xl font-semibold text-brand tabular-nums">
          ${balance}
        </div>
        <p className="mt-2 text-xs text-ink-700">
          Auto-applies to your next checkout. You can also redeem in-store.
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
          >
            <Plus className="h-3.5 w-3.5" /> Buy a gift card
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full border border-brand bg-white px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand hover:text-white"
          >
            Redeem a code
          </button>
        </div>
      </section>

      {/* Your code */}
      <section className="rounded-2xl border border-ink-200 bg-white p-4">
        <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
          Your redemption code
        </div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <code className="font-mono text-base font-semibold text-ink-900 tracking-wider">{code}</code>
          <button
            type="button"
            className="flex items-center gap-1 rounded-full border border-ink-200 px-2.5 py-1 text-xs text-ink-700 hover:border-brand"
          >
            <Copy className="h-3 w-3" /> Copy
          </button>
        </div>
      </section>

      {/* Activity */}
      <section>
        <h2 className="px-1 pb-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-500">
          Recent activity
        </h2>
        {history.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink-300 bg-white p-4 text-center text-xs text-ink-500">
            No gift card activity yet.
          </div>
        ) : (
          <ul className="overflow-hidden rounded-xl border border-ink-200 bg-white">
            {history.map((h) => (
              <li
                key={h.id}
                className="flex items-center justify-between border-b border-ink-200 px-4 py-2.5 last:border-b-0"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm text-ink-900">{h.label}</div>
                  <div className="font-mono text-[10px] text-ink-500">{h.date}</div>
                </div>
                <span
                  className={
                    "font-mono text-sm font-semibold tabular-nums " +
                    (h.amount >= 0 ? "text-status-confirmed" : "text-brand")
                  }
                >
                  {h.amount >= 0 ? "+" : ""}${Math.abs(h.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-ink-200 bg-paper p-4">
        <div className="font-mono text-[10px] uppercase tracking-wider text-brand">
          💡 Gift the experience
        </div>
        <p className="mt-1 text-sm text-ink-700">
          Send a gift card by SMS — they get a code in seconds and you choose any amount $25+.
        </p>
        <button
          type="button"
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
        >
          Send a gift card <ChevronRight className="h-3 w-3" />
        </button>
      </section>
    </div>
  );
}
