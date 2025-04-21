import { Link, type RouteObject } from "react-router-dom";
import { ProgressBar } from "@/components/progress-bar";
import { ROUTE_PATHS } from "@/constants/common";

export const userManagerRoute: RouteObject = {
  path: ROUTE_PATHS.userManagement,
  lazy: async () => ({
    Component: (await import("@/pages/user-management")).default,
  }),
  HydrateFallback: ProgressBar,
  handle: {
    title: "资产管理",
    crumb: () => <Link to={ROUTE_PATHS.userManagement}>资产管理</Link>,
  },
};
