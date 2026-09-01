import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Reveal, SectionHead } from "../Motion";
import { useSettings } from "../../lib/settings";

export default function Dimensions() {
  const { content } = useSettings();
  const DIMENSIONS = content.dimensions;
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32" data-testid="dimensions-section">
      <SectionHead
        index="01"
        overline="The AURA Technology Framework"
        title="Six dimensions of modern technology leadership"
        lede="Every engagement draws on the same underlying framework — a way of thinking about technology that holds across industries and problems."
      />
      <div className="mt-14 grid gap-px border border-white/8 bg-white/8 sm:grid-cols-2 lg:grid-cols-3">
        {DIMENSIONS.map((d, i) => (
          <Reveal key={d.slug} delay={(i % 3) * 0.08} className="h-full">
            <Link
              to={`/expertise#${d.slug}`}
              data-testid={`dimension-card-${d.slug}`}
              className="group flex h-full flex-col bg-[#0a0a0c] p-7 transition-colors duration-500 hover:bg-surface focus-visible:bg-surface md:p-9"
            >
              <div className="flex items-start justify-between">
                <span className="font-mono-tech text-xs text-zinc-600 transition-colors duration-300 group-hover:text-crimson">
                  {d.num || String(i + 1).padStart(2, "0")}
                </span>
                <ArrowUpRight className="h-4 w-4 text-zinc-700 transition-[color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-crimson" />
              </div>
              <h3 className="mt-10 font-display text-xl font-semibold tracking-tight text-white md:text-2xl">
                {d.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-500">{d.desc}</p>
              <p className="mt-6 font-mono-tech text-[10px] uppercase leading-loose tracking-[0.16em] text-zinc-600">
                {d.topics.join("  ·  ")}
              </p>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
