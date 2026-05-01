"use client";

import { useState, useRef, useEffect } from "react";
import { Mail, Download } from "lucide-react";
import { DateRangePicker } from "./DateRangePicker";

export function ReportToolbar({
  start,
  end,
  onApplyRange,
  onExport,
}: {
  start: string;
  end: string;
  onApplyRange: (s: string, e: string) => void;
  onExport: (format: "csv" | "excel" | "pdf") => void;
}) {
  const [emailOpen, setEmailOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const dlRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!downloadOpen) return;
    const h = (e: MouseEvent) => {
      if (dlRef.current && !dlRef.current.contains(e.target as Node))
        setDownloadOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [downloadOpen]);

  return (
    <div className="flex items-center gap-2">
      {/* Email */}
      {emailOpen ? (
        <div className="flex items-center gap-1">
          <input
            autoFocus
            placeholder="test@example.com"
            className="h-9 px-3 w-56 rounded border border-stone-400 bg-white text-[13px] outline-none focus:border-brand"
          />
          <button className="h-9 px-3 rounded bg-brand text-white text-[13px] font-semibold hover:bg-brand-700">
            Send
          </button>
          <button
            onClick={() => setEmailOpen(false)}
            className="h-9 px-2 text-[12px] text-ink-500 hover:text-ink-900"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEmailOpen(true)}
          className="h-9 w-9 rounded border border-stone-400 bg-white hover:bg-stone-100 flex items-center justify-center text-ink-700"
          title="Email this report"
        >
          <Mail className="h-4 w-4" />
        </button>
      )}

      {/* Download */}
      <div ref={dlRef} className="relative">
        <button
          onClick={() => setDownloadOpen((v) => !v)}
          className="h-9 w-9 rounded border border-stone-400 bg-white hover:bg-stone-100 flex items-center justify-center text-ink-700"
          title="Download this report"
        >
          <Download className="h-4 w-4" />
        </button>
        {downloadOpen && (
          <div className="absolute right-0 top-full mt-1 z-40 w-56 bg-white rounded-lg border border-ink-200 shadow-xl py-1">
            <div className="px-3 py-1.5 text-[10px] uppercase tracking-wide text-ink-500 font-bold">
              Export current view to
            </div>
            {(["csv", "excel", "pdf"] as const).map((f) => (
              <button
                key={f}
                onClick={() => {
                  onExport(f);
                  setDownloadOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-[13px] hover:bg-ink-50 text-ink-900 uppercase"
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Date range */}
      <DateRangePicker start={start} end={end} onApply={onApplyRange} />
    </div>
  );
}
