import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
  return (
    <>
      <div className="px-5 pt-4">
        <Link
          href={`/me/${clientSlug}/bookings`}
          className="-ml-1 inline-flex items-center gap-0.5 text-brand hover:text-brand-700"
          aria-label="Back to bookings"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.4} />
          <span className="text-xs font-medium">All bookings</span>
        </Link>
      </div>
      <BookingDetailCard appointmentId={appointmentId} view="client" clientSlug={clientSlug} />
    </>
  );
}
