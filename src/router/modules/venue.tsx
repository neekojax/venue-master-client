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
    crumb: () => "场地管理",
  },
  children: [
    {
      path: ROUTE_PATHS.miningSiteData,
      lazy: async () => ({
        Component: (await import("@/pages/venue/venue-running-kpi")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: "运行指标",
        crumb: () => <Link to={ROUTE_PATHS.miningSiteData}>运行指标</Link>,
      },
    },
    {
      path: ROUTE_PATHS.eventLog,
      lazy: async () => ({
        Component: (await import("@/pages/venue/event-log")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: "事件日志",
        crumb: () => <Link to={ROUTE_PATHS.eventLog}>事件日志</Link>,
      },
    },
    {
      path: ROUTE_PATHS.venueSetting,
      lazy: async () => ({
        Component: (await import("@/pages/venue/venue-setting")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: "场地设置",
        crumb: () => <Link to={ROUTE_PATHS.venueSetting}>场地设置</Link>,
      },
    },
    {
      path: "/venue/detail/:venueId", // 直接使用动态参数
      lazy: async () => ({
        Component: (await import("@/pages/venue/venue-detail")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: "场地详情",
        crumb: (params: { venueId?: string }) => (
          <Link to={params?.venueId ? ROUTE_PATHS.miningSiteDetail(params.venueId) : "/venue/detail"}>
            场地详情
          </Link>
        ),
      },
    },
  ],
};
