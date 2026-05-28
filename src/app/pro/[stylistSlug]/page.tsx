import { notFound } from "next/navigation";
import { resolveStylist, CAST } from "@/lib/personas";
import TabPlaceholder from "@/components/demo/TabPlaceholder";

export default async function StylistTodayPage({
  params,
}: {
  params: Promise<{ stylistSlug: string }>;
}) {
  const { stylistSlug } = await params;
  const stylist = resolveStylist(stylistSlug);
  if (!stylist) notFound();

  const isOwner = stylistSlug === CAST.owner;
  const hint = isOwner
    ? "Real-time floor view: who's busy, today's revenue ticker, oopsies/repairs, AI conversations awaiting takeover. Diéssou's command center."
    : "Today's tab: next client up, current appointment with quick-note capture, before/after camera, and the takeover queue when clients escalate.";

  return (
    <TabPlaceholder
      title={isOwner ? "Today on the floor" : `Today, ${stylist.name.split(" ")[0]}`}
      phase="Stub · today widgets land in P4–P7"
      hint={hint}
    />
  );
}
