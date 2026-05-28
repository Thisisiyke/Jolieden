import { notFound } from "next/navigation";
import { resolveClient } from "@/lib/personas";
import MobileFrame from "@/components/MobileFrame";
import OnboardingWizard from "@/components/me/OnboardingWizard";

// First-launch onboarding for a brand-new client. Lives OUTSIDE the
// /me/[clientSlug]/layout.tsx parent so the wizard renders edge-to-edge
// without the TopBar / TabBar / AssistanceFab chrome — the user hasn't
// completed setup yet, so the app navigation shouldn't appear. After the
// wizard's final Continue the user is router-pushed to /me/[clientSlug].

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;
  const client = resolveClient(clientSlug);
  if (!client) notFound();

  return (
    <MobileFrame>
      <OnboardingWizard
        clientSlug={clientSlug}
        firstName={client.firstName}
        defaultPhone={client.phone}
      />
    </MobileFrame>
  );
}
