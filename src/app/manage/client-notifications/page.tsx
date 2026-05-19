"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { PageHeader, SubTabs, Card, MarketingPill } from "../../../components/manage/ManageShell";
import { APPT_NOTIFICATIONS } from "../../../lib/manage";

type Tab = "appointments" | "auto" | "instructions";

export default function ClientNotificationsPage() {
  const [tab, setTab] = useState<Tab>("appointments");
  const [rows, setRows] = useState(APPT_NOTIFICATIONS);

  return (
    <>
      <PageHeader title="Client Notifications" />
      <SubTabs<Tab>
        tabs={[
          { id: "appointments", label: "Appointments" },
          { id: "auto", label: "Auto-responses" },
          { id: "instructions", label: "Client instructions" },
        ]}
        value={tab}
        onChange={setTab}
        rightLink={
          <a className="text-[12px] text-brand underline cursor-pointer pb-3">View usage</a>
        }
      />
      <div className="p-6">
        {tab === "appointments" && (
          <Card>
            {rows.map((n, i) => (
              <div
                key={n.id}
                className={"flex items-center gap-4 px-5 py-4 " + (i !== rows.length - 1 ? "border-b border-ink-100" : "")}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-ink-900">{n.label}</div>
                  <div className="text-[12px] text-ink-500 mt-0.5">{n.description}</div>
                </div>
                <div className="flex items-center gap-2">
                  <MarketingPill
                    label="Email"
                    active={n.email}
                    onToggle={() =>
                      setRows((p) => p.map((x) => x.id === n.id ? { ...x, email: !x.email } : x))
                    }
                  />
                  <MarketingPill
                    label="Text"
                    active={n.text}
                    onToggle={() =>
                      setRows((p) => p.map((x) => x.id === n.id ? { ...x, text: !x.text } : x))
                    }
                  />
                </div>
                <button className="h-8 w-8 rounded hover:bg-ink-100 text-ink-500 flex items-center justify-center">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </Card>
        )}

        {tab === "auto" && (
          <Card>
            <div className="p-5">
              <div className="text-[14px] font-semibold text-ink-900">Out-of-hours auto-reply</div>
              <div className="text-[12px] text-ink-500 mt-1">Sent when a client messages after business hours.</div>
              <textarea
                rows={3}
                defaultValue="Thanks for reaching out! We&apos;re closed for the day — we'll respond first thing tomorrow."
                className="mt-3 w-full p-3 rounded border border-ink-300 bg-white text-[14px] outline-none focus:border-brand"
              />
            </div>
          </Card>
        )}

        {tab === "instructions" && (
          <Card>
            <div className="p-5">
              <div className="text-[14px] font-semibold text-ink-900">Booking confirmation instructions</div>
              <div className="text-[12px] text-ink-500 mt-1">Appended to every booking confirmation message.</div>
              <textarea
                rows={4}
                defaultValue="Please arrive with hair freshly washed and detangled. Bring a charged phone for the long appointments — we have outlets at every chair."
                className="mt-3 w-full p-3 rounded border border-ink-300 bg-white text-[14px] outline-none focus:border-brand"
              />
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
