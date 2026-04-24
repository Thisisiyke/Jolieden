"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export function Drawer({
  open,
  onClose,
  title,
  width = "max-w-4xl",
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  width?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      <aside
        className={
          "absolute right-0 top-0 bottom-0 bg-white shadow-2xl w-full " +
          width +
          " flex flex-col overflow-visible"
        }
      >
        <header className="h-14 px-5 flex items-center justify-between border-b border-ink-200 shrink-0">
          <h2 className="text-[16px] font-semibold text-ink-900">{title}</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded hover:bg-ink-100 flex items-center justify-center text-ink-500"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="flex-1 min-h-0 flex flex-col">{children}</div>
        {footer && (
          <footer className="border-t border-ink-200 px-5 py-3 shrink-0">
            {footer}
          </footer>
        )}
      </aside>
    </div>
  );
}
