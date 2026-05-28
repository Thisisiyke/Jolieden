"use client";

// Auth-only "sign-in" flow for the /me client app. P32 collapsed this from a
// 10-screen first-launch wizard into a 4-screen auth gate to honor the
// browse-first pattern (Booksy / Fresha / StyleSeat / Mayvenn / Sephora /
// Ulta). The cold-start user now lands on /me/[clientSlug] and browses the
// gallery without auth; this flow only fires when they tap Confirm on a
// booking — or when a demo reviewer hits /onboarding/[clientSlug] directly
// to see the auth path. Production hooks would persist verification via
// Supabase Auth (see docs/ARCHITECTURE.md §3.2.1).
//
// Birthday + hair texture + scalp + allergies are NOT collected here. They
// surface as just-in-time nudges: birthday as a dismissible /me home card,
// hair texture as a filter chip on /book gallery, scalp/allergies as the
// booking-cart "notes for your stylist" step. Same for the iOS notification
// permission — fired post-booking-confirm when the user has actual reason
// to grant it.

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Loader2, Mail, Sparkles } from "lucide-react";

type Step =
  | "welcome"
  | "phone"
  | "verify"
  | "identity"
  | "success";

type Props = {
  clientSlug: string;
  // Default values used to pre-fill the wizard inputs (honoring the no-typing
  // prototype rule). The wizard never *reveals* the name on welcome/phone/
  // verify — those pre-auth screens use generic copy. Name + email are
  // collected in the identity step right after SMS verification.
  defaultFirstName: string;
  defaultLastName: string;
  defaultEmail: string;
  defaultPhone: string;
};

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

export default function OnboardingWizard({
  clientSlug,
  defaultFirstName,
  defaultLastName,
  defaultEmail,
  defaultPhone,
}: Props) {
  const router = useRouter();

  const [step, setStep] = useState<Step>("welcome");
  const [phone, setPhone] = useState(defaultPhone);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  // Identity — collected AFTER SMS verification. Phone proves device
  // possession; email is the recovery + verification rail (production
  // sends a verification link on submit, but doesn't block app usage).
  const [firstName, setFirstName] = useState(defaultFirstName);
  const [lastName, setLastName] = useState(defaultLastName);
  const [email, setEmail] = useState(defaultEmail);
  const verifyRefs = useRef<(HTMLInputElement | null)[]>([]);

  const finish = () => router.push(`/me/${clientSlug}`);

  // ─────────────────────────── Welcome ───────────────────────────

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
            Sign in with your number.
            <br />
            One text, no password.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2">
          <button
            type="button"
            onClick={() => setStep("phone")}
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={finish}
            className="text-center font-mono text-[10px] uppercase tracking-wider text-ink-500 hover:text-brand"
          >
            Keep browsing as guest
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────── Phone ───────────────────────────

  if (step === "phone") {
    return (
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between px-4 pt-4">
          <button
            type="button"
            onClick={() => setStep("welcome")}
            aria-label="Back"
            className="-ml-1 flex items-center gap-0.5 text-brand"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span />
          <span />
        </header>
        <div className="flex flex-1 flex-col px-5 pt-10">
          <h2 className="font-serif text-2xl font-semibold text-ink-900">
            What&apos;s your phone?
          </h2>
          <p className="mt-1 text-sm text-ink-700">
            We&apos;ll text a 6-digit code. Your number is your login — no
            password, no email.
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

  // ─────────────────────────── Verify ───────────────────────────

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
          <span />
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

  // ─────────────────────────── Identity ───────────────────────────
  //
  // Phone is verified at this point — the device proves possession of the
  // number. Now we collect the human identity (first + last name, email)
  // needed to actually create the account, deliver perks, and recover
  // access if the phone changes. Email gets a verification link on submit
  // (production sends it via the auth provider; the prototype shows it on
  // the success screen). We don't block app usage on email verification —
  // we prompt for it later.

  if (step === "identity") {
    const emailOk = isValidEmail(email);
    const canContinue =
      firstName.trim().length > 0 && lastName.trim().length > 0 && emailOk;

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
          <span />
          <span />
        </header>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pt-8 pb-6">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-ink-900">
              Almost there
            </h2>
            <p className="mt-1 text-sm text-ink-700">
              Tell us who you are. We&apos;ll send a verification link to your
              email — opening it confirms your account.
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
                autoComplete="given-name"
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
                autoComplete="family-name"
                className="mt-1 w-full rounded-md border border-ink-300 bg-white px-3 py-2.5 text-sm focus:border-brand focus:outline-none"
              />
            </div>
          </section>

          <section>
            <label className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
              <Mail className="mr-0.5 inline h-3 w-3" /> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
              className="mt-1 w-full rounded-md border border-ink-300 bg-white px-3 py-2.5 text-sm focus:border-brand focus:outline-none"
            />
            {!emailOk && email.length > 0 && (
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-status-pending">
                Check the format — needs an @ and a domain.
              </p>
            )}
            <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-ink-500">
              📩 Recovery if your phone changes · receipts · birthday cards
            </p>
          </section>
        </div>
        <div className="border-t border-ink-200 bg-white px-4 py-3">
          <button
            type="button"
            onClick={() => setStep("success")}
            disabled={!canContinue}
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            Create my account
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────── Success ───────────────────────────

  return (
    <div className="flex h-full flex-col items-center justify-center bg-gradient-to-b from-paper via-gold-soft to-paper px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-status-confirmed/15">
        <Sparkles className="h-9 w-9 text-status-confirmed" />
      </div>
      <h2 className="mt-8 font-serif text-3xl font-semibold text-brand">
        You&apos;re in, {firstName}
      </h2>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-700">
        Birthday, hair details, and notifications happen in the app — only when
        you want.
      </p>
      <div className="mt-6 flex w-full max-w-xs items-start gap-2 rounded-xl border border-ink-200 bg-white/70 p-3 text-left">
        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
        <div className="min-w-0 text-[12px] leading-relaxed text-ink-700">
          We just emailed{" "}
          <span className="font-medium text-ink-900">{email}</span> — open
          the link any time to verify your account.
        </div>
      </div>
      <button
        type="button"
        onClick={finish}
        className="mt-8 flex items-center gap-1.5 rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Browse the gallery
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
