import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  Bot,
  Calendar as CalendarIcon,
  ChevronRight,
  Sparkles,
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
          <MetricCard label="Appts today" value={todayAppts.length} hint="Booked & walk-ins" href="/calendar" />
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
