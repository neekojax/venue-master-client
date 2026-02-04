import { type RouteObject } from "react-router-dom";
import { ProgressBar } from "@/components/progress-bar";
import { ROUTE_PATHS } from "@/constants/common";

export const utilityRoute: RouteObject = {
  path: ROUTE_PATHS.utility,
  lazy: async () => ({
    Component: (await import("@/pages/utility")).default,
  }),
  HydrateFallback: ProgressBar,
  handle: {
    title: "实用工具",
  },
};
