import { notFound } from "next/navigation";
import { resolveStylist, CAST } from "@/lib/personas";
import TabPlaceholder from "@/components/demo/TabPlaceholder";

export default async function StylistInboxPage({
  params,
}: {
  params: Promise<{ stylistSlug: string }>;
}) {
  const { stylistSlug } = await params;
  const stylist = resolveStylist(stylistSlug);
  if (!stylist) notFound();

  const isOwner = stylistSlug === CAST.owner;

  return (
    <TabPlaceholder
      title={isOwner ? "All AI conversations" : "Your inbox"}
      phase="Stub · AI takeover queue lands in P7"
      hint={
        isOwner
          ? "Every active SMS thread the AI Concierge is handling, plus the escalation queue. Tap any thread to take over; the AI gracefully hands off mid-conversation."
          : `Threads the AI escalated to ${stylist.name.split(" ")[0]}. Each shows the client, what the AI tried, and why it needed a human. One tap to take over.`
      }
    />
  );
}
