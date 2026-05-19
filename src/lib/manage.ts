export const MANAGE_SECTIONS = [
  { id: "billing", label: "Billing" },
  { id: "client-notifications", label: "Client Notifications" },
  { id: "details", label: "Details" },
  { id: "hardware", label: "Hardware" },
  { id: "membership-plans", label: "Membership Plans" },
  { id: "packages", label: "Packages" },
  { id: "payment-processing", label: "Payment Processing" },
  { id: "products", label: "Products" },
  { id: "purchase-orders", label: "Purchase Orders" },
  { id: "ratings", label: "Ratings" },
  { id: "resources", label: "Resources" },
  { id: "schedule", label: "Schedule" },
  { id: "security", label: "Security" },
  { id: "services", label: "Services" },
  { id: "staff", label: "Staff" },
];

export type Invoice = {
  id: string;
  dueDate: string;
  chargeDate: string;
  amount: number;
  paid: boolean;
};
export const INVOICES: Invoice[] = [
  { id: "INV-10421", dueDate: "May 1, 2026", chargeDate: "Apr 28, 2026", amount: 199.00, paid: true },
  { id: "INV-10310", dueDate: "Apr 1, 2026", chargeDate: "Mar 28, 2026", amount: 199.00, paid: true },
  { id: "INV-10199", dueDate: "Mar 1, 2026", chargeDate: "Feb 26, 2026", amount: 199.00, paid: true },
  { id: "INV-10088", dueDate: "Feb 1, 2026", chargeDate: "Jan 29, 2026", amount: 179.00, paid: true },
  { id: "INV-09977", dueDate: "Jan 1, 2026", chargeDate: "Dec 28, 2025", amount: 179.00, paid: true },
];

export type Notification = {
  id: string;
  label: string;
  description: string;
  email: boolean;
  text: boolean;
};
export const APPT_NOTIFICATIONS: Notification[] = [
  { id: "n1", label: "Booking confirmation", description: "Sent immediately when a client books", email: true, text: true },
  { id: "n2", label: "3-day reminder", description: "Sent 72 hours before the appointment", email: false, text: true },
  { id: "n3", label: "2-day reminder", description: "Sent 48 hours before the appointment", email: true, text: false },
  { id: "n4", label: "Same-day reminder", description: "Sent the morning of the appointment", email: false, text: true },
  { id: "n5", label: "Order receipt", description: "Sent after checkout completes", email: true, text: false },
  { id: "n6", label: "Rating request", description: "Sent 24 hours after the appointment", email: true, text: false },
];

export type IPad = {
  id: string;
  name: string;
  status: "Online" | "Offline" | "Idle";
  chipReader: string;
  firmware: string;
  isDefault: boolean;
};
export const IPADS: IPad[] = [
  { id: "ip1", name: "Front desk iPad", status: "Online", chipReader: "BBPOS WisePOS E", firmware: "v2.18.0", isDefault: true },
  { id: "ip2", name: "Mame's station", status: "Idle", chipReader: "BBPOS WisePOS E", firmware: "v2.18.0", isDefault: false },
  { id: "ip3", name: "Naomi's station", status: "Offline", chipReader: "—", firmware: "v2.17.5", isDefault: false },
];

