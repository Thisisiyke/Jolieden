"use client";

import { useState } from "react";
import { X, Send } from "lucide-react";

export function HelpChat({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [msgs, setMsgs] = useState<{ id: number; side: "me" | "them"; text: string }[]>([
    { id: 1, side: "them", text: "Hi! How can we help you today?" },
  ]);
  const [draft, setDraft] = useState("");

  if (!open) return null;

  const send = () => {
    if (!draft.trim()) return;
    const next = [...msgs, { id: Date.now(), side: "me" as const, text: draft.trim() }];
    setMsgs(next);
    setDraft("");
    setTimeout(() => {
      setMsgs((p) => [...p, { id: Date.now() + 1, side: "them" as const, text: "Thanks — a support specialist will be with you shortly." }]);
    }, 900);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[360px] h-[460px] bg-white rounded-2xl shadow-2xl border border-ink-200 flex flex-col overflow-hidden">
      <header className="h-12 px-4 flex items-center justify-between bg-brand text-white">
        <div>
          <div className="text-[14px] font-semibold">Boulevard Support</div>
          <div className="text-[11px] text-white/70">Typically replies in a few minutes</div>
        </div>
        <button onClick={onClose} className="h-7 w-7 rounded hover:bg-white/10 flex items-center justify-center"><X className="h-4 w-4" /></button>
      </header>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-ink-50">
        {msgs.map((m) => (
          <div key={m.id} className={"flex " + (m.side === "me" ? "justify-end" : "justify-start")}>
            <div className={
              "max-w-[75%] px-3 py-2 rounded-2xl text-[14px] " +
              (m.side === "me"
                ? "bg-brand text-white rounded-br-sm"
                : "bg-white border border-ink-200 text-ink-900 rounded-bl-sm")
            }>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-ink-200 p-2 flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder="Type a message…"
          className="flex-1 h-9 px-3 rounded border border-ink-300 text-[14px] outline-none focus:border-brand"
        />
        <button onClick={send} className="h-9 w-9 rounded bg-brand text-white flex items-center justify-center disabled:opacity-50" disabled={!draft.trim()}>
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
