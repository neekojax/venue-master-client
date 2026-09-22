/**
 * 页面渲染冒烟探针（开发诊断工具）
 * 用 vite SSR 按需加载指定页面组件，mock 掉 fetchHelper（不发真实请求），
 * 在 happy-dom 环境做客户端渲染并运行 effects，捕获渲染异常。
 *
 * 用法：
 *   node scripts/i18n/render-check.mjs @/pages/fault-machine-monitor
 *   PROBE_LANG=en node scripts/i18n/render-check.mjs @/pages/mining/setting
 */
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { createServer } from "vite";

GlobalRegistrator.register({ url: "http://localhost/" });

// react-responsive / echarts 需要的环境垫片
globalThis.matchMedia ||= (q) => ({
  matches: false, media: q, onchange: null,
  addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {},
  dispatchEvent() { return false; },
});
globalThis.ResizeObserver ||= class { observe() {} unobserve() {} disconnect() {} };
globalThis.IntersectionObserver ||= class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } };
globalThis.scrollTo ||= () => {};
globalThis.HTMLElement.prototype.scrollIntoView ||= () => {};

const target = process.argv[2] || "@/pages/fault-machine-monitor";

// 捕获运行期异常
const caughtErrors = [];
const onError = (e) => caughtErrors.push(String(e?.error?.stack || e?.message || e));
globalThis.window.addEventListener("error", onError);
globalThis.window.addEventListener("unhandledrejection", (e) =>
  caughtErrors.push("REJECTION: " + String(e?.reason?.stack || e?.reason?.message || e?.reason)),
);

/** mock 的 fetchHelper：按 endpoint 返回固定数据，不发网络请求 */
const MOCK_SOURCE = `
const poolRow = {
  id: 101,
  venue_name: "场地A",
  venue_id: 1,
  pool_name: "sub-account-A",
  country: "中国",
  hosted_machine: 10,
  status: 1,
  pool_category: "主矿池",
  theoretical_hashrate: "100",
  is_overclocked: 0,
  overclock_hashrate_per_machine: "0",
  leased_power: "0",
  asset_site_bound: false,
  asset_switch_enabled: 0,
  asset_switch_at: null,
  heat_diss_mode: 1,
  link: "",
  collection: 0,
  account_lease_status: "全部租赁",
  venue_info: { id: 1, venue_name: "场地A" },
};
const assetRow = {
  id: 9, venue_id: 1, pool_id: 101, venue_name: "场地A",
  group_id: "G1", asset_switch_enabled: 0, asset_switch_at: null,
  asset_switch_query_at: null,
};
export const fetchGet = async (endpoint) => {
  if (String(endpoint).includes("MiningPool")) return { code: 200, data: [poolRow] };
  if (String(endpoint).toLowerCase().includes("assetsite")) return { code: 200, data: [assetRow] };
  return { code: 200, data: {} };
};
export const fetchPost = async () => ({ code: 200, data: {} });
export const fetchPut = async () => ({ code: 200, data: {} });
export const fetchPostFile = async () => ({ code: 200, data: {} });
export const fetchDelete = async () => ({ code: 200, data: {} });
`;

const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
  plugins: [
    {
      name: "probe-mock-fetch-helper",
      enforce: "pre",
      resolveId(id) {
        if (id.endsWith("helper/fetchHelper")) return "\0virtual-mock-fetch-helper";
        if (id.endsWith("components/react-echarts")) return "\0virtual-mock-echarts";
        return null;
      },
      load(id) {
        if (id === "\0virtual-mock-fetch-helper") return MOCK_SOURCE;
        if (id === "\0virtual-mock-echarts") {
          return 'export function ReactEcharts() { return null; }';
        }
        return null;
      },
    },
  ],
});

console.log("[probe] target:", target, "| lang:", process.env.PROBE_LANG || "zh");
if (process.env.PROBE_LANG) localStorage.setItem("app-language", process.env.PROBE_LANG);

try {
  const React = (await import("react")).default;
  const { createRoot } = await import("react-dom/client");
  const { QueryClient, QueryClientProvider } = await import("@tanstack/react-query");
  const { MemoryRouter } = await import("react-router-dom");
  await vite.ssrLoadModule("@/locales"); // 先初始化 i18n
  const { default: Page } = await vite.ssrLoadModule(target);
  console.log("[probe] module loaded, client rendering...");

  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 0, refetchOnWindowFocus: false } },
  });
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  await new Promise((resolve) => {
    React.startTransition(() => {
      root.render(
        React.createElement(
          QueryClientProvider,
          { client: qc },
          React.createElement(MemoryRouter, { initialEntries: ["/x"] }, React.createElement(Page)),
        ),
      );
    });
    resolve(undefined);
  });

  // 等待查询解析 + effects 运行
  await new Promise((r) => setTimeout(r, 4000));

  const html = container.innerHTML;
  const fs = await import("node:fs");
  fs.writeFileSync("/tmp/render-out.html", html);
  console.log("RENDER_DONE, html length:", html.length);
  if (html.length < 400) console.log("疑似空白:", html.slice(0, 380));
  if (caughtErrors.length) {
    console.log("捕获异常", caughtErrors.length, "条:");
    for (const e of [...new Set(caughtErrors)].slice(0, 5)) console.log(" -", e.split("\n").slice(0, 4).join("\n   "));
  } else {
    console.log("无运行期异常");
  }
  root.unmount();
} catch (e) {
  console.error("RENDER_FAIL:", e?.message);
  console.error(e?.stack?.split("\n").slice(0, 12).join("\n"));
} finally {
  await vite.close();
  process.exit(0);
}
