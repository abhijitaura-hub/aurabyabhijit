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

export default function SettingsPanel({ token }) {
  const [form, setForm] = useState({ phone: "", public_email: "", linkedin: "", youtube: "", facebook: "", booking_url: "", whatsapp: "" });
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
      await updateSettings(token, form);
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
