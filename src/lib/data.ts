export type ApptStatus =
  | "unconfirmed"
  | "confirmed"
  | "walkin"
  | "arrived"
  | "active"
  | "completed"
  | "cancelled"
  | "noshow";

export type Appointment = {
  id: string;
  date: string; // YYYY-MM-DD
  client: string;
  pronouns?: string;
  phone?: string;
  start: string; // "9:00am"
  end?: string;
  service?: string;
  serviceDetail?: string;
  staff?: string;
  price?: number;
  showRate?: number;
  avgVisit?: number;
  avgFrequency?: string;
  numVisits?: number;
  notes?: string;
  status: ApptStatus;
  isNewClient?: boolean;
  hasMessage?: boolean;
  isVip?: boolean;
  avatarHue?: number;
  bookedBy?: string;
  bookedAt?: string;
  tags?: string[];
  // Set when the AI Concierge autonomously booked this slot via SMS.
  // Renders an "AI" badge on /calendar and lets /messages link the thread
  // to the calendar event.
  aiBooked?: boolean;
  aiBookedFromThreadId?: string;
};

const hue = (n: number) => (n * 47) % 360;

let _id = 0;
const mk = (
  a: Omit<Appointment, "id" | "avatarHue">,
): Appointment => {
  _id += 1;
  return { id: `a${_id}`, avatarHue: hue(_id), ...a };
};

export const TODAY = "2026-04-14";
export const YESTERDAY = "2026-04-13";
export const TOMORROW = "2026-04-15";

