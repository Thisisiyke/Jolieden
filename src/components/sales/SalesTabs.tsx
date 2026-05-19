"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

const TABS = [
  { id: "orders", label: "Orders", href: "/sales/orders" },
  { id: "transactions", label: "Payments", href: "/sales/transactions" },
  { id: "register", label: "Register", href: "/sales/register" },
  { id: "gift-cards", label: "Gift cards", href: "/sales/gift-cards" },
  { id: "memberships", label: "Memberships", href: "/sales/memberships" },
];

export function SalesTabs() {
  const pathname = usePathname();
  return (
    <div className="bg-white border-b border-ink-200 pl-6 pr-8 flex items-end justify-between gap-6">
      <div className="flex gap-6">
        {TABS.map((t) => {
          const active = pathname === t.href || pathname.startsWith(t.href + "/") ||
            (t.id === "orders" && pathname.startsWith("/sales/order/"));
          return (
            <Link
              key={t.id}
              href={t.href}
              className={
                "relative py-3 text-[14px] font-semibold " +
                (active ? "text-brand" : "text-ink-500 hover:text-ink-900")
              }
            >
              {t.label}
              {active && <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-brand" />}
            </Link>
          );
        })}
      </div>
      <button className="mb-2 h-9 px-3 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700 inline-flex items-center gap-2">
        <Plus className="h-4 w-4" /> New Sale
      </button>
    </div>
  );
}
