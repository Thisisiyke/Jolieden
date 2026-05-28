// Mocked Google Reviews. In production these pull from the Google Places
// API (free tier) keyed to the salon's place_id. For prototype we ship a
// representative seed so reviewers can audit the surface.

export type GoogleReview = {
  id: string;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  relativeTime: string; // "2 weeks ago"
  body: string;
  service?: string;
  responded?: boolean;
};

export const GOOGLE_REVIEWS: GoogleReview[] = [
  {
    id: "g1",
    author: "Aaliyah J.",
    rating: 5,
    relativeTime: "1 week ago",
    body: "Oumou's tension is gentler than anywhere I've been in NYC. My edges are thriving and the braids look exactly like the gallery photo. Will be back in 8.",
    service: "XS Knotless Braids",
    responded: true,
  },
  {
    id: "g2",
    author: "Mariama T.",
    rating: 5,
    relativeTime: "2 weeks ago",
    body: "Got the Bora Bora Boho — six hours flew by, the music + drinks make it feel like a spa. Worth every dollar.",
    service: "Bora Bora Boho",
  },
  {
    id: "g3",
    author: "Layla M.",
    rating: 5,
    relativeTime: "3 weeks ago",
    body: "Booking on the website was so easy compared to calling around. Loved seeing photos of each style before picking. Front desk was warm too.",
  },
  {
    id: "g4",
    author: "Janelle F.",
    rating: 5,
    relativeTime: "4 weeks ago",
    body: "Frederick gave me the cleanest silk press of my life. Lasted 3 weeks even with a workout streak. Trust him completely now.",
    service: "Silk Press",
  },
  {
    id: "g5",
    author: "Tia R.",
    rating: 4,
    relativeTime: "1 month ago",
    body: "Beautiful work, only knock is the wait when you arrive without a confirmed slot. Otherwise 10/10.",
  },
  {
    id: "g6",
    author: "Imani W.",
    rating: 5,
    relativeTime: "2 months ago",
    body: "Dieynaba walked me through a strand test before doing my balayage and saved me from a disaster. So thoughtful. Highlights are perfect.",
    service: "Balayage",
    responded: true,
  },
];

export const REVIEW_STATS = {
  averageRating: 4.9,
  totalReviews: 287,
  fiveStarPercent: 91,
  responseRatePercent: 68,
};
