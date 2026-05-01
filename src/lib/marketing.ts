export type Channel = "email" | "text";
export type CampaignStatus = "draft" | "completed";

export type BlastCampaign = {
  id: string;
  name: string;
  channel: Channel;
  status: CampaignStatus;
  sendDate?: string; // YYYY-MM-DD
  sent?: number;
  clicked?: number;
  unsubscribed?: number;
  audience?: string;
  excludeAudience?: string;
  excludeRecent?: boolean;
  estimatedRecipients?: number;
  subject?: string;
  preview?: string;
};

export const BLAST_AUDIENCES = [
  "Clients who visited in the last 24 months",
  "Price Change",
  "Upcoming Change",
  "All Clients",
  "VIP Clients",
  "Lapsed Clients",
];

export const BLAST_CAMPAIGNS: BlastCampaign[] = [
  { id: "bc1", name: "Spring Promo — 20% off color", channel: "email", status: "completed", sendDate: "2026-04-02", sent: 5320, clicked: 412, unsubscribed: 18, audience: "All Clients", subject: "20% off color this spring 🌸", preview: "Limited time" },
  { id: "bc2", name: "VIP perk — early access", channel: "text", status: "completed", sendDate: "2026-03-25", sent: 86, clicked: 41, unsubscribed: 0, audience: "VIP Clients" },
  { id: "bc3", name: "Mother's Day reminders", channel: "email", status: "draft", audience: "All Clients", excludeRecent: true, estimatedRecipients: 7581, subject: "It's a cold seaso...", preview: "Treat the queens in your life" },
  { id: "bc4", name: "Welcome back — we miss you", channel: "email", status: "completed", sendDate: "2026-02-14", sent: 1248, clicked: 92, unsubscribed: 6, audience: "Lapsed Clients" },
  { id: "bc5", name: "Birthday SMS — May", channel: "text", status: "draft", audience: "All Clients", estimatedRecipients: 142 },
  { id: "bc6", name: "Holiday hours blast", channel: "email", status: "completed", sendDate: "2025-12-22", sent: 4880, clicked: 320, unsubscribed: 11, audience: "All Clients" },
];

// ───────── AUTOMATIONS ─────────

export type AutomationId =
  | "fill-slow-days"
  | "birthday"
  | "last-minute"
  | "remind-book"
  | "rescue-lost";

export type AutomationStatus = "off" | "live" | "paused";

export type Automation = {
  id: AutomationId;
  name: string;
  description: string;
  icon: string;
  status: AutomationStatus;
  channel?: "email" | "text" | "both";
  recipients?: number;
  appointments?: number;
  sales?: number;
};

export const AUTOMATIONS: Automation[] = [
  {
    id: "fill-slow-days",
    name: "Fill slow days",
    description: "Promote open spots to keep your schedule fully booked.",
    icon: "📈",
    status: "live",
    channel: "email",
    recipients: 1842,
    appointments: 64,
    sales: 9420,
  },
  {
    id: "birthday",
    name: "Birthday message",
    description: "Send birthday wishes and encourage clients to book.",
    icon: "🎂",
    status: "off",
  },
  {
    id: "last-minute",
    name: "Last minute opening",
    description: "Notify clients when last-minute appointments open up.",
    icon: "⏰",
    status: "off",
  },
  {
    id: "remind-book",
    name: "Reminder to book",
    description: "Remind clients to schedule their next appointment.",
    icon: "📨",
    status: "off",
  },
  {
    id: "rescue-lost",
    name: "Rescue lost clients",
    description: "Remind clients they're missed and welcome them back.",
    icon: "💔",
    status: "off",
  },
];
