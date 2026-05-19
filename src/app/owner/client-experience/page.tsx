"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { PageHeader, Card, ToggleRow } from "../../../components/manage/ManageShell";
import { CustomSelect } from "../../../components/CustomSelect";

export default function ClientExperiencePage() {
  const [sharedProfiles, setSharedProfiles] = useState(true);
  const [showHours, setShowHours] = useState(true);
  const [conversion, setConversion] = useState("appointment-booked");
  return (
    <>
      <PageHeader title="Client Experience" />
      <div className="p-6 space-y-4 max-w-3xl">
        <Card>
          <div className="p-5 space-y-3">
            <div className="text-[14px] font-semibold text-ink-900">Self-booking overlay</div>
            <div className="text-[12px] text-ink-500">A booking banner you can embed on your website.</div>
            <div className="rounded-lg bg-gradient-to-r from-brand/90 to-brand h-28 flex items-center justify-center text-white font-semibold">
              Book your next visit →
            </div>
            <button className="h-9 px-3 rounded border border-ink-300 text-[14px] text-ink-700 hover:bg-ink-50 inline-flex items-center gap-2">
              <Copy className="h-4 w-4" /> View code embed snippet
            </button>
          </div>
        </Card>

        <Card>
          <div className="p-5 flex items-center justify-between">
            <div>
              <div className="text-[14px] font-semibold text-ink-900">Email theme</div>
              <div className="text-[12px] text-ink-500 mt-0.5">Colors and logo for all client-facing emails.</div>
            </div>
            <button className="h-9 px-3 rounded border border-ink-300 text-[14px] text-ink-700 hover:bg-ink-50">Customize</button>
          </div>
        </Card>

        <Card>
          <div className="p-5 space-y-3">
            <div className="text-[14px] font-semibold text-ink-900">Google Analytics — Measurement Protocol</div>
            <Field label="Measurement ID"><input defaultValue="G-XXXXXXXXXX" className="input" /></Field>
            <Field label="API secret"><input defaultValue="" type="password" className="input" /></Field>
            <Field label="Conversion event">
              <CustomSelect
                value={conversion}
                onChange={setConversion}
                options={[
                  { value: "appointment-booked", label: "Appointment booked" },
                  { value: "checkout-completed", label: "Checkout completed" },
                  { value: "new-client-created", label: "New client created" },
                ]}
              />
            </Field>
          </div>
        </Card>

        <Card>
          <div className="p-5 space-y-3">
            <div className="text-[14px] font-semibold text-ink-900">Facebook Conversions API</div>
            <Field label="Pixel ID"><input defaultValue="" className="input" /></Field>
            <Field label="Access token"><input defaultValue="" type="password" className="input" /></Field>
          </div>
        </Card>

        <Card>
          <div className="p-5 space-y-3">
            <div className="text-[14px] font-semibold text-ink-900">Client portal</div>
            <Field label="Client login link">
              <div className="flex items-center gap-2">
                <input readOnly defaultValue="https://app.jolieden.com/clients" className="input flex-1" />
                <button className="h-9 w-9 rounded border border-ink-300 hover:bg-ink-50 flex items-center justify-center text-ink-500"><Copy className="h-4 w-4" /></button>
              </div>
            </Field>
            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-[14px] font-medium text-ink-900">Shared profiles</div>
                <div className="text-[11px] text-ink-500">Let households share a single client record.</div>
              </div>
              <ToggleRow checked={sharedProfiles} onChange={setSharedProfiles} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-5 flex items-center justify-between">
            <div>
              <div className="text-[14px] font-semibold text-ink-900">Show location hours on booking page</div>
              <div className="text-[12px] text-ink-500 mt-0.5">When off, clients only see availability without weekly hours.</div>
            </div>
            <ToggleRow checked={showHours} onChange={setShowHours} />
          </div>
        </Card>
      </div>
      <style jsx global>{`
        .input { width: 100%; height: 36px; padding: 0 10px; border-radius: 6px; border: 1px solid var(--ink-300); background: white; font-size: 13px; outline: none; }
        .input:focus { border-color: var(--brand); }
      `}</style>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-wide font-bold text-ink-500 mb-1">{label}</span>
      {children}
    </label>
  );
}
