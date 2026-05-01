export type SummaryReportId =
  | "sales-summary"
  | "daily-summary"
  | "product-sales"
  | "package-sales"
  | "membership-sales"
  | "payments-refunds"
  | "detailed-line-item"
  | "register-closeout"
  | "staff-performance"
  | "staff-schedule"
  | "time-clock"
  | "sales-breakdown"
  | "service-sales-by-staff"
  | "product-sales-by-staff"
  | "operator-activity"
  | "commission-summary"
  | "service-commission"
  | "product-commission"
  | "package-commission"
  | "membership-commission"
  | "tip-commission"
  | "net-revenue-by-day"
  | "net-revenue-by-staff"
  | "appointment-metrics"
  | "service-sales-by-category"
  | "business-charges"
  | "inventory-on-hand"
  | "product-sales-by-brand"
  | "product-sales-by-category"
  | "product-quantity-adjustments"
  | "referral-sources"
  | "client-visit-frequency"
  | "booked-forecast-by-day"
  | "booked-forecast-by-staff"
  | "client-accounts-liability"
  | "voucher-redemptions"
  | "tag-summary"
  | "resource-utilization";

export type SummaryGroup = {
  label: string;
  icon: string;
  items: { id: SummaryReportId; label: string }[];
};

export const SUMMARY_GROUPS: SummaryGroup[] = [
  { label: "Sales", icon: "💰", items: [
    { id: "sales-summary", label: "Sales Summary" },
    { id: "daily-summary", label: "Daily Summary" },
    { id: "product-sales", label: "Product Sales" },
    { id: "package-sales", label: "Package Sales" },
    { id: "membership-sales", label: "Membership Sales" },
    { id: "payments-refunds", label: "Payments & Refunds" },
    { id: "detailed-line-item", label: "Detailed Line Item" },
    { id: "register-closeout", label: "Register Closeout" },
  ]},
  { label: "Staff", icon: "👥", items: [
    { id: "staff-performance", label: "Staff Performance" },
    { id: "staff-schedule", label: "Staff Schedule" },
    { id: "time-clock", label: "Time Clock" },
    { id: "sales-breakdown", label: "Sales Breakdown" },
    { id: "service-sales-by-staff", label: "Service Sales by Staff" },
    { id: "product-sales-by-staff", label: "Product Sales by Staff" },
    { id: "operator-activity", label: "Operator Activity" },
  ]},
  { label: "Commission", icon: "💵", items: [
    { id: "commission-summary", label: "Commission Summary" },
    { id: "service-commission", label: "Service Commission" },
    { id: "product-commission", label: "Product Commission" },
    { id: "package-commission", label: "Package Commission" },
    { id: "membership-commission", label: "Membership Commission" },
    { id: "tip-commission", label: "Tip Commission" },
    { id: "net-revenue-by-day", label: "Net Revenue by Day" },
    { id: "net-revenue-by-staff", label: "Net Revenue by Staff" },
  ]},
  { label: "Appointments", icon: "📅", items: [
    { id: "appointment-metrics", label: "Appointment Metrics" },
    { id: "service-sales-by-category", label: "Service Sales by Category" },
    { id: "business-charges", label: "Business Charges" },
  ]},
  { label: "Inventory", icon: "📦", items: [
    { id: "inventory-on-hand", label: "Inventory On Hand" },
    { id: "product-sales-by-brand", label: "Product Sales by Brand" },
    { id: "product-sales-by-category", label: "Product Sales by Category" },
    { id: "product-quantity-adjustments", label: "Product Quantity Adjustments" },
  ]},
  { label: "Clients", icon: "🧑", items: [
    { id: "referral-sources", label: "Referral Sources" },
    { id: "client-visit-frequency", label: "Client Visit Frequency" },
  ]},
  { label: "Insights", icon: "✨", items: [
    { id: "booked-forecast-by-day", label: "Booked Forecast by Day" },
    { id: "booked-forecast-by-staff", label: "Booked Forecast by Staff" },
    { id: "client-accounts-liability", label: "Client Accounts Liability" },
    { id: "voucher-redemptions", label: "Voucher Redemptions" },
    { id: "tag-summary", label: "Tag Summary" },
    { id: "resource-utilization", label: "Resource Utilization" },
  ]},
];

