import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import SEO from "../components/SEO";
import { Reveal, SectionHead } from "../components/Motion";
import { submitContact, formatApiError } from "../lib/api";
import { useSettings } from "../lib/settings";
import { CONTACT_TOPICS } from "../data/site";

const EMPTY = { name: "", email: "", organization: "", topic: CONTACT_TOPICS[0], message: "", website: "" };

export default function Contact() {
  const { phone, public_email } = useSettings();
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      await submitContact(form);
      setStatus("sent");
    } catch (err) {
      setError(formatApiError(err));
      setStatus("error");
    }
  };

  const inputCls =
    "w-full border border-white/12 bg-transparent px-4 py-3 text-sm text-white placeholder:text-zinc-600 transition-colors duration-300 focus:border-crimson focus:outline-none";

  return (
    <>
      <SEO
        title="Contact"
        description="Start a conversation with Abhijit Debnath — AI strategy, automation, digital transformation, cybersecurity and executive technology advisory."
        path="/contact"
      />
      <section className="mx-auto max-w-7xl px-5 pb-24 pt-32 md:px-8 md:pt-44" data-testid="contact-page">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
          <div>
            <SectionHead
              index="C"
              overline="Contact"
              title="Start a conversation"
              lede="A few lines about what you're working on is enough. No forms demanding your org chart, no nurture sequences."
            />
            <Reveal delay={0.2}>
              <p className="mt-10 max-w-md text-sm leading-relaxed text-zinc-500">
                Every message lands directly with Abhijit. Expect a considered reply — not an automated one.
              </p>
            </Reveal>
            {(phone || public_email) && (
              <Reveal delay={0.28}>
                <div className="mt-8 space-y-3 border-t border-white/8 pt-8" data-testid="contact-direct-channels">
                  {phone && (
                    <p className="text-sm text-zinc-400">
                      <span className="mr-3 font-mono-tech text-[10px] uppercase tracking-[0.24em] text-zinc-600">Phone</span>
                      <a href={`tel:${phone.replace(/\s/g, "")}`} className="text-white transition-colors hover:text-crimson" data-testid="contact-phone-link">{phone}</a>
                    </p>
                  )}
                  {public_email && (
                    <p className="text-sm text-zinc-400">
                      <span className="mr-3 font-mono-tech text-[10px] uppercase tracking-[0.24em] text-zinc-600">Email</span>
                      <a href={`mailto:${public_email}`} className="text-white transition-colors hover:text-crimson" data-testid="contact-email-link">{public_email}</a>
                    </p>
                  )}
                </div>
              </Reveal>
            )}
          </div>

          <Reveal delay={0.12}>
            {status === "sent" ? (
              <div className="flex h-full min-h-[380px] flex-col items-center justify-center border border-crimson/40 bg-crimson/[0.05] p-10 text-center" data-testid="contact-success">
                <CheckCircle2 className="h-10 w-10 text-crimson" />
                <h2 className="mt-6 font-display text-2xl font-semibold text-white">Message received.</h2>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-400">
                  Thank you for reaching out. Abhijit will read this personally and reply soon.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5 border border-white/8 bg-surface p-7 md:p-10" data-testid="contact-form" noValidate={false}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className="mb-2 block font-mono-tech text-[10px] uppercase tracking-[0.2em] text-zinc-500">Name</label>
                    <input id="contact-name" required minLength={2} value={form.name} onChange={set("name")} className={inputCls} placeholder="Your name" data-testid="contact-name-input" />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="mb-2 block font-mono-tech text-[10px] uppercase tracking-[0.2em] text-zinc-500">Email</label>
                    <input id="contact-email" required type="email" value={form.email} onChange={set("email")} className={inputCls} placeholder="you@company.com" data-testid="contact-email-input" />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-organization" className="mb-2 block font-mono-tech text-[10px] uppercase tracking-[0.2em] text-zinc-500">Organization <span className="text-zinc-700">— optional</span></label>
                  <input id="contact-organization" value={form.organization} onChange={set("organization")} className={inputCls} placeholder="Where you work" data-testid="contact-organization-input" />
                </div>
                <div>
                  <label htmlFor="contact-topic" className="mb-2 block font-mono-tech text-[10px] uppercase tracking-[0.2em] text-zinc-500">What would you like to discuss?</label>
                  <select id="contact-topic" value={form.topic} onChange={set("topic")} className={`${inputCls} appearance-none bg-surface`} data-testid="contact-topic-select">
                    {CONTACT_TOPICS.map((t) => (
                      <option key={t} value={t} className="bg-[#121217]">{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="contact-message" className="mb-2 block font-mono-tech text-[10px] uppercase tracking-[0.2em] text-zinc-500">Message</label>
                  <textarea id="contact-message" required minLength={10} rows={5} value={form.message} onChange={set("message")} className={`${inputCls} resize-y`} placeholder="What are you trying to solve?" data-testid="contact-message-input" />
                </div>
                {/* honeypot */}
                <div className="absolute -left-[9999px]" aria-hidden="true">
                  <label htmlFor="contact-website">Website</label>
                  <input id="contact-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} />
                </div>
                {status === "error" && (
                  <p className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert" data-testid="contact-error">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={status === "sending"}
                  data-testid="contact-submit-button"
                  className="group inline-flex w-full items-center justify-center gap-2 bg-white px-6 py-4 text-sm font-semibold text-black transition-colors duration-300 hover:bg-crimson hover:text-white disabled:opacity-60"
                >
                  {status === "sending" ? "Sending…" : "Start a Conversation"}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </section>
    </>
  );
}
