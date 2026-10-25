/**
 * 前端运行时配置。
 *
 * 由**后端**输出（GET /admin-api/runtime-config.js），index.html 里用
 * <script src="/admin-api/runtime-config.js"></script> 引入，浏览器会先执行它、
 * 再加载业务模块，所以模块里随时都能读到。
 *
 * 为什么不用构建期的 .env 值：共享 cookie 域（几个应用联合登录要写在同一个父域上）、
 * 跨系统跳转地址这类值**按环境变化**。写死在前端 .env 里意味着换环境要重新构建前端，
 * 而且几个应用各写各的，很容易某个环境漏改 ⇒ 联合登录静默失效。
 * 放到各应用自己的后端配置（部署环境走 Apollo）后，改配置不用重新构建。
 *
 * 取值顺序：后端运行时配置 → 构建期 .env → 空（host-only，各环境天然隔离）。
 */
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
  return (typeof window !== "undefined" && window.__RUNTIME_CONFIG__) || {};
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
