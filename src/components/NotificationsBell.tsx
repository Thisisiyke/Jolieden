"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Clock } from "lucide-react";
import { NOTIFICATIONS, type Notification } from "../lib/notifications";

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(NOTIFICATIONS);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const unread = items.filter((n) => !n.read).length;
  const badge = unread === 0 ? null : unread > 100 ? "100" : String(unread);

  const openOne = (n: Notification) => {
    setItems((p) => p.map((x) => x.id === n.id ? { ...x, read: true } : x));
    setOpen(false);
    router.push(n.href);
  };

  const markAllRead = () => {
    setItems((p) => p.map((x) => ({ ...x, read: true })));
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative h-9 w-9 rounded-md text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center"
      >
        <Bell className="h-5 w-5" />
        {badge && (
          <span className="absolute -top-0.5 -right-0.5 rounded-full bg-white text-brand text-[9px] leading-none px-1 py-[3px] font-semibold min-w-[18px] text-center">
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-50 w-[340px] bg-white rounded-lg shadow-2xl border border-ink-200 overflow-hidden text-ink-900"
          role="menu"
        >
          <div className="max-h-[420px] overflow-y-auto divide-y divide-ink-100">
            {items.length === 0 ? (
              <div className="px-4 py-10 text-center text-[12px] text-ink-500">
                Nothing new.
              </div>
            ) : (
              items
                .slice()
                .sort((a, b) => b.sortKey.localeCompare(a.sortKey))
                .map((n) => (
                  <button
                    key={n.id}
                    role="menuitem"
                    onClick={() => openOne(n)}
                    className={
                      "w-full text-left px-4 py-3 flex gap-3 hover:bg-ink-50 transition " +
                      (n.read ? "bg-white" : "bg-brand-50/40")
                    }
                  >
                    <div className="h-8 w-8 rounded-full bg-ink-100 flex items-center justify-center shrink-0">
                      <Clock className="h-4 w-4 text-ink-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[12px] font-bold text-ink-900 inline-flex items-center gap-1.5">
                          {n.category}
                          {!n.read && (
                            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                          )}
                        </div>
                        <div className="text-[10px] text-ink-500 whitespace-nowrap">{n.time}</div>
                      </div>
                      <div className="mt-1 text-[12px] text-ink-700 leading-snug">
                        {n.body}
                      </div>
                    </div>
                  </button>
                ))
            )}
          </div>
          {items.some((n) => !n.read) && (
            <div className="border-t border-ink-200 bg-white">
              <button
                onClick={markAllRead}
                className="w-full py-2.5 text-[12px] font-semibold text-brand hover:bg-ink-50"
              >
                Mark all as Read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
