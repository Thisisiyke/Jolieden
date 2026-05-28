// Featured-stylist card with their portrait + bio + a 3-photo strip of their
// recent work. Photos pulled from the gallery via stylistSlug.

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Stylist } from "@/lib/data";
import { stylesByStylist, CATEGORY_PALETTES, type Style } from "@/lib/gallery";

type Props = {
  stylist: Stylist;
};

function WorkThumb({ style }: { style: Style }) {
  const [start, end] = CATEGORY_PALETTES[style.categorySlug];
  return (
    <Link
      href={`/book/style/${style.slug}`}
      className="block aspect-square flex-1 overflow-hidden rounded-md"
      style={
        style.photoUrl
          ? { backgroundImage: `url(${style.photoUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
          : { background: `linear-gradient(140deg, ${start}, ${end})` }
      }
    />
  );
}

export default function StylistSpotlight({ stylist }: Props) {
  const works = stylesByStylist(stylist.slug).slice(0, 3);
  const initials = stylist.name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section>
      <div className="mb-2 flex items-end justify-between gap-2">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            💜 Stylist spotlight
          </div>
          <h2 className="font-serif text-lg font-semibold text-ink-900">Meet {stylist.name.split(" ")[0]}</h2>
        </div>
      </div>
      <article className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
        <div className="flex items-start gap-3 px-4 pt-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ background: stylist.color }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-ink-900">{stylist.name}</div>
            <div className="truncate font-mono text-[10px] uppercase tracking-wider text-ink-500">
              {stylist.specialty || stylist.role}
              {stylist.yearsAtSalon ? ` · ${stylist.yearsAtSalon} yr` : ""}
            </div>
          </div>
        </div>
        {stylist.bio && (
          <p className="px-4 pt-2 text-xs leading-relaxed text-ink-700">{stylist.bio}</p>
        )}
        {works.length > 0 && (
          <div className="flex gap-1.5 px-4 pt-3">
            {works.map((w) => (
              <WorkThumb key={w.id} style={w} />
            ))}
          </div>
        )}
        <Link
          href={`/book?as=`}
          className="mt-3 flex items-center justify-center gap-1 border-t border-ink-200 bg-paper py-2.5 text-xs font-medium text-brand hover:bg-brand hover:text-white"
        >
          Book with {stylist.name.split(" ")[0]}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </article>
    </section>
  );
}
