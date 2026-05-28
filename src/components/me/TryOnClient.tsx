"use client";

// Mock "See it on you" experience. Three states:
//   upload    — pick a selfie OR use the persona's default avatar
//   processing — animated "Jolieden AI is rendering your look" beat
//   result    — side-by-side: your selfie + the style + composite preview
// No real ML — the composite is the style photo with the selfie inlaid in a
// small bubble. Sells the flow without pretending to be a face-mesh model.

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  Sparkles,
  ImagePlus,
  RefreshCcw,
  ArrowRight,
  Heart,
} from "lucide-react";
import clsx from "clsx";
import { CATEGORY_PALETTES, type Style } from "@/lib/gallery";

type Mode = "upload" | "processing" | "result";

type Props = {
  clientSlug: string;
  clientFirstName: string;
  clientLastName: string;
  avatarHue?: number;
  style: Style;
};

function GradientAvatar({
  firstName,
  lastName,
  hue,
  size = 120,
}: {
  firstName: string;
  lastName: string;
  hue?: number;
  size?: number;
}) {
  const h = hue ?? 320;
  const init = (firstName[0] + lastName[0]).toUpperCase();
  return (
    <div
      className="flex items-center justify-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size / 3,
        background: `linear-gradient(135deg, hsl(${h}, 55%, 38%), hsl(${(h + 30) % 360}, 60%, 50%))`,
      }}
    >
      {init}
    </div>
  );
}

