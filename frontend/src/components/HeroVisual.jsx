import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { EASE } from "./Motion";

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

export default function HeroVisual() {
  const reduced = useReducedMotion();
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

      {/* portrait frame — abstract monogram placeholder until photography is supplied */}
      <motion.div
        style={reduced ? {} : { x: frameX, y: frameY }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.55, ease: EASE }}
        className="absolute left-1/2 top-1/2 w-[72%] max-w-[380px] -translate-x-1/2 -translate-y-1/2"
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
        <div className="relative border border-white/12 bg-surface">
          {/* corner ticks */}
          <span className="absolute -left-px -top-px h-5 w-5 border-l border-t border-crimson" />
          <span className="absolute -right-px -top-px h-5 w-5 border-r border-t border-crimson" />
          <span className="absolute -bottom-px -left-px h-5 w-5 border-b border-l border-crimson" />
          <span className="absolute -bottom-px -right-px h-5 w-5 border-b border-r border-crimson" />
          <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden">
            <img
              src="/assets/portrait.jpg"
              alt="Abhijit Debnath — technology leader and founder of AURA"
              data-testid="hero-portrait"
              className="absolute inset-0 h-full w-full object-cover object-top"
              style={{ filter: "contrast(1.05) saturate(0.9)" }}
            />
            {/* background treatment: edge vignette + brand-tinted grade, identity untouched */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(10,10,12,0.85), transparent 40%), linear-gradient(to bottom, rgba(10,10,12,0.45), transparent 30%), radial-gradient(90% 60% at 50% 40%, transparent 60%, rgba(10,10,12,0.5))",
              }}
            />
            <span className="absolute bottom-4 left-4 font-mono-tech text-[10px] uppercase tracking-[0.3em] text-zinc-300">
              Abhijit Debnath
            </span>
            <span className="absolute right-4 top-4 font-mono-tech text-[10px] uppercase tracking-[0.3em] text-crimson/90">
              EST. 20+ YRS
            </span>
          </div>
        </div>
        <p className="mt-4 text-center font-mono-tech text-[10px] uppercase tracking-[0.25em] text-zinc-600">
          Founder, AURA
        </p>
      </motion.div>
    </div>
  );
}
