"use client";

// Category filter chips. Selected category lives in the URL (?category=braids)
// so the page is shareable + back-button friendly.

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { CATEGORIES } from "@/lib/catalog";

export default function CategoryChips() {
  const pathname = usePathname();
  const sp = useSearchParams();
  const current = sp.get("category");

  const buildHref = (cat?: string) => {
    const params = new URLSearchParams(sp.toString());
    if (cat) params.set("category", cat);
    else params.delete("category");
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const chipClass = (active: boolean) =>
    clsx(
      "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
      active
        ? "border-brand bg-brand text-white"
        : "border-ink-200 bg-white text-ink-700 hover:border-brand",
    );

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <Link href={buildHref(undefined)} className={chipClass(!current)}>
        All
      </Link>
      {CATEGORIES.map((c) => (
        <Link key={c.slug} href={buildHref(c.slug)} className={chipClass(current === c.slug)}>
          {c.name}
        </Link>
      ))}
    </div>
  );
}