export const ALL_SUMMARY_IDS: SummaryReportId[] = SUMMARY_GROUPS.flatMap((g) =>
  g.items.map((i) => i.id),
);

export function findSummaryLabel(id: SummaryReportId): string {
  for (const g of SUMMARY_GROUPS) {
    const f = g.items.find((i) => i.id === id);
    if (f) return f.label;
  }
  return id;
}

// Sample data the renderers use ─────────────────────────────────────────
export const SALES_SUMMARY_BY_CATEGORY = [
  { label: "Service Payments", count: 28, gross: 4250, refunds: 0, net: 4250 },
  { label: "Product Payments", count: 6, gross: 285, refunds: -45, net: 240 },
  { label: "Tips", count: 28, gross: 612, refunds: 0, net: 612 },
  { label: "Memberships", count: 1, gross: 99, refunds: 0, net: 99 },
];
export const SALES_SUMMARY_BY_PAYMENT = [
  { method: "Card on file", txns: 24, total: 4290 },
  { method: "Manual card", txns: 6, total: 705 },
  { method: "Cash", txns: 3, total: 156 },
  { method: "Gift card", txns: 2, total: 50 },
];

export const DAILY_SUMMARY_ROWS = [
  { date: "Apr 14", appts: 22, requested: 19, services: 22, svcRev: 3525, svcTax: 0, products: 6, prodRev: 240, prodTax: 21, packages: 0 },
  { date: "Apr 13", appts: 18, requested: 14, services: 18, svcRev: 2845, svcTax: 0, products: 4, prodRev: 165, prodTax: 14, packages: 1 },
  { date: "Apr 12", appts: 0, requested: 0, services: 0, svcRev: 0, svcTax: 0, products: 0, prodRev: 0, prodTax: 0, packages: 0 },
  { date: "Apr 11", appts: 17, requested: 13, services: 17, svcRev: 2515, svcTax: 0, products: 3, prodRev: 110, prodTax: 9.5, packages: 0 },
];

export const LINE_ITEMS = [
  { order: "JBB-10184", client: "LaTarika Pierce", date: "Apr 14, 2:00pm", type: "Service", lineType: "Knotless — Waist Length", staff: "Mame Diarra", description: "Waist length, scalp oil add-on", unit: 320, qty: 1, total: 320 },
  { order: "JBB-10184", client: "LaTarika Pierce", date: "Apr 14, 2:00pm", type: "Tip",     lineType: "Tip", staff: "Mame Diarra", description: "20% tip", unit: 64, qty: 1, total: 64 },
  { order: "JBB-10185", client: "Neysia Scott",  date: "Apr 14, 4:30pm", type: "Service", lineType: "Box Braids — Waist", staff: "Naomi K.", description: "Curly ends", unit: 310, qty: 1, total: 310 },
  { order: "JBB-10186", client: "Layla McGrady", date: "Apr 14, 4:00pm", type: "Service", lineType: "Box Braids — Mid Back", staff: "Naomi K.", description: "Standard pattern", unit: 220, qty: 1, total: 220 },
  { order: "JBB-10187", client: "Yvonne Williams", date: "Apr 14, 7:00pm", type: "Service", lineType: "Color Refresh", staff: "Mame Diarra", description: "Tone + gloss", unit: 140, qty: 1, total: 140 },
  { order: "JBB-10188", client: "Tracey Brown",  date: "Apr 13, 8:30pm", type: "Service", lineType: "Silk Press", staff: "Frederick Douglass", description: "Standard", unit: 145, qty: 1, total: 145 },
  { order: "JBB-10189", client: "Tracey Brown",  date: "Apr 13, 8:30pm", type: "Product", lineType: "Edge Tamer", staff: "Frederick Douglass", description: "Refill", unit: 18, qty: 1, total: 18 },
];

