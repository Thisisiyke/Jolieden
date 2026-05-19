"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader, Card } from "../../../components/manage/ManageShell";

export default function SecurityPage() {
  const [ips, setIps] = useState<{ ip: string; label: string }[]>([
    { ip: "172.16.18.21", label: "Salon Wi-Fi" },
    { ip: "98.124.55.10", label: "Office VPN" },
  ]);
  const [open, setOpen] = useState(false);
  const [draftIp, setDraftIp] = useState("");
  const [draftLabel, setDraftLabel] = useState("");

  return (
    <>
      <PageHeader title="Security" />
      <div className="p-6 max-w-2xl">
        <Card>
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[14px] font-semibold text-ink-900">Approved IP addresses</div>
                <div className="text-[12px] text-ink-500 mt-0.5">Staff can only sign in from these IPs. Leave empty to allow sign-in from anywhere.</div>
              </div>
              <button onClick={() => setOpen(true)} className="h-9 px-3 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700 inline-flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add IP address
              </button>
            </div>

            <div className="divide-y divide-ink-100">
              {ips.map((r) => (
                <div key={r.ip} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-[14px] font-mono text-ink-900">{r.ip}</div>
                    <div className="text-[11px] text-ink-500">{r.label}</div>
                  </div>
                  <button onClick={() => setIps((p) => p.filter((x) => x.ip !== r.ip))} className="text-ink-500 hover:text-rose-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {ips.length === 0 && (
                <div className="py-6 text-center text-[12px] text-ink-500">No IPs added — staff can sign in from anywhere.</div>
              )}
            </div>

            {open && (
              <div className="mt-4 p-3 rounded border border-dashed border-ink-300 space-y-2">
                <input
                  value={draftIp}
                  onChange={(e) => setDraftIp(e.target.value)}
                  placeholder="123.45.67.89"
                  className="w-full h-9 px-2 rounded border border-ink-300 bg-white text-[14px] font-mono outline-none focus:border-brand"
                />
                <input
                  value={draftLabel}
                  onChange={(e) => setDraftLabel(e.target.value)}
                  placeholder="Label (e.g., Salon Wi-Fi)"
                  className="w-full h-9 px-2 rounded border border-ink-300 bg-white text-[14px] outline-none focus:border-brand"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => { setOpen(false); setDraftIp(""); setDraftLabel(""); }} className="h-8 px-3 rounded border border-ink-300 text-[12px] text-ink-700 hover:bg-ink-50">Cancel</button>
                  <button
                    disabled={!draftIp.trim()}
                    onClick={() => { setIps((p) => [...p, { ip: draftIp.trim(), label: draftLabel.trim() || "—" }]); setOpen(false); setDraftIp(""); setDraftLabel(""); }}
                    className="h-8 px-3 rounded bg-brand text-white text-[12px] font-semibold hover:bg-brand-700 disabled:opacity-50"
                  >Add</button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
