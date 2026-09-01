import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import SEO from "../components/SEO";
import { Reveal, SectionHead } from "../components/Motion";
import { CategoryTile } from "../components/reco/Reco";
import { fetchRecoCategories } from "../lib/api";

export default function Recommendations() {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    fetchRecoCategories().then(setCategories).catch(() => {});
  }, []);

  return (
    <>
      <SEO
        title="Recommendations"
        description="AURA Recommendations — practical tools, technology and resources selected for usefulness, reliability, performance and value by Abhijit Debnath."
        path="/recommendations"
      />
      <section className="relative overflow-hidden px-5 pb-16 pt-32 md:px-8 md:pt-44" data-testid="reco-landing">
        <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <Reveal>
            <p className="font-mono-tech text-xs font-medium uppercase tracking-[0.28em] text-crimson" data-testid="reco-eyebrow">
              AURA Recommendations
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tighter text-white sm:text-5xl md:text-6xl">
              Tools, technology and resources I actually recommend.
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
              Technology moves fast. The right choice doesn't have to be complicated. AURA Recommendations brings
              together practical tools, technology and resources selected for usefulness, reliability, performance
              and value.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#reco-categories"
                data-testid="reco-cta-explore"
                className="group inline-flex items-center gap-2 bg-white px-6 py-3.5 text-sm font-semibold text-black transition-colors duration-300 hover:bg-crimson hover:text-white"
              >
                Explore Recommendations
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a
                href="/recommendations/aura-picks"
                data-testid="reco-cta-picks"
                className="group inline-flex items-center gap-2 border border-crimson/60 px-6 py-3.5 text-sm font-medium text-crimson transition-colors duration-300 hover:bg-crimson hover:text-black"
              >
                AURA Picks
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="reco-categories" className="mx-auto max-w-7xl px-5 pb-24 md:px-8" data-testid="reco-category-grid">
        <SectionHead index="R" overline="Browse" title="Nine shelves, no clutter" />
        <div className="mt-12 grid gap-px border border-white/8 bg-white/8 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => (
            <Reveal key={c.slug} delay={(i % 3) * 0.06} className="h-full bg-[#0a0a0c]">
              <CategoryTile num={String(i + 1).padStart(2, "0")} name={c.name} description={c.description} slug={c.slug} />
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1}>
          <p className="mt-10 text-xs leading-relaxed text-zinc-600">
            Some links may be affiliate links — always disclosed. Read the{" "}
            <a href="/affiliate-disclosure" className="text-zinc-400 underline underline-offset-4 transition-colors hover:text-crimson" data-testid="reco-disclosure-link">
              affiliate disclosure
            </a>
            . Recommendations follow editorial evaluation first; monetization second.
          </p>
        </Reveal>
      </section>
    </>
  );
}
