"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { STAFF_DIRECTORY } from "../../lib/manage";

export function StaffPicker({
  value,
  onChange,
}: {
  value: string; // staffId or "ALL"
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const filtered = STAFF_DIRECTORY.filter(
    (s) =>
      s.name.toLowerCase().includes(q.toLowerCase()) ||
      s.role.toLowerCase().includes(q.toLowerCase()),
  );

  const grouped: Record<string, typeof STAFF_DIRECTORY> = {};
  for (const s of filtered) {
    grouped[s.role] ??= [];
    grouped[s.role].push(s);
  }

  const selected = STAFF_DIRECTORY.find((s) => s.id === value);
  const label = value === "ALL" ? "All Staff" : selected?.name ?? "Select staff";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-9 px-3 rounded border border-stone-400 bg-white text-[14px] font-medium text-ink-700 hover:bg-stone-100 inline-flex items-center gap-2 min-w-[200px]"
      >
        <span className="flex-1 text-left truncate">{label}</span>
        <ChevronDown className="h-3 w-3 text-ink-500 shrink-0" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-72 bg-white rounded-lg shadow-xl border border-ink-200 overflow-hidden">
          <button
            onClick={() => { onChange("ALL"); setOpen(false); }}
            className="w-full flex items-center justify-between px-3 py-2 text-[14px] hover:bg-ink-50 border-b border-ink-200"
          >
            <span className="font-semibold">All Staff</span>
            {value === "ALL" && <Check className="h-4 w-4 text-brand" />}
          </button>
          <div className="max-h-64 overflow-y-auto">
            {Object.entries(grouped).map(([role, list]) => (
              <div key={role}>
                <div className="px-3 pt-2 pb-1 text-[10px] uppercase font-bold tracking-wide text-ink-500">
                  {role}
                </div>
                {list.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { onChange(s.id); setOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 text-[14px] hover:bg-ink-50"
                  >
                    <span className="text-ink-900">{s.name}</span>
                    {value === s.id && <Check className="h-4 w-4 text-brand" />}
                  </button>
                ))}
              </div>
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
      )}
    </div>
  );
}
