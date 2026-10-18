/**
 * Non-translated site content, taken from the original `googoogaagaa` project.
 * Translated copy lives in ./translations.ts; extra UI strings in ./ui-strings.ts.
 */
export const SITE = {
  name: "Gunin Singh",
  initials: "GS",
  email: "rockstarjaynin@gmail.com",
  /** One-page sections, in scroll order. `id` is the anchor, `key` the translated nav label. */
  sections: [
    { key: "home", id: "home" },
    { key: "about", id: "about" },
    { key: "gaming", id: "gaming" },
    { key: "web", id: "web" },
    { key: "contact", id: "contact" },
  ],
  /** Stack tags shown on the home page (from the original Home “Creative stack” card). */
  stack: ["Interface", "Motion", "Code", "Playful systems", "Cinematics"],
} as const;

export type SectionId = (typeof SITE.sections)[number]["id"];

export const scrollToSection = (id: string) => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
};

/**
 * Gameplay montage. Override with VITE_GAMEPLAY_VIDEO_URL (e.g. an R2 / Stream URL)
 * without touching code. The default is the file that already lives in /public.
 */
export const GAMEPLAY_VIDEO_SRC: string =
  (import.meta.env.VITE_GAMEPLAY_VIDEO_URL as string | undefined) || "/1015(3).mp4";

/** Optimised WebP renditions generated from the original Steam-library photos (see assets-original/). */
const img = (n: number) => ({
  src: `/images/gaming/steam-library-${n}-1080.webp`,
  srcSet: [640, 1080, 1600].map((w) => `/images/gaming/steam-library-${n}-${w}.webp ${w}w`).join(", "),
  full: `/images/gaming/steam-library-${n}-1600.webp`,
  width: 1080,
  height: 1440, // 2480×3307 source, 3:4 portrait
});

export const LIBRARY_IMAGES = [
  { ...img(1), alt: "Photo of my Steam library on a monitor, showing the games list scrolled to the lower titles." },
  { ...img(2), alt: "Photo of my Steam library on a monitor, showing the Favorites and Uncategorized game lists." },
];

/** Original English copy from the Gaming page (never had translations). */
export const GAMING_PILLARS = [
  { label: "Observation", text: "Every game teaches rhythm, feedback, and intention." },
  { label: "Systems", text: "I love the logic behind polished interactive worlds." },
  { label: "Flow", text: "Responsive movement and smooth pacing shape the best experiences." },
  { label: "Craft", text: "The best digital spaces are made with feel, not just function." },
];
export const GAMING_NOTE =
  "Gaming sharpened my instinct for composition, timing, and clarity. It taught me to read pressure, adapt quickly, and keep the experience feeling smooth even when the pace is intense.";
