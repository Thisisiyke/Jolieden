"use client";

// Global search palette for the operator app. Mounts as a modal, triggered
// either by the TopNav search icon or Cmd/Ctrl+K. Searches across:
//   - Clients (name, phone, email)
//   - Appointments (client, service, staff, date)
//   - Stylists (name, specialty, role)
//   - Services (catalog, category)
//   - Conversations (client name, preview)
// Results are grouped by type and capped at 5 per group so the palette
// stays scannable. Each result is a click-to-navigate Link.

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Users,
  CalendarIcon,
  Scissors,
  Tag,
  MessageCircle,
  X,
  CornerDownLeft,
} from "lucide-react";
import clsx from "clsx";
import { CLIENTS, APPOINTMENTS, STAFF, CONVERSATIONS } from "@/lib/data";
import { CATALOG_SERVICES, CATEGORIES } from "@/lib/catalog";

type ResultGroup =
  | "client"
  | "appointment"
  | "stylist"
  | "service"
  | "conversation";

type SearchResult = {
  id: string;
  group: ResultGroup;
  title: string;
  subtitle?: string;
  href: string;
};

type Props = { open: boolean; onClose: () => void };

const GROUP_LABEL: Record<ResultGroup, string> = {
  client: "Clients",
  appointment: "Appointments",
  stylist: "Stylists",
  service: "Services",
  conversation: "Messages",
};

const GROUP_ICON: Record<ResultGroup, typeof Users> = {
  client: Users,
  appointment: CalendarIcon,
  stylist: Scissors,
  service: Tag,
  conversation: MessageCircle,
};

// Lowercased "contains" for everything. Splits into tokens so "naomi 2pm"
// matches a row that has both words anywhere.
function matches(haystack: string, q: string): boolean {
  const hay = haystack.toLowerCase();
  const tokens = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return tokens.every((t) => hay.includes(t));
}

function runSearch(q: string): SearchResult[] {
  if (!q.trim()) return [];
  const out: SearchResult[] = [];

  // Clients
  for (const c of CLIENTS) {
    const hay = [c.firstName, c.lastName, c.phone, c.email, ...(c.tags || [])].join(" ");
    if (matches(hay, q)) {
      out.push({
        id: `client-${c.id}`,
        group: "client",
        title: `${c.firstName} ${c.lastName}`,
        subtitle: `${c.phone} · ${c.visits} visits · ${c.membership || "Guest"}`,
        href: `/clients/${c.id}`,
      });
    }
  }

  // Appointments
  for (const a of APPOINTMENTS) {
    const hay = [a.client, a.service, a.serviceDetail, a.staff, a.date, a.start].join(" ");
    if (matches(hay, q)) {
      out.push({
        id: `appt-${a.id}`,
        group: "appointment",
        title: `${a.client} — ${a.service || "—"}`,
        subtitle: `${a.date} · ${a.start}${a.staff ? ` · ${a.staff}` : ""} · ${a.status}`,
        href: `/calendar?focus=${a.id}`,
      });
    }
  }

  // Stylists
  for (const s of STAFF) {
    const hay = [s.name, s.role, s.specialty, s.bio].filter(Boolean).join(" ");
    if (matches(hay, q)) {
      out.push({
        id: `stylist-${s.slug}`,
        group: "stylist",
        title: s.name,
        subtitle: `${s.specialty || s.role}${s.yearsAtSalon ? ` · ${s.yearsAtSalon} yr` : ""}`,
        href: `/owner/staff`,
      });
    }
  }

  // Services + categories
  for (const sv of CATALOG_SERVICES) {
    const hay = [sv.name, sv.description, sv.categorySlug].filter(Boolean).join(" ");
    if (matches(hay, q)) {
      out.push({
        id: `service-${sv.slug}`,
        group: "service",
        title: sv.name,
        subtitle: `From $${sv.basePrice} · ${sv.categorySlug}`,
        href: `/book/style/${sv.slug}`,
      });
    }
  }
  for (const cat of CATEGORIES) {
    if (matches(cat.name, q)) {
      out.push({
        id: `cat-${cat.slug}`,
        group: "service",
        title: cat.name,
        subtitle: "Service category",
        href: `/book?category=${cat.slug}`,
      });
    }
  }

  // Conversations
  for (const c of CONVERSATIONS) {
    const hay = [c.name, c.preview, c.phone, c.aiSummary].filter(Boolean).join(" ");
    if (matches(hay, q)) {
      out.push({
        id: `conv-${c.id}`,
        group: "conversation",
        title: c.name === "Unknown" && c.phone ? c.phone : c.name,
        subtitle: c.aiSummary || c.preview.slice(0, 60),
        href: `/messages`,
      });
    }
  }

  return out;
}

