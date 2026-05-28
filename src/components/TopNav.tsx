"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Search,
  Clock,
  Settings,
} from "lucide-react";
import clsx from "clsx";
import { NotificationsBell } from "./NotificationsBell";
import { ProfileMenu } from "./profile/ProfileMenu";
import SearchPalette from "./SearchPalette";
import LocationSwitcher from "./LocationSwitcher";

const NAV = [
  { href: "/", label: "Front Desk" },
  { href: "/calendar", label: "Calendar" },
  { href: "/messages", label: "Messages", badge: 478 },
  { href: "/sales", label: "Sales" },
  { href: "/clients", label: "Clients" },
  { href: "/reports", label: "Reports" },
  { href: "/marketing", label: "Marketing" },
  { href: "/manage", label: "Manage" },
];

// Routes that render their own chrome (no operator TopNav).
const HIDE_ON_PREFIXES = ["/demo", "/book", "/me", "/pro", "/kiosk", "/onboarding"];

export function TopNav() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  // Global Cmd/Ctrl+K opens the search palette. Mounted at the TopNav so
  // it works across every operator route. Skipped on hidden prefixes
  // (mobile shells render their own chrome).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setSearchOpen((v) => !v);
      } else if (e.key === "/" && !isMod) {
        const target = e.target as HTMLElement | null;
        // Don't hijack "/" when the user is typing in an input/textarea/etc.
        const tag = target?.tagName?.toLowerCase();
        if (tag === "input" || tag === "textarea" || target?.isContentEditable) return;
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (HIDE_ON_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return null;
  }

  return (
    <header className="h-14 bg-brand text-white flex items-stretch shrink-0">
      {/* Logo */}
      <div className="flex items-center pl-5 pr-5 border-r border-white/10">
        <Image
          src="/logo-white.png"
          alt="Jolieden"
          width={500}
          height={250}
          className="h-11 w-auto object-contain"
          priority
        />
      </div>

      {/* Search */}
      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="flex items-center gap-2 border-r border-white/10 px-4 text-white/70 hover:text-white"
        aria-label="Open search"
        title="Search (Cmd+K)"
      >
        <Search className="h-5 w-5" />
        <span className="hidden font-mono text-[10px] uppercase tracking-wider lg:inline">
          ⌘K
        </span>
      </button>

      {/* Nav links */}
      <nav className="flex items-end flex-1">
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "relative h-full px-4 flex items-center text-[14px] font-medium gap-2",
                active ? "text-white" : "text-white/70 hover:text-white",
              )}
            >
              {item.label}
              {item.badge !== undefined && (
                <span className="rounded-full bg-white text-brand text-[10px] leading-none px-1.5 py-1 font-semibold">
                  {item.badge}
                </span>
              )}
              {active && (
                <span className="absolute left-3 right-3 bottom-0 h-[3px] rounded-t bg-white" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Right cluster — Demo Hub moved to a floating button at bottom-right
          (see DemoHubFab component) so it doesn't compete with the operator
          nav on every screen. */}
      <div className="flex items-center gap-1 pr-3">
        <Link
          href="/timeclock"
          aria-label="Time clock"
          className="relative h-9 w-9 rounded-md text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center"
        >
          <Clock className="h-5 w-5" />
        </Link>
        <NotificationsBell />
        <Link
          href="/owner"
          aria-label="Settings"
          className="relative h-9 w-9 rounded-md text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center"
        >
          <Settings className="h-5 w-5" />
        </Link>

        {/* Location switcher replaces the static workspace label.
            Multi-Location support per Diéssou's Apr-15 Must-Have. */}
        <div className="px-2">
          <LocationSwitcher />
        </div>

        <ProfileMenu />
      </div>
      {/* Global search palette */}
      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}

