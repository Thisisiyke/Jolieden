"use client";

// Demo-only "scan" trigger: the prototype can't actually scan a QR, so a
// hidden button lets reviewers advance the appointment to "arrived" to
// simulate the check-in. Real production: the salon's iPad reads the QR
// payload and calls setAppointmentStatus over the wire.

import Link from "next/link";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import type { ApptStatus } from "@/lib/data";

type Props = {
  appointmentId: string;
  clientSlug: string;
};

export default function QrCheckinClient({ appointmentId, clientSlug }: Props) {
  const currentStatus = useStore((s) => s.appointments[appointmentId]?.status) as
    | ApptStatus
    | undefined;
  const setAppointmentStatus = useStore((s) => s.setAppointmentStatus);
  const [checking, setChecking] = useState(false);

  const arrived = currentStatus === "arrived" || currentStatus === "active" || currentStatus === "completed";

  const simulateScan = () => {
    if (arrived) return;
    setChecking(true);
    // Mimic the slight latency of an iPad scan handshake.
    setTimeout(() => {
      setAppointmentStatus(appointmentId, "arrived");
      setChecking(false);
    }, 700);
  };

  if (arrived) {
    return (
      <div className="space-y-3 px-5">
        <div className="flex items-center gap-2 rounded-xl border border-status-arrived/30 bg-status-arrived/10 p-4">
          <Sparkles className="h-5 w-5 text-status-arrived" />
          <div>
            <div className="text-sm font-semibold text-ink-900">You&apos;re checked in!</div>
            <div className="mt-0.5 text-xs text-ink-500">
              Your stylist sees you in the queue. Take a seat — drinks are on us.
            </div>
          </div>
        </div>
        <Link
          href={`/me/${clientSlug}/bookings/${appointmentId}`}
          className="block w-full rounded-md bg-brand py-3 text-center text-sm font-semibold text-white hover:bg-brand-700"
        >
          See your booking
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3 px-5">
      <button
        type="button"
        onClick={simulateScan}
        disabled={checking}
        className="block w-full rounded-md bg-brand py-3 text-center text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {checking ? "Reading code…" : "Demo · simulate iPad scan"}
      </button>
      <p className="text-center font-mono text-[10px] uppercase tracking-wider text-ink-500">
        Real flow: salon iPad reads the QR; this button stands in for that.
      </p>
    </div>
  );
}
