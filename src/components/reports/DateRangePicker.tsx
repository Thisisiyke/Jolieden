"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { parseISODate, toISO } from "../../lib/date";

const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const PRESETS: { label: string; range: () => [string, string] }[] = [
  { label: "Today", range: () => [toISO(new Date()), toISO(new Date())] },
  { label: "Yesterday", range: () => { const d = new Date(); d.setDate(d.getDate() - 1); return [toISO(d), toISO(d)]; } },
  { label: "Week to Date", range: () => { const d = new Date(); const s = new Date(d); s.setDate(d.getDate() - d.getDay()); return [toISO(s), toISO(d)]; } },
  { label: "Last Week", range: () => { const d = new Date(); const e = new Date(d); e.setDate(d.getDate() - d.getDay() - 1); const s = new Date(e); s.setDate(e.getDate() - 6); return [toISO(s), toISO(e)]; } },
  { label: "Month to Date", range: () => { const d = new Date(); const s = new Date(d.getFullYear(), d.getMonth(), 1); return [toISO(s), toISO(d)]; } },
  { label: "Last Month", range: () => { const d = new Date(); const s = new Date(d.getFullYear(), d.getMonth() - 1, 1); const e = new Date(d.getFullYear(), d.getMonth(), 0); return [toISO(s), toISO(e)]; } },
  { label: "Year to Date", range: () => { const d = new Date(); const s = new Date(d.getFullYear(), 0, 1); return [toISO(s), toISO(d)]; } },
  { label: "Last Year", range: () => { const d = new Date(); const s = new Date(d.getFullYear() - 1, 0, 1); const e = new Date(d.getFullYear() - 1, 11, 31); return [toISO(s), toISO(e)]; } },
];

function monthCells(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const lead = first.getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function fmtUS(iso: string) {
  const d = parseISODate(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
}

export function DateRangePicker({
  start,
  end,
  onApply,
}: {
  start: string;
  end: string;
  onApply: (s: string, e: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draftStart, setDraftStart] = useState(start);
  const [draftEnd, setDraftEnd] = useState(end);
  const [cursor, setCursor] = useState(() => parseISODate(start));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const months = [
    new Date(cursor.getFullYear(), cursor.getMonth(), 1),
    new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1),
  ];

  const pickDate = (iso: string) => {
    if (!draftStart || (draftStart && draftEnd)) {
      setDraftStart(iso); setDraftEnd("");
    } else if (parseISODate(iso) < parseISODate(draftStart)) {
      setDraftStart(iso); setDraftEnd("");
    } else {
      setDraftEnd(iso);
    }
  };

  const display = `${fmtUS(start)} – ${fmtUS(end)}`;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          setDraftStart(start); setDraftEnd(end);
          setCursor(parseISODate(start));
          setOpen((v) => !v);
        }}
        className="h-9 px-3 rounded border border-stone-400 bg-white hover:bg-stone-100 text-[13px] font-medium text-ink-700 inline-flex items-center gap-2"
      >
        📅 {display}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-[680px] bg-white rounded-lg shadow-xl border border-ink-200 flex">
          {/* Calendars */}
          <div className="flex-1 p-4">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
                className="h-7 w-7 rounded hover:bg-ink-100 flex items-center justify-center"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex-1 grid grid-cols-2 text-center">
                {months.map((m) => (
                  <div key={m.toISOString()} className="text-[13px] font-semibold text-ink-900">
                    {m.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
                className="h-7 w-7 rounded hover:bg-ink-100 flex items-center justify-center"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {months.map((m) => (
                <div key={m.toISOString()}>
                  <div className="grid grid-cols-7 gap-y-1 text-center text-[10px] text-ink-500 mb-1">
                    {DOW.map((d) => <div key={d}>{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-y-1 text-center">
                    {monthCells(m.getFullYear(), m.getMonth()).map((d, i) => {
                      if (!d) return <div key={i} />;
                      const iso = toISO(d);
                      const isStart = iso === draftStart;
                      const isEnd = iso === draftEnd;
                      const inRange = draftStart && draftEnd && iso > draftStart && iso < draftEnd;
                      return (
                        <button
                          key={i}
                          onClick={() => pickDate(iso)}
                          className={
                            "mx-auto h-7 w-7 rounded-full text-[12px] flex items-center justify-center " +
                            (isStart || isEnd
                              ? "bg-brand text-white font-semibold"
                              : inRange
                                ? "bg-brand-100 text-brand"
                                : "hover:bg-ink-100 text-ink-700")
                          }
                        >
                          {d.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <label className="block">
                <span className="block text-[10px] uppercase tracking-wide text-ink-500 mb-1 font-bold">Start Date</span>
                <input
                  value={draftStart ? fmtUS(draftStart) : ""}
                  readOnly
                  className="w-full h-9 px-2 rounded border border-ink-300 bg-white text-[13px]"
                />
              </label>
              <label className="block">
                <span className="block text-[10px] uppercase tracking-wide text-ink-500 mb-1 font-bold">End Date</span>
                <input
                  value={draftEnd ? fmtUS(draftEnd) : ""}
                  readOnly
                  className="w-full h-9 px-2 rounded border border-ink-300 bg-white text-[13px]"
                />
              </label>
            </div>
          </div>

          {/* Presets */}
          <div className="w-44 border-l border-ink-200 py-2 flex flex-col">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  const [s, e] = p.range();
                  setDraftStart(s); setDraftEnd(e);
                  setCursor(parseISODate(s));
                }}
                className="text-left px-3 py-1.5 text-[12px] text-ink-700 hover:bg-ink-50"
              >
                {p.label}
              </button>
            ))}
            <div className="flex-1" />
            <div className="border-t border-ink-200 px-3 py-2 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="h-8 px-3 text-[12px] rounded border border-ink-300 text-ink-700 hover:bg-ink-50"
              >
                Cancel
              </button>
              <button
                disabled={!draftStart || !draftEnd}
                onClick={() => {
                  onApply(draftStart, draftEnd);
                  setOpen(false);
                }}
                className="h-8 px-3 text-[12px] rounded bg-brand text-white font-semibold hover:bg-brand-700 disabled:opacity-50"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
