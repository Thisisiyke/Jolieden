import { Suspense } from "react";
import { resolveClient } from "@/lib/personas";
import PlaceholderShell from "@/components/demo/PlaceholderShell";

// useSearchParams (used by client children) requires a Suspense boundary in
// App Router or the production build fails. We don't need any client state at
// this stub level, so the page is a Server Component reading `searchParams`.

export default async function BookLandingPage({
  searchParams,
}: {
  searchParams: Promise<{ as?: string }>;
}) {
  const params = await searchParams;
  const client = params.as ? resolveClient(params.as) : undefined;

  return (
    <Suspense fallback={null}>
      <PlaceholderShell
        surface="Client booking · /book"
        phase="Stub · gallery + flow land in P5"
        personaName={client ? `${client.firstName} ${client.lastName}` : "Anonymous visitor"}
        personaRole={client ? `Loyalist · ${client.visits} prior visits` : "First-time, no account"}
        hint="The photo-first booking flow lives here. You'll browse a gallery of finished looks, tap one, and the cart auto-fills with the right service + modifiers. Pre-filled fields end-to-end, no typing."
      />
    </Suspense>
  );
}
