"use client";

// Draggable comments widget. Mounted in <Providers> so it appears on every
// page. Reviewers (Diéssou + team) click it to leave feedback per-screen.
// Backend: /api/comments → GitHub Issues. Author + card position persist to
// localStorage so the reviewer only sets them up once.

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquare, X, GripHorizontal, Send, Loader2, ExternalLink } from "lucide-react";

type Comment = {
  id: number;
  page: string;
  author: string;
  body: string;
  createdAt: string;
  url: string;
};

const AUTHOR_KEY = "jolieden.commentAuthor";
const POS_KEY = "jolieden.commentWidgetPos";

const DEFAULT_POS = { x: 24, y: 24 }; // offset from bottom-right corner

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function CommentsWidget() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [pos, setPos] = useState(DEFAULT_POS);
  const [error, setError] = useState<string | null>(null);
  const dragStart = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  // Load persisted author + position on mount.
  useEffect(() => {
    try {
      const a = localStorage.getItem(AUTHOR_KEY);
      if (a) setAuthor(a);
      const p = localStorage.getItem(POS_KEY);
      if (p) {
        const parsed = JSON.parse(p);
        if (typeof parsed.x === "number" && typeof parsed.y === "number") setPos(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/comments?page=${encodeURIComponent(pathname)}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const txt = await res.text();
        setError(`Couldn't load (${res.status})`);
        setComments([]);
        return;
      }
      const data = await res.json();
      setComments(data.comments || []);
    } catch {
      setError("Network error");
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [pathname]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Drag from the handle.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    dragStart.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    // Position is anchored to bottom-right, so subtract delta
    const next = { x: Math.max(8, dragStart.current.px - dx), y: Math.max(8, dragStart.current.py - dy) };
    setPos(next);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStart.current) {
      try {
        localStorage.setItem(POS_KEY, JSON.stringify(pos));
      } catch {
        /* ignore */
      }
    }
    dragStart.current = null;
    (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
  };

  const onAuthorChange = (v: string) => {
    setAuthor(v);
    try {
      localStorage.setItem(AUTHOR_KEY, v);
    } catch {
      /* ignore */
    }
  };

  const submit = async () => {
    if (!body.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: author || "anonymous", body, page: pathname }),
      });
      if (!res.ok) {
        const txt = await res.text();
        setError(`Couldn't post (${res.status})`);
        return;
      }
      setBody("");
      await fetchComments();
    } catch {
      setError("Network error");
    } finally {
      setPosting(false);
    }
  };

  return (
    <>
      {/* Floating launcher card */}
      <div
        className="fixed z-50 select-none"
        style={{ right: pos.x, bottom: pos.y }}
      >
        <div className="flex items-stretch overflow-hidden rounded-full bg-brand text-white shadow-lg ring-1 ring-black/5">
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            className="flex cursor-grab items-center px-2 active:cursor-grabbing"
            title="Drag to move"
          >
            <GripHorizontal size={14} className="opacity-70" />
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 py-2 pl-1 pr-3 text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            <MessageSquare size={16} />
            <span>Comment on this screen</span>
            {comments.length > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 font-mono text-[11px] font-semibold text-brand">
                {comments.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Side panel */}
      {open && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-ink-900/30"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-ink-200 px-5 py-4">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-wider text-ink-500">
                  Stakeholder feedback
                </div>
                <h2 className="text-lg font-semibold text-ink-900">Comments on this screen</h2>
                <p className="mt-0.5 font-mono text-xs text-ink-500 break-all">{pathname}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-ink-500">
                  <Loader2 size={14} className="animate-spin" /> Loading…
                </div>
              ) : error ? (
                <div className="rounded-md border border-status-pending/40 bg-status-pending/10 px-3 py-2 text-sm text-ink-900">
                  {error}
                  <div className="mt-1 text-xs text-ink-500">
                    GITHUB_TOKEN may not be set in this environment. See README.
                  </div>
                </div>
              ) : comments.length === 0 ? (
                <div className="rounded-md bg-paper p-4 text-sm text-ink-500">
                  No comments yet on this screen. Be the first to leave feedback.
                </div>
              ) : (
                <ul className="space-y-3">
                  {comments.map((c) => (
                    <li key={c.id} className="rounded-md border border-ink-200 bg-paper p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-medium text-ink-900">{c.author}</div>
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-ink-500 hover:text-brand"
                          title="Open in GitHub"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </div>
                      <div className="mt-1 text-xs text-ink-500">{relativeTime(c.createdAt)}</div>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-ink-700">{c.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-ink-200 bg-paper-mute px-5 py-4">
              <label className="block text-xs font-medium uppercase tracking-wider text-ink-500">
                Your name
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => onAuthorChange(e.target.value)}
                placeholder="Diéssou"
                className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder-ink-300 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
              <label className="mt-3 block text-xs font-medium uppercase tracking-wider text-ink-500">
                Comment
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
                }}
                placeholder="What's working or not on this screen?"
                rows={3}
                className="mt-1 w-full resize-none rounded-md border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder-ink-300 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="font-mono text-[11px] text-ink-500">⌘ + Enter to send</span>
                <button
                  type="button"
                  onClick={submit}
                  disabled={posting || !body.trim()}
                  className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {posting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
