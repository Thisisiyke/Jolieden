"use client";

// Demo hub — the prototype's table of contents. Tabbed by surface.
// Every cast persona has at least one entry tile per surface they appear in,
// so stakeholders can land on /demo and reach every scenario in one tap.

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Globe,
  Smartphone,
  Scissors,
  ArrowRight,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import {
  getOwner,
  getCastStylists,
  getCastClient,
  resolveStylist,
  type CastStylistSlug,
} from "@/lib/personas";
import type { Client, Stylist } from "@/lib/data";

// ───────────────────── tab definitions ─────────────────────

type SurfaceTab = {
  id: "operator" | "book" | "me" | "pro";
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
};

const TABS: SurfaceTab[] = [
  {
    id: "operator",
    label: "Operator app",
    description: "The salon's daily tool: kanban, calendar, messages, sales. Built; this is what runs the floor.",
    icon: LayoutDashboard,
  },
  {
    id: "book",
    label: "Client booking",
    description: "Replaces the Boulevard widget behind 'Book Now' on joliedensbeautybar.com. Photo-first.",
    icon: Globe,
  },
  {
    id: "me",
    label: "Client app",
    description: "Mobile companion for returning clients — bookings, hair journey, wishlist, birthday surprises.",
    icon: Smartphone,
  },
  {
    id: "pro",
    label: "Stylist app",
    description: "Mobile app stylists use mid-service — schedule, client notes, before/after capture, AI takeover.",
    icon: Scissors,
  },
];

// ───────────────────── tile types ─────────────────────

type Tile = {
  href: string;
  persona?: { name: string; role: string; avatarHue?: number };
  badge?: { label: string; tone: "cold" | "hot" | "operator" | "birthday" };
  title: string;
  description: string;
};

const operatorTiles = (owner: Stylist | undefined): Tile[] => [
  {
    href: "/",
    persona: owner && { name: owner.name, role: owner.role, avatarHue: 343 },
    badge: { label: "Operator view", tone: "operator" },
    title: "Front Desk — today's kanban",
    description: "Diéssou opens the salon. Today's unconfirmed, arrived, and active clients in one board.",
  },
  {
    href: "/calendar",
    badge: { label: "Operator view", tone: "operator" },
    title: "Calendar — staff schedule",
    description: "Day/week grid of every stylist's bookings. Drag to reschedule.",
  },
  {
    href: "/messages",
    badge: { label: "Operator view", tone: "operator" },
    title: "Messages — AI + human threads",
    description: "Two-way SMS with clients. AI Concierge handles routine asks; staff jumps in when escalated.",
  },
  {
    href: "/sales",
    badge: { label: "Operator view", tone: "operator" },
    title: "Sales — today's orders",
    description: "Open tickets, completed checkouts, gift cards, memberships, register.",
  },
  {
    href: "/clients",
    badge: { label: "Operator view", tone: "operator" },
    title: "Clients — full database",
    description: "Search, tag, audience-build, merge duplicates. 40+ seeded clients to demo.",
  },
  {
    href: "/manage",
    badge: { label: "Operator view", tone: "operator" },
    title: "Manage — staff, services, hardware",
    description: "Day-to-day admin: staff schedules, service catalog, iPad kiosk, payment processing.",
  },
];

const bookTiles = (clients: { coldStart?: Client; loyalist?: Client; birthday?: Client }): Tile[] => {
  const out: Tile[] = [];
  if (clients.coldStart) {
    out.push({
      href: `/book`,
      persona: { name: clients.coldStart.firstName + " " + clients.coldStart.lastName, role: "First-time on the new booking site", avatarHue: clients.coldStart.avatarHue },
      badge: { label: "Cold start", tone: "cold" },
      title: "Imani's first booking",
      description: "She lands from the website's Book Now. Nothing saved. Browses the photo gallery, picks a knotless look, walks the modifiers, books.",
    });
  }
  if (clients.loyalist) {
    out.push({
      href: `/book?as=${clients.loyalist.slug}`,
      persona: { name: clients.loyalist.firstName + " " + clients.loyalist.lastName, role: "Loyalist — rebooks every 8 wks", avatarHue: clients.loyalist.avatarHue },
      badge: { label: "Hot start", tone: "hot" },
      title: "Aaliyah rebooks her usual",
      description: "Returning client. Sees 'Rebook your last knotless' as a one-tap shortcut. Same stylist (Oumou), same look, faster checkout.",
    });
  }
  if (clients.birthday) {
    out.push({
      href: `/book?as=${clients.birthday.slug}`,
      persona: { name: clients.birthday.firstName + " " + clients.birthday.lastName, role: "Birthday in 4 days", avatarHue: clients.birthday.avatarHue },
      badge: { label: "Birthday", tone: "birthday" },
      title: "Naomi books her birthday refresh",
      description: "Birthday is April 18. Booking flow surfaces a 'Treat yourself' module + comp add-on; check-in will fire the in-house celebration.",
    });
  }
  out.push({
    href: "/book",
    badge: { label: "Browse", tone: "cold" },
    title: "Anonymous — just browsing",
    description: "Visitor without intent yet. Explore the gallery, filter by category, see prices. Identify only at checkout.",
  });
  return out;
};

