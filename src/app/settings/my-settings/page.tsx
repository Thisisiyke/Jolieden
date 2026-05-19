"use client";

import { useState } from "react";
import { Upload, Copy, Check } from "lucide-react";
import { SettingsTabs } from "../../../components/profile/SettingsTabs";
import { PageHeader, Card, ToggleRow } from "../../../components/manage/ManageShell";

export default function MySettingsPage() {
  const [twofa, setTwofa] = useState(false);
  const [showTitles, setShowTitles] = useState(true);
  const [copied, setCopied] = useState(false);
  const ical = "https://app.boulevard.io/cal/jbb/fd/private-XYZ123.ics";

  const copy = () => {
    navigator.clipboard?.writeText(ical);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-ink-50">
      <PageHeader title="My Settings" />
      <SettingsTabs active="my-settings" />
      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-3xl">
        {/* Profile */}
        <Card>
          <div className="p-5 space-y-4">
            <div className="text-[14px] font-semibold text-ink-900">Profile</div>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-brand text-white flex items-center justify-center text-[20px] font-bold">FD</div>
              <button className="h-9 px-3 rounded border border-ink-300 text-[14px] font-medium text-ink-700 hover:bg-ink-50 inline-flex items-center gap-2">
                <Upload className="h-4 w-4" /> Upload profile picture
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name"><input defaultValue="Frederick" className="input" /></Field>
              <Field label="Last name"><input defaultValue="Douglass" className="input" /></Field>
            </div>
            <Field label="Alias name (client-facing)"><input defaultValue="Fred" className="input" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Pronouns"><input defaultValue="He/Him" className="input" /></Field>
              <Field label="Employee ID"><input defaultValue="EMP-001" className="input" /></Field>
            </div>
            <Field label="Email"><input defaultValue="fred@jolieden.com" className="input" /></Field>
            <Field label="Phone number"><input defaultValue="(917) 555-0100" className="input" /></Field>
            <div className="pt-2">
              <button className="h-10 px-4 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700">Save changes</button>
            </div>
          </div>
        </Card>

        {/* Password */}
        <Card>
          <div className="p-5 space-y-3">
            <div className="text-[14px] font-semibold text-ink-900">Password</div>
            <div className="text-[12px] text-ink-500">Mix upper- and lower-case letters with numbers. Avoid common phrases.</div>
            <Field label="Current password"><input type="password" className="input" /></Field>
            <Field label="New password"><input type="password" className="input" /></Field>
            <Field label="Confirm new password"><input type="password" className="input" /></Field>
            <div className="pt-1">
              <button className="h-10 px-4 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700">Update password</button>
            </div>
          </div>
        </Card>

        {/* Two-step verification */}
        <Card>
          <div className="p-5 flex items-center justify-between">
            <div>
              <div className="text-[14px] font-semibold text-ink-900">Two-step verification</div>
              <div className="text-[12px] text-ink-500 mt-0.5">Receive a 6-digit SMS code on top of your password at login.</div>
            </div>
            <ToggleRow checked={twofa} onChange={setTwofa} />
          </div>
        </Card>

        {/* Calendar integrations */}
        <Card>
          <div className="p-5 space-y-4">
            <div className="text-[14px] font-semibold text-ink-900">Calendar integrations</div>

            <Field label="Your Boulevard iCal URL (read-only)">
              <div className="flex items-center gap-2">
                <input readOnly value={ical} className="input flex-1 font-mono text-[12px]" />
                <button
                  onClick={copy}
                  className="h-9 px-3 rounded border border-ink-300 text-[12px] text-ink-700 hover:bg-ink-50 inline-flex items-center gap-1.5"
                >
                  {copied ? <><Check className="h-3.5 w-3.5 text-emerald-600" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                </button>
              </div>
            </Field>
            <div className="text-[11px] text-ink-500 -mt-2">
              Subscribe to this URL in Google Calendar or Apple Calendar to see your shifts and bookings externally.
            </div>

            <div className="border-t border-ink-100 pt-4 space-y-3">
              <div className="text-[14px] font-semibold text-ink-900">Import external calendars</div>
              <div className="text-[12px] text-ink-500">Outside events on imported calendars will block your Boulevard availability.</div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Calendar name"><input className="input" placeholder="Personal — Google" /></Field>
                <Field label="Calendar URL"><input className="input" placeholder="webcal://…" /></Field>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showTitles} onChange={(e) => setShowTitles(e.target.checked)} className="h-4 w-4 accent-[color:var(--brand)]" />
                <span className="text-[14px] text-ink-700">Show event titles on the calendar</span>
              </label>
              <button className="h-10 px-4 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700">Import calendar</button>
            </div>
          </div>
        </Card>
      </div>
      <style jsx global>{`
        .input { width: 100%; height: 36px; padding: 0 10px; border-radius: 6px; border: 1px solid var(--ink-300); background: white; font-size: 13px; outline: none; }
        .input:focus { border-color: var(--brand); }
      `}</style>
    </div>
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
