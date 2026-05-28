// Hair journey — visual timeline of a client's past looks. Surfaces in:
//   - /me Journey tab (client mobile app)
//   - /pro client detail (stylist sees the client's history)
//   - operator app client detail page (existing)

export type HairJourneyEntry = {
  id: string;
  clientSlug: string;
  appointmentId?: string; // links to Appointment when available
  date: string; // YYYY-MM-DD
  serviceName: string; // human label, doesn't have to match catalog exactly
  stylistSlug?: string;
  beforePhoto?: string;
  afterPhoto?: string;
  note?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  productsUsed?: string[];
};

// Seeded in P6. Aaliyah Jackson (slug "aaliyah-j") gets ~6 entries to demo the
// loyalist hair-journey feature.
export const JOURNEY: HairJourneyEntry[] = [];

export const journeyForClient = (clientSlug: string): HairJourneyEntry[] =>
  JOURNEY.filter((e) => e.clientSlug === clientSlug).sort((a, b) =>
    b.date.localeCompare(a.date),
  );

export const latestEntryForClient = (clientSlug: string): HairJourneyEntry | undefined =>
  journeyForClient(clientSlug)[0];
