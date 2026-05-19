"use client";

import { useMemo, useState } from "react";
import { Search, Plus } from "lucide-react";
import { PageHeader, Card } from "../../../components/manage/ManageShell";
import { CustomSelect } from "../../../components/CustomSelect";
import { Avatar } from "../../../components/Avatar";
import { STAFF_DIRECTORY, type StaffRow } from "../../../lib/manage";

export default function StaffPage() {
  const [rows, setRows] = useState<StaffRow[]>(STAFF_DIRECTORY);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("Active");

  const filtered = useMemo(() =>
    rows.filter((r) =>
      (q.trim() === "" ||
        r.name.toLowerCase().includes(q.toLowerCase()) ||
        r.email.toLowerCase().includes(q.toLowerCase()) ||
        r.phone.includes(q))
    ),
    [rows, q],
  );

  return (
    <>
      <PageHeader title="Staff" actions={
        <button className="h-9 px-3 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700 inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> New staff
        </button>
      } />

      <div className="px-6 py-3 bg-white border-b border-ink-200 flex items-center gap-3">
        <div className="relative">
          <Search className="h-4 w-4 text-ink-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search staff"
            className="h-9 pl-9 pr-3 w-64 rounded border border-ink-300 bg-white text-[14px] outline-none focus:border-brand"
          />
        </div>
        <div className="min-w-[180px]">
          <CustomSelect
            value={status}
            onChange={setStatus}
            options={[
              { value: "Active", label: "Active" },
              { value: "Inactive", label: "Inactive" },
              { value: "All", label: "All staff" },
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
                <th className="text-left px-4 py-2.5">Phone</th>
                <th className="text-left px-4 py-2.5">Email</th>
                <th className="text-left px-4 py-2.5">Role</th>
                <th className="text-left px-4 py-2.5">Permission</th>
                <th className="text-left px-4 py-2.5">Invite</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} className="border-t border-ink-100 hover:bg-ink-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={s.name} hue={(i * 47) % 360} />
                      <span className="font-medium text-ink-900">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-700">{s.phone}</td>
                  <td className="px-4 py-3 text-ink-700">{s.email}</td>
                  <td className="px-4 py-3 text-ink-700">{s.role}</td>
                  <td className="px-4 py-3 text-ink-700">{s.permission}</td>
                  <td className="px-4 py-3">
                    {s.invite === "Confirmed" ? (
                      <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-700">Confirmed</span>
                    ) : (
                      <button
                        onClick={() => setRows((p) => p.map((x) => x.id === s.id ? { ...x, invite: "Resend" } : x))}
                        className="h-7 px-2.5 rounded border border-ink-300 text-[12px] font-medium text-ink-700 hover:bg-ink-50"
                      >
                        {s.invite}
                      </button>
                    )}
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
