import path from "node:path";
import type { Plugin } from "vite";
import { defineConfig } from "vite";
import { compression } from "vite-plugin-compression2";
import svgr from "vite-plugin-svgr";
import react from "@vitejs/plugin-react-swc";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

export function setupHtmlPlugin(buildTime: string) {
  const plugin: Plugin = {
    name: "html-plugin",
    apply: "build",
    transformIndexHtml(html) {
      return html.replace("<head>", `<head>\n    <meta name="buildTime" content="${buildTime}">`);
    },
  };

  return plugin;
}
dayjs.extend(utc);
dayjs.extend(timezone);
const buildTime = dayjs.tz(Date.now(), "Asia/Shanghai").format("YYYY-MM-DD HH:mm:ss");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    setupHtmlPlugin(buildTime),
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
  },
});
