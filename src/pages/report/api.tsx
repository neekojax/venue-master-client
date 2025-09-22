import { fetchGet, fetchPost } from "@/helper/fetchHelper.ts";
// import { VenueInfoParam } from "@/pages/venue/type.tsx";
import { ReportUpdateParam } from "@/pages/report/type.tsx";

export const fetchDailyReport = async (poolType: string, date: string) => {
  return await fetchGet(`/report/daily/${poolType}/${date}`);
};
// 账户列表
export const fetchSubAccountDailyReport = async (poolType: string, date: string) => {
  return await fetchGet(`/account-report/daily/${poolType}/${date}`);
};

export const updateReport = async (poolType: string, date: string, data: ReportUpdateParam) => {
  return await fetchPost(`/report/daily/update/${poolType}/${date}`, data);
};

///venue/getAllDailystat
export const fetchAllDailyStat = async (poolType: string, venueID: number) => {
  return await fetchGet(`/venue/getAllDailyStat/${poolType}/${venueID}`);
};

/* 周报内容
 * param：poolType：矿机类型，
 * param：start：周日，
 * param：end：周六
 */
export const fetchWeeklyReport = async (poolType: string, start: string, end: string) => {
  return await fetchGet(`/report/weekly/${poolType}/${start}/${end}`);
};
