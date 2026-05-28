"use client";

import { useState } from "react";
import { ChevronDown, ArrowDownToLine, ArrowUpFromLine, Calculator, X, Check } from "lucide-react";
import { SalesTabs } from "../../../components/sales/SalesTabs";
import { DRAWERS } from "../../../lib/sales";

type ModalKind = null | "in" | "out" | "count";

export default function RegisterPage() {
  const [selectedId, setSelectedId] = useState(DRAWERS[0].id);
  const [visibleCount, setVisibleCount] = useState(4);
  const drawer = DRAWERS.find((d) => d.id === selectedId)!;
  const [modal, setModal] = useState<ModalKind>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  const closeModal = () => {
    setModal(null);
    setAmount("");
    setNote("");
  };

  const submitModal = () => {
    if (!amount) return;
    const action =
      modal === "in" ? "Pay-In" : modal === "out" ? "Pay-Out" : "Drawer count";
    setSuccess(`${action} of $${amount} recorded · ${new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`);
    closeModal();
    window.setTimeout(() => setSuccess(null), 3500);
  };

  // Variance for closed drawers (mock: expected - 12 = "actual").
  const variance = drawer.current ? null : Math.round((drawer.expected - 12) * 100) / 100;

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
            {variance !== null && (
              <div className={
                "px-5 py-3 border-t border-ink-200 flex items-center justify-between text-[13px] " +
                (variance === 0 ? "bg-status-confirmed/5 text-status-confirmed" : "bg-rose-50 text-rose-700")
              }>
                <span className="font-mono uppercase tracking-wider text-[10px]">End-of-day variance</span>
                <span className="font-semibold">
                  {variance === 0 ? "Balanced ✓" : variance > 0 ? `+$${variance}` : `-$${Math.abs(variance)}`}
                </span>
              </div>
            )}
          </div>

          {drawer.current && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              <ActionBtn icon={<ArrowDownToLine className="h-4 w-4" />} label="Pay-In" onClick={() => setModal("in")} />
              <ActionBtn icon={<ArrowUpFromLine className="h-4 w-4" />} label="Pay-Out" onClick={() => setModal("out")} />
              <ActionBtn icon={<Calculator className="h-4 w-4" />} label="Count Drawer" primary onClick={() => setModal("count")} />
            </div>
          )}

          {/* Success toast */}
          {success && (
            <div className="mt-3 flex items-center gap-2 rounded-md border border-status-confirmed/30 bg-status-confirmed/5 px-3 py-2 text-[13px] text-status-confirmed">
              <Check className="h-3.5 w-3.5" />
              {success}
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {modal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl border border-ink-200 bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-ink-200 px-4 py-3">
              <h2 className="text-[15px] font-semibold text-ink-900">
                {modal === "in" ? "Cash Pay-In" : modal === "out" ? "Cash Pay-Out" : "Count Drawer"}
              </h2>
              <button type="button" onClick={closeModal} aria-label="Close" className="rounded p-1 text-ink-500 hover:bg-ink-100">
                <X className="h-4 w-4" />
              </button>
            </header>
            <div className="space-y-3 px-4 py-4">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
                  {modal === "count" ? "Counted total" : "Amount"}
                </label>
                <input
                  type="number"
                  autoFocus
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="mt-1 w-full rounded-md border border-ink-300 bg-white px-3 py-2 text-base focus:border-brand focus:outline-none"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
                  Note (optional)
                </label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={modal === "in" ? "Source of cash" : modal === "out" ? "Reason for pay-out" : "Reconciler initials"}
                  className="mt-1 w-full rounded-md border border-ink-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
                />
              </div>
              {modal === "count" && (
                <div className="rounded-md bg-paper px-3 py-2 text-xs text-ink-700">
                  Expected: <strong className="text-brand">${drawer.expected.toFixed(2)}</strong>
                  {amount && (
                    <>
                      {" · Variance: "}
                      <strong className={Number(amount) === drawer.expected ? "text-status-confirmed" : "text-rose-700"}>
                        {Number(amount) === drawer.expected
                          ? "$0 ✓"
                          : `${Number(amount) > drawer.expected ? "+" : "-"}$${Math.abs(Number(amount) - drawer.expected).toFixed(2)}`}
                      </strong>
                    </>
                  )}
                </div>
              )}
            </div>
            <footer className="flex items-center justify-end gap-2 border-t border-ink-200 px-4 py-3">
              <button type="button" onClick={closeModal} className="rounded-md border border-ink-300 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-ink-50">
                Cancel
              </button>
              <button type="button" onClick={submitModal} disabled={!amount} className="rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
                {modal === "count" ? "Reconcile" : "Record"}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ icon, label, primary, onClick }: { icon: React.ReactNode; label: string; primary?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "h-12 rounded-lg text-[14px] font-semibold inline-flex items-center justify-center gap-2 " +
        (primary ? "bg-brand text-white hover:bg-brand-700" : "bg-white border border-ink-300 text-ink-700 hover:bg-ink-50")
      }
    >
      {icon} {label}
    </button>
  );
}
