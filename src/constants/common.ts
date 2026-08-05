export const ROUTE_PATHS = {
  login: "/login",
  user: "/user", // 用户中心～修改密码
  userManagement: "/user-management",
  notFound: "/not-found",
  landing: "/index",
  logs: "/ops_logs",
  logsDetail: (id: string | number) => `/ops_logs/detail/${id}`,
  rbacCenter: "/rbac-center",
  echartsDemo: "/echarts-demo",
  pieChartDemo: "/pie-chart-demo",
  custodyMenu: "/custody-menu",
  setting: "/custody-menu/setting",
  statistics: "/custody-menu/statistics",
  statisticsDetail: (venueId: string | number) => `/custody-menu/statisticsDetail/${venueId}`,
  // miningSiteDetail: (venueId: string | number) => `/venue/detail/${venueId}`, // 场地详情，需传参数
  dashboard: "/dashboard",
  dailyAveragePrice: "/custody-menu/price",
  electric: "/electric",
  electricLimit: "/electric/limit",
  electricAverage: "/electric/average",
  electricBasic: "/electric/basic",
  utility: "/utility",

  mining: "/mining",
  miningSetting: "/mining/setting",
  // miningSettingDetail: "/mining/setting/detail",
  miningDetail: (venueId: string | number, poolId: string | number) => `/mining/detail/${venueId}/${poolId}`, // 子账户详情，需传参数
  recentSubAccountStatus: (venueType: string | number, poolId: string | number) =>
    `/recent-sub-account-status/${venueType}/${poolId}`,
  miningHashRate: "/mining/hash",

  farmMonitor: "/mining/farm-monitor",
  miningAgentSetting: "/mining/agent-setting",
  faultMonitor: "/mining/fault-monitor",
  abnormalAnalysis: "/mining/abnormal-analysis",

  venue: "/venue",
  miningSiteData: "/venue/running-kpi",
  venueEnvironment: "/venue/environment",
  venueEnvironmentHistory: (venueId: string | number) => `/venue/environment/history/${venueId}`,
  venueWeather: "/venue/weather",
  venueBill: "/venue/bill",
  miningSiteDetail: (venueId: string | number) => `/venue/detail/${venueId}`, // 场地详情，需传参数
  venueWeeklyReportDetail: (venueId: string | number) => `/venue/weekly-report/${venueId}`,
  eventLog: "/venue/event-log",
  eventAnalysis: "/venue/event-analysis",
  eventLogList: (venueId: string | number) => `/venue/event-loglist/${venueId}`, // 场地详情，需传参数
  venueSetting: "/venue/setting",

  hashDetail: "/hash-detail",
  profitDetail: "/profit-detail",

  report: "/report",
  dailyReport: "/report/daily",
  dataSummary: "/report/data-summary", // 数据概览
  dataSummaryList: "/report/data-summary/list", // 数据概览更多界面
  dataSummaryProfitList: "/report/data-summary/profit-list", // 数据概览更多界面
  dailyReportList: (venueId: string | number) => `/report/daily-list/${venueId}`, // 场地详情，需传参数
  subAccountDailyReport: "/report/daily/sub-account", // 子账户日报表
  weekReport: "/report/week", // 子账户日报表

  poolProfitHistory: (poolName: any) => `/pool-profit/history/${encodeURIComponent(poolName)}`, // 定义为函数以接收 poolName
  poolHashHistory: (poolName: any) => `/pool-hash/history/${encodeURIComponent(poolName)}`,
};

export const COOKIE_DOMAIN = import.meta.env.VITE_COOKIE_DOMAIN || ".test.com";
