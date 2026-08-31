import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEO from "../components/SEO";
import { Reveal, SectionHead } from "../components/Motion";
import { ADVISORY_AREAS } from "../data/site";

export default function WorkWithMe() {
  return (
    <>
      <SEO
        title="Work With Me"
        description="Strategic technology advisory with Abhijit Debnath — AI strategy, AI automation, digital transformation, cybersecurity strategy and executive technology advisory."
        path="/work-with-me"
      />
      <section className="mx-auto max-w-7xl px-5 pb-24 pt-32 md:px-8 md:pt-44" data-testid="work-with-me-page">
        <SectionHead
          index="W"
          overline="Work With Me"
          title="Strategic technology advisory"
          lede="Not commodity IT services. Experienced, independent perspective for the decisions that shape what your technology becomes."
        />

        <div className="mt-16 space-y-px border border-white/8 bg-white/8">
          {ADVISORY_AREAS.map((a, i) => (
            <Reveal key={a.title} delay={i * 0.05}>
              <div
                className="group grid gap-4 bg-[#0a0a0c] p-7 transition-colors duration-500 hover:bg-surface md:grid-cols-[80px_1fr_1.4fr] md:items-baseline md:p-10"
                data-testid={`advisory-area-${i}`}
              >
                <span className="font-mono-tech text-sm text-zinc-600 transition-colors duration-300 group-hover:text-crimson">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="font-display text-xl font-semibold tracking-tight text-white md:text-2xl">{a.title}</h2>
                <p className="text-sm leading-relaxed text-zinc-400 md:text-base">{a.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-20 grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          <Reveal>
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-white md:text-3xl">
                How an engagement begins
              </h2>
              <ol className="mt-8 space-y-6">
                {[
                  { t: "A conversation", d: "Thirty minutes, no pitch. We establish whether your problem and my perspective are a fit." },
                  { t: "A clear frame", d: "The problem gets defined precisely — what solving it is worth, and what it costs to leave unsolved." },
                  { t: "A grounded plan", d: "Strategy that survives contact with your real operations, budgets and people." },
                ].map((s, i) => (
                  <li key={s.t} className="flex gap-5" data-testid={`engagement-step-${i}`}>
                    <span className="font-mono-tech text-xs text-crimson">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <p className="font-display text-lg font-semibold text-white">{s.t}</p>
                      <p className="mt-1 text-sm leading-relaxed text-zinc-500">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="flex h-full flex-col justify-center border border-crimson/30 bg-crimson/[0.04] p-10 md:p-12" data-testid="work-cta-panel">
              <p className="font-mono-tech text-[10px] uppercase tracking-[0.28em] text-crimson">No aggressive sales. Ever.</p>
              <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight text-white md:text-3xl">
                The next step is simply a conversation.
              </h2>
              <Link
                to="/contact"
                data-testid="work-cta-start-conversation"
                className="group mt-8 inline-flex w-fit items-center gap-2 bg-white px-8 py-4 text-sm font-semibold text-black transition-colors duration-300 hover:bg-crimson hover:text-white"
              >
                Start a Conversation
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
