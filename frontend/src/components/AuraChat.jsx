import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Bot, Send, X } from "lucide-react";
import { API } from "../lib/api";
import { EASE } from "./Motion";

const SUGGESTIONS = [
  "What does Abhijit do?",
  "What advisory services are offered?",
  "What is the AURA Decision Framework?",
];

export default function AuraChat() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;
    // Wheel/touch over non-scrollable parts of the panel (header, footer, input)
    // must not chain to the page behind; the messages area scrolls natively.
    const stopChaining = (e) => {
      if (!scrollRef.current?.contains(e.target)) e.preventDefault();
    };
    panel.addEventListener("wheel", stopChaining, { passive: false });
    panel.addEventListener("touchmove", stopChaining, { passive: false });
    return () => {
      panel.removeEventListener("wheel", stopChaining);
      panel.removeEventListener("touchmove", stopChaining);
    };
  }, [open]);

  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener("aura:open-chat", openChat);
    return () => window.removeEventListener("aura:open-chat", openChat);
  }, []);

  if (pathname.startsWith("/admin")) return null;

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || busy) return;
    setInput("");
    setError("");
    const history = messages.slice(-6);
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setBusy(true);
    setMessages((m) => [...m, { role: "assistant", content: "" }]);
    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.detail || "AURA AI is unavailable right now.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";
        for (const part of parts) {
          if (!part.startsWith("data: ")) continue;
          const token = part.slice(6);
          if (token === "[DONE]") break;
          const text = token.replace(/\\n/g, "\n");
          setMessages((m) => {
            const copy = [...m];
            copy[copy.length - 1] = { role: "assistant", content: copy[copy.length - 1].content + text };
            return copy;
          });
        }
      }
      setMessages((m) => {
        if (!m.length) return m;
        const copy = [...m];
        const last = copy[copy.length - 1];
        if (last.role === "assistant") {
          copy[copy.length - 1] = { ...last, content: last.content.replace(/\*\*/g, "").replace(/^#{1,6}\s*/gm, "") };
        }
        return copy;
      });
    } catch (e) {
      setMessages((m) => m.slice(0, -1));
      setError(e.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close AURA AI chat" : "Open AURA AI chat"}
        aria-expanded={open}
        data-testid="aura-chat-toggle"
        className="group fixed bottom-5 left-5 z-40 flex h-12 items-center gap-2 rounded-full border border-white/15 bg-[#121217]/90 px-4 shadow-lg shadow-black/40 backdrop-blur-md transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-crimson"
      >
        <Bot className="h-5 w-5 text-zinc-300 transition-colors duration-300 group-hover:text-crimson" />
        <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-zinc-300 group-hover:text-crimson">
          AURA AI
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="fixed bottom-[76px] left-4 z-40 flex h-[min(500px,calc(100dvh-110px))] w-[calc(100vw-32px)] max-w-[350px] flex-col border border-white/12 bg-[#0a0a0c]/95 shadow-2xl shadow-black/50 backdrop-blur-xl md:left-6"
            role="dialog"
            aria-label="AURA AI chat"
            data-testid="aura-chat-panel"
            data-lenis-prevent
          >
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
              <span className="inline-flex items-center gap-2 font-mono-tech text-[10px] uppercase tracking-[0.2em] text-zinc-300">
                <span className="h-1.5 w-1.5 rounded-full bg-crimson" aria-hidden="true" />
                AURA AI · Concierge
              </span>
              <button onClick={() => setOpen(false)} aria-label="Close chat" className="flex h-9 w-9 items-center justify-center text-zinc-500 transition-colors hover:text-white" data-testid="aura-chat-close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="border-b border-white/8 px-4 py-1.5 font-mono-tech text-[8px] uppercase tracking-[0.14em] text-zinc-600" data-testid="aura-chat-disclaimer">
              Based on Abhijit's public content only · Not affiliated with any employer
            </p>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4" data-testid="aura-chat-messages">
              {messages.length === 0 && (
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed text-zinc-400">
                    Ask me anything about Abhijit's work, the frameworks, or where to find what you need.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        data-testid={`aura-chat-suggestion-${s.slice(0, 12).toLowerCase().replace(/\W+/g, "-")}`}
                        className="border border-white/12 px-3 py-1.5 text-left font-mono-tech text-[10px] uppercase tracking-[0.12em] text-zinc-400 transition-colors hover:border-crimson hover:text-crimson"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "text-right" : ""} data-testid={`chat-message-${i}`}>
                  <span
                    className={`inline-block max-w-[85%] whitespace-pre-wrap px-3.5 py-2.5 text-left text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-white text-black"
                        : "border border-white/10 bg-surface text-zinc-300"
                    }`}
                  >
                    {m.content || (busy && i === messages.length - 1 ? "…" : "")}
                  </span>
                </div>
              ))}
              {error && (
                <p className="border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300" role="alert" data-testid="aura-chat-error">
                  {error}
                </p>
              )}
            </div>

            <div className="border-t border-white/8 px-4 py-2.5 text-center">
              <p className="font-mono-tech text-[9px] uppercase tracking-[0.18em] text-zinc-600">
                Need a human?{" "}
                <Link to="/contact" className="text-crimson hover:underline" data-testid="aura-chat-contact-cta" onClick={() => setOpen(false)}>
                  Start a Conversation
                </Link>{" "}
                ·{" "}
                <Link to="/work-with-me" className="text-zinc-400 hover:text-crimson" data-testid="aura-chat-work-cta" onClick={() => setOpen(false)}>
                  Work With Me <ArrowUpRight className="inline h-3 w-3" />
                </Link>
              </p>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="flex items-center gap-2 border-t border-white/8 p-3"
            >
              <label htmlFor="aura-chat-input" className="sr-only">Message AURA AI</label>
              <input
                id="aura-chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={500}
                placeholder="Ask AURA AI…"
                disabled={busy}
                data-testid="aura-chat-input"
                className="w-full border border-white/12 bg-transparent px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-crimson focus:outline-none disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Send message"
                data-testid="aura-chat-send"
                className="flex h-10 w-10 shrink-0 items-center justify-center bg-white text-black transition-colors duration-300 hover:bg-crimson hover:text-white disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
