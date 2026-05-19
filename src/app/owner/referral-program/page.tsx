"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { PageHeader, Card } from "../../../components/manage/ManageShell";

export default function ReferralProgramPage() {
  const [active, setActive] = useState(false);
  return (
    <>
      <PageHeader title="Referral Program" />
      <div className="p-6 space-y-4 max-w-2xl">
        <Card>
          <div className="p-5 flex items-center gap-4">
            <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-brand to-brand-500 flex items-center justify-center text-white text-[24px]">🎁</div>
            <div className="flex-1">
              <div className="text-[14px] font-semibold text-ink-900">Give $10, Get $10</div>
              <div className="text-[12px] text-ink-500 mt-0.5">Refer a friend — both of you save $10 on the next service.</div>
              <div className="mt-2">
                <span className={"rounded-full px-2 py-0.5 text-[10px] font-bold " + (active ? "bg-emerald-100 text-emerald-700" : "bg-ink-100 text-ink-500")}>
                  {active ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
            </div>
            <button
              onClick={() => setActive((v) => !v)}
              className="h-9 px-3 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700"
            >
              Manage
            </button>
          </div>
        </Card>

        <Card>
          <div className="p-5 space-y-3">
            <div className="text-[14px] font-semibold text-ink-900">Shareable referral link</div>
            <div className="flex items-center gap-2">
              <input readOnly value="https://jolieden.com/r/joliedensbeautybar" className="flex-1 h-9 px-2 rounded border border-ink-300 bg-ink-50 text-[14px]" />
              <button className="h-9 px-3 rounded border border-ink-300 text-[14px] text-ink-700 hover:bg-ink-50 inline-flex items-center gap-2">
                <Copy className="h-4 w-4" /> Copy link
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-5">
            <div className="text-[14px] font-semibold text-ink-900">Let your clients know</div>
            <div className="text-[12px] text-ink-500 mt-1 max-w-md">
              Add the referral link to your booking confirmations and post-visit emails so clients see it at the right moment.
            </div>
            <a className="text-[12px] text-brand underline mt-3 inline-block cursor-pointer">Learn more</a>
          </div>
        </Card>
      </div>
    </>
  );
}
