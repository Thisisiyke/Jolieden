"use client";

import { Plus } from "lucide-react";
import { PageHeader, EmptyState } from "../../../components/manage/ManageShell";

export default function Page() {
  return (
    <>
      <PageHeader title="Resource Categories" />
      <EmptyState
        icon="🪑"
        title="No resource categories yet"
        message="Categories let you group resources (rooms, chairs, color stations) so they can be reused across services and locations."
        cta={
          <button className="h-9 px-4 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700 inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Create category
          </button>
        }
      />
    </>
  );
}
