import { createContext, useContext, useEffect, useState } from "react";
import { fetchSettings } from "./api";
import { SOCIALS, SITE, STATS, DIMENSIONS, FIELD_NOTES, ADVISORY_AREAS, SPEAKING_TOPICS, TIMELINE, CONTACT_TOPICS } from "../data/site";

export const DEFAULT_CONTENT = {
  tagline: SITE.tagline,
  description: SITE.description,
  hero_title_1: "Technology Leadership",
  hero_title_2: "Intelligent Future.",
  hero_subcopy: "More than 20 years in technology has taught me a lot about leadership, people, problems and making difficult decisions. AURA is where I share what I’ve learned — and hopefully help others find their next step.",
  hero_eyebrow: "AURA by Abhijit — Technology, built from experience",
  credibility: "20+ Years in Technology Leadership",
  why_aura_title: "Why I Built AURA",
  why_aura_p1: "I’ve spent more than 20 years working in technology. Along the way, I’ve learned from successes, mistakes, difficult decisions, people and problems.",
  why_aura_p2: "I wanted to create a place where I could share those experiences and ideas in a simple way — and hopefully make them useful to people who are on their own journey.",
  ask_aura_title: "Have a Question? Ask AURA.",
  ask_aura_text: "Tell AURA what you’re trying to figure out. Explore an idea, find a direction or simply start a conversation.",
  ask_aura_button: "Ask AURA",
  share_items: [
    { title: "Technology Leadership", text: "Lessons from years of leading technology and people." },
    { title: "AI & Technology", text: "Thoughts on how technology is changing the way we work and live." },
    { title: "Cloud & Infrastructure", text: "Practical experiences from building and managing technology environments." },
    { title: "Cybersecurity", text: "Simple thoughts on protecting technology, people and trust." },
    { title: "Automation", text: "Ideas on reducing repetitive work and making things simpler." },
    { title: "Digital Transformation", text: "Lessons from turning technology into something people can actually use." },
  ],
  bio_paragraphs: [
    "I’m **Abhijit Debnath**, a technology leader with more than two decades of experience across IT infrastructure, cloud, cybersecurity, enterprise technology and digital transformation — including enabling technology operations across 65+ distributed business locations.",
    "My journey has gradually shifted from solving individual technology problems to understanding the larger question: *how can technology create meaningful business outcomes?*",
    "I’ve learned that technology leadership isn’t about knowing every technology. **It’s about knowing what matters.**",
    "AURA is my platform for exploring that intersection of technology, intelligence and leadership — and sharing practical perspectives on what comes next.",
  ],
  chat_suggestions: [
    "What does Abhijit do?",
    "What advisory services are offered?",
    "What is the AURA Decision Framework?",
  ],
  contact_topics: CONTACT_TOPICS,
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
    hero_portrait: settings?.hero_portrait || null,
    about_portrait: settings?.about_portrait || null,
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
      bio_paragraphs: pick(remote, "bio_paragraphs"),
      share_items: pick(remote, "share_items"),
      chat_suggestions: pick(remote, "chat_suggestions"),
      contact_topics: pick(remote, "contact_topics"),
    },
  };
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
