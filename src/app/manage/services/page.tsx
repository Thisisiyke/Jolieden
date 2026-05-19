"use client";

import { useState } from "react";
import { Plus, ChevronRight } from "lucide-react";
import { PageHeader, Card, ToggleRow } from "../../../components/manage/ManageShell";
import { SERVICE_CATEGORIES, SERVICES_LIST, type ServiceItem } from "../../../lib/manage";

export default function ServicesPage() {
  const [rows, setRows] = useState<ServiceItem[]>(SERVICES_LIST);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const visible = categoryFilter === null ? rows : rows.filter((r) => r.category === categoryFilter);

  return (
    <>
      <PageHeader title="Services" actions={
        <>
          <button className="h-9 px-3 rounded border border-ink-300 text-[14px] font-medium text-ink-700 hover:bg-ink-50 inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Category
          </button>
          <button className="h-9 px-3 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700 inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Service
          </button>
        </>
      } />
      <div className="p-6 grid grid-cols-12 gap-4">
        <aside className="col-span-3">
          <Card>
            <button
              onClick={() => setCategoryFilter(null)}
              className={"w-full flex items-center justify-between px-4 py-2.5 text-[14px] " + (categoryFilter === null ? "bg-brand/10 text-brand font-semibold" : "text-ink-700 hover:bg-ink-50")}
            >
              <span>All services</span>
              <span className="text-[11px] text-ink-500">({rows.length})</span>
            </button>
            <div className="border-t border-ink-100">
              {SERVICE_CATEGORIES.map((c) => {
                const count = rows.filter((r) => r.category === c.name).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCategoryFilter(c.name)}
                    className={"w-full flex items-center justify-between px-4 py-2 text-[14px] border-b border-ink-100 last:border-b-0 " + (categoryFilter === c.name ? "bg-brand/10 text-brand font-semibold" : "text-ink-700 hover:bg-ink-50")}
                  >
                    <span>{c.name}</span>
                    <span className="text-[11px] text-ink-500">({count})</span>
                  </button>
                );
              })}
            </div>
          </Card>
        </aside>
        <div className="col-span-9">
          <Card>
            <table className="w-full text-[14px]">
              <thead className="bg-ink-50 text-[10px] uppercase font-bold text-ink-500 tracking-wide">
                <tr>
                  <th className="w-12 px-4 py-2.5" />
                  <th className="text-left px-4 py-2.5">Service</th>
                  <th className="text-left px-4 py-2.5">Category</th>
                  <th className="text-left px-4 py-2.5">Scheduling Order</th>
                  <th className="text-right px-4 py-2.5">Duration</th>
                  <th className="text-right px-4 py-2.5">Price</th>
                  <th className="w-12 px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {visible.map((s) => (
                  <tr key={s.id} className="border-t border-ink-100 hover:bg-ink-50">
                    <td className="px-4 py-3">
                      <ToggleRow
                        checked={s.enabled}
                        onChange={(v) => setRows((p) => p.map((x) => x.id === s.id ? { ...x, enabled: v } : x))}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-ink-900">{s.name}</td>
                    <td className="px-4 py-3 text-ink-700">{s.category}</td>
                    <td className="px-4 py-3">
                      <span className={"rounded px-2 py-0.5 text-[11px] font-semibold " + (s.schedulingOrder === "Flexible" ? "bg-sky-100 text-sky-700" : "bg-amber-100 text-amber-700")}>
                        {s.schedulingOrder}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-ink-700">{s.duration}</td>
                    <td className="px-4 py-3 text-right font-semibold">${s.price}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-ink-500 hover:text-brand"><ChevronRight className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </>
  );
}
