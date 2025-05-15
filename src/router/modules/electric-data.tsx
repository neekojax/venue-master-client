import { Link, type RouteObject } from "react-router-dom";
import { ProgressBar } from "@/components/progress-bar";
import { ROUTE_PATHS } from "@/constants/common";

export const electricMenuRoute: RouteObject = {
  path: ROUTE_PATHS.electric,
  lazy: async () => ({
    Component: (await import("@/pages/electric-data")).default,
  }),
  HydrateFallback: ProgressBar,
  handle: {
    title: "电网数据",
    crumb: () => "电网数据",
  },
  children: [
    {
      path: ROUTE_PATHS.electricLimit,
      lazy: async () => ({
        Component: (await import("@/pages/electric-data/electric-limit")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: "限电记录",
        crumb: () => <Link to={ROUTE_PATHS.electricLimit}>限电记录</Link>,
      },
    },
    {
      path: ROUTE_PATHS.electricAverage,
      lazy: async () => ({
        Component: (await import("@/pages/electric-data/electric-average")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: "平均电价",
        crumb: () => <Link to={ROUTE_PATHS.electricAverage}>平均电价</Link>,
      },
    },
  ],
};
