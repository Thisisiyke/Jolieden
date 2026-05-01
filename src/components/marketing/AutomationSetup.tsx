"use client";

import { useState } from "react";
import { Drawer } from "../Drawer";
import { CustomSelect } from "../CustomSelect";
import { BLAST_AUDIENCES } from "../../lib/marketing";

export function AutomationSetup({
  open,
  name,
  description,
  onClose,
  onEnable,
}: {
  open: boolean;
  name: string;
  description: string;
  onClose: () => void;
  onEnable: (cfg: { channel: string; audience: string; copy: string }) => void;
}) {
  const [channel, setChannel] = useState("email");
  const [audience, setAudience] = useState(BLAST_AUDIENCES[3]);
  const [copy, setCopy] = useState("Hi {{first_name}} — book your next visit and save 10%.");

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={`Set up · ${name}`}
      width="max-w-md"
      footer={
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="h-9 px-3 rounded border border-ink-300 text-ink-700 text-[13px] hover:bg-ink-50">
            Cancel
          </button>
          <button
            onClick={() => onEnable({ channel, audience, copy })}
            className="h-9 px-4 rounded bg-brand text-white text-[13px] font-semibold hover:bg-brand-700"
          >
            Enable automation
          </button>
        </div>
      }
    >
      <div className="p-5 space-y-4 text-[13px]">
        <div className="text-ink-500">{description}</div>

        <Field label="Channel">
          <CustomSelect
            value={channel}
            onChange={setChannel}
            options={[
              { value: "email", label: "Email only" },
              { value: "text", label: "Text only" },
              { value: "both", label: "Email and text" },
            ]}
          />
        </Field>

        <Field label="Audience">
          <CustomSelect
            value={audience}
            onChange={setAudience}
            options={BLAST_AUDIENCES.map((a) => ({ value: a, label: a }))}
          />
        </Field>

        <Field label="Message copy">
          <textarea
            value={copy}
            onChange={(e) => setCopy(e.target.value)}
            rows={5}
            className="w-full p-2 rounded border border-ink-300 bg-white text-[13px] outline-none focus:border-brand resize-none"
          />
        </Field>

        <div className="rounded-lg border border-ink-200 bg-ink-50 p-3 text-[12px] text-ink-700">
          The automation will run continuously. You can pause or edit settings any time from the actions menu.
        </div>
      </div>
    </Drawer>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase font-bold tracking-wide text-ink-500 mb-1">{label}</span>
      {children}
    </label>
  );
}
