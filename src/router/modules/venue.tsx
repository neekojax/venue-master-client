import { Link, Navigate, type RouteObject } from "react-router-dom";
import { ProgressBar } from "@/components/progress-bar";
import { ROUTE_PATHS } from "@/constants/common";

import { t } from "@/locales";

export const venueRoute: RouteObject = {
  path: ROUTE_PATHS.venue,
  lazy: async () => ({
    Component: (await import("@/pages/venue")).default,
  }),
  HydrateFallback: ProgressBar,
  handle: {
    title: t("场地管理"),
    crumb: () => t("场地管理"),
  },
  children: [
    {
      index: true,
      element: <Navigate replace to={ROUTE_PATHS.venueSetting} />,
    },
    {
      path: ROUTE_PATHS.venueEnvironment,
      lazy: async () => ({
        Component: (await import("@/pages/venue/venue-environment")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: t("场地环境"),
        crumb: () => <Link to={ROUTE_PATHS.miningSiteData}>{t("场地环境")}</Link>,
      },
    },
    {
      path: "/venue/environment/history/:venueId",
      lazy: async () => {
        return {
          Component: (await import("@/pages/venue/venue-environment-history")).default,
        };
      },
      HydrateFallback: ProgressBar,
      handle: {
        title: t("场地环境详情"),
        crumb: (params: { venueId?: string }) => (
          <Link
            to={
              params?.venueId
                ? `/venue/environment/history/${params.venueId}`
                : "/venue/environment/history/0"
            }
          >
            {t("场地环境详情")}
          </Link>
        ),
      },
      // HydrateFallback: ProgressBar,
      // handle: {
      //   title: "场地环境详情",
      //   crumb: () => <Link to={ROUTE_PATHS.venueEnvironmentHistory}>场地环境详情</Link>,
      // },
    },
    {
      path: ROUTE_PATHS.venueWeather,
      lazy: async () => ({
        Component: (await import("@/pages/venue/venue-weather")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: t("场地天气"),
        crumb: () => <Link to={ROUTE_PATHS.miningSiteData}>{t("运行指标")}</Link>,
      },
    },
    {
      path: ROUTE_PATHS.venueBill,
      lazy: async () => ({
        Component: (await import("@/pages/venue/venue-bill")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: t("场地账单"),
        crumb: () => <Link to={ROUTE_PATHS.venueBill}>{t("场地账单")}</Link>,
      },
    },
    {
      path: ROUTE_PATHS.miningSiteData,
      lazy: async () => ({
        Component: (await import("@/pages/venue/venue-running-kpi")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: t("运行指标"),
        crumb: () => <Link to={ROUTE_PATHS.miningSiteData}>{t("运行指标")}</Link>,
      },
    },
    {
      path: ROUTE_PATHS.eventLog,
      lazy: async () => ({
        Component: (await import("@/pages/venue/event-log")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: t("事件日志"),
        crumb: () => <Link to={ROUTE_PATHS.eventLog}>{t("事件日志")}</Link>,
      },
    },
    {
      path: ROUTE_PATHS.eventAnalysis,
      lazy: async () => ({
        Component: (await import("@/pages/venue/event-analysis")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: t("事件分析"),
        crumb: () => <Link to={ROUTE_PATHS.eventAnalysis}>{t("事件分析")}</Link>,
      },
    },

    {
      path: ROUTE_PATHS.venueSetting,
      lazy: async () => ({
        Component: (await import("@/pages/venue/venue-setting")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: t("场地列表"),
        crumb: () => <Link to={ROUTE_PATHS.venueSetting}>{t("场地列表")}</Link>,
      },
    },
    {
      path: "/venue/detail/:venueId", // 直接使用动态参数
      lazy: async () => ({
        Component: (await import("@/pages/venue/venue-detail")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: t("场地详情"),
        crumb: (params: { venueId?: string }) => (
          <Link to={params?.venueId ? ROUTE_PATHS.miningSiteDetail(params.venueId) : "/venue/detail"}>
            {t("场地详情")}
          </Link>
        ),
      },
    },
    {
      path: "/venue/event-log-list/:venueId/:venueName", // 直接使用动态参数
      lazy: async () => ({
        Component: (await import("@/pages/venue/event-log-list")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: t("场地事件日志"),
        crumb: (params: { venueId?: string }) => (
          <Link to={params?.venueId ? ROUTE_PATHS.eventLogList(params.venueId) : "/venue/event-log-list"}>
            {t("场地事件日志")}
          </Link>
        ),
      },
    },
    {
      path: "/venue/weekly-report/:venueId",
      lazy: async () => ({
        Component: (await import("@/pages/venue/venue-weekly-report")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: t("场地运营周报"),
        crumb: (params: { venueId?: string }) => (
          <Link
            to={
              params?.venueId ? ROUTE_PATHS.venueWeeklyReportDetail(params.venueId) : "/venue/weekly-report/0"
            }
          >
            {t("场地运营周报")}
          </Link>
        ),
      },
    },
  ],
};
