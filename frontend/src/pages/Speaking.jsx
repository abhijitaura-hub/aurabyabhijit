import { Link } from "react-router-dom";
import { ArrowRight, Linkedin, Youtube } from "lucide-react";
import SEO from "../components/SEO";
import { Reveal, SectionHead } from "../components/Motion";
import { SPEAKING_TOPICS, SOCIALS } from "../data/site";

export default function Speaking() {
  return (
    <>
      <SEO
        title="Speaking"
        description="Invite Abhijit Debnath to speak on AI & business, cybersecurity, digital transformation, technology leadership and the future of work."
        path="/speaking"
      />
      <section className="mx-auto max-w-7xl px-5 pb-24 pt-32 md:px-8 md:pt-44" data-testid="speaking-page">
        <SectionHead
          index="S"
          overline="Speaking"
          title="Conversations that matter"
          lede="This is an invitation, not a résumé. If your audience is navigating intelligent technology, these are the conversations Abhijit is built for."
        />
        <div className="mt-14 grid gap-px border border-white/8 bg-white/8 sm:grid-cols-2 lg:grid-cols-4">
          {SPEAKING_TOPICS.map((t, i) => (
            <Reveal key={t} delay={(i % 4) * 0.06} className="group bg-[#0a0a0c] p-7 transition-colors duration-500 hover:bg-surface md:p-9">
              <span className="font-mono-tech text-xs text-zinc-600 transition-colors duration-300 group-hover:text-crimson">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="mt-8 font-display text-lg font-semibold tracking-tight text-white md:text-xl">{t}</h2>
            </Reveal>
          ))}
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <div className="border border-white/8 bg-surface p-8 md:p-10" data-testid="watch-explore">
              <div className="flex items-center gap-3">
                <Youtube className="h-5 w-5 text-crimson" />
                <h2 className="font-display text-xl font-semibold text-white">Watch & Explore</h2>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-zinc-500">
                Long-form explorations of AI, automation and technology leadership — coming to YouTube. The channel
                link will appear here once officially launched.
              </p>
              <a
                href={SOCIALS.youtube}
                data-testid="speaking-youtube-cta"
                className="group mt-6 inline-flex items-center gap-2 border border-white/20 px-5 py-3 text-sm font-medium text-white transition-[border-color,color] duration-300 hover:border-crimson hover:text-crimson"
              >
                Watch on YouTube <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="border border-white/8 bg-surface p-8 md:p-10" data-testid="follow-conversation">
              <div className="flex items-center gap-3">
                <Linkedin className="h-5 w-5 text-crimson" />
                <h2 className="font-display text-xl font-semibold text-white">Follow the Conversation</h2>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-zinc-500">
                Shorter, sharper takes on technology leadership — published as they happen. The LinkedIn profile
                link will appear here once configured.
              </p>
              <a
                href={SOCIALS.linkedin}
                data-testid="speaking-linkedin-cta"
                className="group mt-6 inline-flex items-center gap-2 border border-white/20 px-5 py-3 text-sm font-medium text-white transition-[border-color,color] duration-300 hover:border-crimson hover:text-crimson"
              >
                Follow on LinkedIn <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <div className="mt-16 border border-crimson/30 bg-crimson/[0.04] p-10 text-center md:p-16" data-testid="invite-abhijit">
            <h2 className="font-display text-3xl font-bold tracking-tighter text-white md:text-4xl">
              Have a stage, a panel, or a team that needs this perspective?
            </h2>
            <Link
              to="/contact"
              data-testid="speaking-invite-cta"
              className="group mt-8 inline-flex items-center gap-2 bg-white px-8 py-4 text-sm font-semibold text-black transition-colors duration-300 hover:bg-crimson hover:text-white"
            >
              Invite Abhijit
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
