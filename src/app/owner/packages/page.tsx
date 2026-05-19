"use client";

import { Plus } from "lucide-react";
import { PageHeader, EmptyState } from "../../../components/manage/ManageShell";

export default function Page() {
  return (
    <>
      <PageHeader title="Packages" />
      <EmptyState
        icon="📦"
        title="No business-wide packages"
        message="Packages bundle services + products into one price. Created here, they're available at every location and synced to the booking site."
        cta={
          <button className="h-9 px-4 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700 inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> New package
          </button>
        }
        learnMore="Learn more about packages"
      />
    </>
  );
}
