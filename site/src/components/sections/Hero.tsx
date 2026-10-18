import { useRef } from "react";
import { motion, useMotionTemplate, useReducedMotion, useScroll, useTransform, type TargetAndTransition } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { SITE, scrollToSection } from "@/data/site";
import { ease } from "@/lib/design";

/** Pinned hero: the name scales, blurs and splits apart as you scroll. */
export default function Hero() {
  const { t, ui, introOpen } = useApp();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(p, [0, 0.6], [1, reduced ? 1 : 1.9]);
  const blur = useTransform(p, [0.2, 0.6], [0, reduced ? 0 : 14]);
  const filter = useMotionTemplate`blur(${blur}px)`;
  const opacity = useTransform(p, [0.25, 0.6], [1, 0]);
  const x1 = useTransform(p, [0, 0.6], [0, reduced ? 0 : -140]);
  const x2 = useTransform(p, [0, 0.6], [0, reduced ? 0 : 140]);
  const gridY = useTransform(p, [0, 1], [0, reduced ? 0 : 200]);
  const subO = useTransform(p, [0, 0.2], [1, 0]);
  const go = !introOpen;
  const [first, ...rest] = SITE.name.split(" ");
  const init = (o: TargetAndTransition) => (reduced ? false : o);

  return (
    <section id="home" ref={ref} className="relative h-[180svh]" aria-labelledby="home-title">
      <div className="sticky top-0 flex h-svh items-center justify-center overflow-hidden">
        <motion.div aria-hidden className="grid-lines absolute inset-0" style={{ y: gridY }} />
        <motion.div style={{ scale, filter, opacity }} className="relative z-10 px-5 text-center">
          <motion.p initial={init({ opacity: 0, y: 20 })} animate={go ? { opacity: 1, y: 0 } : undefined} transition={{ delay: 0.3, duration: 0.8, ease }} className="eyebrow mb-6 text-[0.62rem] sm:text-xs">
            {t.home.badge}
          </motion.p>
          <h1 id="home-title" className="h-display text-[clamp(3.6rem,15vw,11rem)]">
            <span className="sr-only">{SITE.name}</span>
            <span aria-hidden className="block overflow-hidden pb-[0.22em] -mb-[0.1em]">
              <motion.span style={{ x: x1 }} className="block" initial={init({ y: "100%", opacity: 0 })} animate={go ? { y: 0, opacity: 1 } : undefined} transition={{ duration: 1, ease }}>{first}</motion.span>
            </span>
            <span aria-hidden className="block overflow-hidden pb-[0.22em] -mb-[0.1em]">
              <motion.span style={{ x: x2 }} className="text-gradient block italic" initial={init({ y: "100%", opacity: 0 })} animate={go ? { y: 0, opacity: 1 } : undefined} transition={{ delay: 0.12, duration: 1, ease }}>{rest.join(" ")}</motion.span>
            </span>
          </h1>
        </motion.div>

        <motion.div style={{ opacity: subO }} className="absolute bottom-24 z-10 flex max-w-xl flex-col items-center gap-7 px-5 text-center sm:bottom-28">
          <motion.p initial={init({ opacity: 0, y: 16 })} animate={go ? { opacity: 1, y: 0 } : undefined} transition={{ delay: 0.7, duration: 0.8, ease }} className="text-lg sm:text-xl">
            <span className="text-muted-foreground">{t.home.titleA}</span> {t.home.titleB}
          </motion.p>
          <motion.div initial={init({ opacity: 0, y: 16 })} animate={go ? { opacity: 1, y: 0 } : undefined} transition={{ delay: 0.85, duration: 0.8, ease }} className="flex flex-col gap-3 sm:flex-row">
            <button type="button" data-cursor="↓" onClick={() => scrollToSection("gaming")} className="btn-primary">{t.home.explore}</button>
            <button type="button" onClick={() => scrollToSection("web")} className="btn-ghost group">{t.home.build} <span className="inline-block transition group-hover:translate-x-1" aria-hidden>→</span></button>
          </motion.div>
        </motion.div>

        <motion.button type="button" style={{ opacity: subO }} onClick={() => scrollToSection("about")} className="absolute bottom-6 z-10 flex flex-col items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-muted-foreground" aria-label={t.accessibility.scrollHint}>
          {ui.scroll}<ArrowDown className="h-3.5 w-3.5 animate-bounce motion-reduce:animate-none" aria-hidden />
        </motion.button>
      </div>
    </section>
  );
}
