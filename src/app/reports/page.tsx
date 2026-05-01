"use client";

import { useState } from "react";
import { ReportsTabs } from "../../components/reports/ReportsTabs";
import { SummariesNav } from "../../components/reports/SummariesNav";
import { ReportToolbar } from "../../components/reports/ReportToolbar";
import { SummaryRenderer } from "../../components/reports/SummaryRenderers";
import type { SummaryReportId } from "../../lib/reports";
import { parseISODate } from "../../lib/date";

function fmtRange(s: string, e: string) {
  const f = (iso: string) => {
    const d = parseISODate(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };
  return `${f(s)} – ${f(e)}`;
}

export default function ReportsSummariesPage() {
  const [active, setActive] = useState<SummaryReportId>("sales-summary");
  const [start, setStart] = useState("2026-04-14");
  const [end, setEnd] = useState("2026-04-14");

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-ink-50">
      <ReportsTabs active="summaries" />
      <div className="flex-1 flex min-h-0">
        <SummariesNav active={active} onPick={setActive} />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar bar — sits above the report */}
          <div className="bg-white border-b border-ink-200 px-6 py-3 flex items-center justify-between">
            <div className="text-[12px] text-ink-500">Jolieden&apos;s Beauty Bar · Frederick Douglass</div>
            <ReportToolbar
              start={start}
              end={end}
              onApplyRange={(s, e) => { setStart(s); setEnd(e); }}
              onExport={(f) => console.log("export", f)}
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            <SummaryRenderer id={active} range={fmtRange(start, end)} />
          </div>
        </div>
      </div>
    </div>
  );
}
