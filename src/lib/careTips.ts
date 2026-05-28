// Personalized care follow-ups. Keyed by service category — derived from the
// client's last completed appointment. Used by /me home to render a tip
// card that matches what they actually got done.

import type { CategorySlug } from "@/lib/catalog";

export type CareTip = {
  headline: string;
  body: string;
  product?: { name: string; price: number };
};

export const CARE_TIPS: Record<CategorySlug, CareTip[]> = {
  braids: [
    {
      headline: "Wrap up at night 💜",
      body: "Sleep on a silk pillowcase or wrap with a silk bonnet to keep edges smooth and extend the look 1–2 weeks.",
      product: { name: "Boho silk bonnet", price: 18 },
    },
    {
      headline: "Edge oil after 48 hours",
      body: "Wait 2 days for the parts to settle. Then apply a light edge oil daily to prevent itching and breakage.",
      product: { name: "Jolieden scalp oil", price: 24 },
    },
    {
      headline: "Mist + refresh weekly",
      body: "A weekly rosewater mist keeps your scalp comfortable and your braids smelling fresh between visits.",
    },
  ],
  weaves: [
    {
      headline: "Wrap the leave-out",
      body: "Wrap leave-out hair around the install at night to keep it from blending or matting into the weave.",
    },
    {
      headline: "Dry the tracks",
      body: "Always blow-dry the tracks fully after washing — moisture trapped at the seam causes odor and slippage.",
    },
  ],
  "silk-press": [
    {
      headline: "Wrap, don't braid",
      body: "Wrap your hair at night with a silk scarf. Braiding overnight will lose the silky finish.",
      product: { name: "Silk wrap scarf", price: 22 },
    },
    {
      headline: "Avoid humidity",
      body: "Skip the gym for 3 days post-press. If you must, wear a sweatband to keep your edges dry.",
    },
    {
      headline: "Wash day in 2–3 weeks",
      body: "To preserve the press, plan your next wash 14–21 days out. Use a clarifying shampoo when you do.",
    },
  ],
  natural: [
    {
      headline: "Pineapple at night 🍍",
      body: "Loosely gather curls at the very top of your head and secure with a satin scrunchie. Saves the curl pattern.",
    },
    {
      headline: "Refresh with water + leave-in",
      body: "Don't over-product — a 50/50 water + leave-in mix in a spray bottle is your best friend.",
    },
  ],
  color: [
    {
      headline: "Sulfate-free only",
      body: "Sulfates strip color fast. Switch to a sulfate-free wash routine to keep tone vibrant 6+ weeks.",
      product: { name: "Color-safe shampoo", price: 32 },
    },
    {
      headline: "Cold water rinse",
      body: "Finish washes with the coldest water you can stand. Seals the cuticle and locks in shine.",
    },
    {
      headline: "Gloss every 6 weeks",
      body: "Book a color refresh / gloss in 6 weeks to re-tone and re-shine without redoing the lift.",
    },
  ],
  cuts: [
    {
      headline: "First wash in 48 hours",
      body: "Give your scalp a day or two to settle before the first wash. Skip heavy products in the meantime.",
    },
    {
      headline: "Trim cycle every 6–8 weeks",
      body: "Maintains the shape and prevents split ends from traveling up the strand.",
    },
  ],
  treatments: [
    {
      headline: "Wait before next wash",
      body: "Give the treatment 24–48 hours to absorb fully before your first wash.",
    },
    {
      headline: "Heat protectant always",
      body: "If you heat-style, always use a thermal protectant — extends the treatment's effect.",
    },
  ],
};

// Map a service name (free-text) back to a category slug so we can pick a
// matching tip. Falls back to braids since that's the salon's headline.
export function categoryFromService(serviceName?: string): CategorySlug {
  if (!serviceName) return "braids";
  const s = serviceName.toLowerCase();
  if (s.includes("silk press") || s.includes("blow") || s.includes("press")) return "silk-press";
  if (s.includes("color") || s.includes("balayage") || s.includes("highlight") || s.includes("gloss"))
    return "color";
  if (s.includes("weave") || s.includes("extension") || s.includes("install")) return "weaves";
  if (s.includes("cut") || s.includes("trim") || s.includes("shape")) return "cuts";
  if (s.includes("treatment") || s.includes("condition") || s.includes("repair")) return "treatments";
  if (s.includes("natural") || s.includes("curl") || s.includes("twist")) return "natural";
  return "braids";
}

export function tipForService(
  serviceName?: string,
  daysSince = 0,
): { tip: CareTip; category: CategorySlug } {
  const category = categoryFromService(serviceName);
  const tips = CARE_TIPS[category];
  // Rotate through tips based on days-since so a client doesn't see the same
  // one forever. Returns the first tip on day 0.
  const idx = Math.min(tips.length - 1, Math.floor(daysSince / 3));
  return { tip: tips[idx] || tips[0], category };
}
