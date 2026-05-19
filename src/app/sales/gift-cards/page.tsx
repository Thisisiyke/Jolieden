"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";
import { SalesTabs } from "../../../components/sales/SalesTabs";
import { CustomSelect } from "../../../components/CustomSelect";
import { GIFT_CARDS, type GiftCard } from "../../../lib/sales";

export default function GiftCardsPage() {
  const [status, setStatus] = useState("ALL");
  const [client, setClient] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const filtered = useMemo(() => GIFT_CARDS.filter((g) =>
    (status === "ALL" || (status === "active" ? g.active : !g.active)) &&
    (client === "" || g.purchasingClient.toLowerCase().includes(client.toLowerCase())) &&
    (email === "" || g.recipientEmail.toLowerCase().includes(email.toLowerCase())) &&
    (code === "" || g.code.toLowerCase().includes(code.toLowerCase()))
  ), [status, client, phone, email, code]);

  const clearAll = () => { setStatus("ALL"); setClient(""); setPhone(""); setEmail(""); setCode(""); };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-ink-50">
      <SalesTabs />
      <div className="flex-1 flex min-h-0">
        <main className="flex-1 overflow-y-auto p-6">
          <div className="rounded-lg border border-ink-200 bg-white overflow-hidden">
            <table className="w-full text-[14px]">
              <thead className="bg-ink-50 text-[10px] uppercase font-bold text-ink-500 tracking-wide">
                <tr>
                  <th className="text-left px-4 py-2.5">Purchasing Client</th>
                  <th className="text-left px-4 py-2.5">Gift Card Code</th>
                  <th className="text-right px-4 py-2.5">Current Balance</th>
                  <th className="text-left px-4 py-2.5">Recipient</th>
                  <th className="text-left px-4 py-2.5">Recipient&apos;s Email</th>
                  <th className="text-left px-4 py-2.5">Source</th>
                  <th className="text-left px-4 py-2.5">Status</th>
                  <th className="w-12 px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((g) => <GcRow key={g.id} g={g} />)}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="py-16 text-center text-ink-500">No gift cards match those filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
        <aside className="w-72 border-l border-ink-200 bg-white p-5 space-y-3 shrink-0 overflow-y-auto">
          <div className="text-[12px] font-bold uppercase tracking-wide text-ink-500">Filters</div>
          <div>
            <div className="text-[10px] uppercase font-bold text-ink-500 mb-1">Gift Card Status</div>
            <CustomSelect value={status} onChange={setStatus} options={[
              { value: "ALL", label: "All" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]} />
          </div>
          <FilterText label="Purchasing Client" value={client} onChange={setClient} />
          <FilterText label="Phone Number" value={phone} onChange={setPhone} />
          <FilterText label="Email" value={email} onChange={setEmail} />
          <FilterText label="Code" value={code} onChange={setCode} mono />
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button onClick={clearAll} className="h-10 rounded border border-ink-300 text-[14px] font-semibold text-ink-700 hover:bg-ink-50">Clear Filter</button>
            <button className="h-10 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700">Apply Filter</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function FilterText({ label, value, onChange, mono }: { label: string; value: string; onChange: (v: string) => void; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase font-bold text-ink-500 mb-1">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={"w-full h-9 px-2 rounded border border-ink-300 bg-white text-[14px] outline-none focus:border-brand " + (mono ? "font-mono" : "")}
      />
    </div>
  );
}

function GcRow({ g }: { g: GiftCard }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  return (
    <tr className="border-t border-ink-100 hover:bg-ink-50">
      <td className="px-4 py-3 font-medium">{g.purchasingClient}</td>
      <td className="px-4 py-3"><code className="text-[12px] font-mono">{g.code}</code></td>
      <td className={"px-4 py-3 text-right font-semibold " + (g.balance > 0 ? "text-emerald-600" : "text-ink-500")}>${g.balance.toFixed(2)}</td>
      <td className="px-4 py-3 text-ink-700">{g.recipient}</td>
      <td className="px-4 py-3 text-ink-700">{g.recipientEmail}</td>
      <td className="px-4 py-3 text-ink-700 capitalize">{g.source}</td>
      <td className="px-4 py-3">
        <span className={"rounded-full px-2 py-0.5 text-[11px] font-semibold " + (g.active ? "bg-emerald-100 text-emerald-700" : "bg-ink-100 text-ink-500")}>
          {g.active ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <div ref={ref} className="relative inline-block">
          <button onClick={() => setOpen((v) => !v)} className="h-8 w-8 rounded hover:bg-ink-100 flex items-center justify-center text-ink-500"><MoreHorizontal className="h-4 w-4" /></button>
          {open && (
            <div className="absolute right-0 top-full mt-1 z-30 w-44 bg-white rounded-lg border border-ink-200 shadow-xl py-1">
              <button onClick={() => setOpen(false)} className="w-full text-left px-3 py-1.5 text-[14px] text-ink-900 hover:bg-ink-50">Edit balance</button>
              <button onClick={() => setOpen(false)} className="w-full text-left px-3 py-1.5 text-[14px] text-ink-900 hover:bg-ink-50">Resend code</button>
              <div className="border-t border-ink-100 my-1" />
              <button onClick={() => setOpen(false)} className="w-full text-left px-3 py-1.5 text-[14px] text-rose-600 hover:bg-rose-50">
                {g.active ? "Deactivate" : "Reactivate"}
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
