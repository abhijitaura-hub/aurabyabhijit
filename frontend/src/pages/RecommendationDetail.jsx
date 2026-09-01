import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import SEO from "../components/SEO";
import { Reveal } from "../components/Motion";
import { PillTag, RecoCard } from "../components/reco/Reco";
import { fetchRecommendation, fetchAdminRecommendationBySlug, fetchSettings, mediaUrl, trackEvent } from "../lib/api";

const SUB_SCORE_LABELS = {
  performance: "Performance",
  reliability: "Reliability",
  value: "Value",
  ease_of_use: "Ease of Use",
  professional_suitability: "Professional Suitability",
};

const DEFAULT_DISCLOSURE =
  "Some links on AURA Recommendations may be affiliate links. If you purchase through one of these links, AURA BY ABHIJIT may earn a commission at no additional cost to you. Recommendations are based on editorial evaluation and are not determined solely by commission.";

export default function RecommendationDetail() {
  const { category, slug } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [disclosure, setDisclosure] = useState(DEFAULT_DISCLOSURE);

  useEffect(() => {
    setData(null);
    setError(false);
    const isPreview = new URLSearchParams(window.location.search).get("preview") === "1";
    fetchRecommendation(slug)
      .then(setData)
      .catch(async () => {
        if (isPreview) {
          const t = localStorage.getItem("aura_admin_token");
          if (t) {
            const draft = await fetchAdminRecommendationBySlug(t, slug).catch(() => null);
            if (draft) {
              setData({ item: draft, related: [] });
              return;
            }
          }
        }
        setError(true);
      });
    fetchSettings().then((s) => s?.disclosure_text && setDisclosure(s.disclosure_text)).catch(() => {});
  }, [slug]);

  const previewMode = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("preview") === "1";

  if (error)
    return (
      <div className="mx-auto max-w-3xl px-5 py-48 text-center" data-testid="reco-not-found">
        <h1 className="font-display text-3xl font-semibold text-white">Recommendation not found</h1>
        <Link to="/recommendations" className="mt-6 inline-block text-sm text-crimson" data-testid="reco-back-link">
          Back to Recommendations
        </Link>
      </div>
    );
  if (!data)
    return (
      <div className="mx-auto max-w-3xl px-5 py-48 text-center font-mono-tech text-xs uppercase tracking-[0.3em] text-zinc-600">
        Loading…
      </div>
    );

  const { item, related } = data;

  const onMerchantClick = (m) => {
    trackEvent(`/recommendations/${category}/${slug}`, m.affiliate_enabled ? "affiliate_click" : "merchant_click", m.name);
  };

  return (
    <>
      <SEO
        title={item.name}
        description={item.description || item.verdict || `${item.name} — AURA recommendation.`}
        path={`/recommendations/${category}/${slug}`}
        image={item.image ? `https://aurabyabhijit.com/api/media/${item.image}` : undefined}
        schema={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://aurabyabhijit.com/" },
            { "@type": "ListItem", position: 2, name: "Recommendations", item: "https://aurabyabhijit.com/recommendations" },
            { "@type": "ListItem", position: 3, name: category, item: `https://aurabyabhijit.com/recommendations/${category}` },
            { "@type": "ListItem", position: 4, name: item.name },
          ],
        }}
      />
      <article className="mx-auto max-w-4xl px-5 pb-24 pt-32 md:pt-44" data-testid="reco-detail">
        {previewMode && (
          <p className="mb-8 border border-amber-500/40 bg-amber-500/10 px-4 py-3 font-mono-tech text-[10px] uppercase tracking-[0.2em] text-amber-300" data-testid="preview-banner">
            Draft preview — only visible while signed in as admin
          </p>
        )}
        <Reveal>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 font-mono-tech text-[10px] uppercase tracking-[0.2em] text-zinc-600">
            <Link to="/" className="transition-colors hover:text-white">AURA</Link>
            <span>/</span>
            <Link to="/recommendations" className="transition-colors hover:text-white">Recommendations</Link>
            <span>/</span>
            <Link to={`/recommendations/${category}`} className="transition-colors hover:text-white">{category.replace(/-/g, " ")}</Link>
            <span>/</span>
            <span className="text-zinc-400">{item.name}</span>
          </nav>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {item.badge && <PillTag>{item.badge}</PillTag>}
            {item.aura_score != null && (
              <span className="font-display text-4xl font-semibold tracking-tight text-white" data-testid="reco-detail-score">
                {item.aura_score.toFixed(1)}
                <span className="ml-2 font-mono-tech text-[10px] uppercase tracking-[0.2em] text-zinc-500">AURA Score™</span>
              </span>
            )}
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <h1 className="mt-5 font-display text-3xl font-bold leading-[1.1] tracking-tighter text-white sm:text-4xl md:text-5xl" data-testid="reco-detail-name">
            {item.name}
          </h1>
          {item.description && <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">{item.description}</p>}
        </Reveal>

        {item.image && (
          <Reveal delay={0.16}>
            <img src={mediaUrl(item.image)} alt={item.name} data-testid="reco-detail-image" className="mt-10 w-full border border-white/8 object-cover" />
          </Reveal>
        )}

        {item.sub_scores && Object.keys(item.sub_scores).length > 0 && (
          <Reveal delay={0.18}>
            <div className="mt-10 border border-white/8 bg-surface p-7 md:p-9" data-testid="reco-sub-scores">
              <p className="font-mono-tech text-[10px] uppercase tracking-[0.24em] text-zinc-500">Score breakdown</p>
              <div className="mt-5 space-y-4">
                {Object.entries(item.sub_scores).map(([k, v]) => (
                  <div key={k}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="text-zinc-300">{SUB_SCORE_LABELS[k] || k}</span>
                      <span className="font-mono-tech text-xs text-crimson">{v.toFixed(1)}</span>
                    </div>
                    <div className="mt-1.5 h-1 w-full bg-white/8">
                      <div className="h-full bg-crimson" style={{ width: `${(v / 10) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {item.verdict && (
          <Reveal delay={0.2}>
            <blockquote className="mt-10 border-l-2 border-crimson py-2 pl-6" data-testid="reco-verdict">
              <p className="font-mono-tech text-[10px] uppercase tracking-[0.24em] text-crimson">AURA Verdict</p>
              <p className="mt-3 font-display text-xl font-medium leading-snug text-zinc-200 md:text-2xl">{item.verdict}</p>
            </blockquote>
          </Reveal>
        )}

        <div className="mt-10 grid gap-px border border-white/8 bg-white/8 md:grid-cols-2">
          {item.best_for && (
            <Reveal className="bg-[#0a0a0c] p-7">
              <p className="font-mono-tech text-[10px] uppercase tracking-[0.24em] text-zinc-500">Best for</p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300">{item.best_for}</p>
            </Reveal>
          )}
          {item.avoid_if && (
            <Reveal delay={0.05} className="bg-[#0a0a0c] p-7">
              <p className="font-mono-tech text-[10px] uppercase tracking-[0.24em] text-zinc-500">Who should avoid it</p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300">{item.avoid_if}</p>
            </Reveal>
          )}
        </div>

        {(item.pros?.length > 0 || item.cons?.length > 0) && (
          <div className="mt-px grid gap-px border border-t-0 border-white/8 bg-white/8 md:grid-cols-2">
            {item.pros?.length > 0 && (
              <Reveal className="bg-[#0a0a0c] p-7" data-testid="reco-pros">
                <p className="font-mono-tech text-[10px] uppercase tracking-[0.24em] text-zinc-500">Key strengths</p>
                <ul className="mt-4 space-y-2.5">
                  {item.pros.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-sm text-zinc-300">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-crimson" aria-hidden="true" />
                      {p}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
            {item.cons?.length > 0 && (
              <Reveal delay={0.05} className="bg-[#0a0a0c] p-7" data-testid="reco-cons">
                <p className="font-mono-tech text-[10px] uppercase tracking-[0.24em] text-zinc-500">Potential limitations</p>
                <ul className="mt-4 space-y-2.5">
                  {item.cons.map((c) => (
                    <li key={c} className="flex items-start gap-2.5 text-sm text-zinc-400">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-600" aria-hidden="true" />
                      {c}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>
        )}

        {item.merchants?.length > 0 && (
          <Reveal delay={0.1}>
            <div className="mt-10 border border-white/8 bg-surface p-7 md:p-9" data-testid="reco-merchants">
              <p className="font-mono-tech text-[10px] uppercase tracking-[0.24em] text-zinc-500">Where to get it</p>
              <div className="mt-5 space-y-3">
                {item.merchants.map((m) => {
                  const url = m.affiliate_enabled && m.affiliate_url ? m.affiliate_url : m.product_url;
                  if (!url) return null;
                  return (
                    <div key={m.name} className="flex flex-wrap items-center justify-between gap-3 border border-white/8 px-5 py-4">
                      <span className="text-sm font-medium text-white">{m.name}</span>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        onClick={() => onMerchantClick(m)}
                        data-testid={`reco-merchant-${m.name.toLowerCase().replace(/\s+/g, "-")}`}
                        className="group inline-flex items-center gap-2 border border-crimson/60 px-4 py-2 text-xs font-medium text-crimson transition-colors duration-300 hover:bg-crimson hover:text-black"
                      >
                        Check Availability
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  );
                })}
              </div>
              <p className="mt-5 text-xs leading-relaxed text-zinc-600">
                {item.merchants.find((m) => m.disclosure_override)?.disclosure_override || disclosure}{" "}
                <Link to="/affiliate-disclosure" className="text-zinc-400 underline underline-offset-4 transition-colors hover:text-crimson">
                  Read the full disclosure
                </Link>
              </p>
            </div>
          </Reveal>
        )}
      </article>

      {related.length > 0 && (
        <section className="border-t border-white/8 bg-surface" data-testid="reco-related">
          <div className="mx-auto max-w-7xl px-5 py-20 md:px-8">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-white md:text-3xl">Related recommendations</h2>
            <div className="mt-10 grid gap-px border border-white/8 bg-white/8 md:grid-cols-3">
              {related.map((r) => (
                <div key={r.slug} className="h-full bg-[#0a0a0c]"><RecoCard item={r} /></div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
