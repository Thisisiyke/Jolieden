"use client";

import { Plus } from "lucide-react";
import { PageHeader, EmptyState } from "../../../components/manage/ManageShell";

export default function ResourcesPage() {
  return (
    <>
      <PageHeader title="Resources" />
      <EmptyState
        icon="🪑"
        title="No resources configured"
        message="Resources are bookable non-staff assets — rooms, chairs, color stations, steam machines. Add them so the calendar can prevent double-booking the same physical asset."
        cta={
          <button className="h-9 px-4 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700 inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> New resource
          </button>
        }
      />
    </>
  );
}
