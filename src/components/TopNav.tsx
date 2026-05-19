"use client";

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

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="h-14 bg-brand text-white flex items-stretch shrink-0">
      {/* Logo */}
      <div className="flex items-center pl-5 pr-5 border-r border-white/10">
        <Image
          src="/logo-white.png"
          alt="Jolieden's Beauty Bar"
          width={500}
          height={250}
          className="h-11 w-auto object-contain"
          priority
        />
      </div>

      {/* Search */}
      <button
        type="button"
        className="px-4 flex items-center text-white/70 hover:text-white"
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
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

      {/* Right cluster */}
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

        {/* Workspace name sits between Settings and Profile */}
        <div className="leading-tight px-3 text-right">
          <div className="text-[14px] font-semibold text-white">
            Jolieden&apos;s Beauty Bar
          </div>
          <div className="text-[11px] text-white/60">Frederick Douglass</div>
        </div>

        <ProfileMenu />
      </div>
    </header>
  );
}

