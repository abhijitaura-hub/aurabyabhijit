import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEO from "../components/SEO";
import Hero from "../components/home/Hero";
import Stats from "../components/home/Stats";
import Dimensions from "../components/home/Dimensions";
import Philosophy from "../components/home/Philosophy";
import Field from "../components/home/Field";
import Framework from "../components/home/Framework";
import Marquee from "../components/Marquee";
import { ArticleCard } from "../components/ArticleCard";
import { Reveal, SectionHead } from "../components/Motion";
import { fetchArticles } from "../lib/api";
import { SPEAKING_TOPICS } from "../data/site";

function PerspectivePreview() {
  const [articles, setArticles] = useState([]);
  useEffect(() => {
    fetchArticles({ limit: 3 }).then((d) => setArticles(d.articles)).catch(() => {});
  }, []);
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32" data-testid="perspective-preview">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHead
          index="05"
          overline="Abhijit's Perspective"
          title="Writing on technology that actually ships"
          lede="AI, automation, cybersecurity, and what it takes to lead technology well — without the buzzwords."
        />
        <Reveal delay={0.2}>
          <Link
            to="/perspective"
            data-testid="perspective-view-all"
            className="group inline-flex items-center gap-2 text-sm font-medium text-cyan-electric"
          >
            All perspectives
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
      <div className="mt-14 grid gap-px border border-white/8 bg-white/8 md:grid-cols-3">
        {articles.map((a, i) => (
          <Reveal key={a.slug} delay={i * 0.08} className="h-full bg-[#0a0a0c]">
            <ArticleCard article={a} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function AboutTeaser() {
  return (
    <section className="border-y border-white/8 bg-surface" data-testid="about-teaser">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:px-8 md:py-32 lg:grid-cols-[1fr_1.3fr]">
        <Reveal>
          <p className="font-mono-tech text-xs font-medium uppercase tracking-[0.28em] text-cyan-electric">
            06 — The Person Behind AURA
          </p>
          <div className="relative mt-8 aspect-square max-w-[280px] overflow-hidden border border-white/10 bg-[#0a0a0c]">
            <img
              src="/assets/portrait.jpg"
              alt="Abhijit Debnath, founder of AURA"
              data-testid="about-teaser-portrait"
              className="h-full w-full object-cover object-top"
              style={{ filter: "contrast(1.05) saturate(0.9)" }}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(10,10,12,0.7), transparent 45%)" }}
            />
          </div>
        </Reveal>
        <div className="flex flex-col justify-center">
          <Reveal delay={0.1}>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-white md:text-5xl">
              Technology leadership isn't about knowing every technology.
            </h2>
          </Reveal>
          <Reveal delay={0.18}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-400 md:text-lg">
              It's about knowing what matters. I'm Abhijit Debnath — two decades across IT infrastructure, cloud,
              cybersecurity, enterprise technology and digital transformation. AURA is my platform for exploring
              what comes next.
            </p>
          </Reveal>
          <Reveal delay={0.26}>
            <Link
              to="/about"
              data-testid="about-teaser-cta"
              className="group mt-8 inline-flex items-center gap-2 text-sm font-medium text-cyan-electric"
            >
              Read the full story
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function SpeakingStrip() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32" data-testid="speaking-strip">
      <SectionHead
        index="07"
        overline="Speaking"
        title="Conversations that matter"
        lede="Keynotes, panels and workshops for teams navigating intelligent technology. This is an open invitation."
      />
      <Reveal delay={0.15}>
        <div className="mt-10 flex flex-wrap gap-2.5">
          {SPEAKING_TOPICS.map((t) => (
            <span
              key={t}
              className="border border-white/12 px-4 py-2 font-mono-tech text-[11px] uppercase tracking-[0.18em] text-zinc-400"
            >
              {t}
            </span>
          ))}
        </div>
      </Reveal>
      <Reveal delay={0.22}>
        <Link
          to="/speaking"
          data-testid="speaking-strip-cta"
          className="group mt-10 inline-flex items-center gap-2 border border-white/20 px-6 py-3.5 text-sm font-medium text-white transition-[border-color,color] duration-300 hover:border-cyan-electric hover:text-cyan-electric"
        >
          Invite Abhijit
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </Reveal>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="relative overflow-hidden border-t border-white/8" data-testid="final-cta">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{ background: "radial-gradient(60% 80% at 50% 120%, rgba(0,240,255,0.18), transparent)" }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-5 py-28 text-center md:px-8 md:py-40">
        <Reveal>
          <p className="font-mono-tech text-xs font-medium uppercase tracking-[0.32em] text-cyan-electric">
            AURA by Abhijit
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-bold tracking-tighter text-white sm:text-5xl md:text-6xl">
            Let's build what's next.
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <Link
            to="/contact"
            data-testid="final-cta-button"
            className="group mt-10 inline-flex items-center gap-2 bg-white px-8 py-4 text-sm font-semibold text-black transition-colors duration-300 hover:bg-cyan-electric"
          >
            Start a Conversation
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <SEO path="/" />
      <Hero />
      <Stats />
      <Marquee />
      <Dimensions />
      <Philosophy />
      <Field />
      <Framework />
      <PerspectivePreview />
      <AboutTeaser />
      <SpeakingStrip />
      <FinalCTA />
    </>
  );
}
