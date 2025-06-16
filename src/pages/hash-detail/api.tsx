import { fetchGet } from "@/helper/fetchHelper.ts";

export const fetchRealTimeHashRateDetail = async (poolType: string) => {
  return await fetchGet(`miningPool/listBtcMiningPoolRealTimeHashRate/${poolType}`);
};

export const fetchAllHashCompletionRate = async (poolType: string) => {
  return await fetchGet(`miningPool/listAllHashCompletionRate/${poolType}`);
};

export const fetchHashRateHistory = async (poolType: string, beginDate: string, endDate: string) => {
  return await fetchGet(`miningPool/getHashRateHistory/${poolType}/${beginDate}/${endDate}`);
};
