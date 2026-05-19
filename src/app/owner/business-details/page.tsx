"use client";

import { Upload, Copy } from "lucide-react";
import { PageHeader, Card } from "../../../components/manage/ManageShell";
import { CustomSelect } from "../../../components/CustomSelect";
import { useState } from "react";

export default function BusinessDetailsPage() {
  const [displayMode, setDisplayMode] = useState("first-last-initial");
  return (
    <>
      <PageHeader title="Business Details" actions={
        <button className="h-9 px-4 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700">Save changes</button>
      } />
      <div className="p-6 space-y-4 max-w-3xl">
        <Card>
          <div className="p-5 space-y-4">
            <div className="text-[14px] font-semibold text-ink-900">Business Info</div>
            <Field label="Business name">
              <input defaultValue="Jolieden's Beauty Bar" className="input" />
            </Field>
            <Field label="Business URL">
              <div className="flex items-center gap-2">
                <input defaultValue="blvd.me/joliedensbeautybar" className="input flex-1" />
                <button className="h-9 px-3 rounded border border-ink-300 text-[12px] text-ink-700 hover:bg-ink-50">Edit</button>
                <button className="h-9 w-9 rounded border border-ink-300 hover:bg-ink-50 flex items-center justify-center text-ink-500"><Copy className="h-4 w-4" /></button>
              </div>
            </Field>
            <Field label="HQ address">
              <input defaultValue="1812 Frederick Douglass Blvd, New York, NY 10026" className="input" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone"><input defaultValue="(347) 555-0100" className="input" /></Field>
              <Field label="Website"><input defaultValue="https://jolieden.com" className="input" /></Field>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <div className="h-16 w-16 rounded-lg bg-brand flex items-center justify-center text-white text-[11px] font-bold">LOGO</div>
              <button className="h-9 px-3 rounded border border-ink-300 text-[14px] font-medium text-ink-700 hover:bg-ink-50 inline-flex items-center gap-2">
                <Upload className="h-4 w-4" /> Upload business logo
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-5 space-y-3">
            <div className="text-[14px] font-semibold text-ink-900">Billing Contact</div>
            <Field label="Email for billing notices">
              <input defaultValue="accounts@jolieden.com" className="input" />
            </Field>
          </div>
        </Card>

        <Card>
          <div className="p-5 space-y-3">
            <div className="text-[14px] font-semibold text-ink-900">Employee Settings</div>
            <Field label="Staff Display Name">
              <CustomSelect
                value={displayMode}
                onChange={setDisplayMode}
                options={[
                  { value: "first-last", label: "First and Last" },
                  { value: "first-last-initial", label: "First and Last Initial" },
                  { value: "first-only", label: "First name only" },
                  { value: "nickname", label: "Nickname only" },
                ]}
              />
            </Field>
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
