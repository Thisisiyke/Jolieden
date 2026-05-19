"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Plus, MoreHorizontal, Search, Filter } from "lucide-react";
import { PageHeader, Card } from "../../../components/manage/ManageShell";
import { CustomSelect } from "../../../components/CustomSelect";
import { LOCATIONS } from "../../../lib/owner";

export default function LocationsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("Active");
  const filtered = useMemo(
    () => LOCATIONS.filter((l) =>
      (status === "All" || (status === "Active" ? l.active : !l.active)) &&
      (q.trim() === "" || l.name.toLowerCase().includes(q.toLowerCase()))
    ),
    [q, status],
  );

  return (
    <>
      <PageHeader title="Locations" actions={
        <button className="h-9 px-3 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700 inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add location
        </button>
      } />
      <div className="px-6 py-3 bg-white border-b border-ink-200 flex items-center gap-3">
        <div className="relative">
          <Search className="h-4 w-4 text-ink-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search locations"
            className="h-9 pl-9 pr-3 w-64 rounded border border-ink-300 bg-white text-[14px] outline-none focus:border-brand"
          />
        </div>
        <button className="h-9 px-3 rounded border border-ink-300 text-[14px] font-medium text-ink-700 hover:bg-ink-50 inline-flex items-center gap-2">
          <Filter className="h-4 w-4" /> Add filter
        </button>
        <div className="min-w-[160px]">
          <CustomSelect value={status} onChange={setStatus} options={[
            { value: "Active", label: "Active" },
            { value: "Inactive", label: "Inactive" },
            { value: "All", label: "All locations" },
          ]} />
        </div>
      </div>
      <div className="p-6">
        <Card>
          <table className="w-full text-[14px]">
            <thead className="bg-ink-50 text-[10px] uppercase font-bold text-ink-500 tracking-wide">
              <tr>
                <th className="text-left px-4 py-2.5">Location</th>
                <th className="text-left px-4 py-2.5">Address</th>
                <th className="text-left px-4 py-2.5">Phone</th>
                <th className="text-left px-4 py-2.5">Status</th>
                <th className="w-12 px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <Row key={l.id} l={l} />
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}

function Row({ l }: { l: typeof LOCATIONS[number] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  return (
    <tr className="border-t border-ink-100 hover:bg-ink-50">
      <td className="px-4 py-3 font-medium">{l.name}</td>
      <td className="px-4 py-3 text-ink-700">{l.address}</td>
      <td className="px-4 py-3 text-ink-700">{l.phone}</td>
      <td className="px-4 py-3">
        <span className={"rounded-full px-2 py-0.5 text-[11px] font-semibold " + (l.active ? "bg-emerald-100 text-emerald-700" : "bg-ink-100 text-ink-500")}>
          {l.active ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <div ref={ref} className="relative inline-block">
          <button onClick={() => setOpen((v) => !v)} className="h-8 w-8 rounded hover:bg-ink-100 flex items-center justify-center text-ink-500">
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-1 z-30 w-40 bg-white rounded-lg border border-ink-200 shadow-xl py-1">
              <button className="w-full text-left px-3 py-1.5 text-[14px] text-ink-900 hover:bg-ink-50">Edit</button>
              <button className="w-full text-left px-3 py-1.5 text-[14px] text-rose-600 hover:bg-rose-50">Deactivate</button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
