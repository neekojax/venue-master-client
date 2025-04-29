import { Link, type RouteObject } from "react-router-dom";
import { ProgressBar } from "@/components/progress-bar";
import { ROUTE_PATHS } from "@/constants/common";

export const nestMenuRoute: RouteObject = {
  path: ROUTE_PATHS.nestMenu,
  lazy: async () => ({
    Component: (await import("@/pages/nest-menu")).default,
  }),
  HydrateFallback: ProgressBar,
  handle: {
    title: "收益管理",
    crumb: () => "收益管理",
  },
  children: [
    {
      path: ROUTE_PATHS.link,
      lazy: async () => ({
        Component: (await import("@/pages/nest-menu/sub-menu-1")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: "观察者链接",
        crumb: () => <Link to={ROUTE_PATHS.link}>观察者链接</Link>,
      },
    },
    {
      path: ROUTE_PATHS.report,
      lazy: async () => ({
        Component: (await import("@/pages/nest-menu/sub-menu-2")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: "收益记录",
        crumb: () => <Link to={ROUTE_PATHS.report}>收益记录</Link>,
      },
    },
  ],
};
