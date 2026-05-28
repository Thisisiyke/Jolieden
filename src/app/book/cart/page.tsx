import { redirect } from "next/navigation";

// The "cart" icon in BookHeader points here. We treat the cart as implicit —
// items move directly from configure → checkout — so /book/cart just
// forwards. Keeps the icon clickable without building a separate review
// surface for the prototype.

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ as?: string; rebook?: string }>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.as) qs.set("as", params.as);
  if (params.rebook) qs.set("rebook", params.rebook);
  const suffix = qs.toString();
  redirect(`/book/checkout${suffix ? "?" + suffix : ""}`);
}
