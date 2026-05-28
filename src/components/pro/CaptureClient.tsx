"use client";

// Interactive capture flow on the stylist app. Stylist taps Before / After
// tiles → real File API picks a photo → preview shows. Notes textarea is
// editable. Save action: (a) writes a HairJourneyEntry to Zustand so the
// client's /me/.../journey timeline reflects it, (b) advances appointment
// to completed, (c) navigates back to /pro/.../schedule/{id}.

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  ImagePlus,
  FileText,
  ChevronRight,
  X,
  Loader2,
  Check,
} from "lucide-react";
import clsx from "clsx";
import { useStore } from "@/lib/store";
import { resolveClientByName } from "@/lib/personas";

type Props = {
  stylistSlug: string;
  appointmentId: string;
  clientName: string;
  serviceName: string;
  defaultStylistName: string;
};

type Phase = "form" | "saving" | "saved";

export default function CaptureClient({
  stylistSlug,
  appointmentId,
  clientName,
  serviceName,
  defaultStylistName,
}: Props) {
  void defaultStylistName;
  const [before, setBefore] = useState<string | null>(null);
  const [after, setAfter] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [phase, setPhase] = useState<Phase>("form");

  const beforeRef = useRef<HTMLInputElement>(null);
  const afterRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const addJourneyEntry = useStore((s) => s.addJourneyEntry);
  const setAppointmentStatus = useStore((s) => s.setAppointmentStatus);

  const readFile = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(typeof r.result === "string" ? r.result : "");
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  const onBefore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setBefore(await readFile(f));
  };
  const onAfter = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setAfter(await readFile(f));
  };

  const canSave = !!after; // After photo required per the existing copy

  const save = () => {
    if (!canSave) return;
    setPhase("saving");
    // Resolve client by display name (prototype convention). If unmatched,
    // skip the journey entry but still advance the appointment.
    const client = resolveClientByName(clientName);
    if (client) {
      addJourneyEntry({
        id: `j-${Date.now()}`,
        clientSlug: client.slug,
        appointmentId,
        date: new Date().toISOString().slice(0, 10),
        serviceName,
        stylistSlug,
        beforePhoto: before || undefined,
        afterPhoto: after || undefined,
        note: notes.trim() || undefined,
      });
    }
    // Brief beat so the saving spinner is visible before navigation.
    window.setTimeout(() => {
      setAppointmentStatus(appointmentId, "completed");
      setPhase("saved");
      window.setTimeout(() => {
        router.push(`/pro/${stylistSlug}/schedule/${appointmentId}`);
      }, 700);
    }, 600);
  };

  if (phase === "saved") {
    return (
      <section className="rounded-2xl border border-status-confirmed/30 bg-status-confirmed/5 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-status-confirmed/15">
          <Check className="h-6 w-6 text-status-confirmed" />
        </div>
        <h2 className="mt-3 font-serif text-lg font-semibold text-ink-900">
          Saved to journey
        </h2>
        <p className="mt-1 text-xs text-ink-500">
          Marking the appointment complete and heading back to the booking…
        </p>
      </section>
    );
  }

  return (
    <>
      {/* Before */}
      <section>
        <h2 className="px-1 pb-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-500">
          Before
        </h2>
        {before ? (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-ink-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={before} alt="Before" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => setBefore(null)}
              aria-label="Remove before photo"
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => beforeRef.current?.click()}
            className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink-300 bg-paper text-ink-500 hover:border-brand"
          >
            <Camera className="h-7 w-7" />
            <span className="text-sm font-medium">Tap to capture before photo</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
              Optional · auto-saves to client&apos;s hair journey
            </span>
          </button>
        )}
        <input
          ref={beforeRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={onBefore}
        />
      </section>

      {/* After */}
      <section>
        <h2 className="px-1 pb-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-500">
          After
        </h2>
        {after ? (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-ink-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={after} alt="After" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => setAfter(null)}
              aria-label="Remove after photo"
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => afterRef.current?.click()}
            className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink-300 bg-paper text-ink-500 hover:border-brand"
          >
            <ImagePlus className="h-7 w-7" />
            <span className="text-sm font-medium">Add finished look photo</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
              Required before marking complete
            </span>
          </button>
        )}
        <input
          ref={afterRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={onAfter}
        />
      </section>

      {/* Notes */}
      <section className="rounded-2xl border border-ink-200 bg-white p-4">
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-brand">
          <FileText className="h-3 w-3" /> Service notes (for the next visit)
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
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
        onClick={save}
        disabled={!canSave || phase === "saving"}
        className={clsx(
          "flex w-full items-center justify-center gap-1.5 rounded-md py-3 text-sm font-semibold text-white",
          canSave && phase !== "saving"
            ? "bg-brand hover:bg-brand-700"
            : "bg-ink-300",
        )}
      >
        {phase === "saving" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving…
          </>
        ) : (
          <>
            Save to journey &amp; mark complete
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </button>
      {!canSave && (
        <p className="text-center font-mono text-[10px] text-ink-500">
          Add the After photo to save.
        </p>
      )}
    </>
  );
}
