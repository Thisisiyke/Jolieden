"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { ChangelogEntry } from "../../lib/profile";

const TAG_STYLES: Record<string, string> = {
  New: "bg-brand text-white",
  Improvement: "bg-sky-100 text-sky-700",
  Fix: "bg-amber-100 text-amber-700",
};

export function ChangelogPanel({
  open,
  entries,
  onClose,
  onMarkAllRead,
}: {
  open: boolean;
  entries: ChangelogEntry[];
  onClose: () => void;
  onMarkAllRead: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <aside className="absolute right-0 top-0 bottom-0 w-[400px] bg-white shadow-2xl flex flex-col">
        <header className="h-14 px-5 flex items-center justify-between border-b border-ink-200 shrink-0">
          <h2 className="text-[15px] font-semibold text-ink-900">Latest changes</h2>
          <div className="flex items-center gap-1">
            <button onClick={onMarkAllRead} className="text-[12px] font-semibold text-brand hover:underline">
              Mark all read
            </button>
            <button onClick={onClose} className="h-8 w-8 rounded hover:bg-ink-100 flex items-center justify-center text-ink-500"><X className="h-4 w-4" /></button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">
          {entries.map((e) => (
            <article
              key={e.id}
              className={"px-5 py-4 border-b border-ink-100 " + (e.read ? "bg-white" : "bg-brand-50/40")}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className={"rounded-full px-2 py-0.5 text-[10px] font-bold " + (TAG_STYLES[e.tag] ?? "bg-ink-100 text-ink-700")}>
                  {e.tag}
                </span>
                <span className="text-[11px] text-ink-500">{e.date}</span>
                {!e.read && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand" />}
              </div>
              <div className="text-[14px] font-semibold text-ink-900">{e.title}</div>
              <div className="text-[12px] text-ink-700 mt-1 leading-snug">{e.summary}</div>
            </article>
          ))}
        </div>
        <footer className="border-t border-ink-200 py-3 px-5 text-center bg-white">
          <a className="text-[12px] text-brand font-semibold hover:underline cursor-pointer">
            Boulevard changelog →
          </a>
        </footer>
      </aside>
    </div>
  );
}
