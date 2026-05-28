"use client";

// Interactive modifier picker for a Style. The style's defaultModifiers
// pre-fill every required choice — the no-typing rule means the viewer can
// hit "Continue" immediately without picking anything themselves.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import clsx from "clsx";
import {
  CATEGORY_PALETTES,
  type Style,
} from "@/lib/gallery";
import {
  computePricing,
  formatDuration,
  getService,
  type CatalogService,
  type Modifier,
} from "@/lib/catalog";
import { useStore } from "@/lib/store";

type Props = {
  style: Style;
  service: CatalogService;
  asClient?: string; // ?as= passthrough
};

function ModifierRow({
  modifier,
  selected,
  onSelect,
}: {
  modifier: Modifier;
  selected: string | undefined;
  onSelect: (optionId: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-ink-900">{modifier.label}</h3>
        {modifier.required && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500">required</span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {modifier.options.map((opt) => {
          const active = selected === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={clsx(
                "flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-brand bg-brand text-white"
                  : "border-ink-200 bg-white text-ink-700 hover:border-brand",
              )}
            >
              {modifier.kind === "color" && opt.swatch && (
                <span
                  className="inline-block h-3 w-3 rounded-full ring-1 ring-white"
                  style={{ background: opt.swatch }}
                />
              )}
              <span>{opt.label}</span>
              {opt.deltaPrice ? (
                <span className={clsx("font-mono text-[10px]", active ? "text-white/80" : "text-ink-500")}>
                  +${opt.deltaPrice}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function StyleConfigurator({ style, service, asClient }: Props) {
  const router = useRouter();
  const setCart = useStore((s) => s.setCart);
  const resetCart = useStore((s) => s.resetCart);

  const [choices, setChoices] = useState<Record<string, string>>(
    style.defaultModifiers ?? {},
  );
  const [addOnIds, setAddOnIds] = useState<string[]>(style.defaultAddOns ?? []);

  const palette = CATEGORY_PALETTES[style.categorySlug];

  const { price, durationMin } = useMemo(
    () => computePricing(service.slug, choices, addOnIds),
    [service.slug, choices, addOnIds],
  );

  const requiredMissing = (service.modifiers ?? [])
    .filter((m) => m.required)
    .some((m) => !choices[m.id]);

  const continueToCheckout = () => {
    const lineId = `line-${Date.now()}`;
    resetCart();
    setCart({
      id: `cart-${Date.now()}`,
      clientSlug: asClient,
      lines: [
        {
          id: lineId,
          serviceSlug: service.slug,
          serviceName: service.name,
          basePrice: service.basePrice,
          baseDurationMin: service.baseDurationMin,
          modifierChoices: choices,
          addOnIds,
          styleSlug: style.slug,
          stylistSlug: style.stylistSlug,
          computedPrice: price,
          computedDurationMin: durationMin,
        },
      ],
    });
    const params = new URLSearchParams();
    if (asClient) params.set("as", asClient);
    const qs = params.toString();
    router.push(`/book/checkout${qs ? `?${qs}` : ""}`);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
      {/* Hero card */}
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm">
        <div
          className="relative flex aspect-[16/9] w-full items-center justify-center"
          style={
            style.photoUrl
              ? { backgroundImage: `url(${style.photoUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
              : { background: `linear-gradient(140deg, ${palette[0]} 0%, ${palette[1]} 100%)` }
          }
        >
          {!style.photoUrl && (
            <div className="text-center">
              <div className="font-serif text-4xl font-semibold tracking-wide text-white/95">{style.name}</div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/75">
                {style.categorySlug}
              </div>
            </div>
          )}
        </div>
        <div className="px-5 py-4">
          <h1 className="font-serif text-2xl font-semibold text-brand">{style.name}</h1>
          <p className="mt-0.5 text-sm text-ink-500">{service.name}</p>
          {service.description && (
            <p className="mt-2 text-sm leading-relaxed text-ink-700">{service.description}</p>
          )}
          <div className="mt-3 flex items-center gap-4 border-t border-ink-200 pt-3 font-mono text-xs text-ink-700">
            <span>
              <span className="text-ink-500">from</span>{" "}
              <span className="font-semibold text-brand">${service.basePrice}</span>
            </span>
            <span>·</span>
            <span>{formatDuration(service.baseDurationMin)}</span>
          </div>
        </div>
      </div>

      {/* Modifiers */}
      {service.modifiers && service.modifiers.length > 0 && (
        <section className="mt-6 space-y-5 rounded-2xl border border-ink-200 bg-white p-5">
          <h2 className="text-base font-semibold text-ink-900">Make it yours</h2>
          {service.modifiers.map((m) => (
            <ModifierRow
              key={m.id}
              modifier={m}
              selected={choices[m.id]}
              onSelect={(opt) => setChoices((prev) => ({ ...prev, [m.id]: opt }))}
            />
          ))}
        </section>
      )}

      {/* Add-ons */}
      {service.addOns && service.addOns.length > 0 && (
        <section className="mt-6 space-y-3 rounded-2xl border border-ink-200 bg-white p-5">
          <h2 className="text-base font-semibold text-ink-900">Add-ons</h2>
          <div className="space-y-2">
            {service.addOns.map((a) => {
              const selected = addOnIds.includes(a.id);
              return (
                <label
                  key={a.id}
                  className={clsx(
                    "flex cursor-pointer items-start justify-between gap-3 rounded-md border p-3 text-sm",
                    selected ? "border-brand bg-brand/5" : "border-ink-200 bg-white hover:border-brand",
                  )}
                >
                  <div className="min-w-0">
                    <div className="font-medium text-ink-900">{a.name}</div>
                    {a.description && <div className="mt-0.5 text-xs text-ink-500">{a.description}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-brand">+${a.price}</span>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(e) =>
                        setAddOnIds((prev) =>
                          e.target.checked ? [...prev, a.id] : prev.filter((x) => x !== a.id),
                        )
                      }
                      className="h-4 w-4 accent-brand"
                    />
                  </div>
                </label>
              );
            })}
          </div>
        </section>
      )}

      {/* Sticky price + CTA */}
      <div className="sticky bottom-0 mt-6 -mx-4 border-t border-ink-200 bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">Your look</div>
            <div className="text-xl font-semibold text-brand">${price}</div>
            <div className="font-mono text-[10px] text-ink-500">{formatDuration(durationMin)}</div>
          </div>
          <button
            type="button"
            disabled={requiredMissing}
            onClick={continueToCheckout}
            className="flex items-center gap-1.5 rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue to checkout
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        {requiredMissing && (
          <p className="mt-2 text-right font-mono text-[10px] text-ink-500">
            Pick a length / parting / color first
          </p>
        )}
      </div>
    </div>
  );
}