export default function TryOnClient({
  clientSlug,
  clientFirstName,
  clientLastName,
  avatarHue,
  style,
}: Props) {
  const [mode, setMode] = useState<Mode>("upload");
  const [selfie, setSelfie] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [paletteStart, paletteEnd] = CATEGORY_PALETTES[style.categorySlug];

  const startProcessing = () => {
    setMode("processing");
    window.setTimeout(() => setMode("result"), 2400);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSelfie(typeof reader.result === "string" ? reader.result : null);
    };
    reader.readAsDataURL(file);
  };

  const useDefaultAvatar = () => {
    setSelfie(null);
    startProcessing();
  };

  const reset = () => {
    setMode("upload");
    setSelfie(null);
  };

  return (
    <div className="space-y-5 px-4 py-5">
      {/* Header */}
      <header className="flex items-center gap-2">
        <Link
          href={`/book/style/${style.slug}?as=${clientSlug}`}
          className="-ml-1 flex items-center gap-0.5 text-brand"
          aria-label="Back to style"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-wider text-brand">
            ✨ See it on you
          </div>
          <h1 className="truncate font-serif text-[24px] font-semibold leading-tight text-ink-900">
            {style.name}
          </h1>
        </div>
      </header>

      {mode === "upload" && (
        <>
          {/* Style preview */}
          <section className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
            <div
              className="aspect-[16/9] w-full"
              style={
                style.photoUrl
                  ? { backgroundImage: `url(${style.photoUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                  : { background: `linear-gradient(140deg, ${paletteStart}, ${paletteEnd})` }
              }
            />
            <div className="px-4 py-3">
              <div className="text-sm font-semibold text-ink-900">Target look</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
                {style.categorySlug}
              </div>
            </div>
          </section>

          {/* Upload card */}
          <section className="space-y-3 rounded-2xl border border-ink-200 bg-white p-5">
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-brand">
              <Sparkles className="h-3 w-3" /> Step 1 · Add your photo
            </div>
            <p className="text-sm text-ink-700">
              Pick a recent selfie — front-facing, hair pulled back works best. We don&apos;t store
              your photo after the preview generates.
            </p>

            {selfie ? (
              <div className="flex items-center gap-3 rounded-xl border border-ink-200 bg-paper p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selfie}
                  alt="Your selfie"
                  className="h-16 w-16 rounded-md object-cover"
                />
                <div className="min-w-0 flex-1 text-xs">
                  <div className="font-medium text-ink-900">Selfie ready</div>
                  <div className="text-ink-500">Looks good — tap to swap if you want.</div>
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-full border border-ink-200 px-2.5 py-1 text-xs hover:border-brand"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex w-full flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed border-ink-300 bg-paper p-6 text-ink-500 hover:border-brand"
              >
                <Camera className="h-7 w-7" />
                <span className="text-sm font-medium">Tap to upload a selfie</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
                  Or take a new one
                </span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={onFile}
              className="hidden"
            />

            <div className="flex items-center gap-2 text-[11px] text-ink-500">
              <div className="flex-1 border-t border-ink-200" />
              <span className="font-mono uppercase tracking-wider">or</span>
              <div className="flex-1 border-t border-ink-200" />
            </div>

            <button
              type="button"
              onClick={useDefaultAvatar}
              className="flex w-full items-center justify-center gap-1.5 rounded-md border border-ink-200 bg-white py-2.5 text-sm font-medium text-ink-700 hover:border-brand"
            >
              <ImagePlus className="h-3.5 w-3.5" />
              Use my profile photo
            </button>

            {selfie && (
              <button
                type="button"
                onClick={startProcessing}
                className="flex w-full items-center justify-center gap-1.5 rounded-md bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-700"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Generate preview
              </button>
            )}
          </section>

          <p className="text-center font-mono text-[10px] text-ink-500">
            💡 Powered by Jolieden AI · preview only, final look may vary
          </p>
        </>
      )}

      {mode === "processing" && (
        <section className="flex flex-col items-center gap-5 rounded-2xl border border-ink-200 bg-white p-10 text-center">
          {/* Spinning sparkle */}
          <div className="relative h-20 w-20">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "conic-gradient(from 0deg, transparent, #431926)",
                animation: "spin 1.4s linear infinite",
                maskImage: "radial-gradient(circle, transparent 55%, black 56%)",
                WebkitMaskImage: "radial-gradient(circle, transparent 55%, black 56%)",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-brand" />
            </div>
          </div>
          <div>
            <div className="font-serif text-lg font-semibold text-ink-900">
              Generating your preview…
            </div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-ink-500">
              Mapping {style.name.toLowerCase()} to your face shape
            </div>
          </div>
          <ul className="space-y-1.5 text-left text-xs text-ink-700">
            <li className="flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-status-confirmed" />
              Detecting your hairline + face shape
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-status-confirmed" />
              Rendering {style.name} in your skin tone
            </li>
            <li className="flex items-center gap-2 opacity-50">
              <Sparkles className="h-3 w-3 text-ink-400" />
              Adjusting color + length for the preview
            </li>
          </ul>
          <style jsx>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </section>
      )}

      {mode === "result" && (
        <>
          {/* Composite — style photo with selfie tucked into corner */}
          <section className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm">
            <div
              className="relative aspect-[4/5] w-full"
              style={
                style.photoUrl
                  ? { backgroundImage: `url(${style.photoUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                  : { background: `linear-gradient(140deg, ${paletteStart}, ${paletteEnd})` }
              }
            >
              {/* Selfie chip in top-right */}
              <div className="absolute right-3 top-3 flex flex-col items-center gap-1">
                <div className="rounded-md border-2 border-white shadow-lg">
                  {selfie ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selfie}
                      alt="You"
                      className="h-16 w-16 rounded-sm object-cover"
                    />
                  ) : (
                    <GradientAvatar
                      firstName={clientFirstName}
                      lastName={clientLastName}
                      hue={avatarHue}
                      size={64}
                    />
                  )}
                </div>
                <span className="rounded-full bg-black/60 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white">
                  You
                </span>
              </div>
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-white">
                <Sparkles className="h-3 w-3" /> Jolieden AI preview
              </div>
            </div>
            <div className="space-y-1 px-4 py-3">
              <div className="text-sm font-semibold text-ink-900">
                {clientFirstName} in {style.name}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
                {style.categorySlug} · preview only
              </div>
            </div>
          </section>

          {/* Side-by-side reference */}
          <section className="rounded-2xl border border-ink-200 bg-white p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
              Side-by-side
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="text-center">
                <div className="aspect-square w-full overflow-hidden rounded-md">
                  {selfie ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selfie}
                      alt="You today"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-paper">
                      <GradientAvatar
                        firstName={clientFirstName}
                        lastName={clientLastName}
                        hue={avatarHue}
                        size={70}
                      />
                    </div>
                  )}
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-ink-500">
                  You today
                </div>
              </div>
              <div className="text-center">
                <div
                  className="aspect-square w-full overflow-hidden rounded-md"
                  style={
                    style.photoUrl
                      ? { backgroundImage: `url(${style.photoUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                      : { background: `linear-gradient(140deg, ${paletteStart}, ${paletteEnd})` }
                  }
                />
                <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-ink-500">
                  Target style
                </div>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Link
              href={`/book/style/${style.slug}?as=${clientSlug}`}
              className="flex items-center justify-center gap-1.5 rounded-md bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Book this look
              <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={reset}
                className="flex items-center justify-center gap-1.5 rounded-md border border-ink-200 bg-white py-2.5 text-sm font-medium text-ink-700 hover:border-brand"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Try another
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-1.5 rounded-md border border-ink-200 bg-white py-2.5 text-sm font-medium text-ink-700 hover:border-brand"
              >
                <Heart className="h-3.5 w-3.5" />
                Save look
              </button>
            </div>
          </div>

          <p className="text-center font-mono text-[10px] text-ink-500">
            💡 Final result depends on your stylist&apos;s consultation
          </p>
        </>
      )}
    </div>
  );
}
