import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Cake,
  Clock,
  MapPin,
  QrCode,
} from "lucide-react";
import { resolveClient, appointmentsForClient } from "@/lib/personas";
import { TODAY } from "@/lib/data";
import QrCheckinClient from "@/components/checkin/QrCheckinClient";

const QR_BASE = "https://api.qrserver.com/v1/create-qr-code";

export default async function CheckinPage({
  params,
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;
  const client = resolveClient(clientSlug);
  if (!client) notFound();

  // Pick the next upcoming (or arrived/active today) appointment.
  const next = appointmentsForClient(clientSlug)
    .filter((a) => a.date >= TODAY && (a.status === "confirmed" || a.status === "arrived" || a.status === "active"))
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  if (!next) {
    return (
      <div className="space-y-5 px-4 py-5">
        <header>
          <h1 className="font-serif text-[28px] font-semibold leading-tight text-ink-900">
            Check in
          </h1>
          <p className="mt-1 text-xs text-ink-500">
            Your check-in QR appears here when you have an upcoming visit.
          </p>
        </header>
        <div className="rounded-xl border border-dashed border-ink-300 bg-white p-6 text-center">
          <QrCode className="mx-auto h-7 w-7 text-ink-400" />
          <p className="mt-3 text-sm text-ink-900">No upcoming visit on the books.</p>
          <Link
            href={`/book?as=${client.slug}`}
            className="mt-3 inline-block rounded-md bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700"
          >
            Book a visit
          </Link>
        </div>
      </div>
    );
  }

  // QR payload — small + deterministic. iPad scanner reads + parses.
  const payload = `jolieden:checkin:${next.id}:${client.slug}`;
  const qrUrl = `${QR_BASE}/?size=320x320&qzone=2&format=svg&color=431926&bgcolor=fbf7f5&data=${encodeURIComponent(payload)}`;

  const hasBirthday = (next.tags || []).includes("Birthday");

  return (
    <div className="space-y-5 px-4 py-5">
      <header className="flex items-center gap-2">
        <Link
          href={`/me/${client.slug}`}
          className="-ml-1 flex items-center gap-0.5 text-brand"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Walk-in check-in
          </div>
          <h1 className="font-serif text-[26px] font-semibold leading-tight text-ink-900">
            Show this at the desk
          </h1>
        </div>
      </header>

      {/* QR card */}
      <section className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm">
        <div className="flex flex-col items-center bg-paper px-5 py-6">
          {/* Use a plain img — Next.js Image would require remotePatterns
              config for the qrserver.com domain; img tag has no such gate. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrUrl}
            alt="Check-in QR code"
            width={240}
            height={240}
            className="h-[240px] w-[240px] rounded-md"
          />
          <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-ink-500">
            payload · {payload}
          </p>
        </div>
        <div className="px-5 py-4">
          <div className="text-sm font-semibold text-ink-900">{next.service}</div>
          {next.serviceDetail && (
            <div className="mt-0.5 text-xs text-ink-500">{next.serviceDetail}</div>
          )}
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
                When
              </div>
              <div className="mt-0.5 font-medium text-ink-900">
                {next.date} · {next.start}
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
                Stylist
              </div>
              <div className="mt-0.5 truncate font-medium text-ink-900">{next.staff || "—"}</div>
            </div>
          </div>
          {hasBirthday && (
            <div className="mt-3 flex items-center gap-2 rounded-md border border-gold/40 bg-gold-soft px-3 py-2 text-xs text-ink-900">
              <Cake className="h-3.5 w-3.5 text-brand" />
              <span>Comp Wash &amp; Blow applies automatically at scan.</span>
            </div>
          )}
        </div>
      </section>

      {/* Instructions */}
      <ol className="space-y-2 px-1 text-sm text-ink-700">
        <li className="flex items-start gap-2">
          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-white">
            1
          </span>
          Walk up to the front desk iPad.
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-white">
            2
          </span>
          Hold this screen up — the kiosk scans it automatically.
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-white">
            3
          </span>
          Take a seat. Your stylist sees you in the queue.
        </li>
      </ol>

      <div className="flex items-center justify-center gap-2 text-xs text-ink-500">
        <Clock className="h-3 w-3" />
        Skips the sign-in form · saves about 90 seconds
      </div>

      <div className="flex items-center justify-center gap-1 text-xs text-ink-500">
        <MapPin className="h-3 w-3" />
        Jolieden Beauty Bar · New York
      </div>

      <QrCheckinClient appointmentId={next.id} clientSlug={client.slug} />
    </div>
  );
}
