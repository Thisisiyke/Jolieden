// Service catalog — drives the photo-first booking flow at /book.
// Shape mirrors the Boulevard widget's option structure (length, parting, color,
// ends, add-ons) so any service the salon currently offers can be modeled.

export type ModifierKind =
  | "length"
  | "parting"
  | "color"
  | "ends"
  | "size"
  | "wash"
  | "treatment"
  | "finish";

export type ModifierOption = {
  id: string;
  label: string;
  deltaPrice?: number;
  deltaDurationMin?: number;
  swatch?: string; // hex (for color modifiers)
  photo?: string;
  description?: string;
};

export type Modifier = {
  id: string;
  kind: ModifierKind;
  label: string;
  required?: boolean;
  multi?: boolean;
  options: ModifierOption[];
};

export type AddOn = {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationMin: number;
};

export type CategorySlug =
  | "braids"
  | "weaves"
  | "silk-press"
  | "natural"
  | "color"
  | "cuts"
  | "treatments";

export type ServiceCategory = {
  slug: CategorySlug;
  name: string;
  tagline: string;
  heroPhoto?: string;
  // Modifiers shared by every service in this category.
  // A service can override or augment with its own modifiers.
  baseModifiers?: string[]; // modifier ids defined in this file
};

export type CatalogService = {
  id: string;
  slug: string;
  categorySlug: CategorySlug;
  name: string;
  description?: string;
  basePrice: number;
  baseDurationMin: number;
  heroPhoto?: string;
  modifiers?: Modifier[]; // service-specific (replaces base if same kind)
  addOns?: AddOn[]; // service-specific add-ons (e.g. ACV wash for braids)
  popular?: boolean;
};

// ───────────────────── shared modifier libraries ─────────────────────

export const BRAID_LENGTHS: ModifierOption[] = [
  { id: "bob", label: "Bob", deltaPrice: 0 },
  { id: "mid-back", label: "Mid-Back", deltaPrice: 0 },
  { id: "waist", label: "Waist", deltaPrice: 15, deltaDurationMin: 30 },
  { id: "butt", label: "Butt", deltaPrice: 50, deltaDurationMin: 60 },
  { id: "thigh", label: "Thigh", deltaPrice: 85, deltaDurationMin: 90 },
];

export const PARTING_STYLES: ModifierOption[] = [
  { id: "standard-box", label: "Standard boxed", description: "Classic clean parts." },
  { id: "free-part", label: "Free part", deltaPrice: 20, description: "Less appearance of the scalp." },
  { id: "triangle", label: "Triangle parts", deltaPrice: 25, description: "Modern triangle parting." },
];

export const ENDS_STYLES: ModifierOption[] = [
  { id: "straight", label: "Straight" },
  { id: "wavy", label: "Wavy" },
  { id: "curly", label: "Curly", description: "Set with flexi-rods." },
  { id: "boho", label: "Boho ends", deltaPrice: 30, description: "Human-hair curls added to the ends." },
];

export const HAIR_COLORS: ModifierOption[] = [
  { id: "1b", label: "1B — Natural black", swatch: "#16110f" },
  { id: "1", label: "1 — Jet black", swatch: "#000000" },
  { id: "2", label: "2 — Dark brown", swatch: "#2a1810" },
  { id: "4", label: "4 — Medium brown", swatch: "#4a2f1d" },
  { id: "27", label: "27 — Honey", swatch: "#b88a4a" },
  { id: "30", label: "30 — Auburn", swatch: "#9c4a2a" },
  { id: "33", label: "33 — Burgundy", swatch: "#5e2436", deltaPrice: 30 },
  { id: "613", label: "613 — Platinum", swatch: "#f0e6c8", deltaPrice: 30 },
  { id: "1b-27", label: "Pre-mix 1B/27", swatch: "linear-gradient(90deg,#16110f,#b88a4a)" },
  { id: "1b-30", label: "Pre-mix 1B/30", swatch: "linear-gradient(90deg,#16110f,#9c4a2a)" },
  { id: "burgundy", label: "BG — Burgundy", swatch: "#5e2436" },
];

