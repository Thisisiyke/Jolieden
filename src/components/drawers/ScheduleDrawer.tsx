"use client";

import { Drawer } from "../Drawer";
import type { Appointment } from "../../lib/data";
import { FileText, LineChart } from "lucide-react";

const DOT: Record<string, string> = {
  unconfirmed: "#f59e0b",
  confirmed: "#10b981",
  walkin: "#6366f1",
  arrived: "#ec4899",
  active: "#8b5cf6",
  completed: "#64748b",
};

export function ScheduleDrawer({
  open,
  onClose,
  appts,
  date,
}: {
  open: boolean;
  onClose: () => void;
  appts: Appointment[];
  date: string;
}) {
  const sorted = [...appts].sort((a, b) =>
    parseStart(a.start) - parseStart(b.start),
  );

  return (
    <Drawer open={open} onClose={onClose} title={`Schedule — ${date}`} width="max-w-5xl">
      <table className="w-full text-[13px]">
        <thead className="sticky top-0 bg-ink-50 text-ink-500 uppercase text-[10px] tracking-wide">
          <tr>
            <Th>Time</Th>
            <Th>Client</Th>
            <Th>Staff</Th>
            <Th>Status</Th>
            <Th>Service</Th>
            <Th className="w-20">Forms</Th>
            <Th className="w-20">Charts</Th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((a) => (
            <tr key={a.id} className="border-b border-ink-100 hover:bg-ink-50">
              <Td className="whitespace-nowrap font-medium text-ink-900">
                {a.start}
                {a.end ? ` – ${a.end}` : ""}
              </Td>
              <Td>
                <div className="flex flex-col">
                  <span className="text-ink-900 font-medium">{a.client}</span>
                  {a.pronouns && (
                    <span className="text-[11px] text-ink-500">({a.pronouns})</span>
                  )}
                </div>
              </Td>
              <Td className="text-ink-700">{a.staff ?? "—"}</Td>
              <Td>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: DOT[a.status] }}
                  />
                  <span className="capitalize text-ink-700">{a.status}</span>
                </span>
              </Td>
              <Td className="text-ink-700">{a.service ?? "—"}</Td>
              <Td>
                <button className="text-ink-500 hover:text-brand">
                  <FileText className="h-4 w-4" />
                </button>
              </Td>
              <Td>
                <button className="text-ink-500 hover:text-brand">
                  <LineChart className="h-4 w-4" />
                </button>
              </Td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={7} className="py-16 text-center text-ink-500">
                No appointments for this day.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Drawer>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={"text-left px-4 py-2 font-semibold " + className}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={"px-4 py-2 align-middle " + className}>{children}</td>;
}
function parseStart(t: string): number {
  const m = t.toLowerCase().match(/(\d+):(\d+)\s*(am|pm)/);
  if (!m) return 0;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (m[3] === "pm" && h !== 12) h += 12;
  if (m[3] === "am" && h === 12) h = 0;
  return h * 60 + min;
}
