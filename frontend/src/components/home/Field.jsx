import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal, SectionHead, EASE } from "../Motion";
import { useSettings } from "../../lib/settings";

const STAGES = ["problem", "thinking", "approach", "outcome"];
const STAGE_LABEL = { problem: "Problem", thinking: "Thinking", approach: "Approach", outcome: "Outcome" };

export default function Field() {
  const { content } = useSettings();
  const FIELD_NOTES = content.field_notes;
  const [active, setActive] = useState(0);
  const note = FIELD_NOTES[Math.min(active, FIELD_NOTES.length - 1)];

  return (
    <section className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32" data-testid="field-section">
      <SectionHead
        index="03"
        overline="From the Field"
        title="Technology lessons shaped by real-world enterprise challenges"
        lede="No invented case studies. These are the recurring patterns two decades of enterprise technology leave behind."
      />

      <div className="mt-14 grid gap-10 lg:grid-cols-[280px_1fr] lg:gap-16">
        <div className="flex snap-x gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0" role="tablist" aria-label="Field notes">
          {FIELD_NOTES.map((n, i) => (
            <button
              key={n.title}
              role="tab"
              aria-selected={active === i}
              onClick={() => setActive(i)}
              data-testid={`field-tab-${i}`}
              className={`min-w-[220px] snap-start border-l-2 px-5 py-4 text-left transition-[border-color,background-color] duration-300 lg:min-w-0 ${
                active === i
                  ? "border-crimson bg-surface"
                  : "border-white/10 hover:border-white/30"
              }`}
            >
              <span className="font-mono-tech text-[10px] uppercase tracking-[0.24em] text-zinc-500">{n.tag}</span>
              <span className={`mt-1 block font-display text-base font-medium md:text-lg ${active === i ? "text-white" : "text-zinc-400"}`}>
                {n.title}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="border border-white/8 bg-surface p-7 md:p-12"
            data-testid="field-panel"
          >
            <div className="grid gap-8 md:grid-cols-2 md:gap-10">
              {STAGES.map((s, i) => (
                <div key={s}>
                  <p className="flex items-center gap-3 font-mono-tech text-[10px] uppercase tracking-[0.26em] text-crimson">
                    <span className="text-zinc-600">{String(i + 1).padStart(2, "0")}</span> {STAGE_LABEL[s]}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-300 md:text-base">{note[s]}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
