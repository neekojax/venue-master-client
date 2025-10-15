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
export const fetchAllDailyStat = async (poolType: string, venueID: number, start: string, end: string) => {
  return await fetchGet(`/venue/getAllDailyStat/${poolType}/${venueID}/${start}/${end}`);
};

// summary/btc-market-info/
export const fetchBtcMarketInfo = async (date: string) => {
  return await fetchGet(`/summary/btc-market-info/${date}`);
};

// summary/hash-rate-trend/
export const fetchHashRateTrend = async (date: string) => {
  return await fetchGet(`/summary/hash-rate-trend/${date}`);
};

// summary/btc-price/
export const fetchBtcPrice = async (date: string) => {
  return await fetchGet(`/summary/btc-price/${date}`);
};
