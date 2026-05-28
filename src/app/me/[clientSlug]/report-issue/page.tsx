import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { resolveClient, appointmentsForClient } from "@/lib/personas";
import ReportIssueClient from "@/components/me/ReportIssueClient";

export default async function ReportIssuePage({
  params,
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;
  const client = resolveClient(clientSlug);
  if (!client) notFound();

  const past = appointmentsForClient(clientSlug)
    .filter((a) => a.status === "completed")
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  return (
    <div className="space-y-5 px-4 py-5">
      <header className="flex items-center gap-2">
        <Link
          href={`/me/${clientSlug}`}
          className="-ml-1 flex items-center gap-0.5 text-brand"
          aria-label="Back home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-wider text-brand">
            🛠 Report a service issue
          </div>
          <h1 className="truncate font-serif text-[24px] font-semibold leading-tight text-ink-900">
            Tell us what happened
          </h1>
        </div>
      </header>

      <p className="text-xs text-ink-700">
        Something not lasting? Tension off? Wrong tone? Send us photos and a few words — Diéssou
        sees it personally and books a fix at no charge.
      </p>

      <ReportIssueClient clientSlug={clientSlug} pastAppointments={past} />
    </div>
  );
}
