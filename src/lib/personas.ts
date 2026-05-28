// Slug-keyed persona registry — the single resolver layer between URL params
// and concrete entities. Pages read slug from useParams() and call resolveX(slug).
// NEVER hardcode persona imports (e.g. aaliyahJackson.id) into JSX.

import { APPOINTMENTS, CLIENTS, STAFF } from "@/lib/data";
import type { Appointment, Client, Stylist } from "@/lib/data";
import { JOURNEY } from "@/lib/journey";
import type { HairJourneyEntry } from "@/lib/journey";

// ───────────────────── resolvers ─────────────────────

export const resolveClient = (slug: string | undefined): Client | undefined => {
  if (!slug) return undefined;
  return CLIENTS.find((c) => c.slug === slug);
};

export const resolveStylist = (slug: string | undefined): Stylist | undefined => {
  if (!slug) return undefined;
  return STAFF.find((s) => s.slug === slug);
};

export const clientById = (id: string): Client | undefined =>
  CLIENTS.find((c) => c.id === id);

export const stylistById = (id: string): Stylist | undefined =>
  STAFF.find((s) => s.id === id);

// Resolve a stylist by display name (legacy bridge: existing Appointment.staff
// references stylists by name string). Use sparingly — prefer slug.
export const stylistByName = (name: string | undefined): Stylist | undefined => {
  if (!name) return undefined;
  return STAFF.find((s) => s.name === name);
};

// ───────────────────── relations ─────────────────────

export const appointmentsForClient = (slug: string): Appointment[] => {
  const client = resolveClient(slug);
  if (!client) return [];
  const display = `${client.firstName} ${client.lastName}`.trim();
  return APPOINTMENTS.filter(
    (a) => a.client === display || a.client.toLowerCase() === display.toLowerCase(),
  );
};

export const appointmentsForStylist = (slug: string): Appointment[] => {
  const stylist = resolveStylist(slug);
  if (!stylist) return [];
  return APPOINTMENTS.filter((a) => a.staff === stylist.name);
};

export const journeyForClient = (slug: string): HairJourneyEntry[] =>
  JOURNEY.filter((e) => e.clientSlug === slug).sort((a, b) =>
    b.date.localeCompare(a.date),
  );

// ───────────────────── cast canon ─────────────────────
// The flagship personas the prototype uses to demo every surface.
// Update here when adding/removing cast members; landing page reads from this.

export const CAST = {
  owner: "diessou",
  stylists: ["oumou-d", "fatou-c", "dieynaba-d"] as const,
  clients: {
    coldStart: "imani-w", // first-time on the booking web app
    loyalist: "aaliyah-j", // returning, deep hair journey
    birthday: "naomi-b", // birthday in 4 days from TODAY
  },
} as const;

export type CastStylistSlug = (typeof CAST.stylists)[number];
export type CastClientKey = keyof typeof CAST.clients;

export const getOwner = (): Stylist | undefined => resolveStylist(CAST.owner);

export const getCastStylists = (): Stylist[] =>
  CAST.stylists.map((slug) => resolveStylist(slug)).filter((s): s is Stylist => !!s);

export const getCastClient = (key: CastClientKey): Client | undefined =>
  resolveClient(CAST.clients[key]);

export const getCastClients = (): { key: CastClientKey; client: Client }[] =>
  (Object.keys(CAST.clients) as CastClientKey[])
    .map((key) => {
      const client = resolveClient(CAST.clients[key]);
      return client ? { key, client } : null;
    })
    .filter((x): x is { key: CastClientKey; client: Client } => !!x);
