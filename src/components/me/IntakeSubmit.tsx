"use client";

// Submit button + success state for the intake form. Production writes
// to `client_intake_forms` (ARCHITECTURE §A.13) and triggers e-signature
// flow. Prototype: brief simulated submit, then navigate back to /me.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, ChevronRight } from "lucide-react";

export default function IntakeSubmit({ clientSlug }: { clientSlug: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<"idle" | "submitting" | "submitted">("idle");

  const submit = () => {
    setPhase("submitting");
    window.setTimeout(() => {
      setPhase("submitted");
      window.setTimeout(() => {
        router.push(`/me/${clientSlug}`);
      }, 1200);
    }, 700);
  };

  if (phase === "submitted") {
    return (
      <section className="rounded-2xl border border-status-confirmed/30 bg-status-confirmed/5 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-status-confirmed/15">
          <Check className="h-6 w-6 text-status-confirmed" />
        </div>
        <h2 className="mt-3 font-serif text-lg font-semibold text-ink-900">
          Intake saved
        </h2>
        <p className="mt-1 text-xs text-ink-500">
          Your stylist will see this before your appointment. Heading back home…
        </p>
      </section>
    );
  }

  return (
    <button
      type="button"
      onClick={submit}
      disabled={phase === "submitting"}
      className="flex w-full items-center justify-center gap-1.5 rounded-md bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
    >
      {phase === "submitting" ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
        </>
      ) : (
        <>
          Submit intake form
          <ChevronRight className="h-4 w-4" />
        </>
      )}
    </button>
  );
}
