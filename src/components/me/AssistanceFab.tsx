"use client";

// Client Assistance button — sticky FAB on the iPhone-framed /me shell.
// Tapping opens a sheet where the client picks what they need; submitting
// fires a salon-side alert (operator-side push). Per Diéssou's Must-Have
// "Client Assistance button — clients can ask for assistance from
// managers on the app."

import { useEffect, useState } from "react";
import {
  HandIcon,
  X,
  Droplets,
  CupSoda,
  HelpCircle,
  Volume2,
  Sparkles,
  Clock,
  Check,
  Loader2,
} from "lucide-react";
import clsx from "clsx";

type RequestType = "water" | "snack" | "question" | "music" | "comfort" | "wait";

const REQUEST_TYPES: { id: RequestType; label: string; icon: typeof Droplets; sub: string }[] = [
  { id: "water", label: "Water, please", icon: Droplets, sub: "Cold or room temp" },
  { id: "snack", label: "Drink / snack", icon: CupSoda, sub: "We'll bring the menu" },
  { id: "question", label: "Quick question", icon: HelpCircle, sub: "A manager comes over" },
  { id: "music", label: "Adjust music", icon: Volume2, sub: "Up, down, or change vibe" },
  { id: "comfort", label: "Comfort check", icon: Sparkles, sub: "Cape, temperature, light" },
  { id: "wait", label: "How much longer?", icon: Clock, sub: "We'll give you a real ETA" },
];

export default function AssistanceFab() {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<RequestType | null>(null);
  const [phase, setPhase] = useState<"idle" | "sending" | "sent">("idle");

  // Auto-reset after success state.
  useEffect(() => {
    if (phase !== "sent") return;
    const t = window.setTimeout(() => {
      setOpen(false);
      setPicked(null);
      setPhase("idle");
    }, 2200);
    return () => window.clearTimeout(t);
  }, [phase]);

  const send = (id: RequestType) => {
    setPicked(id);
    setPhase("sending");
    window.setTimeout(() => setPhase("sent"), 700);
  };

  return (
    <>
      {/* Floating action button — sits above the tab bar */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="absolute bottom-24 right-4 z-20 flex items-center gap-1.5 rounded-full bg-brand py-2.5 pl-3 pr-3.5 text-xs font-semibold text-white shadow-lg shadow-brand/30 hover:bg-brand-700 sm:bottom-28"
        aria-label="Ask for help"
      >
        <HandIcon className="h-3.5 w-3.5" />
        I need…
      </button>

      {/* Sheet overlay (only over the phone screen — uses absolute, not fixed) */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          className="absolute inset-0 z-30 flex items-end bg-black/30"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full rounded-t-3xl bg-white p-5 pb-7 shadow-xl"
          >
            {/* Grabber */}
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-ink-300" />

            {phase === "sent" ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-status-confirmed/15">
                  <Check className="h-5 w-5 text-status-confirmed" />
                </div>
                <div className="text-base font-semibold text-ink-900">A manager is on the way</div>
                <p className="max-w-xs text-xs text-ink-700">
                  Avg response time today is under 90 seconds. We&apos;ll get to you fast.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-serif text-lg font-semibold text-ink-900">
                      What do you need?
                    </h2>
                    <p className="mt-0.5 text-xs text-ink-500">
                      A manager gets pinged the moment you tap.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                    className="rounded-full p-1 text-ink-500 hover:bg-paper"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <ul className="mt-4 grid grid-cols-2 gap-2">
                  {REQUEST_TYPES.map((r) => {
                    const Icon = r.icon;
                    const active = picked === r.id && phase === "sending";
                    return (
                      <li key={r.id}>
                        <button
                          type="button"
                          onClick={() => send(r.id)}
                          disabled={phase === "sending"}
                          className={clsx(
                            "flex w-full items-start gap-2 rounded-xl border p-3 text-left transition-colors disabled:opacity-50",
                            active ? "border-brand bg-brand-50" : "border-ink-200 bg-white hover:border-brand",
                          )}
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                            {active ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Icon className="h-4 w-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-ink-900">{r.label}</div>
                            <div className="text-[10px] text-ink-500">{r.sub}</div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
