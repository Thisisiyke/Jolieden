"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { parseISODate, toISO, TODAY_ISO } from "../lib/date";

const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function monthGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const lead = first.getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function DatePickerDropdown({
  value,
  onPick,
  onClose,
}: {
  value: string;
  onPick: (iso: string) => void;
  onClose: () => void;
}) {
  const picked = parseISODate(value);
  const [cursor, setCursor] = useState(
    new Date(picked.getFullYear(), picked.getMonth(), 1),
  );

  const months = [
    new Date(cursor.getFullYear(), cursor.getMonth(), 1),
    new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1),
  ];

  return (
    <div
      className="absolute left-0 top-full mt-1 z-30 w-[560px] bg-white rounded-lg shadow-xl border border-ink-200 p-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() =>
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
          }
          className="h-7 w-7 rounded hover:bg-ink-100 flex items-center justify-center"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 grid grid-cols-2 text-center">
          {months.map((m) => (
            <div
              key={m.toISOString()}
              className="text-[14px] font-semibold text-ink-900"
            >
              {m.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </div>
          ))}
        </div>
        <button
          onClick={() =>
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
          }
          className="h-7 w-7 rounded hover:bg-ink-100 flex items-center justify-center"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {months.map((m) => (
          <div key={m.toISOString()}>
            <div className="grid grid-cols-7 gap-y-1 text-center text-[10px] text-ink-500 mb-1">
              {DOW.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-1 text-center">
              {monthGrid(m.getFullYear(), m.getMonth()).map((d, i) => {
                if (!d) return <div key={i} />;
                const iso = toISO(d);
                const isToday = iso === TODAY_ISO;
                const isPicked = iso === value;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      onPick(iso);
                      onClose();
                    }}
                    className={
                      "mx-auto h-7 w-7 rounded-full text-[12px] flex items-center justify-center " +
                      (isPicked
                        ? "bg-brand text-white font-semibold"
                        : isToday
                          ? "bg-sky-500 text-white font-semibold"
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
    </div>
  );
}