export const COMMON_ADDONS: AddOn[] = [
  { id: "wash-blow", name: "Wash & Blow", description: "Basic wash and blowout.", price: 30, durationMin: 45 },
  { id: "acv", name: "ACV Wash", description: "Apple cider vinegar clarifier for braiding hair only. Request 2 days before appointment.", price: 20, durationMin: 30 },
  { id: "beads", name: "Beads", description: "Bring beads of your choice.", price: 50, durationMin: 30 },
];

// ───────────────────── categories ─────────────────────

export const CATEGORIES: ServiceCategory[] = [
  {
    slug: "braids",
    name: "Braids",
    tagline: "Knotless, box, top knots, and everything in between.",
  },
  {
    slug: "weaves",
    name: "Weaves & Extensions",
    tagline: "Sew-ins, tape-ins, and full installs.",
  },
  {
    slug: "silk-press",
    name: "Silk Press",
    tagline: "Heatless prep and silk-press finishes that last weeks.",
  },
  {
    slug: "natural",
    name: "Natural Hair",
    tagline: "Twist-outs, wash-and-go, scalp rituals.",
  },
  {
    slug: "color",
    name: "Color",
    tagline: "Custom formulations for Black hair.",
  },
  {
    slug: "cuts",
    name: "Cuts & Trims",
    tagline: "Shape-ups, dust-trims, and full restyles.",
  },
  {
    slug: "treatments",
    name: "Treatments",
    tagline: "Deep conditioning, bond-builders, and scalp work.",
  },
];

// ───────────────────── services ─────────────────────

const braidModifiers = (lengthRequired = true): Modifier[] => [
  { id: "length", kind: "length", label: "Length", required: lengthRequired, options: BRAID_LENGTHS },
  { id: "parting", kind: "parting", label: "Parting", required: true, options: PARTING_STYLES },
  { id: "color", kind: "color", label: "Braiding hair color", required: true, options: HAIR_COLORS },
  { id: "ends", kind: "ends", label: "Ends", required: true, options: ENDS_STYLES },
];

