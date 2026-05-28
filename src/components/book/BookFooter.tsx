// Minimal footer. Replaces "Powered by Boulevard" — Jolieden owns the
// surface end-to-end.

import { Camera, Music2, Mail, MapPin } from "lucide-react";
import Link from "next/link";

export default function BookFooter() {
  return (
    <footer className="border-t border-ink-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 text-sm text-ink-700 sm:grid-cols-3">
        <div>
          <div className="font-serif text-base font-semibold text-brand">JOLIEDEN</div>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Beauty Bar
          </p>
          <p className="mt-3 text-xs text-ink-500">
            New levels of self-confidence and self-expression are possible.
          </p>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-ink-500">Visit</div>
          <p className="mt-2 flex items-center gap-1.5 text-xs">
            <MapPin className="h-3.5 w-3.5" /> New York, NY
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs">
            <Mail className="h-3.5 w-3.5" /> hello@joliedensbeautybar.com
          </p>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-ink-500">Follow</div>
          <div className="mt-2 flex gap-3 text-ink-700">
            <Link
              href="https://www.instagram.com/joliedensbeautybar/"
              className="hover:text-brand"
              aria-label="Instagram"
            >
              <Camera className="h-4 w-4" />
            </Link>
            <Link
              href="https://www.tiktok.com/@joliedensbeautybar"
              className="hover:text-brand"
              aria-label="TikTok"
            >
              <Music2 className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-ink-200 bg-paper-mute py-3 text-center">
        <p className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
          Prototype · Jolieden custom booking experience
        </p>
      </div>
    </footer>
  );
}
