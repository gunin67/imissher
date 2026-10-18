import { useState } from "react";
import { ImageOff } from "lucide-react";
import { useApp } from "@/lib/app-context";

interface Props {
  src: string; srcSet?: string; sizes?: string; alt: string; width: number; height: number;
  className?: string; eager?: boolean;
}

/** Lazy, size-hinted image that degrades to a labelled placeholder instead of a broken-image icon. */
export default function ResponsiveImage({ src, srcSet, sizes = "(min-width: 1024px) 40vw, 90vw", alt, width, height, className = "", eager }: Props) {
  const { ui } = useApp();
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div role="img" aria-label={alt} style={{ aspectRatio: `${width} / ${height}` }}
        className={`flex flex-col items-center justify-center gap-3 bg-surface-2 p-6 text-center text-muted-foreground ${className}`}>
        <ImageOff className="h-6 w-6" aria-hidden />
        <span className="label-mono">{ui.imageUnavailable}</span>
      </div>
    );
  }
  return (
    <img src={src} srcSet={srcSet} sizes={sizes} alt={alt} width={width} height={height}
      loading={eager ? "eager" : "lazy"} decoding="async" onError={() => setFailed(true)} className={className} />
  );
}
