import { Link, type RouteObject } from "react-router-dom";
import { ProgressBar } from "@/components/progress-bar";
import { ROUTE_PATHS } from "@/constants/common";

export const poolProfitHistoryRoute: RouteObject = {
  path: "/pool-profit/history/:poolName", // 直接使用动态参数
  lazy: async () => ({
    Component: (await import("@/pages/pool-profit-history")).default,
  }),
  HydrateFallback: ProgressBar,
  handle: {
    title: "矿池历史收益",
    crumb: (poolName: any) => <Link to={ROUTE_PATHS.poolProfitHistory(poolName)}>矿池历史收益</Link>,
  },
};
