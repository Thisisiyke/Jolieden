"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { SalesTabs } from "../../../components/sales/SalesTabs";
import { CustomSelect } from "../../../components/CustomSelect";
import { ORDERS, type Order, type OrderStatus } from "../../../lib/sales";

const STATUS_PILL: Record<OrderStatus, string> = {
  Closed: "bg-emerald-100 text-emerald-700",
  Open: "bg-sky-100 text-sky-700",
  Refunded: "bg-amber-100 text-amber-700",
  Voided: "bg-ink-100 text-ink-500",
};

export default function OrdersPage() {
  const [rows] = useState<Order[]>(ORDERS);
  const [status, setStatus] = useState("open-closed");
  const [orderNum, setOrderNum] = useState("");
  const [clientName, setClientName] = useState("");
  const [last4, setLast4] = useState("");

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (status === "open-only" && r.status !== "Open") return false;
      if (status === "closed-only" && r.status !== "Closed") return false;
      if (status === "refunded-only" && r.status !== "Refunded") return false;
      if (status === "voided-only" && r.status !== "Voided") return false;
      if (orderNum && !r.number.includes(orderNum)) return false;
      if (clientName && !r.client.toLowerCase().includes(clientName.toLowerCase())) return false;
      if (last4 && !r.payments.some((p) => p.last4 === last4)) return false;
      return true;
    });
  }, [rows, status, orderNum, clientName, last4]);

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-ink-50">
      <SalesTabs />
      <div className="flex-1 flex min-h-0">
        <main className="flex-1 overflow-y-auto p-6">
          <div className="rounded-lg border border-ink-200 bg-white overflow-hidden">
            <table className="w-full text-[14px]">
              <thead className="bg-ink-50 text-[10px] uppercase font-bold text-ink-500 tracking-wide">
                <tr>
                  <th className="text-left px-4 py-2.5">Order #</th>
                  <th className="text-left px-4 py-2.5">Date</th>
                  <th className="text-left px-4 py-2.5">Client</th>
                  <th className="text-left px-4 py-2.5">Status</th>
                  <th className="text-right px-4 py-2.5">Total</th>
                  <th className="w-12 px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => <Row key={r.id} r={r} />)}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="py-16 text-center text-ink-500 text-[14px]">No orders match those filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </main>

        {/* Filters rail */}
        <aside className="w-72 border-l border-ink-200 bg-white p-5 space-y-3 shrink-0 overflow-y-auto">
          <div className="text-[12px] font-bold uppercase tracking-wide text-ink-500">Filters</div>
          <button className="w-full h-9 px-3 rounded border border-ink-300 bg-white text-[14px] font-medium text-ink-700 hover:bg-ink-50 text-left">
            Select a date range
          </button>
          <FilterField label="Status">
            <CustomSelect value={status} onChange={setStatus} options={[
              { value: "open-closed", label: "Open & Closed" },
              { value: "open-only", label: "Open Only" },
              { value: "closed-only", label: "Closed Only" },
              { value: "refunded-only", label: "Refunded Only" },
              { value: "voided-only", label: "Voided Only" },
            ]} />
          </FilterField>
          <FilterField label="Order Number">
            <input value={orderNum} onChange={(e) => setOrderNum(e.target.value)} className="w-full h-9 px-2 rounded border border-ink-300 bg-white text-[14px] outline-none focus:border-brand" placeholder="#22421" />
          </FilterField>
          <FilterField label="Client Name">
            <input value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full h-9 px-2 rounded border border-ink-300 bg-white text-[14px] outline-none focus:border-brand" />
          </FilterField>
          <FilterField label="Last 4 of credit card">
            <input value={last4} onChange={(e) => setLast4(e.target.value)} maxLength={4} className="w-full h-9 px-2 rounded border border-ink-300 bg-white text-[14px] outline-none focus:border-brand font-mono" />
          </FilterField>
          <FilterField label="Tags">
            <button className="w-full h-9 px-3 rounded border border-dashed border-ink-300 text-[12px] text-ink-700 hover:bg-ink-50 font-semibold tracking-wide uppercase">
              Add tags +
            </button>
          </FilterField>
          <button className="w-full h-10 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700">
            Apply Filter
          </button>
        </aside>
      </div>
    </div>
  );
}

function Row({ r }: { r: Order }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState(r.note ?? "");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [menuOpen]);

  return (
    <tr className="border-t border-ink-100 hover:bg-ink-50">
      <td className="px-4 py-3 font-medium">
        <Link href={`/sales/order/${r.uuid}`} className="text-brand hover:underline">{r.number}</Link>
      </td>
      <td className="px-4 py-3 text-ink-700">{r.date} · {r.time}</td>
      <td className="px-4 py-3 text-ink-700">{r.client}</td>
      <td className="px-4 py-3">
        <span className={"rounded-full px-2 py-0.5 text-[11px] font-semibold " + STATUS_PILL[r.status]}>
          {r.status}
        </span>
      </td>
      <td className="px-4 py-3 text-right font-semibold">${r.total.toFixed(2)}</td>
      <td className="px-4 py-3 text-right">
        <div ref={ref} className="relative inline-block">
          <button onClick={() => setMenuOpen((v) => !v)} className="h-8 w-8 rounded hover:bg-ink-100 flex items-center justify-center text-ink-500">
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-30 w-40 bg-white rounded-lg border border-ink-200 shadow-xl py-1">
              <button onClick={() => { setMenuOpen(false); setNoteOpen(true); }} className="w-full text-left px-3 py-1.5 text-[14px] text-ink-900 hover:bg-ink-50">
                Order Note
              </button>
            </div>
          )}
          {noteOpen && (
            <div className="absolute right-0 top-full mt-1 z-40 w-72 bg-white rounded-lg border border-ink-200 shadow-xl p-3">
              <div className="text-[11px] font-bold uppercase text-ink-500 mb-1">Order note</div>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="w-full p-2 rounded border border-ink-300 text-[14px] outline-none focus:border-brand resize-none" placeholder="Private note for this order…" />
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setNoteOpen(false)} className="h-8 px-3 rounded border border-ink-300 text-[12px] text-ink-700 hover:bg-ink-50">Cancel</button>
                <button onClick={() => setNoteOpen(false)} className="h-8 px-3 rounded bg-brand text-white text-[12px] font-semibold">Save</button>
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase font-bold tracking-wide text-ink-500 mb-1">{label}</div>
      {children}
    </div>
  );
}
