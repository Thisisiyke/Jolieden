import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import clsx from "clsx";
import { resolveStylist, appointmentsForStylist } from "@/lib/personas";
import { TODAY, type Appointment, type ApptStatus } from "@/lib/data";

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

function ScheduleCard({
  appt,
  stylistSlug,
}: {
  appt: Appointment;
  stylistSlug: string;
}) {
  return (
    <Link
      href={`/pro/${stylistSlug}/schedule/${appt.id}`}
      className="group flex items-center gap-3 rounded-lg border border-ink-200 bg-white p-3 hover:border-brand"
    >
      <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-md bg-paper px-2 py-1">
        <span className="font-mono text-[9px] uppercase tracking-wider text-ink-500">
          {appt.start.replace(/[^0-9:apm]/g, "")}
        </span>
        {appt.end && (
          <span className="font-mono text-[8px] text-ink-500">— {appt.end.replace(/[^0-9:apm]/g, "")}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={clsx("inline-block h-1.5 w-1.5 rounded-full", STATUS_DOT[appt.status])} />
          <span className="truncate text-sm font-medium text-ink-900">{appt.client}</span>
          {appt.isVip && (
            <span className="rounded bg-gold-soft px-1 font-mono text-[9px] uppercase tracking-wider text-brand">
              VIP
            </span>
          )}
          {(appt.tags || []).includes("Birthday") && (
            <span className="rounded bg-gold-soft px-1 font-mono text-[9px] uppercase tracking-wider text-brand">
              Bday
            </span>
          )}
        </div>
        <div className="truncate text-xs text-ink-500">{appt.service}</div>
      </div>
      <ChevronRight className="h-4 w-4 text-ink-300 group-hover:text-brand" />
    </Link>
  );
}

export default async function StylistScheduleListPage({
  params,
}: {
  params: Promise<{ stylistSlug: string }>;
}) {
  const { stylistSlug } = await params;
  const stylist = resolveStylist(stylistSlug);
  if (!stylist) notFound();

  const appts = appointmentsForStylist(stylistSlug);
  // Group by date.
  const groups = new Map<string, Appointment[]>();
  for (const a of appts) {
    const list = groups.get(a.date) ?? [];
    list.push(a);
    groups.set(a.date, list);
  }
  const sortedDates = Array.from(groups.keys()).sort();

  return (
    <div className="space-y-6 px-5 py-6">
      <header>
        <h1 className="font-serif text-2xl font-semibold text-brand">My schedule</h1>
        <p className="mt-1 text-xs text-ink-500">
          {appts.length} appointment{appts.length === 1 ? "" : "s"} on file.
        </p>
      </header>

      {sortedDates.length === 0 ? (
        <div className="rounded-lg border border-dashed border-ink-300 bg-white p-6 text-center text-xs text-ink-500">
          Nothing on the books.
        </div>
      ) : (
        sortedDates.map((date) => {
          const list = groups.get(date) ?? [];
          list.sort((a, b) => a.start.localeCompare(b.start));
          const isToday = date === TODAY;
          return (
            <section key={date} className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-ink-500">
                <span>{date}</span>
                {isToday && (
                  <span className="rounded bg-brand px-1.5 font-mono text-[9px] uppercase tracking-wider text-white">
                    Today
                  </span>
                )}
              </div>
              {list.map((a) => (
                <ScheduleCard key={a.id} appt={a} stylistSlug={stylistSlug} />
              ))}
            </section>
          );
        })
      )}
    </div>
  );
}
