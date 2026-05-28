import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Cake,
  Calendar,
  ChevronRight,
  Gift,
  QrCode,
  RefreshCcw,
  Sparkles,
  Trophy,
  CalendarClock,
} from "lucide-react";
import {
  resolveClient,
  appointmentsForClient,
  journeyForClient,
  getCastStylists,
  CAST,
} from "@/lib/personas";
import {
  CATEGORY_PALETTES,
  popularStyles,
  stylesByStylist,
  type Style,
} from "@/lib/gallery";
import { TODAY, type Appointment, type Client } from "@/lib/data";
import { pointsFor, tierFor, nextTierFor } from "@/lib/rewards";
import HeroCarousel, { type HeroCard } from "@/components/me/HeroCarousel";
import PhotoRow from "@/components/me/PhotoRow";
import StylistSpotlight from "@/components/me/StylistSpotlight";

// ───────────────────── birthday helpers ─────────────────────

function daysUntilBirthday(client: Client, today: string): number | null {
  if (!client.birthdayMonth) return null;
  const day = client.birthdayDay ?? 1;
  const [ty, tm, td] = today.split("-").map((n) => parseInt(n, 10));
  let bdate = new Date(ty, client.birthdayMonth - 1, day);
  const todayDate = new Date(ty, tm - 1, td);
  if (bdate < todayDate) bdate = new Date(ty + 1, client.birthdayMonth - 1, day);
  const diff = Math.round((bdate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

// ───────────────────── hero card builder ─────────────────────

function buildHeroCards(
  client: Client,
  slug: string,
  showBirthday: boolean,
  daysToBday: number | null,
  featuredPhoto?: string,
): HeroCard[] {
  const cards: HeroCard[] = [];
  if (showBirthday && daysToBday !== null) {
    cards.push({
      id: "h-birthday",
      href: `/me/${slug}#birthday`,
      eyebrow: "Birthday week",
      title:
        daysToBday === 0
          ? "Happy birthday 🎉"
          : daysToBday === 1
            ? "1 day to your birthday"
            : `${daysToBday} days to your birthday`,
      description: "A comp Wash & Blow + bonus points are waiting at check-in.",
      tone: "birthday",
    });
  }
  cards.push({
    id: "h-feature",
    href: "/book?category=braids",
    eyebrow: "Trending this week",
    title: "Bora Bora Boho",
    description: "Oumou's signature boho knotless — mid-back, free part, honey accents.",
    tone: "feature",
    backgroundImage: featuredPhoto,
  });
  cards.push({
    id: "h-refer",
    href: `/me/${slug}/rewards`,
    eyebrow: "Refer & earn",
    title: "Bring a friend, both get 100 pts",
    description: "Drops into your rewards as soon as they finish their first visit.",
    tone: "refer",
  });
  cards.push({
    id: "h-concierge",
    href: "/demo/sms",
    eyebrow: "AI SMS Concierge",
    title: "Text us anything, anytime",
    description: "Booking changes, prep questions, lost items — answered in seconds.",
    tone: "concierge",
  });
  return cards;
}

// ───────────────────── sub-components ─────────────────────

function BirthdayHero({ daysAway, tier }: { daysAway: number; tier: string }) {
  const gifts: { label: string; sub?: string }[] = [
    { label: "Comp Wash & Blow", sub: "Auto-applied at check-in" },
    { label: "200 bonus points", sub: "Drops in 24h before your visit" },
  ];
  if (tier === "Platinum" || tier === "Gold") {
    gifts.push({ label: "Hand-written card from Diéssou", sub: "Mailed to you" });
  }
  return (
    <section
      id="birthday"
      className="relative overflow-hidden rounded-2xl border border-gold/50 bg-gradient-to-br from-gold-soft via-paper to-brand-50 p-5"
    >
      <div className="absolute right-4 top-4 text-gold/60">
        <Sparkles className="h-6 w-6" />
      </div>
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-brand">
        <Cake className="h-3.5 w-3.5" /> 🎂 Birthday week · {tier} tier
      </div>
      <h2 className="mt-2 font-serif text-2xl font-semibold text-brand">
        {daysAway === 0 ? "Happy birthday!" : daysAway === 1 ? "1 day away" : `${daysAway} days away`}
      </h2>
      <ul className="mt-4 space-y-2">
        {gifts.map((g, i) => (
          <li key={i} className="flex items-start gap-3 rounded-lg border border-gold/40 bg-white/70 p-2.5">
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

function UpcomingApptCard({
  appt,
  clientSlug,
  birthdayFlag,
}: {
  appt: Appointment;
  clientSlug: string;
  birthdayFlag?: boolean;
}) {
  const todayLike = appt.date <= TODAY;
  return (
    <section className="overflow-hidden rounded-2xl border border-brand/30 bg-white shadow-sm">
      <Link href={`/me/${clientSlug}/bookings/${appt.id}`} className="block px-4 pt-4 pb-3 hover:bg-paper">
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-brand">
          <Calendar className="h-3 w-3" /> Upcoming
        </div>
        <h3 className="mt-1 text-base font-semibold text-ink-900">{appt.service}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-ink-700">
          <span>{appt.date}</span>
          <span className="text-ink-300">·</span>
          <span>{appt.start}</span>
          {appt.staff && (
            <>
              <span className="text-ink-300">·</span>
              <span>with {appt.staff}</span>
            </>
          )}
        </div>
        {birthdayFlag && (
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-gold-soft px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-brand">
            <Cake className="h-3 w-3" /> Comp Wash & Blow included
          </div>
        )}
      </Link>
      <Link
        href={`/me/${clientSlug}/checkin`}
        className="flex items-center justify-center gap-1.5 border-t border-ink-200 bg-brand py-2.5 text-xs font-semibold text-white hover:bg-brand-700"
      >
        <QrCode className="h-3.5 w-3.5" />
        {todayLike ? "Check in now" : "Open check-in QR"}
      </Link>
    </section>
  );
}

function RebookCard({ client, lastAppt }: { client: Client; lastAppt: Appointment }) {
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
          {lastAppt.staff ? `with ${lastAppt.staff}` : ""}
        </p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-ink-300 group-hover:text-brand" />
    </Link>
  );
}

function RewardsCard({ client, slug }: { client: Client; slug: string }) {
  const points = pointsFor(client);
  const tier = tierFor(client);
  const next = nextTierFor(client);
  const progress = next
    ? Math.min(100, Math.max(5, Math.round(((next.min - next.pointsToGo) / next.min) * 100)))
    : 100;
  return (
    <Link
      href={`/me/${slug}/rewards`}
      className="group block overflow-hidden rounded-2xl border border-ink-200 bg-gradient-to-br from-brand via-brand-700 to-[#2a0e16] text-white shadow-sm hover:shadow-md"
    >
      <div className="flex items-center gap-3 px-4 pt-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
          <Trophy className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] uppercase tracking-wider text-white/70">
            🎁 {tier} member
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-2xl font-semibold tabular-nums">
              {points.toLocaleString("en-US")}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-white/70">
              points
            </span>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-white/60 group-hover:text-white" />
      </div>
      {next && (
        <div className="px-4 pb-4 pt-3">
          <div className="flex items-center justify-between text-[10px] text-white/80">
            <span>{next.pointsToGo} pts to {next.tier}</span>
            <span className="font-mono">{progress}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-gold" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </Link>
  );
}

function ColdStartWelcome({ client }: { client: Client }) {
  return (
    <section className="space-y-3 rounded-2xl border border-ink-200 bg-white p-5">
      <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-brand">
        <Sparkles className="h-3 w-3" /> ✨ Welcome to Jolieden
      </div>
      <h2 className="font-serif text-xl font-semibold text-brand">
        Hey {client.firstName} — let&apos;s find your next look.
      </h2>
      <p className="text-sm leading-relaxed text-ink-700">
        Browse photos of finished styles, tap any you love, and we&apos;ll pre-fill the rest. No long forms.
      </p>
      <Link
        href={`/book?as=${client.slug}`}
        className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Browse the gallery
        <ChevronRight className="h-4 w-4" />
      </Link>
    </section>
  );
}

// ───────────────────── page ─────────────────────

// Parses "Every 8 wks" → 8. Returns null if unparseable.
function parseWeeks(freq?: string): number | null {
  if (!freq) return null;
  const m = freq.match(/(\d+)\s*wk/i);
  return m ? parseInt(m[1], 10) : null;
}

function formatPretty(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// Returns the recommended next-visit date as a friendly string, or null if
// we don't have enough info to recommend.
function nextRecommendedVisit(lastAppt?: Appointment): { date: string; weeks: number } | null {
  if (!lastAppt) return null;
  const weeks = parseWeeks(lastAppt.avgFrequency) || 8; // default 8wks for braids
  const last = new Date(lastAppt.date + "T00:00:00");
  const next = new Date(last);
  next.setDate(next.getDate() + weeks * 7);
  // If next is already in the past, skip the banner.
  if (next < new Date(TODAY + "T00:00:00")) return null;
  return { date: formatPretty(next), weeks };
}

function NextVisitCard({
  client,
  rec,
}: {
  client: Client;
  rec: { date: string; weeks: number };
}) {
  return (
    <Link
      href={`/book?as=${client.slug}`}
      className="group flex items-center gap-3 rounded-2xl border border-ink-200 bg-gradient-to-br from-paper to-brand-50 p-4 hover:border-brand"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
        <CalendarClock className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[10px] uppercase tracking-wider text-brand">
          📅 Time for your next visit
        </div>
        <div className="mt-0.5 text-sm font-semibold text-ink-900">
          Recommended: {rec.date}
        </div>
        <div className="font-mono text-[10px] text-ink-500">
          {rec.weeks} wks from your last · matches your usual rhythm
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-ink-300 group-hover:text-brand" />
    </Link>
  );
}

function pickInspirations(client: Client, allStyles: Style[]): Style[] {
  // Try preferred stylist's work first; fall back to most-popular.
  if (client.preferredStylistSlug) {
    const fromStylist = stylesByStylist(client.preferredStylistSlug);
    if (fromStylist.length >= 4) return fromStylist.slice(0, 6);
  }
  return allStyles.slice(0, 6);
}

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

  const popular = popularStyles();
  const inspirations = pickInspirations(client, popular);
  const trending = popular.slice(0, 6);

  // Compute next-visit recommendation from the most recent completed visit.
  const nextVisitRec = nextRecommendedVisit(lastCompleted);

  const featuredPhoto = popular[0]?.photoUrl;
  const heroCards = buildHeroCards(client, clientSlug, showBirthday, daysToBday, featuredPhoto);

  // Stylist spotlight rotates between cast stylists based on the day of the
  // demo TODAY constant (stable per build, varies per persona).
  const castStylists = getCastStylists();
  const dayIdx = parseInt(TODAY.slice(-2), 10) % castStylists.length;
  const spotlight = client.preferredStylistSlug
    ? castStylists.find((s) => s.slug === client.preferredStylistSlug) ?? castStylists[dayIdx]
    : castStylists[dayIdx];

  const recentJourney = journeyForClient(clientSlug).slice(0, 1)[0];

  return (
    <div className="space-y-5 px-4 pb-6 pt-4">
      {/* Greeting */}
      <header className="px-1">
        <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
          {client.visits > 0 ? `${client.visits} visits · welcome back` : "✨ Welcome"}
        </div>
        <h1 className="mt-0.5 font-serif text-[26px] font-semibold leading-tight text-ink-900">
          Hi, {client.firstName}
        </h1>
      </header>

      {/* Hero carousel */}
      <HeroCarousel cards={heroCards} />

      {/* Upcoming appointment + check-in CTA */}
      {nextAppt && (
        <UpcomingApptCard
          appt={nextAppt}
          clientSlug={clientSlug}
          birthdayFlag={(nextAppt.tags || []).includes("Birthday")}
        />
      )}

      {/* Birthday hero (Naomi only, in addition to the carousel card) */}
      {showBirthday && daysToBday !== null && (
        <BirthdayHero daysAway={daysToBday} tier={tierFor(client)} />
      )}

      {/* Loyalist: rebook your usual */}
      {isLoyalist && lastCompleted && <RebookCard client={client} lastAppt={lastCompleted} />}

      {/* Cold-start: welcome */}
      {isColdStart && !lastCompleted && <ColdStartWelcome client={client} />}

      {/* Next-visit reminder — appears when client has a completed visit
          and the recommended next date is in the future. */}
      {nextVisitRec && <NextVisitCard client={client} rec={nextVisitRec} />}

      {/* Rewards card */}
      <RewardsCard client={client} slug={clientSlug} />

      {/* Inspired by you */}
      <PhotoRow
        title={recentJourney ? `Like your last ${recentJourney.serviceName.toLowerCase()}` : "Picked for you"}
        eyebrow="✨ Inspired by your style"
        styles={inspirations}
        seeAllHref="/book"
      />

      {/* Stylist spotlight */}
      {spotlight && <StylistSpotlight stylist={spotlight} />}

      {/* Trending */}
      <PhotoRow
        title="Trending this month"
        eyebrow="🔥 Most booked at Jolieden"
        styles={trending}
        seeAllHref="/book"
      />

      {/* Care tip — keep small */}
      <section className="rounded-2xl border border-ink-200 bg-paper p-4">
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-brand">
          💡 Care tip
        </div>
        <p className="mt-1 text-sm text-ink-700">
          Sleep on a silk pillowcase to extend the life of your braids by 1–2 weeks.
        </p>
      </section>
    </div>
  );
}
