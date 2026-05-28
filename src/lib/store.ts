// Cross-surface Zustand store. Hydrates from src/lib/data.ts + journey.ts.
// New surfaces (/book, /me, /pro) read+write here. Operator hot paths (Calendar,
// Front Desk, Clients) can opt in by replacing direct fixture imports with
// useAllAppointments() / useAllClients() etc.
//
// Selector gotcha: always wrap collection selectors in `useShallow` from
// zustand/react/shallow — selecting Object.values(state.x) directly causes
// "getServerSnapshot should be cached" infinite loops because it returns a new
// array each render. Per-id selection is fine without useShallow.

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import {
  APPOINTMENTS as APPOINTMENT_FIXTURES,
  CLIENTS as CLIENT_FIXTURES,
  STAFF as STAFF_FIXTURES,
  TODAY,
} from "@/lib/data";
import type { Appointment, ApptStatus, Client, Stylist } from "@/lib/data";
import { JOURNEY as JOURNEY_FIXTURES } from "@/lib/journey";
import type { HairJourneyEntry } from "@/lib/journey";
import type { CategorySlug } from "@/lib/catalog";

// ───────────────────── cart ─────────────────────
// Booking flow's working state: which style/service the client is configuring.

export type CartLine = {
  id: string; // local
  serviceSlug: string;
  serviceName: string;
  basePrice: number;
  baseDurationMin: number;
  modifierChoices: Record<string, string>; // modifier id → option id
  addOnIds: string[];
  styleSlug?: string; // gallery entry that seeded this
  stylistSlug?: string;
  computedPrice: number;
  computedDurationMin: number;
};

export type Cart = {
  id: string;
  clientSlug?: string; // resolved once the client identifies / signs in
  lines: CartLine[];
  preferredDate?: string; // YYYY-MM-DD
  preferredTime?: string; // "2:00pm"
  stylistSlug?: string;
};

const emptyCart = (): Cart => ({
  id: `cart-${Date.now()}`,
  lines: [],
});

// ───────────────────── store ─────────────────────

type State = {
  // canonical data — keyed for O(1) lookups, hydrated from fixtures
  appointments: Record<string, Appointment>;
  clients: Record<string, Client>;
  stylists: Record<string, Stylist>;
  journey: Record<string, HairJourneyEntry>;
  cart: Cart;
  activePersona: {
    surface: "operator" | "book" | "me" | "pro";
    clientSlug?: string; // for /me and /book
    stylistSlug?: string; // for /pro
  };
};

type Actions = {
  // appointment lifecycle
  setAppointmentStatus: (id: string, status: ApptStatus) => void;
  addAppointment: (a: Appointment) => void;
  updateAppointment: (id: string, patch: Partial<Appointment>) => void;

  // clients
  upsertClient: (c: Client) => void;

  // journey
  addJourneyEntry: (e: HairJourneyEntry) => void;

  // cart
  resetCart: () => void;
  setCart: (cart: Cart) => void;
  addCartLine: (line: CartLine) => void;
  removeCartLine: (lineId: string) => void;
  updateCartLine: (lineId: string, patch: Partial<CartLine>) => void;
  setCartStylist: (stylistSlug: string | undefined) => void;
  setCartTime: (date: string, time: string) => void;

  // active persona switcher (the demo "who am I" control)
  setActivePersona: (next: Partial<State["activePersona"]>) => void;

  // dev / demo
  resetAll: () => void;
};

const keyById = <T extends { id: string }>(arr: T[]): Record<string, T> => {
  const out: Record<string, T> = {};
  for (const item of arr) out[item.id] = item;
  return out;
};

const keyBySlug = <T extends { slug: string }>(arr: T[]): Record<string, T> => {
  const out: Record<string, T> = {};
  for (const item of arr) out[item.slug] = item;
  return out;
};

const hydratedState = (): State => ({
  appointments: keyById(APPOINTMENT_FIXTURES),
  clients: keyById(CLIENT_FIXTURES),
  stylists: keyBySlug(STAFF_FIXTURES), // stylists keyed by slug; clients keyed by id
  journey: keyById(JOURNEY_FIXTURES),
  cart: emptyCart(),
  activePersona: {
    surface: "operator",
  },
});

