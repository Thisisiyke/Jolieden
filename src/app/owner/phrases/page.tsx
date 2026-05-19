"use client";

import { Plus, Sparkles, Filter } from "lucide-react";
import { PageHeader, EmptyState } from "../../../components/manage/ManageShell";

export default function PhrasesPage() {
  return (
    <>
      <PageHeader title="Phrases" actions={
        <>
          <button className="h-9 px-3 rounded border border-ink-300 text-[14px] font-medium text-ink-700 hover:bg-ink-50 inline-flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filter
          </button>
          <button className="h-9 px-3 rounded border border-ink-300 text-[14px] font-medium text-ink-700 hover:bg-ink-50">Actions ▾</button>
          <button className="h-9 px-3 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700 inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> New phrase
          </button>
        </>
      } />
      <EmptyState
        icon="💬"
        title="No saved phrases yet"
        message="Phrases are canned responses you can drop into Messages — booking confirmations, address details, after-care reminders. Seed with our starter set or write your own."
        cta={
          <button className="h-9 px-4 rounded border border-ink-300 text-[14px] font-semibold text-ink-700 hover:bg-ink-50 inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand" /> Use starter phrases
          </button>
        }
      />
    </>
  );
}
