"use client";

import { useState } from "react";
import { MoreHorizontal, Plus, ChevronDown } from "lucide-react";
import { CONVERSATIONS } from "../../lib/data";
import { Avatar } from "../../components/Avatar";

export default function MessagesPage() {
  const [tab, setTab] = useState<"open" | "closed">("open");
  const [selected, setSelected] = useState<string | null>(null);
  const list = CONVERSATIONS.filter((c) => c.status === tab);
  const sel = list.find((c) => c.id === selected) ?? null;

  return (
    <div className="h-[calc(100vh-3.5rem)] flex bg-white">
      {/* Inbox column */}
      <aside className="w-[380px] border-r border-ink-200 flex flex-col">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h1 className="text-[20px] font-semibold text-ink-900">Inbox</h1>
          <div className="flex items-center gap-1">
            <button className="h-8 w-8 rounded hover:bg-ink-100 text-ink-500 flex items-center justify-center">
              <MoreHorizontal className="h-4 w-4" />
            </button>
            <button className="h-8 px-3 text-[12px] rounded bg-brand text-white hover:bg-brand-700 font-semibold inline-flex items-center gap-1">
              <Plus className="h-3 w-3" /> New message
            </button>
          </div>
        </div>
        <div className="px-4 flex items-center gap-4 border-b border-ink-200">
          {(["open", "closed"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "py-2 text-[13px] font-medium relative " +
                (tab === t ? "text-brand" : "text-ink-500")
              }
            >
              {t === "open" ? "Open" : "Closed"}
              {tab === t && (
                <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-brand" />
              )}
            </button>
          ))}
          <span className="ml-auto text-[12px] text-ink-500 inline-flex items-center gap-1">
            Active <ChevronDown className="h-3 w-3" />
          </span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {list.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              className={
                "w-full text-left px-4 py-3 flex gap-3 border-b border-ink-100 " +
                (selected === c.id ? "bg-brand-50" : "hover:bg-ink-50")
              }
            >
              <Avatar name={c.name === "Unknown" ? "U N" : c.name} size={32} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold text-ink-900 truncate">
                    {c.name}
                  </span>
                  <span className="text-[11px] text-ink-500 shrink-0">
                    {c.time}
                  </span>
                </div>
                <div className="text-[12px] text-ink-500 truncate">
                  {c.preview}
                </div>
              </div>
              {c.unread && (
                <span className="h-2 w-2 rounded-full bg-brand mt-2 shrink-0" />
              )}
            </button>
          ))}
        </div>
      </aside>

      {/* Conversation pane */}
      <section className="flex-1 flex flex-col">
        {sel ? (
          <>
            <div className="h-14 border-b border-ink-200 px-5 flex items-center gap-3">
              <Avatar name={sel.name === "Unknown" ? "U N" : sel.name} size={36} />
              <div className="leading-tight">
                <div className="text-[14px] font-semibold text-ink-900">
                  {sel.name}
                </div>
                <div className="text-[11px] text-ink-500">{sel.preview.split(" — ")[0]}</div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-ink-50">
              <Bubble side="them">{sel.preview.split(" — ").slice(1).join(" — ") || sel.preview}</Bubble>
              <Bubble side="me">Hi! Yes — happy to help. What time works best for you?</Bubble>
              <Bubble side="them">Around 4pm Friday if possible 🙏</Bubble>
            </div>
            <div className="border-t border-ink-200 p-3 flex items-center gap-2">
              <input
                placeholder="Type a message…"
                className="flex-1 h-10 px-3 rounded border border-ink-300 text-[13px] outline-none focus:border-brand"
              />
              <button className="h-10 px-4 rounded bg-brand text-white text-[13px] font-semibold hover:bg-brand-700">
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center px-6">
            <div>
              <div className="text-[15px] font-semibold text-ink-900">
                It&apos;s quiet in here. A little too quiet.
              </div>
              <div className="text-[12px] text-ink-500 mt-1">
                Select a conversation or send a new message to break the silence.
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Bubble({
  children,
  side,
}: {
  children: React.ReactNode;
  side: "me" | "them";
}) {
  return (
    <div className={"flex " + (side === "me" ? "justify-end" : "justify-start")}>
      <div
        className={
          "max-w-[60%] px-3 py-2 rounded-2xl text-[13px] " +
          (side === "me"
            ? "bg-brand text-white rounded-br-sm"
            : "bg-white border border-ink-200 text-ink-900 rounded-bl-sm")
        }
      >
        {children}
      </div>
    </div>
  );
}
