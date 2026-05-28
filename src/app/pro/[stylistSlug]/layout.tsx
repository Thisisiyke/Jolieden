// /pro/[stylistSlug] shell — the stylist mobile app wrapper. Phone frame on
// desktop, full-width on mobile. Top bar (with shift status) + scrollable
// body + bottom tab bar.

import { notFound } from "next/navigation";
import { resolveStylist } from "@/lib/personas";
import { escalationsForStylist } from "@/lib/aiInbox";
import MobileFrame from "@/components/MobileFrame";
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
      <ProTopBar stylist={stylist} />
      <div className="flex-1 overflow-y-auto bg-paper">{children}</div>
      <ProTabBar stylistSlug={stylistSlug} inboxBadge={inboxBadge} />
    </MobileFrame>
  );
}
