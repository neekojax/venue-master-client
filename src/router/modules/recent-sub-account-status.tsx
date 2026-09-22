import { Link, type RouteObject } from "react-router-dom";
import { ProgressBar } from "@/components/progress-bar";
import { ROUTE_PATHS } from "@/constants/common";

import { t } from "@/locales";

export const recentSubAccountStatusRoute: RouteObject = {
  path: "/recent-sub-account-status/:venueType/:poolId",
  lazy: async () => ({
    Component: (await import("@/pages/mining/recent-sub-account-status")).default,
  }),
  HydrateFallback: ProgressBar,
  handle: {
    title: t("历史状态"),
    crumb: () => <Link to={ROUTE_PATHS.miningHashRate}>{t("历史状态")}</Link>,
  },
};
