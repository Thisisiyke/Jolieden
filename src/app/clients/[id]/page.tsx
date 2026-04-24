import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Mail, MessageCircle, Phone } from "lucide-react";
import { CLIENTS } from "../../../lib/data";
import { Avatar } from "../../../components/Avatar";

export default async function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = CLIENTS.find((x) => x.id === id);
  if (!c) notFound();

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto bg-ink-50">
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <Link href="/clients" className="text-[12px] text-ink-500 hover:text-brand inline-flex items-center gap-1">
          <ChevronLeft className="h-3.5 w-3.5" /> All clients
        </Link>

        {/* Profile header */}
        <div className="rounded-lg border border-ink-200 bg-white p-5 flex items-center gap-4">
          <Avatar name={`${c.firstName} ${c.lastName}`} hue={c.avatarHue} size={64} />
          <div className="flex-1 min-w-0">
            <div className="text-[20px] font-semibold text-ink-900">
              {c.firstName} {c.lastName}
            </div>
            <div className="text-[13px] text-ink-500 flex items-center gap-3 mt-1 flex-wrap">
              <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{c.phone}</span>
              <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{c.email}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className={"rounded-full px-2 py-0.5 text-[10px] font-semibold inline-flex items-center gap-1 " + (c.emailOptIn ? "bg-brand text-white" : "bg-ink-100 text-ink-500")}>
                <Mail className="h-3 w-3" /> Email {c.emailOptIn ? "opt-in" : "opt-out"}
              </span>
              <span className={"rounded-full px-2 py-0.5 text-[10px] font-semibold inline-flex items-center gap-1 " + (c.textOptIn ? "bg-brand text-white" : "bg-ink-100 text-ink-500")}>
                <MessageCircle className="h-3 w-3" /> Text {c.textOptIn ? "opt-in" : "opt-out"}
              </span>
              {c.membership && c.membership !== "None" && (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-brand-100 text-brand">
                  {c.membership} member
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-4">
          <Stat label="Total visits" value={String(c.visits)} />
          <Stat label="Total spend" value={`$${c.totalSpend.toLocaleString()}`} />
          <Stat label="Last visit" value={c.lastVisit ?? "—"} />
          <Stat label="Referral" value={c.referralSource ?? "—"} />
        </div>

        {/* Placeholder sub-sections */}
        <div className="rounded-lg border border-ink-200 bg-white p-5">
          <div className="text-[14px] font-semibold text-ink-900 mb-2">Profile sections</div>
          <div className="text-[12px] text-ink-500">
            Appointments history, sales, notes, forms, memberships, gift cards,
            and family/household links will live here. This is a prototype
            placeholder — wire in the real data whenever you&apos;re ready.
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink-200 bg-white p-4">
      <div className="text-[11px] uppercase tracking-wide text-ink-500 font-semibold">
        {label}
      </div>
      <div className="text-[18px] font-semibold text-ink-900 mt-1">{value}</div>
    </div>
  );
}
