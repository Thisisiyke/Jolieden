"use client";

import { useState } from "react";
import { SettingsTabs } from "../../../components/profile/SettingsTabs";
import { PageHeader, Card, ToggleRow } from "../../../components/manage/ManageShell";
import { NOTIF_EVENTS, type NotifEvent } from "../../../lib/profile";

type Channel = "text" | "email" | "push";
type Prefs = Record<NotifEvent, Record<Channel, boolean>>;

const DEFAULT_PREFS: Prefs = {
  "new-online-booking":      { text: true,  email: true,  push: true },
  "new-front-desk-booking":  { text: false, email: true,  push: true },
  "client-arrival":          { text: false, email: false, push: true },
  "client-cancellation":     { text: true,  email: true,  push: true },
  "service-order-completed": { text: false, email: false, push: true },
};

export default function NotificationsPrefsPage() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);

  const toggle = (id: NotifEvent, channel: Channel) => {
    setPrefs((prev) => ({
      ...prev,
      [id]: { ...prev[id], [channel]: !prev[id][channel] },
    }));
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-ink-50">
      <PageHeader title="My Settings" />
      <SettingsTabs active="notifications" />
      <div className="flex-1 overflow-y-auto p-6 max-w-3xl">
        <Card>
          <div className="p-5 space-y-2">
            <div className="text-[14px] font-semibold text-ink-900">Communication Preferences</div>
            <div className="text-[12px] text-ink-500">Choose how you'd like to be notified about each event.</div>
          </div>
          <table className="w-full text-[14px]">
            <thead className="bg-ink-50 text-[10px] uppercase font-bold text-ink-500 tracking-wide border-t border-ink-200">
              <tr>
                <th className="text-left px-5 py-2.5">Event</th>
                <th className="text-center px-5 py-2.5 w-32">Text Message</th>
                <th className="text-center px-5 py-2.5 w-32">Email</th>
                <th className="text-center px-5 py-2.5 w-32">Push Notification</th>
              </tr>
            </thead>
            <tbody>
              {NOTIF_EVENTS.map((ev) => (
                <tr key={ev.id} className="border-t border-ink-100">
                  <td className="px-5 py-3 font-medium text-ink-900">{ev.label}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-center">
                      {ev.pushOnly ? <span className="text-[11px] text-ink-400">—</span> : (
                        <ToggleRow checked={prefs[ev.id].text} onChange={() => toggle(ev.id, "text")} />
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-center">
                      {ev.pushOnly ? <span className="text-[11px] text-ink-400">—</span> : (
                        <ToggleRow checked={prefs[ev.id].email} onChange={() => toggle(ev.id, "email")} />
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-center">
                      <ToggleRow checked={prefs[ev.id].push} onChange={() => toggle(ev.id, "push")} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
