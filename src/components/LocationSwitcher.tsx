"use client";

// Multi-location switcher mounted in the operator TopNav. Reads/writes the
// active location to sessionStorage so it sticks within a session without
// requiring a backend. Reports + floor view + sales should filter by this
// in production; the prototype just shows the chosen location in the chip.

import { useEffect, useState } from "react";
import { Building2, Check, ChevronDown, MapPin, Layers } from "lucide-react";
import clsx from "clsx";
import { LOCATIONS, DEFAULT_LOCATION_ID } from "@/lib/owner";

const STORAGE_KEY = "jolieden-active-location";

function getActive(): string {
  if (typeof window === "undefined") return DEFAULT_LOCATION_ID;
  return window.sessionStorage.getItem(STORAGE_KEY) || DEFAULT_LOCATION_ID;
}

export default function LocationSwitcher() {
  const [active, setActive] = useState<string>(DEFAULT_LOCATION_ID);
  const [open, setOpen] = useState(false);
  const [allLocations, setAllLocations] = useState(false);

  // Hydrate from sessionStorage after mount to avoid SSR mismatch.
  useEffect(() => {
    setActive(getActive());
  }, []);

  const choose = (id: string) => {
    setActive(id);
    setAllLocations(false);
    window.sessionStorage.setItem(STORAGE_KEY, id);
    setOpen(false);
  };

  const pickAll = () => {
    setAllLocations(true);
    window.sessionStorage.setItem(STORAGE_KEY, "all");
    setOpen(false);
  };

  // Close on outside click + Esc.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const activeLoc = LOCATIONS.find((l) => l.id === active) ?? LOCATIONS[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-left text-white hover:bg-white/10"
        title="Switch location"
      >
        <Building2 className="h-3.5 w-3.5 text-white/70" />
        <div className="leading-tight">
          <div className="text-[11px] font-semibold">
            {allLocations ? "All locations" : activeLoc.shortName}
          </div>
          <div className="font-mono text-[9px] uppercase tracking-wider text-white/60">
            {allLocations
              ? `${LOCATIONS.length} locations`
              : `${activeLoc.staffCount} staff · ${activeLoc.chairsCount} chairs`}
          </div>
        </div>
        <ChevronDown className="h-3 w-3 text-white/70" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            role="menu"
            className="absolute right-0 top-[calc(100%+6px)] z-40 w-80 overflow-hidden rounded-xl border border-ink-200 bg-white text-ink-900 shadow-2xl"
          >
            <header className="border-b border-ink-200 bg-paper px-3 py-2">
              <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
                Switch location
              </div>
            </header>

            {/* All locations option (centralized reporting per Diéssou's Must-Have) */}
            <button
              type="button"
              onClick={pickAll}
              className={clsx(
                "flex w-full items-start gap-3 border-b border-ink-100 px-3 py-2.5 text-left",
                allLocations ? "bg-brand-50" : "hover:bg-ink-50",
              )}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-gold text-white">
                <Layers className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">All locations</div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
                  Centralized reporting · roll-up view
                </div>
              </div>
              {allLocations && <Check className="h-4 w-4 text-brand" />}
            </button>

            <ul>
              {LOCATIONS.map((l) => {
                const sel = !allLocations && l.id === active;
                return (
                  <li key={l.id}>
                    <button
                      type="button"
                      onClick={() => choose(l.id)}
                      className={clsx(
                        "flex w-full items-start gap-3 border-b border-ink-100 px-3 py-2.5 text-left last:border-b-0",
                        sel ? "bg-brand-50" : "hover:bg-ink-50",
                      )}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper text-brand">
                        <MapPin className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{l.shortName}</div>
                        <div className="truncate font-mono text-[10px] uppercase tracking-wider text-ink-500">
                          {l.city} · {l.flagshipName ? `${l.flagshipName} leads` : "—"}
                        </div>
                        <div className="mt-1 flex items-center gap-2 font-mono text-[10px] text-ink-500">
                          <span>{l.staffCount} staff</span>
                          <span>·</span>
                          <span>${l.todayRevenue.toLocaleString()}/today</span>
                        </div>
                      </div>
                      {sel && <Check className="h-4 w-4 text-brand" />}
                    </button>
                  </li>
                );
              })}
            </ul>

            <footer className="bg-paper px-3 py-2 text-center">
              <a
                href="/owner/locations"
                className="font-mono text-[10px] uppercase tracking-wider text-brand hover:underline"
              >
                Manage locations →
              </a>
            </footer>
          </div>
        </>
      )}
    </div>
  );
}
