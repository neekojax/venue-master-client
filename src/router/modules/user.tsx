import { type RouteObject } from "react-router-dom";
import { ProgressBar } from "@/components/progress-bar";
import { ROUTE_PATHS } from "@/constants/common";

export const userRoute: RouteObject = {
  path: ROUTE_PATHS.user,
  lazy: async () => ({
    Component: (await import("@/pages/user")).default,
  }),
  HydrateFallback: ProgressBar,
  handle: {
    title: "user",
  },
};
