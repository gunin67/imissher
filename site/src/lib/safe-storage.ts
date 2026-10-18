/** localStorage / sessionStorage can throw (Safari private mode, blocked cookies). Never let that break the site. */
const wrap = (get: () => Storage) => ({
  get(key: string): string | null {
    try { return get().getItem(key); } catch { return null; }
  },
  set(key: string, value: string) {
    try { get().setItem(key, value); } catch { /* ignore */ }
  },
});
export const local = wrap(() => window.localStorage);
export const session = wrap(() => window.sessionStorage);
