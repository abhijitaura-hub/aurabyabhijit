import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { MaskedLines, EASE } from "../Motion";
import HeroVisual from "../HeroVisual";
import { useSettings } from "../../lib/settings";

const LOOP_WORDS = ["AI", "Automation", "Security", "Cloud"];

function TaglineLoop() {
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setI((v) => (v + 1) % LOOP_WORDS.length), 2600);
    return () => clearInterval(t);
  }, [reduced]);
  return (
    <span className="relative inline-flex min-w-[4.2em] text-crimson" data-testid="hero-tagline-loop">
      <AnimatePresence mode="wait">
        <motion.span
          key={LOOP_WORDS[i]}
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? {} : { opacity: 0, y: -10 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="inline-block"
        >
          {LOOP_WORDS[i]}.
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function Hero() {
  const { content } = useSettings();
  return (
    <section className="relative overflow-hidden pt-28 md:pt-36" data-testid="hero-section">
      <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 opacity-25"
        style={{ background: "radial-gradient(closest-side, rgba(255,46,62,0.16), transparent)" }}
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 pb-16 md:px-8 md:pb-24 lg:grid-cols-[1.15fr_1fr] lg:gap-6">
        <div className="flex flex-col justify-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="font-mono-tech text-xs font-medium uppercase tracking-[0.32em] text-crimson"
            data-testid="hero-overline"
          >
            AURA by Abhijit — Technology, built from experience
          </motion.p>

          <h1 className="mt-7 font-display text-[2.6rem] font-bold leading-[1.04] tracking-tighter text-white sm:text-6xl lg:text-7xl" data-testid="hero-heading">
            <MaskedLines
              lines={[
                content.hero_title_1,
                <>for an <span className="text-crimson">{content.hero_title_2}</span></>,
              ]}
              delay={0.3}
            />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.85, ease: EASE }}
            className="mt-7 max-w-xl text-base leading-relaxed text-zinc-400 md:text-lg"
            data-testid="hero-subcopy"
          >
            <TaglineLoop /> {content.hero_subcopy}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.05, ease: EASE }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("aura:open-chat"))}
              data-testid="hero-cta-ask-aura"
              className="group inline-flex items-center gap-2 bg-white px-6 py-3.5 text-sm font-semibold text-black transition-colors duration-300 hover:bg-crimson hover:text-white"
            >
              Ask AURA
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <Link
              to="/work-with-me"
              data-testid="hero-cta-work-with-me"
              className="group inline-flex items-center gap-2 border border-white/20 px-6 py-3.5 text-sm font-medium text-white transition-[border-color,color] duration-300 hover:border-crimson hover:text-crimson"
            >
              Work With Me
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.3 }}
            className="mt-10 flex items-center gap-3 font-mono-tech text-[11px] uppercase tracking-[0.24em] text-zinc-500"
            data-testid="hero-credibility"
          >
            <span className="h-px w-8 bg-crimson/70" aria-hidden="true" />
            {content.credibility}
          </motion.p>
        </div>

        <HeroVisual />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        className="relative mx-auto hidden max-w-7xl px-8 pb-10 md:block"
        aria-hidden="true"
      >
        <div className="h-10 w-px bg-gradient-to-b from-crimson/70 to-transparent" />
      </motion.div>

      {/* vertical philosophy accent — right edge */}
      <motion.aside
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 1.6 }}
        className="pointer-events-none absolute right-5 top-1/2 hidden -translate-y-1/2 select-none xl:block"
        style={{ writingMode: "vertical-rl" }}
        aria-hidden="true"
        data-testid="hero-philosophy-echo"
      >
        <span className="font-mono-tech text-[10px] uppercase tracking-[0.34em] text-zinc-600">
          Technology is not the destination.{" "}
          <span className="text-crimson/90">Business transformation is.</span>
        </span>
      </motion.aside>
    </section>
  );
}
