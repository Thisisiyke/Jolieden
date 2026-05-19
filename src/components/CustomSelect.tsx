"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full h-9 px-2 rounded border border-ink-300 bg-white text-left text-[14px] flex items-center justify-between gap-1 outline-none focus:border-brand cursor-pointer"
      >
        <span className={selected ? "text-ink-900" : "text-ink-500"}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-ink-500 shrink-0" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 bg-white rounded-lg border border-ink-200 shadow-lg py-1 max-h-52 overflow-y-auto">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-[14px] flex items-center justify-between hover:bg-ink-50"
            >
              <span className={value === o.value ? "text-ink-900 font-medium" : "text-ink-700"}>
                {o.label}
              </span>
              {value === o.value && (
                <Check className="h-4 w-4 text-brand shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
