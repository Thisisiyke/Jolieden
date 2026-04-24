import type { Metadata } from "next";
import "./globals.css";
import { TopNav } from "../components/TopNav";

export const metadata: Metadata = {
  title: "Jolieden's Beauty Bar",
  description: "Front of house operations",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-ink-900">
        <TopNav />
        <main className="flex-1 min-h-0">{children}</main>
      </body>
    </html>
  );
}
