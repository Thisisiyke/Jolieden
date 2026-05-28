import type { Metadata } from "next";
import "./globals.css";
import { TopNav } from "../components/TopNav";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Jolieden's Beauty Bar",
  description: "Front of house operations",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning is the Next.js-recommended fix for
    // dev-only hydration mismatches caused by browser extensions
    // (Dark Reader, Grammarly, etc.) mutating <html> or <body> before
    // React hydrates. Safe — only suppresses the warning on the root
    // tags, not their descendants.
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body
        className="min-h-full flex flex-col bg-white text-ink-900"
        suppressHydrationWarning
      >
        <Providers>
          <TopNav />
          <main className="flex-1 min-h-0">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
