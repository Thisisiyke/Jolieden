import { notFound } from "next/navigation";
import { Bot, Sparkles } from "lucide-react";
import { resolveStylist, CAST } from "@/lib/personas";
import { escalationsForStylist } from "@/lib/aiInbox";
import InboxThread from "@/components/pro/InboxThread";

export default async function StylistInboxPage({
  params,
}: {
  params: Promise<{ stylistSlug: string }>;
}) {
  const { stylistSlug } = await params;
  const stylist = resolveStylist(stylistSlug);
  if (!stylist) notFound();

  const items = escalationsForStylist(stylistSlug);
  const isOwner = stylistSlug === CAST.owner;

  return (
    <div className="space-y-5 px-5 py-6">
      <header>
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-brand">
          <Bot className="h-3 w-3" /> AI takeover queue
        </div>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-brand">
          {isOwner ? "All escalated AI threads" : "Your inbox"}
        </h1>
        <p className="mt-1 text-xs text-ink-500">
          {items.length === 0
            ? "Nothing waiting. The AI is handling everything else on its own right now."
            : isOwner
              ? `${items.length} active threads across the team. Tap any to read what the AI tried before taking over.`
              : `${items.length} thread${items.length === 1 ? "" : "s"} the AI escalated to ${stylist.name.split(" ")[0]}. One tap to take over.`}
        </p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-300 bg-white p-6 text-center">
          <Sparkles className="mx-auto h-6 w-6 text-brand" />
          <p className="mt-2 text-sm font-medium text-ink-900">All clear</p>
          <p className="mt-1 text-xs text-ink-500">
            AI Concierge is autonomously handling every active thread.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((e) => (
            <InboxThread key={e.id} escalation={e} />
          ))}
        </div>
      )}
    </div>
  );
}
