import { fetchGet, fetchPost } from "@/helper/fetchHelper.ts";
// import { VenueInfoParam } from "@/pages/venue/type.tsx";
import { ReportUpdateParam } from "@/pages/report/type.tsx";

export const fetchDailyReport = async (poolType: string, date: string) => {
  return await fetchGet(`/report/daily/${poolType}/${date}`);
};

export const fetchSubAccountDailyReport = async (poolType: string, date: string) => {
  return await fetchGet(`/account-report/daily/${poolType}/${date}`);
};

export const updateReport = async (poolType: string, date: string | string[], data: ReportUpdateParam) => {
  return await fetchPost(`/report/daily/update/${poolType}/${date}`, data);
};

/* 周报内容
 * param：poolType：矿机类型，
 * param：start：周日，
 * param：end：周六
 */
export const fetchWeeklyReport = async (poolType: string, start: string, end: string) => {
  return await fetchGet(`/report/weekly/${poolType}/${start}/${end}`);
};

// /venue/getAllDailyStat/:venueID"
export const submitAllDailyStatTask = async (
  poolType: string,
  venueID: number,
  start: string,
  end: string,
) => {
  return await fetchGet(`/venue/getAllDailyStat/${poolType}/${venueID}/${start}/${end}`);
};

export const fetchAllDailyStatTask = async (poolType: string, taskId: string) => {
  return await fetchGet(`/venue/getAllDailyStatTask/${poolType}/${taskId}`);
};

export const fetchAllDailyStatTaskResult = async (poolType: string, taskId: string) => {
  return await fetchGet(`/venue/getAllDailyStatTaskResult/${poolType}/${taskId}`);
};

// 数据看板～相关接口，基础信息
// summary/btc-market-info/
export const fetchBtcMarketInfo = async (date: string) => {
  return await fetchGet(`/summary/btc-market-info/${date}`);
};

// 数据看板～相关接口，算力趋势
// summary/hash-rate-trend/
export const fetchHashRateTrend = async (date: string) => {
  return await fetchGet(`/summary/hash-rate-trend/${date}`);
};

// 数据看板～相关接口，价格趋势
// summary/btc-price/
export const fetchBtcPrice = async (date: string) => {
  return await fetchGet(`/summary/btc-price/${date}`);
};
// 数据看板～相关接口，影响效率统计
// summary/efficiency-stat/:date/:poolType/
export const fetchEfficiencyStat = async (date: string, poolType: string) => {
  return await fetchGet(`/summary/efficiency-stat/${date}/${poolType}`);
};

// 数据看板～相关接口，故障率统计
// summary/machine-stat/:date/:poolType/
export const fetchMachineStat = async (date: string, poolType: string) => {
  return await fetchGet(`/summary/machine-stat/${date}/${poolType}`);
};

// 数据看板～利润
//summary/profit-stat/2025-10-20/CANG
export const fetchProfitStat = async (date: string, poolType: string) => {
  return await fetchGet(`/summary/profit-stat/${date}/${poolType}`);
};

///summary/mtd-profit-stat/2025-10-20/CANG
export const fetchMtdProfitStat = async (date: string, poolType: string) => {
  return await fetchGet(`/summary/mtd-profit-stat/${date}/${poolType}`);
};
//summary/efficiency-machine-stat/2025-10-20/2025-10-20/CANG
export const fetchEfficiencyMachineStat = async (start: string, end: string, poolType: string) => {
  return await fetchGet(`/summary/efficiency-machine-stat/${start}/${end}/${poolType}`);
};

// summary/daily-venue-hosting-stat/:venueType/:date
export const fetchDailyVenueHostingStat = async (date: string, venueType: string) => {
  return await fetchGet(`/summary/daily-venue-hosting-stat/${venueType}/${date}`);
};

// summary/overview/:venueType/:date
export const fetchSummaryOverview = async (date: string, venueType: string) => {
  return await fetchGet(`/summary/overview/${venueType}/${date}`);
};

// /report/week/event/:venueType/:date
// 修改事件原因，时间，进度，跟进情况
export const fetchWeekEvent = async (data: any) => {
  return await fetchPost(`/report/week/event`, data);
};
