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
            ctx.strokeStyle = `rgba(0,240,255,${(1 - d / link) * 0.14})`;
            ctx.lineWidth = devicePixelRatio * 0.6;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.fillStyle = "rgba(0,240,255,0.5)";
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
        <div className="relative border border-white/12 bg-surface">
          {/* corner ticks */}
          <span className="absolute -left-px -top-px h-5 w-5 border-l border-t border-cyan-electric" />
          <span className="absolute -right-px -top-px h-5 w-5 border-r border-t border-cyan-electric" />
          <span className="absolute -bottom-px -left-px h-5 w-5 border-b border-l border-cyan-electric" />
          <span className="absolute -bottom-px -right-px h-5 w-5 border-b border-r border-cyan-electric" />
          <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(120% 90% at 70% 20%, rgba(138,43,226,0.22), transparent 55%), radial-gradient(100% 80% at 25% 85%, rgba(0,240,255,0.16), transparent 55%), #101014",
              }}
            />
            <div className="blueprint-grid absolute inset-0 opacity-40" />
            <motion.span
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.4, delay: 1, ease: EASE }}
              className="relative font-display text-[7rem] font-extralight leading-none tracking-tighter text-white md:text-[9rem]"
            >
              AD
            </motion.span>
            <span className="absolute bottom-4 left-4 font-mono-tech text-[10px] uppercase tracking-[0.3em] text-zinc-500">
              Abhijit Debnath
            </span>
            <span className="absolute right-4 top-4 font-mono-tech text-[10px] uppercase tracking-[0.3em] text-cyan-electric/80">
              EST. 20+ YRS
            </span>
          </div>
        </div>
        <p className="mt-4 text-center font-mono-tech text-[10px] uppercase tracking-[0.25em] text-zinc-600">
          Portrait placeholder — photography to be supplied
        </p>
      </motion.div>
    </div>
  );
}
