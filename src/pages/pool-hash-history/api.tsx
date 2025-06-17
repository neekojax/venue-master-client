import { fetchGet } from "@/helper/fetchHelper.ts";

export const fetchHashRateHistoryByPoolName = async (poolType: string, poolName: string | undefined) => {
  return await fetchGet(`miningPool/getHashRateHistoryByPoolName/${poolType}/${poolName}`);
};