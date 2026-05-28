"use client";

// Client-side actions bar for the operator's client profile page (server
// component). Manages drawer state for the "Invite to app" SMS flow and
// surfaces the primary contact CTAs (call + email) consistently.

import { useState } from "react";
import { Phone, Mail, Send } from "lucide-react";
import type { Client } from "../../lib/data";
import InviteToAppDrawer from "./InviteToAppDrawer";

export default function ClientActions({ client }: { client: Client }) {
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={`tel:${client.phone}`}
          className="inline-flex items-center gap-1.5 rounded-md border border-ink-300 bg-white px-3 py-1.5 text-[13px] font-medium text-ink-700 hover:bg-ink-50"
        >
          <Phone className="h-3.5 w-3.5" /> Call
        </a>
        {client.email && (
          <a
            href={`mailto:${client.email}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-ink-300 bg-white px-3 py-1.5 text-[13px] font-medium text-ink-700 hover:bg-ink-50"
          >
            <Mail className="h-3.5 w-3.5" /> Email
          </a>
        )}
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-brand-700"
        >
          <Send className="h-3.5 w-3.5" /> Invite to app
        </button>
      </div>
      <InviteToAppDrawer
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        client={client}
      />
    </>
  );
}
