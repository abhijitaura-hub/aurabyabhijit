import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEO from "../components/SEO";
import { Reveal, SectionHead } from "../components/Motion";
import { useSettings } from "../lib/settings";
import { mediaUrl } from "../lib/api";
import { TIMELINE as DEFAULT_TIMELINE, PRINCIPLES } from "../data/site";

// Renders **bold** and *italic* markers so the admin-editable bio keeps its emphasis styling
function renderBio(text) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i} className="text-white">{p.slice(2, -2)}</strong>;
    if (p.startsWith("*") && p.endsWith("*")) return <em key={i} className="text-white">{p.slice(1, -1)}</em>;
    return p;
  });
}

export default function About() {
  const { content, about_portrait } = useSettings();
  const TIMELINE = content.timeline;
  const BIO = content.bio_paragraphs;
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
              <div className="relative float-none mb-6 w-full max-w-[300px] sm:float-left sm:mr-8">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-8"
                  style={{ background: "radial-gradient(closest-side, rgba(255,46,62,0.18), transparent 75%)", filter: "blur(18px)" }}
                />
                <img
                  src={about_portrait ? mediaUrl(about_portrait) : "/assets/portrait-cutout.png"}
                  alt="Abhijit Debnath — technology leader with 20+ years of enterprise experience"
                  data-testid="about-portrait"
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
                <span className="absolute bottom-4 left-0 font-mono-tech text-[9px] uppercase tracking-[0.28em] text-zinc-500">
                  Abhijit Debnath
                </span>
              </div>
              <p>{renderBio(BIO[0] || "")}</p>
            </Reveal>
            {BIO.slice(1).map((p, i) => (
              <Reveal key={i} delay={0.08 * (i + 1)}>
                <p>{renderBio(p)}</p>
              </Reveal>
            ))}
            <Reveal delay={0.3}>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  to="/work-with-me"
                  data-testid="about-cta-work-with-me"
                  className="group inline-flex items-center gap-2 bg-white px-6 py-3.5 text-sm font-semibold text-black transition-colors duration-300 hover:bg-crimson hover:text-white"
                >
                  Work With Me <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/perspective"
                  data-testid="about-cta-perspective"
                  className="inline-flex items-center gap-2 border border-white/20 px-6 py-3.5 text-sm font-medium text-white transition-[border-color,color] duration-300 hover:border-crimson hover:text-crimson"
                >
                  Read the Perspective
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <div className="border border-white/8 bg-surface p-8 md:p-10">
              <p className="font-mono-tech text-[10px] uppercase tracking-[0.28em] text-zinc-600">Verified experience</p>
              <ul className="mt-6 space-y-3 text-sm text-zinc-300" data-testid="verified-experience-list">
                {content.verified_experience.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-crimson" aria-hidden="true" />
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
                      i === TIMELINE.length - 1 ? "border-crimson" : "border-zinc-600"
                    }`}
                    aria-hidden="true"
                  />
                  <p className="font-mono-tech text-[10px] uppercase tracking-[0.26em] text-zinc-600">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className={`mt-2 font-display text-xl font-semibold tracking-tight md:text-2xl ${i === TIMELINE.length - 1 ? "text-crimson" : "text-white"}`}>
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
              <span className="font-mono-tech text-xs text-crimson">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-4 font-display text-xl font-medium tracking-tight text-white md:text-2xl">{p}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
