import { ArrowRight } from "lucide-react";
import { Reveal, MaskedLines } from "../Motion";
import { PHILOSOPHY_PAIRS } from "../../data/site";

export default function Philosophy() {
  return (
    <section className="border-y border-white/8 bg-surface" data-testid="philosophy-section">
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-36">
        <Reveal>
          <p className="font-mono-tech text-xs font-medium uppercase tracking-[0.28em] text-cyan-electric">
            02 — Signature Philosophy
          </p>
        </Reveal>
        <h2 className="mt-8 max-w-5xl font-display text-4xl font-bold leading-[1.06] tracking-tighter text-white sm:text-5xl md:text-6xl lg:text-7xl">
          <MaskedLines
            lines={["Technology is not the destination.", "Business transformation is."]}
            delay={0.1}
            stagger={0.18}
          />
        </h2>

        <div className="mt-16 grid gap-px border border-white/8 bg-white/8 md:mt-20 md:grid-cols-2">
          {PHILOSOPHY_PAIRS.map((p, i) => (
            <Reveal key={p.left} delay={i * 0.07} className="h-full">
              <div
                className="flex h-full items-center justify-between gap-4 bg-[#0a0a0c] px-6 py-7 md:px-10 md:py-9"
                data-testid={`philosophy-pair-${i}`}
              >
                <span className="text-base font-medium text-zinc-300 md:text-lg">{p.left}</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-cyan-electric" aria-hidden="true" />
                <span className="font-display text-base font-semibold text-white md:text-lg">{p.right}</span>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mt-14 max-w-2xl font-display text-xl font-medium leading-snug text-zinc-300 md:mt-16 md:text-2xl">
            The real advantage comes from <span className="text-cyan-electric">connecting them</span>.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
