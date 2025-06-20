import { type RouteObject } from "react-router-dom";
import { ProgressBar } from "@/components/progress-bar";
import { ROUTE_PATHS } from "@/constants/common";

export const dashboardRoute: RouteObject = {
  path: ROUTE_PATHS.dashboard,
  lazy: async () => ({
    Component: (await import("@/pages/dashboard")).default,
  }),
  HydrateFallback: ProgressBar,
  handle: {
    title: "dashboard",
  },
};
