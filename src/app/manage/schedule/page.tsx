"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { PageHeader, SubTabs, Card } from "../../../components/manage/ManageShell";
import { STAFF_DIRECTORY } from "../../../lib/manage";

const DOW = ["Mon May 11", "Tue May 12", "Wed May 13", "Thu May 14", "Fri May 15", "Sat May 16", "Sun May 17"];
const SHIFTS: Record<string, string[]> = {
  s1: ["9a–5p", "9a–5p", "—", "9a–5p", "9a–7p", "9a–7p", "—"],
  s2: ["10a–6p", "10a–6p", "10a–6p", "10a–6p", "10a–8p", "10a–8p", "10a–4p"],
  s3: ["—", "11a–7p", "11a–7p", "11a–7p", "11a–8p", "10a–6p", "—"],
  s4: ["9a–3p", "—", "—", "9a–3p", "9a–5p", "9a–5p", "—"],
  s5: ["—", "—", "10a–4p", "10a–4p", "10a–6p", "10a–6p", "10a–4p"],
  s6: ["10a–6p", "10a–6p", "—", "10a–6p", "10a–7p", "10a–7p", "—"],
  s7: ["—", "9a–5p", "9a–5p", "9a–5p", "—", "9a–5p", "—"],
  s8: ["—", "—", "11a–5p", "11a–5p", "11a–5p", "11a–5p", "—"],
};

export default function SchedulePage() {
  const [tab, setTab] = useState<"staff" | "resources">("staff");
  const [q, setQ] = useState("");

  const filtered = STAFF_DIRECTORY.filter((s) =>
    q.trim() === "" || s.name.toLowerCase().includes(q.toLowerCase()),
  );
  const grouped = {
    "Manager": filtered.filter((s) => s.role === "Manager"),
    "General Staff": filtered.filter((s) => s.role === "General Staff"),
    "Hair Washer": filtered.filter((s) => s.role === "Hair Washer"),
  };

  return (
    <>
      <PageHeader title="Schedule" actions={
        <div className="flex items-center gap-2">
          <button className="h-9 w-9 rounded border border-ink-300 hover:bg-ink-50 flex items-center justify-center text-ink-700"><ChevronLeft className="h-4 w-4" /></button>
          <span className="text-[14px] font-semibold text-ink-900">Week of May 11, 2026</span>
          <button className="h-9 w-9 rounded border border-ink-300 hover:bg-ink-50 flex items-center justify-center text-ink-700"><ChevronRight className="h-4 w-4" /></button>
        </div>
      } />
      <SubTabs<"staff" | "resources">
        tabs={[{ id: "staff", label: "Staff" }, { id: "resources", label: "Resources" }]}
        value={tab}
        onChange={setTab}
      />
      <div className="px-6 py-3 bg-white border-b border-ink-200">
        <div className="relative max-w-xs">
          <Search className="h-4 w-4 text-ink-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search staff"
            className="h-9 pl-9 pr-3 w-full rounded border border-ink-300 bg-white text-[14px] outline-none focus:border-brand"
          />
        </div>
      </div>
      <div className="p-6">
        {tab === "staff" ? (
          <Card>
            <table className="w-full text-[12px]">
              <thead className="bg-ink-50">
                <tr>
                  <th className="text-left px-3 py-2 font-bold uppercase text-[10px] text-ink-500 w-48">Staff</th>
                  {DOW.map((d) => (
                    <th key={d} className="text-left px-3 py-2 font-bold uppercase text-[10px] text-ink-500">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(grouped).map(([role, list]) => (
                  list.length > 0 && (
                    <>
                      <tr key={role} className="bg-ink-50 border-t border-ink-200">
                        <td colSpan={8} className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wide text-ink-500">{role}</td>
                      </tr>
                      {list.map((s) => (
                        <tr key={s.id} className="border-t border-ink-100 hover:bg-ink-50">
                          <td className="px-3 py-2 font-medium text-ink-900">{s.name}</td>
                          {SHIFTS[s.id].map((sh, i) => (
                            <td key={i} className="px-3 py-2">
                              {sh === "—" ? (
                                <button className="h-7 w-7 rounded border border-dashed border-ink-300 text-ink-400 hover:text-brand hover:border-brand flex items-center justify-center">
                                  <Plus className="h-3 w-3" />
                                </button>
                              ) : (
                                <div className="rounded bg-brand/10 text-brand px-2 py-1 text-[11px] font-semibold inline-block">
                                  {sh}
                                </div>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </>
                  )
                ))}
              </tbody>
            </table>
          </Card>
        ) : (
          <Card>
            <div className="p-8 text-center text-ink-500 text-[14px]">
              No resources configured. Add resources first under Resources to schedule them.
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
