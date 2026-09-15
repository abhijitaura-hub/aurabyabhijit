import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEO from "../components/SEO";
import Hero from "../components/home/Hero";
import RecommendationsPreview from "../components/home/RecommendationsPreview";
import Stats from "../components/home/Stats";
import Dimensions from "../components/home/Dimensions";
import Philosophy from "../components/home/Philosophy";
import Field from "../components/home/Field";
import Framework from "../components/home/Framework";
import Marquee from "../components/Marquee";
import { ArticleCard } from "../components/ArticleCard";
import { Reveal, SectionHead } from "../components/Motion";
import { fetchArticles, mediaUrl, trackGaEvent } from "../lib/api";
import { useSettings } from "../lib/settings";

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
            className="group inline-flex items-center gap-2 text-sm font-medium text-crimson"
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
  const { about_portrait } = useSettings();
  return (
    <section className="border-y border-white/8 bg-surface" data-testid="about-teaser">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:px-8 md:py-32 lg:grid-cols-[1fr_1.3fr]">
        <Reveal>
          <p className="font-mono-tech text-xs font-medium uppercase tracking-[0.28em] text-crimson">
            06 — The Person Behind AURA
          </p>
          <div className="relative mt-8 max-w-[280px]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-8"
              style={{ background: "radial-gradient(closest-side, rgba(255,46,62,0.16), transparent 75%)", filter: "blur(18px)" }}
            />
            <img
              src={about_portrait ? mediaUrl(about_portrait) : "/assets/portrait-cutout.png"}
              alt="Abhijit Debnath, founder of AURA"
              data-testid="about-teaser-portrait"
              className="relative w-full"
              style={{
                filter: "contrast(1.05) saturate(0.95) drop-shadow(0 18px 44px rgba(0,0,0,0.55))",
                WebkitMaskImage: about_portrait
                  ? "radial-gradient(115% 88% at 50% 42%, black 62%, transparent 97%)"
                  : "linear-gradient(to bottom, black 88%, transparent 99%)",
                maskImage: about_portrait
                  ? "radial-gradient(115% 88% at 50% 42%, black 62%, transparent 97%)"
                  : "linear-gradient(to bottom, black 88%, transparent 99%)",
              }}
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
              className="group mt-8 inline-flex items-center gap-2 text-sm font-medium text-crimson"
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

function WhyIBuiltAura() {
  const { content } = useSettings();
  return (
    <section className="border-t border-white/8" data-testid="why-i-built-aura">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        <SectionHead overline="A Personal Note" title={content.why_aura_title} />
        <Reveal delay={0.16}>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
            {content.why_aura_p1}
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
            {content.why_aura_p2}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function AskAura() {
  const { content } = useSettings();
  return (
    <section className="relative overflow-hidden border-t border-white/8" data-testid="ask-aura-section">
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{ background: "radial-gradient(50% 90% at 15% 100%, rgba(255,46,62,0.15), transparent)" }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        <SectionHead
          overline="AURA AI"
          title={content.ask_aura_title}
          lede={content.ask_aura_support}
        />
        <Reveal delay={0.16}>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-zinc-500 md:text-lg" data-testid="ask-aura-invite">
            {content.ask_aura_text}
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("aura:open-chat"))}
            data-testid="ask-aura-button"
            className="group mt-10 inline-flex items-center gap-2 bg-white px-8 py-4 text-sm font-semibold text-black transition-colors duration-300 hover:bg-crimson hover:text-white"
          >
            {content.ask_aura_button}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </Reveal>
      </div>
    </section>
  );
}

function WhatIShare() {
  const { content } = useSettings();
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20" data-testid="what-i-share">
      <SectionHead overline="Areas of Experience" title="What I Share" />
      <div className="mt-14 grid gap-px border border-white/8 bg-white/8 md:grid-cols-2 lg:grid-cols-3">
        {content.share_items.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.06} className="h-full bg-[#0a0a0c]">
            <div
              className="flex h-full flex-col p-8"
              data-testid={`share-item-${item.title.toLowerCase().replace(/\W+/g, "-")}`}
            >
              <h3 className="font-display text-xl font-semibold tracking-tight text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">{item.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function SpeakingStrip() {
  const { content } = useSettings();
  const SPEAKING_TOPICS = content.speaking_topics;
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
          className="group mt-10 inline-flex items-center gap-2 border border-white/20 px-6 py-3.5 text-sm font-medium text-white transition-[border-color,color] duration-300 hover:border-crimson hover:text-crimson"
        >
          Invite Abhijit
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </Reveal>
    </section>
  );
}

function FinalCTA() {
  const { booking_url } = useSettings();
  return (
    <section className="relative overflow-hidden border-t border-white/8" data-testid="final-cta">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{ background: "radial-gradient(60% 80% at 50% 120%, rgba(255,46,62,0.18), transparent)" }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-5 py-28 text-center md:px-8 md:py-40">
        <Reveal>
          <p className="font-mono-tech text-xs font-medium uppercase tracking-[0.32em] text-crimson">
            AURA by Abhijit
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-bold tracking-tighter text-white sm:text-5xl md:text-6xl">
            Let's build what's next.
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/contact"
              data-testid="final-cta-button"
              className="group inline-flex items-center gap-2 bg-white px-8 py-4 text-sm font-semibold text-black transition-colors duration-300 hover:bg-crimson hover:text-white"
            >
              Start a Conversation
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            {booking_url && (
              <a
                href={booking_url}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="final-cta-book-call"
                onClick={() => trackGaEvent("booking_click", { location: "final_cta" })}
                className="inline-flex items-center gap-2 border border-white/25 px-8 py-4 text-sm font-medium text-white transition-[border-color,color] duration-300 hover:border-crimson hover:text-crimson"
              >
                Book a Call
              </a>
            )}
          </div>
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
      <WhyIBuiltAura />
      <AskAura />
      <WhatIShare />
      <RecommendationsPreview />
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
