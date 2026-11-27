/** UAT 在页面启动时加载后端配置，其他环境使用各自的 Vite 配置。 */
export interface RuntimeConfig {
  /** 共享 cookie 的父域，如 ecohash-inc.com；空 = 按当前 host 存储 */
  cookieDomain?: string;
  /** 资产系统前端地址 */
  assetAppUrl?: string;
  /** 维修管理系统前端地址 */
  maintenanceAppUrl?: string;
  /** 环境标识（uat/prd），仅用于排障 */
  env?: string;
}

declare global {
  interface Window {
    __RUNTIME_CONFIG__?: RuntimeConfig;
  }
}

/** 读后端下发的运行时配置；取不到时返回空对象（调用方自行兜底） */
export function getRuntimeConfig(): RuntimeConfig {
  if (import.meta.env.MODE === "uat" && typeof window !== "undefined") {
    return window.__RUNTIME_CONFIG__ || {};
  }
  return {};
}

/** 共享 cookie 域：后端配置优先，其次构建期 .env */
export function getCookieDomain(): string {
  return getRuntimeConfig().cookieDomain || import.meta.env.VITE_COOKIE_DOMAIN || "";
}

/** 资产系统前端地址：后端配置优先，其次构建期 .env */
export function getAssetAppUrl(): string {
  return getRuntimeConfig().assetAppUrl || import.meta.env.VITE_ASSET_APP_URL || "";
}

/** 维修管理系统前端地址：后端配置优先，其次构建期 .env */
export function getMaintenanceAppUrl(): string {
  return getRuntimeConfig().maintenanceAppUrl || import.meta.env.VITE_MAINTENANCE_APP_URL || "";
}
