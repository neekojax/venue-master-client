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
    {
      path: "/report/daily-list/:venueId/:venueName", // 直接使用动态参数
      lazy: async () => ({
        Component: (await import("@/pages/report/daily-report-list")).default,
      }),
      HydrateFallback: ProgressBar,
      // handle: {
      //   title: "场地日报",
      //   crumb: (params: { venueId?: string }) => (
      //     <Link to={params?.venueId ? ROUTE_PATHS.dailyReportList(params.venueId) : "/venue/daily-list"}>
      //       场地详情
      //     </Link>
      //   ),
      // },
      // handle: {
      //   title: "场地日报",
      //   crumb: () => <Link to={ROUTE_PATHS.dailyReportList}>场地日报</Link>,
      // },
    },
  ],
};
