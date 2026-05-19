"use client";

import { Plus } from "lucide-react";
import { PageHeader, EmptyState } from "../../../components/manage/ManageShell";

export default function PackagesPage() {
  return (
    <>
      <PageHeader title="Packages" />
      <EmptyState
        icon="📦"
        title="No packages yet"
        message="Bundle services and products into a single price — e.g., a Knotless Braids package that includes the install, the scalp oil, and a touch-up four weeks later. Apply a flat discount or fixed bundle price."
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
