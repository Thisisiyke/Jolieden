"use client";

import { useState } from "react";
import { PageHeader, Card, ToggleRow } from "../../../components/manage/ManageShell";

export default function GiftCardsPage() {
  const [enabled, setEnabled] = useState(false);
  return (
    <>
      <PageHeader title="Gift Cards" />
      <div className="p-6 max-w-2xl">
        <Card>
          <div className="p-5 flex items-center justify-between">
            <div>
              <div className="text-[14px] font-semibold text-ink-900">Enable gift cards at the business</div>
              <div className="text-[12px] text-ink-500 mt-1 max-w-md">
                Turning this on unlocks gift card sale at checkout and redemption everywhere — front desk, online booking, and Sales.
              </div>
            </div>
            <ToggleRow checked={enabled} onChange={setEnabled} />
          </div>
        </Card>
      </div>
    </>
  );
}
