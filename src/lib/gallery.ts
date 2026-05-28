// Gallery entries — the photo-first booking flow's home. A Style is a finished
// look photo tagged with the underlying service + preselected modifier choices.
// Tapping a Style in /book pre-fills the booking flow.

import type { CategorySlug } from "@/lib/catalog";

export type Style = {
  id: string;
  slug: string;
  categorySlug: CategorySlug;
  name: string;
  photoUrl: string; // empty for P5; real photos in P6
  thumbUrl?: string;
  // Underlying service the style maps to.
  serviceSlug: string;
  // Preselected modifier choices: modifier id → option id.
  defaultModifiers?: Record<string, string>;
  defaultAddOns?: string[];
  // Optional: the stylist who created this look (cross-link).
  stylistSlug?: string;
  popularity?: number; // 0-100, drives default sort
  tags?: string[];
};

// Each category has a palette the gallery card falls back to when no photoUrl.
// Replaced visually when real photos arrive in P6.
export const CATEGORY_PALETTES: Record<CategorySlug, [string, string]> = {
  braids: ["#431926", "#8e3a52"],
  weaves: ["#5e2436", "#c8a368"],
  "silk-press": ["#c8a368", "#f1e3c4"],
  natural: ["#4a2f1d", "#b88a4a"],
  color: ["#9c4a2a", "#c8a368"],
  cuts: ["#1a1a1a", "#5e2436"],
  treatments: ["#0ea5e9", "#f4eee9"],
};

