// Google Reviews strip for /book. Shows the 4.9-star aggregate + a
// horizontally scrollable carousel of recent reviews. "Powered by Google"
// to signal the source. Per Diéssou's Must-Have "pull reviews from Google."

import { Star, ExternalLink } from "lucide-react";
import { GOOGLE_REVIEWS, REVIEW_STATS, type GoogleReview } from "@/lib/reviews";

function StarRow({ rating }: { rating: GoogleReview["rating"] }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={"h-3 w-3 " + (n <= rating ? "fill-gold text-gold" : "text-ink-200")}
        />
      ))}
    </div>
  );
}

function ReviewCard({ r }: { r: GoogleReview }) {
  return (
    <article className="w-[280px] shrink-0 snap-start rounded-2xl border border-ink-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand">
            {r.author.split(/\s+/).map((p) => p[0]).join("").slice(0, 2)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-xs font-semibold text-ink-900">{r.author}</div>
            <div className="font-mono text-[9px] uppercase tracking-wider text-ink-500">
              {r.relativeTime}
            </div>
          </div>
        </div>
        <StarRow rating={r.rating} />
      </div>
      <p className="mt-2 line-clamp-4 text-xs leading-snug text-ink-700">{r.body}</p>
      {r.service && (
        <div className="mt-2 inline-block rounded-full bg-paper px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-ink-700">
          {r.service}
        </div>
      )}
    </article>
  );
}

export default function ReviewsStrip() {
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            ⭐ Google Reviews
          </div>
          <div className="mt-0.5 flex items-baseline gap-2">
            <span className="font-serif text-2xl font-semibold text-brand">
              {REVIEW_STATS.averageRating}
            </span>
            <StarRow rating={5} />
            <span className="font-mono text-[10px] text-ink-500">
              · {REVIEW_STATS.totalReviews} reviews · {REVIEW_STATS.fiveStarPercent}% 5★
            </span>
          </div>
        </div>
        <a
          href="https://maps.google.com/?q=Jolieden+Beauty+Bar"
          target="_blank"
          rel="noreferrer"
          className="hidden items-center gap-1 rounded-full border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:border-brand sm:flex"
        >
          See all on Google <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <div className="-mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {GOOGLE_REVIEWS.map((r) => (
          <ReviewCard key={r.id} r={r} />
        ))}
      </div>
    </section>
  );
}
