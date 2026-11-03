import type { AuthzPermission, FrontendRequirement, FrontendRoute } from "./api";
import { sortRoutes } from "./route-catalog";

const resourceNames: Record<string, string> = {
  "*": "系统权限",
  authz: "权限管理",
  venue: "场地",
  "venue-environment": "场地环境",
  weather: "场地天气",
  event: "事件日志",
  "event-analysis": "事件分析",
  report: "报表",
  "week-report": "周报编辑",
  "miner-agent-monitor": "矿机代理监控",
  "mining-pool": "矿池",
  "asset-hashrate-change": "资产算力变更",
  "asset-pool-record": "资产接管记录",
  "asset-site": "资产场地映射",
  custody: "托管数据",
  "data-summary": "数据概览",
  "hosting-record": "托管记录",
  "machine-failure": "机器上下架表",
  "network-stat": "BTC网络统计",
  "pool-change": "矿池变更",
  "power-consumption": "电费参数",
  settlement: "矿池结算",
  "user-subscription": "用户订阅",
  "client-version": "客户端版本",
  profile: "个人权限",
};

// 「场地列表」页的接口路径（人工确认的归属，与后端 path_pattern 一致）；
// 权限定义导航据此把场地资源拆为 场地列表 / 场地详情 两个入口。
export const VENUE_LIST_PAGE_PATHS = new Set([
  "/venue/createVenue/:venueType",
  "/venue/getSlackInfoByVenueName",
  "/venue/listVenue/:venueType",
  "/venue/updateSlackInfo",
  "/venue/updateVenue",
]);

// 权限定义页左侧功能模块的固定排序；未列出的模块仍按导航顺序排在后面。
const moduleOrder: string[] = [
  "矿池算力",
  "矿池账户",
  "矿池变更",
  "资产算力变更",
  "矿池代理监控",
  "场地",
  "场地环境",
  "场地天气",
  "事件日志",
  "事件分析",
  "报表",
  "周报编辑",
  "托管数据",
  "托管记录",
];

// 旧称/别名归一到固定排序表里的名称。
const moduleOrderAliases: Record<string, string> = {
  矿机代理监控: "矿池代理监控",
  天气: "场地天气",
  事件: "事件日志",
  周报: "周报编辑",
};

export function moduleOrderIndex(name: string): number {
  const index = moduleOrder.indexOf(moduleOrderAliases[name] || name);
  return index === -1 ? Infinity : index;
}

// 固定排序对应的分组标题；未归入分组的模块显示在“其他”下。
const moduleSections: Array<{ title: string; members: string[] }> = [
  {
    title: "矿池",
    members: [
      "矿池算力",
      "矿池账户",
      "矿池变更",
      "资产算力变更",
      "矿池代理监控",
      "资产接管记录",
      "资产场地映射",
      "矿池结算",
    ],
  },
  { title: "场地", members: ["场地", "场地环境", "场地天气", "事件日志", "事件分析"] },
  { title: "报表", members: ["报表", "周报编辑", "机器上下架表", "数据概览"] },
  { title: "托管", members: ["托管数据", "托管记录", "电费参数"] },
  { title: "权限", members: ["权限管理", "系统权限", "个人权限"] },
];

export function moduleSectionOf(name: string): string {
  const normalized = moduleOrderAliases[name] || name;
  return moduleSections.find((section) => section.members.includes(normalized))?.title || "其他";
}

export function resourceName(
  resource: string,
  permissions: Array<Pick<AuthzPermission, "resource" | "name">>,
): string {
  if (resourceNames[resource]) return resourceNames[resource];
  const name =
    permissions.find((item) => item.resource === resource && /[\u4e00-\u9fff]/.test(item.name))?.name || "";
  return (
    name.replace(/^(查看|管理|新增|创建|编辑|修改|更新|删除|导入|导出|下载|查询)/, "") || name || "自定义功能"
  );
}

export interface ResourceNavigation {
  navigation: string;
  order: number;
  navigationOrder: number;
}

export function getResourceNavigation(
  permissions: AuthzPermission[],
  routes: Array<FrontendRoute & { requirements: FrontendRequirement[] }>,
): Map<string, ResourceNavigation> {
  const result = new Map<string, ResourceNavigation>();
  const permissionsByKey = new Map(permissions.map((item) => [item.permission_key, item.resource]));
  const orderedRoutes = sortRoutes(routes);
  const navigationOrders = new Map<string, number>();
  orderedRoutes.forEach((route) => {
    if (route.navigation && !navigationOrders.has(route.navigation))
      navigationOrders.set(route.navigation, route.list_order);
  });
  orderedRoutes.forEach((route) => {
    if (!route.navigation) return;
    (route.requirements || []).forEach((requirement) => {
      const separator = requirement.permission_key.lastIndexOf(":");
      const resource =
        permissionsByKey.get(requirement.permission_key) ||
        (separator > 0 ? requirement.permission_key.slice(0, separator) : "");
      if (resource && !result.has(resource)) {
        result.set(resource, {
          navigation: route.navigation,
          order: route.list_order,
          navigationOrder: navigationOrders.get(route.navigation) ?? route.list_order,
        });
      }
    });
  });
  return result;
}

export function compareResources(
  left: string,
  right: string,
  navigation: Map<string, ResourceNavigation>,
): number {
  const a = navigation.get(left);
  const b = navigation.get(right);
  return (
    (a?.navigationOrder ?? Infinity) - (b?.navigationOrder ?? Infinity) ||
    (a?.navigation || "").localeCompare(b?.navigation || "") ||
    (a?.order ?? Infinity) - (b?.order ?? Infinity) ||
    left.localeCompare(right)
  );
}
