import { useEffect, useRef, useState } from "react";
import { ImagePlus, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import {
  fetchAdminRecommendations, fetchRecoCategories, createRecommendation, updateRecommendation,
  deleteRecommendation, createRecoCategory, uploadArticleImage, mediaUrl, formatApiError,
} from "../../lib/api";

const STATUSES = ["draft", "review", "approved", "published", "update_required", "archived"];
const STATUS_LABEL = {
  draft: "Draft (hidden)", review: "In Review (hidden)", approved: "Approved (hidden)", published: "Published (LIVE on site)",
  update_required: "Update Required (hidden)", archived: "Archived (hidden)",
};
const BADGES = ["", "AURA PICK", "AURA VALUE", "AURA PRO"];
const SUB_SCORES = [
  ["performance", "Performance"], ["reliability", "Reliability"], ["value", "Value"],
  ["ease_of_use", "Ease of Use"], ["professional_suitability", "Professional Suitability"],
];

const EMPTY = {
  name: "", category: "", description: "", image: "", aura_score: "", sub_scores: {},
  badge: "", prosText: "", consText: "", best_for: "", avoid_if: "", verdict: "",
  merchant_name: "", product_url: "", affiliate_url: "", affiliate_enabled: false, disclosure_override: "",
  status: "draft", featured: false, sort_order: 0, setup_group: "", slug: "",
};

const inputCls =
  "w-full border border-white/12 bg-transparent px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-crimson focus:outline-none";
const labelCls = "mb-2 block font-mono-tech text-[10px] uppercase tracking-[0.2em] text-zinc-500";

export default function RecommendationsPanel({ token }) {
  const [items, setItems] = useState(null);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [newCat, setNewCat] = useState("");
  const fileRef = useRef(null);

  const load = () => {
    fetchAdminRecommendations(token).then(setItems).catch(() => setItems([]));
    fetchRecoCategories().then(setCategories).catch(() => {});
  };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const setSub = (k) => (e) =>
    setForm((f) => ({ ...f, sub_scores: { ...f.sub_scores, [k]: e.target.value } }));

  const openNew = () => { setForm({ ...EMPTY, category: categories[0]?.slug || "" }); setError(""); setEditing("new"); };

  const openEdit = (r) => {
    const m = r.merchants?.[0] || {};
    setForm({
      name: r.name, category: r.category, description: r.description || "", image: r.image || "",
      aura_score: r.aura_score ?? "", sub_scores: r.sub_scores || {}, badge: r.badge || "",
      prosText: (r.pros || []).join("\n"), consText: (r.cons || []).join("\n"),
      best_for: r.best_for || "", avoid_if: r.avoid_if || "", verdict: r.verdict || "",
      merchant_name: m.name || "", product_url: m.product_url || "", affiliate_url: m.affiliate_url || "",
      affiliate_enabled: !!m.affiliate_enabled, disclosure_override: m.disclosure_override || "",
      status: r.status, featured: !!r.featured, sort_order: r.sort_order || 0,
      setup_group: r.setup_group || "", slug: r.slug,
    });
    setError("");
    setEditing(r);
  };

  const onPickImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const { path } = await uploadArticleImage(token, file);
      setForm((f) => ({ ...f, image: path }));
    } catch (err) {
      setError(formatApiError(err, "Image upload failed."));
    } finally {
      setUploading(false);
    }
  };

  const onAddCategory = async () => {
    if (!newCat.trim()) return;
    try {
      await createRecoCategory(token, { name: newCat.trim() });
      setNewCat("");
      fetchRecoCategories().then(setCategories);
    } catch (err) {
      setError(formatApiError(err, "Could not add category."));
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const subScores = {};
    Object.entries(form.sub_scores).forEach(([k, v]) => {
      const n = parseFloat(v);
      if (!isNaN(n) && n >= 1 && n <= 10) subScores[k] = n;
    });
    const payload = {
      name: form.name,
      category: form.category,
      description: form.description,
      image: form.image || undefined,
      aura_score: form.aura_score === "" ? null : parseFloat(form.aura_score),
      sub_scores: Object.keys(subScores).length ? subScores : null,
      badge: form.badge || null,
      pros: form.prosText.split("\n").map((s) => s.trim()).filter(Boolean),
      cons: form.consText.split("\n").map((s) => s.trim()).filter(Boolean),
      best_for: form.best_for, avoid_if: form.avoid_if, verdict: form.verdict,
      merchants: form.merchant_name.trim()
        ? [{
            name: form.merchant_name.trim(),
            product_url: form.product_url, affiliate_url: form.affiliate_url,
            affiliate_enabled: form.affiliate_enabled, disclosure_override: form.disclosure_override,
          }]
        : [],
      status: form.status, featured: form.featured,
      sort_order: parseInt(form.sort_order, 10) || 0,
      setup_group: form.setup_group || null,
      slug: form.slug || undefined,
    };
    try {
      if (editing === "new") await createRecommendation(token, payload);
      else await updateRecommendation(token, editing.id, payload);
      setEditing(null);
      await load();
    } catch (err) {
      setError(formatApiError(err, "Could not save the recommendation."));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (r) => {
    if (!window.confirm(`Delete "${r.name}"? This cannot be undone.`)) return;
    try {
      await deleteRecommendation(token, r.id);
      await load();
    } catch (err) {
      alert(formatApiError(err, "Could not delete."));
    }
  };

  if (items === null)
    return <p className="py-20 text-center font-mono-tech text-xs uppercase tracking-[0.3em] text-zinc-600" data-testid="reco-admin-loading">Loading…</p>;

  if (editing)
    return (
      <div className="mt-10 border border-white/8 bg-surface p-7 md:p-10" data-testid="reco-editor">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-white">
            {editing === "new" ? "New recommendation" : `Editing: ${editing.name}`}
          </h2>
          <button onClick={() => setEditing(null)} className="flex h-10 w-10 items-center justify-center border border-white/15 text-zinc-400 hover:border-white/40 hover:text-white" aria-label="Close editor" data-testid="reco-editor-close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={onSave} className="mt-8 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="rc-name" className={labelCls}>Name</label>
              <input id="rc-name" required minLength={2} value={form.name} onChange={set("name")} className={inputCls} data-testid="reco-name-input" />
            </div>
            <div>
              <label htmlFor="rc-category" className={labelCls}>Category</label>
              <select id="rc-category" required value={form.category} onChange={set("category")} className={`${inputCls} appearance-none bg-surface`} data-testid="reco-category-select">
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug} className="bg-[#121217]">{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="rc-desc" className={labelCls}>Short description</label>
            <textarea id="rc-desc" rows={2} value={form.description} onChange={set("description")} className={`${inputCls} resize-y`} data-testid="reco-desc-input" />
          </div>
          <div>
            <span className={labelCls}>Image <span className="text-zinc-700">— optional</span></span>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={onPickImage} className="hidden" data-testid="reco-image-input" />
            {form.image ? (
              <div className="relative border border-white/12" data-testid="reco-image-preview">
                <img src={mediaUrl(form.image)} alt="Recommendation preview" className="aspect-[16/9] w-full object-cover" />
                <button type="button" onClick={() => setForm((f) => ({ ...f, image: "" }))} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center border border-white/20 bg-black/70 text-white hover:border-red-500 hover:text-red-400" aria-label="Remove image" data-testid="reco-image-remove">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="flex w-full items-center justify-center gap-2 border border-dashed border-white/20 px-4 py-6 text-sm text-zinc-400 transition-colors hover:border-crimson hover:text-crimson disabled:opacity-60" data-testid="reco-image-upload">
                <ImagePlus className="h-5 w-5" /> {uploading ? "Uploading…" : "Upload an image"}
              </button>
            )}
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="rc-score" className={labelCls}>AURA Score™ <span className="text-zinc-700">(1.0–10.0)</span></label>
              <input id="rc-score" type="number" step="0.1" min="1" max="10" value={form.aura_score} onChange={set("aura_score")} className={inputCls} data-testid="reco-score-input" />
            </div>
            <div>
              <label htmlFor="rc-badge" className={labelCls}>Badge</label>
              <select id="rc-badge" value={form.badge} onChange={set("badge")} className={`${inputCls} appearance-none bg-surface`} data-testid="reco-badge-select">
                {BADGES.map((b) => (
                  <option key={b} value={b} className="bg-[#121217]">{b || "No badge"}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="rc-status" className={labelCls}>Workflow status</label>
              <select id="rc-status" value={form.status} onChange={set("status")} className={`${inputCls} appearance-none bg-surface`} data-testid="reco-status-select">
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-[#121217]">{STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
          </div>
          <details className="border border-white/8 px-4 py-3">
            <summary className="cursor-pointer font-mono-tech text-[10px] uppercase tracking-[0.2em] text-zinc-500">Sub-scores — optional</summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SUB_SCORES.map(([k, label]) => (
                <div key={k}>
                  <label htmlFor={`rc-sub-${k}`} className={labelCls}>{label}</label>
                  <input id={`rc-sub-${k}`} type="number" step="0.1" min="1" max="10" value={form.sub_scores[k] ?? ""} onChange={setSub(k)} className={inputCls} data-testid={`reco-sub-${k}`} />
                </div>
              ))}
            </div>
          </details>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="rc-pros" className={labelCls}>Key strengths <span className="text-zinc-700">— one per line</span></label>
              <textarea id="rc-pros" rows={3} value={form.prosText} onChange={set("prosText")} className={`${inputCls} resize-y`} data-testid="reco-pros-input" />
            </div>
            <div>
              <label htmlFor="rc-cons" className={labelCls}>Potential limitations <span className="text-zinc-700">— one per line</span></label>
              <textarea id="rc-cons" rows={3} value={form.consText} onChange={set("consText")} className={`${inputCls} resize-y`} data-testid="reco-cons-input" />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="rc-best" className={labelCls}>Best for</label>
              <input id="rc-best" value={form.best_for} onChange={set("best_for")} className={inputCls} data-testid="reco-best-input" />
            </div>
            <div>
              <label htmlFor="rc-avoid" className={labelCls}>Who should avoid it</label>
              <input id="rc-avoid" value={form.avoid_if} onChange={set("avoid_if")} className={inputCls} data-testid="reco-avoid-input" />
            </div>
          </div>
          <div>
            <label htmlFor="rc-verdict" className={labelCls}>AURA Verdict <span className="text-zinc-700">— editorial</span></label>
            <textarea id="rc-verdict" rows={3} value={form.verdict} onChange={set("verdict")} className={`${inputCls} resize-y`} data-testid="reco-verdict-input" />
          </div>
          <details className="border border-white/8 px-4 py-3">
            <summary className="cursor-pointer font-mono-tech text-[10px] uppercase tracking-[0.2em] text-zinc-500">Merchant & affiliate — optional</summary>
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="rc-merchant" className={labelCls}>Merchant name</label>
                  <input id="rc-merchant" value={form.merchant_name} onChange={set("merchant_name")} placeholder="e.g. Amazon India" className={inputCls} data-testid="reco-merchant-input" />
                </div>
                <div>
                  <label htmlFor="rc-product-url" className={labelCls}>Product URL <span className="text-zinc-700">— plain link</span></label>
                  <input id="rc-product-url" value={form.product_url} onChange={set("product_url")} placeholder="https://…" className={inputCls} data-testid="reco-product-url-input" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="rc-affiliate-url" className={labelCls}>Affiliate URL</label>
                  <input id="rc-affiliate-url" value={form.affiliate_url} onChange={set("affiliate_url")} placeholder="https://…" className={inputCls} data-testid="reco-affiliate-url-input" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-zinc-300" data-testid="reco-affiliate-toggle">
                    <input type="checkbox" checked={form.affiliate_enabled} onChange={set("affiliate_enabled")} className="h-4 w-4 accent-[#ff2e3e]" />
                    Affiliate link enabled
                  </label>
                </div>
              </div>
              <div>
                <label htmlFor="rc-disclosure" className={labelCls}>Disclosure override <span className="text-zinc-700">— only if a program requires its own wording</span></label>
                <textarea id="rc-disclosure" rows={2} value={form.disclosure_override} onChange={set("disclosure_override")} className={`${inputCls} resize-y`} data-testid="reco-disclosure-input" />
              </div>
            </div>
          </details>
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="rc-setup-group" className={labelCls}>Setup group <span className="text-zinc-700">— My Setup only</span></label>
              <input id="rc-setup-group" value={form.setup_group} onChange={set("setup_group")} placeholder="e.g. Computing, Audio" className={inputCls} data-testid="reco-setup-group-input" />
            </div>
            <div>
              <label htmlFor="rc-sort" className={labelCls}>Sort order</label>
              <input id="rc-sort" type="number" value={form.sort_order} onChange={set("sort_order")} className={inputCls} data-testid="reco-sort-input" />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-zinc-300" data-testid="reco-featured-toggle">
                <input type="checkbox" checked={form.featured} onChange={set("featured")} className="h-4 w-4 accent-[#ff2e3e]" />
                Featured
              </label>
            </div>
          </div>
          {error && (
            <p className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert" data-testid="reco-editor-error">{error}</p>
          )}
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="bg-white px-6 py-3.5 text-sm font-semibold text-black transition-colors duration-300 hover:bg-crimson hover:text-white disabled:opacity-60" data-testid="reco-save-button">
              {saving ? "Saving…" : form.status === "published" ? "Save & Publish Live" : "Save (stays hidden)"}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="border border-white/20 px-6 py-3.5 text-sm text-zinc-300 hover:border-white/50" data-testid="reco-cancel-button">
              Cancel
            </button>
          </div>
        </form>
      </div>
    );

  return (
    <div className="mt-10" data-testid="reco-admin-panel">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-zinc-500">{items.length} recommendation{items.length === 1 ? "" : "s"} · only "Published" appears on the site</p>
        <button onClick={openNew} className="inline-flex items-center gap-2 bg-white px-5 py-3 text-sm font-semibold text-black transition-colors duration-300 hover:bg-crimson hover:text-white" data-testid="new-reco-button">
          <Plus className="h-4 w-4" /> New Recommendation
        </button>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          placeholder="New category name…"
          className="border border-white/12 bg-transparent px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-crimson focus:outline-none"
          data-testid="new-category-input"
        />
        <button onClick={onAddCategory} className="border border-white/20 px-4 py-2.5 text-xs text-zinc-300 transition-colors hover:border-crimson hover:text-crimson" data-testid="add-category-button">
          + Add Category
        </button>
      </div>
      {categories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2" data-testid="reco-admin-categories" aria-label="Existing categories">
          {categories.map((c) => (
            <span
              key={c.slug}
              className="inline-flex items-center gap-2 border border-white/12 bg-black/60 px-3 py-1.5 font-mono-tech text-[9px] uppercase tracking-[0.18em] text-zinc-300"
              data-testid={`admin-category-${c.slug}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-crimson" aria-hidden="true" />
              {c.name}
            </span>
          ))}
        </div>
      )}
      {items.length === 0 ? (
        <p className="mt-8 border border-dashed border-white/15 p-16 text-center text-sm text-zinc-500" data-testid="reco-admin-empty">
          No recommendations yet. Add the first one when it's genuinely evaluated.
        </p>
      ) : (
        <ul className="mt-6 space-y-px border border-white/8 bg-white/8" data-testid="reco-admin-list">
          {items.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-4 bg-[#0a0a0c] p-5 md:p-6" data-testid={`reco-row-${r.slug}`}>
              {r.image && <img src={mediaUrl(r.image)} alt="" className="h-14 w-20 shrink-0 border border-white/10 object-cover" />}
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-display text-base font-semibold text-white">
                  {r.badge === "AURA PICK" && <Star className="h-3.5 w-3.5 fill-crimson text-crimson" aria-label="AURA PICK" />}
                  <span className="truncate">{r.name}</span>
                  {r.aura_score != null && <span className="font-mono-tech text-xs text-crimson">{r.aura_score.toFixed(1)}</span>}
                </p>
                <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono-tech text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  <span className="text-crimson">{r.category}</span>
                  {r.badge && <span>{r.badge}</span>}
                  <span className={r.status === "published" ? "text-emerald-400" : "text-amber-400"}>{STATUS_LABEL[r.status] || r.status}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href={`/recommendations/${r.category}/${r.slug}${r.status === "published" ? "" : "?preview=1"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 border border-white/15 px-4 py-2.5 text-xs text-zinc-300 transition-colors hover:border-crimson hover:text-crimson"
                  data-testid={`view-reco-${r.slug}`}
                >
                  {r.status === "published" ? "View" : "Preview"}
                </a>
                <button onClick={() => openEdit(r)} className="inline-flex items-center gap-1.5 border border-white/15 px-4 py-2.5 text-xs text-zinc-300 transition-colors hover:border-white/50 hover:text-white" data-testid={`edit-reco-${r.slug}`}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button onClick={() => onDelete(r)} className="inline-flex items-center gap-1.5 border border-red-500/30 px-4 py-2.5 text-xs text-red-400 transition-colors hover:border-red-500/70" data-testid={`delete-reco-${r.slug}`}>
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
