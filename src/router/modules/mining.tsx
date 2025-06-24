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
    title: "算力监控",
    crumb: () => "算力监控",
  },
  children: [
    {
      path: ROUTE_PATHS.miningSetting,
      lazy: async () => ({
        Component: (await import("@/pages/mining/setting")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: "矿池设置",
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
  ],
};
