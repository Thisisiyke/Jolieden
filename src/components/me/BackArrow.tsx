// Small back-arrow chip used on deep /me/[slug]/* pages so users have an
// in-frame way back to their home tab. Renders above the page title.

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  clientSlug: string;
  label?: string; // defaults to "Home"
};

export default function BackArrow({ clientSlug, label = "Home" }: Props) {
  return (
    <Link
      href={`/me/${clientSlug}`}
      className="-ml-1 inline-flex items-center gap-0.5 text-brand hover:text-brand-700"
      aria-label="Back to home"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={2.4} />
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}
