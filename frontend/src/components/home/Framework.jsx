import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { SectionHead } from "../Motion";
import { DECISION_STEPS } from "../../data/site";

export default function Framework() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.75", "end 0.6"] });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={ref} className="border-y border-white/8 bg-surface" data-testid="framework-section">
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
        <SectionHead
          index="04"
          overline="The AURA Decision Framework"
          title="How I think about technology"
          lede="A six-stage lens applied to every decision, regardless of the technology involved."
        />

        <div className="relative mt-16 md:mt-20">
          <div className="absolute bottom-0 left-[7px] top-0 w-px bg-white/10 md:left-1/2" aria-hidden="true" />
          <motion.div
            style={reduced ? {} : { scaleY: lineScale }}
            className="absolute bottom-0 left-[7px] top-0 w-px origin-top bg-cyan-electric md:left-1/2"
            aria-hidden="true"
          />
          <ol className="space-y-10 md:space-y-0">
            {DECISION_STEPS.map((s, i) => (
              <li key={s.num} className={`relative md:grid md:grid-cols-2 md:gap-16 ${i > 0 ? "md:-mt-6 md:pt-16" : ""}`}>
                <motion.div
                  initial={reduced ? false : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className={`ml-8 border border-white/8 bg-[#0a0a0c] p-6 md:ml-0 md:p-8 ${
                    i % 2 === 0 ? "md:col-start-1 md:mr-10" : "md:col-start-2 md:ml-10"
                  }`}
                  data-testid={`framework-step-${s.num}`}
                >
                  <span
                    className="absolute left-0 top-9 h-[15px] w-[15px] rounded-full border-2 border-cyan-electric bg-[#0a0a0c] md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2"
                    aria-hidden="true"
                  />
                  <p className="font-mono-tech text-xs text-cyan-electric">{s.num}</p>
                  <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-white md:text-3xl">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400 md:text-base">{s.question}</p>
                </motion.div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
