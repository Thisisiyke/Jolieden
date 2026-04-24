"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import {
  APPOINTMENTS,
  STATUS_COLUMNS,
  type Appointment,
  type ApptStatus,
} from "../lib/data";
import { addDays, formatDayHeader, TODAY_ISO } from "../lib/date";
import { AppointmentCard } from "../components/AppointmentCard";
import { AppointmentPopover } from "../components/AppointmentPopover";
import { NewAppointmentDrawer } from "../components/drawers/NewAppointmentDrawer";
import { ScheduleDrawer } from "../components/drawers/ScheduleDrawer";
import { CancellationsDrawer } from "../components/drawers/CancellationsDrawer";
import { WaitlistDrawer } from "../components/drawers/WaitlistDrawer";
import { DatePickerDropdown } from "../components/DatePickerDropdown";
import { StaffDropdown } from "../components/StaffDropdown";

const NEXT_STATUS: Record<ApptStatus, ApptStatus> = {
  unconfirmed: "confirmed",
  confirmed: "arrived",
  walkin: "active",
  arrived: "active",
  active: "completed",
  completed: "completed",
};

export default function FrontDeskPage() {
  const [appts, setAppts] = useState<Appointment[]>(APPOINTMENTS);
  const [date, setDate] = useState<string>(TODAY_ISO);
  const [filter, setFilter] = useState("");
  const [staff, setStaff] = useState("ALL");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showCancels, setShowCancels] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStaff, setShowStaff] = useState(false);

  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<ApptStatus | null>(null);

  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());

  const dayAppts = useMemo(
    () => appts.filter((a) => a.date === date),
    [appts, date],
  );

  const grouped = useMemo(() => {
    const byCol = new Map<ApptStatus, Appointment[]>();
    STATUS_COLUMNS.forEach((c) => byCol.set(c.id, []));
    const q = filter.trim().toLowerCase();
    dayAppts
      .filter((a) =>
        q === ""
          ? true
          : a.client.toLowerCase().includes(q) ||
            (a.service ?? "").toLowerCase().includes(q),
      )
      .filter((a) => (staff === "ALL" ? true : a.staff === staff))
      .forEach((a) => byCol.get(a.status)!.push(a));
    return byCol;
  }, [dayAppts, filter, staff]);

  const moveTo = (id: string, status: ApptStatus) =>
    setAppts((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));

  const removeAppt = (id: string) =>
    setAppts((prev) => prev.filter((a) => a.id !== id));

  const selected = appts.find((a) => a.id === selectedId) ?? null;
  const header = formatDayHeader(date);

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-ink-50">
      {/* Toolbar */}
      <div className="h-14 px-4 flex items-center gap-3 bg-[#EEEAE0] border-b border-ink-200 shrink-0 relative">
        {/* Date pill */}
        <div className="relative">
          <button
            onClick={() => setShowDatePicker((v) => !v)}
            className="flex items-center gap-1 text-left hover:bg-ink-50 rounded px-1 py-1"
          >
            <div className="leading-tight">
              <div className="text-[10px] text-ink-500">{header.y}</div>
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

        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter clients"
          className="flex-1 h-9 px-3 text-[13px] bg-transparent outline-none border-b border-stone-400 placeholder:text-stone-500 focus:border-brand"
        />

        <div className="relative">
          <button
            onClick={() => setShowStaff((v) => !v)}
            className="text-[12px] text-ink-700 inline-flex items-center gap-1 hover:bg-ink-50 rounded px-2 py-1"
          >
            Staff:{" "}
            <span className="font-semibold text-ink-900">
              {staff === "ALL" ? "ALL" : staff}
            </span>
            <ChevronDown className="h-3 w-3" />
          </button>
          {showStaff && (
            <StaffDropdown
              value={staff}
              onPick={setStaff}
              onClose={() => setShowStaff(false)}
            />
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setDate(TODAY_ISO)}
            className="h-8 px-3 text-[12px] rounded border border-stone-400 bg-white hover:bg-stone-100 font-medium"
          >
            Today
          </button>
          <button
            onClick={() => setDate(addDays(date, -1))}
            className="h-8 w-8 rounded border border-stone-400 bg-white hover:bg-stone-100 flex items-center justify-center"
            aria-label="Previous day"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDate(addDays(date, 1))}
            className="h-8 w-8 rounded border border-stone-400 bg-white hover:bg-stone-100 flex items-center justify-center"
            aria-label="Next day"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={() => setShowSchedule(true)}
          className="h-8 px-3 text-[12px] rounded border border-stone-400 bg-white hover:bg-stone-100"
        >
          Schedule
        </button>
        <button
          onClick={() => setShowCancels(true)}
          className="h-8 px-3 text-[12px] rounded border border-stone-400 bg-white hover:bg-stone-100"
        >
          Cancellations
        </button>
        <button
          onClick={() => setShowWaitlist(true)}
          className="h-8 px-3 text-[12px] rounded border border-stone-400 bg-white hover:bg-stone-100"
        >
          Waitlist (0)
        </button>
        <button
          onClick={() => setShowNew(true)}
          className="h-8 px-3 text-[12px] rounded bg-brand text-white hover:bg-brand-700 font-semibold"
        >
          New Appointment
        </button>
      </div>

      {/* Columns */}
      <div
        className="flex-1 grid grid-cols-6 min-h-0"
        onClick={() => setSelectedId(null)}
      >
        {STATUS_COLUMNS.map((col) => {
          const items = grouped.get(col.id) ?? [];
          return (
            <div
              key={col.id}
              onDragOver={(e) => {
                e.preventDefault();
                setOverCol(col.id);
              }}
              onDragLeave={() => setOverCol((c) => (c === col.id ? null : c))}
              onDrop={() => {
                if (dragId) moveTo(dragId, col.id);
                setDragId(null);
                setOverCol(null);
              }}
              className={
                "border-r border-ink-200 last:border-r-0 flex flex-col min-h-0 " +
                (overCol === col.id ? "bg-brand-50" : "bg-white")
              }
            >
              <div className="px-3 pt-3 pb-2 text-[15px] font-semibold text-ink-900">
                {col.label}
                {items.length > 0 && (
                  <span className="ml-1 text-ink-500 font-normal">
                    ({items.length})
                  </span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1.5 relative">
                {items.map((a) => (
                  <div
                    key={a.id}
                    ref={(el) => {
                      if (el) cardRefs.current.set(a.id, el);
                      else cardRefs.current.delete(a.id);
                    }}
                    className="relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <AppointmentCard
                      appt={a}
                      selected={selectedId === a.id}
                      onClick={() => setSelectedId(a.id)}
                      onDragStart={(e) => {
                        setDragId(a.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <AppointmentPopover
          appt={selected}
          anchor={cardRefs.current.get(selected.id) ?? null}
          onClose={() => setSelectedId(null)}
          onAdvance={() => {
            moveTo(selected.id, NEXT_STATUS[selected.status]);
            setSelectedId(null);
          }}
          onCancelAppt={() => {
            removeAppt(selected.id);
            setSelectedId(null);
          }}
          onRebook={() => {
            setSelectedId(null);
            setShowNew(true);
          }}
        />
      )}

      <NewAppointmentDrawer
        open={showNew}
        onClose={() => setShowNew(false)}
        onCreate={(a) => {
          const id = `n${Date.now()}`;
          setAppts((prev) => [
            { id, avatarHue: Math.floor(Math.random() * 360), ...a },
            ...prev,
          ]);
        }}
      />
      <ScheduleDrawer
        open={showSchedule}
        onClose={() => setShowSchedule(false)}
        appts={dayAppts}
        date={`${header.dow}. ${header.md}`}
      />
      <CancellationsDrawer
        open={showCancels}
        onClose={() => setShowCancels(false)}
      />
      <WaitlistDrawer
        open={showWaitlist}
        onClose={() => setShowWaitlist(false)}
      />
    </div>
  );
}
