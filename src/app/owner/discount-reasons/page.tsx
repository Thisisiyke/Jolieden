"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader, Card } from "../../../components/manage/ManageShell";
import { DISCOUNT_REASONS } from "../../../lib/owner";

export default function DiscountReasonsPage() {
  const [rows, setRows] = useState(DISCOUNT_REASONS);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  return (
    <>
      <PageHeader title="Discount Reasons" actions={
        <button onClick={() => setAdding(true)} className="h-9 px-3 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700 inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> Create discount reason
        </button>
      } />
      <div className="p-6 max-w-2xl">
        <Card>
          {rows.map((r, i) => (
            <div key={r.id} className={"flex items-center justify-between px-5 py-3 " + (i !== rows.length - 1 ? "border-b border-ink-100" : "")}>
              <span className="text-[14px] font-medium text-ink-900">{r.reason}</span>
              <button onClick={() => setRows((p) => p.filter((x) => x.id !== r.id))} className="text-ink-500 hover:text-rose-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {adding && (
            <div className="p-4 border-t border-ink-100 flex items-center gap-2">
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="New discount reason"
                className="flex-1 h-9 px-2 rounded border border-ink-300 bg-white text-[14px] outline-none focus:border-brand"
              />
              <button
                disabled={!draft.trim()}
                onClick={() => { setRows((p) => [...p, { id: `dr${Date.now()}`, reason: draft.trim() }]); setDraft(""); setAdding(false); }}
                className="h-9 px-3 rounded bg-brand text-white text-[14px] font-semibold disabled:opacity-50"
              >
                Add
              </button>
              <button onClick={() => { setAdding(false); setDraft(""); }} className="h-9 px-3 rounded border border-ink-300 text-[14px]">Cancel</button>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
