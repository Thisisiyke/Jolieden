"use client";

import { SUMMARY_GROUPS, type SummaryReportId } from "../../lib/reports";

export function SummariesNav({
  active,
  onPick,
}: {
  active: SummaryReportId;
  onPick: (id: SummaryReportId) => void;
}) {
  return (
    <nav className="w-64 border-r border-ink-200 bg-white overflow-y-auto shrink-0">
      {SUMMARY_GROUPS.map((g) => (
        <div key={g.label} className="border-b border-ink-100 last:border-b-0">
          <div className="px-4 pt-4 pb-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-500 inline-flex items-center gap-2">
            <span>{g.icon}</span>
            <span>{g.label}</span>
          </div>
          <div className="pb-2">
            {g.items.map((it) => (
              <button
                key={it.id}
                onClick={() => onPick(it.id)}
                className={
                  "w-full text-left px-4 py-1.5 text-[13px] " +
                  (active === it.id
                    ? "bg-brand/10 text-brand font-semibold border-l-2 border-brand"
                    : "text-ink-700 hover:bg-ink-50")
                }
              >
                {it.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
