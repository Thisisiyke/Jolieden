import { notFound } from "next/navigation";
import { Wallet, Info } from "lucide-react";
import { resolveClient } from "@/lib/personas";

function creditFor(slug: string): {
  balance: number;
  sources: { id: string; date: string; label: string; amount: number }[];
} {
  if (slug === "aaliyah-j")
    return {
      balance: 30,
      sources: [
        { id: "c1", date: "2026-02-10", label: "Referral bonus · Janelle Ford", amount: 25 },
        { id: "c2", date: "2025-11-15", label: "Service adjustment · misordered hair", amount: 25 },
        { id: "c3", date: "2026-01-04", label: "Applied to Wash & Style", amount: -20 },
      ],
    };
  if (slug === "imani-w")
    return {
      balance: 10,
      sources: [{ id: "c1", date: "2026-03-30", label: "Welcome credit · new client", amount: 10 }],
    };
  return { balance: 0, sources: [] };
}

export default async function CreditPage({
  params,
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;
  const client = resolveClient(clientSlug);
  if (!client) notFound();

  const { balance, sources } = creditFor(clientSlug);

  return (
    <div className="space-y-5 px-4 py-5">
      <header>
        <h1 className="font-serif text-[28px] font-semibold leading-tight text-ink-900">
          Account credit
        </h1>
        <p className="mt-1 text-xs text-ink-500">
          Salon credit applies before card on file at checkout.
        </p>
      </header>

      <section className="overflow-hidden rounded-2xl border border-ink-200 bg-gradient-to-br from-brand-50 via-paper to-paper p-5">
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-brand">
          <Wallet className="h-3 w-3" /> Available
        </div>
        <div className="mt-2 font-serif text-4xl font-semibold text-brand tabular-nums">
          ${balance}
        </div>
        <p className="mt-2 text-xs text-ink-700">
          {balance > 0
            ? "Auto-applies at your next checkout."
            : "You'll see credits here if a service adjustment or referral bonus is added to your account."}
        </p>
      </section>

      <section>
        <h2 className="px-1 pb-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-500">
          Activity
        </h2>
        {sources.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink-300 bg-white p-4 text-center text-xs text-ink-500">
            No credits yet.
          </div>
        ) : (
          <ul className="overflow-hidden rounded-xl border border-ink-200 bg-white">
            {sources.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between border-b border-ink-200 px-4 py-2.5 last:border-b-0"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm text-ink-900">{s.label}</div>
                  <div className="font-mono text-[10px] text-ink-500">{s.date}</div>
                </div>
                <span
                  className={
                    "font-mono text-sm font-semibold tabular-nums " +
                    (s.amount >= 0 ? "text-status-confirmed" : "text-brand")
                  }
                >
                  {s.amount >= 0 ? "+" : ""}${Math.abs(s.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex items-start gap-2 rounded-xl border border-ink-200 bg-paper p-4 text-xs text-ink-700">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
        Credits never expire and never roll over to anyone else. Stylists can&apos;t apply them — they
        come from front desk only.
      </section>
    </div>
  );
}
