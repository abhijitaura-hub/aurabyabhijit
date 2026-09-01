import { Link } from "react-router-dom";
import { Facebook, Linkedin, Youtube } from "lucide-react";
import { SITE } from "../data/site";
import { useSettings } from "../lib/settings";

const NAV = [
  { to: "/about", label: "About" },
  { to: "/expertise", label: "Expertise" },
  { to: "/perspective", label: "Perspective" },
  { to: "/projects", label: "Projects" },
  { to: "/speaking", label: "Speaking" },
  { to: "/work-with-me", label: "Work With Me" },
  { to: "/contact", label: "Contact" },
];

export default function Footer() {
  const { socials: SOCIALS } = useSettings();
  return (
    <footer className="border-t border-white/8 bg-[#08080a]" data-testid="footer">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link to="/" data-testid="footer-logo">
              <img src="/assets/aura-logo.png" alt="AURA by Abhijit" className="h-24 w-auto" />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-zinc-500">
              {SITE.tagline} A personal technology leadership, advisory and thought-leadership platform built on
              two decades of real-world experience.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href={SOCIALS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Abhijit Debnath on LinkedIn"
                data-testid="footer-social-linkedin"
                className="flex h-10 w-10 items-center justify-center border border-white/10 text-zinc-400 transition-[border-color,color] duration-300 hover:border-crimson hover:text-crimson"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href={SOCIALS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="AURA on YouTube"
                data-testid="footer-social-youtube"
                className="flex h-10 w-10 items-center justify-center border border-white/10 text-zinc-400 transition-[border-color,color] duration-300 hover:border-crimson hover:text-crimson"
              >
                <Youtube className="h-4 w-4" />
              </a>
              <a
                href={SOCIALS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="AURA on Facebook"
                data-testid="footer-social-facebook"
                className="flex h-10 w-10 items-center justify-center border border-white/10 text-zinc-400 transition-[border-color,color] duration-300 hover:border-crimson hover:text-crimson"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>
          <nav aria-label="Footer">
            <p className="font-mono-tech text-[10px] uppercase tracking-[0.28em] text-zinc-600">Navigate</p>
            <ul className="mt-5 space-y-3">
              {NAV.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    data-testid={`footer-link-${l.label.toLowerCase().replace(/\s/g, "-")}`}
                    className="text-sm text-zinc-400 transition-colors duration-300 hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="font-mono-tech text-[10px] uppercase tracking-[0.28em] text-zinc-600">Principles</p>
            <p className="mt-5 text-sm leading-relaxed text-zinc-400">
              Technology should simplify. Technology should secure. Technology should automate. Technology should
              transform.
            </p>
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-4 border-t border-white/8 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono-tech text-[11px] uppercase tracking-[0.2em] text-zinc-600">
            © {new Date().getFullYear()} {SITE.fullName}
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" data-testid="footer-link-privacy" className="text-xs text-zinc-500 hover:text-white transition-colors duration-300">
              Privacy
            </Link>
            <Link to="/terms" data-testid="footer-link-terms" className="text-xs text-zinc-500 hover:text-white transition-colors duration-300">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
