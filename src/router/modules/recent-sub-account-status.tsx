import { Link, type RouteObject } from "react-router-dom";
import { ProgressBar } from "@/components/progress-bar";
import { ROUTE_PATHS } from "@/constants/common";

export const recentSubAccountStatusRoute: RouteObject = {
  path: "/recent-sub-account-status/:venueType/:poolId",
  lazy: async () => ({
    Component: (await import("@/pages/mining/recent-sub-account-status")).default,
  }),
  HydrateFallback: ProgressBar,
  handle: {
    title: "历史状态",
    crumb: () => <Link to={ROUTE_PATHS.miningHashRate}>历史状态</Link>,
  },
};
