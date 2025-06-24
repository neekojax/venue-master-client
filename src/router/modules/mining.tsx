import { Link, type RouteObject } from "react-router-dom";
import { ProgressBar } from "@/components/progress-bar";
import { ROUTE_PATHS } from "@/constants/common";

export const miningRoute: RouteObject = {
  path: ROUTE_PATHS.mining,
  lazy: async () => ({
    Component: (await import("@/pages/mining")).default,
  }),
  HydrateFallback: ProgressBar,
  handle: {
    title: "矿池",
    crumb: () => "矿池",
  },
  children: [
    {
      path: ROUTE_PATHS.miningSetting,
      lazy: async () => ({
        Component: (await import("@/pages/mining/setting")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: "矿池列表",
        crumb: () => <Link to={ROUTE_PATHS.miningSetting}>矿池设置</Link>,
      },
    },
    {
      path: ROUTE_PATHS.miningHashRate,
      lazy: async () => ({
        Component: (await import("@/pages/mining/hash")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: "实时算力",
        crumb: () => <Link to={ROUTE_PATHS.miningHashRate}>实时算力</Link>,
      },
    },
    {
      path: ROUTE_PATHS.miningSiteData,
      lazy: async () => ({
        Component: (await import("@/pages/mining/site-data")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: "场地运行数据",
        crumb: () => <Link to={ROUTE_PATHS.miningSiteData}>场地运行数据</Link>,
      },
    },
  ],
};
