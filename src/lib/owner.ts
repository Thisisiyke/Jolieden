export const OWNER_SECTIONS = [
  { id: "apps-integrations", label: "Apps & Integrations" },
  { id: "billing", label: "Billing" },
  { id: "business-details", label: "Business Details" },
  { id: "client-experience", label: "Client Experience" },
  { id: "discount-reasons", label: "Discount Reasons" },
  { id: "forms-and-charts", label: "Forms and Charts" },
  { id: "gift-cards", label: "Gift Cards" },
  { id: "locations", label: "Locations" },
  { id: "membership-plans", label: "Membership Plans" },
  { id: "offers", label: "Offers" },
  { id: "packages", label: "Packages" },
  { id: "payment-processing", label: "Payment Processing" },
  { id: "permission-groups", label: "Permission Groups" },
  { id: "phrases", label: "Phrases" },
  { id: "product-categories", label: "Product Categories" },
  { id: "products", label: "Products" },
  { id: "referral-program", label: "Referral Program" },
  { id: "referral-sources", label: "Referral Sources" },
  { id: "resource-categories", label: "Resource Categories" },
  { id: "security", label: "Security" },
  { id: "services", label: "Services" },
  { id: "staff", label: "Staff" },
  { id: "staff-roles", label: "Staff Roles" },
  { id: "suppliers", label: "Suppliers" },
  { id: "tags", label: "Tags" },
];

export type Integration = {
  id: string;
  name: string;
  description: string;
  category: string;
  installed: boolean;
  logo: string;
};
export const INTEGRATIONS: Integration[] = [
  { id: "green-circle", name: "Green Circle Salons", description: "Recycle hair, foil, and color waste — show your sustainability impact to clients.", category: "Sustainability", installed: false, logo: "🌿" },
  { id: "loyalty",      name: "Loyalty Program",     description: "Reward repeat visits with point earning and redemption at checkout.",            category: "Marketing",       installed: true,  logo: "🎁" },
  { id: "okta-sso",     name: "Okta SSO",            description: "Sign in to Boulevard with your Okta account.",                                   category: "Security",        installed: false, logo: "🔑" },
  { id: "shopify",      name: "Shopify",             description: "Sync retail products and inventory with your Shopify storefront.",               category: "Retail",          installed: false, logo: "🛍️" },
  { id: "zapier",       name: "Zapier",              description: "Automate Boulevard with 6,000+ apps using zero-code Zaps.",                       category: "Automation",      installed: true,  logo: "⚡" },
  { id: "meta-book",    name: "Facebook & Instagram Book Now", description: "Let clients book directly from your Facebook page or Instagram profile.", category: "Booking",      installed: false, logo: "📘" },
];

export const DISCOUNT_REASONS = [
  { id: "dr1", reason: "Family & Friends" },
  { id: "dr2", reason: "Inconvenience (stylist late)" },
  { id: "dr3", reason: "First-time client comp" },
  { id: "dr4", reason: "Birthday discount" },
  { id: "dr5", reason: "Loyalty rebook" },
];

export type FormOrChart = {
  id: string;
  name: string;
  type: "Form" | "Chart";
  status: "Published" | "Draft";
  createdBy: string;
  updatedAt: string;
};
export const FORMS_AND_CHARTS: FormOrChart[] = [
  { id: "f1", name: "Color consultation",     type: "Form",  status: "Published", createdBy: "Frederick Douglass", updatedAt: "2026-04-22" },
  { id: "f2", name: "Braiding consent",       type: "Form",  status: "Published", createdBy: "Frederick Douglass", updatedAt: "2026-04-20" },
  { id: "f3", name: "New client intake",      type: "Form",  status: "Published", createdBy: "Frederick Douglass", updatedAt: "2026-03-15" },
  { id: "f4", name: "Scalp & hair history",   type: "Chart", status: "Published", createdBy: "Mame Diarra",        updatedAt: "2026-04-18" },
  { id: "f5", name: "Color formula log",      type: "Chart", status: "Published", createdBy: "Mame Diarra",        updatedAt: "2026-04-30" },
  { id: "f6", name: "Allergy waiver — v2",    type: "Form",  status: "Draft",     createdBy: "Frederick Douglass", updatedAt: "2026-05-12" },
  { id: "f7", name: "Post-service follow-up", type: "Chart", status: "Draft",     createdBy: "Naomi K.",           updatedAt: "2026-05-08" },
];

export type Location = {
  id: string;
  name: string;
  address: string;
  phone: string;
  active: boolean;
};
export const LOCATIONS: Location[] = [
  { id: "loc1", name: "Frederick Douglass", address: "1812 Frederick Douglass Blvd, New York, NY 10026", phone: "(347) 555-0100", active: true },
];

