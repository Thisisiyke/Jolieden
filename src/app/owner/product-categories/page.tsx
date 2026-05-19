"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader, Card, ToggleRow } from "../../../components/manage/ManageShell";
import { PRODUCT_CATEGORIES } from "../../../lib/owner";

export default function ProductCategoriesPage() {
  const [rows, setRows] = useState(PRODUCT_CATEGORIES);
  return (
    <>
      <PageHeader title="Product Categories" actions={
        <button className="h-9 px-3 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700 inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> Create Category
        </button>
      } />
      <div className="p-6">
        <Card>
          <table className="w-full text-[14px]">
            <thead className="bg-ink-50 text-[10px] uppercase font-bold text-ink-500 tracking-wide">
              <tr>
                <th className="text-left px-4 py-2.5">Name</th>
                <th className="text-left px-4 py-2.5">Commission Enabled</th>
                <th className="text-left px-4 py-2.5">Retail</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-ink-100 hover:bg-ink-50">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3">
                    <ToggleRow checked={r.commission} onChange={(v) => setRows((p) => p.map((x) => x.id === r.id ? { ...x, commission: v } : x))} />
                  </td>
                  <td className="px-4 py-3">
                    <ToggleRow checked={r.retail} onChange={(v) => setRows((p) => p.map((x) => x.id === r.id ? { ...x, retail: v } : x))} />
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
