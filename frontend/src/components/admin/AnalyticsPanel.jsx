import { useEffect, useState } from "react";
import { BarChart3, Eye, Globe2, TrendingUp } from "lucide-react";
import { fetchAnalytics } from "../../lib/api";

export default function AnalyticsPanel({ token }) {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchAnalytics(token, days).then(setData).catch(() => setData(null));
  }, [token, days]);

  if (!data)
    return <p className="py-20 text-center font-mono-tech text-xs uppercase tracking-[0.3em] text-zinc-600" data-testid="analytics-loading">Loading…</p>;

  const maxDaily = Math.max(1, ...data.daily.map((d) => d.views));
  const topArticle = data.by_page.find((p) => p.path.startsWith("/perspective/"));

  return (
    <div className="mt-10" data-testid="analytics-panel">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-zinc-500">Private, cookie-free analytics — no IPs, no third parties.</p>
        <div className="flex gap-2" role="group" aria-label="Date range">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              aria-pressed={days === d}
              data-testid={`analytics-range-${d}`}
              className={`border px-4 py-2 font-mono-tech text-[11px] uppercase tracking-[0.16em] transition-colors duration-300 ${
                days === d ? "border-crimson bg-crimson/10 text-crimson" : "border-white/12 text-zinc-400 hover:text-white"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-px border border-white/8 bg-white/8 sm:grid-cols-3">
        {[
          { icon: Eye, label: `Views · last ${data.days} days`, value: data.total_views, testId: "analytics-total" },
          { icon: TrendingUp, label: "Top article", value: topArticle ? `${topArticle.views} views` : "—", sub: topArticle?.path.replace("/perspective/", ""), testId: "analytics-top-article" },
          { icon: Globe2, label: "External referrers", value: data.by_referrer.length, testId: "analytics-referrers" },
        ].map((c) => (
          <div key={c.testId} className="bg-[#0a0a0c] p-6 md:p-8" data-testid={c.testId}>
            <c.icon className="h-5 w-5 text-crimson" />
            <p className="mt-4 font-display text-3xl font-semibold tracking-tight text-white">{c.value}</p>
            <p className="mt-1.5 font-mono-tech text-[10px] uppercase tracking-[0.2em] text-zinc-500">{c.label}</p>
            {c.sub && <p className="mt-1 truncate text-xs text-zinc-500">{c.sub}</p>}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="border border-white/8 bg-surface p-6 md:p-8" data-testid="analytics-daily">
          <p className="flex items-center gap-2 font-mono-tech text-[10px] uppercase tracking-[0.24em] text-zinc-500">
            <BarChart3 className="h-4 w-4 text-crimson" /> Daily views
          </p>
          {data.daily.length === 0 ? (
            <p className="mt-6 text-sm text-zinc-600">No traffic recorded in this range yet.</p>
          ) : (
            <div className="mt-6 flex h-32 items-end gap-[3px]" role="img" aria-label="Daily page views bar chart">
              {data.daily.map((d) => (
                <div
                  key={d.date}
                  title={`${d.date}: ${d.views} views`}
                  className="flex-1 bg-crimson/70 transition-colors hover:bg-crimson"
                  style={{ height: `${Math.max(4, (d.views / maxDaily) * 100)}%` }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="border border-white/8 bg-surface p-6 md:p-8" data-testid="analytics-pages">
          <p className="font-mono-tech text-[10px] uppercase tracking-[0.24em] text-zinc-500">Top pages</p>
          {data.by_page.length === 0 ? (
            <p className="mt-6 text-sm text-zinc-600">No page views yet.</p>
          ) : (
            <ul className="mt-5 space-y-2.5">
              {data.by_page.slice(0, 10).map((p) => (
                <li key={p.path} className="flex items-baseline justify-between gap-4 text-sm" data-testid={`analytics-page-${p.path.replace(/\//g, "-") || "home"}`}>
                  <span className="truncate text-zinc-300">{p.path}</span>
                  <span className="shrink-0 font-mono-tech text-xs text-crimson">{p.views}</span>
                </li>
              ))}
            </ul>
          )}
          {data.by_referrer.length > 0 && (
            <>
              <p className="mt-8 font-mono-tech text-[10px] uppercase tracking-[0.24em] text-zinc-500">Referrers</p>
              <ul className="mt-4 space-y-2">
                {data.by_referrer.map((r) => (
                  <li key={r.host} className="flex items-baseline justify-between gap-4 text-sm">
                    <span className="truncate text-zinc-400">{r.host}</span>
                    <span className="shrink-0 font-mono-tech text-xs text-zinc-500">{r.views}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
