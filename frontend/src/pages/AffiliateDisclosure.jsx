import { useEffect, useState } from "react";
import SEO from "../components/SEO";
import { SectionHead, Reveal } from "../components/Motion";
import { fetchSettings } from "../lib/api";

const DEFAULT_DISCLOSURE =
  "Some links on AURA Recommendations may be affiliate links. If you purchase through one of these links, AURA BY ABHIJIT may earn a commission at no additional cost to you. Recommendations are based on editorial evaluation and are not determined solely by commission.";

export default function AffiliateDisclosure() {
  const [text, setText] = useState(DEFAULT_DISCLOSURE);
  useEffect(() => {
    fetchSettings().then((s) => s?.disclosure_text && setText(s.disclosure_text)).catch(() => {});
  }, []);

  return (
    <>
      <SEO
        title="Affiliate Disclosure"
        description="How affiliate links work on AURA Recommendations — transparent, editorial-first."
        path="/affiliate-disclosure"
      />
      <section className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:pt-44" data-testid="affiliate-disclosure">
        <SectionHead index="D" overline="Transparency" title="Affiliate Disclosure" />
        <div className="mt-12 space-y-8">
          <Reveal>
            <p className="border-l-2 border-crimson py-2 pl-6 text-base leading-relaxed text-zinc-300 md:text-lg" data-testid="disclosure-text">
              {text}
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="font-display text-xl font-semibold text-white">How recommendations are made</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400 md:text-base">
              Every recommendation on AURA is selected for usefulness, reliability, performance and value. Editorial
              evaluation always comes first — a product earns an AURA badge on merit, not on commission. Where an
              affiliate link exists, it is disclosed on the recommendation itself.
            </p>
          </Reveal>
          <Reveal delay={0.14}>
            <h2 className="font-display text-xl font-semibold text-white">What it means for you</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400 md:text-base">
              Using an affiliate link never changes the price you pay. It simply supports the time that goes into
              evaluating technology honestly. If you'd rather not use one, every recommendation also lists a plain
              product link where available.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
