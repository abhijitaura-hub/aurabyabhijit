import { createContext, useContext, useEffect, useState } from "react";
import { fetchSettings } from "./api";
import { SOCIALS, SITE, STATS } from "../data/site";

const DEFAULT_CONTENT = {
  tagline: SITE.tagline,
  description: SITE.description,
  hero_title_1: "Technology Leadership",
  hero_title_2: "Intelligent Future.",
  hero_subcopy: "A practical perspective shaped by more than two decades of working with real-world technology.",
  credibility: "20+ Years in Technology Leadership",
  stats: STATS,
};

const SettingsContext = createContext({
  phone: null,
  public_email: null,
  booking_url: null,
  whatsapp: null,
  socials: SOCIALS,
  content: DEFAULT_CONTENT,
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  useEffect(() => {
    fetchSettings().then(setSettings).catch(() => {});
  }, []);
  const remote = settings?.content || {};
  const value = {
    phone: settings?.phone || null,
    public_email: settings?.public_email || null,
    booking_url: settings?.booking_url || null,
    whatsapp: settings?.whatsapp || null,
    socials: {
      linkedin: settings?.linkedin || SOCIALS.linkedin,
      youtube: settings?.youtube || SOCIALS.youtube,
      facebook: settings?.facebook || SOCIALS.facebook,
    },
    content: {
      ...DEFAULT_CONTENT,
      ...remote,
      stats: Array.isArray(remote.stats) && remote.stats.length ? remote.stats : STATS,
    },
  };
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
