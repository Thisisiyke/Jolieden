// Minimal-but-real EN/FR translation system. The Shopify marketing site is
// bilingual; the prototype mirrors that capability so reviewers can prove
// the app is ready to ship in either language. Coverage is intentionally
// partial — focused on the most visible strings (home headings, tab
// labels, profile section titles). Full coverage is a P+1.

export type Locale = "en" | "fr";

type StringDict = Record<string, { en: string; fr: string }>;

export const STRINGS: StringDict = {
  // Tab bar
  "tab.home": { en: "Home", fr: "Accueil" },
  "tab.browse": { en: "Browse", fr: "Explorer" },
  "tab.bookings": { en: "Bookings", fr: "Réservations" },
  "tab.journey": { en: "Journey", fr: "Parcours" },
  "tab.profile": { en: "Profile", fr: "Profil" },

  // Home greeting
  "home.greeting": { en: "Hi,", fr: "Bonjour," },
  "home.welcome": { en: "Welcome", fr: "Bienvenue" },
  "home.visits": { en: "visits · welcome back", fr: "visites · bon retour" },

  // Sections
  "home.inspired_eyebrow": { en: "✨ Inspired by your style", fr: "✨ Inspiré par votre style" },
  "home.inspired_default": { en: "Picked for you", fr: "Sélection pour vous" },
  "home.inspired_like_last": { en: "Like your last", fr: "Comme votre dernier" },
  "home.spotlight_eyebrow": { en: "💜 Stylist spotlight", fr: "💜 Coiffeuse en vedette" },
  "home.spotlight_title": { en: "Meet", fr: "Découvrez" },
  "home.trending_eyebrow": { en: "🔥 Most booked at Jolieden", fr: "🔥 Les plus réservés" },
  "home.trending_title": { en: "Trending this month", fr: "Tendances ce mois-ci" },
  "home.care_eyebrow": { en: "💡 Care tip", fr: "💡 Conseil entretien" },
  "home.care_body": {
    en: "Sleep on a silk pillowcase to extend the life of your braids by 1–2 weeks.",
    fr: "Dormez sur une taie en soie pour prolonger la vie de vos tresses de 1 à 2 semaines.",
  },

  // Upcoming card
  "upcoming.label": { en: "Upcoming", fr: "À venir" },
  "upcoming.with": { en: "with", fr: "avec" },
  "upcoming.checkin_now": { en: "Check in now", fr: "S'enregistrer" },
  "upcoming.open_qr": { en: "Open check-in QR", fr: "Ouvrir QR d'enregistrement" },

  // Rewards card
  "rewards.member": { en: "member", fr: "membre" },
  "rewards.points": { en: "points", fr: "points" },
  "rewards.to_next": { en: "pts to", fr: "pts pour" },

  // Birthday
  "birthday.eyebrow": { en: "🎂 Birthday week", fr: "🎂 Semaine d'anniversaire" },
  "birthday.tier": { en: "tier", fr: "niveau" },
  "birthday.today": { en: "Happy birthday!", fr: "Joyeux anniversaire !" },
  "birthday.tomorrow": { en: "1 day away", fr: "1 jour avant" },
  "birthday.days_away": { en: "days away", fr: "jours avant" },

  // Next visit recommendation
  "nextvisit.eyebrow": { en: "📅 Time for your next visit", fr: "📅 Temps pour la prochaine visite" },
  "nextvisit.body": {
    en: "Based on your usual rhythm, you're due around",
    fr: "Selon votre rythme habituel, vous êtes attendu(e) vers",
  },
  "nextvisit.cta": { en: "Book your next visit", fr: "Réserver la prochaine visite" },

  // Profile
  "profile.title": { en: "Profile", fr: "Profil" },
  "profile.contact": { en: "Contact", fr: "Contact" },
  "profile.preferences": { en: "Style preferences", fr: "Préférences de style" },
  "profile.notifications": { en: "Notifications", fr: "Notifications" },
  "profile.payment": { en: "Payment", fr: "Paiement" },
  "profile.rewards_section": { en: "Rewards & membership", fr: "Récompenses & adhésion" },
  "profile.forms": { en: "Forms & consent", fr: "Formulaires & consentement" },
  "profile.language": { en: "Language", fr: "Langue" },
  "profile.app_language": { en: "App language", fr: "Langue de l'app" },
  "profile.signout": { en: "Sign out", fr: "Se déconnecter" },
};

export function t(key: string, locale: Locale = "en"): string {
  const entry = STRINGS[key];
  if (!entry) return key;
  return entry[locale];
}

// Convenience: get a translator bound to a locale.
export const tFor = (locale: Locale) => (key: string) => t(key, locale);

export const LOCALE_LABEL: Record<Locale, string> = {
  en: "English",
  fr: "Français",
};