export type Offer = {
  id: string;
  name: string;
  code: string;
  discountPct: number;
  scopes: { services: boolean; products: boolean; packages: boolean; memberships: boolean };
};
export const OFFERS: Offer[] = [
  { id: "o1", name: "Spring 20",         code: "SPRING20",  discountPct: 20, scopes: { services: true,  products: false, packages: false, memberships: false } },
  { id: "o2", name: "New client comp",   code: "WELCOME10", discountPct: 10, scopes: { services: true,  products: true,  packages: false, memberships: false } },
  { id: "o3", name: "Bundle and save",   code: "BUNDLE15",  discountPct: 15, scopes: { services: false, products: false, packages: true,  memberships: false } },
  { id: "o4", name: "Member appreciation", code: "MEMBER5", discountPct: 5,  scopes: { services: true,  products: true,  packages: true,  memberships: true  } },
];

export type MerchantAccount = {
  id: string;
  name: string;
  status: "Active" | "Pending";
  disputes: number;
  accountStatus: "Approved" | "Under Review";
};
export const MERCHANT_ACCOUNTS: MerchantAccount[] = [
  { id: "m1", name: "Jolieden's Beauty Bar LLC", status: "Active", disputes: 1, accountStatus: "Approved" },
];

export type PermissionGroup = {
  id: string;
  name: string;
  members: number;
  description: string;
};
export const PERMISSION_GROUPS: PermissionGroup[] = [
  { id: "pg1", name: "Admin",                   members: 1, description: "Full access to everything" },
  { id: "pg2", name: "Communications",          members: 0, description: "Send marketing campaigns and reply to client messages" },
  { id: "pg3", name: "Front Desk / Receptionist", members: 0, description: "Manage the front desk, check clients in/out" },
  { id: "pg4", name: "Location Manager",        members: 0, description: "All location-scoped access including staff and reports" },
  { id: "pg5", name: "Service Provider",        members: 6, description: "View own calendar and clients only" },
];

export type ProductCategory = {
  id: string;
  name: string;
  commission: boolean;
  retail: boolean;
};
export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { id: "pc1", name: "Braiding Hair", commission: true,  retail: true },
  { id: "pc2", name: "Hair Oils",     commission: true,  retail: true },
  { id: "pc3", name: "Styling",       commission: true,  retail: true },
  { id: "pc4", name: "Care",          commission: true,  retail: true },
  { id: "pc5", name: "Accessories",   commission: false, retail: true },
  { id: "pc6", name: "Back-bar",      commission: false, retail: false },
];

export const REFERRAL_SOURCES = [
  { id: "rs1", name: "Facebook" },
  { id: "rs2", name: "Google" },
  { id: "rs3", name: "Instagram" },
  { id: "rs4", name: "Referral" },
  { id: "rs5", name: "Walk-In" },
  { id: "rs6", name: "Yelp" },
];

export type StaffRole = {
  id: string;
  name: string;
  performsServices: boolean;
};
export const STAFF_ROLES: StaffRole[] = [
  { id: "sr1", name: "Content Creator", performsServices: false },
  { id: "sr2", name: "General Staff",   performsServices: true },
  { id: "sr3", name: "Hair Washer",     performsServices: true },
  { id: "sr4", name: "Manager",         performsServices: false },
];

export type Supplier = {
  id: string;
  name: string;
  phone: string;
  email: string;
  active: boolean;
};
export const SUPPLIERS: Supplier[] = [
  { id: "sp1", name: "X-Pression",   phone: "(212) 555-0100", email: "orders@x-pression.com",  active: true },
  { id: "sp2", name: "Cantu",        phone: "(800) 555-0145", email: "wholesale@cantu.com",    active: true },
  { id: "sp3", name: "Mielle",       phone: "(800) 555-0117", email: "b2b@mielleorganics.com", active: true },
  { id: "sp4", name: "Grace Eleyae", phone: "(310) 555-0188", email: "hello@graceeleyae.com",  active: true },
  { id: "sp5", name: "African Pride",phone: "(800) 555-0192", email: "orders@africanpride.com", active: false },
];

export type Tag = {
  id: string;
  name: string;
  emoji: string;
};
export const TAGS: Tag[] = [
  { id: "t1",  name: "Difficult",         emoji: "⚠️" },
  { id: "t2",  name: "Friends & Family",  emoji: "💛" },
  { id: "t3",  name: "Influencer",        emoji: "📸" },
  { id: "t4",  name: "Kind",              emoji: "🌷" },
  { id: "t5",  name: "Late Cancellation", emoji: "⏰" },
  { id: "t6",  name: "Left Message",      emoji: "📨" },
  { id: "t7",  name: "Loyal Client",      emoji: "💎" },
  { id: "t8",  name: "No Charge / Comp",  emoji: "🆓" },
  { id: "t9",  name: "No Show",           emoji: "🚫" },
  { id: "t10", name: "Running Late",      emoji: "🏃" },
  { id: "t11", name: "Tourist",           emoji: "🗺️" },
  { id: "t12", name: "VIP",               emoji: "👑" },
];