export const APPOINTMENTS: Appointment[] = [
  // ---------- TODAY ----------
  mk({
    date: TODAY,
    client: "THAIS DUNBAR",
    phone: "(929) 551-5831",
    start: "9:00am",
    end: "3:00pm",
    service: "Small Knotless Braids",
    serviceDetail: "2, Butt Length, Straight, Standard Boxed…",
    staff: "Mame Diarra",
    price: 250,
    showRate: 100,
    avgVisit: 250,
    numVisits: 1,
    status: "unconfirmed",
    isNewClient: true,
    bookedBy: "THAIS D.",
    bookedAt: "Apr 11th @ 2:30pm",
  }),
  mk({
    date: TODAY,
    client: "Tracey Brown",
    phone: "(917) 224-1180",
    start: "6:15pm",
    end: "8:30pm",
    service: "Silk Press",
    staff: "Frederick Douglass",
    price: 145,
    showRate: 92,
    avgVisit: 180,
    numVisits: 6,
    hasMessage: true,
    status: "unconfirmed",
  }),
  mk({ date: TODAY, client: "Layla McGrady", pronouns: "She/Her", start: "2:00pm", end: "4:00pm", service: "Box Braids — Mid Back", staff: "Naomi K.", price: 220, status: "confirmed", isVip: true }),
  mk({ date: TODAY, client: "Katherine Bruce", start: "3:00pm", end: "4:30pm", service: "Wash & Style", staff: "Mame Diarra", price: 95, status: "confirmed" }),
  mk({ date: TODAY, client: "Juliana D", start: "3:30pm", end: "5:00pm", service: "Trim + Deep Condition", staff: "Frederick Douglass", price: 110, status: "confirmed", isVip: true }),
  mk({ date: TODAY, client: "Nadia Turnage", pronouns: "She/Her", start: "3:35pm", end: "6:00pm", service: "Twist Out Set", staff: "Naomi K.", price: 165, status: "confirmed", hasMessage: true }),
  mk({ date: TODAY, client: "Yvonne Williams", start: "5:30pm", end: "7:00pm", service: "Color Refresh", staff: "Mame Diarra", price: 140, status: "confirmed", isVip: true }),
  mk({ date: TODAY, client: "Vanessa Santana", pronouns: "She/Her", start: "5:35pm", end: "7:30pm", service: "Silk Press", staff: "Frederick Douglass", price: 145, status: "confirmed" }),
  mk({ date: TODAY, client: "Nicole Lambert", start: "5:45pm", end: "8:00pm", service: "Knotless Braids", staff: "Naomi K.", price: 235, status: "confirmed", isVip: true }),
  mk({
    date: TODAY,
    client: "Ellie Branson",
    pronouns: "She/Her",
    phone: "(917) 555-0124",
    start: "9:00am",
    end: "11:00am",
    service: "Wash & Style",
    staff: "Frederick Douglass",
    price: 95,
    showRate: 88,
    avgVisit: 95,
    numVisits: 3,
    status: "arrived",
    bookedBy: "Ellie B.",
    bookedAt: "Apr 8th @ 10:02am",
  }),
  mk({ date: TODAY, client: "Megan Henderson", pronouns: "She/Her", start: "9:00am", end: "11:30am", service: "Knotless Braids", staff: "Mame Diarra", price: 235, status: "arrived" }),
  mk({
    date: TODAY,
    client: "Nnola Amuzie",
    phone: "(347) 555-0191",
    start: "9:00am",
    end: "10:30am",
    service: "Trim",
    serviceDetail: "Shape-up, light layer",
    staff: "Naomi K.",
    price: 60,
    showRate: 96,
    avgVisit: 70,
    numVisits: 14,
    status: "arrived",
    bookedBy: "Nnola A.",
    bookedAt: "Mar 29th @ 6:41pm",
    tags: ["Regular"],
  }),
  mk({ date: TODAY, client: "Asia Sampson", start: "9:00am", end: "12:30pm", service: "Color + Style", staff: "Mame Diarra", price: 220, status: "arrived", isVip: true }),
  mk({ date: TODAY, client: "Renee Rosenberry", start: "9:00am", end: "11:00am", service: "Silk Press", staff: "Frederick Douglass", price: 145, status: "arrived", hasMessage: true }),
  mk({ date: TODAY, client: "Jordan Breedlove", pronouns: "She/Her", start: "9:00am", end: "12:00pm", service: "Twist Out Set", staff: "Naomi K.", price: 165, status: "arrived" }),
  mk({ date: TODAY, client: "RaeAnna Hunter", pronouns: "She/Her", start: "9:30am", end: "11:00am", service: "Wash & Style", staff: "Mame Diarra", price: 95, status: "arrived" }),
  mk({ date: TODAY, client: "Kellie Harris", start: "10:30am", end: "12:00pm", service: "Trim", staff: "Frederick Douglass", price: 60, status: "arrived", isNewClient: true }),
  mk({ date: TODAY, client: "Maimouna Sangare", pronouns: "She/Her", start: "11:00am", end: "2:00pm", service: "Knotless Braids", staff: "Mame Diarra", price: 235, status: "arrived", isVip: true, hasMessage: true }),
  mk({ date: TODAY, client: "Sewa Sonubi", pronouns: "She/Her", start: "11:45am", end: "1:30pm", service: "Silk Press", staff: "Naomi K.", price: 145, status: "arrived" }),
  mk({ date: TODAY, client: "Sonja Harris", start: "1:00pm", end: "3:00pm", service: "Color Refresh", staff: "Mame Diarra", price: 140, status: "arrived", isVip: true }),
  mk({
    date: TODAY,
    client: "LaTarika Pierce",
    pronouns: "She/Her",
    phone: "(917) 555-0172",
    start: "9:00am",
    end: "2:00pm",
    service: "Knotless — Waist Length",
    serviceDetail: "4, Waist, Curly ends, Scalp oil add-on",
    staff: "Mame Diarra",
    price: 320,
    showRate: 100,
    avgVisit: 305,
    avgFrequency: "Every 6 wks",
    numVisits: 22,
    status: "completed",
    isVip: true,
    bookedBy: "LaTarika P.",
    bookedAt: "Mar 3rd @ 8:12pm",
    tags: ["VIP", "Repeat"],
  }),
  mk({ date: TODAY, client: "Neysia Scott", start: "11:30am", end: "4:30pm", service: "Box Braids — Waist", staff: "Naomi K.", price: 310, status: "completed" }),

  // ---------- YESTERDAY (Apr 13) ----------
  mk({ date: YESTERDAY, client: "Aaliyah Jackson", start: "10:00am", end: "1:00pm", service: "Knotless Braids", staff: "Mame Diarra", price: 235, status: "completed" }),
  mk({ date: YESTERDAY, client: "Brianna Lee", pronouns: "She/Her", start: "1:30pm", end: "3:00pm", service: "Silk Press", staff: "Naomi K.", price: 145, status: "completed" }),
  mk({ date: YESTERDAY, client: "Chanel Morris", start: "3:15pm", end: "5:30pm", service: "Box Braids — Shoulder", staff: "Frederick Douglass", price: 180, status: "completed" }),

  // ---------- TOMORROW (Apr 15) ----------
  mk({ date: TOMORROW, client: "Destiny Rivera", pronouns: "She/Her", start: "10:00am", end: "1:00pm", service: "Knotless Braids", staff: "Mame Diarra", price: 235, status: "unconfirmed", isNewClient: true, aiBooked: true, aiBookedFromThreadId: "c-ai-1" }),
  mk({ date: TOMORROW, client: "Imani Webb", start: "2:00pm", end: "4:00pm", service: "Color Refresh", staff: "Naomi K.", price: 140, status: "confirmed" }),
  mk({ date: TOMORROW, client: "Janelle Ford", pronouns: "She/Her", start: "5:00pm", end: "7:00pm", service: "Silk Press", staff: "Frederick Douglass", price: 145, status: "confirmed", aiBooked: true, aiBookedFromThreadId: "c-ai-3" }),
  mk({ date: TODAY, client: "Yvonne Adams", pronouns: "She/Her", start: "4:30pm", end: "6:00pm", service: "Wash & Style", staff: "Fatou Ciss", price: 95, status: "confirmed", aiBooked: true, aiBookedFromThreadId: "c-ai-4" }),

  // ---------- CAST DEMO APPOINTMENTS (for /me + /pro lifecycle demos) ----------

  // Aaliyah TODAY with Oumou — the headline lifecycle demo. Loyalist persona
  // can walk: home upcoming card → check-in QR → arrived → in-service →
  // completed → receipt + rate + journey entry. On stylist side, Oumou's
  // NextUpCard surfaces this as her first client of the day.
  mk({
    date: TODAY,
    client: "Aaliyah Jackson",
    pronouns: "She/Her",
    phone: "(917) 555-0181",
    start: "10:00am",
    end: "5:00pm",
    service: "XS Knotless Braids",
    serviceDetail: "Mid-Back, Triangle parts, #1B/27, Boho ends",
    staff: "Oumou D.",
    price: 395,
    showRate: 100,
    avgVisit: 365,
    avgFrequency: "Every 8 wks",
    numVisits: 7,
    status: "confirmed",
    tags: ["Loyalist", "Repeat", "VIP"],
    bookedBy: "Aaliyah J.",
    bookedAt: "Mar 17th @ 11:42am",
  }),

  // Dieynaba's TODAY appointment — color consult so she has a stylist day
  // and isn't just an empty AI-inbox persona.
  mk({
    date: TODAY,
    client: "Layla McGrady",
    pronouns: "She/Her",
    phone: "(917) 555-0444",
    start: "1:00pm",
    end: "4:00pm",
    service: "Balayage Touch-up",
    serviceDetail: "Hand-painted highlights · honey + caramel",
    staff: "Dieynaba D.",
    price: 285,
    showRate: 100,
    avgVisit: 95,
    avgFrequency: "Every 12 wks",
    numVisits: 4,
    status: "confirmed",
    bookedBy: "Layla M.",
    bookedAt: "Apr 8th @ 3:18pm",
  }),

  // Naomi's recent past completed visit — gives her a hair journey timeline
  // (the birthday-week persona shouldn't have a blank journey tab).
  mk({
    date: "2026-02-21",
    client: "Naomi Brooks",
    pronouns: "She/Her",
    phone: "(917) 555-0212",
    start: "10:00am",
    end: "12:00pm",
    service: "Silk Press",
    serviceDetail: "Wash + blow + flat iron · light layers",
    staff: "Fatou Ciss",
    price: 145,
    showRate: 100,
    avgVisit: 160,
    numVisits: 3,
    status: "completed",
  }),

  // Aaliyah's older past visit — additional journey context (already has
  // YESTERDAY completed, this adds a second touchpoint with a different
  // stylist for visual variety in her timeline).
  mk({
    date: "2026-02-17",
    client: "Aaliyah Jackson",
    pronouns: "She/Her",
    phone: "(917) 555-0181",
    start: "9:00am",
    end: "4:00pm",
    service: "XS Knotless Braids",
    serviceDetail: "Waist length, Boho ends, 1B/27",
    staff: "Oumou D.",
    price: 395,
    status: "completed",
  }),

  // Aaliyah's 8-week rebook with her preferred stylist Oumou.
  mk({
    date: "2026-06-09",
    client: "Aaliyah Jackson",
    pronouns: "She/Her",
    phone: "(917) 555-0181",
    start: "10:00am",
    end: "5:00pm",
    service: "XS Knotless Braids",
    serviceDetail: "Mid-Back, Triangle parts, #1B/27, Boho ends",
    staff: "Oumou D.",
    price: 395,
    showRate: 100,
    avgVisit: 365,
    avgFrequency: "Every 8 wks",
    numVisits: 7,
    status: "confirmed",
    tags: ["Loyalist", "Repeat"],
    bookedBy: "Aaliyah J.",
    bookedAt: "Apr 14th @ 9:30am",
  }),
  // Naomi's birthday-week silk press with Fatou.
  mk({
    date: "2026-04-18",
    client: "Naomi Brooks",
    pronouns: "She/Her",
    phone: "(917) 555-0212",
    start: "11:00am",
    end: "1:30pm",
    service: "Silk Press",
    serviceDetail: "Bond builder add-on · comp Wash & Blow (birthday)",
    staff: "Fatou Ciss",
    price: 170,
    showRate: 100,
    avgVisit: 160,
    numVisits: 3,
    status: "confirmed",
    tags: ["Birthday"],
    bookedBy: "Naomi B.",
    bookedAt: "Apr 13th @ 7:48pm",
  }),
  // Imani's first appointment with one of the cast stylists.
  mk({
    date: "2026-04-22",
    client: "Imani Webb",
    pronouns: "She/Her",
    phone: "(646) 555-0199",
    start: "1:00pm",
    end: "5:00pm",
    service: "Honey Balayage",
    serviceDetail: "Custom honey + warm caramel, glaze finish",
    staff: "Dieynaba D.",
    price: 320,
    showRate: 100,
    avgVisit: 140,
    numVisits: 2,
    status: "confirmed",
    bookedBy: "Imani W.",
    bookedAt: "Apr 14th @ 4:12pm",
  }),
];

