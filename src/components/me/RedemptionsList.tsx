"use client";

// Client-side redemption list. Each row is a button; tapping it
// "claims" the redemption (prototype: just shows a confirmation toast +
// disables the row). Production wires this to a redeem RPC that
// decrements the points ledger and surfaces a credit at checkout.

import { useState } from "react";
import clsx from "clsx";
import { Gift, Check } from "lucide-react";
import type { Redemption } from "@/lib/rewards";

type Props = {
  redemptions: Redemption[];
  points: number;
};

export default function RedemptionsList({ redemptions, points }: Props) {
  const [claimedIds, setClaimedIds] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const claim = (r: Redemption) => {
    if (points < r.cost || claimedIds.includes(r.id)) return;
    setClaimedIds((p) => [...p, r.id]);
    setToast(`Claimed: ${r.label} — applied to your next visit.`);
    window.setTimeout(() => setToast(null), 3000);
  };

  return (
    <>
      <ul className="space-y-2">
        {redemptions.map((r) => {
          const claimed = claimedIds.includes(r.id);
          const canAfford = points >= r.cost;
          return (
            <li
              key={r.id}
              className={clsx(
                "flex items-center gap-3 rounded-xl border p-3",
                claimed
                  ? "border-status-confirmed/40 bg-status-confirmed/5"
                  : canAfford
                    ? "border-ink-200 bg-white"
                    : "border-ink-200 bg-paper opacity-70",
              )}
            >
              <div
                className={clsx(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  claimed
                    ? "bg-status-confirmed/15 text-status-confirmed"
                    : canAfford
                      ? "bg-brand/10 text-brand"
                      : "bg-ink-100 text-ink-400",
                )}
              >
                {claimed ? <Check className="h-4 w-4" /> : <Gift className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-ink-900">{r.label}</div>
                {r.description && (
                  <div className="text-xs text-ink-500">{r.description}</div>
                )}
              </div>
              {claimed ? (
                <span className="shrink-0 rounded-full bg-status-confirmed px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-white">
                  Claimed
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => claim(r)}
                  disabled={!canAfford}
                  className={clsx(
                    "shrink-0 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors",
                    canAfford
                      ? "bg-brand text-white hover:bg-brand-700"
                      : "bg-ink-100 text-ink-500",
                  )}
                >
                  {r.cost} pts
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {/* Toast — absolute-positioned to stay within the iPhone frame */}
      {toast && (
        <div className="pointer-events-none fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-status-confirmed px-4 py-2 text-xs font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}
