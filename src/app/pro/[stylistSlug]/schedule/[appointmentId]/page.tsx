import { notFound } from "next/navigation";
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

  return <BookingDetailCard appointmentId={appointmentId} view="stylist" />;
}
