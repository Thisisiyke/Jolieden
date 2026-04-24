"use client";

import { useMemo, useState } from "react";
import { Drawer } from "../Drawer";
import { Avatar } from "../Avatar";
import { Search, Check } from "lucide-react";
import type { Client } from "../../lib/data";

export function MergeClientsDrawer({
  open,
  onClose,
  clients,
  onMerge,
}: {
  open: boolean;
  onClose: () => void;
  clients: Client[];
  onMerge: (keepId: string, mergedIds: string[]) => void;
}) {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [primary, setPrimary] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!q.trim()) return clients.slice(0, 20);
    const s = q.toLowerCase();
    return clients.filter(
      (c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(s) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(s),
    );
  }, [q, clients]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        if (primary === id) setPrimary(null);
        return prev.filter((x) => x !== id);
      }
      return [...prev, id];
    });
  };

  const reset = () => {
    setQ(""); setSelected([]); setPrimary(null);
  };

  return (
    <Drawer
      open={open}
      onClose={() => { reset(); onClose(); }}
      title="Merge clients"
      width="max-w-xl"
      footer={
        <div className="flex items-center justify-between">
          <div className="text-[12px] text-ink-500">
            {selected.length === 0
              ? "Pick 2+ records to merge."
              : `${selected.length} selected${primary ? " · primary set" : ""}`}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { reset(); onClose(); }} className="h-9 px-3 rounded border border-ink-300 text-ink-700 text-[13px] hover:bg-ink-50">
              Cancel
            </button>
            <button
              disabled={selected.length < 2 || !primary}
              onClick={() => {
                if (!primary) return;
                onMerge(primary, selected.filter((x) => x !== primary));
                reset();
                onClose();
              }}
              className="h-9 px-4 rounded bg-brand text-white text-[13px] font-semibold hover:bg-brand-700 disabled:opacity-50"
            >
              Merge into primary
            </button>
          </div>
        </div>
      }
    >
      <div className="px-5 py-3 border-b border-ink-200 relative">
        <Search className="h-4 w-4 text-ink-500 absolute left-8 top-1/2 -translate-y-1/2" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, phone, or email"
          className="w-full h-10 pl-9 pr-3 rounded border border-ink-300 bg-white text-[13px] outline-none focus:border-brand"
        />
      </div>
      <div className="divide-y divide-ink-100">
        {filtered.map((c) => {
          const isSel = selected.includes(c.id);
          const isPrimary = primary === c.id;
          return (
            <div
              key={c.id}
              className={
                "flex items-center gap-3 px-5 py-3 " +
                (isSel ? "bg-brand-50/50" : "hover:bg-ink-50")
              }
            >
              <input
                type="checkbox"
                checked={isSel}
                onChange={() => toggle(c.id)}
                className="h-4 w-4 accent-[color:var(--brand)]"
              />
              <Avatar name={`${c.firstName} ${c.lastName}`} hue={c.avatarHue} />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-ink-900 truncate">
                  {c.firstName} {c.lastName}
                </div>
                <div className="text-[11px] text-ink-500 truncate">
                  {c.phone} · {c.email} · {c.visits} visits
                </div>
              </div>
              {isSel && (
                <button
                  onClick={() => setPrimary(c.id)}
                  className={
                    "text-[11px] font-semibold px-2 py-1 rounded border " +
                    (isPrimary
                      ? "bg-brand text-white border-brand"
                      : "text-ink-700 border-ink-300 hover:bg-ink-50")
                  }
                >
                  {isPrimary && <Check className="inline h-3 w-3 mr-1" />}
                  {isPrimary ? "Primary" : "Set primary"}
                </button>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-16 text-center text-ink-500 text-[13px]">
            No matching clients.
          </div>
        )}
      </div>
    </Drawer>
  );
}
