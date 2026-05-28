import Link from "next/link";
import { notFound } from "next/navigation";
import { Cake, Calendar, ChevronRight, Gift, RefreshCcw, Sparkles, Star, Trophy } from "lucide-react";
import {
  resolveClient,
  resolveStylist,
  appointmentsForClient,
  journeyForClient,
  CAST,
} from "@/lib/personas";
import { CATEGORY_PALETTES } from "@/lib/gallery";
import { TODAY, type Appointment, type Client } from "@/lib/data";
import { pointsFor, tierFor, nextTierFor } from "@/lib/rewards";

// ───────────────────── birthday helpers ─────────────────────

function daysUntilBirthday(client: Client, today: string): number | null {
  if (!client.birthdayMonth) return null;
  const day = client.birthdayDay ?? 1;
  const [ty, tm, td] = today.split("-").map((n) => parseInt(n, 10));
  // Birthday this year vs. next year.
  let bdate = new Date(ty, client.birthdayMonth - 1, day);
  const todayDate = new Date(ty, tm - 1, td);
  if (bdate < todayDate) bdate = new Date(ty + 1, client.birthdayMonth - 1, day);
  const diff = Math.round((bdate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

// ───────────────────── tile sub-components ─────────────────────

function BirthdayHero({
  daysAway,
  tier,
}: {
  daysAway: number;
  tier: string;
}) {
  const gifts: { label: string; sub?: string; redeemed?: boolean }[] = [
    { label: "Comp Wash & Blow", sub: "Auto-applied to your booked visit" },
    { label: "200 bonus points", sub: "Drops into your rewards 24h before your visit" },
  ];
  // Top tier gets the hand-written card too.
  if (tier === "Platinum" || tier === "Gold") {
    gifts.push({ label: "Hand-written card from Diéssou", sub: "Mailed to your address on file" });
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-gold/50 bg-gradient-to-br from-gold-soft via-paper to-brand-50 p-5">
      <div className="absolute right-4 top-4 text-gold/60">
        <Sparkles className="h-6 w-6" />
      </div>
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-brand">
        <Cake className="h-3.5 w-3.5" /> Birthday week · {tier} tier
      </div>
      <h2 className="mt-2 font-serif text-2xl font-semibold text-brand">
        {daysAway === 0 ? "Happy birthday!" : daysAway === 1 ? "1 day away" : `${daysAway} days away`}
      </h2>
      <p className="mt-2 max-w-xs text-sm text-ink-700">
        Surprises waiting for you when you walk in. We can&apos;t wait to spoil you.
      </p>
      <ul className="mt-4 space-y-2">
        {gifts.map((g, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-lg border border-gold/40 bg-white/70 p-2.5"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/20 text-brand">
              <Gift className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-ink-900">{g.label}</div>
              {g.sub && <div className="text-xs text-ink-500">{g.sub}</div>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function RewardsCard({ client, slug }: { client: Client; slug: string }) {
  const points = pointsFor(client);
  const tier = tierFor(client);
  const next = nextTierFor(client);
  return (
    <Link
      href={`/me/${slug}/rewards`}
      className="group block overflow-hidden rounded-2xl border border-ink-200 bg-gradient-to-br from-brand-50 to-paper hover:border-brand"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white">
          <Trophy className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            {tier} member
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-xl font-semibold text-brand tabular-nums">
              {points.toLocaleString("en-US")}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
              points
            </span>
          </div>
          {next && (
            <div className="font-mono text-[10px] text-ink-500">
              {next.pointsToGo} pts to {next.tier}
            </div>
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-ink-300 group-hover:text-brand" />
      </div>
    </Link>
  );
}

function RebookCard({
  client,
  lastAppt,
}: {
  client: Client;
  lastAppt: Appointment;
}) {
  const stylist = lastAppt.staff ? resolveStylist(lastAppt.staff.toLowerCase().replace(/\s+/g, "-")) : undefined;
  return (
    <Link
      href={`/book?as=${client.slug}`}
      className="group flex items-center justify-between gap-3 rounded-2xl border border-brand/30 bg-white p-4 hover:border-brand"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-brand">
          <RefreshCcw className="h-3 w-3" /> Rebook your usual
        </div>
        <h3 className="mt-1 truncate text-base font-semibold text-ink-900">{lastAppt.service}</h3>
        <p className="mt-0.5 truncate text-xs text-ink-500">
          {stylist ? `with ${stylist.name}` : lastAppt.staff ? `with ${lastAppt.staff}` : ""}
        </p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-ink-300 group-hover:text-brand" />
    </Link>
  );
}

function UpcomingApptCard({
  appt,
  clientSlug,
  birthdayFlag,
}: {
  appt: Appointment;
  clientSlug: string;
  birthdayFlag?: boolean;
}) {
  return (
    <Link
      href={`/me/${clientSlug}/bookings/${appt.id}`}
      className="block rounded-2xl border border-ink-200 bg-white p-4 hover:border-brand"
    >
      <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-500">
        <Calendar className="h-3 w-3" /> Upcoming
      </div>
      <h3 className="mt-1 text-base font-semibold text-ink-900">{appt.service}</h3>
      <div className="mt-1 flex items-center gap-2 text-xs text-ink-700">
        <span>{appt.date}</span>
        <span className="text-ink-300">·</span>
        <span>{appt.start}</span>
        {appt.staff && <span className="text-ink-300">·</span>}
        {appt.staff && <span>with {appt.staff}</span>}
      </div>
      {birthdayFlag && (
        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-gold-soft px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-brand">
          <Cake className="h-3 w-3" /> Comp Wash &amp; Blow included
        </div>
      )}
    </Link>
  );
}

function JourneyPreview({ clientSlug }: { clientSlug: string }) {
  const entries = journeyForClient(clientSlug).slice(0, 2);
  if (entries.length === 0) return null;
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
          Your hair journey
        </div>
        <Link
          href={`/me/${clientSlug}/journey`}
          className="font-mono text-[10px] uppercase tracking-wider text-brand hover:underline"
        >
          View all
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {entries.map((e) => {
          const [start, end] = CATEGORY_PALETTES.braids;
          return (
            <div key={e.id} className="overflow-hidden rounded-xl border border-ink-200 bg-white">
              <div
                className="aspect-square w-full"
                style={
                  e.afterPhoto
                    ? { backgroundImage: `url(${e.afterPhoto})`, backgroundSize: "cover", backgroundPosition: "center" }
                    : { background: `linear-gradient(140deg, ${start}, ${end})` }
                }
              />
              <div className="px-2 py-1.5">
                <div className="truncate text-xs font-medium text-ink-900">{e.serviceName}</div>
                <div className="font-mono text-[9px] text-ink-500">{e.date}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ColdStartWelcome({ client }: { client: Client }) {
  return (
    <section className="space-y-3">
      <div className="rounded-2xl border border-ink-200 bg-white p-5">
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-brand">
          <Sparkles className="h-3 w-3" /> Welcome to Jolieden
        </div>
        <h2 className="mt-2 font-serif text-xl font-semibold text-brand">
          Hey {client.firstName} — let&apos;s find your next look.
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-700">
          Browse photos of finished styles from our gallery, tap any one you love, and we&apos;ll
          pre-fill the details. No long forms.
        </p>
        <Link
          href={`/book?as=${client.slug}`}
          className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Browse the gallery
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="rounded-2xl border border-ink-200 bg-paper p-4">
        <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
          Suggested for you
        </div>
        <p className="mt-1 text-sm text-ink-900">
          Based on what you booked before, try <span className="font-medium text-brand">Honey Balayage</span> with
          Dieynaba D. for your next color refresh.
        </p>
      </div>
    </section>
  );
}

// ───────────────────── page ─────────────────────

export default async function ClientHomePage({
  params,
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;
  const client = resolveClient(clientSlug);
  if (!client) notFound();

  const allAppts = appointmentsForClient(clientSlug);
  const upcoming = allAppts
    .filter((a) => a.date >= TODAY && a.status !== "completed")
    .sort((a, b) => a.date.localeCompare(b.date));
  const nextAppt = upcoming[0];

  const completed = allAppts
    .filter((a) => a.status === "completed")
    .sort((a, b) => b.date.localeCompare(a.date));
  const lastCompleted = completed[0];

  const isBirthdayPersona = clientSlug === CAST.clients.birthday;
  const daysToBday = daysUntilBirthday(client, TODAY);
  const showBirthday = isBirthdayPersona && daysToBday !== null && daysToBday <= 14;

  const isColdStart = clientSlug === CAST.clients.coldStart;
  const isLoyalist = clientSlug === CAST.clients.loyalist;

  return (
    <div className="space-y-5 px-5 py-6">
      {/* Greeting */}
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
          {client.visits > 0 ? `${client.visits} visits` : "New to the salon"}
        </div>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-brand">
          Hi, {client.firstName}
        </h1>
      </header>

      {/* Birthday hero (only on the birthday persona) */}
      {showBirthday && daysToBday !== null && (
        <BirthdayHero daysAway={daysToBday} tier={tierFor(client)} />
      )}

      {/* Upcoming appointment */}
      {nextAppt && (
        <UpcomingApptCard
          appt={nextAppt}
          clientSlug={clientSlug}
          birthdayFlag={(nextAppt.tags || []).includes("Birthday")}
        />
      )}

      {/* Loyalist: rebook your usual */}
      {isLoyalist && lastCompleted && <RebookCard client={client} lastAppt={lastCompleted} />}

      {/* Cold-start: welcome + suggested */}
      {isColdStart && !lastCompleted && <ColdStartWelcome client={client} />}

      {/* Rewards card — every persona */}
      <RewardsCard client={client} slug={clientSlug} />

      {/* Hair journey preview */}
      <JourneyPreview clientSlug={clientSlug} />

      {/* Care tips (light) */}
      <section className="rounded-2xl border border-ink-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Care tips
          </div>
          <Star className="h-4 w-4 text-gold" />
        </div>
        <p className="mt-1 text-sm text-ink-700">
          Sleep on a silk pillowcase to extend the life of your braids by 1–2 weeks.
        </p>
      </section>
    </div>
  );
}