export type Product = {
  id: string;
  enabled: boolean;
  name: string;
  suppliers: string[];
  brand: string;
  category: string;
  price: number;
  stock: number;
};
export const PRODUCTS: Product[] = [
  { id: "p1", enabled: true,  name: "Braiding hair #1 — Jet Black",   suppliers: ["X-Pression"], brand: "X-Pression", category: "Hair",    price: 9.50,  stock: 84 },
  { id: "p2", enabled: true,  name: "Braiding hair #1B — Off Black",  suppliers: ["X-Pression"], brand: "X-Pression", category: "Hair",    price: 9.50,  stock: 62 },
  { id: "p3", enabled: true,  name: "Braiding hair #2 — Dark Brown",  suppliers: ["X-Pression"], brand: "X-Pression", category: "Hair",    price: 9.50,  stock: 18 },
  { id: "p4", enabled: false, name: "Braiding hair #4 — Light Brown", suppliers: ["X-Pression"], brand: "X-Pression", category: "Hair",    price: 9.50,  stock: 0 },
  { id: "p5", enabled: true,  name: "Edge tamer — 4oz",               suppliers: ["Cantu"],      brand: "Cantu",      category: "Styling", price: 12.00, stock: 24 },
  { id: "p6", enabled: true,  name: "Scalp oil — Rosemary mint",      suppliers: ["Mielle"],    brand: "Mielle",      category: "Care",    price: 18.00, stock: 12 },
  { id: "p7", enabled: true,  name: "Curl cream — 8oz",               suppliers: ["Cantu"],      brand: "Cantu",      category: "Styling", price: 14.00, stock: 9 },
  { id: "p8", enabled: true,  name: "Bonnet — Silk-lined",            suppliers: ["Grace Eleyae"], brand: "Grace Eleyae", category: "Accessories", price: 32.00, stock: 6 },
];

export type PurchaseOrder = {
  id: string;
  orderedAt: string;
  supplier: string;
  status: "Active" | "Received" | "Incomplete";
  received: number;
  ordered: number;
  expected: string;
  total: number;
};
export const PURCHASE_ORDERS: PurchaseOrder[] = [
  { id: "PO-2041", orderedAt: "Apr 22, 2026", supplier: "X-Pression",     status: "Active",     received: 12, ordered: 60, expected: "May 16, 2026", total: 570.00 },
  { id: "PO-2034", orderedAt: "Apr 14, 2026", supplier: "Cantu",          status: "Received",   received: 24, ordered: 24, expected: "Apr 22, 2026", total: 288.00 },
  { id: "PO-2028", orderedAt: "Apr 02, 2026", supplier: "Mielle",         status: "Incomplete", received: 8,  ordered: 18, expected: "Apr 14, 2026", total: 324.00 },
  { id: "PO-2019", orderedAt: "Mar 28, 2026", supplier: "Grace Eleyae",   status: "Received",   received: 12, ordered: 12, expected: "Apr 06, 2026", total: 384.00 },
];

export type Rating = {
  id: string;
  client: string;
  date: string;
  service: string;
  stars: number;
  comment: string;
  replied?: boolean;
};
export const RATINGS: Rating[] = [
  { id: "r1", client: "LaTarika Pierce",  date: "Apr 14, 2026", service: "Knotless — Waist Length", stars: 5, comment: "Mame is the best — careful, fast, and the parts are immaculate. Already rebooked for June." },
  { id: "r2", client: "Yvonne Williams",  date: "Apr 14, 2026", service: "Color Refresh", stars: 5, comment: "Color came out gorgeous. Loving the gloss treatment." },
  { id: "r3", client: "Maimouna Sangare", date: "Apr 14, 2026", service: "Knotless Braids", stars: 4, comment: "Beautiful work. The shop got a little busy mid-appointment but Mame handled it well.", replied: true },
  { id: "r4", client: "Asia Sampson",     date: "Apr 14, 2026", service: "Color + Style", stars: 5, comment: "Always leave happy. Thank you Mame!" },
  { id: "r5", client: "Tracey Brown",     date: "Apr 13, 2026", service: "Silk Press", stars: 3, comment: "Service was good but the wait was long even with an appointment." },
  { id: "r6", client: "Brianna Lee",      date: "Apr 13, 2026", service: "Silk Press", stars: 5, comment: "Naomi is magic. 10/10." },
];

