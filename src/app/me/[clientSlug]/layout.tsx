// /me/[clientSlug] shell — the client mobile app wrapper. iPhone frame on
// desktop, full-width on mobile. iOS-style nav bar + scrollable body +
// bottom tab bar all sized to fill the phone screen.

import { notFound } from "next/navigation";
import { resolveClient } from "@/lib/personas";
import MobileFrame from "@/components/MobileFrame";
import MobileSplash from "@/components/MobileSplash";
import MeTopBar from "@/components/me/MeTopBar";
import MeTabBar from "@/components/me/MeTabBar";
import AssistanceFab from "@/components/me/AssistanceFab";

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
      <MobileSplash kind="me" />
      <MeTopBar client={client} unreadCount={2} />
      <main className="min-h-0 flex-1 overflow-y-auto bg-paper">{children}</main>
      <MeTabBar clientSlug={clientSlug} />
      <AssistanceFab />
    </MobileFrame>
  );
}
