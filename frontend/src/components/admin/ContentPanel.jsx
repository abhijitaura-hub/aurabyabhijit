import { useEffect, useState } from "react";
import { CheckCircle2, Save } from "lucide-react";
import { fetchSettings, updateSettings, uploadArticleImage, mediaUrl, formatApiError } from "../../lib/api";
import { DEFAULT_CONTENT } from "../../lib/settings";

const inputCls =
  "w-full border border-white/12 bg-transparent px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-crimson focus:outline-none";
const labelCls = "mb-2 block font-mono-tech text-[10px] uppercase tracking-[0.2em] text-zinc-500";
const groupCls = "font-mono-tech text-[10px] uppercase tracking-[0.24em] text-crimson";

const HOME_FIELDS = [
  { key: "hero_eyebrow", label: "Hero eyebrow", hint: "small red line above the headline" },
  { key: "why_aura_title", label: "Why I Built AURA — heading" },
  { key: "ask_aura_title", label: "Ask AURA — heading" },
  { key: "ask_aura_support", label: "Ask AURA — supporting line (directly under the heading)" },
  { key: "ask_aura_button", label: "Ask AURA — button label" },
];

export default function ContentPanel({ token }) {
  const [raw, setRaw] = useState(null);
  const [c, setC] = useState(null);
  const [aboutPortrait, setAboutPortrait] = useState("");
  const [portraitFile, setPortraitFile] = useState(null);
  const [portraitPreview, setPortraitPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSettings()
      .then((s) => {
        setRaw(s);
        const ct = s.content || {};
        const arr = (key) => (Array.isArray(ct[key]) && ct[key].length ? ct[key] : DEFAULT_CONTENT[key]);
        setC({
          hero_eyebrow: ct.hero_eyebrow || DEFAULT_CONTENT.hero_eyebrow,
          why_aura_title: ct.why_aura_title || DEFAULT_CONTENT.why_aura_title,
          why_aura_p1: ct.why_aura_p1 || DEFAULT_CONTENT.why_aura_p1,
          why_aura_p2: ct.why_aura_p2 || DEFAULT_CONTENT.why_aura_p2,
          ask_aura_title: ct.ask_aura_title || DEFAULT_CONTENT.ask_aura_title,
          ask_aura_support: ct.ask_aura_support || DEFAULT_CONTENT.ask_aura_support,
          ask_aura_text: ct.ask_aura_text || DEFAULT_CONTENT.ask_aura_text,
          ask_aura_button: ct.ask_aura_button || DEFAULT_CONTENT.ask_aura_button,
          share_items: arr("share_items").map((x) => ({ title: x.title || "", text: x.text || "" })),
          chat_suggestions: arr("chat_suggestions").slice(0, 3),
          bio_text: arr("bio_paragraphs").join("\n\n"),
          topics_text: arr("contact_topics").join("\n"),
        });
        setAboutPortrait(s.about_portrait || "");
      })
      .catch(() => setError("Could not load current content."))
      .finally(() => {});
  }, []);

  if (!c)
    return (
      <p className="py-20 text-center font-mono-tech text-xs uppercase tracking-[0.3em] text-zinc-600" data-testid="content-loading">
        {error || "Loading…"}
      </p>
    );

  const set = (k) => (e) => setC((prev) => ({ ...prev, [k]: e.target.value }));

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const content = { ...((raw && raw.content) || {}) };
      const setOrDel = (k, v, def) => {
        const t = (v || "").trim();
        if (t && t !== def) content[k] = t;
        else delete content[k];
      };
      HOME_FIELDS.forEach((f) => setOrDel(f.key, c[f.key], DEFAULT_CONTENT[f.key]));
      setOrDel("why_aura_p1", c.why_aura_p1, DEFAULT_CONTENT.why_aura_p1);
      setOrDel("why_aura_p2", c.why_aura_p2, DEFAULT_CONTENT.why_aura_p2);
      setOrDel("ask_aura_text", c.ask_aura_text, DEFAULT_CONTENT.ask_aura_text);
      const items = c.share_items
        .map((x) => ({ title: x.title.trim(), text: x.text.trim() }))
        .filter((x) => x.title);
      if (items.length && JSON.stringify(items) !== JSON.stringify(DEFAULT_CONTENT.share_items)) content.share_items = items;
      else delete content.share_items;
      const sugs = c.chat_suggestions.map((s) => s.trim()).filter(Boolean);
      if (sugs.length && JSON.stringify(sugs) !== JSON.stringify(DEFAULT_CONTENT.chat_suggestions)) content.chat_suggestions = sugs;
      else delete content.chat_suggestions;
      const bio = c.bio_text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
      if (bio.length && JSON.stringify(bio) !== JSON.stringify(DEFAULT_CONTENT.bio_paragraphs)) content.bio_paragraphs = bio;
      else delete content.bio_paragraphs;
      const topics = c.topics_text.split("\n").map((t) => t.trim()).filter(Boolean);
      if (topics.length && JSON.stringify(topics) !== JSON.stringify(DEFAULT_CONTENT.contact_topics)) content.contact_topics = topics;
      else delete content.contact_topics;

      let ap = aboutPortrait;
      if (portraitFile) {
        const up = await uploadArticleImage(token, portraitFile);
        ap = up.path;
      }
      await updateSettings(token, {
        phone: raw?.phone || null,
        public_email: raw?.public_email || null,
        linkedin: raw?.linkedin || null,
        youtube: raw?.youtube || null,
        facebook: raw?.facebook || null,
        booking_url: raw?.booking_url || null,
        whatsapp: raw?.whatsapp || null,
        disclosure_text: raw?.disclosure_text || null,
        hero_portrait: raw?.hero_portrait || null,
        about_portrait: ap || null,
        content,
      });
      setRaw((prev) => ({ ...(prev || {}), content, about_portrait: ap || null }));
      setAboutPortrait(ap);
      setPortraitFile(null);
      setPortraitPreview("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(formatApiError(err, "Could not save content."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-10 max-w-2xl" data-testid="content-panel">
      <p className="text-sm text-zinc-500">
        Homepage, About and Contact copy. These values update the live site the moment you save — no redeploy needed.
      </p>
      <form onSubmit={onSave} className="mt-8 space-y-8 border border-white/8 bg-surface p-7 md:p-10" data-testid="content-form">
        {/* ---------- Homepage ---------- */}
        <div>
          <p className={groupCls}>Homepage</p>
          <div className="mt-5 space-y-5">
            {HOME_FIELDS.map((f) => (
              <div key={f.key}>
                <label htmlFor={`wc-${f.key}`} className={labelCls}>{f.label}</label>
                <input id={`wc-${f.key}`} value={c[f.key]} onChange={set(f.key)} className={inputCls} data-testid={`wc-${f.key}-input`} />
              </div>
            ))}
            <div>
              <label htmlFor="wc-why-aura-p1" className={labelCls}>Why I Built AURA — paragraph 1</label>
              <textarea id="wc-why-aura-p1" rows={3} value={c.why_aura_p1} onChange={set("why_aura_p1")} className={`${inputCls} resize-y`} data-testid="wc-why_aura_p1-input" />
            </div>
            <div>
              <label htmlFor="wc-why-aura-p2" className={labelCls}>Why I Built AURA — paragraph 2</label>
              <textarea id="wc-why-aura-p2" rows={3} value={c.why_aura_p2} onChange={set("why_aura_p2")} className={`${inputCls} resize-y`} data-testid="wc-why_aura_p2-input" />
            </div>
            <div>
              <label htmlFor="wc-ask-aura-text" className={labelCls}>Ask AURA — invitation text</label>
              <textarea id="wc-ask-aura-text" rows={2} value={c.ask_aura_text} onChange={set("ask_aura_text")} className={`${inputCls} resize-y`} data-testid="wc-ask_aura_text-input" />
            </div>
            <div>
              <span className={labelCls}>What I Share — six items</span>
              <div className="space-y-3">
                {c.share_items.map((item, i) => (
                  <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1.4fr]">
                    <input
                      value={item.title}
                      aria-label={`What I Share item ${i + 1} title`}
                      onChange={(e) =>
                        setC((prev) => {
                          const share_items = prev.share_items.map((x, j) => (j === i ? { ...x, title: e.target.value } : x));
                          return { ...prev, share_items };
                        })
                      }
                      className={inputCls}
                      data-testid={`wc-share-${i}-title`}
                    />
                    <input
                      value={item.text}
                      aria-label={`What I Share item ${i + 1} description`}
                      onChange={(e) =>
                        setC((prev) => {
                          const share_items = prev.share_items.map((x, j) => (j === i ? { ...x, text: e.target.value } : x));
                          return { ...prev, share_items };
                        })
                      }
                      className={inputCls}
                      data-testid={`wc-share-${i}-text`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ---------- AURA Chat ---------- */}
        <div className="border-t border-white/8 pt-6">
          <p className={groupCls}>AURA Chat</p>
          <div className="mt-5 space-y-3">
            <span className={labelCls}>Suggestion chips — 3 starter questions</span>
            {c.chat_suggestions.map((s, i) => (
              <input
                key={i}
                value={s}
                aria-label={`Chat suggestion ${i + 1}`}
                onChange={(e) =>
                  setC((prev) => {
                    const chat_suggestions = prev.chat_suggestions.map((x, j) => (j === i ? e.target.value : x));
                    return { ...prev, chat_suggestions };
                  })
                }
                className={inputCls}
                data-testid={`wc-chat-suggestion-${i}`}
              />
            ))}
          </div>
        </div>

        {/* ---------- About ---------- */}
        <div className="border-t border-white/8 pt-6">
          <p className={groupCls}>About</p>
          <div className="mt-5 space-y-5">
            <div className="border border-white/10 p-5" data-testid="about-portrait-setting">
              <span className={labelCls}>About Profile Image</span>
              <p className="mb-4 text-xs text-zinc-600">This image appears on the About page and in the homepage About section.</p>
              <div className="flex flex-wrap items-start gap-5">
                <img
                  src={portraitPreview || (aboutPortrait ? mediaUrl(aboutPortrait) : "/assets/portrait-cutout.png")}
                  alt="Current About profile"
                  className="h-36 w-32 border border-white/10 object-cover object-top"
                  data-testid="about-portrait-preview"
                />
                <div>
                  <label
                    htmlFor="about-portrait-input"
                    className="inline-flex cursor-pointer items-center gap-2 border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition-colors duration-300 hover:border-crimson hover:text-crimson"
                    data-testid="about-portrait-replace"
                  >
                    Replace Image
                  </label>
                  <input
                    id="about-portrait-input"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    data-testid="about-portrait-input"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
                        setError("Please choose a JPG, PNG or WebP image.");
                        return;
                      }
                      if (f.size > 8 * 1024 * 1024) {
                        setError("Image must be under 8 MB.");
                        return;
                      }
                      setError("");
                      setPortraitFile(f);
                      setPortraitPreview((prev) => {
                        if (prev) URL.revokeObjectURL(prev);
                        return URL.createObjectURL(f);
                      });
                    }}
                  />
                  <p className="mt-2 max-w-xs text-xs leading-relaxed text-zinc-600">
                    Upload a JPG, PNG or WebP image (up to 8 MB). Transparent-background cutouts work best with the current design.
                  </p>
                  {portraitFile && (
                    <p className="mt-2 text-xs text-crimson" data-testid="about-portrait-staged">
                      New image selected — press Save Content to publish it.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="wc-bio" className={labelCls}>
                Biography <span className="text-zinc-700 normal-case tracking-normal">— one paragraph per blank line; **bold** and *italic* markers supported</span>
              </label>
              <textarea id="wc-bio" rows={10} value={c.bio_text} onChange={set("bio_text")} className={`${inputCls} resize-y`} data-testid="wc-bio-input" />
            </div>
          </div>
        </div>

        {/* ---------- Contact ---------- */}
        <div className="border-t border-white/8 pt-6">
          <p className={groupCls}>Contact</p>
          <div className="mt-5">
            <label htmlFor="wc-topics" className={labelCls}>
              Contact topic options <span className="text-zinc-700 normal-case tracking-normal">— one per line</span>
            </label>
            <textarea id="wc-topics" rows={8} value={c.topics_text} onChange={set("topics_text")} className={`${inputCls} resize-y`} data-testid="wc-topics-input" />
          </div>
        </div>

        {error && (
          <p className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert" data-testid="content-error">
            {error}
          </p>
        )}
        {saved && (
          <p className="flex items-center gap-2 border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300" data-testid="content-saved">
            <CheckCircle2 className="h-4 w-4" /> Saved — live on the site now.
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-white px-6 py-3.5 text-sm font-semibold text-black transition-colors duration-300 hover:bg-crimson hover:text-white disabled:opacity-60"
          data-testid="content-save-button"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save Content"}
        </button>
      </form>
    </div>
  );
}