const meTiles = (clients: { coldStart?: Client; loyalist?: Client; birthday?: Client }): Tile[] => {
  const out: Tile[] = [];
  if (clients.coldStart) {
    out.push({
      href: `/me/${clients.coldStart.slug}`,
      persona: { name: clients.coldStart.firstName + " " + clients.coldStart.lastName, role: "Newly downloaded", avatarHue: clients.coldStart.avatarHue },
      badge: { label: "Cold start", tone: "cold" },
      title: "Imani opens the app for the first time",
      description: "Empty home, one welcome message, suggestion to book her next look. Zero-state UI.",
    });
  }
  if (clients.loyalist) {
    out.push({
      href: `/me/${clients.loyalist.slug}/journey`,
      persona: { name: clients.loyalist.firstName + " " + clients.loyalist.lastName, role: "Hair journey active", avatarHue: clients.loyalist.avatarHue },
      badge: { label: "Hot start", tone: "hot" },
      title: "Aaliyah's hair journey",
      description: "Visual timeline of her last 6 looks. Tap any past look to rebook the same, or save it to her wishlist.",
    });
  }
  if (clients.birthday) {
    out.push({
      href: `/me/${clients.birthday.slug}`,
      persona: { name: clients.birthday.firstName + " " + clients.birthday.lastName, role: "Birthday surprise", avatarHue: clients.birthday.avatarHue },
      badge: { label: "Birthday", tone: "birthday" },
      title: "Naomi sees her birthday surprise",
      description: "Home tab shows a gold birthday banner with a comp add-on unlocked. Tap to add to her next booking.",
    });
  }
  return out;
};

const proTiles = (owner: Stylist | undefined, stylists: Stylist[]): Tile[] => {
  const out: Tile[] = [];
  if (owner) {
    out.push({
      href: `/pro/${owner.slug}`,
      persona: { name: owner.name, role: owner.role, avatarHue: 343 },
      badge: { label: "Owner view", tone: "operator" },
      title: "Diéssou — owner overview",
      description: "Real-time floor view: who's busy, today's revenue ticker, oopsies, AI conversations awaiting takeover.",
    });
  }
  for (const s of stylists) {
    out.push({
      href: `/pro/${s.slug}`,
      persona: { name: s.name, role: s.specialty || s.role, avatarHue: undefined },
      badge: { label: "Stylist view", tone: "hot" },
      title: `${s.name.split(" ")[0]}'s day`,
      description: stylistScenario(s.slug),
    });
  }
  return out;
};

const stylistScenario = (slug: string): string => {
  switch (slug as CastStylistSlug) {
    case "oumou-d":
      return "All-day knotless install with one client. Schedule, breaks, mid-service photo capture, product usage logged.";
    case "fatou-c":
      return "Three back-to-back silk presses. Quick notes between clients. AI takeover queue for after-hours questions.";
    case "dieynaba-d":
      return "Color consultation flow: client photo + formula notes + before/after capture for the journey.";
    default:
      return "Daily schedule, client notes, and the takeover dashboard.";
  }
};

// ───────────────────── visual helpers ─────────────────────

const initials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const badgeStyles: Record<NonNullable<Tile["badge"]>["tone"], string> = {
  cold: "bg-ink-100 text-ink-700",
  hot: "bg-brand text-white",
  operator: "bg-brand-500 text-white",
  birthday: "bg-gold text-ink-900",
};

function Avatar({ name, hue }: { name: string; hue?: number }) {
  const h = hue ?? 320;
  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
      style={{
        background: `linear-gradient(135deg, hsl(${h}, 55%, 38%), hsl(${(h + 30) % 360}, 60%, 50%))`,
      }}
    >
      {initials(name)}
    </div>
  );
}

