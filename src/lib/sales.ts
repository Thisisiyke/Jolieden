export type OrderStatus = "Closed" | "Open" | "Refunded" | "Voided";

export type OrderLineItem = {
  id: string;
  service: string;
  staff: string;
  price: number;
  modifiers?: string[];
};
export type OrderPayment = {
  id: string;
  method: "Visa" | "MasterCard" | "Discover" | "Amex" | "Cash" | "Account Credit" | "Voucher";
  last4?: string;
  expires?: string;
  amount: number;
};
export type Order = {
  id: string;
  number: string;
  uuid: string;
  date: string; // YYYY-MM-DD
  time: string; // "2:14pm"
  client: string;
  clientPhone?: string;
  clientEmail?: string;
  status: OrderStatus;
  staff: string;
  lineItems: OrderLineItem[];
  creditFee: number;
  tax: number;
  total: number;
  payments: OrderPayment[];
  note?: string;
  tags?: string[];
  appointmentDate?: string;
};

export const ORDERS: Order[] = [
  {
    id: "o1", number: "#22421", uuid: "9d3a-22421",
    date: "2026-05-18", time: "2:14pm",
    client: "LaTarika Pierce", clientPhone: "(917) 555-0172", clientEmail: "latarika.p@example.com",
    status: "Closed", staff: "Mame Diarra",
    lineItems: [
      { id: "li1", service: "Knotless — Waist Length", staff: "Mame Diarra", price: 320, modifiers: ["4 packs", "Waist length", "Curly ends", "1B"] },
      { id: "li2", service: "Tip", staff: "Mame Diarra", price: 64 },
    ],
    creditFee: 11.52, tax: 0, total: 395.52,
    payments: [{ id: "p1", method: "Visa", last4: "4242", expires: "09/29", amount: 395.52 }],
    appointmentDate: "May 18, 9:00am – 2:00pm",
    tags: ["VIP"],
    note: "Color refresh due at next visit",
  },
  {
    id: "o2", number: "#22420", uuid: "9d3a-22420",
    date: "2026-05-18", time: "4:46pm",
    client: "Neysia Scott", status: "Closed", staff: "Naomi K.",
    lineItems: [
      { id: "li1", service: "Box Braids — Waist", staff: "Naomi K.", price: 310 },
    ],
    creditFee: 9.30, tax: 0, total: 319.30,
    payments: [{ id: "p1", method: "MasterCard", last4: "5588", expires: "11/27", amount: 319.30 }],
  },
  {
    id: "o3", number: "#22419", uuid: "9d3a-22419",
    date: "2026-05-18", time: "1:22pm",
    client: "Asia Sampson", status: "Closed", staff: "Mame Diarra",
    lineItems: [
      { id: "li1", service: "Color + Style", staff: "Mame Diarra", price: 220 },
      { id: "li2", service: "Edge tamer — 4oz", staff: "Mame Diarra", price: 12 },
    ],
    creditFee: 6.96, tax: 1.05, total: 240.01,
    payments: [
      { id: "p1", method: "Cash", amount: 100 },
      { id: "p2", method: "Visa", last4: "1111", expires: "03/28", amount: 140.01 },
    ],
  },
  {
    id: "o4", number: "#22418", uuid: "9d3a-22418",
    date: "2026-05-18", time: "11:11am",
    client: "Maimouna Sangare", status: "Closed", staff: "Mame Diarra",
    lineItems: [{ id: "li1", service: "Knotless Braids", staff: "Mame Diarra", price: 235 }],
    creditFee: 7.05, tax: 0, total: 242.05,
    payments: [{ id: "p1", method: "Discover", last4: "9933", expires: "02/30", amount: 242.05 }],
  },
  {
    id: "o5", number: "#22417", uuid: "9d3a-22417",
    date: "2026-05-18", time: "12:01pm",
    client: "Sonja Harris", status: "Open", staff: "Mame Diarra",
    lineItems: [{ id: "li1", service: "Color Refresh", staff: "Mame Diarra", price: 140 }],
    creditFee: 0, tax: 0, total: 140,
    payments: [],
  },
  {
    id: "o6", number: "#22416", uuid: "9d3a-22416",
    date: "2026-05-17", time: "8:39pm",
    client: "Tracey Brown", clientPhone: "(917) 224-1180", clientEmail: "tracey.b@example.com",
    status: "Closed", staff: "Frederick Douglass",
    lineItems: [
      { id: "li1", service: "Silk Press", staff: "Frederick Douglass", price: 145, modifiers: ["Standard wash", "Mid-back"] },
      { id: "li2", service: "Edge tamer — 4oz", staff: "Frederick Douglass", price: 12 },
    ],
    creditFee: 4.71, tax: 1.05, total: 162.76,
    payments: [{ id: "p1", method: "Visa", last4: "4242", expires: "09/29", amount: 162.76 }],
    appointmentDate: "May 17, 6:15pm – 8:30pm",
  },
  {
    id: "o7", number: "#22415", uuid: "9d3a-22415",
    date: "2026-05-17", time: "3:14pm",
    client: "Brianna Lee", status: "Refunded", staff: "Naomi K.",
    lineItems: [{ id: "li1", service: "Silk Press", staff: "Naomi K.", price: 145 }],
    creditFee: 0, tax: 0, total: 145,
    payments: [{ id: "p1", method: "Visa", last4: "0091", expires: "06/28", amount: 145 }],
  },
  {
    id: "o8", number: "#22414", uuid: "9d3a-22414",
    date: "2026-05-15", time: "5:42pm",
    client: "Chanel Morris", status: "Voided", staff: "Frederick Douglass",
    lineItems: [{ id: "li1", service: "Box Braids — Shoulder", staff: "Frederick Douglass", price: 180 }],
    creditFee: 0, tax: 0, total: 0,
    payments: [],
  },
];

