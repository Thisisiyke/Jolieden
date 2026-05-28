"use client";

// Combined stylist + time + confirm flow. Reads cart from Zustand, lets the
// viewer pick stylist + time slot, then creates a new Appointment in the
// store and routes to /me/.../bookings/[newId].
//
// Rebook path: when ?rebook=<apptId> is in the URL and the cart is empty,
// we synthesize a cart line from that appointment so the viewer can rebook
// the same look in one tap.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Clock, CheckCircle2, CreditCard, Apple, Shield } from "lucide-react";
import clsx from "clsx";
import { useStore } from "@/lib/store";
import {
  resolveClient,
  stylistByName,
} from "@/lib/personas";
import { STAFF, clientSlug as makeClientSlug, type Client } from "@/lib/data";
import { formatDuration, getService } from "@/lib/catalog";
import { getStyle } from "@/lib/gallery";

// ───────────────────── time slot generation ─────────────────────

const ADDR = "Jolieden · NYC";

function nextNDays(start: Date, n: number): { iso: string; label: string; dow: string }[] {
  const out: { iso: string; label: string; dow: string }[] = [];
  for (let i = 1; i <= n; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const dow = d.toLocaleDateString("en-US", { weekday: "short" });
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    out.push({ iso, label, dow });
  }
  return out;
}

const TIME_SLOTS = ["9:00am", "11:00am", "1:30pm", "4:00pm", "6:30pm"];

