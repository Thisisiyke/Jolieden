import { notFound } from "next/navigation";
import { resolveStylist } from "@/lib/personas";
import TabPlaceholder from "@/components/demo/TabPlaceholder";

export default async function StylistClientsPage({
  params,
}: {
  params: Promise<{ stylistSlug: string }>;
}) {
  const { stylistSlug } = await params;
  const stylist = resolveStylist(stylistSlug);
  if (!stylist) notFound();

  return (
    <TabPlaceholder
      title="My clients"
      phase="Stub · client list lands in P4"
      hint={`Clients ${stylist.name.split(" ")[0]} has serviced — their preferences, last looks, allergies, scalp notes, and quick rebook. Tap any client to open their hair journey + booking history.`}
    />
  );
}
