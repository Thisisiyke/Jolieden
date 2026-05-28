import { notFound } from "next/navigation";
import { resolveClient } from "@/lib/personas";
import TabPlaceholder from "@/components/demo/TabPlaceholder";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;
  const client = resolveClient(clientSlug);
  if (!client) notFound();

  return (
    <TabPlaceholder
      title="Profile & preferences"
      phase="Stub · contact details, preferences, opt-ins land in P7"
      hint={`${client.firstName}'s contact details, preferred stylist, hair preferences, scalp accommodations, marketing opt-ins, and saved payment methods. Editable from this tab; changes sync to the operator client profile.`}
    />
  );
}
