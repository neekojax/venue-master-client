import { fetchGet } from "@/helper/fetchHelper.ts";

export const fetchDailyReport = async (poolType: string, date: string) => {
  return await fetchGet(`/report/daily/${poolType}/${date}`);
};
