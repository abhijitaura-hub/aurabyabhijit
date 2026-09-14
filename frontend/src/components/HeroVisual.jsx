import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { EASE } from "./Motion";
import { useSettings } from "../lib/settings";
import { mediaUrl } from "../lib/api";

// Subtle node-network canvas behind the monogram portrait
function NetworkCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = canvas.getContext("2d");
    let raf, w, h, nodes;
    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      w = canvas.width = rect.width * devicePixelRatio;
      h = canvas.height = rect.height * devicePixelRatio;
      const count = Math.min(46, Math.floor(rect.width / 14));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18 * devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.18 * devicePixelRatio,
        r: (Math.random() * 1.4 + 0.6) * devicePixelRatio,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const link = 130 * devicePixelRatio;
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const d = Math.hypot(dx, dy);
          if (d < link) {
            ctx.strokeStyle = `rgba(255,46,62,${(1 - d / link) * 0.14})`;
            ctx.lineWidth = devicePixelRatio * 0.6;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.fillStyle = "rgba(255,46,62,0.5)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}

// Floating technology-domain chips orbiting the portrait
const DOMAIN_CHIPS = [
  { label: "AI & Intelligence", pos: "left-0 top-[6%] xl:-left-6", dur: 6.5, delay: 0 },
  { label: "Cloud & Infrastructure", pos: "right-0 top-[16%] xl:-right-8", dur: 7.5, delay: 0.8 },
  { label: "Cybersecurity & Governance", pos: "left-0 top-[46%] xl:-left-10", dur: 7, delay: 1.6 },
  { label: "Automation & Operations", pos: "right-0 top-[34%] xl:-right-4", dur: 6, delay: 2.2 },
  { label: "Digital Transformation", pos: "left-[8%] bottom-[4%]", dur: 8, delay: 3 },
];

function DomainChips({ reduced }) {
  return (
    <>
      {DOMAIN_CHIPS.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 10 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: [0, -9, 0] }}
          transition={
            reduced
              ? { duration: 0.8, delay: 1.2 + i * 0.15 }
              : {
                  opacity: { duration: 0.8, delay: 1.2 + i * 0.15 },
                  y: { duration: c.dur, repeat: Infinity, ease: "easeInOut", delay: c.delay },
                }
          }
          className={`absolute z-10 hidden items-center gap-2 border border-white/12 bg-black/60 px-3 py-2 backdrop-blur-md md:flex ${c.pos}`}
          data-testid={`hero-chip-${i}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-crimson" aria-hidden="true" />
          <span className="font-mono-tech text-[9px] uppercase tracking-[0.18em] text-zinc-300">{c.label}</span>
        </motion.div>
      ))}
    </>
  );
}

export default function HeroVisual() {
  const reduced = useReducedMotion();
  const { hero_portrait } = useSettings();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 18 });
  const sy = useSpring(my, { stiffness: 40, damping: 18 });
  const frameX = useTransform(sx, [-1, 1], [-10, 10]);
  const frameY = useTransform(sy, [-1, 1], [-8, 8]);
  const backX = useTransform(sx, [-1, 1], [14, -14]);
  const backY = useTransform(sy, [-1, 1], [10, -10]);

  const onMove = (e) => {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    my.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };

  return (
    <div
      className="relative h-full min-h-[420px] w-full lg:min-h-[560px]"
      onMouseMove={onMove}
      data-testid="hero-visual"
    >
      {/* background network layer */}
      <motion.div
        style={reduced ? {} : { x: backX, y: backY }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, delay: 0.9 }}
        className="absolute inset-[-6%]"
      >
        <div className="blueprint-grid absolute inset-0 opacity-70" />
        <NetworkCanvas />
      </motion.div>

      <DomainChips reduced={reduced} />

      {/* portrait frame — abstract monogram placeholder until photography is supplied */}
      <motion.div
        style={reduced ? {} : { x: frameX, y: frameY }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.55, ease: EASE }}
        className="absolute bottom-0 left-1/2 top-1/2 w-[86%] max-w-[440px] -translate-x-1/2 -translate-y-1/2 md:w-[72%]"
      >
        {/* softly animated red rim-light behind the portrait */}
        <motion.div
          aria-hidden="true"
          animate={reduced ? {} : { opacity: [0.45, 0.8, 0.45], scale: [1, 1.08, 1] }}
          transition={reduced ? {} : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -inset-16 -z-10"
          style={{
            background:
              "radial-gradient(55% 55% at 50% 45%, rgba(255,46,62,0.55), rgba(255,46,62,0.18) 55%, transparent 75%)",
            filter: "blur(32px)",
            opacity: 0.45,
          }}
        />
        {/* static halo ring for constant definition */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-3 -z-10"
          style={{
            background:
              "radial-gradient(closest-side, rgba(255,46,62,0.22), transparent 80%)",
            filter: "blur(10px)",
          }}
        />
        {/* full-bleed cutout portrait — no frame, person stands inside the network scene */}
        <div className="relative">
          <motion.img
            src={hero_portrait ? mediaUrl(hero_portrait) : "/assets/portrait-hero.webp"}
            alt="Abhijit Debnath — technology leader and founder of AURA"
            data-testid="hero-portrait"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, delay: 1, ease: EASE }}
            className="relative mx-auto w-full max-w-[420px]"
            style={{
              filter: "contrast(1.05) saturate(0.95) drop-shadow(0 24px 60px rgba(0,0,0,0.6))",
              WebkitMaskImage: "radial-gradient(115% 88% at 50% 42%, black 62%, transparent 97%)",
              maskImage: "radial-gradient(115% 88% at 50% 42%, black 62%, transparent 97%)",
            }}
          />
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono-tech text-[10px] uppercase tracking-[0.3em] text-zinc-400" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.85)" }}>
            Abhijit Debnath
          </span>
          <span className="absolute right-2 top-6 font-mono-tech text-[10px] uppercase tracking-[0.3em] text-crimson/90" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.85)" }}>
            EST. 20+ YRS
          </span>
        </div>
        <p className="mt-4 text-center font-mono-tech text-[10px] uppercase tracking-[0.25em] text-zinc-600">
          Founder, AURA
        </p>
      </motion.div>
    </div>
  );
}
