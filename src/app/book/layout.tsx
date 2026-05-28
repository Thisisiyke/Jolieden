// /book shell — wraps the client booking web app. Header + hero + log-in
// strip on top, footer below. Children are the page-specific content
// (gallery, style detail, configure, etc.).

import BookHeader from "@/components/book/BookHeader";
import BookHero from "@/components/book/BookHero";
import ReturningClientStrip from "@/components/book/ReturningClientStrip";
import BookFooter from "@/components/book/BookFooter";

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <BookHeader />
      <BookHero />
      <ReturningClientStrip />
      <main className="flex-1">{children}</main>
      <BookFooter />
    </div>
  );
}
