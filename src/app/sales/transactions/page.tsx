"use client";

import { useMemo, useState } from "react";
import { CreditCard, Banknote } from "lucide-react";
import { SalesTabs } from "../../../components/sales/SalesTabs";
import { CustomSelect } from "../../../components/CustomSelect";
import { ORDERS } from "../../../lib/sales";

type Row = {
  id: string;
  method: string;
  last4?: string;
  date: string;
  time: string;
  client: string;
  merchant: string;
  total: number;
};

const PAYMENTS: Row[] = ORDERS.flatMap((o) =>
  o.payments.map((p, i) => ({
    id: `${o.id}-p${i}`,
    method: p.method,
    last4: p.last4,
    date: o.date,
    time: o.time,
    client: o.client,
    merchant: "Jolieden's Beauty Bar · Frederick Douglass",
    total: p.amount,
  })),
);

export default function PaymentsPage() {
  const [method, setMethod] = useState("ALL");
  const [client, setClient] = useState("");
  const [last4, setLast4] = useState("");

  const filtered = useMemo(() => {
    return PAYMENTS.filter((r) =>
      (method === "ALL" || r.method === method) &&
      (client === "" || r.client.toLowerCase().includes(client.toLowerCase())) &&
      (last4 === "" || (r.last4 ?? "").includes(last4)),
    );
  }, [method, client, last4]);

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-ink-50">
      <SalesTabs />
      <div className="flex-1 flex min-h-0">
        <main className="flex-1 overflow-y-auto p-6">
          <div className="rounded-lg border border-ink-200 bg-white overflow-hidden">
            <table className="w-full text-[14px]">
              <thead className="bg-ink-50 text-[10px] uppercase font-bold text-ink-500 tracking-wide">
                <tr>
                  <th className="w-12 px-4 py-2.5" />
                  <th className="text-left px-4 py-2.5">Date</th>
                  <th className="text-left px-4 py-2.5">Client</th>
                  <th className="text-left px-4 py-2.5">Merchant</th>
                  <th className="text-right px-4 py-2.5">Total</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-ink-100 hover:bg-ink-50">
                    <td className="px-4 py-3">
                      <div className="h-8 w-10 rounded bg-ink-100 flex items-center justify-center" title={r.method}>
                        {r.method === "Cash" ? <Banknote className="h-4 w-4 text-emerald-600" /> : <CreditCard className="h-4 w-4 text-ink-700" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-700">{r.date} · {r.time}</td>
                    <td className="px-4 py-3 font-medium">{r.client}</td>
                    <td className="px-4 py-3 text-ink-500 truncate max-w-[300px]">{r.merchant}</td>
                    <td className="px-4 py-3 text-right font-semibold">${r.total.toFixed(2)}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="py-16 text-center text-ink-500">No payments match those filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
        <aside className="w-72 border-l border-ink-200 bg-white p-5 space-y-3 shrink-0 overflow-y-auto">
          <div className="text-[12px] font-bold uppercase tracking-wide text-ink-500">Filters</div>
          <div>
            <div className="text-[10px] uppercase font-bold text-ink-500 mb-1">Status</div>
            <CustomSelect value={method} onChange={setMethod} options={[
              { value: "ALL", label: "All Payment Methods" },
              { value: "Visa", label: "Visa" },
              { value: "MasterCard", label: "MasterCard" },
              { value: "Discover", label: "Discover" },
              { value: "Amex", label: "Amex" },
              { value: "Cash", label: "Cash" },
              { value: "Account Credit", label: "Account Credit" },
              { value: "Voucher", label: "Voucher" },
            ]} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-ink-500 mb-1">Client Name</div>
            <input value={client} onChange={(e) => setClient(e.target.value)} className="w-full h-9 px-2 rounded border border-ink-300 bg-white text-[14px] outline-none focus:border-brand" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-ink-500 mb-1">Last 4 of credit card</div>
            <input value={last4} onChange={(e) => setLast4(e.target.value)} maxLength={4} className="w-full h-9 px-2 rounded border border-ink-300 bg-white text-[14px] font-mono outline-none focus:border-brand" />
          </div>
          <button className="w-full h-10 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700">Apply Filter</button>
        </aside>
      </div>
    </div>
  );
}
