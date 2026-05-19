"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MANAGE_SECTIONS } from "../../lib/manage";

export function ManageNav() {
  const pathname = usePathname();
  return (
    <aside className="w-56 border-r border-ink-200 bg-white shrink-0 overflow-y-auto">
      <div className="px-4 pt-4 pb-2 text-[11px] uppercase tracking-wide font-bold text-ink-500">
        Manage Location
      </div>
      <nav className="pb-3">
        {MANAGE_SECTIONS.map((s) => {
          const href = `/manage/${s.id}`;
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
