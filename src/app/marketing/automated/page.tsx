"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Info, MoreHorizontal } from "lucide-react";
import { MarketingTabs } from "../../../components/marketing/MarketingTabs";
import { AutomationSetup } from "../../../components/marketing/AutomationSetup";
import { AUTOMATIONS, type Automation, type AutomationStatus } from "../../../lib/marketing";

export default function AutomatedPage() {
  const [rows, setRows] = useState<Automation[]>(AUTOMATIONS);
  const [period, setPeriod] = useState({ start: "2026-04-01", end: "2026-04-30" });
  const [periodOpen, setPeriodOpen] = useState(false);
  const [setup, setSetup] = useState<Automation | null>(null);

  const liveRows = rows.filter((r) => r.status === "live");
  const totalRecipients = liveRows.reduce((s, r) => s + (r.recipients ?? 0), 0);
  const totalAppts = liveRows.reduce((s, r) => s + (r.appointments ?? 0), 0);
  const totalSales = liveRows.reduce((s, r) => s + (r.sales ?? 0), 0);

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-ink-50">
      <MarketingTabs active="automated" />

      <div className="px-6 py-4 bg-white border-b border-ink-200 flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-ink-900">Automated campaigns</h1>
        <PeriodPicker
          period={period}
          open={periodOpen}
          onToggle={setPeriodOpen}
          onApply={(p) => { setPeriod(p); setPeriodOpen(false); }}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* KPI tiles */}
        <div className="grid grid-cols-4 gap-4">
          <Kpi label="Recipients" value={totalRecipients.toLocaleString()} info />
          <Kpi label="Booked appointments" value={totalAppts.toLocaleString()} />
          <Kpi label="Completed appointments" value={Math.floor(totalAppts * 0.85).toLocaleString()} />
          <Kpi label="Total sales" value={`$${totalSales.toLocaleString()}`} />
        </div>

        {/* Automation rows */}
        <div className="rounded-lg border border-ink-200 bg-white overflow-hidden">
          {rows.map((r, idx) => (
            <Row
              key={r.id}
              r={r}
              isLast={idx === rows.length - 1}
              onSetup={() => setSetup(r)}
              onPause={() => {
                setRows((prev) => prev.map((x) => x.id === r.id ? { ...x, status: x.status === "paused" ? "live" : "paused" as AutomationStatus } : x));
              }}
              onEdit={() => setSetup(r)}
            />
          ))}
        </div>
      </div>

      {setup && (
        <AutomationSetup
          open={!!setup}
          name={setup.name}
          description={setup.description}
          onClose={() => setSetup(null)}
          onEnable={(cfg) => {
            setRows((prev) =>
              prev.map((x) =>
                x.id === setup.id
                  ? {
                      ...x,
                      status: "live",
                      channel: cfg.channel as Automation["channel"],
                      recipients: x.recipients ?? Math.floor(Math.random() * 800 + 200),
                      appointments: x.appointments ?? Math.floor(Math.random() * 30 + 5),
                      sales: x.sales ?? Math.floor(Math.random() * 4000 + 500),
                    }
                  : x,
              ),
            );
            setSetup(null);
          }}
        />
      )}
    </div>
  );
}

function Kpi({ label, value, info }: { label: string; value: string; info?: boolean }) {
  return (
    <div className="rounded-lg border border-ink-200 bg-white p-4">
      <div className="text-[11px] uppercase tracking-wide font-bold text-ink-500 inline-flex items-center gap-1">
        {label}
        {info && <Info className="h-3 w-3 text-ink-400" />}
      </div>
      <div className="mt-1 text-[24px] font-bold text-ink-900">{value}</div>
    </div>
  );
}

