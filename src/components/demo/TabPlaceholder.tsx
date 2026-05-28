// Inner-content placeholder for a stubbed mobile tab. Renders inside a
// layout that already provides the surface chrome (top bar + tab bar).

import { Construction } from "lucide-react";

type Props = {
  title: string;
  phase: string;
  hint: string;
  children?: React.ReactNode;
};

export default function TabPlaceholder({ title, phase, hint, children }: Props) {
  return (
    <div className="px-5 py-6">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-paper-mute px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-700">
        <Construction className="h-3 w-3" />
        {phase}
      </div>
      <h1 className="mt-3 font-serif text-2xl font-semibold text-brand">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-700">{hint}</p>
      {children}
    </div>
  );
}
