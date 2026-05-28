// iOS-style navigation bar for /pro. Slightly stronger brand tint than /me
// to differentiate the stylist app, with shift-status pill on the right.

import Link from "next/link";
import { ChevronLeft, Circle } from "lucide-react";
import type { Stylist } from "@/lib/data";

type Props = { stylist: Stylist; shiftStatus?: "on" | "break" | "off" };

const STATUS_LABEL: Record<NonNullable<Props["shiftStatus"]>, string> = {
  on: "On",
  break: "Break",
  off: "Off",
};

const STATUS_DOT: Record<NonNullable<Props["shiftStatus"]>, string> = {
  on: "text-status-confirmed fill-status-confirmed",
  break: "text-status-pending fill-status-pending",
  off: "text-ink-300 fill-ink-300",
};

export default function ProTopBar({ stylist, shiftStatus = "on" }: Props) {
  return (
    <header className="flex h-11 shrink-0 items-center justify-between gap-3 px-4">
      <Link
        href="/demo"
        className="-ml-1 flex items-center gap-0.5 text-brand hover:text-brand-700"
        aria-label="Back to Demo Hub"
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
        <span className="text-sm font-medium">Demo</span>
      </Link>
      <div className="min-w-0 text-center font-serif text-[13px] tracking-[0.16em] text-ink-900">
        {stylist.name.split(" ")[0].toUpperCase()}
      </div>
      <div className="flex shrink-0 items-center gap-1 rounded-full bg-paper-mute px-2 py-0.5">
        <Circle className={"h-1.5 w-1.5 " + STATUS_DOT[shiftStatus]} />
        <span className="font-mono text-[9px] uppercase tracking-wider text-ink-700">
          {STATUS_LABEL[shiftStatus]}
        </span>
      </div>
    </header>
  );
}
