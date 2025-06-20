import { Link, type RouteObject } from "react-router-dom";
import { ProgressBar } from "@/components/progress-bar";
import { ROUTE_PATHS } from "@/constants/common";

export const baseRoute: RouteObject = {
  path: ROUTE_PATHS.base,
  lazy: async () => ({
    Component: (await import("@/pages/base")).default,
  }),
  HydrateFallback: ProgressBar,
  handle: {
    title: "基础信息",
    crumb: () => <Link to={ROUTE_PATHS.base}>基础信息</Link>,
  },
};
