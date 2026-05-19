import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { BETA_REPORTS } from "../../../../lib/reports";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const r = BETA_REPORTS.find((x) => x.id === id);
  if (!r) notFound();

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto bg-ink-50">
      <div className="max-w-5xl mx-auto p-6 space-y-4">
        <Link
          href="/reports/beta"
          className="text-[12px] text-ink-500 hover:text-brand inline-flex items-center gap-1"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Back to Reports
        </Link>

        <div className="rounded-lg border border-ink-200 bg-white p-6">
          <div className="text-[20px] font-semibold text-ink-900">{r.name}</div>
          <div className="text-[14px] text-ink-500 mt-1">{r.description}</div>
          <div className="mt-4 flex flex-wrap gap-3 text-[12px] text-ink-700">
            <Stat label="Folder" value={r.folder} />
            <Stat label="Created by" value={r.createdBy} />
            <Stat label="Shared" value={r.shared ? "Shared" : "No Viewers"} />
            <Stat label="Updated" value={r.updatedAt} />
          </div>
        </div>

        <div className="rounded-lg border border-ink-200 bg-white p-12 text-center text-ink-500 text-[14px]">
          Report detail view — table, charts, filters, and export controls
          render here. This is a prototype placeholder; wire data per report
          template.
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-ink-200 px-3 py-1.5 bg-ink-50">
      <span className="text-[10px] uppercase tracking-wide font-bold text-ink-500 mr-2">
        {label}
      </span>
      <span className="font-medium text-ink-900">{value}</span>
    </div>
  );
}
