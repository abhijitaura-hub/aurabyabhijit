import { useEffect, useState } from "react";
import { CheckCircle2, Save } from "lucide-react";
import { fetchSettings, updateSettings, changePassword, formatApiError, uploadArticleImage, mediaUrl } from "../../lib/api";
import { DEFAULT_CONTENT } from "../../lib/settings";

const inputCls =
  "w-full border border-white/12 bg-transparent px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-crimson focus:outline-none";
const labelCls = "mb-2 block font-mono-tech text-[10px] uppercase tracking-[0.2em] text-zinc-500";

const FIELDS = [
  { key: "phone", label: "Phone number", placeholder: "+91 98XXX XXXXX", hint: "Shown on the Contact page" },
  { key: "public_email", label: "Public email", placeholder: "hello@aurabyabhijit.com", hint: "Shown on the Contact page" },
  { key: "linkedin", label: "LinkedIn URL", placeholder: "https://www.linkedin.com/in/…", hint: "Footer, Speaking page, articles" },
  { key: "youtube", label: "YouTube URL", placeholder: "https://www.youtube.com/@…", hint: "Footer, Speaking page, articles" },
  { key: "facebook", label: "Facebook URL", placeholder: "https://www.facebook.com/…", hint: "Footer" },
  { key: "booking_url", label: "Booking link", placeholder: "https://cal.com/abhijit or https://calendly.com/…", hint: "Shows Book a Call buttons across the site — leave blank to hide" },
  { key: "whatsapp", label: "WhatsApp number", placeholder: "9198XXXXXXXX", hint: "Country code + number, digits only — shows chat buttons site-wide" },
];

const CONTENT_FIELDS = [
  { key: "tagline", label: "Site tagline", placeholder: "Technology Leadership for an Intelligent Future." },
  { key: "hero_title_1", label: "Hero headline — line 1", placeholder: "Technology Leadership" },
  { key: "hero_title_2", label: "Hero headline — line 2 (red)", placeholder: "Intelligent Future." },
  { key: "credibility", label: "Hero credibility line", placeholder: "20+ Years in Technology Leadership" },
];

const LIST_EDITORS = [
  {
    key: "speaking_topics", label: "Speaking topics", hint: "one per line", rows: 5,
    serialize: (v) => (v || []).join("\n"),
    parse: (t) => t.split("\n").map((s) => s.trim()).filter(Boolean),
  },
  {
    key: "timeline", label: "Career timeline (About page)", hint: "one per line: Era | Note", rows: 7,
    serialize: (v) => (v || []).map((x) => `${x.era} | ${x.note}`).join("\n"),
    parse: (t) => t.split("\n").map((l) => l.split("|").map((s) => s.trim())).filter((p) => p[0]).map((p) => ({ era: p[0], note: p[1] || "" })),
  },
  {
    key: "advisory_areas", label: "Advisory areas (Work With Me)", hint: "one per line: Title | Description", rows: 6,
    serialize: (v) => (v || []).map((x) => `${x.title} | ${x.desc}`).join("\n"),
    parse: (t) => t.split("\n").map((l) => l.split("|").map((s) => s.trim())).filter((p) => p[0]).map((p) => ({ title: p[0], desc: p[1] || "" })),
  },
  {
    key: "dimensions", label: "Technology dimensions (Expertise)", hint: "one per line: Title | slug | Description | topic, topic, topic", rows: 6,
    serialize: (v) => (v || []).map((x) => `${x.title} | ${x.slug} | ${x.desc} | ${(x.topics || []).join(", ")}`).join("\n"),
    parse: (t) =>
      t.split("\n").map((l) => l.split("|").map((s) => s.trim())).filter((p) => p[0]).map((p) => ({
        title: p[0], slug: p[1] || "", desc: p[2] || "", topics: (p[3] || "").split(",").map((s) => s.trim()).filter(Boolean),
      })),
  },
  {
    key: "field_notes", label: "From the Field cards", hint: "one card per block; separate blocks with a line containing only --- ; inside use Tag: / Title: / Problem: / Thinking: / Approach: / Outcome:", rows: 12,
    serialize: (v) =>
      (v || []).map((x) => ["Tag", "Title", "Problem", "Thinking", "Approach", "Outcome"].map((k) => `${k}: ${x[k.toLowerCase()] || ""}`).join("\n")).join("\n---\n"),
    parse: (t) =>
      t.split(/\n\s*---\s*\n/).map((block) => {
        const obj = {};
        block.split("\n").forEach((line) => {
          const m = line.match(/^([A-Za-z]+):\s*(.*)$/);
          if (m) obj[m[1].toLowerCase()] = m[2].trim();
        });
        return obj;
      }).filter((o) => o.title),
  },
];

