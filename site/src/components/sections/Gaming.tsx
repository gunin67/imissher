import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { GAMEPLAY_VIDEO_SRC } from "@/data/site";
import { useMediaQuery } from "@/hooks/use-media-query";
import Reveal from "@/components/motion/Reveal";
import CountUp from "@/components/motion/CountUp";
import VideoPlayer from "@/components/media/VideoPlayer";
import ScreenshotGallery from "@/components/media/ScreenshotGallery";
import SectionHead from "./SectionHead";

/** Pinned horizontal showcase on desktop; plain stacked cards on mobile / reduced motion. */
function GameLoop() {
  const { t } = useApp();
  const reduced = useReducedMotion();
  const desktop = useMediaQuery("(min-width: 768px)");
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const lines = t.gaming.loopLines;
  const x = useTransform(p, [0.04, 0.96], ["0%", `-${((lines.length - 1.4) / lines.length) * 100}%`]);
  const head = (
    <div className="container-wide mb-10 flex items-end justify-between">
      <div><p className="eyebrow mb-3"><span className="text-foreground">04</span> — {t.gaming.loop}</p><h3 className="h-display text-4xl md:text-6xl">{t.gaming.loop}</h3></div>
      <span className="label-mono flex items-center gap-2"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success motion-reduce:animate-none" aria-hidden />{t.gaming.live}</span>
    </div>
  );
  if (!desktop || reduced) {
    return (
      <div className="py-20">
        {head}
        <ol className="container-wide grid gap-4 md:grid-cols-2">
          {lines.map((l, i) => <li key={l} className="list-none"><Reveal><div className="rounded-3xl border bg-card p-7"><p className="label-mono mb-6">0{i + 1}</p><p className="h-display text-2xl leading-[1.2]">{l}</p></div></Reveal></li>)}
        </ol>
      </div>
    );
  }
  return (
    <div ref={ref} className="relative" style={{ height: `${lines.length * 60}vh` }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        {head}
        <motion.div style={{ x }} className="will-transform flex h-[46vh] gap-6 pl-6 lg:gap-10 lg:pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]">
          {lines.map((l, i) => (
            <article key={l} className="flex h-full w-[36vw] max-w-[34rem] shrink-0 flex-col justify-between rounded-3xl border bg-card p-8 shadow-elevated">
              <p className="label-mono">0{i + 1} / 0{lines.length}</p>
              <p className="h-display text-3xl leading-[1.15]">{l}</p>
            </article>
          ))}
        </motion.div>
        <div className="container-wide mt-10" aria-hidden><div className="h-px bg-border"><motion.div style={{ scaleX: p }} className="h-px origin-left bg-foreground" /></div></div>
      </div>
    </div>
  );
}

export default function Gaming() {
  const { t } = useApp();
  const youtube = t.gaming.profilesList.find((x) => x.label === "YouTube")?.url;
  const stats = [
    { label: t.gaming.statGames, value: t.gaming.statGamesValue },
    { label: t.gaming.statSpeed, value: t.gaming.statSpeedValue },
    { label: t.gaming.statStyle, value: t.gaming.statStyleValue },
  ];
  return (
    <section id="gaming" className="relative pt-12 md:pt-24" aria-labelledby="gaming-title">
      <div className="container-wide">
        <SectionHead id="gaming-title" index="03" eyebrow={t.gaming.eyebrow} title={t.gaming.title} />
        <VideoPlayer src={GAMEPLAY_VIDEO_SRC} title={t.gaming.montage} label={t.gaming.montageLabel} fallbackHref={youtube} />
        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="rounded-2xl border bg-card/60 p-5">
              <dt className="label-mono">{s.label}</dt>
              <dd className="mt-4 font-display text-3xl md:text-4xl"><CountUp value={s.value} /></dd>
            </Reveal>
          ))}
        </dl>
      </div>

      <GameLoop />

      <div className="container-wide py-16 md:py-28">
        <Reveal className="mb-12"><p className="eyebrow mb-3"><span className="text-foreground">05</span> — {t.gaming.gallery}</p><h3 className="h-display text-4xl md:text-6xl">{t.gaming.gallery}</h3></Reveal>
        <ScreenshotGallery />
      </div>

      <div className="container-wide pb-24 pt-10 md:pb-40">
        <Reveal className="mb-8 flex items-end justify-between"><h3 className="h-display text-4xl md:text-6xl">{t.gaming.profiles}</h3><span className="label-mono">{t.gaming.social}</span></Reveal>
        <ul className="border-t">
          {t.gaming.profilesList.map((pf) => (
            <li key={pf.label} className="border-b">
              <a href={pf.url} target="_blank" rel="noopener noreferrer" data-cursor="↗" className="group flex items-center justify-between gap-6 py-6 md:py-8">
                <span className="label-mono w-24 shrink-0">{pf.label}</span>
                <span className="h-display flex-1 truncate text-2xl transition duration-500 group-hover:translate-x-3 md:text-5xl">{pf.handle}</span>
                <ArrowUpRight className="h-6 w-6 shrink-0 text-muted-foreground transition duration-500 group-hover:rotate-45 group-hover:text-foreground" aria-hidden />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
