import { notFound } from "next/navigation";
import { FileSignature, Camera } from "lucide-react";
import { resolveClient } from "@/lib/personas";
import IntakeSubmit from "@/components/me/IntakeSubmit";
import BackArrow from "@/components/me/BackArrow";

export default async function IntakePage({
  params,
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;
  const client = resolveClient(clientSlug);
  if (!client) notFound();

  return (
    <div className="space-y-5 px-4 py-5">
      <header>
        <BackArrow clientSlug={clientSlug} />
        <div className="mt-2 font-mono text-[10px] uppercase tracking-wider text-brand">
          📋 First-time intake
        </div>
        <h1 className="mt-1 font-serif text-[26px] font-semibold leading-tight text-ink-900">
          A few quick questions
        </h1>
        <p className="mt-1 text-xs text-ink-500">
          Helps your stylist prep before you arrive. We&apos;ve pre-filled what we already know.
        </p>
      </header>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={
              "h-1 flex-1 rounded-full " + (n <= 1 ? "bg-brand" : "bg-ink-200")
            }
          />
        ))}
      </div>

      {/* Hair history */}
      <section className="space-y-3 rounded-2xl border border-ink-200 bg-white p-5">
        <h2 className="text-base font-semibold text-ink-900">Hair history</h2>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Hair texture
          </label>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {(["3A", "3B", "3C", "4A", "4B", "4C", "Type 2", "Mix"] as const).map((t, i) => {
              const active = t === "4B";
              return (
                <button
                  key={t}
                  type="button"
                  className={
                    "rounded-md border py-1.5 text-xs font-medium " +
                    (active
                      ? "border-brand bg-brand text-white"
                      : "border-ink-200 bg-white text-ink-700")
                  }
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Last service date
          </label>
          <input
            defaultValue="2026-02-14"
            className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Any chemical processing in the last 12 months?
          </label>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {["Yes", "No"].map((v) => {
              const active = v === "Yes";
              return (
                <button
                  key={v}
                  type="button"
                  className={
                    "rounded-md border py-2 text-sm font-medium " +
                    (active
                      ? "border-brand bg-brand text-white"
                      : "border-ink-200 bg-white text-ink-700")
                  }
                >
                  {v}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Accommodations */}
      <section className="space-y-3 rounded-2xl border border-ink-200 bg-white p-5">
        <h2 className="text-base font-semibold text-ink-900">Accommodations &amp; allergies</h2>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Scalp sensitivities
          </label>
          <textarea
            defaultValue="None known."
            rows={2}
            className="mt-1 w-full resize-none rounded-md border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Allergies
          </label>
          <textarea
            defaultValue="None on file."
            rows={2}
            className="mt-1 w-full resize-none rounded-md border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
      </section>

      {/* Photo + signature */}
      <section className="space-y-3 rounded-2xl border border-ink-200 bg-white p-5">
        <h2 className="text-base font-semibold text-ink-900">Reference photo (optional)</h2>
        <button
          type="button"
          className="flex w-full flex-col items-center gap-1 rounded-xl border-2 border-dashed border-ink-300 bg-paper px-4 py-6 text-ink-500 hover:border-brand"
        >
          <Camera className="h-6 w-6" />
          <span className="text-xs font-medium">Tap to upload a look you love</span>
        </button>
      </section>

      <section className="space-y-3 rounded-2xl border border-ink-200 bg-white p-5">
        <h2 className="text-base font-semibold text-ink-900">Service consent</h2>
        <p className="text-xs leading-relaxed text-ink-700">
          By signing, you consent to the booked service and acknowledge the salon&apos;s policies on
          cancellation, late arrivals, and product use.
        </p>
        <div className="flex items-center justify-between rounded-md border border-ink-200 bg-paper px-3 py-3 text-sm">
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Tap to sign
          </span>
          <FileSignature className="h-4 w-4 text-ink-400" />
        </div>
      </section>

      <IntakeSubmit clientSlug={client.slug} />
    </div>
  );
}
