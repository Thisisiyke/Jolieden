"use client";

import { useState } from "react";
import { Download, Filter, Settings, Star } from "lucide-react";
import { PageHeader } from "../../../components/manage/ManageShell";
import { Avatar } from "../../../components/Avatar";
import { RATINGS, type Rating } from "../../../lib/manage";

export default function RatingsPage() {
  const [rows, setRows] = useState<Rating[]>(RATINGS);
  const [replying, setReplying] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const avg = rows.reduce((s, r) => s + r.stars, 0) / rows.length;

  return (
    <>
      <PageHeader title="Ratings" actions={
        <>
          <button className="h-9 px-3 rounded border border-ink-300 text-[14px] font-medium text-ink-700 hover:bg-ink-50 inline-flex items-center gap-2">
            <Download className="h-4 w-4" /> Export
          </button>
          <button className="h-9 px-3 rounded border border-ink-300 text-[14px] font-medium text-ink-700 hover:bg-ink-50 inline-flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filters
          </button>
          <button className="h-9 w-9 rounded border border-ink-300 hover:bg-ink-50 flex items-center justify-center text-ink-700">
            <Settings className="h-4 w-4" />
          </button>
        </>
      } />
      <div className="p-6 space-y-4">
        <div className="rounded-lg border border-ink-200 bg-white p-5 flex items-center gap-6">
          <div>
            <div className="text-[40px] font-bold text-ink-900 leading-none">{avg.toFixed(1)}</div>
            <div className="mt-1 flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className={"h-4 w-4 " + (i <= Math.round(avg) ? "text-amber-400 fill-amber-400" : "text-ink-200")} />
              ))}
            </div>
            <div className="text-[11px] text-ink-500 mt-1">{rows.length} reviews</div>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((s) => {
              const n = rows.filter((r) => r.stars === s).length;
              const pct = (n / rows.length) * 100;
              return (
                <div key={s} className="flex items-center gap-2 text-[11px] text-ink-500">
                  <span className="w-4">{s}★</span>
                  <div className="flex-1 h-1.5 bg-ink-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right">{n}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {rows.map((r) => (
            <div key={r.id} className="rounded-lg border border-ink-200 bg-white p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Avatar name={r.client} />
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-ink-900">{r.client}</div>
                  <div className="text-[11px] text-ink-500">{r.date} · {r.service}</div>
                </div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className={"h-3.5 w-3.5 " + (i <= r.stars ? "text-amber-400 fill-amber-400" : "text-ink-200")} />
                  ))}
                </div>
              </div>
              <div className="text-[14px] text-ink-700 leading-relaxed">{r.comment}</div>
              {r.replied ? (
                <div className="text-[11px] font-semibold text-emerald-700">✓ Replied</div>
              ) : replying === r.id ? (
                <div className="space-y-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Write a reply…"
                    rows={2}
                    className="w-full p-2 rounded border border-ink-300 bg-white text-[14px] outline-none focus:border-brand"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setReplying(null); setDraft(""); }} className="h-8 px-3 rounded border border-ink-300 text-[12px] text-ink-700 hover:bg-ink-50">Cancel</button>
                    <button
                      disabled={!draft.trim()}
                      onClick={() => {
                        setRows((p) => p.map((x) => x.id === r.id ? { ...x, replied: true } : x));
                        setReplying(null); setDraft("");
                      }}
                      className="h-8 px-3 rounded bg-brand text-white text-[12px] font-semibold hover:bg-brand-700 disabled:opacity-50"
                    >Send reply</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setReplying(r.id)} className="text-[12px] font-semibold text-brand hover:underline">Reply</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
