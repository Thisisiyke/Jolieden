"use client";

// Floating "Demo Hub" button that sits at the bottom-right corner of every
// screen and links back to /demo. Stacks below the Comments widget (which
// re-anchors to y=88 so the two don't overlap). Hides itself on /demo
// itself + any /demo/* sub-route so it doesn't get in the way once you're
// already there.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";

export default function DemoHubFab() {
  const pathname = usePathname() || "";

  // Hide on the demo hub itself + any sub-route (e.g. /demo/sms).
  if (pathname === "/demo" || pathname.startsWith("/demo/")) return null;

  return (
    <Link
      href="/demo"
      aria-label="Back to Demo Hub"
      title="Back to Demo Hub"
      className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-brand/40 transition-transform hover:scale-105 hover:bg-brand-700"
    >
      <Home className="h-5 w-5" strokeWidth={2.2} />
    </Link>
  );
}
