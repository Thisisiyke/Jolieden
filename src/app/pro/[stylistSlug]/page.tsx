import { notFound } from "next/navigation";
import { resolveStylist, CAST } from "@/lib/personas";
import PlaceholderShell from "@/components/demo/PlaceholderShell";

export default async function StylistHomePage({
  params,
}: {
  params: Promise<{ stylistSlug: string }>;
}) {
  const { stylistSlug } = await params;
  const stylist = resolveStylist(stylistSlug);
  if (!stylist) notFound();

  const isOwner = stylistSlug === CAST.owner;
  const scenario = isOwner
    ? "Real-time floor view: who's busy, today's revenue ticker, oopsies/repairs, AI conversations awaiting takeover. Diéssou's command center."
    : "Today's schedule, quick-note capture, before/after camera, product-usage log, and the AI takeover queue when clients escalate.";

  return (
    <PlaceholderShell
      surface={`Stylist app · /pro/${stylist.slug}`}
      phase="Stub · mobile shell lands in P3, schedule + tools in P4"
      personaName={stylist.name}
      personaRole={stylist.specialty || stylist.role}
      hint={scenario}
    />
  );
}
