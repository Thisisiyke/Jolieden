"use client";

// iPad kiosk standalone route — fullscreen, no operator chrome, designed
// for an iPad mounted at the front desk. Clients walk up, scan their
// /me check-in QR or type a phone number, and the kiosk marks them
// arrived in the store.

import { useState } from "react";
import Link from "next/link";
import { Scan, Phone, Sparkles, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { TODAY } from "@/lib/data";

type Mode = "idle" | "scan" | "phone" | "confirm" | "success";

type PendingClient = {
  firstName: string;
  lastName: string;
  avatarHue?: number;
  appointmentId?: string;
};

export default function KioskPage() {
  const [mode, setMode] = useState<Mode>("idle");
  const [phone, setPhone] = useState("");
  const [arrivedName, setArrivedName] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingClient | null>(null);

  const appointments = useStore((s) => s.appointments);
  const clients = useStore((s) => s.clients);
  const setAppointmentStatus = useStore((s) => s.setAppointmentStatus);

  const arriveByPhone = () => {
    const normalized = phone.replace(/\D/g, "");
    const client = Object.values(clients).find(
      (c) => c.phone.replace(/\D/g, "") === normalized,
    );
    if (!client) {
      // Fall back to "checked in" anyway with name "Guest" for the demo.
      setArrivedName("Guest");
      setMode("success");
      return;
    }
    const next = Object.values(appointments)
      .filter(
        (a) =>
          a.date === TODAY &&
          a.client.toLowerCase().includes(client.firstName.toLowerCase()) &&
          (a.status === "confirmed" || a.status === "unconfirmed"),
      )
      .sort((a, b) => a.start.localeCompare(b.start))[0];
    // Move to photo confirmation step first — kiosk shows the saved photo
    // and asks "Is this you?" before flipping the status.
    setPending({
      firstName: client.firstName,
      lastName: client.lastName,
      avatarHue: client.avatarHue,
      appointmentId: next?.id,
    });
    setMode("confirm");
  };

  const confirmPending = () => {
    if (!pending) return;
    if (pending.appointmentId) setAppointmentStatus(pending.appointmentId, "arrived");
    setArrivedName(`${pending.firstName} ${pending.lastName}`);
    setPending(null);
    setMode("success");
  };

  const reset = () => {
    setMode("idle");
    setPhone("");
    setArrivedName(null);
    setPending(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-paper-mute via-paper to-brand-50">
      {/* Top strip — operator back link */}
      <div className="flex items-center justify-between px-6 py-3">
        <Link href="/demo" className="flex items-center gap-1 text-xs text-ink-500 hover:text-brand">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="font-mono uppercase tracking-wider">Demo</span>
        </Link>
        <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
          Front desk iPad · {TODAY}
        </div>
      </div>

      <main className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <div className="font-serif text-5xl font-semibold tracking-[0.1em] text-brand">JOLIEDEN</div>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-ink-500">
          Welcome — we&apos;ll get you to your stylist
        </p>

        {mode === "idle" && (
          <>
            <h1 className="mt-10 font-serif text-3xl font-semibold text-ink-900 sm:text-4xl">
              Check in to start your visit
            </h1>
            <p className="mt-3 max-w-xl text-base text-ink-700">
              Pick how you&apos;d like to check in. Either way takes about 10 seconds.
            </p>

            <div className="mt-10 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setMode("scan")}
                className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-ink-200 bg-white p-8 hover:border-brand"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-white">
                  <Scan className="h-8 w-8" />
                </div>
                <div className="text-xl font-semibold text-ink-900">Scan QR</div>
                <p className="text-sm text-ink-500">
                  Pull up your check-in code in the Jolieden app
                </p>
                <span className="font-mono text-[10px] uppercase tracking-wider text-brand opacity-0 transition-opacity group-hover:opacity-100">
                  Tap to scan →
                </span>
              </button>
              <button
                type="button"
                onClick={() => setMode("phone")}
                className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-ink-200 bg-white p-8 hover:border-brand"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500 text-white">
                  <Phone className="h-8 w-8" />
                </div>
                <div className="text-xl font-semibold text-ink-900">Phone number</div>
                <p className="text-sm text-ink-500">
                  Don&apos;t have the app yet? No problem.
                </p>
                <span className="font-mono text-[10px] uppercase tracking-wider text-brand opacity-0 transition-opacity group-hover:opacity-100">
                  Tap to enter →
                </span>
              </button>
            </div>
            <p className="mt-10 font-mono text-[10px] uppercase tracking-wider text-ink-500">
              💜 Diéssou will be notified once you&apos;re here
            </p>
          </>
        )}

        {mode === "scan" && (
          <>
            <h1 className="mt-10 font-serif text-3xl font-semibold text-ink-900">
              Hold your QR up to the camera
            </h1>
            <p className="mt-3 max-w-xl text-base text-ink-700">
              The iPad reads it automatically — no need to tap.
            </p>
            <div className="mt-10 flex h-72 w-72 items-center justify-center rounded-2xl border-2 border-dashed border-brand bg-white">
              <div className="text-center">
                <Scan className="mx-auto h-12 w-12 text-brand" />
                <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-ink-500">
                  Scanning…
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const aaliyah = Object.values(clients).find((c) => c.slug === "aaliyah-j");
                const next = Object.values(appointments).find((a) => a.client === "Aaliyah Jackson" && a.status === "confirmed");
                setPending({
                  firstName: aaliyah?.firstName || "Aaliyah",
                  lastName: aaliyah?.lastName || "Jackson",
                  avatarHue: aaliyah?.avatarHue,
                  appointmentId: next?.id,
                });
                setMode("confirm");
              }}
              className="mt-8 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Demo · simulate scan
            </button>
          </>
        )}

        {mode === "confirm" && pending && (
          <>
            <h1 className="mt-10 font-serif text-3xl font-semibold text-ink-900">
              Is this you?
            </h1>
            <p className="mt-3 max-w-xl text-base text-ink-700">
              Quick check before we mark you arrived.
            </p>
            {/* Big avatar tile */}
            <div className="mt-10 flex flex-col items-center gap-3">
              <div
                className="flex h-40 w-40 items-center justify-center rounded-full text-5xl font-semibold text-white shadow-lg"
                style={{
                  background: `linear-gradient(135deg, hsl(${pending.avatarHue ?? 320}, 55%, 38%), hsl(${((pending.avatarHue ?? 320) + 30) % 360}, 60%, 50%))`,
                }}
              >
                {pending.firstName[0]}
                {pending.lastName[0]}
              </div>
              <div className="text-2xl font-semibold text-ink-900">
                {pending.firstName} {pending.lastName}
              </div>
              {pending.appointmentId && (
                <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
                  Booking · {pending.appointmentId.toUpperCase()}
                </div>
              )}
            </div>
            <div className="mt-10 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setPending(null);
                  setMode("idle");
                }}
                className="rounded-md border border-ink-200 bg-white px-5 py-3 text-sm font-medium text-ink-700 hover:border-brand"
              >
                Not me
              </button>
              <button
                type="button"
                onClick={confirmPending}
                className="flex items-center gap-2 rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Yes, that&apos;s me
                <CheckCircle2 className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-6 font-mono text-[10px] uppercase tracking-wider text-ink-500">
              Saved from your most recent visit · helps avoid mix-ups
            </p>
          </>
        )}

        {mode === "phone" && (
          <>
            <h1 className="mt-10 font-serif text-3xl font-semibold text-ink-900">
              What&apos;s your phone number?
            </h1>
            <p className="mt-3 max-w-xl text-base text-ink-700">
              We&apos;ll match it to your booking.
            </p>
            <input
              autoFocus
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(929) 555-0000"
              className="mt-8 w-full max-w-md rounded-2xl border border-ink-200 bg-white px-5 py-5 text-center font-mono text-2xl tracking-wider text-ink-900 focus:border-brand focus:outline-none"
            />
            <button
              type="button"
              onClick={arriveByPhone}
              disabled={phone.length < 7}
              className="mt-6 flex items-center gap-2 rounded-md bg-brand px-6 py-3 text-base font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          </>
        )}

        {mode === "success" && arrivedName && (
          <>
            <div className="mt-10 flex h-20 w-20 items-center justify-center rounded-full bg-status-confirmed/15">
              <CheckCircle2 className="h-10 w-10 text-status-confirmed" />
            </div>
            <h1 className="mt-6 font-serif text-3xl font-semibold text-ink-900">
              You&apos;re checked in, {arrivedName.split(" ")[0]}
            </h1>
            <p className="mt-3 max-w-xl text-base text-ink-700">
              Have a seat — your stylist sees you in the queue. Drinks are on us.
            </p>
            <div className="mt-8 flex items-center gap-2 rounded-full border border-gold/40 bg-gold-soft px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-brand">
              <Sparkles className="h-3 w-3" /> Birthday gifts auto-applied when applicable
            </div>
            <button
              type="button"
              onClick={reset}
              className="mt-10 text-sm font-medium text-brand hover:underline"
            >
              Check someone else in →
            </button>
          </>
        )}
      </main>

      <footer className="px-6 py-4 text-center font-mono text-[10px] uppercase tracking-wider text-ink-500">
        Jolieden Beauty Bar · iPad kiosk · v0.9
      </footer>
    </div>
  );
}
