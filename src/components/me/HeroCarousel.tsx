"use client";

// Swipeable hero carousel for the /me home tab. Snap-scroll with pagination
// dots. Tap a card to jump into its target (book, rewards, refer, sms).

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Cake, Gift, MessageSquare, Sparkles, Users } from "lucide-react";
import clsx from "clsx";

export type HeroCard = {
  id: string;
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  tone: "birthday" | "feature" | "refer" | "concierge";
  backgroundImage?: string;
};

const ICONS: Record<HeroCard["tone"], typeof Sparkles> = {
  birthday: Cake,
  feature: Sparkles,
  refer: Users,
  concierge: MessageSquare,
};

const TONE_BG: Record<HeroCard["tone"], string> = {
  birthday: "bg-gradient-to-br from-gold-soft via-paper to-brand-50",
  feature: "bg-gradient-to-br from-brand-500 to-brand",
  refer: "bg-gradient-to-br from-[#2a0e16] via-brand to-brand-500",
  concierge: "bg-gradient-to-br from-ink-900 to-brand-700",
};

const TONE_TEXT: Record<HeroCard["tone"], string> = {
  birthday: "text-brand",
  feature: "text-white",
  refer: "text-white",
  concierge: "text-white",
};

function HeroSlide({ card }: { card: HeroCard }) {
  const Icon = ICONS[card.tone];
  return (
    <Link
      href={card.href}
      className={clsx(
        "relative flex h-[180px] w-[300px] shrink-0 snap-center flex-col justify-end overflow-hidden rounded-2xl p-4 shadow-sm",
        !card.backgroundImage && TONE_BG[card.tone],
      )}
      style={
        card.backgroundImage
          ? {
              backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.65) 100%), url(${card.backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <div
        className={clsx(
          "flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider",
          card.backgroundImage ? "text-white/85" : TONE_TEXT[card.tone] + " opacity-80",
        )}
      >
        <Icon className="h-3 w-3" />
        {card.eyebrow}
      </div>
      <h3
        className={clsx(
          "mt-1 font-serif text-xl font-semibold leading-tight",
          card.backgroundImage ? "text-white" : TONE_TEXT[card.tone],
        )}
      >
        {card.title}
      </h3>
      <p
        className={clsx(
          "mt-1 line-clamp-2 text-xs leading-snug",
          card.backgroundImage ? "text-white/90" : TONE_TEXT[card.tone] + " opacity-85",
        )}
      >
        {card.description}
      </p>
    </Link>
  );
}

export default function HeroCarousel({ cards }: { cards: HeroCard[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Track which card is centered for the pagination dots.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const cardW = 300 + 12; // card width + gap
      const idx = Math.round(el.scrollLeft / cardW);
      setActive(Math.min(cards.length - 1, Math.max(0, idx)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [cards.length]);

  return (
    <section>
      <div
        ref={scrollRef}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {cards.map((c) => (
          <HeroSlide key={c.id} card={c} />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-center gap-1.5">
        {cards.map((_, i) => (
          <span
            key={i}
            className={clsx(
              "h-1.5 rounded-full transition-all",
              i === active ? "w-4 bg-brand" : "w-1.5 bg-ink-300",
            )}
          />
        ))}
      </div>
    </section>
  );
}

// Convenience icon re-exports so the home page doesn't pull from two places.
export { Gift };
