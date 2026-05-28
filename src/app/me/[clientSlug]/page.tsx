import { notFound } from "next/navigation";
import { resolveClient, CAST } from "@/lib/personas";
import TabPlaceholder from "@/components/demo/TabPlaceholder";

const isBirthday = (slug: string) => slug === CAST.clients.birthday;
const isLoyalist = (slug: string) => slug === CAST.clients.loyalist;
const isColdStart = (slug: string) => slug === CAST.clients.coldStart;

export default async function ClientHomePage({
  params,
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;
  const client = resolveClient(clientSlug);
  if (!client) notFound();

  const scenario = isBirthday(clientSlug)
    ? "Home tab will show a gold birthday banner with a comp Wash & Blow unlocked. Tap to attach to her next booking. The celebration UI also fires in /pro when she arrives."
    : isLoyalist(clientSlug)
      ? "Returning client home: 'Rebook your usual with Oumou' shortcut at the top, plus quick links to her hair journey and saved styles."
      : isColdStart(clientSlug)
        ? "Newly downloaded the app. Empty home, one welcome card, suggested first booking based on what she searched on the website."
        : "Returning client home — pending phase work to flesh out the layout.";

  return (
    <TabPlaceholder
      title={`Welcome back, ${client.firstName}`}
      phase="Stub · home cards land in P4–P7"
      hint={scenario}
    />
  );
}
