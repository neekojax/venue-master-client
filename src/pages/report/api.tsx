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

// /venue/getAllDailyStat/:venueID"
export const fetchAllDailyStat = async (venueID: number) => {
  return await fetchGet(`/venue/getAllDailyStat/${venueID}`);
};
