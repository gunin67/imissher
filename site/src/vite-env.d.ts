/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional absolute/relative URL for the gameplay montage (e.g. an R2 or Stream URL). */
  readonly VITE_GAMEPLAY_VIDEO_URL?: string;
}
interface ImportMeta { readonly env: ImportMetaEnv; }
