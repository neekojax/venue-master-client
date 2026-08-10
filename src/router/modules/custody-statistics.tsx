import { Link, Navigate, type RouteObject } from "react-router-dom";
import { ProgressBar } from "@/components/progress-bar";
import { ROUTE_PATHS } from "@/constants/common";

export const custodyMenuRoute: RouteObject = {
  path: ROUTE_PATHS.custodyMenu,
  lazy: async () => ({
    Component: (await import("@/pages/custody-statistics")).default,
  }),
  HydrateFallback: ProgressBar,
  handle: {
    title: "电费监控",
    crumb: () => "电费监控",
  },
  children: [
    {
      index: true,
      element: <Navigate replace to={ROUTE_PATHS.statistics} />,
    },
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
    // {
    //   path: ROUTE_PATHS.statisticsDetail(0),
    //   lazy: async () => ({
    //     Component: (await import("@/pages/custody-statistics/statisticsDetail")).default,
    //   }),
    //   HydrateFallback: ProgressBar,
    //   handle: {
    //     title: "趋势分析",
    //     crumb: () => <Link to={ROUTE_PATHS.statisticsDetail(0)}>趋势分析</Link>,
    //   },
    // },
    {
      path: "/custody-menu/statisticsDetail/:venueId", // 直接使用动态参数
      lazy: async () => ({
        Component: (await import("@/pages/custody-statistics/statisticsDetail")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: "趋势分析",
        crumb: (params: { venueId?: string }) => (
          <Link
            to={
              params?.venueId
                ? ROUTE_PATHS.statisticsDetail(params.venueId)
                : "/custody-menu/statisticsDetail"
            }
          >
            趋势分析
          </Link>
        ),
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
