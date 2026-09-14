import { createContext, useContext, useEffect, useState } from "react";
import { fetchSettings } from "./api";
import { SOCIALS, SITE, STATS, DIMENSIONS, FIELD_NOTES, ADVISORY_AREAS, SPEAKING_TOPICS, TIMELINE } from "../data/site";

export const DEFAULT_CONTENT = {
  tagline: SITE.tagline,
  description: SITE.description,
  hero_title_1: "Technology Leadership",
  hero_title_2: "Intelligent Future.",
  hero_subcopy: "More than 20 years in technology has taught me a lot about leadership, people, problems and making difficult decisions. AURA is where I share what I’ve learned — and hopefully help others find their next step.",
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
  speaking_topics: SPEAKING_TOPICS,
  timeline: TIMELINE,
  advisory_areas: ADVISORY_AREAS,
  dimensions: DIMENSIONS,
  field_notes: FIELD_NOTES,
};

const pick = (remote, key) =>
  Array.isArray(remote[key]) && remote[key].length ? remote[key] : DEFAULT_CONTENT[key];

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
      stats: pick(remote, "stats"),
      verified_experience: pick(remote, "verified_experience"),
      speaking_topics: pick(remote, "speaking_topics"),
      timeline: pick(remote, "timeline"),
      advisory_areas: pick(remote, "advisory_areas"),
      dimensions: pick(remote, "dimensions"),
      field_notes: pick(remote, "field_notes"),
    },
  };
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
