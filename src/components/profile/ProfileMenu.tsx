"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, UserCircle2, ExternalLink, LogOut } from "lucide-react";
import { CHANGELOG } from "../../lib/profile";
import { ChangelogPanel } from "./ChangelogPanel";
import { ReferModal } from "./ReferModal";
import { HelpChat } from "./HelpChat";

export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [changes, setChanges] = useState(CHANGELOG);
  const [showChangelog, setShowChangelog] = useState(false);
  const [showRefer, setShowRefer] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const unread = changes.filter((c) => !c.read).length;

  return (
    <>
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="ml-1 flex items-center gap-0.5 text-white/80 hover:text-white"
          aria-label="Account menu"
        >
          <UserCircle2 className="h-7 w-7" />
          <ChevronDown className="h-4 w-4" />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 z-50 w-64 bg-white rounded-lg shadow-2xl border border-ink-200 overflow-hidden text-ink-900">
            {/* User card */}
            <div className="px-4 pt-4 pb-3 border-b border-ink-100">
              <div className="flex items-center gap-3">
                <UserCircle2 className="h-9 w-9 text-ink-400" />
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold truncate">Frederick Douglass</div>
                  <div className="text-[11px] text-ink-500 truncate">Owner · Admin</div>
                </div>
              </div>
            </div>

            <div className="py-1">
              <MenuLink href="/settings/my-settings" label="My Settings" onClick={() => setOpen(false)} />
              <MenuExternal href="https://support.boulevard.io" label="Support Center" onClick={() => setOpen(false)} />
              <MenuExternal href="https://auth.boulevard.io/user_voice" label="Submit an idea" onClick={() => setOpen(false)} />
              <MenuButton
                label="Changelog"
                badge={unread > 0 ? unread : undefined}
                onClick={() => { setShowChangelog(true); setOpen(false); }}
              />
              <MenuExternal href="https://www.academy.joinblvd.com/" label="Academy" onClick={() => setOpen(false)} />
              <MenuButton label="Refer a friend" onClick={() => { setShowRefer(true); setOpen(false); }} />
              <MenuButton label="Help Chat" onClick={() => { setShowHelp(true); setOpen(false); }} />
            </div>

            <div className="border-t border-ink-100 py-1">
              <button
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-2 px-4 py-2 text-[14px] text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>

            <div className="border-t border-ink-100 py-2 text-center bg-ink-50">
              <span className="text-[10px] uppercase tracking-wide text-ink-500 font-semibold">
                Powered by Jolieden
              </span>
            </div>
          </div>
        )}
      </div>

      <ChangelogPanel
        open={showChangelog}
        entries={changes}
        onClose={() => setShowChangelog(false)}
        onMarkAllRead={() => setChanges((p) => p.map((x) => ({ ...x, read: true })))}
      />
      <ReferModal open={showRefer} onClose={() => setShowRefer(false)} />
      <HelpChat open={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
}

function MenuLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center justify-between px-4 py-2 text-[14px] text-ink-900 hover:bg-ink-50"
    >
      {label}
    </Link>
  );
}

function MenuExternal({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={onClick}
      className="flex items-center justify-between px-4 py-2 text-[14px] text-ink-900 hover:bg-ink-50"
    >
      {label}
      <ExternalLink className="h-3 w-3 text-ink-400" />
    </a>
  );
}

function MenuButton({
  label, onClick, badge,
}: {
  label: string;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-2 text-[14px] text-ink-900 hover:bg-ink-50"
    >
      {label}
      {badge !== undefined && (
        <span className="rounded-full bg-brand text-white text-[10px] font-bold px-1.5 py-0.5">{badge}</span>
      )}
    </button>
  );
}
