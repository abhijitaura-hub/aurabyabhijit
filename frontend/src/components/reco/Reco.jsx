import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { mediaUrl } from "../../lib/api";

// Site's existing pill-tag visual language (red dot + uppercase tracked mono label)
export function PillTag({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-2 border border-white/12 bg-black/60 px-3 py-1.5 font-mono-tech text-[9px] uppercase tracking-[0.18em] text-zinc-300 ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-crimson" aria-hidden="true" />
      {children}
    </span>
  );
}

export function CategoryTile({ num, name, description, slug }) {
  return (
    <Link
      to={`/recommendations/${slug}`}
      data-testid={`reco-category-${slug}`}
      className="group flex h-full flex-col border border-white/8 bg-surface p-6 transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-crimson/50 focus-visible:-translate-y-1 md:p-7"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 border border-white/12 bg-black/60 px-3 py-1.5 font-mono-tech text-[9px] uppercase tracking-[0.18em] text-zinc-300">
          <span className="h-1.5 w-1.5 rounded-full bg-crimson" aria-hidden="true" />
          {name}
        </span>
        <span className="font-mono-tech text-xs text-zinc-600">{num}</span>
      </div>
      <p className="mt-5 text-sm leading-relaxed text-zinc-500">{description}</p>
      <span className="mt-auto pt-5 text-zinc-700 transition-colors duration-300 group-hover:text-crimson">
        <ArrowUpRight className="h-4 w-4" />
      </span>
    </Link>
  );
}

export function RecoCard({ item }) {
  return (
    <Link
      to={`/recommendations/${item.category}/${item.slug}`}
      data-testid={`reco-card-${item.slug}`}
      className="group flex h-full flex-col border border-white/8 bg-surface p-6 transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-crimson/50 focus-visible:-translate-y-1 md:p-8"
    >
      {item.image && (
        <div className="-m-6 mb-6 overflow-hidden border-b border-white/8 md:-m-8 md:mb-8">
          <img
            src={mediaUrl(item.image)}
            alt={item.name}
            loading="lazy"
            className="aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {item.badge && <PillTag>{item.badge}</PillTag>}
        {item.aura_score != null && (
          <span className="ml-auto font-display text-2xl font-semibold tracking-tight text-white" data-testid={`reco-score-${item.slug}`}>
            {item.aura_score.toFixed(1)}
            <span className="ml-1 font-mono-tech text-[9px] uppercase tracking-[0.18em] text-zinc-500">AURA Score™</span>
          </span>
        )}
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold tracking-tight text-white transition-colors duration-300 group-hover:text-crimson md:text-2xl">
        {item.name}
      </h3>
      {item.description && <p className="mt-3 text-sm leading-relaxed text-zinc-500">{item.description}</p>}
      {item.best_for && (
        <p className="mt-4 text-xs text-zinc-400">
          <span className="font-mono-tech text-[9px] uppercase tracking-[0.2em] text-zinc-600">Best for — </span>
          {item.best_for}
        </p>
      )}
      {(item.pros?.length > 0 || item.cons?.length > 0) && (
        <ul className="mt-4 space-y-1.5 text-xs leading-relaxed">
          {(item.pros || []).slice(0, 2).map((p) => (
            <li key={p} className="flex items-start gap-2 text-zinc-400">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-crimson" aria-hidden="true" />
              {p}
            </li>
          ))}
          {(item.cons || []).slice(0, 1).map((c) => (
            <li key={c} className="flex items-start gap-2 text-zinc-600">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-700" aria-hidden="true" />
              {c}
            </li>
          ))}
        </ul>
      )}
      <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-medium text-zinc-400 transition-colors duration-300 group-hover:text-white">
        View Recommendation
        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
