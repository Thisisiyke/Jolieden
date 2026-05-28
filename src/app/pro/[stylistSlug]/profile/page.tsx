import { notFound } from "next/navigation";
import { resolveStylist } from "@/lib/personas";
import TabPlaceholder from "@/components/demo/TabPlaceholder";

export default async function StylistProfilePage({
  params,
}: {
  params: Promise<{ stylistSlug: string }>;
}) {
  const { stylistSlug } = await params;
  const stylist = resolveStylist(stylistSlug);
  if (!stylist) notFound();

  return (
    <TabPlaceholder
      title="Profile & commissions"
      phase="Stub · profile + earnings dashboard land in P7"
      hint={`${stylist.name}'s bio (visible on /book), specialties, schedule preferences, and a commission dashboard with today / this week / month-to-date earnings.`}
    />
  );
}
