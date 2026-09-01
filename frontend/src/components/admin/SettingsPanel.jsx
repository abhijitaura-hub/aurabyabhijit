import { useEffect, useState } from "react";
import { CheckCircle2, Save } from "lucide-react";
import { fetchSettings, updateSettings, formatApiError } from "../../lib/api";

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

export default function SettingsPanel({ token }) {
  const [form, setForm] = useState({ phone: "", public_email: "", linkedin: "", youtube: "", facebook: "", booking_url: "", whatsapp: "", disclosure_text: "" });
  const [content, setContent] = useState({ tagline: "", description: "", hero_title_1: "", hero_title_2: "", hero_subcopy: "", credibility: "", stats: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSettings()
      .then((s) => {
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
          stats: Array.isArray(c.stats) && c.stats.length ? c.stats : [],
        });
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
      const cleanContent = {};
      ["tagline", "description", "hero_title_1", "hero_title_2", "hero_subcopy", "credibility"].forEach((k) => {
        if (content[k].trim()) cleanContent[k] = content[k].trim();
      });
      const cleanStats = content.stats.filter((s) => s.value.trim() && s.label.trim());
      if (cleanStats.length) cleanContent.stats = cleanStats.map((s) => ({ value: s.value.trim(), label: s.label.trim() }));
      await updateSettings(token, { ...form, content: cleanContent });
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
              <span className={labelCls}>Credibility stats strip</span>
              <div className="space-y-2">
                {(content.stats.length ? content.stats : ["", "", "", ""]).map((_, i) => (
                  <div key={i} className="grid grid-cols-[120px_1fr] gap-2">
                    <input
                      value={content.stats[i]?.value || ""}
                      onChange={(e) =>
                        setContent((prev) => {
                          const stats = [...(prev.stats.length ? prev.stats : [{ value: "", label: "" }, { value: "", label: "" }, { value: "", label: "" }, { value: "", label: "" }])];
                          stats[i] = { ...stats[i], value: e.target.value };
                          return { ...prev, stats };
                        })
                      }
                      placeholder="20+"
                      aria-label={`Stat ${i + 1} value`}
                      className={inputCls}
                      data-testid={`content-stat-${i}-value`}
                    />
                    <input
                      value={content.stats[i]?.label || ""}
                      onChange={(e) =>
                        setContent((prev) => {
                          const stats = [...(prev.stats.length ? prev.stats : [{ value: "", label: "" }, { value: "", label: "" }, { value: "", label: "" }, { value: "", label: "" }])];
                          stats[i] = { ...stats[i], label: e.target.value };
                          return { ...prev, stats };
                        })
                      }
                      placeholder="Years in IT"
                      aria-label={`Stat ${i + 1} label`}
                      className={inputCls}
                      data-testid={`content-stat-${i}-label`}
                    />
                  </div>
                ))}
              </div>
            </div>
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
    </div>
  );
}
