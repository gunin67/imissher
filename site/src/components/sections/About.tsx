import { useRef } from "react";
import { motion, useMotionTemplate, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useApp } from "@/lib/app-context";
import { GAMING_NOTE, GAMING_PILLARS, SITE } from "@/data/site";
import Reveal from "@/components/motion/Reveal";
import ScrollText from "@/components/motion/ScrollText";
import CountUp from "@/components/motion/CountUp";

/** Sticky stacking card: each one scales back as the next slides over it. */
function PillarCard({ i, total, p, label, text }: { i: number; total: number; p: MotionValue<number>; label: string; text: string }) {
  const reduced = useReducedMotion();
  const scale = useTransform(p, [i / total, 1], [1, reduced ? 1 : 1 - (total - i) * 0.04]);
  return (
    <div className="sticky" style={{ top: `calc(6rem + ${i * 1.1}rem)` }}>
      <motion.article style={{ scale }} className="will-transform mb-6 flex min-h-[15rem] origin-top flex-col justify-between rounded-3xl border bg-card p-7 shadow-elevated md:min-h-[17rem] md:p-9">
        <div className="flex items-center justify-between"><span className="label-mono">0{i + 1} / 0{total}</span><span className="font-display text-6xl text-foreground/10" aria-hidden>0{i + 1}</span></div>
        <div><h3 className="h-display text-4xl md:text-5xl">{label}</h3><p className="mt-3 max-w-md text-muted-foreground">{text}</p></div>
      </motion.article>
    </div>
  );
}

export default function About() {
  const { t } = useApp();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const { scrollYProgress: sp } = useScroll({ target: stackRef, offset: ["start start", "end end"] });
  const clip = useTransform(p, [0.05, 0.3], [reduced ? 0 : 30, 0]);
  const clipPath = useMotionTemplate`inset(${clip}% ${clip}% ${clip}% ${clip}% round 24px)`;
  const monoScale = useTransform(p, [0, 1], [reduced ? 1 : 1.4, reduced ? 1 : 0.9]);
  const badgeY = useTransform(p, [0, 1], [reduced ? 0 : 120, reduced ? 0 : -120]);
  const titleX = useTransform(p, [0, 0.35], [reduced ? 0 : -80, 0]);
  const stat = t.home.stats[0];

  return (
    <section id="about" ref={ref} className="relative py-28 md:py-44" aria-labelledby="about-title">
      <div className="container-wide grid gap-16 lg:grid-cols-2 lg:gap-24">
        <div className="relative lg:sticky lg:top-24 lg:h-fit">
          <motion.div style={{ clipPath }} className="relative aspect-[4/5] overflow-hidden rounded-3xl border bg-surface-2 shadow-elevated" aria-hidden>
            <div className="grid-lines absolute inset-0" />
            <motion.span style={{ scale: monoScale }} className="text-gradient absolute inset-0 grid place-items-center font-display text-[clamp(8rem,20vw,11rem)] italic">{SITE.initials}</motion.span>
            <div className="absolute inset-4 rounded-2xl border" />
            <p className="label-mono absolute bottom-8 left-8">{t.home.badge}</p>
          </motion.div>
          <motion.div style={{ y: badgeY }} className="glass absolute -bottom-6 -right-2 max-w-[13rem] rounded-2xl border p-5 shadow-elevated md:-right-6">
            <CountUp value={stat.value} className="font-display text-4xl" />
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        </div>

        <div>
          <p className="eyebrow mb-4"><span className="text-foreground">01</span> — {t.about.eyebrow}</p>
          <motion.h2 id="about-title" style={{ x: titleX }} className="h-display mb-10 text-[clamp(2.2rem,5vw,4rem)]">{t.about.title}</motion.h2>
          <ScrollText text={t.about.body1} className="mb-8 text-xl leading-relaxed md:text-2xl" />
          <ScrollText text={t.about.body2} className="mb-14 text-lg leading-relaxed text-muted-foreground md:text-xl" />
          <dl className="grid gap-4 sm:grid-cols-3">
            {t.home.stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08} className="rounded-2xl border bg-card/60 p-5 transition hover:-translate-y-1 hover:shadow-elevated">
                <dt className="sr-only">{s.label}</dt>
                <dd><CountUp value={s.value} className="font-display text-3xl" /><p className="mt-1 text-xs text-muted-foreground" aria-hidden>{s.label}</p></dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>

      {/* what gaming gives me → stacking cards */}
      <div className="container-wide mt-28 md:mt-44">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:h-fit">
            <Reveal>
              <p className="eyebrow mb-4"><span className="text-foreground">02</span> — {t.gaming.eyebrow}</p>
              <h3 className="h-display text-[clamp(2rem,4.5vw,3.6rem)]">{t.gaming.gives}</h3>
            </Reveal>
            <ScrollText text={GAMING_NOTE} className="mt-8 max-w-md leading-relaxed text-muted-foreground" />
            <Reveal className="mt-8 flex flex-wrap gap-2" >
              {SITE.stack.map((s) => <span key={s} className="rounded-full border bg-card/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{s}</span>)}
            </Reveal>
          </div>
          <div ref={stackRef} className="pb-4">
            {GAMING_PILLARS.map((pl, i) => <PillarCard key={pl.label} i={i} total={GAMING_PILLARS.length} p={sp} label={pl.label} text={pl.text} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
