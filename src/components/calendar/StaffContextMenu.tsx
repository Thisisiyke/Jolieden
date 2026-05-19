"use client";

import { useEffect, useRef } from "react";
import { Calendar, CalendarDays, Clock, User } from "lucide-react";

export function StaffContextMenu({
  name,
  position,
  onClose,
}: {
  name: string;
  position: { x: number; y: number };
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

  const items = [
    { icon: Calendar, label: "View day" },
    { icon: CalendarDays, label: "View week" },
    { icon: Clock, label: "Adjust shift" },
    { icon: User, label: "View profile" },
  ];

  return (
    <div
      ref={ref}
      style={{ position: "fixed", left: position.x, top: position.y }}
      className="z-50 w-[180px] bg-white rounded-lg shadow-xl border border-ink-200 py-1"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-2 text-[11px] text-ink-500 font-medium border-b border-ink-200">
        {name}
      </div>
      {items.map((it) => (
        <button
          key={it.label}
          onClick={onClose}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-[14px] text-ink-900 hover:bg-ink-50"
        >
          <it.icon className="h-4 w-4 text-ink-500" />
          {it.label}
        </button>
      ))}
    </div>
  );
}
