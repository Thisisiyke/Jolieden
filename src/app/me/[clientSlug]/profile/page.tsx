import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Pencil, CreditCard, Gift, LogOut, ShieldCheck, Trophy, Users, Heart, Wallet, FileSignature, Crown } from "lucide-react";
import { resolveClient, resolveStylist } from "@/lib/personas";
import { TODAY } from "@/lib/data";
import { pointsFor, tierFor } from "@/lib/rewards";
import LanguageToggle from "@/components/me/LanguageToggle";

function Avatar({ name, hue }: { name: string; hue?: number }) {
  const h = hue ?? 320;
  const init = name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div
      className="flex h-14 w-14 items-center justify-center rounded-full text-base font-semibold text-white"
      style={{
        background: `linear-gradient(135deg, hsl(${h}, 55%, 38%), hsl(${(h + 30) % 360}, 60%, 50%))`,
      }}
    >
      {init}
    </div>
  );
}

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
  divider = true,
  trailing,
}: {
  label: string;
  value?: string;
  href?: string;
  divider?: boolean;
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
    <Link href={href} className="block hover:bg-paper">
      {body}
    </Link>
  ) : (
    body
  );
  return (
    <div className={divider ? "border-b border-ink-200 last:border-b-0" : ""}>{inner}</div>
  );
}

function ToggleRow({ label, hint, on }: { label: string; hint?: string; on: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-ink-200 px-4 py-3 last:border-b-0">
      <div className="min-w-0">
        <div className="text-sm text-ink-900">{label}</div>
        {hint && <div className="mt-0.5 text-xs text-ink-500">{hint}</div>}
      </div>
      <div
        aria-checked={on}
        role="switch"
        className={
          "relative h-7 w-12 shrink-0 rounded-full transition-colors " +
          (on ? "bg-status-confirmed" : "bg-ink-200")
        }
      >
        <span
          className={
            "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform " +
            (on ? "translate-x-[22px]" : "translate-x-0.5")
          }
        />
      </div>
    </div>
  );
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;
  const client = resolveClient(clientSlug);
  if (!client) notFound();

  const preferred = client.preferredStylistSlug
    ? resolveStylist(client.preferredStylistSlug)
    : undefined;
  const memberSince = client.lastVisit
    ? new Date(client.lastVisit).getFullYear()
    : new Date(TODAY).getFullYear();
  const points = pointsFor(client);
  const tier = tierFor(client);

  return (
    <div className="space-y-5 px-4 py-5">
      {/* Big-title nav */}
      <header>
        <h1 className="font-serif text-[28px] font-semibold leading-tight text-ink-900">Profile</h1>
      </header>

      {/* Hero card */}
      <section className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-white p-4">
        <Avatar name={`${client.firstName} ${client.lastName}`} hue={client.avatarHue} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-semibold text-ink-900">
            {client.firstName} {client.lastName}
          </div>
          <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-500">
            {client.membership ? `${client.membership} member` : "Guest member"} · since {memberSince}
          </div>
        </div>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-paper text-brand hover:bg-brand-50"
          aria-label="Edit profile"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </section>

      {/* Rewards & membership */}
      <Section title="Rewards & membership">
        <Row
          label={`${tier} member`}
          value={`${points.toLocaleString("en-US")} pts`}
          href={`/me/${client.slug}/rewards`}
          trailing={<Trophy className="h-3.5 w-3.5 text-gold" />}
        />
        <Row
          label="Membership tier"
          href={`/me/${client.slug}/membership`}
          trailing={<Crown className="h-3.5 w-3.5 text-ink-400" />}
        />
        <Row
          label="Refer a friend"
          value="+100 pts each"
          href={`/me/${client.slug}/referrals`}
          trailing={<Users className="h-3.5 w-3.5 text-ink-400" />}
        />
        <Row
          label="Saved styles"
          href={`/me/${client.slug}/wishlist`}
          trailing={<Heart className="h-3.5 w-3.5 text-ink-400" />}
        />
      </Section>

      {/* Contact */}
      <Section title="Contact">
        <Row label="Phone" value={client.phone} href="#" />
        <Row label="Email" value={client.email} href="#" />
        <Row
          label="Pronouns"
          value="She/Her"
          href="#"
          divider={false}
        />
      </Section>

      {/* Preferences */}
      <Section title="Style preferences">
        <Row
          label="Preferred stylist"
          value={preferred ? preferred.name : "No preference"}
          href="#"
        />
        <Row label="Hair texture" value="4B / 4C" href="#" />
        <Row label="Scalp accommodations" value="None" href="#" />
        <Row label="Allergies" value="None on file" href="#" divider={false} />
      </Section>

      {/* Reminders */}
      <Section title="Notifications">
        <ToggleRow
          label="Appointment reminders"
          hint="Text 24h before each visit"
          on={client.textOptIn}
        />
        <ToggleRow
          label="Marketing emails"
          hint="New looks, offers, events"
          on={client.emailOptIn}
        />
        <ToggleRow
          label="Birthday surprises"
          hint="Unlock comp services around your birthday"
          on
        />
      </Section>

      {/* Payment */}
      <Section title="Payment">
        <Row
          label="Saved card"
          value="Visa •• 4242"
          href="#"
          trailing={<CreditCard className="h-3.5 w-3.5 text-ink-400" />}
        />
        <Row label="Apple Pay" value="Set up" href="#" />
        <Row
          label="Gift cards"
          href={`/me/${client.slug}/gift-cards`}
          trailing={<Gift className="h-3.5 w-3.5 text-ink-400" />}
        />
        <Row
          label="Account credit"
          href={`/me/${client.slug}/credit`}
          trailing={<Wallet className="h-3.5 w-3.5 text-ink-400" />}
        />
      </Section>

      {/* Forms */}
      <Section title="Forms & consent">
        <Row
          label="Intake form"
          value="On file"
          href={`/me/${client.slug}/intake`}
          trailing={<FileSignature className="h-3.5 w-3.5 text-ink-400" />}
        />
      </Section>

      {/* Language */}
      <Section title="Language">
        <LanguageToggle clientSlug={client.slug} />
      </Section>

      {/* Privacy + account */}
      <Section title="Account">
        <Row label="Privacy" href="#" trailing={<ShieldCheck className="h-3.5 w-3.5 text-ink-400" />} />
        <Row
          label="Report a service issue"
          value="Free fix"
          href={`/me/${client.slug}/report-issue`}
        />
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
        Jolieden · v0.9
      </p>
    </div>
  );
}
