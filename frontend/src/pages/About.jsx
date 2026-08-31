import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEO from "../components/SEO";
import { Reveal, SectionHead } from "../components/Motion";
import { TIMELINE, PRINCIPLES, SITE } from "../data/site";

export default function About() {
  return (
    <>
      <SEO
        title="About"
        description="The person behind AURA — Abhijit Debnath, a technology leader with 20+ years across IT infrastructure, cloud, cybersecurity and digital transformation."
        path="/about"
      />
      <section className="mx-auto max-w-7xl px-5 pb-24 pt-32 md:px-8 md:pt-44" data-testid="about-page">
        <SectionHead
          index="A"
          overline="About"
          title="The person behind AURA"
        />
        <div className="mt-14 grid gap-14 lg:grid-cols-[1.25fr_1fr] lg:gap-20">
          <div className="space-y-6 text-base leading-relaxed text-zinc-300 md:text-lg">
            <Reveal>
              <p>
                I'm <strong className="text-white">Abhijit Debnath</strong>, a technology leader with more than two
                decades of experience across IT infrastructure, cloud, cybersecurity, enterprise technology and
                digital transformation — including enabling technology operations across 65+ distributed business
                locations.
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <p>
                My journey has gradually shifted from solving individual technology problems to understanding the
                larger question: <em className="text-white">how can technology create meaningful business outcomes?</em>
              </p>
            </Reveal>
            <Reveal delay={0.16}>
              <p>
                I've learned that technology leadership isn't about knowing every technology.{" "}
                <strong className="text-white">It's about knowing what matters.</strong>
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <p>
                AURA is my platform for exploring that intersection of technology, intelligence and leadership — and
                sharing practical perspectives on what comes next.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  to="/work-with-me"
                  data-testid="about-cta-work-with-me"
                  className="group inline-flex items-center gap-2 bg-white px-6 py-3.5 text-sm font-semibold text-black transition-colors duration-300 hover:bg-cyan-electric"
                >
                  Work With Me <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/perspective"
                  data-testid="about-cta-perspective"
                  className="inline-flex items-center gap-2 border border-white/20 px-6 py-3.5 text-sm font-medium text-white transition-[border-color,color] duration-300 hover:border-cyan-electric hover:text-cyan-electric"
                >
                  Read the Perspective
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <div className="border border-white/8 bg-surface p-8 md:p-10">
              <p className="font-mono-tech text-[10px] uppercase tracking-[0.28em] text-zinc-600">Verified experience</p>
              <ul className="mt-6 space-y-3 text-sm text-zinc-300">
                {[
                  "20+ years in IT",
                  "10+ years of technology leadership",
                  "65+ distributed business locations enabled",
                  "Enterprise IT · Cloud & Azure · Cybersecurity",
                  "Digital transformation · IT governance",
                  "Automation · AI · Technology strategy",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-electric" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-white/8 bg-surface" data-testid="career-timeline">
        <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
          <SectionHead
            index="B"
            overline="Career Journey"
            title="An evolution, not a résumé"
            lede="Each phase built on the last — from making systems work to deciding which systems matter."
          />
          <ol className="mt-16 space-y-0 border-l border-white/10">
            {TIMELINE.map((t, i) => (
              <Reveal key={t.era} delay={0.04 * i}>
                <li className="relative pb-12 pl-8 md:pl-12" data-testid={`timeline-item-${i}`}>
                  <span
                    className={`absolute -left-[7px] top-1.5 h-[13px] w-[13px] rounded-full border-2 bg-[#0a0a0c] ${
                      i === TIMELINE.length - 1 ? "border-cyan-electric" : "border-zinc-600"
                    }`}
                    aria-hidden="true"
                  />
                  <p className="font-mono-tech text-[10px] uppercase tracking-[0.26em] text-zinc-600">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className={`mt-2 font-display text-xl font-semibold tracking-tight md:text-2xl ${i === TIMELINE.length - 1 ? "text-cyan-electric" : "text-white"}`}>
                    {t.era}
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">{t.note}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32" data-testid="principles-section">
        <SectionHead
          index="C"
          overline="Behind the Technology"
          title="The principles that outlast the tools"
          lede="Technology changes constantly. The principles behind good technology leadership change much more slowly."
        />
        <div className="mt-14 grid gap-px border border-white/8 bg-white/8 sm:grid-cols-2 lg:grid-cols-3">
          {PRINCIPLES.map((p, i) => (
            <Reveal key={p} delay={(i % 3) * 0.07} className="bg-[#0a0a0c] p-8 md:p-10">
              <span className="font-mono-tech text-xs text-cyan-electric">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-4 font-display text-xl font-medium tracking-tight text-white md:text-2xl">{p}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
