import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Code2, LayoutTemplate, MousePointer2 } from "lucide-react";
import { useApp } from "@/lib/app-context";
import Reveal from "@/components/motion/Reveal";
import SectionHead from "./SectionHead";

const ICONS = [LayoutTemplate, Code2, MousePointer2];

function ModeCard({ i, total, p, title, text }: { i: number; total: number; p: MotionValue<number>; title: string; text: string }) {
  const reduced = useReducedMotion();
  const Icon = ICONS[i] ?? Code2;
  const scale = useTransform(p, [i / total, 1], [1, reduced ? 1 : 1 - (total - i) * 0.045]);
  return (
    <div className="sticky" style={{ top: `calc(6rem + ${i * 1.25}rem)` }}>
      <motion.article style={{ scale }} className="will-transform mb-8 grid min-h-[18rem] origin-top gap-8 rounded-3xl border bg-card p-7 shadow-elevated md:grid-cols-[auto_1fr_auto] md:items-center md:p-10">
        <span className="grid h-16 w-16 place-items-center rounded-2xl border bg-background/50"><Icon className="h-7 w-7" aria-hidden /></span>
        <div><h3 className="h-display text-3xl md:text-5xl">{title}</h3><p className="mt-4 max-w-lg text-lg text-muted-foreground">{text}</p></div>
        <span className="font-display text-7xl text-foreground/10 md:text-8xl" aria-hidden>0{i + 1}</span>
      </motion.article>
    </div>
  );
}

export default function Web() {
  const { t } = useApp();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const steps = [
    { name: t.web.strategy, text: t.web.strategyText },
    { name: t.web.build, text: t.web.buildText },
    { name: t.web.launch, text: t.web.launchText },
  ];
  return (
    <section id="web" className="relative py-28 md:py-44" aria-labelledby="web-title">
      <div className="container-wide">
        <SectionHead id="web-title" index="06" eyebrow={t.web.eyebrow} title={t.web.title} align="right" />
        <Reveal className="mb-6 max-w-xl text-lg text-muted-foreground">{t.web.intro}</Reveal>
        <ol className="mb-24 grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-3 md:mb-36">
          {steps.map((s, i) => (
            <li key={s.name} className="list-none bg-card p-6">
              <Reveal delay={i * 0.1}><p className="label-mono mb-8">0{i + 1} — {s.name}</p><p className="text-muted-foreground">{s.text}</p></Reveal>
            </li>
          ))}
        </ol>
        <div ref={ref}>
          {t.web.modes.map((m, i) => <ModeCard key={m.title} i={i} total={t.web.modes.length} p={p} title={m.title} text={m.text} />)}
        </div>
      </div>
    </section>
  );
}
