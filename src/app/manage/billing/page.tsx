"use client";

import { useState } from "react";
import { ExternalLink, Plus } from "lucide-react";
import { PageHeader, SubTabs, Card } from "../../../components/manage/ManageShell";
import { INVOICES } from "../../../lib/manage";

export default function BillingPage() {
  const [tab, setTab] = useState<"history" | "accounts" | "storage">("history");

  return (
    <>
      <PageHeader title="Billing" />
      <SubTabs<"history" | "accounts" | "storage">
        tabs={[
          { id: "history", label: "Payment history" },
          { id: "accounts", label: "Billing accounts" },
          { id: "storage", label: "Storage" },
        ]}
        value={tab}
        onChange={setTab}
      />
      <div className="p-6">
        {tab === "history" && (
          <Card>
            <table className="w-full text-[14px]">
              <thead className="bg-ink-50 text-[10px] uppercase font-bold tracking-wide text-ink-500">
                <tr>
                  <th className="text-left px-4 py-2.5">Invoice</th>
                  <th className="text-left px-4 py-2.5">Due Date</th>
                  <th className="text-left px-4 py-2.5">Charge Date</th>
                  <th className="text-right px-4 py-2.5">Amount</th>
                  <th className="text-left px-4 py-2.5">Status</th>
                  <th className="w-16 px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {INVOICES.map((iv) => (
                  <tr key={iv.id} className="border-t border-ink-100 hover:bg-ink-50">
                    <td className="px-4 py-3 font-medium text-ink-900">{iv.id}</td>
                    <td className="px-4 py-3 text-ink-700">{iv.dueDate}</td>
                    <td className="px-4 py-3 text-ink-700">{iv.chargeDate}</td>
                    <td className="px-4 py-3 text-right font-semibold">${iv.amount.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={"rounded-full px-2 py-0.5 text-[11px] font-semibold " + (iv.paid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                        {iv.paid ? "Paid" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-ink-500 hover:text-brand" title="View PDF">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {tab === "accounts" && (
          <Card>
            <div className="p-5 flex items-center justify-between">
              <div>
                <div className="text-[14px] font-semibold text-ink-900">Boulevard subscription billing</div>
                <div className="text-[12px] text-ink-500 mt-1">Card on file: Visa ending in 4421 · Expires 09/29</div>
              </div>
              <button className="h-9 px-3 rounded border border-ink-300 text-[14px] font-medium text-ink-700 hover:bg-ink-50">
                Update card
              </button>
            </div>
            <div className="border-t border-ink-100 p-5 flex items-center justify-between">
              <div>
                <div className="text-[12px] uppercase font-bold text-ink-500 tracking-wide">Billing email</div>
                <div className="text-[14px] mt-1">accounts@jolieden.com</div>
              </div>
              <button className="h-9 px-3 rounded border border-ink-300 text-[14px] text-ink-700 hover:bg-ink-50">
                Edit
              </button>
            </div>
            <div className="border-t border-ink-100 p-5">
              <button className="h-9 px-3 rounded border border-dashed border-ink-300 text-[14px] text-ink-700 hover:bg-ink-50 inline-flex items-center gap-1.5">
                <Plus className="h-4 w-4" /> Add backup payment method
              </button>
            </div>
          </Card>
        )}

        {tab === "storage" && (
          <Card>
            <div className="p-5 space-y-3">
              <div className="text-[14px] font-semibold text-ink-900">Storage usage</div>
              <div className="flex items-baseline justify-between">
                <div className="text-[12px] text-ink-500">8.4 GB of 25 GB used</div>
                <div className="text-[12px] text-ink-500">34%</div>
              </div>
              <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
                <div className="h-full bg-brand" style={{ width: "34%" }} />
              </div>
              <div className="text-[12px] text-ink-500">
                Storage covers client forms, before/after photos, and saved charts. Upgrade your plan to expand limits.
              </div>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
