import Link from "next/link";
import { notFound } from "next/navigation";
import { Camera } from "lucide-react";
import { resolveStylist } from "@/lib/personas";
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
  if (!appt || appt.staff !== stylist.name) notFound();

  return (
    <>
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
