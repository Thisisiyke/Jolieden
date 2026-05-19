"use client";

import { useState } from "react";
import { Drawer } from "../Drawer";
import { CustomSelect } from "../CustomSelect";
import { CANCELLATIONS } from "../../lib/data";
import { Search, RotateCcw, UserSearch } from "lucide-react";

export function CancellationsDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [staff, setStaff] = useState("ALL");
  const [reason, setReason] = useState("ALL");

  const filtered = CANCELLATIONS.filter(
    (c) =>
      (staff === "ALL" || c.staff === staff) &&
      (reason === "ALL" || c.reason === reason) &&
      (q.trim() === "" ||
        c.client.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <Drawer open={open} onClose={onClose} title="Recent Cancellations" width="max-w-5xl">
      <div className="flex flex-col h-full">
        {/* Filter bar — fixed above scroll area */}
        <div className="px-5 py-3 border-b border-ink-200 grid grid-cols-5 gap-3 text-[12px] shrink-0 relative z-10">
          <FilterCell label="Cancelled">
            <input
              type="date"
              defaultValue="2026-04-13"
              className="w-full h-9 px-2 rounded border border-ink-300 outline-none focus:border-brand bg-white"
            />
          </FilterCell>
          <FilterCell label="Appointment">
            <input
              type="date"
              defaultValue="2026-04-14"
              className="w-full h-9 px-2 rounded border border-ink-300 outline-none focus:border-brand bg-white"
            />
          </FilterCell>
          <FilterCell label="Client">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="w-full h-9 px-2 rounded border border-ink-300 outline-none focus:border-brand bg-white"
            />
          </FilterCell>
          <FilterCell label="Staff">
            <CustomSelect
              value={staff}
              onChange={setStaff}
              options={[
                { value: "ALL", label: "All staff" },
                { value: "Mame Diarra", label: "Mame Diarra" },
                { value: "Frederick Douglass", label: "Frederick Douglass" },
                { value: "Naomi K.", label: "Naomi K." },
              ]}
            />
          </FilterCell>
          <FilterCell label="Reason">
            <CustomSelect
              value={reason}
              onChange={setReason}
              options={[
                { value: "ALL", label: "All reasons" },
                { value: "Client reschedule", label: "Client reschedule" },
                { value: "No show", label: "No show" },
                { value: "Sick", label: "Sick" },
              ]}
            />
          </FilterCell>
        </div>

        {/* Scrollable table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-[14px]">
            <thead className="bg-ink-50 text-ink-500 uppercase text-[10px] tracking-wide sticky top-0">
              <tr>
                <th className="text-left px-4 py-2 font-semibold">Client</th>
                <th className="text-left px-4 py-2 font-semibold">Service</th>
                <th className="text-left px-4 py-2 font-semibold">Staff</th>
                <th className="text-left px-4 py-2 font-semibold">Cancelled</th>
                <th className="text-left px-4 py-2 font-semibold">Appt Date</th>
                <th className="text-left px-4 py-2 font-semibold">Reason</th>
                <th className="w-24 px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-ink-100 hover:bg-ink-50">
                  <td className="px-4 py-3 font-medium text-ink-900">{c.client}</td>
                  <td className="px-4 py-3 text-ink-700">{c.service}</td>
                  <td className="px-4 py-3 text-ink-700">{c.staff}</td>
                  <td className="px-4 py-3 text-ink-700">{c.cancelledAt}</td>
                  <td className="px-4 py-3 text-ink-700">{c.apptAt}</td>
                  <td className="px-4 py-3 text-ink-700">{c.reason}</td>
                  <td className="px-4 py-3 flex items-center gap-1">
                    <button
                      className="h-7 w-7 rounded hover:bg-ink-100 text-ink-500"
                      title="View client"
                    >
                      <UserSearch className="h-4 w-4 mx-auto" />
                    </button>
                    <button
                      className="h-7 w-7 rounded hover:bg-ink-100 text-ink-500"
                      title="Rebook"
                    >
                      <RotateCcw className="h-4 w-4 mx-auto" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center text-ink-500 text-[14px]"
                  >
                    <Search className="h-5 w-5 mx-auto mb-2 text-ink-300" />
                    No cancellations match those filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Drawer>
  );
}

function FilterCell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-wide text-ink-500 mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}
