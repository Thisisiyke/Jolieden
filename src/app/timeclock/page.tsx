"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { DateRangePicker } from "../../components/reports/DateRangePicker";
import { CustomSelect } from "../../components/CustomSelect";
import { Avatar } from "../../components/Avatar";
import { StaffPicker } from "../../components/timeclock/StaffPicker";
import { NewTimecardModal } from "../../components/timeclock/NewTimecardModal";
import { STAFF_DIRECTORY } from "../../lib/manage";
import {
  TIMECARDS, STATUS_LABEL, statusPillClass,
  type Timecard, type TimecardStatus,
} from "../../lib/timeclock";
import { addDays, parseISODate, toISO } from "../../lib/date";

function fmtRange(s: string, e: string) {
  const f = (iso: string) => parseISODate(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return s === e ? f(s) : `${f(s)} – ${f(e)}`;
}

export default function TimeclockPage() {
  const [rows, setRows] = useState<Timecard[]>(TIMECARDS);
  const [start, setStart] = useState("2026-05-18");
  const [end, setEnd] = useState("2026-05-18");
  const [staffFilter, setStaffFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<TimecardStatus | "all">("all");
  const [showNew, setShowNew] = useState(false);

  const isMultiDay = start !== end;

  // Filter timecards
  const filtered = useMemo(() => {
    return rows.filter((tc) => {
      if (tc.date < start || tc.date > end) return false;
      if (staffFilter !== "ALL" && tc.staffId !== staffFilter) return false;
      if (statusFilter !== "all" && tc.status !== statusFilter) return false;
      return true;
    });
  }, [rows, start, end, staffFilter, statusFilter]);

  // For single-day view, build one row per staff (showing scheduled vs punched)
  const visibleStaff = staffFilter === "ALL"
    ? STAFF_DIRECTORY
    : STAFF_DIRECTORY.filter((s) => s.id === staffFilter);

  const clockIn = (staffId: string) => {
    const now = new Date();
    const hr = ((now.getHours() + 11) % 12) + 1;
    const ap = now.getHours() >= 12 ? "pm" : "am";
    const time = `${hr}:${String(now.getMinutes()).padStart(2, "0")}${ap}`;
    setRows((prev) => {
      const existing = prev.find((t) => t.date === start && t.staffId === staffId);
      if (existing) {
        return prev.map((t) =>
          t.id === existing.id ? { ...t, timeIn: time, status: "incomplete" } : t,
        );
      }
      return [
        ...prev,
        {
          id: `tc${Date.now()}`,
          staffId,
          date: start,
          scheduled: undefined,
          timeIn: time,
          status: "incomplete",
        },
      ];
    });
  };

  const clockOut = (staffId: string) => {
    const now = new Date();
    const hr = ((now.getHours() + 11) % 12) + 1;
    const ap = now.getHours() >= 12 ? "pm" : "am";
    const time = `${hr}:${String(now.getMinutes()).padStart(2, "0")}${ap}`;
    setRows((prev) =>
      prev.map((t) =>
        t.date === start && t.staffId === staffId && !t.timeOut
          ? { ...t, timeOut: time, status: "complete" }
          : t,
      ),
    );
  };

  const today = toISO(new Date());
  const goToday = () => { setStart(today); setEnd(today); };
  const stepDay = (d: number) => { setStart(addDays(start, d)); setEnd(addDays(end, d)); };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-ink-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-ink-200 px-6 py-3 flex items-center gap-3 flex-wrap">
        <DateRangePicker
          start={start} end={end}
          onApply={(s, e) => { setStart(s); setEnd(e); }}
        />
        <StaffPicker value={staffFilter} onChange={setStaffFilter} />
        <div className="min-w-[180px]">
          <CustomSelect
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as TimecardStatus | "all")}
            options={[
              { value: "all", label: STATUS_LABEL.all },
              { value: "needs-review", label: STATUS_LABEL["needs-review"] },
              { value: "incomplete", label: STATUS_LABEL.incomplete },
              { value: "complete", label: STATUS_LABEL.complete },
              { value: "voided", label: STATUS_LABEL.voided },
            ]}
          />
        </div>
        <button
          onClick={goToday}
          className="h-9 px-3 rounded border border-stone-400 bg-white hover:bg-stone-100 text-[14px] font-medium text-ink-700"
        >
          Today
        </button>
        <button onClick={() => stepDay(-1)} className="h-9 w-9 rounded border border-stone-400 bg-white hover:bg-stone-100 flex items-center justify-center"><ChevronLeft className="h-4 w-4" /></button>
        <button onClick={() => stepDay(1)} className="h-9 w-9 rounded border border-stone-400 bg-white hover:bg-stone-100 flex items-center justify-center"><ChevronRight className="h-4 w-4" /></button>

        <div className="flex-1" />

        <button
          onClick={() => setShowNew(true)}
          className="h-9 px-3 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700 inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> New Timecard
        </button>
      </div>

      <div className="px-6 py-3 bg-white border-b border-ink-200 text-[12px] text-ink-500">
        Showing {filtered.length} timecard{filtered.length === 1 ? "" : "s"} for {fmtRange(start, end)}
        {staffFilter !== "ALL" && ` · ${STAFF_DIRECTORY.find((s) => s.id === staffFilter)?.name}`}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">
        {isMultiDay ? (
          <MultiDayView filtered={filtered} visibleStaff={visibleStaff} />
        ) : (
          <SingleDayView
            visibleStaff={visibleStaff}
            timecards={filtered}
            onClockIn={clockIn}
            onClockOut={clockOut}
          />
        )}
      </div>

      <NewTimecardModal
        open={showNew}
        onClose={() => setShowNew(false)}
        onCreate={(tc) => {
          setRows((prev) => [...prev, { id: `tc${Date.now()}`, ...tc }]);
        }}
      />
    </div>
  );
}