const endTime = (start: string, durationMin: number): string => {
  const m = start.match(/(\d+):(\d+)(am|pm)/i);
  if (!m) return start;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ap = m[3].toLowerCase();
  if (ap === "pm" && h !== 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  let total = h * 60 + min + durationMin;
  total = total % (24 * 60);
  let eh = Math.floor(total / 60);
  const em = total % 60;
  const eap = eh >= 12 ? "pm" : "am";
  if (eh === 0) eh = 12;
  else if (eh > 12) eh -= 12;
  return `${eh}:${em.toString().padStart(2, "0")}${eap}`;
};

// ───────────────────── component ─────────────────────

export default function CheckoutFlow() {
  const router = useRouter();
  const sp = useSearchParams();
  const asSlug = sp.get("as") || undefined;
  const rebookId = sp.get("rebook") || undefined;

  const cart = useStore((s) => s.cart);
  const setCart = useStore((s) => s.setCart);
  const addAppointment = useStore((s) => s.addAppointment);
  const upsertClient = useStore((s) => s.upsertClient);
  const resetCart = useStore((s) => s.resetCart);
  const appointmentsMap = useStore((s) => s.appointments);

  const clientFromAs = asSlug ? resolveClient(asSlug) : undefined;
  const dates = useMemo(() => nextNDays(new Date("2026-04-14"), 10), []);

  // Defaults. Cold-start fills with a fake "first-time" person; hot-start
  // fills with the actual client's contact details.
  const defaultFirst = clientFromAs?.firstName ?? "Sarah";
  const defaultLast = clientFromAs?.lastName ?? "Williams";
  const defaultPhone = clientFromAs?.phone ?? "(917) 555-0388";
  const defaultEmail = clientFromAs?.email ?? "sarah.w@example.com";

  const [firstName, setFirstName] = useState(defaultFirst);
  const [lastName, setLastName] = useState(defaultLast);
  const [phone, setPhone] = useState(defaultPhone);
  const [email, setEmail] = useState(defaultEmail);

  // Payment method (mock — wired in for visual completeness only).
  const [paymentMethod, setPaymentMethod] = useState<"card" | "apple" | "klarna" | "afterpay">(
    "card",
  );

  // Rebook hydration: if cart is empty + rebookId points to a real appointment,
  // synthesize a cart line from it.
  useEffect(() => {
    if (cart.lines.length > 0) return;
    if (!rebookId) return;
    const appt = appointmentsMap[rebookId];
    if (!appt) return;
    // Try to find a style or service to seed from.
    const serviceSlugFromAppt = guessServiceSlug(appt.service);
    const svc = serviceSlugFromAppt ? getService(serviceSlugFromAppt) : undefined;
    const lineId = `line-${Date.now()}`;
    const stylistSlug = stylistByName(appt.staff)?.slug;
    setCart({
      id: `cart-${Date.now()}`,
      clientSlug: asSlug,
      lines: [
        {
          id: lineId,
          serviceSlug: serviceSlugFromAppt ?? "silk-press",
          serviceName: appt.service ?? svc?.name ?? "Visit",
          basePrice: svc?.basePrice ?? appt.price ?? 0,
          baseDurationMin: svc?.baseDurationMin ?? 60,
          modifierChoices: {},
          addOnIds: [],
          stylistSlug,
          computedPrice: appt.price ?? svc?.basePrice ?? 0,
          computedDurationMin: svc?.baseDurationMin ?? 60,
        },
      ],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rebookId]);

  // First cart line drives the booking (we currently support single-line carts).
  const line = cart.lines[0];

  // Stylist + time pick state.
  const [stylistSlugSel, setStylistSlugSel] = useState<string | undefined>(line?.stylistSlug);
  useEffect(() => {
    if (line?.stylistSlug && !stylistSlugSel) setStylistSlugSel(line.stylistSlug);
  }, [line?.stylistSlug, stylistSlugSel]);

  const [dateISO, setDateISO] = useState<string>(dates[0]?.iso ?? "");
  const [time, setTime] = useState<string>("11:00am");

  // Empty-cart fallback.
  if (!line) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <div className="font-mono text-[11px] uppercase tracking-wider text-ink-500">Your cart is empty</div>
        <h1 className="mt-2 font-serif text-2xl font-semibold text-brand">Pick a look first</h1>
        <p className="mt-2 text-sm text-ink-700">
          Browse the gallery and tap any style — your cart auto-fills with that look.
        </p>
        <Link
          href="/book"
          className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Browse styles
        </Link>
      </div>
    );
  }

  const eligible = STAFF.filter((s) => s.id !== "s9"); // owner isn't booked through gallery
  const selectedStylist = STAFF.find((s) => s.slug === stylistSlugSel) ?? eligible[0];

  const confirm = () => {
    // Build or reuse a Client record.
    let client: Client | undefined = clientFromAs;
    if (!client) {
      const slug = makeClientSlug(firstName, lastName);
      client = {
        id: `cl${Date.now()}`,
        slug,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        emailOptIn: true,
        textOptIn: true,
        visits: 0,
        totalSpend: 0,
        tags: ["New"],
        referralSource: "Instagram",
      };
      upsertClient(client);
    }

    const apptId = `n${Date.now()}`;
    const durationMin = line.computedDurationMin;
    addAppointment({
      id: apptId,
      date: dateISO,
      client: `${client.firstName} ${client.lastName}`,
      pronouns: undefined,
      phone: client.phone,
      start: time,
      end: endTime(time, durationMin),
      service: line.serviceName,
      serviceDetail: serviceDetailFromLine(line),
      staff: selectedStylist?.name,
      price: line.computedPrice,
      status: "confirmed",
      isNewClient: client.visits === 0,
      bookedBy: `${client.firstName} ${client.lastName.charAt(0)}.`,
      bookedAt: "Just now",
      tags: client.tags,
    });
    resetCart();
    router.push(`/me/${client.slug}/bookings/${apptId}`);
  };

  const style = line.styleSlug ? getStyle(line.styleSlug) : undefined;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-8">
      {/* Cart summary */}
      <div className="rounded-2xl border border-ink-200 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">Your look</div>
            <h1 className="mt-1 font-serif text-xl font-semibold text-brand">
              {style?.name ?? line.serviceName}
            </h1>
            {style && (
              <p className="mt-0.5 text-xs text-ink-500">{line.serviceName}</p>
            )}
            <p className="mt-1 font-mono text-[10px] text-ink-500">
              {formatDuration(line.computedDurationMin)} · ${line.computedPrice}
            </p>
          </div>
          <Link href="/book" className="font-mono text-[10px] uppercase tracking-wider text-ink-500 hover:text-brand">
            Change
          </Link>
        </div>
      </div>

      {/* Stylist picker */}
      <section className="mt-6 rounded-2xl border border-ink-200 bg-white p-5">
        <h2 className="text-base font-semibold text-ink-900">Choose your stylist</h2>
        <p className="mt-1 text-xs text-ink-500">
          {line.stylistSlug ? "Pre-selected based on this look — change if you have someone else in mind." : "First available is the default; pick a preferred stylist if you have one."}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {eligible.map((s) => {
            const selected = s.slug === stylistSlugSel;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setStylistSlugSel(s.slug)}
                className={clsx(
                  "flex flex-col items-start rounded-lg border p-3 text-left transition-colors",
                  selected ? "border-brand bg-brand/5" : "border-ink-200 bg-white hover:border-brand",
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                    style={{ background: s.color }}
                  >
                    {s.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                  <span className="text-sm font-medium text-ink-900">{s.name}</span>
                </div>
                <span className="mt-1 font-mono text-[10px] uppercase tracking-wider text-ink-500">
                  {s.specialty || s.role}
                </span>
                {selected && (
                  <span className="mt-1 flex items-center gap-1 text-[10px] font-medium text-brand">
                    <CheckCircle2 className="h-3 w-3" /> Selected
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Time picker */}
      <section className="mt-6 rounded-2xl border border-ink-200 bg-white p-5">
        <h2 className="text-base font-semibold text-ink-900">Pick a time</h2>
        <p className="mt-1 text-xs text-ink-500">
          Next 10 days at Jolieden NYC. Slots are pre-built for the demo.
        </p>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
          {dates.map((d) => {
            const active = d.iso === dateISO;
            return (
              <button
                key={d.iso}
                type="button"
                onClick={() => setDateISO(d.iso)}
                className={clsx(
                  "flex shrink-0 flex-col items-center rounded-md border px-3 py-1.5 transition-colors",
                  active ? "border-brand bg-brand text-white" : "border-ink-200 bg-white text-ink-700 hover:border-brand",
                )}
              >
                <span className="font-mono text-[10px] uppercase tracking-wider">{d.dow}</span>
                <span className="text-sm font-semibold">{d.label}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {TIME_SLOTS.map((t) => {
            const active = t === time;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTime(t)}
                className={clsx(
                  "rounded-md border py-2 text-sm font-medium transition-colors",
                  active ? "border-brand bg-brand text-white" : "border-ink-200 bg-white text-ink-700 hover:border-brand",
                )}
              >
                {t}
              </button>
            );
          })}
        </div>
      </section>

      {/* Contact */}
      <section className="mt-6 rounded-2xl border border-ink-200 bg-white p-5">
        <h2 className="text-base font-semibold text-ink-900">Almost done, {firstName}</h2>
        <p className="mt-1 text-xs text-ink-500">
          {clientFromAs ? "Confirm your details below." : "We'll text you a reminder 24 hours before."}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-ink-500">First</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-ink-500">Last</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-ink-500">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-ink-500">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Payment */}
      <section className="mt-6 space-y-3 rounded-2xl border border-ink-200 bg-white p-5">
        <h2 className="text-base font-semibold text-ink-900">Payment</h2>
        <p className="text-xs text-ink-500">
          A <strong className="text-ink-900">$25 deposit</strong> holds your spot. Applied at checkout, fully refundable if you cancel 48h+ in advance.
        </p>
        <div className="space-y-2">
          {[
            {
              id: "card" as const,
              label: "Visa •• 4242",
              sub: "Card on file",
              icon: <CreditCard className="h-4 w-4" />,
            },
            {
              id: "apple" as const,
              label: "Apple Pay",
              sub: "Touch ID at checkout",
              icon: <Apple className="h-4 w-4" />,
            },
            {
              id: "klarna" as const,
              label: "Klarna · 4 payments",
              sub: `4 × $${Math.round(line.computedPrice / 4)}, no interest`,
              icon: <span className="font-mono text-[10px] font-semibold">K</span>,
            },
            {
              id: "afterpay" as const,
              label: "Afterpay · 4 payments",
              sub: `4 × $${Math.round(line.computedPrice / 4)}, no interest`,
              icon: <span className="font-mono text-[10px] font-semibold">A</span>,
            },
          ].map((opt) => {
            const active = paymentMethod === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPaymentMethod(opt.id)}
                className={clsx(
                  "flex w-full items-center gap-3 rounded-md border p-3 text-left transition-colors",
                  active
                    ? "border-brand bg-brand/5"
                    : "border-ink-200 bg-white hover:border-brand",
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper text-ink-700">
                  {opt.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-ink-900">{opt.label}</div>
                  <div className="text-xs text-ink-500">{opt.sub}</div>
                </div>
                {active && <CheckCircle2 className="h-4 w-4 text-brand" />}
              </button>
            );
          })}
        </div>
        <div className="flex items-start gap-2 rounded-md border border-ink-200 bg-paper p-3 text-xs text-ink-700">
          <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
          Payments processed by Stripe. We never see your card number.
        </div>
      </section>

      {/* Summary + Confirm */}
      <section className="sticky bottom-0 mt-6 -mx-4 border-t border-ink-200 bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
              {dateISO} · {time}
            </div>
            <div className="text-sm font-medium text-ink-900">
              {selectedStylist?.name} · {ADDR}
            </div>
            <div className="font-mono text-[10px] text-ink-500">{formatDuration(line.computedDurationMin)}</div>
          </div>
          <button
            type="button"
            onClick={confirm}
            className="flex items-center gap-1.5 rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Confirm · ${line.computedPrice}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 flex items-center gap-1 font-mono text-[10px] text-ink-500">
          <Clock className="h-3 w-3" /> We hold your time for 30 minutes after you confirm.
        </p>
      </section>
    </div>
  );
}

// Heuristic: try to map a free-form appointment.service string to a catalog
// service slug. Falls back to undefined if no obvious match.
function guessServiceSlug(serviceName?: string): string | undefined {
  if (!serviceName) return undefined;
  const lower = serviceName.toLowerCase();
  if (lower.includes("xs knotless")) return "xs-knotless-braids";
  if (lower.includes("small knotless")) return "small-knotless-braids";
  if (lower.includes("medium knotless")) return "medium-knotless-braids";
  if (lower.includes("large knotless")) return "large-knotless";
  if (lower.includes("boho knotless")) return "boho-knotless";
  if (lower.includes("silk press")) return "silk-press";
  if (lower.includes("wash")) return "wash-and-style";
  if (lower.includes("twist out")) return "twist-out-set";
  if (lower.includes("color")) return "color-refresh";
  if (lower.includes("balayage")) return "honey-balayage";
  if (lower.includes("trim")) return "trim";
  if (lower.includes("conditioning")) return "deep-conditioning";
  return undefined;
}

function serviceDetailFromLine(line: { modifierChoices: Record<string, string>; addOnIds: string[] }): string | undefined {
  const parts: string[] = [];
  for (const v of Object.values(line.modifierChoices)) parts.push(v);
  for (const a of line.addOnIds) parts.push(a);
  return parts.length ? parts.join(", ") : undefined;
}
