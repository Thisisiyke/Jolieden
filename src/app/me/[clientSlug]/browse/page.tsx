import Link from "next/link";
import { notFound } from "next/navigation";
import { Search, ChevronRight, Heart } from "lucide-react";
import { resolveClient } from "@/lib/personas";
import { popularStyles, CATEGORY_PALETTES, type Style } from "@/lib/gallery";
import { CATEGORIES } from "@/lib/catalog";

function StyleThumb({ style, clientSlug }: { style: Style; clientSlug: string }) {
  const [start, end] = CATEGORY_PALETTES[style.categorySlug];
  return (
    <Link
      href={`/book/style/${style.slug}?as=${clientSlug}`}
      className="group block overflow-hidden rounded-2xl border border-ink-200 bg-white"
    >
      <div
        className="aspect-[4/5] w-full"
        style={
          style.photoUrl
            ? { backgroundImage: `url(${style.photoUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { background: `linear-gradient(140deg, ${start}, ${end})` }
        }
      />
      <div className="px-2.5 py-2">
        <div className="truncate text-xs font-medium text-ink-900">{style.name}</div>
        <div className="font-mono text-[9px] uppercase tracking-wider text-ink-500">
          {style.categorySlug}
        </div>
      </div>
    </Link>
  );
}

function CategoryRow({ slug, label }: { slug: string; label: string }) {
  return (
    <Link
      href={`/book?category=${slug}`}
      className="flex items-center justify-between gap-3 border-b border-ink-200 px-4 py-3 last:border-b-0 hover:bg-paper"
    >
      <span className="text-sm font-medium text-ink-900 capitalize">{label}</span>
      <ChevronRight className="h-4 w-4 text-ink-300" />
    </Link>
  );
}

export default async function BrowsePage({
  params,
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;
  const client = resolveClient(clientSlug);
  if (!client) notFound();

  const featured = popularStyles().slice(0, 6);

  return (
    <div className="space-y-5 px-4 py-5">
      <header>
        <h1 className="font-serif text-[28px] font-semibold leading-tight text-ink-900">
          Browse
        </h1>
        <p className="mt-1 text-xs text-ink-500">
          Tap any style to start a booking, pre-filled with the right length, parting, and color.
        </p>
      </header>

      {/* Search affordance — wired to /book search later */}
      <Link
        href={`/book?as=${clientSlug}`}
        className="flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-500 hover:border-brand"
      >
        <Search className="h-4 w-4" />
        Search styles, lengths, colors
      </Link>

      {/* Saved styles shortcut */}
      <Link
        href={`/me/${clientSlug}/wishlist`}
        className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-white p-4 hover:border-brand"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
          <Heart className="h-4 w-4 fill-brand" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-ink-900">Your saved styles</div>
          <div className="text-xs text-ink-500">Looks you&apos;ve hearted — tap to rebook one.</div>
        </div>
        <ChevronRight className="h-4 w-4 text-ink-300" />
      </Link>

      {/* Most-booked carousel */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Most booked
          </h2>
          <Link
            href={`/book?as=${clientSlug}`}
            className="font-mono text-[10px] uppercase tracking-wider text-brand hover:underline"
          >
            See all
          </Link>
        </div>
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
          {featured.map((s) => (
            <div key={s.id} className="w-[140px] shrink-0">
              <StyleThumb style={s} clientSlug={clientSlug} />
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="px-1 pb-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-500">
          Categories
        </h2>
        <div className="overflow-hidden rounded-xl border border-ink-200 bg-white">
          {CATEGORIES.map((c) => (
            <CategoryRow key={c.slug} slug={c.slug} label={c.name} />
          ))}
        </div>
      </section>
    </div>
  );
}
