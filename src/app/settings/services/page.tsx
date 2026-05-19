"use client";

import { useState } from "react";
import { SettingsTabs } from "../../../components/profile/SettingsTabs";
import { PageHeader, Card } from "../../../components/manage/ManageShell";
import { STAFF_SERVICE_OVERRIDES } from "../../../lib/profile";

export default function StaffServicesPage() {
  const [rows] = useState(STAFF_SERVICE_OVERRIDES);
  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-ink-50">
      <PageHeader title="My Settings" />
      <SettingsTabs active="services" />
      <div className="px-6 py-3 bg-white border-b border-ink-200 text-[12px] text-ink-500">
        Jolieden&apos;s Beauty Bar (Frederick Douglass)
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-[14px]">
              <thead className="bg-ink-50 text-[10px] uppercase font-bold text-ink-500 tracking-wide">
                <tr>
                  <th className="text-left px-4 py-2.5">Service</th>
                  <th className="text-right px-4 py-2.5">Price</th>
                  <th className="text-right px-4 py-2.5">Deposit</th>
                  <th className="text-right px-4 py-2.5">Duration</th>
                  <th className="text-right px-4 py-2.5">Processing</th>
                  <th className="text-right px-4 py-2.5">Finishing</th>
                  <th className="text-right px-4 py-2.5">Transition</th>
                  <th className="text-right px-4 py-2.5">Business charge</th>
                  <th className="text-right px-4 py-2.5">Commission %</th>
                  <th className="w-28 px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.name} className="border-t border-ink-100 hover:bg-ink-50">
                    <td className="px-4 py-3 font-medium text-ink-900">
                      {r.name}
                      {r.customized && (
                        <span className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold bg-brand-100 text-brand">CUSTOM</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">${r.price}</td>
                    <td className="px-4 py-3 text-right text-ink-700">${r.deposit}</td>
                    <td className="px-4 py-3 text-right text-ink-700">{r.duration}</td>
                    <td className="px-4 py-3 text-right text-ink-700">{r.processing}</td>
                    <td className="px-4 py-3 text-right text-ink-700">{r.finishing}</td>
                    <td className="px-4 py-3 text-right text-ink-700">{r.transition}</td>
                    <td className="px-4 py-3 text-right text-ink-700">${r.charge}</td>
                    <td className="px-4 py-3 text-right text-ink-700">{r.commission}%</td>
                    <td className="px-4 py-3 text-right">
                      <button className="h-8 px-3 rounded border border-ink-300 text-[12px] font-medium text-ink-700 hover:bg-ink-50">
                        Customize
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
