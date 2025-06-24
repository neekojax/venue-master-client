import { Link, type RouteObject } from "react-router-dom";
import { ProgressBar } from "@/components/progress-bar";
import { ROUTE_PATHS } from "@/constants/common";

export const custodyMenuRoute: RouteObject = {
  path: ROUTE_PATHS.custodyMenu,
  lazy: async () => ({
    Component: (await import("@/pages/nest-menu")).default,
  }),
  HydrateFallback: ProgressBar,
  handle: {
    title: "电费监控",
    crumb: () => "电费监控",
  },
  children: [
    {
      path: ROUTE_PATHS.setting,
      lazy: async () => ({
        Component: (await import("@/pages/custody-statistics/custody-setting")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: "基础设置",
        crumb: () => <Link to={ROUTE_PATHS.setting}>基础设置</Link>,
      },
    },
    {
      path: ROUTE_PATHS.statistics,
      lazy: async () => ({
        Component: (await import("@/pages/custody-statistics/statistics")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: "信息统计",
        crumb: () => <Link to={ROUTE_PATHS.statistics}>信息统计</Link>,
      },
    },
    {
      path: ROUTE_PATHS.dailyAveragePrice,
      lazy: async () => ({
        Component: (await import("@/pages/custody-statistics/average-price")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: "信息统计",
        crumb: () => <Link to={ROUTE_PATHS.dailyAveragePrice}>BTC每日均价</Link>,
      },
    },
  ],
};
