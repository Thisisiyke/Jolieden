// AI SMS Concierge — escalation queue. These are the conversations the AI
// handed off to a human stylist for follow-up. Each entry includes a short
// transcript so the stylist (or owner) can read what the AI tried before
// picking up the thread.

export type AIMessage = {
  from: "client" | "ai" | "stylist";
  body: string;
  at: string; // "10:14am" relative-ish for prototype
};

export type AIEscalation = {
  id: string;
  routeToSlug: string; // owner ("diessou") sees everything; specific stylist slug for routed escalations
  clientName: string;
  clientPhone: string;
  // What the AI tried to handle before escalating.
  aiSummary: string;
  // Why the AI gave up (canonical reason).
  reason:
    | "policy_question"
    | "custom_pricing"
    | "schedule_conflict"
    | "complaint"
    | "specialist_required"
    | "lost_item";
  receivedAt: string; // "12m ago"
  resolved?: boolean;
  transcript: AIMessage[];
};

const REASON_LABEL: Record<AIEscalation["reason"], string> = {
  policy_question: "Policy clarification",
  custom_pricing: "Custom pricing",
  schedule_conflict: "Schedule conflict",
  complaint: "Client complaint",
  specialist_required: "Specialist required",
  lost_item: "Lost item",
};

export const reasonLabel = (r: AIEscalation["reason"]) => REASON_LABEL[r];

export const ESCALATIONS: AIEscalation[] = [
  {
    id: "esc-1",
    routeToSlug: "oumou-d",
    clientName: "Mariama T.",
    clientPhone: "(917) 555-0148",
    aiSummary:
      "Asked for custom pricing on knotless + free-form parting + boho ends — combination outside the published price grid.",
    reason: "custom_pricing",
    receivedAt: "12m ago",
    transcript: [
      { from: "client", body: "Hi, I want the XS knotless with boho ends, free parts AND I want to add the curl pattern from the Bora Bora photos. How much?", at: "10:02am" },
      { from: "ai", body: "Great choice! XS Knotless with boho ends starts at $395 and adds about an hour. Free parts add $20. The Bora Bora curl pattern is a custom finish — let me get a stylist to quote that for you.", at: "10:02am" },
      { from: "client", body: "Ok yeah I want to keep going with that", at: "10:03am" },
      { from: "ai", body: "Holding your spot at Tuesday 11am while Oumou D. reviews. She'll text you in a few minutes.", at: "10:03am" },
    ],
  },
  {
    id: "esc-2",
    routeToSlug: "diessou",
    clientName: "Devorae R.",
    clientPhone: "(917) 663-4087",
    aiSummary:
      "Asked to be refunded the deposit because she's been spotting unevenness from her last visit. Photo attached.",
    reason: "complaint",
    receivedAt: "27m ago",
    transcript: [
      { from: "client", body: "I'm not happy with how my braids came out — see the back. I want my deposit back for my next visit since I have to redo this somewhere else.", at: "9:48am" },
      { from: "ai", body: "I'm so sorry to hear that. I'm pulling up your last visit and looping in Diéssou directly. She'll be in touch shortly.", at: "9:48am" },
    ],
  },
  {
    id: "esc-3",
    routeToSlug: "fatou-c",
    clientName: "Lauren R.",
    clientPhone: "(347) 555-0129",
    aiSummary:
      "Asked whether she should pre-wash her hair before tomorrow's silk press. AI doesn't have a confident answer.",
    reason: "policy_question",
    receivedAt: "41m ago",
    transcript: [
      { from: "client", body: "Should I wash my hair before my silk press tomorrow or come in dirty?", at: "9:34am" },
      { from: "ai", body: "Good question! Generally we prefer clean hair, but Fatou has her own prep ritual. Let me ask her so you get the right answer.", at: "9:34am" },
    ],
  },
  {
    id: "esc-4",
    routeToSlug: "diessou",
    clientName: "Unknown",
    clientPhone: "(929) 845-9923",
    aiSummary:
      "First-time visitor asking about a 7am Saturday slot — outside published business hours.",
    reason: "schedule_conflict",
    receivedAt: "1h ago",
    transcript: [
      { from: "client", body: "Hi! Do you all open earlier than 9 on Saturdays? I'd love a 7am slot if at all possible.", at: "9:14am" },
      { from: "ai", body: "Our published Saturday hours start at 9am. Let me check with Diéssou about an exception — we sometimes accommodate early starts for longer services.", at: "9:14am" },
    ],
  },
  {
    id: "esc-5",
    routeToSlug: "dieynaba-d",
    clientName: "Imani W.",
    clientPhone: "(646) 555-0199",
    aiSummary:
      "Wants to know if her existing hair color (uses box dye monthly) will affect the honey balayage.",
    reason: "specialist_required",
    receivedAt: "2h ago",
    transcript: [
      { from: "client", body: "I do box dye at home every month. Will that mess up my balayage with Dieynaba? Do I need a strand test?", at: "8:11am" },
      { from: "ai", body: "Great question and the right one to ask before color. Routing you to Dieynaba directly — she'll want details on which brand and last application date.", at: "8:11am" },
    ],
  },
  {
    id: "esc-6",
    routeToSlug: "diessou",
    clientName: "Sewa S.",
    clientPhone: "(212) 555-0167",
    aiSummary:
      "Left her favorite scarf at her last appointment last week.",
    reason: "lost_item",
    receivedAt: "3h ago",
    transcript: [
      { from: "client", body: "Hey ladies — I left a black silk scarf at my last visit. Any chance you have it?", at: "7:02am" },
      { from: "ai", body: "I'm checking with the floor manager. Hold tight, Sewa.", at: "7:02am" },
    ],
  },
];

export const escalationsForStylist = (stylistSlug: string): AIEscalation[] => {
  // Owner sees everything; everyone else sees only their routed conversations.
  if (stylistSlug === "diessou") return ESCALATIONS.filter((e) => !e.resolved);
  return ESCALATIONS.filter((e) => e.routeToSlug === stylistSlug && !e.resolved);
};

export const getEscalation = (id: string): AIEscalation | undefined =>
  ESCALATIONS.find((e) => e.id === id);
