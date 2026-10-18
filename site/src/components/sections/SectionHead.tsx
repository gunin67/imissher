import type { ReactNode } from "react";
import Reveal from "@/components/motion/Reveal";

/** Mono index + eyebrow, display title. Used at the top of every section after the hero. */
export default function SectionHead({ index, eyebrow, title, align = "left", id }: { index: string; eyebrow: string; title: ReactNode; align?: "left" | "right"; id?: string }) {
  return (
    <Reveal className={`mb-12 md:mb-16 ${align === "right" ? "text-right" : ""}`}>
      <p className="eyebrow mb-5"><span className="text-foreground">{index}</span> — {eyebrow}</p>
      <h2 id={id} className={`h-display max-w-4xl text-[clamp(2.2rem,6vw,5rem)] ${align === "right" ? "ml-auto" : ""}`}>{title}</h2>
    </Reveal>
  );
}
