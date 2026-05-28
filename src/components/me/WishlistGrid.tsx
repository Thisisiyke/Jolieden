"use client";

// Client component that filters the gallery down to the wishlist for a
// given client. Renders an empty-state when nothing's saved.

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/store";
import { CATEGORY_PALETTES, type Style } from "@/lib/gallery";

type Props = {
  clientSlug: string;
  allStyles: Style[];
};

export default function WishlistGrid({ clientSlug, allStyles }: Props) {
  const wishlist = useWishlist(clientSlug);
  const styles = allStyles.filter((s) => wishlist.includes(s.slug));

  if (styles.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-ink-300 bg-white p-8 text-center">
        <Heart className="mx-auto h-7 w-7 text-ink-400" />
        <p className="mt-3 text-sm font-medium text-ink-900">Nothing saved yet</p>
        <p className="mt-1 text-xs text-ink-500">
          Tap the heart on any style in the gallery to add it here.
        </p>
        <Link
          href="/book"
          className="mt-3 inline-block rounded-md bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700"
        >
          Browse styles
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {styles.map((s) => {
        const [start, end] = CATEGORY_PALETTES[s.categorySlug];
        return (
          <Link
            key={s.id}
            href={`/book/style/${s.slug}`}
            className="block overflow-hidden rounded-2xl border border-ink-200 bg-white"
          >
            <div
              className="aspect-[4/5] w-full"
              style={
                s.photoUrl
                  ? { backgroundImage: `url(${s.photoUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                  : { background: `linear-gradient(140deg, ${start}, ${end})` }
              }
            />
            <div className="px-2.5 py-2">
              <div className="truncate text-xs font-medium text-ink-900">{s.name}</div>
              <div className="font-mono text-[9px] uppercase tracking-wider text-ink-500">
                {s.categorySlug}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
