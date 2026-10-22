import { Link, type RouteObject } from "react-router-dom";
import { ProgressBar } from "@/components/progress-bar";
import { ROUTE_PATHS } from "@/constants/common";

import { t } from "@/locales";

export const hashDetailRoute: RouteObject = {
  path: ROUTE_PATHS.hashDetail,
  lazy: async () => ({
    Component: (await import("@/pages/hash-detail")).default,
  }),
  HydrateFallback: ProgressBar,
  handle: {
    title: t("基础信息"),
    crumb: () => <Link to={ROUTE_PATHS.hashDetail}>{t("算力详情")}</Link>,
  },
};