export const useStore = create<State & Actions>()(
  persist(
    (set) => ({
      ...hydratedState(),

      setAppointmentStatus: (id, status) =>
        set((s) => {
          const existing = s.appointments[id];
          if (!existing) return s;
          return {
            appointments: {
              ...s.appointments,
              [id]: { ...existing, status },
            },
          };
        }),

      addAppointment: (a) =>
        set((s) => ({
          appointments: { ...s.appointments, [a.id]: a },
        })),

      updateAppointment: (id, patch) =>
        set((s) => {
          const existing = s.appointments[id];
          if (!existing) return s;
          return {
            appointments: {
              ...s.appointments,
              [id]: { ...existing, ...patch },
            },
          };
        }),

      upsertClient: (c) =>
        set((s) => ({
          clients: { ...s.clients, [c.id]: c },
        })),

      addJourneyEntry: (e) =>
        set((s) => ({
          journey: { ...s.journey, [e.id]: e },
        })),

      resetCart: () => set({ cart: emptyCart() }),
      setCart: (cart) => set({ cart }),
      addCartLine: (line) =>
        set((s) => ({ cart: { ...s.cart, lines: [...s.cart.lines, line] } })),
      removeCartLine: (lineId) =>
        set((s) => ({
          cart: { ...s.cart, lines: s.cart.lines.filter((l) => l.id !== lineId) },
        })),
      updateCartLine: (lineId, patch) =>
        set((s) => ({
          cart: {
            ...s.cart,
            lines: s.cart.lines.map((l) => (l.id === lineId ? { ...l, ...patch } : l)),
          },
        })),
      setCartStylist: (stylistSlug) =>
        set((s) => ({ cart: { ...s.cart, stylistSlug } })),
      setCartTime: (preferredDate, preferredTime) =>
        set((s) => ({ cart: { ...s.cart, preferredDate, preferredTime } })),

      setActivePersona: (next) =>
        set((s) => ({ activePersona: { ...s.activePersona, ...next } })),

      resetAll: () => set(hydratedState()),
    }),
    {
      name: "jolieden-store",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      // Skip persisting derived/transient fields if we add any later.
      partialize: (s) => ({
        appointments: s.appointments,
        clients: s.clients,
        journey: s.journey,
        cart: s.cart,
        activePersona: s.activePersona,
        // stylists is canonical from fixtures; don't persist (always re-hydrate)
      }),
      merge: (persisted, current) => {
        // Re-hydrate stylists from fixtures even if persisted version is missing them.
        const p = (persisted as Partial<State>) ?? {};
        return {
          ...current,
          ...p,
          stylists: current.stylists,
        };
      },
    },
  ),
);

// ───────────────────── selectors ─────────────────────
// Wrap collection selectors in useShallow to avoid infinite re-render loops.

export const useAllAppointments = () =>
  useStore(useShallow((s) => Object.values(s.appointments)));

export const useAppointmentsForDate = (date: string) =>
  useStore(useShallow((s) => Object.values(s.appointments).filter((a) => a.date === date)));

export const useAppointment = (id: string) => useStore((s) => s.appointments[id]);

export const useAllClients = () =>
  useStore(useShallow((s) => Object.values(s.clients)));

export const useClient = (id: string) => useStore((s) => s.clients[id]);

export const useClientBySlug = (slug: string | undefined) =>
  useStore((s) => (slug ? Object.values(s.clients).find((c) => c.slug === slug) : undefined));

export const useAllStylists = () =>
  useStore(useShallow((s) => Object.values(s.stylists)));

export const useStylistBySlug = (slug: string | undefined) =>
  useStore((s) => (slug ? s.stylists[slug] : undefined));

export const useJourneyForClient = (clientSlug: string | undefined) =>
  useStore(
    useShallow((s) =>
      clientSlug
        ? Object.values(s.journey)
            .filter((j) => j.clientSlug === clientSlug)
            .sort((a, b) => b.date.localeCompare(a.date))
        : [],
    ),
  );

export const useCart = () => useStore((s) => s.cart);
export const useActivePersona = () => useStore((s) => s.activePersona);

// Convenience: TODAY constant re-exported so consumers don't need a second import.
export { TODAY };
