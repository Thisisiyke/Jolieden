import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import clsx from "clsx";
import { resolveStylist, appointmentsForStylist, CAST } from "@/lib/personas";
import { APPOINTMENTS, TODAY, type Appointment, type ApptStatus } from "@/lib/data";

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
  showStaffName,
}: {
  appt: Appointment;
  stylistSlug: string;
  showStaffName?: boolean;
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
        <div className="truncate text-xs text-ink-500">
          {appt.service}
          {showStaffName && appt.staff && (
            <span className="font-mono text-[10px] text-ink-400"> · {appt.staff}</span>
          )}
        </div>
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

  // Owner sees salon-wide; everyone else sees their own.
  const isOwner = stylistSlug === CAST.owner;
  const appts: Appointment[] = isOwner ? APPOINTMENTS : appointmentsForStylist(stylistSlug);

  // Group by date.
  const groups = new Map<string, Appointment[]>();
  for (const a of appts) {
    const list = groups.get(a.date) ?? [];
    list.push(a);
    groups.set(a.date, list);
  }
  const sortedDates = Array.from(groups.keys()).sort();

  // Show today + future first; past dates collapsed at end.
  const futureDates = sortedDates.filter((d) => d >= TODAY);
  const pastDates = sortedDates.filter((d) => d < TODAY).reverse();

  return (
    <div className="space-y-6 px-5 py-6">
      <header>
        <h1 className="font-serif text-2xl font-semibold text-brand">
          {isOwner ? "Salon schedule" : "My schedule"}
        </h1>
        <p className="mt-1 text-xs text-ink-500">
          {isOwner
            ? `${appts.length} appointments across all stylists.`
            : `${appts.length} appointment${appts.length === 1 ? "" : "s"} on file.`}
        </p>
      </header>

      {sortedDates.length === 0 ? (
        <div className="rounded-lg border border-dashed border-ink-300 bg-white p-6 text-center text-xs text-ink-500">
          {isOwner ? "Empty schedule." : "Nothing on the books."}
        </div>
      ) : (
        <>
          {[...futureDates, ...pastDates].map((date) => {
            const list = groups.get(date) ?? [];
            list.sort((a, b) => a.start.localeCompare(b.start));
            const isToday = date === TODAY;
            const isPast = date < TODAY;
            return (
              <section key={date} className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-ink-500">
                  <span>{date}</span>
                  {isToday && (
                    <span className="rounded bg-brand px-1.5 font-mono text-[9px] uppercase tracking-wider text-white">
                      Today
                    </span>
                  )}
                  {isPast && !isToday && (
                    <span className="rounded bg-ink-200 px-1.5 font-mono text-[9px] uppercase tracking-wider text-ink-600">
                      Past
                    </span>
                  )}
                </div>
                {list.map((a) => (
                  <ScheduleCard
                    key={a.id}
                    appt={a}
                    stylistSlug={stylistSlug}
                    showStaffName={isOwner}
                  />
                ))}
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}
