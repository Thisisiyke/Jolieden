// /me/[clientSlug] shell — the client mobile app wrapper. Phone frame on
// desktop, full-width on mobile. Top bar + scrollable body + bottom tab bar.

import { notFound } from "next/navigation";
import { resolveClient } from "@/lib/personas";
import MobileFrame from "@/components/MobileFrame";
import MeTopBar from "@/components/me/MeTopBar";
import MeTabBar from "@/components/me/MeTabBar";

export default async function MeShell({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;
  const client = resolveClient(clientSlug);
  if (!client) notFound();

  return (
    <MobileFrame>
      <MeTopBar client={client} />
      <div className="flex-1 overflow-y-auto bg-paper">{children}</div>
      <MeTabBar clientSlug={clientSlug} />
    </MobileFrame>
  );
}
