/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_METRO_API: string
  readonly VITE_API_KEY: string
  readonly VITE_DEV_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
