export type NotificationCategory = "Online Booking" | "Online Waitlist";

export type Notification = {
  id: string;
  category: NotificationCategory;
  body: string;
  /** Relative time string for prototype (e.g., "29 minutes ago") */
  time: string;
  /** ISO timestamp used only for sort order */
  sortKey: string;
  read: boolean;
  href: string; // deep-link target
};

export const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    category: "Online Booking",
    body: "Courtney Lett has self-booked an appointment with Mouna S. on Mon, May 18, 2026 at 7:00pm EDT.",
    time: "29 minutes ago",
    sortKey: "2026-05-19T08:31",
    read: false,
    href: "/calendar",
  },
  {
    id: "n2",
    category: "Online Waitlist",
    body: "E King has joined the waitlist with Halimatou Diallo for Mon, May 25, 2026.",
    time: "an hour ago",
    sortKey: "2026-05-19T08:00",
    read: false,
    href: "/",
  },
  {
    id: "n3",
    category: "Online Booking",
    body: "Aaliyah Jackson has self-booked an appointment with Mame Diarra on Tue, May 19, 2026 at 10:30am EDT.",
    time: "an hour ago",
    sortKey: "2026-05-19T07:55",
    read: false,
    href: "/calendar",
  },
  {
    id: "n4",
    category: "Online Booking",
    body: "Brianna Lee has self-booked an appointment with Naomi K. on Thu, May 21, 2026 at 2:00pm EDT.",
    time: "2 hours ago",
    sortKey: "2026-05-19T07:00",
    read: false,
    href: "/calendar",
  },
  {
    id: "n5",
    category: "Online Waitlist",
    body: "Sewa Sonubi has joined the waitlist with Frederick Douglass for Fri, May 22, 2026.",
    time: "3 hours ago",
    sortKey: "2026-05-19T06:00",
    read: false,
    href: "/",
  },
  {
    id: "n6",
    category: "Online Booking",
    body: "Layla McGrady has self-booked an appointment with Naomi K. on Sat, May 23, 2026 at 1:00pm EDT.",
    time: "4 hours ago",
    sortKey: "2026-05-19T05:00",
    read: false,
    href: "/calendar",
  },
  {
    id: "n7",
    category: "Online Booking",
    body: "Asia Sampson has self-booked an appointment with Mame Diarra on Mon, May 25, 2026 at 11:00am EDT.",
    time: "5 hours ago",
    sortKey: "2026-05-19T04:00",
    read: true,
    href: "/calendar",
  },
  {
    id: "n8",
    category: "Online Booking",
    body: "Devorae Riney has self-booked an appointment with Mame Diarra on Wed, May 27, 2026 at 4:00pm EDT.",
    time: "6 hours ago",
    sortKey: "2026-05-19T03:00",
    read: true,
    href: "/calendar",
  },
  {
    id: "n9",
    category: "Online Waitlist",
    body: "Imani Webb has joined the waitlist with Adja Timite for Tue, June 2, 2026.",
    time: "7 hours ago",
    sortKey: "2026-05-19T02:00",
    read: true,
    href: "/",
  },
  {
    id: "n10",
    category: "Online Booking",
    body: "Lauren Rohe has self-booked an appointment with Frederick Douglass on Fri, May 29, 2026 at 6:30pm EDT.",
    time: "8 hours ago",
    sortKey: "2026-05-19T01:00",
    read: true,
    href: "/calendar",
  },
  {
    id: "n11",
    category: "Online Booking",
    body: "Megan Henderson has self-booked an appointment with Mame Diarra on Sat, May 30, 2026 at 10:00am EDT.",
    time: "10 hours ago",
    sortKey: "2026-05-18T23:00",
    read: true,
    href: "/calendar",
  },
  {
    id: "n12",
    category: "Online Booking",
    body: "Janelle Ford has self-booked an appointment with Naomi K. on Sun, May 31, 2026 at 12:00pm EDT.",
    time: "12 hours ago",
    sortKey: "2026-05-18T21:00",
    read: true,
    href: "/calendar",
  },
];
