import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import SEO from "../components/SEO";
import { Reveal } from "../components/Motion";
import { ArticleCard, formatDate } from "../components/ArticleCard";
import { fetchArticle } from "../lib/api";
import { SOCIALS } from "../data/site";

function Block({ block }) {
  if (block.type === "heading")
    return <h2 className="pt-6 font-display text-2xl font-semibold tracking-tight text-white md:text-3xl">{block.text}</h2>;
  if (block.type === "quote")
    return (
      <blockquote className="border-l-2 border-cyan-electric py-2 pl-6 font-display text-xl font-medium leading-snug text-zinc-200 md:text-2xl">
        {block.text}
      </blockquote>
    );
  return <p className="text-base leading-[1.85] text-zinc-400 md:text-lg">{block.text}</p>;
}

export default function ArticlePage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setData(null);
    setError(false);
    fetchArticle(slug).then(setData).catch(() => setError(true));
  }, [slug]);

  if (error)
    return (
      <div className="mx-auto max-w-3xl px-5 py-48 text-center" data-testid="article-not-found">
        <h1 className="font-display text-3xl font-semibold text-white">Perspective not found</h1>
        <Link to="/perspective" className="mt-6 inline-flex items-center gap-2 text-sm text-cyan-electric" data-testid="article-back-link">
          <ArrowLeft className="h-4 w-4" /> Back to all perspectives
        </Link>
      </div>
    );

  if (!data)
    return (
      <div className="mx-auto max-w-3xl px-5 py-48 text-center font-mono-tech text-xs uppercase tracking-[0.3em] text-zinc-600" data-testid="article-loading">
        Loading…
      </div>
    );

  const { article, related } = data;
  const shareUrl = encodeURIComponent(window.location.href);

  return (
    <>
      <SEO
        title={article.seo_title || article.title}
        description={article.meta_description || article.subtitle}
        path={`/perspective/${article.slug}`}
        type="article"
        article={article}
      />
      <article className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:pt-44" data-testid="article-page">
        <Reveal>
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono-tech text-[10px] uppercase tracking-[0.2em] text-zinc-600">
            <Link to="/" className="hover:text-white transition-colors" data-testid="breadcrumb-home">AURA</Link>
            <span>/</span>
            <Link to="/perspective" className="hover:text-white transition-colors" data-testid="breadcrumb-perspective">Perspective</Link>
            <span>/</span>
            <span className="text-zinc-400">{article.category}</span>
          </nav>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono-tech text-[10px] uppercase tracking-[0.22em]">
            <span className="text-cyan-electric">{article.category}</span>
            <span className="text-zinc-600">{article.reading_time} min read</span>
            <span className="text-zinc-600">{formatDate(article.published_at)}</span>
            {article.is_draft_content && (
              <span className="border border-white/15 px-2 py-0.5 text-[9px] text-zinc-500">Draft — awaiting Abhijit's review</span>
            )}
          </div>
        </Reveal>
        <Reveal delay={0.14}>
          <h1 className="mt-6 font-display text-3xl font-bold leading-[1.12] tracking-tighter text-white sm:text-4xl md:text-5xl" data-testid="article-title">
            {article.title}
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 text-lg leading-relaxed text-zinc-400 md:text-xl">{article.subtitle}</p>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="mt-8 flex items-center justify-between border-y border-white/8 py-4">
            <p className="text-sm text-zinc-400">
              By <span className="font-medium text-white">{article.author}</span>
            </p>
            <div className="flex gap-4 font-mono-tech text-[10px] uppercase tracking-[0.2em]">
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noopener noreferrer" data-testid="share-linkedin" className="text-zinc-500 transition-colors hover:text-cyan-electric">
                Share
              </a>
              <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer" data-testid="share-x" className="text-zinc-500 transition-colors hover:text-cyan-electric">
                Post
              </a>
            </div>
          </div>
        </Reveal>
        <div className="mt-12 space-y-7" data-testid="article-body">
          {article.body.map((b, i) => (
            <Reveal key={i} delay={0.02 * Math.min(i, 4)} y={16}>
              <Block block={b} />
            </Reveal>
          ))}
        </div>
        <div className="mt-14 flex flex-wrap gap-2">
          {article.tags.map((t) => (
            <span key={t} className="border border-white/10 px-3 py-1.5 font-mono-tech text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              {t}
            </span>
          ))}
        </div>
      </article>

      <section className="border-t border-white/8 bg-surface" data-testid="related-articles">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Continue the thread
            </h2>
            <div className="flex gap-5 font-mono-tech text-[11px] uppercase tracking-[0.2em]">
              <a href={SOCIALS.linkedin} data-testid="article-follow-linkedin" className="group inline-flex items-center gap-1.5 text-zinc-400 transition-colors hover:text-cyan-electric">
                Follow on LinkedIn <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a href={SOCIALS.youtube} data-testid="article-watch-youtube" className="group inline-flex items-center gap-1.5 text-zinc-400 transition-colors hover:text-cyan-electric">
                Watch on YouTube <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
          <div className="mt-10 grid gap-px border border-white/8 bg-white/8 md:grid-cols-3">
            {related.map((a) => (
              <div key={a.slug} className="h-full bg-[#0a0a0c]">
                <ArticleCard article={a} />
              </div>
            ))}
            {related.length === 0 && (
              <p className="col-span-3 bg-[#0a0a0c] p-10 text-center text-sm text-zinc-500">
                More perspectives are on the way.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
