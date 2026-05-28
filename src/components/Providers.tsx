"use client";

// Client boundary mounted at the root so we can attach cross-surface widgets
// (Comments widget, future toasters, modal portals) and run any client-only
// hydration logic. The Zustand store hydrates itself on first import — no
// explicit hydration call needed here.

import type { ReactNode } from "react";
import CommentsWidget from "@/components/CommentsWidget";
import DemoHubFab from "@/components/DemoHubFab";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <CommentsWidget />
      {/* DemoHubFab sits at bottom-right (below Comments in the stack);
          hides itself when already on /demo. */}
      <DemoHubFab />
    </>
  );
}
