"use client";

import { useState } from "react";
import { X, Filter, Plus } from "lucide-react";
import { CustomSelect } from "../CustomSelect";

export type FilterRule = {
  id: string;
  field: FilterField;
  op: string;
  value: string;
};
export type FilterField =
  | "visits"
  | "lastVisit"
  | "totalSpend"
  | "tag"
  | "referral"
  | "birthday"
  | "emailOptIn"
  | "textOptIn"
  | "membership";

const FIELD_OPTIONS: { value: FilterField; label: string; ops: string[]; valueOpts?: { value: string; label: string }[] }[] = [
  { value: "visits", label: "Visit count", ops: [">=", "<=", "="] },
  { value: "lastVisit", label: "Last visit (days ago)", ops: [">=", "<=", "="] },
  { value: "totalSpend", label: "Total spend ($)", ops: [">=", "<=", "="] },
  {
    value: "tag",
    label: "Tag",
    ops: ["is", "is not"],
    valueOpts: ["VIP", "New", "Repeat"].map((v) => ({ value: v, label: v })),
  },
  {
    value: "referral",
    label: "Referral source",
    ops: ["is"],
    valueOpts: ["Google", "Instagram", "Referral", "Walk-in", "Yelp"].map((v) => ({ value: v, label: v })),
  },
  {
    value: "birthday",
    label: "Birthday month",
    ops: ["is"],
    valueOpts: Array.from({ length: 12 }, (_, i) => ({
      value: String(i + 1),
      label: new Date(2000, i, 1).toLocaleString("en", { month: "long" }),
    })),
  },
  { value: "emailOptIn", label: "Email opt-in", ops: ["is"], valueOpts: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }] },
  { value: "textOptIn", label: "Text opt-in", ops: ["is"], valueOpts: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }] },
  {
    value: "membership",
    label: "Membership",
    ops: ["is"],
    valueOpts: ["None", "Silver", "Gold", "Platinum"].map((v) => ({ value: v, label: v })),
  },
];

export function FilterBuilder({
  rules,
  onChange,
  anchorOpen,
  onToggleOpen,
}: {
  rules: FilterRule[];
  onChange: (r: FilterRule[]) => void;
  anchorOpen: boolean;
  onToggleOpen: (open: boolean) => void;
}) {
  const [draft, setDraft] = useState<FilterRule>({
    id: "draft",
    field: "visits",
    op: ">=",
    value: "",
  });

  const fieldMeta = FIELD_OPTIONS.find((f) => f.value === draft.field)!;

  return (
    <div className="relative">
      <button
        onClick={() => onToggleOpen(!anchorOpen)}
        className="h-9 px-3 rounded border border-ink-300 bg-white text-[13px] font-medium text-ink-700 hover:bg-ink-50 inline-flex items-center gap-2"
      >
        <Filter className="h-3.5 w-3.5" />
        Add filter
        {rules.length > 0 && (
          <span className="ml-1 rounded-full bg-brand text-white text-[10px] px-1.5 py-0.5 font-semibold">
            {rules.length}
          </span>
        )}
      </button>

      {anchorOpen && (
        <div
          className="absolute left-0 top-full mt-1 z-40 w-[480px] bg-white rounded-lg border border-ink-200 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 space-y-3">
            <div className="text-[12px] text-ink-500 uppercase tracking-wide font-semibold">
              Add a rule
            </div>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-5">
                <CustomSelect
                  value={draft.field}
                  onChange={(v) => {
                    const meta = FIELD_OPTIONS.find((f) => f.value === (v as FilterField))!;
                    setDraft({ id: "draft", field: v as FilterField, op: meta.ops[0], value: "" });
                  }}
                  options={FIELD_OPTIONS.map((f) => ({ value: f.value, label: f.label }))}
                />
              </div>
              <div className="col-span-3">
                <CustomSelect
                  value={draft.op}
                  onChange={(v) => setDraft({ ...draft, op: v })}
                  options={fieldMeta.ops.map((o) => ({ value: o, label: o }))}
                />
              </div>
              <div className="col-span-4">
                {fieldMeta.valueOpts ? (
                  <CustomSelect
                    value={draft.value}
                    onChange={(v) => setDraft({ ...draft, value: v })}
                    placeholder="Select value"
                    options={fieldMeta.valueOpts}
                  />
                ) : (
                  <input
                    value={draft.value}
                    onChange={(e) => setDraft({ ...draft, value: e.target.value })}
                    placeholder="Value"
                    className="w-full h-9 px-2 rounded border border-ink-300 bg-white text-[13px] outline-none focus:border-brand"
                  />
                )}
              </div>
            </div>
            <button
              disabled={!draft.value}
              onClick={() => {
                onChange([...rules, { ...draft, id: `r${Date.now()}` }]);
                setDraft({ id: "draft", field: "visits", op: ">=", value: "" });
              }}
              className="h-9 px-3 rounded bg-brand text-white text-[13px] font-semibold hover:bg-brand-700 disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Add rule
            </button>
          </div>

          {rules.length > 0 && (
            <div className="border-t border-ink-200 p-4 space-y-2">
              <div className="text-[11px] text-ink-500 uppercase tracking-wide font-semibold">
                Active rules · combined with AND
              </div>
              {rules.map((r) => {
                const f = FIELD_OPTIONS.find((x) => x.value === r.field)!;
                const vLabel = f.valueOpts?.find((o) => o.value === r.value)?.label ?? r.value;
                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded border border-ink-200 bg-ink-50 px-3 py-2"
                  >
                    <span className="text-[12px] text-ink-700">
                      <span className="font-semibold text-ink-900">{f.label}</span> {r.op} <span className="font-semibold text-ink-900">{vLabel}</span>
                    </span>
                    <button
                      onClick={() =>
                        onChange(rules.filter((x) => x.id !== r.id))
                      }
                      className="h-6 w-6 rounded hover:bg-ink-200 flex items-center justify-center text-ink-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function applyFilters(
  rules: FilterRule[],
  clients: { visits: number; lastVisit?: string; totalSpend: number; tags?: string[]; referralSource?: string; birthdayMonth?: number; emailOptIn: boolean; textOptIn: boolean; membership?: string }[],
  daysSince: (iso?: string) => number,
) {
  return clients.filter((c) =>
    rules.every((r) => {
      switch (r.field) {
        case "visits": {
          const n = Number(r.value);
          return r.op === ">=" ? c.visits >= n : r.op === "<=" ? c.visits <= n : c.visits === n;
        }
        case "lastVisit": {
          const n = Number(r.value);
          const d = daysSince(c.lastVisit);
          return r.op === ">=" ? d >= n : r.op === "<=" ? d <= n : d === n;
        }
        case "totalSpend": {
          const n = Number(r.value);
          return r.op === ">=" ? c.totalSpend >= n : r.op === "<=" ? c.totalSpend <= n : c.totalSpend === n;
        }
        case "tag":
          return r.op === "is" ? (c.tags ?? []).includes(r.value) : !(c.tags ?? []).includes(r.value);
        case "referral":
          return c.referralSource === r.value;
        case "birthday":
          return c.birthdayMonth === Number(r.value);
        case "emailOptIn":
          return (r.value === "yes") === c.emailOptIn;
        case "textOptIn":
          return (r.value === "yes") === c.textOptIn;
        case "membership":
          return (c.membership ?? "None") === r.value;
      }
      return true;
    }),
  );
}
