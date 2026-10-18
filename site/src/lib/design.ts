/**
 * Motion tokens for framer-motion — kept in sync with the CSS tokens in index.css
 * (--ease-out-expo, --ease-in-out-expo, --dur-*).
 */
export const ease = [0.16, 1, 0.3, 1] as const;
export const easeInOut = [0.7, 0, 0.2, 1] as const;
export const spring = { type: "spring", stiffness: 380, damping: 32 } as const;
export const dur = { fast: 0.2, med: 0.45, slow: 0.9 } as const;
/** Page-transition timing (ms). Keep the total well under ~700ms so navigation never feels slow. */
export const PAGE_COVER_MS = 300;
export const PAGE_UNCOVER_MS = 380;
