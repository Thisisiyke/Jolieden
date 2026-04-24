"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronsRight,
  RotateCcw,
} from "lucide-react";
import {
  APPOINTMENTS,
  STAFF,
  type Appointment,
} from "../../lib/data";
import { addDays, formatDayHeader, TODAY_ISO } from "../../lib/date";
import { DatePickerDropdown } from "../../components/DatePickerDropdown";
import { CalendarStaffDropdown } from "../../components/calendar/CalendarStaffDropdown";
import { ViewSelector } from "../../components/calendar/ViewSelector";
import { JumpForwardDropdown } from "../../components/calendar/JumpForwardDropdown";
import { StaffContextMenu } from "../../components/calendar/StaffContextMenu";
import { AppointmentPopover } from "../../components/AppointmentPopover";
import { ScheduleDrawer } from "../../components/drawers/ScheduleDrawer";
import { CancellationsDrawer } from "../../components/drawers/CancellationsDrawer";
import { WaitlistDrawer } from "../../components/drawers/WaitlistDrawer";
import { NewAppointmentDrawer } from "../../components/drawers/NewAppointmentDrawer";

const HOURS = Array.from({ length: 13 }, (_, i) => 9 + i);
const ROW_PX = 60;

function parseTime(t: string): number {
  const m = t.toLowerCase().match(/(\d+):(\d+)\s*(am|pm)/);
  if (!m) return 9;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (m[3] === "pm" && h !== 12) h += 12;
  if (m[3] === "am" && h === 12) h = 0;
  return h + min / 60;
}

function fmtHour(h: number) {
  const ap = h >= 12 ? "pm" : "am";
  const hr = ((h + 11) % 12) + 1;
  return `${hr}${ap}`;
}

const NEXT_STATUS: Record<string, string> = {
  unconfirmed: "confirmed",
  confirmed: "arrived",
  walkin: "active",
  arrived: "active",
  active: "completed",
  completed: "completed",
};

