import { notFound } from "next/navigation";
import Link from "next/link";
import { Crown, Check, Calendar, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { resolveClient } from "@/lib/personas";
import { TIERS, tierFor, pointsFor, nextTierFor, type RewardTier } from "@/lib/rewards";

const TIER_BG: Record<RewardTier, string> = {
  Bronze: "from-[#a67c52] to-[#8a5a2e]",
  Silver: "from-[#c0c0c0] to-[#888]",
  Gold: "from-gold to-[#a17a3a]",
  Platinum: "from-brand to-gold",
};

export default async function MembershipPage({
  params,
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;
  const client = resolveClient(clientSlug);
  if (!client) notFound();

  const tier = tierFor(client);
  const points = pointsFor(client);
  const next = nextTierFor(client);
  const tierData = TIERS.find((t) => t.id === tier)!;

  return (
    <div className="space-y-5 px-4 py-5">
      <header>
        <h1 className="font-serif text-[28px] font-semibold leading-tight text-ink-900">
          Membership
        </h1>
        <p className="mt-1 text-xs text-ink-500">
          Tiers are based on your lifetime spend at Jolieden. They never expire.
        </p>
      </header>

      {/* Hero tier card */}
      <section className={clsx("overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white", TIER_BG[tier])}>
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-white/80">
          <Crown className="h-3 w-3" /> {client.firstName}&apos;s tier
        </div>
        <h2 className="mt-2 font-serif text-3xl font-semibold">{tier}</h2>
        <p className="mt-2 text-sm text-white/90">{points.toLocaleString("en-US")} lifetime points</p>
        {next && (
          <div className="mt-4 flex items-center justify-between rounded-md bg-black/15 px-3 py-2 text-xs">
            <span>
              <strong>{next.pointsToGo} pts</strong> to {next.tier}
            </span>
            <Link
              href={`/me/${client.slug}/rewards`}
              className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider hover:bg-white/30"
            >
              How to earn
            </Link>
          </div>
        )}
      </section>

      {/* Tier ladder */}
      <section>
        <h2 className="px-1 pb-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-500">
          What every tier unlocks
        </h2>
        <ul className="space-y-2">
          {TIERS.map((t) => {
            const isCurrent = t.id === tier;
            const isLocked = points < t.min;
            return (
              <li
                key={t.id}
                className={clsx(
                  "rounded-xl border bg-white p-4",
                  isCurrent ? "border-brand bg-brand-50" : "border-ink-200",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={clsx(
                        "inline-block h-3 w-3 rounded-full",
                        isLocked ? "bg-ink-200" : t.id === "Bronze" ? "bg-[#a67c52]" : t.id === "Silver" ? "bg-[#c0c0c0]" : t.id === "Gold" ? "bg-gold" : "bg-gradient-to-br from-brand to-gold",
                      )}
                    />
                    <span className="text-sm font-semibold text-ink-900">{t.id}</span>
                    {isCurrent && (
                      <span className="rounded-full bg-brand px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white">
                        Current
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
                    {t.min} pts
                  </span>
                </div>
                <ul className="mt-2 space-y-1 text-xs text-ink-700">
                  {t.perks.map((p, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <Check className={clsx("mt-0.5 h-3 w-3 shrink-0", isLocked ? "text-ink-300" : "text-status-confirmed")} />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-xl border border-ink-200 bg-white p-4">
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-500">
          <Calendar className="h-3 w-3" /> Lifetime since
        </div>
        <p className="mt-1 text-sm text-ink-900">
          {client.lastVisit ? new Date(client.lastVisit).getFullYear() : new Date().getFullYear()}
        </p>
      </section>

      {tierData.perks.length > 0 && (
        <Link
          href={`/me/${client.slug}/rewards`}
          className="flex items-center justify-between rounded-xl border border-brand/30 bg-white p-4 hover:border-brand"
        >
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-brand">Use your points</div>
            <div className="text-sm font-medium text-ink-900">Redeem rewards →</div>
          </div>
          <ChevronRight className="h-4 w-4 text-ink-300" />
        </Link>
      )}
    </div>
  );
}
