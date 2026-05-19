"use client";

import { Plus } from "lucide-react";
import { PageHeader, EmptyState } from "../../../components/manage/ManageShell";

export default function Page() {
  return (
    <>
      <PageHeader title="Membership Plans" />
      <EmptyState
        icon="🪪"
        title="No business-wide membership plans"
        message="Plans created here apply across every location. Useful for chains where members get the same benefits at any salon."
        cta={
          <button className="h-9 px-4 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700 inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> New membership plan
          </button>
        }
        learnMore="Learn more about memberships"
      />
    </>
  );
}