function SingleDayView({
  visibleStaff, timecards, onClockIn, onClockOut,
}: {
  visibleStaff: typeof STAFF_DIRECTORY;
  timecards: Timecard[];
  onClockIn: (id: string) => void;
  onClockOut: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border border-ink-200 bg-white overflow-hidden">
      <table className="w-full text-[14px]">
        <thead className="bg-ink-50 text-[10px] uppercase font-bold text-ink-500 tracking-wide">
          <tr>
            <th className="text-left px-4 py-2.5">Staff</th>
            <th className="text-left px-4 py-2.5">Scheduled</th>
            <th className="text-left px-4 py-2.5">Time In – Time Out</th>
            <th className="text-left px-4 py-2.5">Status</th>
            <th className="text-right px-4 py-2.5">Actions</th>
          </tr>
        </thead>
        <tbody>
          {visibleStaff.map((s, i) => {
            const tc = timecards.find((t) => t.staffId === s.id);
            return (
              <tr key={s.id} className="border-t border-ink-100 hover:bg-ink-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={s.name} hue={(i * 47) % 360} />
                    <div>
                      <div className="text-[14px] font-medium text-ink-900">{s.name}</div>
                      <div className="text-[11px] text-ink-500">{s.role}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-700">
                  {tc?.scheduled
                    ? `${tc.scheduled.start} – ${tc.scheduled.end}`
                    : <span className="text-ink-400">—</span>
                  }
                </td>
                <td className="px-4 py-3 text-ink-700">
                  {tc?.timeIn ? (
                    <>
                      {tc.timeIn}
                      {tc.timeOut ? ` – ${tc.timeOut}` : <span className="text-ink-400"> – </span>}
                    </>
                  ) : (
                    <span className="text-ink-400">Not clocked in</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {tc ? (
                    <span className={"rounded-full px-2 py-0.5 text-[11px] font-semibold " + statusPillClass(tc.status)}>
                      {STATUS_LABEL[tc.status]}
                    </span>
                  ) : (
                    <span className="text-[11px] text-ink-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      onClick={() => onClockIn(s.id)}
                      disabled={!!tc?.timeIn}
                      className="h-8 px-3 rounded bg-emerald-600 text-white text-[12px] font-semibold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Clock in
                    </button>
                    <button
                      onClick={() => onClockOut(s.id)}
                      disabled={!tc?.timeIn || !!tc.timeOut}
                      className="h-8 px-3 rounded bg-rose-600 text-white text-[12px] font-semibold hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Clock out
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MultiDayView({
  filtered, visibleStaff,
}: {
  filtered: Timecard[];
  visibleStaff: typeof STAFF_DIRECTORY;
}) {
  const byStaff = new Map<string, Timecard[]>();
  for (const tc of filtered) {
    const arr = byStaff.get(tc.staffId) ?? [];
    arr.push(tc);
    byStaff.set(tc.staffId, arr);
  }

  return (
    <div className="space-y-3">
      {visibleStaff.map((s, i) => {
        const tcs = (byStaff.get(s.id) ?? []).sort((a, b) => a.date.localeCompare(b.date));
        if (tcs.length === 0) return null;

        const totalMin = tcs.reduce((sum, tc) => {
          if (!tc.timeIn || !tc.timeOut) return sum;
          const parse = (t: string) => {
            const m = t.toLowerCase().match(/(\d+):(\d+)(am|pm)/);
            if (!m) return 0;
            let h = parseInt(m[1], 10);
            if (m[3] === "pm" && h !== 12) h += 12;
            if (m[3] === "am" && h === 12) h = 0;
            return h * 60 + parseInt(m[2], 10);
          };
          return sum + (parse(tc.timeOut) - parse(tc.timeIn));
        }, 0);
        const totalHrs = (totalMin / 60).toFixed(2);

        return (
          <div key={s.id} className="rounded-lg border border-ink-200 bg-white overflow-hidden">
            <div className="bg-ink-50 px-4 py-3 border-b border-ink-200 flex items-center gap-3">
              <Avatar name={s.name} hue={(i * 47) % 360} />
              <div className="flex-1">
                <div className="text-[14px] font-semibold text-ink-900">{s.name}</div>
                <div className="text-[11px] text-ink-500">{s.role}</div>
              </div>
              <div className="text-[12px] text-ink-700">
                <span className="font-semibold text-ink-900">{totalHrs}</span> hrs total
              </div>
            </div>
            <table className="w-full text-[14px]">
              <thead className="text-[10px] uppercase font-bold text-ink-500 tracking-wide border-b border-ink-100">
                <tr>
                  <th className="text-left px-4 py-2">Date</th>
                  <th className="text-left px-4 py-2">Scheduled</th>
                  <th className="text-left px-4 py-2">Time In – Time Out</th>
                  <th className="text-left px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {tcs.map((tc) => (
                  <tr key={tc.id} className="border-t border-ink-100 hover:bg-ink-50">
                    <td className="px-4 py-2.5 font-medium">
                      {parseISODate(tc.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </td>
                    <td className="px-4 py-2.5 text-ink-700">
                      {tc.scheduled ? `${tc.scheduled.start} – ${tc.scheduled.end}` : <span className="text-ink-400">—</span>}
                    </td>
                    <td className="px-4 py-2.5 text-ink-700">
                      {tc.timeIn ? `${tc.timeIn}${tc.timeOut ? ` – ${tc.timeOut}` : " – "}` : <span className="text-ink-400">—</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={"rounded-full px-2 py-0.5 text-[11px] font-semibold " + statusPillClass(tc.status)}>
                        {STATUS_LABEL[tc.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
