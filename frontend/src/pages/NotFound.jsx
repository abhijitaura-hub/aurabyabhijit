import { Link } from "react-router-dom";
import SEO from "../components/SEO";

export default function NotFound() {
  return (
    <>
      <SEO title="Page not found" path="/404" />
      <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-5 py-32 text-center" data-testid="not-found-page">
        <p className="font-mono-tech text-xs uppercase tracking-[0.32em] text-crimson">404</p>
        <h1 className="mt-6 font-display text-4xl font-bold tracking-tighter text-white md:text-5xl">
          This page drifted off the network.
        </h1>
        <p className="mt-5 text-zinc-400">The route you're looking for doesn't exist — or hasn't been built yet.</p>
        <Link
          to="/"
          data-testid="not-found-home-link"
          className="mt-10 inline-flex items-center gap-2 bg-white px-6 py-3.5 text-sm font-semibold text-black transition-colors duration-300 hover:bg-crimson hover:text-white"
        >
          Back to AURA
        </Link>
      </section>
    </>
  );
}
