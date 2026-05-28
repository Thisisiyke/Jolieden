"use client";

// Bottom tab bar for the /pro stylist app. Today / Schedule / Clients /
// Inbox / Profile. The Inbox tab carries the AI-takeover badge when there
// are pending escalations.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, Users, Inbox, User } from "lucide-react";
import clsx from "clsx";

type Props = { stylistSlug: string; inboxBadge?: number };

const TABS = [
  { key: "today", label: "Today", path: "", icon: LayoutDashboard },
  { key: "schedule", label: "Schedule", path: "schedule", icon: CalendarDays },
  { key: "clients", label: "Clients", path: "clients", icon: Users },
  { key: "inbox", label: "Inbox", path: "inbox", icon: Inbox },
  { key: "profile", label: "Profile", path: "profile", icon: User },
] as const;

export default function ProTabBar({ stylistSlug, inboxBadge = 0 }: Props) {
  const pathname = usePathname() || "";
  const root = `/pro/${stylistSlug}`;

  return (
    <nav
      aria-label="Stylist app tabs"
      className="sticky bottom-0 left-0 right-0 z-30 border-t border-ink-200 bg-white pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-5">
        {TABS.map((t) => {
          const href = t.path ? `${root}/${t.path}` : root;
          const active =
            t.path === ""
              ? pathname === root
              : pathname === href || pathname.startsWith(href + "/");
          const Icon = t.icon;
          const showBadge = t.key === "inbox" && inboxBadge > 0;
          return (
            <li key={t.key} className="flex">
              <Link
                href={href}
                className={clsx(
                  "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                  active ? "text-brand" : "text-ink-500 hover:text-ink-900",
                )}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {showBadge && (
                    <span className="absolute -right-2 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 font-mono text-[9px] font-semibold text-white">
                      {inboxBadge}
                    </span>
                  )}
                </div>
                <span>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
