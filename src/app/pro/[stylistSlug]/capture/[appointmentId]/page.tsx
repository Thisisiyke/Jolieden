import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { resolveStylist } from "@/lib/personas";
import { APPOINTMENTS } from "@/lib/data";
import CaptureClient from "@/components/pro/CaptureClient";

export default async function CapturePage({
  params,
}: {
  params: Promise<{ stylistSlug: string; appointmentId: string }>;
}) {
  const { stylistSlug, appointmentId } = await params;
  const stylist = resolveStylist(stylistSlug);
  if (!stylist) notFound();
  const appt = APPOINTMENTS.find((a) => a.id === appointmentId);
  if (!appt) notFound();

  return (
    <div className="space-y-5 px-4 py-5">
      <header className="flex items-center gap-2">
        <Link
          href={`/pro/${stylistSlug}/schedule/${appointmentId}`}
          className="-ml-1 flex items-center gap-0.5 text-brand"
          aria-label="Back to booking"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            📸 Hair journey capture
          </div>
          <h1 className="truncate font-serif text-[24px] font-semibold leading-tight text-ink-900">
            {appt.client}
          </h1>
        </div>
      </header>

      <section className="rounded-2xl border border-ink-200 bg-white p-4">
        <div className="text-xs font-medium uppercase tracking-wider text-ink-500">
          Today&apos;s service
        </div>
        <div className="mt-1 text-sm font-semibold text-ink-900">{appt.service}</div>
        {appt.serviceDetail && (
          <div className="mt-0.5 text-xs text-ink-500">{appt.serviceDetail}</div>
        )}
      </section>

      <CaptureClient
        stylistSlug={stylistSlug}
        appointmentId={appointmentId}
        clientName={appt.client}
        serviceName={appt.service || "Visit"}
        defaultStylistName={appt.staff || stylist.name}
      />
    </div>
  );
}
