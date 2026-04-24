"use client";

import { useEffect, useRef } from "react";
import { addDays } from "../../lib/date";

const JUMPS = [
  { label: "4 weeks from today", weeks: 4 },
  { label: "6 weeks from today", weeks: 6 },
  { label: "8 weeks from today", weeks: 8 },
];

export function JumpForwardDropdown({
  today,
  onJump,
  onClose,
}: {
  today: string;
  onJump: (iso: string) => void;
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
      className="absolute left-0 top-full mt-1 z-50 w-[220px] bg-white rounded-lg shadow-xl border border-ink-200 py-1"
      onClick={(e) => e.stopPropagation()}
    >
      {JUMPS.map((j) => (
        <button
          key={j.weeks}
          onClick={() => {
            onJump(addDays(today, j.weeks * 7));
            onClose();
          }}
          className="w-full text-left px-3 py-2 text-[13px] text-ink-900 hover:bg-ink-50"
        >
          {j.label}
        </button>
      ))}
    </div>
  );
}
