import { notFound } from "next/navigation";
import Link from "next/link";
import { Heart } from "lucide-react";
import { resolveClient } from "@/lib/personas";
import { STYLES } from "@/lib/gallery";
import WishlistGrid from "@/components/me/WishlistGrid";
import BackArrow from "@/components/me/BackArrow";

export default async function WishlistPage({
  params,
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;
  const client = resolveClient(clientSlug);
  if (!client) notFound();

  return (
    <div className="space-y-5 px-4 py-5">
      <header>
        <BackArrow clientSlug={clientSlug} />
        <div className="mt-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-brand">
          <Heart className="h-3 w-3 fill-brand" /> 💜 Wishlist
        </div>
        <h1 className="mt-1 font-serif text-[28px] font-semibold leading-tight text-ink-900">
          Saved for later
        </h1>
        <p className="mt-1 text-xs text-ink-500">
          Tap any look to start a booking. Hearts persist across visits.
        </p>
      </header>

      <WishlistGrid clientSlug={clientSlug} allStyles={STYLES} />

      <Link
        href={`/book?as=${clientSlug}`}
        className="block rounded-2xl border border-dashed border-ink-300 bg-white p-4 text-center text-sm text-brand hover:border-brand"
      >
        Browse more styles →
      </Link>
    </div>
  );
}
