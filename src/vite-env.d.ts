/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_APP_BASE_URL: string;
  readonly VITE_APP_API_URL: string;
  readonly VITE_APP_TITLE_SUFFIX: string;
  readonly VITE_COOKIE_DOMAIN: string;
  readonly VITE_ASSET_APP_URL: string;
  readonly VITE_MAINTENANCE_APP_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
