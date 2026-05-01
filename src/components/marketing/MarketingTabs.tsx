"use client";

import Link from "next/link";

export function MarketingTabs({ active }: { active: "blast" | "automated" }) {
  const tabs = [
    { id: "blast", label: "BLAST CAMPAIGNS", href: "/marketing/blast" },
    { id: "automated", label: "AUTOMATED CAMPAIGNS", href: "/marketing/automated" },
  ] as const;

  return (
    <div className="bg-white border-b border-ink-200 px-6">
      <div className="flex gap-6">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={t.href}
            className={
              "relative py-3 text-[12px] font-bold tracking-wide " +
              (active === t.id ? "text-brand" : "text-ink-500 hover:text-ink-900")
            }
          >
            {t.label}
            {active === t.id && (
              <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-brand" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
