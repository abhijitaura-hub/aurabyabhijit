import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEO from "../components/SEO";
import { Reveal, SectionHead } from "../components/Motion";
import { useSettings } from "../lib/settings";
import { DECISION_STEPS } from "../data/site";

export default function Expertise() {
  const { content } = useSettings();
  const DIMENSIONS = content.dimensions;
  const ADVISORY_AREAS = content.advisory_areas;
  return (
    <>
      <SEO
        title="Expertise"
        description="Six dimensions of modern technology leadership — AI, digital transformation, cybersecurity, cloud & infrastructure, automation, and technology leadership."
        path="/expertise"
      />
      <section className="mx-auto max-w-7xl px-5 pb-24 pt-32 md:px-8 md:pt-44" data-testid="expertise-page">
        <SectionHead
          index="E"
          overline="Expertise"
          title="Six dimensions of modern technology leadership"
          lede="A framework built from two decades of enterprise technology — the same lens applied to every problem, every industry."
        />
        <div className="mt-16 space-y-px border border-white/8 bg-white/8">
          {DIMENSIONS.map((d, i) => (
            <Reveal key={d.slug} delay={i * 0.05}>
              <article
                id={d.slug}
                className="group grid scroll-mt-28 gap-6 bg-[#0a0a0c] p-7 transition-colors duration-500 hover:bg-surface md:grid-cols-[100px_1fr_1.2fr] md:p-12"
                data-testid={`expertise-block-${d.slug}`}
              >
                <span className="font-mono-tech text-sm text-zinc-600 transition-colors duration-300 group-hover:text-crimson">
                  {d.num || String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="font-display text-2xl font-semibold tracking-tight text-white md:text-3xl">{d.title}</h2>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-400 md:text-base">{d.desc}</p>
                </div>
                <ul className="flex flex-wrap content-start gap-2 md:justify-end">
                  {d.topics.map((t) => (
                    <li
                      key={t}
                      className="border border-white/10 px-3.5 py-1.5 font-mono-tech text-[10px] uppercase tracking-[0.16em] text-zinc-400"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-white/8 bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
          <SectionHead
            index="F"
            overline="The AURA Decision Framework"
            title="How I think about technology"
            lede="Six questions, in order, before any technology decision."
          />
          <div className="mt-14 grid gap-px border border-white/8 bg-white/8 sm:grid-cols-2 lg:grid-cols-3">
            {DECISION_STEPS.map((s, i) => (
              <Reveal key={s.num} delay={(i % 3) * 0.07} className="bg-[#0a0a0c] p-8">
                <span className="font-mono-tech text-xs text-crimson">{s.num}</span>
                <h3 className="mt-4 font-display text-xl font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{s.question}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
        <SectionHead
          index="G"
          overline="Strategic Technology Advisory"
          title="Where this expertise becomes your advantage"
        />
        <div className="mt-14 grid gap-px border border-white/8 bg-white/8 sm:grid-cols-2 lg:grid-cols-3">
          {ADVISORY_AREAS.map((a, i) => (
            <Reveal key={a.title} delay={(i % 3) * 0.07} className="bg-[#0a0a0c] p-8">
              <h3 className="font-display text-lg font-semibold text-white">{a.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-500">{a.desc}</p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <Link
            to="/work-with-me"
            data-testid="expertise-cta-work-with-me"
            className="group mt-12 inline-flex items-center gap-2 bg-white px-6 py-3.5 text-sm font-semibold text-black transition-colors duration-300 hover:bg-crimson hover:text-white"
          >
            Start a Conversation
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </section>
    </>
  );
}
