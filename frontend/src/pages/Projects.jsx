import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEO from "../components/SEO";
import { Reveal, SectionHead } from "../components/Motion";

const STRUCTURE = [
  { key: "Challenge", q: "What was happening?" },
  { key: "Context", q: "Why did it matter?" },
  { key: "Approach", q: "How was the problem considered?" },
  { key: "Technology", q: "What technology domains were involved?" },
  { key: "Outcome", q: "What changed?" },
  { key: "Lesson", q: "What did the experience teach?" },
];

export default function Projects() {
  return (
    <>
      <SEO
        title="Projects"
        description="Case studies from real enterprise technology work — structured around challenge, context, approach, technology, outcome and lesson. Coming soon."
        path="/projects"
      />
      <section className="mx-auto max-w-7xl px-5 pb-24 pt-32 md:px-8 md:pt-44" data-testid="projects-page">
        <SectionHead
          index="J"
          overline="Projects & Case Studies"
          title="Work, documented honestly"
          lede="Real engagements are being prepared for publication — anonymised where confidentiality requires, and never embellished. Nothing here is invented to fill space."
        />
        <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <Reveal>
            <div className="border border-dashed border-white/15 p-10 md:p-14" data-testid="projects-placeholder">
              <p className="font-mono-tech text-[10px] uppercase tracking-[0.28em] text-crimson">Coming soon</p>
              <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight text-white md:text-3xl">
                Case studies in preparation
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-zinc-500 md:text-base">
                AURA publishes only what can be told truthfully. The first studies are being written with the same
                discipline as the work itself.
              </p>
              <Link
                to="/perspective"
                data-testid="projects-cta-perspective"
                className="group mt-8 inline-flex items-center gap-2 text-sm font-medium text-crimson"
              >
                Read the Perspective in the meantime
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="border border-white/8 bg-surface p-8 md:p-10">
              <p className="font-mono-tech text-[10px] uppercase tracking-[0.28em] text-zinc-600">
                The case-study structure
              </p>
              <ol className="mt-6 space-y-5">
                {STRUCTURE.map((s, i) => (
                  <li key={s.key} className="flex items-baseline gap-4" data-testid={`case-structure-${i}`}>
                    <span className="font-mono-tech text-xs text-crimson">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <p className="font-display text-base font-semibold text-white">{s.key}</p>
                      <p className="text-sm text-zinc-500">{s.q}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
