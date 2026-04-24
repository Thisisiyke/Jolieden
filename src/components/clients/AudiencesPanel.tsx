"use client";

import { AUDIENCES } from "../../lib/data";
import { Users, Plus } from "lucide-react";

export function AudiencesPanel() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[13px] text-ink-500">Saved client segments defined by filter rules</div>
        </div>
        <button className="h-9 px-3 rounded bg-brand text-white text-[13px] font-semibold hover:bg-brand-700 inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> New audience
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {AUDIENCES.map((a) => (
          <div
            key={a.id}
            className="rounded-lg border border-ink-200 bg-white p-4 hover:border-ink-300 transition cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[14px] font-semibold text-ink-900">
                  {a.name}
                </div>
                <div className="text-[12px] text-ink-500 mt-0.5">
                  {a.description}
                </div>
              </div>
              <div className="inline-flex items-center gap-1 text-[12px] text-brand font-semibold">
                <Users className="h-3.5 w-3.5" /> {a.count}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {a.filters.map((f) => (
                <span
                  key={f}
                  className="text-[11px] bg-ink-100 text-ink-700 rounded px-2 py-1"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
