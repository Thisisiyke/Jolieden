import { notFound } from "next/navigation";
import { resolveClient } from "@/lib/personas";
import MobileFrame from "@/components/MobileFrame";
import OnboardingWizard from "@/components/me/OnboardingWizard";

// Auth sign-in flow for the /me client app. After P32's browse-first
// restructure this is no longer the first-launch screen — cold-start users
// land directly on /me/[clientSlug] and browse the gallery without auth.
// This route fires when the user taps Confirm on a booking (or when a demo
// reviewer hits it directly to see the auth path). Lives OUTSIDE the
// /me/[clientSlug]/layout.tsx parent so it renders edge-to-edge without the
// TopBar / TabBar / AssistanceFab chrome — the user is being authenticated,
// not navigating the app.

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
