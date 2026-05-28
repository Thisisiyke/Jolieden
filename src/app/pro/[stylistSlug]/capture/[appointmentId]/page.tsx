import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Camera, ImagePlus, FileText, ChevronRight } from "lucide-react";
import { resolveStylist } from "@/lib/personas";
import { APPOINTMENTS } from "@/lib/data";

export default async function CapturePage({
  params,
}: {
  params: Promise<{ stylistSlug: string; appointmentId: string }>;
}) {
  const { stylistSlug, appointmentId } = await params;
  const stylist = resolveStylist(stylistSlug);
  if (!stylist) notFound();
  const appt = APPOINTMENTS.find((a) => a.id === appointmentId);
  if (!appt) notFound();

  return (
    <div className="space-y-5 px-4 py-5">
      <header className="flex items-center gap-2">
        <Link
          href={`/pro/${stylistSlug}/schedule/${appointmentId}`}
          className="-ml-1 flex items-center gap-0.5 text-brand"
          aria-label="Back to booking"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            📸 Hair journey capture
          </div>
          <h1 className="truncate font-serif text-[24px] font-semibold leading-tight text-ink-900">
            {appt.client}
          </h1>
        </div>
      </header>

      <section className="rounded-2xl border border-ink-200 bg-white p-4">
        <div className="text-xs font-medium uppercase tracking-wider text-ink-500">
          Today&apos;s service
        </div>
        <div className="mt-1 text-sm font-semibold text-ink-900">{appt.service}</div>
        {appt.serviceDetail && (
          <div className="mt-0.5 text-xs text-ink-500">{appt.serviceDetail}</div>
        )}
      </section>

      {/* Before */}
      <section>
        <h2 className="px-1 pb-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-500">
          Before
        </h2>
        <button
          type="button"
          className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink-300 bg-paper text-ink-500 hover:border-brand"
        >
          <Camera className="h-7 w-7" />
          <span className="text-sm font-medium">Tap to capture before photo</span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Auto-saves to client&apos;s hair journey
          </span>
        </button>
      </section>

      {/* After */}
      <section>
        <h2 className="px-1 pb-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-500">
          After
        </h2>
        <button
          type="button"
          className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink-300 bg-paper text-ink-500 hover:border-brand"
        >
          <ImagePlus className="h-7 w-7" />
          <span className="text-sm font-medium">Add finished look photo</span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Required before marking complete
          </span>
        </button>
      </section>

      {/* Notes */}
      <section className="rounded-2xl border border-ink-200 bg-white p-4">
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-brand">
          <FileText className="h-3 w-3" /> Service notes (for the next visit)
        </div>
        <textarea
          placeholder="Used new bond builder · tone came out warmer than expected · skip clarifying next time"
          rows={3}
          className="mt-2 w-full resize-none rounded-md border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
      </section>

      {/* Markup hint */}
      <section className="rounded-xl border border-ink-200 bg-paper p-3 text-xs text-ink-700">
        <strong className="text-ink-900">Tip:</strong> Long-press a photo to annotate areas you adjusted — the markup syncs to the client&apos;s journey for context.
      </section>

      <button
        type="button"
        className="flex w-full items-center justify-center gap-1.5 rounded-md bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Save to journey
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
