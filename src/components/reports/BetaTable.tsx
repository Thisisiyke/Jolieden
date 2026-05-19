"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Star,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  Trash2,
  Edit3,
  Copy,
  FolderInput,
  Share2,
} from "lucide-react";
import type { BetaReport } from "../../lib/reports";

export type BetaSortKey = "name" | "description" | "folder" | "createdBy" | "shared" | "updatedAt";
type SortDir = "asc" | "desc";

export function BetaTable({
  rows,
  selected,
  onToggleSelect,
  onSelectAll,
  onToggleFavorite,
  onTrash,
}: {
  rows: BetaReport[];
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: (all: boolean) => void;
  onToggleFavorite: (id: string) => void;
  onTrash: (ids: string[]) => void;
}) {
  const [sortKey, setSortKey] = useState<BetaSortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = [...rows].sort((a, b) => {
    const sa = String(getKey(a, sortKey)).toLowerCase();
    const sb = String(getKey(b, sortKey)).toLowerCase();
    if (sa < sb) return sortDir === "asc" ? -1 : 1;
    if (sa > sb) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const toggleSort = (k: BetaSortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir(k === "updatedAt" ? "desc" : "asc"); }
  };

  const allChecked = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const someChecked = selected.size > 0 && !allChecked;

  return (
    <div className="rounded-lg border border-ink-200 bg-white overflow-hidden">
      {selected.size > 0 ? (
        <BulkBar
          count={selected.size}
          onTrash={() => onTrash(Array.from(selected))}
          onClear={() => onSelectAll(false)}
        />
      ) : (
        <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-ink-50 border-b border-ink-200 text-[10px] uppercase font-bold tracking-wide text-ink-500 items-center">
          <div className="col-span-1 flex items-center">
            <input
              type="checkbox"
              checked={allChecked}
              ref={(el) => { if (el) el.indeterminate = someChecked; }}
              onChange={(e) => onSelectAll(e.target.checked)}
              className="h-4 w-4 accent-[color:var(--brand)]"
            />
          </div>
          <Th k="name" label="Report Name" sortKey={sortKey} sortDir={sortDir} toggle={toggleSort} className="col-span-3" />
          <Th k="description" label="Description" sortKey={sortKey} sortDir={sortDir} toggle={toggleSort} className="col-span-3" />
          <Th k="folder" label="Folder" sortKey={sortKey} sortDir={sortDir} toggle={toggleSort} className="col-span-1" />
          <Th k="createdBy" label="Created By" sortKey={sortKey} sortDir={sortDir} toggle={toggleSort} className="col-span-1" />
          <Th k="shared" label="Shared" sortKey={sortKey} sortDir={sortDir} toggle={toggleSort} className="col-span-1" />
          <Th k="updatedAt" label="Updated At" sortKey={sortKey} sortDir={sortDir} toggle={toggleSort} className="col-span-2" />
        </div>
      )}

      <div>
        {sorted.map((r) => (
          <Row
            key={r.id}
            r={r}
            checked={selected.has(r.id)}
            onCheck={() => onToggleSelect(r.id)}
            onFav={() => onToggleFavorite(r.id)}
            onTrash={() => onTrash([r.id])}
          />
        ))}
        {sorted.length === 0 && (
          <div className="py-16 text-center text-ink-500 text-[14px]">
            No reports in this folder.
          </div>
        )}
      </div>
    </div>
  );
}

function getKey(r: BetaReport, k: BetaSortKey): string {
  switch (k) {
    case "name": return r.name;
    case "description": return r.description;
    case "folder": return r.folder;
    case "createdBy": return r.createdBy;
    case "shared": return r.shared ? "1" : "0";
    case "updatedAt": return r.updatedAt;
  }
}

function Th({
  k, label, sortKey, sortDir, toggle, className = "",
}: {
  k: BetaSortKey;
  label: string;
  sortKey: BetaSortKey;
  sortDir: SortDir;
  toggle: (k: BetaSortKey) => void;
  className?: string;
}) {
  const active = sortKey === k;
  return (
    <button
      onClick={() => toggle(k)}
      className={
        "text-left inline-flex items-center gap-1 hover:text-ink-900 " +
        (active ? "text-ink-900" : "") +
        " " + className
      }
    >
      {label}
      {active ? (
        sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
      ) : null}
    </button>
  );
}

function BulkBar({ count, onTrash, onClear }: { count: number; onTrash: () => void; onClear: () => void }) {
  return (
    <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-brand text-white items-center">
      <div className="col-span-1">
        <button onClick={onClear} className="h-5 w-5 rounded bg-white/20 text-white text-[12px]">×</button>
      </div>
      <div className="col-span-9 text-[14px] font-semibold">{count} selected</div>
      <div className="col-span-2 flex justify-end">
        <button
          onClick={onTrash}
          className="h-8 px-3 rounded bg-white text-brand text-[12px] font-semibold inline-flex items-center gap-1.5 hover:bg-white/90"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
      </div>
    </div>
  );
}

function Row({
  r, checked, onCheck, onFav, onTrash,
}: {
  r: BetaReport;
  checked: boolean;
  onCheck: () => void;
  onFav: () => void;
  onTrash: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [menuOpen]);

  return (
    <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-ink-100 last:border-b-0 items-center hover:bg-ink-50">
      <div className="col-span-1">
        <input
          type="checkbox"
          checked={checked}
          onChange={onCheck}
          className="h-4 w-4 accent-[color:var(--brand)]"
        />
      </div>
      <div className="col-span-3">
        <Link href={`/reports/beta/${r.id}`} className="text-[14px] font-semibold text-ink-900 hover:text-brand">
          {r.name}
        </Link>
      </div>
      <div className="col-span-3 text-[14px] text-ink-700 truncate">{r.description}</div>
      <div className="col-span-1 text-[12px] text-ink-700 truncate">{r.folder}</div>
      <div className="col-span-1 text-[12px] text-ink-700 truncate">{r.createdBy}</div>
      <div className="col-span-1 text-[12px] text-ink-500">
        {r.shared ? "Shared" : "No Viewers"}
      </div>
      <div className="col-span-2 flex items-center justify-between gap-2">
        <span className="text-[12px] text-ink-700">{r.updatedAt}</span>
        <div className="flex items-center">
          <button
            onClick={onFav}
            className="h-8 w-8 rounded hover:bg-ink-100 flex items-center justify-center"
            title="Favorite"
          >
            <Star
              className={"h-4 w-4 " + (r.favorite ? "text-amber-400 fill-amber-400" : "text-ink-300")}
            />
          </button>
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="h-8 w-8 rounded hover:bg-ink-100 flex items-center justify-center text-ink-500"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 z-30 w-48 bg-white rounded-lg border border-ink-200 shadow-xl py-1">
                {[
                  { icon: Edit3, label: "Rename" },
                  { icon: FolderInput, label: "Move…" },
                  { icon: Copy, label: "Duplicate" },
                  { icon: Share2, label: "Share…" },
                ].map((it) => (
                  <button
                    key={it.label}
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[14px] text-ink-900 hover:bg-ink-50"
                  >
                    <it.icon className="h-3.5 w-3.5 text-ink-500" />
                    {it.label}
                  </button>
                ))}
                <div className="border-t border-ink-100 my-1" />
                <button
                  onClick={() => { onTrash(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[14px] text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Move to trash
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
