import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

/** “20+” → counts 0 → 20 when visible, keeping the suffix. Non-numeric values render as-is. */
export default function CountUp({ value, className }: { value: string; className?: string }) {
  const m = value.match(/^(\d+)(.*)$/);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const reduced = useReducedMotion();
  const [n, setN] = useState(reduced || !m ? Number(m?.[1] ?? 0) : 0);
  useEffect(() => {
    if (!m || !inView || reduced) return;
    const c = animate(0, Number(m[1]), { duration: 1.4, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value, reduced]);
  if (!m) return <span className={className}>{value}</span>;
  return <span ref={ref} className={className} aria-label={value}><span aria-hidden>{n}{m[2]}</span></span>;
}
