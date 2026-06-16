import { Link, type RouteObject } from "react-router-dom";
import { ProgressBar } from "@/components/progress-bar";
import { ROUTE_PATHS } from "@/constants/common";

export const miningRoute: RouteObject = {
  path: ROUTE_PATHS.mining,
  lazy: async () => ({
    Component: (await import("@/pages/mining")).default,
  }),
  HydrateFallback: ProgressBar,
  handle: {
    title: "算力监控",
    crumb: () => "算力监控",
  },
  children: [
    {
      path: ROUTE_PATHS.miningHashRate,
      lazy: async () => ({
        Component: (await import("@/pages/mining/hash")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: "实时算力",
        crumb: () => <Link to={ROUTE_PATHS.miningHashRate}>实时算力</Link>,
      },
    },
    {
      path: ROUTE_PATHS.farmMonitor,
      lazy: async () => ({
        Component: (await import("@/pages/farm-monitor")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: "矿机监控",
        crumb: () => <Link to={ROUTE_PATHS.farmMonitor}>矿机监控</Link>,
      },
    },
    {
      path: ROUTE_PATHS.faultMonitor,
      lazy: async () => ({
        Component: (await import("@/pages/fault-machine-monitor")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: "故障机监控",
        crumb: () => <Link to={ROUTE_PATHS.faultMonitor}>故障机监控</Link>,
      },
    },
    {
      path: ROUTE_PATHS.miningSetting,
      lazy: async () => ({
        Component: (await import("@/pages/mining/setting")).default,
      }),
      HydrateFallback: ProgressBar,
      handle: {
        title: "账户列表",
        crumb: () => <Link to={ROUTE_PATHS.miningSetting}>账户列表</Link>,
      },
    },
    {
      path: "detail/:venueId/:poolId",
      lazy: async () => ({
        Component: (await import("@/pages/mining/detail")).default,
      }),
      HydrateFallback: ProgressBar,
      // handle: {
      // title: "子账户详情",
      // crumb: (params: { venueId?: string, poolId?: string }) => (
      // <Link to={ROUTE_PATHS.miningDetail(venueId, poolId)}>查看详情</Link>
      // <Link to={params?.poolId ? ROUTE_PATHS.miningDetail(params.venueId, params.poolId) : "/venue/detail"}>
      // 子账户详情
      // </Link>
      // ),
      // },
    },
    // {
    //   path: ROUTE_PATHS.miningDetail,
    //   lazy: async () => ({
    //     Component: (await import("@/pages/mining/hash")).default,
    //   }),
    //   HydrateFallback: ProgressBar,
    //   handle: {
    //     title: "实时算力",
    //     crumb: () => <Link to={ROUTE_PATHS.miningHashRate}>实时算力</Link>,
    //   },
    // },
  ],
};
