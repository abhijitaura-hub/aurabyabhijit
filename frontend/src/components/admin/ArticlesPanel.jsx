import { useEffect, useState } from "react";
import { Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { fetchAdminArticles, createArticle, updateArticle, deleteArticle, formatApiError } from "../../lib/api";
import { formatDate } from "../ArticleCard";

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  category: "",
  tags: "",
  slug: "",
  status: "draft",
  featured: false,
  seo_title: "",
  meta_description: "",
  bodyText: "",
};

function blocksToText(body) {
  return (body || [])
    .map((b) => (b.type === "heading" ? `## ${b.text}` : b.type === "quote" ? `> ${b.text}` : b.text))
    .join("\n\n");
}

function textToBlocks(text) {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      if (p.startsWith("## ")) return { type: "heading", text: p.slice(3).trim() };
      if (p.startsWith("> ")) return { type: "quote", text: p.slice(2).trim() };
      return { type: "paragraph", text: p };
    });
}

const inputCls =
  "w-full border border-white/12 bg-transparent px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-crimson focus:outline-none";
const labelCls = "mb-2 block font-mono-tech text-[10px] uppercase tracking-[0.2em] text-zinc-500";

export default function ArticlesPanel({ token }) {
  const [articles, setArticles] = useState(null);
  const [editing, setEditing] = useState(null); // null | "new" | article object
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => fetchAdminArticles(token).then(setArticles).catch(() => setArticles([]));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const openNew = () => {
    setForm(EMPTY_FORM);
    setError("");
    setEditing("new");
  };

  const openEdit = (a) => {
    setForm({
      title: a.title,
      subtitle: a.subtitle || "",
      category: a.category,
      tags: (a.tags || []).join(", "),
      slug: a.slug,
      status: a.status,
      featured: !!a.featured,
      seo_title: a.seo_title || "",
      meta_description: a.meta_description || "",
      bodyText: blocksToText(a.body),
    });
    setError("");
    setEditing(a);
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      title: form.title,
      subtitle: form.subtitle,
      category: form.category,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      slug: form.slug || undefined,
      status: form.status,
      featured: form.featured,
      seo_title: form.seo_title,
      meta_description: form.meta_description,
      body: textToBlocks(form.bodyText),
    };
    try {
      if (editing === "new") await createArticle(token, payload);
      else await updateArticle(token, editing.id, payload);
      setEditing(null);
      await load();
    } catch (err) {
      setError(formatApiError(err, "Could not save the article."));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (a) => {
    if (!window.confirm(`Delete "${a.title}"? This cannot be undone.`)) return;
    try {
      await deleteArticle(token, a.id);
      await load();
    } catch (err) {
      alert(formatApiError(err, "Could not delete the article."));
    }
  };

  if (articles === null)
    return <p className="py-20 text-center font-mono-tech text-xs uppercase tracking-[0.3em] text-zinc-600" data-testid="articles-loading">Loading…</p>;

  if (editing)
    return (
      <div className="mt-10 border border-white/8 bg-surface p-7 md:p-10" data-testid="article-editor">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-white">
            {editing === "new" ? "New perspective" : `Editing: ${editing.title}`}
          </h2>
          <button onClick={() => setEditing(null)} className="flex h-10 w-10 items-center justify-center border border-white/15 text-zinc-400 hover:border-white/40 hover:text-white" aria-label="Close editor" data-testid="editor-close-button">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={onSave} className="mt-8 space-y-5">
          <div>
            <label htmlFor="ed-title" className={labelCls}>Title</label>
            <input id="ed-title" required minLength={3} value={form.title} onChange={set("title")} className={inputCls} data-testid="editor-title-input" />
          </div>
          <div>
            <label htmlFor="ed-subtitle" className={labelCls}>Subtitle</label>
            <input id="ed-subtitle" value={form.subtitle} onChange={set("subtitle")} className={inputCls} data-testid="editor-subtitle-input" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="ed-category" className={labelCls}>Category</label>
              <input id="ed-category" required minLength={2} value={form.category} onChange={set("category")} placeholder="e.g. AI Strategy" className={inputCls} data-testid="editor-category-input" />
            </div>
            <div>
              <label htmlFor="ed-tags" className={labelCls}>Tags <span className="text-zinc-700">— comma separated</span></label>
              <input id="ed-tags" value={form.tags} onChange={set("tags")} placeholder="AI, Strategy" className={inputCls} data-testid="editor-tags-input" />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="ed-slug" className={labelCls}>Slug <span className="text-zinc-700">— optional</span></label>
              <input id="ed-slug" value={form.slug} onChange={set("slug")} placeholder="auto-from-title" className={inputCls} data-testid="editor-slug-input" />
            </div>
            <div>
              <label htmlFor="ed-status" className={labelCls}>Status</label>
              <select id="ed-status" value={form.status} onChange={set("status")} className={`${inputCls} appearance-none bg-surface`} data-testid="editor-status-select">
                <option value="draft" className="bg-[#121217]">Draft (hidden)</option>
                <option value="published" className="bg-[#121217]">Published (live)</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-zinc-300" data-testid="editor-featured-toggle">
                <input type="checkbox" checked={form.featured} onChange={set("featured")} className="h-4 w-4 accent-[#ff2e3e]" />
                Featured article
              </label>
            </div>
          </div>
          <div>
            <label htmlFor="ed-body" className={labelCls}>Body</label>
            <textarea
              id="ed-body"
              rows={14}
              value={form.bodyText}
              onChange={set("bodyText")}
              className={`${inputCls} resize-y font-mono-tech text-[13px] leading-relaxed`}
              placeholder={"Write here. A blank line starts a new paragraph.\nStart a line with ## for a heading.\nStart a line with > for a pull quote."}
              data-testid="editor-body-input"
            />
          </div>
          <details className="border border-white/8 px-4 py-3">
            <summary className="cursor-pointer font-mono-tech text-[10px] uppercase tracking-[0.2em] text-zinc-500">SEO settings — optional</summary>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="ed-seo-title" className={labelCls}>SEO title</label>
                <input id="ed-seo-title" value={form.seo_title} onChange={set("seo_title")} className={inputCls} data-testid="editor-seo-title-input" />
              </div>
              <div>
                <label htmlFor="ed-meta" className={labelCls}>Meta description</label>
                <textarea id="ed-meta" rows={2} value={form.meta_description} onChange={set("meta_description")} className={`${inputCls} resize-y`} data-testid="editor-meta-input" />
              </div>
            </div>
          </details>
          {error && (
            <p className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert" data-testid="editor-error">{error}</p>
          )}
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="bg-white px-6 py-3.5 text-sm font-semibold text-black transition-colors duration-300 hover:bg-crimson hover:text-white disabled:opacity-60" data-testid="editor-save-button">
              {saving ? "Saving…" : form.status === "published" ? "Save & Publish" : "Save Draft"}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="border border-white/20 px-6 py-3.5 text-sm text-zinc-300 hover:border-white/50" data-testid="editor-cancel-button">
              Cancel
            </button>
          </div>
        </form>
      </div>
    );

  return (
    <div className="mt-10" data-testid="articles-panel">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{articles.length} article{articles.length === 1 ? "" : "s"}</p>
        <button onClick={openNew} className="inline-flex items-center gap-2 bg-white px-5 py-3 text-sm font-semibold text-black transition-colors duration-300 hover:bg-crimson hover:text-white" data-testid="new-article-button">
          <Plus className="h-4 w-4" /> New Perspective
        </button>
      </div>
      {articles.length === 0 ? (
        <p className="mt-8 border border-dashed border-white/15 p-16 text-center text-sm text-zinc-500" data-testid="articles-empty">
          No articles yet. Write your first perspective.
        </p>
      ) : (
        <ul className="mt-6 space-y-px border border-white/8 bg-white/8" data-testid="articles-list">
          {articles.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-4 bg-[#0a0a0c] p-5 md:p-6" data-testid={`article-row-${a.slug}`}>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-display text-base font-semibold text-white">
                  {a.featured && <Star className="h-3.5 w-3.5 fill-crimson text-crimson" aria-label="Featured" />}
                  <span className="truncate">{a.title}</span>
                </p>
                <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono-tech text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  <span className="text-crimson">{a.category}</span>
                  <span>{formatDate(a.published_at)}</span>
                  <span className={a.status === "published" ? "text-emerald-400" : "text-amber-400"}>
                    {a.status === "published" ? "Live" : "Draft"}
                  </span>
                  <span>{a.reading_time} min</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(a)} className="inline-flex items-center gap-1.5 border border-white/15 px-4 py-2.5 text-xs text-zinc-300 transition-colors hover:border-white/50 hover:text-white" data-testid={`edit-article-${a.slug}`}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button onClick={() => onDelete(a)} className="inline-flex items-center gap-1.5 border border-red-500/30 px-4 py-2.5 text-xs text-red-400 transition-colors hover:border-red-500/70" data-testid={`delete-article-${a.slug}`}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
