export type ChangelogTag = "Improvement" | "Fix" | "New";

export type ChangelogEntry = {
  id: string;
  date: string; // human-readable
  tag: ChangelogTag;
  title: string;
  summary: string;
  read: boolean;
};

export const CHANGELOG: ChangelogEntry[] = [
  { id: "c1",  date: "May 18, 2026", tag: "New",         title: "Calendar — multi-day view selector",      summary: "Editor and Pro plans can now switch between Day, 4-Day, and Week views right from the toolbar.", read: false },
  { id: "c2",  date: "May 16, 2026", tag: "Improvement", title: "Faster Front Desk drag-and-drop",         summary: "Moving cards between status columns is now snappier on busy days.", read: false },
  { id: "c3",  date: "May 14, 2026", tag: "Fix",         title: "Cancellation drawer dropdowns",           summary: "Staff/Reason filters now open below the field instead of overlapping it.", read: false },
  { id: "c4",  date: "May 12, 2026", tag: "New",         title: "Audiences — saved client segments",       summary: "Build filter combinations once, save as Audiences, and target them from Marketing.", read: false },
  { id: "c5",  date: "May 10, 2026", tag: "Improvement", title: "Period picker on Automated campaigns",    summary: "Quickly compare campaign performance across rolling periods (last week, last month, YTD).", read: false },
  { id: "c6",  date: "May 06, 2026", tag: "New",         title: "Tip lines on the Calendar grid",          summary: "Appointment blocks now render the time range under the service name when there's room.", read: false },
  { id: "c7",  date: "May 02, 2026", tag: "Fix",         title: "Date picker focus jitter",                summary: "Fixed the slight jump when switching months in the toolbar picker.", read: false },
  { id: "c8",  date: "Apr 28, 2026", tag: "Improvement", title: "Manage › Schedule export",                summary: "Schedule grids now export with stylist colors preserved.", read: false },
  { id: "c9",  date: "Apr 24, 2026", tag: "Fix",         title: "Sticky table headers in Reports",         summary: "Daily Summary table headers stay pinned when scrolling tall reports.", read: true },
  { id: "c10", date: "Apr 20, 2026", tag: "New",         title: "Bell notifications popover",              summary: "New activity feed in the top nav with unread state and Mark all as Read.", read: true },
];

export const STAFF_SERVICE_OVERRIDES = [
  { name: "Knotless — Mid Back",        price: 235, deposit: 50, duration: "3h",   processing: "0m", finishing: "10m", transition: "5m",  charge: 0,    commission: 50, customized: false },
  { name: "Knotless — Waist",           price: 320, deposit: 75, duration: "5h",   processing: "0m", finishing: "10m", transition: "5m",  charge: 0,    commission: 55, customized: true },
  { name: "Box Braids — Shoulder",      price: 180, deposit: 40, duration: "2.5h", processing: "0m", finishing: "10m", transition: "5m",  charge: 0,    commission: 50, customized: false },
  { name: "Box Braids — Waist",         price: 310, deposit: 70, duration: "5h",   processing: "0m", finishing: "10m", transition: "5m",  charge: 0,    commission: 55, customized: false },
  { name: "Silk Press",                 price: 145, deposit: 30, duration: "2h",   processing: "0m", finishing: "5m",  transition: "5m",  charge: 0,    commission: 50, customized: false },
  { name: "Color Refresh",              price: 140, deposit: 30, duration: "2h",   processing: "20m", finishing: "5m",  transition: "5m",  charge: 0,    commission: 45, customized: true },
  { name: "Deep Conditioning",          price: 45,  deposit: 10, duration: "45m",  processing: "0m", finishing: "5m",  transition: "5m",  charge: 0,    commission: 40, customized: false },
];

export type NotifEvent =
  | "new-online-booking"
  | "new-front-desk-booking"
  | "client-arrival"
  | "client-cancellation"
  | "service-order-completed";

export const NOTIF_EVENTS: { id: NotifEvent; label: string; pushOnly?: boolean }[] = [
  { id: "new-online-booking",      label: "New Online Booking" },
  { id: "new-front-desk-booking",  label: "New Front Desk Booking" },
  { id: "client-arrival",          label: "Client Arrival" },
  { id: "client-cancellation",     label: "Client Cancellation" },
  { id: "service-order-completed", label: "Service Order Completed", pushOnly: true },
];
