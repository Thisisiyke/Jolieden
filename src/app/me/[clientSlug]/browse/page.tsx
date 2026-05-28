import { notFound } from "next/navigation";
import { resolveClient } from "@/lib/personas";
import TabPlaceholder from "@/components/demo/TabPlaceholder";

export default async function BrowsePage({
  params,
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;
  const client = resolveClient(clientSlug);
  if (!client) notFound();

  return (
    <TabPlaceholder
      title="Browse styles"
      phase="Stub · gallery lands in P5"
      hint={`Photo-first style gallery, same content as the /book site but optimized for in-app browsing. ${client.firstName} can save looks to her wishlist and book the same flow from any photo.`}
    />
  );
}
