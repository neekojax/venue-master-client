export const ROUTE_PATHS = {
  login: "/login",
  notFound: "/not-found",
  landing: "/landing",
  base: "/base",
  userManagement: "/user-management",
  nestMenu: "/nest-menu",
  link: "/nest-menu/sub-link",
  report: "/nest-menu/sub-report",
  echartsDemo: "/echarts-demo",
  custodyMenu: "/custody-menu",
  setting: "/custody-menu/setting",
  statistics: "/custody-menu/statistics",
  dashboard: "/dashboard",
  dailyAveragePrice: "/custody-menu/price",
  electric: "/electric",
  electricLimit: "/electric/limit",
  electricAverage: "/electric/average",
  electricBasic: "/electric/basic",

  mining: "/mining",
  miningSetting: "/mining/setting",
  miningHashRate: "/mining/hash",

  venue: "/venue",
  miningSiteData: "/venue/running-kpi",

  hashDetail: "/hash-detail",
  profitDetail: "/profit-detail",

  poolProfitHistory: (poolName: any) => `/pool-profit/history/${encodeURIComponent(poolName)}`, // 定义为函数以接收 poolName
  poolHashHistory: (poolName: any) => `/pool-hash/history/${encodeURIComponent(poolName)}`,
};
