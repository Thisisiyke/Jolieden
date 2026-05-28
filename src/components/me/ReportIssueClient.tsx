"use client";

// Interactive 3-step issue reporter for /me. Pick the troubled appointment,
// upload photos, write notes, submit. After submit, shows a confirmation
// stating Diéssou personally reviews + a free fix gets booked.

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Camera,
  X,
  Check,
  Loader2,
  CalendarHeart,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";
import type { Appointment } from "@/lib/data";

type Phase = "form" | "submitting" | "success";

type Props = { clientSlug: string; pastAppointments: Appointment[] };

export default function ReportIssueClient({ clientSlug, pastAppointments }: Props) {
  const [selectedApptId, setSelectedApptId] = useState<string | null>(
    pastAppointments[0]?.id ?? null,
  );
  const [photos, setPhotos] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [phase, setPhase] = useState<Phase>("form");
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    if (!selectedApptId || description.trim().length < 5) return;
    setPhase("submitting");
    window.setTimeout(() => setPhase("success"), 900);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const readers = Array.from(files).map(
      (f) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve(typeof reader.result === "string" ? reader.result : "");
          reader.onerror = reject;
          reader.readAsDataURL(f);
        }),
    );
    Promise.all(readers).then((results) => {
      setPhotos((prev) => [...prev, ...results].slice(0, 5));
    });
  };

  const removePhoto = (idx: number) => {
    setPhotos((p) => p.filter((_, i) => i !== idx));
  };

  if (phase === "success") {
    return (
      <section className="space-y-4 rounded-2xl border border-status-confirmed/30 bg-status-confirmed/5 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-status-confirmed/15">
          <Check className="h-6 w-6 text-status-confirmed" />
        </div>
        <h2 className="font-serif text-xl font-semibold text-ink-900">
          We&apos;ve got it from here
        </h2>
        <p className="text-sm text-ink-700">
          Diéssou personally reviews every issue. She or a manager will text you within{" "}
          <strong>2 hours</strong> with a fix slot — free of charge.
        </p>
        <div className="flex items-center justify-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-brand">
          <Sparkles className="h-3 w-3" />
          Avg fix offered within 24 hours
        </div>
        <Link
          href={`/me/${clientSlug}`}
          className="block w-full rounded-md bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Back to home
        </Link>
      </section>
    );
  }

  return (
    <>
      {/* Step 1 — pick the appointment */}
      <section className="space-y-3 rounded-2xl border border-ink-200 bg-white p-5">
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-brand">
          <Sparkles className="h-3 w-3" /> Step 1 · Which visit?
        </div>
        {pastAppointments.length === 0 ? (
          <p className="text-sm text-ink-700">
            No past visits on file. If you visited as a walk-in, tap{" "}
            <Link href={`/me/${clientSlug}`} className="text-brand underline">
              go back home
            </Link>{" "}
            and use the chat instead.
          </p>
        ) : (
          <ul className="space-y-2">
            {pastAppointments.map((a) => {
              const active = a.id === selectedApptId;
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedApptId(a.id)}
                    className={clsx(
                      "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                      active
                        ? "border-brand bg-brand-50"
                        : "border-ink-200 bg-white hover:border-brand",
                    )}
                  >
                    <CalendarHeart
                      className={
                        "h-4 w-4 shrink-0 " + (active ? "text-brand" : "text-ink-400")
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-ink-900">
                        {a.service}
                      </div>
                      <div className="truncate font-mono text-[10px] text-ink-500">
                        {a.date} · with {a.staff || "—"}
                      </div>
                    </div>
                    {active && <Check className="h-4 w-4 text-brand" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Step 2 — photos */}
      <section className="space-y-3 rounded-2xl border border-ink-200 bg-white p-5">
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-brand">
          <Sparkles className="h-3 w-3" /> Step 2 · Add photos (up to 5)
        </div>
        <p className="text-xs text-ink-500">
          Closer the better — helps the team triage quickly.
        </p>
        {photos.length > 0 && (
          <ul className="grid grid-cols-3 gap-2">
            {photos.map((p, i) => (
              <li key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p}
                  alt={`Reported issue photo ${i + 1}`}
                  className="aspect-square w-full rounded-md object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  aria-label="Remove"
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white shadow"
                >
                  <X className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {photos.length < 5 && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-ink-300 bg-paper p-4 text-ink-500 hover:border-brand"
          >
            <Camera className="h-6 w-6" />
            <span className="text-sm font-medium">
              {photos.length === 0 ? "Tap to add photos" : `Add another (${photos.length}/5)`}
            </span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          onChange={onFile}
          className="hidden"
        />
      </section>

      {/* Step 3 — description */}
      <section className="space-y-3 rounded-2xl border border-ink-200 bg-white p-5">
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-brand">
          <Sparkles className="h-3 w-3" /> Step 3 · What&apos;s up?
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="E.g. 'Three braids near the nape unraveled in 4 days. Edges itchy starting day 2.'"
          className="w-full resize-none rounded-md border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
        <p className="text-xs text-ink-500">
          {description.length}/500 · The more specific, the faster the fix.
        </p>
      </section>

      {/* Submit */}
      <button
        type="button"
        onClick={submit}
        disabled={
          !selectedApptId ||
          description.trim().length < 5 ||
          phase === "submitting"
        }
        className="flex w-full items-center justify-center gap-1.5 rounded-md bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {phase === "submitting" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            Send to Diéssou
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </button>

      <p className="text-center font-mono text-[10px] text-ink-500">
        💜 Every issue is reviewed by Diéssou. No charges, no questions.
      </p>
    </>
  );
}
