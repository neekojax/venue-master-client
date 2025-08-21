export const ROUTE_PATHS = {
  login: "/login",
  user: "/user", // 用户中心～修改密码
  notFound: "/not-found",
  landing: "/index",
  // base: "/base",
  userManagement: "/user-management",
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
  // miningSettingDetail: "/mining/setting/detail",
  miningDetail: (venueId: string | number, poolId: string | number) => `/mining/detail/${venueId}/${poolId}`, // 子账户详情，需传参数
  miningHashRate: "/mining/hash",

  venue: "/venue",
  miningSiteData: "/venue/running-kpi",
  miningSiteDetail: (venueId: string | number) => `/venue/detail/${venueId}`, // 场地详情，需传参数
  eventLog: "/venue/event-log",
  venueSetting: "/venue/setting",

  hashDetail: "/hash-detail",
  profitDetail: "/profit-detail",

  report: "/report",
  dailyReport: "/report/daily",
  subAccountDailyReport: "/report/daily/sub-account", // 子账户日报表

  poolProfitHistory: (poolName: any) => `/pool-profit/history/${encodeURIComponent(poolName)}`, // 定义为函数以接收 poolName
  poolHashHistory: (poolName: any) => `/pool-hash/history/${encodeURIComponent(poolName)}`,
};
