import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import SEO from "../components/SEO";
import { SectionHead, Reveal } from "../components/Motion";
import { ArticleCard } from "../components/ArticleCard";
import { fetchArticles } from "../lib/api";

export default function Perspective() {
  const [data, setData] = useState({ articles: [], categories: [] });
  const [category, setCategory] = useState(null);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchArticles({ ...(category ? { category } : {}), ...(search ? { q: search } : {}), limit: 24 })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, search]);

  const [featured, ...rest] = useMemo(() => {
    if (category || search) return [null, ...data.articles];
    const f = data.articles.find((a) => a.featured) || data.articles[0];
    return [f, ...data.articles.filter((a) => a !== f)];
  }, [data, category, search]);

  return (
    <>
      <SEO
        title="Perspective"
        description="Abhijit's Perspective — a premium technology publication on AI, automation, cybersecurity, cloud and technology leadership."
        path="/perspective"
      />
      <section className="mx-auto max-w-7xl px-5 pb-24 pt-32 md:px-8 md:pt-44" data-testid="perspective-page">
        <SectionHead
          index="P"
          overline="The Publication"
          title="Abhijit's Perspective"
          lede="Essays and field notes on AI, automation, cybersecurity, and what it takes to lead technology well."
        />

        <div className="mt-12 flex flex-col gap-5 border-y border-white/8 py-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            <button
              onClick={() => setCategory(null)}
              data-testid="filter-all"
              aria-pressed={!category}
              className={`border px-4 py-2 font-mono-tech text-[11px] uppercase tracking-[0.16em] transition-[border-color,color,background-color] duration-300 ${
                !category ? "border-cyan-electric bg-cyan-electric/10 text-cyan-electric" : "border-white/12 text-zinc-400 hover:border-white/30 hover:text-white"
              }`}
            >
              All
            </button>
            {data.categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c === category ? null : c)}
                data-testid={`filter-${c.toLowerCase().replace(/\s+/g, "-")}`}
                aria-pressed={category === c}
                className={`border px-4 py-2 font-mono-tech text-[11px] uppercase tracking-[0.16em] transition-[border-color,color,background-color] duration-300 ${
                  category === c ? "border-cyan-electric bg-cyan-electric/10 text-cyan-electric" : "border-white/12 text-zinc-400 hover:border-white/30 hover:text-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <form
            className="relative md:w-72"
            onSubmit={(e) => { e.preventDefault(); setSearch(query.trim()); }}
            role="search"
          >
            <label htmlFor="perspective-search" className="sr-only">Search articles</label>
            <input
              id="perspective-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search perspectives…"
              data-testid="perspective-search-input"
              className="w-full border border-white/12 bg-transparent py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:border-cyan-electric focus:outline-none"
            />
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" aria-hidden="true" />
          </form>
        </div>

        {loading ? (
          <p className="py-24 text-center font-mono-tech text-xs uppercase tracking-[0.3em] text-zinc-600" data-testid="perspective-loading">
            Loading perspectives…
          </p>
        ) : data.articles.length === 0 ? (
          <p className="py-24 text-center text-zinc-500" data-testid="perspective-empty">
            No perspectives match your search yet.
          </p>
        ) : (
          <div className="mt-12 space-y-px">
            {featured && (
              <Reveal>
                <div className="mb-px" data-testid="featured-article">
                  <ArticleCard article={featured} featured />
                </div>
              </Reveal>
            )}
            <div className="grid gap-px border border-white/8 bg-white/8 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((a, i) => (
                <Reveal key={a.slug} delay={(i % 3) * 0.06} className="h-full bg-[#0a0a0c]">
                  <ArticleCard article={a} />
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
