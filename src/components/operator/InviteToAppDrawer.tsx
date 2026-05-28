"use client";

// Front-desk → app conversion flow. The operator opens this from the
// AppointmentPopover (calendar quick-actions) or the client profile page;
// the drawer shows an iMessage-style preview of the SMS we'll send, with
// a tappable deep link to the client's /me home so they can track the
// booking, earn rewards, and unlock birthday perks. Sends are mocked here
// (a toast); production routes through Twilio Conversations using the
// same number the AI Concierge replies on, so the client's whole salon
// conversation stays in one thread.
//
// Two contexts: a "confirmation" variant (when called from an existing
// appointment) and a "welcome" variant (when called from a client profile
// with no immediate appointment). Both end at jolieden.app/me/{slug} —
// production replaces with a one-time signed magic link.

import { useMemo, useState } from "react";
import { Send, Check, MessageSquare, Smartphone, RotateCcw } from "lucide-react";
import { Drawer } from "../Drawer";
import type { Appointment, Client } from "../../lib/data";

type Variant = "confirmation" | "welcome";

function defaultMessage(
  variant: Variant,
  client: Client,
  appt?: Appointment,
): string {
  const link = `jolieden.app/me/${client.slug}`;
  if (variant === "confirmation" && appt) {
    const when = `${appt.date} at ${appt.start}`;
    const withStylist = appt.staff ? ` with ${appt.staff}` : "";
    return [
      `Hi ${client.firstName}! 💜 Your ${appt.service ?? "appointment"}${withStylist} is set for ${when}.`,
      `Track it, earn rewards & unlock birthday perks in the app: ${link}`,
      `— Jolieden`,
    ].join("\n\n");
  }
  return [
    `Hi ${client.firstName}! 💜 Welcome to Jolieden.`,
    `Track visits, earn rewards & unlock birthday perks in the app: jolieden.app/me/${client.slug}`,
    `— Jolieden`,
  ].join("\n\n");
}

function formatPhone(p: string): string {
  // Keep as-entered; just ensure it's not undefined.
  return p?.trim() || "";
}

export default function InviteToAppDrawer({
  open,
  onClose,
  client,
  appt,
}: {
  open: boolean;
  onClose: () => void;
  client: Client;
  appt?: Appointment;
}) {
  const variant: Variant = appt ? "confirmation" : "welcome";
  const initial = useMemo(
    () => defaultMessage(variant, client, appt),
    [variant, client, appt],
  );
  const [message, setMessage] = useState(initial);
  const [edited, setEdited] = useState(false);
  const [sent, setSent] = useState(false);

  // When the variant/client changes, refresh the default message unless the
  // operator has edited it.
  if (!edited && message !== initial && !sent) {
    setMessage(initial);
  }

  const closeAndReset = () => {
    onClose();
    // Reset after the close animation so re-opening starts clean.
    window.setTimeout(() => {
      setSent(false);
      setEdited(false);
      setMessage(initial);
    }, 200);
  };

  const send = () => {
    setSent(true);
    // In production this hits POST /api/operator/messages — Twilio sends
    // the SMS as the salon's number, which is the same line the AI
    // Concierge replies on (one thread per client). Mocked here.
    window.setTimeout(closeAndReset, 1500);
  };

  const phone = formatPhone(client.phone);
  const hasOptedOutText = client.textOptIn === false;

  return (
    <Drawer
      open={open}
      onClose={closeAndReset}
      title={
        variant === "confirmation"
          ? "Send confirmation + app invite"
          : "Invite to the app"
      }
      width="max-w-md"
      footer={
        sent ? (
          <div className="flex items-center justify-center gap-2 text-[13px] font-semibold text-status-confirmed">
            <Check className="h-4 w-4" />
            Sent to {phone}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={closeAndReset}
              className="h-10 px-4 rounded-md text-[13px] font-medium text-ink-700 hover:bg-ink-100"
            >
              Cancel
            </button>
            <button
              onClick={send}
              disabled={!phone || hasOptedOutText}
              className="h-10 px-4 rounded-md bg-brand text-white text-[13px] font-semibold hover:bg-brand-700 disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              Send SMS
            </button>
          </div>
        )
      }
    >
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Recipient row */}
        <section className="rounded-lg border border-ink-200 bg-paper-mute p-3">
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Send to
          </div>
          <div className="mt-0.5 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[14px] font-semibold text-ink-900 truncate">
                {client.firstName} {client.lastName}
              </div>
              <div className="font-mono text-[11px] text-ink-700">{phone}</div>
            </div>
            {hasOptedOutText ? (
              <span className="shrink-0 rounded-full bg-ink-100 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-500">
                Text opted-out
              </span>
            ) : (
              <span className="shrink-0 rounded-full bg-status-confirmed/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-status-confirmed">
                Text opt-in
              </span>
            )}
          </div>
        </section>

        {/* Phone-style SMS preview */}
        <section>
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-500">
            <Smartphone className="h-3 w-3" /> Preview · what they&apos;ll see
          </div>
          <div className="mt-2 rounded-2xl border border-ink-200 bg-ink-50 p-4">
            {/* iMessage-style header */}
            <div className="mb-3 text-center">
              <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
                Jolieden · +1 (646) 555 0100
              </div>
            </div>
            {/* Bubble */}
            <div className="flex justify-start">
              <div className="max-w-[260px] rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-ink-900 shadow-sm whitespace-pre-line">
                {message}
              </div>
            </div>
            <div className="mt-1.5 pl-1 font-mono text-[10px] text-ink-500">
              Delivered · in-app
            </div>
          </div>
        </section>

        {/* Editable message */}
        <section>
          <div className="flex items-center justify-between">
            <label className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
              <MessageSquare className="mr-0.5 inline h-3 w-3" /> Message
            </label>
            {edited && (
              <button
                type="button"
                onClick={() => {
                  setMessage(initial);
                  setEdited(false);
                }}
                className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-ink-500 hover:text-brand"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            )}
          </div>
          <textarea
            value={message}
            onChange={(e) => {
              setEdited(true);
              setMessage(e.target.value);
            }}
            rows={6}
            className="mt-1 w-full resize-none rounded-md border border-ink-200 bg-white px-3 py-2 text-[13px] focus:border-brand focus:outline-none"
          />
          <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-ink-500">
            <span>{message.length} chars · ~{Math.ceil(message.length / 160)} segment{Math.ceil(message.length / 160) === 1 ? "" : "s"}</span>
            <span>Replies route to the AI Concierge thread</span>
          </div>
        </section>

        {hasOptedOutText && (
          <section className="rounded-lg border border-status-pending/30 bg-status-pending/5 p-3 text-[12px] text-ink-700">
            <strong className="text-ink-900">{client.firstName} has opted out of SMS marketing.</strong>{" "}
            Confirmations and account-related texts (TCPA transactional)
            still go through, but a marketing-style app invite shouldn&apos;t.
            Ask in person before sending.
          </section>
        )}
      </div>
    </Drawer>
  );
}