function highlight(text: string, q: string): React.ReactNode {
  if (!q.trim()) return text;
  const tokens = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  // Simple highlighter — splits on the FIRST matching token.
  for (const t of tokens) {
    const idx = text.toLowerCase().indexOf(t);
    if (idx >= 0) {
      return (
        <>
          {text.slice(0, idx)}
          <mark className="rounded bg-gold-soft px-0.5 text-ink-900">
            {text.slice(idx, idx + t.length)}
          </mark>
          {text.slice(idx + t.length)}
        </>
      );
    }
  }
  return text;
}

export default function SearchPalette({ open, onClose }: Props) {
  const [q, setQ] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Focus on open, reset on close.
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setQ("");
      setActiveIdx(0);
    }
  }, [open]);

  // Global Cmd/Ctrl+K listener handled by parent; we still listen for Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const all = useMemo(() => runSearch(q), [q]);

  // Bucket per group, cap at 5 each.
  const grouped = useMemo(() => {
    const buckets: Record<ResultGroup, SearchResult[]> = {
      client: [],
      appointment: [],
      stylist: [],
      service: [],
      conversation: [],
    };
    for (const r of all) buckets[r.group].push(r);
    (Object.keys(buckets) as ResultGroup[]).forEach((k) => {
      buckets[k] = buckets[k].slice(0, 5);
    });
    return buckets;
  }, [all]);

  // Flat ordered list for keyboard nav.
  const flat = useMemo(() => {
    const order: ResultGroup[] = ["client", "appointment", "conversation", "stylist", "service"];
    return order.flatMap((g) => grouped[g]);
  }, [grouped]);

  // Reset active row when results change.
  useEffect(() => {
    setActiveIdx(0);
  }, [q]);

  // Arrow keys + Enter handling on input.
  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(flat.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      const r = flat[activeIdx];
      if (r) {
        router.push(r.href);
        onClose();
      }
    }
  };

  if (!open) return null;

  const totalCount = flat.length;
  const emptyShown = q.trim().length > 0 && totalCount === 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-2xl"
      >
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-ink-200 px-4 py-3">
          <Search className="h-4 w-4 text-ink-500" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Search clients, appointments, services, messages…"
            className="flex-1 bg-transparent text-base outline-none placeholder:text-ink-400"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              className="rounded p-1 text-ink-500 hover:bg-ink-100"
              aria-label="Clear"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-ink-200 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-500 hover:bg-ink-100"
          >
            Esc
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {q.trim() === "" && (
            <div className="px-6 py-10 text-center">
              <Search className="mx-auto h-6 w-6 text-ink-400" />
              <p className="mt-2 text-sm font-medium text-ink-900">Search Jolieden</p>
              <p className="mt-1 text-xs text-ink-500">
                Try a client&apos;s name, a phone number, a date, or a service.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-xs text-ink-500">
                {["Aaliyah", "knotless", "Saturday 10am", "(917)", "color"].map((tip) => (
                  <button
                    key={tip}
                    type="button"
                    onClick={() => setQ(tip)}
                    className="rounded-full border border-ink-200 bg-white px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider hover:border-brand"
                  >
                    {tip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {emptyShown && (
            <div className="px-6 py-10 text-center">
              <p className="text-sm font-medium text-ink-900">No matches for &ldquo;{q}&rdquo;</p>
              <p className="mt-1 text-xs text-ink-500">
                Try a shorter query, or check spelling.
              </p>
            </div>
          )}

          {(Object.keys(grouped) as ResultGroup[]).map((g) => {
            const rows = grouped[g];
            if (rows.length === 0) return null;
            const Icon = GROUP_ICON[g];
            return (
              <section key={g}>
                <header className="flex items-center gap-1.5 border-b border-ink-100 bg-paper px-4 py-1.5">
                  <Icon className="h-3 w-3 text-ink-500" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
                    {GROUP_LABEL[g]}
                  </span>
                </header>
                <ul>
                  {rows.map((r) => {
                    const idx = flat.findIndex((x) => x.id === r.id);
                    const active = idx === activeIdx;
                    return (
                      <li key={r.id}>
                        <Link
                          href={r.href}
                          onClick={onClose}
                          onMouseEnter={() => setActiveIdx(idx)}
                          className={clsx(
                            "flex items-center gap-3 border-b border-ink-100 px-4 py-2.5",
                            active ? "bg-brand-50" : "hover:bg-ink-50",
                          )}
                        >
                          <Icon
                            className={clsx(
                              "h-4 w-4 shrink-0",
                              active ? "text-brand" : "text-ink-400",
                            )}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-ink-900">
                              {highlight(r.title, q)}
                            </div>
                            {r.subtitle && (
                              <div className="truncate text-xs text-ink-500">
                                {highlight(r.subtitle, q)}
                              </div>
                            )}
                          </div>
                          {active && (
                            <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-brand" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>

        {/* Footer */}
        {totalCount > 0 && (
          <div className="flex items-center justify-between gap-3 border-t border-ink-200 bg-paper px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-ink-500">
            <span>
              {totalCount} match{totalCount === 1 ? "" : "es"}
            </span>
            <span className="flex items-center gap-3">
              <span>↑↓ navigate</span>
              <span>↵ open</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
