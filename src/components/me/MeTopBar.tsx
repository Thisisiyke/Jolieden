// iOS-style navigation bar for /me. Compact, with a back-to-demo link and
// notification bell. Each page renders its own large title underneath.

import Link from "next/link";
import { Bell, ChevronLeft } from "lucide-react";
import type { Client } from "@/lib/data";

type Props = { client: Client; unreadCount?: number };

export default function MeTopBar({ client, unreadCount = 0 }: Props) {
  return (
    <header className="flex h-11 shrink-0 items-center justify-between gap-3 px-4">
      <Link
        href="/demo"
        className="-ml-1 flex items-center gap-0.5 text-brand hover:text-brand-700"
        aria-label="Back to Demo Hub"
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
        <span className="text-sm font-medium">Demo</span>
      </Link>
      <div className="font-serif text-[13px] tracking-[0.18em] text-ink-900">
        {client.firstName.toUpperCase()}
      </div>
      <button
        type="button"
        aria-label="Notifications"
        className="relative -mr-1 flex h-8 w-8 items-center justify-center rounded-full text-brand hover:bg-paper"
      >
        <Bell className="h-[18px] w-[18px]" strokeWidth={2.2} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-brand" />
        )}
      </button>
    </header>
  );
}
