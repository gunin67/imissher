# Gunin Singh — portfolio

Multi-page, scroll-driven portfolio booted from a terminal. Content/assets from `googoogaagaa`, design system and interaction from `terminal-driven-portfolio`.

**Stack:** Vite 5 · React 18 · react-router-dom 6 · Tailwind 3 · framer-motion · Bun.

## Commands
```sh
bun install
bun run dev        # http://localhost:8080
bun run build      # → dist/  (Cloudflare build output)
bun run preview
bun run test
```

## Page layout
One long scroll-driven page (no router): terminal boot → Hero (pinned) → About (+ stacking "What it gives me" cards) → marquee → Gaming (video, pinned horizontal game loop, gallery, profiles) → Web (stacking cards) → Contact. The island nav scroll-spies sections; the terminal supports `goto <section>`.

## Structure
- `src/index.css` — design tokens + the 3 themes (`data-theme="dark|light|custom"`)
- `src/lib/` — app context (theme/lang/intro), terminal command interpreter
- `src/components/{terminal,site,sections,media,motion}`
- `src/data/` — `translations.ts` (en/ne/hi/zh, original copy), `site.ts` (media, links, sections), `ui-strings.ts`
- `assets-original/` — full-size PNGs (not deployed); `public/images/gaming/` — optimised WebP

## Cloudflare
Build command `bun run build`, output `dist`. `public/_redirects` is a harmless SPA fallback; `public/_headers` caches hashed assets.

## ⚠ Gameplay video & Git LFS
`.gitattributes` tracks `*.mp4` with Git LFS, so `public/1015(3).mp4` in the repo is a 133-byte pointer. Cloudflare builds do not fetch LFS objects, so the deployed file is likely that pointer. Fix one of:
1. `git lfs untrack "*.mp4"`, re-add the real 16.5 MB file normally (under GitHub's 100 MB and Cloudflare's 25 MiB limits); or
2. host it (R2/Stream) and set `VITE_GAMEPLAY_VIDEO_URL`.

Until it loads, the player shows a fallback with a YouTube link instead of a broken video.