export type StaffRow = {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: "Manager" | "General Staff" | "Hair Washer";
  permission: "Admin" | "Location Manager" | "Service Provider";
  invite: "Confirmed" | "Send Invite" | "Resend";
};
export const STAFF_DIRECTORY: StaffRow[] = [
  { id: "s1", name: "Frederick Douglass", phone: "(917) 555-0100", email: "fred@jolieden.com",  role: "Manager",       permission: "Admin",            invite: "Confirmed" },
  { id: "s2", name: "Mame Diarra",        phone: "(347) 555-0118", email: "mame@jolieden.com",  role: "General Staff", permission: "Service Provider", invite: "Confirmed" },
  { id: "s3", name: "Naomi K.",           phone: "(917) 555-0136", email: "naomi@jolieden.com", role: "General Staff", permission: "Service Provider", invite: "Confirmed" },
  { id: "s4", name: "Adja Timite",        phone: "(347) 555-0144", email: "adja@jolieden.com",  role: "General Staff", permission: "Service Provider", invite: "Send Invite" },
  { id: "s5", name: "Aminata Diawara",    phone: "(646) 555-0167", email: "aminata@jolieden.com", role: "General Staff", permission: "Service Provider", invite: "Resend" },
  { id: "s6", name: "Bebe Kaba",          phone: "(718) 555-0123", email: "bebe@jolieden.com",  role: "General Staff", permission: "Service Provider", invite: "Confirmed" },
  { id: "s7", name: "Lina O.",            phone: "(212) 555-0142", email: "lina@jolieden.com",  role: "Hair Washer",   permission: "Service Provider", invite: "Confirmed" },
  { id: "s8", name: "Asha P.",            phone: "(917) 555-0188", email: "asha@jolieden.com",  role: "Hair Washer",   permission: "Service Provider", invite: "Confirmed" },
];

export type ServiceCategory = {
  id: string;
  name: string;
  count: number;
};
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: "sc1", name: "Knotless Braids",  count: 6 },
  { id: "sc2", name: "Box Braids",       count: 5 },
  { id: "sc3", name: "Bohemian Knotless", count: 4 },
  { id: "sc4", name: "French Curls",     count: 3 },
  { id: "sc5", name: "Twists & Locs",    count: 5 },
  { id: "sc6", name: "Silk Press & Style", count: 4 },
  { id: "sc7", name: "Color",            count: 6 },
  { id: "sc8", name: "Add-ons",          count: 7 },
];

export type ServiceItem = {
  id: string;
  enabled: boolean;
  name: string;
  category: string;
  duration: string;
  price: number;
  schedulingOrder: "Flexible" | "Sequential";
};
export const SERVICES_LIST: ServiceItem[] = [
  { id: "sv1", enabled: true,  name: "Knotless — Mid Back",    category: "Knotless Braids", duration: "3h",   price: 235, schedulingOrder: "Flexible" },
  { id: "sv2", enabled: true,  name: "Knotless — Waist",       category: "Knotless Braids", duration: "5h",   price: 320, schedulingOrder: "Flexible" },
  { id: "sv3", enabled: true,  name: "Box Braids — Shoulder",  category: "Box Braids",      duration: "2.5h", price: 180, schedulingOrder: "Flexible" },
  { id: "sv4", enabled: true,  name: "Box Braids — Waist",     category: "Box Braids",      duration: "5h",   price: 310, schedulingOrder: "Flexible" },
  { id: "sv5", enabled: false, name: "Cornrows — 6 to 8",      category: "Twists & Locs",   duration: "1.5h", price: 120, schedulingOrder: "Sequential" },
  { id: "sv6", enabled: true,  name: "Silk Press",             category: "Silk Press & Style", duration: "2h", price: 145, schedulingOrder: "Flexible" },
  { id: "sv7", enabled: true,  name: "Color Refresh",          category: "Color",           duration: "2h",   price: 140, schedulingOrder: "Sequential" },
  { id: "sv8", enabled: true,  name: "Deep Conditioning",      category: "Add-ons",         duration: "45m",  price: 45,  schedulingOrder: "Flexible" },
];
