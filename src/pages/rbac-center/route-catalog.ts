import type { FrontendRoute } from "./api";

export function sortRoutes<T extends FrontendRoute>(routes: T[]): T[] {
  return [...routes].sort((a, b) => (a.list_order ?? 0) - (b.list_order ?? 0));
}

export function parentRoutePaths(routes: FrontendRoute[]): string[] {
  const paths = new Set(routes.map((route) => route.path));
  return Array.from(
    new Set(routes.map((route) => route.parent_path).filter((path) => path && paths.has(path))),
  );
}

export function routeDepth(route: FrontendRoute, routes: FrontendRoute[]): number {
  const byPath = new Map(routes.map((item) => [item.path, item]));
  const seen = new Set([route.path]);
  let parentPath = route.parent_path;
  let depth = 0;
  while (parentPath && !seen.has(parentPath)) {
    depth += 1;
    seen.add(parentPath);
    parentPath = byPath.get(parentPath)?.parent_path || "";
  }
  return depth;
}

export function groupRoutes<T extends FrontendRoute>(routes: T[]): Array<[string, T[]]> {
  const groups = new Map<string, T[]>();
  sortRoutes(routes).forEach((route) => {
    const group = route.navigation?.trim() || "其他页面";
    groups.set(group, [...(groups.get(group) || []), route]);
  });
  return Array.from(groups.entries());
}

// 详情/跳转类页面的精确入口提示。数据模型只记录父页面，不记录「点哪里」；
// 这里按路径前缀维护真实交互入口（依据各页面代码核实，页面交互调整时需同步更新）。
const entryHints: Array<[prefix: string, hint: string]> = [
  ["/venue/detail", "点击场地名称进入"],
  ["/venue/weekly-report", "点击「查看更多周报」按钮进入"],
  ["/venue/environment/history", "点击页面顶部的场地名称进入"],
  ["/report/daily-list", "点击「查看更多事件」按钮进入"],
  ["/custody-menu/statisticsDetail", "点击表格行进入"],
  ["/report/data-summary/list", "点击效率卡片的「查看更多」进入"],
  ["/report/data-summary/profit-list", "点击利润卡片的「查看更多」进入"],
  ["/hash-detail", "点击首页「矿池算力」卡片进入"],
  ["/profit-detail", "点击首页「效益」卡片进入"],
  ["/pool-hash/history", "点击矿池名称进入"],
  ["/pool-profit/history", "点击矿池名称进入"],
  ["/recent-sub-account-status", "点击「查看历史状态」链接进入"],
  ["/mining/farm-monitor/abnormal-history", "从矿机监控页进入"],
  ["/mining/farm-monitor/miner-anomaly-history", "点击「昨日异常矿工」卡片进入"],
  ["/mining/farm-monitor/daily-mac-stats", "点击矿机监控概览中「昨日变化」卡片的「更多」进入"],
  ["/mining/farm-monitor/miner-power", "点击矿机监控概览中「昨日功耗」卡片的「更多」进入"],
];

const entryHintOf = (path: string): string =>
  entryHints.find(
    ([prefix]) => path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}:`),
  )?.[1] || "";

// 「如何点进去」指引：侧边栏「菜单」→ 父页面 → 当前页；详情页标注从父页面点击进入。
export function routeClickPath(route: FrontendRoute, routes: FrontendRoute[]): string {
  const byPath = new Map(routes.map((item) => [item.path, item]));
  const ancestors: FrontendRoute[] = [];
  const seen = new Set([route.path]);
  let parentPath = route.parent_path;
  while (parentPath && !seen.has(parentPath)) {
    const parent = byPath.get(parentPath);
    if (!parent) break;
    ancestors.unshift(parent);
    seen.add(parent.path);
    parentPath = parent.parent_path;
  }
  const menu = route.navigation?.trim();
  // 一级菜单容器已由「侧边栏「…」」表达；菜单字段缺失时退回用祖先导航项名指路。
  const middle = ancestors
    .filter((item) => item.route_type !== "navigation" || !menu)
    .map((item) => item.name);
  const head = menu ? `侧边栏「${menu}」` : "";
  const hint = entryHintOf(route.path);
  if (hint) return [head, ...middle, hint].filter(Boolean).join(" → ");
  if (route.route_type === "detail" && middle.length) {
    return [head, ...middle.slice(0, -1), `从「${middle[middle.length - 1]}」点击进入`]
      .filter(Boolean)
      .join(" → ");
  }
  const tail = route.name && route.name !== menu ? [route.name] : [];
  return [head, ...middle, ...tail].filter(Boolean).join(" → ") || route.name;
}
