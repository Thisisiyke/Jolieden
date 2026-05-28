// Gallery tile — gradient background fallback (categories palette) until real
// photos arrive in P6 to populate Style.photoUrl. Layout is the same so the
// swap is invisible to consumers.

import Link from "next/link";
import { computePricing, formatDuration } from "@/lib/catalog";
import { CATEGORY_PALETTES, type Style } from "@/lib/gallery";

type Props = {
  style: Style;
  // Optional client-slug from the surrounding gallery / row. When present,
  // we propagate it as `?as=` so persona context (rebook banner, try-on
  // CTA, contact-form pre-fill) survives the tap from any tile.
  asClient?: string;
};

export default function StyleCard({ style, asClient }: Props) {
  const [start, end] = CATEGORY_PALETTES[style.categorySlug];
  const { price, durationMin } = computePricing(
    style.serviceSlug,
    style.defaultModifiers,
    style.defaultAddOns,
  );

  const href = asClient
    ? `/book/style/${style.slug}?as=${asClient}`
    : `/book/style/${style.slug}`;

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-xl border border-ink-200 bg-white transition-shadow hover:shadow-lg"
    >
      <div
        className="relative aspect-[4/5] w-full"
        style={
          style.photoUrl
            ? { backgroundImage: `url(${style.photoUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { background: `linear-gradient(140deg, ${start} 0%, ${end} 100%)` }
        }
      >
        {!style.photoUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <span className="font-serif text-2xl font-semibold tracking-wide text-white/90">
              {style.name}
            </span>
            <span className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">
              {style.categorySlug}
            </span>
          </div>
        )}
        {(style.tags || []).slice(0, 1).map((t) => (
          <span
            key={t}
            className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-brand"
          >
            {t}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-1 px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-ink-900">{style.name}</h3>
          <span className="font-mono text-xs font-semibold text-brand">${price}</span>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
          {formatDuration(durationMin)}
        </div>
      </div>
    </Link>
  );
}
