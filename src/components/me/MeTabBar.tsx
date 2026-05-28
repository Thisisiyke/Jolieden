"use client";

// Bottom tab bar for the /me client app. Sticks to the bottom of the mobile
// shell; active tab highlights when the pathname matches its href.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, CalendarHeart, Sparkles, User } from "lucide-react";
import clsx from "clsx";

type Props = { clientSlug: string };

const TABS = [
  { key: "home", label: "Home", path: "", icon: Home },
  { key: "browse", label: "Browse", path: "browse", icon: Search },
  { key: "bookings", label: "Bookings", path: "bookings", icon: CalendarHeart },
  { key: "journey", label: "Journey", path: "journey", icon: Sparkles },
  { key: "profile", label: "Profile", path: "profile", icon: User },
] as const;

export default function MeTabBar({ clientSlug }: Props) {
  const pathname = usePathname() || "";
  const root = `/me/${clientSlug}`;

  return (
    <nav
      aria-label="Client app tabs"
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
          return (
            <li key={t.key} className="flex">
              <Link
                href={href}
                className={clsx(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                  active ? "text-brand" : "text-ink-500 hover:text-ink-900",
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
