"use client";

// Bottom tab bar for the /me client app. Sticks to the bottom of the mobile
// shell; active tab highlights when the pathname matches its href.
// Labels honor the per-client EN/FR locale.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, CalendarHeart, Sparkles, User } from "lucide-react";
import clsx from "clsx";
import { useLocale } from "@/lib/store";
import { t } from "@/lib/i18n";

type Props = { clientSlug: string };

const TABS = [
  { key: "home", labelKey: "tab.home", path: "", icon: Home },
  { key: "browse", labelKey: "tab.browse", path: "browse", icon: Search },
  { key: "bookings", labelKey: "tab.bookings", path: "bookings", icon: CalendarHeart },
  { key: "journey", labelKey: "tab.journey", path: "journey", icon: Sparkles },
  { key: "profile", labelKey: "tab.profile", path: "profile", icon: User },
] as const;

export default function MeTabBar({ clientSlug }: Props) {
  const pathname = usePathname() || "";
  const root = `/me/${clientSlug}`;
  const locale = useLocale(clientSlug);

  return (
    <nav
      aria-label="Client app tabs"
      className="z-30 shrink-0 border-t border-ink-200 bg-white pb-[max(env(safe-area-inset-bottom),0.5rem)] sm:pb-6"
    >
      <ul className="grid grid-cols-5">
        {TABS.map((tab) => {
          const href = tab.path ? `${root}/${tab.path}` : root;
          const active =
            tab.path === ""
              ? pathname === root
              : pathname === href || pathname.startsWith(href + "/");
          const Icon = tab.icon;
          return (
            <li key={tab.key} className="flex">
              <Link
                href={href}
                className={clsx(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                  active ? "text-brand" : "text-ink-500 hover:text-ink-900",
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{t(tab.labelKey, locale)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
