/// <reference types="vite/client" />

/**
 * Typed shape of the public Vite environment variables.
 * Keep in sync with `.env.example`.
 */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_APP_ENV?: 'development' | 'production' | 'test';
  /** 'mock' (default) | 'api'. Unsupported values raise a config error. */
  readonly VITE_DATA_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
