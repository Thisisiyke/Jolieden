// /pro/[stylistSlug] shell — the stylist mobile app wrapper. iPhone frame
// on desktop, full-width on mobile. iOS-style nav bar (with shift status) +
// scrollable body + bottom tab bar.

import { notFound } from "next/navigation";
import { resolveStylist } from "@/lib/personas";
import { escalationsForStylist } from "@/lib/aiInbox";
import MobileFrame from "@/components/MobileFrame";
import MobileSplash from "@/components/MobileSplash";
import ProTopBar from "@/components/pro/ProTopBar";
import ProTabBar from "@/components/pro/ProTabBar";

export default async function ProShell({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ stylistSlug: string }>;
}) {
  const { stylistSlug } = await params;
  const stylist = resolveStylist(stylistSlug);
  if (!stylist) notFound();

  const inboxBadge = escalationsForStylist(stylistSlug).length;

  return (
    <MobileFrame>
      <MobileSplash kind="pro" />
      <ProTopBar stylist={stylist} />
      <main className="min-h-0 flex-1 overflow-y-auto bg-paper">{children}</main>
      <ProTabBar stylistSlug={stylistSlug} inboxBadge={inboxBadge} />
    </MobileFrame>
  );
}
