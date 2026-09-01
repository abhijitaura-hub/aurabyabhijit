import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SEO from "../components/SEO";
import { Reveal } from "../components/Motion";
import { RecoCard, PillTag } from "../components/reco/Reco";
import { fetchRecoCategories, fetchRecommendations } from "../lib/api";

const SPECIAL = {
  "aura-picks": { title: "AURA Picks", lede: "The products and tools that stand out." },
  "my-setup": { title: "My Setup", lede: "The technology, tools and gear behind my work and content." },
};

export default function RecommendationCategory() {
  const { category } = useParams();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState(null);
  const [badgeFilter, setBadgeFilter] = useState(null);

  useEffect(() => {
    setItems(null);
    setBadgeFilter(null);
    fetchRecoCategories().then(setCategories).catch(() => {});
    const params = category === "aura-picks" ? { badge: "AURA PICK" } : { category };
    fetchRecommendations(params).then(setItems).catch(() => setItems([]));
  }, [category]);

  const cat = categories.find((c) => c.slug === category);
  const special = SPECIAL[category];
  const title = special?.title || (cat ? `AURA ${cat.name} Recommendations` : "AURA Recommendations");
  const lede = special?.lede || cat?.description || "";

  const badges = useMemo(() => [...new Set((items || []).map((i) => i.badge).filter(Boolean))], [items]);
  const visible = useMemo(
    () => (items || []).filter((i) => !badgeFilter || i.badge === badgeFilter),
    [items, badgeFilter]
  );

  const groups = useMemo(() => {
    if (category !== "my-setup") return null;
    const map = new Map();
    visible.forEach((i) => {
      const g = i.setup_group || "Tools & Gear";
      if (!map.has(g)) map.set(g, []);
      map.get(g).push(i);
    });
    return [...map.entries()];
  }, [category, visible]);

  return (
    <>
      <SEO
        title={title}
        description={lede || `AURA ${category} recommendations — evaluated tools and technology.`}
        path={`/recommendations/${category}`}
        schema={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://aurabyabhijit.com/" },
            { "@type": "ListItem", position: 2, name: "Recommendations", item: "https://aurabyabhijit.com/recommendations" },
            { "@type": "ListItem", position: 3, name: cat?.name || special?.title || category },
          ],
        }}
      />
      <section className="mx-auto max-w-7xl px-5 pb-24 pt-32 md:px-8 md:pt-44" data-testid="reco-category-page">
        <Reveal>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 font-mono-tech text-[10px] uppercase tracking-[0.2em] text-zinc-600">
            <Link to="/" className="transition-colors hover:text-white" data-testid="breadcrumb-home">AURA</Link>
            <span>/</span>
            <Link to="/recommendations" className="transition-colors hover:text-white" data-testid="breadcrumb-reco">Recommendations</Link>
            <span>/</span>
            <span className="text-zinc-400">{cat?.name || special?.title || category}</span>
          </nav>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-8 font-mono-tech text-xs font-medium uppercase tracking-[0.28em] text-crimson">AURA Recommendations</p>
          <h1 className="mt-5 max-w-3xl font-display text-3xl font-bold leading-[1.1] tracking-tighter text-white sm:text-4xl md:text-5xl" data-testid="reco-category-title">
            {title}
          </h1>
          {lede && <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">{lede}</p>}
        </Reveal>

        {badges.length > 1 && (
          <Reveal delay={0.12}>
            <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter by badge">
              <button
                onClick={() => setBadgeFilter(null)}
                aria-pressed={!badgeFilter}
                data-testid="reco-filter-all"
                className={`border px-4 py-2 font-mono-tech text-[11px] uppercase tracking-[0.16em] transition-colors duration-300 ${
                  !badgeFilter ? "border-crimson bg-crimson/10 text-crimson" : "border-white/12 text-zinc-400 hover:text-white"
                }`}
              >
                All
              </button>
              {badges.map((b) => (
                <button
                  key={b}
                  onClick={() => setBadgeFilter(b === badgeFilter ? null : b)}
                  aria-pressed={badgeFilter === b}
                  data-testid={`reco-filter-${b.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`border px-4 py-2 font-mono-tech text-[11px] uppercase tracking-[0.16em] transition-colors duration-300 ${
                    badgeFilter === b ? "border-crimson bg-crimson/10 text-crimson" : "border-white/12 text-zinc-400 hover:text-white"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </Reveal>
        )}

        {items === null ? (
          <p className="py-24 text-center font-mono-tech text-xs uppercase tracking-[0.3em] text-zinc-600" data-testid="reco-loading">Loading…</p>
        ) : visible.length === 0 ? (
          <Reveal delay={0.15}>
            <div className="mt-12 border border-dashed border-white/15 p-14 text-center md:p-20" data-testid="reco-empty">
              <PillTag>Evaluating</PillTag>
              <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-zinc-500">
                Recommendations here are being evaluated. AURA publishes only what has been genuinely assessed —
                check back soon.
              </p>
            </div>
          </Reveal>
        ) : groups ? (
          groups.map(([group, groupItems]) => (
            <div key={group} className="mt-12" data-testid={`setup-group-${group.toLowerCase().replace(/\s+/g, "-")}`}>
              <h2 className="font-display text-xl font-semibold tracking-tight text-white md:text-2xl">{group}</h2>
              <div className="mt-6 grid gap-px border border-white/8 bg-white/8 sm:grid-cols-2 lg:grid-cols-3">
                {groupItems.map((i) => (
                  <div key={i.slug} className="h-full bg-[#0a0a0c]"><RecoCard item={i} /></div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="mt-12 grid gap-px border border-white/8 bg-white/8 sm:grid-cols-2 lg:grid-cols-3" data-testid="reco-grid">
            {visible.map((i) => (
              <div key={i.slug} className="h-full bg-[#0a0a0c]"><RecoCard item={i} /></div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
