// Phone-frame wrapper used by both /me (client app) and /pro (stylist app).
// On desktop, content sits in a max-w-md column with a drop shadow that mimics
// a phone screen. On mobile, the frame collapses to full width.

export default function MobileFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper-mute py-0 sm:py-6">
      <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col bg-white shadow-none ring-0 sm:min-h-[800px] sm:rounded-3xl sm:shadow-[0_30px_60px_-30px_rgba(67,25,38,0.45)] sm:ring-1 sm:ring-ink-200 sm:overflow-hidden">
        {children}
      </div>
    </div>
  );
}
