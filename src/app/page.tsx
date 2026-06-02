// Homepage: Diéssou's artifact suite, full-window. Her own design language
// for the hub + the 7 surfaces (her original 6 + the Booking Website we
// added in v4). The operator TopNav and other chrome are suppressed for
// this route — visitors see exactly what was sent for her review.
//
// The Build Brief for devs has moved to /spec.

import Link from "next/link";

export default function HomeArtifact() {
  return (
    <div className="fixed inset-0 z-0 flex flex-col bg-[#0F0C09]">
      <iframe
        src="/suite.html"
        title="Jolieden App Suite — Interactive Prototype"
        className="h-full w-full flex-1 border-0"
      />
      {/* Slim badge linking devs to the Build Brief without distracting the
          client view. Sits bottom-left so it doesn't fight the comment
          widget (bottom-right) or the home FAB. */}
      <Link
        href="/spec"
        className="fixed bottom-4 left-4 z-50 rounded-full bg-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#C2912F] backdrop-blur-md hover:bg-white/20"
      >
        Build Brief for devs →
      </Link>
    </div>
  );
}
