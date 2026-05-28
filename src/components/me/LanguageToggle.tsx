"use client";

// Profile-level language toggle. Reads + writes the per-client locale slice
// in Zustand so the switch persists across reloads (the store has its own
// localStorage middleware).

import clsx from "clsx";
import { useLocale, useStore } from "@/lib/store";
import { LOCALE_LABEL, type Locale } from "@/lib/i18n";

export default function LanguageToggle({ clientSlug }: { clientSlug: string }) {
  const current = useLocale(clientSlug);
  const setLocale = useStore((s) => s.setLocale);

  return (
    <div className="border-b border-ink-200 px-4 py-3 last:border-b-0">
      <div className="flex items-center justify-between text-sm">
        <span className="text-ink-900">App language</span>
        <div className="flex gap-1 rounded-full bg-paper p-0.5">
          {(["en", "fr"] as Locale[]).map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setLocale(clientSlug, loc)}
              className={clsx(
                "rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors",
                current === loc
                  ? "bg-brand text-white"
                  : "text-ink-700 hover:bg-white",
              )}
            >
              {LOCALE_LABEL[loc]}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-1 text-xs text-ink-500">
        {current === "fr"
          ? "Vous pouvez changer à tout moment."
          : "Switch any time. Affects home, profile, and tab labels."}
      </p>
    </div>
  );
}
