// Rewards helpers — points are derived from Client.totalSpend (1 point per $1
// spent). Tier ladder maps to the existing Client.membership field so the
// labels stay consistent across operator + client surfaces.

import type { Client } from "@/lib/data";

export type RewardTier = "Bronze" | "Silver" | "Gold" | "Platinum";

export const TIERS: { id: RewardTier; min: number; perks: string[] }[] = [
  { id: "Bronze", min: 0, perks: ["Birthday greeting"] },
  {
    id: "Silver",
    min: 500,
    perks: ["Birthday greeting", "Early access to new looks", "5% off retail"],
  },
  {
    id: "Gold",
    min: 1500,
    perks: [
      "Everything in Silver",
      "Comp Wash & Blow on birthday week",
      "Priority booking slots",
    ],
  },
  {
    id: "Platinum",
    min: 3000,
    perks: [
      "Everything in Gold",
      "VIP no-wait check-in",
      "Quarterly bonus 500 points",
      "Hand-written birthday card from Diéssou",
    ],
  },
];

export const pointsFor = (client: Client): number => Math.round(client.totalSpend);

export const tierFor = (client: Client): RewardTier => {
  // Honor explicit membership when set; otherwise compute from points.
  if (client.membership && client.membership !== "None") return client.membership;
  const pts = pointsFor(client);
  let current: RewardTier = "Bronze";
  for (const t of TIERS) {
    if (pts >= t.min) current = t.id;
  }
  return current;
};

export const nextTierFor = (
  client: Client,
): { tier: RewardTier; min: number; pointsToGo: number } | null => {
  const current = tierFor(client);
  const idx = TIERS.findIndex((t) => t.id === current);
  if (idx === -1 || idx === TIERS.length - 1) return null;
  const next = TIERS[idx + 1];
  return {
    tier: next.id,
    min: next.min,
    pointsToGo: Math.max(0, next.min - pointsFor(client)),
  };
};

export type Redemption = {
  id: string;
  label: string;
  cost: number;
  description?: string;
};

export const REDEMPTIONS: Redemption[] = [
  { id: "wash-blow-comp", label: "Comp Wash & Blow", cost: 300, description: "Free add-on on your next visit." },
  { id: "discount-25", label: "$25 off any service", cost: 500 },
  { id: "deep-condition", label: "Comp deep condition", cost: 400 },
  { id: "discount-75", label: "$75 off any service", cost: 1200 },
  { id: "boho-upgrade", label: "Free boho-ends upgrade", cost: 600, description: "Add boho curl finish to braids at no charge." },
];

export type RewardActivity = {
  id: string;
  date: string;
  label: string;
  delta: number; // + earned, - redeemed
};

// Build a synthetic activity log per client — mostly "earned" entries derived
// from their visits with one or two redemptions sprinkled in for hot personas.
export function activityFor(client: Client): RewardActivity[] {
  const out: RewardActivity[] = [];
  if (client.lastVisit) {
    out.push({
      id: "act-1",
      date: client.lastVisit,
      label: "Earned · last visit",
      delta: Math.round((client.totalSpend / Math.max(1, client.visits)) || 50),
    });
  }
  if (client.visits >= 3) {
    out.push({
      id: "act-2",
      date: "2026-02-10",
      label: "Redeemed · Comp Wash & Blow",
      delta: -300,
    });
  }
  if (client.visits >= 5) {
    out.push({
      id: "act-3",
      date: "2025-12-15",
      label: "Earned · visit + add-on",
      delta: 220,
    });
  }
  if (client.visits >= 7) {
    out.push({
      id: "act-4",
      date: "2025-11-02",
      label: "Bonus · referral credit",
      delta: 100,
    });
  }
  return out;
}
