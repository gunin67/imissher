import { useEffect, useRef, useState } from "react";

const TRAIL = 12;

/** Custom cursor (fine pointers only, off for reduced-motion). The native cursor is hidden only while this is active. */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const trail = useRef<(HTMLDivElement | null)[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState("");
  const [state, setState] = useState<"idle" | "hover" | "text" | "down">("idle");

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    const m = { x: innerWidth / 2, y: innerHeight / 2 };
    const r = { ...m };
    const pts = Array.from({ length: TRAIL }, () => ({ ...m }));
    let raf = 0;
    let visible = false;

    const move = (e: PointerEvent) => {
      m.x = e.clientX; m.y = e.clientY;
      if (!visible) { visible = true; [dot.current, ring.current].forEach((el) => el && (el.style.opacity = "1")); }
      const target = (e.target as HTMLElement)?.closest<HTMLElement>("a,button,[data-cursor],input,textarea,select,[role=button],video");
      if (!target) { setState("idle"); setLabel(""); return; }
      if (target.matches("input,textarea")) { setState("text"); setLabel(""); return; }
      setState("hover"); setLabel(target.dataset["cursor"] ?? "");
    };
    const down = () => setState((s) => (s === "text" ? s : "down"));
    const up = () => setState((s) => (s === "down" ? "hover" : s));
    const leave = () => { visible = false; [dot.current, ring.current].forEach((el) => el && (el.style.opacity = "0")); };

    const loop = () => {
      r.x += (m.x - r.x) * 0.18; r.y += (m.y - r.y) * 0.18;
      if (dot.current) dot.current.style.transform = `translate3d(${m.x}px,${m.y}px,0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${r.x}px,${r.y}px,0)`;
      let px = m.x, py = m.y;
      pts.forEach((p, i) => {
        p.x += (px - p.x) * 0.38; p.y += (py - p.y) * 0.38; px = p.x; py = p.y;
        const el = trail.current[i];
        if (el) el.style.transform = `translate3d(${p.x}px,${p.y}px,0) scale(${1 - i / TRAIL})`;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.removeEventListener("pointerleave", leave);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  if (!enabled) return null;
  const size = state === "hover" ? (label ? 84 : 56) : state === "text" ? 4 : state === "down" ? 26 : 36;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] mix-blend-difference">
      {Array.from({ length: TRAIL }).map((_, i) => (
        <div key={i} ref={(el) => { trail.current[i] = el; }} className="absolute -left-[3px] -top-[3px] h-1.5 w-1.5 rounded-full bg-white" style={{ opacity: 0.35 * (1 - i / TRAIL) }} />
      ))}
      <div ref={ring} className="absolute left-0 top-0 opacity-0 transition-opacity duration-300">
        <div
          className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white transition-[width,height,background-color] duration-300 ease-out"
          style={{ width: size, height: state === "text" ? 28 : size, backgroundColor: state === "hover" ? "#fff" : "transparent" }}
        >
          {label && <span className="font-mono text-[10px] uppercase tracking-widest text-black">{label}</span>}
        </div>
      </div>
      <div ref={dot} className="absolute -left-[3px] -top-[3px] h-1.5 w-1.5 rounded-full bg-white opacity-0" />
    </div>
  );
}
