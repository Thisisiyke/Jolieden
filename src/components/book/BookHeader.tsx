"use client";

// Sticky top header for the /book surface. Cart count comes from the store,
// so this is a client component. Layout stays a Server Component and just
// renders this on top of {children}.

import Link from "next/link";
import { ShoppingBag, ExternalLink } from "lucide-react";
import { useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";

export default function BookHeader() {
  const cartCount = useStore(useShallow((s) => s.cart.lines.length));

  return (
    <header className="sticky top-0 z-30 border-b border-ink-200 bg-ink-900 text-white">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-4 px-4 text-sm">
        <Link href="/demo" className="flex items-center gap-1.5 text-white/60 hover:text-white" title="Demo Hub">
          <span className="font-mono text-[11px] uppercase tracking-wider">← Demo Hub</span>
        </Link>
        <div className="hidden flex-1 justify-center sm:flex">
          <Link href="/book" className="font-serif text-base tracking-[0.18em] text-white/90 hover:text-white">
            JOLIEDEN
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/me/aaliyah-j/bookings"
            className="hidden items-center gap-1.5 text-white/70 hover:text-white sm:inline-flex"
          >
            Your appointments <ExternalLink className="h-3.5 w-3.5 opacity-70" />
          </Link>
          <Link
            href="/book/cart"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-white hover:bg-white/20"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="font-mono text-xs">{cartCount}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