function Row({
  r, isLast, onSetup, onPause, onEdit,
}: {
  r: Automation;
  isLast: boolean;
  onSetup: () => void;
  onPause: () => void;
  onEdit: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [menuOpen]);

  return (
    <div className={"flex items-center gap-4 px-5 py-4 " + (!isLast ? "border-b border-ink-100" : "")}>
      <div className="h-10 w-10 rounded-full bg-brand-100 text-brand flex items-center justify-center text-[18px]">
        {r.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="text-[14px] font-semibold text-ink-900">{r.name}</div>
          {r.status === "live" && (
            <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700">
              ● LIVE
            </span>
          )}
          {r.status === "paused" && (
            <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700">
              ❙❙ PAUSED
            </span>
          )}
        </div>
        <div className="text-[12px] text-ink-500 mt-0.5">{r.description}</div>
      </div>

      {r.status === "live" ? (
        <>
          <Stat label="Sent by" value={
            r.channel === "both" ? "Email + Text" : r.channel === "text" ? "Text only" : "Email only"
          } />
          <Stat label="Recipients" value={r.recipients?.toLocaleString() ?? "—"} />
          <Stat label="Appointments" value={r.appointments?.toLocaleString() ?? "—"} />
          <Stat label="Sales" value={r.sales != null ? `$${r.sales.toLocaleString()}` : "—"} />
          <div ref={ref} className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="h-8 w-8 rounded hover:bg-ink-100 flex items-center justify-center text-ink-500"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 z-30 w-44 bg-white rounded-lg border border-ink-200 shadow-xl py-1">
                <button onClick={() => { onEdit(); setMenuOpen(false); }} className="w-full text-left px-3 py-1.5 text-[14px] text-ink-900 hover:bg-ink-50">
                  Edit settings
                </button>
                <button onClick={() => { onPause(); setMenuOpen(false); }} className="w-full text-left px-3 py-1.5 text-[14px] text-amber-700 hover:bg-amber-50">
                  Pause campaign
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <button
          onClick={onSetup}
          className="h-9 px-4 rounded border border-stone-400 bg-white text-[14px] font-semibold text-ink-700 hover:bg-stone-100"
        >
          {r.status === "paused" ? "Resume" : "Enable"}
        </button>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right min-w-[88px]">
      <div className="text-[10px] uppercase font-bold tracking-wide text-ink-500">{label}</div>
      <div className="text-[14px] font-semibold text-ink-900">{value}</div>
    </div>
  );
}

function PeriodPicker({
  period, open, onToggle, onApply,
}: {
  period: { start: string; end: string };
  open: boolean;
  onToggle: (v: boolean) => void;
  onApply: (p: { start: string; end: string }) => void;
}) {
  const [draft, setDraft] = useState(period);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    setDraft(period);
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onToggle(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open, onToggle, period]);

  const presets: { label: string; range: () => { start: string; end: string } }[] = [
    { label: "Today", range: () => ({ start: today(), end: today() }) },
    { label: "Yesterday", range: () => { const d = new Date(); d.setDate(d.getDate() - 1); return { start: iso(d), end: iso(d) }; } },
    { label: "Last Week", range: () => { const e = new Date(); const s = new Date(); s.setDate(e.getDate() - 7); return { start: iso(s), end: iso(e) }; } },
    { label: "Last Month", range: () => { const d = new Date(); const s = new Date(d.getFullYear(), d.getMonth() - 1, 1); const e = new Date(d.getFullYear(), d.getMonth(), 0); return { start: iso(s), end: iso(e) }; } },
    { label: "Last Year", range: () => { const d = new Date(); const s = new Date(d.getFullYear() - 1, 0, 1); const e = new Date(d.getFullYear() - 1, 11, 31); return { start: iso(s), end: iso(e) }; } },
    { label: "Week to Date", range: () => { const d = new Date(); const s = new Date(d); s.setDate(d.getDate() - d.getDay()); return { start: iso(s), end: iso(d) }; } },
    { label: "Month to Date", range: () => { const d = new Date(); const s = new Date(d.getFullYear(), d.getMonth(), 1); return { start: iso(s), end: iso(d) }; } },
    { label: "Year to Date", range: () => { const d = new Date(); const s = new Date(d.getFullYear(), 0, 1); return { start: iso(s), end: iso(d) }; } },
  ];

  function today() { return iso(new Date()); }
  function iso(d: Date) { return d.toISOString().slice(0, 10); }
  function fmt(s: string) {
    const d = new Date(s);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => onToggle(!open)}
        className="h-9 px-3 rounded border border-stone-400 bg-white text-[14px] font-medium text-ink-700 hover:bg-stone-100 inline-flex items-center gap-2"
      >
        {fmt(period.start)} – {fmt(period.end)}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-[480px] bg-white rounded-lg border border-ink-200 shadow-xl flex">
          <div className="w-44 border-r border-ink-200 py-2 max-h-[280px] overflow-y-auto">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => setDraft(p.range())}
                className="w-full text-left px-3 py-1.5 text-[12px] text-ink-700 hover:bg-ink-50"
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex-1 p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-[10px] uppercase font-bold text-ink-500 mb-1">Start</span>
                <input
                  type="date" value={draft.start}
                  onChange={(e) => setDraft({ ...draft, start: e.target.value })}
                  className="w-full h-9 px-2 rounded border border-ink-300 bg-white text-[14px]"
                />
              </label>
              <label className="block">
                <span className="block text-[10px] uppercase font-bold text-ink-500 mb-1">End</span>
                <input
                  type="date" value={draft.end}
                  onChange={(e) => setDraft({ ...draft, end: e.target.value })}
                  className="w-full h-9 px-2 rounded border border-ink-300 bg-white text-[14px]"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => onToggle(false)}
                className="h-8 px-3 text-[12px] rounded border border-ink-300 text-ink-700 hover:bg-ink-50"
              >
                Cancel
              </button>
              <button
                onClick={() => onApply(draft)}
                className="h-8 px-3 text-[12px] rounded bg-brand text-white font-semibold hover:bg-brand-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