export default function SettingsPanel({ token }) {
  const [form, setForm] = useState({ phone: "", public_email: "", linkedin: "", youtube: "", facebook: "", booking_url: "", whatsapp: "", disclosure_text: "" });
  const [content, setContent] = useState({ tagline: "", description: "", hero_title_1: "", hero_title_2: "", hero_subcopy: "", credibility: "", stats: [] });
  const [listText, setListText] = useState({});
  const [pw, setPw] = useState({ current_password: "", new_password: "" });
  const [pwState, setPwState] = useState(null);
  const [portrait, setPortrait] = useState("");
  const [portraitFile, setPortraitFile] = useState(null);
  const [portraitPreview, setPortraitPreview] = useState("");
  const [aboutPortrait, setAboutPortrait] = useState("");
  const [rawContent, setRawContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSettings()
      .then((s) => {
        setPortrait(s.hero_portrait || "");
        setAboutPortrait(s.about_portrait || "");
        setRawContent(s.content || {});
        setForm({
          phone: s.phone || "",
          public_email: s.public_email || "",
          linkedin: s.linkedin || "",
          youtube: s.youtube || "",
          facebook: s.facebook || "",
          booking_url: s.booking_url || "",
          whatsapp: s.whatsapp || "",
          disclosure_text: s.disclosure_text || "",
        });
        const c = s.content || {};
        setContent({
          tagline: c.tagline || "",
          description: c.description || "",
          hero_title_1: c.hero_title_1 || "",
          hero_title_2: c.hero_title_2 || "",
          hero_subcopy: c.hero_subcopy || "",
          credibility: c.credibility || "",
          stats: Array.isArray(c.stats) && c.stats.length
            ? c.stats
            : DEFAULT_CONTENT.stats.map((s) => ({ value: s.value, label: s.label })),
          verified_experience:
            Array.isArray(c.verified_experience) && c.verified_experience.length
              ? c.verified_experience
              : [...DEFAULT_CONTENT.verified_experience],
        });
        const lt = {};
        LIST_EDITORS.forEach((f) => {
          const src = Array.isArray(c[f.key]) && c[f.key].length ? c[f.key] : DEFAULT_CONTENT[f.key];
          lt[f.key] = f.serialize(src);
        });
        setListText(lt);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      let heroPortraitPath = portrait;
      if (portraitFile) {
        const up = await uploadArticleImage(token, portraitFile);
        heroPortraitPath = up.path;
      }
      const cleanContent = { ...rawContent };
      ["tagline", "description", "hero_title_1", "hero_title_2", "hero_subcopy", "credibility"].forEach((k) => {
        if (content[k].trim()) cleanContent[k] = content[k].trim();
        else delete cleanContent[k];
      });
      const cleanStats = content.stats.filter((s) => s.value.trim() && s.label.trim());
      if (cleanStats.length) cleanContent.stats = cleanStats.map((s) => ({ value: s.value.trim(), label: s.label.trim() }));
      else delete cleanContent.stats;
      const cleanVe = (content.verified_experience || []).map((s) => s.trim()).filter(Boolean);
      if (cleanVe.length) cleanContent.verified_experience = cleanVe;
      else delete cleanContent.verified_experience;
      LIST_EDITORS.forEach((f) => {
        const parsed = f.parse(listText[f.key] || "");
        if (parsed.length) cleanContent[f.key] = parsed;
        else delete cleanContent[f.key];
      });
      await updateSettings(token, { ...form, content: cleanContent, hero_portrait: heroPortraitPath || null, about_portrait: aboutPortrait || null });
      setRawContent(cleanContent);
      setPortrait(heroPortraitPath);
      setPortraitFile(null);
      setPortraitPreview("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(formatApiError(err, "Could not save settings."));
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <p className="py-20 text-center font-mono-tech text-xs uppercase tracking-[0.3em] text-zinc-600" data-testid="settings-loading">Loading…</p>;

  return (
    <div className="mt-10 max-w-2xl" data-testid="settings-panel">
      <p className="text-sm text-zinc-500">
        These values update the live site the moment you save — no redeploy needed.
      </p>
      <form onSubmit={onSave} className="mt-8 space-y-5 border border-white/8 bg-surface p-7 md:p-10" data-testid="settings-form">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label htmlFor={`settings-${f.key}`} className={labelCls}>
              {f.label} <span className="text-zinc-700 normal-case tracking-normal">— {f.hint}</span>
            </label>
            <input
              id={`settings-${f.key}`}
              value={form[f.key]}
              onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              className={inputCls}
              data-testid={`settings-${f.key}-input`}
            />
          </div>
        ))}
        <div>
          <label htmlFor="settings-disclosure" className={labelCls}>
            Affiliate disclosure text <span className="text-zinc-700 normal-case tracking-normal">— shown on /affiliate-disclosure and under merchant links</span>
          </label>
          <textarea
            id="settings-disclosure"
            rows={3}
            value={form.disclosure_text}
            onChange={(e) => setForm((prev) => ({ ...prev, disclosure_text: e.target.value }))}
            placeholder="Some links on AURA Recommendations may be affiliate links…"
            className={`${inputCls} resize-y`}
            data-testid="settings-disclosure-input"
          />
        </div>

        <div className="border-t border-white/8 pt-6">
          <p className="font-mono-tech text-[10px] uppercase tracking-[0.24em] text-crimson">Site content</p>
          <p className="mt-2 text-xs text-zinc-600">Leave a field blank to keep the current text. Changes go live on save.</p>
          <div className="mt-5 space-y-5">
            <div className="border border-white/10 p-5" data-testid="hero-portrait-setting">
              <span className={labelCls}>Hero Portrait Image</span>
              <p className="mb-4 text-xs text-zinc-600">This image appears in the main homepage hero section.</p>
              <div className="flex flex-wrap items-start gap-5">
                <img
                  src={portraitPreview || (portrait ? mediaUrl(portrait) : "/assets/portrait-hero.webp")}
                  alt="Current hero portrait"
                  className="h-36 w-32 border border-white/10 object-cover object-top"
                  data-testid="hero-portrait-preview"
                />
                <div>
                  <label
                    htmlFor="hero-portrait-input"
                    className="inline-flex cursor-pointer items-center gap-2 border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition-colors duration-300 hover:border-crimson hover:text-crimson"
                    data-testid="hero-portrait-replace"
                  >
                    Replace Image
                  </label>
                  <input
                    id="hero-portrait-input"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    data-testid="hero-portrait-input"
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
                    Upload a JPG, PNG or WebP image (up to 8 MB). This image appears in the main homepage hero section.
                  </p>
                  {portraitFile && (
                    <p className="mt-2 text-xs text-crimson" data-testid="hero-portrait-staged">
                      New image selected — press Save Settings to publish it.
                    </p>
                  )}
                </div>
              </div>
            </div>
            {CONTENT_FIELDS.map((f) => (
              <div key={f.key}>
                <label htmlFor={`content-${f.key}`} className={labelCls}>{f.label}</label>
                <input
                  id={`content-${f.key}`}
                  value={content[f.key]}
                  onChange={(e) => setContent((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className={inputCls}
                  data-testid={`content-${f.key}-input`}
                />
              </div>
            ))}
            <div>
              <label htmlFor="content-description" className={labelCls}>Site description (SEO default)</label>
              <textarea
                id="content-description"
                rows={2}
                value={content.description}
                onChange={(e) => setContent((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Exploring how AI, technology and digital transformation can create practical…"
                className={`${inputCls} resize-y`}
                data-testid="content-description-input"
              />
            </div>
            <div>
              <label htmlFor="content-hero-subcopy" className={labelCls}>Hero supporting line</label>
              <textarea
                id="content-hero-subcopy"
                rows={2}
                value={content.hero_subcopy}
                onChange={(e) => setContent((prev) => ({ ...prev, hero_subcopy: e.target.value }))}
                placeholder="A practical perspective shaped by more than two decades…"
                className={`${inputCls} resize-y`}
                data-testid="content-hero-subcopy-input"
              />
            </div>
            <div>
              <label htmlFor="content-verified-experience" className={labelCls}>
                Verified experience list <span className="text-zinc-700 normal-case tracking-normal">— About page, one per line</span>
              </label>
              <textarea
                id="content-verified-experience"
                rows={6}
                value={(content.verified_experience || []).join("\n")}
                onChange={(e) => setContent((prev) => ({ ...prev, verified_experience: e.target.value.split("\n") }))}
                placeholder={"20+ years in IT\n10+ years of technology leadership"}
                className={`${inputCls} resize-y`}
                data-testid="content-verified-experience-input"
              />
            </div>
            <div>
              <span className={labelCls}>Credibility stats strip</span>
              <div className="space-y-2">
                {(content.stats.length ? content.stats : ["", "", "", ""]).map((_, i) => (
                  <div key={i} className="grid grid-cols-[120px_1fr] gap-2">
                    <input
                      value={content.stats[i]?.value || ""}
                      onChange={(e) =>
                        setContent((prev) => {
                          const stats = [...(prev.stats.length ? prev.stats : DEFAULT_CONTENT.stats.map((s) => ({ value: s.value, label: s.label })))];
                          stats[i] = { ...stats[i], value: e.target.value };
                          return { ...prev, stats };
                        })
                      }
                      placeholder={DEFAULT_CONTENT.stats[i]?.value || "20+"}
                      aria-label={`Stat ${i + 1} value`}
                      className={inputCls}
                      data-testid={`content-stat-${i}-value`}
                    />
                    <input
                      value={content.stats[i]?.label || ""}
                      onChange={(e) =>
                        setContent((prev) => {
                          const stats = [...(prev.stats.length ? prev.stats : DEFAULT_CONTENT.stats.map((s) => ({ value: s.value, label: s.label })))];
                          stats[i] = { ...stats[i], label: e.target.value };
                          return { ...prev, stats };
                        })
                      }
                      placeholder={DEFAULT_CONTENT.stats[i]?.label || "Label"}
                      aria-label={`Stat ${i + 1} label`}
                      className={inputCls}
                      data-testid={`content-stat-${i}-label`}
                    />
                  </div>
                ))}
              </div>
            </div>
            {LIST_EDITORS.map((f) => (
              <div key={f.key}>
                <label htmlFor={`list-${f.key}`} className={labelCls}>
                  {f.label} <span className="text-zinc-700 normal-case tracking-normal">— {f.hint}</span>
                </label>
                <textarea
                  id={`list-${f.key}`}
                  rows={f.rows}
                  value={listText[f.key] || ""}
                  onChange={(e) => setListText((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  className={`${inputCls} resize-y font-mono-tech text-[12px] leading-relaxed`}
                  data-testid={`list-${f.key}-input`}
                />
              </div>
            ))}
          </div>
        </div>
        {error && (
          <p className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert" data-testid="settings-error">
            {error}
          </p>
        )}
        {saved && (
          <p className="flex items-center gap-2 border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300" data-testid="settings-saved">
            <CheckCircle2 className="h-4 w-4" /> Saved — live on the site now.
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-white px-6 py-3.5 text-sm font-semibold text-black transition-colors duration-300 hover:bg-crimson hover:text-white disabled:opacity-60"
          data-testid="settings-save-button"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </form>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setPwState(null);
          try {
            await changePassword(token, pw);
            setPwState({ ok: true, text: "Password changed. Use it from your next sign-in." });
            setPw({ current_password: "", new_password: "" });
          } catch (err) {
            setPwState({ ok: false, text: formatApiError(err, "Could not change password.") });
          }
        }}
        className="mt-10 space-y-5 border border-white/8 bg-surface p-7 md:p-10"
        data-testid="password-form"
      >
        <p className="font-mono-tech text-[10px] uppercase tracking-[0.24em] text-crimson">Change admin password</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="pw-current" className={labelCls}>Current password</label>
            <input id="pw-current" type="password" required value={pw.current_password} onChange={(e) => setPw((p) => ({ ...p, current_password: e.target.value }))} className={inputCls} data-testid="pw-current-input" />
          </div>
          <div>
            <label htmlFor="pw-new" className={labelCls}>New password <span className="text-zinc-700">— min 8 characters</span></label>
            <input id="pw-new" type="password" required minLength={8} value={pw.new_password} onChange={(e) => setPw((p) => ({ ...p, new_password: e.target.value }))} className={inputCls} data-testid="pw-new-input" />
          </div>
        </div>
        {pwState && (
          <p className={`border px-4 py-3 text-sm ${pwState.ok ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-red-500/40 bg-red-500/10 text-red-300"}`} role="alert" data-testid="pw-message">
            {pwState.text}
          </p>
        )}
        <button type="submit" className="border border-white/20 px-6 py-3 text-sm font-medium text-white transition-colors duration-300 hover:border-crimson hover:text-crimson" data-testid="pw-change-button">
          Change Password
        </button>
      </form>
    </div>
  );
}