export type Drawer = {
  id: string;
  label: string;
  cashSales: number;
  cashRefunds: number;
  cashPaidIn: number;
  expensesOut: number;
  depositsOut: number;
  expected: number;
  current?: boolean;
};
export const DRAWERS: Drawer[] = [
  { id: "d-now",  label: "Current Drawer",                                        cashSales: 1248, cashRefunds: -45,  cashPaidIn: 200, expensesOut: -68,  depositsOut: -5517, expected: 800.00, current: true },
  { id: "d1",     label: "Tuesday May 19, 2026 @ 12:09 am",                        cashSales: 982,  cashRefunds: 0,    cashPaidIn: 200, expensesOut: 0,    depositsOut: -1100, expected: 82 },
  { id: "d2",     label: "Monday May 18, 2026 @ 11:42 pm",                         cashSales: 1410, cashRefunds: -120, cashPaidIn: 200, expensesOut: -45,  depositsOut: -1300, expected: 145 },
  { id: "d3",     label: "Sunday May 17, 2026 @ 11:54 pm",                         cashSales: 1140, cashRefunds: 0,    cashPaidIn: 200, expensesOut: -22,  depositsOut: -1100, expected: 218 },
  { id: "d4",     label: "Saturday May 16, 2026 @ 11:50 pm",                       cashSales: 1872, cashRefunds: -80,  cashPaidIn: 200, expensesOut: -38,  depositsOut: -1800, expected: 154 },
];

export type GiftCard = {
  id: string;
  purchasingClient: string;
  code: string;
  balance: number;
  recipient: string;
  recipientEmail: string;
  source: "online" | "in-store";
  active: boolean;
};
export const GIFT_CARDS: GiftCard[] = [
  { id: "g1", purchasingClient: "Yvonne Williams",  code: "GC-A18F-2210", balance: 100, recipient: "Tasha Williams",  recipientEmail: "tasha.w@example.com",  source: "online",   active: true },
  { id: "g2", purchasingClient: "Maimouna Sangare", code: "GC-77BC-1199", balance: 50,  recipient: "Mariam Sangare",  recipientEmail: "mariam.s@example.com", source: "in-store", active: true },
  { id: "g3", purchasingClient: "Layla McGrady",    code: "GC-EE40-8801", balance: 0,   recipient: "Cousin Maya",     recipientEmail: "maya@example.com",     source: "online",   active: false },
  { id: "g4", purchasingClient: "Nicole Lambert",   code: "GC-91D2-4477", balance: 75,  recipient: "Sonya Lambert",   recipientEmail: "sonya.l@example.com",  source: "online",   active: true },
  { id: "g5", purchasingClient: "Asia Sampson",     code: "GC-22FF-0033", balance: 200, recipient: "Self",            recipientEmail: "asia.sampson@example.com", source: "in-store", active: true },
];

export type MembershipStatus = "Active" | "Paused" | "Past due" | "Cancellation scheduled" | "Cancelled";
export type Membership = {
  id: string;
  client: string;
  plan: string;
  price: number;
  nextCharge: string;
  status: MembershipStatus;
  lastUpdate: string;
  startDate: string;
};

// Currently empty on this account — the spec calls out the empty state.
export const MEMBERSHIPS: Membership[] = [];
