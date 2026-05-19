"use client";

import { Filter } from "lucide-react";
import { PageHeader, Card } from "../../../components/manage/ManageShell";
import { MERCHANT_ACCOUNTS } from "../../../lib/owner";

export default function PaymentProcessingPage() {
  return (
    <>
      <PageHeader title="Payment Processing" />
      <div className="px-6 py-3 bg-white border-b border-ink-200">
        <button className="h-9 px-3 rounded border border-ink-300 text-[14px] font-medium text-ink-700 hover:bg-ink-50 inline-flex items-center gap-2">
          <Filter className="h-4 w-4" /> Add filter
        </button>
      </div>
      <div className="p-6">
        <Card>
          <table className="w-full text-[14px]">
            <thead className="bg-ink-50 text-[10px] uppercase font-bold text-ink-500 tracking-wide">
              <tr>
                <th className="text-left px-4 py-2.5">Account name</th>
                <th className="text-left px-4 py-2.5">Processing</th>
                <th className="text-left px-4 py-2.5">Disputes</th>
                <th className="text-left px-4 py-2.5">Account Status</th>
              </tr>
            </thead>
            <tbody>
              {MERCHANT_ACCOUNTS.map((m) => (
                <tr key={m.id} className="border-t border-ink-100 hover:bg-ink-50">
                  <td className="px-4 py-3 font-medium">{m.name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-700">{m.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2">
                      {m.disputes > 0 && (
                        <span className="rounded-full bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5">{m.disputes}</span>
                      )}
                      <a className="text-[12px] text-brand underline cursor-pointer">View dispute{m.disputes !== 1 ? "s" : ""}</a>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2">
                      <span className={"rounded-full px-2 py-0.5 text-[11px] font-semibold " + (m.accountStatus === "Approved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                        {m.accountStatus}
                      </span>
                      <a className="text-[12px] text-brand underline cursor-pointer">View account</a>
                    </span>
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
