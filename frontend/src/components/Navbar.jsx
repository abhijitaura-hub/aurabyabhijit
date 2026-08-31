import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { EASE } from "./Motion";

const LINKS = [
  { to: "/about", label: "About" },
  { to: "/expertise", label: "Expertise" },
  { to: "/perspective", label: "Perspective" },
  { to: "/projects", label: "Projects" },
  { to: "/speaking", label: "Speaking" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
        scrolled || open ? "border-b border-white/8 bg-black/70 backdrop-blur-xl" : "border-b border-transparent"
      }`}
      data-testid="navbar"
    >
      <nav className="mx-auto flex h-16 md:h-20 max-w-7xl items-center justify-between px-5 md:px-8" aria-label="Primary">
        <Link to="/" className="group flex items-baseline gap-2" data-testid="nav-logo">
          <span className="font-display text-xl font-bold tracking-[0.22em] text-white">AURA</span>
          <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-zinc-500 group-hover:text-cyan-electric transition-colors duration-300">
            by Abhijit
          </span>
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={`nav-link-${l.label.toLowerCase().replace(/\s/g, "-")}`}
              className={({ isActive }) =>
                `text-sm tracking-wide transition-colors duration-300 ${
                  isActive ? "text-cyan-electric" : "text-zinc-400 hover:text-white"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <Link
            to="/work-with-me"
            data-testid="nav-cta-work-with-me"
            className="group inline-flex items-center gap-1.5 border border-cyan-electric/60 px-4 py-2 text-sm font-medium text-cyan-electric transition-[background-color,color] duration-300 hover:bg-cyan-electric hover:text-black"
          >
            Work With Me
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <button
          className="flex h-11 w-11 items-center justify-center text-white lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          data-testid="nav-mobile-toggle"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="overflow-hidden border-t border-white/8 bg-[#0a0a0c]/95 backdrop-blur-xl lg:hidden"
            data-testid="nav-mobile-menu"
          >
            <div className="flex flex-col px-6 py-6">
              {LINKS.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.4, ease: EASE }}
                >
                  <NavLink
                    to={l.to}
                    data-testid={`nav-mobile-link-${l.label.toLowerCase().replace(/\s/g, "-")}`}
                    className={({ isActive }) =>
                      `block py-3.5 font-display text-2xl font-medium ${isActive ? "text-cyan-electric" : "text-zinc-200"}`
                    }
                  >
                    {l.label}
                  </NavLink>
                </motion.div>
              ))}
              <Link
                to="/work-with-me"
                data-testid="nav-mobile-cta-work-with-me"
                className="mt-4 inline-flex items-center justify-center gap-2 border border-cyan-electric px-5 py-3.5 text-base font-medium text-cyan-electric"
              >
                Work With Me <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
