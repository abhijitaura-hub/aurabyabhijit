import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Reveal } from "../Motion";
import { CategoryTile } from "../reco/Reco";

const FEATURED = [
  { num: "01", name: "AI Tools", description: "AI assistants, research, automation, coding, creative AI", slug: "ai-tools" },
  { num: "02", name: "Creator Gear", description: "Cameras, microphones, lighting, monitors, accessories", slug: "creator-gear" },
  { num: "03", name: "Cybersecurity", description: "Security, privacy, backup, identity tools", slug: "cybersecurity" },
  { num: "04", name: "Computers", description: "Laptops, desktops, workstations, computing hardware", slug: "computers" },
];

export default function RecommendationsPreview() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-24" data-testid="reco-preview">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <Reveal>
            <p className="font-mono-tech text-xs font-medium uppercase tracking-[0.28em] text-crimson">
              AURA Recommendations
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
              Tools, technology and resources I actually recommend.
            </h2>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="mt-4 text-sm leading-relaxed text-zinc-500 md:text-base">
              Practical picks selected for usefulness, reliability, performance and value.
            </p>
          </Reveal>
        </div>
        <Reveal delay={0.2}>
          <Link
            to="/recommendations"
            data-testid="reco-preview-cta"
            className="group inline-flex items-center gap-2 bg-white px-6 py-3.5 text-sm font-semibold text-black transition-colors duration-300 hover:bg-crimson hover:text-white"
          >
            Explore All Recommendations
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
      <div className="mt-10 grid gap-px border border-white/8 bg-white/8 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURED.map((c, i) => (
          <Reveal key={c.slug} delay={i * 0.06} className="h-full bg-[#0a0a0c]">
            <CategoryTile {...c} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
