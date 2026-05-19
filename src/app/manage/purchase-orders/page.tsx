"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Plus } from "lucide-react";
import { PageHeader, Card } from "../../../components/manage/ManageShell";
import { CustomSelect } from "../../../components/CustomSelect";
import { PURCHASE_ORDERS } from "../../../lib/manage";

export default function PurchaseOrdersPage() {
  const [status, setStatus] = useState("ALL");
  const [supplier, setSupplier] = useState("ALL");

  const suppliers = Array.from(new Set(PURCHASE_ORDERS.map((p) => p.supplier)));
  const filtered = useMemo(() =>
    PURCHASE_ORDERS.filter((r) =>
      (status === "ALL" || r.status === status) &&
      (supplier === "ALL" || r.supplier === supplier)
    ),
    [status, supplier],
  );

  return (
    <>
      <PageHeader title="Purchase Orders" actions={
        <button className="h-9 px-3 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700 inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Purchase Order
        </button>
      } />
      <div className="px-6 py-3 bg-white border-b border-ink-200 flex items-center gap-3 flex-wrap">
        <div className="min-w-[180px]">
          <CustomSelect value={status} onChange={setStatus} options={[
            { value: "ALL", label: "All statuses" },
            { value: "Active", label: "Active" },
            { value: "Received", label: "Received" },
            { value: "Incomplete", label: "Incomplete" },
          ]} />
        </div>
        <div className="min-w-[200px]">
          <CustomSelect value={supplier} onChange={setSupplier} options={[
            { value: "ALL", label: "All suppliers" },
            ...suppliers.map((s) => ({ value: s, label: s })),
          ]} />
        </div>
      </div>
      <div className="p-6">
        <Card>
          <table className="w-full text-[14px]">
            <thead className="bg-ink-50 text-[10px] uppercase font-bold text-ink-500 tracking-wide">
              <tr>
                <th className="text-left px-4 py-2.5">Order #</th>
                <th className="text-left px-4 py-2.5">Ordered</th>
                <th className="text-left px-4 py-2.5">Supplier</th>
                <th className="text-left px-4 py-2.5">Status</th>
                <th className="text-right px-4 py-2.5">Received / Ordered</th>
                <th className="text-left px-4 py-2.5">Expected</th>
                <th className="text-right px-4 py-2.5">Total</th>
                <th className="w-16 px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-ink-100 hover:bg-ink-50">
                  <td className="px-4 py-3 font-medium">{r.id}</td>
                  <td className="px-4 py-3 text-ink-700">{r.orderedAt}</td>
                  <td className="px-4 py-3 text-ink-700">{r.supplier}</td>
                  <td className="px-4 py-3">
                    <span className={"rounded-full px-2 py-0.5 text-[11px] font-semibold " + (
                      r.status === "Active" ? "bg-sky-100 text-sky-700" :
                      r.status === "Received" ? "bg-emerald-100 text-emerald-700" :
                      "bg-amber-100 text-amber-700"
                    )}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{r.received} / {r.ordered}</td>
                  <td className="px-4 py-3 text-ink-700">{r.expected}</td>
                  <td className="px-4 py-3 text-right font-semibold">${r.total.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-ink-500 hover:text-brand"><ExternalLink className="h-4 w-4" /></button>
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
