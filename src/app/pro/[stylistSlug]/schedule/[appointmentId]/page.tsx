import Link from "next/link";
import { notFound } from "next/navigation";
import { Camera, ArrowLeft } from "lucide-react";
import { resolveStylist, CAST } from "@/lib/personas";
import { APPOINTMENTS } from "@/lib/data";
import BookingDetailCard from "@/components/booking/BookingDetailCard";

export default async function StylistAppointmentDetailPage({
  params,
}: {
  params: Promise<{ stylistSlug: string; appointmentId: string }>;
}) {
  const { stylistSlug, appointmentId } = await params;
  const stylist = resolveStylist(stylistSlug);
  if (!stylist) notFound();

  const appt = APPOINTMENTS.find((a) => a.id === appointmentId);
  // Owner (Diéssou) can view any appointment. Stylists only see their own.
  const isOwner = stylistSlug === CAST.owner;
  if (!appt || (!isOwner && appt.staff !== stylist.name)) notFound();

  return (
    <>
      <div className="px-5 pt-4">
        <Link
          href={`/pro/${stylistSlug}/schedule`}
          className="-ml-1 inline-flex items-center gap-0.5 text-brand hover:text-brand-700"
          aria-label="Back to schedule"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.4} />
          <span className="text-xs font-medium">Schedule</span>
        </Link>
      </div>
      <BookingDetailCard appointmentId={appointmentId} view="stylist" />
      <div className="px-5 pb-6">
        <Link
          href={`/pro/${stylistSlug}/capture/${appointmentId}`}
          className="flex w-full items-center justify-center gap-1.5 rounded-md border border-brand bg-white py-2.5 text-sm font-semibold text-brand hover:bg-brand hover:text-white"
        >
          <Camera className="h-3.5 w-3.5" /> Open before/after capture
        </Link>
      </div>
    </>
  );
}
