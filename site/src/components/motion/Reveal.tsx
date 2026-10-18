import { motion, useReducedMotion } from "framer-motion";
import type { ElementType, ReactNode } from "react";
import { ease } from "@/lib/design";

const cache = new Map<ElementType, ReturnType<typeof motion.create>>();
const getMotion = (tag: ElementType) => {
  let c = cache.get(tag);
  if (!c) { c = motion.create(tag as "div"); cache.set(tag, c); }
  return c;
};

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  blur?: boolean;
  as?: ElementType;
  /** viewport margin, negative = trigger a bit later */
  margin?: string;
}

/** Fade + rise when scrolled into view (once). Renders a plain element when reduced motion is requested. */
export default function Reveal({ children, className, delay = 0, y = 28, blur = false, as = "div", margin = "-10%" }: RevealProps) {
  const reduced = useReducedMotion();
  const Tag = as as ElementType;
  if (reduced) return <Tag className={className}>{children}</Tag>;
  const M = getMotion(Tag) as typeof motion.div;
  return (
    <M
      className={className}
      initial={{ opacity: 0, y, filter: blur ? "blur(8px)" : "blur(0px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin }}
      transition={{ duration: 0.9, delay, ease }}
    >
      {children}
    </M>
  );
}
