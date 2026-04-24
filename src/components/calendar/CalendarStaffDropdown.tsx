"use client";

import { useState, useEffect, useRef } from "react";
import { Check, Search } from "lucide-react";
import { STAFF } from "../../lib/data";

export function CalendarStaffDropdown({
  visible,
  onToggle,
  onClose,
}: {
  visible: Set<string>;
  onToggle: (name: string) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<"all" | "working">("all");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const filtered = STAFF.filter(
    (s) =>
      s.name.toLowerCase().includes(q.toLowerCase()) ||
      s.role.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-1 z-50 w-[280px] bg-white rounded-lg shadow-xl border border-ink-200 overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Toggle */}
      <div className="flex border-b border-ink-200">
        {(["all", "working"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={
              "flex-1 py-2.5 text-[12px] font-medium text-center " +
              (mode === m
                ? "text-brand border-b-2 border-brand"
                : "text-ink-500 hover:text-ink-700")
            }
          >
            {m === "all" ? "All Staff" : "Is Working"}
          </button>
        ))}
      </div>

      {/* Staff list */}
      <div className="max-h-64 overflow-y-auto">
        {filtered.map((s) => {
          const checked = visible.has(s.name);
          return (
            <button
              key={s.name}
              onClick={() => onToggle(s.name)}
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
              {checked && <Check className="h-4 w-4 text-brand shrink-0" />}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="px-3 py-3 text-[12px] text-ink-500">No match.</div>
        )}
      </div>

      {/* Search */}
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
