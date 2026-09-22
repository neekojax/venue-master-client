import { Link, Navigate, type RouteObject } from "react-router-dom";
import { ProgressBar } from "@/components/progress-bar";
import { ROUTE_PATHS } from "@/constants/common";

import { t } from "@/locales";

export const reportRoute: RouteObject = {
  path: ROUTE_PATHS.report,
  lazy: async () => ({
    Component: (await import("@/pages/report")).default,
  }),
  HydrateFallback: ProgressBar,
  handle: {
    title: t("报表"),
    crumb: () => t("报表"),
  },
  children: [
    {
      path: ROUTE_PATHS.dailySnapshot,
      lazy: async () => ({ Component: (await import("@/pages/report/daily-snapshot")).default }),
      HydrateFallback: ProgressBar,
      handle: { title: t("运营日报快照"), crumb: () => t("运营日报快照") },
    },
    {
      index: true,
      element: <Navigate replace to={ROUTE_PATHS.weekReport} />,
    },
    {
      path: ROUTE_PATHS.dataSummary,
      lazy: async () => ({
        Component: (await import("@/pages/report/data-summary")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: t("数据概览"),
        crumb: () => <Link to={ROUTE_PATHS.dataSummary}>{t("数据概览")}</Link>,
      },
    },
    {
      path: ROUTE_PATHS.dataSummaryList,
      lazy: async () => ({
        Component: (await import("@/pages/report/data-summary-list/index.tsx")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: t("数据概览详情"),
        crumb: () => <Link to={ROUTE_PATHS.dataSummaryList}>{t("数据概览详情")}</Link>,
      },
    },
    {
      path: ROUTE_PATHS.dataSummaryProfitList,
      lazy: async () => ({
        Component: (await import("@/pages/report/data-summary-profit-list/index.tsx")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: t("数据概览利润详情"),
        crumb: () => <Link to={ROUTE_PATHS.dataSummaryProfitList}>{t("数据概览利润详情")}</Link>,
      },
    },
    {
      path: ROUTE_PATHS.dailyReport,
      lazy: async () => ({
        Component: (await import("@/pages/report/daily-report")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: t("运营日报"),
        crumb: () => <Link to={ROUTE_PATHS.dailyReport}>{t("运营日报")}</Link>,
      },
    },
    {
      path: ROUTE_PATHS.subAccountDailyReport,
      lazy: async () => ({
        Component: (await import("@/pages/report/daily-sub-account-report")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: t("账户日报"),
        crumb: () => <Link to={ROUTE_PATHS.subAccountDailyReport}>{t("账户日报")}</Link>,
      },
    },
    {
      path: ROUTE_PATHS.weekReport,
      lazy: async () => ({
        Component: (await import("@/pages/report/week-report/index.tsx")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: t("运营周报"),
        crumb: () => <Link to={ROUTE_PATHS.weekReport}>{t("运营周报")}</Link>,
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
