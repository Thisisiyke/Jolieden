// iPhone-style phone frame for /me and /pro. On desktop, the surfaces sit
// inside a phone bezel with Dynamic Island, status bar, and home indicator
// so reviewers see exactly what a client/stylist would. On mobile (<640px),
// the bezel collapses and the app goes fullscreen.

import { SignalHigh, WifiHigh, BatteryFull } from "lucide-react";

function StatusBar() {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between px-7 pt-2 text-[14px] font-semibold text-ink-900 sm:pt-[14px]">
      <span className="font-mono tabular-nums">9:41</span>
      <div className="flex items-center gap-1.5">
        <SignalHigh className="h-3.5 w-3.5" strokeWidth={2.5} />
        <WifiHigh className="h-3.5 w-3.5" strokeWidth={2.5} />
        <BatteryFull className="h-4 w-4" strokeWidth={2.5} />
      </div>
    </div>
  );
}

export default function MobileFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper-mute sm:flex sm:items-center sm:justify-center sm:py-10">
      <div className="relative w-full sm:w-[420px]">
        {/* iPhone bezel — desktop only */}
        <div className="relative bg-transparent p-0 sm:rounded-[3rem] sm:bg-[#0d0d0e] sm:p-[10px] sm:shadow-[0_40px_120px_-40px_rgba(67,25,38,0.65)] sm:ring-1 sm:ring-black/30">
          {/* Inner screen */}
          <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-white sm:min-h-[820px] sm:rounded-[2.4rem]">
            {/* Status bar */}
            <StatusBar />

            {/* Dynamic Island — desktop only */}
            <div className="pointer-events-none absolute left-1/2 top-2 z-40 hidden h-[28px] w-[110px] -translate-x-1/2 rounded-full bg-black sm:block" />

            {/* App content (top bar + body + tab bar from layouts) */}
            <div className="flex min-h-0 flex-1 flex-col">{children}</div>

            {/* Home indicator — desktop only */}
            <div className="pointer-events-none absolute bottom-1.5 left-1/2 hidden h-[5px] w-[120px] -translate-x-1/2 rounded-full bg-black/80 sm:block" />
          </div>
        </div>
      </div>
    </div>
  );
}
