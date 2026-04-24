"use client";

import { useEffect, useRef } from "react";
import { Check, Lock } from "lucide-react";

const VIEWS = [
  { id: "day", label: "Day view", locked: false },
  { id: "4day", label: "4-Day view", locked: true },
  { id: "week", label: "Week view", locked: true },
] as const;

export function ViewSelector({
  value,
  onClose,
}: {
  value: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute left-0 top-full mt-1 z-50 w-[200px] bg-white rounded-lg shadow-xl border border-ink-200 py-1"
      onClick={(e) => e.stopPropagation()}
    >
      {VIEWS.map((v) => (
        <button
          key={v.id}
          disabled={v.locked}
          onClick={() => onClose()}
          className={
            "w-full flex items-center justify-between px-3 py-2 text-[13px] " +
            (v.locked
              ? "text-ink-300 cursor-not-allowed"
              : "text-ink-900 hover:bg-ink-50")
          }
        >
          <span className="flex items-center gap-2">
            {v.label}
            {v.locked && <Lock className="h-3 w-3 text-ink-300" />}
          </span>
          {value === v.id && !v.locked && (
            <Check className="h-4 w-4 text-brand" />
          )}
        </button>
      ))}
      {(VIEWS.some((v) => v.locked)) && (
        <div className="px-3 py-2 border-t border-ink-200 text-[10px] text-ink-500">
          Upgrade plan for multi-day views
        </div>
      )}
    </div>
  );
}
