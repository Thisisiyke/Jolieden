import { notFound } from "next/navigation";
import { resolveClient } from "@/lib/personas";
import PlaceholderShell from "@/components/demo/PlaceholderShell";

export default async function ClientJourneyPage({
  params,
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;
  const client = resolveClient(clientSlug);
  if (!client) notFound();

  return (
    <PlaceholderShell
      surface={`Client app · /me/${client.slug}/journey`}
      phase="Stub · timeline + photo grid land in P6 (seed)"
      personaName={`${client.firstName} ${client.lastName}`}
      personaRole={`${client.visits} prior visits`}
      hint="Visual timeline of every past look, with before/after photos (when captured) and the stylist + service that produced it. Tap any entry to rebook the same look. Aaliyah gets 5–6 seeded entries to demo this."
    />
  );
}
