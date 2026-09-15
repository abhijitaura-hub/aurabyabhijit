import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { mediaUrl } from "../lib/api";

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function ArticleCard({ article, featured = false }) {
  return (
    <Link
      to={`/perspective/${article.slug}`}
      data-testid={`article-card-${article.slug}`}
      className={`group flex h-full flex-col border border-white/8 bg-surface p-6 transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-crimson/50 focus-visible:-translate-y-1 md:p-8 ${
        featured ? "md:flex-row md:items-end md:justify-between md:gap-12" : ""
      }`}
    >
      {article.hero_image && (
        <div className={`-m-6 mb-6 overflow-hidden border-b border-white/8 md:-m-8 md:mb-8 ${featured ? "md:mb-8" : ""}`}>
          <img
            src={mediaUrl(article.hero_image)}
            alt={`Cover image for ${article.title}`}
            loading="lazy"
            className="aspect-[16/8] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </div>
      )}
      <div className={featured ? "max-w-2xl" : ""}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono-tech text-[10px] uppercase tracking-[0.22em]">
          <span className="text-crimson">{article.category}</span>
          <span className="text-zinc-600">{article.reading_time} min read</span>
          <span className="text-zinc-600">{formatDate(article.published_at)}</span>
        </div>
        <h3
          className={`mt-4 font-display font-semibold tracking-tight text-white transition-colors duration-300 group-hover:text-crimson ${
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
