// Horizontal photo carousel — used for "Inspired by you", "Trending this
// month", etc. Each tile uses real photoUrl when available, otherwise a
// category-palette gradient. Snap-scroll for a swipeable feel.

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CATEGORY_PALETTES, type Style } from "@/lib/gallery";

type Props = {
  title: string;
  eyebrow?: string;
  styles: Style[];
  seeAllHref?: string;
  // Client slug for persona propagation — keeps try-on + rebook banner alive
  // when the row is rendered inside the /me surface.
  clientSlug?: string;
};

export default function PhotoRow({
  title,
  eyebrow,
  styles,
  seeAllHref,
  clientSlug,
}: Props) {
  if (styles.length === 0) return null;
  return (
    <section>
      <div className="mb-2 flex items-end justify-between gap-2">
        <div>
          {eyebrow && (
            <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
              {eyebrow}
            </div>
          )}
          <h2 className="font-serif text-lg font-semibold text-ink-900">{title}</h2>
        </div>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="flex items-center gap-0.5 font-mono text-[10px] uppercase tracking-wider text-brand hover:underline"
          >
            See all
            <ChevronRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {styles.map((s) => {
          const [start, end] = CATEGORY_PALETTES[s.categorySlug];
          const href = clientSlug
            ? `/book/style/${s.slug}?as=${clientSlug}`
            : `/book/style/${s.slug}`;
          return (
            <Link
              key={s.id}
              href={href}
              className="block w-[140px] shrink-0 snap-start"
            >
              <div
                className="aspect-[4/5] w-full overflow-hidden rounded-2xl"
                style={
                  s.photoUrl
                    ? { backgroundImage: `url(${s.photoUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                    : { background: `linear-gradient(140deg, ${start}, ${end})` }
                }
              />
              <div className="mt-1.5 px-0.5">
                <div className="truncate text-xs font-medium text-ink-900">{s.name}</div>
                <div className="font-mono text-[9px] uppercase tracking-wider text-ink-500">
                  {s.categorySlug}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
