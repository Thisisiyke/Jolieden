"use client";

import { Plus, Copy } from "lucide-react";
import { PageHeader, Card } from "../../../components/manage/ManageShell";
import { OFFERS } from "../../../lib/owner";

export default function OffersPage() {
  return (
    <>
      <PageHeader title="Offers" actions={
        <button className="h-9 px-3 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700 inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Offer
        </button>
      } />
      <div className="p-6">
        <Card>
          <table className="w-full text-[14px]">
            <thead className="bg-ink-50 text-[10px] uppercase font-bold text-ink-500 tracking-wide">
              <tr>
                <th className="text-left px-4 py-2.5">Name</th>
                <th className="text-left px-4 py-2.5">Code</th>
                <th className="text-right px-4 py-2.5">Discount</th>
                <th className="text-left px-4 py-2.5">Applies to</th>
              </tr>
            </thead>
            <tbody>
              {OFFERS.map((o) => (
                <tr key={o.id} className="border-t border-ink-100 hover:bg-ink-50">
                  <td className="px-4 py-3 font-medium">{o.name}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2">
                      <code className="bg-ink-100 px-2 py-0.5 rounded text-[12px] font-mono">{o.code}</code>
                      <button className="text-ink-500 hover:text-brand" title="Copy code"><Copy className="h-3.5 w-3.5" /></button>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{o.discountPct}%</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(["services", "products", "packages", "memberships"] as const).map((k) => (
                        <span
                          key={k}
                          className={"rounded-full px-2 py-0.5 text-[10px] font-semibold " + (o.scopes[k] ? "bg-brand text-white" : "bg-ink-100 text-ink-500 line-through")}
                        >
                          {k}
                        </span>
                      ))}
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
