import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from "framer-motion";

/** Two rows driven by scroll position, skewed by scroll velocity. Duplicate content is hidden from assistive tech. */
export default function Marquee({ items }: { items: readonly string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress: p, scrollY } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const vel = useSpring(useVelocity(scrollY), { stiffness: 200, damping: 50 });
  const skew = useTransform(vel, [-2000, 2000], reduced ? [0, 0] : [-8, 8]);
  const x1 = useTransform(p, [0, 1], reduced ? ["0%", "0%"] : ["0%", "-40%"]);
  const x2 = useTransform(p, [0, 1], reduced ? ["0%", "0%"] : ["-40%", "0%"]);
  const row = [...items, ...items, ...items];
  return (
    <div ref={ref} className="overflow-hidden border-y bg-surface-2/50 py-8 md:py-10" role="list" aria-label={items.join(", ")}>
      {[x1, x2].map((x, r) => (
        <motion.div key={r} style={{ x, skewX: skew }} className="flex whitespace-nowrap py-2" aria-hidden={r === 1 || undefined}>
          {row.map((s, i) => (
            <span key={i} className={`mx-6 flex items-center gap-6 font-display text-4xl md:text-7xl ${r ? "text-transparent [-webkit-text-stroke:1px_hsl(var(--muted-foreground))]" : ""}`}>
              {s}<span className="text-xl text-muted-foreground" aria-hidden>✦</span>
            </span>
          ))}
        </motion.div>
      ))}
    </div>
  );
}
