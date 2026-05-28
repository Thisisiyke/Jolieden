// Top bar for the /me client app. Shows the active persona, brand wordmark,
// and notifications bell. Lives inside the mobile shell.

import Link from "next/link";
import { Bell, ArrowLeft } from "lucide-react";
import type { Client } from "@/lib/data";

type Props = { client: Client; unreadCount?: number };

export default function MeTopBar({ client, unreadCount = 0 }: Props) {
  return (
    <header className="sticky top-0 z-20 flex h-12 items-center justify-between gap-3 border-b border-ink-200 bg-white px-4">
      <Link
        href="/demo"
        className="flex items-center gap-1 text-ink-500 hover:text-brand"
        aria-label="Back to Demo Hub"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="font-mono text-[10px] uppercase tracking-wider">Demo</span>
      </Link>
      <div className="flex-1 text-center">
        <div className="font-serif text-sm tracking-[0.18em] text-brand">JOLIEDEN</div>
        <div className="font-mono text-[9px] uppercase tracking-wider text-ink-500">
          hi, {client.firstName}
        </div>
      </div>
      <button
        type="button"
        aria-label="Notifications"
        className="relative flex h-8 w-8 items-center justify-center rounded-full text-ink-700 hover:bg-paper"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-brand" />
        )}
      </button>
    </header>
  );
}
