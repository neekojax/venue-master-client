import path from "node:path";
import process from "node:process";
import type { HtmlTagDescriptor, Plugin } from "vite";
import { defineConfig, loadEnv } from "vite";
import { compression } from "vite-plugin-compression2";
import svgr from "vite-plugin-svgr";
import react from "@vitejs/plugin-react-swc";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

export function setupHtmlPlugin(buildTime: string, isUat: boolean) {
  const plugin: Plugin = {
    name: "html-plugin",
    apply: "build",
    transformIndexHtml() {
      const tags: HtmlTagDescriptor[] = [
        { tag: "meta", attrs: { name: "buildTime", content: buildTime }, injectTo: "head-prepend" },
      ];
      if (isUat) {
        tags.push({ tag: "script", attrs: { defer: true, src: "/admin-api/runtime-config.js" }, injectTo: "head-prepend" });
      }
      return tags;
    },
  };

  return plugin;
}
dayjs.extend(utc);
dayjs.extend(timezone);
const buildTime = dayjs.tz(Date.now(), "Asia/Shanghai").format("YYYY-MM-DD HH:mm:ss");

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Jenkins 已向现有 UAT 作业传入 APP_NAME 和 ENV，本地构建沿用 Vite 的默认模式。
  const isUatBuild = command === "build" && process.env.APP_NAME === "mining-ops-front" && process.env.ENV === "uat";
  const buildMode = isUatBuild && mode === "production" ? "uat" : mode;
  const env = loadEnv(buildMode, process.cwd());

  // 仅供本地开发使用的后端地址，配置在 .env.development，不进入构建产物
  const devProxyTarget = env.VITE_DEV_PROXY_TARGET || "http://localhost:8080";

  return {
    mode: buildMode,
    plugins: [
      react(),
      setupHtmlPlugin(buildTime, buildMode === "uat"),
      { ...compression(), apply: "build" },
      svgr({
        svgrOptions: {
          plugins: ["@svgr/plugin-svgo", "@svgr/plugin-jsx"],
          svgoConfig: {
            floatPrecision: 2,
          },
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    optimizeDeps: {
      include: ["echarts", "echarts/core", "echarts/charts", "echarts/components", "echarts/renderers"],
    },
    define: {
      BUILD_TIME: JSON.stringify(buildTime),
    },
    build: {
      outDir: "dist",
      assetsDir: "assets",
      target: "es2015",
      cssTarget: "chrome61",
      rollupOptions: {
        output: {
          compact: true, // 开启紧凑模式
          chunkFileNames: "js/[name]-[hash].js",
          entryFileNames: "js/[name]-[hash].js",
          assetFileNames: "[ext]/[name]-[hash].[ext]",
          manualChunks: {
            react: ["react", "react-dom", "react-router-dom", "zustand"],
            antd: ["antd", "dayjs"],
          },
        },
      },
    },
    server: {
      host: "0.0.0.0",
      watch: {
        usePolling: true,
      },
      // 仅 vite dev 生效（不影响 build）：前端用同域相对路径 /admin-api，
      // 这里转发到本地后端；后端路由前缀本身即 /admin-api，故不做 rewrite
      proxy: {
        "/api/fault-predictions": {
          target: "http://127.0.0.1:8090",
          changeOrigin: true,
        },
        "/admin-api": {
          target: devProxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
