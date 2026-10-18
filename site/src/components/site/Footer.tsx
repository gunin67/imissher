import { useApp } from "@/lib/app-context";
import { SITE, scrollToSection } from "@/data/site";

export default function Footer() {
  const { t, ui } = useApp();
  return (
    <footer className="relative z-10 border-t px-5 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
        <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection("home"); }} className="font-display text-2xl font-semibold tracking-tight" aria-label={SITE.name}>
          {SITE.initials}<span className="text-muted-foreground">.</span>
        </a>
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {SITE.sections.map((r) => (
            <a key={r.id} href={`#${r.id}`} onClick={(e) => { e.preventDefault(); scrollToSection(r.id); }} className="hover-underline hover:text-foreground">{t.nav[r.key as keyof typeof t.nav]}</a>
          ))}
        </nav>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} {SITE.name}</span>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hover-underline hover:text-foreground">
            {ui.backToTop} <span aria-hidden>↑</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
