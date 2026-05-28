import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, CalendarHeart, History } from "lucide-react";
import clsx from "clsx";
import { resolveClient, appointmentsForClient } from "@/lib/personas";
import { TODAY, type Appointment, type ApptStatus } from "@/lib/data";

const STATUS_DOT: Record<ApptStatus, string> = {
  unconfirmed: "bg-status-pending",
  confirmed: "bg-status-confirmed",
  walkin: "bg-status-walkin",
  arrived: "bg-status-arrived",
  active: "bg-status-active",
  completed: "bg-status-completed",
};

function ApptCard({
  appt,
  clientSlug,
}: {
  appt: Appointment;
  clientSlug: string;
}) {
  return (
    <Link
      href={`/me/${clientSlug}/bookings/${appt.id}`}
      className="group flex items-center gap-3 rounded-lg border border-ink-200 bg-white p-3 hover:border-brand"
    >
      <div className="flex flex-col items-center justify-center rounded-md bg-paper px-2 py-1 font-mono text-[10px] text-ink-700">
        <span className="uppercase tracking-wider">{appt.date.slice(5, 7)}/{appt.date.slice(8)}</span>
        <span className="font-medium text-ink-900">{appt.start.replace(/(am|pm)/, "")}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={clsx("inline-block h-1.5 w-1.5 rounded-full", STATUS_DOT[appt.status])} />
          <span className="truncate text-sm font-medium text-ink-900">{appt.service}</span>
        </div>
        <div className="truncate text-xs text-ink-500">with {appt.staff || "—"}</div>
      </div>
      <ChevronRight className="h-4 w-4 text-ink-300 group-hover:text-brand" />
    </Link>
  );
}

export default async function ClientBookingsListPage({
  params,
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;
  const client = resolveClient(clientSlug);
  if (!client) notFound();

  const appts = appointmentsForClient(clientSlug);
  const upcoming = appts
    .filter((a) => a.date >= TODAY && a.status !== "completed")
    .sort((a, b) => a.date.localeCompare(b.date));
  const past = appts
    .filter((a) => a.date < TODAY || a.status === "completed")
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6 px-5 py-6">
      <header>
        <h1 className="font-serif text-2xl font-semibold text-brand">Your bookings</h1>
        <p className="mt-1 text-xs text-ink-500">{client.firstName}&apos;s upcoming and past visits.</p>
      </header>

      <section className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-ink-500">
          <CalendarHeart className="h-3.5 w-3.5" /> Upcoming
        </div>
        {upcoming.length === 0 ? (
          <div className="rounded-lg border border-dashed border-ink-300 bg-white p-4 text-center text-xs text-ink-500">
            Nothing booked yet.{" "}
            <Link href={`/book?as=${clientSlug}`} className="text-brand underline">
              Book a visit
            </Link>
          </div>
        ) : (
          upcoming.map((a) => <ApptCard key={a.id} appt={a} clientSlug={clientSlug} />)
        )}
      </section>

      <section className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-ink-500">
          <History className="h-3.5 w-3.5" /> Past
        </div>
        {past.length === 0 ? (
          <div className="rounded-lg border border-dashed border-ink-300 bg-white p-4 text-center text-xs text-ink-500">
            No prior visits — yet.
          </div>
        ) : (
          past.slice(0, 8).map((a) => <ApptCard key={a.id} appt={a} clientSlug={clientSlug} />)
        )}
      </section>
    </div>
  );
}
