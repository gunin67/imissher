import { useCallback, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { useRef } from "react";
import { useApp } from "@/lib/app-context";
import { LIBRARY_IMAGES } from "@/data/site";
import ResponsiveImage from "./ResponsiveImage";
import Reveal from "@/components/motion/Reveal";

type Shot = (typeof LIBRARY_IMAGES)[number];

function Lightbox({ shots, index, setIndex, onClose }: { shots: Shot[]; index: number | null; setIndex: (i: number) => void; onClose: () => void }) {
  const { ui, t } = useApp();
  const reduced = useReducedMotion();
  const open = index !== null;
  const step = useCallback((d: number) => setIndex(((index ?? 0) + d + shots.length) % shots.length), [index, shots.length, setIndex]);

  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [open, step]);

  const shot = shots[index ?? 0];
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[120] bg-background/90 backdrop-blur-md data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-0 z-[121] flex flex-col items-center justify-center gap-4 p-4 outline-none" aria-describedby={undefined}>
          <Dialog.Title className="sr-only">{t.gaming.gallery} {(index ?? 0) + 1}/{shots.length}</Dialog.Title>
          <Dialog.Close className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border bg-card/80 transition hover:bg-accent" aria-label={ui.close}>
            <X className="h-5 w-5" aria-hidden />
          </Dialog.Close>
          <div className="relative flex min-h-0 w-full max-w-3xl flex-1 items-center justify-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={shot.full}
                src={shot.full}
                alt={shot.alt}
                initial={reduced ? false : { opacity: 0, scale: 0.97, x: 24 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={reduced ? undefined : { opacity: 0, scale: 0.97, x: -24 }}
                transition={{ duration: 0.28 }}
                drag={shots.length > 1 ? "x" : false} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.25}
                onDragEnd={(_, info) => { if (Math.abs(info.offset.x) > 80) step(info.offset.x < 0 ? 1 : -1); }}
                className="max-h-full max-w-full touch-pan-y select-none rounded-xl border object-contain shadow-elevated"
              />
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => step(-1)} aria-label={ui.prev} className="grid h-11 w-11 place-items-center rounded-full border bg-card/80 transition hover:bg-accent"><ChevronLeft className="h-5 w-5" aria-hidden /></button>
            <span className="label-mono tabular-nums" aria-live="polite">{(index ?? 0) + 1} / {shots.length}</span>
            <button type="button" onClick={() => step(1)} aria-label={ui.next} className="grid h-11 w-11 place-items-center rounded-full border bg-card/80 transition hover:bg-accent"><ChevronRight className="h-5 w-5" aria-hidden /></button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Two portrait Steam-library photos with parallax offset, plus an accessible full-screen lightbox. */
export default function ScreenshotGallery() {
  const { t, ui } = useApp();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y2 = useTransform(p, [0, 1], [reduced ? 0 : 80, reduced ? 0 : -80]);
  const [active, setActive] = useState<number | null>(null);

  return (
    <div ref={ref} className="grid gap-6 sm:grid-cols-2 sm:gap-10">
      {LIBRARY_IMAGES.map((shot, i) => (
        <motion.div key={shot.src} style={{ y: i === 1 ? y2 : 0 }} className={i === 1 ? "sm:mt-24" : ""}>
          <Reveal y={50}>
            <button
              type="button"
              onClick={() => setActive(i)}
              aria-label={`${ui.openImage} (${i + 1}/${LIBRARY_IMAGES.length})`}
              data-cursor="↗"
              className="group relative block w-full overflow-hidden rounded-2xl border bg-card text-left shadow-elevated"
            >
              <div className="flex items-center justify-between border-b px-4 py-3">
                <span className="label-mono">{t.gaming.gallery}</span>
                <span className="label-mono tabular-nums">0{i + 1}</span>
              </div>
              <div className="overflow-hidden">
                <ResponsiveImage {...shot} sizes="(min-width: 640px) 45vw, 92vw" className="aspect-[3/4] w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
              </div>
              <span className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-background/80 opacity-0 backdrop-blur transition group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden>
                <Maximize2 className="h-4 w-4" />
              </span>
            </button>
          </Reveal>
        </motion.div>
      ))}
      <Lightbox shots={LIBRARY_IMAGES} index={active} setIndex={setActive} onClose={() => setActive(null)} />
    </div>
  );
}
