"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { PageHeader, SubTabs, Card } from "../../../components/manage/ManageShell";

type Tab = "overview" | "payouts" | "daily" | "monthly" | "account" | "disputes" | "documents";

const PAYOUTS = [
  { id: "PO-9921", date: "May 11, 2026", amount: 4218.42, account: "**** 9368", status: "Paid" },
  { id: "PO-9907", date: "May 09, 2026", amount: 3140.10, account: "**** 9368", status: "Paid" },
  { id: "PO-9892", date: "May 07, 2026", amount: 2854.50, account: "**** 9368", status: "Paid" },
  { id: "PO-9878", date: "May 05, 2026", amount: 5102.88, account: "**** 9368", status: "Paid" },
];

const DAILY = [
  { date: "May 11", txns: 22, gross: 4980.55, refunds: 0,    net: 4980.55 },
  { date: "May 10", txns: 0,  gross: 0,       refunds: 0,    net: 0 },
  { date: "May 09", txns: 19, gross: 3812.10, refunds: -120, net: 3692.10 },
  { date: "May 08", txns: 16, gross: 3104.40, refunds: 0,    net: 3104.40 },
  { date: "May 07", txns: 14, gross: 2854.50, refunds: 0,    net: 2854.50 },
];

const MONTHLY = [
  { period: "May 2026", txns: 71, gross: 14751.55, refunds: -120, net: 14631.55 },
  { period: "Apr 2026", txns: 312, gross: 62380.00, refunds: -845, net: 61535.00 },
  { period: "Mar 2026", txns: 298, gross: 59112.40, refunds: -310, net: 58802.40 },
];

const DISPUTES = [
  { id: "DP-441", date: "May 02, 2026", amount: 320, client: "(Anonymous)", reason: "Product not received", due: "May 12, 2026" },
];

