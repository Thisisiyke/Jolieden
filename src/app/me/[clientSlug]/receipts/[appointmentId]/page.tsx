import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Download, Mail, Star } from "lucide-react";
import { resolveClient } from "@/lib/personas";
import { APPOINTMENTS } from "@/lib/data";

const TAX_RATE = 0.08875; // NYC sales tax

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ clientSlug: string; appointmentId: string }>;
}) {
  const { clientSlug, appointmentId } = await params;
  const client = resolveClient(clientSlug);
  if (!client) notFound();
  const appt = APPOINTMENTS.find((a) => a.id === appointmentId);
  if (!appt) notFound();

  const subtotal = appt.price || 0;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const tip = Math.round(subtotal * 0.2 * 100) / 100; // 20% suggested + locked
  const deposit = 25;
  const total = subtotal + tax + tip - deposit;

  const isCompleted = appt.status === "completed";

  return (
    <div className="space-y-5 px-4 py-5">
      <header className="flex items-center gap-2">
        <Link
          href={`/me/${clientSlug}/bookings/${appointmentId}`}
          className="-ml-1 flex items-center gap-0.5 text-brand"
          aria-label="Back to booking"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            🧾 Digital receipt
          </div>
          <h1 className="truncate font-serif text-[24px] font-semibold leading-tight text-ink-900">
            {appt.service}
          </h1>
        </div>
      </header>

      {/* Status badge */}
      {isCompleted ? (
        <div className="flex items-center gap-2 rounded-2xl border border-status-confirmed/30 bg-status-confirmed/5 p-3 text-sm">
          <CheckCircle2 className="h-4 w-4 text-status-confirmed" />
          <span className="text-ink-900">Paid in full</span>
          <span className="ml-auto font-mono text-[10px] text-ink-500">{appt.date}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-2xl border border-status-pending/30 bg-status-pending/5 p-3 text-sm">
          <span className="text-ink-900">Pending — receipt finalizes after checkout</span>
        </div>
      )}

      {/* Salon header */}
      <section className="rounded-2xl border border-ink-200 bg-white p-5 text-center">
        <div className="font-serif text-2xl font-semibold tracking-[0.1em] text-brand">JOLIEDEN</div>
        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-500">
          New York
        </div>
        <div className="mt-1 font-mono text-[10px] text-ink-500">
          joliedensbeautybar.com · (646) 555-0100
        </div>
      </section>

      {/* Line items */}
      <section className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
        <header className="border-b border-ink-200 px-4 py-2">
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Line items
          </div>
        </header>
        <ul className="divide-y divide-ink-200">
          <li className="flex items-start gap-3 px-4 py-3 text-sm">
            <div className="min-w-0 flex-1">
              <div className="font-medium text-ink-900">{appt.service}</div>
              {appt.serviceDetail && (
                <div className="mt-0.5 font-mono text-[10px] text-ink-500">{appt.serviceDetail}</div>
              )}
              {appt.staff && (
                <div className="mt-0.5 font-mono text-[10px] text-ink-500">with {appt.staff}</div>
              )}
            </div>
            <div className="shrink-0 font-mono tabular-nums text-ink-900">${subtotal.toFixed(2)}</div>
          </li>
        </ul>
        <div className="space-y-1 border-t border-ink-200 bg-paper px-4 py-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-ink-700">Subtotal</span>
            <span className="font-mono tabular-nums text-ink-900">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-ink-700">Sales tax (8.875%)</span>
            <span className="font-mono tabular-nums text-ink-900">${tax.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-ink-700">Tip (20%)</span>
            <span className="font-mono tabular-nums text-ink-900">${tip.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-ink-700">Deposit applied</span>
            <span className="font-mono tabular-nums text-status-confirmed">−${deposit.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-ink-200 pt-2 text-base font-semibold">
            <span className="text-ink-900">Total charged</span>
            <span className="font-mono tabular-nums text-brand">${total.toFixed(2)}</span>
          </div>
        </div>
      </section>

      {/* Payment method */}
      <section className="rounded-2xl border border-ink-200 bg-white p-4">
        <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">Payment</div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm text-ink-900">Visa •• 4242</span>
          <span className="font-mono text-[10px] text-ink-500">{appt.date} · {appt.start}</span>
        </div>
        <div className="mt-1 font-mono text-[10px] text-ink-500">
          Auth code 5SP82-31FN0 · Reference {appt.id.toUpperCase()}
        </div>
      </section>

      {/* Rate moment (only if completed and no rating yet) */}
      {isCompleted && (
        <section className="rounded-2xl border border-gold/40 bg-gold-soft/30 p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-brand">
            ⭐ Rate your visit
          </div>
          <p className="mt-1 text-xs text-ink-700">
            One tap to leave {appt.staff?.split(" ")[0] || "your stylist"} a rating.
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink-300 hover:bg-gold/30 hover:text-gold"
                aria-label={`${n} stars`}
              >
                <Star className="h-4 w-4" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-ink-200 bg-white py-2.5 text-sm font-medium text-ink-900 hover:border-brand"
        >
          <Download className="h-3.5 w-3.5" /> PDF
        </button>
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-ink-200 bg-white py-2.5 text-sm font-medium text-ink-900 hover:border-brand"
        >
          <Mail className="h-3.5 w-3.5" /> Email
        </button>
      </div>

      <p className="text-center font-mono text-[10px] text-ink-500">
        💜 Thank you for visiting Jolieden
      </p>
    </div>
  );
}
