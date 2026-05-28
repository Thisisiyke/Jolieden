import { notFound } from "next/navigation";
import {
  ChevronRight,
  Pencil,
  Camera,
  LogOut,
  DollarSign,
  TrendingUp,
  Calendar as CalendarIcon,
  ShieldCheck,
} from "lucide-react";
import { resolveStylist, appointmentsForStylist } from "@/lib/personas";
import { TODAY } from "@/lib/data";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="px-1 pb-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-500">
        {title}
      </h2>
      <div className="overflow-hidden rounded-xl border border-ink-200 bg-white">{children}</div>
    </section>
  );
}

function Row({
  label,
  value,
  href,
  trailing,
}: {
  label: string;
  value?: string;
  href?: string;
  trailing?: React.ReactNode;
}) {
  const body = (
    <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
      <span className="text-ink-900">{label}</span>
      <div className="flex shrink-0 items-center gap-1 text-ink-500">
        {value && <span className="truncate">{value}</span>}
        {trailing}
        {href && <ChevronRight className="h-4 w-4 text-ink-300" />}
      </div>
    </div>
  );
  const inner = href ? (
    <a href={href} className="block hover:bg-paper">
      {body}
    </a>
  ) : (
    body
  );
  return <div className="border-b border-ink-200 last:border-b-0">{inner}</div>;
}

function Metric({ icon: Icon, label, value }: { icon: typeof DollarSign; label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col gap-1 rounded-xl border border-ink-200 bg-white p-3">
      <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-ink-500">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="font-serif text-xl font-semibold text-brand">{value}</div>
    </div>
  );
}

export default async function StylistProfilePage({
  params,
}: {
  params: Promise<{ stylistSlug: string }>;
}) {
  const { stylistSlug } = await params;
  const stylist = resolveStylist(stylistSlug);
  if (!stylist) notFound();

  const myAppts = appointmentsForStylist(stylistSlug);
  const completedToday = myAppts.filter((a) => a.date === TODAY && a.status === "completed");
  const today = completedToday.reduce((acc, a) => acc + (a.price ?? 0), 0);
  const monthTotal = myAppts
    .filter((a) => a.date.startsWith("2026-04") && a.status === "completed")
    .reduce((acc, a) => acc + (a.price ?? 0), 0);

  const initials = stylist.name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-5 px-4 py-5">
      <header>
        <h1 className="font-serif text-[28px] font-semibold leading-tight text-ink-900">Profile</h1>
      </header>

      {/* Hero */}
      <section className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-white p-4">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full text-base font-semibold text-white"
          style={{ background: stylist.color }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-semibold text-ink-900">{stylist.name}</div>
          <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-500">
            {stylist.specialty || stylist.role}
            {stylist.yearsAtSalon ? ` · ${stylist.yearsAtSalon} yr` : ""}
          </div>
        </div>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-paper text-brand hover:bg-brand-50"
          aria-label="Edit"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </section>

      {/* Earnings */}
      <section>
        <h2 className="px-1 pb-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-500">
          Earnings
        </h2>
        <div className="flex gap-2">
          <Metric icon={DollarSign} label="Today" value={`$${today}`} />
          <Metric icon={TrendingUp} label="MTD" value={`$${monthTotal}`} />
          <Metric icon={CalendarIcon} label="Bookings" value={String(myAppts.length)} />
        </div>
      </section>

      {/* Bio */}
      {stylist.bio && (
        <section>
          <h2 className="px-1 pb-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-500">
            About
          </h2>
          <div className="rounded-xl border border-ink-200 bg-white p-4 text-sm leading-relaxed text-ink-700">
            {stylist.bio}
          </div>
        </section>
      )}

      {/* Specialties */}
      <Section title="Specialties shown to clients on /book">
        <Row label="Headline specialty" value={stylist.specialty || "—"} href="#" />
        <Row label="Years at Jolieden" value={stylist.yearsAtSalon ? `${stylist.yearsAtSalon}` : "—"} href="#" />
        <Row label="Instagram" value={stylist.instagram ? `@${stylist.instagram}` : "Not set"} href="#" />
        <Row label="Cover photo" trailing={<Camera className="h-3.5 w-3.5 text-ink-400" />} href="#" />
      </Section>

      <Section title="Schedule">
        <Row label="Working hours" value="Mon–Sat · 9am – 7pm" href="#" />
        <Row label="Time off" value="None scheduled" href="#" />
        <Row label="Notification preferences" value="Push + SMS" href="#" />
      </Section>

      <Section title="Account">
        <Row label="Permissions" trailing={<ShieldCheck className="h-3.5 w-3.5 text-ink-400" />} href="#" />
        <Row label="Help & support" href="#" />
        <div className="border-b border-ink-200 last:border-b-0">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-sm text-status-pending hover:bg-paper"
          >
            <span>Sign out</span>
            <LogOut className="h-4 w-4 opacity-70" />
          </button>
        </div>
      </Section>

      <p className="pt-2 text-center font-mono text-[10px] text-ink-500">
        Jolieden Stylist · v0.9
      </p>
    </div>
  );
}