export const STAFF_PERFORMANCE = [
  { name: "Mame Diarra",        sched: 40, booked: 36, util: 90, appts: 24, services: 24, svcRev: 6500, avg: 270.83, tip: 920, clients: 22, newClients: 2 },
  { name: "Frederick Douglass", sched: 40, booked: 32, util: 80, appts: 18, services: 18, svcRev: 3120, avg: 173.33, tip: 480, clients: 17, newClients: 3 },
  { name: "Naomi K.",           sched: 40, booked: 33, util: 82, appts: 21, services: 21, svcRev: 4620, avg: 220.00, tip: 705, clients: 20, newClients: 4 },
  { name: "Adja Timite",        sched: 32, booked: 12, util: 38, appts: 8,  services: 8,  svcRev: 1240, avg: 155.00, tip: 180, clients: 8,  newClients: 1 },
  { name: "Bebe Kaba",          sched: 24, booked: 8,  util: 33, appts: 6,  services: 6,  svcRev: 1080, avg: 180.00, tip: 145, clients: 6,  newClients: 0 },
];

// ───────── REPORTS BETA LIBRARY ─────────

export type BetaReport = {
  id: string;
  name: string;
  description: string;
  folder: string;
  createdBy: string;
  shared: boolean;
  updatedAt: string;
  favorite?: boolean;
  trashed?: boolean;
};

export const BETA_REPORTS: BetaReport[] = [
  { id: "rb1", name: "Service Sales", description: "Revenue and units by service for the period", folder: "Classic BLVD Reports", createdBy: "Boulevard", shared: false, updatedAt: "2026-04-14" },
  { id: "rb2", name: "Product Sales", description: "Product retail performance by SKU", folder: "Classic BLVD Reports", createdBy: "Boulevard", shared: false, updatedAt: "2026-04-13" },
  { id: "rb3", name: "Referral Sources", description: "Where new clients are finding the salon", folder: "Classic BLVD Reports", createdBy: "Boulevard", shared: false, updatedAt: "2026-04-10" },
  { id: "rb4", name: "Operator Activity", description: "Per-operator booking and checkout activity", folder: "Classic BLVD Reports", createdBy: "Boulevard", shared: false, updatedAt: "2026-04-09" },
  { id: "rb5", name: "Product Sales By Staff", description: "Retail attached per stylist", folder: "Classic BLVD Reports", createdBy: "Boulevard", shared: false, updatedAt: "2026-04-08" },
  { id: "rb6", name: "Staff Performance", description: "Utilization, retention, and average ticket", folder: "Classic BLVD Reports", createdBy: "Boulevard", shared: false, updatedAt: "2026-04-07" },
  { id: "rb7", name: "Detailed Line Item", description: "Line-item ledger for the date range", folder: "Classic BLVD Reports", createdBy: "Boulevard", shared: false, updatedAt: "2026-04-05" },
  { id: "rb8", name: "Daily Summary", description: "Day-by-day rollup of services, products, tax", folder: "Classic BLVD Reports", createdBy: "Boulevard", shared: false, updatedAt: "2026-04-02" },
  { id: "rb9", name: "Top Tippers — VIP Cohort", description: "Custom audience: VIP clients sorted by lifetime tips", folder: "My Reports", createdBy: "Diessou Kante", shared: true, updatedAt: "2026-04-15" },
];

export const SYSTEM_FOLDERS: { id: string; label: string; system: boolean }[] = [
  { id: "all", label: "All Reports", system: true },
  { id: "fav", label: "Favorites", system: true },
  { id: "shared", label: "Shared", system: true },
  { id: "trash", label: "Trash", system: true },
  { id: "classic", label: "Classic BLVD Reports", system: true },
];
