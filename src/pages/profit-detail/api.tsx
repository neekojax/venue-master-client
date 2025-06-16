import { fetchGet } from "@/helper/fetchHelper.ts";

export const fetchIncomeStatisticsHistory = async (poolType: string, beginDate: string, endDate: string) => {
  return await fetchGet(`miningPool/getIncomeStatisticsHistory/${poolType}/${beginDate}/${endDate}`);
};
