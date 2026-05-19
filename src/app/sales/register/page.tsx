"use client";

import { useState } from "react";
import { ChevronDown, ArrowDownToLine, ArrowUpFromLine, Calculator } from "lucide-react";
import { SalesTabs } from "../../../components/sales/SalesTabs";
import { DRAWERS } from "../../../lib/sales";

export default function RegisterPage() {
  const [selectedId, setSelectedId] = useState(DRAWERS[0].id);
  const [visibleCount, setVisibleCount] = useState(4);
  const drawer = DRAWERS.find((d) => d.id === selectedId)!;

  const rows = [
    { label: "Cash Sales", value: drawer.cashSales },
    { label: "Cash Refunds", value: drawer.cashRefunds },
    { label: "Cash Paid In", value: drawer.cashPaidIn },
    { label: "Expenses Paid Out", value: drawer.expensesOut },
    { label: "Deposits Paid Out", value: drawer.depositsOut },
  ];

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-ink-50">
      <SalesTabs />
      <div className="flex-1 flex min-h-0">
        {/* Left rail */}
        <aside className="w-64 border-r border-ink-200 bg-white shrink-0 overflow-y-auto">
          <div className="pt-3 pb-2">
            {DRAWERS.slice(0, visibleCount).map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedId(d.id)}
                className={
                  "w-full text-left px-4 py-2.5 text-[14px] border-l-2 " +
                  (selectedId === d.id ? "bg-brand/10 text-brand font-semibold border-brand" : "border-transparent text-ink-700 hover:bg-ink-50")
                }
              >
                {d.label}
                {d.current && <span className="ml-2 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5">OPEN</span>}
              </button>
            ))}
            {visibleCount < DRAWERS.length && (
              <button onClick={() => setVisibleCount((c) => c + 10)} className="w-full text-center px-4 py-3 text-[12px] text-brand font-semibold hover:bg-ink-50">
                Load More
              </button>
            )}
          </div>
        </aside>

        {/* Right pane */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="rounded-lg border border-ink-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-ink-200 flex items-center justify-between">
              <div>
                <div className="text-[18px] font-semibold text-ink-900">{drawer.label}</div>
                <div className="text-[11px] text-ink-500 mt-0.5">Reconcile the till — record cash in/out and close the drawer at end of day.</div>
              </div>
              {drawer.current && (
                <span className="rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5">OPEN</span>
              )}
            </div>

            <div className="divide-y divide-ink-100">
              {rows.map((r) => (
                <details key={r.label} className="group">
                  <summary className="px-5 py-3 flex items-center justify-between cursor-pointer list-none">
                    <span className="inline-flex items-center gap-2 text-[14px] text-ink-900">
                      <ChevronDown className="h-4 w-4 text-ink-500 -rotate-90 group-open:rotate-0 transition" />
                      {r.label}
                    </span>
                    <span className={"text-[14px] font-semibold " + (r.value < 0 ? "text-rose-600" : "text-ink-900")}>
                      {r.value === 0 ? "$0.00" : r.value < 0 ? `-$${Math.abs(r.value).toFixed(2)}` : `$${r.value.toFixed(2)}`}
                    </span>
                  </summary>
                  <div className="px-12 pb-3 text-[12px] text-ink-500">
                    Drawer movement detail will list here per transaction.
                  </div>
                </details>
              ))}
            </div>

            <div className="px-5 py-4 bg-brand/5 border-t border-ink-200 flex items-center justify-between">
              <span className="text-[14px] font-bold text-ink-900">Expected In Drawer</span>
              <span className="text-[18px] font-bold text-brand">${drawer.expected.toFixed(2)}</span>
            </div>
          </div>

          {drawer.current && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              <ActionBtn icon={<ArrowDownToLine className="h-4 w-4" />} label="Pay-In" />
              <ActionBtn icon={<ArrowUpFromLine className="h-4 w-4" />} label="Pay-Out" />
              <ActionBtn icon={<Calculator className="h-4 w-4" />} label="Count Drawer" primary />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function ActionBtn({ icon, label, primary }: { icon: React.ReactNode; label: string; primary?: boolean }) {
  return (
    <button className={
      "h-12 rounded-lg text-[14px] font-semibold inline-flex items-center justify-center gap-2 " +
      (primary ? "bg-brand text-white hover:bg-brand-700" : "bg-white border border-ink-300 text-ink-700 hover:bg-ink-50")
    }>
      {icon} {label}
    </button>
  );
}
