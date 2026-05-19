"use client";

import { Plus } from "lucide-react";
import { PageHeader, EmptyState } from "../../../components/manage/ManageShell";

export default function MembershipPlansPage() {
  return (
    <>
      <PageHeader title="Membership Plans" />
      <EmptyState
        icon="🪪"
        title="No membership plans yet"
        message="Membership plans are recurring subscriptions clients can purchase — color refresh credits, monthly silk press, scalp treatment series. Configure pricing, billing cycle, and included services."
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
