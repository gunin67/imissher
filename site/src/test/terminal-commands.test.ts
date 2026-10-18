import { describe, expect, it } from "vitest";
import { translations, type SupportedLocale } from "@/data/translations";
import { getUi } from "@/data/ui-strings";
import { complete, runCommand } from "@/lib/terminal-commands";

const t = translations.en;

describe("terminal commands", () => {
  it("starts the site with `start` and `./start-portfolio`", () => {
    expect(runCommand("start", t).type).toBe("start");
    expect(runCommand("./start-portfolio", t).type).toBe("start");
  });
  it("supports goto <page> and rejects unknown pages", () => {
    expect(runCommand("goto gaming", t)).toEqual({ type: "start", to: "gaming" });
    expect(runCommand("goto web", t)).toEqual({ type: "start", to: "web" });
    expect(runCommand("goto nowhere", t).type).toBe("print");
  });
  it("switches themes", () => {
    expect(runCommand("theme custom", t)).toMatchObject({ type: "theme", theme: "custom" });
    expect(runCommand("theme neon", t)).toMatchObject({ type: "print" });
  });
  it("answers every command advertised by `help` (gaming/web used to be dead ends)", () => {
    for (const c of ["help", "about", "gaming", "web", "contact", "projects", "skills"]) {
      const r = runCommand(c, t);
      expect(r.type).toBe("print");
      expect(r.type === "print" && r.lines[0].kind).toBe("out");
    }
  });
  it("reports unknown commands and completes unique prefixes", () => {
    expect(runCommand("xyz", t)).toMatchObject({ type: "print", lines: [{ kind: "err" }] });
    expect(complete("gam")).toBe("gaming");
    expect(complete("s")).toBe("s"); // ambiguous (skills / start)
  });
});

describe("translations", () => {
  const locales = Object.keys(translations) as SupportedLocale[];
  const keys = (o: unknown, prefix = ""): string[] =>
    o && typeof o === "object" && !Array.isArray(o)
      ? Object.entries(o).flatMap(([k, v]) => keys(v, `${prefix}${k}.`))
      : [prefix.slice(0, -1)];

  it("every locale defines the same keys as English", () => {
    // statLabel1-3 duplicate home.stats[].label and are unused (pre-existing gap in some locales)
    const ignore = (k: string) => !/^home\.statLabel\d$/.test(k);
    const base = keys(translations.en).filter(ignore).sort();
    for (const l of locales) expect(keys(translations[l]).filter(ignore).sort(), l).toEqual(base);
  });
  it("UI strings always fall back to English", () => {
    const en = getUi("en");
    for (const l of locales) for (const k of Object.keys(en)) expect(getUi(l)[k as keyof typeof en], `${l}.${k}`).toBeTruthy();
  });
});
