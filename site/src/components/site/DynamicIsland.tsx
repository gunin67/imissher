import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { Globe, Moon, Sparkles, Sun, Terminal as TermIcon } from "lucide-react";
import { useApp, THEMES, type Theme } from "@/lib/app-context";
import { localeOptions } from "@/data/translations";
import { SITE, scrollToSection } from "@/data/site";
import { spring } from "@/lib/design";
import { useMediaQuery } from "@/hooks/use-media-query";

const THEME_ICON: Record<Theme, typeof Sun> = { light: Sun, dark: Moon, custom: Sparkles };

/**
 * Floating “dynamic island” navigation.
 *  - Collapsed: pill showing the current page + theme + scroll-progress ring.
 *  - Expanded (hover / focus / tap): routes, theme switch, language, terminal.
 *  - Mobile: tap to expand into a compact panel.
 */
export default function DynamicIsland() {
  const { t, ui, theme, setTheme, cycleTheme, lang, setLang, openIntro, introOpen } = useApp();
  const [active, setActive] = useState<string>("home");
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const wide = useMediaQuery("(min-width: 640px)");
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  const current = SITE.sections.find((r) => r.id === active) ?? SITE.sections[0];
  const label = (key: string) => t.nav[key as keyof typeof t.nav];

  // scroll-spy: which section is in the middle of the viewport
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    SITE.sections.forEach((sec) => { const el = document.getElementById(sec.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [introOpen]);
  const go = (id: string) => { scrollToSection(id); setOpen(false); setLangOpen(false); };

  // close on outside press / Escape
  useEffect(() => {
    const down = (e: PointerEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setLangOpen(false); } };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); setLangOpen(false); } };
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("pointerdown", down); document.removeEventListener("keydown", key); };
  }, []);

  if (introOpen) return null;

  const ThemeIcon = THEME_ICON[theme];
  const themeName = { light: ui.themeLight, dark: ui.themeDark, custom: ui.themeCustom };
  const originOf = (e: React.MouseEvent) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
  const stacked = open && !wide; // mobile expanded layout

  const iconBtn = "grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-island-foreground";

  return (
    <motion.div
      className="fixed inset-x-0 top-3 z-[80] flex justify-center px-3"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ...spring, delay: 0.35 }}
    >
      <motion.nav
        ref={ref}
        layout
        transition={spring}
        aria-label={ui.menu}
        onMouseEnter={() => finePointer && setOpen(true)}
        onMouseLeave={() => { if (finePointer) { setOpen(false); setLangOpen(false); } }}
        onFocus={() => setOpen(true)}
        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) { setOpen(false); setLangOpen(false); } }}
        className="relative max-w-full overflow-hidden border border-border bg-island text-island-foreground shadow-island backdrop-blur-2xl"
        style={{ borderRadius: stacked ? 28 : 999 }}
      >
        <motion.div layout="position" className="flex items-center gap-2 py-2 pl-3 pr-2 sm:gap-3 sm:pl-4">
          <a href="#home" onClick={(e) => { e.preventDefault(); go("home"); }} className="font-display text-lg font-semibold leading-none" aria-label={`${SITE.name} — ${label("home")}`}>
            {SITE.initials}<span className="text-muted-foreground">.</span>
          </a>

          <AnimatePresence mode="popLayout" initial={false}>
            {!open || !wide ? (
              <motion.button
                key="current"
                type="button"
                onClick={() => !finePointer && setOpen((o) => !o)}
                aria-expanded={open}
                aria-label={ui.menu}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-2 pr-1 text-xs text-muted-foreground"
              >
                <span className="relative flex h-1.5 w-1.5" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                </span>
                <span className="min-w-12 text-left">{label(current.key)}</span>
              </motion.button>
            ) : (
              <motion.ul
                key="links"
                initial={{ opacity: 0, filter: "blur(6px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0 }}
                className="flex items-center gap-0.5"
              >
                {SITE.sections.map((r) => {
                  const isActive = r.id === current.id;
                  return (
                    <li key={r.id}>
                      <a href={`#${r.id}`} onClick={(e) => { e.preventDefault(); go(r.id); }} aria-current={isActive ? "true" : undefined}
                        className={`relative block rounded-full px-3 py-1.5 text-xs transition-colors ${isActive ? "text-island-foreground" : "text-muted-foreground hover:text-island-foreground"}`}>
                        {isActive && <motion.span layoutId="island-pill" className="absolute inset-0 rounded-full bg-accent" transition={spring} />}
                        <span className="relative">{label(r.key)}</span>
                      </a>
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>

          <motion.div layout="position" className="ml-auto flex items-center gap-0.5">
            <button type="button" onClick={() => setLangOpen((v) => !v)} aria-label={ui.languages} aria-expanded={langOpen}
              className="flex h-8 items-center gap-1 rounded-full px-2 text-xs uppercase text-muted-foreground transition hover:bg-accent hover:text-island-foreground">
              <Globe className="h-3.5 w-3.5" aria-hidden />{lang}
            </button>

            {open && wide ? (
              <div role="group" aria-label={ui.themeLabel} className="flex items-center rounded-full bg-accent/60 p-0.5">
                {THEMES.map((th) => {
                  const Icon = THEME_ICON[th];
                  return (
                    <button key={th} type="button" aria-pressed={theme === th} aria-label={themeName[th]} title={themeName[th]}
                      onClick={(e) => setTheme(th, originOf(e))}
                      className={`grid h-7 w-7 place-items-center rounded-full transition ${theme === th ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  );
                })}
              </div>
            ) : (
              <button type="button" className={iconBtn} aria-label={`${ui.themeLabel}: ${themeName[theme]}`} onClick={(e) => cycleTheme(originOf(e))}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={theme} initial={{ rotate: -90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} exit={{ rotate: 90, scale: 0 }}>
                    <ThemeIcon className="h-3.5 w-3.5" aria-hidden />
                  </motion.span>
                </AnimatePresence>
              </button>
            )}

            <button type="button" className={iconBtn} aria-label={ui.openTerminal} onClick={openIntro}><TermIcon className="h-3.5 w-3.5" aria-hidden /></button>
            <svg className="h-8 w-8 -rotate-90" viewBox="0 0 32 32" role="img" aria-label={ui.progress}>
              <circle cx="16" cy="16" r="11" className="fill-none stroke-border" strokeWidth="2" />
              <motion.circle cx="16" cy="16" r="11" className="fill-none stroke-foreground" strokeWidth="2" strokeLinecap="round" style={{ pathLength: progress }} />
            </svg>
          </motion.div>
        </motion.div>

        <AnimatePresence initial={false}>
          {open && !wide && (
            <motion.ul key="mobile" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="grid grid-cols-2 gap-1 px-3 pb-3">
              {SITE.sections.map((r) => {
                const isActive = r.id === current.id;
                return (
                  <li key={r.id}>
                    <a href={`#${r.id}`} onClick={(e) => { e.preventDefault(); go(r.id); }} aria-current={isActive ? "true" : undefined}
                      className={`block rounded-full px-3 py-2 text-center text-sm ${isActive ? "bg-accent text-island-foreground" : "text-muted-foreground"}`}>
                      {label(r.key)}
                    </a>
                  </li>
                );
              })}
              <li className="col-span-2 mt-1 flex items-center justify-center gap-1" role="group" aria-label={ui.themeLabel}>
                {THEMES.map((th) => {
                  const Icon = THEME_ICON[th];
                  return (
                    <button key={th} type="button" aria-pressed={theme === th} onClick={(e) => setTheme(th, originOf(e))}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs ${theme === th ? "bg-accent text-island-foreground" : "text-muted-foreground"}`}>
                      <Icon className="h-3.5 w-3.5" aria-hidden />{themeName[th]}
                    </button>
                  );
                })}
              </li>
            </motion.ul>
          )}
          {langOpen && (
            <motion.div key="lang" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="flex flex-wrap justify-center gap-1 px-3 pb-3" role="group" aria-label={ui.languages}>
              {localeOptions.map((l) => (
                <button key={l.code} type="button" aria-pressed={lang === l.code} lang={l.code}
                  onClick={() => { setLang(l.code); setLangOpen(false); }}
                  className={`relative rounded-full px-3 py-1.5 text-xs transition ${lang === l.code ? "text-island-foreground" : "text-muted-foreground hover:text-island-foreground"}`}>
                  {lang === l.code && <motion.span layoutId="lang-pill" className="absolute inset-0 rounded-full bg-accent" transition={spring} />}
                  <span className="relative">{l.label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </motion.div>
  );
}
