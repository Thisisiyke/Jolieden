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

// Real photos scraped from the Jolieden Shopify CDN. Categories without
// corresponding real photos (Silk Press, Color, Cuts, Treatments) fall back
// to category-palette gradients — those are aspirational growth categories
// the salon doesn't currently advertise.
const CDN = "https://www.joliedensbeautybar.com/cdn/shop/files";

export const STYLES: Style[] = [
  // ─── Braids ───
  {
    id: "st-xs-boho",
    slug: "xs-knotless-boho",
    categorySlug: "braids",
    name: "XS Knotless Boho",
    photoUrl: `${CDN}/XSKnotlessBraids_1.jpg`,
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
    photoUrl: `${CDN}/1763415772056.jpg`,
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
    photoUrl: `${CDN}/1763416091701_5684b379-e65d-40b7-920f-de312e8666a7.jpg`,
    serviceSlug: "small-knotless-braids",
    defaultModifiers: { length: "mid-back", parting: "standard-box", color: "1b-27", ends: "straight" },
    stylistSlug: "oumou-d",
    popularity: 88,
    tags: ["Honey", "Two-tone"],
  },
  {
    id: "st-french-curl",
    slug: "french-curl-knotless",
    categorySlug: "braids",
    name: "Small French Curl",
    photoUrl: `${CDN}/1763593884418_109808ed-b9e6-4c3f-a237-21ffc3e60470.jpg`,
    serviceSlug: "small-knotless-braids",
    defaultModifiers: { length: "mid-back", parting: "free-part", color: "1b", ends: "curly" },
    stylistSlug: "oumou-d",
    popularity: 90,
    tags: ["French curl", "Free part"],
  },
  {
    id: "st-jumbo-large",
    slug: "large-knotless",
    categorySlug: "braids",
    name: "Large Knotless",
    photoUrl: `${CDN}/1763414013621_b833d256-530e-46a4-8ff2-470137892222.jpg`,
    serviceSlug: "large-knotless",
    defaultModifiers: { length: "waist", parting: "free-part", color: "1b", ends: "curly" },
    stylistSlug: "oumou-d",
    popularity: 80,
    tags: ["Statement"],
  },
  {
    id: "st-traditional-14-rows",
    slug: "traditional-14-rows",
    categorySlug: "braids",
    name: "Traditional 14-Row Knotless",
    photoUrl: `${CDN}/1763415970920.jpg`,
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
    photoUrl: `${CDN}/1763413254209__2_f448a77c-a2e8-493d-a395-428c21bf4d1b.jpg`,
    serviceSlug: "boho-knotless",
    defaultModifiers: { length: "mid-back", parting: "free-part", color: "1b-27", ends: "boho" },
    defaultAddOns: ["wash-blow"],
    stylistSlug: "oumou-d",
    popularity: 95,
    tags: ["Boho", "Most booked"],
  },
  {
    id: "st-bora-bora",
    slug: "bora-bora-boho",
    categorySlug: "braids",
    name: "Bora Bora Boho",
    photoUrl: `${CDN}/1763415079401_9d8162ea-474c-4119-96ea-d72f1d8d1a4b.jpg`,
    serviceSlug: "boho-knotless",
    defaultModifiers: { length: "mid-back", parting: "standard-box", color: "1b-27", ends: "boho" },
    stylistSlug: "oumou-d",
    popularity: 87,
    tags: ["Boho", "Signature"],
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
    id: "st-fulani-twist",
    slug: "fulani-twist-freestyle",
    categorySlug: "natural",
    name: "Freestyle Fulani Twist",
    photoUrl: `${CDN}/1763500847953.jpg`,
    serviceSlug: "twist-out-set",
    stylistSlug: "fatou-c",
    popularity: 78,
    tags: ["Stitch add-on"],
  },
  {
    id: "st-kinky-twist",
    slug: "small-kinky-twist",
    categorySlug: "natural",
    name: "Small Kinky Twist",
    photoUrl: `${CDN}/1763591971013.jpg`,
    serviceSlug: "twist-out-set",
    stylistSlug: "fatou-c",
    popularity: 70,
  },
  {
    id: "st-senegalese-twist",
    slug: "senegalese-twist",
    categorySlug: "natural",
    name: "Senegalese Twist",
    photoUrl: `${CDN}/1763503997267.jpg`,
    serviceSlug: "twist-out-set",
    stylistSlug: "fatou-c",
    popularity: 72,
    tags: ["Traditional"],
  },
  {
    id: "st-wash-and-go",
    slug: "wash-and-go-definition",
    categorySlug: "natural",
    name: "Wash & Go Definition",
    photoUrl: "",
    serviceSlug: "wash-and-style",
    stylistSlug: "fatou-c",
    popularity: 60,
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
