import { notFound } from "next/navigation";
import { resolveStylist, appointmentsForStylist } from "@/lib/personas";
import TabPlaceholder from "@/components/demo/TabPlaceholder";

export default async function StylistSchedulePage({
  params,
}: {
  params: Promise<{ stylistSlug: string }>;
}) {
  const { stylistSlug } = await params;
  const stylist = resolveStylist(stylistSlug);
  if (!stylist) notFound();

  const appts = appointmentsForStylist(stylistSlug);

  return (
    <TabPlaceholder
      title="My schedule"
      phase="Stub · day + week views land in P4"
      hint={`Vertical day-list of ${stylist.name.split(" ")[0]}'s appointments. ${appts.length} on file across the demo dates. Swipe horizontally for week, tap any block for detail + status advance.`}
    />
  );
}
