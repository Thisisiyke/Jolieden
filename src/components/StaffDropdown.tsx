"use client";

import { useState } from "react";
import { Check, Search } from "lucide-react";
import { STAFF } from "../lib/data";

export function StaffDropdown({
  value,
  onPick,
  onClose,
}: {
  value: string;
  onPick: (v: string) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const filtered = STAFF.filter(
    (s) =>
      s.name.toLowerCase().includes(q.toLowerCase()) ||
      s.role.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div
      className="absolute right-0 top-full mt-1 z-30 w-[260px] bg-white rounded-lg shadow-xl border border-ink-200 overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => {
          onPick("ALL");
          onClose();
        }}
        className="w-full flex items-center justify-between px-3 py-2 text-[13px] hover:bg-ink-50"
      >
        <span className="font-medium text-ink-900">All Staff</span>
        {value === "ALL" && <Check className="h-4 w-4 text-brand" />}
      </button>
      <div className="border-t border-ink-200 max-h-64 overflow-y-auto">
        {filtered.map((s) => (
          <button
            key={s.name}
            onClick={() => {
              onPick(s.name);
              onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-[13px] hover:bg-ink-50"
          >
            <span className="flex items-center gap-2 min-w-0">
              <span
                className="h-6 w-6 rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0"
                style={{ background: s.color }}
              >
                {s.name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)}
              </span>
              <span className="truncate text-ink-900">{s.name}</span>
            </span>
            {value === s.name && (
              <Check className="h-4 w-4 text-brand shrink-0" />
            )}
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="px-3 py-3 text-[12px] text-ink-500">No match.</div>
        )}
      </div>
      <div className="border-t border-ink-200 px-2 py-2 flex items-center gap-2">
        <Search className="h-3.5 w-3.5 text-ink-500" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Type name or role…"
          className="flex-1 h-7 text-[12px] outline-none"
        />
      </div>
    </div>
  );
}
