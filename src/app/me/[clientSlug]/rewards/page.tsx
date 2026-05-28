import { notFound } from "next/navigation";
import { Sparkles, Star, TrendingUp, History } from "lucide-react";
import clsx from "clsx";
import { resolveClient } from "@/lib/personas";
import RedemptionsList from "@/components/me/RedemptionsList";
import BackArrow from "@/components/me/BackArrow";
import {
  TIERS,
  pointsFor,
  tierFor,
  nextTierFor,
  REDEMPTIONS,
  activityFor,
  type RewardTier,
} from "@/lib/rewards";

const TIER_DOT: Record<RewardTier, string> = {
  Bronze: "bg-[#a67c52]",
  Silver: "bg-[#c0c0c0]",
  Gold: "bg-gold",
  Platinum: "bg-gradient-to-br from-brand to-gold",
};

function TierPill({ tier, active }: { tier: RewardTier; active: boolean }) {
  return (
    <div
      className={clsx(
        "flex flex-1 flex-col items-center gap-1 rounded-lg border px-2 py-3 text-center transition-colors",
        active ? "border-brand bg-brand-50" : "border-ink-200 bg-white",
      )}
    >
      <span className={clsx("h-3 w-3 rounded-full", TIER_DOT[tier])} />
      <span
        className={clsx(
          "font-mono text-[10px] uppercase tracking-wider",
          active ? "text-brand" : "text-ink-500",
        )}
      >
        {tier}
      </span>
    </div>
  );
}

export default async function RewardsPage({
  params,
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;
  const client = resolveClient(clientSlug);
  if (!client) notFound();

  const points = pointsFor(client);
  const tier = tierFor(client);
  const next = nextTierFor(client);
  const activity = activityFor(client);
  const progress = next
    ? Math.min(100, Math.max(5, Math.round(((next.min - next.pointsToGo) / next.min) * 100)))
    : 100;

  return (
    <div className="space-y-5 px-4 py-5">
      <header>
        <BackArrow clientSlug={clientSlug} />
        <h1 className="mt-2 font-serif text-[28px] font-semibold leading-tight text-ink-900">
          Rewards
        </h1>
        <p className="mt-1 text-xs text-ink-500">
          1 point earned for every $1 spent. Redeem any time at checkout.
        </p>
      </header>

      {/* Hero — points + tier */}
      <section className="relative overflow-hidden rounded-2xl border border-brand/30 bg-gradient-to-br from-brand via-brand-700 to-[#2a0e16] p-5 text-white">
        <div className="font-mono text-[10px] uppercase tracking-wider text-white/70">
          {tier} member
        </div>
        <div className="mt-1 flex items-end gap-2">
          <span className="font-serif text-4xl font-semibold tabular-nums">
            {points.toLocaleString("en-US")}
          </span>
          <span className="pb-1 font-mono text-[11px] uppercase tracking-wider text-white/70">
            points
          </span>
        </div>
        {next ? (
          <div className="mt-5">
            <div className="flex items-center justify-between text-[11px] text-white/80">
              <span>
                {next.pointsToGo} points to <strong className="text-white">{next.tier}</strong>
              </span>
              <span className="font-mono">{progress}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-gold" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-white/90">
            You&apos;re at the top of the ladder — Diéssou&apos;s personal client. ✨
          </p>
        )}
        <Sparkles className="pointer-events-none absolute right-4 top-4 h-5 w-5 text-gold/60" />
      </section>

      {/* Tier ladder */}
      <section>
        <h2 className="px-1 pb-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-500">
          Tier ladder
        </h2>
        <div className="flex gap-2">
          {TIERS.map((t) => (
            <TierPill key={t.id} tier={t.id} active={t.id === tier} />
          ))}
        </div>
        <div className="mt-3 rounded-xl border border-ink-200 bg-white p-4">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-brand">
            <Star className="h-3 w-3" /> Your {tier} perks
          </div>
          <ul className="mt-2 space-y-1.5 text-sm text-ink-700">
            {TIERS.find((t) => t.id === tier)?.perks.map((p, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 inline-block h-1 w-1 rounded-full bg-brand" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Redemptions */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="px-1 font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Redeem your points
          </h2>
          <span className="font-mono text-[10px] text-ink-500">
            you have {points.toLocaleString("en-US")} pts
          </span>
        </div>
        <RedemptionsList redemptions={REDEMPTIONS} points={points} />
      </section>

      {/* Activity */}
      <section>
        <h2 className="flex items-center gap-1.5 px-1 pb-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-500">
          <History className="h-3 w-3" /> Recent activity
        </h2>
        {activity.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink-300 bg-white p-4 text-center text-xs text-ink-500">
            Your point activity will show here after your first visit.
          </div>
        ) : (
          <ul className="overflow-hidden rounded-xl border border-ink-200 bg-white">
            {activity.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 border-b border-ink-200 px-4 py-2.5 last:border-b-0"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm text-ink-900">{a.label}</div>
                  <div className="font-mono text-[10px] text-ink-500">{a.date}</div>
                </div>
                <span
                  className={clsx(
                    "font-mono text-sm font-semibold tabular-nums",
                    a.delta >= 0 ? "text-status-confirmed" : "text-brand",
                  )}
                >
                  {a.delta >= 0 ? "+" : ""}
                  {a.delta}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-ink-200 bg-paper p-4">
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-brand">
          <TrendingUp className="h-3 w-3" /> Earn more, faster
        </div>
        <p className="mt-1 text-sm text-ink-700">
          Refer a friend — you both get <strong className="text-brand">100 points</strong> when they
          finish their first visit.
        </p>
      </section>
    </div>
  );
}
