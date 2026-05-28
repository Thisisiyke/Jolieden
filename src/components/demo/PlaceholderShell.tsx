// Generic "coming in Phase X" surface placeholder. Renders the persona context
// + a back-to-demo-hub link so taps from /demo never look broken.

import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";

type Props = {
  surface: string;
  phase: string;
  personaName?: string;
  personaRole?: string;
  hint?: string;
  children?: React.ReactNode;
};

export default function PlaceholderShell({
  surface,
  phase,
  personaName,
  personaRole,
  hint,
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <Link
            href="/demo"
            className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand"
          >
            <ArrowLeft className="h-4 w-4" />
            Demo Hub
          </Link>
          <div className="font-mono text-[11px] uppercase tracking-wider text-ink-500">
            {surface}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-xl border border-ink-200 bg-white p-8 shadow-sm">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-paper-mute px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-700">
            <Construction className="h-3 w-3" />
            {phase}
          </div>
          <h1 className="mt-4 font-serif text-3xl font-semibold text-brand">{surface}</h1>
          {personaName && (
            <p className="mt-2 text-sm text-ink-500">
              You're viewing as{" "}
              <span className="font-medium text-ink-900">{personaName}</span>
              {personaRole && <> · <span>{personaRole}</span></>}
            </p>
          )}
          {hint && (
            <p className="mt-5 text-base leading-relaxed text-ink-700">{hint}</p>
          )}
          {children}
          <div className="mt-8 border-t border-ink-200 pt-5">
            <p className="font-mono text-xs text-ink-500">
              This screen is a P2 stub so demo-hub tiles don't 404. Real shell lands in P3, then
              full content in P4–P6.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
