import { notFound } from "next/navigation";
import { resolveClient } from "@/lib/personas";
import { APPOINTMENTS } from "@/lib/data";
import BookingDetailCard from "@/components/booking/BookingDetailCard";

export default async function ClientBookingDetailPage({
  params,
}: {
  params: Promise<{ clientSlug: string; appointmentId: string }>;
}) {
  const { clientSlug, appointmentId } = await params;
  const client = resolveClient(clientSlug);
  if (!client) notFound();

  // Confirm the appointment belongs to this client (defense in depth).
  const exists = APPOINTMENTS.some(
    (a) => a.id === appointmentId && a.client.toLowerCase() === `${client.firstName} ${client.lastName}`.toLowerCase(),
  );
  if (!exists) notFound();

  return <BookingDetailCard appointmentId={appointmentId} view="client" />;
}
