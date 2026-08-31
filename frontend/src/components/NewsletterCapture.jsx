import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { subscribeNewsletter, formatApiError } from "../lib/api";

export default function NewsletterCapture() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      await subscribeNewsletter({ email, website });
      setStatus("sent");
    } catch (err) {
      setError(formatApiError(err, "Could not subscribe right now. Please try again."));
      setStatus("error");
    }
  };

  return (
    <div className="mt-16 border border-white/8 bg-surface p-8 md:p-10" data-testid="newsletter-capture">
      {status === "sent" ? (
        <div className="flex items-center gap-4" data-testid="newsletter-success">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-crimson" />
          <p className="text-sm text-zinc-300 md:text-base">
            You're on the list. New perspectives will find you by email.
          </p>
        </div>
      ) : (
        <>
          <p className="font-mono-tech text-[10px] uppercase tracking-[0.28em] text-crimson">Stay in the loop</p>
          <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <p className="max-w-md text-sm leading-relaxed text-zinc-400 md:text-base">
              Get new perspectives by email — written occasionally, never noisily. Unsubscribe anytime.
            </p>
            <form onSubmit={onSubmit} className="flex w-full max-w-md gap-2" data-testid="newsletter-form">
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                data-testid="newsletter-email-input"
                className="w-full border border-white/12 bg-transparent px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-crimson focus:outline-none"
              />
              <div className="absolute -left-[9999px]" aria-hidden="true">
                <label htmlFor="newsletter-website">Website</label>
                <input id="newsletter-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>
              <button
                type="submit"
                disabled={status === "sending"}
                data-testid="newsletter-submit-button"
                className="group inline-flex shrink-0 items-center gap-2 bg-white px-5 py-3 text-sm font-semibold text-black transition-colors duration-300 hover:bg-crimson hover:text-white disabled:opacity-60"
              >
                {status === "sending" ? "Joining…" : "Subscribe"}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </form>
          </div>
          {status === "error" && (
            <p className="mt-4 border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert" data-testid="newsletter-error">
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}
