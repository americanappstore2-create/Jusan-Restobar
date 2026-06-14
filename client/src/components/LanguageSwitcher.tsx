import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center rounded-lg overflow-hidden border border-border bg-secondary">
      <button
        onClick={() => setLang("ru")}
        className={`px-3 py-1.5 font-body text-sm font-medium transition-all btn-press ${
          lang === "ru"
            ? "bg-gold text-background"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        RU
      </button>
      <button
        onClick={() => setLang("kz")}
        className={`px-3 py-1.5 font-body text-sm font-medium transition-all btn-press ${
          lang === "kz"
            ? "bg-gold text-background"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        KZ
      </button>
      <button
        onClick={() => setLang("en")}
        className={`px-3 py-1.5 font-body text-sm font-medium transition-all btn-press ${
          lang === "en"
            ? "bg-gold text-background"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </button>
    </div>
  );
}
