"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp, Mail, MessageCircle } from "lucide-react";
import { Avatar } from "../Avatar";
import type { Client } from "../../lib/data";

export type SortKey = "name" | "marketing" | "phone" | "email";
export type SortDir = "asc" | "desc";

export function ClientsTable({
  rows,
  sortKey,
  sortDir,
  onSort,
}: {
  rows: Client[];
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
}) {
  return (
    <div className="rounded-lg border border-ink-200 bg-white overflow-hidden">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="bg-ink-50 text-ink-500 uppercase text-[10px] tracking-wide">
            <ThSort
              label="Client name"
              k="name"
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
              className="pl-5"
            />
            <ThSort
              label="Marketing status"
              k="marketing"
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
            />
            <ThSort
              label="Phone number"
              k="phone"
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
            />
            <ThSort
              label="Email"
              k="email"
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
            />
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id} className="border-t border-ink-100 hover:bg-ink-50">
              <td className="pl-5 py-3">
                <Link
                  href={`/clients/${c.id}`}
                  className="flex items-center gap-3 group"
                >
                  <Avatar name={`${c.firstName} ${c.lastName}`} hue={c.avatarHue} />
                  <span className="text-ink-900 font-medium group-hover:text-brand">
                    {c.firstName} {c.lastName}
                  </span>
                </Link>
              </td>
              <td className="py-3">
                <div className="flex items-center gap-1.5">
                  <Pill label="Email" active={c.emailOptIn} icon={<Mail className="h-3 w-3" />} />
                  <Pill label="Text" active={c.textOptIn} icon={<MessageCircle className="h-3 w-3" />} />
                </div>
              </td>
              <td className="py-3 text-ink-700">{c.phone}</td>
              <td className="py-3 text-ink-700">{c.email}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={4} className="py-16 text-center text-ink-500 text-[13px]">
                No clients match the current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ThSort({
  label,
  k,
  sortKey,
  sortDir,
  onSort,
  className = "",
}: {
  label: string;
  k: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
  className?: string;
}) {
  const active = sortKey === k;
  return (
    <th className={"text-left py-2.5 font-semibold " + className}>
      <button
        onClick={() => onSort(k)}
        className={
          "inline-flex items-center gap-1 hover:text-ink-900 " +
          (active ? "text-ink-900" : "")
        }
      >
        {label}
        {active ? (
          sortDir === "asc" ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )
        ) : (
          <ChevronDown className="h-3 w-3 opacity-30" />
        )}
      </button>
    </th>
  );
}

function Pill({
  label,
  active,
  icon,
}: {
  label: string;
  active: boolean;
  icon: React.ReactNode;
}) {
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold " +
        (active
          ? "bg-brand text-white"
          : "bg-ink-100 text-ink-500")
      }
    >
      {icon}
      {label}
    </span>
  );
}
