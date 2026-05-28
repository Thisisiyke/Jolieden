// /book shell — wraps the client booking web app. Header + hero + log-in
// strip on top, footer below. Children are the page-specific content
// (gallery, style detail, configure, etc.).
//
// BookHeader + ReturningClientStrip read ?as= via useSearchParams, so
// each must be Suspense-wrapped (Next.js App Router requirement during
// CSR-bailout / static optimization).

import { Suspense } from "react";
import BookHeader from "@/components/book/BookHeader";
import BookHero from "@/components/book/BookHero";
import ReturningClientStrip from "@/components/book/ReturningClientStrip";
import BookFooter from "@/components/book/BookFooter";

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Suspense fallback={<div className="h-12 bg-ink-900" />}>
        <BookHeader />
      </Suspense>
      <BookHero />
      <Suspense fallback={null}>
        <ReturningClientStrip />
      </Suspense>
      <main className="flex-1">{children}</main>
      <BookFooter />
    </div>
  );
}
