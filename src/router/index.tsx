import { createBrowserRouter, Navigate, type RouteObject } from "react-router-dom";
import { ProgressBar } from "@/components/progress-bar";
import { baseRoute } from "./modules/base";
import { dashboardRoute } from "./modules/dashboard";
import { landingRoute } from "./modules/landing";
import { nestMenuRoute } from "./modules/nest-menu";
import { ROUTE_PATHS } from "@/constants/common";
import { custodyMenuRoute } from "@/router/modules/custody-statistics.tsx";
import { electricMenuRoute } from "@/router/modules/electric-data.tsx";
import { hashDetailRoute } from "@/router/modules/hash-detail.tsx";
import { miningRoute } from "@/router/modules/mining.tsx";
import { poolHashHistoryRoute } from "@/router/modules/pool-hash-history.tsx";
import { poolProfitHistoryRoute } from "@/router/modules/pool-profit-history.tsx";
import { profitDetailRoute } from "@/router/modules/profit-detail.tsx";
import { venueRoute } from "@/router/modules/venue.tsx";

const routes: RouteObject[] = [
  {
    path: ROUTE_PATHS.login,
    lazy: async () => ({
      Component: (await import("@/pages/login")).default,
    }),
    HydrateFallback: ProgressBar,
  },
  {
    path: "/",
    lazy: async () => ({
      Component: (await import("@/layouts")).default,
    }),
    HydrateFallback: ProgressBar,
    children: [
      {
        index: true,
        element: <Navigate replace to={ROUTE_PATHS.landing} />,
      },

      miningRoute,
      landingRoute,
      dashboardRoute,
      venueRoute,
      baseRoute,
      hashDetailRoute,
      profitDetailRoute,
      poolProfitHistoryRoute,
      poolHashHistoryRoute,
      custodyMenuRoute,
      electricMenuRoute,
      nestMenuRoute,
    ],
  },
  {
    path: "*",
    lazy: async () => ({
      Component: (await import("@/pages/not-found")).default,
    }),
    HydrateFallback: ProgressBar,
  },
];

export const router = createBrowserRouter(routes, {
  basename: import.meta.env.VITE_APP_BASE_URL,
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  },
});
