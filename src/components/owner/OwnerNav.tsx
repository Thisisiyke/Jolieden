"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { OWNER_SECTIONS } from "../../lib/owner";

export function OwnerNav() {
  const pathname = usePathname();
  return (
    <aside className="w-60 border-r border-ink-200 bg-white shrink-0 overflow-y-auto flex flex-col">
      <button className="px-4 py-3 border-b border-ink-200 flex items-center justify-between hover:bg-ink-50 text-left">
        <div>
          <div className="text-[10px] uppercase tracking-wide font-bold text-ink-500">Manage Business</div>
          <div className="text-[14px] font-semibold text-ink-900 mt-0.5">Jolieden&apos;s Beauty Bar</div>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-ink-500" />
      </button>
      <nav className="pb-3 pt-1">
        {OWNER_SECTIONS.map((s) => {
          const href = `/owner/${s.id}`;
          const active = pathname.startsWith(href);
          return (
            <Link
              key={s.id}
              href={href}
              className={
                "block px-4 py-1.5 text-[14px] " +
                (active
                  ? "bg-brand/10 text-brand font-semibold border-l-2 border-brand"
                  : "text-ink-700 hover:bg-ink-50")
              }
            >
              {s.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
