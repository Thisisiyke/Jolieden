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

// Seeded in P6. Aaliyah Jackson (slug "aaliyah-j") gets 6 entries spanning a
// year to demo the loyalist hair-journey feature.
const CDN = "https://www.joliedensbeautybar.com/cdn/shop/files";

export const JOURNEY: HairJourneyEntry[] = [
  {
    id: "j-aa-1",
    clientSlug: "aaliyah-j",
    date: "2025-05-15",
    serviceName: "Bora Bora Boho",
    stylistSlug: "oumou-d",
    afterPhoto: `${CDN}/1763415079401_9d8162ea-474c-4119-96ea-d72f1d8d1a4b.jpg`,
    note: "First time trying boho ends. Loved the curl pattern.",
    rating: 5,
  },
  {
    id: "j-aa-2",
    clientSlug: "aaliyah-j",
    date: "2025-07-10",
    serviceName: "Honey Knotless",
    stylistSlug: "oumou-d",
    afterPhoto: `${CDN}/1763416091701_5684b379-e65d-40b7-920f-de312e8666a7.jpg`,
    note: "Two-tone for summer — 1B/27 was perfect.",
    rating: 5,
  },
  {
    id: "j-aa-3",
    clientSlug: "aaliyah-j",
    date: "2025-09-05",
    serviceName: "Boho Goddess",
    stylistSlug: "oumou-d",
    afterPhoto: `${CDN}/1763413254209__2_f448a77c-a2e8-493d-a395-428c21bf4d1b.jpg`,
    rating: 5,
  },
  {
    id: "j-aa-4",
    clientSlug: "aaliyah-j",
    date: "2025-11-15",
    serviceName: "Traditional 14-Row Knotless",
    stylistSlug: "oumou-d",
    afterPhoto: `${CDN}/1763415970920.jpg`,
    note: "Cleaner look heading into the holidays. Triangle parts.",
    rating: 4,
  },
  {
    id: "j-aa-5",
    clientSlug: "aaliyah-j",
    date: "2026-01-20",
    serviceName: "Waist-Length Knotless",
    stylistSlug: "oumou-d",
    afterPhoto: `${CDN}/1763415772056.jpg`,
    note: "Going long for the winter.",
    rating: 5,
  },
  {
    id: "j-aa-6",
    clientSlug: "aaliyah-j",
    appointmentId: "a23",
    date: "2026-04-13",
    serviceName: "Knotless Braids",
    stylistSlug: "mame-d",
    afterPhoto: `${CDN}/1763414013621_b833d256-530e-46a4-8ff2-470137892222.jpg`,
    note: "Tried Mame this round while Oumou was on PTO. Honest A/B test.",
    rating: 4,
  },

  // Naomi — recent silk press so her hair journey isn't empty for the
  // birthday-week persona.
  {
    id: "j-nb-1",
    clientSlug: "naomi-b",
    date: "2026-02-21",
    serviceName: "Silk Press",
    stylistSlug: "fatou-c",
    afterPhoto: `${CDN}/1763415079401_9d8162ea-474c-4119-96ea-d72f1d8d1a4b.jpg`,
    note: "Light layers, glossy finish — held up beautifully for two weeks.",
    rating: 5,
  },
];

export const journeyForClient = (clientSlug: string): HairJourneyEntry[] =>
  JOURNEY.filter((e) => e.clientSlug === clientSlug).sort((a, b) =>
    b.date.localeCompare(a.date),
  );

export const latestEntryForClient = (clientSlug: string): HairJourneyEntry | undefined =>
  journeyForClient(clientSlug)[0];
