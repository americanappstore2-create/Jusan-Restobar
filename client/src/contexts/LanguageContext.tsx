import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "ru" | "kz" | "en";

interface LanguageContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  t: (ru: string, kz: string, en?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "ru",
  setLang: () => {},
  t: (ru) => ru,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem("jusan_lang");
      if (stored === "ru" || stored === "kz" || stored === "en") return stored as Language;
    } catch {}
    return "ru";
  });

  const setLang = (l: Language) => {
    setLangState(l);
    try {
      localStorage.setItem("jusan_lang", l);
    } catch {}
  };

  const t = (ru: string, kz: string, en?: string) => {
    if (lang === "kz") return kz;
    if (lang === "en") return en || ru;
    return ru;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
