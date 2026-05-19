"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { SalesTabs } from "../../../components/sales/SalesTabs";
import { CustomSelect } from "../../../components/CustomSelect";
import { MEMBERSHIPS, type MembershipStatus } from "../../../lib/sales";

type SortKey = "client" | "plan" | "price" | "nextCharge" | "status" | "lastUpdate" | "startDate";

export default function MembershipsPage() {
  const [q, setQ] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState("All");
  const [appliedStatus, setAppliedStatus] = useState<MembershipStatus | "All">("All");
  const [sortKey, setSortKey] = useState<SortKey>("lastUpdate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterOpen) return;
    const h = (e: MouseEvent) => { if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [filterOpen]);

  const rows = useMemo(() => {
    let list = [...MEMBERSHIPS];
    if (appliedStatus !== "All") list = list.filter((m) => m.status === appliedStatus);
    if (q.trim()) list = list.filter((m) => m.client.toLowerCase().includes(q.toLowerCase()));
    list.sort((a, b) => {
      const va = String(a[sortKey]).toLowerCase();
      const vb = String(b[sortKey]).toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [appliedStatus, q, sortKey, sortDir]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("desc"); }
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-ink-50">
      <SalesTabs />
      <div className="px-6 py-3 bg-white border-b border-ink-200 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-ink-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search client name"
            className="w-full h-10 pl-9 pr-3 rounded border border-ink-300 bg-white text-[14px] outline-none focus:border-brand"
          />
        </div>
        <div ref={filterRef} className="relative">
          <button
            onClick={() => { setDraftStatus(appliedStatus); setFilterOpen((v) => !v); }}
            className="h-10 px-3 rounded border border-ink-300 bg-white text-[14px] font-medium text-ink-700 hover:bg-ink-50 inline-flex items-center gap-2"
          >
            <Filter className="h-4 w-4" /> Filter <ChevronDown className="h-3 w-3" />
          </button>
          {filterOpen && (
            <div className="absolute right-0 top-full mt-1 z-30 w-72 bg-white rounded-lg border border-ink-200 shadow-xl p-4 space-y-3">
              <div className="text-[12px] font-bold uppercase text-ink-500">Filter by status</div>
              <CustomSelect
                value={draftStatus}
                onChange={setDraftStatus}
                options={["All", "Active", "Paused", "Past due", "Cancellation scheduled", "Cancelled"].map((s) => ({ value: s, label: s }))}
              />
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => setFilterOpen(false)} className="h-8 px-3 rounded border border-ink-300 text-[12px] text-ink-700 hover:bg-ink-50">Cancel</button>
                <button
                  onClick={() => { setAppliedStatus(draftStatus as MembershipStatus | "All"); setFilterOpen(false); }}
                  className="h-8 px-3 rounded bg-brand text-white text-[12px] font-semibold hover:bg-brand-700"
                >Apply</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="rounded-lg border border-ink-200 bg-white overflow-hidden">
          <table className="w-full text-[14px]">
            <thead className="bg-ink-50 text-[10px] uppercase font-bold text-ink-500 tracking-wide">
              <tr>
                <SortTh k="client" label="Name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                <SortTh k="plan" label="Plan" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                <SortTh k="price" label="Price" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} right />
                <SortTh k="nextCharge" label="Next charge" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                <SortTh k="status" label="Status" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                <SortTh k="lastUpdate" label="Last update" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                <SortTh k="startDate" label="Start date" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="text-[15px] font-semibold text-ink-900">No memberships found</div>
                    <div className="text-[12px] text-ink-500 mt-1">Try adjusting your search.</div>
                  </td>
                </tr>
              ) : (
                rows.map((m) => (
                  <tr key={m.id} className="border-t border-ink-100 hover:bg-ink-50">
                    <td className="px-4 py-3 font-medium">{m.client}</td>
                    <td className="px-4 py-3 text-ink-700">{m.plan}</td>
                    <td className="px-4 py-3 text-right">${m.price}</td>
                    <td className="px-4 py-3 text-ink-700">{m.nextCharge}</td>
                    <td className="px-4 py-3">{m.status}</td>
                    <td className="px-4 py-3 text-ink-700">{m.lastUpdate}</td>
                    <td className="px-4 py-3 text-ink-700">{m.startDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SortTh({
  k, label, sortKey, sortDir, onSort, right,
}: {
  k: SortKey; label: string; sortKey: SortKey; sortDir: "asc" | "desc";
  onSort: (k: SortKey) => void; right?: boolean;
}) {
  const active = sortKey === k;
  return (
    <th className={"py-2.5 px-4 " + (right ? "text-right" : "text-left")}>
      <button
        onClick={() => onSort(k)}
        className={"inline-flex items-center gap-1 hover:text-ink-900 " + (active ? "text-ink-900" : "")}
      >
        {label}
        {active ? (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : null}
      </button>
    </th>
  );
}
