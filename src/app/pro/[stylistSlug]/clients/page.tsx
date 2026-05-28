import Link from "next/link";
import { notFound } from "next/navigation";
import { Search, ChevronRight, Star } from "lucide-react";
import { resolveStylist, appointmentsForStylist, CAST } from "@/lib/personas";
import { CLIENTS, type Client } from "@/lib/data";

function ClientRow({ client, stylistSlug }: { client: Client; stylistSlug: string }) {
  const hue = client.avatarHue ?? 320;
  const init = (client.firstName[0] + client.lastName[0]).toUpperCase();
  const isVip = (client.tags || []).includes("VIP");
  return (
    <Link
      href={`/pro/${stylistSlug}/clients/${client.id}`}
      className="flex items-center gap-3 border-b border-ink-200 px-4 py-3 last:border-b-0 hover:bg-paper"
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
        style={{
          background: `linear-gradient(135deg, hsl(${hue}, 55%, 38%), hsl(${(hue + 30) % 360}, 60%, 50%))`,
        }}
      >
        {init}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium text-ink-900">
            {client.firstName} {client.lastName}
          </span>
          {isVip && <Star className="h-3 w-3 fill-gold text-gold" />}
        </div>
        <div className="truncate font-mono text-[10px] text-ink-500">
          {client.visits} visits
          {client.lastVisit ? ` · last on ${client.lastVisit}` : ""}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-ink-300" />
    </Link>
  );
}

export default async function StylistClientsPage({
  params,
}: {
  params: Promise<{ stylistSlug: string }>;
}) {
  const { stylistSlug } = await params;
  const stylist = resolveStylist(stylistSlug);
  if (!stylist) notFound();

  // Owner sees the whole client base ranked by lifetime spend (VIP first).
  // Stylists see clients they've personally serviced; fallback list when empty.
  const isOwner = stylistSlug === CAST.owner;

  const apptClientNames = new Set(
    appointmentsForStylist(stylistSlug).map((a) => a.client.toLowerCase().trim()),
  );
  const her = CLIENTS.filter((c) =>
    apptClientNames.has(`${c.firstName} ${c.lastName}`.toLowerCase().trim()),
  ).sort((a, b) => (b.lastVisit || "").localeCompare(a.lastVisit || ""));

  const allRanked = [...CLIENTS]
    .sort((a, b) => b.totalSpend - a.totalSpend);

  const list = isOwner
    ? allRanked
    : her.length > 0
      ? her
      : allRanked.slice(0, 8);

  return (
    <div className="space-y-5 px-4 py-5">
      <header>
        <h1 className="font-serif text-[28px] font-semibold leading-tight text-ink-900">
          Clients
        </h1>
        <p className="mt-1 text-xs text-ink-500">
          {isOwner
            ? `${list.length} clients in the database, ranked by lifetime spend.`
            : her.length > 0
              ? `${her.length} clients ${stylist.name.split(" ")[0]} has serviced.`
              : `Top loyalists across the salon — once ${stylist.name.split(" ")[0]} has appointments on file, this filters to her own roster.`}
        </p>
      </header>

      <div className="flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-500">
        <Search className="h-4 w-4" />
        Search name or phone
      </div>

      <section>
        <h2 className="px-1 pb-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-500">
          {isOwner ? "Top loyalists" : "Recently seen"}
        </h2>
        <div className="overflow-hidden rounded-xl border border-ink-200 bg-white">
          {list.map((c) => (
            <ClientRow key={c.id} client={c} stylistSlug={stylistSlug} />
          ))}
        </div>
      </section>
    </div>
  );
}
