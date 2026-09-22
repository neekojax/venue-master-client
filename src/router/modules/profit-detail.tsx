import { Link, type RouteObject } from "react-router-dom";
import { ProgressBar } from "@/components/progress-bar";
import { ROUTE_PATHS } from "@/constants/common";

import { t } from "@/locales";

export const profitDetailRoute: RouteObject = {
  path: ROUTE_PATHS.profitDetail,
  lazy: async () => ({
    Component: (await import("@/pages/profit-detail")).default,
  }),
  HydrateFallback: ProgressBar,
  handle: {
    title: t("基础信息"),
    crumb: () => <Link to={ROUTE_PATHS.profitDetail}>{t("BTC效益详情")}</Link>,
  },
};
