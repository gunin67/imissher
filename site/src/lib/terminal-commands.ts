import type { TranslationDictionary } from "@/data/translations";
import { SITE } from "@/data/site";
import type { Theme } from "@/lib/app-context";

export type OutLine = { kind: "in" | "out" | "err" | "ok" | "muted"; text: string };

export type CommandResult =
  | { type: "print"; lines: OutLine[] }
  | { type: "clear" }
  | { type: "start"; to?: string }
  | { type: "theme"; theme: Theme; lines: OutLine[] };

export const COMMANDS = ["help", "about", "gaming", "web", "projects", "skills", "contact", "whoami", "ls", "goto", "theme", "clear", "start", "./start-portfolio"] as const;

const PAGES: Record<string, string> = { home: "home", gaming: "gaming", web: "web", "web-creation": "web", about: "about", contact: "contact" };

/** Pure command interpreter for the boot terminal (unit-tested). Output text comes from the translation dictionary. */
export function runCommand(raw: string, t: TranslationDictionary): CommandResult {
  const [cmd = "", ...args] = raw.trim().split(/\s+/);
  const out = (...texts: string[]): CommandResult => ({ type: "print", lines: texts.map((text) => ({ kind: "out", text })) });
  switch (cmd.toLowerCase()) {
    case "": return { type: "print", lines: [] };
    case "help": return out(t.terminal.help, "goto <page> · theme <light|dark|custom> · ls · whoami");
    case "about": return out(t.terminal.about);
    case "projects": return out(t.terminal.projects);
    case "skills": return out(t.terminal.skills);
    case "contact": return out(t.terminal.contact);
    case "gaming": return out(t.gaming.title, "→ goto gaming");
    case "web": return out(t.web.title, "→ goto web");
    case "whoami": return out(`${SITE.name} — ${t.home.badge}`);
    case "ls": return out(SITE.sections.map((r) => (r.id === "home" ? "~/" : `~/${r.id}`)).join("   "));
    case "clear": return { type: "clear" };
    case "start": case "./start-portfolio": case "start-portfolio": return { type: "start" };
    case "goto": {
      const to = PAGES[(args[0] ?? "").toLowerCase().replace(/^\/|^~\//, "")];
      return to ? { type: "start", to } : { type: "print", lines: [{ kind: "err", text: `goto: ${(args[0] ?? "") || "?"} — try: ${Object.keys(PAGES).filter((k) => k !== "web-creation").join(" | ")}` }] };
    }
    case "theme": {
      const next = (args[0] ?? "").toLowerCase();
      if (next === "light" || next === "dark" || next === "custom") return { type: "theme", theme: next, lines: [{ kind: "ok", text: `theme → ${next}` }] };
      return { type: "print", lines: [{ kind: "err", text: "theme <light | dark | custom>" }] };
    }
    default: return { type: "print", lines: [{ kind: "err", text: t.terminal.unknown }] };
  }
}

/** Tab completion: unique prefix match across known commands. */
export const complete = (value: string): string => {
  if (!value || value.includes(" ")) return value;
  const matches = COMMANDS.filter((c) => c.startsWith(value.toLowerCase()));
  return matches.length === 1 ? matches[0] : value;
};
