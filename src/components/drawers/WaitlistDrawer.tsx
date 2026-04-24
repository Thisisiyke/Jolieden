"use client";

import { Drawer } from "../Drawer";
import { Plus, Inbox } from "lucide-react";

export function WaitlistDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Drawer open={open} onClose={onClose} title="Waitlist" width="max-w-3xl">
      <div className="px-5 py-3 border-b border-ink-200 flex items-center gap-3">
        <input
          placeholder="Filter waitlist…"
          className="flex-1 h-9 px-3 rounded border border-ink-300 text-[13px] outline-none focus:border-brand"
        />
        <button className="h-9 px-3 rounded bg-brand text-white text-[13px] font-semibold hover:bg-brand-700 inline-flex items-center gap-1">
          <Plus className="h-4 w-4" /> Add To Waitlist
        </button>
      </div>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-14 w-14 rounded-full bg-ink-100 flex items-center justify-center">
          <Inbox className="h-6 w-6 text-ink-500" />
        </div>
        <div className="mt-3 text-[15px] font-semibold text-ink-900">
          Your waitlist is empty
        </div>
        <div className="text-[12px] text-ink-500 mt-1 max-w-xs">
          When clients request an earlier opening, they&apos;ll appear here.
        </div>
      </div>
    </Drawer>
  );
}
