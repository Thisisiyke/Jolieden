import { Suspense } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { resolveClient, appointmentsForClient } from "@/lib/personas";
import { STYLES, popularStyles, stylesByCategory } from "@/lib/gallery";
import { CATEGORIES, type CategorySlug } from "@/lib/catalog";
import CategoryChips from "@/components/book/CategoryChips";
import StyleCard from "@/components/book/StyleCard";
import ReviewsStrip from "@/components/book/ReviewsStrip";

const isCategorySlug = (v: string | undefined): v is CategorySlug =>
  !!v && CATEGORIES.some((c) => c.slug === v);

export default async function BookGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ as?: string; category?: string }>;
}) {
  const params = await searchParams;
  const client = params.as ? resolveClient(params.as) : undefined;
  const category = isCategorySlug(params.category) ? params.category : undefined;
  const styles = category ? stylesByCategory(category) : STYLES;
  const popular = popularStyles().slice(0, 4);
  const lastAppt = client ? appointmentsForClient(client.slug).find((a) => a.status === "completed") : undefined;

  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {/* Hot-start banner: "Rebook your last" */}
        {client && lastAppt && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-brand/30 bg-white p-4 shadow-sm">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-brand">
                <Sparkles className="h-3 w-3" /> Welcome back, {client.firstName}
              </div>
              <p className="mt-1 text-sm font-medium text-ink-900">
                Rebook your last visit — {lastAppt.service}
                {lastAppt.staff ? ` with ${lastAppt.staff}` : ""}
              </p>
              <p className="mt-0.5 text-xs text-ink-500">
                Same look, same length, same time slot if it&apos;s open. One tap, no choices to make.
              </p>
            </div>
            <Link
              href={`/book/checkout?as=${client.slug}&rebook=${lastAppt.id}`}
              className="shrink-0 rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Rebook
            </Link>
          </div>
        )}

        {/* Category filter */}
        <div className="mb-4">
          <Suspense fallback={<div className="h-10" />}>
            <CategoryChips />
          </Suspense>
        </div>

        {/* "Most booked" highlight row (only when no filter applied) */}
        {!category && popular.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 font-serif text-xl font-semibold text-brand">Most booked</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {popular.map((s) => (
                <StyleCard key={s.id} style={s} />
              ))}
            </div>
          </section>
        )}

        {/* All / category grid */}
        <section>
          <h2 className="mb-3 font-serif text-xl font-semibold text-brand">
            {category ? CATEGORIES.find((c) => c.slug === category)?.name : "Every look"}
          </h2>
          {styles.length === 0 ? (
            <div className="rounded-xl border border-dashed border-ink-300 bg-white p-8 text-center text-sm text-ink-500">
              Nothing seeded for this category yet — photos arrive in P6.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {styles.map((s) => (
                <StyleCard key={s.id} style={s} />
              ))}
            </div>
          )}
        </section>

        {/* Meet our stylists link (Diéssou Must-Have) */}
        <section className="mt-10 rounded-2xl border border-ink-200 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-brand">
                💜 Behind every look
              </div>
              <h2 className="mt-1 font-serif text-2xl font-semibold text-brand">
                Meet our stylists
              </h2>
              <p className="mt-1 max-w-md text-sm text-ink-700">
                Pick by specialty, see their portfolios, read what clients say. Then book directly.
              </p>
            </div>
            <Link
              href="/book/stylists"
              className="shrink-0 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              See the team
            </Link>
          </div>
        </section>

        {/* Google Reviews strip (Diéssou Must-Have) */}
        <ReviewsStrip />
      </div>
    </div>
  );
}
