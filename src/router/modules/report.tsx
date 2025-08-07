import { Link, type RouteObject } from "react-router-dom";
import { ProgressBar } from "@/components/progress-bar";
import { ROUTE_PATHS } from "@/constants/common";

export const reportRoute: RouteObject = {
  path: ROUTE_PATHS.report,
  lazy: async () => ({
    Component: (await import("@/pages/report")).default,
  }),
  HydrateFallback: ProgressBar,
  handle: {
    title: "报表",
    crumb: () => "报表",
  },
  children: [
    {
      path: ROUTE_PATHS.dailyReport,
      lazy: async () => ({
        Component: (await import("@/pages/report/daily-report")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: "运营日报",
        crumb: () => <Link to={ROUTE_PATHS.dailyReport}>运营日报</Link>,
      },
    },
    {
      path: ROUTE_PATHS.subAccountDailyReport,
      lazy: async () => ({
        Component: (await import("@/pages/report/daily-sub-account-report")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: "账户日报",
        crumb: () => <Link to={ROUTE_PATHS.subAccountDailyReport}>账户日报</Link>,
      },
    },
  ],
};
