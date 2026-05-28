// Top bar for the /pro stylist app. Shows the stylist, role, and a quick
// shift-status pill (on the clock / on break / off).

import Link from "next/link";
import { ArrowLeft, Circle } from "lucide-react";
import type { Stylist } from "@/lib/data";

type Props = { stylist: Stylist; shiftStatus?: "on" | "break" | "off" };

const STATUS_LABELS: Record<NonNullable<Props["shiftStatus"]>, string> = {
  on: "On the clock",
  break: "On break",
  off: "Off",
};

const STATUS_DOT: Record<NonNullable<Props["shiftStatus"]>, string> = {
  on: "text-status-confirmed fill-status-confirmed",
  break: "text-status-pending fill-status-pending",
  off: "text-ink-300 fill-ink-300",
};

export default function ProTopBar({ stylist, shiftStatus = "on" }: Props) {
  return (
    <header className="sticky top-0 z-20 flex h-12 items-center justify-between gap-3 border-b border-ink-200 bg-brand text-white px-4">
      <Link
        href="/demo"
        className="flex items-center gap-1 text-white/70 hover:text-white"
        aria-label="Back to Demo Hub"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="font-mono text-[10px] uppercase tracking-wider">Demo</span>
      </Link>
      <div className="min-w-0 flex-1 text-center">
        <div className="truncate text-sm font-semibold">{stylist.name}</div>
        <div className="truncate font-mono text-[9px] uppercase tracking-wider text-white/70">
          {stylist.specialty || stylist.role}
        </div>
      </div>
      <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-1">
        <Circle className={"h-2 w-2 " + STATUS_DOT[shiftStatus]} />
        <span className="font-mono text-[10px] uppercase tracking-wider">
          {STATUS_LABELS[shiftStatus]}
        </span>
      </div>
    </header>
  );
}
