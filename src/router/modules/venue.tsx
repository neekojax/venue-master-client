import { Link, type RouteObject } from "react-router-dom";
import { ProgressBar } from "@/components/progress-bar";
import { ROUTE_PATHS } from "@/constants/common";

export const venueRoute: RouteObject = {
  path: ROUTE_PATHS.venue,
  lazy: async () => ({
    Component: (await import("@/pages/venue")).default,
  }),
  HydrateFallback: ProgressBar,
  handle: {
    title: "场地管理",
    crumb: () => <Link to={ROUTE_PATHS.venue}>场地管理</Link>,
  },
};
