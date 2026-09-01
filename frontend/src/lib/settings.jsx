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
  verified_experience: [
    "20+ years in IT",
    "10+ years of technology leadership",
    "65+ distributed business locations enabled",
    "Enterprise IT · Cloud & Azure · Cybersecurity",
    "Digital transformation · IT governance",
    "Automation · AI · Technology strategy",
  ],
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
      verified_experience:
        Array.isArray(remote.verified_experience) && remote.verified_experience.length
          ? remote.verified_experience
          : DEFAULT_CONTENT.verified_experience,
    },
  };
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
