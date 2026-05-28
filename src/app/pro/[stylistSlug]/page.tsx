import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  Bot,
  Calendar as CalendarIcon,
  ChevronRight,
  Sparkles,
  Trophy,
  Target,
  Users as UsersIcon,
} from "lucide-react";
import {
  resolveStylist,
  appointmentsForStylist,
  CAST,
} from "@/lib/personas";
import { escalationsForStylist } from "@/lib/aiInbox";
import { APPOINTMENTS, TODAY, type Appointment, type ApptStatus } from "@/lib/data";
import clsx from "clsx";

const STATUS_DOT: Record<ApptStatus, string> = {
  unconfirmed: "bg-status-pending",
  confirmed: "bg-status-confirmed",
  walkin: "bg-status-walkin",
  arrived: "bg-status-arrived",
  active: "bg-status-active",
  completed: "bg-status-completed",
  cancelled: "bg-rose-500",
  noshow: "bg-rose-500",
};

const fmtCurrency = (n: number) => `$${n.toLocaleString("en-US")}`;

function MetricCard({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
}) {
  const body = (
    <>
      <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">{label}</div>
      <div className="mt-1 font-serif text-2xl font-semibold text-brand">{value}</div>
      {hint && <div className="mt-0.5 font-mono text-[10px] text-ink-500">{hint}</div>}
    </>
  );
  return href ? (
    <Link href={href} className="block rounded-xl border border-ink-200 bg-white p-3 hover:border-brand">
      {body}
    </Link>
  ) : (
    <div className="rounded-xl border border-ink-200 bg-white p-3">{body}</div>
  );
}

function NextUpCard({ appt, slug }: { appt: Appointment; slug: string }) {
  return (
    <Link
      href={`/pro/${slug}/schedule/${appt.id}`}
      className="block rounded-2xl border border-brand/30 bg-white p-4 hover:border-brand"
    >
      <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-brand">
        <CalendarIcon className="h-3 w-3" /> Next up · {appt.start}
      </div>
      <h3 className="mt-1 text-base font-semibold text-ink-900">{appt.client}</h3>
      <p className="mt-0.5 text-xs text-ink-700">{appt.service}</p>
      <div className="mt-2 flex items-center gap-2 text-xs text-ink-500">
        <span className={clsx("inline-block h-1.5 w-1.5 rounded-full", STATUS_DOT[appt.status])} />
        <span className="capitalize">{appt.status}</span>
        {appt.numVisits !== undefined && appt.numVisits > 0 && (
          <>
            <span className="text-ink-300">·</span>
            <span>
              {appt.numVisits} prior visits
            </span>
          </>
        )}
      </div>
    </Link>
  );
}

