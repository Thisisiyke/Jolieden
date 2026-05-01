"use client";

import { useState } from "react";
import { Plus, Folder } from "lucide-react";
import { SYSTEM_FOLDERS } from "../../lib/reports";

export function BetaSidebar({
  active,
  onPick,
  counts,
  customFolders,
  onAddFolder,
}: {
  active: string;
  onPick: (id: string) => void;
  counts: Record<string, number>;
  customFolders: string[];
  onAddFolder: () => void;
}) {
  return (
    <aside className="w-60 border-r border-ink-200 bg-white shrink-0 overflow-y-auto">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wide font-bold text-ink-500">
          Report Folders
        </span>
        <button
          onClick={onAddFolder}
          className="h-6 w-6 rounded hover:bg-ink-100 flex items-center justify-center text-ink-500"
          title="New folder"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="pb-2">
        {SYSTEM_FOLDERS.map((f) => (
          <button
            key={f.id}
            onClick={() => onPick(f.id)}
            className={
              "w-full flex items-center justify-between px-4 py-2 text-[13px] " +
              (active === f.id
                ? "bg-brand/10 text-brand font-semibold"
                : "text-ink-700 hover:bg-ink-50")
            }
          >
            <span>{f.label}</span>
            <span className="text-[11px] text-ink-500">({counts[f.id] ?? 0})</span>
          </button>
        ))}
      </div>
      {customFolders.length > 0 && (
        <div className="border-t border-ink-100 pt-2">
          <div className="px-4 pb-1 text-[10px] uppercase font-bold text-ink-500 tracking-wide">
            Custom
          </div>
          {customFolders.map((f) => (
            <button
              key={f}
              onClick={() => onPick(f)}
              className={
                "w-full flex items-center gap-2 px-4 py-2 text-[13px] " +
                (active === f
                  ? "bg-brand/10 text-brand font-semibold"
                  : "text-ink-700 hover:bg-ink-50")
              }
            >
              <Folder className="h-3.5 w-3.5" />
              {f}
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}
