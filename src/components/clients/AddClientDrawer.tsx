"use client";

import { useState } from "react";
import { Drawer } from "../Drawer";
import { CustomSelect } from "../CustomSelect";
import type { Client } from "../../lib/data";

export function AddClientDrawer({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (c: Omit<Client, "id" | "avatarHue">) => void;
}) {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [emailOptIn, setEmailOptIn] = useState(true);
  const [textOptIn, setTextOptIn] = useState(true);
  const [source, setSource] = useState("Walk-in");
  const [bmonth, setBmonth] = useState("");

  const reset = () => {
    setFirst(""); setLast(""); setPhone(""); setEmail("");
    setEmailOptIn(true); setTextOptIn(true);
    setSource("Walk-in"); setBmonth("");
  };

  return (
    <Drawer
      open={open}
      onClose={() => { reset(); onClose(); }}
      title="Add Client"
      width="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => { reset(); onClose(); }}
            className="h-9 px-3 rounded border border-ink-300 text-ink-700 text-[14px] hover:bg-ink-50"
          >
            Cancel
          </button>
          <button
            disabled={!first.trim() || !last.trim()}
            onClick={() => {
              onCreate({
                firstName: first.trim(),
                lastName: last.trim(),
                phone: phone.trim(),
                email: email.trim(),
                emailOptIn, textOptIn,
                visits: 0, totalSpend: 0,
                referralSource: source as Client["referralSource"],
                birthdayMonth: bmonth ? Number(bmonth) : undefined,
              });
              reset(); onClose();
            }}
            className="h-9 px-4 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700 disabled:opacity-50"
          >
            Add client
          </button>
        </div>
      }
    >
      <div className="p-5 space-y-3 text-[14px]">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name">
            <input value={first} onChange={(e) => setFirst(e.target.value)} className="w-full h-9 px-2 rounded border border-ink-300 bg-white outline-none focus:border-brand" />
          </Field>
          <Field label="Last name">
            <input value={last} onChange={(e) => setLast(e.target.value)} className="w-full h-9 px-2 rounded border border-ink-300 bg-white outline-none focus:border-brand" />
          </Field>
        </div>
        <Field label="Phone">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-9 px-2 rounded border border-ink-300 bg-white outline-none focus:border-brand" placeholder="(555) 555-5555" />
        </Field>
        <Field label="Email">
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-9 px-2 rounded border border-ink-300 bg-white outline-none focus:border-brand" placeholder="name@email.com" />
        </Field>

        <div className="pt-2 space-y-2">
          <Check label="Email marketing opt-in" value={emailOptIn} onChange={setEmailOptIn} />
          <Check label="Text marketing opt-in" value={textOptIn} onChange={setTextOptIn} />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Field label="Referral source">
            <CustomSelect
              value={source}
              onChange={setSource}
              options={["Walk-in", "Google", "Instagram", "Referral", "Yelp"].map((v) => ({ value: v, label: v }))}
            />
          </Field>
          <Field label="Birthday month">
            <CustomSelect
              value={bmonth}
              onChange={setBmonth}
              placeholder="Select…"
              options={["", "1","2","3","4","5","6","7","8","9","10","11","12"].map((v) => ({
                value: v,
                label: v === "" ? "—" : new Date(2000, Number(v) - 1, 1).toLocaleString("en", { month: "long" }),
              }))}
            />
          </Field>
        </div>
      </div>
    </Drawer>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-wide text-ink-500 mb-1 font-bold">{label}</span>
      {children}
    </label>
  );
}
function Check({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[color:var(--brand)]" />
      <span className="text-[14px] text-ink-700">{label}</span>
    </label>
  );
}
