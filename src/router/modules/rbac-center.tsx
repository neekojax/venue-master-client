import { Link, type RouteObject } from "react-router-dom";
import { ProgressBar } from "@/components/progress-bar";
import { ROUTE_PATHS } from "@/constants/common";

import { t } from "@/locales";

export const rbacCenterRoute: RouteObject = {
  path: ROUTE_PATHS.rbacCenter,
  lazy: async () => ({
    Component: (await import("@/pages/rbac-center")).default,
  }),
  HydrateFallback: ProgressBar,
  handle: {
    title: t("权限管理"),
    crumb: () => <Link to={ROUTE_PATHS.rbacCenter}>{t("权限管理")}</Link>,
  },
};
