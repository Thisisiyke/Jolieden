import { notFound } from "next/navigation";
import { resolveClient } from "@/lib/personas";
import { getStyle } from "@/lib/gallery";
import TryOnClient from "@/components/me/TryOnClient";

export default async function TryOnPage({
  params,
}: {
  params: Promise<{ clientSlug: string; styleSlug: string }>;
}) {
  const { clientSlug, styleSlug } = await params;
  const client = resolveClient(clientSlug);
  if (!client) notFound();
  const style = getStyle(styleSlug);
  if (!style) notFound();

  return (
    <TryOnClient
      clientSlug={clientSlug}
      clientFirstName={client.firstName}
      clientLastName={client.lastName}
      avatarHue={client.avatarHue}
      style={style}
    />
  );
}
