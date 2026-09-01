import { Reveal } from "../Motion";
import { useSettings } from "../../lib/settings";

export default function Stats() {
  const { content } = useSettings();
  return (
    <section className="border-y border-white/8 bg-surface" data-testid="credibility-strip" aria-label="Credibility">
      <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
        {content.stats.map((s, i) => (
          <Reveal
            key={s.testId || `stat-${i}`}
            delay={i * 0.08}
            className={`px-6 py-10 md:px-10 md:py-14 ${i > 0 ? "border-l border-white/8" : ""} ${
              i >= 2 ? "border-t border-white/8 lg:border-t-0" : ""
            } ${i === 2 ? "border-l-0 lg:border-l" : ""}`}
          >
            <p className="font-display text-4xl font-semibold tracking-tight text-white md:text-5xl" data-testid={s.testId || `stat-${i}`}>
              {s.value}
            </p>
            <p className="mt-3 max-w-[200px] text-xs leading-relaxed text-zinc-500 md:text-sm">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
