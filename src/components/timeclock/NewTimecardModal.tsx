"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { CustomSelect } from "../CustomSelect";
import { STAFF_DIRECTORY } from "../../lib/manage";
import type { Timecard } from "../../lib/timeclock";

export function NewTimecardModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (tc: Omit<Timecard, "id">) => void;
}) {
  const [staffId, setStaffId] = useState(STAFF_DIRECTORY[0].id);
  const [inDate, setInDate] = useState("2026-05-18");
  const [inTime, setInTime] = useState("09:00");
  const [active, setActive] = useState(false);
  const [outDate, setOutDate] = useState("2026-05-18");
  const [outTime, setOutTime] = useState("17:00");
  const [reason, setReason] = useState("");

  if (!open) return null;

  const reset = () => {
    setStaffId(STAFF_DIRECTORY[0].id);
    setInDate("2026-05-18"); setInTime("09:00");
    setActive(false);
    setOutDate("2026-05-18"); setOutTime("17:00");
    setReason("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={() => { reset(); onClose(); }}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-2xl w-full max-w-md"
      >
        <header className="h-12 px-5 flex items-center justify-between border-b border-ink-200">
          <h2 className="text-[15px] font-semibold text-ink-900">New Timecard</h2>
          <button
            onClick={() => { reset(); onClose(); }}
            className="h-8 w-8 rounded hover:bg-ink-100 text-ink-500 flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="p-5 space-y-4 text-[14px]">
          <Field label="Staff">
            <CustomSelect
              value={staffId}
              onChange={setStaffId}
              options={STAFF_DIRECTORY.map((s) => ({ value: s.id, label: `${s.name} · ${s.role}` }))}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="In · date">
              <input type="date" value={inDate} onChange={(e) => setInDate(e.target.value)} className="input" />
            </Field>
            <Field label="In · time">
              <input type="time" value={inTime} onChange={(e) => setInTime(e.target.value)} className="input" />
            </Field>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 accent-[color:var(--brand)]"
            />
            <span className="text-[14px] text-ink-700">This shift is currently active</span>
          </label>

          {!active && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Out · date">
                <input type="date" value={outDate} onChange={(e) => setOutDate(e.target.value)} className="input" />
              </Field>
              <Field label="Out · time">
                <input type="time" value={outTime} onChange={(e) => setOutTime(e.target.value)} className="input" />
              </Field>
            </div>
          )}

          <Field label="Reason">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Why is this entry being created manually? (audit trail)"
              className="w-full p-2 rounded border border-ink-300 bg-white text-[14px] outline-none focus:border-brand resize-none"
            />
          </Field>
        </div>
        <footer className="px-5 py-3 border-t border-ink-200 flex justify-end gap-2">
          <button
            onClick={() => { reset(); onClose(); }}
            className="h-9 px-3 rounded border border-ink-300 text-ink-700 text-[14px] hover:bg-ink-50"
          >
            Cancel
          </button>
          <button
            disabled={!reason.trim()}
            onClick={() => {
              const fmt = (t: string) => {
                const [h, m] = t.split(":").map(Number);
                const ap = h >= 12 ? "pm" : "am";
                const hr = ((h + 11) % 12) + 1;
                return `${hr}:${String(m).padStart(2, "0")}${ap}`;
              };
              onCreate({
                staffId,
                date: inDate,
                timeIn: fmt(inTime),
                timeOut: active ? undefined : fmt(outTime),
                status: active ? "incomplete" : "complete",
                reason: reason.trim(),
              });
              reset(); onClose();
            }}
            className="h-9 px-4 rounded bg-emerald-600 text-white text-[14px] font-semibold hover:bg-emerald-700 disabled:opacity-50"
          >
            Create Timecard
          </button>
        </footer>
        <style jsx>{`
          .input {
            width: 100%;
            height: 36px;
            padding: 0 8px;
            border-radius: 6px;
            border: 1px solid var(--ink-300);
            background: white;
            font-size: 13px;
            outline: none;
          }
          .input:focus { border-color: var(--brand); }
        `}</style>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-wide font-bold text-ink-500 mb-1">{label}</span>
      {children}
    </label>
  );
}