export default function PaymentProcessingPage() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <>
      <PageHeader title="Payment Processing" />
      <SubTabs<Tab>
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "payouts", label: "Payout history" },
          { id: "daily", label: "Daily activity" },
          { id: "monthly", label: "Monthly activity" },
          { id: "account", label: "Account info" },
          { id: "disputes", label: "Disputes", badge: "1" },
          { id: "documents", label: "Documents" },
        ]}
        value={tab}
        onChange={setTab}
      />
      <div className="p-6 space-y-4">
        {tab === "overview" && (
          <>
            <Card>
              <div className="p-5">
                <div className="text-[12px] uppercase tracking-wide font-bold text-ink-500">Instant Payout</div>
                <div className="mt-2 flex items-baseline justify-between">
                  <div>
                    <div className="text-[28px] font-bold text-ink-900">$7,156.63</div>
                    <div className="text-[12px] text-ink-500 mt-1">Available now</div>
                  </div>
                  <button className="h-10 px-5 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700">
                    Payout now
                  </button>
                </div>
              </div>
              <div className="border-t border-ink-100 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded bg-ink-100 flex items-center justify-center"><CreditCard className="h-4 w-4 text-ink-700" /></div>
                  <div>
                    <div className="text-[14px] font-semibold text-ink-900">Linked account</div>
                    <div className="text-[12px] text-ink-500">Chase Bank · **** 9368</div>
                  </div>
                </div>
                <button className="h-9 px-3 rounded border border-ink-300 text-[14px] text-ink-700 hover:bg-ink-50">
                  Modify
                </button>
              </div>
              <div className="border-t border-ink-100 px-5 py-4">
                <div className="text-[12px] uppercase tracking-wide font-bold text-ink-500">Payout schedule</div>
                <div className="text-[14px] text-ink-700 mt-1">Funds settle every <span className="font-semibold text-ink-900">Monday & Thursday</span>.</div>
              </div>
            </Card>

            <Card>
              <div className="px-5 py-3 bg-ink-50 text-[12px] font-semibold text-ink-700 border-b border-ink-200">
                Recent payouts
              </div>
              <table className="w-full text-[14px]">
                <thead className="bg-ink-50 text-[10px] uppercase font-bold text-ink-500 tracking-wide">
                  <tr>
                    <th className="text-left px-4 py-2.5">Payout</th>
                    <th className="text-left px-4 py-2.5">Date</th>
                    <th className="text-left px-4 py-2.5">Account</th>
                    <th className="text-right px-4 py-2.5">Amount</th>
                    <th className="text-left px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {PAYOUTS.map((p) => (
                    <tr key={p.id} className="border-t border-ink-100">
                      <td className="px-4 py-3 font-medium text-ink-900">{p.id}</td>
                      <td className="px-4 py-3 text-ink-700">{p.date}</td>
                      <td className="px-4 py-3 text-ink-700">{p.account}</td>
                      <td className="px-4 py-3 text-right font-semibold">${p.amount.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-700">{p.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </>
        )}

        {tab === "payouts" && (
          <Card>
            <table className="w-full text-[14px]">
              <thead className="bg-ink-50 text-[10px] uppercase font-bold text-ink-500 tracking-wide">
                <tr>
                  <th className="text-left px-4 py-2.5">Payout</th>
                  <th className="text-left px-4 py-2.5">Date</th>
                  <th className="text-left px-4 py-2.5">Account</th>
                  <th className="text-right px-4 py-2.5">Amount</th>
                  <th className="text-left px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {PAYOUTS.map((p) => (
                  <tr key={p.id} className="border-t border-ink-100">
                    <td className="px-4 py-3 font-medium">{p.id}</td>
                    <td className="px-4 py-3 text-ink-700">{p.date}</td>
                    <td className="px-4 py-3 text-ink-700">{p.account}</td>
                    <td className="px-4 py-3 text-right font-semibold">${p.amount.toFixed(2)}</td>
                    <td className="px-4 py-3"><span className="rounded-full px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-700">{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {tab === "daily" && (
          <Card>
            <table className="w-full text-[14px]">
              <thead className="bg-ink-50 text-[10px] uppercase font-bold text-ink-500 tracking-wide">
                <tr>
                  <th className="text-left px-4 py-2.5">Date</th>
                  <th className="text-right px-4 py-2.5">Transactions</th>
                  <th className="text-right px-4 py-2.5">Gross</th>
                  <th className="text-right px-4 py-2.5">Refunds</th>
                  <th className="text-right px-4 py-2.5">Net</th>
                </tr>
              </thead>
              <tbody>
                {DAILY.map((d) => (
                  <tr key={d.date} className="border-t border-ink-100">
                    <td className="px-4 py-3 font-medium">{d.date}</td>
                    <td className="px-4 py-3 text-right">{d.txns}</td>
                    <td className="px-4 py-3 text-right">${d.gross.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-rose-600">{d.refunds === 0 ? "$0.00" : `-$${Math.abs(d.refunds).toFixed(2)}`}</td>
                    <td className="px-4 py-3 text-right font-semibold">${d.net.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {tab === "monthly" && (
          <Card>
            <table className="w-full text-[14px]">
              <thead className="bg-ink-50 text-[10px] uppercase font-bold text-ink-500 tracking-wide">
                <tr>
                  <th className="text-left px-4 py-2.5">Month</th>
                  <th className="text-right px-4 py-2.5">Transactions</th>
                  <th className="text-right px-4 py-2.5">Gross</th>
                  <th className="text-right px-4 py-2.5">Refunds</th>
                  <th className="text-right px-4 py-2.5">Net</th>
                </tr>
              </thead>
              <tbody>
                {MONTHLY.map((m) => (
                  <tr key={m.period} className="border-t border-ink-100">
                    <td className="px-4 py-3 font-medium">{m.period}</td>
                    <td className="px-4 py-3 text-right">{m.txns}</td>
                    <td className="px-4 py-3 text-right">${m.gross.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-rose-600">{m.refunds === 0 ? "$0.00" : `-$${Math.abs(m.refunds).toFixed(2)}`}</td>
                    <td className="px-4 py-3 text-right font-semibold">${m.net.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {tab === "account" && (
          <Card>
            <div className="p-5 space-y-3 text-[14px]">
              <Field label="Legal business name" value="Jolieden's Beauty Bar LLC" />
              <Field label="EIN" value="**-***1234" />
              <Field label="Processor" value="Stripe Connect" />
              <Field label="Account holder" value="Frederick Douglass" />
              <Field label="Bank" value="Chase Bank · **** 9368" />
            </div>
          </Card>
        )}

        {tab === "disputes" && (
          <Card>
            <table className="w-full text-[14px]">
              <thead className="bg-ink-50 text-[10px] uppercase font-bold text-ink-500 tracking-wide">
                <tr>
                  <th className="text-left px-4 py-2.5">Dispute</th>
                  <th className="text-left px-4 py-2.5">Date</th>
                  <th className="text-right px-4 py-2.5">Amount</th>
                  <th className="text-left px-4 py-2.5">Reason</th>
                  <th className="text-left px-4 py-2.5">Respond by</th>
                  <th className="w-28 px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {DISPUTES.map((d) => (
                  <tr key={d.id} className="border-t border-ink-100">
                    <td className="px-4 py-3 font-medium">{d.id}</td>
                    <td className="px-4 py-3 text-ink-700">{d.date}</td>
                    <td className="px-4 py-3 text-right font-semibold">${d.amount}</td>
                    <td className="px-4 py-3 text-ink-700">{d.reason}</td>
                    <td className="px-4 py-3 text-rose-600 font-semibold">{d.due}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="h-8 px-3 rounded bg-brand text-white text-[12px] font-semibold">Respond</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {tab === "documents" && (
          <Card>
            <div className="p-5 space-y-2 text-[14px]">
              <DocRow label="W-9 (filed 2026-01-12)" />
              <DocRow label="Stripe terms — accepted 2024-08-04" />
              <DocRow label="PCI compliance attestation — Q1 2026" />
            </div>
          </Card>
        )}
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-ink-100 last:border-b-0">
      <span className="text-ink-500">{label}</span>
      <span className="font-medium text-ink-900">{value}</span>
    </div>
  );
}
function DocRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-ink-100 last:border-b-0">
      <span>{label}</span>
      <button className="h-7 px-2 rounded border border-ink-300 text-[12px] text-ink-700 hover:bg-ink-50">Download</button>
    </div>
  );
}
