"use client";

import { useState } from "react";
import { PageHeader, Card, ToggleRow } from "../../../components/manage/ManageShell";
import { CustomSelect } from "../../../components/CustomSelect";

export default function OwnerSecurityPage() {
  const [twofa, setTwofa] = useState(false);
  const [dashboard, setDashboard] = useState("7d");
  const [mobile, setMobile] = useState("30d");
  return (
    <>
      <PageHeader title="Security" />
      <div className="p-6 max-w-2xl space-y-4">
        <Card>
          <div className="p-5 flex items-center justify-between">
            <div>
              <div className="text-[14px] font-semibold text-ink-900">Require 2FA for all employees</div>
              <div className="text-[12px] text-ink-500 mt-1 max-w-md">Forces every staff account to set up two-step verification at next sign-in.</div>
            </div>
            <ToggleRow checked={twofa} onChange={setTwofa} />
          </div>
        </Card>
        <Card>
          <div className="p-5 space-y-4">
            <div className="text-[14px] font-semibold text-ink-900">Session expiration</div>
            <Field label="Dashboard inactivity timeout">
              <CustomSelect value={dashboard} onChange={setDashboard} options={[
                { value: "1h", label: "1 hour" },
                { value: "4h", label: "4 hours" },
                { value: "1d", label: "1 day" },
                { value: "7d", label: "7 days" },
              ]} />
            </Field>
            <Field label="Mobile app inactivity timeout">
              <CustomSelect value={mobile} onChange={setMobile} options={[
                { value: "1d", label: "1 day" },
                { value: "7d", label: "7 days" },
                { value: "30d", label: "30 days" },
                { value: "never", label: "Never" },
              ]} />
            </Field>
          </div>
        </Card>
      </div>
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
