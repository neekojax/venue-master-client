import { fetchGet } from "@/helper/fetchHelper.ts";

export const fetchMiningPoolRunningData = async (poolType: string) => {
  return await fetchGet(`miningPool/listMiningPoolRunningData/${poolType}`);
};