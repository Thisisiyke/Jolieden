import { notFound } from "next/navigation";
import { resolveClient } from "@/lib/personas";
import BookingDetailCard from "@/components/booking/BookingDetailCard";

export default async function ClientBookingDetailPage({
  params,
}: {
  params: Promise<{ clientSlug: string; appointmentId: string }>;
}) {
  const { clientSlug, appointmentId } = await params;
  const client = resolveClient(clientSlug);
  if (!client) notFound();

  // We do NOT check the appointment id against the static APPOINTMENTS
  // array here — new bookings made via /book/checkout live only in the
  // Zustand store. BookingDetailCard reads from the store and shows its
  // own "not found" state when the id is unknown.
  return <BookingDetailCard appointmentId={appointmentId} view="client" clientSlug={clientSlug} />;
}
