import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ theme: "dark", resolved: "dark", cycleTheme: () => {} });
const KEY = "aura-theme";
const ORDER = ["dark", "light", "system"];

function resolve(theme) {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  return theme;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem(KEY) || "dark");
  const [resolved, setResolved] = useState(() => resolve(localStorage.getItem(KEY) || "dark"));

  useEffect(() => {
    const apply = () => {
      const r = resolve(theme);
      setResolved(r);
      document.documentElement.classList.toggle("light", r === "light");
    };
    apply();
    localStorage.setItem(KEY, theme);
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => theme === "system" && apply();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const cycleTheme = () => setTheme((t) => ORDER[(ORDER.indexOf(t) + 1) % ORDER.length]);

  return (
    <ThemeContext.Provider value={{ theme, resolved, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
