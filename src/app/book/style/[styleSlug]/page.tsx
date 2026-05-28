import { notFound } from "next/navigation";
import { getStyle } from "@/lib/gallery";
import { getService } from "@/lib/catalog";
import StyleConfigurator from "@/components/book/StyleConfigurator";

export default async function StyleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ styleSlug: string }>;
  searchParams: Promise<{ as?: string }>;
}) {
  const { styleSlug } = await params;
  const { as } = await searchParams;
  const style = getStyle(styleSlug);
  if (!style) notFound();
  const service = getService(style.serviceSlug);
  if (!service) notFound();

  return <StyleConfigurator style={style} service={service} asClient={as} />;
}
