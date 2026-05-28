"use client";

// Equivalent of the Boulevard "Returning clients: log in" banner. Subtle
// blush strip that nudges existing clients to use the client app. When
// `?as=` identifies a known persona, the CTA deep-links to their app
// home; for anonymous visits, the CTA is a generic "Sign in" prompt that
// goes to the demo hub for now (in production: real login).

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Smartphone } from "lucide-react";

export default function ReturningClientStrip() {
  const params = useSearchParams();
  const asClient = params.get("as") || undefined;

  return (
    <div className="border-b border-ink-200 bg-brand-50">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-2.5 text-sm">
        <div className="flex items-center gap-2 text-brand-700">
          <Smartphone className="h-4 w-4" />
          <span className="font-medium">{asClient ? "Welcome back" : "Returning?"}</span>
          <span className="text-ink-700">
            {asClient
              ? "Pick up where you left off."
              : "Pick up where you left off in the Jolieden app."}
          </span>
        </div>
        <Link
          href={asClient ? `/me/${asClient}` : "/demo"}
          className="rounded-md border border-brand-500/30 bg-white px-3 py-1 text-xs font-medium text-brand hover:bg-brand hover:text-white"
        >
          {asClient ? "Open the app" : "Sign in"}
        </Link>
      </div>
    </div>
  );
}
