export type TimecardStatus = "complete" | "incomplete" | "needs-review" | "voided";

export type Timecard = {
  id: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  scheduled?: { start: string; end: string };
  timeIn?: string; // "9:02am"
  timeOut?: string;
  status: TimecardStatus;
  reason?: string;
};

const today = "2026-05-18";

// Today scheduled shifts pulled from Schedule (manage)
export const SCHEDULED_TODAY: Record<string, { start: string; end: string } | null> = {
  s1: { start: "9:00am", end: "5:00pm" },
  s2: { start: "10:00am", end: "6:00pm" },
  s3: { start: "11:00am", end: "7:00pm" },
  s4: null, // Adja — off today
  s5: null, // Aminata — off today
  s6: { start: "10:00am", end: "6:00pm" },
  s7: { start: "9:00am", end: "5:00pm" },
  s8: null, // Asha — off
};

export const TIMECARDS: Timecard[] = [
  // Today
  { id: "tc1", staffId: "s1", date: today, scheduled: { start: "9:00am", end: "5:00pm" }, timeIn: "9:02am", status: "incomplete" },
  { id: "tc2", staffId: "s2", date: today, scheduled: { start: "10:00am", end: "6:00pm" }, timeIn: "9:58am", status: "incomplete" },
  { id: "tc3", staffId: "s3", date: today, scheduled: { start: "11:00am", end: "7:00pm" }, status: "needs-review" },
  { id: "tc4", staffId: "s6", date: today, scheduled: { start: "10:00am", end: "6:00pm" }, timeIn: "10:11am", status: "incomplete" },
  { id: "tc5", staffId: "s7", date: today, scheduled: { start: "9:00am", end: "5:00pm" }, timeIn: "9:14am", timeOut: "12:00pm", status: "complete" },

  // Yesterday — for multi-day view
  { id: "tc6",  staffId: "s1", date: "2026-05-17", scheduled: { start: "9:00am", end: "5:00pm" }, timeIn: "8:55am", timeOut: "5:08pm", status: "complete" },
  { id: "tc7",  staffId: "s2", date: "2026-05-17", scheduled: { start: "10:00am", end: "6:00pm" }, timeIn: "10:03am", timeOut: "6:21pm", status: "complete" },
  { id: "tc8",  staffId: "s3", date: "2026-05-17", scheduled: { start: "11:00am", end: "7:00pm" }, timeIn: "11:10am", timeOut: "7:14pm", status: "complete" },
  { id: "tc9",  staffId: "s6", date: "2026-05-17", scheduled: { start: "10:00am", end: "6:00pm" }, timeIn: "10:05am", timeOut: "6:00pm", status: "complete" },
  { id: "tc10", staffId: "s7", date: "2026-05-17", scheduled: { start: "9:00am", end: "5:00pm" }, timeIn: "9:00am", timeOut: "5:00pm", status: "complete" },

  { id: "tc11", staffId: "s1", date: "2026-05-16", scheduled: { start: "9:00am", end: "5:00pm" }, timeIn: "9:01am", timeOut: "5:02pm", status: "complete" },
  { id: "tc12", staffId: "s2", date: "2026-05-16", scheduled: { start: "10:00am", end: "6:00pm" }, timeIn: "10:02am", status: "needs-review", reason: "Missed clock-out — manager closing required" },
  { id: "tc13", staffId: "s6", date: "2026-05-16", scheduled: { start: "10:00am", end: "6:00pm" }, status: "voided", reason: "Clocked at wrong location" },
  { id: "tc14", staffId: "s7", date: "2026-05-16", scheduled: { start: "9:00am", end: "5:00pm" }, timeIn: "8:58am", timeOut: "5:11pm", status: "complete" },

  { id: "tc15", staffId: "s1", date: "2026-05-15", scheduled: { start: "9:00am", end: "5:00pm" }, timeIn: "9:00am", timeOut: "5:03pm", status: "complete" },
  { id: "tc16", staffId: "s3", date: "2026-05-15", scheduled: { start: "11:00am", end: "7:00pm" }, timeIn: "11:14am", timeOut: "7:00pm", status: "complete" },
  { id: "tc17", staffId: "s4", date: "2026-05-15", scheduled: { start: "9:00am", end: "3:00pm" }, timeIn: "9:00am", timeOut: "3:08pm", status: "complete" },
];

export const STATUS_LABEL: Record<TimecardStatus | "all", string> = {
  all: "All Timecards",
  "needs-review": "Needs Review",
  incomplete: "Incomplete",
  complete: "Complete",
  voided: "Voided",
};

export function statusPillClass(s: TimecardStatus): string {
  switch (s) {
    case "complete": return "bg-emerald-100 text-emerald-700";
    case "incomplete": return "bg-sky-100 text-sky-700";
    case "needs-review": return "bg-amber-100 text-amber-700";
    case "voided": return "bg-ink-100 text-ink-500";
  }
}
