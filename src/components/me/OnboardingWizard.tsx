"use client";

// First-launch onboarding wizard for the /me client app. Renders inside the
// iPhone-framed shell so it reads as a real app. State is local to the
// component — production hooks would persist verification + profile via
// the Supabase Auth + clients table updates described in ARCHITECTURE
// §3.2.1 and §6.

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Cake,
  Camera,
  Heart,
  Sparkles,
  Bell,
  Check,
  Loader2,
  MessageCircle,
  Image as ImageIcon,
} from "lucide-react";
import clsx from "clsx";

type Step =
  | "welcome"
  | "carousel"
  | "phone"
  | "verify"
  | "identity"
  | "profile"
  | "notifications"
  | "success";

type Props = {
  clientSlug: string;
  // Default values used to pre-fill the wizard inputs (honoring the no-typing
  // prototype rule). The wizard never *reveals* the name before the identity
  // step — pre-auth screens use generic copy.
  defaultFirstName: string;
  defaultLastName: string;
  defaultPhone: string;
  defaultBirthdayMonth?: number; // 1..12
  defaultBirthdayDay?: number; // 1..31
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const CAROUSEL_SLIDES = [
  {
    icon: ImageIcon,
    title: "Book by photo, not dropdowns",
    body:
      "Browse finished styles. Tap one you love. We pre-fill length, color, parting — done in 30 seconds.",
    accent: "from-brand-50 via-paper to-paper",
  },
  {
    icon: Heart,
    title: "Your hair journey, your way",
    body:
      "Every visit your stylist captures before + after. Build a private timeline you can return to anytime.",
    accent: "from-gold-soft via-paper to-brand-50",
  },
  {
    icon: MessageCircle,
    title: "Text us anything, any time",
    body:
      "Our AI Concierge answers in seconds — booking changes, prep questions, lost items. Diéssou jumps in if it gets tricky.",
    accent: "from-paper via-brand-50 to-paper-mute",
  },
];

const TEXTURES = ["3A", "3B", "3C", "4A", "4B", "4C", "Type 2", "Mix"] as const;

export default function OnboardingWizard({
  clientSlug,
  defaultFirstName,
  defaultLastName,
  defaultPhone,
  defaultBirthdayMonth,
  defaultBirthdayDay,
}: Props) {
  const router = useRouter();

  // Step + per-step state
  const [step, setStep] = useState<Step>("welcome");
  const [slide, setSlide] = useState(0);
  const [phone, setPhone] = useState(defaultPhone);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  // Identity — captured AFTER phone verification. Pre-filled so the
  // viewer can advance with one tap (no-typing prototype rule), but the
  // pre-auth welcome + carousel screens never reveal the name.
  const [firstName, setFirstName] = useState(defaultFirstName);
  const [lastName, setLastName] = useState(defaultLastName);
  const [birthdayMonth, setBirthdayMonth] = useState<number>(
    defaultBirthdayMonth ?? 1,
  );
  const [birthdayDay, setBirthdayDay] = useState<number>(
    defaultBirthdayDay ?? 1,
  );
  const [texture, setTexture] = useState<string>("4B");
  const [scalp, setScalp] = useState("None");
  const [allergies, setAllergies] = useState("None on file");
  const [notifChoice, setNotifChoice] = useState<"allow" | "not_now" | null>(
    null,
  );
  const verifyRefs = useRef<(HTMLInputElement | null)[]>([]);

  const skip = () => router.push(`/me/${clientSlug}`);
  const finish = () => router.push(`/me/${clientSlug}`);

  // ─────────────────────────── Step renderers ───────────────────────────

  // Welcome — logo splash with a single "Get started" CTA.
  if (step === "welcome") {
    return (
      <div className="flex h-full flex-col items-center justify-between bg-gradient-to-b from-paper via-brand-50 to-paper px-6 pb-8 pt-16">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="relative h-12 w-56">
            <Image
              src="/logo-black.png"
              alt="Jolieden"
              fill
              priority
              sizes="224px"
              className="object-contain"
            />
          </div>
          <p className="mt-10 max-w-xs text-base leading-relaxed text-ink-700">
            Welcome to the tribe.
            <br />
            Let&apos;s get you set up in under a minute.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2">
          <button
            type="button"
            onClick={() => setStep("carousel")}
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={skip}
            className="text-center font-mono text-[10px] uppercase tracking-wider text-ink-500 hover:text-brand"
          >
            Skip the tour
          </button>
        </div>
      </div>
    );
  }

  // Feature carousel — 3 swipeable cards with progress dots.
  if (step === "carousel") {
    const s = CAROUSEL_SLIDES[slide];
    const Icon = s.icon;
    const last = slide === CAROUSEL_SLIDES.length - 1;
    return (
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between px-4 pt-4">
          <button
            type="button"
            onClick={() => (slide === 0 ? setStep("welcome") : setSlide((p) => p - 1))}
            aria-label="Back"
            className="-ml-1 flex items-center gap-0.5 text-brand"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-1">
            {CAROUSEL_SLIDES.map((_, i) => (
              <span
                key={i}
                className={clsx(
                  "h-1.5 rounded-full transition-all",
                  i === slide ? "w-6 bg-brand" : "w-1.5 bg-ink-200",
                )}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={skip}
            className="font-mono text-[10px] uppercase tracking-wider text-ink-500 hover:text-brand"
          >
            Skip
          </button>
        </header>
        <div className={clsx("flex flex-1 flex-col items-center justify-center px-8 text-center bg-gradient-to-b", s.accent)}>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md">
            <Icon className="h-9 w-9 text-brand" strokeWidth={1.8} />
          </div>
          <h2 className="mt-8 font-serif text-2xl font-semibold leading-tight text-ink-900">
            {s.title}
          </h2>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-700">
            {s.body}
          </p>
        </div>
        <div className="px-4 pb-8 pt-4">
          <button
            type="button"
            onClick={() =>
              last ? setStep("phone") : setSlide((p) => p + 1)
            }
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {last ? "Continue" : "Next"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Phone entry
  if (step === "phone") {
    return (
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between px-4 pt-4">
          <button
            type="button"
            onClick={() => setStep("carousel")}
            aria-label="Back"
            className="-ml-1 flex items-center gap-0.5 text-brand"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Step 1 of 4
          </span>
          <button
            type="button"
            onClick={skip}
            className="font-mono text-[10px] uppercase tracking-wider text-ink-500 hover:text-brand"
          >
            Skip
          </button>
        </header>
        <div className="flex flex-1 flex-col px-5 pt-10">
          <h2 className="font-serif text-2xl font-semibold text-ink-900">
            What&apos;s your phone?
          </h2>
          <p className="mt-1 text-sm text-ink-700">
            We&apos;ll text a 6-digit code to verify. Your number is your login —
            no password.
          </p>
          <div className="mt-8">
            <label className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
              Mobile number
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              placeholder="(929) 555-0388"
              className="mt-2 w-full rounded-md border border-ink-300 bg-white px-3 py-3 text-lg font-medium tracking-wider text-ink-900 focus:border-brand focus:outline-none"
            />
            <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-ink-500">
              📱 SMS rates may apply
            </p>
          </div>
        </div>
        <div className="px-4 pb-8 pt-4">
          <button
            type="button"
            onClick={() => setStep("verify")}
            disabled={phone.replace(/\D/g, "").length < 7}
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            Send code
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Verification — 6 digit code, auto-advances per digit
  if (step === "verify") {
    const submit = () => {
      setVerifying(true);
      window.setTimeout(() => {
        setVerifying(false);
        setStep("identity");
      }, 900);
    };
    const onDigit = (i: number, v: string) => {
      const digit = v.replace(/\D/g, "").slice(-1);
      const next = [...code];
      next[i] = digit;
      setCode(next);
      if (digit && i < 5) verifyRefs.current[i + 1]?.focus();
      if (next.every((d) => d !== "")) {
        window.setTimeout(submit, 250);
      }
    };

    const autofill = () => {
      const filled = ["3", "9", "1", "8", "5", "7"];
      setCode(filled);
      window.setTimeout(submit, 250);
    };

    return (
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between px-4 pt-4">
          <button
            type="button"
            onClick={() => setStep("phone")}
            aria-label="Back"
            className="-ml-1 flex items-center gap-0.5 text-brand"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Step 1 of 4
          </span>
          <span />
        </header>
        <div className="flex flex-1 flex-col px-5 pt-10">
          <h2 className="font-serif text-2xl font-semibold text-ink-900">
            Enter the code
          </h2>
          <p className="mt-1 text-sm text-ink-700">
            We texted a 6-digit code to {phone}.
          </p>
          <div className="mt-8 flex gap-2">
            {code.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  verifyRefs.current[i] = el;
                }}
                value={d}
                onChange={(e) => onDigit(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !d && i > 0)
                    verifyRefs.current[i - 1]?.focus();
                }}
                disabled={verifying}
                maxLength={1}
                inputMode="numeric"
                className="h-14 w-full rounded-md border border-ink-300 bg-white text-center text-2xl font-semibold focus:border-brand focus:outline-none disabled:bg-ink-50"
              />
            ))}
          </div>
          <button
            type="button"
            onClick={autofill}
            disabled={verifying}
            className="mt-6 text-center font-mono text-[10px] uppercase tracking-wider text-brand hover:underline"
          >
            Demo · auto-fill the code
          </button>
          {verifying && (
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-ink-700">
              <Loader2 className="h-4 w-4 animate-spin text-brand" />
              Verifying…
            </div>
          )}
        </div>
        <div className="px-4 pb-8 pt-4">
          <button
            type="button"
            onClick={() => setStep("phone")}
            className="block w-full text-center font-mono text-[10px] uppercase tracking-wider text-ink-500 hover:text-brand"
          >
            Wrong number? Edit it
          </button>
        </div>
      </div>
    );
  }

  // Identity — collect the basics now that the phone is verified. This is
  // where the app actually learns who the user is; nothing before this step
  // ever surfaces firstName on screen.
  if (step === "identity") {
    const daysInMonth = new Date(2000, birthdayMonth, 0).getDate();
    const dayOptions = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    return (
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between px-4 pt-4">
          <button
            type="button"
            onClick={() => setStep("verify")}
            aria-label="Back"
            className="-ml-1 flex items-center gap-0.5 text-brand"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Step 2 of 4
          </span>
          <span />
        </header>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pt-8 pb-6">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-ink-900">
              Who&apos;s booking?
            </h2>
            <p className="mt-1 text-sm text-ink-700">
              We&apos;ll greet you by name when you check in and surprise you
              on your birthday week.
            </p>
          </div>

          <section className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
                First name
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Imani"
                className="mt-1 w-full rounded-md border border-ink-300 bg-white px-3 py-2.5 text-sm focus:border-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
                Last name
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Webb"
                className="mt-1 w-full rounded-md border border-ink-300 bg-white px-3 py-2.5 text-sm focus:border-brand focus:outline-none"
              />
            </div>
          </section>

          <section>
            <label className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
              <Cake className="mr-0.5 inline h-3 w-3" /> Birthday
            </label>
            <p className="mt-0.5 text-[11px] text-ink-500">
              Birthday week unlocks a comp Wash &amp; Blow + bonus points.
            </p>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <select
                value={birthdayMonth}
                onChange={(e) => setBirthdayMonth(parseInt(e.target.value, 10))}
                className="w-full rounded-md border border-ink-300 bg-white px-3 py-2.5 text-sm focus:border-brand focus:outline-none"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={birthdayDay}
                onChange={(e) => setBirthdayDay(parseInt(e.target.value, 10))}
                className="w-full rounded-md border border-ink-300 bg-white px-3 py-2.5 text-sm focus:border-brand focus:outline-none"
              >
                {dayOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-ink-500">
              📅 Year stays private — only month + day are stored
            </p>
          </section>
        </div>
        <div className="border-t border-ink-200 bg-white px-4 py-3">
          <button
            type="button"
            onClick={() => setStep("profile")}
            disabled={!firstName.trim() || !lastName.trim()}
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Profile collection
  if (step === "profile") {
    return (
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between px-4 pt-4">
          <button
            type="button"
            onClick={() => setStep("identity")}
            aria-label="Back"
            className="-ml-1 flex items-center gap-0.5 text-brand"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Step 3 of 4
          </span>
          <button
            type="button"
            onClick={() => setStep("notifications")}
            className="font-mono text-[10px] uppercase tracking-wider text-ink-500 hover:text-brand"
          >
            Skip
          </button>
        </header>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pt-8 pb-6">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-ink-900">
              Tell us about your hair
            </h2>
            <p className="mt-1 text-sm text-ink-700">
              Helps your stylist prep before you arrive. You can edit anytime in
              Profile.
            </p>
          </div>

          <section>
            <label className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
              Hair texture
            </label>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {TEXTURES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTexture(t)}
                  className={clsx(
                    "rounded-md border py-2 text-xs font-medium",
                    texture === t
                      ? "border-brand bg-brand text-white"
                      : "border-ink-200 bg-white text-ink-700",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
              Scalp accommodations
            </label>
            <textarea
              rows={2}
              value={scalp}
              onChange={(e) => setScalp(e.target.value)}
              placeholder="Sensitivities, tension preference, recent treatments…"
              className="mt-1 w-full resize-none rounded-md border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </section>

          <section>
            <label className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
              Allergies
            </label>
            <textarea
              rows={2}
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="Products, fragrances, latex…"
              className="mt-1 w-full resize-none rounded-md border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </section>

          <section className="rounded-xl border border-ink-200 bg-paper p-3">
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-brand">
              <Camera className="h-3 w-3" /> Optional · reference photo
            </div>
            <button
              type="button"
              className="mt-2 flex w-full flex-col items-center gap-1 rounded-lg border-2 border-dashed border-ink-300 bg-white py-4 text-ink-500 hover:border-brand"
            >
              <Camera className="h-5 w-5" />
              <span className="text-xs font-medium">Add a look you love</span>
            </button>
          </section>
        </div>
        <div className="border-t border-ink-200 bg-white px-4 py-3">
          <button
            type="button"
            onClick={() => setStep("notifications")}
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Notifications permission
  if (step === "notifications") {
    const choose = (c: "allow" | "not_now") => {
      setNotifChoice(c);
      window.setTimeout(() => setStep("success"), 500);
    };
    return (
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between px-4 pt-4">
          <button
            type="button"
            onClick={() => setStep("profile")}
            aria-label="Back"
            className="-ml-1 flex items-center gap-0.5 text-brand"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Step 4 of 4
          </span>
          <span />
        </header>
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand/10">
            <Bell className="h-9 w-9 text-brand" strokeWidth={1.8} />
          </div>
          <h2 className="mt-8 font-serif text-2xl font-semibold text-ink-900">
            Turn on notifications?
          </h2>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-700">
            We&apos;ll let you know when:
          </p>
          <ul className="mt-3 space-y-1.5 text-left text-sm text-ink-700">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 inline-block h-1 w-1 rounded-full bg-brand" />
              Your stylist is ready
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 inline-block h-1 w-1 rounded-full bg-brand" />
              Reminder 24h before your visit
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 inline-block h-1 w-1 rounded-full bg-brand" />
              Birthday week surprises 🎂
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 inline-block h-1 w-1 rounded-full bg-brand" />
              Care tips after each visit
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-2 px-4 pb-8 pt-4">
          <button
            type="button"
            onClick={() => choose("allow")}
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            disabled={!!notifChoice}
          >
            {notifChoice === "allow" ? (
              <>
                <Check className="h-4 w-4" /> Allowed
              </>
            ) : (
              "Allow notifications"
            )}
          </button>
          <button
            type="button"
            onClick={() => choose("not_now")}
            disabled={!!notifChoice}
            className="text-center font-mono text-[10px] uppercase tracking-wider text-ink-500 hover:text-brand disabled:opacity-50"
          >
            Not now
          </button>
        </div>
      </div>
    );
  }

  // Success
  return (
    <div className="flex h-full flex-col items-center justify-center bg-gradient-to-b from-paper via-gold-soft to-paper px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-status-confirmed/15">
        <Sparkles className="h-9 w-9 text-status-confirmed" />
      </div>
      <h2 className="mt-8 font-serif text-3xl font-semibold text-brand">
        You&apos;re all set, {firstName}
      </h2>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-700">
        Welcome to Jolieden. Let&apos;s find your first look.
      </p>
      <button
        type="button"
        onClick={finish}
        className="mt-10 flex items-center gap-1.5 rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Browse the gallery
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
