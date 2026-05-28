"use client";

// Mobile splash — appears once when the /me or /pro shell first mounts in a
// session. Fades the Jolieden logo + wordmark up over cream, then dismisses
// after ~1.6s. Uses sessionStorage so it doesn't re-show on every nav.

import { useEffect, useState } from "react";
import Image from "next/image";

const SHOWN_KEY = "jolieden-splash-shown";

export default function MobileSplash({ kind }: { kind: "me" | "pro" }) {
  // Default `false` so SSR matches the initial-hide path; we flip it true on
  // the client only if this session hasn't seen the splash yet.
  const [show, setShow] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(SHOWN_KEY)) return;
    setShow(true);
    const fadeAt = window.setTimeout(() => setFadingOut(true), 1200);
    const hideAt = window.setTimeout(() => {
      setShow(false);
      window.sessionStorage.setItem(SHOWN_KEY, "1");
    }, 1600);
    return () => {
      window.clearTimeout(fadeAt);
      window.clearTimeout(hideAt);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className={
        "pointer-events-none absolute inset-0 z-50 flex flex-col items-center justify-center bg-paper transition-opacity duration-500 " +
        (fadingOut ? "opacity-0" : "opacity-100")
      }
      aria-hidden="true"
    >
      <div className="relative h-32 w-32">
        <Image
          src="/jolieden-logo.png"
          alt=""
          fill
          priority
          sizes="128px"
          className="object-contain"
        />
      </div>
      <div className="mt-6 font-serif text-2xl font-semibold tracking-[0.16em] text-brand">
        JOLIEDEN
      </div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">
        {kind === "pro" ? "Stylist" : "Beauty Bar"}
      </div>
      {/* Loading hairline */}
      <div className="mt-10 h-0.5 w-24 overflow-hidden rounded-full bg-ink-200">
        <div
          className="h-full w-1/2 rounded-full bg-brand"
          style={{
            animation: "splash-slide 1.2s ease-in-out infinite",
          }}
        />
      </div>
      <style jsx>{`
        @keyframes splash-slide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(96px); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