export default async function StylistTodayPage({
  params,
}: {
  params: Promise<{ stylistSlug: string }>;
}) {
  const { stylistSlug } = await params;
  const stylist = resolveStylist(stylistSlug);
  if (!stylist) notFound();

  const isOwner = stylistSlug === CAST.owner;
  const myAppts = appointmentsForStylist(stylistSlug);
  const myToday = myAppts.filter((a) => a.date === TODAY).sort((a, b) => a.start.localeCompare(b.start));
  const todayAppts = APPOINTMENTS.filter((a) => a.date === TODAY);

  const escalations = escalationsForStylist(stylistSlug);
  const top2 = escalations.slice(0, 2);

  const activeCount = todayAppts.filter((a) => a.status === "active").length;
  const arrivedCount = todayAppts.filter((a) => a.status === "arrived").length;
  const completedToday = todayAppts.filter((a) => a.status === "completed");
  const mockRevenueToday = completedToday.reduce((acc, a) => acc + (a.price ?? 0), 0);

  const nextAppt = myToday.find((a) => a.status === "confirmed" || a.status === "arrived" || a.status === "active");

  if (isOwner) {
    return (
      <div className="space-y-5 px-5 py-6">
        <header>
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">{TODAY}</div>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-brand">Today on the floor</h1>
          <p className="mt-1 text-xs text-ink-500">
            Floor pulse. Tap a tile to dive in.
          </p>
        </header>

        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label="Appts today"
            value={todayAppts.length}
            hint="Booked & walk-ins"
            href={`/pro/${stylistSlug}/schedule`}
          />
          <MetricCard label="On the chair" value={activeCount} hint={`${arrivedCount} arrived`} />
          <MetricCard
            label="AI inbox"
            value={escalations.length}
            hint="Awaiting takeover"
            href={`/pro/${stylistSlug}/inbox`}
          />
          <MetricCard
            label="Revenue today"
            value={fmtCurrency(mockRevenueToday)}
            hint={`${completedToday.length} services`}
          />
        </div>

        {top2.length > 0 && (
          <section>
            <div className="mb-2 flex items-center justify-between">
              <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
                AI escalations
              </div>
              <Link
                href={`/pro/${stylistSlug}/inbox`}
                className="font-mono text-[10px] uppercase tracking-wider text-brand hover:underline"
              >
                See all
              </Link>
            </div>
            <ul className="space-y-2">
              {top2.map((e) => (
                <li key={e.id} className="rounded-xl border border-ink-200 bg-white p-3">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="truncate text-sm font-medium text-ink-900">{e.clientName}</h4>
                    <span className="font-mono text-[9px] text-ink-500">{e.receivedAt}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-ink-700">
                    <Sparkles className="mr-1 inline h-3 w-3 text-brand" />
                    {e.aiSummary}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Salon-wide WEEKLY goal — ladders into Employee of the Month
            bonus per Diéssou's "Weekly Goals" Must-Have. */}
        <section className="overflow-hidden rounded-2xl border border-brand/30 bg-gradient-to-br from-brand to-brand-700 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-white/80">
              <Target className="h-3 w-3" /> 🏆 Weekly goal · Apr 13–19
            </div>
            <span className="font-mono text-[10px] text-white/80">
              $18,200 / $22,000
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-gold"
              style={{ width: `${Math.round((18200 / 22000) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-white/90">
            83% to hit. Friday + Saturday usually cover the gap. Top earner this week unlocks the
            Employee of the Month bonus.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="rounded-full bg-white/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider">
              Leader · Oumou
            </span>
            <span className="rounded-full bg-white/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider">
              $4,820
            </span>
          </div>
        </section>

        {/* Salon-wide daily goals */}
        <section className="rounded-2xl border border-ink-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-brand">
              <Target className="h-3 w-3" /> 🎯 Daily goal
            </div>
            <span className="font-mono text-[10px] text-ink-500">
              {fmtCurrency(mockRevenueToday)} / $3,500
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-paper">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand to-gold"
              style={{ width: `${Math.min(100, Math.round((mockRevenueToday / 3500) * 100))}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-ink-700">
            {Math.max(0, 3500 - mockRevenueToday) > 0
              ? `$${3500 - mockRevenueToday} to hit today's revenue goal. ${arrivedCount + activeCount} clients still in the salon.`
              : "Today's goal already met. Anything past this is bonus."}
          </p>
        </section>

        {/* Employee of the Month */}
        <section className="overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-br from-gold-soft via-paper to-brand-50 p-4">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-brand">
            <Trophy className="h-3 w-3" /> 🏆 Employee of the month · April
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-base font-semibold text-white">
              OD
            </div>
            <div className="min-w-0">
              <div className="text-base font-semibold text-ink-900">Oumou D.</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
                42 services · 96% rebook rate · 4.97 avg
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-ink-200 bg-paper p-4">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-brand">
            <UsersIcon className="h-3 w-3" /> Floor map · stylist status
          </div>
          <p className="mt-2 text-xs text-ink-700">
            Live presence + chair status renders here when wired to the operator app&apos;s arrived/active flags.
            Current snapshot: <strong className="text-ink-900">{arrivedCount + activeCount}</strong> clients in the salon right now.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-5 px-5 py-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
          Today · {TODAY}
        </div>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-brand">
          Hi, {stylist.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-xs text-ink-500">
          {myToday.length === 0
            ? "Nothing scheduled today — enjoy the slow day."
            : `${myToday.length} client${myToday.length === 1 ? "" : "s"} on the books.`}
        </p>
      </header>

      {nextAppt && <NextUpCard appt={nextAppt} slug={stylistSlug} />}

      {/* Personal WEEKLY goal — ladders into EotM bonus */}
      <section className="overflow-hidden rounded-2xl border border-brand/30 bg-gradient-to-br from-brand to-brand-700 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-white/80">
            <Target className="h-3 w-3" /> 🏆 Weekly goal · Apr 13–19
          </div>
          <span className="font-mono text-[10px] text-white/80">$3,820 / $4,500</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full bg-gold" style={{ width: "85%" }} />
        </div>
        <p className="mt-2 text-xs text-white/90">
          85% there. 3 more services hits goal + the bonus. You&apos;re #1 on the salon
          leaderboard this week.
        </p>
      </section>

      {/* Personal daily goal */}
      <section className="rounded-2xl border border-ink-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-brand">
            <Target className="h-3 w-3" /> 🎯 Today&apos;s goal
          </div>
          <span className="font-mono text-[10px] text-ink-500">
            {myToday.filter((a) => a.status === "completed").length} / {Math.max(myToday.length, 3)} services
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-paper">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand to-gold"
            style={{
              width: `${Math.min(100, (myToday.filter((a) => a.status === "completed").length / Math.max(myToday.length, 3)) * 100)}%`,
            }}
          />
        </div>
        <p className="mt-2 text-xs text-ink-700">
          Stay on pace for today&apos;s commission target. Quick-add a walk-in if you have a gap.
        </p>
      </section>

      {/* Today schedule preview */}
      {myToday.length > 0 && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
              Today
            </div>
            <Link
              href={`/pro/${stylistSlug}/schedule`}
              className="font-mono text-[10px] uppercase tracking-wider text-brand hover:underline"
            >
              View week
            </Link>
          </div>
          <ul className="space-y-2">
            {myToday.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/pro/${stylistSlug}/schedule/${a.id}`}
                  className="flex items-center gap-3 rounded-lg border border-ink-200 bg-white p-3 hover:border-brand"
                >
                  <div className="w-14 shrink-0 font-mono text-xs text-ink-700">
                    {a.start}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={clsx("inline-block h-1.5 w-1.5 rounded-full", STATUS_DOT[a.status])} />
                      <span className="truncate text-sm font-medium text-ink-900">{a.client}</span>
                    </div>
                    <div className="truncate text-xs text-ink-500">{a.service}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-ink-300" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* AI inbox preview */}
      {top2.length > 0 && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-brand">
              <Bot className="h-3 w-3" /> AI escalated to you
            </div>
            <Link
              href={`/pro/${stylistSlug}/inbox`}
              className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-brand hover:underline"
            >
              Open inbox
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="space-y-2">
            {top2.map((e) => (
              <li key={e.id} className="rounded-xl border border-ink-200 bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="truncate text-sm font-medium text-ink-900">{e.clientName}</h4>
                  <span className="font-mono text-[9px] text-ink-500">{e.receivedAt}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-ink-700">{e.aiSummary}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
