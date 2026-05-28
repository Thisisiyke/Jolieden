"use client";

// iMessage-style auto-playing AI SMS simulator. Drops into the existing
// MobileFrame so reviewers see the AI conversation the way a client would.
//
// Each scenario is an array of turns from src/lib/smsScenarios.ts. The
// simulator advances through them with realistic typing delays + dots for
// AI/stylist messages. Scenario picker at the top swaps the script.

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Phone, Video, Info, Sparkles } from "lucide-react";
import clsx from "clsx";
import { SCENARIOS, type SmsScenario, type SmsTurn } from "@/lib/smsScenarios";

type RenderedTurn = SmsTurn & { id: string };

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-ink-500/60"
          style={{
            animation: `imsg-bounce 1.2s ${i * 0.15}s infinite ease-in-out`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes imsg-bounce {
          0%,
          60%,
          100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-3px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

function Bubble({ turn }: { turn: SmsTurn }) {
  const right = turn.from === "client";
  return (
    <div className={clsx("flex w-full", right ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-[78%] rounded-2xl px-3.5 py-2 text-[15px] leading-snug shadow-sm",
          right
            ? "rounded-br-md bg-[#3b82f6] text-white"
            : turn.from === "ai"
              ? "rounded-bl-md bg-[#e9e9eb] text-ink-900"
              : "rounded-bl-md border border-brand/40 bg-brand-50 text-ink-900",
        )}
      >
        {turn.from === "stylist" && (
          <div className="mb-0.5 font-mono text-[10px] uppercase tracking-wider text-brand">
            Dieynaba D. — taken over
          </div>
        )}
        {turn.from === "ai" && !right && (
          <div className="mb-0.5 flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-ink-500">
            <Sparkles className="h-3 w-3" />
            Jolieden AI
          </div>
        )}
        <p className="whitespace-pre-wrap">{turn.body}</p>
      </div>
    </div>
  );
}

function ScenarioPicker({
  scenarios,
  current,
  onPick,
}: {
  scenarios: SmsScenario[];
  current: string;
  onPick: (id: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 pb-3 pt-1">
      {scenarios.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onPick(s.id)}
          className={clsx(
            "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            current === s.id
              ? "border-brand bg-brand text-white"
              : "border-ink-200 bg-white text-ink-700 hover:border-brand",
          )}
        >
          {s.title}
        </button>
      ))}
    </div>
  );
}

export default function SmsSimulator() {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const scenario = useMemo(
    () => SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0],
    [scenarioId],
  );

  const [rendered, setRendered] = useState<RenderedTurn[]>([]);
  const [aiTyping, setAiTyping] = useState<"ai" | "stylist" | null>(null);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Re-play the script when scenario changes.
  useEffect(() => {
    setRendered([]);
    setAiTyping(null);
    for (const t of timeouts.current) clearTimeout(t);
    timeouts.current = [];

    let cursor = 0;
    for (let i = 0; i < scenario.turns.length; i++) {
      const turn = scenario.turns[i];
      const startsAt = cursor;
      const showTypingFor =
        (turn.from === "ai" || turn.from === "stylist") && turn.typingMs
          ? Math.min(turn.typingMs, turn.delay - 100)
          : 0;

      // Show typing dots before AI/stylist message lands.
      if (showTypingFor > 0) {
        timeouts.current.push(
          setTimeout(() => setAiTyping(turn.from as "ai" | "stylist"), startsAt + Math.max(0, turn.delay - showTypingFor)),
        );
      }
      cursor += turn.delay;
      timeouts.current.push(
        setTimeout(() => {
          setAiTyping(null);
          setRendered((prev) => [...prev, { ...turn, id: `${scenario.id}-${i}` }]);
        }, cursor),
      );
    }
    return () => {
      for (const t of timeouts.current) clearTimeout(t);
      timeouts.current = [];
    };
  }, [scenario]);

  // Auto-scroll bubbles into view as they arrive.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [rendered, aiTyping]);

  const replay = () => setScenarioId(scenario.id + "");
  const allShown = rendered.length === scenario.turns.length && !aiTyping;

  return (
    <>
      {/* iMessage-style header: gray title bar + contact */}
      <header className="flex shrink-0 flex-col border-b border-ink-200 bg-[#f6f6f6]">
        <div className="flex h-10 items-center justify-between px-3 text-[15px]">
          <Link href="/demo" className="flex items-center gap-0.5 text-[#007aff]">
            <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
            <span>2</span>
          </Link>
          <div className="flex items-center gap-3 text-[#007aff]">
            <Video className="h-5 w-5" strokeWidth={2.2} />
            <Phone className="h-4 w-4" strokeWidth={2.2} />
          </div>
        </div>
        <div className="flex flex-col items-center px-4 pb-3 pt-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand to-gold text-sm font-semibold text-white">
            JD
          </div>
          <div className="mt-1 flex items-center gap-1 text-[12px] font-medium text-ink-900">
            Jolieden Beauty Bar
            <Info className="h-3 w-3 text-[#007aff]" />
          </div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            +1 (646) 555 0100
          </div>
        </div>
      </header>

      {/* Scenario picker */}
      <div className="shrink-0 border-b border-ink-200 bg-white">
        <ScenarioPicker scenarios={SCENARIOS} current={scenarioId} onPick={setScenarioId} />
      </div>

      {/* Conversation pane */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto bg-white px-3 py-4">
        <div className="space-y-2">
          <div className="text-center font-mono text-[10px] uppercase tracking-wider text-ink-500">
            iMessage · {scenario.client.phone}
          </div>
          {rendered.map((t) => (
            <Bubble key={t.id} turn={t} />
          ))}
          {aiTyping && (
            <div className="flex w-full justify-start">
              <div
                className={clsx(
                  "rounded-2xl",
                  aiTyping === "ai" ? "bg-[#e9e9eb]" : "border border-brand/40 bg-brand-50",
                )}
              >
                <TypingDots />
              </div>
            </div>
          )}
          {allShown && (
            <div className="pt-3 text-center">
              <button
                type="button"
                onClick={replay}
                className="rounded-full border border-ink-200 bg-white px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-700 hover:border-brand"
              >
                Replay
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Disabled iMessage input */}
      <div className="shrink-0 border-t border-ink-200 bg-[#f6f6f6] px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ink-300 text-ink-500">
            +
          </div>
          <div className="flex-1 rounded-full border border-ink-300 bg-white px-3 py-1.5 text-[13px] text-ink-400">
            iMessage
          </div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">demo</div>
        </div>
      </div>
    </>
  );
}
