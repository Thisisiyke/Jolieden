"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader, Card, ToggleRow } from "../../../components/manage/ManageShell";
import { STAFF_ROLES } from "../../../lib/owner";

export default function StaffRolesPage() {
  const [rows, setRows] = useState(STAFF_ROLES);
  return (
    <>
      <PageHeader title="Staff Roles" actions={
        <button className="h-9 px-3 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700 inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> New staff role
        </button>
      } />
      <div className="p-6 max-w-2xl">
        <Card>
          <table className="w-full text-[14px]">
            <thead className="bg-ink-50 text-[10px] uppercase font-bold text-ink-500 tracking-wide">
              <tr>
                <th className="text-left px-4 py-2.5">Name</th>
                <th className="text-left px-4 py-2.5">Performs services</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-ink-100 hover:bg-ink-50">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ToggleRow
                        checked={r.performsServices}
                        onChange={(v) => setRows((p) => p.map((x) => x.id === r.id ? { ...x, performsServices: v } : x))}
                      />
                      <span className="text-[12px] text-ink-500">{r.performsServices ? "Yes" : "No"}</span>
                    </div>
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
