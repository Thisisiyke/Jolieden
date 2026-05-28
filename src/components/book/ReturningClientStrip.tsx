// Equivalent of the Boulevard "Returning clients: log in" banner. Subtle
// blush strip that nudges existing clients to use the client app.

import Link from "next/link";
import { Smartphone } from "lucide-react";

export default function ReturningClientStrip() {
  return (
    <div className="border-b border-ink-200 bg-brand-50">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-2.5 text-sm">
        <div className="flex items-center gap-2 text-brand-700">
          <Smartphone className="h-4 w-4" />
          <span className="font-medium">Returning?</span>
          <span className="text-ink-700">Pick up where you left off in the Jolieden app.</span>
        </div>
        <Link
          href="/me/aaliyah-j"
          className="rounded-md border border-brand-500/30 bg-white px-3 py-1 text-xs font-medium text-brand hover:bg-brand hover:text-white"
        >
          Open the app
        </Link>
      </div>
    </div>
  );
}
