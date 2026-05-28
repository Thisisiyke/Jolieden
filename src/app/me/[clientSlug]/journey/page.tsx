import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, RefreshCcw } from "lucide-react";
import clsx from "clsx";
import { resolveClient, journeyForClient, stylistByName, resolveStylist } from "@/lib/personas";
import { CATEGORY_PALETTES } from "@/lib/gallery";
import type { HairJourneyEntry } from "@/lib/journey";

function categoryFromService(name: string): "braids" | "natural" | "silk-press" | "color" | "cuts" | "treatments" {
  const lower = name.toLowerCase();
  if (lower.includes("twist") || lower.includes("braid") || lower.includes("knotless") || lower.includes("boho") || lower.includes("fulani"))
    return lower.includes("twist") ? "natural" : "braids";
  if (lower.includes("silk")) return "silk-press";
  if (lower.includes("color") || lower.includes("balayage")) return "color";
  if (lower.includes("trim") || lower.includes("cut")) return "cuts";
  return "treatments";
}

function JourneyTile({ entry }: { entry: HairJourneyEntry }) {
  const stylist = entry.stylistSlug
    ? resolveStylist(entry.stylistSlug)
    : stylistByName(entry.serviceName);
  const cat = categoryFromService(entry.serviceName);
  const [start, end] = CATEGORY_PALETTES[cat];
  const date = new Date(entry.date);
  const dateLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <article className="overflow-hidden rounded-xl border border-ink-200 bg-white">
      <div
        className="relative aspect-[4/3] w-full"
        style={
          entry.afterPhoto
            ? { backgroundImage: `url(${entry.afterPhoto})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { background: `linear-gradient(140deg, ${start}, ${end})` }
        }
      >
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-brand">
          {dateLabel}
        </span>
      </div>
      <div className="px-3 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-ink-900">{entry.serviceName}</h3>
            <p className="truncate text-xs text-ink-500">with {stylist?.name || "—"}</p>
          </div>
          {entry.rating && (
            <div className="flex shrink-0 items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={clsx("h-3 w-3", n <= entry.rating! ? "fill-gold text-gold" : "text-ink-200")}
                />
              ))}
            </div>
          )}
        </div>
        {entry.note && (
          <p className="mt-2 text-xs leading-relaxed text-ink-700">&ldquo;{entry.note}&rdquo;</p>
        )}
        <div className="mt-3">
          <Link
            href="/book"
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-brand hover:underline"
          >
            <RefreshCcw className="h-3 w-3" /> Rebook this
          </Link>
        </div>
      </div>
    </article>
  );
}

export default async function ClientJourneyPage({
  params,
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;
  const client = resolveClient(clientSlug);
  if (!client) notFound();

  const entries = journeyForClient(clientSlug);

  return (
    <div className="space-y-5 px-5 py-6">
      <header>
        <h1 className="font-serif text-2xl font-semibold text-brand">
          {client.firstName}&apos;s hair journey
        </h1>
        <p className="mt-1 text-xs text-ink-500">
          {entries.length === 0
            ? "No looks captured yet — your stylist will start a timeline at your next visit."
            : `${entries.length} looks captured over time. Tap any to rebook the same.`}
        </p>
      </header>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-300 bg-white p-6 text-center">
          <p className="text-sm text-ink-700">
            Your hair journey starts after your first visit.
          </p>
          <Link
            href="/book"
            className="mt-3 inline-block rounded-md bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700"
          >
            Book your first
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {entries.map((e) => (
            <JourneyTile key={e.id} entry={e} />
          ))}
        </div>
      )}
    </div>
  );
}