export const STYLES: Style[] = [
  // ─── Braids ───
  {
    id: "st-xs-boho",
    slug: "xs-knotless-boho",
    categorySlug: "braids",
    name: "XS Knotless Boho",
    photoUrl: "",
    serviceSlug: "xs-knotless-braids",
    defaultModifiers: { length: "mid-back", parting: "triangle", color: "1b-27", ends: "boho" },
    defaultAddOns: ["wash-blow"],
    stylistSlug: "oumou-d",
    popularity: 96,
    tags: ["Boho", "Two-tone"],
  },
  {
    id: "st-waist-knotless",
    slug: "waist-length-knotless",
    categorySlug: "braids",
    name: "Waist-Length Knotless",
    photoUrl: "",
    serviceSlug: "xs-knotless-braids",
    defaultModifiers: { length: "waist", parting: "free-part", color: "1b", ends: "wavy" },
    stylistSlug: "oumou-d",
    popularity: 92,
    tags: ["Waist", "Statement"],
  },
  {
    id: "st-honey-knotless",
    slug: "honey-knotless",
    categorySlug: "braids",
    name: "Honey Knotless",
    photoUrl: "",
    serviceSlug: "small-knotless-braids",
    defaultModifiers: { length: "mid-back", parting: "standard-box", color: "1b-27", ends: "straight" },
    stylistSlug: "oumou-d",
    popularity: 88,
    tags: ["Honey", "Two-tone"],
  },
  {
    id: "st-burgundy-knotless",
    slug: "burgundy-knotless",
    categorySlug: "braids",
    name: "Burgundy Knotless",
    photoUrl: "",
    serviceSlug: "medium-knotless-braids",
    defaultModifiers: { length: "mid-back", parting: "standard-box", color: "33", ends: "straight" },
    stylistSlug: "oumou-d",
    popularity: 84,
    tags: ["Burgundy", "Statement"],
  },
  {
    id: "st-jumbo-curly",
    slug: "jumbo-knotless-curly-ends",
    categorySlug: "braids",
    name: "Jumbo Knotless · Curly",
    photoUrl: "",
    serviceSlug: "large-knotless",
    defaultModifiers: { length: "waist", parting: "free-part", color: "1b", ends: "curly" },
    stylistSlug: "oumou-d",
    popularity: 80,
    tags: ["Curly ends"],
  },
  {
    id: "st-triangle-mid",
    slug: "triangle-mid-braid",
    categorySlug: "braids",
    name: "Triangle Mid-Back",
    photoUrl: "",
    serviceSlug: "small-knotless-braids",
    defaultModifiers: { length: "mid-back", parting: "triangle", color: "1b", ends: "wavy" },
    stylistSlug: "oumou-d",
    popularity: 76,
    tags: ["Triangle parts"],
  },
  {
    id: "st-boho-goddess",
    slug: "boho-goddess",
    categorySlug: "braids",
    name: "Boho Goddess",
    photoUrl: "",
    serviceSlug: "boho-knotless",
    defaultModifiers: { length: "mid-back", parting: "free-part", color: "1b-27", ends: "boho" },
    defaultAddOns: ["wash-blow"],
    stylistSlug: "oumou-d",
    popularity: 95,
    tags: ["Boho", "Most booked"],
  },
  {
    id: "st-platinum-touch",
    slug: "platinum-touch-braids",
    categorySlug: "braids",
    name: "Platinum Touch",
    photoUrl: "",
    serviceSlug: "medium-knotless-braids",
    defaultModifiers: { length: "mid-back", parting: "standard-box", color: "613", ends: "wavy" },
    stylistSlug: "oumou-d",
    popularity: 72,
    tags: ["Platinum"],
  },

  // ─── Silk Press ───
  {
    id: "st-glossy-press",
    slug: "glossy-silk-press",
    categorySlug: "silk-press",
    name: "Glossy Silk Press",
    photoUrl: "",
    serviceSlug: "silk-press",
    defaultModifiers: { treatment: "bond-builder" },
    stylistSlug: "fatou-c",
    popularity: 90,
    tags: ["Bond builder"],
  },
  {
    id: "st-volume-press",
    slug: "volume-silk-press",
    categorySlug: "silk-press",
    name: "Volume Silk Press",
    photoUrl: "",
    serviceSlug: "silk-press",
    defaultModifiers: { treatment: "deep-condition" },
    stylistSlug: "fatou-c",
    popularity: 78,
    tags: ["Deep condition"],
  },
  {
    id: "st-sleek-press",
    slug: "sleek-silk-press",
    categorySlug: "silk-press",
    name: "Sleek Silk Press",
    photoUrl: "",
    serviceSlug: "silk-press",
    defaultModifiers: { treatment: "none" },
    stylistSlug: "fatou-c",
    popularity: 68,
  },

  // ─── Natural ───
  {
    id: "st-twist-out-crown",
    slug: "twist-out-crown",
    categorySlug: "natural",
    name: "Twist-Out Crown",
    photoUrl: "",
    serviceSlug: "twist-out-set",
    stylistSlug: "fatou-c",
    popularity: 70,
  },
  {
    id: "st-wash-and-go",
    slug: "wash-and-go-definition",
    categorySlug: "natural",
    name: "Wash & Go Definition",
    photoUrl: "",
    serviceSlug: "wash-and-style",
    stylistSlug: "fatou-c",
    popularity: 65,
  },

  // ─── Color ───
  {
    id: "st-honey-balayage",
    slug: "honey-balayage-classic",
    categorySlug: "color",
    name: "Honey Balayage",
    photoUrl: "",
    serviceSlug: "honey-balayage",
    stylistSlug: "dieynaba-d",
    popularity: 88,
    tags: ["Hand-painted"],
  },
  {
    id: "st-auburn-glow",
    slug: "auburn-glow",
    categorySlug: "color",
    name: "Auburn Glow",
    photoUrl: "",
    serviceSlug: "color-refresh",
    stylistSlug: "dieynaba-d",
    popularity: 74,
  },
  {
    id: "st-copper-highlights",
    slug: "copper-highlights",
    categorySlug: "color",
    name: "Copper Highlights",
    photoUrl: "",
    serviceSlug: "honey-balayage",
    stylistSlug: "dieynaba-d",
    popularity: 80,
  },

  // ─── Cuts ───
  {
    id: "st-mid-shape",
    slug: "mid-length-shape",
    categorySlug: "cuts",
    name: "Mid-Length Shape",
    photoUrl: "",
    serviceSlug: "trim",
    popularity: 60,
  },
  {
    id: "st-dust-trim",
    slug: "dust-trim",
    categorySlug: "cuts",
    name: "Dust Trim",
    photoUrl: "",
    serviceSlug: "trim",
    popularity: 55,
  },

  // ─── Treatments ───
  {
    id: "st-restoration",
    slug: "restoration-treatment",
    categorySlug: "treatments",
    name: "Restoration Treatment",
    photoUrl: "",
    serviceSlug: "deep-conditioning",
    stylistSlug: "fatou-c",
    popularity: 50,
  },
];

export const stylesByCategory = (slug: CategorySlug): Style[] =>
  STYLES.filter((s) => s.categorySlug === slug);

export const getStyle = (slug: string): Style | undefined =>
  STYLES.find((s) => s.slug === slug);

export const stylesByStylist = (stylistSlug: string): Style[] =>
  STYLES.filter((s) => s.stylistSlug === stylistSlug);

export const popularStyles = (): Style[] =>
  [...STYLES].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
