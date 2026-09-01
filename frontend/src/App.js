import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Lenis from "lenis";
import "@/App.css";
import { trackPageview } from "@/lib/api";
import { SettingsProvider } from "@/lib/settings";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Expertise from "@/pages/Expertise";
import Perspective from "@/pages/Perspective";
import ArticlePage from "@/pages/ArticlePage";
import Projects from "@/pages/Projects";
import Speaking from "@/pages/Speaking";
import WorkWithMe from "@/pages/WorkWithMe";
import Contact from "@/pages/Contact";
import Legal from "@/pages/Legal";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";

function ScrollManager() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    if (!navigator.webdriver && !pathname.startsWith("/admin")) {
      trackPageview(pathname);
    }
  }, [pathname]);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
    let raf;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);
  return null;
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <SettingsProvider>
        <div className="grain min-h-screen bg-[#0a0a0c] text-white">
          <ScrollManager />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-crimson focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
            data-testid="skip-to-content"
          >
            Skip to content
          </a>
          <Navbar />
          <main id="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/expertise" element={<Expertise />} />
              <Route path="/perspective" element={<Perspective />} />
              <Route path="/perspective/:slug" element={<ArticlePage />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/speaking" element={<Speaking />} />
              <Route path="/work-with-me" element={<WorkWithMe />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Legal kind="privacy" />} />
              <Route path="/terms" element={<Legal kind="terms" />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
        </SettingsProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
