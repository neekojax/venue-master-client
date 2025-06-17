import { fetchGet } from "@/helper/fetchHelper.ts";

export const fetchPoolProfitHistory = async (poolType: string, poolName: string) => {
  return await fetchGet(`miningPool/getIncomeStatisticsHistoryByPoolName/${poolType}/${poolName}`);
};