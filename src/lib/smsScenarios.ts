// Scripted AI SMS conversations for the /demo/sms simulator. Each scenario
// is a sequence of turns. AI turns have a `typing` ms (typing indicator
// shown before the message lands). Client turns appear immediately after the
// previous turn's delay. The simulator auto-plays through the script.

export type SmsTurn = {
  from: "client" | "ai" | "stylist";
  body: string;
  // ms to wait before this turn appears (typing simulation for AI; pause for client)
  delay: number;
  // For AI turns, optional "typing duration" inside the delay — controls how
  // long the typing dots are visible before the bubble lands.
  typingMs?: number;
};

export type SmsScenario = {
  id: string;
  title: string;
  subtitle: string;
  client: { name: string; phone: string };
  turns: SmsTurn[];
};

export const SCENARIOS: SmsScenario[] = [
  {
    id: "book",
    title: "Booking a visit",
    subtitle: "Aaliyah books her usual via SMS — no app needed.",
    client: { name: "Aaliyah Jackson", phone: "(917) 555-0181" },
    turns: [
      { from: "client", body: "hey it's aaliyah! i'm due for my knotless again, can I get oumou next sat?", delay: 700 },
      { from: "ai", body: "Hi Aaliyah! Great to hear from you. Oumou has 10am or 2:30pm open on Sat May 31st. Same XS knotless, boho ends, 1B/27 like last time?", delay: 1800, typingMs: 1600 },
      { from: "client", body: "yes exactly. 10am pls", delay: 1200 },
      { from: "ai", body: "Locked in: Sat May 31 at 10am with Oumou D., XS Knotless Boho, $395, ~7 hrs. I'll text you a reminder 24h before. Anything else?", delay: 1500, typingMs: 1300 },
      { from: "client", body: "nope all good 💜", delay: 1100 },
      { from: "ai", body: "See you Saturday! 💜", delay: 900, typingMs: 700 },
    ],
  },
  {
    id: "faq",
    title: "Quick policy question",
    subtitle: "A first-time client asks how to prep — AI handles it without involving staff.",
    client: { name: "Unknown · first-time", phone: "(929) 555-0388" },
    turns: [
      { from: "client", body: "hi! i have my first silk press on friday, should i wash my hair first or come in dirty?", delay: 700 },
      { from: "ai", body: "Hi! Good question. For silk press we prep with a clarifying wash here, so come in with hair clean OR dirty — no need to wash beforehand. Just avoid heavy products in the 48 hrs leading up.", delay: 2000, typingMs: 1700 },
      { from: "client", body: "perfect ty!", delay: 1000 },
      { from: "ai", body: "You got it! Looking forward to seeing you Friday.", delay: 900, typingMs: 800 },
    ],
  },
  {
    id: "escalate",
    title: "AI escalates to a stylist",
    subtitle: "Custom pricing question — AI hands off to Dieynaba mid-thread.",
    client: { name: "Imani Webb", phone: "(646) 555-0199" },
    turns: [
      { from: "client", body: "i do box dye at home every month. will that mess up the balayage with dieynaba next week? do i need a strand test?", delay: 700 },
      { from: "ai", body: "Great question to ask before color! Box dye buildup can affect lift and tone. Let me get Dieynaba directly so she can walk you through what to expect and whether we should do a strand test.", delay: 2400, typingMs: 2100 },
      { from: "ai", body: "Looping her in now — one sec.", delay: 1300, typingMs: 800 },
      { from: "stylist", body: "Hi Imani, Dieynaba here. Which box dye brand are you using and when did you last apply it? I want to map out the right pre-treatment.", delay: 2000, typingMs: 1500 },
      { from: "client", body: "dark and lovely #380, last did it apr 8", delay: 1300 },
      { from: "stylist", body: "Got it — that's a permanent oxidative dye. I'd recommend coming in 30 min early Thursday for a free strand test. If it lifts cleanly we proceed; if not, I'll switch the plan to a gloss + partial highlights. Either way, you'll leave loving it.", delay: 2300, typingMs: 2000 },
      { from: "client", body: "amazing thank you!!", delay: 1000 },
    ],
  },
  {
    id: "late",
    title: "Running late",
    subtitle: "Naomi texts that she'll be 15 min late — AI confirms and lets the stylist know.",
    client: { name: "Naomi Brooks", phone: "(917) 555-0212" },
    turns: [
      { from: "client", body: "stuck on the train 😩 gonna be ~15 min late, hope thats ok", delay: 700 },
      { from: "ai", body: "No worries Naomi — I've let Fatou know. Your 11am birthday silk press is now flagged for 11:15. See you soon!", delay: 1700, typingMs: 1400 },
      { from: "client", body: "youre the best 💕", delay: 900 },
      { from: "ai", body: "Have a safe trip in! 🚇", delay: 800, typingMs: 600 },
    ],
  },
];

export const getScenario = (id: string): SmsScenario | undefined =>
  SCENARIOS.find((s) => s.id === id);
