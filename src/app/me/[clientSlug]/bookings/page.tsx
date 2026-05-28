import { notFound } from "next/navigation";
import { resolveClient, appointmentsForClient } from "@/lib/personas";
import TabPlaceholder from "@/components/demo/TabPlaceholder";

export default async function BookingsPage({
  params,
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;
  const client = resolveClient(clientSlug);
  if (!client) notFound();

  const appts = appointmentsForClient(clientSlug);

  return (
    <TabPlaceholder
      title="Your bookings"
      phase="Stub · upcoming + past lists land in P4"
      hint={`${appts.length} appointment${appts.length === 1 ? "" : "s"} on file. The real tab will split into Upcoming (with reschedule + cancel CTAs) and Past (with rebook + leave-review CTAs). Tap any booking to open its detail page.`}
    />
  );
}
