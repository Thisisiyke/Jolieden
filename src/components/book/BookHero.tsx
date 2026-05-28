// Hero band that sits under the sticky header. Establishes the brand the way
// the Boulevard widget's banner does — but rebuilt with Jolieden's tokens
// (cream paper bg, burgundy wordmark, soft gold underline).

export default function BookHero() {
  return (
    <section className="border-b border-ink-200 bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-6 py-10 text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-500">
          NYC
        </div>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-[0.08em] text-brand sm:text-5xl">
          JOLIEDEN
        </h1>
        <span className="mt-2 inline-block h-px w-16 bg-gold" />
        <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-700">
          Book a finished look — not a list of options. Tap a style to start; we&apos;ll fill in
          length, parting, color, and your stylist.
        </p>
      </div>
    </section>
  );
}
