import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Maximize, Pause, Play, Volume2, VolumeX, VideoOff } from "lucide-react";
import { useApp } from "@/lib/app-context";

interface Props { src: string; title: string; label: string; fallbackHref?: string }

const fmt = (s: number) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");

/**
 * Cinematic video frame with custom controls.
 *  - Muted autoplay-loop only while on screen, and never with reduced-motion.
 *  - If the file can’t load (missing, or a Git-LFS pointer instead of the real video) it shows a
 *    terminal-style fallback with a link instead of a dead player.
 */
export default function VideoPlayer({ src, title, label, fallbackHref }: Props) {
  const { ui } = useApp();
  const reduced = useReducedMotion();
  const frame = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const inView = useInView(frame, { amount: 0.5 });
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const { scrollYProgress: p } = useScroll({ target: frame, offset: ["start end", "center center"] });
  const scale = useTransform(p, [0, 1], [reduced ? 1 : 0.9, 1]);
  const radius = useTransform(p, [0, 1], [reduced ? 16 : 40, 16]);

  // play while visible, pause when scrolled away
  useEffect(() => {
    const v = video.current;
    if (!v || failed || reduced) return;
    if (inView) v.play().catch(() => undefined); else v.pause();
  }, [inView, failed, reduced]);

  // “loaded” watchdog: a text/LFS response often never fires an error on some browsers
  useEffect(() => {
    if (ready || failed) return;
    const id = window.setTimeout(() => { if (!ready && (video.current?.readyState ?? 0) < 1) setFailed(true); }, 12000);
    return () => window.clearTimeout(id);
  }, [ready, failed]);

  const toggle = () => { const v = video.current; if (!v) return; if (v.paused) v.play().catch(() => undefined); else v.pause(); };
  const toggleMute = () => { const v = video.current; if (!v) return; v.muted = !v.muted; setMuted(v.muted); };
  const fullscreen = () => {
    const el = frame.current;
    if (!el) return;
    if (document.fullscreenElement) { void document.exitFullscreen(); return; }
    if (el.requestFullscreen) void el.requestFullscreen();
    else (video.current as unknown as { webkitEnterFullscreen?: () => void })?.webkitEnterFullscreen?.();
  };

  return (
    <motion.div ref={frame} style={{ scale, borderRadius: radius }} className="will-transform relative overflow-hidden border bg-card shadow-elevated">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <span className="label-mono flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />{title}</span>
        <span className="label-mono">{label}</span>
      </div>

      {failed ? (
        <div className="scanlines flex aspect-video flex-col items-center justify-center gap-5 bg-terminal p-6 text-center font-mono text-sm text-terminal-foreground">
          <VideoOff className="h-8 w-8 text-terminal-muted" aria-hidden />
          <p><span className="text-terminal-muted">$ play</span> {title.toLowerCase().replace(/\s+/g, "-")}.mp4<br /><span className="text-destructive">{ui.videoUnavailable}</span></p>
          {fallbackHref && <a href={fallbackHref} target="_blank" rel="noopener noreferrer" className="btn-primary">{ui.watchElsewhere} ↗</a>}
        </div>
      ) : (
        <div className="group relative aspect-video bg-black">
          {/* poster state until the first frame is ready */}
          {!ready && (
            <div className="scanlines absolute inset-0 grid place-items-center bg-terminal" aria-hidden>
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-terminal-muted">▶ {title}</span>
            </div>
          )}
          <video
            ref={video}
            className="h-full w-full object-cover"
            src={`${src}${src.includes("#") ? "" : "#t=0.1"}`}
            muted={muted} loop playsInline preload="metadata"
            aria-label={`${title} — ${label}`}
            onLoadedData={() => setReady(true)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
            onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
            onError={() => setFailed(true)}
            onClick={toggle}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

          <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 px-3 pb-3 pt-10 text-white opacity-100 transition duration-300 sm:px-4 md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
            <button type="button" onClick={toggle} aria-label={playing ? ui.pause : ui.play} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/30">
              {playing ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
            </button>
            <input
              type="range" min={0} max={duration || 0} step={0.1} value={time} aria-label={ui.seek}
              onChange={(e) => { const v = video.current; if (v) { v.currentTime = Number(e.target.value); setTime(v.currentTime); } }}
              className="h-1 min-w-0 flex-1 cursor-pointer accent-white"
            />
            <span className="hidden font-mono text-[11px] tabular-nums sm:block">{fmt(time)} / {fmt(duration)}</span>
            <button type="button" onClick={toggleMute} aria-label={muted ? ui.unmute : ui.mute} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/30">
              {muted ? <VolumeX className="h-4 w-4" aria-hidden /> : <Volume2 className="h-4 w-4" aria-hidden />}
            </button>
            <button type="button" onClick={fullscreen} aria-label={ui.fullscreen} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/30">
              <Maximize className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