function TileCard({ tile }: { tile: Tile }) {
  return (
    <Link
      href={tile.href}
      className="group relative flex flex-col gap-3 rounded-xl border border-ink-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        {tile.persona ? (
          <Avatar name={tile.persona.name} hue={tile.persona.avatarHue} />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-paper">
            <Sparkles className="h-5 w-5 text-brand" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          {tile.persona && (
            <div className="text-xs text-ink-500">
              <span className="font-medium text-ink-900">{tile.persona.name}</span>
              <span className="mx-1.5 text-ink-300">·</span>
              <span>{tile.persona.role}</span>
            </div>
          )}
          {tile.badge && (
            <span
              className={
                "mt-1 inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider " +
                badgeStyles[tile.badge.tone]
              }
            >
              {tile.badge.label}
            </span>
          )}
        </div>
      </div>
      <div>
        <h3 className="text-base font-semibold text-ink-900">{tile.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-ink-500">{tile.description}</p>
      </div>
      <div className="mt-auto flex items-center gap-1 text-xs font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100">
        Open <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </Link>
  );
}

// ───────────────────── page ─────────────────────

export default function DemoHubPage() {
  const [activeTab, setActiveTab] = useState<SurfaceTab["id"]>("operator");

  const owner = getOwner();
  const stylists = getCastStylists();
  const clients = {
    coldStart: getCastClient("coldStart"),
    loyalist: getCastClient("loyalist"),
    birthday: getCastClient("birthday"),
  };

  const tiles: Record<SurfaceTab["id"], Tile[]> = {
    operator: operatorTiles(owner),
    book: bookTiles(clients),
    me: meTiles(clients),
    pro: proTiles(owner, stylists),
  };

  const tab = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="min-h-screen bg-paper">
      {/* Hero header */}
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            <span className="rounded-full bg-brand px-2 py-0.5 text-white">Prototype</span>
            <span>Jolieden's Beauty Bar · client + stylist surfaces</span>
          </div>
          <h1 className="mt-4 font-serif text-4xl font-semibold text-brand sm:text-5xl">
            Walk-through hub
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-700">
            Four surfaces. Pick a tab, pick a persona — every tile is a one-click entry into that
            scenario, pre-filled and ready. Drop feedback on any screen with the floating chip
            (bottom-right); it goes straight to a GitHub issue.
          </p>

          {/* Featured: AI SMS simulator */}
          <Link
            href="/demo/sms"
            className="group mt-6 flex items-center gap-4 rounded-2xl border border-brand/30 bg-gradient-to-br from-brand-50 via-paper to-gold-soft p-4 transition-shadow hover:shadow-md sm:p-5"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-white">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-brand px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white">
                  Featured
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-ink-500">
                  AI SMS Concierge
                </span>
              </div>
              <h3 className="mt-1 text-base font-semibold text-ink-900">
                See what clients experience over SMS
              </h3>
              <p className="mt-0.5 text-sm text-ink-700">
                Four scripted conversations (booking, FAQ, stylist takeover, late arrival) auto-play in an iMessage simulator.
              </p>
            </div>
            <ArrowRight className="hidden h-5 w-5 shrink-0 text-brand transition-transform group-hover:translate-x-0.5 sm:block" />
          </Link>
        </div>
      </header>

      {/* Tab nav */}
      <div className="border-b border-ink-200 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Surfaces">
            {TABS.map((t) => {
              const isActive = t.id === activeTab;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={
                    "flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors " +
                    (isActive
                      ? "border-brand text-brand"
                      : "border-transparent text-ink-500 hover:text-ink-900")
                  }
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Description + tiles */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        <p className="mb-6 max-w-3xl text-sm text-ink-700">{tab.description}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiles[activeTab].map((tile, i) => (
            <TileCard key={`${activeTab}-${i}-${tile.href}`} tile={tile} />
          ))}
        </div>

        {tiles[activeTab].length === 0 && (
          <div className="rounded-xl border border-dashed border-ink-300 bg-white p-8 text-center text-sm text-ink-500">
            Nothing seeded for this surface yet.
          </div>
        )}
      </main>

      {/* Footer note */}
      <footer className="border-t border-ink-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-6 font-mono text-[11px] text-ink-500">
          <p>
            Cast canon lives in <span className="text-ink-900">src/lib/personas.ts</span>. Add a
            scenario by adding a Tile entry on this page — never hardcode persona references inline.
          </p>
        </div>
      </footer>
    </div>
  );
}