export const CATALOG_SERVICES: CatalogService[] = [
  // ─── Braids ───
  {
    id: "svc-knotless-xs",
    slug: "xs-knotless-braids",
    categorySlug: "braids",
    name: "XS Knotless Braids",
    description: "Extra-small knotless braids — most volume, slimmest individual braid.",
    basePrice: 365,
    baseDurationMin: 420,
    popular: true,
    modifiers: braidModifiers(),
    addOns: COMMON_ADDONS,
  },
  {
    id: "svc-knotless-small",
    slug: "small-knotless-braids",
    categorySlug: "braids",
    name: "Small Knotless Braids",
    basePrice: 295,
    baseDurationMin: 360,
    popular: true,
    modifiers: braidModifiers(),
    addOns: COMMON_ADDONS,
  },
  {
    id: "svc-knotless-medium",
    slug: "medium-knotless-braids",
    categorySlug: "braids",
    name: "Medium Knotless Braids",
    basePrice: 245,
    baseDurationMin: 300,
    modifiers: braidModifiers(),
    addOns: COMMON_ADDONS,
  },
  {
    id: "svc-knotless-large",
    slug: "large-knotless",
    categorySlug: "braids",
    name: "Large Knotless",
    basePrice: 195,
    baseDurationMin: 240,
    modifiers: braidModifiers(),
    addOns: COMMON_ADDONS,
  },
  {
    id: "svc-boho-knotless",
    slug: "boho-knotless",
    categorySlug: "braids",
    name: "Boho Knotless",
    description: "Knotless braids finished with human-hair boho curls.",
    basePrice: 425,
    baseDurationMin: 480,
    popular: true,
    modifiers: braidModifiers(),
    addOns: COMMON_ADDONS,
  },

  // ─── Silk Press ───
  {
    id: "svc-silk-press",
    slug: "silk-press",
    categorySlug: "silk-press",
    name: "Silk Press",
    description: "Heatless prep, deep-clean cleanse, full silk-press finish.",
    basePrice: 145,
    baseDurationMin: 120,
    popular: true,
    modifiers: [
      {
        id: "treatment",
        kind: "treatment",
        label: "Add a treatment",
        options: [
          { id: "none", label: "No treatment" },
          { id: "deep-condition", label: "Deep condition", deltaPrice: 25, deltaDurationMin: 20 },
          { id: "bond-builder", label: "Bond builder", deltaPrice: 45, deltaDurationMin: 30 },
        ],
      },
    ],
  },
  {
    id: "svc-wash-style",
    slug: "wash-and-style",
    categorySlug: "silk-press",
    name: "Wash & Style",
    basePrice: 95,
    baseDurationMin: 90,
  },

  // ─── Natural ───
  {
    id: "svc-twist-out",
    slug: "twist-out-set",
    categorySlug: "natural",
    name: "Twist Out Set",
    basePrice: 165,
    baseDurationMin: 150,
  },

  // ─── Color ───
  {
    id: "svc-color-refresh",
    slug: "color-refresh",
    categorySlug: "color",
    name: "Color Refresh",
    description: "Root touch-up + glaze to revive existing color.",
    basePrice: 140,
    baseDurationMin: 120,
    popular: true,
  },
  {
    id: "svc-honey-balayage",
    slug: "honey-balayage",
    categorySlug: "color",
    name: "Honey Balayage",
    description: "Hand-painted highlights, custom-formulated for your base tone.",
    basePrice: 320,
    baseDurationMin: 240,
  },

  // ─── Cuts ───
  {
    id: "svc-trim",
    slug: "trim",
    categorySlug: "cuts",
    name: "Trim",
    description: "Dust-trim or shape-up.",
    basePrice: 60,
    baseDurationMin: 45,
  },

  // ─── Treatments ───
  {
    id: "svc-deep-condition",
    slug: "deep-conditioning",
    categorySlug: "treatments",
    name: "Deep Conditioning",
    basePrice: 45,
    baseDurationMin: 45,
  },
];

// ───────────────────── lookups ─────────────────────

export const getCategory = (slug: CategorySlug): ServiceCategory | undefined =>
  CATEGORIES.find((c) => c.slug === slug);

export const getService = (slug: string): CatalogService | undefined =>
  CATALOG_SERVICES.find((s) => s.slug === slug);

export const servicesByCategory = (slug: CategorySlug): CatalogService[] =>
  CATALOG_SERVICES.filter((s) => s.categorySlug === slug);

export const popularServices = (): CatalogService[] =>
  CATALOG_SERVICES.filter((s) => s.popular);

// ───────────────────── pricing ─────────────────────

// Resolve effective price + duration from a service + modifier choices + add-on ids.
// Modifier choices are { modifierId → optionId }. Unknown options are ignored.
export function computePricing(
  serviceSlug: string,
  modifierChoices: Record<string, string> = {},
  addOnIds: string[] = [],
): { price: number; durationMin: number } {
  const svc = getService(serviceSlug);
  if (!svc) return { price: 0, durationMin: 0 };
  let price = svc.basePrice;
  let durationMin = svc.baseDurationMin;
  for (const mod of svc.modifiers ?? []) {
    const optId = modifierChoices[mod.id];
    if (!optId) continue;
    const opt = mod.options.find((o) => o.id === optId);
    if (!opt) continue;
    price += opt.deltaPrice ?? 0;
    durationMin += opt.deltaDurationMin ?? 0;
  }
  for (const addOnId of addOnIds) {
    const addOn = (svc.addOns ?? []).find((a) => a.id === addOnId);
    if (!addOn) continue;
    price += addOn.price;
    durationMin += addOn.durationMin;
  }
  return { price, durationMin };
}

export const formatDuration = (mins: number): string => {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};
