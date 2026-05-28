import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Star,
  Phone,
  Mail,
  CalendarHeart,
  Tag,
  Sparkles,
} from "lucide-react";
import { resolveStylist } from "@/lib/personas";
import { CLIENTS, APPOINTMENTS, type Appointment } from "@/lib/data";

function ApptRow({ a }: { a: Appointment }) {
  return (
    <li className="flex items-center justify-between gap-2 border-b border-ink-100 px-4 py-2.5 last:border-b-0">
      <div className="min-w-0">
        <div className="truncate text-sm text-ink-900">{a.service || "—"}</div>
        <div className="font-mono text-[10px] text-ink-500">
          {a.date} · {a.start}
          {a.staff ? ` · ${a.staff}` : ""}
        </div>
      </div>
      <span className="rounded-full bg-paper px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-ink-600">
        {a.status}
      </span>
    </li>
  );
}

export default async function ProClientDetailPage({
  params,
}: {
  params: Promise<{ stylistSlug: string; clientId: string }>;
}) {
  const { stylistSlug, clientId } = await params;
  const stylist = resolveStylist(stylistSlug);
  if (!stylist) notFound();

  const client = CLIENTS.find((c) => c.id === clientId);
  if (!client) notFound();

  const fullName = `${client.firstName} ${client.lastName}`;
  const initials = (client.firstName[0] + client.lastName[0]).toUpperCase();
  const isVip = (client.tags || []).includes("VIP");
  const hue = client.avatarHue ?? 320;

  // History — most recent first.
  const past = APPOINTMENTS.filter(
    (a) => a.client.toLowerCase().trim() === fullName.toLowerCase().trim(),
  ).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-5 px-4 py-5">
      <header className="flex items-center gap-2">
        <Link
          href={`/pro/${stylistSlug}/clients`}
          className="-ml-1 flex items-center gap-0.5 text-brand"
          aria-label="Back to clients"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </header>

      {/* Hero */}
      <section className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-white p-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-semibold text-white"
          style={{
            background: `linear-gradient(135deg, hsl(${hue}, 55%, 38%), hsl(${(hue + 30) % 360}, 60%, 50%))`,
          }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h1 className="truncate text-base font-semibold text-ink-900">{fullName}</h1>
            {isVip && <Star className="h-4 w-4 fill-gold text-gold" />}
          </div>
          <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-500">
            {client.visits} visit{client.visits === 1 ? "" : "s"} · ${client.totalSpend.toLocaleString("en-US")} lifetime
          </div>
        </div>
      </section>

      {/* Quick contact */}
      <section className="overflow-hidden rounded-xl border border-ink-200 bg-white">
        <a
          href={`tel:${client.phone}`}
          className="flex items-center gap-3 border-b border-ink-100 px-4 py-3 text-sm hover:bg-paper last:border-b-0"
        >
          <Phone className="h-4 w-4 text-brand" /> {client.phone}
        </a>
        {client.email && (
          <a
            href={`mailto:${client.email}`}
            className="flex items-center gap-3 border-b border-ink-100 px-4 py-3 text-sm hover:bg-paper last:border-b-0"
          >
            <Mail className="h-4 w-4 text-brand" /> {client.email}
          </a>
        )}
      </section>

      {/* Tags */}
      {(client.tags || []).length > 0 && (
        <section>
          <h2 className="px-1 pb-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-500">
            <Tag className="mr-0.5 inline h-3 w-3" /> Tags
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {(client.tags || []).map((t) => (
              <span
                key={t}
                className="rounded-full bg-brand-50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-brand"
              >
                {t}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Stylist persona shown when known */}
      {client.preferredStylistSlug && (
        <section className="rounded-xl border border-ink-200 bg-paper p-3 text-xs text-ink-700">
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            <Sparkles className="mr-0.5 inline h-3 w-3 text-brand" /> Preferred stylist
          </div>
          <p className="mt-1 leading-relaxed">{client.preferredStylistSlug}</p>
        </section>
      )}

      {/* History */}
      <section>
        <h2 className="px-1 pb-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-500">
          <CalendarHeart className="mr-0.5 inline h-3 w-3" /> History
        </h2>
        {past.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink-300 bg-white p-4 text-center text-xs text-ink-500">
            No appointments on file yet.
          </div>
        ) : (
          <ul className="overflow-hidden rounded-xl border border-ink-200 bg-white">
            {past.map((a) => (
              <ApptRow key={a.id} a={a} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
