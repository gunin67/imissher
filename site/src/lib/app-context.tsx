import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { translations, type SupportedLocale, type TranslationDictionary } from "@/data/translations";
import { getUi, type UiStrings } from "@/data/ui-strings";
import { local, session } from "@/lib/safe-storage";

export type Theme = "light" | "dark" | "custom";
export const THEMES: Theme[] = ["light", "dark", "custom"];

const THEME_KEY = "portfolio-theme";
const LANG_KEY = "portfolio-language";
const INTRO_KEY = "portfolio-intro-seen";

const readTheme = (): Theme => {
  const stored = local.get(THEME_KEY);
  if (stored === "gradient") return "custom"; // legacy value from the original site
  if (stored === "light" || stored === "dark" || stored === "custom") return stored;
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
};
const readLang = (): SupportedLocale => {
  const stored = local.get(LANG_KEY) as SupportedLocale | null;
  return stored && translations[stored] ? stored : "en";
};

interface AppCtx {
  theme: Theme;
  setTheme: (theme: Theme, origin?: { x: number; y: number }) => void;
  cycleTheme: (origin?: { x: number; y: number }) => void;
  lang: SupportedLocale;
  setLang: (lang: SupportedLocale) => void;
  t: TranslationDictionary;
  ui: UiStrings;
  introOpen: boolean;
  openIntro: () => void;
  closeIntro: () => void;
}

const Ctx = createContext<AppCtx | null>(null);

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle("dark", theme !== "light");
  root.style.colorScheme = theme === "light" ? "light" : "dark";
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readTheme);
  const [lang, setLangState] = useState<SupportedLocale>(readLang);
  const [introOpen, setIntroOpen] = useState(() => session.get(INTRO_KEY) !== "true");

  useEffect(() => { applyTheme(theme); }, [theme]);
  useEffect(() => { document.documentElement.lang = lang === "zh" ? "zh-CN" : lang; }, [lang]);
  useEffect(() => { document.documentElement.style.overflow = introOpen ? "hidden" : ""; }, [introOpen]);

  const setTheme = useCallback((next: Theme, origin?: { x: number; y: number }) => {
    local.set(THEME_KEY, next);
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const commit = () => flushSync(() => { setThemeState(next); applyTheme(next); });

    // Progressive enhancement: circular reveal from the toggle with the View Transitions API.
    const start = (document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } }).startViewTransition;
    if (start && !reduced && origin) {
      const transition = start.call(document, commit);
      transition.ready.then(() => {
        const r = Math.hypot(Math.max(origin.x, innerWidth - origin.x), Math.max(origin.y, innerHeight - origin.y));
        root.animate(
          { clipPath: [`circle(0px at ${origin.x}px ${origin.y}px)`, `circle(${r}px at ${origin.x}px ${origin.y}px)`] },
          { duration: 650, easing: "cubic-bezier(0.16, 1, 0.3, 1)", pseudoElement: "::view-transition-new(root)" },
        );
      }).catch(() => undefined);
      return;
    }
    root.classList.add("theme-switching");
    setThemeState(next);
    applyTheme(next);
    window.setTimeout(() => root.classList.remove("theme-switching"), 500);
  }, []);

  const cycleTheme = useCallback((origin?: { x: number; y: number }) => {
    setTheme(THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length], origin);
  }, [theme, setTheme]);

  const setLang = useCallback((next: SupportedLocale) => {
    setLangState(next);
    local.set(LANG_KEY, next);
  }, []);

  const closeIntro = useCallback(() => {
    session.set(INTRO_KEY, "true");
    setIntroOpen(false);
  }, []);
  const openIntro = useCallback(() => setIntroOpen(true), []);

  const value = useMemo<AppCtx>(
    () => ({ theme, setTheme, cycleTheme, lang, setLang, t: translations[lang], ui: getUi(lang), introOpen, openIntro, closeIntro }),
    [theme, setTheme, cycleTheme, lang, setLang, introOpen, openIntro, closeIntro],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
