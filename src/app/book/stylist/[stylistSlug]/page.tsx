import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, Camera, ArrowRight } from "lucide-react";
import { resolveStylist } from "@/lib/personas";
import { stylesByStylist, CATEGORY_PALETTES, type Style } from "@/lib/gallery";

function WorkTile({ style }: { style: Style }) {
  const [start, end] = CATEGORY_PALETTES[style.categorySlug];
  return (
    <Link
      href={`/book/style/${style.slug}`}
      className="block overflow-hidden rounded-xl border border-ink-200 bg-white"
    >
      <div
        className="aspect-square w-full"
        style={
          style.photoUrl
            ? { backgroundImage: `url(${style.photoUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { background: `linear-gradient(140deg, ${start}, ${end})` }
        }
      />
      <div className="px-2 py-1.5">
        <div className="truncate text-xs font-medium text-ink-900">{style.name}</div>
      </div>
    </Link>
  );
}

const MOCK_REVIEWS = [
  { author: "Aaliyah J.", rating: 5, body: "Oumou's tension is gentler than anywhere I've been. My edges thank her." },
  { author: "Mariama T.", rating: 5, body: "Got the Bora Bora boho — exactly like the photo. Six hours flew by." },
  { author: "Layla M.", rating: 4, body: "Worth the wait. Lasted 8 weeks easy." },
];

export default async function BookStylistPage({
  params,
}: {
  params: Promise<{ stylistSlug: string }>;
}) {
  const { stylistSlug } = await params;
  const stylist = resolveStylist(stylistSlug);
  if (!stylist) notFound();

  const works = stylesByStylist(stylistSlug);
  const initials = stylist.name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
      {/* Hero */}
      <header className="flex flex-col items-center text-center sm:flex-row sm:items-end sm:text-left sm:gap-6">
        <div
          className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full text-2xl font-semibold text-white"
          style={{ background: stylist.color }}
        >
          {initials}
        </div>
        <div className="mt-3 sm:mt-0">
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            {stylist.specialty || stylist.role}
            {stylist.yearsAtSalon ? ` · ${stylist.yearsAtSalon} years at Jolieden` : ""}
          </div>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-brand sm:text-4xl">
            {stylist.name}
          </h1>
          <div className="mt-2 flex items-center justify-center gap-3 sm:justify-start">
            <div className="flex items-center gap-1 text-ink-700">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" />
              <span className="text-sm font-medium">4.9</span>
              <span className="text-xs text-ink-500">· 142 reviews</span>
            </div>
            {stylist.instagram && (
              <Link
                href={`https://www.instagram.com/${stylist.instagram}`}
                className="flex items-center gap-1 text-xs text-ink-500 hover:text-brand"
              >
                <Camera className="h-3 w-3" /> @{stylist.instagram}
              </Link>
            )}
          </div>
        </div>
        <div className="mt-4 sm:ml-auto sm:mt-0">
          <Link
            href={`/book?stylist=${stylist.slug}`}
            className="flex items-center gap-1.5 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Book with {stylist.name.split(" ")[0]}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Bio */}
      {stylist.bio && (
        <section className="mt-8 rounded-2xl border border-ink-200 bg-white p-5">
          <h2 className="font-serif text-lg font-semibold text-ink-900">About {stylist.name.split(" ")[0]}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-700">{stylist.bio}</p>
        </section>
      )}

      {/* Work portfolio */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-ink-900">Recent work</h2>
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            <Camera className="mr-0.5 inline h-3 w-3" /> {works.length} looks
          </span>
        </div>
        {works.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink-300 bg-white p-6 text-center text-sm text-ink-500">
            No portfolio shots seeded yet — uploads land via /pro before/after capture.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {works.map((w) => (
              <WorkTile key={w.id} style={w} />
            ))}
          </div>
        )}
      </section>

      {/* Reviews */}
      <section className="mt-8">
        <h2 className="font-serif text-lg font-semibold text-ink-900">What clients say</h2>
        <ul className="mt-3 space-y-2">
          {MOCK_REVIEWS.map((r, i) => (
            <li key={i} className="rounded-xl border border-ink-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-ink-900">{r.author}</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={"h-3 w-3 " + (n <= r.rating ? "fill-gold text-gold" : "text-ink-200")}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-ink-700">&ldquo;{r.body}&rdquo;</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
