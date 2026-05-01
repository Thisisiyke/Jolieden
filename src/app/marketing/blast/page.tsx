"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Mail, MessageCircle, ChevronDown, ChevronUp, MoreHorizontal, Plus,
} from "lucide-react";
import { MarketingTabs } from "../../../components/marketing/MarketingTabs";
import { BlastWizard } from "../../../components/marketing/BlastWizard";
import {
  BLAST_CAMPAIGNS, type BlastCampaign, type Channel,
} from "../../../lib/marketing";

type SortKey = "name" | "status" | "sendDate" | "sent" | "clicked" | "unsubscribed";
type SortDir = "asc" | "desc";

export default function BlastPage() {
  const [rows, setRows] = useState<BlastCampaign[]>(BLAST_CAMPAIGNS);
  const [sortKey, setSortKey] = useState<SortKey>("sendDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [newOpen, setNewOpen] = useState(false);
  const newRef = useRef<HTMLDivElement>(null);
  const [wizard, setWizard] = useState<{ campaign?: BlastCampaign; channel: Channel } | null>(null);

  useEffect(() => {
    if (!newOpen) return;
    const h = (e: MouseEvent) => {
      if (newRef.current && !newRef.current.contains(e.target as Node))
        setNewOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [newOpen]);

  const sorted = useMemo(() => {
    const get = (r: BlastCampaign): string | number => {
      switch (sortKey) {
        case "name": return r.name.toLowerCase();
        case "status": return r.status;
        case "sendDate": return r.sendDate ?? "";
        case "sent": return r.sent ?? 0;
        case "clicked": return r.clicked ?? 0;
        case "unsubscribed": return r.unsubscribed ?? 0;
      }
    };
    return [...rows].sort((a, b) => {
      const va = get(a), vb = get(b);
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, sortKey, sortDir]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir(k === "name" ? "asc" : "desc"); }
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-ink-50">
      <MarketingTabs active="blast" />

      <div className="px-6 py-4 flex items-center justify-between bg-white border-b border-ink-200">
        <h1 className="text-[20px] font-semibold text-ink-900">Blast campaigns</h1>
        <div ref={newRef} className="relative">
          <button
            onClick={() => setNewOpen((v) => !v)}
            className="h-9 px-3 rounded bg-brand text-white text-[13px] font-semibold hover:bg-brand-700 inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> New campaign <ChevronDown className="h-3 w-3" />
          </button>
          {newOpen && (
            <div className="absolute right-0 top-full mt-1 z-30 w-48 bg-white rounded-lg border border-ink-200 shadow-xl py-1">
              {([
                { ch: "email", label: "Email", icon: Mail },
                { ch: "text", label: "Text", icon: MessageCircle },
              ] as const).map((opt) => (
                <button
                  key={opt.ch}
                  onClick={() => { setWizard({ channel: opt.ch }); setNewOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-ink-900 hover:bg-ink-50"
                >
                  <opt.icon className="h-4 w-4 text-ink-500" />
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="rounded-lg border border-ink-200 bg-white overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-ink-50 border-b border-ink-200 text-[10px] uppercase font-bold tracking-wide text-ink-500">
            <div className="col-span-1" />
            <Th k="name" label="Campaign Name" sortKey={sortKey} sortDir={sortDir} toggle={toggleSort} className="col-span-3" />
            <Th k="status" label="Status" sortKey={sortKey} sortDir={sortDir} toggle={toggleSort} className="col-span-2" />
            <Th k="sendDate" label="Send Date" sortKey={sortKey} sortDir={sortDir} toggle={toggleSort} className="col-span-2" />
            <Th k="sent" label="Sent" sortKey={sortKey} sortDir={sortDir} toggle={toggleSort} className="col-span-1 text-right" right />
            <Th k="clicked" label="Clicked" sortKey={sortKey} sortDir={sortDir} toggle={toggleSort} className="col-span-1 text-right" right />
            <Th k="unsubscribed" label="Unsub" sortKey={sortKey} sortDir={sortDir} toggle={toggleSort} className="col-span-1 text-right" right />
            <div className="col-span-1" />
          </div>
          {sorted.map((r) => (
            <Row
              key={r.id} r={r}
              onEdit={() => setWizard({ campaign: r, channel: r.channel })}
              onDuplicate={() => {
                const dup: BlastCampaign = { ...r, id: `bc${Date.now()}`, name: `${r.name} (copy)`, status: "draft", sent: undefined, clicked: undefined, unsubscribed: undefined, sendDate: undefined };
                setRows((prev) => [dup, ...prev]);
              }}
              onRename={() => {
                const next = prompt("Rename campaign", r.name);
                if (next?.trim()) setRows((prev) => prev.map((x) => x.id === r.id ? { ...x, name: next.trim() } : x));
              }}
              onDelete={() => setRows((prev) => prev.filter((x) => x.id !== r.id))}
            />
          ))}
        </div>
      </div>

      {wizard && (
        <BlastWizard
          campaign={wizard.campaign}
          channel={wizard.channel}
          onClose={() => setWizard(null)}
          onSave={(c) => {
            setRows((prev) => {
              const idx = prev.findIndex((x) => x.id === c.id);
              if (idx >= 0) return prev.map((x, i) => i === idx ? c : x);
              return [c, ...prev];
            });
          }}
        />
      )}
    </div>
  );
}

function Th({
  k, label, sortKey, sortDir, toggle, className = "", right,
}: {
  k: SortKey; label: string; sortKey: SortKey; sortDir: SortDir;
  toggle: (k: SortKey) => void; className?: string; right?: boolean;
}) {
  const active = sortKey === k;
  return (
    <button
      onClick={() => toggle(k)}
      className={
        (right ? "justify-end " : "") +
        "flex items-center gap-1 hover:text-ink-900 " +
        (active ? "text-ink-900 " : "") + className
      }
    >
      {label}
      {active ? (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : null}
    </button>
  );
}

function Row({
  r, onEdit, onDuplicate, onRename, onDelete,
}: {
  r: BlastCampaign;
  onEdit: () => void;
  onDuplicate: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [menuOpen]);

  const Icon = r.channel === "email" ? Mail : MessageCircle;
  return (
    <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-ink-100 last:border-b-0 items-center hover:bg-ink-50">
      <div className="col-span-1">
        <div className="h-8 w-8 rounded-full bg-brand-100 text-brand flex items-center justify-center">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="col-span-3 text-[13px] font-semibold text-ink-900 truncate">{r.name}</div>
      <div className="col-span-2">
        <StatusPill s={r.status} />
      </div>
      <div className="col-span-2 text-[13px] text-ink-700">{r.sendDate ?? "—"}</div>
      <div className="col-span-1 text-right text-[13px] text-ink-700">{r.sent?.toLocaleString() ?? "—"}</div>
      <div className="col-span-1 text-right text-[13px] text-ink-700">{r.clicked?.toLocaleString() ?? "—"}</div>
      <div className="col-span-1 text-right text-[13px] text-ink-700">{r.unsubscribed?.toLocaleString() ?? "—"}</div>
      <div className="col-span-1 flex justify-end">
        <div ref={ref} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="h-8 w-8 rounded hover:bg-ink-100 flex items-center justify-center text-ink-500"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-30 w-44 bg-white rounded-lg border border-ink-200 shadow-xl py-1">
              {r.status === "draft" ? (
                <>
                  <Item onClick={() => { onEdit(); setMenuOpen(false); }}>Edit</Item>
                  <Item onClick={() => { onRename(); setMenuOpen(false); }}>Rename</Item>
                  <Item onClick={() => { onDuplicate(); setMenuOpen(false); }}>Duplicate</Item>
                  <div className="border-t border-ink-100 my-1" />
                  <Item danger onClick={() => { onDelete(); setMenuOpen(false); }}>Delete</Item>
                </>
              ) : (
                <>
                  <Item onClick={() => setMenuOpen(false)}>View report</Item>
                  <Item onClick={() => { onDuplicate(); setMenuOpen(false); }}>Duplicate</Item>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Item({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={"w-full text-left px-3 py-1.5 text-[13px] hover:bg-ink-50 " + (danger ? "text-rose-600 hover:bg-rose-50" : "text-ink-900")}
    >
      {children}
    </button>
  );
}

function StatusPill({ s }: { s: BlastCampaign["status"] }) {
  const m = s === "draft"
    ? { label: "Draft", cls: "bg-ink-100 text-ink-700" }
    : { label: "Completed", cls: "bg-emerald-100 text-emerald-700" };
  return (
    <span className={"inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold " + m.cls}>
      {m.label}
    </span>
  );
}
