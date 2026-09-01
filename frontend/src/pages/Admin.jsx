import { useEffect, useState } from "react";
import { LogOut, Inbox, PenLine, BarChart3, Settings2 } from "lucide-react";
import SEO from "../components/SEO";
import ArticlesPanel from "../components/admin/ArticlesPanel";
import AnalyticsPanel from "../components/admin/AnalyticsPanel";
import SettingsPanel from "../components/admin/SettingsPanel";
import { adminLogin, fetchMessages, fetchSubscribers, formatApiError } from "../lib/api";
import { formatDate } from "../components/ArticleCard";

const TOKEN_KEY = "aura_admin_token";

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [messages, setMessages] = useState(null);
  const [subscribers, setSubscribers] = useState(null);
  const [tab, setTab] = useState("inbox");

  useEffect(() => {
    if (!token) return;
    fetchMessages(token)
      .then(setMessages)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      });
    fetchSubscribers(token).then(setSubscribers).catch(() => setSubscribers([]));
  }, [token]);

  const onLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { token: t } = await adminLogin(email, password);
      localStorage.setItem(TOKEN_KEY, t);
      setToken(t);
    } catch (err) {
      setError(formatApiError(err, "Login failed."));
    }
  };

  const inputCls =
    "w-full border border-white/12 bg-transparent px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-crimson focus:outline-none";

  return (
    <>
      <SEO title="Admin" description="AURA admin — contact message inbox." path="/admin" />
      <section className="mx-auto max-w-5xl px-5 pb-24 pt-32 md:pt-44" data-testid="admin-page">
        {!token ? (
          <div className="mx-auto max-w-md">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-white">Admin sign in</h1>
            <p className="mt-3 text-sm text-zinc-500">Access the AURA message inbox.</p>
            <form onSubmit={onLogin} className="mt-8 space-y-5 border border-white/8 bg-surface p-8" data-testid="admin-login-form">
              <div>
                <label htmlFor="admin-email" className="mb-2 block font-mono-tech text-[10px] uppercase tracking-[0.2em] text-zinc-500">Email</label>
                <input id="admin-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} data-testid="admin-email-input" />
              </div>
              <div>
                <label htmlFor="admin-password" className="mb-2 block font-mono-tech text-[10px] uppercase tracking-[0.2em] text-zinc-500">Password</label>
                <input id="admin-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} data-testid="admin-password-input" />
              </div>
              {error && (
                <p className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert" data-testid="admin-login-error">{error}</p>
              )}
              <button type="submit" className="w-full bg-white px-6 py-3.5 text-sm font-semibold text-black transition-colors duration-300 hover:bg-crimson hover:text-white" data-testid="admin-login-submit">
                Sign in
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2" role="tablist" aria-label="Admin sections">
                <button
                  role="tab"
                  aria-selected={tab === "inbox"}
                  onClick={() => setTab("inbox")}
                  data-testid="admin-tab-inbox"
                  className={`inline-flex items-center gap-2 border px-5 py-2.5 font-mono-tech text-[11px] uppercase tracking-[0.18em] transition-colors duration-300 ${
                    tab === "inbox" ? "border-crimson bg-crimson/10 text-crimson" : "border-white/12 text-zinc-400 hover:text-white"
                  }`}
                >
                  <Inbox className="h-4 w-4" /> Inbox
                </button>
                <button
                  role="tab"
                  aria-selected={tab === "articles"}
                  onClick={() => setTab("articles")}
                  data-testid="admin-tab-articles"
                  className={`inline-flex items-center gap-2 border px-5 py-2.5 font-mono-tech text-[11px] uppercase tracking-[0.18em] transition-colors duration-300 ${
                    tab === "articles" ? "border-crimson bg-crimson/10 text-crimson" : "border-white/12 text-zinc-400 hover:text-white"
                  }`}
                >
                  <PenLine className="h-4 w-4" /> Article Studio
                </button>
                <button
                  role="tab"
                  aria-selected={tab === "analytics"}
                  onClick={() => setTab("analytics")}
                  data-testid="admin-tab-analytics"
                  className={`inline-flex items-center gap-2 border px-5 py-2.5 font-mono-tech text-[11px] uppercase tracking-[0.18em] transition-colors duration-300 ${
                    tab === "analytics" ? "border-crimson bg-crimson/10 text-crimson" : "border-white/12 text-zinc-400 hover:text-white"
                  }`}
                >
                  <BarChart3 className="h-4 w-4" /> Analytics
                </button>
                <button
                  role="tab"
                  aria-selected={tab === "settings"}
                  onClick={() => setTab("settings")}
                  data-testid="admin-tab-settings"
                  className={`inline-flex items-center gap-2 border px-5 py-2.5 font-mono-tech text-[11px] uppercase tracking-[0.18em] transition-colors duration-300 ${
                    tab === "settings" ? "border-crimson bg-crimson/10 text-crimson" : "border-white/12 text-zinc-400 hover:text-white"
                  }`}
                >
                  <Settings2 className="h-4 w-4" /> Settings
                </button>
              </div>
              <button
                onClick={() => { localStorage.removeItem(TOKEN_KEY); setToken(null); }}
                className="inline-flex items-center gap-2 border border-white/15 px-4 py-2 text-sm text-zinc-400 transition-colors hover:border-white/40 hover:text-white"
                data-testid="admin-logout-button"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
            {tab === "articles" ? (
              <ArticlesPanel token={token} />
            ) : tab === "analytics" ? (
              <AnalyticsPanel token={token} />
            ) : tab === "settings" ? (
              <SettingsPanel token={token} />
            ) : messages === null ? (
              <p className="py-20 text-center font-mono-tech text-xs uppercase tracking-[0.3em] text-zinc-600" data-testid="admin-loading">Loading…</p>
            ) : messages.length === 0 ? (
              <p className="mt-12 border border-dashed border-white/15 p-16 text-center text-sm text-zinc-500" data-testid="admin-empty">
                No messages yet.
              </p>
            ) : (
              <ul className="mt-10 space-y-px border border-white/8 bg-white/8" data-testid="admin-message-list">
                {messages.map((m) => (
                  <li key={m.id} className="bg-[#0a0a0c] p-6 md:p-8" data-testid={`admin-message-${m.id}`}>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono-tech text-[10px] uppercase tracking-[0.2em]">
                      <span className="text-crimson">{m.topic}</span>
                      <span className="text-zinc-600">{formatDate(m.created_at)}</span>
                    </div>
                    <p className="mt-3 font-display text-lg font-semibold text-white">
                      {m.name} <span className="ml-2 text-sm font-normal text-zinc-500">{m.email}{m.organization ? ` · ${m.organization}` : ""}</span>
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-400">{m.message}</p>
                  </li>
                ))}
              </ul>
            )}
            {tab === "inbox" && subscribers !== null && (
              <div className="mt-10 border border-white/8 bg-surface p-6 md:p-8" data-testid="admin-subscribers">
                <p className="font-mono-tech text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                  Newsletter subscribers · {subscribers.length}
                </p>
                {subscribers.length === 0 ? (
                  <p className="mt-4 text-sm text-zinc-600">No subscribers yet.</p>
                ) : (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {subscribers.map((s) => (
                      <li key={s.id} className="border border-white/10 px-3 py-1.5 font-mono-tech text-[11px] text-zinc-400" data-testid={`subscriber-${s.id}`}>
                        {s.email}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}
