import { createContext, useContext, useEffect, useState } from "react";
import { fetchSettings } from "./api";
import { SOCIALS } from "../data/site";

const SettingsContext = createContext({
  phone: null,
  public_email: null,
  booking_url: null,
  whatsapp: null,
  socials: SOCIALS,
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  useEffect(() => {
    fetchSettings().then(setSettings).catch(() => {});
  }, []);
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
  };
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
