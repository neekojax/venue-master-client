import { Link, Outlet, type RouteObject } from "react-router-dom";
import { ProgressBar } from "@/components/progress-bar";
import { ROUTE_PATHS } from "@/constants/common";

export const logsRoute: RouteObject = {
  path: ROUTE_PATHS.logs,
  element: <Outlet />,
  HydrateFallback: ProgressBar,
  handle: {
    title: "用户操作日志",
    crumb: () => <Link to={ROUTE_PATHS.logs}>用户操作日志</Link>,
  },
  children: [
    {
      index: true,
      lazy: async () => ({
        Component: (await import("@/pages/ops-logs/list")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: "操作日志",
        crumb: () => <Link to={ROUTE_PATHS.logs}>操作日志</Link>,
      },
    },
    {
      path: "detail/:id",
      lazy: async () => ({
        Component: (await import("@/pages/ops-logs/detail")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: "操作日志详情",
        crumb: () => <>操作日志详情</>,
      },
    },
  ],
};
