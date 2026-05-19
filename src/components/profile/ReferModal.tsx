"use client";

import { useState } from "react";
import { X, Copy, Check } from "lucide-react";

export function ReferModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const link = "https://boulevard.io/r/joliedensbeautybar";

  if (!open) return null;

  const copy = () => {
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        <header className="h-12 px-5 flex items-center justify-between border-b border-ink-200">
          <h2 className="text-[15px] font-semibold text-ink-900">Refer a friend</h2>
          <button onClick={onClose} className="h-8 w-8 rounded hover:bg-ink-100 flex items-center justify-center text-ink-500"><X className="h-4 w-4" /></button>
        </header>
        <div className="p-5 space-y-4 text-[14px]">
          <p className="text-ink-700">
            Know a salon that would love Boulevard? Share your link — you both earn a credit when they subscribe.
          </p>
          <div>
            <span className="block text-[10px] uppercase tracking-wide font-bold text-ink-500 mb-1">Your referral link</span>
            <div className="flex items-center gap-2">
              <input readOnly value={link} className="flex-1 h-9 px-2 rounded border border-ink-300 bg-ink-50 text-[12px] font-mono" />
              <button
                onClick={copy}
                className="h-9 px-3 rounded border border-ink-300 text-[14px] text-ink-700 hover:bg-ink-50 inline-flex items-center gap-1.5"
              >
                {copied ? <><Check className="h-4 w-4 text-emerald-600" /> Copied</> : <><Copy className="h-4 w-4" /> Copy</>}
              </button>
            </div>
          </div>
          <div className="border-t border-ink-100 pt-4">
            <span className="block text-[10px] uppercase tracking-wide font-bold text-ink-500 mb-1">Or send by email</span>
            <div className="flex items-center gap-2">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="friend@theirsalon.com"
                className="flex-1 h-9 px-2 rounded border border-ink-300 bg-white text-[14px] outline-none focus:border-brand"
              />
              <button
                disabled={!email.trim()}
                onClick={() => { onClose(); }}
                className="h-9 px-3 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700 disabled:opacity-50"
              >Send invite</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
