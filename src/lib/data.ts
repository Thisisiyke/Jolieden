export type ApptStatus =
  | "unconfirmed"
  | "confirmed"
  | "walkin"
  | "arrived"
  | "active"
  | "completed";

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
  mk({ date: TOMORROW, client: "Destiny Rivera", pronouns: "She/Her", start: "10:00am", end: "1:00pm", service: "Knotless Braids", staff: "Mame Diarra", price: 235, status: "unconfirmed", isNewClient: true }),
  mk({ date: TOMORROW, client: "Imani Webb", start: "2:00pm", end: "4:00pm", service: "Color Refresh", staff: "Naomi K.", price: 140, status: "confirmed" }),
  mk({ date: TOMORROW, client: "Janelle Ford", pronouns: "She/Her", start: "5:00pm", end: "7:00pm", service: "Silk Press", staff: "Frederick Douglass", price: 145, status: "confirmed" }),
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

export type Conversation = {
  id: string;
  name: string;
  preview: string;
  time: string;
  unread?: boolean;
  status: "open" | "closed";
};

export const CONVERSATIONS: Conversation[] = [
  { id: "c1", name: "Unknown", preview: "(347) 242-6515 — You have a new booking 💅 Mame Diarra", time: "1m", status: "open" },
  { id: "c2", name: "Unknown", preview: "(917) 574-9063 — Hi, is there a charge when you place a hold?", time: "12m", status: "open" },
  { id: "c3", name: "Otienno Njoku", preview: "(516) 887-7053 — Hi Otienno, your upcoming appointment...", time: "1h", status: "open" },
  { id: "c4", name: "Lauren Rohe", preview: "Hi Lauren, your upcoming appointment is...", time: "1h", status: "open", unread: true },
  { id: "c5", name: "Devorae Riney", preview: "(917) 663-4087 — Hi Devorae, your upcoming appointment...", time: "2h", status: "open" },
  { id: "c6", name: "Nakeesha Coachman", preview: "(646) 240-9554 — Hi Nakeesha, your upcoming...", time: "2h", status: "open" },
  { id: "c7", name: "Laurice Reels", preview: "(351) 555-7492 — Hi Laurice, your upcoming...", time: "3h", status: "open" },
  { id: "c8", name: "Jennifer Martinez", preview: "(347) 555-1240 — Hi Jennifer, your upcoming...", time: "3h", status: "open" },
  { id: "c9", name: "Lenora Codrington", preview: "(718) 805-9748 — Hi Lenora, your upcoming...", time: "4h", status: "open" },
  { id: "c10", name: "Unknown", preview: "(347) 459-4096 — You have a new online booking 💅 Jenna L.", time: "5h", status: "open" },
  { id: "c11", name: "Unknown", preview: "(917) 991-2024 — Your client has arrived 💜 Neysia", time: "5h", status: "open" },
  { id: "c12", name: "Unknown", preview: "(929) 845-9923 — You have a new online booking 💅 Sewa S.", time: "6h", status: "open" },
  { id: "c13", name: "Unknown", preview: "(929) 689-8329 — Your client has arrived 💜 Shay G.", time: "6h", status: "open" },
  { id: "c14", name: "Unknown", preview: "(940) 217-1490 — You have a new online booking 💅 Juliana D.", time: "7h", status: "open" },
  { id: "c15", name: "Unknown", preview: "(929) 398-9357 — Your client has cancelled 💔 Nandy M.", time: "8h", status: "open" },
  { id: "c16", name: "Nandy Mompremier", preview: "(347) 555-1003 — Hi Nandy, your appointment at Jolieden's...", time: "9h", status: "open" },
];
