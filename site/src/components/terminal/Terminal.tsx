import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useApp } from "@/lib/app-context";
import { complete, runCommand, type OutLine } from "@/lib/terminal-commands";
import { ease } from "@/lib/design";
import { SITE, scrollToSection } from "@/data/site";

const QUICK = ["help", "about", "gaming", "web", "contact"] as const;

/**
 * The boot sequence of the site. Type `start` (or press the button) to enter.
 * It is a real dialog: focus is trapped to its controls, Esc / “Skip intro” always works,
 * and the page behind is `inert` while it is open.
 */
export default function Terminal() {
  const { t, ui, theme, setTheme, introOpen, closeIntro } = useApp();
  const reduced = useReducedMotion();
  const tt = t.terminal;
  const prompt = tt.prompt;

  const [lines, setLines] = useState<OutLine[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(true);
  const [booting, setBooting] = useState(false);
  const history = useRef<string[]>([]);
  const historyIdx = useRef(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };

  // keep the page behind inert while the terminal is open
  useEffect(() => {
    const site = document.getElementById("site-root");
    site?.toggleAttribute("inert", introOpen);
    return () => site?.removeAttribute("inert");
  }, [introOpen]);

  // intro: auto-type `whoami`, then print the welcome lines (instant with reduced motion)
  useEffect(() => {
    if (!introOpen) return;
    setLines([]); setBooting(false);
    const word = "whoami";
    const reveal = () => {
      setInput("");
      setLines([
        { kind: "in", text: word },
        { kind: "out", text: `${SITE.name} — ${t.home.badge}` },
        { kind: "out", text: tt.intro },
        { kind: "muted", text: tt.ready },
      ]);
      setTyping(false);
      window.setTimeout(() => inputRef.current?.focus(), 30);
    };
    if (reduced) { reveal(); return; }
    setTyping(true);
    let i = 0;
    const step = () => {
      i += 1;
      setInput(word.slice(0, i));
      later(i < word.length ? step : reveal, i < word.length ? 85 + Math.random() * 70 : 380);
    };
    later(step, 500);
    return () => { timers.current.forEach(window.clearTimeout); timers.current = []; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [introOpen]);

  useEffect(() => { bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: reduced ? "auto" : "smooth" }); }, [lines, reduced]);

  useEffect(() => {
    if (!introOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeIntro(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [introOpen, closeIntro]);

  const boot = (to?: string) => {
    setBooting(true);
    const seq: OutLine[] = [
      { kind: "ok", text: tt.startPortfolio },
      { kind: "muted", text: `[ ok ] theme · ${theme}` },
      { kind: "muted", text: `[ ok ] sections · ${SITE.sections.length} mounted` },
      { kind: "ok", text: "[ ok ] ready" },
    ];
    if (reduced) { setLines((l) => [...l, ...seq]); closeIntro(); if (to) window.setTimeout(() => scrollToSection(to), 100); return; }
    seq.forEach((line, i) => later(() => setLines((l) => [...l, line]), i * 170));
    later(() => { closeIntro(); if (to) window.setTimeout(() => scrollToSection(to), 150); }, seq.length * 170 + 260);
  };

  const run = (raw: string) => {
    const cmd = raw.trim();
    if (cmd) history.current.push(cmd);
    historyIdx.current = -1;
    const echo: OutLine = { kind: "in", text: cmd };
    const result = runCommand(cmd, t);
    switch (result.type) {
      case "clear": setLines([]); break;
      case "start": setLines((l) => [...l, echo]); boot(result.to); break;
      case "theme": setTheme(result.theme); setLines((l) => [...l, echo, ...result.lines]); break;
      default: setLines((l) => [...l, echo, ...result.lines]);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") { e.preventDefault(); setInput((v) => complete(v)); }
    if (e.key === "ArrowUp" && history.current.length) {
      e.preventDefault();
      historyIdx.current = Math.min(historyIdx.current + 1, history.current.length - 1);
      setInput(history.current[history.current.length - 1 - historyIdx.current]);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      historyIdx.current = Math.max(historyIdx.current - 1, -1);
      setInput(historyIdx.current === -1 ? "" : history.current[history.current.length - 1 - historyIdx.current]);
    }
  };

  const colour = (k: OutLine["kind"]) => (k === "err" ? "text-destructive" : k === "ok" ? "text-success" : k === "muted" ? "text-terminal-muted" : "");

  return (
    <AnimatePresence>
      {introOpen && (
        <motion.div
          key="terminal"
          className="bg-atmosphere fixed inset-0 z-[90] flex items-center justify-center bg-background/85 p-3 backdrop-blur-md sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: reduced ? 0.01 : 0.6, delay: reduced ? 0 : 0.25 } }}
          role="dialog"
          aria-modal="true"
          aria-label={tt.title}
        >
          <div className="grid-lines pointer-events-none absolute inset-0 opacity-60" aria-hidden />
          <motion.div
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl border bg-terminal shadow-elevated backdrop-blur-xl"
            initial={reduced ? false : { y: 40, scale: 0.96, opacity: 0, filter: "blur(10px)" }}
            animate={booting && !reduced
              ? { scale: 1.6, opacity: 0, filter: "blur(16px)", transition: { duration: 0.9, delay: 0.55, ease: [0.7, 0, 0.2, 1] } }
              : { y: 0, scale: 1, opacity: 1, filter: "blur(0px)", transition: { duration: 0.8, ease } }}
            exit={reduced ? undefined : { scale: 1.4, opacity: 0, filter: "blur(16px)", transition: { duration: 0.6 } }}
            onClick={() => inputRef.current?.focus()}
          >
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <button type="button" aria-label={tt.skip} onClick={closeIntro} className="h-3 w-3 rounded-full bg-muted-foreground/40 transition hover:bg-destructive" />
              <span className="h-3 w-3 rounded-full bg-muted-foreground/25" aria-hidden />
              <span className="h-3 w-3 rounded-full bg-muted-foreground/15" aria-hidden />
              <span className="mx-auto font-mono text-xs text-terminal-muted">{tt.title}</span>
              <span className="w-12" aria-hidden />
            </div>

            <div ref={bodyRef} className="scanlines h-[48dvh] max-h-[460px] overflow-y-auto px-4 py-4 font-mono text-[13px] leading-relaxed text-terminal-foreground sm:px-5 md:text-sm" aria-live="polite">
              <p className="mb-3 text-terminal-muted">Last login: {new Date().toDateString()} on ttys001</p>
              {lines.map((l, i) => (
                <motion.div
                  key={i}
                  initial={reduced ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`whitespace-pre-wrap break-words ${colour(l.kind)}`}
                >
                  {l.kind === "in" ? <><span className="text-terminal-muted">{prompt}</span> {l.text}</> : l.text}
                </motion.div>
              ))}
              <form
                className="flex items-center gap-2"
                onSubmit={(e) => { e.preventDefault(); if (typing || booting) return; run(input); setInput(""); }}
              >
                <label htmlFor="terminal-input" className="shrink-0 text-terminal-muted">{prompt}</label>
                <div className="relative min-w-0 flex-1">
                  <span className="pointer-events-none whitespace-pre" aria-hidden>{input}</span>
                  <span className="caret-blink ml-px inline-block h-4 w-2 translate-y-0.5 bg-terminal-foreground" aria-hidden />
                  {!input && !typing && <span className="pointer-events-none absolute left-4 top-0 truncate italic text-terminal-muted/40" aria-hidden>start</span>}
                  <input
                    id="terminal-input"
                    ref={inputRef}
                    value={input}
                    onChange={(e) => !typing && setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    className="absolute inset-0 w-full bg-transparent text-[16px] text-transparent caret-transparent outline-none"
                    autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} enterKeyHint="go"
                    aria-label={tt.title}
                  />
                </div>
              </form>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
              <div className="flex flex-wrap gap-1.5">
                {QUICK.map((c) => (
                  <button key={c} type="button" onClick={() => !typing && !booting && run(c)} className="rounded-md border px-2.5 py-1 font-mono text-xs text-terminal-muted transition hover:bg-accent hover:text-terminal-foreground">{c}</button>
                ))}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={closeIntro} className="rounded-full px-3 py-1.5 text-xs text-terminal-muted transition hover:text-terminal-foreground">{tt.skip}</button>
                <button
                  type="button"
                  data-cursor="↵"
                  disabled={booting}
                  onClick={() => { if (typing || booting) return; setLines((l) => [...l, { kind: "in", text: "start" }]); boot(); }}
                  className="rounded-full bg-primary px-4 py-1.5 font-mono text-xs text-primary-foreground transition hover:opacity-85 disabled:opacity-50"
                >
                  start ↵
                </button>
              </div>
            </div>
            <span className="sr-only">{ui.close}</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
