import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function ArticleCard({ article, featured = false }) {
  return (
    <Link
      to={`/perspective/${article.slug}`}
      data-testid={`article-card-${article.slug}`}
      className={`group flex h-full flex-col border border-white/8 bg-surface p-6 transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-cyan-electric/50 focus-visible:-translate-y-1 md:p-8 ${
        featured ? "md:flex-row md:items-end md:justify-between md:gap-12" : ""
      }`}
    >
      <div className={featured ? "max-w-2xl" : ""}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono-tech text-[10px] uppercase tracking-[0.22em]">
          <span className="text-cyan-electric">{article.category}</span>
          <span className="text-zinc-600">{article.reading_time} min read</span>
          <span className="text-zinc-600">{formatDate(article.published_at)}</span>
          {article.is_draft_content && (
            <span className="border border-white/15 px-2 py-0.5 text-[9px] text-zinc-500">Draft — awaiting review</span>
          )}
        </div>
        <h3
          className={`mt-4 font-display font-semibold tracking-tight text-white transition-colors duration-300 group-hover:text-cyan-electric ${
            featured ? "text-2xl md:text-4xl" : "text-xl md:text-2xl"
          }`}
        >
          {article.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-zinc-500 md:text-base">{article.subtitle}</p>
      </div>
      <span
        className={`mt-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors duration-300 group-hover:text-white ${
          featured ? "md:mb-1 md:shrink-0" : ""
        }`}
      >
        Read the perspective
        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
