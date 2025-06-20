import { Link, type RouteObject } from "react-router-dom";
import { ProgressBar } from "@/components/progress-bar";
import { ROUTE_PATHS } from "@/constants/common";

export const hashDetailRoute: RouteObject = {
  path: ROUTE_PATHS.hashDetail,
  lazy: async () => ({
    Component: (await import("@/pages/hash-detail")).default,
  }),
  HydrateFallback: ProgressBar,
  handle: {
    title: "基础信息",
    crumb: () => <Link to={ROUTE_PATHS.hashDetail}>算力详情</Link>,
  },
};
