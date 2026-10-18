import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";

function Word({ children, p, range }: { children: string; p: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(p, range, [0.14, 1]);
  return <motion.span style={{ opacity }} className="inline-block whitespace-pre">{children}</motion.span>;
}

/** Word-by-word reveal tied to scroll position. Screen readers get the full sentence once. */
export default function ScrollText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });
  if (reduced) return <p className={className}>{text}</p>;
  const cjk = /[\u4e00-\u9fff]/.test(text);
  const tokens = cjk ? Array.from(text) : text.split(/(\s+)/).filter(Boolean);
  const words = tokens.filter((tk) => tk.trim());
  let w = -1;
  return (
    <p ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {tokens.map((tk, i) => {
          if (!tk.trim()) return <span key={i}>{tk}</span>;
          w += 1;
          return <Word key={i} p={scrollYProgress} range={[w / words.length, Math.min((w + 1.6) / words.length, 1)]}>{tk}</Word>;
        })}
      </span>
    </p>
  );
}