export const STATUS_COLUMNS: { id: ApptStatus; label: string }[] = [
  { id: "unconfirmed", label: "Unconfirmed" },
  { id: "confirmed", label: "Confirmed" },
  { id: "walkin", label: "Walk-In" },
  { id: "arrived", label: "Arrived" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
];

// ───────────────────── STAFF / STYLISTS ─────────────────────

export type Stylist = {
  id: string;
  slug: string;
  name: string;
  role: string;
  color: string;
  specialty?: string;
  bio?: string;
  photo?: string;
  instagram?: string;
  yearsAtSalon?: number;
};

export const STAFF: Stylist[] = [
  { id: "s1", slug: "adja-t", name: "Adja Timite", role: "Stylist", color: "#ec4899" },
  { id: "s2", slug: "aminata-d", name: "Aminata Diawara", role: "Stylist", color: "#f59e0b" },
  { id: "s3", slug: "bebe-k", name: "Bebe Kaba", role: "Braider", color: "#0ea5e9" },
  { id: "s4", slug: "frederick-d", name: "Frederick Douglass", role: "Senior Stylist", color: "#ec4899" },
  { id: "s5", slug: "mame-d", name: "Mame Diarra", role: "Senior Stylist", color: "#10b981" },
  { id: "s6", slug: "naomi-k", name: "Naomi K.", role: "Stylist", color: "#8b5cf6" },
  { id: "s7", slug: "lina-o", name: "Lina O.", role: "Assistant", color: "#f59e0b" },
  { id: "s8", slug: "asha-p", name: "Asha P.", role: "Apprentice", color: "#0ea5e9" },
  {
    id: "s9",
    slug: "diessou",
    name: "Diéssou",
    role: "Owner / Founder",
    color: "#431926",
    specialty: "Founder",
    bio: "Founded Jolieden Beauty Bar to create a space where Black hair gets the artistry, time, and care it deserves.",
    instagram: "joliedensbeautybar",
    yearsAtSalon: 7,
  },
  {
    id: "s10",
    slug: "oumou-d",
    name: "Oumou D.",
    role: "Senior Braider",
    color: "#8e3a52",
    specialty: "Knotless & Boho Braids",
    bio: "Five years of knotless. Specializes in hairline-friendly tension and intricate parting.",
    yearsAtSalon: 5,
  },
  {
    id: "s11",
    slug: "fatou-c",
    name: "Fatou Ciss",
    role: "Natural Hair Specialist",
    color: "#c8a368",
    specialty: "Silk Press & Treatments",
    bio: "Heatless prep, deep-condition rituals, and silk-press finishes that last weeks.",
    yearsAtSalon: 4,
  },
  {
    id: "s12",
    slug: "dieynaba-d",
    name: "Dieynaba D.",
    role: "Color Specialist",
    color: "#f59e0b",
    specialty: "Color & Highlights",
    bio: "Custom color formulations for Black hair. Honey balayage, copper, and rich brunettes are her signature.",
    yearsAtSalon: 3,
  },
];

export const SERVICES = [
  { name: "Silk Press", duration: "2h", price: 145 },
  { name: "Wash & Style", duration: "1.5h", price: 95 },
  { name: "Trim", duration: "45m", price: 60 },
  { name: "Knotless Braids — Mid Back", duration: "3h", price: 235 },
  { name: "Knotless Braids — Waist", duration: "5h", price: 320 },
  { name: "Box Braids — Shoulder", duration: "2.5h", price: 180 },
  { name: "Box Braids — Mid Back", duration: "3h", price: 220 },
  { name: "Twist Out Set", duration: "2.5h", price: 165 },
  { name: "Color Refresh", duration: "2h", price: 140 },
  { name: "Deep Conditioning", duration: "45m", price: 45 },
];

export const CANCELLATIONS = [
  { id: "x1", client: "Nandy Mompremier", service: "Silk Press", staff: "Mame Diarra", cancelledAt: "Apr 13, 9:02pm", apptAt: "Apr 14, 11:00am", reason: "Client reschedule" },
  { id: "x2", client: "Leslie Brooks", service: "Knotless Braids", staff: "Naomi K.", cancelledAt: "Apr 13, 3:47pm", apptAt: "Apr 14, 1:30pm", reason: "No show" },
  { id: "x3", client: "Erica Suarez", service: "Color Refresh", staff: "Frederick Douglass", cancelledAt: "Apr 12, 7:11pm", apptAt: "Apr 14, 4:00pm", reason: "Sick" },
  { id: "x4", client: "Gabrielle Kim", service: "Wash & Style", staff: "Mame Diarra", cancelledAt: "Apr 12, 11:15am", apptAt: "Apr 14, 9:30am", reason: "Client reschedule" },
];

// ───────────────────── CLIENTS ─────────────────────

export type Client = {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  emailOptIn: boolean;
  textOptIn: boolean;
  visits: number;
  lastVisit?: string; // ISO
  totalSpend: number;
  tags?: string[];
  referralSource?: "Google" | "Instagram" | "Referral" | "Walk-in" | "Yelp";
  birthdayMonth?: number; // 1..12
  birthdayDay?: number; // 1..31
  membership?: "None" | "Silver" | "Gold" | "Platinum";
  avatarHue?: number;
  preferredStylistSlug?: string;
};

const huePick = (n: number) => (n * 47) % 360;

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const clientSlug = (firstName: string, lastName: string) => {
  const last = slugify(lastName).replace(/-/g, "");
  return `${slugify(firstName)}-${last.charAt(0) || "x"}`;
};

const _mkClient = (
  i: number,
  data: Omit<Client, "id" | "avatarHue" | "slug">,
): Client => ({
  id: `cl${i}`,
  slug: clientSlug(data.firstName, data.lastName),
  avatarHue: huePick(i),
  ...data,
});

export const CLIENTS: Client[] = [
  _mkClient(1, { firstName: "Thais", lastName: "Dunbar", phone: "(929) 551-5831", email: "thais.dunbar@example.com", emailOptIn: true, textOptIn: true, visits: 1, lastVisit: "2026-04-14", totalSpend: 250, tags: ["New"], referralSource: "Instagram", birthdayMonth: 9 }),
  _mkClient(2, { firstName: "Tracey", lastName: "Brown", phone: "(917) 224-1180", email: "tracey.b@example.com", emailOptIn: true, textOptIn: false, visits: 6, lastVisit: "2026-02-10", totalSpend: 1080, referralSource: "Google", birthdayMonth: 5, membership: "Silver" }),
  _mkClient(3, { firstName: "Layla", lastName: "McGrady", phone: "(917) 555-0119", email: "layla.mcgrady@example.com", emailOptIn: true, textOptIn: true, visits: 8, lastVisit: "2026-04-14", totalSpend: 1760, tags: ["VIP"], referralSource: "Referral", birthdayMonth: 3, membership: "Gold" }),
  _mkClient(4, { firstName: "Katherine", lastName: "Bruce", phone: "(646) 555-0188", email: "katherine.bruce@example.com", emailOptIn: true, textOptIn: true, visits: 5, lastVisit: "2026-04-14", totalSpend: 475, referralSource: "Instagram", birthdayMonth: 7 }),
  _mkClient(5, { firstName: "Juliana", lastName: "D.", phone: "(718) 555-0143", email: "juliana.d@example.com", emailOptIn: false, textOptIn: true, visits: 11, lastVisit: "2026-04-14", totalSpend: 1210, tags: ["VIP"], referralSource: "Referral", birthdayMonth: 11, membership: "Gold" }),
  _mkClient(6, { firstName: "Nadia", lastName: "Turnage", phone: "(212) 555-0102", email: "nadia.t@example.com", emailOptIn: true, textOptIn: true, visits: 4, lastVisit: "2026-04-14", totalSpend: 660, referralSource: "Yelp", birthdayMonth: 2 }),
  _mkClient(7, { firstName: "Yvonne", lastName: "Williams", phone: "(917) 555-0198", email: "yvonne.w@example.com", emailOptIn: true, textOptIn: true, visits: 18, lastVisit: "2026-04-14", totalSpend: 2520, tags: ["VIP"], referralSource: "Referral", birthdayMonth: 8, membership: "Platinum" }),
  _mkClient(8, { firstName: "Vanessa", lastName: "Santana", phone: "(646) 555-0174", email: "vanessa.s@example.com", emailOptIn: true, textOptIn: false, visits: 7, lastVisit: "2026-04-14", totalSpend: 1015, referralSource: "Google", birthdayMonth: 10, membership: "Silver" }),
  _mkClient(9, { firstName: "Nicole", lastName: "Lambert", phone: "(212) 555-0160", email: "nicole.l@example.com", emailOptIn: true, textOptIn: true, visits: 14, lastVisit: "2026-04-14", totalSpend: 3290, tags: ["VIP"], referralSource: "Referral", birthdayMonth: 1, membership: "Gold" }),
  _mkClient(10, { firstName: "Ellie", lastName: "Branson", phone: "(917) 555-0124", email: "ellie.branson@example.com", emailOptIn: false, textOptIn: true, visits: 3, lastVisit: "2026-04-14", totalSpend: 285, referralSource: "Instagram", birthdayMonth: 6 }),
  _mkClient(11, { firstName: "Megan", lastName: "Henderson", phone: "(347) 555-0127", email: "megan.h@example.com", emailOptIn: true, textOptIn: true, visits: 9, lastVisit: "2026-04-14", totalSpend: 2115, referralSource: "Google", birthdayMonth: 4, membership: "Silver" }),
  _mkClient(12, { firstName: "Nnola", lastName: "Amuzie", phone: "(347) 555-0191", email: "nnola.a@example.com", emailOptIn: true, textOptIn: true, visits: 14, lastVisit: "2026-04-14", totalSpend: 980, referralSource: "Referral", birthdayMonth: 12 }),
  _mkClient(13, { firstName: "Asia", lastName: "Sampson", phone: "(718) 555-0116", email: "asia.sampson@example.com", emailOptIn: true, textOptIn: true, visits: 5, lastVisit: "2026-04-14", totalSpend: 1100, tags: ["VIP"], referralSource: "Instagram", birthdayMonth: 9, membership: "Silver" }),
  _mkClient(14, { firstName: "Renee", lastName: "Rosenberry", phone: "(917) 555-0141", email: "renee.r@example.com", emailOptIn: true, textOptIn: false, visits: 2, totalSpend: 290, referralSource: "Walk-in", birthdayMonth: 7 }),
  _mkClient(15, { firstName: "Jordan", lastName: "Breedlove", phone: "(347) 555-0193", email: "jordan.b@example.com", emailOptIn: true, textOptIn: true, visits: 6, lastVisit: "2026-04-14", totalSpend: 990, referralSource: "Instagram", birthdayMonth: 3 }),
  _mkClient(16, { firstName: "RaeAnna", lastName: "Hunter", phone: "(646) 555-0158", email: "raeanna.h@example.com", emailOptIn: false, textOptIn: false, visits: 1, lastVisit: "2026-04-14", totalSpend: 95, referralSource: "Google", birthdayMonth: 11 }),
  _mkClient(17, { firstName: "Kellie", lastName: "Harris", phone: "(917) 555-0162", email: "kellie.harris@example.com", emailOptIn: true, textOptIn: true, visits: 0, tags: ["New"], referralSource: "Yelp", birthdayMonth: 5, totalSpend: 0 }),
  _mkClient(18, { firstName: "Maimouna", lastName: "Sangare", phone: "(347) 555-0138", email: "maimouna.s@example.com", emailOptIn: true, textOptIn: true, visits: 12, lastVisit: "2026-04-14", totalSpend: 2820, tags: ["VIP"], referralSource: "Referral", birthdayMonth: 1, membership: "Gold" }),
  _mkClient(19, { firstName: "Sewa", lastName: "Sonubi", phone: "(212) 555-0167", email: "sewa.s@example.com", emailOptIn: true, textOptIn: true, visits: 4, lastVisit: "2026-04-14", totalSpend: 580, referralSource: "Instagram", birthdayMonth: 8 }),
  _mkClient(20, { firstName: "Sonja", lastName: "Harris", phone: "(718) 555-0185", email: "sonja.h@example.com", emailOptIn: true, textOptIn: true, visits: 10, lastVisit: "2026-04-14", totalSpend: 1400, tags: ["VIP"], referralSource: "Google", birthdayMonth: 2, membership: "Silver" }),
  _mkClient(21, { firstName: "LaTarika", lastName: "Pierce", phone: "(917) 555-0172", email: "latarika.p@example.com", emailOptIn: true, textOptIn: true, visits: 22, lastVisit: "2026-04-14", totalSpend: 6710, tags: ["VIP", "Repeat"], referralSource: "Referral", birthdayMonth: 10, membership: "Platinum" }),
  _mkClient(22, { firstName: "Neysia", lastName: "Scott", phone: "(347) 555-0104", email: "neysia.scott@example.com", emailOptIn: true, textOptIn: true, visits: 7, lastVisit: "2026-04-14", totalSpend: 2170, referralSource: "Instagram", birthdayMonth: 6, membership: "Silver" }),
  _mkClient(23, { firstName: "Otienno", lastName: "Njoku", phone: "(516) 887-7053", email: "otienno.n@example.com", emailOptIn: false, textOptIn: true, visits: 3, lastVisit: "2026-03-22", totalSpend: 420, referralSource: "Google", birthdayMonth: 4 }),
  _mkClient(24, { firstName: "Lauren", lastName: "Rohe", phone: "(347) 555-0129", email: "lauren.rohe@example.com", emailOptIn: true, textOptIn: true, visits: 5, lastVisit: "2026-04-02", totalSpend: 725, referralSource: "Instagram", birthdayMonth: 9 }),
  _mkClient(25, { firstName: "Devorae", lastName: "Riney", phone: "(917) 663-4087", email: "devorae.r@example.com", emailOptIn: true, textOptIn: false, visits: 2, lastVisit: "2026-03-14", totalSpend: 290, referralSource: "Walk-in", birthdayMonth: 12 }),
  _mkClient(26, { firstName: "Nakeesha", lastName: "Coachman", phone: "(646) 240-9554", email: "nakeesha.c@example.com", emailOptIn: true, textOptIn: true, visits: 6, lastVisit: "2026-03-30", totalSpend: 860, referralSource: "Referral", birthdayMonth: 7 }),
  _mkClient(27, { firstName: "Laurice", lastName: "Reels", phone: "(351) 555-7492", email: "laurice.reels@example.com", emailOptIn: true, textOptIn: true, visits: 9, lastVisit: "2026-04-08", totalSpend: 1485, membership: "Silver", referralSource: "Google", birthdayMonth: 11 }),
  _mkClient(28, { firstName: "Jennifer", lastName: "Martinez", phone: "(347) 555-1240", email: "jennifer.m@example.com", emailOptIn: true, textOptIn: true, visits: 13, lastVisit: "2026-04-10", totalSpend: 2340, tags: ["VIP"], membership: "Gold", referralSource: "Referral", birthdayMonth: 3 }),
  _mkClient(29, { firstName: "Lenora", lastName: "Codrington", phone: "(718) 805-9748", email: "lenora.c@example.com", emailOptIn: true, textOptIn: false, visits: 4, lastVisit: "2026-03-18", totalSpend: 520, referralSource: "Instagram", birthdayMonth: 8 }),
  _mkClient(30, { firstName: "Nandy", lastName: "Mompremier", phone: "(347) 555-1003", email: "nandy.m@example.com", emailOptIn: true, textOptIn: true, visits: 5, lastVisit: "2026-02-28", totalSpend: 680, referralSource: "Yelp", birthdayMonth: 5 }),
  _mkClient(31, { firstName: "Aaliyah", lastName: "Jackson", phone: "(917) 555-0181", email: "aaliyah.j@example.com", emailOptIn: true, textOptIn: true, visits: 7, lastVisit: "2026-04-13", totalSpend: 1165, referralSource: "Instagram", birthdayMonth: 2, preferredStylistSlug: "oumou-d", tags: ["Loyalist"], membership: "Silver" }),
  _mkClient(32, { firstName: "Brianna", lastName: "Lee", phone: "(347) 555-0144", email: "brianna.lee@example.com", emailOptIn: true, textOptIn: true, visits: 3, lastVisit: "2026-04-13", totalSpend: 435, referralSource: "Google", birthdayMonth: 6 }),
  _mkClient(33, { firstName: "Chanel", lastName: "Morris", phone: "(718) 555-0119", email: "chanel.m@example.com", emailOptIn: true, textOptIn: true, visits: 11, lastVisit: "2026-04-13", totalSpend: 1980, membership: "Silver", referralSource: "Referral", birthdayMonth: 10 }),
  _mkClient(34, { firstName: "Destiny", lastName: "Rivera", phone: "(917) 555-0106", email: "destiny.r@example.com", emailOptIn: true, textOptIn: true, visits: 0, tags: ["New"], referralSource: "Instagram", birthdayMonth: 1, totalSpend: 0 }),
  _mkClient(35, { firstName: "Imani", lastName: "Webb", phone: "(646) 555-0199", email: "imani.webb@example.com", emailOptIn: true, textOptIn: false, visits: 2, totalSpend: 280, referralSource: "Walk-in", birthdayMonth: 11 }),
  _mkClient(36, { firstName: "Janelle", lastName: "Ford", phone: "(347) 555-0155", email: "janelle.f@example.com", emailOptIn: true, textOptIn: true, visits: 5, lastVisit: "2026-04-08", totalSpend: 725, referralSource: "Google", birthdayMonth: 4 }),
  _mkClient(37, { firstName: "Leslie", lastName: "Brooks", phone: "(646) 555-0121", email: "leslie.brooks@example.com", emailOptIn: false, textOptIn: false, visits: 1, lastVisit: "2026-02-05", totalSpend: 235, referralSource: "Yelp", birthdayMonth: 9 }),
  _mkClient(38, { firstName: "Erica", lastName: "Suarez", phone: "(917) 555-0146", email: "erica.s@example.com", emailOptIn: true, textOptIn: true, visits: 6, lastVisit: "2026-03-28", totalSpend: 840, referralSource: "Instagram", birthdayMonth: 7 }),
  _mkClient(39, { firstName: "Gabrielle", lastName: "Kim", phone: "(347) 555-0128", email: "gabrielle.kim@example.com", emailOptIn: true, textOptIn: true, visits: 4, lastVisit: "2026-03-05", totalSpend: 420, referralSource: "Referral", birthdayMonth: 12 }),
  _mkClient(40, { firstName: "Mekka", lastName: "Jeffers", phone: "(347) 555-0147", email: "mekka.jeffers@example.com", emailOptIn: true, textOptIn: true, visits: 9, lastVisit: "2026-04-02", totalSpend: 1665, tags: ["VIP"], membership: "Gold", referralSource: "Referral", birthdayMonth: 3 }),
  // Cast persona — birthday demo. Birthday in 4 days from TODAY (2026-04-14) → 2026-04-18.
  _mkClient(41, { firstName: "Naomi", lastName: "Brooks", phone: "(917) 555-0212", email: "naomi.brooks@example.com", emailOptIn: true, textOptIn: true, visits: 3, lastVisit: "2026-03-21", totalSpend: 480, referralSource: "Instagram", birthdayMonth: 4, birthdayDay: 18, preferredStylistSlug: "fatou-c" }),
];

// Saved audiences (segments)
export type Audience = {
  id: string;
  name: string;
  description: string;
  count: number;
  filters: string[];
};
export const AUDIENCES: Audience[] = [
  { id: "a1", name: "VIP Clients", description: "Top-spending clients with VIP tag", count: 8, filters: ["Tag is VIP", "Total spend > $1500"] },
  { id: "a2", name: "Lapsed Clients", description: "Haven't visited in 90+ days", count: 34, filters: ["Last visit before 2026-01-17"] },
  { id: "a3", name: "New This Month", description: "First visit in April 2026", count: 12, filters: ["First visit on/after 2026-04-01"] },
  { id: "a4", name: "Birthday — May", description: "May birthday celebrants", count: 5, filters: ["Birthday month is May"] },
];

// AI Concierge metadata. Lives alongside the existing fields so the legacy
// /messages list still renders; the new two-stack layout reads `aiState`
// to decide whether a thread lives in "Needs you" or "AI handled."
export type AiState = "needs-you" | "ai-handled" | "ai-replying";
export type AiReason =
  | "escalation"
  | "complaint"
  | "no-availability"
  | "cancellation"
  | "auto-reply"
  | "auto-booking"
  | "faq"
  | "reminder";

export type ConversationTurn = {
  from: "client" | "ai" | "staff";
  body: string;
  ts?: string;
};

// Oopsie / Repair tracking — clients report issues with a previous service,
// upload photos + notes, and the salon books a fix. Per Diéssou's Must-Have
// "Client can report and request fixes to previous service by uploading
// photos of hair and include comments/Notes."
export type RepairStatus = "open" | "in-review" | "scheduled" | "resolved";

export type RepairRequest = {
  id: string;
  clientName: string;
  clientSlug?: string;
  originalApptId?: string;
  originalService?: string;
  originalStylist?: string;
  reportedAt: string; // YYYY-MM-DD
  description: string;
  photoCount: number; // mock — number of attached photos
  status: RepairStatus;
  staffNotes?: string;
  scheduledFor?: string; // ISO date when a repair appt is booked
  resolvedAt?: string;
};

export const REPAIRS: RepairRequest[] = [
  {
    id: "rp1",
    clientName: "Tahirah Patrick",
    clientSlug: undefined,
    originalApptId: "a14",
    originalService: "Knotless Braids",
    originalStylist: "Naomi K.",
    reportedAt: "2026-04-12",
    description:
      "Braids unraveled at the nape after 3 days. Edges are also itchy and pulling. Photos attached.",
    photoCount: 3,
    status: "open",
    staffNotes: "Schedule with Oumou for tightening on Wed afternoon if possible.",
  },
  {
    id: "rp2",
    clientName: "Brianna Lee",
    originalApptId: "a16",
    originalService: "Silk Press",
    originalStylist: "Naomi K.",
    reportedAt: "2026-04-10",
    description:
      "Press went limp the next day. Hair feels coated. Reaction to product?",
    photoCount: 2,
    status: "in-review",
    staffNotes: "Awaiting Naomi's notes from intake form.",
  },
  {
    id: "rp3",
    clientName: "Ayanna Cole",
    originalApptId: "a09",
    originalService: "Box Braids — Waist",
    originalStylist: "Mame Diarra",
    reportedAt: "2026-04-08",
    description:
      "Two braids fell out near the crown. Otherwise lasting beautifully.",
    photoCount: 1,
    status: "scheduled",
    scheduledFor: "2026-04-16",
  },
  {
    id: "rp4",
    clientName: "Aaliyah Jackson",
    clientSlug: "aaliyah-j",
    originalApptId: "a25",
    originalService: "Knotless Braids",
    originalStylist: "Mame Diarra",
    reportedAt: "2026-04-01",
    description:
      "A few braids loosened around week 4. Fixed in 15 min, comp'd. Aaliyah was very gracious.",
    photoCount: 0,
    status: "resolved",
    resolvedAt: "2026-04-02",
  },
];

export type Conversation = {
  id: string;
  name: string;
  preview: string;
  time: string;
  unread?: boolean;
  status: "open" | "closed";
  // — AI Concierge additions —
  phone?: string;
  aiState?: AiState;
  aiReason?: AiReason;
  // Short label for what the AI did, or why it escalated.
  aiSummary?: string;
  // If the AI committed a booking inside this thread, the appointment id.
  bookingId?: string;
  // Full transcript for the conversation pane. Mixed AI + client + staff.
  transcript?: ConversationTurn[];
};

export const CONVERSATIONS: Conversation[] = [
  // ───────── AI Concierge showcase threads (pinned to the top) ─────────
  {
    id: "c-ai-1",
    name: "Destiny Rivera",
    phone: "(929) 555-0388",
    preview: "AI booked Knotless · Apr 15 10am with Mame Diarra",
    time: "just now",
    status: "open",
    aiState: "ai-handled",
    aiReason: "auto-booking",
    aiSummary: "First-time client. AI proposed slots, she confirmed, booked.",
    bookingId: "a26",
    transcript: [
      { from: "client", body: "hi! i'd love to book knotless braids for tomorrow if anyone's available 🙏", ts: "10:42a" },
      { from: "ai", body: "Hi Destiny! Welcome to Jolieden. I see Mame Diarra has 10am open tomorrow (Apr 15) for medium knotless — 3hrs, $235. Want me to lock it in?", ts: "10:42a" },
      { from: "client", body: "yes please!", ts: "10:43a" },
      { from: "ai", body: "Booked! 📅 Sat Apr 15 · 10am with Mame Diarra · Medium Knotless · $235. $25 deposit auto-applied. I'll text you a reminder 24h before. Anything else?", ts: "10:43a" },
      { from: "client", body: "perfect, ty!!", ts: "10:43a" },
    ],
  },
  {
    id: "c-ai-2",
    name: "Aaliyah Jackson",
    phone: "(917) 555-0181",
    preview: "AI is replying… (Aaliyah is texting about her rebook)",
    time: "now",
    status: "open",
    aiState: "ai-replying",
    aiReason: "auto-booking",
    aiSummary: "Mid-thread. AI is reading Aaliyah's history to propose Oumou's next opening.",
    transcript: [
      { from: "client", body: "hey it's aaliyah! i'm due for my knotless again, can I get oumou next sat?", ts: "10:51a" },
      { from: "ai", body: "Hi Aaliyah! Checking Oumou's calendar now — one sec…", ts: "10:51a" },
    ],
  },
  {
    id: "c-ai-3",
    name: "Janelle Ford",
    phone: "(347) 555-0921",
    preview: "AI booked Silk Press · Apr 15 5pm with Frederick",
    time: "32m",
    status: "open",
    aiState: "ai-handled",
    aiReason: "auto-booking",
    aiSummary: "Returning client. Confirmed her usual silk press at her usual time.",
    bookingId: "a27",
    transcript: [
      { from: "client", body: "any silk press slots open tomorrow evening?", ts: "10:18a" },
      { from: "ai", body: "Hi Janelle! Frederick has 5pm open tomorrow — same time as your last 3 visits. Lock it?", ts: "10:18a" },
      { from: "client", body: "yes please", ts: "10:19a" },
      { from: "ai", body: "Booked: Apr 15 · 5pm with Frederick Douglass · Silk Press · $145. See you tomorrow! ✨", ts: "10:19a" },
    ],
  },
  {
    id: "c-ai-4",
    name: "Yvonne Adams",
    phone: "(646) 555-0710",
    preview: "AI booked Wash & Style · today 4:30pm",
    time: "1h",
    status: "open",
    aiState: "ai-handled",
    aiReason: "auto-booking",
    aiSummary: "Same-day request. AI found Fatou's 4:30 gap, booked.",
    bookingId: "a28",
    transcript: [
      { from: "client", body: "any chance i can squeeze in a wash and style today after work? around 5?", ts: "9:38a" },
      { from: "ai", body: "Yes — Fatou has 4:30pm open today. Wash & Style runs ~90 min. Want me to grab it?", ts: "9:39a" },
      { from: "client", body: "yes pls!", ts: "9:39a" },
      { from: "ai", body: "Booked: today · 4:30pm with Fatou Ciss · Wash & Style · $95. See you soon! 💜", ts: "9:39a" },
    ],
  },
  {
    id: "c-ai-5",
    name: "Imani Webb",
    phone: "(646) 555-0199",
    preview: "AI escalated · box dye + balayage question",
    time: "18m",
    status: "open",
    aiState: "needs-you",
    aiReason: "escalation",
    aiSummary: "Custom color question — AI handed off to Dieynaba for a strand-test plan.",
    transcript: [
      { from: "client", body: "i do box dye at home every month. will that mess up the balayage with dieynaba next week?", ts: "10:32a" },
      { from: "ai", body: "Great question to ask before color! Box dye buildup can affect lift. Let me get Dieynaba directly so she can plan with you.", ts: "10:32a" },
      { from: "ai", body: "Looping her in now — one sec.", ts: "10:33a" },
    ],
  },
  {
    id: "c-ai-6",
    name: "Tahirah Patrick",
    phone: "(347) 555-0612",
    preview: "Wants refund for last visit · sentiment flagged",
    time: "26m",
    status: "open",
    aiState: "needs-you",
    aiReason: "complaint",
    aiSummary: "Negative sentiment + refund request. AI surfaced for human review.",
    transcript: [
      { from: "client", body: "im really upset about my last appointment. my braids unraveled in 3 days and ive been ignored", ts: "10:24a" },
      { from: "ai", body: "I'm so sorry, Tahirah. This needs Diéssou's attention directly — she'll personally reply within an hour. Your last visit details are in front of her now.", ts: "10:24a" },
    ],
  },
  {
    id: "c-ai-7",
    name: "Mariana Lopez",
    phone: "(929) 555-0204",
    preview: "Wants Sat 10am · all booked",
    time: "44m",
    status: "open",
    aiState: "needs-you",
    aiReason: "no-availability",
    aiSummary: "Saturday 10am request — no stylist available. AI offered waitlist; she wants to talk to staff.",
    transcript: [
      { from: "client", body: "i need to book saturday 10am for a silk press, my flight is at 2", ts: "10:06a" },
      { from: "ai", body: "Saturday 10am is fully booked. Closest options: Sat 9am with Adja, Fri 4pm with Naomi K., or join the waitlist for Sat 10am.", ts: "10:06a" },
      { from: "client", body: "none work, can i talk to someone?", ts: "10:08a" },
    ],
  },

  // ───────── Existing system + reminder threads (carried over) ─────────
  { id: "c1", name: "Unknown", preview: "(347) 242-6515 — You have a new booking 💅 Mame Diarra", time: "1m", status: "open", aiState: "ai-handled", aiReason: "auto-reply", aiSummary: "System notification — no client response needed." },
  { id: "c2", name: "Unknown", phone: "(917) 574-9063", preview: "(917) 574-9063 — Hi, is there a charge when you place a hold?", time: "12m", status: "open", aiState: "ai-handled", aiReason: "faq", aiSummary: "AI answered: $25 deposit, refundable 48h+ in advance." },
  { id: "c3", name: "Otienno Njoku", preview: "(516) 887-7053 — Hi Otienno, your upcoming appointment...", time: "1h", status: "open", aiState: "ai-handled", aiReason: "reminder", aiSummary: "24-hour reminder sent." },
  { id: "c4", name: "Lauren Rohe", preview: "Hi Lauren, your upcoming appointment is...", time: "1h", status: "open", unread: true, aiState: "ai-handled", aiReason: "reminder", aiSummary: "Reminder sent." },
  { id: "c5", name: "Devorae Riney", preview: "(917) 663-4087 — Hi Devorae, your upcoming appointment...", time: "2h", status: "open", aiState: "ai-handled", aiReason: "reminder" },
  { id: "c6", name: "Nakeesha Coachman", preview: "(646) 240-9554 — Hi Nakeesha, your upcoming...", time: "2h", status: "open", aiState: "ai-handled", aiReason: "reminder" },
  { id: "c7", name: "Laurice Reels", preview: "(351) 555-7492 — Hi Laurice, your upcoming...", time: "3h", status: "open", aiState: "ai-handled", aiReason: "reminder" },
  { id: "c8", name: "Jennifer Martinez", preview: "(347) 555-1240 — Hi Jennifer, your upcoming...", time: "3h", status: "open", aiState: "ai-handled", aiReason: "reminder" },
  { id: "c9", name: "Lenora Codrington", preview: "(718) 805-9748 — Hi Lenora, your upcoming...", time: "4h", status: "open", aiState: "ai-handled", aiReason: "reminder" },
  { id: "c10", name: "Unknown", preview: "(347) 459-4096 — You have a new online booking 💅 Jenna L.", time: "5h", status: "open", aiState: "ai-handled", aiReason: "auto-reply" },
  { id: "c11", name: "Unknown", preview: "(917) 991-2024 — Your client has arrived 💜 Neysia", time: "5h", status: "open", aiState: "ai-handled", aiReason: "auto-reply" },
  { id: "c12", name: "Unknown", preview: "(929) 845-9923 — You have a new online booking 💅 Sewa S.", time: "6h", status: "open", aiState: "ai-handled", aiReason: "auto-reply" },
  { id: "c13", name: "Unknown", preview: "(929) 689-8329 — Your client has arrived 💜 Shay G.", time: "6h", status: "open", aiState: "ai-handled", aiReason: "auto-reply" },
  { id: "c14", name: "Unknown", preview: "(940) 217-1490 — You have a new online booking 💅 Juliana D.", time: "7h", status: "open", aiState: "ai-handled", aiReason: "auto-reply" },
  { id: "c15", name: "Unknown", preview: "(929) 398-9357 — Your client has cancelled 💔 Nandy M.", time: "8h", status: "open", aiState: "needs-you", aiReason: "cancellation", aiSummary: "Cancellation within 24h — penalty review needed." },
  { id: "c16", name: "Nandy Mompremier", preview: "(347) 555-1003 — Hi Nandy, your appointment at Jolieden's...", time: "9h", status: "open", aiState: "ai-handled", aiReason: "reminder" },
];