export default function CalendarPage() {
  const [date, setDate] = useState<string>(TODAY_ISO);
  const [now, setNow] = useState<number>(13.25);
  const [appts, setAppts] = useState<Appointment[]>(APPOINTMENTS);

  // Toolbar dropdowns
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStaffDD, setShowStaffDD] = useState(false);
  const [showViewSel, setShowViewSel] = useState(false);
  const [showJump, setShowJump] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showCancels, setShowCancels] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [showNewAppt, setShowNewAppt] = useState(false);

  // Staff visibility
  const [visibleStaff, setVisibleStaff] = useState<Set<string>>(
    () => new Set(STAFF.map((s) => s.name)),
  );
  const toggleStaff = (name: string) => {
    setVisibleStaff((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };
  const resetFilters = () => setVisibleStaff(new Set(STAFF.map((s) => s.name)));

  // Appointment popover
  const [selectedApptId, setSelectedApptId] = useState<string | null>(null);
  const blockRefs = useRef<Map<string, HTMLElement>>(new Map());
  const selectedAppt = appts.find((a) => a.id === selectedApptId) ?? null;

  // Staff context menu
  const [staffMenu, setStaffMenu] = useState<{
    name: string;
    pos: { x: number; y: number };
  } | null>(null);

  // Live clock
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow(d.getHours() + d.getMinutes() / 60);
    };
    tick();
    const i = setInterval(tick, 60_000);
    return () => clearInterval(i);
  }, []);

  const dayAppts = useMemo(
    () => appts.filter((a) => a.date === date),
    [appts, date],
  );

  const byStaff = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    STAFF.forEach((s) => map.set(s.name, []));
    dayAppts.forEach((a) => {
      if (!a.staff) return;
      if (!map.has(a.staff)) map.set(a.staff, []);
      map.get(a.staff)!.push(a);
    });
    return map;
  }, [dayAppts]);

  const shownStaff = STAFF.filter((s) => visibleStaff.has(s.name));
  const totalHeight = HOURS.length * ROW_PX;
  const nowTop = (now - HOURS[0]) * ROW_PX;
  const showNowLine = date === TODAY_ISO && now >= HOURS[0] && now <= HOURS[HOURS.length - 1] + 1;
  const header = formatDayHeader(date);
  const staffLabel =
    visibleStaff.size === STAFF.length
      ? "ALL"
      : visibleStaff.size === 0
        ? "NONE"
        : `AVAIL. (${visibleStaff.size})`;

  return (
    <div
      className="h-[calc(100vh-3.5rem)] flex flex-col bg-white"
      onClick={() => {
        setSelectedApptId(null);
        setStaffMenu(null);
      }}
    >
      {/* ─── TOOLBAR ─── */}
      <div className="h-14 px-4 flex items-center gap-2 bg-[#EEEAE0] border-b border-ink-200 shrink-0">
        {/* 1 & 2: Date + picker */}
        <div className="relative">
          <button
            onClick={() => setShowDatePicker((v) => !v)}
            className="flex items-center gap-1 hover:bg-white/50 rounded px-2 py-1"
          >
            <div className="leading-tight">
              <div className="text-[10px] text-ink-500">Today&apos;s Date</div>
              <div className="text-[13px] font-semibold text-ink-900 inline-flex items-center gap-1">
                {header.dow}. {header.md}
                <ChevronDown className="h-3 w-3" />
              </div>
            </div>
          </button>
          {showDatePicker && (
            <DatePickerDropdown
              value={date}
              onPick={setDate}
              onClose={() => setShowDatePicker(false)}
            />
          )}
        </div>

        {/* 3: Staff dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowStaffDD((v) => !v)}
            className="h-8 px-3 text-[12px] rounded border border-stone-400 bg-white hover:bg-stone-100 font-medium inline-flex items-center gap-1"
          >
            Staff: <span className="font-semibold">{staffLabel}</span>
            <ChevronDown className="h-3 w-3" />
          </button>
          {showStaffDD && (
            <CalendarStaffDropdown
              visible={visibleStaff}
              onToggle={toggleStaff}
              onClose={() => setShowStaffDD(false)}
            />
          )}
        </div>

        {/* 4: View selector */}
        <div className="relative">
          <button
            onClick={() => setShowViewSel((v) => !v)}
            className="h-8 px-3 text-[12px] rounded border border-stone-400 bg-white hover:bg-stone-100 font-medium inline-flex items-center gap-1"
          >
            1d <ChevronDown className="h-3 w-3" />
          </button>
          {showViewSel && (
            <ViewSelector value="day" onClose={() => setShowViewSel(false)} />
          )}
        </div>

        {/* 5: Today */}
        <button
          onClick={() => setDate(TODAY_ISO)}
          className="h-8 px-3 text-[12px] rounded border border-stone-400 bg-white hover:bg-stone-100 font-medium"
        >
          Today
        </button>

        {/* 6: Reset */}
        <button
          onClick={resetFilters}
          className="h-8 w-8 rounded border border-stone-400 bg-white hover:bg-stone-100 flex items-center justify-center"
          title="Reset calendar"
        >
          <RotateCcw className="h-4 w-4 text-ink-700" />
        </button>

        {/* 7: Back */}
        <button
          onClick={() => setDate(addDays(date, -1))}
          className="h-8 w-8 rounded border border-stone-400 bg-white hover:bg-stone-100 flex items-center justify-center"
          aria-label="Previous day"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* 8: Forward */}
        <button
          onClick={() => setDate(addDays(date, 1))}
          className="h-8 w-8 rounded border border-stone-400 bg-white hover:bg-stone-100 flex items-center justify-center"
          aria-label="Next day"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* 9: Jump forward */}
        <div className="relative">
          <button
            onClick={() => setShowJump((v) => !v)}
            className="h-8 w-8 rounded border border-stone-400 bg-white hover:bg-stone-100 flex items-center justify-center"
            title="Jump forward"
          >
            <ChevronsRight className="h-4 w-4 text-ink-700" />
          </button>
          {showJump && (
            <JumpForwardDropdown
              today={TODAY_ISO}
              onJump={setDate}
              onClose={() => setShowJump(false)}
            />
          )}
        </div>

        <div className="flex-1" />

        {/* 11: Schedule */}
        <button
          onClick={() => setShowSchedule(true)}
          className="h-8 px-3 text-[12px] rounded border border-stone-400 bg-white hover:bg-stone-100"
        >
          Schedule
        </button>

        {/* 12: Cancellations */}
        <button
          onClick={() => setShowCancels(true)}
          className="h-8 px-3 text-[12px] rounded border border-stone-400 bg-white hover:bg-stone-100"
        >
          Cancellations
        </button>

        {/* 13: Waitlist */}
        <button
          onClick={() => setShowWaitlist(true)}
          className="h-8 px-3 text-[12px] rounded border border-stone-400 bg-white hover:bg-stone-100"
        >
          Waitlist (0)
        </button>

        {/* 14: New Appointment */}
        <button
          onClick={() => setShowNewAppt(true)}
          className="h-8 px-3 text-[12px] rounded bg-brand text-white hover:bg-brand-700 font-semibold"
        >
          New Appointment
        </button>
      </div>

      {/* ─── GRID ─── */}
      <div className="flex-1 overflow-auto">
        <div className="flex min-w-max w-full">
          {/* Time gutter */}
          <div className="w-14 shrink-0 sticky left-0 bg-white border-r border-ink-200 z-10">
            <div className="h-10 border-b border-ink-200" />
            <div style={{ height: totalHeight }} className="relative">
              {HOURS.map((h, i) => (
                <div
                  key={h}
                  style={{ top: i * ROW_PX }}
                  className="absolute left-0 right-0 text-[10px] text-ink-500 px-1 -translate-y-1/2"
                >
                  {i === 0 ? "" : fmtHour(h)}
                </div>
              ))}
              {showNowLine && (
                <div
                  style={{ top: nowTop }}
                  className="absolute right-0 h-2.5 w-2.5 rounded-full bg-rose-500 z-20 translate-x-1/2 -translate-y-1/2"
                />
              )}
            </div>
          </div>

          {/* Staff columns */}
          {shownStaff.map((s) => {
            const items = byStaff.get(s.name) ?? [];
            return (
              <div key={s.name} className="min-w-[140px] flex-1 border-r border-ink-200">
                {/* 16: Staff header — clickable avatar */}
                <div className="h-10 border-b border-ink-200 flex items-center gap-2 px-2 sticky top-0 bg-white z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const r = (e.target as HTMLElement).getBoundingClientRect();
                      setStaffMenu({
                        name: s.name,
                        pos: { x: r.left, y: r.bottom + 4 },
                      });
                    }}
                    className="h-7 w-7 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0 hover:ring-2 hover:ring-brand/30 transition"
                    style={{ background: s.color }}
                  >
                    {s.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)}
                  </button>
                  <span className="text-[12px] font-medium text-ink-900 truncate">
                    {s.name}
                  </span>
                </div>

                {/* Time grid */}
                <div style={{ height: totalHeight }} className="relative bg-ink-50/40">
                  {HOURS.map((_, i) => (
                    <div
                      key={i}
                      style={{ top: i * ROW_PX }}
                      className="absolute left-0 right-0 border-t border-ink-200/70"
                    />
                  ))}
                  {showNowLine && (
                    <div
                      style={{ top: nowTop }}
                      className="absolute left-0 right-0 h-px bg-rose-500 z-20"
                    />
                  )}

                  {/* 15: Appointment blocks — clickable */}
                  {items.map((a) => {
                    const start = parseTime(a.start);
                    const end = a.end ? parseTime(a.end) : start + 1;
                    const top = (start - HOURS[0]) * ROW_PX;
                    const height = Math.max(18, (end - start) * ROW_PX - 2);
                    return (
                      <div
                        key={a.id}
                        ref={(el) => {
                          if (el) blockRefs.current.set(a.id, el);
                          else blockRefs.current.delete(a.id);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApptId(a.id);
                        }}
                        style={{ top, height, background: s.color }}
                        className={
                          "absolute left-1 right-1 rounded text-white text-[11px] px-1.5 py-1 leading-tight overflow-hidden shadow-sm cursor-pointer transition " +
                          (selectedApptId === a.id
                            ? "ring-2 ring-white ring-offset-1"
                            : "hover:brightness-110")
                        }
                      >
                        <div className="font-semibold truncate">{a.client}</div>
                        <div className="opacity-90 truncate">{a.service}</div>
                        {height > 50 && (
                          <div className="opacity-75 truncate text-[10px]">
                            {a.start} – {a.end}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── OVERLAYS ─── */}

      {/* 15: Appointment popover via portal */}
      {selectedAppt && (
        <AppointmentPopover
          appt={selectedAppt}
          anchor={blockRefs.current.get(selectedAppt.id) ?? null}
          onClose={() => setSelectedApptId(null)}
          onAdvance={() => {
            const next = NEXT_STATUS[selectedAppt.status] ?? "completed";
            setAppts((prev) =>
              prev.map((a) =>
                a.id === selectedAppt.id
                  ? { ...a, status: next as Appointment["status"] }
                  : a,
              ),
            );
            setSelectedApptId(null);
          }}
          onCancelAppt={() => {
            setAppts((prev) => prev.filter((a) => a.id !== selectedAppt.id));
            setSelectedApptId(null);
          }}
          onRebook={() => {
            setSelectedApptId(null);
            setShowNewAppt(true);
          }}
        />
      )}

      {/* 16: Staff context menu */}
      {staffMenu && (
        <StaffContextMenu
          name={staffMenu.name}
          position={staffMenu.pos}
          onClose={() => setStaffMenu(null)}
        />
      )}

      {/* Drawers */}
      <ScheduleDrawer
        open={showSchedule}
        onClose={() => setShowSchedule(false)}
        appts={dayAppts}
        date={`${header.dow}. ${header.md}`}
      />
      <CancellationsDrawer open={showCancels} onClose={() => setShowCancels(false)} />
      <WaitlistDrawer open={showWaitlist} onClose={() => setShowWaitlist(false)} />
      <NewAppointmentDrawer
        open={showNewAppt}
        onClose={() => setShowNewAppt(false)}
        onCreate={(a) => {
          const id = `n${Date.now()}`;
          setAppts((prev) => [
            { id, avatarHue: Math.floor(Math.random() * 360), ...a },
            ...prev,
          ]);
        }}
      />
    </div>
  );
}
