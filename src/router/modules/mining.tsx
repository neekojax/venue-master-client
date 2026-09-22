import { Link, Navigate, type RouteObject } from "react-router-dom";
import { ProgressBar } from "@/components/progress-bar";
import { ROUTE_PATHS } from "@/constants/common";

import { t } from "@/locales";

export const miningRoute: RouteObject = {
  path: ROUTE_PATHS.mining,
  lazy: async () => ({
    Component: (await import("@/pages/mining")).default,
  }),
  HydrateFallback: ProgressBar,
  handle: {
    title: t("算力监控"),
    crumb: () => t("算力监控"),
  },
  children: [
    {
      index: true,
      element: <Navigate replace to={ROUTE_PATHS.miningHashRate} />,
    },
    {
      path: ROUTE_PATHS.miningHashRate,
      lazy: async () => ({
        Component: (await import("@/pages/mining/hash")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: t("实时算力"),
        crumb: () => <Link to={ROUTE_PATHS.miningHashRate}>{t("实时算力")}</Link>,
      },
    },
    {
      path: ROUTE_PATHS.farmMonitor,
      lazy: async () => ({
        Component: (await import("@/pages/farm-monitor")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: t("矿机监控"),
        crumb: () => <Link to={ROUTE_PATHS.farmMonitor}>{t("矿机监控")}</Link>,
      },
    },
    {
      path: ROUTE_PATHS.faultMonitor,
      lazy: async () => ({
        Component: (await import("@/pages/fault-machine-monitor")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: t("故障机监控"),
        crumb: () => <Link to={ROUTE_PATHS.faultMonitor}>{t("故障机监控")}</Link>,
      },
    },
    {
      path: ROUTE_PATHS.abnormalAnalysis,
      lazy: async () => ({
        Component: (await import("@/pages/abnormal-analysis")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: t("异常数分析"),
        crumb: () => <Link to={ROUTE_PATHS.abnormalAnalysis}>{t("异常数分析")}</Link>,
      },
    },
    {
      path: ROUTE_PATHS.miningSetting,
      lazy: async () => ({
        Component: (await import("@/pages/mining/setting")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: t("账户列表"),
        crumb: () => <Link to={ROUTE_PATHS.miningSetting}>{t("账户列表")}</Link>,
      },
    },
    {
      path: ROUTE_PATHS.miningAgentSetting,
      lazy: async () => ({
        Component: (await import("@/pages/mining/agent-setting")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        name: "miningAgentSetting",
        title: t("矿机代理设置"),
        crumb: () => <Link to={ROUTE_PATHS.miningAgentSetting}>{t("矿机代理设置")}</Link>,
        permission: ROUTE_PATHS.miningAgentSetting,
      },
    },
    {
      path: ROUTE_PATHS.assetHashrateHistory,
      lazy: async () => ({
        Component: (await import("@/pages/mining/asset-hashrate-history")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        name: "assetHashrateHistory",
        title: t("资产变更历史"),
        crumb: () => <Link to={ROUTE_PATHS.assetHashrateHistory}>{t("资产变更历史")}</Link>,
        permission: ROUTE_PATHS.assetHashrateHistory,
      },
    },
    {
      path: "detail/:venueId/:poolId",
      lazy: async () => ({
        Component: (await import("@/pages/mining/detail")).default,
      }),
      HydrateFallback: ProgressBar,
      // handle: {
      // title: "子账户详情",
      // crumb: (params: { venueId?: string, poolId?: string }) => (
      // <Link to={ROUTE_PATHS.miningDetail(venueId, poolId)}>查看详情</Link>
      // <Link to={params?.poolId ? ROUTE_PATHS.miningDetail(params.venueId, params.poolId) : "/venue/detail"}>
      // 子账户详情
      // </Link>
      // ),
      // },
    },
    // {
    //   path: ROUTE_PATHS.miningDetail,
    //   lazy: async () => ({
    //     Component: (await import("@/pages/mining/hash")).default,
    //   }),
    //   HydrateFallback: ProgressBar,
    //   handle: {
    //     title: "实时算力",
    //     crumb: () => <Link to={ROUTE_PATHS.miningHashRate}>实时算力</Link>,
    //   },
    // },
  ],
};
