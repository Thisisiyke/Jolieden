// Gallery entries — the photo-first booking flow's home. A Style is a finished
// look photo tagged with the underlying service + preselected modifier choices.
// Tapping a Style in /book pre-fills the booking flow.

import type { CategorySlug } from "@/lib/catalog";

export type Style = {
  id: string;
  slug: string;
  categorySlug: CategorySlug;
  name: string;
  photoUrl: string;
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

// Seeded in P6 after we scrape joliedensbeautybar.com + Instagram.
// Each entry should give the booking flow enough to pre-fill (service + modifiers).
export const STYLES: Style[] = [];

export const stylesByCategory = (slug: CategorySlug): Style[] =>
  STYLES.filter((s) => s.categorySlug === slug);

export const getStyle = (slug: string): Style | undefined =>
  STYLES.find((s) => s.slug === slug);

export const stylesByStylist = (stylistSlug: string): Style[] =>
  STYLES.filter((s) => s.stylistSlug === stylistSlug);

export const popularStyles = (): Style[] =>
  [...STYLES].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
