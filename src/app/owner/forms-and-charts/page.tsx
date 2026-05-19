"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { PageHeader, Card } from "../../../components/manage/ManageShell";
import { CustomSelect } from "../../../components/CustomSelect";
import { FORMS_AND_CHARTS } from "../../../lib/owner";

export default function FormsAndChartsPage() {
  const [status, setStatus] = useState("Active");
  const rows = useMemo(
    () => FORMS_AND_CHARTS.filter((f) => status === "Active" ? f.status === "Published" : status === "Drafts" ? f.status === "Draft" : true),
    [status],
  );
  return (
    <>
      <PageHeader title="Forms and Charts" actions={
        <button className="h-9 px-3 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700 inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> Create New
        </button>
      } />
      <div className="px-6 py-3 bg-white border-b border-ink-200 flex items-center gap-3">
        <div className="min-w-[180px]">
          <CustomSelect
            value={status}
            onChange={setStatus}
            options={[
              { value: "Active", label: "Active (Published)" },
              { value: "Drafts", label: "Drafts" },
              { value: "All", label: "All" },
            ]}
          />
        </div>
      </div>
      <div className="p-6">
        <Card>
          <table className="w-full text-[14px]">
            <thead className="bg-ink-50 text-[10px] uppercase font-bold text-ink-500 tracking-wide">
              <tr>
                <th className="text-left px-4 py-2.5">Name</th>
                <th className="text-left px-4 py-2.5">Type</th>
                <th className="text-left px-4 py-2.5">Status</th>
                <th className="text-left px-4 py-2.5">Created By</th>
                <th className="text-left px-4 py-2.5">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-ink-100 hover:bg-ink-50">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-ink-700">{r.type}</td>
                  <td className="px-4 py-3">
                    <span className={"rounded-full px-2 py-0.5 text-[11px] font-semibold " + (r.status === "Published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-700">{r.createdBy}</td>
                  <td className="px-4 py-3 text-ink-700">{r.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}
