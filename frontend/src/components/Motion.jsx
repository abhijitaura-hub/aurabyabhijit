import { motion, useReducedMotion } from "framer-motion";

export const EASE = [0.16, 1, 0.3, 1];

export function Reveal({ children, delay = 0, y = 28, className = "", as = "div" }) {
  const reduced = useReducedMotion();
  const Tag = motion[as] || motion.div;
  return (
    <Tag
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}

// Signature masked line-by-line reveal (hero on-load)
export function MaskedLines({ lines, className = "", lineClassName = "", delay = 0, stagger = 0.14 }) {
  const reduced = useReducedMotion();
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span className="mask-line" key={i}>
          <motion.span
            className={`block ${lineClassName}`}
            initial={reduced ? false : { y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1.05, delay: delay + i * stagger, ease: EASE }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function Overline({ children, className = "" }) {
  return (
    <p className={`font-mono-tech text-xs font-medium uppercase tracking-[0.28em] text-crimson ${className}`}>
      {children}
    </p>
  );
}

export function SectionHead({ index, overline, title, lede, className = "" }) {
  return (
    <div className={`max-w-3xl ${className}`}>
      <Reveal>
        <div className="flex items-center gap-4">
          {index && <span className="font-mono-tech text-xs text-zinc-600">{index}</span>}
          <Overline>{overline}</Overline>
          <span className="h-px flex-1 bg-white/10" aria-hidden="true" />
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="mt-6 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-[1.12] text-white">
          {title}
        </h2>
      </Reveal>
      {lede && (
        <Reveal delay={0.16}>
          <p className="mt-5 text-base md:text-lg leading-relaxed text-zinc-400">{lede}</p>
        </Reveal>
      )}
    </div>
  );
}
