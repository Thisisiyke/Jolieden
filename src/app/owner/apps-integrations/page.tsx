"use client";

import { useState } from "react";
import { PageHeader } from "../../../components/manage/ManageShell";
import { INTEGRATIONS } from "../../../lib/owner";

export default function AppsIntegrationsPage() {
  const [rows, setRows] = useState(INTEGRATIONS);
  return (
    <>
      <PageHeader title="Apps & Integrations" />
      <div className="p-6 grid grid-cols-2 gap-4">
        {rows.map((it) => (
          <div key={it.id} className="rounded-lg border border-ink-200 bg-white p-5 flex flex-col">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-lg bg-ink-100 flex items-center justify-center text-[26px] shrink-0">{it.logo}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-ink-900">{it.name}</div>
                <div className="text-[10px] uppercase tracking-wide font-bold text-ink-500 mt-0.5">{it.category}</div>
              </div>
              {it.installed && (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700">INSTALLED</span>
              )}
            </div>
            <div className="text-[12px] text-ink-700 mt-3 leading-relaxed flex-1">{it.description}</div>
            <div className="mt-4 flex items-center justify-between">
              <a className="text-[12px] text-brand underline cursor-pointer">Learn more</a>
              {it.installed ? (
                <button className="h-9 px-3 rounded border border-ink-300 text-[14px] font-medium text-ink-700 hover:bg-ink-50">Configure</button>
              ) : (
                <button
                  onClick={() => setRows((p) => p.map((x) => x.id === it.id ? { ...x, installed: true } : x))}
                  className="h-9 px-3 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700"
                >
                  Install
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
