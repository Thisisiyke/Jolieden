"use client";

import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { PageHeader, SubTabs, Card } from "../../../components/manage/ManageShell";
import { IPADS, type IPad } from "../../../lib/manage";

export default function HardwarePage() {
  const [tab, setTab] = useState<"ipads" | "settings">("ipads");
  const [rows, setRows] = useState<IPad[]>(IPADS);

  return (
    <>
      <PageHeader title="Hardware" actions={
        tab === "ipads" ? (
          <button className="h-9 px-3 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700 inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Link New iPad
          </button>
        ) : null
      } />
      <SubTabs<"ipads" | "settings">
        tabs={[
          { id: "ipads", label: "iPads" },
          { id: "settings", label: "Settings" },
        ]}
        value={tab}
        onChange={setTab}
      />
      <div className="p-6">
        {tab === "ipads" && (
          <Card>
            <table className="w-full text-[14px]">
              <thead className="bg-ink-50 text-[10px] uppercase font-bold text-ink-500 tracking-wide">
                <tr>
                  <th className="text-left px-4 py-2.5">Name</th>
                  <th className="text-left px-4 py-2.5">Status</th>
                  <th className="text-left px-4 py-2.5">Chip Reader</th>
                  <th className="text-left px-4 py-2.5">Firmware</th>
                  <th className="text-left px-4 py-2.5">Default</th>
                  <th className="w-16 px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-ink-100 hover:bg-ink-50">
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3">
                      <span className={"rounded-full px-2 py-0.5 text-[11px] font-semibold " + (
                        r.status === "Online" ? "bg-emerald-100 text-emerald-700" :
                        r.status === "Idle" ? "bg-amber-100 text-amber-700" :
                        "bg-ink-100 text-ink-500"
                      )}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-700">{r.chipReader}</td>
                    <td className="px-4 py-3 text-ink-700">{r.firmware}</td>
                    <td className="px-4 py-3">
                      <input
                        type="radio"
                        checked={r.isDefault}
                        onChange={() => setRows((p) => p.map((x) => ({ ...x, isDefault: x.id === r.id })))}
                        className="accent-[color:var(--brand)]"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setRows((p) => p.filter((x) => x.id !== r.id))} className="text-ink-500 hover:text-rose-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
        {tab === "settings" && (
          <Card>
            <div className="p-5 space-y-3 text-[14px]">
              <div className="text-[14px] font-semibold text-ink-900">Hardware preferences</div>
              <label className="flex items-center justify-between gap-3">
                <span>Auto-update firmware overnight</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-[color:var(--brand)]" />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span>Allow tip prompts on customer-facing iPads</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-[color:var(--brand)]" />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span>Print receipts automatically after checkout</span>
                <input type="checkbox" className="h-4 w-4 accent-[color:var(--brand)]" />
              </label>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
