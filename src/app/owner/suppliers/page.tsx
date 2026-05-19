"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader, Card } from "../../../components/manage/ManageShell";
import { CustomSelect } from "../../../components/CustomSelect";
import { SUPPLIERS } from "../../../lib/owner";

export default function SuppliersPage() {
  const [status, setStatus] = useState("Active");
  const rows = useMemo(
    () => SUPPLIERS.filter((s) =>
      status === "All" ? true : status === "Active" ? s.active : !s.active),
    [status],
  );
  return (
    <>
      <PageHeader title="Suppliers" actions={
        <button className="h-9 px-3 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700 inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Supplier
        </button>
      } />
      <div className="px-6 py-3 bg-white border-b border-ink-200">
        <div className="min-w-[160px]">
          <CustomSelect value={status} onChange={setStatus} options={[
            { value: "Active", label: "Active" },
            { value: "Inactive", label: "Inactive" },
            { value: "All", label: "All suppliers" },
          ]} />
        </div>
      </div>
      <div className="p-6">
        <Card>
          <table className="w-full text-[14px]">
            <thead className="bg-ink-50 text-[10px] uppercase font-bold text-ink-500 tracking-wide">
              <tr>
                <th className="text-left px-4 py-2.5">Name</th>
                <th className="text-left px-4 py-2.5">Phone #</th>
                <th className="text-left px-4 py-2.5">Email</th>
                <th className="text-left px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-t border-ink-100 hover:bg-ink-50">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-ink-700">{s.phone}</td>
                  <td className="px-4 py-3 text-ink-700">{s.email}</td>
                  <td className="px-4 py-3">
                    <span className={"rounded-full px-2 py-0.5 text-[11px] font-semibold " + (s.active ? "bg-emerald-100 text-emerald-700" : "bg-ink-100 text-ink-500")}>
                      {s.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}
