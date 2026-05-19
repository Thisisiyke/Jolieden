"use client";

import Image from "next/image";
import { Upload } from "lucide-react";
import { PageHeader, Card } from "../../../components/manage/ManageShell";

export default function DetailsPage() {
  return (
    <>
      <PageHeader title="Details" actions={
        <button className="h-9 px-4 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700">
          Save changes
        </button>
      } />
      <div className="p-6 space-y-4 max-w-3xl">
        <Card>
          <div className="p-5 grid grid-cols-2 gap-4">
            <Field label="Business name">
              <input defaultValue="Jolieden's Beauty Bar" className="input" />
            </Field>
            <Field label="Location name">
              <input defaultValue="Frederick Douglass" className="input" />
            </Field>
            <Field label="External ID">
              <input defaultValue="JBB-FD-001" className="input" />
            </Field>
            <Field label="Time zone">
              <input defaultValue="America/New_York (UTC-5)" className="input" />
            </Field>
            <Field label="Contact email">
              <input defaultValue="hello@jolieden.com" className="input" />
            </Field>
            <Field label="Phone">
              <input defaultValue="(347) 555-0100" className="input" />
            </Field>
            <Field label="Website">
              <input defaultValue="https://jolieden.com" className="input" />
            </Field>
          </div>
        </Card>

        <Card>
          <div className="p-5">
            <div className="text-[12px] uppercase font-bold text-ink-500 tracking-wide">Address</div>
            <div className="mt-2 grid grid-cols-6 gap-3">
              <div className="col-span-6">
                <input defaultValue="1812 Frederick Douglass Blvd" className="input" />
              </div>
              <div className="col-span-3"><input defaultValue="New York" className="input" /></div>
              <div className="col-span-1"><input defaultValue="NY" className="input" /></div>
              <div className="col-span-2"><input defaultValue="10026" className="input" /></div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-5 flex items-center gap-4">
            <div className="h-20 w-20 rounded-lg bg-brand flex items-center justify-center overflow-hidden">
              <Image src="/logo-white.png" alt="Logo" width={200} height={100} className="h-12 w-auto object-contain" />
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-semibold text-ink-900">Location logo</div>
              <div className="text-[12px] text-ink-500 mt-0.5">Shown on the booking page, receipts, and client emails.</div>
            </div>
            <button className="h-9 px-3 rounded border border-ink-300 text-[14px] font-medium text-ink-700 hover:bg-ink-50 inline-flex items-center gap-2">
              <Upload className="h-4 w-4" /> Upload
            </button>
          </div>
        </Card>
      </div>
      <style jsx>{`
        .input {
          width: 100%;
          height: 36px;
          padding: 0 10px;
          border-radius: 6px;
          border: 1px solid var(--ink-300);
          background: white;
          font-size: 13px;
          outline: none;
        }
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
