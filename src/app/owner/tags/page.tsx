"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader, Card } from "../../../components/manage/ManageShell";
import { TAGS } from "../../../lib/owner";

const PAGE = 25;

export default function TagsPage() {
  const [rows] = useState(TAGS);
  const [page, setPage] = useState(0);
  const start = page * PAGE;
  const visible = rows.slice(start, start + PAGE);

  return (
    <>
      <PageHeader title="Tags" actions={
        <button className="h-9 px-3 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700 inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Tag
        </button>
      } />
      <div className="p-6">
        <Card>
          {visible.map((t, i) => (
            <TagRow key={t.id} t={t} isLast={i === visible.length - 1} />
          ))}
          <div className="border-t border-ink-200 px-4 py-2 flex items-center justify-between text-[12px] text-ink-500">
            <span>{rows.length} tags · {PAGE}/page</span>
            <div className="flex items-center gap-1">
              <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="h-7 w-7 rounded hover:bg-ink-100 disabled:opacity-40 flex items-center justify-center"><ChevronLeft className="h-4 w-4" /></button>
              <span>{page + 1} / {Math.max(1, Math.ceil(rows.length / PAGE))}</span>
              <button disabled={start + PAGE >= rows.length} onClick={() => setPage((p) => p + 1)} className="h-7 w-7 rounded hover:bg-ink-100 disabled:opacity-40 flex items-center justify-center"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

function TagRow({ t, isLast }: { t: typeof TAGS[number]; isLast: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  return (
    <div className={"flex items-center justify-between px-5 py-3 " + (!isLast ? "border-b border-ink-100" : "")}>
      <span className="inline-flex items-center gap-2 text-[14px] font-medium text-ink-900">
        <span className="text-[16px]">{t.emoji}</span>
        {t.name}
      </span>
      <div ref={ref} className="relative">
        <button onClick={() => setOpen((v) => !v)} className="h-8 w-8 rounded hover:bg-ink-100 flex items-center justify-center text-ink-500">
          <MoreHorizontal className="h-4 w-4" />
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-1 z-30 w-36 bg-white rounded-lg border border-ink-200 shadow-xl py-1">
            <button className="w-full text-left px-3 py-1.5 text-[14px] text-ink-900 hover:bg-ink-50">Edit</button>
            <button className="w-full text-left px-3 py-1.5 text-[14px] text-rose-600 hover:bg-rose-50">Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}
