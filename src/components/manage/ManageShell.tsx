"use client";

import { useState } from "react";
import clsx from "clsx";

export function PageHeader({
  title,
  actions,
}: {
  title: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-ink-200">
      <h1 className="text-[20px] font-semibold text-ink-900">{title}</h1>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
  );
}

export function SubTabs<T extends string>({
  tabs,
  value,
  onChange,
  rightLink,
}: {
  tabs: { id: T; label: string; badge?: string }[];
  value: T;
  onChange: (v: T) => void;
  rightLink?: React.ReactNode;
}) {
  return (
    <div className="px-6 bg-white border-b border-ink-200 flex items-end justify-between">
      <div className="flex gap-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={clsx(
              "relative py-3 text-[14px] font-semibold inline-flex items-center gap-2",
              value === t.id ? "text-brand" : "text-ink-500 hover:text-ink-900",
            )}
          >
            {t.label}
            {t.badge && (
              <span className="rounded-full bg-rose-500 text-white text-[10px] leading-none px-1.5 py-0.5 font-bold">
                {t.badge}
              </span>
            )}
            {value === t.id && (
              <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-brand" />
            )}
          </button>
        ))}
      </div>
      {rightLink}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  message,
  cta,
  learnMore,
}: {
  icon?: string;
  title: string;
  message: string;
  cta?: React.ReactNode;
  learnMore?: string;
}) {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="text-center max-w-md">
        {icon && (
          <div className="text-[40px] mb-3">{icon}</div>
        )}
        <h2 className="text-[18px] font-semibold text-ink-900">{title}</h2>
        <p className="text-[14px] text-ink-500 mt-1">{message}</p>
        <div className="mt-5 flex flex-col items-center gap-2">
          {cta}
          {learnMore && (
            <a className="text-[12px] text-brand underline cursor-pointer">{learnMore}</a>
          )}
        </div>
      </div>
    </div>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-ink-200 bg-white overflow-hidden">
      {children}
    </div>
  );
}

export function ToggleRow({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={clsx(
        "h-5 w-9 rounded-full p-0.5 transition",
        checked ? "bg-brand" : "bg-ink-300",
      )}
    >
      <span
        className={clsx(
          "block h-4 w-4 rounded-full bg-white transition",
          checked ? "translate-x-4" : "translate-x-0",
        )}
      />
    </button>
  );
}

export function MarketingPill({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={clsx(
        "rounded-full px-2.5 py-1 text-[11px] font-semibold",
        active
          ? "bg-brand text-white"
          : "bg-ink-100 text-ink-500 hover:bg-ink-200",
      )}
    >
      {label}
    </button>
  );
}

export function useToggle(initial: boolean): [boolean, () => void] {
  const [v, setV] = useState(initial);
  return [v, () => setV((x) => !x)];
}
