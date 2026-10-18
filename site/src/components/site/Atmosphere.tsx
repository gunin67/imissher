import { motion, useMotionTemplate, useScroll, useTransform } from "framer-motion";

/** Fixed ambient layer: gradient light that drifts with scroll + film grain. Purely decorative. */
export default function Atmosphere() {
  const { scrollYProgress } = useScroll();
  const gx = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], ["50%", "15%", "85%", "50%"]);
  const gy = useTransform(scrollYProgress, [0, 0.5, 1], ["0%", "40%", "100%"]);
  const bg = useMotionTemplate`${gx} ${gy}`;
  return (
    <div aria-hidden className="pointer-events-none">
      <motion.div className="bg-atmosphere fixed inset-0 -z-10" style={{ ["--gx" as string]: gx, ["--gy" as string]: gy, backgroundPosition: bg }} />
      <div className="grain" />
    </div>
  );
}
